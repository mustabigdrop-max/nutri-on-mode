import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, AlertTriangle, TrendingDown, TrendingUp,
  CheckCircle2, ChevronDown, ChevronUp, Camera, Activity,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface WeeklyLog {
  id: string;
  semana: number;
  bloco?: string;
  peso?: number;
  bf_estimado?: number;
  recovery_score?: number;
  aderencia_treino?: number;
  aderencia_dieta?: number;
  qualidade_sono?: number;
  energia_geral?: number;
  dor_muscular?: number;
  forca_status?: string;
  posing_minutos?: number;
  episodio_compulsao?: boolean;
  maior_dificuldade?: string;
  foto_frente_url?: string;
  foto_lateral_url?: string;
  foto_costas_url?: string;
  ajuste_calorico?: number;
  ajuste_volume?: number;
  ajuste_cardio?: number;
  analise_semana?: string;
  ajustes_proxima_semana?: any;
  alertas?: any[];
  created_at: string;
}

const WeeklyCheckInsPanel = ({ planId }: { planId: string }) => {
  const [logs, setLogs] = useState<WeeklyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [signed, setSigned] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("competition_weekly_logs")
      .select("*")
      .eq("competition_plan_id", planId)
      .order("semana", { ascending: false });
    setLogs((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [planId]);

  const signPhoto = async (path: string) => {
    if (!path || signed[path]) return signed[path];
    const { data } = await supabase.storage
      .from("progress-photos")
      .createSignedUrl(path, 3600);
    if (data?.signedUrl) {
      setSigned((s) => ({ ...s, [path]: data.signedUrl }));
      return data.signedUrl;
    }
    return null;
  };

  const analyze = async (logId: string) => {
    setAnalyzing(logId);
    try {
      const { data, error } = await supabase.functions.invoke(
        "analyze-competition-checkin",
        { body: { weekly_log_id: logId } },
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Análise gerada com sucesso!");
      await load();
      setExpanded(logId);
    } catch (e: any) {
      toast.error(e.message || "Erro na análise");
    } finally {
      setAnalyzing(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Nenhum check-in registrado ainda. O atleta verá o card no dashboard
          dele para enviar.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const isOpen = expanded === log.id;
        const isAnalyzing = analyzing === log.id;
        const hasAnalysis = !!log.analise_semana;
        const hasCritical = (log.alertas || []).some(
          (a: any) => a.nivel === "critico",
        );

        return (
          <Card
            key={log.id}
            className={hasCritical ? "border-destructive/50" : ""}
          >
            <CardHeader
              className="cursor-pointer pb-3"
              onClick={() => setExpanded(isOpen ? null : log.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    Semana {log.semana}
                    {log.bloco && (
                      <Badge variant="outline" className="text-[10px]">
                        {log.bloco}
                      </Badge>
                    )}
                    {hasAnalysis && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AUTO
                      </Badge>
                    )}
                    {hasCritical && (
                      <Badge variant="destructive" className="text-[10px]">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Crítico
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(log.created_at).toLocaleDateString("pt-BR")} ·
                    Peso {log.peso}kg · Recovery {log.recovery_score}/10 ·
                    Aderência {log.aderencia_dieta}%
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>

            {isOpen && (
              <CardContent className="space-y-4 pt-0">
                {/* Métricas detalhadas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <Metric label="Peso" value={`${log.peso}kg`} />
                  <Metric label="BF" value={log.bf_estimado ? `${log.bf_estimado}%` : "—"} />
                  <Metric label="Recovery" value={`${log.recovery_score}/10`} />
                  <Metric label="Energia" value={`${log.energia_geral}/10`} />
                  <Metric label="Sono" value={`${log.qualidade_sono}/10`} />
                  <Metric label="DOMS" value={`${log.dor_muscular}/10`} />
                  <Metric label="Treino" value={`${log.aderencia_treino}%`} />
                  <Metric label="Dieta" value={`${log.aderencia_dieta}%`} />
                  <Metric label="Força" value={log.forca_status || "—"} />
                  <Metric label="Posing" value={`${log.posing_minutos || 0}min`} />
                  <Metric
                    label="Compulsão"
                    value={log.episodio_compulsao ? "Sim" : "Não"}
                  />
                </div>

                {log.maior_dificuldade && (
                  <div className="bg-muted/50 rounded-lg p-3 text-xs">
                    <p className="font-medium mb-1">Maior dificuldade:</p>
                    <p className="text-muted-foreground">
                      {log.maior_dificuldade}
                    </p>
                  </div>
                )}

                {/* Fotos */}
                {(log.foto_frente_url ||
                  log.foto_lateral_url ||
                  log.foto_costas_url) && (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["Frente", log.foto_frente_url],
                      ["Lateral", log.foto_lateral_url],
                      ["Costas", log.foto_costas_url],
                    ].map(([label, path]) =>
                      path ? (
                        <PhotoThumb
                          key={label as string}
                          label={label as string}
                          path={path as string}
                          signed={signed}
                          sign={signPhoto}
                        />
                      ) : null,
                    )}
                  </div>
                )}

                {/* Análise */}
                {hasAnalysis ? (
                  <div className="space-y-3 border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold">
                        Análise APEX Elite
                      </h4>
                    </div>
                    <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground/90">
                      <ReactMarkdown>{log.analise_semana || ""}</ReactMarkdown>
                    </div>

                    {/* Ajustes numéricos */}
                    <div className="grid grid-cols-3 gap-2">
                      <AdjustCard
                        label="Calorias"
                        value={log.ajuste_calorico}
                        suffix="kcal"
                      />
                      <AdjustCard
                        label="Volume"
                        value={log.ajuste_volume}
                        suffix="%"
                      />
                      <AdjustCard
                        label="Cardio"
                        value={log.ajuste_cardio}
                        suffix="min"
                      />
                    </div>

                    {/* Ajustes detalhados */}
                    {log.ajustes_proxima_semana && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2 text-xs">
                        <p className="font-semibold text-primary mb-2">
                          Ajustes para próxima semana:
                        </p>
                        {Object.entries(log.ajustes_proxima_semana).map(
                          ([k, v]: any) =>
                            v ? (
                              <div key={k}>
                                <span className="font-medium capitalize">
                                  {k}:
                                </span>{" "}
                                <span className="text-muted-foreground">
                                  {String(v)}
                                </span>
                              </div>
                            ) : null,
                        )}
                      </div>
                    )}

                    {/* Alertas */}
                    {log.alertas && log.alertas.length > 0 && (
                      <div className="space-y-2">
                        {log.alertas.map((a: any, i: number) => (
                          <div
                            key={i}
                            className={`rounded-lg p-2 text-xs border ${
                              a.nivel === "critico"
                                ? "bg-destructive/10 border-destructive/40 text-destructive-foreground"
                                : a.nivel === "atencao"
                                  ? "bg-yellow-500/10 border-yellow-500/40"
                                  : "bg-muted/50 border-border"
                            }`}
                          >
                            <p className="font-semibold flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {a.titulo}
                            </p>
                            <p className="text-muted-foreground mt-0.5">
                              {a.detalhe}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => analyze(log.id)}
                      disabled={isAnalyzing}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-2" />
                      )}
                      Reanalisar 
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => analyze(log.id)}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Analisando (Perplexity + Gemini)...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analisar Dual
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-muted/40 rounded-md px-2 py-1.5">
    <p className="text-[10px] text-muted-foreground">{label}</p>
    <p className="font-semibold text-foreground text-xs">{value}</p>
  </div>
);

const AdjustCard = ({
  label, value, suffix,
}: { label: string; value?: number; suffix: string }) => {
  const v = value ?? 0;
  const positive = v > 0;
  const negative = v < 0;
  return (
    <div className="bg-card border border-border rounded-lg p-2 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p
        className={`text-sm font-bold flex items-center justify-center gap-1 ${
          positive ? "text-green-500" : negative ? "text-destructive" : ""
        }`}
      >
        {positive && <TrendingUp className="h-3 w-3" />}
        {negative && <TrendingDown className="h-3 w-3" />}
        {v > 0 ? "+" : ""}
        {v}
        {suffix}
      </p>
    </div>
  );
};

const PhotoThumb = ({
  label, path, signed, sign,
}: {
  label: string;
  path: string;
  signed: Record<string, string>;
  sign: (p: string) => Promise<string | null | undefined>;
}) => {
  const [url, setUrl] = useState<string | null>(signed[path] || null);
  useEffect(() => {
    if (!url) sign(path).then((u) => u && setUrl(u));
  }, [path]);
  return (
    <div className="relative">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          <img
            src={url}
            alt={label}
            className="w-full aspect-[3/4] object-cover rounded-lg border border-border"
          />
        </a>
      ) : (
        <div className="w-full aspect-[3/4] rounded-lg bg-muted flex items-center justify-center">
          <Camera className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <p className="text-[10px] text-center mt-1 text-muted-foreground">
        {label}
      </p>
    </div>
  );
};

export default WeeklyCheckInsPanel;
