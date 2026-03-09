import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";

const GOALS = [
  { key: "emagrecimento", label: "Emagrecimento", emoji: "🔥", desc: "Preservar massa, acelerar metabolismo" },
  { key: "hipertrofia", label: "Hipertrofia", emoji: "💪", desc: "Força, volume, recuperação muscular" },
  { key: "saude_geral", label: "Saúde Geral", emoji: "🌿", desc: "Longevidade, imunidade, bem-estar" },
  { key: "performance", label: "Performance", emoji: "⚡", desc: "Máxima performance esportiva" },
];

const BUDGETS = [
  { key: "essencial", label: "Essencial", range: "R$100–200/mês", desc: "Os 4 mais comprovados" },
  { key: "intermediario", label: "Intermediário", range: "R$200–500/mês", desc: "Stack completo otimizado" },
  { key: "avancado", label: "Avançado", range: "R$500+/mês", desc: "Máxima personalização" },
];

const RESTRICTIONS = [
  "Vegetariano", "Vegano", "Sem Lactose", "Sem Glúten",
];

const CURRENT_SUPPS = [
  "Whey Protein", "Creatina", "Cafeína", "Ômega-3", "Vitamina D3",
  "Magnésio", "Beta-Alanina", "ZMA", "Multivitamínico", "Probiótico",
  "L-Carnitina", "Glutamina", "BCAA", "Melatonina",
];

const CONDITIONS = [
  "Tireoide", "Diabetes", "Hipertensão", "Ansiedade", "Nenhuma",
];

interface Props {
  onComplete: (data: {
    goal: string;
    budget: string;
    restrictions: string[];
    currentSupps: string[];
    conditions: string[];
  }) => void;
  generating: boolean;
}

const SupplementOnboarding = ({ onComplete, generating }: Props) => {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [budget, setBudget] = useState("");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [currentSupps, setCurrentSupps] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (item === "Nenhuma") { setList(["Nenhuma"]); return; }
    const filtered = list.filter(i => i !== "Nenhuma");
    if (filtered.includes(item)) {
      setList(filtered.filter(i => i !== item));
    } else {
      setList([...filtered, item]);
    }
  };

  const canNext = step === 0 ? !!goal : step === 1 ? !!budget : true;

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
    else onComplete({ goal, budget, restrictions, currentSupps, conditions });
  };

  const steps = [
    // Step 0: Goal
    <div key="goal" className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">Qual seu objetivo principal?</h2>
      <p className="text-xs text-muted-foreground">Isso define a prioridade do seu stack</p>
      <div className="space-y-2">
        {GOALS.map(g => (
          <button
            key={g.key}
            onClick={() => setGoal(g.key)}
            className={`w-full p-4 rounded-xl border text-left transition-all ${
              goal === g.key ? "border-purple-500 bg-purple-500/10" : "border-border bg-card hover:border-purple-500/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{g.emoji}</span>
              <div>
                <p className="text-sm font-bold text-foreground">{g.label}</p>
                <p className="text-xs text-muted-foreground">{g.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Budget
    <div key="budget" className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">Orçamento mensal</h2>
      <p className="text-xs text-muted-foreground">A IA otimiza o custo-benefício</p>
      <div className="space-y-2">
        {BUDGETS.map(b => (
          <button
            key={b.key}
            onClick={() => setBudget(b.key)}
            className={`w-full p-4 rounded-xl border text-left transition-all ${
              budget === b.key ? "border-purple-500 bg-purple-500/10" : "border-border bg-card hover:border-purple-500/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">{b.label}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
              <span className="text-xs font-mono text-purple-400">{b.range}</span>
            </div>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Restrictions + Current Supps
    <div key="restrictions" className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Restrições alimentares</h2>
        <div className="flex flex-wrap gap-2 mt-3">
          {RESTRICTIONS.map(r => (
            <button
              key={r}
              onClick={() => toggleItem(restrictions, setRestrictions, r)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                restrictions.includes(r) ? "border-purple-500 bg-purple-500/20 text-purple-300" : "border-border text-muted-foreground hover:border-purple-500/30"
              }`}
            >{r}</button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-foreground mb-2">Suplementos que já usa</h3>
        <div className="flex flex-wrap gap-2">
          {CURRENT_SUPPS.map(s => (
            <button
              key={s}
              onClick={() => toggleItem(currentSupps, setCurrentSupps, s)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                currentSupps.includes(s) ? "border-purple-500 bg-purple-500/20 text-purple-300" : "border-border text-muted-foreground hover:border-purple-500/30"
              }`}
            >{s}</button>
          ))}
        </div>
      </div>
    </div>,

    // Step 3: Health conditions
    <div key="conditions" className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">Condições de saúde</h2>
      <p className="text-xs text-muted-foreground">Para alertas de interação e segurança</p>
      <div className="flex flex-wrap gap-2">
        {CONDITIONS.map(c => (
          <button
            key={c}
            onClick={() => toggleItem(conditions, setConditions, c)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
              conditions.includes(c) ? "border-purple-500 bg-purple-500/20 text-purple-300" : "border-border text-muted-foreground hover:border-purple-500/30"
            }`}
          >{c}</button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-purple-500" : "bg-border"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-card"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canNext || generating}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 disabled:opacity-50 transition-all"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Gerando stack...</>
          ) : step === 3 ? (
            <><Sparkles className="w-4 h-4" /> Gerar Stack com IA</>
          ) : (
            <>Próximo <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default SupplementOnboarding;
