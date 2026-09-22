import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardCheck, Copy, Download, Loader2, Pencil, Save, ShieldAlert } from "lucide-react";
import { buildComandoStratum, camposFaltantes, type ComandoAluno } from "@/lib/apexComandoStratum";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

type JsonObject = Record<string, any>;

const asObject = (value: unknown): JsonObject => value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};
const asArray = (value: unknown): JsonObject[] => Array.isArray(value) ? value.filter((item) => item && typeof item === "object") as JsonObject[] : [];

export default function ApexOrchestratorPage() {
  const { runId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [run, setRun] = useState<JsonObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [protocols, setProtocols] = useState<JsonObject[]>([]);
  const [volumes, setVolumes] = useState<JsonObject[]>([]);
  const [overrideNote, setOverrideNote] = useState("");
  const [aluno, setAluno] = useState<ComandoAluno>({});
  const [treinoAnterior, setTreinoAnterior] = useState("");

  const load = useCallback(async () => {
    if (!runId) return;
    setLoading(true);
    const { data, error } = await supabase.from("apex_orchestrator_runs").select("*").eq("id", runId).maybeSingle();
    if (error || !data) {
      toast({ title: "Relatório não encontrado", variant: "destructive" });
      setLoading(false);
      return;
    }
    const next = data as JsonObject;
    setRun(next);
    setProtocols(asArray(next.protocolos_ativos));
    setVolumes(asArray(asObject(next.plano_treino).volume));
    setOverrideNote(String(asObject(next.coach_report).override_note || ""));
    const savedAluno = asObject(asObject(next.coach_report).aluno_comando);
    const visual = asObject(next.visual_report);
    const planoDados = asObject(next.plano_treino);
    setAluno({
      nome: savedAluno.nome || asObject(next.coach_report).athlete_name || "",
      sexo: savedAluno.sexo || "",
      idade: savedAluno.idade ?? "",
      peso_kg: savedAluno.peso_kg ?? "",
      altura_cm: savedAluno.altura_cm ?? "",
      bf_range: savedAluno.bf_range || visual.bf_range || "",
      nivel: savedAluno.nivel || planoDados.nivel || "",
      objetivo: savedAluno.objetivo || "",
      frequencia: savedAluno.frequencia ?? (Array.isArray(planoDados.divisao?.sessoes) ? planoDados.divisao.sessoes.length : ""),
      duracao_sessao_min: savedAluno.duracao_sessao_min ?? "",
      equipamento: savedAluno.equipamento || "",
      lesoes: savedAluno.lesoes || "",
    });
    setTreinoAnterior(String(savedAluno.treino_anterior || ""));
    setLoading(false);
  }, [runId]);

  useEffect(() => { void load(); }, [load]);

  const diagnostico = asObject(run?.diagnostico);
  const grupos = asArray(diagnostico.grupos);
  const plano = asObject(run?.plano_treino);
  const evolution = asObject(run?.evolution_snapshot);
  const gamification = asObject(run?.gamification_updates);
  const report = asObject(run?.coach_report);
  const messages = asArray(run?.praxis_messages);
  const logs = asArray(run?.execution_log);
  const nutriplan = asArray(run?.nutriplan_sync);
  const rankCurrent = asObject(gamification.rank_atual);
  const rankPrevious = asObject(gamification.rank_anterior);
  const statusLabel = useMemo(() => {
    if (run?.status === "published") return "Publicado";
    if (run?.status === "approved") return "Aprovado";
    if (run?.status === "partial_ready") return "Parcial · checklist pendente";
    return "Pronto para revisão";
  }, [run?.status]);

  const saveOverrides = async () => {
    if (!run || !user) return;
    setSaving(true);
    const changedPlan = { ...plano, volume: volumes };
    const changedReport = { ...report, override_note: overrideNote, edited_manually: true, edited_at: new Date().toISOString(), edited_by: user.id };
    const changedLog = [...logs, { etapa: "Override do coach", status: "complete", timestamp: new Date().toISOString(), note: overrideNote || "Exercícios ou volume editados manualmente." }];
    const { error } = await supabase.from("apex_orchestrator_runs").update({
      protocolos_ativos: protocols,
      plano_treino: changedPlan,
      coach_report: changedReport,
      execution_log: changedLog,
    }).eq("id", run.id);
    setSaving(false);
    if (error) {
      toast({ title: "Não foi possível salvar", description: error.message, variant: "destructive" });
      return;
    }
    setRun({ ...run, protocolos_ativos: protocols, plano_treino: changedPlan, coach_report: changedReport, execution_log: changedLog });
    setEditing(false);
    toast({ title: "Override salvo", description: "A versão do coach prevalece na publicação." });
  };

  const approveAndPublish = async () => {
    if (!run || !user || run.status === "published") return;
    setPublishing(true);
    try {
      if (editing) {
        toast({ title: "Salve o override antes de publicar", variant: "destructive" });
        return;
      }
      const currentPlan = { ...plano, volume: volumes, protocolos_ativos: protocols };
      const { data: protocol, error: planError } = await supabase.from("training_protocols").insert({
        user_id: user.id,
        patient_user_id: run.patient_user_id || null,
        client_name: report.athlete_name || "Atleta APEX",
        phase: plano.periodizacao?.mesociclo || "APEX",
        days_per_week: Array.isArray(plano.divisao?.sessoes) ? plano.divisao.sessoes.length : null,
        protocol_text: JSON.stringify(currentPlan),
        periodizacao_text: JSON.stringify(plano.periodizacao || {}),
        anatomy_text: JSON.stringify({ diagnostico, protocolos: protocols }),
        tecnica_text: JSON.stringify(plano.tecnicas || []),
      }).select("id").single();
      if (planError) throw planError;

      if (run.patient_user_id && nutriplan.length) {
        await supabase.from("nutry_sync_log").insert({
          user_id: run.patient_user_id,
          trigger: "apex_orchestrator_approved",
          data: new Date().toISOString().slice(0, 10),
          alteracoes: { status: "sugestao_para_revisao_profissional", flags: nutriplan },
        });
      }

      if (run.patient_user_id) {
        const notifications = messages.map((message) => ({
          recipient_user_id: run.patient_user_id,
          sender_user_id: user.id,
          notification_type: `apex_${message.type || "update"}`,
          title: String(message.title || "APEX atualizado"),
          message: String(message.body || "Seu plano foi revisado pelo coach."),
          action_url: message.type === "novo_treino" ? "/training" : "/physique-card",
          reference_id: protocol.id,
        }));
        notifications.push({
          recipient_user_id: run.patient_user_id,
          sender_user_id: user.id,
          notification_type: "training_plan",
          title: "Novo treino aprovado pelo coach",
          message: `${report.athlete_name || "Seu plano"} · ${plano.divisao?.nome || "STRATUM"}`,
          action_url: "/training",
          reference_id: protocol.id,
        });
        const { error: notificationError } = await supabase.from("coach_notifications").insert(notifications);
        if (notificationError) throw notificationError;

        const achievements = asArray(gamification.achievements_novos);
        if (achievements.length) {
          const ids = achievements.map((a) => String(a.id));
          const { data: existing } = await supabase.from("apex_achievements").select("achievement_id").eq("user_id", run.patient_user_id).in("achievement_id", ids);
          const known = new Set((existing || []).map((row) => row.achievement_id));
          const fresh = achievements.filter((a) => !known.has(String(a.id)));
          if (fresh.length) await supabase.from("apex_achievements").insert(fresh.map((a) => ({ user_id: run.patient_user_id, achievement_id: String(a.id), metadata: a.metadata || {} })));
        }
        const promotion = asObject(gamification.promocao);
        if (promotion.para?.key) {
          await supabase.from("apex_rank_history").insert({
            user_id: run.patient_user_id,
            rank_key: promotion.para.key,
            previous_rank_key: promotion.de?.key || null,
            apex_score: evolution.score_atual ?? null,
            previous_apex_score: evolution.score_anterior ?? null,
            direction: "promotion",
            assessment_date: new Date().toISOString().slice(0, 10),
          });
        }
      }

      const publishedAt = new Date().toISOString();
      const publishedLog = [...logs, { etapa: "Aprovação e publicação", status: "complete", timestamp: publishedAt, output: { training_protocol_id: protocol.id } }];
      const { error: runError } = await supabase.from("apex_orchestrator_runs").update({
        status: "published",
        approved_at: publishedAt,
        approved_by: user.id,
        published_at: publishedAt,
        published_reference: { training_protocol_id: protocol.id, coach_override: Boolean(report.edited_manually || editing) },
        execution_log: publishedLog,
      }).eq("id", run.id);
      if (runError) throw runError;
      setRun({ ...run, status: "published", approved_at: publishedAt, published_at: publishedAt, execution_log: publishedLog });
      toast({ title: "Treino aprovado e publicado", description: "O aluno recebeu as mensagens preparadas pelo PRAXIS." });
    } catch (error) {
      toast({ title: "Publicação interrompida", description: error instanceof Error ? error.message : "Revise os dados e tente novamente.", variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!run) return <div className="min-h-screen bg-background p-6 text-foreground">Relatório indisponível.</div>;

  return (
    <div className="min-h-screen bg-background text-foreground print:bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/coach/hub")} aria-label="Voltar"><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <p className="font-mono text-xs uppercase text-primary">APEX Assessment · sincronização completa</p>
              <h1 className="font-display text-2xl font-bold uppercase">{report.athlete_name || "Atleta"}</h1>
            </div>
          </div>
          <Badge variant={run.status === "published" ? "default" : "outline"}>{statusLabel}</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        {run.checklist_mode === "skipped" && (
          <Alert><ShieldAlert className="h-4 w-4" /><AlertDescription>Avaliação parcial — checklist pendente. O treino foi gerado apenas com dados visuais e deve ser recalculado depois.</AlertDescription></Alert>
        )}
        {diagnostico.encaminhamentos?.length > 0 && (
          <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertDescription>Há encaminhamento profissional pendente. Os grupos sinalizados não devem receber progressão sem liberação do coach.</AlertDescription></Alert>
        )}

        <section className="grid gap-3 md:grid-cols-4">
          <Metric label="APEX Score" value={evolution.score_atual ?? "—"} detail={typeof evolution.delta_score === "number" ? `${evolution.delta_score >= 0 ? "+" : ""}${evolution.delta_score} vs anterior` : "Sem comparação anterior"} />
          <Metric label="Rank atual" value={rankCurrent.nome || "—"} detail={rankPrevious.nome && rankPrevious.nome !== rankCurrent.nome ? `${rankPrevious.nome} → ${rankCurrent.nome}` : "Rank mantido"} />
          <Metric label="Prioridades" value={String(asArray(diagnostico.prioridades).slice(0, 3).length)} detail="Máximo de 3 por ciclo" />
          <Metric label="Divisão STRATUM" value={plano.divisao?.nome || "—"} detail={`${plano.volume_total_semana ?? "—"} séries semanais`} />
        </section>

        <section>
          <SectionTitle title="Mapa de deficits" subtitle="Visual × funcional × fase recomendada" />
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-muted/30 font-mono text-xs uppercase text-muted-foreground"><tr><th className="p-3">Grupo</th><th className="p-3">Visual</th><th className="p-3">Deficit</th><th className="p-3">Severidade</th><th className="p-3">Protocolo</th></tr></thead>
              <tbody>{grupos.map((g) => <tr key={g.grupo_key} className="border-b border-border/70"><td className="p-3 font-medium">{g.grupo}</td><td className="p-3">{g.apex_visual_score ?? "—"}</td><td className="p-3">{g.deficits?.map((d: JsonObject) => d.tipo).join(" · ") || "Adequado"}</td><td className="p-3">{g.deficits?.[0]?.severidade || "—"}</td><td className="p-3">{g.fase_recomendada}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3"><SectionTitle title="KINESIS + STRATUM" subtitle="Override do coach prevalece" /><Button variant="outline" onClick={() => setEditing((v) => !v)}><Pencil className="mr-2 h-4 w-4" />{editing ? "Fechar edição" : "Editar prescrição"}</Button></div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {protocols.map((item, index) => <div key={`${item.grupo}-${index}`} className="border border-border p-4"><div className="mb-3 flex items-center justify-between gap-2"><strong>{item.grupo}</strong><Badge variant="outline">{item.fase}</Badge></div>{editing ? <div className="space-y-2"><Input value={item.exercicio || ""} onChange={(e) => setProtocols((p) => p.map((x, i) => i === index ? { ...x, exercicio: e.target.value } : x))} /><Textarea value={item.prescricao || ""} onChange={(e) => setProtocols((p) => p.map((x, i) => i === index ? { ...x, prescricao: e.target.value } : x))} /><Input value={item.cue || ""} onChange={(e) => setProtocols((p) => p.map((x, i) => i === index ? { ...x, cue: e.target.value } : x))} /></div> : <><p className="font-medium text-primary">{item.exercicio}</p><p className="mt-1 text-sm text-muted-foreground">{item.prescricao}</p><p className="mt-2 text-sm">Cue: {item.cue}</p></>}</div>)}
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3">{volumes.map((item, index) => <div key={`${item.grupo}-${index}`} className="flex items-center justify-between border border-border p-3 text-sm"><span>{item.grupo}</span>{editing ? <Input className="w-24" type="number" min={0} max={25} value={item.series_semana ?? 0} onChange={(e) => setVolumes((p) => p.map((x, i) => i === index ? { ...x, series_semana: Number(e.target.value) } : x))} /> : <strong>{item.series_semana} séries</strong>}</div>)}</div>
          {editing && <div className="mt-3 space-y-2"><Textarea placeholder="Justificativa do override do coach" value={overrideNote} onChange={(e) => setOverrideNote(e.target.value)} /><Button onClick={saveOverrides} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Salvar override</Button></div>}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div><SectionTitle title="Ajustes NutriPlan" subtitle="Sugestões para revisão profissional" /><ul className="mt-3 space-y-2">{nutriplan.length ? nutriplan.map((n, i) => <li key={i} className="border-l-2 border-primary pl-3 text-sm"><strong>{n.grupo}</strong> · {n.note}</li>) : <li className="text-sm text-muted-foreground">Sem flags nutricionais registradas.</li>}</ul></div>
          <div><SectionTitle title="Gamificação" subtitle="Atualização baseada na avaliação salva" /><div className="mt-3 space-y-2 text-sm"><p>Rank: <strong>{rankPrevious.nome || "—"} → {rankCurrent.nome || "—"}</strong></p><p>Novas conquistas: <strong>{asArray(gamification.achievements_novos).map((a) => a.titulo).join(", ") || "nenhuma"}</strong></p><p>Physique Card: <strong>{gamification.physique_card?.status === "ready" ? "pronto" : "dados insuficientes"}</strong></p></div></div>
        </section>

        <section><SectionTitle title="Como o sistema chegou nesta prescrição" subtitle="Log completo da execução" /><div className="mt-3 space-y-2">{logs.map((entry, i) => <div key={i} className="flex gap-3 border-b border-border py-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="font-medium">{entry.etapa}</p><p className="text-sm text-muted-foreground">{entry.status} · {entry.note || String(entry.output || "etapa registrada")}</p></div></div>)}</div></section>

        <section className="flex flex-wrap gap-3 border-t border-border pt-6 print:hidden">
          <Button onClick={approveAndPublish} disabled={publishing || run.status === "published"}><ClipboardCheck className="mr-2 h-4 w-4" />{publishing ? "Publicando…" : run.status === "published" ? "Treino publicado" : "Aprovar e publicar treino"}</Button>
          <Button variant="outline" onClick={() => window.print()}><Download className="mr-2 h-4 w-4" />PDF</Button>
          {run.checklist_mode === "skipped" && <Button variant="outline" onClick={() => navigate(`/coach/apex-assessment?run=${run.id}`)}>Completar checklist</Button>}
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <div className="border border-border p-4"><p className="font-mono text-xs uppercase text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div><p className="font-mono text-xs uppercase text-primary">{subtitle}</p><h2 className="font-display text-xl font-bold uppercase">{title}</h2></div>;
}