import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, AlertTriangle, ArrowRight, FlaskConical, Sparkles, CheckCircle2, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AthleteSelector, { AthleteOption } from "@/components/coach/AthleteSelector";
import CorrectivePlanViewer from "@/components/coach/CorrectivePlanViewer";
import TrainingFeedbackForm from "@/components/coach/TrainingFeedbackForm";

export default function CoachTrainingOnPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [athlete, setAthlete] = useState<AthleteOption | null>(null);
  const autoTriggeredRef = useRef(false);
  const [sync, setSync] = useState<any>(null);

  // APEX corrective flow
  const [apexSyncData, setApexSyncData] = useState<any>(null);
  const [showApexBanner, setShowApexBanner] = useState(false);
  const [generatingTraining, setGeneratingTraining] = useState(false);
  const [correctiveTraining, setCorrectiveTraining] = useState<string>("");
  const [coachId, setCoachId] = useState<string | null>(null);
  const [apexScores, setApexScores] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCoachId(data.user?.id ?? null));
  }, []);

  // Auto-load athlete from URL (?athlete=<id>)
  useEffect(() => {
    const aid = searchParams.get("athlete");
    if (!aid || athlete?.id === aid) return;
    (async () => {
      const { data } = await supabase
        .from("competition_athletes")
        .select("id,nome,patient_user_id,fase_atual,data_competicao")
        .eq("id", aid)
        .maybeSingle();
      if (data) setAthlete(data as AthleteOption);
    })();
  }, [searchParams, athlete?.id]);

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

  // Detect pending APEX sync for this athlete and load latest active corrective plan
  const loadApexSync = useCallback(async () => {
    if (!athlete?.id) {
      setApexSyncData(null);
      setShowApexBanner(false);
      setCorrectiveTraining("");
      return;
    }
    const { data: syncRow } = await supabase
      .from("apex_training_sync" as any)
      .select("*")
      .eq("athlete_id", athlete.id)
      .maybeSingle();

    if (syncRow) {
      setApexSyncData(syncRow);
      setShowApexBanner((syncRow as any).sync_status === "pending");
    } else {
      setApexSyncData(null);
      setShowApexBanner(false);
    }

    const { data: planRow } = await supabase
      .from("corrective_training_plans" as any)
      .select("training_text")
      .eq("athlete_id", athlete.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setCorrectiveTraining((planRow as any)?.training_text || "");

    // Latest APEX scores by muscle (used for badges + AI volume multiplier)
    const { data: latestAnalysis } = await supabase
      .from("apex_analyses" as any)
      .select("scores, created_at")
      .eq("athlete_id", athlete.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setApexScores(((latestAnalysis as any)?.scores as Record<string, number>) || {});
  }, [athlete?.id]);

  useEffect(() => { loadApexSync(); }, [loadApexSync]);

  // Auto-trigger corrective training generation when navigated with ?mode=corrective
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (
      mode === "corrective" &&
      apexSyncData &&
      coachId &&
      athlete?.id &&
      !correctiveTraining &&
      !generatingTraining &&
      !autoTriggeredRef.current
    ) {
      autoTriggeredRef.current = true;
      handleGenerateCorrectiveTraining();
      // clear the param so it doesn't retrigger on reload
      const next = new URLSearchParams(searchParams);
      next.delete("mode");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apexSyncData, coachId, athlete?.id, correctiveTraining, generatingTraining]);

  const handleGenerateCorrectiveTraining = async () => {
    if (!apexSyncData || !athlete?.id || !coachId) return;
    setGeneratingTraining(true);
    try {
      const { data, error } = await supabase.functions.invoke("training-corrective-generate", {
        body: {
          syncData: apexSyncData,
          apexScores,
          athlete: {
            name: athlete.nome,
            goal: (athlete as any).objetivo || sync?.training_phase || "",
            phase: sync?.training_phase || "",
            protocol: (athlete as any).protocolo || "",
          },
        },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      const trainingText = (data as any)?.text || "";
      if (!trainingText) throw new Error("Resposta vazia da IA");

      // Deactivate previous active plans
      await supabase
        .from("corrective_training_plans" as any)
        .update({ is_active: false })
        .eq("athlete_id", athlete.id)
        .eq("is_active", true);

      // Save new plan
      const { error: insErr } = await supabase
        .from("corrective_training_plans" as any)
        .insert({
          athlete_id: athlete.id,
          coach_id: coachId,
          apex_sync_id: apexSyncData.id,
          training_text: trainingText,
          category: apexSyncData.category,
          weak_points: apexSyncData.weak_points,
          is_active: true,
        });
      if (insErr) throw insErr;

      // Mark APEX sync as applied
      await supabase
        .from("apex_training_sync" as any)
        .update({ sync_status: "applied", updated_at: new Date().toISOString() })
        .eq("athlete_id", athlete.id);

      setCorrectiveTraining(trainingText);
      setShowApexBanner(false);
      setApexSyncData({ ...apexSyncData, sync_status: "applied" });
      toast({ title: "✓ Treino corretivo gerado e salvo" });
    } catch (e: any) {
      toast({
        title: "Erro ao gerar treino corretivo",
        description: e?.message || "Falha ao chamar a IA",
        variant: "destructive",
      });
    } finally {
      setGeneratingTraining(false);
    }
  };

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

          {/* APEX Sync Banner */}
          {showApexBanner && apexSyncData && (
            <Card className="border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-blue-500/10">
              <CardContent className="pt-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                    <FlaskConical className="h-4 w-4" /> 🔬 Dados do APEX Visual disponíveis
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {apexSyncData.weak_points?.length || 0} pontos fracos identificados ·
                    {" "}Prioridade: {apexSyncData.priorities?.p1 || "—"}
                  </div>
                </div>
                <Button
                  onClick={handleGenerateCorrectiveTraining}
                  disabled={generatingTraining}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {generatingTraining ? "Gerando..." : "Gerar Treino Corretivo"}
                </Button>
              </CardContent>
            </Card>
          )}

          {apexSyncData?.sync_status === "applied" && !showApexBanner && (
            <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-3.5 w-3.5" /> Treino corretivo APEX ativo
            </div>
          )}

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

          {/* APEX volume adjustment summary */}
          {Object.keys(apexScores).length > 0 && (
            <Card className="border-border bg-card/60">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-amber-400" /> Ajustes de volume por score APEX
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(apexScores).map(([m, s]) => {
                    const mult = s < 5 ? 1.4 : s < 7 ? 1.2 : s >= 8 ? 0.9 : 1.0;
                    const baseSets = 12;
                    const adj = Math.round(baseSets * mult);
                    const tone =
                      mult > 1.2 ? "text-red-400 border-red-500/40 bg-red-500/5"
                      : mult > 1.0 ? "text-amber-400 border-amber-500/40 bg-amber-500/5"
                      : mult < 1.0 ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/5"
                      : "text-muted-foreground border-border bg-muted/30";
                    return (
                      <div key={m} className={`px-3 py-2 rounded-md border text-xs ${tone}`}>
                        <div className="font-bold capitalize">{m}</div>
                        <div className="opacity-90">
                          {baseSets} → {adj} séries ({mult >= 1 ? "+" : ""}{Math.round((mult - 1) * 100)}% · score {s}/10)
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[10px] text-muted-foreground mt-2">
                  Multiplicador aplicado automaticamente no protocolo gerado pela IA. Base = 12 séries/grupo.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Corrective training plan output (parsed) */}
          {correctiveTraining && (
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-blue-300">
                  <Sparkles className="h-4 w-4" /> Protocolo de treino corretivo (APEX)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CorrectivePlanViewer text={correctiveTraining} apexScores={apexScores} />
              </CardContent>
            </Card>
          )}

          {/* Feedback de sessão */}
          {athlete?.id && coachId && (
            <TrainingFeedbackForm athleteId={athlete.id} coachId={coachId} apexScores={apexScores} />
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
