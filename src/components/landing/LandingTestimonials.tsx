import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

interface TestimonialData {
  name: string;
  age: number;
  objective: string;
  weeks: number;
  rows: { label: string; before: string; after: string }[];
  quote: string;
}

const testimonials: TestimonialData[] = [
  {
    name: "Lucas M.",
    age: 29,
    objective: "Recomposição corporal",
    weeks: 8,
    rows: [
      { label: "Aderência semanal", before: "38%", after: "91%" },
      { label: "Streak máximo",     before: "3 dias", after: "47 dias" },
      { label: "Score consistência", before: "22",   after: "87" },
      { label: "Peso",              before: "86.4 kg", after: "79.1 kg" },
    ],
    quote: "Pela primeira vez eu não larguei depois de 2 semanas.",
  },
  {
    name: "Carla F.",
    age: 34,
    objective: "Definição + Performance",
    weeks: 12,
    rows: [
      { label: "Aderência semanal", before: "45%", after: "94%" },
      { label: "Streak máximo",     before: "5 dias", after: "62 dias" },
      { label: "Score consistência", before: "31",   after: "93" },
      { label: "Gordura corporal",  before: "28%",   after: "21%" },
    ],
    quote: "O app me corrigiu antes de eu errar. Parece que me conhece.",
  },
  {
    name: "Rafael T.",
    age: 41,
    objective: "Saúde metabólica",
    weeks: 6,
    rows: [
      { label: "Aderência semanal", before: "22%", after: "85%" },
      { label: "Streak máximo",     before: "1 dia", after: "34 dias" },
      { label: "Score consistência", before: "15",  after: "78" },
      { label: "Glicemia jejum",    before: "118 mg/dL", after: "94 mg/dL" },
    ],
    quote: "Meu endócrino perguntou o que eu mudei. Mostrei o app.",
  },
];

const TestimonialCard = ({ data, index }: { data: TestimonialData; index: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="relative overflow-hidden group"
      style={{
        background: "#0a0a1a",
        border: `1px solid rgba(184,146,42,0.12)`,
        transition: "border-color 0.3s ease",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(184,146,42,0.3)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(184,146,42,0.12)")}
    >
      {/* Top accent */}
      <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(184,146,42,0.45), transparent)` }} />
      <div className="hud-corner-tl" style={{ top: 0, left: 0, opacity: 0.4 }} />
      <div className="hud-corner-br" style={{ bottom: 0, right: 0, opacity: 0.4 }} />

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(184,146,42,0.08)" }}>
        <div>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.15em", color: "rgba(184,146,42,0.5)", textTransform: "uppercase" }}>
            Prontuário #{String(index + 1).padStart(3, "0")}
          </span>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#F5F0E8", marginTop: 2 }}>
            {data.name}{" "}
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(80,80,122,0.8)" }}>{data.age}a</span>
          </div>
        </div>
        <div className="text-right">
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.08em", color: "rgba(80,80,122,0.7)" }}>{data.objective}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: GOLD, marginTop: 3 }}>{data.weeks} semanas</div>
        </div>
      </div>

      {/* Data table */}
      <div className="px-5 py-4">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left pb-2" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(80,80,122,0.6)", textTransform: "uppercase", fontWeight: 400 }}>Métrica</th>
              <th className="text-center pb-2" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(80,80,122,0.6)", textTransform: "uppercase", fontWeight: 400 }}>Antes</th>
              <th className="text-center pb-2" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(80,80,122,0.6)", textTransform: "uppercase", fontWeight: 400 }}>Depois</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i} style={{ borderTop: "1px solid rgba(184,146,42,0.06)" }}>
                <td className="py-2" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem", color: "rgba(80,80,122,0.8)" }}>{row.label}</td>
                <td className="py-2 text-center" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "rgba(80,80,122,0.4)", textDecoration: "line-through", textDecorationColor: "#ff4444" }}>{row.before}</td>
                <td className="py-2 text-center" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", color: GOLD, fontWeight: 700 }}>{row.after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quote */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(184,146,42,0.08)" }}>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.8rem", color: "rgba(80,80,122,0.9)", lineHeight: 1.65, fontStyle: "italic" }}>
          "{data.quote}"
        </p>
      </div>
    </motion.div>
  );
};

const LandingTestimonials = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-24 overflow-hidden"
      style={{ background: "rgba(8,8,20,0.95)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <div className="hud-section-label justify-center mb-4">Evidência clínica</div>
        <h2
          className="font-heading leading-[.95]"
          style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
        >
          <span style={{ color: "#F5F0E8" }}>DADOS, NÃO</span>
          <br />
          <span style={{ color: GOLD, textShadow: `0 0 30px rgba(184,146,42,0.35)` }}>DEPOIMENTOS</span>
        </h2>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.88rem", color: "rgba(80,80,122,1)", marginTop: 16, maxWidth: 460, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
          Cada usuário é um caso. Aqui estão os números reais — sem edição, sem cherry-picking.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} data={t} index={i} />
        ))}
      </div>
    </section>
  );
};

export default LandingTestimonials;
