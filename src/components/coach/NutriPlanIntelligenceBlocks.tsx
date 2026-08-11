import React from "react";
import { Zap, Dna, Activity, Brain, History, TrendingUp, Utensils, FlaskConical, Sparkles, Moon, MapPin } from "lucide-react";
import {
  QUICK_PROFILES, SOMATOTIPOS, TOLERANCIA_CHO, VELOCIDADE_DIGESTIVA,
  SINTOMAS_DIGESTIVOS, NIVEIS_ESTRESSE_INTEL, OVERTRAINING_OPTS,
  DIETAS_ANTERIORES, MODOS_DIETA, PRIORIDADE_SACIEDADE, ESTRATEGIAS_SACIEDADE,
  computeMetabolicScore, LAB_MARKERS, analisarLabs, NUTRIENT_RULES,
  FASES_CICLO, FREQ_COMER_FORA, CONTEXTOS_COMER_FORA, METODOS_CALORIMETRIA,
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

// ═══════════════════════════════════════════════════════════════════════════
// FASE 2 — Histórico metabólico, Reverse Diet, Saciedade e Dia ON/OFF
// ═══════════════════════════════════════════════════════════════════════════

const inputBase: React.CSSProperties = {
  width: "100%", background: "#020205", border: "1px solid #ffffff14",
  padding: "9px 11px", color: TEXT, fontSize: 13, outline: "none", fontFamily: "inherit",
};

function Toggle({ on, onClick, children, accent = EMERALD }: {
  on: boolean; onClick: () => void; children: React.ReactNode; accent?: string;
}) {
  return (
    <button type="button" onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", cursor: "pointer",
      background: on ? `${accent}12` : "#020205", border: `1px solid ${on ? accent : "#ffffff14"}`,
      color: on ? accent : MUTED, fontSize: 12, fontWeight: 600, fontFamily: "inherit", textAlign: "left",
    }}>
      <span style={{
        width: 14, height: 14, flexShrink: 0, borderRadius: 3,
        border: `1px solid ${on ? accent : "#ffffff26"}`, background: on ? accent : "transparent",
        color: "#03030a", fontSize: 10, lineHeight: "13px", textAlign: "center", fontWeight: 900,
      }}>{on ? "✓" : ""}</span>
      {children}
    </button>
  );
}

