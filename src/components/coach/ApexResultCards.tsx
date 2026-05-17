import React, { useEffect, useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Trophy, Zap, Activity, ChevronDown, AlertTriangle, Award } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────
const stripStars = (s: string) => (s || "").replace(/\*\*+/g, "").trim();

const stripMdInline = (s: string): string =>
  (s || "")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*+/g, "")
    .trim();

// Split a block of text into items. Items start with: "1.", "**1.", "### ", "- ", "•", or empty-line separators.
function splitIntoItems(text: string): { title: string; body: string }[] {
  if (!text) return [];
  const clean = text.replace(/\r/g, "").trim();
  // Try to split on numbered headers like "1." or "**1." or "### 1." at line start
  const numberedRegex = /^\s*(?:#{1,4}\s*)?\*{0,2}\s*(\d+)[.)]\s*\*{0,2}\s*(.+)$/;
  const lines = clean.split("\n");
  const items: { title: string; body: string }[] = [];
  let current: { title: string; body: string } | null = null;

  for (const raw of lines) {
    const line = raw.trimEnd();
    const m = line.match(numberedRegex);
    if (m && m[2]) {
      if (current) items.push(current);
      current = { title: stripMdInline(m[2]), body: "" };
    } else if (current) {
      current.body += (current.body ? "\n" : "") + line;
    }
  }
  if (current) items.push(current);

  // Fallback: split by double blank lines if no numbered items found
  if (items.length === 0) {
    const blocks = clean.split(/\n\s*\n/).filter(b => b.trim());
    return blocks.map((b, i) => {
      const ls = b.split("\n");
      const first = stripMdInline(ls[0] || "").replace(/^[-•]\s*/, "");
      return { title: first || `Item ${i + 1}`, body: ls.slice(1).join("\n").trim() };
    });
  }
  return items;
}

// Detect severity from text keywords
function detectSeverity(text: string): "critico" | "moderado" | "leve" {
  const t = (text || "").toLowerCase();
  if (/cr[ií]tic|severo|grave|urgente/.test(t)) return "critico";
  if (/leve|sutil|m[ií]nim/.test(t)) return "leve";
  return "moderado";
}

const SEVERITY_MAP = {
  critico: { color: "#ff4444", label: "CRÍTICO" },
  moderado: { color: "#B8922A", label: "MODERADO" },
  leve: { color: "#00C896", label: "LEVE" },
};

// Extract labeled sections from body text (DOMINANTE: ... INIBIDO: ... IMPACTO: ...)
function extractLabeled(body: string, labels: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  if (!body) return result;
  const text = body.replace(/\r/g, "");
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const next = labels.slice(i + 1);
    const pattern = new RegExp(
      `(?:^|\\n)\\s*[*•\\-]?\\s*\\*{0,2}(?:${label})\\s*[:：]?\\s*\\*{0,2}\\s*([\\s\\S]*?)(?=${
        next.length
          ? `(?:\\n\\s*[*•\\-]?\\s*\\*{0,2}(?:${next.join("|")})\\s*[:：])`
          : "$"
      })`,
      "i"
    );
    const m = text.match(pattern);
    if (m) result[label.toLowerCase()] = stripMdInline(m[1]).trim();
  }
  return result;
}

// ─── Animated Score Gauge ───────────────────────────────────────
interface GaugeProps { score: number }

function scoreBand(score: number) {
  if (score >= 85) return { color: "#00D4FF", label: "ELITE — NÍVEL DE COMPETIÇÃO", short: "ELITE" };
  if (score >= 70) return { color: "#00C896", label: "BOM — REFINAMENTO NECESSÁRIO", short: "BOM" };
  if (score >= 40) return { color: "#B8922A", label: "INTERMEDIÁRIO — EM DESENVOLVIMENTO", short: "INTERMEDIÁRIO" };
  return { color: "#ff4444", label: "CRÍTICO — CORREÇÃO URGENTE", short: "CRÍTICO" };
}

