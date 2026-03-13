import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const alerts = [
  "⚡ Proteína 18g abaixo da meta — adicione whey ao lanche",
  "🔥 Você está 120kcal abaixo. Refeição extra sugerida.",
  "🧠 Padrão detectado: queda de adesão nas quartas.",
  "💧 Hidratação em 45%. Beba 500ml antes do treino.",
];

const features = [
  { icon: "🎯", title: "Engine de Kcal", desc: "GEB · GET · VET calculados com 4 fórmulas científicas" },
  { icon: "🧠", title: "IA Comportamental", desc: "Detecta padrões de sabotagem antes de acontecerem" },
  { icon: "📸", title: "Foto → Macros", desc: "Registre refeições com uma foto em 3 segundos" },
  { icon: "🔄", title: "Adaptação semanal", desc: "Plano reajustado toda semana com base nos seus dados" },
];

const LandingAppDemo = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [alertIndex, setAlertIndex] = useState(0);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setAlertIndex((prev) => (prev + 1) % alerts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [inView]);

  useEffect(() => {
    if (!inView) return;
    const timeout = setTimeout(() => setRegistered(true), 5000);
    const reset = setTimeout(() => setRegistered(false), 8000);
    return () => { clearTimeout(timeout); clearTimeout(reset); };
  }, [inView]);

  const macroPercent = inView ? 1 : 0;

  return (
    <section ref={ref} className="py-24 px-6 md:px-12 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <span className="font-mono text-[.7rem] text-primary tracking-[.25em] uppercase">Dentro do app</span>
        <h2 className="font-heading text-[clamp(2rem,5vw,4rem)] text-foreground mt-3 leading-[.95]">
          Veja o <span className="text-primary">NUTRION</span> em ação
        </h2>
      </motion.div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="w-[280px] bg-[#0a0a18] rounded-[32px] border border-[#1a1a3a] p-4 shadow-2xl relative" style={{ boxShadow: "0 0 60px rgba(232,160,32,.08)" }}>
            {/* Notch */}
            <div className="w-20 h-5 bg-[#03030a] rounded-full mx-auto mb-4" />

            {/* Caloric ring */}
            <div className="flex justify-center mb-5">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#1a1a3a" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="60" cy="60" r="50" stroke="hsl(38,80%,52%)" strokeWidth="8" fill="none"
                  strokeLinecap="round" strokeDasharray="314"
                  initial={{ strokeDashoffset: 314 }}
                  animate={inView ? { strokeDashoffset: 314 * 0.28 } : {}}
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="55" textAnchor="middle" className="fill-foreground font-heading text-[1.4rem]">1.847</text>
                <text x="60" y="72" textAnchor="middle" className="fill-[#50507a] font-mono text-[.55rem]">/ 2.450 kcal</text>
              </svg>
            </div>

            {/* Macro bars */}
            <div className="space-y-2.5 mb-5 px-2">
              {[
                { label: "Proteína", pct: 0.72, color: "#00C896" },
                { label: "Carboidrato", pct: 0.58, color: "#E8A020" },
                { label: "Gordura", pct: 0.45, color: "#7C3AED" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between font-mono text-[.6rem] text-[#6a6a8a] mb-1">
                    <span>{m.label}</span>
                    <span>{Math.round(m.pct * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#14142a] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: m.color }}
                      initial={{ width: "0%" }}
                      animate={inView ? { width: `${m.pct * 100}%` } : {}}
                      transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Alert card */}
            <motion.div
              key={alertIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-primary/[.06] border border-primary/20 rounded-lg p-3 mb-4 mx-1"
            >
              <p className="font-mono text-[.6rem] text-primary/70 mb-1 tracking-[.08em]">ALERTA IA</p>
              <p className="text-[.72rem] text-foreground/80 leading-[1.5]">{alerts[alertIndex]}</p>
            </motion.div>

            {/* Register button */}
            <button
              className={`w-full py-3 rounded-lg font-heading text-[.85rem] tracking-[.06em] transition-all duration-500 ${
                registered
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-primary text-black animate-pulse"
              }`}
            >
              {registered ? "✓ Registrada" : "Registrar Refeição"}
            </button>
          </div>
        </motion.div>

        {/* Features list */}
        <div className="space-y-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
              className="flex gap-4 items-start"
            >
              <span className="text-2xl mt-1">{f.icon}</span>
              <div>
                <h3 className="font-heading text-[1.05rem] text-foreground mb-1">{f.title}</h3>
                <p className="text-[.85rem] text-[#6a6a8a] leading-[1.5]">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingAppDemo;
