import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, FileText, RefreshCw, BarChart2, CheckSquare,
  Grid, Zap, BookOpen, Clock, ChevronDown, User as UserIcon,
  Target, Brain, Loader2, RotateCcw,
} from "lucide-react";
import { exportMealPlanPDF } from "@/utils/exportMealPlanPDF";
import { exportMealPlanPDF as exportMealPlanPDFElite } from "@/lib/mealPlanPdf";
import ProtocolGanttChart from "@/components/coach/ProtocolGanttChart";
import CoachCheckinsTab from "@/components/coach/CoachCheckinsTab";
import CoachWeekMealGrid from "@/components/coach/CoachWeekMealGrid";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  TrainingSchedule,
  WeeklySchedule,
  defaultWeeklySchedule,
  buildTrainingSchedulePrompt,
} from "@/components/coach/TrainingSchedule";
import { validateMedidasCaseiras } from "@/lib/medidasCaseirasValidator";
import SubstitutionsAgentPage from "@/pages/SubstitutionsAgentPage";
import { SUBSTITUTION_BANK_V2, type FoodCategoryV2 } from "@/data/substitutionBank";
import NutrientDensityPanel from "@/components/coach/NutrientDensityPanel";
import Glut4SyncCard from "@/components/meal/Glut4SyncCard";
import AdherenceModal from "@/components/meal/AdherenceModal";

// ─── Design tokens — Jarvis (dark, holographic, gold/cyan) ────────────────────
const T = {
  bg:      "#020205",
  bg2:     "#06060c",
  bg3:     "#020205",
  card:    "#06060c",
  border:  "#B8922A18",
  border2: "#B8922A22",
  green:   "#B8922A",   // gold = primary accent (kept as `green` to avoid breaking refs)
  greenDim:"#8a6e1f",
  greenBg: "#B8922A0A",
  text:    "#F5F0E8",
  muted:   "#6b6258",
  muted2:  "#2A2A2A",
  red:     "#ff4444",
  amber:   "#D4A732",
  blue:    "#00D4FF",
  cyan:    "#00D4FF",
  gold:    "#B8922A",
  fontDisplay: "'Rajdhani', sans-serif",
  fontMono: "'Space Mono', monospace",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ fontFamily: T.fontMono, fontSize: 9, color: "#B8922A88", textTransform: "uppercase" as const, letterSpacing: "0.2em", display: "block", marginBottom: 6 }}>
    {children}{required && <span style={{ color: T.red, marginLeft: 3 }}>*</span>}
  </label>
);

const InputField = ({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { style?: React.CSSProperties }) => (
  <input {...props} style={{
    width: "100%", background: T.bg, border: `1px solid ${T.border}`,
    borderRadius: 0, padding: "10px 14px", color: T.text, fontSize: 12,
    outline: "none", transition: "border-color .2s, box-shadow .2s",
    fontFamily: T.fontMono, ...style
  }}
    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "#B8922A55"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 1px #B8922A18"; }}
    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = T.border; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
  />
);

const SelectField = ({ children, style, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { style?: React.CSSProperties }) => (
  <select {...props} style={{
    width: "100%", background: T.bg, border: `1px solid ${T.border}`,
    borderRadius: 0, padding: "10px 14px", color: T.text, fontSize: 12,
    outline: "none", transition: "border-color .2s, box-shadow .2s", fontFamily: T.fontMono,
    cursor: "pointer", appearance: "none", WebkitAppearance: "none" as any, MozAppearance: "none" as any,
    backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23B8922A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 34,
    ...style
  }}
    onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = "#B8922A55"; (e.target as HTMLSelectElement).style.boxShadow = "0 0 0 1px #B8922A18"; }}
    onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = T.border; (e.target as HTMLSelectElement).style.boxShadow = "none"; }}
  >
    {children}
  </select>
);

const TextareaField = ({ style, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { style?: React.CSSProperties }) => (
  <textarea {...props} style={{
    width: "100%", background: T.bg, border: `1px solid ${T.border}`,
    borderRadius: 0, padding: "12px 14px", color: T.text, fontSize: 11,
    outline: "none", resize: "vertical" as const, minHeight: 80, fontFamily: T.fontMono,
    lineHeight: 1.8, transition: "border-color .2s, box-shadow .2s", ...style
  }}
    onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = "#B8922A55"; (e.target as HTMLTextAreaElement).style.boxShadow = "0 0 0 1px #B8922A18"; }}
    onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = T.border; (e.target as HTMLTextAreaElement).style.boxShadow = "none"; }}
  />
);

const Tag = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button onClick={onClick} style={{
    padding: "5px 12px", borderRadius: 2, fontSize: 10, cursor: "pointer",
    border: `1px solid ${active ? T.gold : "#B8922A22"}`,
    background: active ? T.greenBg : "transparent",
    color: active ? T.gold : "#B8922A55",
    transition: "all .2s", fontFamily: T.fontMono, textTransform: "uppercase" as const, letterSpacing: "0.15em",
  }}>{label}</button>
);

const Section = ({ title, children, icon, accent }: { title: string; children: React.ReactNode; icon?: React.ReactNode; accent?: "gold" | "cyan" }) => {
  const color = accent === "cyan" ? T.cyan : T.gold;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 10, fontWeight: 700, color, textTransform: "uppercase" as const, letterSpacing: "0.24em", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 24, height: 2, background: color }} />
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
};

// ─── Validação de timing peri-workout vs schedule ─────────────────────────────
// Compara o horário de cada refeição peri-workout (pré/intra/pós) gerada pela IA
// com os horários reais do schedule semanal informado pelo coach.
type PeriKind = "pre_solido" | "pre_liquido" | "intra" | "pos_imediato" | "pos_solido";
interface TimingMismatch {
  refeicao: string;
  horario_plano: string;
  horario_esperado: string;
  delta_min: number;
  kind: PeriKind;
  treino_ref: string; // ex: "Seg 13:30 (60min)"
}

