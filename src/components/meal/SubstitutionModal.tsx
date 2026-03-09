import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check, AlertTriangle, XCircle, Sparkles } from "lucide-react";
import { findSubstitutes, SubOption, SubQuality } from "./substitutionDb";

interface SubstitutionModalProps {
  foodName: string;
  currentKcal: number;
  currentProtein: number;
  currentCarbs: number;
  currentFat: number;
  goal?: string | null;
  restrictions?: string[] | null;
  dailyKcalTarget?: number | null;
  dailyKcalConsumed?: number;
  onSelect: (sub: SubOption) => void;
  onClose: () => void;
}

const qualityIcon: Record<SubQuality, React.ReactNode> = {
  good: <Check className="w-4 h-4 text-green-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  bad: <XCircle className="w-4 h-4 text-red-500" />,
};

const qualityEmoji: Record<SubQuality, string> = {
  good: "✅",
  warning: "⚠️",
  bad: "🔴",
};

const SubstitutionModal = ({
  foodName,
  currentKcal,
  currentProtein,
  currentCarbs,
  currentFat,
  goal,
  restrictions,
  dailyKcalTarget,
  dailyKcalConsumed = 0,
  onSelect,
  onClose,
}: SubstitutionModalProps) => {
  const [selectedSub, setSelectedSub] = useState<SubOption | null>(null);
  const [showImpact, setShowImpact] = useState(false);

  const result = findSubstitutes(foodName, goal, restrictions);

  if (!result || result.options.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md bg-card rounded-2xl border border-border p-6 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Não encontrei substituições pré-cadastradas para "{foodName}".
          </p>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
            Fechar
          </button>
        </motion.div>
      </motion.div>
    );
  }

  const handleSelect = (sub: SubOption) => {
    setSelectedSub(sub);
    setShowImpact(true);
  };

  const confirmSwap = () => {
    if (selectedSub) {
      onSelect(selectedSub);
    }
  };

  const getImpactMessage = (sub: SubOption): { message: string; type: "success" | "warning" | "info" } => {
    const proteinLoss = sub.proteinDiff < -5;
    const kcalIncrease = sub.kcalDiff > 100;
    const kcalDecrease = sub.kcalDiff < -30;
    const proteinGain = sub.proteinDiff > 2;

    if (proteinLoss) {
      return {
        message: `⚠️ Essa troca reduz sua proteína em ${Math.abs(sub.proteinDiff)}g. Quer compensar? Posso sugerir um ajuste na próxima refeição.`,
        type: "warning",
      };
    }

    if (kcalIncrease) {
      const target = dailyKcalTarget || 2000;
      const newTotal = dailyKcalConsumed - currentKcal + sub.kcal;
      const overTarget = newTotal > target;
      return {
        message: overTarget
          ? `⚠️ Essa troca adiciona ${sub.kcalDiff} kcal. Você ultrapassa a meta em ${Math.round(newTotal - target)} kcal.`
          : `⚠️ Essa troca adiciona ${sub.kcalDiff} kcal ao seu dia. Você ainda fica dentro da meta.`,
        type: "warning",
      };
    }

    const benefits: string[] = [];
    if (kcalDecrease) benefits.push(`economiza ${Math.abs(sub.kcalDiff)} kcal`);
    if (proteinGain) benefits.push(`ganha ${sub.proteinDiff}g de proteína`);
    if (benefits.length === 0) benefits.push("mantém os macros equivalentes");

    return {
      message: `✅ Boa troca! Você ${benefits.join(" e ")}.`,
      type: "success",
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md max-h-[85vh] bg-card rounded-t-2xl sm:rounded-2xl border border-border overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground">🔄 Substituir</h3>
            <p className="text-xs text-muted-foreground truncate">{foodName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original food info */}
        <div className="px-4 py-2 bg-secondary/30">
          <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
            <span>🔥 {currentKcal} kcal</span>
            <span>💪 {currentProtein}g</span>
            <span>🍞 {currentCarbs}g</span>
            <span>🫙 {currentFat}g</span>
          </div>
        </div>

        {/* Impact alert */}
        <AnimatePresence>
          {showImpact && selectedSub && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {(() => {
                const impact = getImpactMessage(selectedSub);
                return (
                  <div className={`px-4 py-3 text-xs leading-relaxed ${
                    impact.type === "success"
                      ? "bg-green-500/10 text-green-700 dark:text-green-300 border-b border-green-500/20"
                      : impact.type === "warning"
                      ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-b border-yellow-500/20"
                      : "bg-primary/5 text-foreground border-b border-border"
                  }`}>
                    {impact.message}
                  </div>
                );
              })()}

              <div className="px-4 py-3 flex gap-2 border-b border-border">
                <button
                  onClick={confirmSwap}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Confirmar troca
                </button>
                <button
                  onClick={() => { setShowImpact(false); setSelectedSub(null); }}
                  className="py-2.5 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground"
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Substitutes list */}
        {!showImpact && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {result.options.map((sub, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleSelect(sub)}
                className={`w-full text-left rounded-xl border p-3 transition-all hover:border-primary/40 ${
                  sub.quality === "good"
                    ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
                    : sub.quality === "warning"
                    ? "border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10"
                    : "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">{qualityEmoji[sub.quality]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{sub.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-muted-foreground">
                      <span>🔥 {sub.kcal}</span>
                      <span>💪 {sub.protein}g</span>
                      <span>🍞 {sub.carbs}g</span>
                      <span>🫙 {sub.fat}g</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">{sub.portion}</p>
                    <p className={`text-[10px] mt-1 font-semibold ${
                      sub.quality === "good" ? "text-green-600 dark:text-green-400"
                        : sub.quality === "warning" ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {sub.summary}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SubstitutionModal;
