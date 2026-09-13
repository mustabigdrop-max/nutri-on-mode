import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AthleteSelector, { type AthleteOption } from "@/components/coach/AthleteSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Camera, Loader2, ScanLine, Save, TriangleAlert, CheckCircle2, CalendarClock, Dumbbell, Apple,
} from "lucide-react";
import {
  ZONE_META, PHOTO_VIEWS, PHOTO_VIEW_LABEL, SEVERITY_LABEL,
  photoChecklist, weightedScore, assessmentCadence, addDays, bfRangeMidpoint,
  type ApexZonesAnalysis, type PhotoView, type ZoneKey, type WeakPoint,
} from "@/lib/apexVisualZones";

type Step = "atleta" | "fotos" | "analise" | "revisao" | "salvo";

interface LoadedPhoto {
  view: PhotoView;
  file?: File;
  path?: string;
  url?: string;
  date?: string | null;
  origin: "upload" | "historico";
}

const toB64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const yearsSince = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
};

const weeksUntil = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.round((d.getTime() - Date.now()) / (7 * 24 * 3600 * 1000)));
};

export default function ApexVisualAuto() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("atleta");
  const [athlete, setAthlete] = useState<AthleteOption | null>(null);
  const [athleteRow, setAthleteRow] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [photos, setPhotos] = useState<LoadedPhoto[]>([]);
  const [coachNotes, setCoachNotes] = useState("");
  const [loadingAthlete, setLoadingAthlete] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ApexZonesAnalysis | null>(null);
  const [forwardLog, setForwardLog] = useState<string[]>([]);

  const previous = history[0] || null;
  const previousAnalysis: ApexZonesAnalysis | null = previous?.analise_ia?.zones ? previous.analise_ia : null;

  // ─── 1. Atleta selecionado → puxa dados reais ──────────────────
  useEffect(() => {
    if (!athlete?.id) {
      setAthleteRow(null); setHistory([]); setPhotos([]);
      return;
    }
    (async () => {
      setLoadingAthlete(true);
      const [{ data: row }, { data: hist }] = await Promise.all([
        supabase.from("competition_athletes" as any).select("*").eq("id", athlete.id).maybeSingle(),
        supabase
          .from("athlete_visual_assessments" as any)
          .select("id,data_avaliacao,semana_numero,fase,peso_kg,bf_estimado,score_geral,analise_ia,foto_frontal_url,foto_lateral_url,foto_posterior_url")
          .eq("athlete_id", athlete.id)
          .order("data_avaliacao", { ascending: false })
          .limit(10),
      ]);
      setAthleteRow(row || null);
      setHistory((hist as any[]) || []);
      await pullPhotosFromHistory((hist as any[]) || []);
      setLoadingAthlete(false);
      setStep("fotos");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athlete?.id]);

  const pullPhotosFromHistory = async (hist: any[]) => {
    const last = hist[0];
    if (!last) { setPhotos([]); return; }
    const map: [PhotoView, string | null][] = [
      ["frontal", last.foto_frontal_url],
      ["lateral", last.foto_lateral_url],
      ["posterior", last.foto_posterior_url],
    ];
    const loaded: LoadedPhoto[] = [];
    for (const [view, path] of map) {
      if (!path) continue;
      const { data: signed } = await supabase.storage.from("apex-visual-photos").createSignedUrl(path, 3600);
      if (!signed?.signedUrl) continue;
      loaded.push({ view, path, url: signed.signedUrl, date: last.data_avaliacao, origin: "historico" });
    }
    setPhotos(loaded);
  };

  const setPhotoFile = async (view: PhotoView, file: File | null) => {
    setPhotos((prev) => {
      const rest = prev.filter((p) => p.view !== view);
      if (!file) return rest;
      return [...rest, { view, file, url: URL.createObjectURL(file), date: new Date().toISOString().slice(0, 10), origin: "upload" as const }];
    });
  };

  const checklist = useMemo(() => photoChecklist(photos.map((p) => ({ view: p.view, date: p.date }))), [photos]);

  const cadence = useMemo(
    () => assessmentCadence(athleteRow?.fase_atual, weeksUntil(athleteRow?.data_competicao)),
    [athleteRow?.fase_atual, athleteRow?.data_competicao],
  );

  // ─── 3+4. Análise ─────────────────────────────────────────────
  const analisar = async () => {
    if (photos.length === 0) return;
    setAnalyzing(true); setError(null); setStep("analise");
    try {
      const payloadPhotos = [];
      for (const p of photos) {
        if (p.file) {
          payloadPhotos.push({ label: PHOTO_VIEW_LABEL[p.view], mime: p.file.type || "image/jpeg", data: await toB64(p.file) });
        } else if (p.url) {
          payloadPhotos.push({ label: PHOTO_VIEW_LABEL[p.view], url: p.url });
        }
      }

      const { data, error: fnErr } = await supabase.functions.invoke("apex-visual-zones", {
        body: {
          photos: payloadPhotos,
          athlete_name: athleteRow?.nome ?? athlete?.nome ?? null,
          sex: athleteRow?.sexo ?? athlete?.sexo ?? null,
          category: athleteRow?.categoria ?? athlete?.categoria ?? null,
          age: yearsSince(athleteRow?.data_nascimento),
          weight: athleteRow?.peso_kg ?? null,
          height: athleteRow?.altura_cm ?? null,
          phase: athleteRow?.fase_atual ?? null,
          previous_assessment: previousAnalysis
            ? {
                date: previous?.data_avaliacao,
                bf_range: previousAnalysis.bf_range_calibrated || previousAnalysis.bf_range,
                weighted_score: previousAnalysis.weighted_score,
                zones: Object.fromEntries(
                  Object.entries(previousAnalysis.zones || {}).map(([k, v]: any) => [k, v?.score ?? null]),
                ),
                weak_points: (previousAnalysis.weak_points || []).map((w) => w.group),
              }
            : null,
          previous_date: previous?.data_avaliacao ?? null,
          coach_notes: coachNotes || null,
          analysis_date: new Date().toISOString().slice(0, 10),
        },
      });

      if (fnErr) throw new Error(fnErr.message || "Falha ao executar a análise.");
      if ((data as any)?.error) throw new Error((data as any).message || "Falha na análise.");
      const result = (data as any)?.analysis as ApexZonesAnalysis;
      if (!result?.zones) throw new Error("A análise voltou sem as zonas avaliadas.");

      // Trava determinística de confiança conforme fotos reais enviadas
      const cap = checklist.cap;
      const conf = Math.min(typeof result.confidence === "number" ? result.confidence : cap, cap);
      const cad = cadence;
      setAnalysis({
        ...result,
        confidence: conf,
        weighted_score: weightedScore(result.zones) ?? result.weighted_score,
        alerts: [...(result.alerts || []), ...checklist.warnings],
        protocol: {
          ...(result.protocol || {}),
          frequency: cad.frequency,
          frequency_reason: cad.reason,
          next_assessment_date: cad.days ? addDays(new Date(), cad.days) : result.protocol?.next_assessment_date,
        },
      });
      setStep("revisao");
    } catch (e: any) {
      setError(e?.message || "Erro na análise.");
      setStep("fotos");
    } finally {
      setAnalyzing(false);
    }
  };

  // ─── 5. Override do coach ─────────────────────────────────────
  const overrideScore = (key: ZoneKey, raw: string) => {
    setAnalysis((prev) => {
      if (!prev) return prev;
      const parsed = raw === "" ? null : Math.max(0, Math.min(10, Number(raw)));
      const zones = { ...prev.zones, [key]: { ...prev.zones[key], score: parsed, notes: prev.zones[key]?.notes } };
      return { ...prev, zones, weighted_score: weightedScore(zones) ?? undefined, coach_override: true } as any;
    });
  };

  const overrideSeverity = (idx: number, severity: string) => {
    setAnalysis((prev) => {
      if (!prev) return prev;
      const wp = [...(prev.weak_points || [])];
      wp[idx] = { ...wp[idx], severity };
      return { ...prev, weak_points: wp };
    });
  };

  // ─── 6. Salvar + encaminhar ───────────────────────────────────
  const salvar = async () => {
    if (!analysis || !athlete?.id || !user) return;
    setSaving(true); setError(null); setForwardLog([]);
    const log: string[] = [];
    try {
      const { data: cp } = await supabase.from("coach_profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (!cp?.id) throw new Error("Perfil de coach não encontrado.");

      // Fotos novas → arquivadas com metadata
      const paths: Partial<Record<PhotoView, string>> = {};
      for (const p of photos) {
        if (p.file) {
          const ext = p.file.name.split(".").pop() || "jpg";
          const path = `${user.id}/${athlete.id}/${Date.now()}-${p.view}.${ext}`;
          const { error: upErr } = await supabase.storage.from("apex-visual-photos").upload(path, p.file, { upsert: false });
          if (upErr) throw new Error(`Falha ao arquivar a foto ${PHOTO_VIEW_LABEL[p.view]}: ${upErr.message}`);
          paths[p.view] = path;
        } else if (p.path) {
          paths[p.view] = p.path;
        }
      }

      const weighted = weightedScore(analysis.zones);
      const bfMid = bfRangeMidpoint(analysis.bf_range_calibrated || analysis.bf_range);
      const semana = (history[0]?.semana_numero ?? 0) + 1;

      const record = {
        athlete_id: athlete.id,
        coach_id: cp.id,
        semana_numero: semana,
        data_avaliacao: new Date().toISOString().slice(0, 10),
        semanas_ate_palco: weeksUntil(athleteRow?.data_competicao),
        fase: athleteRow?.fase_atual || "manutencao",
        peso_kg: athleteRow?.peso_kg ?? null,
        bf_estimado: bfMid,
        foto_frontal_url: paths.frontal ?? null,
        foto_lateral_url: paths.lateral ?? null,
        foto_posterior_url: paths.posterior ?? null,
        analise_ia: { ...analysis, photo_paths: paths, coach_notes: coachNotes || null },
        score_geral: weighted !== null ? Math.round(weighted * 10) : null,
        score_abdomen: analysis.zones.abdomen?.score ?? null,
        score_ombros: analysis.zones.deltoides_ombros?.score ?? null,
        score_bracos: analysis.zones.bracos?.score ?? null,
        score_pernas: analysis.zones.pernas?.score ?? null,
        score_condicionamento: analysis.zones.vascularizacao?.score ?? null,
        observacoes_coach: coachNotes || null,
        ajustes_plano: (analysis.protocol?.nutrition_adjustments || []).join(" • ") || null,
        meta_proxima_semana: analysis.protocol?.next_assessment_date
          ? `Próxima avaliação: ${analysis.protocol.next_assessment_date} (${analysis.protocol.frequency || cadence.frequency})`
          : null,
        alertas: analysis.alerts || [],
      };

      const { data: saved, error: insErr } = await supabase
        .from("athlete_visual_assessments" as any)
        .insert(record)
        .select("id")
        .maybeSingle();
      if (insErr) throw new Error(insErr.message);
      log.push("Avaliação salva no histórico do atleta.");

      // → TrainingON (STRATUM)
      const weakPoints = (analysis.weak_points || []) as WeakPoint[];
      if (weakPoints.length > 0 || (analysis.protocol?.training_adjustments || []).length > 0) {
        const { error: syncErr } = await supabase.from("apex_training_sync" as any).insert({
          athlete_id: athlete.id,
          coach_id: user.id,
          category: athleteRow?.categoria ?? null,
          weak_points: weakPoints,
          priorities: analysis.protocol?.training_adjustments || [],
          bf_estimated: bfMid,
          sync_status: "pending",
        });
        if (syncErr) log.push(`TrainingON não sincronizado: ${syncErr.message}`);
        else log.push("Pontos fracos e ajustes enviados ao TrainingON (aguardando aplicação do coach).");
      }

      // → NutriPlan (sugestões para revisão profissional)
      const nutri = analysis.protocol?.nutrition_adjustments || [];
      if (nutri.length > 0) {
        log.push("Sugestões nutricionais registradas na avaliação para revisão no NutriPlan.");
      }

      // → Agenda + notificação ao atleta
      const patientId = athleteRow?.patient_user_id || athlete.patient_user_id;
      if (patientId && analysis.protocol?.next_assessment_date) {
        const { error: notifErr } = await supabase.from("coach_notifications" as any).insert({
          recipient_user_id: patientId,
          sender_user_id: user.id,
          notification_type: "apex_avaliacao",
          title: "Próxima avaliação APEX agendada",
          message: `${analysis.protocol.next_assessment_date} — ${analysis.protocol.conditions || "Manhã, jejum, mesma iluminação."}`,
          action_url: "/apex",
          reference_id: (saved as any)?.id ?? null,
        });
        if (notifErr) log.push("Aviso ao atleta não enviado (vínculo ativo necessário).");
        else log.push(`Atleta avisado: próxima avaliação em ${analysis.protocol.next_assessment_date}.`);
      }

      setForwardLog(log);
      setStep("salvo");
      toast({ title: "Avaliação salva", description: "Histórico atualizado e módulos notificados." });
      await pullPhotosFromHistory([]);
    } catch (e: any) {
      setError(e?.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const resetFlow = () => {
    setAnalysis(null); setPhotos([]); setCoachNotes(""); setForwardLog([]); setStep("atleta"); setAthlete(null);
  };

  const weighted = analysis ? weightedScore(analysis.zones) : null;

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach")} aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">APEX Visual — Avaliação automática</h1>
            <p className="text-sm text-muted-foreground">
              Atleta → fotos → análise por zonas → protocolo → encaminhamento
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 1. ATLETA */}
        <Card>
          <CardHeader><CardTitle className="text-base">1. Atleta</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <AthleteSelector value={athlete?.id ?? null} onChange={setAthlete} />
            {loadingAthlete && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando dados do atleta…
              </p>
            )}
            {athleteRow && (
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <Info label="Sexo" value={athleteRow.sexo || "—"} />
                <Info label="Categoria" value={athleteRow.categoria || "—"} />
                <Info label="Peso" value={athleteRow.peso_kg ? `${athleteRow.peso_kg} kg` : "—"} />
                <Info label="Altura" value={athleteRow.altura_cm ? `${athleteRow.altura_cm} cm` : "—"} />
                <Info label="Idade" value={yearsSince(athleteRow.data_nascimento) ?? "—"} />
                <Info label="Fase" value={athleteRow.fase_atual || "—"} />
                <Info label="Semanas até o palco" value={weeksUntil(athleteRow.data_competicao) ?? "—"} />
                <Info label="Avaliações anteriores" value={history.length} />
              </div>
            )}
            {athleteRow?.pontos_fracos_conhecidos && (
              <p className="text-xs text-muted-foreground">
                Pontos fracos já identificados: {athleteRow.pontos_fracos_conhecidos}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 2. FOTOS */}
        {athlete && (
          <Card>
            <CardHeader><CardTitle className="text-base">2. Fotos e verificação</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {PHOTO_VIEWS.map((view) => {
                  const p = photos.find((x) => x.view === view);
                  return (
                    <div key={view} className="space-y-2 rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase tracking-wide">{PHOTO_VIEW_LABEL[view]}</Label>
                        {p && (
                          <Badge variant={p.origin === "upload" ? "default" : "secondary"} className="text-[10px]">
                            {p.origin === "upload" ? "Nova" : "Histórico"}
                          </Badge>
                        )}
                      </div>
                      {p?.url ? (
                        <img src={p.url} alt={`Foto ${PHOTO_VIEW_LABEL[view]} do atleta`} className="h-40 w-full rounded object-cover" />
                      ) : (
                        <div className="flex h-40 items-center justify-center rounded bg-muted text-muted-foreground">
                          <Camera className="h-6 w-6" />
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhotoFile(view, e.target.files?.[0] || null)}
                      />
                      {p?.date && <p className="text-[11px] text-muted-foreground">Data: {p.date}</p>}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg border border-border p-3 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  {checklist.missing.length === 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <TriangleAlert className="h-4 w-4 text-destructive" />
                  )}
                  Confiança máxima: {checklist.cap}%
                </div>
                {checklist.warnings.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                    {checklist.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="coach-notes">Observação do coach (opcional)</Label>
                <Textarea
                  id="coach-notes"
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  placeholder="Condições das fotos, pump, iluminação, contexto do treino…"
                />
              </div>

              <Button onClick={analisar} disabled={photos.length === 0 || analyzing} className="w-full">
                {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
                {analyzing ? "Analisando zonas…" : "Analisar"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 4+5. RESULTADO E REVISÃO */}
        {analysis && (step === "revisao" || step === "salvo") && (
          <Card>
            <CardHeader><CardTitle className="text-base">3. Resultado e revisão do coach</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Info label="Score ponderado" value={weighted ?? "—"} />
                <Info label="BF% estimado" value={analysis.bf_range || "—"} />
                <Info label="BF% calibrado" value={analysis.bf_range_calibrated || "—"} />
                <Info label="Confiança" value={`${analysis.confidence ?? 0}%`} />
              </div>
              {analysis.confidence_reason && (
                <p className="text-xs text-muted-foreground">{analysis.confidence_reason}</p>
              )}

              <div className="space-y-3">
                {ZONE_META.map(({ key, label, weight }) => {
                  const z = analysis.zones[key];
                  const score = typeof z?.score === "number" ? z.score : null;
                  return (
                    <div key={key} className="rounded-lg border border-border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium">
                          {label} <span className="text-xs text-muted-foreground">· peso {z?.weight ?? weight}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number" min={0} max={10} step={0.5}
                            value={score ?? ""}
                            onChange={(e) => overrideScore(key, e.target.value)}
                            className="w-20"
                            aria-label={`Score ${label}`}
                          />
                          {z?.bf_indicator && <Badge variant="secondary">{z.bf_indicator}</Badge>}
                        </div>
                      </div>
                      <Progress value={score !== null ? score * 10 : 0} className="mt-2 h-2" />
                      {z?.description && <p className="mt-2 text-sm text-muted-foreground">{z.description}</p>}
                      {z?.notes && <p className="mt-1 text-xs text-destructive">{z.notes}</p>}
                      {score === null && <p className="mt-1 text-xs text-destructive">Zona não avaliada — informe o score se puder avaliar manualmente.</p>}
                    </div>
                  );
                })}
              </div>

              {(analysis.weak_points || []).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Pontos fracos</h3>
                  {(analysis.weak_points || []).map((wp, i) => (
                    <div key={i} className="rounded-lg border border-border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">{wp.group}</span>
                        <Select value={String(wp.severity)} onValueChange={(v) => overrideSeverity(i, v)}>
                          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(SEVERITY_LABEL).map(([k, l]) => (
                              <SelectItem key={k} value={k}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {wp.description && <p className="mt-1 text-sm text-muted-foreground">{wp.description}</p>}
                      {wp.recommendation && <p className="mt-1 text-xs">{wp.recommendation}</p>}
                    </div>
                  ))}
                </div>
              )}

              {analysis.comparison_previous?.has_previous && (
                <div className="rounded-lg border border-border p-3 text-sm">
                  <h3 className="mb-1 font-semibold">Comparação com a avaliação anterior</h3>
                  <p className="text-muted-foreground">
                    {analysis.comparison_previous.previous_date} · {analysis.comparison_previous.previous_bf} → {analysis.comparison_previous.current_bf}
                  </p>
                  {analysis.comparison_previous.delta && <p className="mt-1">{analysis.comparison_previous.delta}</p>}
                </div>
              )}

              {(analysis.alerts || []).length > 0 && (
                <Alert>
                  <TriangleAlert className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc space-y-1 pl-4">
                      {(analysis.alerts || []).map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-border p-3 text-sm">
                  <div className="mb-1 flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4" /> Agenda</div>
                  <p>{analysis.protocol?.next_assessment_date || "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {analysis.protocol?.frequency} — {analysis.protocol?.frequency_reason}
                  </p>
                  {analysis.protocol?.conditions && <p className="mt-1 text-xs">{analysis.protocol.conditions}</p>}
                </div>
                <div className="rounded-lg border border-border p-3 text-sm">
                  <div className="mb-1 flex items-center gap-2 font-semibold"><Dumbbell className="h-4 w-4" /> TrainingON</div>
                  <ul className="list-disc space-y-1 pl-4 text-xs">
                    {(analysis.protocol?.training_adjustments || ["Sem ajustes sugeridos"]).map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div className="rounded-lg border border-border p-3 text-sm">
                  <div className="mb-1 flex items-center gap-2 font-semibold"><Apple className="h-4 w-4" /> NutriPlan</div>
                  <ul className="list-disc space-y-1 pl-4 text-xs">
                    {(analysis.protocol?.nutrition_adjustments || ["Sem ajustes sugeridos"]).map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                  <p className="mt-1 text-[11px] text-muted-foreground">Sugestões para revisão do profissional — nada é aplicado automaticamente.</p>
                </div>
              </div>

              {analysis.summary && (
                <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                  <h3 className="mb-1 font-semibold">Resumo para o atleta</h3>
                  <p>{analysis.summary}</p>
                </div>
              )}

              {step !== "salvo" && (
                <Button onClick={salvar} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? "Salvando e encaminhando…" : "Confirmar, salvar e encaminhar"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {step === "salvo" && (
          <Card>
            <CardHeader><CardTitle className="text-base">4. Encaminhamentos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {forwardLog.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
              <Button variant="outline" onClick={resetFlow}>Nova avaliação</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
