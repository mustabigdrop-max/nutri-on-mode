import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Search, TrendingUp, ArrowLeft, Plus, BarChart3,
  Flame, Target, ChevronRight, UserPlus, X, Mail,
  Calendar, Activity, FileText, AlertCircle, AlertTriangle, ShieldAlert, Zap,
  FileBarChart, RefreshCw, Mic, Check, XCircle, Clock, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

interface PatientAlert {
  patientId: string;
  patientName: string;
  type: "plateau" | "deficit_agressivo" | "proteina_baixa" | "adesao_baixa" | "culpa_recorrente" | "abandonment_risk";
  message: string;
  priority: number;
  icon: string;
}

interface PatientProfile {
  user_id: string;
  full_name: string | null;
  goal: string | null;
  weight_kg: number | null;
  vet_kcal: number | null;
  protein_g: number | null;
  streak_days: number | null;
  level: number | null;
  xp: number | null;
  onboarding_completed: boolean | null;
  plano_atual: string | null;
}

interface PatientLink {
  id: string;
  patient_id: string;
  status: string;
  notes: string | null;
  created_at: string;
}

interface RiskScore {
  user_id: string;
  risk_score: number;
  risk_level: string;
  active_signals: string[];
}

interface Briefing {
  id: string;
  patient_id: string;
  week_start: string;
  briefing_data: any;
  ai_analysis: string;
  suggested_questions: string[];
  suggested_adjustments: any[];
  recommended_tone: string;
  risk_level: string;
  positive_highlights: string[];
  status: string;
}

interface PlanRevision {
  id: string;
  user_id: string;
  analysis_summary: string;
  proposed_changes: any[];
  impact_summary: any;
  status: string;
  created_at: string;
}

const goalLabels: Record<string, string> = {
  lose_weight: "Emagrecimento",
  gain_muscle: "Hipertrofia",
  definition: "Definição",
  glp1: "Protocolo GLP-1",
  performance: "Performance",
  health: "Saúde",
  maintenance: "Manutenção",
  emagrecimento: "Emagrecimento",
  hipertrofia: "Hipertrofia",
  saude_geral: "Saúde Geral",
};

const RISK_COLORS: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-red-400",
};

const RISK_BG: Record<string, string> = {
  low: "bg-green-500/10 border-green-500/20",
  medium: "bg-yellow-500/10 border-yellow-500/20",
  high: "bg-red-500/10 border-red-500/20",
};

const ProfessionalDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<(PatientLink & { profile?: PatientProfile; riskScore?: RiskScore })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Patient detail data
  const [patientMeals, setPatientMeals] = useState<any[]>([]);
  const [patientWeights, setPatientWeights] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);

  // Patient alerts
  const [patientAlerts, setPatientAlerts] = useState<PatientAlert[]>([]);

  // Briefing state
  const [currentBriefing, setCurrentBriefing] = useState<Briefing | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [showBriefingModal, setShowBriefingModal] = useState(false);

  // Plan revision state
  const [pendingRevisions, setPendingRevisions] = useState<PlanRevision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<PlanRevision | null>(null);
  const [revisionLoading, setRevisionLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    if (!user) return;
    const { data: links } = await supabase
      .from("professional_patients")
      .select("*")
      .eq("professional_id", user.id)
      .eq("status", "active");

    if (!links || links.length === 0) {
      setPatients([]);
      setLoading(false);
      return;
    }

    const patientIds = links.map(l => l.patient_id);
    
    // Fetch profiles and risk scores in parallel
    const [profilesRes, riskRes, revisionsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, full_name, goal, weight_kg, vet_kcal, protein_g, streak_days, level, xp, onboarding_completed, plano_atual")
        .in("user_id", patientIds),
      supabase
        .from("abandonment_risk_scores")
        .select("user_id, risk_score, risk_level, active_signals")
        .in("user_id", patientIds)
        .eq("score_date", new Date().toISOString().split("T")[0]),
      supabase
        .from("plan_revisions")
        .select("*")
        .in("user_id", patientIds)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

    const profiles = profilesRes.data || [];
    const riskScores = riskRes.data || [];

    const merged = links.map(link => ({
      ...link,
      profile: profiles.find(p => p.user_id === link.patient_id) as PatientProfile | undefined,
      riskScore: riskScores.find(r => r.user_id === link.patient_id) as RiskScore | undefined,
    }));

    // Sort by risk level (high first, then medium, then low/none)
    merged.sort((a, b) => {
      const riskOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const aRisk = riskOrder[a.riskScore?.risk_level || "low"] ?? 3;
      const bRisk = riskOrder[b.riskScore?.risk_level || "low"] ?? 3;
      return aRisk - bRisk;
    });

    setPatients(merged);
    setPendingRevisions((revisionsRes.data || []).map(r => ({
      ...r,
      proposed_changes: Array.isArray(r.proposed_changes) ? r.proposed_changes : [],
      impact_summary: r.impact_summary || {},
    })));
    setLoading(false);

    // Generate alerts for all patients
    generatePatientAlerts(merged, profiles);
  };

  const generatePatientAlerts = async (
    patientLinks: typeof patients,
    profiles: PatientProfile[]
  ) => {
    const alerts: PatientAlert[] = [];
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];
    const patientIds = patientLinks.map(l => l.patient_id);

    if (patientIds.length === 0) return;

    // Fetch recent meals and weights for all patients
    const [mealsRes, weightsRes] = await Promise.all([
      supabase
        .from("meal_logs")
        .select("user_id, meal_date, total_kcal, total_protein, emotion")
        .in("user_id", patientIds)
        .gte("meal_date", threeDaysAgo)
        .order("meal_date", { ascending: false }),
      supabase
        .from("weight_logs")
        .select("user_id, weight_kg, logged_at")
        .in("user_id", patientIds)
        .order("logged_at", { ascending: false })
        .limit(500),
    ]);

    const allMeals = mealsRes.data || [];
    const allWeights = weightsRes.data || [];

    // Add abandonment risk alerts from risk scores
    patientLinks.forEach(p => {
      if (p.riskScore?.risk_level === "high") {
        alerts.push({
          patientId: p.patient_id,
          patientName: p.profile?.full_name?.split(" ")[0] || "Paciente",
          type: "abandonment_risk",
          message: `Risco de abandono: ${p.riskScore.risk_score}% — ${p.riskScore.active_signals.length} sinais ativos. Contato urgente recomendado.`,
          priority: 0,
          icon: "🚨",
        });
      } else if (p.riskScore?.risk_level === "medium") {
        alerts.push({
          patientId: p.patient_id,
          patientName: p.profile?.full_name?.split(" ")[0] || "Paciente",
          type: "abandonment_risk",
          message: `Risco médio: ${p.riskScore.risk_score}% — monitorar de perto esta semana.`,
          priority: 1,
          icon: "⚠️",
        });
      }
    });

    for (const prof of profiles) {
      const name = prof.full_name?.split(" ")[0] || "Paciente";
      const patientMeals = allMeals.filter((m: any) => m.user_id === prof.user_id);
      const patientWeights = allWeights.filter((w: any) => w.user_id === prof.user_id);
      const kcalTarget = prof.vet_kcal || 2000;
      const proteinTarget = prof.protein_g || 150;

      // Group meals by date
      const byDate: Record<string, any[]> = {};
      patientMeals.forEach((m: any) => {
        if (!byDate[m.meal_date]) byDate[m.meal_date] = [];
        byDate[m.meal_date].push(m);
      });
      const dates = Object.keys(byDate).sort().reverse().slice(0, 3);

      // Check deficit agressivo (3 days < 1000 kcal)
      if (dates.length === 3) {
        const dailyKcals = dates.map(d => byDate[d].reduce((s: number, m: any) => s + (Number(m.total_kcal) || 0), 0));
        if (dailyKcals.every(k => k > 0 && k < 1000)) {
          const avg = Math.round(dailyKcals.reduce((a, b) => a + b, 0) / 3);
          alerts.push({
            patientId: prof.user_id,
            patientName: name,
            type: "deficit_agressivo",
            message: `Consumo médio de ${avg} kcal nos últimos 3 dias (meta: ${kcalTarget} kcal). Risco de perda muscular.`,
            priority: 1,
            icon: "🔴",
          });
        }
      }

      // Check proteína baixa (3 days < 60% target)
      if (dates.length >= 3) {
        const dailyProt = dates.map(d => byDate[d].reduce((s: number, m: any) => s + (Number(m.total_protein) || 0), 0));
        if (dailyProt.every(p => p > 0 && p < proteinTarget * 0.6)) {
          const avg = Math.round(dailyProt.reduce((a, b) => a + b, 0) / 3);
          alerts.push({
            patientId: prof.user_id,
            patientName: name,
            type: "proteina_baixa",
            message: `Proteína média de ${avg}g nos últimos 3 dias (meta: ${proteinTarget}g).`,
            priority: 1,
            icon: "⚠️",
          });
        }
      }

      // Check guilt emotions
      const guiltyMeals = patientMeals.filter((m: any) => m.emotion === "culpado");
      if (guiltyMeals.length >= 2) {
        alerts.push({
          patientId: prof.user_id,
          patientName: name,
          type: "culpa_recorrente",
          message: `Registrou culpa ${guiltyMeals.length}x nos últimos 3 dias. Considere apoio emocional.`,
          priority: 2,
          icon: "💬",
        });
      }
    }

    // Sort by priority
    alerts.sort((a, b) => a.priority - b.priority);
    setPatientAlerts(alerts);
  };

  const handleAddPatient = async () => {
    if (!addEmail.trim() || !user) return;
    setAddLoading(true);

    const { data: foundProfiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .ilike("full_name", `%${addEmail.trim()}%`)
      .limit(1);

    if (!foundProfiles || foundProfiles.length === 0) {
      toast.error("Paciente não encontrado. Verifique o nome.");
      setAddLoading(false);
      return;
    }

    if (patients.length >= 30) {
      toast.error("Limite de 30 pacientes atingido.");
      setAddLoading(false);
      return;
    }

    const { error } = await supabase
      .from("professional_patients")
      .insert({
        professional_id: user.id,
        patient_id: foundProfiles[0].user_id,
      });

    if (error) {
      if (error.code === "23505") {
        toast.error("Paciente já vinculado.");
      } else {
        toast.error("Erro ao vincular paciente.");
      }
    } else {
      toast.success(`${foundProfiles[0].full_name || "Paciente"} vinculado!`);
      setAddEmail("");
      setShowAddModal(false);
      fetchPatients();
    }
    setAddLoading(false);
  };

  const loadPatientDetail = async (patientId: string) => {
    setSelectedPatient(patientId);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split("T")[0];

    const [mealsRes, weightsRes] = await Promise.all([
      supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", patientId)
        .gte("meal_date", dateStr)
        .order("meal_date", { ascending: true }),
      supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", patientId)
        .order("logged_at", { ascending: true })
        .limit(30),
    ]);

    setPatientMeals(mealsRes.data || []);
    setPatientWeights(weightsRes.data || []);

    const dailyMap = new Map<string, { kcal: number; protein: number; meals: number }>();
    (mealsRes.data || []).forEach((m: any) => {
      const existing = dailyMap.get(m.meal_date) || { kcal: 0, protein: 0, meals: 0 };
      dailyMap.set(m.meal_date, {
        kcal: existing.kcal + (m.total_kcal || 0),
        protein: existing.protein + (m.total_protein || 0),
        meals: existing.meals + 1,
      });
    });

    const stats = Array.from(dailyMap.entries())
      .map(([date, vals]) => ({ date: date.slice(5), ...vals }))
      .sort((a, b) => a.date.localeCompare(b.date));
    setWeeklyStats(stats);
  };

  const removePatient = async (linkId: string) => {
    await supabase
      .from("professional_patients")
      .delete()
      .eq("id", linkId);
    toast.success("Paciente removido.");
    setSelectedPatient(null);
    fetchPatients();
  };

  // Generate briefing for selected patient
  const generateBriefing = async () => {
    if (!selectedPatient || !user) return;
    setBriefingLoading(true);
    
    const weekStart = getWeekStart(new Date()).toISOString().split("T")[0];
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-coach-briefing", {
        body: {
          coachId: user.id,
          patientId: selectedPatient,
          weekStart,
        },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setCurrentBriefing({
        id: "new",
        patient_id: selectedPatient,
        week_start: weekStart,
        briefing_data: data.briefing,
        ai_analysis: data.briefing.ai_analysis,
        suggested_questions: data.briefing.suggested_questions,
        suggested_adjustments: data.briefing.suggested_adjustments,
        recommended_tone: data.briefing.recommended_tone,
        risk_level: data.briefing.risk_level,
        positive_highlights: data.briefing.positive_highlights,
        status: "pending",
      });
      setShowBriefingModal(true);
      toast.success("Briefing gerado! 📋");
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar briefing");
    }
    setBriefingLoading(false);
  };

  // Generate plan revision for selected patient
  const generatePlanRevision = async () => {
    if (!selectedPatient || !user) return;
    setRevisionLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-plan-revision", {
        body: {
          userId: selectedPatient,
          coachId: user.id,
        },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setSelectedRevision({
        id: data.revision.id,
        user_id: selectedPatient,
        analysis_summary: data.revision.analysis,
        proposed_changes: data.revision.changes,
        impact_summary: data.revision.impact,
        status: "pending",
        created_at: new Date().toISOString(),
      });
      toast.success("Revisão de plano gerada! 📝");
      fetchPatients(); // Refresh to show pending revision
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar revisão");
    }
    setRevisionLoading(false);
  };

  // Approve plan revision
  const approveRevision = async (revisionId: string) => {
    const { error } = await supabase
      .from("plan_revisions")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", revisionId);
    
    if (!error) {
      toast.success("Revisão aprovada! Plano atualizado. ✅");
      setSelectedRevision(null);
      fetchPatients();
    }
  };

  // Reject plan revision
  const rejectRevision = async (revisionId: string) => {
    const { error } = await supabase
      .from("plan_revisions")
      .update({ status: "rejected" })
      .eq("id", revisionId);
    
    if (!error) {
      toast.success("Revisão rejeitada.");
      setSelectedRevision(null);
      fetchPatients();
    }
  };

  const filteredPatients = patients.filter(p =>
    !search || (p.profile?.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedData = patients.find(p => p.patient_id === selectedPatient);
  const sp = selectedData?.profile;
  const patientRevision = pendingRevisions.find(r => r.user_id === selectedPatient);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Painel Coach PRO</h1>
              <p className="text-xs text-muted-foreground font-mono">
                {patients.length}/30 pacientes · {pendingRevisions.length} revisões pendentes
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm glow-gold hover:scale-[1.02] transition-transform"
          >
            <UserPlus className="w-4 h-4" />
            Vincular
          </button>
        </div>

        {/* Patient Alerts Panel */}
        {patientAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-destructive" />
              <h2 className="text-sm font-bold text-foreground">Alertas de Pacientes</h2>
              <span className="text-[10px] font-mono text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                {patientAlerts.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {patientAlerts.slice(0, 6).map((alert, i) => (
                <motion.div
                  key={`${alert.patientId}-${alert.type}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border p-3 cursor-pointer transition-all hover:scale-[1.01] ${
                    alert.priority === 0
                      ? "border-red-500/30 bg-red-500/5"
                      : alert.priority === 1
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-primary/20 bg-primary/5"
                  }`}
                  onClick={() => loadPatientDetail(alert.patientId)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{alert.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-foreground">{alert.patientName}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          alert.priority === 0
                            ? "bg-red-500/20 text-red-400"
                            : alert.priority === 1
                            ? "bg-destructive/20 text-destructive"
                            : "bg-primary/20 text-primary"
                        }`}>
                          {alert.priority === 0 ? "CRÍTICO" : alert.priority === 1 ? "URGENTE" : "ATENÇÃO"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient list with risk indicators */}
          <div className="lg:col-span-1">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            {filteredPatients.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/50 p-8 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum paciente vinculado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPatients.map((p, i) => (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => loadPatientDetail(p.patient_id)}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      selectedPatient === p.patient_id
                        ? "border-primary/50 bg-primary/5"
                        : p.riskScore?.risk_level === "high"
                        ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50"
                        : p.riskScore?.risk_level === "medium"
                        ? "border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50"
                        : "border-border bg-card hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Risk indicator */}
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        p.riskScore?.risk_level === "high"
                          ? "bg-red-500/20 text-red-400"
                          : p.riskScore?.risk_level === "medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {p.riskScore?.risk_level === "high" ? "🔴" : p.riskScore?.risk_level === "medium" ? "🟡" : "🟢"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {p.profile?.full_name || "Sem nome"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {goalLabels[p.profile?.goal || ""] || "—"} · Lv.{p.profile?.level || 1}
                          {p.riskScore && (
                            <span className={`ml-2 ${RISK_COLORS[p.riskScore.risk_level]}`}>
                              {p.riskScore.risk_score}%
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {pendingRevisions.some(r => r.user_id === p.patient_id) && (
                          <span className="text-[10px] font-mono bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                            REVISÃO
                          </span>
                        )}
                        {(p.profile?.streak_days || 0) > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-primary font-mono">
                            <Flame className="w-3 h-3" />
                            {p.profile?.streak_days}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Patient detail with coach tools */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!selectedPatient ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border border-border bg-card/30 p-12 text-center"
                >
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Selecione um paciente para ver o progresso e ferramentas de coach</p>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedPatient}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Patient header with coach actions */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          selectedData?.riskScore?.risk_level === "high"
                            ? "bg-red-500/20 text-red-400"
                            : selectedData?.riskScore?.risk_level === "medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-primary/10 text-primary"
                        }`}>
                          {(sp?.full_name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-foreground">{sp?.full_name || "Paciente"}</h2>
                          <p className="text-xs text-muted-foreground font-mono">
                            {goalLabels[sp?.goal || ""] || "—"} · {sp?.weight_kg || "—"}kg · {sp?.vet_kcal || "—"} kcal/dia
                            {sp?.plano_atual === "ON PRO" && (
                              <span className="ml-2 text-primary">👑 PRO</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removePatient(selectedData!.id)}
                        className="p-2 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Desvincular paciente"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Coach action buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                      <button
                        onClick={generateBriefing}
                        disabled={briefingLoading}
                        className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        <FileBarChart className="w-4 h-4" />
                        <span className="text-xs font-semibold">{briefingLoading ? "Gerando..." : "Briefing"}</span>
                      </button>
                      <button
                        onClick={generatePlanRevision}
                        disabled={revisionLoading || !!patientRevision}
                        className="flex items-center justify-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-xs font-semibold">{revisionLoading ? "Analisando..." : "Revisar Plano"}</span>
                      </button>
                      <button
                        className="flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs font-semibold">Chat</span>
                      </button>
                      <button
                        className="flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors"
                      >
                        <Mic className="w-4 h-4" />
                        <span className="text-xs font-semibold">Áudio</span>
                      </button>
                    </div>

                    {/* Pending revision alert */}
                    {patientRevision && (
                      <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-accent" />
                            <span className="text-sm font-semibold text-accent">Revisão de Plano Pendente</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedRevision(patientRevision)}
                              className="text-xs font-mono bg-accent/20 text-accent px-3 py-1 rounded hover:bg-accent/30"
                            >
                              Ver Detalhes
                            </button>
                            <button
                              onClick={() => approveRevision(patientRevision.id)}
                              className="text-xs font-mono bg-green-500/20 text-green-400 px-3 py-1 rounded hover:bg-green-500/30"
                            >
                              Aprovar ✅
                            </button>
                            <button
                              onClick={() => rejectRevision(patientRevision.id)}
                              className="text-xs font-mono bg-red-500/20 text-red-400 px-3 py-1 rounded hover:bg-red-500/30"
                            >
                              Rejeitar ❌
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {patientRevision.proposed_changes?.length || 0} ajustes propostos baseados em 14 dias de dados
                        </p>
                      </div>
                    )}

                    {/* Quick stats */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { icon: Target, label: "Meta", value: `${sp?.vet_kcal || 0} kcal`, color: "text-primary" },
                        { icon: BarChart3, label: "Proteína", value: `${sp?.protein_g || 0}g`, color: "text-accent" },
                        { icon: Flame, label: "Streak", value: `${sp?.streak_days || 0}d`, color: "text-primary" },
                        { icon: AlertTriangle, label: "Risco", value: `${selectedData?.riskScore?.risk_score || 0}%`, color: RISK_COLORS[selectedData?.riskScore?.risk_level || "low"] },
                      ].map(stat => (
                        <div key={stat.label} className="rounded-lg bg-secondary/50 p-3 text-center">
                          <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                          <p className="text-sm font-bold font-mono text-foreground">{stat.value}</p>
                          <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly calorie chart */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Calorias — Últimos 7 dias
                    </h3>
                    {weeklyStats.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Sem dados recentes</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 30% 15%)" />
                          <XAxis dataKey="date" tick={{ fill: "hsl(240 20% 50%)", fontSize: 11 }} />
                          <YAxis tick={{ fill: "hsl(240 20% 50%)", fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(240 40% 7%)",
                              border: "1px solid hsl(240 30% 15%)",
                              borderRadius: 8,
                              color: "hsl(260 30% 96%)",
                              fontSize: 12,
                            }}
                          />
                          <Bar dataKey="kcal" fill="hsl(38 80% 52%)" radius={[4, 4, 0, 0]} name="Kcal" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Protein chart */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" />
                      Proteína — Últimos 7 dias
                    </h3>
                    {weeklyStats.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={weeklyStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 30% 15%)" />
                          <XAxis dataKey="date" tick={{ fill: "hsl(240 20% 50%)", fontSize: 11 }} />
                          <YAxis tick={{ fill: "hsl(240 20% 50%)", fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(240 40% 7%)",
                              border: "1px solid hsl(240 30% 15%)",
                              borderRadius: 8,
                              color: "hsl(260 30% 96%)",
                              fontSize: 12,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="protein"
                            stroke="hsl(168 100% 50%)"
                            strokeWidth={2}
                            dot={{ fill: "hsl(168 100% 50%)", r: 3 }}
                            name="Proteína (g)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Weight evolution */}
                  {patientWeights.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-4">
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Evolução de Peso
                      </h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={patientWeights.map(w => ({
                          date: new Date(w.logged_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
                          peso: w.weight_kg,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 30% 15%)" />
                          <XAxis dataKey="date" tick={{ fill: "hsl(240 20% 50%)", fontSize: 11 }} />
                          <YAxis tick={{ fill: "hsl(240 20% 50%)", fontSize: 11 }} domain={["auto", "auto"]} />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(240 40% 7%)",
                              border: "1px solid hsl(240 30% 15%)",
                              borderRadius: 8,
                              color: "hsl(260 30% 96%)",
                              fontSize: 12,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="peso"
                            stroke="hsl(43 100% 50%)"
                            strokeWidth={2}
                            dot={{ fill: "hsl(43 100% 50%)", r: 3 }}
                            name="Peso (kg)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Recent meals list */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Refeições Recentes</h3>
                    {patientMeals.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sem refeições registradas</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {patientMeals.slice(-10).reverse().map(meal => (
                          <div key={meal.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div>
                              <span className="text-sm font-medium text-foreground capitalize">
                                {meal.meal_type.replace(/_/g, " ")}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">{meal.meal_date}</span>
                              {meal.emotion === "culpado" && <span className="ml-2">😔</span>}
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-mono text-foreground">{meal.total_kcal || 0} kcal</span>
                              <span className="text-xs text-muted-foreground ml-2">{meal.total_protein || 0}g prot</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add patient modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Vincular Paciente</h3>
                <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Digite o nome do paciente cadastrado no nutriON.
              </p>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nome do paciente..."
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <button
                onClick={handleAddPatient}
                disabled={addLoading || !addEmail.trim()}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm glow-gold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {addLoading ? "Buscando..." : "Vincular Paciente"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Briefing Modal */}
      <AnimatePresence>
        {showBriefingModal && currentBriefing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowBriefingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">📋 Briefing Semanal</h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {currentBriefing.briefing_data?.patient_name} · Semana de {currentBriefing.week_start}
                  </p>
                </div>
                <button onClick={() => setShowBriefingModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Risk Level */}
              <div className={`rounded-lg p-4 mb-4 ${RISK_BG[currentBriefing.risk_level]}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${RISK_COLORS[currentBriefing.risk_level]}`}>
                    Nível de Risco: {currentBriefing.risk_level.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {currentBriefing.briefing_data?.adherence_rate || 0}% adesão
                  </span>
                </div>
              </div>

              {/* Macro Summary */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {["kcal", "protein", "carbs", "fat"].map(macro => {
                  const data = currentBriefing.briefing_data?.macros?.[macro];
                  return (
                    <div key={macro} className="rounded-lg bg-secondary/50 p-2 text-center">
                      <p className="text-xs text-muted-foreground capitalize">{macro === "kcal" ? "Calorias" : macro === "protein" ? "Proteína" : macro === "carbs" ? "Carbo" : "Gordura"}</p>
                      <p className="text-sm font-mono font-bold text-foreground">{data?.avg || 0}{macro === "kcal" ? "" : "g"}</p>
                      <p className="text-[10px] text-muted-foreground">{data?.pct || 0}% da meta</p>
                    </div>
                  );
                })}
              </div>

              {/* AI Analysis */}
              <div className="rounded-lg bg-secondary/30 border border-border p-4 mb-4">
                <h4 className="text-sm font-bold text-foreground mb-2">💡 Análise da IA</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentBriefing.ai_analysis}</p>
              </div>

              {/* Critical Points */}
              {currentBriefing.briefing_data?.critical_points?.length > 0 && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 mb-4">
                  <h4 className="text-sm font-bold text-destructive mb-2">⚠️ Pontos Críticos</h4>
                  <ul className="space-y-1">
                    {currentBriefing.briefing_data.critical_points.map((pt: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-destructive">→</span> {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Positive Highlights */}
              {currentBriefing.positive_highlights?.length > 0 && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 mb-4">
                  <h4 className="text-sm font-bold text-green-400 mb-2">🏆 Pontos Positivos</h4>
                  <ul className="space-y-1">
                    {currentBriefing.positive_highlights.map((pt: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-400">→</span> {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Questions */}
              {currentBriefing.suggested_questions?.length > 0 && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 mb-4">
                  <h4 className="text-sm font-bold text-primary mb-2">🎯 Perguntas Sugeridas</h4>
                  <ol className="space-y-2">
                    {currentBriefing.suggested_questions.map((q: string, i: number) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="font-mono text-primary">{i + 1}.</span> {q}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Recommended Tone */}
              <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
                <h4 className="text-sm font-bold text-accent mb-2">🎤 Tom Recomendado</h4>
                <p className="text-sm text-muted-foreground">{currentBriefing.recommended_tone}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Revision Modal */}
      <AnimatePresence>
        {selectedRevision && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedRevision(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">📝 Revisão de Plano</h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Baseado em 14 dias de comportamento real
                  </p>
                </div>
                <button onClick={() => setSelectedRevision(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Analysis Summary */}
              <div className="rounded-lg bg-secondary/30 border border-border p-4 mb-4">
                <h4 className="text-sm font-bold text-foreground mb-2">📊 Resumo da Análise</h4>
                <p className="text-sm text-muted-foreground">{selectedRevision.analysis_summary}</p>
              </div>

              {/* Proposed Changes */}
              <div className="space-y-3 mb-4">
                <h4 className="text-sm font-bold text-foreground">🔄 Mudanças Propostas</h4>
                {selectedRevision.proposed_changes?.map((change: any, i: number) => (
                  <div key={i} className="rounded-lg bg-card border border-border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-muted-foreground uppercase">{change.meal_type}</span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                        change.change_type === "substituir" ? "bg-accent/20 text-accent" :
                        change.change_type === "simplificar" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-primary/20 text-primary"
                      }`}>
                        {change.change_type}
                      </span>
                    </div>
                    {change.original && (
                      <p className="text-sm text-muted-foreground line-through mb-1">❌ {change.original}</p>
                    )}
                    <p className="text-sm text-foreground mb-2">✅ {change.proposed}</p>
                    <p className="text-xs text-muted-foreground italic">{change.justification}</p>
                    {change.impact && (
                      <div className="flex gap-3 mt-2 text-[10px] font-mono">
                        <span className={change.impact.kcal > 0 ? "text-red-400" : "text-green-400"}>
                          {change.impact.kcal > 0 ? "+" : ""}{change.impact.kcal} kcal
                        </span>
                        <span className={change.impact.protein > 0 ? "text-green-400" : "text-red-400"}>
                          {change.impact.protein > 0 ? "+" : ""}{change.impact.protein}g prot
                        </span>
                        <span className="text-muted-foreground">
                          Adesão esperada: {change.impact.adherence_expected}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Impact Summary */}
              {selectedRevision.impact_summary && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 mb-4">
                  <h4 className="text-sm font-bold text-primary mb-2">📈 Impacto Total Estimado</h4>
                  <div className="flex gap-4 text-sm">
                    <span>Calorias: {selectedRevision.impact_summary.total_kcal_change > 0 ? "+" : ""}{selectedRevision.impact_summary.total_kcal_change || 0} kcal</span>
                    <span>Proteína: {selectedRevision.impact_summary.total_protein_change > 0 ? "+" : ""}{selectedRevision.impact_summary.total_protein_change || 0}g</span>
                    <span>Adesão: {selectedRevision.impact_summary.expected_adherence_improvement || "N/A"}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => approveRevision(selectedRevision.id)}
                  className="flex-1 py-3 rounded-lg bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Aprovar Revisão
                </button>
                <button
                  onClick={() => rejectRevision(selectedRevision.id)}
                  className="flex-1 py-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-sm hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeitar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function to get week start
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default ProfessionalDashboard;
