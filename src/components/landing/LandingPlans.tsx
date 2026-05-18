import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { usePlanSlots } from "@/hooks/usePlanSlots";
import UpgradeModal from "@/components/landing/UpgradeModal";
import { Shield, Star, Zap } from "lucide-react";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const plans = [
  {
    name: "ON", tier: "NÍVEL I", price: "R$67", oldPrice: "R$97", discount: "31% OFF FUNDADOR",
    featured: false, accent: GOLD, accentRGB: "184,146,42",
    checkoutUrl: "https://pay.kiwify.com.br/Y6CB7tE",
    features: [
      "Onboarding inteligente por conversa",
      "Modo 'Sem Balança' — medidas visuais",
      "Diagnóstico de Sabotagem Semanal",
      "Plano Adaptativo por Humor (diário)",
      "Alerta de Janela de Oportunidade",
      "Banco 100% brasileiro (TACO/IBGE)",
      "Tracking macros + calorias",
      "Gamificação: XP, streaks, badges",
      "3 notificações/dia personalizadas",
      { text: "Plano semanal por IA", locked: true },
      { text: "Acesso ao Coach", locked: true },
    ],
    cta: "Ativar protocolo ON →",
  },
  {
    name: "ON +", tier: "NÍVEL II", price: "R$127", oldPrice: "R$197", discount: "35% OFF FUNDADOR",
    featured: true, accent: CYAN, accentRGB: "0,212,255",
    slotKey: "on_plus",
    checkoutUrl: "https://pay.kiwify.com.br/G8uxU9O",
    badge: "PREÇO DE FUNDADOR",
    features: [
      { text: "Tudo do ON +" },
      "Chat IA nutriON ilimitado",
      "Plano semanal completo por IA",
      "Receitas personalizadas por perfil",
      "Lista de compras automática",
      "Rastreamento 30+ micronutrientes",
      "Score de qualidade nutricional (0-100)",
      "Diário fotográfico antes/depois",
      "Alertas preditivos — IA age antes do erro",
      "Modo 'Comi fora' — estimativa por restaurante",
      "Foto do prato — IA identifica e registra",
      { text: "Acesso ao Coach", locked: true },
    ],
    cta: "Garantir vaga de fundador →",
  },
  {
    name: "ON PRO", tier: "NÍVEL III", price: "R$247", oldPrice: "R$397", discount: "37% OFF FUNDADOR",
    featured: false, accent: GOLD, accentRGB: "184,146,42",
    slotKey: "on_pro",
    checkoutUrl: "https://pay.kiwify.com.br/nDxfj4b",
    badge: "VAGAS LIMITADAS",
    features: [
      { text: "Tudo do ON+ +" },
      "2 check-ins mensais por vídeo/áudio",
      "Coach acessa painel em tempo real",
      "Feedback semanal personalizado",
      "Ajuste de plano pelo Coach",
      "Canal prioritário (resposta em 24h)",
      "Grupo exclusivo alunos PRO",
    ],
    cta: "Quero acompanhamento real →",
  },
];

