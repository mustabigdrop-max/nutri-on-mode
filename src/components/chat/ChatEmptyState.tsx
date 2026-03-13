import { Bot, Brain, Heart, TrendingUp, Zap, Pill, Apple } from "lucide-react";

interface ChatEmptyStateProps {
  userName: string;
  onSuggestionClick: (text: string) => void;
}

const categories = [
  {
    icon: Apple,
    label: "Nutrição",
    color: "text-primary border-primary/20 bg-primary/5",
    suggestions: ["O que comer antes do treino?", "Receita rápida e proteica"],
  },
  {
    icon: Brain,
    label: "Comportamental",
    color: "text-accent border-accent/20 bg-accent/5",
    suggestions: ["Modo comi fora: restaurante japonês", "Dicas para mais saciedade"],
  },
  {
    icon: TrendingUp,
    label: "Resultados",
    color: "text-primary border-primary/20 bg-primary/5",
    suggestions: ["Análise do meu progresso", "Por que estagnei?"],
  },
  {
    icon: Zap,
    label: "NutriSync",
    color: "text-accent border-accent/20 bg-accent/5",
    suggestions: ["Ajuste para treino de hoje", "Quanto devo comer no pós-treino?"],
  },
  {
    icon: Pill,
    label: "Suplementos",
    color: "text-primary border-primary/20 bg-primary/5",
    suggestions: ["Substituições para frango", "Melhor whey para mim"],
  },
  {
    icon: Heart,
    label: "Saúde",
    color: "text-destructive border-destructive/20 bg-destructive/5",
    suggestions: ["Como melhorar meu sono?", "Alimentos anti-inflamatórios"],
  },
];

const ChatEmptyState = ({ userName, onSuggestionClick }: ChatEmptyStateProps) => (
  <div className="py-8">
    {/* Agent identity */}
    <div className="text-center mb-8">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 relative">
        <Bot className="w-8 h-8 text-primary" />
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent border-2 border-background animate-pulse" />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-1">Olá, {userName}! 👋</h2>
      <p className="text-xs text-muted-foreground font-mono mb-3">NutriCoach MCE · Coach comportamental inteligente</p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {["Nutrição Clínica", "Comportamental", "NutriSync", "Suplementação"].map(s => (
          <span key={s} className="px-2 py-0.5 rounded-full text-[9px] font-mono border border-primary/20 bg-primary/5 text-primary">
            {s}
          </span>
        ))}
      </div>
    </div>

    {/* Category grid */}
    <div className="space-y-3">
      {categories.map(cat => (
        <div key={cat.label}>
          <div className="flex items-center gap-2 mb-1.5">
            <cat.icon className={`w-3.5 h-3.5 ${cat.color.split(" ")[0]}`} />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{cat.label}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cat.suggestions.map(q => (
              <button
                key={q}
                onClick={() => onSuggestionClick(q)}
                className={`px-3 py-2 rounded-xl text-xs border ${cat.color} hover:border-primary/40 transition-all`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ChatEmptyState;
