import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cleanCaption } from "@/lib/captionText";
import { ensureFonts, loadImage, renderPhotoStory } from "@/lib/photoStoryTemplates";
import SaveShareButtons from "@/components/social/SaveShareButtons";
import { getTreinoDeHoje, type TreinoHoje } from "@/lib/treinoHojeData";
import { CONFIG_BIOMECH, hashtagsBiomech } from "@/lib/biomechContentConfig";
import {
  renderBiomechCarousel, BIOMECH_SLIDE_LABELS, BIOMECH_TPL, type BiomechCarouselContent,
} from "@/lib/biomechCarouselTemplate";

const C = {
  s1: "#0B0B12", s2: "#10101A", border: "#ffffff14",
  gold: BIOMECH_TPL.gold, green: BIOMECH_TPL.green, purple: BIOMECH_TPL.purple,
  white: "#F0F0F8", text: "#C8C8D8", muted: "#6A6A7A",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

type Foco = "anatomia" | "biomecanica" | "recrutamento" | "execucao" | "ciencia";
const FOCOS: { id: Foco; label: string; emoji: string }[] = [
  { id: "anatomia", label: "Anatomia", emoji: "🦴" },
  { id: "biomecanica", label: "Biomecânica", emoji: "⚙️" },
  { id: "recrutamento", label: "Recrutamento", emoji: "🎯" },
  { id: "execucao", label: "Execução", emoji: "🔄" },
  { id: "ciencia", label: "Ciência", emoji: "📚" },
];

type Formato = "carrossel" | "reels" | "stories";
const FORMATOS: { id: Formato; label: string; emoji: string }[] = [
  { id: "carrossel", label: "Carrossel", emoji: "📑" },
  { id: "reels", label: "Reels", emoji: "🎬" },
  { id: "stories", label: "Stories", emoji: "📱" },
];

type Corte = { segundo?: string; texto_tela?: string; acao?: string; fala?: string };
type BiomechAI = {
  capa?: { tag?: string; titulo?: string; subtitulo?: string };
  dado?: { numero?: string; titulo?: string; corpo?: string };
  pontos?: { titulo?: string; corpo?: string }[];
  aplicacao?: { titulo?: string; corpo?: string };
  resumo_frase?: string;
  legenda?: string;
  hook?: string;
  duracao_total?: string;
  cortes?: Corte[];
};

const Bloco = ({ titulo, cor, children }: { titulo: string; cor: string; children: React.ReactNode }) => (
  <div style={{ background: C.s2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
    <div style={{ fontFamily: F.m, fontSize: 9, letterSpacing: 2, color: cor, marginBottom: 10 }}>{titulo}</div>
    {children}
  </div>
);

const acao = (cor: string): React.CSSProperties => ({
  padding: "8px 12px", background: `${cor}16`, border: `1px solid ${cor}55`, borderRadius: 8,
  color: cor, fontFamily: F.t, fontSize: 12, fontWeight: 700, cursor: "pointer",
});

const copiar = async (texto: string, label: string) => {
  try {
    await navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado!`);
  } catch {
    toast.error("Não consegui copiar aqui.");
  }
};

/**
 * "Ciência do Exercício": cruza o treino real de hoje (TrainingON) com a
 * análise biomecânica real da BiomechanicsVault (Perplexity + Dr. BioMech,
 * com citações) e transforma isso em conteúdo pronto — sem inventar estudo.
 */
export default function BiomechContentPanel({ file, handle }: { file?: File | null; handle?: string }) {
  const at = handle || "diogo.mell0";
  const [treino, setTreino] = useState<TreinoHoje | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [exercicio, setExercicio] = useState("");
  const [grupo, setGrupo] = useState("");
  const [foco, setFoco] = useState<Foco>("ciencia");
  const [formato, setFormato] = useState<Formato>("carrossel");
  const [loading, setLoading] = useState(false);
  const [citacoes, setCitacoes] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [legenda, setLegenda] = useState("");
  const [reels, setReels] = useState<BiomechAI | null>(null);

  useEffect(() => {
    void (async () => {
      const t = await getTreinoDeHoje();
      setTreino(t);
      const primeiro = t?.exercicios?.[0];
      if (primeiro) {
        setExercicio(primeiro.nome);
        setGrupo(primeiro.alvo || t.grupos?.[0] || "");
      }
      setCarregando(false);
    })();
  }, []);

  const escolherExercicio = (nome: string, alvo?: string) => {
    setExercicio(nome);
    setGrupo(alvo || treino?.grupos?.[0] || "");
  };

  const gerar = async () => {
    if (!exercicio.trim()) return toast.error("Escolha ou escreva um exercício.");
    if (!grupo.trim()) return toast.error("Informe o grupo muscular do exercício.");
    setLoading(true);
    setImages([]);
    setReels(null);
    setCitacoes([]);
    try {
      // 1) Dados REAIS da BiomechanicsVault (Perplexity + Dr. BioMech, com citações).
      const { data: bio, error: bioErr } = await supabase.functions.invoke("analyze-biomechanics", {
        body: { exerciseName: exercicio.trim(), muscleGroup: grupo.trim(), tab: foco },
      });
      if (bioErr) throw new Error(bioErr.message);
      if (bio?.error) throw new Error(bio.error);
      const biomechData = { content: bio?.content || "", citations: Array.isArray(bio?.citations) ? bio.citations : [] };
      setCitacoes(biomechData.citations);

      // 2) A IA só escreve a narrativa/legenda em cima desses dados reais.
      const mode = formato === "reels" ? "biomech_reels" : "biomech_content";
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: { mode, exercicio: exercicio.trim(), grupo: grupo.trim(), foco, biomechData, handle: at },
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error?: string }).error!);
      const r = (data as { result?: BiomechAI })?.result || {};

      const focoLabel = `${FOCOS.find((f) => f.id === foco)?.emoji || "🔬"} ${FOCOS.find((f) => f.id === foco)?.label || "Ciência"}`;

      if (formato === "reels") {
        setReels(r);
        setLegenda(cleanCaption(r.legenda || ""));
        setLoading(false);
        return;
      }

      if (formato === "stories") {
        if (!file) {
          toast.error("Escolha uma foto pra usar como fundo do story.");
          setLoading(false);
          return;
        }
        await ensureFonts();
        const img = await loadImage(file);
        setImages([
          renderPhotoStory(
            img, "DADO",
            { dado: { numero: r.dado?.numero, descricao: r.dado?.corpo || r.dado?.titulo, fonte: biomechData.citations[0] || "" } },
            at,
          ),
        ]);
        setLegenda(cleanCaption(r.legenda || ""));
        setActive(0);
        setLoading(false);
        return;
      }

      const content: BiomechCarouselContent = {
        exercicio: exercicio.trim(),
        focoLabel,
        handle: at,
        capa: {
          tag: r.capa?.tag || "CIÊNCIA REAL",
          titulo: r.capa?.titulo || `${exercicio.trim()}: o que a ciência mostra`,
          subtitulo: r.capa?.subtitulo || "",
        },
        dado: {
          numero: r.dado?.numero || "",
          titulo: r.dado?.titulo || "O achado central",
          corpo: r.dado?.corpo || "Consulte a BiomechanicsVault pra ver a análise completa.",
        },
        pontos: (r.pontos || []).slice(0, 4).map((p) => ({ titulo: p.titulo || "", corpo: p.corpo || "" })),
        aplicacao: {
          titulo: r.aplicacao?.titulo || "Como aplicar no treino",
          corpo: r.aplicacao?.corpo || "",
        },
        fontes: biomechData.citations,
      };
      setImages(renderBiomechCarousel(content));
      setLegenda(cleanCaption(r.legenda || ""));
      setActive(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar agora.");
    } finally {
      setLoading(false);
    }
  };

  const hashtags = hashtagsBiomech(treino?.grupos || [], grupo);
  const legendaFinal = legenda ? `${legenda}\n\n${CONFIG_BIOMECH.cta_save}\n\n${hashtags.join(" ")}` : "";

  if (carregando) {
    return (
      <div style={{ fontFamily: F.b, fontSize: 12, color: C.muted, padding: 12 }}>
        Sincronizando com o TrainingON e a BiomechanicsVault...
      </div>
    );
  }

  return (
    <div>
      <Bloco titulo="🔬 CIÊNCIA DO EXERCÍCIO" cor={C.gold}>
        <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 12 }}>
          Cruza o treino real de hoje com a BiomechanicsVault (Perplexity + Dr. BioMech) — dados e citações reais,
          nunca inventados.
        </div>

        {treino?.exercicios?.length ? (
          <>
            <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.muted, marginBottom: 6 }}>
              EXERCÍCIOS DO TREINO DE HOJE — {treino.nomeTreino.toUpperCase()}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {treino.exercicios.map((e, i) => (
                <button
                  key={`${e.nome}-${i}`}
                  onClick={() => escolherExercicio(e.nome, e.alvo)}
                  disabled={loading}
                  style={acao(exercicio === e.nome ? C.gold : C.muted)}
                >
                  {e.nome}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ fontFamily: F.b, fontSize: 11, color: C.muted, marginBottom: 12 }}>
            Não achei o treino de hoje no TrainingON — escreva o exercício manualmente.
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <input
            value={exercicio}
            onChange={(e) => setExercicio(e.target.value)}
            placeholder="Exercício (ex: Remada Curvada)"
            style={{
              flex: 1, minWidth: 160, padding: "8px 10px", background: C.s2, border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.white, fontFamily: F.b, fontSize: 12,
            }}
          />
          <input
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
            placeholder="Grupo muscular (ex: Costas)"
            style={{
              flex: 1, minWidth: 140, padding: "8px 10px", background: C.s2, border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.white, fontFamily: F.b, fontSize: 12,
            }}
          />
        </div>

        <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.muted, marginBottom: 6 }}>FOCO</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {FOCOS.map((f) => (
            <button key={f.id} onClick={() => setFoco(f.id)} disabled={loading} style={acao(foco === f.id ? C.gold : C.muted)}>
              {f.emoji} {f.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.muted, marginBottom: 6 }}>FORMATO</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {FORMATOS.map((fm) => (
            <button key={fm.id} onClick={() => setFormato(fm.id)} disabled={loading} style={{ ...acao(formato === fm.id ? C.green : C.muted), flex: 1 }}>
              {fm.emoji} {fm.label.toUpperCase()}
            </button>
          ))}
        </div>
        {formato === "stories" && !file && (
          <div style={{ fontFamily: F.b, fontSize: 10, color: C.muted, marginBottom: 10 }}>
            Escolha uma foto no álbum pra usar de fundo do story.
          </div>
        )}

        <button onClick={gerar} disabled={loading} style={{ ...acao(C.gold), width: "100%", opacity: loading ? 0.6 : 1 }}>
          {loading ? "PESQUISANDO E GERANDO..." : "✦ GERAR CONTEÚDO"}
        </button>
      </Bloco>

      {!!citacoes.length && !images.length && !reels && (
        <div style={{ fontFamily: F.b, fontSize: 10, color: C.muted, marginBottom: 12 }}>
          {citacoes.length} fonte(s) real(is) encontrada(s) pela pesquisa.
        </div>
      )}

      {formato === "carrossel" && !!images.length && (
        <Bloco titulo={`CARROSSEL PRONTO (${images.length} SLIDES)`} cor={C.gold}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{ ...acao(i === active ? C.gold : C.muted), fontSize: 9, padding: "5px 8px" }}>
                {i + 1} · {BIOMECH_SLIDE_LABELS[i]}
              </button>
            ))}
          </div>
          {images[active] && (
            <img
              src={images[active]}
              alt={`Slide ${active + 1} — ${BIOMECH_SLIDE_LABELS[active]}`}
              style={{ width: "100%", maxWidth: 280, borderRadius: 10, display: "block", margin: "0 auto 10px" }}
            />
          )}
          <SaveShareButtons
            items={images.map((url, i) => ({ url, filename: `ciencia-exercicio-${i + 1}-${(BIOMECH_SLIDE_LABELS[i] || "").toLowerCase().replace(/\s+/g, "-")}.png` }))}
            texto={legendaFinal}
          />
        </Bloco>
      )}

      {formato === "stories" && !!images.length && (
        <Bloco titulo="STORY PRONTO" cor={C.gold}>
          <img src={images[0]} alt="Story de ciência do exercício" style={{ width: "100%", maxWidth: 260, borderRadius: 10, display: "block", margin: "0 auto 10px" }} />
          <SaveShareButtons items={[{ url: images[0], filename: "ciencia-exercicio-story.png" }]} texto={legendaFinal} />
        </Bloco>
      )}

      {formato === "reels" && reels && (
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
        </Bloco>
      )}

      {!!legenda && (
        <Bloco titulo="LEGENDA + HASHTAGS" cor={C.purple}>
          <div style={{ fontFamily: F.b, fontSize: 12, color: C.text, whiteSpace: "pre-wrap", marginBottom: 10 }}>{legendaFinal}</div>
          <button onClick={() => copiar(legendaFinal, "Legenda")} style={acao(C.purple)}>COPIAR LEGENDA + HASHTAGS</button>
        </Bloco>
      )}

      {!!citacoes.length && (images.length > 0 || reels) && (
        <Bloco titulo="FONTES DA PESQUISA" cor={C.green}>
          {citacoes.slice(0, 6).map((c, i) => (
            <div key={i} style={{ fontFamily: F.b, fontSize: 10, color: C.muted, marginBottom: 4, wordBreak: "break-all" }}>
              {c}
            </div>
          ))}
        </Bloco>
      )}
    </div>
  );
}
