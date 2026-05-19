import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const patients = [
  {
    name: "Marcos Silva",
    age: 34,
    program: "Cutting",
    week: "Semana 4 de 12",
    delta: "−2.8kg",
    goal: "Meta: −8kg",
    adherence: 87,
    alert: "⚠ Abaixo da meta semanal",
    alertType: "warning",
    dot: "bg-[#ffcc00]",
  },
  {
    name: "Juliana Costa",
    age: 29,
    program: "Emagrecimento",
    week: "Semana 7 de 16",
    delta: "−4.1kg",
    goal: "",
    adherence: 68,
    alert: "⚠ APEX pendente — sem avaliação postural",
    alertType: "warning",
    dot: "bg-[#ff2d55]",
  },
  {
    name: "Rafael Moura",
    age: 27,
    program: "Hipertrofia",
    week: "Semana 2 de 20",
    delta: "+0.8kg",
    goal: "Meta: +6kg",
    adherence: 91,
    alert: "✓ SRI 74 — evoluindo dentro do esperado",
    alertType: "success",
    dot: "bg-[#00c896]",
  },
  {
    name: "Carlos Drummond",
    age: 31,
    program: "Bulk",
    week: "VERTEX ATIVO · Semana 3 de ciclo",
    delta: "",
    goal: "",
    adherence: 95,
    alert: "⚡ Dr. VERTEX — exame pendente de revisão",
    alertType: "vertex",
    dot: "bg-[#a855f7]",
  },
];

const alertColor = (type: string) => {
  if (type === "success") return "text-[#00c896]";
  if (type === "vertex") return "text-[#a855f7]";
  return "text-[#ff8080]";
};

const LandingCoach = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="coach" className="bg-[#03030a] px-6 md:px-12 py-[120px] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
            <span className="w-4 h-px bg-primary" />— PARA COACHES E PROFISSIONAIS
          </div>
          <h2 className="font-heading leading-[.92] mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}>
            PARA<br /><span className="text-primary">COACHES</span><br />
            <span className="text-[#f0edf8]">QUE ENTREGAM</span><br />
            <span style={{ fontSize: "clamp(1.8rem, 4vw, 3.5rem)" }}>RESULTADO TÉCNICO.</span>
          </h2>
          <p className="text-[#7070a0] text-[.95rem] leading-[1.7] mt-5 max-w-[460px] font-landing">
            O nutriON não é uma ferramenta de apoio. É a infraestrutura técnica do seu trabalho. <strong className="text-[#f0edf8]">APEX</strong> analisa a postura dos seus atletas por foto com IA. <strong className="text-[#f0edf8]">Dr. VERTEX</strong> audita os protocolos farmacológicos. <strong className="text-[#f0edf8]">TrainingON</strong> gera periodização de 7 camadas. <strong className="text-[#f0edf8]">NutriPlan</strong> ajusta macros pelo ciclo farmacológico ativo. Você entrega o que o mercado não consegue. Sem precisar de 10 ferramentas diferentes.
          </p>
          <div className="mt-8 flex flex-col gap-2.5">
            {[
              "+ APEX diagnostica postura por foto — sem equipamento especializado",
              "+ Dr. VERTEX audita ciclos e alerta interações farmacológicas em tempo real",
              "+ Protocolo corretivo gerado automaticamente e injetado no treino do atleta",
              "+ Relatório PDF mensal automático com SRI, FCS e evolução do atleta",
              "+ Painel coach — até 30 atletas com alertas de risco e aderência em tempo real",
              "+ White label disponível — sua marca, nossa infraestrutura",
            ].map((f) => (
              <span key={f} className="font-mono text-[.65rem] bg-primary/[.06] border border-primary/[.12] text-primary px-2.5 py-1.5 rounded inline-flex items-center gap-1.5 w-fit">{f}</span>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }}>
          <div className="bg-[#0d0d1f] border border-[#14142a] rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(232,160,32,.06), transparent 60%)" }} />
            <div className="relative">
              {/* Header */}
              <div className="mb-1">
                <div className="font-heading text-[1.1rem] tracking-[.08em] text-primary">PAINEL DO COACH</div>
                <div className="w-full h-px bg-primary/20 mt-2 mb-3" />
              </div>

              {/* Stats bar */}
              <div className="flex items-center gap-3 mb-5 font-mono text-[.6rem] text-[#9090b8]">
                <span className="flex items-center gap-1.5">
                  <span className="w-[5px] h-[5px] bg-[#ff2d55] rounded-full animate-pulse" />
                  5 alertas ativos
                </span>
                <span className="text-[#2a2a4a]">•</span>
                <span>22 atletas</span>
                <span className="text-[#2a2a4a]">•</span>
                <span>Hoje, 08h47</span>
              </div>

              {/* Patient cards */}
              {patients.map((p) => (
                <div key={p.name} className="p-4 bg-white/[.02] border border-[#14142a] rounded-lg mb-3 cursor-pointer hover:bg-primary/[.03] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-[8px] h-[8px] rounded-full ${p.dot} shrink-0`} />
                    <div className="text-[.85rem] font-bold text-[#f0edf8] font-landing">
                      {p.name}, {p.age} anos
                    </div>
                  </div>
                  <div className="pl-5 space-y-1">
                    <div className="font-mono text-[.6rem] text-[#7070a0]">
                      {p.program} &nbsp;•&nbsp; {p.week}
                      {p.delta && <> &nbsp;•&nbsp; <span className="text-[#f0edf8]">{p.delta}</span></>}
                      {p.goal && <> &nbsp;•&nbsp; {p.goal}</>}
                    </div>
                    <div className="font-mono text-[.6rem] flex items-center gap-2">
                      <span className="text-[#9090b8]">Aderência: <span className={`font-bold ${p.adherence >= 80 ? "text-[#00c896]" : p.adherence >= 60 ? "text-[#ffcc00]" : "text-[#ff2d55]"}`}>{p.adherence}%</span></span>
                      <span className="text-[#2a2a4a]">•</span>
                      <span className={alertColor(p.alertType)}>{p.alert}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingCoach;
