import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import {
  useApex,
  DEFAULT_POSTURE, DEFAULT_FMS, DEFAULT_ROM, DEFAULT_MUSCLES,
  calcFmsTotal, calcPostureScore, calcRomScore, calcSymmetryScore,
  type PostureData, type FMSScores, type ROMData, type MuscleScores, type PainEntry,
} from "@/hooks/useApex";

const EM = "#4ade80";
const BG = "#03030a";
const BORDER = "rgba(74,222,128,.18)";
const PANEL = "rgba(6,16,8,.9)";
const MUTED = "#5a7a60";
const TEXT = "#9ec5a6";

type Tab = "overview" | "postura" | "fms" | "dor" | "mobilidade" | "shape" | "protocolo";

const TABS: [Tab, string][] = [
  ["overview", "Overview"],
  ["postura", "Postura"],
  ["fms", "FMS"],
  ["dor", "Dor"],
  ["mobilidade", "Mobilidade"],
  ["shape", "Shape"],
  ["protocolo", "Protocolo"],
];

// ─── DATA TABLES ──────────────────────────────────────────────────────────

const ROM_NORMS: Record<string, { label: string; normal: number; min: number }> = {
  ankle_df_l: { label: "Tornozelo DF (E)", normal: 20, min: 15 },
  ankle_df_r: { label: "Tornozelo DF (D)", normal: 20, min: 15 },
  hip_flex_l: { label: "Quadril Flex (E)", normal: 120, min: 90 },
  hip_flex_r: { label: "Quadril Flex (D)", normal: 120, min: 90 },
  hip_ext_l: { label: "Quadril Ext (E)", normal: 20, min: 10 },
  hip_ext_r: { label: "Quadril Ext (D)", normal: 20, min: 10 },
  hip_ir_l: { label: "Quadril RI (E)", normal: 45, min: 30 },
  hip_ir_r: { label: "Quadril RI (D)", normal: 45, min: 30 },
  hip_er_l: { label: "Quadril RE (E)", normal: 45, min: 30 },
  hip_er_r: { label: "Quadril RE (D)", normal: 45, min: 30 },
  shoulder_flex_l: { label: "Ombro Flex (E)", normal: 180, min: 160 },
  shoulder_flex_r: { label: "Ombro Flex (D)", normal: 180, min: 160 },
  shoulder_er_l: { label: "Ombro RE (E)", normal: 90, min: 60 },
  shoulder_er_r: { label: "Ombro RE (D)", normal: 90, min: 60 },
  thoracic_rot_l: { label: "Torácica Rot (E)", normal: 45, min: 30 },
  thoracic_rot_r: { label: "Torácica Rot (D)", normal: 45, min: 30 },
  cervical_flex: { label: "Cervical Flex", normal: 45, min: 30 },
  cervical_ext: { label: "Cervical Ext", normal: 45, min: 30 },
  cervical_rot_l: { label: "Cervical Rot (E)", normal: 80, min: 60 },
  cervical_rot_r: { label: "Cervical Rot (D)", normal: 80, min: 60 },
};

const FMS_TESTS: { key: keyof FMSScores; label: string; bilateral?: keyof FMSScores }[] = [
  { key: "deep_squat", label: "Deep Squat" },
  { key: "hurdle_step_l", label: "Hurdle Step (E)", bilateral: "hurdle_step_r" },
  { key: "hurdle_step_r", label: "Hurdle Step (D)" },
  { key: "inline_lunge_l", label: "Inline Lunge (E)" },
  { key: "inline_lunge_r", label: "Inline Lunge (D)" },
  { key: "shoulder_mob_l", label: "Shoulder Mob (E)" },
  { key: "shoulder_mob_r", label: "Shoulder Mob (D)" },
  { key: "active_slr_l", label: "Active SLR (E)" },
  { key: "active_slr_r", label: "Active SLR (D)" },
  { key: "trunk_stability", label: "Trunk Stability Push-up" },
  { key: "rotary_stab_l", label: "Rotary Stab (E)" },
  { key: "rotary_stab_r", label: "Rotary Stab (D)" },
];

