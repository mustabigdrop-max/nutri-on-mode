import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Shield, Eye, Heart, Copy, Check, ChevronDown, ChevronUp, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

// ─── Types ───
interface ScanData {
  triggers: string[];
  craving_type: string;
  craving_speed: number;
  frequency: string;
  guilt_level: string;
  diet_history: string;
  comfort_food: string;
  hunger_awareness: string;
  night_eating: string;
  interoception: number[];
  intentions: string[];
}

interface ScanResult {
  perfil: string;
  subtitulo_perfil: string;
  score_interoceptividade: number;
  score_autorregulacao: number;
  score_consciencia_emocional: number;
  descricao_perfil: string;
  mecanismo_neurologico: {
    titulo: string;
    explicacao: string;
    loop_identificado: string;
  };
  gatilho_primario: {
    nome: string;
    pathway: string;
    explicacao: string;
  };
  protocolo_dbt: {
    habilidade_1: { nome: string; base_cientifica: string; como_aplicar: string; quando_usar: string };
    habilidade_2: { nome: string; base_cientifica: string; como_aplicar: string; quando_usar: string };
    habilidade_3: { nome: string; base_cientifica: string; como_aplicar: string; quando_usar: string };
  };
  protocolo_nutricional: {
    substituicoes: Array<{ fissura_original: string; substituto_inteligente: string; por_que_funciona_neurologicamente: string; micronutriente_chave: string }>;
    alimentos_estabilizadores_humor: Array<{ alimento: string; neurotransmissor: string; mecanismo: string }>;
    alimentos_amplificadores_gatilho: Array<{ alimento: string; por_que_evitar: string; substituto: string }>;
    timing_critico: string;
  };
  protocolo_3_passos: {
    titulo: string;
    passo_1: { acao: string; duracao: string; base_cientifica: string };
    passo_2: { acao: string; duracao: string; base_cientifica: string };
    passo_3: { acao: string; duracao: string; base_cientifica: string };
  };
  frase_ancoragem: string;
  micro_habito_semanal: {
    habito: string;
    duracao_diaria: string;
    instrucao: string;
    evidencia: string;
  };
  alerta_cuidado: string | null;
  alerta_comportamental: string;
}

// ─── Constants ───
const TRIGGERS = [
  { id: "ansiedade", emoji: "😰", label: "Ansiedade / Preocupação", desc: "Tensão, coração acelerado, pensamentos intrusivos" },
  { id: "tristeza", emoji: "😢", label: "Tristeza / Solidão", desc: "Vazio, desânimo, vontade de se isolar" },
  { id: "raiva", emoji: "😤", label: "Raiva / Frustração", desc: "Impotência, irritação, injustiça" },
  { id: "tedio", emoji: "😴", label: "Tédio", desc: "Nada a fazer, sensação de vazio sem motivo" },
  { id: "euforia", emoji: "🎉", label: "Euforia / Celebração", desc: "Festas, conquistas, quero me recompensar" },
  { id: "social", emoji: "👥", label: "Pressão Social", desc: "Churrascos, eventos, medo de desagradar" },
  { id: "noturna", emoji: "🌙", label: "Compulsão Noturna", desc: "Sempre depois das 21h, quando todo mundo dorme" },
  { id: "sobrecarga", emoji: "😵", label: "Sobrecarga Mental", desc: "Muito trabalho, decisões demais, cabeça cheia" },
];

const CRAVING_TYPES = [
  "Doce (açúcar, chocolate)",
  "Salgado (chips, fast food)",
  "Gorduroso (frito, queijo)",
  "Ultraprocessado (qualquer industrializado)",
  "Qualquer coisa — só quero encher",
];

const FREQUENCIES = ["Raramente", "1–2x por semana", "3–5x por semana", "Todo dia", "Várias vezes por dia"];

const GUILT_LEVELS = [
  { label: "Nenhuma", emoji: "😌" },
  { label: "Leve", emoji: "🙁" },
  { label: "Moderada", emoji: "😔" },
  { label: "Intensa", emoji: "😣" },
  { label: "Espiral", emoji: "😰" },
];

