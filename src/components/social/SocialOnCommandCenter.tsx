import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { microbiotaItems } from "@/data/microbiotaVaultData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useInstagramAccount } from "@/hooks/useInstagramAccount";
import { usePublishToInstagram } from "@/hooks/usePublishToInstagram";
import { renderSlide, downloadMany, SOCIAL_BRAND, monogramFromHandle } from "@/lib/socialImageKit";
import { compressImageFile, storyboardFromUrl } from "@/lib/socialMediaFrames";
import { renderMceCarousel, type MceCarouselContent } from "@/lib/mceCarouselTemplate";
import { renderStoryFrames, type StoryScript } from "@/lib/storyFrameTemplate";
import { renderMitoMetodo, type MitoMetodoContent } from "@/lib/mitoMetodoTemplate";
import { cleanCaption } from "@/lib/captionText";
import type { PosSlidesResult, TipoCarrossel } from "@/lib/carouselPostConfig";
import { montarPlanoDeHoje, totalMinutos, ICONE_DO_DIA, LEGENDA_SERIES } from "@/lib/socialWeeklyPlan";
import {
  detectarTipoConteudo, CONTENT_TYPE_LABEL, CONTENT_TYPE_MINUTES, usesMedia, isPostType, type PlanContentType,
} from "@/lib/socialContentTypes";
import PhotoStoryStudio from "@/components/social/PhotoStoryStudio";
import { sugestoesDoDia, ROTACAO_SEMANAL, FORMATO_LABEL, focoDoTreino, FOCO_LABEL } from "@/data/bancoTemas";
import { getProtocoloPreferido, getTreinoDeHoje, type TreinoHoje } from "@/lib/treinoHojeData";
import { useTemasPostados } from "@/hooks/useTemasPostados";
import PhotoDayStudio from "@/components/social/PhotoDayStudio";
import { HookChooser, ScreenTextTimeline, ViralExtras } from "@/components/social/ViralKitPanel";
import {
  analisarViralidade, melhorHorario, CTA_POR_TIPO, gerarHashtags, achatarHashtags,
  type ViralKit, type HookOption, type ViralAnalise,
} from "@/lib/socialViral";
import {
  InteractionPackCard, DmScriptsCard, StoryFramesCard, storyScriptText,
  type InteractionPack, type DmScripts,
} from "@/components/social/PlanItemOutputs";

const C = {
  bg: "#020205", s1: "#0B0B12", s2: "#10101A", s3: "#181824",
  border: "#ffffff08", cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E",
  red: "#EF4444", purple: "#A855F7", orange: "#F97316", pink: "#EC4899",
  muted: "#4A4A5A", dim: "#333340", text: "#C8C8D8", white: "#F0F0F8",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

const callSocialAI = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("social-on-generate", { body });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return (data as any).result;
};

// ═══════════════════════════════════════════════════
// DAILY AI COACH
// ═══════════════════════════════════════════════════
interface BriefAction { type?: string; title?: string; detail?: string; urgency?: string; time?: string; icon?: string; minutes?: number }
interface Brief {
  greeting?: string;
  actions?: BriefAction[];
  insight?: string;
  alerts?: { icon?: string; text?: string; color_hint?: string }[];
}

interface CarouselSlideSpec { title?: string; body?: string }
interface ReadyContent {
  hook?: string; caption?: string; hashtags?: string[]; self_comment?: string; best_time?: string;
  // gerado sem foto — cards de texto (post_package)
  carousel?: CarouselSlideSpec[]; slideImages?: string[];
  // gerado a partir de foto/vídeo real do coach (prism-analyze)
  mediaFile?: File; mediaPreview?: string; mediaKind?: "image" | "video";
  // outputs por tipo de item do plano
  kind?: PlanContentType;
  pack?: InteractionPack;
  viral?: ViralKit;
  chosenHook?: string;
  dm?: DmScripts;
  story?: StoryScript;
}

const readyText = (r: ReadyContent) => {
  if (r.story) return storyScriptText(r.story);
  const tags = r.viral?.hashtags ? achatarHashtags(r.viral.hashtags) : (r.hashtags ?? []).join(" ");
  return [r.chosenHook || r.hook, "", r.caption, r.viral?.cta_caption || "", "", tags]
    .filter((s) => s !== undefined)
    .join("\n");
};

const copyReady = (r: ReadyContent) => {
  navigator.clipboard.writeText(readyText(r));
  toast.success("Copiado — já pode colar e postar");
};

