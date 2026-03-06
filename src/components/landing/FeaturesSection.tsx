import { motion } from "framer-motion";
import { Brain, Flame, Activity, Pill, Moon, Dumbbell, Salad, Shield, BarChart3, Users, BookOpen, Utensils } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "IA Coach 24h",
    description: "Chat inteligente que conhece seu histórico, antecipa erros e motiva como um coach de verdade.",
    color: "primary" as const,
  },
  {
    icon: Flame,
    title: "Motor de Kcal Científico",
    description: "4 fórmulas simultâneas. A IA escolhe a mais precisa para seu perfil. GEB, GET e VET automáticos.",
    color: "primary" as const,
  },
  {
    icon: Activity,
    title: "Composição Corporal",
    description: "Índice de Retenção Muscular semanal. Perca gordura, não músculo. Meta em % de gordura, não peso.",
    color: "accent" as const,
  },
  {
    icon: Pill,
    title: "Protocolo GLP-1",
    description: "Único app do Brasil com protocolo para caneta emagrecedora. Protege sua massa muscular.",
    color: "primary" as const,
  },
  {
    icon: Moon,
    title: "Cronobiologia + Sono",
    description: "Horários ótimos para cada macro. Sono ruim? Plano ajustado automaticamente no dia seguinte.",
    color: "accent" as const,
  },
  {
    icon: Dumbbell,
    title: "Treino + Nutrição",
    description: "Periodização nutricional automática. Dia pesado = high carb. Descanso = low carb + high protein.",
    color: "primary" as const,
  },
  {
    icon: Salad,
    title: "10 Protocolos de Dieta",
    description: "Cetogênica, Low Carb, Jejum, Vegano, Mediterrânea, Bodybuilder, e mais. Troca em 1 toque.",
    color: "accent" as const,
  },
  {
    icon: Shield,
    title: "Nutrição Comportamental",
    description: "TCC, mindful eating, diário emocional. A ciência por trás dos hábitos que duram.",
    color: "primary" as const,
  },
  {
    icon: BarChart3,
    title: "Exames de Sangue com IA",
    description: "Upload do PDF. IA interpreta e ajusta seu plano. Coach valida antes de aplicar.",
    color: "accent" as const,
  },
  {
    icon: Utensils,
    title: "Construtor de Dieta",
    description: "Monte sua dieta alimento por alimento com medidas caseiras. Totalizador em tempo real.",
    color: "primary" as const,
  },
  {
    icon: Users,
    title: "Comunidade ON",
    description: "Ranking, desafios, mentoria. Usuários Lenda mentoram iniciantes. Transformações reais.",
    color: "accent" as const,
  },
  {
    icon: BookOpen,
    title: "NutriAulas",
    description: "Micro-aulas de 3 min. Quiz com XP. Certificados digitais aos 30, 60 e 90 dias ON.",
    color: "primary" as const,
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-mono text-primary tracking-widest uppercase mb-4 block">
            12 Módulos · 22 Telas
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Tudo que a ciência oferece.{" "}
            <span className="text-gradient-gold">Num só app.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Não é mais um app de dieta. É um sistema completo de transformação com IA, 
            ciência e gamificação.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="group p-6 rounded-xl bg-card/50 border border-border hover:border-primary/30 transition-all duration-300 hover:bg-card"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                  feature.color === "primary"
                    ? "bg-primary/10 text-primary"
                    : "bg-accent/10 text-accent"
                }`}
              >
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
