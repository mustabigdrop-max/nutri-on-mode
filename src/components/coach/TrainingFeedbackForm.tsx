import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  athleteId: string;
  coachId: string;
  apexScores: Record<string, number>;
}

const DEFAULT_GROUPS = ["deltoides", "dorsais", "peitoral", "quadriceps", "posterior", "biceps", "triceps", "gluteos"];

export default function TrainingFeedbackForm({ athleteId, coachId, apexScores }: Props) {
  const groups = Object.keys(apexScores).length > 0 ? Object.keys(apexScores) : DEFAULT_GROUPS;
  const [conn, setConn] = useState<Record<string, number>>({});
  const [pump, setPump] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setConn({});
    setPump({});
    setNotes("");
  }, [athleteId]);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("training_feedback" as any).insert({
        athlete_id: athleteId,
        coach_id: coachId,
        session_date: new Date().toISOString().slice(0, 10),
        muscle_connections: conn,
        pump_scores: pump,
        notes: notes || null,
      });
      if (error) throw error;
      toast({ title: "✓ Feedback de sessão registrado" });
      setConn({}); setPump({}); setNotes("");
    } catch (e: any) {
      toast({ title: "Erro ao salvar feedback", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-emerald-500/30 bg-emerald-500/5">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-emerald-300">
          <Activity className="h-4 w-4" /> Feedback de sessão · conexão e pump por grupo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          {groups.map((g) => {
            const apex = apexScores[g];
            return (
              <div key={g} className="rounded-md border border-border bg-card/60 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold capitalize">{g}</div>
                  {apex !== undefined && (
                    <span className="text-[10px] text-muted-foreground">APEX visual: {apex}/10</span>
                  )}
                </div>
                <NumRow label="Conexão" value={conn[g] ?? 0} onChange={(v) => setConn({ ...conn, [g]: v })} />
                <NumRow label="Pump" value={pump[g] ?? 0} onChange={(v) => setPump({ ...pump, [g]: v })} />
              </div>
            );
          })}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações livres da sessão..."
          rows={2}
          className="w-full text-xs p-2 rounded-md border border-border bg-card/60 text-foreground"
        />
        <Button onClick={save} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600">
          <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando..." : "Salvar feedback"}
        </Button>
      </CardContent>
    </Card>
  );
}

function NumRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground w-16">{label}</span>
      <input
        type="range" min={0} max={10} step={1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
      <span className="text-xs font-bold w-6 text-right">{value}</span>
    </div>
  );
}
