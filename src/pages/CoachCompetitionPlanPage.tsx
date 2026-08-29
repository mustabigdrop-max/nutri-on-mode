import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, Trophy, Calendar, Activity, Dumbbell, Utensils, AlertTriangle,
  Loader2, Target, FlaskConical, TrendingDown, ChevronDown, ChevronUp, Sparkles,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import WeeklyCheckInsPanel from "@/components/coach/WeeklyCheckInsPanel";
import CompetitionAdherenceDashboard from "@/components/coach/CompetitionAdherenceDashboard";
import CompetitionReportGenerator from "@/components/coach/CompetitionReportGenerator";
import { ClipboardCheck, BarChart3 } from "lucide-react";

interface Bloco {
  nome: string;
  tipo: "offseason" | "cutting" | "pre_peak" | "peak_week";
  cor: string;
  icone: string;
  semana_inicio: number;
  semana_fim: number;
  duracao: number;
  objetivo: string;
  sistema_treino?: string;
  volume?: string;
  intensidade?: string;
  frequencia?: string;
  cardio?: string;
  deload?: string;
  calorias_multiplicador?: number;
  deficit_pct?: number;
  proteina_gkg?: number;
  gordura_pct?: number;
  refeed?: string;
  taxa_perda_alvo?: number;
  tecnicas?: string[];
  farma_ajuste?: string[];
  posing_min_dia?: number;
  posing_foco?: string;
  exames?: string[];
  semana_a_semana?: Record<string, string>;
  protocolo_diario?: Record<string, unknown>;
}

interface Plan {
  id: string;
  coach_id: string;
  athlete_id: string;
  nome_competicao: string;
  federacao: string;
  categoria: string;
  data_competicao: string;
  local_competicao?: string;
  peso_atual: number;
  peso_alvo_palco: number;
  altura: number;
  bf_atual?: number;
  massa_magra?: number;
  protocolo_farmacologico?: string;
  blocos: Bloco[];
  semana_atual: number;
  bloco_atual?: string;
  calculo_meta?: any;
  status: string;
  created_at: string;
}

const TIPO_LABEL: Record<Bloco["tipo"], string> = {
  offseason: "Off-Season",
  cutting: "Cutting",
  pre_peak: "Pré-Peak",
  peak_week: "Peak Week",
};

const CoachCompetitionPlanPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [athleteName, setAthleteName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!planId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("competition_plans" as any)
        .select("*")
        .eq("id", planId)
        .maybeSingle();

      if (error || !data) {
        toast({ title: "Plano não encontrado", variant: "destructive" });
        navigate("/coach/dashboard");
        return;
      }
      const p = data as unknown as Plan;
      setPlan(p);

      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", p.athlete_id)
        .maybeSingle();
      setAthleteName(prof?.full_name || "Atleta");
      setLoading(false);
    })();
  }, [planId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!plan) return null;

  const semanasTotal = plan.blocos.reduce((acc, b) => Math.max(acc, b.semana_fim), 0);
  const diasAteComp = Math.max(0, Math.ceil((new Date(plan.data_competicao).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const semanasAteComp = Math.ceil(diasAteComp / 7);
  const perdaTotal = (plan.peso_atual - plan.peso_alvo_palco).toFixed(1);
  const taxaSemanal = semanasTotal > 0 ? (Number(perdaTotal) / semanasTotal).toFixed(2) : "0";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* HEADER */}
      <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="relative px-4 pt-4 pb-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/coach/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Trophy className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">Plano de Competição</h1>
            <Badge variant="outline" className="ml-auto text-[10px]">{plan.status}</Badge>
          </div>

          <h2 className="text-2xl font-bold mb-1">{plan.nome_competicao}</h2>
          <p className="text-sm text-muted-foreground mb-3">
            {plan.federacao} · {plan.categoria} · Atleta: <span className="text-foreground">{athleteName}</span>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Card className="bg-card/60 border-border/50 p-3">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />Data</p>
              <p className="text-sm font-bold">{new Date(plan.data_competicao).toLocaleDateString("pt-BR")}</p>
              <p className="text-[10px] text-primary mt-0.5">{semanasAteComp} semanas restantes</p>
            </Card>
            <Card className="bg-card/60 border-border/50 p-3">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3" />Peso atual</p>
              <p className="text-sm font-bold">{plan.peso_atual} kg</p>
              {plan.bf_atual && <p className="text-[10px] text-muted-foreground mt-0.5">BF {plan.bf_atual}%</p>}
            </Card>
            <Card className="bg-card/60 border-border/50 p-3">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" />Peso palco</p>
              <p className="text-sm font-bold">{plan.peso_alvo_palco} kg</p>
              <p className="text-[10px] text-orange-500 mt-0.5">−{perdaTotal} kg total</p>
            </Card>
            <Card className="bg-card/60 border-border/50 p-3">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1"><TrendingDown className="w-3 h-3" />Taxa alvo</p>
              <p className="text-sm font-bold">{taxaSemanal} kg/sem</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{semanasTotal} semanas</p>
            </Card>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 max-w-5xl mx-auto">
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="timeline" className="text-xs"><Sparkles className="w-3 h-3 mr-1" />Timeline</TabsTrigger>
            <TabsTrigger value="blocos" className="text-xs"><Dumbbell className="w-3 h-3 mr-1" />Blocos</TabsTrigger>
            <TabsTrigger value="checkins" className="text-xs"><ClipboardCheck className="w-3 h-3 mr-1" />Check-ins</TabsTrigger>
            <TabsTrigger value="aderencia" className="text-xs"><BarChart3 className="w-3 h-3 mr-1" />Aderência</TabsTrigger>
            <TabsTrigger value="protocolo" className="text-xs"><FlaskConical className="w-3 h-3 mr-1" />Protocolo</TabsTrigger>
          </TabsList>

          <TabsContent value="checkins" className="space-y-3">
            <WeeklyCheckInsPanel planId={plan.id} />
          </TabsContent>

          <TabsContent value="aderencia" className="space-y-3">
            <CompetitionAdherenceDashboard
              planId={plan.id}
              pesoInicial={Number(plan.peso_atual)}
              pesoAlvoPalco={Number(plan.peso_alvo_palco)}
              semanasTotal={semanasTotal}
            />
            <CompetitionReportGenerator planId={plan.id} />
          </TabsContent>

          {/* TIMELINE */}
          <TabsContent value="timeline" className="space-y-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Visão geral — {semanasTotal} semanas</CardTitle></CardHeader>
              <CardContent>
                {/* Barra horizontal */}
                <div className="relative h-12 bg-muted/30 rounded-md overflow-hidden flex">
                  {plan.blocos.map((b, i) => {
                    const widthPct = ((b.semana_fim - b.semana_inicio + 1) / semanasTotal) * 100;
                    return (
                      <div
                        key={i}
                        className="relative h-full flex items-center justify-center text-[10px] font-bold text-white border-r border-background/40 cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ width: `${widthPct}%`, backgroundColor: b.cor }}
                        title={`${b.nome} — sem ${b.semana_inicio}-${b.semana_fim}`}
                        onClick={() => setExpanded(i)}
                      >
                        <span className="px-1 truncate">{b.icone}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Semana 1</span>
                  <span>Semana {semanasTotal} (palco)</span>
                </div>

                {/* Legenda */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {Array.from(new Set(plan.blocos.map((b) => b.tipo))).map((tipo) => {
                    const b = plan.blocos.find((x) => x.tipo === tipo)!;
                    return (
                      <div key={tipo} className="flex items-center gap-1 text-[10px]">
                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: b.cor }} />
                        <span className="text-muted-foreground">{TIPO_LABEL[tipo]}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Lista vertical detalhada */}
            <div className="space-y-2">
              {plan.blocos.map((b, i) => {
                const isOpen = expanded === i;
                return (
                  <Card key={i} className="border-border/60 overflow-hidden">
                    <button
                      className="w-full text-left p-3 flex items-center gap-3 hover:bg-muted/20 transition-colors"
                      onClick={() => setExpanded(isOpen ? null : i)}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{ backgroundColor: `${b.cor}30`, border: `1px solid ${b.cor}` }}
                      >
                        {b.icone}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold truncate">{b.nome}</p>
                          <Badge variant="outline" className="text-[10px]" style={{ borderColor: b.cor, color: b.cor }}>
                            sem {b.semana_inicio}–{b.semana_fim}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">{b.duracao} sem</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{b.objetivo}</p>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                    </button>

                    {isOpen && (
                      <div className="border-t border-border/40 p-3 space-y-3 bg-muted/10">
                        {/* Treino */}
                        {(b.sistema_treino || b.volume || b.intensidade) && (
                          <div>
                            <p className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                              <Dumbbell className="w-3 h-3" /> Treino
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                              {b.sistema_treino && <p>▸ Sistema: <span className="text-foreground">{b.sistema_treino}</span></p>}
                              {b.volume && <p>▸ Volume: <span className="text-foreground">{b.volume}</span></p>}
                              {b.intensidade && <p>▸ Intensidade: <span className="text-foreground">{b.intensidade}</span></p>}
                              {b.frequencia && <p>▸ Frequência: <span className="text-foreground">{b.frequencia}</span></p>}
                              {b.cardio && <p className="col-span-2">▸ Cardio: <span className="text-foreground">{b.cardio}</span></p>}
                              {b.deload && <p className="col-span-2">▸ Deload: <span className="text-foreground">{b.deload}</span></p>}
                            </div>
                            {b.tecnicas && b.tecnicas.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {b.tecnicas.map((t, j) => (
                                  <Badge key={j} variant="outline" className="text-[10px]">{t}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Nutrição */}
                        {(b.calorias_multiplicador || b.deficit_pct || b.proteina_gkg) && (
                          <div>
                            <p className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                              <Utensils className="w-3 h-3" /> Nutrição
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                              {b.calorias_multiplicador && <p>▸ Manutenção: ×<span className="text-foreground">{b.calorias_multiplicador}</span></p>}
                              {b.deficit_pct !== undefined && <p>▸ Déficit: <span className="text-foreground">{b.deficit_pct}%</span></p>}
                              {b.proteina_gkg && <p>▸ Proteína: <span className="text-foreground">{b.proteina_gkg} g/kg</span></p>}
                              {b.gordura_pct && <p>▸ Gordura: <span className="text-foreground">{b.gordura_pct}%</span></p>}
                              {b.refeed && <p className="col-span-2">▸ Refeed: <span className="text-foreground">{b.refeed}</span></p>}
                              {b.taxa_perda_alvo !== undefined && (
                                <p className="col-span-2">▸ Taxa perda: <span className="text-orange-500 font-medium">{b.taxa_perda_alvo}%/semana</span></p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Posing */}
                        {(b.posing_min_dia || b.posing_foco) && (
                          <div>
                            <p className="text-[11px] font-semibold text-foreground mb-1">🎭 Posing</p>
                            <p className="text-[11px] text-muted-foreground">
                              {b.posing_min_dia && <span>{b.posing_min_dia} min/dia · </span>}
                              {b.posing_foco}
                            </p>
                          </div>
                        )}

                        {/* Farma */}
                        {b.farma_ajuste && b.farma_ajuste.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                              <FlaskConical className="w-3 h-3" /> Ajuste farmacológico
                            </p>
                            <ul className="text-[11px] text-muted-foreground space-y-0.5">
                              {b.farma_ajuste.map((f, j) => <li key={j}>▸ {f}</li>)}
                            </ul>
                          </div>
                        )}

                        {/* Exames */}
                        {b.exames && b.exames.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-foreground mb-1">🧪 Exames sugeridos</p>
                            <div className="flex flex-wrap gap-1">
                              {b.exames.map((e, j) => <Badge key={j} variant="secondary" className="text-[10px]">{e}</Badge>)}
                            </div>
                          </div>
                        )}

                        {/* Semana a semana */}
                        {b.semana_a_semana && Object.keys(b.semana_a_semana).length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-foreground mb-1">📅 Semana a semana</p>
                            <div className="space-y-1">
                              {Object.entries(b.semana_a_semana).map(([k, v]) => (
                                <p key={k} className="text-[11px] text-muted-foreground">
                                  <span className="text-foreground font-medium">{k}:</span> {v}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Protocolo diário (peak week) */}
                        {b.protocolo_diario && Object.keys(b.protocolo_diario).length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-foreground mb-1">🗓️ Protocolo diário</p>
                            <div className="space-y-1">
                              {Object.entries(b.protocolo_diario).map(([k, v]) => (
                                <p key={k} className="text-[11px] text-muted-foreground">
                                  <span className="text-foreground font-medium capitalize">{k.replace(/_/g, " ")}:</span>{" "}
                                  {typeof v === "string" ? v : JSON.stringify(v)}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* BLOCOS — tabela compacta */}
          <TabsContent value="blocos" className="space-y-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Resumo por bloco</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs border border-border/40 rounded">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="text-left p-2">Bloco</th>
                      <th className="text-left p-2">Semanas</th>
                      <th className="text-left p-2">Treino</th>
                      <th className="text-left p-2">Déficit</th>
                      <th className="text-left p-2">Proteína</th>
                      <th className="text-left p-2">Posing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.blocos.map((b, i) => (
                      <tr key={i} className="border-t border-border/20">
                        <td className="p-2"><span style={{ color: b.cor }}>{b.icone}</span> {b.nome}</td>
                        <td className="p-2">{b.semana_inicio}–{b.semana_fim}</td>
                        <td className="p-2">{b.sistema_treino || "—"}</td>
                        <td className="p-2">{b.deficit_pct !== undefined ? `${b.deficit_pct}%` : "—"}</td>
                        <td className="p-2">{b.proteina_gkg ? `${b.proteina_gkg} g/kg` : "—"}</td>
                        <td className="p-2">{b.posing_min_dia ? `${b.posing_min_dia} min` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROTOCOLO FARMA */}
          <TabsContent value="protocolo" className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-primary" /> Protocolo farmacológico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {plan.protocolo_farmacologico ? (
                  <pre className="whitespace-pre-wrap text-xs font-mono text-muted-foreground bg-muted/30 p-3 rounded border border-border/40">
                    {plan.protocolo_farmacologico}
                  </pre>
                ) : (
                  <p className="text-xs text-muted-foreground">Sem protocolo registrado.</p>
                )}
              </CardContent>
            </Card>

            {plan.calculo_meta && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Metadados do cálculo</CardTitle></CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-[11px] font-mono text-muted-foreground">
                    {JSON.stringify(plan.calculo_meta, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            <Card className="bg-yellow-500/5 border-yellow-500/20">
              <CardContent className="p-3 flex gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Os blocos foram calculados automaticamente com base nos dados informados. Sempre valide com avaliações reais antes de aplicar. Próxima etapa: dashboard de check-ins semanais e análise Dual-AI.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CoachCompetitionPlanPage;
