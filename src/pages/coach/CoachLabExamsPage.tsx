import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, AlertTriangle, ArrowRight } from "lucide-react";
import AthleteSelector, { AthleteOption } from "@/components/coach/AthleteSelector";

interface ExamRow { id: string; tipo: string; data_exame: string | null; resultado: any; score_metabolico: number | null }
interface AlertRow { id: string; marcador: string; nivel: string; mensagem: string; created_at: string }

export default function CoachLabExamsPage() {
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState<AthleteOption | null>(null);
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);

  useEffect(() => {
    if (!athlete) { setExams([]); setAlerts([]); return; }
    (async () => {
      const { data: ex } = await supabase
        .from("athlete_exams" as any)
        .select("*")
        .eq("athlete_id", athlete.id)
        .order("data_exame", { ascending: false })
        .limit(10);
      setExams(((ex as any) || []) as ExamRow[]);

      if (athlete.patient_user_id) {
        const { data: al } = await supabase
          .from("exam_alerts" as any)
          .select("*")
          .eq("user_id", athlete.patient_user_id)
          .order("created_at", { ascending: false })
          .limit(10);
        setAlerts(((al as any) || []) as AlertRow[]);
      } else {
        setAlerts([]);
      }
    })();
  }, [athlete]);

  const lastScore = exams.find((e) => e.score_metabolico != null)?.score_metabolico ?? null;

  return (
    <div className="space-y-4 max-w-5xl">
      <Card className="border-emerald-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-emerald-400" /> Exames · Lab
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Score metabólico e alertas críticos por atleta.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <AthleteSelector value={athlete?.id ?? null} onChange={setAthlete} />

          {athlete && (
            <div className="grid md:grid-cols-3 gap-3">
              <Stat label="Score metabólico" value={lastScore ?? "—"} accent="emerald" />
              <Stat label="Exames registrados" value={exams.length} />
              <Stat label="Alertas ativos" value={alerts.length} accent={alerts.length > 0 ? "amber" : undefined} />
            </div>
          )}

          {alerts.length > 0 && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4" /> Alertas críticos
                </div>
                <ul className="text-sm space-y-2">
                  {alerts.map((a) => (
                    <li key={a.id} className="flex items-start gap-2">
                      <Badge variant="outline" className="border-amber-500/40 text-amber-400 shrink-0">{a.nivel}</Badge>
                      <div>
                        <div className="font-medium">{a.marcador}</div>
                        <div className="text-xs text-muted-foreground">{a.mensagem}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {exams.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-sm">Últimos exames</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {exams.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm border-b border-border/50 py-2">
                    <span>{e.tipo}</span>
                    <span className="text-xs text-muted-foreground">{e.data_exame ? new Date(e.data_exame).toLocaleDateString("pt-BR") : "—"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate("/lab")} className="bg-emerald-500 hover:bg-emerald-600 text-black">
              <ArrowRight className="h-4 w-4 mr-2" /> Abrir Lab completo
            </Button>
            <Button variant="outline" onClick={() => navigate("/blood-test")}>
              Enviar exame
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: any; accent?: "emerald" | "amber" }) {
  const color = accent === "emerald" ? "text-emerald-400" : accent === "amber" ? "text-amber-400" : "";
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-2xl font-bold mt-1 ${color}`}>{String(value)}</div>
      </CardContent>
    </Card>
  );
}
