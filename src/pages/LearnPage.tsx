import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, GraduationCap, ChevronRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { LEVELS } from "@/hooks/useGamification";
import { toast } from "sonner";

const STORAGE_KEY = "learn_fisio_treino_completed";
const XP_REWARD = 50;

type Card = {
  title: string;
  subtitle: string;
  body: string;
  link: { label: string; to: string };
  Visual: () => JSX.Element;
};

/* ─────────── Visuals (SVG) ─────────── */
const SilhuetaVisual = () => (
  <svg viewBox="0 0 320 180" className="w-full h-full">
    <defs>
      <linearGradient id="g1" x1="0" x2="1">
        <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
        <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    {/* silhueta */}
    <g stroke="hsl(var(--primary))" strokeWidth="1.5" fill="url(#g1)">
      <circle cx="50" cy="40" r="14" />
      <path d="M36 58 L36 110 L40 150 M64 58 L64 110 L60 150 M44 65 L56 65 M50 65 L50 110" />
    </g>
    {/* zoom em fibra */}
    <g transform="translate(110,30)">
      <rect width="80" height="120" rx="6" fill="none" stroke="hsl(var(--primary))" strokeOpacity="0.4" strokeDasharray="2 3" />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect key={i} x={6} y={10 + i * 18} width="68" height="6" rx="3" fill="hsl(var(--primary))" fillOpacity={0.15 + i * 0.12} />
      ))}
      <text x="40" y="138" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))" fontFamily="monospace">FIBRA</text>
    </g>
    {/* miofibrila → ponte cruzada */}
    <g transform="translate(210,40)">
      <line x1="0" y1="30" x2="100" y2="30" stroke="hsl(var(--primary))" strokeWidth="2" />
      <line x1="0" y1="60" x2="100" y2="60" stroke="hsl(var(--primary))" strokeWidth="2" />
      {[10, 30, 50, 70, 90].map(x => (
        <line key={x} x1={x} y1={30} x2={x + 6} y2={60} stroke="hsl(var(--primary))" strokeWidth="1.2" strokeOpacity="0.7" />
      ))}
      <text x="50" y="90" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))" fontFamily="monospace">PONTES CRUZADAS</text>
    </g>
  </svg>
);

const FibrasVisual = () => {
  const rows = [
    { tipo: "Tipo I", zona: "Z4–Z5", color: "hsl(200, 70%, 55%)", desc: "Oxidativa / resistente" },
    { tipo: "Tipo IIa", zona: "Z2–Z3", color: "hsl(45, 90%, 55%)", desc: "Mista / híbrida" },
    { tipo: "Tipo IIx", zona: "Z1–Z2", color: "hsl(0, 80%, 55%)", desc: "Rápida / potente" },
  ];
  return (
    <div className="w-full h-full flex flex-col gap-2 justify-center px-2">
      {rows.map(r => (
        <div key={r.tipo} className="flex items-center gap-3 rounded-lg border border-border bg-card/40 p-2">
          <div className="h-8 w-1.5 rounded-full" style={{ background: r.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono text-foreground font-bold">{r.tipo}</p>
            <p className="text-[9px] font-mono text-muted-foreground">{r.desc}</p>
          </div>
          <span className="text-[10px] font-mono font-bold" style={{ color: r.color }}>{r.zona}</span>
        </div>
      ))}
    </div>
  );
};

const HipertrofiaVisual = () => {
  const steps = ["Tensão mecânica", "Titina", "mTORC1", "Síntese proteica", "Novo sarcômero"];
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 w-full">
          <span className="h-6 w-6 rounded-full bg-primary/15 text-primary text-[10px] font-mono font-bold flex items-center justify-center border border-primary/30">
            {i + 1}
          </span>
          <div className="flex-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1">
            <p className="text-[11px] font-mono text-foreground">{s}</p>
          </div>
          {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-primary/60" />}
        </div>
      ))}
    </div>
  );
};

const CicloVisual = () => {
  const phases = [
    { label: "Treino", color: "hsl(0, 80%, 55%)", y: 50 },
    { label: "Fadiga", color: "hsl(25, 90%, 55%)", y: 85 },
    { label: "Recuperação", color: "hsl(45, 90%, 55%)", y: 50 },
    { label: "Supercomp.", color: "hsl(120, 60%, 50%)", y: 20 },
  ];
  return (
    <svg viewBox="0 0 320 140" className="w-full h-full">
      <line x1="10" y1="50" x2="310" y2="50" stroke="hsl(var(--muted-foreground))" strokeDasharray="2 3" strokeOpacity="0.4" />
      <path
        d="M10 50 Q 60 50 80 85 Q 110 85 140 50 Q 180 50 220 20 Q 260 20 310 50"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        fill="none"
      />
      {phases.map((p, i) => {
        const x = 10 + i * 75 + 35;
        return (
          <g key={p.label}>
            <circle cx={x} cy={p.y} r="4" fill={p.color} />
            <text x={x} y={p.y - 8} textAnchor="middle" fontSize="8" fill="hsl(var(--foreground))" fontFamily="monospace">
              {p.label}
            </text>
          </g>
        );
      })}
      <text x="10" y="135" fontSize="8" fill="hsl(var(--muted-foreground))" fontFamily="monospace">basal →</text>
    </svg>
  );
};