// ─── 2.1 HISTÓRICO METABÓLICO + SCORE ────────────────────────────────────────
export function BlocoHistoricoMetabolico({ value, onChange, pesoKg }: {
  value: IntelState; onChange: (v: Partial<IntelState>) => void; pesoKg?: number;
}) {
  const ms = computeMetabolicScore(value, pesoKg);
  return (
    <div style={{ ...box, borderLeft: "2px solid #FF8C42" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <History size={12} strokeWidth={2} color="#FF8C42" />
        <span style={{ ...label, color: "#FF8C42" }}>Histórico metabólico</span>
        <span style={{ fontSize: 11, color: MUTED }}>— define o quão agressivo o plano pode ser</span>
      </div>

      <div style={{ ...label, color: MUTED, marginBottom: 8 }}>Dietas restritivas anteriores</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {DIETAS_ANTERIORES.map(d => (
          <Chip key={d.v} accent="#FF8C42" active={value.dietasAnteriores === d.v}
            onClick={() => onChange({ dietasAnteriores: value.dietasAnteriores === d.v ? "" : d.v })}>
            {d.l}
          </Chip>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ ...label, color: MUTED, marginBottom: 6 }}>Menor kcal sustentada</div>
          <input style={inputBase} type="number" placeholder="Ex: 1400" value={value.menorKcal}
            onChange={e => onChange({ menorKcal: e.target.value })} />
        </div>
        <div>
          <div style={{ ...label, color: MUTED, marginBottom: 6 }}>Meses em déficit</div>
          <input style={inputBase} type="number" placeholder="Ex: 6" value={value.mesesEmDeficit}
            onChange={e => onChange({ mesesEmDeficit: e.target.value })} />
        </div>
        <div>
          <div style={{ ...label, color: MUTED, marginBottom: 6 }}>Semanas sem refeed</div>
          <input style={inputBase} type="number" placeholder="Ex: 10" value={value.semanasSemRefeed}
            onChange={e => onChange({ semanasSemRefeed: e.target.value })} />
        </div>
        {value.efeitoSanfona && (
          <div>
            <div style={{ ...label, color: MUTED, marginBottom: 6 }}>Kg recuperados</div>
            <input style={inputBase} type="number" placeholder="Ex: 10" value={value.kgRecuperado}
              onChange={e => onChange({ kgRecuperado: e.target.value })} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Toggle accent="#FF8C42" on={value.efeitoSanfona} onClick={() => onChange({ efeitoSanfona: !value.efeitoSanfona })}>
          Efeito sanfona
        </Toggle>
        <Toggle accent="#FF8C42" on={value.usoTermogenicos} onClick={() => onChange({ usoTermogenicos: !value.usoTermogenicos })}>
          Termogênicos recorrentes
        </Toggle>
        <Toggle accent="#FF8C42" on={value.jejumFrequente} onClick={() => onChange({ jejumFrequente: !value.jejumFrequente })}>
          Jejum prolongado frequente
        </Toggle>
      </div>

      {ms && (
        <div style={{ marginTop: 16, padding: "14px 16px", background: "#020205", border: `1px solid ${ms.cor}44` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
            <div style={{
              width: 58, height: 58, flexShrink: 0, borderRadius: "50%",
              border: `2px solid ${ms.cor}`, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", background: `${ms.cor}10`,
            }}>
              <span style={{ fontSize: 19, fontWeight: 900, color: ms.cor, lineHeight: 1 }}>{ms.score}</span>
              <span style={{ fontSize: 8, color: MUTED, fontFamily: MONO }}>/100</span>
            </div>
            <div>
              <div style={{ ...label, color: MUTED, marginBottom: 4 }}>Metabolic Score</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: ms.cor }}>{ms.label}</div>
            </div>
          </div>
          {ms.riscos.length > 0 && (
            <ul style={{ margin: "0 0 10px", paddingLeft: 18, color: MUTED, fontSize: 11, lineHeight: 1.7 }}>
              {ms.riscos.map(r => <li key={r}>{r}</li>)}
            </ul>
          )}
          <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.6 }}>
            <strong style={{ color: ms.cor }}>Conduta: </strong>{ms.recomendacao}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 2.2 REVERSE DIET / DIET BREAK + DIA ON/OFF ──────────────────────────────
export function BlocoModoDieta({ value, onChange }: {
  value: IntelState; onChange: (v: Partial<IntelState>) => void;
}) {
  return (
    <div style={{ ...box, borderLeft: `2px solid ${GOLD}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <TrendingUp size={12} strokeWidth={2} color={GOLD} />
        <span style={{ ...label }}>Modo do plano</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {MODOS_DIETA.map(m => (
          <Chip key={m.v} accent={GOLD} active={value.modoDieta === m.v}
            onClick={() => onChange({ modoDieta: value.modoDieta === m.v ? "" : m.v })}>
            {m.l}
          </Chip>
        ))}
      </div>
      {value.modoDieta && (
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>
          {MODOS_DIETA.find(m => m.v === value.modoDieta)?.d}
        </div>
      )}

      {value.modoDieta === "reverse" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ ...label, color: MUTED, marginBottom: 6 }}>Incremento (kcal/semana)</div>
            <input style={inputBase} type="number" value={value.reverseIncremento}
              onChange={e => onChange({ reverseIncremento: e.target.value })} />
          </div>
          <div>
            <div style={{ ...label, color: MUTED, marginBottom: 6 }}>Duração (semanas)</div>
            <input style={inputBase} type="number" value={value.reverseSemanas}
              onChange={e => onChange({ reverseSemanas: e.target.value })} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <Toggle accent={GOLD} on={value.diaOnOff} onClick={() => onChange({ diaOnOff: !value.diaOnOff })}>
          Gerar dia ON (treino) e dia OFF (descanso)
        </Toggle>
        {value.diaOnOff && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: MUTED }}>− CHO no dia OFF:</span>
            <input style={{ ...inputBase, width: 78 }} type="number" value={value.deltaChoOff}
              onChange={e => onChange({ deltaChoOff: e.target.value })} />
            <span style={{ fontSize: 11, color: MUTED }}>%</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 2.3 ENGENHARIA DE SACIEDADE ─────────────────────────────────────────────
export function BlocoSaciedade({ value, onChange }: {
  value: IntelState; onChange: (v: Partial<IntelState>) => void;
}) {
  const toggle = (s: string) => onChange({
    estrategiasSaciedade: value.estrategiasSaciedade.includes(s)
      ? value.estrategiasSaciedade.filter(x => x !== s)
      : [...value.estrategiasSaciedade, s],
  });
  return (
    <div style={{ ...box, borderLeft: "2px solid #C77DFF" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Utensils size={12} strokeWidth={2} color="#C77DFF" />
        <span style={{ ...label, color: "#C77DFF" }}>Engenharia de saciedade</span>
      </div>
      <div style={{ ...label, color: MUTED, marginBottom: 8 }}>Prioridade</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {PRIORIDADE_SACIEDADE.map(p => (
          <Chip key={p.v} accent="#C77DFF" active={value.prioridadeSaciedade === p.v}
            onClick={() => onChange({ prioridadeSaciedade: value.prioridadeSaciedade === p.v ? "" : p.v })}>
            {p.l}
          </Chip>
        ))}
      </div>
      <div style={{ ...label, color: MUTED, marginBottom: 8 }}>Estratégias aplicadas ao plano</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {ESTRATEGIAS_SACIEDADE.map(s => (
          <Chip key={s} accent="#C77DFF" active={value.estrategiasSaciedade.includes(s)} onClick={() => toggle(s)}>
            {s}
          </Chip>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FASE 3 — Exames, Nutrient Intelligence, Ciclo, Comer fora e Calorimetria
// ═══════════════════════════════════════════════════════════════════════════

// ─── 3.1 EXAMES LABORATORIAIS ────────────────────────────────────────────────
export function BlocoExamesLaboratoriais({ value, onChange }: {
  value: IntelState; onChange: (v: Partial<IntelState>) => void;
}) {
  const labs = value.labs || {};
  const setLab = (k: string, v: string) => onChange({ labs: { ...labs, [k]: v } });
  const findings = analisarLabs(labs);
  const preenchidos = Object.values(labs).filter(v => String(v).trim() !== "").length;

  return (
    <div style={{ ...box, borderLeft: "2px solid #FF5C5C" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <FlaskConical size={12} strokeWidth={2} color="#FF5C5C" />
        <span style={{ ...label, color: "#FF5C5C" }}>Exames laboratoriais</span>
        <span style={{ fontSize: 11, color: MUTED }}>
          — opcional · {preenchidos} preenchido{preenchidos === 1 ? "" : "s"}
        </span>
      </div>
      <div style={{ fontSize: 11, color: MUTED, marginBottom: 14, lineHeight: 1.6 }}>
        Os marcadores alterados geram ajustes nutricionais automáticos no plano. Não substituem
        avaliação médica nem servem para prescrição de medicamentos.
      </div>

      {LAB_MARKERS.map(g => (
        <div key={g.grupo} style={{ marginBottom: 14 }}>
          <div style={{ ...label, color: g.cor, marginBottom: 8 }}>{g.grupo}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(148px,1fr))", gap: 10 }}>
            {g.itens.map(m => {
              const raw = labs[m.k];
              const v = Number(String(raw ?? "").replace(",", "."));
              const alterado = String(raw ?? "").trim() !== "" && Number.isFinite(v) &&
                ((m.min !== undefined && v < m.min) || (m.max !== undefined && v > m.max));
              return (
                <div key={m.k}>
                  <div style={{ fontSize: 11, color: alterado ? "#FF5C5C" : MUTED, marginBottom: 5 }}>
                    {m.l} <span style={{ opacity: .6 }}>({m.unit})</span>
                  </div>
                  <input
                    style={{ ...inputBase, borderColor: alterado ? "#FF5C5C66" : "#ffffff14" }}
                    type="number" inputMode="decimal"
                    placeholder={m.otimo ? `Ótimo ${m.otimo}` : `${m.min ?? ""}–${m.max ?? ""}`}
                    value={raw ?? ""}
                    onChange={e => setLab(m.k, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {findings.length > 0 && (
        <div style={{ marginTop: 6, padding: "13px 15px", background: "rgba(255,92,92,.05)", border: "1px solid rgba(255,92,92,.3)" }}>
          <div style={{ ...label, color: "#FF5C5C", marginBottom: 10 }}>
            {findings.length} marcador{findings.length === 1 ? "" : "es"} fora da faixa
          </div>
          {findings.map(f => (
            <div key={f.marker.k} style={{ marginBottom: 9, fontSize: 12, color: TEXT, lineHeight: 1.6 }}>
              <strong style={{ color: f.status === "alto" ? "#FF8C42" : "#7890ff" }}>
                {f.marker.l} {f.status === "alto" ? "↑" : "↓"} {f.valor}{f.marker.unit}
              </strong>
              <div style={{ color: MUTED, fontSize: 11 }}>{f.acao}</div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: MUTED, marginTop: 8, fontStyle: "italic" }}>
            Conduta exclusivamente nutricional. Encaminhe ao médico quando indicado.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 3.2 NUTRIENT INTELLIGENCE ───────────────────────────────────────────────
export function BlocoNutrientIntelligence() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ ...box, borderLeft: "2px solid #00C896" }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
      }}>
        <Sparkles size={12} strokeWidth={2} color={EMERALD} />
        <span style={{ ...label, color: EMERALD }}>Nutrient Intelligence</span>
        <span style={{ fontSize: 11, color: MUTED }}>— sinergias e antagonismos aplicados ao plano</span>
        <span style={{ marginLeft: "auto", color: MUTED, fontSize: 12 }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 10 }}>
          {NUTRIENT_RULES.map(r => (
            <div key={r.titulo} style={{
              padding: "10px 12px", background: "#020205",
              border: `1px solid ${r.tipo === "sinergia" ? `${EMERALD}33` : "#FF8C4233"}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: r.tipo === "sinergia" ? EMERALD : "#FF8C42", marginBottom: 4 }}>
                {r.tipo === "sinergia" ? "＋" : "✕"} {r.titulo}
              </div>
              <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>{r.detalhe}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 3.3 CICLO MENSTRUAL ─────────────────────────────────────────────────────
export function BlocoCicloMenstrual({ value, onChange }: {
  value: IntelState; onChange: (v: Partial<IntelState>) => void;
}) {
  const fase = FASES_CICLO.find(f => f.v === value.faseCiclo);
  const redS = value.faseCiclo === "amenorreia";
  return (
    <div style={{ ...box, borderLeft: "2px solid #FF80B5" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Moon size={12} strokeWidth={2} color="#FF80B5" />
        <span style={{ ...label, color: "#FF80B5" }}>Ciclo menstrual</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {FASES_CICLO.map(f => (
          <Chip key={f.v} accent="#FF80B5" active={value.faseCiclo === f.v}
            onClick={() => onChange({ faseCiclo: value.faseCiclo === f.v ? "" : f.v })}>
            {f.l}
          </Chip>
        ))}
      </div>
      {fase && (
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 12, lineHeight: 1.6 }}>{fase.d}</div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <Toggle accent="#FF80B5" on={value.cicloSincronizado} onClick={() => onChange({ cicloSincronizado: !value.cicloSincronizado })}>
          Sincronizar plano com as 4 fases
        </Toggle>
        <Toggle accent="#FF80B5" on={value.tpmIntensa} onClick={() => onChange({ tpmIntensa: !value.tpmIntensa })}>
          TPM intensa
        </Toggle>
        {value.cicloSincronizado && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: MUTED }}>Duração:</span>
            <input style={{ ...inputBase, width: 74 }} type="number" value={value.duracaoCiclo}
              onChange={e => onChange({ duracaoCiclo: e.target.value })} />
            <span style={{ fontSize: 11, color: MUTED }}>dias</span>
          </div>
        )}
      </div>
      {redS && (
        <div style={{
          marginTop: 12, padding: "10px 12px", background: "rgba(255,92,92,.06)",
          border: "1px solid rgba(255,92,92,.35)", fontSize: 12, color: "#FF9B9B", lineHeight: 1.6,
        }}>
          🚨 RED-S — amenorreia há mais de 3 meses. A IA NÃO prescreverá déficit calórico:
          o plano será montado para restaurar a disponibilidade energética, com encaminhamento médico.
        </div>
      )}
    </div>
  );
}

// ─── 3.4 / 3.5 COMER FORA + CALORIMETRIA ─────────────────────────────────────
export function BlocoVidaRealCalorimetria({ value, onChange }: {
  value: IntelState; onChange: (v: Partial<IntelState>) => void;
}) {
  const toggleCtx = (c: string) => onChange({
    contextosComerFora: value.contextosComerFora.includes(c)
      ? value.contextosComerFora.filter(x => x !== c)
      : [...value.contextosComerFora, c],
  });
  return (
    <div style={{ ...box, borderLeft: "2px solid #7890ff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <MapPin size={12} strokeWidth={2} color="#7890ff" />
        <span style={{ ...label, color: "#7890ff" }}>Vida real & gasto medido</span>
      </div>

      <div style={{ ...label, color: MUTED, marginBottom: 8 }}>Refeições fora de casa</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {FREQ_COMER_FORA.map(f => (
          <Chip key={f.v} accent="#7890ff" active={value.comerFora === f.v}
            onClick={() => onChange({ comerFora: value.comerFora === f.v ? "" : f.v })}>
            {f.l}
          </Chip>
        ))}
      </div>

      {value.comerFora && value.comerFora !== "raro" && (
        <>
          <div style={{ ...label, color: MUTED, marginBottom: 8 }}>Contextos mais frequentes</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {CONTEXTOS_COMER_FORA.map(c => (
              <Chip key={c} accent="#7890ff" active={value.contextosComerFora.includes(c)} onClick={() => toggleCtx(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
        <div>
          <div style={{ ...label, color: MUTED, marginBottom: 6 }}>Álcool (doses/semana)</div>
          <input style={inputBase} type="number" placeholder="Ex: 4" value={value.alcoolSemanal}
            onChange={e => onChange({ alcoolSemanal: e.target.value })} />
        </div>
        <div>
          <div style={{ ...label, color: MUTED, marginBottom: 6 }}>Gasto medido (kcal)</div>
          <input style={inputBase} type="number" placeholder="Calorimetria / diário" value={value.calorimetriaKcal}
            onChange={e => onChange({ calorimetriaKcal: e.target.value })} />
        </div>
        <div>
          <div style={{ ...label, color: MUTED, marginBottom: 6 }}>Método</div>
          <select
            style={{ ...inputBase, cursor: "pointer" }}
            value={value.metodoCalorimetria}
            onChange={e => onChange({ metodoCalorimetria: e.target.value })}
          >
            <option value="">Selecione</option>
            {METODOS_CALORIMETRIA.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      {value.calorimetriaKcal && (
        <div style={{ marginTop: 10, fontSize: 11, color: EMERALD, lineHeight: 1.6 }}>
          ✓ O gasto medido substitui a fórmula preditiva no cálculo do plano.
        </div>
      )}
    </div>
  );
}
