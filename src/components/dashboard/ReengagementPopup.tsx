import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Mic, MessageSquare, Utensils, X } from "lucide-react";

interface ReengagementPopupProps {
  hasMealsToday: boolean;
}

const ReengagementPopup = ({ hasMealsToday }: ReengagementPopupProps) => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (hasMealsToday || dismissed || !user) return;

    // Show popup after 2 minutes of inactivity on dashboard without meals
    const timer = setTimeout(() => {
      setShow(true);
    }, 120000); // 2 minutes

    return () => clearTimeout(timer);
  }, [hasMealsToday, dismissed, user]);

  // Also track last_app_open
  useEffect(() => {
    if (!user) return;
    supabase.from("activation_metrics").upsert({
      user_id: user.id,
      last_app_open: new Date().toISOString(),
    }, { onConflict: "user_id" }).then(() => {});
  }, [user]);

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
  };

  const handleAction = (action: string) => {
    setDismissed(true);
    setShow(false);
    if (action === "register") navigate("/meal-log");
    if (action === "suggestion") navigate("/recipes");
    if (action === "voice") navigate("/meal-log");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 left-4 right-4 z-50 max-w-lg mx-auto"
        >
          <div className="rounded-2xl border border-primary/20 bg-card shadow-2xl shadow-primary/10 p-5">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-sm text-foreground mb-4">
              Precisando de ajuda para começar? 😊
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleAction("register")}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors text-left"
              >
                <Utensils className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">Ver o que registrar agora</span>
              </button>
              <button
                onClick={() => handleAction("suggestion")}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors text-left"
              >
                <MessageSquare className="w-5 h-5 text-accent" />
                <span className="text-sm text-foreground">Me manda uma sugestão de refeição</span>
              </button>
              <button
                onClick={() => handleAction("voice")}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors text-left"
              >
                <Mic className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">Registrar por voz — é mais fácil</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReengagementPopup;
