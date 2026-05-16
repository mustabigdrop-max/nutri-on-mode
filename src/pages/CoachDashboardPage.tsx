import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, AlertTriangle, TrendingUp, Search, Bell, Settings, UserPlus, ArrowUpRight, Link2, Copy, Loader2, Trash2, Zap, Dumbbell, FlaskConical, Bone, Flame, ArrowLeft, Handshake, Send, Trophy, Library, Scan } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SendProtocolModule from "@/components/coach/SendProtocolModule";
import AthleteRoster from "@/components/coach/AthleteRoster";
import CoachHub from "@/pages/CoachHub";
import ApexVisualDashboard from "@/components/coach/ApexVisualDashboard";

interface PatientRow {
  id: string;
  patient_user_id: string;
  status: string;
  started_at: string;
  notes: string | null;
  patient_name?: string;
  score?: number;
  last_activity?: string;
  created_at: string;
  sex?: string | null;
  ultima_menstruacao?: string | null;
  duracao_ciclo?: number | null;
  fase_ciclo?: string | null;
}

const CoachDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useCoachProfile();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    if (profileLoading) return;
    if (!profile) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      const { data: patientsData } = await supabase
        .from("coach_patients")
        .select("*")
        .eq("coach_id", profile.id)
        .eq("status", "active");

      const { data: alertsData } = await supabase
        .from("coach_alerts")
        .select("*")
        .eq("coach_id", profile.id)
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(10);

      const enriched: PatientRow[] = [];
      if (patientsData) {
        for (const p of patientsData) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("full_name, updated_at, sex")
            .eq("user_id", p.patient_user_id)
            .maybeSingle();

          const { data: scoreData } = await supabase
            .from("consistency_scores")
            .select("total_score")
            .eq("user_id", p.patient_user_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          let femP: any = null;
          if ((prof as any)?.sex === "F") {
            const { data } = await supabase
              .from("feminine_profiles" as any)
              .select("ultima_menstruacao,duracao_ciclo,fase_ciclo")
              .eq("user_id", p.patient_user_id)
              .maybeSingle();
            femP = data;
          }

          enriched.push({
            ...p,
            patient_name: prof?.full_name || "Paciente",
            score: scoreData?.total_score || 0,
            last_activity: prof?.updated_at || p.created_at,
            sex: (prof as any)?.sex || null,
            ultima_menstruacao: femP?.ultima_menstruacao || null,
            duracao_ciclo: femP?.duracao_ciclo || null,
            fase_ciclo: femP?.fase_ciclo || null,
          });
        }
      }

      // Load partners created by this admin/coach
      const { data: partnersData } = await supabase
        .from("partners")
        .select("id, full_name, email, plan, status, created_at, user_id")
        .eq("created_by", user?.id)
        .order("created_at", { ascending: false });

      setPartners(partnersData || []);
      setPatients(enriched);
      setAlerts(alertsData || []);
      setLoading(false);
    };

    loadData();
  }, [profile, profileLoading]);

  const generateInviteLink = async () => {
    if (!user || !profile) return;

    const activeCount = profile.alunos_ativos ?? 0;
    const maxCount = profile.max_alunos ?? 10;

    if (activeCount >= maxCount) {
      toast({
        title: "Limite de alunos atingido",
        description: `Você tem ${activeCount}/${maxCount} alunos. Faça upgrade para mais vagas.`,
        variant: "destructive",
      });
      return;
    }

    setGeneratingInvite(true);
    try {
      const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);

      const { error } = await supabase.from("coach_convites").insert({
        coach_id: user.id,
        token,
        usado: false,
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      });

      if (error) throw error;

      const link = `${window.location.origin}/convite/${token}`;
      setInviteLink(link);
      toast({ title: "Link de convite gerado! 🔗" });
    } catch (err: any) {
      toast({ title: "Erro ao gerar convite", description: err.message, variant: "destructive" });
    } finally {
      setGeneratingInvite(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({ title: "Link copiado! 📋" });
  };

  const handleRemoveStudent = async (patientUserId: string, coachPatientId: string) => {
    if (!profile) return;
    try {
      // Remove from coach_patients
      await supabase.from("coach_patients").update({ status: "encerrado" }).eq("id", coachPatientId);

      // Reset student profile
      await supabase
        .from("profiles")
        .update({ role: "user", plano_atual: "free", coach_profile_id: null })
        .eq("user_id", patientUserId);

      // Decrement alunos_ativos
      await supabase
        .from("coach_profiles")
        .update({ alunos_ativos: Math.max((profile.alunos_ativos ?? 1) - 1, 0) })
        .eq("id", profile.id);

      setPatients((prev) => prev.filter((p) => p.id !== coachPatientId));
      toast({ title: "Aluno desvinculado" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
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

  const activePatients = patients.filter((p) => p.status === "active");
  const atRisk = patients.filter((p) => (p.score ?? 0) < 30);
  const avgScore = activePatients.length
    ? Math.round(activePatients.reduce((sum, p) => sum + (p.score ?? 0), 0) / activePatients.length)
    : 0;

  const filtered = activePatients.filter((p) =>
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
      case "critical":
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      default:
        return "🟢";
    }
  };

  const alunosAtivos = profile.alunos_ativos ?? 0;
  const maxAlunos = profile.max_alunos ?? 10;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                  : "nutriON Coach"}
                <Badge variant="outline" className="text-xs">
                  {profile.plan === "white_label" ? "White Label" : "Coach Pro"}
                </Badge>
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
            { icon: Users, label: "Alunos Ativos", value: `${alunosAtivos}/${maxAlunos}`, color: "text-primary" },
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
        {alunosAtivos >= maxAlunos - 2 && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm text-yellow-300">
                ⚠️ Você tem {alunosAtivos}/{maxAlunos} alunos — considere fazer upgrade
              </p>
              <Button size="sm" variant="outline">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => navigate("/coach/plano-alimentar")} className="flex items-center gap-2">
            <Zap className="w-4 h-4" /> Gerar Plano Alimentar
          </Button>
          <Button onClick={() => navigate("/training")} variant="outline" className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4" /> TrainingON
          </Button>
          <Button onClick={() => navigate("/coach/apex-visual")} variant="outline" className="flex items-center gap-2">
            <Scan className="w-4 h-4" /> APEX Visual
          </Button>
          <Button onClick={() => navigate("/biomechanics")} variant="outline" className="flex items-center gap-2">
            <Bone className="w-4 h-4" /> Biomecânica
          </Button>
          <Button onClick={() => navigate("/science")} variant="outline" className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" /> ScienceHub
          </Button>
          <Button onClick={() => navigate("/metabolicon")} variant="outline" className="flex items-center gap-2">
            <Flame className="w-4 h-4" /> MetabolicON
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="athletes">
              <Trophy className="w-4 h-4 mr-1" /> Atletas
            </TabsTrigger>
            <TabsTrigger value="send">
              <Send className="w-4 h-4 mr-1" /> Enviar Protocolo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="athletes" className="mt-4">
            <AthleteRoster />
          </TabsContent>

          <TabsContent value="send" className="mt-4">
            <SendProtocolModule coachProfileId={profile.id} coachUserId={user?.id || ""} />
          </TabsContent>


          <TabsContent value="overview" className="mt-4">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Patient list */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Seus Alunos — {activePatients.length} ativos
              </h2>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Link2 className="w-4 h-4 mr-1" /> Convidar Aluno
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-primary" /> Convidar Aluno
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Gere um link único para convidar um aluno. O link é válido por 48 horas e pode ser usado apenas uma vez.
                    </p>
                    <p className="text-sm">
                      Vagas disponíveis: <strong>{maxAlunos - alunosAtivos}</strong> de {maxAlunos}
                    </p>

                    {!inviteLink ? (
                      <Button className="w-full" onClick={generateInviteLink} disabled={generatingInvite || alunosAtivos >= maxAlunos}>
                        {generatingInvite ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
                        Gerar Link de Convite
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
                          <Input value={inviteLink} readOnly className="text-xs bg-transparent border-none" />
                          <Button size="icon" variant="ghost" onClick={copyLink}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Compartilhe este link via WhatsApp. Válido por 48h, uso único.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setInviteLink("");
                          }}
                        >
                          Gerar Novo Link
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar aluno..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="space-y-2">
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    {activePatients.length === 0
                      ? "Nenhum aluno vinculado ainda. Clique em 'Convidar Aluno' para gerar um link."
                      : "Nenhum aluno encontrado."}
                  </CardContent>
                </Card>
              ) : (
                filtered.map((p, i) => {
                  const badge = getScoreBadge(p.score ?? 0);
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                      <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(`/coach/patient/${p.patient_user_id}`)}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div
                            className="flex items-center gap-3 flex-1"
                            onClick={() => navigate(`/coach/patient/${p.patient_user_id}`)}
                          >
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                              {p.patient_name?.charAt(0) || "A"}
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveStudent(p.patient_user_id, p.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <ArrowUpRight
                              className="w-4 h-4 text-muted-foreground cursor-pointer"
                              onClick={() => navigate(`/coach/patient/${p.patient_user_id}`)}
                            />
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
                  <Card
                    className="border-l-4"
                    style={{
                      borderLeftColor:
                        a.severity === "critical" || a.severity === "high"
                          ? "hsl(var(--destructive))"
                          : a.severity === "medium"
                          ? "#eab308"
                          : "hsl(var(--primary))",
                    }}
                  >
                    <CardContent className="p-3">
                      <p className="text-xs text-foreground">
                        {severityIcon(a.severity)} {a.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeTime(a.created_at)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
            {/* Partners section */}
            {partners.length > 0 && (
              <div className="space-y-3 mt-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Handshake className="w-5 h-5" /> Meus Parceiros
                </h2>
                {partners.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <Card>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            {p.full_name?.charAt(0) || "P"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {p.plan?.toUpperCase() || "ON+"}
                          </Badge>
                          <Badge className={p.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30 text-[10px]" : "bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"}>
                            {p.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CoachDashboardPage;
