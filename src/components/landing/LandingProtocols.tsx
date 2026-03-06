import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const protos = [
  { icon: "🔥", name: "Low Carb", kcalLabel: "15–25% carbo", desc: "Resistência insulínica, emagrecimento acelerado, SOP", p: 35, c: 20, f: 45, kcal: "GET − 300–500", sub: "Déficit moderado, perda consistente", forText: "Resistência insulínica · SOP · Diabetes tipo 2 · Emagrecimento acelerado" },
  { icon: "⚡", name: "Cetogênica", kcalLabel: "menos 50g carbo/dia", desc: "Cetose metabólica, queima máxima de gordura", p: 25, c: 5, f: 70, kcal: "GET − 200–400", sub: "Cetose induz déficit natural", forText: "Emagrecimento intenso · Epilepsia · Resistência severa à insulina" },
  { icon: "⏱", name: "Jejum JI", kcalLabel: "12/8 · 16/8 · 18/6 · OMAD", desc: "Autofagia, saúde metabólica, praticidade", p: 30, c: 45, f: 25, kcal: "VET ajustado à janela", sub: "Todas as kcal dentro da janela alimentar", forText: "Saúde metabólica · Autofagia · Praticidade · Perda de gordura" },
  { icon: "💪", name: "Atleta / BB", kcalLabel: "40–56 kcal/kg", desc: "Bulk · Cutting · Recomp · Peak Week", p: 30, c: 50, f: 20, kcal: "40–56 kcal/kg", sub: "Bulk +300–600 / Cutting −500 / Recomp", forText: "Hipertrofia · Definição · Peak Week · Bodybuilders · Atletas" },
  { icon: "🌿", name: "Vegano", kcalLabel: "Plant-Based completo", desc: "Proteína completa, suplementação automática", p: 28, c: 57, f: 15, kcal: "GET calculado", sub: "Mesma lógica, fontes 100% vegetais", forText: "Veganos · Vegetarianos · Saúde ambiental · Ética animal" },
];

const LandingProtocols = () => {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const d = protos[active];

  return (
    <section id="protocols" className="bg-[#080814] px-6 md:px-12 py-[120px]">
      <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
        <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-primary" />Motor de protocolos
        </div>
        <h2 className="font-heading leading-[.92] mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}>
          10 DIETAS.<br /><span className="text-primary">1 MOTOR.</span><br />
          <span style={{ WebkitTextStroke: "1px rgba(255,255,255,.12)", color: "transparent" }}>INFINITAS PESSOAS.</span>
        </h2>
      </motion.div>
      <div className="max-w-[600px] mb-[72px]">
        <p className="text-[#7070a0] text-[1rem] leading-[1.7] font-landing">Cada protocolo tem distribuição de macros calibrada, faixa de kcal por objetivo e plano alimentar gerado por IA. Troca de protocolo em 1 toque — o app recalcula tudo automaticamente.</p>
      </div>

      {/* Protocol cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-[#14142a] rounded-xl overflow-hidden mb-12">
        {protos.map((proto, i) => (
          <button
            key={proto.name}
            onClick={() => setActive(i)}
            className={`text-left p-5 md:p-7 transition-colors relative overflow-hidden ${
              active === i ? "bg-primary/[.04]" : "bg-[#03030a] hover:bg-[#0a0a18]"
            }`}
          >
            <span className={`absolute bottom-0 left-0 right-0 h-[2px] bg-primary transition-transform origin-left ${active === i ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
            <div className="text-[1.6rem] mb-3.5">{proto.icon}</div>
            <div className="font-heading text-[1.1rem] tracking-[.06em] mb-1.5 text-[#f0edf8]">{proto.name}</div>
            <div className="font-mono text-[.65rem] text-primary tracking-[.08em] mb-2.5">{proto.kcalLabel}</div>
            <div className="text-[.78rem] text-[#50507a] leading-[1.5] font-landing">{proto.desc}</div>
          </button>
        ))}
      </div>

      {/* Protocol detail */}
      <div className="bg-[#0d0d1f] border border-[#14142a] rounded-xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="font-mono text-[.62rem] text-[#50507a] tracking-[.15em] uppercase mb-3">Distribuição de Macros</div>
          <div className="flex flex-col gap-2 mt-1">
            {[
              { label: "Proteína", val: d.p, color: "#ff2d55" },
              { label: "Carboidrato", val: d.c, color: "#FFB800" },
              { label: "Gordura", val: d.f, color: "#00f0d0" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-2.5 text-[.72rem]">
                <span className="min-w-[60px] text-[#50507a]">{m.label}</span>
                <div className="flex-1 h-1 bg-[#14142a] rounded overflow-hidden">
                  <motion.div
                    className="h-full rounded"
                    style={{ background: m.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.val}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <span className="min-w-[32px] text-right font-mono text-[.62rem] text-[#50507a]">{m.val}%</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="font-mono text-[.62rem] text-[#50507a] tracking-[.15em] uppercase mb-3">Faixa de Kcal</div>
          <div className="font-heading text-[1.6rem] text-primary leading-none">{d.kcal}</div>
          <div className="text-[.78rem] text-[#6060a0] mt-1 font-landing">{d.sub}</div>
        </div>
        <div>
          <div className="font-mono text-[.62rem] text-[#50507a] tracking-[.15em] uppercase mb-3">Indicado para</div>
          <div className="text-[.82rem] text-[#7070a0] leading-[1.7] font-landing">{d.forText}</div>
        </div>
      </div>
    </section>
  );
};

export default LandingProtocols;
