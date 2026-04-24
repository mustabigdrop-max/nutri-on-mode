import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdjustmentRow {
  id: string;
  patient_name: string | null;
  objetivo: string | null;
  target_kcal: number | null;
  total_antes: number | null;
  total_depois: number | null;
  delta_kcal: number | null;
  fator: number | null;
  dentro_da_banda: boolean | null;
  status_msg: string | null;
  ajuste_meta: any;
  created_at: string;
}

const fmtKcal = (n: number | null | undefined) =>
  n == null ? "—" : `${Math.round(Number(n))} kcal`;

const fmtFator = (n: number | null | undefined) =>
  n == null ? "—" : `×${Number(n).toFixed(3)}`;

const CoachAdjustmentLogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useCoachProfile();
  const [rows, setRows] = useState<AdjustmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    if (!profile) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("coach_plan_adjustments" as any)
      .select(
        "id, patient_name, objetivo, target_kcal, total_antes, total_depois, delta_kcal, fator, dentro_da_banda, status_msg, ajuste_meta, created_at"
      )
      .eq("coach_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast({
        title: "Erro ao carregar log",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setRows((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!profileLoading && profile) load();
    if (!profileLoading && !profile) setLoading(false);
  }, [profileLoading, profile?.id]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Acesso restrito a coaches.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/coach-dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Log de Ajuste Calórico</h1>
            <p className="text-sm text-muted-foreground">
              Diagnóstico de cada plano gerado: alvo, total antes, refeições
              fixas vs ajustáveis, fator solicitado e aplicado.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum plano gerado ainda. Os ajustes aparecerão aqui assim que você
            gerar um plano alimentar.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Últimos {rows.length} planos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Alvo</TableHead>
                  <TableHead>Antes</TableHead>
                  <TableHead>Depois</TableHead>
                  <TableHead>Δ</TableHead>
                  <TableHead>Fator</TableHead>
                  <TableHead>Banda</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const isOpen = expanded === r.id;
                  const meta = r.ajuste_meta || {};
                  const fixas: string[] = meta.refeicoes_fixas_ignoradas || [];
                  const ajustaveis: string[] =
                    meta.refeicoes_ajustadas || meta.refeicoes_ajustaveis || [];
                  const fatorSolicitado =
                    meta.fator_solicitado ?? meta.fator ?? r.fator;
                  const fatorLimitado = meta.fator_limitado === true;

                  return (
                    <>
                      <TableRow key={r.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {new Date(r.created_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-xs">
                          {r.patient_name || "—"}
                          {r.objetivo && (
                            <div className="text-[10px] text-muted-foreground">
                              {r.objetivo}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {fmtKcal(r.target_kcal)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {fmtKcal(r.total_antes)}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {fmtKcal(r.total_depois)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {r.delta_kcal != null
                            ? `${r.delta_kcal > 0 ? "+" : ""}${Math.round(
                                r.delta_kcal
                              )}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {fmtFator(r.fator)}
                          {fatorLimitado && (
                            <Badge
                              variant="destructive"
                              className="ml-1 text-[9px]"
                            >
                              clamp
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {r.dentro_da_banda ? (
                            <Badge className="bg-green-600 hover:bg-green-600 gap-1">
                              <CheckCircle2 className="h-3 w-3" /> ±3%
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="gap-1"
                            >
                              <AlertTriangle className="h-3 w-3" /> fora
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpanded(isOpen ? null : r.id)
                            }
                          >
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {isOpen && (
                        <TableRow key={`${r.id}-detail`}>
                          <TableCell
                            colSpan={9}
                            className="bg-muted/30 p-4 text-xs space-y-3"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <div className="text-muted-foreground">
                                  Alvo
                                </div>
                                <div className="font-mono font-semibold">
                                  {fmtKcal(r.target_kcal)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Total antes
                                </div>
                                <div className="font-mono">
                                  {fmtKcal(r.total_antes)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Total depois
                                </div>
                                <div className="font-mono font-semibold text-primary">
                                  {fmtKcal(r.total_depois)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Delta vs alvo
                                </div>
                                <div className="font-mono">
                                  {r.delta_kcal != null
                                    ? `${
                                        r.delta_kcal > 0 ? "+" : ""
                                      }${Math.round(r.delta_kcal)} kcal`
                                    : "—"}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Fator solicitado
                                </div>
                                <div className="font-mono">
                                  {fmtFator(fatorSolicitado)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Fator aplicado
                                </div>
                                <div className="font-mono font-semibold">
                                  {fmtFator(r.fator)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Kcal ajustáveis
                                </div>
                                <div className="font-mono">
                                  {fmtKcal(meta.kcal_ajustaveis)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Kcal fixas
                                </div>
                                <div className="font-mono">
                                  {fmtKcal(meta.kcal_fixas)}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <div className="text-muted-foreground mb-1">
                                  Refeições ajustáveis ({ajustaveis.length})
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {ajustaveis.length === 0 ? (
                                    <span className="text-muted-foreground italic">
                                      —
                                    </span>
                                  ) : (
                                    ajustaveis.map((n: string, i: number) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="text-[10px]"
                                      >
                                        {n}
                                      </Badge>
                                    ))
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">
                                  Refeições fixas (peri-treino) ({fixas.length})
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {fixas.length === 0 ? (
                                    <span className="text-muted-foreground italic">
                                      —
                                    </span>
                                  ) : (
                                    fixas.map((n: string, i: number) => (
                                      <Badge
                                        key={i}
                                        variant="secondary"
                                        className="text-[10px]"
                                      >
                                        {n}
                                      </Badge>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>

                            {r.status_msg && (
                              <div className="rounded-md border bg-background p-2">
                                <div className="text-muted-foreground mb-1">
                                  Resultado
                                </div>
                                <div>{r.status_msg}</div>
                              </div>
                            )}

                            {meta.mensagem &&
                              meta.mensagem !== r.status_msg && (
                                <div className="rounded-md border bg-background p-2">
                                  <div className="text-muted-foreground mb-1">
                                    Mensagem do motor
                                  </div>
                                  <div>{meta.mensagem}</div>
                                </div>
                              )}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoachAdjustmentLogPage;
