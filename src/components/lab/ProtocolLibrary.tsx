import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Flame, Timer, Zap, Moon, Dna, Pill, Syringe, ChevronRight, BookOpen } from "lucide-react";

const CATEGORIES = [
  { key: "hipertrofia", icon: Dumbbell, label: "Hipertrofia e Força", emoji: "💪" },
  { key: "emagrecimento", icon: Flame, label: "Emagrecimento e Cutting", emoji: "🔥" },
  { key: "endurance", icon: Timer, label: "Resistência e Endurance", emoji: "🏃" },
  { key: "performance", icon: Zap, label: "Performance e Energia", emoji: "⚡" },
  { key: "sono", icon: Moon, label: "Sono e Recuperação", emoji: "😴" },
  { key: "hormonal", icon: Dna, label: "Saúde Hormonal", emoji: "🧬" },
  { key: "suplementacao", icon: Pill, label: "Suplementação Avançada", emoji: "💊" },
  { key: "peptideos", icon: Syringe, label: "Peptídeos e Ergogênicos", emoji: "🧪" },
];

// Sample protocols for each category
const SAMPLE_PROTOCOLS: Record<string, Array<{ titulo: string; nivel: string; tempo: number; resumo: string }>> = {
  hipertrofia: [
    { titulo: "Periodização de Carboidratos para Hipertrofia", nivel: "Avançado", tempo: 8, resumo: "Como manipular carboidratos ciclicamente para maximizar síntese proteica e minimizar ganho de gordura." },
    { titulo: "Protocolo de Proteína Peri-Treino", nivel: "Intermediário", tempo: 5, resumo: "Timing ideal de proteína antes, durante e após o treino baseado em meta-análises recentes." },
    { titulo: "Creatina: Guia Definitivo 2025", nivel: "Iniciante", tempo: 6, resumo: "Dosagem, timing, tipos e combinações de creatina com evidência atualizada." },
  ],
  emagrecimento: [
    { titulo: "Deficit Inteligente sem Perda Muscular", nivel: "Intermediário", tempo: 7, resumo: "Como criar um deficit calórico que preserve massa magra usando estratégias de timing e macros." },
    { titulo: "Refeed e Diet Break Baseados em Ciência", nivel: "Avançado", tempo: 6, resumo: "Quando e como implementar refeeds e pausas na dieta para otimizar metabolismo." },
  ],
  peptideos: [
    { titulo: "GLP-1 Agonistas: Nutrição Otimizada", nivel: "Avançado", tempo: 10, resumo: "Protocolos nutricionais completos para usuários de Semaglutida e Tirzepatida." },
    { titulo: "Peptídeos Bioativos na Nutrição Esportiva", nivel: "Avançado", tempo: 8, resumo: "Colágeno hidrolisado, BPC-157 oral e outros peptídeos com evidência nutricional." },
  ],
};

interface ProtocolLibraryProps {
  onAskApex: (question: string) => void;
}

const ProtocolLibrary = ({ onAskApex }: ProtocolLibraryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const nivelColor = (n: string) => {
    if (n === "Iniciante") return "text-accent";
    if (n === "Intermediário") return "text-primary";
    return "text-destructive";
  };

  return (
    <div className="space-y-4">
      {!selectedCategory ? (
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <motion.button key={cat.key} whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCategory(cat.key)}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 text-left transition-all space-y-2">
              <span className="text-2xl">{cat.emoji}</span>
              <p className="text-sm font-semibold text-foreground leading-tight">{cat.label}</p>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <button onClick={() => setSelectedCategory(null)}
            className="text-xs text-primary font-mono hover:underline">
            ← Voltar às categorias
          </button>
          <h3 className="text-lg font-bold text-foreground">
            {CATEGORIES.find(c => c.key === selectedCategory)?.emoji}{" "}
            {CATEGORIES.find(c => c.key === selectedCategory)?.label}
          </h3>
          {(SAMPLE_PROTOCOLS[selectedCategory] || []).map((proto, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-bold text-foreground flex-1">{proto.titulo}</h4>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className={nivelColor(proto.nivel)}>{proto.nivel}</span>
                <span className="text-muted-foreground">📖 {proto.tempo} min</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{proto.resumo}</p>
              <button onClick={() => onAskApex(`Analise o protocolo "${proto.titulo}" para o meu perfil e sugira adaptações personalizadas.`)}
                className="flex items-center gap-1 text-[10px] font-mono text-primary hover:underline mt-1">
                <BookOpen className="w-3 h-3" /> Aplicar ao meu plano →
              </button>
            </motion.div>
          ))}
          {!(SAMPLE_PROTOCOLS[selectedCategory]?.length) && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Protocolos em preparação para esta categoria.</p>
              <button onClick={() => onAskApex(`Quais são os melhores protocolos de ${CATEGORIES.find(c => c.key === selectedCategory)?.label} para o meu perfil?`)}
                className="text-xs text-primary font-mono mt-2 hover:underline">
                Perguntar ao APEX →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProtocolLibrary;
