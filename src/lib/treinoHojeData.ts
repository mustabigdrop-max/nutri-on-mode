/**
 * "TREINO DE HOJE" — sincroniza com o TrainingON e devolve exatamente a sessão
 * que está na tela de exercícios do dia (mesmo protocolo, mesmo dia da semana).
 *
 * Nada é inventado: séries, cargas, tempo e metas só aparecem quando existem
 * no protocolo real do usuário. Campo sem dado fica vazio e o slide se adapta.
 */

import { supabase } from "@/integrations/supabase/client";
import { parseProtocolToDays, type ParsedDay } from "@/lib/parseProtocolMarkdown";
import { duracaoSlide } from "@/lib/socialDuracao";

export type TreinoHojeSet = { label?: string; detail: string };
export type TreinoHojeExercicio = {
  nome: string;
  alvo?: string;
  tempo?: string;
  sets: TreinoHojeSet[];
  notas?: string;
};

export type TreinoHoje = {
  /** Nome da sessão como aparece no TrainingON. */
  nomeTreino: string;
  duracao: string;
  grupos: string[];
  /** Grupo/horário agendado para hoje em workout_schedule (quando existe). */
  agenda?: { tipo?: string; horario?: string; duracaoMin?: number };
  aquecimento: TreinoHojeExercicio[];
  exercicios: TreinoHojeExercicio[];
  /** true quando a sessão bateu com o agendamento de hoje. */
  sincronizado: boolean;
  diaSemana: string;
  dataLabel: string;
  nutricao?: {
    metaDiaKcal?: number;
    treinoTipo?: string;
    proteinaG?: number;
    carboG?: number;
  };
};

const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const TERMOS_POR_TIPO: Record<string, string[]> = {
  pull: ["costas", "dorsal", "dorsais", "biceps", "trapezio"],
  push: ["peito", "peitoral", "triceps", "ombro", "ombros", "deltoide"],
  legs: ["pernas", "quadriceps", "posterior", "gluteo", "gluteos", "panturrilha"],
  upper: ["costas", "dorsal", "peito", "peitoral", "ombro", "bracos"],
  lower: ["pernas", "quadriceps", "posterior", "gluteo", "panturrilha"],
};

const ehCardio = (tipo: string | null) => /cardio|liss|z2|hiit|aerob/i.test(tipo || "");

const mapExercicio = (e: {
  name: string;
  muscle_target?: string;
  tempo?: string;
  sets: { label?: string; detail: string }[];
  notes?: string;
}): TreinoHojeExercicio => ({
  nome: e.name,
  alvo: e.muscle_target,
  tempo: e.tempo,
  sets: (e.sets || []).map((s) => ({ label: s.label, detail: s.detail })).filter((s) => !!s.detail),
  notas: e.notes,
});

type AgendaRow = {
  day_of_week: number;
  workout_type: string | null;
  workout_time: string | null;
  duration_minutes: number | null;
  slot: number | null;
};

const dataSaoPaulo = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const valor = (tipo: string) => parts.find((p) => p.type === tipo)?.value || "";
  const data = `${valor("year")}-${valor("month")}-${valor("day")}`;
  const meioDiaUtc = new Date(`${data}T12:00:00Z`);
  return { data, dow: meioDiaUtc.getUTCDay(), date: meioDiaUtc };
};

/**
 * Escolhe o dia do protocolo que corresponde ao treino agendado para hoje.
 *
 * Quando o mesmo tipo (ex.: pull) aparece duas vezes na semana, a ordem importa:
 * o primeiro pull da semana usa o primeiro dia compatível do protocolo, o
 * segundo pull usa o segundo dia compatível. Sem isso, quarta e sábado
 * mostrariam a mesma sessão (ou a sessão errada).
 */
function escolherDia(
  dias: ParsedDay[],
  tipoAgenda: string | undefined,
  indiceNaSemana: number,
  ocorrenciaDoTipo: number,
): { dia: ParsedDay; sincronizado: boolean } | null {
  const alvo = norm(tipoAgenda || "");
  if (alvo) {
    const chave = Object.keys(TERMOS_POR_TIPO).find((tipo) => alvo.includes(tipo));
    const termos = chave
      ? TERMOS_POR_TIPO[chave]
      : alvo.split(/[^a-z]+/).filter((t) => t.length > 3);
    const candidatos = dias
      .map((d) => {
        const texto = norm(`${d.session_title} ${(d.muscle_tags || []).join(" ")}`);
        return { dia: d, score: termos.filter((t) => texto.includes(t)).length };
      })
      .filter((c) => c.score > 0);
    if (candidatos.length) {
      const melhorScore = Math.max(...candidatos.map((c) => c.score));
      // Só desempata por ordem entre dias igualmente compatíveis.
      const topo = candidatos.filter((c) => c.score === melhorScore);
      const escolhido = topo[Math.min(Math.max(ocorrenciaDoTipo, 0), topo.length - 1)];
      return { dia: escolhido.dia, sincronizado: true };
    }
  }

  // D1/D2/D3 representam a ordem real das sessões agendadas na semana.
  // Nunca volta silenciosamente ao D1, pois isso exibe o treino do dia anterior.
  const diaDaPosicao = dias[indiceNaSemana];
  return diaDaPosicao ? { dia: diaDaPosicao, sincronizado: true } : null;
}

export type ProtocoloOpcao = { id: string; nome: string; criadoEm: string };

/**
 * Protocolo escolhido pelo coach. O mais recente do banco pode ser de outro
 * aluno, então a escolha fica salva e vale em todas as telas.
 */
