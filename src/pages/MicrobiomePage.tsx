import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bug, Sparkles, Check, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const BRISTOL_SCALE = [
  { type: 1, label: "Tipo 1", desc: "Bolinhas duras e separadas", emoji: "💎", health: "Constipação severa", color: "bg-destructive" },
  { type: 2, label: "Tipo 2", desc: "Formato de salsicha com caroços", emoji: "🪵", health: "Constipação leve", color: "bg-destructive/70" },
  { type: 3, label: "Tipo 3", desc: "Salsicha com rachaduras na superfície", emoji: "🌾", health: "Normal", color: "bg-primary" },
  { type: 4, label: "Tipo 4", desc: "Formato de salsicha liso e macio", emoji: "✅", health: "Ideal", color: "bg-primary" },
  { type: 5, label: "Tipo 5", desc: "Pedaços macios com bordas definidas", emoji: "🧩", health: "Normal/Leve irregularidade", color: "bg-accent" },
  { type: 6, label: "Tipo 6", desc: "Pedaços fofos, pastoso", emoji: "☁️", health: "Tendência a diarreia", color: "bg-accent/70" },
  { type: 7, label: "Tipo 7", desc: "Totalmente líquido", emoji: "💧", health: "Diarreia", color: "bg-destructive" },
];

const GUT_QUESTIONS = [
  { id: "bloating", question: "Com que frequência sente inchaço abdominal?", options: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"] },
  { id: "gas", question: "Frequência de gases excessivos?", options: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"] },
  { id: "fiber", question: "Quantidade de fibras na dieta?", options: ["Muito baixa", "Baixa", "Moderada", "Alta", "Muito alta"] },
  { id: "fermented", question: "Consome alimentos fermentados? (iogurte, kefir, kombucha)", options: ["Nunca", "1x/semana", "2-3x/semana", "Diariamente", "Múltiplas vezes/dia"] },
  { id: "antibiotics", question: "Usou antibióticos nos últimos 6 meses?", options: ["Não", "1 vez", "2-3 vezes", "Mais de 3 vezes"] },
  { id: "stress", question: "Nível de estresse no dia a dia?", options: ["Muito baixo", "Baixo", "Moderado", "Alto", "Muito alto"] },
];

const GUT_DIMENSIONS = [
  { id: "diversity", label: "Diversidade", icon: "🌈", desc: "Variedade de microrganismos" },
  { id: "barrier", label: "Barreira Intestinal", icon: "🛡️", desc: "Integridade da mucosa" },
  { id: "inflammation", label: "Inflamação", icon: "🔥", desc: "Marcadores inflamatórios" },
  { id: "motility", label: "Motilidade", icon: "⚡", desc: "Trânsito intestinal" },
];

interface FoodRec {
  name: string;
  type: "prebiotic" | "probiotic" | "anti-inflammatory" | "fiber";
  benefit: string;
}

const FOOD_RECOMMENDATIONS: FoodRec[] = [
  { name: "Kefir", type: "probiotic", benefit: "Lactobacilos + leveduras — diversifica microbiota" },
  { name: "Kombucha", type: "probiotic", benefit: "Acetobacter + polifenóis — saúde intestinal" },
  { name: "Iogurte natural", type: "probiotic", benefit: "Lactobacillus + Bifidobacterium" },
  { name: "Chucrute", type: "probiotic", benefit: "Fermentação natural — diversidade bacteriana" },
  { name: "Banana verde", type: "prebiotic", benefit: "Amido resistente — alimenta bactérias boas" },
  { name: "Alho", type: "prebiotic", benefit: "Inulina + FOS — prebiótico potente" },
  { name: "Cebola", type: "prebiotic", benefit: "FOS — alimenta Bifidobacterium" },
  { name: "Aveia", type: "fiber", benefit: "Beta-glucana — alimenta microbiota e reduz colesterol" },
  { name: "Linhaça", type: "fiber", benefit: "Fibra solúvel + lignanas — anti-inflamatório" },
  { name: "Açafrão (Cúrcuma)", type: "anti-inflammatory", benefit: "Curcumina — potente anti-inflamatório intestinal" },
  { name: "Gengibre", type: "anti-inflammatory", benefit: "Gingerol — reduz inflamação GI" },
  { name: "Folhas escuras", type: "fiber", benefit: "Fibra + magnésio — motilidade e diversidade" },
];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  probiotic: { bg: "bg-primary/10", text: "text-primary" },
  prebiotic: { bg: "bg-accent/10", text: "text-accent" },
  fiber: { bg: "bg-cyan/10", text: "text-cyan" },
  "anti-inflammatory": { bg: "bg-destructive/10", text: "text-destructive" },
};

const MicrobiomePage = () => {
  const navigate = useNavigate();
  const [bristolType, setBristolType] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const allAnswered = Object.keys(answers).length === GUT_QUESTIONS.length && bristolType !== null;

  const calculateScores = () => {
    if (!allAnswered) return null;

    // Simple scoring algorithm based on answers
    const bloating = answers.bloating || 0;
    const gas = answers.gas || 0;
    const fiber = answers.fiber || 0;
    const fermented = answers.fermented || 0;
    const antibiotics = answers.antibiotics || 0;
    const stress = answers.stress || 0;

    const diversityScore = Math.min(100, Math.max(10, 
      50 + (fermented * 12) + (fiber * 8) - (antibiotics * 15) - (stress * 5)
    ));
    const barrierScore = Math.min(100, Math.max(10,
      60 - (bloating * 8) - (stress * 10) + (fiber * 10) - (antibiotics * 10)
    ));
    const inflammationScore = Math.min(100, Math.max(10,
      70 - (gas * 8) - (bloating * 6) - (stress * 8) + (fermented * 5)
    ));

    const bristolOk = bristolType !== null && bristolType >= 3 && bristolType <= 5;
    const motilityScore = bristolOk ? 80 : bristolType !== null && (bristolType === 2 || bristolType === 6) ? 50 : 25;

    return {
      diversity: Math.round(diversityScore),
      barrier: Math.round(barrierScore),
      inflammation: Math.round(inflammationScore),
      motility: Math.round(motilityScore),
    };
  };

  const scores = calculateScores();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-border">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Perfil de Microbioma</h1>
            <p className="text-xs text-muted-foreground font-mono">Saúde intestinal & microbiota</p>
          </div>
          <Bug className="w-5 h-5 text-primary ml-auto" />
        </div>

        {!showResults ? (
          <div className="space-y-6">
            {/* Bristol Scale */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-1">🚽 Escala de Bristol</h3>
              <p className="text-xs text-muted-foreground mb-4">Selecione o tipo mais frequente das suas fezes</p>
              <div className="space-y-2">
                {BRISTOL_SCALE.map(b => (
                  <button
                    key={b.type}
                    onClick={() => setBristolType(b.type)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      bristolType === b.type ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <span className="text-xl">{b.emoji}</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">{b.label}: {b.desc}</p>
                      <p className="text-[10px] text-muted-foreground">{b.health}</p>
                    </div>
                    {bristolType === b.type && <Check className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Gut health questions */}
            {GUT_QUESTIONS.map((q, qi) => (
              <div key={q.id} className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">{q.question}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                        answers[q.id] === oi ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Submit */}
            <button
              onClick={() => setShowResults(true)}
              disabled={!allAnswered}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-mono text-sm font-bold disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Gerar Perfil de Microbioma
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* 4 Dimensions */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Bug className="w-4 h-4 text-primary" /> Suas 4 dimensões intestinais
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {GUT_DIMENSIONS.map(dim => {
                  const score = scores?.[dim.id as keyof typeof scores] || 0;
                  const color = score >= 70 ? "text-primary" : score >= 40 ? "text-accent" : "text-destructive";
                  return (
                    <div key={dim.id} className="rounded-lg border border-border bg-card p-3">
                      <span className="text-xl">{dim.icon}</span>
                      <p className="text-xs font-bold text-foreground mt-1">{dim.label}</p>
                      <p className="text-[9px] text-muted-foreground">{dim.desc}</p>
                      <div className="mt-2">
                        <span className={`text-lg font-bold font-mono ${color}`}>{score}</span>
                        <span className="text-[9px] text-muted-foreground">/100</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden mt-1">
                        <motion.div
                          className={`h-full rounded-full ${score >= 70 ? "bg-primary" : score >= 40 ? "bg-accent" : "bg-destructive"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bristol result */}
            {bristolType !== null && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-2">🚽 Resultado Bristol</h3>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{BRISTOL_SCALE[bristolType - 1].emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{BRISTOL_SCALE[bristolType - 1].label}</p>
                    <p className="text-xs text-muted-foreground">{BRISTOL_SCALE[bristolType - 1].health}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Food recommendations */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-4">🥗 Alimentos recomendados</h3>
              {["probiotic", "prebiotic", "fiber", "anti-inflammatory"].map(type => {
                const foods = FOOD_RECOMMENDATIONS.filter(f => f.type === type);
                const typeLabel = type === "probiotic" ? "🦠 Probióticos" : type === "prebiotic" ? "🌱 Prebióticos" : type === "fiber" ? "🌾 Fibras" : "🔥 Anti-inflamatórios";
                const colors = TYPE_COLORS[type];
                return (
                  <div key={type} className="mb-4 last:mb-0">
                    <p className="text-xs font-bold text-foreground mb-2">{typeLabel}</p>
                    <div className="space-y-1.5">
                      {foods.map(f => (
                        <div key={f.name} className={`flex items-start gap-2 p-2 rounded-lg ${colors.bg}`}>
                          <span className={`text-xs font-bold ${colors.text} min-w-[80px]`}>{f.name}</span>
                          <span className="text-[10px] text-muted-foreground">{f.benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Redo */}
            <button
              onClick={() => { setShowResults(false); setBristolType(null); setAnswers({}); }}
              className="w-full py-3 rounded-xl border border-border text-muted-foreground font-mono text-sm hover:border-primary/30 transition-all"
            >
              Refazer questionário
            </button>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default MicrobiomePage;
