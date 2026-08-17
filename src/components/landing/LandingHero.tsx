import { useEffect, useState } from "react";

/**
 * Direção "Central de Performance Humana": grafite + ouro fosco + verde-quadra,
 * um único momento de abertura (não loop perpétuo), e o time nomeado em vez de
 * siglas de produto. Tokens ficam locais a este arquivo — o tema global
 * (--gold/--cyan) segue intocado, usado em ~200 outros componentes do app.
 */
const INK = "#14120F";
const INK_ELEVATED = "#1B1813";
const BONE = "#F4EFE3";
const DIM = "#B9AF9C";
const GOLD = "#B8922A"; // = --gold do tema global, mantido para consistência com o resto do site
const GOLD_STRONG = "#D6AE47"; // = --gold-glow do tema global
const COURT = "#4C8267"; // novo: verde-quadra, substitui o ciano neon nesta seção
const LINE = "rgba(244,239,227,0.12)";

const DISPLAY = "'Big Shoulders Display', 'Rajdhani', sans-serif";
const BODY = "'Work Sans', 'Space Grotesk', sans-serif";
const MONO = "'JetBrains Mono', 'Space Mono', monospace";

const TEAM = [
  {
    role: "Treinador",
    desc: "periodiza carga e volume toda semana",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="5.5" cy="12" r="2.5" />
        <circle cx="18.5" cy="12" r="2.5" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    role: "Nutricionista",
    desc: "ajusta macros ao seu protocolo ativo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3v7a3 3 0 0 0 3 3v8" />
        <path d="M7 3v7M10 3v7" />
        <path d="M15 3c-1.6 2.4-1.6 6.4 0 8.8V21" />
      </svg>
    ),
  },
  {
    role: "Nutrition Coach",
    desc: "acompanha adesão e comportamento",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19 10 12 14 15 20 7" />
        <path d="M15 7h5v5" />
      </svg>
    ),
  },
  {
    role: "Nutrólogo",
    desc: "lê exames e valida a estratégia",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h4l1.6-4 3 8L14 12h6" />
      </svg>
    ),
  },
];

const STATS = [
  { label: "TDEE calculado", value: "3.240 kcal" },
  { label: "1RM supino", value: "120 kg" },
  { label: "Ritmo 5km", value: "4'12/km" },
];

const LandingHero = () => {
  // phases: 0 init → 1..3 linhas de agitação → 4 headline + conteúdo assentam
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setPhase(4);
      return;
    }
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2300),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const linesDone = phase >= 4;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: INK, color: BONE, fontFamily: BODY }}
    >
      {/* Fundo: gradiente estático + textura de grade muito sutil — sem canvas, sem loop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 0%, ${GOLD}14 0%, transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(${LINE} 1px, transparent 1px), linear-gradient(90deg, ${LINE} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 20%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 20%, black 30%, transparent 75%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-24">
        {/* Status — um indicador só, sem sirene piscando */}
        <div
          className="flex items-center gap-2 mb-8"
          style={{
            opacity: linesDone ? 1 : 0,
            transition: "opacity .6s ease",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: COURT, boxShadow: `0 0 6px ${COURT}` }} />
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: COURT, textTransform: "uppercase" }}>
            Protocolo ativo
          </span>
        </div>

        {/* Linhas de agitação — tocam uma vez só, depois cedem lugar ao headline */}
        <div className="relative" style={{ minHeight: linesDone ? undefined : 168 }}>
          {!linesDone && (
            <div className="flex flex-col gap-3">
              {[
                { txt: "Você treinou.", show: phase >= 1 },
                { txt: "Você se alimentou.", show: phase >= 2 },
                { txt: "Você descansou.", show: phase >= 3 },
              ].map((l, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    fontSize: "clamp(22px, 4.4vw, 36px)",
                    textTransform: "uppercase",
                    letterSpacing: "0.01em",
                    color: DIM,
                    opacity: l.show ? 1 : 0,
                    transform: l.show ? "translateY(0)" : "translateY(8px)",
                    transition: "opacity .5s ease, transform .5s ease",
                  }}
                >
                  {l.txt}
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              opacity: linesDone ? 1 : 0,
              transform: linesDone ? "translateY(0)" : "translateY(10px)",
              transition: "opacity .7s ease, transform .7s ease",
              position: linesDone ? "static" : "absolute",
              top: 0,
              left: 0,
              width: "100%",
            }}
          >
            <h1
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: "clamp(40px, 7.2vw, 84px)",
                lineHeight: 0.98,
                textTransform: "uppercase",
                letterSpacing: "0.005em",
                margin: 0,
              }}
            >
              Seu time cuida.
              <br />
              <span style={{ color: GOLD_STRONG }}>Você evolui.</span>
            </h1>

            <div
              style={{
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: "0.16em",
                color: DIM,
                textTransform: "uppercase",
                marginTop: 18,
              }}
            >
              Nutrição · Treino · Comportamento — um sistema só
            </div>

            <p style={{ marginTop: 22, fontSize: "clamp(15px, 1.6vw, 18px)", color: DIM, maxWidth: "56ch", lineHeight: 1.6 }}>
              Chega de app genérico. Seu protocolo é desenhado por treinador, nutricionista, nutrition coach e
              nutrólogo — e evolui toda semana, executado por IA todos os dias.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-9">
              <a
                href="https://pay.kiwify.com.br/G8uxU9O"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-[filter]"
                style={{
                  background: GOLD,
                  color: INK,
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "14px 24px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
              >
                Começar agora →
              </a>
              <a
                href="#features"
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  color: DIM,
                  textTransform: "uppercase",
                  borderBottom: `1px solid ${LINE}`,
                  paddingBottom: 3,
                }}
              >
                Ver como funciona
              </a>
            </div>

            {/* Time — nomeado, não siglas */}
            <div className="flex flex-wrap gap-3 mt-14">
              {TEAM.map((t) => (
                <div
                  key={t.role}
                  className="flex items-start gap-3"
                  style={{
                    border: `1px solid ${LINE}`,
                    background: INK_ELEVATED,
                    padding: "14px 16px",
                    minWidth: 168,
                    flex: "1 1 200px",
                  }}
                >
                  <div style={{ width: 20, height: 20, color: GOLD_STRONG, flexShrink: 0, marginTop: 2 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", color: BONE }}>
                      {t.role}
                    </div>
                    <div style={{ fontSize: 12.5, color: DIM, marginTop: 3, lineHeight: 1.4 }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prova: os mesmos dados de antes, agora como uma linha só — não HUDs espalhados */}
            <div
              className="flex flex-wrap items-center gap-x-8 gap-y-2 mt-10 pt-6"
              style={{ borderTop: `1px solid ${LINE}` }}
            >
              <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", color: DIM, textTransform: "uppercase" }}>
                Seu painel, desde o dia 1
              </span>
              {STATS.map((s) => (
                <span key={s.label} style={{ fontFamily: MONO, fontSize: 12.5, color: BONE, fontVariantNumeric: "tabular-nums" }}>
                  <span style={{ color: DIM }}>{s.label} </span>
                  {s.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
