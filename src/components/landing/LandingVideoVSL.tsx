import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const SCENE_DURATION = 5200;

const SCENES = [
  {
    badge: "A REALIDADE",
    accent: "#cc2222",
    glow: "rgba(204,34,34,.12)",
    statNum: "73%",
    statSub: "das pessoas abandonam a dieta em menos de 3 semanas",
    lines: ["VOCÊ TREINA.", "VOCÊ SACRIFICA.", "O SHAPE NÃO VEM."],
    body: "Não é falta de força de vontade. É falta de sistema.",
    badges: [
      { label: "-12kg", sub: "em 90 dias" },
      { label: "+8%", sub: "massa magra ganha" },
      { label: "1.847 kcal", sub: "protocolo de hoje" },
      { label: "14 dias", sub: "streak ativo" },
    ],
  },
  {
    badge: "O PROBLEMA",
    accent: "#e8a020",
    glow: "rgba(232,160,32,.10)",
    statNum: "1 em 5",
    statSub: "pessoas atinge o objetivo com apps de dieta tradicionais",
    lines: ["APPS GENÉRICOS.", "PLANOS COPIADOS.", "ZERO RESULTADO."],
    body: "Seu corpo é único. Seu protocolo também precisa ser.",
    badges: [
      { label: "-12kg", sub: "em 90 dias" },
      { label: "+8%", sub: "massa magra ganha" },
      { label: "1.847 kcal", sub: "protocolo de hoje" },
      { label: "14 dias", sub: "streak ativo" },
    ],
  },
  {
    badge: "A SOLUÇÃO",
    accent: "#00f0b4",
    glow: "rgba(0,240,180,.08)",
    statNum: "90",
    statSub: "dias para mudar seu shape com protocolo de IA adaptativo",
    lines: ["PROTOCOLO.", "PERSONALIZADO.", "RESULTADO REAL."],
    body: "NutriON gera seu plano, aprende com seus dados e escala com você.",
    cta: true,
    badges: [
      { label: "-12kg", sub: "em 90 dias" },
      { label: "+8%", sub: "massa magra ganha" },
      { label: "1.847 kcal", sub: "protocolo de hoje" },
      { label: "14 dias", sub: "streak ativo" },
    ],
  },
];

const BADGE_POS = [
  { left: "6%", top: "22%" },
  { right: "24%", top: "18%" },
  { left: "4%", top: "62%" },
  { right: "22%", top: "72%" },
];

