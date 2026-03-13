import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { usePlanSlots } from "@/hooks/usePlanSlots";
import UpgradeModal from "@/components/landing/UpgradeModal";
import { Shield, Star, Zap } from "lucide-react";

const plans = [
  {
    name: "ON", price: "R$67", oldPrice: "R$97", discount: "31% off fundador", featured: false,
    checkoutUrl: "https://pay.kiwify.com.br/Y6CB7tE",
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
      { text: "Plano semanal por IA <strong>🔒</strong>", locked: true },
      { text: "Acesso ao Coach <strong>🔒</strong>", locked: true },
    ],
    cta: "Começar agora →",
  },
  {
    name: "ON +", price: "R$127", oldPrice: "R$197", discount: "35% off fundador", featured: true,
    slotKey: "on_plus",
    checkoutUrl: "https://pay.kiwify.com.br/6pXyygp",
    badge: "PREÇO DE FUNDADOR",
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
      { text: "Acesso ao Coach <strong>🔒</strong>", locked: true },
    ],
    cta: "Garantir vaga de fundador →",
  },
  {
    name: "ON PRO", price: "R$247", oldPrice: "R$397", discount: "37% off fundador", featured: false,
    slotKey: "on_pro",
    checkoutUrl: "https://pay.kiwify.com.br/zbtOulj",
    badge: "VAGAS LIMITADAS",
    features: [
      { text: "<strong>Tudo do ON+</strong> +" },
      "2 check-ins mensais por vídeo/áudio com o Coach",
      "Coach acessa painel com dados em tempo real",
      "Feedback semanal personalizado (texto ou áudio)",
      "Ajuste de plano pelo Coach quando necessário",
      "Canal prioritário com o Coach (resposta em até 24h)",
      "Grupo exclusivo alunos PRO",
      { text: "Badge dinâmico: <strong>'X vagas restantes'</strong>" },
    ],
    cta: "Quero acompanhamento real →",
  },
];

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
    return remaining <= 0
      ? "ESGOTADO"
      : `🔥 ${remaining} VAGAS RESTANTES`;
  };

  return (
    <section id="plans" className="bg-[#080814] px-6 md:px-12 py-[120px]">
      <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
        <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-primary" />Planos e preços
        </div>
        <h2 className="font-heading leading-[.92] mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}>
          SIMPLES.<br /><span className="text-primary">SEM SURPRESA.</span>
        </h2>
      </motion.div>

      {/* Starter Tripwire Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative mt-10 mb-12 rounded-xl border border-primary/30 bg-primary/[.04] p-6 md:p-8 overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-mono text-[.6rem] text-primary tracking-[.15em] uppercase">Acesso Starter</div>
              <div className="font-heading text-[1.8rem] text-[#f0edf8] leading-none mt-0.5">
                R$9,90
              </div>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <p className="text-[.88rem] text-[#a0a0c0] font-landing leading-relaxed">
              <strong className="text-[#f0edf8]">7 dias de acesso completo ao ON+</strong> — pagamento único, sem renovação automática.
            </p>
            <p className="text-[.72rem] text-[#7070a0] font-mono mt-1.5">
              Abata R$9,90 na primeira mensalidade se assinar em seguida
            </p>
          </div>
          
          <a
            href="/auth"
            onClick={(e) => { e.preventDefault(); navigate("/auth"); }}
            className="shrink-0 px-7 py-3 rounded-lg bg-primary text-black font-mono text-[.72rem] font-medium tracking-[.08em] hover:bg-black hover:text-primary hover:outline hover:outline-1 hover:outline-primary transition-all whitespace-nowrap"
          >
            EXPERIMENTAR POR R$9,90 →
          </a>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-12">
        <div className="flex-1 h-px bg-[#14142a]" />
        <span className="font-mono text-[.6rem] text-[#50507a] tracking-[.15em] uppercase">Ou assine um plano completo</span>
        <div className="flex-1 h-px bg-[#14142a]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-[#03030a] border rounded-xl p-8 md:p-9 relative overflow-hidden transition-all hover:-translate-y-1 ${
              plan.featured ? "border-primary/30 bg-primary/[.02]" : "border-[#14142a] hover:border-[#2a2a4a]"
            }`}
          >
            {(plan.badge || plan.slotKey) && (
              <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                {plan.badge && (
                  <span className="font-mono text-[.55rem] text-black bg-primary px-2 py-1 rounded-[2px] tracking-[.1em]">{plan.badge}</span>
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
            )}
            <div className="font-heading text-[1.5rem] tracking-[.08em] mb-1.5 text-[#f0edf8]">{plan.name}</div>
            
            {/* Price with anchoring */}
            <div className="my-5">
              <div className="flex items-baseline gap-2.5">
                <span className="font-heading text-[3.5rem] text-primary leading-none">{plan.price}</span>
                <span className="font-mono text-[.65rem] text-[#50507a]">/mês</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="font-mono text-[.7rem] text-[#50507a] line-through">{plan.oldPrice}</span>
                <span className="font-mono text-[.6rem] text-primary bg-primary/10 px-2 py-0.5 rounded-sm tracking-[.05em]">
                  {plan.discount}
                </span>
              </div>
            </div>

            <ul className="flex flex-col gap-2.5 mb-8">
              {plan.features.map((f, i) => {
                const text = typeof f === "string" ? f : f.text;
                const isLocked = !!(f as any).locked;
                const plainText = text.replace(/<[^>]*>/g, "").replace("🔒", "").trim();
                return (
                  <li
                    key={i}
                    className={`text-[.82rem] flex items-start gap-2 font-landing ${isLocked ? "text-[#40405a] cursor-pointer hover:text-[#6060a0] transition-colors" : "text-[#7070a0]"}`}
                    onClick={isLocked ? () => setModal({ open: true, plan: plan.name, feature: plainText }) : undefined}
                  >
                    <span className={`text-[.7rem] mt-0.5 shrink-0 ${isLocked ? "text-[#40405a]" : "text-primary"}`}>{isLocked ? "✗" : "→"}</span>
                    <span className="[&_strong]:text-[#f0edf8]" dangerouslySetInnerHTML={{ __html: text }} />
                  </li>
                );
              })}
            </ul>
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
          </div>
        ))}
      </div>

      {/* Trust bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-12 py-4">
        <div className="flex items-center gap-2 text-[.7rem] font-mono text-[#50507a]">
          <Shield className="w-3.5 h-3.5 text-primary/60" />
          Cancele quando quiser
        </div>
        <div className="flex items-center gap-2 text-[.7rem] font-mono text-[#50507a]">
          <Star className="w-3.5 h-3.5 text-primary/60" />
          Pagamento seguro via Kiwify
        </div>
        <div className="flex items-center gap-2 text-[.7rem] font-mono text-[#50507a]">
          <Zap className="w-3.5 h-3.5 text-primary/60" />
          Acesso imediato após confirmação
        </div>
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
