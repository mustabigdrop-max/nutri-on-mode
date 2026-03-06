import { motion } from "framer-motion";
import { Check, Zap, Crown, Briefcase } from "lucide-react";

const plans = [
  {
    name: "Básico",
    price: "37",
    icon: Zap,
    description: "Para quem está começando a transformação",
    popular: false,
    features: [
      "Dashboard HUD com macros em tempo real",
      "Log de refeições + banco TACO/IBGE",
      "Evolução de peso com gráfico",
      "Anamnese inteligente com IA",
      "Chat IA — 50 mensagens/mês",
      "Receitas e plano semanal básico",
    ],
  },
  {
    name: "Pro",
    price: "97",
    icon: Crown,
    description: "Para quem quer resultado completo",
    popular: true,
    features: [
      "Tudo do Básico +",
      "10 protocolos de dieta + motor kcal",
      "Coach humano integrado",
      "Wearables + Sono + Cronobiologia",
      "IA lê exames de sangue",
      "Gamificação completa + ranking",
      "Modo família (3 perfis)",
      "Protocolo GLP-1 / caneta",
      "Composição corporal",
      "Chat IA ilimitado",
      "Comunidade + NutriAulas",
    ],
  },
  {
    name: "Profissional",
    price: "197",
    icon: Briefcase,
    description: "Para Coaches, Nutris e Personal Trainers",
    popular: false,
    features: [
      "Tudo do Pro +",
      "Painel com até 30 pacientes",
      "Alertas automáticos por aluno",
      "IA gera prescrição e feedback",
      "Plano com assinatura digital",
      "Relatórios PDF clínicos",
      "White label — sua marca",
      "Exportação CSV",
      "Suporte prioritário 24h",
    ],
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
            7 dias grátis em todos os planos. Sem cartão de crédito.
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
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:scale-[1.02] glow-gold"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Começar 7 dias grátis
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
