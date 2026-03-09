import { motion } from "framer-motion";
import { Check, X, Coffee, Sun, Moon } from "lucide-react";
import type { SupplementItem } from "@/hooks/useSupplements";
import type { SupplementLog } from "@/hooks/useSupplements";

interface Props {
  supplements: SupplementItem[];
  logs: SupplementLog[];
  onToggle: (name: string) => void;
}

const PERIOD_META = {
  morning: { label: "Manhã", icon: Coffee, emoji: "☀️", gradient: "from-amber-500/20 to-orange-500/20" },
  afternoon: { label: "Tarde", icon: Sun, emoji: "🌤️", gradient: "from-orange-500/20 to-red-500/20" },
  night: { label: "Noite", icon: Moon, emoji: "🌙", gradient: "from-purple-500/20 to-indigo-500/20" },
  anytime: { label: "Qualquer hora", icon: Coffee, emoji: "⏰", gradient: "from-cyan-500/20 to-blue-500/20" },
};

const SupplementTimeline = ({ supplements, logs, onToggle }: Props) => {
  const groups = {
    morning: supplements.filter(s => s.timingIcon === "morning"),
    afternoon: supplements.filter(s => s.timingIcon === "afternoon"),
    night: supplements.filter(s => s.timingIcon === "night"),
    anytime: supplements.filter(s => s.timingIcon === "anytime"),
  };

  const isTaken = (name: string) => logs.some(l => l.supplement_name === name && !l.skipped);
  const totalTaken = supplements.filter(s => isTaken(s.name)).length;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400"
            animate={{ width: `${(totalTaken / Math.max(supplements.length, 1)) * 100}%` }}
          />
        </div>
        <span className="text-xs font-mono text-purple-400">{totalTaken}/{supplements.length}</span>
      </div>

      {/* Timeline */}
      <div className="flex overflow-x-auto gap-3 pb-2 -mx-1 px-1 scrollbar-hide">
        {Object.entries(groups).map(([period, supps]) => {
          if (supps.length === 0) return null;
          const meta = PERIOD_META[period as keyof typeof PERIOD_META];
          const periodTaken = supps.filter(s => isTaken(s.name)).length;
          const allDone = periodTaken === supps.length;

          return (
            <div
              key={period}
              className={`flex-shrink-0 w-40 rounded-xl border p-3 bg-gradient-to-br ${meta.gradient} ${
                allDone ? "border-purple-500/30" : "border-border"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{meta.emoji}</span>
                <span className="text-xs font-bold text-foreground">{meta.label}</span>
                <span className="text-[9px] font-mono text-muted-foreground ml-auto">
                  {periodTaken}/{supps.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {supps.map(s => {
                  const taken = isTaken(s.name);
                  return (
                    <button
                      key={s.name}
                      onClick={() => onToggle(s.name)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${
                        taken ? "bg-purple-500/20" : "bg-card/50 hover:bg-card"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        taken ? "border-purple-500 bg-purple-500" : "border-muted-foreground/40"
                      }`}>
                        {taken && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className={`text-[10px] font-mono truncate ${taken ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {s.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupplementTimeline;
