// ============================================================
// CALCULATE COMPETITION BLOCKS
// Recebe dados do plano de prep e devolve blocos calculados
// (Off-season → Cutting A/B/C → Pré-Peak → Peak Week)
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────
interface CalcInput {
  plan_id?: string; // se passado, atualiza o plano no banco
  data_competicao: string; // ISO date
  peso_atual: number;
  peso_alvo_palco: number;
  bf_atual?: number;
  altura?: number;
  protocolo_farmacologico?: string;
  federacao?: string;
  categoria?: string;
}

interface Bloco {
  nome: string;
  tipo: "offseason" | "cutting" | "pre_peak" | "peak_week";
  cor: string;
  icone: string;
  semana_inicio: number;
  semana_fim: number;
  duracao: number;
  objetivo: string;
  sistema_treino?: string;
  volume?: string;
  intensidade?: string;
  frequencia?: string;
  cardio?: string;
  deload?: string;
  calorias_multiplicador?: number;
  deficit_pct?: number;
  proteina_gkg?: number;
  gordura_pct?: number;
  refeed?: string;
  taxa_perda_alvo?: number;
  tecnicas?: string[];
  farma_ajuste?: string[];
  posing_min_dia?: number;
  posing_foco?: string;
  exames?: string[];
  semana_a_semana?: Record<string, string>;
  protocolo_diario?: Record<string, unknown>;
}

