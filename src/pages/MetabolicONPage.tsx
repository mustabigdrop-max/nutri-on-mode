import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Loader2, Zap, Flame, Droplets, Dumbbell, Apple, Settings2, FlaskConical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import CitationBadge from "@/components/science/CitationBadge";

interface MetabolicProfile {
  weight: number;
  height: number;
  age: number;
  sex: string;
  body_fat_percent: number;
  lean_mass: number;
  tdee: number;
  goal: string;
  activity_level: string;
  train_time: string;
  does_aej: boolean;
  post_cardio: boolean;
  restrictions: string[];
  health_conditions: string[];
  budget_level: string;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  ai_source?: string;
}

const goals = [
  { key: "emagrecimento", label: "Emagrecimento", icon: "🔥", color: "#ef4444" },
  { key: "bulking", label: "Bulking", icon: "💪", color: "#3b82f6" },
  { key: "cutting", label: "Cutting", icon: "✂️", color: "#f59e0b" },
  { key: "recomposicao", label: "Recomposição", icon: "🔄", color: "#8b5cf6" },
  { key: "performance", label: "Performance", icon: "⚡", color: "#10b981" },
  { key: "saude", label: "Saúde", icon: "💚", color: "#4ade80" },
];

const activityLevels = [
  { key: "sedentario", label: "Sedentário", factor: 1.2 },
  { key: "leve", label: "Levemente ativo", factor: 1.375 },
  { key: "moderado", label: "Moderado", factor: 1.55 },
  { key: "intenso", label: "Muito ativo", factor: 1.725 },
  { key: "atleta", label: "Atleta", factor: 1.9 },
];

const quickQuestions = [
  "Quanto de carboidrato devo comer por dia?",
  "O que comer no pós-treino? (janela GLUT-4)",
  "Monte meu plano alimentar de hoje",
  "Como distribuir proteína ao longo do dia?",
  "Receita barata e nutritiva para pós-treino",
  "O que a ciência diz sobre CHO à noite?",
  "Preciso fazer AEJ para emagrecer?",
  "Como otimizar minha janela anabólica?",
];

function calcTDEE(weight: number, height: number, age: number, sex: string, activityFactor: number): number {
  const bmr = sex === "masculino"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  return Math.round(bmr * activityFactor);
}

function getMacros(goal: string, leanMass: number, tdee: number) {
  const macroRanges: Record<string, { cho: [number, number]; ptn: [number, number]; lip: [number, number]; calAdj: number }> = {
    emagrecimento: { cho: [1.5, 2.5], ptn: [2.4, 3.0], lip: [0.8, 1.0], calAdj: -400 },
    bulking: { cho: [4.0, 6.0], ptn: [1.8, 2.5], lip: [1.2, 1.5], calAdj: 400 },
    cutting: { cho: [1.0, 2.0], ptn: [3.0, 3.5], lip: [0.8, 1.0], calAdj: -300 },
    recomposicao: { cho: [2.5, 3.5], ptn: [2.2, 2.8], lip: [1.0, 1.2], calAdj: 0 },
    performance: { cho: [5.0, 8.0], ptn: [2.0, 3.0], lip: [1.0, 1.5], calAdj: 300 },
    saude: { cho: [3.0, 4.0], ptn: [1.6, 2.0], lip: [1.0, 1.3], calAdj: 0 },
  };
  const r = macroRanges[goal] || macroRanges.saude;
  const choMid = ((r.cho[0] + r.cho[1]) / 2) * leanMass;
  const ptnMid = ((r.ptn[0] + r.ptn[1]) / 2) * leanMass;
  const lipMid = ((r.lip[0] + r.lip[1]) / 2) * leanMass;
  const targetCal = tdee + r.calAdj;
  return {
    cho: Math.round(choMid),
    ptn: Math.round(ptnMid),
    lip: Math.round(lipMid),
    targetCal,
    choRange: r.cho,
    ptnRange: r.ptn,
    lipRange: r.lip,
  };
}

const MetabolicONPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState("chat");
  const [profile, setProfile] = useState<MetabolicProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Profile form state
  const [formWeight, setFormWeight] = useState("");
  const [formHeight, setFormHeight] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formSex, setFormSex] = useState("masculino");
  const [formBf, setFormBf] = useState("");
  const [formGoal, setFormGoal] = useState("emagrecimento");
  const [formActivity, setFormActivity] = useState("moderado");
  const [formTrainTime, setFormTrainTime] = useState("tarde");
  const [formAej, setFormAej] = useState(false);
  const [formPostCardio, setFormPostCardio] = useState(false);
  const [formBudget, setFormBudget] = useState("medio");
  const [savingProfile, setSavingProfile] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadProfile = async () => {
    setProfileLoading(true);
    const { data } = await supabase
      .from("user_metabolic_profiles" as any)
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data) {
      setProfile(data as any);
      populateForm(data as any);
    } else {
      // Try to load from profiles table for defaults
      const { data: baseProfile } = await supabase
        .from("profiles")
        .select("weight_kg, height_cm, sex, goal, activity_level, full_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (baseProfile) {
        setFormWeight(baseProfile.weight_kg?.toString() || "");
        setFormHeight(baseProfile.height_cm?.toString() || "");
        setFormSex(baseProfile.sex || "masculino");
        setFormGoal(baseProfile.goal || "emagrecimento");
        setFormActivity(baseProfile.activity_level || "moderado");
      }
      setShowProfileForm(true);
    }
    setProfileLoading(false);
  };

  const populateForm = (p: any) => {
    setFormWeight(p.weight?.toString() || "");
    setFormHeight(p.height?.toString() || "");
    setFormAge(p.age?.toString() || "");
    setFormSex(p.sex || "masculino");
    setFormBf(p.body_fat_percent?.toString() || "");
    setFormGoal(p.goal || "emagrecimento");
    setFormActivity(p.activity_level || "moderado");
    setFormTrainTime(p.train_time || "tarde");
    setFormAej(p.does_aej || false);
    setFormPostCardio(p.post_cardio || false);
    setFormBudget(p.budget_level || "medio");
  };

  const saveProfile = async () => {
    if (!formWeight || !formHeight || !formAge) {
      toast({ title: "Preencha peso, altura e idade", variant: "destructive" });
      return;
    }
    setSavingProfile(true);
    const w = parseFloat(formWeight);
    const h = parseFloat(formHeight);
    const a = parseInt(formAge);
    const bf = formBf ? parseFloat(formBf) : 20;
    const lm = w * (1 - bf / 100);
    const actFactor = activityLevels.find((l) => l.key === formActivity)?.factor || 1.55;
    const tdee = calcTDEE(w, h, a, formSex, actFactor);

    const profileData = {
      user_id: user!.id,
      weight: w,
      height: h,
      age: a,
      sex: formSex,
      body_fat_percent: bf,
      lean_mass: parseFloat(lm.toFixed(1)),
      tdee,
      goal: formGoal,
      activity_level: formActivity,
      train_time: formTrainTime,
      does_aej: formAej,
      post_cardio: formPostCardio,
      budget_level: formBudget,
      restrictions: [],
      health_conditions: [],
    };

    const { error } = await supabase
      .from("user_metabolic_profiles" as any)
      .upsert(profileData as any, { onConflict: "user_id" });

    if (error) {
      toast({ title: "Erro ao salvar perfil", description: error.message, variant: "destructive" });
    } else {
      setProfile(profileData as any);
      setShowProfileForm(false);
      toast({ title: "Perfil metabólico salvo!" });
    }
    setSavingProfile(false);
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const userMsg: ChatMsg = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("metabolicon", {
        body: {
          message: msg,
          userProfile: profile,
          conversationHistory: messages.slice(-10),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const assistantMsg: ChatMsg = {
        role: "assistant",
        content: data.response,
        citations: data.citations,
        ai_source: data.ai_source,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const macros = profile ? getMacros(profile.goal, profile.lean_mass, profile.tdee) : null;

  const mealTimeline = profile
    ? [
        { time: profile.does_aej ? "05:30" : "07:00", label: profile.does_aej ? "Pós-AEJ" : "Café", emoji: "☀️", pct: profile.does_aej ? 10 : 20, note: profile.does_aej ? "CHO leve + PTN" : "CHO complexo + PTN" },
        { time: profile.train_time === "manha" ? "08:00" : "09:00", label: "Café da manhã", emoji: "🥣", pct: 20, note: "CHO complexo + fibras" },
        { time: "12:00", label: "Almoço", emoji: "🍽️", pct: 25, note: "Refeição principal" },
        { time: profile.train_time === "tarde" ? "15:00" : "17:00", label: "Pré-treino", emoji: "⚡", pct: 15, note: "IG médio-baixo, 30-45min antes" },
        { time: profile.train_time === "tarde" ? "17:00" : "19:00", label: "Pós-treino (GLUT-4)", emoji: "🎯", pct: 30, note: `${macros ? Math.round(0.8 * profile.lean_mass) : "?"}–${macros ? Math.round(1.2 * profile.lean_mass) : "?"}g CHO em 30min` },
        { time: "20:00", label: "Jantar", emoji: "🌙", pct: 10, note: profile.goal === "cutting" ? "Low carb + PTN" : "CHO reduzido" },
      ]
    : [];

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0f0a" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4ade80" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0f0a", color: "#f0fdf4" }}>
      {/* Header */}
      <header className="border-b px-4 py-4" style={{ borderColor: "rgba(74,222,128,0.12)" }}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Flame className="w-6 h-6" style={{ color: "#4ade80" }} />
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              MetabolicON
            </h1>
            <p className="text-xs" style={{ color: "#9ca3af" }}>Motor de Nutrição Metabólica Avançada</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowProfileForm(!showProfileForm)}>
            <Settings2 className="w-5 h-5" style={{ color: "#4ade80" }} />
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Profile form */}
        <AnimatePresence>
          {showProfileForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <Card style={{ background: "#111811", border: "1px solid rgba(74,222,128,0.15)" }}>
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-sm font-bold" style={{ color: "#4ade80" }}>PERFIL METABÓLICO</h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs" style={{ color: "#9ca3af" }}>Peso (kg)</label>
                      <Input value={formWeight} onChange={(e) => setFormWeight(e.target.value)} type="number" className="bg-black/40 border-green-900/30 text-white" />
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: "#9ca3af" }}>Altura (cm)</label>
                      <Input value={formHeight} onChange={(e) => setFormHeight(e.target.value)} type="number" className="bg-black/40 border-green-900/30 text-white" />
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: "#9ca3af" }}>Idade</label>
                      <Input value={formAge} onChange={(e) => setFormAge(e.target.value)} type="number" className="bg-black/40 border-green-900/30 text-white" />
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: "#9ca3af" }}>% Gordura</label>
                      <Input value={formBf} onChange={(e) => setFormBf(e.target.value)} type="number" placeholder="~20" className="bg-black/40 border-green-900/30 text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs" style={{ color: "#9ca3af" }}>Sexo</label>
                      <div className="flex gap-2 mt-1">
                        {["masculino", "feminino"].map((s) => (
                          <button key={s} onClick={() => setFormSex(s)} className="px-3 py-1.5 rounded text-xs font-medium transition-all" style={{ background: formSex === s ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${formSex === s ? "#4ade80" : "rgba(74,222,128,0.08)"}`, color: formSex === s ? "#4ade80" : "#9ca3af" }}>
                            {s === "masculino" ? "♂ Masc" : "♀ Fem"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: "#9ca3af" }}>Orçamento</label>
                      <div className="flex gap-2 mt-1">
                        {[{ k: "baixo", l: "💰" }, { k: "medio", l: "💰💰" }, { k: "alto", l: "💰💰💰" }].map((b) => (
                          <button key={b.k} onClick={() => setFormBudget(b.k)} className="px-3 py-1.5 rounded text-xs transition-all" style={{ background: formBudget === b.k ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${formBudget === b.k ? "#4ade80" : "rgba(74,222,128,0.08)"}`, color: formBudget === b.k ? "#4ade80" : "#9ca3af" }}>
                            {b.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Goal */}
                  <div>
                    <label className="text-xs" style={{ color: "#9ca3af" }}>Objetivo</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-1">
                      {goals.map((g) => (
                        <button key={g.key} onClick={() => setFormGoal(g.key)} className="p-2 rounded-lg text-center text-xs transition-all" style={{ background: formGoal === g.key ? `${g.color}22` : "rgba(255,255,255,0.03)", border: `1px solid ${formGoal === g.key ? g.color : "rgba(74,222,128,0.08)"}`, color: formGoal === g.key ? g.color : "#9ca3af" }}>
                          <span className="text-lg block">{g.icon}</span>
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity + Train time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs" style={{ color: "#9ca3af" }}>Nível de atividade</label>
                      <select value={formActivity} onChange={(e) => setFormActivity(e.target.value)} className="w-full mt-1 p-2 rounded text-xs bg-black/40 border border-green-900/30 text-white">
                        {activityLevels.map((l) => (
                          <option key={l.key} value={l.key}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: "#9ca3af" }}>Horário de treino</label>
                      <div className="flex gap-2 mt-1">
                        {["manha", "tarde", "noite"].map((t) => (
                          <button key={t} onClick={() => setFormTrainTime(t)} className="px-3 py-1.5 rounded text-xs transition-all flex-1" style={{ background: formTrainTime === t ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${formTrainTime === t ? "#4ade80" : "rgba(74,222,128,0.08)"}`, color: formTrainTime === t ? "#4ade80" : "#9ca3af" }}>
                            {t === "manha" ? "🌅 Manhã" : t === "tarde" ? "☀️ Tarde" : "🌙 Noite"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "#9ca3af" }}>
                      <input type="checkbox" checked={formAej} onChange={(e) => setFormAej(e.target.checked)} className="accent-green-500" /> Faz AEJ
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "#9ca3af" }}>
                      <input type="checkbox" checked={formPostCardio} onChange={(e) => setFormPostCardio(e.target.checked)} className="accent-green-500" /> Cardio pós-treino
                    </label>
                  </div>

                  <Button onClick={saveProfile} disabled={savingProfile} className="w-full" style={{ background: "#4ade80", color: "#0a0f0a" }}>
                    {savingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Salvar Perfil Metabólico
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        {profile && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3" style={{ background: "rgba(255,255,255,0.03)" }}>
              <TabsTrigger value="chat" className="text-xs gap-1"><FlaskConical className="w-3 h-3" /> Chat Metabólico</TabsTrigger>
              <TabsTrigger value="macros" className="text-xs gap-1"><Zap className="w-3 h-3" /> Macros</TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs gap-1"><Apple className="w-3 h-3" /> Timeline</TabsTrigger>
            </TabsList>

            {/* MACROS TAB */}
            <TabsContent value="macros">
              {macros && (
                <div className="space-y-4">
                  {/* Target cal */}
                  <Card style={{ background: "#111811", border: "1px solid rgba(74,222,128,0.15)" }}>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs" style={{ color: "#9ca3af" }}>META CALÓRICA DIÁRIA</p>
                      <p className="text-4xl font-bold" style={{ color: "#4ade80", fontFamily: "'Space Grotesk'" }}>{macros.targetCal} <span className="text-lg">kcal</span></p>
                      <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
                        TDEE {profile.tdee} {macros.targetCal > profile.tdee ? `+ ${macros.targetCal - profile.tdee}` : macros.targetCal < profile.tdee ? `- ${profile.tdee - macros.targetCal}` : "± 0"} kcal
                      </p>
                    </CardContent>
                  </Card>

                  {/* Macro cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Carboidrato", value: macros.cho, unit: "g", color: "#f59e0b", range: macros.choRange, icon: "🍚", kcal: macros.cho * 4 },
                      { label: "Proteína", value: macros.ptn, unit: "g", color: "#ef4444", range: macros.ptnRange, icon: "🥩", kcal: macros.ptn * 4 },
                      { label: "Gordura", value: macros.lip, unit: "g", color: "#3b82f6", range: macros.lipRange, icon: "🥑", kcal: macros.lip * 9 },
                    ].map((m) => (
                      <Card key={m.label} style={{ background: "#111811", border: `1px solid ${m.color}33` }}>
                        <CardContent className="p-3 text-center">
                          <p className="text-2xl mb-1">{m.icon}</p>
                          <p className="text-xs" style={{ color: "#9ca3af" }}>{m.label}</p>
                          <p className="text-2xl font-bold" style={{ color: m.color, fontFamily: "'Space Grotesk'" }}>{m.value}<span className="text-sm">{m.unit}</span></p>
                          <p className="text-[10px] mt-1" style={{ color: "#6b7280" }}>{m.range[0]}–{m.range[1]}g/kgMM</p>
                          <p className="text-[10px]" style={{ color: "#6b7280" }}>{m.kcal} kcal</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Profile summary */}
                  <Card style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)" }}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        {[
                          { label: "Peso", value: `${profile.weight}kg` },
                          { label: "Massa Magra", value: `${profile.lean_mass}kg` },
                          { label: "% Gordura", value: `${profile.body_fat_percent}%` },
                          { label: "Objetivo", value: goals.find((g) => g.key === profile.goal)?.label || profile.goal },
                        ].map((s) => (
                          <div key={s.label}>
                            <p className="text-[10px]" style={{ color: "#6b7280" }}>{s.label}</p>
                            <p className="text-sm font-bold" style={{ color: "#f0fdf4" }}>{s.value}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* GLUT-4 card */}
                  <Card style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.20)" }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Dumbbell className="w-5 h-5" style={{ color: "#4ade80" }} />
                        <h3 className="text-sm font-bold" style={{ color: "#4ade80" }}>JANELA GLUT-4 PÓS-TREINO</h3>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#4ade80" }} />
                      </div>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>
                        Nos 30-45 min após o treino, o GLUT-4 transloca para a membrana muscular de forma insulino-independente.
                        Captação de glicose até 3x maior.
                      </p>
                      <div className="mt-3 flex gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold" style={{ color: "#f59e0b" }}>{Math.round(0.8 * profile.lean_mass)}–{Math.round(1.2 * profile.lean_mass)}g</p>
                          <p className="text-[10px]" style={{ color: "#6b7280" }}>CHO pós-treino</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold" style={{ color: "#ef4444" }}>25–35g</p>
                          <p className="text-[10px]" style={{ color: "#6b7280" }}>PTN simultânea</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold" style={{ color: "#3b82f6" }}>0g</p>
                          <p className="text-[10px]" style={{ color: "#6b7280" }}>Gordura (evitar)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* TIMELINE TAB */}
            <TabsContent value="timeline">
              <div className="space-y-2">
                <h3 className="text-sm font-bold" style={{ color: "#4ade80" }}>TIMELINE DO DIA</h3>
                {mealTimeline.map((meal, i) => {
                  const choAmount = macros ? Math.round((meal.pct / 100) * macros.cho) : 0;
                  const isGlut4 = meal.label.includes("GLUT-4");
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card style={{ background: isGlut4 ? "rgba(74,222,128,0.08)" : "#111811", border: `1px solid ${isGlut4 ? "#4ade80" : "rgba(74,222,128,0.08)"}` }}>
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="text-center" style={{ minWidth: 50 }}>
                            <p className="text-lg">{meal.emoji}</p>
                            <p className="text-[10px] font-mono" style={{ color: "#4ade80" }}>{meal.time}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium" style={{ color: isGlut4 ? "#4ade80" : "#f0fdf4" }}>
                              {meal.label}
                              {isGlut4 && <span className="ml-2 inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: "#4ade80" }} />}
                            </p>
                            <p className="text-[11px]" style={{ color: "#9ca3af" }}>{meal.note}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold" style={{ color: "#f59e0b" }}>{choAmount}g</p>
                            <p className="text-[10px]" style={{ color: "#6b7280" }}>{meal.pct}% CHO</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                {/* Hydration card */}
                <Card style={{ background: "#111811", border: "1px solid rgba(59,130,246,0.15)" }}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <Droplets className="w-6 h-6" style={{ color: "#3b82f6" }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "#3b82f6" }}>Hidratação</p>
                      <p className="text-[11px]" style={{ color: "#9ca3af" }}>Base: {profile ? Math.round(profile.weight * 40) : "?"}ml/dia + 500-750ml/h treino</p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: "#3b82f6" }}>{profile ? (profile.weight * 40 / 1000).toFixed(1) : "?"}L</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* CHAT TAB */}
            <TabsContent value="chat">
              <div className="space-y-3">
                {/* Welcome if empty */}
                {messages.length === 0 && (
                  <Card style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)" }}>
                    <CardContent className="p-4">
                      <p className="text-sm" style={{ color: "#f0fdf4" }}>
                        Olá! Sou o <strong style={{ color: "#4ade80" }}>MetabolicON</strong> — seu motor de inteligência metabólica.
                      </p>
                      <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>
                        Massa magra: <strong>{profile.lean_mass}kg</strong> · TDEE: <strong>{profile.tdee} kcal</strong> · Objetivo: <strong>{goals.find((g) => g.key === profile.goal)?.label}</strong>
                      </p>
                      <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>
                        Pergunte sobre macros, janela GLUT-4, substratos energéticos, receitas de baixo custo ou peça um plano alimentar completo.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Quick questions */}
                {messages.length === 0 && (
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q) => (
                      <button key={q} onClick={() => sendMessage(q)} className="px-3 py-1.5 rounded-full text-[11px] transition-all" style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", color: "#4ade80" }}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[85%] rounded-xl p-3" style={{ background: msg.role === "user" ? "rgba(74,222,128,0.15)" : "#111811", border: `1px solid ${msg.role === "user" ? "rgba(74,222,128,0.25)" : "rgba(74,222,128,0.08)"}` }}>
                        {msg.role === "assistant" && msg.ai_source && (
                          <Badge className="mb-2 text-[10px]" style={{ background: msg.ai_source === "dual" ? "rgba(139,92,246,0.15)" : "rgba(74,222,128,0.1)", color: msg.ai_source === "dual" ? "#a78bfa" : "#4ade80", border: "none" }}>
                            {msg.ai_source === "dual" ? "🔬 Perplexity + MetabolicON" : "🧬 MetabolicON"}
                          </Badge>
                        )}
                        <div className="prose prose-sm prose-invert max-w-none text-[13px]" style={{ color: "#f0fdf4" }}>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-2">
                            <CitationBadge citations={msg.citations} lastUpdated={new Date().toISOString()} source="Perplexity Sonar Pro" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#111811", border: "1px solid rgba(74,222,128,0.08)" }}>
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#4ade80" }} />
                      <span className="text-xs" style={{ color: "#9ca3af" }}>Analisando seu perfil metabólico...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />

                {/* Input */}
                <div className="sticky bottom-0 pt-2 pb-4" style={{ background: "linear-gradient(transparent, #0a0f0a 30%)" }}>
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Pergunte sobre substratos, GLUT-4, macros, receitas..."
                      className="bg-black/40 border-green-900/30 text-white placeholder:text-gray-600 flex-1"
                      disabled={loading}
                    />
                    <Button onClick={() => sendMessage()} disabled={loading || !input.trim()} size="icon" style={{ background: "#4ade80", color: "#0a0f0a" }}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* No profile state */}
        {!profile && !showProfileForm && (
          <Card style={{ background: "#111811", border: "1px solid rgba(74,222,128,0.15)" }}>
            <CardContent className="p-6 text-center">
              <Flame className="w-12 h-12 mx-auto mb-3" style={{ color: "#4ade80" }} />
              <h2 className="text-lg font-bold mb-2" style={{ color: "#f0fdf4" }}>Configure seu Perfil Metabólico</h2>
              <p className="text-sm mb-4" style={{ color: "#9ca3af" }}>Para calcular seus macros com base em massa magra e personalizar suas recomendações.</p>
              <Button onClick={() => setShowProfileForm(true)} style={{ background: "#4ade80", color: "#0a0f0a" }}>
                Configurar agora
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MetabolicONPage;
