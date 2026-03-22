import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserCheck, Database, MessageSquare } from "lucide-react";

interface LabOnboardingProps {
  onComplete: () => void;
  onAskQuestion: (q: string) => void;
}

const STEPS = [
  { icon: UserCheck, title: "O APEX conhece você", desc: "Carregamos seu perfil completo para respostas personalizadas." },
  { icon: Database, title: "Acesso a ciência de 2025", desc: "Conectado a PubMed, ISSN e bases científicas em tempo real." },
  { icon: MessageSquare, title: "Sua primeira pergunta", desc: "Faça uma pergunta e veja a diferença." },
];

const SUGGESTIONS = [
  "Posso tomar creatina no cutting?",
  "Como preservar músculo no deficit?",
  "Qual suplemento vale mais a pena para mim?",
];

const LabOnboarding = ({ onComplete, onAskQuestion }: LabOnboardingProps) => {
  const [step, setStep] = useState(0);
  const StepIcon = STEPS[step].icon;

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-8 relative z-10">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <StepIcon className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{STEPS[step].title}</h2>
        <p className="text-sm text-muted-foreground">{STEPS[step].desc}</p>

        {step === 2 ? (
          <div className="space-y-2 pt-4">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onAskQuestion(suggestion)}
                className="w-full text-left px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/40 text-sm text-foreground transition-all"
              >
                💬 {suggestion}
              </button>
            ))}
            <Button type="button" variant="ghost" onClick={onComplete} className="w-full text-muted-foreground text-xs mt-2">
              Pular e explorar o LAB
            </Button>
          </div>
        ) : (
          <Button type="button" onClick={() => setStep((current) => Math.min(current + 1, 2))} className="w-full h-11 relative z-20">
            Continuar →
          </Button>
        )}

        <div className="flex gap-2 justify-center pt-2">
          {[0, 1, 2].map((index) => (
            <div key={index} className={`w-2 h-2 rounded-full ${index === step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LabOnboarding;
