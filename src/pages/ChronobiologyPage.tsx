import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { ArrowLeft, Sun, Sunset, Moon, Coffee, Clock, Zap, Brain, AlertTriangle } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const TIME_WINDOWS = [
  {
    id: "morning",
    label: "Manhã",
    time: "06:00 – 10:00",
    icon: Coffee,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    tips: [
      "Maior sensibilidade à insulina → melhor horário para carboidratos complexos",
      "Cortisol naturalmente alto → proteína no café da manhã estabiliza energia",
      "Metabolismo acelerando → refeição completa com todos os macros",
    ],
    macroFocus: { carbs: 40, protein: 30, fat: 30 },
    bestFoods: ["Aveia", "Ovos", "Frutas", "Pão integral", "Iogurte grego"],
    avoid: ["Açúcar refinado", "Café em jejum (irritação gástrica)"],
    science: "O pico de cortisol matinal (6-8h) ativa a gliconeogênese. Aproveite a sensibilidade insulínica para carboidratos complexos.",
  },
  {
    id: "midday",
    label: "Meio-dia",
    time: "11:00 – 14:00",
    icon: Sun,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    tips: [
      "Pico metabólico do dia → maior capacidade digestiva",
      "Ideal para a refeição mais calórica do dia",
      "Proteína + fibras = saciedade prolongada para a tarde",
    ],
    macroFocus: { carbs: 45, protein: 30, fat: 25 },
    bestFoods: ["Arroz integral", "Frango/Peixe", "Salada verde", "Feijão", "Batata doce"],
    avoid: ["Refeições muito gordurosas (sonolência pós-prandial)"],
    science: "A temperatura corporal e o metabolismo atingem o pico entre 12-14h, otimizando a termogênese alimentar.",
  },
  {
    id: "afternoon",
    label: "Tarde",
    time: "15:00 – 18:00",
    icon: Sunset,
    color: "text-cyan",
    bg: "bg-cyan/10",
    border: "border-cyan/20",
    tips: [
      "Sensibilidade à insulina diminuindo → reduzir carboidratos simples",
      "Lanche proteico evita queda de energia",
      "Bom momento para gorduras saudáveis (absorção lenta)",
    ],
    macroFocus: { carbs: 25, protein: 35, fat: 40 },
    bestFoods: ["Castanhas", "Whey protein", "Abacate", "Queijo cottage", "Frutas com fibra"],
    avoid: ["Doces", "Carboidratos refinados", "Café após 16h (insônia)"],
    science: "A melatonina começa a ser produzida e a sensibilidade insulínica cai. Gorduras boas sustentam energia sem picos glicêmicos.",
  },
  {
    id: "night",
    label: "Noite",
    time: "19:00 – 22:00",
    icon: Moon,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
    tips: [
      "Metabolismo desacelerando → refeições mais leves",
      "Priorizar proteínas de absorção lenta (caseína) para recuperação noturna",
      "Triptofano (banana, leite) favorece produção de melatonina",
    ],
    macroFocus: { carbs: 20, protein: 40, fat: 40 },
    bestFoods: ["Salmão", "Ovos", "Vegetais cozidos", "Chá de camomila", "Leite morno"],
    avoid: ["Refeições pesadas", "Cafeína", "Açúcar (insônia)", "Álcool (fragmenta sono)"],
    science: "A melatonina sobe e o GH é liberado durante o sono. Proteína de absorção lenta otimiza a síntese proteica noturna.",
  },
];

const FASTING_PROTOCOLS = [
  { name: "12/12", fast: 12, eat: 12, desc: "Iniciante — jejum noturno natural", difficulty: "Fácil" },
  { name: "16/8", fast: 16, eat: 8, desc: "Mais popular — pula café da manhã", difficulty: "Moderado" },
  { name: "18/6", fast: 18, eat: 6, desc: "Avançado — janela curta", difficulty: "Difícil" },
  { name: "OMAD", fast: 23, eat: 1, desc: "Uma refeição ao dia", difficulty: "Extremo" },
];

const ChronobiologyPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { todayLog } = useActivityLogs();
  const [activeWindow, setActiveWindow] = useState("morning");
  const [selectedFasting, setSelectedFasting] = useState<string | null>(null);

  const sleepHours = todayLog?.sleep_hours || 0;
  const sleepQuality = sleepHours >= 7 ? "good" : sleepHours >= 5 ? "moderate" : "poor";

  const sleepAdjustment = useMemo(() => {
    if (sleepQuality === "poor") {
      return {
        alert: true,
        message: `Sono insuficiente detectado (${sleepHours}h). Ajustes recomendados:`,
        adjustments: [
          "↑ Proteína +15% (reparação muscular comprometida)",
          "↑ Magnésio — incluir folhas escuras, castanhas e cacau",
          "↓ Carboidratos simples (resistência insulínica transitória)",
          "↑ Vitamina B6 — banana, frango, batata (síntese de serotonina)",
        ],
      };
    }
    if (sleepQuality === "moderate") {
      return {
        alert: true,
        message: `Sono abaixo do ideal (${sleepHours}h). Ajuste leve:`,
        adjustments: [
          "↑ Proteína +10%",
          "Incluir alimentos ricos em triptofano no jantar",
        ],
      };
    }
    return null;
  }, [sleepHours, sleepQuality]);

  const currentWindow = TIME_WINDOWS.find(w => w.id === activeWindow)!;
  const hour = new Date().getHours();
  const currentTimeId = hour < 10 ? "morning" : hour < 14 ? "midday" : hour < 18 ? "afternoon" : "night";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-border">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Cronobiologia</h1>
            <p className="text-xs text-muted-foreground font-mono">Janelas de nutrientes por horário</p>
          </div>
          <Clock className="w-5 h-5 text-primary ml-auto" />
        </div>

        {/* Sleep adjustment alert */}
        {sleepAdjustment && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 mb-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{sleepAdjustment.message}</p>
                <ul className="space-y-1">
                  {sleepAdjustment.adjustments.map((adj, i) => (
                    <li key={i} className="text-xs text-muted-foreground font-mono">• {adj}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Time window selector */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {TIME_WINDOWS.map(w => (
            <button
              key={w.id}
              onClick={() => setActiveWindow(w.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                activeWindow === w.id
                  ? `${w.border} ${w.bg}`
                  : "border-border bg-card hover:border-muted-foreground/30"
              } ${currentTimeId === w.id ? "ring-1 ring-primary/30" : ""}`}
            >
              <w.icon className={`w-5 h-5 ${activeWindow === w.id ? w.color : "text-muted-foreground"}`} />
              <span className="text-[10px] font-mono text-foreground">{w.label}</span>
              {currentTimeId === w.id && (
                <span className="text-[8px] font-mono text-primary">AGORA</span>
              )}
            </button>
          ))}
        </div>

        {/* Active window detail */}
        <motion.div
          key={activeWindow}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Header card */}
          <div className={`rounded-xl border ${currentWindow.border} ${currentWindow.bg} p-5`}>
            <div className="flex items-center gap-3 mb-3">
              <currentWindow.icon className={`w-7 h-7 ${currentWindow.color}`} />
              <div>
                <h2 className="text-lg font-bold text-foreground">{currentWindow.label}</h2>
                <p className="text-xs font-mono text-muted-foreground">{currentWindow.time}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              <Brain className="w-3 h-3 inline mr-1" />
              {currentWindow.science}
            </p>
          </div>

          {/* Macro distribution */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Distribuição ideal
            </h3>
            <div className="space-y-2">
              {[
                { label: "Carboidrato", val: currentWindow.macroFocus.carbs, color: "bg-primary" },
                { label: "Proteína", val: currentWindow.macroFocus.protein, color: "bg-accent" },
                { label: "Gordura", val: currentWindow.macroFocus.fat, color: "bg-cyan" },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-24">{m.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${m.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${m.val}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <span className="text-xs font-mono text-foreground w-10 text-right">{m.val}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">💡 Dicas</h3>
            <ul className="space-y-2">
              {currentWindow.tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">→</span> {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Best foods */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">✅ Alimentos ideais</h3>
            <div className="flex flex-wrap gap-1.5">
              {currentWindow.bestFoods.map(f => (
                <span key={f} className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded-md">{f}</span>
              ))}
            </div>
          </div>

          {/* Avoid */}
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">⚠️ Evitar</h3>
            <div className="flex flex-wrap gap-1.5">
              {currentWindow.avoid.map(f => (
                <span key={f} className="text-xs font-mono bg-destructive/10 text-destructive px-2 py-1 rounded-md">{f}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Fasting protocols */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Protocolos de Jejum
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {FASTING_PROTOCOLS.map(fp => (
              <button
                key={fp.name}
                onClick={() => setSelectedFasting(selectedFasting === fp.name ? null : fp.name)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedFasting === fp.name
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <div className="font-bold text-lg text-foreground font-mono">{fp.name}</div>
                <div className="text-[10px] font-mono text-primary mb-1">{fp.fast}h jejum / {fp.eat}h alimentação</div>
                <p className="text-xs text-muted-foreground">{fp.desc}</p>
                <span className={`text-[9px] font-mono mt-1 inline-block px-1.5 py-0.5 rounded ${
                  fp.difficulty === "Fácil" ? "bg-green-500/10 text-green-500" :
                  fp.difficulty === "Moderado" ? "bg-primary/10 text-primary" :
                  fp.difficulty === "Difícil" ? "bg-accent/10 text-accent" :
                  "bg-destructive/10 text-destructive"
                }`}>{fp.difficulty}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Calculated nocturnal fast */}
        {profile && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
              <Moon className="w-4 h-4 text-primary" /> Seu jejum noturno calculado
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              Baseado no seu protocolo <span className="text-primary font-mono">{profile.active_protocol || "Padrão"}</span>
            </p>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-2xl font-bold font-mono text-primary">12h</span>
                <p className="text-[10px] text-muted-foreground font-mono">Última refeição: 20h</p>
                <p className="text-[10px] text-muted-foreground font-mono">Primeira refeição: 08h</p>
              </div>
              <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: "50%" }} />
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default ChronobiologyPage;
