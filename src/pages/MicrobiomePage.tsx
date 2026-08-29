import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calculator, ListChecks, Brain, BookOpen, BarChart3,
  Droplets, ChevronDown, ChevronRight, Sparkles, Check, Loader2,
  AlertTriangle, Leaf, FlaskConical, Dna, MessageCircle, Send,
  Activity, Smile, Frown, Meh, TrendingUp, Plus
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import BottomNav from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analisarMicrobioma, salvarDiagnosticoMicrobioma } from "@/lib/microbioma";

// ── CONSTANTS ──

const TABS = [
  { id: "guton", label: "GutON", icon: MessageCircle },
  { id: "fibras", label: "Fibras", icon: Calculator },
  { id: "protocolo", label: "Protocolo", icon: ListChecks },
  { id: "sintomas", label: "Diário", icon: Activity },
  { id: "ia", label: "Análise", icon: Brain },
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
    phase: 1, title: "Remove — Limpeza", weeks: "Semanas 1-2", fiberPercent: 50,
    steps: [
      "Eliminar açúcar refinado, álcool, ultraprocessados com emulsificantes",
      "Remover adoçantes artificiais (sucralose, sacarina) — meta-análise 2022 confirma dano ao microbioma",
      "Introduzir fibras gradualmente: começar com **50% da meta**",
      "Hidratação mínima: **35ml/kg** de peso corporal",
      "Adicionar **gengibre e cúrcuma** diariamente (anti-inflamatórios naturais)",
    ],
    foundation: "Framework 4R — Remove: eliminar agentes que perpetuam disbiose",
  },
  {
    phase: 2, title: "Replace + Reinoculate", weeks: "Semanas 3-5", fiberPercent: 75,
    steps: [
      "Enzimas digestivas via alimentos: **abacaxi** (bromelina), **mamão** (papaína), **gengibre**",
      "Vinagre de maçã não filtrado (1 col sopa antes das refeições): ácido acético",
      "Introduzir fermentados: **kefir caseiro** (30-50 cepas), iogurte natural integral, chucrute",
      "Escalar fibras para **75% da meta** — aveia, banana verde, linhaça",
      "Probiótico: **L. rhamnosus GG** ou **S. boulardii** — 10 bi UFC/dia",
    ],
    foundation: "PREDICT Study + Sonnenburg Lab — fermentados > diversidade microbiana",
  },
  {
    phase: 3, title: "Repair — Diversificação", weeks: "Semanas 6-9", fiberPercent: 100,
    steps: [
      "Regra dos **30 vegetais/semana** (American Gut Project)",
      "Atingir **100% da meta** de fibras",
      "Prebióticos específicos: FOS (alho, cebola), inulina (chicória, banana verde)",
      "L-glutamina 5-10g/dia para Leaky Gut (reparar tight junctions)",
      "Ômega-3 via sardinha 2-3x/semana (reduz zonulina — marcador de permeabilidade)",
      "Polifenóis: cúrcuma, chá verde, maçã — aumentam Akkermansia e Bifidobacterium",
    ],
    foundation: "Nutrients 2021 — L-glutamina melhora integridade da barreira intestinal",
  },
  {
    phase: 4, title: "Consolidação", weeks: "Semanas 10-12", fiberPercent: 100,
    steps: [
      "Manter **30 vegetais/semana** como hábito permanente",
      "Reduzir probiótico para manutenção (5 bi UFC/dia) ou manter via alimentação",
      "Reintroduzir grupos removidos na Fase 1 (um por vez, a cada 3 dias)",
      "Protocolo Low-FODMAP: iniciar fase de reintrodução se aplicável",
      "Caldo de osso 200ml em jejum (colágeno + gelatina + glicina → reparo mucosa)",
    ],
    foundation: "Cryan et al. 2019 — eixo intestino-cérebro consolidado",
  },
];

