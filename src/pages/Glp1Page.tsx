import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Syringe, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGlp1 } from "@/hooks/useGlp1";
import { useProfile } from "@/hooks/useProfile";
import Glp1Onboarding from "@/components/glp1/Glp1Onboarding";
import Glp1Dashboard from "@/components/glp1/Glp1Dashboard";
import Glp1UpsellModal from "@/components/glp1/Glp1UpsellModal";
import BottomNav from "@/components/BottomNav";

const Glp1Page = () => {
  const navigate = useNavigate();
  const { profile: glp1Profile, hasSubscription, dailyLogs, weeklyScores, loading, saveProfile, saveDailyLog, activateSubscription } = useGlp1();
  const { profile: userProfile } = useProfile();
  const [showUpsell, setShowUpsell] = useState(false);
  const [justActivated, setJustActivated] = useState(false);

  const weightKg = userProfile?.weight_kg || 70;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If no subscription, show upsell gate
  if (!hasSubscription && !justActivated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-6 pb-24">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Syringe className="w-5 h-5 text-accent" />
              <h1 className="text-xl font-bold text-foreground font-display">Protocolo GLP-1</h1>
            </div>
          </div>

          {/* Preview + Upsell trigger */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center space-y-4 py-8">
              <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto">
                <Syringe className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Protocolo GLP-1 Pro</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Módulo exclusivo para quem usa Ozempic, Wegovy, Mounjaro ou similares. 
                Proteja sua massa muscular e maximize seus resultados.
              </p>
              <button
                onClick={() => setShowUpsell(true)}
                className="px-8 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Ativar por R$97/mês
              </button>
            </div>
          </motion.div>
        </div>

        <Glp1UpsellModal
          open={showUpsell}
          onClose={() => setShowUpsell(false)}
          onActivate={() => {
            activateSubscription("page");
            setShowUpsell(false);
            setJustActivated(true);
          }}
        />
        <BottomNav />
      </div>
    );
  }

  // Post-activation animation
  if (justActivated && !glp1Profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-6 pb-24">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Syringe className="w-5 h-5 text-accent" />
              <h1 className="text-xl font-bold text-foreground font-display">Protocolo GLP-1 Pro</h1>
            </div>
            <span className="ml-auto px-2 py-0.5 text-[.6rem] font-bold rounded-full bg-accent/20 text-accent border border-accent/30">ATIVO</span>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4 mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: 1 }}
              className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto"
            >
              <Syringe className="w-8 h-8 text-accent" />
            </motion.div>
            <p className="text-sm text-accent font-semibold">Protocolo ativado!</p>
            <p className="text-xs text-muted-foreground">Sua jornada de transformação real começa agora.</p>
          </motion.div>

          <Glp1Onboarding
            onComplete={(data) => {
              saveProfile({
                medication: data.medication,
                current_dose: data.currentDose,
                duration_months: data.durationMonths,
                objective: data.objective,
              });
            }}
          />
        </div>
        <BottomNav />
      </div>
    );
  }

  // Main dashboard (has profile)
  if (!glp1Profile) {
    // Has subscription but no profile yet — onboard
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-6 pb-24">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Syringe className="w-5 h-5 text-accent" />
              <h1 className="text-xl font-bold text-foreground font-display">Protocolo GLP-1 Pro</h1>
            </div>
            <span className="ml-auto px-2 py-0.5 text-[.6rem] font-bold rounded-full bg-accent/20 text-accent border border-accent/30">ATIVO</span>
          </div>

          <Glp1Onboarding
            onComplete={(data) => {
              saveProfile({
                medication: data.medication,
                current_dose: data.currentDose,
                duration_months: data.durationMonths,
                objective: data.objective,
              });
            }}
          />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-accent" />
            <h1 className="text-xl font-bold text-foreground font-display">Protocolo GLP-1 Pro</h1>
          </div>
          <span className="ml-auto px-2 py-0.5 text-[.6rem] font-bold rounded-full bg-accent/20 text-accent border border-accent/30">ATIVO</span>
        </div>

        <Glp1Dashboard
          profile={glp1Profile}
          dailyLogs={dailyLogs}
          weeklyScores={weeklyScores}
          weightKg={weightKg}
          onSaveDailyLog={saveDailyLog}
        />
      </div>
      <BottomNav />
    </div>
  );
};

export default Glp1Page;
