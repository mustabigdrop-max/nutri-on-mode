import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getLocalDateStr } from "@/lib/utils";

type MuscleState = "flat" | "full" | "spilled";

const STATES: { key: MuscleState; emoji: string; label: string; color: string; bg: string }[] = [
  { key: "flat", emoji: "😞", label: "Flat", color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" },
  { key: "full", emoji: "💪", label: "Full", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30" },
  { key: "spilled", emoji: "🔥", label: "Spilled", color: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/30" },
];

const MuscleStateCard = () => {
  const { user } = useAuth();
  const [todayState, setTodayState] = useState<MuscleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const today = getLocalDateStr();
    supabase
      .from("muscle_state_checkins" as any)
      .select("state")
      .eq("user_id", user.id)
      .eq("checkin_date", today)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setTodayState((data as any).state as MuscleState);
        setLoading(false);
      });
  }, [user]);

  const handleSelect = async (state: MuscleState) => {
    if (!user || saving) return;
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("muscle_state_checkins" as any).upsert(
      { user_id: user.id, checkin_date: today, state } as any,
      { onConflict: "user_id,checkin_date" }
    );
    setTodayState(state);
    setSaving(false);
  };

  const selectedInfo = todayState ? STATES.find(s => s.key === todayState) : null;

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">🪞</span>
        <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Estado Muscular</h3>
      </div>

      <AnimatePresence mode="wait">
        {todayState && selectedInfo ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg border p-4 text-center ${selectedInfo.bg}`}
          >
            <span className="text-3xl">{selectedInfo.emoji}</span>
            <p className={`text-sm font-bold font-mono mt-1 ${selectedInfo.color}`}>{selectedInfo.label}</p>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Check-in de hoje registrado</p>
          </motion.div>
        ) : (
          <motion.div key="buttons" className="grid grid-cols-3 gap-2">
            {STATES.map((s) => (
              <button
                key={s.key}
                disabled={saving}
                onClick={() => handleSelect(s.key)}
                className={`rounded-lg border border-border bg-secondary/50 p-3 text-center transition-all hover:scale-105 hover:border-primary/40 disabled:opacity-50`}
              >
                <span className="text-2xl block">{s.emoji}</span>
                <span className={`text-[10px] font-mono font-bold block mt-1 ${s.color}`}>{s.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MuscleStateCard;
