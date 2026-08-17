import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, CreditCard, TrendingUp, Loader2, Building2, Trophy } from "lucide-react";

type Signup = {
  id: string;
  email: string;
  full_name: string | null;
  source: string;
  gym_slug: string | null;
  paid: boolean;
  plano: string | null;
  paid_at: string | null;
  created_at: string;
};

type Gym = {
  id: string;
  name: string;
  city: string | null;
  challenge_slug: string | null;
  active: boolean;
};

type ChallengeRow = {
  key: string;
  name: string;
  city: string | null;
  active: boolean | null;
  signups: Signup[];
  paid: number;
  rate: number;
  last: string | null;
};

const fmtDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";

export default function BusinessChallengesPage() {
  const navigate = useNavigate();
  const [signups, setSignups] = useState<Signup[] | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [s, g] = await Promise.all([
        supabase
          .from("challenge_signups")
          .select("id, email, full_name, source, gym_slug, paid, plano, paid_at, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("partner_gyms").select("id, name, city, challenge_slug, active"),
      ]);
      setGyms((g.data as Gym[]) ?? []);
      setSignups((s.data as Signup[]) ?? []);
    })();
  }, []);

  const challenges: ChallengeRow[] = useMemo(() => {
    const list = signups ?? [];
    const map = new Map<string, ChallengeRow>();

    const push = (key: string, name: string, city: string | null, active: boolean | null) => {
      if (!map.has(key))
        map.set(key, { key, name, city, active, signups: [], paid: 0, rate: 0, last: null });
      return map.get(key)!;
    };

    gyms.forEach((gym) => push(gym.challenge_slug || gym.id, gym.name, gym.city, gym.active));

    list.forEach((s) => {
      const slug = s.gym_slug ?? "__geral__";
      const gym = gyms.find((x) => x.challenge_slug === slug);
      const row = push(
        gym ? gym.challenge_slug || gym.id : slug,
        gym?.name ?? (s.gym_slug ? s.gym_slug : "Desafio geral (sem academia)"),
        gym?.city ?? null,
        gym?.active ?? null,
      );
      row.signups.push(s);
    });

    const rows = Array.from(map.values()).map((r) => {
      const paid = r.signups.filter((s) => s.paid).length;
      return {
        ...r,
        paid,
        rate: r.signups.length ? Math.round((paid / r.signups.length) * 100) : 0,
        last: r.signups[0]?.created_at ?? null,
      };
    });

    return rows.sort((a, b) => b.signups.length - a.signups.length || a.name.localeCompare(b.name));
  }, [signups, gyms]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return challenges;
    return challenges.filter(
      (c) => c.name.toLowerCase().includes(term) || (c.city ?? "").toLowerCase().includes(term),
    );
  }, [challenges, q]);

  const totals = useMemo(() => {
    const list = signups ?? [];
    const paid = list.filter((s) => s.paid).length;
    return {
      challenges: challenges.length,
      participants: list.length,
      paid,
      rate: list.length ? Math.round((paid / list.length) * 100) : 0,
    };
  }, [signups, challenges]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-24 max-w-4xl mx-auto space-y-5">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/mce/business")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">Painel de Desafios</h1>
          <p className="text-xs text-muted-foreground">
            Status de cada desafio, participantes e alunos pagantes
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Desafios ativos", value: totals.challenges, icon: Trophy },
          { label: "Participantes", value: totals.participants, icon: Users },
          { label: "Alunos pagantes", value: totals.paid, icon: CreditCard },
          { label: "Conversão geral", value: `${totals.rate}%`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardContent className="p-4 space-y-1">
              <Icon className="w-4 h-4 text-amber-500" />
              <p className="text-2xl font-bold tabular-nums">{signups ? value : "—"}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Input placeholder="Buscar desafio ou cidade" value={q} onChange={(e) => setQ(e.target.value)} />

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {!signups && (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {signups && filtered.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground text-center">Nenhum desafio registrado ainda.</p>
          )}
          {filtered.map((c) => (
            <div key={c.key}>
              <button
                onClick={() => setOpen(open === c.key ? null : c.key)}
                className="w-full p-3 flex items-center gap-3 text-left hover:bg-muted/40 transition-colors"
              >
                <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {c.city ? `${c.city} · ` : ""}
                    {c.signups.length} participantes · {c.paid} pagantes · {c.rate}% conversão · último{" "}
                    {fmtDate(c.last)}
                  </p>
                </div>
                <span
                  className={`text-[11px] px-2 py-1 rounded-full border shrink-0 ${
                    c.active === false
                      ? "border-border text-muted-foreground"
                      : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                  }`}
                >
                  {c.active === false ? "Inativo" : "Ativo"}
                </span>
              </button>

              {open === c.key && (
                <div className="bg-muted/20 divide-y divide-border/60">
                  {c.signups.length === 0 && (
                    <p className="p-4 text-xs text-muted-foreground">Nenhum participante ainda.</p>
                  )}
                  {c.signups.map((s) => (
                    <div key={s.id} className="px-4 py-2 flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{s.full_name || s.email}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {s.email} · {s.source === "qr" ? "QR do desafio" : s.source} · {fmtDate(s.created_at)}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full border shrink-0 ${
                          s.paid
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {s.paid ? `Pagante${s.plano ? ` · ${s.plano}` : ""}` : "Gratuito"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
