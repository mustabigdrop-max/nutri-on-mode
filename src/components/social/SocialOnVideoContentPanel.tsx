import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// SOCIAL ON — Vídeo → Conteúdo: o coach envia um vídeo de exercício,
// pausa no frame ideal e o sistema devolve análise de execução + conteúdo
// pronto (Reels, feed, B2B) na linguagem APEX / TrainingON / MCE.
// A análise roda na edge function social-on-generate (modo video_content),
// que recebe o frame real em base64 — nenhuma chave de API no navegador.

const T = {
  bg: "#020205", s: "#0a0e18", s2: "#111827", s3: "#1a2840",
  cyan: "#00D4FF", gold: "#B8922A", green: "#00d4a1",
  red: "#ff4757", text: "#e8edf5", muted: "#6b7a94",
  border: "#1e2d45", purple: "#a855f7",
  font: "'Rajdhani', sans-serif", mono: "'Space Mono', monospace",
};

type VideoContentResult = {
  exercicio?: string;
  padrao_movimento?: string;
  musculos_primarios?: string[];
  musculos_secundarios?: string[];
  zonas_corporais_ativas?: string[];
  metricas?: {
    complexidade?: number;
    risco_sem_avaliacao?: number;
    impacto_assimetria?: number;
    necessidade_correcao?: number;
  };
  analise_execucao?: {
    pontos_positivos?: string[];
    pontos_atencao?: string[];
    cue_principal?: string;
    angulacoes_chave?: string[];
  };
  conteudo?: {
    hook_reels?: string;
    roteiro_reels?: string;
    caption_educativa?: string;
    caption_post?: string;
    caption_profissional?: string;
    carrossel_slides?: string[];
    hashtags?: string[];
  };
  apex_insight?: string;
  mce_insight?: string;
  conexao_apex?: string;
  conexao_mce?: string;
  frase_impacto?: string;
};

const Chip = ({ children, color = T.cyan }: { children: React.ReactNode; color?: string }) => (
  <span style={{
    display: "inline-block", padding: "2px 10px", fontSize: 11, fontWeight: 700,
    border: `1px solid ${color}55`, color, borderRadius: 3, fontFamily: T.mono,
    background: `${color}11`, marginRight: 6, marginBottom: 6,
  }}>
    {children}
  </span>
);

// Silhueta corporal com as zonas musculares ativadas brilhando em cyan
function MuscleMap({ activeZones = [], size = 180 }: { activeZones?: string[]; size?: number }) {
  const zones: Record<string, { cx: number; cy: number; r: number }> = {
    upper_chest:  { cx: 50, cy: 26, r: 8 },
    lower_chest:  { cx: 50, cy: 33, r: 7 },
    front_delt:   { cx: 35, cy: 20, r: 5 },
    side_delt:    { cx: 30, cy: 20, r: 5 },
    rear_delt:    { cx: 33, cy: 22, r: 4 },
    biceps:       { cx: 28, cy: 34, r: 5 },
    triceps:      { cx: 72, cy: 34, r: 5 },
    forearms:     { cx: 25, cy: 44, r: 4 },
    upper_back:   { cx: 50, cy: 22, r: 9 },
    lats:         { cx: 42, cy: 32, r: 8 },
    lower_back:   { cx: 50, cy: 40, r: 6 },
    core:         { cx: 50, cy: 42, r: 8 },
    glutes:       { cx: 50, cy: 52, r: 9 },
    quads:        { cx: 42, cy: 64, r: 8 },
    hamstrings:   { cx: 58, cy: 64, r: 7 },
    calves:       { cx: 42, cy: 80, r: 5 },
  };

  return (
    <svg viewBox="0 0 100 95" width={size} height={size * 0.95} style={{ display: "block" }}>
      <ellipse cx="50" cy="10" rx="7" ry="7" fill={T.s2} stroke={T.border} strokeWidth="0.4" />
      <path d="M38 17 Q35 17 32 20 L26 35 Q24 40 26 45 L28 50" fill={T.s2} stroke={T.border} strokeWidth="0.4" />
      <path d="M62 17 Q65 17 68 20 L74 35 Q76 40 74 45 L72 50" fill={T.s2} stroke={T.border} strokeWidth="0.4" />
      <rect x="38" y="17" width="24" height="32" rx="4" fill={T.s2} stroke={T.border} strokeWidth="0.4" />
      <rect x="38" y="49" width="10" height="35" rx="3" fill={T.s2} stroke={T.border} strokeWidth="0.4" />
      <rect x="52" y="49" width="10" height="35" rx="3" fill={T.s2} stroke={T.border} strokeWidth="0.4" />
      {Object.entries(zones).map(([key, z]) => {
        if (!activeZones.includes(key)) return null;
        return (
          <g key={key}>
            <circle cx={z.cx} cy={z.cy} r={z.r + 2} fill={`${T.cyan}15`} style={{ animation: "zonePulse 2s ease-in-out infinite" }} />
            <circle cx={z.cx} cy={z.cy} r={z.r} fill={`${T.cyan}35`} stroke={T.cyan} strokeWidth="0.6" />
          </g>
        );
      })}
      <style>{`@keyframes zonePulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }`}</style>
    </svg>
  );
}

