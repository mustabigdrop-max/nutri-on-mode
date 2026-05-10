import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, RefreshCw, GripVertical, ChevronDown, Flame, Beef, Wheat, Droplet,
  Clock, Activity, Lightbulb, Zap
} from "lucide-react";

interface PlanItemLike {
  id: string;
  meal_type: string;
  food_name: string;
  portion: string | null;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confirmed: boolean;
  swapped: boolean;
}

interface Props {
  item: PlanItemLike;
  mealLabel: string;
  tag?: "pre" | "post" | null;
  isDragging?: boolean;
  onConfirm: () => void;
  onSwap: () => void;
  onDragStart?: () => void;
  onDrop?: () => void;
  // Optional NutriPlan Elite per-meal enrichment (Phase 3 will populate from backend)
  funcao_metabolica?: string;
  janela_metabolica?: string;
  protocolo_peri_workout?: string;
  mensagem_mce?: string;
  insights_ia?: string[];
}

export default function ExpandableMealCard({
  item, mealLabel, tag, isDragging,
  onConfirm, onSwap, onDragStart, onDrop,
  funcao_metabolica, janela_metabolica, protocolo_peri_workout, mensagem_mce, insights_ia,
}: Props) {
  const [open, setOpen] = useState(false);

  const total = item.protein_g * 4 + item.carbs_g * 4 + item.fat_g * 9 || 1;
  const pPct = Math.round((item.protein_g * 4 / total) * 100);
  const cPct = Math.round((item.carbs_g * 4 / total) * 100);
  const fPct = 100 - pPct - cPct;

  const hasEnrichment = !!(funcao_metabolica || janela_metabolica || protocolo_peri_workout || mensagem_mce || (insights_ia && insights_ia.length));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`relative rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
        tag === "pre" ? "border-l-2 border-l-accent " : tag === "post" ? "border-l-2 border-l-primary " : ""
      }${
        item.confirmed
          ? "bg-primary/10 border-primary/20"
          : isDragging
          ? "bg-accent/10 border-accent/30 scale-[0.98]"
          : "bg-card border-border"
      }`}
    >
      {tag && (
        <span className={`absolute top-1.5 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded ${
          tag === "pre" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
        }`}>
          {tag === "pre" ? "Pré ⚡" : "Pós 💪"}
        </span>
      )}

      <div className="p-3">
        <div className="flex items-start gap-2">
          <div className="mt-1.5 text-muted-foreground/40">
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          <button
            onClick={onConfirm}
            className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
              item.confirmed
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <Check className="w-4 h-4" />
          </button>

          <button onClick={() => setOpen(o => !o)} className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-primary uppercase tracking-wider">{mealLabel}</span>
              {item.swapped && (
                <span className="text-[9px] font-mono text-accent px-1.5 py-0.5 rounded bg-accent/10">trocado</span>
              )}
            </div>
            <p className={`text-sm font-semibold truncate ${item.confirmed ? "text-primary" : "text-foreground"}`}>
              {item.food_name}
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              {item.portion} · {item.kcal}kcal · {item.protein_g}g prot
            </p>
          </button>

          <button
            onClick={() => setOpen(o => !o)}
            className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-all flex-shrink-0"
            aria-label="Expandir"
          >
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </button>

          <button
            onClick={onSwap}
            className="mt-0.5 w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-all flex-shrink-0"
            title="Substituir"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-border/60 space-y-3">
                {/* Macro breakdown */}
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Flame className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Macros</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
                    <div className="bg-rose-500" style={{ width: `${pPct}%` }} />
                    <div className="bg-amber-500" style={{ width: `${cPct}%` }} />
                    <div className="bg-sky-500" style={{ width: `${fPct}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-rose-400">
                        <Beef className="w-3 h-3" />
                        <span className="text-[9px] font-mono uppercase">Prot</span>
                      </div>
                      <p className="text-sm font-bold font-mono text-foreground">{item.protein_g}g</p>
                      <span className="text-[9px] font-mono text-muted-foreground">{pPct}%</span>
                    </div>
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-amber-400">
                        <Wheat className="w-3 h-3" />
                        <span className="text-[9px] font-mono uppercase">Carb</span>
                      </div>
                      <p className="text-sm font-bold font-mono text-foreground">{item.carbs_g}g</p>
                      <span className="text-[9px] font-mono text-muted-foreground">{cPct}%</span>
                    </div>
                    <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-sky-400">
                        <Droplet className="w-3 h-3" />
                        <span className="text-[9px] font-mono uppercase">Gord</span>
                      </div>
                      <p className="text-sm font-bold font-mono text-foreground">{item.fat_g}g</p>
                      <span className="text-[9px] font-mono text-muted-foreground">{fPct}%</span>
                    </div>
                  </div>
                </div>

                {/* NutriPlan Elite enrichment (when available) */}
                {hasEnrichment && (
                  <div className="space-y-2">
                    {funcao_metabolica && (
                      <div className="flex items-start gap-2 text-[11px] text-foreground/90">
                        <Activity className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-primary">Função:</span> {funcao_metabolica}
                        </div>
                      </div>
                    )}
                    {janela_metabolica && (
                      <div className="flex items-start gap-2 text-[11px] text-foreground/90">
                        <Clock className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-amber-400">Janela:</span> {janela_metabolica}
                        </div>
                      </div>
                    )}
                    {protocolo_peri_workout && (
                      <div className="flex items-start gap-2 text-[11px] text-foreground/90">
                        <Zap className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-accent">Peri-treino:</span> {protocolo_peri_workout}
                        </div>
                      </div>
                    )}
                    {mensagem_mce && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-2 text-[11px] text-foreground/90">
                        <span className="font-semibold text-primary">MCE:</span> {mensagem_mce}
                      </div>
                    )}
                    {insights_ia && insights_ia.length > 0 && (
                      <div className="space-y-1">
                        {insights_ia.map((ins, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                            <Lightbulb className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                            <span>{ins}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!hasEnrichment && (
                  <p className="text-[10px] font-mono text-muted-foreground/60 italic">
                    Insights metabólicos disponíveis após a Fase 3 (enriquecimento por refeição).
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
