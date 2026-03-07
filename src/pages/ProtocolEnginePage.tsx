import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Zap, Check, ChevronRight, Flame, Leaf, Clock,
  Dumbbell, Heart, Baby, Droplets, Wheat, Sun, Shield,
  Calculator, TrendingDown, TrendingUp, Minus, Sparkles, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

// ─── Protocol definitions ─────────────────────────────────
interface Protocol {
  key: string;
  name: string;
  emoji: string;
  tag: string;
  color: string;
  description: string;
  indicatedFor: string;
  macroRules: {
    proteinPct: [number, number];
    carbsPct: [number, number];
    fatPct: [number, number];
    carbsAbsolute?: number; // grams cap
    proteinPerKg?: number;
    kcalPerKg?: [number, number]; // for athlete
  };
  features: string[];
  fasting?: { label: string; options: string[] };
}

const PROTOCOLS: Protocol[] = [
  {
    key: "low_carb",
    name: "Low Carb",
    emoji: "🔥",
    tag: "Emagrecimento",
    color: "from-orange-500 to-red-500",
    description: "15–25% de carboidratos. Ideal para resistência insulínica e emagrecimento acelerado.",
    indicatedFor: "Resistência insulínica · Emagrecimento acelerado · SOP · Pré-diabetes",
    macroRules: { proteinPct: [30, 35], carbsPct: [15, 25], fatPct: [40, 50], proteinPerKg: 2.0 },
    features: ["Carboidratos apenas em janelas pós-treino", "Gorduras saudáveis priorizadas", "Saciedade prolongada"],
  },
  {
    key: "cetogenica",
    name: "Cetogênica",
    emoji: "⚡",
    tag: "Cetose",
    color: "from-purple-500 to-violet-600",
    description: "Menos de 50g de carbo/dia. Cetose metabólica para queima máxima de gordura.",
    indicatedFor: "Cetose metabólica · Queima máxima de gordura · Epilepsia · Neuroproteção",
    macroRules: { proteinPct: [20, 25], carbsPct: [5, 10], fatPct: [65, 75], carbsAbsolute: 50, proteinPerKg: 1.8 },
    features: ["Cetose em 3-5 dias", "Monitoramento de corpos cetônicos", "Adaptação keto progressiva"],
  },
  {
    key: "jejum_intermitente",
    name: "Jejum Intermitente",
    emoji: "⏱",
    tag: "Autofagia",
    color: "from-cyan-500 to-blue-500",
    description: "Janelas de alimentação controladas. Autofagia, saúde metabólica e praticidade.",
    indicatedFor: "Autofagia · Saúde metabólica · Praticidade · Longevidade",
    macroRules: { proteinPct: [25, 30], carbsPct: [40, 50], fatPct: [25, 30], proteinPerKg: 1.8 },
    features: ["Janelas flexíveis (12/12 a OMAD)", "Macros concentrados na janela", "Eletrolitos no jejum"],
    fasting: { label: "Protocolo de Jejum", options: ["12/12", "16/8", "18/6", "20/4", "OMAD"] },
  },
  {
    key: "atleta",
    name: "Atleta / Bodybuilder",
    emoji: "💪",
    tag: "Performance",
    color: "from-emerald-500 to-green-600",
    description: "40–56 kcal/kg. Periodização para Bulk, Cutting, Recomp e Peak Week.",
    indicatedFor: "Hipertrofia · Cutting · Recomposição · Peak Week · Atletas",
    macroRules: { proteinPct: [30, 40], carbsPct: [35, 50], fatPct: [15, 25], proteinPerKg: 2.2, kcalPerKg: [40, 56] },
    features: ["Periodização de macros", "Carb cycling", "Refeed days programados", "Peak Week protocol"],
  },
  {
    key: "vegano",
    name: "Vegano / Plant-Based",
    emoji: "🌿",
    tag: "Plant-Based",
    color: "from-green-500 to-lime-500",
    description: "Proteína completa de fontes vegetais com suplementação automática.",
    indicatedFor: "Veganos · Vegetarianos · Saúde ambiental · Ética animal",
    macroRules: { proteinPct: [25, 30], carbsPct: [45, 55], fatPct: [20, 25], proteinPerKg: 1.8 },
    features: ["Combinação de aminoácidos", "Suplementação B12/D3 automática", "Fontes vegetais otimizadas"],
  },
  {
    key: "mediterranea",
    name: "Mediterrânea",
    emoji: "🫒",
    tag: "Longevidade",
    color: "from-amber-500 to-orange-400",
    description: "Equilíbrio de macros com gorduras saudáveis, grãos integrais e antioxidantes.",
    indicatedFor: "Saúde cardiovascular · Longevidade · Anti-inflamatório · Prevenção",
    macroRules: { proteinPct: [15, 20], carbsPct: [45, 55], fatPct: [30, 40], proteinPerKg: 1.4 },
    features: ["Azeite como gordura principal", "Peixes 3x/semana", "Grãos integrais diários"],
  },
  {
    key: "glp1",
    name: "Protocolo GLP-1",
    emoji: "💉",
    tag: "Medicamentoso",
    color: "from-pink-500 to-rose-500",
    description: "Otimizado para usuários de Ozempic/Wegovy/Mounjaro. Proteína elevada anti-sarcopenia.",
    indicatedFor: "Ozempic · Wegovy · Mounjaro · Tirzepatida · Anti-sarcopenia",
    macroRules: { proteinPct: [35, 40], carbsPct: [30, 35], fatPct: [25, 30], proteinPerKg: 2.2 },
    features: ["Proteína elevada anti-sarcopenia", "Refeições pequenas e frequentes", "Hidratação reforçada"],
  },
  {
    key: "dash",
    name: "DASH",
    emoji: "❤️",
    tag: "Hipertensão",
    color: "from-red-400 to-pink-400",
    description: "Dietary Approaches to Stop Hypertension. Redução de sódio e aumento de potássio.",
    indicatedFor: "Hipertensão · Saúde renal · Prevenção cardiovascular",
    macroRules: { proteinPct: [18, 22], carbsPct: [50, 55], fatPct: [25, 30], proteinPerKg: 1.4 },
    features: ["Sódio < 2300mg/dia", "Potássio e magnésio elevados", "Frutas e vegetais priorizados"],
  },
  {
    key: "anti_inflamatoria",
    name: "Anti-inflamatória",
    emoji: "🛡️",
    tag: "Imunidade",
    color: "from-teal-500 to-cyan-400",
    description: "Foco em alimentos anti-inflamatórios, ômega-3, cúrcuma e antioxidantes.",
    indicatedFor: "Doenças autoimunes · Artrite · Recuperação · Imunidade",
    macroRules: { proteinPct: [20, 25], carbsPct: [40, 50], fatPct: [30, 35], proteinPerKg: 1.6 },
    features: ["Ômega-3 diário", "Especiarias anti-inflamatórias", "Eliminação de ultraprocessados"],
  },
  {
    key: "flexivel",
    name: "Flexível (IIFYM)",
    emoji: "🎯",
    tag: "Liberdade",
    color: "from-indigo-500 to-blue-500",
    description: "If It Fits Your Macros. Liberdade total de alimentos desde que bata as metas de macros.",
    indicatedFor: "Adesão longo prazo · Sem restrições · Flexibilidade · Vida social",
    macroRules: { proteinPct: [25, 30], carbsPct: [40, 50], fatPct: [20, 30], proteinPerKg: 1.8 },
    features: ["80/20 — 80% clean, 20% livre", "Sem alimentos proibidos", "Foco em consistência"],
  },
];

