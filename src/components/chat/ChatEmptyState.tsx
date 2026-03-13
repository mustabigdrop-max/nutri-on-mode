import { motion } from "framer-motion";
import { Brain, Dumbbell, Utensils, TrendingUp, Pill, Heart } from "lucide-react";

interface ChatEmptyStateProps {
  userName: string;
  onSuggestionClick: (text: string) => void;
}

const CATEGORIES = [
  {
    icon: Utensils,
    label: "Nutrição",
    color: "text-primary border-primary/20 bg-primary/5",
    prompts: [
      "O que comer antes do treino de força?",
      "Receita rápida e hiperproteica (<15 min)",
      "Como substituir frango no almoço?",
    ],
  },
  {
    icon: Brain,
    label: "Comportamental",
    color: "text-accent border-accent/20 bg-accent/5",
    prompts: [
      "Por que tenho compulsão à noite?",
      "Comi fora do plano. E agora?",
      "Como manter consistência nos fins de semana?",
    ],
  },
  {
    icon: TrendingUp,
    label: "Resultados",
    color: "text-[hsl(38,80%,52%)] border-[hsl(38,80%,52%)]/20 bg-[hsl(38,80%,52%)]/5",
    prompts: [
      "Análise do meu progresso desta semana",
      "Estou em plateau. O que fazer?",
      "Projeção: em quanto tempo chego na meta?",
    ],
  },
  {
    icon: Dumbbell,
    label: "NutriSync",
    color: "text-primary border-primary/20 bg-primary/5",
    prompts: [
      "Macros ideais para dia de treino pesado",
      "Janela anabólica: mito ou realidade?",
      "Quanto consumir de carboidrato pré-treino?",
    ],
  },
  {
    icon: Pill,
    label: "Suplementos",
    color: "text-accent border-accent/20 bg-accent/5",
    prompts: [
      "Qual creatina e dose para meu perfil?",
      "Whey no café da manhã: faz sentido?",
      "Interações: cafeína + beta-alanina?",
    ],
  },
  {
    icon: Heart,
    label: "Saúde",
    color: "text-destructive border-destructive/20 bg-destructive/5",
    prompts: [
      "Como ler meus exames de colesterol?",
      "Alimentação anti-inflamatória no meu protocolo",
      "GLP-1 e proteína: o que ajustar?",
    ],
  },
];

const ChatEmptyState = ({ userName, onSuggestionClick }: ChatEmptyStateProps) => (
  <div className="py-6">
    {/* Agent header */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        {/* Online dot */}
        <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary-foreground"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </div>
      </div>

      <h2 className="text-base font-bold text-foreground mb-0.5">
        NutriCoach MCE
      </h2>
      <p className="text-[10px] font-mono text-muted-foreground mb-3">
        Motor Comportamental Especializado · Agente IA
      </p>

      {/* Expertise chips */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-4">
        {["Comportamental", "Macros", "Periodização", "TCC Nutricional", "Cronobiologia"].map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-card border border-border text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      <div className="max-w-xs mx-auto rounded-2xl rounded-bl-sm bg-card border border-border px-4 py-3 text-left">
        <p className="text-sm text-foreground leading-relaxed">
          Olá, <span className="text-primary font-semibold">{userName || "piloto"}</span>. Tenho acesso ao seu histórico, padrões e protocolo ativo.
          <br /><br />
          <span className="text-muted-foreground text-xs">O que vamos resolver hoje?</span>
        </p>
      </div>
    </motion.div>

    {/* Category grids */}
    <div className="space-y-5">
      {CATEGORIES.map((cat, ci) => {
        const Icon = cat.icon;
        return (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + ci * 0.07 }}
          >
            <div className={`flex items-center gap-1.5 mb-2 px-1`}>
              <Icon className={`w-3 h-3 ${cat.color.split(" ")[0]}`} />
              <span className={`text-[9px] font-mono uppercase tracking-wider ${cat.color.split(" ")[0]}`}>
                {cat.label}
              </span>
            </div>
            <div className="space-y-1.5">
              {cat.prompts.map(p => (
                <motion.button
                  key={p}
                  onClick={() => onSuggestionClick(p)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs text-foreground/80 hover:text-foreground transition-all ${cat.color}`}
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>

    <p className="text-center text-[9px] font-mono text-muted-foreground/40 mt-8 px-6">
      NutriCoach MCE — especialista em nutrição comportamental, periodização e protocolos avançados.
      Responde com base no seu perfil e histórico real.
    </p>
  </div>
);

export default ChatEmptyState;
