import { useRef } from "react";
import { motion, useInView } from "framer-motion";

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
      { label: "Streak máximo", before: "3 dias", after: "47 dias" },
      { label: "Score consistência", before: "22", after: "87" },
      { label: "Peso", before: "86.4 kg", after: "79.1 kg" },
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
      { label: "Streak máximo", before: "5 dias", after: "62 dias" },
      { label: "Score consistência", before: "31", after: "93" },
      { label: "Gordura corporal", before: "28%", after: "21%" },
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
      { label: "Streak máximo", before: "1 dia", after: "34 dias" },
      { label: "Score consistência", before: "15", after: "78" },
      { label: "Glicemia jejum", before: "118 mg/dL", after: "94 mg/dL" },
    ],
    quote: "Meu endócrino perguntou o que eu mudei. Mostrei o app.",
  },
];

const TestimonialCard = ({
  data,
  index,
}: {
  data: TestimonialData;
  index: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="border border-border/40 bg-card/30 backdrop-blur-sm rounded-sm p-0 overflow-hidden"
    >
      {/* Header — patient file style */}
      <div className="border-b border-border/30 px-5 py-3 flex items-center justify-between">
        <div>
          <span className="font-mono text-[.7rem] text-muted-foreground tracking-[.08em] uppercase">
            Prontuário #{String(index + 1).padStart(3, "0")}
          </span>
          <h4 className="font-heading text-[1.1rem] text-foreground mt-0.5">
            {data.name}{" "}
            <span className="text-muted-foreground font-mono text-[.75rem]">
              {data.age}a
            </span>
          </h4>
        </div>
        <div className="text-right">
          <span className="font-mono text-[.65rem] text-muted-foreground block">
            {data.objective}
          </span>
          <span className="font-mono text-[.65rem] text-primary">
            {data.weeks} semanas
          </span>
        </div>
      </div>

      {/* Data table */}
      <div className="px-5 py-4">
        <table className="w-full text-[.8rem]">
          <thead>
            <tr className="text-muted-foreground font-mono text-[.65rem] tracking-[.06em] uppercase">
              <th className="text-left pb-2 font-medium">Métrica</th>
              <th className="text-center pb-2 font-medium">Antes</th>
              <th className="text-center pb-2 font-medium">Depois</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i} className="border-t border-border/20">
                <td className="py-2 text-muted-foreground">{row.label}</td>
                <td className="py-2 text-center">
                  <span className="line-through text-muted-foreground/50 decoration-destructive">
                    {row.before}
                  </span>
                </td>
                <td className="py-2 text-center font-semibold text-primary">
                  {row.after}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quote */}
      <div className="border-t border-border/30 px-5 py-3">
        <p className="text-[.8rem] text-muted-foreground italic leading-relaxed">
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
    <section ref={ref} className="px-6 md:px-12 py-[100px] max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <span className="font-mono text-[.7rem] text-primary tracking-[.15em] uppercase block mb-3">
          Evidência clínica
        </span>
        <h2
          className="font-heading text-foreground leading-[.95]"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
        >
          DADOS, NÃO<br />
          <span className="text-primary">DEPOIMENTOS</span>
        </h2>
        <p className="text-muted-foreground text-[.9rem] mt-4 max-w-[480px] mx-auto leading-relaxed">
          Cada usuário é um caso. Aqui estão os números reais — sem edição, sem
          cherry-picking.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} data={t} index={i} />
        ))}
      </div>
    </section>
  );
};

export default LandingTestimonials;
