import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Utensils, HelpingHand, Bell, ChevronRight, Check } from "lucide-react";

const TOUR_STEPS = [
  {
    icon: BarChart3,
    emoji: "📊",
    title: "Esse é seu painel de macros.",
    description: "Atualiza em tempo real a cada registro. Proteína, carboidrato e gordura — tudo visual.",
    color: "from-primary to-gold-glow",
  },
  {
    icon: Utensils,
    emoji: "🍴",
    title: "Esses botões são seu salva-vidas.",
    description: "'Comi fora' e 'Refeição Livre' — para quando a vida não segue o plano. Sem culpa.",
    color: "from-accent to-cyan-glow",
  },
  {
    icon: HelpingHand,
    emoji: "🤔",
    title: "Esse botão muda tudo.",
    description: "'E se eu comer?' — antes de qualquer desvio, consulta a IA primeiro. Ela te dá opções sem julgamento.",
    color: "from-orange-500 to-red-500",
  },
];

const ActivationTourPage = () => {
  const [step, setStep] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifTimes, setNotifTimes] = useState({
    cafe: "07:00",
    almoco: "12:00",
    jantar: "19:00",
    lanche: "",
  });
  const [includeLanche, setIncludeLanche] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfile } = useProfile();

  const handleTourNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setShowNotifications(true);
    }
  };

  const handleFinish = async (withNotifications: boolean) => {
    if (user) {
      await updateProfile({ activation_completed: true } as any);
      
      const prefs = withNotifications ? {
        enabled: true,
        times: {
          cafe: notifTimes.cafe,
          almoco: notifTimes.almoco,
          jantar: notifTimes.jantar,
          ...(includeLanche ? { lanche: notifTimes.lanche } : {}),
        },
      } : { enabled: false };

      await supabase.from("activation_metrics").upsert({
        user_id: user.id,
        tour_completed_at: new Date().toISOString(),
        notifications_configured: withNotifications,
        notification_preferences: prefs,
      }, { onConflict: "user_id" });
    }
    navigate("/dashboard");
  };

  // Notification setup
  if (showNotifications) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg space-y-5"
        >
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Último passo!</h1>
            <p className="text-sm text-muted-foreground">
              Quando você quer que eu te avise para registrar?
            </p>
          </div>

          <div className="space-y-3">
            {[
              { key: "cafe", label: "☀️ Café da manhã", value: notifTimes.cafe },
              { key: "almoco", label: "🍽️ Almoço", value: notifTimes.almoco },
              { key: "jantar", label: "🌙 Jantar", value: notifTimes.jantar },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <span className="text-sm font-mono text-foreground">{item.label}</span>
                <input
                  type="time"
                  value={item.value}
                  onChange={(e) => setNotifTimes((prev) => ({ ...prev, [item.key]: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm font-mono focus:outline-none focus:border-primary/50"
                />
              </div>
            ))}

            {!includeLanche ? (
              <button
                onClick={() => setIncludeLanche(true)}
                className="w-full p-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                + Adicionar lanche da tarde 🍎
              </button>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <span className="text-sm font-mono text-foreground">🍎 Lanche da tarde</span>
                <input
                  type="time"
                  value={notifTimes.lanche}
                  onChange={(e) => setNotifTimes((prev) => ({ ...prev, lanche: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm font-mono focus:outline-none focus:border-primary/50"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleFinish(true)}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Sim, me avisa!
            </button>
            <button
              onClick={() => handleFinish(false)}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Prefiro sem notificações
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Tour steps
  const current = TOUR_STEPS[step];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-grid opacity-10" />

      <motion.div className="relative z-10 w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-border"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${current.color} flex items-center justify-center mx-auto shadow-lg`}
            >
              <current.icon className="w-10 h-10 text-white" />
            </motion.div>

            <div>
              <p className="text-3xl mb-3">{current.emoji}</p>
              <h2 className="text-xl font-bold text-foreground mb-3">{current.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">{current.description}</p>
            </div>

            <button
              onClick={handleTourNext}
              className="w-full max-w-xs mx-auto py-4 rounded-xl bg-primary text-primary-foreground font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {step === TOUR_STEPS.length - 1 ? (
                <>
                  <Check className="w-4 h-4" />
                  Entendi — quero usar o app
                </>
              ) : (
                <>
                  Toque para continuar
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground font-mono">
              Passo {step + 1} de {TOUR_STEPS.length}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ActivationTourPage;
