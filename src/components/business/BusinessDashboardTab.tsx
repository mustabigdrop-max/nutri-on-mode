import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Users, Wallet, Trophy, Plus, Trash2, Loader2 } from "lucide-react";
import { GYM_STATUSES, brl, calcRevenue, statusMeta } from "@/lib/gymBusiness";

type Task = { id: string; description: string; completed: boolean };

const PIPELINE = GYM_STATUSES.filter((s) => s.value !== "recusada");

export default function BusinessDashboardTab({ reloadKey = 0 }: { reloadKey?: number }) {
  const { user } = useAuth();
  const [gymStatuses, setGymStatuses] = useState<string[] | null>(null);
  const [clients, setClients] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [activeChallenges, setActiveChallenges] = useState(0);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [newTask, setNewTask] = useState("");

  const [calc, setCalc] = useState({ gyms: 1, membersPerGym: 500, conversion: 7, ticket: 149, commission: 75 });

  const loadTasks = useCallback(async () => {
    const { data } = await supabase
      .from("business_tasks")
      .select("id, description, completed")
      .order("created_at", { ascending: true });
    setTasks((data as Task[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      const [g, s, c] = await Promise.all([
        supabase.from("partner_gyms").select("status"),
        supabase.from("challenge_signups").select("paid, plano"),
        supabase.from("gym_challenges").select("id, status"),
      ]);
      setGymStatuses(((g.data as { status: string }[]) ?? []).map((x) => x.status));
      const signups = (s.data as { paid: boolean; plano: string | null }[]) ?? [];
      setClients(signups.length);
      setRevenue(
        signups.filter((x) => x.paid).reduce((acc, x) => acc + (x.plano?.toLowerCase().includes("vip") ? 249 : 149), 0),
      );
      setActiveChallenges(((c.data as { status: string }[]) ?? []).filter((x) => x.status !== "completed").length);
    })();
    loadTasks();
  }, [loadTasks, reloadKey]);

  const pipeline = useMemo(() => {
    const list = gymStatuses ?? [];
    return PIPELINE.map((s) => ({ ...s, count: list.filter((x) => x === s.value).length }));
  }, [gymStatuses]);

  const closedGyms = pipeline.find((p) => p.value === "fechada")?.count ?? 0;

  const result = useMemo(() => calcRevenue(calc), [calc]);

  const addTask = async () => {
    if (!user || !newTask.trim()) return;
    const { data } = await supabase
      .from("business_tasks")
      .insert({ coach_user_id: user.id, description: newTask.trim() })
      .select("id, description, completed")
      .maybeSingle();
    if (data) setTasks((t) => [...(t ?? []), data as Task]);
    setNewTask("");
  };

  const toggleTask = async (t: Task) => {
    setTasks((prev) => prev?.map((x) => (x.id === t.id ? { ...x, completed: !x.completed } : x)) ?? prev);
    await supabase.from("business_tasks").update({ completed: !t.completed }).eq("id", t.id);
  };

  const removeTask = async (t: Task) => {
    setTasks((prev) => prev?.filter((x) => x.id !== t.id) ?? prev);
    await supabase.from("business_tasks").delete().eq("id", t.id);
  };

  const num = (label: string, key: keyof typeof calc, suffix = "") => (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1">
        <Input
          type="number"
          className="h-8 w-24 text-right"
          value={calc[key]}
          onChange={(e) => setCalc({ ...calc, [key]: Math.max(0, Number(e.target.value) || 0) })}
        />
        <span className="text-xs text-muted-foreground w-4">{suffix}</span>
      </span>
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Academias parceiras", value: closedGyms, icon: Building2 },
          { label: "Clientes totais", value: clients, icon: Users },
          { label: "Receita /mês", value: brl(revenue), icon: Wallet },
          { label: "Desafios ativos", value: activeChallenges, icon: Trophy },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardContent className="p-4 space-y-1">
              <Icon className="w-4 h-4 text-amber-500" />
              <p className="text-2xl font-bold tabular-nums">{gymStatuses ? value : "—"}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Pipeline de academias</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {pipeline.map((p) => {
              const total = pipeline.reduce((a, b) => a + b.count, 0) || 1;
              return (
                <div key={p.value} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{p.dot} {p.label}</p>
                  <p className="text-xl font-bold tabular-nums" style={{ color: p.color }}>{p.count}</p>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(p.count / total) * 100}%`, background: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Próximas ações</p>
          {!tasks && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {tasks?.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma ação cadastrada. Comece mapeando academias do bairro.</p>
          )}
          {tasks?.map((t) => (
            <div key={t.id} className="flex items-center gap-3">
              <Checkbox checked={t.completed} onCheckedChange={() => toggleTask(t)} />
              <span className={`text-sm flex-1 ${t.completed ? "line-through text-muted-foreground" : ""}`}>
                {t.description}
              </span>
              <Button size="icon" variant="ghost" onClick={() => removeTask(t)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <Input placeholder="Adicionar ação" value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()} />
            <Button onClick={addTask} className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Calculadora de receita</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {num("Academias parceiras", "gyms")}
            {num("Alunos por academia", "membersPerGym")}
            {num("Taxa de conversão", "conversion", "%")}
            {num("Ticket médio (R$)", "ticket")}
            {num("Sua comissão", "commission", "%")}
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1 text-sm">
            <Row label="Participantes estimados" value={String(result.participants)} />
            <Row label="Receita bruta" value={`${brl(result.gross)}/mês`} />
            <Row label="Sua receita" value={`${brl(result.net)}/mês`} highlight />
            <Row label="Comissão academia" value={`${brl(result.gymCommission)}/mês`} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[5, 10, 15].map((n) => (
              <div key={n} className="rounded-lg border border-border p-2">
                <p className="text-[10px] uppercase text-muted-foreground">{n} academias</p>
                <p className="text-sm font-bold text-amber-500">{brl(result.netPerGym * n)}/mês</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-bold text-amber-500" : "font-semibold"}>{value}</span>
    </div>
  );
}

export { statusMeta };
