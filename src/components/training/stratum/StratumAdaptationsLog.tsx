import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { useStratum } from "@/hooks/useStratum";

const TIPO_LABEL: Record<string, string> = {
  progressao: "Progressão",
  plato: "Platô detectado",
  deload: "Deload recomendado",
  desequilibrio: "Desequilíbrio",
  sync_nutrion: "nutriON SYNC",
  sync_nexus: "NEXUS sugestão",
};

export default function StratumAdaptationsLog() {
  const { adaptations } = useStratum();

  return (
    <Card className="border-[#DC2626]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#DC2626] text-sm">
          <Zap className="w-4 h-4" /> Ajustes automáticos STRATUM
        </CardTitle>
        <p className="text-xs text-muted-foreground">Camadas 2, 5, 6 · log de adaptações</p>
      </CardHeader>
      <CardContent>
        {adaptations.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum ajuste ainda. Registre treinos para o STRATUM analisar.</p>
        ) : (
          <ul className="space-y-2">
            {adaptations.map(a => (
              <li key={a.id} className="text-xs border-l-2 border-[#DC2626] pl-2 py-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#DC2626]">{TIPO_LABEL[a.tipo] || a.tipo}</span>
                  <span className="text-muted-foreground">{new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                {a.exercicio && <div className="text-foreground/70">{a.exercicio}</div>}
                <div className="text-foreground/80">{a.detalhe}</div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
