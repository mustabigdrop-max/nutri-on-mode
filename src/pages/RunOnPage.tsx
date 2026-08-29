import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, ChevronDown, Zap, Shuffle, ShieldCheck, CalendarDays, Utensils, Flag,
  LayoutDashboard, Calendar, Shield, BarChart3, Footprints, GitBranch, Users,
  Heart, Route, Gauge, Flame, TrendingUp, Dumbbell, Fuel, Timer, AlertTriangle,
  RefreshCw, Target, Scale, ShieldAlert, HeartPulse, Atom, FlaskConical, Syringe, RotateCcw,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import HybridProfileWizard from "@/components/runon/HybridProfileWizard";
import AegisCard from "@/components/runon/AegisCard";
import AegisPanel from "@/components/runon/AegisPanel";
import { HybridProfile, loadProfile } from "@/lib/runonProfile";
import { useRunonProfile } from "@/hooks/useRunonProfile";
import HybridProtocolResult from "@/components/runon/HybridProtocolResult";
import { generateProtocol } from "@/lib/runonProtocol";
import {
  RC, mono, raj, HexBackdrop, IconBox, RBadge, SectionCard, StatCard, Chip,
} from "@/components/runon/runonUi";
import {
  sessionTypes, weeklyPlans, racePreps, nutritionPrinciples, dayMacros,
  hybridStack, muscleGuardRules, severityColors, annualPeriodization,
  transitionRules, overviewPillars,
} from "@/data/runonData";
import {
  ScienceTab, BodybuilderTab, MastersTab, PharmaTab, PeptidesTab, FuelTab, MonitorTab,
} from "@/components/runon/hybridTabs";
import RaceModeBar from "@/components/runon/RaceModeBar";
import StridePlannerCard from "@/components/runon/StridePlannerCard";
import RaceFuelMatrix from "@/components/runon/RaceFuelMatrix";
import {
  RaceModeConfig, defaultRaceMode, loadRaceMode, saveRaceMode,
} from "@/lib/raceMode";
import {
  StrideLabTab, ShoeTab, HrvTab, BfrTab, JointTab, RestoreTab, WeatherTab,
  MindTab, CouchTab, RanksTab, IntegrationsTab,
} from "@/components/runon/expertTabs";
import {
  ShoppingBag, Lock, ShieldPlus, CloudSun, Sparkles, Brain, Rocket, Trophy, Network,
} from "lucide-react";


type TabId =
  | "overview" | "sessoes" | "semana" | "race" | "nutrition" | "guard" | "periodizacao"
  | "ciencia" | "bbsplit" | "mestres" | "farmaco" | "peptideos" | "fuel" | "monitor"
  | "stride" | "shoes" | "hrv" | "bfr" | "joint" | "restore" | "weather" | "mind"
  | "couch" | "ranks" | "integra";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "overview", label: "OVERVIEW", icon: LayoutDashboard },
  { id: "sessoes", label: "SESSÕES", icon: Activity },
  { id: "semana", label: "SEMANAL", icon: Calendar },
  { id: "race", label: "RACE PREP", icon: Flag },
  { id: "nutrition", label: "NUTRITION", icon: Utensils },
  { id: "guard", label: "MUSCLE GUARD", icon: Shield },
  { id: "periodizacao", label: "PERIODIZAÇÃO", icon: BarChart3 },
  { id: "stride", label: "STRIDE LAB", icon: Footprints },
  { id: "shoes", label: "SHOE SELECTOR", icon: ShoppingBag },
  { id: "hrv", label: "HRV READINESS", icon: HeartPulse },
  { id: "bfr", label: "FLOW LOCK", icon: Lock },
  { id: "joint", label: "JOINT SHIELD", icon: ShieldPlus },
  { id: "restore", label: "RESTORE ENGINE", icon: Sparkles },
  { id: "weather", label: "WEATHER SHIELD", icon: CloudSun },
  { id: "mind", label: "MIND TRACK", icon: Brain },
  { id: "couch", label: "COUCH TO RUNON", icon: Rocket },
  { id: "ranks", label: "RANKS", icon: Trophy },
  { id: "integra", label: "INTEGRAÇÕES", icon: Network },
  { id: "ciencia", label: "CIÊNCIA", icon: Atom },
  { id: "bbsplit", label: "BB SPLIT", icon: Dumbbell },
  { id: "mestres", label: "MESTRES", icon: Users },
  { id: "farmaco", label: "FARMACOLOGIA", icon: FlaskConical },
  { id: "peptideos", label: "PEPTÍDEOS", icon: Syringe },
  { id: "fuel", label: "FUEL MATRIX", icon: Fuel },
  { id: "monitor", label: "MONITOR", icon: HeartPulse },
];


