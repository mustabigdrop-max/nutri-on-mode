import { motion } from "framer-motion";
import { Check, Plus, ArrowRight } from "lucide-react";
import type { SupplementItem } from "@/hooks/useSupplements";

interface Props {
  currentSupps: string[];
  recommended: SupplementItem[];
}

const StackGapAnalysis = ({ currentSupps, recommended }: Props) => {
  const currentSet = new Set(currentSupps.map(s => s.toLowerCase()));
  const matching = recommended.filter(r => currentSet.has(r.name.toLowerCase()) || currentSupps.some(c => r.name.toLowerCase().includes(c.toLowerCase())));
  const missing = recommended.filter(r => !currentSet.has(r.name.toLowerCase()) && !currentSupps.some(c => r.name.toLowerCase().includes(c.toLowerCase())));

  const estimatedCost = missing.reduce((acc, s) => acc + (s.costPerMonth || 40), 0);

  if (currentSupps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-purple-500/20 bg-card p-4"
    >
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        📊 Análise de Gap
        <span className="text-[9px] font-mono text-muted-foreground">Seu stack vs IA</span>
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Current */}
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Seu stack atual</p>
          <div className="space-y-1">
            {matching.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-foreground truncate">{s.name}</span>
              </div>
            ))}
            {currentSupps.filter(c => !matching.some(m => m.name.toLowerCase().includes(c.toLowerCase()))).map(c => (
              <div key={c} className="flex items-center gap-1.5 text-xs">
                <Check className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended */}
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Recomendado IA</p>
          <div className="space-y-1">
            {matching.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-foreground truncate">{s.name}</span>
              </div>
            ))}
            {missing.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <Plus className="w-3 h-3 text-purple-400" />
                <span className="text-purple-400 truncate font-semibold">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              <span className="text-purple-400 font-bold">{missing.length}</span> suplemento{missing.length > 1 ? "s" : ""} faltando
            </span>
            <span className="text-xs font-mono text-purple-400">+~R${estimatedCost}/mês</span>
          </div>
          {missing[0] && (
            <p className="text-[10px] text-muted-foreground mt-1">
              ← <span className="text-purple-400 font-semibold">{missing[0].name}</span> é o maior gap de resultado
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StackGapAnalysis;
