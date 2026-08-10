import { useState } from "react";
import { Copy, Check, X } from "lucide-react";
import { CAPTIONS } from "@/lib/desafio21";

const mono = (s: number, c: string, sp = 1.5): React.CSSProperties => ({
  fontFamily: "'Space Mono', monospace", fontSize: s, color: c, letterSpacing: `${sp}px`,
});
const raj = (s: number, w = 700, c = "#F5F0E8"): React.CSSProperties => ({
  fontFamily: "'Rajdhani', sans-serif", fontSize: s, fontWeight: w, color: c, lineHeight: 1.15,
});

export default function DesafioCaptionPicker({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" style={{ background: "rgba(2,2,5,0.94)" }}>
      <div className="mx-auto px-4 py-6" style={{ maxWidth: 560 }}>
        <div className="flex items-center justify-between mb-5">
          <h3 style={raj(22, 700)}>Escolha sua legenda</h3>
          <button type="button" aria-label="Fechar legendas" onClick={onClose}>
            <X style={{ width: 18, height: 18, color: "#5a6a79" }} />
          </button>
        </div>

        <div className="space-y-3 pb-10">
          {CAPTIONS.map((c) => (
            <div key={c.id} style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 12, padding: 14 }}>
              <p style={{ ...mono(10, "#00D4FF", 2), marginBottom: 8 }}>{c.label.toUpperCase()}</p>
              <p style={{ ...mono(11, "#c9d6df", 0), whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{c.text}</p>
              <button
                type="button"
                aria-label={`Copiar legenda ${c.label}`}
                onClick={() => copy(c.id, c.text)}
                className="w-full flex items-center justify-center gap-2 mt-3"
                style={{ background: "#00D4FF", borderRadius: 8, padding: "10px 0", ...raj(15, 700, "#020205") }}
              >
                {copied === c.id ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                {copied === c.id ? "COPIADO" : "COPIAR"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
