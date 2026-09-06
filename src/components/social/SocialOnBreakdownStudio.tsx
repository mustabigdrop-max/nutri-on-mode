import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BreakdownRecorder from "./BreakdownRecorder";
import { listBreakdownSessions, saveBreakdownSession, getBreakdownVideoUrl, deleteBreakdownSession, type BreakdownSession } from "@/lib/breakdownSessions";

/* Breakdown Studio — corte do vídeo, momentos-chave e freeze com análise
   completa em camadas (execução, ativação muscular, MCE e alerta APEX).
   O vídeo é reproduzido e pausa sozinho em cada momento marcado; grave a
   tela do celular para postar como Reels. */

const T = {
  bg: "#020205", s: "#0a0e18", s2: "#111827",
  cyan: "#00D4FF", gold: "#B8922A", green: "#00d4a1",
  red: "#ff4757", text: "#e8edf5", muted: "#6b7a94",
  border: "#1e2d45",
};

export type BreakdownAnalysis = {
  exercicio?: string;
  padrao?: string;
  musculos_primarios?: string[];
  musculos_secundarios?: string[];
  execucao?: { titulo?: string; descricao?: string; cue?: string; erro_comum?: string };
  musculos_ativos?: Record<string, number>;
  mce?: { mentalidade?: string; comportamento?: string; execucao_mce?: string };
  alerta_apex?: string;
  frase_impacto?: string;
};

const MUSCLE_NAMES: Record<string, string> = {
  peitoral: "Peitoral", peitoral_e: "Peitoral E", peitoral_d: "Peitoral D",
  deltoide: "Deltóides", deltoide_e: "Deltóide E", deltoide_d: "Deltóide D",
  biceps: "Bíceps", biceps_e: "Bíceps E", biceps_d: "Bíceps D",
  triceps: "Tríceps", triceps_e: "Tríceps E", triceps_d: "Tríceps D",
  trapezio: "Trapézio", dorsais: "Dorsais", dorsal_e: "Dorsal E", dorsal_d: "Dorsal D",
  abdomen: "Core", obliquos: "Oblíquos", obliquo_e: "Oblíquo E", obliquo_d: "Oblíquo D",
  lombar: "Lombar", gluteos: "Glúteos", gluteo_e: "Glúteo E", gluteo_d: "Glúteo D",
  quadriceps: "Quadríceps", quadriceps_e: "Quad E", quadriceps_d: "Quad D",
  isquiotibiais: "Isquiotibiais", isquio_e: "Isquio E", isquio_d: "Isquio D",
  panturrilha: "Panturrilha", panturrilha_e: "Pant E", panturrilha_d: "Pant D",
  adutor: "Adutor", adutor_e: "Adutor E", adutor_d: "Adutor D",
};

const LVL_COLOR: Record<number, string> = { 3: T.cyan, 2: T.gold, 1: T.green };
const LVL_LABEL: Record<number, string> = { 3: "PRIMÁRIO", 2: "SECUNDÁRIO", 1: "ESTABILIZADOR" };
const LVL_PCT: Record<number, number> = { 3: 100, 2: 66, 1: 33 };