const STUDIES = [
  {
    icon: "🔬", title: "Sonnenburg Lab — Stanford (2021)", tag: "Stanford",
    finding: "Dieta rica em fermentados vs fibras: fermentados aumentaram diversidade microbiana.",
    stat: "+19 espécies",
    detail: "Fermentados superam fibras isoladas para diversidade do microbioma.",
  },
  {
    icon: "🧬", title: "PREDICT Study — King's College London (2022)", tag: "UK Research",
    finding: "Resposta glicêmica individual depende mais da microbiota que do alimento.",
    stat: "Personalização",
    detail: "Base para personalização nutricional via perfil do microbioma.",
  },
  {
    icon: "🧠", title: "Cryan et al. — Nature Reviews Neuroscience (2019)", tag: "Neuroscience",
    finding: "Eixo intestino-cérebro: microbiota produz 90% da serotonina corporal.",
    stat: "90% serotonina",
    detail: "Disbiose impacta humor, ansiedade, compulsão alimentar e cognição.",
  },
  {
    icon: "🦠", title: "Mayer et al. — Cell Host & Microbe (2022)", tag: "Cell",
    finding: "Emulsificantes (carboximetilcelulose, polissorbato 80) danificam biofilme intestinal.",
    stat: "↑ Permeabilidade",
    detail: "Ultraprocessados como causa direta de Leaky Gut.",
  },
  {
    icon: "🥦", title: "American Gut Project — Knight Lab (2018)", tag: "NIH",
    finding: "30+ vegetais/semana = microbiota significativamente mais diversa.",
    stat: "30+ vegetais/sem",
    detail: "Ervas e especiarias contam — facilita atingir a meta.",
  },
  {
    icon: "🏋️", title: "Clarke et al. (2014)", tag: "Sports Science",
    finding: "Atletas de elite possuem microbiota com maior diversidade e Akkermansia.",
    stat: "↑ Akkermansia",
    detail: "Exercício regular = prebiótico natural para o microbioma.",
  },
];

const BRISTOL_LABELS = ["", "🪨 Bolinhas duras", "🔗 Grumoso", "🌽 Salsicha rachada", "✅ Liso e macio", "🔸 Pedaços macios", "🥣 Pastoso", "💧 Líquido"];

// ── FIBER CALCULATOR LOGIC ──

