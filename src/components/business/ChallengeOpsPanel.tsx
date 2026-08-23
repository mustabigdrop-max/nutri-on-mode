import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlarmClock, BellRing, Download, FileText, History, Loader2, MessageCircle, Send, Settings2,
} from "lucide-react";
import { openWhatsApp } from "@/lib/gymBusiness";
import { CHALLENGE_DAYS, TRIAL_DAYS, challengeDay, vipCheckpointForDay } from "@/lib/challenge";
import {
  DEFAULT_CHECKIN_TEMPLATE, DEFAULT_ESCALATION_HOURS, DEFAULT_ESCALATION_TEMPLATES,
  DEFAULT_MEALS_TEMPLATE, computeEscalationQueue, computeMilestoneQueue, computeReminderQueue,
  dueEscalationLevel, milestoneForDay, nextMilestone,
  reminderDue, type ChallengeEscalationConfig, type ChallengeReminderConfig,
  type EscalatedTarget, type ReminderTarget,
} from "@/lib/challengeReminders";

import {
  exportChallengeCSV, exportChallengePDF, reportMetrics, type ChallengeReportRow,
} from "@/lib/challengeReport";
import {
  PERIOD_PRESETS, buildPeriod, inRange, previousPeriod, todayISO,
  type PeriodPresetId, type PeriodRange,
} from "@/lib/challengeAdherence";

interface Props {
  challenge: {
    id: string; name: string; slug: string | null; start_date: string; end_date: string;
    reminders_enabled?: boolean; reminder_checkin_time?: string; reminder_meal_times?: string[];
    reminder_checkin_message?: string | null; reminder_meal_message?: string | null;
    reminder_deadline_time?: string; reminder_escalation_hours?: number[];
    reminder_escalation_messages?: string[];
  };
  gymName?: string | null;
  onChanged?: () => void;
}

type LogLite = { user_id: string; log_date: string; day_completed: boolean | null; meals_done: number[] | null; points: number | null; checkin_at: string | null };

