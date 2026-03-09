import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const LandingManifesto = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="bg-[#03030a] px-6 md:px-12 py-[100px] border-b border-[#14142a]">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="max-w-[860px] mx-auto"
      >
        <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-primary" />
          O que é o NUTRION
        </div>
        <div className="font-heading leading-[1.1] mb-12" style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}>
          NUTRI É A <span className="text-primary">CIÊNCIA.</span><br />
          ON É A <span className="text-primary">ATITUDE.</span><br />
          JUNTOS SÃO UM <span className="text-primary">RESULTADO.</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="font-mono text-[.62rem] text-primary tracking-[.2em] uppercase mb-3.5">O problema</div>
            <p className="text-[.95rem] text-[#6060a0] leading-[1.85] font-landing mb-4">
              Todo mundo já fez dieta. Todo mundo já começou uma semana certinho. E todo mundo já abandonou na terceira semana sem saber exatamente por quê.
            </p>
            <p className="text-[.95rem] text-[#6060a0] leading-[1.85] font-landing mb-4">
              Não é fraqueza. É falta de <strong className="text-[#9090b8]">sistema</strong>.
            </p>
            <p className="text-[.95rem] text-[#9090b8] leading-[1.85] font-landing font-semibold">
              Motivação vai embora. Estrutura fica.
            </p>
          </div>
          <div>
            <div className="font-mono text-[.62rem] text-primary tracking-[.2em] uppercase mb-3.5">A solução</div>
            <p className="text-[.95rem] text-[#6060a0] leading-[1.85] font-landing mb-4">
              O nutriON é o único app construído com a mentalidade de quem vive isso — <strong className="text-[#9090b8]">nutrition coach, bodybuilder e Analista em comportamento humano</strong>.
            </p>
            <p className="text-[.95rem] text-[#6060a0] leading-[1.85] font-landing mb-4">
              Porque resultado não vem de inspiração. Vem de <strong className="text-[#9090b8]">protocolo</strong>.
            </p>
            <p className="text-[.95rem] text-[#6060a0] leading-[1.85] font-landing mb-4">
              Motor de kcal científico, 10 protocolos de dieta, IA comportamental, exames de sangue, sono e microbioma — tudo integrado pela metodologia <strong className="text-[#9090b8]">MCE: Mindset, Comportamento e Execução</strong>.
            </p>
            <p className="text-[.95rem] text-primary leading-[1.85] font-landing font-semibold">
              Isso não é mais um app de dieta. É o sistema que faltava.
            </p>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-[#14142a] rounded-xl overflow-hidden">
          {[
            { title: "NUTRI = CIÊNCIA", desc: "Cálculo energético GEB/GET/VET, fórmulas de Harris-Benedict e Katch-McArdle, 10 protocolos baseados em evidência, banco TACO/IBGE, análise de exames e microbioma." },
            { title: "ON = EXECUÇÃO", desc: "Notificação às 7h com o plano do dia, refeições prontas com 1 toque, gamificação que gera hábito, coach humano integrado, IA comportamental que age antes do erro." },
            { title: "24H = RESULTADO", desc: "Cronobiologia ajusta macros por horário, wearables sincronizam o gasto real, sono recalibra o plano da manhã, termômetro emocional monitora o comportamento à noite." },
          ].map((item) => (
            <div key={item.title} className="bg-[#080814] p-7">
              <div className="font-heading text-[1.1rem] text-primary mb-2">{item.title}</div>
              <p className="text-[.78rem] text-[#606080] leading-[1.6] font-landing">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default LandingManifesto;
