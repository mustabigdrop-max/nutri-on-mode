import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft, Instagram, Copy, Sparkles, Loader2, RefreshCw, Check, Trash2,
  CalendarDays, PenLine, Clapperboard, Hash, LayoutList, BarChart3, Brain,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PILLARS, FORMATS, HOOK_LIBRARY, CORE_HASHTAGS, HASHTAGS_BY_PILLAR,
  WEEKLY_CHECKLIST, WEEKDAYS, type SocialPillar,
} from "@/data/socialHooks";

type CalendarRow = {
  id: string;
  date: string;
  pillar: SocialPillar;
  format: string;
  topic: string;
  hook: string | null;
  caption: string | null;
  reel_script: string | null;
  hashtags: string[] | null;
  status: string;
};

const copy = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copiado para a área de transferência");
};

const mondayOf = (d = new Date()) => {
  const x = new Date(d);
  const diff = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - diff);
  return x.toISOString().slice(0, 10);
};

const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

async function callEngine<T>(payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("social-on-generate", { body: payload });
  if (error) throw new Error(error.message);
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return (data as { result: T }).result;
}

export default function SocialOnPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const coachId = user?.id;

  const [handle, setHandle] = useState("diogo.mell0");
  const [bio, setBio] = useState("");
  const [audit, setAudit] = useState<any>(null);
  const [auditing, setAuditing] = useState(false);

  const [rows, setRows] = useState<CalendarRow[]>([]);
  const [weekStart, setWeekStart] = useState(mondayOf());
  const [genWeek, setGenWeek] = useState(false);

  const [capPillar, setCapPillar] = useState<SocialPillar>("mce_drop");
  const [capFormat, setCapFormat] = useState<string>("carrossel");
  const [capTopic, setCapTopic] = useState("Autossabotagem na dieta");
  const [caption, setCaption] = useState<any>(null);
  const [capLoading, setCapLoading] = useState(false);

  const [reelPillar, setReelPillar] = useState<SocialPillar>("mce_drop");
  const [reelStyle, setReelStyle] = useState("Talking Head");
  const [reelDuration, setReelDuration] = useState("30-60s");
  const [reelTopic, setReelTopic] = useState("Neurociência da fome emocional");
  const [reel, setReel] = useState<any>(null);
  const [reelLoading, setReelLoading] = useState(false);

  const [tagTopic, setTagTopic] = useState("autossabotagem");
  const [tags, setTags] = useState<any>(null);
  const [tagLoading, setTagLoading] = useState(false);

  const [stories, setStories] = useState<any>(null);
  const [storiesLoading, setStoriesLoading] = useState(false);

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const loadCalendar = async () => {
    if (!coachId) return;
    const end = new Date(`${weekStart}T12:00:00`);
    end.setDate(end.getDate() + 6);
    const { data } = await supabase
      .from("social_content_calendar")
      .select("*")
      .eq("coach_id", coachId)
      .gte("date", weekStart)
      .lte("date", end.toISOString().slice(0, 10))
      .order("date");
    setRows((data as CalendarRow[]) ?? []);
  };

  useEffect(() => { loadCalendar(); /* eslint-disable-next-line */ }, [coachId, weekStart]);

  useEffect(() => {
    if (!coachId) return;
    supabase.from("social_audits").select("*").eq("coach_id", coachId)
      .order("audited_at", { ascending: false }).limit(1)
      .then(({ data }) => {
        const last = data?.[0];
        if (last) {
          setHandle(last.handle ?? "diogo.mell0");
          setAudit({ bio_score: last.bio_score, ...(last.recommendations as object), content_mix: last.content_mix, issues: last.issues });
        }
      });
  }, [coachId]);

  const runAudit = async () => {
    if (!coachId) return;
    setAuditing(true);
    try {
      const result = await callEngine<any>({ mode: "audit", handle, bio });
      setAudit(result);
      await supabase.from("social_audits").insert({
        coach_id: coachId,
        handle,
        bio_score: result.bio_score ?? null,
        content_mix: result.content_mix ?? {},
        issues: result.issues ?? [],
        recommendations: result,
      });
      toast.success("Auditoria concluída");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na auditoria");
    } finally { setAuditing(false); }
  };

  const generateWeek = async () => {
    if (!coachId) return;
    setGenWeek(true);
    try {
      const result = await callEngine<{ week: any[] }>({ mode: "calendar", weekStart, notes: audit?.issues?.join("; ") });
      const base = new Date(`${weekStart}T12:00:00`);
      const inserts = (result.week ?? []).slice(0, 7).map((d, i) => {
        const date = new Date(base);
        date.setDate(date.getDate() + i);
        return {
          coach_id: coachId,
          date: date.toISOString().slice(0, 10),
          pillar: (PILLARS as any)[d.pillar] ? d.pillar : "mce_drop",
          format: FORMATS.includes(d.format) ? d.format : "carrossel",
          topic: d.topic ?? "Conteúdo do dia",
          hook: d.hook ?? null,
          status: "draft",
        };
      });
      const end = new Date(base); end.setDate(end.getDate() + 6);
      await supabase.from("social_content_calendar").delete()
        .eq("coach_id", coachId).gte("date", weekStart).lte("date", end.toISOString().slice(0, 10));
      const { error } = await supabase.from("social_content_calendar").insert(inserts);
      if (error) throw error;
      await loadCalendar();
      toast.success("Semana gerada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar semana");
    } finally { setGenWeek(false); }
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from("social_content_calendar").update({
      status, published_at: status === "published" ? new Date().toISOString() : null,
    }).eq("id", id);
    loadCalendar();
  };

  const removeRow = async (id: string) => {
    await supabase.from("social_content_calendar").delete().eq("id", id);
    loadCalendar();
  };

  const genCaption = async () => {
    setCapLoading(true);
    try {
      setCaption(await callEngine<any>({ mode: "caption", pillar: capPillar, format: capFormat, topic: capTopic }));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Falha ao gerar"); }
    finally { setCapLoading(false); }
  };

  const genReel = async () => {
    setReelLoading(true);
    try {
      setReel(await callEngine<any>({ mode: "reel", pillar: reelPillar, style: reelStyle, duration: reelDuration, topic: reelTopic }));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Falha ao gerar"); }
    finally { setReelLoading(false); }
  };

  const genTags = async () => {
    setTagLoading(true);
    try { setTags(await callEngine<any>({ mode: "hashtags", topic: tagTopic })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Falha ao gerar"); }
    finally { setTagLoading(false); }
  };

  const genStories = async () => {
    setStoriesLoading(true);
    try {
      const today = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
      setStories(await callEngine<any>({ mode: "stories", notes: `Dia da semana: ${today}` }));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Falha ao gerar"); }
    finally { setStoriesLoading(false); }
  };

  const captionText = useMemo(() => {
    if (!caption) return "";
    return [caption.hook, "", caption.caption, "", caption.cta, "", (caption.hashtags ?? []).join(" ")]
      .filter(Boolean).join("\n");
  }, [caption]);

  const reelText = useMemo(() => {
    if (!reel) return "";
    return [
      `[HOOK] ${reel.hook}`, "", `[TENSÃO] ${reel.tensao}`, "", `[DESENVOLVIMENTO] ${reel.desenvolvimento}`,
      "", `[CTA] ${reel.cta}`, "", `[TEXTO NA TELA] ${(reel.texto_na_tela ?? []).join(" · ")}`,
      `[ÁUDIO] ${reel.audio_sugerido ?? "-"}`,
    ].join("\n");
  }, [reel]);

  const pillarCount = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r) => { c[r.pillar] = (c[r.pillar] ?? 0) + 1; });
    return c;
  }, [rows]);

  const published = rows.filter((r) => r.status === "published").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach-dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Instagram className="w-5 h-5" style={{ color: "#00D4FF" }} />
          <div>
            <h1 className="text-xl font-bold text-foreground">SOCIAL ON</h1>
            <p className="text-sm text-muted-foreground">Motor de crescimento no Instagram · @{handle}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <Tabs defaultValue="calendario">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="auditoria"><BarChart3 className="w-3.5 h-3.5 mr-1" /> Auditoria</TabsTrigger>
            <TabsTrigger value="pilares"><Brain className="w-3.5 h-3.5 mr-1" /> Pilares</TabsTrigger>
            <TabsTrigger value="calendario"><CalendarDays className="w-3.5 h-3.5 mr-1" /> Calendário</TabsTrigger>
            <TabsTrigger value="legendas"><PenLine className="w-3.5 h-3.5 mr-1" /> Legendas</TabsTrigger>
            <TabsTrigger value="reels"><Clapperboard className="w-3.5 h-3.5 mr-1" /> Reels</TabsTrigger>
            <TabsTrigger value="hooks"><Sparkles className="w-3.5 h-3.5 mr-1" /> Hooks</TabsTrigger>
            <TabsTrigger value="hashtags"><Hash className="w-3.5 h-3.5 mr-1" /> Hashtags</TabsTrigger>
            <TabsTrigger value="stories"><LayoutList className="w-3.5 h-3.5 mr-1" /> Stories</TabsTrigger>
          </TabsList>

          {/* AUDITORIA */}
          <TabsContent value="auditoria" className="space-y-4 pt-4">
            <Card><CardContent className="p-4 space-y-3">
              <div className="grid sm:grid-cols-[220px_1fr] gap-3">
                <Input value={handle} onChange={(e) => setHandle(e.target.value.replace("@", ""))} placeholder="seu.handle" />
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cole aqui sua bio atual do Instagram" rows={3} />
              </div>
              <Button onClick={runAudit} disabled={auditing} className="gap-2">
                {auditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Auditar perfil
              </Button>
            </CardContent></Card>

            {audit && (
              <div className="grid md:grid-cols-2 gap-4">
                <Card><CardContent className="p-4 space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Bio</p>
                  <p className="text-3xl font-bold font-mono" style={{ color: "#00D4FF" }}>{audit.bio_score ?? "—"}<span className="text-sm text-muted-foreground">/100</span></p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {(audit.bio_issues ?? []).map((i: string) => <li key={i}>☐ {i}</li>)}
                  </ul>
                  {audit.bio_suggestion && (
                    <>
                      <pre className="whitespace-pre-wrap text-sm bg-muted/40 rounded-lg p-3">{audit.bio_suggestion}</pre>
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => copy(audit.bio_suggestion)}>
                        <Copy className="w-3.5 h-3.5" /> Copiar bio sugerida
                      </Button>
                    </>
                  )}
                </CardContent></Card>

                <Card><CardContent className="p-4 space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Feed</p>
                  <p className="text-sm">Frequência: <b>{audit.frequency_current ?? "—"}</b> posts/semana · ideal <b>{audit.frequency_ideal ?? 5}</b></p>
                  <div className="space-y-1.5">
                    {Object.entries(audit.content_mix ?? {}).map(([k, v]) => {
                      const ideal = (audit.content_mix_ideal ?? {})[k];
                      const val = Number(v);
                      return (
                        <div key={k}>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span className="capitalize">{k.replace("_", " ")}</span>
                            <span>{val}% {ideal ? `(ideal ${ideal}%)` : ""}</span>
                          </div>
                          <div className="h-1 bg-muted rounded">
                            <div className="h-1 rounded" style={{ width: `${Math.min(val, 100)}%`, background: "#00D4FF" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {(audit.issues ?? []).map((i: string) => <li key={i}>⚠️ {i}</li>)}
                  </ul>
                  {(audit.quick_wins ?? []).length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Quick wins</p>
                      <ul className="text-sm space-y-1">{audit.quick_wins.map((q: string) => <li key={q}>💡 {q}</li>)}</ul>
                    </div>
                  )}
                </CardContent></Card>

                <Card className="md:col-span-2"><CardContent className="p-4 space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Identidade visual sugerida</p>
                  <p className="text-sm text-muted-foreground">Paleta nutriON <b>#020205</b> + <b>#00D4FF</b> + <b>#00FF88</b> · Rajdhani nos títulos · templates padronizados.</p>
                  <div className="flex gap-2">
                    {["#020205", "#00D4FF", "#00FF88"].map((c) => (
                      <span key={c} className="w-8 h-8 rounded" style={{ background: c, border: "1px solid rgba(255,255,255,.15)" }} />
                    ))}
                  </div>
                  {(audit.series_suggestions ?? []).length > 0 && (
                    <p className="text-sm pt-2">📌 Séries recorrentes: {audit.series_suggestions.join(" · ")}</p>
                  )}
                </CardContent></Card>
              </div>
            )}
          </TabsContent>

          {/* PILARES */}
          <TabsContent value="pilares" className="pt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.entries(PILLARS) as [SocialPillar, typeof PILLARS[SocialPillar]][]).map(([key, p]) => (
                <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card style={{ borderColor: `${p.color}44` }}>
                    <CardContent className="p-4 space-y-1.5">
                      <p className="font-bold" style={{ color: p.color }}>{p.emoji} {p.label} · {p.share}</p>
                      <p className="text-sm text-muted-foreground">{p.desc}</p>
                      <p className="text-xs text-muted-foreground">Formato: {p.formats}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* CALENDÁRIO */}
          <TabsContent value="calendario" className="space-y-4 pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Input type="date" value={weekStart} onChange={(e) => setWeekStart(mondayOf(new Date(`${e.target.value}T12:00:00`)))} className="w-44" />
              <Button onClick={generateWeek} disabled={genWeek} className="gap-2">
                {genWeek ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Gerar nova semana
              </Button>
              <Badge variant="outline">{published}/{rows.length || 7} publicados</Badge>
            </div>

            <div className="space-y-2">
              {rows.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
                  Nenhum conteúdo planejado para essa semana. Clique em “Gerar nova semana”.
                </CardContent></Card>
              ) : rows.map((r, i) => {
                const p = PILLARS[r.pillar] ?? PILLARS.mce_drop;
                return (
                  <Card key={r.id} style={{ borderColor: `${p.color}33` }}>
                    <CardContent className="p-3 flex items-start gap-3 flex-wrap">
                      <div className="min-w-[64px]">
                        <p className="text-xs font-mono" style={{ color: p.color }}>{WEEKDAYS[i] ?? ""}</p>
                        <p className="text-[11px] text-muted-foreground">{fmtDate(r.date)}</p>
                      </div>
                      <div className="flex-1 min-w-[220px]">
                        <p className="text-xs" style={{ color: p.color }}>{p.emoji} {p.label} · {r.format}</p>
                        <p className="text-sm text-foreground">{r.topic}</p>
                        {r.hook && <p className="text-xs text-muted-foreground italic mt-0.5">“{r.hook}”</p>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => copy(`${r.hook ?? ""}\n\n${r.topic}`)}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant={r.status === "published" ? "default" : "outline"} className="gap-1"
                          onClick={() => setStatus(r.id, r.status === "published" ? "draft" : "published")}>
                          <Check className="w-3.5 h-3.5" /> {r.status === "published" ? "Publicado" : "Pronto"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => removeRow(r.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* MÉTRICAS / CHECKLIST */}
            <Card><CardContent className="p-4 space-y-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Checklist semanal</p>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {WEEKLY_CHECKLIST.map((c) => (
                  <button key={c} onClick={() => setChecked((s) => ({ ...s, [c]: !s[c] }))}
                    className="text-left text-sm flex items-center gap-2">
                    <span className="w-4">{checked[c] ? "☑" : "☐"}</span> {c}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-border text-sm space-y-1">
                {(Object.keys(PILLARS) as SocialPillar[]).filter((k) => !pillarCount[k]).map((k) => (
                  <p key={k} className="text-muted-foreground">⚠️ Nenhum conteúdo de <b>{PILLARS[k].label}</b> essa semana.</p>
                ))}
              </div>
            </CardContent></Card>
          </TabsContent>

          {/* LEGENDAS */}
          <TabsContent value="legendas" className="space-y-4 pt-4">
            <Card><CardContent className="p-4 space-y-3">
              <div className="grid sm:grid-cols-3 gap-2">
                <select className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
                  value={capPillar} onChange={(e) => setCapPillar(e.target.value as SocialPillar)}>
                  {(Object.entries(PILLARS) as [SocialPillar, any][]).map(([k, p]) => <option key={k} value={k}>{p.emoji} {p.label}</option>)}
                </select>
                <select className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
                  value={capFormat} onChange={(e) => setCapFormat(e.target.value)}>
                  {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <Input value={capTopic} onChange={(e) => setCapTopic(e.target.value)} placeholder="Tema" />
              </div>
              <Button onClick={genCaption} disabled={capLoading} className="gap-2">
                {capLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Gerar legenda
              </Button>
            </CardContent></Card>

            {caption && (
              <Card><CardContent className="p-4 space-y-3">
                <Textarea value={captionText} onChange={() => {}} rows={18} readOnly className="font-mono text-sm" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => copy(captionText)} className="gap-2"><Copy className="w-3.5 h-3.5" /> Copiar</Button>
                  <Button size="sm" variant="outline" onClick={genCaption} className="gap-2"><RefreshCw className="w-3.5 h-3.5" /> Outra versão</Button>
                </div>
              </CardContent></Card>
            )}
          </TabsContent>

          {/* REELS */}
          <TabsContent value="reels" className="space-y-4 pt-4">
            <Card><CardContent className="p-4 space-y-3">
              <div className="grid sm:grid-cols-4 gap-2">
                <select className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
                  value={reelPillar} onChange={(e) => setReelPillar(e.target.value as SocialPillar)}>
                  {(Object.entries(PILLARS) as [SocialPillar, any][]).map(([k, p]) => <option key={k} value={k}>{p.emoji} {p.label}</option>)}
                </select>
                <select className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
                  value={reelStyle} onChange={(e) => setReelStyle(e.target.value)}>
                  {["Talking Head", "POV", "Narrativo", "Humor", "B-roll + voz off"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <select className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
                  value={reelDuration} onChange={(e) => setReelDuration(e.target.value)}>
                  {["15-30s", "30-60s", "60-90s"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <Input value={reelTopic} onChange={(e) => setReelTopic(e.target.value)} placeholder="Tema" />
              </div>
              <Button onClick={genReel} disabled={reelLoading} className="gap-2">
                {reelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clapperboard className="w-4 h-4" />} Gerar roteiro
              </Button>
            </CardContent></Card>

            {reel && (
              <Card><CardContent className="p-4 space-y-3">
                <pre className="whitespace-pre-wrap text-sm bg-muted/40 rounded-lg p-3">{reelText}</pre>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => copy(reelText)} className="gap-2"><Copy className="w-3.5 h-3.5" /> Copiar</Button>
                  <Button size="sm" variant="outline" onClick={genReel} className="gap-2"><RefreshCw className="w-3.5 h-3.5" /> Outra versão</Button>
                </div>
              </CardContent></Card>
            )}
          </TabsContent>

          {/* HOOKS */}
          <TabsContent value="hooks" className="space-y-3 pt-4">
            {HOOK_LIBRARY.map((group) => (
              <Card key={group.category}><CardContent className="p-4 space-y-2">
                <p className="font-bold" style={{ color: PILLARS[group.pillar].color }}>{group.emoji} {group.category}</p>
                <div className="space-y-1">
                  {group.hooks.map((h) => (
                    <button key={h} onClick={() => copy(h)}
                      className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors flex items-start gap-2">
                      <Copy className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" /> {h}
                    </button>
                  ))}
                </div>
              </CardContent></Card>
            ))}
          </TabsContent>

          {/* HASHTAGS */}
          <TabsContent value="hashtags" className="space-y-4 pt-4">
            <Card><CardContent className="p-4 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Core (sempre usar)</p>
              <p className="text-sm">{CORE_HASHTAGS.join(" ")}</p>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => copy(CORE_HASHTAGS.join(" "))}>
                <Copy className="w-3.5 h-3.5" /> Copiar core
              </Button>
              <div className="pt-3 grid sm:grid-cols-2 gap-3">
                {Object.entries(HASHTAGS_BY_PILLAR).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <button className="text-sm text-left hover:underline" onClick={() => copy(v.join(" "))}>{v.join(" ")}</button>
                  </div>
                ))}
              </div>
            </CardContent></Card>

            <Card><CardContent className="p-4 space-y-3">
              <div className="flex gap-2 flex-wrap">
                <Input value={tagTopic} onChange={(e) => setTagTopic(e.target.value)} placeholder="Tema do post" className="max-w-xs" />
                <Button onClick={genTags} disabled={tagLoading} className="gap-2">
                  {tagLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />} Gerar hashtags
                </Button>
              </div>
              {tags && (
                <div className="space-y-2 text-sm">
                  {(["grandes", "medias", "nichadas"] as const).map((k) => (
                    <div key={k}>
                      <p className="text-xs uppercase text-muted-foreground">{k}</p>
                      <p>{(tags[k] ?? []).join(" ")}</p>
                    </div>
                  ))}
                  <Button size="sm" onClick={() => copy([...CORE_HASHTAGS, ...(tags.grandes ?? []), ...(tags.medias ?? []), ...(tags.nichadas ?? [])].join(" "))} className="gap-2">
                    <Copy className="w-3.5 h-3.5" /> Copiar set completo
                  </Button>
                </div>
              )}
            </CardContent></Card>
          </TabsContent>

          {/* STORIES */}
          <TabsContent value="stories" className="space-y-4 pt-4">
            <Button onClick={genStories} disabled={storiesLoading} className="gap-2">
              {storiesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LayoutList className="w-4 h-4" />} Gerar roteiro de hoje
            </Button>
            {stories && (
              <Card><CardContent className="p-4 space-y-4">
                {([["MANHÃ (06-09h)", "manha"], ["TARDE (12-15h)", "tarde"], ["NOITE (19-22h)", "noite"]] as const).map(([label, key]) => (
                  <div key={key}>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <ol className="list-decimal ml-5 text-sm space-y-1 mt-1">
                      {(stories[key] ?? []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ol>
                  </div>
                ))}
                {stories.enquete && <p className="text-sm">📊 Enquete: {stories.enquete}</p>}
                <Button size="sm" onClick={() => copy(JSON.stringify(stories, null, 2))} className="gap-2">
                  <Copy className="w-3.5 h-3.5" /> Copiar roteiro do dia
                </Button>
              </CardContent></Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
