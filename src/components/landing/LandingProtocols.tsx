import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const protos = [
  { code: "LC", name: "Low Carb", kcalLabel: "15–25% carbo", desc: "Resistência insulínica, emagrecimento acelerado, SOP", p: 35, c: 20, f: 45, kcal: "GET − 300–500", sub: "Déficit moderado, perda consistente", forText: "Resistência insulínica · SOP · Diabetes tipo 2 · Emagrecimento acelerado", color: GOLD },
  { code: "KT", name: "Cetogênica", kcalLabel: "< 50g carbo/dia", desc: "Cetose metabólica, queima máxima de gordura", p: 25, c: 5, f: 70, kcal: "GET − 200–400", sub: "Cetose induz déficit natural", forText: "Emagrecimento intenso · Epilepsia · Resistência severa à insulina", color: CYAN },
  { code: "IF", name: "Jejum JI", kcalLabel: "12/8 · 16/8 · 18/6 · OMAD", desc: "Autofagia, saúde metabólica, praticidade", p: 30, c: 45, f: 25, kcal: "VET ajustado à janela", sub: "Todas as kcal dentro da janela alimentar", forText: "Saúde metabólica · Autofagia · Praticidade · Perda de gordura", color: GOLD },
  { code: "BB", name: "Atleta / BB", kcalLabel: "40–56 kcal/kg", desc: "Bulk · Cutting · Recomp · Peak Week", p: 30, c: 50, f: 20, kcal: "40–56 kcal/kg", sub: "Bulk +300–600 / Cutting −500 / Recomp", forText: "Hipertrofia · Definição · Peak Week · Bodybuilders · Atletas", color: CYAN },
  { code: "VG", name: "Vegano", kcalLabel: "Plant-Based completo", desc: "Proteína completa, suplementação automática", p: 28, c: 57, f: 15, kcal: "GET calculado", sub: "Mesma lógica, fontes 100% vegetais", forText: "Veganos · Vegetarianos · Saúde ambiental · Ética animal", color: GOLD },
];

const macroColors: Record<string, string> = {
  Proteína: "#ff2d55",
  Carboidrato: GOLD,
  Gordura: CYAN,
};

const LandingProtocols = () => {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const d = protos[active];

  return (
    <section
      id="protocols"
      className="relative px-6 md:px-12 py-28 overflow-hidden"
      style={{ background: "#0a0a1a" }}
    >
      {/* Scan line */}
      <div className="hud-scan-line" />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <div className="hud-section-label mb-4">Motor de protocolos</div>
        <h2
          className="font-heading leading-[0.9] mb-6"
          style={{ fontSize: "clamp(2.8rem, 7vw, 7rem)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
        >
          <span style={{ color: "#F5F0E8" }}>10 DIETAS.</span>
          <br />
          <span style={{ color: GOLD, textShadow: `0 0 40px rgba(184,146,42,0.35)` }}>1 MOTOR.</span>
          <br />
          <span style={{ WebkitTextStroke: "1px rgba(255,255,255,.1)", color: "transparent" }}>INFINITAS PESSOAS.</span>
        </h2>
      </motion.div>

      <div className="max-w-[560px] mb-16">
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.95rem", color: "rgba(80,80,122,1)", lineHeight: 1.75 }}>
          Cada protocolo tem distribuição de macros calibrada, faixa de kcal por objetivo e plano gerado por IA. Troca em 1 toque — o app recalcula tudo automaticamente.
        </p>
      </div>

      {/* Protocol selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px mb-10" style={{ background: "rgba(184,146,42,0.08)" }}>
        {protos.map((proto, i) => (
          <button
            key={proto.name}
            onClick={() => setActive(i)}
            className="relative text-left overflow-hidden transition-all"
            style={{
              background: active === i ? `rgba(${proto.color === GOLD ? "184,146,42" : "0,212,255"},0.05)` : "#0a0a1a",
              padding: "1.5rem",
              borderBottom: active === i ? `2px solid ${proto.color}` : "2px solid transparent",
            }}
          >
            {/* Hex icon */}
            <div
              className="mb-3 flex items-center justify-center"
              style={{
                width: 36, height: 36,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                background: active === i ? `rgba(${proto.color === GOLD ? "184,146,42" : "0,212,255"},0.15)` : "rgba(30,30,50,0.8)",
                border: `1px solid ${active === i ? proto.color : "rgba(80,80,122,0.2)"}33`,
              }}
            >
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", fontWeight: 700, color: active === i ? proto.color : "rgba(80,80,122,0.7)", letterSpacing: "0.05em" }}>
                {proto.code}
              </span>
            </div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.05em", color: active === i ? "#F5F0E8" : "rgba(245,240,232,0.5)", marginBottom: 4 }}>
              {proto.name}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.08em", color: active === i ? proto.color : "rgba(80,80,122,0.5)", marginBottom: 8 }}>
              {proto.kcalLabel}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.72rem", color: "rgba(80,80,122,0.7)", lineHeight: 1.5 }}>
              {proto.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Protocol detail */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden"
        style={{
          background: "rgba(10,10,26,0.9)",
          border: `1px solid rgba(${d.color === GOLD ? "184,146,42" : "0,212,255"},0.15)`,
          padding: "2rem 2.5rem",
        }}
      >
        <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${d.color}, transparent)` }} />
        <div className="hud-corner-tl" style={{ top: 0, left: 0, borderColor: d.color, opacity: 0.5 }} />
        <div className="hud-corner-br" style={{ bottom: 0, right: 0, borderColor: d.color, opacity: 0.5 }} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Macros */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.22em", color: "rgba(80,80,122,0.7)", textTransform: "uppercase", marginBottom: 16 }}>
              [DIST] Distribuição de Macros
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: "Proteína",    val: d.p },
                { label: "Carboidrato", val: d.c },
                { label: "Gordura",     val: d.f },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-3">
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", color: "rgba(80,80,122,0.7)", minWidth: 72 }}>{m.label}</span>
                  <div className="flex-1 h-1 overflow-hidden" style={{ background: "rgba(30,30,50,0.8)" }}>
                    <motion.div
                      style={{ height: "100%", background: macroColors[m.label] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${m.val}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", color: macroColors[m.label], minWidth: 28, textAlign: "right" }}>{m.val}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Kcal */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.22em", color: "rgba(80,80,122,0.7)", textTransform: "uppercase", marginBottom: 16 }}>
              [KCAL] Faixa Energética
            </div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.8rem", color: d.color, lineHeight: 1, textShadow: `0 0 20px ${d.color}44` }}>
              {d.kcal}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem", color: "rgba(80,80,122,0.8)", marginTop: 8 }}>
              {d.sub}
            </div>
          </div>

          {/* For whom */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.22em", color: "rgba(80,80,122,0.7)", textTransform: "uppercase", marginBottom: 16 }}>
              [IND] Indicado para
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.82rem", color: "rgba(80,80,122,1)", lineHeight: 1.75 }}>
              {d.forText}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default LandingProtocols;
