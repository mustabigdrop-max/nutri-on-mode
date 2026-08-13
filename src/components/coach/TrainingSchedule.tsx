import { useState } from "react";

// ─── Design tokens (alinhados ao PlanoAlimentarIA) ─────────────────────────────
const T = {
  bg2:     "#111811",
  bg3:     "#161e16",
  card:    "#0f1a0f",
  border:  "#1f2e1f",
  border2: "#2a3d2a",
  green:   "#4ade80",
  greenBg: "#0d1f0d",
  text:    "#e8f0e8",
  muted:   "#6b8f6b",
  muted2:  "#4a634a",
  amber:   "#fbbf24",
  blue:    "#60a5fa",
};

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type DayKey = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

export interface TrainingDay {
  is_training_day: boolean;
  modality?: string;       // ex: "musculacao", "cardio_liss", "hiit", "luta"
  muscle_group?: string;   // ex: "peito_triceps", "pernas", "costas_biceps", "ombro_abdomen"
  time?: string;           // HH:mm
  duration_min?: number;   // 30..180
  intensity?: "leve" | "moderada" | "alta" | "muito_alta";
  notes?: string;
}

export interface WeeklySchedule {
  base: Record<DayKey, TrainingDay>;
  cardio_separated: boolean;          // cardio em sessão separada
  double_session_days: DayKey[];      // dias com 2 sessões
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const emptyDay: TrainingDay = { is_training_day: false };

export const defaultWeeklySchedule: WeeklySchedule = {
  base: {
    seg: { is_training_day: true, modality: "musculacao", muscle_group: "peito_triceps", time: "07:00", duration_min: 60, intensity: "alta" },
    ter: { is_training_day: true, modality: "musculacao", muscle_group: "costas_biceps", time: "07:00", duration_min: 60, intensity: "alta" },
    qua: { is_training_day: true, modality: "musculacao", muscle_group: "pernas", time: "07:00", duration_min: 75, intensity: "muito_alta" },
    qui: { is_training_day: true, modality: "musculacao", muscle_group: "ombro_abdomen", time: "07:00", duration_min: 60, intensity: "moderada" },
    sex: { is_training_day: true, modality: "musculacao", muscle_group: "fullbody", time: "07:00", duration_min: 60, intensity: "alta" },
    sab: { ...emptyDay },
    dom: { ...emptyDay },
  },
  cardio_separated: false,
  double_session_days: [],
};

const DAY_LABEL: Record<DayKey, string> = {
  seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta",
  sex: "Sexta", sab: "Sábado", dom: "Domingo",
};
const DAY_ORDER: DayKey[] = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

const MODALITIES = [
  { v: "musculacao", l: "Musculação" },
  { v: "cardio_liss", l: "Cardio LISS" },
  { v: "cardio_zona2", l: "Cardio Zona 2" },
  { v: "hiit", l: "HIIT" },
  { v: "funcional", l: "Funcional / CrossFit" },
  { v: "corrida", l: "Corrida" },
  { v: "natacao", l: "Natação" },
  { v: "luta", l: "Luta / Artes marciais" },
  { v: "ciclismo", l: "Ciclismo" },
  { v: "misto", l: "Misto (força + cardio)" },
];

const MUSCLE_GROUPS = [
  { v: "peito_triceps", l: "Peito + Tríceps" },
  { v: "costas_biceps", l: "Costas + Bíceps" },
  { v: "pernas", l: "Pernas (quadríceps/posterior)" },
  { v: "ombro_abdomen", l: "Ombro + Abdômen" },
  { v: "gluteos_posterior", l: "Glúteos + Posterior" },
  { v: "fullbody", l: "Full Body" },
  { v: "upper", l: "Upper (membros superiores)" },
  { v: "lower", l: "Lower (membros inferiores)" },
  { v: "push", l: "Push" },
  { v: "pull", l: "Pull" },
];

const INTENSITIES: { v: TrainingDay["intensity"]; l: string }[] = [
  { v: "leve", l: "Leve" },
  { v: "moderada", l: "Moderada" },
  { v: "alta", l: "Alta" },
  { v: "muito_alta", l: "Muito alta" },
];

// ─── Helpers UI ───────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", background: T.bg3, border: `1px solid ${T.border2}`,
  borderRadius: 8, padding: "7px 10px", color: T.text, fontSize: 12,
  outline: "none", fontFamily: "inherit",
};
const tinyLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, color: T.muted, textTransform: "uppercase",
  letterSpacing: "0.08em", display: "block", marginBottom: 4,
};

