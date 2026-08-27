import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePlanGate } from "@/hooks/usePlanGate";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Upload, FileText, Loader2, AlertTriangle,
  CheckCircle, Clock, ShieldCheck, TrendingUp, TrendingDown,
  Minus, Sparkles, ChevronDown, ChevronUp, Heart, Shield,
  Beaker, Activity, Brain, Bone, Pill, FlaskConical
} from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface RiskAlert {
  nivel: string;
  marcador: string;
  mensagem: string;
  acao_imediata: string;
}

interface Marker {
  name: string;
  value: number;
  unit: string;
  reference_range: string;
  reference_athlete?: string;
  status: "normal" | "low" | "high" | "critical";
  nivel_semaforo?: string;
  interpretation: string;
  acao?: string;
}

interface SuplementoRec {
  suplemento: string;
  dose: string;
  horario: string;
  motivo: string;
}

interface DietaryRec {
  recommendation: string;
  priority: "high" | "medium" | "low";
  related_markers: string[];
}

interface Analysis {
  semaforo_geral?: string;
  resumo_executivo?: string;
  markers: Marker[];
  summary: string;
  risk_alerts: (string | RiskAlert)[];
  dietary_recommendations: DietaryRec[];
  suplementacao_ajustada?: SuplementoRec[];
  proximos_exames?: { prazo: string; exames: string[] };
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
  analyzed: { label: "Analisado pelo sistema", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  validated: { label: "Validado pelo coach", icon: ShieldCheck, color: "text-accent", bg: "bg-accent/10" },
  applied: { label: "Aplicado ao plano", icon: CheckCircle, color: "text-primary", bg: "bg-primary/10" },
};

const semaforoConfig: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  verde: { label: "Saudável", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", emoji: "🟢" },
  amarelo: { label: "Atenção", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", emoji: "🟡" },
  vermelho: { label: "Crítico", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", emoji: "🔴" },
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

const markerSemaforoColor = (nivel?: string) => {
  switch (nivel) {
    case "vermelho": return "border-l-2 border-l-red-500";
    case "amarelo": return "border-l-2 border-l-yellow-500";
    default: return "border-l-2 border-l-green-500";
  }
};

const priorityColor = (p: string) => {
  switch (p) {
    case "high": return "border-destructive/30 bg-destructive/5";
    case "medium": return "border-primary/30 bg-primary/5";
    default: return "border-border bg-card";
  }
};

const panelIcons: Record<string, any> = {
  hormonal: Brain,
  hepatico: Beaker,
  cardiovascular: Heart,
  renal: Activity,
  tireoidiano: FlaskConical,
  metabolico: Activity,
  osseo: Bone,
  prostatico: Shield,
};

function groupMarkers(markers: Marker[]): Record<string, Marker[]> {
  const groups: Record<string, Marker[]> = {};
  const panelMap: Record<string, string> = {
    testosterona: "hormonal", estradiol: "hormonal", lh: "hormonal", fsh: "hormonal",
    shbg: "hormonal", prolactina: "hormonal", dhea: "hormonal", igf: "hormonal",
    cortisol: "hormonal", progesterona: "hormonal",
    ast: "hepatico", alt: "hepatico", tgo: "hepatico", tgp: "hepatico",
    ggt: "hepatico", fosfatase: "hepatico", bilirrubina: "hepatico",
    colesterol: "cardiovascular", ldl: "cardiovascular", hdl: "cardiovascular",
    trigliceri: "cardiovascular", hematocrito: "cardiovascular", hemoglobina: "cardiovascular",
    pcr: "cardiovascular", homocisteina: "cardiovascular", leucocit: "cardiovascular",
    plaquet: "cardiovascular",
    creatinina: "renal", ureia: "renal", urico: "renal", tfg: "renal",
    microalbumin: "renal",
    tsh: "tireoidiano", t3: "tireoidiano", t4: "tireoidiano",
    glicemia: "metabolico", glicose: "metabolico", insulina: "metabolico",
    hba1c: "metabolico", "hemoglobina glicada": "metabolico", homa: "metabolico",
    vitamina: "osseo", calcio: "osseo", ferro: "osseo", ferritina: "osseo",
    b12: "osseo", zinco: "osseo", magnesio: "osseo", fosforo: "osseo",
    psa: "prostatico",
  };

  for (const m of markers) {
    const name = m.name.toLowerCase();
    let panel = "geral";
    for (const [key, p] of Object.entries(panelMap)) {
      if (name.includes(key)) { panel = p; break; }
    }
    if (!groups[panel]) groups[panel] = [];
    groups[panel].push(m);
  }
  return groups;
}

const panelNames: Record<string, string> = {
  hormonal: "Painel Hormonal",
  hepatico: "Painel Hepático",
  cardiovascular: "Painel Cardiovascular",
  renal: "Painel Renal",
  tireoidiano: "Painel Tireoidiano",
  metabolico: "Painel Metabólico",
  osseo: "Painel Ósseo & Geral",
  prostatico: "Painel Prostático",
  geral: "Outros Marcadores",
};

const BloodTestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { plan, hasAccess } = usePlanGate();
  const [tests, setTests] = useState<BloodTest[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "markers" | "actions">("overview");

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

  const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png|webp|heic|heif)$/i)) {
      toast.error("Envie PDF ou foto (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx 50MB)");
      return;
    }

    setUploading(true);
    try {
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("blood-tests")
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage
        .from("blood-tests")
        .createSignedUrl(fileName, 60 * 60 * 24 * 365);
      if (!urlData?.signedUrl) throw new Error("Falha ao gerar URL");

      const { data: testData, error: insertError } = await supabase
        .from("blood_tests")
        .insert({
          user_id: user.id,
          pdf_url: urlData.signedUrl,
          test_date: new Date().toISOString().split("T")[0],
        } as any)
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("Arquivo enviado! Iniciando análise APEX...");
      await fetchTests();
      
      if (testData) {
        await analyzeTest((testData as any).id, urlData.signedUrl);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao enviar arquivo");
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

      toast.success("Análise APEX concluída!");
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

  const renderAnalysis = (analysis: Analysis) => {
    const semaforo = semaforoConfig[analysis.semaforo_geral || "amarelo"] || semaforoConfig.amarelo;
    const groupedMarkers = groupMarkers(analysis.markers || []);

    return (
      <div className="space-y-4">
        {/* Semáforo geral */}
        <div className={`rounded-lg border p-3 ${semaforo.bg}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{semaforo.emoji}</span>
            <span className={`text-sm font-bold ${semaforo.color}`}>
              Status Geral: {semaforo.label}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {analysis.resumo_executivo || analysis.summary}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/30 rounded-lg p-1">
          {(["overview", "markers", "actions"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "overview" ? "Visão Geral" : tab === "markers" ? "Marcadores" : "Ações"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-3">
            {/* Risk alerts */}
            {analysis.risk_alerts?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Alertas de Risco
                </p>
                {analysis.risk_alerts.map((alert, j) => {
                  const isObj = typeof alert === "object";
                  const nivel = isObj ? (alert as RiskAlert).nivel : "amarelo";
                  const msg = isObj ? (alert as RiskAlert).mensagem : alert;
                  const acao = isObj ? (alert as RiskAlert).acao_imediata : null;
                  return (
                    <div key={j} className={`rounded-lg border p-2.5 ${
                      nivel === "vermelho" ? "border-red-500/30 bg-red-500/5" : "border-yellow-500/30 bg-yellow-500/5"
                    }`}>
                      <div className="flex items-start gap-2">
                        <span className="text-xs">{nivel === "vermelho" ? "🔴" : "🟡"}</span>
                        <div>
                          <p className="text-[11px] text-foreground font-medium">{msg}</p>
                          {acao && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              → {acao}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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

            {/* Próximos exames */}
            {analysis.proximos_exames && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-bold text-primary mb-1">📅 Próximos Exames</p>
                <p className="text-[10px] text-muted-foreground mb-2">Repetir em: {analysis.proximos_exames.prazo}</p>
                <div className="flex flex-wrap gap-1">
                  {analysis.proximos_exames.exames?.map((ex, i) => (
                    <span key={i} className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "markers" && (
          <div className="space-y-3">
            {Object.entries(groupedMarkers).map(([panel, markers]) => {
              const PanelIcon = panelIcons[panel] || Activity;
              const isOpen = expandedPanel === panel;
              const criticalCount = markers.filter(m => m.status === "critical" || m.status === "high").length;
              return (
                <div key={panel} className="rounded-lg border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setExpandedPanel(isOpen ? null : panel)}
                    className="w-full p-3 flex items-center gap-2 text-left"
                  >
                    <PanelIcon className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-foreground flex-1">
                      {panelNames[panel] || panel}
                    </span>
                    {criticalCount > 0 && (
                      <span className="text-[9px] bg-destructive/15 text-destructive px-1.5 py-0.5 rounded-full font-bold">
                        {criticalCount} alerta{criticalCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-1.5">
                          {markers.map((marker, j) => (
                            <div key={j} className={`flex items-start gap-2 p-2 rounded-lg bg-muted/20 ${markerSemaforoColor(marker.nivel_semaforo)}`}>
                              {markerStatusIcon(marker.status)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-[11px] font-semibold text-foreground truncate">{marker.name}</p>
                                  <div className="text-right ml-2 flex-shrink-0">
                                    <span className={`text-xs font-bold font-mono ${markerStatusColor(marker.status)}`}>
                                      {marker.value}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground ml-0.5">{marker.unit}</span>
                                  </div>
                                </div>
                                <p className="text-[9px] text-muted-foreground font-mono">
                                  Lab: {marker.reference_range}
                                  {marker.reference_athlete && ` | Atleta: ${marker.reference_athlete}`}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                                  {marker.interpretation}
                                </p>
                                {marker.acao && (
                                  <p className="text-[10px] text-primary mt-1 font-medium">
                                    → {marker.acao}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "actions" && (
          <div className="space-y-3">
            {/* Suplementação ajustada */}
            {analysis.suplementacao_ajustada?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5 text-primary" /> Suplementação Baseada nos Exames
                </p>
                <div className="space-y-1.5">
                  {analysis.suplementacao_ajustada.map((sup, j) => (
                    <div key={j} className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-foreground">{sup.suplemento}</span>
                        <span className="text-[10px] font-mono text-primary">{sup.dose}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        ⏰ {sup.horario} • {sup.motivo}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested plan changes */}
            {analysis.suggested_plan_changes && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Ajustes ao Plano
                </p>
                <div className="space-y-1.5 text-[11px] text-foreground">
                  {analysis.suggested_plan_changes.increase_nutrients?.length! > 0 && (
                    <p>📈 Aumentar: {analysis.suggested_plan_changes.increase_nutrients!.join(", ")}</p>
                  )}
                  {analysis.suggested_plan_changes.decrease_nutrients?.length! > 0 && (
                    <p>📉 Diminuir: {analysis.suggested_plan_changes.decrease_nutrients!.join(", ")}</p>
                  )}
                  {analysis.suggested_plan_changes.add_foods?.length! > 0 && (
                    <p>✅ Adicionar: {analysis.suggested_plan_changes.add_foods!.join(", ")}</p>
                  )}
                  {analysis.suggested_plan_changes.avoid_foods?.length! > 0 && (
                    <p>🚫 Evitar: {analysis.suggested_plan_changes.avoid_foods!.join(", ")}</p>
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
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/coach/dashboard")} className="p-2 rounded-lg hover:bg-card transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Exames de Sangue <span className="text-primary">🔬</span></h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Agente APEX • Análise clínico-esportiva
            </p>
          </div>
        </div>

        {/* Plan badge */}
        {hasAccess("ON +") && (
          <div className={`mb-4 rounded-lg border p-2.5 flex items-center gap-2 ${
            hasAccess("ON PRO") ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"
          }`}>
            <Shield className={`w-4 h-4 ${hasAccess("ON PRO") ? "text-destructive" : "text-primary"}`} />
            <div>
              <p className={`text-[10px] font-bold ${hasAccess("ON PRO") ? "text-destructive" : "text-primary"}`}>
                {hasAccess("ON PRO") ? "MODO COMPLETO — Contexto farmacológico ativo" : "MODO NATURAL — Otimização sem farmacológicos"}
              </p>
            </div>
          </div>
        )}

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
                <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">Enviar exame de sangue</p>
                <p className="text-xs text-muted-foreground">PDF ou foto (JPG, PNG) até 50MB</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,image/*"
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
            <FlaskConical className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-foreground mb-1">Agente APEX de Exames</p>
              <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Envie o PDF ou foto do seu exame</li>
                <li>interpreta no contexto clínico-esportivo</li>
                <li>Sistema de semáforo 🟢🟡🔴 por marcador</li>
                <li>Protocolos de suplementação ajustados</li>
                <li>Comparativo com referências para atletas</li>
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
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            Exame {new Date(test.test_date).toLocaleDateString("pt-BR")}
                          </p>
                          {analysis?.semaforo_geral && (
                            <span className="text-xs">
                              {semaforoConfig[analysis.semaforo_geral]?.emoji || "🟡"}
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] font-mono ${status.color}`}>
                          {isAnalyzing ? "Analisando com APEX..." : status.label}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && analysis && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                            {renderAnalysis(analysis)}

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
