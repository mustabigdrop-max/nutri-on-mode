import { useEffect, useRef, useState } from "react";
import { Camera, Pause, Play, RefreshCw, Scissors } from "lucide-react";

const C = {
  bg: "#020205", card: "#080810", border: "#B8922A22",
  gold: "#B8922A", cyan: "#00D4FF", green: "#00C896",
  red: "#ff4444", orange: "#E8A020",
  text: "#F5F0E8", textMid: "#A0A0A0", textMuted: "#4A4A4A",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

export type TrimInfo = { start: number; end: number; duration: number };

export const formatTime = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
};

function captureFrame(video: HTMLVideoElement, time: number): Promise<string | null> {
  return new Promise((resolve) => {
    const handler = () => {
      video.removeEventListener("seeked", handler);
      let w = video.videoWidth || 720;
      let h = video.videoHeight || 1280;
      const max = 1024;
      if (w > max || h > max) {
        if (w > h) { h = Math.round((h * max) / w); w = max; } else { w = Math.round((w * max) / h); h = max; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(video, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    video.addEventListener("seeked", handler);
    video.currentTime = Math.max(0, Math.min(time, (video.duration || 1) - 0.05));
  });
}

/** Player + corte de trecho do vídeo, com captura do frame central para análise. */
export default function ReelsVideoTrimmer({
  file, onFrameCaptured,
}: { file: File; onFrameCaptured: (dataUrl: string, trim: TrimInfo) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(35);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    setReady(false); setPlaying(false); setCurrent(0); setStart(0);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const onLoaded = () => {
    const v = videoRef.current;
    if (!v) return;
    const d = v.duration || 0;
    setDuration(d);
    setEnd(Math.min(d || 35, 35));
    setReady(true);
  };

  const seek = (t: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(t, duration || 0));
    setCurrent(v.currentTime);
  };

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { if (v.currentTime < start || v.currentTime > end) seek(start); v.play(); setPlaying(true); }
  };

  const onTime = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrent(v.currentTime);
    if (v.currentTime >= end) { v.pause(); setPlaying(false); }
  };

  const capture = async () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause(); setPlaying(false);
    setCapturing(true);
    const shot = await captureFrame(v, start + (end - start) / 2);
    setCapturing(false);
    if (shot) onFrameCaptured(shot, { start: Math.round(start), end: Math.round(end), duration: Math.round(end - start) });
  };

  const pct = duration ? (current / duration) * 100 : 0;
  const cut = Math.max(0, end - start);

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14, marginBottom: 20 }}>
      <video
        ref={videoRef}
        src={url}
        playsInline
        preload="metadata"
        onLoadedMetadata={onLoaded}
        onTimeUpdate={onTime}
        style={{ width: "100%", maxHeight: 320, objectFit: "contain", background: "#000" }}
      />

      {ready && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <button
              onClick={toggle}
              aria-label={playing ? "Pausar" : "Reproduzir"}
              style={{ background: `${C.gold}18`, border: `1px solid ${C.gold}55`, color: C.gold, padding: 8, cursor: "pointer", display: "flex" }}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <span style={{ ...fM, fontSize: 12, color: C.textMid, minWidth: 42 }}>{formatTime(current)}</span>
            <div
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - r.left) / r.width) * duration);
              }}
              style={{ flex: 1, height: 8, background: "#141420", position: "relative", cursor: "pointer" }}
            >
              <div style={{ position: "absolute", left: `${duration ? (start / duration) * 100 : 0}%`, width: `${duration ? (cut / duration) * 100 : 0}%`, top: 0, bottom: 0, background: `${C.green}33`, border: `1px solid ${C.green}66` }} />
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: `${C.gold}88` }} />
            </div>
            <span style={{ ...fM, fontSize: 12, color: C.textMid, minWidth: 42 }}>{formatTime(duration)}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, marginBottom: 8 }}>
            <Scissors size={14} color={C.green} />
            <span style={{ ...fM, fontSize: 12, color: C.green, letterSpacing: "0.1em" }}>CORTAR TRECHO</span>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <label style={{ flex: "1 1 200px" }}>
              <div style={{ ...fM, fontSize: 11, color: C.textMuted }}>INÍCIO</div>
              <input
                type="range" min={0} max={Math.max(duration, 1)} step={0.5} value={start}
                onChange={(e) => { const v = +e.target.value; setStart(v); if (v >= end) setEnd(Math.min(v + 5, duration)); seek(v); }}
                style={{ width: "100%", accentColor: C.green }}
              />
              <div style={{ ...fM, fontSize: 12, color: C.text }}>{formatTime(start)}</div>
            </label>
            <label style={{ flex: "1 1 200px" }}>
              <div style={{ ...fM, fontSize: 11, color: C.textMuted }}>FIM</div>
              <input
                type="range" min={0} max={Math.max(duration, 1)} step={0.5} value={end}
                onChange={(e) => { const v = +e.target.value; setEnd(v); if (v <= start) setStart(Math.max(v - 5, 0)); seek(v); }}
                style={{ width: "100%", accentColor: C.red }}
              />
              <div style={{ ...fM, fontSize: 12, color: C.text }}>{formatTime(end)}</div>
            </label>
          </div>

          <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 8 }}>
            Duração do corte: <span style={{ color: C.text }}>{formatTime(cut)}</span>
            {cut > 60 && <span style={{ color: C.orange }}> · recomendado até 35s</span>}
          </div>

          <button
            onClick={capture}
            disabled={capturing}
            style={{ width: "100%", marginTop: 12, padding: "12px 0", background: capturing ? C.card : C.green, border: "none", ...fT, fontSize: 16, color: capturing ? C.textMid : C.bg, cursor: capturing ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {capturing
              ? <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> CAPTURANDO...</>
              : <><Camera size={15} /> USAR ESTE TRECHO</>}
          </button>
        </>
      )}

      {!ready && (
        <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 10 }}>Carregando vídeo...</div>
      )}
    </div>
  );
}
