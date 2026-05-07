import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const features = [
  { icon: "💪", title: "Muscle State Diário", desc: '<strong>Flat · Full · Spilled.</strong> Avaliação visual do glicogênio muscular. Ajuste automático de ±15% nos carbos do dia baseado no estado real do músculo.' },
  { icon: "🏆", title: "Peak Week Planner", desc: 'Depleção, carb load, sódio e hidratação <strong>calculados por dia</strong>. Para subir no palco de Men\'s Physique, Bodybuilding ou Fitness no pico da forma.' },
  { icon: "💊", title: "Protocolo Farmacológico", desc: 'A IA interpreta seu stack — <strong>testosterona, peptídeos, GLP-1</strong> — e recalcula TDEE e macros automaticamente. Sem julgamento. Com ciência.' },
  { icon: "🧠", title: "Fome que Não É de Comida", desc: '"Sua fome nunca foi de comida." IA comportamental identifica <strong>fome emocional, habitual, por tédio e social</strong>. Age antes do deslize com TCC e mindful eating.' },
  { icon: "🩸", title: "IA lê seus exames", desc: 'Faz upload do exame de sangue. <strong>IA interpreta testosterona, GH, insulina, vitamina D, TSH</strong> e ajusta o plano automaticamente.' },
  { icon: "🕐", title: "Nutrient Timing + Cronobiologia", desc: '<strong>Janela anabólica calculada</strong>, macros pré/pós treino por refeição, ritmo circadiano aplicado. Carbo quando o músculo absorve mais. Gordura quando o cortisol cai.' },
  { icon: "😴", title: "Sono + Recuperação", desc: 'Dormiu mal → app <strong>ajusta proteína, carbos e magnésio</strong> do dia seguinte. Correlação direta entre qualidade de sono e performance muscular.' },
  { icon: "📅", title: "Periodização de Fases", desc: '<strong>Bulk · Cutting · Recomp · Peak.</strong> Gantt visual com datas, metas por fase e protocolo ajustado automaticamente à fase atual. Visível para você e seu coach.' },
  { icon: "🎮", title: "Gamificação Real", desc: 'XP por refeição, <strong>streak de dias consecutivos</strong>, níveis (Iniciante → Lenda), badges, ranking semanal. Sistema que cria hábito de verdade.' },
];

const LandingFeatures = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="features" className="bg-[#080814] px-6 md:px-12 py-[120px]">
      <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
        <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-primary" />O que o NutriON entrega
        </div>
        <h2 className="font-heading leading-[.92] mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}>
          ATLETA.<br />HUMANO.<br /><span className="text-primary">UM PROTOCOLO.</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#14142a] rounded-2xl overflow-hidden mt-16">
        {features.map((feat, i) => (
          <div key={feat.title} className="bg-[#03030a] p-7 md:p-8 transition-colors hover:bg-[#0a0a18] relative overflow-hidden group">
            {/* Left bar on hover */}
            <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary scale-y-0 origin-top transition-transform duration-400 group-hover:scale-y-100" />
            <div className="font-heading text-[3.5rem] text-[#14142a] leading-none mb-3">{String(i + 1).padStart(2, "0")}</div>
            <div className="text-[1.5rem] mb-3">{feat.icon}</div>
            <div className="font-heading text-[1.3rem] tracking-[.04em] mb-2.5 text-[#f0edf8]">{feat.title}</div>
            <p className="text-[.82rem] text-[#6060a0] leading-[1.6] font-landing [&_strong]:text-[#f0edf8]" dangerouslySetInnerHTML={{ __html: feat.desc }} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default LandingFeatures;
