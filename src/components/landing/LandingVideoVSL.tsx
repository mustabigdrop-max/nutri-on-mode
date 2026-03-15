import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";

/**
 * LandingVideoVSL — Video Sales Letter section.
 *
 * HOW TO USE:
 *   1. Record a 60–90s screen recording of the app in use (Loom, CapCut, iPhone screen record)
 *   2. Upload to YouTube (unlisted) or Loom
 *   3. Replace VIDEO_EMBED_URL below with your embed URL
 *
 * YouTube embed format:
 *   https://www.youtube.com/embed/VIDEO_ID?autoplay=0&rel=0&modestbranding=1
 *
 * Loom embed format:
 *   https://www.loom.com/embed/VIDEO_ID
 */
const VIDEO_EMBED_URL = ""; // ← cole aqui o link do YouTube embed ou Loom embed

const STATS = [
  { value: "68%", label: "dos usuários atingem a meta em < 90 dias" },
  { value: "4.9★", label: "avaliação média · primeiros 100 usuários" },
  { value: "2 min", label: "para ter seu protocolo personalizado" },
];

export default function LandingVideoVSL() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const hasVideo = VIDEO_EMBED_URL.length > 0;

  return (
    <section ref={ref} className="relative bg-[#06060f] px-6 md:px-12 py-[100px] overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[.04]"
        style={{ backgroundImage: "linear-gradient(rgba(232,160,32,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(232,160,32,.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(232,160,32,.05), transparent 70%)" }} />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-[#e8a020]/20 bg-[#e8a020]/[.04]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8a020] animate-pulse" />
            <span className="font-mono text-[.58rem] text-[#e8a020]/70 tracking-[.2em] uppercase">
              Veja o app ao vivo
            </span>
          </div>
          <h2
            className="font-heading leading-[.92] mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            <span className="text-[#f0edf8]">60 SEGUNDOS.</span>
            <br />
            <span style={{ color: "#e8a020", textShadow: "0 0 30px rgba(232,160,32,.35)" }}>
              VOCÊ NUNCA VIU ISSO.
            </span>
          </h2>
          <p className="font-landing text-[#60607a] text-[.9rem] max-w-sm mx-auto">
            Um protocolo de nutrição que se adapta em tempo real ao seu humor, treino e sono. Veja funcionando.
          </p>
        </motion.div>

        {/* Video player */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl overflow-hidden mb-10"
          style={{
            border: "1px solid rgba(232,160,32,.15)",
            boxShadow: "0 0 80px rgba(232,160,32,.07), 0 40px 80px rgba(0,0,0,.6)",
          }}
        >
          {/* 16:9 container */}
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>

            {hasVideo ? (
              /* Real video iframe */
              <iframe
                ref={iframeRef}
                src={`${VIDEO_EMBED_URL}&mute=${muted ? 1 : 0}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="NutriON — Demo"
              />
            ) : (
              /* Placeholder — remove when you have a real video */
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#08080f]">
                {/* Animated phone mockup preview */}
                <div className="relative flex items-center justify-center mb-8">
                  {/* Glow rings */}
                  {[1, 0.6, 0.3].map((op, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full border border-[#e8a020]"
                      style={{ width: 80 + i * 60, height: 80 + i * 60, opacity: op * 0.15 }}
                      animate={{ scale: [1, 1.08, 1], opacity: [op * 0.15, op * 0.08, op * 0.15] }}
                      transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ))}
                  {/* Play button */}
                  <div
                    className="relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ background: "rgba(232,160,32,.12)", border: "1px solid rgba(232,160,32,.3)" }}
                  >
                    <Play className="w-8 h-8 text-[#e8a020] ml-1" fill="#e8a020" />
                  </div>
                </div>

                <p className="font-heading text-[#f0edf8]/60 text-lg tracking-wide mb-1">
                  VÍDEO DEMO AQUI
                </p>
                <p className="font-mono text-[.65rem] text-[#50507a] text-center max-w-xs px-4">
                  Grave uma demonstração de 60–90s do app e cole o link embed YouTube/Loom em <span className="text-[#e8a020]">VIDEO_EMBED_URL</span> neste arquivo.
                </p>

                {/* Fake screen content hint */}
                <div className="mt-8 flex gap-4 opacity-30">
                  {["📊 Dashboard", "🧠 IA chat", "📸 Foto → kcal"].map((label) => (
                    <div key={label} className="px-3 py-1.5 rounded-lg border border-[#e8a020]/20 bg-[#e8a020]/[.04]">
                      <span className="font-mono text-[.6rem] text-[#e8a020]/60">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top-right controls overlay */}
            {hasVideo && (
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => setMuted(m => !m)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.1)", backdropFilter: "blur(8px)" }}
                >
                  {muted
                    ? <VolumeX className="w-3.5 h-3.5 text-white/60" />
                    : <Volume2 className="w-3.5 h-3.5 text-white/60" />
                  }
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-4"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.45 + i * 0.08 }}
              className="text-center p-4 rounded-xl"
              style={{ background: "rgba(232,160,32,.03)", border: "1px solid rgba(232,160,32,.08)" }}
            >
              <div className="font-heading text-[1.6rem] text-[#e8a020] leading-none mb-1">{stat.value}</div>
              <div className="font-landing text-[.7rem] text-[#60607a] leading-[1.4]">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="flex justify-center mt-10"
        >
          <a
            href="#plans"
            className="flex items-center gap-3 px-8 py-4 rounded-xl font-mono text-[.75rem] tracking-[.1em] uppercase transition-all hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #e8a020, #f5b84c)",
              color: "#000",
              boxShadow: "0 0 40px rgba(232,160,32,.25)",
              fontWeight: 600,
            }}
          >
            <Play className="w-4 h-4" fill="currentColor" />
            Quero começar agora
          </a>
        </motion.div>

      </div>
    </section>
  );
}
