import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CalendarPlus, Copy, Download, Film, Image as ImageIcon, Loader2, RefreshCw, Save, Settings2,
  Sparkles, Trash2, Upload, X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Section, copyText } from "./socialUi";
import {
  cropToRatio, downloadMany, isMobileDevice, saveImage, extractVideoFrames, fileToDataUrl, getVideoDuration,
  gradeDarkPremium, gradeFitness, renderSlide, renderStoryFrame, videoObjectUrl,
} from "@/lib/socialImageKit";

const PRISM = "#A855F7";
const PRISM2 = "#00D4FF";

const MAX_FILES = 10;
const MAX_VIDEO_MB = 100;

type PrismFile = {
  id: string;
  kind: "image" | "video";
  name: string;
  dataUrl?: string;
  objectUrl?: string;
  duration?: number;
  frames?: string[];
  thumb: string;
};

type PrismResult = {
  analysis?: {
    content_detected?: string[];
    environment?: string;
    time_of_day?: string;
    energy?: string;
    quality?: string;
    products_visible?: string[];
    people?: string;
    summary?: string;
    per_file?: { index: number; kind: string; describe: string; best_use: string }[];
  };
  decision?: {
    primary_format?: string;
    secondary_formats?: string[];
    tone?: string;
    objective?: string;
    funnel?: string;
    product_mention?: string;
    best_time?: string;
    best_day?: string;
    potential?: string;
    reasoning?: string;
  };
  content?: {
    caption?: string;
    caption_alternatives?: Record<string, string>;
    carousel_slides?: { title: string; body?: string; file_index?: number }[];
    stories_frames?: { text: string; body?: string; sticker?: string; sticker_content?: string; file_index?: number }[];
    reel_script?: {
      hook?: string; development?: string; cta?: string;
      texts_on_screen?: string[]; duration_suggested?: number; music_suggestion?: string;
    };
    edit_sequence?: { file_index?: number; duration_s?: number; transition?: string; text?: string }[];
    video_notes?: {
      rewritten_script?: string;
      screen_texts?: { time: string; text: string }[];
      cuts?: string[];
      optimized_duration?: string;
      stories_clips?: string[];
      thumbnail_frame?: string;
    };
    weekly_package?: {
      weekday: string; piece: string; objective?: string;
      format?: string; pillar?: string; time?: string; hook?: string;
    }[];
    hashtags?: string[];
    self_comment?: string;
  };
};

const TONE_LABELS: Record<string, string> = {
  direto: "🔥 Direto", cientifico: "🧠 Científico", pessoal: "❤️ Pessoal",
  humor: "😂 Humor", militar: "⚓ Militar", pai: "👨‍👧 Pai",
};

const potentialColor = (p?: string) =>
  p === "alto" ? "#00FF88" : p === "medio" ? "#FFB020" : "#94A3B8";

const REWRITE_PRESETS = [
  "Mais curta e direta",
  "Mais provocativa",
  "Mais história pessoal",
  "Mais científica",
  "Outro hook, mesma ideia",
  "Foco em venda suave",
];

const WEEKDAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
const DAY_NAMES: Record<string, number> = {
  domingo: 0, segunda: 1, terca: 2, terça: 2, quarta: 3, quinta: 4, sexta: 5, sabado: 6, sábado: 6,
  dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6,
};

const CAL_FORMATS = ["reel", "carrossel", "stories", "post_unico", "live", "collab"];
const CAL_PILLARS = ["mce_drop", "bastidor", "transformacao", "entretenimento", "cta"];

const normalizeFormat = (f?: string) => {
  const v = (f || "").toLowerCase();
  if (CAL_FORMATS.includes(v)) return v;
  if (v.includes("reel")) return "reel";
  if (v.includes("carrossel") || v.includes("carousel")) return "carrossel";
  if (v.includes("stor")) return "stories";
  if (v.includes("live")) return "live";
  if (v.includes("collab")) return "collab";
  return "post_unico";
};

const normalizePillar = (p?: string, objective?: string) => {
  const v = (p || "").toLowerCase();
  if (CAL_PILLARS.includes(v)) return v;
  if (v.includes("transform") || v.includes("prova")) return "transformacao";
  if (v.includes("bastid") || v.includes("pessoal")) return "bastidor";
  if (v.includes("entret") || v.includes("humor")) return "entretenimento";
  if (v.includes("cta") || v.includes("vend")) return "cta";
  if ((objective || "").toLowerCase() === "vender") return "cta";
  return "mce_drop";
};

const normalizeTime = (t?: string, fallback = "19:00") => {
  const m = String(t || "").match(/(\d{1,2})[:h](\d{2})/);
  if (!m) return fallback;
  const h = Math.min(23, Number(m[1]));
  const mi = Math.min(59, Number(m[2]));
  return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
};

