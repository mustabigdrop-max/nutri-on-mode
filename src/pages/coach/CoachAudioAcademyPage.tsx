import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Headphones, Upload, Loader2, Plus, Play, Trash2, CheckCircle2,
  Users, Library, Sunrise, Save, Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { SERIES_META, type AudioSeries } from "@/data/mceAudioCatalog";
import { resolveAudioSrc, buildAudioPath, MCE_AUDIO_BUCKET } from "@/lib/mceAudioStorage";
import AudioPlayerBar, { type PlayerTrack } from "@/components/audio/AudioPlayerBar";

const GOLD = "#E8A020";
const BG = "#03030a";
const DIM = "rgba(255,255,255,0.55)";
const CARD = "rgba(255,255,255,0.03)";

type Episode = {
  id: string;
  series: string;
  episode_number: number | null;
  title: string;
  description: string | null;
  duration_seconds: number;
  audio_url: string | null;
  scientific_reference: string | null;
  sort_order: number;
};

type ProgressRow = {
  user_id: string;
  episode_id: string;
  progress_seconds: number;
  completed: boolean;
  updated_at: string;
};

type Athlete = { userId: string; name: string };

const SERIES_ORDER: AudioSeries[] = [
  "mindset", "comportamento", "execucao", "ciencia", "masterclass",
  "breathwork", "reprogramacao", "emergencia", "focus",
  "reset_semanal", "review_mensal", "journaling",
  "vida_real", "competicao", "biohacking",
  "carreira", "relacionamentos", "parentalidade", "financas", "ritual",
];
const fmtMin = (s: number) => `${Math.max(1, Math.round(s / 60))} min`;

type TabKey = "biblioteca" | "rituais" | "progresso";

