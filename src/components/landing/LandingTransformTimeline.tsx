import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type TrackId = "palco" | "transform" | "performance";

type Milestone = {
  label: string;
  title: string;
  desc: string;
};

type Track = {
  id: TrackId;
  emoji: string;
  name: string;
  color: string;
  milestones: Milestone[];
};

const TRACKS: Track[] = [
  {
    id: "palco",
    emoji: "🏆",
    name: "PALCO",
    color: "#e8a020",
    milestones: [
      { label: "SEM 1", title: "Protocolo de base", desc: "GEB/GET/VET calculados. Macro split para cutting definido." },
      { label: "SEM 2–4", title: "Cutting moderado", desc: "−0.7kg/semana. Muscle State rastreado diário. Ajustes automáticos." },
      { label: "SEM 5–8", title: "Déficit acelerado", desc: "Flat/Full/Spilled orientando carbos. IA comportamental em alta vigilância." },
      { label: "SEM 9–11", title: "Depleção iniciada", desc: "Sódio ajustado. Hidratação calibrada. Protocolo farma monitorado." },
      { label: "SEM 12", title: "Peak Week", desc: "7 dias calculados hora a hora. Carb load no momento exato. Diuresis natural." },
      { label: "DIA D", title: "Palco", desc: "MUSCLE STATE: FULL. Você está no pico. O protocolo fez o trabalho." },
    ],
  },
  {
    id: "transform",
    emoji: "🔥",
    name: "TRANSFORMAÇÃO",
    color: "#00f0b4",
    milestones: [
      { label: "SEM 1", title: "Diagnóstico", desc: "Mapa de vulnerabilidade criado. Padrão de sabotagem identificado." },
      { label: "SEM 2–3", title: "Plano personalizado", desc: "Protocolo alimentar ativo. Primeiros gatilhos interceptados pela IA." },
      { label: "SEM 4", title: "Hábito instalando", desc: "−2 a 3kg. Streak de 21 dias. Score acima de 80." },
      { label: "SEM 6–8", title: "Ponto crítico", desc: "A IA agiu antes do abandono. Protocolo ajustado. 87% mantiveram." },
      { label: "SEM 10–11", title: "Mudança real", desc: "−6 a 9kg. Relação com comida transformada. Fome emocional sob controle." },
      { label: "SEM 12", title: "Estilo de vida", desc: "Não é dieta. Virou estilo de vida. A mudança que não volta atrás." },
    ],
  },
  {
    id: "performance",
    emoji: "⚡",
    name: "PERFORMANCE",
    color: "#7890ff",
    milestones: [
      { label: "SEM 1", title: "Baseline esportivo", desc: "Sport nutrition baseline. VO2 max nutrition calibrado. Carb periodization iniciada." },
      { label: "SEM 2–4", title: "Pré e pós-treino", desc: "Otimizados. Hidratação calculada por treino. Recuperação rastreada." },
      { label: "SEM 5–8", title: "Ganho mensurável", desc: "Tempo de recuperação −28%. Composição corporal ajustando." },
      { label: "SEM 9–11", title: "Pico de forma", desc: "Tapering nutricional. Carb loading cronometrado." },
      { label: "SEM 12", title: "Competição", desc: "Corpo no pico de performance. Nutrição executada com precisão." },
      { label: "PÓS", title: "Recuperação", desc: "Refeed estratégico. Janela anabólica. Volta à base com ganhos." },
    ],
  },
];

