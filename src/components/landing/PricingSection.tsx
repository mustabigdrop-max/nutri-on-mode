import { motion } from "framer-motion";
import { Check, Zap, Crown, Briefcase, Shield, Star, Brain, Utensils, Dumbbell, Eye, Microscope, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GOLD = "#B8922A";

type Block = {
  icon: any;
  title: string;
  tagline: string;
  description: string;
  items: string[];
  bonus?: boolean;
};

const MCE_BLOCKS: Block[] = [
  {
    icon: Brain,
    title: "MCE — MÉTODO COMPORTAMENTAL",
    tagline: "Seu comportamento vem antes do resultado.",
    description:
      "Diagnóstico comportamental pelo Perfil PCA, identificação de padrões de sabotagem e protocolos de reprogramação baseados no Método MCE — Mindset, Comportamento e Execução. Porque nenhum plano funciona sem a mentalidade certa para executá-lo.",
    items: [
      "Perfil PCA completo",
      "Diagnóstico de sabotagem",
      "Protocolo MCE personalizado",
      "Mindset de alta performance",
      "Execução orientada por dados",
      "Acompanhamento comportamental",
    ],
  },
  {
    icon: Utensils,
    title: "NUTRIPLAN",
    tagline: "Nutrição de precisão para o seu objetivo.",
    description:
      "Protocolos individualizados que alinham cada refeição ao seu metabolismo, fase de treino e objetivo. Do emagrecimento à hipertrofia, cada macro calculado com precisão para que sua nutrição trabalhe a seu favor — não contra você.",
    items: [
      "7 objetivos de protocolo",
      "TDEE farmacológico automático",
      "Crononutrição circadiana",
      "GLUT-4 Sync pós-treino",
      "Carb cycling automático",
      "Banco TACO/IBGE",
      "Substituições inteligentes",
      "Perfil PCA comportamental",
      "8 modos especiais",
      "Medidas caseiras automáticas",
    ],
  },
  {
    icon: Dumbbell,
    title: "TRAININGON",
    tagline: "Treino inteligente. Resultado previsível.",
    description:
      "Prescrição baseada em dados reais — suas fibras musculares, seu nível de recuperação, sua progressão de carga. 27 sistemas de treino que se adaptam a você, eliminando achismo e maximizando cada sessão.",
    items: [
      "27 sistemas de treino",
      "6 fases de treinamento",
      "13 músculos prioritários",
      "Readiness diário",
      "LoadTracker Pro",
      "Fibras musculares",
      "Progressão automática",
      "Histórico de sessões",
    ],
  },
  {
    icon: Eye,
    title: "APEX VISUAL",
    tagline: "Veja o que está travando seu corpo.",
    description:
      "Análise postural completa com 33 landmarks biomecânicos que identificam desvios, assimetrias, dores e riscos de lesão antes que virem problema. Protocolos de mobilidade, correção postural e treino adequado para construir o corpo que você busca com segurança e precisão clínica.",
    items: [
      "Análise postural por foto",
      "33 landmarks biomecânicos",
      "Protocolo corretivo 4 fases",
      "Exercícios contraindicados bloqueados automaticamente",
      "Cadeia cinética detectada",
      "FCS — Fenner Clinical Score",
      "Plano mestre de evolução",
      "Análises ilimitadas",
    ],
  },
  {
    icon: Microscope,
    title: "MICROBIOTA — GUT-BRAIN",
    tagline: "Seu intestino determina sua performance.",
    description:
      "O eixo intestino-cérebro impacta diretamente sua composição corporal, disposição, foco e recuperação. Análise em 4 dimensões com protocolo personalizado de modulação intestinal para você render mais, dormir melhor e evoluir com consistência.",
    items: [
      "Análise em 4 dimensões",
      "Eixo intestino-cérebro",
      "Modulação por nutrição",
      "Prebióticos e probióticos",
      "Protocolo personalizado",
      "Impacto em composição corporal",
    ],
    bonus: true,
  },
  {
    icon: Leaf,
    title: "FITOTERÁPICOS",
    tagline: "Natureza a serviço do seu resultado.",
    description:
      "100+ fitoterápicos catalogados com mecanismos de ação, dosagens e protocolos orientados para objetivos reais: redução de gordura, ganho de massa, controle hormonal, recuperação, foco e bem-estar. Orientação técnica completa para potencializar cada fase do seu protocolo sem depender exclusivamente de fármacos.",
    items: [
      "100+ fitoterápicos catalogados",
      "Adaptógenos e nootropics",
      "Mecanismos de ação completos",
      "Dosagens e protocolos",
      "Interações com fármacos",
      "Oracle IA ilimitado",
    ],
    bonus: true,
  },
];

type Plan = {
  name: string;
  mce?: boolean;
  badge?: string;
  subtitle?: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  icon: any;
  description?: string;
  popular?: boolean;
  checkoutUrl: string;
  cta?: string;
  features?: string[];
  locked?: string[];
  blocks?: Block[];
};

const plans: Plan[] = [
  {
    name: "MCE Performance",
    mce: true,
    badge: "CONSULTORIA",
    subtitle: "Sistema Integrado de Performance Humana",
    price: "397",
    icon: Crown,
    checkoutUrl: "https://pay.kiwify.com.br/Y1e8Oi6",
    cta: "Começar agora →",
    blocks: MCE_BLOCKS,
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
    checkoutUrl: "https://pay.kiwify.com.br/nDxfj4b",
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

        <div className="mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`relative flex flex-col rounded-2xl border-2 p-8 transition-all duration-300 ${
                plan.mce
                  ? "bg-card"
                  : plan.popular
                  ? "border-primary/50 bg-card glow-gold"
                  : "border-border bg-card/50 hover:border-border/80"
              }`}
              style={plan.mce ? { borderColor: GOLD, boxShadow: `0 0 40px -10px ${GOLD}55` } : undefined}
            >
              {plan.mce && plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider text-black"
                  style={{ backgroundColor: GOLD }}
                >
                  {plan.badge}
                </div>
              )}
              {!plan.mce && plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold font-mono uppercase tracking-wider">
                  Mais Popular
                </div>
              )}

              <div className="mb-6">
                <plan.icon
                  className="w-8 h-8 mb-3"
                  style={plan.mce ? { color: GOLD } : undefined}
                  color={!plan.mce && plan.popular ? undefined : undefined}
                />
                <h3
                  className="text-xl font-bold text-foreground"
                  style={plan.mce ? { color: GOLD } : undefined}
                >
                  {plan.name}
                </h3>
                {plan.subtitle ? (
                  <p className="text-sm text-muted-foreground mt-1">{plan.subtitle}</p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span
                    className="text-5xl font-bold font-mono text-foreground"
                    style={plan.mce ? { color: GOLD } : undefined}
                  >
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                {!plan.mce && plan.oldPrice && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm text-muted-foreground line-through">R${plan.oldPrice}</span>
                    <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {plan.discount} fundador
                    </span>
                  </div>
                )}
              </div>

              {plan.mce && plan.blocks ? (
                <div className="space-y-6 mb-8 flex-1">
                  {plan.blocks.map((block) => (
                    <div key={block.title} className="border-t border-border/40 pt-5 first:border-t-0 first:pt-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <block.icon className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                        <h4 className="text-sm font-bold tracking-wide" style={{ color: GOLD }}>
                          {block.title}
                        </h4>
                        {block.bonus && (
                          <span className="text-[.6rem] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            BÔNUS
                          </span>
                        )}
                      </div>
                      <p className="text-xs italic text-muted-foreground/90 mb-1.5">{block.tagline}</p>
                      <p className="text-xs text-muted-foreground/70 mb-3 leading-relaxed">{block.description}</p>
                      <ul className="space-y-1.5">
                        {block.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs">
                            <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: GOLD }} />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features?.map((feature) => (
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
              )}

              <a
                href={plan.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full py-3 rounded-lg font-bold text-sm text-center transition-all ${
                  plan.mce
                    ? "hover:scale-[1.02] text-black"
                    : plan.popular
                    ? "bg-primary text-primary-foreground hover:scale-[1.02] glow-gold"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                style={plan.mce ? { backgroundColor: GOLD } : undefined}
              >
                {plan.cta || "Começar agora"}
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
