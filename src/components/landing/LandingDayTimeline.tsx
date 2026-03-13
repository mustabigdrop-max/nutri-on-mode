import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const TIMELINE = [
  {
    time: "06:30",
    icon: "🌅",
    event: "Você acorda",
    action: "Notificação já na tela com plano completo do dia",
    tag: "PLANO DO DIA",
    tagColor: "#e8a020",
    detail: "GEB · macros · protocolos · janelas de refeição",
    side: "right",
  },
  {
    time: "07:00",
    icon: "🍳",
    event: "Café da manhã",
    action: "1 toque para registrar. App calcula e desconta dos macros.",
    tag: "JANELA ANABÓLICA",
    tagColor: "#00f0b4",
    detail: "Carboidrato alto pela manhã — cronobiologia aplicada",
    side: "left",
  },
  {
    time: "10:00",
    icon: "🧃",
    event: "Lanche",
    action: "IA sugere baseado no ritmo circadiano e no seu objetivo",
    tag: "CRONOBIOLOGIA",
    tagColor: "#7890ff",
    detail: "Lanche correto no horário certo, sem pensar",
    side: "right",
  },
  {
    time: "12:30",
    icon: "🥗",
    event: "Almoço",
    action: "Maior refeição do dia. Sugestão com banco TACO completo.",
    tag: "PICO METABÓLICO",
    tagColor: "#e8a020",
    detail: "Score calórico automático. Dentro do protocolo.",
    side: "left",
  },
  {
    time: "17:00",
    icon: "⚡",
    event: "Pré-treino",
    action: "NutriSync calcula macros para performance máxima",
    tag: "NUTRISYNC",
    tagColor: "#00f0b4",
    detail: "Carboidrato estratégico para o seu tipo de treino",
    side: "right",
  },
  {
    time: "18:30",
    icon: "💪",
    event: "Pós-treino",
    action: "Alerta: janela anabólica de 30 min. App lembra com o que comer.",
    tag: "JANELA 30 MIN",
    tagColor: "#ff4499",
    detail: "2.2g/kg de proteína garantidos no dia",
    side: "left",
  },
  {
    time: "21:00",
    icon: "🌙",
    event: "Jantar",
    action: "Proteína + gordura. Carboidrato mínimo. Jejum noturno inicia.",
    tag: "JEJUM CIRCADIANO",
    tagColor: "#7890ff",
    detail: "Janela alimentar fechada até 06:30",
    side: "right",
  },
  {
    time: "23:00",
    icon: "📊",
    event: "Análise do dia",
    action: "IA processa o dia inteiro. Amanhã já está ajustado.",
    tag: "IA ADAPTATIVA",
    tagColor: "#00f0b4",
    detail: "Score, streak, XP ganho. Você foi ON hoje.",
    side: "left",
  },
];

