import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/* Breakdown Studio — o vídeo roda, congela nos momentos marcados,
   mostra a análise animada (mapa muscular + MCE) e volta sozinho. */

const T = {
  bg: "#020205",
  s: "#0a0e18",
  s2: "#111827",
  cyan: "#00D4FF",
  gold: "#B8922A",
  green: "#00d4a1",
  red: "#ff4757",
  text: "#e8edf5",
  muted: "#6b7a94",
  border: "#1e2d45",
};
const fontTitle = "'Rajdhani', 'Segoe UI', sans-serif";
const fontMono = "'Space Mono', 'Courier New', monospace";

type MuscleKey =
  | "peitoral" | "deltoide" | "biceps" | "triceps" | "trapezio" | "dorsais" | "abdomen"
  | "obliquos" | "lombar" | "gluteos" | "quadriceps" | "isquiotibiais" | "panturrilha" | "adutor";

export type BreakdownAnalysis = {
  exercicio?: string;
  padrao?: string;
  musculos_primarios?: string[];
  musculos_secundarios?: string[];
  execucao?: { titulo?: string; descricao?: string; cue?: string; erro_comum?: string };
  musculos_ativos?: Partial<Record<MuscleKey, number>>;
  mce?: { mentalidade?: string; comportamento?: string; execucao_mce?: string };
  alerta_apex?: string;
  frase_impacto?: string;
};

const NAMES: Record<string, string> = {
  peitoral: "Peitoral", deltoide: "Deltóide", biceps: "Bíceps", triceps: "Tríceps",
  trapezio: "Trapézio", dorsais: "Dorsais", abdomen: "Core", obliquos: "Oblíquos",
  lombar: "Lombar", gluteos: "Glúteos", quadriceps: "Quadríceps",
  isquiotibiais: "Isquiotibiais", panturrilha: "Panturrilha", adutor: "Adutor",
};

const ZONES: { id: MuscleKey; path: string; label: string; lx: number; ly: number }[] = [
  { id: "trapezio", path: "M42,18 Q50,14 58,18 L56,22 Q50,20 44,22 Z", label: "Trapézio", lx: 50, ly: 12 },
  { id: "deltoide", path: "M34,20 L38,18 L40,24 L36,26 Z M60,24 L62,18 L66,20 L64,26 Z", label: "Deltóides", lx: 24, ly: 22 },
  { id: "peitoral", path: "M41,24 L50,22 L59,24 L58,32 Q50,34 42,32 Z", label: "Peitoral", lx: 50, ly: 28 },
  { id: "biceps", path: "M34,27 L37,26 L38,36 L35,36 Z", label: "Bíceps", lx: 20, ly: 32 },
  { id: "triceps", path: "M62,26 L66,27 L65,36 L62,36 Z", label: "Tríceps", lx: 80, ly: 32 },
  { id: "abdomen", path: "M44,33 L56,33 L55,44 L45,44 Z", label: "Core", lx: 50, ly: 38 },
  { id: "obliquos", path: "M40,33 L44,33 L44,42 L40,40 Z M56,33 L60,33 L60,40 L56,42 Z", label: "Oblíquos", lx: 22, ly: 42 },
  { id: "dorsais", path: "M38,26 L42,28 L42,36 L38,34 Z M58,28 L62,26 L62,34 L58,36 Z", label: "Dorsais", lx: 80, ly: 24 },
  { id: "lombar", path: "M44,40 L56,40 L56,46 L44,46 Z", label: "Lombar", lx: 80, ly: 44 },
  { id: "gluteos", path: "M42,46 L58,46 L60,54 L40,54 Z", label: "Glúteos", lx: 20, ly: 52 },
  { id: "quadriceps", path: "M41,54 L49,54 L48,70 L42,70 Z M51,54 L59,54 L58,70 L52,70 Z", label: "Quadríceps", lx: 20, ly: 64 },
  { id: "isquiotibiais", path: "M42,56 L48,56 L48,68 L43,68 Z M52,56 L58,56 L57,68 L52,68 Z", label: "Isquiotibiais", lx: 80, ly: 64 },
  { id: "panturrilha", path: "M43,72 L48,72 L47,84 L44,84 Z M52,72 L57,72 L56,84 L53,84 Z", label: "Panturrilha", lx: 20, ly: 82 },
  { id: "adutor", path: "M48,56 L52,56 L51,66 L49,66 Z", label: "Adutor", lx: 80, ly: 56 },
];