const parseHHmm = (s?: string): number | null => {
  if (!s) return null;
  const m = String(s).match(/(\d{1,2})\s*[:hH]\s*(\d{2})/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (isNaN(h) || isNaN(min)) return null;
  return h * 60 + min;
};
const formatMinutes = (mins: number): string => {
  const total = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
const detectPeriKind = (nome: string): PeriKind | null => {
  const n = nome.toLowerCase();
  if (/p[óo]s[\s-]?treino\s*imediato|janela\s*glut|glut[\s-]?4/.test(n)) return "pos_imediato";
  if (/p[óo]s[\s-]?treino\s*s[óo]lido/.test(n)) return "pos_solido";
  if (/p[óo]s[\s-]?treino/.test(n)) return "pos_imediato";
  if (/intra[\s-]?treino/.test(n)) return "intra";
  if (/pr[ée][\s-]?treino\s*l[íi]quido|pr[ée][\s-]?treino\s*whey/.test(n)) return "pre_liquido";
  if (/pr[ée][\s-]?treino/.test(n)) return "pre_solido";
  return null;
};

const validateTimingVsSchedule = (
  refeicoes: Array<{ refeicao?: string; horario?: string }> | undefined,
  schedule: WeeklySchedule | undefined,
): TimingMismatch[] => {
  if (!Array.isArray(refeicoes) || !schedule?.base) return [];
  const trainingDays = (Object.entries(schedule.base) as Array<[string, any]>)
    .filter(([, d]) => d?.is_training_day && d?.time)
    .map(([k, d]) => ({
      key: k,
      timeMin: parseHHmm(d.time),
      duration: Number(d.duration_min) || 60,
      label: `${k.toUpperCase()} ${d.time} (${d.duration_min || 60}min)`,
    }))
    .filter((d) => d.timeMin !== null) as Array<{ key: string; timeMin: number; duration: number; label: string }>;
  if (trainingDays.length === 0) return [];

  const expectedFor = (kind: PeriKind, time: number, dur: number): { min: number; max: number } => {
    switch (kind) {
      case "pre_solido": return { min: time - 105, max: time - 60 };  // ~90min antes ±15
      case "pre_liquido": return { min: time - 45, max: time - 15 };  // ~30min antes
      case "intra": return { min: time, max: time + dur };
      case "pos_imediato": return { min: time + dur, max: time + dur + 45 };
      case "pos_solido": return { min: time + dur + 45, max: time + dur + 120 };
    }
  };

  const out: TimingMismatch[] = [];
  for (const r of refeicoes) {
    const kind = detectPeriKind(r?.refeicao || "");
    if (!kind) continue;
    const planoMin = parseHHmm(r?.horario);
    if (planoMin === null) continue;
    // Para cada dia de treino, calcula o melhor encaixe e mantém o de menor delta.
    let best: TimingMismatch | null = null;
    for (const td of trainingDays) {
      const { min, max } = expectedFor(kind, td.timeMin, td.duration);
      const inRange = planoMin >= min && planoMin <= max;
      if (inRange) { best = null; break; }
      const delta = Math.min(Math.abs(planoMin - min), Math.abs(planoMin - max));
      const mid = Math.round((min + max) / 2);
      if (!best || delta < best.delta_min) {
        best = {
          refeicao: r.refeicao || "(sem nome)",
          horario_plano: r.horario || formatMinutes(planoMin),
          horario_esperado: `${formatMinutes(min)}–${formatMinutes(max)}`,
          delta_min: delta,
          kind,
          treino_ref: td.label,
        };
      }
      // se em algum dia ficou dentro do range, é válido — limpa o best
      if (inRange) { best = null; break; }
    }
    // Tolerância de 10min para evitar ruído
    if (best && best.delta_min > 10) out.push(best);
  }
  return out;
};

const PERI_KIND_LABEL: Record<PeriKind, string> = {
  pre_solido: "Pré-treino sólido",
  pre_liquido: "Pré-treino líquido",
  intra: "Intra-treino",
  pos_imediato: "Pós-treino imediato",
  pos_solido: "Pós-treino sólido",
};

// Recalcula o horário ideal de cada refeição peri-workout com base no schedule
// e devolve um novo array de refeições com horário corrigido (snap para o ponto
// médio da janela esperada do treino mais próximo). Não altera kcal/macros.
const autoFixPeriWorkoutTimings = (
  refeicoes: Array<{ refeicao?: string; horario?: string }> | undefined,
  schedule: WeeklySchedule | undefined,
): { refeicoes: any[]; fixedCount: number } => {
  if (!Array.isArray(refeicoes) || !schedule?.base) {
    return { refeicoes: refeicoes || [], fixedCount: 0 };
  }
  const trainingDays = (Object.entries(schedule.base) as Array<[string, any]>)
    .filter(([, d]) => d?.is_training_day && d?.time)
    .map(([, d]) => ({
      timeMin: parseHHmm(d.time),
      duration: Number(d.duration_min) || 60,
    }))
    .filter((d) => d.timeMin !== null) as Array<{ timeMin: number; duration: number }>;
  if (trainingDays.length === 0) return { refeicoes: refeicoes as any[], fixedCount: 0 };

  const expectedFor = (kind: PeriKind, time: number, dur: number): { min: number; max: number } => {
    switch (kind) {
      case "pre_solido": return { min: time - 105, max: time - 60 };
      case "pre_liquido": return { min: time - 45, max: time - 15 };
      case "intra": return { min: time, max: time + dur };
      case "pos_imediato": return { min: time + dur, max: time + dur + 45 };
      case "pos_solido": return { min: time + dur + 45, max: time + dur + 120 };
    }
  };

  let fixedCount = 0;
  const out = (refeicoes as any[]).map((r) => {
    const kind = detectPeriKind(r?.refeicao || "");
    if (!kind) return r;
    const planoMin = parseHHmm(r?.horario);
    if (planoMin === null) return r;
    // Procura o treino com janela mais próxima
    let bestTd: { timeMin: number; duration: number } | null = null;
    let bestDelta = Infinity;
    let bestInRange = false;
    for (const td of trainingDays) {
      const { min, max } = expectedFor(kind, td.timeMin, td.duration);
      if (planoMin >= min && planoMin <= max) { bestInRange = true; break; }
      const delta = Math.min(Math.abs(planoMin - min), Math.abs(planoMin - max));
      if (delta < bestDelta) { bestDelta = delta; bestTd = td; }
    }
    if (bestInRange || !bestTd || bestDelta <= 10) return r;
    const { min, max } = expectedFor(kind, bestTd.timeMin, bestTd.duration);
    const mid = Math.round((min + max) / 2);
    fixedCount += 1;
    return { ...r, horario: formatMinutes(mid) };
  });
  return { refeicoes: out, fixedCount };
};

type GrupoSub = "proteina" | "carbo" | "gordura" | "outro";
interface SubstituicaoItem {
  alimento: string;
  quantidade?: string;
  quantidade_g?: string;
  observacao?: string;
  grupo?: GrupoSub;
}
interface MealAlimento {
  alimento: string;
  quantidade?: string;
  quantidade_g?: string;
  observacao?: string;
  substituicoes?: SubstituicaoItem[];
}

interface Meal {
  refeicao: string;
  horario?: string;
  calorias?: number;
  kcal_declarada?: number | null;
  kcal_calculada?: number;
  alimentos?: MealAlimento[];
  macros?: { proteina?: number; carboidrato?: number; gordura?: number };
  // NutriPlan Elite — enriquecimento por refeição (opcional)
  funcao_metabolica?: string;
  janela_metabolica?: string;
  protocolo_peri_workout?: string;
  mensagem_mce?: string;
  insights_ia?: string[];
}

const formatQuantidadeG = (value?: string | number | null) => {
  const raw = value?.toString().trim();
  if (!raw) return null;
  return raw.toLowerCase().includes("g") ? raw : `${raw}g`;
};

const getSubstitutionQuantityDisplay = (substituto: Pick<SubstituicaoItem, "quantidade" | "quantidade_g">) => {
  const quantidade = substituto.quantidade?.toString().trim();
  if (quantidade) return quantidade;

  const quantidadeG = formatQuantidadeG(substituto.quantidade_g);
  return quantidadeG ? `≈ ${quantidadeG}` : "—";
};

// ============================================================
// FONTE ÚNICA DA VERDADE — kcal por Atwater (4/4/9)
// Toda a UI e exportações DEVEM passar por este helper.
// ============================================================
const KCAL_TOLERANCIA = 50;

/** Registro de uma divergência kcal para auditoria. */
type KcalDivergence = {
  scope: string;          // ex: "meal:R3 — Almoço" | "resumo"
  declarado: number;
  calculado: number;
  delta: number;          // declarado - calculado (com sinal)
  proteina: number;
  carboidrato: number;
  gordura: number;
  ts: number;
};

/** Auditor global de divergências (acumula durante a sessão). */
const kcalAudit = {
  total: 0,
  divergencias: [] as KcalDivergence[],
  reset() {
    this.total = 0;
    this.divergencias = [];
  },
  push(d: KcalDivergence) {
    this.total += 1;
    this.divergencias.push(d);
    // Mantém últimos 200 para evitar leak.
    if (this.divergencias.length > 200) this.divergencias.shift();
    // Log estruturado individual.
    console.warn(
      `[KCAL-AUDIT] divergência #${this.total} em "${d.scope}": declarado=${d.declarado} kcal vs Atwater=${d.calculado} kcal (Δ=${d.delta > 0 ? "+" : ""}${d.delta}) | macros: P${d.proteina} C${d.carboidrato} G${d.gordura}`,
    );
  },
  summary() {
    return {
      total: this.total,
      porEscopo: this.divergencias.reduce((acc: Record<string, number>, d) => {
        const key = d.scope.split(":")[0];
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      maiorGap: this.divergencias.reduce(
        (max, d) => (Math.abs(d.delta) > Math.abs(max?.delta ?? 0) ? d : max),
        null as KcalDivergence | null,
      ),
      ultimas: this.divergencias.slice(-10),
    };
  },
};

// Expõe no window para inspeção manual via DevTools: `__kcalAudit.summary()`
if (typeof window !== "undefined") {
  (window as unknown as { __kcalAudit?: typeof kcalAudit }).__kcalAudit = kcalAudit;
}

/** Atwater puro: kcal derivada exclusivamente dos macros (P*4 + C*4 + G*9). */
const calcKcalAtwater = (p?: number, c?: number, g?: number) =>
  Math.round((Number(p) || 0) * 4 + (Number(c) || 0) * 4 + (Number(g) || 0) * 9);

/**
 * Helper unificado. Recebe os macros e (opcionalmente) o valor declarado.
 * Retorna o declarado APENAS se a divergência ≤ ±50 kcal; caso contrário,
 * retorna o calculado por Atwater. Também usado para refeições e totais.
 *
 * Quando há divergência > tolerância, registra em `kcalAudit` para auditoria.
 */
const kcalFromMacros = (
  proteina?: number,
  carboidrato?: number,
  gordura?: number,
  declarado?: number,
  scope: string = "anonimo",
): number => {
  const calc = calcKcalAtwater(proteina, carboidrato, gordura);
  const decl = Number(declarado) || 0;
  if (!decl) return calc;
  const delta = decl - calc;
  if (Math.abs(delta) > KCAL_TOLERANCIA) {
    kcalAudit.push({
      scope,
      declarado: decl,
      calculado: calc,
      delta,
      proteina: Number(proteina) || 0,
      carboidrato: Number(carboidrato) || 0,
      gordura: Number(gordura) || 0,
      ts: Date.now(),
    });
    return calc;
  }
  return decl;
};

/** kcal de uma refeição — sempre via fonte única (kcal_calculada e calorias só são aceitos se baterem com Atwater). */
const getMealKcal = (m: Meal): number => {
  const declarado =
    typeof m?.kcal_calculada === "number" ? m.kcal_calculada : Number(m?.calorias) || 0;
  const scope = `meal:${m?.refeicao || "sem-nome"}`;
  return kcalFromMacros(m?.macros?.proteina, m?.macros?.carboidrato, m?.macros?.gordura, declarado, scope);
};

/** kcal total do dia — sempre via fonte única. */
const getResumoKcal = (
  resumo:
    | { calorias_totais?: number; proteina_total?: number; carboidrato_total?: number; gordura_total?: number }
    | null
    | undefined,
): number => {
  if (!resumo) return 0;
  return kcalFromMacros(
    resumo.proteina_total,
    resumo.carboidrato_total,
    resumo.gordura_total,
    resumo.calorias_totais,
    "resumo",
  );
};

interface Suplemento {
  suplemento: string;
  dose: string;
  timing: string;
  justificativa: string;
}

interface PlanoData {
  resumo: {
    nome: string;
    objetivo: string;
    calorias_totais: number;
    proteina_total: number;
    carboidrato_total: number;
    gordura_total: number;
    tmb: number;
    get: number;
    imc: string;
    observacao_protocolo?: string | null;
  };
  refeicoes: Meal[];
  suplementacao?: Suplemento[];
  dica_mce?: { mindset: string; comportamento: string; execucao: string };
  alerta_coach?: string | null;
  inteligencia_fisiologica?: {
    score_qualidade?: number;
    diversidade_vegetal_semanal?: number;
    fermentado_diario?: boolean;
    cycling_ativo?: boolean;
    protocolos_ativos?: string[];
    insights_coach?: string[];
  };
  custo_estimado?: {
    moeda?: string;
    modo_economico_ativo?: boolean;
    custo_diario_economico?: number;
    custo_diario_padrao_equivalente?: number;
    economia_diaria?: number;
    economia_percentual?: number;
    custo_mensal_economico?: number;
    economia_mensal?: number;
    refeicoes?: { refeicao: string; custo_economico: number; custo_padrao: number; economia: number }[];
    premissas?: string;
    principais_substituicoes?: { de: string; para: string; economia_aprox: string }[];
  };
  mapa_medidas_caseiras?: {
    ativo?: boolean;
    descricao?: string;
    equivalencias?: { medida: string; gramatura: string; alimento_referencia?: string; observacao?: string | null }[];
    utensilios_padrao?: { utensilio: string; volume_ml?: number; peso_referencia_g?: string }[];
    dica_paciente?: string;
  };
}

const GRUPO_META: Record<GrupoSub, { label: string; color: string; emoji: string }> = {
  proteina: { label: "Proteína", color: T.blue, emoji: "🥩" },
  carbo: { label: "Carbo", color: T.amber, emoji: "🍚" },
  gordura: { label: "Gordura", color: "#f472b6", emoji: "🥑" },
  outro: { label: "Outro", color: T.muted, emoji: "🍽️" },
};

const inferGrupo = (s: SubstituicaoItem): GrupoSub => {
  if (s.grupo && GRUPO_META[s.grupo]) return s.grupo;
  const t = (s.alimento || "").toLowerCase();
  if (/(frango|carne|peixe|atum|tilapia|salmão|salmao|ovo|clara|whey|isolado|caseína|caseina|iogurte|cottage|queijo|tofu|presunto|peru|patinho|alcatra)/.test(t)) return "proteina";
  if (/(arroz|batata|mandioca|inhame|aveia|pão|pao|tapioca|macarrão|macarrao|feijão|feijao|lentilha|grão|grao|fruta|banana|maçã|maca|melão|melao|mamão|mamao|uva|laranja|cuscuz|granola|cereal)/.test(t)) return "carbo";
  if (/(azeite|óleo|oleo|abacate|castanha|amêndoa|amendoa|nozes|amendoim|pasta de amendoim|coco|manteiga|gergelim|chia|linhaça|linhaca)/.test(t)) return "gordura";
  return "outro";
};

// ─── Enricher: mescla substitutos da IA com SUBSTITUTION_BANK_V2 (mais variações) ──
const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const CATEGORY_TO_GRUPO: Record<FoodCategoryV2, GrupoSub> = {
  peixe: "proteina",
  frutos_do_mar: "proteina",
  carne_vermelha: "proteina",
  ave: "proteina",
  porco: "proteina",
  laticinios: "proteina",
  shake: "proteina",
  fruta: "carbo",
  vegetal: "carbo",
  legume_tuberculo: "carbo",
};

// dado um horário "HH:MM", encontra o MealBlockV2 mais próximo
const findBlockByHorario = (horario?: string) => {
  if (!horario || !SUBSTITUTION_BANK_V2.length) return null;
  const [h, m] = horario.split(":").map((x) => parseInt(x, 10));
  if (isNaN(h)) return null;
  const target = h * 60 + (isNaN(m) ? 0 : m);
  let best = SUBSTITUTION_BANK_V2[0];
  let bestDiff = Infinity;
  for (const b of SUBSTITUTION_BANK_V2) {
    const [bh, bm] = b.horario.split(":").map((x) => parseInt(x, 10));
    const t = bh * 60 + (isNaN(bm) ? 0 : bm);
    const diff = Math.abs(t - target);
    if (diff < bestDiff) { bestDiff = diff; best = b; }
  }
  return best;
};

// Enriquece os substitutos de um alimento com itens do banco V2 (mesma refeição)
// IMPORTANTE: filtra apenas itens do MESMO grupo macronutriente do alimento original
// (carboidrato → só carboidratos; proteína → só proteínas; gordura → só gorduras).
const enrichSubstitutes = (
  alimento: MealAlimento,
  mealHorario?: string
): SubstituicaoItem[] => {
  // grupo do alimento original (referência para filtragem)
  const grupoRef: GrupoSub = inferGrupo({ alimento: alimento.alimento } as SubstituicaoItem);

  const original: SubstituicaoItem[] = (alimento.substituicoes || [])
    .map((s) => ({ ...s, grupo: inferGrupo(s) }))
    // descarta substitutos de grupo diferente vindos da IA (ex.: gordura no lugar de carbo)
    .filter((s) => grupoRef === "outro" || s.grupo === grupoRef || s.grupo === "outro");

  const block = findBlockByHorario(mealHorario);
  if (!block) return original;

  const aliNorm = norm(alimento.alimento);
  const matchPrincipal = block.alimentos.find((a) => {
    const n = norm(a.nome);
    return n === aliNorm || n.includes(aliNorm) || aliNorm.includes(n);
  });

  const pool: { nome: string; medida: string; gramatura: number; grupo: GrupoSub; nota: string }[] = [];
  const pushItem = (s: { nome: string; medida_caseira: string; gramatura_g: number; categoria: FoodCategoryV2; nota: string }) => {
    const grupo = CATEGORY_TO_GRUPO[s.categoria] || "outro";
    // ⛔ só aceita substitutos do mesmo macronutriente do alimento original
    if (grupoRef !== "outro" && grupo !== grupoRef) return;
    pool.push({
      nome: s.nome,
      medida: s.medida_caseira,
      gramatura: s.gramatura_g,
      grupo,
      nota: s.nota,
    });
  };

  // Inferir grupo de um MainFoodV2 a partir do nome ou da categoria do 1º substituto
  const grupoDoPrincipal = (a: typeof block.alimentos[number]): GrupoSub => {
    const g = inferGrupo({ alimento: a.nome } as SubstituicaoItem);
    if (g !== "outro") return g;
    const cat = a.substitutos?.[0]?.categoria as FoodCategoryV2 | undefined;
    return cat ? (CATEGORY_TO_GRUPO[cat] || "outro") : "outro";
  };

  if (matchPrincipal) {
    matchPrincipal.substitutos.forEach(pushItem);
    if (norm(matchPrincipal.nome) !== aliNorm) {
      const grupoPrinc = grupoDoPrincipal(matchPrincipal);
      if (grupoRef === "outro" || grupoPrinc === grupoRef) {
        pool.push({
          nome: matchPrincipal.nome,
          medida: matchPrincipal.medida_caseira,
          gramatura: matchPrincipal.gramatura_g,
          grupo: grupoPrinc,
          nota: matchPrincipal.nota_nutricional,
        });
      }
    }
  }
  // Variação extra: outros principais da mesma refeição — SOMENTE se forem do mesmo grupo
  block.alimentos.forEach((a) => {
    if (matchPrincipal && a.id === matchPrincipal.id) return;
    const grupoA = grupoDoPrincipal(a);
    if (grupoRef !== "outro" && grupoA !== grupoRef) return;
    a.substitutos.forEach(pushItem);
  });

  const seen = new Set<string>();
  original.forEach((s) => seen.add(norm(s.alimento)));
  const extras: SubstituicaoItem[] = [];
  for (const p of pool) {
    const key = norm(p.nome);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    extras.push({
      alimento: p.nome,
      quantidade: p.medida,
      quantidade_g: `${p.gramatura}g`,
      observacao: p.nota,
      grupo: p.grupo,
    });
  }
  return [...original, ...extras];
};

// Remove o "(HH:MM ...)" do nome da refeição para evitar duplicação com o badge de horário
const stripHorarioFromTitle = (titulo: string, horario?: string): string => {
  if (!titulo) return titulo;
  let t = titulo;
  if (horario) {
    // remove "(HH:MM - ...)" inteiro se começar com o mesmo horário
    const re = new RegExp(`\\s*\\(\\s*${horario.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s*[-–—]?\\s*([^)]*)\\)\\s*$`);
    t = t.replace(re, (_m, resto) => (resto && resto.trim() ? ` — ${resto.trim()}` : ""));
  }
  // fallback: remove qualquer "(HH:MM ...)" no fim
  t = t.replace(/\s*\(\s*\d{1,2}:\d{2}\s*[-–—]?\s*([^)]*)\)\s*$/, (_m, resto) => (resto && resto.trim() ? ` — ${resto.trim()}` : ""));
  return t.trim();
  };

interface MealCardProps {
  meal: Meal;
  index: number;
  onSwap: (alimentoIdx: number, sub: SubstituicaoItem) => void;
  workoutTag?: "pre" | "post" | null;
}

const MealCard = ({ meal, index, onSwap, workoutTag }: MealCardProps) => {
  const colors = [T.green, T.blue, T.amber, "#a78bfa", "#f472b6", "#34d399", "#fb923c"];
  const color = colors[index % colors.length];
  const [openSubs, setOpenSubs] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<Record<number, GrupoSub | "todos">>({});
  const [search, setSearch] = useState<Record<number, string>>({});

  return (
    <div style={{ border: `1px solid ${T.border}`, borderLeft: workoutTag ? `3px solid ${workoutTag === "pre" ? T.amber : T.green}` : `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 12, background: T.card }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ width: 3, height: 20, background: color, borderRadius: 2 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{stripHorarioFromTitle(meal.refeicao, meal.horario)}</span>
          {meal.horario && <span style={{ fontSize: 11, color: T.muted, background: T.bg3, padding: "2px 8px", borderRadius: 999 }}>{meal.horario}</span>}
          {workoutTag === "pre" && (
            <span style={{ fontSize: 10, fontWeight: 700, color: T.amber, background: `${T.amber}1f`, border: `1px solid ${T.amber}55`, padding: "2px 8px", borderRadius: 999, letterSpacing: "0.04em" }}>⚡ PRÉ-TREINO</span>
          )}
          {workoutTag === "post" && (
            <span style={{ fontSize: 10, fontWeight: 700, color: T.green, background: `${T.green}1f`, border: `1px solid ${T.green}55`, padding: "2px 8px", borderRadius: 999, letterSpacing: "0.04em" }}>💪 PÓS-TREINO</span>
          )}
        </div>
        {(() => {
          const kcalCalc = getMealKcal(meal);
          const kcalDecl = typeof meal.kcal_declarada === "number" ? meal.kcal_declarada : (typeof meal.calorias === "number" && meal.kcal_calculada == null ? meal.calorias : null);
          const divergente = kcalDecl != null && Math.abs(kcalDecl - kcalCalc) > 30;
          if (!kcalCalc) return null;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color, fontWeight: 600 }}>{kcalCalc} kcal</span>
              {divergente && (
                <span
                  title={`Valor declarado pela IA: ${kcalDecl} kcal — recalculado pela fórmula Atwater (P×4 + C×4 + G×9): ${kcalCalc} kcal`}
                  style={{ fontSize: 9, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.4)", padding: "1px 6px", borderRadius: 999 }}
                >
                  ⚠ Δ{Math.abs((kcalDecl as number) - kcalCalc)}
                </span>
              )}
            </div>
          );
        })()}
      </div>
      <div style={{ padding: "12px 16px" }}>
        {meal.alimentos?.map((a, i) => {
          const subs: SubstituicaoItem[] = enrichSubstitutes(a, meal.horario);
          const open = !!openSubs[i];
          const f = filter[i] || "todos";
          const q = (search[i] || "").trim().toLowerCase();
          const filteredSubs = subs.filter((s) =>
            (f === "todos" || s.grupo === f) &&
            (!q || s.alimento.toLowerCase().includes(q))
          );

          return (
            <div key={i} style={{ padding: "6px 0", borderBottom: i < (meal.alimentos?.length || 0) - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: T.text }}>{a.alimento}</span>
                  {a.observacao && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{a.observacao}</div>}
                  {subs.length > 0 && (
                    <button
                      onClick={() => setOpenSubs((s) => ({ ...s, [i]: !s[i] }))}
                      style={{
                        marginTop: 6, padding: "3px 10px", borderRadius: 999,
                        background: open ? T.greenBg : "transparent",
                        border: `1px solid ${open ? T.green : T.border2}`,
                        color: open ? T.green : T.muted,
                        fontSize: 10, cursor: "pointer", fontFamily: "inherit",
                        display: "inline-flex", alignItems: "center", gap: 6,
                      }}
                    >
                      ⇄ {subs.length} substituto{subs.length > 1 ? "s" : ""} {open ? "▲" : "▼"}
                    </button>
                  )}
                </div>
                {(() => {
                  // Sanitiza: se a IA mandou texto placeholder ("ajustar pela meta", "a definir", etc.)
                  // ou veio vazio, fazemos fallback usando quantidade_g ou um valor padrão visível.
                  const raw = (a.quantidade || "").toString().trim();
                  // "1 porção" sozinho é placeholder; mas "1 porção média (~100g)" não é.
                  const hasNumber = /\d/.test(raw);
                  const looksLikePlaceholder = !raw || /^(ajustar|definir|a definir|meta|conforme|porç(ã|a)o|a gosto|n\/a|--+)/i.test(raw) || (!hasNumber);
                  const isJust1Porcao = /^1\s*porç(ã|a)o\s*$/i.test(raw);
                  const isPlaceholder = looksLikePlaceholder || isJust1Porcao;
                  const qtdG = (a.quantidade_g || "").toString().trim();
                  const display = !isPlaceholder
                    ? raw
                    : (qtdG && /\d/.test(qtdG) ? qtdG : "1 porção média");
                  const showApprox = qtdG && /\d/.test(qtdG) && qtdG.replace(/\s/g, "").toLowerCase() !== display.replace(/\s/g, "").toLowerCase();
                  return (
                    <span style={{ fontSize: 12, color: T.text, whiteSpace: "nowrap", textAlign: "right", fontWeight: 600 }}>
                      {display}
                      {showApprox && (
                        <span style={{ display: "block", fontSize: 10, color: T.muted2, fontWeight: 600 }}>
                          ≈ {qtdG}
                        </span>
                      )}
                    </span>
                  );
                })()}
              </div>

              {open && subs.length > 0 && (
                <div style={{ marginTop: 10, padding: 12, background: T.bg2, border: `1px dashed ${T.border2}`, borderRadius: 10 }}>
                  <div style={{ fontSize: 9, color: T.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 700 }}>
                    Substitutos isocalóricos
                  </div>

                  <input
                    value={search[i] || ""}
                    onChange={(e) => setSearch((s) => ({ ...s, [i]: e.target.value }))}
                    placeholder="Buscar substituto..."
                    style={{
                      width: "100%", background: T.bg3, border: `1px solid ${T.border2}`,
                      borderRadius: 8, padding: "7px 10px", color: T.text, fontSize: 12,
                      outline: "none", fontFamily: "inherit", marginBottom: 8,
                    }}
                  />

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {(["todos", "proteina", "carbo", "gordura"] as const).map((g) => {
                      const active = f === g;
                      const meta = g === "todos" ? { label: "Todos", color: T.green, emoji: "✦" } : GRUPO_META[g];
                      return (
                        <button
                          key={g}
                          onClick={() => setFilter((s) => ({ ...s, [i]: g }))}
                          style={{
                            padding: "3px 10px", borderRadius: 999, fontSize: 10,
                            border: `1px solid ${active ? meta.color : T.border2}`,
                            background: active ? `${meta.color}22` : "transparent",
                            color: active ? meta.color : T.muted,
                            cursor: "pointer", fontFamily: "inherit",
                          }}
                        >
                          {meta.emoji} {meta.label}
                        </button>
                      );
                    })}
                  </div>

                  {filteredSubs.length === 0 ? (
                    <div style={{ fontSize: 11, color: T.muted2, textAlign: "center", padding: "10px 0" }}>
                      Nenhum substituto encontrado.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                      {filteredSubs.map((sub, si) => {
                        const meta = GRUPO_META[(sub.grupo as GrupoSub) || "outro"];
                        return (
                          <div
                            key={si}
                            style={{
                              background: T.bg3, border: `1px solid ${T.border2}`,
                              borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 6,
                            }}
                          >
                            <span style={{
                              alignSelf: "flex-start",
                              fontSize: 9, padding: "2px 6px", borderRadius: 999,
                              background: `${meta.color}22`, color: meta.color, fontWeight: 700,
                              textTransform: "uppercase", letterSpacing: "0.05em",
                            }}>{meta.emoji} {meta.label}</span>
                            <div style={{ fontSize: 12, color: T.text, fontWeight: 600, lineHeight: 1.3 }}>{sub.alimento}</div>
                            {(() => {
                              const qtd = getSubstitutionQuantityDisplay(sub);
                              const qtdG = formatQuantidadeG(sub.quantidade_g);
                              const showApprox = sub.quantidade?.toString().trim() && qtdG && qtdG.replace(/\s/g, "").toLowerCase() !== sub.quantidade.toString().trim().replace(/\s/g, "").toLowerCase();
                              return (
                                <div style={{ fontSize: 11, color: T.muted }}>
                                  {qtd}
                                  {showApprox && (
                                    <span style={{ marginLeft: 6, fontSize: 10, color: T.muted2 }}>≈ {qtdG}</span>
                                  )}
                                </div>
                              );
                            })()}
                            {sub.observacao && <div style={{ fontSize: 10, color: T.muted2, fontStyle: "italic" }}>{sub.observacao}</div>}
                            <button
                              onClick={() => onSwap(i, sub)}
                              style={{
                                marginTop: 2, padding: "5px 8px", borderRadius: 6,
                                background: T.greenBg, border: `1px solid ${T.green}`,
                                color: T.green, fontSize: 10, fontWeight: 700,
                                cursor: "pointer", fontFamily: "inherit",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                              }}
                            >
                              ⇄ Trocar agora
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {(meal.funcao_metabolica || meal.janela_metabolica || meal.protocolo_peri_workout || meal.mensagem_mce || (meal.insights_ia && meal.insights_ia.length)) && (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: T.bg2, border: `1px dashed ${T.green}55`, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 9, color: T.green, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>NutriPlan Elite</div>
            {meal.funcao_metabolica && (
              <div style={{ fontSize: 11, color: T.text }}><span style={{ color: T.green, fontWeight: 700 }}>◆ Função:</span> {meal.funcao_metabolica}</div>
            )}
            {meal.janela_metabolica && (
              <div style={{ fontSize: 11, color: T.text }}><span style={{ color: T.amber, fontWeight: 700 }}>◷ Janela:</span> {meal.janela_metabolica}</div>
            )}
            {meal.protocolo_peri_workout && (
              <div style={{ fontSize: 11, color: T.text }}><span style={{ color: T.blue, fontWeight: 700 }}>⚡ Peri-treino:</span> {meal.protocolo_peri_workout}</div>
            )}
            {meal.mensagem_mce && (
              <div style={{ fontSize: 11, color: T.text, fontStyle: "italic" }}><span style={{ color: T.green, fontWeight: 700 }}>MCE:</span> {meal.mensagem_mce}</div>
            )}
            {meal.insights_ia?.map((ins, ii) => (
              <div key={ii} style={{ fontSize: 11, color: T.muted }}>💡 {ins}</div>
            ))}
          </div>
        )}
        {meal.macros && (
          <div style={{ display: "flex", gap: 12, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
            {([["P", meal.macros.proteina, T.blue], ["C", meal.macros.carboidrato, T.amber], ["G", meal.macros.gordura, "#f472b6"]] as [string, number | undefined, string][]).map(([l, v, c]) => v != null && (
              <div key={l} style={{ fontSize: 11, color: T.muted }}>
                <span style={{ color: c, fontWeight: 700 }}>{l} </span>{v}g
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function PlanoAlimentarIA() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [plano, setPlano] = useState<PlanoData | null>(null);
  const [planoComparativo, setPlanoComparativo] = useState<PlanoData | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [eliteEdit, setEliteEdit] = useState(false);
  const [eliteAllOpen, setEliteAllOpen] = useState(false);
  // NutriPlan Elite — Modo especial + Aderência
  const [modoEspecial, setModoEspecial] = useState<"normal" | "competicao" | "glp1" | "feminino" | "vegano" | "low_fodmap" | "longevidade">("normal");
  const [faseCiclo, setFaseCiclo] = useState<"folicular" | "ovulatoria" | "lutea" | "menstrual">("folicular");
  const [diasComp, setDiasComp] = useState<number>(7);
  // Dimensão 2 — Crononutrição Circadiana Avançada (cortisol/insulina/GH)
  const [cronoCircadiano, setCronoCircadiano] = useState<boolean>(false);
  const [showAdherence, setShowAdherence] = useState(false);
  const [adherenceItems, setAdherenceItems] = useState<any[]>([]);
  const [adherenceLoading, setAdherenceLoading] = useState(false);
  // Modal de revisão do protocolo farmacológico (recálculo determinístico)
  const [showProtocoloModal, setShowProtocoloModal] = useState(false);
  const [protocoloDraft, setProtocoloDraft] = useState("");
  const [protocoloRecalc, setProtocoloRecalc] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState<{
    kind: "validation" | "unavailable" | "timeout" | "rate_limit" | "credits" | "invalid_json" | "network" | "unknown";
    title: string;
    description: string;
    technical?: string;
    canRetry: boolean;
  } | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [autoRetrying, setAutoRetrying] = useState(false);
  const [autoRetryAttempt, setAutoRetryAttempt] = useState(0);
  const MAX_AUTO_RETRIES = 4;
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);
  const [patients, setPatients] = useState<{ user_id: string; name: string }[]>([]);
  const [partnersList, setPartnersList] = useState<{ id: string; user_id: string | null; name: string; email?: string }[]>([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipientType, setRecipientType] = useState<"aluno" | "parceiro">("aluno");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [sendObs, setSendObs] = useState("");
  const [sending, setSending] = useState(false);
  // ─── Contexto Clínico do Coach (novo campo aditivo) ─────────────────────────
  const [contextoClinico, setContextoClinico] = useState("");
  const [contextoHistoryOpen, setContextoHistoryOpen] = useState(false);
  const [contextoHistory, setContextoHistory] = useState<Array<{ texto: string; data: string; paciente?: string }>>(() => {
    try {
      const raw = localStorage.getItem("nutrion_coach_contexts");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const CONTEXT_CHIPS = [
    "Resistência insulínica", "Carb cycling", "Alta atividade NEAT",
    "Retenção hídrica", "Atleta competição", "GLP-1 ativo",
    "Protocolo cetogênico", "Refeição snap",
  ];
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const toggleContextChip = (chip: string) => {
    setActiveChips((prev) => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
    setContextoClinico((prev) => {
      if (prev.includes(chip)) return prev;
      const sep = prev.trim() ? (prev.trim().endsWith(".") ? " " : ". ") : "";
      return `${prev}${sep}${chip}`.slice(0, 1500);
    });
  };
  const saveContextoToHistory = (pacienteName?: string) => {
    const txt = contextoClinico.trim();
    if (!txt) return;
    try {
      const entry = { texto: txt, data: new Date().toISOString(), paciente: pacienteName || "" };
      const next = [entry, ...contextoHistory.filter(h => h.texto !== txt)].slice(0, 5);
      setContextoHistory(next);
      localStorage.setItem("nutrion_coach_contexts", JSON.stringify(next));
    } catch { /* noop */ }
  };
  // Histórico
  const [showHistory, setShowHistory] = useState(false);
  // Substituições NUTRION (módulo embutido)
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  // Periodização (Gantt)
  const [showGantt, setShowGantt] = useState(false);
  // Check-ins semanais
  const [showCheckins, setShowCheckins] = useState(false);
  const [checkinsPatientId, setCheckinsPatientId] = useState("");
  // Grade semanal de refeições
  const [showWeekGrid, setShowWeekGrid] = useState(false);
  const [weekGridPatientId, setWeekGridPatientId] = useState("");
  const [ganttPatientId, setGanttPatientId] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  // Histórico de comparações
  const [savingComparison, setSavingComparison] = useState(false);
  const [savedComparisonId, setSavedComparisonId] = useState<string | null>(null);
  const [showCompareHistory, setShowCompareHistory] = useState(false);
  const [compareHistory, setCompareHistory] = useState<any[]>([]);
  const [loadingCompareHistory, setLoadingCompareHistory] = useState(false);
  const [adjustHistory, setAdjustHistory] = useState<any[]>([]);
  const [loadingAdjustHistory, setLoadingAdjustHistory] = useState(false);
  const [showAdjustHistory, setShowAdjustHistory] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Carrega histórico de ajustes calóricos (filtra pelo nome do paciente atual quando houver)
  const loadAdjustHistory = async () => {
    if (!coachProfileId) return;
    setLoadingAdjustHistory(true);
    try {
      const patientName: string | undefined =
        (plano as any)?.resumo?.nome || (form as any)?.nome;
      let q: any = (supabase as any)
        .from("coach_plan_adjustments")
        .select(
          "id, patient_name, objetivo, target_kcal, total_antes, total_depois, delta_kcal, fator, dentro_da_banda, aplicado, status_msg, created_at",
        )
        .eq("coach_id", coachProfileId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (patientName) q = q.ilike("patient_name", patientName);
      const { data } = await q;
      setAdjustHistory(data || []);
    } finally {
      setLoadingAdjustHistory(false);
    }
  };

  useEffect(() => {
    if (coachProfileId && plano) {
      loadAdjustHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachProfileId, (plano as any)?.ajuste_calorico_id]);

  const loadHistory = async () => {
    if (!coachProfileId) return;
    setLoadingHistory(true);
    const { data } = await supabase
      .from("coach_meal_plans")
      .select("id, patient_name, objetivo, status, created_at, sent_at, plano, observacao, patient_user_id")
      .eq("coach_id", coachProfileId)
      .order("created_at", { ascending: false })
      .limit(100);
    setHistory(data || []);
    setLoadingHistory(false);
  };

  // NutriPlan Elite — Aderência: carrega meals_saved do paciente vinculado
  const openAdherence = async () => {
    const patientId = (form as any)?.patientUserId;
    if (!patientId) {
      toast({ title: "Selecione um paciente vinculado", description: "A aderência é calculada a partir do diário do paciente.", variant: "destructive" });
      return;
    }
    setShowAdherence(true);
    setAdherenceLoading(true);
    try {
      const since = new Date(); since.setDate(since.getDate() - 14);
      const { data } = await supabase
        .from("meals_saved")
        .select("meal_type, kcal, protein_g, carbs_g, fat_g, confirmed, eaten_at")
        .eq("user_id", patientId)
        .gte("eaten_at", since.toISOString())
        .order("eaten_at", { ascending: false })
        .limit(500);
      const items = (data || []).map((m: any) => {
        const dt = new Date(m.eaten_at);
        // 0=Mon ... 6=Sun (semana ISO)
        const dow = (dt.getDay() + 6) % 7;
        return {
          day_index: dow,
          meal_type: m.meal_type,
          kcal: Number(m.kcal) || 0,
          protein_g: Number(m.protein_g) || 0,
          carbs_g: Number(m.carbs_g) || 0,
          fat_g: Number(m.fat_g) || 0,
          confirmed: !!m.confirmed,
        };
      });
      setAdherenceItems(items);
    } finally {
      setAdherenceLoading(false);
    }
  };

  // Load coach profile + patients
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: cp } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cp?.id) return;
      setCoachProfileId(cp.id);

      const { data: pts } = await supabase
        .from("coach_patients")
        .select("patient_user_id")
        .eq("coach_id", cp.id)
        .eq("status", "active");

      if (pts?.length) {
        const ids = pts.map((p) => p.patient_user_id);
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", ids);
        setPatients(
          pts.map((p) => ({
            user_id: p.patient_user_id,
            name: profs?.find((x) => x.user_id === p.patient_user_id)?.full_name || "Aluno",
          }))
        );
      }

      // Parceiros criados pelo coach (auth user_id)
      const { data: prs } = await supabase
        .from("partners")
        .select("id, user_id, full_name, email")
        .eq("created_by", user.id);
      if (prs?.length) {
        setPartnersList(
          prs.map((p) => ({
            id: p.id,
            user_id: p.user_id,
            name: p.full_name || "Parceiro",
            email: p.email || undefined,
          }))
        );
      }
    })();
  }, [user?.id]);

  const [form, setForm] = useState({
    nome: "", idade: "", sexo: "masculino", peso: "", altura: "",
    objetivo: "emagrecimento", perfilPCA: "executor",
    nivelAtividade: "moderado", treino: "musculacao",
    restricoes: [] as string[], outraRestricao: "",
    preferencias: "", suplementos: "", observacoes: "",
    refeicoes: "5", calorias: "", protocolo: "nenhum",
    // Fase de periodização
    fasePeriodizacao: "manutencao_offseason",
    bfAtual: "", bfMeta: "", dataCompeticao: "",
    // Anos de treino + método de estimativa de BF (seleção de fórmula TMB)
    anosTreino: "" as string,
    metodoBF: "tenho_bf" as "tenho_bf" | "navy" | "visual" | "nao_sei",
    circPescoco: "" as string,
    circAbdomen: "" as string,
    circQuadril: "" as string,
    perfilVisual: "" as string,
    // Cardio
    fazCardio: false,
    cardioModalidades: [] as string[],
    cardioFrequencia: "3x",
    cardioDuracao: "30min",
    cardioQuando: "pos_treino",
    cardioNoCalculo: true,
    // Recursos ergogênicos
    protocoloFarmacologico: "",
    atletaCompetitivo: false,
    federacaoCategoria: "",
    // GLUT-4 Pós-Treino
    glut4Enabled: false,
    glut4UsesIntraMalto: true,
    glut4IntraMaltoG: "60",
    glut4TimingMin: "30",
    glut4CarbSource: "doce_de_leite",
    glut4CarbGrams: "",
    glut4AddLeucine: false,
    // Perfil Fisiológico Avançado (Elite)
    historicoIntestinal: "",
    fermentadosAtual: "",
    sensibilidadeInsulina: "",
    objetivosSecundarios: [] as string[],
    variedadeFuncional: false,
    diversidadeAlimentarElite: false,
    protocoloMicrobiota: false,
    cyclingCarbo: false,
    cronobiologiaAtiva: false,
    hidratacaoFarmacologica: false,
    modoEconomico: false,
    medidasCaseiras: false,
    // Preferências de unidades caseiras (usadas quando medidasCaseiras = true)
    medidasPrefs: {
      colher: "sopa" as "sopa" | "cha" | "ambas",
      xicara: "cha_240" as "cha_240" | "grande_300" | "ambas",
      copo: "americano_200" as "americano_200" | "grande_300" | "ambas",
      concha: "media_80" as "pequena_50" | "media_80" | "grande_120",
      proteinaUnidade: "palma" as "palma" | "filé_tamanho" | "gramas_visuais",
      usarPunhado: true,
      usarFatias: true,
      observacoesMedidas: "",
    },
    // Perfil econômico (independente do toggle modoEconomico — mais granular)
    perfilEconomico: "intermediario" as "economico" | "intermediario" | "premium",
    alimentosDisponiveis: [] as string[],
    outrosAlimentos: "",
    // Frutas que o paciente tem em casa (prioridade no plano + sugestão de upgrade)
    frutasEmCasa: [] as string[],
    outrasFrutas: "",
    // BLOCO 11 — campos para cálculo determinístico expandido
    neat: "medio" as "baixo" | "medio" | "alto",
    qualidadeSono: "boa" as "boa" | "regular" | "ruim",
    semanasEmDeficit: "" as string,
    // NutriPlan Elite — multi-select de compostos farmacológicos ativos do paciente
    compostosAtivos: [] as string[],
  });

  // Lista canônica Dr. VERTEX para o multi-select de Compostos Ativos
  const COMPOSTOS_VERTEX = [
    "Ipamorelin", "CJC-1295", "MK-677 (Ibutamoren)", "Tesamorelin",
    "Semaglutida", "Tirzepatida", "Retatrutide",
    "Testosterona", "Nandrolona (Deca)", "Oxandrolona (Anavar)", "Trembolona", "Boldenona",
    "MK-2866 (Ostarine)", "LGD-4033", "RAD-140",
    "SLU-PP-332", "Cardarine (GW-501516)",
    "BPC-157", "TB-500",
    "T3 (Liotironina)", "Clenbuterol", "Insulina",
  ];
  const toggleComposto = (c: string) => {
    setForm(f => {
      const cur = f.compostosAtivos || [];
      const next = cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c];
      return { ...f, compostosAtivos: next };
    });
  };

  // Estado de UI para a seção colapsável Elite
  const [perfilFisioOpen, setPerfilFisioOpen] = useState(false);

  // GLUT-4 output state
  const [glut4Text, setGlut4Text] = useState<string>("");
  const [glut4Loading, setGlut4Loading] = useState(false);

  // Rotina de treino semanal (TrainingSchedule)
  const [trainingSchedule, setTrainingSchedule] = useState<WeeklySchedule>(defaultWeeklySchedule);

  // Auto-ativar Cycling quando fase = Bulk ou Recomposição
  useEffect(() => {
    if (form.fasePeriodizacao === "bulk_limpo" || form.fasePeriodizacao === "bulk_agressivo" || form.fasePeriodizacao === "recomposicao") {
      setForm(f => f.cyclingCarbo ? f : { ...f, cyclingCarbo: true });
    }
  }, [form.fasePeriodizacao]);

  // Auditoria kcal: zera contador a cada novo plano e emite sumário consolidado.
  useEffect(() => {
    if (!plano) return;
    kcalAudit.reset();
    // Força recálculo (que vai popular kcalAudit via getMealKcal/getResumoKcal).
    (plano.refeicoes || []).forEach((m) => getMealKcal(m as Meal));
    getResumoKcal(plano.resumo);
    const s = kcalAudit.summary();
    if (s.total > 0) {
      console.group(`%c[KCAL-AUDIT] ${s.total} divergência(s) detectada(s) no plano "${plano.resumo?.nome ?? "?"}"`, "color:#f59e0b;font-weight:bold");
      console.log("Por escopo:", s.porEscopo);
      if (s.maiorGap) console.log("Maior gap:", s.maiorGap);
      console.table(s.ultimas.map(d => ({
        escopo: d.scope, declarado: d.declarado, atwater: d.calculado, delta: d.delta,
        P: d.proteina, C: d.carboidrato, G: d.gordura,
      })));
      console.log("Inspecione manualmente: window.__kcalAudit.summary()");
      console.groupEnd();
    } else {
      console.info(`[KCAL-AUDIT] ✓ Plano "${plano.resumo?.nome ?? "?"}" consistente (0 divergências > ±${KCAL_TOLERANCIA} kcal).`);
    }
  }, [plano]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k: string, v: string) => {
    const arr = (form as any)[k] as string[];
    set(k, arr.includes(v) ? arr.filter((x: string) => x !== v) : [...arr, v]);
  };

  const restricoesOpts = ["Lactose", "Glúten", "Frutos do mar", "Amendoim", "Ovo", "Soja", "Vegetariano", "Vegano", "Sem carne vermelha", "Sem porco"];

  const perfilEconomicoOpts: { v: "economico" | "intermediario" | "premium"; titulo: string; desc: string }[] = [
    { v: "economico", titulo: "Econômico", desc: "Prioriza cortes populares, vísceras, ovos, leite em pó, azeite básico." },
    { v: "intermediario", titulo: "Intermediário", desc: "Mix de alimentos acessíveis com alguns premium quando necessário." },
    { v: "premium", titulo: "Premium", desc: "Melhores fontes de cada categoria sem considerar custo." },
  ];

  const alimentosDisponiveisGrupos: { grupo: string; itens: string[] }[] = [
    { grupo: "Proteínas acessíveis", itens: ["Ovo", "Frango inteiro", "Fígado bovino", "Moela", "Coração de frango", "Língua bovina", "Sardinha em lata", "Atum em lata", "Leite em pó integral"] },
    { grupo: "Carboidratos acessíveis", itens: ["Aveia", "Arroz branco", "Batata inglesa", "Mandioca", "Inhame", "Pão francês", "Farinha de aveia", "Mucilon", "Farinha láctea"] },
    { grupo: "Gorduras acessíveis", itens: ["Azeite de oliva", "Leite de coco", "Coco ralado", "Amendoim", "Pasta de amendoim", "Banha de porco", "Manteiga"] },
    { grupo: "Laticínios", itens: ["Leite integral", "Iogurte natural", "Queijo minas", "Requeijão", "Queijo coalho"] },
  ];
  const protocolos = [
    { v: "nenhum", l: "Sem protocolo específico" },
    { v: "glp1", l: "GLP-1 / Análogos (Sema, Retrat, Tirze)" },
    { v: "bpc157", l: "BPC-157 / TB-500 (Recuperação)" },
    { v: "gh", l: "GH Secretagogos (Ipamorelin / CJC)" },
    { v: "folistatina", l: "Folistatina-344 (Hipertrofia)" },
    { v: "longevidade", l: "Peptídeos Longevidade (Epithalon, MOTS-c)" },
    { v: "cognicao", l: "Nootrópicos (Semax / Selank)" },
  ];

  const gerarGlut4 = async () => {
    if (!form.peso) {
      toast({ title: "Peso obrigatório", description: "Informe o peso para calcular a janela GLUT-4.", variant: "destructive" });
      return;
    }
    setGlut4Loading(true);
    try {
      const { data, error } = await supabase.functions.invoke("glut4-strategy", {
        body: {
          patient_name: form.nome || "Paciente",
          weight_kg: Number(form.peso),
          objective: form.objetivo,
          periodization_phase: form.fasePeriodizacao,
          uses_intra_malto: form.glut4UsesIntraMalto,
          intra_malto_grams: Number(form.glut4IntraMaltoG) || 0,
          timing_minutes: Number(form.glut4TimingMin) || 30,
          carb_source: form.glut4CarbSource,
          carb_grams: form.glut4CarbGrams ? Number(form.glut4CarbGrams) : null,
          add_leucine: form.glut4AddLeucine,
          ergogenic_protocol: form.protocoloFarmacologico || null,
          plan_context: null,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setGlut4Text((data as any)?.text || "");
      toast({ title: "Janela GLUT-4 gerada ⚡", description: "Bloco fisiológico pronto para o plano." });
    } catch (e: any) {
      toast({ title: "Erro GLUT-4", description: e?.message || "Falha ao gerar bloco.", variant: "destructive" });
    } finally {
      setGlut4Loading(false);
    }
  };

  // Núcleo reutilizável: gera plano forçando modo econômico ON/OFF (default = valor do form).
  const gerarPlanoCore = async (overrideModoEconomico?: boolean, densityBoost?: boolean, fruitProtocol?: boolean): Promise<PlanoData | null> => {
    const restricoesStr = [...form.restricoes, form.outraRestricao].filter(Boolean).join(", ") || "Nenhuma";
    const protocStr = protocolos.find(p => p.v === form.protocolo)?.l || "Nenhum";
    const trainingSchedulePrompt = buildTrainingSchedulePrompt(
      trainingSchedule,
      form.peso ? Number(form.peso) : undefined,
      form.calorias ? Number(form.calorias) : undefined,
    );
    const CARB_LABELS_LOCAL: Record<string, string> = {
      dextrose: "Dextrose pura", tamaras: "Tâmaras Medjool", pao_frances: "Pão francês",
      pao_branco: "Pão de forma branco", doce_de_leite: "Doce de leite light", mel: "Mel puro",
      geleia: "Geleia açucarada com pão", leite_condensado: "Leite condensado desnatado",
      banana: "Banana bem madura", coca: "Coca-Cola (competição)", maltodextrina: "Maltodextrina",
    };
    const glut4Config = form.glut4Enabled
      ? {
          enabled: true,
          carb_source_key: form.glut4CarbSource,
          carb_source_label: CARB_LABELS_LOCAL[form.glut4CarbSource] || form.glut4CarbSource,
          uses_intra_malto: form.glut4UsesIntraMalto,
          intra_malto_grams: Number(form.glut4IntraMaltoG) || 0,
          timing_minutes: Number(form.glut4TimingMin) || 30,
          carb_grams: form.glut4CarbGrams ? Number(form.glut4CarbGrams) : null,
          add_leucine: form.glut4AddLeucine,
        }
      : null;
    const modoEcon = typeof overrideModoEconomico === "boolean" ? overrideModoEconomico : form.modoEconomico;

    const { data, error: fnError } = await supabase.functions.invoke("generate-coach-meal-plan", {
      body: {
        ...form,
        contexto_clinico: contextoClinico?.trim() || null,
        contextoClinico: contextoClinico?.trim() || null,
        contexto_clinico_prompt: contextoClinico?.trim()
          ? `\n\nCONTEXTO CLÍNICO DO COACH:\n${contextoClinico.trim()}`
          : "",
        compostos_ativos: form.compostosAtivos || [],
        modo_especial: modoEspecial,
        fase_ciclo: modoEspecial === "feminino" ? faseCiclo : undefined,
        dias_para_competicao: modoEspecial === "competicao" ? diasComp : undefined,
        crononutricao_circadiana: cronoCircadiano,
        modoEconomico: modoEcon,
        restricoesStr,
        protocStr,
        userId: user?.id,
        coachProfileId,
        patientUserId: (form as any)?.patientUserId || null,
        trainingSchedule,
        trainingSchedulePrompt,
        glut4Config,
        glut4Text: form.glut4Enabled ? glut4Text : "",
        // Campos para o cálculo determinístico (BLOCO 11)
        neat: form.neat,
        qualidadeSono: form.qualidadeSono,
        semanasEmDeficit: form.semanasEmDeficit ? Number(form.semanasEmDeficit) : 0,
        perfilFisiologico: {
          historico_intestinal: form.historicoIntestinal || null,
          fermentados_atual: form.fermentadosAtual || null,
          sensibilidade_insulina: form.sensibilidadeInsulina || null,
          objetivos_secundarios: form.objetivosSecundarios,
          variedade_funcional: form.variedadeFuncional,
          diversidade_alimentar_elite: form.diversidadeAlimentarElite,
          protocolo_microbiota: form.protocoloMicrobiota,
          cycling_carbo: form.cyclingCarbo,
          cronobiologia_aplicada: form.cronobiologiaAtiva,
          hidratacao_farmacologica: form.hidratacaoFarmacologica,
          modo_economico: modoEcon,
          medidas_caseiras: form.medidasCaseiras,
          medidas_preferencias: form.medidasCaseiras ? form.medidasPrefs : null,
          perfil_economico: form.perfilEconomico,
          alimentos_disponiveis: form.alimentosDisponiveis,
          outros_alimentos: form.outrosAlimentos || null,
          frutas_em_casa: form.frutasEmCasa,
          outras_frutas: form.outrasFrutas || null,
          neat: form.neat,
          qualidade_sono: form.qualidadeSono,
          semanas_em_deficit: form.semanasEmDeficit ? Number(form.semanasEmDeficit) : 0,
          density_boost: densityBoost === true,
          fruit_protocol: fruitProtocol === true,
        },
        densityBoost: densityBoost === true,
        fruitProtocol: fruitProtocol === true,
        fruitProtocolText: fruitProtocol === true
          ? `PROTOCOLO DE FRUTAS OBRIGATÓRIO — MÍNIMO 2 PORÇÕES/DIA\n═══════════════════════════════════════════════════════\nFRUTAS SÃO OBRIGATÓRIAS EM TODO PLANO — não são opcionais.\nMeta: mínimo 2 porções/dia, mínimo 5 espécies distintas/semana.\n\nPOSICIONAMENTO ESTRATÉGICO POR JANELA CIRCADIANA:\n\nMANHÃ (cortisol alto — aproveita frutose hepática):\n- Banana madura: glicogênio hepático + potássio + energia\n- Manga: betacaroteno + Vit C + energia rápida\n- Abacaxi: bromelina → ↑ absorção proteína 15%\n- Frutas cítricas: Vit C + flavonoides\n\nPÓS-TREINO IMEDIATO ou até 30min após:\n- Abacaxi 100–150g: bromelina → digestão proteína + anti-inflamatório\n- Mamão 150g: papaína → digestão + Vit C + betacaroteno\n- Banana madura: reposição glicogênio rápida\n\nLANCHE DA TARDE:\n- Maçã com casca: pectina prebiótica + quercetina anti-inflamatória\n- Pera: fibra solúvel + baixo IG\n- Goiaba: Vit C mais alta de qualquer fruta tropical\n\nNOITE / CEIA (se NÃO houver protocolo GH ativo):\n- Kiwi 2un: triptofano + serotonina → melatonina + ↑ qualidade sono 42%\n- Cereja ácida 100g: única fonte alimentar de melatonina biodisponível\n\nPROIBIDO se GH secretagogo ativo: banana, manga, mel (insulina bloqueia GH)\n\nANTI-INFLAMATÓRIO (3x/semana mínimo):\n- Frutas vermelhas/roxas 100g: mirtilo, amora, framboesa, uva roxa\n- Romã: punicalaginas → anti-inflamatório superior ao vinho tinto\n\nENZIMÁTICAS (2–3x/semana):\n- Abacaxi + mamão: bromelina + papaína → digestão proteína aumentada\n\nREGRAS DE ROTAÇÃO:\n- NUNCA repetir a mesma fruta em mais de 1 refeição/dia\n- Rotacionar pelo menos 5 espécies distintas ao longo da semana\n- Não substituir fruta por suco (fibra perdida + IG aumentado)\n- Banana pode aparecer diariamente em diferentes refeições SE espécies diferentes (madura manhã / verde como prebiótico no almoço)\n\nPOSIÇÕES OBRIGATÓRIAS NO PLANO:\n- Café da manhã: 1 fruta obrigatória (banana madura OU abacaxi OU manga)\n- Lanche da manhã OU tarde: 1 fruta obrigatória (maçã / pera / goiaba / frutas vermelhas)\n- Ceia (sem protocolo GH): kiwi OU cereja ácida (sono)\n- Pós-treino sólido: fruta enzimática se disponível (abacaxi/mamão)\n\nQUANTIDADE PADRÃO POR FRUTA:\nBanana: 1 unidade média (100g) | Abacaxi: 1 fatia grossa (150g)\nMamão: 1 fatia média (150g) | Maçã: 1 unidade (130g)\nFrutas vermelhas: 1 xícara (100g) | Kiwi: 2 unidades (160g)\nManga: 1/2 unidade média (150g) | Goiaba: 1 unidade (120g)\nUva: 1 cacho pequeno (100g) | Melancia: 2 fatias (300g)`
          : null,
      },
    });
    if (fnError) throw fnError;
    if (!data?.plan) throw new Error("Resposta inválida da IA");
    // Salva contexto clínico no histórico local (apenas ao gerar com sucesso)
    saveContextoToHistory((form as any)?.nome || "");
    return data.plan as PlanoData;
  };

  // Abre o modal de revisão do protocolo farmacológico com o texto atual
  const abrirRevisaoProtocolo = () => {
    setProtocoloDraft(form.protocoloFarmacologico || "");
    setShowProtocoloModal(true);
  };

  // Salva o novo texto do protocolo no form e regera o plano (recalcula
  // compostos detectados, fator farmacológico, macros e refeições).
  const recalcularComProtocolo = async () => {
    const novoTexto = (protocoloDraft || "").trim();
    // Atualiza o form ANTES de regerar (gerarPlanoCore lê de form.protocoloFarmacologico)
    set("protocoloFarmacologico", novoTexto);
    setProtocoloRecalc(true);
    setShowProtocoloModal(false);
    setError("");
    setErrorDetails(null);
    setStep("loading");
    setLoadingMsg("Reanalisando protocolo farmacológico...");
    try {
      // Pequeno delay garante que o setState do form seja aplicado antes do invoke
      await new Promise((r) => setTimeout(r, 30));
      const novo = await gerarPlanoCore();
      if (novo) {
        setPlano(novo);
        setPlanoComparativo(null);
        setShowCompare(false);
        setSavedId(null);
      }
      setStep("result");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e: any) {
      console.error("[PlanoAlimentarIA] erro ao recalcular protocolo:", e);
      const details = classifyError(e);
      setErrorDetails(details);
      setError(details.title);
      setStep("result");
    } finally {
      setProtocoloRecalc(false);
    }
  };

  // Classifica o erro vindo do supabase.functions.invoke / fetch
  const classifyError = (e: any) => {
    const ctx = e?.context;
    const status: number | undefined = ctx?.status ?? e?.status;
    const rawMsg: string = (e?.message || "").toLowerCase();
    let serverMsg = "";
    try {
      // tenta extrair body JSON do FunctionsHttpError
      if (ctx?.body && typeof ctx.body === "string") {
        const parsed = JSON.parse(ctx.body);
        serverMsg = parsed?.error || "";
      }
    } catch {/* noop */}

    if (status === 503 || /503|unavailable|indispon/i.test(serverMsg) || /503/.test(rawMsg)) {
      return {
        kind: "unavailable" as const,
        title: "Modelo de IA temporariamente indisponível (503)",
        description: serverMsg || "O provedor de IA não respondeu agora. Já tentamos 3 vezes em 3 modelos diferentes (flash → flash-lite → pro) sem sucesso. Aguarde alguns segundos.",
        technical: `status=${status} ${e?.message || ""}`.trim(),
        canRetry: true,
      };
    }
    if (status === 504 || /timeout|timed out|connection closed before/i.test(rawMsg + serverMsg)) {
      return {
        kind: "timeout" as const,
        title: "Tempo esgotado ao gerar (timeout)",
        description: "A IA demorou demais para responder. Tente reduzir restrições/observações ou gerar novamente.",
        technical: `status=${status || "504"} ${e?.message || ""}`.trim(),
        canRetry: true,
      };
    }
    if (status === 429 || /rate limit|too many/i.test(rawMsg + serverMsg)) {
      return {
        kind: "rate_limit" as const,
        title: "Muitas requisições (429)",
        description: "Você atingiu o limite de chamadas por minuto. Aguarde ~30s e tente novamente.",
        technical: `status=${status} ${e?.message || ""}`.trim(),
        canRetry: true,
      };
    }
    if (status === 402 || /cr[ée]ditos|insufficient/i.test(rawMsg + serverMsg)) {
      return {
        kind: "credits" as const,
        title: "Créditos de IA insuficientes (402)",
        description: "O workspace está sem créditos para o gateway de IA. Adicione créditos em Settings → Workspace → Usage.",
        technical: `status=${status} ${e?.message || ""}`.trim(),
        canRetry: false,
      };
    }
    if (/json|parse|invalid|inv[áa]lid/i.test(rawMsg + serverMsg)) {
      return {
        kind: "invalid_json" as const,
        title: "Resposta da IA em formato inválido",
        description: "A IA retornou um conteúdo que não pôde ser interpretado como plano. Geralmente resolve ao tentar novamente.",
        technical: e?.message || serverMsg || "JSON inválido",
        canRetry: true,
      };
    }
    if (/network|failed to fetch|networkerror/i.test(rawMsg)) {
      return {
        kind: "network" as const,
        title: "Falha de rede",
        description: "Não foi possível alcançar o servidor. Verifique sua conexão e tente novamente.",
        technical: e?.message,
        canRetry: true,
      };
    }
    return {
      kind: "unknown" as const,
      title: "Erro inesperado ao gerar o plano",
      description: serverMsg || e?.message || "Ocorreu um problema desconhecido. Tente novamente.",
      technical: `status=${status ?? "?"} ${e?.message || ""}`.trim(),
      canRetry: true,
    };
  };

  const gerar = async () => {
    if (!form.peso || !form.altura || !form.idade) {
      setErrorDetails({
        kind: "validation",
        title: "Dados obrigatórios faltando",
        description: "Preencha pelo menos: peso, altura e idade do paciente.",
        canRetry: false,
      });
      setError("Preencha pelo menos: peso, altura e idade do paciente.");
      return;
    }
    setError("");
    setErrorDetails(null);
    setStep("loading");

    const msgs = [
      "Calculando TMB e GET do paciente...",
      "Analisando perfil PCA e objetivo...",
      "Distribuindo macronutrientes...",
      "Selecionando alimentos e porções...",
      "Integrando estratégias do protocolo...",
      "Aplicando Método MCE ao plano...",
      "Finalizando plano alimentar...",
    ];
    let mi = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => {
      mi = (mi + 1) % msgs.length;
      setLoadingMsg(msgs[mi]);
    }, 1800);

    try {
      const planResult = await gerarPlanoCore();
      clearInterval(interval);
      setPlano(planResult);
      setPlanoComparativo(null);
      setShowCompare(false);
      setStep("result");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e: any) {
      clearInterval(interval);
      console.error("[PlanoAlimentarIA] erro ao gerar:", e);
      const details = classifyError(e);
      setErrorDetails(details);
      setError(details.title);
      setStep("form");
    } finally {
      setRetrying(false);
    }
  };

  // Regera o plano forçando ↑ densidade nutricional + variedade,
  // preservando preferências, restrições e orçamento.
  const [densityRegenLoading, setDensityRegenLoading] = useState(false);
  const regerarComMaisDensidade = async () => {
    setDensityRegenLoading(true);
    setLoadingMsg("Recalculando com mais densidade nutricional...");
    try {
      const novo = await gerarPlanoCore(undefined, true);
      if (novo) {
        setPlano(novo);
        setPlanoComparativo(null);
        setShowCompare(false);
        toast({ title: "Plano regenerado", description: "Densidade nutricional reforçada — preferências e orçamento preservados." });
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (e: any) {
      console.error("[densityBoost] erro:", e);
      toast({ title: "Erro ao regenerar", description: e?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setDensityRegenLoading(false);
    }
  };

  // Aplica Protocolo de Frutas Obrigatório (mín. 2/dia, 5 espécies/sem,
  // posicionamento circadiano, enzimáticas + anti-inflamatórias).
  const [fruitProtocolLoading, setFruitProtocolLoading] = useState(false);
  const aplicarProtocoloFrutas = async () => {
    setFruitProtocolLoading(true);
    setLoadingMsg("Aplicando Protocolo de Frutas Obrigatório...");
    try {
      const novo = await gerarPlanoCore(undefined, true, true);
      if (novo) {
        setPlano(novo);
        setPlanoComparativo(null);
        setShowCompare(false);
        toast({ title: "Protocolo de frutas aplicado", description: "Mín. 2 porções/dia · 5 espécies/sem · posicionamento circadiano." });
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (e: any) {
      console.error("[fruitProtocol] erro:", e);
      toast({ title: "Erro ao aplicar protocolo", description: e?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setFruitProtocolLoading(false);
    }
  };

  const tentarNovamente = async () => {
    setRetrying(true);
    await gerar();
  };

  // Soma calórica total das refeições do plano (fallback caso ajuste_calorico não esteja disponível)
  const sumKcalRefeicoes = (refs: any[] | undefined): number => {
    if (!Array.isArray(refs)) return 0;
    return refs.reduce((acc, r) => acc + getMealKcal(r as Meal), 0);
  };

  // Regera o plano múltiplas vezes até o ajuste calórico cair dentro da banda ±3% (ou atingir limite)
  // onAttempt: callback opcional invocado a cada tentativa para auditoria/log externo
  const regerarAteAtingirMeta = async (
    onAttempt?: (info: {
      attempt: number;
      ok: boolean;
      alvo: number;
      total_depois: number;
      delta_kcal: number;
      fator: number | null;
      dentro_da_banda: boolean;
      ajuste_meta: any;
      error?: string;
    }) => Promise<void> | void,
  ) => {
    if (autoRetrying) return;
    setAutoRetrying(true);
    setAutoRetryAttempt(0);
    let melhor: PlanoData | null = plano;
    let melhorDelta = (() => {
      const aj: any = (plano as any)?.ajuste_calorico;
      if (!aj) return Infinity;
      return Math.abs((aj.total_depois ?? 0) - (aj.alvo ?? 0));
    })();

    try {
      for (let i = 1; i <= MAX_AUTO_RETRIES; i++) {
        setAutoRetryAttempt(i);
        toast({
          title: `Tentativa ${i}/${MAX_AUTO_RETRIES}`,
          description: "Regerando plano para tentar ficar dentro da banda ±3%...",
        });
        try {
          const novo = await gerarPlanoCore();
          if (!novo) {
            await onAttempt?.({
              attempt: i, ok: false, alvo: 0, total_depois: 0, delta_kcal: 0,
              fator: null, dentro_da_banda: false, ajuste_meta: null,
              error: "gerarPlanoCore retornou vazio",
            });
            continue;
          }
          const aj: any = (novo as any)?.ajuste_calorico;
          const alvo = aj?.alvo ?? 0;
          const total = aj?.total_depois ?? sumKcalRefeicoes((novo as any)?.refeicoes);
          const delta = Math.abs(total - alvo);
          await onAttempt?.({
            attempt: i,
            ok: true,
            alvo,
            total_depois: total,
            delta_kcal: total - alvo,
            fator: aj?.fator ?? null,
            dentro_da_banda: !!aj?.dentro_da_banda,
            ajuste_meta: aj || null,
          });
          if (delta < melhorDelta) {
            melhor = novo;
            melhorDelta = delta;
            setPlano(novo);
            setPlanoComparativo(null);
            setShowCompare(false);
          }
          if (aj?.dentro_da_banda) {
            toast({
              title: "🎯 Meta atingida!",
              description: `Plano dentro da banda em ${i} tentativa${i > 1 ? "s" : ""} (${total} kcal vs alvo ${alvo}).`,
            });
            return;
          }
        } catch (e: any) {
          console.error(`[regerarAteAtingirMeta] tentativa ${i} falhou:`, e);
          await onAttempt?.({
            attempt: i, ok: false, alvo: 0, total_depois: 0, delta_kcal: 0,
            fator: null, dentro_da_banda: false, ajuste_meta: null,
            error: e?.message || String(e),
          });
        }
      }
      // Esgotou tentativas
      toast({
        title: "Limite de tentativas atingido",
        description: `Após ${MAX_AUTO_RETRIES} tentativas, o melhor plano ficou ${Math.round(melhorDelta)} kcal fora do alvo. Mantido o melhor resultado.`,
        variant: "destructive",
      });
    } finally {
      setAutoRetrying(false);
      setAutoRetryAttempt(0);
    }
  };

  // Gera (ou esconde) o plano comparativo no modo oposto ao atual.
  const compararModos = async () => {
    if (!plano) return;
    if (planoComparativo) {
      setShowCompare((s) => !s);
      return;
    }
    const isAtualEconomico = !!plano.custo_estimado?.modo_economico_ativo || !!form.modoEconomico;
    const oposto = !isAtualEconomico;
    setComparing(true);
    try {
      toast({
        title: oposto ? "Gerando versão econômica..." : "Gerando versão padrão...",
        description: "Calculando o mesmo ciclo no modo oposto para comparação.",
      });
      const outro = await gerarPlanoCore(oposto);
      setPlanoComparativo(outro);
      setSavedComparisonId(null);
      setShowCompare(true);
      toast({ title: "Comparativo pronto ✅", description: "Role para ver as diferenças." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro ao gerar comparativo", description: e?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setComparing(false);
    }
  };

  // Salva a comparação atual (Econômico vs Padrão) no histórico do coach.
  const salvarComparacao = async () => {
    if (!plano || !planoComparativo || !coachProfileId) {
      toast({ title: "Comparativo indisponível", description: "Gere a versão alternativa antes de salvar.", variant: "destructive" });
      return;
    }
    if (savedComparisonId) {
      toast({ title: "Comparação já salva ✅", description: "Acesse pelo histórico de comparações." });
      return;
    }
    setSavingComparison(true);
    try {
      const aIsEcon = !!plano.custo_estimado?.modo_economico_ativo || !!form.modoEconomico;
      const A = plano;
      const B = planoComparativo;
      const econ = aIsEcon ? A : B;
      const pad = aIsEcon ? B : A;
      const resumo = {
        modo_principal: aIsEcon ? "economico" : "padrao",
        custo_diario_economico: econ.custo_estimado?.custo_diario_economico ?? null,
        custo_diario_padrao: pad.custo_estimado?.custo_diario_padrao_equivalente ?? econ.custo_estimado?.custo_diario_padrao_equivalente ?? null,
        economia_diaria: econ.custo_estimado?.economia_diaria ?? null,
        economia_mensal: econ.custo_estimado?.economia_mensal ?? null,
        economia_percentual: econ.custo_estimado?.economia_percentual ?? null,
        kcal_a: A.resumo.calorias_totais,
        kcal_b: B.resumo.calorias_totais,
        proteina_a: A.resumo.proteina_total,
        proteina_b: B.resumo.proteina_total,
        carbo_a: A.resumo.carboidrato_total,
        carbo_b: B.resumo.carboidrato_total,
        gordura_a: A.resumo.gordura_total,
        gordura_b: B.resumo.gordura_total,
      };
      const { data, error: insErr } = await supabase
        .from("plano_comparacoes_historico")
        .insert({
          coach_id: coachProfileId,
          patient_name: plano.resumo.nome || form.nome || "Paciente",
          objetivo: plano.resumo.objetivo || form.objetivo,
          modo_principal: aIsEcon ? "economico" : "padrao",
          plano_a: A as any,
          plano_b: B as any,
          resumo: resumo as any,
          observacao: form.observacoes || null,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      setSavedComparisonId(data.id);
      toast({ title: "Comparação salva ✅", description: "Disponível no histórico para revisar depois." });
    } catch (e: any) {
      toast({ title: "Erro ao salvar comparação", description: e?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setSavingComparison(false);
    }
  };

  const carregarHistoricoComparacoes = async () => {
    if (!coachProfileId) return;
    setLoadingCompareHistory(true);
    try {
      const { data, error: e } = await supabase
        .from("plano_comparacoes_historico")
        .select("id, patient_name, objetivo, modo_principal, resumo, created_at")
        .eq("coach_id", coachProfileId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (e) throw e;
      setCompareHistory(data || []);
    } catch (e: any) {
      toast({ title: "Erro ao carregar histórico", description: e?.message, variant: "destructive" });
    } finally {
      setLoadingCompareHistory(false);
    }
  };

  const abrirHistoricoComparacoes = async () => {
    setShowCompareHistory(true);
    await carregarHistoricoComparacoes();
  };

  const carregarComparacaoSalva = async (id: string) => {
    try {
      const { data, error: e } = await supabase
        .from("plano_comparacoes_historico")
        .select("plano_a, plano_b, modo_principal")
        .eq("id", id)
        .single();
      if (e) throw e;
      setPlano(data.plano_a as any);
      setPlanoComparativo(data.plano_b as any);
      setShowCompare(true);
      setSavedComparisonId(id);
      setShowCompareHistory(false);
      setStep("result");
      toast({ title: "Comparação carregada", description: "Role até o painel comparativo." });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e: any) {
      toast({ title: "Erro ao carregar", description: e?.message, variant: "destructive" });
    }
  };

  const removerComparacaoSalva = async (id: string) => {
    if (!confirm("Remover esta comparação do histórico?")) return;
    try {
      const { error: e } = await supabase.from("plano_comparacoes_historico").delete().eq("id", id);
      if (e) throw e;
      setCompareHistory((arr) => arr.filter((x) => x.id !== id));
      if (savedComparisonId === id) setSavedComparisonId(null);
      toast({ title: "Removida do histórico" });
    } catch (e: any) {
      toast({ title: "Erro ao remover", description: e?.message, variant: "destructive" });
    }
  };

  const copiarJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(plano, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const salvarPlano = async (): Promise<string | null> => {
    if (!plano || !coachProfileId) {
      toast({ title: "Coach não identificado", variant: "destructive" });
      return null;
    }
    if (savedId) return savedId;
    setSaving(true);
    try {
      const { data, error: insErr } = await supabase
        .from("coach_meal_plans")
        .insert({
          coach_id: coachProfileId,
          patient_name: plano.resumo.nome || form.nome || "Paciente",
          objetivo: plano.resumo.objetivo || form.objetivo,
          plano: plano as any,
          observacao: form.observacoes || null,
          status: "draft",
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      setSavedId(data.id);
      toast({ title: "Plano salvo ✅", description: "Disponível no histórico do coach. Gerando PDF Elite..." });
      try { exportPDFElite(); } catch {}
      return data.id;
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const enviarPlano = async () => {
    if (!plano || !coachProfileId || !user?.id) return;
    const isAluno = recipientType === "aluno";
    const destUserId = isAluno ? selectedPatient : (partnersList.find((p) => p.id === selectedPartner)?.user_id || null);
    const destDisplayId = isAluno ? selectedPatient : selectedPartner;
    const destNome = isAluno
      ? (patients.find((p) => p.user_id === selectedPatient)?.name || "aluno")
      : (partnersList.find((p) => p.id === selectedPartner)?.name || "parceiro");

    if (!destDisplayId) {
      toast({ title: `Selecione um ${isAluno ? "aluno" : "parceiro"}`, variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      let planId = savedId;
      if (!planId) {
        const { data, error: insErr } = await supabase
          .from("coach_meal_plans")
          .insert({
            coach_id: coachProfileId,
            patient_user_id: destUserId,
            patient_name: destNome || plano.resumo.nome || form.nome || "Destinatário",
            objetivo: plano.resumo.objetivo || form.objetivo,
            plano: plano as any,
            observacao: sendObs || form.observacoes || null,
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .select("id")
          .single();
        if (insErr) throw insErr;
        planId = data.id;
      } else {
        const { error: upErr } = await supabase
          .from("coach_meal_plans")
          .update({
            patient_user_id: destUserId,
            status: "sent",
            sent_at: new Date().toISOString(),
            observacao: sendObs || form.observacoes || null,
          })
          .eq("id", planId);
        if (upErr) throw upErr;
      }
      setSavedId(planId);
      try { exportPDFElite(); } catch {}

      await supabase.from("protocolo_envios").insert({
        coach_id: coachProfileId,
        destinatario_id: destUserId || destDisplayId,
        tipo_destinatario: recipientType,
        tipo_conteudo: ["plano_alimentar"],
        conteudo_ids: { plano_alimentar: [planId] },
        observacao: sendObs || null,
        status: "enviado",
      });

      if (destUserId) {
        const titulo = "Novo plano alimentar recebido!";
        const corpo = `Seu coach enviou um novo plano alimentar.${sendObs ? ` ${sendObs}` : ""}`;
        await supabase.from("coach_notifications").insert({
          recipient_user_id: destUserId,
          sender_user_id: user.id,
          notification_type: "meal_plan_sent",
          title: titulo,
          message: corpo,
          reference_id: planId,
        });

        try {
          await supabase.functions.invoke("dispara_notificacao", {
            body: { destinatario_id: destUserId, titulo, corpo, referencia_id: planId, tipo: "plano_alimentar" },
          });
        } catch {}
      }

      toast({ title: "Plano enviado 📨", description: `Para ${destNome}` });
      setShowSendModal(false);
      setSendObs("");
    } catch (e: any) {
      toast({ title: "Erro ao enviar", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const exportPDF = async () => {
    if (!plano) return;
    const r = plano.resumo;
    const kcalUI = getResumoKcal(r);

    // Mapeia tipo de refeição (cafe_manha, almoco, etc) a partir do título da refeição.
    const inferMealType = (titulo: string): string => {
      const t = (titulo || "").toLowerCase();
      if (/caf[eé]|desjejum/.test(t)) return "cafe_manha";
      if (/lanche.*(manh[ãa]|meio)/.test(t)) return "lanche_manha";
      if (/almo[cç]o/.test(t)) return "almoco";
      if (/lanche.*tarde|p[óo]s.*treino|pr[éeè].*treino/.test(t)) return "lanche_tarde";
      if (/jantar/.test(t)) return "jantar";
      if (/ceia|noturna/.test(t)) return "ceia";
      return "lanche_tarde";
    };

    // Gera items semanais replicando o template em todos os 7 dias (0=Seg..6=Dom).
    const items = [] as any[];
    for (let day = 0; day < 7; day++) {
      (plano.refeicoes || []).forEach((m) => {
        const tipo = inferMealType(m.refeicao || "");
        const alimentos = m.alimentos || [];
        if (!alimentos.length) {
          items.push({
            day_index: day,
            meal_type: tipo,
            food_name: m.refeicao || "Refeição",
            portion: m.horario || "",
            kcal: getMealKcal(m as Meal),
            protein_g: m.macros?.proteina || 0,
            carbs_g: m.macros?.carboidrato || 0,
            fat_g: m.macros?.gordura || 0,
          });
        } else {
          alimentos.forEach((a, idx) => {
            items.push({
              day_index: day,
              meal_type: tipo,
              food_name: a.alimento,
              portion: (a.quantidade || a.quantidade_g || "") as string,
              // Distribui kcal/macros da refeição apenas no primeiro item para evitar duplicar totais.
              kcal: idx === 0 ? getMealKcal(m as Meal) : 0,
              protein_g: idx === 0 ? (m.macros?.proteina || 0) : 0,
              carbs_g: idx === 0 ? (m.macros?.carboidrato || 0) : 0,
              fat_g: idx === 0 ? (m.macros?.gordura || 0) : 0,
            });
          });
        }
      });
    }

    // Dias de treino (Seg=0..Dom=6) extraídos do TrainingSchedule.
    const dayOrder: Array<"seg"|"ter"|"qua"|"qui"|"sex"|"sab"|"dom"> = ["seg","ter","qua","qui","sex","sab","dom"];
    const trainingDayIndices = dayOrder
      .map((d, i) => (trainingSchedule.base[d]?.is_training_day ? i : -1))
      .filter((i) => i >= 0);

    // Busca dados do coach (avatar, nome, registro) se disponível.
    let coachProfile: any = { professional_name: "", crn: "", avatar_url: "" };
    if (coachProfileId) {
      const { data: cp } = await supabase
        .from("coach_profiles")
        .select("professional_name, crn, avatar_url")
        .eq("id", coachProfileId)
        .maybeSingle();
      if (cp) coachProfile = cp;
    }

    const patient = {
      display_name: r.nome || form.nome || "Paciente",
      full_name: r.nome || form.nome || "Paciente",
      goal: r.objetivo || form.objetivo,
      weight_kg: Number(form.peso) || undefined,
      target_kcal: kcalUI,
      target_protein_g: r.proteina_total,
      target_carbs_g: r.carboidrato_total,
      target_fat_g: r.gordura_total,
    };

    try {
      await exportMealPlanPDF(patient, items, coachProfile, [], trainingDayIndices);
      toast({ title: "PDF gerado ✅", description: "Download iniciado." });
    } catch (e: any) {
      toast({ title: "Erro ao gerar PDF", description: e?.message || "Tente novamente.", variant: "destructive" });
    }
  };

  // NutriPlan Elite PDF — usa lib/mealPlanPdf.ts com TDEE breakdown + enrichment por refeição
  const exportPDFElite = () => {
    if (!plano) return;
    try {
      const inferMealType = (titulo: string): string => {
        const t = (titulo || "").toLowerCase();
        if (/caf[eé]|desjejum/.test(t)) return "cafe_manha";
        if (/lanche.*(manh[ãa]|meio)/.test(t)) return "lanche_manha";
        if (/almo[cç]o/.test(t)) return "almoco";
        if (/lanche.*tarde|p[óo]s.*treino|pr[éeè].*treino/.test(t)) return "lanche_tarde";
        if (/jantar/.test(t)) return "jantar";
        if (/ceia|noturna/.test(t)) return "ceia";
        return "lanche_tarde";
      };
      const items: any[] = [];
      const enrichment: Record<string, any> = {};
      (plano.refeicoes || []).forEach((m) => {
        const tipo = inferMealType(m.refeicao || "");
        const foodLine =
          (m.alimentos || [])
            .map((a) => `${a.alimento}${a.quantidade ? ` (${a.quantidade})` : ""}`)
            .join(" + ") || (m.refeicao || "Refeição");
        items.push({
          day_index: 0,
          meal_type: tipo,
          food_name: foodLine,
          portion: m.horario || "",
          kcal: getMealKcal(m as Meal),
          protein_g: m.macros?.proteina || 0,
          carbs_g: m.macros?.carboidrato || 0,
          fat_g: m.macros?.gordura || 0,
        });
        if (m.funcao_metabolica || m.janela_metabolica || m.protocolo_peri_workout || m.mensagem_mce || (Array.isArray((m as any).insights_ia) && (m as any).insights_ia.length)) {
          enrichment[`0-${tipo}`] = {
            funcao_metabolica: m.funcao_metabolica,
            janela_metabolica: m.janela_metabolica,
            protocolo_peri_workout: m.protocolo_peri_workout,
            mensagem_mce: m.mensagem_mce,
            insights_ia: (m as any).insights_ia,
          };
        }
      });
      const baseNe: any = (plano as any)?.nutriplan_elite || {};
      const ne: any = {
        ...baseNe,
        modo_especial: baseNe.modo_especial || modoEspecial,
        fase_ciclo: modoEspecial === "feminino" ? faseCiclo : baseNe.fase_ciclo,
        dias_para_competicao: modoEspecial === "competicao" ? diasComp : baseNe.dias_para_competicao,
        alerta_coach: baseNe.alerta_coach || (plano as any)?.alerta_coach,
      };
      const patientName = plano.resumo?.nome || (form as any)?.nome || "Paciente";
      const today = new Date().toLocaleDateString("pt-BR");
      exportMealPlanPDFElite({
        items,
        weekRange: `Plano Elite · ${today}`,
        patientName,
        nutriEliteMeta: ne,
        enrichment,
      });
      toast({ title: "PDF Elite gerado ✅", description: "Download iniciado." });
    } catch (e: any) {
      toast({ title: "Erro ao gerar PDF Elite", description: e?.message || "Tente novamente.", variant: "destructive" });
    }
  };


  if (step === "loading") return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 32px" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${T.border2}` }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid transparent`, borderTopColor: T.green, animation: "spin 1s linear infinite" }} />
          <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: `1px solid ${T.border}`, borderBottomColor: T.greenDim, animation: "spin 1.5s linear infinite reverse" }} />
        </div>
        <div style={{ fontSize: 13, color: T.green, fontWeight: 600, marginBottom: 8 }}>Gerando plano alimentar</div>
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, minHeight: 36, transition: "all .3s" }}>{loadingMsg}</div>
      </div>
    </div>
  );

  // ── RESULT ──
  if (step === "result" && plano) {
    const r = plano.resumo;
    // Fonte única: kcalFromMacros aplica tolerância ±50 kcal e retorna o valor correto.
    const kcalAtwaterTotal = calcKcalAtwater(r.proteina_total, r.carboidrato_total, r.gordura_total);
    const kcalDeclTotal = Number(r.calorias_totais) || 0;
    const kcalTotaisExibicao = getResumoKcal(r);
    // Percentuais sempre relativos ao total exibido (consistência visual).
    const macroP = r.proteina_total && kcalTotaisExibicao ? Math.round((r.proteina_total * 4 / kcalTotaisExibicao) * 100) : 0;
    const macroC = r.carboidrato_total && kcalTotaisExibicao ? Math.round((r.carboidrato_total * 4 / kcalTotaisExibicao) * 100) : 0;
    const macroG = r.gordura_total && kcalTotaisExibicao ? Math.round((r.gordura_total * 9 / kcalTotaisExibicao) * 100) : 0;

    return (
      <div ref={resultRef} style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.text }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp .4s ease both}`}</style>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.bg2 }}>
          <div>
            <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>nutriON · Dashboard do Coach</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginTop: 4 }}>Plano Alimentar — {r.nome}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            <button onClick={copiarJSON} style={{ padding: "8px 16px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              {copied ? "✓ Copiado" : "Copiar JSON"}
            </button>
            <button onClick={exportPDF} style={{ padding: "8px 16px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              📄 PDF
            </button>
            <button onClick={exportPDFElite} title="PDF Elite com TDEE breakdown e enriquecimento metabólico" style={{ padding: "8px 16px", borderRadius: 8, background: T.greenBg, border: `1px solid ${T.green}`, color: T.green, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
              📄 PDF Elite
            </button>
            <button onClick={openAdherence} style={{ padding: "8px 16px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              📊 Aderência
            </button>
            <button onClick={() => salvarPlano()} disabled={saving || !!savedId} style={{ padding: "8px 16px", borderRadius: 8, background: savedId ? T.greenBg : T.bg3, border: `1px solid ${savedId ? T.green : T.border2}`, color: savedId ? T.green : T.text, fontSize: 12, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
              {saving ? "Salvando..." : savedId ? "✓ Salvo" : "💾 Salvar"}
            </button>
            <button onClick={() => setShowSendModal(true)} style={{ padding: "8px 16px", borderRadius: 8, background: T.green, border: `1px solid ${T.green}`, color: "#0a0f0a", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
              📨 Enviar
            </button>
            <button onClick={() => { setShowHistory(true); loadHistory(); }} style={{ padding: "8px 16px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
              🗂️ Histórico
            </button>
            <button onClick={() => { setPlano(null); setSavedId(null); setStep("form"); }} style={{ padding: "8px 16px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              + Novo
            </button>
          </div>
        </div>

        {/* NutriPlan Elite — TDEE Bruto → Ajustado + breakdown farmacológico */}
        {(() => {
          const ne: any = (plano as any)?.nutriplan_elite;
          if (!ne) return null;
          const bruto = Number(ne.tdee_bruto) || 0;
          const ajust = Number(ne.tdee_ajustado) || bruto;
          const deltaPct = bruto > 0 ? Math.round(((ajust - bruto) / bruto) * 1000) / 10 : 0;
          const breakdown: any[] = Array.isArray(ne.ajuste_farmacologico_breakdown) ? ne.ajuste_farmacologico_breakdown : [];
          return (
            <div className="fade-up" style={{ margin: "16px 24px", padding: 18, borderRadius: 12, background: `linear-gradient(135deg, ${T.greenBg}, ${T.bg2})`, border: `1px solid ${T.green}`, boxShadow: `0 0 24px -8px ${T.green}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: T.green, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>NutriPlan Elite · TDEE Farmacológico</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginTop: 6, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {bruto.toLocaleString("pt-BR")} <span style={{ color: T.muted, fontSize: 16, margin: "0 6px" }}>→</span> {ajust.toLocaleString("pt-BR")} <span style={{ color: T.muted, fontSize: 13, fontWeight: 400 }}>kcal</span>
                    {deltaPct !== 0 && (
                      <span style={{ marginLeft: 10, fontSize: 13, color: deltaPct > 0 ? T.green : T.muted, fontWeight: 600 }}>
                        ({deltaPct > 0 ? "+" : ""}{deltaPct}%)
                      </span>
                    )}
                  </div>
                </div>
                {Array.isArray(ne.compostos_ativos) && ne.compostos_ativos.length > 0 && (
                  <div style={{ fontSize: 11, color: T.muted, maxWidth: 260, textAlign: "right" }}>
                    <div style={{ color: T.green, fontWeight: 600, marginBottom: 2 }}>Compostos ativos</div>
                    {ne.compostos_ativos.join(" · ")}
                  </div>
                )}
              </div>
              {breakdown.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {breakdown.map((b, i) => (
                    <span key={i} style={{ padding: "4px 10px", borderRadius: 12, background: T.bg3, border: `1px solid ${T.border2}`, fontSize: 10, color: T.text, fontFamily: "'Space Grotesk', monospace" }}>
                      {b.composto} <span style={{ color: T.green }}>×{Number(b.fator).toFixed(2)}</span>
                    </span>
                  ))}
                </div>
              )}
              {ne.nota_fator_farma && (
                <div style={{ marginTop: 10, fontSize: 10, color: T.muted, lineHeight: 1.5, fontStyle: "italic" }}>
                  {ne.nota_fator_farma}
                </div>
              )}
            </div>
          );
        })()}

        {/* NutriPlan Elite — 11 BLOCOS COMPLETOS (cards visuais) */}
        {(() => {
          const ne: any = (plano as any)?.nutriplan_elite || {};
          const eliteVazio = !((plano as any)?.nutriplan_elite);
          const fmtN = (n: any, suf = "") => (n == null || isNaN(Number(n)) ? "—" : `${Math.round(Number(n))}${suf}`);
          const Section = ({ icon, title, children, defaultOpen }: any) => (
            <details key={`${eliteAllOpen}-${title}`} open={eliteAllOpen || !!defaultOpen} style={{ borderRadius: 10, background: T.bg2, border: `1px solid ${T.border2}`, borderLeft: `3px solid ${T.green}`, overflow: "hidden" }}>
              <summary style={{ listStyle: "none", cursor: "pointer", padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, userSelect: "none" }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase", letterSpacing: "0.1em", flex: 1 }}>{title}</span>
                <span style={{ fontSize: 10, color: T.muted, fontFamily: "monospace" }}>▾</span>
              </summary>
              <div style={{ padding: "0 14px 14px" }}>{children}</div>
            </details>
          );
          // setter helper para edição inline em ne.*
          const updateNe = (path: string[], value: any) => {
            setPlano((prev: any) => {
              if (!prev) return prev;
              const clone = JSON.parse(JSON.stringify(prev));
              let obj = clone.nutriplan_elite = clone.nutriplan_elite || {};
              for (let i = 0; i < path.length - 1; i++) {
                obj[path[i]] = obj[path[i]] ?? (typeof path[i + 1] === "number" ? [] : {});
                obj = obj[path[i]];
              }
              obj[path[path.length - 1]] = value;
              return clone;
            });
          };
          const Stat = ({ label, value, hl, path, type = "text", suffix = "" }: any) => {
            const editable = eliteEdit && path;
            return (
              <div style={{ padding: 8, borderRadius: 6, background: hl ? T.greenBg : T.bg3, border: `1px solid ${hl ? T.green : T.border}` }}>
                <div style={{ fontSize: 9, color: T.muted2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                {editable ? (
                  <input
                    type={type}
                    defaultValue={String(value ?? "").replace(/[^\d.,\-a-zA-Z×% ]/g, "").trim()}
                    onBlur={(e) => updateNe(path, type === "number" ? Number(e.target.value) : e.target.value)}
                    style={{ width: "100%", marginTop: 2, background: "transparent", border: `1px dashed ${T.green}`, borderRadius: 4, padding: "2px 4px", color: hl ? T.green : T.text, fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", outline: "none" }}
                  />
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 700, color: hl ? T.green : T.text, fontFamily: "'Space Grotesk', sans-serif", marginTop: 2 }}>{value}{suffix}</div>
                )}
              </div>
            );
          };
          const EditText = ({ value, path, multi }: any) => {
            if (!eliteEdit || !path) return <span>{value || "—"}</span>;
            return multi ? (
              <textarea defaultValue={value || ""} onBlur={(e) => updateNe(path, e.target.value)} rows={2}
                style={{ width: "100%", background: "transparent", border: `1px dashed ${T.green}`, borderRadius: 4, padding: "4px 6px", color: T.text, fontSize: 12, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
            ) : (
              <input defaultValue={value || ""} onBlur={(e) => updateNe(path, e.target.value)}
                style={{ width: "100%", background: "transparent", border: `1px dashed ${T.green}`, borderRadius: 4, padding: "2px 6px", color: T.text, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
            );
          };
          const Empty = () => <div style={{ fontSize: 11, color: T.muted2, fontStyle: "italic" }}>Sem dados retornados pela IA.</div>;
          const pesoKg = Number(form.peso) || 0;
          const idadePaciente = Number(form.idade) || 0;
          const treinoDias = Object.entries(trainingSchedule.base || {})
            .filter(([, d]: any) => d?.is_training_day)
            .map(([dia, d]: any) => ({ dia, ...d }));
          const treinoPrincipal = treinoDias[0];
          const tdeeBruto = Number(ne.tdee_bruto || r.get || r.tmb || kcalTotaisExibicao) || 0;
          const fatorFarma = Number(ne.fator_farmacologico || (Array.isArray(ne.compostos_ativos) && ne.compostos_ativos.length ? 1.08 : 1)) || 1;
          const tdeeAjustado = Number(ne.tdee_ajustado || tdeeBruto * fatorFarma || kcalTotaisExibicao) || 0;
          const macros = ne.hierarquia_macros || {
            ptn_g_kg: pesoKg ? Math.round((Number(r.proteina_total || 0) / pesoKg) * 10) / 10 : (form.objetivo === "emagrecimento" ? 2.4 : 2.1),
            gordura_g_kg: pesoKg ? Math.round((Number(r.gordura_total || 0) / pesoKg) * 10) / 10 : 0.8,
            cho_cycling: {
              treino_pesado: Math.round(Number(r.carboidrato_total || 0) * 1.12),
              treino_leve: Math.round(Number(r.carboidrato_total || 0) * 0.9),
              off: Math.round(Number(r.carboidrato_total || 0) * 0.68),
            },
          };
          const elet = ne.eletrolitos_por_fase || ne.eletrolitos || {
            fase: form.fasePeriodizacao?.replace(/_/g, " ") || "base",
            agua_ml: pesoKg ? Math.round(pesoKg * 42) : "—",
            sodio_mg: form.fazCardio || treinoDias.length >= 5 ? 3500 : 2800,
            potassio_mg: 3500,
            magnesio_mg: 350,
            ratio_na_k: "~1:1",
          };
          const crono = (Array.isArray(ne.cronobiologia) && ne.cronobiologia.length ? ne.cronobiologia : [
            { horario: treinoPrincipal?.time || "07:00", janela: "Pré / Pós-treino", regra: "Concentrar carboidratos ao redor do treino e manter proteína distribuída nas refeições." },
            { horario: "manhã", janela: "Cortisol alto", regra: "Priorizar proteína, fruta/fibra e hidratação para estabilidade glicêmica." },
            { horario: "noite", janela: "Sono e recuperação", regra: "Ceia leve com proteína de digestão lenta se houver intervalo longo até o café." },
          ]);
          const micros = (Array.isArray(ne.micronutrientes_criticos) && ne.micronutrientes_criticos.length ? ne.micronutrientes_criticos : [
            { nutriente: "Magnésio", dose: "300–400 mg/d", fonte_alimentar_ou_supl: "Folhas verdes, cacau, sementes ou suplemento conforme avaliação", justificativa: "Sono, contração muscular e controle de câimbras." },
            { nutriente: "Potássio", dose: "3–4 g/d", fonte_alimentar_ou_supl: "Banana, batata, feijão, água de coco", justificativa: "Performance, hidratação celular e pressão osmótica." },
            { nutriente: "Ômega-3", dose: "2–3x/semana via alimento", fonte_alimentar_ou_supl: "Sardinha, salmão, chia/linhaça", justificativa: "Suporte anti-inflamatório nutricional." },
          ]);
          const peak = ne.peak_week || { ativo: modoEspecial === "competicao" || form.fasePeriodizacao?.includes("peak"), dias_protocolo: [] };
          const masters = ne.masters_50 || { ativo: idadePaciente >= 50, regras_aplicadas: idadePaciente >= 50 ? ["Distribuir proteína em 4–5 pulsos/dia.", "Priorizar cálcio, vitamina D alimentar e força para massa magra.", "Evitar cortes agressivos sem monitoramento profissional."] : [] };
          const saude = (Array.isArray(ne.monitoramento_saude) && ne.monitoramento_saude.length ? ne.monitoramento_saude : [
            { exame: "Peso, cintura e performance", frequencia: "semanal", alerta_clinico: "Ajustar kcal se queda de performance ou perda >1%/semana." },
            { exame: "Sono, fome e digestão", frequencia: "diário", alerta_clinico: "Revisar fibras, eletrólitos e timing se aderência cair." },
            { exame: "Exames laboratoriais com profissional", frequencia: "8–12 semanas", alerta_clinico: "Obrigatório se houver compostos ativos ou preparação competitiva." },
          ]);
          const mce = ne.mce_comportamental || (plano as any).dica_mce || {
            mindset: "Foco em execução mínima diária: bater proteína, água e primeira refeição planejada.",
            comportamento: "Usar checklist simples por refeição e corrigir no próximo bloco, não no dia seguinte.",
            execucao: "Preparar 2 fontes de proteína e 2 carboidratos base para reduzir fricção da dieta.",
          };
          const tdee = ne.tdee_breakdown || {
            tmb: r.tmb,
            get_natural: r.get || tdeeBruto,
            get_farmaco: tdeeAjustado,
            meta_final: kcalTotaisExibicao,
            buffer_anticatabolico_pct: form.objetivo === "emagrecimento" ? 8 : 0,
            fator_farmacologico: fatorFarma,
            justificativa: "Fallback calculado a partir do resumo do plano e dados do formulário; edite se necessário.",
          };
          const timeline = ne.timeline_semanas || {
            fase_atual: form.fasePeriodizacao?.replace(/_/g, " ") || form.objetivo,
            ajustes_por_shape: [
              `Semana atual: ${fmtN(kcalTotaisExibicao, " kcal")} com ${fmtN(r.proteina_total, "g")} proteína, ${fmtN(r.carboidrato_total, "g")} carbo e ${fmtN(r.gordura_total, "g")} gordura.`,
              treinoDias.length ? `Treino mapeado em ${treinoDias.length} dias/semana; carbo maior nos dias de ${treinoPrincipal?.muscle_group || treinoPrincipal?.modality || "treino"}.` : "Sem treino semanal marcado; manter distribuição linear de macros.",
              "Reavaliar peso, aderência e performance a cada 7 dias antes de novo ajuste calórico.",
            ],
          };
          return (
            <div className="fade-up" style={{ margin: "0 24px 16px", display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", flexWrap: "wrap" }}>
                <span style={{ fontSize: 18 }}>🏆</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.green, fontFamily: "'Space Grotesk', sans-serif", flex: 1 }}>NutriPlan Elite · 11 Blocos</span>
                <button onClick={() => setEliteAllOpen(o => !o)} style={{ padding: "6px 12px", borderRadius: 6, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                  {eliteAllOpen ? "▴ Recolher tudo" : "▾ Expandir tudo"}
                </button>
                <button onClick={() => setEliteEdit(e => !e)} style={{ padding: "6px 12px", borderRadius: 6, background: eliteEdit ? T.green : T.bg3, border: `1px solid ${eliteEdit ? T.green : T.border2}`, color: eliteEdit ? "#000" : T.text, fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                  {eliteEdit ? "✓ Salvar edição" : "✎ Editar"}
                </button>
              </div>

              {eliteVazio && (
                <div style={{ padding: 12, borderRadius: 8, background: T.greenBg, border: `1px dashed ${T.green}`, fontSize: 11, color: T.text, lineHeight: 1.6 }}>
                  💡 Os 11 blocos abaixo são preenchidos automaticamente após gerar o plano. Para ativar TDEE Farmacológico, Peak Week e Masters 50+, marque <strong>compostos ativos</strong> no formulário e/ou selecione objetivo <strong>Peak Week / competição</strong>. Você pode abrir cada bloco para ver o conteúdo previsto e editar manualmente após a geração.
                </div>
              )}

              {(tdee || eliteVazio) && (
                <Section icon="🔥" title="BLOCO 1 · TDEE Farmacológico (detalhe)" defaultOpen={!!tdee}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
                    <Stat label="TMB" value={fmtN(tdee?.tmb, " kcal")} />
                    <Stat label="GET natural" value={fmtN(tdee?.get_natural, " kcal")} />
                    <Stat label="GET farmaco" value={fmtN(tdee?.get_farmaco, " kcal")} />
                    <Stat label="Meta final" value={fmtN(tdee?.meta_final, " kcal")} hl />
                    <Stat label="Buffer anti-cat" value={`+${tdee?.buffer_anticatabolico_pct ?? "—"}%`} />
                    <Stat label="Fator farmaco" value={`×${Number(tdee?.fator_farmacologico ?? 1).toFixed(2)}`} />
                  </div>
                  {tdee?.justificativa && <div style={{ marginTop: 8, fontSize: 11, color: T.muted, fontStyle: "italic" }}>{tdee.justificativa}</div>}
                </Section>
              )}

              <Section icon="🥩" title="BLOCO 2 · Macros Hierárquicos">
                {macros ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
                      <Stat label="Proteína" value={`${macros.ptn_g_kg ?? "—"} g/kg`} hl />
                      <Stat label="Gordura" value={`${macros.gordura_g_kg ?? "—"} g/kg`} />
                    </div>
                    {macros.cho_cycling && (
                      <div>
                        <div style={{ fontSize: 10, color: T.green, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>CHO Cycling</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                          <Stat label="Treino pesado" value={fmtN(macros.cho_cycling.treino_pesado, " g")} />
                          <Stat label="Treino leve" value={fmtN(macros.cho_cycling.treino_leve, " g")} />
                          <Stat label="Off" value={fmtN(macros.cho_cycling.off, " g")} />
                        </div>
                      </div>
                    )}
                  </div>
                ) : <Empty />}
              </Section>

              <Section icon="⏰" title="BLOCO 3 · Crononutrição">
                {crono.length ? (
                  <div style={{ display: "grid", gap: 6 }}>
                    {crono.map((c: any, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 10, padding: 8, background: T.bg3, borderRadius: 6, border: `1px solid ${T.border}` }}>
                        <span style={{ color: T.green, fontFamily: "monospace", fontSize: 12, fontWeight: 700, minWidth: 50 }}>{c.horario}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{c.janela}</div>
                          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{c.regra}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <Empty />}
              </Section>

              <Section icon="💧" title="BLOCO 4 · Hidratação & Eletrólitos">
                {elet ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
                    <Stat label="Fase" value={elet.fase || "—"} />
                    <Stat label="Água" value={`${elet.agua_ml ?? elet.agua_l ?? "—"} ${elet.agua_ml ? "ml" : "L"}`} />
                    <Stat label="Sódio" value={`${elet.sodio_mg ?? "—"} mg`} />
                    <Stat label="Potássio" value={`${elet.potassio_mg ?? "—"} mg`} />
                    <Stat label="Magnésio" value={`${elet.magnesio_mg ?? "—"} mg`} />
                    <Stat label="Na:K" value={elet.ratio_na_k ?? "—"} hl />
                  </div>
                ) : <Empty />}
              </Section>

              <Section icon="💊" title="BLOCO 5 · Micronutrientes Críticos">
                {micros.length ? (
                  <div style={{ display: "grid", gap: 6 }}>
                    {micros.map((m: any, i: number) => (
                      <div key={i} style={{ padding: 8, background: T.bg3, borderRadius: 6, border: `1px solid ${T.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontWeight: 700, color: T.green, fontSize: 12 }}>{m.nutriente}</span>
                          <span style={{ fontSize: 11, color: T.amber, fontFamily: "monospace" }}>{m.dose}</span>
                        </div>
                        {m.fonte_alimentar_ou_supl && <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{m.fonte_alimentar_ou_supl}</div>}
                        {m.justificativa && <div style={{ fontSize: 10, color: T.muted2, fontStyle: "italic", marginTop: 2 }}>{m.justificativa}</div>}
                      </div>
                    ))}
                  </div>
                ) : <Empty />}
              </Section>

              <Section icon="📅" title="BLOCO 6 · Timeline até o Campeonato">
                {timeline ? (
                  <div style={{ display: "grid", gap: 6 }}>
                    <Stat label="Fase atual" value={timeline.fase_atual || "—"} hl />
                    {Array.isArray(timeline.ajustes_por_shape) && timeline.ajustes_por_shape.map((a: string, i: number) => (
                      <div key={i} style={{ fontSize: 11, color: T.text, paddingLeft: 10, borderLeft: `2px solid ${T.green}` }}>{a}</div>
                    ))}
                  </div>
                ) : <Empty />}
              </Section>

              <Section icon="🏆" title="BLOCO 7 · Peak Week">
                {peak?.ativo ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    {Array.isArray(peak.dias_protocolo) && peak.dias_protocolo.map((d: any, i: number) => (
                      <div key={i} style={{ padding: 8, background: T.bg3, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 11 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                          <span style={{ color: T.green, fontWeight: 700 }}>{d.dia}</span>
                          <span style={{ color: T.text }}>CHO {d.cho_g}g</span>
                          <span style={{ color: T.text }}>Na {d.sodio_mg}mg</span>
                          <span style={{ color: T.text }}>Água {d.agua_l}L</span>
                          {d.treino && <span style={{ color: T.muted }}>· {d.treino}</span>}
                        </div>
                        {d.observacao && <div style={{ marginTop: 4, fontSize: 10, color: T.muted2, fontStyle: "italic" }}>{d.observacao}</div>}
                      </div>
                    ))}
                    {Array.isArray(peak.indicadores_backstage) && peak.indicadores_backstage.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10, color: T.green, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Indicadores Backstage</div>
                        {peak.indicadores_backstage.map((b: string, i: number) => (
                          <div key={i} style={{ fontSize: 11, color: T.text }}>• {b}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : <div style={{ fontSize: 11, color: T.muted2 }}>Não ativo (semanas até competição &gt; 1).</div>}
              </Section>

              <Section icon="🛡️" title="BLOCO 8 · Masters 50+">
                {masters?.ativo ? (
                  <div style={{ display: "grid", gap: 4 }}>
                    {(masters.regras_aplicadas || []).map((r: string, i: number) => (
                      <div key={i} style={{ fontSize: 11, color: T.text, paddingLeft: 10, borderLeft: `2px solid ${T.amber}` }}>{r}</div>
                    ))}
                  </div>
                ) : <div style={{ fontSize: 11, color: T.muted2 }}>Não ativo (idade &lt; 50).</div>}
              </Section>

              <Section icon="🍽️" title="BLOCO 9 · Edição & Personalização">
                <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6 }}>
                  Substituições respeitam macro principal (±10% kcal), timing fisiológico e restrições.
                  Alimentos travados permanecem inalterados; gap &gt; 50 kcal gera alerta de compensação.
                  Bloqueio automático se PTN &lt; 2 g/kg ou gordura &lt; 0.8 g/kg.
                </div>
              </Section>

              <Section icon="🩺" title="BLOCO 10 · Saúde Monitorada">
                {saude.length ? (
                  <div style={{ display: "grid", gap: 6 }}>
                    {saude.map((m: any, i: number) => (
                      <div key={i} style={{ padding: 8, background: T.bg3, borderRadius: 6, border: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{m.exame}</div>
                          {m.alerta_clinico && <div style={{ fontSize: 10, color: T.red, marginTop: 2 }}>⚠ {m.alerta_clinico}</div>}
                        </div>
                        <span style={{ fontSize: 10, color: T.amber, fontFamily: "monospace", whiteSpace: "nowrap" }}>{m.frequencia}</span>
                      </div>
                    ))}
                  </div>
                ) : <Empty />}
              </Section>

              <Section icon="🧠" title="BLOCO 11 · MCE Comportamental">
                {mce ? (
                  <div style={{ display: "grid", gap: 6 }}>
                    {[
                      { l: "Mindset", v: mce.mindset },
                      { l: "Comportamento", v: mce.comportamento },
                      { l: "Execução", v: mce.execucao },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: 8, background: T.bg3, borderRadius: 6, border: `1px solid ${T.border}` }}>
                        <div style={{ fontSize: 10, color: T.green, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.l}</div>
                        <div style={{ fontSize: 12, color: T.text, marginTop: 3 }}>{item.v || "—"}</div>
                      </div>
                    ))}
                  </div>
                ) : <Empty />}
              </Section>
            </div>
          );
        })()}

        {/* NutriPlan Elite — Banner de Modo Especial (Competição / GLP-1 / Feminino + RED-S) */}
        {modoEspecial !== "normal" && (() => {
          const r = plano.resumo;
          const kcalUI = getResumoKcal(r);
          const peso = Number(form.peso) || 0;
          const kcalPorKg = peso > 0 ? kcalUI / peso : 0;
          const isRedSRisk = modoEspecial === "feminino" && peso > 0 && kcalPorKg < 30;
          const cfg: any = {
            competicao: { icon: "🏆", title: "MODO COMPETIÇÃO · Peak Week", color: T.amber, lines: [
              `Faltam ${diasComp} dia${diasComp > 1 ? "s" : ""} para a competição.`,
              diasComp <= 3 ? "Carb load + sódio controlado · cortar fibras insolúveis · hidratação ativa." : "Manter densidade nutricional · ajuste fino de sódio/água nas últimas 72h.",
            ]},
            glp1: { icon: "💉", title: "MODO GLP-1 · Anti-sarcopenia", color: T.blue, lines: [
              "Proteína 1,8–2,2g/kg/dia distribuída ≥5 refeições — priorizar proteína primeiro em cada refeição.",
              "Monitorar saciedade precoce, náusea e déficit calórico não intencional.",
            ]},
            feminino: { icon: "🌸", title: `MODO FEMININO · Fase ${faseCiclo.toUpperCase()}`, color: "#f472b6", lines: [
              faseCiclo === "folicular" ? "Sensibilidade insulínica alta · janela ideal para carbo e força." :
              faseCiclo === "ovulatoria" ? "Pico estrogênico · performance máxima · suporte antioxidante." :
              faseCiclo === "lutea" ? "Termogênese ↑ (+5–10% TDEE) · craving carbo · magnésio + B6 ajudam TPM." :
              "Menstrual · ferro + vit C · evitar restrição agressiva.",
              "Monitorar ciclo. Amenorreia >2 meses = STOP restrição (RED-S).",
            ]},
            vegano: { icon: "🌱", title: "MODO VEGANO · Plant-based completo", color: "#4ade80", lines: [
              "Proteína 1,6–2,0g/kg combinando leguminosas + cereais + soja/seitan a cada refeição (PDCAAS).",
              "Suplementar B12 (1000mcg/sem), D3 vegana, ômega-3 (algas, EPA+DHA 500mg), creatina 5g, ferro + vit C.",
              "Atenção a lisina, leucina, zinco, iodo e cálcio. Evitar refeições só de fruta/cereal sem proteína.",
            ]},
            low_fodmap: { icon: "🌾", title: "MODO LOW-FODMAP · GutON 3 fases", color: "#fbbf24", lines: [
              "Fase 1 (eliminação 2–6 sem): cortar trigo, lactose, alho, cebola, leguminosas, polióis, frutas FODMAP.",
              "Fase 2 (reintrodução): testar 1 grupo/3–4 dias com diário de sintomas. Fase 3: personalização final.",
              "Garantir fibra solúvel tolerada (aveia, kiwi, chia), hidratação e proteína magra cada refeição.",
            ]},
            longevidade: { icon: "🧬", title: "MODO LONGEVIDADE · Densidade × inflamação", color: "#a78bfa", lines: [
              "Padrão mediterrâneo: ≥30g fibra/dia, ômega-3 EPA+DHA 1–2g, polifenóis (azeite, frutas vermelhas, chá verde).",
              "Proteína 1,2–1,6g/kg priorizando vegetal + peixe; reduzir carne vermelha processada e ultraprocessados.",
              "Janela alimentar 10–12h (TRE leve), evitar comer 3h antes de dormir, sono e força como pilares.",
            ]},
          }[modoEspecial];
          if (!cfg) return null;
          return (
            <div className="fade-up" style={{ margin: "0 24px 16px", padding: 14, borderRadius: 12, background: T.bg2, border: `1px solid ${cfg.color}`, borderLeft: `4px solid ${cfg.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                <div style={{ fontSize: 11, color: cfg.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{cfg.title}</div>
              </div>
              {cfg.lines.map((l: string, i: number) => (
                <div key={i} style={{ fontSize: 12, color: T.text, lineHeight: 1.5, marginBottom: 3 }}>• {l}</div>
              ))}
              {isRedSRisk && (
                <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "#7f1d1d22", border: "1px solid #ef4444", fontSize: 11, color: "#fca5a5", fontWeight: 600 }}>
                  ⚠ ALERTA RED-S — Plano em {kcalPorKg.toFixed(1)} kcal/kg (&lt;30). Revisar disponibilidade energética antes de prescrever.
                </div>
              )}
            </div>
          );
        })()}

        {showProtocoloModal && (
          <div onClick={() => !protocoloRecalc && setShowProtocoloModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 14, padding: 24, maxWidth: 600, width: "100%", maxHeight: "90vh", overflow: "auto" as const }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>🧪</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Revisar protocolo farmacológico</div>
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 16, lineHeight: 1.5 }}>
                Edite o texto abaixo. Ao recalcular, o sistema vai detectar novamente cada composto, recalcular o fator farmacológico, ajustar os macros (proteína, carbo, gordura) e regerar todas as refeições.
              </div>

              <div style={{ marginBottom: 14 }}>
                <Label>Protocolo (texto livre)</Label>
                <textarea
                  value={protocoloDraft}
                  onChange={(e) => setProtocoloDraft(e.target.value)}
                  rows={7}
                  disabled={protocoloRecalc}
                  placeholder="Ex: Testosterona Enantato 300mg/sem, NPP 200mg/sem, CJC-1295 sem DAC 2mg 2x/sem, Ipamorelin 200mcg 3x/dia, Metformina 500mg 2x/dia..."
                  style={{
                    width: "100%",
                    minHeight: 160,
                    background: T.bg3,
                    border: `1px solid ${T.border2}`,
                    borderRadius: 8,
                    padding: 12,
                    color: T.text,
                    fontSize: 13,
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                    resize: "vertical" as const,
                    boxSizing: "border-box" as const,
                  }}
                  maxLength={2000}
                />
                <div style={{ fontSize: 10, color: T.muted, marginTop: 4, textAlign: "right" as const }}>
                  {protocoloDraft.length}/2000
                </div>
              </div>

              <div style={{ background: T.greenBg, border: `1px solid ${T.border2}`, borderRadius: 8, padding: "10px 12px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: T.green, lineHeight: 1.5 }}>
                  💡 <strong>Dica:</strong> use nomes completos quando possível (ex: "trembolona", "stanozolol", "semaglutida"). O detector reconhece ~35 compostos com várias grafias e abreviações ("test e", "deca", "tren a", "GW", "MK-677" etc.).
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" as const }}>
                <button
                  onClick={() => setShowProtocoloModal(false)}
                  disabled={protocoloRecalc}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 8,
                    background: T.bg3,
                    border: `1px solid ${T.border2}`,
                    color: T.muted,
                    fontSize: 12,
                    cursor: protocoloRecalc ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    opacity: protocoloRecalc ? 0.5 : 1,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={recalcularComProtocolo}
                  disabled={protocoloRecalc}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 8,
                    background: T.amber,
                    border: `1px solid ${T.amber}`,
                    color: "#1a1206",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: protocoloRecalc ? "wait" : "pointer",
                    fontFamily: "inherit",
                    opacity: protocoloRecalc ? 0.6 : 1,
                  }}
                >
                  {protocoloRecalc ? "Recalculando..." : "🔄 Recalcular plano"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSendModal && (
          <div onClick={() => setShowSendModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 14, padding: 24, maxWidth: 460, width: "100%" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>Enviar plano alimentar</div>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 20 }}>Escolha um aluno ou parceiro. Ele receberá o plano + notificação no app.</div>

              <div style={{ marginBottom: 14 }}>
                <Label required>Tipo de destinatário</Label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["aluno", "parceiro"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setRecipientType(t); setSelectedPatient(""); setSelectedPartner(""); }}
                      style={{
                        flex: 1, padding: "9px 12px", borderRadius: 8,
                        background: recipientType === t ? T.greenBg : T.bg3,
                        border: `1px solid ${recipientType === t ? T.green : T.border2}`,
                        color: recipientType === t ? T.green : T.muted,
                        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      {t === "aluno" ? "🎓 Aluno" : "🤝 Parceiro"}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <Label required>{recipientType === "aluno" ? "Aluno destinatário" : "Parceiro destinatário"}</Label>
                {recipientType === "aluno" ? (
                  patients.length === 0 ? (
                    <div style={{ fontSize: 12, color: T.amber, padding: "10px 12px", background: "#1f1a0a", border: `1px solid ${T.amber}33`, borderRadius: 8 }}>
                      Nenhum aluno vinculado encontrado.
                    </div>
                  ) : (
                    <SelectField value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
                      <option value="">Selecione um aluno...</option>
                      {patients.map((p) => (
                        <option key={p.user_id} value={p.user_id}>{p.name}</option>
                      ))}
                    </SelectField>
                  )
                ) : (
                  partnersList.length === 0 ? (
                    <div style={{ fontSize: 12, color: T.amber, padding: "10px 12px", background: "#1f1a0a", border: `1px solid ${T.amber}33`, borderRadius: 8 }}>
                      Nenhum parceiro cadastrado.
                    </div>
                  ) : (
                    <SelectField value={selectedPartner} onChange={(e) => setSelectedPartner(e.target.value)}>
                      <option value="">Selecione um parceiro...</option>
                      {partnersList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}{p.email ? ` — ${p.email}` : ""}</option>
                      ))}
                    </SelectField>
                  )
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <Label>Mensagem (opcional)</Label>
                <TextareaField placeholder="Observação para o destinatário..." value={sendObs} onChange={(e) => setSendObs(e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setShowSendModal(false)} style={{ padding: "9px 18px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancelar
                </button>
                <button
                  onClick={enviarPlano}
                  disabled={sending || (recipientType === "aluno" ? !selectedPatient : !selectedPartner)}
                  style={{ padding: "9px 18px", borderRadius: 8, background: T.green, border: `1px solid ${T.green}`, color: "#0a0f0a", fontSize: 12, cursor: sending ? "wait" : "pointer", fontFamily: "inherit", fontWeight: 700, opacity: sending || (recipientType === "aluno" ? !selectedPatient : !selectedPartner) ? 0.6 : 1 }}>
                  {sending ? "Enviando..." : "📨 Enviar agora"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showHistory && (
          <div onClick={() => setShowHistory(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 14, padding: 20, maxWidth: 720, width: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>🗂️ Histórico de planos</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Todos os planos alimentares criados — abra para ver, reenviar ou usar como base.</div>
                </div>
                <button onClick={() => setShowHistory(false)} style={{ background: "transparent", border: "none", color: T.muted, fontSize: 22, cursor: "pointer" }}>×</button>
              </div>

              <input
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Buscar por nome ou objetivo..."
                style={{
                  width: "100%", background: T.bg3, border: `1px solid ${T.border2}`,
                  borderRadius: 8, padding: "9px 12px", color: T.text, fontSize: 13,
                  outline: "none", marginBottom: 14, fontFamily: "inherit",
                }}
              />

              <div style={{ overflowY: "auto", flex: 1, paddingRight: 4 }}>
                {loadingHistory ? (
                  <div style={{ textAlign: "center", padding: 30, color: T.muted, fontSize: 13 }}>Carregando...</div>
                ) : history.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 30, color: T.muted, fontSize: 13 }}>Nenhum plano salvo ainda.</div>
                ) : (
                  history
                    .filter((h) => {
                      const q = historySearch.trim().toLowerCase();
                      if (!q) return true;
                      return (h.patient_name || "").toLowerCase().includes(q) || (h.objetivo || "").toLowerCase().includes(q);
                    })
                    .map((h) => {
                      const isSent = h.status === "sent";
                      const dt = new Date(h.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
                      const kcal = getResumoKcal(h.plano?.resumo);
                      return (
                        <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 14px", border: `1px solid ${T.border}`, borderRadius: 10, background: T.card, marginBottom: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{h.patient_name}</span>
                              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: isSent ? T.greenBg : T.bg3, border: `1px solid ${isSent ? T.green : T.border2}`, color: isSent ? T.green : T.muted, fontWeight: 700, textTransform: "uppercase" }}>
                                {isSent ? "Enviado" : "Rascunho"}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                              {h.objetivo || "—"} {kcal ? `· ${kcal} kcal` : ""} · {dt}
                            </div>
                            {h.observacao && (
                              <div style={{ fontSize: 11, color: T.muted2, marginTop: 4, fontStyle: "italic" }}>"{h.observacao}"</div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            <button
                              onClick={() => { setPlano(h.plano); setSavedId(h.id); setShowHistory(false); setStep("result"); }}
                              style={{ padding: "7px 12px", borderRadius: 7, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
                            >
                              👁️ Abrir
                            </button>
                            <button
                              onClick={() => { setPlano(h.plano); setSavedId(h.id); setShowHistory(false); setStep("result"); setTimeout(() => setShowSendModal(true), 100); }}
                              style={{ padding: "7px 12px", borderRadius: 7, background: T.green, border: `1px solid ${T.green}`, color: "#0a0f0a", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}
                            >
                              📨 Enviar
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}


        <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }} className="fade-up">
          {/* Total real do dia (Atwater) vs meta */}
          {(() => {
            const meals = (plano?.refeicoes || []) as Meal[];
            const kcalReal = meals.reduce((acc, m) => acc + getMealKcal(m), 0);
            const pReal = Math.round(meals.reduce((a, m) => a + (Number(m?.macros?.proteina) || 0), 0) * 10) / 10;
            const cReal = Math.round(meals.reduce((a, m) => a + (Number(m?.macros?.carboidrato) || 0), 0) * 10) / 10;
            const gReal = Math.round(meals.reduce((a, m) => a + (Number(m?.macros?.gordura) || 0), 0) * 10) / 10;
            const meta = getResumoKcal(r);
            const diff = meta - kcalReal;
            const divergente = meta && Math.abs(diff) > 50;
            return (
              <div style={{ background: T.card, border: `1px solid ${divergente ? "rgba(245,158,11,0.5)" : T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>Realizado vs Meta (Atwater 4/4/9)</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, fontSize: 12 }}>
                  <div><div style={{ color: T.muted, fontSize: 10 }}>Realizado</div><div style={{ color: T.green, fontWeight: 700, fontSize: 14 }}>{kcalReal} kcal</div><div style={{ color: T.muted, fontSize: 10 }}>P {pReal} · C {cReal} · G {gReal}</div></div>
                  <div><div style={{ color: T.muted, fontSize: 10 }}>Meta</div><div style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{meta} kcal</div></div>
                  <div><div style={{ color: T.muted, fontSize: 10 }}>Diferença</div><div style={{ color: divergente ? "#f59e0b" : T.muted, fontWeight: 700, fontSize: 14 }}>{diff > 0 ? "+" : ""}{diff} kcal</div></div>
                </div>
                {divergente && (
                  <div style={{ marginTop: 8, fontSize: 10, color: "#f59e0b" }}>
                    ⚠ Gap &gt; 50 kcal entre meta e soma dos macros das refeições. Revise as gramaturas dos alimentos proteicos.
                  </div>
                )}
              </div>
            );
          })()}

          {/* Alerta de divergência kcal bruto vs Atwater */}
          {kcalDeclTotal > 0 && Math.abs(kcalDeclTotal - kcalAtwaterTotal) > 50 && (
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.45)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#f59e0b" }}>
              <span style={{ fontSize: 14 }}>⚠</span>
              <div style={{ lineHeight: 1.5 }}>
                <strong>Inconsistência calórica:</strong> a IA declarou <strong>{kcalDeclTotal} kcal</strong>, mas os macros (P {r.proteina_total}g · C {r.carboidrato_total}g · G {r.gordura_total}g) somam <strong>{kcalAtwaterTotal} kcal</strong> pela fórmula Atwater (4/4/9). Diferença de <strong>{Math.abs(kcalDeclTotal - kcalAtwaterTotal)} kcal</strong>. Exibindo o valor calculado.
              </div>
            </div>
          )}

          {/* Resumo cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 24 }}>
            {[
              { l: "Calorias", v: `${kcalTotaisExibicao} kcal`, c: T.green },
              { l: "Proteína", v: `${r.proteina_total}g (${macroP}%)`, c: T.blue },
              { l: "Carboidrato", v: `${r.carboidrato_total}g (${macroC}%)`, c: T.amber },
              { l: "Gordura", v: `${r.gordura_total}g (${macroG}%)`, c: "#f472b6" },
              { l: "TMB", v: `${r.tmb} kcal`, c: T.muted },
              { l: "GET", v: `${r.get} kcal`, c: T.muted },
              { l: "IMC", v: r.imc, c: T.muted },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase" as const, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Barra de macros visual */}
          <div style={{ marginBottom: 24, padding: "16px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 10, textTransform: "uppercase" as const }}>Distribuição de macros</div>
            <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", background: T.bg3 }}>
              <div style={{ width: `${macroP}%`, background: T.blue, transition: "width .5s" }} />
              <div style={{ width: `${macroC}%`, background: T.amber, transition: "width .5s" }} />
              <div style={{ width: `${macroG}%`, background: "#f472b6", transition: "width .5s" }} />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              {([["Proteína", macroP, T.blue], ["Carboidrato", macroC, T.amber], ["Gordura", macroG, "#f472b6"]] as [string, number, string][]).map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.muted }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                  {l}
                  <span style={{ color: T.text, fontWeight: 600 }}>{v}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* ───────── Card: Fórmula TMB selecionada automaticamente ───────── */}
          {(() => {
            const formula = (r as any)?.formula_tmb as string | undefined;
            if (!formula) return null;
            const justificativa = (r as any)?.justificativa_formula as string | undefined;
            const bfUsed = (r as any)?.bf_utilizado as number | null | undefined;
            const metodoBF = (r as any)?.metodo_bf as string | undefined;
            const conf = (r as any)?.confiabilidade_bf as string | undefined;
            const massaMagra = (r as any)?.massa_magra as number | null | undefined;
            const aviso = (r as any)?.aviso_bf as string | null | undefined;
            const corConf =
              conf === "alta" ? "#22c55e" :
              conf === "media-alta" ? "#86efac" :
              conf === "media" ? "#facc15" :
              conf === "baixa" ? "#f97316" : T.muted;
            const labelMetodo: Record<string, string> = {
              informado_coach: "informado",
              navy: "Método Navy",
              visual: "estimativa visual",
              estimativa_automatica: "estimativa automática",
              nao_disponivel: "não disponível",
            };
            return (
              <div style={{ marginBottom: 24, padding: 16, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>📐 Fórmula TMB</div>
                  <div style={{ fontSize: 10, color: corConf, border: `1px solid ${corConf}55`, padding: "1px 6px", borderRadius: 999, background: `${corConf}15` }}>
                    confiabilidade BF: {conf || "—"}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.amber, marginBottom: 4 }}>{formula}</div>
                {justificativa && (
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 8, lineHeight: 1.5 }}>{justificativa}</div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: T.text }}>
                  <div>BF: <strong>{bfUsed !== null && bfUsed !== undefined ? `${bfUsed}%` : "—"}</strong>{metodoBF ? <span style={{ color: T.muted }}> ({labelMetodo[metodoBF] || metodoBF})</span> : null}</div>
                  <div>Massa magra: <strong>{massaMagra !== null && massaMagra !== undefined ? `${massaMagra} kg` : "—"}</strong></div>
                </div>
                {aviso && (
                  <div style={{ marginTop: 10, padding: "8px 10px", background: "#facc1515", border: `1px solid #facc1555`, borderRadius: 8, fontSize: 11, color: "#facc15", lineHeight: 1.5 }}>
                    ⚠️ {aviso}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ───────── Card colapsável: Auditoria do Cálculo ───────── */}
          {(() => {
            const aud = (r as any)?.auditoria_calculo;
            if (!aud) return null;
            const formula = aud.formula_tmb || "—";
            const tmb = aud.tmb ?? "—";
            const fatAtiv = aud.fator_atividade ?? "—";
            const getBase = aud.get_base ?? "—";
            const kcalCardio = aud.kcal_cardio_dia ?? 0;
            const getComCardio = aud.get_com_cardio ?? "—";
            const fatorFarma = aud.fator_farma ?? 1;
            const getFarma = aud.get_farma ?? "—";
            const fatorNeat = aud.fator_neat ?? 1;
            const getFinal = aud.get_final ?? "—";
            const surplus = aud.surplus ?? 1;
            const surplusPct = Math.round((surplus - 1) * 100);
            const metaKcal = aud.meta_kcal ?? "—";
            const protGkg = aud.proteina_gkg ?? "—";
            const gordPct = aud.gordura_pct ? Math.round(aud.gordura_pct * 100) : null;
            const cap = aud.ajuste_carbo_cap;
            const bfUsed = (r as any)?.bf_utilizado;
            const metodoBF = (r as any)?.metodo_bf;
            const massaMagra = (r as any)?.massa_magra;
            const aviso = (r as any)?.aviso_bf;
            const pesoForm = parseFloat(String(form.peso || "0")) || 0;
            const proteinaG = (r as any)?.proteina_total;
            const carboG = (r as any)?.carboidrato_total;
            const gorduraG = (r as any)?.gordura_total;
            const nivelAtv = form.nivelAtividade || "—";
            const cardioFreq = form.cardioFrequencia || "—";
            const cardioDur = form.cardioDuracao || "—";
            const fase = form.fasePeriodizacao || form.objetivo || "—";

            const Linha = ({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) => (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px dashed ${T.border}`, fontSize: 12 }}>
                <span style={{ color: T.muted }}>{label}</span>
                <span style={{ color: accent ? T.amber : T.text, fontWeight: accent ? 700 : 500, fontFamily: "ui-monospace, monospace" }}>{value}</span>
              </div>
            );

            return (
              <div style={{ marginBottom: 24 }}>
                <details style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                  <summary style={{ padding: 14, cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", userSelect: "none" as const }}>
                    <div>
                      <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>📊 Auditoria do Cálculo</div>
                      <div style={{ fontSize: 13, color: T.text, fontWeight: 600, marginTop: 2 }}>
                        Step-by-step: TMB → GET → Macros
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: T.muted }}>clique para abrir ▾</span>
                  </summary>
                  <div style={{ padding: "0 16px 16px 16px" }}>
                    <Linha label={`TMB (${formula})`} value={`${tmb} kcal`} />
                    <Linha label={`× Fator atividade (${nivelAtv})`} value={`×${fatAtiv} = ${getBase} kcal`} />
                    {kcalCardio > 0 && (
                      <Linha label={`+ Cardio (${cardioFreq}× ${cardioDur}min)`} value={`+${kcalCardio} kcal`} />
                    )}
                    <Linha label="= GET com cardio" value={`${getComCardio} kcal`} />
                    <Linha label="× Fator farmacológico" value={`×${fatorFarma} = ${getFarma} kcal`} />
                    {fatorNeat !== 1 && (
                      <Linha label="× NEAT" value={`×${fatorNeat} = ${getFinal} kcal`} />
                    )}
                    <Linha
                      label={`× Surplus (${fase}) ${surplusPct >= 0 ? "+" : ""}${surplusPct}%`}
                      value={`= ${metaKcal} kcal`}
                      accent
                    />
                    <div style={{ height: 10 }} />
                    <Linha label="Proteína" value={`${protGkg}g/kg × ${pesoForm}kg = ${proteinaG}g`} />
                    {gordPct !== null && (
                      <Linha label="Gordura" value={`${gordPct}% de ${metaKcal}kcal = ${gorduraG}g`} />
                    )}
                    <Linha label="Carboidrato" value={`restante = ${carboG}g`} />

                    {cap && (
                      <div style={{ marginTop: 10, padding: "8px 10px", background: "#facc1515", border: `1px solid #facc1555`, borderRadius: 8, fontSize: 11, color: "#facc15", lineHeight: 1.5 }}>
                        ⚠️ Carbo limitado ao cap de palatabilidade: {cap.carbo_original}g → {cap.carbo_ajustado}g.
                        Excesso transferido para gordura: +{cap.gordura_bonus}g.
                      </div>
                    )}

                    <div style={{ height: 14 }} />
                    <Linha
                      label="BF utilizado"
                      value={`${bfUsed ?? "—"}% (${metodoBF || "—"})`}
                    />
                    <Linha label="Massa magra" value={`${massaMagra ?? "—"} kg`} />
                    <Linha label="Fórmula TMB" value={formula} />

                    {aviso && (
                      <div style={{ marginTop: 10, padding: "8px 10px", background: "#facc1515", border: `1px solid #facc1555`, borderRadius: 8, fontSize: 11, color: "#facc15", lineHeight: 1.5 }}>
                        ⚠️ {aviso}
                      </div>
                    )}
                  </div>
                </details>
              </div>
            );
          })()}

          {(() => {
            const compostos = ((r as any)?.compostos_detectados as string[] | undefined) || [];
            const fatorFarm = (r as any)?.fator_farmacologico as number | undefined;
            const alertasCrit = ((r as any)?.alertas_criticos as string[] | undefined) || [];
            const hepatoCount = (r as any)?.hepatotoxico_count as number | undefined;
            const protoTexto = (form.protocoloFarmacologico || "").trim();
            return (
              <div style={{
                marginBottom: 24,
                padding: 16,
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: (compostos.length || protoTexto) ? 12 : 0 }}>
                  <div>
                    <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 4 }}>
                      🧪 Protocolo farmacológico
                    </div>
                    <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>
                      {compostos.length > 0
                        ? `${compostos.length} composto${compostos.length > 1 ? "s" : ""} detectado${compostos.length > 1 ? "s" : ""}`
                        : protoTexto
                          ? "Texto preenchido — nenhum composto reconhecido pelo detector"
                          : "Nenhum protocolo informado"}
                    </div>
                    {typeof fatorFarm === "number" && fatorFarm !== 1 && (
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>
                        Fator farmacológico aplicado: <span style={{ color: T.amber, fontWeight: 600 }}>×{fatorFarm.toFixed(3)}</span>
                        {hepatoCount && hepatoCount > 0 ? <> · <span style={{ color: "#f87171" }}>{hepatoCount} hepatotóxico{hepatoCount > 1 ? "s" : ""}</span></> : null}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={abrirRevisaoProtocolo}
                    disabled={protocoloRecalc}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      background: T.amber,
                      border: `1px solid ${T.amber}`,
                      color: "#1a1206",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: protocoloRecalc ? "wait" : "pointer",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap" as const,
                      opacity: protocoloRecalc ? 0.6 : 1,
                    }}
                    title="Editar o texto do protocolo e recalcular automaticamente compostos detectados, fator farmacológico, macros e refeições"
                  >
                    ✏️ Revisar protocolo
                  </button>
                </div>

                {compostos.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: alertasCrit.length ? 10 : 0 }}>
                    {compostos.map((c) => (
                      <span key={c} style={{
                        padding: "4px 9px",
                        borderRadius: 999,
                        background: T.bg3,
                        border: `1px solid ${T.border2}`,
                        color: T.text,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "lowercase" as const,
                      }}>{c}</span>
                    ))}
                  </div>
                )}

                {alertasCrit.length > 0 && (
                  <div style={{
                    background: "#1f0808",
                    border: `1px solid #f8717155`,
                    borderLeft: `3px solid #f87171`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: "#fca5a5",
                    fontSize: 11,
                    lineHeight: 1.5,
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>⛔ Alertas críticos:</div>
                    {alertasCrit.map((a, i) => (
                      <div key={i} style={{ marginTop: i === 0 ? 0 : 4 }}>• {a}</div>
                    ))}
                  </div>
                )}

                {protoTexto && compostos.length === 0 && (
                  <div style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: T.muted,
                    fontStyle: "italic" as const,
                  }}>
                    O texto livre não casou com nenhuma das ~35 keywords do detector. Use "Revisar protocolo" para ajustar a grafia (ex: "testosterona enantato" em vez de abreviações próprias) e recalcular.
                  </div>
                )}
              </div>
            );
          })()}

          {/* Aviso de validação de timing peri-workout vs schedule (somente o alerta — botões agora ficam num bloco sempre visível abaixo) */}
          {(() => {
            const mismatches = validateTimingVsSchedule(plano.refeicoes as any, trainingSchedule);
            if (!mismatches.length) return null;
            return (
              <div style={{
                background: "#1f1108",
                border: `1px solid ${T.red}55`,
                borderLeft: `3px solid ${T.red}`,
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 16,
                color: T.red,
                fontSize: 12,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  ⏱ Atenção: {mismatches.length} refeição{mismatches.length > 1 ? "ões" : ""} peri-workout fora do horário do schedule
                </div>
                <div style={{ color: "#fbbf24", fontSize: 11, marginBottom: 8 }}>
                  A IA gerou refeições com horário desalinhado do treino que você cadastrou. Use os botões de correção abaixo.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {mismatches.map((m, i) => (
                    <div key={i} style={{
                      background: "#0a0606",
                      border: `1px solid ${T.red}33`,
                      borderRadius: 6,
                      padding: "6px 10px",
                      color: T.text,
                      fontSize: 11,
                      lineHeight: 1.5,
                    }}>
                      <div style={{ fontWeight: 600, color: T.amber }}>{PERI_KIND_LABEL[m.kind]} — “{m.refeicao}”</div>
                      <div style={{ color: T.muted }}>
                        Horário no plano: <span style={{ color: T.red, fontWeight: 600 }}>{m.horario_plano}</span>
                        {" · "}Esperado: <span style={{ color: T.green, fontWeight: 600 }}>{m.horario_esperado}</span>
                        {" · "}Treino: <span style={{ color: T.text }}>{m.treino_ref}</span>
                        {" · "}Δ <span style={{ color: T.red }}>{m.delta_min}min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Bloco de ações de correção — SEMPRE visível quando há plano */}
          {(() => {
            const mismatches = validateTimingVsSchedule(plano.refeicoes as any, trainingSchedule);
            const aj: any = (plano as any)?.ajuste_calorico;
            const dentroDaBanda = aj?.aplicado ? !!aj.dentro_da_banda : true;
            const tudoOk = mismatches.length === 0 && dentroDaBanda;
            const borderColor = tudoOk ? T.green : T.amber;
            const bgColor = tudoOk ? T.greenBg : "#1f1608";
            return (
              <div style={{
                background: bgColor,
                border: `1px solid ${borderColor}55`,
                borderLeft: `3px solid ${borderColor}`,
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 16,
              }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: borderColor,
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  🛠 Ações de correção do plano
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>
                  {tudoOk
                    ? "Plano alinhado em horários e calorias. Você ainda pode forçar um reajuste manual quando quiser."
                    : `Pendências detectadas: ${mismatches.length > 0 ? `${mismatches.length} horário(s) peri-workout` : ""}${mismatches.length > 0 && !dentroDaBanda ? " · " : ""}${!dentroDaBanda ? "calorias fora da banda ±3%" : ""}.`}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button
                    onClick={async () => {
                      if (retrying || autoRetrying) return;

                      // Inicializa run de auditoria
                      const runId =
                        (typeof crypto !== "undefined" && (crypto as any).randomUUID)
                          ? (crypto as any).randomUUID()
                          : `run_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
                      let stepIndex = 0;
                      const patientName: string | undefined =
                        (plano as any)?.resumo?.nome || (form as any)?.nome;
                      const logStep = async (
                        step_type: string,
                        ok: boolean,
                        message: string,
                        details: any,
                        attempt?: number,
                      ) => {
                        if (!coachProfileId) return;
                        try {
                          stepIndex += 1;
                          await (supabase as any).from("coach_fix_all_logs").insert({
                            coach_id: coachProfileId,
                            run_id: runId,
                            patient_name: patientName || null,
                            step_index: stepIndex,
                            step_type,
                            attempt: attempt ?? null,
                            ok,
                            message,
                            details,
                          });
                        } catch (e) {
                          console.error("[fix-all log] falhou:", e);
                        }
                      };

                      // 1) Snap inicial nos horários peri-workout
                      const totalAntesSnap = sumKcalRefeicoes(plano.refeicoes as any);
                      const ajAntes: any = (plano as any)?.ajuste_calorico;
                      const { refeicoes: novasRef, fixedCount } = autoFixPeriWorkoutTimings(
                        plano.refeicoes as any,
                        trainingSchedule,
                      );
                      const horariosCorrigidos = (plano.refeicoes as any[])
                        .map((r, i) => {
                          const novo = (novasRef as any[])[i];
                          if (!novo || novo.horario === r.horario) return null;
                          return { refeicao: r.refeicao, de: r.horario, para: novo.horario };
                        })
                        .filter(Boolean);
                      await logStep(
                        "snap_inicial",
                        true,
                        fixedCount > 0
                          ? `${fixedCount} refeição(ões) peri-workout reposicionada(s).`
                          : "Nenhum horário peri-workout fora da janela.",
                        {
                          fixed_count: fixedCount,
                          horarios_corrigidos: horariosCorrigidos,
                          total_kcal_plano: totalAntesSnap,
                          ajuste_calorico_inicial: ajAntes
                            ? {
                                alvo: ajAntes.alvo,
                                total_depois: ajAntes.total_depois,
                                dentro_da_banda: ajAntes.dentro_da_banda,
                                fator: ajAntes.fator,
                              }
                            : null,
                        },
                      );
                      if (fixedCount > 0) {
                        setPlano((prev) => prev ? ({ ...prev, refeicoes: novasRef as any }) : prev);
                        toast({
                          title: "✓ Horários ajustados",
                          description: `${fixedCount} refeição${fixedCount > 1 ? "ões" : ""} peri-workout reposicionada${fixedCount > 1 ? "s" : ""}.`,
                        });
                      }

                      // 2) Verifica banda calórica e regenera se necessário
                      const ajNow: any = (plano as any)?.ajuste_calorico;
                      const foraDaBanda = ajNow && ajNow.aplicado && !ajNow.dentro_da_banda;
                      if (foraDaBanda) {
                        await logStep(
                          "regerar_inicio",
                          true,
                          `Plano fora da banda ±3% (${ajNow.total_depois} vs alvo ${ajNow.alvo}). Iniciando regeração.`,
                          {
                            alvo: ajNow.alvo,
                            total_antes: ajNow.total_depois,
                            delta_kcal: (ajNow.total_depois ?? 0) - (ajNow.alvo ?? 0),
                            max_tentativas: MAX_AUTO_RETRIES,
                          },
                        );
                        toast({
                          title: "⚙️ Corrigindo calorias",
                          description: "Plano fora da banda ±3% — iniciando regeração até atingir a meta...",
                        });
                        await regerarAteAtingirMeta(async (info) => {
                          await logStep(
                            "regerar_tentativa",
                            info.ok,
                            info.error
                              ? `Tentativa ${info.attempt} falhou: ${info.error}`
                              : `Tentativa ${info.attempt}: ${info.total_depois} kcal (alvo ${info.alvo}, Δ${Math.round(info.delta_kcal)}, ${info.dentro_da_banda ? "dentro" : "fora"} da banda).`,
                            {
                              alvo: info.alvo,
                              total_depois: info.total_depois,
                              delta_kcal: info.delta_kcal,
                              fator: info.fator,
                              dentro_da_banda: info.dentro_da_banda,
                              ajuste_meta: info.ajuste_meta,
                              error: info.error,
                            },
                            info.attempt,
                          );
                        });

                        // 3) Re-snap nos horários do plano regenerado
                        let finalSnapCount = 0;
                        let finalCorrecoes: any[] = [];
                        let finalTotal = 0;
                        let finalAj: any = null;
                        setPlano((prev) => {
                          if (!prev) return prev;
                          finalAj = (prev as any)?.ajuste_calorico;
                          finalTotal = sumKcalRefeicoes(prev.refeicoes as any);
                          const r = autoFixPeriWorkoutTimings(prev.refeicoes as any, trainingSchedule);
                          finalSnapCount = r.fixedCount;
                          finalCorrecoes = (prev.refeicoes as any[])
                            .map((rr, i) => {
                              const novo = (r.refeicoes as any[])[i];
                              if (!novo || novo.horario === rr.horario) return null;
                              return { refeicao: rr.refeicao, de: rr.horario, para: novo.horario };
                            })
                            .filter(Boolean);
                          if (r.fixedCount === 0) return prev;
                          return { ...prev, refeicoes: r.refeicoes as any };
                        });
                        setTimeout(() => {
                          void logStep(
                            "snap_final",
                            true,
                            finalSnapCount > 0
                              ? `Re-snap aplicado em ${finalSnapCount} refeição(ões) após regeração.`
                              : "Plano regenerado já estava com horários alinhados.",
                            {
                              fixed_count: finalSnapCount,
                              horarios_corrigidos: finalCorrecoes,
                              total_kcal_plano: finalTotal,
                              ajuste_calorico_final: finalAj
                                ? {
                                    alvo: finalAj.alvo,
                                    total_depois: finalAj.total_depois,
                                    dentro_da_banda: finalAj.dentro_da_banda,
                                    fator: finalAj.fator,
                                  }
                                : null,
                            },
                          );
                        }, 0);
                      } else if (fixedCount === 0) {
                        await logStep("nada_a_corrigir", true, "Plano já alinhado em horários e calorias.", {});
                        toast({ title: "Nada a corrigir", description: "Plano já está alinhado em horários e calorias." });
                      } else {
                        await logStep(
                          "concluido_sem_regeracao",
                          true,
                          "Horários corrigidos e calorias dentro da banda ±3%.",
                          { fixed_count: fixedCount },
                        );
                        toast({ title: "🎯 Tudo certo", description: "Horários corrigidos e calorias dentro da banda ±3%." });
                      }
                    }}
                    disabled={retrying || autoRetrying}
                    style={{
                      background: `linear-gradient(135deg, ${T.green} 0%, ${T.greenDim} 100%)`,
                      color: "#000",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 18px",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: retrying || autoRetrying ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      opacity: retrying || autoRetrying ? 0.5 : 1,
                      boxShadow: `0 4px 12px ${T.green}33`,
                    }}
                  >
                    {autoRetrying
                      ? `⟳ Corrigindo... (${autoRetryAttempt}/${MAX_AUTO_RETRIES})`
                      : "✨ Corrigir tudo agora"}
                  </button>

                  <button
                    onClick={() => {
                      const { refeicoes: novasRef, fixedCount } = autoFixPeriWorkoutTimings(
                        plano.refeicoes as any,
                        trainingSchedule,
                      );
                      if (fixedCount === 0) {
                        toast({ title: "Nada para ajustar", description: "Nenhum horário fora da janela esperada." });
                        return;
                      }
                      setPlano((prev) => prev ? ({ ...prev, refeicoes: novasRef as any }) : prev);
                      toast({
                        title: "✓ Horários corrigidos",
                        description: `${fixedCount} refeição${fixedCount > 1 ? "ões" : ""} peri-workout reajustada${fixedCount > 1 ? "s" : ""} para a janela ideal do treino.`,
                      });
                    }}
                    disabled={retrying || autoRetrying}
                    style={{
                      background: "transparent",
                      color: T.green,
                      border: `1px solid ${T.green}`,
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: retrying || autoRetrying ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      opacity: retrying || autoRetrying ? 0.5 : 1,
                    }}
                  >
                    ⏱ Só ajustar horários
                  </button>

                  <button
                    onClick={() => { void gerar(); }}
                    disabled={retrying || autoRetrying}
                    style={{
                      background: "transparent",
                      color: T.amber,
                      border: `1px solid ${T.amber}`,
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: retrying || autoRetrying ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      opacity: retrying || autoRetrying ? 0.5 : 1,
                    }}
                  >
                    {retrying ? "⟳ Regerando..." : "🔄 Regerar plano"}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Relatório do ajuste calórico pós-processamento */}
          {(() => {
            const aj: any = (plano as any)?.ajuste_calorico;
            if (!aj || !aj.aplicado) return null;
            const ok = !!aj.dentro_da_banda;
            const accent = ok ? T.green : T.amber;
            const bg = ok ? T.greenBg : "#1f1608";
            return (
              <div style={{
                background: bg,
                border: `1px solid ${accent}55`,
                borderLeft: `3px solid ${accent}`,
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 16,
                color: T.text,
                fontSize: 12,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 6, color: accent, display: "flex", alignItems: "center", gap: 6 }}>
                  ⚖ Ajuste calórico automático {ok ? "aplicado com sucesso" : "aplicado parcialmente"}
                </div>
                <div style={{ color: T.muted, fontSize: 11, lineHeight: 1.6 }}>
                  Alvo: <span style={{ color: T.text, fontWeight: 600 }}>{aj.alvo} kcal</span> (banda {aj.banda_min}–{aj.banda_max})
                  {" · "}Antes: <span style={{ color: T.red, fontWeight: 600 }}>{aj.total_antes} kcal</span>
                  {" → "}Depois: <span style={{ color: accent, fontWeight: 600 }}>{aj.total_depois} kcal</span>
                  {" · "}Δ <span style={{ color: T.text }}>+{aj.delta_kcal} kcal</span>
                  {" · "}Fator: <span style={{ color: T.text }}>×{aj.fator}</span>
                  {aj.fator_limitado && <span style={{ color: T.red }}> (limitado a ×1.5)</span>}
                </div>
                <div style={{ color: T.muted, fontSize: 11, marginTop: 6, fontStyle: "italic" }}>
                  {aj.mensagem}
                </div>
                {!ok && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <button
                      onClick={() => { void regerarAteAtingirMeta(); }}
                      disabled={autoRetrying}
                      style={{
                        background: autoRetrying ? T.bg2 : accent,
                        color: autoRetrying ? T.muted : "#000",
                        border: `1px solid ${accent}`,
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: autoRetrying ? "wait" : "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {autoRetrying
                        ? `⟳ Regerando... (${autoRetryAttempt}/${MAX_AUTO_RETRIES})`
                        : `🎯 Regerar até atingir a meta (até ${MAX_AUTO_RETRIES}x)`}
                    </button>
                    <span style={{ fontSize: 10, color: T.muted }}>
                      Tenta novas gerações até o total cair na banda ±3% ou esgotar as tentativas. Mantém o melhor resultado.
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Histórico de ajustes calóricos — comparativo entre versões */}
          {adjustHistory.length > 0 && (
            <div style={{
              background: T.bg2,
              border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${T.amber}`,
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 16,
              color: T.text,
              fontSize: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, color: T.amber, display: "flex", alignItems: "center", gap: 6 }}>
                  📊 Histórico de ajustes calóricos
                  <span style={{ fontSize: 10, color: T.muted, fontWeight: 500 }}>
                    ({adjustHistory.length} versão{adjustHistory.length === 1 ? "" : "es"})
                  </span>
                </div>
                <button
                  onClick={() => setShowAdjustHistory((v) => !v)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${T.border2}`,
                    color: T.muted,
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  {showAdjustHistory ? "Recolher" : "Comparar versões"}
                </button>
              </div>

              {showAdjustHistory && (
                <div style={{ overflowX: "auto", marginTop: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead>
                      <tr style={{ color: T.muted, textAlign: "left" as const }}>
                        <th style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}` }}>Quando</th>
                        <th style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}` }}>Alvo</th>
                        <th style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}` }}>Antes</th>
                        <th style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}` }}>Depois</th>
                        <th style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}` }}>Δ</th>
                        <th style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}` }}>Fator</th>
                        <th style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}` }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjustHistory.map((h, idx) => {
                        const ok = !!h.dentro_da_banda;
                        const accent = ok ? T.green : T.amber;
                        const isLatest = idx === 0;
                        return (
                          <tr key={h.id} style={{ background: isLatest ? `${T.amber}10` : "transparent" }}>
                            <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}`, color: T.text }}>
                              {new Date(h.created_at).toLocaleString("pt-BR", {
                                day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                              })}
                              {isLatest && <span style={{ marginLeft: 6, color: T.amber, fontSize: 9 }}>● ATUAL</span>}
                            </td>
                            <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}`, color: T.text }}>
                              {h.target_kcal ? `${Math.round(h.target_kcal)}` : "—"}
                            </td>
                            <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}`, color: T.muted }}>
                              {h.total_antes ? `${Math.round(h.total_antes)}` : "—"}
                            </td>
                            <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}`, color: accent, fontWeight: 600 }}>
                              {h.total_depois ? `${Math.round(h.total_depois)}` : "—"}
                            </td>
                            <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}`, color: T.text }}>
                              {h.delta_kcal != null ? `${h.delta_kcal > 0 ? "+" : ""}${Math.round(h.delta_kcal)}` : "—"}
                            </td>
                            <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}`, color: T.text }}>
                              {h.fator ? `×${Number(h.fator).toFixed(3)}` : "—"}
                            </td>
                            <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}`, color: accent }}>
                              {h.aplicado ? (ok ? "✓ Na banda" : "⚠ Limitado") : "— Sem ajuste"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {loadingAdjustHistory && (
                    <div style={{ color: T.muted, fontSize: 11, marginTop: 8 }}>Carregando…</div>
                  )}
                </div>
              )}
            </div>
          )}

          {r.observacao_protocolo && (
            <div style={{ background: T.greenBg, border: `1px solid ${T.green}33`, borderRadius: 10, padding: "12px 16px", color: T.green, fontSize: 12, marginBottom: 16 }}>
              ✦ Protocolo integrado: {r.observacao_protocolo}
            </div>
          )}

          {/* Alerta coach */}
          {plano.alerta_coach && (
            <div style={{ background: "#1f1a0a", border: `1px solid ${T.amber}33`, borderRadius: 10, padding: "12px 16px", color: T.amber, fontSize: 12, marginBottom: 16 }}>
              ⚠ Atenção, coach: {plano.alerta_coach}
            </div>
          )}

          {/* Banner Inteligência Fisiológica (Elite) */}
          {plano.inteligencia_fisiologica && (() => {
            const inf = plano.inteligencia_fisiologica!;
            const score = inf.score_qualidade ?? 0;
            const scoreColor = score >= 90 ? "#1D9E75" : score >= 75 ? "#B8922A" : score >= 60 ? T.muted : T.red;
            const scoreLabel = score >= 90 ? "Plano de nível elite" : score >= 75 ? "Alta performance" : score >= 60 ? "Funcional — otimização possível" : "Básico — revisar protocolo";
            const C = 28, R = 24, CIRC = 2 * Math.PI * R;
            const dash = (score / 100) * CIRC;
            return (
              <div style={{
                background: "#1A1A1A", borderLeft: "3px solid #B8922A", borderRadius: 8,
                padding: "16px 20px", marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#B8922A", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                    ⚡ Inteligência Fisiológica do Plano
                  </span>
                </div>
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" as const }}>
                  <div style={{ position: "relative", width: C * 2, height: C * 2 }}>
                    <svg width={C * 2} height={C * 2} style={{ transform: "rotate(-90deg)" }}>
                      <circle cx={C} cy={C} r={R} fill="none" stroke={T.border2} strokeWidth="4" />
                      <circle cx={C} cy={C} r={R} fill="none" stroke="#B8922A" strokeWidth="4"
                        strokeDasharray={`${dash} ${CIRC}`} strokeLinecap="round" />
                    </svg>
                    <div style={{
                      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#B8922A" }}>{score}</span>
                      <span style={{ fontSize: 8, color: T.muted }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: scoreColor, marginBottom: 8 }}>{scoreLabel}</div>
                    <div style={{ display: "grid", gap: 4, fontSize: 12, color: T.muted }}>
                      <div>Diversidade vegetal: <span style={{ color: T.text, fontWeight: 600 }}>{inf.diversidade_vegetal_semanal ?? 0} espécies/semana</span></div>
                      <div>Fermentado diário: <span style={{ color: inf.fermentado_diario ? "#1D9E75" : T.muted }}>{inf.fermentado_diario ? "✓" : "✗"}</span></div>
                      <div>Cycling de CHO: <span style={{ color: inf.cycling_ativo ? "#1D9E75" : T.muted }}>{inf.cycling_ativo ? "✓ Ativo" : "— Inativo"}</span></div>
                    </div>
                  </div>
                </div>
                {inf.insights_coach && inf.insights_coach.length > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(184,146,42,0.2)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#B8922A", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                      Insights do Coach
                    </div>
                    <ul style={{ margin: 0, padding: "0 0 0 18px", color: T.text, fontSize: 12, lineHeight: 1.7 }}>
                      {inf.insights_coach.map((ins, i) => <li key={i}>{ins}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Mapa de Medidas Caseiras (Nutrition Coach IA) */}
          {plano.mapa_medidas_caseiras?.ativo && (
            <div style={{
              background: "#1A1A1A", borderLeft: "3px solid #B8922A", borderRadius: 8,
              padding: "16px 20px", marginBottom: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#B8922A", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                  🥄 Mapa de Medidas Caseiras
                </span>
              </div>
              {plano.mapa_medidas_caseiras.descricao && (
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginBottom: 14 }}>
                  {plano.mapa_medidas_caseiras.descricao}
                </div>
              )}

              {plano.mapa_medidas_caseiras.equivalencias && plano.mapa_medidas_caseiras.equivalencias.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#B8922A", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                    Equivalências do plano
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8 }}>
                    {plano.mapa_medidas_caseiras.equivalencias.map((eq, i) => (
                      <div key={i} style={{
                        background: T.bg3, border: `1px solid ${T.border2}`,
                        borderRadius: 8, padding: "8px 10px",
                      }}>
                        <div style={{ fontSize: 12, color: T.text, fontWeight: 600, lineHeight: 1.3 }}>{eq.medida}</div>
                        <div style={{ fontSize: 11, color: "#B8922A", fontWeight: 700, marginTop: 2 }}>= {eq.gramatura}</div>
                        {eq.alimento_referencia && (
                          <div style={{ fontSize: 10, color: T.muted2, marginTop: 2 }}>{eq.alimento_referencia}</div>
                        )}
                        {eq.observacao && (
                          <div style={{ fontSize: 10, color: T.muted2, fontStyle: "italic", marginTop: 2 }}>{eq.observacao}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {plano.mapa_medidas_caseiras.utensilios_padrao && plano.mapa_medidas_caseiras.utensilios_padrao.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#B8922A", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                    Utensílios padrão
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 6 }}>
                    {plano.mapa_medidas_caseiras.utensilios_padrao.map((u, i) => (
                      <div key={i} style={{
                        background: T.bg2, border: `1px dashed ${T.border2}`,
                        borderRadius: 8, padding: "6px 10px",
                        fontSize: 11, color: T.muted,
                      }}>
                        <span style={{ color: T.text, fontWeight: 600 }}>{u.utensilio}</span>
                        {u.volume_ml ? <span> · {u.volume_ml}ml</span> : null}
                        {u.peso_referencia_g ? <span> · {u.peso_referencia_g}</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {plano.mapa_medidas_caseiras.dica_paciente && (
                <div style={{
                  marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(184,146,42,0.2)",
                  fontSize: 12, color: T.text, lineHeight: 1.6,
                }}>
                  💡 {plano.mapa_medidas_caseiras.dica_paciente}
                </div>
              )}
            </div>
          )}

          {/* Bloco Modo Econômico — Custo & Economia */}
          {plano.custo_estimado?.modo_economico_ativo && (() => {
            const c = plano.custo_estimado!;
            const fmt = (v?: number) =>
              typeof v === "number"
                ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : "—";
            const pct = typeof c.economia_percentual === "number" ? c.economia_percentual.toFixed(1) : "—";
            return (
              <div style={{
                background: "#0f1a12", border: "1px solid #1D9E7555", borderLeft: "3px solid #1D9E75",
                borderRadius: 10, padding: "16px 20px", marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1D9E75", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                    💰 Modo Econômico — Custo Estimado
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 }}>Custo/dia (econômico)</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#1D9E75" }}>{fmt(c.custo_diario_economico)}</div>
                  </div>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 }}>Custo/dia (padrão)</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: T.text, textDecoration: "line-through", opacity: 0.7 }}>{fmt(c.custo_diario_padrao_equivalente)}</div>
                  </div>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 }}>Economia/dia</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#1D9E75" }}>{fmt(c.economia_diaria)} <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>({pct}%)</span></div>
                  </div>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 }}>Economia/mês</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#1D9E75" }}>{fmt(c.economia_mensal)}</div>
                  </div>
                </div>

                {c.refeicoes && c.refeicoes.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#1D9E75", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                      Custo por refeição
                    </div>
                    <div style={{ display: "grid", gap: 6 }}>
                      {c.refeicoes.map((r, i) => (
                        <div key={i} style={{
                          display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 10, alignItems: "center",
                          padding: "8px 10px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 6,
                          fontSize: 12,
                        }}>
                          <span style={{ color: T.text, fontWeight: 600 }}>{r.refeicao}</span>
                          <span style={{ color: T.muted, textDecoration: "line-through", minWidth: 60, textAlign: "right" as const }}>{fmt(r.custo_padrao)}</span>
                          <span style={{ color: "#1D9E75", fontWeight: 700, minWidth: 60, textAlign: "right" as const }}>{fmt(r.custo_economico)}</span>
                          <span style={{ color: "#1D9E75", fontSize: 11, fontWeight: 700, minWidth: 70, textAlign: "right" as const }}>−{fmt(r.economia)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {c.principais_substituicoes && c.principais_substituicoes.length > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(29,158,117,0.2)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#1D9E75", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                      Principais substituições aplicadas
                    </div>
                    <ul style={{ margin: 0, padding: "0 0 0 18px", color: T.text, fontSize: 12, lineHeight: 1.7 }}>
                      {c.principais_substituicoes.map((s, i) => (
                        <li key={i}>
                          <span style={{ color: T.muted }}>{s.de}</span> → <span style={{ color: T.text, fontWeight: 600 }}>{s.para}</span>
                          {" "}<span style={{ color: "#1D9E75", fontWeight: 700 }}>({s.economia_aprox})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {c.premissas && (
                  <div style={{ marginTop: 12, fontSize: 10, color: T.muted, fontStyle: "italic" as const }}>
                    📊 {c.premissas}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Botão: Comparar modos (Econômico vs Padrão) */}
          {(() => {
            const isAtualEconomico = !!plano.custo_estimado?.modo_economico_ativo || !!form.modoEconomico;
            const labelOposto = isAtualEconomico ? "Padrão" : "Econômico";
            const labelAtual = isAtualEconomico ? "Econômico" : "Padrão";
            return (
              <div style={{
                background: T.card, border: `1px dashed ${T.border2}`, borderRadius: 12,
                padding: "14px 18px", marginBottom: 20,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 12, flexWrap: "wrap" as const,
              }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                    🔀 Comparar modos no mesmo ciclo
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
                    Plano atual: <span style={{ color: "#B8922A", fontWeight: 700 }}>{labelAtual}</span>.
                    {planoComparativo
                      ? ` Comparativo (${labelOposto}) ${showCompare ? "exibido" : "oculto"} abaixo.`
                      : ` Gere a versão ${labelOposto} para comparar custo, macros e substituições.`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  <button
                    onClick={abrirHistoricoComparacoes}
                    style={{
                      padding: "10px 14px", borderRadius: 8,
                      background: "transparent", border: `1px solid ${T.border2}`,
                      color: T.muted, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      fontFamily: "inherit", whiteSpace: "nowrap" as const,
                    }}
                  >
                    🕘 Histórico
                  </button>
                  <button
                    onClick={compararModos}
                    disabled={comparing}
                    style={{
                      padding: "10px 16px", borderRadius: 8,
                      background: comparing ? T.bg3 : (planoComparativo ? "transparent" : "#B8922A"),
                      border: `1px solid ${planoComparativo ? T.green : "#B8922A"}`,
                      color: planoComparativo ? T.green : (comparing ? T.muted : "#0a0f0a"),
                      fontSize: 12, fontWeight: 700, cursor: comparing ? "wait" : "pointer",
                      fontFamily: "inherit", whiteSpace: "nowrap" as const,
                    }}
                  >
                    {comparing
                      ? "Calculando..."
                      : planoComparativo
                        ? (showCompare ? "Ocultar comparativo" : "Mostrar comparativo")
                        : `⇄ Gerar versão ${labelOposto}`}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Painel comparativo: A (atual) vs B (comparativo) */}
          {planoComparativo && showCompare && (() => {
            const A = plano;
            const B = planoComparativo;
            const aIsEcon = !!A.custo_estimado?.modo_economico_ativo || !!form.modoEconomico;
            const bIsEcon = !aIsEcon;
            const labelA = aIsEcon ? "Econômico" : "Padrão";
            const labelB = bIsEcon ? "Econômico" : "Padrão";
            const colorA = aIsEcon ? "#1D9E75" : "#B8922A";
            const colorB = bIsEcon ? "#1D9E75" : "#B8922A";

            const fmt$ = (v?: number) =>
              typeof v === "number" ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

            // Custo (cada plano carrega seu próprio custo_estimado quando econômico)
            const custoA = aIsEcon ? A.custo_estimado?.custo_diario_economico : A.custo_estimado?.custo_diario_padrao_equivalente;
            const custoB = bIsEcon ? B.custo_estimado?.custo_diario_economico : B.custo_estimado?.custo_diario_padrao_equivalente;
            const custoEcon = aIsEcon ? custoA : custoB;
            const custoPad = aIsEcon ? custoB : custoA;
            const economiaDia =
              typeof custoEcon === "number" && typeof custoPad === "number" ? custoPad - custoEcon : undefined;
            const economiaPct =
              typeof economiaDia === "number" && typeof custoPad === "number" && custoPad > 0
                ? (economiaDia / custoPad) * 100
                : undefined;
            const economiaMes = typeof economiaDia === "number" ? economiaDia * 30 : undefined;

            // Macros
            const rA = A.resumo, rB = B.resumo;
            const macroRows: { l: string; a: number; b: number; unit: string }[] = [
              { l: "Calorias", a: getResumoKcal(rA), b: getResumoKcal(rB), unit: "kcal" },
              { l: "Proteína", a: rA.proteina_total, b: rB.proteina_total, unit: "g" },
              { l: "Carboidrato", a: rA.carboidrato_total, b: rB.carboidrato_total, unit: "g" },
              { l: "Gordura", a: rA.gordura_total, b: rB.gordura_total, unit: "g" },
            ];

            // Substituições principais por refeição: pareia por nome de refeição
            const refsA = A.refeicoes || [];
            const refsB = B.refeicoes || [];
            type Diff = { refeicao: string; deA: string; paraB: string };
            const diffs: Diff[] = [];
            refsA.forEach((mA) => {
              const mB = refsB.find((x) => x.refeicao?.toLowerCase() === mA.refeicao?.toLowerCase());
              if (!mB) return;
              const lenA = mA.alimentos?.length || 0;
              const lenB = mB.alimentos?.length || 0;
              const len = Math.min(lenA, lenB);
              for (let i = 0; i < len; i++) {
                const aN = mA.alimentos?.[i]?.alimento?.trim() || "";
                const bN = mB.alimentos?.[i]?.alimento?.trim() || "";
                if (aN && bN && aN.toLowerCase() !== bN.toLowerCase()) {
                  diffs.push({ refeicao: mA.refeicao, deA: aN, paraB: bN });
                }
              }
            });
            const diffsTop = diffs.slice(0, 12);

            return (
              <div style={{
                background: "#0d1218", border: "1px solid #2a3d4a", borderLeft: "3px solid #60a5fa",
                borderRadius: 10, padding: "16px 20px", marginBottom: 20,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 14 }}>
                  🔀 Comparativo · {labelA} (atual) × {labelB}
                </div>

                {/* Custo */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                    Custo estimado
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: T.muted, marginBottom: 4 }}>{labelA} / dia</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: colorA }}>{fmt$(custoA)}</div>
                    </div>
                    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: T.muted, marginBottom: 4 }}>{labelB} / dia</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: colorB }}>{fmt$(custoB)}</div>
                    </div>
                    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: T.muted, marginBottom: 4 }}>Economia / dia</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#1D9E75" }}>
                        {fmt$(economiaDia)}{" "}
                        {typeof economiaPct === "number" && (
                          <span style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>({economiaPct.toFixed(1)}%)</span>
                        )}
                      </div>
                    </div>
                    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: T.muted, marginBottom: 4 }}>Projeção / mês</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#1D9E75" }}>{fmt$(economiaMes)}</div>
                    </div>
                  </div>
                  {(!custoA || !custoB) && (
                    <div style={{ marginTop: 8, fontSize: 10, color: T.muted, fontStyle: "italic" as const }}>
                      Estimativas de custo dependem do bloco "Custo Estimado" gerado pela IA — pode ser parcial se um dos modos não retornou valores.
                    </div>
                  )}
                </div>

                {/* Macros */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                    Macros & calorias
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {macroRows.map(({ l, a, b, unit }) => {
                      const delta = (b ?? 0) - (a ?? 0);
                      const sign = delta > 0 ? "+" : "";
                      const deltaColor = Math.abs(delta) < 1 ? T.muted : delta > 0 ? "#fbbf24" : "#60a5fa";
                      return (
                        <div key={l} style={{
                          display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 12, alignItems: "center",
                          padding: "8px 12px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 6,
                          fontSize: 12,
                        }}>
                          <span style={{ color: T.text, fontWeight: 600 }}>{l}</span>
                          <span style={{ color: colorA, fontWeight: 700, minWidth: 80, textAlign: "right" as const }}>
                            {a ?? "—"} <span style={{ color: T.muted, fontWeight: 500 }}>{unit}</span>
                          </span>
                          <span style={{ color: colorB, fontWeight: 700, minWidth: 80, textAlign: "right" as const }}>
                            {b ?? "—"} <span style={{ color: T.muted, fontWeight: 500 }}>{unit}</span>
                          </span>
                          <span style={{ color: deltaColor, fontSize: 11, fontWeight: 700, minWidth: 70, textAlign: "right" as const }}>
                            Δ {sign}{Math.round(delta)} {unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 6, display: "flex", gap: 14, fontSize: 10, color: T.muted }}>
                    <span><span style={{ color: colorA, fontWeight: 700 }}>■</span> {labelA}</span>
                    <span><span style={{ color: colorB, fontWeight: 700 }}>■</span> {labelB}</span>
                    <span>Δ = {labelB} − {labelA}</span>
                  </div>
                </div>

                {/* Substituições */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                    Substituições detectadas {diffs.length > diffsTop.length && (
                      <span style={{ color: T.muted2, textTransform: "none" as const, fontWeight: 500 }}>
                        (mostrando {diffsTop.length} de {diffs.length})
                      </span>
                    )}
                  </div>
                  {diffsTop.length === 0 ? (
                    <div style={{ fontSize: 12, color: T.muted, fontStyle: "italic" as const, padding: "8px 0" }}>
                      Nenhuma substituição relevante entre os planos para os mesmos slots de refeição.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 6 }}>
                      {diffsTop.map((d, i) => (
                        <div key={i} style={{
                          display: "grid", gridTemplateColumns: "auto 1fr auto 1fr", gap: 10, alignItems: "center",
                          padding: "8px 12px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 6,
                          fontSize: 12,
                        }}>
                          <span style={{ fontSize: 10, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", minWidth: 80 }}>
                            {d.refeicao}
                          </span>
                          <span style={{ color: colorA, fontWeight: 600 }}>{d.deA}</span>
                          <span style={{ color: T.muted, fontWeight: 700 }}>→</span>
                          <span style={{ color: colorB, fontWeight: 600 }}>{d.paraB}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Botão: Salvar comparação no histórico */}
          {planoComparativo && showCompare && (
            <div style={{
              background: T.card, border: `1px solid ${T.border2}`, borderRadius: 12,
              padding: "12px 16px", marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 12, flexWrap: "wrap" as const,
            }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 2 }}>
                  💾 Salvar esta comparação
                </div>
                <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
                  Guarda os dois planos com data e modo no histórico do coach para você revisar depois.
                </div>
              </div>
              <button
                onClick={salvarComparacao}
                disabled={savingComparison || !!savedComparisonId}
                style={{
                  padding: "10px 16px", borderRadius: 8,
                  background: savedComparisonId ? T.greenBg : (savingComparison ? T.bg3 : T.green),
                  border: `1px solid ${T.green}`,
                  color: savedComparisonId ? T.green : (savingComparison ? T.muted : "#0a0f0a"),
                  fontSize: 12, fontWeight: 700,
                  cursor: savingComparison || savedComparisonId ? "default" : "pointer",
                  fontFamily: "inherit", whiteSpace: "nowrap" as const,
                }}
              >
                {savingComparison ? "Salvando..." : savedComparisonId ? "✓ Salva no histórico" : "💾 Salvar comparação"}
              </button>
            </div>
          )}

          {/* Modal: Histórico de comparações */}
          {showCompareHistory && (
            <div
              onClick={() => setShowCompareHistory(false)}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 14,
                  width: "100%", maxWidth: 760, maxHeight: "80vh", overflow: "hidden",
                  display: "flex", flexDirection: "column",
                }}
              >
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>🕘 Histórico de comparações</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                      Econômico × Padrão — clique para abrir uma comparação salva.
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCompareHistory(false)}
                    style={{ padding: "6px 12px", background: T.bg3, border: `1px solid ${T.border2}`, borderRadius: 8, color: T.muted, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}
                  >
                    Fechar
                  </button>
                </div>
                <div style={{ padding: 14, overflowY: "auto" }}>
                  {loadingCompareHistory ? (
                    <div style={{ textAlign: "center", padding: 40, color: T.muted, fontSize: 13 }}>Carregando...</div>
                  ) : compareHistory.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: T.muted, fontSize: 13 }}>
                      Nenhuma comparação salva ainda.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {compareHistory.map((h) => {
                        const r = h.resumo || {};
                        const data = new Date(h.created_at);
                        const dataFmt = data.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
                        const modoColor = h.modo_principal === "economico" ? "#1D9E75" : "#B8922A";
                        const economiaPct = typeof r.economia_percentual === "number" ? `${r.economia_percentual.toFixed(0)}%` : "—";
                        const economiaMes = typeof r.economia_mensal === "number"
                          ? r.economia_mensal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                          : "—";
                        return (
                          <div key={h.id} style={{
                            background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
                            padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                                  {h.patient_name || "Paciente"}
                                </span>
                                <span style={{
                                  fontSize: 9, padding: "2px 8px", borderRadius: 999,
                                  background: `${modoColor}22`, color: modoColor, fontWeight: 700,
                                  textTransform: "uppercase" as const, letterSpacing: "0.06em",
                                }}>
                                  {h.modo_principal === "economico" ? "Econômico" : "Padrão"}
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: T.muted, display: "flex", gap: 12, flexWrap: "wrap" as const }}>
                                <span>📅 {dataFmt}</span>
                                {h.objetivo && <span>🎯 {h.objetivo}</span>}
                                <span style={{ color: T.green }}>💰 economia {economiaPct} · {economiaMes}/mês</span>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() => carregarComparacaoSalva(h.id)}
                                style={{
                                  padding: "6px 12px", borderRadius: 6,
                                  background: T.greenBg, border: `1px solid ${T.green}`,
                                  color: T.green, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                }}
                              >
                                Abrir
                              </button>
                              <button
                                onClick={() => removerComparacaoSalva(h.id)}
                                style={{
                                  padding: "6px 10px", borderRadius: 6,
                                  background: "transparent", border: `1px solid ${T.border2}`,
                                  color: T.red, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bloco GLUT-4 (se gerado) */}
          {glut4Text && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 1, background: T.green }} />
                ⚡ Pós-Treino Imediato — Janela GLUT-4
              </div>
              <div style={{ background: T.card, border: `1px solid ${T.green}55`, borderRadius: 10, padding: 16, boxShadow: `0 0 18px ${T.green}11` }}>
                <div style={{ fontSize: 11, color: T.green, fontWeight: 700, marginBottom: 10, letterSpacing: "0.04em" }}>
                  📌 Referência prescrita pelo coach: {({dextrose:"Dextrose pura",tamaras:"Tâmaras Medjool",pao_frances:"Pão francês",pao_branco:"Pão de forma branco",doce_de_leite:"Doce de leite light",mel:"Mel puro",geleia:"Geleia açucarada com pão",leite_condensado:"Leite condensado desnatado",banana:"Banana bem madura",coca:"Coca-Cola (competição)",maltodextrina:"Maltodextrina"} as Record<string,string>)[form.glut4CarbSource] || form.glut4CarbSource}
                </div>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit", fontSize: 12, color: T.text, margin: 0, lineHeight: 1.6 }}>{glut4Text}</pre>
              </div>
            </div>
          )}

          {/* Painel de Densidade Nutricional */}
          {plano.refeicoes && plano.refeicoes.length > 0 && (
            <NutrientDensityPanel
              refeicoes={plano.refeicoes as any}
              onRegenerate={regerarComMaisDensidade}
              regenerating={densityRegenLoading}
              onFruitProtocol={aplicarProtocoloFrutas}
              fruitLoading={fruitProtocolLoading}
            />
          )}

          {/* NutriPlan Elite — Modo Especial selector */}
          <div style={{ marginBottom: 14, padding: 14, borderRadius: 10, background: T.bg2, border: `1px solid ${T.border2}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
              ⚙️ Modo Especial
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {([
                { k: "normal", l: "Padrão" },
                { k: "competicao", l: "🏆 Competição (Peak Week)" },
                { k: "glp1", l: "💉 GLP-1" },
                { k: "feminino", l: "🌸 Feminino (Ciclo)" },
                { k: "vegano", l: "🌱 Vegano" },
                { k: "low_fodmap", l: "🌾 Low-FODMAP" },
                { k: "longevidade", l: "🧬 Longevidade" },
              ] as const).map(opt => {
                const active = modoEspecial === opt.k;
                return (
                  <button key={opt.k} type="button" onClick={() => setModoEspecial(opt.k as any)}
                    style={{ padding: "6px 12px", borderRadius: 16, fontSize: 11, fontFamily: "inherit", cursor: "pointer",
                      border: `1px solid ${active ? T.green : T.border2}`, background: active ? T.greenBg : T.bg3,
                      color: active ? T.green : T.muted, fontWeight: active ? 600 : 400 }}>
                    {opt.l}
                  </button>
                );
              })}
            </div>
            {modoEspecial === "competicao" && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: T.muted }}>Dias até a competição:</span>
                <input type="number" min={1} max={14} value={diasComp} onChange={e => setDiasComp(Number(e.target.value) || 7)}
                  style={{ width: 60, padding: "4px 8px", borderRadius: 6, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12 }} />
              </div>
            )}
            {modoEspecial === "feminino" && (
              <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["folicular", "ovulatoria", "lutea", "menstrual"] as const).map(f => (
                  <button key={f} type="button" onClick={() => setFaseCiclo(f)}
                    style={{ padding: "4px 10px", borderRadius: 12, fontSize: 10, fontFamily: "inherit", cursor: "pointer",
                      border: `1px solid ${faseCiclo === f ? T.green : T.border2}`, background: faseCiclo === f ? T.greenBg : T.bg3,
                      color: faseCiclo === f ? T.green : T.muted }}>
                    {f}
                  </button>
                ))}
              </div>
            )}
            {modoEspecial !== "normal" && (
              <div style={{ marginTop: 8, fontSize: 10, color: T.amber, fontStyle: "italic" }}>
                Aplica-se na próxima geração / regeração do plano.
              </div>
            )}
          </div>

          {/* NutriPlan Elite — Mini Timeline Circadiana (horários do plano) */}
          {plano.refeicoes && plano.refeicoes.length > 0 && (() => {
            const trainingTimes = (["seg","ter","qua","qui","sex","sab","dom"] as const)
              .map((d) => trainingSchedule.base[d])
              .filter((d) => d.is_training_day && d.time)
              .map((d) => d.time as string);
            const workout = trainingTimes[0];
            const parseH = (t?: string) => { if (!t) return null; const [h, m] = t.split(":").map(Number); return Number.isNaN(h) ? null : h + (m || 0) / 60; };
            const HMIN = 6, HMAX = 24, RANGE = HMAX - HMIN;
            const pct = (h: number) => Math.max(0, Math.min(100, ((h - HMIN) / RANGE) * 100));
            const wH = parseH(workout);
            return (
              <div style={{ marginBottom: 18, padding: 16, borderRadius: 10, background: T.bg2, border: `1px solid ${T.border2}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                  🕐 Timeline Circadiana
                </div>
                <div style={{ position: "relative", height: 56, background: `linear-gradient(90deg, rgba(255,180,80,0.10) 0%, rgba(255,220,120,0.18) 30%, rgba(120,200,255,0.10) 60%, rgba(80,80,180,0.18) 100%)`, borderRadius: 8, border: `1px solid ${T.border2}` }}>
                  {wH !== null && (
                    <div style={{ position: "absolute", left: `${pct(wH)}%`, top: -2, bottom: -2, width: 2, background: T.amber, boxShadow: `0 0 8px ${T.amber}` }} title={`Treino ${workout}`}>
                      <div style={{ position: "absolute", top: -16, left: -16, fontSize: 9, color: T.amber, fontWeight: 700, whiteSpace: "nowrap" }}>🏋️ {workout}</div>
                    </div>
                  )}
                  {plano.refeicoes!.map((m: any, i: number) => {
                    const h = parseH(m.horario);
                    if (h === null) return null;
                    return (
                      <div key={i} style={{ position: "absolute", left: `${pct(h)}%`, top: 8, transform: "translateX(-50%)" }}>
                        <div style={{ width: 10, height: 10, borderRadius: 999, background: T.green, border: `2px solid ${T.bg2}` }} title={`${m.refeicao} · ${m.horario}`} />
                        <div style={{ fontSize: 9, color: T.muted, marginTop: 4, whiteSpace: "nowrap", transform: "translateX(-30%)" }}>{m.horario}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 9, color: T.muted }}>
                  <span>06:00 · Cortisol ↑</span>
                  <span>12:00 · Insulina pico</span>
                  <span>20:00 · GH ↑</span>
                  <span>24:00</span>
                </div>
              </div>
            );
          })()}

          {/* ========== DIMENSÃO 2 — PERI-TREINO CIRCADIANO (toggle ativo) ========== */}
          {cronoCircadiano && (() => {
            const trainingDays = (["seg","ter","qua","qui","sex","sab","dom"] as const)
              .map((d) => trainingSchedule.base[d])
              .filter((d) => d.is_training_day && d.time);
            if (!trainingDays.length) {
              return (
                <div style={{ marginBottom: 18, padding: 14, borderRadius: 10, background: "#0a1420", border: "1px dashed #60a5fa" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    🕐 Crononutrição Circadiana · Peri-Treino
                  </div>
                  <div style={{ fontSize: 11.5, color: T.muted, lineHeight: 1.5 }}>
                    Nenhum horário de treino encontrado no <strong style={{ color: T.text }}>TrainingON</strong>. Defina ao menos um dia com horário na <em>Grade Semanal</em> para que o peri-treino seja calculado dinamicamente.
                  </div>
                </div>
              );
            }
            const first = trainingDays[0];
            const wkTime = first.time as string;
            const dur = Number((first as any).duration_min) || 60;
            const [wh, wm] = wkTime.split(":").map(Number);
            const totalMin = wh * 60 + (wm || 0);
            const fmt = (mins: number) => {
              const v = ((mins % 1440) + 1440) % 1440;
              const h = Math.floor(v / 60);
              const m = v % 60;
              return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            };
            const preTime = fmt(totalMin - 90);
            const intraStart = fmt(totalMin);
            const intraEnd = fmt(totalMin + dur);
            const postTime = fmt(totalMin + dur + 30);

            // Janela circadiana do treino
            const wkBand =
              wh >= 5 && wh < 10 ? { l: "Pico Cortisol (06–09h)", c: "#f87171", note: "Carbo pré reduzido — cortisol já mobiliza glicogênio. Priorize ptn+gordura." } :
              wh >= 10 && wh < 14 ? { l: "Sensibilidade Ascendente (10–13h)", c: "#fbbf24", note: "Janela ÓTIMA — carbo complexo no pré + carbo rápido no pós." } :
              wh >= 14 && wh < 18 ? { l: "Pico Insulínico Periférico (14–17h)", c: "#4ade80", note: "Maior absorção de nutrientes. Refeição pré-treino ESTRUTURADA aqui." } :
              wh >= 18 && wh < 22 ? { l: "Pré-Sono (19–21h)", c: "#60a5fa", note: "Pós-treino: priorize ptn+carbo MODERADO. Evita interferir no GH peak." } :
              { l: "Madrugada / GH Peak", c: "#c084fc", note: "Atípico — minimizar carbo pós para preservar pulso de GH." };

            const periRows = [
              { tag: "PRÉ", time: preTime, off: "−90 min", color: T.amber, desc: "Carbo complexo 0,8–1,2 g/kg + ptn 30g + gordura mínima" },
              { tag: "INTRA", time: `${intraStart}–${intraEnd}`, off: `${dur} min`, color: "#a78bfa", desc: "Eletrólitos · BCAA/EAA opcional · 30–60g carbo se >75 min" },
              { tag: "PÓS", time: postTime, off: `+${30} min`, color: T.green, desc: "Carbo rápido 1,0–1,5 g/kg + whey 30–40g · janela GLUT-4 aberta" },
            ];

            // Como as refeições ao redor mudam
            const surroundingChanges = [
              wh < 12
                ? { icon: "🌅", t: "Café (06–09h)", d: "Movido para pré-treino: ptn+gordura → carbo deslocado para o pré." }
                : { icon: "🌅", t: "Café (06–09h)", d: "Mantém perfil cortisol: ptn+gordura, carbo MÍNIMO (≤15g)." },
              wh >= 12 && wh < 16
                ? { icon: "☀️", t: "Almoço (12–14h)", d: "Funciona como PRÉ-TREINO estruturado — carbo complexo principal." }
                : { icon: "☀️", t: "Almoço (12–14h)", d: "Refeição principal mantida na janela de pico insulínico." },
              wh >= 16
                ? { icon: "🍎", t: "Lanche tarde", d: "Reposicionado como pré-treino (−90min do horário)." }
                : { icon: "🍎", t: "Lanche tarde", d: "Funciona como pós-treino tardio se treino foi até 17h." },
              { icon: "🌙", t: "Jantar (19–21h)", d: wh >= 18 ? "Sobreposto ao pós-treino: caseína + carbo moderado." : "Ptn lenta + gordura · carbo reduzido (potencia GH noturno)." },
              { icon: "🌌", t: "Ceia (23h)", d: "Caseína micelar 30g 90min antes de dormir SE houver secretagogos de GH ativos." },
            ];

            return (
              <div style={{ marginBottom: 18, padding: 16, borderRadius: 12, background: "linear-gradient(180deg, #0a1420 0%, #0d1a2a 100%)", border: "1px solid #3b82f6", boxShadow: "0 0 24px rgba(59,130,246,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 16 }}>🕐</span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Crononutrição · Peri-Treino Sincronizado
                  </div>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#1e3a8a", color: "#bfdbfe", fontWeight: 700 }}>DIMENSÃO 2 ATIVA</span>
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 12, lineHeight: 1.5 }}>
                  Calculado a partir do horário do <strong style={{ color: "#60a5fa" }}>TrainingON</strong>:&nbsp;
                  <strong style={{ color: T.text }}>🏋️ {wkTime}</strong> · {dur} min · janela <span style={{ color: wkBand.c, fontWeight: 700 }}>{wkBand.l}</span>
                </div>

                <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(96,165,250,0.06)", borderLeft: `3px solid ${wkBand.c}`, fontSize: 11, color: T.text, marginBottom: 14, lineHeight: 1.5 }}>
                  <strong style={{ color: wkBand.c }}>Razão fisiológica:</strong> {wkBand.note}
                </div>

                {/* Linha do tempo PRÉ / INTRA / PÓS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginBottom: 14 }}>
                  {periRows.map((r) => (
                    <div key={r.tag} style={{ padding: 12, borderRadius: 10, background: T.bg2, border: `1px solid ${r.color}55`, borderLeft: `3px solid ${r.color}` }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: r.color, letterSpacing: "0.08em" }}>{r.tag}</span>
                        <span style={{ fontSize: 9, color: T.muted }}>{r.off}</span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>{r.time}</div>
                      <div style={{ fontSize: 10.5, color: T.muted, lineHeight: 1.45 }}>{r.desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Como as refeições ao redor mudam
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 6 }}>
                  {surroundingChanges.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(96,165,250,0.15)" }}>
                      <span style={{ fontSize: 14, lineHeight: 1 }}>{c.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{c.t}</div>
                        <div style={{ fontSize: 10.5, color: T.muted, lineHeight: 1.45, marginTop: 2 }}>{c.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* NutriPlan Elite — GLUT-4 Sync Card (peri-workout dourado) */}
          {(() => {
            const trainingDays = (["seg","ter","qua","qui","sex","sab","dom"] as const)
              .map((d) => trainingSchedule.base[d])
              .filter((d) => d.is_training_day && d.time);
            if (!trainingDays.length) return null;
            const first = trainingDays[0];
            return (
              <div style={{ marginBottom: 18 }}>
                <Glut4SyncCard
                  workoutTime={first.time}
                  workoutType={(first as any).modality || "Musculação"}
                  durationMin={Number((first as any).duration_min) || 60}
                  compostosAtivos={form.compostosAtivos || []}
                />
              </div>
            );
          })()}

          {/* Refeições */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 1, background: T.green }} />
              Refeições do dia
            </div>

            {/* Legenda Treino/Descanso · Pré/Pós */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", padding: "8px 12px", marginBottom: 12, background: T.bg2, border: `1px dashed ${T.border2}`, borderRadius: 10, fontSize: 11, color: T.muted }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ color: T.amber }}>⚡</span> Pré-treino</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ color: T.green }}>💪</span> Pós-treino</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: T.blue, display: "inline-block" }} /> Treino</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: T.muted2 || T.muted, display: "inline-block", opacity: 0.6 }} /> Descanso</span>
            </div>

            {(() => {
              // Horário de treino "âncora": primeiro horário distinto entre os dias de treino do schedule.
              const trainingTimes = (["seg","ter","qua","qui","sex","sab","dom"] as const)
                .map((d) => trainingSchedule.base[d])
                .filter((d) => d.is_training_day && d.time)
                .map((d) => d.time as string);
              const anchor = trainingTimes[0];
              const anchorMin = anchor ? parseHHmm(anchor) : null;

              const classify = (horario?: string): "pre" | "post" | null => {
                if (anchorMin === null) return null;
                const m = parseHHmm(horario);
                if (m === null) return null;
                const diff = m - anchorMin; // min
                if (diff < 0 && diff >= -180) return "pre";
                if (diff > 0 && diff <= 180) return "post";
                return null;
              };

              return plano.refeicoes?.map((m, i) => (
                <MealCard
                  key={i}
                  meal={m}
                  index={i}
                  workoutTag={classify(m.horario)}
                  onSwap={(alimentoIdx, sub) => {
                    setPlano((prev) => {
                      if (!prev) return prev;
                      const next = JSON.parse(JSON.stringify(prev)) as PlanoData;
                      const meal = next.refeicoes[i];
                      const original = meal.alimentos?.[alimentoIdx];
                      if (!meal.alimentos || !original) return prev;
                      const otherSubs = (original.substituicoes || []).filter(
                        (s) => s.alimento !== sub.alimento
                      );
                      const subQtd = getSubstitutionQuantityDisplay(sub);
                      meal.alimentos[alimentoIdx] = {
                        alimento: sub.alimento,
                        quantidade: subQtd,
                        quantidade_g: sub.quantidade_g,
                        observacao: sub.observacao,
                        substituicoes: [
                          { alimento: original.alimento, quantidade: original.quantidade || original.quantidade_g, quantidade_g: original.quantidade_g, observacao: original.observacao, grupo: (sub as any).grupo },
                          ...otherSubs,
                        ],
                      };
                      return next;
                    });
                    setSavedId(null);
                    toast({ title: "Alimento trocado ✅", description: `${sub.alimento} aplicado ao plano.` });
                  }}
                />
              ));
            })()}
          </div>

          {/* Suplementação */}
          {plano.suplementacao && plano.suplementacao.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 1, background: T.green }} />
                Suplementação recomendada
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {plano.suplementacao.map((s, i) => (
                  <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6 }}>{s.suplemento}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>Dose: {s.dose}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>Timing: {s.timing}</div>
                    <div style={{ fontSize: 11, color: T.greenDim, marginTop: 6, fontStyle: "italic" }}>{s.justificativa}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Método MCE */}
          {plano.dica_mce && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>Método MCE — Adesão comportamental</div>
              <div style={{ display: "grid", gap: 10 }}>
                {([["M", "Mindset", plano.dica_mce.mindset, T.blue], ["C", "Comportamento", plano.dica_mce.comportamento, T.green], ["E", "Execução", plano.dica_mce.execucao, T.amber]] as [string, string, string, string][]).map(([letra, nome, texto, cor]) => (
                  <div key={letra} style={{ display: "flex", gap: 14, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${cor}15`, border: `1px solid ${cor}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: cor, flexShrink: 0 }}>{letra}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: cor, marginBottom: 4 }}>{nome}</div>
                      <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{texto}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => navigate("/coach-dashboard")} style={{ width: "100%", padding: 14, borderRadius: 10, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 16 }}>
            ← Voltar ao Dashboard
          </button>
        </div>

        {/* NutriPlan Elite — Adherence Modal (paciente vinculado) */}
        {showAdherence && (
          <AdherenceModal
            items={adherenceItems}
            profile={{
              vet_kcal: Number(form.calorias) || null,
              protein_g: (plano as any)?.resumo?.proteina_total ?? null,
              carbs_g: (plano as any)?.resumo?.carboidrato_total ?? null,
              fat_g: (plano as any)?.resumo?.gordura_total ?? null,
            }}
            onClose={() => setShowAdherence(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`*{box-sizing:border-box}`}</style>

      {/* Top bar */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 16, background: T.bg2 }}>
        <button onClick={() => navigate("/coach-dashboard")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>nutriON · Dashboard do Coach</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Gerador de Plano Alimentar por IA</div>
        </div>
        <button
          onClick={() => navigate("/coach/adjustment-log")}
          style={{ padding: "8px 14px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
          title="Log do ajuste calórico (alvo, antes, depois, fator)"
        >
          📊 Log de ajuste
        </button>
        <button
          onClick={() => setShowSubstitutions(true)}
          style={{ padding: "8px 14px", borderRadius: 8, background: "#0d1f0d", border: `1px solid ${T.green}`, color: T.green, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}
          title="Banco v2.0 + Agente IA · variedade real por refeição"
        >
          🔄 Substituições NUTRION
        </button>
        <button
          onClick={() => setShowGantt(true)}
          style={{ padding: "8px 14px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
          title="Periodização do paciente — Gantt de fases"
        >
          📈 Periodização
        </button>
        <button
          onClick={() => setShowCheckins(true)}
          style={{ padding: "8px 14px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
          title="Check-ins semanais do paciente — peso, fotos e ajustes"
        >
          📋 Check-ins
        </button>
        <button
          onClick={() => setShowWeekGrid(true)}
          style={{ padding: "8px 14px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
          title="Grade semanal — 6 refeições × 7 dias com substituições"
        >
          🗓️ Grade Semanal
        </button>
        <button
          onClick={() => {
            const el = document.getElementById("modo-especial-form");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          style={{ padding: "8px 14px", borderRadius: 8, background: modoEspecial !== "normal" ? "#0d1f0d" : T.bg3, border: `1px solid ${modoEspecial !== "normal" ? T.green : T.border2}`, color: modoEspecial !== "normal" ? T.green : T.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: modoEspecial !== "normal" ? 700 : 600 }}
          title="Selecionar modo especial (Competição, GLP-1, Feminino, Vegano, Low-FODMAP, Longevidade)"
        >
          ⚙️ Modo Especial{modoEspecial !== "normal" ? ` · ${modoEspecial === "competicao" ? "🏆" : modoEspecial === "glp1" ? "💉" : modoEspecial === "feminino" ? "🌸" : modoEspecial === "vegano" ? "🌱" : modoEspecial === "low_fodmap" ? "🌾" : "🧬"}` : ""}
        </button>
        <button
          onClick={() => navigate("/coach/templates")}
          style={{ padding: "8px 14px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
          title="Modelos de plano reutilizáveis"
        >
          📚 Biblioteca
        </button>
        <button
          onClick={() => { setShowHistory(true); loadHistory(); }}
          style={{ padding: "8px 16px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
        >
          🗂️ Histórico
        </button>
      </div>

      {/* Overlay: Periodização (Gantt) */}
      {showGantt && (
        <div onClick={() => setShowGantt(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 70, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflow: "auto" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 14, padding: 20, maxWidth: 1200, width: "100%", marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Periodização</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>📈 Gantt de fases do paciente</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={ganttPatientId}
                  onChange={(e) => setGanttPatientId(e.target.value)}
                  style={{ background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12, padding: "8px 12px", borderRadius: 8, fontFamily: "inherit", minWidth: 220 }}
                >
                  <option value="">Selecione um paciente...</option>
                  {patients.map((p) => (
                    <option key={p.user_id} value={p.user_id}>{p.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowGantt(false)}
                  style={{ padding: "8px 14px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Fechar
                </button>
              </div>
            </div>
            {ganttPatientId ? (
              <ProtocolGanttChart patientId={ganttPatientId} />
            ) : (
              <div style={{ padding: 40, textAlign: "center", color: T.muted, fontSize: 13, border: `1px dashed ${T.border2}`, borderRadius: 10 }}>
                Selecione um paciente acima para visualizar a periodização.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay: Check-ins semanais */}
      {showCheckins && (
        <div onClick={() => setShowCheckins(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 70, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflow: "auto" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 14, padding: 20, maxWidth: 1200, width: "100%", marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Check-ins semanais</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>📋 Acompanhamento semanal do paciente</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={checkinsPatientId}
                  onChange={(e) => setCheckinsPatientId(e.target.value)}
                  style={{ background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12, padding: "8px 12px", borderRadius: 8, fontFamily: "inherit", minWidth: 220 }}
                >
                  <option value="">Selecione um paciente...</option>
                  {patients.map((p) => (
                    <option key={p.user_id} value={p.user_id}>{p.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowCheckins(false)}
                  style={{ padding: "8px 14px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Fechar
                </button>
              </div>
            </div>
            {checkinsPatientId ? (
              <CoachCheckinsTab patientId={checkinsPatientId} />
            ) : (
              <div style={{ padding: 40, textAlign: "center", color: T.muted, fontSize: 13, border: `1px dashed ${T.border2}`, borderRadius: 10 }}>
                Selecione um paciente acima para visualizar os check-ins semanais.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay: Grade Semanal de refeições */}
      {showWeekGrid && (
        <div onClick={() => setShowWeekGrid(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 70, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflow: "auto" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 14, padding: 20, maxWidth: 1400, width: "100%", marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Grade Semanal</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>🗓️ 6 refeições × 7 dias</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={weekGridPatientId}
                  onChange={(e) => setWeekGridPatientId(e.target.value)}
                  style={{ background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12, padding: "8px 12px", borderRadius: 8, fontFamily: "inherit", minWidth: 220 }}
                >
                  <option value="">Selecione um paciente...</option>
                  {patients.map((p) => (
                    <option key={p.user_id} value={p.user_id}>{p.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowWeekGrid(false)}
                  style={{ padding: "8px 14px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Fechar
                </button>
              </div>
            </div>
            {weekGridPatientId ? (
              <CoachWeekMealGrid
                patientId={weekGridPatientId}
                patient={patients.find((p) => p.user_id === weekGridPatientId) || { user_id: weekGridPatientId }}
              />
            ) : (
              <div style={{ padding: 40, textAlign: "center", color: T.muted, fontSize: 13, border: `1px dashed ${T.border2}`, borderRadius: 10 }}>
                Selecione um paciente acima para abrir a grade semanal.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay: Módulo Substituições NUTRION */}
      {showSubstitutions && (
        <div style={{ position: "fixed", inset: 0, background: T.bg, zIndex: 60, overflow: "auto" }}>
          <div style={{ position: "sticky", top: 0, zIndex: 61, padding: "12px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12, background: T.bg2 }}>
            <button
              onClick={() => setShowSubstitutions(false)}
              style={{ padding: "8px 14px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
            >
              ← Voltar ao Plano Alimentar
            </button>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.green }}>🔄 Substituições NUTRION</div>
          </div>
          <SubstitutionsAgentPage />
        </div>
      )}

      {/* Modal de histórico no formulário */}
      {showHistory && (
        <div onClick={() => setShowHistory(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 14, padding: 20, maxWidth: 720, width: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>🗂️ Histórico de planos</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Todos os planos alimentares criados — abra para ver, reenviar ou usar como base.</div>
              </div>
              <button onClick={() => setShowHistory(false)} style={{ background: "transparent", border: "none", color: T.muted, fontSize: 22, cursor: "pointer" }}>×</button>
            </div>
            <input
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Buscar por nome ou objetivo..."
              style={{ width: "100%", background: T.bg3, border: `1px solid ${T.border2}`, borderRadius: 8, padding: "9px 12px", color: T.text, fontSize: 13, outline: "none", marginBottom: 14, fontFamily: "inherit" }}
            />
            <div style={{ overflowY: "auto", flex: 1, paddingRight: 4 }}>
              {loadingHistory ? (
                <div style={{ textAlign: "center", padding: 30, color: T.muted, fontSize: 13 }}>Carregando...</div>
              ) : history.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: T.muted, fontSize: 13 }}>Nenhum plano salvo ainda.</div>
              ) : (
                history
                  .filter((h) => {
                    const q = historySearch.trim().toLowerCase();
                    if (!q) return true;
                    return (h.patient_name || "").toLowerCase().includes(q) || (h.objetivo || "").toLowerCase().includes(q);
                  })
                  .map((h) => {
                    const isSent = h.status === "sent";
                    const dt = new Date(h.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
                    const kcal = getResumoKcal(h.plano?.resumo);
                    return (
                      <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 14px", border: `1px solid ${T.border}`, borderRadius: 10, background: T.card, marginBottom: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{h.patient_name}</span>
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: isSent ? T.greenBg : T.bg3, border: `1px solid ${isSent ? T.green : T.border2}`, color: isSent ? T.green : T.muted, fontWeight: 700, textTransform: "uppercase" }}>
                              {isSent ? "Enviado" : "Rascunho"}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                            {h.objetivo || "—"} {kcal ? `· ${kcal} kcal` : ""} · {dt}
                          </div>
                          {h.observacao && <div style={{ fontSize: 11, color: T.muted2, marginTop: 4, fontStyle: "italic" }}>"{h.observacao}"</div>}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => { setPlano(h.plano); setSavedId(h.id); setShowHistory(false); setStep("result"); }}
                            style={{ padding: "7px 12px", borderRadius: 7, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
                          >
                            👁️ Abrir
                          </button>
                          <button
                            onClick={() => { setPlano(h.plano); setSavedId(h.id); setShowHistory(false); setStep("result"); setTimeout(() => setShowSendModal(true), 100); }}
                            style={{ padding: "7px 12px", borderRadius: 7, background: T.green, border: `1px solid ${T.green}`, color: "#0a0f0a", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}
                          >
                            📨 Enviar
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        {/* Dados do paciente */}
        <Section title="Dados do paciente">
          <div style={{ marginBottom: 14 }}>
            <Label required>Nome do paciente</Label>
            <InputField placeholder="Nome do paciente" value={form.nome} onChange={e => set("nome", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
            <div>
              <Label required>Idade</Label>
              <InputField type="number" placeholder="30" value={form.idade} onChange={e => set("idade", e.target.value)} />
            </div>
            <div>
              <Label>Sexo</Label>
              <SelectField value={form.sexo} onChange={e => set("sexo", e.target.value)}>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </SelectField>
            </div>
            <div>
              <Label required>Peso (kg)</Label>
              <InputField type="number" placeholder="75" value={form.peso} onChange={e => set("peso", e.target.value)} />
            </div>
            <div>
              <Label required>Altura (cm)</Label>
              <InputField type="number" placeholder="175" value={form.altura} onChange={e => set("altura", e.target.value)} />
            </div>
          </div>
        </Section>

        {/* Objetivo e perfil */}
        <Section title="Objetivo e perfil">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Label>Objetivo principal</Label>
              <SelectField value={form.objetivo} onChange={e => set("objetivo", e.target.value)}>
                <option value="emagrecimento">Emagrecimento</option>
                <option value="ganho_massa">Ganho de massa muscular</option>
                <option value="recomposicao">Recomposição corporal</option>
                <option value="manutencao">Manutenção</option>
                <option value="performance">Performance esportiva</option>
                <option value="saude">Saúde e longevidade</option>
                <option value="gestacao">Gestação / pós-parto</option>
              </SelectField>
            </div>
            <div>
              <Label>Perfil PCA</Label>
              <SelectField value={form.perfilPCA} onChange={e => set("perfilPCA", e.target.value)}>
                <option value="executor">Executor (direto, foco em resultados)</option>
                <option value="analista">Analista (detalhista, quer dados)</option>
                <option value="conector">Conector (relacional, precisa de suporte)</option>
                <option value="visionario">Visionário (criativo, precisa de propósito)</option>
              </SelectField>
            </div>
            <div>
              <Label>Nível de atividade</Label>
              <SelectField value={form.nivelAtividade} onChange={e => set("nivelAtividade", e.target.value)}>
                <option value="sedentario">Sedentário (sem exercício)</option>
                <option value="leve">Leve (1–2x/semana)</option>
                <option value="moderado">Moderado (3–4x/semana)</option>
                <option value="ativo">Ativo (5–6x/semana)</option>
                <option value="muito_ativo">Muito ativo (2x/dia ou atleta)</option>
              </SelectField>
            </div>
            <div>
              <Label>NEAT (atividade não-exercício)</Label>
              <SelectField value={form.neat} onChange={e => set("neat", e.target.value)}>
                <option value="baixo">Sedentário no trabalho (home office / escritório)</option>
                <option value="medio">Moderado (anda bastante, trabalho ativo)</option>
                <option value="alto">Muito ativo (trabalho físico, militar, campo)</option>
              </SelectField>
            </div>
            <div>
              <Label>Qualidade do sono</Label>
              <SelectField value={form.qualidadeSono} onChange={e => set("qualidadeSono", e.target.value)}>
                <option value="boa">Boa (7–9h regulares)</option>
                <option value="regular">Regular (5–7h)</option>
                <option value="ruim">Ruim (&lt; 5h ou muito fragmentado)</option>
              </SelectField>
            </div>
            {(/cut|emagrec|defici|seca/i.test(String(form.objetivo)) || /cut/i.test(String(form.fasePeriodizacao))) && (
              <div>
                <Label>Semanas em déficit (refeeding automático ≥4)</Label>
                <InputField
                  type="number"
                  min={0}
                  max={52}
                  value={form.semanasEmDeficit}
                  placeholder="0 se está começando agora"
                  onChange={e => set("semanasEmDeficit", e.target.value)}
                />
              </div>
            )}
            <div>
              <Label>Modalidade de treino</Label>
              <SelectField value={form.treino} onChange={e => set("treino", e.target.value)}>
                <option value="musculacao">Musculação / Hipertrofia</option>
                <option value="funcional">Funcional / CrossFit</option>
                <option value="corrida">Corrida / Endurance</option>
                <option value="natacao">Natação</option>
                <option value="futebol">Futebol</option>
                <option value="ciclismo">Ciclismo</option>
                <option value="luta">Artes marciais / Luta</option>
                <option value="misto">Misto (força + cardio)</option>
                <option value="nenhum">Sem treino</option>
              </SelectField>
            </div>
          </div>
        </Section>

        {/* ─── CONTEXTO CLÍNICO · PROTOCOLO DO COACH (NOVO) ─── */}
        <Section title="Contexto clínico · Protocolo do coach" icon={<Brain size={12} strokeWidth={2} color={T.cyan} />} accent="cyan">
          <div style={{ fontFamily: T.fontMono, fontSize: 9, color: "#2A2A2A", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: -10, marginBottom: 14 }}>
            Descreva estratégias, observações e protocolos próprios — a IA incorporará no plano gerado.
          </div>

          <div style={{
            position: "relative",
            border: "1px solid #00D4FF12",
            borderTop: "2px solid #00D4FF22",
            background: "#00D4FF03",
            padding: 16,
          }}>
            {/* Tag IA CONTEXTO ATIVO */}
            <div style={{
              position: "absolute", top: 8, right: 10,
              display: "inline-flex", alignItems: "center", gap: 6,
              border: "1px solid #00D4FF22", color: "#00D4FF66",
              padding: "2px 8px", borderRadius: 2,
              fontFamily: T.fontMono, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.cyan, boxShadow: "0 0 6px #00D4FF", animation: "pulse 1.4s ease-in-out infinite" }} />
              IA Contexto Ativo
            </div>

            <div style={{ position: "relative", marginTop: 16 }}>
              <textarea
                value={contextoClinico}
                onChange={(e) => setContextoClinico(e.target.value.slice(0, 1500))}
                placeholder="Ex: Paciente tem resistência à insulina — priorizar janela pré-treino com carbo de baixo IG. Usar protocolo de carb cycling 5/2. Histórico de retenção hídrica com sódio elevado. Suplementação base: creatina 5g + leucina 3g pós-treino. Evitar glúten por sensibilidade relatada..."
                style={{
                  width: "100%", minHeight: 140, resize: "vertical" as const,
                  background: T.bg, border: "1px solid #00D4FF18", borderRadius: 0,
                  padding: "12px 14px", color: T.text, fontFamily: T.fontMono,
                  fontSize: 11, lineHeight: 1.8, outline: "none",
                  transition: "border-color .2s, box-shadow .2s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#00D4FF44"; e.currentTarget.style.boxShadow = "0 0 0 1px #00D4FF12"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#00D4FF18"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <div style={{
                position: "absolute", bottom: 6, right: 10,
                fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.12em",
                color: contextoClinico.length > 1400 ? T.red : contextoClinico.length > 1200 ? T.gold : "#2A2A2A",
                pointerEvents: "none",
              }}>
                {contextoClinico.length} / 1500 caracteres
              </div>
            </div>

            {/* Chips de sugestão rápida */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: T.fontMono, fontSize: 8, color: "#2A2A2A", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
                Inserir contexto rápido:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {CONTEXT_CHIPS.map((chip) => {
                  const isActive = activeChips.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleContextChip(chip)}
                      style={{
                        border: `1px solid ${isActive ? T.gold : "#B8922A22"}`,
                        background: isActive ? "#B8922A0A" : "transparent",
                        color: isActive ? T.gold : "#B8922A66",
                        fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.14em",
                        textTransform: "uppercase", padding: "4px 10px", borderRadius: 0,
                        cursor: "pointer", transition: "all .2s",
                      }}
                      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.borderColor = "#B8922A55"; e.currentTarget.style.color = T.gold; e.currentTarget.style.background = "#B8922A08"; } }}
                      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.borderColor = "#B8922A22"; e.currentTarget.style.color = "#B8922A66"; e.currentTarget.style.background = "transparent"; } }}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Histórico de contextos */}
            {contextoHistory.length > 0 && (
              <div style={{ marginTop: 18, borderTop: "1px solid #B8922A0A", paddingTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setContextoHistoryOpen(v => !v)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "transparent", border: "none", padding: 0, cursor: "pointer",
                    fontFamily: T.fontMono, fontSize: 9, color: "#6b6258", letterSpacing: "0.2em", textTransform: "uppercase",
                  }}
                >
                  <ChevronDown size={11} style={{ transform: contextoHistoryOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform .2s" }} />
                  Contextos anteriores ({contextoHistory.length})
                </button>
                {contextoHistoryOpen && (
                  <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                    {contextoHistory.slice(0, 3).map((h, i) => (
                      <div key={i} style={{
                        border: "1px solid #B8922A0A", padding: "8px 12px",
                        display: "flex", alignItems: "center", gap: 10, background: "#020205",
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: T.fontMono, fontSize: 10, color: "#3A3A3A", lineHeight: 1.5,
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                            overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {h.texto}
                          </div>
                          <div style={{ fontFamily: T.fontMono, fontSize: 8, color: "#2A2A2A", marginTop: 4, letterSpacing: "0.12em" }}>
                            {h.paciente ? `${h.paciente.toUpperCase()} · ` : ""}{new Date(h.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setContextoClinico(h.texto.slice(0, 1500))}
                          title="Reutilizar este contexto"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            background: "transparent", border: "1px solid #B8922A22",
                            color: T.gold, padding: "4px 8px", borderRadius: 0, cursor: "pointer",
                            fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
                            transition: "all .2s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.background = "#B8922A08"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#B8922A22"; e.currentTarget.style.background = "transparent"; }}
                        >
                          <RotateCcw size={10} /> Usar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* Fase de periodização */}
        <Section title="Fase de periodização">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label required>Fase atual</Label>
              <SelectField value={form.fasePeriodizacao} onChange={e => set("fasePeriodizacao", e.target.value)}>
                <option value="bulk_limpo">Bulk Limpo</option>
                <option value="bulk_agressivo">Bulk Agressivo</option>
                <option value="cutting">Cutting</option>
                <option value="recomposicao">Recomposição</option>
                <option value="peak_week">Peak Week (competição)</option>
                <option value="manutencao_offseason">Manutenção Off-Season</option>
              </SelectField>
            </div>
            <div>
              <Label>Anos de treino</Label>
              <SelectField value={form.anosTreino} onChange={e => set("anosTreino", e.target.value)}>
                <option value="">Selecione...</option>
                <option value="0">Iniciante (menos de 1 ano)</option>
                <option value="1">1 a 2 anos</option>
                <option value="3">3 a 5 anos</option>
                <option value="5">5 a 10 anos</option>
                <option value="10">Mais de 10 anos</option>
              </SelectField>
            </div>
            <div>
              <Label>% Gordura corporal meta</Label>
              <InputField type="number" placeholder="Ex: 8" value={form.bfMeta} onChange={e => set("bfMeta", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>Como deseja informar o % gordura?</Label>
              <SelectField value={form.metodoBF} onChange={e => set("metodoBF", e.target.value)}>
                <option value="tenho_bf">Sei meu % gordura (informar abaixo)</option>
                <option value="navy">Calcular pelo Método Navy (fita métrica)</option>
                <option value="visual">Estimativa visual (sem medições)</option>
                <option value="nao_sei">Não sei — usar estimativa automática</option>
              </SelectField>
            </div>
            {form.metodoBF === "tenho_bf" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <Label>% Gordura corporal atual</Label>
                <InputField type="number" placeholder="Ex: 14" value={form.bfAtual} onChange={e => set("bfAtual", e.target.value)} />
              </div>
            )}
            {form.metodoBF === "navy" && (
              <>
                <div>
                  <Label>Circunferência do pescoço (cm)</Label>
                  <InputField type="number" placeholder="Ex: 42" value={form.circPescoco} onChange={e => set("circPescoco", e.target.value)} />
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>Medir abaixo do pomo de adão, relaxado.</div>
                </div>
                <div>
                  <Label>Circunferência do abdômen (cm)</Label>
                  <InputField type="number" placeholder="Ex: 92" value={form.circAbdomen} onChange={e => set("circAbdomen", e.target.value)} />
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>Medir na altura do umbigo, relaxado, sem sugar.</div>
                </div>
                {String(form.sexo || "").toLowerCase().startsWith("f") && (
                  <div>
                    <Label>Circunferência do quadril (cm)</Label>
                    <InputField type="number" placeholder="Ex: 100" value={form.circQuadril} onChange={e => set("circQuadril", e.target.value)} />
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>Medir na parte mais larga do quadril.</div>
                  </div>
                )}
                {(() => {
                  const altura = Number(form.altura) || 0;
                  const peso = Number(form.peso) || 0;
                  const pescoco = Number(form.circPescoco) || 0;
                  const abdomen = Number(form.circAbdomen) || 0;
                  const quadril = Number(form.circQuadril) || 0;
                  const isHomem = !String(form.sexo || "").toLowerCase().startsWith("f");
                  if (!altura || !pescoco || !abdomen || (!isHomem && !quadril)) return null;
                  let bf = isHomem
                    ? 495 / (1.0324 - 0.19077 * Math.log10(abdomen - pescoco) + 0.15456 * Math.log10(altura)) - 450
                    : 495 / (1.29579 - 0.35004 * Math.log10(abdomen + quadril - pescoco) + 0.22100 * Math.log10(altura)) - 450;
                  const anos = Number(form.anosTreino) || 0;
                  if (form.atletaCompetitivo) bf -= 3;
                  else if (anos >= 5) bf -= 2;
                  else if (anos >= 3) bf -= 1;
                  bf = Math.max(4, Math.min(50, Math.round(bf * 10) / 10));
                  const mm = peso ? Math.round(peso * (1 - bf / 100) * 10) / 10 : null;
                  return (
                    <div style={{ gridColumn: "1 / -1", padding: "10px 12px", background: T.bg3, border: `1px solid ${T.border2}`, borderRadius: 8, fontSize: 12, color: T.text }}>
                      <strong style={{ color: T.amber }}>BF estimado: {bf}%</strong>
                      {mm !== null && <> · Massa magra: <strong>{mm} kg</strong></>}
                    </div>
                  );
                })()}
              </>
            )}
            {form.metodoBF === "visual" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <Label>Físico atual do paciente</Label>
                <SelectField value={form.perfilVisual} onChange={e => set("perfilVisual", e.target.value)}>
                  <option value="">Selecione...</option>
                  {String(form.sexo || "").toLowerCase().startsWith("f") ? (
                    <>
                      <option value="competicao">Competição — definição muscular extrema (10-13%)</option>
                      <option value="definido_repouso">Definida — abs visíveis, atlética (14-18%)</option>
                      <option value="atletico_contracao">Atlética — boa definição (19-23%)</option>
                      <option value="forma_boa">Boa forma — curvas definidas (24-28%)</option>
                      <option value="forma_media">Forma média — gordura moderada (29-33%)</option>
                      <option value="acima_peso">Acima do peso (34-38%)</option>
                      <option value="obesidade">Obesidade (39%+)</option>
                    </>
                  ) : (
                    <>
                      <option value="competicao">Competição — veias em todo corpo, estriações (3-6%)</option>
                      <option value="definido_repouso">Definido — abs visíveis em repouso, veias nos braços (7-10%)</option>
                      <option value="atletico_contracao">Atlético — abs visíveis com contração (11-15%)</option>
                      <option value="forma_boa">Boa forma — pouca gordura abdominal (16-20%)</option>
                      <option value="forma_media">Forma média — gordura abdominal moderada (21-25%)</option>
                      <option value="acima_peso">Acima do peso — barriga proeminente (26-30%)</option>
                      <option value="obesidade">Obesidade — gordura distribuída (31%+)</option>
                    </>
                  )}
                </SelectField>
              </div>
            )}
            {form.metodoBF === "nao_sei" && (
              <div style={{ gridColumn: "1 / -1", padding: "10px 12px", background: T.bg3, border: `1px solid ${T.border2}`, borderRadius: 8, fontSize: 11, color: T.muted }}>
                A fórmula será selecionada automaticamente com base na idade, IMC e nível de atividade. Para maior precisão, informe o % gordura.
              </div>
            )}
            {form.fasePeriodizacao === "peak_week" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <Label required>Data da competição</Label>
                <InputField type="date" value={form.dataCompeticao} onChange={e => set("dataCompeticao", e.target.value)} />
              </div>
            )}
          </div>
        </Section>

        {/* ─── Perfil Fisiológico Avançado (Elite) ─────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <button
            type="button"
            onClick={() => setPerfilFisioOpen(!perfilFisioOpen)}
            style={{
              width: "100%", background: "transparent", border: "none", padding: 0,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
              fontFamily: "inherit",
            }}
          >
            <div style={{ width: 16, height: 1, background: "#B8922A" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#B8922A", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
              Perfil Fisiológico Avançado
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#B8922A",
              background: "rgba(184, 146, 42, 0.15)",
              border: "1px solid rgba(184, 146, 42, 0.3)",
              borderRadius: 4, padding: "2px 8px", letterSpacing: "0.04em",
            }}>🔬 Elite</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 14, color: "#B8922A", transition: "transform .2s", transform: perfilFisioOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
          </button>

          {perfilFisioOpen && (
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <Label>Histórico intestinal</Label>
                <SelectField value={form.historicoIntestinal} onChange={e => set("historicoIntestinal", e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="sem_queixas">Sem queixas</option>
                  <option value="gases_inchaco">Gases ou inchaço frequente</option>
                  <option value="transito_irregular">Trânsito irregular (prisão de ventre ou diarreia)</option>
                  <option value="antibioticos_12m">Uso de antibióticos nos últimos 12 meses</option>
                  <option value="sii_disbiose">SII ou disbiose diagnosticada</option>
                </SelectField>
              </div>

              <div>
                <Label>Fermentados na dieta atual</Label>
                <SelectField value={form.fermentadosAtual} onChange={e => set("fermentadosAtual", e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="nao_consumo">Não consumo fermentados</option>
                  <option value="iogurte_ocasional">Iogurte ocasional (1–2x/semana)</option>
                  <option value="iogurte_diario">Iogurte diário</option>
                  <option value="kefir_kimchi_chucrute">Kefir, kimchi ou chucrute regularmente</option>
                </SelectField>
                <div style={{ marginTop: 6, fontSize: 11, color: T.green, lineHeight: 1.5 }}>
                  A IA ajustará a introdução de fermentados de forma progressiva conforme o histórico intestinal.
                </div>
              </div>

              <div>
                <Label>Sensibilidade à insulina (auto-avaliação)</Label>
                <SelectField value={form.sensibilidadeInsulina} onChange={e => set("sensibilidadeInsulina", e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="excelente">Excelente — ganho pouco gordura mesmo em superávit</option>
                  <option value="boa">Boa — ganho moderado em superávit</option>
                  <option value="regular">Regular — ganho gordura com facilidade</option>
                  <option value="ruim">Ruim — qualquer excesso calórico vai para gordura</option>
                </SelectField>
                <div style={{ marginTop: 6, fontSize: 11, color: T.green, lineHeight: 1.5 }}>
                  A IA ativará ciclagem de carboidratos e protocolos de sensibilização conforme este perfil.
                </div>
              </div>

              <div>
                <Label>Objetivos secundários (selecione todos que se aplicam)</Label>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                  {[
                    "Otimizar microbiota",
                    "Melhorar sensibilidade à insulina",
                    "Reduzir inflamação sistêmica",
                    "Melhorar qualidade do sono",
                    "Saúde hormonal",
                    "Maximizar absorção de nutrientes",
                    "Saúde intestinal (TGI)",
                  ].map(o => (
                    <Tag key={o} label={o} active={form.objetivosSecundarios.includes(o)} onClick={() => toggleArr("objetivosSecundarios", o)} />
                  ))}
                </div>
              </div>

              <div style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", background: T.card, border: `1px solid ${form.variedadeFuncional ? "#B8922A" : T.border}`,
                borderRadius: 10,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>🌿 Priorizar variedade funcional de alimentos?</div>
                  <div style={{ fontSize: 11, color: T.green, marginTop: 4, lineHeight: 1.5 }}>
                    Ativa protocolo de 20+ espécies vegetais/semana — frutas funcionais por categoria, vegetais por função fisiológica, fermentados diários e temperos ativos (cúrcuma, gengibre, alho).
                  </div>
                </div>
                <div
                  onClick={() => set("variedadeFuncional", !form.variedadeFuncional)}
                  style={{
                    width: 44, height: 24, borderRadius: 999,
                    background: form.variedadeFuncional ? "#B8922A" : T.bg3,
                    border: `1px solid ${form.variedadeFuncional ? "#B8922A" : T.border2}`,
                    position: "relative", cursor: "pointer", transition: "all .2s", flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: form.variedadeFuncional ? "#0a0f0a" : T.muted,
                    position: "absolute", top: 2, left: form.variedadeFuncional ? 22 : 2, transition: "left .2s",
                  }} />
                </div>
              </div>

              <div style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", background: T.card, border: `1px solid ${form.diversidadeAlimentarElite ? "#B8922A" : T.border}`,
                borderRadius: 10, marginTop: 10,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>🧬 Diversidade Alimentar Elite — Protocolo Surreal</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>
                    Meta: 40+ espécies/semana (microbioma de atleta de elite — Sonnenburg/Stanford). Rotação obrigatória: 7 proteínas (incl. vísceras), 6 carbs funcionais, 8 vegetais por matriz de cores, 6 frutas por janela circadiana, 4 perfis lipídicos e fermentados 5x/semana. NUNCA repete proteína em dias consecutivos.
                  </div>
                </div>
                <div
                  onClick={() => set("diversidadeAlimentarElite", !form.diversidadeAlimentarElite)}
                  style={{
                    width: 44, height: 24, borderRadius: 999,
                    background: form.diversidadeAlimentarElite ? "#B8922A" : T.bg3,
                    border: `1px solid ${form.diversidadeAlimentarElite ? "#B8922A" : T.border2}`,
                    position: "relative", cursor: "pointer", transition: "all .2s", flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: form.diversidadeAlimentarElite ? "#0a0f0a" : T.muted,
                    position: "absolute", top: 2, left: form.diversidadeAlimentarElite ? 22 : 2, transition: "left .2s",
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rotina de treino semanal */}
        <Section title="Rotina de treino">
          <TrainingSchedule value={trainingSchedule} onChange={setTrainingSchedule} />
        </Section>

        {/* Protocolo de cardio */}
        <Section title="Protocolo de cardio">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: form.fazCardio ? 16 : 0 }}>
            <Label>Faz cardio?</Label>
            <button
              type="button"
              onClick={() => set("fazCardio", !form.fazCardio)}
              style={{
                width: 46, height: 24, borderRadius: 999, position: "relative",
                background: form.fazCardio ? T.green : T.bg3,
                border: `1px solid ${form.fazCardio ? T.green : T.border2}`,
                cursor: "pointer", transition: "all .2s", padding: 0
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: form.fazCardio ? "#0a0f0a" : T.muted,
                position: "absolute", top: 2, left: form.fazCardio ? 24 : 2,
                transition: "all .2s"
              }} />
            </button>
            <span style={{ fontSize: 12, color: T.muted }}>{form.fazCardio ? "Sim" : "Não"}</span>
          </div>

          {form.fazCardio && (
            <>
              <div style={{ marginBottom: 14 }}>
                <Label>Modalidade de cardio</Label>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                  {["LISS", "HIIT", "Zona 1 (50–60% FCmax)", "Zona 2 (60–70%)", "Zona 3 (70–80%)", "Zona 4 (80–90%)", "AEJ (Aeróbico em Jejum)", "Caminhada NEAT"].map(m => (
                    <Tag key={m} label={m} active={form.cardioModalidades.includes(m)} onClick={() => toggleArr("cardioModalidades", m)} />
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <Label>Frequência cardio</Label>
                  <SelectField value={form.cardioFrequencia} onChange={e => set("cardioFrequencia", e.target.value)}>
                    {["1x", "2x", "3x", "4x", "5x", "Diário", "2x ao dia"].map(o => <option key={o} value={o}>{o}</option>)}
                  </SelectField>
                </div>
                <div>
                  <Label>Duração média</Label>
                  <SelectField value={form.cardioDuracao} onChange={e => set("cardioDuracao", e.target.value)}>
                    {["20min", "30min", "45min", "60min", "90min"].map(o => <option key={o} value={o}>{o}</option>)}
                  </SelectField>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Quando faz cardio</Label>
                  <SelectField value={form.cardioQuando} onChange={e => set("cardioQuando", e.target.value)}>
                    <option value="pos_treino">Pós-treino</option>
                    <option value="pre_treino">Pré-treino</option>
                    <option value="separado">Separado do treino</option>
                    <option value="jejum_manha">Em jejum manhã</option>
                    <option value="noite">Noite</option>
                  </SelectField>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Label>Cardio entra no cálculo calórico?</Label>
                <button
                  type="button"
                  onClick={() => set("cardioNoCalculo", !form.cardioNoCalculo)}
                  style={{
                    width: 46, height: 24, borderRadius: 999, position: "relative",
                    background: form.cardioNoCalculo ? T.green : T.bg3,
                    border: `1px solid ${form.cardioNoCalculo ? T.green : T.border2}`,
                    cursor: "pointer", transition: "all .2s", padding: 0
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: form.cardioNoCalculo ? "#0a0f0a" : T.muted,
                    position: "absolute", top: 2, left: form.cardioNoCalculo ? 24 : 2,
                    transition: "all .2s"
                  }} />
                </button>
                <span style={{ fontSize: 12, color: T.muted }}>{form.cardioNoCalculo ? "Sim" : "Não"}</span>
              </div>
            </>
          )}
        </Section>

        {/* Recursos ergogênicos */}
        <Section title="Recursos ergogênicos">
          <div style={{ marginBottom: 14 }}>
            <Label>Protocolo farmacológico ativo</Label>
            <TextareaField
              rows={4}
              style={{ minHeight: 110 }}
              placeholder="Descreva tudo que o aluno usa. Ex: Testosterona Enantato 300mg/sem, NPP 200mg/sem, CJC-1295 sem DAC 2mg 2x/sem, Ipamorelin 200mcg 3x/dia, SLU-PP-332 experimental, Retratutida 2mg/sem, Metformina 500mg..."
              value={form.protocoloFarmacologico}
              onChange={e => set("protocoloFarmacologico", e.target.value)}
            />
            <div style={{
              marginTop: 10, padding: "10px 12px", borderRadius: 8,
              background: T.greenBg, border: `1px solid ${T.border2}`,
              display: "flex", alignItems: "flex-start", gap: 8
            }}>
              <span style={{ fontSize: 14, lineHeight: 1 }}>🧠</span>
              <span style={{ fontSize: 11, color: T.green, lineHeight: 1.5 }}>
                A IA interpretará cada composto e ajustará TDEE, macros e timing automaticamente com base em evidências farmacológicas.
              </span>
            </div>
          </div>

          {/* NutriPlan Elite — Compostos Ativos (multi-select estruturado) */}
          <div style={{ marginBottom: 14 }}>
            <Label>💊 Compostos Ativos {form.compostosAtivos?.length > 0 && <span style={{ color: T.green, marginLeft: 6 }}>({form.compostosAtivos.length})</span>}</Label>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 10, lineHeight: 1.4 }}>
              Marque os compostos do paciente para ativar multiplicadores farmacológicos no TDEE e enriquecimento NutriPlan Elite.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {COMPOSTOS_VERTEX.map(c => {
                const active = (form.compostosAtivos || []).includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleComposto(c)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 16,
                      fontSize: 11,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      border: `1px solid ${active ? T.green : T.border2}`,
                      background: active ? T.greenBg : T.bg3,
                      color: active ? T.green : T.muted,
                      fontWeight: active ? 600 : 400,
                      transition: "all .15s",
                    }}
                  >
                    {active ? "✓ " : ""}{c}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: form.atletaCompetitivo ? 14 : 0 }}>
            <Label>É atleta competitivo?</Label>
            <button
              type="button"
              onClick={() => set("atletaCompetitivo", !form.atletaCompetitivo)}
              style={{
                width: 46, height: 24, borderRadius: 999, position: "relative",
                background: form.atletaCompetitivo ? T.green : T.bg3,
                border: `1px solid ${form.atletaCompetitivo ? T.green : T.border2}`,
                cursor: "pointer", transition: "all .2s", padding: 0
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: form.atletaCompetitivo ? "#0a0f0a" : T.muted,
                position: "absolute", top: 2, left: form.atletaCompetitivo ? 24 : 2,
                transition: "all .2s"
              }} />
            </button>
            <span style={{ fontSize: 12, color: T.muted }}>{form.atletaCompetitivo ? "Sim" : "Não"}</span>
          </div>

          {form.atletaCompetitivo && (
            <div>
              <Label>Federação / Categoria</Label>
              <InputField placeholder="Ex: IFBB Pro Men's Physique, NPC Classic Physique..." value={form.federacaoCategoria} onChange={e => set("federacaoCategoria", e.target.value)} />
            </div>
          )}
        </Section>

        {/* Configuração do plano */}
        <Section title="Configuração do plano">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Label>Número de refeições/dia</Label>
              <SelectField value={form.refeicoes} onChange={e => set("refeicoes", e.target.value)}>
                {["3", "4", "5", "6", "7"].map(n => <option key={n} value={n}>{n} refeições</option>)}
              </SelectField>
            </div>
            <div>
              <Label>Meta calórica (opcional)</Label>
              <InputField type="number" placeholder="Auto (calcular)" value={form.calorias} onChange={e => set("calorias", e.target.value)} />
            </div>
          </div>
        </Section>

        {/* Restrições */}
        <Section title="Restrições alimentares">
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 14 }}>
            {restricoesOpts.map(r => (
              <Tag key={r} label={r} active={form.restricoes.includes(r)} onClick={() => toggleArr("restricoes", r)} />
            ))}
          </div>
          <Label>Outra restrição ou alergia</Label>
          <InputField placeholder="Ex: FODMAP, histamina..." value={form.outraRestricao} onChange={e => set("outraRestricao", e.target.value)} />
        </Section>

        {/* Perfil de orçamento alimentar */}
        <Section title="Condição econômica do plano">
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>
            Define a faixa de custo dos alimentos priorizados pela IA. A equivalência nutricional é mantida em todas as opções.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 18 }}>
            {perfilEconomicoOpts.map(opt => {
              const active = form.perfilEconomico === opt.v;
              return (
                <div
                  key={opt.v}
                  onClick={() => set("perfilEconomico", opt.v)}
                  style={{
                    cursor: "pointer",
                    padding: 14,
                    borderRadius: 12,
                    background: active ? `${T.green}15` : T.bg3,
                    border: `1px solid ${active ? T.green : T.border2}`,
                    boxShadow: active ? `0 0 18px ${T.green}22` : "none",
                    transition: "all .15s",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: active ? T.green : T.text, marginBottom: 6 }}>
                    {opt.titulo}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.4 }}>
                    {opt.desc}
                  </div>
                </div>
              );
            })}
          </div>

          <Label>Alimentos disponíveis em casa ou de preferência (opcional)</Label>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>
            A IA prioriza esses itens, mas não fica restrita a eles.
          </div>
          {alimentosDisponiveisGrupos.map(g => (
            <div key={g.grupo} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {g.grupo}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                {g.itens.map(item => (
                  <Tag
                    key={item}
                    label={item}
                    active={form.alimentosDisponiveis.includes(item)}
                    onClick={() => toggleArr("alimentosDisponiveis", item)}
                  />
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <Label>Outros alimentos que tem em casa ou quer incluir</Label>
            <InputField
              placeholder="Ex: tapioca, cuscuz, feijão preto, macaxeira..."
              value={form.outrosAlimentos}
              onChange={e => set("outrosAlimentos", e.target.value)}
            />
          </div>

          {/* 🍎 FRUTAS EM CASA — prioridade no plano + sugestão de upgrade */}
          <div style={{ marginTop: 18, padding: 14, background: "#0f1410", border: `1px solid ${T.amber}44`, borderRadius: 10 }}>
            <Label>🍎 Frutas que tenho em casa</Label>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>
              A IA usa estas frutas como base do <strong>Protocolo de Frutas Obrigatório</strong> e sugere upgrades se faltar uma fruta funcional importante (ex.: enzimática, anti-inflamatória, cronobiológica).
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 10 }}>
              {[
                "Banana","Maçã","Pera","Mamão","Abacaxi","Manga","Goiaba","Laranja","Tangerina","Limão",
                "Kiwi","Abacate","Melancia","Melão","Uva","Morango","Mirtilo","Framboesa","Amora","Cereja",
                "Romã","Coco","Pêssego","Ameixa","Caqui","Maracujá","Açaí",
              ].map(item => (
                <Tag
                  key={item}
                  label={item}
                  active={form.frutasEmCasa.includes(item)}
                  onClick={() => toggleArr("frutasEmCasa", item)}
                />
              ))}
            </div>
            <Label>Outras frutas (separadas por vírgula)</Label>
            <InputField
              placeholder="Ex: jabuticaba, pitaya, graviola, fruta-do-conde..."
              value={form.outrasFrutas}
              onChange={e => set("outrasFrutas", e.target.value)}
            />
          </div>
        </Section>

        {/* Preferências e obs */}
        <Section title="Informações adicionais">
          <div style={{ marginBottom: 14 }}>
            <Label>Preferências alimentares</Label>
            <InputField placeholder="Ex: Gosta de açaí, prefere frango a carne vermelha..." value={form.preferencias} onChange={e => set("preferencias", e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <Label>Suplementação atual</Label>
            <InputField placeholder="Ex: Whey 40g, creatina 5g, vitamina D 5000UI..." value={form.suplementos} onChange={e => set("suplementos", e.target.value)} />
          </div>
          <div>
            <Label>Observações clínicas</Label>
            <TextareaField placeholder="Ex: Hipotireoidismo, hipertensão controlada, histórico de compulsão alimentar..." value={form.observacoes} onChange={e => set("observacoes", e.target.value)} />
          </div>
        </Section>

        {/* ─── Módulo GLUT-4 Pós-Treino ─────────────────────────────────────── */}
        <div style={{
          background: T.card, border: `1px solid ${form.glut4Enabled ? T.green : T.border}`,
          borderRadius: 12, padding: 18, marginBottom: 18,
          boxShadow: form.glut4Enabled ? `0 0 24px ${T.green}22` : "none",
          transition: "all .2s",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: form.glut4Enabled ? 14 : 0 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
                ⚡ Priorizar GLUT-4 Pós-Treino
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                Janela fisiológica de translocação do GLUT-4 — CHO isolado, zero gordura, zero proteína completa.
              </div>
            </div>
            <div
              onClick={() => set("glut4Enabled", !form.glut4Enabled)}
              style={{
                width: 44, height: 24, borderRadius: 999,
                background: form.glut4Enabled ? T.green : T.bg3,
                border: `1px solid ${form.glut4Enabled ? T.green : T.border2}`,
                position: "relative", cursor: "pointer", transition: "all .2s", flexShrink: 0,
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: form.glut4Enabled ? "#0a0f0a" : T.muted,
                position: "absolute", top: 2, left: form.glut4Enabled ? 22 : 2,
                transition: "left .2s",
              }} />
            </div>
          </div>

          {form.glut4Enabled && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 12 }}>
                <div>
                  <Label>Usou maltodextrina intra-treino?</Label>
                  <SelectField value={form.glut4UsesIntraMalto ? "1" : "0"} onChange={e => set("glut4UsesIntraMalto", e.target.value === "1")}>
                    <option value="1">Sim</option>
                    <option value="0">Não</option>
                  </SelectField>
                </div>
                <div>
                  <Label>Maltodextrina intra (g)</Label>
                  <InputField type="number" placeholder="60" value={form.glut4IntraMaltoG} onChange={e => set("glut4IntraMaltoG", e.target.value)} disabled={!form.glut4UsesIntraMalto} />
                </div>
                <div>
                  <Label>Timing janela (min)</Label>
                  <InputField type="number" placeholder="30" value={form.glut4TimingMin} onChange={e => set("glut4TimingMin", e.target.value)} />
                </div>
                <div>
                  <Label>CHO da janela (g) — vazio = auto</Label>
                  <InputField type="number" placeholder="auto pelo peso" value={form.glut4CarbGrams} onChange={e => set("glut4CarbGrams", e.target.value)} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <Label>Fonte de carboidrato</Label>
                  <SelectField value={form.glut4CarbSource} onChange={e => set("glut4CarbSource", e.target.value)}>
                    <option value="dextrose">Dextrose pura (IG 100)</option>
                    <option value="tamaras">Tâmaras Medjool (IG 103)</option>
                    <option value="pao_frances">Pão francês (IG 95)</option>
                    <option value="pao_branco">Pão de forma branco (IG 85)</option>
                    <option value="doce_de_leite">Doce de leite light (IG 65)</option>
                    <option value="mel">Mel puro (IG 61)</option>
                    <option value="geleia">Geleia açucarada (IG 65)</option>
                    <option value="leite_condensado">Leite condensado desnatado (IG 61)</option>
                    <option value="banana">Banana bem madura (IG 72)</option>
                    <option value="coca">Coca-Cola — competição (IG 65)</option>
                    {!form.glut4UsesIntraMalto && <option value="maltodextrina">Maltodextrina (IG 95)</option>}
                  </SelectField>
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 14, fontSize: 12, color: T.text }}>
                <input type="checkbox" checked={form.glut4AddLeucine} onChange={e => set("glut4AddLeucine", e.target.checked)} style={{ accentColor: T.green }} />
                Adicionar L-Leucina isolada (2g) — mTORC1 sem competição de aminoácidos
              </label>

              <button
                onClick={gerarGlut4}
                disabled={glut4Loading}
                style={{
                  width: "100%", padding: 12, borderRadius: 8,
                  background: glut4Loading ? T.bg3 : T.greenBg,
                  border: `1px solid ${T.green}`, color: T.green,
                  fontSize: 13, fontWeight: 700, cursor: glut4Loading ? "wait" : "pointer",
                  fontFamily: "inherit", letterSpacing: "0.02em",
                }}
              >
                {glut4Loading ? "Calculando fisiologia..." : "⚡ Gerar Janela GLUT-4"}
              </button>

              {glut4Text && (
                <div style={{
                  marginTop: 14, background: T.bg2, border: `1px solid ${T.green}55`,
                  borderRadius: 10, padding: 14,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Bloco fisiológico gerado
                    </div>
                    <button
                      onClick={() => setGlut4Text("")}
                      style={{ background: "transparent", border: "none", color: T.muted, fontSize: 11, cursor: "pointer" }}
                    >
                      Limpar
                    </button>
                  </div>
                  <pre style={{
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                    fontFamily: "inherit", fontSize: 12, color: T.text,
                    margin: 0, lineHeight: 1.6,
                  }}>{glut4Text}</pre>
                  <div style={{ fontSize: 10, color: T.muted2, marginTop: 8, fontStyle: "italic" }}>
                    Será incluído automaticamente no plano alimentar e no PDF.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Toggle: Protocolo Microbiota */}
        <div style={{
          background: T.card, border: `1px solid ${form.protocoloMicrobiota ? "#B8922A" : T.border}`,
          borderRadius: 12, padding: 18, marginBottom: 12,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
              🦠 Protocolo Microbiota Ativo
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>
              Inclui fermentado diário, combinações simbióticas e prebióticos estratégicos em cada refeição.
            </div>
          </div>
          <div
            onClick={() => set("protocoloMicrobiota", !form.protocoloMicrobiota)}
            style={{
              width: 44, height: 24, borderRadius: 999,
              background: form.protocoloMicrobiota ? "#B8922A" : T.bg3,
              border: `1px solid ${form.protocoloMicrobiota ? "#B8922A" : T.border2}`,
              position: "relative", cursor: "pointer", transition: "all .2s", flexShrink: 0,
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              background: form.protocoloMicrobiota ? "#0a0f0a" : T.muted,
              position: "absolute", top: 2, left: form.protocoloMicrobiota ? 22 : 2, transition: "left .2s",
            }} />
          </div>
        </div>

        {/* Toggle: Cycling de Carboidratos */}
        <div style={{
          background: T.card, border: `1px solid ${form.cyclingCarbo ? "#B8922A" : T.border}`,
          borderRadius: 12, padding: 18, marginBottom: 18,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
              📊 Cycling de Carboidratos
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>
              Dias de treino pesado recebem CHO máximo. Dias leves e descanso recebem 60–70% do CHO — mantém sensibilidade à insulina alta.
            </div>
          </div>
          <div
            onClick={() => set("cyclingCarbo", !form.cyclingCarbo)}
            style={{
              width: 44, height: 24, borderRadius: 999,
              background: form.cyclingCarbo ? "#B8922A" : T.bg3,
              border: `1px solid ${form.cyclingCarbo ? "#B8922A" : T.border2}`,
              position: "relative", cursor: "pointer", transition: "all .2s", flexShrink: 0,
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              background: form.cyclingCarbo ? "#0a0f0a" : T.muted,
              position: "absolute", top: 2, left: form.cyclingCarbo ? 22 : 2, transition: "left .2s",
            }} />
          </div>
        </div>

        {/* Toggle: Cronobiologia Nutricional */}
        <div style={{
          background: T.card, border: `1px solid ${form.cronobiologiaAtiva ? "#B8922A" : T.border}`,
          borderRadius: 12, padding: 18, marginBottom: 18,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
              🌅 Cronobiologia Nutricional — Relógio Circadiano Aplicado
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>
              Distribui macros conforme janelas circadianas: CHO complexos pela manhã (pico de sensibilidade insulínica), refeição maior 12–14h (pico metabólico), proteína de absorção lenta + triptofano à noite. Sincroniza com cronotipo, cortisol e melatonina.
            </div>
          </div>
          <div
            onClick={() => set("cronobiologiaAtiva", !form.cronobiologiaAtiva)}
            style={{
              width: 44, height: 24, borderRadius: 999,
              background: form.cronobiologiaAtiva ? "#B8922A" : T.bg3,
              border: `1px solid ${form.cronobiologiaAtiva ? "#B8922A" : T.border2}`,
              position: "relative", cursor: "pointer", transition: "all .2s", flexShrink: 0,
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              background: form.cronobiologiaAtiva ? "#0a0f0a" : T.muted,
              position: "absolute", top: 2, left: form.cronobiologiaAtiva ? 22 : 2, transition: "left .2s",
            }} />
          </div>
        </div>

        {/* Toggle: Hidratação Farmacológica Inteligente */}
        <div style={{
          background: T.card, border: `1px solid ${form.hidratacaoFarmacologica ? "#B8922A" : T.border}`,
          borderRadius: 12, padding: 18, marginBottom: 18,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
              💧 Hidratação Farmacológica Inteligente
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>
              Calcula meta hídrica + eletrólitos (Na⁺, K⁺, Mg²⁺) ajustada ao protocolo farmacológico, diuréticos, GLP-1, cardio e clima. Distribui timing intra-treino, pré-bed e janelas de retenção/depleção em peak week.
            </div>
          </div>
          <div
            onClick={() => set("hidratacaoFarmacologica", !form.hidratacaoFarmacologica)}
            style={{
              width: 44, height: 24, borderRadius: 999,
              background: form.hidratacaoFarmacologica ? "#B8922A" : T.bg3,
              border: `1px solid ${form.hidratacaoFarmacologica ? "#B8922A" : T.border2}`,
              position: "relative", cursor: "pointer", transition: "all .2s", flexShrink: 0,
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              background: form.hidratacaoFarmacologica ? "#0a0f0a" : T.muted,
              position: "absolute", top: 2, left: form.hidratacaoFarmacologica ? 22 : 2, transition: "left .2s",
            }} />
          </div>
        </div>

        {/* Toggle: Modo Econômico */}
        <div style={{
          background: T.card, border: `1px solid ${form.modoEconomico ? "#B8922A" : T.border}`,
          borderRadius: 12, padding: 18, marginBottom: 18,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
              💰 Modo Econômico
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>
              Prioriza alimentos de menor custo do banco (vísceras, ovo, sardinha em lata, frango inteiro, músculo, leite em pó, aveia) mantendo as MESMAS equivalências nutricionais (proteína ±3g, perfil de gordura, IG).
            </div>
          </div>
          <div
            onClick={() => set("modoEconomico", !form.modoEconomico)}
            style={{
              width: 44, height: 24, borderRadius: 999,
              background: form.modoEconomico ? "#B8922A" : T.bg3,
              border: `1px solid ${form.modoEconomico ? "#B8922A" : T.border2}`,
              position: "relative", cursor: "pointer", transition: "all .2s", flexShrink: 0,
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              background: form.modoEconomico ? "#0a0f0a" : T.muted,
              position: "absolute", top: 2, left: form.modoEconomico ? 22 : 2, transition: "left .2s",
            }} />
          </div>
        </div>

        {/* Toggle: Medidas Caseiras (Nutrition Coach IA) */}
        <div style={{
          background: T.card, border: `1px solid ${form.medidasCaseiras ? "#B8922A" : T.border}`,
          borderRadius: 12, padding: 18, marginBottom: 18,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
              🥄 Medidas Caseiras (Nutrition Coach IA)
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>
              Quando ATIVO: a IA descreve cada alimento em medidas caseiras (colher de sopa, xícara, fatia, concha, unidade) e adiciona ao final do plano um <b>Mapa de Referência</b> com a gramatura exata de cada medida usada. Ideal para o paciente seguir sem balança. O nutricionista continua recebendo a gramatura técnica internamente.
            </div>
          </div>
          <div
            onClick={() => set("medidasCaseiras", !form.medidasCaseiras)}
            style={{
              width: 44, height: 24, borderRadius: 999,
              background: form.medidasCaseiras ? "#B8922A" : T.bg3,
              border: `1px solid ${form.medidasCaseiras ? "#B8922A" : T.border2}`,
              position: "relative", cursor: "pointer", transition: "all .2s", flexShrink: 0,
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              background: form.medidasCaseiras ? "#0a0f0a" : T.muted,
              position: "absolute", top: 2, left: form.medidasCaseiras ? 22 : 2, transition: "left .2s",
            }} />
          </div>
        </div>

        {/* Painel: Preferências de Unidades Caseiras */}
        {form.medidasCaseiras && (() => {
          const mp = form.medidasPrefs;
          const setMP = (k: keyof typeof mp, v: any) =>
            setForm(f => ({ ...f, medidasPrefs: { ...f.medidasPrefs, [k]: v } }));
          const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#B8922A", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 8 }}>{title}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{children}</div>
            </div>
          );
          const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
            <button onClick={onClick} style={{
              padding: "6px 12px", borderRadius: 999, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
              border: `1px solid ${active ? "#B8922A" : T.border2}`,
              background: active ? "rgba(184,146,42,0.15)" : "transparent",
              color: active ? "#B8922A" : T.muted, fontWeight: active ? 700 : 500,
              transition: "all .15s",
            }}>{children}</button>
          );
          return (
            <div style={{
              background: T.card, border: `1px solid #B8922A`, borderRadius: 12,
              padding: 18, marginBottom: 18,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                ⚙️ Preferências de Unidades Caseiras
              </div>
              <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, marginBottom: 14 }}>
                Escolha quais utensílios e medidas a IA deve usar como padrão. O Mapa de Referência será regenerado com base nessas escolhas.
              </div>

              <Group title="Colher padrão">
                <Chip active={mp.colher === "sopa"} onClick={() => setMP("colher", "sopa")}>Colher de sopa</Chip>
                <Chip active={mp.colher === "cha"} onClick={() => setMP("colher", "cha")}>Colher de chá</Chip>
                <Chip active={mp.colher === "ambas"} onClick={() => setMP("colher", "ambas")}>Ambas (sopa + chá)</Chip>
              </Group>

              <Group title="Xícara padrão">
                <Chip active={mp.xicara === "cha_240"} onClick={() => setMP("xicara", "cha_240")}>Xícara de chá (240 ml)</Chip>
                <Chip active={mp.xicara === "grande_300"} onClick={() => setMP("xicara", "grande_300")}>Xícara grande (300 ml)</Chip>
                <Chip active={mp.xicara === "ambas"} onClick={() => setMP("xicara", "ambas")}>Ambas</Chip>
              </Group>

              <Group title="Copo padrão">
                <Chip active={mp.copo === "americano_200"} onClick={() => setMP("copo", "americano_200")}>Copo americano (200 ml)</Chip>
                <Chip active={mp.copo === "grande_300"} onClick={() => setMP("copo", "grande_300")}>Copo grande (300 ml)</Chip>
                <Chip active={mp.copo === "ambas"} onClick={() => setMP("copo", "ambas")}>Ambos</Chip>
              </Group>

              <Group title="Concha (sopas / feijão)">
                <Chip active={mp.concha === "pequena_50"} onClick={() => setMP("concha", "pequena_50")}>Pequena (~50 ml)</Chip>
                <Chip active={mp.concha === "media_80"} onClick={() => setMP("concha", "media_80")}>Média (~80 ml)</Chip>
                <Chip active={mp.concha === "grande_120"} onClick={() => setMP("concha", "grande_120")}>Grande (~120 ml)</Chip>
              </Group>

              <Group title="Referência de proteína (filé / bife)">
                <Chip active={mp.proteinaUnidade === "palma"} onClick={() => setMP("proteinaUnidade", "palma")}>Palma da mão</Chip>
                <Chip active={mp.proteinaUnidade === "filé_tamanho"} onClick={() => setMP("proteinaUnidade", "filé_tamanho")}>Filé pequeno/médio/grande</Chip>
                <Chip active={mp.proteinaUnidade === "gramas_visuais"} onClick={() => setMP("proteinaUnidade", "gramas_visuais")}>Comparações visuais (baralho, etc.)</Chip>
              </Group>

              <Group title="Outras unidades">
                <Chip active={mp.usarPunhado} onClick={() => setMP("usarPunhado", !mp.usarPunhado)}>{mp.usarPunhado ? "✓ " : ""}Usar "punhado" (oleaginosas)</Chip>
                <Chip active={mp.usarFatias} onClick={() => setMP("usarFatias", !mp.usarFatias)}>{mp.usarFatias ? "✓ " : ""}Usar "fatias" (pão, queijo, frios)</Chip>
              </Group>

              <div>
                <Label>Observações para a IA (opcional)</Label>
                <TextareaField
                  value={mp.observacoesMedidas}
                  onChange={(e) => setMP("observacoesMedidas", e.target.value)}
                  placeholder='Ex: "use sempre colher de sopa rasa", "prefiro ‘1 prato fundo’ ao invés de xícaras", "evite ‘punhado’"'
                  style={{ minHeight: 60 }}
                />
              </div>

              {/* Validação automática contra banco de referências */}
              {(() => {
                const report = validateMedidasCaseiras(mp);
                const headerColor =
                  report.error > 0 ? T.red : report.warn > 0 ? T.amber : T.green;
                const headerBg =
                  report.error > 0 ? "rgba(248,113,113,0.08)" :
                  report.warn > 0 ? "rgba(251,191,36,0.08)" :
                  "rgba(74,222,128,0.08)";
                const icon = report.error > 0 ? "⛔" : report.warn > 0 ? "⚠️" : "✅";
                return (
                  <div style={{
                    marginTop: 14, marginBottom: 4,
                    background: headerBg,
                    border: `1px solid ${headerColor}`,
                    borderRadius: 10, padding: 12,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: headerColor, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      {icon} Validação contra banco de referências
                    </div>
                    <div style={{ fontSize: 11, color: T.text, marginBottom: 10, lineHeight: 1.5 }}>
                      {report.resumo}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {report.itens.map((it) => {
                        const c = it.status === "error" ? T.red : it.status === "warn" ? T.amber : T.green;
                        const ic = it.status === "error" ? "⛔" : it.status === "warn" ? "⚠️" : "✓";
                        return (
                          <div key={it.chave} style={{
                            display: "flex", alignItems: "flex-start", gap: 8,
                            padding: "6px 8px", borderRadius: 6,
                            background: "rgba(0,0,0,0.25)",
                            borderLeft: `2px solid ${c}`,
                          }}>
                            <span style={{ color: c, fontSize: 11, fontWeight: 700, minWidth: 14 }}>{ic}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>
                                {it.unidade}{" "}
                                <span style={{ color: T.muted, fontWeight: 400 }}>
                                  · {it.encontrados} item(ns){it.esperadoMin > 1 ? ` / mín. ${it.esperadoMin}` : ""}
                                </span>
                              </div>
                              <div style={{ fontSize: 10, color: T.muted, marginTop: 2, lineHeight: 1.4 }}>
                                {it.mensagem}
                              </div>
                              {it.exemplos.length > 0 && (
                                <div style={{ fontSize: 10, color: T.muted2, marginTop: 2 }}>
                                  Ex.: {it.exemplos.join(" · ")}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {report.error > 0 && (
                      <div style={{ marginTop: 10, fontSize: 10, color: T.red, lineHeight: 1.5 }}>
                        💡 Sugestão: troque por uma unidade alternativa (ex.: "ambas" para colher, "palma" para proteína) ou desative a opção problemática.
                      </div>
                    )}
                  </div>
                );
              })()}

              {plano && (
                <button
                  onClick={() => gerar()}
                  style={{
                    marginTop: 12, padding: "10px 14px", borderRadius: 8,
                    background: "#B8922A", border: "none", color: "#0a0f0a",
                    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    width: "100%",
                  }}
                >
                  ⟳ Regenerar plano e mapa com estas preferências
                </button>
              )}
            </div>
          );
        })()}
        {(errorDetails || error) && (() => {
          const d = errorDetails || {
            kind: "unknown" as const, title: error, description: "", canRetry: true, technical: "",
          };
          const palette: Record<string, { bg: string; border: string; fg: string; icon: string }> = {
            unavailable: { bg: "#2a1a05", border: "#5a3a10", fg: "#ffb84d", icon: "⚠️" },
            timeout:     { bg: "#2a1a05", border: "#5a3a10", fg: "#ffb84d", icon: "⏱️" },
            rate_limit:  { bg: "#1a1a2e", border: "#3a3a6e", fg: "#9aa8ff", icon: "🚦" },
            credits:     { bg: "#2a0a1a", border: "#5a103a", fg: "#ff7aa8", icon: "💳" },
            invalid_json:{ bg: "#1f0a0a", border: "#3d1010", fg: T.red,     icon: "🧩" },
            network:     { bg: "#1f0a0a", border: "#3d1010", fg: T.red,     icon: "📡" },
            validation:  { bg: "#1f0a0a", border: "#3d1010", fg: T.red,     icon: "✏️" },
            unknown:     { bg: "#1f0a0a", border: "#3d1010", fg: T.red,     icon: "❌" },
          };
          const p = palette[d.kind] || palette.unknown;
          return (
            <div style={{
              background: p.bg, border: `1px solid ${p.border}`, borderRadius: 10,
              padding: "14px 16px", marginBottom: 16, color: p.fg, fontSize: 13,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <span>{d.title}</span>
              </div>
              {d.description && (
                <div style={{ color: "#ccc", fontSize: 12.5, lineHeight: 1.5, marginBottom: d.canRetry ? 12 : 4 }}>
                  {d.description}
                </div>
              )}
              {d.technical && (
                <details style={{ marginBottom: d.canRetry ? 12 : 0 }}>
                  <summary style={{ cursor: "pointer", fontSize: 11, color: T.muted2, userSelect: "none" }}>
                    Detalhes técnicos
                  </summary>
                  <code style={{ display: "block", marginTop: 6, fontSize: 11, color: T.muted2, wordBreak: "break-all" }}>
                    {d.technical}
                  </code>
                </details>
              )}
              {d.canRetry && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={tentarNovamente}
                    disabled={retrying}
                    style={{
                      padding: "8px 14px", borderRadius: 8, border: "none",
                      background: p.fg, color: "#0a0f0a", fontSize: 12, fontWeight: 700,
                      cursor: retrying ? "wait" : "pointer", fontFamily: "inherit",
                      opacity: retrying ? 0.6 : 1,
                    }}
                  >
                    {retrying ? "⟳ Tentando..." : "⟳ Tentar novamente (com fallback)"}
                  </button>
                  <button
                    onClick={() => { setError(""); setErrorDetails(null); }}
                    style={{
                      padding: "8px 14px", borderRadius: 8, border: `1px solid ${p.border}`,
                      background: "transparent", color: p.fg, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Dispensar
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* ========== MODO ESPECIAL (pré-geração) — Fase G ========== */}
        <div id="modo-especial-form" style={{ marginBottom: 18, padding: 16, borderRadius: 12, background: T.bg2, border: `1px solid ${T.border2}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>⚙️</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Modo Especial</div>
            <span style={{ fontSize: 10, color: T.muted, fontStyle: "italic" }}>(aplicado ao gerar o plano)</span>
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 12, lineHeight: 1.5 }}>
            Ative um protocolo específico para que a IA aplique macros, timing, suplementação e alertas adequados.
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {([
              { k: "normal", l: "Padrão" },
              { k: "competicao", l: "🏆 Competição (Peak Week)" },
              { k: "glp1", l: "💉 GLP-1" },
              { k: "feminino", l: "🌸 Feminino (Ciclo)" },
              { k: "vegano", l: "🌱 Vegano" },
              { k: "low_fodmap", l: "🌾 Low-FODMAP" },
              { k: "longevidade", l: "🧬 Longevidade" },
            ] as const).map(opt => {
              const active = modoEspecial === opt.k;
              return (
                <button key={opt.k} type="button" onClick={() => setModoEspecial(opt.k as any)}
                  style={{ padding: "6px 12px", borderRadius: 16, fontSize: 11, fontFamily: "inherit", cursor: "pointer",
                    border: `1px solid ${active ? T.green : T.border2}`, background: active ? T.greenBg : T.bg3,
                    color: active ? T.green : T.muted, fontWeight: active ? 600 : 400 }}>
                  {opt.l}
                </button>
              );
            })}
          </div>
          {modoEspecial === "competicao" && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: T.muted }}>Dias até a competição:</span>
              <input type="number" min={1} max={14} value={diasComp} onChange={e => setDiasComp(Number(e.target.value) || 7)}
                style={{ width: 60, padding: "4px 8px", borderRadius: 6, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12 }} />
            </div>
          )}
          {modoEspecial === "feminino" && (
            <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(["folicular", "ovulatoria", "lutea", "menstrual"] as const).map(f => (
                <button key={f} type="button" onClick={() => setFaseCiclo(f)}
                  style={{ padding: "4px 10px", borderRadius: 12, fontSize: 10, fontFamily: "inherit", cursor: "pointer",
                    border: `1px solid ${faseCiclo === f ? T.green : T.border2}`, background: faseCiclo === f ? T.greenBg : T.bg3,
                    color: faseCiclo === f ? T.green : T.muted }}>
                  {f}
                </button>
              ))}
            </div>
          )}
          {modoEspecial !== "normal" && (() => {
            const RULES: Record<string, { titulo: string; cor: string; bullets: string[] }> = {
              competicao: { titulo: "🏆 PEAK WEEK", cor: T.amber, bullets: [
                "Proteína 2,2–2,8 g/kg para preservar massa magra.",
                diasComp <= 3 ? `D-${diasComp}: carb load 6–8 g/kg + sódio 1,5–2 g + água em rampa descendente 48h.` :
                diasComp <= 7 ? `D-${diasComp}: depleção controlada (2–3 g/kg) → load começa D-3.` :
                `D-${diasComp}: manter densidade nutricional + cortar fibras insolúveis nos 5 dias finais.`,
                "ZERO fibra insolúvel, crucíferas e lácteos nas últimas 72h.",
                "Creatina 5g/dia + eletrólitos peri-treino. Monitorar peso/visual diário.",
              ]},
              glp1: { titulo: "💉 GLP-1 · Anti-sarcopenia", cor: T.blue, bullets: [
                "Proteína 1,8–2,2 g/kg em ≥5 refeições · proteína listada PRIMEIRO.",
                "Refeições pequenas 200–350 kcal · ZERO frituras · reduzir gordura saturada.",
                "Hidratação +400 ml/dia + eletrólitos · creatina 3–5g + B12 + multi.",
                "Risco: déficit proteico e perda de massa magra. Comer por horário.",
              ]},
              feminino: { titulo: `🌸 FEMININO · Fase ${faseCiclo.toUpperCase()}`, cor: "#f472b6", bullets: [
                faseCiclo === "folicular" ? "Sensibilidade insulínica alta · carbo 50–55% pré/pós-treino · janela ideal de força." :
                faseCiclo === "ovulatoria" ? "Pico estrogênico · performance máxima · antioxidantes (vit C 500mg) · carbo 45–50%." :
                faseCiclo === "lutea" ? "TDEE +5–10% · +100–150 kcal · magnésio 300mg + B6 50mg · carbo complexo no jantar · reduzir cafeína." :
                "Menstrual · ferro heme + vit C · ômega-3 2g · reduzir volume de treino.",
                "ALERTA RED-S se kcal/kg de massa magra <30 → revisar antes de prescrever.",
                "Jamais déficit agressivo (>20%) em fase lútea ou menstrual.",
              ]},
              vegano: { titulo: "🌱 VEGANO", cor: "#4ade80", bullets: [
                "Proteína 1,6–2,0 g/kg combinando leguminosas+cereais OU soja/seitan a cada refeição (PDCAAS ≥0,9).",
                "Leucina ≥2,5g/refeição (soja, ervilha isolada, lentilha) ou EAA suplementar.",
                "Suplementar: B12, D3 vegana, ômega-3 algas, creatina 5g, ferro+vit C, zinco, iodo, cálcio.",
                "ZERO origem animal (incl. mel, gelatina, whey, caseína).",
              ]},
              low_fodmap: { titulo: "🌾 LOW-FODMAP · GutON", cor: "#fbbf24", bullets: [
                "Fase 1 (2–6 sem): cortar trigo, lactose, alho, cebola, leguminosas, polióis, frutas FODMAP.",
                "Permitidos: arroz, aveia, quinoa, batata, banana madura, kiwi, frango, peixe, tofu firme, leite zero lactose.",
                "Proteína 1,4–1,8 g/kg + fibra solúvel tolerada (aveia, chia, kiwi).",
                "Fase 2: reintrodução por grupos (3–4 dias) com diário de sintomas. NÃO é dieta permanente.",
              ]},
              longevidade: { titulo: "🧬 LONGEVIDADE", cor: "#a78bfa", bullets: [
                "Mediterrâneo: ≥30g fibra/dia · azeite extravirgem 30–45 ml · ≥5 porções vegetais coloridos.",
                "Proteína 1,2–1,6 g/kg priorizando peixes gordos 2–3x/sem · carne vermelha ≤2x/sem · ZERO processada.",
                "Ômega-3 EPA+DHA 1–2g · polifenóis (chá verde, cacau ≥70%, cúrcuma+pimenta).",
                "TRE 10–12h · última refeição ≥3h antes de dormir · ZERO ultraprocessados/açúcar adicionado.",
              ]},
            };
            const r = RULES[modoEspecial as string];
            if (!r) return null;
            return (
              <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: T.bg3, borderLeft: `3px solid ${r.cor}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: r.cor, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  {r.titulo} · regras aplicadas
                </div>
                {r.bullets.map((b, i) => (
                  <div key={i} style={{ fontSize: 11.5, color: T.text, lineHeight: 1.55, marginBottom: 4 }}>• {b}</div>
                ))}
              </div>
            );
          })()}

          {/* ========== DIMENSÃO 2 — CRONONUTRIÇÃO CIRCADIANA ========== */}
          <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: cronoCircadiano ? "#0a1420" : T.bg3, border: `1px solid ${cronoCircadiano ? "#60a5fa" : T.border2}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>🕐</span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: cronoCircadiano ? "#60a5fa" : T.text }}>
                    Crononutrição Circadiana Avançada
                  </div>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#1e3a8a", color: "#bfdbfe", fontWeight: 700, letterSpacing: "0.05em" }}>DIMENSÃO 2</span>
                </div>
                <div style={{ fontSize: 10.5, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>
                  Sincroniza distribuição calórica com cortisol, insulina e GH. Peri-treino calculado dinamicamente do TrainingON.
                </div>
              </div>
              <button type="button" onClick={() => setCronoCircadiano(v => !v)} aria-pressed={cronoCircadiano}
                style={{ position: "relative", width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                  background: cronoCircadiano ? "#3b82f6" : "#374151", transition: "background .2s", flexShrink: 0 }}>
                <span style={{ position: "absolute", top: 2, left: cronoCircadiano ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.4)" }} />
              </button>
            </div>
            {cronoCircadiano && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1e3a5f" }}>
                {[
                  { h: "06–09h", c: "#f87171", l: "Pico cortisol", d: "Proteína + gordura · carbo mínimo (evita lipogênese)" },
                  { h: "10–13h", c: "#fbbf24", l: "Sensibilidade ↑", d: "Carboidratos complexos · janela ótima de treino matinal" },
                  { h: "Peri-treino", c: "#a78bfa", l: "Sincronizado", d: "Calculado do horário no TrainingON" },
                  { h: "14–17h", c: "#4ade80", l: "Sensibilidade pico", d: "Maior refeição do dia (não-atletas) ou pré-treino vespertino" },
                  { h: "19–21h", c: "#60a5fa", l: "Pré-sono", d: "Proteína lenta + gordura · carbo reduzido (potencia GH)" },
                  { h: "23–03h", c: "#c084fc", l: "GH peak", d: "Caseína micelar 90min antes de dormir (se usar secretagogos)" },
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4, fontSize: 10.5, lineHeight: 1.45 }}>
                    <span style={{ color: b.c, fontWeight: 700, minWidth: 78 }}>{b.h}</span>
                    <span style={{ color: T.text, fontWeight: 600, minWidth: 110 }}>{b.l}</span>
                    <span style={{ color: T.muted }}>{b.d}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button onClick={gerar} style={{
          width: "100%", padding: 15, borderRadius: 10,
          background: T.green, border: "none", color: "#0a0f0a",
          fontSize: 15, fontWeight: 700, cursor: "pointer",
          fontFamily: "inherit", letterSpacing: "0.02em",
          transition: "opacity .2s", boxShadow: `0 0 24px ${T.green}33`
        }}
          onMouseEnter={e => (e.target as HTMLButtonElement).style.opacity = ".88"}
          onMouseLeave={e => (e.target as HTMLButtonElement).style.opacity = "1"}
        >
          Gerar Plano Alimentar com IA
        </button>

        <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: T.muted2 }}>
          Powered by IA · Método MCE · nutriON
        </div>
      </div>
    </div>
  );
}
