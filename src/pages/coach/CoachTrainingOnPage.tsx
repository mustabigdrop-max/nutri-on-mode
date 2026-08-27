import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, AlertTriangle, ArrowRight, ArrowLeft, FlaskConical, Sparkles, CheckCircle2, Download, Crosshair, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AthleteSelector, { AthleteOption } from "@/components/coach/AthleteSelector";
import CorrectivePlanViewer from "@/components/coach/CorrectivePlanViewer";
import TrainingFeedbackForm from "@/components/coach/TrainingFeedbackForm";
import ApexBridgePanel from "@/components/coach/ApexBridgePanel";

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
  const [apexAnalysisDate, setApexAnalysisDate] = useState<string>("");
  const [apexImported, setApexImported] = useState(false);
  const [apexFullProtocol, setApexFullProtocol] = useState<string>("");

  // Parâmetros de geração com integração APEX
  const [splitType, setSplitType] = useState<string>("ABCD");
  const [frequency, setFrequency] = useState<number>(4);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [volumeWarnings, setVolumeWarnings] = useState<Array<{ muscle: string; actual: number; prescribed: number; excess: number }>>([]);

  // Pontos fracos derivados (score < 6, ordenados do mais fraco ao menos fraco)
  const apexWeakPoints = Object.entries(apexScores)
    .filter(([, s]) => Number(s) < 6)
    .sort(([, a], [, b]) => Number(a) - Number(b))
    .map(([muscle, score]) => ({ muscle, score: Number(score) }));
  const hasApexAnalysis = apexWeakPoints.length > 0;

  const suggestedSets = (score: number) =>
    score <= 3 ? "20–24" : score <= 5 ? "16–20" : "12–16";

  // Volume semanal por músculo (manual ou calculado pelo APEX)
  const [weeklyVolume, setWeeklyVolume] = useState<Record<string, number>>({});
  const [methodConflicts, setMethodConflicts] = useState<
    Array<{ muscle: string; currentVolume: number; issue: string; fix: string; suggestedVolume: number; suggestion: string }>
  >([]);

  // Volume semanal ideal baseado em score APEX + método
  const getVolumeFromApexScore = (score: number, method: string) => {
    const isGVT = /gvt/.test(method);
    const isHighVolume = /fst.?7|y3t/.test(method);
    if (isGVT) {
      if (score <= 5) return { setsPerWeek: 20, setsPerSession: 10, sessionsPerWeek: 2 };
      return { setsPerWeek: 10, setsPerSession: 10, sessionsPerWeek: 1 };
    }
    if (isHighVolume) {
      if (score <= 3) return { setsPerWeek: 24, setsPerSession: 6, sessionsPerWeek: 2 };
      if (score <= 5) return { setsPerWeek: 20, setsPerSession: 5, sessionsPerWeek: 2 };
      return { setsPerWeek: 16, setsPerSession: 4, sessionsPerWeek: 2 };
    }
    if (score <= 3) return { setsPerWeek: 22, setsPerSession: 4, sessionsPerWeek: 3 };
    if (score <= 5) return { setsPerWeek: 18, setsPerSession: 4, sessionsPerWeek: 2 };
    return { setsPerWeek: 14, setsPerSession: 3, sessionsPerWeek: 2 };
  };

  const checkMethodCompatibility = (
    weakPoints: Array<{ muscle: string; score: number }>,
    method: string,
    volumeMap: Record<string, number>,
  ) => {
    const conflicts: Array<{ muscle: string; currentVolume: number; issue: string; fix: string; suggestedVolume: number; suggestion: string }> = [];
    const isGVT = /gvt/.test(method);
    weakPoints.forEach((point) => {
      const volume = volumeMap[point.muscle] || 0;
      if (isGVT && volume < 10) {
        conflicts.push({
          muscle: point.muscle,
          currentVolume: volume,
          issue: `Volume (${volume} sér/sem) incompatível com GVT — mínimo 10 sér/sessão`,
          fix: "increase_volume",
          suggestedVolume: 20,
          suggestion: "Aumentar para 20 sér/sem (2 sessões GVT) ou trocar para método convencional",
        });
      }
      if (volume > 0 && volume < 6) {
        conflicts.push({
          muscle: point.muscle,
          currentVolume: volume,
          issue: `Volume muito baixo (${volume} sér/sem) — insuficiente para hipertrofia`,
          fix: "increase_volume",
          suggestedVolume: 12,
          suggestion: "Volume mínimo para hipertrofia: 10–12 sér/sem",
        });
      }
    });
    return conflicts;
  };

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
      .select("scores, analysis_text, created_at")
      .eq("athlete_id", athlete.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setApexScores(((latestAnalysis as any)?.scores as Record<string, number>) || {});
    setApexFullProtocol((latestAnalysis as any)?.analysis_text || "");
    if ((latestAnalysis as any)?.created_at) {
      const d = new Date((latestAnalysis as any).created_at);
      setApexAnalysisDate(`${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`);
    } else {
      setApexAnalysisDate("");
    }
    setApexImported(false);
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
      if (!trainingText) throw new Error("Resposta vazia do sistema");

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
        description: e?.message || "Falha ao chamar a",
        variant: "destructive",
      });
    } finally {
      setGeneratingTraining(false);
    }
  };

  const [exportingToTrainingOn, setExportingToTrainingOn] = useState(false);

  const handleExportToTrainingOn = async () => {
    if (!correctiveTraining || !coachId || !athlete) {
      toast({ title: "Nada para exportar", description: "Gere o protocolo corretivo primeiro.", variant: "destructive" });
      return;
    }
    setExportingToTrainingOn(true);
    try {
      const weakPoints: string[] = (apexSyncData?.weak_points || []).map((w: any) =>
        typeof w === "string" ? w : (w?.muscle || w?.name || "")
      ).filter(Boolean);
      const phase = sync?.training_phase || apexSyncData?.category || "Corretivo APEX";
      const clientName = `${athlete.nome} — Corretivo APEX`;

      const header = [
        `# ${clientName}`,
        `Fase: ${phase}`,
        weakPoints.length ? `Pontos fracos: ${weakPoints.join(", ")}` : null,
        `Gerado a partir do APEX em ${new Date().toLocaleDateString("pt-BR")}`,
        "",
        "---",
        "",
      ].filter(Boolean).join("\n");

      const protocolText = header + correctiveTraining;

      const { data: inserted, error } = await supabase
        .from("training_protocols")
        .insert({
          user_id: coachId,
          patient_user_id: athlete.patient_user_id || null,
          client_name: clientName,
          phase,
          muscles: weakPoints.length ? weakPoints : null,
          level: "intermediário",
          weeks: "4",
          days_per_week: sync?.dias_treino_semana ? String(sync.dias_treino_semana) : "4",
          equipment: "academia completa",
          session_duration: sync?.tempo_sessao_min ? String(sync.tempo_sessao_min) : "60",
          protocol_text: protocolText,
        })
        .select("id")
        .single();

      if (error) throw error;

      if (athlete.patient_user_id && inserted?.id) {
        await supabase.from("coach_notifications").insert({
          recipient_user_id: athlete.patient_user_id,
          sender_user_id: coachId,
          notification_type: "training_plan",
          title: "Novo treino corretivo APEX",
          message: `${clientName} — ${phase}`,
          action_url: "/training",
          reference_id: inserted.id,
        });
      }

      toast({ title: "✓ Exportado para TrainingON", description: "Disponível em Meus Protocolos." });
    } catch (e: any) {
      toast({ title: "Erro ao exportar", description: e?.message || "Falha ao salvar protocolo", variant: "destructive" });
    } finally {
      setExportingToTrainingOn(false);
    }
  };

  const conflitos: string[] = [];
  if (sync?.volume_sets_semana > 18 && sync?.tempo_sessao_min > 75) conflitos.push("Volume alto + sessão longa: risco de overreach");
  if (sync?.musculos_prioritarios?.includes("pernas") && !sync?.training_phase?.toLowerCase().includes("bulk")) {
    conflitos.push("Prioridade em pernas fora de bulk: ajustar CHO no dia +30%");
  }

  const trainingMethod = String(sync?.sistema_treino || "").toLowerCase();

  const handleImportFromApex = () => {
    const newVolumeMap: Record<string, number> = {};
    apexWeakPoints.forEach((point) => {
      const cfg = getVolumeFromApexScore(point.score, trainingMethod);
      newVolumeMap[point.muscle] = cfg.setsPerWeek;
    });
    setWeeklyVolume(newVolumeMap);
    setApexImported(true);
    setMethodConflicts(checkMethodCompatibility(apexWeakPoints, trainingMethod, newVolumeMap));
  };

  const autoFixConflicts = () => {
    const fixed = { ...weeklyVolume };
    methodConflicts.forEach((c) => {
      if (c.fix === "increase_volume") fixed[c.muscle] = c.suggestedVolume;
    });
    setWeeklyVolume(fixed);
    setMethodConflicts([]);
  };

  // ── Validação de volume pós-geração (lê o bloco "VALIDAÇÃO DE VOLUME SEMANAL" do sistema) ──
  const validateGeneratedVolume = (trainingText: string, prescribed: Record<string, number>) => {
    const violations: Array<{ muscle: string; actual: number; prescribed: number; excess: number }> = [];
    const block = trainingText.match(/VALIDAÇÃO DE VOLUME SEMANAL:([\s\S]*?)(?:EXERCÍCIOS CORRETIVOS|WARM-?UPS POSTURAIS|$)/i)?.[1] || "";
    block.split("\n").filter((l) => /sér/i.test(l)).forEach((line) => {
      const m = line.match(/([^•:]+):\s*(\d+)\s*sér\s*\/\s*(\d+)\s*sér/i);
      if (m) {
        const muscle = m[1].replace("•", "").trim();
        const actual = parseInt(m[2], 10);
        const presc = parseInt(m[3], 10);
        if (actual > presc * 1.15) {
          violations.push({ muscle, actual, prescribed: presc, excess: actual - presc });
        }
      }
    });
    // fallback: também alertar pontos prescritos pelo coach que ficaram sem qualquer menção
    Object.entries(prescribed).forEach(([m]) => { void m; });
    return { isValid: violations.length === 0, violations };
  };

  // ── Geração com integração APEX completa via edge function ──
  const handleGenerateWithApexIntegration = async () => {
    if (!athlete?.id || !coachId) return;
    setGeneratingTraining(true);
    setVolumeWarnings([]);
    try {
      const { data, error } = await supabase.functions.invoke("training-corrective-generate", {
        body: {
          athlete: {
            name: athlete.nome,
            goal: (athlete as any).objetivo || sync?.training_phase || "",
            phase: sync?.training_phase || "",
            protocol: (athlete as any).protocolo || "",
          },
          apexIntegration: {
            apexFullProtocol,
            apexWeakPoints: apexWeakPoints.map((p) => ({
              muscle: p.muscle,
              score: p.score,
              priority: p.score <= 3 ? "CRÍTICA" : p.score <= 5 ? "ALTA" : "MODERADA",
            })),
            trainingMethod,
            weeklyVolume,
            currentWeek,
            splitType,
            frequency,
          },
        },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      const text = (data as any)?.text || "";
      if (!text) throw new Error("Resposta vazia do sistema");

      const validation = validateGeneratedVolume(text, weeklyVolume);
      setVolumeWarnings(validation.violations);

      // Desativa planos anteriores e salva o novo
      await supabase
        .from("corrective_training_plans" as any)
        .update({ is_active: false })
        .eq("athlete_id", athlete.id)
        .eq("is_active", true);

      const { error: insErr } = await supabase
        .from("corrective_training_plans" as any)
        .insert({
          athlete_id: athlete.id,
          coach_id: coachId,
          apex_sync_id: apexSyncData?.id || null,
          training_text: text,
          category: apexSyncData?.category || null,
          weak_points: apexWeakPoints,
          training_method: trainingMethod,
          split_type: splitType,
          week_number: currentWeek,
          weekly_volume: weeklyVolume,
          apex_imported: apexImported,
          apex_weak_points: apexWeakPoints,
          volume_valid: validation.isValid,
          volume_violations: validation.violations,
          is_active: true,
        });
      if (insErr) throw insErr;

      if (apexImported && apexSyncData?.id) {
        await supabase
          .from("apex_training_sync" as any)
          .update({ sync_status: "applied", updated_at: new Date().toISOString() })
          .eq("athlete_id", athlete.id);
      }

      setCorrectiveTraining(text);
      setShowApexBanner(false);
      toast({
        title: validation.isValid ? "✓ Treino integrado APEX gerado" : "⚠ Treino gerado com alertas de volume",
        description: validation.isValid ? undefined : `${validation.violations.length} grupo(s) acima do prescrito`,
      });
    } catch (e: any) {
      toast({
        title: "Erro ao gerar treino integrado",
        description: e?.message || "Falha ao chamar a",
        variant: "destructive",
      });
    } finally {
      setGeneratingTraining(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <Button variant="ghost" size="sm" onClick={() => navigate("/coach/dashboard")} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>
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

          {/* APEX Bridge — corretivos + contraindicados a partir de apex_training_rules */}
          <ApexBridgePanel athleteId={athlete?.id} />

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

          {/* 🎯 Prioridade Muscular — manual ou importada do APEX Visual */}
          {athlete && (
            <Card className="border-border bg-card/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      🎯 Prioridade Muscular
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Defina manualmente ou importe automaticamente do APEX Visual
                    </p>
                  </div>
                  {hasApexAnalysis && !apexImported && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleImportFromApex}
                      className="gap-2 border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                    >
                      <Crosshair className="h-3.5 w-3.5" />
                      Importar do APEX Visual
                      {apexAnalysisDate && (
                        <span className="text-[10px] text-muted-foreground">· {apexAnalysisDate}</span>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>

              {apexImported && (
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Crosshair className="h-3.5 w-3.5" />
                      Prioridade importada do APEX Visual
                      {apexAnalysisDate && (
                        <span className="text-[10px] font-normal text-muted-foreground ml-1">· {apexAnalysisDate}</span>
                      )}
                    </div>
                    <button
                      onClick={() => { setApexImported(false); setMethodConflicts([]); }}
                      className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 border border-border rounded-md"
                    >
                      usar manual
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {apexWeakPoints.map((point, i) => {
                      const cfg = getVolumeFromApexScore(point.score, trainingMethod);
                      const vol = weeklyVolume[point.muscle] ?? cfg.setsPerWeek;
                      const priority = point.score <= 3 ? "CRÍTICA" : point.score <= 5 ? "ALTA" : "MODERADA";
                      const hasConflict = methodConflicts.some((c) => c.muscle === point.muscle);
                      const tone =
                        point.score <= 3
                          ? "text-red-400 border-red-500/40 bg-red-500/5"
                          : point.score <= 5
                          ? "text-amber-300 border-amber-500/40 bg-amber-500/5"
                          : "text-emerald-300 border-emerald-500/30 bg-emerald-500/5";
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-xs ${tone}`}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="capitalize font-semibold">{point.muscle}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/40 border border-current/20">
                              APEX {point.score}/10
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/40 border border-current/20">
                              {priority}
                            </span>
                            {hasConflict && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive border border-destructive/40 inline-flex items-center gap-1">
                                <AlertTriangle className="h-2.5 w-2.5" /> conflito
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] font-bold tabular-nums">{vol} sér/sem</div>
                            <div className="text-[9px] opacity-70">
                              {cfg.sessionsPerWeek}× / sem · {cfg.setsPerSession} sér/sessão
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {methodConflicts.length > 0 && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Conflito detectado: método × volume
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-destructive-foreground/90">
                        {methodConflicts.map((c, i) => (
                          <li key={i}>
                            <span className="font-semibold capitalize">{c.muscle}:</span> {c.issue}
                            <div className="text-muted-foreground">→ {c.suggestion}</div>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={autoFixConflicts} className="gap-1 h-7 text-[11px]">
                          <Zap className="h-3 w-3" />
                          Corrigir automaticamente
                        </Button>
                        <button
                          onClick={() => setMethodConflicts([])}
                          className="text-[11px] px-3 py-1 border border-border rounded-md text-muted-foreground hover:text-foreground"
                        >
                          Ignorar
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    ✦ Exercícios corretivos, cues e correções posturais do APEX serão integrados
                    automaticamente ao gerar o treino.
                  </p>
                </CardContent>
              )}
            </Card>
          )}

          {/* Geração de treino com integração APEX completa */}
          {athlete && apexImported && hasApexAnalysis && (
            <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-blue-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-300">
                  <Crosshair className="h-4 w-4" /> Gerar treino com APEX integrado
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Warm-up postural + exercícios corretivos do APEX integrados ao método principal sem ultrapassar o volume prescrito.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Split</label>
                    <select
                      value={splitType}
                      onChange={(e) => setSplitType(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs"
                    >
                      <option value="ABCD">ABCD</option>
                      <option value="ABCDE">ABCDE</option>
                      <option value="PPL">Push/Pull/Legs</option>
                      <option value="UpperLower">Upper/Lower</option>
                      <option value="FullBody">Full Body</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Frequência</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs"
                    >
                      {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}× / sem</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Semana</label>
                    <select
                      value={currentWeek}
                      onChange={(e) => setCurrentWeek(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs"
                    >
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Semana {n}</option>)}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateWithApexIntegration}
                  disabled={generatingTraining || methodConflicts.length > 0}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-black gap-2"
                >
                  {generatingTraining ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Gerando treino integrado...
                    </>
                  ) : (
                    <>
                      <Dumbbell className="h-4 w-4" />
                      Gerar Treino com APEX Integrado
                      <span className="text-[10px] opacity-80">· {apexWeakPoints.length} grupos corretivos</span>
                    </>
                  )}
                </Button>

                {methodConflicts.length > 0 && (
                  <p className="text-[10px] text-destructive text-center">
                    Resolva os conflitos de método × volume antes de gerar.
                  </p>
                )}

                {correctiveTraining && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 text-emerald-300 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="flex-1">
                      <span className="font-bold">Protocolo gerado com integração APEX Visual</span>
                      {apexAnalysisDate && <span className="text-muted-foreground"> · {apexAnalysisDate}</span>}
                    </span>
                    <span className="text-[10px] opacity-80">{apexWeakPoints.length} grupos corretivos integrados</span>
                  </div>
                )}

                {volumeWarnings.length > 0 && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Volume acima do prescrito em {volumeWarnings.length} grupo(s)
                    </div>
                    <ul className="text-[11px] space-y-0.5 text-destructive-foreground/90">
                      {volumeWarnings.map((w, i) => (
                        <li key={i}>
                          <span className="font-semibold capitalize">{w.muscle}:</span>{" "}
                          {w.actual} séries geradas vs {w.prescribed} prescritas
                          <span className="text-destructive"> (+{w.excess} excesso)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                  Multiplicador aplicado automaticamente no protocolo gerado pelo sistema. Base = 12 séries/grupo.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Corrective training plan output (parsed) */}
          {correctiveTraining && (
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-300">
                  <Sparkles className="h-4 w-4" /> Protocolo de treino corretivo (APEX)
                </CardTitle>
                <Button
                  size="sm"
                  onClick={handleExportToTrainingOn}
                  disabled={exportingToTrainingOn}
                  className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                >
                  <Download className="h-3.5 w-3.5" />
                  {exportingToTrainingOn ? "Exportando..." : "Exportar para TrainingON"}
                </Button>
              </CardHeader>
              <CardContent>
                <CorrectivePlanViewer
                  text={correctiveTraining}
                  apexScores={apexScores}
                  coachId={coachId}
                  athleteId={athlete?.id ?? null}
                  protocolId={apexSyncData?.id ?? null}
                  athleteContext={[
                    athlete?.nome ? `Atleta: ${athlete.nome}` : "",
                    sync?.training_phase ? `Fase: ${sync.training_phase}` : "",
                    Object.keys(apexScores).length ? `Scores APEX: ${Object.entries(apexScores).map(([m, s]) => `${m} ${s}/10`).join(", ")}` : "",
                    apexWeakPoints.length ? `Pontos fracos: ${apexWeakPoints.map((p) => `${p.muscle} (${p.score})`).join(", ")}` : "",
                  ].filter(Boolean).join(" | ")}
                  onProtocolUpdate={(newText) => setCorrectiveTraining(newText)}
                />

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
