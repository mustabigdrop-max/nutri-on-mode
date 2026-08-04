import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Activity, ChevronDown, Sparkles, Footprints, Route, Gauge, Zap,
  Mountain, Shuffle, ShieldAlert, CalendarDays, Utensils, Layers, Flag, LayoutGrid,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import HybridProfileWizard from "@/components/runon/HybridProfileWizard";
import AegisCard from "@/components/runon/AegisCard";
import AegisPanel from "@/components/runon/AegisPanel";
import { HybridProfile, loadProfile, saveProfile } from "@/lib/runonProfile";
import {
  RUNON, sessionTypes, weeklyPlans, racePreps, nutritionPrinciples, dayMacros,
  hybridStack, muscleGuardRules, severityColors, annualPeriodization,
  transitionRules, overviewPillars,
} from "@/data/runonData";


const ICONS: Record<string, any> = { Footprints, Route, Gauge, Zap, Mountain, Shuffle };

type TabId = "overview" | "sessoes" | "semana" | "race" | "nutrition" | "guard" | "periodizacao";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "overview", label: "OVERVIEW", icon: LayoutGrid },
  { id: "sessoes", label: "SESSÕES", icon: Activity },
  { id: "semana", label: "ARQUITETURA SEMANAL", icon: CalendarDays },
  { id: "race", label: "RACE PREP", icon: Flag },
  { id: "nutrition", label: "NUTRITION BRIDGE", icon: Utensils },
  { id: "guard", label: "MUSCLE GUARD", icon: ShieldAlert },
  { id: "periodizacao", label: "PERIODIZAÇÃO", icon: Layers },
];

const cardStyle = (color?: string): React.CSSProperties => ({
  background: RUNON.card,
  border: `1px solid ${color ? `${color}44` : RUNON.border}`,
  borderRadius: 10,
  padding: 20,
});

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: RUNON.muted,
  fontWeight: 600,
  letterSpacing: "1px",
  textTransform: "uppercase",
};

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-block px-2 py-0.5"
      style={{
        background: `${color}22`, color, border: `1px solid ${color}44`,
        fontSize: 10, fontWeight: 700, borderRadius: 4, letterSpacing: "0.5px",
      }}
    >
      {children}
    </span>
  );
}

function DataCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p style={labelStyle}>{label}</p>
      <p style={{ fontSize: 14, color: color ?? RUNON.text, fontWeight: 600, marginTop: 2 }}>{value}</p>
    </div>
  );
}

/* ─────────── PERFIL + AEGIS ─────────── */
function ProfileSummary({ p, onEdit, onGenerate }: { p: HybridProfile; onEdit: () => void; onGenerate: () => void }) {
  const items: [string, string][] = [
    ["Nome", p.nome || "—"],
    ["Peso", p.peso ? `${p.peso} kg` : "—"],
    ["Objetivo", p.objetivo || "—"],
    ["Split", p.split || "—"],
    ["Nível corrida", p.nivelCorrida || "—"],
    ["Distância alvo", p.temProva ? p.distanciaAlvo || "—" : p.objetivoGeral || "—"],
    ["Status AEGIS", p.usoErgogenicos || "Não informado"],
  ];
  return (
    <div style={cardStyle(RUNON.cyan)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: RUNON.cyan }} />
          <h3 style={{ fontSize: 15, fontWeight: 800, color: RUNON.text }}>Seu Perfil Hybrid</h3>
        </div>
        <button
          onClick={onEdit}
          className="px-3 py-1.5"
          style={{ border: "1px solid #333", color: "#888", fontSize: 10, fontWeight: 700, letterSpacing: "1px", borderRadius: 6 }}
        >
          EDITAR
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        {items.map(([l, v]) => <DataCell key={l} label={l} value={v} />)}
      </div>
      <button
        onClick={onGenerate}
        className="w-full mt-4 py-3"
        style={{ background: RUNON.cyan, color: "#001018", fontSize: 12, fontWeight: 700, letterSpacing: "1px", borderRadius: 8 }}
      >
        GERAR MEU PROTOCOLO RUNON
      </button>
    </div>
  );
}

