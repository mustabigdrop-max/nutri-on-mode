import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const CASES = [
  {
    id: "G.T.",
    age: 24,
    city: "São Paulo",
    protocol: "Men's Physique · Stage Prep · Peak Week",
    weeks: 16,
    before: {
      weight: "86kg · 14% BF",
      adherence: "52%",
      streak: "5 dias",
      score: "48/100",
      note: "Preparação sem sistema. Flat na semana do palco. Perdeu pontos por retenção.",
    },
    after: {
      weight: "79.2kg · 6.8% BF",
      adherence: "97%",
      streak: "98 dias",
      score: "99/100",
      note: "Top 3 na categoria. Muscle State FULL no dia da prova. Peak Week executado com precisão.",
    },
    quote: "Pela primeira vez subi no palco sabendo exatamente o que estava fazendo. O app calculou cada dia.",
    color: "#e8a020",
  },
  {
    id: "J.C.",
    age: 29,
    city: "Belo Horizonte",
    protocol: "TCC Nutricional · Comportamento · Cutting",
    weeks: 8,
    before: {
      weight: "78kg",
      adherence: "41%",
      streak: "4 dias",
      score: "44/100",
      note: "Compulsão noturna. Tentou 4 dietas diferentes. Sabia o que comer. Não conseguia.",
    },
    after: {
      weight: "71.6kg",
      adherence: "91%",
      streak: "52 dias",
      score: "94/100",
      note: "−6.4kg. Termômetro emocional + TCC identificou o gatilho. Fome noturna resolvida.",
    },
    quote: "Sua fome nunca foi de comida. Quando li isso no app, entendi tudo que estava errado.",
    color: "#00f0b4",
  },
  {
    id: "R.M.",
    age: 31,
    city: "Curitiba",
    protocol: "Performance · Corrida · Nutrição Esportiva",
    weeks: 12,
    before: {
      weight: "74kg",
      adherence: "55%",
      streak: "6 dias",
      score: "57/100",
      note: "Corredor de meia-maratona. Batia plateau de performance. Sem periodização nutricional.",
    },
    after: {
      weight: "71.2kg",
      adherence: "94%",
      streak: "78 dias",
      score: "97/100",
      note: "PR na São Silvestre. −2.8kg com manutenção de VO2. Carb loading calculado pelo NutriON.",
    },
    quote: "Nunca imaginei que a nutrição era o que faltava no meu treino. O NutriON me provou errado.",
    color: "#7890ff",
  },
];

const DataRow = ({
  label,
  before,
  after,
  color,
}: {
  label: string;
  before: string;
  after: string;
  color: string;
}) => (
  <div className="grid grid-cols-[80px_1fr_1fr] gap-2 items-center py-1.5 border-b border-white/[.03] last:border-b-0">
    <span className="font-mono text-[.48rem] text-[#30306a] tracking-[.1em] uppercase">{label}</span>
    <span className="font-mono text-[.65rem] text-[#404060] line-through">{before}</span>
    <span className="font-heading text-[.75rem]" style={{ color }}>{after}</span>
  </div>
);

const LandingTestimonials = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6%" });

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-[120px] overflow-hidden"
      style={{ background: "linear-gradient(180deg, #060612 0%, #03030a 100%)" }}
    >
      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,240,180,.008) 1px, transparent 1px)",
        backgroundSize: "100% 44px",
      }} />

      <div className="max-w-[1100px] mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-px bg-[#00f0b4]/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0b4]" style={{ boxShadow: "0 0 8px rgba(0,240,180,.8)" }} />
            <span className="font-mono text-[.6rem] text-[#00f0b4]/60 tracking-[.28em] uppercase">Casos reais · Dados reais</span>
          </div>
          <h2
            className="font-heading leading-[.9] mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
          >
            <span className="text-[#f0edf8]">PALCO. CORRIDA.</span>
            <br />
            <span style={{ color: "#e8a020", textShadow: "0 0 35px rgba(232,160,32,.4)" }}>COMPORTAMENTO.</span>
            <br />
            <span className="text-[#f0edf8]/30">RESULTADO REAL.</span>
          </h2>
          <p className="text-[#60607a] font-landing text-[.9rem] max-w-[480px]">
            Não são fotos antes/depois. São dados reais — atleta de palco, corredor de performance e quem transformou a relação com a comida. Aderência, streak, score, composição corporal — tudo rastreado.
          </p>
        </motion.div>

        {/* Case cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CASES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.12 + i * 0.12 }}
              className="relative overflow-hidden group"
              style={{
                background: "rgba(6,6,18,.9)",
                border: `1px solid ${c.color}15`,
              }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${c.color}60, transparent)` }}
              />
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${c.color}07, transparent)` }}
              />

              <div className="p-5 relative z-10">
                {/* Case header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-heading text-[1.1rem]" style={{ color: c.color }}>{c.id}</div>
                      <div className="font-mono text-[.52rem] text-[#40406a]">{c.age} anos · {c.city}</div>
                    </div>
                    <div
                      className="font-mono text-[.5rem] tracking-[.12em] px-2 py-0.5 inline-block"
                      style={{
                        color: c.color,
                        background: `${c.color}10`,
                        border: `1px solid ${c.color}20`,
                      }}
                    >
                      {c.protocol}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-[1.4rem] text-[#f0edf8]/20">{c.weeks}</div>
                    <div className="font-mono text-[.44rem] text-[#30306a] tracking-[.08em]">semanas</div>
                  </div>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[80px_1fr_1fr] gap-2 mb-2 pb-1.5 border-b border-white/[.05]">
                  <div />
                  <div className="font-mono text-[.46rem] text-[#ff4444]/40 tracking-[.1em] uppercase">Antes</div>
                  <div className="font-mono text-[.46rem] tracking-[.1em] uppercase" style={{ color: `${c.color}70` }}>Depois</div>
                </div>

                {/* Data rows */}
                <DataRow label="Peso" before={c.before.weight} after={c.after.weight} color={c.color} />
                <DataRow label="Aderência" before={c.before.adherence} after={c.after.adherence} color={c.color} />
                <DataRow label="Streak" before={c.before.streak} after={c.after.streak} color={c.color} />
                <DataRow label="Score" before={c.before.score} after={c.after.score} color={c.color} />

                {/* Notes */}
                <div className="mt-3 space-y-1.5">
                  <div className="font-landing text-[.68rem] text-[#ff4444]/40 leading-[1.5] line-through">
                    "{c.before.note}"
                  </div>
                  <div className="font-landing text-[.72rem] text-[#a0a0c0] leading-[1.5]">
                    ✓ {c.after.note}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px my-4" style={{ background: `${c.color}15` }} />

                {/* Quote */}
                <blockquote
                  className="font-landing text-[.78rem] leading-[1.7] italic"
                  style={{ color: `${c.color}80` }}
                >
                  "{c.quote}"
                </blockquote>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="font-mono text-[.55rem] text-[#28284a] tracking-[.1em]">
            Nomes abreviados por privacidade · Dados coletados via app · Resultados individuais variam por protocolo e consistência
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingTestimonials;