const INTENTIONS = [
  { id: "entender", emoji: "🔍", label: "Entender de onde vem meu gatilho" },
  { id: "pausar", emoji: "🛡️", label: "Aprender a pausar antes de comer por impulso" },
  { id: "substituir", emoji: "🍽️", label: "Ter substituições inteligentes para momentos críticos" },
  { id: "consciencia", emoji: "🧠", label: "Desenvolver consciência corporal (interoceptividade)" },
  { id: "ciclo", emoji: "💪", label: "Quebrar o ciclo: emoção → impulso → comer → culpa → restrição" },
];

const LOADING_MESSAGES = [
  "Mapeando seus padrões emocionais...",
  "Identificando o modelo de regulação afetiva...",
  "Cruzando gatilhos com padrões de fissura...",
  "Calculando score de interoceptividade...",
  "Aplicando protocolo DBT + Nutrição Comportamental...",
  "Gerando seu diagnóstico emocional alimentar...",
];

const INTEROCEPTION_LABELS = [
  "Consigo identificar quando estou com fome de verdade",
  "Consigo parar de comer quando estou satisfeito",
  "Percebo quando como por emoção e não por fome",
  "Consigo nomear a emoção que antecede o impulso de comer",
];

const PROFILE_COLORS: Record<string, string> = {
  "Comedor Emocional Reativo": "#ff6b35",
  "Comedor Noturno Compensatório": "#7c3aed",
  "Comedor Social Condicionado": "#0097ff",
  "Comedor por Tédio Existencial": "#64748b",
  "Comedor Perfeccionista": "#ef4444",
  "Comedor de Alta Consciência": "#00e5a0",
};

