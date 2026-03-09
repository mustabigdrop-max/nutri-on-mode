import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Search, TrendingUp, ArrowLeft, Plus, BarChart3,
  Flame, Target, ChevronRight, UserPlus, X, Mail,
  Calendar, Activity, FileText, AlertCircle, AlertTriangle, ShieldAlert, Zap,
  FileBarChart, RefreshCw, Mic, Check, XCircle, Clock, MessageSquare,
  Send, User, Utensils, ClipboardList
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
  height_cm: number | null;
  vet_kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  streak_days: number | null;
  level: number | null;
  xp: number | null;
  onboarding_completed: boolean | null;
  plano_atual: string | null;
  active_protocol: string | null;
  activity_level: string | null;
  sex: string | null;
  date_of_birth: string | null;
  meta_peso: number | null;
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

interface ManualClient {
  full_name: string;
  email: string;
  sex: string;
  date_of_birth: string;
  weight_kg: string;
  height_cm: string;
  goal: string;
  activity_level: string;
  meta_peso: string;
}

interface MealPlanItem {
  meal_type: string;
  food_name: string;
  portion: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
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

const goalOptions = [
  { value: "lose_weight", label: "Emagrecimento" },
  { value: "gain_muscle", label: "Hipertrofia" },
  { value: "definition", label: "Definição" },
  { value: "maintenance", label: "Manutenção" },
  { value: "health", label: "Saúde" },
  { value: "performance", label: "Performance" },
];

const activityOptions = [
  { value: "sedentary", label: "Sedentário" },
  { value: "light", label: "Leve" },
  { value: "moderate", label: "Moderado" },
  { value: "active", label: "Ativo" },
  { value: "very_active", label: "Muito Ativo" },
];

const mealTypes = [
  { value: "cafe_da_manha", label: "Café da Manhã" },
  { value: "lanche_manha", label: "Lanche da Manhã" },
  { value: "almoco", label: "Almoço" },
  { value: "lanche_tarde", label: "Lanche da Tarde" },
  { value: "jantar", label: "Jantar" },
  { value: "ceia", label: "Ceia" },
];

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

type DetailTab = "overview" | "plan" | "chat";

const ProfessionalDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<(PatientLink & { profile?: PatientProfile; riskScore?: RiskScore })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  // Manual client form
  const [manualClient, setManualClient] = useState<ManualClient>({
    full_name: "", email: "", sex: "M", date_of_birth: "",
    weight_kg: "", height_cm: "", goal: "lose_weight",
    activity_level: "moderate", meta_peso: "",
  });

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

