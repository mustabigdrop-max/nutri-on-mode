import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Trophy, Users, Activity } from "lucide-react";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";
const GREEN = "#1D9E75";
const PURPLE = "#A78BFA";
const AMBER = "#E8A020";

const audienceCards = [
  { badge: "IFBB / COMPETIÇÃO", color: GOLD, Icon: Trophy, title: "O ATLETA",
    text: "Você compete ou quer competir. APEX diagnostica sua postura e prescreve o protocolo corretivo. Dr. VERTEX audita seu ciclo. STRATUM periodiza 7 camadas. Peak week gerado automaticamente pelo SRI. Tudo integrado. Tudo no nível que você exige." },
  { badge: "PROFISSIONAL", color: CYAN, Icon: Users, title: "O COACH",
    text: "Você prescreve para outros e precisa de escala sem perder qualidade técnica. APEX faz a análise clínica. TrainingON gera o protocolo. NutriPlan ajusta os macros. Você entrega resultado para cada aluno sem precisar de 10 ferramentas diferentes." },
  { badge: "TRANSFORMAÇÃO", color: GREEN, Icon: Activity, title: "O ESTILO DE VIDA",
    text: "Você não compete mas quer resultado real e definitivo. O perfil PCA te conhece antes de qualquer prescrição. O sistema entende seu comportamento, sua rotina e seus gatilhos. Chega de recomeçar do zero. Dessa vez é diferente porque o sistema é diferente." },
];

const AudienceCard = ({ badge, color, Icon, title, text, delay, inView }: any) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative rounded-lg transition-all"
      style={{
        background: "#0d0d1f",
        border: "0.5px solid #ffffff15",
        borderTop: hover ? `2px solid ${color}` : "0.5px solid #ffffff15",
        padding: "28px 24px",
      }}
    >
      <div
        className="inline-block px-2.5 py-1 rounded font-mono text-[10px] tracking-[.18em] mb-5"
        style={{ background: `${color}20`, color, border: `1px solid ${color}55` }}
      >
        {badge}
      </div>
      <div className="flex justify-center mb-4">
        <Icon className="w-9 h-9" style={{ color }} />
      </div>
      <div className="text-center font-heading font-bold text-white uppercase tracking-[.05em] text-lg mb-3">{title}</div>
      <p className="text-[13.5px] leading-[1.75] text-center" style={{ color: "#888" }}>{text}</p>
    </motion.div>
  );
};

const Counter = ({ to, inView }: { to: number; inView: boolean }) => {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  const [val, setVal] = useState("0");
  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, { duration: 1.5, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setVal(v));
    return () => { controls.stop(); unsub(); };
  }, [inView, to]);
  return <span>{val}</span>;
};

const Typewriter = ({ text, inView, speed = 35 }: { text: string; inView: boolean; speed?: number }) => {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [inView, text, speed]);
  return <span>{out}<span className="opacity-60">▌</span></span>;
};

