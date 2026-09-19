/**
 * HUB DE CONTEÚDO do ScienceHub — o mesmo motor da BiomechanicsVault, mas
 * escrito em cima da evidência real já exibida na tela (Dr. Evidence,
 * PubMed Live, Suplementos ou Mitos), com as citações que vieram da busca.
 *
 * Nada de estudo, número ou percentual inventado: a única fonte é o texto de
 * pesquisa real recebido por prop mais a pesquisa dual opcional.
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cleanCaption } from "@/lib/captionText";
import SaveShareButtons from "@/components/social/SaveShareButtons";
import InstagramAcoesPanel from "@/components/social/InstagramAcoesPanel";
import {
  renderBiomechCarousel, BIOMECH_SLIDE_LABELS, BIOMECH_TPL, type BiomechCarouselContent,
} from "@/lib/biomechCarouselTemplate";
import { renderStoryFrames, type StoryScript } from "@/lib/storyFrameTemplate";
import CarouselStyleSwitch from "@/components/social/CarouselStyleSwitch";
import DualResearchField from "@/components/social/DualResearchField";
import { comPesquisa } from "@/lib/dualResearch";
import { usePesquisaAtiva } from "@/hooks/usePesquisaAtiva";
import { useCarouselStyle } from "@/hooks/useCarouselStyle";
import { renderTechSlides } from "@/lib/techSlideTemplate";
import { biomechToTech } from "@/lib/techAdapters";
import { compressImageFile } from "@/lib/socialMediaFrames";

/** Foto do coach como slide 4:5 (1080x1350) no padrão do carrossel — a imagem preenche o slide. */
const fotoParaSlide = async (url: string, w = 1080, h = 1350): Promise<string | null> => {
  const img = await new Promise<HTMLImageElement | null>((res) => {
    const i = new window.Image();
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = url;
  });
  if (!img) return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, w, h);
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  return canvas.toDataURL("image/png");
};

