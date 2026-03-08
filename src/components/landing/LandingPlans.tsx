import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { usePlanSlots } from "@/hooks/usePlanSlots";
import UpgradeModal from "@/components/landing/UpgradeModal";

const plans = [
  {
    name: "ON", price: "R$47", featured: false,
    features: [
      "Dietas prontas segmentadas por objetivo",
      "Receitas práticas em português (medidas caseiras BR)",
      "Tracking macros + calorias (TACO/IBGE + OpenFoodFacts)",
      "Scanner código de barras",
      "Gamificação: XP, streaks, badges, níveis",
      { text: "Chat IA <strong>🔒</strong>", locked: true },
      { text: "Plano semanal por IA <strong>🔒</strong>", locked: true },
      { text: "Acesso ao Coach <strong>🔒</strong>", locked: true },
    ],
    cta: "Começar agora →",
  },
  {
    name: "ON +", price: "R$117", featured: true,
    slotKey: "on_plus",
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
    name: "ON PRO", price: "R$197", featured: false,
    slotKey: "on_pro",
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16">
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
            <div className="my-5">
              <span className="font-heading text-[3.5rem] text-primary leading-none">{plan.price}</span>
              <span className="font-mono text-[.65rem] text-[#50507a]">/mês</span>
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
            <button
              onClick={() => navigate("/auth")}
              className={`block w-full text-center py-3.5 rounded font-mono text-[.72rem] tracking-[.08em] transition-all ${
                plan.featured
                  ? "bg-primary text-black font-medium hover:bg-black hover:text-primary hover:outline hover:outline-1 hover:outline-primary"
                  : "border border-[#2a2a4a] text-[#50507a] hover:border-primary hover:text-primary"
              }`}
            >
              {plan.cta}
            </button>
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