interface Props {
  value: WeeklySchedule;
  onChange: (next: WeeklySchedule) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────
export const TrainingSchedule = ({ value, onChange }: Props) => {
  const [activeDay, setActiveDay] = useState<DayKey>("seg");

  const updateDay = (day: DayKey, patch: Partial<TrainingDay>) => {
    onChange({
      ...value,
      base: { ...value.base, [day]: { ...value.base[day], ...patch } },
    });
  };

  const toggleTrainingDay = (day: DayKey) => {
    const cur = value.base[day];
    if (cur.is_training_day) {
      updateDay(day, { is_training_day: false });
    } else {
      updateDay(day, {
        is_training_day: true,
        modality: cur.modality || "musculacao",
        muscle_group: cur.muscle_group || "fullbody",
        time: cur.time || "07:00",
        duration_min: cur.duration_min || 60,
        intensity: cur.intensity || "moderada",
      });
    }
  };

  const toggleDoubleSession = (day: DayKey) => {
    const has = value.double_session_days.includes(day);
    onChange({
      ...value,
      double_session_days: has
        ? value.double_session_days.filter((d) => d !== day)
        : [...value.double_session_days, day],
    });
  };

  const day = value.base[activeDay];
  const isTraining = day.is_training_day;
  const isDouble = value.double_session_days.includes(activeDay);

  const totalTrainingDays = DAY_ORDER.filter((d) => value.base[d].is_training_day).length;

  return (
    <div>
      {/* Resumo da semana */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 12px", background: T.greenBg, border: `1px solid ${T.border2}`,
        borderRadius: 8, marginBottom: 14, flexWrap: "wrap", gap: 8,
      }}>
        <span style={{ fontSize: 11, color: T.green, fontWeight: 700 }}>
          🗓️ {totalTrainingDays}x/semana · {7 - totalTrainingDays} dia(s) de descanso
          {value.double_session_days.length > 0 && ` · ${value.double_session_days.length} dia(s) com 2 sessões`}
        </span>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.muted, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={value.cardio_separated}
            onChange={(e) => onChange({ ...value, cardio_separated: e.target.checked })}
            style={{ accentColor: T.green }}
          />
          Cardio em sessão separada do treino
        </label>
      </div>

      {/* Tabs por dia */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {DAY_ORDER.map((d) => {
          const t = value.base[d].is_training_day;
          const active = activeDay === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setActiveDay(d)}
              style={{
                flex: "1 1 60px", minWidth: 60, padding: "8px 4px", borderRadius: 8,
                border: `1px solid ${active ? T.green : T.border2}`,
                background: active ? T.greenBg : T.bg3,
                color: active ? T.green : t ? T.text : T.muted2,
                fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                position: "relative",
              }}
            >
              <div style={{ fontSize: 10, opacity: 0.7 }}>{DAY_LABEL[d].slice(0, 3)}</div>
              <div style={{ marginTop: 2, fontSize: 14 }}>{t ? "💪" : "💤"}</div>
            </button>
          );
        })}
      </div>