const LandingManifesto = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const solRef = useRef(null);
  const solInView = useInView(solRef, { once: true, margin: "-15%" });
  const audRef = useRef(null);
  const audInView = useInView(audRef, { once: true, margin: "-10%" });
  const origRef = useRef(null);
  const origInView = useInView(origRef, { once: true, margin: "-15%" });

  return (
    <section className="bg-background px-6 md:px-12 py-[100px] border-b border-border relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(232,160,32,.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,160,32,.02) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="max-w-[1080px] mx-auto relative z-10"
      >
        {/* Label */}
        <div className="font-mono text-[.65rem] tracking-[.2em] uppercase mb-4 flex items-center gap-2.5" style={{ color: GOLD }}>
          <span className="w-4 h-px" style={{ background: GOLD }} />
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD }} />
          O que é o NUTRION
        </div>

        {/* Headline */}
        <div className="font-heading leading-[1.1] mb-14" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)" }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            Não é mais um app.
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ color: GOLD, textShadow: `0 0 30px ${GOLD}55` }}
          >
            É um sistema integrado.
          </motion.div>
        </div>


        {/* Problema + Solução */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Problema */}
          <div className="relative rounded-sm p-6 backdrop-blur-sm" style={{ background: "rgba(13,13,31,.6)", border: "1px solid #ffffff10" }}>
            <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <div className="font-mono text-[.6rem] tracking-[.22em] uppercase mb-4" style={{ color: GOLD }}>
              — O PROBLEMA
            </div>
            <div className="space-y-3 text-[.93rem] leading-[1.85] font-landing" style={{ color: "#a8a8b8" }}>
              {[
                <>Todo coach já prescreveu treino sem diagnóstico postural.</>,
                <>Todo atleta já fez ciclo sem auditoria de protocolo.</>,
                <>Todo cliente já recebeu dieta sem análise comportamental.</>,
                <>Não é erro do profissional. É limite da ferramenta.</>,
                <>O problema nunca foi motivação. Foi falta de <strong style={{ color: GOLD, fontWeight: 700 }}>sistema integrado</strong>.</>,
              ].map((node, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.8, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {node}
                </motion.p>
              ))}
            </div>

          </div>

          {/* Solução com scan line */}
          <div ref={solRef} className="relative rounded-sm p-6 backdrop-blur-sm overflow-hidden" style={{ background: "rgba(13,13,31,.6)", border: "1px solid #ffffff10" }}>
            <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${CYAN}55, transparent)` }} />
            {solInView && (
              <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-px pointer-events-none"
                style={{ background: CYAN, opacity: 0.4, boxShadow: `0 0 12px ${CYAN}` }}
              />
            )}
            <div className="font-mono text-[.6rem] tracking-[.22em] uppercase mb-4" style={{ color: GOLD }}>
              — A SOLUÇÃO
            </div>
            <div className="space-y-3 text-[.93rem] leading-[1.85] font-landing" style={{ color: "#a8a8b8" }}>
              <p>Pra quem quer resultado real e definitivo.</p>
              <p>O sistema entende seu corpo, sua rotina e seus limites.</p>
              <p>A ferramenta é a mesma. O nível de profundidade se adapta a você.</p>
            </div>
            <div className="mt-5 text-center font-heading font-bold uppercase tracking-[.06em] text-[1.05rem]" style={{ color: CYAN, textShadow: `0 0 20px ${CYAN}55` }}>
              Resultado não é sorte. É sistema.
            </div>
          </div>
        </div>



        {/* Para quem é o NUTRION */}
        <div ref={audRef} className="relative mb-20">
          <div className="font-mono text-[.65rem] tracking-[.2em] uppercase mb-6 flex items-center gap-2.5 relative overflow-hidden" style={{ color: GOLD }}>
            <span className="w-4 h-px" style={{ background: GOLD }} />
            — PARA QUEM É O NUTRION
            {audInView && (
              <motion.span
                initial={{ x: "-100%", width: "40%" }}
                animate={{ x: "250%" }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                className="absolute top-1/2 left-0 h-px pointer-events-none"
                style={{ background: CYAN, opacity: 0.5, boxShadow: `0 0 8px ${CYAN}` }}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {audienceCards.map((c, i) => (
              <AudienceCard key={c.title} {...c} delay={0.15 + i * 0.12} inView={audInView} />
            ))}
          </div>

          <p className="text-center mt-8 italic text-[14px]" style={{ color: "#888" }}>
            Qualquer que seja o seu ponto de partida — o sistema te leva mais longe do que qualquer app já conseguiu.
          </p>
        </div>

        {/* Origem do sistema */}
        <div
          ref={origRef}
          className="relative rounded-lg p-8 md:p-12 overflow-hidden"
          style={{
            background: "#0a0a1a",
            backgroundImage: "radial-gradient(circle, #ffffff08 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            border: "0.5px solid #ffffff10",
          }}
        >
          {origInView && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute top-1/4 left-0 right-0 h-px pointer-events-none"
              style={{ background: CYAN, opacity: 0.5, boxShadow: `0 0 12px ${CYAN}` }}
            />
          )}

          <div className="font-mono text-[.65rem] tracking-[.2em] uppercase mb-6 flex items-center gap-2.5" style={{ color: GOLD }}>
            <span className="w-4 h-px" style={{ background: GOLD }} />
            — ORIGEM DO SISTEMA
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <div className="font-heading font-bold leading-[1.2] text-white" style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)" }}>
              Desenvolvido com a mentalidade de quem vive dentro do esporte.
            </div>
            <div className="font-heading font-bold leading-[1.2] mt-2" style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)", color: GOLD, textShadow: `0 0 30px ${GOLD}55` }}>
              Não de fora observando.
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={origInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-6 text-[14px] leading-[1.8]"
              style={{ color: "#888" }}
            >
              Cada módulo foi testado na prática. Cada protocolo foi vivido no corpo. Cada decisão foi tomada em campo — não em sala de reunião.
            </motion.p>
          </div>

          {/* HUD status bar */}
          <div
            className="mt-8 px-4 py-2.5 font-mono text-[10px] tracking-[.15em]"
            style={{ background: "#0a0a1a", borderTop: "1px solid #ffffff10", borderBottom: "1px solid #ffffff10", color: CYAN }}
          >
            <Typewriter inView={origInView} text="SISTEMA VALIDADO · PROTOCOLO ATIVO · DESENVOLVIDO EM CAMPO · ORIGEM CONFIRMADA" />
          </div>

          {/* 3 métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
            {[
              { val: 132, label1: "COMPOSTOS", label2: "CATALOGADOS" },
              { val: 28, label1: "TESTES", label2: "CLÍNICOS" },
              { val: 7, label1: "CAMADAS", label2: "STRATUM" },
            ].map((m) => (
              <div
                key={m.label1}
                className="rounded-lg text-center"
                style={{ padding: "16px 24px", border: "0.5px solid #ffffff15", background: "rgba(13,13,31,.4)" }}
              >
                <div className="font-heading font-bold text-white text-[2.4rem] leading-none mb-1">
                  <Counter to={m.val} inView={origInView} />
                </div>
                <div className="font-mono text-[10px] tracking-[.15em] uppercase" style={{ color: "#888" }}>
                  {m.label1} {m.label2}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default LandingManifesto;