export default function ChallengeOpsPanel({ challenge, gymName, onChanged }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [queue, setQueue] = useState<ReminderTarget[] | null>(null);
  const [escalated, setEscalated] = useState<EscalatedTarget[]>([]);
  const [history, setHistory] = useState<{ id: string; kind: string; level: number; sent_at: string; auto: boolean; participant_id: string }[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [logs, setLogs] = useState<LogLite[]>([]);
  const [photos, setPhotos] = useState<{ user_id: string }[]>([]);
  const [preset, setPreset] = useState<PeriodPresetId>("all");
  const [custom, setCustom] = useState({ start: todayISO(), end: todayISO() });
  const [compare, setCompare] = useState(true);

  const [cfg, setCfg] = useState<ChallengeReminderConfig & ChallengeEscalationConfig>({
    reminders_enabled: challenge.reminders_enabled ?? true,
    reminder_checkin_time: (challenge.reminder_checkin_time ?? "19:00").slice(0, 5),
    reminder_meal_times: challenge.reminder_meal_times ?? ["12:30", "20:30"],
    reminder_checkin_message: challenge.reminder_checkin_message ?? null,
    reminder_meal_message: challenge.reminder_meal_message ?? null,
    reminder_deadline_time: (challenge.reminder_deadline_time ?? "21:00").slice(0, 5),
    reminder_escalation_hours: challenge.reminder_escalation_hours?.length
      ? challenge.reminder_escalation_hours
      : DEFAULT_ESCALATION_HOURS,
    reminder_escalation_messages: challenge.reminder_escalation_messages ?? [],
  });

  const day = challengeDay(challenge.start_date);
  const link = `https://nutrion.app.br/desafio/dashboard`;

  const load = useCallback(async () => {
    setBusy(true);
    const todayIso = todayISO();
    const { data: parts } = await supabase
      .from("challenge_participants")
      .select("id,user_id,full_name,email,whatsapp,tier,mce_score,streak,meals_per_day,weight_start,weight_current,migrated_to_client")
      .eq("challenge_id", challenge.id)
      .eq("status", "active");

    const list = parts ?? [];
    const userIds = list.map((p: any) => p.user_id).filter(Boolean);

    const [{ data: dl }, { data: hist }, { data: ph }] = await Promise.all([
      supabase
        .from("challenge_daily_logs")
        .select("user_id,log_date,day_completed,meals_done,points,checkin_at")
        .eq("challenge_id", challenge.id),
      supabase
        .from("challenge_reminder_logs")
        .select("id,kind,level,sent_at,auto,participant_id")
        .eq("challenge_id", challenge.id)
        .order("sent_at", { ascending: false })
        .limit(60),
      userIds.length
        ? supabase.from("progress_photos").select("user_id").in("user_id", userIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const all = (dl ?? []) as LogLite[];
    const histRows = (hist ?? []) as any[];
    setParticipants(list);
    setLogs(all);
    setHistory(histRows);
    setPhotos((ph ?? []) as { user_id: string }[]);

    const lite = list.map((p: any) => ({
      id: p.id, user_id: p.user_id, full_name: p.full_name,
      whatsapp: p.whatsapp, streak: p.streak ?? 0, meals_per_day: p.meals_per_day ?? 5,
    }));
    const todayLogs = all.filter((l) => l.log_date === todayIso);

    setQueue(
      computeReminderQueue(lite, todayLogs, { challengeName: challenge.name, day, link, config: cfg }),
    );

    const sentLevels: Record<string, number> = {};
    histRows
      .filter((h) => (h.sent_at ?? "").slice(0, 10) === todayIso && h.kind === "checkin")
      .forEach((h) => {
        sentLevels[h.participant_id] = Math.max(sentLevels[h.participant_id] ?? 0, h.level ?? 1);
      });

    setEscalated(
      computeEscalationQueue(lite, todayLogs, sentLevels, {
        challengeName: challenge.name, day, link, config: cfg,
      }),
    );
    setBusy(false);
  }, [challenge.id, challenge.name, day, link, cfg]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const range: PeriodRange = useMemo(
    () => buildPeriod(preset, challenge, custom),
    [preset, challenge, custom],
  );
  const prevRange = useMemo(() => previousPeriod(range), [range]);

  const buildRows = useCallback(
    (r: PeriodRange): ChallengeReportRow[] => {
      const days = Math.max(1, Math.round((+new Date(`${r.end}T12:00:00`) - +new Date(`${r.start}T12:00:00`)) / 86400000) + 1);
      return participants.map((p: any) => {
        const mine = logs.filter((l) => l.user_id === p.user_id && inRange(l.log_date, r));
        const completed = mine.filter((l) => l.day_completed).length;
        return {
          full_name: p.full_name,
          email: p.email,
          whatsapp: p.whatsapp,
          tier: p.tier ?? "free",
          mce_score: p.mce_score ?? 0,
          streak: p.streak ?? 0,
          weight_start: p.weight_start,
          weight_current: p.weight_current,
          days_logged: mine.length,
          days_completed: completed,
          checkin_rate: Math.round((mine.length / days) * 100),
          completion_rate: Math.round((completed / days) * 100),
          photos: photos.filter((f) => f.user_id === p.user_id).length,
          migrated_to_client: !!p.migrated_to_client,
        };
      });
    },
    [participants, logs, photos],
  );

  const rows = useMemo(() => buildRows(range), [buildRows, range]);
  const prevRows = useMemo(() => buildRows(prevRange), [buildRows, prevRange]);
  const metrics = useMemo(() => reportMetrics(rows), [rows]);
  const prevMetrics = useMemo(() => reportMetrics(prevRows), [prevRows]);
  const due = reminderDue(cfg.reminder_checkin_time);
  const level = dueEscalationLevel(cfg);

  const milestone = milestoneForDay(day);
  const upcoming = nextMilestone(day);
  const milestoneQueue = useMemo(
    () =>
      computeMilestoneQueue(
        participants.map((p: any) => ({
          id: p.id, user_id: p.user_id, full_name: p.full_name,
          whatsapp: p.whatsapp, streak: p.streak ?? 0, meals_per_day: p.meals_per_day ?? 5,
        })),
        {
          challengeName: challenge.name,
          day,
          link,
          linkPlanos: "https://nutrion.app.br/desafio/planos",
        },
      ),
    [participants, challenge.name, day, link],
  );

  const vipCheckpoint = vipCheckpointForDay(day);
  const vipTargets = useMemo(
    () => participants.filter((p: any) => p.tier === "vip"),
    [participants],
  );




  const saveConfig = async () => {
    const { error } = await supabase
      .from("gym_challenges")
      .update({
        reminders_enabled: cfg.reminders_enabled,
        reminder_checkin_time: cfg.reminder_checkin_time,
        reminder_meal_times: cfg.reminder_meal_times,
        reminder_checkin_message: cfg.reminder_checkin_message,
        reminder_meal_message: cfg.reminder_meal_message,
        reminder_deadline_time: cfg.reminder_deadline_time,
        reminder_escalation_hours: cfg.reminder_escalation_hours,
        reminder_escalation_messages: cfg.reminder_escalation_messages,
      })
      .eq("id", challenge.id);
    if (error) return toast.error("Não foi possível salvar os lembretes.");
    toast.success("Lembretes atualizados.");
    onChanged?.();
    load();
  };

  const logSent = async (t: ReminderTarget, lvl = 1, auto = false) => {
    await supabase.from("challenge_reminder_logs").insert({
      challenge_id: challenge.id,
      participant_id: t.participant_id,
      kind: t.kind,
      level: lvl,
      log_date: todayISO(),
      auto,
      message: t.message,
      sent_by: user?.id ?? null,
    });
  };

  const sendOne = async (t: ReminderTarget, lvl = 1) => {
    if (!t.whatsapp) return toast.error(`${t.full_name} não tem WhatsApp cadastrado.`);
    setSendingId(t.participant_id);
    openWhatsApp(t.whatsapp, t.message);
    await logSent(t, lvl);
    setSendingId(null);
    load();
  };

  const sendBatch = async (targets: ReminderTarget[], lvl?: number) => {
    const list = targets.filter((t) => t.whatsapp);
    if (!list.length) return toast.error("Ninguém pendente com WhatsApp cadastrado.");
    setBusy(true);
    for (const t of list) {
      openWhatsApp(t.whatsapp!, t.message);
      await logSent(t, lvl ?? (t as EscalatedTarget).level ?? 1, true);
      await new Promise((r) => setTimeout(r, 800));
    }
    setBusy(false);
    toast.success(`${list.length} lembrete(s) disparado(s).`);
    load();
  };

  const nameOf = (id: string) => participants.find((p: any) => p.id === id)?.full_name ?? "participante";

  const meta = {
    challengeName: challenge.name,
    gymName,
    startDate: new Date(`${challenge.start_date}T12:00:00`).toLocaleDateString("pt-BR"),
    endDate: new Date(`${challenge.end_date}T12:00:00`).toLocaleDateString("pt-BR"),
    day,
    totalDays: CHALLENGE_DAYS,
    periodLabel: range.label,
    periodStart: range.start,
    periodEnd: range.end,
  };

  const sig = (n: number) => `${n > 0 ? "+" : ""}${n}`;

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold"
      >
        <span className="flex items-center gap-1.5">
          <BellRing className="w-3.5 h-3.5 text-amber-500" /> Lembretes & relatório
        </span>
        <span className="text-muted-foreground">{open ? "fechar" : "abrir"}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-4">
          {/* Cadência de marcos */}
          <div className="space-y-2 rounded-md border border-amber-500/25 bg-amber-500/5 p-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <AlarmClock className="w-3.5 h-3.5 text-amber-500" /> Cadência · Dia {day}/{CHALLENGE_DAYS}
            </p>
            {milestone ? (
              <>
                <p className="text-xs font-semibold">{milestone.label}</p>
                <p className="text-[11px] text-muted-foreground">{milestone.goal}</p>
                <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded bg-background/60 p-2 text-[11px] text-muted-foreground">
                  {milestoneQueue[0]?.message ?? milestone.template}
                </pre>
                <Button
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                  disabled={busy || !milestoneQueue.length}
                  onClick={() => sendBatch(milestoneQueue, 1)}
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Disparar marco para {milestoneQueue.filter((t) => t.whatsapp).length} participante(s)
                </Button>
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Hoje não tem marco na cadência.{" "}
                {upcoming
                  ? `Próximo: ${upcoming.label} (em ${upcoming.day - day} dia(s)).`
                  : `Desafio encerrado — acesso completo dura ${TRIAL_DAYS} dias.`}
              </p>
            )}
          </div>

          {/* Checkpoints VIP — ajuste manual */}
          <div className="space-y-2 rounded-md border border-primary/25 bg-primary/5 p-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-500" /> VIP · ajuste manual ({vipTargets.length})
            </p>
            {vipCheckpoint ? (
              <>
                <p className="text-xs font-semibold">{vipCheckpoint.title}</p>
                <p className="text-[11px] text-muted-foreground">{vipCheckpoint.desc}</p>
                {vipTargets.length ? (
                  <div className="space-y-1.5">
                    {vipTargets.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between gap-2 rounded bg-background/60 px-2 py-1.5">
                        <span className="truncate text-[11px]">{p.full_name}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-[11px]"
                          disabled={!p.whatsapp}
                          onClick={() =>
                            openWhatsApp(
                              p.whatsapp,
                              vipCheckpoint.template.replace(/\{nome\}/g, (p.full_name ?? "").split(" ")[0] || "atleta"),
                            )
                          }
                        >
                          <MessageCircle className="w-3 h-3" /> Ajustar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">Nenhum VIP neste desafio ainda.</p>
                )}
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Sem checkpoint VIP hoje. Ajustes manuais nos dias 7, 14, 21 e 30.
              </p>
            )}
          </div>



          {/* Configuração */}

          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5" /> Configuração do coach
            </p>
            <div className="flex items-center justify-between text-xs">
              <span>Lembretes automáticos ativos</span>
              <Switch
                checked={cfg.reminders_enabled}
                onCheckedChange={(v) => setCfg({ ...cfg, reminders_enabled: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[11px] text-muted-foreground">
                Horário do check-in
                <Input
                  type="time"
                  value={cfg.reminder_checkin_time}
                  onChange={(e) => setCfg({ ...cfg, reminder_checkin_time: e.target.value })}
                />
              </label>
              <label className="text-[11px] text-muted-foreground">
                Horários das refeições
                <Input
                  value={cfg.reminder_meal_times.join(", ")}
                  onChange={(e) =>
                    setCfg({ ...cfg, reminder_meal_times: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                  }
                  placeholder="12:30, 20:30"
                />
              </label>
            </div>
            <Textarea
              rows={3}
              className="text-xs"
              value={cfg.reminder_checkin_message ?? ""}
              onChange={(e) => setCfg({ ...cfg, reminder_checkin_message: e.target.value || null })}
              placeholder={DEFAULT_CHECKIN_TEMPLATE}
            />
            <Textarea
              rows={3}
              className="text-xs"
              value={cfg.reminder_meal_message ?? ""}
              onChange={(e) => setCfg({ ...cfg, reminder_meal_message: e.target.value || null })}
              placeholder={DEFAULT_MEALS_TEMPLATE}
            />
            <p className="text-[10px] text-muted-foreground">
              Variáveis: {"{nome} {desafio} {dia} {link} {feitas} {total} {streak}"}
            </p>
          </div>

          {/* Escalonamento */}
          <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
            <p className="text-[11px] uppercase tracking-wide text-amber-500 flex items-center gap-1.5">
              <AlarmClock className="w-3.5 h-3.5" /> Follow-up escalonado
            </p>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[11px] text-muted-foreground">
                Horário limite do check-in
                <Input
                  type="time"
                  value={cfg.reminder_deadline_time}
                  onChange={(e) => setCfg({ ...cfg, reminder_deadline_time: e.target.value })}
                />
              </label>
              <label className="text-[11px] text-muted-foreground">
                Etapas (horas após o limite)
                <Input
                  value={cfg.reminder_escalation_hours.join(", ")}
                  onChange={(e) =>
                    setCfg({
                      ...cfg,
                      reminder_escalation_hours: e.target.value
                        .split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n)),
                    })
                  }
                  placeholder="0, 2, 14"
                />
              </label>
            </div>
            {cfg.reminder_escalation_hours.map((h, i) => (
              <Textarea
                key={i}
                rows={2}
                className="text-xs"
                value={cfg.reminder_escalation_messages[i] ?? ""}
                onChange={(e) => {
                  const next = [...cfg.reminder_escalation_messages];
                  while (next.length < cfg.reminder_escalation_hours.length) next.push("");
                  next[i] = e.target.value;
                  setCfg({ ...cfg, reminder_escalation_messages: next });
                }}
                placeholder={`Etapa ${i + 1} (+${h}h): ${DEFAULT_ESCALATION_TEMPLATES[Math.min(i, DEFAULT_ESCALATION_TEMPLATES.length - 1)].slice(0, 70)}...`}
              />
            ))}
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                {level ? `Etapa ${level} liberada agora` : `Aguardando o limite (${cfg.reminder_deadline_time})`} ·{" "}
                {escalated.length} pendente(s)
              </p>
              <Button size="sm" className="h-7 gap-1 text-[11px]"
                disabled={busy || !cfg.reminders_enabled || !escalated.length}
                onClick={() => sendBatch(escalated)}>
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Disparar etapa {level || ""}
              </Button>
            </div>
            {escalated.slice(0, 10).map((t) => (
              <div key={t.participant_id} className="flex items-center gap-2 text-xs">
                <span className="flex-1 truncate">{t.full_name}</span>
                <span className="text-[10px] text-muted-foreground">
                  etapa {t.level}{t.lastSentLevel ? ` · já recebeu ${t.lastSentLevel}` : ""}
                </span>
                <Button size="icon" variant="ghost" className="h-6 w-6"
                  disabled={sendingId === t.participant_id}
                  onClick={() => sendOne(t, t.level)}>
                  <MessageCircle className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={saveConfig}>Salvar lembretes</Button>
          </div>

          {/* Fila do dia */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Pendentes hoje ({queue?.length ?? 0}) {due ? "· janela aberta" : `· dispara às ${cfg.reminder_checkin_time}`}
              </p>
              <Button size="sm" className="h-7 gap-1 text-[11px]" disabled={busy || !cfg.reminders_enabled}
                onClick={() => sendBatch(queue ?? [], 1)}>
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Disparar todos
              </Button>
            </div>
            {queue === null && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            {queue?.length === 0 && (
              <p className="text-xs text-emerald-500">Todo mundo já fechou o dia. 🔥</p>
            )}
            {queue?.slice(0, 12).map((t) => (
              <div key={t.participant_id} className="flex items-center gap-2 text-xs">
                <span className="flex-1 truncate">{t.full_name}</span>
                <span className="text-muted-foreground">
                  {t.kind === "checkin" ? "sem check-in" : `${t.mealsDone}/${t.mealsTotal} refeições`}
                </span>
                <Button
                  size="icon" variant="ghost" className="h-6 w-6"
                  disabled={sendingId === t.participant_id}
                  onClick={() => sendOne(t)}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {/* Histórico de envios */}
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Histórico de envios
            </p>
            {history.length === 0 && <p className="text-xs text-muted-foreground">Nenhum lembrete enviado ainda.</p>}
            {history.slice(0, 10).map((h) => (
              <p key={h.id} className="text-[11px] text-muted-foreground">
                {new Date(h.sent_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} ·{" "}
                {nameOf(h.participant_id)} · {h.kind === "checkin" ? "check-in" : "refeições"} · etapa {h.level ?? 1}
                {h.auto ? " · automático" : ""}
              </p>
            ))}
          </div>

          {/* Relatório */}
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Relatório do coach</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Select value={preset} onValueChange={(v) => setPreset(v as PeriodPresetId)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Período" /></SelectTrigger>
                <SelectContent>
                  {PERIOD_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                  <SelectItem value="custom">Período personalizado</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between text-xs px-1">
                <span>Comparar com período anterior</span>
                <Switch checked={compare} onCheckedChange={setCompare} />
              </div>
            </div>
            {preset === "custom" && (
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" className="h-8 text-xs" value={custom.start}
                  onChange={(e) => setCustom({ ...custom, start: e.target.value })} />
                <Input type="date" className="h-8 text-xs" value={custom.end}
                  onChange={(e) => setCustom({ ...custom, end: e.target.value })} />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {metrics.total} participantes · check-in {metrics.avgCheckin}% · conclusão {metrics.avgCompletion}% ·
              conversão FREE→pago {metrics.conversion}% · MCE médio {metrics.avgScore}
            </p>
            {compare && (
              <p className="text-[11px] text-muted-foreground">
                vs. período anterior: check-in {sig(metrics.avgCheckin - prevMetrics.avgCheckin)} p.p. ·
                conclusão {sig(metrics.avgCompletion - prevMetrics.avgCompletion)} p.p. ·
                MCE {sig(metrics.avgScore - prevMetrics.avgScore)}
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1 text-[11px]"
                onClick={() => exportChallengePDF(meta, rows, compare ? prevRows : null)} disabled={!rows.length}>
                <FileText className="w-3.5 h-3.5" /> PDF
              </Button>
              <Button size="sm" variant="outline" className="gap-1 text-[11px]"
                onClick={() => exportChallengeCSV(meta, rows, compare ? prevRows : null)} disabled={!rows.length}>
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
