import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, QrCode, Users, CreditCard, TrendingUp, Loader2 } from "lucide-react";

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

const fmtDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";

export default function GymChallengesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Signup[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase
      .from("challenge_signups")
      .select("id, email, full_name, source, gym_slug, paid, plano, paid_at, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as Signup[]) ?? []));
  }, []);

  const stats = useMemo(() => {
    const list = rows ?? [];
    const qr = list.filter((r) => r.source === "qr");
    const paid = list.filter((r) => r.paid);
    const qrPaid = qr.filter((r) => r.paid);
    return {
      total: list.length,
      qr: qr.length,
      paid: paid.length,
      rate: qr.length ? Math.round((qrPaid.length / qr.length) * 100) : 0,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows ?? [];
    return (rows ?? []).filter(
      (r) =>
        r.email.toLowerCase().includes(term) ||
        (r.full_name ?? "").toLowerCase().includes(term) ||
        (r.gym_slug ?? "").toLowerCase().includes(term),
    );
  }, [rows, q]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-24 max-w-4xl mx-auto space-y-5">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/mce/business")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">Desafio da Academia · Conversão</h1>
          <p className="text-xs text-muted-foreground">Cadastros vindos do QR Code e quantos viraram assinantes</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Cadastros totais", value: stats.total, icon: Users },
          { label: "Via QR do desafio", value: stats.qr, icon: QrCode },
          { label: "Pagantes", value: stats.paid, icon: CreditCard },
          { label: "Conversão QR", value: `${stats.rate}%`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardContent className="p-4 space-y-1">
              <Icon className="w-4 h-4 text-amber-500" />
              <p className="text-2xl font-bold tabular-nums">{rows ? value : "—"}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Input placeholder="Buscar por nome, email ou academia" value={q} onChange={(e) => setQ(e.target.value)} />

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {!rows && (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {rows && filtered.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground text-center">Nenhum cadastro registrado ainda.</p>
          )}
          {filtered.map((r) => (
            <div key={r.id} className="p-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{r.full_name || r.email}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {r.email} · {r.source === "qr" ? "QR do desafio" : r.source}
                  {r.gym_slug ? ` · ${r.gym_slug}` : ""} · {fmtDate(r.created_at)}
                </p>
              </div>
              <span
                className={`text-[11px] px-2 py-1 rounded-full border shrink-0 ${
                  r.paid
                    ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                    : "border-border text-muted-foreground"
                }`}
              >
                {r.paid ? `Pagante${r.plano ? ` · ${r.plano}` : ""}` : "Gratuito"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