      {/* Editor do dia ativo */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
            {DAY_LABEL[activeDay]}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <span style={{ fontSize: 11, color: T.muted }}>Dia de treino?</span>
            <button
              type="button"
              onClick={() => toggleTrainingDay(activeDay)}
              style={{
                width: 40, height: 22, borderRadius: 999, position: "relative",
                background: isTraining ? T.green : T.bg3,
                border: `1px solid ${isTraining ? T.green : T.border2}`,
                cursor: "pointer", padding: 0,
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                background: isTraining ? "#0a0f0a" : T.muted,
                position: "absolute", top: 2, left: isTraining ? 20 : 2,
                transition: "all .2s",
              }} />
            </button>
          </label>
        </div>

        {!isTraining ? (
          <div style={{
            padding: "20px 12px", textAlign: "center",
            background: T.bg2, borderRadius: 8, border: `1px dashed ${T.border2}`,
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>💤</div>
            <div style={{ fontSize: 12, color: T.muted }}>
              Dia de descanso · plano será adaptado (–10 a 15% carbo, +ômega-3)
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <label style={tinyLabel}>Modalidade</label>
                <select
                  value={day.modality || "musculacao"}
                  onChange={(e) => updateDay(activeDay, { modality: e.target.value })}
                  style={inputStyle}
                >
                  {MODALITIES.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
                </select>
              </div>
              <div>
                <label style={tinyLabel}>Grupo muscular / foco</label>
                <select
                  value={day.muscle_group || "fullbody"}
                  onChange={(e) => updateDay(activeDay, { muscle_group: e.target.value })}
                  style={inputStyle}
                  disabled={!["musculacao", "funcional", "misto"].includes(day.modality || "")}
                >
                  {MUSCLE_GROUPS.map((g) => <option key={g.v} value={g.v}>{g.l}</option>)}
                </select>
              </div>
              <div>
                <label style={tinyLabel}>Horário</label>
                <input
                  type="time"
                  value={day.time || "07:00"}
                  onChange={(e) => updateDay(activeDay, { time: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={tinyLabel}>Duração (min)</label>
                <input
                  type="number"
                  min={15} max={240} step={5}
                  value={day.duration_min || 60}
                  onChange={(e) => updateDay(activeDay, { duration_min: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={tinyLabel}>Intensidade</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {INTENSITIES.map((it) => {
                  const active = day.intensity === it.v;
                  return (
                    <button
                      key={it.v}
                      type="button"
                      onClick={() => updateDay(activeDay, { intensity: it.v })}
                      style={{
                        padding: "5px 12px", borderRadius: 999, fontSize: 11,
                        border: `1px solid ${active ? T.amber : T.border2}`,
                        background: active ? `${T.amber}22` : "transparent",
                        color: active ? T.amber : T.muted,
                        cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
                      }}
                    >
                      {it.l}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={tinyLabel}>Observações (opcional)</label>
              <input
                type="text"
                value={day.notes || ""}
                onChange={(e) => updateDay(activeDay, { notes: e.target.value })}
                placeholder="Ex: foco em volume, deload, técnica…"
                style={inputStyle}
              />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", paddingTop: 4 }}>
              <input
                type="checkbox"
                checked={isDouble}
                onChange={() => toggleDoubleSession(activeDay)}
                style={{ accentColor: T.green }}
              />
              <span style={{ fontSize: 11, color: T.muted }}>
                Sessão dupla (AM + PM) · plano usará distribuição peri-workout duplicada
              </span>
            </label>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Prompt builder (injetado no payload do sistema) ───────────────────────────────
const labelOf = (arr: { v: string; l: string }[], v?: string) =>
  arr.find((x) => x.v === v)?.l || v || "—";

export const buildTrainingSchedulePrompt = (
  schedule: WeeklySchedule,
  weightKg?: number,
  tdee?: number,
): string => {
  const lines: string[] = [];
  lines.push("ROTINA DE TREINO SEMANAL DETALHADA (use para distribuir refeições peri-workout e separar planos treino/descanso):");
  lines.push("");

  for (const d of DAY_ORDER) {
    const day = schedule.base[d];
    const dbl = schedule.double_session_days.includes(d) ? " · SESSÃO DUPLA" : "";
    if (!day.is_training_day) {
      lines.push(`- ${DAY_LABEL[d]}: DESCANSO (reduzir carbo 10–15%, manter proteína, +ômega-3)${dbl}`);
      continue;
    }
    const parts = [
      labelOf(MODALITIES, day.modality),
      day.muscle_group ? labelOf(MUSCLE_GROUPS, day.muscle_group) : null,
      day.time ? `time=${day.time}` : null,
      day.duration_min ? `duration_min=${day.duration_min}` : null,
      day.intensity ? `intensidade ${day.intensity}` : null,
      day.notes ? `obs: ${day.notes}` : null,
    ].filter(Boolean).join(" · ");
    lines.push(`- ${DAY_LABEL[d]}: TREINO · ${parts}${dbl}`);
  }

  // Resumo de horários distintos para o sistema
  const trainingDays = DAY_ORDER
    .map((d) => ({ d, day: schedule.base[d] }))
    .filter((x) => x.day.is_training_day && x.day.time);
  const distinctTimes = Array.from(new Set(trainingDays.map((x) => x.day.time!)));

  lines.push("");
  if (distinctTimes.length === 1) {
    lines.push(`⏰ HORÁRIO ÚNICO DE TREINO DA SEMANA: ${distinctTimes[0]} — ancore TODAS as refeições peri-workout neste horário (NUNCA use 05:30/07:00 default).`);
  } else if (distinctTimes.length > 1) {
    lines.push(`⏰ HORÁRIOS DISTINTOS DE TREINO DETECTADOS: ${distinctTimes.join(", ")}`);
    lines.push("Gere UM SUB-PLANO POR HORÁRIO distinto, nomeando-o com o horário real (ex: 'PLANO — DIA DE TREINO 18:00'). Mapeamento dia → horário:");
    for (const { d, day } of trainingDays) {
      lines.push(`   • ${DAY_LABEL[d]} → ${day.time} (${day.duration_min || 60}min)`);
    }
  } else {
    lines.push("⚠️ Nenhum horário de treino informado — use horários peri-workout neutros e avise no observacao_protocolo.");
  }

  lines.push("");
  lines.push(`Cardio em sessão separada: ${schedule.cardio_separated ? "SIM" : "NÃO"}`);

  lines.push("");
  lines.push("INSTRUÇÕES OBRIGATÓRIAS DE ADAPTAÇÃO:");
  lines.push("1. Gere DOIS sub-planos quando aplicável: 'PLANO — DIA DE TREINO' e 'PLANO — DIA DE DESCANSO'.");
  lines.push("2. Em dias de TREINO, posicione refeições peri-workout (pré, intra opcional, pós-treino imediato e pós-treino sólido) ao redor do HORÁRIO REAL (time) do treino — JAMAIS use horários default (05:30/07:00) se o coach informou outro time.");
  lines.push("3. Em dias de PERNAS / LOWER, eleve carboidrato em +10–15% no dia (priorizando peri-workout).");
  lines.push("4. Em dias de PUSH/PULL/UPPER, mantenha proteína alta distribuída em todas as refeições.");
  lines.push("5. Em dias de CARDIO puro (sem musculação), reduza carbo do dia em 5–10% e aumente gordura boa.");
  lines.push("6. Em dias de DESCANSO, reduza carbo 10–15% e mantenha proteína integral.");
  lines.push("7. Sessões DUPLAS (AM+PM): distribua 40% AM, 35% peri-treino PM, 25% noite.");
  if (weightKg) lines.push(`8. Use peso ${weightKg}kg como referência para gramagem peri-workout (CHO 0.5–1.2g/kg conforme intensidade).`);
  if (tdee) lines.push(`9. TDEE base de referência: ${tdee} kcal — redistribua, não ultrapasse a meta diária.`);

  return lines.join("\n");
};

export default TrainingSchedule;
