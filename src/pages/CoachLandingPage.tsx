import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Users, Palette, Globe, Shield, Brain, BarChart3, MessageSquare, Star } from "lucide-react";
import { motion } from "framer-motion";
import { HudShell, HudStatusBar, HudHex, HudPanel } from "@/components/hud/HudShell";

const plans = [
  {
    name: "nutriON Coach",
    description: "Painel com marca nutriON",
    badge: "COACH PRO",
    badgeColor: "#B8922A",
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
  },
  {
    name: "nutriON White Label",
    description: "App com sua marca própria",
    badge: "ELITE PARTNER",
    badgeColor: "#00D4FF",
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
  },
];

const FEATURES = [
  { code: "IA", label: "Protocolos por IA", icon: Brain, color: "#B8922A" },
  { code: "SC", label: "Score de Execução", icon: BarChart3, color: "#00D4FF" },
  { code: "AL", label: "Alertas Inteligentes", icon: Shield, color: "#B8922A" },
  { code: "CH", label: "Chat Integrado", icon: MessageSquare, color: "#00C896" },
  { code: "UN", label: "Pacientes Ilimitados", icon: Users, color: "#B8922A" },
  { code: "DN", label: "Domínio Próprio", icon: Globe, color: "#00D4FF" },
  { code: "WL", label: "White Label", icon: Palette, color: "#00D4FF" },
  { code: "RP", label: "Relatórios Premium", icon: Star, color: "#B8922A" },
];

const CoachLandingPage = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<Record<number, number>>({ 0: 0, 1: 0 });

  return (
    <HudShell>
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "0.08em" }}>
          <span style={{ color: "#F5F0E8" }}>NUTRI</span>
          <span style={{ color: "#B8922A", textShadow: "0 0 16px rgba(184,146,42,0.6)" }}>ON</span>
        </div>
        <HudStatusBar label="B2B PROFISSIONAIS" color="#00C896" />
      </nav>

      {/* Hero */}
      <section className="px-6 pt-12 pb-16 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="hud-tech mb-4">SISTEMA DE PERFORMANCE · MÓDULO PROFISSIONAL</p>
          <h1
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
              lineHeight: 1.05,
              letterSpacing: "0.02em",
              color: "#F5F0E8",
            }}
          >
            SUA CLÍNICA.<br />
            NOSSA TECNOLOGIA.<br />
            <span style={{ color: "#B8922A" }}>SEU RESULTADO.</span>
          </h1>
          <p className="mt-6 text-base max-w-2xl" style={{ color: "rgba(170,170,200,0.85)", fontFamily: "'Space Grotesk', sans-serif" }}>
            Alertas automáticos, protocolos gerados por IA, relatórios profissionais.
            Você foca no paciente — a tecnologia cuida do resto.
          </p>
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="px-6 py-10 max-w-5xl mx-auto">
        <p className="hud-tech mb-5">MÓDULOS ATIVOS</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="hud-panel p-4 flex flex-col items-center gap-3"
            >
              <HudHex code={f.code} color={f.color} size={48} />
              <span
                className="text-xs text-center"
                style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", color: "#F5F0E8" }}
              >
                {f.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <p className="hud-tech text-center mb-3">PRICING-MODULE · v2.4</p>
        <h2
          className="text-center mb-12"
          style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "2rem", color: "#F5F0E8", letterSpacing: "0.04em" }}
        >
          SELECIONE SEU PROTOCOLO
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan, planIdx) => (
            <HudPanel key={planIdx} tag={plan.highlight ? "MAIS POPULAR" : undefined} tagColor={plan.badgeColor}>
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: "#F5F0E8", letterSpacing: "0.03em" }}>
                      {plan.name}
                    </h3>
                  </div>
                  <div
                    className="inline-block px-2 py-0.5 mt-1"
                    style={{
                      border: `1px solid ${plan.badgeColor}55`,
                      color: plan.badgeColor,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 9,
                      letterSpacing: "0.2em",
                    }}
                  >
                    {plan.badge}
                  </div>
                  <p className="mt-3 text-sm" style={{ color: "rgba(170,170,200,0.8)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {plan.description}
                  </p>
                </div>

                {/* Tier selector */}
                <div className="space-y-2">
                  {plan.tiers.map((tier, tierIdx) => {
                    const sel = selectedTier[planIdx] === tierIdx;
                    return (
                      <button
                        key={tierIdx}
                        onClick={() => setSelectedTier(prev => ({ ...prev, [planIdx]: tierIdx }))}
                        className="w-full flex items-center justify-between p-3 text-left transition-all"
                        style={{
                          background: sel ? `${plan.badgeColor}12` : "rgba(10,10,26,0.6)",
                          border: `1px solid ${sel ? plan.badgeColor : "rgba(184,146,42,0.15)"}`,
                          clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                        }}
                      >
                        <span className="text-sm uppercase" style={{ color: "#F5F0E8", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: "0.1em" }}>
                          {tier.patients}
                        </span>
                        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, color: sel ? plan.badgeColor : "#F5F0E8" }}>
                          {tier.price}
                          <span className="text-xs ml-1" style={{ color: "rgba(80,80,122,1)" }}>{tier.period}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px]" style={{ color: "rgba(200,200,220,0.9)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.05em" }}>
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: plan.badgeColor }} />
                      <span className="uppercase">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className="hud-btn w-full"
                  style={{ background: plan.badgeColor }}
                  onClick={() => navigate("/coach/onboarding", { state: { plan: plan.highlight ? "white_label" : "coach" } })}
                >
                  ► ATIVAR · 7 DIAS GRÁTIS
                </button>
              </div>
            </HudPanel>
          ))}
        </div>
      </section>

      {/* White Label CTA */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <HudPanel tag="WL-MODULE" tagColor="#00D4FF">
            <div className="p-10 text-center">
              <HudHex code="WL" color="#00D4FF" size={64} />
              <h3
                className="mt-5 mb-3"
                style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 26, color: "#F5F0E8", letterSpacing: "0.03em" }}
              >
                SEU APP. SUA MARCA. NOSSA TECNOLOGIA.
              </h3>
              <p className="mb-7" style={{ color: "rgba(170,170,200,0.85)", fontFamily: "'Space Grotesk', sans-serif" }}>
                Zero desenvolvimento, zero manutenção. Só resultado para seus pacientes
                e receita recorrente para você.
              </p>
              <button
                className="hud-btn hud-btn-cyan"
                onClick={() => navigate("/coach/onboarding", { state: { plan: "white_label" } })}
              >
                ► INICIAR COM WHITE LABEL
              </button>
            </div>
          </HudPanel>
        </div>
      </section>

      <footer className="py-8 px-6 text-center hud-tech relative" style={{ color: "rgba(80,80,122,1)" }}>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #B8922A, transparent)" }}
        />
        NUTRION COACH © {new Date().getFullYear()} · TECNOLOGIA DE ELITE PARA PROFISSIONAIS
      </footer>
    </HudShell>
  );
};

export default CoachLandingPage;
