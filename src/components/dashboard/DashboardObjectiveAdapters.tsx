import { motion } from "framer-motion";
import { Flame, Target, Dumbbell, Leaf, Baby } from "lucide-react";

type Objetivo = "emagrecimento" | "hipertrofia" | "saude_geral" | "infantil" | string;

interface ObjectiveBadgeProps {
  objetivo: Objetivo;
}

const CONFIG: Record<string, { label: string; emoji: string; color: string; bgColor: string; icon: typeof Flame }> = {
  emagrecimento: { label: "Emagrecimento", emoji: "🔥", color: "text-primary", bgColor: "bg-primary/10", icon: Flame },
  hipertrofia: { label: "Hipertrofia", emoji: "💪", color: "text-accent", bgColor: "bg-accent/10", icon: Dumbbell },
  saude_geral: { label: "Saúde Geral", emoji: "🌿", color: "text-emerald-500", bgColor: "bg-emerald-500/10", icon: Leaf },
  infantil: { label: "Infantil", emoji: "🧒", color: "text-pink-400", bgColor: "bg-pink-400/10", icon: Baby },
};

export const ObjectiveBadge = ({ objetivo }: ObjectiveBadgeProps) => {
  const cfg = CONFIG[objetivo] || CONFIG.saude_geral;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${cfg.bgColor} border border-current/10`}
    >
      <span className="text-xs">{cfg.emoji}</span>
      <span className={`text-[9px] font-mono font-bold ${cfg.color} uppercase tracking-wider`}>{cfg.label}</span>
    </motion.div>
  );
};

export const getRingLabel = (objetivo: Objetivo, remaining: number, percent: number) => {
  switch (objetivo) {
    case "emagrecimento":
      return remaining > 0 ? `${Math.round(remaining)} kcal em déficit` : "Meta de déficit atingida ✓";
    case "hipertrofia":
      return remaining > 0 ? `${Math.round(remaining)} kcal para superávit` : "Superávit atingido 💪";
    case "infantil":
      return remaining > 0 ? `Faltam ${Math.round(remaining)} kcal ⭐` : "Meta do dia completa! 🌟";
    default:
      return remaining > 0 ? `${Math.round(remaining)} restantes` : "Meta atingida ✓";
  }
};

export const getRingSubtitle = (objetivo: Objetivo) => {
  switch (objetivo) {
    case "emagrecimento": return "Meta de déficit";
    case "hipertrofia": return "Meta de superávit";
    case "infantil": return "Meta diária";
    default: return "Meta de equilíbrio";
  }
};

export const getScoreLabel = (objetivo: Objetivo) => {
  switch (objetivo) {
    case "emagrecimento": return "Score Déficit";
    case "hipertrofia": return "Score Performance";
    case "infantil": return "Score Nutrição";
    default: return "Score Qualidade";
  }
};

export const getPredictiveAlert = (
  objetivo: Objetivo,
  todayMeals: any[],
  todayTotals: { kcal: number; protein: number; carbs: number; fat: number },
  proteinTarget: number,
  kcalTarget: number,
  kcalPercent: number,
  hour: number,
) => {
  if (objetivo === "emagrecimento") {
    if (todayMeals.length === 0 && hour >= 10) return "Ainda sem refeições registradas. Comece o dia com uma refeição rica em proteína! 🍳";
    if (hour >= 20 && todayTotals.protein < proteinTarget * 0.6) return `Faltam ${Math.round(proteinTarget - todayTotals.protein)}g de proteína. Proteína à noite ajuda a manter a saciedade 💪`;
    if (hour >= 21 && kcalPercent < 80) return "Consumo baixo hoje. Cuidado para não compensar amanhã — consistência é a chave!";
    if (kcalPercent > 90 && kcalPercent < 105) return "Quase na meta de déficit! Você está no controle 🎯";
    if (kcalPercent >= 105) return "Acima da meta hoje. Sem culpa — amanhã é um novo dia! 💚";
    if (hour >= 15 && hour < 18 && todayTotals.kcal < kcalTarget * 0.4) return "Consumo baixo à tarde. Planeje um lanche saudável para evitar compulsão à noite!";
    return null;
  }

  if (objetivo === "hipertrofia") {
    if (todayMeals.length === 0 && hour >= 9) return "Ainda sem refeições. A janela anabólica começa no café da manhã! ☕";
    if (todayTotals.protein < proteinTarget * 0.5 && hour >= 14) return `Apenas ${Math.round(todayTotals.protein)}g de proteína até agora. Foco em proteína nas próximas refeições! 🥩`;
    if (kcalPercent < 70 && hour >= 18) return "Consumo calórico abaixo do superávit. Adicione um shake ou refeição extra para não perder ganhos!";
    if (kcalPercent >= 95 && kcalPercent <= 110) return "Superávit controlado! Macros alinhados com o treino 🎯💪";
    if (todayTotals.carbs < (kcalTarget * 0.5 / 4) * 0.4 && hour >= 12) return "Carbo baixo. Considere adicionar arroz ou batata doce pré-treino ⚡";
    return null;
  }

  if (objetivo === "infantil") {
    if (todayMeals.length === 0 && hour >= 9) return "Nenhuma refeição registrada para hoje. Que tal começar pelo café da manhã? 🥣";
    const hasFruits = todayMeals.some(m => m.food_names?.some((f: string) => /frut|banana|maçã|laranja|manga/i.test(f)));
    if (!hasFruits && hour >= 14) return "Nenhuma fruta registrada hoje. Ofereça uma fruta no lanche da tarde! 🍎";
    if (todayMeals.length >= 4) return "Ótimo dia de alimentação! Variedade é a chave para uma nutrição infantil saudável 🌟";
    return null;
  }

  // saude_geral
  if (todayMeals.length === 0 && hour >= 10) return "Ainda sem refeições registradas hoje. Bora começar? 🍳";
  if (hour >= 20 && todayTotals.protein < proteinTarget * 0.6) return `Faltam ${Math.round(proteinTarget - todayTotals.protein)}g de proteína. Que tal um lanche proteico?`;
  if (hour >= 15 && hour < 18 && todayTotals.kcal < kcalTarget * 0.4) return "Consumo baixo até agora. Planeje um lanche nutritivo para manter a energia!";
  if (kcalPercent > 90 && kcalPercent < 105) return "Quase na meta! Equilíbrio perfeito hoje 🎯";

  // Diversity check for saude_geral
  const uniqueFoods = new Set(todayMeals.flatMap(m => m.food_names || []));
  if (uniqueFoods.size < 5 && todayMeals.length >= 3) return "Diversidade alimentar baixa hoje. Tente incluir cores diferentes no prato! 🌈";

  return null;
};

export const getHeaderSubtitle = (objetivo: Objetivo) => {
  switch (objetivo) {
    case "emagrecimento": return "Modo Déficit";
    case "hipertrofia": return "Modo Performance";
    case "infantil": return "Modo Família";
    default: return "Cockpit";
  }
};

export const getChildDashboardGreeting = (childName?: string) => {
  const hour = new Date().getHours();
  const name = childName || "pequeno(a)";
  if (hour < 12) return `Bom dia! Vamos cuidar da alimentação do ${name} ☀️`;
  if (hour < 18) return `Boa tarde! Como está a alimentação do ${name} hoje? 🌤️`;
  return `Boa noite! Vamos fechar o dia do ${name} com chave de ouro 🌙`;
};