const CARDS: Card[] = [
  {
    title: "Como a força é produzida",
    subtitle: "Cérebro → unidade motora → fibra",
    body:
      "Sua força começa no cérebro. O sinal neural recruta unidades motoras em ordem — das mais lentas às mais rápidas. Quanto mais intenso o esforço, mais fibras de alto limiar entram em ação.",
    link: { label: "Ver Zonas de Repetição", to: "/training" },
    Visual: SilhuetaVisual,
  },
  {
    title: "Tipos de fibra e zonas de treino",
    subtitle: "Tipo I · IIa · IIx",
    body:
      "Cada zona de repetição recruta um perfil diferente de fibra muscular. Z1–Z2 força as fibras tipo IIx — as mais rápidas e potentes. Z4–Z5 mantém nas tipo I — resistentes e oxidativas.",
    link: { label: "Ver sua progressão por zona", to: "/training" },
    Visual: FibrasVisual,
  },
  {
    title: "Como a hipertrofia acontece",
    subtitle: "Tensão → mTORC1 → sarcômero",
    body:
      "Hipertrofia é adição de sarcômeros em paralelo. O gatilho é a tensão mecânica detectada pela proteína titina. Mais tensão → mais sinal mTORC1 → mais síntese proteica.",
    link: { label: "Ver protocolo SMH no seu treino", to: "/training" },
    Visual: HipertrofiaVisual,
  },
  {
    title: "O ciclo completo",
    subtitle: "Treino · Fadiga · Recuperação · Supercompensação",
    body:
      "Você não cresce durante o treino — cresce depois. O descanso na janela certa é quando o organismo supera o basal. Treinar cedo demais interrompe o processo.",
    link: { label: "Ver supercompensação dos seus grupos", to: "/training" },
    Visual: CicloVisual,
  },
];

export default function LearnPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [index, setIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const alreadyDone =
    typeof window !== "undefined" && user
      ? localStorage.getItem(`${STORAGE_KEY}:${user.id}`) === "1"
      : false;

  const card = CARDS[index];
  const isLast = index === CARDS.length - 1;
  const progress = ((index + 1) / CARDS.length) * 100;

  const next = () => setIndex(i => Math.min(i + 1, CARDS.length - 1));
  const prev = () => setIndex(i => Math.max(i - 1, 0));

  const concluir = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (alreadyDone) {
      toast.info("Você já concluiu esta aula", { description: "XP já creditado anteriormente." });
      navigate("/training");
      return;
    }
    setFinishing(true);
    try {
      const newXp = (profile?.xp || 0) + XP_REWARD;
      const newLevel = LEVELS.reduce((acc, l) => (newXp >= l.minXp ? l.level : acc), 1);
      await updateProfile({ xp: newXp, level: newLevel });
      localStorage.setItem(`${STORAGE_KEY}:${user.id}`, "1");
      toast.success(`+${XP_REWARD} XP`, {
        description: "Aula de Fisiologia do Treino concluída.",
        icon: <Sparkles className="w-4 h-4" />,
      });
      navigate("/training");
    } catch (e) {
      toast.error("Não foi possível creditar o XP");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground" style={{ background: "#0A0A0F" }}>
      {/* header */}
      <div className="sticky top-0 z-10 border-b border-border/40 backdrop-blur-xl bg-[#0A0A0F]/80">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/coach/dashboard")}
            className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted/30 transition"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <GraduationCap className="w-4 h-4 text-primary" />
            <div>
              <h1 className="text-sm font-mono font-bold leading-none">Aprenda</h1>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Fisiologia do Treino · Aula 1/1</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-primary">+{XP_REWARD} XP</span>
        </div>
        {/* progress bar */}
        <div className="h-1 bg-border/40">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* card area */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {CARDS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-primary" : i < index ? "w-4 bg-primary/60" : "w-4 bg-border"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border bg-card/40 overflow-hidden"
          >
            {/* visual */}
            <div className="h-56 border-b border-border/60 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-3">
              <card.Visual />
            </div>
            {/* text */}
            <div className="p-5 space-y-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
                  Card {index + 1} de {CARDS.length}
                </p>
                <h2 className="text-lg font-bold mt-1">{card.title}</h2>
                <p className="text-xs font-mono text-muted-foreground">{card.subtitle}</p>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{card.body}</p>

              <button
                onClick={() => navigate(card.link.to)}
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-mono hover:bg-primary/20 transition"
              >
                {card.link.label}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* navigation */}
        <div className="flex items-center justify-between mt-5 gap-3">
          <button
            onClick={prev}
            disabled={index === 0}
            className="h-10 px-4 rounded-lg border border-border text-xs font-mono flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted/30 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Anterior
          </button>

          {isLast ? (
            <button
              onClick={concluir}
              disabled={finishing}
              className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold flex items-center gap-2 hover:opacity-90 transition disabled:opacity-60"
            >
              <Check className="w-3.5 h-3.5" />
              {alreadyDone ? "Concluído" : finishing ? "Salvando…" : `Concluir · +${XP_REWARD} XP`}
            </button>
          ) : (
            <button
              onClick={next}
              className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold flex items-center gap-2 hover:opacity-90 transition"
            >
              Próximo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
