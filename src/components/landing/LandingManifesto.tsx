import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PILLARS = [
  {
    num: "01",
    tag: "NUTRI = CIÊNCIA",
    headline: "Precisão que os outros apps fingem ter.",
    desc: "GEB/GET/VET calculados com Harris-Benedict e Katch-McArdle. Banco TACO/IBGE completo. 10 protocolos baseados em evidência — do jejum circadiano ao Peak Week de bodybuilder.",
    accent: "#e8a020",
    glow: "rgba(232,160,32,.12)",
    items: ["GEB · GET · VET", "Harris-Benedict", "Katch-McArdle", "10 protocolos", "Análise de exames"],
  },
  {
    num: "02",
    tag: "ON = EXECUÇÃO",
    headline: "De nada adianta saber. Tem que fazer.",
    desc: "Notificação às 7h com o plano completo do dia. Refeições em 1 toque. Gamificação que gera hábito real. IA comportamental que age antes do deslize. Coach humano integrado.",
    accent: "#00f0b4",
    glow: "rgba(0,240,180,.1)",
    items: ["Plano diário 7h", "1-tap refeições", "Gamificação real", "IA comportamental", "Coach integrado"],
  },
  {
    num: "03",
    tag: "24H = RESULTADO",
    headline: "Seu metabolismo não para. Seu app também não.",
    desc: "Cronobiologia ajusta macros por horário. Wearables sincronizam o gasto real. Sono recalibra o plano da manhã. Termômetro emocional monitora o comportamento à noite.",
    accent: "#e8a020",
    glow: "rgba(232,160,32,.12)",
    items: ["Cronobiologia", "Wearable sync", "Sono → macros", "Mood tracking", "24/7 adaptativo"],
  },
];

