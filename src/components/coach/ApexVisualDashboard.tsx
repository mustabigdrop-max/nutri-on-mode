import { Card, CardContent } from "@/components/ui/card";
import { Scan } from "lucide-react";

interface ApexVisualDashboardProps {
  coachId?: string;
}

export default function ApexVisualDashboard({ coachId }: ApexVisualDashboardProps) {
  return (
    <Card className="border-amber-500/20">
      <CardContent className="p-8 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
          <Scan className="w-6 h-6 text-amber-500" />
          🔬 APEX Visual Intelligence
        </div>
        <p className="text-sm text-muted-foreground">
          Análise visual por IA · Padrão IFBB · Correção postural + Protocolo corretivo
        </p>
        {coachId && (
          <p className="text-xs text-muted-foreground/60">Coach ID: {coachId}</p>
        )}
      </CardContent>
    </Card>
  );
}