function DailyCoach({
  brief, loading, identity, coachId, canPublish, onConnectInstagram, onOpenTool,
}: {
  brief: Brief | null; loading: boolean;
  identity: { handle?: string; niches?: string[]; products?: string[]; differentials?: string[] };
  coachId?: string;
  canPublish: boolean;
  onConnectInstagram: () => void;
  onOpenTool?: (id: string) => void;
}) {
  const [ready, setReady] = useState<Record<number, ReadyContent>>({});
  const [generating, setGenerating] = useState<number | null>(null);
  const [publishingIdx, setPublishingIdx] = useState<number | null>(null);
  const { publish, publishCarousel } = usePublishToInstagram();
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const coverFileRefs = useRef<Record<number, HTMLInputElement | null>>({});
  /** Foto real escolhida por item — abre o estúdio de story com overlay. */
  const [photoStory, setPhotoStory] = useState<Record<number, File | undefined>>({});
  const [photoDay, setPhotoDay] = useState(false);

  /** Plano do dia montado pelo calendário semanal por série (rotaciona as 6 séries). */
  const planItems = useMemo<BriefAction[]>(
    () =>
      montarPlanoDeHoje().map((p) => ({
        type: "criar", title: p.title, detail: p.detail,
        urgency: p.urgency, time: p.time, icon: p.icon, minutes: p.minutes,
      })),
    [],
  );
  const totalMin = totalMinutos(planItems.map((a) => ({ minutes: a.minutes || 0 })));
  const feitos = Object.keys(ready).length;

  /** Tema do post mais recente antes deste item — contexto do pack de interação. */
  const previousPostTopic = (i: number) => {
    const actions = planItems;
    for (let k = i - 1; k >= 0; k--) {
      if (isPostType(detectarTipoConteudo({ title: actions[k]?.title, detail: actions[k]?.detail }))) {
        return [actions[k]?.title, actions[k]?.detail].filter(Boolean).join(" — ");
      }
    }
    return "";
  };

  /** Kit de viralização (hooks, texto de tela, CTA, self-comment, hashtags). */
  const fetchViralKit = async (kind: PlanContentType, topic: string): Promise<ViralKit | undefined> => {
    if (!isPostType(kind) && kind !== "STORY_CTA") return undefined;
    const fallbackCta = CTA_POR_TIPO[kind];
    try {
      const r = (await callSocialAI({
        mode: "viral_kit",
        topic,
        format: kind === "ROTEIRO_REELS" ? "reels" : "carrossel",
        ...identity,
      })) as ViralKit;
      return {
        ...r,
        cta_post: r?.cta_post || fallbackCta.no_post,
        cta_caption: r?.cta_caption || fallbackCta.no_caption,
        self_comment: r?.self_comment || fallbackCta.self_comment,
        hashtags: r?.hashtags?.alcance?.length ? r.hashtags : gerarHashtags(topic),
      };
    } catch {
      return {
        cta_post: fallbackCta.no_post,
        cta_caption: fallbackCta.no_caption,
        self_comment: fallbackCta.self_comment,
        hashtags: gerarHashtags(topic),
      };
    }
  };

  /** Legenda, comentário e hashtags específicos do universo daquele carrossel. */
  const fetchPosSlides = async (tipo: TipoCarrossel, topic: string): Promise<PosSlidesResult | undefined> => {
    try {
      const r = (await callSocialAI({ mode: "pos_slides", tipoCarrossel: tipo, topic, ...identity })) as PosSlidesResult;
      return { ...r, legenda: cleanCaption(r?.legenda) };
    } catch {
      return undefined;
    }
  };

  /** Gera o carrossel de cards; se `coverFile` vier, a capa usa sua foto real de fundo em vez do gradiente puro. */
  const generateReady = async (i: number, action: BriefAction, coverFile?: File) => {
    const kind = detectarTipoConteudo({ title: action.title, detail: action.detail });
    const topic = [action.title, action.detail].filter(Boolean).join(" — ");
    setGenerating(i);
    const viralPromise = fetchViralKit(kind, topic);
    const attachViral = async () => {
      const viral = await viralPromise;
      if (viral) setReady((p) => (p[i] ? { ...p, [i]: { ...p[i], viral } } : p));
    };
    try {
      if (kind === "PACK_INTERACAO") {
        const r = await callSocialAI({ mode: "interaction_pack", topic, postContext: previousPostTopic(i), ...identity });
        setReady((p) => ({ ...p, [i]: { kind, pack: r as InteractionPack } }));
        return;
      }
      if (kind === "GESTAO_DM") {
        const r = await callSocialAI({ mode: "dm_scripts", topic, ...identity });
        setReady((p) => ({ ...p, [i]: { kind, dm: r as DmScripts } }));
        return;
      }
      if (kind === "STORY_BASTIDOR" || kind === "STORY_CTA") {
        const r = await callSocialAI({
          mode: "story_frames", topic,
          storyKind: kind === "STORY_CTA" ? "cta" : "bastidor",
          ...identity,
        });
        const story = { tema: action.title, ...(r as StoryScript) } as StoryScript;
        const slideImages = renderStoryFrames(story, identity.handle || "diogo.mell0");
        setReady((p) => ({ ...p, [i]: { kind, story, slideImages } }));
        return;
      }
      if (kind === "MITO_METODO") {
        const [r, pos] = await Promise.all([
          callSocialAI({ mode: "mito_metodo", topic, ...identity }),
          fetchPosSlides("MITO_METODO", topic),
        ]);
        const content = { ...(r as MitoMetodoContent), handle: identity.handle || "diogo.mell0" };
        setReady((p) => ({
          ...p,
          [i]: {
            kind,
            hook: content.crenca,
            caption: pos?.legenda || (r as ReadyContent)?.caption,
            hashtags: pos?.hashtags_15 || (r as ReadyContent)?.hashtags,
            self_comment: pos?.self_comment,
            slideImages: renderMitoMetodo(content),
          },
        }));
        return;
      }
      if (kind === "CARROSSEL_MCE") {
        const [content, pkg, pos] = await Promise.all([
          callSocialAI({ mode: "mce_carousel", topic, ...identity }),
          callSocialAI({ mode: "post_package", format: "carrossel", topic, ...identity }),
          fetchPosSlides("MCE", topic),
        ]);
        const safe = { ...(content as MceCarouselContent), tema: topic, handle: identity.handle || "diogo.mell0" };
        setReady((p) => ({
          ...p,
          [i]: {
            kind,
            hook: (pkg as ReadyContent)?.hook,
            caption: pos?.legenda || (pkg as ReadyContent)?.caption,
            hashtags: pos?.hashtags_15 || (pkg as ReadyContent)?.hashtags,
            self_comment: pos?.self_comment || (pkg as ReadyContent)?.self_comment,
            slideImages: renderMceCarousel(safe),
          },
        }));
        return;
      }
      const coverImage = coverFile ? await compressImageFile(coverFile) : null;
      const r = await callSocialAI({
        mode: "post_package",
        format: "carrossel",
        topic: [action.title, action.detail].filter(Boolean).join(" — "),
        ...identity,
      });
      const slides: CarouselSlideSpec[] = (r?.carousel || []).slice(0, 6);
      // Eyebrow da capa: nicho do próprio coach quando ele preencheu o perfil
      // (multi-tenant — cada coach vê a própria identidade, nunca um método
      // fixo de outra pessoa), com um fallback genérico.
      const coverEyebrow = (identity.niches?.[0] || "AUTORIDADE").toUpperCase();
      // Marca gigante de fundo = iniciais do próprio coach, não um número de
      // slide genérico — é isso que dá "cara dele" ao card, não "cara de
      // template". Mesma lógica multi-tenant: vem do handle de quem gerou.
      const ghostMark = monogramFromHandle(identity.handle);
      const slideImages = await Promise.all(
        slides.map((s, idx) => {
          const isCover = idx === 0;
          const hasCoverPhoto = isCover && !!coverImage;
          return renderSlide({
            title: s.title || "",
            body: s.body,
            eyebrow: isCover ? coverEyebrow : `0${idx + 1}`,
            accent: isCover ? SOCIAL_BRAND.gold : SOCIAL_BRAND.cyan,
            gradient: isCover ? SOCIAL_BRAND.gradientGold : SOCIAL_BRAND.gradientCyan,
            backgroundImage: hasCoverPhoto ? coverImage : null,
            overlay: hasCoverPhoto ? "rgba(8,5,2,0.82)" : undefined,
            ghostMark,
            // Sem marca d'água — o coach pediu pra não estampar nem
            // "nutrion.app.br" nem o @handle na imagem gerada.
          });
        }),
      );
      setReady((p) => ({ ...p, [i]: { ...(r as ReadyContent), kind, carousel: slides, slideImages } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar o conteúdo");
    } finally {
      setGenerating(null);
      void attachViral();
    }
  };

  /** Gera o conteúdo a partir de uma foto/vídeo real que o coach mandou (não um card de texto). */
  const generateFromMedia = async (i: number, action: BriefAction, file: File) => {
    setGenerating(i);
    try {
      const isVideo = file.type.startsWith("video/");
      let image: string | null = null;
      let images: string[] | null = null;
      let preview: string;
      if (isVideo) {
        const url = URL.createObjectURL(file);
        const board = await storyboardFromUrl(url);
        images = board.frames;
        preview = board.frames[0];
        board.video.remove();
        URL.revokeObjectURL(url);
      } else {
        image = await compressImageFile(file);
        if (!image) throw new Error("Não consegui ler essa imagem.");
        preview = image;
      }
      const { data: res, error: fnErr } = await supabase.functions.invoke("prism-analyze", {
        body: images
          ? { mode: "social_versoes", images, from_video: true }
          : { mode: "social_versoes", image, from_video: false },
      });
      if (fnErr) throw new Error(fnErr.message);
      if ((res as { error?: string })?.error) throw new Error((res as { error?: string }).error as string);
      const versoes = ((res as { result?: { versoes?: { legenda?: string; hashtags?: string[]; self_comment?: string }[] } })?.result?.versoes || []).filter(Boolean);
      if (!versoes.length) throw new Error("A IA não devolveu nenhuma versão.");
      const v = versoes[0];
      setReady((p) => ({
        ...p,
        [i]: {
          caption: v.legenda, hashtags: v.hashtags, self_comment: v.self_comment,
          mediaFile: file, mediaPreview: preview, mediaKind: isVideo ? "video" : "image",
        },
      }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui analisar sua mídia");
    } finally {
      setGenerating(null);
    }
  };

  const downloadReady = async (i: number) => {
    const r = ready[i];
    if (!r?.slideImages?.length) return;
    const prefix = r.kind === "CARROSSEL_MCE" ? "mce-educacional" : r.kind === "MITO_METODO" ? "mito-ou-metodo" : `post-${i + 1}`;
    const n = await downloadMany(r.slideImages.map((url, idx) => ({ url, filename: `${prefix}-slide-${idx + 1}.png` })));
    if (n) toast.success(`${n} imagens baixadas!`); else toast.error("Não consegui baixar as imagens");
  };

  const publishReady = async (i: number) => {
    const r = ready[i];
    if (!coachId || !r) return;
    if (!canPublish) { onConnectInstagram(); return; }
    setPublishingIdx(i);
    try {
      const caption = [r.hook, "", r.caption, "", (r.hashtags ?? []).join(" ")].filter((s) => s !== undefined).join("\n");
      if (r.mediaFile) {
        await publish({
          coachId, file: r.mediaFile, mediaKind: r.mediaKind === "video" ? "REELS" : "IMAGE",
          caption, selfComment: r.self_comment, forceConvert: false,
        });
        toast.success("Publicado no Instagram!");
      } else if (r.slideImages?.length) {
        const blobs = await Promise.all(r.slideImages.map((url) => fetch(url).then((res) => res.blob())));
        await publishCarousel({ coachId, images: blobs, caption, selfComment: r.self_comment });
        toast.success("Carrossel publicado no Instagram!");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao publicar");
    } finally {
      setPublishingIdx(null);
    }
  };

  if (loading) {
    return (
      <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: C.cyan, letterSpacing: 2, marginBottom: 12 }}>
          GERANDO SEU BRIEFING...
        </div>
        <style>{`@keyframes ccPulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
        {["Analisando seus últimos posts", "Checando tendências do nicho", "Identificando conteúdo pra reciclar", "Calculando melhor horário"].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: C.cyan, animation: `ccPulse 1.4s ease ${i * 0.25}s infinite` }} />
            <span style={{ fontFamily: F.m, fontSize: 10, color: C.muted }}>{s}</span>
          </div>
        ))}
      </div>
    );
  }


  return (
    <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🧠</span>
          <div>
            <div style={{ fontFamily: F.m, fontSize: 8, color: C.cyan, letterSpacing: 2 }}>PLANO DE HOJE</div>
            <div style={{ fontFamily: F.t, fontSize: 16, fontWeight: 700, color: C.white }}>{brief?.greeting || "Bora executar o plano de hoje."}</div>
          </div>
        </div>
        <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>
          {new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()}
        </span>
      </div>

      {/* Postar com minha foto — gera o dia inteiro a partir de 1 foto */}
      {photoDay ? (
        <div style={{ marginBottom: 12 }}>
          <PhotoDayStudio tema={planItems[0]?.title} handle="diogo.mell0" onClose={() => setPhotoDay(false)} />
        </div>
      ) : (
        <button
          onClick={() => setPhotoDay(true)}
          style={{
            width: "100%", height: 60, marginBottom: 12, background: "#EF9F27", color: "#0A0A0A",
            border: "none", borderRadius: 12, fontFamily: F.t, fontWeight: 700, fontSize: 17, cursor: "pointer",
          }}
        >
          🖼️ POSTAR FOTO DO ÁLBUM
        </button>
      )}

      {/* Temas sugeridos pelo banco de temas — rotação da semana, sem repetir em 30 dias */}
      <TemasDoDia onOpenTool={onOpenTool} />

      {/* Sugestão da MicrobiotaVault */}
      <MicrobiotaSuggestion />


      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {planItems.map((action, i) => {
          const urgencyColors: Record<string, string> = { alta: C.orange, "média": C.cyan, baixa: C.muted };
          const typeIcons: Record<string, string> = { postar: "📤", responder: "💬", reciclar: "♻️", engajar: "⚡", analisar: "📊", criar: "✦" };
          const kind = detectarTipoConteudo({ title: action.title, detail: action.detail });
          const showMedia = usesMedia(kind, action.title);
          const minutes = action.minutes || CONTENT_TYPE_MINUTES[kind];
          const horario = melhorHorario(kind);
          return (
            <div key={i} style={{ display: "flex", gap: 10, background: C.s2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px" }}>
              <span style={{ fontSize: 16 }}>{action.icon || typeIcons[action.type || ""] || "📌"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: F.t, fontSize: 13, fontWeight: 700, color: C.white }}>{action.title}</span>
                  <span style={{ fontFamily: F.m, fontSize: 7, letterSpacing: 1, color: urgencyColors[action.urgency || ""] || C.muted, border: `1px solid ${urgencyColors[action.urgency || ""] || C.muted}40`, padding: "1px 5px", borderRadius: 4 }}>
                    {(action.urgency || "").toUpperCase()}
                  </span>
                </div>
                <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, lineHeight: 1.4 }}>{action.detail}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                  <span style={{ fontFamily: F.m, fontSize: 9, color: C.gold }}>⏰ {horario.hora} — {horario.motivo}</span>
                  <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>⏱️ ~{minutes}min</span>
                </div>

                {action.type !== "analisar" && !ready[i] && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => generateReady(i, action)}
                      disabled={generating === i}
                      style={{
                        padding: "6px 12px", background: `${C.cyan}12`, border: `1px solid ${C.cyan}40`,
                        borderRadius: 6, cursor: generating === i ? "default" : "pointer", fontFamily: F.t,
                        fontSize: 11, fontWeight: 700, color: C.cyan, opacity: generating === i ? 0.6 : 1,
                      }}
                    >
                      {generating === i ? "Gerando..." : CONTENT_TYPE_LABEL[kind]}
                    </button>
                    {showMedia && (<>
                    <input
                      ref={(el) => { fileRefs.current[i] = el; }}
                      type="file"
                      accept="image/*,video/*"
                      style={{ display: "none" }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) generateFromMedia(i, action, f); e.target.value = ""; }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.current[i]?.click()}
                      disabled={generating === i}
                      style={{
                        padding: "6px 12px", background: `${C.gold}12`, border: `1px solid ${C.gold}40`,
                        borderRadius: 6, cursor: generating === i ? "default" : "pointer", fontFamily: F.t,
                        fontSize: 11, fontWeight: 700, color: C.gold, opacity: generating === i ? 0.6 : 1,
                      }}
                    >
                      📷 USAR MINHA FOTO/VÍDEO
                    </button>
                    <input
                      ref={(el) => { coverFileRefs.current[i] = el; }}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhotoStory((p) => ({ ...p, [i]: f })); e.target.value = ""; }}
                    />
                    <button
                      type="button"
                      onClick={() => coverFileRefs.current[i]?.click()}
                      title="Sua foto real com overlay nutriON — story 1080x1920 pronto pra postar"
                      style={{
                        padding: "6px 12px", background: `${C.purple}12`, border: `1px solid ${C.purple}40`,
                        borderRadius: 6, cursor: generating === i ? "default" : "pointer", fontFamily: F.t,
                        fontSize: 11, fontWeight: 700, color: C.purple, opacity: generating === i ? 0.6 : 1,
                      }}
                    >
                      🖼️ CAPA COM SUA FOTO
                    </button>
                    </>)}
                  </div>
                )}

                {photoStory[i] && (
                  <PhotoStoryStudio
                    file={photoStory[i]!}
                    tema={[action.title, action.detail].filter(Boolean).join(" — ")}
                    handle={identity.handle}
                    onClose={() => setPhotoStory((p) => ({ ...p, [i]: undefined }))}
                  />
                )}

                {ready[i]?.pack && (
                  <div style={{ marginTop: 8 }}>
                    <InteractionPackCard pack={ready[i].pack!} time={action.time} />
                  </div>
                )}

                {ready[i]?.dm && (
                  <div style={{ marginTop: 8 }}>
                    <DmScriptsCard data={ready[i].dm!} time={action.time} />
                  </div>
                )}

                {ready[i]?.story && (
                  <div style={{ marginTop: 8 }}>
                    <StoryFramesCard
                      script={ready[i].story!}
                      images={ready[i].slideImages || []}
                      title={kind === "STORY_CTA" ? "STORIES CTA" : "STORIES BASTIDOR"}
                      time={action.time}
                    />
                  </div>
                )}

                {ready[i] && !ready[i].pack && !ready[i].dm && !ready[i].story && (
                  <div style={{ marginTop: 8, background: C.s3, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                    {ready[i].kind === "CARROSSEL_MCE" && (
                      <div style={{ fontFamily: F.m, fontSize: 8, color: C.gold, letterSpacing: 1, marginBottom: 8 }}>
                        MCE EDUCACIONAL · 7 SLIDES · MODELO OFICIAL
                      </div>
                    )}
                    {!!ready[i].slideImages?.length && (
                      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 8, paddingBottom: 2 }}>
                        {ready[i].slideImages!.map((url, idx) => (
                          <img key={idx} src={url} alt={`Slide ${idx + 1}`} style={{ width: 72, height: 90, objectFit: "cover", borderRadius: 6, flexShrink: 0, border: `1px solid ${C.border}` }} />
                        ))}
                      </div>
                    )}
                    {ready[i].mediaPreview && (
                      <div style={{ marginBottom: 8 }}>
                        <img src={ready[i].mediaPreview} alt="Sua mídia" style={{ width: 90, height: 112, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.border}` }} />
                      </div>
                    )}
                    <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                      {readyText(ready[i])}
                    </div>

                    {!!ready[i].viral?.hooks?.length && (
                      <HookChooser
                        hooks={ready[i].viral!.hooks as HookOption[]}
                        selected={ready[i].chosenHook}
                        onSelect={(h) => setReady((p) => ({ ...p, [i]: { ...p[i], chosenHook: h.texto } }))}
                      />
                    )}
                    {kind === "ROTEIRO_REELS" && !!ready[i].viral?.cortes?.length && (
                      <ScreenTextTimeline cortes={ready[i].viral!.cortes!} />
                    )}
                    {ready[i].viral && <ViralExtras kit={ready[i].viral!} />}

                    {(() => {
                      const a = analisarViralidade(readyText(ready[i]), {
                        formato: kind === "ROTEIRO_REELS" ? "reels" : "carousel",
                        slides: ready[i].slideImages?.length,
                        temTextoTela: !!ready[i].viral?.cortes?.length,
                      });
                      const cor = a.nivel === "VIRAL" ? C.green : a.nivel === "BOM" ? C.gold : C.orange;
                      return (
                        <div style={{ marginTop: 10, background: `${cor}08`, border: `1px solid ${cor}30`, borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: F.t, fontSize: 16, fontWeight: 700, color: cor }}>{a.score}/100</span>
                            <span style={{ fontFamily: F.m, fontSize: 9, color: cor, letterSpacing: 1 }}>
                              {a.nivel}{a.nivel === "VIRAL" ? " 🔥" : ""}
                            </span>
                          </div>
                          <div style={{ height: 4, background: C.s2, borderRadius: 2, marginTop: 5 }}>
                            <div style={{ height: "100%", width: `${a.score}%`, background: cor, borderRadius: 2 }} />
                          </div>
                          {a.melhorias.slice(0, 3).map((m) => (
                            <div key={m} style={{ fontFamily: F.b, fontSize: 10, color: C.text, marginTop: 4 }}>⚠️ {m}</div>
                          ))}
                        </div>
                      );
                    })()}
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => copyReady(ready[i])}
                        style={{ flex: 1, minWidth: 90, padding: "6px 0", background: C.cyan, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: F.t, fontSize: 11, fontWeight: 700, color: C.bg }}
                      >
                        COPIAR TEXTO
                      </button>
                      {!!ready[i].slideImages?.length && (
                        <button
                          type="button"
                          onClick={() => downloadReady(i)}
                          style={{ flex: 1, minWidth: 90, padding: "6px 0", background: C.gold, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: F.t, fontSize: 11, fontWeight: 700, color: C.bg }}
                        >
                          BAIXAR IMAGENS
                        </button>
                      )}
                      {(ready[i].mediaFile || (ready[i].slideImages?.length ?? 0) >= 2) && (
                        <button
                          type="button"
                          onClick={() => publishReady(i)}
                          disabled={publishingIdx === i}
                          style={{ flex: 1, minWidth: 120, padding: "6px 0", background: canPublish ? C.green : "transparent", border: canPublish ? "none" : `1px solid ${C.green}60`, borderRadius: 6, cursor: publishingIdx === i ? "default" : "pointer", fontFamily: F.t, fontSize: 11, fontWeight: 700, color: canPublish ? "#02150E" : C.green, opacity: publishingIdx === i ? 0.6 : 1 }}
                        >
                          {publishingIdx === i ? "Publicando..." : canPublish ? (ready[i].mediaFile ? "PUBLICAR" : "PUBLICAR CARROSSEL") : "CONECTAR E PUBLICAR"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => (ready[i].mediaFile ? generateFromMedia(i, action, ready[i].mediaFile!) : generateReady(i, action))}
                        disabled={generating === i}
                        style={{ padding: "6px 10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, cursor: "pointer", fontFamily: F.m, fontSize: 10, color: C.muted }}
                      >
                        outra versão
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total do dia */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: F.m, fontSize: 10, color: feitos >= planItems.length ? C.green : C.muted }}>
          ✅ {feitos}/{planItems.length} completos
        </span>
        <span style={{ fontFamily: F.m, fontSize: 10, color: C.gold }}>⏱️ Total: ~{totalMin}min</span>
      </div>

      {/* Insight */}
      {brief?.insight && (
        <div style={{ marginTop: 12, background: `${C.cyan}08`, borderLeft: `2px solid ${C.cyan}`, padding: "8px 12px", display: "flex", gap: 8 }}>
          <span>💡</span>
          <span style={{ fontFamily: F.b, fontSize: 11, color: C.text, lineHeight: 1.5 }}>{brief.insight}</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// CONTENT SCORE WIDGET
// ═══════════════════════════════════════════════════
interface ContentScoreResult {
  total_score?: number;
  breakdown?: { share?: number; hook?: number; seo?: number; save?: number };
  verdict?: "PUBLICAR" | "OTIMIZAR" | "REFAZER";
  top_fix?: string;
  optimized_hook?: string;
}

function ContentScore() {
  const [text, setText] = useState("");
  const [format, setFormat] = useState("reels");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<ContentScoreResult | null>(null);
  const [err, setErr] = useState("");

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setErr("");
    try {
      const r = await callSocialAI({ mode: "content_score", format, content: text });
      setScore(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao analisar");
    }
    setLoading(false);
  };

  const local: ViralAnalise | null = text.trim().length > 10
    ? analisarViralidade(text, { formato: format as "reels" | "carousel" | "feed" | "stories" })
    : null;
  const localColor = local ? (local.nivel === "VIRAL" ? C.green : local.nivel === "BOM" ? C.gold : C.orange) : C.muted;

  const verdictColors: Record<string, string> = { PUBLICAR: C.green, OTIMIZAR: C.gold, REFAZER: C.red };
  const scoreColor = (s?: number) => (s ?? 0) >= 75 ? C.green : (s ?? 0) >= 50 ? C.gold : (s ?? 0) >= 25 ? C.orange : C.red;

  return (
    <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>✦</span>
        <span style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: C.white }}>Content Score</span>
        <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>— teste antes de postar</span>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {[{ id: "reels", l: "Reels" }, { id: "carousel", l: "Carrossel" }, { id: "feed", l: "Feed" }, { id: "stories", l: "Stories" }].map((f) => (
          <button key={f.id} type="button" onClick={() => setFormat(f.id)} style={{
            flex: 1, padding: "6px", background: format === f.id ? `${C.cyan}10` : C.s3,
            border: `1px solid ${format === f.id ? `${C.cyan}40` : C.border}`, borderRadius: 6,
            cursor: "pointer", fontFamily: F.m, fontSize: 8, color: format === f.id ? C.cyan : C.dim,
          }}>{f.l}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole a caption ou script pra testar..."
          style={{
            flex: 1, minHeight: 52, padding: 10, background: C.s2, border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.text, fontFamily: F.b, fontSize: 12, resize: "none",
          }}
        />
        <button type="button" onClick={analyze} disabled={!text.trim() || loading} style={{
          width: 64, background: !text.trim() ? C.dim : C.cyan, border: "none", borderRadius: 8,
          cursor: !text.trim() ? "not-allowed" : "pointer", fontFamily: F.t, fontSize: 14, fontWeight: 700,
          color: C.bg, opacity: loading ? 0.6 : 1,
        }}>{loading ? "..." : "TESTAR"}</button>
      </div>
      {err && <div style={{ fontFamily: F.m, fontSize: 9, color: C.red, marginTop: 6 }}>{err}</div>}

      {local && (
        <div style={{ marginTop: 10, background: `${localColor}08`, border: `1px solid ${localColor}30`, borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: F.t, fontSize: 22, fontWeight: 700, color: localColor }}>{local.score}</span>
            <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>/ 100 ·</span>
            <span style={{ fontFamily: F.m, fontSize: 10, color: localColor, letterSpacing: 1 }}>
              {local.nivel}{local.nivel === "VIRAL" ? " 🔥" : ""}
            </span>
          </div>
          <div style={{ height: 5, background: C.s3, borderRadius: 3, marginTop: 6 }}>
            <div style={{ height: "100%", width: `${local.score}%`, background: localColor, borderRadius: 3, transition: "width .5s" }} />
          </div>
          <div style={{ marginTop: 8 }}>
            {local.checks.filter((c) => c.ok).slice(0, 3).map((c) => (
              <div key={c.label} style={{ fontFamily: F.b, fontSize: 10, color: C.text, marginTop: 2 }}>✅ {c.label}</div>
            ))}
            {local.melhorias.slice(0, 3).map((m) => (
              <div key={m} style={{ fontFamily: F.b, fontSize: 10, color: C.text, marginTop: 2 }}>⚠️ {m}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button type="button" onClick={analyze} disabled={loading} style={{
              flex: 1, padding: "6px 0", background: "transparent", border: `1px solid ${C.cyan}40`, borderRadius: 6,
              cursor: "pointer", fontFamily: F.t, fontSize: 11, fontWeight: 700, color: C.cyan,
            }}>🔄 MELHORAR</button>
            <span style={{
              flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 6, fontFamily: F.t, fontSize: 11,
              fontWeight: 700, color: local.score >= 80 ? "#02150E" : C.bg,
              background: local.score >= 80 ? C.green : local.score >= 60 ? C.gold : C.orange,
            }}>
              {local.score >= 80 ? "🔥 PRONTO PRA VIRALIZAR" : local.score >= 60 ? "PODE POSTAR" : "SCORE BAIXO — MELHORAR?"}
            </span>
          </div>
        </div>
      )}

      {score && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Score circle */}
            <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
              <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={32} cy={32} r={26} fill="none" stroke={C.s3} strokeWidth={4} />
                <circle cx={32} cy={32} r={26} fill="none" stroke={scoreColor(score.total_score)} strokeWidth={4}
                  strokeDasharray={2 * Math.PI * 26} strokeDashoffset={2 * Math.PI * 26 * (1 - (score.total_score ?? 0) / 100)}
                  style={{ transition: "stroke-dashoffset 1s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: scoreColor(score.total_score) }}>{score.total_score ?? 0}</span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: F.t, fontSize: 16, fontWeight: 700, letterSpacing: 1,
                color: verdictColors[score.verdict || ""] || C.muted, marginBottom: 4,
              }}>{score.verdict}</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 3 }}>
                {([{ k: "share", l: "Share" }, { k: "hook", l: "Hook" }, { k: "seo", l: "SEO" }, { k: "save", l: "Save" }] as const).map(({ k, l }) => {
                  const v = score.breakdown?.[k] ?? 0;
                  return (
                    <div key={k}>
                      <div style={{ fontFamily: F.m, fontSize: 7, color: C.dim, marginBottom: 2 }}>{l}</div>
                      <div style={{ height: 3, background: C.s3 }}>
                        <div style={{ height: "100%", width: `${v}%`, background: scoreColor(v), transition: "width .8s" }} />
                      </div>
                      <div style={{ fontFamily: F.m, fontSize: 8, color: scoreColor(v), marginTop: 1 }}>{v}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {score.top_fix && (
            <div style={{ marginTop: 8, background: `${C.orange}06`, borderLeft: `2px solid ${C.orange}`, padding: "6px 10px" }}>
              <span style={{ fontFamily: F.b, fontSize: 10, color: C.orange }}>{score.top_fix}</span>
            </div>
          )}
          {score.optimized_hook && (
            <div style={{ marginTop: 4, background: `${C.green}06`, borderLeft: `2px solid ${C.green}`, padding: "6px 10px" }}>
              <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted }}>HOOK OTIMIZADO →</span>
              <span style={{ fontFamily: F.b, fontSize: 11, color: C.green, marginLeft: 4 }}>"{score.optimized_hook}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// QUICK ACTIONS
// ═══════════════════════════════════════════════════
function QuickActions({ onOpenTool }: { onOpenTool?: (id: string) => void }) {
  const actions = [
    { icon: "🎬", label: "Novo vídeo", desc: "Studio Pro", color: C.cyan, tool: "studio" },
    { icon: "📊", label: "Trend Radar", desc: "O que tá em alta", color: C.orange, tool: "viral_lab" },
    { icon: "♻️", label: "Reciclar", desc: "1 conteúdo → 10 formatos", color: C.green, tool: "repurposer" },
    { icon: "💬", label: "Comentários", desc: "Scripts de DM", color: C.purple, tool: "dm" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
      {actions.map((a, i) => (
        <button key={i} type="button" onClick={() => a.tool && onOpenTool?.(a.tool)} style={{
          background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10,
          padding: "14px 8px", cursor: "pointer", textAlign: "center", transition: "all 0.2s",
        }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>{a.icon}</div>
          <div style={{ fontFamily: F.t, fontSize: 12, fontWeight: 700, color: C.white }}>{a.label}</div>
          <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, marginTop: 2 }}>{a.desc}</div>
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// WEEKLY MINI CHART
// ═══════════════════════════════════════════════════
function WeekChart({ posted }: { posted: boolean[] }) {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;
  const count = posted.filter(Boolean).length;
  return (
    <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2 }}>ESTA SEMANA</span>
        <span style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: C.cyan }}>{count}/7 <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>posts</span></span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {days.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              height: 32, background: posted[i] ? `${C.green}20` : i <= todayIdx ? `${C.red}10` : C.s3,
              border: `1px solid ${posted[i] ? `${C.green}30` : i <= todayIdx && !posted[i] ? `${C.red}20` : C.border}`,
              borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4,
            }}>
              {posted[i] ? <span style={{ fontSize: 14 }}>{ICONE_DO_DIA(i)}</span>
                : i <= todayIdx ? <span style={{ fontSize: 13, opacity: 0.35, filter: "grayscale(1)" }}>{ICONE_DO_DIA(i)}</span>
                : <span style={{ fontSize: 12, opacity: 0.2, filter: "grayscale(1)" }}>{ICONE_DO_DIA(i)}</span>}
            </div>
            <span style={{ fontFamily: F.m, fontSize: 8, color: i === todayIdx ? C.cyan : C.dim }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {LEGENDA_SERIES.map((s) => (
          <span key={s.id} style={{ fontFamily: F.m, fontSize: 8, color: C.dim }}>{s.icon} {s.nome}</span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ZONE CARD (navigation)
// ═══════════════════════════════════════════════════
function ZoneCard({ icon, name, desc, color, count, onClick }: {
  icon: string; name: string; desc: string; color: string; count?: string; onClick?: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <button type="button" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick}
      style={{
        background: h ? `${color}06` : C.s1, border: `1px solid ${h ? `${color}30` : C.border}`,
        borderRadius: 10, padding: "16px", cursor: "pointer", textAlign: "left",
        transition: "all 0.2s", position: "relative", overflow: "hidden", width: "100%",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: C.white }}>{name}</span>
            {count && <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted }}>{count}</span>}
          </span>
          <span style={{ display: "block", fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 2 }}>{desc}</span>
        </span>
        <span style={{ color: h ? color : C.dim, fontFamily: F.t, fontSize: 18, transition: "color 0.2s" }}>→</span>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════
// MAIN COMMAND CENTER
// ═══════════════════════════════════════════════════
interface Props {
  handle?: string;
  niches?: string[];
  products?: string[];
  differentials?: string[];
  stats?: { label: string; value: string; color: string }[];
  weekPosted?: boolean[];
  onOpenTool?: (id: string) => void;
}

export default function SocialOnCommandCenter({ handle, niches, products, differentials, stats, weekPosted, onOpenTool }: Props) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [briefLoading, setBriefLoading] = useState(true);
  const identity = { handle, niches, products, differentials };
  const { user } = useAuth();
  const coachId = user?.id;
  const ig = useInstagramAccount(!!coachId);
  const canPublish = !!ig.account && ig.account.source !== "screenshot";

  useEffect(() => {
    (async () => {
      try {
        const r = await callSocialAI({
          mode: "daily_brief",
          handle: handle || "",
          today: new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
        });
        setBrief(r);
      } catch {
        setBrief(null);
      }
      setBriefLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alertColors: Record<string, string> = { green: C.green, cyan: C.cyan, orange: C.orange };
  const zones = [
    { icon: "🎬", name: "Studio", desc: "Criar, editar, legendar, otimizar", color: C.cyan, count: "All-in-one", tool: "studio" },
    { icon: "♟️", name: "Strategy", desc: "DNA, pilares, auditoria, métricas", color: C.gold, count: "8 tools", tool: "intelligence" },
    { icon: "📅", name: "Planner", desc: "Calendário, grid, trends, reciclagem", color: C.green, count: "6 tools", tool: "calendario" },
    { icon: "📈", name: "Growth", desc: "DMs, CTAs, collabs, conversão", color: C.orange, count: "10 tools", tool: "monetizacao" },
    { icon: "🎓", name: "Learn", desc: "Academia, playbook, ciência", color: C.purple, count: "4 tools", tool: "academia" },
  ];

  const metrics = stats || [
    { label: "POSTS/MÊS", value: "—", color: C.cyan },
    { label: "SEGUIDORES", value: "—", color: C.green },
    { label: "BRAND SCORE", value: "—", color: C.gold },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{
            background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: "12px 14px", position: "relative", overflow: "hidden",
          }}>
            <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: m.color }} />
            <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 1.5 }}>{m.label}</div>
            <div style={{ fontFamily: F.t, fontSize: 26, fontWeight: 700, color: m.color, lineHeight: 1.1, marginTop: 2 }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14, alignItems: "start" }}>
        <DailyCoach
          brief={brief} loading={briefLoading} identity={identity}
          coachId={coachId} canPublish={canPublish}
          onConnectInstagram={() => onOpenTool?.("um_toque")}
          onOpenTool={onOpenTool}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ContentScore />
          <QuickActions onOpenTool={onOpenTool} />
          <WeekChart posted={weekPosted || [false, false, false, false, false, false, false]} />
        </div>
      </div>

      {/* Activity Feed */}
      {brief?.alerts && brief.alerts.length > 0 && (
        <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>ALERTAS DO DIA</div>
          {brief.alerts.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 14 }}>{a.icon}</span>
              <span style={{ flex: 1, fontFamily: F.b, fontSize: 11, color: C.text, lineHeight: 1.5 }}>{a.text}</span>
              {(() => {
                const t = (a.text || "").toLowerCase();
                const act =
                  t.includes("carrossel mce") || t.includes("mce")
                    ? { label: "Gerar carrossel MCE", tool: "carrossel_mce" }
                    : t.includes("tema") || t.includes("vault") || t.includes("peptí") || t.includes("microbiota") || t.includes("esteroid")
                    ? { label: "Gerar tema do dia", tool: "banco_temas" }
                    : t.includes("treino") || t.includes("pull") || t.includes("push") || t.includes("legs") || t.includes("vídeo") || t.includes("video")
                    ? { label: "Gerar do treino", tool: "video_conteudo" }
                    : t.includes("viral") || t.includes("gancho") || t.includes("hook")
                    ? { label: "Gerar formato viral", tool: "viral" }
                    : t.includes("story") || t.includes("stories") || t.includes("venda") || t.includes("oferta") || t.includes("cta")
                    ? { label: "Gerar Story CTA", tool: "pacote_dia" }
                    : t.includes("reels") || t.includes("reel")
                    ? { label: "Gerar Reels", tool: "pacote_dia" }
                    : t.includes("carrossel")
                    ? { label: "Gerar carrossel", tool: "pacote_dia" }
                    : t.includes("dm") || t.includes("objeç") || t.includes("lead")
                    ? { label: "Gerar script de DM", tool: "dm" }
                    : t.includes("métric") || t.includes("metric") || t.includes("alcance") || t.includes("engajamento") || t.includes("desempenho")
                    ? { label: "Ver métricas", tool: "metricas" }
                    : t.includes("post") || t.includes("legenda")
                    ? { label: "Gerar post", tool: "editor" }
                    : { label: "Gerar agora", tool: "pacote_dia" };
                return (
                  <button type="button" onClick={() => onOpenTool?.(act.tool)} style={{
                    padding: "4px 10px", background: `${C.cyan}12`, border: `1px solid ${C.cyan}50`, borderRadius: 5,
                    cursor: "pointer", fontFamily: F.m, fontSize: 9, color: C.cyan, flexShrink: 0, whiteSpace: "nowrap",
                  }}>▶ {act.label}</button>
                );
              })()}
              <span style={{ width: 6, height: 6, borderRadius: 3, background: alertColors[a.color_hint || ""] || C.cyan, marginTop: 5, flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}

      {/* Zone Navigation */}
      <div>
        <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>ZONAS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8 }}>
          {zones.map((z, i) => (
            <ZoneCard key={i} {...z} onClick={() => onOpenTool?.(z.tool)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Temas sugeridos do banco — o treino do dia (TrainingON) manda no contexto. */
function TemasDoDia({ onOpenTool }: { onOpenTool?: (id: string) => void }) {
  const { postados, loading } = useTemasPostados();
  const [treino, setTreino] = useState<TreinoHoje | null>(null);
  const hoje = new Date();

  useEffect(() => {
    let vivo = true;
    // Usa explicitamente o mesmo protocolo escolhido no TrainingON/Studio.
    // Evita que este painel volte ao protocolo mais recente de outro aluno.
    getTreinoDeHoje(getProtocoloPreferido() || undefined)
      .then((t) => vivo && setTreino(t))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  const foco = useMemo(() => (treino ? focoDoTreino(treino) : null), [treino]);
  const sugestoes = useMemo(
    () => sugestoesDoDia(postados, hoje, 3, foco),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [postados, foco],
  );
  if (loading || !sugestoes.length) return null;
  const contexto = foco
    ? foco === "descanso"
      ? `HOJE É OFF · LIFESTYLE + CIÊNCIA`
      : `HOJE: ${(treino?.nomeTreino || "").toUpperCase()} · SUGESTÕES DE ${FOCO_LABEL[foco].toUpperCase()}`
    : `TEMAS DE HOJE · ${ROTACAO_SEMANAL[hoje.getDay()].label.toUpperCase()}`;
  return (
    <div style={{ marginBottom: 12, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, background: C.s2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.orange }}>
          {contexto}
        </div>
        <button
          type="button"
          onClick={() => onOpenTool?.("banco_temas")}
          style={{ background: "none", border: "none", color: C.cyan, fontSize: 10, cursor: "pointer" }}
        >
          ver banco completo
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sugestoes.map((t) => (
          <button
            key={t.titulo}
            type="button"
            onClick={() => onOpenTool?.("banco_temas")}
            style={{
              textAlign: "left", background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "8px 10px", cursor: "pointer",
            }}
          >
            <div style={{ fontFamily: F.t, fontSize: 13, fontWeight: 700, color: C.white }}>
              {t.icone} {t.titulo}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{t.subtitulo}</div>
            <div style={{ fontFamily: F.m, fontSize: 9, color: C.orange, marginTop: 2 }}>
              {FORMATO_LABEL[t.formato_ideal]} · potencial {t.potencial}/10
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MicrobiotaSuggestion() {
  const navigate = useNavigate();
  const item = microbiotaItems[new Date().getDate() % microbiotaItems.length];
  const tema = `${item.nome} (${item.classe}) — ângulo educativo. ${item.mecanismo_acao}`;
  return (
    <div style={{ background: C.s2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
      <div style={{ fontFamily: F.m, fontSize: 8, color: C.cyan, letterSpacing: 2 }}>CONTEÚDO SUGERIDO DA MICROBIOTAVAULT</div>
      <div style={{ fontFamily: F.t, fontSize: 13, fontWeight: 700, color: C.white, marginTop: 4 }}>{item.nome}</div>
      <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 2 }}>
        Ângulo: EDUCATIVO · Formato: CARROSSEL · {item.categoria}
      </div>
      <button
        onClick={() => navigate(`/coach/social?tab=carrossel_mce&tema=${encodeURIComponent(tema)}`)}
        style={{ marginTop: 8, fontFamily: F.m, fontSize: 10, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.cyan}55`, background: "transparent", color: C.cyan, cursor: "pointer" }}
      >
        ✦ GERAR CARROSSEL
      </button>
    </div>
  );
}
