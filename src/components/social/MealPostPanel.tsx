import { useEffect, useState } from "react";
import { Copy, Check, Loader2, ImagePlus, X, Download, Image as ImageIcon } from "lucide-react";
import { compressImageFile } from "@/lib/socialMediaFrames";
import { getTreinoDeHoje, type TreinoHoje } from "@/lib/treinoHojeData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cleanCaption } from "@/lib/captionText";
import { renderMealPhotoOverlay, loadImageFromUrl, type MealOverlayFormat } from "@/lib/mealPhotoOverlay";

import {
  getDadosRefeicao,
  getDadosDeRegistro,
  getRefeicoesRegistradasHoje,
  type DadosRefeicao,
  type RefeicaoRegistrada,
} from "@/lib/refeicaoData";

/**
 * "POSTAR REFEIÇÃO" — pega a refeição REAL do dia (registro do NutriPlan ou o
 * plano do dia), o contexto do treino/NutrySync e devolve legendas prontas por
 * estilo e estratégias de stories. Nada é inventado: sem dado real, o texto sai
 * sem número.
 */

const C = {
  bg: "#020205",
  card: "#0d0d16",
  elevated: "#12121e",
  cyan: "#00D4FF",
  cyanDim: "rgba(0,212,255,0.08)",
  gold: "#B8922A",
  text: "#e8e8ec",
  textMid: "#a0a0b0",
  textDim: "#5a5a6a",
  green: "#22c55e",
  greenDim: "rgba(34,197,94,0.10)",
  border: "rgba(255,255,255,0.06)",
};

const mono = "'JetBrains Mono', 'Space Mono', monospace";

const ESTILOS = [
  { id: "direto", label: "DIRETO", icon: "→", desc: "Sem enrolação. Macro, refeição, próximo.", brief: "direto e curto: o prato, os macros reais e uma frase de posicionamento" },
  { id: "ciencia", label: "CIÊNCIA", icon: "🧬", desc: "Mecanismo real do alimento que educa e posiciona.", brief: "educativo científico usando só o mecanismo e o nutriente que vieram nos dados curados" },
  { id: "mce", label: "MCE", icon: "🔥", desc: "Mentalidade, comportamento e execução.", brief: "voz de processo e disciplina, amarrando o prato ao Método MCE (MENTALIDADE, COMPORTAMENTO, EXECUÇÃO)" },
  { id: "educativo", label: "EDUCATIVO", icon: "📚", desc: "Ensina o seguidor a montar o próprio prato.", brief: "passo a passo prático pra pessoa montar um prato parecido, com porções por medida visual" },
  { id: "ponto_fraco", label: "TREINO DO DIA", icon: "🎯", desc: "Conecta a refeição com o treino de hoje.", brief: "conecta a refeição ao treino real do dia e ao ajuste calórico do NutrySync" },
] as const;

const PASSOS = [
  "Você registra a refeição no NutriPlan (já faz isso).",
  "Aqui o sistema puxa os alimentos, macros, treino do dia e o ajuste do dia.",
  "Escolhe o estilo: Direto, Ciência, MCE, Educativo ou Treino do Dia.",
  "Recebe até 3 opções de legenda pronta pra copiar.",
  "Na aba Stories, escolhe foto única ou sequência, com layout e interação sugeridos.",
  "Cola no Instagram e posta.",
];

type LegendaOpcao = { texto?: string; hashtags?: string[] };
type EstrategiaStory = { nome?: string; slides?: number; desc?: string; layout?: string; cta?: string };
type TipoStory = { tipo?: string; estrategias?: EstrategiaStory[] };

const boxStyle: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 14,
};

