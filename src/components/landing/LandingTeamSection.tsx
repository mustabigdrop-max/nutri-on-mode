import { motion } from "framer-motion";

type AudienceCard = {
  icon: string;
  badge: string;
  badgeColor: string;
  headline: string;
  desc: string;
  tags: string[];
  belonging: string;
  accent: string;
};

const cards: AudienceCard[] = [
  {
    icon: "🏆",
    badge: "STAGE PREP · COMPETIÇÃO",
    badgeColor: "#e8a020",
    headline: "Para quem compete.",
    desc: "Men's Physique, Classic Physique, Bodybuilding, Bikini, Wellness, Figure, Women's Physique — masculino e feminino. O NutriON entende cada categoria.",
    tags: ["Peak Week", "Flat/Full/Spilled", "Carb Load", "Depleção", "Protocolo Farma"],
    belonging: "8 semanas pro palco. O protocolo já está calculado.",
    accent: "#e8a020",
  },
  {
    icon: "⚡",
    badge: "MMA · CROSSFIT · RUNNING · NATAÇÃO",
    badgeColor: "#00f0b4",
    headline: "Para quem performa.",
    desc: "Não importa o esporte. Nutrição para força, resistência, velocidade e recuperação. O NutriON calibra para o seu ritmo.",
    tags: ["Carb Loading", "VO2 Max Nutrition", "Corte de Peso", "Hidratação", "Recuperação"],
    belonging: "Seu corpo é ferramenta. O NutriON afina a máquina.",
    accent: "#00f0b4",
  },
  {
    icon: "💪",
    badge: "BULK · RECOMP · DEFINIÇÃO",
    badgeColor: "#7890ff",
    headline: "Para quem quer músculo.",
    desc: "Sem plateau. Sem achismo. Bulk inteligente, cutting com precisão, recomposição quando o objetivo é manter e melhorar.",
    tags: ["Lean Bulk", "Periodização", "Janela Anabólica", "Muscle State", "Progressão"],
    belonging: "Treina duro. O NutriON garante que cada grama de proteína conta.",
    accent: "#7890ff",
  },
  {
    icon: "🔥",
    badge: "TRANSFORMAÇÃO · SEM SOFRIMENTO",
    badgeColor: "#ff6b35",
    headline: "Para quem quer mudar de vez.",
    desc: "Não mais uma tentativa. Protocolo adaptativo, IA comportamental que age antes do deslize, e a verdade que ninguém fala: sua fome nunca foi de comida.",
    tags: ["IA Comportamental", "TCC Nutricional", "Anti-Plateau", "Sem Restrição Extrema", "Sistema Real"],
    belonging: "Não é mais uma dieta. É o sistema que substitui todas elas.",
    accent: "#ff6b35",
  },
  {
    icon: "🧬",
    badge: "ANTI-AGING · HORMÔNIOS · HEALTHSPAN",
    badgeColor: "#a78bfa",
    headline: "Para quem pensa no longo prazo.",
    desc: "Otimização hormonal, marcadores biológicos, nutrição anti-inflamatória. Não quer só viver mais — quer viver melhor, com mais energia, força e clareza mental.",
    tags: ["TRT/HGH", "Marcadores Biológicos", "Anti-Inflamatório", "Microbioma", "Sono & Recuperação"],
    belonging: "A longevidade também é um protocolo.",
    accent: "#a78bfa",
  },
  {
    icon: "❤️",
    badge: "EQUILÍBRIO · ENERGIA · QUALIDADE DE VIDA",
    badgeColor: "#34d399",
    headline: "Para quem quer viver melhor.",
    desc: "Sem etiqueta de atleta ou doente. Para quem quer comer bem, ter energia de verdade, dormir melhor e se sentir no controle do próprio corpo.",
    tags: ["Mediterrâneo", "Plant-Based", "Microbiota", "Saúde Hormonal", "Energia Real"],
    belonging: "Saúde não é meta. É o estilo de vida que o NutriON instala.",
    accent: "#34d399",
  },
];

const mce = [
  {
    icon: "🧠",
    letter: "M",
    label: "MINDSET",
    title: "Protocolo bate motivação.",
    desc: "Todo mundo começa motivado. Quem chega ao fim tem sistema. O NutriON instala o mindset certo para cada fase da sua jornada.",
  },
  {
    icon: "🔄",
    letter: "C",
    label: "COMPORTAMENTO",
    title: "Hábito é mais forte que força de vontade.",
    desc: "IA comportamental que identifica padrões, age antes do sabotador e transforma seu relacionamento com a comida.",
  },
  {
    icon: "⚡",
    letter: "E",
    label: "EXECUÇÃO",
    title: "Plano sem execução é fantasia.",
    desc: "Protocolo individual, plano do dia às 7h, coach IA em tempo real e ajuste automático. O NutriON executa junto com você.",
  },
];

