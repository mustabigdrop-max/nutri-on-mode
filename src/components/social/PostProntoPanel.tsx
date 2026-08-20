import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Download, Film, Loader2, Rocket, Save, Smartphone, Trash2, Type, Upload, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ACCENT, ACCENT2, Section, callSocialAI, copyText } from "./socialUi";
import { CAPTION_TONES, CAROUSEL_STYLES, PHOTO_SUBJECTS, QUICK_GOALS } from "@/data/socialOnSurreal";
import {
  cropToRatio, downloadDataUrl, downloadMany, extractVideoFrames, fileToDataUrl, getVideoDuration,
  gradeDarkPremium, gradeFitness, renderSlide, renderStoryFrame, videoObjectUrl,
} from "@/lib/socialImageKit";
import { MAX_VIDEO_MB, MAX_VIDEO_SECONDS, VIDEO_TYPES, videoTypeById } from "@/data/socialOnVideo";

type StoryPart = { title: string; body: string; sticker?: string; sticker_content?: string };

type Pkg = {
  caption?: string;
  hook?: string;
  hashtags?: string[];
  best_time?: string;
  reach_forecast?: string;
  self_comment?: string;
  carousel?: { title: string; body: string }[];
  stories?: StoryPart[];
};

type ReelScript = {
  hook?: { time?: string; text_on_screen?: string; action?: string };
  development?: { time?: string; instructions?: string[] };
  cta?: { time?: string; text_on_screen?: string; alternative?: string };
  editing?: Record<string, string>;
  screen_texts?: { frame: string; text: string }[];
  screen_text_tips?: string[];
  caption?: string;
  hashtags?: string[];
  best_time?: string;
  self_comment?: string;
};

type SlideDef = {
  title: string;
  body?: string;
  eyebrow?: string;
  /** "none" | "main" | índice numérico da foto extra */
  bg: string;
  accent?: string;
};

type SavedPackage = {
  id: string;
  title: string | null;
  category: string | null;
  objective: string | null;
  tone: string | null;
  carousel_style: string;
  status: string;
  published_items: Record<string, boolean> | null;
  generated_content: { pkg?: Pkg; slides?: SlideDef[] } | null;
  created_at: string;
};

const MAX_PHOTOS = 10;
const PUBLISH_ITEMS = [
  { key: "caption", label: "Legenda usada" },
  { key: "carousel", label: "Carrossel postado" },
  { key: "stories", label: "Stories postado" },
  { key: "self_comment", label: "Self-comment postado" },
];

const reelToText = (r: ReelScript, duration?: number) =>
  [
    `ROTEIRO DO REEL${duration ? ` — vídeo de ${duration}s` : ""}`,
    "",
    `HOOK (${r.hook?.time || "0-2s"})`,
    r.hook?.text_on_screen ? `Texto na tela: "${r.hook.text_on_screen}"` : "",
    r.hook?.action ? `Ação: ${r.hook.action}` : "",
    "",
    `DESENVOLVIMENTO (${r.development?.time || "2-20s"})`,
    ...(r.development?.instructions || []).map((i) => `- ${i}`),
    "",
    `CTA (${r.cta?.time || "últimos 5s"})`,
    r.cta?.text_on_screen ? `Texto na tela: "${r.cta.text_on_screen}"` : "",
    r.cta?.alternative ? `Ou: "${r.cta.alternative}"` : "",
    "",
    "EDIÇÃO SUGERIDA",
    ...Object.entries(r.editing || {}).map(([k, v]) => `${k}: ${v}`),
    "",
    "TEXTOS PRA TELA",
    ...(r.screen_texts || []).map((s) => `${s.frame}: ${s.text}`),
  ]
    .filter((l) => l !== undefined && l !== "" || l === "")
    .join("\n");

