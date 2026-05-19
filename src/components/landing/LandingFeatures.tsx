import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

type Mod = { num: string; icon: string; title: string; subtitle: string; text: string; color: string };

const modules: Mod[] = [
  { num: "01", icon: "👁", title: "APEX VISUAL INTELLIGENCE", subtitle: "Análise postural por IA", color: "#00D4FF", text: "33 landmarks biomecânicos. Síndromes cruzadas de Janda detectadas automaticamente. 28 testes clínicos do método Fenner por foto. Mapa de dominâncias e inibições musculares. Protocolo corretivo de 4 fases. Exercícios contraindicados por disfunção bloqueados automaticamente." },
  { num: "02", icon: "📊", title: "SIMETROGRAFIA HUD", subtitle: "Grade de análise bilateral", color: "#B8922A", text: "Grade simetrográfica automática sobre a foto. Ângulos de inclinação de ombros, quadril, joelhos e tornozelos. Diferença bilateral em cm estimada. Detecção de escoliose funcional e obliquidade pélvica." },
  { num: "03", icon: "🏆", title: "SRI — SHOW READINESS INDEX", subtitle: "Score de prontidão competitiva", color: "#E24B4A", text: "Score multidimensional para atletas IFBB. Simetria, definição, volumetria, postura, condicionamento e apresentação. Peak week ativada automaticamente quando SRI ≥ 82 a 2 semanas do palco." },
  { num: "04", icon: "⚗", title: "DR. VERTEX", subtitle: "Pharmacological Intelligence", color: "#7B2FBE", text: "85+ compostos catalogados. Auditoria de protocolo em tempo real. Análise de sinergia entre compostos. Alertas de interação farmacológica. Periodização farmacológica por fase. Ciência sem censura. Prática sem medo." },
  { num: "05", icon: "🧬", title: "NEXUS-BIO PEPTIDEVAULT", subtitle: "Enciclopédia viva de peptídeos", color: "#1D9E75", text: "132 compostos catalogados. Bioreguladores de Khavinson, peptídeos GH/IGF, blends de cutting elite, senolíticos e FOXO4-DRI. Mecanismos moleculares completos. Oracle IA responde qualquer pergunta." },
  { num: "06", icon: "🛡", title: "DAMAGE CONTROL", subtitle: "Proteção orgânica por fase", color: "#E24B4A", text: "Suplementação de suporte por órgão-alvo: hepatoproteção, cardioproteção, neuroproteção e eixo HPTA. Ajustado automaticamente pelo protocolo farmacológico ativo do Dr. VERTEX." },
  { num: "07", icon: "⚡", title: "TRAININGON / STRATUM", subtitle: "7 camadas de periodização", color: "#EF9F27", text: "Volume, intensidade, densidade, frequência, seleção, técnica e deload. Detecção de dominância de fibra muscular. Protocolos FST-7, Y3T, RP Hypertrophy. Exercícios corretivos do APEX injetados automaticamente no aquecimento." },
  { num: "08", icon: "📈", title: "LOADTRACKER PRO", subtitle: "Progressão inteligente de carga", color: "#4A90D9", text: "Histórico de carga por exercício. Progressão sugerida a cada sessão. Score de fadiga cumulativa. Deload automático quando necessário. Sem planilha. Sem estimativa." },
  { num: "09", icon: "🎯", title: "ATIVAÇÃO NEUROMUSCULAR", subtitle: "Cues de execução por exercício", color: "#1D9E75", text: "Biblioteca de ativação baseada em Miloš Sarcev, John Meadows, Neil Hill e Hany Rambod. Cue específico para cada exercício e grupo muscular. BiomechanicsVault integrado." },
  { num: "10", icon: "🍽", title: "NUTRIPLAN", subtitle: "Crononutrição PhD-level", color: "#B8922A", text: "TDEE ajustado por protocolo farmacológico ativo. GLUT-4 Sync por janela de treino. Crononutrição circadiana. 10 protocolos: Low Carb, Cetogênica, Jejum JI, Atleta/BB, Vegano e mais. Peak week automático via SRI do APEX." },
  { num: "11", icon: "🦠", title: "MICROBIOTA / GUT-BRAIN", subtitle: "Eixo intestino-cérebro", color: "#00D4FF", text: "Análise do microbioma em 4 dimensões. Impacto em composição corporal, humor e adesão ao protocolo. Ajuste automático com prebióticos, probióticos e alimentos específicos pelo perfil intestinal." },
  { num: "12", icon: "🔬", title: "LAB INTELLIGENCE", subtitle: "Interpretação de exames por IA", color: "#E24B4A", text: "Upload do exame de sangue. IA interpreta ferro, vitamina D, colesterol, TSH, glicemia, testosterona e 30+ marcadores. Cruza com o protocolo farmacológico ativo e ajusta o plano alimentar automaticamente." },
  { num: "13", icon: "🧠", title: "PCA COMPORTAMENTAL", subtitle: "4 perfis + metodologia MCE", color: "#7B2FBE", text: "Perfis AM, EI, SE e PP mapeados por entrevista comportamental. Metodologia MCE — Mindset, Comportamento, Execução — baseada em Dweck, Fogg, Clear e Baumeister. A IA age antes do abandono." },
  { num: "14", icon: "📅", title: "DAILY CHECK-IN", subtitle: "Score diário comportamental", color: "#1D9E75", text: "Humor, energia, sono e adesão avaliados diariamente. Score gerado pela IA. Alerta automático para o coach quando o atleta cai abaixo do limiar por 3 dias consecutivos." },
  { num: "15", icon: "📸", title: "DIÁRIO FOTOGRÁFICO", subtitle: "Evolução visual documentada", color: "#EF9F27", text: "Slider antes × depois em tempo real. IA analisa sequência de fotos e gera relatório de evolução visual. Card compartilhável para redes sociais. Histórico completo por data." },
  { num: "16", icon: "♀", title: "MÓDULO FEMININO", subtitle: "4 fases do ciclo integradas", color: "#E24B4A", text: "Nutrição e treino ajustados por fase menstrual. Categorias IFBB femininas. Padrões posturais específicos. Análise de celulite fibrótica. Ciclo tracker preditivo com IA. Protocolo de gestação e pós-parto." },
  { num: "17", icon: "🥇", title: "PREP COMPETITIVA", subtitle: "Do bulk ao palco", color: "#B8922A", text: "Periodização completa de off-season ao peak week. SRI monitora o condicionamento semana a semana. Peak week automática com manipulação hídrica, sódio e carboidrato pelo protocolo APEX-NutriPlan integrado." },
  { num: "18", icon: "📋", title: "PROGRESS REPORT", subtitle: "Laudo mensal automático", color: "#4A90D9", text: "Relatório PDF gerado automaticamente com gráficos de evolução, SRI/Body Score, FCS clínico, aderência ao protocolo e próximas metas. Pronto para enviar ao atleta em 1 clique." },
];

