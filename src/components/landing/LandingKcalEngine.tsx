import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    num: "01", tag: "Etapa 1", title: "GEB — Metabolismo Basal",
    desc: "IA calcula com 3 fórmulas simultâneas e escolhe a mais precisa para o seu perfil.",
    formulas: ["✦ Harris-Benedict revisada", "✦ Mifflin-St Jeor", "✦ Katch-McArdle (atletas)", "✦ FAO/WHO/UNU"],
  },
  {
    num: "02", tag: "Etapa 2", title: "GET — Gasto Total Diário",
    desc: "GEB × fator de atividade. Sincroniza com wearables para ajuste em tempo real pelo gasto real do dia.",
    formulas: ["× 1.2 Sedentário", "× 1.55 Ativo", "× 1.725 Muito ativo", "× 1.9 Atleta / BB"],
  },
  {
    num: "03", tag: "Etapa 3", title: "VET — Meta Calórica Final",
    desc: "Ajuste do GET pelo objetivo. Cálculo VENTA para projeção precisa de perda/ganho.",
    formulas: ["− 500 kcal Cutting", "= GET Manutenção", "+ 300 kcal Bulk lean", "VENTA 7.700 kcal/kg"],
  },
  {
    num: "∞", tag: "Resultado", title: "Sua meta em segundos",
    desc: "Você informa seus dados. A IA faz os cálculos, explica em linguagem simples e gera o plano. Nenhum app brasileiro faz isso automaticamente.",
    result: '"Sua meta: 2.180 kcal/dia\n→ Perda de 0,6kg/semana\n→ Meta em 12 semanas"',
    highlighted: true,
  },
];

const LandingKcalEngine = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="kcal" className="bg-[#03030a] px-6 md:px-12 py-[120px]">
      <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
        <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-primary" />Motor de cálculo energético
        </div>
        <h2 className="font-heading leading-[.92] mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}>
          GEB. GET.<br /><span className="text-primary">VET.</span><br />
          <span style={{ WebkitTextStroke: "1px rgba(255,255,255,.12)", color: "transparent" }}>AUTOMÁTICO.</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#14142a] rounded-2xl overflow-hidden mt-16">
        {steps.map((step) => (
          <div
            key={step.num}
            className={`bg-[#080814] p-8 md:p-10 relative ${step.highlighted ? "bg-primary/[.03] border border-primary/10" : ""}`}
          >
            <div className={`font-heading text-[5rem] absolute top-4 right-6 leading-none ${step.highlighted ? "text-primary/[.15]" : "text-[#14142a]"}`}>
              {step.num}
            </div>
            <div className="font-mono text-[.6rem] text-primary tracking-[.2em] uppercase mb-2.5">{step.tag}</div>
            <div className="font-heading text-[1.8rem] tracking-[.04em] mb-3.5 text-[#f0edf8]">{step.title}</div>
            <div className="text-[.85rem] text-[#7070a0] leading-[1.7] font-landing">{step.desc}</div>
            <div className="mt-4 flex flex-col gap-1.5">
              {step.formulas ? step.formulas.map((f) => (
                <span key={f} className="font-mono text-[.65rem] bg-primary/[.06] border border-primary/[.12] text-primary px-2.5 py-1.5 rounded inline-flex items-center gap-1.5 w-fit">{f}</span>
              )) : (
                <span className="font-mono text-[.72rem] text-primary whitespace-pre-line mt-5">{step.result}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LandingKcalEngine;