// ────────────────────────────────────────────────
// CÁLCULO
// ────────────────────────────────────────────────
function calcularBlocos(dados: CalcInput) {
  const {
    data_competicao,
    peso_atual,
    peso_alvo_palco,
    protocolo_farmacologico = "",
  } = dados;

  const hoje = new Date();
  const competicao = new Date(data_competicao);
  const semanas_totais = Math.max(
    1,
    Math.floor((competicao.getTime() - hoje.getTime()) / (7 * 24 * 60 * 60 * 1000)),
  );

  const perda_necessaria = Math.max(0, peso_atual - peso_alvo_palco);

  const tem_anabolico =
    /testosterona|nandrolona|trembolona|deca|npp|sustanon|primobolan|masteron|winstrol/i.test(
      protocolo_farmacologico,
    );
  const taxa_perda_semana = tem_anabolico ? 0.7 : 0.55; // % do peso/semana

  const perda_semanal_kg = (peso_atual * taxa_perda_semana) / 100;
  const semanas_cutting_brutas =
    perda_necessaria > 0 ? Math.ceil(perda_necessaria / perda_semanal_kg) : 0;

  // Garantir Pré-Peak (4 sem) + Peak Week (1 sem) = 5 semanas
  const semanas_finais = 5;
  const semanas_disponiveis = Math.max(0, semanas_totais - semanas_finais);

  const semanas_cutting = Math.min(semanas_cutting_brutas, semanas_disponiveis);
  const semanas_offseason = Math.max(0, semanas_disponiveis - semanas_cutting);

  const blocos: Bloco[] = [];
  let semana_inicio = 1;

  // ─── OFF-SEASON ──────────────────────────
  if (semanas_offseason >= 4) {
    const dur_acumulacao = Math.max(1, Math.floor(semanas_offseason * 0.4));
    blocos.push({
      nome: "Acumulação",
      tipo: "offseason",
      cor: "#4ade80",
      icone: "📈",
      semana_inicio,
      semana_fim: semana_inicio + dur_acumulacao - 1,
      duracao: dur_acumulacao,
      objetivo: "Volume máximo — ganho de massa magra",
      sistema_treino: "DUP + RP Volume",
      volume: "MAV → MRV progressivo",
      intensidade: "Moderada (RIR 2-3)",
      frequencia: "6 dias/semana",
      cardio: "4x AEJ 60min (manter)",
      deload: "A cada 4 semanas",
      calorias_multiplicador: 1.1,
      proteina_gkg: 3.2,
      gordura_pct: 0.28,
      tecnicas: [
        "German Volume Training semanas 1-4",
        "Especialização Quadríceps",
        "Pre-exhaust vasto lateral",
        "BFR finalizador pernas",
      ],
      posing_min_dia: 15,
      posing_foco: "Aprender poses básicas",
      exames: ["Hemograma", "Hormônios", "Função hepática", "Lipídios"],
    });
    semana_inicio += dur_acumulacao;

    const dur_forca = Math.max(1, Math.floor(semanas_offseason * 0.3));
    blocos.push({
      nome: "Força Base",
      tipo: "offseason",
      cor: "#f59e0b",
      icone: "💪",
      semana_inicio,
      semana_fim: semana_inicio + dur_forca - 1,
      duracao: dur_forca,
      objetivo: "Converter volume em força e densidade",
      sistema_treino: "5/3/1 + Acessório",
      volume: "MAV estável",
      intensidade: "Alta (RIR 1-2)",
      frequencia: "5-6 dias/semana",
      cardio: "4x AEJ 45min",
      deload: "Semana 4 de cada ciclo 5/3/1",
      calorias_multiplicador: 1.08,
      proteina_gkg: 3.0,
      gordura_pct: 0.28,
      tecnicas: [
        "5/3/1 nos compostos principais",
        "AMRAP no último set",
        "Wave loading acessório",
        "Contrast training (PAP)",
      ],
      posing_min_dia: 20,
      posing_foco: "Refinar poses + memorizar",
      exames: ["ALT/AST", "Hematócrito", "Pressão arterial"],
    });
    semana_inicio += dur_forca;

    const dur_transmutacao = semanas_offseason - dur_acumulacao - dur_forca;
    if (dur_transmutacao > 0) {
      blocos.push({
        nome: "Transmutação",
        tipo: "offseason",
        cor: "#8b5cf6",
        icone: "⚡",
        semana_inicio,
        semana_fim: semana_inicio + dur_transmutacao - 1,
        duracao: dur_transmutacao,
        objetivo: "Maximizar força relativa e densidade",
        sistema_treino: "Conjugada Modificada",
        volume: "MRV → início redução",
        intensidade: "Muito alta (RIR 0-1)",
        frequencia: "5 dias/semana",
        cardio: "4x AEJ 45min + 2x LISS",
        deload: "Semana 4",
        calorias_multiplicador: 1.05,
        proteina_gkg: 3.2,
        gordura_pct: 0.27,
        tecnicas: [
          "Super Compensation Protocol",
          "Doggcrapp nas últimas 2 semanas",
          "Extreme stretching",
          "BFR alta frequência",
        ],
        posing_min_dia: 25,
        posing_foco: "Praticar com música + timing",
        exames: ["Hemograma completo", "Hormônios", "Função hepática"],
      });
      semana_inicio += dur_transmutacao;
    }
  } else if (semanas_offseason > 0) {
    // Off-season curto: apenas um bloco de acumulação
    blocos.push({
      nome: "Mini Off-Season",
      tipo: "offseason",
      cor: "#4ade80",
      icone: "📈",
      semana_inicio,
      semana_fim: semana_inicio + semanas_offseason - 1,
      duracao: semanas_offseason,
      objetivo: "Estabilização e ganho leve antes do cutting",
      sistema_treino: "DUP",
      volume: "MAV",
      intensidade: "Moderada (RIR 2)",
      frequencia: "5-6 dias/semana",
      cardio: "3x AEJ 45min",
      calorias_multiplicador: 1.05,
      proteina_gkg: 3.0,
      gordura_pct: 0.28,
      posing_min_dia: 15,
      posing_foco: "Aprender poses básicas",
    });
    semana_inicio += semanas_offseason;
  }

  // ─── CUTTING ──────────────────────────────
  if (semanas_cutting > 0) {
    const dur_cutting_a = Math.max(1, Math.floor(semanas_cutting * 0.4));
    blocos.push({
      nome: "Cutting A — Déficit Moderado",
      tipo: "cutting",
      cor: "#ef4444",
      icone: "🔥",
      semana_inicio,
      semana_fim: semana_inicio + dur_cutting_a - 1,
      duracao: dur_cutting_a,
      objetivo: "Iniciar déficit mantendo performance",
      sistema_treino: "DUP Modificado (volume reduzido)",
      volume: "MAV → -15%",
      intensidade: "Alta (RIR 1-2)",
      frequencia: "5-6 dias/semana",
      cardio: "4x AEJ 60min + 2x LISS 45min",
      deload: "Semana 4",
      deficit_pct: 0.2,
      proteina_gkg: 3.2,
      gordura_pct: 0.25,
      refeed: "Nenhum semanas 1-3, 1 refeição livre da semana 4+",
      taxa_perda_alvo: 0.6,
      farma_ajuste: [
        "Testosterona reduzir para 350mg",
        "Adicionar Masteron Enantato 300mg",
        "NPP manter 200mg",
        "Hemogenin: OFF",
      ],
      posing_min_dia: 30,
      posing_foco: "Praticar 2x dia — manhã e noite",
      exames: ["ALT/AST", "Hormônios", "Lipídios"],
    });
    semana_inicio += dur_cutting_a;

    const dur_cutting_b = Math.max(1, Math.floor(semanas_cutting * 0.35));
    blocos.push({
      nome: "Cutting B — Déficit Progressivo",
      tipo: "cutting",
      cor: "#dc2626",
      icone: "🎯",
      semana_inicio,
      semana_fim: semana_inicio + dur_cutting_b - 1,
      duracao: dur_cutting_b,
      objetivo: "Acelerar perda mantendo massa magra",
      sistema_treino: "Volume Reduzido + Intensidade",
      volume: "MEV + 20%",
      intensidade: "Alta (RIR 1)",
      frequencia: "5 dias/semana",
      cardio: "5x AEJ 60min + 3x LISS 45min",
      deload: "Semana 3 e 6",
      deficit_pct: 0.25,
      proteina_gkg: 3.4,
      gordura_pct: 0.22,
      refeed: "1 refeed day/semana (dia de treino pesado)",
      taxa_perda_alvo: 0.7,
      farma_ajuste: [
        "Testosterona 300mg",
        "Masteron 400mg",
        "Adicionar Winstrol 50mg/dia",
        "T3 25mcg/dia iniciar semana 3",
      ],
      posing_min_dia: 30,
      posing_foco: "Posing com personal + gravar vídeos",
      exames: ["ALT/AST semanal", "T3/T4", "Pressão arterial"],
    });
    semana_inicio += dur_cutting_b;

    const dur_cutting_c =
      semanas_cutting - dur_cutting_a - dur_cutting_b;
    if (dur_cutting_c > 0) {
      blocos.push({
        nome: "Cutting C — Final",
        tipo: "cutting",
        cor: "#b91c1c",
        icone: "⚔️",
        semana_inicio,
        semana_fim: semana_inicio + dur_cutting_c - 1,
        duracao: dur_cutting_c,
        objetivo: "Máxima definição — últimas semanas",
        sistema_treino: "Pump Training + Manutenção Muscular",
        volume: "MEV",
        intensidade: "Moderada-alta (RIR 2)",
        frequencia: "5 dias/semana",
        cardio: "6x AEJ 45min + 3x LISS 30min",
        deload: "Semana 2 antes da peak week",
        deficit_pct: 0.3,
        proteina_gkg: 3.5,
        gordura_pct: 0.2,
        refeed: "2 refeed days/semana",
        taxa_perda_alvo: 0.8,
        farma_ajuste: [
          "Testosterona última aplicação semana -3",
          "Masteron manter até o dia",
          "Winstrol manter até o dia",
          "T3 parar semana -2",
        ],
        posing_min_dia: 45,
        posing_foco: "Posing com música + simulação de palco",
        exames: ["Hemograma completo", "Função renal/hepática"],
      });
      semana_inicio += dur_cutting_c;
    }
  }

  // ─── PRÉ-PEAK (4 semanas) ─────────────────
  blocos.push({
    nome: "Pré-Peak",
    tipo: "pre_peak",
    cor: "#f97316",
    icone: "🏆",
    semana_inicio,
    semana_fim: semana_inicio + 3,
    duracao: 4,
    objetivo: "Afinar e preparar para peak week",
    sistema_treino: "Pump Training Específico",
    volume: "MEV — apenas manutenção",
    intensidade: "Moderada (RIR 3)",
    frequencia: "5 dias/semana",
    cardio: "5x LISS 30min",
    deficit_pct: 0.1,
    proteina_gkg: 3.0,
    gordura_pct: 0.2,
    posing_min_dia: 60,
    posing_foco: "Simulação de competição diária",
    semana_a_semana: {
      semana_4: "Déficit leve, sódio controlado, treino normal",
      semana_3: "Monitorar retenção hídrica, sódio baixo",
      semana_2: "Iniciar depleção de glicogênio",
      semana_1: "PEAK WEEK — protocolo específico",
    },
  });
  semana_inicio += 4;

  // ─── PEAK WEEK ─────────────────────────────
  blocos.push({
    nome: "Peak Week",
    tipo: "peak_week",
    cor: "#eab308",
    icone: "🥇",
    semana_inicio,
    semana_fim: semana_inicio,
    duracao: 1,
    objetivo: "Máxima apresentação no palco",
    protocolo_diario: {
      dia_7: {
        label: "Segunda — Depleção Total",
        treino: "Full body depleção (15-20 reps, baixo peso)",
        cho_g: 50, proteina_g: 350, gordura_g: 60,
        agua_ml: 6000, sodio: "Normal", cardio: "30min LISS leve",
      },
      dia_6: {
        label: "Terça — Depleção Total",
        treino: "Full body depleção novamente",
        cho_g: 50, proteina_g: 350, gordura_g: 60,
        agua_ml: 5000, sodio: "Reduzindo", cardio: "20min LISS",
      },
      dia_5: {
        label: "Quarta — Início Carbo Loading",
        treino: "Leve — apenas pump",
        cho_g: 400, proteina_g: 300, gordura_g: 40,
        agua_ml: 4000, sodio: "Baixo", cardio: "Sem cardio",
      },
      dia_4: {
        label: "Quinta — Carbo Loading Máximo",
        treino: "Leve pump",
        cho_g: 500, proteina_g: 300, gordura_g: 30,
        agua_ml: 3500, sodio: "Muito baixo", cardio: "Sem cardio",
      },
      dia_3: {
        label: "Sexta — Manutenção",
        treino: "Sem treino pesado",
        cho_g: 400, proteina_g: 280, gordura_g: 40,
        agua_ml: 2500, sodio: "Mínimo", cardio: "Sem cardio",
      },
      dia_2: {
        label: "Sábado — Afinar",
        treino: "Sem treino",
        cho_g: 300, proteina_g: 260, gordura_g: 50,
        agua_ml: 1500, sodio: "Zero", cardio: "Sem cardio",
        diuretico: "Conforme prescrição médica",
      },
      dia_1: {
        label: "Domingo — Véspera",
        treino: "Sem treino",
        cho_g: 150, proteina_g: 200, gordura_g: 40,
        agua_ml: 750, sodio: "Zero absoluto",
        observacao: "Dormir cedo — última refeição 3h antes de dormir",
      },
      dia_0: {
        label: "DIA DA COMPETIÇÃO",
        protocolo: [
          { horario: "-3h", acao: "Refeição 1", descricao: "80g CHO limpo + 40g proteína + zero gordura + 200ml água" },
          { horario: "-1h", acao: "Refeição backstage", descricao: "40g CHO simples (mel/arroz) + 30g whey + zero gordura" },
          { horario: "-30min", acao: "Pump backstage", descricao: "30g dextrose ou mel + 1 copo vinho tinto seco (vasodilatação)" },
          { horario: "-15min", acao: "Exercícios de pump", descricao: "Flexões 3×15 + Rosca elástico 3×20 + Lateral raise 3×20 + Extensão tríceps 3×15" },
        ],
      },
    },
  });

  return {
    semanas_totais,
    semanas_offseason,
    semanas_cutting,
    perda_necessaria,
    taxa_perda_semana,
    tem_anabolico,
    perda_semanal_kg,
    blocos,
    peso_esperado_inicio_cutting: peso_atual,
    peso_esperado_palco: peso_alvo_palco,
  };
}

