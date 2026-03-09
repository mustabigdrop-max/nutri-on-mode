import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

const PHASES = [
  { key: "inicio", label: "Início", weeks: "1–4", color: "#EAB308" },
  { key: "meio", label: "Meio", weeks: "5–10", color: "#EF4444" },
  { key: "final", label: "Final", weeks: "11+", color: "#F97316" },
  { key: "pct", label: "PCT", weeks: "Pós-ciclo", color: "#22C55E" },
];

interface Props {
  phase: string;
  startedAt: string;
  substances: string[];
}

const CycleTimeline = ({ phase, startedAt, substances }: Props) => {
  const startDate = new Date(startedAt);
  const daysSinceStart = Math.floor(
    (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weeksSinceStart = Math.floor(daysSinceStart / 7) + 1;

  const activeIdx = PHASES.findIndex((p) => p.key === phase);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <Activity className="w-4 h-4 text-[#FF6B00]" />
        Timeline do Ciclo
      </h3>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Início:</span>
          <span className="font-medium">{startDate.toLocaleDateString("pt-BR")}</span>
          <span className="text-muted-foreground ml-2">•</span>
          <span className="font-medium text-[#FF6B00]">Semana {weeksSinceStart}</span>
          <span className="text-muted-foreground">({daysSinceStart} dias)</span>
        </div>

        {/* Timeline bar */}
        <div className="flex gap-1">
          {PHASES.map((p, i) => (
            <div key={p.key} className="flex-1 space-y-1">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  backgroundColor: i <= activeIdx ? p.color : "hsl(var(--muted))",
                  opacity: i === activeIdx ? 1 : i < activeIdx ? 0.5 : 0.2,
                }}
              />
              <p
                className={`text-[10px] text-center ${
                  i === activeIdx ? "font-bold" : "text-muted-foreground"
                }`}
              >
                {p.label}
              </p>
              <p className="text-[9px] text-center text-muted-foreground">{p.weeks}</p>
            </div>
          ))}
        </div>

        {/* Substances summary */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Substâncias ativas:</p>
          <div className="flex flex-wrap gap-1">
            {substances.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 bg-[#FF6B00]/10 text-[#FF6B00] rounded text-xs"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Phase-specific tips */}
      <Card className="p-4 border-l-4 border-l-[#FF6B00]">
        <p className="text-xs font-medium mb-1">
          {phase === "inicio" && "📋 Fase de Adaptação"}
          {phase === "meio" && "📈 Pico de Performance"}
          {phase === "final" && "⚠️ Fase de Saída"}
          {phase === "pct" && "🔄 Recuperação Hormonal"}
          {phase === "pre_comp" && "🏆 Preparação para Palco"}
        </p>
        <p className="text-xs text-muted-foreground">
          {phase === "inicio" &&
            "Corpo se adaptando às substâncias. Foque em alimentação consistente e monitor de efeitos colaterais. Exames de referência devem estar em dia."}
          {phase === "meio" &&
            "Janela anabólica máxima. Aproveite para intensificar treinos e manter superávit controlado. Monitore pressão e retenção."}
          {phase === "final" &&
            "Comece a planejar seu PCT. Reduza gradualmente se possível. Faça exames para baseline de saída."}
          {phase === "pct" &&
            "Foco em manutenção de massa. Proteína alta, gordura adequada para suporte hormonal. Monitore humor, libido e energia."}
          {phase === "pre_comp" &&
            "Protocolo de finalização ativo. Siga o plano de depleção/supercompensação e monitore visual diariamente."}
        </p>
      </Card>
    </div>
  );
};

export default CycleTimeline;
