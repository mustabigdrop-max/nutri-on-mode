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
    goal: "Meta: −10kg",
    adherence: 62,
    alert: "⚠ Registros irregulares esta semana",
    alertType: "warning",
    dot: "bg-[#ff2d55]",
  },
  {
    name: "Rafael Moura",
    age: 27,
    program: "Hipertrofia",
    week: "Semana 2 de 20",
    delta: "+0.9kg",
    goal: "Meta: +6kg",
    adherence: 91,
    alert: "✓ Evoluindo dentro do esperado",
    alertType: "success",
    dot: "bg-[#00c896]",
  },
];

const LandingCoach = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="coach" className="bg-[#03030a] px-6 md:px-12 py-[120px] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
            <span className="w-4 h-px bg-primary" />Painel Profissional
          </div>
          <h2 className="font-heading leading-[.92] mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}>
            PARA<br /><span className="text-primary">PROFISSIONAIS</span><br />
            <span style={{ WebkitTextStroke: "1px rgba(255,255,255,.12)", color: "transparent" }}>DA ÁREA.</span>
          </h2>
          <p className="text-[#7070a0] text-[.95rem] leading-[1.7] mt-5 max-w-[460px] font-landing">
            Um painel B2B completo para <strong className="text-[#f0edf8]">Nutrition Coaches, Nutricionistas e profissionais de saúde</strong> que acompanham pacientes e alunos. Gerencie até 30 pessoas, receba alertas automáticos, use IA para acelerar seus atendimentos e entregue resultados que falam por si.
          </p>
          <div className="mt-8 flex flex-col gap-2.5">
            {["✦ Alertas automáticos de risco", "✦ IA sugere texto de feedback", "✦ Diário fotográfico do aluno", "✦ Relatório PDF em 1 clique", "✦ White label disponível"].map((f) => (
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
                <div className="font-heading text-[1.1rem] tracking-[.08em] text-primary">PAINEL DO PROFISSIONAL</div>
                <div className="w-full h-px bg-primary/20 mt-2 mb-3" />
              </div>

              {/* Stats bar */}
              <div className="flex items-center gap-3 mb-5 font-mono text-[.6rem] text-[#9090b8]">
                <span className="flex items-center gap-1.5">
                  <span className="w-[5px] h-[5px] bg-[#ff2d55] rounded-full animate-pulse" />
                  5 alertas ativos
                </span>
                <span className="text-[#2a2a4a]">•</span>
                <span>28 pacientes</span>
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
                      {p.program} &nbsp;•&nbsp; {p.week} &nbsp;•&nbsp; <span className="text-[#f0edf8]">{p.delta}</span> &nbsp;•&nbsp; {p.goal}
                    </div>
                    <div className="font-mono text-[.6rem] flex items-center gap-2">
                      <span className="text-[#9090b8]">Aderência: <span className={`font-bold ${p.adherence >= 80 ? "text-[#00c896]" : p.adherence >= 60 ? "text-[#ffcc00]" : "text-[#ff2d55]"}`}>{p.adherence}%</span></span>
                      <span className="text-[#2a2a4a]">•</span>
                      <span className={p.alertType === "success" ? "text-[#00c896]" : "text-[#ff8080]"}>{p.alert}</span>
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