const LandingTransformTimeline = () => {
  const [activeId, setActiveId] = useState<TrackId>("palco");
  const [activeIdx, setActiveIdx] = useState(0);

  const track = TRACKS.find((t) => t.id === activeId)!;
  const total = track.milestones.length;
  const progress = ((activeIdx + 1) / total) * 100;

  const switchTrack = (id: TrackId) => {
    setActiveId(id);
    setActiveIdx(0);
  };

  return (
    <section className="relative py-28 px-6 overflow-hidden bg-[#03030a]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${track.color}10, transparent 70%)`,
          transition: "background 0.6s ease",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="font-mono text-[.6rem] tracking-[.28em] text-[#e8a020]/60 mb-6">
            SUA TRANSFORMAÇÃO · SEMANA A SEMANA
          </div>
          <h2
            className="font-heading leading-[.95] mb-6 text-[#f0edf8]"
            style={{ fontSize: "clamp(2.5rem,6vw,5.5rem)" }}
          >
            O QUE ACONTECE NOS{" "}
            <span style={{ color: track.color, textShadow: `0 0 40px ${track.color}66`, transition: "color 0.5s, text-shadow 0.5s" }}>
              PRIMEIROS 90 DIAS.
            </span>
          </h2>
          <p className="font-landing text-[#f0edf8]/55 text-[.95rem] max-w-2xl mx-auto">
            Não é promessa. É o protocolo executado semana a semana.
          </p>
        </motion.div>

        {/* TABS */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-14"
        >
          {TRACKS.map((t) => {
            const isActive = activeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => switchTrack(t.id)}
                className="relative px-5 py-3 rounded-xl font-mono text-[.62rem] tracking-[.22em] transition-all duration-300"
                style={{
                  border: `1px solid ${isActive ? t.color : "#e8a02022"}`,
                  background: isActive ? `${t.color}10` : "#06061266",
                  color: isActive ? t.color : "#f0edf877",
                  boxShadow: isActive ? `0 0 30px ${t.color}33` : "none",
                }}
              >
                <span className="mr-2 text-[.9rem] align-middle">{t.emoji}</span>
                {t.name}
              </button>
            );
          })}
        </motion.div>

        {/* TIMELINE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative mb-12"
        >
          {/* progress track (background line) */}
          <div className="relative h-1 bg-[#0a0a14] rounded-full mx-2 sm:mx-6">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${track.color}, ${track.color}dd)`,
                boxShadow: `0 0 12px ${track.color}99`,
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {/* markers */}
          <div className="relative flex justify-between mt-[-14px] px-2 sm:px-6">
            {track.milestones.map((m, i) => {
              const reached = i <= activeIdx;
              const isActive = i === activeIdx;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className="group relative flex flex-col items-center"
                  style={{ flex: "0 0 auto" }}
                >
                  <motion.div
                    className="rounded-full flex items-center justify-center font-mono text-[.5rem] sm:text-[.55rem] font-bold transition-all"
                    animate={{
                      scale: isActive ? 1.25 : 1,
                    }}
                    style={{
                      width: 28,
                      height: 28,
                      background: reached ? track.color : "#0a0a14",
                      color: reached ? "#03030a" : "#f0edf855",
                      border: `1.5px solid ${reached ? track.color : "#e8a02022"}`,
                      boxShadow: isActive ? `0 0 20px ${track.color}` : "none",
                    }}
                  >
                    {i + 1}
                  </motion.div>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ background: track.color }}
                      animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <div
                    className="mt-3 font-mono text-[.5rem] sm:text-[.55rem] tracking-[.18em] whitespace-nowrap transition-colors"
                    style={{ color: reached ? track.color : "#f0edf833" }}
                  >
                    {m.label}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* CARD CONTENT */}
        <div className="relative min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeId}-${activeIdx}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-3xl mx-auto p-8 rounded-2xl backdrop-blur-sm"
              style={{
                background: "#06061299",
                border: `1px solid ${track.color}33`,
                boxShadow: `0 8px 40px ${track.color}15`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="font-mono text-[.55rem] tracking-[.22em] px-2 py-1 rounded-full"
                  style={{ background: `${track.color}15`, color: track.color, border: `1px solid ${track.color}40` }}
                >
                  {track.milestones[activeIdx].label}
                </span>
                <span className="font-mono text-[.55rem] text-[#f0edf833]">
                  {String(activeIdx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-heading text-[1.5rem] sm:text-[1.8rem] text-[#f0edf8] mb-3 leading-tight">
                {track.milestones[activeIdx].title}
              </h3>
              <p className="font-landing text-[.9rem] sm:text-[.95rem] text-[#f0edf8]/65 leading-relaxed">
                {track.milestones[activeIdx].desc}
              </p>

              {/* nav */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t" style={{ borderColor: `${track.color}18` }}>
                <button
                  onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                  disabled={activeIdx === 0}
                  className="font-mono text-[.6rem] tracking-[.2em] disabled:opacity-25 transition-opacity"
                  style={{ color: track.color }}
                >
                  ← ANTERIOR
                </button>
                <button
                  onClick={() => setActiveIdx((i) => Math.min(total - 1, i + 1))}
                  disabled={activeIdx === total - 1}
                  className="font-mono text-[.6rem] tracking-[.2em] disabled:opacity-25 transition-opacity"
                  style={{ color: track.color }}
                >
                  PRÓXIMO →
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* DISCLAIMER */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center font-mono text-[.55rem] text-[#f0edf8]/30 mt-12 max-w-xl mx-auto leading-relaxed tracking-wider"
        >
          Os resultados são representativos do protocolo executado com consistência. Resultados individuais variam.
        </motion.p>
      </div>
    </section>
  );
};

export default LandingTransformTimeline;
