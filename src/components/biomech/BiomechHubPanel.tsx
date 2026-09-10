/**
 * HUB DE CONTEÚDO da BiomechanicsVault.
 * O coach abre um exercício e gera tudo ali mesmo: sugestões inteligentes,
 * geração manual (foco + ângulo + formato), banco de ideias (React Coach,
 * comparativos, mitos, stories rápidos e desafio) e histórico local.
 *
 * Tudo é escrito em cima da pesquisa REAL da vault (Perplexity + Dr. BioMech,
 * com citações). Nada de estudo, número ou percentual inventado.
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cleanCaption } from "@/lib/captionText";
import SaveShareButtons from "@/components/social/SaveShareButtons";
import { CONFIG_BIOMECH, hashtagsBiomech } from "@/lib/biomechContentConfig";
import {
  renderBiomechCarousel, BIOMECH_SLIDE_LABELS, BIOMECH_TPL, type BiomechCarouselContent,
} from "@/lib/biomechCarouselTemplate";
import { renderStoryFrames, type StoryScript } from "@/lib/storyFrameTemplate";
import {
  historicoDoExercicio, registrarGeracao, dataCurta, type BiomechHistoricoItem,
} from "@/lib/biomechHistorico";

const C = {
  s1: "#0B0B12", s2: "#10101A", border: "#ffffff14",
  gold: BIOMECH_TPL.gold, green: BIOMECH_TPL.green, purple: BIOMECH_TPL.purple,
  white: "#F0F0F8", text: "#C8C8D8", muted: "#6A6A7A",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

type Foco = "anatomia" | "biomecanica" | "recrutamento" | "execucao" | "ciencia" | "completo";
const FOCOS: { id: Foco; label: string; emoji: string }[] = [
  { id: "anatomia", label: "Anatomia", emoji: "🔬" },
  { id: "biomecanica", label: "Biomecânica", emoji: "⚙️" },
  { id: "recrutamento", label: "Recrutamento", emoji: "🎯" },
  { id: "execucao", label: "Execução", emoji: "⚡" },
  { id: "ciencia", label: "Ciência", emoji: "📊" },
  { id: "completo", label: "Completo", emoji: "🔥" },
];

type Angulo = "educativo" | "react_coach" | "mito_metodo" | "comparativo" | "erro_comum" | "desafio_seguidor";
const ANGULOS: { id: Angulo; label: string }[] = [
  { id: "educativo", label: "Educativo" },
  { id: "react_coach", label: "React Coach" },
  { id: "mito_metodo", label: "Mito ou Método" },
  { id: "comparativo", label: "Comparativo" },
  { id: "erro_comum", label: "Erro Comum" },
  { id: "desafio_seguidor", label: "Desafio Seguidor" },
];

type Formato = "carrossel" | "reels" | "stories" | "todos";
const FORMATOS: { id: Formato; label: string; emoji: string }[] = [
  { id: "carrossel", label: "Carrossel", emoji: "📑" },
  { id: "reels", label: "Reels", emoji: "🎬" },
  { id: "stories", label: "Stories", emoji: "📱" },
  { id: "todos", label: "Todos", emoji: "🔥" },
];

type Corte = { segundo?: string; texto_tela?: string; acao?: string; fala?: string };
type BiomechAI = {
  capa?: { tag?: string; titulo?: string; subtitulo?: string };
  dado?: { numero?: string; titulo?: string; corpo?: string };
  pontos?: { titulo?: string; corpo?: string }[];
  aplicacao?: { titulo?: string; corpo?: string };
  legenda?: string;
  hook?: string;
  cortes?: Corte[];
};

type Sugestao = {
  titulo?: string; descricao?: string; formato?: string; angulo?: string;
  score?: number; texto_tela_hook?: string;
};
type Ideias = {
  sugestao_viral?: Sugestao;
  sugestao_saves?: Sugestao;
  sugestao_engajamento?: Sugestao;
  sugestao_seguidores?: Sugestao;
  reacts?: { titulo?: string; cena?: string; reacao?: string; correcao?: string; texto_tela?: string; dado_cientifico?: string }[];
  comparativos?: { titulo?: string; subtitulo?: string; dados?: string }[];
  mitos?: { mito?: string; veredito?: string; dado?: string; fonte?: string }[];
  stories_rapidos?: { tipo?: string; titulo?: string; opcoes?: string[]; revelacao?: string }[];
  desafio?: { nome?: string; descricao?: string; duracao?: string; base_cientifica?: string; cta?: string };
};

const Bloco = ({ titulo, cor, children }: { titulo: string; cor: string; children: React.ReactNode }) => (
  <div style={{ background: C.s2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
    <div style={{ fontFamily: F.m, fontSize: 10, letterSpacing: 2, color: cor, marginBottom: 12 }}>{titulo}</div>
    {children}
  </div>
);

const acao = (cor: string): React.CSSProperties => ({
  padding: "8px 12px", background: `${cor}16`, border: `1px solid ${cor}55`, borderRadius: 8,
  color: cor, fontFamily: F.t, fontSize: 12, fontWeight: 700, cursor: "pointer",
});

const card: React.CSSProperties = {
  background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, marginBottom: 10,
};

const copiar = async (texto: string, label: string) => {
  try {
    await navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado!`);
  } catch {
    toast.error("Não consegui copiar aqui.");
  }
};

const FOCO_DO_ANGULO: Record<Angulo, Foco> = {
  educativo: "ciencia",
  react_coach: "execucao",
  mito_metodo: "recrutamento",
  comparativo: "recrutamento",
  erro_comum: "execucao",
  desafio_seguidor: "biomecanica",
};

export default function BiomechHubPanel({
  exercicio, grupo, handle, anguloInicial, formatoInicial,
}: {
  exercicio: string; grupo: string; handle?: string;
  anguloInicial?: Angulo; formatoInicial?: Formato;
}) {
  const at = handle || "diogo.mell0";

  const [ideias, setIdeias] = useState<Ideias | null>(null);
  const [loadingIdeias, setLoadingIdeias] = useState(false);
  const [foco, setFoco] = useState<Foco>("ciencia");
  const [angulo, setAngulo] = useState<Angulo>(anguloInicial || "educativo");
  const [formato, setFormato] = useState<Formato>(formatoInicial || "carrossel");
  const [loading, setLoading] = useState(false);
  const [citacoes, setCitacoes] = useState<string[]>([]);
  const [slides, setSlides] = useState<string[]>([]);
  const [legendaEditada, setLegendaEditada] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [storiesImgs, setStoriesImgs] = useState<string[]>([]);
  const [reels, setReels] = useState<BiomechAI | null>(null);
  const [legenda, setLegenda] = useState("");
  const [historico, setHistorico] = useState<BiomechHistoricoItem[]>([]);

  useEffect(() => {
    setIdeias(null);
    setSlides([]);
    setStoriesImgs([]);
    setReels(null);
    setLegenda("");
    setCitacoes([]);
    setHistorico(historicoDoExercicio(exercicio));
  }, [exercicio]);

  // Quando a sugestão do treino de hoje escolhe o ângulo/formato, o hub acompanha.
  useEffect(() => {
    if (anguloInicial) setAngulo(anguloInicial);
  }, [anguloInicial]);
  useEffect(() => {
    if (formatoInicial) setFormato(formatoInicial);
  }, [formatoInicial]);

  /** Pesquisa real da vault: uma aba, ou as 5 quando o foco é "completo". */
  const buscarPesquisa = useCallback(async (f: Foco) => {
    const tabs = f === "completo"
      ? ["anatomia", "biomecanica", "recrutamento", "execucao", "ciencia"]
      : [f];
    const chamar = (tab: string) => supabase.functions.invoke("analyze-biomechanics", {
      body: { exerciseName: exercicio, muscleGroup: grupo, tab },
    });
    const partes: string[] = [];
    const cits: string[] = [];
    for (const tab of tabs) {
      let { data, error } = await chamar(tab);
      if (error || !data?.content) ({ data, error } = await chamar(tab));
      if (error) throw new Error(`Busca científica indisponível agora (${error.message}). Tente de novo em alguns segundos.`);
      if (data?.error) throw new Error(data.error);
      if (data?.content) partes.push(`### ${tab.toUpperCase()}\n${data.content}`);
      if (Array.isArray(data?.citations)) cits.push(...data.citations);
    }
    const biomechData = { content: partes.join("\n\n"), citations: Array.from(new Set(cits)) };
    setCitacoes(biomechData.citations);
    return biomechData;
  }, [exercicio, grupo]);

  const chamarModo = async (
    mode: string,
    f: Foco,
    ang: Angulo,
    biomechData: { content: string; citations: string[] },
  ) => {
    const { data, error } = await supabase.functions.invoke("social-on-generate", {
      body: { mode, exercicio, grupo, foco: f, angulo: ang, biomechData, handle: at },
    });
    if (error) throw new Error(error.message);
    if ((data as { error?: string })?.error) throw new Error((data as { error?: string }).error!);
    return (data as { result?: Record<string, unknown> })?.result || {};
  };

  const gerarSugestoes = async () => {
    setLoadingIdeias(true);
    try {
      const bio = await buscarPesquisa("ciencia");
      const r = (await chamarModo("biomech_ideias", "ciencia", angulo, bio)) as Ideias;
      setIdeias(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar as sugestões agora.");
    } finally {
      setLoadingIdeias(false);
    }
  };

  const gerar = async (f: Foco = foco, ang: Angulo = angulo, fm: Formato = formato) => {
    setLoading(true);
    setSlides([]);
    setStoriesImgs([]);
    setReels(null);
    try {
      const bio = await buscarPesquisa(f);
      const focoLabel = `${FOCOS.find((x) => x.id === f)?.emoji || "🔬"} ${FOCOS.find((x) => x.id === f)?.label || "Ciência"}`;
      const quer = (alvo: Formato) => fm === "todos" || fm === alvo;
      let legendaFinalTxt = "";

      if (quer("carrossel")) {
        const r = (await chamarModo("biomech_content", f, ang, bio)) as BiomechAI;
        const content: BiomechCarouselContent = {
          exercicio,
          focoLabel,
          handle: at,
          capa: {
            tag: r.capa?.tag || "CIÊNCIA REAL",
            titulo: r.capa?.titulo || `${exercicio}: o que a ciência mostra`,
            subtitulo: r.capa?.subtitulo || "",
          },
          dado: {
            numero: r.dado?.numero || "",
            titulo: r.dado?.titulo || "O achado central",
            corpo: r.dado?.corpo || "",
          },
          pontos: (r.pontos || []).slice(0, 4).map((p) => ({ titulo: p.titulo || "", corpo: p.corpo || "" })),
          aplicacao: { titulo: r.aplicacao?.titulo || "Como aplicar no treino", corpo: r.aplicacao?.corpo || "" },
          fontes: bio.citations,
        };
        setSlides(renderBiomechCarousel(content));
        setActive(0);
        legendaFinalTxt = cleanCaption(r.legenda || "");
        registrarGeracao({ exercicio, formato: "carrossel", foco: f, angulo: ang });
      }

      if (quer("reels")) {
        const r = (await chamarModo("biomech_reels", f, ang, bio)) as BiomechAI;
        setReels(r);
        legendaFinalTxt = legendaFinalTxt || cleanCaption(r.legenda || "");
        registrarGeracao({ exercicio, formato: "reels", foco: f, angulo: ang });
      }

      if (quer("stories")) {
        const r = (await chamarModo("biomech_stories", f, ang, bio)) as StoryScript & { legenda?: string };
        setStoriesImgs(renderStoryFrames({ tema: r.tema, frames: r.frames || [] }, at));
        legendaFinalTxt = legendaFinalTxt || cleanCaption(r.legenda || "");
        registrarGeracao({ exercicio, formato: "stories", foco: f, angulo: ang });
      }

      setLegenda(legendaFinalTxt);
      setLegendaEditada(null);
      setHistorico(historicoDoExercicio(exercicio));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar agora.");
    } finally {
      setLoading(false);
    }
  };

  const aplicarSugestao = (s?: Sugestao) => {
    if (!s) return;
    const ang = (ANGULOS.find((a) => a.id === s.angulo)?.id || "educativo") as Angulo;
    const fm = (["carrossel", "reels", "stories"].includes(String(s.formato)) ? s.formato : "carrossel") as Formato;
    const f = FOCO_DO_ANGULO[ang];
    setAngulo(ang);
    setFormato(fm);
    setFoco(f);
    void gerar(f, ang, fm);
  };

  const hashtags = hashtagsBiomech([grupo], grupo);
  const legendaBase = legenda ? `${legenda}\n\n${CONFIG_BIOMECH.cta_save}\n\n${hashtags.join(" ")}` : "";
  const legendaFinal = legendaEditada ?? legendaBase;

  const CardSugestao = ({ tag, cor, s }: { tag: string; cor: string; s?: Sugestao }) => {
    if (!s?.titulo) return null;
    return (
      <div style={{ ...card, borderColor: `${cor}44` }}>
        <div style={{ fontFamily: F.m, fontSize: 9, letterSpacing: 1.5, color: cor, marginBottom: 6 }}>
          {tag} · SCORE {s.score ?? 9}/10
        </div>
        <div style={{ fontFamily: F.b, fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 6 }}>{s.titulo}</div>
        {s.descricao && (
          <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 6 }}>Por quê: {s.descricao}</div>
        )}
        {s.texto_tela_hook && (
          <div style={{ fontFamily: F.b, fontSize: 11, color: cor, marginBottom: 6 }}>Texto de tela: {s.texto_tela_hook}</div>
        )}
        <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginBottom: 8 }}>
          Formato: {s.formato || "carrossel"} · {ANGULOS.find((a) => a.id === s.angulo)?.label || "Educativo"}
        </div>
        <button onClick={() => aplicarSugestao(s)} disabled={loading} style={acao(cor)}>✦ GERAR AGORA</button>
      </div>
    );
  };

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ fontFamily: F.t, fontSize: 18, fontWeight: 800, color: C.white, marginBottom: 14 }}>
        🔥 CONTEÚDO PARA REDES SOCIAIS
      </div>

      <Bloco titulo="💡 SUGESTÕES INTELIGENTES" cor={C.gold}>
        <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 12 }}>
          Baseado nos dados reais deste exercício — pesquisa da vault com citações, nunca dado inventado.
        </div>
        {!ideias && (
          <button onClick={gerarSugestoes} disabled={loadingIdeias || loading} style={{ ...acao(C.gold), width: "100%" }}>
            {loadingIdeias ? "PESQUISANDO E GERANDO SUGESTÕES..." : "✦ GERAR SUGESTÕES DESTE EXERCÍCIO"}
          </button>
        )}
        {ideias && (
          <>
            <CardSugestao tag="🔥 MAIS VIRAL" cor={C.gold} s={ideias.sugestao_viral} />
            <CardSugestao tag="💾 MAIS SAVES" cor={C.green} s={ideias.sugestao_saves} />
            <CardSugestao tag="💬 MAIS ENGAJAMENTO" cor={C.purple} s={ideias.sugestao_engajamento} />
            <CardSugestao tag="📈 MAIS SEGUIDORES" cor={C.green} s={ideias.sugestao_seguidores} />
          </>
        )}
      </Bloco>

      <Bloco titulo="OU GERE MANUALMENTE" cor={C.purple}>
        <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.muted, marginBottom: 6 }}>FOCO</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {FOCOS.map((f) => (
            <button key={f.id} onClick={() => setFoco(f.id)} disabled={loading} style={acao(foco === f.id ? C.gold : C.muted)}>
              {f.emoji} {f.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.muted, marginBottom: 6 }}>ÂNGULO</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {ANGULOS.map((a) => (
            <button key={a.id} onClick={() => setAngulo(a.id)} disabled={loading} style={acao(angulo === a.id ? C.purple : C.muted)}>
              {a.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.muted, marginBottom: 6 }}>FORMATO</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {FORMATOS.map((fm) => (
            <button key={fm.id} onClick={() => setFormato(fm.id)} disabled={loading} style={acao(formato === fm.id ? C.green : C.muted)}>
              {fm.emoji} {fm.label.toUpperCase()}
            </button>
          ))}
        </div>

        <button onClick={() => void gerar()} disabled={loading} style={{ ...acao(C.gold), width: "100%", opacity: loading ? 0.6 : 1 }}>
          {loading ? "PESQUISANDO E GERANDO..." : "✦ GERAR CONTEÚDO"}
        </button>
      </Bloco>

      {!!slides.length && (
        <Bloco titulo={`CARROSSEL PRONTO (${slides.length} SLIDES)`} cor={C.gold}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{ ...acao(i === active ? C.gold : C.muted), fontSize: 9, padding: "5px 8px" }}>
                {i + 1} · {BIOMECH_SLIDE_LABELS[i]}
              </button>
            ))}
          </div>
          {slides[active] && (
            <img src={slides[active]} alt={`Slide ${active + 1}`} style={{ width: "100%", maxWidth: 280, borderRadius: 10, display: "block", margin: "0 auto 10px" }} />
          )}
          <SaveShareButtons
            items={slides.map((url, i) => ({ url, filename: `biomech-${i + 1}.png` }))}
            texto={legendaFinal}
          />
        </Bloco>
      )}

      {!!storiesImgs.length && (
        <Bloco titulo={`STORIES PRONTOS (${storiesImgs.length})`} cor={C.green}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 10 }}>
            {storiesImgs.map((s, i) => (
              <img key={i} src={s} alt={`Story ${i + 1}`} style={{ width: 130, borderRadius: 10, flexShrink: 0 }} />
            ))}
          </div>
          <SaveShareButtons
            items={storiesImgs.map((url, i) => ({ url, filename: `biomech-story-${i + 1}.png` }))}
            texto={legendaFinal}
          />
        </Bloco>
      )}

      {reels && (
        <Bloco titulo="ROTEIRO DO REELS" cor={C.gold}>
          <div style={{ fontFamily: F.b, fontSize: 12, color: C.white, marginBottom: 8 }}>{reels.hook}</div>
          {(reels.cortes || []).map((c, i) => (
            <div key={i} style={{ marginBottom: 10, paddingLeft: 10, borderLeft: `2px solid ${C.gold}66` }}>
              <div style={{ fontFamily: F.m, fontSize: 9, color: C.gold }}>{c.segundo}</div>
              <div style={{ fontFamily: F.b, fontSize: 12, color: C.white, fontWeight: 700 }}>{c.texto_tela}</div>
              {c.fala && <div style={{ fontFamily: F.b, fontSize: 11, color: C.text }}>{c.fala}</div>}
              {c.acao && <div style={{ fontFamily: F.b, fontSize: 10, color: C.muted }}>{c.acao}</div>}
            </div>
          ))}
          <button
            onClick={() => copiar((reels.cortes || []).map((c) => `${c.segundo}\n${c.texto_tela}\n${c.fala || ""}`).join("\n\n"), "Roteiro")}
            style={acao(C.gold)}
          >
            📋 COPIAR ROTEIRO
          </button>
        </Bloco>
      )}

      {!!legendaFinal && (
        <Bloco titulo="LEGENDA + HASHTAGS" cor={C.purple}>
          <textarea
            value={legendaFinal}
            onChange={(e) => setLegendaEditada(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%", minHeight: 190, maxHeight: 340, resize: "vertical",
              fontFamily: F.b, fontSize: 12, lineHeight: 1.65, color: C.text,
              background: "rgba(255,255,255,0.03)", border: `1px solid ${C.purple}44`,
              borderRadius: 10, padding: 12, marginBottom: 8, outline: "none",
              overflowWrap: "anywhere", whiteSpace: "pre-wrap",
            }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => copiar(legendaFinal, "Legenda")} style={{ ...acao(C.purple), flex: 1 }}>COPIAR LEGENDA + HASHTAGS</button>
            {legendaEditada !== null && (
              <button onClick={() => setLegendaEditada(null)} style={acao(C.muted)}>RESTAURAR</button>
            )}
          </div>
        </Bloco>
      )}

      <Bloco titulo="📚 CONTEÚDOS JÁ GERADOS DESTE EXERCÍCIO" cor={C.green}>
        {historico.length ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {historico.map((h, i) => (
              <div key={i} style={{ ...card, marginBottom: 0, width: 120 }}>
                <div style={{ fontSize: 18 }}>{h.formato === "reels" ? "🎬" : h.formato === "stories" ? "📱" : "📑"}</div>
                <div style={{ fontFamily: F.b, fontSize: 11, color: C.white, fontWeight: 700 }}>
                  {ANGULOS.find((a) => a.id === h.angulo)?.label || h.angulo}
                </div>
                <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{dataCurta(h.data)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontFamily: F.b, fontSize: 11, color: C.muted }}>Nenhum conteúdo gerado ainda deste exercício.</div>
        )}
      </Bloco>

      {ideias?.reacts?.length ? (
        <Bloco titulo={`🎯 IDEIAS REACT COACH — ${exercicio.toUpperCase()}`} cor={C.gold}>
          {ideias.reacts.map((r, i) => (
            <div key={i} style={card}>
              <div style={{ fontFamily: F.b, fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 8 }}>
                🎬 REACT {i + 1}: {r.titulo}
              </div>
              {r.cena && <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 4 }}>[Cena] {r.cena}</div>}
              {r.reacao && <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 4 }}>[Pausa] {r.reacao}</div>}
              {r.correcao && <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 4 }}>[Correção] {r.correcao}</div>}
              {r.dado_cientifico && <div style={{ fontFamily: F.b, fontSize: 11, color: C.green, marginBottom: 4 }}>Dado: {r.dado_cientifico}</div>}
              {r.texto_tela && <div style={{ fontFamily: F.b, fontSize: 11, color: C.gold, marginBottom: 8 }}>Texto de tela: {r.texto_tela}</div>}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  onClick={() => copiar([r.titulo, r.cena, r.reacao, r.correcao, r.texto_tela].filter(Boolean).join("\n"), "Roteiro")}
                  style={acao(C.muted)}
                >
                  📋 Copiar roteiro
                </button>
                <button onClick={() => void gerar("execucao", "react_coach", "reels")} disabled={loading} style={acao(C.gold)}>
                  ✦ Gerar Reels completo
                </button>
              </div>
            </div>
          ))}
        </Bloco>
      ) : null}

      {ideias?.comparativos?.length ? (
        <Bloco titulo="🆚 IDEIAS COMPARATIVO" cor={C.purple}>
          {ideias.comparativos.map((c, i) => (
            <div key={i} style={card}>
              <div style={{ fontFamily: F.b, fontSize: 12, fontWeight: 700, color: C.white }}>📑 {c.titulo}</div>
              {c.subtitulo && <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, margin: "4px 0" }}>{c.subtitulo}</div>}
              {c.dados && <div style={{ fontFamily: F.b, fontSize: 11, color: C.muted, marginBottom: 8 }}>{c.dados}</div>}
              <button onClick={() => void gerar("recrutamento", "comparativo", "carrossel")} disabled={loading} style={acao(C.purple)}>
                ✦ Gerar carrossel comparativo
              </button>
            </div>
          ))}
        </Bloco>
      ) : null}

      {ideias?.mitos?.length ? (
        <Bloco titulo="💀 IDEIAS MITO OU MÉTODO" cor={C.gold}>
          {ideias.mitos.map((m, i) => (
            <div key={i} style={card}>
              <div style={{ fontFamily: F.b, fontSize: 12, fontWeight: 700, color: C.white }}>"{m.mito}"</div>
              <div style={{ fontFamily: F.m, fontSize: 10, color: C.gold, margin: "6px 0" }}>VEREDITO: {m.veredito}</div>
              {m.dado && <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 4 }}>{m.dado}</div>}
              {m.fonte && <div style={{ fontFamily: F.b, fontSize: 10, color: C.muted, marginBottom: 8 }}>{m.fonte}</div>}
              <button onClick={() => void gerar("recrutamento", "mito_metodo", "carrossel")} disabled={loading} style={acao(C.gold)}>
                ✦ Gerar carrossel Mito ou Método
              </button>
            </div>
          ))}
        </Bloco>
      ) : null}

      {ideias?.stories_rapidos?.length ? (
        <Bloco titulo="⚡ IDEIAS STORIES RÁPIDOS" cor={C.green}>
          {ideias.stories_rapidos.map((s, i) => (
            <div key={i} style={card}>
              <div style={{ fontFamily: F.b, fontSize: 12, fontWeight: 700, color: C.white }}>📱 {s.titulo}</div>
              {!!s.opcoes?.length && (
                <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, margin: "4px 0" }}>{s.opcoes.join(" / ")}</div>
              )}
              {s.revelacao && <div style={{ fontFamily: F.b, fontSize: 11, color: C.muted, marginBottom: 8 }}>Depois: {s.revelacao}</div>}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  onClick={() => copiar([s.titulo, (s.opcoes || []).join(" / "), s.revelacao].filter(Boolean).join("\n"), "Texto")}
                  style={acao(C.muted)}
                >
                  📋 Copiar texto
                </button>
                <button onClick={() => void gerar("ciencia", "educativo", "stories")} disabled={loading} style={acao(C.green)}>
                  ✦ Gerar stories
                </button>
              </div>
            </div>
          ))}
        </Bloco>
      ) : null}

      {ideias?.desafio?.nome ? (
        <Bloco titulo="🎯 IDEIA DESAFIO SEGUIDOR" cor={C.purple}>
          <div style={card}>
            <div style={{ fontFamily: F.b, fontSize: 13, fontWeight: 700, color: C.white }}>🏆 {ideias.desafio.nome}</div>
            <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, margin: "4px 0" }}>{ideias.desafio.duracao}</div>
            {ideias.desafio.descricao && <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 4 }}>{ideias.desafio.descricao}</div>}
            {ideias.desafio.base_cientifica && <div style={{ fontFamily: F.b, fontSize: 11, color: C.green, marginBottom: 4 }}>{ideias.desafio.base_cientifica}</div>}
            {ideias.desafio.cta && <div style={{ fontFamily: F.b, fontSize: 11, color: C.gold, marginBottom: 8 }}>{ideias.desafio.cta}</div>}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => void gerar("biomecanica", "desafio_seguidor", "carrossel")} disabled={loading} style={acao(C.purple)}>
                ✦ Gerar post do desafio
              </button>
              <button onClick={() => void gerar("biomecanica", "desafio_seguidor", "stories")} disabled={loading} style={acao(C.green)}>
                ✦ Gerar stories do desafio
              </button>
            </div>
          </div>
        </Bloco>
      ) : null}

      {!!citacoes.length && (
        <Bloco titulo="FONTES DA PESQUISA" cor={C.green}>
          {citacoes.slice(0, 6).map((c, i) => (
            <div key={i} style={{ fontFamily: F.b, fontSize: 10, color: C.muted, marginBottom: 4, wordBreak: "break-all" }}>{c}</div>
          ))}
        </Bloco>
      )}
    </div>
  );
}
