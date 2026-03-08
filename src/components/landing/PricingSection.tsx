import { motion } from "framer-motion";
import { Check, Zap, Crown, Briefcase } from "lucide-react";

const plans = [
  {
    name: "ON",
    price: "47",
    icon: Zap,
    description: "Porta de entrada. Sem IA, sem Coach.",
    popular: false,
    features: [
      "Dietas prontas segmentadas por objetivo",
      "Receitas práticas em português (medidas caseiras BR)",
      "Tracking macros + calorias (TACO/IBGE + OpenFoodFacts)",
      "Scanner código de barras",
      "Gamificação: XP, streaks, badges, níveis",
    ],
    locked: ["Chat IA", "Plano semanal por IA", "Acesso ao Coach"],
  },
  {
    name: "ON +",
    price: "117",
    icon: Crown,
    description: "IA completa 24h. Preço de fundador — 50 vagas.",
    popular: true,
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
    price: "197",
    icon: Briefcase,
    description: "IA + Coach real. Vagas limitadas: máx. 20 alunos.",
    popular: false,
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
  return (
    <section className="relative py-24 px-4" id="pricing">
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-mono text-primary tracking-widest uppercase mb-4 block">
            Planos
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Invista no seu{" "}
            <span className="text-gradient-gold">modo ON</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Sem cartão de crédito. Cancele quando quiser.
          </p>
        </motion.div>

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
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="text-5xl font-bold font-mono text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">/mês</span>
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

              <button
                className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:scale-[1.02] glow-gold"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Começar agora
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
