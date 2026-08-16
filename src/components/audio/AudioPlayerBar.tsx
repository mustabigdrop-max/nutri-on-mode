import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw, X, Headphones, Waves } from "lucide-react";
import {
  MCE_AUDIO_MODES,
  MODE_BY_KEY,
  MceSoundEngine,
  suggestModeByHour,
  type MceAudioMode,
} from "@/lib/mceAudioEngine";

const GOLD = "#E8A020";
const LS_MODE = "mce_audio_mode";
const LS_LAYER = "mce_audio_layer_on";

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

/** Player fixo com controles, seek, camada sonora MCE e Media Session (lock screen / background). */
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
  const engineRef = useRef<MceSoundEngine | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [layerOn, setLayerOn] = useState<boolean>(() => localStorage.getItem(LS_LAYER) === "1");
  const [showModes, setShowModes] = useState(false);
  const [mode, setMode] = useState<MceAudioMode>(() => {
    const saved = localStorage.getItem(LS_MODE) as MceAudioMode | null;
    return saved && MODE_BY_KEY[saved] ? saved : suggestModeByHour();
  });
  const cfg = useMemo(() => MODE_BY_KEY[mode], [mode]);

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

  // Camada sonora: liga/desliga e troca de modo
  useEffect(() => {
    localStorage.setItem(LS_LAYER, layerOn ? "1" : "0");
    localStorage.setItem(LS_MODE, mode);
    if (!engineRef.current) engineRef.current = new MceSoundEngine();
    const engine = engineRef.current;
    if (!layerOn) {
      engine.stop();
      return;
    }
    const total = duration || 600;
    engine.start(mode, total);
    if (!playing) engine.suspend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layerOn, mode]);

  // Sincroniza a camada com play/pause da voz
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !layerOn) return;
    if (playing) engine.resume();
    else engine.suspend();
  }, [playing, layerOn]);

  // Encerra tudo ao desmontar
  useEffect(() => () => { engineRef.current?.stop(); engineRef.current = null; }, []);

  const skip = (delta: number) => {
    const a = audioRef.current;
    if (a) a.currentTime = Math.max(0, a.currentTime + delta);
  };

  const closeAll = () => {
    engineRef.current?.stop();
    onClose();
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
          engineRef.current?.suspend();
          onEnded?.();
        }}
      />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: GOLD }}>{track.title}</p>
            <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{track.subtitle}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowModes((v) => !v)}
              aria-label="Camada sonora MCE"
              className="px-2 py-1.5 rounded-lg flex items-center gap-1.5"
              style={{
                color: layerOn ? cfg.color : "rgba(255,255,255,0.55)",
                border: `1px solid ${layerOn ? `${cfg.color}66` : "rgba(255,255,255,0.12)"}`,
                background: layerOn ? `${cfg.color}14` : "transparent",
              }}
            >
              <Headphones className="w-4 h-4" />
              <span className="text-[11px] font-bold">{layerOn ? `${cfg.icon} ${cfg.label}` : "Camada"}</span>
            </button>
            <button onClick={closeAll} aria-label="Fechar player" className="p-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showModes && (
          <div
            className="mb-3 rounded-xl p-3"
            style={{ border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.75)" }}>
                <Waves className="w-3.5 h-3.5 inline mr-1" />
                CAMADA SONORA · BINAURAL + SOUNDSCAPE
              </p>
              <button
                onClick={() => setLayerOn((v) => !v)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: layerOn ? cfg.color : "rgba(255,255,255,0.10)",
                  color: layerOn ? "#03030a" : "rgba(255,255,255,0.75)",
                }}
              >
                {layerOn ? "ATIVA" : "DESLIGADA"}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {MCE_AUDIO_MODES.map((m) => {
                const active = layerOn && m.key === mode;
                return (
                  <button
                    key={m.key}
                    onClick={() => { setMode(m.key); setLayerOn(true); }}
                    className="py-2 rounded-lg text-center"
                    style={{
                      border: `1px solid ${active ? `${m.color}88` : "rgba(255,255,255,0.10)"}`,
                      background: active ? `${m.color}1A` : "transparent",
                      color: active ? m.color : "rgba(255,255,255,0.65)",
                    }}
                  >
                    <span className="block text-base leading-none">{m.icon}</span>
                    <span className="block text-[10px] font-semibold mt-1">{m.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              {cfg.icon} <strong style={{ color: cfg.color }}>{cfg.beatStartHz}→{cfg.beatEndHz} Hz</strong> · {cfg.blurb}
              <br />
              Soundscape: {cfg.scapeName}. Use fones para o efeito binaural.
            </p>
          </div>
        )}

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