const SESSION_ICONS: Record<string, any> = {
  easy: Heart, long: Route, tempo: Gauge, intervals: Flame, incline: TrendingUp, fartlek: Shuffle,
};

const PILLAR_ICONS: any[] = [Footprints, ShieldCheck, GitBranch, Utensils, Flag, CalendarDays];
const NUTRI_ICONS: any[] = [Fuel, BarChart3, Timer];
const TRANSITION_ICONS: any[] = [RefreshCw, AlertTriangle, Target, Scale, ShieldAlert, HeartPulse];

const REFERENCES = [
  { name: "Nick Bare", desc: "Bodybuilder que virou ultramaratonista — o arquétipo hybrid moderno.", tag: "HYBRID ATHLETE" },
  { name: "Fergus Crawley", desc: "Sub-5 na milha, 500kg total no powerlifting, maratona sub-3.", tag: "STRENGTH + ENDURANCE" },
  { name: "Alex Viada", desc: "Autor do The Hybrid Athlete — base científica da periodização conjugada.", tag: "REFERÊNCIA TÉCNICA" },
];

/* ─────────── PERFIL ─────────── */
function ProfileSummary({ p, onEdit, onGenerate, hasProtocol, lastGeneratedAt }: { p: HybridProfile; onEdit: () => void; onGenerate: () => void; hasProtocol?: boolean; lastGeneratedAt?: string }) {
  const items: [string, string][] = [
    ["NOME", p.nome || "—"],
    ["PESO", p.peso ? `${p.peso} kg` : "—"],
    ["OBJETIVO", p.objetivo || "—"],
    ["SPLIT", p.split || "—"],
    ["NÍVEL CORRIDA", p.nivelCorrida || "—"],
    ["DISTÂNCIA ALVO", p.temProva ? p.distanciaAlvo || "—" : p.objetivoGeral || "—"],
    ["STATUS AEGIS", p.usoErgogenicos || "NÃO INFORMADO"],
  ];
  return (
    <SectionCard label="SEU PERFIL HYBRID" icon={Users}>
      <div className="flex justify-end -mt-10 mb-4">
        <button
          onClick={onEdit}
          style={{ ...mono(7, RC.cyan, 2), border: `1px solid ${RC.cyan}22`, borderRadius: 4, padding: "5px 12px" }}
        >
          EDITAR
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map(([l, v]) => <StatCard key={l} label={l} value={v} />)}
      </div>
      <button
        onClick={onGenerate}
        className="w-full mt-4 flex items-center justify-center gap-2"
        style={{
          ...mono(9, "#020205", 3),
          background: "linear-gradient(135deg, #00D4FF, #00B4DD)",
          fontWeight: 700, padding: 14, borderRadius: 8, boxShadow: `0 0 20px ${RC.cyanGlow}`,
        }}
      >
        <RotateCcw style={{ width: 14, height: 14 }} />
        {hasProtocol ? "RECALCULAR MEU PROTOCOLO RUNON" : "GERAR MEU PROTOCOLO RUNON"}
      </button>
      {hasProtocol && lastGeneratedAt && (
        <p style={{ ...mono(6, RC.mutedDark, 2), textAlign: "center", marginTop: 8 }}>
          ÚLTIMO CÁLCULO ·{" "}
          {new Date(lastGeneratedAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
          {" "}· USA OS DADOS DO WIZARD
        </p>
      )}
    </SectionCard>
  );
}

/* ─────────── OVERVIEW ─────────── */
function OverviewTab() {
  const [editing, setEditing] = useState(false);
  const [aegisOpen, setAegisOpen] = useState(false);
  const { profile, protocol, saveProfile: persistProfile, saveProtocol } = useRunonProfile();
  const { toast } = useToast();
  const navigate = useNavigate();


  const runGenerate = (p: HybridProfile) => {
    const generated = generateProtocol(p);
    saveProtocol(generated);
    toast({
      title: "Protocolo RunON gerado",
      description: `${generated.runSessions} sessões de corrida · risco de interferência ${generated.riskLabel.toLowerCase()}.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Desafio 21 Dias */}
      <div
        className="desafio-banner"
        style={{
          background: "linear-gradient(135deg, #020205, #0a1a2a)",
          border: "1px solid rgba(0,212,255,0.25)",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center gap-2">
              <Flame style={{ width: 16, height: 16, color: "#FFB800" }} />
              <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: "#F5F0E8" }}>
                DESAFIO 21 DIAS — ATLETA HÍBRIDO
              </h3>
            </div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 11, color: "#7a8a99", marginTop: 6 }}>
              "Corra. Levante. Prove que dá pra fazer os dois."
            </p>
          </div>
          <button
            type="button"
            aria-label="Começar o Desafio 21 Dias"
            onClick={() => navigate("/runon/desafio-21")}
            style={{
              background: "#00D4FF",
              color: "#020205",
              borderRadius: 8,
              padding: "12px 22px",
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            COMEÇAR DESAFIO
          </button>
        </div>
      </div>

      {/* O problema */}

      <div
        style={{
          background: `linear-gradient(135deg, ${RC.card}, ${RC.bg2})`,
          border: `1px solid ${RC.cyanGlow}`,
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div className="flex items-start gap-3">
          <IconBox icon={Zap} color={RC.cyan} size={40} iconSize={20} />
          <div className="flex-1">
            <p style={mono(7, RC.cyan, 3)}>O PROBLEMA</p>
            <h3 style={{ ...raj(20, 700), marginTop: 6 }}>
              <span style={{ color: RC.cyan }}>Interferência Concorrente</span>
            </h3>
          </div>
        </div>
        <p style={{ fontSize: 13, color: RC.muted, lineHeight: 1.7, marginTop: 12 }}>
          Treino de força ativa mTOR (síntese proteica). Endurance ativa AMPK (eficiência energética).
          Quando as duas vias competem no mesmo dia e no mesmo grupamento, a hipertrofia perde.
          O RunON organiza a semana com <span style={{ color: RC.cyan }}>periodização conjugada</span> para
          que corrida e musculação se somem em vez de se anularem — separando estímulos por tempo,
          grupamento e combustível.
        </p>
      </div>

      {/* Pilares */}
      <SectionCard label="PILARES DO SISTEMA" icon={Shield}>
        <div className="space-y-0">
          {overviewPillars.map((p, i) => {
            const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
            return (
              <div
                key={p.name}
                className="flex items-start gap-3 py-3"
                style={{ borderBottom: i < overviewPillars.length - 1 ? `1px solid ${RC.bg2}` : "none" }}
              >
                <IconBox icon={Icon} color={RC.cyan} size={36} iconSize={18} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 700, color: RC.white }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: "#555", lineHeight: 1.5, marginTop: 3 }}>{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Perfil / wizard */}
      {editing || !profile ? (
        <SectionCard label="SEU PERFIL HYBRID" icon={Users}>
          <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 14 }}>
            Preencha para receber seu protocolo integrado de corrida + musculação.
          </p>
          <HybridProfileWizard
            initial={profile}
            onCancel={profile ? () => setEditing(false) : undefined}
            onSave={(p) => {
              persistProfile(p);
              setEditing(false);
              runGenerate(p);
            }}
          />
        </SectionCard>
      ) : (
        <>
          <ProfileSummary
            p={profile}
            onEdit={() => setEditing(true)}
            onGenerate={() => runGenerate(profile)}
            hasProtocol={!!protocol}
            lastGeneratedAt={protocol?.generatedAt}
          />
          {protocol && <HybridProtocolResult protocol={protocol} onRegenerate={() => runGenerate(profile)} />}
        </>
      )}

      <AegisCard onOpen={() => setAegisOpen(true)} />

      {/* Referências */}
      <SectionCard label="REFERÊNCIAS DO MODELO HÍBRIDO" icon={Users}>
        {REFERENCES.map((r, i) => (
          <div
            key={r.name}
            className="flex items-start justify-between gap-3 py-3"
            style={{ borderBottom: i < REFERENCES.length - 1 ? `1px solid ${RC.bg2}` : "none" }}
          >
            <div className="min-w-0">
              <p style={{ fontSize: 14, fontWeight: 700, color: RC.white }}>{r.name}</p>
              <p style={{ fontSize: 12, color: "#555", marginTop: 2, lineHeight: 1.5 }}>{r.desc}</p>
            </div>
            <RBadge color={RC.cyan}>{r.tag}</RBadge>
          </div>
        ))}
      </SectionCard>

      {aegisOpen && <AegisPanel profile={profile} onClose={() => setAegisOpen(false)} />}
    </div>
  );
}

/* ─────────── SESSÕES ─────────── */
function SessionsTab() {
  const [open, setOpen] = useState<string | null>(sessionTypes[0].id);
  return (
    <div className="space-y-3">
      {sessionTypes.map((s) => {
        const Icon = SESSION_ICONS[s.id] ?? Activity;
        const expanded = open === s.id;
        return (
          <div
            key={s.id}
            style={{
              background: RC.card,
              border: `1px solid ${expanded ? `${s.color}33` : RC.border}`,
              borderRadius: 10,
              padding: expanded ? 20 : "16px 20px",
              boxShadow: expanded ? `0 0 20px ${s.color}08` : "none",
              transition: "all 0.3s ease",
            }}
          >
            <button onClick={() => setOpen(expanded ? null : s.id)} className="w-full flex items-center gap-3 text-left">
              <IconBox icon={Icon} color={s.color} size={40} iconSize={18} />
              <div className="flex-1 min-w-0">
                <p style={raj(16, 700)}>{s.name}</p>
                <p style={mono(8, RC.mutedDark, 1)}>{s.aka}</p>
              </div>
              <RBadge color={s.color}>{s.zone}</RBadge>
              <ChevronDown
                className="w-4 h-4 transition-transform shrink-0"
                style={{ color: "#444", transform: expanded ? "rotate(180deg)" : "none" }}
              />
            </button>

            {expanded && (
              <div className="mt-4 space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="FC" value={s.hrRange} color={s.color} />
                  <StatCard label="PACE" value={s.pace} color={s.color} />
                  <StatCard label="DURAÇÃO" value={s.duration} color={s.color} />
                  <StatCard label="FREQUÊNCIA" value={s.frequency} color={s.color} />
                </div>

                <div style={{ borderLeft: `3px solid ${s.color}`, background: RC.bg2, padding: "12px 16px", borderRadius: 6 }}>
                  <p style={mono(6, RC.mutedDark, 3)}>PROPÓSITO</p>
                  <p style={{ fontSize: 13, color: RC.muted, lineHeight: 1.6, marginTop: 4 }}>{s.purpose}</p>
                </div>

                <div>
                  {s.tips.map((t, i) => (
                    <div
                      key={t}
                      className="flex gap-2 py-2"
                      style={{ borderBottom: i < s.tips.length - 1 ? `1px solid ${RC.bg2}` : "none" }}
                    >
                      <span style={{ ...mono(10, s.color, 0), textTransform: "none" }}>→</span>
                      <span style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────── SEMANAL ─────────── */
function WeeklyTab() {
  const [phase, setPhase] = useState(weeklyPlans[0].id);
  const plan = weeklyPlans.find((p) => p.id === phase)!;
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {weeklyPlans.map((p) => (
          <Chip key={p.id} active={p.id === phase} color={p.color} onClick={() => setPhase(p.id)}>
            {p.name}
          </Chip>
        ))}
      </div>

      <SectionCard accent={plan.color}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p style={raj(18, 700, plan.color)}>{plan.name}</p>
            <p style={mono(8, RC.mutedDark, 1)}>{plan.weeks}</p>
          </div>
          <RBadge color={plan.color}>{plan.volume.km}</RBadge>
        </div>

        <div className="mt-5">
          <div className="grid grid-cols-3 gap-2 pb-2" style={{ borderBottom: `2px solid ${RC.border}` }}>
            <span style={mono(6, RC.mutedDark, 3)}>DIA</span>
            <span style={mono(6, RC.mutedDark, 3)}>MANHÃ</span>
            <span style={mono(6, RC.mutedDark, 3)}>TARDE</span>
          </div>
          {plan.days.map((d) => (
            <div key={d.day} className="grid grid-cols-3 gap-2 py-3" style={{ borderBottom: `1px solid ${RC.bg2}` }}>
              <span style={raj(13, 700, d.color ?? RC.mutedDark)}>{d.day}</span>
              <span style={{ fontSize: 12, fontWeight: d.color ? 600 : 500, color: d.color ?? RC.white }}>{d.am}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: d.pm !== "—" && d.color ? 600 : 500,
                  color: d.pm === "—" ? RC.border : (d.color ?? RC.white),
                }}
              >
                {d.pm}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div style={{ background: RC.bg2, border: `1px solid ${RC.border}`, borderRadius: 8, padding: 14 }}>
            <div className="flex items-center gap-1.5">
              <Route style={{ width: 14, height: 14, color: RC.cyan }} />
              <span style={mono(6, RC.mutedDark, 3)}>CORRIDA</span>
            </div>
            <p style={{ ...raj(16, 700, RC.cyan), marginTop: 6 }}>{plan.volume.km}</p>
          </div>
          <div style={{ background: RC.bg2, border: `1px solid ${RC.border}`, borderRadius: 8, padding: 14 }}>
            <div className="flex items-center gap-1.5">
              <Dumbbell style={{ width: 14, height: 14, color: RC.green }} />
              <span style={mono(6, RC.mutedDark, 3)}>MUSCULAÇÃO</span>
            </div>
            <p style={{ ...raj(16, 700, RC.white), marginTop: 6 }}>{plan.volume.strength}</p>
          </div>
          <div style={{ background: RC.bg2, border: `1px solid ${RC.border}`, borderRadius: 8, padding: 14 }}>
            <div className="flex items-center gap-1.5">
              <Activity style={{ width: 14, height: 14, color: RC.orange }} />
              <span style={mono(6, RC.mutedDark, 3)}>TOTAL CARDIO</span>
            </div>
            <p style={{ ...raj(16, 700, RC.white), marginTop: 6 }}>{plan.volume.cardio}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ─────────── RACE PREP ─────────── */
function RaceTab({ raceMode, onRaceMode }: { raceMode: RaceModeConfig; onRaceMode: (c: RaceModeConfig) => void }) {
  const [race, setRace] = useState(racePreps[0].id);
  const r = racePreps.find((x) => x.id === race)!;
  return (
    <div className="space-y-4">
      <RaceModeBar cfg={raceMode} onChange={onRaceMode} />
      {raceMode.enabled && <StridePlannerCard cfg={raceMode} />}

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {racePreps.map((p) => (
          <Chip key={p.id} active={p.id === race} color={p.color} onClick={() => setRace(p.id)}>
            {p.distance}
          </Chip>
        ))}
      </div>

      <SectionCard accent={r.color}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p style={raj(36, 900, r.color)}>{r.distance}</p>
            <p style={mono(8, RC.mutedDark, 1)}>{r.level}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="DURAÇÃO" value={r.weeks} color={r.color} />
            <StatCard label="PACE ALVO" value={r.targetPace} color={r.color} />
          </div>
        </div>

        <div className="relative mt-6 pl-6">
          <div className="absolute top-1 bottom-1" style={{ left: 0, width: 2, background: `${r.color}22` }} />
          {r.phases.map((ph) => (
            <div key={ph.name} className="relative mb-3">
              <span
                className="absolute rounded-full"
                style={{ left: -25, top: 14, width: 10, height: 10, background: r.color, border: `2px solid ${RC.bg}` }}
              />
              <div style={{ background: `${r.color}06`, border: `1px solid ${r.color}22`, borderRadius: 8, padding: "14px 18px" }}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p style={raj(14, 700, r.color)}>{ph.name}</p>
                  <span style={mono(8, RC.mutedDark, 1)}>{ph.weeks}</span>
                </div>
                <p style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginTop: 6 }}>{ph.focus}</p>
                <div className="mt-2"><RBadge color={r.color}>{ph.volume}</RBadge></div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ─────────── NUTRITION ─────────── */
function NutritionTab() {
  return (
    <div className="space-y-4">
      <SectionCard label="PRINCÍPIOS DO NUTRITION BRIDGE" icon={Utensils}>
        {nutritionPrinciples.map((p, i) => {
          const Icon = NUTRI_ICONS[i % NUTRI_ICONS.length];
          return (
            <div
              key={p.name}
              className="flex items-start gap-3 py-3"
              style={{ borderBottom: i < nutritionPrinciples.length - 1 ? `1px solid ${RC.bg2}` : "none" }}
            >
              <IconBox icon={Icon} color={RC.cyan} size={36} iconSize={18} />
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13, fontWeight: 700, color: RC.white }}>{p.name}</p>
                <p style={{ fontSize: 11, color: "#555", lineHeight: 1.5, marginTop: 3 }}>{p.desc}</p>
              </div>
            </div>
          );
        })}
      </SectionCard>

      <SectionCard label="MACROS POR TIPO DE DIA" icon={BarChart3}>
        <div className="space-y-3">
          {dayMacros.map((d, i) => (
            <div
              key={d.type}
              className="animate-fade-in"
              style={{
                borderLeft: `3px solid ${d.color}`,
                background: RC.bg2,
                padding: "14px 16px",
                borderRadius: 6,
                animationDelay: `${i * 60}ms`,
              }}
            >
              <p style={mono(8, d.color, 2)}>{d.type}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {[["PROTEÍNA", d.protein], ["CARB", d.carb], ["GORDURA", d.fat], ["KCAL", d.kcal]].map(([l, v]) => (
                  <div key={l}>
                    <p style={mono(6, RC.mutedDark, 3)}>{l}</p>
                    <p style={{ ...raj(14, 600), marginTop: 2 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard label="SUPLEMENTAÇÃO · HYBRID STACK" icon={Fuel}>
        <div className="grid grid-cols-3 gap-2 pb-2" style={{ borderBottom: `2px solid ${RC.border}` }}>
          <span style={mono(6, RC.mutedDark, 3)}>SUPLEMENTO</span>
          <span style={mono(6, RC.mutedDark, 3)}>DOSE</span>
          <span style={mono(6, RC.mutedDark, 3)}>NOTA</span>
        </div>
        {hybridStack.map((s) => (
          <div key={s.name} className="grid grid-cols-3 gap-2 py-3 runon-row" style={{ borderBottom: `1px solid ${RC.bg2}` }}>
            <span style={raj(14, 600, RC.cyan)}>{s.name}</span>
            <span style={{ fontSize: 13, color: RC.white }}>{s.dose}</span>
            <span style={{ fontSize: 12, color: "#555", fontStyle: "italic" }}>{s.note}</span>
          </div>
        ))}
      </SectionCard>
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
          <div
            key={r.id}
            className="runon-card"
            style={{
              background: RC.card,
              border: `1px solid ${RC.border}`,
              borderLeft: `3px solid ${color}`,
              borderRadius: 10,
              padding: 20,
              transition: "border-color 0.3s ease",
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`rounded-full ${r.severity === "critical" ? "animate-pulse" : ""}`}
                style={{ width: 8, height: 8, background: color, display: "inline-block", boxShadow: `0 0 8px ${color}` }}
              />
              <p style={raj(15, 700)}>{r.title}</p>
              <RBadge color={color}>{r.severity.toUpperCase()}</RBadge>
            </div>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginTop: 10 }}>{r.desc}</p>
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
      <div className="flex gap-[3px]">
        {annualPeriodization.map((b) => (
          <div
            key={b.id}
            style={{ flex: 1, height: 8, borderRadius: 4, background: b.color, boxShadow: `0 0 8px ${b.color}22` }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {annualPeriodization.map((b) => (
          <div key={b.id} style={{ background: `${b.color}04`, border: `1px solid ${b.color}22`, borderRadius: 10, padding: 20 }}>
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p style={raj(15, 700, b.color)}>{b.name}</p>
              <RBadge color={b.color}>{b.months}</RBadge>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <p style={mono(6, RC.green, 3)}>MUSCULAÇÃO</p>
                <p style={{ fontSize: 12, color: RC.white, marginTop: 4, lineHeight: 1.5 }}>{b.strength}</p>
              </div>
              <div>
                <p style={mono(6, RC.cyan, 3)}>CORRIDA</p>
                <p style={{ fontSize: 12, color: RC.white, marginTop: 4, lineHeight: 1.5 }}>{b.running}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SectionCard label="REGRAS DE TRANSIÇÃO" icon={AlertTriangle}>
        {transitionRules.map((t, i) => {
          const Icon = TRANSITION_ICONS[i % TRANSITION_ICONS.length];
          return (
            <div
              key={t}
              className="flex items-start gap-3 py-3"
              style={{ borderBottom: i < transitionRules.length - 1 ? `1px solid ${RC.bg2}` : "none" }}
            >
              <Icon style={{ width: 16, height: 16, color: RC.cyan, marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{t}</span>
            </div>
          );
        })}
      </SectionCard>
    </div>
  );
}

/* ─────────── PAGE ─────────── */
export default function RunOnPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("overview");
  const [raceMode, setRaceMode] = useState<RaceModeConfig>(() => {
    const saved = loadRaceMode();
    if (saved) return saved;
    const p = loadProfile();
    const dist = (["5k", "10k", "21k", "42k"] as const).find(
      (d) => (p?.distanciaAlvo || "").toLowerCase().replace(/\s/g, "").includes(d),
    );
    return defaultRaceMode(dist ?? "10k", Number(p?.peso) || 75);
  });

  const updateRaceMode = (c: RaceModeConfig) => {
    setRaceMode(c);
    saveRaceMode(c);
  };


  return (
    <div className="min-h-screen pb-28 relative" style={{ background: RC.bg }}>
      <HexBackdrop />

      {/* TOPBAR */}
      <div
        className="sticky top-0"
        style={{
          zIndex: 50,
          background: "rgba(2,2,5,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid #00D4FF18`,
        }}
      >
        <div className="mx-auto px-4 py-4" style={{ maxWidth: 980 }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <IconBox icon={Zap} color={RC.cyan} size={52} iconSize={26} />
              <div className="min-w-0">
                <p style={mono(6, RC.mutedDark, 3)}>
                  nutriON <span style={{ color: RC.mutedDark }}>·</span> Performance Hub{" "}
                  <span style={{ color: RC.mutedDark }}>·</span> <span style={{ color: RC.cyan }}>RunON</span>
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h1 style={raj(28, 700)}>
                    RUN<span style={{ color: RC.cyan }}>ON</span>
                  </h1>
                  <span
                    style={{
                      ...mono(7, RC.cyan, 2),
                      border: `1px solid ${RC.cyan}44`,
                      padding: "2px 8px",
                      borderRadius: 3,
                    }}
                  >
                    HYBRID
                  </span>
                </div>
                <p style={{ ...mono(7, RC.mutedDark, 1), marginTop: 2 }}>
                  Hybrid Performance Engine · Periodização Conjugada · Muscle Guard · Race Architecture
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                onClick={() => navigate("/coach/dashboard")}
                className="runon-back"
                style={{ ...mono(7, RC.cyan, 2), border: `1px solid ${RC.cyan}22`, borderRadius: 4, padding: "6px 12px" }}
              >
                ← VOLTAR
              </button>
              <div
                className="flex items-center gap-1.5"
                style={{ border: `1px solid ${RC.cyan}22`, borderRadius: 12, padding: "4px 10px" }}
              >
                <span
                  className="rounded-full animate-pulse"
                  style={{ width: 8, height: 8, background: RC.cyan, display: "inline-block" }}
                />
                <span style={mono(6, "#00D4FF66", 2)}>SISTEMA ATIVO</span>
              </div>
            </div>
          </div>

          <div style={{ height: 1, margin: "16px 0", background: "linear-gradient(90deg, transparent, #00D4FF22, transparent)" }} />

          {/* TABS */}
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex items-center gap-1.5 whitespace-nowrap runon-tab"
                  style={{
                    ...mono(7, active ? RC.cyan : "#444", 2),
                    padding: "10px 16px",
                    borderRadius: 6,
                    background: active ? "#00D4FF0a" : "transparent",
                    border: `1px solid ${active ? RC.cyanBorder : "transparent"}`,
                    boxShadow: active ? "0 0 12px #00D4FF08" : "none",
                  }}
                >
                  <t.icon style={{ width: 13, height: 13 }} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto px-4 pt-5 relative" style={{ maxWidth: 980, zIndex: 1 }}>
        {tab === "overview" && <OverviewTab />}
        {tab === "sessoes" && <SessionsTab />}
        {tab === "semana" && <WeeklyTab />}
        {tab === "race" && <RaceTab raceMode={raceMode} onRaceMode={updateRaceMode} />}
        {tab === "nutrition" && <NutritionTab />}
        {tab === "guard" && <GuardTab />}
        {tab === "periodizacao" && <PeriodizationTab />}
        {tab === "stride" && <StrideLabTab />}
        {tab === "shoes" && <ShoeTab />}
        {tab === "hrv" && <HrvTab />}
        {tab === "bfr" && <BfrTab />}
        {tab === "joint" && <JointTab />}
        {tab === "restore" && <RestoreTab />}
        {tab === "weather" && <WeatherTab />}
        {tab === "mind" && <MindTab />}
        {tab === "couch" && <CouchTab />}
        {tab === "ranks" && <RanksTab />}
        {tab === "integra" && <IntegrationsTab />}

        {tab === "ciencia" && <ScienceTab />}
        {tab === "bbsplit" && <BodybuilderTab />}
        {tab === "mestres" && <MastersTab />}
        {tab === "farmaco" && <PharmaTab />}
        {tab === "peptideos" && <PeptidesTab />}
        {tab === "fuel" && (
          <div className="space-y-4">
            <RaceModeBar cfg={raceMode} onChange={updateRaceMode} />
            {raceMode.enabled && <RaceFuelMatrix cfg={raceMode} />}
            <FuelTab />
          </div>
        )}
        {tab === "monitor" && <MonitorTab />}

        <div className="text-center mt-10 pt-8" style={{ borderTop: `1px solid ${RC.border}` }}>
          <p style={mono(6, RC.mutedDark, 3)}>RUNON HYBRID PERFORMANCE ENGINE · NUTRION PLATFORM</p>
          <p style={{ ...mono(6, RC.mutedDark, 3), marginTop: 4 }}>DEVELOPED BY DIOGO MELLO · MCE METHOD · 2026</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
