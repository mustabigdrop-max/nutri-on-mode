import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const events = [
  { time: "06:30", label: "Despertar", desc: "Plano do dia já na tela. IA ajustou macros com base no sono detectado.", tag: "Circadiano", color: CYAN },
  { time: "07:15", label: "Café da manhã", desc: "Protocolo MCE sugere refeição alinhada ao seu cronotipo e treino do dia.", tag: "MCE", color: GOLD },
  { time: "10:00", label: "Alerta inteligente", desc: "\"Sua proteína está 20g abaixo. Adicione 1 ovo extra no lanche.\"", tag: "IA Preditiva", color: "#00c896" },
  { time: "12:30", label: "Almoço registrado", desc: "Foto → IA analisa prato → macros calculados em 3 segundos.", tag: "Visão IA", color: "#a78bfa" },
  { time: "15:00", label: "Check-in comportamental", desc: "Nível de fome, emoção e saciedade registrados. Padrão de sabotagem detectado.", tag: "Comportamento", color: "#ff6b35" },
  { time: "18:30", label: "Treino + nutrição", desc: "Pré e pós-treino ajustados automaticamente para o tipo de exercício.", tag: "NutriSync", color: "#7890ff" },
  { time: "21:00", label: "Jantar otimizado", desc: "Refeição montada para completar metas do dia. Substituições sugeridas.", tag: "Engine", color: GOLD },
  { time: "23:00", label: "Fechamento do dia", desc: "Score de consistência calculado. Amanhã já está ajustado pela IA.", tag: "Adaptativo", color: CYAN },
];

const LandingDayTimeline = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      ref={ref}
      className="relative py-24 px-6 md:px-12 overflow-hidden"
      style={{ background: "rgba(6,6,15,0.98)" }}
    >
      {/* Scan line */}
      <div className="hud-scan-line" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="hud-section-label justify-center mb-4">Um dia com NUTRION</div>
        <h2
          className="font-heading leading-[.95]"
          style={{ fontSize: "clamp(2rem,5vw,4.5rem)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
        >
          <span style={{ color: "#F5F0E8" }}>24 HORAS NO </span>
          <span style={{ color: GOLD, textShadow: `0 0 30px rgba(184,146,42,0.4)` }}>MODO ON</span>
        </h2>
      </motion.div>

      <div className="max-w-3xl mx-auto relative">
        {/* Vertical line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px origin-top"
          style={{ background: `linear-gradient(to bottom, rgba(184,146,42,0.6), rgba(184,146,42,0.2), transparent)` }}
        />

        {events.map((ev, i) => {
          const isLeft = i % 2 === 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className={`relative flex items-start gap-4 mb-8 md:mb-10 ${
                isLeft ? "md:flex-row md:text-right" : "md:flex-row-reverse md:text-left"
              } flex-row text-left`}
            >
              {/* Timeline dot */}
              <div
                className="absolute left-[24px] md:left-1/2 top-2 z-10 -translate-x-1/2"
                style={{ width: 9, height: 9, borderRadius: "50%", background: ev.color, boxShadow: `0 0 10px ${ev.color}` }}
              />

              {/* Content card */}
              <div className={`ml-12 md:ml-0 md:w-[calc(50%-32px)] ${isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"}`}>
                <div
                  className="relative overflow-hidden p-4 group"
                  style={{ background: "rgba(10,10,26,0.8)", border: `1px solid rgba(184,146,42,0.08)`, transition: "border-color 0.3s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(184,146,42,0.25)`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = `rgba(184,146,42,0.08)`)}
                >
                  <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ev.color}44, transparent)` }} />

                  <div className={`flex items-center gap-2 mb-2 ${isLeft ? "md:justify-end" : "md:justify-start"}`}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", fontWeight: 700, color: GOLD }}>{ev.time}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: ev.color, background: `${ev.color}12`, border: `1px solid ${ev.color}30`, padding: "0.15rem 0.4rem" }}>
                      {ev.tag}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#F5F0E8", marginBottom: 4 }}>{ev.label}</p>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem", color: "rgba(80,80,122,0.85)", lineHeight: 1.6 }}>{ev.desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default LandingDayTimeline;
