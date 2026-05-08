import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: "⚡",
    color: "#e8a020",
    headline: "Criado para você. Não para as massas.",
    title: "PROTOCOLO INDIVIDUAL",
    desc: "GEB, GET, VET calculados. Macro split por objetivo. Ajuste automático por exames, sono, treino e estado muscular.",
    stat: "7 min para ativar o protocolo",
  },
  {
    icon: "🧠",
    color: "#00f0b4",
    headline: "Age antes do sabotador.",
    title: "IA COMPORTAMENTAL",
    desc: "Identifica fome emocional, habitual e por estresse. Aplica TCC nutricional em tempo real. Monitora win rate semanal.",
    stat: "Sua fome nunca foi de comida",
  },
  {
    icon: "🏆",
    color: "#e8a020",
    headline: "Do bulk ao palco. Calculado.",
    title: "STAGE PREP COMPLETO",
    desc: "Peak Week hora a hora. Flat/Full/Spilled diário. Protocolo farmacológico interpretado. Para todas as categorias.",
    stat: "Top 3 · Men's Physique · G.T.",
  },
  {
    icon: "⚡",
    color: "#7890ff",
    headline: "Nutrition para o que você faz.",
    title: "PERFORMANCE ESPORTIVA",
    desc: "Carb loading, hidratação e recuperação calibrados para MMA, Crossfit, Running, Natação e qualquer esporte.",
    stat: "PR na São Silvestre · R.M.",
  },
  {
    icon: "🧬",
    color: "#a78bfa",
    headline: "Viver mais. Viver melhor.",
    title: "LONGEVIDADE & HORMÔNIOS",
    desc: "Marcadores biológicos, otimização hormonal, anti-inflamatório e sono como medicina. Healthspan, não só lifespan.",
    stat: "Protocolo farma + anti-aging",
  },
  {
    icon: "👨‍⚕️",
    color: "#00f0b4",
    headline: "Coach humano ou IA. Sempre.",
    title: "COACH INTEGRADO",
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

const TypewriterLine = ({
  text,
  className,
  baseDelay,
  style,
}: {
  text: string;
  className: string;
  baseDelay: number;
  style?: React.CSSProperties;
}) => {
  const words = text.split(" ");
  return (
    <div className={className} style={style}>
      {words.map((w, i) => (
        <Word key={i} delay={baseDelay + i * 0.06}>
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </Word>
      ))}
    </div>
  );
};

const LandingPitch = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-[#030308]">
      {/* side gradients */}
      <div
        className="absolute left-0 top-0 bottom-0 w-px pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(232,160,32,.06), transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-px pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(232,160,32,.06), transparent)" }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* BLOCO 1 — DECLARAÇÃO */}
        <div className="text-center mb-24 space-y-3">
          <TypewriterLine
            text="O NUTRION É O ÚNICO SISTEMA"
            className="font-heading leading-[1] text-[#f0edf8]/40"
            style={{ fontSize: "clamp(2rem,5vw,5rem)" }}
            baseDelay={0}
          />
          <TypewriterLine
            text="QUE TRATA SEU CORPO"
            className="font-heading leading-[1] text-[#f0edf8]"
            style={{ fontSize: "clamp(2.5rem,6vw,6rem)" }}
            baseDelay={0.25}
          />
          <TypewriterLine
            text="COMO CIÊNCIA."
            className="font-heading leading-[1]"
            style={{
              fontSize: "clamp(3rem,8vw,8rem)",
              color: "#e8a020",
              textShadow: "0 0 50px rgba(232,160,32,.55), 0 0 100px rgba(232,160,32,.25)",
            }}
            baseDelay={0.55}
          />

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: "-6%" }}
            transition={{ duration: 0.7, delay: 1, ease: "easeOut" }}
            className="h-px max-w-[400px] mx-auto my-8"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(232,160,32,.3), transparent)",
            }}
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-6%" }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="font-landing italic text-[#f0edf8]/45"
            style={{ fontSize: "1.1rem" }}
          >
            Não como dieta. Não como castigo.
          </motion.p>
        </div>

        {/* BLOCO 2 — GRID */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-6%" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
          }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-28"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 12 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
              whileHover={{ scale: 1.02 }}
              className="group relative p-6 sm:p-7 rounded-2xl backdrop-blur-sm transition-all duration-300"
              style={{
                background: "rgba(6,6,18,.9)",
                border: `1px solid ${f.color}28`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${f.color}66`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${f.color}1f`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${f.color}28`;
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                className="text-[3rem] leading-none mb-4"
                style={{ color: f.color, filter: `drop-shadow(0 0 14px ${f.color}55)` }}
              >
                {f.icon}
              </div>
              <div
                className="font-mono text-[.55rem] tracking-[.22em] mb-3"
                style={{ color: f.color }}
              >
                {f.title}
              </div>
              <h3 className="font-heading text-[1.1rem] sm:text-[1.2rem] text-[#f0edf8] mb-3 leading-tight">
                {f.headline}
              </h3>
              <p className="font-landing text-[.78rem] sm:text-[.82rem] text-[#f0edf8]/55 leading-relaxed mb-5">
                {f.desc}
              </p>
              <div
                className="font-mono text-[.6rem] tracking-wider pt-3 border-t"
                style={{ color: f.color, borderColor: `${f.color}18` }}
              >
                ▸ {f.stat}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* BLOCO 3 — FRASE DEFINITIVA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="text-center py-12"
        >
          <p
            className="font-heading leading-tight text-[#f0edf8]/20 mb-3"
            style={{ fontSize: "clamp(1.2rem,3vw,2.5rem)" }}
          >
            Outros apps perguntam o que você comeu.
          </p>
          <p
            className="font-heading leading-tight mb-8"
            style={{
              fontSize: "clamp(1.5rem,4vw,3.5rem)",
              color: "#e8a020",
              textShadow: "0 0 50px rgba(232,160,32,.6), 0 0 110px rgba(232,160,32,.3)",
            }}
          >
            O NutriON pergunta por que você comeu.
          </p>
          <div className="font-mono text-[.6rem] text-[#404060] tracking-[.2em]">
            MINDSET · COMPORTAMENTO · EXECUÇÃO — MCE
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingPitch;
