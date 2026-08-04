import { ShieldCheck } from "lucide-react";
import { RC, mono, raj } from "@/components/runon/runonUi";

const MINI = [
  { label: "ERGOGÊNICOS", value: "85+ compostos" },
  { label: "PEPTÍDEOS", value: "40+ peptídeos" },
  { label: "OFF-LABEL", value: "Protocolos" },
  { label: "SUPLEMENTAÇÃO", value: "Evidence-based" },
];

export default function AegisCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${RC.card} 0%, ${RC.bg2} 50%, #a855f708 100%)`,
        border: `1px solid ${RC.purpleBorder}`,
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 52, height: 52, background: RC.purpleDim,
            border: `1px solid ${RC.purpleBorder}`, borderRadius: 8,
            boxShadow: "0 0 20px #a855f711",
          }}
        >
          <ShieldCheck style={{ width: 26, height: 26, color: RC.purple }} />
        </div>
        <div className="min-w-0">
          <p style={raj(22, 700)}>AEGIS</p>
          <p style={mono(7, "#a855f788", 3)}>HYBRID PROTECTION PROTOCOL</p>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginTop: 14 }}>
        Motor de inteligência farmacológica do RunON. Protocolos curados de preservação muscular,
        performance e recuperação, filtrados pelo seu perfil.
      </p>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {MINI.map((m) => (
          <div
            key={m.label}
            className="runon-mini"
            style={{ background: RC.bg2, border: `1px solid ${RC.border}`, borderRadius: 8, padding: 12, transition: "border-color 0.3s ease" }}
          >
            <p style={mono(7, RC.purple, 2)}>{m.label}</p>
            <p style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{m.value}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onOpen}
        className="w-full mt-4 runon-aegis-btn"
        style={{
          ...mono(8, RC.purple, 2),
          border: `1px solid ${RC.purple}44`,
          padding: "10px 24px",
          borderRadius: 6,
          transition: "background 0.2s ease",
        }}
      >
        CONSULTAR AEGIS
      </button>
    </div>
  );
}