/* ─── MCE Card ─── */
function MCECard({ mce }: { mce?: BreakdownAnalysis["mce"] }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {[
        { icon: "🧠", label: "MENTALIDADE", text: mce?.mentalidade, color: T.cyan },
        { icon: "⚡", label: "COMPORTAMENTO", text: mce?.comportamento, color: T.gold },
        { icon: "🎯", label: "EXECUÇÃO", text: mce?.execucao_mce, color: T.green },
      ].map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(2,2,5,0.75)", borderRadius: 8, padding: "7px 10px", borderLeft: `3px solid ${item.color}` }}>
          <span style={{ fontSize: 13 }}>{item.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: item.color, letterSpacing: 1 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: T.text, lineHeight: 1.4, marginTop: 2 }}>{item.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Freeze Overlay (progressivo) ─── */
function FreezeOverlay({ data, onResume }: { data: BreakdownAnalysis | null; onResume: () => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    setP(0);
    const ts = [
      setTimeout(() => setP(1), 300),
      setTimeout(() => setP(2), 1500),
      setTimeout(() => setP(3), 3500),
      setTimeout(() => setP(4), 5500),
      setTimeout(() => onResume(), 8500),
    ];
    return () => ts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!data) return null;
  const phase = (n: number) => ({
    opacity: p >= n ? 1 : 0,
    transform: p >= n ? "translate(0,0)" : n === 1 ? "translateX(-30px)" : "translateY(20px)",
    transition: "all 0.5s ease",
  });

  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(2,2,5,0.88)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", animation: "fadeIn 0.4s ease", zIndex: 10, overflow: "hidden" }}>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes pulseGlow { 0%,100% { box-shadow: 0 0 10px rgba(0,212,255,0.3); } 50% { box-shadow: 0 0 25px rgba(0,212,255,0.6); } }
@keyframes edgePulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.8; } }
@keyframes scanDown { 0% { top: 0; } 100% { top: 100%; } }
@keyframes bracketPulse { 0%,100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.03); } }
@keyframes barGlow { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.3); } }
@keyframes freezeFlash { 0% { opacity: 0.55; } 12% { opacity: 0; } 100% { opacity: 0; } }
@keyframes rgbShift { 0%,100% { text-shadow: -2px 0 #ff0000, 2px 0 #00ffff; } 50% { text-shadow: 2px 0 #ff0000, -2px 0 #00ffff; } }
@keyframes scanPulse { 0%,100% { opacity: 0.4; width: 40%; } 50% { opacity: 1; width: 60%; } }
@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
@keyframes energyFlow { 0%,100% { opacity: 0.25; } 50% { opacity: 0.9; } }
@keyframes ringCountdown { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 138; } }`}</style>

      {/* Flash no congelamento */}
      <div style={{ position: "absolute", inset: 0, background: T.cyan, animation: "freezeFlash 0.7s ease forwards", pointerEvents: "none" }} />

      {/* Brilho nas bordas */}
      <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 70px ${T.cyan}40`, animation: "edgePulse 2.5s ease-in-out infinite", pointerEvents: "none" }} />

      {/* Linha de varredura */}
      <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)`, animation: "scanDown 3s linear infinite", pointerEvents: "none" }} />

      {/* Cantos */}
      {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => (
        <div key={i} style={{
          position: "absolute", width: 26, height: 26, pointerEvents: "none",
          [x ? "right" : "left"]: 10, [y ? "bottom" : "top"]: 10,
          [`border${y ? "Bottom" : "Top"}`]: `2px solid ${T.cyan}`,
          [`border${x ? "Right" : "Left"}`]: `2px solid ${T.cyan}`,
          animation: "bracketPulse 2s ease-in-out infinite",
        } as React.CSSProperties} />
      ))}

      {/* Barras de energia laterais */}
      {[0, 1].map((side) => (
        <div key={side} style={{
          position: "absolute", top: "22%", bottom: "22%", width: 3, borderRadius: 3,
          [side ? "right" : "left"]: 4,
          background: `linear-gradient(180deg, transparent, ${T.cyan}, transparent)`,
          animation: "energyFlow 2.2s ease-in-out infinite", pointerEvents: "none",
        } as React.CSSProperties} />
      ))}

      {/* Anel de contagem */}
      <div style={{ position: "absolute", top: 12, right: 12, width: 52, height: 52, opacity: p >= 1 ? 0.75 : 0, transition: "opacity 0.3s", pointerEvents: "none" }}>
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="22" fill="none" stroke={T.border} strokeWidth="3" />
          <circle cx="26" cy="26" r="22" fill="none" stroke={T.cyan} strokeWidth="3" strokeLinecap="round"
            strokeDasharray="138" transform="rotate(-90 26 26)"
            style={{ animation: "ringCountdown 8s linear forwards" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: T.cyan }}>⏸</div>
      </div>

      {/* Fase inicial — varredura */}
      {p === 0 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, pointerEvents: "none" }}>
          <div style={{ fontFamily: "monospace", fontSize: 13, color: T.cyan, letterSpacing: 6, animation: "rgbShift 0.25s steps(1) 3" }}>ANALISANDO</div>
          <div style={{ height: 3, borderRadius: 3, background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)`, animation: "scanPulse 1s ease-in-out infinite", width: "50%" }} />
        </div>
      )}


      {/* Top bar */}
      <div style={{ padding: "14px 16px 10px", borderBottom: `2px solid ${T.cyan}`, ...phase(1) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: T.cyan, letterSpacing: 2 }}>SOCIAL ON · BREAKDOWN</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.text, letterSpacing: 0.5, marginTop: 4, lineHeight: 1.1 }}>{data.exercicio?.toUpperCase()}</div>
          </div>
          <div style={{ background: `${T.cyan}18`, border: `1px solid ${T.cyan}50`, color: T.cyan, fontFamily: "monospace", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6, flexShrink: 0 }}>{data.padrao}</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "grid", gap: 10, alignContent: "start" }}>
        {/* Execução */}
        <div style={{ background: "rgba(2,2,5,0.85)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", ...phase(1) }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, lineHeight: 1.3 }}>{data.execucao?.titulo}</div>
          <div style={{ fontSize: 11.5, color: T.muted, lineHeight: 1.5, marginTop: 6 }}>{data.execucao?.descricao}</div>
          <div style={{ marginTop: 8, background: "rgba(0,212,255,0.08)", border: `1px solid rgba(0,212,255,0.3)`, borderRadius: 8, padding: "8px 10px", animation: p >= 1 ? "pulseGlow 2s ease infinite" : "none" }}>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: T.cyan, letterSpacing: 1 }}>CUE PRINCIPAL</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.cyan, marginTop: 3, lineHeight: 1.4 }}>{data.execucao?.cue}</div>
          </div>
          <div style={{ marginTop: 6, borderLeft: `3px solid ${T.red}`, paddingLeft: 10, background: "rgba(255,71,87,0.06)", borderRadius: 4, padding: "6px 10px" }}>
            <span style={{ fontFamily: "monospace", fontSize: 8, color: T.red, letterSpacing: 1 }}>ERRO COMUM · </span>
            <span style={{ fontSize: 11, color: T.text }}>{data.execucao?.erro_comum}</span>
          </div>
        </div>

        {/* Ativação muscular */}
        <div style={{ background: "rgba(2,2,5,0.85)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", ...phase(2) }}>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: T.muted, letterSpacing: 2, marginBottom: 8 }}>ATIVAÇÃO MUSCULAR</div>
          <div style={{ display: "grid", gap: 6 }}>
            {Object.entries(data.musculos_ativos || {})
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([key, level], i) => {
                const color = LVL_COLOR[level] || T.green;
                return (
                  <div key={key} style={{ opacity: p >= 2 ? 1 : 0, transform: p >= 2 ? "translateX(0)" : "translateX(-30px)", transition: `all 0.4s ease ${i * 0.1}s` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{MUSCLE_NAMES[key] || key}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 8, color, letterSpacing: 1 }}>{LVL_LABEL[level] || ""}</span>
                    </div>
                    <div style={{ height: 6, background: T.s2, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: p >= 2 ? `${LVL_PCT[level] || 33}%` : "0%", background: `linear-gradient(90deg, ${color}90, ${color})`, boxShadow: level === 3 ? `0 0 12px ${color}60` : "none", borderRadius: 4, transition: `width 0.8s ease ${i * 0.1 + 0.3}s` }} />
                    </div>
                  </div>
                );
              })}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
            {[{ c: T.cyan, l: "Primário" }, { c: T.gold, l: "Secundário" }, { c: T.green, l: "Estabilizador" }].map((x) => (
              <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: x.c, boxShadow: `0 0 6px ${x.c}` }} />
                <span style={{ fontFamily: "monospace", fontSize: 8, color: T.muted, letterSpacing: 1 }}>{x.l.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MCE */}
        <div style={{ background: "rgba(2,2,5,0.85)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", ...phase(3) }}>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: T.gold, letterSpacing: 2, marginBottom: 8 }}>MÉTODO MCE</div>
          <MCECard mce={data.mce} />
        </div>
      </div>

      {/* Bottom */}
      <div style={{ padding: "10px 16px 14px", display: "grid", gap: 8, ...phase(4) }}>
        <div style={{ borderLeft: `3px solid ${T.gold}`, background: "rgba(184,146,42,0.08)", borderRadius: 6, padding: "8px 12px" }}>
          <div style={{ fontFamily: "monospace", fontSize: 8, color: T.gold, letterSpacing: 1 }}>⚠ AVALIAÇÃO POSTURAL PRÉVIA</div>
          <div style={{ fontSize: 11, color: T.text, marginTop: 3, lineHeight: 1.4 }}>{data.alerta_apex}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.cyan, lineHeight: 1.3 }}>"{data.frase_impacto}"</div>
          <div style={{ fontFamily: "monospace", fontSize: 8, color: T.muted, letterSpacing: 1, marginTop: 4 }}>@diogo.mell0 · nutriON · Método MCE</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
