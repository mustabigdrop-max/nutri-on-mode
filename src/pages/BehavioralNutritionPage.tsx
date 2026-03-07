import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Brain, Heart, Smile, Frown, Meh, AlertTriangle, Target, BookOpen, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const HUNGER_SCALE = [
  { level: 1, label: "Faminto", desc: "Tonto, irritado, fraco", emoji: "😵", color: "bg-destructive" },
  { level: 2, label: "Muita fome", desc: "Estômago roncando forte", emoji: "😫", color: "bg-destructive/80" },
  { level: 3, label: "Fome", desc: "Preciso comer logo", emoji: "😕", color: "bg-accent" },
  { level: 4, label: "Leve fome", desc: "Começando a sentir", emoji: "🤔", color: "bg-accent/80" },
  { level: 5, label: "Neutro", desc: "Nem fome nem cheio", emoji: "😐", color: "bg-primary" },
  { level: 6, label: "Satisfeito", desc: "Confortável, sem necessidade", emoji: "🙂", color: "bg-primary/80" },
  { level: 7, label: "Cheio", desc: "Satisfeito, um pouco cheio", emoji: "😊", color: "bg-cyan" },
  { level: 8, label: "Muito cheio", desc: "Desconfortável", emoji: "😣", color: "bg-cyan/80" },
  { level: 9, label: "Estufado", desc: "Muito desconfortável", emoji: "🤢", color: "bg-destructive/60" },
  { level: 10, label: "Passando mal", desc: "Dor, náusea", emoji: "🤮", color: "bg-destructive" },
];

const EMOTIONS = [
  { id: "happy", label: "Feliz", emoji: "😊", color: "bg-primary/10 border-primary/20" },
  { id: "sad", label: "Triste", emoji: "😢", color: "bg-cyan/10 border-cyan/20" },
  { id: "anxious", label: "Ansioso", emoji: "😰", color: "bg-accent/10 border-accent/20" },
  { id: "stressed", label: "Estressado", emoji: "😤", color: "bg-destructive/10 border-destructive/20" },
  { id: "bored", label: "Entediado", emoji: "😑", color: "bg-muted border-border" },
  { id: "angry", label: "Com raiva", emoji: "😡", color: "bg-destructive/10 border-destructive/20" },
  { id: "tired", label: "Cansado", emoji: "😴", color: "bg-purple-400/10 border-purple-400/20" },
  { id: "calm", label: "Calmo", emoji: "😌", color: "bg-cyan/10 border-cyan/20" },
];

const MINDFUL_EXERCISES = [
  {
    id: "5senses",
    title: "5 Sentidos na Refeição",
    duration: "5 min",
    icon: "👁️",
    steps: [
      "Observe o prato — cores, texturas, apresentação",
      "Sinta o aroma — feche os olhos, inspire profundamente",
      "Toque o alimento — sinta a temperatura e textura",
      "Mastigue devagar — 20-30 vezes por garfada",
      "Saboreie — identifique sabores: doce, salgado, amargo, ácido, umami",
    ],
  },
  {
    id: "body_scan",
    title: "Body Scan Pré-Refeição",
    duration: "3 min",
    icon: "🧘",
    steps: [
      "Sente-se confortavelmente e feche os olhos",
      "Respire 3x profundamente (4s inspira, 4s expira)",
      "Escaneie seu corpo da cabeça aos pés",
      "Identifique onde sente fome (estômago? garganta? cabeça?)",
      "Classifique sua fome de 1 a 10",
    ],
  },
  {
    id: "gratitude",
    title: "Gratidão Alimentar",
    duration: "2 min",
    icon: "🙏",
    steps: [
      "Olhe para seu prato antes de comer",
      "Pense em quem produziu/preparou este alimento",
      "Agradeça internamente pela refeição",
      "Comprometa-se a comer com atenção e respeito",
    ],
  },
];