const Counter = ({ to, inView }: { to: number; inView: boolean }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1500;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <>{n}</>;
};

const Typewriter = ({ text, start }: { text: string; start: boolean }) => {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!start) return;
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [text, start]);
  return <span>{out}<span className="animate-pulse">▊</span></span>;
};

const LandingFeatures = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-10%" });

  return (
    <section id="features" className="bg-[#080814] px-6 md:px-12 py-[120px] relative overflow-hidden">
      <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="relative">
        <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-primary" />— O QUE O NUTRION ENTREGA
        </div>
        <h2 className="font-heading leading-[.92] mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}>
          <span className="block text-white">TUDO QUE A PRESCRIÇÃO</span>
          <motion.span
            className="block text-[#B8922A]"
            animate={inView ? { x: [0, -2, 2, 0, 0], opacity: [1, 0.85, 1, 0.95, 1] } : {}}
            transition={{ duration: 0.6, delay: 0.3, times: [0, 0.2, 0.4, 0.6, 1] }}
          >
            PROFISSIONAL EXIGE.
          </motion.span>
        </h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-[#888] text-[1rem] leading-[1.7] font-landing max-w-[600px] mb-12"
        >
          Cada módulo resolve um problema real.<br />Todos integrados. Todos em um sistema.
        </motion.p>
        {/* scan line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
          className="absolute left-0 right-0 bottom-0 h-px origin-left"
          style={{ background: "linear-gradient(90deg, transparent, #00D4FF, transparent)" }}
        />
      </motion.div>

      {/* Module grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-16">
        {modules.map((m, i) => (
          <motion.div
            key={m.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
            className="group relative bg-[#0d0d1f] hover:bg-[#13132a] transition-colors p-5 rounded-lg"
            style={{
              border: "0.5px solid #ffffff15",
              borderLeft: `2px solid ${m.color}`,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderLeftColor = "#00D4FF"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderLeftColor = m.color; }}
          >
            <span className="absolute top-3 right-4 font-mono text-[11px] tracking-[.1em]" style={{ color: "#B8922A" }}>{m.num}</span>
            <div className="text-[20px] mb-2.5">{m.icon}</div>
            <div className="font-heading font-bold text-[15px] uppercase tracking-[.04em] text-white mb-1">{m.title}</div>
            <div className="text-[11px] mb-3" style={{ color: m.color }}>{m.subtitle}</div>
            <p className="text-[12px] text-[#888] leading-[1.5] font-landing">{m.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Status bar HUD */}
      <div ref={statsRef} className="mt-12 bg-[#0a0a1a] rounded-lg" style={{ border: "1px solid transparent", borderTop: "1px solid #ffffff10" }}>
        <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { v: 18, l1: "MÓDULOS", l2: "ATIVOS" },
            { v: 132, l1: "COMPOSTOS", l2: "CATALOGADOS" },
            { v: 28, l1: "TESTES", l2: "CLÍNICOS" },
            { v: 7, l1: "CAMADAS", l2: "STRATUM" },
          ].map((s) => (
            <div key={s.l1} className="text-center">
              <div className="font-heading text-[2.4rem] text-[#B8922A] leading-none font-bold">
                <Counter to={s.v} inView={statsInView} />
              </div>
              <div className="font-mono text-[10px] tracking-[.15em] text-[#888] mt-2">{s.l1}</div>
              <div className="font-mono text-[10px] tracking-[.15em] text-[#666]">{s.l2}</div>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 border-t border-[#ffffff10] font-mono text-[11px] tracking-[.08em] text-[#00D4FF]">
          <Typewriter text="TODOS OS MÓDULOS INTEGRADOS · DIAGNÓSTICO ATIVO · PROTOCOLO CARREGADO · SISTEMA ON" start={statsInView} />
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
