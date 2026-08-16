import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw, X } from "lucide-react";

const GOLD = "#E8A020";

export type PlayerTrack = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  startAt?: number;
};

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const mm = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${mm}:${String(ss).padStart(2, "0")}`;
};

/** Player fixo com controles, seek e Media Session (lock screen / background). */
export default function AudioPlayerBar({
  track,
  onClose,
  onProgress,
  onEnded,
}: {
  track: PlayerTrack;
  onClose: () => void;
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = track.startAt ?? 0;
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [track.id, track.src, track.startAt]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: "Coach Diogo · MCE Audio Academy",
      album: "nutriON",
    });
    const el = () => audioRef.current;
    navigator.mediaSession.setActionHandler("play", () => el()?.play());
    navigator.mediaSession.setActionHandler("pause", () => el()?.pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      const a = el();
      if (a) a.currentTime = Math.max(0, a.currentTime - 15);
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      const a = el();
      if (a) a.currentTime = a.currentTime + 15;
    });
  }, [track.title]);

  const skip = (delta: number) => {
    const a = audioRef.current;
    if (a) a.currentTime = Math.max(0, a.currentTime + delta);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[80] px-4 py-3"
      style={{ background: "rgba(6,6,12,0.97)", borderTop: `1px solid ${GOLD}33`, backdropFilter: "blur(8px)" }}
    >
      <audio
        ref={audioRef}
        src={track.src}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          setTime(a.currentTime);
          onProgress?.(a.currentTime, a.duration || 0);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
      />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: GOLD }}>{track.title}</p>
            <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{track.subtitle}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar player" className="p-2" style={{ color: "rgba(255,255,255,0.6)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <input
          type="range"
          min={0}
          max={duration || 0}
          value={time}
          onChange={(e) => {
            const a = audioRef.current;
            if (a) a.currentTime = Number(e.target.value);
          }}
          className="w-full accent-[#E8A020]"
          aria-label="Progresso do áudio"
        />

        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>{fmt(time)}</span>
          <div className="flex items-center gap-4">
            <button onClick={() => skip(-15)} aria-label="Voltar 15s" style={{ color: "rgba(255,255,255,0.8)" }}>
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => (playing ? audioRef.current?.pause() : audioRef.current?.play())}
              aria-label={playing ? "Pausar" : "Tocar"}
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: GOLD, color: "#03030a" }}
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={() => skip(15)} aria-label="Avançar 15s" style={{ color: "rgba(255,255,255,0.8)" }}>
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
          <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}