export function ApexScoreGauge({ score }: GaugeProps) {
  const band = scoreBand(score);
  const [animated, setAnimated] = useState(0);
  const [display, setDisplay] = useState(0);

  // Semicircle geometry
  const W = 200, H = 110;
  const r = 80, cx = W / 2, cy = H;
  const circumference = Math.PI * r; // half circle
  const dashOffset = circumference * (1 - animated / 100);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 50);
    // Count up
    const start = performance.now();
    const dur = 1800;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      // easeOutExpo
      const eased = 1 - Math.pow(2, -10 * p);
      setDisplay(Math.round(score * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [score]);

  return (
    <div
      className="p-5 flex items-center gap-6"
      style={{
        background: `linear-gradient(135deg, ${band.color}14, transparent 70%)`,
        border: `1px solid ${band.color}33`,
        borderLeft: `3px solid ${band.color}`,
      }}
    >
      <svg width={W} height={H + 16} viewBox={`0 0 ${W} ${H + 16}`} className="shrink-0">
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#1A1A1A"
          strokeWidth={12}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={band.color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 1.8s cubic-bezier(0.16,1,0.3,1)",
            filter: `drop-shadow(0 0 8px ${band.color})`,
          }}
        />
        {/* Number */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fontFamily="'Rajdhani', sans-serif"
          fontWeight={700}
          fontSize={48}
          fill={band.color}
        >
          {display}
        </text>
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontFamily="'Space Mono', monospace"
          fontSize={9}
          letterSpacing={2}
          fill="#5A5A5A"
        >
          / 100
        </text>
      </svg>
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 7,
            letterSpacing: "0.22em",
            color: "#5A5A5A",
            textTransform: "uppercase",
          }}
        >
          APEX SCORE GERAL
        </div>
        <div
          className="mt-2 inline-block px-3 py-1.5"
          style={{
            border: `1px solid ${band.color}55`,
            background: `${band.color}10`,
          }}
        >
          <span
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: band.color,
              letterSpacing: "0.04em",
            }}
          >
            {band.label}
          </span>
        </div>
        <div
          className="mt-3"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 7,
            color: "#2A2A2A",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          MÉDIA PONDERADA — GRUPOS CRÍTICOS PESAM 2×
        </div>
      </div>
    </div>
  );
}

// ─── Insight Highlights (Ponto Crítico / Ponto Forte) ───────────
interface InsightProps {
  type: "critico" | "forte";
  name: string;
  score: number;
  desc: string;
}

export function InsightCard({ type, name, score, desc }: InsightProps) {
  const isC = type === "critico";
  const color = isC ? "#ff4444" : "#00C896";
  const label = isC ? "PONTO CRÍTICO" : "PONTO FORTE";
  return (
    <div
      className="p-4"
      style={{
        border: `1px solid ${color}22`,
        background: `${color}0A`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 5,
          letterSpacing: "0.3em",
          color,
        }}
      >
        {label}
      </div>
      <div className="flex items-baseline justify-between gap-3 mt-1.5">
        <div
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color,
            letterSpacing: "0.02em",
            lineHeight: 1.1,
          }}
          className="truncate"
        >
          {stripStars(name)}
        </div>
        <div
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: 32,
            color,
            lineHeight: 1,
          }}
          className="shrink-0"
        >
          {score}
        </div>
      </div>
      <div
        className="mt-2 line-clamp-2"
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 8,
          color: "#888888",
          lineHeight: 1.7,
        }}
      >
        {stripMdInline(desc) || "—"}
      </div>
    </div>
  );
}

