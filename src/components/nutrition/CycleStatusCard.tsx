import { useState } from "react";
import { Zap, Settings2, Check } from "lucide-react";
import { NP, mono, labelStyle, cardStyle } from "./theme";
import type { CycleState, PeriodizationConfig, RefeedTarget } from "@/lib/nutritionPeriodization";

interface Props {
  cycle: CycleState;
  config: PeriodizationConfig;
  onChange: (next: PeriodizationConfig) => void;
  /** Delta de kcal do refeed vs déficit. */
  kcalDelta?: number;
  carbsDelta?: number;
  compact?: boolean;
}

/** FEATURE 1 — Ciclagem de déficit + refeeds automáticos. */
export default function CycleStatusCard({ cycle, config, onChange, kcalDelta = 0, carbsDelta = 0, compact }: Props) {
  const [editing, setEditing] = useState(false);
  const c = config.cycle;
  const refeed = cycle.isRefeed;
  const accent = refeed ? NP.gold : NP.teal;

  const dots = Array.from({ length: cycle.cycleLength }, (_, i) => {
    const isRefeedSlot = i >= c.deficit_days;
    const isCurrent = i === cycle.index;
    return { isRefeedSlot, isCurrent };
  });

  const set = (patch: Partial<typeof c>) => onChange({ ...config, cycle: { ...c, ...patch } });

  return (
    <div
      style={{
        ...cardStyle,
        border: `1px solid ${refeed ? NP.gold : NP.border}`,
        background: refeed ? "linear-gradient(180deg, rgba(184,146,42,.10), #06060e)" : NP.card,
        boxShadow: refeed ? `0 0 22px rgba(184,146,42,.18)` : "none",
        padding: compact ? 14 : 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ ...labelStyle, color: accent }}>Ciclagem de déficit</p>
        <button
          onClick={() => setEditing((v) => !v)}
          style={{ background: "transparent", border: "none", color: NP.muted, cursor: "pointer", padding: 2, display: "flex" }}
          aria-label="Configurar ciclo"
        >
          {editing ? <Check style={{ width: 14, height: 14 }} /> : <Settings2 style={{ width: 14, height: 14 }} />}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        {refeed && <Zap style={{ width: 20, height: 20, color: NP.gold }} />}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 900, color: refeed ? NP.gold : NP.text, margin: 0, fontFamily: mono, letterSpacing: "0.02em" }}>
            {cycle.enabled ? cycle.label : "Déficit linear (sem refeeds)"}
            {refeed ? " 🔄" : ""}
          </p>
          <p style={{ fontSize: 10, color: NP.muted, fontFamily: mono, margin: "3px 0 0" }}>
            {refeed
              ? `Carboidrato elevado · ${c.refeed_target === "LEVE_SUPERAVIT" ? "TDEE +5%" : "manutenção"}`
              : `${c.deficit_days} dias déficit · ${c.refeed_days} refeed`}
          </p>
        </div>
        {refeed && (kcalDelta !== 0 || carbsDelta !== 0) && (
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 13, fontWeight: 900, color: NP.gold, fontFamily: mono, margin: 0 }}>+{kcalDelta}</p>
            <p style={{ fontSize: 9, color: NP.muted, fontFamily: mono, margin: 0 }}>kcal · +{carbsDelta}g carb</p>
          </div>
        )}
      </div>

      {/* Dots de progresso do ciclo */}
      <div style={{ display: "flex", gap: 4 }}>
        {dots.map((d, i) => (
          <div
            key={i}
            title={d.isRefeedSlot ? "Refeed" : "Déficit"}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              background: d.isCurrent
                ? d.isRefeedSlot ? NP.gold : NP.teal
                : d.isRefeedSlot ? NP.goldDim : NP.border,
              boxShadow: d.isCurrent ? `0 0 8px ${d.isRefeedSlot ? NP.gold : NP.teal}88` : "none",
            }}
          />
        ))}
      </div>

      {editing && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${NP.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...labelStyle, color: NP.muted }}>Ciclagem ativa</span>
            <input type="checkbox" checked={c.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
          </label>
          <Row label="Dias de déficit">
            <NumberPicker value={c.deficit_days} min={2} max={13} onChange={(v) => set({ deficit_days: v })} />
          </Row>
          <Row label="Dias de refeed">
            <NumberPicker value={c.refeed_days} min={0} max={3} onChange={(v) => set({ refeed_days: v })} />
          </Row>
          <Row label="Alvo do refeed">
            <div style={{ display: "flex", gap: 6 }}>
              {(["MANUTENCAO", "LEVE_SUPERAVIT"] as RefeedTarget[]).map((t) => (
                <button
                  key={t}
                  onClick={() => set({ refeed_target: t })}
                  style={{
                    padding: "5px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: mono,
                    fontSize: 9,
                    background: c.refeed_target === t ? NP.goldBg : "transparent",
                    border: `1px solid ${c.refeed_target === t ? NP.gold : NP.border}`,
                    color: c.refeed_target === t ? NP.gold : NP.muted,
                  }}
                >
                  {t === "MANUTENCAO" ? "MANUTENÇÃO" : "+5%"}
                </button>
              ))}
            </div>
          </Row>
          <Row label="Início do ciclo">
            <input
              type="date"
              value={c.cycle_start}
              onChange={(e) => set({ cycle_start: e.target.value })}
              style={{ background: NP.card2, border: `1px solid ${NP.border}`, color: NP.text, fontFamily: mono, fontSize: 10, padding: "4px 6px", borderRadius: 6 }}
            />
          </Row>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
      <span style={{ ...labelStyle, color: NP.muted }}>{label}</span>
      {children}
    </div>
  );
}

function NumberPicker({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const btn = {
    width: 22, height: 22, borderRadius: 6, cursor: "pointer",
    background: NP.card2, border: `1px solid ${NP.border}`, color: NP.text, fontFamily: mono, fontSize: 12,
  } as React.CSSProperties;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button style={btn} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span style={{ fontFamily: mono, fontSize: 12, color: NP.text, minWidth: 16, textAlign: "center" }}>{value}</span>
      <button style={btn} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}
