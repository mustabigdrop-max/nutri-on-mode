import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Sunrise, Clock } from "lucide-react";
import { CHRONOTYPES, PEAK_OPTIONS } from "@/hooks/useCircadian";

interface Props {
  onComplete: (data: {
    wake_time: string;
    sleep_time: string;
    chronotype: string;
    peak_energy: string;
    meal_frequency: number;
  }) => void;
  saving?: boolean;
}

const CircadianOnboarding = ({ onComplete, saving }: Props) => {
  const [step, setStep] = useState(0);
  const [wakeTime, setWakeTime] = useState("06:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [chronotype, setChronotype] = useState("intermediario");
  const [peakEnergy, setPeakEnergy] = useState("morning");
  const [mealFrequency, setMealFrequency] = useState(5);

  const steps = [
    // Step 0: Wake/Sleep times
    <div key="times" className="space-y-6">
      <h3 className="text-lg font-bold text-foreground">⏰ Seus Horários</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Sunrise className="w-3 h-3 text-orange-400" /> Acorda
          </label>
          <input
            type="time"
            value={wakeTime}
            onChange={e => setWakeTime(e.target.value)}
            className="w-full px-3 py-3 rounded-xl bg-card border border-border text-foreground text-center text-lg font-mono focus:ring-2 focus:ring-orange-400/40 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Moon className="w-3 h-3 text-indigo-400" /> Dorme
          </label>
          <input
            type="time"
            value={sleepTime}
            onChange={e => setSleepTime(e.target.value)}
            className="w-full px-3 py-3 rounded-xl bg-card border border-border text-foreground text-center text-lg font-mono focus:ring-2 focus:ring-indigo-400/40 focus:outline-none"
          />
        </div>
      </div>
    </div>,

    // Step 1: Chronotype
    <div key="chrono" className="space-y-4">
      <h3 className="text-lg font-bold text-foreground">🧬 Seu Cronotipo</h3>
      <p className="text-xs text-muted-foreground">Como é seu ritmo natural de energia?</p>
      <div className="space-y-3">
        {CHRONOTYPES.map(ct => (
          <button
            key={ct.key}
            onClick={() => setChronotype(ct.key)}
            className={`w-full p-4 rounded-xl border text-left transition-all ${
              chronotype === ct.key
                ? "border-orange-400 bg-orange-400/10 shadow-[0_0_20px_hsl(24_95%_53%/0.15)]"
                : "border-border bg-card hover:border-orange-400/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ct.emoji}</span>
              <div>
                <p className="font-semibold text-foreground text-sm">{ct.label}</p>
                <p className="text-xs text-muted-foreground">{ct.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Peak energy + meal frequency
    <div key="energy" className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">⚡ Pico de Energia</h3>
        <div className="grid grid-cols-2 gap-2">
          {PEAK_OPTIONS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeakEnergy(p.key)}
              className={`p-3 rounded-xl border text-center transition-all ${
                peakEnergy === p.key
                  ? "border-orange-400 bg-orange-400/10"
                  : "border-border bg-card hover:border-orange-400/30"
              }`}
            >
              <span className="text-xl">{p.emoji}</span>
              <p className="text-xs font-semibold text-foreground mt-1">{p.label}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">🍽️ Frequência de Refeições</h3>
        <div className="flex gap-2">
          {[3, 4, 5, 6].map(n => (
            <button
              key={n}
              onClick={() => setMealFrequency(n)}
              className={`flex-1 py-3 rounded-xl border font-bold text-lg transition-all ${
                mealFrequency === n
                  ? "border-orange-400 bg-orange-400/10 text-orange-400"
                  : "border-border bg-card text-foreground hover:border-orange-400/30"
              }`}
            >
              {n}x
            </button>
          ))}
        </div>
      </div>
    </div>,
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({ wake_time: wakeTime, sleep_time: sleepTime, chronotype, peak_energy: peakEnergy, meal_frequency: mealFrequency });
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {steps.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? "bg-orange-400 w-6" : i < step ? "bg-orange-400/50" : "bg-border"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold">
            Voltar
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={saving}
          className="flex-1 py-3 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_20px_hsl(24_95%_53%/0.3)] hover:shadow-[0_0_30px_hsl(24_95%_53%/0.5)] disabled:opacity-50"
        >
          {saving ? "Salvando..." : step < steps.length - 1 ? "Próximo →" : "🌅 Ativar Nutrição Circadiana"}
        </button>
      </div>
    </div>
  );
};

export default CircadianOnboarding;
