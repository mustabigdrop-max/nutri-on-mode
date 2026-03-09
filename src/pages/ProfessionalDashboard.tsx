import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Search, TrendingUp, ArrowLeft, Plus, BarChart3,
  Flame, Target, ChevronRight, UserPlus, X, Mail,
  Calendar, Activity, FileText, AlertCircle, AlertTriangle, ShieldAlert, Zap
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

interface PatientAlert {
  patientId: string;
  patientName: string;
  type: "plateau" | "deficit_agressivo" | "proteina_baixa" | "adesao_baixa" | "culpa_recorrente";
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
}

interface PatientLink {
  id: string;
  patient_id: string;
  status: string;
  notes: string | null;
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
};

const ProfessionalDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<(PatientLink & { profile?: PatientProfile })[]>([]);
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
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, goal, weight_kg, vet_kcal, protein_g, streak_days, level, xp, onboarding_completed")
      .in("user_id", patientIds);

    const merged = links.map(link => ({
      ...link,
      profile: profiles?.find(p => p.user_id === link.patient_id) as PatientProfile | undefined,
    }));

    setPatients(merged);
    setLoading(false);

    // Generate alerts for all patients
    generatePatientAlerts(merged, profiles || []);
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
            message: `Consumo médio de ${avg} kcal nos últimos 3 dias (meta: ${kcalTarget} kcal). Risco de perda muscular e desaceleração metabólica.`,
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
            message: `Proteína média de ${avg}g nos últimos 3 dias (meta: ${proteinTarget}g). Abaixo de 60% da meta.`,
            priority: 1,
            icon: "⚠️",
          });
        }
      }

      // Check plateau (weight stagnant)
      if (patientWeights.length >= 5) {
        const recent = patientWeights.slice(0, 10).map((w: any) => Number(w.weight_kg));
        const min = Math.min(...recent);
        const max = Math.max(...recent);
        if (max - min < 0.3) {
          alerts.push({
            patientId: prof.user_id,
            patientName: name,
            type: "plateau",
            message: `Peso estagnado há ${patientWeights.length}+ registros (variação < 300g). Considere revisar o plano alimentar.`,
            priority: 2,
            icon: "📊",
          });
        }
      }

      // Check culpa recorrente
      const guiltyMeals = patientMeals.filter((m: any) => m.emotion === "culpado");
      if (guiltyMeals.length >= 2) {
        alerts.push({
          patientId: prof.user_id,
          patientName: name,
          type: "culpa_recorrente",
          message: `Registrou sentimento de culpa ${guiltyMeals.length}x nos últimos 3 dias. Considere entrar em contato para apoio emocional.`,
          priority: 2,
          icon: "💬",
        });
      }

      // Check low adherence (fewer than 1 meal/day average)
      if (dates.length > 0) {
        const totalMeals = patientMeals.length;
        const avgMealsPerDay = totalMeals / Math.max(dates.length, 1);
        if (avgMealsPerDay < 1.5 && dates.length >= 2) {
          alerts.push({
            patientId: prof.user_id,
            patientName: name,
            type: "adesao_baixa",
            message: `Média de ${avgMealsPerDay.toFixed(1)} refeições/dia nos últimos ${dates.length} dias. Adesão ao registro abaixo do esperado.`,
            priority: 2,
            icon: "📉",
          });
        }
      }
    }

    // Sort by priority
    alerts.sort((a, b) => a.priority - b.priority);
    setPatientAlerts(alerts);
  };

  const handleAddPatient = async () => {
    if (!addEmail.trim() || !user) return;
    setAddLoading(true);

    // Look up user by checking profiles — we can't query auth.users
    // The professional needs to know the patient's user_id or we search by name
    // For now, we'll use a simplified approach: professional enters patient email
    // and we create the link. The patient_id will need to be resolved.
    
    // Since we can't query auth.users from client, we'll search profiles by full_name
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

    // Check limit of 30
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

    // Load last 7 days of meals
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

    // Aggregate daily stats
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

  const filteredPatients = patients.filter(p =>
    !search || (p.profile?.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedData = patients.find(p => p.patient_id === selectedPatient);
  const sp = selectedData?.profile;

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
              <h1 className="text-xl font-bold text-foreground">Painel Profissional</h1>
              <p className="text-xs text-muted-foreground font-mono">
                {patients.length}/30 pacientes
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient list */}
          <div className="lg:col-span-1">
            {/* Search */}
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
                <p className="text-xs text-muted-foreground mt-1">Clique em "Vincular" para adicionar</p>
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
                        : "border-border bg-card hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {(p.profile?.full_name || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {p.profile?.full_name || "Sem nome"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {goalLabels[p.profile?.goal || ""] || "—"} · Lv.{p.profile?.level || 1}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
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

          {/* Patient detail */}
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
                  <p className="text-muted-foreground">Selecione um paciente para ver o progresso</p>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedPatient}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Patient header */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {(sp?.full_name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-foreground">{sp?.full_name || "Paciente"}</h2>
                          <p className="text-xs text-muted-foreground font-mono">
                            {goalLabels[sp?.goal || ""] || "—"} · {sp?.weight_kg || "—"}kg · {sp?.vet_kcal || "—"} kcal/dia
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

                    {/* Quick stats */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { icon: Target, label: "Meta", value: `${sp?.vet_kcal || 0} kcal`, color: "text-primary" },
                        { icon: BarChart3, label: "Proteína", value: `${sp?.protein_g || 0}g`, color: "text-accent" },
                        { icon: Flame, label: "Streak", value: `${sp?.streak_days || 0}d`, color: "text-primary" },
                        { icon: TrendingUp, label: "XP", value: `${sp?.xp || 0}`, color: "text-accent" },
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
                          <Bar dataKey="kcal" fill="hsl(43 100% 50%)" radius={[4, 4, 0, 0]} name="Kcal" />
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
    </div>
  );
};

export default ProfessionalDashboard;
