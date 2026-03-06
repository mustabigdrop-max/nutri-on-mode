import { Bot } from "lucide-react";

interface ChatEmptyStateProps {
  userName: string;
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  "O que comer antes do treino?",
  "Receita rápida e proteica",
  "Análise do meu progresso",
  "Dicas para mais saciedade",
  "Modo comi fora: restaurante japonês",
  "Substituições para frango",
];

const ChatEmptyState = ({ userName, onSuggestionClick }: ChatEmptyStateProps) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
      <Bot className="w-8 h-8 text-primary" />
    </div>
    <h2 className="text-lg font-bold text-foreground mb-2">Olá, {userName}! 👋</h2>
    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
      Sou seu NutriCoach comportamental. Conheço seu histórico, seus padrões e estou aqui para te ajudar de verdade.
    </p>
    <div className="flex flex-wrap gap-2 justify-center mt-6">
      {suggestions.map(q => (
        <button
          key={q}
          onClick={() => onSuggestionClick(q)}
          className="px-3 py-2 rounded-xl text-xs bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
        >
          {q}
        </button>
      ))}
    </div>
  </div>
);

export default ChatEmptyState;
