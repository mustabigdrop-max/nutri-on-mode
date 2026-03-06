import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { ChevronRight, ChevronLeft, Zap, User, Target, Dumbbell, Salad } from "lucide-react";
import { toast } from "sonner";

const GOALS = [
  { value: "lose_weight", label: "Emagrecer", emoji: "🔥" },
  { value: "gain_muscle", label: "Ganhar massa", emoji: "💪" },
  { value: "definition", label: "Definição", emoji: "✂️" },
  { value: "health", label: "Saúde geral", emoji: "💚" },
  { value: "maintenance", label: "Manutenção", emoji: "⚖️" },
  { value: "performance", label: "Performance", emoji: "🏆" },
  { value: "glp1", label: "Protocolo GLP-1", emoji: "💉" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentário", desc: "Pouco ou nenhum exercício", factor: 1.2 },
  { value: "light", label: "Levemente ativo", desc: "1-3 dias/semana", factor: 1.375 },
  { value: "moderate", label: "Moderadamente ativo", desc: "3-5 dias/semana", factor: 1.55 },
  { value: "very_active", label: "Muito ativo", desc: "6-7 dias/semana", factor: 1.725 },
  { value: "athlete", label: "Atleta", desc: "2x ao dia ou trabalho físico", factor: 1.9 },
];

const RESTRICTIONS = [
  "Sem glúten", "Sem lactose", "Vegano", "Vegetariano",
  "Sem frutos do mar", "Sem oleaginosas", "Kosher", "Halal",
];

const HEALTH_CONDITIONS = [
  "Diabetes tipo 2", "Hipertensão", "Dislipidemia", "SOP",
  "Hipotireoidismo", "Doença celíaca", "Nenhuma",
];

// Calculation functions
const calcGEB = (weight: number, height: number, age: number, sex: string) => {
  // Mifflin-St Jeor (most accurate for general population)
  if (sex === "male") return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
};

const getActivityFactor = (level: string) => {
  return ACTIVITY_LEVELS.find(a => a.value === level)?.factor || 1.55;
};

const calcVET = (get: number, goal: string, weight: number, usesGlp1: boolean) => {
  let vet = get;
  let proteinPerKg = 1.6;

  switch (goal) {
    case "lose_weight":
      vet = get - 500;
      proteinPerKg = 2.0;
      break;
    case "gain_muscle":
      vet = get + 350;
      proteinPerKg = 2.2;
      break;
    case "definition":
      vet = get - 500;
      proteinPerKg = 2.2;
      break;
    case "maintenance":
    case "health":
      vet = get;
      proteinPerKg = 1.6;
      break;
    case "performance":
      vet = get + 250;
      proteinPerKg = 2.0;
      break;
    case "glp1":
      vet = get - 400;
      proteinPerKg = 2.2;
      break;
  }

  if (usesGlp1) proteinPerKg = Math.max(proteinPerKg, 2.0);

  const protein = weight * proteinPerKg;
  const fatKcal = vet * 0.25;
  const fat = fatKcal / 9;
  const proteinKcal = protein * 4;
  const carbs = (vet - proteinKcal - fatKcal) / 4;

  return { vet: Math.round(vet), protein: Math.round(protein), carbs: Math.round(Math.max(carbs, 50)), fat: Math.round(fat) };
};

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const { updateProfile } = useProfile();
  const navigate = useNavigate();

  const [data, setData] = useState({
    full_name: "",
    date_of_birth: "",
    sex: "" as string,
    weight_kg: "" as string,
    height_cm: "" as string,
    goal: "",
    activity_level: "",
    training_frequency: "" as string,
    sport: "",
    dietary_restrictions: [] as string[],
    health_conditions: [] as string[],
    uses_glp1: false,
  });

  const update = (field: string, value: any) => setData(prev => ({ ...prev, [field]: value }));

  const toggleArray = (field: "dietary_restrictions" | "health_conditions", value: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const canNext = () => {
    switch (step) {
      case 0: return data.full_name && data.sex && data.weight_kg && data.height_cm && data.date_of_birth;
      case 1: return data.goal;
      case 2: return data.activity_level;
      case 3: return true;
      default: return false;
    }
  };

  const handleFinish = async () => {
    const weight = parseFloat(data.weight_kg);
    const height = parseFloat(data.height_cm);
    const birthDate = new Date(data.date_of_birth);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    const geb = calcGEB(weight, height, age, data.sex);
    const factor = getActivityFactor(data.activity_level);
    const get = geb * factor;
    const { vet, protein, carbs, fat } = calcVET(get, data.goal, weight, data.uses_glp1);

    const error = await updateProfile({
      full_name: data.full_name,
      date_of_birth: data.date_of_birth,
      sex: data.sex,
      weight_kg: weight,
      height_cm: height,
      goal: data.goal,
      activity_level: data.activity_level,
      training_frequency: data.training_frequency ? parseInt(data.training_frequency) : null,
      sport: data.sport || null,
      dietary_restrictions: data.dietary_restrictions.length ? data.dietary_restrictions : null,
      health_conditions: data.health_conditions.length ? data.health_conditions : null,
      uses_glp1: data.uses_glp1,
      geb_kcal: Math.round(geb),
      get_kcal: Math.round(get),
      vet_kcal: vet,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      onboarding_completed: true,
    });

    if (error) {
      toast.error("Erro ao salvar. Tente novamente.");
    } else {
      toast.success("Perfil configurado! Bem-vindo ao modo ON 🔥");
      navigate("/dashboard");
    }
  };

  const steps = [
    { icon: User, label: "Dados" },
    { icon: Target, label: "Objetivo" },
    { icon: Dumbbell, label: "Atividade" },
    { icon: Salad, label: "Restrições" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-grid opacity-15" />

      {/* Progress */}
      <div className="relative z-10 px-4 pt-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  <s.icon className="w-4 h-4" />
                </div>
                {i < 3 && <div className={`w-8 sm:w-16 h-0.5 ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-mono text-center">
            Etapa {step + 1} de 4 — {steps[step].label}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Vamos te conhecer</h2>
                  <p className="text-muted-foreground text-sm">Precisamos de alguns dados para calcular seu plano.</p>
                  <input
                    placeholder="Seu nome completo"
                    value={data.full_name}
                    onChange={e => update("full_name", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                  <input
                    type="date"
                    value={data.date_of_birth}
                    onChange={e => update("date_of_birth", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary/50"
                  />
                  <div className="flex gap-3">
                    {[{ v: "male", l: "Masculino" }, { v: "female", l: "Feminino" }].map(s => (
                      <button
                        key={s.v}
                        type="button"
                        onClick={() => update("sex", s.v)}
                        className={`flex-1 py-3 rounded-lg border text-sm font-semibold transition-all ${
                          data.sex === s.v
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        {s.l}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-mono mb-1 block">Peso (kg)</label>
                      <input
                        type="number"
                        placeholder="75"
                        value={data.weight_kg}
                        onChange={e => update("weight_kg", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-mono mb-1 block">Altura (cm)</label>
                      <input
                        type="number"
                        placeholder="175"
                        value={data.height_cm}
                        onChange={e => update("height_cm", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Qual seu objetivo?</h2>
                  <p className="text-muted-foreground text-sm">A IA vai calibrar tudo com base nessa escolha.</p>
                  <div className="grid grid-cols-1 gap-2">
                    {GOALS.map(g => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => update("goal", g.value)}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                          data.goal === g.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-border/80"
                        }`}
                      >
                        <span className="text-2xl">{g.emoji}</span>
                        <span className={`font-semibold ${data.goal === g.value ? "text-primary" : "text-foreground"}`}>
                          {g.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Nível de atividade</h2>
                  <p className="text-muted-foreground text-sm">Isso define seu gasto energético total (GET).</p>
                  <div className="space-y-2">
                    {ACTIVITY_LEVELS.map(a => (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => update("activity_level", a.value)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                          data.activity_level === a.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-border/80"
                        }`}
                      >
                        <div>
                          <p className={`font-semibold ${data.activity_level === a.value ? "text-primary" : "text-foreground"}`}>
                            {a.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{a.desc}</p>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">×{a.factor}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-mono mb-1 block">Treinos/semana</label>
                      <input
                        type="number"
                        placeholder="3"
                        value={data.training_frequency}
                        onChange={e => update("training_frequency", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-mono mb-1 block">Esporte principal</label>
                      <input
                        placeholder="Musculação"
                        value={data.sport}
                        onChange={e => update("sport", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Restrições alimentares</h2>
                    <p className="text-muted-foreground text-sm mb-3">Selecione todas que se aplicam (opcional).</p>
                    <div className="flex flex-wrap gap-2">
                      {RESTRICTIONS.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggleArray("dietary_restrictions", r)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            data.dietary_restrictions.includes(r)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-border/80"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Condições de saúde</p>
                    <div className="flex flex-wrap gap-2">
                      {HEALTH_CONDITIONS.map(h => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => toggleArray("health_conditions", h)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            data.health_conditions.includes(h)
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border text-muted-foreground hover:border-border/80"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => update("uses_glp1", !data.uses_glp1)}
                      className={`w-12 h-7 rounded-full transition-all relative ${
                        data.uses_glp1 ? "bg-primary" : "bg-secondary"
                      }`}
                    >
                      <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-foreground transition-all ${
                        data.uses_glp1 ? "left-5" : "left-0.5"
                      }`} />
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Uso caneta emagrecedora (GLP-1)</p>
                      <p className="text-xs text-muted-foreground">Ozempic, Wegovy, Mounjaro, etc.</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 px-4 pb-8">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-lg border border-border text-foreground font-semibold transition-all hover:bg-secondary"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => step < 3 ? setStep(step + 1) : handleFinish()}
            disabled={!canNext()}
            className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-bold transition-all hover:scale-[1.02] glow-gold disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {step < 3 ? (
              <>Próximo <ChevronRight className="w-4 h-4" /></>
            ) : (
              <><Zap className="w-4 h-4" /> Ativar modo ON</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
