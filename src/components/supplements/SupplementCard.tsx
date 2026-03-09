import { motion } from "framer-motion";
import { Check, Coffee, Sun, Moon, Clock, AlertTriangle } from "lucide-react";

const TIMING_ICONS = {
  morning: { icon: Coffee, label: "Manhã", color: "text-amber-400" },
  afternoon: { icon: Sun, label: "Tarde", color: "text-orange-400" },
  night: { icon: Moon, label: "Noite", color: "text-purple-400" },
  anytime: { icon: Clock, label: "Qualquer hora", color: "text-cyan-400" },
};

const PRIORITY_STYLES = {
  essential: { label: "Essencial", bg: "bg-purple-500/15", text: "text-purple-400" },
  recommended: { label: "Recomendado", bg: "bg-amber-500/15", text: "text-amber-400" },
  optional: { label: "Opcional", bg: "bg-muted", text: "text-muted-foreground" },
};

interface Props {
  name: string;
  dose: string;
  timing: string;
  timingIcon: "morning" | "afternoon" | "night" | "anytime";
  reason: string;
  evidence: string;
  priority: "essential" | "recommended" | "optional";
  warnings?: string;
  costPerMonth?: number;
  isChecked: boolean;
  onToggle: () => void;
  index: number;
}

const SupplementCard = ({
  name, dose, timing, timingIcon, reason, evidence, priority, warnings, costPerMonth, isChecked, onToggle, index,
}: Props) => {
  const t = TIMING_ICONS[timingIcon];
  const p = PRIORITY_STYLES[priority];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-xl border bg-card p-4 transition-all ${
        isChecked ? "border-purple-500/40 bg-purple-500/5" : "border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            isChecked ? "border-purple-500 bg-purple-500" : "border-muted-foreground/50"
          }`}
        >
          {isChecked && <Check className="w-3 h-3 text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className={`text-sm font-bold ${isChecked ? "text-muted-foreground line-through" : "text-foreground"}`}>{name}</h4>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${p.bg} ${p.text}`}>{p.label}</span>
          </div>
          <div className="flex items-center gap-3 mb-1 text-xs">
            <span className="font-mono text-purple-400">💊 {dose}</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <t.icon className={`w-3 h-3 ${t.color}`} /> {timing}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{reason}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1 italic">📚 {evidence}</p>
          {costPerMonth && (
            <p className="text-[10px] font-mono text-purple-400/70 mt-1">~R${costPerMonth}/mês</p>
          )}
          {warnings && (
            <div className="flex items-start gap-1 mt-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-400">{warnings}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SupplementCard;