const TCC_CHALLENGES = [
  {
    id: "thought_record",
    title: "Registro de Pensamento",
    desc: "Quando sentir vontade de comer por emoção, registre: Situação → Pensamento → Emoção → Comportamento → Alternativa",
    difficulty: "Iniciante",
    xp: 30,
  },
  {
    id: "exposure",
    title: "Exposição Gradual",
    desc: "Mantenha seu alimento 'gatilho' à vista por 5 minutos sem comer. Observe a vontade diminuir.",
    difficulty: "Intermediário",
    xp: 50,
  },
  {
    id: "delay",
    title: "Técnica do Atraso",
    desc: "Quando sentir vontade de beliscar, espere 15 minutos. Se a vontade persistir, coma conscientemente.",
    difficulty: "Iniciante",
    xp: 25,
  },
  {
    id: "restructuring",
    title: "Reestruturação Cognitiva",
    desc: "Substitua 'Eu não consigo parar de comer' por 'Eu estou aprendendo a reconhecer meus gatilhos'.",
    difficulty: "Avançado",
    xp: 40,
  },
];

const BehavioralNutritionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"diary" | "mindful" | "tcc">("diary");
  const [selectedHunger, setSelectedHunger] = useState<number | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [diaryNote, setDiaryNote] = useState("");
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const saveDiaryEntry = async () => {
    if (!user || !selectedHunger || !selectedEmotion) {
      toast.error("Selecione nível de fome e emoção");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("meal_logs").insert({
      user_id: user.id,
      meal_type: "check_in",
      hunger_level: selectedHunger,
      emotion: selectedEmotion,
      notes: diaryNote || `Check-in emocional: ${selectedEmotion}, Fome: ${selectedHunger}/10`,
      total_kcal: 0,
    });
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar");
    } else {
      toast.success("Check-in emocional salvo! +15 XP");
      setSelectedHunger(null);
      setSelectedEmotion(null);
      setDiaryNote("");
    }
  };

  const toggleStep = (exerciseId: string, stepIdx: number) => {
    setCompletedSteps(prev => {
      const current = prev[exerciseId] || [];
      if (current.includes(stepIdx)) {
        return { ...prev, [exerciseId]: current.filter(s => s !== stepIdx) };
      }
      return { ...prev, [exerciseId]: [...current, stepIdx] };
    });
  };

  const completeChallenge = (id: string) => {
    if (!completedChallenges.includes(id)) {
      setCompletedChallenges(prev => [...prev, id]);
      const challenge = TCC_CHALLENGES.find(c => c.id === id);
      toast.success(`Desafio concluído! +${challenge?.xp || 0} XP`);
    }
  };

  const tabs = [
    { id: "diary" as const, label: "Diário Emocional", icon: Heart },
    { id: "mindful" as const, label: "Mindful Eating", icon: Brain },
    { id: "tcc" as const, label: "Desafios TCC", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-border">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Nutrição Comportamental</h1>
            <p className="text-xs text-muted-foreground font-mono">Mente & alimentação</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-card rounded-xl p-1 border border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono transition-all ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Emotional Diary */}
          {activeTab === "diary" && (
            <motion.div key="diary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Hunger scale */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">📊 Escala de Fome (1-10)</h3>
                <div className="grid grid-cols-5 gap-1.5">
                  {HUNGER_SCALE.map(h => (
                    <button
                      key={h.level}
                      onClick={() => setSelectedHunger(h.level)}
                      className={`flex flex-col items-center gap-0.5 p-2 rounded-lg border transition-all ${
                        selectedHunger === h.level
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <span className="text-lg">{h.emoji}</span>
                      <span className="text-[9px] font-mono text-foreground">{h.level}</span>
                    </button>
                  ))}
                </div>
                {selectedHunger && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs text-foreground font-bold">{HUNGER_SCALE[selectedHunger - 1].label}</p>
                    <p className="text-[10px] text-muted-foreground">{HUNGER_SCALE[selectedHunger - 1].desc}</p>
                  </motion.div>
                )}
              </div>

              {/* Emotions */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">💭 Como você está se sentindo?</h3>
                <div className="grid grid-cols-4 gap-2">
                  {EMOTIONS.map(e => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEmotion(e.id)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all ${
                        selectedEmotion === e.id
                          ? "border-primary bg-primary/10"
                          : `${e.color} hover:opacity-80`
                      }`}
                    >
                      <span className="text-xl">{e.emoji}</span>
                      <span className="text-[9px] font-mono">{e.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">📝 Notas (opcional)</h3>
                <textarea
                  value={diaryNote}
                  onChange={e => setDiaryNote(e.target.value)}
                  placeholder="O que motivou essa fome? Algum gatilho emocional?"
                  className="w-full h-20 bg-secondary/50 border border-border rounded-lg p-3 text-sm text-foreground resize-none focus:outline-none focus:border-primary/30"
                />
              </div>

              {/* Save */}
              <button
                onClick={saveDiaryEntry}
                disabled={saving || !selectedHunger || !selectedEmotion}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-mono text-sm font-bold disabled:opacity-50 transition-all"
              >
                {saving ? "Salvando..." : "Registrar Check-in Emocional"}
              </button>
            </motion.div>
          )}

          {/* Mindful Eating */}
          {activeTab === "mindful" && (
            <motion.div key="mindful" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {MINDFUL_EXERCISES.map(ex => {
                const isActive = activeExercise === ex.id;
                const steps = completedSteps[ex.id] || [];
                const allDone = steps.length === ex.steps.length;

                return (
                  <div key={ex.id} className={`rounded-xl border bg-card overflow-hidden transition-all ${isActive ? "border-primary/30" : "border-border"}`}>
                    <button
                      onClick={() => setActiveExercise(isActive ? null : ex.id)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <span className="text-2xl">{ex.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{ex.title}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{ex.duration}</p>
                      </div>
                      {allDone && <Check className="w-5 h-5 text-primary" />}
                    </button>
                    <AnimatePresence>
                      {isActive && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 space-y-2">
                            {ex.steps.map((step, i) => (
                              <button
                                key={i}
                                onClick={() => toggleStep(ex.id, i)}
                                className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                                  steps.includes(i) ? "border-primary/20 bg-primary/5" : "border-border hover:border-muted-foreground/30"
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  steps.includes(i) ? "border-primary bg-primary" : "border-muted-foreground"
                                }`}>
                                  {steps.includes(i) && <Check className="w-3 h-3 text-primary-foreground" />}
                                </div>
                                <span className={`text-xs ${steps.includes(i) ? "text-foreground" : "text-muted-foreground"}`}>
                                  {step}
                                </span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* TCC Challenges */}
          {activeTab === "tcc" && (
            <motion.div key="tcc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Terapia Cognitivo-Comportamental</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Exercícios baseados em TCC para modificar padrões alimentares disfuncionais. Complete os desafios para ganhar XP.
                    </p>
                  </div>
                </div>
              </div>

              {TCC_CHALLENGES.map(ch => {
                const isDone = completedChallenges.includes(ch.id);
                return (
                  <div key={ch.id} className={`rounded-xl border bg-card p-4 transition-all ${isDone ? "border-primary/20 bg-primary/5" : "border-border"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{ch.title}</h4>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          ch.difficulty === "Iniciante" ? "bg-green-500/10 text-green-500" :
                          ch.difficulty === "Intermediário" ? "bg-accent/10 text-accent" :
                          "bg-destructive/10 text-destructive"
                        }`}>{ch.difficulty}</span>
                      </div>
                      <span className="text-xs font-mono text-primary">+{ch.xp} XP</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{ch.desc}</p>
                    <button
                      onClick={() => completeChallenge(ch.id)}
                      disabled={isDone}
                      className={`w-full py-2 rounded-lg font-mono text-xs transition-all ${
                        isDone
                          ? "bg-primary/10 text-primary"
                          : "bg-primary text-primary-foreground hover:opacity-90"
                      }`}
                    >
                      {isDone ? "✓ Concluído" : "Marcar como concluído"}
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
};

export default BehavioralNutritionPage;
