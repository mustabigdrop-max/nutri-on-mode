import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const features = [
  { code: "IA", id: "F-01", title: "IA lê seus exames", desc: "Upload do exame de sangue. IA interpreta ferro, vitamina D, colesterol, TSH, glicemia e ajusta o plano automaticamente.", color: GOLD },
  { code: "CB", id: "F-02", title: "Cronobiologia", desc: "Janelas de macros por horário baseadas no ritmo circadiano. Carbo pela manhã, gordura à noite. Jejum calculado.", color: CYAN },
  { code: "SN", id: "F-03", title: "Sono + Recuperação", desc: "Dormiu mal → app aumenta proteína e magnésio do dia seguinte automaticamente. Correlação sono × comportamento.", color: GOLD },
  { code: "NC", id: "F-04", title: "Nutrição Comportamental", desc: "Escala de fome, diário emocional, Mindful Eating, desafios de TCC, entrevista motivacional. Ciência real.", color: CYAN },
  { code: "SS", id: "F-05", title: "Stack de Suplementação", desc: "IA monta seu stack personalizado por objetivo + exames. Dose certa, horário certo, evidência científica.", color: GOLD },
  { code: "MB", id: "F-06", title: "Perfil de Microbioma", desc: "Questionário científico gera 4 dimensões do seu intestino. Plano ajustado com prebióticos e probióticos.", color: CYAN },
  { code: "DF", id: "F-07", title: "Diário Fotográfico", desc: "Slider antes × depois em tempo real. IA analisa sequência de fotos e gera relatório de evolução visual.", color: GOLD },
  { code: "GM", id: "F-08", title: "Gamificação Real", desc: "XP por refeição, streak de dias consecutivos, níveis Iniciante → Lenda, badges, ranking semanal.", color: CYAN },
  { code: "LC", id: "F-09", title: "Lista + Custo da Dieta", desc: "Lista de compras automática pelo plano semanal. Calculadora de custo por refeição. Substitutos com mesmo macro.", color: GOLD },
];

const LandingFeatures = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      id="features"
      className="relative px-6 md:px-12 py-28 overflow-hidden"
      style={{ background: "rgba(8,8,20,0.95)" }}
    >
      {/* Scan line */}
      <div className="hud-scan-line" />

      {/* Corner brackets */}
      <div className="hud-corner-tl" style={{ top: 24, left: 24, opacity: 0.5 }} />
      <div className="hud-corner-tr" style={{ top: 24, right: 24, opacity: 0.5 }} />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="mb-16"
      >
        <div className="hud-section-label mb-4">
          O que o NutriON entrega
        </div>
        <h2
          className="font-heading leading-[0.9]"
          style={{ fontSize: "clamp(2.8rem, 7vw, 7rem)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
        >
          <span style={{ color: "#F5F0E8" }}>FUNCIONA</span>
          <br />
          <span style={{ color: GOLD, textShadow: `0 0 40px rgba(184,146,42,0.35)` }}>DE VERDADE.</span>
        </h2>
      </motion.div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "rgba(184,146,42,0.08)" }}>
        {features.map((feat, i) => (
          <motion.div
            key={feat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="relative group p-7 overflow-hidden"
            style={{ background: "#0a0a1a" }}
          >
            {/* Top line on hover */}
            <span
              className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              style={{ background: `linear-gradient(90deg, transparent, ${feat.color}, transparent)` }}
            />
            {/* Left bar on hover */}
            <span
              className="absolute left-0 top-0 bottom-0 w-px transition-opacity duration-300 opacity-0 group-hover:opacity-60"
              style={{ background: feat.color }}
            />

            {/* Header row */}
            <div className="flex items-start justify-between mb-5">
              {/* Hex-style icon */}
              <div
                className="flex items-center justify-center"
                style={{
                  width: 40, height: 40,
                  background: `rgba(${feat.color === GOLD ? "184,146,42" : "0,212,255"},0.08)`,
                  border: `1px solid ${feat.color}33`,
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  transition: "background 0.3s",
                }}
              >
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", fontWeight: 700, color: feat.color, letterSpacing: "0.05em" }}>
                  {feat.code}
                </span>
              </div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.15em", color: "rgba(80,80,122,0.6)" }}>
                {feat.id}
              </span>
            </div>

            <div
              className="font-heading text-[1.2rem] tracking-[.04em] mb-2.5"
              style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, color: "#F5F0E8" }}
            >
              {feat.title}
            </div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.8rem", color: "rgba(80,80,122,1)", lineHeight: 1.7 }}>
              {feat.desc}
            </p>

            {/* Corner bracket */}
            <span
              className="absolute bottom-2.5 right-2.5 w-4 h-4 transition-opacity duration-300 opacity-20 group-hover:opacity-60"
              style={{ borderBottom: `1px solid ${feat.color}`, borderRight: `1px solid ${feat.color}` }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default LandingFeatures;