export default function CoachAudioAcademyPage({ embedded = false }: { embedded?: boolean } = {}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useCoachProfile();

  const [tab, setTab] = useState<TabKey>("biblioteca");
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [batch, setBatch] = useState<{ done: number; total: number } | null>(null);
  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const [openSeries, setOpenSeries] = useState<AudioSeries | null>("mindset");
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  // novo episódio
  const [newSeries, setNewSeries] = useState<AudioSeries>("mindset");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newMin, setNewMin] = useState(15);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const createRef = useRef<HTMLDivElement | null>(null);

  const openCreate = () => {
    setTab((t) => (t === "progresso" ? "biblioteca" : t));
    setShowCreate(true);
    setTimeout(() => createRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  };

  // progresso clientes
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [rituals, setRituals] = useState<{ user_id: string; ritual_date: string }[]>([]);
  const [briefings, setBriefings] = useState<{ user_id: string; listened: boolean }[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    document.title = "Áudios do Coach · MCE Audio Academy";
  }, []);

  const loadEpisodes = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("mce_audio_episodes")
      .select("id, series, episode_number, title, description, duration_seconds, audio_url, scientific_reference, sort_order")
      .order("sort_order", { ascending: true });
    setEpisodes((data as Episode[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadEpisodes(); }, [loadEpisodes]);

  const loadProgress = useCallback(async () => {
    if (!profile?.id) return;
    setLoadingProgress(true);
    const { data: links } = await supabase
      .from("coach_patients")
      .select("patient_user_id")
      .eq("coach_id", profile.id)
      .eq("status", "active");

    const ids = (links || []).map((l) => l.patient_user_id).filter(Boolean) as string[];
    if (ids.length === 0) {
      setAthletes([]); setProgress([]); setRituals([]); setBriefings([]);
      setLoadingProgress(false);
      return;
    }

    const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const [{ data: profs }, { data: prog }, { data: rit }, { data: brief }] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name").in("user_id", ids),
      supabase.from("client_audio_progress").select("user_id, episode_id, progress_seconds, completed, updated_at").in("user_id", ids),
      supabase.from("ritual_completions").select("user_id, ritual_date").in("user_id", ids).gte("ritual_date", since),
      supabase.from("daily_briefings").select("user_id, listened").in("user_id", ids).gte("briefing_date", since),
    ]);

    setAthletes(ids.map((id) => ({
      userId: id,
      name: (profs || []).find((p) => p.user_id === id)?.full_name || "Atleta",
    })));
    setProgress((prog as ProgressRow[]) || []);
    setRituals((rit as any[]) || []);
    setBriefings((brief as any[]) || []);
    setLoadingProgress(false);
  }, [profile?.id]);

  useEffect(() => { if (tab === "progresso") loadProgress(); }, [tab, loadProgress]);

  const bySeries = useMemo(() => {
    const g: Record<string, Episode[]> = {};
    episodes.forEach((e) => { (g[e.series] ||= []).push(e); });
    return g;
  }, [episodes]);

  const publishedCount = episodes.filter((e) => e.audio_url).length;
  const pendingEpisodes = useMemo(() => episodes.filter((e) => !e.audio_url), [episodes]);

  // Gera roteiro + narração na mesma voz do Briefing do dia
  const generateVoice = async (ep: Episode, silent = false): Promise<boolean> => {
    setGeneratingId(ep.id);
    try {
      const { data, error } = await supabase.functions.invoke("mce-generate-episode-audio", {
        body: { episodeId: ep.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEpisodes((list) =>
        list.map((e) =>
          e.id === ep.id ? { ...e, audio_url: data.path, duration_seconds: data.duration_seconds } : e,
        ),
      );
      if (!silent) toast.success(`Narração publicada · EP ${ep.episode_number ?? ""}`);
      return true;
    } catch (e: any) {
      if (!silent) toast.error(e?.message || "Falha ao gerar a narração.");
      return false;
    } finally {
      setGeneratingId(null);
    }
  };

  const generateAllPending = async (list: Episode[]) => {
    if (list.length === 0) return toast.message("Todos os episódios já têm áudio.");
    setBatch({ done: 0, total: list.length });
    let ok = 0;
    for (let i = 0; i < list.length; i++) {
      const success = await generateVoice(list[i], true);
      if (success) ok++;
      setBatch({ done: i + 1, total: list.length });
    }
    setBatch(null);
    if (ok === list.length) toast.success(`${ok} episódios narrados e publicados.`);
    else toast.warning(`${ok}/${list.length} narrados. Tente novamente os restantes.`);
  };


  const handleUpload = async (ep: Episode, file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast.error("Selecione um arquivo de áudio (mp3, m4a, wav).");
      return;
    }
    if (file.size > 60 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx 60MB).");
      return;
    }
    setUploadingId(ep.id);
    try {
      const path = buildAudioPath(ep.series, ep.episode_number, file.name);
      const { error: upErr } = await supabase.storage
        .from(MCE_AUDIO_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      // duração real do arquivo
      const duration = await new Promise<number>((resolve) => {
        const url = URL.createObjectURL(file);
        const a = new Audio(url);
        a.onloadedmetadata = () => { resolve(Math.round(a.duration || ep.duration_seconds)); URL.revokeObjectURL(url); };
        a.onerror = () => { resolve(ep.duration_seconds); URL.revokeObjectURL(url); };
      });

      const { error } = await supabase
        .from("mce_audio_episodes")
        .update({ audio_url: path, duration_seconds: duration })
        .eq("id", ep.id);
      if (error) throw error;

      setEpisodes((list) => list.map((e) => (e.id === ep.id ? { ...e, audio_url: path, duration_seconds: duration } : e)));
      toast.success("Áudio publicado para os clientes.");
    } catch (e: any) {
      toast.error(e?.message || "Falha ao enviar o áudio.");
    } finally {
      setUploadingId(null);
    }
  };

  const removeAudio = async (ep: Episode) => {
    if (!ep.audio_url) return;
    const { error } = await supabase.from("mce_audio_episodes").update({ audio_url: null }).eq("id", ep.id);
    if (error) return toast.error("Não foi possível remover.");
    if (!/^https?:/.test(ep.audio_url)) await supabase.storage.from(MCE_AUDIO_BUCKET).remove([ep.audio_url]);
    setEpisodes((list) => list.map((e) => (e.id === ep.id ? { ...e, audio_url: null } : e)));
    toast.success("Áudio despublicado.");
  };

  const preview = async (ep: Episode) => {
    if (!ep.audio_url) return;
    const src = await resolveAudioSrc(ep.audio_url);
    if (!src) return toast.error("Não foi possível carregar o áudio.");
    setTrack({
      id: ep.id,
      title: `EP ${ep.episode_number ?? ""} — ${ep.title}`,
      subtitle: SERIES_META[ep.series as AudioSeries]?.label ?? ep.series,
      src,
    });
  };

  const createEpisode = async () => {
    if (!newTitle.trim()) return toast.error("Informe o título do episódio.");
    setCreating(true);
    const list = bySeries[newSeries] || [];
    const nextNumber = Math.max(0, ...list.map((e) => e.episode_number ?? 0)) + 1;
    const nextSort = Math.max(0, ...episodes.map((e) => e.sort_order ?? 0)) + 1;
    const { data, error } = await supabase
      .from("mce_audio_episodes")
      .insert({
        series: newSeries,
        episode_number: nextNumber,
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        duration_seconds: Math.max(60, newMin * 60),
        sort_order: nextSort,
      })
      .select("id, series, episode_number, title, description, duration_seconds, audio_url, scientific_reference, sort_order")
      .single();
    setCreating(false);
    if (error) return toast.error(error.message);
    setEpisodes((l) => [...l, data as Episode]);
    setNewTitle(""); setNewDesc("");
    setOpenSeries(newSeries);
    toast.success("Episódio criado. Envie o áudio para publicar.");
  };

  const deleteEpisode = async (ep: Episode) => {
    const { error } = await supabase.from("mce_audio_episodes").delete().eq("id", ep.id);
    if (error) return toast.error("Não foi possível excluir.");
    if (ep.audio_url && !/^https?:/.test(ep.audio_url)) await supabase.storage.from(MCE_AUDIO_BUCKET).remove([ep.audio_url]);
    setEpisodes((l) => l.filter((e) => e.id !== ep.id));
    toast.success("Episódio excluído.");
  };

  const renderEpisode = (ep: Episode) => {
    const color = SERIES_META[ep.series as AudioSeries]?.color ?? GOLD;
    const listeners = progress.filter((p) => p.episode_id === ep.id && p.completed).length;
    return (
      <div key={ep.id} className="rounded-xl p-3 flex items-start gap-3" style={{ background: CARD, border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${color}22`, color }}>
              EP {ep.episode_number ?? "-"}
            </span>
            <p className="text-sm font-semibold truncate" style={{ color: "#fff" }}>{ep.title}</p>
          </div>
          {ep.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: DIM }}>{ep.description}</p>}
          <p className="text-[10px] mt-1" style={{ color: ep.audio_url ? "#00FF88" : DIM }}>
            {ep.audio_url ? "Publicado" : "Sem áudio"} · {fmtMin(ep.duration_seconds)}
            {listeners > 0 ? ` · ${listeners} concluíram` : ""}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <input
            ref={(el) => { fileInputs.current[ep.id] = el; }}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(ep, f); e.currentTarget.value = ""; }}
          />
          <button
            onClick={() => generateVoice(ep)}
            disabled={!!generatingId || !!batch}
            aria-label="Gerar narração na voz PRAXIS"
            title="Gerar narração na voz do briefing"
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(0,212,255,0.14)", color: "#00D4FF", opacity: generatingId || batch ? 0.5 : 1 }}
          >
            {generatingId === ep.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          </button>
          {ep.audio_url && (
            <button onClick={() => preview(ep)} aria-label="Ouvir prévia" className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, color }}>
              <Play className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => fileInputs.current[ep.id]?.click()}
            disabled={uploadingId === ep.id}
            aria-label="Enviar áudio"
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${GOLD}22`, color: GOLD }}
          >
            {uploadingId === ep.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          </button>
          {ep.audio_url ? (
            <button onClick={() => removeAudio(ep)} aria-label="Despublicar áudio" className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,80,80,0.12)", color: "#ff8080" }}>
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => deleteEpisode(ep)} aria-label="Excluir episódio" className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", color: DIM }}>
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const totalEpisodes = episodes.length;

  return (
    <div className={embedded ? "pb-40" : "min-h-screen pb-40"} style={{ background: embedded ? "transparent" : BG, color: "#fff" }}>
      {embedded ? (
        <div className="flex items-center gap-2 px-1 pt-1">
          <Headphones className="w-4 h-4" style={{ color: GOLD }} />
          <h2 className="text-[11px] font-black tracking-[2px] uppercase" style={{ color: GOLD }}>MCE · Áudios</h2>
          <span className="ml-auto text-[10px]" style={{ color: DIM }}>{publishedCount}/{totalEpisodes} publicados</span>
          <button
            onClick={openCreate}
            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1"
            style={{ background: GOLD, color: BG }}
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar áudio
          </button>
        </div>
      ) : (
        <header className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3" style={{ background: "rgba(3,3,10,0.95)", borderBottom: `1px solid ${GOLD}22` }}>
          <button onClick={() => navigate("/coach/dashboard")} aria-label="Voltar" style={{ color: GOLD }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Headphones className="w-5 h-5" style={{ color: GOLD }} />
          <h1 className="text-sm font-black tracking-[2px] uppercase" style={{ color: GOLD }}>Áudios · Coach</h1>
          <span className="ml-auto text-[10px]" style={{ color: DIM }}>{publishedCount}/{totalEpisodes} publicados</span>
          <button
            onClick={openCreate}
            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1"
            style={{ background: GOLD, color: BG }}
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar áudio
          </button>
        </header>
      )}


      <div className="max-w-3xl mx-auto px-4 pt-4">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {([
            { k: "biblioteca" as TabKey, label: "Biblioteca", icon: Library },
            { k: "rituais" as TabKey, label: "Rituais", icon: Sunrise },
            { k: "progresso" as TabKey, label: "Progresso", icon: Users },
          ]).map(({ k, label, icon: Icon }) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap"
              style={{
                background: tab === k ? `${GOLD}1a` : "transparent",
                color: tab === k ? GOLD : DIM,
                border: `1px solid ${tab === k ? `${GOLD}55` : "transparent"}`,
              }}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-5 space-y-5">
        {tab !== "progresso" && (
          <>
            {/* NARRAÇÃO EM LOTE */}
            <section className="rounded-2xl p-4" style={{ border: "1px solid rgba(0,212,255,0.28)", background: "linear-gradient(135deg, rgba(0,212,255,0.10), transparent)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Wand2 className="w-4 h-4" style={{ color: "#00D4FF" }} />
                <h2 className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: "#00D4FF" }}>Narração PRAXIS</h2>
              </div>
              <p className="text-xs mb-3" style={{ color: DIM }}>
                Gera roteiro e narração na mesma voz do Briefing do dia e publica direto para os clientes.
                {" "}{pendingEpisodes.length} episódio(s) sem áudio.
              </p>
              <button
                onClick={() => generateAllPending(pendingEpisodes)}
                disabled={!!batch || !!generatingId || pendingEpisodes.length === 0}
                className="text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2"
                style={{ background: "#00D4FF", color: "#03030a", opacity: batch || generatingId || pendingEpisodes.length === 0 ? 0.55 : 1 }}
              >
                {batch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {batch ? `Narrando ${batch.done}/${batch.total}...` : "Liberar todas as séries com voz"}
              </button>
              {batch && (
                <div className="h-[3px] rounded-full mt-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(batch.done / batch.total) * 100}%`, background: "#00D4FF" }} />
                </div>
              )}
            </section>

            {/* NOVO EPISÓDIO */}
            <div ref={createRef} />
            {!showCreate && (
              <button
                onClick={openCreate}
                className="w-full text-xs font-bold px-4 py-3 rounded-2xl inline-flex items-center justify-center gap-2"
                style={{ border: `1px dashed ${GOLD}66`, background: `${GOLD}0f`, color: GOLD }}
              >
                <Plus className="w-4 h-4" /> Adicionar áudio / novo episódio
              </button>
            )}
            {showCreate && (
            <section className="rounded-2xl p-4 space-y-3" style={{ border: `1px solid ${GOLD}33`, background: `linear-gradient(135deg, ${GOLD}10, transparent)` }}>
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" style={{ color: GOLD }} />
                <h2 className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: GOLD }}>Novo episódio</h2>
                <button onClick={() => setShowCreate(false)} className="ml-auto text-[10px]" style={{ color: DIM }}>Fechar</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  aria-label="Série"
                  value={newSeries}
                  onChange={(e) => setNewSeries(e.target.value as AudioSeries)}
                  className="text-xs rounded-lg px-3 py-2 bg-transparent"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
                >
                  {SERIES_ORDER.map((s) => (
                    <option key={s} value={s} style={{ background: BG }}>{SERIES_META[s].label}</option>
                  ))}
                </select>
                <input
                  aria-label="Duração em minutos"
                  type="number"
                  min={1}
                  value={newMin}
                  onChange={(e) => setNewMin(Number(e.target.value))}
                  placeholder="Duração (min)"
                  className="text-xs rounded-lg px-3 py-2 bg-transparent"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
                />
              </div>
              <input
                aria-label="Título"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título do episódio"
                className="w-full text-xs rounded-lg px-3 py-2 bg-transparent"
                style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
              />
              <textarea
                aria-label="Descrição"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Descrição curta"
                rows={2}
                className="w-full text-xs rounded-lg px-3 py-2 bg-transparent"
                style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
              />
              <button
                onClick={createEpisode}
                disabled={creating}
                className="text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2"
                style={{ background: GOLD, color: BG, opacity: creating ? 0.6 : 1 }}
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Criar episódio
              </button>
            </section>
            )}


            {loading ? (
              <p className="text-xs" style={{ color: DIM }}>Carregando biblioteca...</p>
            ) : tab === "rituais" ? (
              <section className="space-y-2">
                <h2 className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: SERIES_META.ritual.color }}>
                  {SERIES_META.ritual.icon} {SERIES_META.ritual.label}
                </h2>
                <p className="text-xs" style={{ color: DIM }}>{SERIES_META.ritual.blurb}</p>
                {(bySeries.ritual || []).map(renderEpisode)}
                {(bySeries.ritual || []).length === 0 && <p className="text-xs" style={{ color: DIM }}>Nenhum ritual cadastrado.</p>}
              </section>
            ) : (
              SERIES_ORDER.filter((s) => s !== "ritual").map((s) => {
                const meta = SERIES_META[s];
                const list = bySeries[s] || [];
                const pub = list.filter((e) => e.audio_url).length;
                const open = openSeries === s;
                return (
                  <section key={s} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${meta.color}33` }}>
                    <button
                      onClick={() => setOpenSeries(open ? null : s)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      style={{ background: `${meta.color}10` }}
                    >
                      <span className="text-lg">{meta.icon}</span>
                      <span className="flex-1">
                        <span className="block text-sm font-bold" style={{ color: meta.color }}>{meta.label}</span>
                        <span className="block text-[10px]" style={{ color: DIM }}>{pub}/{list.length} publicados</span>
                      </span>
                      {pub === list.length && list.length > 0 && <CheckCircle2 className="w-4 h-4" style={{ color: "#00FF88" }} />}
                    </button>
                    {open && <div className="p-3 space-y-2">{list.map(renderEpisode)}</div>}
                  </section>
                );
              })
            )}
          </>
        )}

        {tab === "progresso" && (
          <section className="space-y-3">
            {loadingProgress ? (
              <p className="text-xs" style={{ color: DIM }}>Carregando progresso...</p>
            ) : athletes.length === 0 ? (
              <p className="text-xs" style={{ color: DIM }}>Nenhum cliente ativo vinculado.</p>
            ) : (
              athletes.map((a) => {
                const rows = progress.filter((p) => p.user_id === a.userId);
                const done = rows.filter((r) => r.completed).length;
                const minutes = Math.round(rows.reduce((s, r) => s + (r.progress_seconds || 0), 0) / 60);
                const pct = totalEpisodes ? Math.round((done / totalEpisodes) * 100) : 0;
                const ritualCount = rituals.filter((r) => r.user_id === a.userId).length;
                const briefingCount = briefings.filter((b) => b.user_id === a.userId && b.listened).length;
                const last = rows.map((r) => r.updated_at).sort().pop();
                return (
                  <div key={a.userId} className="rounded-2xl p-4" style={{ background: CARD, border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold">{a.name}</p>
                      <span className="text-[11px] font-bold" style={{ color: GOLD }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: GOLD }} />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { l: "Concluídos", v: `${done}` },
                        { l: "Minutos", v: `${minutes}` },
                        { l: "Rituais 30d", v: `${ritualCount}` },
                        { l: "Briefings", v: `${briefingCount}` },
                      ].map((m) => (
                        <div key={m.l}>
                          <p className="text-sm font-black" style={{ color: "#fff" }}>{m.v}</p>
                          <p className="text-[9px] uppercase tracking-wider" style={{ color: DIM }}>{m.l}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] mt-2" style={{ color: DIM }}>
                      Última escuta: {last ? new Date(last).toLocaleDateString("pt-BR") : "—"}
                    </p>
                  </div>
                );
              })
            )}
          </section>
        )}
      </main>

      {track && <AudioPlayerBar track={track} onClose={() => setTrack(null)} />}
      {!user && null}
    </div>
  );
}
