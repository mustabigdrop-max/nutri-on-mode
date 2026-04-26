import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingDown, Activity, Dumbbell, Utensils, AlertTriangle,
  Heart, Moon, Loader2, Target,
} from "lucide-react";

interface Props {
  planId: string;
  pesoInicial: number;
  pesoAlvoPalco: number;
  semanasTotal: number;
}

interface WeeklyLog {
  semana: number;
  peso: number | null;
  bf_estimado: number | null;
  recovery_score: number | null;
  aderencia_treino_pct: number | null;
  aderencia_dieta_pct: number | null;
  posing_min_total: number | null;
  qualidade_sono: number | null;
  alertas: any[] | null;
  binge_episodio: boolean | null;
  created_at: string;
}

const CompetitionAdherenceDashboard = ({ planId, pesoInicial, pesoAlvoPalco, semanasTotal }: Props) => {
  const [logs, setLogs] = useState<WeeklyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("competition_weekly_logs" as any)
        .select("*")
        .eq("plan_id", planId)
        .order("semana", { ascending: true });
      setLogs((data as unknown as WeeklyLog[]) || []);
      setLoading(false);
    })();
  }, [planId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="p-6 text-center">
          <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum check-in registrado ainda.</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Os dados de aderência aparecerão aqui conforme o atleta enviar os check-ins semanais.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Médias
  const avg = (key: keyof WeeklyLog) => {
    const vals = logs.map((l) => l[key]).filter((v) => typeof v === "number") as number[];
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };
  const avgRecovery = avg("recovery_score");
  const avgAdTreino = avg("aderencia_treino_pct");
  const avgAdDieta = avg("aderencia_dieta_pct");
  const avgSono = avg("qualidade_sono");
  const posingTotal = logs.reduce((acc, l) => acc + (l.posing_min_total || 0), 0);

  // Curva de peso
  const pesos = logs.filter((l) => l.peso !== null).map((l) => ({ semana: l.semana, peso: l.peso! }));
  const minPeso = Math.min(pesoAlvoPalco, ...pesos.map((p) => p.peso)) - 1;
  const maxPeso = Math.max(pesoInicial, ...pesos.map((p) => p.peso)) + 1;
  const range = maxPeso - minPeso || 1;

  const W = 600;
  const H = 180;
  const padding = 30;
  const innerW = W - padding * 2;
  const innerH = H - padding * 2;

  const xFor = (sem: number) => padding + (sem / Math.max(semanasTotal, 1)) * innerW;
  const yFor = (peso: number) => padding + (1 - (peso - minPeso) / range) * innerH;

  // Curva alvo (linha reta peso inicial → peso palco ao longo das semanas)
  const targetPath = `M ${xFor(0)} ${yFor(pesoInicial)} L ${xFor(semanasTotal)} ${yFor(pesoAlvoPalco)}`;

  // Curva real
  const realPath = pesos.length
    ? "M " + pesos.map((p) => `${xFor(p.semana)} ${yFor(p.peso)}`).join(" L ")
    : "";

  // Alertas ativos (último log)
  const lastLog = logs[logs.length - 1];
  const alertasAtivos = (lastLog.alertas as any[]) || [];
  const bingeCount = logs.filter((l) => l.binge_episodio).length;

  return (
    <div className="space-y-3">
      {/* GRÁFICO PESO */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            Peso semana a semana vs. curva alvo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
              {/* Grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                <line
                  key={p}
                  x1={padding}
                  x2={W - padding}
                  y1={padding + p * innerH}
                  y2={padding + p * innerH}
                  stroke="hsl(var(--border))"
                  strokeDasharray="2 2"
                  strokeWidth="0.5"
                />
              ))}
              {/* Curva alvo */}
              <path d={targetPath} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth="1.5" fill="none" />
              {/* Curva real */}
              {realPath && <path d={realPath} stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />}
              {/* Pontos */}
              {pesos.map((p, i) => (
                <circle key={i} cx={xFor(p.semana)} cy={yFor(p.peso)} r="3" fill="hsl(var(--primary))" />
              ))}
              {/* Eixo Y labels */}
              <text x="4" y={yFor(maxPeso) + 4} fontSize="9" fill="hsl(var(--muted-foreground))">{maxPeso.toFixed(1)}kg</text>
              <text x="4" y={yFor(minPeso) + 4} fontSize="9" fill="hsl(var(--muted-foreground))">{minPeso.toFixed(1)}kg</text>
              <text x="4" y={yFor(pesoAlvoPalco) + 4} fontSize="9" fill="hsl(var(--primary))">alvo {pesoAlvoPalco}kg</text>
              {/* Eixo X */}
              <text x={padding} y={H - 5} fontSize="9" fill="hsl(var(--muted-foreground))">S1</text>
              <text x={W - padding - 20} y={H - 5} fontSize="9" fill="hsl(var(--muted-foreground))">S{semanasTotal}</text>
            </svg>
          </div>
          <div className="flex gap-4 text-[10px] text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-primary" /> real
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 border-t border-dashed border-muted-foreground" /> alvo
            </span>
            <span className="ml-auto">{logs.length} check-ins</span>
          </div>
        </CardContent>
      </Card>

      {/* MÉDIAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Dumbbell className="w-3 h-3" />Aderência treino</p>
          <p className="text-lg font-bold text-primary">{avgAdTreino.toFixed(0)}%</p>
          <Progress value={avgAdTreino} className="h-1 mt-1" />
        </Card>
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Utensils className="w-3 h-3" />Aderência dieta</p>
          <p className="text-lg font-bold text-primary">{avgAdDieta.toFixed(0)}%</p>
          <Progress value={avgAdDieta} className="h-1 mt-1" />
        </Card>
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Heart className="w-3 h-3" />Recovery médio</p>
          <p className="text-lg font-bold text-primary">{avgRecovery.toFixed(1)}<span className="text-xs text-muted-foreground">/10</span></p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Moon className="w-3 h-3" />Sono médio</p>
          <p className="text-lg font-bold text-primary">{avgSono.toFixed(1)}<span className="text-xs text-muted-foreground">/10</span></p>
        </Card>
      </div>

      {/* POSING + BINGE */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" />Posing acumulado</p>
          <p className="text-base font-bold">{Math.round(posingTotal)} min</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">≈ {(posingTotal / 60).toFixed(1)}h totais</p>
        </Card>
        <Card className={`p-3 ${bingeCount > 0 ? "border-orange-500/40 bg-orange-500/5" : ""}`}>
          <p className="text-[10px] text-muted-foreground">Episódios de binge</p>
          <p className={`text-base font-bold ${bingeCount > 0 ? "text-orange-500" : ""}`}>{bingeCount}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">em {logs.length} semanas</p>
        </Card>
      </div>

      {/* ALERTAS ATIVOS */}
      {alertasAtivos.length > 0 && (
        <Card className="border-yellow-500/40 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-4 h-4" />
              Alertas ativos (última semana)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {alertasAtivos.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <Badge
                  variant="outline"
                  className="text-[10px] shrink-0"
                  style={{
                    borderColor:
                      a.severidade === "alta" ? "hsl(0 80% 60%)" :
                      a.severidade === "media" ? "hsl(40 90% 55%)" : "hsl(var(--muted-foreground))",
                    color:
                      a.severidade === "alta" ? "hsl(0 80% 60%)" :
                      a.severidade === "media" ? "hsl(40 90% 55%)" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {a.tipo || a.categoria || "alerta"}
                </Badge>
                <p className="text-muted-foreground">{a.mensagem || a.descricao || JSON.stringify(a)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* HISTÓRICO COMPACTO */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Histórico de check-ins</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-muted-foreground border-b border-border/40">
                <th className="text-left p-1">Sem</th>
                <th className="text-left p-1">Peso</th>
                <th className="text-left p-1">BF</th>
                <th className="text-left p-1">Treino</th>
                <th className="text-left p-1">Dieta</th>
                <th className="text-left p-1">Recovery</th>
                <th className="text-left p-1">Sono</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i} className="border-b border-border/20">
                  <td className="p-1 font-medium">{l.semana}</td>
                  <td className="p-1">{l.peso ? `${l.peso}kg` : "—"}</td>
                  <td className="p-1">{l.bf_estimado ? `${l.bf_estimado}%` : "—"}</td>
                  <td className="p-1">{l.aderencia_treino_pct ?? "—"}%</td>
                  <td className="p-1">{l.aderencia_dieta_pct ?? "—"}%</td>
                  <td className="p-1">{l.recovery_score ?? "—"}/10</td>
                  <td className="p-1">{l.qualidade_sono ?? "—"}/10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitionAdherenceDashboard;
