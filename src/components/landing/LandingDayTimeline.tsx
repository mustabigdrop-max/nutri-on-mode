import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const events = [
  { time: "06:30", label: "Despertar", desc: "Plano do dia já na tela. IA ajustou macros com base no sono detectado.", tag: "Circadiano", color: "text-cyan-400" },
  { time: "07:15", label: "Café da manhã", desc: "Protocolo MCE sugere refeição alinhada ao seu cronotipo e treino do dia.", tag: "MCE", color: "text-primary" },
  { time: "10:00", label: "Alerta inteligente", desc: "\"Sua proteína está 20g abaixo. Adicione 1 ovo extra no lanche.\"", tag: "IA Preditiva", color: "text-emerald-400" },
  { time: "12:30", label: "Almoço registrado", desc: "Foto → IA analisa prato → macros calculados em 3 segundos.", tag: "Visão IA", color: "text-violet-400" },
  { time: "15:00", label: "Check-in comportamental", desc: "Nível de fome, emoção e saciedade registrados. Padrão de sabotagem detectado.", tag: "Comportamento", color: "text-orange-400" },
  { time: "18:30", label: "Treino + nutrição", desc: "Pré e pós-treino ajustados automaticamente para o tipo de exercício.", tag: "NutriSync", color: "text-blue-400" },
  { time: "21:00", label: "Jantar otimizado", desc: "Refeição montada para completar metas do dia. Substituições sugeridas.", tag: "Engine", color: "text-primary" },
  { time: "23:00", label: "Fechamento do dia", desc: "Score de consistência calculado. Amanhã já está ajustado pela IA.", tag: "Adaptativo", color: "text-cyan-400" },
];

const LandingDayTimeline = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className="py-24 px-6 md:px-12 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="font-mono text-[.7rem] text-primary tracking-[.25em] uppercase">Um dia com NUTRION</span>
        <h2 className="font-heading text-[clamp(2rem,5vw,4rem)] text-foreground mt-3 leading-[.95]">
          24 horas no <span className="text-primary">modo ON</span>
        </h2>
      </motion.div>

      <div className="max-w-3xl mx-auto relative">
        {/* Vertical line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/30 to-transparent origin-top"
        />

        {events.map((ev, i) => {
          const isLeft = i % 2 === 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.12 * i }}
              className={`relative flex items-start gap-4 mb-8 md:mb-10 ${
                isLeft ? "md:flex-row md:text-right" : "md:flex-row-reverse md:text-left"
              } flex-row text-left`}
            >
              {/* Dot */}
              <div className="absolute left-[24px] md:left-1/2 top-2 w-[9px] h-[9px] rounded-full bg-primary border-2 border-[#03030a] z-10 -translate-x-1/2" style={{ boxShadow: "0 0 12px rgba(232,160,32,.5)" }} />

              {/* Content */}
              <div className={`ml-12 md:ml-0 md:w-[calc(50%-32px)] ${isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"}`}>
                <div className={`flex items-center gap-2 mb-1 ${isLeft ? "md:justify-end" : "md:justify-start"}`}>
                  <span className="font-mono text-[.75rem] text-primary font-bold">{ev.time}</span>
                  <span className={`font-mono text-[.6rem] ${ev.color} tracking-[.08em] uppercase bg-white/[.04] px-2 py-0.5 rounded-full`}>
                    {ev.tag}
                  </span>
                </div>
                <p className="font-heading text-[1rem] text-foreground/90 mb-1">{ev.label}</p>
                <p className="text-[.82rem] text-[#6a6a8a] leading-[1.55]">{ev.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default LandingDayTimeline;
