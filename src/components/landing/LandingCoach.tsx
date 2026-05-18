import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const patients = [
  {
    name: "Marcos Silva",
    age: 34,
    program: "Cutting",
    week: "Semana 4 de 12",
    delta: "−2.8kg",
    goal: "Meta: −8kg",
    adherence: 87,
    alert: "Abaixo da meta semanal",
    alertType: "warning",
    dotColor: "#ffcc00",
    id: "PAC-001",
  },
  {
    name: "Juliana Costa",
    age: 29,
    program: "Emagrecimento",
    week: "Semana 7 de 16",
    delta: "−4.1kg",
    goal: "Meta: −10kg",
    adherence: 62,
    alert: "Registros irregulares",
    alertType: "danger",
    dotColor: "#ff2d55",
    id: "PAC-002",
  },
  {
    name: "Rafael Moura",
    age: 27,
    program: "Hipertrofia",
    week: "Semana 2 de 20",
    delta: "+0.9kg",
    goal: "Meta: +6kg",
    adherence: 91,
    alert: "Evoluindo conforme esperado",
    alertType: "success",
    dotColor: "#00c896",
    id: "PAC-003",
  },
];

const features = [
  "Alertas automáticos de risco",
  "IA sugere texto de feedback",
  "Diário fotográfico do aluno",
  "Relatório PDF em 1 clique",
  "White label disponível",
];

const LandingCoach = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      id="coach"
      className="relative px-6 md:px-12 py-28 overflow-hidden"
      style={{ background: "#06060f" }}
    >
      {/* Side lines */}
      <div className="absolute left-0 top-0 bottom-0 w-px pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, rgba(184,146,42,0.08), transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-px pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, rgba(184,146,42,0.08), transparent)" }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 items-center">
        {/* Left */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="hud-section-label mb-5">Painel Profissional</div>
          <h2
            className="font-heading leading-[0.9] mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
          >
            <span style={{ color: "#F5F0E8" }}>PARA</span>
            <br />
            <span style={{ color: GOLD, textShadow: `0 0 40px rgba(184,146,42,0.35)` }}>PROFISSIONAIS</span>
            <br />
            <span style={{ WebkitTextStroke: "1px rgba(255,255,255,.1)", color: "transparent" }}>DA ÁREA.</span>
          </h2>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.92rem", color: "rgba(80,80,122,1)", lineHeight: 1.75, maxWidth: 460, marginTop: 16 }}>
            Painel B2B completo para{" "}
            <span style={{ color: "#F5F0E8" }}>Nutrition Coaches, Nutricionistas e profissionais de saúde</span>{" "}
            que acompanham pacientes e alunos. Gerencie até 30 pessoas, receba alertas automáticos, use IA para acelerar seus atendimentos.
          </p>

          <div className="mt-8 flex flex-col gap-2">
            {features.map((f) => (
              <div
                key={f}
                className="inline-flex items-center gap-2.5 w-fit"
                style={{
                  background: "rgba(184,146,42,0.05)",
                  border: "1px solid rgba(184,146,42,0.15)",
                  padding: "0.4rem 0.9rem",
                }}
              >
                <span style={{ color: GOLD, fontFamily: "'Space Mono', monospace", fontSize: "0.55rem" }}>→</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.08em", color: GOLD }}>{f}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Coach panel mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              background: "rgba(8,8,22,0.9)",
              border: "1px solid rgba(184,146,42,0.15)",
            }}
          >
            {/* Panel top line */}
            <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
            <div className="hud-corner-tl" style={{ top: 0, left: 0 }} />
            <div className="hud-corner-br" style={{ bottom: 0, right: 0 }} />

            {/* Panel header */}
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(184,146,42,0.08)" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.2em", color: "rgba(184,146,42,0.6)", textTransform: "uppercase" }}>
                [COACH] Painel do Profissional
              </div>
              <div className="flex items-center gap-4 mt-2" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", color: "rgba(80,80,122,0.7)" }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#ff2d55", animation: "dotPulse 1.4s ease-in-out infinite" }} />
                  5 alertas ativos
                </span>
                <span style={{ color: "rgba(30,30,50,1)" }}>·</span>
                <span>28 pacientes</span>
                <span style={{ color: "rgba(30,30,50,1)" }}>·</span>
                <span>Hoje, 08h47</span>
              </div>
            </div>

            {/* Patient list */}
            <div className="p-4 flex flex-col gap-2">
              {patients.map((p) => (
                <div
                  key={p.name}
                  className="relative overflow-hidden group cursor-pointer"
                  style={{
                    background: "rgba(10,10,26,0.7)",
                    border: "1px solid rgba(80,80,122,0.15)",
                    padding: "0.85rem 1rem",
                    transition: "border-color 0.25s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(${p.alertType === "success" ? "0,200,150" : p.alertType === "danger" ? "255,45,85" : "255,204,0"},0.3)`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(80,80,122,0.15)")}
                >
                  {/* Left border colored */}
                  <span className="absolute left-0 top-0 bottom-0 w-px" style={{ background: p.dotColor }} />

                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.dotColor, boxShadow: `0 0 6px ${p.dotColor}` }} />
                      <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#F5F0E8" }}>
                        {p.name}, {p.age}a
                      </span>
                    </div>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.45rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.5)" }}>{p.id}</span>
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", color: "rgba(80,80,122,0.7)", paddingLeft: "1rem" }}>
                    {p.program} · {p.week} · <span style={{ color: "#F5F0E8" }}>{p.delta}</span> · {p.goal}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5" style={{ paddingLeft: "1rem" }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", color: "rgba(80,80,122,0.7)" }}>
                      Aderência:{" "}
                      <span style={{ color: p.adherence >= 80 ? "#00c896" : p.adherence >= 60 ? "#ffcc00" : "#ff2d55", fontWeight: 700 }}>
                        {p.adherence}%
                      </span>
                    </span>
                    <span style={{ color: "rgba(30,30,50,1)" }}>·</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", color: p.alertType === "success" ? "#00c896" : p.alertType === "danger" ? "#ff8080" : "#ffcc00" }}>
                      {p.alertType !== "success" ? "⚠ " : "✓ "}{p.alert}
                    </span>
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
