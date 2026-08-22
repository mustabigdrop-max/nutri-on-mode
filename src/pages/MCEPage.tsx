import { useState, useEffect, useCallback, useRef } from "react";
import AudioAcademyPage from "@/pages/AudioAcademyPage";
import { useNavigate } from "react-router-dom";
import {
  Activity, ArrowLeft, BookOpen, Brain, Briefcase, Clock, Dumbbell,
  Headphones, Map, MonitorUp, ScanLine, TrendingUp, Users, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Data Layer ──────────────────────────────────────────────────────────────
import {
  PILLAR_DATA,
  PROFILES,
  MCE_QUOTES,
  type PillarKey,
  type Author,
  type Exercise,
} from "@/data/mceData";
import { MCE_GUIDE_MARKDOWN } from "@/data/mceGuide";
import { MCE_PROTOCOL_24H_MARKDOWN } from "@/data/mceProtocol24h";
import Protocol24hChecklist from "@/components/mce/Protocol24hChecklist";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


const MONO = "'Space Mono', ui-monospace, monospace";
const DISPLAY = "'Rajdhani', system-ui, sans-serif";

// ── Components ──────────────────────────────────────────────────────────────

function ScoreRing({ value, max = 100, color, size = 120, label, sublabel }: {
  value: number; max?: number; color: string; size?: number; label?: string; sublabel?: string;
}) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const started = performance.now() + 250;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - started) / 1200));
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimated(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const animProgress = (animated / max) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={circumference - animProgress}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 6px ${color}70)` }}
        />
        <text
          x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          style={{ fill: color, fontFamily: DISPLAY, fontSize: size * 0.28, fontWeight: 700 }}
        >
          {animated}
        </text>
      </svg>
      {label && <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.5)" }}>{label}</span>}
      {sublabel && <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1, color: "rgba(255,255,255,0.28)" }}>{sublabel}</span>}
    </div>
  );
}

function PillarNav({ active, scores, onChange }: { active: PillarKey; scores: Record<PillarKey, number>; onChange: (k: PillarKey) => void }) {
  const pills = [
    { key: "M" as PillarKey, label: "MINDSET", color: "#9333EA", Icon: Brain },
    { key: "C" as PillarKey, label: "COMPORTAMENTO", color: "#00C896", Icon: Activity },
    { key: "E" as PillarKey, label: "EXECUÇÃO", color: "#E8A020", Icon: Zap },
  ];
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {pills.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          style={{
            flex: 1, minHeight: 52, padding: "10px 6px", border: `1px solid ${active === p.key ? p.color + "35" : "transparent"}`, borderRadius: 0, cursor: "pointer",
            fontFamily: MONO, fontSize: 11, letterSpacing: 2,
            background: active === p.key ? `${p.color}15` : "transparent",
            color: active === p.key ? p.color : "rgba(255,255,255,0.35)",
            borderBottom: active === p.key ? `2px solid ${p.color}` : "2px solid transparent",
            transition: "all 0.3s ease",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <p.Icon size={14} /> {p.label}
            <span style={{ border: `1px solid ${p.color}55`, color: p.color, padding: "1px 5px", fontSize: 9 }}>{scores[p.key]}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function TabBar({ tabs, active, onChange }: {
  tabs: { key: string; label: string; badge?: string; group: "content" | "action"; Icon: typeof BookOpen }[]; active: string; onChange: (k: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -140 : 140, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative" }}>
      {canScroll.left && (
        <button
          aria-label="Rolar abas para esquerda"
          onClick={() => scroll("left")}
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0, zIndex: 10,
            width: 32, border: "none", background: "linear-gradient(90deg, #05070C 60%, transparent)",
            color: "#00D4FF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "flex-start",
          }}
        >
          ◀
        </button>
      )}
      <div
        ref={scrollRef}
        style={{
          display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto",
          scrollbarWidth: "none", msOverflowStyle: "none",
        }}
      >
        <style>{`
          .mce-tabbar::-webkit-scrollbar { display: none; }
        `}</style>
        {tabs.map((t, index) => {
          const isActive = active === t.key;
          const divider = index > 0 && tabs[index - 1].group !== t.group;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className="mce-tabbar"
              style={{
                flex: "0 0 auto", minHeight: 48, padding: `12px 10px 12px ${divider ? 22 : 10}px`, border: "none", cursor: "pointer",
                fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                background: "transparent",
                color: isActive ? "#00D4FF" : "rgba(255,255,255,0.35)",
                borderBottom: isActive ? `2px solid ${t.badge || "#00D4FF"}` : "2px solid transparent",
                transition: "all 0.25s ease", display: "flex", alignItems: "center", gap: 6,
                marginLeft: divider ? 10 : 0,
                borderLeft: divider ? "1px solid rgba(255,255,255,0.12)" : undefined,
              }}
            >
              <t.Icon size={11} />
              {t.label}
              {t.badge && (
                <span style={{
                   fontSize: 8, letterSpacing: 0.5, color: t.badge, background: "transparent",
                   border: `1px solid ${t.badge}55`, borderRadius: 0, padding: "2px 5px", fontWeight: 700,
                }}>
                  24H
                </span>
              )}
            </button>
          );
        })}
      </div>
      {canScroll.right && (
        <button
          aria-label="Rolar abas para direita"
          onClick={() => scroll("right")}
          style={{
            position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 10,
            width: 32, border: "none", background: "linear-gradient(270deg, #05070C 60%, transparent)",
            color: "#00D4FF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "flex-end",
          }}
        >
          ▶
        </button>
      )}
    </div>
  );
}

function AuthorCard({ author, color }: { author: Author; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: open ? `${color}08` : "rgba(255,255,255,0.02)",
        border: `1px solid ${open ? color + "30" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 12, padding: "16px 18px", cursor: "pointer", position: "relative",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>
            {author.name}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
            {author.inst}
          </div>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 10, color, letterSpacing: 1, textAlign: "right", maxWidth: 160 }}>
          {author.concept}
        </span>
      </div>
      {open && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.3)" }}>
            OBRA REFERÊNCIA · {author.year}
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 600, color, marginTop: 2 }}>
            {author.book}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>
            INSIGHT APLICADO AO MCE
          </div>
          <p style={{ marginTop: 4, fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.65)" }}>
            {author.insight}
          </p>
        </div>
      )}

      <div style={{ position: "absolute", bottom: 6, right: 12, fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
        {open ? "▲" : "▼"}
      </div>
    </div>
  );
}