const POSTURE_FIELDS: { key: keyof PostureData; label: string; plane: string; options: { v: string; l: string }[] }[] = [
  { key: "forward_head", label: "Cabeça anteriorizada", plane: "Sagital", options: [
    { v: "none", l: "Neutra" }, { v: "mild", l: "Leve" }, { v: "moderate", l: "Moderada" }, { v: "severe", l: "Severa" }] },
  { key: "thoracic_kyphosis", label: "Cifose torácica", plane: "Sagital", options: [
    { v: "normal", l: "Normal" }, { v: "increased", l: "Aumentada" }, { v: "decreased", l: "Retificada" }] },
  { key: "lumbar_lordosis", label: "Lordose lombar", plane: "Sagital", options: [
    { v: "normal", l: "Normal" }, { v: "increased", l: "Hiperlordose" }, { v: "decreased", l: "Retificada" }] },
  { key: "pelvic_tilt", label: "Tilt pélvico", plane: "Sagital", options: [
    { v: "neutral", l: "Neutro" }, { v: "anterior", l: "Anterior" }, { v: "posterior", l: "Posterior" }] },
  { key: "shoulder_asym", label: "Assimetria de ombros", plane: "Frontal", options: [
    { v: "none", l: "Nenhuma" }, { v: "mild", l: "Leve" }, { v: "moderate", l: "Moderada" }, { v: "severe", l: "Severa" }] },
  { key: "hip_asym", label: "Assimetria de quadril", plane: "Frontal", options: [
    { v: "none", l: "Nenhuma" }, { v: "mild", l: "Leve" }, { v: "moderate", l: "Moderada" }] },
  { key: "scoliosis", label: "Desvio lateral coluna", plane: "Frontal", options: [
    { v: "none", l: "Nenhum" }, { v: "functional", l: "Funcional" }, { v: "structural", l: "Estrutural" }] },
  { key: "upper_crossed", label: "Síndrome Cruzada Superior", plane: "Transversal", options: [
    { v: "none", l: "Ausente" }, { v: "mild", l: "Leve" }, { v: "moderate", l: "Moderada" }, { v: "severe", l: "Severa" }] },
  { key: "lower_crossed", label: "Síndrome Cruzada Inferior", plane: "Transversal", options: [
    { v: "none", l: "Ausente" }, { v: "mild", l: "Leve" }, { v: "moderate", l: "Moderada" }, { v: "severe", l: "Severa" }] },
  { key: "pronation_dist", label: "Distorção de pronação", plane: "Transversal", options: [
    { v: "none", l: "Ausente" }, { v: "mild", l: "Leve" }, { v: "moderate", l: "Moderada" }, { v: "severe", l: "Severa" }] },
];

const MUSCLE_GROUPS: { key: keyof MuscleScores; label: string; pair?: keyof MuscleScores }[] = [
  { key: "chest_upper", label: "Peito superior" },
  { key: "chest_lower", label: "Peito inferior" },
  { key: "shoulder_ant", label: "Deltoide anterior" },
  { key: "shoulder_lat", label: "Deltoide lateral" },
  { key: "shoulder_post", label: "Deltoide posterior" },
  { key: "biceps_l", label: "Bíceps (E)", pair: "biceps_r" },
  { key: "biceps_r", label: "Bíceps (D)" },
  { key: "triceps_l", label: "Tríceps (E)", pair: "triceps_r" },
  { key: "triceps_r", label: "Tríceps (D)" },
  { key: "forearms_l", label: "Antebraço (E)", pair: "forearms_r" },
  { key: "forearms_r", label: "Antebraço (D)" },
  { key: "traps_upper", label: "Trapézio superior" },
  { key: "traps_mid", label: "Trapézio médio" },
  { key: "traps_lower", label: "Trapézio inferior" },
  { key: "lats", label: "Grande dorsal" },
  { key: "rhomboids", label: "Romboides" },
  { key: "abs_rectus", label: "Reto abdominal" },
  { key: "abs_obliques", label: "Oblíquos" },
  { key: "erectors", label: "Eretores" },
  { key: "glute_max", label: "Glúteo máximo" },
  { key: "glute_med", label: "Glúteo médio" },
  { key: "quads_l", label: "Quadríceps (E)", pair: "quads_r" },
  { key: "quads_r", label: "Quadríceps (D)" },
  { key: "hams_l", label: "Isquios (E)", pair: "hams_r" },
  { key: "hams_r", label: "Isquios (D)" },
  { key: "calves_l", label: "Panturrilha (E)", pair: "calves_r" },
  { key: "calves_r", label: "Panturrilha (D)" },
  { key: "adductors", label: "Adutores" },
];

const SHAPE_GOALS = [
  { v: "vtaper", l: "V-Taper", hint: "Ombros largos, cintura estreita" },
  { v: "xframe", l: "X-Frame", hint: "V-taper + pernas densas" },
  { v: "physique", l: "Physique", hint: "Proporção + condicionamento" },
  { v: "power", l: "Força/Power", hint: "Massa funcional" },
  { v: "rehab", l: "Reabilitação", hint: "Correção + retorno" },
];

const PAIN_REGIONS = [
  "Cervical", "Trapézio", "Ombro", "Cotovelo", "Punho", "Torácica",
  "Lombar", "Quadril", "Virilha", "Joelho", "Tornozelo", "Pé",
];
const PAIN_QUALITIES = ["Latejante", "Queimação", "Facada", "Peso", "Formigamento", "Irradiada"];

