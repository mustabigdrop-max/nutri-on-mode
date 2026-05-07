import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const protos = [
  {
    icon: "🏆",
    name: "Stage Prep",
    kcalLabel: "Cutting · Bulk · Peak Week",
    desc: "Todos os palcos: Bodybuilding, Men's Physique, Classic, Bikini, Wellness, Figure",
    p: 35, c: 45, f: 20,
    kcal: "VET ± fase",
    sub: "Periodização de fases · Depleção · Carb Load · Flat/Full/Spilled",
    forText: "Bodybuilding · Men's Physique · Classic Physique · Bikini · Wellness · Figure · Women's Physique — masculino e feminino",
  },
  {
    icon: "⚡",
    name: "Performance",
    kcalLabel: "Sport-specific protocol",
    desc: "Nutrição para rendimento esportivo: força, resistência, velocidade, explosão",
    p: 28, c: 55, f: 17,
    kcal: "GET + demanda",
    sub: "Carb loading · Hidratação · Recuperação muscular · VO2 max",
    forText: "MMA · Crossfit · Running · Natação · Futebol · Ciclismo · Tênis · Artes Marciais · Qualquer esporte",
  },
  {
    icon: "🧬",
    name: "Longevidade",
    kcalLabel: "Healthspan protocol",
    desc: "Nutrição anti-aging, marcadores biológicos e otimização hormonal para viver mais e melhor",
    p: 25, c: 45, f: 30,
    kcal: "VET neutro",
    sub: "Anti-inflamatório · Microbioma · Hormônios aging · Telômeros",
    forText: "Longevidade · Otimização hormonal · Anti-aging · Saúde metabólica · Prevenção de doenças",
  },
  {
    icon: "🔥",
    name: "Transformação",
    kcalLabel: "Low Carb · Cetogênica · JI",
    desc: "Emagrecimento inteligente com protocolos baseados em evidência. Sem sofrimento, com sistema.",
    p: 35, c: 20, f: 45,
    kcal: "GET − 300–600",
    sub: "Low Carb · Cetogênica · Jejum 16/8 · OMAD",
    forText: "Resistência insulínica · SOP · Diabetes · Obesidade · Quem quer emagrecer de vez",
  },
  {
    icon: "🌿",
    name: "Saúde & Bem-estar",
    kcalLabel: "Equilibrado · Mediterrâneo",
    desc: "Nutrição para qualidade de vida, energia, sono e saúde intestinal. Plant-based disponível.",
    p: 22, c: 55, f: 23,
    kcal: "GET neutro",
    sub: "Mediterrâneo · DASH · Plant-Based · Microbiota",
    forText: "Saúde geral · Bem-estar · Plant-Based · Veganos · Quem quer uma vida mais saudável",
  },
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
          UM MOTOR.<br /><span className="text-primary">TODOS OS</span><br />
          <span style={{ WebkitTextStroke: "1px rgba(255,255,255,.12)", color: "transparent" }}>OBJETIVOS.</span>
        </h2>
      </motion.div>
      <div className="max-w-[600px] mb-[72px]">
        <p className="text-[#7070a0] text-[1rem] leading-[1.7] font-landing">Do palco ao bem-estar. Do MMA à longevidade. Cada protocolo tem distribuição de macros calibrada, faixa de kcal por objetivo e plano alimentar gerado por IA. Troca de protocolo em 1 toque — o app recalcula tudo automaticamente.</p>
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
              { label: "Carboidrato", val: d.c, color: "#E8A020" },
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
