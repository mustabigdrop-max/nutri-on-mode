import { useEffect, useRef, useState } from "react";
import { Camera, Download, Pause, Play, RefreshCw, Repeat, Scissors, Waves } from "lucide-react";
import { toast } from "sonner";
import { analyzeVideoEnergy, downloadBlob, exportClip, type EnergyAnalysis } from "@/lib/reelsClip";


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
  const [loop, setLoop] = useState(true);
  const [energy, setEnergy] = useState<EnergyAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [expPct, setExpPct] = useState(0);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    setReady(false); setPlaying(false); setCurrent(0); setStart(0); setEnergy(null);
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
    if (!v || exporting) return;
    setCurrent(v.currentTime);
    if (v.currentTime >= end) {
      if (loop && playing) { v.currentTime = start; v.play(); }
      else { v.pause(); setPlaying(false); }
    }
  };

  const suggestHook = async () => {
    const v = videoRef.current;
    if (!v) return;
    setAnalyzing(true);
    const res = energy ?? (await analyzeVideoEnergy(file));
    setAnalyzing(false);
    if (!res) { toast.error("Não consegui ler o áudio desse vídeo."); return; }
    setEnergy(res);
    const s = Math.min(res.suggestedStart, Math.max(0, duration - 5));
    setStart(s);
    if (end <= s + 3) setEnd(Math.min(s + 30, duration));
    seek(s);
    toast.success(`Hook sugerido em ${s.toFixed(1)}s (pico de energia em ${res.peakAt.toFixed(1)}s)`);
  };

  const doExport = async () => {
    const v = videoRef.current;
    if (!v || exporting) return;
    setExporting(true); setExpPct(0); setPlaying(false);
    const wasMuted = v.muted;
    try {
      const clip = await exportClip(v, start, end, setExpPct);
      downloadBlob(clip.blob, `reel-corte-${Math.round(start)}s-${Math.round(end)}s.${clip.ext}`);
      toast.success(`Trecho exportado em ${clip.ext.toUpperCase()}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao exportar o trecho");
    } finally {
      v.muted = wasMuted;
      setExporting(false); setExpPct(0);
    }
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
            <button
              onClick={() => setLoop((v) => !v)}
              aria-pressed={loop}
              title="Reproduzir o trecho em loop contínuo"
              style={{ background: loop ? `${C.cyan}22` : "transparent", border: `1px solid ${loop ? C.cyan : C.border}`, color: loop ? C.cyan : C.textMid, padding: 8, cursor: "pointer", display: "flex" }}
            >
              <Repeat size={15} />
            </button>
            <span style={{ ...fM, fontSize: 12, color: C.textMid, minWidth: 42 }}>{formatTime(current)}</span>
            <div
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - r.left) / r.width) * duration);
              }}
              style={{ flex: 1, height: 26, background: "#141420", position: "relative", cursor: "pointer" }}
            >
              {energy && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: 1, opacity: 0.5, pointerEvents: "none" }}>
                  {energy.envelope.map((v, i) => (
                    <div key={i} style={{ flex: 1, height: `${Math.max(6, v * 100)}%`, background: C.cyan }} />
                  ))}
                </div>
              )}
              <div style={{ position: "absolute", left: `${duration ? (start / duration) * 100 : 0}%`, width: `${duration ? (cut / duration) * 100 : 0}%`, top: 0, bottom: 0, background: `${C.green}33`, border: `1px solid ${C.green}66` }} />
              <div style={{ position: "absolute", left: `${pct}%`, top: 0, bottom: 0, width: 2, background: C.gold }} />
            </div>
            <span style={{ ...fM, fontSize: 12, color: C.textMid, minWidth: 42 }}>{formatTime(duration)}</span>
          </div>
          <div style={{ ...fM, fontSize: 11, color: loop ? C.cyan : C.textMuted, marginTop: 6 }}>
            {loop ? "LOOP CONTÍNUO ATIVO · o trecho repete pra você conferir a transição" : "Loop desligado"}
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

          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button
              onClick={suggestHook}
              disabled={analyzing || exporting}
              style={{ flex: "1 1 180px", padding: "11px 0", background: `${C.cyan}18`, border: `1px solid ${C.cyan}66`, ...fT, fontSize: 15, color: C.cyan, cursor: analyzing ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {analyzing
                ? <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> LENDO O ÁUDIO...</>
                : <><Waves size={15} /> SUGERIR INÍCIO DO HOOK</>}
            </button>
            <button
              onClick={doExport}
              disabled={exporting || analyzing}
              style={{ flex: "1 1 180px", padding: "11px 0", background: `${C.orange}18`, border: `1px solid ${C.orange}66`, ...fT, fontSize: 15, color: C.orange, cursor: exporting ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {exporting
                ? <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> GRAVANDO {Math.round(expPct)}%</>
                : <><Download size={15} /> BAIXAR TRECHO (MP4/WEBM)</>}
            </button>
          </div>
          {exporting && (
            <div style={{ height: 4, background: "#141420", marginTop: 8 }}>
              <div style={{ height: "100%", width: `${expPct}%`, background: C.orange }} />
            </div>
          )}
          {energy && (
            <div style={{ ...fM, fontSize: 11, color: C.textMuted, marginTop: 8 }}>
              Pico de energia em {energy.peakAt.toFixed(1)}s · início sugerido {energy.suggestedStart.toFixed(1)}s
            </div>
          )}


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