// ────────────────────────────────────────────────
// HANDLER
// ────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Body
    const body = (await req.json()) as CalcInput;

    // Validação básica
    if (!body.data_competicao || !body.peso_atual || !body.peso_alvo_palco) {
      return new Response(
        JSON.stringify({
          error:
            "Campos obrigatórios: data_competicao, peso_atual, peso_alvo_palco",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (body.peso_atual <= 0 || body.peso_alvo_palco <= 0) {
      return new Response(JSON.stringify({ error: "Pesos devem ser positivos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resultado = calcularBlocos(body);

    // Se plan_id, persistir no plano (RLS valida que o coach é dono)
    if (body.plan_id) {
      const { error: updErr } = await supabase
        .from("competition_plans")
        .update({
          blocos: resultado.blocos,
          calculo_meta: {
            semanas_totais: resultado.semanas_totais,
            semanas_offseason: resultado.semanas_offseason,
            semanas_cutting: resultado.semanas_cutting,
            perda_necessaria: resultado.perda_necessaria,
            taxa_perda_semana: resultado.taxa_perda_semana,
            tem_anabolico: resultado.tem_anabolico,
            perda_semanal_kg: resultado.perda_semanal_kg,
          },
          bloco_atual: resultado.blocos[0]?.nome ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.plan_id);

      if (updErr) {
        console.error("Update error:", updErr);
        return new Response(
          JSON.stringify({ error: "Falha ao salvar no plano", detail: updErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("calculate-competition-blocks error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