const LandingDayTimeline = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-[120px] overflow-hidden"
      style={{ background: "linear-gradient(180deg, #03030a 0%, #060612 50%, #03030a 100%)" }}
    >
      {/* Vertical timeline line — center */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
        className="absolute left-1/2 top-[180px] bottom-[120px] w-px origin-top hidden md:block pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(232,160,32,.2) 8%, rgba(232,160,32,.12) 92%, transparent)" }}
      />

      <div className="max-w-[900px] mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2.5 mb-5 border border-[#00f0b4]/12 bg-[#00f0b4]/[.03] px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0b4]" style={{ boxShadow: "0 0 6px rgba(0,240,180,.9)" }} />
            <span className="font-mono text-[.58rem] text-[#00f0b4]/70 tracking-[.2em] uppercase">Um dia com NUTRION</span>
          </div>
          <h2
            className="font-heading leading-[.9] mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
          >
            <span className="text-[#f0edf8]">24 HORAS.</span>
            <br />
            <span style={{ color: "#e8a020", textShadow: "0 0 35px rgba(232,160,32,.4)" }}>ZERO ACHISMO.</span>
          </h2>
          <p className="text-[#60607a] font-landing text-[.9rem] max-w-[400px] mx-auto">
            Isso é o que acontece quando você troca intenção por protocolo.
          </p>
        </motion.div>

        {/* Timeline items */}
        <div className="flex flex-col gap-6">
          {TIMELINE.map((item, i) => {
            const isRight = item.side === "right";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isRight ? 30 : -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.15 + i * 0.09 }}
                className={`grid items-center gap-4 ${
                  isRight
                    ? "grid-cols-1 md:grid-cols-[1fr_32px_1fr]"
                    : "grid-cols-1 md:grid-cols-[1fr_32px_1fr]"
                }`}
              >
                {/* Left cell */}
                <div className={isRight ? "hidden md:block" : ""}>
                  {!isRight && (
                    <div
                      className="border border-[#e8a020]/08 rounded-[3px] p-4 text-right ml-auto"
                      style={{
                        background: "rgba(232,160,32,.022)",
                        maxWidth: "360px",
                      }}
                    >
                      <div className="font-heading text-[2.2rem] text-[#e8a020]/20 leading-none mb-1">{item.time}</div>
                      <div className="font-heading text-[1rem] text-[#f0edf8]/75 mb-1.5">{item.event}</div>
                      <p className="font-landing text-[.78rem] text-[#8080a0] leading-[1.6] mb-3">{item.action}</p>
                      <div className="flex items-center gap-2 justify-end">
                        <span
                          className="font-mono text-[.5rem] tracking-[.14em] px-2 py-1 rounded-[2px]"
                          style={{
                            color: item.tagColor,
                            background: `${item.tagColor}12`,
                            border: `1px solid ${item.tagColor}25`,
                          }}
                        >
                          {item.tag}
                        </span>
                      </div>
                      <div className="font-mono text-[.55rem] text-[#404060] mt-2">{item.detail}</div>
                    </div>
                  )}
                </div>

                {/* Center dot */}
                <div className="flex items-center justify-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[.9rem] flex-shrink-0 relative"
                    style={{
                      background: "#060612",
                      border: `1px solid ${item.tagColor}35`,
                      boxShadow: `0 0 16px ${item.tagColor}18`,
                    }}
                  >
                    {item.icon}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${item.tagColor}10, transparent)`,
                      }}
                    />
                  </div>
                </div>

                {/* Right cell */}
                <div className={!isRight ? "hidden md:block" : ""}>
                  {isRight && (
                    <div
                      className="border border-[#e8a020]/08 rounded-[3px] p-4"
                      style={{
                        background: "rgba(232,160,32,.022)",
                        maxWidth: "360px",
                      }}
                    >
                      <div className="font-heading text-[2.2rem] text-[#e8a020]/20 leading-none mb-1">{item.time}</div>
                      <div className="font-heading text-[1rem] text-[#f0edf8]/75 mb-1.5">{item.event}</div>
                      <p className="font-landing text-[.78rem] text-[#8080a0] leading-[1.6] mb-3">{item.action}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-[.5rem] tracking-[.14em] px-2 py-1 rounded-[2px]"
                          style={{
                            color: item.tagColor,
                            background: `${item.tagColor}12`,
                            border: `1px solid ${item.tagColor}25`,
                          }}
                        >
                          {item.tag}
                        </span>
                      </div>
                      <div className="font-mono text-[.55rem] text-[#404060] mt-2">{item.detail}</div>
                    </div>
                  )}

                  {/* Mobile: show all on right */}
                  <div className="md:hidden">
                    <div
                      className="border border-[#e8a020]/08 rounded-[3px] p-4"
                      style={{ background: "rgba(232,160,32,.022)" }}
                    >
                      <div className="font-heading text-[1.8rem] text-[#e8a020]/20 leading-none mb-1">{item.time}</div>
                      <div className="font-heading text-[.95rem] text-[#f0edf8]/75 mb-1.5">{item.event}</div>
                      <p className="font-landing text-[.75rem] text-[#8080a0] leading-[1.6] mb-3">{item.action}</p>
                      <span
                        className="font-mono text-[.48rem] tracking-[.12em] px-2 py-1 rounded-[2px] inline-block"
                        style={{
                          color: item.tagColor,
                          background: `${item.tagColor}12`,
                          border: `1px solid ${item.tagColor}25`,
                        }}
                      >
                        {item.tag}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* End state */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 text-center"
        >
          <div
            className="inline-block border border-[#e8a020]/20 bg-[#e8a020]/[.05] px-8 py-5 rounded-[3px]"
            style={{ boxShadow: "0 0 40px rgba(232,160,32,.06)" }}
          >
            <div className="font-heading text-[2.5rem] text-[#e8a020] mb-1" style={{ textShadow: "0 0 20px rgba(232,160,32,.4)" }}>
              +1 DIA ON
            </div>
            <div className="font-mono text-[.6rem] text-[#60607a] tracking-[.15em] uppercase">
              streak · xp · score metabólico · amanhã já planejado
            </div>
          </div>
          <p className="mt-6 font-landing text-[.85rem] text-[#404060]">
            Isso é o que separa quem chega de quem desiste.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingDayTimeline;
