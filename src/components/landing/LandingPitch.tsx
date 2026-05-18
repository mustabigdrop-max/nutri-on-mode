import { motion } from "framer-motion";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const FEATURES = [
  {
    code: "PI", color: GOLD, colorRGB: "184,146,42",
    title: "PROTOCOLO INDIVIDUAL",
    headline: "Criado para você. Não para as massas.",
    desc: "GEB, GET, VET calculados. Macro split por objetivo. Ajuste automático por exames, sono, treino e estado muscular.",
    stat: "7 min para ativar o protocolo",
  },
  {
    code: "IA", color: CYAN, colorRGB: "0,212,255",
    title: "IA COMPORTAMENTAL",
    headline: "Age antes do sabotador.",
    desc: "Identifica fome emocional, habitual e por estresse. Aplica TCC nutricional em tempo real. Monitora win rate semanal.",
    stat: "Sua fome nunca foi de comida",
  },
  {
    code: "SP", color: GOLD, colorRGB: "184,146,42",
    title: "STAGE PREP COMPLETO",
    headline: "Do bulk ao palco. Calculado.",
    desc: "Peak Week hora a hora. Flat/Full/Spilled diário. Protocolo farmacológico interpretado. Para todas as categorias.",
    stat: "Top 3 · Men's Physique",
  },
  {
    code: "PE", color: "#7890ff", colorRGB: "120,144,255",
    title: "PERFORMANCE ESPORTIVA",
    headline: "Nutrition para o que você faz.",
    desc: "Carb loading, hidratação e recuperação calibrados para MMA, Crossfit, Running, Natação e qualquer esporte.",
    stat: "PR na São Silvestre",
  },
  {
    code: "LH", color: "#a78bfa", colorRGB: "167,139,250",
    title: "LONGEVIDADE & HORMÔNIOS",
    headline: "Viver mais. Viver melhor.",
    desc: "Marcadores biológicos, otimização hormonal, anti-inflamatório e sono como medicina. Healthspan, não só lifespan.",
    stat: "Protocolo farma + anti-aging",
  },
  {
    code: "CI", color: CYAN, colorRGB: "0,212,255",
    title: "COACH INTEGRADO",
    headline: "Coach humano ou IA. Sempre.",
    desc: "Check-in semanal estruturado. Gantt de fases. PDF com branding. O coach mais bem equipado do Brasil.",
    stat: "Plataforma para profissionais",
  },
];

const Word = ({ children, delay }: { children: React.ReactNode; delay: number }) => (
  <motion.span
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-6%" }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className="inline-block"
  >
    {children}
  </motion.span>
);

const TypewriterLine = ({ text, style, baseDelay }: { text: string; style?: React.CSSProperties; baseDelay: number }) => {
  const words = text.split(" ");
  return (
    <div style={style}>
      {words.map((w, i) => (
        <Word key={i} delay={baseDelay + i * 0.06}>{w}{i < words.length - 1 ? " " : ""}</Word>
      ))}
    </div>
  );
};

const LandingPitch = () => (
  <section
    className="relative py-32 px-6 overflow-hidden"
    style={{ background: "#06060f" }}
  >
    {/* Side lines */}
    <div className="absolute left-0 top-0 bottom-0 w-px pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, rgba(184,146,42,0.06), transparent)" }} />
    <div className="absolute right-0 top-0 bottom-0 w-px pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, rgba(184,146,42,0.06), transparent)" }} />

    <div className="relative max-w-6xl mx-auto">
      {/* Headline block */}
      <div className="text-center mb-24 space-y-2">
        <TypewriterLine
          text="O NUTRION É O ÚNICO SISTEMA"
          style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, lineHeight: 1, fontSize: "clamp(2rem,5vw,5rem)", color: "rgba(245,240,232,0.3)" }}
          baseDelay={0}
        />
        <TypewriterLine
          text="QUE TRATA SEU CORPO"
          style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, lineHeight: 1, fontSize: "clamp(2.5rem,6vw,6rem)", color: "#F5F0E8" }}
          baseDelay={0.25}
        />
        <TypewriterLine
          text="COMO CIÊNCIA."
          style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, lineHeight: 1, fontSize: "clamp(3rem,8vw,8rem)", color: GOLD, textShadow: `0 0 50px rgba(184,146,42,0.55), 0 0 100px rgba(184,146,42,0.25)` }}
          baseDelay={0.55}
        />

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.7, delay: 1, ease: "easeOut" }}
          className="h-px max-w-[400px] mx-auto my-8"
          style={{ background: "linear-gradient(to right, transparent, rgba(184,146,42,0.35), transparent)" }}
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.6, delay: 1.2 }}
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.1rem", fontStyle: "italic", color: "rgba(245,240,232,0.35)" }}
        >
          Não como dieta. Não como castigo.
        </motion.p>
      </div>

      {/* Feature grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-6%" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
        className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-28"
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            variants={{ hidden: { opacity: 0, scale: 0.95, y: 12 }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
            className="relative group overflow-hidden"
            style={{ background: "rgba(6,6,18,.92)", border: `1px solid rgba(${f.colorRGB},0.12)`, padding: "1.5rem 1.75rem", transition: "border-color 0.3s ease" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${f.colorRGB},0.4)`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `rgba(${f.colorRGB},0.12)`; }}
          >
            {/* Top line on hover */}
            <span className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, rgba(${f.colorRGB},0.5), transparent)` }} />

            {/* Hex icon */}
            <div
              className="mb-4 flex items-center justify-center"
              style={{
                width: 40, height: 40,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                background: `rgba(${f.colorRGB},0.08)`,
                border: `1px solid rgba(${f.colorRGB},0.2)`,
              }}
            >
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", fontWeight: 700, color: f.color, letterSpacing: "0.05em" }}>
                {f.code}
              </span>
            </div>

            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.22em", color: f.color, textTransform: "uppercase", marginBottom: 10 }}>
              {f.title}
            </div>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#F5F0E8", marginBottom: 10, lineHeight: 1.2 }}>
              {f.headline}
            </h3>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem", color: "rgba(80,80,122,1)", lineHeight: 1.65, marginBottom: 16 }}>
              {f.desc}
            </p>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.1em", color: f.color, paddingTop: 10, borderTop: `1px solid rgba(${f.colorRGB},0.12)` }}>
              ▸ {f.stat}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Final phrase */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-6%" }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="text-center py-12 relative"
      >
        <div className="hud-corner-tl" style={{ top: 0, left: "10%", opacity: 0.3 }} />
        <div className="hud-corner-br" style={{ bottom: 0, right: "10%", opacity: 0.3 }} />

        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, lineHeight: 1.1, fontSize: "clamp(1.2rem,3vw,2.5rem)", color: "rgba(245,240,232,0.2)", marginBottom: 12 }}>
          Outros apps perguntam o que você comeu.
        </p>
        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, lineHeight: 1.1, fontSize: "clamp(1.5rem,4vw,3.5rem)", color: GOLD, marginBottom: 20, textShadow: `0 0 50px rgba(184,146,42,0.6), 0 0 110px rgba(184,146,42,0.3)` }}>
          O NutriON pergunta por que você comeu.
        </p>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.25em", color: "rgba(80,80,122,0.5)", textTransform: "uppercase" }}>
          MINDSET · COMPORTAMENTO · EXECUÇÃO — MCE
        </div>
      </motion.div>
    </div>
  </section>
);

export default LandingPitch;
