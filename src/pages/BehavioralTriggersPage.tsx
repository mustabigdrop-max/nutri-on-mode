import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Brain, Heart, Zap, AlertTriangle, X, TrendingUp, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

interface TriggerEntry {
  id: string;
  date: string;
  time: string;
  situation: string;
  emotion: string;
  thought: string;
  behavior: string;
  intensity: number;
  category: string;
}

const EMOTIONS = [
  { id: "ansiedade", label: "Ansiedade", emoji: "😰", color: "#e8a020" },
  { id: "estresse", label: "Estresse", emoji: "😤", color: "hsl(var(--destructive))" },
  { id: "tedio", label: "Tédio", emoji: "😑", color: "#888" },
  { id: "tristeza", label: "Tristeza", emoji: "😔", color: "#7890ff" },
  { id: "solidao", label: "Solidão", emoji: "🥺", color: "#7890ff" },
  { id: "culpa", label: "Culpa", emoji: "😞", color: "#888" },
  { id: "comemoracao", label: "Comemoração", emoji: "🎉", color: "#00f0b4" },
  { id: "cansaco", label: "Cansaço", emoji: "😴", color: "#e8a020" },
];

const BEHAVIORS = [
  { id: "compulsao", label: "Compulsão", desc: "Comer muito rápido e sem controle" },
  { id: "beliscar", label: "Beliscar", desc: "Comer pequenas quantidades o tempo todo" },
  { id: "fora_plano", label: "Fora do plano", desc: "Comer alimento fora da dieta" },
  { id: "pular_refeicao", label: "Pular refeição", desc: "Não comer quando devia" },
  { id: "comer_noite", label: "Comer à noite", desc: "Comer após as 22h" },
  { id: "overcomer", label: "Overcomer", desc: "Exagerar em quantidade" },
];

const CBT_INTERVENTIONS: Record<string, { technique: string; instruction: string }[]> = {
  ansiedade: [
    { technique: "Respiração 4-7-8", instruction: "Inspire 4s, segure 7s, expire 8s. Repita 3x antes de comer." },
    { technique: "Surfing the urge", instruction: "Observe a vontade sem agir. Ela vai e vem como uma onda — dura no máximo 20min." },
  ],
  estresse: [
    { technique: "Escada cognitiva", instruction: "Pergunte: 'O que de pior pode acontecer? É realmente tão ruim?' Desce o nível de ameaça percebida." },
    { technique: "Movimento antes da comida", instruction: "10 minutos de caminhada antes de decidir comer. O estresse reduz e a decisão muda." },
  ],
  tedio: [
    { technique: "Lista de substitutos", instruction: "Liste 5 atividades de 5 minutos para fazer quando sentir tédio. Troque automaticamente." },
    { technique: "Pergunta TCC", instruction: "Pergunte: 'Estou com fome física ou emocional?' Se emocional, adiar 20min." },
  ],
  tristeza: [
    { technique: "Ativação comportamental", instruction: "Tristeza pede ação, não comida. Ligue para alguém ou saia por 10min." },
    { technique: "Journaling", instruction: "Escreva o que está sentindo por 5 minutos antes de comer. A emoção perde força." },
  ],
  solidao: [
    { technique: "Conexão social", instruction: "Mande mensagem para alguém antes de abrir a geladeira. Solidão quer conexão, não comida." },
  ],
  culpa: [
    { technique: "Auto-compaixão", instruction: "Falar com você mesmo como falaria com um amigo. 'Tudo bem, isso não define minha dieta inteira.'" },
    { technique: "Reestruturação all-or-nothing", instruction: "Um deslize não cancela a semana. Volte à próxima refeição normalmente." },
  ],
  comemoracao: [
    { technique: "Regra 80/20 planejada", instruction: "Planeje a comemoração — decida antes, não no impulso. Coma devagar e com atenção." },
  ],
  cansaco: [
    { technique: "Sono > comida", instruction: "Cansaço físico não é resolvido com comida. 20min de descanso vale mais." },
    { technique: "Snack estratégico", instruction: "Se inevitável, tenha snack proteico pré-preparado para não improvisar." },
  ],
};

