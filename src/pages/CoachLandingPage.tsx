import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";
const GREEN = "#00C896";

const plans = [
  {
    id: "coach",
    code: "CP",
    name: "nutriON Coach",
    badge: "COACH PRO",
    badgeColor: GOLD,
    description: "Painel com marca nutriON",
    tiers: [
      { patients: "até 30 pacientes", price: "R$297", period: "/mês" },
      { patients: "até 100 pacientes", price: "R$497", period: "/mês" },
      { patients: "ilimitado", price: "R$997", period: "/mês" },
    ],
    features: [
      "Dashboard de pacientes completo",
      "Alertas inteligentes por IA",
      "Geração de protocolos com IA",
      "Chat com pacientes",
      "Relatórios automáticos",
      "Score de execução por paciente",
      "Gestão de exames",
      "Briefings semanais por IA",
    ],
    highlight: false,
    accentColor: GOLD,
  },
  {
    id: "white_label",
    code: "WL",
    name: "nutriON White Label",
    badge: "ELITE PARTNER",
    badgeColor: CYAN,
    description: "Sistema com sua marca própria",
    tiers: [
      { patients: "até 30 pacientes", price: "R$597", period: "/mês" },
      { patients: "até 100 pacientes", price: "R$997", period: "/mês" },
      { patients: "ilimitado", price: "R$1.997", period: "/mês" },
    ],
    features: [
      "Tudo do Coach Pro +",
      "App com sua marca própria",
      "Logo personalizado em todas as telas",
      "Cores da sua marca",
      "Domínio personalizado",
      "Splash screen com sua identidade",
      "Emails com sua marca",
      "Zero menção ao nutriON para pacientes",
    ],
    highlight: true,
    accentColor: CYAN,
  },
];

const features = [
  { code: "IA", label: "Protocolos por IA", color: GOLD },
  { code: "SC", label: "Score de Execução", color: CYAN },
  { code: "AL", label: "Alertas Inteligentes", color: GOLD },
  { code: "CH", label: "Chat Integrado", color: CYAN },
  { code: "UN", label: "Pacientes Ilimitados", color: GOLD },
  { code: "DN", label: "Domínio Próprio", color: CYAN },
  { code: "WL", label: "White Label", color: GOLD },
  { code: "RP", label: "Relatórios Premium", color: CYAN },
];

