import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const T = {
  bg: "#020205", s: "#0a0e18", s2: "#111827",
  cyan: "#00D4FF", gold: "#B8922A", green: "#00d4a1",
  red: "#ff4757", text: "#e8edf5", muted: "#6b7a94",
  border: "#1e2d45",
  font: "'Rajdhani', 'Segoe UI', sans-serif", mono: "'Space Mono', monospace",
};

type OverlayData = {
  exercicio: string;
  padrao: string;
  musculos_primarios?: string[];
  musculos_secundarios?: string[];
  zonas_ativas?: Record<string, boolean>;
  intensidade_ativacao?: Record<string, number>;
  cue_principal: string;
  cues_secundarios?: string[];
  angulacoes?: string[];
  fase_concentrica?: string;
  fase_excentrica?: string;
  alerta?: string;
  frase_impacto?: string;
};

const MUSCLE_POS: Record<string, { x: number; y: number; label: string }> = {
  peitoral_dir:  { x: 58, y: 26, label: "Peitoral D" },
  peitoral_esq:  { x: 42, y: 26, label: "Peitoral E" },
  deltoide_ant:  { x: 32, y: 20, label: "Deltóide Ant" },
  deltoide_lat:  { x: 28, y: 21, label: "Deltóide Lat" },
  deltoide_post: { x: 72, y: 21, label: "Deltóide Post" },
  biceps:        { x: 26, y: 33, label: "Bíceps" },
  triceps:       { x: 74, y: 33, label: "Tríceps" },
  antebraco:     { x: 22, y: 42, label: "Antebraço" },
  trapezio:      { x: 50, y: 15, label: "Trapézio" },
  dorsais:       { x: 65, y: 32, label: "Dorsais" },
  lombar:        { x: 50, y: 40, label: "Lombar" },
  abdomen:       { x: 50, y: 38, label: "Core" },
  obliquos:      { x: 38, y: 36, label: "Oblíquos" },
  gluteos:       { x: 50, y: 50, label: "Glúteos" },
  quadriceps:    { x: 42, y: 62, label: "Quadríceps" },
  isquiotibiais: { x: 58, y: 62, label: "Isquiotibiais" },
  panturrilha:   { x: 42, y: 78, label: "Panturrilha" },
  adutor:        { x: 50, y: 58, label: "Adutor" },
};

type Layers = { muscles: boolean; cues: boolean; angles: boolean; alert: boolean; grid: boolean };

