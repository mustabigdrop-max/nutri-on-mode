import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

/* ── Pilares ── */
const pillars = [
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

/* ── Features ── */
const features = [
  { code: "PI", color: GOLD, colorRGB: "184,146,42", title: "PROTOCOLO INDIVIDUAL", headline: "Criado para você. Não para as massas.", desc: "GEB, GET, VET calculados. Macro split por objetivo. Ajuste automático por exames, sono, treino e estado muscular.", stat: "7 min para ativar o protocolo" },
  { code: "IA", color: CYAN, colorRGB: "0,212,255",  title: "IA COMPORTAMENTAL",    headline: "Age antes do sabotador.",             desc: "Identifica fome emocional, habitual e por estresse. Aplica TCC nutricional em tempo real. Monitora win rate semanal.", stat: "Sua fome nunca foi de comida" },
  { code: "SP", color: GOLD, colorRGB: "184,146,42", title: "STAGE PREP COMPLETO",  headline: "Do bulk ao palco. Calculado.",         desc: "Peak Week hora a hora. Flat/Full/Spilled diário. Protocolo farmacológico interpretado. Para todas as categorias.", stat: "Top 3 · Men's Physique" },
  { code: "PE", color: "#7890ff", colorRGB: "120,144,255", title: "PERFORMANCE ESPORTIVA", headline: "Nutrition para o que você faz.", desc: "Carb loading, hidratação e recuperação calibrados para MMA, Crossfit, Running, Natação e qualquer esporte.", stat: "PR na São Silvestre" },
  { code: "LH", color: "#a78bfa", colorRGB: "167,139,250", title: "LONGEVIDADE & HORMÔNIOS", headline: "Viver mais. Viver melhor.", desc: "Marcadores biológicos, otimização hormonal, anti-inflamatório e sono como medicina. Healthspan, não só lifespan.", stat: "Protocolo farma + anti-aging" },
  { code: "CI", color: CYAN, colorRGB: "0,212,255",  title: "COACH INTEGRADO",      headline: "Coach humano ou IA. Sempre.",         desc: "Check-in semanal estruturado. Gantt de fases. PDF com branding. O coach mais bem equipado do Brasil.", stat: "Plataforma para profissionais" },
];

/* ── MCE ── */
const mce = [
  { letter: "M", label: "MINDSET",      title: "Protocolo bate motivação.",               desc: "Todo mundo começa motivado. Quem chega ao fim tem sistema." },
  { letter: "C", label: "COMPORTAMENTO", title: "Hábito é mais forte que força de vontade.", desc: "IA que identifica padrões e age antes do sabotador." },
  { letter: "E", label: "EXECUÇÃO",     title: "Plano sem execução é fantasia.",            desc: "Protocolo individual, ajuste automático, coach em tempo real." },
];

const Word = ({ children, delay }: { children: React.ReactNode; delay: number }) => (
  <motion.span
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-6%" }}
    transition={{ duration: 0.45, delay, ease: "easeOut" }}
    className="inline-block"
  >
    {children}
  </motion.span>
);

const TypeLine = ({ text, style, baseDelay }: { text: string; style?: React.CSSProperties; baseDelay: number }) => (
  <div style={style}>
    {text.split(" ").map((w, i, arr) => (
      <Word key={i} delay={baseDelay + i * 0.055}>{w}{i < arr.length - 1 ? " " : ""}</Word>
    ))}
  </div>
);

const LandingManifesto = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "rgba(8,8,20,0.98)", borderTop: "1px solid rgba(184,146,42,0.08)" }}
    >
      {/* ── BLOCO 1: Declaração central ── */}
      <div className="relative px-6 md:px-12 py-28 text-center overflow-hidden">
        <div className="hud-scan-line" />
        <div className="hud-corner-tl" style={{ top: 32, left: 32, opacity: 0.4 }} />
        <div className="hud-corner-tr" style={{ top: 32, right: 32, opacity: 0.4 }} />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: 700, height: 350, background: "radial-gradient(ellipse, rgba(184,146,42,0.05) 0%, transparent 70%)" }} />

        <div className="relative z-10 space-y-2 mb-10">
          <TypeLine text="O NUTRION É O ÚNICO SISTEMA"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, lineHeight: 1, fontSize: "clamp(1.8rem,4.5vw,4.5rem)", color: "rgba(245,240,232,0.3)" }}
            baseDelay={0} />
          <TypeLine text="QUE TRATA SEU CORPO"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, lineHeight: 1, fontSize: "clamp(2.2rem,5.5vw,5.5rem)", color: "#F5F0E8" }}
            baseDelay={0.2} />
          <TypeLine text="COMO CIÊNCIA."
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, lineHeight: 1, fontSize: "clamp(2.8rem,7vw,7rem)", color: GOLD, textShadow: `0 0 60px rgba(184,146,42,0.5), 0 0 120px rgba(184,146,42,0.2)` }}
            baseDelay={0.45} />
        </div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="h-px max-w-sm mx-auto mb-8"
          style={{ background: "linear-gradient(90deg, transparent, rgba(184,146,42,0.4), transparent)" }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.1 }}
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1rem", fontStyle: "italic", color: "rgba(245,240,232,0.35)" }}
        >
          Não como dieta. Não como castigo.
        </motion.p>
      </div>

      {/* ── BLOCO 2: Problema / Solução ── */}
      <div
        ref={ref}
        className="relative px-6 md:px-12 pb-24"
        style={{ borderTop: "1px solid rgba(184,146,42,0.06)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="hud-section-label mb-8 pt-16">O que é o NUTRION</div>

          <div
            className="font-heading leading-[1.1] mb-12"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.6rem)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
          >
            <span style={{ color: "#F5F0E8" }}>Execução sem planejamento é </span>
            <span style={{ color: GOLD, textShadow: `0 0 30px rgba(184,146,42,0.4)` }}>sofrimento.</span>
            <br />
            <span style={{ color: "#F5F0E8" }}>Planejamento sem execução é só </span>
            <span style={{ color: GOLD, textShadow: `0 0 30px rgba(184,146,42,0.4)` }}>opinião.</span>
          </div>

          {/* Problema / Solução */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
            {[
              {
                label: "[PROBLEMA]", colorRGB: "184,146,42", color: GOLD,
                lines: [
                  "Todo mundo já fez dieta. Todo mundo já começou uma semana certinho. E todo mundo já abandonou na terceira semana sem saber exatamente por quê.",
                  "Não é fraqueza. É falta de sistema.",
                ],
                strong: "Motivação vai embora. Estrutura fica.",
                strongColor: "#F5F0E8",
              },
              {
                label: "[SOLUÇÃO]", colorRGB: "0,212,255", color: CYAN,
                lines: [
                  "O nutriON é o único app construído com a mentalidade de quem vive isso — nutrition coach, bodybuilder e Analista em comportamento humano.",
                  "Porque resultado não vem de inspiração. Vem de protocolo.",
                ],
                strong: "Isso não é mais um app de dieta. É o sistema que faltava.",
                strongColor: GOLD,
              },
            ].map((block) => (
              <div
                key={block.label}
                className="relative overflow-hidden group"
                style={{ background: "rgba(10,10,26,0.8)", border: `1px solid rgba(${block.colorRGB},0.12)`, padding: "1.75rem", transition: "border-color 0.3s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(${block.colorRGB},0.3)`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = `rgba(${block.colorRGB},0.12)`)}
              >
                <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(${block.colorRGB},0.45), transparent)` }} />
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.22em", color: `rgba(${block.colorRGB},0.6)`, textTransform: "uppercase", marginBottom: 14 }}>{block.label}</div>
                {block.lines.map((l, i) => (
                  <p key={i} style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.88rem", color: "rgba(80,80,122,1)", lineHeight: 1.8, marginBottom: 10 }}>{l}</p>
                ))}
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.9rem", color: block.strongColor, lineHeight: 1.6, fontWeight: 600 }}>{block.strong}</p>
                <span className="absolute bottom-2 right-2 w-3.5 h-3.5" style={{ borderBottom: `1px solid rgba(${block.colorRGB},0.2)`, borderRight: `1px solid rgba(${block.colorRGB},0.2)` }} />
              </div>
            ))}
          </div>

          {/* Pillar cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px mb-16" style={{ background: "rgba(184,146,42,0.06)" }}>
            {pillars.map((card, i) => (
              <motion.div
                key={card.tag}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="relative group overflow-hidden"
                style={{ background: "#0a0a1a", padding: "1.75rem" }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-50" style={{ background: `linear-gradient(90deg, transparent, rgba(${card.colorRGB},0.5), transparent)` }} />
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }} />
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "3.5rem", color: "rgba(184,146,42,0.05)", lineHeight: 1, position: "absolute", top: 8, right: 12, userSelect: "none" }}>{card.code}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.15em", color: card.color, textTransform: "uppercase", marginBottom: 14, textShadow: `0 0 12px ${card.color}55` }}>{card.tag}</div>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem", color: "rgba(80,80,122,1)", lineHeight: 1.7 }}>{card.desc}</p>
                <span className="absolute bottom-2 right-2 w-3 h-3" style={{ borderBottom: `1px solid rgba(${card.colorRGB},0.15)`, borderRight: `1px solid rgba(${card.colorRGB},0.15)` }} />
              </motion.div>
            ))}
          </div>

          {/* Feature grid */}
          <div className="hud-section-label mb-8">Para quem é o nutriON</div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-6%" }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-px mb-16"
            style={{ background: "rgba(184,146,42,0.06)" }}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } }}
                className="relative group overflow-hidden"
                style={{ background: "#0a0a1a", border: "none", padding: "1.5rem 1.75rem", transition: "background 0.3s" }}
                onMouseEnter={e => (e.currentTarget.style.background = `rgba(${f.colorRGB},0.03)`)}
                onMouseLeave={e => (e.currentTarget.style.background = "#0a0a1a")}
              >
                <span className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, rgba(${f.colorRGB},0.5), transparent)` }} />
                <div className="mb-4 flex items-center justify-center" style={{ width: 38, height: 38, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", background: `rgba(${f.colorRGB},0.08)`, border: `1px solid rgba(${f.colorRGB},0.2)` }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", fontWeight: 700, color: f.color, letterSpacing: "0.05em" }}>{f.code}</span>
                </div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.2em", color: f.color, textTransform: "uppercase", marginBottom: 8 }}>{f.title}</div>
                <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#F5F0E8", marginBottom: 8, lineHeight: 1.2 }}>{f.headline}</h3>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.76rem", color: "rgba(80,80,122,1)", lineHeight: 1.65, marginBottom: 12 }}>{f.desc}</p>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.1em", color: f.color, paddingTop: 8, borderTop: `1px solid rgba(${f.colorRGB},0.1)` }}>▸ {f.stat}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* MCE methodology */}
          <div style={{ borderTop: "1px solid rgba(184,146,42,0.08)", paddingTop: "3rem" }}>
            <div className="hud-section-label justify-center mb-10">A metodologia que une tudo</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mce.map((m, i) => (
                <motion.div
                  key={m.letter}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="text-center md:text-left"
                >
                  <div className="flex items-baseline gap-2 mb-3 justify-center md:justify-start">
                    <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "2.5rem", color: GOLD, lineHeight: 1, textShadow: `0 0 20px rgba(184,146,42,0.35)` }}>{m.letter}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.22em", color: "rgba(184,146,42,0.55)", textTransform: "uppercase" }}>{m.label}</span>
                  </div>
                  <h4 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#F5F0E8", marginBottom: 8, lineHeight: 1.25 }}>{m.title}</h4>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.8rem", color: "rgba(80,80,122,0.9)", lineHeight: 1.7 }}>{m.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Final statement */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-center mt-16 relative"
            >
              <div className="hud-corner-tl" style={{ top: 0, left: "15%", opacity: 0.25 }} />
              <div className="hud-corner-br" style={{ bottom: 0, right: "15%", opacity: 0.25 }} />
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "clamp(1rem,2.5vw,2rem)", color: "rgba(245,240,232,0.2)", marginBottom: 10 }}>Outros apps perguntam o que você comeu.</p>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "clamp(1.3rem,3.5vw,3rem)", color: GOLD, textShadow: `0 0 50px rgba(184,146,42,0.5)`, marginBottom: 16 }}>O NutriON pergunta por que você comeu.</p>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.25em", color: "rgba(80,80,122,0.45)", textTransform: "uppercase" }}>MINDSET · COMPORTAMENTO · EXECUÇÃO — MCE</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingManifesto;
