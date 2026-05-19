import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

type MetricKind = "performance" | "health" | "fat" | "postural";

interface Row {
  label: string;
  before: string;
  after: string;
  kind: MetricKind;
}

interface Module {
  label: string;
  color: string;
}

interface TestimonialData {
  name: string;
  age: number;
  objective: string;
  weeks: number;
  modules: Module[];
  rows: Row[];
  quote: string;
  status: string;
}

const C_CYAN = "#00D4FF";
const C_GOLD = "#B8922A";
const C_GREEN = "#1D9E75";
const C_RED = "#E24B4A";
const C_MUTED = "#888";

const moduleColors: Record<string, string> = {
  NUTRIPLAN: "#B8922A",
  TRAININGON: "#00FF78",
  APEX: "#00D4FF",
  PCA: "#A855F7",
  STRATUM: "#F59E0B",
  LAB: "#10B981",
  VERTEX: "#A855F7",
  FEMININO: "#EC4899",
  LOADTRACKER: "#00D4FF",
  "PEAK WEEK": "#F59E0B",
  MICROBIOTA: "#10B981",
};

const mod = (label: string): Module => ({
  label,
  color: moduleColors[label] ?? C_CYAN,
});

const testimonials: TestimonialData[] = [
  {
    name: "Lucas M.",
    age: 29,
    objective: "Recomposição corporal",
    weeks: 8,
    modules: [mod("NUTRIPLAN"), mod("TRAININGON"), mod("PCA"), mod("APEX")],
    rows: [
      { label: "Aderência semanal", before: "38%", after: "91%", kind: "health" },
      { label: "Streak máximo", before: "3 dias", after: "47 dias", kind: "performance" },
      { label: "Score consistência", before: "22", after: "87", kind: "performance" },
      { label: "Peso", before: "86.4 kg", after: "79.1 kg", kind: "fat" },
    ],
    quote: "Pela primeira vez eu não larguei depois de 2 semanas.",
    status: "NUTRIPLAN · TRAININGON · PCA · APEX · PROTOCOLO ENCERRADO ✓",
  },
  {
    name: "Carla F.",
    age: 34,
    objective: "Definição + Performance",
    weeks: 12,
    modules: [mod("APEX"), mod("STRATUM"), mod("PEAK WEEK")],
    rows: [
      { label: "Aderência semanal", before: "45%", after: "94%", kind: "health" },
      { label: "SRI", before: "—", after: "91", kind: "performance" },
      { label: "Score consistência", before: "31", after: "93", kind: "performance" },
      { label: "Gordura corporal", before: "28%", after: "21%", kind: "fat" },
    ],
    quote: "O app me corrigiu antes de eu errar. Parece que me conhece.",
    status: "APEX · SRI 91 · STRATUM · PEAK WEEK AUTOMÁTICA · PALCO ✓",
  },
  {
    name: "Rafael T.",
    age: 41,
    objective: "Saúde metabólica",
    weeks: 6,
    modules: [mod("LAB"), mod("MICROBIOTA"), mod("NUTRIPLAN")],
    rows: [
      { label: "Aderência semanal", before: "22%", after: "85%", kind: "health" },
      { label: "Streak máximo", before: "1 dia", after: "34 dias", kind: "performance" },
      { label: "Score consistência", before: "15", after: "78", kind: "performance" },
      { label: "Glicemia jejum", before: "118 mg/dL", after: "94 mg/dL", kind: "health" },
    ],
    quote: "Meu endócrino perguntou o que eu mudei. Mostrei o app.",
    status: "LAB INTEL · MICROBIOTA · GLICEMIA NORMALIZADA · META ATINGIDA ✓",
  },
  {
    name: "Bruno A.",
    age: 36,
    objective: "Recuperação + SRI",
    weeks: 10,
    modules: [mod("VERTEX"), mod("APEX"), mod("TRAININGON")],
    rows: [
      { label: "SRI", before: "62", after: "88", kind: "performance" },
      { label: "LCS (cadeia post.)", before: "Alt.", after: "Corrigida", kind: "postural" },
      { label: "Aderência semanal", before: "51%", after: "92%", kind: "health" },
      { label: "Dor lombar", before: "7/10", after: "1/10", kind: "fat" },
    ],
    quote: "O Vertex pegou o que três fisios não pegaram.",
    status: "VERTEX · DAMAGE CONTROL · LCS CORRIGIDA · SRI 88 ✓",
  },
  {
    name: "Marina L.",
    age: 31,
    objective: "Ciclo feminino · Body score",
    weeks: 16,
    modules: [mod("FEMININO"), mod("APEX"), mod("NUTRIPLAN")],
    rows: [
      { label: "Body score", before: "48", after: "71", kind: "performance" },
      { label: "UCS (cadeia ant.)", before: "Alt.", after: "Corrigida", kind: "postural" },
      { label: "Aderência por fase", before: "39%", after: "89%", kind: "health" },
      { label: "Gordura corporal", before: "31%", after: "24%", kind: "fat" },
    ],
    quote: "Finalmente um app que entende minhas 4 fases.",
    status: "CICLO FEMININO · 4 FASES · UCS CORRIGIDA · BODY SCORE 71 ✓",
  },
  {
    name: "Diego R.",
    age: 27,
    objective: "Hipertrofia · zero lesão",
    weeks: 20,
    modules: [mod("LOADTRACKER"), mod("APEX"), mod("TRAININGON")],
    rows: [
      { label: "Volume semanal", before: "62k kg", after: "118k kg", kind: "performance" },
      { label: "LCS", before: "Alt.", after: "Corrigida", kind: "postural" },
      { label: "Lesões no ciclo", before: "2", after: "0", kind: "fat" },
      { label: "Aderência semanal", before: "60%", after: "96%", kind: "health" },
    ],
    quote: "Carga subindo, ombro intacto. Primeira vez na vida.",
    status: "LOADTRACKER · APEX · LCS CORRIGIDA · ZERO LESÕES ✓",
  },
];