export default function MealPostPanel({ handle }: { handle?: string }) {
  const [dados, setDados] = useState<DadosRefeicao | null>(null);
  const [registros, setRegistros] = useState<RefeicaoRegistrada[]>([]);
  const [registroId, setRegistroId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<"legendas" | "stories">("legendas");
  const [estilo, setEstilo] = useState<string>(ESTILOS[0].id);
  const [legendas, setLegendas] = useState<LegendaOpcao[]>([]);
  const [tipos, setTipos] = useState<TipoStory[]>([]);
  const [tipoAtivo, setTipoAtivo] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [previa, setPrevia] = useState<{ url: string; nome: string; formato: MealOverlayFormat } | null>(null);


  const [treino, setTreino] = useState<TreinoHoje | null>(null);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      try {
        const [doPlano, logs, sessao] = await Promise.all([
          getDadosRefeicao(),
          getRefeicoesRegistradasHoje(),
          getTreinoDeHoje().catch(() => null),
        ]);
        setTreino(sessao);
        setRegistros(logs);
        const igual = doPlano ? logs.find((l) => l.slotKey === doPlano.slotKey) : logs[0];
        if (igual) {
          setRegistroId(igual.id);
          setDados(await getDadosDeRegistro(igual));
        } else {
          setDados(doPlano);
        }
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const trocarFonte = async (r: RefeicaoRegistrada | null) => {
    setCarregando(true);
    try {
      setRegistroId(r?.id ?? null);
      setDados(r ? await getDadosDeRegistro(r) : await getDadosRefeicao());
      setLegendas([]);
      setTipos([]);
    } finally {
      setCarregando(false);
    }
  };

  const copiar = (id: string, texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const baixar = (url: string, nome: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
  };

  /** Grava o texto escolhido NA FOTO do prato, no formato de feed ou de stories. */
  const gravarNaFoto = async (
    formato: MealOverlayFormat,
    conteudo: { titulo?: string; texto: string },
    nomeArquivo: string,
  ) => {
    const img = foto ? await loadImageFromUrl(foto) : null;
    if (foto && !img) { toast.error("Não consegui usar essa foto."); return; }
    const url = renderMealPhotoOverlay({
      format: formato,
      photo: img,
      eyebrow: [dados?.tag, dados?.horario].filter(Boolean).join(" · ") || undefined,
      titulo: conteudo.titulo,
      texto: conteudo.texto,
      dados:
        [
          dados?.calorias ? `${Math.round(dados.calorias)} kcal` : null,
          dados?.macros.proteina ? `${Math.round(dados.macros.proteina)}g PTN` : null,
          dados?.macros.carbo ? `${Math.round(dados.macros.carbo)}g CHO` : null,
          dados?.macros.gordura ? `${Math.round(dados.macros.gordura)}g FAT` : null,
        ]
          .filter(Boolean)
          .join(" · ") || undefined,

      handle,
    });
    if (!url) { toast.error("Não consegui montar a imagem."); return; }
    setPrevia({ url, nome: nomeArquivo, formato });
    if (!foto) toast.info("Adicione a foto do prato para o texto sair sobre a imagem.");
  };


  /** Minutos entre o horário da refeição e o horário real do treino agendado. */
  const emMinutos = (h?: string) => {
    const m = /^(\d{1,2}):(\d{2})/.exec((h || "").trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  const horarioTreino = treino?.agenda?.horario || dados?.treinoHoje?.horario;
  const minRefeicao = emMinutos(dados?.horario);
  const minTreino = emMinutos(horarioTreino);
  const diffMin = minRefeicao !== null && minTreino !== null ? minTreino - minRefeicao : null;
  const janelaTreino =
    diffMin === null
      ? null
      : {
          minutos: Math.abs(diffMin),
          posicao: diffMin >= 0 ? ("pre" as const) : ("pos" as const),
          refeicaoHorario: dados?.horario,
          treinoHorario: horarioTreino,
        };

  const treinoPayload = treino
    ? {
        nomeTreino: treino.nomeTreino,
        duracao: treino.duracao,
        grupos: treino.grupos,
        agenda: treino.agenda,
        sincronizado: treino.sincronizado,
        diaSemana: treino.diaSemana,
        nutricao: treino.nutricao,
        exercicios: treino.exercicios.slice(0, 8).map((ex) => ({ nome: ex.nome, alvo: ex.alvo })),
      }
    : undefined;

  const gerarLegendas = async () => {
    if (!dados) return;
    const e = ESTILOS.find((s) => s.id === estilo);
    setLoading("legendas");
    try {
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: {
          mode: "meal_post_caption",
          topic: dados.nome,
          handle,
          refeicaoData: dados,
          estiloId: e?.id,
          estiloBrief: e?.brief,
          treinoDetalhado: treinoPayload,
          janelaTreino,
        },
      });
      if (error) throw error;
      const result = (data as { result?: { legendas?: LegendaOpcao[] } })?.result || {};
      setLegendas(
        (result.legendas || []).map((l) => ({ texto: cleanCaption(l.texto), hashtags: l.hashtags || [] })),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não consegui gerar as legendas agora.");
    } finally {
      setLoading(null);
    }
  };

  const gerarStories = async () => {
    if (!dados) return;
    setLoading("stories");
    try {
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: { mode: "meal_story_plan", topic: dados.nome, handle, refeicaoData: dados, treinoDetalhado: treinoPayload, janelaTreino },
      });
      if (error) throw error;
      const result = (data as { result?: { tipos?: TipoStory[] } })?.result || {};
      setTipos(result.tipos || []);
      setTipoAtivo(0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não consegui montar os stories agora.");
    } finally {
      setLoading(null);
    }
  };

  const macros = [
    { label: "KCAL", valor: dados?.calorias ? String(Math.round(dados.calorias)) : null, cor: C.text },
    { label: "PTN", valor: dados?.macros.proteina ? `${Math.round(dados.macros.proteina)}g` : null, cor: C.green },
    { label: "CHO", valor: dados?.macros.carbo ? `${Math.round(dados.macros.carbo)}g` : null, cor: C.cyan },
    { label: "FAT", valor: dados?.macros.gordura ? `${Math.round(dados.macros.gordura)}g` : null, cor: C.gold },
  ].filter((m) => m.valor);

  const contexto = [
    dados?.tag,
    dados?.treinoHoje?.tipo ? `Treino: ${dados.treinoHoje.tipo}` : null,
    dados?.nutrisync?.meta ? `Meta do dia: ${dados.nutrisync.meta} kcal` : null,
    dados?.nutrisync?.ajusteTreino ? `Ajuste do treino: +${dados.nutrisync.ajusteTreino} kcal` : null,
    dados?.nutrisync?.restante ? `Restante: ${dados.nutrisync.restante} kcal` : null,
  ].filter(Boolean) as string[];

  return (
    <div style={{ background: C.bg, color: C.text, display: "grid", gap: 12 }}>
      <div>
        <p style={{ fontFamily: mono, fontSize: 9, color: C.green, letterSpacing: 2, margin: 0 }}>
          SOCIAL ON · POSTAR REFEIÇÃO
        </p>
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: "2px 0 0" }}>Refeição real → post pronto</h3>
      </div>

      {/* Refeição vinda do registro / plano */}
      <div style={boxStyle}>
        {carregando && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMid, margin: 0 }}>
            <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> Puxando a refeição do seu dia…
          </p>
        )}

        {!carregando && !dados && (
          <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6, margin: 0 }}>
            Não encontrei refeição registrada nem plano para este horário. Registre a refeição no NutriPlan para o
            post sair com os números reais do prato.
          </p>
        )}

        {!!registros.length && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {registros.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => trocarFonte(r)}
                style={{
                  padding: "5px 9px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 10,
                  fontFamily: mono,
                  background: registroId === r.id ? C.greenDim : "transparent",
                  border: `1px solid ${registroId === r.id ? C.green : C.border}`,
                  color: registroId === r.id ? C.green : C.textDim,
                }}
              >
                {r.nome} · {r.horario}
                {r.calorias ? ` · ${Math.round(r.calorias)} kcal` : ""}
              </button>
            ))}
            <button
              type="button"
              onClick={() => trocarFonte(null)}
              style={{
                padding: "5px 9px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 10,
                fontFamily: mono,
                background: registroId === null ? C.greenDim : "transparent",
                border: `1px solid ${registroId === null ? C.green : C.border}`,
                color: registroId === null ? C.green : C.textDim,
              }}
            >
              Usar o plano
            </button>
          </div>
        )}

        {dados && (
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{dados.nome}</p>
              <p style={{ fontFamily: mono, fontSize: 10, color: C.textDim, margin: "2px 0 0" }}>
                {dados.horario}
                {dados.tag ? ` · ${dados.tag}` : ""}
              </p>
            </div>

            {!!dados.alimentos.length && (
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 3 }}>
                {dados.alimentos.map((a) => (
                  <li key={a.nome} style={{ fontSize: 11, color: C.textMid }}>
                    • {a.nome}
                    {a.porcao ? ` — ${a.porcao}` : ""}
                  </li>
                ))}
              </ul>
            )}

            {!!macros.length && (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${macros.length}, 1fr)`, gap: 6 }}>
                {macros.map((m) => (
                  <div key={m.label} style={{ background: C.elevated, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                    <p style={{ fontFamily: mono, fontSize: 8, color: C.textDim, letterSpacing: 1, margin: 0 }}>{m.label}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: m.cor, margin: "2px 0 0" }}>{m.valor}</p>
                  </div>
                ))}
              </div>
            )}

            {!!contexto.length && (
              <p style={{ fontFamily: mono, fontSize: 9, color: C.cyan, lineHeight: 1.7, margin: 0 }}>
                {contexto.join(" · ")}
              </p>
            )}

            {!!dados.ciencia.length && (
              <p style={{ fontFamily: mono, fontSize: 9, color: C.textDim, margin: 0 }}>
                Ciência disponível: {dados.ciencia.map((c) => c.alimento).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Foto do prato */}
      <div style={boxStyle}>
        <p style={{ fontFamily: mono, fontSize: 9, color: C.gold, letterSpacing: 1, margin: 0 }}>FOTO DO PRATO</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          {foto && (
            <img
              src={foto}
              alt="Foto da refeição escolhida para o post"
              style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }}
            />
          )}
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 12px",
              borderRadius: 8,
              cursor: "pointer",
              background: C.cyanDim,
              border: `1px solid ${C.cyan}`,
              color: C.cyan,
              fontFamily: mono,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            <ImagePlus style={{ width: 12, height: 12 }} />
            {foto ? "TROCAR FOTO" : "ADICIONAR FOTO"}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                const url = await compressImageFile(file);
                if (!url) { toast.error("Não consegui ler essa imagem."); return; }
                setFoto(url);
              }}
            />
          </label>
          {foto && (
            <button
              type="button"
              onClick={() => setFoto(null)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 12px",
                borderRadius: 8,
                cursor: "pointer",
                background: "transparent",
                border: `1px solid ${C.border}`,
                color: C.textDim,
                fontFamily: mono,
                fontSize: 10,
              }}
            >
              <X style={{ width: 12, height: 12 }} /> REMOVER
            </button>
          )}
        </div>
        <p style={{ fontSize: 11, color: C.textMid, margin: "8px 0 0", lineHeight: 1.6 }}>
          A foto fica aqui do lado da legenda pra você postar as duas juntas.
        </p>
      </div>

      {/* Abas */}
      <div style={{ display: "flex", gap: 6 }}>
        {([["legendas", "LEGENDAS"], ["stories", "STORIES"]] as const).map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setAba(v)}
            style={{
              flex: 1,
              padding: 10,
              cursor: "pointer",
              borderRadius: 8,
              fontFamily: mono,
              fontSize: 11,
              fontWeight: 600,
              background: aba === v ? C.elevated : "transparent",
              border: `1px solid ${aba === v ? C.green : C.border}`,
              color: aba === v ? C.green : C.textDim,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {aba === "legendas" && (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
            {ESTILOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setEstilo(s.id); setLegendas([]); }}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  borderRadius: 8,
                  fontFamily: mono,
                  fontSize: 10,
                  background: estilo === s.id ? C.greenDim : C.card,
                  border: `1px solid ${estilo === s.id ? C.green : C.border}`,
                  color: estilo === s.id ? C.green : C.textDim,
                }}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 11, color: C.textMid, margin: 0 }}>
            {ESTILOS.find((s) => s.id === estilo)?.desc}
          </p>

          {estilo === "ponto_fraco" && (
            <div style={boxStyle}>
              <p style={{ fontFamily: mono, fontSize: 9, color: C.cyan, letterSpacing: 1, margin: 0 }}>
                TREINO DE HOJE · TRAININGON
              </p>
              {!treino && (
                <p style={{ fontSize: 11, color: C.textMid, lineHeight: 1.6, margin: "8px 0 0" }}>
                  Não encontrei sessão de treino para hoje no TrainingON. A legenda sai falando da refeição, sem citar
                  treino.
                </p>
              )}
              {treino && (
                <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{treino.nomeTreino}</p>
                  <p style={{ fontFamily: mono, fontSize: 10, color: C.textDim, margin: 0 }}>
                    {[treino.diaSemana, treino.duracao, treino.grupos.join(" · "), horarioTreino ? `Treino ${horarioTreino}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {!!treino.exercicios.length && (
                    <p style={{ fontSize: 11, color: C.textMid, lineHeight: 1.6, margin: 0 }}>
                      {treino.exercicios.slice(0, 5).map((ex) => ex.nome).join(", ")}
                    </p>
                  )}
                  {janelaTreino && (
                    <p style={{ fontFamily: mono, fontSize: 10, color: C.green, margin: 0 }}>
                      {janelaTreino.posicao === "pre"
                        ? `Refeição ${janelaTreino.minutos} min ANTES do treino`
                        : `Refeição ${janelaTreino.minutos} min DEPOIS do treino`}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={gerarLegendas}
            disabled={!dados || !!loading}
            style={{
              padding: 12,
              borderRadius: 8,
              cursor: !dados || loading ? "not-allowed" : "pointer",
              background: C.cyanDim,
              border: `1px solid ${C.cyan}`,
              color: C.cyan,
              fontFamily: mono,
              fontSize: 11,
              fontWeight: 700,
              opacity: !dados || loading ? 0.5 : 1,
            }}
          >
            {loading === "legendas" ? "GERANDO..." : "GERAR LEGENDAS →"}
          </button>

          {legendas.map((cap, i) => {
            const completo = [cap.texto, (cap.hashtags || []).join(" ")].filter(Boolean).join("\n\n");
            const id = `cap-${i}`;
            return (
              <div key={id} style={boxStyle}>
                {legendas.length > 1 && (
                  <p style={{ fontFamily: mono, fontSize: 9, color: C.green, letterSpacing: 1, margin: "0 0 6px" }}>
                    OPÇÃO {i + 1}
                  </p>
                )}
                <p style={{ fontSize: 12, color: C.text, whiteSpace: "pre-wrap", lineHeight: 1.7, margin: 0 }}>
                  {cap.texto}
                </p>
                {!!cap.hashtags?.length && (
                  <p style={{ fontFamily: mono, fontSize: 10, color: C.textDim, margin: "8px 0 0" }}>
                    {cap.hashtags.join(" ")}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => copiar(id, completo)}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    padding: 10,
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: copiado === id ? C.greenDim : C.cyanDim,
                    border: `1px solid ${copiado === id ? C.green : C.cyan}`,
                    color: copiado === id ? C.green : C.cyan,
                    fontFamily: mono,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {copiado === id ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                  {copiado === id ? "COPIADO" : "COPIAR LEGENDA"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {aba === "stories" && (
        <div style={{ display: "grid", gap: 10 }}>
          <button
            type="button"
            onClick={gerarStories}
            disabled={!dados || !!loading}
            style={{
              padding: 12,
              borderRadius: 8,
              cursor: !dados || loading ? "not-allowed" : "pointer",
              background: C.cyanDim,
              border: `1px solid ${C.cyan}`,
              color: C.cyan,
              fontFamily: mono,
              fontSize: 11,
              fontWeight: 700,
              opacity: !dados || loading ? 0.5 : 1,
            }}
          >
            {loading === "stories" ? "MONTANDO..." : "MONTAR ESTRATÉGIAS DE STORIES →"}
          </button>

          {!!tipos.length && (
            <div style={{ display: "flex", gap: 6 }}>
              {tipos.map((t, i) => (
                <button
                  key={t.tipo || i}
                  type="button"
                  onClick={() => setTipoAtivo(i)}
                  style={{
                    flex: 1,
                    padding: "10px 6px",
                    borderRadius: 8,
                    cursor: "pointer",
                    textAlign: "center",
                    fontFamily: mono,
                    fontSize: 9,
                    background: tipoAtivo === i ? C.greenDim : C.card,
                    border: `1px solid ${tipoAtivo === i ? C.green : C.border}`,
                    color: tipoAtivo === i ? C.green : C.textDim,
                  }}
                >
                  {t.tipo}
                </button>
              ))}
            </div>
          )}

          {(tipos[tipoAtivo]?.estrategias || []).map((s, i) => {
            const id = `story-${tipoAtivo}-${i}`;
            const texto = [s.nome, s.desc, s.layout, s.cta ? `Interação: ${s.cta}` : ""].filter(Boolean).join("\n\n");
            return (
              <div key={id} style={boxStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{s.nome}</p>
                  {!!s.slides && (
                    <span style={{ fontFamily: mono, fontSize: 9, color: C.textDim }}>
                      {s.slides} {s.slides === 1 ? "story" : "stories"}
                    </span>
                  )}
                </div>
                {s.desc && <p style={{ fontSize: 11, color: C.textMid, margin: "6px 0 0", lineHeight: 1.6 }}>{s.desc}</p>}
                {s.layout && (
                  <div style={{ background: C.elevated, borderRadius: 8, padding: 10, marginTop: 10 }}>
                    <p style={{ fontFamily: mono, fontSize: 8, color: C.cyan, letterSpacing: 1, margin: 0 }}>LAYOUT</p>
                    <p style={{ fontSize: 11, color: C.text, whiteSpace: "pre-wrap", lineHeight: 1.7, margin: "4px 0 0" }}>
                      {s.layout}
                    </p>
                  </div>
                )}
                {s.cta && (
                  <div style={{ background: C.elevated, borderRadius: 8, padding: 10, marginTop: 6 }}>
                    <p style={{ fontFamily: mono, fontSize: 8, color: C.gold, letterSpacing: 1, margin: 0 }}>INTERAÇÃO</p>
                    <p style={{ fontSize: 11, color: C.text, margin: "4px 0 0", lineHeight: 1.6 }}>{s.cta}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => copiar(id, texto)}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    padding: 9,
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: "transparent",
                    border: `1px solid ${copiado === id ? C.green : C.border}`,
                    color: copiado === id ? C.green : C.textMid,
                    fontFamily: mono,
                    fontSize: 10,
                  }}
                >
                  {copiado === id ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                  {copiado === id ? "COPIADO" : "COPIAR ROTEIRO"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Como funciona */}
      <div style={{ ...boxStyle, display: "grid", gap: 8 }}>
        <p style={{ fontFamily: mono, fontSize: 9, color: C.gold, letterSpacing: 2, margin: 0 }}>COMO FUNCIONA</p>
        {PASSOS.map((p, i) => (
          <div key={p} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: C.elevated,
                color: C.gold,
                fontFamily: mono,
                fontSize: 9,
              }}
            >
              {i + 1}
            </span>
            <p style={{ fontSize: 11, color: C.textMid, margin: 0, lineHeight: 1.5 }}>{p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