const REFERRED_PAIN_MAP: Record<string, { trigger: string; pattern: string }[]> = {
  Cervical: [{ trigger: "Trapézio superior", pattern: "Têmpora, mandíbula, pescoço lateral" }],
  Ombro: [{ trigger: "Infraespinhoso", pattern: "Face anterior do ombro" }],
  Lombar: [{ trigger: "Glúteo médio / QL", pattern: "Lombar + face lateral do quadril" }],
  Quadril: [{ trigger: "Piriforme", pattern: "Nádega + face posterior MMII (pseudo-ciática)" }],
  Virilha: [{ trigger: "Ilíaco / Psoas", pattern: "Virilha + face anterior coxa" }],
  Joelho: [{ trigger: "Gastrocnêmio", pattern: "Face posterior do joelho" }],
};

const RED_FLAG_KEYWORDS = [
  "dor noturna intensa", "acorda à noite", "perda de força", "perda de sensibilidade",
  "controle vesical", "controle intestinal", "febre", "perda de peso",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────

type Syndrome = { id: string; name: string; shortened: string[]; inhibited: string[] };

const detectSyndromes = (p: PostureData): Syndrome[] => {
  const out: Syndrome[] = [];
  const has = (v: string) => v === "mild" || v === "moderate" || v === "severe";
  if (has(p.upper_crossed) || (has(p.forward_head) && p.thoracic_kyphosis === "increased")) {
    out.push({
      id: "scs", name: "Síndrome Cruzada Superior (Janda)",
      shortened: ["Trapézio superior", "Elevador da escápula", "Peitoral maior/menor", "Esternocleidomastoideo"],
      inhibited: ["Flexores profundos cervicais", "Serrátil anterior", "Trapézio médio/inferior", "Romboides"],
    });
  }
  if (has(p.lower_crossed) || (p.pelvic_tilt === "anterior" && p.lumbar_lordosis === "increased")) {
    out.push({
      id: "sci", name: "Síndrome Cruzada Inferior (Janda)",
      shortened: ["Iliopsoas", "Reto femoral", "Tensor fáscia lata", "Eretores lombares"],
      inhibited: ["Glúteo máximo", "Abdominais profundos", "Glúteo médio/mínimo", "Vasto medial oblíquo"],
    });
  }
  if (has(p.pronation_dist)) {
    out.push({
      id: "spd", name: "Síndrome de Distorção de Pronação",
      shortened: ["Gastrocnêmio/Sóleo", "Adutores", "Tensor fáscia lata"],
      inhibited: ["Tibial anterior/posterior", "Glúteo médio", "Glúteo máximo"],
    });
  }
  return out;
};

const detectRedFlags = (notes: string, behavior: string, painType: string): string[] => {
  const flags: string[] = [];
  const n = notes.toLowerCase();
  if (behavior === "inflammatory") flags.push("Padrão inflamatório — piora em repouso");
  if (painType === "radicular") flags.push("Padrão radiculopático — avaliar raiz nervosa");
  RED_FLAG_KEYWORDS.forEach((k) => { if (n.includes(k)) flags.push(`Sinal de alerta: "${k}"`); });
  return flags;
};

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────

const ScoreRing = ({ score, label, sub }: { score: number; label: string; sub?: string }) => {
  const r = 32, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 75 ? EM : score >= 50 ? "#fbbf24" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(74,222,128,.1)" strokeWidth="4" />
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset .6s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading text-[1.1rem]" style={{ color }}>{score}</span>
        </div>
      </div>
      <div className="font-mono text-[.55rem] tracking-[.15em] uppercase" style={{ color: TEXT }}>{label}</div>
      {sub && <div className="font-mono text-[.5rem]" style={{ color: MUTED }}>{sub}</div>}
    </div>
  );
};

const TabBtn = ({ id, label, active, onClick }: { id: Tab; label: string; active: boolean; onClick: () => void }) => (
  <button onClick={onClick}
    className="px-3 py-1.5 rounded-[3px] font-mono text-[.6rem] tracking-[.15em] uppercase whitespace-nowrap border transition-colors"
    style={{
      borderColor: active ? EM : BORDER,
      color: active ? EM : TEXT,
      background: active ? "rgba(74,222,128,.1)" : "transparent",
    }}>{label}</button>
);

const Panel = ({ children, title }: { children: React.ReactNode; title?: string }) => (
  <div className="border rounded-[3px] p-4 mb-3" style={{ borderColor: BORDER, background: PANEL }}>
    {title && <div className="font-mono text-[.55rem] tracking-[.18em] uppercase mb-3" style={{ color: EM }}>{title}</div>}
    {children}
  </div>
);

const SevSelect = ({ value, options, onChange }: { value: string; options: { v: string; l: string }[]; onChange: (v: string) => void }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}
    className="bg-transparent border rounded-[3px] px-2 py-1 font-mono text-[.65rem] outline-none"
    style={{ borderColor: BORDER, color: TEXT }}>
    {options.map((o) => <option key={o.v} value={o.v} style={{ background: BG }}>{o.l}</option>)}
  </select>
);

