import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const MUSCLES = [
  { name: "Peito", days: 3, status: "Pronto", tone: "teal" },
  { name: "Costas", days: 2, status: "Descansando", tone: "gold" },
  { name: "Ombros", days: 5, status: "Pronto", tone: "teal" },
  { name: "Bíceps", days: 2, status: "Descansando", tone: "gold" },
  { name: "Tríceps", days: 3, status: "Pronto", tone: "teal" },
  { name: "Quadríceps", days: 1, status: "Fatigado", tone: "red" },
  { name: "Posterior", days: 1, status: "Fatigado", tone: "red" },
  { name: "Glúteos", days: 4, status: "Pronto", tone: "teal" },
];

const TONES: Record<string, { bg: string; border: string; color: string }> = {
  teal: { bg: "rgba(0,240,180,.10)", border: "rgba(0,240,180,.25)", color: "#00f0b4" },
  gold: { bg: "rgba(232,160,32,.10)", border: "rgba(232,160,32,.25)", color: "#e8a020" },
  red: { bg: "rgba(255,68,68,.10)", border: "rgba(255,68,68,.25)", color: "#ff6868" },
};

const RPE_COLORS: Record<number, string> = {
  1: "#00f0b4", 2: "#00f0b4",
  3: "#7890ff", 4: "#7890ff", 5: "#7890ff",
  6: "#e8a020", 7: "#e8a020",
  8: "#ff8c00", 9: "#ff8c00",
  10: "#ff4444",
};

const WEEK = [
  { d: "DOM", icon: "😴", state: "off" },
  { d: "SEG", icon: "💪", state: "done", rpe: 8 },
  { d: "TER", icon: "📥", state: "done", rpe: 7 },
  { d: "QUA", icon: "😴", state: "off" },
  { d: "QUI", icon: "🦵", state: "today" },
  { d: "SEX", icon: "📤", state: "future" },
  { d: "SAB", icon: "😴", state: "off" },
];

