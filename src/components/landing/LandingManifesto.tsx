import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const cards = [
  {
    tag: "01", title: "NUTRI = CIÊNCIA",
    desc: "Cálculo energético GEB/GET/VET, fórmulas de Harris-Benedict e Katch-McArdle, 10 protocolos baseados em evidência, banco TACO/IBGE, análise de exames e microbioma.",
    accent: "rgba(232,160,32,.5)",
  },
  {
    tag: "02", title: "ON = EXECUÇÃO",
    desc: "Notificação às 7h com o plano do dia, refeições prontas com 1 toque, gamificação que gera hábito, coach humano integrado, IA comportamental que age antes do erro.",
    accent: "rgba(0,240,180,.4)",
  },
  {
    tag: "03", title: "24H = RESULTADO",
    desc: "Cronobiologia ajusta macros por horário, wearables sincronizam o gasto real, sono recalibra o plano da manhã, termômetro emocional monitora o comportamento à noite.",
    accent: "rgba(232,160,32,.5)",
  },
];

const LandingManifesto = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="bg-background px-6 md:px-12 py-[100px] border-b border-border relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(232,160,32,.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,160,32,.02) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(232,160,32,.04) 0%, transparent 70%)" }}
      />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="max-w-[860px] mx-auto relative z-10"
      >
        <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-primary" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          O que é o NUTRION
        </div>

        <div className="font-heading leading-[1.05] mb-12" style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}>
          NUTRI É A <span className="text-primary" style={{ textShadow: "0 0 30px rgba(232,160,32,.4)" }}>CIÊNCIA.</span><br />
          ON É A <span className="text-primary" style={{ textShadow: "0 0 30px rgba(232,160,32,.4)" }}>ATITUDE.</span><br />
          JUNTOS SÃO UM <span className="text-primary" style={{ textShadow: "0 0 30px rgba(232,160,32,.4)" }}>RESULTADO.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-card/60 border border-border p-6 rounded-sm relative group hover:border-primary/20 transition-colors backdrop-blur-sm">
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="font-mono text-[.6rem] text-primary/60 tracking-[.22em] uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-px bg-primary/60" />O problema
            </div>
            <p className="text-[.93rem] text-muted-foreground leading-[1.85] font-landing mb-3">
              Todo mundo já fez dieta. Todo mundo já começou uma semana certinho. E todo mundo já abandonou na terceira semana sem saber exatamente por quê.
            </p>
            <p className="text-[.93rem] text-muted-foreground leading-[1.85] font-landing mb-3">
              Não é fraqueza. É falta de <strong className="text-foreground/70">sistema</strong>.
            </p>
            <p className="text-[.93rem] text-foreground/70 leading-[1.85] font-landing font-semibold">Motivação vai embora. Estrutura fica.</p>
            <span className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-primary/15 group-hover:border-primary/40 transition-colors" />
          </div>

          <div className="bg-card/60 border border-border p-6 rounded-sm relative group hover:border-primary/20 transition-colors backdrop-blur-sm">
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="font-mono text-[.6rem] text-primary/60 tracking-[.22em] uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-px bg-primary/60" />A solução
            </div>
            <p className="text-[.93rem] text-muted-foreground leading-[1.85] font-landing mb-3">
              O nutriON é o único app construído com a mentalidade de quem vive isso — <strong className="text-foreground/70">nutrition coach, bodybuilder e Analista em comportamento humano</strong>.
            </p>
            <p className="text-[.93rem] text-muted-foreground leading-[1.85] font-landing mb-3">
              Porque resultado não vem de inspiração. Vem de <strong className="text-foreground/70">protocolo</strong>.
            </p>
            <p className="text-[.93rem] text-primary leading-[1.85] font-landing font-semibold">Isso não é mais um app de dieta. É o sistema que faltava.</p>
            <span className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-primary/15 group-hover:border-primary/40 transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
              className="relative group rounded-sm overflow-hidden bg-card/70 backdrop-blur-sm border border-border/30"
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)`, opacity: 0.6 }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)` }}
              />
              <div className="p-7">
                <div className="font-heading text-[3rem] text-border leading-none mb-1 absolute top-3 right-4 select-none">{card.tag}</div>
                <div className="font-heading text-[1.1rem] text-primary mb-3 tracking-[.04em]" style={{ textShadow: "0 0 16px rgba(232,160,32,.3)" }}>{card.title}</div>
                <p className="text-[.78rem] text-muted-foreground leading-[1.65] font-landing">{card.desc}</p>
              </div>
              <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-primary/15 group-hover:border-primary/40 transition-colors" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default LandingManifesto;
