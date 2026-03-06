import { motion } from "framer-motion";
import { Apple } from "lucide-react";

interface DiversityCardProps {
  count: number;
  period: "week" | "month";
}

const DiversityCard = ({ count, period }: DiversityCardProps) => {
  const target = period === "week" ? 20 : 50;
  const pct = Math.min(Math.round((count / target) * 100), 100);
  const label = pct >= 80 ? "Excelente!" : pct >= 50 ? "Bom" : "Precisa melhorar";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-card border border-border rounded-2xl p-4 text-center"
    >
      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
        <Apple className="w-5 h-5 text-accent" />
      </div>
      <p className="text-2xl font-black text-foreground">{count}</p>
      <p className="text-[10px] text-muted-foreground font-mono">Alimentos únicos</p>
      <p className={`text-[9px] font-bold mt-1 ${pct >= 80 ? "text-primary" : pct >= 50 ? "text-accent" : "text-destructive"}`}>
        {label} ({pct}% da meta)
      </p>
    </motion.div>
  );
};

export default DiversityCard;