// ─── Postura Cards ─────────────────────────────────────────────
export function PosturaCards({ body }: { body: string }) {
  const items = useMemo(() => splitIntoItems(body), [body]);
  if (!items.length) return <Empty text="Nenhum desvio postural detectado." />;
  return (
    <div className="space-y-2">
      {items.map((it, i) => {
        const sev = detectSeverity(it.title + " " + it.body);
        const meta = SEVERITY_MAP[sev];
        const labels = extractLabeled(it.body, ["DOMINANTE", "INIBIDO", "IMPACTO NO PALCO", "IMPACTO", "VISÍVEL EM", "VISIVEL EM", "LOCAL"]);
        const dominante = labels["dominante"];
        const inibido = labels["inibido"];
        const impacto = labels["impacto no palco"] || labels["impacto"];
        const local = labels["visível em"] || labels["visivel em"] || labels["local"];
        const hasStructured = dominante || inibido || impacto || local;
        return (
          <div
            key={i}
            className="p-4 transition-all duration-300"
            style={{
              border: `1px solid ${meta.color}18`,
              background: `${meta.color}04`,
              borderLeft: `3px solid ${meta.color}`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2 min-w-0">
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8,
                    color: "#2A2A2A",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#F5F0E8",
                    letterSpacing: "0.02em",
                  }}
                  className="truncate"
                >
                  {stripStars(it.title)}
                </span>
              </div>
              <span
                className="px-2 py-1 shrink-0"
                style={{
                  border: `1px solid ${meta.color}33`,
                  color: meta.color,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 8,
                  letterSpacing: "0.18em",
                }}
              >
                {meta.label}
              </span>
            </div>

            <div className="my-3" style={{ borderTop: "1px solid #B8922A0A" }} />

            {/* Visível em */}
            {local && (
              <div className="mb-3 flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "#B8922A" }} />
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 5, letterSpacing: "0.3em", color: "#B8922A", textTransform: "uppercase" }}>
                    VISÍVEL EM
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#888888", lineHeight: 1.6 }} className="mt-1">
                    {local}
                  </div>
                </div>
              </div>
            )}

            {/* Dominante vs Inibido */}
            {(dominante || inibido) && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                {dominante && (
                  <div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" style={{ color: "#ff4444" }} />
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 5, letterSpacing: "0.3em", color: "#ff4444", textTransform: "uppercase" }}>
                        DOMINANTE
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "#F5F0E8", lineHeight: 1.6 }} className="mt-1">
                      {dominante.replace(/[\n,;]+/g, " · ")}
                    </div>
                  </div>
                )}
                {inibido && (
                  <div>
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="w-3 h-3" style={{ color: "#00C896" }} />
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 5, letterSpacing: "0.3em", color: "#00C896", textTransform: "uppercase" }}>
                        INIBIDO
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "#F5F0E8", lineHeight: 1.6 }} className="mt-1">
                      {inibido.replace(/[\n,;]+/g, " · ")}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Impacto */}
            {impacto && (
              <div className="pt-3" style={{ borderTop: "1px solid #B8922A0A" }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Trophy className="w-3 h-3" style={{ color: "#B8922A" }} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 5, letterSpacing: "0.3em", color: "#B8922A", textTransform: "uppercase" }}>
                    IMPACTO NO PALCO
                  </span>
                </div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#888888", lineHeight: 1.7 }}>
                  {impacto}
                </div>
              </div>
            )}

            {/* Fallback raw body if no structured fields detected */}
            {!hasStructured && it.body && (
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#888888", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {stripMdInline(it.body)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Correções Cards ───────────────────────────────────────────
export function CorrecoesCards({ body }: { body: string }) {
  const items = useMemo(() => splitIntoItems(body), [body]);
  if (!items.length) return <Empty text="Sem correções nesta análise." />;
  return (
    <div className="space-y-3">
      {items.map((it, i) => {
        const labels = extractLabeled(it.body, [
          "ALONGAMENTO", "ALONGAR",
          "ATIVAÇÃO", "ATIVACAO", "ATIVAR",
          "CUE DE PALCO", "CUE DE POSTURA", "CUE",
        ]);
        const along = labels["alongamento"] || labels["alongar"];
        const ativ = labels["ativação"] || labels["ativacao"] || labels["ativar"];
        const cue = labels["cue de palco"] || labels["cue de postura"] || labels["cue"];
        const hasAny = along || ativ || cue;
        return (
          <div
            key={i}
            className="p-4 transition-all duration-300"
            style={{
              border: "1px solid #B8922A18",
              background: "#B8922A04",
              borderLeft: "3px solid #B8922A",
            }}
          >
            <div className="flex items-baseline gap-2 mb-3">
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "#2A2A2A" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: "#F5F0E8", letterSpacing: "0.02em" }} className="truncate">
                {stripStars(it.title)}
              </span>
            </div>

            {along && <SubCard kind="alongar" body={along} />}
            {ativ && <SubCard kind="ativar" body={ativ} />}
            {cue && <SubCard kind="cue" body={cue} />}

            {!hasAny && it.body && (
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#888888", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {stripMdInline(it.body)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubCard({ kind, body }: { kind: "alongar" | "ativar" | "cue"; body: string }) {
  const conf = {
    alongar: { label: "ALONGAR", color: "#00C896", Icon: Activity, bg: "#00C89604", border: "#00C89644" },
    ativar:  { label: "ATIVAR",  color: "#B8922A", Icon: Zap,      bg: "#B8922A04", border: "#B8922A44" },
    cue:     { label: "CUE DE PALCO", color: "#00D4FF", Icon: Trophy, bg: "#00D4FF05", border: "#00D4FF" },
  }[kind];
  // Heuristic: first line is exercise/title, rest is body
  const lines = body.split("\n").map(l => l.trim()).filter(Boolean);
  const head = stripMdInline(lines[0] || "");
  const dose = lines.find(l => /\d+\s*(s[ée]ries?|x|reps?|seg|s|min|diari|semana)/i.test(l));
  const rest = lines.filter(l => l !== lines[0] && l !== dose).join(" ").trim();

  if (kind === "cue") {
    return (
      <div
        className="mb-2 p-3"
        style={{
          background: conf.bg,
          border: `1px solid #00D4FF18`,
          borderLeft: `2px solid ${conf.color}`,
        }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <conf.Icon className="w-3 h-3" style={{ color: conf.color }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 5, letterSpacing: "0.3em", color: conf.color }}>
            {conf.label}
          </span>
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#F5F0E8", lineHeight: 1.7 }}>
          "{stripMdInline(body).replace(/^["']|["']$/g, "")}"
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2 p-3" style={{ background: "#020205", border: "1px solid #B8922A12" }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <conf.Icon className="w-3 h-3" style={{ color: conf.color }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 5, letterSpacing: "0.3em", color: conf.color }}>
          {conf.label}
        </span>
      </div>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, color: "#F5F0E8", letterSpacing: "0.02em" }}>
        {head}
      </div>
      {dose && (
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "#B8922A", marginTop: 4 }}>
          {stripMdInline(dose)}
        </div>
      )}
      {rest && (
        <div
          className="mt-2 px-3 py-2"
          style={{
            background: `${conf.color}08`,
            borderLeft: `2px solid ${conf.border}`,
            fontFamily: "'Space Mono', monospace",
            fontSize: 8,
            color: "#888888",
            lineHeight: 1.6,
          }}
        >
          {stripMdInline(rest)}
        </div>
      )}
    </div>
  );
}

// ─── Protocolo Cards (expandable) ──────────────────────────────
export function ProtocoloCards({ body }: { body: string }) {
  const items = useMemo(() => splitIntoItems(body), [body]);
  const [open, setOpen] = useState<number | null>(0);
  if (!items.length) return <Empty text="Sem pontos fracos detectados." />;

  return (
    <div className="space-y-2">
      {items.map((it, i) => {
        // Extract score from title like "Peitoral 5/10"
        const scoreMatch = it.title.match(/(\d{1,2})\s*\/\s*10/);
        const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
        const scoreColor = score == null ? "#B8922A" : score >= 8 ? "#00C896" : score >= 6 ? "#B8922A" : "#ff4444";
        const isOpen = open === i;
        return (
          <div
            key={i}
            style={{
              border: "1px solid #B8922A18",
              background: "#0A0A0A",
              borderLeft: "3px solid #B8922A",
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-3 p-4 text-left transition-all duration-300"
              style={{ borderBottom: isOpen ? "1px solid #B8922A0A" : "none" }}
            >
              <div className="flex items-baseline gap-2 min-w-0">
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "#2A2A2A" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, color: "#F5F0E8", letterSpacing: "0.02em" }} className="truncate">
                  {stripStars(it.title.replace(/\s*\d{1,2}\s*\/\s*10\s*/, ""))}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {score !== null && (
                  <span
                    className="px-2 py-1"
                    style={{
                      border: `1px solid ${scoreColor}44`,
                      color: scoreColor,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {score}/10
                  </span>
                )}
                <ChevronDown
                  className="w-4 h-4 transition-transform duration-300"
                  style={{
                    color: "#B8922A",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                  }}
                />
              </div>
            </button>

            {isOpen && (
              <div className="p-4 pt-3 space-y-3 animate-fade-in">
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 5, letterSpacing: "0.3em", color: "#ff444466", textTransform: "uppercase" }}>
                  DIAGNÓSTICO
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8,
                    color: "#888888",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {stripMdInline(it.body)}
                </div>
                <div className="pt-3" style={{ borderTop: "1px solid #B8922A0A" }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 5, letterSpacing: "0.3em", color: "#2A2A2A", textTransform: "uppercase" }}>
                    FREQUÊNCIA · TEMPO DE RESPOSTA
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "#888888", marginTop: 4 }}>
                    2× por semana · 8–12 semanas para resultado visual
                  </div>
                  <div className="mt-2" style={{ height: 3, background: "#1A1A1A" }}>
                    <div style={{ width: "0%", height: "100%", background: "#B8922A" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div
      className="p-6 text-center"
      style={{
        border: "1px solid #B8922A12",
        background: "#020205",
        fontFamily: "'Space Mono', monospace",
        fontSize: 9,
        color: "#5A5A5A",
        letterSpacing: "0.1em",
      }}
    >
      {text}
    </div>
  );
}
