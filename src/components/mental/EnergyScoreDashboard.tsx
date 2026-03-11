import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Zap, TrendingUp, Lightbulb } from "lucide-react";

const EMOJIS: Record<number, string> = { 1: "😴", 2: "😴", 3: "😔", 4: "😔", 5: "😐", 6: "😐", 7: "😊", 8: "😊", 9: "🔥", 10: "🔥" };

const weekClass = (avg: number) => {
  if (avg >= 8) return { label: "🔥 Semana de alta performance", color: "text-green-400" };
  if (avg >= 6) return { label: "✅ Semana sólida", color: "text-[hsl(168,100%,50%)]" };
  if (avg >= 4) return { label: "🟡 Semana de atenção", color: "text-yellow-400" };
  return { label: "🔴 Semana crítica", color: "text-red-400" };
};

interface Props { mp: any }

const EnergyScoreDashboard = ({ mp }: Props) => {
  const [score, setScore] = useState(5);
  const [cause, setCause] = useState("");
  const [showCheckin, setShowCheckin] = useState(true);

  const handleSubmit = async () => {
    await mp.logEnergyScore(score, cause || undefined);
    setShowCheckin(false);
    setCause("");
  };

  const chartData = [...(mp.energyScores || [])].reverse().map((s: any) => ({
    date: new Date(s.score_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    score: s.score,
    calories: s.calories_that_day ? Math.round(Number(s.calories_that_day) / 100) : null,
  }));

  const weekScores = mp.energyScores.slice(0, 7);
  const weekAvg = weekScores.length > 0 ? weekScores.reduce((a: number, b: any) => a + (b.score || 0), 0) / weekScores.length : 0;
  const wk = weekClass(weekAvg);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-[hsl(38,80%,52%)]" /> Score de Energia</h2>

      {/* Check-in */}
      {showCheckin && (
        <Card className="border-[hsl(38,80%,52%)]/20 bg-card/80">
          <CardContent className="p-4 space-y-4">
            <p className="font-medium">⚡ Como está sua energia hoje?</p>
            <div className="text-center">
              <span className="text-5xl">{EMOJIS[score]}</span>
              <p className="text-3xl font-bold mt-2 text-[hsl(38,80%,52%)]">{score}/10</p>
            </div>
            <Slider value={[score]} onValueChange={([v]) => setScore(v)} min={1} max={10} step={1}
              className="[&_[role=slider]]:bg-[hsl(38,80%,52%)]" />
            <div className="flex gap-1 justify-between text-xs text-muted-foreground">
              <span>😴 Exausto</span><span>🔥 No pico</span>
            </div>
            <Input placeholder="O que pode ter causado isso? (opcional)" value={cause} onChange={e => setCause(e.target.value)} />
            <Button className="w-full bg-[hsl(38,80%,52%)] text-background" onClick={handleSubmit}>Registrar Energia</Button>
          </CardContent>
        </Card>
      )}

      {/* Weekly Summary */}
      {weekScores.length > 0 && (
        <Card className="bg-card/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Média da semana</p>
              <p className="text-2xl font-bold">{weekAvg.toFixed(1)}</p>
            </div>
            <Badge variant="outline" className={wk.color}>{wk.label}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      {chartData.length > 2 && (
        <Card className="bg-card/80">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Evolução</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 30% 15%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(240 20% 50%)" }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "hsl(240 20% 50%)" }} />
                <Tooltip contentStyle={{ background: "hsl(240 40% 7%)", border: "1px solid hsl(240 30% 15%)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="score" stroke="hsl(263 70% 58%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {mp.energyInsights.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2"><Lightbulb className="w-4 h-4 text-[hsl(38,80%,52%)]" /> Insights da IA</h3>
          {mp.energyInsights.map((insight: any) => (
            <Card key={insight.id} className="bg-card/80 border-[hsl(263,70%,58%)]/10">
              <CardContent className="p-3">
                <p className="text-sm">{insight.insight_text}</p>
                <Badge variant="outline" className="mt-2 text-xs">{insight.insight_type}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {mp.energyScores.length >= 7 && (
        <Button variant="outline" className="w-full" onClick={mp.generateInsights} disabled={mp.loading}>
          {mp.loading ? "Analisando..." : "🔍 Gerar Insights com IA"}
        </Button>
      )}

      {!showCheckin && <Button variant="ghost" className="w-full" onClick={() => setShowCheckin(true)}>+ Novo check-in</Button>}
    </div>
  );
};

export default EnergyScoreDashboard;
