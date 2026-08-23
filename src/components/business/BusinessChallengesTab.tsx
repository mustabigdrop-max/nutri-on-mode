import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Trophy, BarChart3, MessageCircle, Trash2, Monitor, UserCheck, Flame } from "lucide-react";
import { brl, openWhatsApp, slugify } from "@/lib/gymBusiness";
import ChallengeOpsPanel from "@/components/business/ChallengeOpsPanel";

type Challenge = {
  id: string;
  gym_id: string | null;
  name: string;
  slug: string | null;
  start_date: string;
  end_date: string;
  status: string;
  commission_percent: number;
  qr_code_url: string | null;
  reminders_enabled?: boolean;
  reminder_checkin_time?: string;
  reminder_meal_times?: string[];
  reminder_checkin_message?: string | null;
  reminder_meal_message?: string | null;
};

type GymLite = { id: string; name: string; neighborhood: string | null; city: string | null; challenge_slug: string | null };
type Participant = {
  id: string; challenge_id: string; full_name: string; email: string | null; whatsapp: string | null;
  tier: string; mce_score: number; streak: number; status: string; migrated_to_client: boolean;
};
type Signup = { gym_slug: string | null; paid: boolean; plano: string | null; full_name: string | null; email: string; created_at: string };

const addDays = (d: string, n: number) => {
  const date = new Date(`${d}T12:00:00`);
  date.setDate(date.getDate() + n);
  return date.toISOString().slice(0, 10);
};
const today = () => new Date().toISOString().slice(0, 10);