  // Plan builder state
  const [planItems, setPlanItems] = useState<MealPlanItem[]>([]);
  const [newPlanItem, setNewPlanItem] = useState<MealPlanItem>({
    meal_type: "cafe_da_manha", food_name: "", portion: "",
    kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0,
  });
  const [planSaving, setPlanSaving] = useState(false);
  const [existingPlan, setExistingPlan] = useState<any[]>([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileEdits, setProfileEdits] = useState<Partial<PatientProfile>>({});

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
    
    const [profilesRes, riskRes, revisionsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, full_name, goal, weight_kg, height_cm, vet_kcal, protein_g, carbs_g, fat_g, streak_days, level, xp, onboarding_completed, plano_atual, active_protocol, activity_level, sex, date_of_birth, meta_peso")
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

    patientLinks.forEach(p => {
      if (p.riskScore?.risk_level === "high") {
        alerts.push({
          patientId: p.patient_id,
          patientName: p.profile?.full_name?.split(" ")[0] || "Paciente",
          type: "abandonment_risk",
          message: `Risco de abandono: ${p.riskScore.risk_score}% — ${p.riskScore.active_signals.length} sinais ativos.`,
          priority: 0,
          icon: "🚨",
        });
      } else if (p.riskScore?.risk_level === "medium") {
        alerts.push({
          patientId: p.patient_id,
          patientName: p.profile?.full_name?.split(" ")[0] || "Paciente",
          type: "abandonment_risk",
          message: `Risco médio: ${p.riskScore.risk_score}% — monitorar de perto.`,
          priority: 1,
          icon: "⚠️",
        });
      }
    });

    for (const prof of profiles) {
      const name = prof.full_name?.split(" ")[0] || "Paciente";
      const pMeals = allMeals.filter((m: any) => m.user_id === prof.user_id);
      const kcalTarget = prof.vet_kcal || 2000;
      const proteinTarget = prof.protein_g || 150;

      const byDate: Record<string, any[]> = {};
      pMeals.forEach((m: any) => {
        if (!byDate[m.meal_date]) byDate[m.meal_date] = [];
        byDate[m.meal_date].push(m);
      });
      const dates = Object.keys(byDate).sort().reverse().slice(0, 3);

      if (dates.length === 3) {
        const dailyKcals = dates.map(d => byDate[d].reduce((s: number, m: any) => s + (Number(m.total_kcal) || 0), 0));
        if (dailyKcals.every(k => k > 0 && k < 1000)) {
          const avg = Math.round(dailyKcals.reduce((a, b) => a + b, 0) / 3);
          alerts.push({ patientId: prof.user_id, patientName: name, type: "deficit_agressivo", message: `Consumo médio de ${avg} kcal nos últimos 3 dias (meta: ${kcalTarget} kcal).`, priority: 1, icon: "🔴" });
        }
      }

      if (dates.length >= 3) {
        const dailyProt = dates.map(d => byDate[d].reduce((s: number, m: any) => s + (Number(m.total_protein) || 0), 0));
        if (dailyProt.every(p => p > 0 && p < proteinTarget * 0.6)) {
          const avg = Math.round(dailyProt.reduce((a, b) => a + b, 0) / 3);
          alerts.push({ patientId: prof.user_id, patientName: name, type: "proteina_baixa", message: `Proteína média de ${avg}g (meta: ${proteinTarget}g).`, priority: 1, icon: "⚠️" });
        }
      }

      const guiltyMeals = pMeals.filter((m: any) => m.emotion === "culpado");
      if (guiltyMeals.length >= 2) {
        alerts.push({ patientId: prof.user_id, patientName: name, type: "culpa_recorrente", message: `Registrou culpa ${guiltyMeals.length}x nos últimos 3 dias.`, priority: 2, icon: "💬" });
      }
    }

    alerts.sort((a, b) => a.priority - b.priority);
    setPatientAlerts(alerts);
  };

  const handleAddManualClient = async () => {
    if (!manualClient.full_name.trim() || !user) return;
    setAddLoading(true);

    try {
      // Sign up client with email (if provided) or create profile directly
      if (manualClient.email.trim()) {
        // Check if user already exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("email", manualClient.email.trim())
          .maybeSingle();

        if (existingProfile) {
          // Link existing user
          const { error: linkErr } = await supabase
            .from("professional_patients")
            .insert({ professional_id: user.id, patient_id: existingProfile.user_id });

          if (linkErr) {
            if (linkErr.code === "23505") toast.error("Cliente já vinculado.");
            else toast.error("Erro ao vincular.");
          } else {
            // Update their profile with provided data
            const updates: any = {};
            if (manualClient.weight_kg) updates.weight_kg = Number(manualClient.weight_kg);
            if (manualClient.height_cm) updates.height_cm = Number(manualClient.height_cm);
            if (manualClient.goal) updates.goal = manualClient.goal;
            if (manualClient.activity_level) updates.activity_level = manualClient.activity_level;
            if (manualClient.meta_peso) updates.meta_peso = Number(manualClient.meta_peso);
            if (manualClient.sex) updates.sex = manualClient.sex;
            if (manualClient.date_of_birth) updates.date_of_birth = manualClient.date_of_birth;

            if (Object.keys(updates).length > 0) {
              await supabase.from("profiles").update(updates).eq("user_id", existingProfile.user_id);
            }

            toast.success(`${manualClient.full_name} vinculado com sucesso!`);
          }
        } else {
          // Try to find by name
          const { data: foundByName } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .ilike("full_name", `%${manualClient.full_name.trim()}%`)
            .limit(1);

          if (foundByName && foundByName.length > 0) {
            const { error: linkErr } = await supabase
              .from("professional_patients")
              .insert({ professional_id: user.id, patient_id: foundByName[0].user_id });

            if (linkErr) {
              if (linkErr.code === "23505") toast.error("Cliente já vinculado.");
              else toast.error("Erro ao vincular.");
            } else {
              toast.success(`${foundByName[0].full_name} vinculado!`);
            }
          } else {
            toast.error("Cliente não encontrado. O cliente precisa ter uma conta no nutriON.");
          }
        }
      } else {
        // Search by name only
        const { data: foundByName } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .ilike("full_name", `%${manualClient.full_name.trim()}%`)
          .limit(1);

        if (foundByName && foundByName.length > 0) {
          if (patients.length >= 30) {
            toast.error("Limite de 30 clientes atingido.");
            setAddLoading(false);
            return;
          }
          const { error: linkErr } = await supabase
            .from("professional_patients")
            .insert({ professional_id: user.id, patient_id: foundByName[0].user_id });

          if (linkErr) {
            if (linkErr.code === "23505") toast.error("Cliente já vinculado.");
            else toast.error("Erro ao vincular.");
          } else {
            toast.success(`${foundByName[0].full_name} vinculado!`);
          }
        } else {
          toast.error("Cliente não encontrado. O cliente precisa ter uma conta no nutriON.");
        }
      }

      setManualClient({ full_name: "", email: "", sex: "M", date_of_birth: "", weight_kg: "", height_cm: "", goal: "lose_weight", activity_level: "moderate", meta_peso: "" });
      setShowAddModal(false);
      fetchPatients();
    } catch (e: any) {
      toast.error("Erro ao adicionar cliente.");
    }
    setAddLoading(false);
  };

  const loadPatientDetail = async (patientId: string) => {
    setSelectedPatient(patientId);
    setActiveTab("overview");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split("T")[0];

    const weekStart = getWeekStart(new Date()).toISOString().split("T")[0];

    const [mealsRes, weightsRes, planRes, chatRes] = await Promise.all([
      supabase.from("meal_logs").select("*").eq("user_id", patientId).gte("meal_date", dateStr).order("meal_date", { ascending: true }),
      supabase.from("weight_logs").select("*").eq("user_id", patientId).order("logged_at", { ascending: true }).limit(30),
      supabase.from("meal_plan_items").select("*").eq("user_id", patientId).eq("week_start", weekStart).order("day_index").order("meal_type"),
      supabase.from("coach_briefings").select("ai_analysis, created_at").eq("patient_id", patientId).eq("coach_id", user!.id).order("created_at", { ascending: false }).limit(20),
    ]);

    setPatientMeals(mealsRes.data || []);
    setPatientWeights(weightsRes.data || []);
    setExistingPlan(planRes.data || []);

    // Use coach_briefings as a simple chat-like message log
    setChatMessages((chatRes.data || []).map((b: any) => ({
      content: b.ai_analysis || "",
      created_at: b.created_at,
      sender: "coach",
    })));

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
    await supabase.from("professional_patients").delete().eq("id", linkId);
    toast.success("Cliente removido.");
    setSelectedPatient(null);
    fetchPatients();
  };

  const generateBriefing = async () => {
    if (!selectedPatient || !user) return;
    setBriefingLoading(true);
    const weekStart = getWeekStart(new Date()).toISOString().split("T")[0];
    try {
      const { data, error } = await supabase.functions.invoke("generate-coach-briefing", {
        body: { coachId: user.id, patientId: selectedPatient, weekStart },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCurrentBriefing({
        id: "new", patient_id: selectedPatient, week_start: weekStart,
        briefing_data: data.briefing, ai_analysis: data.briefing.ai_analysis,
        suggested_questions: data.briefing.suggested_questions, suggested_adjustments: data.briefing.suggested_adjustments,
        recommended_tone: data.briefing.recommended_tone, risk_level: data.briefing.risk_level,
        positive_highlights: data.briefing.positive_highlights, status: "pending",
      });
      setShowBriefingModal(true);
      toast.success("Briefing gerado! 📋");
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar briefing");
    }
    setBriefingLoading(false);
  };

  const generatePlanRevision = async () => {
    if (!selectedPatient || !user) return;
    setRevisionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-plan-revision", {
        body: { userId: selectedPatient, coachId: user.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSelectedRevision({
        id: data.revision.id, user_id: selectedPatient,
        analysis_summary: data.revision.analysis, proposed_changes: data.revision.changes,
        impact_summary: data.revision.impact, status: "pending", created_at: new Date().toISOString(),
      });
      toast.success("Revisão de plano gerada! 📝");
      fetchPatients();
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar revisão");
    }
    setRevisionLoading(false);
  };

  const approveRevision = async (revisionId: string) => {
    const { error } = await supabase.from("plan_revisions").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", revisionId);
    if (!error) { toast.success("Revisão aprovada! ✅"); setSelectedRevision(null); fetchPatients(); }
  };

  const rejectRevision = async (revisionId: string) => {
    const { error } = await supabase.from("plan_revisions").update({ status: "rejected" }).eq("id", revisionId);
    if (!error) { toast.success("Revisão rejeitada."); setSelectedRevision(null); fetchPatients(); }
  };

  // Plan builder functions
  const addPlanItem = () => {
    if (!newPlanItem.food_name.trim()) return;
    setPlanItems(prev => [...prev, { ...newPlanItem }]);
    setNewPlanItem({ meal_type: newPlanItem.meal_type, food_name: "", portion: "", kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  };

  const removePlanItem = (index: number) => {
    setPlanItems(prev => prev.filter((_, i) => i !== index));
  };

  const savePlan = async () => {
    if (!selectedPatient || planItems.length === 0) return;
    setPlanSaving(true);
    const weekStart = getWeekStart(new Date()).toISOString().split("T")[0];

    // Delete existing plan for this week
    await supabase.from("meal_plan_items").delete().eq("user_id", selectedPatient).eq("week_start", weekStart);

    // Insert new items
    const rows = planItems.map((item, i) => ({
      user_id: selectedPatient,
      week_start: weekStart,
      day_index: 0, // Day 0 = template for all days
      meal_type: item.meal_type,
      food_name: item.food_name,
      portion: item.portion,
      kcal: item.kcal,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
    }));

    const { error } = await supabase.from("meal_plan_items").insert(rows);
    if (error) {
      toast.error("Erro ao salvar plano.");
    } else {
      toast.success(`Plano salvo com ${planItems.length} itens! 🍽️`);
      setExistingPlan(rows);
    }
    setPlanSaving(false);
  };

  // Update patient profile
  const saveProfileEdits = async () => {
    if (!selectedPatient) return;
    const updates: any = { ...profileEdits };
    const { error } = await supabase.from("profiles").update(updates).eq("user_id", selectedPatient);
    if (!error) {
      toast.success("Perfil atualizado!");
      setEditingProfile(false);
      fetchPatients();
      loadPatientDetail(selectedPatient);
    } else {
      toast.error("Erro ao atualizar perfil.");
    }
  };

  // Send chat message (stores as notes in professional_patients)
  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selectedPatient || !user) return;
    setChatSending(true);

    // Store the message as a note update
    const existingLink = patients.find(p => p.patient_id === selectedPatient);
    if (existingLink) {
      const existingNotes = existingLink.notes ? JSON.parse(existingLink.notes) : [];
      const newNote = { content: chatInput.trim(), timestamp: new Date().toISOString(), sender: "coach" };
      const updatedNotes = [...(Array.isArray(existingNotes) ? existingNotes : []), newNote];

      await supabase.from("professional_patients")
        .update({ notes: JSON.stringify(updatedNotes) })
        .eq("id", existingLink.id);

      setChatMessages(prev => [...prev, { content: chatInput.trim(), created_at: new Date().toISOString(), sender: "coach" }]);
      setChatInput("");
      fetchPatients();
    }
    setChatSending(false);
  };

  const filteredPatients = patients.filter(p =>
    !search || (p.profile?.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedData = patients.find(p => p.patient_id === selectedPatient);
  const sp = selectedData?.profile;
  const patientRevision = pendingRevisions.find(r => r.user_id === selectedPatient);

  const planTotals = useMemo(() => {
    return planItems.reduce((acc, item) => ({
      kcal: acc.kcal + item.kcal,
      protein: acc.protein + item.protein_g,
      carbs: acc.carbs + item.carbs_g,
      fat: acc.fat + item.fat_g,
    }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  }, [planItems]);

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
                {patients.length}/30 clientes · {pendingRevisions.length} revisões pendentes
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm glow-gold hover:scale-[1.02] transition-transform"
          >
            <UserPlus className="w-4 h-4" />
            Adicionar Cliente
          </button>
        </div>

        {/* Patient Alerts Panel */}
        {patientAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-destructive" />
              <h2 className="text-sm font-bold text-foreground">Alertas</h2>
              <span className="text-[10px] font-mono text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">{patientAlerts.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {patientAlerts.slice(0, 6).map((alert, i) => (
                <motion.div
                  key={`${alert.patientId}-${alert.type}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border p-3 cursor-pointer transition-all hover:scale-[1.01] ${
                    alert.priority === 0 ? "border-red-500/30 bg-red-500/5"
                    : alert.priority === 1 ? "border-destructive/30 bg-destructive/5"
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
                          alert.priority === 0 ? "bg-red-500/20 text-red-400"
                          : alert.priority === 1 ? "bg-destructive/20 text-destructive"
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
          {/* Patient list */}
          <div className="lg:col-span-1">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            {filteredPatients.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/50 p-8 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum cliente vinculado</p>
                <button onClick={() => setShowAddModal(true)} className="mt-3 text-xs text-primary font-semibold">
                  + Adicionar primeiro cliente
                </button>
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
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        p.riskScore?.risk_level === "high" ? "bg-red-500/20 text-red-400"
                        : p.riskScore?.risk_level === "medium" ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-primary/10 text-primary"
                      }`}>
                        {(p.profile?.full_name || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {p.profile?.full_name || "Sem nome"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {goalLabels[p.profile?.goal || ""] || "—"} · {p.profile?.weight_kg || "—"}kg
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {(p.profile?.streak_days || 0) > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-primary font-mono">
                            <Flame className="w-3 h-3" />{p.profile?.streak_days}
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

          {/* Patient detail with tabs */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!selectedPatient ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card/30 p-12 text-center">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Selecione um cliente para gerenciar</p>
                </motion.div>
              ) : (
                <motion.div key={selectedPatient} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  {/* Patient header */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          selectedData?.riskScore?.risk_level === "high" ? "bg-red-500/20 text-red-400"
                          : selectedData?.riskScore?.risk_level === "medium" ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-primary/10 text-primary"
                        }`}>
                          {(sp?.full_name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-foreground">{sp?.full_name || "Cliente"}</h2>
                          <p className="text-xs text-muted-foreground font-mono">
                            {goalLabels[sp?.goal || ""] || "—"} · {sp?.weight_kg || "—"}kg · {sp?.vet_kcal || "—"} kcal/dia
                          </p>
                        </div>
                      </div>
                      <button onClick={() => removePatient(selectedData!.id)} className="p-2 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors" title="Remover cliente">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-secondary/50 rounded-lg p-1 mb-4">
                      {([
                        { key: "overview" as DetailTab, label: "Visão Geral", icon: BarChart3 },
                        { key: "plan" as DetailTab, label: "Montar Plano", icon: ClipboardList },
                        { key: "chat" as DetailTab, label: "Mensagens", icon: MessageSquare },
                      ]).map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${
                            activeTab === tab.key
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <tab.icon className="w-3.5 h-3.5" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Coach quick actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                      <button onClick={generateBriefing} disabled={briefingLoading} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50">
                        <FileBarChart className="w-4 h-4" />
                        <span className="text-xs font-semibold">{briefingLoading ? "Gerando..." : "Briefing"}</span>
                      </button>
                      <button onClick={generatePlanRevision} disabled={revisionLoading || !!patientRevision} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50">
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-xs font-semibold">{revisionLoading ? "Analisando..." : "Revisar Plano"}</span>
                      </button>
                      <button onClick={() => { setEditingProfile(!editingProfile); setProfileEdits(sp || {}); }} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors">
                        <User className="w-4 h-4" />
                        <span className="text-xs font-semibold">Editar Perfil</span>
                      </button>
                      <button onClick={() => setActiveTab("plan")} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors">
                        <Utensils className="w-4 h-4" />
                        <span className="text-xs font-semibold">Plano Alimentar</span>
                      </button>
                    </div>

                    {/* Pending revision alert */}
                    {patientRevision && (
                      <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 mb-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-accent" />
                            <span className="text-sm font-semibold text-accent">Revisão Pendente</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setSelectedRevision(patientRevision)} className="text-xs font-mono bg-accent/20 text-accent px-3 py-1 rounded hover:bg-accent/30">Ver</button>
                            <button onClick={() => approveRevision(patientRevision.id)} className="text-xs font-mono bg-green-500/20 text-green-400 px-3 py-1 rounded hover:bg-green-500/30">Aprovar ✅</button>
                            <button onClick={() => rejectRevision(patientRevision.id)} className="text-xs font-mono bg-red-500/20 text-red-400 px-3 py-1 rounded hover:bg-red-500/30">Rejeitar ❌</button>
                          </div>
                        </div>
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

                  {/* Profile editing modal inline */}
                  {editingProfile && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl border border-primary/20 bg-card p-4">
                      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" /> Editar Perfil do Cliente
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">Peso (kg)</label>
                          <input type="number" value={profileEdits.weight_kg || ""} onChange={e => setProfileEdits(p => ({ ...p, weight_kg: Number(e.target.value) }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">Altura (cm)</label>
                          <input type="number" value={profileEdits.height_cm || ""} onChange={e => setProfileEdits(p => ({ ...p, height_cm: Number(e.target.value) }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">Meta Peso (kg)</label>
                          <input type="number" value={profileEdits.meta_peso || ""} onChange={e => setProfileEdits(p => ({ ...p, meta_peso: Number(e.target.value) }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">VET (kcal)</label>
                          <input type="number" value={profileEdits.vet_kcal || ""} onChange={e => setProfileEdits(p => ({ ...p, vet_kcal: Number(e.target.value) }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">Proteína (g)</label>
                          <input type="number" value={profileEdits.protein_g || ""} onChange={e => setProfileEdits(p => ({ ...p, protein_g: Number(e.target.value) }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">Carbo (g)</label>
                          <input type="number" value={profileEdits.carbs_g || ""} onChange={e => setProfileEdits(p => ({ ...p, carbs_g: Number(e.target.value) }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">Gordura (g)</label>
                          <input type="number" value={profileEdits.fat_g || ""} onChange={e => setProfileEdits(p => ({ ...p, fat_g: Number(e.target.value) }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">Objetivo</label>
                          <select value={profileEdits.goal || ""} onChange={e => setProfileEdits(p => ({ ...p, goal: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50">
                            {goalOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">Protocolo</label>
                          <select value={profileEdits.active_protocol || ""} onChange={e => setProfileEdits(p => ({ ...p, active_protocol: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50">
                            <option value="">Nenhum</option>
                            <option value="low_carb">Low Carb</option>
                            <option value="cetogenica">Cetogênica</option>
                            <option value="jejum_intermitente">Jejum Intermitente</option>
                            <option value="atleta">Atleta/BB</option>
                            <option value="vegano">Vegano</option>
                            <option value="mediterranea">Mediterrânea</option>
                            <option value="dash">DASH</option>
                            <option value="anti_inflamatoria">Anti-inflamatória</option>
                            <option value="flexivel">Flexível</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={saveProfileEdits} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Salvar</button>
                        <button onClick={() => setEditingProfile(false)} className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm">Cancelar</button>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: Overview */}
                  {activeTab === "overview" && (
                    <>
                      {/* Weekly calorie chart */}
                      <div className="rounded-xl border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />Calorias — Últimos 7 dias
                        </h3>
                        {weeklyStats.length === 0 ? (
                          <div className="text-center py-8">
                            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Sem dados recentes</p>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={weeklyStats}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))", fontSize: 12 }} />
                              <Bar dataKey="kcal" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Kcal" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      {/* Protein chart */}
                      <div className="rounded-xl border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-accent" />Proteína — Últimos 7 dias
                        </h3>
                        {weeklyStats.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
                        ) : (
                          <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={weeklyStats}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))", fontSize: 12 }} />
                              <Line type="monotone" dataKey="protein" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))", r: 3 }} name="Proteína (g)" />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      {/* Weight evolution */}
                      {patientWeights.length > 0 && (
                        <div className="rounded-xl border border-border bg-card p-4">
                          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />Evolução de Peso
                          </h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={patientWeights.map(w => ({ date: new Date(w.logged_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), peso: w.weight_kg }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={["auto", "auto"]} />
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))", fontSize: 12 }} />
                              <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} name="Peso (kg)" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Recent meals */}
                      <div className="rounded-xl border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Refeições Recentes</h3>
                        {patientMeals.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">Sem refeições registradas</p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {patientMeals.slice(-10).reverse().map(meal => (
                              <div key={meal.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                <div>
                                  <span className="text-sm font-medium text-foreground capitalize">{meal.meal_type.replace(/_/g, " ")}</span>
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
                    </>
                  )}

                  {/* TAB: Plan Builder */}
                  {activeTab === "plan" && (
                    <div className="space-y-4">
                      {/* Existing plan */}
                      {existingPlan.length > 0 && (
                        <div className="rounded-xl border border-border bg-card p-4">
                          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-primary" />Plano Atual da Semana
                          </h3>
                          <div className="space-y-2">
                            {existingPlan.map((item: any, i: number) => (
                              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                <div>
                                  <span className="text-[10px] font-mono text-primary uppercase">{mealTypes.find(m => m.value === item.meal_type)?.label || item.meal_type}</span>
                                  <p className="text-sm text-foreground">{item.food_name} <span className="text-muted-foreground">· {item.portion}</span></p>
                                </div>
                                <div className="text-right text-xs font-mono text-muted-foreground">
                                  {item.kcal}kcal · {item.protein_g}P · {item.carbs_g}C · {item.fat_g}G
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New plan builder */}
                      <div className="rounded-xl border border-primary/20 bg-card p-4">
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                          <Plus className="w-4 h-4 text-primary" />Montar Novo Plano
                        </h3>

                        {/* Add item form */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                          <select value={newPlanItem.meal_type} onChange={e => setNewPlanItem(p => ({ ...p, meal_type: e.target.value }))} className="px-2 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs focus:outline-none focus:border-primary/50">
                            {mealTypes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                          <input type="text" placeholder="Alimento..." value={newPlanItem.food_name} onChange={e => setNewPlanItem(p => ({ ...p, food_name: e.target.value }))} className="px-2 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                          <input type="text" placeholder="Porção..." value={newPlanItem.portion} onChange={e => setNewPlanItem(p => ({ ...p, portion: e.target.value }))} className="px-2 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                          <button onClick={addPlanItem} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1">
                            <Plus className="w-3 h-3" />Adicionar
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          <input type="number" placeholder="Kcal" value={newPlanItem.kcal || ""} onChange={e => setNewPlanItem(p => ({ ...p, kcal: Number(e.target.value) }))} className="px-2 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                          <input type="number" placeholder="Prot (g)" value={newPlanItem.protein_g || ""} onChange={e => setNewPlanItem(p => ({ ...p, protein_g: Number(e.target.value) }))} className="px-2 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                          <input type="number" placeholder="Carb (g)" value={newPlanItem.carbs_g || ""} onChange={e => setNewPlanItem(p => ({ ...p, carbs_g: Number(e.target.value) }))} className="px-2 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                          <input type="number" placeholder="Gord (g)" value={newPlanItem.fat_g || ""} onChange={e => setNewPlanItem(p => ({ ...p, fat_g: Number(e.target.value) }))} className="px-2 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                        </div>

                        {/* Items list */}
                        {planItems.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {planItems.map((item, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 border border-border">
                                <div>
                                  <span className="text-[10px] font-mono text-primary uppercase">{mealTypes.find(m => m.value === item.meal_type)?.label}</span>
                                  <p className="text-sm text-foreground">{item.food_name} · {item.portion}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono text-muted-foreground">{item.kcal}kcal · {item.protein_g}P · {item.carbs_g}C · {item.fat_g}G</span>
                                  <button onClick={() => removePlanItem(i)} className="text-destructive/60 hover:text-destructive"><X className="w-3 h-3" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Totals */}
                        {planItems.length > 0 && (
                          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">Total do Plano</span>
                              <div className="flex gap-3 text-xs font-mono">
                                <span className="text-primary">{planTotals.kcal} kcal</span>
                                <span className="text-accent">{planTotals.protein}g P</span>
                                <span className="text-muted-foreground">{planTotals.carbs}g C</span>
                                <span className="text-muted-foreground">{planTotals.fat}g G</span>
                              </div>
                            </div>
                            {sp?.vet_kcal && (
                              <p className="text-[10px] text-muted-foreground mt-1">
                                Meta do cliente: {sp.vet_kcal} kcal · Diferença: {planTotals.kcal - (sp.vet_kcal || 0)} kcal
                              </p>
                            )}
                          </div>
                        )}

                        <button onClick={savePlan} disabled={planSaving || planItems.length === 0} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" />
                          {planSaving ? "Salvando..." : `Salvar Plano (${planItems.length} itens)`}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB: Chat */}
                  {activeTab === "chat" && (
                    <div className="rounded-xl border border-border bg-card p-4">
                      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />Mensagens para {sp?.full_name?.split(" ")[0] || "Cliente"}
                      </h3>

                      <div className="max-h-80 overflow-y-auto space-y-3 mb-4">
                        {chatMessages.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem ainda. Envie um feedback ou orientação.</p>
                        ) : (
                          chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === "coach" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[80%] rounded-lg p-3 ${msg.sender === "coach" ? "bg-primary/10 border border-primary/20" : "bg-secondary border border-border"}`}>
                                <p className="text-sm text-foreground">{msg.content}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {new Date(msg.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enviar feedback, orientação..."
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && sendChatMessage()}
                          className="flex-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                        />
                        <button onClick={sendChatMessage} disabled={chatSending || !chatInput.trim()} className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-xl border border-border bg-card p-6 my-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Adicionar Cliente</h3>
                <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Preencha os dados do cliente. Ele precisa ter uma conta no nutriON para ser vinculado.
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-mono uppercase">Nome completo *</label>
                    <input type="text" placeholder="Ex: João Silva" value={manualClient.full_name} onChange={e => setManualClient(p => ({ ...p, full_name: e.target.value }))} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-mono uppercase">Email</label>
                    <input type="email" placeholder="email@exemplo.com" value={manualClient.email} onChange={e => setManualClient(p => ({ ...p, email: e.target.value }))} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-mono uppercase">Sexo</label>
                    <select value={manualClient.sex} onChange={e => setManualClient(p => ({ ...p, sex: e.target.value }))} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50">
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-mono uppercase">Peso (kg)</label>
                    <input type="number" placeholder="80" value={manualClient.weight_kg} onChange={e => setManualClient(p => ({ ...p, weight_kg: e.target.value }))} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-mono uppercase">Altura (cm)</label>
                    <input type="number" placeholder="175" value={manualClient.height_cm} onChange={e => setManualClient(p => ({ ...p, height_cm: e.target.value }))} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-mono uppercase">Objetivo</label>
                    <select value={manualClient.goal} onChange={e => setManualClient(p => ({ ...p, goal: e.target.value }))} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50">
                      {goalOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-mono uppercase">Nível de Atividade</label>
                    <select value={manualClient.activity_level} onChange={e => setManualClient(p => ({ ...p, activity_level: e.target.value }))} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50">
                      {activityOptions.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-mono uppercase">Data de Nascimento</label>
                    <input type="date" value={manualClient.date_of_birth} onChange={e => setManualClient(p => ({ ...p, date_of_birth: e.target.value }))} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-mono uppercase">Meta Peso (kg)</label>
                    <input type="number" placeholder="70" value={manualClient.meta_peso} onChange={e => setManualClient(p => ({ ...p, meta_peso: e.target.value }))} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
              </div>

              <button onClick={handleAddManualClient} disabled={addLoading || !manualClient.full_name.trim()} className="w-full mt-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm glow-gold disabled:opacity-50 flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />
                {addLoading ? "Buscando..." : "Vincular Cliente"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Briefing Modal */}
      <AnimatePresence>
        {showBriefingModal && currentBriefing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowBriefingModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">📋 Briefing Semanal</h3>
                  <p className="text-xs text-muted-foreground font-mono">{currentBriefing.briefing_data?.patient_name} · Semana de {currentBriefing.week_start}</p>
                </div>
                <button onClick={() => setShowBriefingModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>

              <div className={`rounded-lg p-4 mb-4 ${RISK_BG[currentBriefing.risk_level]}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${RISK_COLORS[currentBriefing.risk_level]}`}>Nível de Risco: {currentBriefing.risk_level.toUpperCase()}</span>
                  <span className="text-xs text-muted-foreground font-mono">{currentBriefing.briefing_data?.adherence_rate || 0}% adesão</span>
                </div>
              </div>

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

              <div className="rounded-lg bg-secondary/30 border border-border p-4 mb-4">
                <h4 className="text-sm font-bold text-foreground mb-2">💡 Análise da IA</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentBriefing.ai_analysis}</p>
              </div>

              {currentBriefing.positive_highlights?.length > 0 && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 mb-4">
                  <h4 className="text-sm font-bold text-green-400 mb-2">🏆 Pontos Positivos</h4>
                  <ul className="space-y-1">
                    {currentBriefing.positive_highlights.map((pt: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-green-400">→</span> {pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentBriefing.suggested_questions?.length > 0 && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 mb-4">
                  <h4 className="text-sm font-bold text-primary mb-2">🎯 Perguntas Sugeridas</h4>
                  <ol className="space-y-2">
                    {currentBriefing.suggested_questions.map((q: string, i: number) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2"><span className="font-mono text-primary">{i + 1}.</span> {q}</li>
                    ))}
                  </ol>
                </div>
              )}

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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedRevision(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">📝 Revisão de Plano</h3>
                  <p className="text-xs text-muted-foreground font-mono">Baseado em 14 dias de comportamento real</p>
                </div>
                <button onClick={() => setSelectedRevision(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>

              <div className="rounded-lg bg-secondary/30 border border-border p-4 mb-4">
                <h4 className="text-sm font-bold text-foreground mb-2">📊 Resumo da Análise</h4>
                <p className="text-sm text-muted-foreground">{selectedRevision.analysis_summary}</p>
              </div>

              <div className="space-y-3 mb-4">
                <h4 className="text-sm font-bold text-foreground">🔄 Mudanças Propostas</h4>
                {selectedRevision.proposed_changes?.map((change: any, i: number) => (
                  <div key={i} className="rounded-lg bg-card border border-border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-muted-foreground uppercase">{change.meal_type}</span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${change.change_type === "substituir" ? "bg-accent/20 text-accent" : change.change_type === "simplificar" ? "bg-yellow-500/20 text-yellow-400" : "bg-primary/20 text-primary"}`}>{change.change_type}</span>
                    </div>
                    {change.original && <p className="text-sm text-muted-foreground line-through mb-1">❌ {change.original}</p>}
                    <p className="text-sm text-foreground mb-2">✅ {change.proposed}</p>
                    <p className="text-xs text-muted-foreground italic">{change.justification}</p>
                  </div>
                ))}
              </div>

              {selectedRevision.impact_summary && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 mb-4">
                  <h4 className="text-sm font-bold text-primary mb-2">📈 Impacto Estimado</h4>
                  <div className="flex gap-4 text-sm">
                    <span>Calorias: {selectedRevision.impact_summary.total_kcal_change > 0 ? "+" : ""}{selectedRevision.impact_summary.total_kcal_change || 0} kcal</span>
                    <span>Proteína: {selectedRevision.impact_summary.total_protein_change > 0 ? "+" : ""}{selectedRevision.impact_summary.total_protein_change || 0}g</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => approveRevision(selectedRevision.id)} className="flex-1 py-3 rounded-lg bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />Aprovar
                </button>
                <button onClick={() => rejectRevision(selectedRevision.id)} className="flex-1 py-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-sm hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" />Rejeitar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default ProfessionalDashboard;