// Anel de métrica com animação de preenchimento
function MetricRing({ value, label, color, size = 64 }: { value: number; label: string; color: string; size?: number }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(value), 300); return () => clearTimeout(t); }, [value]);
  const r = 24, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke={T.border} strokeWidth="4" />
        <circle
          cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (circ * anim) / 100}
          transform="rotate(-90 28 28)"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
        <text x="28" y="32" textAnchor="middle" fill={T.text} fontSize="13" fontWeight="800" fontFamily={T.mono}>
          {value}
        </text>
      </svg>
      <span style={{ fontSize: 8, fontFamily: T.mono, color: T.muted, letterSpacing: 1, textAlign: "center", maxWidth: 72 }}>
        {label}
      </span>
    </div>
  );
}

function VideoUploader({ onCapture }: { onCapture: (base64: string, preview: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 150 * 1024 * 1024) {
      alert("Vídeo muito grande. Máximo 150MB — corte um trecho de 10-20s do exercício.");
      return;
    }
    setFileName(file.name);
    setVideoSrc(URL.createObjectURL(file));
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    // Limita o frame a 1280px no maior lado pra manter o payload leve
    const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onCapture(dataUrl.split(",")[1], dataUrl);
  };

  const clear = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    setVideoSrc(null);
    setFileName("");
    setCurrentTime(0);
    setDuration(0);
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleFile} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {!videoSrc ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            width: "100%", padding: "48px 24px", background: T.s, border: `2px dashed ${T.border}`,
            borderRadius: 12, cursor: "pointer", color: T.text, fontFamily: T.font,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}
        >
          <span style={{ fontSize: 40 }}>🎬</span>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>Adicionar vídeo do exercício</span>
          <span style={{ fontSize: 12, color: T.muted, fontFamily: T.mono }}>MP4, MOV ou WebM · corte de 10-20s</span>
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}`, background: "#000" }}>
            <video
              ref={videoRef}
              src={videoSrc}
              style={{ width: "100%", maxHeight: 420, display: "block" }}
              playsInline
              muted
              controls
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, fontFamily: T.mono, color: T.muted, whiteSpace: "nowrap" }}>
              {Math.floor(currentTime)}s / {Math.floor(duration)}s
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (videoRef.current) videoRef.current.currentTime = v;
                setCurrentTime(v);
              }}
              style={{ flex: 1, accentColor: T.cyan }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={captureFrame}
              style={{
                flex: 1, padding: "14px 16px", background: T.cyan, color: "#000",
                border: "none", borderRadius: 8, fontSize: 14, fontWeight: 800,
                letterSpacing: 1, cursor: "pointer", fontFamily: T.font,
              }}
            >
              CAPTURAR FRAME E ANALISAR
            </button>
            <button
              type="button"
              onClick={clear}
              style={{
                padding: "14px 16px", background: T.s, color: T.muted, border: `1px solid ${T.border}`,
                borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: T.font,
              }}
            >
              ✕
            </button>
          </div>

          <p style={{ margin: 0, fontSize: 12, color: T.muted, fontFamily: T.mono, textAlign: "center" }}>
            Pause no frame ideal do exercício e clique em capturar
          </p>
          {fileName && (
            <p style={{ margin: 0, fontSize: 10, color: T.muted, fontFamily: T.mono, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              📁 {fileName}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ContentCard({ title, icon, color, content }: { title: string; icon: string; color: string; content: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ background: T.s, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", borderBottom: `1px solid ${T.border}`, background: T.s2,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: 1, color, fontFamily: T.font }}>
          <span>{icon}</span>
          {title}
        </div>
        <button
          type="button"
          onClick={copy}
          style={{
            padding: "5px 12px", fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: "pointer",
            background: copied ? T.green : "transparent", color: copied ? "#000" : T.muted,
            border: `1px solid ${copied ? T.green : T.border}`, borderRadius: 4, fontFamily: T.mono,
          }}
        >
          {copied ? "COPIADO ✓" : "COPIAR"}
        </button>
      </div>
      <div style={{ padding: 14, fontSize: 13, lineHeight: 1.7, color: T.text, whiteSpace: "pre-wrap", fontFamily: T.font }}>
        {content}
      </div>
    </div>
  );
}

function CarrosselCard({ slides }: { slides: string[] }) {
  const [active, setActive] = useState(0);
  return (
    <div style={{ background: T.s, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        borderBottom: `1px solid ${T.border}`, background: T.s2,
        fontSize: 12, fontWeight: 700, letterSpacing: 1, color: T.gold, fontFamily: T.font,
      }}>
        📑 Roteiro Carrossel
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              style={{
                flex: 1, padding: "6px", fontSize: 10, fontWeight: 700, cursor: "pointer",
                background: active === i ? T.cyan : T.s2,
                border: `1px solid ${active === i ? T.cyan : T.border}`,
                color: active === i ? "#000" : T.muted, fontFamily: T.mono, borderRadius: 4,
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div style={{
          padding: 16, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8,
          fontSize: 13, lineHeight: 1.6, color: T.text, minHeight: 80, fontFamily: T.font, whiteSpace: "pre-wrap",
        }}>
          {slides[active]}
        </div>
      </div>
    </div>
  );
}

function AnalysisPanel({ data, framePreview }: { data: VideoContentResult; framePreview: string | null }) {
  const [tab, setTab] = useState("analise");
  const tabs = [
    { id: "analise", label: "Análise", icon: "🔍" },
    { id: "reels", label: "Reels", icon: "🎬" },
    { id: "feed", label: "Feed", icon: "📸" },
    { id: "pro", label: "B2B", icon: "💼" },
  ];

  const hashtags = (data.conteudo?.hashtags || []).map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Exercise header */}
      <div style={{
        display: "flex", gap: 14, padding: 16, background: T.s, borderRadius: 12,
        border: `1px solid ${T.border}`, alignItems: "center", flexWrap: "wrap",
      }}>
        {framePreview && (
          <img
            src={framePreview}
            alt="Frame analisado do exercício"
            style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.cyan}44` }}
          />
        )}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 10, fontFamily: T.mono, color: T.muted, letterSpacing: 2 }}>EXERCÍCIO IDENTIFICADO</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: T.font, margin: "4px 0 8px" }}>
            {data.exercicio || "—"}
          </div>
          <div>
            {data.padrao_movimento && <Chip color={T.gold}>{data.padrao_movimento}</Chip>}
            {data.musculos_primarios?.map((m, i) => <Chip key={i}>{m}</Chip>)}
          </div>
        </div>
      </div>

      {/* Métricas do exercício */}
      {data.metricas && (
        <div style={{
          display: "flex", justifyContent: "space-around", gap: 8, padding: "14px 10px",
          background: T.s, border: `1px solid ${T.border}`, borderRadius: 12, flexWrap: "wrap",
        }}>
          <MetricRing value={data.metricas.complexidade ?? 0} label="COMPLEXIDADE" color={T.cyan} />
          <MetricRing value={data.metricas.risco_sem_avaliacao ?? 0} label="RISCO S/ AVALIAÇÃO" color={T.red} />
          <MetricRing value={data.metricas.impacto_assimetria ?? 0} label="IMPACTO ASSIMETRIA" color={T.gold} />
          <MetricRing value={data.metricas.necessidade_correcao ?? 0} label="CORREÇÃO TÉCNICA" color={T.purple} />
        </div>
      )}

      {/* Mapa muscular + frase de impacto */}
      {((data.zonas_corporais_ativas?.length ?? 0) > 0 || data.frase_impacto) && (
        <div style={{
          display: "flex", gap: 14, padding: 14, background: T.s,
          border: `1px solid ${T.border}`, borderRadius: 12, alignItems: "center", flexWrap: "wrap",
        }}>
          {(data.zonas_corporais_ativas?.length ?? 0) > 0 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, fontFamily: T.mono, color: T.muted, letterSpacing: 2, marginBottom: 6 }}>MAPA MUSCULAR</div>
              <MuscleMap activeZones={data.zonas_corporais_ativas} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 200 }}>
            {data.frase_impacto && (
              <p style={{
                margin: 0, fontSize: 16, fontWeight: 700, color: T.text, lineHeight: 1.5,
                fontStyle: "italic", borderLeft: `3px solid ${T.cyan}`, paddingLeft: 12,
              }}>
                "{data.frase_impacto}"
              </p>
            )}
            {data.musculos_secundarios && data.musculos_secundarios.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.muted, letterSpacing: 1, display: "block", marginBottom: 6 }}>SINERGISTAS</span>
                {data.musculos_secundarios.slice(0, 4).map((m, i) => <Chip key={i} color={T.muted}>{m}</Chip>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: "9px 4px", fontSize: 11, fontWeight: 700, cursor: "pointer",
              background: tab === t.id ? T.cyan : T.s,
              border: `1px solid ${tab === t.id ? T.cyan : T.border}`,
              color: tab === t.id ? "#000" : T.muted, fontFamily: T.font, borderRadius: 6, letterSpacing: 1,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "analise" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: T.s, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.green, letterSpacing: 1, marginBottom: 8, fontFamily: T.font }}>✅ PONTOS POSITIVOS</div>
            {data.analise_execucao?.pontos_positivos?.map((p, i) => (
              <p key={i} style={{ margin: "4px 0", fontSize: 13, color: T.text, lineHeight: 1.5 }}>• {p}</p>
            ))}
          </div>

          <div style={{ background: T.s, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.red, letterSpacing: 1, marginBottom: 8, fontFamily: T.font }}>⚠️ PONTOS DE ATENÇÃO</div>
            {data.analise_execucao?.pontos_atencao?.map((p, i) => (
              <p key={i} style={{ margin: "4px 0", fontSize: 13, color: T.text, lineHeight: 1.5 }}>• {p}</p>
            ))}
          </div>

          {(data.analise_execucao?.angulacoes_chave?.length ?? 0) > 0 && (
            <div style={{ background: T.s, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.cyan, letterSpacing: 1, marginBottom: 8, fontFamily: T.font }}>📐 ANGULAÇÕES-CHAVE</div>
              {data.analise_execucao?.angulacoes_chave?.map((a, i) => <Chip key={i}>{a}</Chip>)}
            </div>
          )}

          {data.analise_execucao?.cue_principal && (
            <div style={{ background: `${T.cyan}0d`, border: `1px solid ${T.cyan}44`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.cyan, letterSpacing: 1, marginBottom: 6, fontFamily: T.font }}>🎯 CUE PRINCIPAL</div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.5 }}>{data.analise_execucao.cue_principal}</p>
            </div>
          )}

          {(data.apex_insight || data.conexao_apex) && (
            <div style={{ background: T.s, border: `1px solid ${T.gold}44`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: 1, marginBottom: 6, fontFamily: T.font }}>CONEXÃO APEX</div>
              <p style={{ margin: 0, fontSize: 13, color: T.text, lineHeight: 1.6 }}>{data.apex_insight || data.conexao_apex}</p>
            </div>
          )}

          {(data.mce_insight || data.conexao_mce) && (
            <div style={{ background: T.s, border: `1px solid ${T.purple}44`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, letterSpacing: 1, marginBottom: 6, fontFamily: T.font }}>CONEXÃO MCE</div>
              <p style={{ margin: 0, fontSize: 13, color: T.text, lineHeight: 1.6 }}>{data.mce_insight || data.conexao_mce}</p>
            </div>
          )}

          {data.musculos_secundarios && data.musculos_secundarios.length > 0 && (
            <div style={{ padding: "4px 2px" }}>
              <span style={{ fontSize: 10, fontFamily: T.mono, color: T.muted, letterSpacing: 1, display: "block", marginBottom: 6 }}>SINERGISTAS</span>
              {data.musculos_secundarios.map((m, i) => <Chip key={i} color={T.muted}>{m}</Chip>)}
            </div>
          )}
        </div>
      )}

      {tab === "reels" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ContentCard title="HOOK (0-3s)" icon="⚡" color={T.cyan} content={data.conteudo?.hook_reels || ""} />
          <ContentCard title="ROTEIRO COMPLETO (30-60s)" icon="🎬" color={T.green} content={data.conteudo?.roteiro_reels || ""} />
        </div>
      )}

      {tab === "feed" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ContentCard title="LEGENDA DO POST" icon="📸" color={T.cyan} content={data.conteudo?.caption_post || ""} />
          {data.conteudo?.carrossel_slides && <CarrosselCard slides={data.conteudo.carrossel_slides} />}
          <ContentCard title="HASHTAGS" icon="#" color={T.muted} content={hashtags} />
        </div>
      )}

      {tab === "pro" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ContentCard title="LEGENDA B2B (PROFISSIONAIS)" icon="💼" color={T.purple} content={data.conteudo?.caption_profissional || ""} />
          <div style={{ background: T.s, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: 1, marginBottom: 6, fontFamily: T.font }}>💡 ESTRATÉGIA B2B</div>
            <p style={{ margin: 0, fontSize: 13, color: T.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              Use este conteúdo para atrair profissionais que ainda prescrevem treino sem avaliação visual e acompanhamento comportamental.
              {"\n\n"}
              A sequência ideal: publique o conteúdo B2C (público geral) primeiro para gerar engajamento, depois publique a versão B2B mostrando o "bastidor" — como o sistema funciona. Profissionais se identificam quando veem o processo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const LOADING_MESSAGES = [
  "Identificando exercício...",
  "Analisando padrão de movimento...",
  "Mapeando pontos de execução...",
  "Verificando alinhamento articular...",
  "Conectando com protocolo APEX...",
  "Gerando conteúdo estratégico...",
  "Aplicando framework MCE...",
  "Finalizando análise...",
];

type Props = {
  handle?: string;
  niches?: string[];
  products?: string[];
  differentials?: string[];
};

export default function SocialOnVideoContentPanel({ handle, niches = [], products = [], differentials = [] }: Props) {
  const [stage, setStage] = useState<"upload" | "loading" | "result" | "error">("upload");
  const [framePreview, setFramePreview] = useState<string | null>(null);
  const [result, setResult] = useState<VideoContentResult | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (stage !== "loading") return;
    let i = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 2200);
    return () => clearInterval(interval);
  }, [stage]);

  const handleCapture = useCallback(async (base64: string, preview: string) => {
    setFramePreview(preview);
    setStage("loading");
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("social-on-generate", {
        body: {
          mode: "video_content",
          images: [`data:image/jpeg;base64,${base64}`],
          handle, niches, products, differentials,
        },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.result || typeof data.result !== "object") throw new Error("Resposta vazia");
      setResult(data.result as VideoContentResult);
      setStage("result");
    } catch (e) {
      console.error("[SocialOnVideoContent]", e);
      setError(e instanceof Error ? e.message : "Erro na conexão. Verifique sua internet e tente novamente.");
      setStage("error");
    }
  }, [handle, niches, products, differentials]);

  const reset = () => {
    setStage("upload");
    setResult(null);
    setFramePreview(null);
    setError("");
  };

  return (
    <div style={{
      background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16,
      padding: 20, fontFamily: T.font, color: T.text, display: "flex", flexDirection: "column", gap: 18,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: T.cyan, color: "#000",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 900, fontFamily: T.mono, letterSpacing: -1,
          }}>
            S.ON
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 2 }}>VÍDEO → CONTEÚDO</div>
            <div style={{ fontSize: 10, fontFamily: T.mono, color: T.muted, letterSpacing: 2 }}>
              GERADOR DE CONTEÚDO POR VÍDEO
            </div>
          </div>
        </div>
        {stage === "result" && (
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "10px 16px", background: T.s, color: T.cyan, border: `1px solid ${T.cyan}55`,
              borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: "pointer", fontFamily: T.font,
            }}
          >
            NOVO VÍDEO
          </button>
        )}
      </div>

      {/* Upload stage */}
      {stage === "upload" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: 12, fontFamily: T.mono, color: T.cyan, letterSpacing: 3, marginBottom: 6 }}>CRIAR CONTEÚDO</div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 1 }}>Vídeo → Conteúdo Estratégico</div>
            <p style={{ margin: "10px auto 0", maxWidth: 520, fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
              Adicione um vídeo de exercício. O sistema analisa a execução e gera conteúdo pronto para Instagram — com a linguagem APEX, TrainingON e MCE.
            </p>
          </div>

          <VideoUploader onCapture={handleCapture} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {[
              { icon: "🔍", label: "Análise de execução", desc: "Identifica exercício, pontos positivos e correções" },
              { icon: "🎬", label: "Roteiro de Reels", desc: "Hook + roteiro completo de 30-60s pronto pra gravar" },
              { icon: "📸", label: "Legenda + Carrossel", desc: "Caption otimizada e roteiro slide a slide" },
              { icon: "💼", label: "Versão B2B", desc: "Conteúdo direcionado para profissionais do fitness" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, padding: 14, background: T.s,
                border: `1px solid ${T.border}`, borderRadius: 10, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.4, marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading stage */}
      {stage === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "40px 0" }}>
          {framePreview && (
            <img
              src={framePreview}
              alt="Frame em análise"
              style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 12, border: `2px solid ${T.cyan}55` }}
            />
          )}
          <style>{`@keyframes sonSpin { to { transform: rotate(360deg); } }`}</style>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            border: `3px solid ${T.border}`, borderTopColor: T.cyan,
            animation: "sonSpin 0.9s linear infinite",
          }} />
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>{loadingMsg}</div>
          <div style={{ fontSize: 11, fontFamily: T.mono, color: T.muted, letterSpacing: 1 }}>
            Gerando conteúdo estratégico para todas as plataformas
          </div>
        </div>
      )}

      {/* Error stage */}
      {stage === "error" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "32px 0" }}>
          <span style={{ fontSize: 36 }}>⚠️</span>
          <p style={{ margin: 0, fontSize: 13, color: T.red, textAlign: "center", maxWidth: 420 }}>{error}</p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "12px 24px", background: T.cyan, color: "#000", border: "none",
              borderRadius: 8, fontSize: 12, fontWeight: 800, letterSpacing: 1, cursor: "pointer", fontFamily: T.font,
            }}
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      )}

      {/* Result stage */}
      {stage === "result" && result && (
        <AnalysisPanel data={result} framePreview={framePreview} />
      )}

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: `1px solid ${T.border}`, paddingTop: 12,
        fontSize: 10, fontFamily: T.mono, color: T.muted, letterSpacing: 1, flexWrap: "wrap", gap: 6,
      }}>
        <span>SOCIAL ON · nutriON</span>
        {handle && <span>@{String(handle).replace("@", "")}</span>}
      </div>
    </div>
  );
}