const StepSlider = ({ value, max, onChange, color = EM }: { value: number; max: number; onChange: (v: number) => void; color?: string }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: max + 1 }).map((_, i) => (
      <button key={i} onClick={() => onChange(i)}
        className="w-6 h-6 rounded-[2px] font-mono text-[.55rem] border transition-colors"
        style={{
          borderColor: value === i ? color : BORDER,
          background: value === i ? `${color}33` : "transparent",
          color: value === i ? color : MUTED,
        }}>{i}</button>
    ))}
  </div>
);

// ─── TABS ─────────────────────────────────────────────────────────────────

const OverviewTab = ({ posture, fms, rom, muscles, pain, onGo }: any) => {
  const fmsTotal = calcFmsTotal(fms);
  const postureScore = calcPostureScore(posture);
  const romScore = calcRomScore(rom);
  const symScore = calcSymmetryScore(muscles);
  const overall = Math.round((fmsTotal / 21) * 25 + postureScore * 0.25 + romScore * 0.25 + symScore * 0.25);
  const syndromes = detectSyndromes(posture);
  return (
    <>
      <Panel title="Score Global">
        <div className="flex items-center justify-center mb-4">
          <ScoreRing score={overall} label="APEX" sub="0-100" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <ScoreRing score={postureScore} label="Postura" />
          <ScoreRing score={romScore} label="Mobilidade" />
          <ScoreRing score={symScore} label="Simetria" />
          <ScoreRing score={Math.round((fmsTotal / 21) * 100)} label="FMS" sub={`${fmsTotal}/21`} />
        </div>
        {fmsTotal < 14 && (
          <div className="mt-3 border rounded-[3px] p-2 font-mono text-[.6rem]"
            style={{ borderColor: "#ef4444", color: "#ef4444", background: "rgba(239,68,68,.05)" }}>
            ⚠ FMS &lt; 14 — risco de lesão 3× maior (Cook et al., 2006)
          </div>
        )}
      </Panel>
      {syndromes.length > 0 && (
        <Panel title="Síndromes Detectadas">
          {syndromes.map((s) => (
            <div key={s.id} className="mb-2 font-mono text-[.65rem]" style={{ color: TEXT }}>
              · {s.name}
            </div>
          ))}
          <button onClick={() => onGo("postura")} className="font-mono text-[.6rem] underline" style={{ color: EM }}>
            ver detalhamento →
          </button>
        </Panel>
      )}
      {pain.length > 0 && (
        <Panel title={`Dor Ativa (${pain.length})`}>
          {pain.slice(0, 3).map((p: PainEntry) => (
            <div key={p.id} className="font-mono text-[.65rem] mb-1" style={{ color: p.red_flag ? "#ef4444" : TEXT }}>
              {p.red_flag && "⚠ "}{p.body_region} {p.side} — intensidade {p.intensity}/10
            </div>
          ))}
        </Panel>
      )}
      <Panel title="Pilares">
        <div className="grid grid-cols-2 gap-2 font-mono text-[.6rem]">
          {[
            ["postura", "1 · Postura"],
            ["fms", "2 · FMS / SFMA"],
            ["postura", "3 · Janda"],
            ["dor", "4 · Mapa de Dor"],
            ["protocolo", "5 · Biomecânica"],
            ["mobilidade", "6 · ROM"],
            ["shape", "7 · Shape"],
            ["protocolo", "8 · NASM CES"],
          ].map(([t, l], i) => (
            <button key={i} onClick={() => onGo(t as Tab)}
              className="border rounded-[3px] px-2 py-2 text-left transition-colors hover:bg-[rgba(74,222,128,.05)]"
              style={{ borderColor: BORDER, color: TEXT }}>{l}</button>
          ))}
        </div>
      </Panel>
    </>
  );
};

const PosturaTab = ({ value, onChange }: { value: PostureData; onChange: (v: PostureData) => void }) => {
  const syndromes = detectSyndromes(value);
  const planes = ["Sagital", "Frontal", "Transversal"];
  return (
    <>
      {planes.map((plane) => (
        <Panel key={plane} title={`Plano ${plane}`}>
          {POSTURE_FIELDS.filter((f) => f.plane === plane).map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-[.65rem] flex-1" style={{ color: TEXT }}>{f.label}</span>
              <SevSelect value={value[f.key]} options={f.options}
                onChange={(v) => onChange({ ...value, [f.key]: v })} />
            </div>
          ))}
        </Panel>
      ))}
      {syndromes.map((s) => (
        <Panel key={s.id} title={s.name}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-[.55rem] mb-1" style={{ color: "#ef4444" }}>ENCURTADOS (hiperativos)</div>
              {s.shortened.map((m) => <div key={m} className="font-mono text-[.6rem]" style={{ color: TEXT }}>· {m}</div>)}
            </div>
            <div>
              <div className="font-mono text-[.55rem] mb-1" style={{ color: "#fbbf24" }}>INIBIDOS (fracos)</div>
              {s.inhibited.map((m) => <div key={m} className="font-mono text-[.6rem]" style={{ color: TEXT }}>· {m}</div>)}
            </div>
          </div>
        </Panel>
      ))}
    </>
  );
};

