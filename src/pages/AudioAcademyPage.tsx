import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Headphones, Mic, Loader2, CheckCircle2, Play,
  Download, Trash2, ListPlus, ListMusic, ChevronUp, ChevronDown, Plus, WifiOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import AudioPlayerBar, { type PlayerTrack } from "@/components/audio/AudioPlayerBar";
import { SERIES_META, RITUAL_KEY_BY_EPISODE, AUDIO_MCE_POINTS, type AudioSeries } from "@/data/mceAudioCatalog";
import { resolveAudioSrc } from "@/lib/mceAudioStorage";
import {
  downloadOffline, removeOffline, listOfflineIds, getOfflineSrc, offlineTotalBytes, fmtBytes,
} from "@/lib/offlineAudio";
import {
  loadPlaylists, createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist, moveItem,
  playlistDuration, fmtMin, type Playlist, type PlaylistItem,
} from "@/lib/audioPlaylists";

const GOLD = "#E8A020";
const DIM = "rgba(255,255,255,0.55)";

type Episode = {
  id: string;
  series: string;
  episode_number: number | null;
  title: string;
  description: string | null;
  duration_seconds: number;
  audio_url: string | null;
  scientific_reference: string | null;
};

type Progress = { episode_id: string; progress_seconds: number; completed: boolean };

const SERIES_ORDER: AudioSeries[] = [
  "mindset", "comportamento", "execucao", "ciencia", "masterclass",
  "breathwork", "reprogramacao", "emergencia", "focus",
  "reset_semanal", "review_mensal", "journaling",
  "vida_real", "competicao", "biohacking",
  "carreira", "relacionamentos", "parentalidade", "financas", "ritual",
];

const fmtDur = (s: number) => `${Math.floor(s / 60)} min`;

