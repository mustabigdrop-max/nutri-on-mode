// MERIDIAN — Multi-show optimizer: encadeia provas e avalia viabilidade.
import { useMemo, useState } from "react";
import { useMeridianMultiShow } from "@/hooks/useMeridianMultiShow";
import type { MeridianCompetition } from "@/lib/meridian/types";
import { daysBetween, formatDate } from "@/lib/meridian/calculator";

interface Props {
  primary: MeridianCompetition;
  allCompetitions: MeridianCompetition[];
}

const ACCENT = "#B8922A";
const STRATEGIES = [
  { value: "maintain", label: "Manter shape" },
  { value: "push_harder", label: "Push harder (mais seco)" },
  { value: "rebound_refeed", label: "Rebound + refeed (mais cheio)" },
];

export default function MeridianMultiShowOptimizer({ primary, allCompetitions }: Props) {
  const { chains, loading, addChain, removeChain } = useMeridianMultiShow(primary.id);
  const [selected, setSelected] = useState<string>("");
  const [strategy, setStrategy] = useState("maintain");
  const [refeed, setRefeed] = useState(2);
  const [notes, setNotes] = useState("");

  const candidates = useMemo(
    () => allCompetitions.filter((c) => c.id !== primary.id && c.competition_date > primary.competition_date),
    [allCompetitions, primary],
  );

  const selectedComp = candidates.find((c) => c.id === selected);
  const gapDays = selectedComp ? daysBetween(primary.competition_date, selectedComp.competition_date) : 0;

  return (
    <div style={shell}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: ACCENT, marginBottom: 12 }}>
        SITREP // MULTI-SHOW CHAIN
      </div>

      <div style={{ fontSize: 12, color: "#cfcfcf", marginBottom: 12 }}>
        Show primário: <strong style={{ color: ACCENT }}>{primary.name}</strong> · {formatDate(primary.competition_date)}
      </div>

      {chains.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {chains.map((chain) => {
            const comp = allCompetitions.find((c) => c.id === chain.secondary_competition_id);
            const viabColor = chain.viability_status === "GREEN" ? "#4ade80" : chain.viability_status === "YELLOW" ? "#facc15" : "#ef4444";
            return (
              <div key={chain.id} style={chainRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#e8e8e8" }}>
                    → {comp?.name ?? "(removida)"} · {comp ? formatDate(comp.competition_date) : ""}
                  </div>
                  <div style={{ fontSize: 11, color: "#7a7a7a", marginTop: 4 }}>
                    Gap {chain.gap_days}d · {STRATEGIES.find((s) => s.value === chain.strategy)?.label ?? chain.strategy} · refeed {chain.mini_refeed_days}d
                  </div>
                  {chain.warnings.length > 0 && (
                    <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 11, color: "#fcd5d5" }}>
                      {chain.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  )}
                </div>
                <div style={{ ...pillSmall, borderColor: `${viabColor}55`, color: viabColor }}>{chain.viability_status}</div>
                <button onClick={() => removeChain(chain.id)} style={btnGhost}>✕</button>
              </div>
            );
          })}
        </div>
      )}

      {candidates.length === 0 ? (
        <div style={{ fontSize: 12, color: "#7a7a7a", fontStyle: "italic" }}>
          Nenhuma competição secundária cadastrada após {formatDate(primary.competition_date)}.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <Field label="Show secundário">
            <select value={selected} onChange={(e) => setSelected(e.target.value)} style={input}>
              <option value="">Selecione...</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {formatDate(c.competition_date)}</option>
              ))}
            </select>
          </Field>
          {selectedComp && (
            <div style={{ fontSize: 11, color: ACCENT, letterSpacing: 1 }}>GAP: {gapDays} dias</div>
          )}
          <Field label="Estratégia">
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)} style={input}>
              {STRATEGIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Mini-refeed (dias)">
            <input type="number" min={0} max={7} value={refeed} onChange={(e) => setRefeed(Number(e.target.value))} style={input} />
          </Field>
          <Field label="Notas">
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: voo entre shows, mudança de classe..." style={input} />
          </Field>
          <button
            disabled={!selected || loading}
            onClick={async () => {
              await addChain({ secondary_competition_id: selected, gap_days: gapDays, strategy, mini_refeed_days: refeed, intra_chain_notes: notes });
              setSelected(""); setNotes("");
            }}
            style={btnPrimary}
          >
            ▶ ENCADEAR SHOW
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 9, letterSpacing: 2, color: "#7a7a7a", display: "block", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const shell: React.CSSProperties = {
  background: "rgba(184,146,42,0.05)",
  border: "1px solid rgba(184,146,42,0.35)",
  borderLeft: `4px solid ${ACCENT}`,
  padding: 18,
  borderRadius: 4,
};
const chainRow: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  padding: 10, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 3, marginBottom: 8,
};
const pillSmall: React.CSSProperties = {
  padding: "4px 8px", border: "1px solid", borderRadius: 2, fontSize: 10, letterSpacing: 1.5, fontWeight: 700,
};
const input: React.CSSProperties = {
  width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#e8e8e8", padding: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, borderRadius: 3,
};
const btnPrimary: React.CSSProperties = {
  background: ACCENT, color: "#0a0a0a", border: "none", padding: "10px 16px",
  fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 2, cursor: "pointer", borderRadius: 3, fontWeight: 700,
};
const btnGhost: React.CSSProperties = {
  background: "transparent", color: "#7a7a7a", border: "1px solid rgba(255,255,255,0.15)",
  padding: "4px 10px", cursor: "pointer", borderRadius: 2, fontSize: 14,
};