/* ─────────── OVERVIEW ─────────── */
function OverviewTab() {
  const [profile, setProfile] = useState<HybridProfile | null>(() => loadProfile());
  const [editing, setEditing] = useState(false);
  const [aegisOpen, setAegisOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <div style={cardStyle(RUNON.cyan)}>
        <Badge color={RUNON.cyan}>O PROBLEMA</Badge>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: RUNON.text, marginTop: 10 }}>
          Interferência Concorrente
        </h3>
        <p style={{ fontSize: 13, color: "#bbb", lineHeight: 1.6, marginTop: 8 }}>
          Treino de força ativa mTOR (síntese proteica). Endurance ativa AMPK (eficiência energética).
          Quando as duas vias competem no mesmo dia e no mesmo grupamento, a hipertrofia perde.
          O RunON organiza a semana para que corrida e musculação se somem em vez de se anularem —
          separando estímulos por tempo, grupamento e combustível.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {overviewPillars.map((p) => (
          <div key={p.name} style={cardStyle()}>
            <p style={{ ...labelStyle, color: RUNON.cyan }}>{p.name}</p>
            <p style={{ fontSize: 13, color: "#bbb", lineHeight: 1.5, marginTop: 6 }}>{p.desc}</p>
          </div>
        ))}
      </div>

      <div style={cardStyle(RUNON.cyan)}>
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 shrink-0" style={{ color: RUNON.cyan }} />
          <div className="flex-1">
            <h3 style={{ fontSize: 15, fontWeight: 800, color: RUNON.text }}>Protocolo RunON Personalizado</h3>
            <p style={{ fontSize: 12, color: RUNON.muted, marginTop: 4, lineHeight: 1.5 }}>
              Geração de protocolo personalizado via IA — em breve
            </p>
            <button
              disabled
              title="Em breve"
              className="mt-3 px-4 py-2 cursor-not-allowed"
              style={{
                background: `${RUNON.cyan}12`, border: `1px solid ${RUNON.cyan}33`, color: `${RUNON.cyan}88`,
                fontSize: 11, fontWeight: 700, letterSpacing: "1px", borderRadius: 8, opacity: 0.7,
              }}
            >
              GERAR MEU PROTOCOLO RUNON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── SESSÕES ─────────── */
