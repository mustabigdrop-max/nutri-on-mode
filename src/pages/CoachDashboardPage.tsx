import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, AlertTriangle, AlertCircle, FileText, Search, Settings, ArrowLeft, Library,
  UtensilsCrossed, Dumbbell, FlaskConical, Camera, Sparkles, Bone, Flame, Activity,
  CalendarDays, ChevronRight, Building2, Instagram, Mic2, Link2, Copy, Check,
} from "lucide-react";
import { motion } from "framer-motion";
import ProfessionalTypeBadge from "@/components/coach/ProfessionalTypeBadge";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import CreateClientDialog from "@/components/coach/CreateClientDialog";
import CoachUpgradeGate from "@/components/coach/CoachUpgradeGate";
import { useUserRole } from "@/hooks/useUserRole";
import { useCoachAthletes, type CoachAthlete } from "@/hooks/useCoachAthletes";
import { generateAgenda } from "@/lib/coachAgenda";
import AthleteCard from "@/components/coach/AthleteCard";
import SendPlanDialog, { type SendPlanType } from "@/components/coach/SendPlanDialog";
import ProtocolSuggestionsPanel from "@/components/coach/ProtocolSuggestionsPanel";
import PartnerGymsPanel from "@/components/coach/PartnerGymsPanel";

const ADVANCED_MODULES = [
  { label: "nutriON GYM", icon: Building2, route: "/mce/business", color: "#E8A020" },
  { label: "TrainingON", icon: Dumbbell, route: "/coach/trainingon", color: "#E8A020" },
  { label: "APEX Visual", icon: Camera, route: "/coach/apex-visual", color: "#E8A020" },
  { label: "VERA", icon: Sparkles, route: "/coach/vera", color: "#A78BFA" },
  { label: "LAB Exames", icon: FlaskConical, route: "/coach/exames", color: "#4ade80" },
  { label: "RunON", icon: Activity, route: "/runon", color: "#00D4FF" },
  { label: "ScienceHub", icon: Library, route: "/science", color: "#60a5fa" },
  { label: "MetabolicON", icon: Flame, route: "/metabolicon", color: "#fb923c" },
  { label: "Biomecânica", icon: Bone, route: "/biomechanics", color: "#f472b6" },
  { label: "SOCIAL ON", icon: Instagram, route: "/coach/social", color: "#00D4FF" },
  { label: "SOCIAL ON+", icon: Instagram, route: "/coach/social-on", color: "#A855F7" },
  { label: "Kit de Palestra", icon: Mic2, route: "/coach/palestra", color: "#B8922A" },
];

type StatusFilter = "all" | "ok" | "attention" | "risk";

const CoachDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useCoachProfile();
  const { professionalType } = useUserRole();
  const { athletes, loading, plansThisMonth, refetch } = useCoachAthletes(profile?.id, user?.id);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sendTarget, setSendTarget] = useState<CoachAthlete | null>(null);
  const [sendType, setSendType] = useState<SendPlanType>("meal_plan");
  const [sendOpen, setSendOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const bioLink = "https://nutrion.app.br/diagnostico?utm_source=instagram&utm_medium=bio&utm_campaign=mce_diagnostico";

  const handleCopyBioLink = async () => {
    try {
      await navigator.clipboard.writeText(bioLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  };

  const agenda = useMemo(() => generateAgenda(athletes), [athletes]);

  const athleteIds = useMemo(() => athletes.map((a) => a.userId), [athletes]);
  const athleteNames = useMemo(
    () => Object.fromEntries(athletes.map((a) => [a.userId, a.name])),
    [athletes]
  );

  const checkinsPendentes = athletes.filter((a) => a.diasDesdeCheckin > 3).length;
  const emRisco = athletes.filter((a) => a.riskLevel === "risk").length;

  const filtered = athletes.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "all" || a.riskLevel === statusFilter)
  );

  const openSend = (a: CoachAthlete, type: SendPlanType) => {
    setSendTarget(a);
    setSendType(type);
    setSendOpen(true);
  };

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    navigate("/coach");
    return null;
  }

  const alunosAtivos = profile.alunos_ativos ?? athletes.length;
  const maxAlunos = profile.max_alunos ?? 10;

  const stats = [
    {
      icon: Users,
      label: "Atletas Ativos",
      value: `${athletes.length}/${maxAlunos}`,
      color: "#00D4FF",
      onClick: () => setStatusFilter("all"),
    },
    {
      icon: AlertCircle,
      label: "Check-ins Pendentes",
      value: String(checkinsPendentes),
      color: "#FFD700",
      onClick: () => document.getElementById("coach-agenda")?.scrollIntoView({ behavior: "smooth" }),
      highlight: checkinsPendentes > 0,
    },
    {
      icon: AlertTriangle,
      label: "Em Risco",
      value: String(emRisco),
      color: "#FF4444",
      onClick: () => setStatusFilter("risk"),
      highlight: emRisco > 0,
    },
    {
      icon: FileText,
      label: "Planos este Mês",
      value: String(plansThisMonth),
      color: "#00FF88",
      onClick: () => navigate("/coach/templates"),
    },
  ];

  const grouped = agenda.reduce<Record<string, typeof agenda>>((acc, item) => {
    (acc[item.dateLabel] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                {profile.plan === "white_label" && profile.white_label_app_name
                  ? profile.white_label_app_name
                  : "NUTRION · Coach Hub"}
                <Badge variant="outline" className="text-xs">
                  {profile.plan === "white_label" ? "White Label" : "Coach Pro"}
                </Badge>
                <ProfessionalTypeBadge type={professionalType} />
              </h1>
              <p className="text-sm text-muted-foreground">{profile.professional_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/coach/templates")} className="gap-2">
              <Library className="w-4 h-4" /> Biblioteca
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate("/coach/settings")}>
              <Settings className="w-4 h-4" />
            </Button>
            <NotificationBell />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-8">
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={s.onClick}
              className="coach-stat-card"
              style={{ borderColor: s.highlight ? `${s.color}55` : undefined }}
            >
              <div className="flex items-center gap-3">
                <s.icon className={`w-6 h-6 shrink-0 ${s.highlight ? "coach-pulse" : ""}`} style={{ color: s.color }} />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{s.label}</p>
                  <p className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* SUGESTÕES DE AJUSTE */}
        <ProtocolSuggestionsPanel athleteIds={athleteIds} athleteNames={athleteNames} />

        {/* AÇÕES RÁPIDAS */}
        <section className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Ações rápidas</p>
          <div className="flex flex-wrap gap-3">
          <button className="quick-action" onClick={() => navigate("/coach/plano-alimentar")}>
              <UtensilsCrossed className="w-4 h-4" /> Gerar Plano Alimentar
            </button>
            <button className="quick-action" onClick={() => navigate("/coach/exames")}>
              <FlaskConical className="w-4 h-4" /> Solicitar Exames
            </button>
            <button className="quick-action" onClick={() => navigate("/leads")}>
              <Instagram className="w-4 h-4" /> Link da Bio / Leads
            </button>
          </div>
          <CoachUpgradeGate />
        </section>

        {alunosAtivos >= maxAlunos - 2 && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm text-yellow-300">
                ⚠️ Você tem {alunosAtivos}/{maxAlunos} alunos — considere fazer upgrade
              </p>
              <Button size="sm" variant="outline" onClick={() => navigate("/coach/settings")}>
                Upgrade
              </Button>
            </CardContent>
          </Card>
        )}

        {/* MEUS ATLETAS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Meus atletas — {athletes.length} ativos
            </p>
            <CreateClientDialog />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "ok", "attention", "risk"] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                style={{
                  borderColor: statusFilter === f ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.08)",
                  color: statusFilter === f ? "#00D4FF" : undefined,
                  background: statusFilter === f ? "rgba(0,212,255,0.08)" : "transparent",
                }}
              >
                {f === "all" ? "Todos" : f === "ok" ? "Em dia" : f === "attention" ? "Atenção" : "Risco"}
              </button>
            ))}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar atleta..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground text-sm">
                  {athletes.length === 0
                    ? "Nenhum atleta vinculado ainda. Use 'Convidar Aluno' para gerar um link."
                    : "Nenhum atleta encontrado com esse filtro."}
                </CardContent>
              </Card>
            ) : (
              filtered.map((a) => (
                <AthleteCard
                  key={a.id}
                  athlete={a}
                  onSendMeal={(x) => openSend(x, "meal_plan")}
                  onSendTraining={(x) => openSend(x, "training_plan")}
                  onUpdated={refetch}
                />
              ))
            )}
          </div>
        </section>

        {/* ACADEMIAS PARCEIRAS */}
        <PartnerGymsPanel coachUserId={user?.id || ""} coachProfileId={profile.id} />

        {/* MÓDULOS AVANÇADOS */}
        <section className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Módulos avançados</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {ADVANCED_MODULES.map((m) => (
              <button
                key={m.route}
                onClick={() => navigate(m.route)}
                className="rounded-xl p-3 flex flex-col items-center gap-2 transition-colors"
                style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${m.color}22` }}
              >
                <m.icon className="w-4 h-4" style={{ color: m.color }} />
                <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: m.color }}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* AGENDA */}
        <section id="coach-agenda" className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5" /> Agenda da semana
          </p>
          <Card>
            <CardContent className="p-0">
              {agenda.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">✅ Nada pendente — tudo em dia</p>
              ) : (
                Object.entries(grouped).map(([label, items]) => (
                  <div key={label}>
                    <p className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
                    {items.map((it) => (
                      <div key={it.id} className={`agenda-item ${it.priority} flex items-center justify-between gap-3`}>
                        <p className="text-sm text-foreground">{it.message}</p>
                        {it.action && (
                          <button
                            className="quick-action-sm shrink-0"
                            onClick={() => it.actionRoute && navigate(it.actionRoute)}
                          >
                            {it.action} <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <SendPlanDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        athlete={sendTarget}
        type={sendType}
        coachProfileId={profile.id}
        coachUserId={user?.id || ""}
        onSent={refetch}
      />
    </div>
  );
};

export default CoachDashboardPage;
