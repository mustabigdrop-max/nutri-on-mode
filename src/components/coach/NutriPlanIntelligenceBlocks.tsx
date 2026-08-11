import React from "react";
import { Zap, Dna, Activity, Brain } from "lucide-react";
import {
  QUICK_PROFILES, SOMATOTIPOS, TOLERANCIA_CHO, VELOCIDADE_DIGESTIVA,
  SINTOMAS_DIGESTIVOS, NIVEIS_ESTRESSE_INTEL, OVERTRAINING_OPTS,
  type IntelState, type QuickProfile,
} from "./nutriplanIntelligence";

const GOLD = "#B8922A";
const EMERALD = "#00C896";
const TEXT = "#E8E8E8";
const MUTED = "#8A8A8A";
const MONO = "'Space Mono', ui-monospace, monospace";

const label: React.CSSProperties = {
  fontFamily: MONO, fontSize: 9, fontWeight: 700, color: GOLD,
  letterSpacing: ".22em", textTransform: "uppercase",
};

const box: React.CSSProperties = {
  marginBottom: 16, padding: "16px 18px",
  background: "#06060a", border: "1px solid #1a1a22",
};

function Chip({ active, onClick, children, accent = EMERALD }: {
  active: boolean; onClick: () => void; children: React.ReactNode; accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "7px 12px", cursor: "pointer", borderRadius: 0,
        background: active ? `${accent}15` : "#020205",
        border: `1px solid ${active ? accent : "#ffffff14"}`,
        color: active ? accent : "#8a8a8a",
        fontSize: 12, fontFamily: "inherit", fontWeight: 600, transition: "all .15s",
      }}
    >{children}</button>
  );
}

