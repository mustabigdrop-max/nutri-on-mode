import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import {
  useApex, DEFAULT_POSTURE, DEFAULT_FMS, DEFAULT_ROM, DEFAULT_MUSCLES,
  calcFmsTotal, calcPostureScore, calcRomScore, calcSymmetryScore,
  type PostureData, type FMSScores, type ROMData, type MuscleScores,
} from "@/hooks/useApex";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "overview" | "postura" | "fms" | "dor" | "mobilidade" | "shape" | "protocolo";

// ─── Constants ────────────────────────────────────────────────────────────────
const PURPLE = "#7890ff";
const GOLD   = "#e8a020";
const TEAL   = "#00f0b4";
const RED    = "#ff4444";

const SEV_COLOR: Record<string, string> = {
  none: TEAL, normal: TEAL, neutral: TEAL,
  mild: GOLD, increased: GOLD, decreased: GOLD, anterior: GOLD, posterior: GOLD, functional: GOLD,
  moderate: "#ff8c00", severe: RED, structural: RED,
};

const FMS_TESTS = [
  { id: "deep_squat",      name: "Deep Squat",             bilateral: false, desc: "Agachamento profundo com bastão sobre a cabeça. Avalia mobilidade bilateral MMSS/MMII e estabilidade." },
  { id: "hurdle_step",     name: "Hurdle Step",             bilateral: true,  desc: "Passo sobre obstáculo. Avalia estabilidade unipodal e mobilidade de quadril." },
  { id: "inline_lunge",    name: "Inline Lunge",            bilateral: true,  desc: "Avanço em linha. Avalia estabilidade, mobilidade de quadril e tornozelo." },
  { id: "shoulder_mob",    name: "Shoulder Mobility",       bilateral: true,  desc: "Mobilidade glenoumeral. Avalia extensão + rotação interna/externa combinadas." },
  { id: "active_slr",      name: "Active Straight Leg Raise", bilateral: true, desc: "Elevação de perna ativa. Avalia comprimento de isquiotibiais e estabilidade de core." },
  { id: "trunk_stability", name: "Trunk Stability Push-up", bilateral: false, desc: "Flexão com estabilidade de tronco. Avalia controle reflexivo do core." },
  { id: "rotary_stab",     name: "Rotary Stability",        bilateral: true,  desc: "Estabilidade multiplanar em quadrupedia. Avalia coordenação e estabilidade de tronco." },
] as const;

const PAIN_REGIONS = [
  "Cervical", "Torácica superior", "Torácica inferior", "Lombar",
  "Ombro esquerdo", "Ombro direito", "Cotovelo esquerdo", "Cotovelo direito",
  "Punho/Mão esquerda", "Punho/Mão direita",
  "Quadril esquerdo", "Quadril direito", "Joelho esquerdo", "Joelho direito",
  "Tornozelo/Pé esquerdo", "Tornozelo/Pé direito",
  "Glúteo esquerdo", "Glúteo direito", "Sacro/Cóccix",
  "Peitoral", "Abdômen", "Cabeça/Têmpora",
];

const ROM_JOINTS = [
  { section: "Tornozelo",           items: [
    { label: "Dorsiflexão E", lKey: "ankle_df_l" as const, norm: 20, critical: true },
    { label: "Dorsiflexão D", rKey: "ankle_df_r" as const, norm: 20, critical: true },
  ]},
  { section: "Quadril",             items: [
    { label: "Flexão E", lKey: "hip_flex_l" as const, norm: 120 },
    { label: "Flexão D", rKey: "hip_flex_r" as const, norm: 120 },
    { label: "Extensão E", lKey: "hip_ext_l" as const, norm: 20 },
    { label: "Extensão D", rKey: "hip_ext_r" as const, norm: 20 },
    { label: "Rot. Interna E", lKey: "hip_ir_l" as const, norm: 45 },
    { label: "Rot. Interna D", rKey: "hip_ir_r" as const, norm: 45 },
    { label: "Rot. Externa E", lKey: "hip_er_l" as const, norm: 45 },
    { label: "Rot. Externa D", rKey: "hip_er_r" as const, norm: 45 },
  ]},
  { section: "Ombro",               items: [
    { label: "Flexão E", lKey: "shoulder_flex_l" as const, norm: 180 },
    { label: "Flexão D", rKey: "shoulder_flex_r" as const, norm: 180 },
    { label: "Rot. Externa E", lKey: "shoulder_er_l" as const, norm: 90 },
    { label: "Rot. Externa D", rKey: "shoulder_er_r" as const, norm: 90 },
  ]},
  { section: "Coluna Torácica",     items: [
    { label: "Rotação E", lKey: "thoracic_rot_l" as const, norm: 45 },
    { label: "Rotação D", rKey: "thoracic_rot_r" as const, norm: 45 },
  ]},
  { section: "Coluna Cervical",     items: [
    { label: "Flexão", sKey: "cervical_flex" as const, norm: 45 },
    { label: "Extensão", sKey: "cervical_ext" as const, norm: 45 },
    { label: "Rotação E", lKey: "cervical_rot_l" as const, norm: 80 },
    { label: "Rotação D", rKey: "cervical_rot_r" as const, norm: 80 },
  ]},
] as const;

const MUSCLE_GROUPS: { id: keyof Omit<MuscleScores, "shape_goal">; label: string; side?: "L" | "R"; cluster: string }[] = [
  { id: "chest_upper",  label: "Peitoral Superior", cluster: "Peito" },
  { id: "chest_lower",  label: "Peitoral Inferior", cluster: "Peito" },
  { id: "shoulder_ant", label: "Deltoide Anterior",  cluster: "Ombros" },
  { id: "shoulder_lat", label: "Deltoide Lateral",   cluster: "Ombros" },
  { id: "shoulder_post",label: "Deltoide Posterior", cluster: "Ombros" },
  { id: "biceps_l",     label: "Bíceps",             cluster: "Braços", side: "L" },
  { id: "biceps_r",     label: "Bíceps",             cluster: "Braços", side: "R" },
  { id: "triceps_l",    label: "Tríceps",            cluster: "Braços", side: "L" },
  { id: "triceps_r",    label: "Tríceps",            cluster: "Braços", side: "R" },
  { id: "traps_upper",  label: "Trapézio Superior",  cluster: "Costas" },
  { id: "traps_mid",    label: "Trapézio Médio",     cluster: "Costas" },
  { id: "traps_lower",  label: "Trapézio Inferior",  cluster: "Costas" },
  { id: "lats",         label: "Grande Dorsal",      cluster: "Costas" },
  { id: "rhomboids",    label: "Romboides",          cluster: "Costas" },
  { id: "abs_rectus",   label: "Reto Abdominal",     cluster: "Core" },
  { id: "abs_obliques", label: "Oblíquos",           cluster: "Core" },
  { id: "erectors",     label: "Eretores",           cluster: "Core" },
  { id: "glute_max",    label: "Glúteo Máximo",      cluster: "Glúteos" },
  { id: "glute_med",    label: "Glúteo Médio",       cluster: "Glúteos" },
  { id: "quads_l",      label: "Quadríceps",         cluster: "Coxa", side: "L" },
  { id: "quads_r",      label: "Quadríceps",         cluster: "Coxa", side: "R" },
  { id: "hams_l",       label: "Posterior",          cluster: "Coxa", side: "L" },
  { id: "hams_r",       label: "Posterior",          cluster: "Coxa", side: "R" },
  { id: "calves_l",     label: "Panturrilha",        cluster: "Perna", side: "L" },
  { id: "calves_r",     label: "Panturrilha",        cluster: "Perna", side: "R" },
  { id: "adductors",    label: "Adutores",           cluster: "Coxa" },
];

