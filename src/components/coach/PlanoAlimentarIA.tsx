import { useState, useRef, useEffect } from "react";
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

// ─── Design tokens (alinhados ao nutriON: dark bg, green accent) ──────────────
const T = {
  bg:      "#0a0f0a",
  bg2:     "#111811",
  bg3:     "#161e16",
  card:    "#0f1a0f",
  border:  "#1f2e1f",
  border2: "#2a3d2a",
  green:   "#4ade80",
  greenDim:"#22c55e",
  greenBg: "#0d1f0d",
  text:    "#e8f0e8",
  muted:   "#6b8f6b",
  muted2:  "#4a634a",
  red:     "#f87171",
  amber:   "#fbbf24",
  blue:    "#60a5fa",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
    {children}{required && <span style={{ color: T.green, marginLeft: 2 }}>*</span>}
  </label>
);

const InputField = ({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { style?: React.CSSProperties }) => (
  <input {...props} style={{
    width: "100%", background: T.bg3, border: `1px solid ${T.border2}`,
    borderRadius: 8, padding: "9px 12px", color: T.text, fontSize: 13,
    outline: "none", transition: "border-color .2s",
    fontFamily: "inherit", ...style
  }}
    onFocus={e => (e.target as HTMLInputElement).style.borderColor = T.green}
    onBlur={e => (e.target as HTMLInputElement).style.borderColor = T.border2}
  />
);

const SelectField = ({ children, style, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { style?: React.CSSProperties }) => (
  <select {...props} style={{
    width: "100%", background: T.bg3, border: `1px solid ${T.border2}`,
    borderRadius: 8, padding: "9px 12px", color: T.text, fontSize: 13,
    outline: "none", transition: "border-color .2s", fontFamily: "inherit",
    cursor: "pointer", ...style
  }}
    onFocus={e => (e.target as HTMLSelectElement).style.borderColor = T.green}
    onBlur={e => (e.target as HTMLSelectElement).style.borderColor = T.border2}
  >
    {children}
  </select>
);

const TextareaField = ({ style, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { style?: React.CSSProperties }) => (
  <textarea {...props} style={{
    width: "100%", background: T.bg3, border: `1px solid ${T.border2}`,
    borderRadius: 8, padding: "9px 12px", color: T.text, fontSize: 13,
    outline: "none", resize: "vertical" as const, minHeight: 80, fontFamily: "inherit",
    transition: "border-color .2s", ...style
  }}
    onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = T.green}
    onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = T.border2}
  />
);

const Tag = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button onClick={onClick} style={{
    padding: "5px 12px", borderRadius: 999, fontSize: 12, cursor: "pointer",
    border: `1px solid ${active ? T.green : T.border2}`,
    background: active ? T.greenBg : "transparent",
    color: active ? T.green : T.muted,
    transition: "all .15s", fontFamily: "inherit"
  }}>{label}</button>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 16, height: 1, background: T.green }} />
      {title}
    </div>
    {children}
  </div>
);

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
  alimentos?: MealAlimento[];
  macros?: { proteina?: number; carboidrato?: number; gordura?: number };
}

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

interface MealCardProps {
  meal: Meal;
  index: number;
  onSwap: (alimentoIdx: number, sub: SubstituicaoItem) => void;
}