const FILM_GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`;

const BodySilhouette = ({ color }: { color: string }) => (
  <svg width="220" height="420" viewBox="0 0 220 420" fill="none" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.055]">
    <circle cx="110" cy="38" r="28" stroke={color} strokeWidth="1.5" />
    <line x1="110" y1="66" x2="110" y2="82" stroke={color} strokeWidth="1.5" />
    <path d="M60 100 Q110 85 160 100" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M70 105 L65 180 L155 180 L150 105" stroke={color} strokeWidth="1.2" fill="none" />
    <line x1="60" y1="100" x2="30" y2="170" stroke={color} strokeWidth="1.2" />
    <line x1="30" y1="170" x2="20" y2="230" stroke={color} strokeWidth="1.2" />
    <line x1="160" y1="100" x2="190" y2="170" stroke={color} strokeWidth="1.2" />
    <line x1="190" y1="170" x2="200" y2="230" stroke={color} strokeWidth="1.2" />
    <line x1="80" y1="130" x2="140" y2="130" stroke={color} strokeWidth="0.8" />
    <line x1="78" y1="148" x2="142" y2="148" stroke={color} strokeWidth="0.8" />
    <line x1="76" y1="166" x2="144" y2="166" stroke={color} strokeWidth="0.8" />
    <line x1="110" y1="105" x2="110" y2="180" stroke={color} strokeWidth="0.6" strokeDasharray="4 4" />
    <path d="M70 185 Q110 195 150 185" stroke={color} strokeWidth="1.2" fill="none" />
    <line x1="80" y1="190" x2="75" y2="310" stroke={color} strokeWidth="1.5" />
    <line x1="75" y1="310" x2="70" y2="400" stroke={color} strokeWidth="1.5" />
    <line x1="140" y1="190" x2="145" y2="310" stroke={color} strokeWidth="1.5" />
    <line x1="145" y1="310" x2="150" y2="400" stroke={color} strokeWidth="1.5" />
    <line x1="95" y1="200" x2="90" y2="300" stroke={color} strokeWidth="0.6" />
    <line x1="125" y1="200" x2="130" y2="300" stroke={color} strokeWidth="0.6" />
    <ellipse cx="60" cy="400" rx="18" ry="6" stroke={color} strokeWidth="1" />
    <ellipse cx="160" cy="400" rx="18" ry="6" stroke={color} strokeWidth="1" />
    <ellipse cx="38" cy="155" rx="8" ry="16" stroke={color} strokeWidth="0.6" />
    <ellipse cx="182" cy="155" rx="8" ry="16" stroke={color} strokeWidth="0.6" />
    <ellipse cx="82" cy="260" rx="10" ry="22" stroke={color} strokeWidth="0.6" />
    <ellipse cx="138" cy="260" rx="10" ry="22" stroke={color} strokeWidth="0.6" />
  </svg>
);

const LandingVideoVSL = () => {
  const [idx, setIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIdx(p => (p + 1) % 3);
      setTick(p => p + 1);
    }, SCENE_DURATION);
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (i: number) => {
    setIdx(i);
    setTick(p => p + 1);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIdx(p => (p + 1) % 3);
      setTick(p => p + 1);
    }, SCENE_DURATION);
  };

  const scene = SCENES[idx];

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100svh", background: "#03030a" }}>
      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none z-[3]" style={{ backgroundImage: FILM_GRAIN, backgroundSize: "128px", opacity: 0.06 }} />
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-[3]" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.04) 0px, rgba(0,0,0,.04) 1px, transparent 1px, transparent 3px)" }} />

      {/* Radial glow */}
      <div className="absolute inset-0 z-[1]" style={{ background: `radial-gradient(ellipse 70% 55% at 50% 35%, ${scene.glow}, transparent 68%)` }} />

      {/* Body silhouette */}
      <BodySilhouette color={scene.accent} />

      {/* Floating badges */}
      <AnimatePresence mode="wait">
        {scene.badges.map((b, i) => (
          <motion.div
            key={`${idx}-${i}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
            className="absolute z-[4] hidden md:block"
            style={{ ...BADGE_POS[i], backdropFilter: "blur(12px)" }}
          >
            <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(6,6,20,.75)", border: `1px solid ${scene.accent}22` }}>
              <p className="font-heading text-sm" style={{ color: scene.accent }}>{b.label}</p>
              <p className="font-mono text-[10px]" style={{ color: "#50507a" }}>{b.sub}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-[5] h-full flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-[.15em] mb-6"
              style={{ background: `${scene.accent}15`, border: `1px solid ${scene.accent}30`, color: scene.accent }}
            >
              {scene.badge}
            </motion.span>

            {/* Stat */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="mb-6">
              <p className="font-heading font-black leading-none" style={{ fontSize: "clamp(4.5rem, 12vw, 11rem)", color: scene.accent }}>
                {scene.statNum}
              </p>
              <p className="font-mono text-xs md:text-sm max-w-md mx-auto" style={{ color: "#8888aa" }}>{scene.statSub}</p>
            </motion.div>

            {/* Heading lines */}
            <div className="mb-4 space-y-1">
              {scene.lines.map((line, li) => (
                <motion.p
                  key={li}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + li * 0.12, duration: 0.5 }}
                  className="font-heading text-2xl md:text-4xl font-black tracking-tight text-white/90"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="font-mono text-sm md:text-base max-w-md mx-auto mb-8"
              style={{ color: "#8888aa" }}
            >
              {scene.body}
            </motion.p>

            {/* CTA (scene 3 only) */}
            {scene.cta && (
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                href="#plans"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-heading font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg, #00c896, #00f0b4)",
                  color: "#000",
                  boxShadow: "0 0 30px rgba(0,240,180,.2)",
                }}
              >
                ▶ Começar meu protocolo agora
              </motion.a>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scene dots + progress bar */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[6] flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {SCENES.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 24 : 8,
                background: i === idx ? s.accent : "rgba(255,255,255,.12)",
              }}
            />
          ))}
        </div>
        <div className="w-32 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
          <motion.div
            key={tick}
            className="h-full rounded-full"
            style={{ background: scene.accent }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: SCENE_DURATION / 1000, ease: "linear" }}
          />
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[6]"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-5 h-5" style={{ color: "rgba(255,255,255,.2)" }} />
      </motion.div>
    </section>
  );
};

export default LandingVideoVSL;
