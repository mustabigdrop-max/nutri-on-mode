import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellRing, MessageCircle, Clock, BellOff, Loader2, CalendarClock } from "lucide-react";
import {
  Gym, GymInteractionLite, FollowUp, computeFollowUps, buildWhatsAppMessage,
  gymPhone, openWhatsApp, statusMeta, nextFollowUpDate, followUpWhen,
} from "@/lib/gymBusiness";

const SELECT_COLS =
  "id, name, city, neighborhood, address, owner_name, owner_phone, contact_name, contact_phone, instagram, estimated_members, gym_type, status, commission_percent, notes, challenge_slug, active, contacted_at, visited_at, closed_at, next_followup_at, followup_paused, created_at";

const DAY = 86_400_000;

export default function FollowUpPanel({
  reloadKey = 0,
  onChanged,
}: { reloadKey?: number; onChanged?: () => void }) {
  const { user } = useAuth();
  const [gyms, setGyms] = useState<Gym[] | null>(null);
  const [interactions, setInteractions] = useState<GymInteractionLite[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    const [g, i] = await Promise.all([
      supabase.from("partner_gyms").select(SELECT_COLS),
      supabase.from("gym_interactions").select("gym_id, type, description, created_at"),
    ]);
    setGyms((g.data as unknown as Gym[]) ?? []);
    setInteractions((i.data as GymInteractionLite[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load, reloadKey]);

  const followUps = useMemo(
    () => computeFollowUps(gyms ?? [], interactions),
    [gyms, interactions],
  );
  const due = followUps.filter((f) => f.due);
  const upcoming = followUps.filter((f) => !f.due).slice(0, showAll ? 50 : 3);
  const paused = (gyms ?? []).filter((g) => g.followup_paused);

  const patch = async (gym: Gym, values: Partial<Gym>) => {
    setGyms((prev) => prev?.map((g) => (g.id === gym.id ? { ...g, ...values } : g)) ?? prev);
    const { error } = await supabase.from("partner_gyms").update(values).eq("id", gym.id);
    if (error) { toast.error("Não foi possível atualizar o lembrete."); load(); }
    onChanged?.();
  };

  const send = async (f: FollowUp) => {
    const phone = gymPhone(f.gym);
    if (!phone) return toast.error("Cadastre um telefone para essa academia.");
    setBusy(f.gym.id);
    const { tpl, text } = buildWhatsAppMessage(f.gym);
    openWhatsApp(phone, text);
    if (user) {
      await supabase.from("gym_interactions").insert({
        gym_id: f.gym.id, coach_user_id: user.id, type: "whatsapp",
        description: `Follow-up automático — ${tpl.label}`,
      });
    }
    const next = nextFollowUpDate(f.gym.status).toISOString();
    const values: Partial<Gym> = { next_followup_at: next };
    if (f.gym.status === "nao_contactada") {
      values.status = "prospectada";
      values.contacted_at = f.gym.contacted_at ?? new Date().toISOString();
      values.next_followup_at = nextFollowUpDate("prospectada").toISOString();
    }
    await patch(f.gym, values);
    setBusy(null);
    toast.success(`WhatsApp aberto · próximo lembrete ${followUpWhen(new Date(values.next_followup_at!))}`);
    load();
  };

  const snooze = (f: FollowUp, days: number) =>
    patch(f.gym, { next_followup_at: new Date(Date.now() + days * DAY).toISOString() })
      .then(() => toast.success(`Lembrete adiado ${days} dia(s).`));

  if (!gyms) {
    return (
      <Card><CardContent className="p-6 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </CardContent></Card>
    );
  }

  const Item = ({ f }: { f: FollowUp }) => {
    const meta = statusMeta(f.gym.status);
    return (
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {meta.dot} {f.gym.name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {f.rule.label} · {f.rule.reason}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {f.lastTouchAt
                ? `Último contato ${f.lastTouchAt.toLocaleDateString("pt-BR")}`
                : "Nenhuma interação registrada"}
              {" · "}
              {followUpWhen(f.dueAt)}
            </p>
          </div>
          <span
            className="text-[10px] px-2 py-1 rounded-full border shrink-0"
            style={{
              borderColor: f.due ? `${meta.color}66` : "hsl(var(--border))",
              color: f.due ? meta.color : "hsl(var(--muted-foreground))",
            }}
          >
            {f.due ? (f.daysLate > 0 ? `${f.daysLate}d atrasado` : "hoje") : f.dueAt.toLocaleDateString("pt-BR")}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="gap-1" disabled={busy === f.gym.id} onClick={() => send(f)}>
            {busy === f.gym.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
            Enviar {f.tpl.label.replace(/^\S+\s/, "")}
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => snooze(f, 1)}>
            <Clock className="w-3.5 h-3.5" /> +1d
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => snooze(f, 3)}>
            <Clock className="w-3.5 h-3.5" /> +3d
          </Button>
          <Button size="sm" variant="ghost" className="gap-1 text-muted-foreground"
            onClick={() => patch(f.gym, { followup_paused: true }).then(() => toast.success("Lembretes pausados."))}>
            <BellOff className="w-3.5 h-3.5" /> Pausar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <BellRing className="w-3.5 h-3.5 text-primary" />
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Follow-ups automáticos
        </p>
        {due.length > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
            {due.length} pendente{due.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {due.length === 0 && (
            <p className="px-4 py-5 text-sm text-muted-foreground text-center">
              Nenhum follow-up vencido. A cadência dispara sozinha conforme o status e a última interação.
            </p>
          )}
          {due.map((f) => <Item key={f.gym.id} f={f} />)}
        </CardContent>
      </Card>

      {upcoming.length > 0 && (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            <div className="px-4 py-2 flex items-center gap-2">
              <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Agendados</p>
              <button className="ml-auto text-[11px] text-primary" onClick={() => setShowAll((v) => !v)}>
                {showAll ? "ver menos" : "ver todos"}
              </button>
            </div>
            {upcoming.map((f) => (
              <div key={f.gym.id} className="px-4 py-2.5 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{statusMeta(f.gym.status).dot} {f.gym.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {f.rule.label} · {followUpWhen(f.dueAt)} ({f.dueAt.toLocaleDateString("pt-BR")})
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => send(f)}>Antecipar</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {paused.length > 0 && (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {paused.map((g) => (
              <div key={g.id} className="px-4 py-2.5 flex items-center gap-3">
                <p className="text-sm truncate flex-1 text-muted-foreground">
                  {g.name} · lembretes pausados
                </p>
                <Button size="sm" variant="outline" className="gap-1"
                  onClick={() => patch(g, { followup_paused: false, next_followup_at: new Date().toISOString() })}>
                  <BellRing className="w-3.5 h-3.5" /> Retomar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
