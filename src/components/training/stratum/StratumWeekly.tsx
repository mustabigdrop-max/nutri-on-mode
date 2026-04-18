import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, TrendingUp, AlertTriangle } from "lucide-react";
import { useStratum } from "@/hooks/useStratum";
import { useState } from "react";
import { toast } from "sonner";

export default function StratumWeekly() {
  const { recentReports, generateWeekly } = useStratum();
  const [loading, setLoading] = useState(false);
  const latest = recentReports[0];

  const gen = async () => {
    setLoading(true);
    try { await generateWeekly(); toast.success("Relatório gerado"); }
    catch (e: any) { toast.error(e?.message || "Erro"); }
    setLoading(false);
  };

  return (
    <Card className="border-[#DC2626]/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-[#DC2626] text-sm">
            <FileText className="w-4 h-4" /> STRATUM WEEKLY
          </CardTitle>
          <p className="text-xs text-muted-foreground">Camada 7 · Relatório semanal</p>
        </div>
        <Button onClick={gen} disabled={loading} size="sm" variant="outline" className="border-[#DC2626]/40 text-[#DC2626]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gerar agora"}
        </Button>
      </CardHeader>
      <CardContent>
        {!latest ? (
          <p className="text-xs text-muted-foreground">Nenhum relatório ainda. Gere o primeiro após registrar treinos da semana.</p>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="text-xs text-muted-foreground">{latest.semana_inicio} → {latest.semana_fim}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Stat label="Aderência" value={`${latest.aderencia_pct}%`} />
              <Stat label="Volume" value={`${latest.volume_total} sets`} />
              <Stat label="RPE médio" value={(latest.rpe_medio ?? 0).toFixed(1)} />
              <Stat label="Prontidão" value={`${(latest.prontidao_media ?? 0).toFixed(0)}/100`} />
            </div>
            <div className="rounded border border-border p-2 bg-muted/20">
              <div className="text-xs font-semibold mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Análise STRATUM</div>
              <p className="text-xs text-foreground/80">{latest.analise_pca}</p>
            </div>
            {latest.alertas?.length > 0 && (
              <div className="rounded border border-border p-2">
                <div className="text-xs font-semibold mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Alertas</div>
                <ul className="text-xs space-y-0.5">
                  {latest.alertas.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
            <div className="rounded border border-[#DC2626]/30 p-2 bg-[#DC2626]/5">
              <div className="text-xs font-semibold text-[#DC2626] mb-1">Próxima semana · {latest.fase_proxima}</div>
              <ul className="text-xs">
                {(latest.proxima_semana?.ajustes || []).map((a: string, i: number) => <li key={i}>→ {a}</li>)}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-background border border-border p-2">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-bold text-[#DC2626]">{value}</div>
    </div>
  );
}