const colorFor = (lv: number) => (lv === 3 ? T.cyan : lv === 2 ? T.gold : lv === 1 ? T.green : "transparent");

function BodyMap({ musculos }: { musculos?: Partial<Record<MuscleKey, number>> }) {
  return (
    <svg viewBox="0 0 100 92" style={{ width: "100%", maxWidth: 210, display: "block", margin: "0 auto" }}>
      <g stroke={T.border} strokeWidth={0.7} fill="none">
        <ellipse cx={50} cy={9} rx={5} ry={6} />
        <path d="M44,15 L56,15 L60,24 L60,46 L56,54 L44,54 L40,46 L40,24 Z" />
        <path d="M40,24 L34,26 L33,40 L36,40 L38,28" />
        <path d="M60,24 L66,26 L67,40 L64,40 L62,28" />
        <path d="M44,54 L42,72 L43,86 L48,86 L49,72 L50,56" />
        <path d="M56,54 L58,72 L57,86 L52,86 L51,72 L50,56" />
      </g>
      {ZONES.map((z) => {
        const lv = musculos?.[z.id] || 0;
        if (!lv) return null;
        const c = colorFor(lv);
        return (
          <path
            key={z.id}
            d={z.path}
            fill={c}
            opacity={lv === 3 ? 0.75 : lv === 2 ? 0.5 : 0.3}
            stroke={c}
            strokeWidth={0.4}
            style={{ animation: lv === 3 ? "bdPulse 1.6s ease-in-out infinite" : undefined }}
          />
        );
      })}
      {ZONES.map((z) => {
        const lv = musculos?.[z.id] || 0;
        if (lv < 2) return null;
        const c = colorFor(lv);
        return (
          <text key={`l-${z.id}`} x={z.lx} y={z.ly} fill={c} fontSize={3} fontFamily={fontMono} textAnchor="middle">
            {z.label.toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}

function MceRow({ icon, label, text, color }: { icon: string; label: string; text?: string; color: string }) {
  if (!text) return null;
  return (
    <div style={{ display: "flex", gap: 10, background: "#ffffff06", border: `1px solid ${color}30`, borderRadius: 8, padding: 10 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: fontMono, fontSize: 9, letterSpacing: 1.5, color }}>{label}</span>
        <span style={{ display: "block", fontFamily: fontTitle, fontSize: 14, color: T.text, marginTop: 2 }}>{text}</span>
      </span>
    </div>
  );
}

function BreakdownOverlay({ data, onResume }: { data: BreakdownAnalysis; onResume: () => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    setP(0);
    const t = [
      window.setTimeout(() => setP(1), 300),
      window.setTimeout(() => setP(2), 1500),
      window.setTimeout(() => setP(3), 3500),
      window.setTimeout(() => setP(4), 5500),
      window.setTimeout(() => onResume(), 9000),
    ];
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const ativos = Object.entries(data.musculos_ativos || {})
    .filter(([, v]) => Number(v) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(2,2,5,0.94), rgba(2,2,5,0.88))",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        padding: 12,
        gap: 10,
      }}
    >
      <style>{`@keyframes bdPulse{0%,100%{opacity:.45}50%{opacity:.9}}`}</style>

      <div style={{ opacity: p >= 1 ? 1 : 0, transition: "opacity .4s" }}>
        <p style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: 2, color: T.cyan, margin: 0 }}>
          SOCIAL ON · BREAKDOWN
        </p>
        <p style={{ fontFamily: fontTitle, fontSize: 22, fontWeight: 700, color: T.text, margin: 0, lineHeight: 1.1 }}>
          {(data.exercicio || "").toUpperCase()}
        </p>
        {data.padrao && (
          <span style={{ fontFamily: fontMono, fontSize: 9, color: T.gold, border: `1px solid ${T.gold}50`, padding: "1px 6px" }}>
            {data.padrao.toUpperCase()}
          </span>
        )}
      </div>

      <div
        style={{
          opacity: p >= 1 ? 1 : 0,
          transform: p >= 1 ? "translateX(0)" : "translateX(-20px)",
          transition: "all .5s",
          background: T.s,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 12,
        }}
      >
        <p style={{ fontFamily: fontTitle, fontSize: 16, fontWeight: 700, color: T.cyan, margin: 0 }}>
          {data.execucao?.titulo}
        </p>
        <p style={{ fontFamily: fontTitle, fontSize: 14, color: T.text, margin: "6px 0 0", lineHeight: 1.35 }}>
          {data.execucao?.descricao}
        </p>
        {data.execucao?.cue && (
          <div style={{ marginTop: 8, background: `${T.cyan}12`, border: `1px solid ${T.cyan}40`, borderRadius: 8, padding: 8 }}>
            <p style={{ fontFamily: fontMono, fontSize: 8, letterSpacing: 1.5, color: T.cyan, margin: 0 }}>CUE PRINCIPAL</p>
            <p style={{ fontFamily: fontTitle, fontSize: 15, fontWeight: 700, color: T.text, margin: "2px 0 0" }}>
              {data.execucao.cue}
            </p>
          </div>
        )}
        {data.execucao?.erro_comum && (
          <p style={{ fontFamily: fontTitle, fontSize: 13, color: T.text, margin: "8px 0 0" }}>
            <span style={{ fontFamily: fontMono, fontSize: 8, color: T.red, border: `1px solid ${T.red}50`, padding: "1px 5px", marginRight: 6 }}>
              ERRO
            </span>
            {data.execucao.erro_comum}
          </p>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          opacity: p >= 2 ? 1 : 0,
          transform: p >= 2 ? "translateY(0)" : "translateY(16px)",
          transition: "all .5s",
        }}
      >
        <div style={{ background: T.s, border: `1px solid ${T.border}`, borderRadius: 10, padding: 10 }}>
          <p style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: 1.5, color: T.muted, margin: "0 0 6px" }}>MAPA MUSCULAR</p>
          <BodyMap musculos={data.musculos_ativos} />
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 6 }}>
            {[{ c: T.cyan, l: "PRI" }, { c: T.gold, l: "SEC" }, { c: T.green, l: "EST" }].map((x) => (
              <span key={x.l} style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: fontMono, fontSize: 8, color: T.muted }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: x.c }} />
                {x.l}
              </span>
            ))}
          </div>
        </div>
        <div style={{ background: T.s, border: `1px solid ${T.border}`, borderRadius: 10, padding: 10 }}>
          <p style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: 1.5, color: T.muted, margin: "0 0 6px" }}>ATIVAÇÃO</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {ativos.map(([key, lv], i) => {
              const c = colorFor(Number(lv));
              const label = Number(lv) === 3 ? "PRIMÁRIO" : Number(lv) === 2 ? "SECUNDÁRIO" : "ESTABILIZADOR";
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    opacity: p >= 2 ? 1 : 0,
                    transition: `all .3s ease ${i * 0.07}s`,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontFamily: fontTitle, fontSize: 13, color: T.text }}>{NAMES[key] || key}</span>
                  <span style={{ fontFamily: fontMono, fontSize: 8, color: c }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ opacity: p >= 3 ? 1 : 0, transition: "opacity .5s", display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: 2, color: T.gold, margin: 0 }}>MÉTODO MCE</p>
        <MceRow icon="🧠" label="MENTALIDADE" text={data.mce?.mentalidade} color={T.cyan} />
        <MceRow icon="⚡" label="COMPORTAMENTO" text={data.mce?.comportamento} color={T.gold} />
        <MceRow icon="🎯" label="EXECUÇÃO" text={data.mce?.execucao_mce} color={T.green} />
      </div>

      <div style={{ opacity: p >= 4 ? 1 : 0, transition: "opacity .5s", marginTop: "auto" }}>
        {data.alerta_apex && (
          <div style={{ background: `${T.red}12`, border: `1px solid ${T.red}40`, borderRadius: 8, padding: 8, marginBottom: 8 }}>
            <p style={{ fontFamily: fontMono, fontSize: 8, letterSpacing: 1.5, color: T.red, margin: 0 }}>
              ⚠ AVALIAÇÃO POSTURAL PRÉVIA
            </p>
            <p style={{ fontFamily: fontTitle, fontSize: 13, color: T.text, margin: "2px 0 0" }}>{data.alerta_apex}</p>
          </div>
        )}
        <p style={{ fontFamily: fontTitle, fontSize: 18, fontWeight: 700, color: T.text, margin: 0, textAlign: "center" }}>
          "{data.frase_impacto}"
        </p>
        <p style={{ fontFamily: fontMono, fontSize: 9, color: T.muted, textAlign: "center", margin: "4px 0 0" }}>
          @diogo.mell0 · nutriON · Método MCE
        </p>
      </div>
    </div>
  );
}

