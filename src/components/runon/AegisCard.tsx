import { ShieldCheck } from "lucide-react";
import { RUNON } from "@/data/runonData";

const MINI = [
  { label: "Ergogênicos", value: "85+ compostos", color: "#00D4FF" },
  { label: "Peptídeos", value: "40+ peptídeos", color: "#a855f7" },
  { label: "Off-Label", value: "Protocolos", color: "#00D4FF" },
  { label: "Suplementos", value: "Evidence-based", color: "#a855f7" },
];

export default function AegisCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div
      style={{
        background: "linear-gradient(160deg, #111111 0%, #0a0a0a 100%)",
        border: `1px solid ${RUNON.cyan}33`,
        borderRadius: 10,
        padding: 20,
      }}
    >
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-7 h-7 shrink-0" style={{ color: RUNON.cyan }} />
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: RUNON.text, letterSpacing: "3px" }}>AEGIS</h3>
          <p style={{ fontSize: 10, color: RUNON.muted, letterSpacing: "2px", fontWeight: 700 }}>
            HYBRID PROTECTION PROTOCOL
          </p>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "#bbb", lineHeight: 1.6, marginTop: 14 }}>
        Sistema especialista em preservação muscular e otimização ergogênica para atletas híbridos.
        Protocolos baseados em evidência + experiência prática de campo.
      </p>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {MINI.map((m) => (
          <div key={m.label} style={{ background: "#1a1a1a", border: `1px solid ${RUNON.border}`, borderRadius: 8, padding: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: m.color, letterSpacing: "1px" }}>{m.label}</p>
            <p style={{ fontSize: 12, color: "#999", marginTop: 3 }}>{m.value}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onOpen}
        className="w-full mt-4 py-3 transition-colors"
        style={{
          border: `1px solid ${RUNON.cyan}`,
          color: RUNON.cyan,
          background: "transparent",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "2px",
          borderRadius: 8,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = `${RUNON.cyan}22`)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        CONSULTAR AEGIS
      </button>
    </div>
  );
}
