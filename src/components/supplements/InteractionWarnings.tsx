import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { SupplementItem } from "@/hooks/useSupplements";

interface Props {
  supplements: SupplementItem[];
  conditions: string[];
}

interface Warning {
  level: "caution" | "danger";
  message: string;
}

const InteractionWarnings = ({ supplements, conditions }: Props) => {
  const warnings: Warning[] = [];
  const suppNames = supplements.map(s => s.name.toLowerCase());
  const condSet = new Set(conditions.map(c => c.toLowerCase()));

  // Caffeine + anxiety/hypertension
  if (suppNames.some(s => s.includes("cafeína") || s.includes("caffeine")) && (condSet.has("ansiedade") || condSet.has("hipertensão"))) {
    warnings.push({ level: "danger", message: "⚠️ Cafeína + hipertensão/ansiedade → considere reduzir dose ou remover" });
  }

  // Iron + calcium
  if (suppNames.some(s => s.includes("ferro")) && suppNames.some(s => s.includes("cálcio"))) {
    warnings.push({ level: "caution", message: "Ferro + Cálcio na mesma refeição → competição de absorção. Separe os horários" });
  }

  // Whey + lactose
  if (suppNames.some(s => s.includes("whey")) && conditions.some(c => c.toLowerCase().includes("lactose"))) {
    warnings.push({ level: "caution", message: "Whey + intolerância à lactose → prefira isolado ou vegano" });
  }

  // Vitamin K2 + anticoagulant
  if (suppNames.some(s => s.includes("k2")) && condSet.has("anticoagulante")) {
    warnings.push({ level: "danger", message: "Vitamina K2 + anticoagulante → consulte seu médico antes de usar" });
  }

  // Berberine + metformin
  if (suppNames.some(s => s.includes("berberina")) && condSet.has("diabetes")) {
    warnings.push({ level: "danger", message: "Berberina + diabetes/metformina → potencialização. Consulte seu médico" });
  }

  // Thermogenic + heart
  if (suppNames.some(s => s.includes("termogênico")) && condSet.has("hipertensão")) {
    warnings.push({ level: "danger", message: "Termogênico + cardiopatia → NÃO recomendado" });
  }

  // Add supplement-level warnings
  supplements.forEach(s => {
    if (s.warnings) {
      warnings.push({ level: "caution", message: s.warnings });
    }
  });

  if (warnings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2"
    >
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-bold text-foreground">Alertas de Interação</h3>
      </div>
      {warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-2">
          <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${w.level === "danger" ? "text-red-400" : "text-amber-400"}`} />
          <p className={`text-xs ${w.level === "danger" ? "text-red-400" : "text-amber-400"}`}>{w.message}</p>
        </div>
      ))}
    </motion.div>
  );
};

export default InteractionWarnings;