const headerStats = [
  { value: 6, suffix: "", label: "PRONTUÁRIOS\nREAIS" },
  { value: 91, suffix: "/100", label: "SRI MÁXIMO\nREGISTRADO" },
  { value: 0, suffix: "", label: "LESÕES\nPÓS-APEX" },
];

/* ---------- helpers ---------- */

const parseNumeric = (v: string) => {
  const m = v.replace(",", ".").match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};

const CountUp = ({ value, inView, duration = 1200 }: { value: string; inView: boolean; duration?: number }) => {
  const target = parseNumeric(value);
  const [n, setN] = useState(target !== null ? 0 : 0);

  useEffect(() => {
    if (!inView || target === null) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  if (target === null) return <>{value}</>;
  const isInt = Number.isInteger(target);
  const display = isInt ? Math.round(n).toString() : n.toFixed(1);
  return <>{value.replace(/-?\d+(\.\d+)?/, display)}</>;
};

const kindColor = (k: MetricKind) =>
  k === "performance" ? C_GOLD : k === "health" ? C_GREEN : k === "fat" ? C_RED : C_CYAN;

/* ---------- card ---------- */

const TestimonialCard = ({ data, index }: { data: TestimonialData; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [hover, setHover] = useState(false);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!hover) return;
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(data.status.slice(0, i));
      if (i >= data.status.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [hover, data.status]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative overflow-hidden transition-all duration-200"
      style={{
        background: "#0a0a1a",
        border: "0.5px solid #ffffff15",
        borderTop: `2px solid ${hover ? C_GOLD : C_CYAN}`,
        borderRadius: 8,
        boxShadow: hover ? `0 0 30px ${C_CYAN}1f` : `0 0 20px ${C_CYAN}14`,
      }}
    >
      {/* scan line on enter */}
      {inView && (
        <motion.div
          initial={{ y: -2, opacity: 0 }}
          animate={{ y: "100%", opacity: [0, 0.3, 0.3, 0] }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.2, ease: "linear" }}
          className="absolute left-0 right-0 pointer-events-none z-[2]"
          style={{ height: 1, background: C_CYAN, boxShadow: `0 0 8px ${C_CYAN}` }}
        />
      )}

      {/* HEADER */}
      <div
        className="flex items-start justify-between"
        style={{
          background: "#0d1520",
          padding: "12px 16px",
          borderBottom: "0.5px solid #ffffff10",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: C_CYAN,
              letterSpacing: "0.12em",
            }}
          >
            PRONTUÁRIO #{String(index + 1).padStart(3, "0")}
          </div>
          <div className="font-bold text-white text-[14px] mt-1">
            {data.name}{" "}
            <span className="text-[#888] font-normal text-[12px]">{data.age}a</span>
          </div>
        </div>
        <div className="text-right">
          <span
            className="inline-block uppercase font-semibold"
            style={{
              background: `${C_GOLD}18`,
              color: C_GOLD,
              border: `0.5px solid ${C_GOLD}55`,
              fontSize: 10,
              padding: "3px 8px",
              borderRadius: 4,
              letterSpacing: "0.06em",
            }}
          >
            {data.objective}
          </span>
          <div className="text-[#888] text-[11px] mt-1.5 font-mono">{data.weeks} semanas</div>
        </div>
      </div>

      {/* MODULE BADGES */}
      <div className="flex flex-wrap gap-1" style={{ padding: "10px 16px" }}>
        {data.modules.map((m) => (
          <span
            key={m.label}
            style={{
              background: `${m.color}1F`,
              border: `0.5px solid ${m.color}66`,
              color: m.color,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "3px 7px",
              borderRadius: 4,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* TABLE */}
      <div style={{ padding: "0 16px 4px" }}>
        <table className="w-full">
          <thead>
            <tr
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                color: C_MUTED,
                letterSpacing: "0.1em",
              }}
            >
              <th className="text-left pb-2 font-medium" style={{ borderBottom: "0.5px solid #ffffff08" }}>
                MÉTRICA
              </th>
              <th className="text-center pb-2 font-medium" style={{ borderBottom: "0.5px solid #ffffff08" }}>
                ANTES
              </th>
              <th className="text-right pb-2 font-medium" style={{ borderBottom: "0.5px solid #ffffff08" }}>
                DEPOIS
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? "#0d0d1f" : "transparent",
                  borderBottom: "0.5px solid #ffffff06",
                  height: 32,
                }}
              >
                <td className="text-white text-[12px] px-1">{row.label}</td>
                <td
                  className="text-center px-1"
                  style={{
                    color: "#ffffff30",
                    fontSize: 12,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {row.before === "—" || row.before === "" ? "—" : row.before}
                </td>
                <td
                  className="text-right px-1 font-bold"
                  style={{ color: kindColor(row.kind), fontSize: 12 }}
                >
                  <CountUp value={row.after} inView={inView} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QUOTE */}
      <div
        className="relative"
        style={{
          background: "#0d1520",
          padding: "14px 16px 14px 20px",
          borderTop: "0.5px solid #ffffff08",
          borderLeft: `2px solid ${C_GOLD}`,
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 8,
            top: 4,
            color: C_GOLD,
            opacity: 0.4,
            fontSize: 24,
            lineHeight: 1,
          }}
        >
          "
        </span>
        <p className="italic" style={{ color: C_MUTED, fontSize: 12, lineHeight: 1.6 }}>
          {data.quote}
        </p>
      </div>

      {/* STATUS BAR */}
      <div
        style={{
          background: "#060610",
          borderTop: "0.5px solid #ffffff08",
          padding: "8px 16px",
          fontFamily: "'Space Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.1em",
          color: C_GREEN,
          minHeight: 26,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {hover ? typed : data.status}
      </div>
    </motion.div>
  );
};

/* ---------- header stats ---------- */

const StatBox = ({
  value,
  suffix,
  label,
  inView,
}: {
  value: number;
  suffix: string;
  label: string;
  inView: boolean;
}) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1500;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <div className="flex-1 text-center px-4 py-5">
      <div className="font-bold text-white" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1 }}>
        {n}
        {suffix}
      </div>
      <div
        className="mt-2 whitespace-pre-line"
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.12em",
          color: C_MUTED,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/* ---------- section ---------- */

const LandingTestimonials = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className="relative px-6 md:px-12 py-[100px] max-w-6xl mx-auto">
      {/* dot grid bg */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
        aria-hidden
      >
        <defs>
          <pattern id="ldot" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#ffffff" fillOpacity="0.06" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ldot)" />
      </svg>

      <div className="relative z-[1]">
        {/* HEADLINE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 relative"
        >
          <span
            className="uppercase block mb-3"
            style={{
              fontFamily: "'Space Mono', monospace",
              color: C_CYAN,
              fontSize: 11,
              letterSpacing: "0.15em",
            }}
          >
            — EVIDÊNCIA CLÍNICA
          </span>

          {/* scan line under label */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mx-auto mb-6 origin-left"
            style={{ height: 1, width: 180, background: C_CYAN, boxShadow: `0 0 6px ${C_CYAN}` }}
          />

          <h2
            className="font-heading text-white leading-[.95]"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            DADOS, NÃO
            <br />
            <motion.span
              animate={inView ? { x: [0, -2, 1, 0], opacity: [1, 0.85, 1] } : {}}
              transition={{ duration: 0.4, delay: 0.6 }}
              style={{ color: C_GOLD, display: "inline-block" }}
            >
              DEPOIMENTOS.
            </motion.span>
          </h2>
          <p className="text-[#888] text-[.9rem] mt-5 max-w-[480px] mx-auto leading-relaxed">
            Cada usuário é um prontuário. Diagnóstico real. Protocolo real. Resultado mensurável.
          </p>
        </motion.div>

        {/* HEADER STATS */}
        <div
          className="flex items-stretch mb-12 mx-auto max-w-3xl divide-x"
          style={{
            background: "#0a0a1a",
            border: "0.5px solid #ffffff15",
            borderTop: `2px solid ${C_CYAN}`,
            borderRadius: 8,
            boxShadow: `0 0 20px ${C_CYAN}14`,
            // divide color
            ["--tw-divide-opacity" as never]: "1",
          }}
        >
          {headerStats.map((s, i) => (
            <div key={i} className="flex-1" style={{ borderLeft: i === 0 ? "none" : "0.5px solid #ffffff10" }}>
              <StatBox value={s.value} suffix={s.suffix} label={s.label} inView={inView} />
            </div>
          ))}
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} data={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingTestimonials;
