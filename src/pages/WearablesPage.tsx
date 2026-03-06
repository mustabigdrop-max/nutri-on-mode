import { useState } from "react";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Footprints,
  Flame,
  Moon,
  Heart,
  TrendingUp,
  Target,
  ArrowLeft,
  Save,
  Activity,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const WearablesPage = () => {
  const navigate = useNavigate();
  const { todayLog, logs, loading, upsertLog, weekAvg } = useActivityLogs();
  const { profile } = useProfile();

  const [steps, setSteps] = useState(todayLog?.steps?.toString() ?? "");
  const [caloriesBurned, setCaloriesBurned] = useState(todayLog?.calories_burned?.toString() ?? "");
  const [sleepHours, setSleepHours] = useState(todayLog?.sleep_hours?.toString() ?? "");
  const [heartRateAvg, setHeartRateAvg] = useState(todayLog?.heart_rate_avg?.toString() ?? "");
  const [heartRateMax, setHeartRateMax] = useState(todayLog?.heart_rate_max?.toString() ?? "");
  const [notes, setNotes] = useState(todayLog?.notes ?? "");
  const [saving, setSaving] = useState(false);

  // Sync form when todayLog loads
  useState(() => {
    if (todayLog) {
      setSteps(todayLog.steps?.toString() ?? "");
      setCaloriesBurned(todayLog.calories_burned?.toString() ?? "");
      setSleepHours(todayLog.sleep_hours?.toString() ?? "");
      setHeartRateAvg(todayLog.heart_rate_avg?.toString() ?? "");
      setHeartRateMax(todayLog.heart_rate_max?.toString() ?? "");
      setNotes(todayLog.notes ?? "");
    }
  });

  const handleSave = async () => {
    setSaving(true);
    const { error } = await upsertLog({
      steps: parseInt(steps) || 0,
      calories_burned: parseInt(caloriesBurned) || 0,
      sleep_hours: parseFloat(sleepHours) || 0,
      heart_rate_avg: heartRateAvg ? parseInt(heartRateAvg) : null,
      heart_rate_max: heartRateMax ? parseInt(heartRateMax) : null,
      notes: notes || null,
    }) ?? {};
    setSaving(false);
    if (!error) {
      toast({ title: "✅ Atividade salva!", description: "Meta calórica ajustada automaticamente." });
    } else {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const statCards = [
    {
      icon: Footprints,
      label: "Passos hoje",
      value: todayLog?.steps ?? 0,
      avg: weekAvg("steps"),
      unit: "",
      color: "text-primary",
    },
    {
      icon: Flame,
      label: "Calorias queimadas",
      value: todayLog?.calories_burned ?? 0,
      avg: weekAvg("calories_burned"),
      unit: "kcal",
      color: "text-destructive",
    },
    {
      icon: Moon,
      label: "Sono",
      value: todayLog?.sleep_hours ?? 0,
      avg: weekAvg("sleep_hours"),
      unit: "h",
      color: "text-accent",
    },
  ];

  // Last 7 days for mini chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const log = logs.find((l) => l.log_date === date);
    return {
      day: format(subDays(new Date(), 6 - i), "EEE", { locale: ptBR }),
      steps: log?.steps ?? 0,
      calories: log?.calories_burned ?? 0,
    };
  });

  const maxSteps = Math.max(...last7.map((d) => d.steps), 1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold font-heading">Atividade & Saúde</h1>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <Activity className="ml-auto h-5 w-5 text-accent" />
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6 pb-24">
        {/* Auto-adjust banner */}
        {profile?.vet_kcal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border"
          >
            <Target className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Meta ajustada</p>
              <p className="text-xs text-muted-foreground">
                {profile.vet_kcal} kcal/dia baseado na sua atividade
              </p>
            </div>
            <Zap className="ml-auto h-4 w-4 text-primary" />
          </motion.div>
        )}

        {/* Stats overview */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-3 text-center">
                  <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
                  <p className="text-lg font-bold">{s.value}{s.unit && ` ${s.unit}`}</p>
                  <p className="text-[10px] text-muted-foreground">
                    média: {s.avg}{s.unit && ` ${s.unit}`}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mini bar chart — steps last 7 days */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Passos — últimos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-1 h-20">
              {last7.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary/80 transition-all"
                    style={{
                      height: `${Math.max((d.steps / maxSteps) * 100, 4)}%`,
                    }}
                  />
                  <span className="text-[9px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Input form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">Registrar atividade de hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <Footprints className="h-3 w-3" /> Passos
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <Flame className="h-3 w-3" /> Calorias queimadas
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <Moon className="h-3 w-3" /> Horas de sono
                </Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <Heart className="h-3 w-3" /> FC média (bpm)
                </Label>
                <Input
                  type="number"
                  placeholder="—"
                  value={heartRateAvg}
                  onChange={(e) => setHeartRateAvg(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                <Heart className="h-3 w-3" /> FC máxima (bpm)
              </Label>
              <Input
                type="number"
                placeholder="—"
                value={heartRateMax}
                onChange={(e) => setHeartRateMax(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label className="text-xs">Notas</Label>
              <Textarea
                placeholder="Ex: treino de musculação 1h, caminhada 30min..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-secondary border-border"
                rows={2}
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-primary text-primary-foreground font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar atividade"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent logs */}
        {logs.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Histórico recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {logs.slice(0, 7).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                >
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.log_date), "dd/MM")}
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Footprints className="h-3 w-3 text-primary" />
                      {log.steps?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-destructive" />
                      {log.calories_burned}
                    </span>
                    <span className="flex items-center gap-1">
                      <Moon className="h-3 w-3 text-accent" />
                      {log.sleep_hours}h
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default WearablesPage;
