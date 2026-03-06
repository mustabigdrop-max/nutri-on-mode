import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { NutrientSummary } from "@/hooks/useMicronutrients";

interface DeficiencyAlertsProps {
  deficiencies: NutrientSummary[];
}

const FOOD_SUGGESTIONS: Record<string, string> = {
  ferro_mg: "Feijão, lentilha, espinafre, carne vermelha",
  calcio_mg: "Leite, iogurte, brócolis, sardinha",
  vitamina_c_mg: "Laranja, acerola, goiaba, pimentão",
  vitamina_d_mcg: "Sol, ovos, salmão, sardinha",
  vitamina_b12_mcg: "Carne, ovos, leite, fígado",
  zinco_mg: "Castanha, carne, sementes de abóbora",
  magnesio_mg: "Banana, abacate, castanhas, chocolate amargo",
  omega3_mg: "Sardinha, linhaça, chia, nozes",
  fibras_g: "Aveia, frutas com casca, feijão, chia",
  folato_mcg: "Espinafre, feijão, lentilha, brócolis",
  potassio_mg: "Banana, batata, abacate, água de coco",
  vitamina_a_mcg: "Cenoura, abóbora, manga, espinafre",
  vitamina_e_mg: "Castanhas, azeite, abacate, sementes",
  vitamina_k_mcg: "Couve, espinafre, brócolis",
  selenio_mcg: "Castanha-do-pará (1-2 unidades/dia!)",
  sodio_mg: "Sal, alimentos processados — cuidado com excesso",
};

const DeficiencyAlerts = ({ deficiencies }: DeficiencyAlertsProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4"
  >
    <div className="flex items-center gap-2 mb-3">
      <AlertTriangle className="w-4 h-4 text-destructive" />
      <h3 className="text-xs font-bold text-destructive">Alerta de Deficiência</h3>
    </div>
    <div className="space-y-2">
      {deficiencies.slice(0, 4).map(d => (
        <div key={d.nutrient} className="text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">{d.label}</span>
            <span className="text-destructive font-mono">{d.pct}% da meta</span>
          </div>
          <p className="text-muted-foreground text-[10px] mt-0.5">
            💡 Alimentos ricos: {FOOD_SUGGESTIONS[d.nutrient] || "Varie sua alimentação"}
          </p>
        </div>
      ))}
    </div>
  </motion.div>
);

export default DeficiencyAlerts;
