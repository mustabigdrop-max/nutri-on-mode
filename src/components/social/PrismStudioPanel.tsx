import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CalendarPlus, Copy, Film, Image as ImageIcon, Loader2, Music2, Scissors,
  Sparkles, Trash2, Upload, X, Clapperboard, ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Section, Pill, copyText } from "./socialUi";
import { extractVideoFrames, fileToDataUrl, getVideoDuration, videoObjectUrl } from "@/lib/socialImageKit";
import {
  PRISM_MODES, PRISM_OBJECTIVES, PRISM_TONES, SALE_LEVELS, PACK_PRODUCTS,
  type PrismModeDef,
} from "@/data/prismModes";

const MAX_FILES = 10;
const MAX_VIDEO_MB = 100;

type StudioFile = {
  id: string; kind: "image" | "video"; name: string;
  dataUrl?: string; objectUrl?: string; duration?: number; frames?: string[]; thumb: string;
};

export type StudioConcept = {
  title?: string; format?: string; tone?: string; why?: string; hook?: string;
  screen_texts?: string[];
  script?: { hook?: string; development?: string; cta?: string };
  edit_sequence?: { file_index?: number; duration_s?: number; transition?: string; text?: string }[];
  shot_list?: string[]; editing_tips?: string[];
  music_suggestion?: string; duration_suggested?: number;
  caption?: string; hashtags?: string[]; self_comment?: string;
};

export type StudioResult = {
  headline?: string;
  strategy?: Record<string, string>;
  concepts?: StudioConcept[];
  week?: {
    weekday?: string; date_label?: string; piece?: string; format?: string; pillar?: string;
    objective?: string; funnel?: string; time?: string; hook?: string; product?: string;
    caption?: string; stories?: string[];
  }[];
  week_summary?: string;
};

const uid = () => Math.random().toString(36).slice(2);
const WEEKDAY_INDEX: Record<string, number> = { SEG: 1, TER: 2, QUA: 3, QUI: 4, SEX: 5, SAB: 6, DOM: 0 };

