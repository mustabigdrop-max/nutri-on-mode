import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Syringe, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Glp1OnboardingProps {
  onComplete: (data: {
    medication: string;
    currentDose: string;
    durationMonths: number;
    objective: string;
  }) => void;
}

const MEDICATIONS = [
  { id: "ozempic", label: "Ozempic", emoji: "💉" },
  { id: "wegovy", label: "Wegovy", emoji: "💉" },
  { id: "mounjaro", label: "Mounjaro", emoji: "💉" },
  { id: "saxenda", label: "Saxenda", emoji: "💉" },
  { id: "retatrutida", label: "Retatrutida", emoji: "💉" },
  { id: "outro", label: "Outro", emoji: "💊" },
];

const OBJECTIVES = [
  { id: "emagrecer", label: "Emagrecer", emoji: "🔥", desc: "Continuar perdendo peso com segurança" },
  { id: "manter", label: "Manter peso", emoji: "⚖️", desc: "Estabilizar e preservar resultados" },
  { id: "recompor", label: "Recompor corpo", emoji: "💪", desc: "Menos gordura, mais músculo" },
  { id: "parar", label: "Parar o medicamento", emoji: "🚪", desc: "Sair sem reganhar peso" },
];

const Glp1Onboarding = ({ onComplete }: Glp1OnboardingProps) => {
  const [step, setStep] = useState(0);
  const [medication, setMedication] = useState("");
  const [currentDose, setCurrentDose] = useState("");
  const [durationMonths, setDurationMonths] = useState(1);
  const [objective, setObjective] = useState("");

  const handleFinish = () => {
    onComplete({ medication, currentDose, durationMonths, objective });
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="med" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Qual medicamento você usa?</h3>
            <div className="grid grid-cols-2 gap-3">
              {MEDICATIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMedication(m.id); setStep(1); }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    medication === m.id
                      ? "border-accent bg-accent/10"
                      : "border-border bg-secondary/30 hover:border-accent/50"
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <p className="text-sm font-semibold text-foreground mt-1">{m.label}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="dose" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Dose atual e tempo de uso</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Dose atual (ex: 0.5mg, 1mg, 2.4mg)</label>
                <Input
                  value={currentDose}
                  onChange={(e) => setCurrentDose(e.target.value)}
                  placeholder="Ex: 1mg"
                  className="bg-secondary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Há quantos meses usa?</label>
                <Input
                  type="number"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  min={0}
                  max={60}
                  className="bg-secondary/50"
                />
              </div>
            </div>
            <Button onClick={() => setStep(2)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Continuar <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="obj" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Qual seu objetivo atual?</h3>
            <div className="space-y-3">
              {OBJECTIVES.map((o) => (
                <button
                  key={o.id}
                  onClick={() => { setObjective(o.id); }}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    objective === o.id
                      ? "border-accent bg-accent/10"
                      : "border-border bg-secondary/30 hover:border-accent/50"
                  }`}
                >
                  <span className="text-2xl">{o.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{o.label}</p>
                    <p className="text-xs text-muted-foreground">{o.desc}</p>
                  </div>
                  {objective === o.id && <Check className="w-5 h-5 text-accent ml-auto" />}
                </button>
              ))}
            </div>
            {objective && (
              <Button onClick={handleFinish} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Syringe className="w-4 h-4 mr-2" /> Iniciar Protocolo
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step indicator */}
      <div className="flex gap-2 justify-center">
        {[0, 1, 2].map((s) => (
          <div key={s} className={`w-2 h-2 rounded-full transition-colors ${s <= step ? "bg-accent" : "bg-border"}`} />
        ))}
      </div>
    </div>
  );
};

export default Glp1Onboarding;
