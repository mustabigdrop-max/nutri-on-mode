import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, X, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EMOTIONS = [
  { key: "ansiedade", emoji: "😰", label: "Ansiedade", color: "bg-blue-500/20 border-blue-500/40 text-blue-300" },
  { key: "estresse", emoji: "😤", label: "Estresse", color: "bg-orange-500/20 border-orange-500/40 text-orange-300" },
  { key: "tedio", emoji: "😴", label: "Tédio", color: "bg-zinc-500/20 border-zinc-500/40 text-zinc-300" },
  { key: "tristeza", emoji: "😢", label: "Tristeza", color: "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" },
  { key: "solidao", emoji: "😔", label: "Solidão", color: "bg-violet-500/20 border-violet-500/40 text-violet-300" },
  { key: "culpa", emoji: "😞", label: "Culpa", color: "bg-red-800/20 border-red-800/40 text-red-300" },
  { key: "comemoracao", emoji: "🥳", label: "Comemoração", color: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300" },
  { key: "cansaco", emoji: "😓", label: "Cansaço", color: "bg-amber-700/20 border-amber-700/40 text-amber-300" },
];

interface TechniqueConfig {
  title: string;
  steps: string[];
  totalSec: number;
  type: "breathing" | "timer" | "journal" | "script" | "guide";
}

const TECHNIQUES: Record<string, TechniqueConfig> = {
  ansiedade: { title: "Respiração 4-7-8", steps: ["Inspire por 4 segundos", "Segure por 7 segundos", "Expire por 8 segundos"], totalSec: 114, type: "breathing" },
  estresse: { title: "Respiração 4-7-8", steps: ["Inspire por 4 segundos", "Segure por 7 segundos", "Expire por 8 segundos"], totalSec: 114, type: "breathing" },
  tedio: { title: "Surfing the Urge", steps: ["Observe a vontade sem agir", "Note onde ela aparece no corpo", "Perceba que ela vai diminuir sozinha"], totalSec: 300, type: "timer" },
  tristeza: { title: "Journaling Guiado", steps: ["O que estou sentindo agora, exatamente?", "O que essa comida realmente resolveria?", "O que eu preciso de verdade neste momento?"], totalSec: 180, type: "journal" },
  solidao: { title: "Journaling Guiado", steps: ["O que estou sentindo agora, exatamente?", "O que essa comida realmente resolveria?", "O que eu preciso de verdade neste momento?"], totalSec: 180, type: "journal" },
  culpa: { title: "Auto-compaixão", steps: ["\"Estou fazendo o melhor que posso com o que sei agora.\"", "\"Errar é humano. Culpa não resolve, aprendizado sim.\"", "\"Eu mereço gentileza, especialmente de mim mesmo.\""], totalSec: 120, type: "script" },
  cansaco: { title: "Pausa + Hidratação", steps: ["Tome 500ml de água agora", "Deite por 5 minutos", "Depois decida se ainda quer comer"], totalSec: 300, type: "timer" },
  comemoracao: { title: "Regra 80/20", steps: ["Escolha conscientemente o que comer", "Defina a porção ANTES de servir", "Saboreie cada garfada — sem pressa"], totalSec: 120, type: "guide" },
};

export default function SosHungerInterceptor() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [hungerType, setHungerType] = useState<string>("");
  const [emotion, setEmotion] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [situation, setSituation] = useState("");
  const [timerSec, setTimerSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [techniqueCompleted, setTechniqueCompleted] = useState(false);
  const [postIntensity, setPostIntensity] = useState(5);
  const [result, setResult] = useState<"resisted" | "conscious" | "lost" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const startTimeRef = useRef(0);

  const technique = emotion ? TECHNIQUES[emotion] : null;
  const totalSec = technique?.totalSec || 120;

  useEffect(() => {
    if (timerRunning && timerSec < totalSec) {
      timerRef.current = setInterval(() => {
        setTimerSec(prev => {
          if (prev + 1 >= totalSec) {
            setTimerRunning(false);
            setTechniqueCompleted(true);
            clearInterval(timerRef.current);
            return totalSec;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [timerRunning, totalSec]);

  function reset() {
    setStep(0);
    setHungerType("");
    setEmotion("");
    setIntensity(5);
    setSituation("");
    setTimerSec(0);
    setTimerRunning(false);
    setTechniqueCompleted(false);
    setPostIntensity(5);
    setResult(null);
    setShowConfetti(false);
    startTimeRef.current = 0;
  }

  function handleOpen() {
    reset();
    setOpen(true);
  }

  function handleTriage(type: string) {
    setHungerType(type);
    if (type === "physical") {
      toast.success("Fome real! Vai comer. Registre depois. 💪");
      saveEpisode({ hunger_type: "physical", resisted: false });
      setOpen(false);
    } else if (type === "habitual") {
      toast("Dica: antes de comer por hábito, beba água e espere 10 min.", { icon: "🕐" });
      saveEpisode({ hunger_type: "habitual", resisted: false });
      setOpen(false);
    } else {
      setStep(1);
    }
  }

  function handleEmotionSelect(e: string) {
    setEmotion(e);
  }

  function startTechnique() {
    setStep(2);
    setTimerSec(0);
    setTimerRunning(true);
    startTimeRef.current = Date.now();
  }

  function skipTechnique() {
    setTimerRunning(false);
    setTechniqueCompleted(false);
    setStep(3);
  }

  function finishTechnique() {
    setTimerRunning(false);
    setTechniqueCompleted(true);
    setStep(3);
  }

  async function handleResult(r: "resisted" | "conscious" | "lost") {
    setResult(r);
    const resisted = r === "resisted";
    const ateAnyway = r !== "resisted";
    
    if (resisted) {
      setShowConfetti(true);
    }

    await saveEpisode({
      hunger_type: "emotional",
      emotion,
      emotion_intensity: intensity,
      situation: situation || null,
      technique_used: technique?.title || null,
      technique_duration_sec: Math.round((Date.now() - startTimeRef.current) / 1000),
      technique_completed: techniqueCompleted,
      resisted,
      ate_anyway: ateAnyway,
      post_emotion_intensity: postIntensity,
    });

    if (resisted) {
      toast.success("+20 XP! Você resistiu 💪");
      try {
        await supabase.from("profiles").update({
          xp: (await supabase.from("profiles").select("xp").eq("user_id", user!.id).single()).data?.xp + 20 || 20,
        }).eq("user_id", user!.id);
      } catch {}
    } else if (r === "lost") {
      toast("Sem julgamento. Amanhã é um novo dia. 🤝", { icon: "💜" });
    }
  }

  async function saveEpisode(data: Record<string, any>) {
    if (!user) return;
    try {
      await supabase.from("emotional_episodes").insert({ user_id: user.id, ...data } as any);
    } catch (e) {
      console.error("Failed to save episode", e);
    }
  }

  // Timer circle
  const timerPercent = totalSec > 0 ? (timerSec / totalSec) * 100 : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const timerOffset = circumference - (timerPercent / 100) * circumference;

  // Breathing step
  const breathCycle = 19; // 4+7+8
  const breathPhase = timerSec % breathCycle;
  const breathLabel = breathPhase < 4 ? "INSPIRE" : breathPhase < 11 ? "SEGURE" : "EXPIRE";
  const breathCount = breathPhase < 4 ? 4 - breathPhase : breathPhase < 11 ? 11 - breathPhase : 19 - breathPhase;

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 z-40 flex flex-col items-center gap-1"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[9px] font-mono text-red-400/80 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur">
          Sinto urgência
        </span>
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
          <HeartPulse className="w-6 h-6 text-white" />
        </div>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col overflow-y-auto"
          >
            {/* Close */}
            <div className="flex justify-end p-4">
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>

            <div className="flex-1 px-6 pb-8">
              <AnimatePresence mode="wait">
                {/* STEP 0 — Triage */}
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-6">
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-bold font-mono text-white">Pausa.</p>
                      <p className="text-sm text-white/50 font-mono">Antes de comer.</p>
                    </div>
                    <p className="text-sm font-mono text-white/60 text-center">Onde você sente a fome?</p>
                    <div className="space-y-3">
                      <button onClick={() => handleTriage("physical")} className="w-full p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-left hover:bg-white/[0.06] transition-colors">
                        <span className="text-lg mr-2">🫃</span>
                        <span className="text-sm font-mono text-white/80">No estômago (growling, vazio físico)</span>
                      </button>
                      <button onClick={() => handleTriage("emotional")} className="w-full p-4 rounded-2xl border border-red-500/20 bg-red-500/[0.05] text-left hover:bg-red-500/[0.08] transition-colors">
                        <span className="text-lg mr-2">💭</span>
                        <span className="text-sm font-mono text-white/80">Na cabeça / no peito (ansiedade, tédio, vontade)</span>
                      </button>
                      <button onClick={() => handleTriage("habitual")} className="w-full p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-left hover:bg-white/[0.06] transition-colors">
                        <span className="text-lg mr-2">🕐</span>
                        <span className="text-sm font-mono text-white/80">É hora de comer (hábito)</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 1 — Emotion selection */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-5">
                    <div className="text-center space-y-1">
                      <p className="text-lg font-bold font-mono text-white">O que está acontecendo agora?</p>
                      <p className="text-xs text-white/40 font-mono">Identifique a emoção principal</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {EMOTIONS.map(e => (
                        <button
                          key={e.key}
                          onClick={() => handleEmotionSelect(e.key)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            emotion === e.key ? e.color + " ring-1 ring-white/20" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                          }`}
                        >
                          <span className="text-lg">{e.emoji}</span>
                          <p className="text-xs font-mono text-white/70 mt-1">{e.label}</p>
                        </button>
                      ))}
                    </div>

                    {emotion && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div>
                          <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Intensidade: {intensity}/10</label>
                          <input type="range" min={1} max={10} value={intensity} onChange={e => setIntensity(+e.target.value)} className="w-full mt-2 accent-red-500" />
                        </div>
                        <input
                          type="text"
                          placeholder="O que aconteceu? (opcional)"
                          value={situation}
                          onChange={e => setSituation(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                        />
                        <button onClick={startTechnique} className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold font-mono flex items-center justify-center gap-2">
                          Iniciar Técnica <ChevronRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* STEP 2 — Technique */}
                {step === 2 && technique && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-6 flex flex-col items-center">
                    <p className="text-lg font-bold font-mono text-white text-center">{technique.title}</p>

                    {/* Timer circle */}
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
                        <motion.circle
                          cx="70" cy="70" r={radius} fill="none"
                          stroke="url(#sosGrad)"
                          strokeWidth={8} strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={timerOffset}
                        />
                        <defs>
                          <linearGradient id="sosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {technique.type === "breathing" ? (
                          <>
                            <motion.p
                              key={breathLabel}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-xs font-mono text-red-400 uppercase tracking-widest"
                            >
                              {breathLabel}
                            </motion.p>
                            <p className="text-3xl font-bold font-mono text-white">{breathCount}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-3xl font-bold font-mono text-white">
                              {Math.floor((totalSec - timerSec) / 60)}:{String((totalSec - timerSec) % 60).padStart(2, "0")}
                            </p>
                            <p className="text-[10px] font-mono text-white/40">restantes</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="w-full space-y-2">
                      {technique.steps.map((s, i) => {
                        const stepProgress = technique.type === "breathing"
                          ? Math.floor(timerSec / breathCycle) >= i
                          : timerSec > (totalSec / technique.steps.length) * i;
                        return (
                          <div key={i} className={`p-3 rounded-xl border font-mono text-xs transition-all ${
                            stepProgress ? "border-red-500/30 bg-red-500/10 text-white/80" : "border-white/10 bg-white/[0.02] text-white/30"
                          }`}>
                            {technique.type === "journal" || technique.type === "script" ? `"${s}"` : s}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-3 w-full">
                      <button onClick={skipTechnique} className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 font-mono text-sm hover:bg-white/5">
                        Pular
                      </button>
                      <button onClick={finishTechnique} className="flex-1 py-3 rounded-xl bg-white/10 text-white font-mono text-sm font-bold hover:bg-white/15">
                        Terminei
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 — Result */}
                {step === 3 && !result && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-6">
                    <p className="text-lg font-bold font-mono text-white text-center">Como você está agora?</p>
                    <div>
                      <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Intensidade emocional: {postIntensity}/10</label>
                      <input type="range" min={1} max={10} value={postIntensity} onChange={e => setPostIntensity(+e.target.value)} className="w-full mt-2 accent-red-500" />
                    </div>
                    <p className="text-sm font-mono text-white/60 text-center">Vai comer mesmo assim?</p>
                    <div className="space-y-3">
                      <button onClick={() => handleResult("resisted")} className="w-full p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 font-mono text-sm text-emerald-300 hover:bg-emerald-500/15 transition-colors">
                        💪 Não! Consegui resistir
                      </button>
                      <button onClick={() => handleResult("conscious")} className="w-full p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 font-mono text-sm text-amber-300 hover:bg-amber-500/15 transition-colors">
                        🍽️ Sim, mas de forma consciente
                      </button>
                      <button onClick={() => handleResult("lost")} className="w-full p-4 rounded-2xl border border-white/10 bg-white/[0.03] font-mono text-sm text-white/50 hover:bg-white/[0.06] transition-colors">
                        😔 Sim, perdi o controle
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Result feedback */}
                {step === 3 && result && (
                  <motion.div key="s3r" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-6 min-h-[50vh]">
                    {result === "resisted" && (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="text-6xl"
                        >
                          💪
                        </motion.div>
                        <p className="text-xl font-bold font-mono text-emerald-400">Você resistiu!</p>
                        <p className="text-sm font-mono text-emerald-300/60">+20 XP conquistados</p>
                        {showConfetti && (
                          <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {Array.from({ length: 30 }).map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                  background: ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"][i % 5],
                                  left: `${Math.random() * 100}%`,
                                  top: "-5%",
                                }}
                                animate={{ y: "110vh", rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
                                transition={{ duration: 1.5 + Math.random() * 2, delay: Math.random() * 0.5 }}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {result === "conscious" && (
                      <>
                        <p className="text-4xl">🍽️</p>
                        <p className="text-lg font-bold font-mono text-amber-400">Escolha consciente</p>
                        <p className="text-xs font-mono text-white/40 text-center">Comer conscientemente já é uma vitória. Registre no log de refeições.</p>
                      </>
                    )}
                    {result === "lost" && (
                      <>
                        <p className="text-4xl">💜</p>
                        <p className="text-lg font-bold font-mono text-white/70">Sem julgamento</p>
                        <p className="text-xs font-mono text-white/40 text-center max-w-xs">
                          "O que você faz depois de um tropeço importa mais do que o tropeço em si. Amanhã é uma nova oportunidade."
                        </p>
                      </>
                    )}
                    <button onClick={() => setOpen(false)} className="mt-4 px-8 py-3 rounded-xl bg-white/10 text-white font-mono text-sm hover:bg-white/15">
                      Fechar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