const nextDateFor = (weekday?: string) => {
  const target = WEEKDAY_INDEX[(weekday || "").toUpperCase()] ?? 1;
  const d = new Date();
  const diff = (target - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
};

export default function PrismStudioPanel({
  mode, ctx, onBack,
}: { mode: PrismModeDef; ctx?: string; onBack: () => void }) {
  const [subtype, setSubtype] = useState<string>(mode.subtypes[0]?.id || "");
  const [saleLevel, setSaleLevel] = useState<string>("suave");
  const [tone, setTone] = useState<string>("");
  const [objective, setObjective] = useState<string>("");
  const [products, setProducts] = useState<string[]>(["nutrion", "mindforce"]);
  const [theme, setTheme] = useState("");
  const [files, setFiles] = useState<StudioFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudioResult | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [openConcept, setOpenConcept] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const accent = mode.color;

  const addFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    const room = MAX_FILES - files.length;
    if (room <= 0) return toast.error(`Máximo ${MAX_FILES} arquivos`);
    const picked = Array.from(list).slice(0, room);
    const next: StudioFile[] = [];
    for (const f of picked) {
      try {
        if (f.type.startsWith("video/")) {
          if (f.size > MAX_VIDEO_MB * 1024 * 1024) { toast.error(`${f.name}: vídeo acima de ${MAX_VIDEO_MB}MB`); continue; }
          const objectUrl = videoObjectUrl(f);
          const duration = await getVideoDuration(objectUrl);
          const extracted = await extractVideoFrames(objectUrl, 3);
          const frames = extracted.map((f) => f.dataUrl);
          next.push({ id: uid(), kind: "video", name: f.name, objectUrl, duration, frames, thumb: frames[0] || "" });
        } else {
          const dataUrl = await fileToDataUrl(f);
          next.push({ id: uid(), kind: "image", name: f.name, dataUrl, thumb: dataUrl });
        }
      } catch { toast.error(`Falha ao ler ${f.name}`); }
    }
    setFiles((p) => [...p, ...next]);
  };

  const removeFile = (id: string) => setFiles((p) => p.filter((f) => f.id !== id));

  const mixLabel = useMemo(() => "60% TOFU (viral/seguidores) · 30% MOFU (autoridade/valor) · 10% BOFU (venda)", []);

  const generate = async () => {
    if (mode.needsFiles && !files.length) return toast.error("Envie pelo menos uma foto ou vídeo");
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("prism-analyze", {
        body: {
          mode: "studio",
          prism_mode: mode.id,
          subtype,
          sale_level: mode.id === "vender" ? saleLevel : undefined,
          tone: tone || undefined,
          objective: objective || undefined,
          theme: [theme, ctx].filter(Boolean).join(" | "),
          mix: mode.id === "pack_semanal" ? mixLabel : undefined,
          products: mode.id === "pack_semanal" ? products : undefined,
          images: files.filter((f) => f.kind === "image").map((f) => f.dataUrl).filter(Boolean),
          videos: files.filter((f) => f.kind === "video").map((f) => ({ name: f.name, duration: f.duration, frames: f.frames })),
        },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult((data as any).result as StudioResult);
      setOpenConcept(0);
      toast.success("PRISM entregou o conteúdo");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar");
    } finally {
      setLoading(false);
    }
  };

  const scheduleWeek = async () => {
    const week = result?.week || [];
    if (!week.length) return;
    setScheduling(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const coachId = auth?.user?.id;
      if (!coachId) throw new Error("Sessão expirada");
      const inserts = week.map((d) => ({
        coach_id: coachId,
        date: nextDateFor(d.weekday),
        scheduled_time: d.time || "19:30",
        pillar: d.pillar || "mce_drop",
        format: d.format || "reel",
        topic: d.piece || "Conteúdo PRISM",
        hook: d.hook || null,
        caption: d.caption || null,
        hashtags: [],
        status: "draft",
        source: "prism",
      }));
      const { error } = await supabase.from("social_content_calendar").insert(inserts);
      if (error) throw error;
      toast.success(`${inserts.length} posts agendados no calendário`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao agendar");
    } finally {
      setScheduling(false);
    }
  };

  const conceptText = (c: StudioConcept) =>
    [
      c.title, c.hook ? `HOOK: ${c.hook}` : "",
      (c.screen_texts || []).join("\n"),
      c.script?.development ? `\nFALA:\n${c.script.development}` : "",
      c.script?.cta ? `CTA: ${c.script.cta}` : "",
      c.caption ? `\nLEGENDA:\n${c.caption}` : "",
      (c.hashtags || []).join(" "),
    ].filter(Boolean).join("\n");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">← Modos</Button>
        <span className="text-lg">{mode.emoji}</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: accent }}>{mode.label}</p>
          <p className="text-[11px] text-muted-foreground">{mode.desc}</p>
        </div>
      </div>

      <Section title="Briefing">
        <div className="space-y-3">
          {!!mode.subtypes.length && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground">{mode.subtypeTitle || "Subtipo"}</p>
              <div className="flex flex-wrap gap-1.5">
                {mode.subtypes.map((s) => (
                  <Pill key={s.id} label={`${s.emoji} ${s.label}`} active={subtype === s.id} onClick={() => setSubtype(s.id)} />
                ))}
              </div>
            </div>
          )}

          {mode.id === "vender" && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground">Nível de venda</p>
              <div className="flex flex-wrap gap-1.5">
                {SALE_LEVELS.map((s) => (
                  <Pill key={s.id} label={`${s.emoji} ${s.label}`} active={saleLevel === s.id} onClick={() => setSaleLevel(s.id)} />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {SALE_LEVELS.find((s) => s.id === saleLevel)?.hint}
              </p>
            </div>
          )}

          {mode.id === "pack_semanal" && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground">Produtos permitidos na semana</p>
              <div className="flex flex-wrap gap-1.5">
                {PACK_PRODUCTS.map((p) => (
                  <Pill
                    key={p.id}
                    label={p.label}
                    active={products.includes(p.id)}
                    onClick={() => setProducts((prev) => prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id])}
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">{mixLabel}</p>
            </div>
          )}

          {mode.id !== "ia_decide" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-[11px] text-muted-foreground">Tom (opcional)</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRISM_TONES.map((t) => (
                    <Pill key={t.id} label={`${t.emoji} ${t.label}`} active={tone === t.id} onClick={() => setTone(tone === t.id ? "" : t.id)} />
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] text-muted-foreground">Objetivo (opcional)</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRISM_OBJECTIVES.map((t) => (
                    <Pill key={t.id} label={`${t.emoji} ${t.label}`} active={objective === t.id} onClick={() => setObjective(objective === t.id ? "" : t.id)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <Textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="O que está acontecendo? Ex: treino de perna hoje, filha foi na academia comigo, quero falar sobre metabolismo lento..."
            rows={3}
            className="text-sm"
          />

          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/mp4,video/quicktime"
              multiple
              hidden
              onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ""; }}
            />
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="text-xs gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              {mode.needsFiles ? "Enviar material" : "Material (opcional)"}
            </Button>
            {!!files.length && (
              <div className="flex flex-wrap gap-2 mt-3">
                {files.map((f, i) => (
                  <div key={f.id} className="relative w-16 h-16 rounded-lg overflow-hidden border" style={{ borderColor: `${accent}44` }}>
                    {f.thumb ? <img src={f.thumb} alt={f.name} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center"><Film className="w-4 h-4" /></div>}
                    <span className="absolute bottom-0 left-0 text-[9px] px-1 bg-black/70">{i}</span>
                    <button onClick={() => removeFile(f.id)} className="absolute top-0 right-0 bg-black/70 p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={() => setFiles([])} className="w-16 h-16 rounded-lg border border-dashed grid place-items-center text-muted-foreground">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <Button onClick={generate} disabled={loading} className="w-full gap-2" style={{ background: accent, color: "#000" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "PRISM processando..." : `Gerar ${mode.label}`}
          </Button>
        </div>
      </Section>

      {result && (
        <>
          {result.strategy && (
            <Section title="Estratégia">
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(result.strategy)
                  .filter(([k]) => k !== "reasoning")
                  .map(([k, v]) => (
                    <Badge key={k} variant="outline" className="text-[10px]">
                      {k.replace(/_/g, " ")}: {String(v)}
                    </Badge>
                  ))}
              </div>
              {result.strategy.reasoning && (
                <p className="text-xs text-muted-foreground mt-2">{result.strategy.reasoning}</p>
              )}
            </Section>
          )}

          {!!result.concepts?.length && (
            <Section title={`Conceitos (${result.concepts.length})`}>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {result.concepts.map((c, i) => (
                  <Pill key={i} label={c.title || `Conceito ${i + 1}`} active={openConcept === i} onClick={() => setOpenConcept(i)} />
                ))}
              </div>
              {(() => {
                const c = result.concepts?.[openConcept];
                if (!c) return null;
                return (
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-wrap gap-1.5">
                      {[c.format, c.tone, c.music_suggestion, c.duration_suggested ? `${c.duration_suggested}s` : ""]
                        .filter(Boolean)
                        .map((t, i) => <Badge key={i} variant="outline" className="text-[10px]">{String(t)}</Badge>)}
                    </div>
                    {c.why && <p className="text-xs text-muted-foreground">{c.why}</p>}

                    {c.hook && (
                      <div className="rounded-lg p-3" style={{ background: `${accent}12`, border: `1px solid ${accent}33` }}>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Hook</p>
                        <p className="font-semibold">{c.hook}</p>
                      </div>
                    )}

                    {!!c.screen_texts?.length && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Textos na tela</p>
                        <ul className="space-y-1">
                          {c.screen_texts.map((t, i) => <li key={i} className="text-xs">• {t}</li>)}
                        </ul>
                      </div>
                    )}

                    {c.script?.development && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Roteiro</p>
                        <p className="text-xs whitespace-pre-wrap">{c.script.development}</p>
                        {c.script.cta && <p className="text-xs mt-1 font-medium">CTA: {c.script.cta}</p>}
                      </div>
                    )}

                    {!!c.edit_sequence?.length && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                          <Scissors className="w-3 h-3" /> Sequência de edição
                        </p>
                        <ul className="space-y-1">
                          {c.edit_sequence.map((s, i) => (
                            <li key={i} className="text-xs">
                              {i + 1}. arquivo {s.file_index ?? 0} · {s.duration_s ?? 0.5}s · {s.transition || "corte"} — {s.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!!c.shot_list?.length && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> O que gravar
                        </p>
                        <ul className="space-y-1">{c.shot_list.map((t, i) => <li key={i} className="text-xs">• {t}</li>)}</ul>
                      </div>
                    )}

                    {!!c.editing_tips?.length && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                          <Clapperboard className="w-3 h-3" /> Dicas de edição
                        </p>
                        <ul className="space-y-1">{c.editing_tips.map((t, i) => <li key={i} className="text-xs">• {t}</li>)}</ul>
                      </div>
                    )}

                    {c.caption && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Legenda</p>
                          <Button size="sm" variant="ghost" className="h-6 text-[11px] gap-1" onClick={() => copyText(c.caption || "")}>
                            <Copy className="w-3 h-3" /> Copiar
                          </Button>
                        </div>
                        <p className="text-xs whitespace-pre-wrap">{c.caption}</p>
                      </div>
                    )}

                    {!!c.hashtags?.length && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Hashtags</p>
                          <Button size="sm" variant="ghost" className="h-6 text-[11px] gap-1" onClick={() => copyText((c.hashtags || []).join(" "))}>
                            <Copy className="w-3 h-3" /> Copiar
                          </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground break-words">{c.hashtags.join(" ")}</p>
                      </div>
                    )}

                    {c.self_comment && (
                      <div className="rounded-lg p-2 border text-xs" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                        <span className="text-muted-foreground">1º comentário: </span>{c.self_comment}
                      </div>
                    )}

                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => copyText(conceptText(c))}>
                      <Copy className="w-3.5 h-3.5" /> Copiar conceito completo
                    </Button>
                  </div>
                );
              })()}
            </Section>
          )}

          {!!result.week?.length && (
            <Section
              title="Pack Semanal"
              right={
                <Button size="sm" className="h-7 text-[11px] gap-1" disabled={scheduling} onClick={scheduleWeek} style={{ background: accent, color: "#000" }}>
                  {scheduling ? <Loader2 className="w-3 h-3 animate-spin" /> : <CalendarPlus className="w-3 h-3" />}
                  Agendar semana
                </Button>
              }
            >
              {result.week_summary && <p className="text-xs text-muted-foreground mb-3">{result.week_summary}</p>}
              <div className="space-y-2">
                {result.week.map((d, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-1" style={{ borderColor: `${accent}26` }}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold" style={{ color: accent }}>{d.date_label || d.weekday} · {d.time}</p>
                      <div className="flex gap-1">
                        {[d.format, d.funnel, d.product].filter((x) => x && x !== "nenhum").map((t, j) => (
                          <Badge key={j} variant="outline" className="text-[9px]">{String(t)}</Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm">{d.piece}</p>
                    {d.hook && <p className="text-xs text-muted-foreground">Hook: {d.hook}</p>}
                    {!!d.stories?.length && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground flex items-center gap-1">
                          <ListChecks className="w-3 h-3" /> {d.stories.length} stories
                        </summary>
                        <ul className="mt-1 space-y-0.5">{d.stories.map((s, j) => <li key={j}>• {s}</li>)}</ul>
                      </details>
                    )}
                    {d.caption && (
                      <Button size="sm" variant="ghost" className="h-6 text-[11px] gap-1 px-0" onClick={() => copyText(d.caption || "")}>
                        <Copy className="w-3 h-3" /> Copiar legenda
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}

export { PRISM_MODES };
export type { PrismModeDef };