const MealCard = ({ meal, index, onSwap }: MealCardProps) => {
  const colors = [T.green, T.blue, T.amber, "#a78bfa", "#f472b6", "#34d399", "#fb923c"];
  const color = colors[index % colors.length];
  const [openSubs, setOpenSubs] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<Record<number, GrupoSub | "todos">>({});
  const [search, setSearch] = useState<Record<number, string>>({});

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 12, background: T.card }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 20, background: color, borderRadius: 2 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{meal.refeicao}</span>
          {meal.horario && <span style={{ fontSize: 11, color: T.muted, background: T.bg3, padding: "2px 8px", borderRadius: 999 }}>{meal.horario}</span>}
        </div>
        {meal.calorias && (
          <span style={{ fontSize: 12, color, fontWeight: 600 }}>{meal.calorias} kcal</span>
        )}
      </div>
      <div style={{ padding: "12px 16px" }}>
        {meal.alimentos?.map((a, i) => {
          const subs: SubstituicaoItem[] = (a.substituicoes || []).map((s) => ({ ...s, grupo: inferGrupo(s) }));
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
                {a.quantidade && (
                  <span style={{ fontSize: 12, color: T.muted, whiteSpace: "nowrap", textAlign: "right" }}>
                    {a.quantidade}
                    {a.quantidade_g && a.quantidade_g.replace(/\s/g, "").toLowerCase() !== a.quantidade.replace(/\s/g, "").toLowerCase() && (
                      <span style={{ display: "block", fontSize: 10, color: T.muted2, fontWeight: 600 }}>
                        ≈ {a.quantidade_g}
                      </span>
                    )}
                  </span>
                )}
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
                            {sub.quantidade && (
                              <div style={{ fontSize: 11, color: T.muted }}>
                                {sub.quantidade}
                                {sub.quantidade_g && sub.quantidade_g.replace(/\s/g, "").toLowerCase() !== sub.quantidade.replace(/\s/g, "").toLowerCase() && (
                                  <span style={{ marginLeft: 6, fontSize: 10, color: T.muted2 }}>≈ {sub.quantidade_g}</span>
                                )}
                              </div>
                            )}
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
  // Histórico
  const [showHistory, setShowHistory] = useState(false);
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
    protocoloMicrobiota: false,
    cyclingCarbo: false,
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
  });

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
  const gerarPlanoCore = async (overrideModoEconomico?: boolean): Promise<PlanoData | null> => {
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
        perfilFisiologico: {
          historico_intestinal: form.historicoIntestinal || null,
          fermentados_atual: form.fermentadosAtual || null,
          sensibilidade_insulina: form.sensibilidadeInsulina || null,
          objetivos_secundarios: form.objetivosSecundarios,
          variedade_funcional: form.variedadeFuncional,
          protocolo_microbiota: form.protocoloMicrobiota,
          cycling_carbo: form.cyclingCarbo,
          modo_economico: modoEcon,
          medidas_caseiras: form.medidasCaseiras,
          medidas_preferencias: form.medidasCaseiras ? form.medidasPrefs : null,
          perfil_economico: form.perfilEconomico,
          alimentos_disponiveis: form.alimentosDisponiveis,
          outros_alimentos: form.outrosAlimentos || null,
        },
      },
    });
    if (fnError) throw fnError;
    if (!data?.plan) throw new Error("Resposta inválida da IA");
    return data.plan as PlanoData;
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

  const tentarNovamente = async () => {
    setRetrying(true);
    await gerar();
  };

  // Soma calórica total das refeições do plano (fallback caso ajuste_calorico não esteja disponível)
  const sumKcalRefeicoes = (refs: any[] | undefined): number => {
    if (!Array.isArray(refs)) return 0;
    return refs.reduce((acc, r) => acc + (Number(r?.calorias) || 0), 0);
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
      toast({ title: "Plano salvo ✅", description: "Disponível no histórico do coach." });
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

  const exportPDF = () => {
    if (!plano) return;
    const r = plano.resumo;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Plano Alimentar - ${r.nome}</title>
    <style>
      body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1a1a1a}
      h1{color:#10b981;border-bottom:2px solid #10b981;padding-bottom:8px}
      .meta{display:flex;gap:24px;margin:16px 0;flex-wrap:wrap}
      .meta-box{background:#f0fdf4;padding:12px 20px;border-radius:8px;text-align:center}
      .meta-box span{font-size:24px;font-weight:bold;color:#059669;display:block}
      .meal{background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:12px 0}
      .meal h3{margin:0 0 8px;color:#065f46}
      .alimento{padding:6px 0;border-bottom:1px dashed #e5e7eb}
      .alimento:last-child{border-bottom:none}
      .subs{margin:6px 0 4px 14px;padding:8px;background:#ecfdf5;border:1px dashed #10b98155;border-radius:6px}
      .subs-title{font-size:10px;color:#059669;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
      .subs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px}
      .sub-card{background:#fff;border:1px solid #d1fae5;border-radius:6px;padding:6px 8px;font-size:11px}
      .sub-badge{display:inline-block;font-size:9px;padding:1px 6px;border-radius:999px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}
      .sub-name{font-weight:600;color:#1f2937}
      .sub-qty{color:#6b7280;font-size:10px}
      .sub-obs{color:#9ca3af;font-size:9px;font-style:italic;margin-top:2px}
      .macros{display:flex;gap:16px;margin-top:8px;font-size:13px;color:#6b7280}
      .tip{font-style:italic;color:#059669;font-size:12px;margin-top:6px}
      .footer{margin-top:32px;text-align:center;color:#9ca3af;font-size:11px}
    </style></head><body>
      <h1>🥗 Plano Alimentar — ${r.nome}</h1>
      <p>Objetivo: ${r.objetivo} | Calorias: ${r.calorias_totais} kcal | P: ${r.proteina_total}g | C: ${r.carboidrato_total}g | G: ${r.gordura_total}g</p>
      <div class="meta">
        <div class="meta-box"><span>${r.tmb}</span>TMB (kcal)</div>
        <div class="meta-box"><span>${r.get}</span>GET (kcal)</div>
        <div class="meta-box"><span>${r.calorias_totais}</span>VET (kcal)</div>
        <div class="meta-box"><span>${r.imc}</span>IMC</div>
      </div>
      ${glut4Text ? `
        <div style="background:#f0fdf4;border:2px solid #4ade80;border-radius:10px;padding:16px;margin:16px 0;">
          <h3 style="color:#166534;margin:0 0 4px 0;">⚡ Pós-Treino Imediato — Janela GLUT-4</h3>
          <div style="font-size:11px;color:#166534;margin:0 0 10px 0;font-weight:600;">📌 Referência prescrita pelo coach: ${({dextrose:"Dextrose pura",tamaras:"Tâmaras Medjool",pao_frances:"Pão francês",pao_branco:"Pão de forma branco",doce_de_leite:"Doce de leite light",mel:"Mel puro",geleia:"Geleia açucarada com pão",leite_condensado:"Leite condensado desnatado",banana:"Banana bem madura",coca:"Coca-Cola (competição)",maltodextrina:"Maltodextrina"} as Record<string,string>)[form.glut4CarbSource] || form.glut4CarbSource}</div>
          <pre style="white-space:pre-wrap;font-family:inherit;font-size:12px;color:#1f2937;margin:0;line-height:1.6;">${glut4Text.replace(/</g, "&lt;")}</pre>
        </div>
      ` : ""}
      ${plano.refeicoes.map(m => `
        <div class="meal">
          <h3>${m.refeicao} — ${m.horario || ""}</h3>
          ${m.alimentos?.map(a => {
            const subs = (a.substituicoes || []).map(s => ({ ...s, grupo: inferGrupo(s) }));
            return `
            <div class="alimento">
              <div><b>${a.alimento}</b> — ${a.quantidade || ""}${a.observacao ? ` <i style="color:#6b7280">(${a.observacao})</i>` : ""}</div>
              ${subs.length ? `
                <div class="subs">
                  <div class="subs-title">⇄ Substitutos isocalóricos</div>
                  <div class="subs-grid">
                    ${subs.map(s => {
                      const meta = GRUPO_META[(s.grupo as GrupoSub) || "outro"];
                      return `<div class="sub-card">
                        <span class="sub-badge" style="background:${meta.color}22;color:${meta.color}">${meta.emoji} ${meta.label}</span>
                        <div class="sub-name">${s.alimento}</div>
                        ${s.quantidade ? `<div class="sub-qty">${s.quantidade}</div>` : ""}
                        ${s.observacao ? `<div class="sub-obs">${s.observacao}</div>` : ""}
                      </div>`;
                    }).join("")}
                  </div>
                </div>
              ` : ""}
            </div>
          `;}).join("") || ""}
          <div class="macros">🔥 ${m.calorias || 0} kcal | P: ${m.macros?.proteina || 0}g | C: ${m.macros?.carboidrato || 0}g | G: ${m.macros?.gordura || 0}g</div>
        </div>
      `).join("")}
      ${plano.suplementacao?.length ? `<h2>Suplementação</h2>${plano.suplementacao.map(s => `<div class="meal"><h3>${s.suplemento}</h3><p>Dose: ${s.dose} | Timing: ${s.timing}</p><p class="tip">${s.justificativa}</p></div>`).join("")}` : ""}
      ${plano.dica_mce ? `<h2>Método MCE</h2><p><b>Mindset:</b> ${plano.dica_mce.mindset}</p><p><b>Comportamento:</b> ${plano.dica_mce.comportamento}</p><p><b>Execução:</b> ${plano.dica_mce.execucao}</p>` : ""}
      <div class="footer">Gerado por NUTRION — Plataforma de Nutrição Inteligente</div>
    </body></html>`);
    w.document.close();
    w.print();
  };

  // ── LOADING ──
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
    const macroP = r.proteina_total && r.calorias_totais ? Math.round((r.proteina_total * 4 / r.calorias_totais) * 100) : 0;
    const macroC = r.carboidrato_total && r.calorias_totais ? Math.round((r.carboidrato_total * 4 / r.calorias_totais) * 100) : 0;
    const macroG = r.gordura_total && r.calorias_totais ? Math.round((r.gordura_total * 9 / r.calorias_totais) * 100) : 0;

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
                      const kcal = h.plano?.resumo?.calorias_totais;
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
          {/* Resumo cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 24 }}>
            {[
              { l: "Calorias", v: `${r.calorias_totais} kcal`, c: T.green },
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

          {/* Aviso de validação de timing peri-workout vs schedule */}
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
                  A IA gerou refeições com horário desalinhado do treino que você cadastrou. Considere regenerar ou ajustar manualmente.
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

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={async () => {
                      if (retrying || autoRetrying) return;
                      // 1) Snap nos horários peri-workout
                      const { refeicoes: novasRef, fixedCount } = autoFixPeriWorkoutTimings(
                        plano.refeicoes as any,
                        trainingSchedule,
                      );
                      if (fixedCount > 0) {
                        setPlano((prev) => prev ? ({ ...prev, refeicoes: novasRef as any }) : prev);
                        toast({
                          title: "✓ Horários ajustados",
                          description: `${fixedCount} refeição${fixedCount > 1 ? "ões" : ""} peri-workout reposicionada${fixedCount > 1 ? "s" : ""}.`,
                        });
                      }
                      // 2) Verifica banda calórica e regenera se necessário
                      const aj: any = (plano as any)?.ajuste_calorico;
                      const foraDaBanda = aj && aj.aplicado && !aj.dentro_da_banda;
                      if (foraDaBanda) {
                        toast({
                          title: "⚙️ Corrigindo calorias",
                          description: "Plano fora da banda ±3% — iniciando regeração até atingir a meta...",
                        });
                        await regerarAteAtingirMeta();
                        // 3) Re-snap nos horários do plano regenerado
                        setPlano((prev) => {
                          if (!prev) return prev;
                          const r = autoFixPeriWorkoutTimings(prev.refeicoes as any, trainingSchedule);
                          if (r.fixedCount === 0) return prev;
                          return { ...prev, refeicoes: r.refeicoes as any };
                        });
                      } else if (fixedCount === 0) {
                        toast({ title: "Nada a corrigir", description: "Plano já está alinhado em horários e calorias." });
                      } else {
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
              { l: "Calorias", a: rA.calorias_totais, b: rB.calorias_totais, unit: "kcal" },
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

          {/* Refeições */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 1, background: T.green }} />
              Refeições do dia
            </div>
            {plano.refeicoes?.map((m, i) => (
              <MealCard
                key={i}
                meal={m}
                index={i}
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
                    meal.alimentos[alimentoIdx] = {
                      alimento: sub.alimento,
                      quantidade: sub.quantidade,
                      observacao: sub.observacao,
                      substituicoes: [
                        { alimento: original.alimento, quantidade: original.quantidade, observacao: original.observacao, grupo: (sub as any).grupo },
                        ...otherSubs,
                      ],
                    };
                    return next;
                  });
                  setSavedId(null);
                  toast({ title: "Alimento trocado ✅", description: `${sub.alimento} aplicado ao plano.` });
                }}
              />
            ))}
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
      </div>
    );
  }

  // ── FORM ──
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
          onClick={() => { setShowHistory(true); loadHistory(); }}
          style={{ padding: "8px 16px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
        >
          🗂️ Histórico
        </button>
      </div>

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
                    const kcal = h.plano?.resumo?.calorias_totais;
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
              <Label>% Gordura corporal atual</Label>
              <InputField type="number" placeholder="Ex: 14" value={form.bfAtual} onChange={e => set("bfAtual", e.target.value)} />
            </div>
            <div>
              <Label>% Gordura corporal meta</Label>
              <InputField type="number" placeholder="Ex: 8" value={form.bfMeta} onChange={e => set("bfMeta", e.target.value)} />
            </div>
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
