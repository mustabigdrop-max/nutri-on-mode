import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, Mic, Loader2, CheckCircle2, Play, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import AudioPlayerBar, { type PlayerTrack } from "@/components/audio/AudioPlayerBar";
import { SERIES_META, RITUAL_KEY_BY_EPISODE, AUDIO_MCE_POINTS, type AudioSeries } from "@/data/mceAudioCatalog";
import { resolveAudioSrc } from "@/lib/mceAudioStorage";

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

const SERIES_ORDER: AudioSeries[] = ["mindset", "comportamento", "execucao", "ciencia", "ritual"];

const fmtDur = (s: number) => `${Math.floor(s / 60)} min`;

export default function AudioAcademyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);
  const [openSeries, setOpenSeries] = useState<AudioSeries | null>("mindset");
  const [track, setTrack] = useState<PlayerTrack | null>(null);

  // Briefing
  const [briefingText, setBriefingText] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  useEffect(() => {
    document.title = "MCE Audio Academy · NUTRION";
  }, []);

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

  const playEpisode = async (ep: Episode) => {
    if (!ep.audio_url) {
      toast.message("Episódio ainda não publicado pelo coach.");
      return;
    }
    const src = await resolveAudioSrc(ep.audio_url);
    if (!src) {
      toast.error("Não foi possível carregar este áudio.");
      return;
    }
    setTrack({
      id: ep.id,
      title: `EP ${ep.episode_number} — ${ep.title}`,
      subtitle: SERIES_META[ep.series as AudioSeries]?.label ?? ep.series,
      src,
      startAt: progress[ep.id]?.progress_seconds ?? 0,
    });
  };

  return (
    <div className="min-h-screen pb-40" style={{ background: "#03030a", color: "#fff" }}>
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3" style={{ background: "rgba(3,3,10,0.95)", borderBottom: `1px solid ${GOLD}22` }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={{ color: GOLD }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Headphones className="w-5 h-5" style={{ color: GOLD }} />
        <h1 className="text-sm font-black tracking-[2px] uppercase" style={{ color: GOLD }}>MCE Audio Academy</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 space-y-5">
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
                      return (
                        <div
                          key={ep.id}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <button
                            onClick={() => playEpisode(ep)}
                            aria-label={`Tocar ${ep.title}`}
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: ep.audio_url ? meta.color : "rgba(255,255,255,0.08)", color: ep.audio_url ? "#03030a" : DIM }}
                          >
                            {ep.audio_url ? <Play className="w-4 h-4 ml-0.5" /> : <Lock className="w-4 h-4" />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">
                              {s === "ritual" ? ep.title : `EP ${ep.episode_number} · ${ep.title}`}
                            </p>
                            <p className="text-[11px] truncate" style={{ color: DIM }}>
                              {fmtDur(ep.duration_seconds)}
                              {ep.scientific_reference ? ` · ${ep.scientific_reference}` : ""}
                              {!ep.audio_url ? " · em breve" : ""}
                            </p>
                            {ep.description && (
                              <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{ep.description}</p>
                            )}
                          </div>
                          {p?.completed && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: meta.color }} />}
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
          onClose={() => setTrack(null)}
          onProgress={(sec, dur) => {
            if (track.id !== "briefing" && Math.floor(sec) % 10 === 0) saveProgress(track.id, sec, dur);
          }}
          onEnded={() => {
            if (track.id !== "briefing") saveProgress(track.id, 99999, 100000);
          }}
        />
      )}
    </div>
  );
}