// ─── Corrective protocol generator (rule-based, NASM CES model) ───────────────
const generateProtocol = (posture: PostureData, fms: FMSScores, rom: ROMData) => {
  const inhibit: string[] = [];
  const lengthen: string[] = [];
  const activate: string[] = [];
  const integrate: string[] = [];

  const sev = (v: string) => v === "moderate" || v === "severe";

  // Upper Crossed Syndrome
  if (sev(posture.upper_crossed) || sev(posture.forward_head)) {
    inhibit.push("Foam roll peitoral maior e menor (60s cada lado)");
    inhibit.push("Foam roll trapézio superior / elevador da escápula");
    lengthen.push("Alongamento de peitoral na porta — 3×30s");
    lengthen.push("Alongamento de escalenos / esternocleidomastoideo — 3×30s");
    activate.push("Retração escapular com banda — 3×15 reps, foco em trapézio inf/médio");
    activate.push("Flexão profunda de pescoço em decúbito — 3×10s hold");
    integrate.push("Cable face pull com retração escapular — 3×12");
  }

  // Lower Crossed Syndrome
  if (sev(posture.lower_crossed) || posture.pelvic_tilt === "anterior") {
    inhibit.push("Foam roll iliopsoas / TFL (60s cada lado)");
    inhibit.push("Foam roll reto femoral e eretor lombar");
    lengthen.push("Alongamento de iliopsoas — lunge baixo 3×45s");
    lengthen.push("Alongamento de reto femoral em decúbito ventral — 3×30s");
    activate.push("Ponte de glúteo com hold 2s no topo — 3×15 reps");
    activate.push("Clamshell com banda — 3×15 (glúteo médio)");
    integrate.push("Agachamento goblet com ênfase no empurrar de joelhos — 3×10");
  }

  // Pronation distortion
  if (sev(posture.pronation_dist)) {
    inhibit.push("Foam roll gastrocnêmio / sóleo / peroneais — 60s cada");
    lengthen.push("Alongamento de gastrocnêmio em step — 3×30s");
    activate.push("Elevação de calcanhar unipodal — 3×15");
    integrate.push("Agachamento unipodal com controle de varo/valgo — 3×8 cada lado");
  }

  // FMS: Deep Squat < 2
  if (fms.deep_squat < 2) {
    inhibit.push("Foam roll tornozelo e gastrocnêmio anterior");
    lengthen.push("Mobilização de tornozelo contra parede — 3×10 reps");
    lengthen.push("Extensão torácica com rolo — 3×10 repetições lentas");
    activate.push("Agachamento assistido com TRX ou espaldar — 3×10");
  }

  // FMS: Shoulder Mobility < 2
  const shoulderLow = Math.min(fms.shoulder_mob_l, fms.shoulder_mob_r) < 2;
  if (shoulderLow) {
    inhibit.push("Foam roll peitoral menor e grande dorsal");
    lengthen.push("Alongamento de peitoral + lat com bastão — 3×30s");
    activate.push("Rotação externa com banda — 3×15 reps lento");
    integrate.push("Face pull com rotação externa — 3×12");
  }

  // ROM: Ankle dorsiflexion deficit
  const ankleLow = (rom.ankle_df_l !== null && rom.ankle_df_l < 15) || (rom.ankle_df_r !== null && rom.ankle_df_r < 15);
  if (ankleLow) {
    lengthen.push("Mobilização de tornozelo com joelho dobrado — 3×15 reps");
    lengthen.push("Agachamento assistido em plano inclinado — 3×10");
  }

  // ROM: Hip IR deficit
  const hipIRLow = (rom.hip_ir_l !== null && rom.hip_ir_l < 30) || (rom.hip_ir_r !== null && rom.hip_ir_r < 30);
  if (hipIRLow) {
    lengthen.push("Piriforme stretch (figura 4) — 3×45s cada lado");
    activate.push("Clamshell reverso — 3×15");
  }

  // Defaults if nothing triggered
  if (inhibit.length === 0) inhibit.push("Foam roll global — 5 min, rolamento lento por cada grupo muscular");
  if (lengthen.length === 0) lengthen.push("Cadeia posterior completa: isquiotibiais + glúteos + lombar — 3×30s cada");
  if (activate.length === 0) activate.push("Ativação de glúteo médio e core profundo — 2×15 de cada");
  if (integrate.length === 0) integrate.push("Agachamento goblet + press unilateral — 3×10 cada");

  return { inhibit: [...new Set(inhibit)], lengthen: [...new Set(lengthen)], activate: [...new Set(activate)], integrate: [...new Set(integrate)] };
};

// ─── Shared UI components ─────────────────────────────────────────────────────
const ScoreRing = ({ score, color, size = 80 }: { score: number; color: string; size?: number }) => {
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="5" />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
      />
    </svg>
  );
};

