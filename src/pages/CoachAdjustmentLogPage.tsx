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

interface FixAllStep {
  id: string;
  run_id: string;
  patient_name: string | null;
  step_index: number;
  step_type: string;
  attempt: number | null;
  ok: boolean;
  message: string | null;
  details: any;
  created_at: string;
}

interface FixAllRun {
  run_id: string;
  patient_name: string | null;
  started_at: string;
  steps: FixAllStep[];
}

const fmtKcal = (n: number | null | undefined) =>
  n == null ? "—" : `${Math.round(Number(n))} kcal`;

const fmtFator = (n: number | null | undefined) =>
  n == null ? "—" : `×${Number(n).toFixed(3)}`;

const STEP_LABEL: Record<string, { label: string; color: string }> = {
  snap_inicial: { label: "1️⃣ Snap inicial", color: "bg-blue-600" },
  regerar_inicio: { label: "🚀 Início regeração", color: "bg-amber-600" },
  regerar_tentativa: { label: "🔄 Tentativa", color: "bg-amber-700" },
  snap_final: { label: "3️⃣ Snap final", color: "bg-blue-700" },
  concluido_sem_regeracao: { label: "✅ Concluído", color: "bg-green-600" },
  nada_a_corrigir: { label: "✓ Nada a corrigir", color: "bg-slate-600" },
};

const CoachAdjustmentLogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useCoachProfile();
  const [rows, setRows] = useState<AdjustmentRow[]>([]);
  const [fixRuns, setFixRuns] = useState<FixAllRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  const load = async () => {
    if (!profile) return;
    setLoading(true);

    const [adjRes, fixRes] = await Promise.all([
      supabase
        .from("coach_plan_adjustments" as any)
        .select(
          "id, patient_name, objetivo, target_kcal, total_antes, total_depois, delta_kcal, fator, dentro_da_banda, status_msg, ajuste_meta, created_at"
        )
        .eq("coach_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("coach_fix_all_logs" as any)
        .select("id, run_id, patient_name, step_index, step_type, attempt, ok, message, details, created_at")
        .eq("coach_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    if (adjRes.error) {
      toast({
        title: "Erro ao carregar log",
        description: adjRes.error.message,
        variant: "destructive",
      });
    } else {
      setRows((adjRes.data as any) || []);
    }

    // Agrupa steps por run_id
    const stepsByRun = new Map<string, FixAllStep[]>();
    for (const s of ((fixRes.data as any) || []) as FixAllStep[]) {
      if (!stepsByRun.has(s.run_id)) stepsByRun.set(s.run_id, []);
      stepsByRun.get(s.run_id)!.push(s);
    }
    const runs: FixAllRun[] = Array.from(stepsByRun.entries()).map(([run_id, steps]) => {
      steps.sort((a, b) => a.step_index - b.step_index);
      return {
        run_id,
        patient_name: steps[0]?.patient_name || null,
        started_at: steps[0]?.created_at || "",
        steps,
      };
    });
    runs.sort((a, b) => (b.started_at > a.started_at ? 1 : -1));
    setFixRuns(runs.slice(0, 30));
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
            onClick={() => navigate("/coach/dashboard")}
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

      {/* Auditoria do botão "Corrigir tudo agora" */}
      {!loading && fixRuns.length > 0 && (
        <Card className="mb-6 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              ✨ Execuções do "Corrigir tudo agora" ({fixRuns.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Cada execução registra: snap inicial de horários → tentativas de regeração → snap final, com totais kcal e fator aplicado.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {fixRuns.map((run) => {
              const isOpen = expandedRun === run.run_id;
              const tentativas = run.steps.filter((s) => s.step_type === "regerar_tentativa");
              const ultimaTentativa = tentativas[tentativas.length - 1];
              const sucesso = ultimaTentativa?.details?.dentro_da_banda ?? run.steps.some((s) => s.step_type === "concluido_sem_regeracao" || s.step_type === "nada_a_corrigir");
              const snapInicial = run.steps.find((s) => s.step_type === "snap_inicial");
              const snapsFix = (snapInicial?.details?.fixed_count ?? 0) + (run.steps.find(s => s.step_type === "snap_final")?.details?.fixed_count ?? 0);
              return (
                <div key={run.run_id} className="rounded-md border bg-card">
                  <button
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/40 transition"
                    onClick={() => setExpandedRun(isOpen ? null : run.run_id)}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">
                        {new Date(run.started_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-sm font-medium">{run.patient_name || "—"}</span>
                      <Badge variant="outline" className="text-[10px]">{run.steps.length} passos</Badge>
                      {tentativas.length > 0 && (
                        <Badge variant="outline" className="text-[10px]">{tentativas.length} tentativa{tentativas.length > 1 ? "s" : ""}</Badge>
                      )}
                      {snapsFix > 0 && (
                        <Badge variant="outline" className="text-[10px]">⏱ {snapsFix} horário{snapsFix > 1 ? "s" : ""}</Badge>
                      )}
                      {sucesso ? (
                        <Badge className="bg-green-600 hover:bg-green-600 gap-1 text-[10px]"><CheckCircle2 className="h-3 w-3" /> ok</Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1 text-[10px]"><AlertTriangle className="h-3 w-3" /> fora da banda</Badge>
                      )}
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {isOpen && (
                    <div className="border-t p-3 space-y-2 bg-muted/20">
                      {run.steps.map((s) => {
                        const meta = STEP_LABEL[s.step_type] || { label: s.step_type, color: "bg-slate-600" };
                        const d = s.details || {};
                        return (
                          <div key={s.id} className="rounded border bg-background p-2 text-xs space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`${meta.color} hover:${meta.color} text-white text-[10px]`}>{meta.label}{s.attempt ? ` ${s.attempt}` : ""}</Badge>
                              {!s.ok && <Badge variant="destructive" className="text-[10px]">erro</Badge>}
                              <span className="text-[10px] text-muted-foreground font-mono">{new Date(s.created_at).toLocaleTimeString("pt-BR")}</span>
                            </div>
                            {s.message && <div className="text-foreground">{s.message}</div>}
                            {/* Detalhes de snap */}
                            {(s.step_type === "snap_inicial" || s.step_type === "snap_final") && Array.isArray(d.horarios_corrigidos) && d.horarios_corrigidos.length > 0 && (
                              <div className="space-y-0.5 mt-1">
                                <div className="text-muted-foreground">Horários corrigidos:</div>
                                {d.horarios_corrigidos.map((h: any, i: number) => (
                                  <div key={i} className="font-mono text-[11px]">
                                    • {h.refeicao}: <span className="text-red-400">{h.de}</span> → <span className="text-green-400">{h.para}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Detalhes de regeração */}
                            {s.step_type === "regerar_tentativa" && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 text-[11px] font-mono">
                                <div><span className="text-muted-foreground">Alvo:</span> {fmtKcal(d.alvo)}</div>
                                <div><span className="text-muted-foreground">Total:</span> {fmtKcal(d.total_depois)}</div>
                                <div><span className="text-muted-foreground">Δ:</span> {d.delta_kcal != null ? `${d.delta_kcal > 0 ? "+" : ""}${Math.round(d.delta_kcal)} kcal` : "—"}</div>
                                <div><span className="text-muted-foreground">Fator:</span> {fmtFator(d.fator)}</div>
                              </div>
                            )}
                            {s.step_type === "regerar_inicio" && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1 text-[11px] font-mono">
                                <div><span className="text-muted-foreground">Alvo:</span> {fmtKcal(d.alvo)}</div>
                                <div><span className="text-muted-foreground">Antes:</span> {fmtKcal(d.total_antes)}</div>
                                <div><span className="text-muted-foreground">Δ inicial:</span> {d.delta_kcal != null ? `${Math.round(d.delta_kcal)} kcal` : "—"}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : rows.length === 0 && fixRuns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum plano gerado ainda. Os ajustes aparecerão aqui assim que você
            gerar um plano alimentar.
          </CardContent>
        </Card>
      ) : rows.length === 0 ? null : (
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
