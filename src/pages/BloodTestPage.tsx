import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Upload, FileText, Loader2, AlertTriangle,
  CheckCircle, Clock, ShieldCheck, TrendingUp, TrendingDown,
  Minus, Sparkles, ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface Marker {
  name: string;
  value: number;
  unit: string;
  reference_range: string;
  status: "normal" | "low" | "high" | "critical";
  interpretation: string;
}

interface DietaryRec {
  recommendation: string;
  priority: "high" | "medium" | "low";
  related_markers: string[];
}

interface Analysis {
  markers: Marker[];
  summary: string;
  risk_alerts: string[];
  dietary_recommendations: DietaryRec[];
  suggested_plan_changes: {
    increase_nutrients?: string[];
    decrease_nutrients?: string[];
    add_foods?: string[];
    avoid_foods?: string[];
    protein_adjustment?: number | null;
    calorie_adjustment?: number | null;
  };
}

interface BloodTest {
  id: string;
  pdf_url: string;
  test_date: string;
  status: string;
  ai_analysis: Analysis | null;
  suggested_changes: any;
  validated_at: string | null;
  applied_at: string | null;
  notes: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending: { label: "Aguardando análise", icon: Clock, color: "text-muted-foreground", bg: "bg-muted/50" },
  analyzed: { label: "Analisado pela IA", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  validated: { label: "Validado pelo coach", icon: ShieldCheck, color: "text-accent", bg: "bg-accent/10" },
  applied: { label: "Aplicado ao plano", icon: CheckCircle, color: "text-primary", bg: "bg-primary/10" },
};

const markerStatusIcon = (status: string) => {
  switch (status) {
    case "high": return <TrendingUp className="w-3.5 h-3.5 text-destructive" />;
    case "low": return <TrendingDown className="w-3.5 h-3.5 text-accent" />;
    case "critical": return <AlertTriangle className="w-3.5 h-3.5 text-destructive" />;
    default: return <Minus className="w-3.5 h-3.5 text-primary" />;
  }
};

const markerStatusColor = (status: string) => {
  switch (status) {
    case "high": return "text-destructive";
    case "low": return "text-accent";
    case "critical": return "text-destructive font-bold";
    default: return "text-primary";
  }
};

const priorityColor = (p: string) => {
  switch (p) {
    case "high": return "border-destructive/30 bg-destructive/5";
    case "medium": return "border-primary/30 bg-primary/5";
    default: return "border-border bg-card";
  }
};

const BloodTestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [tests, setTests] = useState<BloodTest[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("blood_tests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTests((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTests(); }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são aceitos");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx 10MB)");
      return;
    }

    setUploading(true);
    try {
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("blood-tests")
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("blood-tests")
        .getPublicUrl(fileName);

      const { data: testData, error: insertError } = await supabase
        .from("blood_tests")
        .insert({
          user_id: user.id,
          pdf_url: urlData.publicUrl,
          test_date: new Date().toISOString().split("T")[0],
        } as any)
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("PDF enviado! Iniciando análise com IA...");
      await fetchTests();
      
      // Auto-analyze
      if (testData) {
        await analyzeTest((testData as any).id, urlData.publicUrl);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao enviar PDF");
    } finally {
      setUploading(false);
    }
  };

  const analyzeTest = async (testId: string, pdfUrl: string) => {
    setAnalyzing(testId);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-blood-test", {
        body: { blood_test_id: testId, pdf_url: pdfUrl },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Análise concluída!");
      setExpandedTest(testId);
      await fetchTests();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro na análise");
    } finally {
      setAnalyzing(null);
    }
  };

  const applyChanges = async (test: BloodTest) => {
    if (!profile || !test.ai_analysis) return;
    const changes = test.ai_analysis.suggested_plan_changes;
    const updates: any = {};

    if (changes.protein_adjustment) updates.protein_g = changes.protein_adjustment;
    if (changes.calorie_adjustment) updates.vet_kcal = changes.calorie_adjustment;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user!.id);
      if (error) {
        toast.error("Erro ao aplicar mudanças");
        return;
      }
    }

    await supabase
      .from("blood_tests")
      .update({ status: "applied", applied_at: new Date().toISOString() } as any)
      .eq("id", test.id);

    toast.success("Mudanças aplicadas ao seu plano!");
    await fetchTests();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-card transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Exames de Sangue</h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Análise inteligente com IA
            </p>
          </div>
        </div>

        {/* Upload area */}
        <motion.label
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="block mb-6 cursor-pointer"
        >
          <div className="rounded-xl border-2 border-dashed border-border bg-card/50 p-8 text-center hover:border-primary/40 transition-all group">
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Enviando PDF...</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">Enviar exame de sangue</p>
                <p className="text-xs text-muted-foreground">PDF até 10MB · A IA analisa automaticamente</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </motion.label>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-foreground mb-1">Como funciona</p>
              <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Envie o PDF do seu exame de sangue</li>
                <li>A IA identifica marcadores e interpreta resultados</li>
                <li>Sugestões de ajuste no plano são geradas</li>
                <li>Seu profissional valida antes de aplicar</li>
              </ol>
            </div>
          </div>
        </motion.div>

        {/* Tests list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum exame enviado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {tests.map((test, i) => {
                const status = statusConfig[test.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const isExpanded = expandedTest === test.id;
                const isAnalyzing = analyzing === test.id;
                const analysis = test.ai_analysis as Analysis | null;

                return (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    {/* Header */}
                    <button
                      onClick={() => setExpandedTest(isExpanded ? null : test.id)}
                      className="w-full p-4 flex items-center gap-3 text-left"
                    >
                      <div className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center`}>
                        {isAnalyzing ? (
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        ) : (
                          <StatusIcon className={`w-5 h-5 ${status.color}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          Exame {new Date(test.test_date).toLocaleDateString("pt-BR")}
                        </p>
                        <p className={`text-[10px] font-mono ${status.color}`}>
                          {isAnalyzing ? "Analisando com IA..." : status.label}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && analysis && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                            {/* Summary */}
                            <div className="rounded-lg bg-muted/30 p-3">
                              <p className="text-xs font-bold text-foreground mb-1">Resumo</p>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {analysis.summary}
                              </p>
                            </div>

                            {/* Risk alerts */}
                            {analysis.risk_alerts?.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-bold text-destructive flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Alertas
                                </p>
                                {analysis.risk_alerts.map((alert, j) => (
                                  <div key={j} className="rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
                                    <p className="text-[11px] text-foreground">{alert}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Markers */}
                            {analysis.markers?.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-foreground mb-2">Marcadores</p>
                                <div className="space-y-1.5">
                                  {analysis.markers.map((marker, j) => (
                                    <div key={j} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                                      {markerStatusIcon(marker.status)}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-semibold text-foreground truncate">{marker.name}</p>
                                        <p className="text-[9px] text-muted-foreground font-mono">
                                          Ref: {marker.reference_range}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <span className={`text-xs font-bold font-mono ${markerStatusColor(marker.status)}`}>
                                          {marker.value}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground ml-0.5">{marker.unit}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Dietary recommendations */}
                            {analysis.dietary_recommendations?.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-foreground mb-2">Recomendações Nutricionais</p>
                                <div className="space-y-2">
                                  {analysis.dietary_recommendations.map((rec, j) => (
                                    <div key={j} className={`rounded-lg border p-3 ${priorityColor(rec.priority)}`}>
                                      <p className="text-[11px] text-foreground">{rec.recommendation}</p>
                                      <p className="text-[9px] text-muted-foreground mt-1 font-mono">
                                        {rec.related_markers?.join(", ")}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Suggested changes */}
                            {analysis.suggested_plan_changes && (
                              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                                <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5" /> Ajustes sugeridos ao plano
                                </p>
                                <div className="space-y-1.5 text-[11px] text-foreground">
                                  {analysis.suggested_plan_changes.increase_nutrients?.length > 0 && (
                                    <p>📈 Aumentar: {analysis.suggested_plan_changes.increase_nutrients.join(", ")}</p>
                                  )}
                                  {analysis.suggested_plan_changes.decrease_nutrients?.length > 0 && (
                                    <p>📉 Diminuir: {analysis.suggested_plan_changes.decrease_nutrients.join(", ")}</p>
                                  )}
                                  {analysis.suggested_plan_changes.add_foods?.length > 0 && (
                                    <p>✅ Adicionar: {analysis.suggested_plan_changes.add_foods.join(", ")}</p>
                                  )}
                                  {analysis.suggested_plan_changes.avoid_foods?.length > 0 && (
                                    <p>🚫 Evitar: {analysis.suggested_plan_changes.avoid_foods.join(", ")}</p>
                                  )}
                                  {analysis.suggested_plan_changes.protein_adjustment && (
                                    <p>💪 Proteína sugerida: {analysis.suggested_plan_changes.protein_adjustment}g</p>
                                  )}
                                  {analysis.suggested_plan_changes.calorie_adjustment && (
                                    <p>🔥 VET sugerido: {analysis.suggested_plan_changes.calorie_adjustment} kcal</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-2">
                              {test.status === "analyzed" && (
                                <button
                                  onClick={() => applyChanges(test)}
                                  className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Aplicar ao meu plano
                                </button>
                              )}
                              {test.status === "applied" && (
                                <div className="flex-1 py-2.5 rounded-lg bg-primary/10 text-primary text-xs font-bold text-center">
                                  ✓ Aplicado em {new Date(test.applied_at!).toLocaleDateString("pt-BR")}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default BloodTestPage;
