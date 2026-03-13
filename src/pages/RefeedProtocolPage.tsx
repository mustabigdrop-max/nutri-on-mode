import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, AlertTriangle, CheckCircle, TrendingDown, BarChart3, Calendar, ChevronRight, Info } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";

const ADAPTATION_SIGNS = [
  { id: "plateau", label: "Peso parado há +2 semanas", weight: 2 },
  { id: "cold", label: "Sinto mais frio que o normal", weight: 1.5 },
  { id: "hungry", label: "Fome intensa e constante", weight: 2 },
  { id: "fatigue", label: "Fadiga e queda de performance no treino", weight: 1.5 },
  { id: "libido", label: "Queda de libido", weight: 1 },
  { id: "mood", label: "Irritabilidade / baixo humor", weight: 1 },
  { id: "sleep", label: "Dificuldade para dormir", weight: 1 },
  { id: "deficit_weeks", label: "Déficit calórico há mais de 6 semanas", weight: 2 },
];

const REFEED_PROTOCOLS = [
  {
    id: "light",
    label: "Refeed Leve",
    deficit_weeks: "2-4",
    days: 1,
    carb_multiplier: 2.5,
    kcal_increase: "+15-20%",
    color: "#00f0b4",
    description: "Dia de carboidratos elevados. Mantém gordura estável, restaura glicogênio muscular.",
    schedule: ["Aumento de carbs na pré-treino", "Manter proteína alta", "Reduzir gordura no dia"],
  },
  {
    id: "moderate",
    label: "Refeed Moderado",
    deficit_weeks: "4-8",
    days: 2,
    carb_multiplier: 3.0,
    kcal_increase: "+20-25%",
    color: "#e8a020",
    description: "2 dias consecutivos com superávit moderado. Reverte sinais de adaptação metabólica.",
    schedule: ["Dia 1: +25% kcal com foco em carbs", "Dia 2: +20% kcal — manutenção", "Treino pesado nesses dias"],
  },
  {
    id: "diet_break",
    label: "Diet Break",
    deficit_weeks: "8+",
    days: 14,
    carb_multiplier: 4.0,
    kcal_increase: "Manutenção",
    color: "#7890ff",
    description: "2 semanas em manutenção calórica. Para adaptação severa — restaura leptina, T3 e metabolismo.",
    schedule: ["14 dias em manutenção (sem déficit)", "Proteína alta mantida", "Treino normal", "Depois: novo protocolo de cutting"],
  },
];

function calcAdaptationScore(selected: string[]): number {
  const total = selected.reduce((sum, id) => {
    const sign = ADAPTATION_SIGNS.find(s => s.id === id);
    return sum + (sign?.weight || 0);
  }, 0);
  const maxScore = ADAPTATION_SIGNS.reduce((s, a) => s + a.weight, 0);
  return Math.round((total / maxScore) * 100);
}

function getProtocol(score: number, deficitWeeks: number) {
  if (score < 25 && deficitWeeks < 4) return REFEED_PROTOCOLS[0];
  if (score < 55 || deficitWeeks < 8) return REFEED_PROTOCOLS[1];
  return REFEED_PROTOCOLS[2];
}

const RefeedProtocolPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const vet = profile?.vet_kcal || 2000;
  const protein = profile?.protein_g || 180;
  const carbs = profile?.carbs_g || 200;

  const [step, setStep] = useState<"assess" | "result">("assess");
  const [selected, setSelected] = useState<string[]>([]);
  const [deficitWeeks, setDeficitWeeks] = useState(4);

  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const score = calcAdaptationScore(selected);
  const protocol = getProtocol(score, deficitWeeks);

  const refeedKcal = Math.round(vet * (protocol.id === "diet_break" ? 1.0 : protocol.id === "moderate" ? 1.22 : 1.17));
  const refeedCarbs = Math.round(carbs * protocol.carb_multiplier);
  const refeedProtein = protein;
  const refeedFat = Math.max(30, Math.round((refeedKcal - refeedCarbs * 4 - refeedProtein * 4) / 9));

  const scoreColor = score < 30 ? "#00f0b4" : score < 60 ? "#e8a020" : "hsl(var(--destructive))";
  const scoreLabel = score < 30 ? "Adaptação Leve" : score < 60 ? "Adaptação Moderada" : "Adaptação Severa";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur sticky top-0">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Protocolo de Refeed</h1>
          <p className="text-[10px] text-muted-foreground font-mono">Adaptação Metabólica · Diet Break</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-[#e8a020] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-5 space-y-4">

        {/* Intro card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#e8a020]/20 bg-[#e8a020]/5 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#e8a020]/15 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-[#e8a020]" />
            </div>
            <div>
              <p className="text-[9px] font-mono text-[#e8a020] uppercase tracking-wider mb-1">Motor MCE · Refeed Engine</p>
              <p className="text-xs text-foreground leading-relaxed">
                Detecte sinais de adaptação metabólica e calcule automaticamente seu protocolo de refeed ou diet break ideal.
              </p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "assess" ? (
            <motion.div key="assess" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Deficit duration slider */}
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Há quantas semanas em déficit?
                </p>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={24} value={deficitWeeks}
                    onChange={e => setDeficitWeeks(parseInt(e.target.value))}
                    className="flex-1 accent-primary" />
                  <span className="text-lg font-black font-mono text-primary w-12 text-right">{deficitWeeks}w</span>
                </div>
                <div className="flex justify-between text-[8px] font-mono text-muted-foreground mt-1">
                  <span>1 sem</span><span>6 sem</span><span>12 sem</span><span>24 sem</span>
                </div>
              </div>

              {/* Adaptation symptoms */}
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Sinais de adaptação metabólica
                </p>
                <div className="space-y-2">
                  {ADAPTATION_SIGNS.map(sign => (
                    <button key={sign.id} onClick={() => toggle(sign.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${selected.includes(sign.id) ? "border-primary/40 bg-primary/8" : "border-border bg-background/50 hover:border-border/80"}`}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${selected.includes(sign.id) ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                        {selected.includes(sign.id) && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span className="text-xs text-foreground">{sign.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep("result")}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-bold flex items-center justify-center gap-2"
                style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" }}>
                Calcular protocolo <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Adaptation score */}
              <div className="rounded-xl border p-4" style={{ borderColor: `${scoreColor}30`, background: `${scoreColor}08` }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: `${scoreColor}90` }}>Score de Adaptação Metabólica</p>
                  <button onClick={() => setStep("assess")} className="text-[9px] font-mono text-muted-foreground hover:text-foreground">← refazer</button>
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-4xl font-black font-mono" style={{ color: scoreColor }}>{score}%</span>
                  <span className="text-sm font-mono mb-1" style={{ color: scoreColor }}>{scoreLabel}</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ background: scoreColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Recommended protocol */}
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${protocol.color}30`, background: `${protocol.color}08` }}>
                <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${protocol.color}80, transparent)` }} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: `${protocol.color}80` }}>Protocolo recomendado</p>
                      <h2 className="text-lg font-black font-mono" style={{ color: protocol.color }}>{protocol.label}</h2>
                    </div>
                    <span className="px-2 py-1 rounded text-[9px] font-mono" style={{ background: `${protocol.color}20`, color: protocol.color, border: `1px solid ${protocol.color}30` }}>
                      {protocol.days === 14 ? "14 dias" : `${protocol.days}d`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{protocol.description}</p>

                  {/* Macros for refeed days */}
                  {protocol.id !== "diet_break" && (
                    <div className="rounded-lg border border-border bg-card/60 p-3 mb-3">
                      <p className="text-[9px] font-mono text-muted-foreground uppercase mb-2">Macros nos dias de refeed</p>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <p className="text-sm font-bold font-mono text-foreground">{refeedKcal}</p>
                          <p className="text-[8px] font-mono text-muted-foreground">kcal</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold font-mono text-primary">{refeedProtein}g</p>
                          <p className="text-[8px] font-mono text-muted-foreground">Prot</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold font-mono text-[#e8a020]">{refeedCarbs}g</p>
                          <p className="text-[8px] font-mono text-muted-foreground">Carb ↑</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold font-mono text-muted-foreground">{refeedFat}g</p>
                          <p className="text-[8px] font-mono text-muted-foreground">Gord ↓</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Schedule checklist */}
                  <div>
                    <p className="text-[9px] font-mono text-muted-foreground uppercase mb-2">Protocolo</p>
                    <ul className="space-y-1.5">
                      {protocol.schedule.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                          <span className="font-mono mt-0.5" style={{ color: protocol.color }}>→</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Science note */}
              <div className="rounded-xl border border-border bg-card/40 p-3">
                <p className="text-[9px] font-mono text-muted-foreground uppercase mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Por que o refeed funciona
                </p>
                <div className="space-y-1.5 text-[10px] font-mono text-muted-foreground leading-relaxed">
                  <p>→ Restaura <span className="text-foreground">leptina</span> (hormônio de saciedade que cai em déficit)</p>
                  <p>→ Normaliza <span className="text-foreground">T3 reverso</span> (hormônio tireoidiano que freia metabolismo)</p>
                  <p>→ Preenche <span className="text-foreground">glicogênio muscular</span> → melhor performance</p>
                  <p>→ Reduz <span className="text-foreground">cortisol</span> e melhora qualidade do sono</p>
                </div>
              </div>

              {/* Go to chat for personalized plan */}
              <button
                onClick={() => {
                  sessionStorage.setItem("nutrion-agent-prompt",
                    `Quero um protocolo de refeed personalizado. Score de adaptação metabólica: ${score}% (${scoreLabel}). Semanas em déficit: ${deficitWeeks}. Protocolo calculado: ${protocol.label}. Macros de manutenção: ${vet}kcal, ${protein}g proteína, ${carbs}g carb. Me dê um plano detalhado dia a dia para o refeed, incluindo fontes de carboidratos ideais, timing pre/pós treino e como retornar ao déficit.`
                  );
                  navigate("/chat");
                }}
                className="w-full py-3 rounded-xl border border-primary/20 bg-primary/8 text-primary text-xs font-mono font-bold flex items-center justify-center gap-2 hover:bg-primary/15 transition-colors"
              >
                <TrendingDown className="w-4 h-4" /> Gerar plano detalhado com NutriCoach MCE
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
};

export default RefeedProtocolPage;
