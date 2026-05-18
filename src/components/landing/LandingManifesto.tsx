import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const cards = [
  {
    code: "01", tag: "NUTRI = CIÊNCIA",
    desc: "Cálculo energético GEB/GET/VET, fórmulas de Harris-Benedict e Katch-McArdle, 10 protocolos baseados em evidência, banco TACO/IBGE, análise de exames e microbioma.",
    color: GOLD, colorRGB: "184,146,42",
  },
  {
    code: "02", tag: "ON = EXECUÇÃO",
    desc: "Notificação às 7h com o plano do dia, refeições prontas com 1 toque, gamificação que gera hábito, coach humano integrado, IA comportamental que age antes do erro.",
    color: CYAN, colorRGB: "0,212,255",
  },
  {
    code: "03", tag: "24H = RESULTADO",
    desc: "Cronobiologia ajusta macros por horário, wearables sincronizam o gasto real, sono recalibra o plano da manhã, termômetro emocional monitora o comportamento à noite.",
    color: GOLD, colorRGB: "184,146,42",
  },
];

const LandingManifesto = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      className="relative px-6 md:px-12 py-[100px] overflow-hidden"
      style={{
        background: "rgba(10,10,26,0.97)",
        borderTop: "1px solid rgba(184,146,42,0.08)",
        borderBottom: "1px solid rgba(184,146,42,0.08)",
      }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(184,146,42,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,146,42,.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial center glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: 800, height: 400, background: "radial-gradient(ellipse, rgba(184,146,42,0.04) 0%, transparent 70%)" }}
      />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="max-w-[880px] mx-auto relative z-10"
      >
        <div className="hud-section-label mb-6">O que é o NUTRION</div>

        <div
          className="font-heading leading-[1.1] mb-12"
          style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.8rem)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
        >
          <span style={{ color: "#F5F0E8" }}>Execução sem planejamento é </span>
          <span style={{ color: GOLD, textShadow: `0 0 30px rgba(184,146,42,0.4)` }}>sofrimento.</span>
          <br />
          <span style={{ color: "#F5F0E8" }}>Planejamento sem execução é só </span>
          <span style={{ color: GOLD, textShadow: `0 0 30px rgba(184,146,42,0.4)` }}>opinião.</span>
        </div>

        {/* Problem / Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {[
            {
              label: "[PROBLEMA]", color: GOLD, colorRGB: "184,146,42",
              content: "Todo mundo já fez dieta. Todo mundo já começou uma semana certinho. E todo mundo já abandonou na terceira semana sem saber exatamente por quê.",
              emphasis: "Não é fraqueza. É falta de sistema.",
              strong: "Motivação vai embora. Estrutura fica.",
              strongColor: "#F5F0E8",
            },
            {
              label: "[SOLUÇÃO]", color: CYAN, colorRGB: "0,212,255",
              content: "O nutriON é o único app construído com a mentalidade de quem vive isso — nutrition coach, bodybuilder e Analista em comportamento humano.",
              emphasis: "Porque resultado não vem de inspiração. Vem de protocolo.",
              strong: "Isso não é mais um app de dieta. É o sistema que faltava.",
              strongColor: GOLD,
            },
          ].map((block) => (
            <div
              key={block.label}
              className="relative group overflow-hidden"
              style={{
                background: "rgba(10,10,26,0.8)",
                border: `1px solid rgba(${block.colorRGB},0.12)`,
                padding: "1.75rem",
                transition: "border-color 0.3s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(${block.colorRGB},0.3)`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = `rgba(${block.colorRGB},0.12)`)}
            >
              <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(${block.colorRGB},0.4), transparent)` }} />
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.22em", color: `rgba(${block.colorRGB},0.6)`, textTransform: "uppercase", marginBottom: 14 }}>
                {block.label}
              </div>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.88rem", color: "rgba(80,80,122,1)", lineHeight: 1.8, marginBottom: 12 }}>
                {block.content}
              </p>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.88rem", color: "rgba(80,80,122,1)", lineHeight: 1.8, marginBottom: 12 }}>
                <span style={{ color: "rgba(245,240,232,0.7)" }}>{block.emphasis}</span>
              </p>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.9rem", color: block.strongColor, lineHeight: 1.6, fontWeight: 600 }}>
                {block.strong}
              </p>
              <span className="absolute bottom-2 right-2 w-3.5 h-3.5" style={{ borderBottom: `1px solid rgba(${block.colorRGB},0.2)`, borderRight: `1px solid rgba(${block.colorRGB},0.2)` }} />
            </div>
          ))}
        </div>

        {/* Pillar cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "rgba(184,146,42,0.06)" }}>
          {cards.map((card, i) => (
            <motion.div
              key={card.tag}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
              className="relative group overflow-hidden"
              style={{ background: "#0a0a1a", padding: "1.75rem" }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, rgba(${card.colorRGB},0.5), transparent)`, opacity: 0.5 }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }}
              />

              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "3.5rem", color: "rgba(184,146,42,0.06)", lineHeight: 1, position: "absolute", top: 8, right: 12, userSelect: "none" }}>
                {card.code}
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.15em", color: card.color, textTransform: "uppercase", marginBottom: 14, textShadow: `0 0 12px ${card.color}55` }}>
                {card.tag}
              </div>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem", color: "rgba(80,80,122,1)", lineHeight: 1.7 }}>
                {card.desc}
              </p>
              <span className="absolute bottom-2 right-2 w-3 h-3" style={{ borderBottom: `1px solid rgba(${card.colorRGB},0.15)`, borderRight: `1px solid rgba(${card.colorRGB},0.15)` }} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default LandingManifesto;
