import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Check, Brain, FileText, AlertTriangle, MessageSquare, User, Activity, Shield, Utensils, RefreshCw, Loader2, ChevronLeft, ChevronRight, Trophy, Plus, Pencil, Trash2, X, Save, Bell, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import CoachAccessManager from "@/components/acompanhado/CoachAccessManager";
import CoachCompetitionWizard from "@/components/coach/CoachCompetitionWizard";
import CoachWeekMealGrid from "@/components/coach/CoachWeekMealGrid";
import CoachCheckinsTab from "@/components/coach/CoachCheckinsTab";
import ProtocolGanttChart from "@/components/coach/ProtocolGanttChart";

const MEAL_TYPES = [
  { key: "cafe_manha", label: "☕ Café" },
  { key: "lanche_manha", label: "🍎 Lanche AM" },
  { key: "almoco", label: "🍽️ Almoço" },
  { key: "lanche_tarde", label: "🥤 Lanche PM" },
  { key: "jantar", label: "🌙 Jantar" },
  { key: "ceia", label: "🫖 Ceia" },
];
const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}
function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().split("T")[0];
}
function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + "T12:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

interface PlanItem {
  id: string;
  user_id: string;
  week_start: string;
  day_index: number;
  meal_type: string;
  food_name: string;
  portion: string | null;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confirmed: boolean;
  swapped: boolean;
  original_food_name: string | null;
  coach_edited?: boolean;
  coach_note?: string | null;
}

const CoachPatientDetailPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { profile } = useCoachProfile();

  const [patient, setPatient] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [mealLogs, setMealLogs] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Meal plan state
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  });
  const [planLoading, setPlanLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<PlanItem>>({});
  const [dayNotes, setDayNotes] = useState<Record<number, string>>({});
  const [savingNotify, setSavingNotify] = useState(false);

  // Competition Mode state
  const [competitionPlans, setCompetitionPlans] = useState<any[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);

  const loadCompetitionPlans = async () => {
    if (!profile || !patientId) return;
    const { data } = await supabase
      .from("competition_plans" as any)
      .select("id, nome_competicao, federacao, categoria, data_competicao, status, peso_atual, peso_alvo_palco")
      .eq("coach_id", profile.id)
      .eq("athlete_id", patientId)
      .order("data_competicao", { ascending: true });
    setCompetitionPlans((data as any[]) || []);
  };

  useEffect(() => {
    if (!profile || !patientId) return;
    loadPatientData();
  }, [profile, patientId]);

  useEffect(() => {
    if (patientId) fetchMealPlan();
  }, [patientId, weekStart]);

  const loadPatientData = async () => {
    if (!profile || !patientId) return;

    const [profileRes, scoresRes, alertsRes, messagesRes, mealsRes, examsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", patientId).maybeSingle(),
      supabase.from("consistency_scores").select("*").eq("user_id", patientId).order("created_at", { ascending: false }).limit(30),
      supabase.from("coach_alerts").select("*").eq("coach_id", profile.id).eq("patient_user_id", patientId).order("created_at", { ascending: false }),
      supabase.from("coach_messages").select("*").eq("coach_id", profile.id).eq("patient_user_id", patientId).order("created_at", { ascending: true }),
      supabase.from("meal_logs").select("*").eq("user_id", patientId).order("created_at", { ascending: false }).limit(14),
      supabase.from("blood_tests").select("*").eq("user_id", patientId).order("created_at", { ascending: false }),
    ]);

    setPatient(profileRes.data);
    setScores(scoresRes.data || []);
    setAlerts(alertsRes.data || []);
    setMessages(messagesRes.data || []);
    setMealLogs(mealsRes.data || []);
    setExams(examsRes.data || []);
    setLoading(false);
    loadCompetitionPlans();
  };

  const fetchMealPlan = async () => {
    if (!patientId) return;
    setPlanLoading(true);
    const { data } = await supabase
      .from("meal_plan_items")
      .select("*")
      .eq("user_id", patientId)
      .eq("week_start", weekStart);
    setPlanItems((data as PlanItem[] | null) ?? []);
    setPlanLoading(false);
  };

  const generateMealPlanForPatient = async () => {
    if (!patientId || !patient) return;
    setGenerating(true);
    try {
      const { data: workoutData } = await supabase
        .from("workout_schedule")
        .select("day_of_week, workout_type, workout_time, duration_minutes, slot")
        .eq("user_id", patientId);

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          profile: patient,
          weekStart,
          budgetMode: false,
          workoutSchedule: workoutData || [],
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Delete existing plan for this patient
      await supabase
        .from("meal_plan_items")
        .delete()
        .eq("user_id", patientId)
        .eq("week_start", weekStart);

      // Insert new items with patient's user_id
      const newItems: any[] = [];
      for (const day of data.days) {
        for (const meal of day.meals) {
          newItems.push({
            user_id: patientId,
            week_start: weekStart,
            day_index: day.day_index,
            meal_type: meal.meal_type,
            food_name: meal.food_name,
            portion: meal.portion,
            kcal: meal.kcal,
            protein_g: meal.protein_g,
            carbs_g: meal.carbs_g,
            fat_g: meal.fat_g,
            confirmed: false,
            swapped: false,
          });
        }
      }
      await supabase.from("meal_plan_items").insert(newItems);
      toast({ title: "Plano alimentar gerado! 🤖✨", description: `Semana ${formatWeekRange(weekStart)} criada para ${patient.full_name}` });
      await fetchMealPlan();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro ao gerar plano", description: e.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  const startEdit = (item: PlanItem) => {
    setEditingId(item.id);
    setDraft({
      food_name: item.food_name,
      portion: item.portion,
      kcal: item.kcal,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
      coach_note: item.coach_note ?? "",
    });
  };

  const saveEdit = async (id: string) => {
    const payload: any = {
      food_name: draft.food_name,
      portion: draft.portion,
      kcal: Number(draft.kcal) || 0,
      protein_g: Number(draft.protein_g) || 0,
      carbs_g: Number(draft.carbs_g) || 0,
      fat_g: Number(draft.fat_g) || 0,
      coach_note: draft.coach_note || null,
      coach_edited: true,
    };
    const { error } = await supabase.from("meal_plan_items").update(payload).eq("id", id);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    setEditingId(null);
    setDraft({});
    await fetchMealPlan();
    toast({ title: "Item atualizado ✏️" });
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("meal_plan_items").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
      return;
    }
    await fetchMealPlan();
  };

  const addItem = async (mealType: string) => {
    if (!patientId) return;
    const { error } = await supabase.from("meal_plan_items").insert({
      user_id: patientId,
      week_start: weekStart,
      day_index: selectedDay,
      meal_type: mealType,
      food_name: "Novo alimento",
      portion: "100g",
      kcal: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      coach_edited: true,
    } as any);
    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
      return;
    }
    await fetchMealPlan();
  };

  const saveAndNotify = async () => {
    if (!profile || !patientId) return;
    setSavingNotify(true);
    const { error } = await supabase.from("coach_messages").insert({
      coach_id: profile.id,
      patient_user_id: patientId,
      sender: "coach",
      message: "Seu plano da semana foi atualizado. Confira as novidades! 🍽️",
    });
    setSavingNotify(false);
    if (error) {
      toast({ title: "Erro ao notificar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Paciente notificado ✅" });
  };
  const sendMessage = async () => {
    if (!newMessage.trim() || !profile || !patientId) return;
    setSending(true);
    await supabase.from("coach_messages").insert({
      coach_id: profile.id,
      patient_user_id: patientId,
      sender: "coach",
      message: newMessage,
    });
    setNewMessage("");
    setSending(false);
    loadPatientData();
  };

  const resolveAlert = async (alertId: string) => {
    await supabase.from("coach_alerts").update({ resolved: true, resolved_at: new Date().toISOString() }).eq("id", alertId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast({ title: "Alerta resolvido ✅" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const latestScore = scores[0]?.total_score ?? 0;
  const adherencePct = mealLogs.length > 0 ? Math.round((mealLogs.filter(m => m.confirmed).length / mealLogs.length) * 100) : 0;

  const dayItems = planItems.filter(i => i.day_index === selectedDay);
  const dayTotals = dayItems.reduce((a, i) => ({
    kcal: a.kcal + (i.kcal || 0),
    protein: a.protein + (i.protein_g || 0),
    carbs: a.carbs + (i.carbs_g || 0),
    fat: a.fat + (i.fat_g || 0),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach-dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">{patient?.full_name || "Paciente"}</h1>
            <p className="text-xs text-muted-foreground">
              {patient?.objetivo_principal || patient?.goal || "—"} • {patient?.weight_kg ? `${patient.weight_kg}kg` : "—"}
            </p>
          </div>
          <Badge className={latestScore >= 70 ? "bg-green-500/20 text-green-400" : latestScore >= 40 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}>
            Score {latestScore}/100
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full grid grid-cols-10">
            <TabsTrigger value="overview" className="text-xs"><User className="w-3 h-3 mr-1" />Geral</TabsTrigger>
            <TabsTrigger value="mealplan" className="text-xs"><Utensils className="w-3 h-3 mr-1" />Plano</TabsTrigger>
            <TabsTrigger value="grade" className="text-xs"><Utensils className="w-3 h-3 mr-1" />Grade</TabsTrigger>
            <TabsTrigger value="checkins" className="text-xs"><Activity className="w-3 h-3 mr-1" />Check-ins</TabsTrigger>
            <TabsTrigger value="periodization" className="text-xs"><BarChart3 className="w-3 h-3 mr-1" />Periodização</TabsTrigger>
            <TabsTrigger value="access" className="text-xs"><Shield className="w-3 h-3 mr-1" />Acesso</TabsTrigger>
            <TabsTrigger value="protocol" className="text-xs"><Brain className="w-3 h-3 mr-1" />Protocolo</TabsTrigger>
            <TabsTrigger value="exams" className="text-xs"><FileText className="w-3 h-3 mr-1" />Exames</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Alertas</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs"><MessageSquare className="w-3 h-3 mr-1" />Chat</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Peso Atual</p>
                  <p className="text-2xl font-bold text-foreground">{patient?.weight_kg || "—"} kg</p>
                  {patient?.meta_peso && <p className="text-xs text-muted-foreground">Meta: {patient.meta_peso} kg</p>}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Score de Execução</p>
                  <p className="text-2xl font-bold text-foreground">{latestScore}/100</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Aderência</p>
                  <p className="text-2xl font-bold text-foreground">{adherencePct}%</p>
                  <p className="text-xs text-muted-foreground">últimos 14 registros</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-sm">Últimos Scores</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-1 items-end h-20">
                  {scores.slice(0, 20).reverse().map((s, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${Math.max(s.total_score, 5)}%`,
                        backgroundColor: s.total_score >= 70 ? "hsl(142, 71%, 45%)" : s.total_score >= 40 ? "hsl(48, 96%, 53%)" : "hsl(0, 84%, 60%)",
                      }}
                      title={`Score: ${s.total_score}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Dados do Paciente</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Altura:</span> <span className="text-foreground">{patient?.height_cm || "—"} cm</span></div>
                <div><span className="text-muted-foreground">IMC:</span> <span className="text-foreground">{patient?.weight_kg && patient?.height_cm ? (patient.weight_kg / ((patient.height_cm / 100) ** 2)).toFixed(1) : "—"}</span></div>
                <div><span className="text-muted-foreground">Protocolo:</span> <span className="text-foreground">{patient?.active_protocol || "—"}</span></div>
                <div><span className="text-muted-foreground">VET:</span> <span className="text-foreground">{patient?.vet_kcal || "—"} kcal</span></div>
                <div><span className="text-muted-foreground">Proteína:</span> <span className="text-foreground">{patient?.protein_g || "—"}g</span></div>
                <div><span className="text-muted-foreground">Streak:</span> <span className="text-foreground">{patient?.streak_days || 0} dias</span></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MEAL PLAN */}
          <TabsContent value="mealplan" className="space-y-4">
            {/* Week navigation */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, -1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-mono text-foreground">{formatWeekRange(weekStart)}</span>
              <Button variant="ghost" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={generateMealPlanForPatient}
                disabled={generating}
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
                ) : (
                  <><Brain className="w-4 h-4 mr-2" /> Gerar com IA</>
                )}
              </Button>
              <Button
                onClick={saveAndNotify}
                disabled={savingNotify || planItems.length === 0}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {savingNotify ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Notificando...</>
                ) : (
                  <><Bell className="w-4 h-4 mr-2" /> Salvar e notificar</>
                )}
              </Button>
            </div>

            {/* Patient macro targets */}
            {patient && (
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground mb-2">Metas do paciente</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-foreground">{patient.vet_kcal || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">kcal</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-primary">{patient.protein_g || "—"}g</p>
                      <p className="text-[10px] text-muted-foreground">Proteína</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-accent">{patient.carbs_g || "—"}g</p>
                      <p className="text-[10px] text-muted-foreground">Carboidrato</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-yellow-400">{patient.fat_g || "—"}g</p>
                      <p className="text-[10px] text-muted-foreground">Gordura</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Day selector */}
            <div className="flex gap-1">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono transition-all ${
                    selectedDay === i
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {planLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Day totals */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-lg bg-muted p-2">
                    <p className="text-sm font-bold text-foreground">{Math.round(dayTotals.kcal)}</p>
                    <p className="text-[10px] text-muted-foreground">kcal</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2">
                    <p className="text-sm font-bold text-primary">{Math.round(dayTotals.protein)}g</p>
                    <p className="text-[10px] text-muted-foreground">Prot</p>
                  </div>
                  <div className="rounded-lg bg-accent/10 p-2">
                    <p className="text-sm font-bold text-accent">{Math.round(dayTotals.carbs)}g</p>
                    <p className="text-[10px] text-muted-foreground">Carb</p>
                  </div>
                  <div className="rounded-lg bg-yellow-500/10 p-2">
                    <p className="text-sm font-bold text-yellow-400">{Math.round(dayTotals.fat)}g</p>
                    <p className="text-[10px] text-muted-foreground">Gord</p>
                  </div>
                </div>

                {dayItems.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground text-sm">
                      Nenhum item neste dia. Adicione manualmente abaixo ou gere com IA.
                    </CardContent>
                  </Card>
                )}

                {/* Meals list (editable) */}
                <div className="space-y-2">
                  {MEAL_TYPES.map(({ key, label }) => {
                    const mealItems = dayItems.filter(i => i.meal_type === key);
                    return (
                      <Card key={key}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-foreground">{label}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-[10px]"
                              onClick={() => addItem(key)}
                            >
                              <Plus className="w-3 h-3 mr-1" /> Adicionar
                            </Button>
                          </div>
                          {mealItems.length === 0 && (
                            <p className="text-[10px] text-muted-foreground italic">— sem itens —</p>
                          )}
                          {mealItems.map(item => {
                            const isEditing = editingId === item.id;
                            const edited = !!item.coach_edited;
                            return (
                              <div
                                key={item.id}
                                className={`py-2 border-b border-border last:border-0 ${edited ? "bg-amber-500/5 -mx-3 px-3 rounded" : ""}`}
                              >
                                {!isEditing ? (
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm text-foreground">{item.food_name}</p>
                                        {edited && (
                                          <Badge className="bg-amber-500/20 text-amber-400 text-[9px] h-4 px-1">
                                            ✏️ Coach
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-muted-foreground">{item.portion}</p>
                                      {item.coach_note && (
                                        <p className="text-[10px] text-amber-400 italic mt-1">
                                          📝 {item.coach_note}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right text-[10px] text-muted-foreground shrink-0">
                                      <p>{Math.round(item.kcal)} kcal</p>
                                      <p>P{item.protein_g}g C{item.carbs_g}g G{item.fat_g}g</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(item)}>
                                        <Pencil className="w-3 h-3" />
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => removeItem(item.id)}>
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2 bg-muted/40 p-2 rounded">
                                    <Input
                                      placeholder="Alimento"
                                      value={draft.food_name ?? ""}
                                      onChange={e => setDraft(d => ({ ...d, food_name: e.target.value }))}
                                      className="h-8 text-sm"
                                    />
                                    <Input
                                      placeholder="Porção (ex: 100g)"
                                      value={draft.portion ?? ""}
                                      onChange={e => setDraft(d => ({ ...d, portion: e.target.value }))}
                                      className="h-8 text-xs"
                                    />
                                    <div className="grid grid-cols-4 gap-1">
                                      <Input type="number" placeholder="kcal" value={draft.kcal ?? ""} onChange={e => setDraft(d => ({ ...d, kcal: Number(e.target.value) }))} className="h-8 text-xs" />
                                      <Input type="number" placeholder="P" value={draft.protein_g ?? ""} onChange={e => setDraft(d => ({ ...d, protein_g: Number(e.target.value) }))} className="h-8 text-xs" />
                                      <Input type="number" placeholder="C" value={draft.carbs_g ?? ""} onChange={e => setDraft(d => ({ ...d, carbs_g: Number(e.target.value) }))} className="h-8 text-xs" />
                                      <Input type="number" placeholder="G" value={draft.fat_g ?? ""} onChange={e => setDraft(d => ({ ...d, fat_g: Number(e.target.value) }))} className="h-8 text-xs" />
                                    </div>
                                    <Textarea
                                      placeholder="Nota do coach (opcional)"
                                      value={draft.coach_note ?? ""}
                                      onChange={e => setDraft(d => ({ ...d, coach_note: e.target.value }))}
                                      className="text-xs min-h-[50px]"
                                    />
                                    <div className="flex gap-1">
                                      <Button size="sm" className="h-7 flex-1 bg-amber-500 hover:bg-amber-600 text-black" onClick={() => saveEdit(item.id)}>
                                        <Save className="w-3 h-3 mr-1" /> Salvar
                                      </Button>
                                      <Button size="sm" variant="ghost" className="h-7" onClick={() => { setEditingId(null); setDraft({}); }}>
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>

          {/* GRADE SEMANAL (7 dias x refeições) */}
          <TabsContent value="grade" className="space-y-4">
            {patientId && (
              <CoachWeekMealGrid patientId={patientId} patient={patient} />
            )}
          </TabsContent>

          {/* CHECK-INS */}
          <TabsContent value="checkins" className="space-y-4">
            {patientId && <CoachCheckinsTab patientId={patientId} />}
          </TabsContent>

          {/* ACCESS MANAGEMENT */}
          <TabsContent value="access" className="space-y-4">
            {profile && patientId && (
              <CoachAccessManager
                patientUserId={patientId}
                coachProfileId={profile.id}
              />
            )}
          </TabsContent>

          {/* PROTOCOL */}
          <TabsContent value="protocol" className="space-y-4">
            {/* COMPETITION MODE */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    Competition Mode
                    <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">ON PRO</Badge>
                  </CardTitle>
                  <Button size="sm" onClick={() => setWizardOpen(true)}>
                    <Plus className="w-3 h-3 mr-1" /> Novo plano
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {competitionPlans.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum plano de competição. Crie o primeiro para gerar blocos automáticos (Off-season → Cutting → Pré-peak → Peak Week).</p>
                ) : (
                  competitionPlans.map((p) => {
                    const dias = Math.ceil((new Date(p.data_competicao).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const semanas = Math.ceil(dias / 7);
                    return (
                      <button
                        key={p.id}
                        onClick={() => navigate(`/coach/competition/${p.id}`)}
                        className="w-full text-left p-3 rounded-lg border border-border/50 bg-card hover:border-primary/40 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">{p.nome_competicao}</p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {p.federacao} · {p.categoria} · {new Date(p.data_competicao).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge variant="outline" className="text-[10px]" style={{ borderColor: dias < 0 ? "#888" : dias < 28 ? "#ef4444" : dias < 84 ? "#f59e0b" : "#22c55e" }}>
                              {dias < 0 ? "Encerrado" : `${semanas} sem`}
                            </Badge>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{p.peso_atual} → {p.peso_alvo_palco} kg</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Protocolo Ativo</CardTitle>
                  <Button size="sm" onClick={() => toast({ title: "Gerando novo protocolo com IA...", description: "Funcionalidade em ativação" })}>
                    <Brain className="w-4 h-4 mr-1" /> Gerar com IA
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Protocolo:</strong> {patient?.active_protocol || "Não definido"}</p>
                  <p><strong className="text-foreground">VET:</strong> {patient?.vet_kcal || "—"} kcal</p>
                  <p><strong className="text-foreground">Macros:</strong> P {patient?.protein_g || "—"}g / C {patient?.carbs_g || "—"}g / G {patient?.fat_g || "—"}g</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Últimas Refeições</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {mealLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma refeição registrada recentemente.</p>
                ) : (
                  mealLogs.slice(0, 7).map(m => (
                    <div key={m.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                      <div>
                        <span className="text-foreground font-medium capitalize">{m.meal_type}</span>
                        <span className="text-muted-foreground ml-2">{m.meal_date}</span>
                      </div>
                      <span className="text-muted-foreground">{m.total_kcal || 0} kcal</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* EXAMS */}
          <TabsContent value="exams" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Exames do Paciente</h3>
              <Button size="sm" variant="outline" onClick={() => toast({ title: "Solicitação de exames enviada" })}>
                Solicitar Novos Exames
              </Button>
            </div>
            {exams.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum exame registrado.</CardContent></Card>
            ) : (
              exams.map(e => (
                <Card key={e.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{e.test_date}</p>
                      <Badge variant={e.status === "analyzed" ? "default" : "outline"} className="text-xs">
                        {e.status === "analyzed" ? "Analisado" : "Pendente"}
                      </Badge>
                    </div>
                    {e.ai_analysis && typeof e.ai_analysis === "object" && (
                      <div className="text-xs text-muted-foreground">
                        Análise IA disponível
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ALERTS */}
          <TabsContent value="alerts" className="space-y-4">
            <h3 className="font-semibold text-foreground">Alertas do Paciente</h3>
            {alerts.filter(a => a.patient_user_id === patientId).length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">✅ Nenhum alerta pendente</CardContent></Card>
            ) : (
              alerts.filter(a => a.patient_user_id === patientId).map(a => (
                <Card key={a.id} className="border-l-4" style={{
                  borderLeftColor: a.severity === "critical" ? "hsl(0, 84%, 60%)" : a.severity === "high" ? "hsl(0, 84%, 60%)" : "hsl(48, 96%, 53%)"
                }}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{a.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => resolveAlert(a.id)}>
                      <Check className="w-3 h-3 mr-1" /> Resolver
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* MESSAGES */}
          <TabsContent value="messages" className="space-y-4">
            <h3 className="font-semibold text-foreground">Chat com Paciente</h3>
            <Card className="h-[400px] flex flex-col">
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">Nenhuma mensagem ainda. Envie a primeira!</p>
                ) : (
                  messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === "coach" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                        m.sender === "coach"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}>
                        {m.message}
                        <p className="text-[10px] opacity-70 mt-1">
                          {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
              <div className="border-t border-border p-3 flex gap-2">
                <Input
                  placeholder="Escreva uma mensagem..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                />
                <Button size="icon" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {profile && patientId && (
        <CoachCompetitionWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          coachId={profile.id}
          athleteId={patientId}
          athleteName={patient?.full_name}
          onCreated={() => loadCompetitionPlans()}
        />
      )}
    </div>
  );
};

export default CoachPatientDetailPage;
