import { motion } from "framer-motion";
import { Check, Zap, Crown, Briefcase, Lock, ArrowRight } from "lucide-react";

const STARTER = {
  price: "9,90",
  days: 7,
  checkoutUrl: "https://pay.kiwify.com.br/6pXyygp",
};

const plans = [
  {
    name: "ON",
    price: "67",
    priceFrom: "97",
    icon: Zap,
    description: "A IA que te conhece, não só te conta.",
    popular: false,
    checkoutUrl: "https://pay.kiwify.com.br/2U4q4d9",
    cta: "Começar agora",
    features: [
      "Onboarding inteligente por conversa",
      "Modo 'Sem Balança' — medidas visuais",
      "Diagnóstico de Sabotagem por IA",
      "Plano Adaptativo por Humor (diário)",
      "Alertas preditivos de oportunidade",
      "Banco de alimentos 100% brasileiro",
      "Tracking macros + calorias (TACO/IBGE)",
      "Gamificação: XP, streaks, badges",
      "3 notificações/dia personalizadas",
    ],
    locked: ["Plano semanal por IA", "Acesso ao Coach"],
  },
  {
    name: "ON +",
    price: "127",
    priceFrom: "197",
    icon: Crown,
    description: "IA completa 24h. Preço de fundador — 50 vagas.",
    popular: true,
    checkoutUrl: "https://pay.kiwify.com.br/6pXyygp",
    cta: "Garantir vaga de fundador",
    badge: "MAIS POPULAR",
    features: [
      "Tudo do ON +",
      "Chat IA nutriON ilimitado",
      "Plano semanal completo por IA",
      "Receitas por perfil comportamental",
      "Lista de compras automática",
      "30+ micronutrientes rastreados",
      "Score nutricional diário (0-100)",
      "Diário fotográfico antes/depois",
      "Alertas preditivos avançados",
      "Modo 'Comi fora' inteligente",
      "Foto do prato → IA registra",
    ],
    locked: ["Acesso ao Coach"],
  },
  {
    name: "ON PRO",
    price: "247",
    priceFrom: "397",
    icon: Briefcase,
    description: "IA + Coach real. Vagas limitadas: máx. 20 alunos.",
    popular: false,
    checkoutUrl: "https://pay.kiwify.com.br/zbtOulj",
    cta: "Quero acompanhamento real",
    badge: "VAGAS LIMITADAS",
    features: [
      "Tudo do ON+ +",
      "2 check-ins mensais (vídeo/áudio)",
      "Coach com painel em tempo real",
      "Feedback semanal personalizado",
      "Ajuste de plano pelo Coach",
      "Canal prioritário (resposta 24h)",
      "Grupo exclusivo alunos PRO",
    ],
    locked: [],
  },
];

const PricingSection = () => {
  return (
    <section className="relative py-24 px-4" id="pricing">
      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="text-sm font-mono text-primary tracking-widest uppercase mb-4 block">
            Planos
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Invista no seu{" "}
            <span className="text-gradient-gold">modo ON</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Preços de fundador — válidos apenas durante o lançamento. Cancele quando quiser.
          </p>
        </motion.div>

        {/* Starter tripwire */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12 max-w-xl mx-auto"
        >
          <div className="relative rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/[.07] to-transparent p-6 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-mono text-primary tracking-widest uppercase mb-1">ACESSO DE ENTRADA</p>
                <p className="font-bold text-foreground">
                  Experimente por{" "}
                  <span className="text-primary">R${STARTER.price}</span>
                  <span className="text-muted-foreground text-sm font-normal"> · {STARTER.days} dias de ON+</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pagamento único · sem renovação automática · sem gratuidade
                </p>
              </div>
              <a
                href={STARTER.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold whitespace-nowrap hover:opacity-90 transition-opacity"
              >
                Testar <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-border/40" />
          <span className="text-xs text-muted-foreground font-mono tracking-widest uppercase">ou assine um plano</span>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-primary/50 bg-card glow-gold"
                  : "border-border bg-card/50 hover:border-border/80"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold font-mono uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}
              {!plan.popular && plan.badge && (
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-mono tracking-wider">
                  {plan.badge}
                </div>
              )}

              <div className="mb-4">
                <plan.icon className={`w-8 h-8 mb-3 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="text-xs text-muted-foreground line-through mb-0.5">
                  de R${plan.priceFrom}/mês
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-5xl font-bold font-mono text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <div className="text-xs text-primary/70 mt-1 font-mono">
                  ↓ {Math.round((1 - parseInt(plan.price) / parseInt(plan.priceFrom)) * 100)}% off fundador
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? "text-primary" : "text-accent"}`} />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
                {plan.locked?.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm opacity-35">
                    <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full py-3 rounded-lg font-bold text-sm text-center transition-all ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:scale-[1.02] glow-gold"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta} →
              </a>
              <p className="text-center text-[10px] text-muted-foreground/50 font-mono mt-2">
                Cancele quando quiser · sem fidelidade
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2"
        >
          {[
            "🔒 Pagamento seguro via Kiwify",
            "📄 Nota fiscal emitida",
            "🔄 Cancele com 1 clique",
            "🇧🇷 Suporte em português",
          ].map(item => (
            <span key={item} className="text-xs text-muted-foreground/50 font-mono">{item}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