// ─── Fórmulas de cálculo ──────────────────────────────────
const ACTIVITY_FACTORS: Record<string, { label: string; factor: number }> = {
  sedentary: { label: "Sedentário", factor: 1.2 },
  light: { label: "Leve", factor: 1.375 },
  moderate: { label: "Moderado", factor: 1.55 },
  very_active: { label: "Muito Ativo", factor: 1.725 },
  athlete: { label: "Atleta", factor: 1.9 },
};

const GOAL_ADJUSTMENTS: Record<string, { label: string; delta: number; icon: typeof TrendingDown }> = {
  lose_weight: { label: "Cutting (−500 kcal)", delta: -500, icon: TrendingDown },
  definition: { label: "Definição (−500 kcal)", delta: -500, icon: TrendingDown },
  maintenance: { label: "Manutenção (= GET)", delta: 0, icon: Minus },
  health: { label: "Saúde (= GET)", delta: 0, icon: Minus },
  gain_muscle: { label: "Bulk lean (+300 kcal)", delta: 300, icon: TrendingUp },
  performance: { label: "Performance (+250 kcal)", delta: 250, icon: TrendingUp },
  glp1: { label: "GLP-1 (−400 kcal)", delta: -400, icon: TrendingDown },
};

const calcGEB = (w: number, h: number, age: number, sex: string) => {
  // Multiple formulas
  const mifflin = sex === "male" ? 10 * w + 6.25 * h - 5 * age + 5 : 10 * w + 6.25 * h - 5 * age - 161;
  const harris = sex === "male"
    ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * age
    : 447.593 + 9.247 * w + 3.098 * h - 4.330 * age;
  const fao = sex === "male"
    ? (age < 30 ? 15.3 * w + 679 : age < 60 ? 11.6 * w + 879 : 13.5 * w + 487)
    : (age < 30 ? 14.7 * w + 496 : age < 60 ? 8.7 * w + 829 : 10.5 * w + 596);

  return {
    mifflin: Math.round(mifflin),
    harris: Math.round(harris),
    fao: Math.round(fao),
    best: Math.round(mifflin), // default to Mifflin
  };
};