export default function SocialOnBreakdownStudio({ handle }: { handle?: string }) {
  const [stage, setStage] = useState<"upload" | "setpoints" | "loading" | "player">("upload");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const [analyses, setAnalyses] = useState<(BreakdownAnalysis | null)[]>([]);
  const [currentBreak, setCurrentBreak] = useState(-1);
  const [frozen, setFrozen] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLVideoElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 150 * 1024 * 1024) {
      toast({ title: "Vídeo muito grande", description: "Máximo 150MB.", variant: "destructive" });
      return;
    }
    setVideoSrc(URL.createObjectURL(f));
    setBreakpoints([]);
    setAnalyses([]);
    setStage("setpoints");
  };

  const addBreakpoint = () => {
    const t = videoRef.current?.currentTime || 0;
    setBreakpoints((prev) => (prev.some((x) => Math.abs(x - t) < 0.05) ? prev : [...prev, t].sort((a, b) => a - b)));
  };

  const removeBreakpoint = (idx: number) => setBreakpoints((prev) => prev.filter((_, i) => i !== idx));

  const analyzeAll = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !breakpoints.length) return;
    setStage("loading");
    setProgress(0);
    const results: (BreakdownAnalysis | null)[] = [];
    const cv = document.createElement("canvas");

    for (let i = 0; i < breakpoints.length; i++) {
      setProgress(Math.round((i / breakpoints.length) * 100));
      video.currentTime = breakpoints[i];
      await new Promise<void>((r) => {
        const done = () => { video.removeEventListener("seeked", done); r(); };
        video.addEventListener("seeked", done);
        window.setTimeout(done, 2500);
      });
      await new Promise((r) => window.setTimeout(r, 150));
      cv.width = video.videoWidth || 720;
      cv.height = video.videoHeight || 1280;
      cv.getContext("2d")?.drawImage(video, 0, 0, cv.width, cv.height);
      const dataUrl = cv.toDataURL("image/jpeg", 0.8);

      try {
        const { data: res, error } = await supabase.functions.invoke("social-on-generate", {
          body: { mode: "video_breakdown", images: [dataUrl], handle },
        });
        if (error) throw error;
        results.push((res?.result as BreakdownAnalysis) ?? null);
      } catch (err) {
        console.error("[Breakdown] falha no momento", i, err);
        results.push(null);
      }
      setProgress(Math.round(((i + 1) / breakpoints.length) * 100));
    }

    setAnalyses(results);
    if (results.every((r) => !r)) {
      toast({ title: "Não deu pra analisar", description: "Tente outro vídeo ou outros momentos.", variant: "destructive" });
      setStage("setpoints");
      return;
    }
    setStage("player");
    setCurrentBreak(-1);
    setFrozen(false);
  }, [breakpoints, handle]);

  // Pausa automática nos momentos marcados
  useEffect(() => {
    if (stage !== "player") return;
    const iv = window.setInterval(() => {
      const v = playerRef.current;
      if (!v || frozen || v.paused) return;
      const t = v.currentTime;
      for (let i = 0; i < breakpoints.length; i++) {
        if (i > currentBreak && t >= breakpoints[i] && t - breakpoints[i] < 0.6 && analyses[i]) {
          v.pause();
          setCurrentBreak(i);
          setFrozen(true);
          return;
        }
      }
    }, 60);
    return () => clearInterval(iv);
  }, [stage, breakpoints, frozen, currentBreak, analyses]);

  const resume = () => {
    const v = playerRef.current;
    setFrozen(false);
    if (v) {
      v.currentTime = Math.min((breakpoints[currentBreak] ?? 0) + 0.3, v.duration || 0);
      void v.play();
    }
  };

  const restart = () => {
    const v = playerRef.current;
    setFrozen(false);
    setCurrentBreak(-1);
    if (v) {
      v.currentTime = 0;
      void v.play();
    }
  };

  return (
    <div style={{ background: T.bg, borderRadius: 12, padding: 16, color: T.text }}>
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: 2, color: T.cyan, margin: 0 }}>SOCIAL ON</p>
        <p style={{ fontFamily: fontTitle, fontSize: 22, fontWeight: 700, margin: 0 }}>BREAKDOWN STUDIO</p>
        <p style={{ fontFamily: fontMono, fontSize: 10, color: T.muted, margin: "2px 0 0" }}>
          O vídeo roda → congela nos momentos-chave → ativações e MCE aparecem → volta sozinho
        </p>
      </div>

      {stage === "upload" && (
        <label
          style={{
            display: "block",
            border: `1px dashed ${T.border}`,
            borderRadius: 12,
            padding: 32,
            textAlign: "center",
            cursor: "pointer",
            background: T.s,
          }}
        >
          <input type="file" accept="video/*" onChange={handleFile} style={{ display: "none" }} />
          <span style={{ fontSize: 32, display: "block" }}>🎬</span>
          <span style={{ display: "block", fontFamily: fontTitle, fontSize: 18, fontWeight: 700, marginTop: 8 }}>
            Adicionar vídeo
          </span>
          <span style={{ display: "block", fontFamily: fontMono, fontSize: 10, color: T.muted, marginTop: 4 }}>
            MP4, MOV ou WebM até 150MB
          </span>
        </label>
      )}

      {stage !== "upload" && videoSrc && (
        <div style={{ display: stage === "setpoints" ? "block" : "none" }}>
          <p style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: 2, color: T.gold, margin: "0 0 4px" }}>PASSO 1</p>
          <p style={{ fontFamily: fontTitle, fontSize: 18, fontWeight: 700, margin: 0 }}>Marque os momentos-chave</p>
          <p style={{ fontFamily: fontMono, fontSize: 10, color: T.muted, margin: "2px 0 10px" }}>
            Pause nas fases importantes e toque em "Marcar". 2 a 4 momentos é o ideal.
          </p>
          <video ref={videoRef} src={videoSrc} controls playsInline style={{ width: "100%", borderRadius: 10, background: "#000" }} />
          <button
            type="button"
            onClick={addBreakpoint}
            style={{
              width: "100%",
              marginTop: 10,
              background: `${T.cyan}15`,
              border: `1px solid ${T.cyan}50`,
              color: T.cyan,
              borderRadius: 10,
              padding: "12px 0",
              fontFamily: fontTitle,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + MARCAR ESTE MOMENTO
          </button>

          {breakpoints.length > 0 && (
            <div style={{ marginTop: 12, background: T.s, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12 }}>
              <p style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: 1.5, color: T.muted, margin: "0 0 8px" }}>
                MOMENTOS MARCADOS ({breakpoints.length})
              </p>
              {breakpoints.map((t, i) => (
                <div key={`${t}-${i}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                  <span style={{ fontFamily: fontMono, fontSize: 10, color: T.cyan }}>{i + 1}</span>
                  <span style={{ flex: 1, fontFamily: fontTitle, fontSize: 14 }}>{t.toFixed(1)}s</span>
                  <button
                    type="button"
                    onClick={() => removeBreakpoint(i)}
                    style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 14 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={analyzeAll}
                style={{
                  width: "100%",
                  marginTop: 8,
                  background: T.cyan,
                  border: "none",
                  color: T.bg,
                  borderRadius: 10,
                  padding: "12px 0",
                  fontFamily: fontTitle,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                GERAR BREAKDOWN ({breakpoints.length} MOMENTOS)
              </button>
            </div>
          )}
        </div>
      )}

      {stage === "loading" && (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <p style={{ fontFamily: fontTitle, fontSize: 18, fontWeight: 700, margin: 0 }}>Analisando momentos-chave…</p>
          <p style={{ fontFamily: fontMono, fontSize: 10, color: T.muted, margin: "4px 0 12px" }}>
            {progress}% — cada momento recebe análise própria
          </p>
          <div style={{ height: 6, background: T.s2, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: T.cyan, transition: "width .3s" }} />
          </div>
        </div>
      )}

      {stage === "player" && videoSrc && (
        <div>
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#000" }}>
            <video ref={playerRef} src={videoSrc} playsInline controls={!frozen} style={{ width: "100%", display: "block" }} />
            {frozen && currentBreak >= 0 && analyses[currentBreak] && (
              <BreakdownOverlay data={analyses[currentBreak] as BreakdownAnalysis} onResume={resume} />
            )}
            <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
              {breakpoints.map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: currentBreak >= i ? T.cyan : T.border,
                    boxShadow: currentBreak === i ? `0 0 8px ${T.cyan}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              type="button"
              onClick={restart}
              style={{
                flex: 1,
                background: T.cyan,
                border: "none",
                color: T.bg,
                borderRadius: 10,
                padding: "12px 0",
                fontFamily: fontTitle,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ▶ PLAY DO INÍCIO
            </button>
            {frozen && (
              <button
                type="button"
                onClick={resume}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: `1px solid ${T.cyan}50`,
                  color: T.cyan,
                  borderRadius: 10,
                  padding: "12px 0",
                  fontFamily: fontTitle,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                CONTINUAR ▶
              </button>
            )}
          </div>

          <div style={{ marginTop: 12, background: T.s, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12 }}>
            <p style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: 1.5, color: T.gold, margin: "0 0 6px" }}>COMO POSTAR</p>
            <p style={{ fontFamily: fontTitle, fontSize: 13, color: T.text, margin: 0, whiteSpace: "pre-line", lineHeight: 1.5 }}>
              {"1. Toque \"PLAY DO INÍCIO\"\n2. Grave a tela do celular\n3. O vídeo roda, congela, mostra a análise e volta sozinho\n4. Poste a gravação como Reels\n5. Use as legendas do Social ON"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => { setStage("setpoints"); setFrozen(false); setCurrentBreak(-1); }}
            style={{
              marginTop: 10,
              background: "transparent",
              border: `1px solid ${T.border}`,
              color: T.muted,
              borderRadius: 10,
              padding: "10px 16px",
              fontFamily: fontMono,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            ← Ajustar momentos
          </button>
        </div>
      )}
    </div>
  );
}