// ─── 1.1 QUICK CLIENT ────────────────────────────────────────────────────────
export function QuickClientBar({ onApply }: { onApply: (p: QuickProfile) => void }) {
  return (
    <div style={{ ...box, borderLeft: `2px solid ${GOLD}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Zap size={12} strokeWidth={2} color={GOLD} />
        <span style={label}>Perfil rápido</span>
        <span style={{ fontSize: 11, color: MUTED }}>— preenche 80% do formulário em 1 clique</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {QUICK_PROFILES.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => onApply(p)}
            style={{
              padding: "8px 13px", cursor: "pointer", borderRadius: 0,
              background: "#020205", border: `1px solid ${GOLD}44`, color: TEXT,
              fontSize: 12, fontWeight: 600, fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span>{p.emoji}</span>{p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 3.2 SOMATOTIPO ──────────────────────────────────────────────────────────
export function BlocoSomatotipo({ value, onChange }: {
  value: IntelState; onChange: (v: Partial<IntelState>) => void;
}) {
  return (
    <div style={{ ...box, borderLeft: `2px solid ${EMERALD}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Dna size={12} strokeWidth={2} color={EMERALD} />
        <span style={{ ...label, color: EMERALD }}>Somatotipo predominante</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {SOMATOTIPOS.map(s => (
          <Chip key={s.v} active={value.somatotipo === s.v}
            onClick={() => onChange({ somatotipo: value.somatotipo === s.v ? "" : s.v })}>
            {s.l}
          </Chip>
        ))}
      </div>
      {value.somatotipo && (
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>
          {SOMATOTIPOS.find(s => s.v === value.somatotipo)?.d}
        </div>
      )}
      <div style={{ ...label, color: MUTED, marginBottom: 8 }}>Tolerância a carboidratos</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {TOLERANCIA_CHO.map(t => (
          <Chip key={t.v} active={value.toleranciaCho === t.v}
            onClick={() => onChange({ toleranciaCho: value.toleranciaCho === t.v ? "" : t.v })}>
            {t.l}
          </Chip>
        ))}
      </div>
    </div>
  );
}

// ─── 3.5 PERFIL DIGESTIVO ────────────────────────────────────────────────────
export function BlocoPerfilDigestivo({ value, onChange }: {
  value: IntelState; onChange: (v: Partial<IntelState>) => void;
}) {
  const toggle = (s: string) => onChange({
    sintomasDigestivos: value.sintomasDigestivos.includes(s)
      ? value.sintomasDigestivos.filter(x => x !== s)
      : [...value.sintomasDigestivos, s],
  });
  return (
    <div style={{ ...box, borderLeft: "2px solid #7890ff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Activity size={12} strokeWidth={2} color="#7890ff" />
        <span style={{ ...label, color: "#7890ff" }}>Perfil digestivo</span>
      </div>
      <div style={{ ...label, color: MUTED, marginBottom: 8 }}>Velocidade digestiva percebida</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {VELOCIDADE_DIGESTIVA.map(v => (
          <Chip key={v.v} accent="#7890ff" active={value.velocidadeDigestiva === v.v}
            onClick={() => onChange({ velocidadeDigestiva: value.velocidadeDigestiva === v.v ? "" : v.v })}>
            {v.l}
          </Chip>
        ))}
      </div>
      <div style={{ ...label, color: MUTED, marginBottom: 8 }}>Sintomas frequentes</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SINTOMAS_DIGESTIVOS.map(s => (
          <Chip key={s} accent="#7890ff" active={value.sintomasDigestivos.includes(s)} onClick={() => toggle(s)}>
            {s}
          </Chip>
        ))}
      </div>
    </div>
  );
}

// ─── 2.4 PERFIL AUTONÔMICO ───────────────────────────────────────────────────
export function BlocoPerfilAutonomico({ value, onChange }: {
  value: IntelState; onChange: (v: Partial<IntelState>) => void;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#020205", border: "1px solid #ffffff14",
    padding: "9px 11px", color: TEXT, fontSize: 13, outline: "none", fontFamily: "inherit",
  };
  const alerta = value.nivelEstresse === "alto" || value.nivelEstresse === "burnout" || value.overtraining === "sim";
  return (
    <div style={{ ...box, borderLeft: "2px solid #00f0b4" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Brain size={12} strokeWidth={2} color="#00f0b4" />
        <span style={{ ...label, color: "#00f0b4" }}>Estado autonômico / estresse</span>
      </div>
      <div style={{ ...label, color: MUTED, marginBottom: 8 }}>Nível de estresse atual</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {NIVEIS_ESTRESSE_INTEL.map(n => (
          <Chip key={n.v} accent="#00f0b4" active={value.nivelEstresse === n.v}
            onClick={() => onChange({ nivelEstresse: value.nivelEstresse === n.v ? "" : n.v })}>
            {n.l}
          </Chip>
        ))}
      </div>
      <div style={{ ...label, color: MUTED, marginBottom: 8 }}>Sinais de overtraining</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {OVERTRAINING_OPTS.map(o => (
          <Chip key={o.v} accent="#00f0b4" active={value.overtraining === o.v}
            onClick={() => onChange({ overtraining: value.overtraining === o.v ? "" : o.v })}>
            {o.l}
          </Chip>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div style={{ ...label, color: MUTED, marginBottom: 6 }}>HRV médio (ms)</div>
          <input style={inputStyle} type="number" value={value.hrv}
            placeholder="Ex: 62" onChange={e => onChange({ hrv: e.target.value })} />
        </div>
        <div>
          <div style={{ ...label, color: MUTED, marginBottom: 6 }}>Recovery score (%)</div>
          <input style={inputStyle} type="number" value={value.recoveryScore}
            placeholder="WHOOP / Oura" onChange={e => onChange({ recoveryScore: e.target.value })} />
        </div>
      </div>
      {alerta && (
        <div style={{
          marginTop: 12, padding: "10px 12px", background: "rgba(255,107,0,.06)",
          border: "1px solid rgba(255,107,0,.3)", fontSize: 12, color: "#FFB27A", lineHeight: 1.6,
        }}>
          ⚠️ Sistema nervoso simpático dominante — a IA reduzirá o déficit em 5–10%, priorizará
          magnésio, adaptógenos e carboidrato na última refeição para modular o cortisol noturno.
        </div>
      )}
    </div>
  );
}
