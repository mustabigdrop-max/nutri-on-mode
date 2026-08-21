import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft, ArrowRight, Copy, Loader2, Rocket, Search, Target, CalendarDays,
  BarChart3, GraduationCap, ShoppingCart, Check, Instagram, Trash2,
  RefreshCw, MessageSquare, Microscope, Camera, BookOpen, Lightbulb,
  ImagePlus, Trophy, Flame, Dna, ShieldCheck, FlaskConical, Sparkles,
  Package, Clapperboard,
} from "lucide-react";
import RepurposerPanel from "@/components/social/RepurposerPanel";
import DmObjectionsPanel from "@/components/social/DmObjectionsPanel";
import ViralAnalyzerPanel from "@/components/social/ViralAnalyzerPanel";
import SocialProofPanel from "@/components/social/SocialProofPanel";
import IdeasNowPanel from "@/components/social/IdeasNowPanel";
import PlaybookPanel from "@/components/social/PlaybookPanel";
import InstagramAccountPanel from "@/components/social/InstagramAccountPanel";
import PostProntoPanel from "@/components/social/PostProntoPanel";
import PrismPanel from "@/components/social/PrismPanel";
import BrandScorePanel from "@/components/social/BrandScorePanel";
import ViralLabPanel from "@/components/social/ViralLabPanel";
import ContentDnaPanel from "@/components/social/ContentDnaPanel";
import AuthorityPanel from "@/components/social/AuthorityPanel";
import ScienceBankPanel from "@/components/social/ScienceBankPanel";
import InstagramGuidePanel from "@/components/social/InstagramGuidePanel";
import ContentPackPanel from "@/components/social/ContentPackPanel";
import TechReelsPanel from "@/components/social/TechReelsPanel";
import { useInstagramAccount } from "@/hooks/useInstagramAccount";
import {
  ACADEMY_TRACKS, ACTION_PLAN, BIO_CRITERIA, CONTENT_PRODUCTS, DIFFERENTIALS,
  FORMAT_GROUPS, FORMAT_BRIEFS, formatLabel, TONES, TONE_BRIEFS, BEST_TIMES, STORIES_TIMES, PRE_POST_CHECKLIST,
  FUNNELS, IDEAL_MIX, NICHES, OBJECTIVES, PRODUCTS, PRODUCT_LADDER, VISUAL_PALETTE,
  VISUAL_RULES, VISUAL_TYPOGRAPHY, WEEKLY_CHECKLIST_ITEMS, mondayOf,
} from "@/data/socialOnData";

const ACCENT = "#A855F7";
const ACCENT2 = "#00D4FF";

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

const copy = (t: string) => {
  navigator.clipboard.writeText(t);
  toast.success("Copiado");
};

const Bar = ({ value, color }: { value: number; color: string }) => (
  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
    <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, background: color }} />
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: `${ACCENT}33`, background: "rgba(255,255,255,0.02)" }}>
    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-mono">{title}</p>
    {children}
  </div>
);

