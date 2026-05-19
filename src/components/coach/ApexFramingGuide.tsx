// APEX Visual — Guia de enquadramento (colapsável) exibido antes do upload da foto
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const C = {
  bg: "#0d1520",
  cyan: "#00D4FF",
  green: "#1D9E75",
  red: "#E24B4A",
  muted: "#9AA6B8",
  fontMono: "'Space Mono', 'JetBrains Mono', monospace",
};

interface Props {
  defaultOpen?: boolean;
}

export function ApexFramingGuide({ defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: C.bg,
        border: `0.5px solid ${C.cyan}30`,
        borderLeft: `2px solid ${C.cyan}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
          border: "none",
          color: C.cyan,
          fontFamily: C.fontMono,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <span>📐 ENQUADRAMENTO CORRETO</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10 }}>
          {open ? "Ocultar" : "Ver instruções"}
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ color: C.muted, fontSize: 11 }}>Para máxima precisão do APEX:</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              "Atleta deve ocupar 70–80% da altura da foto — da cabeça aos pés",
              "Câmera na altura do umbigo",
              "Distância: 1.5 a 2 metros",
              "Fundo neutro e iluminação uniforme",
              "Atleta centralizado no frame",
            ].map((t, i) => (
              <div key={i} style={{ color: C.green, fontSize: 12, lineHeight: 1.4 }}>
                ✓ {t}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            {[
              "Evitar: foto muito aberta",
              "Evitar: atleta cortado",
              "Evitar: fundo com muitos elementos",
            ].map((t, i) => (
              <div key={i} style={{ color: C.red, fontSize: 12, lineHeight: 1.4 }}>
                ✗ {t}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ApexFramingGuide;