const FmsTab = ({ value, onChange }: { value: FMSScores; onChange: (v: FMSScores) => void }) => {
  const total = calcFmsTotal(value);
  return (
    <>
      <Panel title={`Score Total: ${total}/21`}>
        <div className="font-mono text-[.6rem]" style={{ color: total < 14 ? "#ef4444" : EM }}>
          {total < 14 ? "Risco elevado — priorizar corretivos antes de carga" : "Pronto para carga progressiva"}
        </div>
      </Panel>
      <Panel title="Functional Movement Screen (0-3)">
        {FMS_TESTS.map((t) => (
          <div key={t.key} className="flex items-center justify-between gap-2 mb-2">
            <span className="font-mono text-[.65rem] flex-1" style={{ color: TEXT }}>{t.label}</span>
            <StepSlider value={value[t.key]} max={3}
              onChange={(v) => onChange({ ...value, [t.key]: v })} />
          </div>
        ))}
      </Panel>
    </>
  );
};

const DorTab = ({ pain, onAdd, onResolve }: {
  pain: PainEntry[];
  onAdd: (e: Omit<PainEntry, "id" | "created_at" | "resolved_at">) => void;
  onResolve: (id: string) => void;
}) => {
  const [region, setRegion] = useState("Lombar");
  const [side, setSide] = useState("center");
  const [intensity, setIntensity] = useState(5);
  const [painType, setPainType] = useState("mechanical");
  const [behavior, setBehavior] = useState("mechanical");
  const [onsetPattern, setOnsetPattern] = useState("post_workout");
  const [qualities, setQualities] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const redFlags = detectRedFlags(notes, behavior, painType);
  const referred = REFERRED_PAIN_MAP[region] || [];

  const submit = () => {
    onAdd({
      body_region: region, side, pain_type: painType, quality: qualities,
      intensity, behavior, onset_pattern: onsetPattern, notes: notes || null,
      red_flag: redFlags.length > 0,
    });
    setNotes(""); setQualities([]); setIntensity(5);
  };

  return (
    <>
      {pain.length > 0 && (
        <Panel title="Dor Ativa">
          {pain.map((p) => (
            <div key={p.id} className="border-b py-2 last:border-b-0" style={{ borderColor: BORDER }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[.65rem]" style={{ color: p.red_flag ? "#ef4444" : EM }}>
                  {p.red_flag && "⚠ "}{p.body_region} ({p.side}) · {p.intensity}/10
                </span>
                <button onClick={() => onResolve(p.id)} className="font-mono text-[.55rem] underline" style={{ color: MUTED }}>
                  resolver
                </button>
              </div>
              <div className="font-mono text-[.55rem]" style={{ color: TEXT }}>
                {p.behavior} · {p.pain_type} · {p.onset_pattern}
              </div>
            </div>
          ))}
        </Panel>
      )}
      <Panel title="Nova Entrada de Dor">
        <div className="space-y-2">
          <div className="flex gap-2">
            <select value={region} onChange={(e) => setRegion(e.target.value)}
              className="flex-1 bg-transparent border rounded-[3px] px-2 py-1 font-mono text-[.65rem] outline-none"
              style={{ borderColor: BORDER, color: TEXT }}>
              {PAIN_REGIONS.map((r) => <option key={r} value={r} style={{ background: BG }}>{r}</option>)}
            </select>
            <select value={side} onChange={(e) => setSide(e.target.value)}
              className="bg-transparent border rounded-[3px] px-2 py-1 font-mono text-[.65rem] outline-none"
              style={{ borderColor: BORDER, color: TEXT }}>
              {["center", "left", "right", "bilateral"].map((s) => <option key={s} value={s} style={{ background: BG }}>{s}</option>)}
            </select>
          </div>
          <div>
            <div className="font-mono text-[.55rem] mb-1" style={{ color: MUTED }}>INTENSIDADE: {intensity}/10</div>
            <input type="range" min="0" max="10" value={intensity}
              onChange={(e) => setIntensity(+e.target.value)} className="w-full accent-green-400" />
          </div>
          <div>
            <div className="font-mono text-[.55rem] mb-1" style={{ color: MUTED }}>QUALIDADE</div>
            <div className="flex flex-wrap gap-1">
              {PAIN_QUALITIES.map((q) => (
                <button key={q} onClick={() =>
                  setQualities((qs) => qs.includes(q) ? qs.filter((x) => x !== q) : [...qs, q])}
                  className="px-2 py-0.5 rounded-[2px] border font-mono text-[.55rem]"
                  style={{
                    borderColor: qualities.includes(q) ? EM : BORDER,
                    color: qualities.includes(q) ? EM : TEXT,
                    background: qualities.includes(q) ? "rgba(74,222,128,.1)" : "transparent",
                  }}>{q}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select value={behavior} onChange={(e) => setBehavior(e.target.value)}
              className="bg-transparent border rounded-[3px] px-2 py-1 font-mono text-[.6rem] outline-none"
              style={{ borderColor: BORDER, color: TEXT }}>
              <option value="mechanical" style={{ background: BG }}>Mecânica</option>
              <option value="inflammatory" style={{ background: BG }}>Inflamatória</option>
            </select>
            <select value={painType} onChange={(e) => setPainType(e.target.value)}
              className="bg-transparent border rounded-[3px] px-2 py-1 font-mono text-[.6rem] outline-none"
              style={{ borderColor: BORDER, color: TEXT }}>
              <option value="local" style={{ background: BG }}>Local</option>
              <option value="referred" style={{ background: BG }}>Referida</option>
              <option value="radicular" style={{ background: BG }}>Radicular</option>
            </select>
            <select value={onsetPattern} onChange={(e) => setOnsetPattern(e.target.value)}
              className="bg-transparent border rounded-[3px] px-2 py-1 font-mono text-[.6rem] outline-none"
              style={{ borderColor: BORDER, color: TEXT }}>
              <option value="morning" style={{ background: BG }}>Matinal</option>
              <option value="night" style={{ background: BG }}>Noturna</option>
              <option value="post_workout" style={{ background: BG }}>Pós-treino</option>
              <option value="constant" style={{ background: BG }}>Constante</option>
            </select>
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="notas, gatilhos, contexto..."
            className="w-full bg-transparent border rounded-[3px] px-2 py-1 font-mono text-[.65rem] outline-none resize-none"
            style={{ borderColor: BORDER, color: TEXT }} rows={2} />
          {referred.length > 0 && (
            <div className="border rounded-[3px] p-2" style={{ borderColor: BORDER }}>
              <div className="font-mono text-[.55rem] mb-1" style={{ color: EM }}>POSSÍVEIS GATILHOS REFERIDOS</div>
              {referred.map((r, i) => (
                <div key={i} className="font-mono text-[.55rem]" style={{ color: TEXT }}>
                  · {r.trigger} → {r.pattern}
                </div>
              ))}
            </div>
          )}
          {redFlags.length > 0 && (
            <div className="border rounded-[3px] p-2" style={{ borderColor: "#ef4444", background: "rgba(239,68,68,.05)" }}>
              <div className="font-mono text-[.55rem] mb-1" style={{ color: "#ef4444" }}>⚠ RED FLAGS — buscar profissional</div>
              {redFlags.map((f, i) => <div key={i} className="font-mono text-[.55rem]" style={{ color: "#ef4444" }}>· {f}</div>)}
            </div>
          )}
          <button onClick={submit} className="w-full border rounded-[3px] py-2 font-mono text-[.65rem] tracking-[.15em] uppercase"
            style={{ borderColor: EM, color: EM, background: "rgba(74,222,128,.05)" }}>
            Registrar
          </button>
        </div>
      </Panel>
    </>
  );
};

const MobilidadeTab = ({ value, onChange }: { value: ROMData; onChange: (v: ROMData) => void }) => {
  const score = calcRomScore(value);
  return (
    <>
      <Panel title={`Mobilidade: ${score}/100`}>
        <div className="font-mono text-[.55rem]" style={{ color: MUTED }}>
          Normas AAOS · graus de amplitude · alvo ≥ 80% do normal
        </div>
      </Panel>
      <Panel title="ROM por Articulação">
        {Object.entries(ROM_NORMS).map(([k, n]) => {
          const v = value[k as keyof ROMData];
          const pct = v ? v / n.normal : 0;
          const color = !v ? MUTED : pct >= 0.9 ? EM : pct >= 0.7 ? "#fbbf24" : "#ef4444";
          return (
            <div key={k} className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[.6rem] flex-1" style={{ color: TEXT }}>{n.label}</span>
              <span className="font-mono text-[.5rem]" style={{ color: MUTED }}>n={n.normal}° / m={n.min}°</span>
              <input type="number" value={v ?? ""} placeholder="°"
                onChange={(e) => onChange({ ...value, [k]: e.target.value ? +e.target.value : null })}
                className="w-14 bg-transparent border rounded-[3px] px-1 py-0.5 font-mono text-[.65rem] text-right outline-none"
                style={{ borderColor: BORDER, color }} />
            </div>
          );
        })}
      </Panel>
    </>
  );
};

const ShapeTab = ({ value, onChange }: { value: MuscleScores; onChange: (v: MuscleScores) => void }) => {
  const pairs = MUSCLE_GROUPS.filter((g) => g.pair);
  const asymmetries = pairs.map((g) => {
    const l = value[g.key] as number, r = value[g.pair!] as number;
    return { name: g.label.replace(" (E)", ""), delta: Math.abs(l - r), avg: (l + r) / 2 };
  });
  const flagged = asymmetries.filter((a) => a.delta >= 2);
  const lagging = [...MUSCLE_GROUPS]
    .map((g) => ({ name: g.label, score: value[g.key] as number }))
    .sort((a, b) => a.score - b.score).slice(0, 3);

  return (
    <>
      <Panel title="Objetivo de Shape">
        <div className="grid grid-cols-2 gap-2">
          {SHAPE_GOALS.map((g) => (
            <button key={g.v} onClick={() => onChange({ ...value, shape_goal: g.v })}
              className="border rounded-[3px] p-2 text-left"
              style={{
                borderColor: value.shape_goal === g.v ? EM : BORDER,
                background: value.shape_goal === g.v ? "rgba(74,222,128,.08)" : "transparent",
              }}>
              <div className="font-mono text-[.65rem]" style={{ color: value.shape_goal === g.v ? EM : TEXT }}>{g.l}</div>
              <div className="font-mono text-[.5rem]" style={{ color: MUTED }}>{g.hint}</div>
            </button>
          ))}
        </div>
      </Panel>
      {flagged.length > 0 && (
        <Panel title="Assimetrias Detectadas (> 15%)">
          {flagged.map((a) => (
            <div key={a.name} className="font-mono text-[.6rem]" style={{ color: "#fbbf24" }}>
              ⚠ {a.name} — Δ {a.delta} pts
            </div>
          ))}
        </Panel>
      )}
      <Panel title="Top 3 Lagging (prioridade)">
        {lagging.map((l) => (
          <div key={l.name} className="font-mono text-[.6rem]" style={{ color: TEXT }}>· {l.name} ({l.score}/10)</div>
        ))}
      </Panel>
      <Panel title="Desenvolvimento (0-10)">
        {MUSCLE_GROUPS.map((g) => (
          <div key={g.key} className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[.6rem] flex-1" style={{ color: TEXT }}>{g.label}</span>
            <input type="range" min="0" max="10" value={value[g.key] as number}
              onChange={(e) => onChange({ ...value, [g.key]: +e.target.value })}
              className="w-24 accent-green-400" />
            <span className="font-mono text-[.55rem] w-5 text-right" style={{ color: EM }}>{value[g.key] as number}</span>
          </div>
        ))}
      </Panel>
    </>
  );
};

const ProtocoloTab = ({ posture, fms, pain }: { posture: PostureData; fms: FMSScores; pain: PainEntry[] }) => {
  const syndromes = detectSyndromes(posture);
  const fmsTotal = calcFmsTotal(fms);
  const inhibitTargets = useMemo(() => {
    const out = new Set<string>();
    syndromes.forEach((s) => s.shortened.forEach((m) => out.add(m)));
    return Array.from(out);
  }, [syndromes]);
  const activateTargets = useMemo(() => {
    const out = new Set<string>();
    syndromes.forEach((s) => s.inhibited.forEach((m) => out.add(m)));
    return Array.from(out);
  }, [syndromes]);

  return (
    <>
      <Panel title="NASM Corrective Exercise — Cascata 4 Fases">
        <div className="font-mono text-[.55rem]" style={{ color: MUTED }}>
          Gerado a partir de Postura + FMS ({fmsTotal}/21) + Dor ({pain.length} ativas)
        </div>
      </Panel>

      <Panel title="1 · INIBIR (5-10 min · pré-treino)">
        <div className="font-mono text-[.55rem] mb-2" style={{ color: MUTED }}>
          Foam roller / bola — pressão 30-90s nos pontos de tensão máxima
        </div>
        {inhibitTargets.length > 0
          ? inhibitTargets.map((m) => <div key={m} className="font-mono text-[.6rem]" style={{ color: TEXT }}>· {m}</div>)
          : <div className="font-mono text-[.6rem]" style={{ color: MUTED }}>Sem músculos hiperativos detectados.</div>}
      </Panel>

      <Panel title="2 · ALONGAR (5-10 min)">
        <div className="font-mono text-[.55rem] mb-2" style={{ color: MUTED }}>
          Static stretching 20-30s · PNF para ganho rápido
        </div>
        {inhibitTargets.map((m) => (
          <div key={m} className="font-mono text-[.6rem]" style={{ color: TEXT }}>· Alongar {m}</div>
        ))}
      </Panel>

      <Panel title="3 · ATIVAR (5-10 min)">
        <div className="font-mono text-[.55rem] mb-2" style={{ color: MUTED }}>
          Ativação isolada — recrutamento neural, sem fadiga
        </div>
        {activateTargets.length > 0
          ? activateTargets.map((m) => <div key={m} className="font-mono text-[.6rem]" style={{ color: TEXT }}>· Ativar {m}</div>)
          : <div className="font-mono text-[.6rem]" style={{ color: MUTED }}>Sem músculos inibidos detectados.</div>}
      </Panel>

      <Panel title="4 · INTEGRAR (durante o treino)">
        <div className="font-mono text-[.6rem] space-y-1" style={{ color: TEXT }}>
          <div>· Padrões globais combinando correção + carga</div>
          <div>· Ex: agachamento com mini-band para glúteo médio</div>
          <div>· Ex: remada baixa com retração escapular consciente</div>
        </div>
      </Panel>

      <Panel title="Cues por Padrão Fundamental">
        {[
          ["Agachamento", "Joelhos colabando → glúteo médio fraco · heel rise → tornozelo rígido"],
          ["Deadlift", "Cat back → core fraco · hiperestensão lockout → glúteo desligado"],
          ["Overhead Press", "Hiperlordose → lat/peitoral curto · flare de costela → core anterior"],
          ["Unipodal", "Trendelenburg → glúteo médio · rotação ipsilateral → SCI"],
          ["Supino", "Protração na descida → impacto · sem retração → sem base"],
        ].map(([name, cue]) => (
          <div key={name} className="mb-2">
            <div className="font-mono text-[.6rem]" style={{ color: EM }}>{name}</div>
            <div className="font-mono text-[.55rem]" style={{ color: TEXT }}>{cue}</div>
          </div>
        ))}
      </Panel>
    </>
  );
};

// ─── PAGE ─────────────────────────────────────────────────────────────────

const ApexPage = () => {
  const navigate = useNavigate();
  const { loading, postureData, fmsScores, romData, muscleScores, activePain,
    saveFullAssessment, addPainEntry, resolvePain } = useApex();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [posture, setPosture] = useState<PostureData>(DEFAULT_POSTURE);
  const [fms, setFms] = useState<FMSScores>(DEFAULT_FMS);
  const [rom, setRom] = useState<ROMData>(DEFAULT_ROM);
  const [muscles, setMuscles] = useState<MuscleScores>(DEFAULT_MUSCLES);
  const [saving, setSaving] = useState(false);

  // hydrate once loaded
  useMemo(() => {
    if (!loading) {
      setPosture(postureData); setFms(fmsScores); setRom(romData); setMuscles(muscleScores);
    }
  }, [loading]); // eslint-disable-line

  const save = async () => {
    setSaving(true);
    try { await saveFullAssessment(posture, fms, rom, muscles); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen pb-24" style={{ background: BG, fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="max-w-lg mx-auto px-4 pt-6">
        <button onClick={() => navigate("/dashboard")}
          className="font-mono text-[.55rem] mb-4 transition-colors"
          style={{ color: MUTED }}>← voltar</button>

        <div className="flex items-end justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-heading text-[1.4rem]" style={{ color: EM }}>APEX</span>
            <span className="font-mono text-[.5rem] tracking-[.15em]" style={{ color: MUTED }}>VISUAL INTELLIGENCE</span>
          </div>
          <button onClick={save} disabled={saving}
            className="border rounded-[3px] px-3 py-1 font-mono text-[.55rem] tracking-[.15em] uppercase"
            style={{ borderColor: EM, color: EM, background: "rgba(74,222,128,.05)" }}>
            {saving ? "salvando..." : "salvar"}
          </button>
        </div>
        <div className="font-mono text-[.5rem] tracking-[.12em] mb-5" style={{ color: MUTED }}>
          CINESIOLOGIA · PhD LEVEL · 8 PILARES
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 -mx-4 px-4 scrollbar-hide">
          {TABS.map(([id, label]) => (
            <TabBtn key={id} id={id} label={label}
              active={activeTab === id} onClick={() => setActiveTab(id)} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}>
            {activeTab === "overview" && (
              <OverviewTab posture={posture} fms={fms} rom={rom} muscles={muscles}
                pain={activePain} onGo={(t: Tab) => setActiveTab(t)} />
            )}
            {activeTab === "postura" && <PosturaTab value={posture} onChange={setPosture} />}
            {activeTab === "fms" && <FmsTab value={fms} onChange={setFms} />}
            {activeTab === "dor" && <DorTab pain={activePain} onAdd={addPainEntry} onResolve={resolvePain} />}
            {activeTab === "mobilidade" && <MobilidadeTab value={rom} onChange={setRom} />}
            {activeTab === "shape" && <ShapeTab value={muscles} onChange={setMuscles} />}
            {activeTab === "protocolo" && <ProtocoloTab posture={posture} fms={fms} pain={activePain} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav />
    </motion.div>
  );
};

export default ApexPage;
