import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserCheck, Database, MessageSquare } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

interface LabOnboardingProps {
  onComplete: () => void;
  onAskQuestion: (q: string) => void;
}

const STEPS = [
  { icon: UserCheck, title: "O APEX conhece você", desc: "Carregamos seu perfil completo para respostas personalizadas." },
  { icon: Database, title: "Acesso a ciência de 2025", desc: "Conectado a PubMed, ISSN e bases científicas em tempo real." },
  { icon: MessageSquare, title: "Sua primeira pergunta", desc: "Faça uma pergunta e veja a diferença." },
];

const SUGGESTIONS: Record<string, string[]> = {
  hipertrofia: ["Qual a dose ideal de creatina para mim?", "Como otimizar meu pós-treino?", "Whey concentrado ou isolado?"],
  emagrecimento: ["Como preservar músculo no deficit?", "Jejum intermitente corta músculo?", "Qual suplemento para secar?"],
  default: ["Posso tomar creatina no cutting?", "Quanto de cafeína é seguro?", "Qual suplemento vale mais a pena?"],
};

const LabOnboarding = ({ onComplete, onAskQuestion }: LabOnboardingProps) => {
  const [step, setStep] = useState(0);
  const { profile } = useProfile();
  const goal = profile?.goal || profile?.objetivo_principal || "default";
  const suggestions = SUGGESTIONS[goal] || SUGGESTIONS.default;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-8">
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center max-w-sm space-y-6">
          {step < 3 ? (
            <>
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                {(() => { const Icon = STEPS[step].icon; return <Icon className="w-8 h-8 text-primary" />; })()}
              </div>
              <h2 className="text-xl font-bold text-foreground">{STEPS[step].title}</h2>
              <p className="text-sm text-muted-foreground">{STEPS[step].desc}</p>
              
              {step === 2 ? (
                <div className="space-y-2 pt-4">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => { onAskQuestion(s); onComplete(); }}
                      className="w-full text-left px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/40 text-sm text-foreground transition-all">
                      💬 {s}
                    </button>
                  ))}
                  <Button variant="ghost" onClick={onComplete} className="w-full text-muted-foreground text-xs mt-2">
                    Pular e explorar o LAB
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setStep(step + 1)} className="w-full h-11">
                  Continuar →
                </Button>
              )}
              
              <div className="flex gap-2 justify-center pt-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === step ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LabOnboarding;