function calcFiberGoal(sex: string, age: number, weightKg: number, heightCm: number, activity: string, objective: string) {
  let bmr: number;
  if (sex === "masculino") {
    bmr = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age;
  }
  const actFactor = ACTIVITY_LEVELS.find(a => a.value === activity)?.factor || 1.375;
  const tdee = bmr * actFactor;
  let baseFiber = (tdee / 1000) * 14;
  let guidelineFiber: number;
  if (sex === "masculino") {
    guidelineFiber = age <= 50 ? 38 : 30;
  } else {
    guidelineFiber = age <= 50 ? 25 : 21;
  }
  let fiberGoal = Math.max(baseFiber, guidelineFiber);
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

// ── GutON Chat Message Type ──
type GutMsg = { role: "user" | "assistant"; content: string };

// ── COMPONENT ──

const MicrobiomePage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("guton");

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

  // ── Diagnosis State ──
  const [selectedSintomas, setSelectedSintomas] = useState<string[]>([]);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResult, setIaResult] = useState("");
  const [iaScore, setIaScore] = useState<number | null>(null);

  // ── GutON Chat State ──
  const [chatMessages, setChatMessages] = useState<GutMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Symptom Log State ──
  const [symBloating, setSymBloating] = useState(0);
  const [symPain, setSymPain] = useState(0);
  const [symEnergy, setSymEnergy] = useState(5);
  const [symMood, setSymMood] = useState(5);
  const [symBristol, setSymBristol] = useState(4);
  const [symEvacuations, setSymEvacuations] = useState(1);
  const [symNotes, setSymNotes] = useState("");
  const [symSaving, setSymSaving] = useState(false);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

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

  // Load recent symptom logs
  useEffect(() => {
    if (!user) return;
    supabase
      .from("guton_symptom_log" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(7)
      .then(({ data }) => {
        if (data) setRecentLogs(data);
      });
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
    if (selectedSintomas.length === 0) { toast.error("Selecione pelo menos um sintoma"); return; }
    setIaLoading(true);
    setIaResult("");
    setIaScore(score);
    let fullText = "";
    await analisarMicrobioma(
      selectedSintomas, score,
      { sexo: fiberSex, idade: fiberAge, peso: fiberWeight, objetivo: fiberObjective, atividade: fiberActivity, metaFibras: fiberResult?.total },
      (delta) => { fullText += delta; setIaResult(fullText); },
      async () => {
        setIaLoading(false);
        await salvarDiagnosticoMicrobioma({ sintomas: selectedSintomas, score, classificacao, metaFibrasG: fiberResult?.total, analiseIA: fullText, perfilSnapshot: { sexo: fiberSex, idade: fiberAge, peso: fiberWeight, objetivo: fiberObjective } });
        toast.success("Análise salva!");
      },
      (error) => { setIaLoading(false); toast.error(error); }
    );
  }, [selectedSintomas, score, fiberSex, fiberAge, fiberWeight, fiberObjective, fiberActivity, fiberResult, classificacao]);

  // ── GutON Chat ──
  const sendGutMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newMsgs: GutMsg[] = [...chatMessages, { role: "user", content: userMsg }];
    setChatMessages(newMsgs);
    setChatLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guton`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            message: userMsg,
            userProfile: {
              sexo: fiberSex,
              idade: fiberAge,
              peso: fiberWeight,
              objetivo: fiberObjective,
            },
            conversationHistory: chatMessages.slice(-8).map(m => ({ role: m.role, content: m.content })),
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro" }));
        throw new Error(err.error || `Erro ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream não disponível");
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              setChatMessages([...newMsgs, { role: "assistant", content: fullResponse }]);
            }
          } catch { /* partial JSON */ }
        }
      }

      if (fullResponse) {
        setChatMessages([...newMsgs, { role: "assistant", content: fullResponse }]);
        // Save conversation
        if (user) {
          await supabase.from("guton_conversations" as any).insert({
            user_id: user.id,
            message: userMsg,
            response: fullResponse,
            ai_source: res.headers.get("X-GutON-Source") || "gateway",
          });
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao conectar com GutON");
      setChatMessages(newMsgs);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages, fiberSex, fiberAge, fiberWeight, fiberObjective, user]);

  // ── Symptom Log Save ──
  const saveSymptomLog = async () => {
    if (!user) { toast.error("Faça login primeiro"); return; }
    setSymSaving(true);
    const { error } = await supabase.from("guton_symptom_log" as any).insert({
      user_id: user.id,
      bloating: symBloating,
      pain: symPain,
      energy: symEnergy,
      mood: symMood,
      bristol: symBristol,
      evacuations: symEvacuations,
      notes: symNotes || null,
    });
    setSymSaving(false);
    if (error) { toast.error("Erro ao salvar"); return; }
    toast.success("Diário salvo!");
    setSymNotes("");
    // Refresh logs
    const { data } = await supabase
      .from("guton_symptom_log" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(7);
    if (data) setRecentLogs(data);
  };

  return (
    <div className="min-h-screen bg-[#0a0f0a] pb-24">
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/coach/dashboard")} className="p-2 rounded-lg border border-green-900/40 hover:bg-green-900/10">
            <ArrowLeft className="w-4 h-4 text-green-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-green-400 font-mono tracking-tight">GutON 2.0</h1>
            <p className="text-[10px] text-green-600 font-mono">Inteligência intestinal clínica avançada</p>
          </div>
          <Dna className="w-5 h-5 text-green-500" />
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 mb-5 bg-green-950/30 rounded-xl p-1 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-[9px] font-mono transition-all ${
                  active ? "bg-green-500/20 text-green-400 border border-green-500/30" : "text-green-700 hover:text-green-500"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ──── ABA: GUTON CHAT ──── */}
          {activeTab === "guton" && (
            <motion.div key="guton" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {/* Welcome */}
              {chatMessages.length === 0 && (
                <div className="rounded-xl border border-green-500/20 bg-green-950/30 p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Dna className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-400 font-mono">GutON 2.0</p>
                      <p className="text-[9px] text-green-600 font-mono">Dual-AI: Perplexity + Gemini</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-500/80 font-mono leading-relaxed">
                    90% da sua serotonina é produzida no intestino. Sua saciedade, humor, energia e cravings — tudo passa pelo microbioma.
                  </p>
                  <div className="space-y-1.5">
                    {[
                      "Tenho inchaço forte depois de comer",
                      "Qual o melhor probiótico pro meu caso?",
                      "Como curar intestino permeável com alimentos baratos?",
                      "Por que tenho craving de doce à tarde?",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setChatInput(q); }}
                        className="w-full text-left px-3 py-2 rounded-lg border border-green-900/20 text-[10px] text-green-600 font-mono hover:border-green-500/30 hover:text-green-400 transition-all"
                      >
                        → {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-green-500/20 border border-green-500/30 text-green-300"
                        : "bg-green-950/40 border border-green-900/30 text-green-500/80"
                    }`}>
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none prose-headings:text-green-400 prose-headings:font-mono prose-headings:text-xs prose-strong:text-green-400 prose-p:text-[11px] prose-p:leading-relaxed prose-p:font-mono prose-li:text-[11px] prose-li:font-mono">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-[11px] font-mono">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && chatMessages[chatMessages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="bg-green-950/40 border border-green-900/30 rounded-xl px-4 py-3">
                      <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2 items-end">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendGutMessage()}
                  placeholder="Pergunte ao GutON 2.0..."
                  className="flex-1 bg-green-950/40 border border-green-900/30 rounded-xl px-4 py-3 text-xs text-green-300 font-mono placeholder:text-green-800 focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={sendGutMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-3 rounded-xl bg-green-500 text-black disabled:opacity-40 hover:bg-green-400 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ──── ABA: CALCULADORA DE FIBRAS ──── */}
          {activeTab === "fibras" && (
            <motion.div key="fibras" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-xl border border-green-900/30 bg-green-950/20 p-4 space-y-4">
                <h2 className="text-sm font-bold text-green-400 font-mono flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> Calculadora Personalizada de Fibras
                </h2>
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
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Idade", value: fiberAge, set: setFiberAge, suffix: "anos" },
                    { label: "Peso", value: fiberWeight, set: setFiberWeight, suffix: "kg" },
                    { label: "Altura", value: fiberHeight, set: setFiberHeight, suffix: "cm" },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-[10px] text-green-600 font-mono mb-1 block">{f.label}</label>
                      <input type="number" value={f.value} onChange={e => f.set(Number(e.target.value))}
                        className="w-full bg-green-950/40 border border-green-900/30 rounded-lg px-2 py-2 text-sm text-green-300 font-mono text-center focus:outline-none focus:border-green-500" />
                      <span className="text-[9px] text-green-700 font-mono">{f.suffix}</span>
                    </div>
                  ))}
                </div>
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

              {fiberResult && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 text-center">
                    <p className="text-[10px] text-green-600 font-mono mb-1">Sua meta diária de fibras</p>
                    <p className="text-5xl font-bold text-green-400 font-mono">{fiberResult.total}<span className="text-lg">g</span></p>
                    <p className="text-[10px] text-green-700 font-mono mt-1">baseado em ~{fiberResult.tdee} kcal/dia</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-green-900/30 bg-green-950/30 p-3 text-center">
                      <p className="text-[9px] text-green-600 font-mono">Solúvel</p>
                      <p className="text-xl font-bold text-green-400 font-mono">{fiberResult.soluble}g</p>
                    </div>
                    <div className="rounded-xl border border-green-900/30 bg-green-950/30 p-3 text-center">
                      <p className="text-[9px] text-green-600 font-mono">Insolúvel</p>
                      <p className="text-xl font-bold text-green-400 font-mono">{fiberResult.insoluble}g</p>
                    </div>
                    <div className="rounded-xl border border-blue-900/30 bg-blue-950/30 p-3 text-center">
                      <Droplets className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                      <p className="text-[9px] text-blue-500 font-mono">Água extra</p>
                      <p className="text-xl font-bold text-blue-400 font-mono">+{fiberResult.extraWater}<span className="text-xs">ml</span></p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-green-900/30 bg-green-950/20 p-3 flex items-start gap-2">
                    <Leaf className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-green-500/80 font-mono">{fiberResult.tip}</p>
                  </div>
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

          {/* ──── ABA: PROTOCOLO 4R ──── */}
          {activeTab === "protocolo" && (
            <motion.div key="protocolo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <h2 className="text-sm font-bold text-green-400 font-mono flex items-center gap-2">
                <ListChecks className="w-4 h-4" /> Protocolo 4R — Reparo Intestinal
              </h2>
              <p className="text-[10px] text-green-600 font-mono">Remove → Replace → Reinoculate → Repair (12 semanas)</p>

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
                      <div className="text-right mr-2">
                        <p className="text-xs font-bold text-green-400 font-mono">{phase.fiberPercent}%</p>
                        <p className="text-[8px] text-green-700">da meta</p>
                      </div>
                      {isOpen ? <ChevronDown className="w-4 h-4 text-green-500" /> : <ChevronRight className="w-4 h-4 text-green-700" />}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 space-y-3">
                            <div className="h-2 rounded-full bg-green-900/30 overflow-hidden">
                              <motion.div className="h-full bg-green-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${phase.fiberPercent}%` }} transition={{ duration: 0.8 }} />
                            </div>
                            <ol className="space-y-2">
                              {phase.steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="w-5 h-5 rounded-full bg-green-900/30 flex items-center justify-center text-[9px] text-green-500 font-mono shrink-0 mt-0.5">{i + 1}</span>
                                  <p className="text-[11px] text-green-500/80 leading-relaxed">
                                    <ReactMarkdown components={{ strong: ({ children }) => <strong className="text-green-400 font-bold">{children}</strong>, p: ({ children }) => <span>{children}</span> }}>{step}</ReactMarkdown>
                                  </p>
                                </li>
                              ))}
                            </ol>
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

          {/* ──── ABA: DIÁRIO DE SINTOMAS ──── */}
          {activeTab === "sintomas" && (
            <motion.div key="sintomas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <h2 className="text-sm font-bold text-green-400 font-mono flex items-center gap-2">
                <Activity className="w-4 h-4" /> Diário Intestinal
              </h2>

              <div className="rounded-xl border border-green-900/30 bg-green-950/20 p-4 space-y-4">
                {/* Sliders */}
                {[
                  { label: "Inchaço", value: symBloating, set: setSymBloating, max: 10, emoji: symBloating > 6 ? "😣" : symBloating > 3 ? "😐" : "😊" },
                  { label: "Dor abdominal", value: symPain, set: setSymPain, max: 10, emoji: symPain > 6 ? "😖" : symPain > 3 ? "😐" : "😊" },
                  { label: "Energia", value: symEnergy, set: setSymEnergy, max: 10, emoji: symEnergy > 6 ? "⚡" : symEnergy > 3 ? "🔋" : "🪫" },
                  { label: "Humor", value: symMood, set: setSymMood, max: 10, emoji: symMood > 6 ? "😄" : symMood > 3 ? "😐" : "😔" },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between mb-1">
                      <label className="text-[10px] text-green-600 font-mono">{s.label}</label>
                      <span className="text-xs font-mono text-green-400">{s.emoji} {s.value}/10</span>
                    </div>
                    <input type="range" min={0} max={s.max} value={s.value} onChange={e => s.set(Number(e.target.value))}
                      className="w-full h-2 bg-green-900/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500" />
                  </div>
                ))}

                {/* Bristol */}
                <div>
                  <label className="text-[10px] text-green-600 font-mono mb-2 block">Escala de Bristol</label>
                  <div className="grid grid-cols-7 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map(b => (
                      <button key={b} onClick={() => setSymBristol(b)}
                        className={`py-2 rounded-lg text-xs font-mono border transition-all ${
                          symBristol === b
                            ? b >= 3 && b <= 5 ? "border-green-500 bg-green-500/20 text-green-400" : "border-orange-500 bg-orange-500/20 text-orange-400"
                            : "border-green-900/20 text-green-700"
                        }`}>
                        {b}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-green-700 font-mono mt-1 text-center">{BRISTOL_LABELS[symBristol]}</p>
                </div>

                {/* Evacuations */}
                <div>
                  <label className="text-[10px] text-green-600 font-mono mb-1 block">Evacuações hoje</label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setSymEvacuations(n)}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono border transition-all ${symEvacuations === n ? "border-green-500 bg-green-500/10 text-green-400" : "border-green-900/20 text-green-700"}`}>
                        {n === 5 ? "5+" : n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] text-green-600 font-mono mb-1 block">Observações</label>
                  <textarea value={symNotes} onChange={e => setSymNotes(e.target.value)} rows={2}
                    placeholder="Ex: comi feijão ontem, tomei kefir..."
                    className="w-full bg-green-950/40 border border-green-900/30 rounded-lg px-3 py-2 text-xs text-green-300 font-mono placeholder:text-green-800 focus:outline-none focus:border-green-500 resize-none" />
                </div>

                <button onClick={saveSymptomLog} disabled={symSaving}
                  className="w-full py-3 rounded-xl bg-green-500 text-black font-mono text-sm font-bold disabled:opacity-50 hover:bg-green-400 transition-all flex items-center justify-center gap-2">
                  {symSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Salvar Registro
                </button>
              </div>

              {/* Recent logs */}
              {recentLogs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-green-400 font-mono">Últimos 7 dias</h3>
                  {recentLogs.map((log: any, i: number) => (
                    <div key={i} className="rounded-lg border border-green-900/20 bg-green-950/30 p-3 flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-[10px] text-green-600 font-mono">{new Date(log.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
                      </div>
                      <div className="flex-1 flex gap-3">
                        <span className="text-[9px] text-green-700 font-mono">💨 {log.bloating}</span>
                        <span className="text-[9px] text-green-700 font-mono">😣 {log.pain}</span>
                        <span className="text-[9px] text-green-700 font-mono">⚡ {log.energy}</span>
                        <span className="text-[9px] text-green-700 font-mono">😊 {log.mood}</span>
                        <span className="text-[9px] text-green-700 font-mono">Bristol {log.bristol}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ──── ABA: DIAGNÓSTICO ──── */}
          {activeTab === "ia" && (
            <motion.div key="ia" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <h2 className="text-sm font-bold text-green-400 font-mono flex items-center gap-2">
                <Brain className="w-4 h-4" /> Diagnóstico Inteligente do Microbioma
              </h2>
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
              <button onClick={handleIaDiagnosis} disabled={iaLoading || selectedSintomas.length === 0}
                className="w-full py-3 rounded-xl bg-green-500 text-black font-mono text-sm font-bold disabled:opacity-50 hover:bg-green-400 transition-all flex items-center justify-center gap-2">
                {iaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {iaLoading? "Analisando microbioma..." : "Gerar Análise "}
              </button>
              {iaResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-green-500/20 bg-green-950/30 p-4">
                  <div className="prose prose-sm prose-invert max-w-none prose-headings:text-green-400 prose-headings:font-mono prose-headings:text-sm prose-strong:text-green-400 prose-p:text-green-500/80 prose-p:text-[11px] prose-p:leading-relaxed prose-p:font-mono prose-li:text-green-500/80 prose-li:text-[11px] prose-li:font-mono">
                    <ReactMarkdown>{iaResult}</ReactMarkdown>
                  </div>
                  {iaLoading && <span className="inline-block w-2 h-4 bg-green-500 animate-pulse ml-1" />}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ──── ABA: BASE CIENTÍFICA ──── */}
          {activeTab === "ciencia" && (
            <motion.div key="ciencia" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <h2 className="text-sm font-bold text-green-400 font-mono flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Base Científica — Eixo Intestino-Cérebro
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