const CheckRow = ({ checked, label, onClick }: { checked: boolean; label: string; onClick?: () => void }) => (
  <button onClick={onClick} className="flex items-start gap-2 text-left w-full py-1" type="button">
    <Checkbox checked={checked} className="mt-0.5 pointer-events-none" />
    <span className={`text-sm ${checked ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
  </button>
);

type ContentRow = {
  id: string;
  funnel: string;
  format: string;
  objective: string | null;
  product: string | null;
  topic: string | null;
  hook: string | null;
  script: string | null;
  caption: string | null;
  hashtags: string[] | null;
  production_tips: any;
  strategy_notes: string | null;
  scheduled_date: string | null;
  published: boolean;
  created_at: string;
};

const SocialOnModulePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const uid = user?.id ?? "";

  const [tab, setTab] = useState("prism");
  const [loading, setLoading] = useState(true);

  // profile
  const [handle, setHandle] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [differentials, setDifferentials] = useState<string[]>([]);
  const [bioCurrent, setBioCurrent] = useState("");
  const [bioScore, setBioScore] = useState<number | null>(null);
  const [auditDone, setAuditDone] = useState(false);

  // audit wizard
  const [step, setStep] = useState(1);
  const [bioResult, setBioResult] = useState<any>(null);
  const [feedInput, setFeedInput] = useState("");
  const [feedResult, setFeedResult] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // create content
  const [funnel, setFunnel] = useState("tofu");
  const [format, setFormat] = useState("talking_head");
  const [tone, setTone] = useState("agressivo");
  const [prePost, setPrePost] = useState<Record<string, boolean>>({});
  const [objective, setObjective] = useState("seguidores");
  const [product, setProduct] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [generated, setGenerated] = useState<any>(null);

  // lists
  const [contents, setContents] = useState<ContentRow[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [learning, setLearning] = useState<Record<string, boolean>>({});
  const [ladderOpen, setLadderOpen] = useState<string | null>(null);
  const [ladderMetrics, setLadderMetrics] = useState<Record<string, string>>({});
  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);

  const ig = useInstagramAccount();

  const aiCtx = useMemo(
    () => ({
      handle: ig.account?.username || handle,
      niches,
      products,
      differentials,
      ig_profile: ig.account
        ? {
            name: ig.account.full_name,
            username: ig.account.username,
            bio: ig.account.biography,
            followers: ig.account.followers_count,
            recent_captions: (ig.account.recent_media || [])
              .map((m) => m.caption)
              .filter(Boolean)
              .slice(0, 6),
          }
        : null,
    }),
    [handle, niches, products, differentials, ig.account]
  );

  const weekStart = useMemo(() => mondayOf(), []);

  const loadAll = useCallback(async () => {
    if (!uid) return;
    const [{ data: prof }, { data: cts }, { data: chk }, { data: lrn }, { data: coach }] = await Promise.all([
      supabase.from("social_profile").select("*").eq("coach_id", uid).maybeSingle(),
      supabase.from("social_content").select("*").eq("coach_id", uid).order("created_at", { ascending: false }),
      supabase.from("social_weekly_checklist").select("*").eq("coach_id", uid).eq("week_start", weekStart).maybeSingle(),
      supabase.from("social_learning_progress").select("*").eq("coach_id", uid),
      supabase.from("coach_profiles").select("id, instagram_handle").eq("user_id", uid).maybeSingle(),
    ]);
    setCoachProfileId((coach as any)?.id ?? null);
    if (prof) {
      setHandle(prof.instagram_handle || coach?.instagram_handle || "");
      setNiches((prof.niches as string[]) || []);
      setProducts((prof.products as string[]) || []);
      setDifferentials((prof.differentials as string[]) || []);
      setBioCurrent(prof.bio_current || "");
      setBioScore(prof.bio_score);
      setAuditDone(!!prof.audit_completed);
      setLadderMetrics(((prof as any).ladder_metrics as Record<string, string>) || {});
    } else if (coach?.instagram_handle) {
      setHandle(coach.instagram_handle);
    }
    setContents((cts as ContentRow[]) || []);
    setChecklist(((chk?.items as Record<string, boolean>) || {}));
    setLearning(Object.fromEntries(((lrn as any[]) || []).map((l) => [`${l.track}::${l.lesson}`, l.completed])));
    setLoading(false);
  }, [uid, weekStart]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const saveProfile = async (extra: Record<string, any> = {}) => {
    if (!uid) return;
    const payload = {
      coach_id: uid,
      instagram_handle: handle.replace("@", ""),
      niches, products, differentials,
      bio_current: bioCurrent,
      ...extra,
    };
    const { error } = await supabase.from("social_profile").upsert(payload as any, { onConflict: "coach_id" });
    if (error) toast.error(error.message);
  };

  const callAI = async (body: Record<string, any>) => {
    const { data, error } = await supabase.functions.invoke("social-on-generate", { body });
    if (error) throw new Error(error.message);
    if ((data as any)?.error) throw new Error((data as any).error);
    return (data as any).result;
  };

  const runBioAudit = async () => {
    if (!bioCurrent.trim()) return toast.error("Cole sua bio atual");
    setBusy("bio");
    try {
      const r = await callAI({
        mode: "bio_audit", handle, bio: bioCurrent, niches, products, differentials,
        criteria: BIO_CRITERIA,
      });
      setBioResult(r);
      setBioScore(r?.score ?? null);
      await saveProfile({ bio_score: r?.score ?? null });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  const runFeedAudit = async () => {
    if (!feedInput.trim()) return toast.error("Descreva seus últimos posts");
    setBusy("feed");
    try {
      const r = await callAI({ mode: "feed_audit", handle, posts: feedInput, niches, products });
      setFeedResult(r);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  const finishAudit = async () => {
    await saveProfile({ audit_completed: true, audited_at: new Date().toISOString(), bio_score: bioScore });
    setAuditDone(true);
    toast.success("Auditoria concluída");
  };

  const saveLadderMetrics = async (next: Record<string, string>) => {
    setLadderMetrics(next);
    await saveProfile({ ladder_metrics: next });
  };

  const exportPlanPdf = async () => {
    const { default: JsPDF } = await import("jspdf");
    const doc = new JsPDF({ unit: "pt", format: "a4" });
    let y = 56;
    doc.setFontSize(18);
    doc.text("SOCIAL ON — Plano de ação", 40, y);
    y += 22;
    doc.setFontSize(10);
    doc.text(`@${handle.replace("@", "") || "—"}  ·  ${new Date().toLocaleDateString("pt-BR")}`, 40, y);
    if (bioScore != null) { y += 14; doc.text(`Score da bio: ${bioScore}/100`, 40, y); }
    y += 26;
    ACTION_PLAN.forEach((g) => {
      doc.setFontSize(13);
      doc.text(g.period, 40, y);
      y += 18;
      doc.setFontSize(11);
      g.items.forEach((i) => {
        doc.text(`${checklist[i] ? "[x]" : "[ ]"} ${i}`, 52, y);
        y += 16;
        if (y > 780) { doc.addPage(); y = 56; }
      });
      y += 10;
    });
    doc.save(`social-on-plano-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const generate = async () => {
    if (!topic.trim()) return toast.error("Descreva o tema/contexto");
    setBusy("gen");
    setGenerated(null);
    try {
      const r = await callAI({
        mode: "content_full", funnel, format, objective, product, topic, tone,
        formatBrief: FORMAT_BRIEFS[format],
        toneBrief: TONE_BRIEFS[tone],
        bestTime: format.startsWith("stories")
          ? STORIES_TIMES.join(" · ")
          : (BEST_TIMES[objective]?.windows || []).join(" ou "),
        handle, niches, products, differentials,
      });
      setGenerated(r);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  const saveContent = async () => {
    if (!generated || !uid) return;
    const script = [
      ...(generated.roteiro || []).map((b: any) => `${b.bloco}\n[${b.direcao}]\n${b.fala}`),
      ...(generated.stories_sequence || []).map((s: any) => `STORY ${s.numero} — ${s.visual}\n"${s.texto}"\n→ ${s.gatilho}`),
    ].join("\n\n");
    const { error } = await supabase.from("social_content").insert({
      coach_id: uid, funnel, format, objective, product, topic, tone,
      suggested_time: BEST_TIMES[objective]?.time ?? null,
      hook: generated.roteiro?.[0]?.fala ?? null,
      script,
      caption: generated.caption ?? null,
      hashtags: generated.hashtags ?? [],
      production_tips: generated.production_tips ?? null,
      strategy_notes: (generated.strategy?.porque_funciona || []).join("\n"),
      scheduled_date: new Date().toISOString().slice(0, 10),
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Salvo no calendário");
    loadAll();
  };

  const togglePublished = async (row: ContentRow) => {
    await supabase.from("social_content").update({ published: !row.published }).eq("id", row.id);
    loadAll();
  };
  const removeContent = async (id: string) => {
    await supabase.from("social_content").delete().eq("id", id);
    loadAll();
  };

  const toggleChecklist = async (item: string) => {
    const next = { ...checklist, [item]: !checklist[item] };
    setChecklist(next);
    const pct = Math.round((Object.values(next).filter(Boolean).length / WEEKLY_CHECKLIST_ITEMS.length) * 100);
    await supabase.from("social_weekly_checklist").upsert(
      { coach_id: uid, week_start: weekStart, items: next, completion_percent: pct } as any,
      { onConflict: "coach_id,week_start" }
    );
  };

  const toggleLesson = async (track: string, lesson: string) => {
    const key = `${track}::${lesson}`;
    const completed = !learning[key];
    setLearning((p) => ({ ...p, [key]: completed }));
    await supabase.from("social_learning_progress").upsert(
      { coach_id: uid, track, lesson, completed, completed_at: completed ? new Date().toISOString() : null } as any,
      { onConflict: "coach_id,track,lesson" }
    );
  };

  const startFromIdea = (idea: any) => {
    setFunnel(idea.funnel);
    setFormat(idea.format in FORMAT_BRIEFS ? idea.format : "talking_head");
    setObjective(idea.objective);
    setProduct(PRODUCT_LADDER.find((p) => p.ideas.includes(idea))?.name.split(" ")[0] ?? null);
    setTopic(idea.topic);
    setTab("criar");
    toast.success("Seleção preenchida — clique em GERAR CONTEÚDO");
  };

  const weekContents = contents.filter((c) => (c.scheduled_date || c.created_at.slice(0, 10)) >= weekStart);
  const VIDEO_FORMATS = ["reel", "edit", "talking_head", "clips_treino", "screen_recording", "pov", "timelapse"];
  const reels = weekContents.filter((c) => VIDEO_FORMATS.includes(c.format)).length;
  const storiesDays = new Set(weekContents.filter((c) => c.format.startsWith("stories")).map((c) => c.scheduled_date)).size;
  const carrosseis = weekContents.filter((c) => c.format === "carrossel" || c.format === "carrossel_fotos").length;
  const funnelCount = (f: string) => weekContents.filter((c) => c.funnel === f).length;
  const funnelPct = (f: string) => (weekContents.length ? Math.round((funnelCount(f) / weekContents.length) * 100) : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach-dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              📱 SOCIAL ON
              {auditDone && <Badge variant="outline" className="text-[10px]">Auditado</Badge>}
            </h1>
            {handle && (
              <a
                href={`https://instagram.com/${handle.replace("@", "")}`}
                target="_blank" rel="noreferrer"
                className="text-xs font-mono inline-flex items-center gap-1"
                style={{ color: ACCENT2 }}
              >
                <Instagram className="w-3 h-3" /> @{handle.replace("@", "")}
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto gap-1 bg-transparent">
            <TabsTrigger value="prism" className="text-xs gap-1"><Sparkles className="w-3 h-3" />PRISM</TabsTrigger>
            <TabsTrigger value="auditoria" className="text-xs gap-1"><Search className="w-3 h-3" />Auditoria</TabsTrigger>
            <TabsTrigger value="criar" className="text-xs gap-1"><Target className="w-3 h-3" />Criar</TabsTrigger>
            <TabsTrigger value="calendario" className="text-xs gap-1"><CalendarDays className="w-3 h-3" />Calendário</TabsTrigger>
            <TabsTrigger value="metricas" className="text-xs gap-1"><BarChart3 className="w-3 h-3" />Métricas</TabsTrigger>
            <TabsTrigger value="academia" className="text-xs gap-1"><GraduationCap className="w-3 h-3" />Academia</TabsTrigger>
            <TabsTrigger value="esteira" className="text-xs gap-1"><ShoppingCart className="w-3 h-3" />Esteira</TabsTrigger>
            <TabsTrigger value="repurposer" className="text-xs gap-1"><RefreshCw className="w-3 h-3" />Repurposer</TabsTrigger>
            <TabsTrigger value="dm" className="text-xs gap-1"><MessageSquare className="w-3 h-3" />DM &amp; Objeções</TabsTrigger>
            <TabsTrigger value="viral" className="text-xs gap-1"><Microscope className="w-3 h-3" />Viral</TabsTrigger>
            <TabsTrigger value="prova" className="text-xs gap-1"><Camera className="w-3 h-3" />Prova social</TabsTrigger>
            <TabsTrigger value="playbook" className="text-xs gap-1"><BookOpen className="w-3 h-3" />Playbook</TabsTrigger>
            <TabsTrigger value="ideias" className="text-xs gap-1"><Lightbulb className="w-3 h-3" />Ideias</TabsTrigger>
            <TabsTrigger value="post_pronto" className="text-xs gap-1"><ImagePlus className="w-3 h-3" />Post pronto</TabsTrigger>
            <TabsTrigger value="brand_score" className="text-xs gap-1"><Trophy className="w-3 h-3" />Brand Score</TabsTrigger>
            <TabsTrigger value="viral_lab" className="text-xs gap-1"><Flame className="w-3 h-3" />Viral Lab</TabsTrigger>
            <TabsTrigger value="dna" className="text-xs gap-1"><Dna className="w-3 h-3" />DNA</TabsTrigger>
            <TabsTrigger value="autoridade" className="text-xs gap-1"><ShieldCheck className="w-3 h-3" />Autoridade</TabsTrigger>
            <TabsTrigger value="ciencia" className="text-xs gap-1"><FlaskConical className="w-3 h-3" />Ciência</TabsTrigger>
          </TabsList>

          {/* ─────────── AUDITORIA ─────────── */}
          <TabsContent value="prism" className="mt-4">
            <PrismPanel
              ctx={aiCtx}
              handle={ig.account?.username || handle}
              onManualMode={() => setTab("post_pronto")}
            />
          </TabsContent>

          <TabsContent value="auditoria" className="space-y-4 mt-4">
            <InstagramAccountPanel
              account={ig.account}
              loading={ig.loading}
              onConnect={async (t) => {
                const acc = await ig.connect(t);
                if (acc?.username) {
                  setHandle(acc.username);
                  await saveProfile({ instagram_handle: acc.username, bio_current: acc.biography || bioCurrent });
                  if (acc.biography) setBioCurrent(acc.biography);
                }
              }}
              onSync={async () => {
                const acc = await ig.sync();
                if (acc?.biography) setBioCurrent(acc.biography);
              }}
              onDisconnect={ig.disconnect}
            />

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setStep(s)} className="flex-1 h-1.5 rounded-full"
                  style={{ background: s <= step ? ACCENT : "rgba(255,255,255,0.08)" }} />
              ))}
            </div>
            <p className="text-[11px] font-mono text-muted-foreground">ETAPA {step}/5</p>

            {step === 1 && (
              <Section title="Identidade do perfil">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Seu @</label>
                  <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@seuperfil" />
                </div>
                {[
                  { t: "Nichos", list: NICHES, val: niches, set: setNiches },
                  { t: "Seus produtos", list: PRODUCTS, val: products, set: setProducts },
                  { t: "Diferenciais únicos", list: DIFFERENTIALS, val: differentials, set: setDifferentials },
                ].map((g) => (
                  <div key={g.t} className="space-y-1">
                    <p className="text-xs text-muted-foreground mt-2">{g.t}</p>
                    {g.list.map((i) => (
                      <CheckRow key={i} checked={g.val.includes(i)} label={i} onClick={() => g.set(toggle(g.val, i))} />
                    ))}
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button onClick={async () => { await saveProfile(); setStep(2); }} className="gap-2">
                    Próximo <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

              </Section>
            )}

            {step === 2 && (
              <Section title="Análise da bio">
                <Textarea value={bioCurrent} onChange={(e) => setBioCurrent(e.target.value)} rows={5} placeholder="Cole sua bio atual" />
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button onClick={runBioAudit} disabled={busy === "bio"} className="gap-2">
                    {busy === "bio" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Analisar
                  </Button>
                </div>

                {bioResult && (
                  <div className="space-y-3">
                    <p className="text-2xl font-bold font-mono" style={{ color: ACCENT }}>{bioResult.score}/100</p>
                    <div className="space-y-1">
                      {(bioResult.criteria || []).map((c: any) => (
                        <div key={c.key} className="flex items-center justify-between text-sm">
                          <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.ok ? "☑" : "☐"} {c.label}</span>
                          <span className="font-mono text-xs" style={{ color: c.ok ? "#00FF88" : "#FF5C5C" }}>{c.points > 0 ? `+${c.points}` : c.points}</span>
                        </div>
                      ))}
                    </div>
                    {(bioResult.options || []).map((o: any) => (
                      <div key={o.id} className="rounded-lg border p-3 space-y-2" style={{ borderColor: `${ACCENT}22` }}>
                        <p className="text-[11px] uppercase font-mono text-muted-foreground">Opção {o.id} ({o.style})</p>
                        <pre className="text-sm whitespace-pre-wrap font-sans">{o.bio}</pre>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => copy(o.bio)}>
                          <Copy className="w-3 h-3" /> Copiar {o.id}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1"><Button onClick={() => setStep(3)} className="gap-2">Próximo <ArrowRight className="w-4 h-4" /></Button></div>
              </Section>
            )}

            {step === 3 && (
              <Section title="Análise do feed">
                <Textarea value={feedInput} onChange={(e) => setFeedInput(e.target.value)} rows={6}
                  placeholder="Descreva seus últimos 9 posts (temas, formatos, objetivo de cada um)" />
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button onClick={runFeedAudit} disabled={busy === "feed"} className="gap-2">
                    {busy === "feed" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Analisar feed
                  </Button>
                </div>
                {feedResult && (
                  <div className="space-y-4">
                    {[["Mix atual", feedResult.current_mix, ACCENT], ["Mix ideal (fase de crescimento)", feedResult.ideal_mix || IDEAL_MIX, ACCENT2]].map(([t, mix, color]: any) => (
                      <div key={t} className="space-y-2">
                        <p className="text-xs text-muted-foreground">{t}</p>
                        {Object.entries(mix || {}).map(([k, v]: any) => (
                          <div key={k} className="space-y-1">
                            <div className="flex justify-between text-xs"><span className="capitalize">{k.replace("_", " ")}</span><span className="font-mono">{v}%</span></div>
                            <Bar value={v} color={color} />
                          </div>
                        ))}
                      </div>
                    ))}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">⚠️ Problemas</p>
                      {(feedResult.problems || []).map((p: string, i: number) => <p key={i} className="text-sm">→ {p}</p>)}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">✅ Ações imediatas</p>
                      {(feedResult.actions || []).map((p: string, i: number) => <p key={i} className="text-sm">{i + 1}. {p}</p>)}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1"><Button onClick={() => setStep(4)} className="gap-2">Próximo <ArrowRight className="w-4 h-4" /></Button></div>
              </Section>
            )}

            {step === 4 && (
              <Section title="Identidade visual">
                <div className="space-y-2">
                  {VISUAL_PALETTE.map((c) => (
                    <div key={c.hex} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 rounded border border-white/10" style={{ background: c.hex }} />
                      <span className="font-mono text-xs">{c.hex}</span>
                      <span className="text-muted-foreground text-xs">({c.note})</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tipografia</p>
                  {VISUAL_TYPOGRAPHY.map((t) => <p key={t} className="text-sm">{t}</p>)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Regras visuais</p>
                  {VISUAL_RULES.map((t) => <p key={t} className="text-sm">✅ {t}</p>)}
                </div>
                <div className="flex flex-wrap gap-2 pt-1"><Button onClick={() => setStep(5)} className="gap-2">Próximo <ArrowRight className="w-4 h-4" /></Button></div>
              </Section>
            )}

            {step === 5 && (
              <Section title="Plano de ação">
                {ACTION_PLAN.map((g) => (
                  <div key={g.period} className="space-y-1">
                    <p className="text-xs font-mono text-muted-foreground mt-2">{g.period}</p>
                    {g.items.map((i) => (
                      <CheckRow key={i} checked={!!checklist[i]} label={i} onClick={() => toggleChecklist(i)} />
                    ))}
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={finishAudit} className="gap-2"><Check className="w-4 h-4" /> Concluir auditoria</Button>
                  <Button variant="outline" onClick={exportPlanPdf} className="gap-2">📥 Baixar plano como PDF</Button>
                </div>
              </Section>
            )}
          </TabsContent>

          {/* ─────────── CRIAR ─────────── */}
          <TabsContent value="criar" className="space-y-4 mt-4">
            <Section title="Passo 1 — Funil">
              <div className="grid grid-cols-3 gap-2">
                {FUNNELS.map((f) => (
                  <button key={f.id} onClick={() => setFunnel(f.id)} className="rounded-xl p-3 border text-left"
                    style={{ borderColor: funnel === f.id ? ACCENT : "rgba(255,255,255,0.08)", background: funnel === f.id ? `${ACCENT}14` : "transparent" }}>
                    <p className="text-sm font-bold">{f.emoji} {f.label}</p>
                    <p className="text-[10px] text-muted-foreground">{f.sub}</p>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Passo 2 — Formato">
              <p className="text-xs text-muted-foreground">O que você tem pra postar?</p>
              {FORMAT_GROUPS.map((g) => (
                <div key={g.group} className="space-y-2">
                  <p className="text-[10px] font-mono tracking-widest" style={{ color: ACCENT2 }}>{g.emoji} {g.group}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {g.options.map((f) => (
                      <button key={f.id} onClick={() => setFormat(f.id)} className="rounded-xl p-3 border text-center"
                        style={{ borderColor: format === f.id ? ACCENT : "rgba(255,255,255,0.08)", background: format === f.id ? `${ACCENT}14` : "transparent" }}>
                        <p className="text-lg">{f.emoji}</p>
                        <p className="text-[11px] leading-tight">{f.label}</p>
                        <p className="text-[9px] text-muted-foreground leading-tight">{f.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </Section>

            <Section title="Passo 3 — Objetivo específico">
              <div className="grid grid-cols-3 gap-2">
                {OBJECTIVES.map((o) => (
                  <button key={o.id} onClick={() => setObjective(o.id)} className="rounded-xl p-3 border text-center"
                    style={{ borderColor: objective === o.id ? ACCENT : "rgba(255,255,255,0.08)", background: objective === o.id ? `${ACCENT}14` : "transparent" }}>
                    <p className="text-lg">{o.emoji}</p>
                    <p className="text-[10px] leading-tight">{o.label}</p>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Passo 3.5 — Tom de voz">
              <div className="grid grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <button key={t.id} onClick={() => setTone(t.id)} className="rounded-xl p-3 border text-center"
                    style={{ borderColor: tone === t.id ? ACCENT : "rgba(255,255,255,0.08)", background: tone === t.id ? `${ACCENT}14` : "transparent" }}>
                    <p className="text-lg">{t.emoji}</p>
                    <p className="text-[11px] leading-tight">{t.label}</p>
                    <p className="text-[9px] text-muted-foreground leading-tight">{t.sub}</p>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Passo 4 — Produto (opcional)">
              <div className="grid grid-cols-4 gap-2">
                {CONTENT_PRODUCTS.map((p) => (
                  <button key={p.id} onClick={() => setProduct(product === p.id ? null : p.id)} className="rounded-xl p-3 border text-center"
                    style={{ borderColor: product === p.id ? ACCENT : "rgba(255,255,255,0.08)", background: product === p.id ? `${ACCENT}14` : "transparent" }}>
                    <p className="text-lg">{p.emoji}</p>
                    <p className="text-[10px]">{p.label}</p>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Passo 5 — Tema / Contexto">
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ex: Caminhando falando sobre disciplina" />
              <Button onClick={generate} disabled={busy === "gen"} className="gap-2 w-full">
                {busy === "gen" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />} GERAR CONTEÚDO
              </Button>
            </Section>

            {generated && (
              <div className="space-y-3">
                <p className="text-[11px] font-mono" style={{ color: ACCENT }}>
                  {funnel.toUpperCase()} · {formatLabel(format).toUpperCase()} · {objective.toUpperCase()} · TOM {tone.toUpperCase()}{product ? ` · ${product}` : ""}
                </p>

                {!!(generated.roteiro || []).length && (
                  <Section title="Roteiro">
                    {generated.roteiro.map((b: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs font-mono" style={{ color: ACCENT2 }}>{b.bloco}</p>
                        <p className="text-xs text-muted-foreground">[{b.direcao}]</p>
                        <p className="text-sm whitespace-pre-wrap">{b.fala}</p>
                      </div>
                    ))}
                  </Section>
                )}

                {!!(generated.stories_sequence || []).length && (
                  <Section title="Sequência de stories">
                    {generated.stories_sequence.map((s: any) => (
                      <div key={s.numero} className="space-y-0.5">
                        <p className="text-xs font-mono" style={{ color: ACCENT2 }}>STORY {s.numero}</p>
                        <p className="text-xs text-muted-foreground">{s.visual}</p>
                        <p className="text-sm">"{s.texto}"</p>
                        <p className="text-[11px] text-muted-foreground">→ Gatilho: {s.gatilho}</p>
                      </div>
                    ))}
                  </Section>
                )}

                {generated.caption && (
                  <Section title="Legenda">
                    <pre className="text-sm whitespace-pre-wrap font-sans">{generated.caption}</pre>
                    <p className="text-xs" style={{ color: ACCENT2 }}>{(generated.hashtags || []).join(" ")}</p>
                    <Button size="sm" variant="outline" className="gap-2"
                      onClick={() => copy(`${generated.caption}\n\n${(generated.hashtags || []).join(" ")}`)}>
                      <Copy className="w-3 h-3" /> Copiar legenda
                    </Button>
                  </Section>
                )}

                {generated.production_tips && (
                  <Section title="Dicas de produção">
                    {Object.entries(generated.production_tips).map(([k, v]: any) => (
                      <div key={k} className="text-sm">
                        <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}: </span>
                        {Array.isArray(v) ? <span>{v.join(" · ")}</span> : <span>{String(v)}</span>}
                      </div>
                    ))}
                  </Section>
                )}

                {generated.strategy && (
                  <Section title="Estratégia">
                    {(generated.strategy.porque_funciona || []).map((s: string, i: number) => (
                      <p key={i} className="text-sm">{i + 1}. {s}</p>
                    ))}
                    <p className="text-xs text-muted-foreground">Gatilhos: {(generated.strategy.gatilhos || []).join(", ")}</p>
                  </Section>
                )}

                {generated.hashtags_grupos && (
                  <Section title="Hashtags por tipo">
                    {[
                      { k: "grandes", dot: "🔴", label: "GRANDES (>1M — alcance)" },
                      { k: "medias", dot: "🟡", label: "MÉDIAS (100K-1M)" },
                      { k: "nichadas", dot: "🟢", label: "NICHADAS (<100K — descoberta)" },
                    ].map(({ k, dot, label }) => (
                      <div key={k} className="space-y-0.5">
                        <p className="text-[10px] font-mono text-muted-foreground">{dot} {label}</p>
                        <p className="text-sm">{(generated.hashtags_grupos[k] || []).join(" ")}</p>
                      </div>
                    ))}
                    <p className="text-[10px] text-muted-foreground">Regra: 3 grandes + 7 médias + 5 nichadas = 15 no total.</p>
                  </Section>
                )}

                <Section title="Horário e self-comment">
                  <p className="text-sm">
                    ⏰ Melhor horário:{" "}
                    <span style={{ color: ACCENT }}>
                      {format.startsWith("stories") ? STORIES_TIMES.join(" · ") : (BEST_TIMES[objective]?.windows || []).join(" ou ")}
                    </span>
                  </p>
                  {!format.startsWith("stories") && BEST_TIMES[objective] && (
                    <p className="text-[11px] text-muted-foreground">{BEST_TIMES[objective].why}</p>
                  )}
                  {generated.self_comment && (
                    <>
                      <p className="text-sm whitespace-pre-wrap">💬 Self-comment: "{generated.self_comment}"</p>
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => copy(generated.self_comment)}>
                        <Copy className="w-3 h-3" /> Copiar self-comment
                      </Button>
                    </>
                  )}
                </Section>

                <Section title="Antes de postar, confirme">
                  {PRE_POST_CHECKLIST.map((item) => (
                    <label key={item} className="flex items-start gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={!!prePost[item]}
                        onChange={() => setPrePost((p) => ({ ...p, [item]: !p[item] }))}
                        className="mt-1 accent-current" style={{ accentColor: ACCENT }} />
                      <span>{item}</span>
                    </label>
                  ))}
                </Section>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={generate} className="gap-2">🔄 Gerar outro</Button>
                  <Button onClick={saveContent} className="gap-2"><Check className="w-4 h-4" /> Salvar no calendário</Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ─────────── CALENDÁRIO ─────────── */}
          <TabsContent value="calendario" className="space-y-3 mt-4">
            {contents.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Nenhum conteúdo salvo ainda.</CardContent></Card>
            ) : contents.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-mono" style={{ color: ACCENT }}>
                        {c.funnel.toUpperCase()} · {formatLabel(c.format).toUpperCase()} · {c.objective?.toUpperCase()}
                      </p>
                      <p className="text-sm font-semibold">{c.topic}</p>
                      <p className="text-[11px] text-muted-foreground">{c.scheduled_date || c.created_at.slice(0, 10)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant={c.published ? "default" : "outline"} onClick={() => togglePublished(c)}>
                        {c.published ? "Publicado" : "Marcar publicado"}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => removeContent(c.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  {c.caption && (
                    <details>
                      <summary className="text-xs text-muted-foreground cursor-pointer">Ver roteiro e legenda</summary>
                      <pre className="text-xs whitespace-pre-wrap font-sans mt-2">{c.script}</pre>
                      <pre className="text-xs whitespace-pre-wrap font-sans mt-2">{c.caption}</pre>
                      <Button size="sm" variant="outline" className="mt-2 gap-2" onClick={() => copy(`${c.caption}\n\n${(c.hashtags || []).join(" ")}`)}>
                        <Copy className="w-3 h-3" /> Copiar legenda
                      </Button>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ─────────── MÉTRICAS ─────────── */}
          <TabsContent value="metricas" className="space-y-4 mt-4">
            <Section title={`Semana de ${weekStart}`}>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between"><span>Reels</span><span>{reels}/7</span></div>
                <Bar value={(reels / 7) * 100} color={ACCENT} />
                <div className="flex justify-between"><span>Stories (dias)</span><span>{storiesDays}/7</span></div>
                <Bar value={(storiesDays / 7) * 100} color={ACCENT} />
                <div className="flex justify-between"><span>Carrosséis</span><span>{carrosseis}/2</span></div>
                <Bar value={(carrosseis / 2) * 100} color={ACCENT} />
              </div>
            </Section>

            <Section title="Mix de funil">
              {FUNNELS.map((f) => (
                <div key={f.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono"><span>{f.id.toUpperCase()}</span><span>{funnelPct(f.id)}%</span></div>
                  <Bar value={funnelPct(f.id)} color={ACCENT2} />
                </div>
              ))}
            </Section>

            <Section title="Checklist da semana">
              {WEEKLY_CHECKLIST_ITEMS.map((i) => (
                <CheckRow key={i} checked={!!checklist[i]} label={i} onClick={() => toggleChecklist(i)} />
              ))}
            </Section>

            <Section title="Alertas">
              {[
                weekContents.length === 0 && "Nenhum conteúdo registrado esta semana",
                !checklist["Postou transformação de cliente"] && "0 transformações postadas esta semana",
                !checklist["Mencionou MindForce naturalmente"] && !checklist["Mencionou VEMP naturalmente"] && "Nenhuma menção à MindForce ou VEMP",
                storiesDays < 4 && "Menos de 4 dias com Stories (perde relevância)",
              ].filter(Boolean).map((a) => (
                <p key={String(a)} className="text-sm" style={{ color: "#FFB800" }}>⚠️ {a}</p>
              ))}
            </Section>
          </TabsContent>

          {/* ─────────── ACADEMIA ─────────── */}
          <TabsContent value="academia" className="space-y-4 mt-4">
            {ACADEMY_TRACKS.map((t) => {
              const done = t.lessons.filter((l) => learning[`${t.id}::${l}`]).length;
              const pct = Math.round((done / t.lessons.length) * 100);
              return (
                <Section key={t.id} title={t.title}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1"><Bar value={pct} color={ACCENT} /></div>
                    <span className="text-xs font-mono">{pct}%</span>
                  </div>
                  {t.lessons.map((l) => (
                    <CheckRow key={l} checked={!!learning[`${t.id}::${l}`]} label={l} onClick={() => toggleLesson(t.id, l)} />
                  ))}
                </Section>
              );
            })}
            <p className="text-xs text-muted-foreground">
              Cada trilha tem 📝 lição, 🎯 exercício prático (postar 1 conteúdo usando) e ✅ check ao concluir.
            </p>
            <InstagramGuidePanel />
          </TabsContent>

          {/* ─────────── ESTEIRA ─────────── */}
          <TabsContent value="esteira" className="space-y-3 mt-4">
            <p className="text-[11px] font-mono text-muted-foreground">
              GRATUITO → ENTRADA → CORE → HIGH TICKET → RECORRENTE
            </p>
            {PRODUCT_LADDER.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{p.emoji} {p.name}</p>
                      <p className="text-xs font-mono" style={{ color: ACCENT2 }}>{p.price}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setLadderOpen(ladderOpen === p.id ? null : p.id)}>
                      {ladderOpen === p.id ? "Fechar" : "Ver estratégia →"}
                    </Button>
                  </div>
                  {ladderOpen === p.id && (
                    <div className="space-y-3 pt-2 border-t border-white/5">
                      <p className="text-xs text-muted-foreground">Frequência ideal: {p.frequency}</p>
                      <p className="text-[11px] uppercase font-mono text-muted-foreground">Formatos que funcionam</p>
                      {p.ideas.map((idea) => (
                        <div key={idea.title} className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm">{idea.emoji} {idea.title}</p>
                            <p className="text-[11px] text-muted-foreground">Funil: {idea.funnel.toUpperCase()} · Objetivo: {idea.objective}</p>
                          </div>
                          <Button size="sm" className="gap-1 shrink-0" onClick={() => startFromIdea(idea)}>
                            <Rocket className="w-3 h-3" /> Gerar
                          </Button>
                        </div>
                      ))}
                      <p className="text-[11px] uppercase font-mono text-muted-foreground">⚠️ Regras</p>
                      {p.rules.map((r) => <p key={r} className="text-sm">→ {r}</p>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Section title="Métricas da esteira">
              {[
                { key: "ticket_medio", label: "Ticket médio (R$)", ph: "0,00" },
                { key: "ltv", label: "LTV — lifetime value (R$)", ph: "0,00" },
                { key: "conv_ig_dm", label: "Conversão Instagram → DM (%)", ph: "0" },
                { key: "conv_dm_venda", label: "Conversão DM → Venda (%)", ph: "0" },
              ].map((m) => (
                <div key={m.key} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">{m.label}</span>
                  <Input
                    className="w-32 h-8 text-sm font-mono text-right"
                    inputMode="decimal"
                    placeholder={m.ph}
                    value={ladderMetrics[m.key] ?? ""}
                    onChange={(e) => setLadderMetrics({ ...ladderMetrics, [m.key]: e.target.value })}
                    onBlur={() => saveLadderMetrics(ladderMetrics)}
                  />
                </div>
              ))}
              <Button size="sm" variant="outline" className="gap-2" onClick={() => saveLadderMetrics(ladderMetrics)}>
                <Check className="w-3 h-3" /> Salvar métricas
              </Button>
            </Section>
          </TabsContent>
          <TabsContent value="repurposer" className="mt-4">
            <RepurposerPanel ctx={aiCtx} />
          </TabsContent>
          <TabsContent value="dm" className="mt-4">
            <DmObjectionsPanel ctx={aiCtx} />
          </TabsContent>
          <TabsContent value="viral" className="mt-4">
            <ViralAnalyzerPanel ctx={aiCtx} />
          </TabsContent>
          <TabsContent value="prova" className="mt-4">
            <SocialProofPanel
              coachProfileId={coachProfileId}
              handle={ig.account?.username || handle}
              coachName={ig.account?.full_name || null}
              coachAvatar={ig.account?.profile_picture_url || null}
              ctx={aiCtx}
            />
          </TabsContent>
          <TabsContent value="playbook" className="mt-4">
            <PlaybookPanel />
          </TabsContent>
          <TabsContent value="ideias" className="mt-4">
            <IdeasNowPanel ctx={aiCtx} onUseIdea={(t) => { setTopic(t); setTab("criar"); }} />
          </TabsContent>
          <TabsContent value="post_pronto" className="mt-4">
            <PostProntoPanel ctx={aiCtx} handle={ig.account?.username || handle} />
          </TabsContent>
          <TabsContent value="brand_score" className="mt-4">
            <BrandScorePanel
              handle={ig.account?.username || handle}
              onGenerate={(p) => { setTopic(p); setTab("criar"); }}
            />
          </TabsContent>
          <TabsContent value="viral_lab" className="mt-4">
            <ViralLabPanel ctx={aiCtx} />
          </TabsContent>
          <TabsContent value="dna" className="mt-4">
            <ContentDnaPanel ctx={aiCtx} />
          </TabsContent>
          <TabsContent value="autoridade" className="mt-4">
            <AuthorityPanel ctx={aiCtx} onOpenScience={() => setTab("ciencia")} />
          </TabsContent>
          <TabsContent value="ciencia" className="mt-4">
            <ScienceBankPanel ctx={aiCtx} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SocialOnModulePage;