function OverlayHUD({ data, playing, layers }: { data: OverlayData; playing: boolean; layers: Layers }) {
  const [phase, setPhase] = useState(0);
  const [pulseIdx, setPulseIdx] = useState(0);

  const activeMuscles = Object.entries(data.zonas_ativas || {}).filter(([, v]) => v).map(([k]) => k);

  useEffect(() => {
    const iv = setInterval(() => setPulseIdx((i) => (i + 1) % Math.max(activeMuscles.length, 1)), 800);
    return () => clearInterval(iv);
  }, [activeMuscles.length]);

  useEffect(() => {
    if (!playing) { setPhase(0); return; }
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [playing]);

  const getIntensityColor = (level: number) =>
    level === 3 ? T.cyan : level === 2 ? T.gold : level === 1 ? T.green : "transparent";

  const getIntensityGlow = (level: number) => {
    if (level === 3) return `0 0 12px ${T.cyan}80, 0 0 24px ${T.cyan}30`;
    if (level === 2) return `0 0 8px ${T.gold}60, 0 0 16px ${T.gold}20`;
    if (level === 1) return `0 0 6px ${T.green}40`;
    return "none";
  };

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: T.font }}>
      {layers.grid && (
        <div style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={`v${i}`} style={{ position: "absolute", left: `${i * 3.45}%`, top: 0, bottom: 0, width: 1, background: T.cyan }} />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`h${i}`} style={{ position: "absolute", top: `${i * 5.26}%`, left: 0, right: 0, height: 1, background: T.cyan }} />
          ))}
        </div>
      )}

      {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => (
        <div key={i} style={{
          position: "absolute", [x ? "right" : "left"]: 8, [y ? "bottom" : "top"]: 8,
          width: 20, height: 20,
          borderTop: y ? "none" : `2px solid ${T.cyan}`,
          borderBottom: y ? `2px solid ${T.cyan}` : "none",
          borderLeft: x ? "none" : `2px solid ${T.cyan}`,
          borderRight: x ? `2px solid ${T.cyan}` : "none",
          opacity: 0.7,
        }} />
      ))}

      {layers.cues && (
        <div style={{
          position: "absolute", top: 12, left: 12,
          opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "translateX(0)" : "translateX(-20px)",
          transition: "all 0.6s ease",
        }}>
          <div style={{ background: "rgba(2,2,5,0.85)", border: `1px solid ${T.cyan}40`, padding: "8px 12px", backdropFilter: "blur(4px)" }}>
            <div style={{ fontSize: 8, color: T.cyan, fontFamily: T.mono, letterSpacing: 2 }}>SOCIAL ON · ANÁLISE</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 2 }}>{data.exercicio}</div>
            <div style={{ marginTop: 4 }}>
              <span style={{ fontSize: 9, color: T.bg, background: T.cyan, padding: "2px 6px", fontWeight: 700, fontFamily: T.mono }}>{data.padrao}</span>
            </div>
          </div>
        </div>
      )}

      {layers.cues && (
        <div style={{
          position: "absolute", top: 12, right: 12, maxWidth: "45%",
          opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? "translateX(0)" : "translateX(20px)",
          transition: "all 0.6s ease",
        }}>
          <div style={{ background: "rgba(2,2,5,0.85)", border: `1px solid ${T.gold}40`, padding: "8px 12px", backdropFilter: "blur(4px)" }}>
            <div style={{ fontSize: 8, color: T.gold, fontFamily: T.mono, letterSpacing: 2 }}>🎯 CUE</div>
            <div style={{ fontSize: 12, color: T.text, marginTop: 2, lineHeight: 1.3 }}>{data.cue_principal}</div>
          </div>
        </div>
      )}

      {layers.muscles && phase >= 2 && activeMuscles.map((key, idx) => {
        const pos = MUSCLE_POS[key];
        if (!pos) return null;
        const intensity = data.intensidade_ativacao?.[key] || 1;
        const color = getIntensityColor(intensity);
        const isPulsing = idx === pulseIdx;
        const delay = idx * 150;
        return (
          <div key={key} style={{
            position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`,
            transform: "translate(-50%, -50%)",
            opacity: phase >= 3 ? 1 : 0,
            transition: `opacity 0.4s ease ${delay}ms`,
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: "50%",
              background: color, boxShadow: getIntensityGlow(intensity),
              animation: isPulsing ? "overlaypulse 0.8s ease" : "none",
            }} />
            {isPulsing && (
              <div style={{
                position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)",
                background: "rgba(2,2,5,0.9)", border: `1px solid ${color}60`,
                padding: "3px 8px", whiteSpace: "nowrap",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.text }}>{pos.label}</div>
                <div style={{ fontSize: 8, color, fontFamily: T.mono }}>
                  {intensity === 3 ? "PRIMÁRIO" : intensity === 2 ? "SECUNDÁRIO" : "ESTABILIZADOR"}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {layers.angles && phase >= 3 && (data.angulacoes || []).map((ang, i) => (
        <div key={i} style={{
          position: "absolute", left: 12, bottom: 60 + i * 26,
          opacity: phase >= 3 ? 0.9 : 0,
          transition: `opacity 0.5s ease ${i * 200}ms`,
        }}>
          <div style={{
            background: "rgba(2,2,5,0.8)", border: `1px solid ${T.border}`,
            borderLeft: `2px solid ${T.cyan}`, padding: "3px 8px",
            fontSize: 10, color: T.text, fontFamily: T.mono,
          }}>
            {ang}
          </div>
        </div>
      ))}

      {layers.alert && phase >= 4 && data.alerta && (
        <div style={{
          position: "absolute", bottom: 8, left: 12, right: 12,
          opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.5s ease",
        }}>
          <div style={{
            background: "rgba(2,2,5,0.9)", border: `1px solid ${T.red}50`,
            borderLeft: `3px solid ${T.red}`, padding: "6px 10px",
            display: "flex", gap: 8, alignItems: "center",
          }}>
            <span style={{ color: T.red, fontSize: 12 }}>⚠</span>
            <span style={{ fontSize: 10, color: T.text, lineHeight: 1.3 }}>{data.alerta}</span>
          </div>
        </div>
      )}

      {layers.cues && phase >= 4 && data.frase_impacto && (
        <div style={{
          position: "absolute", bottom: "28%", left: 0, right: 0, textAlign: "center",
          opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.8s ease",
        }}>
          <div style={{ display: "inline-block", background: "rgba(2,2,5,0.85)", padding: "10px 20px", border: `1px solid ${T.cyan}30` }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, maxWidth: 420, lineHeight: 1.3 }}>
              "{data.frase_impacto}"
            </div>
            <div style={{ fontSize: 9, color: T.muted, fontFamily: T.mono, marginTop: 4 }}>@diogo.mell0 · nutriON</div>
          </div>
        </div>
      )}

      {playing && (
        <div style={{
          position: "absolute", left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)`,
          animation: "overlayscan 4s linear infinite",
          opacity: 0.6,
        }} />
      )}

      <div style={{ position: "absolute", bottom: 8, right: 12, fontSize: 9, color: `${T.cyan}60`, fontFamily: T.mono, letterSpacing: 2 }}>
        nutriON
      </div>

      <style>{`
        @keyframes overlayscan {
          0% { top: -2px; }
          50% { top: calc(100% + 2px); }
          100% { top: -2px; }
        }
        @keyframes overlaypulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.6); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {[
        { color: T.cyan, label: "Primário" },
        { color: T.gold, label: "Secundário" },
        { color: T.green, label: "Estabilizador" },
      ].map((l) => (
        <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, boxShadow: `0 0 6px ${l.color}80` }} />
          <span style={{ fontSize: 10, color: T.muted, fontFamily: T.mono }}>{l.label}</span>
        </div>
      ))}
    </div>
  );
}

const LOAD_MSGS = [
  "Identificando exercício...", "Mapeando ativação muscular...",
  "Analisando biomecânica...", "Cruzando com protocolo APEX...",
  "Preparando overlay...",
];

export default function SocialOnOverlayStudio() {
  const [stage, setStage] = useState<"upload" | "loading" | "overlay">("upload");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [data, setData] = useState<OverlayData | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loadPhase, setLoadPhase] = useState(0);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayVideoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [layers, setLayers] = useState<Layers>({ muscles: true, cues: true, angles: true, alert: true, grid: true });

  useEffect(() => {
    if (stage !== "loading") return;
    let i = 0;
    const iv = setInterval(() => { i++; if (i < LOAD_MSGS.length) setLoadPhase(i); }, 2000);
    return () => clearInterval(iv);
  }, [stage]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoSrc(URL.createObjectURL(file));
    setError("");
  };

  const analyze = useCallback(async () => {
    const v = videoRef.current, cv = canvasRef.current;
    if (!v || !cv) return;
    cv.width = v.videoWidth; cv.height = v.videoHeight;
    cv.getContext("2d")?.drawImage(v, 0, 0);
    const b64 = cv.toDataURL("image/jpeg", 0.85);
    setStage("loading"); setLoadPhase(0); setError("");
    try {
      const { data: d, error: fnError } = await supabase.functions.invoke("social-on-generate", {
        body: { mode: "video_overlay", images: [b64] },
      });
      if (fnError) throw new Error(fnError.message);
      if (d?.error) throw new Error(d.error);
      const parsed = d?.result as OverlayData;
      if (!parsed || typeof parsed !== "object" || !parsed.exercicio) throw new Error("Resposta vazia");
      setData(parsed);
      setTimeout(() => setStage("overlay"), 800);
    } catch (err) {
      console.error("[OverlayStudio]", err);
      setError("Erro na análise. Tente um frame com melhor iluminação e o corpo inteiro visível.");
      setStage("upload");
    }
  }, []);

  const togglePlay = () => {
    const v = overlayVideoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const reset = () => { setStage("upload"); setData(null); setVideoSrc(null); setPlaying(false); };

  const card: React.CSSProperties = { background: T.s, border: `1px solid ${T.border}`, padding: 14 };

  return (
    <div style={{ background: T.bg, minHeight: "70vh", fontFamily: T.font, color: T.text, padding: "16px 0" }}>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, background: T.s, border: `1px solid ${T.cyan}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 900, color: T.cyan,
          }}>S.ON</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 1 }}>OVERLAY STUDIO</div>
            <div style={{ fontSize: 9, color: T.muted, fontFamily: T.mono, letterSpacing: 2 }}>ATIVAÇÕES MUSCULARES NO SEU VÍDEO</div>
          </div>
        </div>
        {stage === "overlay" && (
          <button onClick={reset} style={{
            padding: "4px 10px", fontSize: 9, background: T.s, border: `1px solid ${T.border}`,
            color: T.muted, cursor: "pointer", fontFamily: T.mono,
          }}>NOVO</button>
        )}
      </div>

      {/* UPLOAD */}
      {stage === "upload" && (
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          {!videoSrc ? (
            <div>
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 9, color: T.cyan, fontFamily: T.mono, letterSpacing: 3, marginBottom: 6 }}>OVERLAY STUDIO</div>
                <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.15 }}>Ativações musculares<br />no seu vídeo</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 8, lineHeight: 1.5, maxWidth: 380, margin: "8px auto 0" }}>
                  Suba seu vídeo de exercício. O sistema analisa e aplica overlay com ativações, cues técnicos e métricas em tempo real.
                </div>
              </div>

              <label style={{
                display: "block", border: `1px dashed ${T.cyan}50`, background: `${T.cyan}08`,
                padding: "28px 16px", textAlign: "center", cursor: "pointer",
              }}>
                <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleFile} style={{ display: "none" }} />
                <div style={{ fontSize: 26 }}>🎬</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>Adicionar vídeo</div>
                <div style={{ fontSize: 10, color: T.muted, fontFamily: T.mono, marginTop: 3 }}>MP4, MOV ou WebM</div>
              </label>

              <div style={{ ...card, marginTop: 14 }}>
                <div style={{ fontSize: 9, color: T.cyan, fontFamily: T.mono, letterSpacing: 2, marginBottom: 8 }}>O QUE APARECE NO VÍDEO</div>
                {["Ativações musculares pulsando", "Cue técnico principal", "Angulações articulares", "Alerta sem avaliação", "Frase de impacto", "Scanner grid", "Watermark nutriON"].map((f) => (
                  <div key={f} style={{ fontSize: 11, color: T.text, padding: "3px 0", borderBottom: `1px solid ${T.border}22` }}>· {f}</div>
                ))}
                <div style={{ fontSize: 10, color: T.gold, marginTop: 10, fontFamily: T.mono }}>
                  💡 Grave a tela com o vídeo rodando e poste como Reels
                </div>
              </div>

              {error && <div style={{ marginTop: 10, fontSize: 11, color: T.red, textAlign: "center" }}>{error}</div>}
            </div>
          ) : (
            <div>
              <div style={{ position: "relative", background: "#000" }}>
                <video
                  ref={videoRef} src={videoSrc} style={{ width: "100%", display: "block", maxHeight: 420 }}
                  onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                  onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)} controls
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 10, fontFamily: T.mono, color: T.muted }}>
                <span>{currentTime.toFixed(1)}s</span>
                <input
                  type="range" min={0} max={duration || 0} step={0.1} value={currentTime}
                  onChange={(e) => { if (videoRef.current) videoRef.current.currentTime = parseFloat(e.target.value); }}
                  style={{ flex: 1, accentColor: T.cyan }}
                />
                <span>{duration.toFixed(1)}s</span>
              </div>
              <div style={{ fontSize: 10, color: T.gold, fontFamily: T.mono, marginTop: 8, textAlign: "center" }}>
                💡 Pause no ponto de maior amplitude do movimento
              </div>
              <button onClick={analyze} style={{
                width: "100%", marginTop: 12, padding: "14px 0", fontSize: 14, fontWeight: 800,
                background: T.cyan, color: T.bg, border: "none", cursor: "pointer",
                fontFamily: T.font, letterSpacing: 2,
              }}>
                GERAR OVERLAY
              </button>
              {error && <div style={{ marginTop: 10, fontSize: 11, color: T.red, textAlign: "center" }}>{error}</div>}
            </div>
          )}
        </div>
      )}

      {/* LOADING */}
      {stage === "loading" && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{
            width: 46, height: 46, margin: "0 auto 16px", borderRadius: "50%",
            border: `3px solid ${T.border}`, borderTopColor: T.cyan,
            animation: "spin 0.9s linear infinite",
          }} />
          <div style={{ fontSize: 13, fontWeight: 700 }}>{LOAD_MSGS[loadPhase]}</div>
          <div style={{ fontSize: 10, color: T.muted, fontFamily: T.mono, marginTop: 6 }}>analisando o frame real do seu vídeo</div>
        </div>
      )}

      {/* OVERLAY MODE */}
      {stage === "overlay" && data && (
        <div>
          <div style={{ position: "relative", background: "#000", maxWidth: 480, margin: "0 auto" }}>
            <video
              ref={overlayVideoRef} src={videoSrc!} style={{ width: "100%", display: "block" }}
              loop playsInline
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onClick={togglePlay}
            />
            <OverlayHUD data={data} playing={playing} layers={layers} />
            {!playing && (
              <div
                onClick={togglePlay}
                style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(2,2,5,0.35)", cursor: "pointer",
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", background: `${T.cyan}dd`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, color: T.bg,
                }}>▶</div>
              </div>
            )}
          </div>

          <div style={{ maxWidth: 480, margin: "12px auto 0" }}>
            <div style={{ fontSize: 9, color: T.muted, fontFamily: T.mono, letterSpacing: 2, marginBottom: 6 }}>CAMADAS DO OVERLAY</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {([
                { key: "muscles", label: "Músculos", icon: "💪" },
                { key: "cues", label: "Cues", icon: "🎯" },
                { key: "angles", label: "Ângulos", icon: "📐" },
                { key: "alert", label: "Alerta", icon: "⚠️" },
                { key: "grid", label: "Grid", icon: "📊" },
              ] as const).map((l) => (
                <button
                  key={l.key}
                  onClick={() => setLayers((p) => ({ ...p, [l.key]: !p[l.key] }))}
                  style={{
                    padding: "6px 10px", fontSize: 10, cursor: "pointer",
                    background: layers[l.key] ? `${T.cyan}15` : T.s,
                    border: `1px solid ${layers[l.key] ? T.cyan : T.border}`,
                    color: layers[l.key] ? T.cyan : T.muted, fontFamily: T.font, fontWeight: 700,
                  }}
                >
                  {l.icon} {l.label}
                </button>
              ))}
            </div>

            <Legend />

            <div style={{ ...card, marginTop: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{data.exercicio}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                <span style={{ fontSize: 9, color: T.bg, background: T.cyan, padding: "2px 6px", fontWeight: 700, fontFamily: T.mono }}>{data.padrao}</span>
                {(data.musculos_primarios || []).map((m) => (
                  <span key={m} style={{ fontSize: 9, color: T.cyan, border: `1px solid ${T.cyan}40`, padding: "2px 6px", fontFamily: T.mono }}>{m}</span>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: T.gold, lineHeight: 1.4 }}>🎯 {data.cue_principal}</div>
              {(data.cues_secundarios || []).map((c, i) => (
                <div key={i} style={{ fontSize: 11, color: T.text, marginTop: 4, opacity: 0.85 }}>• {c}</div>
              ))}
              {(data.fase_concentrica || data.fase_excentrica) && (
                <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                  {data.fase_concentrica && (
                    <div style={{ fontSize: 10, color: T.muted }}>
                      <span style={{ color: T.cyan, fontFamily: T.mono }}>CONCÊNTRICA: </span>{data.fase_concentrica}
                    </div>
                  )}
                  {data.fase_excentrica && (
                    <div style={{ fontSize: 10, color: T.muted }}>
                      <span style={{ color: T.gold, fontFamily: T.mono }}>EXCÊNTRICA: </span>{data.fase_excentrica}
                    </div>
                  )}
                </div>
              )}
              {data.frase_impacto && (
                <button
                  onClick={() => { navigator.clipboard.writeText(data.frase_impacto || ""); toast.success("Frase copiada"); }}
                  style={{
                    marginTop: 10, width: "100%", padding: "8px 10px", background: "transparent",
                    border: `1px dashed ${T.cyan}40`, color: T.text, fontSize: 11, cursor: "pointer",
                    fontFamily: T.font, textAlign: "left",
                  }}
                >
                  "{data.frase_impacto}" <span style={{ color: T.cyan, fontSize: 9, fontFamily: T.mono }}>· COPIAR</span>
                </button>
              )}
            </div>

            <div style={{ ...card, marginTop: 12 }}>
              <div style={{ fontSize: 9, color: T.cyan, fontFamily: T.mono, letterSpacing: 2, marginBottom: 8 }}>COMO USAR PRO INSTAGRAM</div>
              <div style={{ fontSize: 11, color: T.text, lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {`1. Dê play no vídeo acima
2. Grave a tela do celular (screen recording)
3. O overlay com ativações, cues e métricas aparece automaticamente
4. Poste como Reels com a legenda gerada no SOCIAL ON
5. Use a frase de impacto como texto na tela`}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 8, color: T.muted, fontFamily: T.mono, letterSpacing: 2 }}>
        <span>SOCIAL ON · OVERLAY STUDIO · nutriON</span>
        <span>@diogo.mell0</span>
      </div>
    </div>
  );
}