const LandingManifesto = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-[120px] overflow-hidden"
      style={{ background: "linear-gradient(180deg, rgba(3,3,10,0) 0%, rgba(6,6,18,.9) 30%, rgba(6,6,18,.9) 70%, rgba(3,3,10,0) 100%)" }}
    >
      {/* Background hex grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(232,160,32,.018) 1px, transparent 1px), linear-gradient(90deg, rgba(232,160,32,.018) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Central nebula */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] pointer-events-none" style={{
        background: "radial-gradient(ellipse, rgba(232,160,32,.04) 0%, rgba(0,80,200,.02) 40%, transparent 70%)",
        filter: "blur(60px)",
      }} />

      <div className="max-w-[1100px] mx-auto relative z-10">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="w-8 h-px bg-[#e8a020]/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#e8a020]" style={{ boxShadow: "0 0 8px rgba(232,160,32,.8)" }} />
          <span className="font-mono text-[.6rem] text-[#e8a020]/60 tracking-[.28em] uppercase">O que é o NUTRION</span>
        </motion.div>

        {/* Big statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-16"
        >
          <h2
            className="font-heading leading-[.9] mb-5"
            style={{ fontSize: "clamp(2rem, 5.5vw, 5rem)" }}
          >
            <span className="text-[#f0edf8]">NUTRI É A </span>
            <span style={{ color: "#e8a020", textShadow: "0 0 40px rgba(232,160,32,.4)" }}>CIÊNCIA.</span>
            <br />
            <span className="text-[#f0edf8]">ON É A </span>
            <span style={{ color: "#00f0b4", textShadow: "0 0 40px rgba(0,240,180,.35)" }}>ATITUDE.</span>
            <br />
            <span className="text-[#f0edf8]/50">JUNTOS SÃO UM </span>
            <span style={{ color: "#e8a020", textShadow: "0 0 40px rgba(232,160,32,.4)" }}>RESULTADO.</span>
          </h2>
          <p className="text-[#8888b0] font-landing text-[.95rem] leading-[1.75] max-w-[520px]">
            Motivação vai embora. <strong className="text-[#f0edf8]/70">Estrutura fica.</strong>{" "}
            O nutriON não é mais um app de dieta — é o sistema que faltava.
          </p>
        </motion.div>

        {/* Problem / Solution — confrontational layout */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16"
        >
          {/* Problem */}
          <div className="relative border border-[#ffffff]/04 bg-white/[.018] backdrop-blur-sm p-8 group hover:border-[#ff4444]/15 transition-colors duration-500">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff4444]/20 to-transparent" />
            <div className="font-mono text-[.55rem] text-[#ff4444]/50 tracking-[.25em] uppercase mb-5 flex items-center gap-2">
              <span className="w-2 h-px bg-current" />
              O PROBLEMA
            </div>
            <p className="text-[.9rem] text-[#8888b0] leading-[1.9] font-landing mb-3">
              Todo mundo já fez dieta. Todo mundo começou certinho. E todo mundo abandonou na terceira semana sem saber exatamente por quê.
            </p>
            <p className="text-[.9rem] text-[#f0edf8]/65 leading-[1.9] font-landing font-semibold">
              Não é fraqueza. É falta de <span className="text-[#f0edf8]/90">sistema</span>.
            </p>
            <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#ff4444]/10 group-hover:border-[#ff4444]/30 transition-colors" />
          </div>

          {/* Solution */}
          <div className="relative border border-[#e8a020]/10 bg-[#e8a020]/[.022] backdrop-blur-sm p-8 group hover:border-[#e8a020]/25 transition-colors duration-500">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8a020]/35 to-transparent" />
            <div className="font-mono text-[.55rem] text-[#e8a020]/60 tracking-[.25em] uppercase mb-5 flex items-center gap-2">
              <span className="w-2 h-px bg-current" />
              A SOLUÇÃO
            </div>
            <p className="text-[.9rem] text-[#8888b0] leading-[1.9] font-landing mb-3">
              O nutriON é o único app construído com a mentalidade de quem vive isso —{" "}
              <strong className="text-[#f0edf8]/70">nutrition coach, bodybuilder e analista comportamental</strong>.
            </p>
            <p className="text-[.9rem] text-[#e8a020] leading-[1.9] font-landing font-semibold">
              Resultado não vem de inspiração. Vem de protocolo.
            </p>
            <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#e8a020]/15 group-hover:border-[#e8a020]/40 transition-colors" />
          </div>
        </motion.div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e8a020]/06">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.num}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.13 }}
              className="relative bg-[#03030a] p-8 group overflow-hidden"
            >
              {/* Giant watermark number */}
              <div
                className="absolute -top-4 -right-2 font-heading text-[7rem] leading-none select-none pointer-events-none"
                style={{ color: `${pillar.accent}06` }}
              >
                {pillar.num}
              </div>

              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${pillar.accent}, transparent)` }}
              />

              {/* Glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${pillar.glow}, transparent)` }}
              />

              <div className="relative z-10">
                {/* Tag */}
                <div
                  className="font-mono text-[.55rem] tracking-[.2em] uppercase mb-4 flex items-center gap-2"
                  style={{ color: pillar.accent }}
                >
                  <span className="w-3 h-px bg-current" />
                  {pillar.tag}
                </div>

                {/* Headline */}
                <h3
                  className="font-heading text-[1.15rem] text-[#f0edf8]/85 mb-3 leading-[1.2]"
                  style={{ textShadow: `0 0 20px ${pillar.accent}25` }}
                >
                  {pillar.headline}
                </h3>

                {/* Description */}
                <p className="text-[.8rem] text-[#60607a] leading-[1.75] font-landing mb-6">
                  {pillar.desc}
                </p>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-1.5">
                  {pillar.items.map((item) => (
                    <span
                      key={item}
                      className="font-mono text-[.52rem] tracking-[.08em] px-2 py-1 border rounded-[1px]"
                      style={{ borderColor: `${pillar.accent}20`, color: `${pillar.accent}70`, background: `${pillar.accent}06` }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r opacity-20 group-hover:opacity-60 transition-opacity" style={{ borderColor: pillar.accent }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingManifesto;
