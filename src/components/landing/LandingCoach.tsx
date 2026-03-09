import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const students = [
  { name: "Marcos Silva", status: "Cutting · Semana 4 · −2.8kg · Coach", dot: "bg-[#00c896]" },
  { name: "Juliana Costa", status: "Emagrecimento · Semana 7 · −1.1kg · Nutricionista", dot: "bg-[#ffcc00]" },
  { name: "Rafael Moura", status: "Hipertrofia · Semana 2 · +0.9kg · Personal", dot: "bg-[#ff2d55]" },
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
            Um painel B2B completo para <strong className="text-[#f0edf8]">Nutrition Coaches, Nutricionistas, Personal Trainers e profissionais de saúde</strong> que acompanham pacientes e alunos. Gerencie até 30 pessoas, receba alertas automáticos, use IA para acelerar seus atendimentos e entregue resultados que falam por si.
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
              <div className="flex justify-between items-center mb-6">
                <div className="font-heading text-[1rem] tracking-[.1em] text-primary">PAINEL PROFISSIONAL</div>
                <div className="font-mono text-[.6rem] text-[#00c896] flex items-center gap-1.5">
                  <span className="w-[5px] h-[5px] bg-[#00c896] rounded-full animate-pulse" />
                  3 alertas ativos
                </div>
              </div>
              {students.map((s) => (
                <div key={s.name} className="flex items-center gap-3.5 p-3.5 bg-white/[.02] border border-[#14142a] rounded-lg mb-2.5 cursor-pointer hover:bg-primary/[.03] transition-colors">
                  <div className="w-9 h-9 rounded-full bg-[#2a2a4a] flex items-center justify-center text-[.8rem]">👤</div>
                  <div className="flex-1">
                    <div className="text-[.82rem] font-bold text-[#f0edf8] font-landing">{s.name}</div>
                    <div className="font-mono text-[.6rem] text-[#50507a]">{s.status}</div>
                  </div>
                  <div className={`w-[7px] h-[7px] rounded-full ${s.dot}`} />
                </div>
              ))}
              <div className="mt-4 p-3 bg-[#ff2d55]/[.06] border border-[#ff2d55]/[.15] rounded-md font-mono text-[.65rem] text-[#ff8080] flex items-center gap-2">
                ⚠ Rafael não registra refeições há 2 dias — IA gerou sugestão de mensagem
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingCoach;
