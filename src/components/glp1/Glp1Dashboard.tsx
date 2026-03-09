import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, TrendingDown, TrendingUp, Droplets, Zap, AlertTriangle, CheckCircle2, Pill, Target, Activity, Brain, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Glp1Profile, Glp1DailyLog, Glp1WeeklyScore } from "@/hooks/useGlp1";

interface Glp1DashboardProps {
  profile: Glp1Profile;
  dailyLogs: Glp1DailyLog[];
  weeklyScores: Glp1WeeklyScore[];
  weightKg: number;
  onSaveDailyLog: (data: Partial<Glp1DailyLog>) => void;
}

interface AiAnalysis {
  alerts: { type: "warning" | "success" | "info"; text: string }[];
  weekly_analysis: string;
  recommendations: string[];
  protocol_adjustments?: string;
}

const PROFILE_LABELS: Record<string, { label: string; color: string; emoji: string; desc: string }> = {
  iniciante: { label: "Iniciante GLP-1", color: "text-yellow-400", emoji: "🟡", desc: "Começou recentemente, apetite ainda presente" },
  supressao: { label: "Supressão Intensa", color: "text-red-400", emoji: "🔴", desc: "Come muito pouco, risco de sarcopenia" },
  saida: { label: "Fase de Saída", color: "text-green-400", emoji: "🟢", desc: "Reduzindo dose, risco de reganho" },
};

