import { useState } from "react";
import { Copy, RotateCcw, BarChart3 } from "lucide-react";
import DesafioResultCard from "./DesafioResultCard";
import DesafioCaptionPicker from "./DesafioCaptionPicker";
import DesafioBadges from "./DesafioBadges";
import { DesafioConfig } from "@/lib/desafio21";

const mono = (s: number, c: string, sp = 1.5): React.CSSProperties => ({
  fontFamily: "'Space Mono', monospace", fontSize: s, color: c, letterSpacing: `${sp}px`,
});
const raj = (s: number, w = 700, c = "#F5F0E8"): React.CSSProperties => ({
  fontFamily: "'Rajdhani', sans-serif", fontSize: s, fontWeight: w, color: c, lineHeight: 1.15,
});

const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 10) * 0.25,
  color: ["#00D4FF", "#00FF88", "#FFB800"][i % 3],
}));

interface Props {
  cfg: DesafioConfig;
  onReset: () => void;
  onViewProgress: () => void;
}

export default function DesafioCompletion({ cfg, onReset, onViewProgress }: Props) {
  const [captions, setCaptions] = useState(false);

  return (
    <div className="relative overflow-hidden" style={{ background: "#020205" }}>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className="desafio-confetti"
            style={{ left: `${c.left}%`, background: c.color, animationDelay: `${c.delay}s` }}
          />
        ))}
      </div>

      <div className="relative mx-auto px-4 py-8 space-y-5" style={{ maxWidth: 560 }}>
        <div className="text-center">
          <h1 style={raj(40, 700, "#00D4FF")}>VOCÊ É UM ATLETA HÍBRIDO.</h1>
          <p style={{ ...mono(12, "#7a8a99", 2), marginTop: 10 }}>21 DIAS. MISSÃO CUMPRIDA.</p>
        </div>

        <DesafioResultCard cfg={cfg} />

        <DesafioBadges earned={cfg.badges} />

        <div className="grid grid-cols-1 gap-2 pb-10">
          <button
            type="button"
            aria-label="Copiar legenda para redes sociais"
            onClick={() => setCaptions(true)}
            className="flex items-center justify-center gap-2"
            style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 8, padding: "13px 0", ...raj(16, 700, "#00D4FF") }}
          >
            <Copy style={{ width: 15, height: 15 }} /> COPIAR LEGENDA
          </button>
          <button
            type="button"
            aria-label="Ver evolução completa"
            onClick={onViewProgress}
            className="flex items-center justify-center gap-2"
            style={{ background: "#060a0f", border: "1px solid #12222c", borderRadius: 8, padding: "13px 0", ...raj(16, 700, "#c9d6df") }}
          >
            <BarChart3 style={{ width: 15, height: 15 }} /> VER EVOLUÇÃO COMPLETA
          </button>
          <button
            type="button"
            aria-label="Fazer o desafio novamente"
            onClick={onReset}
            className="flex items-center justify-center gap-2"
            style={{ background: "transparent", border: "1px solid #24323c", borderRadius: 8, padding: "13px 0", ...raj(16, 700, "#5a6a79") }}
          >
            <RotateCcw style={{ width: 15, height: 15 }} /> FAZER NOVAMENTE
          </button>
        </div>
      </div>

      {captions && <DesafioCaptionPicker onClose={() => setCaptions(false)} />}
    </div>
  );
}