export default function AudioAcademyPage({ embedded = false }: { embedded?: boolean } = {}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);
  const [openSeries, setOpenSeries] = useState<AudioSeries | null>("mindset");
  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);


  // Briefing
  const [briefingText, setBriefingText] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  // Offline
  const [offlineIds, setOfflineIds] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<Record<string, number>>({});
  const [offlineBytes, setOfflineBytes] = useState(0);

  // Playlists
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [queue, setQueue] = useState<{ name: string; items: PlaylistItem[]; index: number } | null>(null);

  useEffect(() => {
    if (!embedded) document.title = "MCE Audio Academy · NUTRION";
  }, [embedded]);

  const refreshOffline = useCallback(async () => {
    setOfflineIds(await listOfflineIds());
    setOfflineBytes(await offlineTotalBytes());
  }, []);

  useEffect(() => {
    refreshOffline();
    const list = loadPlaylists();
    setPlaylists(list);
    setActivePlaylistId(list[0]?.id ?? null);
  }, [refreshOffline]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [eps, prog, brief] = await Promise.all([
      supabase.from("mce_audio_episodes").select("*").order("sort_order", { ascending: true }),
      supabase.from("client_audio_progress").select("episode_id, progress_seconds, completed").eq("user_id", user.id),
      supabase.from("daily_briefings").select("text_content")
        .eq("user_id", user.id).eq("briefing_date", new Date().toISOString().slice(0, 10)).maybeSingle(),
    ]);
    setEpisodes((eps.data as Episode[]) ?? []);
    const map: Record<string, Progress> = {};
    ((prog.data as Progress[]) ?? []).forEach((p) => (map[p.episode_id] = p));
    setProgress(map);
    setBriefingText(brief.data?.text_content ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const bySeries = useMemo(() => {
    const g: Record<string, Episode[]> = {};
    episodes.forEach((e) => {
      (g[e.series] ||= []).push(e);
    });
    return g;
  }, [episodes]);

  const sosCount = useMemo(() => episodes.filter((e) => e.series === "emergencia").length, [episodes]);
  const totalHours = useMemo(
    () => (episodes.reduce((a, e) => a + (e.duration_seconds || 0), 0) / 3600).toFixed(1),
    [episodes],
  );

  const saveProgress = useCallback(
    async (episodeId: string, seconds: number, duration: number) => {
      if (!user) return;
      const completed = duration > 0 && seconds / duration > 0.9;
      await supabase.from("client_audio_progress").upsert(
        {
          user_id: user.id,
          episode_id: episodeId,
          progress_seconds: Math.floor(seconds),
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,episode_id" },
      );
      setProgress((p) => ({ ...p, [episodeId]: { episode_id: episodeId, progress_seconds: seconds, completed } }));
    },
    [user],
  );

  const completeRitual = async (ep: Episode) => {
    if (!user || ep.series !== "ritual" || !ep.episode_number) return;
    const key = RITUAL_KEY_BY_EPISODE[ep.episode_number];
    const pts = AUDIO_MCE_POINTS[`ritual_${key}` as keyof typeof AUDIO_MCE_POINTS];
    await supabase.from("ritual_completions").upsert(
      {
        user_id: user.id,
        ritual_type: key,
        ritual_date: new Date().toISOString().slice(0, 10),
        mce_points: pts.m + pts.c + pts.e,
      },
      { onConflict: "user_id,ritual_type,ritual_date" },
    );
    toast.success(`Ritual registrado · +${pts.m + pts.c + pts.e} pontos MCE`);
  };

  const generateBriefing = async () => {
    setBriefingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mce-daily-briefing", { body: { withAudio: true } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setBriefingText(data.text);
      if (data.audioBase64) {
        setQueue(null);
        setTrack({
          id: "briefing",
          title: "Briefing do dia",
          subtitle: "PRAXIS · personalizado para hoje",
          src: `data:audio/mpeg;base64,${data.audioBase64}`,
        });
        await supabase.from("daily_briefings").update({ listened: true, listened_at: new Date().toISOString() })
          .eq("user_id", user!.id).eq("briefing_date", new Date().toISOString().slice(0, 10));
      } else {
        toast.message("Briefing gerado em texto (áudio indisponível agora).");
      }
    } catch (e) {
      toast.error("Não foi possível gerar o briefing agora.");
    } finally {
      setBriefingLoading(false);
    }
  };

  /** Resolve a fonte tocável: offline primeiro, depois signed URL. */
  const resolveSrc = useCallback(async (episodeId: string, audioUrl: string | null) => {
    const offline = await getOfflineSrc(episodeId);
    if (offline) return offline;
    if (!audioUrl) return null;
    return await resolveAudioSrc(audioUrl);
  }, []);

  /** Gera a narração sob demanda (coach/admin) e devolve o episódio atualizado. */
  const generateEpisodeAudio = async (ep: Episode): Promise<Episode | null> => {
    setGeneratingId(ep.id);
    try {
      const { data, error } = await supabase.functions.invoke("mce-generate-episode-audio", {
        body: { episodeId: ep.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const updated: Episode = {
        ...ep,
        audio_url: data.path,
        duration_seconds: data.duration_seconds || ep.duration_seconds,
      };
      setEpisodes((list) => list.map((e) => (e.id === ep.id ? updated : e)));
      return updated;
    } catch (e: any) {
      const msg = String(e?.message || "");
      toast.message(
        /coach|403/i.test(msg) ? "Episódio ainda não publicado pelo coach." : "Não foi possível gerar a narração agora.",
      );
      return null;
    } finally {
      setGeneratingId(null);
    }
  };

  const playEpisode = async (ep: Episode) => {
    let target = ep;
    let src = await resolveSrc(ep.id, ep.audio_url);

    if (!src && !ep.audio_url) {
      toast.message("Preparando a narração deste episódio…");
      const generated = await generateEpisodeAudio(ep);
      if (!generated) return;
      target = generated;
      src = await resolveSrc(target.id, target.audio_url);
    }

    if (!src) {
      toast.message("Não foi possível carregar este áudio.");
      return;
    }
    setQueue(null);
    setTrack({
      id: target.id,
      title: `EP ${target.episode_number} — ${target.title}`,
      subtitle: SERIES_META[target.series as AudioSeries]?.label ?? target.series,
      src,
      startAt: progress[target.id]?.progress_seconds ?? 0,
    });
  };


  // ---- Offline ----
  const startDownload = async (ep: Episode) => {
    if (!ep.audio_url) return;
    setDownloading((d) => ({ ...d, [ep.id]: 0 }));
    try {
      const url = await resolveAudioSrc(ep.audio_url);
      if (!url) throw new Error("Áudio indisponível.");
      await downloadOffline(ep.id, ep.title, url, (pct) => setDownloading((d) => ({ ...d, [ep.id]: pct })));
      await refreshOffline();
      toast.success(`"${ep.title}" disponível offline.`);
    } catch (e: any) {
      toast.error(e?.message || "Falha ao baixar o áudio.");
    } finally {
      setDownloading((d) => {
        const { [ep.id]: _, ...rest } = d;
        return rest;
      });
    }
  };

  const dropDownload = async (ep: Episode) => {
    await removeOffline(ep.id);
    await refreshOffline();
    toast.message(`Download de "${ep.title}" removido.`);
  };

  // ---- Playlists ----
  const activePlaylist = playlists.find((p) => p.id === activePlaylistId) ?? null;

  const handleCreate = () => {
    const list = createPlaylist(newPlaylistName);
    setPlaylists(list);
    setActivePlaylistId(list[list.length - 1].id);
    setNewPlaylistName("");
  };

  const handleAdd = (ep: Episode) => {
    if (!activePlaylistId) {
      toast.error("Crie uma playlist primeiro.");
      setShowPlaylists(true);
      return;
    }
    setPlaylists(
      addToPlaylist(activePlaylistId, {
        episodeId: ep.id,
        title: ep.title,
        subtitle: SERIES_META[ep.series as AudioSeries]?.label ?? ep.series,
        durationSeconds: ep.duration_seconds || 0,
      }),
    );
    toast.success(`Adicionado a "${activePlaylist?.name ?? "playlist"}".`);
  };

  const playQueueIndex = useCallback(
    async (name: string, items: PlaylistItem[], index: number) => {
      const item = items[index];
      if (!item) return;
      const ep = episodes.find((e) => e.id === item.episodeId);
      const src = await resolveSrc(item.episodeId, ep?.audio_url ?? null);
      if (!src) {
        toast.message(`"${item.title}" indisponível — pulando.`);
        if (index + 1 < items.length) playQueueIndex(name, items, index + 1);
        return;
      }
      setQueue({ name, items, index });
      setTrack({
        id: item.episodeId,
        title: item.title,
        subtitle: item.subtitle,
        src,
        startAt: 0,
      });
    },
    [episodes, resolveSrc],
  );

  const goQueue = (delta: number) => {
    if (!queue) return;
    const next = queue.index + delta;
    if (next < 0 || next >= queue.items.length) {
      toast.message(delta > 0 ? "Fim da playlist." : "Início da playlist.");
      return;
    }
    playQueueIndex(queue.name, queue.items, next);
  };

  return (
    <div className={embedded ? "pb-52" : "min-h-screen pb-52"} style={{ background: embedded ? "transparent" : "#03030a", color: "#fff" }}>
      {embedded ? (
        <div className="flex items-center gap-2 px-1">
          <Headphones className="w-4 h-4" style={{ color: GOLD }} />
          <h2 className="text-[11px] font-black tracking-[2px] uppercase" style={{ color: GOLD }}>MCE Audio Academy</h2>
        </div>
      ) : (
        <header className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3" style={{ background: "rgba(3,3,10,0.95)", borderBottom: `1px solid ${GOLD}22` }}>
          <button onClick={() => navigate(-1)} aria-label="Voltar" style={{ color: GOLD }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Headphones className="w-5 h-5" style={{ color: GOLD }} />
          <h1 className="text-sm font-black tracking-[2px] uppercase" style={{ color: GOLD }}>MCE Audio Academy</h1>
        </header>
      )}

      <main className={embedded ? "space-y-5 pt-3" : "max-w-3xl mx-auto px-4 py-5 space-y-5"}>
        <p className="text-xs italic" style={{ color: DIM }}>
          "Sua fome nunca foi de comida. O comportamento vem antes do alimento."
        </p>

        {/* BRIEFING */}
        <section className="rounded-2xl p-4" style={{ border: `1px solid ${GOLD}33`, background: `linear-gradient(135deg, ${GOLD}12, transparent)` }}>
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-4 h-4" style={{ color: GOLD }} />
            <h2 className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: GOLD }}>Briefing do dia</h2>
          </div>
          {briefingText ? (
            <p className="text-sm whitespace-pre-wrap mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>{briefingText}</p>
          ) : (
            <p className="text-xs mb-3" style={{ color: DIM }}>
              Gere o briefing personalizado de hoje — treino, nutrição e o pilar MCE que precisa de atenção.
            </p>
          )}
          <button
            onClick={generateBriefing}
            disabled={briefingLoading}
            className="text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2"
            style={{ background: GOLD, color: "#03030a", opacity: briefingLoading ? 0.6 : 1 }}
          >
            {briefingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {briefingText ? "Ouvir briefing" : "Gerar e ouvir briefing"}
          </button>
        </section>

        {/* PLAYLISTS */}
        <section className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${GOLD}33` }}>
          <button onClick={() => setShowPlaylists((v) => !v)} className="w-full text-left p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold flex items-center gap-2" style={{ color: GOLD }}>
                <ListMusic className="w-4 h-4" /> Minhas playlists
              </span>
              <span className="text-[11px] font-mono" style={{ color: DIM }}>{playlists.length}</span>
            </div>
            <p className="text-xs mt-1" style={{ color: DIM }}>
              Monte sequências de rituais na ordem que quiser e pule entre eles com um clique.
            </p>
          </button>

          {showPlaylists && (
            <div className="px-4 pb-4 space-y-3">
              <div className="flex gap-2">
                <input
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Nome da playlist"
                  className="flex-1 px-3 py-2 rounded-lg text-xs bg-transparent"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
                />
                <button
                  onClick={handleCreate}
                  className="px-3 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                  style={{ background: GOLD, color: "#03030a" }}
                >
                  <Plus className="w-3.5 h-3.5" /> Criar
                </button>
              </div>

              {playlists.length === 0 && (
                <p className="text-[11px]" style={{ color: DIM }}>Nenhuma playlist ainda.</p>
              )}

              {playlists.map((p) => {
                const open = p.id === activePlaylistId;
                return (
                  <div key={p.id} className="rounded-xl p-3" style={{ border: `1px solid ${open ? `${GOLD}55` : "rgba(255,255,255,0.08)"}`, background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setActivePlaylistId(open ? null : p.id)} className="min-w-0 flex-1 text-left">
                        <p className="text-sm font-semibold truncate">{p.name}</p>
                        <p className="text-[11px]" style={{ color: DIM }}>
                          {p.items.length} rituais · {fmtMin(playlistDuration(p))}
                        </p>
                      </button>
                      <button
                        onClick={() => p.items.length ? playQueueIndex(p.name, p.items, 0) : toast.message("Playlist vazia.")}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
                        style={{ background: GOLD, color: "#03030a" }}
                      >
                        Tocar
                      </button>
                      <button onClick={() => { setPlaylists(deletePlaylist(p.id)); if (activePlaylistId === p.id) setActivePlaylistId(null); }} aria-label={`Excluir ${p.name}`}>
                        <Trash2 className="w-4 h-4" style={{ color: "rgba(255,255,255,0.35)" }} />
                      </button>
                    </div>

                    {open && p.items.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {p.items.map((it, i) => (
                          <div key={it.episodeId} className="flex items-center gap-2 text-[11px] py-1">
                            <span className="font-mono" style={{ color: DIM }}>{i + 1}.</span>
                            <button onClick={() => playQueueIndex(p.name, p.items, i)} className="min-w-0 flex-1 truncate text-left">
                              {it.title}
                            </button>
                            <span className="font-mono shrink-0" style={{ color: DIM }}>{fmtMin(it.durationSeconds)}</span>
                            <button onClick={() => setPlaylists(moveItem(p.id, i, -1))} aria-label="Subir"><ChevronUp className="w-3.5 h-3.5" style={{ color: DIM }} /></button>
                            <button onClick={() => setPlaylists(moveItem(p.id, i, 1))} aria-label="Descer"><ChevronDown className="w-3.5 h-3.5" style={{ color: DIM }} /></button>
                            <button onClick={() => setPlaylists(removeFromPlaylist(p.id, it.episodeId))} aria-label="Remover"><Trash2 className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SOS + TOTAIS */}
        <section className="rounded-2xl p-4" style={{ border: "1px solid rgba(239,68,68,0.3)", background: "linear-gradient(135deg, rgba(239,68,68,0.08), transparent)" }}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: "#EF4444" }}>🚨 SOS — Emergência</h2>
              <p className="text-xs mt-1" style={{ color: DIM }}>
                {sosCount} protocolos para momentos de crise comportamental — vontade de comer, recaída, ansiedade, insônia.
              </p>
            </div>
            <button
              onClick={() => setOpenSeries("emergencia")}
              className="text-xs font-bold px-4 py-2 rounded-lg shrink-0"
              style={{ background: "#EF4444", color: "#03030a" }}
            >
              Abrir SOS
            </button>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl p-3" style={{ border: `1px solid ${GOLD}22`, background: "rgba(255,255,255,0.03)" }}>
            <p className="text-[10px] uppercase tracking-[1.5px]" style={{ color: DIM }}>Biblioteca</p>
            <p className="text-sm font-black" style={{ color: GOLD }}>{episodes.length} áudios</p>
          </div>
          <div className="rounded-xl p-3" style={{ border: `1px solid ${GOLD}22`, background: "rgba(255,255,255,0.03)" }}>
            <p className="text-[10px] uppercase tracking-[1.5px]" style={{ color: DIM }}>Duração total</p>
            <p className="text-sm font-black" style={{ color: GOLD }}>{totalHours}h</p>
          </div>
          <div className="rounded-xl p-3" style={{ border: `1px solid ${GOLD}22`, background: "rgba(255,255,255,0.03)" }}>
            <p className="text-[10px] uppercase tracking-[1.5px] flex items-center gap-1" style={{ color: DIM }}>
              <WifiOff className="w-3 h-3" /> Offline
            </p>
            <p className="text-sm font-black" style={{ color: GOLD }}>{offlineIds.length} · {fmtBytes(offlineBytes)}</p>
          </div>
        </div>

        {/* SÉRIES */}
        {loading ? (
          <p className="text-xs" style={{ color: DIM }}>Carregando biblioteca...</p>
        ) : (
          SERIES_ORDER.map((s) => {
            const meta = SERIES_META[s];
            const list = bySeries[s] ?? [];
            const done = list.filter((e) => progress[e.id]?.completed).length;
            const total = list.length;
            const pct = total ? (done / total) * 100 : 0;
            const open = openSeries === s;
            const totalMin = Math.round(list.reduce((a, e) => a + e.duration_seconds, 0) / 60);
            return (
              <section key={s} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${meta.color}33` }}>
                <button onClick={() => setOpenSeries(open ? null : s)} className="w-full text-left p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: meta.color }}>
                      {meta.icon} {meta.label}
                    </span>
                    <span className="text-[11px] font-mono" style={{ color: DIM }}>{done}/{total}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: DIM }}>{meta.blurb}</p>
                  <p className="text-[11px] mt-1 font-mono" style={{ color: DIM }}>{total} faixas · {totalMin} min</p>
                  <div className="h-[4px] rounded-full mt-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.color }} />
                  </div>
                </button>

                {open && (
                  <div className="px-4 pb-4 space-y-2">
                    {list.map((ep) => {
                      const p = progress[ep.id];
                      const isOffline = offlineIds.includes(ep.id);
                      const dl = downloading[ep.id];
                      return (
                        <div
                          key={ep.id}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <button
                            onClick={() => playEpisode(ep)}
                            disabled={generatingId === ep.id}
                            aria-label={`Tocar ${ep.title}`}
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: meta.color, color: "#03030a" }}
                          >
                            {generatingId === ep.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Play className="w-4 h-4 ml-0.5" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">
                              {s === "ritual" ? ep.title : `EP ${ep.episode_number} · ${ep.title}`}
                            </p>
                            <p className="text-[11px] truncate" style={{ color: DIM }}>
                              {fmtDur(ep.duration_seconds)}
                              {ep.scientific_reference ? ` · ${ep.scientific_reference}` : ""}
                              {!ep.audio_url ? " · toque para narrar" : ""}
                              {isOffline ? " · offline" : ""}
                            </p>
                            {dl != null && (
                              <div className="h-[3px] rounded-full mt-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
                                <div className="h-full rounded-full transition-all" style={{ width: `${dl}%`, background: meta.color }} />
                              </div>
                            )}
                            {ep.description && (
                              <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{ep.description}</p>
                            )}
                          </div>

                          {p?.completed && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: meta.color }} />}

                          <button onClick={() => handleAdd(ep)} aria-label={`Adicionar ${ep.title} à playlist`} className="shrink-0">
                            <ListPlus className="w-4 h-4" style={{ color: "rgba(255,255,255,0.45)" }} />
                          </button>

                          {ep.audio_url && (
                            dl != null ? (
                              <span className="text-[10px] font-mono shrink-0" style={{ color: meta.color }}>{dl}%</span>
                            ) : isOffline ? (
                              <button onClick={() => dropDownload(ep)} aria-label={`Remover download de ${ep.title}`} className="shrink-0">
                                <Trash2 className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
                              </button>
                            ) : (
                              <button onClick={() => startDownload(ep)} aria-label={`Baixar ${ep.title}`} className="shrink-0">
                                <Download className="w-4 h-4" style={{ color: GOLD }} />
                              </button>
                            )
                          )}

                          {s === "ritual" && (
                            <button
                              onClick={() => completeRitual(ep)}
                              className="text-[10px] font-bold px-2 py-1 rounded-md shrink-0"
                              style={{ border: `1px solid ${meta.color}55`, color: meta.color }}
                            >
                              Concluir
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>

      {track && (
        <AudioPlayerBar
          track={track}
          queueLabel={queue ? `${queue.name} · ${queue.index + 1}/${queue.items.length}` : undefined}
          onNext={queue && queue.index < queue.items.length - 1 ? () => goQueue(1) : undefined}
          onPrev={queue && queue.index > 0 ? () => goQueue(-1) : undefined}
          onClose={() => { setTrack(null); setQueue(null); }}
          onProgress={(sec, dur) => {
            if (track.id !== "briefing" && Math.floor(sec) % 10 === 0) saveProgress(track.id, sec, dur);
          }}
          onEnded={() => {
            if (track.id !== "briefing") saveProgress(track.id, 99999, 100000);
            if (queue && queue.index < queue.items.length - 1) goQueue(1);
          }}
        />
      )}
    </div>
  );
}