const toISODate = (d: Date) => {
  const off = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return off.toISOString().slice(0, 10);
};

/** Próxima data (>= hoje) para um dia da semana. */
const nextDateFor = (weekday: string) => {
  const key = String(weekday || "").toLowerCase().trim();
  const target = DAY_NAMES[key] ?? WEEKDAYS.indexOf(key.toUpperCase().slice(0, 3));
  const today = new Date();
  if (target < 0) return toISODate(today);
  const diff = (target - today.getDay() + 7) % 7;
  const d = new Date(today);
  d.setDate(today.getDate() + diff);
  return toISODate(d);
};

type ScheduleRow = {
  key: string;
  date: string;
  time: string;
  format: string;
  pillar: string;
  topic: string;
  hook: string;
  caption: string;
  isMain: boolean;
};

const Block = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <span
        className="w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold"
        style={{ background: `${PRISM}22`, color: PRISM, border: `1px solid ${PRISM}55` }}
      >
        {n}
      </span>
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-mono">{title}</p>
    </div>
    {children}
  </div>
);

const PrismPanel = ({
  ctx,
  handle,
  onManualMode,
}: {
  ctx: Record<string, any>;
  handle?: string | null;
  onManualMode?: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PrismFile[]>([]);
  const [context, setContext] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [result, setResult] = useState<PrismResult | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [activeTone, setActiveTone] = useState<string>("principal");
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [storyImages, setStoryImages] = useState<string[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [watermark, setWatermark] = useState(false);
  const [savingPkg, setSavingPkg] = useState(false);
  const [rewriteHint, setRewriteHint] = useState("");
  const [rewriting, setRewriting] = useState<string | null>(null);
  const [rewriteCount, setRewriteCount] = useState(0);
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [scheduling, setScheduling] = useState(false);
  const [scheduled, setScheduled] = useState(0);

  const images = useMemo(() => files.filter((f) => f.kind === "image"), [files]);
  const videos = useMemo(() => files.filter((f) => f.kind === "video"), [files]);
  const at = (i?: number) => (typeof i === "number" && files[i] ? files[i].thumb : null);

  const addFiles = async (list: FileList | File[]) => {
    const arr = Array.from(list);
    const room = MAX_FILES - files.length;
    if (room <= 0) return toast.error(`Máximo de ${MAX_FILES} arquivos`);
    const next: PrismFile[] = [];

    for (const f of arr.slice(0, room)) {
      const isVideo = f.type.startsWith("video/");
      const isImage = f.type.startsWith("image/");
      if (!isVideo && !isImage) {
        toast.error(`${f.name}: formato não suportado`);
        continue;
      }
      if (isVideo && f.size > MAX_VIDEO_MB * 1024 * 1024) {
        toast.error(`${f.name}: vídeo acima de ${MAX_VIDEO_MB}MB`);
        continue;
      }
      try {
        if (isImage) {
          const dataUrl = await fileToDataUrl(f);
          next.push({ id: crypto.randomUUID(), kind: "image", name: f.name, dataUrl, thumb: dataUrl });
        } else {
          const objectUrl = videoObjectUrl(f);
          const duration = await getVideoDuration(objectUrl);
          const frames = (await extractVideoFrames(objectUrl, 4)).map((f) => f.dataUrl);
          next.push({
            id: crypto.randomUUID(), kind: "video", name: f.name, objectUrl,
            duration, frames, thumb: frames[0] || "",
          });
        }
      } catch {
        toast.error(`Não consegui ler ${f.name}`);
      }
    }
    if (next.length) setFiles((p) => [...p, ...next]);
  };

  const removeFile = (id: string) => setFiles((p) => p.filter((f) => f.id !== id));

  const run = async () => {
    if (!files.length) return toast.error("Envie pelo menos 1 arquivo");
    setBusy(true);
    setResult(null);
    setSlideImages([]);
    setStoryImages([]);
    setAnalysisId(null);
    setActiveTone("principal");
    try {
      setStep("Analisando o material...");
      const { data, error } = await supabase.functions.invoke("prism-analyze", {
        body: {
          images: images.map((f) => f.dataUrl).filter(Boolean),
          videos: videos.map((v) => ({ name: v.name, duration: v.duration, frames: v.frames })),
          context,
          ig_profile: ctx?.ig_profile ?? null,
        },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);

      const res: PrismResult = (data as any).result;
      setResult(res);
      setAnalysisId((data as any).id ?? null);

      setStep("Renderizando carrossel e stories...");
      await renderAll(res);
      toast.success("PRISM refratou seu material");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no PRISM");
    } finally {
      setBusy(false);
      setStep("");
    }
  };

  const renderAll = async (res: PrismResult) => {
    const footer = watermark ? `@${(handle || "diogo.mell0").replace("@", "")} · nutrion.app.br` : undefined;
    const slides = res.content?.carousel_slides || [];
    const stories = res.content?.stories_frames || [];

    const slideOut: string[] = [];
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      slideOut.push(
        await renderSlide({
          backgroundImage: at(s.file_index) ?? images[i]?.thumb ?? null,
          eyebrow: i === 0 ? "MÉTODO MCE" : undefined,
          title: s.title,
          body: s.body,
          footer,
          accent: PRISM2,
        })
      );
    }
    const storyOut: string[] = [];
    for (let i = 0; i < stories.length; i++) {
      const s = stories[i];
      storyOut.push(
        await renderStoryFrame({
          backgroundImage: at(s.file_index) ?? images[i]?.thumb ?? null,
          eyebrow: s.sticker && s.sticker !== "nenhum" ? s.sticker.toUpperCase() : undefined,
          title: s.text,
          body: s.body || s.sticker_content,
          footer,
          accent: PRISM,
        })
      );
    }
    setSlideImages(slideOut);
    setStoryImages(storyOut);
  };

  const buildEdits = async () => {
    const base = images[0]?.dataUrl;
    if (!base) return toast.error("Sem foto para editar");
    setBusy(true);
    setStep("Gerando versões editadas...");
    try {
      const [fitness, dark, r916, r45] = await Promise.all([
        gradeFitness(base), gradeDarkPremium(base), cropToRatio(base, 9, 16), cropToRatio(base, 4, 5),
      ]);
      setEdits({ fitness, dark, "9x16": r916, "4x5": r45 });
    } finally {
      setBusy(false);
      setStep("");
    }
  };

  const savePackage = async () => {
    if (!analysisId) return toast.error("Nada para salvar");
    setSavingPkg(true);
    const { error } = await supabase.from("prism_analyses").update({ saved: true }).eq("id", analysisId);
    setSavingPkg(false);
    if (error) toast.error("Não consegui salvar o pacote");
    else toast.success("Pacote salvo");
  };

  /** Nova versão de legenda e/ou slides mantendo exatamente a mesma análise. */
  const rewrite = async (target: "caption" | "slides" | "both") => {
    if (!result?.analysis || !result?.decision) return;
    setRewriting(target);
    try {
      const current =
        target === "slides"
          ? { carousel_slides: result.content?.carousel_slides }
          : target === "caption"
            ? { caption: result.content?.caption, caption_alternatives: result.content?.caption_alternatives }
            : {
                caption: result.content?.caption,
                caption_alternatives: result.content?.caption_alternatives,
                carousel_slides: result.content?.carousel_slides,
              };

      const { data, error } = await supabase.functions.invoke("prism-analyze", {
        body: {
          mode: "rewrite",
          target,
          instruction: rewriteHint,
          analysis: result.analysis,
          decision: result.decision,
          current,
        },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);

      const rw = (data as any).result || {};
      const next: PrismResult = {
        ...result,
        content: {
          ...result.content,
          ...(rw.caption ? { caption: rw.caption } : {}),
          ...(rw.caption_alternatives ? { caption_alternatives: rw.caption_alternatives } : {}),
          ...(Array.isArray(rw.carousel_slides) && rw.carousel_slides.length
            ? { carousel_slides: rw.carousel_slides }
            : {}),
        },
      };
      setResult(next);
      setRewriteCount((n) => n + 1);
      setActiveTone("principal");
      if (target !== "caption") await renderAll(next);
      toast.success("Nova versão pronta — mesma análise");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar nova versão");
    } finally {
      setRewriting(null);
    }
  };

  /** Monta a agenda sugerida (post principal + pacote semanal). */
  useEffect(() => {
    if (!result) return setSchedule([]);
    const dec = result.decision;
    const cont = result.content;
    const rows: ScheduleRow[] = [];

    rows.push({
      key: "main",
      isMain: true,
      date: nextDateFor(dec?.best_day || ""),
      time: normalizeTime(dec?.best_time, "19:00"),
      format: normalizeFormat(dec?.primary_format),
      pillar: normalizePillar(undefined, dec?.objective),
      topic: result.analysis?.summary?.slice(0, 120) || "Post PRISM",
      hook: cont?.carousel_slides?.[0]?.title || "",
      caption: cont?.caption || "",
    });

    (cont?.weekly_package || []).forEach((w, i) => {
      rows.push({
        key: `w${i}`,
        isMain: false,
        date: nextDateFor(w.weekday),
        time: normalizeTime(w.time, "19:00"),
        format: normalizeFormat(w.format),
        pillar: normalizePillar(w.pillar, w.objective),
        topic: w.piece?.slice(0, 160) || `Peça ${i + 1}`,
        hook: w.hook || "",
        caption: "",
      });
    });

    setSchedule(rows);
    setScheduled(0);
  }, [result]);

  const patchRow = (key: string, patch: Partial<ScheduleRow>) =>
    setSchedule((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const sendToCalendar = async () => {
    if (!schedule.length) return;
    setScheduling(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const coachId = auth?.user?.id;
      if (!coachId) throw new Error("Sessão expirada");

      const inserts = schedule.map((r) => ({
        coach_id: coachId,
        date: r.date,
        scheduled_time: r.time,
        pillar: r.pillar,
        format: r.format,
        topic: r.topic,
        hook: r.hook || null,
        caption: r.isMain ? caption || r.caption || null : null,
        reel_script: r.isMain && result?.content?.reel_script
          ? [
              `HOOK: ${result.content.reel_script.hook || ""}`,
              result.content.reel_script.development || "",
              `CTA: ${result.content.reel_script.cta || ""}`,
            ].join("\n")
          : null,
        hashtags: r.isMain ? result?.content?.hashtags ?? [] : [],
        status: "draft",
        source: "prism",
        prism_analysis_id: analysisId,
      }));

      const { error } = await supabase.from("social_content_calendar").insert(inserts);
      if (error) throw error;
      setScheduled(inserts.length);
      toast.success(`${inserts.length} post${inserts.length > 1 ? "s" : ""} agendado${inserts.length > 1 ? "s" : ""} no calendário`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao agendar");
    } finally {
      setScheduling(false);
    }
  };

  const caption =
    activeTone === "principal"
      ? result?.content?.caption || ""
      : result?.content?.caption_alternatives?.[activeTone] || result?.content?.caption || "";

  const d = result?.decision;
  const a = result?.analysis;
  const c = result?.content;

  const editSequenceText = (c?.edit_sequence || [])
    .map((s, i) => `Frame ${i + 1} (arquivo ${(s.file_index ?? 0) + 1}) · ${s.duration_s ?? 0.5}s · ${s.transition || "corte seco"}${s.text ? ` · "${s.text}"` : ""}`)
    .join("\n");

  const totalPieces =
    (Object.keys(edits).length) +
    (caption ? 1 : 0) +
    Object.keys(c?.caption_alternatives || {}).length +
    (c?.carousel_slides?.length || 0) +
    (c?.stories_frames?.length || 0) +
    (c?.hashtags?.length ? 1 : 0) +
    (c?.self_comment ? 1 : 0) +
    (c?.reel_script ? 1 : 0) +
    (c?.weekly_package?.length || 0);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div
        className="rounded-xl border p-5"
        style={{ borderColor: `${PRISM}55`, background: `linear-gradient(135deg, ${PRISM}18, ${PRISM2}0d)` }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: PRISM }} />
          <h2 className="text-lg font-black tracking-tight">PRISM CONTENT INTELLIGENCE</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          1 upload. O PRISM refrata em 20+ peças de conteúdo. Zero seletor, zero decisão.
        </p>
      </div>

      {/* UPLOAD */}
      <Section title="O que você tem?">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { icon: "📷", label: "1 foto", hint: "post + carrossel" },
            { icon: "📸", label: "Várias fotos", hint: "edit + carrossel" },
            { icon: "📹", label: "1 vídeo", hint: "reel otimizado" },
            { icon: "🎬", label: "Mix", hint: "pacote semanal" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border p-3 text-left transition-colors hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              <span className="text-xl">{o.icon}</span>
              <p className="text-xs font-semibold mt-1">{o.label}</p>
              <p className="text-[10px] text-muted-foreground">{o.hint}</p>
            </button>
          ))}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,video/quicktime,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files) addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors"
          style={{ borderColor: dragging ? PRISM : "rgba(255,255,255,0.15)", background: dragging ? `${PRISM}11` : "transparent" }}
        >
          <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: PRISM }} />
          <p className="text-sm font-medium">Arraste seus arquivos aqui ou clique pra selecionar</p>
          <p className="text-xs text-muted-foreground mt-1">
            Fotos: JPG, PNG · Vídeos: MP4, MOV · Máx {MAX_FILES} arquivos · {MAX_VIDEO_MB}MB por vídeo
          </p>
        </div>

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={f.id} className="relative w-20">
                <div className="aspect-square rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  {f.thumb ? (
                    <img src={f.thumb} alt={f.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center"><Film className="w-4 h-4" /></div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/80 border border-white/20 grid place-items-center"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-[9px] text-muted-foreground mt-1 truncate">
                  {i + 1}. {f.kind === "video" ? `${Math.round(f.duration || 0)}s` : "foto"}
                </p>
              </div>
            ))}
          </div>
        )}

        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Contexto (opcional): ex. Treinando barras na praia de manhã"
          rows={2}
        />

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={watermark} onChange={(e) => setWatermark(e.target.checked)} />
          Marca d'água (@handle · nutrion.app.br) nas imagens geradas
        </label>

        <Button
          onClick={run}
          disabled={busy || !files.length}
          className="w-full h-auto py-4 font-black"
          style={{ background: `linear-gradient(90deg, ${PRISM}, ${PRISM2})`, color: "#03030a" }}
        >
          {busy ? (
            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{step || "Processando..."}</span>
          ) : (
            <span className="block">
              <span className="block text-base">🔮 PRISM — ANALISAR E CRIAR</span>
              <span className="block text-[11px] font-medium opacity-80">
                O PRISM analisa seu material, escolhe formato, tom, objetivo e gera tudo.
              </span>
            </span>
          )}
        </Button>

        {onManualMode && (
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground mb-2">──── ou ────</p>
            <Button variant="outline" size="sm" onClick={onManualMode} className="gap-2">
              <Settings2 className="w-3 h-3" /> Modo manual — eu escolho tudo
            </Button>
          </div>
        )}
      </Section>

      {/* RESULTADO */}
      {result && (
        <>
          <Section title="Leitura do PRISM">
            <p className="text-sm">{a?.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              {(a?.content_detected || []).map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
              {a?.environment && <Badge variant="outline" className="text-[10px]">📍 {a.environment}</Badge>}
              {a?.time_of_day && <Badge variant="outline" className="text-[10px]">🕐 {a.time_of_day}</Badge>}
              {a?.energy && <Badge variant="outline" className="text-[10px]">⚡ energia {a.energy}</Badge>}
              {a?.quality && <Badge variant="outline" className="text-[10px]">🎯 qualidade {a.quality}</Badge>}
              {a?.people && <Badge variant="outline" className="text-[10px]">👤 {a.people}</Badge>}
              {(a?.products_visible || []).map((p) => <Badge key={p} className="text-[10px]" style={{ background: `${PRISM}33`, color: PRISM }}>{p}</Badge>)}
            </div>
            {!!a?.per_file?.length && (
              <div className="space-y-1">
                {a.per_file.map((f) => (
                  <p key={f.index} className="text-xs text-muted-foreground">
                    <span className="font-mono">#{f.index + 1}</span> {f.describe} → <span style={{ color: PRISM2 }}>{f.best_use}</span>
                  </p>
                ))}
              </div>
            )}
          </Section>

          <Section title="Decisão do PRISM">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div><p className="text-[10px] text-muted-foreground uppercase">📊 Formato</p><p className="font-semibold">{d?.primary_format}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">🎯 Objetivo</p><p className="font-semibold">{d?.objective} ({d?.funnel?.toUpperCase()})</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">🔥 Tom</p><p className="font-semibold">{TONE_LABELS[d?.tone || ""] || d?.tone}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">⏰ Horário</p><p className="font-semibold">{d?.best_time} ({d?.best_day})</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">💊 Produto</p><p className="font-semibold">{d?.product_mention}</p></div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">📈 Potencial</p>
                <p className="font-semibold uppercase" style={{ color: potentialColor(d?.potential) }}>{d?.potential}</p>
              </div>
            </div>
            {d?.reasoning && <p className="text-xs text-muted-foreground border-l-2 pl-3" style={{ borderColor: `${PRISM}66` }}>{d.reasoning}</p>}
            {!!d?.secondary_formats?.length && (
              <div className="flex flex-wrap gap-1.5">
                {d.secondary_formats.map((f) => <Badge key={f} variant="outline" className="text-[10px]">+ {f}</Badge>)}
              </div>
            )}
          </Section>

          {/* 1 — IMAGENS EDITADAS */}
          {!!images.length && (
            <Section title="1 · Versões editadas">
              <Block n={1} title="Fotos prontas">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={buildEdits} disabled={busy} className="gap-2">
                    <ImageIcon className="w-3 h-3" /> Gerar versões (fitness, dark, 9:16, 4:5)
                  </Button>
                  {!!Object.keys(edits).length && (
                    <Button size="sm" variant="outline" className="gap-2"
                      onClick={async () => {
                        const n = await downloadMany(Object.entries(edits).map(([k, v]) => ({ url: v, filename: `prism-${k}.png` })));
                        n ? toast.success(`${n} imagens baixadas!`) : toast.error("Não consegui baixar as imagens");
                      }}>
                      <Download className="w-3 h-3" /> Baixar todas
                    </Button>
                  )}
                </div>
                {!!Object.keys(edits).length && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(edits).map(([k, v]) => (
                      <div key={k} className="space-y-1">
                        <img src={v} alt={k} className="w-full rounded-lg border" style={{ borderColor: "rgba(255,255,255,0.12)" }} />
                        <p className="text-[10px] text-center text-muted-foreground uppercase">{k}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Block>
            </Section>
          )}

          {/* 2 — LEGENDA */}
          <Section title="2 · Legenda">
            <div className="flex flex-wrap gap-1.5">
              {["principal", ...Object.keys(c?.caption_alternatives || {})].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTone(t)}
                  className="px-3 py-1.5 rounded-full text-xs border transition-colors"
                  style={{
                    borderColor: activeTone === t ? PRISM : "rgba(255,255,255,0.12)",
                    background: activeTone === t ? `${PRISM}22` : "transparent",
                    color: activeTone === t ? PRISM : undefined,
                  }}
                >
                  {t === "principal" ? "⭐ Principal" : TONE_LABELS[t] || t}
                </button>
              ))}
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{caption}</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => copyText(caption)} className="gap-2">
                <Copy className="w-3 h-3" /> Copiar legenda
              </Button>
            </div>

            {/* Nova versão — mantém a mesma análise */}
            <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="text-[11px] text-muted-foreground">
                Nova versão dos textos (a análise do material não muda){rewriteCount ? ` · ${rewriteCount} regeração${rewriteCount > 1 ? "ões" : ""}` : ""}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {REWRITE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setRewriteHint(p)}
                    className="px-2 py-1 rounded-md text-[10px] border transition-colors"
                    style={{
                      borderColor: rewriteHint === p ? "#00D4FF" : "rgba(255,255,255,0.12)",
                      color: rewriteHint === p ? "#00D4FF" : undefined,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Textarea
                value={rewriteHint}
                onChange={(e) => setRewriteHint(e.target.value)}
                placeholder="O que mudar nesta versão? Ex.: começa com uma pergunta, menos emoji, CTA pro desafio de 90 dias"
                className="text-xs min-h-[60px]"
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => rewrite("caption")} disabled={!!rewriting} className="gap-2">
                  {rewriting === "caption" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Nova legenda
                </Button>
                {!!result?.content?.carousel_slides?.length && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => rewrite("slides")} disabled={!!rewriting} className="gap-2">
                      {rewriting === "slides" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Novos textos dos slides
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => rewrite("both")} disabled={!!rewriting} className="gap-2">
                      {rewriting === "both" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Legenda + slides
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Section>

          {/* 3 — CARROSSEL */}
          {!!slideImages.length && (
            <Section title={`3 · Carrossel (${slideImages.length} slides)`}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {slideImages.map((s, i) => (
                  <div key={i} className="space-y-1">
                    <img src={s} alt={`slide ${i + 1}`} className="w-full rounded-lg border" style={{ borderColor: "rgba(255,255,255,0.12)" }} />
                    <p className="text-[10px] text-center text-muted-foreground">Slide {i + 1}</p>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="gap-2"
                onClick={async () => {
                  const n = await downloadMany(slideImages.map((s, i) => ({ url: s, filename: `prism-slide-${i + 1}.png` })));
                  n ? toast.success(`${n} slides baixados!`) : toast.error("Não consegui baixar os slides");
                }}>
                <Download className="w-3 h-3" /> Baixar PNGs
              </Button>
            </Section>
          )}

          {/* 4 — STORIES */}
          {!!storyImages.length && (
            <Section title={`4 · Stories (${storyImages.length} frames)`}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {storyImages.map((s, i) => (
                  <div key={i} className="space-y-1">
                    <img src={s} alt={`story ${i + 1}`} className="w-full rounded-lg border" style={{ borderColor: "rgba(255,255,255,0.12)" }} />
                    <p className="text-[10px] text-center text-muted-foreground">
                      📌 {(c?.stories_frames?.[i]?.sticker || "nenhum").toUpperCase()}
                    </p>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="gap-2"
                onClick={async () => {
                  const n = await downloadMany(storyImages.map((s, i) => ({ url: s, filename: `prism-story-${i + 1}.png` })));
                  n ? toast.success(`${n} stories baixados!`) : toast.error("Não consegui baixar os stories");
                }}>
                <Download className="w-3 h-3" /> Baixar PNGs
              </Button>
            </Section>
          )}

          {/* 5 — EDIT SEQUENCE */}
          {!!c?.edit_sequence?.length && (
            <Section title="5 · Sequência do edit (CapCut)">
              <div className="space-y-1">
                {c.edit_sequence.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {at(s.file_index) && <img src={at(s.file_index)!} alt="" className="w-8 h-8 rounded object-cover" />}
                    <span className="font-mono" style={{ color: PRISM2 }}>{s.duration_s ?? 0.5}s</span>
                    <span className="text-muted-foreground">{s.transition}</span>
                    {s.text && <span className="font-semibold">"{s.text}"</span>}
                  </div>
                ))}
              </div>
              {c.reel_script?.music_suggestion && (
                <p className="text-xs text-muted-foreground">🎵 {c.reel_script.music_suggestion}</p>
              )}
              <Button size="sm" variant="outline" onClick={() => copyText(editSequenceText)} className="gap-2">
                <Copy className="w-3 h-3" /> Copiar sequência
              </Button>
            </Section>
          )}

          {/* 6 — VÍDEO */}
          {!!videos.length && c?.video_notes && (
            <Section title="6 · Vídeo otimizado">
              {c.video_notes.rewritten_script && (
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Roteiro reescrito</p>
                  <p className="text-sm whitespace-pre-wrap">{c.video_notes.rewritten_script}</p>
                </div>
              )}
              {!!c.video_notes.screen_texts?.length && (
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Textos pra tela</p>
                  {c.video_notes.screen_texts.map((t, i) => (
                    <p key={i} className="text-xs"><span className="font-mono" style={{ color: PRISM2 }}>{t.time}</span> — {t.text}</p>
                  ))}
                </div>
              )}
              {!!c.video_notes.cuts?.length && (
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Cortes sugeridos {c.video_notes.optimized_duration ? `(${c.video_notes.optimized_duration})` : ""}</p>
                  {c.video_notes.cuts.map((t, i) => <p key={i} className="text-xs text-muted-foreground">{t}</p>)}
                </div>
              )}
              {!!c.video_notes.stories_clips?.length && (
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Versão Stories</p>
                  {c.video_notes.stories_clips.map((t, i) => <p key={i} className="text-xs text-muted-foreground">{t}</p>)}
                </div>
              )}
              {!!videos[0]?.frames?.length && (
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Thumbnail — {c.video_notes.thumbnail_frame}</p>
                  <div className="flex gap-2">
                    {videos[0].frames!.map((f, i) => (
                      <button key={i} type="button" onClick={async () => { (await saveImage(f, `prism-thumb-${i + 1}.png`)) ? toast.success(isMobileDevice() ? "Toque em \"Salvar imagem\" para ir pra galeria" : "Thumbnail baixada!") : toast.error("Falha ao salvar"); }}>
                        <img src={f} alt="" className="w-20 rounded border" style={{ borderColor: "rgba(255,255,255,0.12)" }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* 7 — HASHTAGS + HORÁRIO */}
          <Section title="7 · Hashtags + horário">
            <p className="text-sm text-muted-foreground break-words">{(c?.hashtags || []).join(" ")}</p>
            <p className="text-xs">⏰ {d?.best_time} ({d?.best_day}) · 📊 alcance: <span style={{ color: potentialColor(d?.potential) }}>{d?.potential}</span></p>
            <Button size="sm" variant="outline" onClick={() => copyText((c?.hashtags || []).join(" "))} className="gap-2">
              <Copy className="w-3 h-3" /> Copiar
            </Button>
          </Section>

          {/* 8 — SELF-COMMENT */}
          {c?.self_comment && (
            <Section title="8 · Self-comment">
              <p className="text-sm">{c.self_comment}</p>
              <Button size="sm" variant="outline" onClick={() => copyText(c.self_comment!)} className="gap-2">
                <Copy className="w-3 h-3" /> Copiar
              </Button>
            </Section>
          )}

          {/* 9 — REEL */}
          {c?.reel_script && (
            <Section title="9 · Roteiro de Reel">
              <p className="text-sm"><b>Hook:</b> {c.reel_script.hook}</p>
              <p className="text-sm whitespace-pre-wrap"><b>Desenvolvimento:</b> {c.reel_script.development}</p>
              <p className="text-sm"><b>CTA:</b> {c.reel_script.cta}</p>
              {!!c.reel_script.texts_on_screen?.length && (
                <p className="text-xs text-muted-foreground">Texto na tela: {c.reel_script.texts_on_screen.join(" · ")}</p>
              )}
              <Button
                size="sm" variant="outline" className="gap-2"
                onClick={() => copyText(
                  [`HOOK: ${c.reel_script?.hook}`, "", c.reel_script?.development, "", `CTA: ${c.reel_script?.cta}`, "",
                    `TEXTO NA TELA: ${(c.reel_script?.texts_on_screen || []).join(" | ")}`,
                    `DURAÇÃO: ${c.reel_script?.duration_suggested || 30}s`].join("\n")
                )}
              >
                <Copy className="w-3 h-3" /> Copiar roteiro
              </Button>
            </Section>
          )}

          {/* 10 — PACOTE SEMANAL */}
          {!!c?.weekly_package?.length && (
            <Section title="10 · Pacote semanal (7 dias)">
              {c.weekly_package.map((w) => (
                <div key={w.weekday} className="flex items-start gap-2 text-sm">
                  <span className="font-mono text-xs w-10 shrink-0" style={{ color: PRISM }}>{w.weekday}</span>
                  <span>{w.piece} {w.objective && <span className="text-muted-foreground">({w.objective})</span>}</span>
                </div>
              ))}
              <Button size="sm" variant="outline" className="gap-2"
                onClick={() => copyText(c.weekly_package!.map((w) => `${w.weekday}: ${w.piece}`).join("\n"))}>
                <Copy className="w-3 h-3" /> Copiar pacote
              </Button>
            </Section>
          )}

          {/* 11 — AGENDAR NO CALENDÁRIO */}
          {!!schedule.length && (
            <Section title={`11 · Agendar no calendário (${schedule.length} ${schedule.length > 1 ? "posts" : "post"})`}>
              <p className="text-[11px] text-muted-foreground">
                Datas e horários já vêm sugeridos pelo PRISM. Ajuste o que quiser antes de enviar.
              </p>
              <div className="space-y-2">
                {schedule.map((r) => (
                  <div
                    key={r.key}
                    className="rounded-lg border p-2 space-y-2"
                    style={{ borderColor: r.isMain ? `${PRISM}55` : "rgba(255,255,255,0.10)" }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs leading-snug">
                        {r.isMain && <Badge variant="outline" className="mr-1 text-[9px]">principal</Badge>}
                        {r.topic}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Input type="date" value={r.date} onChange={(e) => patchRow(r.key, { date: e.target.value })} className="h-8 text-xs" />
                      <Input type="time" value={r.time} onChange={(e) => patchRow(r.key, { time: e.target.value })} className="h-8 text-xs" />
                      <select
                        value={r.format}
                        onChange={(e) => patchRow(r.key, { format: e.target.value })}
                        className="h-8 text-xs rounded-md border bg-background px-2"
                        style={{ borderColor: "rgba(255,255,255,0.12)" }}
                      >
                        {CAL_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <select
                        value={r.pillar}
                        onChange={(e) => patchRow(r.key, { pillar: e.target.value })}
                        className="h-8 text-xs rounded-md border bg-background px-2"
                        style={{ borderColor: "rgba(255,255,255,0.12)" }}
                      >
                        {CAL_PILLARS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={sendToCalendar} disabled={scheduling} className="gap-2">
                  {scheduling ? <Loader2 className="w-3 h-3 animate-spin" /> : <CalendarPlus className="w-3 h-3" />}
                  Agendar no calendário
                </Button>
                {!!scheduled && (
                  <span className="text-[11px]" style={{ color: "#00FF88" }}>
                    {scheduled} agendado{scheduled > 1 ? "s" : ""} — veja na aba Calendário
                  </span>
                )}
              </div>
            </Section>
          )}

          {/* RESUMO */}
          <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: `${PRISM}55`, background: `${PRISM}0d` }}>
            <p className="text-sm font-bold">
              RESUMO: de {files.length} arquivo{files.length > 1 ? "s" : ""} o PRISM gerou {totalPieces}+ peças
            </p>
            <div className="text-xs text-muted-foreground space-y-0.5">
              {!!Object.keys(edits).length && <p>✅ {Object.keys(edits).length} versões editadas</p>}
              <p>✅ 1 legenda + {Object.keys(c?.caption_alternatives || {}).length} tons alternativos</p>
              <p>✅ {c?.carousel_slides?.length || 0} slides de carrossel</p>
              <p>✅ {c?.stories_frames?.length || 0} frames de Stories com stickers</p>
              <p>✅ {c?.hashtags?.length || 0} hashtags + horário ideal</p>
              {c?.self_comment && <p>✅ 1 self-comment</p>}
              {c?.reel_script && <p>✅ 1 roteiro de Reel</p>}
              {!!c?.weekly_package?.length && <p>✅ pacote de 7 dias</p>}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={savePackage} disabled={savingPkg || !analysisId} className="gap-2"
                style={{ background: PRISM, color: "#03030a" }}>
                {savingPkg ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Salvar pacote
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => { setResult(null); setFiles([]); setEdits({}); }}>
                <Trash2 className="w-3 h-3" /> Novo upload
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PrismPanel;
