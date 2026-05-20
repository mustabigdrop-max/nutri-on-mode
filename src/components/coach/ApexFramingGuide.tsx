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
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 14 }}>
          {([
            {
              title: "ALTURA",
              items: [
                { ok: true, text: "Atleta do topo da cabeça até os pés visíveis" },
                { ok: true, text: "Margem de 5% acima da cabeça" },
                { ok: true, text: "Margem de 5% abaixo dos pés" },
              ],
            },
            {
              title: "LARGURA",
              items: [
                { ok: true, text: "Ombros ocupando 50–60% da largura" },
                { ok: true, text: "Margem de 20% em cada lado" },
                { ok: true, text: "Ambos os ombros dentro do frame" },
                { ok: false, text: "Ombros NÃO podem tocar as bordas" },
              ],
            },
            {
              title: "DISTÂNCIA",
              items: [
                { ok: true, text: "1.5 a 2 metros de distância" },
                { ok: true, text: "Câmera na altura do umbigo" },
                { ok: true, text: "Atleta centralizado" },
              ],
            },
            {
              title: "AMBIENTE",
              items: [
                { ok: true, text: "Fundo neutro e liso" },
                { ok: true, text: "Iluminação uniforme" },
                { ok: false, text: "Sem sombras fortes atrás do atleta" },
              ],
            },
          ] as const).map((section) => (
            <div key={section.title} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{
                  color: C.cyan,
                  fontFamily: C.fontMono,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                {section.title}
              </div>
              {section.items.map((it, i) => (
                <div
                  key={i}
                  style={{
                    color: it.ok ? C.green : C.red,
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  {it.ok ? "✓" : "✗"} {it.text}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ApexFramingGuide;
