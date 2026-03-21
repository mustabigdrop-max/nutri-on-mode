import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, ChevronUp } from "lucide-react";

export type MuscleStateType = "flat" | "full" | "spilled";

interface MuscleStateOption {
  key: MuscleStateType;
  emoji: string;
  label: string;
  sublabel: string;
  tip: string;
  carbAdj: number; // multiplier: 0.85 | 1.0 | 1.15
  color: string;
  badge: string;
  badgeColor: string;
}

const MUSCLE_STATES: MuscleStateOption[] = [
  {
    key: "flat",
    emoji: "😶",
    label: "Flat",
    sublabel: "Músculo murcho, achatado",
    tip: "Glicogênio baixo. Adiciona +15% de carbos nas próximas refeições.",
    carbAdj: 1.15,
    color: "border-accent/30 bg-accent/5",
    badge: "+15% carbos",
    badgeColor: "bg-accent/15 text-accent",
  },
  {
    key: "full",
    emoji: "💪",
    label: "Full",
    sublabel: "Cheio, volumizado",
    tip: "Glicogênio no nível ideal. Mantém o protocolo atual.",
    carbAdj: 1.0,
    color: "border-primary/30 bg-primary/5",
    badge: "No alvo",
    badgeColor: "bg-primary/15 text-primary",
  },
  {
    key: "spilled",
    emoji: "💧",
    label: "Spilled",
    sublabel: "Extravasado, retendo água",
    tip: "Reduz -15% de carbos hoje. Prioriza proteína e hidratação limpa.",
    carbAdj: 0.85,
    color: "border-destructive/30 bg-destructive/5",
    badge: "-15% carbos",
    badgeColor: "bg-destructive/15 text-destructive",
  },
];

interface Props {
  onStateSelected: (state: MuscleStateType | null, carbAdj: number) => void;
}

const MuscleStateCard = ({ onStateSelected }: Props) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<MuscleStateOption | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkToday = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("muscle_state_checkins" as any)
        .select("state")
        .eq("user_id", user.id)
        .eq("checkin_date", today)
        .maybeSingle();

      if (data) {
        const opt = MUSCLE_STATES.find(s => s.key === (data as any).state);
        if (opt) {
          setSelected(opt);
          onStateSelected(opt.key, opt.carbAdj);
        }
      } else {
        setExpanded(true);
      }
      setLoaded(true);
    };
    checkToday();
  }, [user]);

  const handleSelect = async (opt: MuscleStateOption) => {
    setSelected(opt);
    setExpanded(false);
    onStateSelected(opt.key, opt.carbAdj);

    if (user) {
      const today = new Date().toISOString().split("T")[0];
      await supabase.from("muscle_state_checkins" as any).upsert({
        user_id: user.id,
        state: opt.key,
        checkin_date: today,
      } as any, { onConflict: "user_id,checkin_date" });
    }
  };

  if (!loaded) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="mb-4"
    >
      {/* Header / collapsed state */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border bg-card hover:border-primary/25 transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{selected ? selected.emoji : "🏋️"}</span>
          <div className="text-left">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-none">Estado Muscular</p>
            {selected ? (
              <p className="text-xs font-mono font-bold text-foreground leading-tight mt-0.5">
                {selected.label}
                <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-full font-mono ${selected.badgeColor}`}>
                  {selected.badge}
                </span>
              </p>
            ) : (
              <p className="text-xs font-mono text-muted-foreground leading-tight mt-0.5">Como está seu músculo hoje?</p>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {/* Expanded selector */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              {MUSCLE_STATES.map((opt) => (
                <motion.button
                  key={opt.key}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(opt)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${opt.color} ${
                    selected?.key === opt.key ? "ring-1 ring-primary/40" : "hover:opacity-90"
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-mono font-bold text-foreground">{opt.label}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${opt.badgeColor}`}>
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground">{opt.sublabel}</p>
                  </div>
                </motion.button>
              ))}

              {/* Tip section */}
              <p className="text-[10px] font-mono text-muted-foreground/60 text-center px-2 pb-1">
                Flat/Full/Spilled — avaliação visual do estado de glicogênio muscular
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tip banner when selected */}
      <AnimatePresence>
        {selected && !expanded && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-1.5 rounded-lg border px-3 py-2 ${selected.color}`}
          >
            <p className="text-[10px] font-mono text-foreground leading-relaxed">
              💡 {selected.tip}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MuscleStateCard;
export { MUSCLE_STATES };
export type { MuscleStateOption };