const PostProntoPanel = ({ ctx, handle }: { ctx: Record<string, any>; handle?: string | null }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const extraRef = useRef<HTMLInputElement>(null);
  const slideBgRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  const [photos, setPhotos] = useState<string[]>([]);
  const [subject, setSubject] = useState<string>("shape");
  const [goal, setGoal] = useState<string>("viralizar");
  const [style, setStyle] = useState<string>("photo");
  const [tone, setTone] = useState<string>("direto");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [slides, setSlides] = useState<SlideDef[]>([]);
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [storyImages, setStoryImages] = useState<string[]>([]);
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState<SavedPackage[]>([]);
  const [realData, setRealData] = useState<string>("");
  const [watermark, setWatermark] = useState(false);
  const [video, setVideo] = useState<{ url: string; name: string; duration: number } | null>(null);
  const [videoType, setVideoType] = useState<string>("talking_head");
  const [frames, setFrames] = useState<string[]>([]);
  const [thumb, setThumb] = useState<string | null>(null);
  const [reel, setReel] = useState<ReelScript | null>(null);

  const videoRef = useRef<HTMLInputElement>(null);
  const main = photos[0] || null;
  const at = `@${String(handle || "diogo.mell0").replace("@", "")}`;
  const brand = watermark ? `${at} · nutrion.app.br` : undefined;

  const loadSaved = async () => {
    const { data } = await supabase
      .from("social_packages")
      .select("id,title,category,objective,tone,carousel_style,status,published_items,generated_content,created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    setSaved((data as any as SavedPackage[]) || []);
  };

  useEffect(() => {
    loadSaved();
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;
      const counts = await Promise.all([
        supabase.from("coach_patients").select("id", { count: "exact", head: true }),
        supabase.from("sent_plans").select("id", { count: "exact", head: true }),
        supabase.from("mce_audio_episodes").select("id", { count: "exact", head: true }),
        supabase.from("progress_photos").select("id", { count: "exact", head: true }),
      ]);
      const [pacientes, planos, episodios, fotos] = counts.map((c) => c.count || 0);
      setRealData(
        [
          `clientes ativos: ${pacientes}`,
          `planos alimentares enviados: ${planos}`,
          `episódios de áudio MCE publicados: ${episodios}`,
          `registros de evolução documentados: ${fotos}`,
        ].join(" · "),
      );
    })();
  }, []);

  const addPhotos = async (list?: FileList | null, asMain = false) => {
    if (!list?.length) return;
    const files = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return toast.error("Envie imagens (vídeo: use o roteiro gerado).");
    const urls = await Promise.all(files.map(fileToDataUrl));
    setPhotos((prev) => {
      const next = asMain ? [urls[0], ...prev.slice(1)] : [...prev, ...urls];
      if (next.length > MAX_PHOTOS) toast.info(`Máximo de ${MAX_PHOTOS} fotos.`);
      return next.slice(0, MAX_PHOTOS);
    });
  };

  const removePhoto = (i: number) => setPhotos((p) => p.filter((_, idx) => idx !== i));

  const bgFor = async (bg: string) => {
    if (bg === "none") return null;
    if (bg === "main") return edits.dark || null;
    if (bg.startsWith("data:")) return await gradeDarkPremium(bg);
    const idx = Number(bg);
    const src = photos[idx];
    return src ? await gradeDarkPremium(src) : edits.dark || null;
  };

  const renderSlides = async (defs: SlideDef[], carouselStyle: string) => {
    const out: string[] = [];
    for (const d of defs) {
      const bgImage = carouselStyle === "dark" ? null : await bgFor(d.bg);
      out.push(await renderSlide({
        backgroundImage: bgImage,
        overlay: "rgba(2,2,5,0.80)",
        gradient: carouselStyle === "gradient" && !bgImage ? ["#062733", "#020205"] : undefined,
        bigTitle: carouselStyle === "gradient",
        eyebrow: d.eyebrow,
        title: d.title,
        body: d.body,
        footer: brand,
        accent: d.accent,
      }));
    }
    return out;
  };

  const buildVisuals = async (data: Pkg, carouselStyle = style) => {
    if (!main) return;
    setStep("Editando a foto…");
    const fitness = await gradeFitness(main);
    const dark = await gradeDarkPremium(main);
    const c45 = await cropToRatio(fitness, 4, 5);
    const c916 = await cropToRatio(fitness, 9, 16);
    setEdits({ original: main, fitness, dark, crop45: c45, crop916: c916 });

    setStep("Montando carrossel…");
    const defs: SlideDef[] = [
      {
        eyebrow: "arrasta →",
        title: data.hook || data.caption?.split("\n")[0] || "Sistema > motivação",
        bg: carouselStyle === "dark" ? "none" : "main",
      },
      ...(data.carousel || []).slice(0, 3).map((p, i) => ({
        eyebrow: `0${i + 2}`,
        title: p.title,
        body: p.body,
        bg: carouselStyle === "dark" ? "none" : photos[i + 1] ? String(i + 1) : "main",
      })),
      {
        title: "Salva esse post.",
        body: "Manda pra quem precisa ler isso hoje.",
        bg: carouselStyle === "dark" ? "none" : "main",
        accent: "#00FF88",
      },
    ];
    setSlides(defs);
    setSlideImages(await renderSlides(defs, carouselStyle));

    setStep("Montando Stories…");
    await buildStories(data, brand, c916);
  };

  const buildStories = async (data: Pkg, footer?: string, cover?: string) => {
    if (!main) return;
    const base = cover ?? (await cropToRatio(await gradeFitness(main), 9, 16));
    const st: string[] = [];
    const parts = (data.stories || []).slice(0, 4);
    for (const [i, s] of parts.entries()) {
      const extra = photos[i];
      const bg = i === 0
        ? base
        : extra && i < photos.length ? await cropToRatio(await gradeDarkPremium(extra), 9, 16) : null;
      st.push(await renderStoryFrame({
        backgroundImage: bg,
        overlay: "rgba(2,2,5,0.62)",
        title: s.title,
        body: [s.body, s.sticker && s.sticker !== "NENHUM" ? `Adicione o sticker ${s.sticker} aqui ↑` : ""].filter(Boolean).join("\n\n"),
        footer,
        accent: i === 0 ? undefined : ACCENT2,
      }));
    }
    setStoryImages(st);
  };

  const addVideo = async (file?: File | null) => {
    if (!file) return;
    if (!/^video\//.test(file.type)) return toast.error("Envie um arquivo de vídeo (MP4 ou MOV)");
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) return toast.error(`Vídeo acima de ${MAX_VIDEO_MB}MB`);
    const url = videoObjectUrl(file);
    const duration = Math.round(await getVideoDuration(url));
    if (duration > MAX_VIDEO_SECONDS + 1) {
      URL.revokeObjectURL(url);
      return toast.error(`Vídeo de ${duration}s — o limite é ${MAX_VIDEO_SECONDS}s`);
    }
    setVideo({ url, name: file.name, duration });
    setBusy(true);
    setStep("Analisando frames do vídeo…");
    try {
      const best = await extractVideoFrames(url, 5);
      setFrames(best.map((f) => f.dataUrl));
      setThumb(best[0]?.dataUrl ?? null);
      toast.success(`Vídeo de ${duration}s carregado · thumbnail sugerida`);
    } catch (e: any) {
      toast.error(e.message || "Não foi possível ler os frames do vídeo");
    } finally {
      setBusy(false);
      setStep("");
    }
  };

  const removeVideo = () => {
    if (video) URL.revokeObjectURL(video.url);
    setVideo(null);
    setFrames([]);
    setThumb(null);
    setReel(null);
  };

  const generateReel = async () => {
    if (!video) return;
    const toneDef = CAPTION_TONES.find((t) => t.id === tone);
    const vt = videoTypeById(videoType);
    setBusy(true);
    setStep("Escrevendo roteiro do Reel…");
    try {
      const data: ReelScript = await callSocialAI({
        mode: "reel_script",
        subject: PHOTO_SUBJECTS.find((s) => s.id === subject)?.label,
        quickGoal: QUICK_GOALS.find((g) => g.id === goal)?.label,
        captionTone: toneDef?.label,
        captionToneBrief: toneDef?.brief,
        videoDuration: video.duration,
        videoType: vt?.label,
        videoTypeTips: vt?.tips.join(" · "),
        handle: at.replace("@", ""),
        realData,
        ...ctx,
      });
      setReel(data);
      toast.success("Roteiro do Reel pronto");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      setStep("");
    }
  };

  const generate = async (lightning = false) => {
    if (!main && !video) return toast.error("Envie a foto principal ou um vídeo primeiro");
    setBusy(true);
    try {
      if (main) {
        setStep("Gerando copy…");
        const toneDef = CAPTION_TONES.find((t) => t.id === tone);
        const data: Pkg = await callSocialAI({
          mode: "post_package",
          subject: PHOTO_SUBJECTS.find((s) => s.id === subject)?.label,
          quickGoal: QUICK_GOALS.find((g) => g.id === goal)?.label,
          captionTone: toneDef?.label,
          captionToneBrief: toneDef?.brief,
          realData,
          extraPhotos: Math.max(0, photos.length - 1) || undefined,
          lightning,
          ...ctx,
        });
        setPkg(data);
        await buildVisuals(data);
      }
      if (video) await generateReel();
      toast.success(lightning ? "Modo Relâmpago pronto" : "Pacote completo pronto");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      setStep("");
    }
  };

  const toggleWatermark = async (next: boolean) => {
    setWatermark(next);
    if (!pkg || !main) return;
    setBusy(true);
    setStep(next ? "Aplicando marca d'água…" : "Removendo marca d'água…");
    try {
      const footer = next ? `${at} · nutrion.app.br` : undefined;
      const imgs: string[] = [];
      for (const d of slides) {
        const bgImage = style === "dark" ? null : await bgFor(d.bg);
        imgs.push(await renderSlide({
          backgroundImage: bgImage,
          overlay: "rgba(2,2,5,0.80)",
          gradient: style === "gradient" && !bgImage ? ["#062733", "#020205"] : undefined,
          bigTitle: style === "gradient",
          eyebrow: d.eyebrow,
          title: d.title,
          body: d.body,
          footer,
          accent: d.accent,
        }));
      }
      setSlideImages(imgs);
      if (pkg) await buildStories(pkg, footer);
    } finally {
      setBusy(false);
      setStep("");
    }
  };

  const changeStyle = async (id: string) => {
    setStyle(id);
    if (!pkg) return;
    setBusy(true);
    setStep("Reestilizando carrossel…");
    try {
      await buildVisuals(pkg, id);
    } finally {
      setBusy(false);
      setStep("");
    }
  };

  const reorder = async (from: number, to: number) => {
    if (from === to || to < 0 || to >= slides.length) return;
    const next = [...slides];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setSlides(next);
    const imgs = [...slideImages];
    const [im] = imgs.splice(from, 1);
    imgs.splice(to, 0, im);
    setSlideImages(imgs);
  };

  const saveSlide = async (index: number, def: SlideDef) => {
    const next = slides.map((s, i) => (i === index ? def : s));
    setSlides(next);
    setEditing(null);
    setBusy(true);
    setStep("Regerando slide…");
    try {
      const imgs = await renderSlides(next, style);
      setSlideImages(imgs);
    } finally {
      setBusy(false);
      setStep("");
    }
  };

  const savePackage = async () => {
    if (!pkg) return;
    const { error } = await supabase.from("social_packages").insert({
      title: pkg.hook?.slice(0, 80) || "Pacote SOCIAL ON",
      category: PHOTO_SUBJECTS.find((s) => s.id === subject)?.label,
      objective: QUICK_GOALS.find((g) => g.id === goal)?.label,
      tone: CAPTION_TONES.find((t) => t.id === tone)?.label,
      carousel_style: style,
      photos: [],
      generated_content: { pkg, slides } as any,
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Pacote salvo");
    loadSaved();
  };

  const togglePublished = async (p: SavedPackage, key: string) => {
    const items = { ...(p.published_items || {}), [key]: !p.published_items?.[key] };
    const anyDone = Object.values(items).some(Boolean);
    const { error } = await supabase
      .from("social_packages")
      .update({
        published_items: items,
        status: anyDone ? "published" : "draft",
        published_at: anyDone ? new Date().toISOString() : null,
      } as any)
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    loadSaved();
  };

  const reusePackage = async (p: SavedPackage) => {
    const content = p.generated_content;
    if (!content?.pkg) return toast.error("Pacote sem conteúdo");
    setPkg(content.pkg);
    setStyle(p.carousel_style || "dark");
    if (main) await buildVisuals(content.pkg, p.carousel_style || "dark");
    toast.success("Pacote carregado");
  };

  const deletePackage = async (id: string) => {
    const { error } = await supabase.from("social_packages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    loadSaved();
  };

  const okMsg = (n: number) =>
    isMobileDevice()
      ? `${n} ${n > 1 ? "imagens prontas" : "imagem pronta"} — toque em "Salvar imagem" para ir pra galeria`
      : `${n} ${n > 1 ? "imagens baixadas" : "imagem baixada"}!`;

  const dl = async (url: string, name: string) => {
    const ok = await saveImage(url, name);
    ok ? toast.success(okMsg(1)) : toast.error("Não consegui salvar o arquivo");
  };
  const dlAll = async (list: string[], prefix: string) => {
    const n = await downloadMany(list.map((u, i) => ({ url: u, filename: `${prefix}-${i + 1}.png` })));
    n ? toast.success(okMsg(n)) : toast.error("Não consegui salvar as imagens");
  };


  return (
    <div className="space-y-4">
      <Section title="📸 Passo 1 — seu conteúdo">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => addPhotos(e.target.files, photos.length > 0)} />
        <input ref={extraRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
        <input ref={videoRef} type="file" accept="video/mp4,video/quicktime,video/*" className="hidden" onChange={(e) => addVideo(e.target.files?.[0])} />
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addPhotos(e.dataTransfer.files); }}
          className="rounded-xl border border-dashed p-6 text-center space-y-3"
          style={{ borderColor: `${ACCENT}55` }}
        >
          {main ? (
            <img src={main} alt="Foto principal do post" className="mx-auto max-h-56 rounded-lg" />
          ) : (
            <p className="text-xs text-muted-foreground">Arraste aqui ou selecione a foto principal (ou envie só um vídeo abaixo)</p>
          )}
          <Button size="sm" variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}>
            <Upload className="w-3 h-3" /> {main ? "Trocar foto principal" : "Selecionar foto principal"}
          </Button>
        </div>

        {main && (
          <>
            <p className="text-[11px] text-muted-foreground">
              Fotos adicionais (opcional) — usadas nos slides do carrossel e nos Stories. Máximo {MAX_PHOTOS}.
            </p>
            <div className="flex flex-wrap gap-2">
              {photos.slice(1).map((p, i) => (
                <div key={i} className="relative">
                  <img src={p} alt={`Foto adicional ${i + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i + 1)}
                    className="absolute -top-1 -right-1 rounded-full bg-background border p-0.5"
                    aria-label={`Remover foto ${i + 1}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-[10px] text-center font-mono text-muted-foreground">{i + 2}</p>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => extraRef.current?.click()}
                  className="w-20 h-20 rounded-lg border border-dashed text-xl text-muted-foreground"
                  style={{ borderColor: `${ACCENT}55` }}
                >
                  +
                </button>
              )}
            </div>
          </>
        )}

        <div className="rounded-xl border border-dashed p-4 space-y-3" style={{ borderColor: `${ACCENT2}55` }}>
          <p className="text-xs font-semibold">📹 Vídeo (opcional)</p>
          {video ? (
            <div className="space-y-2">
              <video src={video.url} controls className="w-full max-h-56 rounded-lg bg-black" />
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-mono text-muted-foreground">{video.name} · {video.duration}s</p>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => videoRef.current?.click()}>Trocar</Button>
                  <Button size="sm" variant="ghost" className="h-7" onClick={removeVideo} aria-label="Remover vídeo"><X className="w-3 h-3" /></Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => videoRef.current?.click()}>
                <Film className="w-3 h-3" /> Enviar vídeo
              </Button>
              <p className="text-[10px] text-muted-foreground">
                Formatos: MP4, MOV · Máximo {MAX_VIDEO_SECONDS}s · Até {MAX_VIDEO_MB}MB
              </p>
            </>
          )}
        </div>

        <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={watermark} onChange={(e) => toggleWatermark(e.target.checked)} />
          Incluir marca d'água ({at} · nutrion.app.br) nos slides e stories
        </label>
      </Section>

      {video && (
        <Section title="🎬 Passo 2B — tipo de vídeo">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {VIDEO_TYPES.map((v) => (
              <button key={v.id} type="button" onClick={() => setVideoType(v.id)}
                className="p-3 rounded-lg text-left border transition-colors"
                style={{ borderColor: videoType === v.id ? ACCENT2 : "rgba(255,255,255,0.12)", background: videoType === v.id ? `${ACCENT2}18` : "transparent" }}>
                <p className="text-xs font-semibold">{v.emoji} {v.label}</p>
                <p className="text-[10px] text-muted-foreground">{v.sub}</p>
              </button>
            ))}
          </div>
          <ul className="space-y-1 pt-1">
            {(videoTypeById(videoType)?.tips || []).map((t) => (
              <li key={t} className="text-[11px] text-muted-foreground">→ {t}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="🎯 Passo 2 — o que tem na foto?">
        <div className="flex flex-wrap gap-2">
          {PHOTO_SUBJECTS.map((s) => (
            <button key={s.id} type="button" onClick={() => setSubject(s.id)}
              className="px-3 py-2 rounded-lg text-xs border transition-colors"
              style={{ borderColor: subject === s.id ? ACCENT : "rgba(255,255,255,0.12)", background: subject === s.id ? `${ACCENT}22` : "transparent" }}>
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="🎨 Passo 3 — estilo do carrossel">
        <div className="grid grid-cols-3 gap-2">
          {CAROUSEL_STYLES.map((s) => (
            <button key={s.id} type="button" onClick={() => changeStyle(s.id)}
              className="p-3 rounded-lg text-left border transition-colors"
              style={{ borderColor: style === s.id ? ACCENT2 : "rgba(255,255,255,0.12)", background: style === s.id ? `${ACCENT2}18` : "transparent" }}>
              <p className="text-xs font-semibold">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.sub}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="🗣 Passo 4 — tom da legenda">
        <div className="flex flex-wrap gap-2">
          {CAPTION_TONES.map((t) => (
            <button key={t.id} type="button" onClick={() => setTone(t.id)}
              className="px-3 py-2 rounded-lg text-xs border transition-colors"
              style={{ borderColor: tone === t.id ? ACCENT : "rgba(255,255,255,0.12)", background: tone === t.id ? `${ACCENT}22` : "transparent" }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="⚡ Passo 5 — objetivo">
        <div className="flex flex-wrap gap-2">
          {QUICK_GOALS.map((g) => (
            <button key={g.id} type="button" onClick={() => setGoal(g.id)}
              className="px-3 py-2 rounded-lg text-xs border transition-colors"
              style={{ borderColor: goal === g.id ? ACCENT2 : "rgba(255,255,255,0.12)", background: goal === g.id ? `${ACCENT2}22` : "transparent" }}>
              {g.emoji} {g.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button disabled={busy} onClick={() => generate(false)} className="gap-2" style={{ background: ACCENT }}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />} Gerar pacote completo
          </Button>
          <Button disabled={busy} variant="outline" className="gap-2" onClick={() => generate(true)}>
            <Zap className="w-4 h-4" /> Modo relâmpago
          </Button>
          {pkg && (
            <>
              <Button variant="outline" className="gap-2" onClick={() => setPreview(true)}>
                <Smartphone className="w-4 h-4" /> Preview mobile
              </Button>
              <Button variant="outline" className="gap-2" onClick={savePackage}>
                <Save className="w-4 h-4" /> Salvar pacote
              </Button>
            </>
          )}
        </div>
        {busy && <p className="text-xs font-mono text-muted-foreground">{step}</p>}
      </Section>

      {edits.fitness && (
        <Section title="1. Foto editada" right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={async () => {
            const items = [
              { url: edits.fitness, filename: "fitness-grade.jpg" },
              { url: edits.dark, filename: "dark-premium.jpg" },
              { url: edits.crop45, filename: "feed-4x5.jpg" },
              { url: edits.crop916, filename: "stories-9x16.jpg" },
            ].filter((i) => !!i.url);
            const n = await downloadMany(items);
            n ? toast.success(`${n} imagens baixadas!`) : toast.error("Não consegui baixar as imagens");
          }}><Download className="w-3 h-3" /> Baixar todas</Button>
        }>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { k: "original", l: "Original" }, { k: "fitness", l: "Fitness grade" },
              { k: "dark", l: "Dark premium" }, { k: "crop916", l: "9:16 Stories" },
            ].map((v) => (
              <div key={v.k} className="space-y-1">
                <img src={edits[v.k]} alt={`Versão ${v.l} da foto`} className="rounded-lg w-full object-cover" />
                <p className="text-[10px] font-mono text-muted-foreground">{v.l}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">Crops 4:5 (feed) e 9:16 (Stories) gerados.</p>
        </Section>
      )}

      {pkg?.caption && (
        <Section title="2. Legenda pronta" right={
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(pkg.caption!)}><Copy className="w-3 h-3" /> Copiar</Button>
            <Button size="sm" variant="ghost" className="h-7" disabled={busy} onClick={() => generate(false)}>🔄 Outra</Button>
          </div>
        }>
          <p className="text-sm whitespace-pre-wrap">{pkg.caption}</p>
          <p className="text-[11px] text-muted-foreground">
            Troque o tom no Passo 4 e clique em "Outra" para uma versão completamente diferente.
          </p>
        </Section>
      )}

      {slideImages.length > 0 && (
        <Section title={`3. Carrossel (${slideImages.length} slides)`} right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => dlAll(slideImages, "carrossel")}><Download className="w-3 h-3" /> Baixar PNGs</Button>
        }>
          <p className="text-[11px] text-muted-foreground">Arraste pra reordenar · clique pra editar texto e fundo</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {slideImages.map((s, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => (dragIndex.current = i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragIndex.current !== null) reorder(dragIndex.current, i); dragIndex.current = null; }}
                className="shrink-0 space-y-1 cursor-grab"
                onClick={() => setEditing(i)}
              >
                <img src={s} alt={`Slide ${i + 1} do carrossel`} className="h-44 rounded-lg" />
                <p className="text-[10px] font-mono text-center text-muted-foreground">slide {i + 1}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {storyImages.length > 0 && (
        <Section title={`4. Stories (${storyImages.length} frames)`} right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => dlAll(storyImages, "story")}><Download className="w-3 h-3" /> Baixar PNGs</Button>
        }>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {storyImages.map((s, i) => (
              <div key={i} className="shrink-0 w-40 space-y-1">
                <img src={s} alt={`Story ${i + 1}`} className="h-52 rounded-lg mx-auto" />
                <p className="text-[10px] font-mono" style={{ color: ACCENT2 }}>
                  📌 {pkg?.stories?.[i]?.sticker || "NENHUM"}
                </p>
                {pkg?.stories?.[i]?.sticker_content && (
                  <p className="text-[10px] text-muted-foreground whitespace-pre-wrap">{pkg.stories[i].sticker_content}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {reel && (
        <Section
          title="🎬 Roteiro do Reel"
          right={
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-7" disabled={busy} onClick={generateReel}>🔄 Outro</Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(reelToText(reel, video?.duration))}>
                <Copy className="w-3 h-3" /> Copiar roteiro
              </Button>
            </div>
          }
        >
          <p className="text-[11px] text-muted-foreground">
            Baseado no seu vídeo de {video?.duration ?? 0} segundos · {videoTypeById(videoType)?.label}
          </p>
          <div className="space-y-2">
            {[
              { k: "HOOK", t: reel.hook?.time, lines: [reel.hook?.text_on_screen && `Texto na tela: "${reel.hook.text_on_screen}"`, reel.hook?.action && `Ação: ${reel.hook.action}`] },
              { k: "DESENVOLVIMENTO", t: reel.development?.time, lines: reel.development?.instructions || [] },
              { k: "CTA", t: reel.cta?.time, lines: [reel.cta?.text_on_screen && `Texto na tela: "${reel.cta.text_on_screen}"`, reel.cta?.alternative && `Ou: "${reel.cta.alternative}"`] },
            ].map((b) => (
              <div key={b.k} className="rounded-lg border p-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <p className="text-xs font-semibold" style={{ color: ACCENT2 }}>{b.k} {b.t ? `(${b.t})` : ""}</p>
                <ul className="pt-1 space-y-1">
                  {(b.lines.filter(Boolean) as string[]).map((l) => (
                    <li key={l} className="text-[11px] text-muted-foreground">→ {l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {reel.editing && (
            <div className="rounded-lg border p-3" style={{ borderColor: `${ACCENT}33` }}>
              <p className="text-[10px] font-mono text-muted-foreground">EDIÇÃO SUGERIDA</p>
              <ul className="pt-1 space-y-1">
                {Object.entries(reel.editing).map(([k, v]) => (
                  <li key={k} className="text-[11px] text-muted-foreground">
                    <span className="font-mono uppercase">{k}:</span> {String(v)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      )}

      {reel?.screen_texts?.length ? (
        <Section
          title="✏️ Textos pra tela"
          right={
            <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(reel.screen_texts!.map((s) => `${s.frame}: ${s.text}`).join("\n"))}>
              <Copy className="w-3 h-3" /> Copiar todos
            </Button>
          }
        >
          <div className="space-y-1">
            {reel.screen_texts.map((s) => (
              <div key={s.frame} className="flex items-center justify-between gap-2 rounded-lg border p-2" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono text-muted-foreground">{s.frame}</p>
                  <p className="text-sm font-semibold">{s.text}</p>
                </div>
                <Button size="sm" variant="ghost" className="h-7 shrink-0" onClick={() => copyText(s.text)} aria-label="Copiar texto">
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          <ul className="space-y-1">
            {(reel.screen_text_tips || []).map((t) => (
              <li key={t} className="text-[11px] text-muted-foreground flex gap-2"><Type className="w-3 h-3 mt-0.5 shrink-0" />{t}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {thumb && (
        <Section
          title="🖼 Thumbnail do Reel"
          right={<Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => dl(thumb, "thumbnail-reel.jpg")}><Download className="w-3 h-3" /> Baixar</Button>}
        >
          <p className="text-[11px] text-muted-foreground">Frame mais forte do vídeo (maior contraste e detalhe). Toque em outro frame para trocar.</p>
          <img src={thumb} alt="Thumbnail sugerida do Reel" className="rounded-lg max-h-56" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {frames.map((f, i) => (
              <button key={i} type="button" onClick={() => setThumb(f)} className="shrink-0">
                <img
                  src={f}
                  alt={`Frame ${i + 1}`}
                  className="h-20 rounded-md"
                  style={{ outline: thumb === f ? `2px solid ${ACCENT2}` : "none" }}
                />
              </button>
            ))}
          </div>
        </Section>
      )}

      {reel?.caption && !pkg?.caption && (
        <Section title="📝 Legenda do Reel" right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(reel.caption!)}><Copy className="w-3 h-3" /> Copiar</Button>
        }>
          <p className="text-sm whitespace-pre-wrap">{reel.caption}</p>
          {reel.hashtags?.length ? <p className="text-sm pt-2" style={{ color: ACCENT2 }}>{reel.hashtags.join(" ")}</p> : null}
          <p className="text-xs font-mono text-muted-foreground">⏰ {reel.best_time || "19h00"}</p>
          {reel.self_comment && <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">Self-comment: {reel.self_comment}</p>}
        </Section>
      )}

      {pkg?.hashtags?.length ? (
        <Section title="5. Hashtags + horário" right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(pkg.hashtags!.join(" "))}><Copy className="w-3 h-3" /> Copiar</Button>
        }>
          <p className="text-sm" style={{ color: ACCENT2 }}>{pkg.hashtags.join(" ")}</p>
          <p className="text-xs font-mono text-muted-foreground">
            ⏰ Melhor horário: {pkg.best_time || "12h30"} · 📊 Alcance previsto: {pkg.reach_forecast || "alto"}
          </p>
        </Section>
      ) : null}

      {pkg?.self_comment && (
        <Section title="6. Self-comment" right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(pkg.self_comment!)}><Copy className="w-3 h-3" /> Copiar</Button>
        }>
          <p className="text-sm whitespace-pre-wrap">{pkg.self_comment}</p>
        </Section>
      )}

      <Section title="📦 Meus pacotes salvos">
        {saved.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum pacote salvo ainda.</p>
        ) : (
          <div className="space-y-3">
            {saved.map((p) => (
              <div key={p.id} className="rounded-lg border p-3 space-y-2" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold">
                      {new Date(p.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} · {p.category || "—"} · {p.objective || "—"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{p.title}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => reusePackage(p)}>Reusar</Button>
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => deletePackage(p.id)} aria-label="Excluir pacote">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {PUBLISH_ITEMS.map((it) => (
                    <label key={it.key} className="flex items-center gap-1 text-[11px] text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!p.published_items?.[it.key]}
                        onChange={() => togglePublished(p, it.key)}
                      />
                      {it.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {pkg && (
        <Section title="Resumo do pacote">
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>✅ {photos.length} foto(s) enviada(s) · 3 versões + 2 crops da principal</li>
            <li>✅ 1 legenda no tom {CAPTION_TONES.find((t) => t.id === tone)?.label}</li>
            <li>✅ {slideImages.length} slides ({CAROUSEL_STYLES.find((s) => s.id === style)?.label}) · {storyImages.length} frames de Stories</li>
            <li>✅ {pkg.hashtags?.length || 0} hashtags · horário ideal · self-comment</li>
          </ul>
        </Section>
      )}

      {/* Editor de slide */}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar slide {(editing ?? 0) + 1}</DialogTitle></DialogHeader>
          {editing !== null && slides[editing] && (
            <SlideEditor
              def={slides[editing]}
              photos={photos}
              onUpload={() => slideBgRef.current?.click()}
              onCancel={() => setEditing(null)}
              onSave={(d) => saveSlide(editing, d)}
            />
          )}
          <input
            ref={slideBgRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f || editing === null) return;
              const url = await fileToDataUrl(f);
              saveSlide(editing, { ...slides[editing], bg: url });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Preview mobile */}
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Preview mobile</DialogTitle></DialogHeader>
          <div className="rounded-[2rem] border-4 border-muted p-2 space-y-2 bg-black max-h-[70vh] overflow-y-auto">
            {edits.crop45 && <img src={edits.crop45} alt="Post no feed 4:5" className="rounded-lg w-full" />}
            <div className="px-2 pb-2">
              <p className="text-[11px] text-white/90 whitespace-pre-wrap">
                {(pkg?.caption || "").split("\n").slice(0, 2).join("\n")}
                <span className="text-white/40"> … mais</span>
              </p>
            </div>
            {slideImages.length > 0 && (
              <div className="flex gap-1 overflow-x-auto snap-x">
                {slideImages.map((s, i) => <img key={i} src={s} alt={`Slide ${i + 1}`} className="w-full shrink-0 snap-center rounded-lg" />)}
              </div>
            )}
            {storyImages.length > 0 && (
              <div className="flex gap-1 overflow-x-auto snap-x">
                {storyImages.map((s, i) => <img key={i} src={s} alt={`Story ${i + 1}`} className="w-full shrink-0 snap-center rounded-lg" />)}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SlideEditor = ({
  def, photos, onSave, onCancel, onUpload,
}: {
  def: SlideDef; photos: string[]; onSave: (d: SlideDef) => void; onCancel: () => void; onUpload: () => void;
}) => {
  const [title, setTitle] = useState(def.title);
  const [body, setBody] = useState(def.body || "");
  const [bg, setBg] = useState(def.bg);

  const options = [
    { v: "main", l: "Foto principal (escurecida)" },
    ...photos.slice(1).map((_, i) => ({ v: String(i + 1), l: `Foto ${i + 2}` })),
    { v: "none", l: "Sem foto (fundo dark puro)" },
  ];

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Título</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Corpo</label>
        <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Foto de fundo</label>
        {options.map((o) => (
          <label key={o.v} className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="radio" name="slide-bg" checked={bg === o.v} onChange={() => setBg(o.v)} />
            {o.l}
          </label>
        ))}
        <Button size="sm" variant="outline" className="gap-2 mt-1" onClick={onUpload}>
          <Upload className="w-3 h-3" /> Upload outra foto
        </Button>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onSave({ ...def, title, body, bg })} style={{ background: ACCENT }}>Salvar</Button>
      </div>
    </div>
  );
};

export default PostProntoPanel;
