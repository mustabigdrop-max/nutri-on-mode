import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill } from "lucide-react";

interface StackItem {
  name?: string;
  dose?: string;
  timing?: string;
  category?: string;
  reason?: string;
}

interface Props {
  stack: Record<string, unknown>[];
}

const CATEGORY_COLORS: Record<string, string> = {
  hepatico: "bg-green-500/20 text-green-400",
  cardiovascular: "bg-red-500/20 text-red-400",
  hormonal: "bg-blue-500/20 text-blue-400",
  recuperacao: "bg-purple-500/20 text-purple-400",
  geral: "bg-muted text-muted-foreground",
};

const DEFAULT_STACK: StackItem[] = [
  { name: "TUDCA", dose: "500mg/dia", timing: "Com refeição", category: "hepatico", reason: "Suporte hepático — obrigatório em orais" },
  { name: "NAC", dose: "1200mg/dia", timing: "Dividido 2x", category: "hepatico", reason: "Antioxidante hepático" },
  { name: "Ômega 3", dose: "4–6g/dia", timing: "Com refeições", category: "cardiovascular", reason: "Controle de lipídios" },
  { name: "CoQ10", dose: "200mg/dia", timing: "Com refeição gordurosa", category: "cardiovascular", reason: "Saúde cardíaca" },
  { name: "Zinco + Magnésio", dose: "30mg Zn + 400mg Mg", timing: "Antes de dormir", category: "hormonal", reason: "Suporte testosterona endógena" },
  { name: "Vitamina D3 + K2", dose: "5000UI + 100mcg", timing: "Manhã com gordura", category: "hormonal", reason: "Saúde hormonal geral" },
];

const SupportStack = ({ stack }: Props) => {
  const items: StackItem[] = stack && stack.length > 0
    ? (stack as unknown as StackItem[])
    : DEFAULT_STACK;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <Pill className="w-4 h-4 text-[#FF6B00]" />
        Stack de Suporte
      </h3>
      {items.map((item, i) => (
        <Card key={i} className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{item.name}</span>
            {item.category && (
              <Badge className={`text-xs ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.geral}`}>
                {item.category}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {item.dose && <span>💊 {item.dose}</span>}
            {item.timing && <span>⏰ {item.timing}</span>}
          </div>
          {item.reason && (
            <p className="text-xs text-muted-foreground">{item.reason}</p>
          )}
        </Card>
      ))}
    </div>
  );
};

export default SupportStack;
