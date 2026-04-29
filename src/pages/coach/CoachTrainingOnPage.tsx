import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, AlertTriangle, ArrowRight } from "lucide-react";
import AthleteSelector, { AthleteOption } from "@/components/coach/AthleteSelector";

export default function CoachTrainingOnPage() {
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState<AthleteOption | null>(null);
  const [sync, setSync] = useState<any>(null);

  useEffect(() => {
    if (!athlete?.patient_user_id) { setSync(null); return; }
    (async () => {
      const { data } = await supabase
        .from("training_nutrition_sync")
        .select("*")
        .eq("user_id", athlete.patient_user_id!)
        .maybeSingle();
      setSync(data);
    })();
  }, [athlete]);

  const conflitos: string[] = [];
  if (sync?.volume_sets_semana > 18 && sync?.tempo_sessao_min > 75) conflitos.push("Volume alto + sessão longa: risco de overreach");
  if (sync?.musculos_prioritarios?.includes("pernas") && !sync?.training_phase?.toLowerCase().includes("bulk")) {
    conflitos.push("Prioridade em pernas fora de bulk: ajustar CHO no dia +30%");
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <Card className="border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-400" /> TrainingON · Sync com NutriON
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Dados sincronizados que ajustam macros e TDEE automaticamente.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <AthleteSelector value={athlete?.id ?? null} onChange={setAthlete} />

          {athlete && !sync && (
            <p className="text-sm text-muted-foreground">Atleta ainda não tem sync de TrainingON registrada.</p>
          )}

          {sync && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat label="Sistema" value={sync.sistema_treino || "—"} />
                <Stat label="Tipo de fibra" value={sync.tipo_fibra || "—"} />
                <Stat label="Volume sets/sem" value={sync.volume_sets_semana ?? "—"} />
                <Stat label="STRATUM fase" value={sync.stratum_fase || sync.training_phase || "—"} />
                <Stat label="Sessão (min)" value={sync.tempo_sessao_min ?? "—"} />
                <Stat label="Intensidade" value={sync.intensidade_treino || "—"} />
                <Stat label="Cardio mesmo dia" value={sync.cardio_mesmo_dia ? "Sim" : "Não"} />
                <Stat label="Prioridades" value={(sync.musculos_prioritarios || []).join(", ") || "—"} />
              </div>

              {conflitos.length > 0 && (
                <Card className="bg-amber-500/10 border-amber-500/30">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                      <AlertTriangle className="h-4 w-4" /> Conflitos detectados
                    </div>
                    <ul className="text-sm space-y-1 list-disc list-inside text-amber-100/90">
                      {conflitos.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate("/training")} className="bg-blue-500 hover:bg-blue-600">
              <ArrowRight className="h-4 w-4 mr-2" /> Abrir TrainingON
            </Button>
            {athlete && (
              <Button variant="outline" onClick={() => navigate("/coach/plano-alimentar")}>
                Ver Plano Alimentar
              </Button>
            )}
          </div>
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
        <div className="text-lg font-semibold mt-1">{String(value)}</div>
      </CardContent>
    </Card>
  );
}