const LandingTeamSection = () => {
  return (
    <section className="relative py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(232,160,32,0.04),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <div className="font-mono text-[.6rem] text-[#e8a020]/60 tracking-[.28em] mb-6">
            BEM-VINDO AO TIME
          </div>
          <h2
            className="font-heading leading-[.95] mb-8"
            style={{ fontSize: "clamp(2.5rem,6vw,5.5rem)" }}
          >
            <span className="block text-[#f0edf8]">SEU OBJETIVO TEM</span>
            <span
              className="block"
              style={{
                color: "#e8a020",
                textShadow: "0 0 40px rgba(232,160,32,.45), 0 0 80px rgba(232,160,32,.2)",
              }}
            >
              PROTOCOLO.
            </span>
          </h2>
          <p className="font-landing text-[#f0edf8]/55 max-w-2xl mx-auto text-[.95rem] leading-relaxed">
            Do palco ao bem-estar. Do MMA à longevidade. A mesma ciência. O mesmo cuidado. O seu protocolo.
          </p>
        </motion.div>

        {/* GRID DE AUDIÊNCIAS */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {cards.map((c, i) => (
            <motion.div
              key={c.headline}
              variants={{
                hidden: { opacity: 0, x: i % 2 === 0 ? -20 : 20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
              whileHover={{ scale: 1.01 }}
              className="group relative p-7 rounded-2xl bg-[#0a0a14]/60 backdrop-blur-sm transition-all duration-300"
              style={{
                border: `1px solid ${c.accent}33`,
              }}
            >
              {/* accent top */}
              <div
                className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)`,
                }}
              />

              <div className="text-[2.5rem] mb-3 leading-none">{c.icon}</div>

              <div
                className="font-mono text-[.5rem] tracking-[.22em] mb-3"
                style={{ color: c.badgeColor }}
              >
                {c.badge}
              </div>

              <h3 className="font-heading text-[1.1rem] text-[#f0edf8] mb-3 leading-tight">
                {c.headline}
              </h3>

              <p className="font-landing text-[.8rem] text-[#f0edf8]/55 leading-relaxed mb-5">
                {c.desc}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {c.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[.55rem] px-2 py-1 rounded-full tracking-wider"
                    style={{
                      border: `1px solid ${c.accent}40`,
                      color: `${c.accent}`,
                      background: `${c.accent}08`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                className="font-mono text-[.65rem] italic text-[#e8a020]/70 pt-4 border-t border-[#e8a020]/10"
              >
                "{c.belonging}"
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* MCE EXPLAINER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="border-t border-[#e8a020]/10 mt-16 pt-12"
        >
          <div className="font-mono text-[.58rem] text-[#e8a020]/50 tracking-[.25em] text-center mb-10">
            A METODOLOGIA QUE UNE TODOS
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mce.map((m, i) => (
              <motion.div
                key={m.letter}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="text-center md:text-left"
              >
                <div className="text-[2rem] mb-3">{m.icon}</div>
                <div className="flex items-baseline gap-2 mb-3 justify-center md:justify-start">
                  <span
                    className="font-heading text-[2.5rem] leading-none"
                    style={{ color: "#e8a020" }}
                  >
                    {m.letter}
                  </span>
                  <span className="font-mono text-[.6rem] text-[#e8a020]/60 tracking-[.25em]">
                    {m.label}
                  </span>
                </div>
                <h4 className="font-heading text-[1.05rem] text-[#f0edf8] mb-2 leading-tight">
                  {m.title}
                </h4>
                <p className="font-landing text-[.8rem] text-[#f0edf8]/50 leading-relaxed">
                  {m.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* STATEMENT FINAL + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center mt-24"
        >
          <p className="font-heading text-[1.5rem] text-[#f0edf8]/30 mb-2 leading-tight">
            Não importa onde você está na jornada.
          </p>
          <p
            className="font-heading text-[2rem] mb-10 leading-tight"
            style={{ color: "#e8a020" }}
          >
            O time tem espaço para você.
          </p>

          <a
            href="#planos"
            className="relative inline-flex items-center gap-3 px-10 py-4 font-mono text-[.7rem] tracking-[.25em] text-[#03030a] bg-[#e8a020] transition-all duration-300 hover:scale-[1.03]"
            style={{
              clipPath:
                "polygon(8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%, 0 50%)",
              boxShadow: "0 0 60px rgba(232,160,32,.35)",
            }}
          >
            ATIVAR MEU PROTOCOLO →
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingTeamSection;
