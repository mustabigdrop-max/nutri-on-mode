import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  BellRing, Download, FileText, Loader2, MessageCircle, Send, Settings2,
} from "lucide-react";
import { openWhatsApp } from "@/lib/gymBusiness";
import { challengeDay } from "@/lib/challenge";
import {
  DEFAULT_CHECKIN_TEMPLATE, DEFAULT_MEALS_TEMPLATE, computeReminderQueue,
  reminderDue, type ChallengeReminderConfig, type ReminderTarget,
} from "@/lib/challengeReminders";
import {
  exportChallengeCSV, exportChallengePDF, reportMetrics, type ChallengeReportRow,
} from "@/lib/challengeReport";

interface Props {
  challenge: {
    id: string; name: string; slug: string | null; start_date: string; end_date: string;
    reminders_enabled?: boolean; reminder_checkin_time?: string; reminder_meal_times?: string[];
    reminder_checkin_message?: string | null; reminder_meal_message?: string | null;
  };
  gymName?: string | null;
  onChanged?: () => void;
}

const localISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export default function ChallengeOpsPanel({ challenge, gymName, onChanged }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [queue, setQueue] = useState<ReminderTarget[] | null>(null);
  const [rows, setRows] = useState<ChallengeReportRow[]>([]);
  const [cfg, setCfg] = useState<ChallengeReminderConfig>({
    reminders_enabled: challenge.reminders_enabled ?? true,
    reminder_checkin_time: (challenge.reminder_checkin_time ?? "19:00").slice(0, 5),
    reminder_meal_times: challenge.reminder_meal_times ?? ["12:30", "20:30"],
    reminder_checkin_message: challenge.reminder_checkin_message ?? null,
    reminder_meal_message: challenge.reminder_meal_message ?? null,
  });

  const day = challengeDay(challenge.start_date);
  const link = `https://nutrion.app.br/desafio/dashboard`;

  const load = useCallback(async () => {
    setBusy(true);
    const { data: parts } = await supabase
      .from("challenge_participants")
      .select("id,user_id,full_name,email,whatsapp,tier,mce_score,streak,meals_per_day,weight_start,weight_current,migrated_to_client")
      .eq("challenge_id", challenge.id)
      .eq("status", "active");

    const list = parts ?? [];
    const userIds = list.map((p) => p.user_id).filter(Boolean);

    const { data: logs } = userIds.length
      ? await supabase
          .from("challenge_daily_logs")
          .select("user_id,log_date,day_completed,meals_done")
          .eq("challenge_id", challenge.id)
      : { data: [] as any[] };

    const all = logs ?? [];
    const todayISO = localISO();

    setQueue(
      computeReminderQueue(
        list.map((p) => ({
          id: p.id, user_id: p.user_id, full_name: p.full_name,
          whatsapp: p.whatsapp, streak: p.streak ?? 0, meals_per_day: p.meals_per_day ?? 5,
        })),
        all.filter((l) => l.log_date === todayISO),
        { challengeName: challenge.name, day, link, config: cfg },
      ),
    );

    const { data: photos } = userIds.length
      ? await supabase.from("progress_photos").select("user_id").in("user_id", userIds)
      : { data: [] as any[] };

    setRows(
      list.map((p) => {
        const mine = all.filter((l) => l.user_id === p.user_id);
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
          days_completed: mine.filter((l) => l.day_completed).length,
          photos: (photos ?? []).filter((f: any) => f.user_id === p.user_id).length,
          migrated_to_client: !!p.migrated_to_client,
        } as ChallengeReportRow;
      }),
    );
    setBusy(false);
  }, [challenge.id, challenge.name, day, link, cfg]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const metrics = useMemo(() => reportMetrics(rows), [rows]);
  const due = reminderDue(cfg.reminder_checkin_time);

  const saveConfig = async () => {
    const { error } = await supabase
      .from("gym_challenges")
      .update({
        reminders_enabled: cfg.reminders_enabled,
        reminder_checkin_time: cfg.reminder_checkin_time,
        reminder_meal_times: cfg.reminder_meal_times,
        reminder_checkin_message: cfg.reminder_checkin_message,
        reminder_meal_message: cfg.reminder_meal_message,
      })
      .eq("id", challenge.id);
    if (error) return toast.error("Não foi possível salvar os lembretes.");
    toast.success("Lembretes atualizados.");
    onChanged?.();
    load();
  };

  const logSent = async (t: ReminderTarget) => {
    await supabase.from("challenge_reminder_logs").insert({
      challenge_id: challenge.id,
      participant_id: t.participant_id,
      kind: t.kind,
      message: t.message,
      sent_by: user?.id ?? null,
    });
  };

  const sendOne = async (t: ReminderTarget) => {
    if (!t.whatsapp) return toast.error(`${t.full_name} não tem WhatsApp cadastrado.`);
    setSendingId(t.participant_id);
    openWhatsApp(t.whatsapp, t.message);
    await logSent(t);
    setSendingId(null);
  };

  const sendAll = async () => {
    const targets = (queue ?? []).filter((t) => t.whatsapp);
    if (!targets.length) return toast.error("Ninguém pendente com WhatsApp cadastrado.");
    setBusy(true);
    for (const t of targets) {
      openWhatsApp(t.whatsapp!, t.message);
      await logSent(t);
      await new Promise((r) => setTimeout(r, 800));
    }
    setBusy(false);
    toast.success(`${targets.length} lembrete(s) disparado(s).`);
  };

  const meta = {
    challengeName: challenge.name,
    gymName,
    startDate: new Date(`${challenge.start_date}T12:00:00`).toLocaleDateString("pt-BR"),
    endDate: new Date(`${challenge.end_date}T12:00:00`).toLocaleDateString("pt-BR"),
    day,
    totalDays: 90,
  };

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
            <Button size="sm" variant="outline" onClick={saveConfig}>Salvar lembretes</Button>
          </div>

          {/* Fila do dia */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Pendentes hoje ({queue?.length ?? 0}) {due ? "· janela aberta" : `· dispara às ${cfg.reminder_checkin_time}`}
              </p>
              <Button size="sm" className="h-7 gap-1 text-[11px]" disabled={busy || !cfg.reminders_enabled} onClick={sendAll}>
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

          {/* Relatório */}
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Relatório do coach</p>
            <p className="text-xs text-muted-foreground">
              {metrics.total} participantes · conversão FREE→pago {metrics.conversion}% · MCE médio {metrics.avgScore} ·
              streak médio {metrics.avgStreak}d · variação média {metrics.avgDelta.toFixed(1)} kg
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1 text-[11px]"
                onClick={() => exportChallengePDF(meta, rows)} disabled={!rows.length}>
                <FileText className="w-3.5 h-3.5" /> PDF
              </Button>
              <Button size="sm" variant="outline" className="gap-1 text-[11px]"
                onClick={() => exportChallengeCSV(meta, rows)} disabled={!rows.length}>
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