const LandingPlans = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const { getRemaining } = usePlanSlots();
  const [modal, setModal] = useState<{ open: boolean; plan: string; feature: string }>({ open: false, plan: "", feature: "" });

  const slotBadge = (planKey: string | undefined) => {
    if (!planKey) return null;
    const remaining = getRemaining(planKey);
    if (remaining === null) return null;
    return remaining <= 0 ? "ESGOTADO" : `${remaining} VAGAS`;
  };

  return (
    <section
      id="plans"
      className="relative px-6 md:px-12 py-28 overflow-hidden"
      style={{ background: "rgba(8,8,20,0.95)" }}
    >
      {/* Corner brackets */}
      <div className="hud-corner-tl" style={{ top: 32, left: 32, opacity: 0.4 }} />
      <div className="hud-corner-tr" style={{ top: 32, right: 32, opacity: 0.4 }} />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="mb-16"
      >
        <div className="hud-section-label mb-4">Planos e preços</div>
        <h2
          className="font-heading leading-[0.9]"
          style={{ fontSize: "clamp(2.8rem, 7vw, 7rem)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
        >
          <span style={{ color: "#F5F0E8" }}>SIMPLES.</span>
          <br />
          <span style={{ color: GOLD, textShadow: `0 0 40px rgba(184,146,42,0.35)` }}>SEM SURPRESA.</span>
        </h2>
      </motion.div>

      {/* Starter tripwire */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative mb-12 overflow-hidden"
        style={{
          background: "rgba(10,10,26,0.9)",
          border: `1px solid rgba(184,146,42,0.2)`,
          padding: "1.5rem 2rem",
        }}
      >
        <div className="hud-corner-tl" style={{ top: 0, left: 0, opacity: 0.6 }} />
        <div className="hud-corner-br" style={{ bottom: 0, right: 0, opacity: 0.6 }} />
        <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(184,146,42,0.5), transparent)` }} />

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 48, height: 48,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                background: "rgba(184,146,42,0.1)",
                border: "1px solid rgba(184,146,42,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Zap className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.2em", color: "rgba(184,146,42,0.6)", textTransform: "uppercase" }}>
                Acesso Starter
              </div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "2rem", color: GOLD, lineHeight: 1, marginTop: 2 }}>
                R$9,90
              </div>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.85rem", color: "rgba(80,80,122,1)", lineHeight: 1.6 }}>
              <span style={{ color: "#F5F0E8" }}>7 dias de acesso completo ao ON+</span> — pagamento único, sem renovação automática.
            </p>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.7)", marginTop: 6 }}>
              Abata R$9,90 na primeira mensalidade se assinar em seguida
            </p>
          </div>

          <a
            href="https://pay.kiwify.com.br/VaPRGfQ"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flexShrink: 0,
              background: "transparent",
              border: `1px solid ${GOLD}`,
              color: GOLD,
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "0.7rem 1.5rem",
              clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
              transition: "all 0.25s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(184,146,42,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Experimentar R$9,90 →
          </a>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-12">
        <div className="flex-1 h-px" style={{ background: "rgba(184,146,42,0.12)" }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.2em", color: "rgba(80,80,122,0.6)", textTransform: "uppercase" }}>
          ou assine um plano completo
        </span>
        <div className="flex-1 h-px" style={{ background: "rgba(184,146,42,0.12)" }} />
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, pi) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 + pi * 0.12, duration: 0.6 }}
            className="relative overflow-hidden group"
            style={{
              background: plan.featured ? `rgba(${plan.accentRGB},0.04)` : "#0a0a1a",
              border: `1px solid rgba(${plan.accentRGB},${plan.featured ? 0.3 : 0.12})`,
              transition: "border-color 0.3s ease, transform 0.3s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = `rgba(${plan.accentRGB},0.45)`;
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = `rgba(${plan.accentRGB},${plan.featured ? 0.3 : 0.12})`;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Top accent line */}
            <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${plan.accent}, transparent)`, opacity: plan.featured ? 1 : 0.5 }} />
            {/* Corner brackets */}
            <div className="hud-corner-tl" style={{ top: 0, left: 0, borderColor: plan.accent, opacity: plan.featured ? 0.8 : 0.35 }} />
            <div className="hud-corner-br" style={{ bottom: 0, right: 0, borderColor: plan.accent, opacity: plan.featured ? 0.8 : 0.35 }} />

            <div className="p-7 md:p-8">
              {/* Tier + badges */}
              <div className="flex items-center justify-between mb-5">
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.22em", color: `rgba(${plan.accentRGB},0.6)`, textTransform: "uppercase" }}>
                  {plan.tier}
                </span>
                <div className="flex flex-col items-end gap-1">
                  {plan.badge && (
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.12em", color: "#0a0a1a", background: plan.accent, padding: "0.18rem 0.45rem" }}>
                      {plan.badge}
                    </span>
                  )}
                  {plan.slotKey && slotBadge(plan.slotKey) && (
                    <span style={{
                      fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.1em",
                      color: getRemaining(plan.slotKey!) === 0 ? "#fff" : plan.accent,
                      background: getRemaining(plan.slotKey!) === 0 ? "rgba(255,68,68,0.2)" : `rgba(${plan.accentRGB},0.1)`,
                      border: `1px solid ${getRemaining(plan.slotKey!) === 0 ? "#ff4444" : plan.accent}`,
                      padding: "0.18rem 0.45rem",
                      animation: "dotPulse 1.6s ease-in-out infinite",
                    }}>
                      {getRemaining(plan.slotKey!) === 0 ? "ESGOTADO" : `🔥 ${slotBadge(plan.slotKey)} RESTANTES`}
                    </span>
                  )}
                </div>
              </div>

              {/* Plan name */}
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.6rem", color: "#F5F0E8", letterSpacing: "0.06em", marginBottom: 16 }}>
                {plan.name}
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "3.5rem", color: plan.accent, lineHeight: 1, textShadow: `0 0 24px rgba(${plan.accentRGB},0.3)` }}>
                    {plan.price}
                  </span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", color: "rgba(80,80,122,0.8)" }}>/mês</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", color: "rgba(80,80,122,0.6)", textDecoration: "line-through" }}>{plan.oldPrice}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.1em", color: plan.accent, background: `rgba(${plan.accentRGB},0.1)`, border: `1px solid rgba(${plan.accentRGB},0.25)`, padding: "0.15rem 0.4rem" }}>
                    {plan.discount}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="mb-6 h-px" style={{ background: `linear-gradient(90deg, rgba(${plan.accentRGB},0.2), transparent)` }} />

              {/* Features */}
              <ul className="flex flex-col gap-2.5 mb-8">
                {plan.features.map((f, i) => {
                  const text = typeof f === "string" ? f : f.text;
                  const isLocked = !!(f as any).locked;
                  const plainText = text.replace(/<[^>]*>/g, "").replace("🔒", "").trim();
                  return (
                    <li
                      key={i}
                      className={`text-[.8rem] flex items-start gap-2.5 ${isLocked ? "cursor-pointer" : ""}`}
                      style={{ color: isLocked ? "rgba(40,40,60,1)" : "rgba(80,80,122,1)" }}
                      onClick={isLocked ? () => setModal({ open: true, plan: plan.name, feature: plainText }) : undefined}
                    >
                      <span style={{ color: isLocked ? "rgba(40,40,60,1)" : plan.accent, fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", marginTop: 2, flexShrink: 0 }}>
                        {isLocked ? "✗" : "→"}
                      </span>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.8rem" }}
                        dangerouslySetInnerHTML={{ __html: text.replace(/<strong>/g, `<strong style="color:rgba(245,240,232,0.8);">`).replace("🔒", "") }} />
                    </li>
                  );
                })}
              </ul>

              {/* CTA */}
              <a
                href={plan.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center relative overflow-hidden"
                style={{
                  background: plan.featured ? plan.accent : "transparent",
                  border: `1px solid rgba(${plan.accentRGB},${plan.featured ? 0 : 0.35})`,
                  color: plan.featured ? "#0a0a1a" : plan.accent,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.65rem",
                  fontWeight: plan.featured ? 700 : 400,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "0.875rem",
                  clipPath: plan.featured ? "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" : "none",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={e => {
                  if (plan.featured) {
                    e.currentTarget.style.background = "#d4a940";
                    e.currentTarget.style.boxShadow = `0 0 24px rgba(${plan.accentRGB},0.3)`;
                  } else {
                    e.currentTarget.style.background = `rgba(${plan.accentRGB},0.08)`;
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = plan.featured ? plan.accent : "transparent";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {plan.cta}
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust bar */}
      <div className="flex flex-wrap items-center justify-center gap-8 mt-12 py-4" style={{ borderTop: "1px solid rgba(184,146,42,0.08)" }}>
        {[
          { icon: Shield, text: "Cancele quando quiser" },
          { icon: Star,   text: "Pagamento seguro via Kiwify" },
          { icon: Zap,    text: "Acesso imediato" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.08em", color: "rgba(80,80,122,0.8)" }}>
            <Icon className="w-3 h-3" style={{ color: "rgba(184,146,42,0.5)" }} />
            {text}
          </div>
        ))}
      </div>

      <UpgradeModal
        open={modal.open}
        onClose={() => setModal({ open: false, plan: "", feature: "" })}
        fromPlan={modal.plan}
        lockedFeature={modal.feature}
      />
    </section>
  );
};

export default LandingPlans;
