import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanNutritionAlert } from "@/lib/planNutritionValidation";

interface Props {
  alerts: PlanNutritionAlert[];
  onRecalculate?: () => void;
}

export default function PlanValidationAlert({ alerts, onRecalculate }: Props) {
  if (!alerts.length) return null;
  return (
    <div className="mb-4 space-y-2" role="alert" aria-label="Validação nutricional do plano">
      {alerts.map((alert, index) => (
        <div key={`${alert.message}-${index}`} className={`flex flex-wrap items-center justify-between gap-3 border p-3 font-mono text-xs ${
          alert.type === "error" ? "border-destructive/40 bg-destructive/10 text-destructive" :
          alert.type === "warning" ? "border-amber-500/40 bg-amber-500/10 text-amber-400" :
          "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
        }`}>
          <span className="flex min-w-0 items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{alert.message}</span>
          {alert.type === "error" && onRecalculate && index === alerts.findIndex((item) => item.type === "error") && (
            <Button variant="outline" size="sm" onClick={onRecalculate} className="shrink-0">
              <RefreshCw className="mr-2 h-3.5 w-3.5" /> Recalcular gramaturas
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}