// ═══════════════════════════════════════════════════════════
const ProtocolEnginePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateProfile, refetch } = useProfile();

  const [selectedProtocol, setSelectedProtocol] = useState<string>(profile?.active_protocol || "flexivel");
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null);
  const [fastingWindow, setFastingWindow] = useState("16/8");
  const [athletePhase, setAthletePhase] = useState<"bulk" | "cutting" | "recomp" | "peak_week">("bulk");
  const [saving, setSaving] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const currentProtocol = useMemo(() => PROTOCOLS.find(p => p.key === selectedProtocol), [selectedProtocol]);

  // Calculate everything from profile
  const calculations = useMemo(() => {
    if (!profile) return null;
    const w = profile.weight_kg || 70;
    const h = profile.height_cm || 170;
    const birthDate = profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(1990, 0, 1);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const sex = profile.sex || "male";
    const actLevel = profile.activity_level || "moderate";

    const geb = calcGEB(w, h, age, sex);
    const factor = ACTIVITY_FACTORS[actLevel]?.factor || 1.55;
    const get = Math.round(geb.best * factor);

    const goalAdj = GOAL_ADJUSTMENTS[profile.goal || "maintenance"] || GOAL_ADJUSTMENTS.maintenance;
    const vet = get + goalAdj.delta;

    // Apply protocol macros
    const proto = PROTOCOLS.find(p => p.key === selectedProtocol);
    if (!proto) return { geb, get, vet, protein: 0, carbs: 0, fat: 0, proteinPct: 0, carbsPct: 0, fatPct: 0, weeklyDelta: 0, weeksToGoal: 0 };

    const proteinPerKg = proto.macroRules.proteinPerKg || 1.6;
    const protein = Math.round(w * proteinPerKg);
    const proteinKcal = protein * 4;

    // Use midpoint of protocol pct ranges for fat, then fill carbs
    const fatPctMid = (proto.macroRules.fatPct[0] + proto.macroRules.fatPct[1]) / 2 / 100;
    const fat = Math.round((vet * fatPctMid) / 9);
    const fatKcal = fat * 9;

    let carbs: number;
    if (proto.macroRules.carbsAbsolute) {
      carbs = Math.min(proto.macroRules.carbsAbsolute, Math.round(Math.max((vet - proteinKcal - fatKcal) / 4, 20)));
    } else {
      carbs = Math.round(Math.max((vet - proteinKcal - fatKcal) / 4, 20));
    }

    const totalKcal = proteinKcal + carbs * 4 + fatKcal;
    const proteinPct = Math.round((proteinKcal / totalKcal) * 100);
    const carbsPct = Math.round((carbs * 4 / totalKcal) * 100);
    const fatPct = Math.round((fatKcal / totalKcal) * 100);

    // VENTA projection
    const weeklyDelta = Math.round((goalAdj.delta * 7) / 7700 * 10) / 10; // kg/week

    return { geb, get, vet, protein, carbs, fat, proteinPct, carbsPct, fatPct, weeklyDelta };
  }, [profile, selectedProtocol]);

  const activateProtocol = useCallback(async () => {
    if (!user || !calculations || !currentProtocol) return;
    setSaving(true);

    const error = await updateProfile({
      active_protocol: selectedProtocol,
      vet_kcal: calculations.vet,
      geb_kcal: calculations.geb.best,
      get_kcal: calculations.get,
      protein_g: calculations.protein,
      carbs_g: calculations.carbs,
      fat_g: calculations.fat,
    });

    if (error) {
      toast.error("Erro ao ativar protocolo");
    } else {
      toast.success(`Protocolo "${currentProtocol.name}" ativado! Macros recalculados ✓`);
      await refetch();
    }
    setSaving(false);
  }, [user, calculations, currentProtocol, selectedProtocol, updateProfile, refetch]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground font-display">Motor de Protocolos</h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              10 dietas · 1 motor · ∞ pessoas
            </p>
          </div>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className={`p-2 rounded-lg border transition-colors ${showCalculator ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            <Calculator className="w-4 h-4" />
          </button>
        </div>

        {/* ── GEB/GET/VET Calculator ───────────────────── */}
        <AnimatePresence>
          {showCalculator && calculations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
                <h2 className="text-xs font-mono text-primary uppercase tracking-wider font-bold">
                  Motor de Cálculo Energético
                </h2>

                {/* Step 1 - GEB */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">01</span>
                    <span className="text-xs font-bold text-foreground">GEB — Metabolismo Basal</span>
                  </div>
                  <div className="ml-8 grid grid-cols-3 gap-2">
                    {[
                      { label: "Mifflin-St Jeor", value: calculations.geb.mifflin, active: true },
                      { label: "Harris-Benedict", value: calculations.geb.harris, active: false },
                      { label: "FAO/WHO/UNU", value: calculations.geb.fao, active: false },
                    ].map(f => (
                      <div key={f.label} className={`rounded-lg border p-2 text-center ${f.active ? "border-primary bg-primary/5" : "border-border"}`}>
                        <p className="text-[8px] font-mono text-muted-foreground">{f.label}</p>
                        <p className={`text-sm font-bold font-mono ${f.active ? "text-primary" : "text-foreground"}`}>{f.value}</p>
                        <p className="text-[8px] font-mono text-muted-foreground">kcal</p>
                      </div>
                    ))}
                  </div>
                  <p className="ml-8 text-[9px] text-muted-foreground font-mono">
                    ✦ Usando Mifflin-St Jeor (mais precisa para seu perfil)
                  </p>
                </div>

                {/* Step 2 - GET */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">02</span>
                    <span className="text-xs font-bold text-foreground">GET — Gasto Total Diário</span>
                  </div>
                  <div className="ml-8 flex items-center gap-3">
                    <div className="rounded-lg border border-border p-2 text-center flex-1">
                      <p className="text-[8px] font-mono text-muted-foreground">GEB</p>
                      <p className="text-sm font-bold font-mono text-foreground">{calculations.geb.best}</p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">×</span>
                    <div className="rounded-lg border border-primary bg-primary/5 p-2 text-center flex-1">
                      <p className="text-[8px] font-mono text-muted-foreground">Fator</p>
                      <p className="text-sm font-bold font-mono text-primary">
                        {ACTIVITY_FACTORS[profile.activity_level || "moderate"]?.factor || 1.55}
                      </p>
                      <p className="text-[8px] font-mono text-muted-foreground">
                        {ACTIVITY_FACTORS[profile.activity_level || "moderate"]?.label || "Moderado"}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">=</span>
                    <div className="rounded-lg border border-primary bg-primary/10 p-2 text-center flex-1">
                      <p className="text-[8px] font-mono text-muted-foreground">GET</p>
                      <p className="text-lg font-bold font-mono text-primary">{calculations.get}</p>
                      <p className="text-[8px] font-mono text-muted-foreground">kcal</p>
                    </div>
                  </div>
                </div>

                {/* Step 3 - VET */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">03</span>
                    <span className="text-xs font-bold text-foreground">VET — Meta Calórica Final</span>
                  </div>
                  <div className="ml-8">
                    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-mono text-muted-foreground">Sua meta diária</p>
                          <p className="text-2xl font-bold font-mono text-primary">{calculations.vet} <span className="text-xs text-muted-foreground">kcal/dia</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-mono text-muted-foreground">VENTA (7.700 kcal/kg)</p>
                          <p className={`text-sm font-bold font-mono ${calculations.weeklyDelta < 0 ? "text-red-400" : calculations.weeklyDelta > 0 ? "text-green-400" : "text-foreground"}`}>
                            {calculations.weeklyDelta > 0 ? "+" : ""}{calculations.weeklyDelta} kg/sem
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Active protocol banner ───────────────────── */}
        {profile.active_protocol && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-primary/20 bg-primary/5 p-3 mb-4 flex items-center gap-3"
          >
            <span className="text-xl">{PROTOCOLS.find(p => p.key === profile.active_protocol)?.emoji || "🎯"}</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-foreground">
                Protocolo ativo: {PROTOCOLS.find(p => p.key === profile.active_protocol)?.name}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground">
                {profile.vet_kcal} kcal · P{profile.protein_g}g · C{profile.carbs_g}g · G{profile.fat_g}g
              </p>
            </div>
            <Check className="w-4 h-4 text-primary" />
          </motion.div>
        )}

        {/* ── Protocol grid ────────────────────────────── */}
        <div className="space-y-2">
          {PROTOCOLS.map((proto, i) => {
            const isSelected = selectedProtocol === proto.key;
            const isExpanded = expandedProtocol === proto.key;
            const isActive = profile.active_protocol === proto.key;

            return (
              <motion.div
                key={proto.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  onClick={() => {
                    setSelectedProtocol(proto.key);
                    setExpandedProtocol(isExpanded ? null : proto.key);
                  }}
                  className={`w-full text-left rounded-xl border p-3 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border bg-card hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${proto.color} flex items-center justify-center text-lg shadow-lg`}>
                      {proto.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{proto.name}</span>
                        {isActive && (
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">ATIVO</span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground truncate">{proto.description}</p>
                    </div>
                    <span className={`text-[9px] font-mono px-2 py-1 rounded-full border ${isSelected ? "border-primary/30 text-primary" : "border-border text-muted-foreground"}`}>
                      {proto.tag}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-b-xl border border-t-0 border-border bg-card/50 p-4 space-y-4 -mt-1">
                        {/* Macro distribution */}
                        <div>
                          <h4 className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Distribuição de Macros</h4>
                          <div className="space-y-1.5">
                            {[
                              { label: "Proteína", pct: calculations?.proteinPct || 0, color: "bg-primary" },
                              { label: "Carboidrato", pct: calculations?.carbsPct || 0, color: "bg-accent" },
                              { label: "Gordura", pct: calculations?.fatPct || 0, color: "bg-blue-500" },
                            ].map(m => (
                              <div key={m.label} className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-muted-foreground w-20">{m.label}</span>
                                <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                                  <motion.div
                                    className={`h-full rounded-full ${m.color}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${m.pct}%` }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                                <span className="text-xs font-mono font-bold text-foreground w-10 text-right">{m.pct}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Calculated values */}
                        {calculations && (
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: "Kcal", value: calculations.vet, unit: "" },
                              { label: "Prot", value: calculations.protein, unit: "g" },
                              { label: "Carb", value: calculations.carbs, unit: "g" },
                              { label: "Gord", value: calculations.fat, unit: "g" },
                            ].map(m => (
                              <div key={m.label} className="rounded-lg border border-border bg-card p-2 text-center">
                                <p className="text-[8px] font-mono text-muted-foreground">{m.label}</p>
                                <p className="text-sm font-bold font-mono text-primary">{m.value}{m.unit}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Fasting options */}
                        {proto.fasting && (
                          <div>
                            <h4 className="text-[10px] font-mono text-muted-foreground uppercase mb-2">{proto.fasting.label}</h4>
                            <div className="flex gap-1.5">
                              {proto.fasting.options.map(opt => (
                                <button
                                  key={opt}
                                  onClick={(e) => { e.stopPropagation(); setFastingWindow(opt); }}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${
                                    fastingWindow === opt
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-border text-muted-foreground hover:border-primary/30"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Athlete phase */}
                        {proto.key === "atleta" && (
                          <div>
                            <h4 className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Fase do Ciclo</h4>
                            <div className="grid grid-cols-4 gap-1.5">
                              {(["bulk", "cutting", "recomp", "peak_week"] as const).map(phase => (
                                <button
                                  key={phase}
                                  onClick={(e) => { e.stopPropagation(); setAthletePhase(phase); }}
                                  className={`px-2 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${
                                    athletePhase === phase
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-border text-muted-foreground hover:border-primary/30"
                                  }`}
                                >
                                  {phase === "peak_week" ? "Peak Week" : phase.charAt(0).toUpperCase() + phase.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        <div>
                          <h4 className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Funcionalidades</h4>
                          <div className="space-y-1">
                            {proto.features.map(f => (
                              <div key={f} className="flex items-center gap-2 text-[10px] text-foreground">
                                <span className="w-1 h-1 rounded-full bg-primary" />
                                {f}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Indicated for */}
                        <div className="rounded-lg bg-muted/30 p-2">
                          <p className="text-[9px] font-mono text-muted-foreground">
                            <span className="text-primary font-bold">Indicado para:</span> {proto.indicatedFor}
                          </p>
                        </div>

                        {/* Activate button */}
                        <Button
                          onClick={(e) => { e.stopPropagation(); activateProtocol(); }}
                          disabled={saving || isActive}
                          className="w-full gap-2"
                        >
                          {isActive ? (
                            <>
                              <Check className="w-4 h-4" />
                              Protocolo Ativo
                            </>
                          ) : saving ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Ativando...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              Ativar Protocolo
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* ── Info footer ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-xl border border-border bg-card/50 p-4 text-center"
        >
          <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Ao ativar um protocolo, a IA recalcula automaticamente seus macros,
            metas calóricas e plano alimentar. Troca em 1 toque.
          </p>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ProtocolEnginePage;
