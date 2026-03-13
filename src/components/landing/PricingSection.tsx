import { motion } from "framer-motion";
import { Check, Zap, Crown, Briefcase, Shield, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "ON",
    price: "67",
    oldPrice: "97",
    discount: "31% off",
    icon: Zap,
    description: "A IA que te conhece, não só te conta.",
    popular: false,
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
    ],
    locked: ["Plano semanal por IA", "Acesso ao Coach"],
  },
  {
    name: "ON +",
    price: "127",
    oldPrice: "197",
    discount: "35% off",
    icon: Crown,
    description: "IA completa 24h. Preço de fundador — 50 vagas.",
    popular: true,
    checkoutUrl: "https://pay.kiwify.com.br/G8uxU9O",
    features: [
      "Tudo do ON +",
      "Chat IA nutriON ilimitado",
      "Plano semanal completo por IA",
      "Receitas personalizadas por perfil",
      "Lista de compras automática",
      "30+ micronutrientes rastreados",
      "Score nutricional diário (0-100)",
      "Diário fotográfico antes/depois",
      "Alertas preditivos por IA",
      "Modo 'Comi fora'",
      "Foto do prato → IA registra",
    ],
    locked: ["Acesso ao Coach"],
  },
  {
    name: "ON PRO",
    price: "247",
    oldPrice: "397",
    discount: "37% off",
    icon: Briefcase,
    description: "IA + Coach real. Vagas limitadas: máx. 20 alunos.",
    popular: false,
    checkoutUrl: "https://pay.kiwify.com.br/zbtOulj",
    features: [
      "Tudo do ON+ +",
      "2 check-ins mensais (vídeo/áudio)",
      "Coach com painel em tempo real",
      "Feedback semanal personalizado",
      "Ajuste de plano pelo Coach",
      "Canal prioritário (resposta 24h)",
      "Grupo exclusivo alunos PRO",
      "Badge dinâmico 'X vagas restantes'",
    ],
    locked: [],
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 px-4" id="pricing">
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-mono text-primary tracking-widest uppercase mb-4 block">
            Planos
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Invista no seu{" "}
            <span className="text-gradient-gold">modo ON</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Cancele quando quiser.
          </p>
        </motion.div>

        {/* Starter Tripwire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8 mb-10 overflow-hidden"
        >
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[250px] h-[150px] bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-mono text-primary tracking-widest uppercase">Acesso Starter</p>
                <p className="text-3xl font-bold text-foreground leading-none mt-0.5">R$9,90</p>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">7 dias de acesso completo ao ON+</strong> — pagamento único, sem renovação automática.
              </p>
              <p className="text-xs text-muted-foreground/70 font-mono mt-1">
                Abata R$9,90 na primeira mensalidade se assinar em seguida
              </p>
            </div>
            <button
              onClick={() => navigate("/auth")}
              className="shrink-0 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] glow-gold transition-all whitespace-nowrap"
            >
              EXPERIMENTAR POR R$9,90 →
            </button>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Ou assine um plano completo</span>
          <div className="flex-1 h-px bg-border" />
        </div>

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
                  Mais Popular
                </div>
              )}

              <div className="mb-6">
                <plan.icon
                  className={`w-8 h-8 mb-3 ${
                    plan.popular ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-5xl font-bold font-mono text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm text-muted-foreground line-through">R${plan.oldPrice}</span>
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {plan.discount} fundador
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        plan.popular ? "text-primary" : "text-accent"
                      }`}
                    />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
                {plan.locked?.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm opacity-40">
                    <span className="w-4 h-4 mt-0.5 shrink-0 text-center text-xs">🔒</span>
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
                Começar agora
              </a>
            </motion.div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary/60" />
            Cancele quando quiser
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Star className="w-3.5 h-3.5 text-primary/60" />
            Pagamento seguro via Kiwify
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-primary/60" />
            Acesso imediato após confirmação
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
