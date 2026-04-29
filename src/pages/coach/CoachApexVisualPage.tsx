import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AthleteSelector, { AthleteOption } from "@/components/coach/AthleteSelector";

export default function CoachApexVisualPage() {
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState<AthleteOption | null>(null);
  const [last, setLast] = useState<any>(null);

  useEffect(() => {
    if (!athlete) { setLast(null); return; }
    (async () => {
      const { data } = await supabase
        .from("athlete_visual_assessments" as any)
        .select("*")
        .eq("athlete_id", athlete.id)
        .order("data_avaliacao", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLast(data);
    })();
  }, [athlete]);

  return (
    <div className="space-y-4 max-w-5xl">
      <Card className="border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-amber-500" /> APEX Visual · Análise por IA
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecione o atleta para ver a última avaliação visual ou abrir o tracker para enviar nova foto.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <AthleteSelector value={athlete?.id ?? null} onChange={setAthlete} />

          {athlete && (
            <div className="grid md:grid-cols-3 gap-3">
              <Stat label="Último peso" value={last?.peso_kg ? `${last.peso_kg} kg` : "—"} />
              <Stat label="BF estimado" value={last?.bf_estimado ? `${last.bf_estimado}%` : "—"} />
              <Stat label="Score geral" value={last?.score_geral ?? "—"} />
            </div>
          )}

          {athlete && last?.observacoes_coach && (
            <Card className="bg-muted/30 border-muted">
              <CardContent className="pt-4 text-sm whitespace-pre-wrap">{last.observacoes_coach}</CardContent>
            </Card>
          )}

          {athlete && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate(`/coach/atletas/${athlete.id}`)} className="bg-amber-500 hover:bg-amber-600 text-black">
                <Sparkles className="h-4 w-4 mr-2" /> Nova análise / Histórico
              </Button>
              <Button variant="outline" onClick={() => navigate("/coach/atletas")}>
                <ArrowRight className="h-4 w-4 mr-2" /> Ver Roster
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}