export default function BusinessChallengesTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[] | null>(null);
  const [gyms, setGyms] = useState<GymLite[]>([]);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ gym_id: "", name: "", start_date: today(), end_date: addDays(today(), 30), commission: 25 });

  const load = useCallback(async () => {
    const [c, g, s, pt] = await Promise.all([
      supabase.from("gym_challenges").select("id, gym_id, name, slug, start_date, end_date, status, commission_percent, qr_code_url, reminders_enabled, reminder_checkin_time, reminder_meal_times, reminder_checkin_message, reminder_meal_message").order("start_date", { ascending: false }),
      supabase.from("partner_gyms").select("id, name, neighborhood, city, challenge_slug"),
      supabase.from("challenge_signups").select("gym_slug, paid, plano, full_name, email, created_at").order("created_at", { ascending: false }),
      supabase.from("challenge_participants")
        .select("id, challenge_id, full_name, email, whatsapp, tier, mce_score, streak, status, migrated_to_client")
        .order("mce_score", { ascending: false }),
    ]);
    setChallenges((c.data as Challenge[]) ?? []);
    setGyms((g.data as unknown as GymLite[]) ?? []);
    setSignups((s.data as Signup[]) ?? []);
    setParticipants((pt.data as unknown as Participant[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const gymById = useMemo(() => new Map(gyms.map((g) => [g.id, g])), [gyms]);

  const create = async () => {
    if (!user) return;
    if (!form.name.trim()) return toast.error("Dê um nome ao desafio.");
    const gym = form.gym_id ? gymById.get(form.gym_id) : null;
    const slug = slugify(`${gym?.name ?? form.name}-${gym?.neighborhood ?? gym?.city ?? ""}`) || slugify(form.name);
    setSaving(true);
    const { error } = await supabase.from("gym_challenges").insert({
      coach_user_id: user.id,
      gym_id: form.gym_id || null,
      name: form.name.trim(),
      slug,
      start_date: form.start_date,
      end_date: form.end_date,
      commission_percent: form.commission,
      status: form.start_date <= today() ? "active" : "upcoming",
      qr_code_url: `https://nutrion.app.br/desafio/${slug}`,
    });
    if (!error && form.gym_id) {
      await supabase.from("partner_gyms").update({ challenge_slug: slug, active: true }).eq("id", form.gym_id);
    }
    setSaving(false);
    if (error) return toast.error("Erro ao criar desafio (slug já usado?).");
    toast.success("Desafio criado e QR Code gerado.");
    setShowForm(false);
    setForm({ gym_id: "", name: "", start_date: today(), end_date: addDays(today(), 30), commission: 25 });
    load();
  };

  const migrateToClient = async (p: Participant) => {
    const { error } = await supabase.functions.invoke("challenge-migrate-participant", {
      body: { participant_id: p.id },
    });
    if (error) return toast.error("Não foi possível migrar este participante.");
    toast.success(`${p.full_name} virou aluno nutriON.`);
    load();
  };

  const remove = async (c: Challenge) => {
    await supabase.from("gym_challenges").delete().eq("id", c.id);
    setChallenges((prev) => prev?.filter((x) => x.id !== c.id) ?? prev);
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm((v) => !v)} className="gap-2">
        <Plus className="w-4 h-4" /> Criar desafio
      </Button>

      {showForm && (
        <Card>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={form.gym_id} onValueChange={(v) => setForm({ ...form, gym_id: v })}>
              <SelectTrigger><SelectValue placeholder="Academia" /></SelectTrigger>
              <SelectContent>
                {gyms.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}{g.neighborhood || g.city ? ` — ${g.neighborhood || g.city}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Nome do desafio" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <label className="text-xs text-muted-foreground">
              Início
              <Input type="date" value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value, end_date: addDays(e.target.value, 30) })} />
            </label>
            <label className="text-xs text-muted-foreground">
              Fim (30 dias automático)
              <Input type="date" value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </label>
            <label className="text-xs text-muted-foreground">
              Comissão da academia (%)
              <Input type="number" value={form.commission}
                onChange={(e) => setForm({ ...form, commission: Number(e.target.value) || 0 })} />
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <Button onClick={create} disabled={saving} className="gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Criar desafio e gerar QR Code
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!challenges && <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
      {challenges?.length === 0 && (
        <p className="p-6 text-sm text-muted-foreground text-center">
          Nenhum desafio ativo ainda. Feche uma parceria com uma academia e crie o primeiro!
        </p>
      )}

      {challenges?.map((c) => {
        const gym = c.gym_id ? gymById.get(c.gym_id) : null;
        const list = signups.filter((s) => s.gym_slug === c.slug);
        const premium = list.filter((s) => s.paid && !(s.plano ?? "").toLowerCase().includes("vip")).length;
        const vip = list.filter((s) => s.paid && (s.plano ?? "").toLowerCase().includes("vip")).length;
        const free = list.length - premium - vip;
        const revenue = premium * 149 + vip * 249;
        const totalDays = Math.max(1, Math.round((+new Date(c.end_date) - +new Date(c.start_date)) / 86400000));
        const day = Math.min(totalDays, Math.max(0, Math.round((Date.now() - +new Date(`${c.start_date}T12:00:00`)) / 86400000)));
        const pct = Math.round((day / totalDays) * 100);
        const url = c.qr_code_url || `https://nutrion.app.br/desafio/${c.slug}`;
        const pctOf = (n: number) => (list.length ? Math.round((n / list.length) * 100) : 0);

        return (
          <Card key={c.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" /> {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {gym ? `${gym.name} · ` : ""}Dia {day}/{totalDays} · iniciou {new Date(`${c.start_date}T12:00:00`).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(c)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>

              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { l: "Inscritos", v: String(list.length) },
                  { l: "Premium", v: String(premium) },
                  { l: "VIP", v: String(vip) },
                  { l: "Receita /mês", v: brl(revenue) },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-border p-2 text-center">
                    <p className="text-lg font-bold tabular-nums">{s.v}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">{s.l}</p>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Free: {free} ({pctOf(free)}%) · Premium: {premium} ({pctOf(premium)}%) · VIP: {vip} ({pctOf(vip)}%)</p>
                {list.slice(0, 5).map((s, i) => (
                  <p key={s.email + i}>
                    {["🥇", "🥈", "🥉", "4.", "5."][i]} {s.full_name || s.email} ·{" "}
                    {s.paid ? (s.plano?.toLowerCase().includes("vip") ? "VIP" : "PREMIUM") : "FREE"}
                  </p>
                ))}
              </div>

              {(() => {
                const parts = participants.filter((p) => p.challenge_id === c.id);
                if (parts.length === 0) return null;
                return (
                  <div className="rounded-lg border border-border p-3 space-y-2">
                    <p className="text-xs font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-amber-500" /> Participantes ({parts.length})
                    </p>
                    {parts.slice(0, 10).map((p, i) => (
                      <div key={p.id} className="flex items-center gap-2 text-xs">
                        <span className="w-6 text-muted-foreground">{i + 1}.</span>
                        <span className="flex-1 truncate">{p.full_name}</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />{p.streak}d
                        </span>
                        <span className="font-bold text-amber-500 tabular-nums">{p.mce_score}</span>
                        <span className="uppercase text-[10px] text-muted-foreground">{p.tier}</span>
                        {p.whatsapp && (
                          <Button size="icon" variant="ghost" className="h-6 w-6"
                            onClick={() => openWhatsApp(p.whatsapp!, `Fala ${p.full_name.split(" ")[0]}! Aqui é o Diogo Mello. Como foi seu check-in de hoje no ${c.name}?`)}>
                            <MessageCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {p.migrated_to_client ? (
                          <span className="text-[10px] text-emerald-500">aluno</span>
                        ) : (
                          <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]"
                            onClick={() => migrateToClient(p)}>
                            Virar aluno
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}

              <ChallengeOpsPanel challenge={c} gymName={gym?.name} onChanged={load} />

              <div className="flex flex-wrap items-center gap-2">
                <div className="p-2 bg-white rounded-lg">
                  <QRCodeSVG value={url} size={92} bgColor="#ffffff" fgColor="#05070C" level="M" />
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate("/mce/business/challenges")}>
                    <BarChart3 className="w-3.5 h-3.5" /> Relatório
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1"
                    onClick={() => window.open(`/wall/${c.slug}`, "_blank")}>
                    <Monitor className="w-3.5 h-3.5" /> The Wall (TV)
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1"
                    onClick={() =>
                      openWhatsApp(
                        "",
                        `Galera do ${c.name}! Check-in de hoje já tá liberado no app: ${url}`,
                      )
                    }>
                    <MessageCircle className="w-3.5 h-3.5" /> Mensagem pro grupo
                  </Button>
                  <span className="text-[10px] text-muted-foreground break-all max-w-[240px]">{url}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