const C = {
  s1: "#0B0B12", s2: "#10101A", border: "#ffffff14",
  gold: BIOMECH_TPL.gold, green: BIOMECH_TPL.green, purple: BIOMECH_TPL.purple,
  white: "#F0F0F8", text: "#C8C8D8", muted: "#6A6A7A",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

type Angulo = "educativo" | "react_coach" | "mito_metodo" | "comparativo" | "erro_comum" | "desafio_seguidor";
const ANGULOS: { id: Angulo; label: string }[] = [
  { id: "educativo", label: "Educativo" },
  { id: "mito_metodo", label: "Mito ou Método" },
  { id: "comparativo", label: "Comparativo" },
  { id: "erro_comum", label: "Erro Comum" },
  { id: "react_coach", label: "React Coach" },
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
type ScienceAI = {
  capa?: { tag?: string; titulo?: string; subtitulo?: string };
  dado?: { numero?: string; titulo?: string; corpo?: string };
  pontos?: { titulo?: string; corpo?: string }[];
  aplicacao?: { titulo?: string; corpo?: string };
  legenda?: string; hook?: string; cortes?: Corte[];
};
type Sugestao = {
  titulo?: string; descricao?: string; formato?: string; angulo?: string;
  score?: number; texto_tela_hook?: string;
};
type Ideias = {
  sugestao_viral?: Sugestao; sugestao_saves?: Sugestao;
  sugestao_engajamento?: Sugestao; sugestao_seguidores?: Sugestao;
};

const HASHTAGS = [
  "#ciencia", "#nutrion", "#evidenciacientifica", "#treinointeligente", "#cienciadotreino",
];
const CTA_SAVE = "Salva esse conteúdo — evidência aplicada, não achismo.";

const normalizarFontes = (fontes: string[]) =>
  [...new Set((fontes || []).filter((fonte) => typeof fonte === "string").map((fonte) => fonte.trim()).filter(Boolean))];

const rotuloFonte = (fonte: string) => {
  try {
    const url = new URL(fonte);
    return url.hostname.replace(/^www\./i, "");
  } catch {
    return fonte.length > 90 ? `${fonte.slice(0, 87)}…` : fonte;
  }
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

export default function ScienceContentHubPanel({
  tema, area, pesquisaTexto, citacoes, handle,
}: {
  tema: string; area: string; pesquisaTexto: string; citacoes: string[]; handle?: string;
}) {
  const at = handle || "diogo.mell0";

  const [angulo, setAngulo] = useState<Angulo>("educativo");
  const [formato, setFormato] = useState<Formato>("carrossel");
  const [loading, setLoading] = useState(false);
  const [loadingIdeias, setLoadingIdeias] = useState(false);
  const [ideias, setIdeias] = useState<Ideias | null>(null);
  const [slides, setSlides] = useState<string[]>([]);
  const [content, setContent] = useState<BiomechCarouselContent | null>(null);
  const [active, setActive] = useState(0);
  const [storiesImgs, setStoriesImgs] = useState<string[]>([]);
  const [reels, setReels] = useState<ScienceAI | null>(null);
  const [legenda, setLegenda] = useState("");
  const [legendaEditada, setLegendaEditada] = useState<string | null>(null);
  const [style, setStyle] = useCarouselStyle();
  const [pesquisa, setPesquisa] = usePesquisaAtiva();
  const [foto, setFoto] = useState<string | null>(null);
  const fontesReais = normalizarFontes(citacoes);

  useEffect(() => {
    setIdeias(null); setSlides([]); setContent(null);
    setStoriesImgs([]); setReels(null); setLegenda(""); setLegendaEditada(null);
  }, [tema, pesquisaTexto]);

  useEffect(() => {
    if (!content) return;
    let vivo = true;
    (async () => {
      let imgs = style === "tech"
        ? await renderTechSlides(biomechToTech(content), { handle: content.handle || at })
        : renderBiomechCarousel(content);
      if (foto) {
        const fotoSlide = await fotoParaSlide(foto);
        // Mantém FONTES invariavelmente no slide 6; a foto entra depois dele.
        if (fotoSlide) imgs = [...imgs.slice(0, 6), fotoSlide, ...imgs.slice(6)];
      }
      if (vivo) setSlides(imgs);
    })();
    return () => { vivo = false; };
  }, [content, style, at, foto]);

  const pesquisaBase = { content: pesquisaTexto, citations: fontesReais };

  const exigirFontes = () => {
    if (fontesReais.length > 0) return true;
    toast.error("Nenhuma fonte verificável foi retornada. Faça uma pesquisa com fontes antes de gerar o conteúdo.");
    return false;
  };

  const chamarModo = async (mode: string, ang: Angulo) => {
    const { data, error } = await supabase.functions.invoke("social-on-generate", {
      body: comPesquisa({
        mode, cientifico: true, exercicio: tema, grupo: area,
        foco: "ciencia", angulo: ang, biomechData: pesquisaBase, handle: at,
      }),
    });
    if (error) throw new Error(error.message);
    if ((data as { error?: string })?.error) throw new Error((data as { error?: string }).error!);
    return (data as { result?: Record<string, unknown> })?.result || {};
  };

  const gerarSugestoes = async () => {
    if (!exigirFontes()) return;
    setLoadingIdeias(true);
    try {
      setIdeias((await chamarModo("biomech_ideias", angulo)) as Ideias);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar as sugestões agora.");
    } finally {
      setLoadingIdeias(false);
    }
  };

  const gerar = async (ang: Angulo = angulo, fm: Formato = formato) => {
    if (!exigirFontes()) return;
    setLoading(true);
    setSlides([]); setContent(null); setStoriesImgs([]); setReels(null);
    try {
      const quer = (alvo: Formato) => fm === "todos" || fm === alvo;
      let legendaFinalTxt = "";

      if (quer("carrossel")) {
        const r = (await chamarModo("biomech_content", ang)) as ScienceAI;
        setContent({
          exercicio: tema,
          focoLabel: `🔬 ${area}`,
          handle: at,
          capa: {
            tag: r.capa?.tag || "CIÊNCIA REAL",
            titulo: r.capa?.titulo || `${tema}: o que a ciência mostra`,
            subtitulo: r.capa?.subtitulo || "",
          },
          dado: {
            numero: r.dado?.numero || "",
            titulo: r.dado?.titulo || "O achado central",
            corpo: r.dado?.corpo || "",
          },
          pontos: (r.pontos || []).slice(0, 4).map((p) => ({ titulo: p.titulo || "", corpo: p.corpo || "" })),
          aplicacao: { titulo: r.aplicacao?.titulo || "Como aplicar na prática", corpo: r.aplicacao?.corpo || "" },
          fontes: fontesReais,
        });
        setActive(0);
        legendaFinalTxt = cleanCaption(r.legenda || "");
      }

      if (quer("reels")) {
        const r = (await chamarModo("biomech_reels", ang)) as ScienceAI;
        setReels(r);
        legendaFinalTxt = legendaFinalTxt || cleanCaption(r.legenda || "");
      }

      if (quer("stories")) {
        const r = (await chamarModo("biomech_stories", ang)) as StoryScript & { legenda?: string };
        const fonteStory = fontesReais.slice(0, 3).map(rotuloFonte).join(" · ");
        const framesRenderizados = renderStoryFrames({
          tema: r.tema,
          frames: [
            ...(r.frames || []),
            {
              tipo: "FONTES",
              texto_principal: "Conteúdo baseado em fontes verificáveis",
              texto_secundario: fonteStory,
              destaque: `${fontesReais.length} fonte${fontesReais.length === 1 ? "" : "s"} consultada${fontesReais.length === 1 ? "" : "s"}`,
            },
          ],
        }, at);
        setStoriesImgs(foto ? [foto, ...framesRenderizados] : framesRenderizados);
        legendaFinalTxt = legendaFinalTxt || cleanCaption(r.legenda || "");
      }

      setLegenda(legendaFinalTxt);
      setLegendaEditada(null);
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
    setAngulo(ang); setFormato(fm);
    void gerar(ang, fm);
  };

  const blocoFontes = fontesReais.length
    ? `Fontes:\n${fontesReais.map((fonte) => `• ${fonte}`).join("\n")}`
    : "";
  const legendaBase = legenda ? `${legenda}\n\n${blocoFontes}\n\n${CTA_SAVE}\n\n${HASHTAGS.join(" ")}` : "";
  const legendaFinal = legendaEditada ?? legendaBase;

  const slideLabels = foto
    ? [...BIOMECH_SLIDE_LABELS.slice(0, 6), "Foto", ...BIOMECH_SLIDE_LABELS.slice(6)]
    : BIOMECH_SLIDE_LABELS;

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
        <button onClick={() => aplicarSugestao(s)} disabled={loading} style={acao(cor)}>✦ GERAR AGORA</button>
      </div>
    );
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontFamily: F.t, fontSize: 18, fontWeight: 800, color: C.white, marginBottom: 14 }}>
        🔥 CONTEÚDO PARA REDES SOCIAIS
      </div>

      <Bloco titulo="💡 SUGESTÕES INTELIGENTES" cor={C.gold}>
        <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 12 }}>
          Escrito em cima da evidência real desta consulta ({fontesReais.length} fonte{fontesReais.length === 1 ? "" : "s"}) — nunca dado inventado.
        </div>
        {!ideias && (
          <button onClick={gerarSugestoes} disabled={loadingIdeias || loading} style={{ ...acao(C.gold), width: "100%" }}>
            {loadingIdeias ? "GERANDO SUGESTÕES..." : "✦ GERAR SUGESTÕES DESTE TEMA"}
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

      <Bloco titulo="📷 FOTO (OPCIONAL)" cor={C.green}>
        <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 10 }}>
          Sua foto entra após o slide de fontes do carrossel e como primeiro story.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {foto && (
            <img
              src={foto}
              alt="Foto escolhida para o post"
              style={{ width: 56, height: 70, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }}
            />
          )}
          <label style={{ ...acao(C.green), display: "inline-flex", alignItems: "center", gap: 6 }}>
            {foto ? "TROCAR FOTO" : "ADICIONAR FOTO"}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                const url = await compressImageFile(file, 1600);
                if (!url) { toast.error("Não consegui ler essa imagem."); return; }
                setFoto(url);
                toast.success("Foto adicionada — ela entra no próximo conteúdo gerado.");
              }}
            />
          </label>
          {foto && (
            <button onClick={() => setFoto(null)} style={acao(C.muted)}>REMOVER</button>
          )}
        </div>
      </Bloco>

      <Bloco titulo="OU GERE MANUALMENTE" cor={C.purple}>
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

        <div style={{ marginBottom: 12 }}>
          <DualResearchField dominioPadrao="science_hub" temaPadrao={tema} pesquisa={pesquisa} onChange={setPesquisa} disabled={loading} />
          <CarouselStyleSwitch style={style} onChange={setStyle} disabled={loading} />
        </div>

        <button onClick={() => void gerar()} disabled={loading} style={{ ...acao(C.gold), width: "100%", opacity: loading ? 0.6 : 1 }}>
          {loading ? "GERANDO..." : "✦ GERAR CONTEÚDO"}
        </button>
      </Bloco>

      {!!slides.length && (
        <Bloco titulo={`CARROSSEL PRONTO (${slides.length} SLIDES)`} cor={C.gold}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{ ...acao(i === active ? C.gold : C.muted), fontSize: 9, padding: "5px 8px" }}>
                {i + 1} · {slideLabels[i]}
              </button>
            ))}
          </div>
          {slides[active] && (
            <img src={slides[active]} alt={`Slide ${active + 1}`} style={{ width: "100%", maxWidth: 280, borderRadius: 10, display: "block", margin: "0 auto 10px" }} />
          )}
          <SaveShareButtons
            items={slides.map((url, i) => ({ url, filename: `ciencia-${i + 1}.png` }))}
            texto={legendaFinal}
          />
        </Bloco>
      )}

      {(!!slides.length || !!storiesImgs.length) && <InstagramAcoesPanel tema={tema} />}

      {!!storiesImgs.length && (
        <Bloco titulo={`STORIES PRONTOS (${storiesImgs.length})`} cor={C.green}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 10 }}>
            {storiesImgs.map((s, i) => (
              <img key={i} src={s} alt={`Story ${i + 1}`} style={{ width: 130, borderRadius: 10, flexShrink: 0 }} />
            ))}
          </div>
          <SaveShareButtons
            items={storiesImgs.map((url, i) => ({ url, filename: `ciencia-story-${i + 1}.png` }))}
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
          <div style={{ ...card, marginTop: 12, color: C.text, fontFamily: F.b, fontSize: 11 }}>
            <strong style={{ color: C.green }}>FONTES CONSULTADAS</strong>
            {fontesReais.map((fonte) => <div key={fonte} style={{ marginTop: 5, overflowWrap: "anywhere" }}>{fonte}</div>)}
          </div>
          <button
            onClick={() => copiar(`${(reels.cortes || []).map((c) => `${c.segundo}\n${c.texto_tela}\n${c.fala || ""}`).join("\n\n")}\n\n${blocoFontes}`, "Roteiro")}
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
    </div>
  );
}