const CountUp = ({ to, inView, duration = 1400 }: { to: number; inView: boolean; duration?: number }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    let raf = 0;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      setN(Math.round(to * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <>{n.toLocaleString("pt-BR")}</>;
};

const LandingSystemPreview = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <section ref={ref} className="px-6 md:px-12 py-[140px]" style={{ background: "#03030a" }}>
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="text-center mb-14"
      >
        <div
          className="font-mono tracking-[.28em] uppercase mb-5"
          style={{ fontSize: ".62rem", color: "#50507a" }}
        >
          Não é mockup. É o que você vê ao abrir o app.
        </div>
        <h2
          className="font-heading leading-[.92]"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "#f0edf8" }}
        >
          O SISTEMA <span style={{ color: "#e8a020", textShadow: "0 0 40px rgba(232,160,32,.5)" }}>EM AÇÃO</span>
        </h2>
      </motion.div>

      {/* App frame */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="mx-auto rounded-2xl overflow-hidden"
        style={{
          maxWidth: "1100px",
          background: "#060610",
          border: "1px solid rgba(232,160,32,.15)",
          boxShadow: "0 0 80px rgba(232,160,32,.08), 0 40px 80px rgba(0,0,0,.6)",
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "rgba(255,255,255,.04)", background: "rgba(0,0,0,.3)" }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5555" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#e8a020" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#00f0b4" }} />
          </div>
          <div className="font-mono text-[.55rem] tracking-[.2em]" style={{ color: "#50507a" }}>
            nutrion.app · dashboard
          </div>
          <div className="w-12" />
        </div>

        {/* 3 Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* PANEL 1 — TRAINING READINESS */}
          <div
            className="p-6"
            style={{ background: "#03030a", borderRight: "1px solid rgba(255,255,255,.04)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-heading text-[.85rem] tracking-[.08em]" style={{ color: "#e8a020" }}>
                TRAINING
              </span>
              <span
                className="font-heading text-[.85rem] tracking-[.08em]"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "1px #e8a020",
                }}
              >
                ON
              </span>
            </div>
            <div className="font-mono text-[.5rem] tracking-[.18em] uppercase mb-5" style={{ color: "#50507a" }}>
              Readiness Score · agora
            </div>

            <div
              className="font-heading leading-none mb-2"
              style={{
                fontSize: "5.5rem",
                color: "#00f0b4",
                textShadow: "0 0 40px rgba(0,240,180,.45)",
              }}
            >
              <CountUp to={8} inView={inView} />
            </div>
            <div className="font-mono text-[.55rem] tracking-[.15em] uppercase mb-6" style={{ color: "#6a6a8a" }}>
              Prontidão do sistema · 8/10
            </div>

            <div className="grid grid-cols-2 gap-2">
              {MUSCLES.map((m, i) => {
                const t = TONES[m.tone];
                return (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                    className="rounded-md px-2.5 py-2 border"
                    style={{ background: t.bg, borderColor: t.border }}
                  >
                    <div className="font-mono text-[.44rem] tracking-[.12em] uppercase mb-1" style={{ color: "#50507a" }}>
                      {m.name}
                    </div>
                    <div className="font-heading text-[.7rem] leading-none mb-1" style={{ color: t.color }}>
                      {m.days} {m.days === 1 ? "dia" : "dias"}
                    </div>
                    <div className="font-mono text-[.42rem] tracking-[.1em] uppercase" style={{ color: t.color, opacity: 0.85 }}>
                      {m.status}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* PANEL 2 — MACRO PROTOCOL */}
          <div
            className="p-6"
            style={{ background: "#040410", borderRight: "1px solid rgba(255,255,255,.04)" }}
          >
            <div className="font-mono text-[.5rem] tracking-[.2em] uppercase mb-1" style={{ color: "#e8a020" }}>
              Protocolo nutricional
            </div>
            <div className="font-heading text-[.85rem] mb-3" style={{ color: "#f0edf8" }}>
              Dia de Pull PPL
            </div>
            <div className="font-mono text-[.5rem] tracking-[.12em] uppercase mb-4" style={{ color: "#6a6a8a" }}>
              Costas · Bíceps · Antebraço
            </div>

            <div className="flex items-center gap-2 mb-5">
              <span className="font-mono text-[.5rem] tracking-[.18em]" style={{ color: "#e8a020" }}>VOL</span>
              <span className="font-mono text-[.65rem] tracking-[.15em]" style={{ color: "#e8a020" }}>████░</span>
              <span className="font-mono text-[.55rem]" style={{ color: "#e8a020" }}>4/5</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { v: 2240, l: "kcal", sub: "+240 ajustado", color: "#e8a020" },
                { v: 176, l: "Proteína g", sub: "+26 vs base", color: "#00f0b4" },
                { v: 280, l: "Carbo g", sub: "+28 pré-treino", color: "#7890ff" },
                { v: 65, l: "Gordura g", sub: "Equilibrado", color: "#ff8c00" },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="rounded-md p-3 border"
                  style={{
                    background: "rgba(255,255,255,.015)",
                    borderColor: "rgba(255,255,255,.05)",
                  }}
                >
                  <div className="font-heading text-[1.4rem] leading-none mb-1" style={{ color: t.color }}>
                    <CountUp to={t.v} inView={inView} />
                  </div>
                  <div className="font-mono text-[.45rem] tracking-[.12em] uppercase mb-0.5" style={{ color: "#6a6a8a" }}>
                    {t.l}
                  </div>
                  <div className="font-mono text-[.42rem]" style={{ color: t.color, opacity: 0.8 }}>
                    {t.sub}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-1.5">
              {[
                { label: "PRÉ", text: "90min antes: arroz + frango + salada", bg: "rgba(232,160,32,.10)", border: "rgba(232,160,32,.25)", color: "#e8a020" },
                { label: "INTRA", text: "Se >90min: EAA 10g intra-workout", bg: "rgba(120,144,255,.10)", border: "rgba(120,144,255,.25)", color: "#7890ff" },
                { label: "PÓS", text: "Whey 35g + aveia 50g · Leucina 3g", bg: "rgba(0,240,180,.10)", border: "rgba(0,240,180,.25)", color: "#00f0b4" },
              ].map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.9 + i * 0.1 }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border"
                  style={{ background: c.bg, borderColor: c.border }}
                >
                  <span className="font-mono text-[.5rem] tracking-[.18em] font-bold shrink-0" style={{ color: c.color }}>
                    {c.label}
                  </span>
                  <span className="font-mono text-[.5rem]" style={{ color: "rgba(240,237,248,.7)" }}>
                    {c.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* PANEL 3 — RPE + WEEK */}
          <div className="p-6" style={{ background: "#030310" }}>
            <div className="font-mono text-[.5rem] tracking-[.2em] uppercase mb-3" style={{ color: "#e8a020" }}>
              Sessão de hoje
            </div>

            <div className="flex items-baseline gap-3 mb-1">
              <div
                className="font-heading leading-none"
                style={{
                  fontSize: "5rem",
                  color: "#ff8c00",
                  textShadow: "0 0 35px rgba(255,140,0,.5)",
                }}
              >
                <CountUp to={8} inView={inView} />
              </div>
              <div className="font-mono text-[.55rem] tracking-[.15em] uppercase" style={{ color: "#6a6a8a" }}>
                RPE 8<br/>Máximo −1
              </div>
            </div>

            <div className="flex items-center gap-1 mt-4 mb-5">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                const active = n === 8;
                return (
                  <motion.div
                    key={n}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={inView ? { opacity: active ? 1 : 0.3, scale: active ? 1.15 : 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.4 + n * 0.04 }}
                    className="flex-1 h-7 rounded-sm flex items-center justify-center font-mono text-[.55rem] font-bold border"
                    style={{
                      color: active ? "#030310" : RPE_COLORS[n],
                      background: active ? RPE_COLORS[n] : "transparent",
                      borderColor: RPE_COLORS[n],
                      boxShadow: active ? `0 0 14px ${RPE_COLORS[n]}` : "none",
                    }}
                  >
                    {n}
                  </motion.div>
                );
              })}
            </div>

            {/* Deload alert */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="rounded-md p-3 mb-5 border"
              style={{ background: "rgba(255,68,68,.06)", borderColor: "rgba(255,68,68,.3)" }}
            >
              <div className="font-mono text-[.55rem] tracking-[.12em] uppercase mb-1" style={{ color: "#ff6868" }}>
                ⚠ Deload Alert
              </div>
              <div className="font-mono text-[.5rem] mb-0.5" style={{ color: "rgba(240,237,248,.7)" }}>
                3 sessões RPE ≥ 8 esta semana
              </div>
              <div className="font-mono text-[.48rem]" style={{ color: "#ff6868", opacity: 0.8 }}>
                Protocolo de deload recomendado
              </div>
            </motion.div>

            {/* Mini week */}
            <div className="grid grid-cols-7 gap-1">
              {WEEK.map((d, i) => {
                const isToday = d.state === "today";
                const isDone = d.state === "done";
                const isOff = d.state === "off";
                return (
                  <motion.div
                    key={d.d}
                    initial={{ opacity: 0, y: 6 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: 1.3 + i * 0.06 }}
                    className="rounded-sm p-1.5 text-center border relative"
                    style={{
                      background: isToday ? "rgba(232,160,32,.12)" : isDone ? "rgba(0,240,180,.06)" : "rgba(255,255,255,.02)",
                      borderColor: isToday ? "rgba(232,160,32,.5)" : isDone ? "rgba(0,240,180,.2)" : "rgba(255,255,255,.04)",
                    }}
                  >
                    <div className="font-mono text-[.4rem] tracking-[.1em] mb-0.5" style={{ color: isOff ? "#30306a" : "#6a6a8a" }}>
                      {d.d}
                    </div>
                    <div className="text-[.7rem] leading-none">{d.icon}</div>
                    {isDone && d.rpe && (
                      <div className="font-mono text-[.4rem] mt-0.5" style={{ color: "#00f0b4" }}>
                        ✓{d.rpe}
                      </div>
                    )}
                    {isToday && (
                      <span
                        className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: "#e8a020", boxShadow: "0 0 6px #e8a020" }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3 border-t"
          style={{ borderColor: "rgba(255,255,255,.04)", background: "rgba(0,0,0,.3)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#00f0b4", boxShadow: "0 0 6px rgba(0,240,180,.8)" }}
            />
            <span className="font-mono text-[.52rem] tracking-[.15em] uppercase" style={{ color: "rgba(0,240,180,.7)" }}>
              Sistema ativo · protocolo em execução
            </span>
          </div>
          <span className="font-mono text-[.52rem] tracking-[.15em]" style={{ color: "#30306a" }}>
            NUTRION v2.4.1
          </span>
        </div>
      </motion.div>

      {/* Stats below */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="max-w-[1100px] mx-auto mt-14 grid grid-cols-1 md:grid-cols-3 gap-px"
        style={{ background: "rgba(232,160,32,.08)" }}
      >
        {[
          { val: "16", label: "Splits disponíveis", sub: "Todos os tipos de treino", color: "#e8a020" },
          { val: "RPE", label: "1–10 com deload auto", sub: "Detecção de fadiga", color: "#00f0b4" },
          { val: "8", label: "Grupos musculares", sub: "Recovery heatmap", color: "#7890ff" },
        ].map((s, i) => (
          <div
            key={i}
            className="p-8 text-center"
            style={{ background: "#03030a" }}
          >
            <div
              className="font-heading leading-none mb-2"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                color: s.color,
                textShadow: `0 0 25px ${s.color}55`,
              }}
            >
              {s.val}
            </div>
            <div className="font-mono text-[.6rem] tracking-[.18em] uppercase mb-1" style={{ color: "rgba(240,237,248,.7)" }}>
              {s.label}
            </div>
            <div className="font-mono text-[.5rem] tracking-[.1em]" style={{ color: "#50507a" }}>
              {s.sub}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default LandingSystemPreview;