const CoachLandingPage = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<Record<number, number>>({ 0: 0, 1: 0 });

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#0a0a1a", fontFamily: "'Space Grotesk', sans-serif", color: "#F5F0E8" }}
    >
      {/* Hex grid bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(184,146,42,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,146,42,.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Scan line */}
      <div className="hud-scan-line" />

      {/* Nav */}
      <nav
        className="relative z-10 flex items-center justify-between px-8 py-4"
        style={{ borderBottom: "1px solid rgba(184,146,42,0.1)" }}
      >
        <a
          href="/"
          style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "0.06em", textDecoration: "none" }}
        >
          <span style={{ color: "#F5F0E8" }}>NUTRI</span>
          <span style={{ color: GOLD, textShadow: `0 0 20px rgba(184,146,42,0.4)` }}>ON</span>
        </a>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN, boxShadow: `0 0 6px ${GREEN}`, animation: "dotPulse 1.6s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.15em", color: "rgba(0,200,150,0.6)", textTransform: "uppercase" }}>
            B2B PROFISSIONAIS
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-12 py-24 text-center">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: 800, height: 500, background: `radial-gradient(ellipse, rgba(184,146,42,0.07) 0%, transparent 65%)` }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Tag */}
          <div className="hud-section-label mb-6">
            Sistema de Performance · Módulo Profissional
          </div>

          <h1
            className="leading-[0.9] mb-6"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "clamp(2.8rem, 8vw, 8rem)" }}
          >
            <span style={{ color: "#F5F0E8" }}>SUA CLÍNICA.</span>
            <br />
            <span style={{ color: GOLD, textShadow: `0 0 40px rgba(184,146,42,0.35)` }}>NOSSA TECNOLOGIA.</span>
            <br />
            <span style={{ color: "#F5F0E8" }}>SEU RESULTADO.</span>
          </h1>

          <p
            className="max-w-xl mx-auto mb-8"
            style={{ fontSize: "1.05rem", color: "rgba(80,80,122,1)", lineHeight: 1.7 }}
          >
            Alertas automáticos, protocolos gerados por IA, relatórios profissionais.{" "}
            <span style={{ color: "rgba(245,240,232,0.7)" }}>Você foca no paciente — o sistema cuida do resto.</span>
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate("/coach/onboarding", { state: { plan: "white_label" } })}
            style={{
              background: GOLD,
              color: "#0a0a1a",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "1.1rem 3rem",
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              border: "none",
              cursor: "pointer",
            }}
          >
            Começar grátis por 7 dias →
          </motion.button>
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 px-6 md:px-12 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "rgba(184,146,42,0.07)" }}>
            {features.map((f, i) => (
              <motion.div
                key={f.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group relative flex flex-col items-center justify-center gap-3 p-6 text-center"
                style={{ background: "#0a0a1a" }}
              >
                <span
                  className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }}
                />
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 36, height: 36,
                    background: `rgba(${f.color === GOLD ? "184,146,42" : "0,212,255"},0.08)`,
                    border: `1px solid ${f.color}33`,
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                >
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", fontWeight: 700, color: f.color }}>
                    {f.code}
                  </span>
                </div>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(245,240,232,0.7)", textTransform: "uppercase" }}>
                  {f.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="hud-section-label mb-4 text-center">Planos de Acesso</div>
          <h2
            className="text-center mb-12 leading-[0.9]"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            <span style={{ color: "#F5F0E8" }}>ESCOLHA SEU</span>{" "}
            <span style={{ color: GOLD, textShadow: `0 0 30px rgba(184,146,42,0.3)` }}>NÍVEL</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan, planIdx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: planIdx * 0.1 }}
                className="relative overflow-hidden"
                style={{
                  background: "#0a0a1a",
                  border: `1px solid ${plan.accentColor}${plan.highlight ? "44" : "1a"}`,
                  clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                }}
              >
                {plan.highlight && (
                  <div
                    className="absolute top-0 left-0 right-0 text-center py-1.5"
                    style={{
                      background: CYAN,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "0.52rem",
                      letterSpacing: "0.18em",
                      color: "#0a0a1a",
                      fontWeight: 700,
                    }}
                  >
                    MAIS POPULAR
                  </div>
                )}

                <div className={`p-7 ${plan.highlight ? "pt-10" : ""}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 44, height: 44,
                        background: `rgba(${plan.accentColor === GOLD ? "184,146,42" : "0,212,255"},0.1)`,
                        border: `1px solid ${plan.accentColor}33`,
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      }}
                    >
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", fontWeight: 700, color: plan.accentColor }}>
                        {plan.code}
                      </span>
                    </div>
                    <span
                      className="px-2 py-0.5"
                      style={{
                        border: `1px solid ${plan.badgeColor}44`,
                        color: plan.badgeColor,
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "0.48rem",
                        letterSpacing: "0.12em",
                      }}
                    >
                      {plan.badge}
                    </span>
                  </div>

                  <h3
                    className="mb-1"
                    style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "#F5F0E8", letterSpacing: "0.03em" }}
                  >
                    {plan.name}
                  </h3>
                  <p className="mb-5" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.8)" }}>
                    {plan.description.toUpperCase()}
                  </p>

                  {/* Tier selector */}
                  <div className="space-y-2 mb-5">
                    {plan.tiers.map((tier, tierIdx) => {
                      const sel = selectedTier[planIdx] === tierIdx;
                      return (
                        <button
                          key={tierIdx}
                          onClick={() => setSelectedTier(prev => ({ ...prev, [planIdx]: tierIdx }))}
                          className="w-full flex items-center justify-between transition-all text-left"
                          style={{
                            padding: "10px 14px",
                            background: sel ? `rgba(${plan.accentColor === GOLD ? "184,146,42" : "0,212,255"},0.08)` : "transparent",
                            border: `1px solid ${sel ? plan.accentColor + "44" : "rgba(184,146,42,0.1)"}`,
                          }}
                        >
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.08em", color: "rgba(245,240,232,0.7)" }}>
                            {tier.patients}
                          </span>
                          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: sel ? plan.accentColor : "#F5F0E8" }}>
                            {tier.price}
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", color: "rgba(80,80,122,0.8)", fontWeight: 400 }}>
                              {tier.period}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-7">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="shrink-0 mt-0.5" style={{ width: 12, height: 12, color: plan.accentColor }} strokeWidth={3} />
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.06em", color: "rgba(80,80,122,1)", lineHeight: 1.5 }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate("/coach/onboarding", { state: { plan: plan.id } })}
                    className="w-full transition-all"
                    style={{
                      padding: "0.9rem",
                      background: plan.highlight ? plan.accentColor : "transparent",
                      color: plan.highlight ? "#0a0a1a" : plan.accentColor,
                      border: `1px solid ${plan.accentColor}44`,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                      cursor: "pointer",
                    }}
                  >
                    Começar — 7 dias grátis →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* White Label CTA banner */}
      <section className="relative z-10 px-6 md:px-12 py-16">
        <div className="max-w-3xl mx-auto relative overflow-hidden" style={{ border: "1px solid rgba(0,212,255,0.15)", background: "rgba(0,212,255,0.03)" }}>
          <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)` }} />
          <div className="hud-corner-tl" style={{ top: 16, left: 16, opacity: 0.5 }} />
          <div className="hud-corner-br" style={{ bottom: 16, right: 16, opacity: 0.5 }} />

          <div className="p-10 text-center">
            <div
              className="inline-flex items-center justify-center mb-5"
              style={{
                width: 52, height: 52,
                background: "rgba(0,212,255,0.1)",
                border: `1px solid ${CYAN}33`,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            >
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", fontWeight: 700, color: CYAN }}>WL</span>
            </div>

            <h3
              className="mb-3 leading-[0.95]"
              style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "2.5rem", color: "#F5F0E8" }}
            >
              SEU APP. SUA MARCA.{" "}
              <span style={{ color: CYAN, textShadow: `0 0 30px rgba(0,212,255,0.3)` }}>NOSSA TECNOLOGIA.</span>
            </h3>
            <p className="mb-7" style={{ fontSize: "0.9rem", color: "rgba(80,80,122,1)", lineHeight: 1.7 }}>
              Zero desenvolvimento, zero manutenção.{" "}
              <span style={{ color: "rgba(245,240,232,0.7)" }}>Só resultado para seus pacientes e receita recorrente para você.</span>
            </p>
            <button
              onClick={() => navigate("/coach/onboarding", { state: { plan: "white_label" } })}
              style={{
                background: CYAN,
                color: "#0a0a1a",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "1rem 2.5rem",
                clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                border: "none",
                cursor: "pointer",
              }}
            >
              Ativar White Label →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 py-8 px-6 text-center"
        style={{ borderTop: "1px solid rgba(184,146,42,0.08)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-1 h-1 rounded-full" style={{ background: GOLD }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.15em", color: "rgba(184,146,42,0.4)", textTransform: "uppercase" }}>
            nutriON Coach © {new Date().getFullYear()} · Sistema Integrado de Performance Humana
          </span>
          <span className="w-1 h-1 rounded-full" style={{ background: GOLD }} />
        </div>
      </footer>
    </div>
  );
};

export default CoachLandingPage;
