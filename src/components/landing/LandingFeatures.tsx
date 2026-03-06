import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const features = [
  { icon: "🩸", title: "IA lê seus exames", desc: 'Faz upload do exame de sangue. <strong>IA interpreta ferro, vitamina D, colesterol, TSH, glicemia</strong> e ajusta seu plano alimentar automaticamente.' },
  { icon: "🕐", title: "Cronobiologia", desc: '<strong>Janelas de macros por horário</strong> baseadas no ritmo circadiano. Carbo de manhã, gordura à noite. Jejum noturno calculado pelo app.' },
  { icon: "😴", title: "Sono + Recuperação", desc: 'Dormiu mal → app <strong>aumenta proteína e magnésio</strong> do dia seguinte automaticamente. Correlação sono × comportamento alimentar.' },
  { icon: "🧠", title: "Nutrição Comportamental", desc: 'Escala de fome, diário emocional, <strong>Mindful Eating, desafios de TCC</strong>, entrevista motivacional. A ciência por trás da mudança real.' },
  { icon: "💊", title: "Stack de Suplementação", desc: 'IA monta seu <strong>stack personalizado por objetivo + exames</strong>. Dose certa, horário certo, evidência científica de cada suplemento.' },
  { icon: "🦠", title: "Perfil de Microbioma", desc: 'Questionário científico gera <strong>4 dimensões do seu intestino</strong>. Plano ajustado com prebióticos, probióticos e alimentos específicos.' },
  { icon: "📸", title: "Diário Fotográfico", desc: '<strong>Slider antes × depois</strong> em tempo real. IA analisa sequência de fotos e gera relatório de evolução visual. Card compartilhável para Instagram.' },
  { icon: "🎮", title: "Gamificação Real", desc: 'XP por refeição, <strong>streak de dias consecutivos</strong>, níveis (Iniciante → Lenda), badges, ranking semanal. Engajamento que funciona.' },
  { icon: "🛒", title: "Lista + Custo da Dieta", desc: '<strong>Lista de compras automática</strong> pelo plano semanal. Calculadora de custo por refeição. Substitutos mais baratos com mesmo macro.' },
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
          FUNCIONA<br /><span className="text-primary">DE VERDADE.</span>
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