const TabBtn = ({ id, label, active, color, onClick }: { id: Tab; label: string; active: boolean; color: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex-shrink-0 font-mono text-[.58rem] tracking-[.12em] px-3 py-2 transition-all duration-200"
    style={{
      color: active ? color : "#40406a",
      borderBottom: active ? `2px solid ${color}` : "2px solid transparent",
      background: active ? `${color}0a` : "transparent",
    }}
  >
    {label}
  </button>
);

const SevSelect = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
  <div className="flex flex-col gap-1">
    <span className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em] uppercase">{label}</span>
    <div className="grid grid-cols-4 gap-1">
      {["none","mild","moderate","severe"].map((s) => (
        <button key={s} onClick={() => onChange(s)}
          className="font-mono text-[.5rem] py-1.5 px-1 border rounded-[2px] transition-all duration-150 tracking-[.04em]"
          style={{
            borderColor: value === s ? `${SEV_COLOR[s]}55` : "rgba(255,255,255,.06)",
            background:  value === s ? `${SEV_COLOR[s]}14` : "transparent",
            color:       value === s ? SEV_COLOR[s] : "#40406a",
          }}
        >
          {s === "none" ? "OK" : s === "mild" ? "Leve" : s === "moderate" ? "Moderado" : "Grave"}
        </button>
      ))}
    </div>
  </div>
);

const FMSPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1.5">
    {[0,1,2,3].map((n) => {
      const col = n === 0 ? RED : n === 1 ? "#ff8c00" : n === 2 ? GOLD : TEAL;
      return (
        <button key={n} onClick={() => onChange(n)}
          className="w-9 h-9 font-heading text-[1rem] rounded-[2px] border transition-all duration-150 flex-shrink-0"
          style={{
            borderColor: value === n ? `${col}55` : "rgba(255,255,255,.08)",
            background:  value === n ? `${col}18` : "rgba(255,255,255,.03)",
            color:       value === n ? col : "#30304a",
            boxShadow:   value === n ? `0 0 10px ${col}30` : "none",
          }}
        >
          {n}
        </button>
      );
    })}
  </div>
);

const ROMInput = ({ value, norm, label, onChange }: { value: number | null; norm: number; label: string; onChange: (v: number | null) => void }) => {
  const pct = value !== null ? value / norm : null;
  const col = pct === null ? "#30304a" : pct >= 0.9 ? TEAL : pct >= 0.7 ? GOLD : RED;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="font-mono text-[.48rem] text-[#40406a] tracking-[.06em]">{label}</span>
        <span className="font-mono text-[.45rem]" style={{ color: col }}>norma {norm}°</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number" min={0} max={200}
          value={value ?? ""}
          placeholder="—"
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          className="w-full bg-transparent border-b font-mono text-[.75rem] py-1 outline-none text-center"
          style={{ borderColor: `${col}40`, color: col }}
        />
        <span className="font-mono text-[.5rem] text-[#30304a]">°</span>
      </div>
      {value !== null && (
        <div className="h-0.5 rounded-full" style={{ background: "rgba(255,255,255,.06)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: col }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (value / norm) * 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </div>
  );
};

const MuscleBar = ({ value, label, side, onChange }: { value: number; label: string; side?: string; onChange: (v: number) => void }) => {
  const col = value >= 7.5 ? TEAL : value >= 5 ? GOLD : value >= 3 ? "#ff8c00" : RED;
  const tag = value >= 7.5 ? "Forte" : value >= 5 ? "Médio" : value >= 3 ? "Fraco" : "Lagging";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="font-mono text-[.5rem] text-[#50507a] tracking-[.05em]">
          {label}{side ? ` ${side}` : ""}
        </span>
        <span className="font-mono text-[.48rem]" style={{ color: col }}>{tag}</span>
      </div>
      <div className="flex items-center gap-2">
        <input type="range" min={0} max={10} step={0.5} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1 appearance-none rounded-full cursor-pointer"
          style={{ accentColor: col, background: `linear-gradient(to right, ${col} ${value * 10}%, rgba(255,255,255,.08) ${value * 10}%)` }}
        />
        <span className="font-mono text-[.75rem] w-6 text-right flex-shrink-0" style={{ color: col }}>{value}</span>
      </div>
    </div>
  );
};

// ─── Tab: VISÃO GERAL ─────────────────────────────────────────────────────────
const OverviewTab = ({ assessment, onStartAssessment }: {
  assessment: ReturnType<typeof useApex>["latestAssessment"];
  onStartAssessment: () => void;
}) => {
  const scores = [
    { label: "POSTURA", value: assessment?.posture_score ?? 0,   color: PURPLE, desc: "Análise tridimensional" },
    { label: "FMS",     value: assessment?.fms_total ? Math.round((assessment.fms_total / 21) * 100) : 0, color: TEAL, desc: "Rastreio funcional" },
    { label: "MOBILIDADE", value: assessment?.mobility_score ?? 0, color: "#00c8ff", desc: "Amplitude articular" },
    { label: "SIMETRIA",   value: assessment?.symmetry_score ?? 0, color: GOLD,  desc: "Shape bilateral" },
  ];
  const overall = assessment?.overall_score ?? 0;
  const overallColor = overall >= 75 ? TEAL : overall >= 50 ? GOLD : overall > 0 ? "#ff8c00" : "#30304a";

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Overall score */}
      <div className="flex flex-col items-center py-8 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${overallColor}08, transparent)` }} />
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
          <ScoreRing score={overall} color={overallColor} size={140} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-[2.8rem] leading-none" style={{ color: overallColor, textShadow: `0 0 20px ${overallColor}50` }}>
              {overall}
            </span>
            <span className="font-mono text-[.48rem] text-[#40406a] tracking-[.2em]">APEX SCORE</span>
          </div>
        </div>
        <div className="mt-2 font-mono text-[.52rem] tracking-[.1em]" style={{ color: overallColor }}>
          {overall >= 75 ? "PERFORMANCE ELITE" : overall >= 50 ? "BOM — ESPAÇO PARA CRESCER" : overall > 0 ? "CORREÇÃO PRIORITÁRIA" : "AVALIAÇÃO PENDENTE"}
        </div>
      </div>

      {/* 4 sub-scores */}
      <div className="grid grid-cols-2 gap-2">
        {scores.map((s) => (
          <div key={s.label} className="border rounded-[3px] p-4 flex flex-col gap-3 relative overflow-hidden"
            style={{ borderColor: `${s.color}18`, background: "rgba(6,6,16,.9)" }}>
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
            <div className="flex justify-between items-start">
              <div>
                <div className="font-mono text-[.48rem] tracking-[.16em]" style={{ color: `${s.color}80` }}>{s.label}</div>
                <div className="font-mono text-[.44rem] text-[#30304a] mt-0.5">{s.desc}</div>
              </div>
              <span className="font-heading text-[1.6rem] leading-none" style={{ color: s.color }}>{s.value}</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,.06)" }}>
              <motion.div className="h-full rounded-full" style={{ background: s.color }}
                initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 0.9, delay: 0.2 }} />
            </div>
          </div>
        ))}
      </div>

      {!assessment && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="border border-dashed p-6 flex flex-col items-center gap-3 rounded-[3px]"
          style={{ borderColor: `${PURPLE}28` }}
        >
          <div className="font-mono text-[.55rem] text-[#50507a] tracking-[.12em] text-center">
            NENHUMA AVALIAÇÃO REALIZADA
          </div>
          <p className="font-landing text-[.78rem] text-[#40406a] text-center leading-[1.7]">
            Complete a avaliação para obter seu Apex Score e protocolo corretivo personalizado.
          </p>
          <button onClick={onStartAssessment}
            className="font-heading text-[.78rem] tracking-[.1em] px-6 py-3 transition-all duration-200 hover:scale-[1.02]"
            style={{ background: PURPLE, color: "#030310", clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
          >
            INICIAR AVALIAÇÃO APEX →
          </button>
        </motion.div>
      )}

      {assessment && (
        <div className="border p-4 rounded-[3px]" style={{ borderColor: `${TEAL}18`, background: "rgba(0,240,180,.02)" }}>
          <div className="font-mono text-[.5rem] text-[#00f0b4]/60 tracking-[.15em] mb-2">ÚLTIMA AVALIAÇÃO</div>
          <div className="font-mono text-[.72rem] text-[#f0edf8]/60">{assessment.assessment_date}</div>
          {assessment.notes && <p className="font-landing text-[.75rem] text-[#60607a] mt-2 leading-[1.6]">{assessment.notes}</p>}
        </div>
      )}
    </div>
  );
};