export default function BehavioralTriggersPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<TriggerEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem("nutrion-triggers") || "[]"); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [form, setForm] = useState({
    situation: "",
    emotion: "",
    thought: "",
    behavior: "",
    intensity: 5,
  });

  const save = () => {
    if (!form.emotion || !form.behavior || !form.situation) {
      toast.error("Preencha situação, emoção e comportamento");
      return;
    }
    const entry: TriggerEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("pt-BR"),
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      situation: form.situation,
      emotion: form.emotion,
      thought: form.thought,
      behavior: form.behavior,
      intensity: form.intensity,
      category: form.emotion,
    };
    const updated = [entry, ...logs];
    setLogs(updated);
    localStorage.setItem("nutrion-triggers", JSON.stringify(updated));
    setForm({ situation: "", emotion: "", thought: "", behavior: "", intensity: 5 });
    setShowForm(false);
    toast.success("Gatilho registrado");
  };

  // Pattern analysis
  const emotionCounts = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.emotion] = (acc[l.emotion] || 0) + 1;
    return acc;
  }, {});
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
  const behaviorCounts = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.behavior] = (acc[l.behavior] || 0) + 1;
    return acc;
  }, {});
  const topBehavior = Object.entries(behaviorCounts).sort((a, b) => b[1] - a[1])[0];

  const topEmotionMeta = EMOTIONS.find(e => e.id === topEmotion?.[0]);
  const topBehaviorMeta = BEHAVIORS.find(b => b.id === topBehavior?.[0]);
  const interventions = CBT_INTERVENTIONS[topEmotion?.[0]] || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur sticky top-0">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Mapa de Gatilhos</h1>
          <p className="text-[10px] text-muted-foreground font-mono">TCC Nutricional · Padrões Comportamentais</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
          <Plus className="w-3.5 h-3.5" /> Registrar
        </button>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-5 space-y-4">

        {/* Intro */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/15 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-mono text-primary uppercase tracking-wider mb-1">Agente TCC · Mapa Cognitivo</p>
              <p className="text-xs text-foreground leading-relaxed">
                Identifique os gatilhos emocionais que sabotam sua dieta. Cada registro treina o seu autoconhecimento alimentar.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Log form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
              <p className="text-xs font-mono text-primary uppercase tracking-wider">Registrar gatilho agora</p>

              {/* Situation */}
              <div>
                <label className="text-[9px] font-mono text-muted-foreground uppercase block mb-1">O que aconteceu?</label>
                <textarea value={form.situation} onChange={e => setForm(f => ({ ...f, situation: e.target.value }))}
                  placeholder="Ex: Cheguei em casa após dia estressante no trabalho..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none h-16"
                />
              </div>

              {/* Emotion selector */}
              <div>
                <label className="text-[9px] font-mono text-muted-foreground uppercase block mb-2">Como você estava se sentindo?</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {EMOTIONS.map(em => (
                    <button key={em.id} onClick={() => setForm(f => ({ ...f, emotion: em.id }))}
                      className={`p-2 rounded-lg border text-center transition-all ${form.emotion === em.id ? "border-primary/40 bg-primary/10" : "border-border bg-card/50"}`}>
                      <div className="text-xl">{em.emoji}</div>
                      <div className="text-[8px] font-mono text-muted-foreground mt-0.5">{em.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Thought */}
              <div>
                <label className="text-[9px] font-mono text-muted-foreground uppercase block mb-1">Pensamento automático (opcional)</label>
                <input type="text" value={form.thought} onChange={e => setForm(f => ({ ...f, thought: e.target.value }))}
                  placeholder="Ex: 'Eu mereço, foi um dia difícil...'"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </div>

              {/* Behavior */}
              <div>
                <label className="text-[9px] font-mono text-muted-foreground uppercase block mb-2">O que você fez?</label>
                <div className="space-y-1.5">
                  {BEHAVIORS.map(beh => (
                    <button key={beh.id} onClick={() => setForm(f => ({ ...f, behavior: beh.id }))}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${form.behavior === beh.id ? "border-primary/40 bg-primary/8" : "border-border bg-card/50"}`}>
                      <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${form.behavior === beh.id ? "bg-primary border-primary" : "border-muted-foreground/40"}`} />
                      <div>
                        <p className="text-xs font-bold text-foreground">{beh.label}</p>
                        <p className="text-[9px] text-muted-foreground">{beh.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] font-mono text-muted-foreground uppercase">Intensidade da emoção</label>
                  <span className="text-sm font-bold font-mono text-primary">{form.intensity}/10</span>
                </div>
                <input type="range" min={1} max={10} value={form.intensity}
                  onChange={e => setForm(f => ({ ...f, intensity: parseInt(e.target.value) }))}
                  className="w-full accent-primary" />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg border border-border text-xs font-mono text-muted-foreground">Cancelar</button>
                <button onClick={save} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold">Salvar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pattern analysis */}
        {logs.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-xl border border-[#00f0b4]/20 bg-[#00f0b4]/5 p-4">
            <p className="text-[10px] font-mono text-[#00f0b4] uppercase tracking-wider mb-3 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Padrão identificado
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {topEmotionMeta && (
                <div className="rounded-lg bg-card/60 border border-border p-2.5">
                  <p className="text-[8px] font-mono text-muted-foreground uppercase mb-1">Gatilho principal</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{topEmotionMeta.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">{topEmotionMeta.label}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">{topEmotion[1]}x registrado</p>
                    </div>
                  </div>
                </div>
              )}
              {topBehaviorMeta && (
                <div className="rounded-lg bg-card/60 border border-border p-2.5">
                  <p className="text-[8px] font-mono text-muted-foreground uppercase mb-1">Comportamento freq.</p>
                  <p className="text-xs font-bold text-foreground">{topBehaviorMeta.label}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">{topBehavior[1]}x registrado</p>
                </div>
              )}
            </div>

            {/* Emotion frequency bars */}
            <div className="space-y-1.5">
              {Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id, count]) => {
                const em = EMOTIONS.find(e => e.id === id);
                if (!em) return null;
                const pct = Math.round(count / logs.length * 100);
                return (
                  <div key={id} className="flex items-center gap-2">
                    <span className="text-sm w-5">{em.emoji}</span>
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ background: em.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground w-6 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* CBT interventions for top trigger */}
        {interventions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-xl border border-primary/15 bg-primary/5 p-4">
            <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-3 flex items-center gap-1">
              <Brain className="w-3 h-3" /> Técnicas TCC para {topEmotionMeta?.label}
            </p>
            <div className="space-y-3">
              {interventions.map((iv, i) => (
                <div key={i} className="rounded-lg bg-card/60 border border-border p-3">
                  <p className="text-[10px] font-mono text-primary font-bold uppercase mb-1">{iv.technique}</p>
                  <p className="text-xs text-foreground leading-relaxed">{iv.instruction}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Log history */}
        {logs.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-xl border border-border bg-card/60 p-4">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Registros recentes</p>
            <div className="space-y-2">
              {logs.slice(0, 8).map(log => {
                const em = EMOTIONS.find(e => e.id === log.emotion);
                const beh = BEHAVIORS.find(b => b.id === log.behavior);
                const isExpanded = expandedLog === log.id;
                return (
                  <div key={log.id} className="rounded-lg bg-background/50 border border-border overflow-hidden">
                    <button onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                      className="w-full flex items-center gap-3 p-3 text-left">
                      <span className="text-lg flex-shrink-0">{em?.emoji || "🔔"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{log.situation}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-mono" style={{ color: em?.color || "hsl(var(--muted-foreground))" }}>{em?.label}</span>
                          <span className="text-[8px] font-mono text-muted-foreground">·</span>
                          <span className="text-[9px] font-mono text-muted-foreground">{beh?.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[8px] font-mono text-muted-foreground">{log.time}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-3 pb-3 pt-0 border-t border-border space-y-1.5">
                            {log.thought && (
                              <p className="text-[10px] font-mono text-muted-foreground">
                                💭 <span className="italic text-foreground">{log.thought}</span>
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-muted-foreground">Intensidade:</span>
                              <div className="flex gap-0.5">
                                {[...Array(10)].map((_, i) => (
                                  <div key={i} className={`w-2 h-2 rounded-sm ${i < log.intensity ? "bg-primary" : "bg-border"}`} />
                                ))}
                              </div>
                              <span className="text-[9px] font-mono text-primary">{log.intensity}/10</span>
                            </div>
                            {CBT_INTERVENTIONS[log.emotion]?.[0] && (
                              <div className="rounded-lg bg-primary/5 border border-primary/15 p-2 mt-2">
                                <p className="text-[8px] font-mono text-primary uppercase mb-0.5">{CBT_INTERVENTIONS[log.emotion][0].technique}</p>
                                <p className="text-[9px] text-muted-foreground">{CBT_INTERVENTIONS[log.emotion][0].instruction}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card/50 p-8 text-center">
            <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-mono">Nenhum gatilho registrado ainda</p>
            <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">Registre quando você sentir vontade de comer fora do plano — o padrão vai aparecer</p>
          </motion.div>
        )}

        {/* Deep dive with TCC agent */}
        {logs.length >= 3 && (
          <button
            onClick={() => {
              const pattern = topEmotionMeta ? `Gatilho principal: ${topEmotionMeta.label} (${topEmotion[1]}x)` : "";
              const beh = topBehaviorMeta ? `Comportamento: ${topBehaviorMeta.label} (${topBehavior[1]}x)` : "";
              sessionStorage.setItem("nutrion-agent-prompt",
                `Quero uma sessão TCC aprofundada sobre meus gatilhos alimentares. ${pattern}. ${beh}. Total de ${logs.length} registros. Me ajude a entender o padrão cognitivo-emocional por trás disso e me dê um plano de reestruturação cognitiva específico para esses gatilhos.`
              );
              navigate("/chat");
            }}
            className="w-full py-3 rounded-xl border border-primary/20 bg-primary/8 text-primary text-xs font-mono font-bold flex items-center justify-center gap-2 hover:bg-primary/15 transition-colors"
          >
            <MessageSquare className="w-4 h-4" /> Sessão TCC aprofundada com NutriCoach MCE
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