const ALERT_ICONS: Record<string, any> = {
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

const Glp1Dashboard = ({ profile, dailyLogs, weeklyScores, weightKg, onSaveDailyLog }: Glp1DashboardProps) => {
  const profileInfo = PROFILE_LABELS[profile.profile_class] || PROFILE_LABELS.iniciante;
  const proteinGoal = Math.round(weightKg * 2.0);
  const kcalGoal = Math.max(1000, Math.round(weightKg * 20));
  const hydrationGoal = 2500;

  const todayLog = dailyLogs.find((l) => l.log_date === new Date().toISOString().split("T")[0]);
  const [proteinInput, setProteinInput] = useState(todayLog?.protein_g?.toString() || "");
  const [kcalInput, setKcalInput] = useState(todayLog?.total_kcal?.toString() || "");
  const [hydrationInput, setHydrationInput] = useState(todayLog?.hydration_ml?.toString() || "");

  const proteinPct = todayLog ? Math.min(100, (todayLog.protein_g / proteinGoal) * 100) : 0;
  const kcalPct = todayLog ? Math.min(100, (todayLog.total_kcal / kcalGoal) * 100) : 0;
  const hydrationPct = todayLog ? Math.min(100, (todayLog.hydration_ml / hydrationGoal) * 100) : 0;

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/glp1-ai-analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({}),
        }
      );
      if (resp.status === 429) { toast.error("Muitas requisições. Aguarde um momento."); return; }
      if (resp.status === 402) { toast.error("Créditos esgotados."); return; }
      if (!resp.ok) throw new Error("AI error");
      const data = await resp.json();
      setAiAnalysis(data);
    } catch (e) {
      console.error("AI analysis error:", e);
      toast.error("Erro ao gerar análise IA");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (dailyLogs.length > 0) {
      fetchAiAnalysis();
    }
  }, []);

  // Fallback alerts when AI not loaded
  const displayAlerts = aiAnalysis?.alerts || (() => {
    const alerts: { type: "warning" | "success" | "info"; text: string }[] = [];
    const last3 = dailyLogs.slice(0, 3);
    if (todayLog && todayLog.protein_g < proteinGoal * 0.7) {
      alerts.push({ type: "warning", text: `Você comeu menos de ${Math.round(proteinGoal * 0.7)}g de proteína hoje — risco de perda muscular` });
    }
    if (last3.length === 3 && last3.every((l) => l.total_kcal < 1000)) {
      alerts.push({ type: "warning", text: "Sua ingestão calórica está muito baixa há 3 dias seguidos" });
    }
    const last5 = dailyLogs.slice(0, 5);
    if (last5.length === 5 && last5.every((l) => l.protein_g >= proteinGoal * 0.9)) {
      alerts.push({ type: "success", text: "Ótimo — você manteve sua meta de proteína por 5 dias consecutivos!" });
    }
    alerts.push({ type: "info", text: "Lembrete: hidratação é essencial com GLP-1 — beba pelo menos 2,5L hoje" });
    return alerts;
  })();

  const latestScore = weeklyScores[0];

  const handleSaveLog = () => {
    onSaveDailyLog({
      log_date: new Date().toISOString().split("T")[0],
      protein_g: Number(proteinInput) || 0,
      total_kcal: Number(kcalInput) || 0,
      hydration_ml: Number(hydrationInput) || 0,
    });
  };

  const supplements = [
    { name: "Whey Protein", dose: "30-40g/dia", reason: "Preservar massa muscular" },
    { name: "Creatina", dose: "5g/dia", reason: "Manutenção de força" },
    { name: "Vitamina B12", dose: "1000mcg/dia", reason: "Absorção reduzida" },
    { name: "Ferro", dose: "14mg/dia", reason: "Ingestão calórica baixa" },
    { name: "Cálcio + Vit D", dose: "1000mg + 2000UI", reason: "Saúde óssea" },
    { name: "Magnésio", dose: "400mg/dia", reason: "Relaxamento muscular" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Class Badge */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">{profileInfo.emoji}</span>
            <div className="flex-1">
              <p className={`text-sm font-bold ${profileInfo.color}`}>{profileInfo.label}</p>
              <p className="text-xs text-muted-foreground">{profileInfo.desc}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Medicamento</p>
              <p className="text-sm font-semibold text-foreground capitalize">{profile.medication}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Alerts */}
      {displayAlerts.length > 0 && (
        <div className="space-y-2">
          {aiLoading && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-primary/20 bg-primary/5">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Analisando seus dados com IA...</span>
            </div>
          )}
          {displayAlerts.map((a, i) => {
            const Icon = ALERT_ICONS[a.type] || Info;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  a.type === "warning" ? "bg-destructive/10 border-destructive/30" :
                  a.type === "success" ? "bg-accent/10 border-accent/30" :
                  "bg-primary/10 border-primary/30"
                }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  a.type === "warning" ? "text-destructive" :
                  a.type === "success" ? "text-accent" : "text-primary"
                }`} />
                <p className="text-xs text-foreground/90">{a.text}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* AI Weekly Analysis */}
      {aiAnalysis?.weekly_analysis && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-[#00C896]/20 bg-[#00C896]/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#00C896]" /> Análise Semanal IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {aiAnalysis.weekly_analysis}
              </p>
              {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-mono text-[#00C896] uppercase tracking-wider mb-2">Ações para a próxima semana</p>
                  <div className="space-y-1.5">
                    {aiAnalysis.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#00C896]/20 text-[#00C896] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs text-foreground/80">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {aiAnalysis.protocol_adjustments && (
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Ajuste sugerido</p>
                  <p className="text-xs text-foreground/80">{aiAnalysis.protocol_adjustments}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Protocol Targets */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" /> Metas do Protocolo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted-foreground">Proteína</span>
              <span className="text-xs font-mono text-accent">{todayLog?.protein_g || 0}g / {proteinGoal}g</span>
            </div>
            <Progress value={proteinPct} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted-foreground">Calorias</span>
              <span className="text-xs font-mono text-primary">{todayLog?.total_kcal || 0} / {kcalGoal} kcal</span>
            </div>
            <Progress value={kcalPct} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted-foreground">Hidratação</span>
              <span className="text-xs font-mono text-blue-400">{todayLog?.hydration_ml || 0}ml / {hydrationGoal}ml</span>
            </div>
            <Progress value={hydrationPct} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Daily Log Input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" /> Registro Diário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[.65rem] text-muted-foreground">Proteína (g)</label>
              <Input type="number" value={proteinInput} onChange={(e) => setProteinInput(e.target.value)} className="bg-secondary/50 h-9 text-sm" />
            </div>
            <div>
              <label className="text-[.65rem] text-muted-foreground">Calorias</label>
              <Input type="number" value={kcalInput} onChange={(e) => setKcalInput(e.target.value)} className="bg-secondary/50 h-9 text-sm" />
            </div>
            <div>
              <label className="text-[.65rem] text-muted-foreground">Água (ml)</label>
              <Input type="number" value={hydrationInput} onChange={(e) => setHydrationInput(e.target.value)} className="bg-secondary/50 h-9 text-sm" />
            </div>
          </div>
          <Button onClick={handleSaveLog} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm">
            Salvar Registro
          </Button>
        </CardContent>
      </Card>

      {/* Weekly Score */}
      {latestScore && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Score Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--accent))" strokeWidth="6"
                    strokeDasharray={`${(latestScore.protocol_score / 100) * 264} 264`} strokeLinecap="round" />
                </svg>
                <span className="absolute text-2xl font-bold text-accent font-display">{latestScore.protocol_score}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Proteína média</p>
                <p className="text-sm font-bold text-foreground">{latestScore.avg_protein_g}g</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kcal média</p>
                <p className="text-sm font-bold text-foreground">{latestScore.avg_kcal}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hidratação</p>
                <p className="text-sm font-bold text-foreground">{latestScore.avg_hydration_ml}ml</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exit Mode */}
      {profile.profile_class === "saida" && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" /> Modo Saída GLP-1
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Protocolo de transição de 12 semanas para sair do medicamento sem reganho.</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Semana atual</span>
                <span className="text-green-400 font-bold">{profile.exit_week || 1} / 12</span>
              </div>
              <Progress value={((profile.exit_week || 1) / 12) * 100} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-secondary/50">
                <p className="text-muted-foreground">Fase</p>
                <p className="font-semibold text-foreground">
                  {(profile.exit_week || 1) <= 4 ? "Estabilização" : (profile.exit_week || 1) <= 8 ? "Aumento calórico" : "Reeducação"}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-secondary/50">
                <p className="text-muted-foreground">Foco</p>
                <p className="font-semibold text-foreground">
                  {(profile.exit_week || 1) <= 4 ? "Manter massa muscular" : (profile.exit_week || 1) <= 8 ? "Reintrodução gradual" : "Apetite natural"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supplementation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Pill className="w-4 h-4 text-accent" /> Suplementação Recomendada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {supplements.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="text-[.65rem] text-muted-foreground">{s.reason}</p>
                </div>
                <span className="text-xs font-mono text-accent">{s.dose}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Refresh AI button */}
      <Button
        variant="outline"
        onClick={fetchAiAnalysis}
        disabled={aiLoading}
        className="w-full text-xs"
      >
        {aiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Brain className="w-3 h-3 mr-2" />}
        {aiLoading ? "Analisando..." : "Atualizar análise IA"}
      </Button>
    </div>
  );
};

export default Glp1Dashboard;