// ─── Tab: POSTURA ─────────────────────────────────────────────────────────────
const PosturaTab = ({ data, onChange }: { data: PostureData; onChange: (d: PostureData) => void }) => {
  const score = calcPostureScore(data);
  const syndromes = [
    { label: "Síndrome Cruzada Superior", key: "upper_crossed" as keyof PostureData, color: PURPLE,
      desc: "Ombros protusos, escápulas aladas, cabeça anterior. Comum em quem treina peito demais ou trabalha sentado." },
    { label: "Síndrome Cruzada Inferior", key: "lower_crossed" as keyof PostureData, color: GOLD,
      desc: "Hiperlordose, glúteo inibido, quadril flexionado. Comum em sedentários e atletas com hip flexor encurtado." },
    { label: "Distorção de Pronação",    key: "pronation_dist" as keyof PostureData, color: TEAL,
      desc: "Pé pronado → tíbia rotada → valgo de joelho → rotação interna de quadril. Cadeia cinética comprometida." },
  ];

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-heading text-[1.1rem] text-[#f0edf8]/80">Análise Postural</div>
          <div className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em]">3 PLANOS ANATÔMICOS · JANDA SYNDROMES</div>
        </div>
        <div className="text-right">
          <div className="font-heading text-[1.8rem] leading-none" style={{ color: score >= 70 ? TEAL : score >= 40 ? GOLD : RED }}>{score}</div>
          <div className="font-mono text-[.44rem] text-[#30304a] tracking-[.1em]">POSTURE SCORE</div>
        </div>
      </div>

      {/* Sagittal plane */}
      <div className="border rounded-[3px] p-4" style={{ borderColor: `${PURPLE}18`, background: "rgba(6,6,16,.9)" }}>
        <div className="font-mono text-[.5rem] text-[#7890ff]/70 tracking-[.16em] mb-4 flex items-center gap-2">
          <span className="w-3 h-px bg-current" /> PLANO SAGITAL — Vista Lateral
        </div>
        <div className="flex flex-col gap-4">
          <SevSelect value={data.forward_head} onChange={(v) => onChange({...data, forward_head: v})} label="Anteriorização de cabeça (cada cm = +4.5kg carga cervical)" />
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em] uppercase">Cifose torácica</span>
              <div className="grid grid-cols-4 gap-1">
                {[["normal","Normal"],["mild","Leve"],["moderate","Mod."],["severe","Grave"]].map(([v,l]) => (
                  <button key={v} onClick={() => onChange({...data, thoracic_kyphosis: v})}
                    className="font-mono text-[.48rem] py-1.5 border rounded-[2px] transition-all duration-150"
                    style={{ borderColor: data.thoracic_kyphosis === v ? `${SEV_COLOR[v]}55` : "rgba(255,255,255,.06)", background: data.thoracic_kyphosis === v ? `${SEV_COLOR[v]}14` : "transparent", color: data.thoracic_kyphosis === v ? SEV_COLOR[v] : "#40406a" }}
                  >{l}</button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em] uppercase">Lordose lombar</span>
              <div className="grid grid-cols-3 gap-1">
                {[["normal","Normal"],["increased","Aumentada"],["decreased","Reduzida"]].map(([v,l]) => (
                  <button key={v} onClick={() => onChange({...data, lumbar_lordosis: v})}
                    className="font-mono text-[.48rem] py-1 border rounded-[2px] transition-all duration-150"
                    style={{ borderColor: data.lumbar_lordosis === v ? `${SEV_COLOR[v]}55` : "rgba(255,255,255,.06)", background: data.lumbar_lordosis === v ? `${SEV_COLOR[v]}14` : "transparent", color: data.lumbar_lordosis === v ? SEV_COLOR[v] : "#40406a" }}
                  >{l}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em] uppercase">Inclinação pélvica</span>
            <div className="grid grid-cols-3 gap-1">
              {[["neutral","Neutro"],["anterior","Anterior"],["posterior","Posterior"]].map(([v,l]) => (
                <button key={v} onClick={() => onChange({...data, pelvic_tilt: v})}
                  className="font-mono text-[.5rem] py-2 border rounded-[2px] transition-all duration-150"
                  style={{ borderColor: data.pelvic_tilt === v ? `${SEV_COLOR[v]}55` : "rgba(255,255,255,.06)", background: data.pelvic_tilt === v ? `${SEV_COLOR[v]}14` : "transparent", color: data.pelvic_tilt === v ? SEV_COLOR[v] : "#40406a" }}
                >{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Frontal plane */}
      <div className="border rounded-[3px] p-4" style={{ borderColor: `${TEAL}14`, background: "rgba(6,6,16,.9)" }}>
        <div className="font-mono text-[.5rem] text-[#00f0b4]/70 tracking-[.16em] mb-4 flex items-center gap-2">
          <span className="w-3 h-px bg-current" /> PLANO FRONTAL — Vista Anterior/Posterior
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <SevSelect value={data.shoulder_asym} onChange={(v) => onChange({...data, shoulder_asym: v})} label="Assimetria de ombros" />
            <SevSelect value={data.hip_asym} onChange={(v) => onChange({...data, hip_asym: v})} label="Assimetria de quadril" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em] uppercase">Escoliose</span>
            <div className="grid grid-cols-3 gap-1">
              {[["none","Ausente"],["functional","Funcional"],["structural","Estrutural"]].map(([v,l]) => (
                <button key={v} onClick={() => onChange({...data, scoliosis: v})}
                  className="font-mono text-[.5rem] py-2 border rounded-[2px] transition-all"
                  style={{ borderColor: data.scoliosis === v ? `${SEV_COLOR[v]}55` : "rgba(255,255,255,.06)", background: data.scoliosis === v ? `${SEV_COLOR[v]}14` : "transparent", color: data.scoliosis === v ? SEV_COLOR[v] : "#40406a" }}
                >{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Janda syndromes */}
      <div className="flex flex-col gap-3">
        <div className="font-mono text-[.5rem] text-[#e8a020]/60 tracking-[.2em]">SÍNDROMES DE JANDA</div>
        {syndromes.map((s) => (
          <div key={s.key} className="border rounded-[3px] p-4" style={{ borderColor: `${s.color}18`, background: "rgba(6,6,16,.9)" }}>
            <div className="flex justify-between items-start mb-2">
              <div className="font-mono text-[.52rem]" style={{ color: `${s.color}90` }}>{s.label}</div>
              <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ background: SEV_COLOR[data[s.key]] ?? "#30304a", boxShadow: `0 0 6px ${SEV_COLOR[data[s.key]] ?? "#30304a"}` }} />
            </div>
            <p className="font-mono text-[.46rem] text-[#40406a] leading-[1.6] mb-3">{s.desc}</p>
            <SevSelect value={data[s.key]} onChange={(v) => onChange({...data, [s.key]: v})} label="" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Tab: FMS ─────────────────────────────────────────────────────────────────
const FMSTab = ({ scores, onChange }: { scores: FMSScores; onChange: (s: FMSScores) => void }) => {
  const total = calcFmsTotal(scores);
  const riskColor = total >= 14 ? TEAL : total >= 10 ? GOLD : RED;
  const riskLabel = total >= 14 ? "Risco baixo de lesão" : total >= 10 ? "Risco moderado" : "Risco elevado — 3× maior chance de lesão";

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-heading text-[1.1rem] text-[#f0edf8]/80">Functional Movement Screen</div>
          <div className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em]">FMS — COOK ET AL. 2006 · 7 TESTES</div>
        </div>
        <div className="text-right">
          <div className="font-heading text-[2rem] leading-none" style={{ color: riskColor }}>{total}<span className="text-[1rem] text-[#30304a]">/21</span></div>
          <div className="font-mono text-[.44rem] tracking-[.1em]" style={{ color: riskColor }}>{riskLabel}</div>
        </div>
      </div>

      {FMS_TESTS.map((test) => {
        const isLat = test.bilateral;
        const lKey = `${test.id}_l` as keyof FMSScores;
        const rKey = `${test.id}_r` as keyof FMSScores;
        const singleKey = test.id as keyof FMSScores;
        const lVal = isLat ? (scores[lKey] as number) : (scores[singleKey] as number);
        const rVal = isLat ? (scores[rKey] as number) : lVal;
        const worst = isLat ? Math.min(lVal, rVal) : lVal;
        const asymmetry = isLat && lVal !== rVal;
        const worstColor = worst === 0 ? RED : worst === 1 ? "#ff8c00" : worst === 2 ? GOLD : TEAL;

        return (
          <div key={test.id} className="border rounded-[3px] p-4 relative" style={{ borderColor: `${worstColor}20`, background: "rgba(6,6,16,.9)" }}>
            {asymmetry && (
              <div className="absolute top-2 right-2 font-mono text-[.44rem] text-[#ff8c00] tracking-[.08em] border border-[#ff8c00]/30 px-1.5 py-0.5 rounded-full">
                ASSIMETRIA
              </div>
            )}
            <div className="font-mono text-[.52rem] tracking-[.1em] mb-1" style={{ color: `${worstColor}90` }}>{test.name}</div>
            <p className="font-mono text-[.46rem] text-[#40406a] leading-[1.5] mb-4">{test.desc}</p>

            {isLat ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[.5rem] text-[#50507a] w-16 text-right tracking-[.05em]">ESQUERDO</span>
                  <FMSPicker value={lVal} onChange={(v) => onChange({ ...scores, [lKey]: v })} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[.5rem] text-[#50507a] w-16 text-right tracking-[.05em]">DIREITO</span>
                  <FMSPicker value={rVal} onChange={(v) => onChange({ ...scores, [rKey]: v })} />
                </div>
                <div className="font-mono text-[.46rem] text-[#30304a] tracking-[.06em]">Score computado: mínimo dos dois lados = <span style={{ color: worstColor }}>{worst}</span></div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="font-mono text-[.5rem] text-[#50507a] w-16 text-right tracking-[.05em]">BILATERAL</span>
                <FMSPicker value={lVal} onChange={(v) => onChange({ ...scores, [singleKey]: v })} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Tab: DOR ─────────────────────────────────────────────────────────────────
const DorTab = ({ pain, onAdd, onResolve }: {
  pain: ReturnType<typeof useApex>["activePain"];
  onAdd: (e: any) => Promise<void>;
  onResolve: (id: string) => Promise<void>;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    body_region: "", side: "central", pain_type: "local", quality: [] as string[],
    intensity: 5, behavior: "mechanical", onset_pattern: "post_workout", notes: "", red_flag: false,
  });

  const qualityOpts = ["Latejante", "Queimação", "Facada", "Peso", "Formigamento", "Irradiado", "Dormência", "Câimbra"];

  const intCol = (n: number) => n >= 8 ? RED : n >= 5 ? "#ff8c00" : n >= 3 ? GOLD : TEAL;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-heading text-[1.1rem] text-[#f0edf8]/80">Mapa de Dor</div>
          <div className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em]">PAIN SCIENCE · RED FLAGS · REFERIDAS</div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="font-mono text-[.55rem] tracking-[.1em] px-3 py-2 border transition-all duration-200"
          style={{ borderColor: `${RED}30`, color: RED, background: showForm ? `${RED}12` : "transparent" }}
        >
          {showForm ? "CANCELAR" : "+ ADICIONAR DOR"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="border rounded-[3px] p-4 flex flex-col gap-4 overflow-hidden"
            style={{ borderColor: `${RED}25`, background: "rgba(255,68,68,.025)" }}
          >
            <div className="font-mono text-[.5rem] text-[#ff4444]/70 tracking-[.16em]">NOVA ENTRADA DE DOR</div>

            <div className="flex flex-col gap-1">
              <span className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em] uppercase">Região</span>
              <select value={form.body_region} onChange={(e) => setForm({...form, body_region: e.target.value})}
                className="bg-[#060610] border border-[#ffffff]/08 font-mono text-[.62rem] text-[#f0edf8]/70 py-2 px-2 rounded-[2px] outline-none">
                <option value="">Selecionar região...</option>
                {PAIN_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[["local","Local"],["referred","Referida"],["radicular","Radicular"]].map(([v,l]) => (
                <button key={v} onClick={() => setForm({...form, pain_type: v})}
                  className="font-mono text-[.48rem] py-1.5 border rounded-[2px] transition-all"
                  style={{ borderColor: form.pain_type === v ? `${RED}45` : "rgba(255,255,255,.06)", background: form.pain_type === v ? `${RED}14` : "transparent", color: form.pain_type === v ? RED : "#40406a" }}
                >{l}</button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em] uppercase">Qualidade — selecione todas que se aplicam</span>
              <div className="flex flex-wrap gap-1.5">
                {qualityOpts.map((q) => (
                  <button key={q} onClick={() => setForm({...form, quality: form.quality.includes(q) ? form.quality.filter(x => x !== q) : [...form.quality, q]})}
                    className="font-mono text-[.48rem] px-2.5 py-1 border rounded-full transition-all"
                    style={{ borderColor: form.quality.includes(q) ? `${RED}45` : "rgba(255,255,255,.06)", background: form.quality.includes(q) ? `${RED}14` : "transparent", color: form.quality.includes(q) ? RED : "#40406a" }}
                  >{q}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em] uppercase">Intensidade</span>
                <span className="font-heading text-[1.2rem] leading-none" style={{ color: intCol(form.intensity) }}>{form.intensity}</span>
              </div>
              <input type="range" min={0} max={10} value={form.intensity}
                onChange={(e) => setForm({...form, intensity: Number(e.target.value)})}
                className="w-full h-1 appearance-none rounded-full cursor-pointer"
                style={{ accentColor: intCol(form.intensity) }}
              />
              <div className="flex justify-between font-mono text-[.44rem] text-[#30304a]">
                <span>Sem dor</span><span>Insuportável</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border border-[#ff4444]/20 bg-[#ff4444]/04 rounded-[2px] p-3">
              <input type="checkbox" id="redflag" checked={form.red_flag} onChange={(e) => setForm({...form, red_flag: e.target.checked})} />
              <label htmlFor="redflag" className="font-mono text-[.5rem] text-[#ff4444]/80 tracking-[.05em]">
                RED FLAG — Dor noturna intensa, perda de força/sensibilidade, alteração vesical/intestinal, febre associada
              </label>
            </div>

            <button
              disabled={!form.body_region}
              onClick={async () => { await onAdd(form); setShowForm(false); setForm({body_region:"",side:"central",pain_type:"local",quality:[],intensity:5,behavior:"mechanical",onset_pattern:"post_workout",notes:"",red_flag:false}); }}
              className="font-heading text-[.78rem] tracking-[.1em] py-3 transition-all disabled:opacity-40"
              style={{ background: RED, color: "#030310" }}
            >
              REGISTRAR DOR
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {pain.length === 0 ? (
        <div className="border border-dashed p-8 flex flex-col items-center gap-2 rounded-[3px]" style={{ borderColor: "rgba(255,255,255,.06)" }}>
          <div className="font-mono text-[.55rem] text-[#30304a] tracking-[.12em]">NENHUMA DOR ATIVA REGISTRADA</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pain.map((e) => {
            const col = (e.intensity ?? 0) >= 8 ? RED : (e.intensity ?? 0) >= 5 ? "#ff8c00" : GOLD;
            return (
              <motion.div key={e.id} layout
                className="border rounded-[3px] p-4 flex flex-col gap-2"
                style={{ borderColor: e.red_flag ? `${RED}40` : `${col}20`, background: e.red_flag ? `${RED}05` : "rgba(6,6,16,.9)" }}
              >
                {e.red_flag && (
                  <div className="font-mono text-[.46rem] text-[#ff4444] tracking-[.1em] border border-[#ff4444]/30 px-2 py-0.5 w-fit rounded-full">
                    ⚠ RED FLAG — CONSULTAR PROFISSIONAL
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono text-[.6rem]" style={{ color: col }}>{e.body_region}</div>
                    <div className="font-mono text-[.48rem] text-[#50507a] mt-0.5 capitalize">{e.pain_type} · {e.behavior}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-[1.4rem] leading-none" style={{ color: col }}>{e.intensity}</div>
                    <div className="font-mono text-[.4rem] text-[#30304a]">/10</div>
                  </div>
                </div>
                {e.quality?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {e.quality.map((q) => (
                      <span key={q} className="font-mono text-[.44rem] px-1.5 py-0.5 border rounded-full" style={{ borderColor: `${col}25`, color: `${col}80` }}>{q}</span>
                    ))}
                  </div>
                )}
                <button onClick={() => onResolve(e.id)}
                  className="self-start font-mono text-[.48rem] tracking-[.08em] text-[#50507a] border border-[#ffffff]/06 px-2.5 py-1 hover:border-[#00f0b4]/25 hover:text-[#00f0b4]/70 transition-all mt-1">
                  MARCAR COMO RESOLVIDA
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Tab: MOBILIDADE ──────────────────────────────────────────────────────────
const MobilidadeTab = ({ rom, onChange }: { rom: ROMData; onChange: (r: ROMData) => void }) => {
  const score = calcRomScore(rom);

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-heading text-[1.1rem] text-[#f0edf8]/80">Amplitude de Movimento</div>
          <div className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em]">ROM — NORMAS AAOS/AMA</div>
        </div>
        <div className="text-right">
          <div className="font-heading text-[1.8rem] leading-none" style={{ color: score >= 80 ? TEAL : score >= 60 ? GOLD : RED }}>{score}%</div>
          <div className="font-mono text-[.44rem] text-[#30304a] tracking-[.1em]">ARTICULAÇÕES OK</div>
        </div>
      </div>

      {ROM_JOINTS.map((section) => (
        <div key={section.section} className="border rounded-[3px] p-4" style={{ borderColor: "rgba(120,144,255,.14)", background: "rgba(6,6,16,.9)" }}>
          <div className="font-mono text-[.5rem] text-[#7890ff]/70 tracking-[.16em] mb-4 flex items-center gap-2">
            <span className="w-3 h-px bg-current" /> {section.section.toUpperCase()}
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            {section.items.map((item: any) => {
              const key = item.lKey ?? item.rKey ?? item.sKey;
              return (
                <ROMInput
                  key={key}
                  label={item.label}
                  norm={item.norm}
                  value={(rom as any)[key] as number | null}
                  onChange={(v) => onChange({ ...rom, [key]: v })}
                />
              );
            })}
          </div>
        </div>
      ))}

      <div className="border p-3 rounded-[3px]" style={{ borderColor: `${TEAL}18`, background: "rgba(0,240,180,.02)" }}>
        <div className="font-mono text-[.46rem] text-[#00f0b4]/60 leading-[1.7]">
          <span className="text-[#00f0b4]/90">Dorsiflexão crítica:</span> mínimo 15° para agachamento seguro. Déficit = compensação de lombar e joelho. ·
          <span className="text-[#00f0b4]/90"> Rotação interna de quadril:</span> &lt;30° indica piriformes/rotadores curtos → risco de lombar e patela. ·
          <span className="text-[#00f0b4]/90"> Rotação torácica:</span> &lt;30° = compensação cervical e glenoumeral.
        </div>
      </div>
    </div>
  );
};

// ─── Tab: SHAPE ───────────────────────────────────────────────────────────────
const ShapeTab = ({ muscles, onChange }: { muscles: MuscleScores; onChange: (m: MuscleScores) => void }) => {
  const symScore = calcSymmetryScore(muscles);
  const clusters = [...new Set(MUSCLE_GROUPS.map((g) => g.cluster))];
  const [activeCluster, setActiveCluster] = useState(clusters[0]);

  const shapeGoals = [
    { id: "v_taper",       label: "V-Taper",        desc: "Ombros largos + cintura estreita" },
    { id: "x_frame",       label: "X-Frame",        desc: "V-taper + coxas/glúteos" },
    { id: "physique",      label: "Physique",        desc: "Proporção + condicionamento" },
    { id: "strength",      label: "Força/Power",     desc: "Massa funcional + padrões" },
    { id: "rehabilitation", label: "Reabilitação",  desc: "Correção + retorno esporte" },
  ];

  const lagging = MUSCLE_GROUPS.filter((g) => (muscles[g.id] as number) < 4).map((g) => g.label);

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-heading text-[1.1rem] text-[#f0edf8]/80">Mapa de Shape</div>
          <div className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em]">26 GRUPOS MUSCULARES · SIMETRIA BILATERAL</div>
        </div>
        <div className="text-right">
          <div className="font-heading text-[1.8rem] leading-none" style={{ color: symScore >= 85 ? TEAL : symScore >= 70 ? GOLD : RED }}>{symScore}%</div>
          <div className="font-mono text-[.44rem] text-[#30304a] tracking-[.1em]">SIMETRIA</div>
        </div>
      </div>

      {/* Shape goal */}
      <div className="flex flex-col gap-2">
        <div className="font-mono text-[.5rem] text-[#50507a] tracking-[.14em] uppercase">Objetivo de Shape</div>
        <div className="grid grid-cols-2 gap-1.5">
          {shapeGoals.map((g) => (
            <button key={g.id} onClick={() => onChange({...muscles, shape_goal: g.id})}
              className="border rounded-[2px] p-3 text-left transition-all duration-200"
              style={{ borderColor: muscles.shape_goal === g.id ? `${GOLD}45` : "rgba(255,255,255,.06)", background: muscles.shape_goal === g.id ? `${GOLD}0e` : "rgba(6,6,16,.9)" }}
            >
              <div className="font-mono text-[.52rem]" style={{ color: muscles.shape_goal === g.id ? GOLD : "#50507a" }}>{g.label}</div>
              <div className="font-mono text-[.44rem] text-[#30304a] mt-0.5">{g.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Lagging alert */}
      {lagging.length > 0 && (
        <div className="border border-[#ff4444]/20 bg-[#ff4444]/03 rounded-[3px] p-3">
          <div className="font-mono text-[.48rem] text-[#ff4444]/80 tracking-[.1em] mb-1">PONTOS FRACOS — LAGGING MUSCLES</div>
          <div className="flex flex-wrap gap-1.5">
            {lagging.map((l) => (
              <span key={l} className="font-mono text-[.46rem] px-2 py-0.5 border border-[#ff4444]/25 text-[#ff4444]/70 rounded-full">{l}</span>
            ))}
          </div>
        </div>
      )}

      {/* Cluster tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {clusters.map((c) => (
          <button key={c} onClick={() => setActiveCluster(c)}
            className="flex-shrink-0 font-mono text-[.5rem] px-3 py-1.5 border rounded-full transition-all"
            style={{ borderColor: activeCluster === c ? `${GOLD}45` : "rgba(255,255,255,.06)", background: activeCluster === c ? `${GOLD}0e` : "transparent", color: activeCluster === c ? GOLD : "#40406a" }}
          >{c}</button>
        ))}
      </div>

      {/* Muscle sliders for active cluster */}
      <div className="flex flex-col gap-4">
        {MUSCLE_GROUPS.filter((g) => g.cluster === activeCluster).map((g) => (
          <MuscleBar key={g.id} value={muscles[g.id] as number} label={g.label} side={g.side}
            onChange={(v) => onChange({...muscles, [g.id]: v})} />
        ))}
      </div>
    </div>
  );
};

// ─── Tab: PROTOCOLO ───────────────────────────────────────────────────────────
const ProtocoloTab = ({ posture, fms, rom }: { posture: PostureData; fms: FMSScores; rom: ROMData }) => {
  const protocol = generateProtocol(posture, fms, rom);
  const phases = [
    { key: "inhibit" as const,   label: "FASE 1 — INIBIR",    color: PURPLE, desc: "Foam roller · 5-10 min antes do treino · Reduz hiperatividade", time: "5-10 min" },
    { key: "lengthen" as const,  label: "FASE 2 — ALONGAR",   color: TEAL,   desc: "Static stretch · 20-45s · Após inibição para maior ganho", time: "5-10 min" },
    { key: "activate" as const,  label: "FASE 3 — ATIVAR",    color: GOLD,   desc: "Exercícios isolados · Foco em recrutamento neural", time: "5-10 min" },
    { key: "integrate" as const, label: "FASE 4 — INTEGRAR",  color: "#00c8ff", desc: "Padrões globais de movimento · Consolida a correção", time: "Durante treino" },
  ];

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div>
        <div className="font-heading text-[1.1rem] text-[#f0edf8]/80">Protocolo Corretivo</div>
        <div className="font-mono text-[.5rem] text-[#50507a] tracking-[.1em]">NASM CES MODEL · GERADO AUTOMATICAMENTE</div>
      </div>

      <div className="border p-3 rounded-[3px]" style={{ borderColor: `${GOLD}18`, background: "rgba(232,160,32,.02)" }}>
        <p className="font-mono text-[.48rem] text-[#8888b0] leading-[1.7]">
          Baseado nos desequilíbrios identificados na avaliação. Execute as 4 fases em sequência, preferencialmente antes do treino principal (Fases 1-3) e durante (Fase 4).
        </p>
      </div>

      {phases.map((phase, pi) => (
        <motion.div
          key={phase.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: pi * 0.1 }}
          className="border rounded-[3px] overflow-hidden"
          style={{ borderColor: `${phase.color}20` }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ background: `${phase.color}0c` }}>
            <div>
              <div className="font-mono text-[.52rem] tracking-[.12em]" style={{ color: phase.color }}>{phase.label}</div>
              <div className="font-mono text-[.44rem] text-[#50507a] mt-0.5">{phase.desc}</div>
            </div>
            <div className="font-mono text-[.48rem] text-[#30304a] border border-[#ffffff]/06 px-2 py-1 rounded-full flex-shrink-0">{phase.time}</div>
          </div>
          <div className="p-4 bg-[#040412] flex flex-col gap-2">
            {protocol[phase.key].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${phase.color}15`, border: `1px solid ${phase.color}30` }}>
                  <span className="font-mono text-[.4rem]" style={{ color: phase.color }}>{i + 1}</span>
                </div>
                <p className="font-landing text-[.78rem] text-[#8888b0] leading-[1.6]">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <div className="border border-[#00f0b4]/14 bg-[#00f0b4]/02 rounded-[3px] p-4">
        <div className="font-mono text-[.5rem] text-[#00f0b4]/70 tracking-[.12em] mb-2">FREQUÊNCIA RECOMENDADA</div>
        <div className="font-landing text-[.78rem] text-[#60607a] leading-[1.7]">
          Execute o protocolo completo <span style={{ color: "rgba(240,237,248,.7)" }}>3-4× por semana</span>, preferencialmente nos dias de treino.
          Reavalie com o FMS a cada 4-6 semanas para ajustar o protocolo conforme o progresso.
        </div>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const ApexPage = () => {
  const navigate = useNavigate();
  const { loading, latestAssessment, postureData, fmsScores, romData, muscleScores, activePain, saveFullAssessment, addPainEntry, resolvePain } = useApex();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [localPosture, setLocalPosture] = useState<PostureData>(DEFAULT_POSTURE);
  const [localFms, setLocalFms] = useState<FMSScores>(DEFAULT_FMS);
  const [localRom, setLocalRom] = useState<ROMData>(DEFAULT_ROM);
  const [localMuscles, setLocalMuscles] = useState<MuscleScores>(DEFAULT_MUSCLES);
  const [saving, setSaving] = useState(false);

  // Sync loaded data to local state
  useState(() => { setLocalPosture(postureData); });
  useState(() => { setLocalFms(fmsScores); });
  useState(() => { setLocalRom(romData); });
  useState(() => { setLocalMuscles(muscleScores); });

  const handleSave = async () => {
    setSaving(true);
    await saveFullAssessment(localPosture, localFms, localRom, localMuscles);
    setSaving(false);
    setActiveTab("overview");
  };

  const tabs: { id: Tab; label: string; color: string }[] = [
    { id: "overview",   label: "VISÃO GERAL", color: PURPLE },
    { id: "postura",    label: "POSTURA",     color: PURPLE },
    { id: "fms",        label: "FMS",          color: TEAL },
    { id: "dor",        label: "DOR",          color: RED },
    { id: "mobilidade", label: "MOBILIDADE",  color: "#00c8ff" },
    { id: "shape",      label: "SHAPE",        color: GOLD },
    { id: "protocolo",  label: "PROTOCOLO",   color: GOLD },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#03030a" }}>
        <div className="flex flex-col items-center gap-3">
          <motion.div className="w-8 h-8 border-t border-[#7890ff] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
          <span className="font-mono text-[.55rem] text-[#50507a] tracking-[.2em]">CARREGANDO APEX...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24"
      style={{ background: "#03030a" }}
    >
      {/* Header */}
      <div className="sticky top-0 z-40" style={{ background: "rgba(3,3,10,.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(120,144,255,.1)" }}>
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/dashboard")} className="font-mono text-[.55rem] text-[#40406a] hover:text-[#7890ff]/70 transition-colors">←</button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-[1.1rem]" style={{ color: PURPLE, textShadow: `0 0 14px ${PURPLE}50` }}>APEX</span>
                  <span className="font-mono text-[.45rem] text-[#50507a] tracking-[.15em]">VISUAL INTELLIGENCE</span>
                </div>
                <div className="font-mono text-[.44rem] text-[#30304a] tracking-[.12em]">CINESIOLOGIA · PhD LEVEL</div>
              </div>
            </div>
            {activeTab !== "overview" && activeTab !== "dor" && activeTab !== "protocolo" && (
              <button onClick={handleSave} disabled={saving}
                className="font-mono text-[.55rem] tracking-[.1em] px-3 py-1.5 transition-all disabled:opacity-50"
                style={{ background: PURPLE, color: "#030310", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
              >
                {saving ? "SALVANDO..." : "SALVAR"}
              </button>
            )}
          </div>

          {/* Tab navigation */}
          <div className="flex gap-0 overflow-x-auto border-b border-[#ffffff]/04">
            {tabs.map((t) => (
              <TabBtn key={t.id} id={t.id} label={t.label} active={activeTab === t.id} color={t.color} onClick={() => setActiveTab(t.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "overview"   && <OverviewTab assessment={latestAssessment} onStartAssessment={() => setActiveTab("postura")} />}
            {activeTab === "postura"    && <PosturaTab data={localPosture} onChange={setLocalPosture} />}
            {activeTab === "fms"        && <FMSTab scores={localFms} onChange={setLocalFms} />}
            {activeTab === "dor"        && <DorTab pain={activePain} onAdd={addPainEntry} onResolve={resolvePain} />}
            {activeTab === "mobilidade" && <MobilidadeTab rom={localRom} onChange={setLocalRom} />}
            {activeTab === "shape"      && <ShapeTab muscles={localMuscles} onChange={setLocalMuscles} />}
            {activeTab === "protocolo"  && <ProtocoloTab posture={localPosture} fms={localFms} rom={localRom} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default ApexPage;
