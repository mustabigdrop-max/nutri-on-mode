import { useMemo } from "react";

const CortisolIndicator = () => {
  const now = new Date();
  const h = now.getHours();

  const phase = useMemo(() => {
    if (h >= 6 && h < 9) return { level: "Alto", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: "🔴", tip: "Cortisol no pico — prefira carbs de baixo índice glicêmico" };
    if (h >= 9 && h < 12) return { level: "Médio", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "🟡", tip: "Cortisol caindo — boa janela para snack equilibrado" };
    if (h >= 12 && h < 14) return { level: "Baixo", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: "🟢", tip: "Melhor janela para refeição principal — máxima eficiência digestiva" };
    if (h >= 14 && h < 17) return { level: "Médio", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "🟡", tip: "Segundo pico de energia — ideal para pré-treino" };
    if (h >= 17 && h < 21) return { level: "Baixo", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: "🟢", tip: "Cortisol baixo — refeições leves, boa digestão" };
    return { level: "Mínimo", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: "🔵", tip: "Cortisol mínimo — alimentos com triptofano favorecem o sono" };
  }, [h]);

  return (
    <div className={`p-3 rounded-xl border ${phase.bg} ${phase.border}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-foreground">Cortisol</span>
        <span className={`text-xs font-bold ${phase.color}`}>{phase.icon} {phase.level}</span>
      </div>
      <p className="text-[10px] text-muted-foreground">{phase.tip}</p>

      {/* Mini cortisol curve */}
      <svg viewBox="0 0 200 40" className="w-full h-8 mt-2">
        <path
          d="M0,35 Q25,5 50,10 T100,20 T150,25 T200,35"
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1.5"
          opacity="0.3"
        />
        {/* Current position */}
        <circle cx={Math.round((h / 24) * 200)} cy={h >= 6 && h < 9 ? 8 : h >= 12 && h < 14 ? 22 : h >= 21 || h < 6 ? 35 : 16} r="4" fill="#f97316">
          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Labels */}
        <text x="5" y="38" fontSize="7" fill="hsl(var(--muted-foreground))">06h</text>
        <text x="88" y="38" fontSize="7" fill="hsl(var(--muted-foreground))">12h</text>
        <text x="175" y="38" fontSize="7" fill="hsl(var(--muted-foreground))">24h</text>
      </svg>
    </div>
  );
};

export default CortisolIndicator;
