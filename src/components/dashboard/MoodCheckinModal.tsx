import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react";

export type MoodType = "cansado" | "estressado" | "animado" | "normal";

interface MoodOption {
  key: MoodType;
  emoji: string;
  label: string;
  message: string;
  color: string;
}

const MOODS: MoodOption[] = [
  {
    key: "cansado",
    emoji: "😴",
    label: "Cansado",
    message: "Dia pesado. Foca só nas 3 refeições principais — isso já é suficiente pra manter o progresso. 💪",
    color: "border-accent/30 bg-accent/5",
  },
  {
    key: "estressado",
    emoji: "😰",
    label: "Estressado",
    message: "Estresse e fome têm sintomas parecidos. Antes de comer algo fora do plano, bebe um copo d'água e espera 10 minutos. 🧘",
    color: "border-destructive/30 bg-destructive/5",
  },
  {
    key: "animado",
    emoji: "😊",
    label: "Animado",
    message: "Hoje é um bom dia pra bater TODAS as metas. Modo desafio ativado! 🎯🔥",
    color: "border-primary/30 bg-primary/5",
  },
  {
    key: "normal",
    emoji: "😐",
    label: "Normal",
    message: "Plano padrão ativado. Vamos manter a consistência! ✅",
    color: "border-border bg-card/50",
  },
];

interface Props {
  userName: string;
  onMoodSelected: (mood: MoodType) => void;
}

const MoodCheckinModal = ({ userName, onMoodSelected }: Props) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkToday = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("mood_checkins" as any)
        .select("mood")
        .eq("user_id", user.id)
        .eq("checkin_date", today)
        .maybeSingle();

      if (data) {
        onMoodSelected((data as any).mood as MoodType);
      } else {
        // Small delay so dashboard renders first
        setTimeout(() => setOpen(true), 800);
      }
    };
    checkToday();
  }, [user]);

  const handleSelect = async (mood: MoodOption) => {
    setSelectedMood(mood);
    setShowMessage(true);

    if (user) {
      const today = new Date().toISOString().split("T")[0];
      await supabase.from("mood_checkins" as any).upsert({
        user_id: user.id,
        mood: mood.key,
        checkin_date: today,
      } as any, { onConflict: "user_id,checkin_date" });
    }

    onMoodSelected(mood.key);

    setTimeout(() => {
      setOpen(false);
      setShowMessage(false);
    }, 3000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => { setOpen(false); onMoodSelected("normal"); }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <button
              onClick={() => { setOpen(false); onMoodSelected("normal"); }}
              className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <AnimatePresence mode="wait">
              {!showMessage ? (
                <motion.div
                  key="select"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <p className="text-center text-lg font-bold text-foreground mb-1">
                    Como você está hoje, {userName}?
                  </p>
                  <p className="text-center text-xs text-muted-foreground font-mono mb-6">
                    Isso ajuda a adaptar seu plano do dia
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {MOODS.map((mood) => (
                      <motion.button
                        key={mood.key}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelect(mood)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:shadow-md ${mood.color}`}
                      >
                        <span className="text-3xl">{mood.emoji}</span>
                        <span className="text-sm font-mono text-foreground font-medium">{mood.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="message"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-center py-4"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="text-5xl block mb-4"
                  >
                    {selectedMood?.emoji}
                  </motion.span>
                  <p className="text-sm text-foreground leading-relaxed font-mono">
                    {selectedMood?.message}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MoodCheckinModal;
export { MOODS };
export type { MoodOption };