const PREF_PROTOCOLO = "nutrion:treino-protocolo";

export function getProtocoloPreferido(): string | null {
  try {
    return localStorage.getItem(PREF_PROTOCOLO);
  } catch {
    return null;
  }
}

export function setProtocoloPreferido(id: string) {
  try {
    localStorage.setItem(PREF_PROTOCOLO, id);
  } catch {
    /* storage indisponível */
  }
}

/** Lista os protocolos do usuário para escolher qual sincronizar. */
export async function listarProtocolosTreino(): Promise<ProtocoloOpcao[]> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return [];
  const { data } = await supabase
    .from("training_protocols")
    .select("id, client_name, phase, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(15);
  return (data || []).map((p) => ({
    id: p.id as string,
    nome: (p.client_name as string) || (p.phase as string) || "Protocolo",
    criadoEm: p.created_at as string,
  }));
}


/**
 * Lê o treino de hoje do TrainingON do próprio usuário autenticado.
 * Retorna null quando não há protocolo estruturado.
 */
export async function getTreinoDeHoje(protocoloId?: string): Promise<TreinoHoje | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return null;

  const hojeLocal = dataSaoPaulo();
  const dow = hojeLocal.dow;

  const idEscolhido = protocoloId || getProtocoloPreferido() || undefined;
  const buscarProtocolo = async (id?: string) => {
    let q = supabase.from("training_protocols").select("protocol_text").eq("user_id", uid);
    q = id ? q.eq("id", id) : q.order("created_at", { ascending: false }).limit(1);
    const { data } = await q.maybeSingle();
    return data;
  };

  const [protoEscolhido, { data: agendaRows }] = await Promise.all([
    buscarProtocolo(idEscolhido),
    supabase
      .from("workout_schedule")
      .select("day_of_week, workout_type, workout_time, duration_minutes, slot")
      .eq("user_id", uid)
      .order("day_of_week", { ascending: true })
      .order("slot", { ascending: true }),
  ]);

  // Protocolo salvo pode ter sido apagado: cai para o mais recente do usuário.
  const proto = protoEscolhido || (idEscolhido ? await buscarProtocolo() : null);
  const parsed = proto?.protocol_text ? parseProtocolToDays(proto.protocol_text as unknown) : null;
  const dias = (parsed?.days || []).filter((d) => Array.isArray(d.exercises) && d.exercises.length > 0);
  if (!dias.length) return null;

  const agenda = (agendaRows || []) as AgendaRow[];
  const agendaDoDia = agenda.filter((row) => row.day_of_week === dow);
  // O post enfatiza musculação: uma sessão de cardio do mesmo dia nunca deve
  // deslocar Pull/Push/Legs nem selecionar a sessão de outro dia do protocolo.
  const agendaHoje = agendaDoDia.find((row) => !ehCardio(row.workout_type)) || agendaDoDia[0];
  if (!agendaHoje) return null;

  const agendaMusculacao = agenda.filter((row) => !ehCardio(row.workout_type));
  const ordemSemana = (d: number) => (d + 6) % 7;
  const diasAgendados = Array.from(new Set(agendaMusculacao.map((row) => row.day_of_week)))
    .sort((a, b) => ordemSemana(a) - ordemSemana(b));
  const indiceNaSemana = diasAgendados.indexOf(dow);

  // Quantas vezes esse mesmo tipo de treino já apareceu antes de hoje na semana.
  const tipoHoje = norm(agendaHoje.workout_type || "");
  const ocorrenciaDoTipo = Array.from(
    new Set(
      agendaMusculacao
        .filter((row) => norm(row.workout_type || "") === tipoHoje)
        .map((row) => row.day_of_week),
    ),
  )
    .sort((a, b) => ordemSemana(a) - ordemSemana(b))
    .indexOf(dow);

  const selecionado = escolherDia(
    dias,
    agendaHoje.workout_type || undefined,
    indiceNaSemana,
    ocorrenciaDoTipo,
  );

  if (!selecionado) return null;
  const { dia, sincronizado } = selecionado;

  const hoje = hojeLocal.data;
  const { data: nutri } = await supabase
    .from("daily_nutrition_protocol")
    .select("calorias_meta, treino_tipo, proteina_meta, carb_meta")
    .eq("user_id", uid)
    .eq("data", hoje)
    .maybeSingle();

  return {
    nomeTreino: dia.session_title,
    duracao: duracaoSlide(dia.estimated_duration),
    grupos: dia.muscle_tags || [],
    agenda: agendaHoje
      ? {
          tipo: agendaHoje.workout_type || undefined,
          horario: (agendaHoje.workout_time || "").slice(0, 5) || undefined,
          duracaoMin: agendaHoje.duration_minutes ?? undefined,
        }
      : undefined,
    aquecimento: (dia.warmup || []).slice(0, 4).map(mapExercicio),
    exercicios: (dia.exercises || []).slice(0, 6).map(mapExercicio),
    sincronizado,
    diaSemana: DIAS[dow],
    dataLabel: hojeLocal.date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      timeZone: "UTC",
    }),
    nutricao:
      nutri && (nutri.calorias_meta || nutri.treino_tipo)
        ? {
            metaDiaKcal: nutri.calorias_meta ?? undefined,
            treinoTipo: nutri.treino_tipo ?? undefined,
            proteinaG: nutri.proteina_meta ?? undefined,
            carboG: nutri.carb_meta ?? undefined,
          }
        : undefined,
  };
}
