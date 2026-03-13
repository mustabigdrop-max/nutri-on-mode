import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { usePlanSlots } from "@/hooks/usePlanSlots";
import UpgradeModal from "@/components/landing/UpgradeModal";
import { Zap, Shield, Star, Lock } from "lucide-react";

// ─── Starter tripwire ────────────────────────────────────────────────────────
const STARTER = {
  price: "9,90",
  days: 7,
  access: "ON+",
  checkoutUrl: "https://pay.kiwify.com.br/6pXyygp",
  discount: "Abata R$9,90 na primeira mensalidade se assinar em seguida",
};

// ─── Main plans ───────────────────────────────────────────────────────────────
const plans = [
  {
    name: "ON",
    priceFrom: "97",
    price: "67",
    featured: false,
    checkoutUrl: "https://pay.kiwify.com.br/2U4q4d9",
    icon: Zap,
    tagline: "A IA que te conhece.",
    features: [
      "Onboarding inteligente por conversa (sem formulário)",
      "Modo 'Sem Balança' — medidas visuais brasileiras",
      "Diagnóstico de Sabotagem Semanal por IA",
      "Plano Adaptativo por Humor (diário)",
      "Alerta de Janela de Oportunidade (preditivo)",
      "Banco de alimentos 100% brasileiro (regionais)",
      "Tracking macros + calorias (TACO/IBGE)",
      "Gamificação: XP, streaks, badges, níveis",
      "Máx. 3 notificações/dia personalizadas",
      { text: "Plano semanal por IA", locked: true },
      { text: "Acesso ao Coach", locked: true },
    ],
    cta: "Começar agora →",
  },
  {
    name: "ON +",
    priceFrom: "197",
    price: "127",
    featured: true,
    slotKey: "on_plus",
    checkoutUrl: "https://pay.kiwify.com.br/6pXyygp",
    badge: "FUNDADOR",
    icon: Star,
    tagline: "IA completa 24h. 50 vagas.",
    features: [
      { text: "<strong>Tudo do ON</strong> +" },
      "Chat IA nutriON ilimitado (adaptado por objetivo)",
      "Plano semanal completo por IA (café/almoço/jantar/lanches)",
      "Receitas personalizadas por perfil comportamental",
      "Lista de compras automática por seção do mercado",
      "Rastreamento 30+ micronutrientes",
      "Score de qualidade nutricional diário (0-100)",
      "Diário fotográfico antes/depois com slider",
      "Alertas preditivos — IA avisa antes do erro",
      "Modo 'Comi fora' — estima macros por restaurante",
      "Foto do prato — IA identifica alimentos e registra",
      { text: "Acesso ao Coach", locked: true },
    ],
    cta: "Garantir vaga de fundador →",
  },
  {
    name: "ON PRO",
    priceFrom: "397",
    price: "247",
    featured: false,
    slotKey: "on_pro",
    checkoutUrl: "https://pay.kiwify.com.br/zbtOulj",
    badge: "VAGAS LIMITADAS",
    icon: Shield,
    tagline: "IA + Coach real. Máx. 20 alunos.",
    features: [
      { text: "<strong>Tudo do ON+</strong> +" },
      "2 check-ins mensais por vídeo/áudio com o Coach",
      "Coach acessa painel com seus dados em tempo real",
      "Feedback semanal personalizado (texto ou áudio)",
      "Ajuste de plano pelo Coach quando necessário",
      "Canal prioritário com o Coach (resposta em até 24h)",
      "Grupo exclusivo alunos PRO",
    ],
    cta: "Quero acompanhamento real →",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const LandingPlans = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const navigate = useNavigate();
  const { getRemaining } = usePlanSlots();
  const [modal, setModal] = useState<{ open: boolean; plan: string; feature: string }>({ open: false, plan: "", feature: "" });

  const slotBadge = (planKey: string | undefined) => {
    if (!planKey) return null;
    const remaining = getRemaining(planKey);
    if (remaining === null) return null;
    return remaining <= 0 ? "ESGOTADO" : `🔥 ${remaining} VAGAS`;
  };

  return (
    <section id="plans" className="bg-[#080814] px-6 md:px-12 py-[120px]">
      <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
        <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-primary" />Planos e preços
        </div>
        <h2 className="font-heading leading-[.92] mb-3" style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}>
          SIMPLES.<br /><span className="text-primary">SEM SURPRESA.</span>
        </h2>
        <p className="font-landing text-[#50507a] text-[.9rem] mb-3">
          Preços de fundador — válidos enquanto durar a fase de lançamento.
        </p>
      </motion.div>

      {/* ── Starter tripwire banner ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-10 mb-14 max-w-2xl mx-auto"
      >
        <div className="relative rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/[.06] via-primary/[.03] to-transparent p-6 md:p-8 overflow-hidden">
          {/* Glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="font-mono text-[.6rem] text-primary tracking-[.18em] uppercase mb-2">
                ACESSO DE ENTRADA
              </div>
              <h3 className="font-heading text-[1.8rem] text-[#f0edf8] leading-tight mb-1">
                Teste antes de assinar.
              </h3>
              <p className="font-landing text-[.82rem] text-[#7070a0] mb-3">
                {STARTER.days} dias de acesso <strong className="text-[#f0edf8]">completo ao ON+</strong> por um valor mínimo. Sem gratuidade — você entra com compromisso real.
              </p>
              <p className="font-mono text-[.65rem] text-primary/70">
                💡 {STARTER.discount}
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3 flex-shrink-0">
              <div className="text-center md:text-right">
                <span className="font-mono text-[.7rem] text-[#50507a]">apenas</span>
                <div className="font-heading text-[3.5rem] leading-none text-primary">
                  R${STARTER.price}
                </div>
                <span className="font-mono text-[.6rem] text-[#50507a]">pagamento único · {STARTER.days} dias</span>
              </div>
              <a
                href={STARTER.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto px-6 py-3 rounded-lg bg-primary text-black font-mono text-[.72rem] font-medium tracking-[.08em] hover:bg-black hover:text-primary hover:outline hover:outline-1 hover:outline-primary transition-all text-center whitespace-nowrap"
              >
                Testar por R${STARTER.price} →
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-10 max-w-2xl mx-auto">
        <div className="flex-1 h-px bg-[#14142a]" />
        <span className="font-mono text-[.6rem] text-[#30305a] tracking-[.15em] uppercase">ou assine um plano completo</span>
        <div className="flex-1 h-px bg-[#14142a]" />
      </div>

      {/* ── Main plans grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
        {plans.map((plan, pi) => {
          const PlanIcon = plan.icon;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + pi * 0.1 }}
              className={`bg-[#03030a] border rounded-xl p-8 md:p-9 relative overflow-hidden transition-all hover:-translate-y-1 ${
                plan.featured ? "border-primary/30 bg-primary/[.02]" : "border-[#14142a] hover:border-[#2a2a4a]"
              }`}
            >
              {/* Top glow on featured */}
              {plan.featured && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              )}

              {/* Badges */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                {plan.badge && (
                  <span className="font-mono text-[.55rem] text-black bg-primary px-2 py-1 rounded-[2px] tracking-[.1em]">
                    {plan.badge}
                  </span>
                )}
                {plan.slotKey && slotBadge(plan.slotKey) && (
                  <span className={`font-mono text-[.55rem] px-2 py-1 rounded-[2px] tracking-[.1em] animate-pulse ${
                    getRemaining(plan.slotKey) === 0
                      ? "bg-red-500 text-white"
                      : "bg-[#1a1a2e] text-primary border border-primary/30"
                  }`}>
                    {slotBadge(plan.slotKey)}
                  </span>
                )}
              </div>

              {/* Icon + Name */}
              <PlanIcon className={`w-6 h-6 mb-3 ${plan.featured ? "text-primary" : "text-[#50507a]"}`} />
              <div className="font-heading text-[1.5rem] tracking-[.08em] mb-0.5 text-[#f0edf8]">{plan.name}</div>
              <p className="font-landing text-[.75rem] text-[#50507a] mb-4">{plan.tagline}</p>

              {/* Pricing with anchor */}
              <div className="my-5">
                <div className="font-mono text-[.7rem] text-[#40405a] line-through mb-0.5">
                  de R${plan.priceFrom}/mês
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-[3.2rem] text-primary leading-none">R${plan.price}</span>
                  <span className="font-mono text-[.65rem] text-[#50507a]">/mês</span>
                </div>
                <div className="font-mono text-[.58rem] text-primary/60 mt-1">
                  ↓ {Math.round((1 - parseInt(plan.price) / parseInt(plan.priceFrom)) * 100)}% off — preço de fundador
                </div>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 mb-8">
                {plan.features.map((f, i) => {
                  const text = typeof f === "string" ? f : f.text;
                  const isLocked = !!(f as any).locked;
                  const plainText = text.replace(/<[^>]*>/g, "").trim();
                  return (
                    <li
                      key={i}
                      className={`text-[.82rem] flex items-start gap-2 font-landing ${isLocked ? "text-[#40405a] cursor-pointer hover:text-[#6060a0] transition-colors" : "text-[#7070a0]"}`}
                      onClick={isLocked ? () => setModal({ open: true, plan: plan.name, feature: plainText }) : undefined}
                    >
                      <span className={`text-[.7rem] mt-0.5 shrink-0 ${isLocked ? "text-[#40405a]" : "text-primary"}`}>
                        {isLocked ? <Lock className="w-3 h-3" /> : "→"}
                      </span>
                      <span className="[&_strong]:text-[#f0edf8]" dangerouslySetInnerHTML={{ __html: text }} />
                    </li>
                  );
                })}
              </ul>

              {/* CTA */}
              <a
                href={plan.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-3.5 rounded font-mono text-[.72rem] tracking-[.08em] transition-all ${
                  plan.featured
                    ? "bg-primary text-black font-medium hover:bg-black hover:text-primary hover:outline hover:outline-1 hover:outline-primary"
                    : "border border-[#2a2a4a] text-[#50507a] hover:border-primary hover:text-primary"
                }`}
              >
                {plan.cta}
              </a>

              {/* Guarantee micro-copy */}
              <p className="text-center font-mono text-[.58rem] text-[#30305a] mt-3">
                Cancele quando quiser · sem fidelidade
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom trust bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.6 }}
        className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-2"
      >
        {[
          "🔒 Pagamento seguro via Kiwify",
          "📄 Nota fiscal emitida",
          "🔄 Cancele com 1 clique",
          "🇧🇷 Suporte em português",
        ].map(item => (
          <span key={item} className="font-mono text-[.6rem] text-[#30305a] tracking-[.08em]">{item}</span>
        ))}
      </motion.div>

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