// ─── Component ───
export default function EmotionalScanPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0-4 = blocks, 5 = loading, 6 = result
  const [data, setData] = useState<ScanData>({
    triggers: [],
    craving_type: "",
    craving_speed: 5,
    frequency: "",
    guilt_level: "",
    diet_history: "",
    comfort_food: "",
    hunger_awareness: "",
    night_eating: "",
    interoception: [5, 5, 5, 5],
    intentions: [],
  });
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [expandedDbt, setExpandedDbt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // ─── Step validation ───
  const canProceed = () => {
    switch (step) {
      case 0: return data.triggers.length > 0;
      case 1: return data.craving_type && data.frequency && data.guilt_level;
      case 2: return data.diet_history && data.comfort_food && data.hunger_awareness && data.night_eating;
      case 3: return true;
      case 4: return data.intentions.length > 0;
      default: return false;
    }
  };

  // ─── Loading animation ───
  useEffect(() => {
    if (step !== 5) return;
    const interval = setInterval(() => {
      setLoadingIdx(prev => {
        if (prev >= LOADING_MESSAGES.length - 1) {
          clearInterval(interval);
          callAI();
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [step]);

  const callAI = async () => {
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("emotional-scan", {
        body: {
          scanData: data,
          userId: user?.id,
          userProfile: profile ? {
            goal: profile.goal || profile.objetivo_principal,
            vet_kcal: profile.vet_kcal,
            protein_g: profile.protein_g,
            weight_kg: profile.weight_kg,
            sport: profile.sport,
            training_frequency: profile.training_frequency,
          } : null,
        },
      });
      if (fnError) throw fnError;
      if (fnData?.error) throw new Error(fnData.error);
      setResult(fnData);
      setStep(6);
    } catch (e: any) {
      console.error("Scan AI error:", e);
      setError("Não foi possível gerar sua análise. Tente novamente.");
      setStep(6);
    }
  };

  const handleNext = () => {
    if (step === 4) {
      setStep(5);
      setLoadingIdx(0);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleCopy = () => {
    if (result?.frase_ancoragem) {
      navigator.clipboard.writeText(result.frase_ancoragem);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setStep(0);
    setResult(null);
    setError(null);
    setData({ triggers: [], craving_type: "", craving_speed: 5, frequency: "", guilt_level: "", diet_history: "", comfort_food: "", hunger_awareness: "", night_eating: "", interoception: [5, 5, 5, 5], intentions: [] });
  };

  const speedLabel = data.craving_speed <= 3 ? "Alta autorregulação" : data.craving_speed <= 6 ? "Regulação moderada" : "Impulsividade alimentar";
  const speedColor = data.craving_speed <= 3 ? "#00e5a0" : data.craving_speed <= 6 ? "#f59e0b" : "#ef4444";

  // ─── Render blocks ───
  const renderBlock = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>O que acende seu gatilho?</h2>
          <p className="text-sm text-gray-400" style={{ fontFamily: "DM Sans, sans-serif" }}>Selecione todas as situações que te fazem comer fora do planejado</p>
          <div className="grid grid-cols-2 gap-3">
            {TRIGGERS.map(t => {
              const sel = data.triggers.includes(t.id);
              return (
                <motion.button key={t.id} whileTap={{ scale: 0.97 }}
                  onClick={() => setData(d => ({ ...d, triggers: sel ? d.triggers.filter(x => x !== t.id) : [...d.triggers, t.id] }))}
                  className={`p-3 rounded-xl border text-left transition-all ${sel ? "border-[#00e5a0]/60 bg-[#00e5a0]/10" : "border-white/10 bg-[#0e1318]"}`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <p className="text-xs font-semibold text-white mt-1" style={{ fontFamily: "Syne, sans-serif" }}>{t.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5" style={{ fontFamily: "DM Sans, sans-serif" }}>{t.desc}</p>
                </motion.button>
              );
            })}
          </div>
        </div>
      );

      case 1: return (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>Seu padrão quando a emoção chega</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block" style={{ fontFamily: "DM Sans, sans-serif" }}>O que seu corpo pede nesse momento?</label>
              <div className="space-y-2">
                {CRAVING_TYPES.map(ct => (
                  <button key={ct} onClick={() => setData(d => ({ ...d, craving_type: ct }))}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${data.craving_type === ct ? "bg-[#00e5a0]/15 border border-[#00e5a0]/40 text-white" : "bg-[#0e1318] border border-white/5 text-gray-300"}`}
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  >{ct}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block" style={{ fontFamily: "DM Sans, sans-serif" }}>Velocidade da fissura</label>
              <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                <span>Consigo pausar</span><span>Como antes de pensar</span>
              </div>
              <input type="range" min={1} max={10} value={data.craving_speed}
                onChange={e => setData(d => ({ ...d, craving_speed: +e.target.value }))}
                className="w-full accent-[#00e5a0]" />
              <p className="text-center text-xs mt-1 font-semibold" style={{ color: speedColor }}>{data.craving_speed}/10 — {speedLabel}</p>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block" style={{ fontFamily: "DM Sans, sans-serif" }}>Frequência semanal</label>
              <div className="flex flex-wrap gap-2">
                {FREQUENCIES.map(f => (
                  <button key={f} onClick={() => setData(d => ({ ...d, frequency: f }))}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${data.frequency === f ? "bg-[#00e5a0]/20 border border-[#00e5a0]/40 text-white" : "bg-[#0e1318] border border-white/5 text-gray-400"}`}
                  >{f}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block" style={{ fontFamily: "DM Sans, sans-serif" }}>Culpa após o episódio</label>
              <div className="flex gap-2 flex-wrap">
                {GUILT_LEVELS.map(g => (
                  <button key={g.label} onClick={() => setData(d => ({ ...d, guilt_level: g.label }))}
                    className={`flex flex-col items-center px-3 py-2 rounded-lg text-xs transition-all ${data.guilt_level === g.label ? "bg-[#00e5a0]/15 border border-[#00e5a0]/40" : "bg-[#0e1318] border border-white/5"}`}
                  >
                    <span className="text-lg">{g.emoji}</span>
                    <span className="text-gray-300 mt-0.5">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

      case 2: return (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>Sua história com a comida</h2>
          {[
            { key: "diet_history", q: "Já fez dietas restritivas e abandonou antes de 30 dias?", opts: ["Sim, várias vezes", "Sim, algumas", "Nunca tentei"] },
            { key: "comfort_food", q: "Se identifica com usar comida como conforto ou recompensa?", opts: ["Sim, claramente", "Às vezes", "Raramente", "Não"] },
            { key: "hunger_awareness", q: "Consegue identificar fome física vs fome emocional?", opts: ["Sempre", "Às vezes", "Raramente", "Nunca", "Não sei a diferença"] },
            { key: "night_eating", q: "Já acordou no meio da noite para comer?", opts: ["Sim, frequentemente", "Já aconteceu", "Nunca"] },
          ].map(({ key, q, opts }) => (
            <div key={key}>
              <p className="text-sm text-gray-300 mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>{q}</p>
              <div className="flex flex-wrap gap-2">
                {opts.map(o => (
                  <button key={o} onClick={() => setData(d => ({ ...d, [key]: o }))}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${(data as any)[key] === o ? "bg-[#00e5a0]/15 border border-[#00e5a0]/40 text-white" : "bg-[#0e1318] border border-white/5 text-gray-400"}`}
                  >{o}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

      case 3: return (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>Você consegue ouvir seu corpo?</h2>
          <p className="text-xs text-gray-500" style={{ fontFamily: "DM Sans, sans-serif" }}>Responda com honestidade — não existe resposta errada</p>
          {INTEROCEPTION_LABELS.map((label, i) => (
            <div key={i}>
              <p className="text-sm text-gray-300 mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>{label}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600 w-12">Nunca</span>
                <input type="range" min={1} max={10} value={data.interoception[i]}
                  onChange={e => {
                    const nv = [...data.interoception];
                    nv[i] = +e.target.value;
                    setData(d => ({ ...d, interoception: nv }));
                  }}
                  className="flex-1 accent-[#00e5a0]" />
                <span className="text-[10px] text-gray-600 w-12 text-right">Sempre</span>
                <span className="text-xs font-mono text-[#00e5a0] w-6 text-center">{data.interoception[i]}</span>
              </div>
            </div>
          ))}
        </div>
      );

      case 4: return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>O que você quer mudar agora?</h2>
          <p className="text-xs text-gray-500" style={{ fontFamily: "DM Sans, sans-serif" }}>Selecione pelo menos 1</p>
          <div className="space-y-3">
            {INTENTIONS.map(it => {
              const sel = data.intentions.includes(it.id);
              return (
                <motion.button key={it.id} whileTap={{ scale: 0.98 }}
                  onClick={() => setData(d => ({ ...d, intentions: sel ? d.intentions.filter(x => x !== it.id) : [...d.intentions, it.id] }))}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${sel ? "border-[#00e5a0]/50 bg-[#00e5a0]/10" : "border-white/10 bg-[#0e1318]"}`}
                >
                  <span className="text-xl">{it.emoji}</span>
                  <span className="text-sm text-gray-200" style={{ fontFamily: "DM Sans, sans-serif" }}>{it.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      );

      default: return null;
    }
  };

  // ─── Loading screen ───
  if (step === 5) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#080b10" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-[#00e5a0]/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-[#00e5a0]/40 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-[#00e5a0]/10 flex items-center justify-center">
              <Brain className="w-8 h-8 text-[#00e5a0]" />
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={loadingIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="text-sm text-gray-300 text-center" style={{ fontFamily: "DM Sans, sans-serif" }}
            >{LOADING_MESSAGES[loadingIdx]}</motion.p>
          </AnimatePresence>
          <div className="flex gap-1.5">
            {LOADING_MESSAGES.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= loadingIdx ? "bg-[#00e5a0]" : "bg-white/10"}`} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Result screen ───
  if (step === 6) {
    if (error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4" style={{ background: "#080b10" }}>
          <p className="text-red-400 text-sm text-center">{error}</p>
          <button onClick={handleReset} className="px-6 py-2 rounded-lg bg-[#00e5a0] text-black font-semibold text-sm">Tentar novamente</button>
        </div>
      );
    }

    if (!result) return null;

    const profileColor = PROFILE_COLORS[result.perfil] || "#00e5a0";
    const scores = [
      { label: "Interoceptividade", value: result.score_interoceptividade, icon: Eye },
      { label: "Autorregulação", value: result.score_autorregulacao, icon: Shield },
      { label: "Consciência Emocional", value: result.score_consciencia_emocional, icon: Heart },
    ];
    const dbtSkills = [result.protocolo_dbt.habilidade_1, result.protocolo_dbt.habilidade_2, result.protocolo_dbt.habilidade_3];
    const steps3 = [result.protocolo_3_passos.passo_1, result.protocolo_3_passos.passo_2, result.protocolo_3_passos.passo_3];

    return (
      <div ref={resultRef} className="min-h-screen pb-24" style={{ background: "#080b10" }}>
        <div className="max-w-lg mx-auto px-4 pt-4">
          {/* Header */}
          <button onClick={() => navigate("/coach/dashboard")} className="text-gray-500 mb-4"><ArrowLeft className="w-5 h-5" /></button>

          {/* Profile badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-2" style={{ background: `${profileColor}20`, color: profileColor, border: `1px solid ${profileColor}40`, fontFamily: "Syne, sans-serif" }}>{result.perfil}</span>
            <p className="text-gray-300 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>{result.subtitulo_perfil}</p>
          </motion.div>

          {/* Scores */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-3 gap-3 mb-6">
            {scores.map((s, i) => (
              <div key={i} className="flex flex-col items-center p-3 rounded-xl bg-[#0e1318] border border-white/5">
                <div className="relative w-14 h-14 mb-2">
                  <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1a1f27" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke={profileColor} strokeWidth="3"
                      strokeDasharray={`${s.value * 0.974} 97.4`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{s.value}</span>
                </div>
                <span className="text-[10px] text-gray-500 text-center leading-tight" style={{ fontFamily: "DM Sans, sans-serif" }}>{s.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Description */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="text-sm text-gray-300 mb-6 leading-relaxed" style={{ fontFamily: "DM Sans, sans-serif" }}
          >{result.descricao_perfil}</motion.p>

          {/* Card 1 — Neurological */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-[#141a22] border border-white/5 mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-[#0097ff]" />
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>{result.mecanismo_neurologico.titulo}</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>{result.mecanismo_neurologico.explicacao}</p>
            <div className="px-3 py-2 rounded-lg bg-[#0097ff]/10 border border-[#0097ff]/20">
              <p className="text-[10px] text-[#0097ff] font-mono text-center">{result.mecanismo_neurologico.loop_identificado}</p>
            </div>
          </motion.div>

          {/* Card 2 — DBT */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="p-4 rounded-xl bg-[#141a22] border border-white/5 mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-[#00e5a0]" />
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>Protocolo DBT</h3>
            </div>
            {dbtSkills.map((sk, i) => (
              <div key={i} className="mb-2">
                <button onClick={() => setExpandedDbt(expandedDbt === i ? null : i)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-[#0e1318] border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white" style={{ fontFamily: "Syne, sans-serif" }}>{sk.nome}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00e5a0]/10 text-[#00e5a0]">{sk.base_cientifica}</span>
                  </div>
                  {expandedDbt === i ? <ChevronUp className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
                </button>
                <AnimatePresence>
                  {expandedDbt === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 py-2 text-xs text-gray-400 space-y-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
                        <p><span className="text-gray-300 font-semibold">Como aplicar:</span> {sk.como_aplicar}</p>
                        <p><span className="text-gray-300 font-semibold">Quando usar:</span> {sk.quando_usar}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>

          {/* Card 3 — Substitutions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="p-4 rounded-xl bg-[#141a22] border border-white/5 mb-4"
          >
            <h3 className="text-sm font-bold text-white mb-3" style={{ fontFamily: "Syne, sans-serif" }}>Substituições Inteligentes</h3>
            <div className="space-y-3">
              {result.protocolo_nutricional.substituicoes?.map((sub, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <p className="text-[10px] text-red-400 mb-0.5">Fissura</p>
                    <p className="text-xs text-gray-300">{sub.fissura_original}</p>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-[#00e5a0]/5 border border-[#00e5a0]/10">
                    <p className="text-[10px] text-[#00e5a0] mb-0.5">Substituto</p>
                    <p className="text-xs text-gray-300">{sub.substituto_inteligente}</p>
                  </div>
                  <p className="col-span-2 text-[10px] text-gray-500 px-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    🧬 {sub.micronutriente_chave} — {sub.por_que_funciona_neurologicamente}
                  </p>
                </div>
              ))}
            </div>
            {result.protocolo_nutricional.timing_critico && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-[#ff6b35]/5 border border-[#ff6b35]/10">
                <p className="text-[10px] text-[#ff6b35] font-semibold mb-0.5">⏰ Timing Crítico</p>
                <p className="text-xs text-gray-400">{result.protocolo_nutricional.timing_critico}</p>
              </div>
            )}
          </motion.div>

          {/* Card 4 — 3-Step Protocol */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="p-4 rounded-xl bg-[#141a22] border border-white/5 mb-6"
          >
            <h3 className="text-sm font-bold text-white mb-3" style={{ fontFamily: "Syne, sans-serif" }}>{result.protocolo_3_passos.titulo}</h3>
            <div className="space-y-3">
              {steps3.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00e5a0]/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#00e5a0]">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-xs text-white font-semibold">{s.acao}</p>
                    <p className="text-[10px] text-gray-500">{s.duracao} · {s.base_cientifica}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Anchor Phrase */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}
            className="py-10 text-center mb-6"
          >
            <p className="text-xl text-white leading-relaxed mb-4" style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "0.02em" }}>
              "{result.frase_ancoragem}"
            </p>
            <p className="text-[10px] text-gray-600 mb-3">Salva essa frase. Ela é sua.</p>
            <button onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white transition-colors"
            >
              {copied ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar frase</>}
            </button>
          </motion.div>

          {/* Micro-habit */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="p-4 rounded-xl bg-[#141a22] border border-[#00e5a0]/20 mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#00e5a0]" />
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>Micro-Hábito da Semana</h3>
            </div>
            <p className="text-xs text-white font-semibold mb-1">{result.micro_habito_semanal.habito}</p>
            <p className="text-xs text-gray-400 mb-1">⏱ {result.micro_habito_semanal.duracao_diaria} · {result.micro_habito_semanal.instrucao}</p>
            <p className="text-[10px] text-gray-600 italic">{result.micro_habito_semanal.evidencia}</p>
          </motion.div>

          {/* Alert */}
          {result.alerta_cuidado && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-300">Atenção gentil</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed" style={{ fontFamily: "DM Sans, sans-serif" }}>{result.alerta_cuidado}</p>
              <p className="text-[10px] text-amber-400/60 mt-2">Buscar suporte é força, não fraqueza.</p>
            </motion.div>
          )}

          {/* Footer */}
          <div className="text-center py-6 space-y-3">
            <p className="text-xs text-gray-500" style={{ fontFamily: "DM Sans, sans-serif" }}>{result.alerta_comportamental}</p>
            <p className="text-xs text-gray-600">⚡ nutriON · O comportamento vem antes do alimento.</p>
            <button onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0e1318] border border-white/10 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Refazer Scan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form flow ───
  return (
    <div className="min-h-screen pb-24" style={{ background: "#080b10" }}>
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => step === 0 ? navigate("/coach/dashboard") : setStep(s => s - 1)} className="text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <p className="text-xs text-gray-600 font-mono">{step + 1}/5</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-6">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-[#00e5a0]" : "bg-white/10"}`} />
          ))}
        </div>

        {/* Block content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
            {renderBlock()}
          </motion.div>
        </AnimatePresence>

        {/* Next button */}
        <div className="fixed bottom-20 left-0 right-0 px-4 max-w-lg mx-auto">
          <button onClick={handleNext} disabled={!canProceed()}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${canProceed() ? "bg-[#00e5a0] text-black" : "bg-white/5 text-gray-600 cursor-not-allowed"}`}
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {step === 4 ? "Gerar Diagnóstico" : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
}
