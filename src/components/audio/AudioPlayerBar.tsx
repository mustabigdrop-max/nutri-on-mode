import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw, X, Headphones, Waves, Repeat, Download, Flag, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { extractClip, downloadBlob } from "@/lib/audioClip";
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
const LS_RATE = "mce_audio_rate";
const LS_MARKS = "mce_audio_marks";
const RATES = [0.75, 1, 1.25, 1.5];

export type TrackSection = { label: string; start: number; end: number };

export type PlayerTrack = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  startAt?: number;
  sections?: TrackSection[];
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
  onNext,
  onPrev,
  queueLabel,
}: {
  track: PlayerTrack;
  onClose: () => void;
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  queueLabel?: string;
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

  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [loopSection, setLoopSection] = useState(false);

  // Seções: usa as do track ou divide o áudio em 5 blocos iguais
  const sections: TrackSection[] = useMemo(() => {
    if (track.sections?.length) return track.sections;
    if (!duration || !isFinite(duration)) return [];
    const n = duration > 900 ? 6 : duration > 240 ? 5 : 3;
    const step = duration / n;
    return Array.from({ length: n }, (_, i) => ({
      label: `Bloco ${i + 1}`,
      start: i * step,
      end: (i + 1) * step,
    }));
  }, [track.sections, duration]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = track.startAt ?? 0;
    setActiveSection(null);
    setLoopSection(false);
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [track.id, track.src, track.startAt]);

  const playSection = (i: number) => {
    const s = sections[i];
    const a = audioRef.current;
    if (!s || !a) return;
    setActiveSection(i);
    a.currentTime = s.start;
    a.play().catch(() => {});
  };

  const repeatSection = () => {
    const i = activeSection ?? sections.findIndex((s) => time >= s.start && time < s.end);
    if (i >= 0) playSection(i);
  };

  // ---- Velocidade ----
  const [rate, setRate] = useState<number>(() => Number(localStorage.getItem(LS_RATE)) || 1);
  useEffect(() => {
    localStorage.setItem(LS_RATE, String(rate));
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate, track.id]);

  // ---- Repetição A-B ----
  const [pointA, setPointA] = useState<number | null>(null);
  const [pointB, setPointB] = useState<number | null>(null);
  const abActive = pointA != null && pointB != null && pointB > pointA;

  // ---- Marcadores manuais ----
  const markerKey = `${LS_MARKS}:${track.id}`;
  const [markers, setMarkers] = useState<{ label: string; at: number }[]>([]);
  useEffect(() => {
    try {
      setMarkers(JSON.parse(localStorage.getItem(markerKey) || "[]"));
    } catch {
      setMarkers([]);
    }
    setPointA(null);
    setPointB(null);
  }, [markerKey]);

  const saveMarkers = (list: { label: string; at: number }[]) => {
    setMarkers(list);
    localStorage.setItem(markerKey, JSON.stringify(list));
  };

  const addMarker = () => {
    const at = audioRef.current?.currentTime ?? time;
    const list = [...markers, { label: `M${markers.length + 1}`, at }].sort((a, b) => a.at - b.at);
    saveMarkers(list.map((m, i) => ({ ...m, label: `M${i + 1}` })));
    toast.success(`Marcador em ${fmt(at)}`);
  };

  const removeMarker = (idx: number) => {
    const list = markers.filter((_, i) => i !== idx).map((m, i) => ({ ...m, label: `M${i + 1}` }));
    saveMarkers(list);
  };

  const seekTo = (t: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, t);
    a.play().catch(() => {});
  };

  // ---- Exportar trecho ----
  const [exporting, setExporting] = useState(false);
  const exportRange = async () => {
    let start: number | null = null;
    let end: number | null = null;
    if (abActive) {
      start = pointA!;
      end = pointB!;
    } else {
      const i = activeSection ?? sections.findIndex((s) => time >= s.start && time < s.end);
      if (i >= 0 && sections[i]) {
        start = sections[i].start;
        end = sections[i].end;
      }
    }
    if (start == null || end == null) {
      toast.error("Selecione uma seção ou marque A-B primeiro.");
      return;
    }
    setExporting(true);
    try {
      const blob = await extractClip(track.src, start, end);
      const safe = track.title.replace(/[^\w\-]+/g, "_").slice(0, 40);
      downloadBlob(blob, `${safe}_${Math.round(start)}s-${Math.round(end)}s.wav`);
      toast.success("Trecho exportado.");
    } catch (e: any) {
      toast.error(e?.message || "Falha ao exportar o trecho.");
    }
    setExporting(false);
  };

  // Seção atual (para exibir na tela bloqueada)
  const currentSectionIndex = useMemo(() => {
    if (activeSection != null) return activeSection;
    return sections.findIndex((s) => time >= s.start && time < s.end);
  }, [activeSection, sections, time]);
  const currentSectionLabel =
    currentSectionIndex >= 0 && sections[currentSectionIndex] ? sections[currentSectionIndex].label : null;

  // ---- Media Session: segundo plano + controles na tela bloqueada ----
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    try {
      ms.metadata = new MediaMetadata({
        title: currentSectionLabel ? `${track.title} — ${currentSectionLabel}` : track.title,
        artist: queueLabel ? `Coach Diogo · ${queueLabel}` : "Coach Diogo · MCE Audio Academy",
        album: track.subtitle || "nutriON",
        artwork: [
          { src: "/favicon.svg", sizes: "512x512", type: "image/svg+xml" },
          { src: "/favicon.svg", sizes: "256x256", type: "image/svg+xml" },
          { src: "/favicon.svg", sizes: "96x96", type: "image/svg+xml" },
        ],
      });
    } catch {
      /* metadata opcional */
    }
  }, [track.title, track.subtitle, currentSectionLabel, queueLabel]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    const el = () => audioRef.current;
    const set = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        /* ação não suportada no dispositivo */
      }
    };

    // Avança/volta 15s preservando a seção selecionada e o loop ativo
    const nudge = (delta: number) => {
      const a = el();
      if (!a) return;
      const target = Math.min(Math.max(0, a.currentTime + delta), a.duration || Infinity);
      a.currentTime = target;
      a.play().catch(() => {});
    };

    set("play", () => el()?.play().catch(() => {}));
    set("pause", () => el()?.pause());
    set("stop", () => el()?.pause());
    set("seekbackward", (d) => nudge(-(d?.seekOffset ?? 15)));
    set("seekforward", (d) => nudge(d?.seekOffset ?? 15));
    set("seekto", (d) => {
      const a = el();
      if (!a || d?.seekTime == null) return;
      if (d.fastSeek && "fastSeek" in a) (a as HTMLAudioElement).fastSeek(d.seekTime);
      else a.currentTime = d.seekTime;
    });
    set("previoustrack", () => {
      if (onPrev) return onPrev();
      const a = el();
      if (!a) return;
      const s = currentSectionIndex >= 0 ? sections[currentSectionIndex] : null;
      a.currentTime = s ? s.start : Math.max(0, a.currentTime - 30);
      a.play().catch(() => {});
    });
    set("nexttrack", () => {
      if (onNext) return onNext();
      const a = el();
      if (!a) return;
      const i = sections.findIndex((s) => a.currentTime < s.start);
      a.currentTime = i >= 0 ? sections[i].start : Math.min(a.duration || 0, a.currentTime + 30);
      a.play().catch(() => {});
    });

    return () => {
      (["play", "pause", "stop", "seekbackward", "seekforward", "seekto", "previoustrack", "nexttrack"] as MediaSessionAction[])
        .forEach((a) => set(a, null));
    };
  }, [sections, currentSectionIndex, onNext, onPrev]);


  // Estado de reprodução + posição para a tela bloqueada
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, [playing]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !navigator.mediaSession.setPositionState) return;
    if (!duration || !isFinite(duration)) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: rate,
        position: Math.min(Math.max(time, 0), duration),
      });
    } catch {
      /* posição opcional */
    }
  }, [time, duration, rate]);

  // Mantém o áudio tocando quando o app vai para segundo plano
  useEffect(() => {
    const onVisibility = () => {
      const a = audioRef.current;
      if (!a) return;
      if (document.visibilityState === "hidden" && playing && a.paused) a.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [playing]);


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
        preload="metadata"
        playsInline
        crossOrigin="anonymous"

        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          if (abActive) {
            // A-B tem prioridade sobre o loop de seção
            if (a.currentTime >= pointB! - 0.05 || a.currentTime < pointA! - 0.5) {
              a.currentTime = pointA!;
              a.play().catch(() => {});
            }
          } else if (loopSection && activeSection != null) {
            const s = sections[activeSection];
            if (s && a.currentTime >= s.end - 0.05) {
              a.currentTime = s.start;
              a.play().catch(() => {});
            }
          }
          setTime(a.currentTime);
          onProgress?.(a.currentTime, a.duration || 0);
        }}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration || 0);
          e.currentTarget.playbackRate = rate;
        }}
        onRateChange={(e) => {
          if (e.currentTarget.playbackRate !== rate) e.currentTarget.playbackRate = rate;
        }}
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

        {/* Velocidade · A-B · Exportar */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="text-[10px] font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
            VEL
          </span>
          {RATES.map((r) => (
            <button
              key={r}
              onClick={() => setRate(r)}
              className="px-2 py-1 rounded-lg text-[10px] font-bold"
              style={{
                border: `1px solid ${rate === r ? `${GOLD}88` : "rgba(255,255,255,0.10)"}`,
                background: rate === r ? `${GOLD}1A` : "transparent",
                color: rate === r ? GOLD : "rgba(255,255,255,0.6)",
              }}
            >
              {String(r).replace(".", ",")}x
            </button>
          ))}

          <span className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.12)" }} />

          <button
            onClick={() => {
              const t = audioRef.current?.currentTime ?? time;
              setPointA(t);
              if (pointB != null && pointB <= t) setPointB(null);
            }}
            className="px-2 py-1 rounded-lg text-[10px] font-bold"
            style={{
              border: `1px solid ${pointA != null ? `${GOLD}88` : "rgba(255,255,255,0.10)"}`,
              color: pointA != null ? GOLD : "rgba(255,255,255,0.6)",
            }}
          >
            A {pointA != null ? fmt(pointA) : ""}
          </button>
          <button
            onClick={() => {
              const t = audioRef.current?.currentTime ?? time;
              if (pointA == null || t <= pointA) {
                toast.error("Marque o ponto A antes e avance o áudio.");
                return;
              }
              setPointB(t);
              setLoopSection(false);
            }}
            className="px-2 py-1 rounded-lg text-[10px] font-bold"
            style={{
              border: `1px solid ${pointB != null ? `${GOLD}88` : "rgba(255,255,255,0.10)"}`,
              color: pointB != null ? GOLD : "rgba(255,255,255,0.6)",
            }}
          >
            B {pointB != null ? fmt(pointB) : ""}
          </button>
          {(pointA != null || pointB != null) && (
            <button
              onClick={() => { setPointA(null); setPointB(null); }}
              className="px-2 py-1 rounded-lg text-[10px] font-bold"
              style={{ border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }}
            >
              limpar A-B
            </button>
          )}
          {abActive && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: GOLD, color: "#03030a" }}>
              LOOP A-B
            </span>
          )}

          <button
            onClick={addMarker}
            className="ml-auto px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1"
            style={{ border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.75)" }}
          >
            <Flag className="w-3 h-3" /> Marcar
          </button>
          <button
            onClick={exportRange}
            disabled={exporting}
            className="px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 disabled:opacity-50"
            style={{ border: `1px solid ${GOLD}66`, color: GOLD }}
          >
            {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            {exporting ? "Exportando..." : "Baixar trecho"}
          </button>
        </div>

        {markers.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2">
            {markers.map((m, i) => (
              <span
                key={`${m.label}-${m.at}`}
                className="flex items-center gap-1 px-2 py-1 rounded-lg whitespace-nowrap text-[10px] font-semibold"
                style={{ border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.7)" }}
              >
                <button onClick={() => seekTo(m.at)} className="flex items-center gap-1">
                  <Flag className="w-3 h-3" style={{ color: GOLD }} /> {m.label} · {fmt(m.at)}
                </button>
                <button onClick={() => removeMarker(i)} aria-label={`Remover ${m.label}`}>
                  <Trash2 className="w-3 h-3" style={{ color: "rgba(255,255,255,0.35)" }} />
                </button>
              </span>
            ))}
          </div>
        )}

        {sections.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
                SEÇÕES DO RITUAL
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={repeatSection}
                  className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"
                  style={{ border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.75)" }}
                >
                  <Repeat className="w-3 h-3" /> Repetir seção
                </button>
                <button
                  onClick={() => {
                    if (activeSection == null) {
                      const i = sections.findIndex((s) => time >= s.start && time < s.end);
                      setActiveSection(i >= 0 ? i : 0);
                    }
                    setLoopSection((v) => !v);
                  }}
                  className="text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{
                    background: loopSection ? GOLD : "rgba(255,255,255,0.08)",
                    color: loopSection ? "#03030a" : "rgba(255,255,255,0.75)",
                  }}
                >
                  LOOP {loopSection ? "ON" : "OFF"}
                </button>
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {sections.map((s, i) => {
                const current = activeSection === i || (time >= s.start && time < s.end);
                return (
                  <button
                    key={`${s.label}-${i}`}
                    onClick={() => playSection(i)}
                    className="px-2.5 py-1 rounded-lg whitespace-nowrap text-[10px] font-semibold"
                    style={{
                      border: `1px solid ${current ? `${GOLD}88` : "rgba(255,255,255,0.10)"}`,
                      background: current ? `${GOLD}1A` : "transparent",
                      color: current ? GOLD : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {s.label} · {fmt(s.start)}
                  </button>
                );
              })}
            </div>
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
