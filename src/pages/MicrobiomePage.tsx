import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calculator, ListChecks, Brain, BookOpen, BarChart3,
  Droplets, ChevronDown, ChevronRight, Sparkles, Check, Loader2,
  AlertTriangle, Leaf, FlaskConical, Dna
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import BottomNav from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { analisarMicrobioma, salvarDiagnosticoMicrobioma } from "@/lib/microbioma";
import VoiceRecorderButton from "@/components/ui/VoiceRecorderButton";

// ── CONSTANTS ──

const TABS = [
  { id: "fibras", label: "Fibras", icon: Calculator },
  { id: "protocolo", label: "Protocolo", icon: ListChecks },
  { id: "ia", label: "IA", icon: Brain },
  { id: "ciencia", label: "Ciência", icon: BookOpen },
] as const;

type TabId = (typeof TABS)[number]["id"];

const OBJECTIVES = [
  { value: "saude", label: "Saúde geral" },
  { value: "emagrecimento", label: "Emagrecimento" },
  { value: "performance", label: "Performance atlética" },
  { value: "glp1", label: "Protocolo GLP-1" },
  { value: "ibs", label: "Intestino irritável" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentario", label: "Sedentário", factor: 1.2 },
  { value: "leve", label: "Leve", factor: 1.375 },
  { value: "moderado", label: "Moderado", factor: 1.55 },
  { value: "intenso", label: "Intenso", factor: 1.725 },
];

const FIBER_FOODS = [
  { name: "Aveia", portion: "1 xícara", fiber: 4, type: "solúvel" },
  { name: "Chia", portion: "2 col sopa", fiber: 7, type: "solúvel" },
  { name: "Feijão", portion: "1 concha", fiber: 6, type: "insolúvel" },
  { name: "Lentilha", portion: "1 concha", fiber: 8, type: "insolúvel" },
  { name: "Brócolis", portion: "1 xícara", fiber: 5, type: "insolúvel" },
  { name: "Psyllium", portion: "1 col sopa", fiber: 5, type: "solúvel" },
  { name: "Maçã c/ casca", portion: "1 unidade", fiber: 4, type: "solúvel" },
  { name: "Linhaça", portion: "2 col sopa", fiber: 4, type: "solúvel" },
];

const SINTOMAS = [
  "Gases e distensão frequentes",
  "Constipação (menos de 1x/dia)",
  "Diarreia frequente",
  "Fadiga após refeições",
  "Desejo intenso por doce/carboidrato",
  "Humor instável / ansiedade",
  "Sono de má qualidade",
  "Acne ou inflamação de pele",
  "Dificuldade para emagrecer",
  "Refluxo ou azia frequente",
];

const PROTOCOL_PHASES = [
  {
    phase: 1, title: "Limpeza e Preparo", weeks: "Semanas 1-2", fiberPercent: 50,
    steps: [
      "Remover ultraprocessados, adoçantes artificiais (aspartame, sacarina) e álcool",
      "Introduzir fibras gradualmente: começar com **50% da meta** calculada para evitar disbiose aguda",
      "Hidratação: mínimo **35ml/kg** de peso corporal",
      "Adicionar **1 colher de sopa de psyllium** à noite",
    ],
    foundation: "Evitar disbiose osmótica — Sonnenburg Lab, Stanford 2022",
  },
  {
    phase: 2, title: "Semeadura (Seeding)", weeks: "Semanas 3-5", fiberPercent: 75,
    steps: [
      "Introduzir alimentos fermentados: **1-2 porções/dia** (kefir, iogurte natural integral, chucrute, kombucha low-sugar)",
      "Escalar fibras para **75% da meta** individual",
      "Probiótico: **Lactobacillus rhamnosus GG** ou **L. acidophilus NCFM** — mínimo 10 bilhões UFC/dia",
      "Introduzir amido resistente: **batata-doce cozida e resfriada**, arroz resfriado",
    ],
    foundation: "Estudo PREDICT — Tim Spector / King's College London",
  },
  {
    phase: 3, title: "Diversificação", weeks: "Semanas 6-9", fiberPercent: 100,
    steps: [
      "Regra dos **30 vegetais por semana** (American Gut Project — Sonnenburg/Knight Lab)",
      "Atingir **100% da meta** de fibras calculada",
      "Introduzir prebióticos específicos: **FOS** (alcachofra, alho, cebola, alho-poró), **inulina** (chicória, banana verde)",
      "Incluir pelo menos **5 cores de vegetais** por dia",
      "Monitorar trânsito intestinal: ideal **1-2 evacuações/dia**, escala de Bristol tipo 3-4",
    ],
    foundation: "American Gut Project — Knight Lab 2018",
  },
  {
    phase: 4, title: "Consolidação", weeks: "Semanas 10-12", fiberPercent: 100,
    steps: [
      "Manter meta de fibras + rodar ciclo de **30 vegetais/semana** como hábito",
      "Reduzir probiótico para manutenção (**5 bilhões UFC/dia**) ou via alimentação",
      "Avaliar **reintrodução** de grupos alimentares removidos na Fase 1",
      "Bônus anti-inflamatório: **Omega-3** (2-4g EPA+DHA/dia), polifenóis (mirtilo, cacau 70%+, chá verde)",
    ],
    foundation: "Gut-brain axis — Cryan et al., Nature Reviews Neuroscience 2019",
  },
];

const STUDIES = [
  {
    icon: "🔬", title: "Sonnenburg Lab — Stanford (2021)", tag: "Stanford",
    finding: "Dieta rica em fibras vs dieta fermentada: impacto na diversidade microbiana.",
    stat: "+19 espécies",
    detail: "Fermentados aumentaram diversidade em 19 espécies bacterianas em média.",
  },
  {
    icon: "🧬", title: "PREDICT Study — King's College London (2022)", tag: "UK Research",
    finding: "Resposta glicêmica individual depende mais da microbiota que do alimento em si.",
    stat: "Personalização",
    detail: "Base para personalização nutricional baseada no perfil do microbioma.",
  },
  {
    icon: "🥦", title: "American Gut Project — Knight Lab (2018)", tag: "NIH",
    finding: "Consumidores de 30+ vegetais/semana têm microbiota significativamente mais diversa.",
    stat: "30+ vegetais/sem",
    detail: "vs consumidores de menos de 10 tipos por semana.",
  },
  {
    icon: "🧠", title: "Cryan et al. — Nature Reviews Neuroscience (2019)", tag: "Neuroscience",
    finding: "Eixo intestino-cérebro: microbiota produz 90% da serotonina corporal.",
    stat: "90% serotonina",
    detail: "Impacta diretamente humor, ansiedade e cognição.",
  },
  {
    icon: "🏋️", title: "Clarke et al. (2014)", tag: "Sports Science",
    finding: "Atletas de elite apresentam microbiota com maior diversidade.",
    stat: "↑ Akkermansia",
    detail: "Maior proporção de Akkermansia muciniphila vs sedentários.",
  },
  {
    icon: "🌍", title: "NIH Human Microbiome Project", tag: "NIH",
    finding: "Microbiota saudável possui >1.000 espécies bacterianas.",
    stat: "1000+ espécies",
    detail: "Disbiose moderna reduz para 300-400 espécies.",
  },
];

// ── FIBER CALCULATOR LOGIC ──

function calcFiberGoal(
  sex: string,
  age: number,
  weightKg: number,
  heightCm: number,
  activity: string,
  objective: string
) {
  // Base Harris-Benedict for kcal estimation
  let bmr: number;
  if (sex === "masculino") {
    bmr = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age;
  }
  const actFactor = ACTIVITY_LEVELS.find(a => a.value === activity)?.factor || 1.375;
  const tdee = bmr * actFactor;

  // Base: 14g per 1000 kcal
  let baseFiber = (tdee / 1000) * 14;

  // Gender/age guidelines
  let guidelineFiber: number;
  if (sex === "masculino") {
    guidelineFiber = age <= 50 ? 38 : 30;
  } else {
    guidelineFiber = age <= 50 ? 25 : 21;
  }

  // Use the higher of the two
  let fiberGoal = Math.max(baseFiber, guidelineFiber);

  // Objective adjustments
  if (objective === "emagrecimento") fiberGoal *= 1.15;
  else if (objective === "performance") fiberGoal *= 1.10;
  else if (objective === "glp1") fiberGoal *= 0.90;

  fiberGoal = Math.round(fiberGoal);
  const soluble = Math.round(fiberGoal * 0.30);
  const insoluble = Math.round(fiberGoal * 0.70);
  const extraWater = Math.max(0, Math.round(((fiberGoal - 25) / 5) * 200));

  let tip = "";
  if (objective === "emagrecimento") tip = "Priorize fibras solúveis (aveia, chia, psyllium) para maior saciedade e controle glicêmico.";
  else if (objective === "performance") tip = "Atletas com microbiota diversa apresentam melhor recuperação — diversifique fontes de fibra.";
  else if (objective === "glp1") tip = "Com GLP-1, prefira fibras solúveis em menores doses e evite excessos que causem distensão.";
  else if (objective === "ibs") tip = "Comece com protocolo low-FODMAP e aumente fibras progressivamente sob orientação profissional.";
  else tip = "Distribua a fibra ao longo do dia para melhor absorção e menor desconforto intestinal.";

  return { total: fiberGoal, soluble, insoluble, extraWater, tip, tdee: Math.round(tdee) };
}

// ── COMPONENT ──

const MicrobiomePage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState<TabId>("fibras");

  // ── Fiber Calculator State ──
  const [fiberSex, setFiberSex] = useState("masculino");
  const [fiberAge, setFiberAge] = useState(30);
  const [fiberWeight, setFiberWeight] = useState(75);
  const [fiberHeight, setFiberHeight] = useState(175);
  const [fiberActivity, setFiberActivity] = useState("moderado");
  const [fiberObjective, setFiberObjective] = useState("saude");
  const [fiberResult, setFiberResult] = useState<ReturnType<typeof calcFiberGoal> | null>(null);

  // ── Protocol State ──
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);

  // ── IA Diagnosis State ──
  const [selectedSintomas, setSelectedSintomas] = useState<string[]>([]);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResult, setIaResult] = useState("");
  const [iaScore, setIaScore] = useState<number | null>(null);

  // Prefill from profile
  useEffect(() => {
    if (profile) {
      if (profile.sex) setFiberSex(profile.sex === "F" ? "feminino" : "masculino");
      if (profile.date_of_birth) {
        const age = Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / 31557600000);
        if (age > 0 && age < 120) setFiberAge(age);
      }
      if (profile.weight_kg) setFiberWeight(profile.weight_kg);
      if (profile.height_cm) setFiberHeight(profile.height_cm);
      if (profile.activity_level) {
        const map: Record<string, string> = { sedentary: "sedentario", light: "leve", moderate: "moderado", intense: "intenso" };
        setFiberActivity(map[profile.activity_level] || "moderado");
      }
      if (profile.uses_glp1) setFiberObjective("glp1");
      else if (profile.goal === "weight_loss") setFiberObjective("emagrecimento");
      else if (profile.goal === "muscle_gain" || profile.goal === "performance") setFiberObjective("performance");
    }
  }, [profile]);

  const handleCalcFiber = () => {
    const res = calcFiberGoal(fiberSex, fiberAge, fiberWeight, fiberHeight, fiberActivity, fiberObjective);
    setFiberResult(res);
  };

  const toggleSintoma = (s: string) => {
    setSelectedSintomas(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const score = 100 - selectedSintomas.length * 10;
  const classificacao = score >= 80 ? "Microbiota equilibrada" : score >= 60 ? "Disbiose leve" : score >= 40 ? "Disbiose moderada" : "Disbiose severa";
  const scoreColor = score >= 80 ? "text-primary" : score >= 60 ? "text-yellow-400" : score >= 40 ? "text-orange-400" : "text-red-500";

  const handleIaDiagnosis = useCallback(async () => {
    if (selectedSintomas.length === 0) {
      toast.error("Selecione pelo menos um sintoma");
      return;
    }
    setIaLoading(true);
    setIaResult("");
    setIaScore(score);

    let fullText = "";

    await analisarMicrobioma(
      selectedSintomas,
      score,
      {
        sexo: fiberSex,
        idade: fiberAge,
        peso: fiberWeight,
        objetivo: fiberObjective,
        atividade: fiberActivity,
        metaFibras: fiberResult?.total,
      },
      (delta) => {
        fullText += delta;
        setIaResult(fullText);
      },
      async () => {
        setIaLoading(false);
        // Save to DB
        await salvarDiagnosticoMicrobioma({
          sintomas: selectedSintomas,
          score,
          classificacao,
          metaFibrasG: fiberResult?.total,
          analiseIA: fullText,
          perfilSnapshot: { sexo: fiberSex, idade: fiberAge, peso: fiberWeight, objetivo: fiberObjective },
        });
        toast.success("Análise salva com sucesso!");
      },
      (error) => {
        setIaLoading(false);
        toast.error(error);
      }
    );
  }, [selectedSintomas, score, fiberSex, fiberAge, fiberWeight, fiberObjective, fiberActivity, fiberResult, classificacao]);

  return (
    <div className="min-h-screen bg-[#0a0f0a] pb-24">
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-green-900/40 hover:bg-green-900/10">
            <ArrowLeft className="w-4 h-4 text-green-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-green-400 font-mono tracking-tight">Microbioma Intelligence</h1>
            <p className="text-[10px] text-green-600 font-mono">Saúde intestinal baseada em evidências</p>
          </div>
          <Dna className="w-5 h-5 text-green-500" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-green-950/30 rounded-xl p-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-[10px] font-mono transition-all ${
                  active ? "bg-green-500/20 text-green-400 border border-green-500/30" : "text-green-700 hover:text-green-500"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ──── ABA 1: CALCULADORA DE FIBRAS ──── */}
          {activeTab === "fibras" && (
            <motion.div key="fibras" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-xl border border-green-900/30 bg-green-950/20 p-4 space-y-4">
                <h2 className="text-sm font-bold text-green-400 font-mono flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> Calculadora Personalizada de Fibras
                </h2>

                {/* Sex */}
                <div>
                  <label className="text-[10px] text-green-600 font-mono mb-1 block">Sexo biológico</label>
                  <div className="flex gap-2">
                    {["masculino", "feminino"].map(s => (
                      <button key={s} onClick={() => setFiberSex(s)}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono border transition-all ${fiberSex === s ? "border-green-500 bg-green-500/10 text-green-400" : "border-green-900/30 text-green-700"}`}>
                        {s === "masculino" ? "♂ Masculino" : "♀ Feminino"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number inputs */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Idade", value: fiberAge, set: setFiberAge, suffix: "anos" },
                    { label: "Peso", value: fiberWeight, set: setFiberWeight, suffix: "kg" },
                    { label: "Altura", value: fiberHeight, set: setFiberHeight, suffix: "cm" },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-[10px] text-green-600 font-mono mb-1 block">{f.label}</label>
                      <input
                        type="number"
                        value={f.value}
                        onChange={e => f.set(Number(e.target.value))}
                        className="w-full bg-green-950/40 border border-green-900/30 rounded-lg px-2 py-2 text-sm text-green-300 font-mono text-center focus:outline-none focus:border-green-500"
                      />
                      <span className="text-[9px] text-green-700 font-mono">{f.suffix}</span>
                    </div>
                  ))}
                </div>

                {/* Objective */}
                <div>
                  <label className="text-[10px] text-green-600 font-mono mb-1 block">Objetivo principal</label>
                  <div className="flex flex-wrap gap-1.5">
                    {OBJECTIVES.map(o => (
                      <button key={o.value} onClick={() => setFiberObjective(o.value)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${fiberObjective === o.value ? "border-green-500 bg-green-500/10 text-green-400" : "border-green-900/30 text-green-700"}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity */}
                <div>
                  <label className="text-[10px] text-green-600 font-mono mb-1 block">Nível de atividade</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ACTIVITY_LEVELS.map(a => (
                      <button key={a.value} onClick={() => setFiberActivity(a.value)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${fiberActivity === a.value ? "border-green-500 bg-green-500/10 text-green-400" : "border-green-900/30 text-green-700"}`}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleCalcFiber}
                  className="w-full py-3 rounded-xl bg-green-500 text-black font-mono text-sm font-bold hover:bg-green-400 transition-all">
                  <Calculator className="w-4 h-4 inline mr-2" /> Calcular Meta de Fibras
                </button>
              </div>

              {/* Result */}
              {fiberResult && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  {/* Main number */}
                  <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 text-center">
                    <p className="text-[10px] text-green-600 font-mono mb-1">Sua meta diária de fibras</p>
                    <p className="text-5xl font-bold text-green-400 font-mono">{fiberResult.total}<span className="text-lg">g</span></p>
                    <p className="text-[10px] text-green-700 font-mono mt-1">baseado em ~{fiberResult.tdee} kcal/dia estimadas</p>
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-green-900/30 bg-green-950/30 p-3 text-center">
                      <p className="text-[9px] text-green-600 font-mono">Solúvel</p>
                      <p className="text-xl font-bold text-green-400 font-mono">{fiberResult.soluble}g</p>
                      <p className="text-[8px] text-green-700">30%</p>
                    </div>
                    <div className="rounded-xl border border-green-900/30 bg-green-950/30 p-3 text-center">
                      <p className="text-[9px] text-green-600 font-mono">Insolúvel</p>
                      <p className="text-xl font-bold text-green-400 font-mono">{fiberResult.insoluble}g</p>
                      <p className="text-[8px] text-green-700">70%</p>
                    </div>
                    <div className="rounded-xl border border-blue-900/30 bg-blue-950/30 p-3 text-center">
                      <Droplets className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                      <p className="text-[9px] text-blue-500 font-mono">Água extra</p>
                      <p className="text-xl font-bold text-blue-400 font-mono">+{fiberResult.extraWater}<span className="text-xs">ml</span></p>
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="rounded-xl border border-green-900/30 bg-green-950/20 p-3 flex items-start gap-2">
                    <Leaf className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-green-500/80 font-mono">{fiberResult.tip}</p>
                  </div>

                  {/* Food grid */}
                  <div className="rounded-xl border border-green-900/30 bg-green-950/20 p-4">
                    <h3 className="text-xs font-bold text-green-400 font-mono mb-3">🥦 Fontes alimentares recomendadas</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {FIBER_FOODS.map(f => (
                        <div key={f.name} className="rounded-lg border border-green-900/20 bg-green-950/30 p-2">
                          <p className="text-xs font-bold text-green-400 font-mono">{f.name}</p>
                          <p className="text-[9px] text-green-700">{f.portion}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-bold text-green-300 font-mono">{f.fiber}g</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${f.type === "solúvel" ? "bg-green-500/10 text-green-500" : "bg-teal-500/10 text-teal-500"}`}>{f.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ──── ABA 2: PROTOCOLO 12 SEMANAS ──── */}
          {activeTab === "protocolo" && (
            <motion.div key="protocolo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <h2 className="text-sm font-bold text-green-400 font-mono flex items-center gap-2">
                <ListChecks className="w-4 h-4" /> Protocolo de Restauração — 12 semanas
              </h2>

              {PROTOCOL_PHASES.map(phase => {
                const isOpen = expandedPhase === phase.phase;
                return (
                  <div key={phase.phase} className="rounded-xl border border-green-900/30 bg-green-950/20 overflow-hidden">
                    <button onClick={() => setExpandedPhase(isOpen ? null : phase.phase)}
                      className="w-full flex items-center gap-3 p-4 text-left">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold ${isOpen ? "bg-green-500 text-black" : "bg-green-900/30 text-green-600"}`}>
                        {phase.phase}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-green-400 font-mono">{phase.title}</p>
                        <p className="text-[10px] text-green-700">{phase.weeks}</p>
                      </div>
                      {/* Fiber progress */}
                      <div className="text-right mr-2">
                        <p className="text-xs font-bold text-green-400 font-mono">{phase.fiberPercent}%</p>
                        <p className="text-[8px] text-green-700">da meta</p>
                      </div>
                      {isOpen ? <ChevronDown className="w-4 h-4 text-green-500" /> : <ChevronRight className="w-4 h-4 text-green-700" />}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            {/* Fiber bar */}
                            <div className="h-2 rounded-full bg-green-900/30 overflow-hidden">
                              <motion.div className="h-full bg-green-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${phase.fiberPercent}%` }}
                                transition={{ duration: 0.8 }}
                              />
                            </div>

                            {/* Steps */}
                            <ol className="space-y-2">
                              {phase.steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="w-5 h-5 rounded-full bg-green-900/30 flex items-center justify-center text-[9px] text-green-500 font-mono shrink-0 mt-0.5">{i + 1}</span>
                                  <p className="text-[11px] text-green-500/80 leading-relaxed">
                                    <ReactMarkdown components={{
                                      strong: ({ children }) => <strong className="text-green-400 font-bold">{children}</strong>,
                                      p: ({ children }) => <span>{children}</span>,
                                    }}>{step}</ReactMarkdown>
                                  </p>
                                </li>
                              ))}
                            </ol>

                            {/* Foundation badge */}
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                              <FlaskConical className="w-3 h-3 text-green-500 shrink-0" />
                              <p className="text-[9px] text-green-600 font-mono">{phase.foundation}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* ──── ABA 3: DIAGNÓSTICO IA ──── */}
          {activeTab === "ia" && (
            <motion.div key="ia" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <h2 className="text-sm font-bold text-green-400 font-mono flex items-center gap-2">
                <Brain className="w-4 h-4" /> Diagnóstico Inteligente do Microbioma
              </h2>

              {/* Symptoms */}
              <div className="rounded-xl border border-green-900/30 bg-green-950/20 p-4">
                <p className="text-xs text-green-600 font-mono mb-3">Selecione seus sintomas:</p>
                <div className="space-y-2">
                  {SINTOMAS.map(s => {
                    const selected = selectedSintomas.includes(s);
                    return (
                      <button key={s} onClick={() => toggleSintoma(s)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left text-[11px] font-mono transition-all ${
                          selected ? "border-green-500 bg-green-500/10 text-green-400" : "border-green-900/20 text-green-700 hover:border-green-800"
                        }`}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected ? "border-green-500 bg-green-500" : "border-green-800"}`}>
                          {selected && <Check className="w-3 h-3 text-black" />}
                        </div>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Score */}
              {selectedSintomas.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-green-900/30 bg-green-950/20 p-4 text-center">
                  <p className="text-[10px] text-green-600 font-mono mb-1">Score de Saúde Intestinal</p>
                  <p className={`text-4xl font-bold font-mono ${scoreColor}`}>{score}<span className="text-lg">/100</span></p>
                  <p className={`text-xs font-mono mt-1 ${scoreColor}`}>{classificacao}</p>
                  {score < 40 && (
                    <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-[10px] text-red-400 font-mono text-left">Recomendamos acompanhamento profissional urgente</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Generate button */}
              <button onClick={handleIaDiagnosis} disabled={iaLoading || selectedSintomas.length === 0}
                className="w-full py-3 rounded-xl bg-green-500 text-black font-mono text-sm font-bold disabled:opacity-50 hover:bg-green-400 transition-all flex items-center justify-center gap-2">
                {iaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {iaLoading ? "Analisando microbioma..." : "Gerar Análise com IA"}
              </button>

              {/* IA Result */}
              {iaResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-green-500/20 bg-green-950/30 p-4">
                  <div className="prose prose-sm prose-invert max-w-none
                    prose-headings:text-green-400 prose-headings:font-mono prose-headings:text-sm
                    prose-strong:text-green-400
                    prose-p:text-green-500/80 prose-p:text-[11px] prose-p:leading-relaxed prose-p:font-mono
                    prose-li:text-green-500/80 prose-li:text-[11px] prose-li:font-mono
                    prose-ol:text-green-500/80 prose-ul:text-green-500/80">
                    <ReactMarkdown>{iaResult}</ReactMarkdown>
                  </div>
                  {iaLoading && <span className="inline-block w-2 h-4 bg-green-500 animate-pulse ml-1" />}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ──── ABA 4: BASE CIENTÍFICA ──── */}
          {activeTab === "ciencia" && (
            <motion.div key="ciencia" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <h2 className="text-sm font-bold text-green-400 font-mono flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Base Científica
              </h2>

              {STUDIES.map((study, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-green-900/30 bg-green-950/20 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{study.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[11px] font-bold text-green-400 font-mono">{study.title}</h3>
                      </div>
                      <span className="inline-block text-[8px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-mono mb-2">{study.tag}</span>
                      <p className="text-[10px] text-green-600 font-mono leading-relaxed">{study.finding}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-bold text-green-400 font-mono">{study.stat}</span>
                      </div>
                      <p className="text-[9px] text-green-700 font-mono mt-1">{study.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
};

export default MicrobiomePage;