function SessionsTab() {
  const [open, setOpen] = useState<string | null>(sessionTypes[0].id);
  return (
    <div className="space-y-3">
      {sessionTypes.map((s) => {
        const Icon = ICONS[s.icon] ?? Activity;
        const expanded = open === s.id;
        return (
          <div key={s.id} style={cardStyle(expanded ? s.color : undefined)}>
            <button
              onClick={() => setOpen(expanded ? null : s.id)}
              className="w-full flex items-center gap-3 text-left"
            >
              <div
                className="w-9 h-9 flex items-center justify-center shrink-0"
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}44`, borderRadius: 8 }}
              >
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.name}</p>
                <p style={{ fontSize: 11, color: RUNON.muted }}>{s.aka} · {s.zone}</p>
              </div>
              <ChevronDown
                className="w-4 h-4 transition-transform"
                style={{ color: RUNON.muted, transform: expanded ? "rotate(180deg)" : "none" }}
              />
            </button>

            {expanded && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <DataCell label="Zona" value={s.zone} color={s.color} />
                  <DataCell label="FC" value={s.hrRange} />
                  <DataCell label="Pace" value={s.pace} />
                  <DataCell label="Duração" value={s.duration} />
                  <DataCell label="Frequência" value={s.frequency} color={s.color} />
                </div>
                <div>
                  <p style={labelStyle}>Propósito</p>
                  <p style={{ fontSize: 13, color: "#bbb", lineHeight: 1.5, marginTop: 4 }}>{s.purpose}</p>
                </div>
                <ul className="space-y-1.5">
                  {s.tips.map((t) => (
                    <li key={t} style={{ fontSize: 13, color: "#bbb", lineHeight: 1.5 }}>
                      <span style={{ color: s.color, marginRight: 6 }}>→</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────── ARQUITETURA SEMANAL ─────────── */
function WeeklyTab() {
  const [phase, setPhase] = useState(weeklyPlans[0].id);
  const plan = weeklyPlans.find((p) => p.id === phase)!;
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {weeklyPlans.map((p) => {
          const active = p.id === phase;
          return (
            <button
              key={p.id}
              onClick={() => setPhase(p.id)}
              className="px-3 py-2 whitespace-nowrap"
              style={{
                background: active ? `${p.color}18` : "transparent",
                border: `1px solid ${active ? `${p.color}66` : RUNON.border}`,
                color: active ? p.color : RUNON.muted,
                fontSize: 11, fontWeight: 700, letterSpacing: "1px", borderRadius: 8,
              }}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      <div style={cardStyle(plan.color)}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: plan.color }}>{plan.name}</p>
            <p style={{ fontSize: 11, color: RUNON.muted }}>{plan.weeks}</p>
          </div>
          <Badge color={plan.color}>{plan.volume.km}</Badge>
        </div>

        <div className="mt-4" style={{ border: `1px solid ${RUNON.border}`, borderRadius: 8, overflow: "hidden" }}>
          <div className="grid grid-cols-3 gap-2 px-3 py-2" style={{ background: "#161616" }}>
            <span style={labelStyle}>Dia</span>
            <span style={labelStyle}>Manhã</span>
            <span style={labelStyle}>Tarde</span>
          </div>
          {plan.days.map((d) => (
            <div key={d.day} className="grid grid-cols-3 gap-2 px-3 py-2.5" style={{ borderTop: `1px solid ${RUNON.border}` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: RUNON.muted, letterSpacing: "1px" }}>{d.day}</span>
              <span style={{ fontSize: 13, color: d.color ?? RUNON.text }}>{d.am}</span>
              <span style={{ fontSize: 13, color: d.pm === "—" ? "#444" : (d.color ?? RUNON.text) }}>{d.pm}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <DataCell label="Volume corrida" value={plan.volume.km} color={plan.color} />
          <DataCell label="Musculação" value={plan.volume.strength} />
          <DataCell label="Cardio" value={plan.volume.cardio} />
        </div>
      </div>
    </div>
  );
}

/* ─────────── RACE PREP ─────────── */
function RaceTab() {
  const [race, setRace] = useState(racePreps[0].id);
  const r = racePreps.find((x) => x.id === race)!;
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {racePreps.map((p) => {
          const active = p.id === race;
          return (
            <button
              key={p.id}
              onClick={() => setRace(p.id)}
              className="px-4 py-2 whitespace-nowrap"
              style={{
                background: active ? `${p.color}18` : "transparent",
                border: `1px solid ${active ? `${p.color}66` : RUNON.border}`,
                color: active ? p.color : RUNON.muted,
                fontSize: 12, fontWeight: 800, letterSpacing: "1px", borderRadius: 8,
              }}
            >
              {p.distance}
            </button>
          );
        })}
      </div>

      <div style={cardStyle(r.color)}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p style={{ fontSize: 20, fontWeight: 800, color: r.color }}>{r.distance}</p>
            <p style={{ fontSize: 11, color: RUNON.muted }}>{r.weeks} · {r.level}</p>
          </div>
          <Badge color={r.color}>PACE {r.targetPace}</Badge>
        </div>

        <div className="mt-4 space-y-2">
          {r.phases.map((ph) => (
            <div key={ph.name} style={{ borderLeft: `3px solid ${r.color}`, background: "#0d0d0d", padding: 12, borderRadius: 6 }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p style={{ fontSize: 13, fontWeight: 800, color: r.color }}>{ph.name}</p>
                <span style={{ fontSize: 11, color: RUNON.muted }}>{ph.weeks}</span>
              </div>
              <p style={{ fontSize: 13, color: "#bbb", marginTop: 4, lineHeight: 1.5 }}>{ph.focus}</p>
              <p style={{ fontSize: 11, color: RUNON.cyan, marginTop: 4 }}>{ph.volume}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────── NUTRITION BRIDGE ─────────── */
function NutritionTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {nutritionPrinciples.map((p) => (
          <div key={p.name} style={cardStyle()}>
            <p style={{ ...labelStyle, color: RUNON.cyan }}>{p.name}</p>
            <p style={{ fontSize: 13, color: "#bbb", lineHeight: 1.5, marginTop: 6 }}>{p.desc}</p>
          </div>
        ))}
      </div>

      <div style={cardStyle()}>
        <p style={{ fontSize: 14, fontWeight: 800, color: RUNON.text }}>Macros por Tipo de Dia</p>
        <div className="mt-3 space-y-2">
          {dayMacros.map((d) => (
            <div key={d.type} style={{ borderLeft: `3px solid ${d.color}`, background: "#0d0d0d", padding: 12, borderRadius: 6 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: d.color }}>{d.type}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                <DataCell label="Proteína" value={d.protein} />
                <DataCell label="Carb" value={d.carb} />
                <DataCell label="Gordura" value={d.fat} />
                <DataCell label="Kcal" value={d.kcal} color={d.color} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={cardStyle(RUNON.cyan)}>
        <p style={{ fontSize: 14, fontWeight: 800, color: RUNON.text }}>Suplementação · Hybrid Stack</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          {hybridStack.map((s) => (
            <div key={s.name} style={{ background: "#0d0d0d", border: `1px solid ${RUNON.border}`, borderRadius: 8, padding: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: RUNON.cyan }}>{s.name}</p>
              <p style={{ fontSize: 13, color: RUNON.text, marginTop: 2 }}>{s.dose}</p>
              <p style={{ fontSize: 11, color: RUNON.muted, marginTop: 4, lineHeight: 1.4 }}>{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────── MUSCLE GUARD ─────────── */
function GuardTab() {
  return (
    <div className="space-y-3">
      {muscleGuardRules.map((r) => {
        const color = severityColors[r.severity];
        return (
          <div key={r.id} style={{ ...cardStyle(), borderLeft: `3px solid ${color}` }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full" style={{ width: 8, height: 8, background: color, display: "inline-block" }} />
              <p style={{ fontSize: 14, fontWeight: 800, color: RUNON.text }}>{r.title}</p>
              <Badge color={color}>{r.severity.toUpperCase()}</Badge>
            </div>
            <p style={{ fontSize: 13, color: "#bbb", lineHeight: 1.6, marginTop: 8 }}>{r.desc}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────── PERIODIZAÇÃO ─────────── */
function PeriodizationTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {annualPeriodization.map((b) => (
          <div key={b.id} style={cardStyle(b.color)}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p style={{ fontSize: 13, fontWeight: 800, color: b.color }}>{b.name}</p>
              <Badge color={b.color}>{b.months}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-3">
              <DataCell label="Musculação" value={b.strength} />
              <DataCell label="Corrida" value={b.running} color={b.color} />
            </div>
          </div>
        ))}
      </div>

      <div style={cardStyle()}>
        <p style={{ fontSize: 14, fontWeight: 800, color: RUNON.text }}>Regras de Transição</p>
        <ul className="space-y-1.5 mt-3">
          {transitionRules.map((t) => (
            <li key={t} style={{ fontSize: 13, color: "#bbb", lineHeight: 1.5 }}>
              <span style={{ color: RUNON.cyan, marginRight: 6 }}>→</span>{t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function RunOnPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="min-h-screen pb-28" style={{ background: RUNON.bg }}>
      <div className="mx-auto px-4 pt-5" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center shrink-0"
            style={{ background: RUNON.card, border: `1px solid ${RUNON.border}`, borderRadius: 8 }}
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" style={{ color: RUNON.muted }} />
          </button>
          <span
            className="px-2 py-1"
            style={{
              background: "#00D4FF22", border: "1px solid #00D4FF44", color: RUNON.cyan,
              fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", borderRadius: 4,
            }}
          >
            NUTRION PLATFORM · RUNON
          </span>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
          Run<span style={{ color: RUNON.cyan }}>ON</span>
        </h1>
        <p style={{ fontSize: 14, color: RUNON.cyan, letterSpacing: "2px", fontWeight: 700, marginTop: 2 }}>
          HYBRID PERFORMANCE ENGINE
        </p>
        <p style={{ fontSize: 13, color: RUNON.muted, marginTop: 8, lineHeight: 1.6 }}>
          Periodização de corrida integrada ao bodybuilding. Programe easy runs, tiros, longões e caminhadas
          ao lado da musculação — protegendo massa muscular e otimizando performance aeróbica.
        </p>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar mt-5 pb-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-2 whitespace-nowrap"
                style={{
                  background: active ? "#00D4FF18" : "transparent",
                  border: `1px solid ${active ? "#00D4FF66" : "transparent"}`,
                  color: active ? RUNON.cyan : RUNON.muted,
                  fontSize: 11, fontWeight: 700, letterSpacing: "1px", borderRadius: 8,
                }}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="mt-4">
          {tab === "overview" && <OverviewTab />}
          {tab === "sessoes" && <SessionsTab />}
          {tab === "semana" && <WeeklyTab />}
          {tab === "race" && <RaceTab />}
          {tab === "nutrition" && <NutritionTab />}
          {tab === "guard" && <GuardTab />}
          {tab === "periodizacao" && <PeriodizationTab />}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 pt-8" style={{ borderTop: `1px solid ${RUNON.border}` }}>
          <p style={{ fontSize: 10, color: RUNON.muted, letterSpacing: "2px" }}>
            RUNON HYBRID PERFORMANCE ENGINE · NUTRION PLATFORM
          </p>
          <p style={{ fontSize: 10, color: RUNON.muted, letterSpacing: "2px", marginTop: 4 }}>
            DEVELOPED BY DIOGO MELLO · MCE METHOD · 2026
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