type Stage = "upload" | "trim" | "setpoints" | "loading" | "player" | "record";

export default function SocialOnBreakdownStudio({ handle = "@diogo.mell0" }: { handle?: string }) {
  const [stage, setStage] = useState<Stage>("upload");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [sessions, setSessions] = useState<BreakdownSession[]>([]);
  const [saving, setSaving] = useState(false);
  const [duration, setDuration] = useState(0);
  const [trim, setTrim] = useState({ start: 0, end: 0 });
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const [analyses, setAnalyses] = useState<(BreakdownAnalysis | null)[]>([]);
  const [currentBreak, setCurrentBreak] = useState(-1);
  const [frozen, setFrozen] = useState(false);
  const [loadProg, setLoadProg] = useState(0);
  const [playing, setPlaying] = useState(false);

  const trimRef = useRef<HTMLVideoElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLVideoElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 150 * 1024 * 1024) {
      toast({ title: "Vídeo muito grande", description: "Use até 150 MB.", variant: "destructive" });
      return;
    }
    setVideoFile(f);
    setVideoSrc(URL.createObjectURL(f));
    setBreakpoints([]); setAnalyses([]);
    setDuration(0); setTrim({ start: 0, end: 0 });
    setFrozen(false); setCurrentBreak(-1); setPlaying(false);
    setStage("trim");
  };

  const addBP = () => {
    const t = videoRef.current?.currentTime || 0;
    if (trim.end > trim.start && (t < trim.start || t > trim.end)) {
      toast({ title: "Fora do trecho", description: "Marque um momento dentro do corte definido.", variant: "destructive" });
      return;
    }
    setBreakpoints((p) => (p.some((b) => Math.abs(b - t) < 0.2) ? p : [...p, t].sort((a, b) => a - b)));
  };

  const analyzeAll = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    setStage("loading"); setLoadProg(0);
    const results: (BreakdownAnalysis | null)[] = [];
    const cv = document.createElement("canvas");
    for (let i = 0; i < breakpoints.length; i++) {
      setLoadProg((i / breakpoints.length) * 100);
      v.currentTime = breakpoints[i];
      await new Promise<void>((r) => { v.onseeked = () => r(); });
      await new Promise((r) => setTimeout(r, 300));
      cv.width = v.videoWidth; cv.height = v.videoHeight;
      cv.getContext("2d")?.drawImage(v, 0, 0);
      const dataUrl = cv.toDataURL("image/jpeg", 0.8);
      try {
        const { data, error } = await supabase.functions.invoke("social-on-generate", {
          body: { mode: "video_breakdown", images: [dataUrl], handle },
        });
        if (error) throw error;
        results.push((data?.result as BreakdownAnalysis) ?? null);
      } catch {
        results.push(null);
      }
      setLoadProg(((i + 1) / breakpoints.length) * 100);
    }
    setAnalyses(results);
    if (results.every((r) => !r)) {
      toast({ title: "Não consegui analisar", description: "Tente novamente em alguns segundos.", variant: "destructive" });
      setStage("setpoints");
      return;
    }
    setStage("player");
    setSaving(true);
    try {
      const saved = await saveBreakdownSession({
        file: videoFile,
        title: (results.find((r) => r?.exercicio)?.exercicio) || "Breakdown",
        exercise: results.find((r) => r?.exercicio)?.exercicio ?? null,
        trimStart: trim.start,
        trimEnd: trim.end,
        breakpoints,
        analyses: results,
      });
      if (saved) {
        setSessions((p) => [saved, ...p]);
        toast({ title: "Análise salva", description: "Você pode reabrir esta análise quando quiser." });
      }
    } catch {
      toast({ title: "Análise não salva", description: "O breakdown funciona, mas não consegui guardar no histórico.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [breakpoints, handle, videoFile, trim.start, trim.end]);

  useEffect(() => { listBreakdownSessions().then(setSessions).catch(() => undefined); }, []);

  const openSession = useCallback(async (s: BreakdownSession) => {
    const url = await getBreakdownVideoUrl(s.video_path);
    if (!url) {
      toast({ title: "Vídeo indisponível", description: "Esta análise foi salva sem o vídeo original.", variant: "destructive" });
      return;
    }
    setVideoFile(null);
    setVideoSrc(url);
    setTrim({ start: s.trim_start, end: s.trim_end });
    setBreakpoints(s.breakpoints);
    setAnalyses(s.analyses);
    setFrozen(false); setCurrentBreak(-1); setPlaying(false);
    setStage("player");
  }, []);

  const removeSession = useCallback(async (s: BreakdownSession) => {
    try {
      await deleteBreakdownSession(s);
      setSessions((p) => p.filter((x) => x.id !== s.id));
    } catch {
      toast({ title: "Não consegui apagar", variant: "destructive" });
    }
  }, []);

  // Breakpoint watcher — pausa sozinho em cada momento marcado
  useEffect(() => {
    if (stage !== "player") return;
    const v = playerRef.current;
    if (!v) return;
    const iv = window.setInterval(() => {
      if (frozen) return;
      const t = v.currentTime;
      if (trim.end > trim.start && t >= trim.end) { v.pause(); setPlaying(false); return; }
      for (let i = 0; i < breakpoints.length; i++) {
        if (Math.abs(t - breakpoints[i]) < 0.15 && currentBreak !== i && analyses[i]) {
          v.pause(); setPlaying(false); setFrozen(true); setCurrentBreak(i);
          return;
        }
      }
    }, 50);
    return () => window.clearInterval(iv);
  }, [stage, breakpoints, frozen, currentBreak, analyses, trim.end, trim.start]);

  const resumePlay = useCallback(() => {
    const v = playerRef.current;
    if (v && currentBreak >= 0) {
      v.currentTime = breakpoints[currentBreak] + 0.3;
      v.play().catch(() => undefined);
      setFrozen(false); setPlaying(true);
    }
  }, [currentBreak, breakpoints]);

  const startPlay = () => {
    const v = playerRef.current;
    if (!v) return;
    v.currentTime = trim.start || 0;
    v.play().catch(() => undefined);
    setPlaying(true); setFrozen(false); setCurrentBreak(-1);
  };

  const reset = () => {
    setStage("upload"); setVideoSrc(null); setVideoFile(null); setBreakpoints([]); setAnalyses([]);
    setFrozen(false); setCurrentBreak(-1); setPlaying(false);
    setTrim({ start: 0, end: 0 }); setDuration(0);
  };

  const box: React.CSSProperties = { background: T.s, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 };
  const btn: React.CSSProperties = { padding: "14px", background: T.cyan, color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 800, letterSpacing: 1, cursor: "pointer", width: "100%" };

  return (
    <div style={{ background: T.bg, color: T.text, padding: 16, borderRadius: 16, fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg, ${T.cyan}, #0077aa)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, color: "#000", fontFamily: "monospace" }}>S.ON</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: 1 }}>BREAKDOWN STUDIO</div>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: T.muted, letterSpacing: 2 }}>TRIM + FREEZE + ANÁLISE</div>
          </div>
        </div>
        {stage !== "upload" && (
          <button onClick={reset} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, fontFamily: "monospace", fontSize: 10, letterSpacing: 1, padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>NOVO</button>
        )}
      </div>

      {/* UPLOAD */}
      {stage === "upload" && (
        <div style={{ ...box, textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: T.cyan, letterSpacing: 3, marginBottom: 10 }}>REACT FORMAT</div>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.25, marginBottom: 10 }}>Seu vídeo vira<br />conteúdo de análise</div>
          <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 24 }}>Corte o vídeo → marque os momentos-chave →<br />o vídeo congela com análise completa →<br />grave a tela e poste como Reels</div>
          <label style={{ ...btn, display: "inline-block", width: "auto", padding: "14px 28px", cursor: "pointer" }}>
            🎬 Adicionar vídeo
            <input type="file" accept="video/*" style={{ display: "none" }} onChange={handleFile} />
          </label>
        </div>
      )}

      {stage === "upload" && sessions.length > 0 && (
        <div style={{ ...box, marginTop: 12, display: "grid", gap: 8 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: T.cyan, letterSpacing: 1 }}>ANÁLISES SALVAS</div>
          {sessions.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px" }}>
              <button onClick={() => openSession(s)} style={{ flex: 1, textAlign: "left", background: "none", border: "none", color: T.text, cursor: "pointer" }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{s.exercise || s.title}</div>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: T.muted, marginTop: 2 }}>
                  {s.analyses.length} momento(s) · {new Date(s.created_at).toLocaleDateString("pt-BR")}{s.video_path ? "" : " · sem vídeo"}
                </div>
              </button>
              <button onClick={() => removeSession(s)} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* TRIM */}
      {stage === "trim" && videoSrc && (
        <div style={{ ...box, display: "grid", gap: 10 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: T.cyan, letterSpacing: 1 }}>PASSO 1 — CORTAR VÍDEO</div>
          <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>Defina início e fim. Remova a preparação e o final — deixe só a execução.</p>
          <video ref={trimRef} src={videoSrc} controls playsInline style={{ width: "100%", borderRadius: 10, background: "#000", maxHeight: 380 }}
            onLoadedMetadata={() => { const d = trimRef.current?.duration || 0; setDuration(d); setTrim({ start: 0, end: d }); }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "monospace" }}>
            <span style={{ color: T.green }}>INÍCIO {trim.start.toFixed(1)}s</span>
            <span style={{ color: T.muted }}>Duração {(trim.end - trim.start).toFixed(1)}s</span>
            <span style={{ color: T.red }}>FIM {trim.end.toFixed(1)}s</span>
          </div>
          <div style={{ position: "relative", height: 8, background: T.s2, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: `${duration ? (trim.start / duration) * 100 : 0}%`, width: `${duration ? ((trim.end - trim.start) / duration) * 100 : 100}%`, top: 0, bottom: 0, background: `linear-gradient(90deg, ${T.green}, ${T.cyan})` }} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: T.muted }}>
            <span style={{ width: 46, fontFamily: "monospace" }}>INÍCIO</span>
            <input type="range" min={0} max={duration || 0} step={0.1} value={trim.start}
              onChange={(e) => { const v = parseFloat(e.target.value); setTrim((t) => ({ ...t, start: Math.min(v, t.end - 0.5) })); if (trimRef.current) trimRef.current.currentTime = v; }}
              style={{ flex: 1, accentColor: T.green }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: T.muted }}>
            <span style={{ width: 46, fontFamily: "monospace" }}>FIM</span>
            <input type="range" min={0} max={duration || 0} step={0.1} value={trim.end}
              onChange={(e) => { const v = parseFloat(e.target.value); setTrim((t) => ({ ...t, end: Math.max(v, t.start + 0.5) })); if (trimRef.current) trimRef.current.currentTime = v; }}
              style={{ flex: 1, accentColor: T.red }} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { if (trimRef.current) trimRef.current.currentTime = trim.start; }} style={{ flex: 1, padding: 10, background: T.s, border: `1px solid ${T.green}40`, color: T.green, fontSize: 11, fontWeight: 700, borderRadius: 6, cursor: "pointer" }}>▶ VER INÍCIO</button>
            <button onClick={() => { if (trimRef.current) trimRef.current.currentTime = Math.max(trim.end - 2, trim.start); }} style={{ flex: 1, padding: 10, background: T.s, border: `1px solid ${T.red}40`, color: T.red, fontSize: 11, fontWeight: 700, borderRadius: 6, cursor: "pointer" }}>▶ VER FINAL</button>
          </div>
          <button onClick={() => setStage("setpoints")} style={btn}>CONFIRMAR CORTE →</button>
        </div>
      )}

      {/* SET BREAKPOINTS */}
      {(stage === "setpoints" || stage === "loading") && videoSrc && (
        <div style={{ ...box, display: "grid", gap: 10 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: T.cyan, letterSpacing: 1 }}>PASSO 2 — MARCAR MOMENTOS</div>
          <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>Pause nas fases do exercício. Trecho: {trim.start.toFixed(1)}s → {trim.end.toFixed(1)}s</p>
          <video ref={videoRef} src={videoSrc} controls playsInline style={{ width: "100%", borderRadius: 10, background: "#000", maxHeight: 380 }}
            onLoadedMetadata={() => { if (videoRef.current) videoRef.current.currentTime = trim.start; }} />
          <button onClick={addBP} style={{ ...btn, background: T.s2, color: T.cyan, border: `1px solid ${T.cyan}55` }}>+ MARCAR MOMENTO ({breakpoints.length})</button>
          {breakpoints.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {breakpoints.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 8px" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: T.cyan, color: "#000", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: T.text }}>{t.toFixed(1)}s</span>
                  <button onClick={() => setBreakpoints((p) => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 14, padding: 0 }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: 11, color: T.muted, background: T.s2, borderRadius: 6, padding: "8px 10px", lineHeight: 1.5 }}>💡 Marque 2-4 momentos: fase excêntrica, ponto mais baixo, fase concêntrica, lockout.</div>
          {stage === "setpoints" && breakpoints.length > 0 && (
            <button onClick={analyzeAll} style={btn}>GERAR BREAKDOWN →</button>
          )}
          {stage === "loading" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: T.cyan, letterSpacing: 2 }}>Analisando frames...</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: "8px 0" }}>{Math.round(loadProg)}%</div>
              <div style={{ height: 6, background: T.s2, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${loadProg}%`, background: `linear-gradient(90deg, ${T.cyan}, ${T.gold})`, transition: "width 0.3s" }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* PLAYER */}
      {stage === "player" && videoSrc && (
        <div style={{ ...box, display: "grid", gap: 10 }}>
          <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", background: "#000" }}>
            <video ref={playerRef} src={videoSrc} playsInline style={{ width: "100%", display: "block", maxHeight: "70vh" }}
              onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
            {frozen && currentBreak >= 0 && analyses[currentBreak] && (
              <FreezeOverlay data={analyses[currentBreak]} onResume={resumePlay} />
            )}
            {!playing && !frozen && (
              <button onClick={startPlay} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(2,2,5,0.35)", border: "none", cursor: "pointer" }}>
                <span style={{ width: 64, height: 64, borderRadius: "50%", background: T.cyan, color: "#000", fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${T.cyan}80` }}>▶</span>
              </button>
            )}
            <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
              {breakpoints.map((_, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: currentBreak === i ? T.cyan : T.border, boxShadow: currentBreak === i ? `0 0 8px ${T.cyan}` : "none", transition: "all 0.3s" }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={startPlay} style={{ ...btn, width: "auto", flex: 1, background: T.s2, color: T.cyan, border: `1px solid ${T.cyan}55` }}>▶ PLAY DO INÍCIO</button>
            {frozen && (
              <button onClick={resumePlay} style={{ ...btn, width: "auto", flex: 1 }}>CONTINUAR ▶</button>
            )}
          </div>
          <button onClick={() => setStage("record")} style={{ ...btn, background: T.gold, color: "#000" }}>🎥 GRAVAR TELA PARA REELS</button>
          {saving && <div style={{ fontFamily: "monospace", fontSize: 9, color: T.muted, textAlign: "center" }}>SALVANDO ANÁLISE...</div>}
          <div style={{ fontSize: 11, color: T.muted, background: T.s2, borderRadius: 6, padding: "10px 12px", lineHeight: 1.6 }}>
            📱 Como postar: dê play → grave a tela do celular → o vídeo congela nos momentos marcados com a análise completa → corte o início da gravação → poste como Reels com a legenda do gerador de conteúdo.
          </div>
        </div>
      )}

      {stage === "record" && (
        <BreakdownRecorder onBack={() => setStage("player")} />
      )}
    </div>
  );
}
