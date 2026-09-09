import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { compressImageFile } from "@/lib/socialMediaFrames";
import { cleanCaption } from "@/lib/captionText";
import { ensureFonts, loadImage, renderPhotoStory } from "@/lib/photoStoryTemplates";
import { renderMceCarousel, type MceCarouselContent } from "@/lib/mceCarouselTemplate";
import { downloadMany } from "@/lib/socialImageKit";
import ResultadoProtocoloPanel from "@/components/social/ResultadoProtocoloPanel";
import RefeicaoPanel from "@/components/social/RefeicaoPanel";

const C = {
  s1: "#0B0B12", s2: "#10101A", s3: "#181824", border: "#ffffff14",
  gold: "#EF9F27", green: "#5DCAA5", purple: "#AFA9EC",
  white: "#F0F0F8", text: "#C8C8D8", muted: "#6A6A7A", dark: "#0A0A0A",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

type StorySuggestion = {
  angulo?: string; texto_overlay?: string; subtexto?: string; potencial_viral?: number; motivo?: string;
};

export type PhotoDayResult = {
  analise?: { cenario?: string; elementos?: string[]; energia?: string; dica_foto?: string };
  stories?: {
    sugestoes?: StorySuggestion[];
    enquete?: { pergunta?: string; opcao1?: string; opcao2?: string };
    story_cta?: { texto?: string; cta?: string };
  };
  carrossel?: {
    usar_foto_capa?: boolean; texto_capa?: string; subtexto_capa?: string;
    tema_sugerido?: string; tipo?: string; potencial_viral?: number; motivo?: string;
  };
  feed_solo?: { legenda?: string; legenda_curta?: string };
  hashtags?: { alcance?: string[]; nicho?: string[]; micro?: string[] };
  timing?: { story_agora?: boolean; feed_horario?: string; motivo_horario?: string };
};

type TipoCarrossel = "auto" | "mce" | "nexus" | "nutrion" | "resultado";
const TIPO_CARROSSEL_OPTIONS: { id: TipoCarrossel; label: string }[] = [
  { id: "mce", label: "MCE Drop" },
  { id: "nexus", label: "NEXUS-BIO" },
  { id: "nutrion", label: "nutriON" },
  { id: "resultado", label: "🏆 RESULTADO + PROTOCOLO" },
];

const MCE_SLIDE_LABELS = ["CAPA", "A DOR", "PILAR M", "PILAR C", "PILAR E", "INTEGRAÇÃO", "CTA"];

/** Conteúdo padrão do carrossel MCE enquanto a IA não personaliza os slides 2-7. */
const mceFallback = (tema: string, capa: { titulo?: string; subtitulo?: string }): Omit<MceCarouselContent, "handle"> => ({
  tema,
  capa: { tag: "método mce", titulo: capa.titulo || `Por que **${tema}** trava o seu resultado`, subtitulo: capa.subtitulo || "" },
  dor: { tag: "o problema", titulo: "Você já sabe o que precisa fazer.", impacto: "E mesmo assim não faz.", corpo: "O problema quase nunca é **informação**. É o **sistema** que sustenta a decisão quando a motivação some — e ele nunca foi construído." },
  pilares: {
    M: { frase: "Antes de mudar a rotina, muda a **leitura**.", corpo: "A forma como você interpreta a falha define se ela vira **aprendizado** ou desistência." },
    C: { frase: "Comportamento é **ambiente**, não força de vontade.", corpo: "Reduza o número de decisões por dia e o padrão certo passa a acontecer sozinho.", lista: ["Deixe a próxima ação pronta na véspera", "Corte um gatilho por semana"] },
    E: { frase: "Execução é o que sobra num dia **ruim**.", corpo: "Um plano só é bom se você consegue cumprir a versão mínima dele em qualquer dia." },
  },
  integracao: { tag: "os 3 pilares", titulo: "Nenhum funciona **sozinho**", verbos: { M: "Enxerga", C: "Sustenta", E: "Entrega" }, conexao: "Mentalidade sem comportamento vira teoria. Comportamento sem execução vira intenção. **Transformação é sistema.**" },
});

const CHECKLIST_BASE = [
  { label: "Story com foto", min: 2 },
  { label: "Story enquete", min: 1 },
  { label: "Story CTA", min: 1 },
  { label: "Carrossel no feed", min: 1 },
  { label: "Responder comentários", min: 15 },
];

const copiar = async (texto: string, label: string) => {
  try {
    await navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado!`);
  } catch {
    toast.error("Não consegui copiar aqui.");
  }
};

const baixar = (dataUrl: string, filename: string) => {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
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

/**
 * "Postar com minha foto": o coach sobe UMA foto e sai com o dia inteiro —
 * 3 stories prontos (imagem 1080x1920 com a foto dele), capa de carrossel,
 * legenda, hashtags e horário. Tudo a partir da leitura da própria foto.
 */
export default function PhotoDayStudio({ tema, handle, onClose }: { tema?: string; handle?: string; onClose: () => void }) {
  const navigate = useNavigate();
  const galeriaRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<PhotoDayResult | null>(null);
  /** A foto é de comida quando a leitura da imagem devolve o cenário "refeicao". */
  const ehRefeicao = /refei|comida|prato|alimenta/i.test(res?.analise?.cenario || "");
  const [stories, setStories] = useState<string[]>([]);
  const [ativo, setAtivo] = useState(0);
  const [tipoCarrossel, setTipoCarrossel] = useState<TipoCarrossel>("auto");
  const [carrosselImages, setCarrosselImages] = useState<string[]>([]);
  const [carrosselAtivo, setCarrosselAtivo] = useState(0);
  const [carrosselLoading, setCarrosselLoading] = useState(false);
  const [checklist, setChecklist] = useState<boolean[]>([]);
  const at = handle || "diogo.mell0";

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const hashtags = useMemo(() => {
    const h = res?.hashtags;
    return [...(h?.alcance || []), ...(h?.nicho || []), ...(h?.micro || [])].join(" ");
  }, [res]);

  const tipoCarrosselHint = (tipo: TipoCarrossel): string => {
    if (tipo === "mce") return "O coach escolheu o tipo de carrossel MCE Drop — sugira carrossel.tipo = MCE.";
    if (tipo === "nexus")
      return "O coach escolheu o tipo de carrossel NEXUS-BIO — sugira carrossel.tipo = NEXUS_PEPTIDEO ou NEXUS_MICROBIOTA, o que fizer mais sentido pela foto.";
    if (tipo === "nutrion")
      return "O coach escolheu o tipo de carrossel nutriON — carrossel.tipo = MCE, mas o tema_sugerido precisa ser sobre nutrição/alimentação prática.";
    return "";
  };

  const analisar = async (f: File) => {
    setFile(f);
    setRes(null);
    setStories([]);
    setCarrosselImages([]);
    setChecklist(CHECKLIST_BASE.map(() => false));
    setLoading(true);
    try {
      const base64 = await compressImageFile(f, 1024);
      if (!base64) throw new Error("Não consegui ler essa foto.");
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: {
          mode: "photo_all", topic: tema || "conteúdo do dia", handle: at, images: [base64],
          notes: tipoCarrosselHint(tipoCarrossel) || undefined,
        },
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error?: string }).error!);
      const result = (data as { result: PhotoDayResult }).result || {};
      setRes(result);

      await ensureFonts();
      const img = await loadImage(f);
      const sugestoes = (result.stories?.sugestoes || []).slice(0, 3);
      setStories(
        sugestoes.map((s) =>
          renderPhotoStory(img, "FRASE", { frase: s.texto_overlay || "", subtexto: s.subtexto || "" }, at),
        ),
      );
      setAtivo(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar o conteúdo agora.");
    } finally {
      setLoading(false);
    }
  };

  /** Gera os 7 slides do carrossel MCE com a foto real do coach na capa (slide 1). */
  const gerarCarrosselInline = async () => {
    if (!file || !res?.carrossel) return;
    const temaCarrossel = res.carrossel.tema_sugerido || tema || "método MCE";
    setCarrosselLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: { mode: "mce_carousel", topic: temaCarrossel, handle: at },
      });
      if (error) throw new Error(error.message);
      const gerado = (data as { result?: Partial<MceCarouselContent> })?.result || {};
      const base = mceFallback(temaCarrossel, { titulo: res.carrossel.texto_capa, subtitulo: res.carrossel.subtexto_capa });
      const content: MceCarouselContent = {
        ...base,
        ...gerado,
        tema: temaCarrossel,
        capa: {
          tag: gerado.capa?.tag || base.capa.tag,
          titulo: res.carrossel.texto_capa || gerado.capa?.titulo || base.capa.titulo,
          subtitulo: res.carrossel.subtexto_capa || gerado.capa?.subtitulo || base.capa.subtitulo,
        },
        handle: at,
      };
      await ensureFonts();
      const img = await loadImage(file);
      setCarrosselImages(renderMceCarousel(content, img));
      setCarrosselAtivo(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar os slides agora.");
    } finally {
      setCarrosselLoading(false);
    }
  };

  const sugestoes = res?.stories?.sugestoes || [];
  const legenda = cleanCaption(res?.feed_solo?.legenda);

  return (
    <div style={{ background: C.s1, border: `1px solid ${C.gold}44`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.gold }}>POSTAR COM MINHA FOTO</div>
          <div style={{ fontFamily: F.t, fontSize: 16, fontWeight: 700, color: C.white }}>Uma foto, o conteúdo do dia inteiro</div>
        </div>
        <button onClick={onClose} style={acao(C.muted)}>FECHAR</button>
      </div>

      <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.muted, marginBottom: 6 }}>
        TIPO DE CARROSSEL
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {TIPO_CARROSSEL_OPTIONS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTipoCarrossel((cur) => (cur === t.id ? "auto" : t.id))}
            style={acao(tipoCarrossel === t.id ? C.gold : C.muted)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {([
        { ref: inputRef, capture: "environment" as const },
        { ref: galeriaRef, capture: undefined },
      ]).map((cfg, i) => (
        <input
          key={i}
          ref={cfg.ref}
          type="file"
          accept="image/*"
          capture={cfg.capture}
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            if (tipoCarrossel === "resultado") {
              setFile(f);
              setRes(null);
              setStories([]);
            } else {
              void analisar(f);
            }
          }}
        />
      ))}

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={() => galeriaRef.current?.click()} disabled={loading} style={{ ...acao(C.gold), flex: 1, opacity: loading ? 0.6 : 1 }}>
          {loading ? "LENDO SUA FOTO..." : file ? "🖼️ TROCAR DO ÁLBUM" : "🖼️ ESCOLHER DO ÁLBUM"}
        </button>
        <button onClick={() => inputRef.current?.click()} disabled={loading} style={{ ...acao(C.gold), flex: 1, opacity: loading ? 0.6 : 1 }}>
          📷 TIRAR FOTO AGORA
        </button>
      </div>


      {tipoCarrossel === "resultado" && (
        <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 12 }}>
          Conecte sua evolução com o protocolo que você usou. Prova real.
        </div>
      )}

      {photoUrl && !stories.length && (
        <img src={photoUrl} alt="Foto enviada pelo coach" style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 10, marginBottom: 12 }} />
      )}

      {tipoCarrossel === "resultado" && file && <ResultadoProtocoloPanel file={file} handle={at} />}

      {tipoCarrossel !== "resultado" && ehRefeicao && file && (
        <div style={{ marginBottom: 12 }}>
          <RefeicaoPanel file={file} handle={at} />
        </div>
      )}

      {tipoCarrossel !== "resultado" && res && (

        <>
          <Bloco titulo="LEITURA DA FOTO" cor={C.green}>
            <div style={{ fontFamily: F.b, fontSize: 12, color: C.text, marginBottom: 6 }}>
              {(res.analise?.cenario || "").replace(/_/g, " ")} · {res.analise?.energia}
            </div>
            <div style={{ fontFamily: F.b, fontSize: 11, color: C.muted, marginBottom: 6 }}>
              {(res.analise?.elementos || []).join(" · ")}
            </div>
            <div style={{ fontFamily: F.b, fontSize: 11, color: C.gold }}>{res.analise?.dica_foto}</div>
          </Bloco>

          {!!stories.length && (
            <Bloco titulo="STORIES PRONTOS (3 ÂNGULOS)" cor={C.gold}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                {sugestoes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setAtivo(i)}
                    style={{
                      ...acao(i === ativo ? C.gold : C.muted),
                      fontSize: 10,
                    }}
                  >
                    {(s.angulo || `OPÇÃO ${i + 1}`).toUpperCase()} · {s.potencial_viral ?? "-"}/10
                  </button>
                ))}
              </div>
              {stories[ativo] && (
                <img src={stories[ativo]} alt="Story gerado com a foto do coach" style={{ width: "100%", maxWidth: 260, borderRadius: 10, display: "block", marginBottom: 10 }} />
              )}
              <div style={{ fontFamily: F.b, fontSize: 11, color: C.muted, marginBottom: 10 }}>{sugestoes[ativo]?.motivo}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => baixar(stories[ativo], `story-${ativo + 1}.png`)} style={acao(C.gold)}>BAIXAR ESTE STORY</button>
                <button onClick={() => stories.forEach((s, i) => baixar(s, `story-${i + 1}.png`))} style={acao(C.green)}>BAIXAR OS 3</button>
              </div>
            </Bloco>
          )}

          <Bloco titulo="ENQUETE + CTA DO STORY" cor={C.purple}>
            <div style={{ fontFamily: F.b, fontSize: 12, color: C.white }}>{res.stories?.enquete?.pergunta}</div>
            <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, margin: "6px 0 10px" }}>
              {res.stories?.enquete?.opcao1} · {res.stories?.enquete?.opcao2}
            </div>
            <button
              onClick={() => copiar(`${res.stories?.enquete?.pergunta}\n${res.stories?.enquete?.opcao1} · ${res.stories?.enquete?.opcao2}`, "Enquete")}
              style={{ ...acao(C.purple), marginBottom: 12 }}
            >
              COPIAR ENQUETE
            </button>
            <div style={{ fontFamily: F.b, fontSize: 12, color: C.white }}>{res.stories?.story_cta?.texto}</div>
            <div style={{ fontFamily: F.b, fontSize: 11, color: C.gold, marginBottom: 10 }}>{res.stories?.story_cta?.cta}</div>
            <button
              onClick={() => copiar(`${res.stories?.story_cta?.texto}\n${res.stories?.story_cta?.cta}`, "Story CTA")}
              style={acao(C.gold)}
            >
              COPIAR STORY CTA
            </button>
          </Bloco>

          <Bloco titulo="CARROSSEL COM SUA FOTO NA CAPA" cor={C.green}>
            <div style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: C.white }}>{res.carrossel?.texto_capa}</div>
            <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 8 }}>{res.carrossel?.subtexto_capa}</div>
            <div style={{ fontFamily: F.b, fontSize: 11, color: C.muted, marginBottom: 10 }}>
              Tema: {res.carrossel?.tema_sugerido} · {res.carrossel?.tipo} · {res.carrossel?.potencial_viral ?? "-"}/10 — {res.carrossel?.motivo}
            </div>

            {(res.carrossel?.tipo || "MCE") === "MCE" ? (
              <>
                {!carrosselImages.length && (
                  <button onClick={gerarCarrosselInline} disabled={carrosselLoading} style={{ ...acao(C.green), opacity: carrosselLoading ? 0.6 : 1 }}>
                    {carrosselLoading ? "GERANDO SLIDES..." : "✦ GERAR SLIDES"}
                  </button>
                )}
                {!!carrosselImages.length && (
                  <>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                      {carrosselImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCarrosselAtivo(i)}
                          style={{ ...acao(i === carrosselAtivo ? C.green : C.muted), fontSize: 9, padding: "5px 8px" }}
                        >
                          {i + 1} · {MCE_SLIDE_LABELS[i]}
                        </button>
                      ))}
                    </div>
                    {carrosselImages[carrosselAtivo] && (
                      <img
                        src={carrosselImages[carrosselAtivo]}
                        alt={`Slide ${carrosselAtivo + 1} — ${MCE_SLIDE_LABELS[carrosselAtivo]}`}
                        style={{ width: "100%", maxWidth: 260, borderRadius: 10, display: "block", margin: "0 auto 10px" }}
                      />
                    )}
                    <button
                      onClick={() =>
                        downloadMany(
                          carrosselImages.map((url, i) => ({
                            url, filename: `carrossel-mce-${i + 1}-${(MCE_SLIDE_LABELS[i] || "").toLowerCase().replace(/\s+/g, "-")}.png`,
                          })),
                        )
                      }
                      style={acao(C.green)}
                    >
                      BAIXAR OS {carrosselImages.length} SLIDES
                    </button>
                  </>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  const tipo = res.carrossel?.tipo || "MCE";
                  const aba = tipo === "MCE" ? "carrossel_mce" : "carrossel_nexus";
                  navigate(`/coach/social?tab=${aba}&tema=${encodeURIComponent(res.carrossel?.tema_sugerido || tema || "")}`);
                }}
                style={acao(C.green)}
              >
                GERAR ESTE CARROSSEL
              </button>
            )}
          </Bloco>

          <Bloco titulo="LEGENDA DO FEED" cor={C.gold}>
            <div style={{ fontFamily: F.b, fontSize: 12, color: C.text, whiteSpace: "pre-wrap", marginBottom: 10 }}>{legenda}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => copiar(legenda, "Legenda")} style={acao(C.gold)}>COPIAR LEGENDA</button>
              <button onClick={() => copiar(cleanCaption(res.feed_solo?.legenda_curta), "Texto curto")} style={acao(C.purple)}>COPIAR VERSÃO CURTA</button>
            </div>
          </Bloco>

          <Bloco titulo="HASHTAGS" cor={C.purple}>
            <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 10 }}>{hashtags}</div>
            <button onClick={() => copiar(hashtags, "Hashtags")} style={acao(C.purple)}>COPIAR HASHTAGS</button>
          </Bloco>

          <Bloco titulo="QUANDO POSTAR" cor={C.green}>
            <div style={{ fontFamily: F.b, fontSize: 12, color: C.white }}>
              Story: {res.timing?.story_agora ? "agora" : "mais tarde"} · Feed: {res.timing?.feed_horario}
            </div>
            <div style={{ fontFamily: F.b, fontSize: 11, color: C.muted }}>{res.timing?.motivo_horario}</div>
          </Bloco>

          <Bloco titulo="✅ CHECKLIST DO DIA" cor={C.gold}>
            {CHECKLIST_BASE.map((item, i) => {
              const feito = !!checklist[i];
              const label = item.label === "Carrossel no feed" && res.timing?.feed_horario
                ? `${item.label} às ${res.timing.feed_horario}`
                : item.label;
              return (
                <label
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={feito}
                    onChange={() => setChecklist((cur) => cur.map((v, idx) => (idx === i ? !v : v)))}
                    style={{ accentColor: C.gold, width: 15, height: 15 }}
                  />
                  <span
                    style={{
                      fontFamily: F.b, fontSize: 12, color: feito ? C.muted : C.text,
                      textDecoration: feito ? "line-through" : "none", flex: 1,
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{item.min}min</span>
                </label>
              );
            })}
            <div style={{ fontFamily: F.m, fontSize: 10, color: C.gold, marginTop: 6 }}>
              ⏱️ Tempo total: ~{CHECKLIST_BASE.reduce((sum, i) => sum + i.min, 0)} minutos
            </div>
          </Bloco>
        </>
      )}
    </div>
  );
}
