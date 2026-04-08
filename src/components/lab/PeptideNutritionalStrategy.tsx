import { AlertTriangle, Zap, Clock } from "lucide-react";
import { peptideStrategies } from "@/data/peptideStrategies";

interface PeptideFallback {
  dietImpact?: string;
  synergies?: string;
  dosage?: string;
  mechanism?: string;
}

interface Props {
  peptideSlug: string;
  fallbackData?: PeptideFallback;
}

export function PeptideNutritionalStrategy({ peptideSlug, fallbackData }: Props) {
  const s = peptideStrategies[peptideSlug];

  // If dedicated strategy exists, render full version
  if (s) {
    return (
      <div className="space-y-4 mt-4">
        <div className="flex items-center gap-2 text-lg font-bold text-primary">
          <Zap className="w-5 h-5" />
          Estratégias Nutricionais de Potencialização
        </div>

        <div className="space-y-3">
          {s.strategies.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-muted/40 rounded-lg p-3">
              <span className="mt-1 text-primary font-bold text-sm">{i + 1}</span>
              <p className="text-sm text-foreground">
                <strong className="text-primary">{item.title}</strong> — {item.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Macros */}
        <div className="bg-card border rounded-lg p-4">
          <p className="font-semibold text-sm mb-2">Distribuição de macros sugerida</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Carboidrato", val: s.macros.cho },
              { label: "Proteína", val: s.macros.ptn },
              { label: "Gordura", val: s.macros.lip }
            ].map(m => (
              <div key={m.label} className="bg-muted/60 rounded-lg p-2">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="font-bold text-primary">{m.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timing */}
        <div className="flex items-start gap-2 bg-muted/30 rounded-lg p-3">
          <Clock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
          <p className="text-sm">
            <strong>Timing: </strong>
            {s.timing}
          </p>
        </div>

        {/* Warning */}
        {s.warning && (
          <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{s.warning}</p>
          </div>
        )}

        {/* Synergy Stack */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <p className="font-bold text-sm text-primary mb-1">✦ Stack sinérgico de elite</p>
          <p className="text-sm">{s.synergyStack}</p>
        </div>
      </div>
    );
  }

  // Fallback: generate nutritional section from peptide's own data
  if (!fallbackData) return null;

  const { dietImpact, synergies, dosage } = fallbackData;
  if (!dietImpact && !synergies) return null;

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-2 text-lg font-bold text-primary">
        <Zap className="w-5 h-5" />
        Estratégias Nutricionais de Potencialização
      </div>

      {/* Diet Impact as strategy */}
      {dietImpact && (
        <div className="flex items-start gap-3 bg-muted/40 rounded-lg p-3">
          <span className="mt-1 text-primary font-bold text-sm">1</span>
          <p className="text-sm text-foreground">
            <strong className="text-primary">Impacto na Dieta</strong> — {dietImpact}
          </p>
        </div>
      )}

      {/* Timing from dosage */}
      {dosage && (
        <div className="flex items-start gap-2 bg-muted/30 rounded-lg p-3">
          <Clock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
          <p className="text-sm">
            <strong>Timing / Dosagem: </strong>
            {dosage}
          </p>
        </div>
      )}

      {/* Synergies as stack */}
      {synergies && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <p className="font-bold text-sm text-primary mb-1">✦ Stack sinérgico</p>
          <p className="text-sm">{synergies}</p>
        </div>
      )}
    </div>
  );
}
