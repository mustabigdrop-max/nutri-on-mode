import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, AlertTriangle, TrendingUp, Search, Bell, Settings, Plus, UserPlus, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface PatientRow {
  id: string;
  patient_user_id: string;
  status: string;
  started_at: string;
  notes: string | null;
  patient_name?: string;
  score?: number;
  last_activity?: string;
}

const CoachDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useCoachProfile();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const loadData = async () => {
      // Load patients
      const { data: patientsData } = await supabase
        .from("coach_patients")
        .select("*")
        .eq("coach_id", profile.id)
        .eq("status", "active");

      // Load alerts
      const { data: alertsData } = await supabase
        .from("coach_alerts")
        .select("*")
        .eq("coach_id", profile.id)
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(10);

      // Enrich patients with profile data
      const enriched: PatientRow[] = [];
      if (patientsData) {
        for (const p of patientsData) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("full_name, updated_at")
            .eq("user_id", p.patient_user_id)
            .maybeSingle();

          const { data: scoreData } = await supabase
            .from("consistency_scores")
            .select("total_score")
            .eq("user_id", p.patient_user_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          enriched.push({
            ...p,
            patient_name: prof?.full_name || "Paciente",
            score: scoreData?.total_score ?? 0,
            last_activity: prof?.updated_at || p.created_at,
          });
        }
      }

      setPatients(enriched);
      setAlerts(alertsData || []);
      setLoading(false);
    };

    loadData();
  }, [profile]);

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

  const activePatients = patients.filter(p => p.status === "active");
  const atRisk = patients.filter(p => (p.score ?? 0) < 30);
  const avgScore = activePatients.length
    ? Math.round(activePatients.reduce((sum, p) => sum + (p.score ?? 0), 0) / activePatients.length)
    : 0;

  const filtered = activePatients.filter(p =>
    p.patient_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getScoreBadge = (score: number) => {
    if (score >= 70) return { color: "bg-green-500/20 text-green-400 border-green-500/30", emoji: "🟢" };
    if (score >= 40) return { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", emoji: "🟡" };
    return { color: "bg-red-500/20 text-red-400 border-red-500/30", emoji: "🔴" };
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "agora";
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "há 1 dia";
    return `há ${days} dias`;
  };

  const severityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return "🔴";
      case "high": return "🔴";
      case "medium": return "🟡";
      default: return "🟢";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              {profile.plan === "white_label" && profile.white_label_app_name
                ? profile.white_label_app_name
                : "nutriON Coach"}
              <Badge variant="outline" className="text-xs">
                {profile.plan === "white_label" ? "White Label" : "Coach Pro"}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground">{profile.professional_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate("/coach/settings")}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Pacientes Ativos", value: `${activePatients.length}/${profile.max_patients}`, color: "text-primary" },
            { icon: TrendingUp, label: "Score Médio", value: `${avgScore}/100`, color: avgScore >= 60 ? "text-green-400" : "text-yellow-400" },
            { icon: AlertTriangle, label: "Em Risco", value: atRisk.length.toString(), color: atRisk.length > 0 ? "text-red-400" : "text-green-400" },
            { icon: Bell, label: "Alertas Pendentes", value: alerts.length.toString(), color: alerts.length > 0 ? "text-yellow-400" : "text-green-400" },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <m.icon className={`w-8 h-8 ${m.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-xl font-bold text-foreground">{m.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Capacity warning */}
        {activePatients.length >= profile.max_patients - 2 && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm text-yellow-300">
                ⚠️ Você tem {activePatients.length}/{profile.max_patients} pacientes — considere fazer upgrade
              </p>
              <Button size="sm" variant="outline">Upgrade</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Patient list */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Seus Pacientes — {activePatients.length} ativos
              </h2>
              <Button size="sm" onClick={() => navigate("/coach/add-patient")}>
                <UserPlus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    {activePatients.length === 0
                      ? "Nenhum paciente cadastrado ainda. Clique em 'Adicionar' para começar."
                      : "Nenhum paciente encontrado."}
                  </CardContent>
                </Card>
              ) : (
                filtered.map((p, i) => {
                  const badge = getScoreBadge(p.score ?? 0);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => navigate(`/coach/patient/${p.patient_user_id}`)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                              {p.patient_name?.charAt(0) || "P"}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{p.patient_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeTime(p.last_activity || p.created_at)}
                                {(p.score ?? 0) < 30 && " — risco"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${badge.color} text-xs`}>
                              {badge.emoji} {p.score}/100
                            </Badge>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Alerts sidebar */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5" /> Alertas Recentes
            </h2>
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  ✅ Nenhum alerta pendente
                </CardContent>
              </Card>
            ) : (
              alerts.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border-l-4" style={{
                    borderLeftColor: a.severity === "critical" || a.severity === "high" ? "hsl(var(--destructive))" : a.severity === "medium" ? "#eab308" : "hsl(var(--primary))"
                  }}>
                    <CardContent className="p-3">
                      <p className="text-xs text-foreground">
                        {severityIcon(a.severity)} {a.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatRelativeTime(a.created_at)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoachDashboardPage;