function DiagnosticSlider({ question, refLabel, value, onChange, index }: {
  question: string; refLabel?: string; value: number; onChange: (v: number) => void; index: number;
}) {
  const color = value >= 7 ? "#00FF88" : value >= 4 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ marginBottom: 18 }}>
      {refLabel && (
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.28)", marginBottom: 4 }}>
          {refLabel.toUpperCase()}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
          {`0${index + 1}. ${question}`}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color, minWidth: 30, textAlign: "right" }}>
          {value}
        </span>
      </div>

      <input
        type="range" min={1} max={10} step={1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color }}
      />
    </div>
  );
}

function ExerciseCard({ exercise, color, onComplete, completed }: {
  exercise: Exercise; color: string; onComplete: () => void; completed: boolean;
}) {
  const diffLabels = ["BÁSICO", "INTERMEDIÁRIO", "AVANÇADO"];
  const diffColors = ["#00FF88", "#F59E0B", "#EF4444"];
  return (
    <div style={{
      background: completed ? `${color}0A` : "rgba(255,255,255,0.02)",
      border: `1px solid ${completed ? color + "35" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 12, padding: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: "#fff" }}>
          {exercise.title}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1, color: diffColors[exercise.difficulty - 1] }}>
          {diffLabels[exercise.difficulty - 1]}
        </span>
      </div>
      <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: `${color}AA` }}>
        REF: {exercise.ref.toUpperCase()}
      </div>
      <p style={{ marginTop: 6, fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,0.6)" }}>
        {exercise.desc}
      </p>

      <button
        onClick={onComplete}
        style={{
          marginTop: 12, width: "100%", padding: "9px 0", borderRadius: 8, cursor: "pointer",
          fontFamily: MONO, fontSize: 10, letterSpacing: 2,
          background: completed ? `${color}18` : "transparent",
          border: `1px solid ${completed ? color + "50" : "rgba(255,255,255,0.12)"}`,
          color: completed ? color : "rgba(255,255,255,0.5)",
          transition: "all 0.25s ease",
        }}
      >
        {completed ? "✓ CONCLUÍDO" : "MARCAR CONCLUÍDO"}
      </button>
    </div>
  );
}

function ProfileCard({ profile, selected, onClick }: {
  profile: typeof PROFILES[number]; selected: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? `${profile.color}0A` : "rgba(255,255,255,0.02)",
        border: `1px solid ${selected ? profile.color + "40" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 12, padding: 16, cursor: "pointer", transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{profile.icon}</span>
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: profile.color, letterSpacing: 1 }}>
            {profile.name}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
            {profile.weakness === "Nenhum crítico" ? "SEM DÉFICIT CRÍTICO" : `DÉFICIT: ${profile.weakness.toUpperCase()}`}
          </div>
        </div>
      </div>

      <p style={{ marginTop: 8, fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,0.6)" }}>
        {profile.desc}
      </p>
      {selected && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {profile.traits.map((t) => (
              <span key={t} style={{
                fontFamily: MONO, fontSize: 9, letterSpacing: 1, padding: "4px 8px", borderRadius: 6,
                background: `${profile.color}12`, color: profile.color,
              }}>
                {t}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: "#00D4FF" }}>
              INTERVENÇÃO MCE
            </div>
            <div style={{ marginTop: 6, fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
              {profile.intervention}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TriangleDiagram({ scores, activeKey }: { scores: Record<PillarKey, number>; activeKey: PillarKey }) {
  const w = 420, h = 360;
  const cx = w / 2;
  const nodes = [
    { key: "M" as PillarKey, x: cx, y: 45, color: "#9333EA", label: "M", name: "Mindset", detail: "Fundação cognitiva" },
    { key: "C" as PillarKey, x: 62, y: 302, color: "#00C896", label: "C", name: "Comportamento", detail: "Arquitetura de hábitos" },
    { key: "E" as PillarKey, x: 358, y: 302, color: "#E8A020", label: "E", name: "Execução", detail: "Output mensurável" },
  ];
  const centerY = 216;
  const pointAt = (node: typeof nodes[number], pct: number) => ({ x: cx + (node.x - cx) * pct, y: centerY + (node.y - centerY) * pct });
  const scorePoints = nodes.map((node) => pointAt(node, Math.max(0.08, scores[node.key] / 100))).map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mce-radar" style={{ maxWidth: "100%", overflow: "visible" }}>
      <defs>
        <radialGradient id="mce-radar-fill" cx="50%" cy="50%" r="58%">
          <stop offset="0%" stopColor="#B8922A" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#B8922A" stopOpacity="0.02" />
        </radialGradient>
        {nodes.map((n) => (
          <radialGradient key={n.key} id={`glow-${n.key}`}>
            <stop offset="0%" stopColor={n.color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={n.color} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>

      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <polygon key={pct} points={nodes.map((node) => { const p = pointAt(node, pct); return `${p.x},${p.y}`; }).join(" ")} fill="none" stroke="rgba(255,255,255,0.055)" strokeDasharray="4 6" />
      ))}

      {nodes.map((n) => (
        <line key={`c-${n.key}`} x1={n.x} y1={n.y} x2={cx} y2={centerY} stroke="rgba(184,146,42,0.16)" strokeWidth={1} strokeDasharray="3 5" />
      ))}
      <polygon points={scorePoints} fill="url(#mce-radar-fill)" stroke="#B8922A" strokeWidth="2" className="mce-radar-shape" />
      <circle cx={cx} cy={centerY} r={18} fill="rgba(184,146,42,0.08)" stroke="rgba(184,146,42,0.55)" strokeWidth={1} className="mce-radar-core" />
      <text x={cx} y={centerY} textAnchor="middle" dominantBaseline="central" style={{ fill: "#B8922A", fontFamily: MONO, fontSize: 10, letterSpacing: 1 }}>
        MCE
      </text>

      {nodes.map((n) => {
        const score = scores[n.key] ?? 50;
        const r = 30;
        const isActive = activeKey === n.key;
        return (
          <g key={n.key} className={`mce-radar-node mce-radar-node-${n.key}`} tabIndex={0} role="img" aria-label={`${n.name}: ${score} de 100 — ${n.detail}`}>
            <circle cx={n.x} cy={n.y} r={r + 18} fill={`url(#glow-${n.key})`} />
            <circle
              cx={n.x} cy={n.y} r={r}
              fill={`${n.color}12`}
              stroke={n.color}
              strokeWidth={isActive ? 2 : 1}
              style={{ filter: `drop-shadow(0 0 ${isActive ? 12 : 7}px ${n.color}90)` }}
            />
            <text x={n.x} y={n.y - 4} textAnchor="middle" dominantBaseline="central" style={{ fill: n.color, fontFamily: DISPLAY, fontSize: 48, fontWeight: 900 }}>
              {n.label}
            </text>
            <text x={n.x} y={n.y + 25} textAnchor="middle" dominantBaseline="central" style={{ fill: "rgba(255,255,255,0.65)", fontFamily: MONO, fontSize: 9 }}>
              {score}/100
            </text>
            <g className="mce-radar-tooltip">
              <rect x={Math.max(4, Math.min(w - 190, n.x - 95))} y={n.y > 200 ? n.y - 82 : n.y + 44} width="190" height="34" fill="#07070d" stroke={n.color} strokeOpacity="0.45" />
              <text x={Math.max(99, Math.min(w - 95, n.x))} y={n.y > 200 ? n.y - 61 : n.y + 65} textAnchor="middle" style={{ fill: n.color, fontFamily: MONO, fontSize: 8 }}>{n.name}: {score}/100 — {n.detail}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function MCEIntelligencePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pillar, setPillar] = useState<PillarKey>("M");
  const [tab, setTab] = useState("estudo");
  const [scores, setScores] = useState<Record<PillarKey, number>>({ M: 50, C: 50, E: 50 });
  const [diagnostics, setDiagnostics] = useState<Record<PillarKey, number[]>>({ M: [5, 5, 5], C: [5, 5, 5], E: [5, 5, 5] });
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [presentationMode, setPresentationMode] = useState(false);
  const [pillarDirection, setPillarDirection] = useState(1);

  useEffect(() => {
    if (!presentationMode) return;
    let frame = 0;
    let last = performance.now();
    const advance = (now: number) => {
      if (now - last > 40) {
        window.scrollBy({ top: 1, behavior: "auto" });
        last = now;
      }
      if (window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 4) frame = requestAnimationFrame(advance);
    };
    const timer = window.setTimeout(() => { frame = requestAnimationFrame(advance); }, 1200);
    return () => { window.clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [presentationMode]);

  useEffect(() => {
    const iv = setInterval(() => setQuoteIdx((i) => (i + 1) % MCE_QUOTES.length), 8000);
    return () => clearInterval(iv);
  }, []);

  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load persisted state ──
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [scoreRes, diagRes, exRes] = await Promise.all([
        supabase.from("mce_scores").select("score_m,score_c,score_e").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("mce_diagnostics").select("pillar,answers").eq("user_id", user.id),
        supabase.from("mce_exercises_done").select("exercise_key").eq("user_id", user.id),
      ]);
      if (cancelled) return;
      if (scoreRes.data) {
        setScores({ M: scoreRes.data.score_m ?? 50, C: scoreRes.data.score_c ?? 50, E: scoreRes.data.score_e ?? 50 });
      }
      if (diagRes.data?.length) {
        setDiagnostics((prev) => {
          const next = { ...prev };
          for (const row of diagRes.data as { pillar: string; answers: number[] }[]) {
            if (row.pillar === "M" || row.pillar === "C" || row.pillar === "E") {
              next[row.pillar] = row.answers?.length === 3 ? row.answers : next[row.pillar];
            }
          }
          return next;
        });
      }
      if (exRes.data?.length) {
        const map: Record<string, boolean> = {};
        for (const row of exRes.data as { exercise_key: string }[]) map[row.exercise_key] = true;
        setCompleted(map);
      }
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const data = PILLAR_DATA[pillar];
  const totalScore = Math.round((scores.M + scores.C + scores.E) / 3);

  const getPhase = (s: number) => {
    if (s < 25) return { label: "RECONSTRUÇÃO", color: "#EF4444" };
    if (s < 50) return { label: "REPROGRAMAÇÃO", color: "#F59E0B" };
    if (s < 75) return { label: "ACELERAÇÃO", color: "#00D4FF" };
    return { label: "OTIMIZAÇÃO", color: "#00FF88" };
  };
  const phase = getPhase(totalScore);

  const persistScores = useCallback((next: Record<PillarKey, number>) => {
    if (!user) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void supabase.from("mce_scores").insert({
        user_id: user.id, score_m: next.M, score_c: next.C, score_e: next.E, source: "diagnostic",
      });
    }, 1200);
  }, [user]);

  const updateDiagnostic = (pKey: PillarKey, idx: number, val: number) => {
    const answers = [...diagnostics[pKey]];
    answers[idx] = val;
    const newScore = Math.round((answers.reduce((a, b) => a + b, 0) / 30) * 100);
    const nextScores = { ...scores, [pKey]: newScore } as Record<PillarKey, number>;
    setDiagnostics((prev) => ({ ...prev, [pKey]: answers }));
    setScores(nextScores);
    persistScores(nextScores);
    if (user) {
      void supabase.from("mce_diagnostics").upsert(
        { user_id: user.id, pillar: pKey, answers },
        { onConflict: "user_id,pillar" },
      );
    }
  };

  const toggleComplete = (key: string) => {
    const nowDone = !completed[key];
    setCompleted((prev) => ({ ...prev, [key]: nowDone }));
    if (!user) return;
    if (nowDone) {
      void supabase.from("mce_exercises_done").insert({ user_id: user.id, exercise_key: key });
    } else {
      void supabase.from("mce_exercises_done").delete().eq("user_id", user.id).eq("exercise_key", key);
    }
  };

  const tabs = [
    { key: "estudo", label: "ESTUDO", group: "content" as const, Icon: BookOpen },
    { key: "guia", label: "GUIA", group: "content" as const, Icon: Map },
    { key: "diagnostico", label: "DIAGNÓSTICO", group: "content" as const, Icon: ScanLine },
    { key: "exercicios", label: "EXERCÍCIOS", group: "content" as const, Icon: Dumbbell },
    { key: "perfis", label: "PERFIS", group: "content" as const, Icon: Users },
    { key: "protocolo24h", label: "24H", badge: "#E8A020", group: "action" as const, Icon: Clock },
    { key: "progresso", label: "PROGRESSO", group: "action" as const, Icon: TrendingUp },
    { key: "audio", label: "ÁUDIO", badge: "#E8A020", group: "action" as const, Icon: Headphones },
    { key: "business", label: "BUSINESS", badge: "#00D4FF", group: "action" as const, Icon: Briefcase },
  ];
  const socialAuthors = Object.values(PILLAR_DATA).flatMap((item) => item.authors).filter((author, index, all) => all.findIndex((candidate) => candidate.name === author.name) === index).slice(0, 12);

  const sectionTitle: React.CSSProperties = {
    fontFamily: MONO, fontSize: 10, letterSpacing: 2.5, color: "rgba(255,255,255,0.35)", marginBottom: 12,
  };

  return (
    <div className={`mce-presentation-shell ${presentationMode ? "is-presenting" : ""}`} style={{ minHeight: "100vh", background: "#020205", color: "#fff", paddingBottom: 96 }}>
      <style>{`
        @keyframes mceFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .mce-root input[type="range"] { -webkit-appearance: none; height: 4px; border-radius: 4px; background: rgba(255,255,255,0.08); outline: none; }

        .mce-root input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; cursor: pointer; background: currentColor; }

        .mce-guide { font-family: ${DISPLAY}; font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.78); }
        .mce-guide h1 { font-size: 26px; font-weight: 700; letter-spacing: 1px; color: #fff; margin: 4px 0 6px; }
        .mce-guide h2 { font-family: ${MONO}; font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; color: #00D4FF; margin: 30px 0 10px; padding-bottom: 6px; border-bottom: 1px solid rgba(0,212,255,0.18); }
        .mce-guide h3 { font-size: 16px; font-weight: 700; color: #F59E0B; margin: 18px 0 6px; letter-spacing: .5px; }
        .mce-guide p { margin: 8px 0; }
        .mce-guide strong { color: #fff; }
        .mce-guide em { color: rgba(255,255,255,0.55); }
        .mce-guide hr { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 22px 0; }
        .mce-guide ul { margin: 8px 0 8px 0; padding-left: 0; list-style: none; }
        .mce-guide li { position: relative; padding-left: 16px; margin: 6px 0; }
        .mce-guide li::before { content: "▸"; position: absolute; left: 0; color: #00FF88; }
        .mce-guide blockquote { margin: 14px 0; padding: 14px 16px; border-left: 2px solid #A78BFA; background: rgba(167,139,250,0.06); border-radius: 0 10px 10px 0; font-style: italic; }
        .mce-guide blockquote p { margin: 6px 0; }
        .mce-guide table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; display: block; overflow-x: auto; }
        .mce-guide th { font-family: ${MONO}; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.45); text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.12); white-space: nowrap; }
        .mce-guide td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top; }
      `}</style>

      <div className="mce-root" style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => navigate(-1)}
              aria-label="Voltar"
              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex" }}
            >
              <ArrowLeft size={18} />
            </button>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 3, color: "#00D4FF" }}>NUTRION</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.5)" }}>MCE INTELLIGENCE</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="mce-presentation-toggle" onClick={() => setPresentationMode((value) => !value)} aria-pressed={presentationMode} title="Modo apresentação">
              <MonitorUp size={14} /> <span>{presentationMode ? "SAIR" : "APRESENTAR"}</span>
            </button>
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: "#00FF88", border: "1px solid rgba(0,255,136,0.25)", padding: "3px 8px" }}>V3.0</span>
          </div>
        </header>

        {presentationMode && <div className="mce-presentation-counter"><strong>203 áudios</strong><span>44,6h</span><span>12 séries</span><span>12 autores científicos</span><em>nutriON · Sistema Integrado de Performance Humana</em></div>}

        {/* Hero */}
        <section style={{ textAlign: "center", padding: "28px 0 8px" }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 4, color: "rgba(255,255,255,0.3)" }}>
            MÉTODO COMPORTAMENTAL
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 10 }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 48, fontWeight: 700, color: "#A78BFA" }}>M</span>
            <span style={{ fontFamily: DISPLAY, fontSize: 48, fontWeight: 700, color: "#00FF88" }}>C</span>
            <span style={{ fontFamily: DISPLAY, fontSize: 48, fontWeight: 700, color: "#F59E0B" }}>E</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2.5, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
            MENTALIDADE · COMPORTAMENTO · EXECUÇÃO
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.6 }} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, flexWrap: "wrap", marginTop: 24 }}>
            <ScoreRing value={scores.M} color="#A78BFA" size={92} label="MINDSET" />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <ScoreRing value={totalScore} color={phase.color} size={132} label="MCE SCORE" sublabel={loaded ? "SINCRONIZADO" : "CARREGANDO"} />
              <div style={{
                fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: phase.color,
                border: `1px solid ${phase.color}40`, borderRadius: 6, padding: "4px 10px",
              }}>
                {phase.label}
              </div>
            </div>
            <ScoreRing value={scores.E} color="#F59E0B" size={92} label="EXECUÇÃO" />
          </motion.div>

          <div className="mce-radar-stage" style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <TriangleDiagram scores={scores} activeKey={pillar} />
          </div>

          <div className="mce-impact-quote" style={{ marginTop: 18, padding: "26px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(184,146,42,0.16)", position: "relative", overflow: "hidden" }}>
            <span className="mce-quote-mark">“</span>
            <p key={quoteIdx} style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, fontStyle: "italic", color: "rgba(255,255,255,0.9)", animation: "mceFade 0.6s ease", position: "relative" }}>
              "{MCE_QUOTES[quoteIdx]}"
            </p>
            <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.12em", color: "rgba(184,146,42,0.55)" }}>
              @diogo.mell0 · MCE METHOD
            </span>
          </div>

          <div className="mce-social-proof">
            <span>MÉTODO BASEADO EM 12 AUTORES CIENTÍFICOS</span>
            <div>{socialAuthors.map((author) => <button key={author.name} title={`${author.book} — ${author.concept}`}>{author.name.split(" ").slice(-1)} <small>{author.year}</small></button>)}</div>
          </div>
        </section>


        {/* Pillar nav */}
        <div style={{ marginTop: 8 }}>
          <PillarNav active={pillar} scores={scores} onChange={(k) => { setPillarDirection((["M", "C", "E"] as PillarKey[]).indexOf(k) > (["M", "C", "E"] as PillarKey[]).indexOf(pillar) ? 1 : -1); setPillar(k); setTab("estudo"); }} />
        </div>

        {/* Active pillar header */}
        <AnimatePresence mode="wait" custom={pillarDirection}>
        <motion.div key={pillar} custom={pillarDirection} initial={{ opacity: 0, x: pillarDirection * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: pillarDirection * -24 }} transition={{ duration: 0.3 }} style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: data.color, letterSpacing: 1 }}>
              {data.label}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: data.color, border: `1px solid ${data.color}45`, padding: "4px 8px" }}>
              {data.tagline}
            </span>
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
            {data.subtitle}
          </div>
          <p style={{
            marginTop: 10, padding: "12px 14px", borderRadius: 12,
            background: `${data.color}08`, border: `1px solid ${data.color}20`,
            fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.7)",
          }}>
            {data.manifesto.split(/(software|identidade|sistema operacional)/gi).map((part, index) => /^(software|identidade|sistema operacional)$/i.test(part) ? <mark key={`${part}-${index}`} className="mce-keyword">{part}</mark> : part)}
          </p>
          <div className="mce-pillar-metrics">
            <span><Headphones size={14} /><strong>12</strong> episódios</span><span><Clock size={14} /><strong>97</strong> min de conteúdo</span><span><BookOpen size={14} /><strong>{data.authors.length}</strong> autores base</span>
          </div>
          <div className="mce-author-chips">{data.authors.slice(0, 4).map((author) => <button key={author.name} title={`${author.name} — ${author.book} (${author.year}) · Conceito: ${author.concept}`}>{author.name.split(" ").slice(-1)}</button>)}</div>
        </motion.div>
        </AnimatePresence>


        {/* Tabs */}
        <div style={{ marginTop: 14 }}>
          <TabBar
            tabs={tabs}
            active={tab}
            onChange={(k) => {
              if (k === "business") navigate("/mce/business");
              else setTab(k);
            }}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          {tab === "audio" && <AudioAcademyPage embedded />}

          {/* ESTUDO */}
          {tab === "estudo" && (
            <div>
              <div style={{
                padding: 16, borderRadius: 12, background: `${data.color}08`,
                border: `1px solid ${data.color}25`, marginBottom: 20,
              }}>
                <p style={{ fontFamily: DISPLAY, fontSize: 16, fontStyle: "italic", color: data.color }}>
                  "{data.quote}"
                </p>
              </div>

              <div style={sectionTitle}>REFERÊNCIAS CIENTÍFICAS · {data.authors.length} AUTORES</div>

              <div style={{ display: "grid", gap: 10 }}>
                {data.authors.map((a) => (
                  <AuthorCard key={a.name} author={a} color={data.color} />
                ))}
              </div>
            </div>
          )}

          {/* GUIA DE DOMÍNIO MCE */}
          {tab === "guia" && (
            <div>
              <div style={sectionTitle}>GUIA DE DOMÍNIO MCE · DIOGO MELLO</div>
              <div style={{
                padding: "18px 16px", borderRadius: 14,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <div className="mce-guide">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{MCE_GUIDE_MARKDOWN}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* PROTOCOLO MCE 24H */}
          {tab === "protocolo24h" && (
            <div>
              <div style={sectionTitle}>PROTOCOLO MCE 24H · SISTEMA OPERACIONAL DIÁRIO</div>
              <Protocol24hChecklist />
              <div style={{
                padding: "18px 16px", borderRadius: 14,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <div className="mce-guide">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{MCE_PROTOCOL_24H_MARKDOWN}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}



          {/* DIAGNÓSTICO */}
          {tab === "diagnostico" && (
            <div>
              <div style={sectionTitle}>DIAGNÓSTICO · {data.label}</div>
              <p style={{ fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 18 }}>
                Avalie cada item de 1 a 10 com honestidade. O score atualiza e salva automaticamente.
              </p>

              {data.diagnostics.map((item, i) => (
                <DiagnosticSlider
                  key={item.q}
                  question={item.q}
                  refLabel={item.ref}
                  index={i}
                  value={diagnostics[pillar][i]}
                  onChange={(val) => updateDiagnostic(pillar, i, val)}
                />
              ))}


              <div style={{
                display: "flex", alignItems: "baseline", gap: 8, padding: 16, borderRadius: 12,
                background: `${data.color}08`, border: `1px solid ${data.color}25`, marginTop: 8,
              }}>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.4)", flex: 1 }}>
                  SCORE {data.label}
                </span>
                <span style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 700, color: data.color }}>
                  {scores[pillar]}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>/100</span>
              </div>

              <div style={{ marginTop: 24, padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <div style={sectionTitle}>DIAGNÓSTICO GLOBAL MCE</div>
                {(["M", "C", "E"] as PillarKey[]).map((k) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: PILLAR_DATA[k].color, width: 16 }}>{k}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{
                        width: `${scores[k]}%`, height: "100%", borderRadius: 4,
                        background: PILLAR_DATA[k].color, transition: "width 0.6s ease",
                      }} />
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.6)", width: 26, textAlign: "right" }}>
                      {scores[k]}
                    </span>
                  </div>
                ))}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: phase.color }}>
                    FASE: {phase.label}
                  </span>
                  <p style={{ marginTop: 6, fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>
                    {totalScore < 25 ? "Foco em reconstrução da Mentalidade. Fundações primeiro." :
                      totalScore < 50 ? "Fase de reprogramação comportamental. Redesenhe seus hábitos." :
                        totalScore < 75 ? "Aceleração em execução. Sistemas e accountability." :
                          "Fine-tuning nos 3 pilares. Otimize e periodize."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* EXERCÍCIOS */}
          {tab === "exercicios" && (
            <div>
              <div style={sectionTitle}>EXERCÍCIOS · {data.label}</div>
              <p style={{ fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>
                Exercícios práticos baseados na ciência de cada referência. Complete para evoluir seu score.
              </p>

              <div style={{ display: "grid", gap: 10 }}>
                {data.exercises.map((ex, i) => {
                  const key = `${pillar}-ex-${i}`;
                  return (
                    <ExerciseCard
                      key={key}
                      exercise={ex}
                      color={data.color}
                      completed={!!completed[key]}
                      onComplete={() => toggleComplete(key)}
                    />
                  );
                })}
              </div>

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: data.color }}>
                  {Object.keys(completed).filter((k) => k.startsWith(`${pillar}-ex-`) && completed[k]).length} / {data.exercises.length} CONCLUÍDOS
                </span>
              </div>
            </div>
          )}

          {/* PERFIS */}
          {tab === "perfis" && (
            <div>
              <div style={sectionTitle}>PERFIS COMPORTAMENTAIS · PCA</div>
              <p style={{ fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>
                4 arquétipos de aderência baseados em padrões comportamentais. Identifique o seu para receber a intervenção correta.
              </p>

              <div style={{ display: "grid", gap: 10 }}>
                {PROFILES.map((p) => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    selected={selectedProfile === p.id}
                    onClick={() => setSelectedProfile(selectedProfile === p.id ? null : p.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* PROGRESSO */}
          {tab === "progresso" && (
            <div>
              <div style={sectionTitle}>PROGRESSO MCE · OVERVIEW</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {(["M", "C", "E"] as PillarKey[]).map((k) => {
                  const d = PILLAR_DATA[k];
                  const completedCount = Object.keys(completed).filter((c) => c.startsWith(`${k}-ex-`) && completed[c]).length;
                  return (
                    <div key={k} style={{
                      padding: 14, borderRadius: 12, textAlign: "center",
                      background: `${d.color}08`, border: `1px solid ${d.color}22`,
                    }}>
                      <div style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, color: d.color }}>{scores[k]}</div>
                      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                        {d.label}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.28)", marginTop: 6 }}>
                        {completedCount}/{d.exercises.length} exercícios
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 20, padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <div style={sectionTitle}>CONSISTÊNCIA · ÚLTIMOS 7 DIAS</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d, i) => {
                    const active = i < 5;
                    return (
                      <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                        <div style={{
                          width: "100%", aspectRatio: "1", maxWidth: 40, borderRadius: 8,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: active ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${active ? "rgba(0,255,136,0.35)" : "rgba(255,255,255,0.06)"}`,
                          color: "#00FF88", fontSize: 12,
                        }}>
                          {active ? "✓" : ""}
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{d}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 20, textAlign: "center", padding: 20 }}>
                <p style={{ fontFamily: DISPLAY, fontSize: 16, fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>
                  "O comportamento vem antes do alimento."
                </p>
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.28)" }}>
                  MCE METHOD · @DIOGOMELLO180
                </span>
              </div>
            </div>
          )}
        </div>

        <footer className="mce-demo-footer">
          <div><QRCodeSVG value="https://nutrion.app.br/demo" size={112} bgColor="#020205" fgColor="#B8922A" level="M" /></div>
          <section><span>DEMO MCE</span><h2>Escaneie e experimente</h2><p>Acesse a versão demo do MCE agora.</p><strong>“Transformação é sistema.” — @diogo.mell0</strong></section>
        </footer>
      </div>
    </div>
  );
}
