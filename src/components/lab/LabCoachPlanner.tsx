import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, Utensils, Dumbbell, Send, Loader2, Brain, FileDown,
  ChevronLeft, ChevronRight, Check, RefreshCw, User
} from "lucide-react";
import { toast } from "sonner";

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MEAL_TYPES = [
  { key: "cafe_manha", label: "☕ Café" },
  { key: "lanche_manha", label: "🍎 Lanche AM" },
  { key: "almoco", label: "🍽️ Almoço" },
  { key: "lanche_tarde", label: "🥤 Lanche PM" },
  { key: "jantar", label: "🌙 Jantar" },
  { key: "ceia", label: "🫖 Ceia" },
];

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}
function addWeeks(dateStr: string, w: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + w * 7);
  return d.toISOString().split("T")[0];
}
function formatWeekRange(ws: string): string {
  const s = new Date(ws + "T12:00:00");
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  const f = (d: Date) => `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  return `${f(s)} – ${f(e)}`;
}

interface ClientData {
  user_id: string;
  full_name: string;
  type: string;
  geb_kcal?: number;
  get_kcal?: number;
  vet_kcal?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  weight_kg?: number;
  height_cm?: number;
  sex?: string;
  goal?: string;
  objetivo_principal?: string;
  dietary_restrictions?: string[];
  health_conditions?: string[];
  sport?: string;
  training_frequency?: number;
  activity_level?: string;
  active_protocol?: string;
  nivel_treino?: string;
}

interface PlanItem {
  id?: string;
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
}

interface TrainingDay {
  day_index: number;
  title: string;
  exercises: { name: string; sets: string; reps: string; rest: string; notes: string }[];
}

const LabCoachPlanner = ({ onAskApex }: { onAskApex: (q: string) => void }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("diet");
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [selectedDay, setSelectedDay] = useState(0);

  // Diet
  const [dietItems, setDietItems] = useState<PlanItem[]>([]);
  const [generatingDiet, setGeneratingDiet] = useState(false);

  // Training
  const [trainingPlan, setTrainingPlan] = useState<TrainingDay[]>([]);
  const [generatingTraining, setGeneratingTraining] = useState(false);
  const [coachNotes, setCoachNotes] = useState("");

  // PDF
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    if (user) loadClients();
  }, [user]);

  useEffect(() => {
    if (selectedClient) {
      fetchDiet();
      fetchTraining();
    }
  }, [selectedClient, weekStart]);

  const loadClients = async () => {
    if (!user) return;
    setLoading(true);
    let all: ClientData[] = [];

    const { data: coachProf } = await supabase
      .from("coach_profiles").select("id").eq("user_id", user.id).maybeSingle();

    if (coachProf) {
      const { data: patients } = await supabase
        .from("coach_patients").select("patient_user_id")
        .eq("coach_id", coachProf.id).eq("status", "active");
      if (patients?.length) {
        const ids = patients.map(p => p.patient_user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, geb_kcal, get_kcal, vet_kcal, protein_g, carbs_g, fat_g, weight_kg, height_cm, sex, goal, objetivo_principal, dietary_restrictions, health_conditions, sport, training_frequency, activity_level, active_protocol, nivel_treino")
          .in("user_id", ids);
        all = (profiles || []).map(p => ({ ...p, full_name: p.full_name || "Sem nome", type: "aluno" }));
      }
    }

    const { data: partnersList } = await supabase
      .from("partners").select("user_id, full_name, status")
      .eq("created_by", user.id).eq("status", "active");

    if (partnersList) {
      const pIds = partnersList.filter(p => p.user_id && !all.find(c => c.user_id === p.user_id)).map(p => p.user_id!);
      if (pIds.length) {
        const { data: pp } = await supabase
          .from("profiles")
          .select("user_id, full_name, geb_kcal, get_kcal, vet_kcal, protein_g, carbs_g, fat_g, weight_kg, height_cm, sex, goal, objetivo_principal, dietary_restrictions, health_conditions, sport, training_frequency, activity_level, active_protocol, nivel_treino")
          .in("user_id", pIds);
        for (const p of (pp || [])) {
          all.push({ ...p, full_name: p.full_name || "Parceiro", type: "parceiro" });
        }
      }
    }

    setClients(all);
    setLoading(false);
  };

  const fetchDiet = async () => {
    if (!selectedClient) return;
    const { data } = await supabase
      .from("meal_plan_items").select("*")
      .eq("user_id", selectedClient.user_id).eq("week_start", weekStart);
    setDietItems((data || []) as PlanItem[]);
  };

  const fetchTraining = async () => {
    if (!selectedClient) return;
    const { data } = await supabase
      .from("workout_schedule")
      .select("*")
      .eq("user_id", selectedClient.user_id);
    if (data?.length) {
      const byDay: Record<number, any[]> = {};
      data.forEach(w => {
        if (!byDay[w.day_of_week]) byDay[w.day_of_week] = [];
        byDay[w.day_of_week].push(w);
      });
      const plan: TrainingDay[] = [];
      for (let d = 0; d < 7; d++) {
        const sessions = byDay[d] || [];
        plan.push({
          day_index: d,
          title: sessions.length ? sessions.map((s: any) => s.workout_type).join(" + ") : "Descanso",
          exercises: sessions.map((s: any) => ({
            name: s.workout_type,
            sets: "—",
            reps: "—",
            rest: "—",
            notes: `${s.workout_time || ""} ${s.duration_minutes ? s.duration_minutes + "min" : ""}`.trim(),
          })),
        });
      }
      setTrainingPlan(plan);
    } else {
      setTrainingPlan([]);
    }
  };

  const generateDiet = async () => {
    if (!selectedClient) return;
    setGeneratingDiet(true);
    try {
      const c = selectedClient;
      const { data: ws } = await supabase
        .from("workout_schedule")
        .select("day_of_week, workout_type, workout_time, duration_minutes, slot")
        .eq("user_id", c.user_id);

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          // ── Dados demográficos diretos (Edge Function espera no body raiz) ──
          nome: c.full_name || "Paciente",
          idade: (c as any).age || 30,
          sexo: c.sex === "F" ? "Feminino" : "Masculino",
          peso: c.weight_kg,
          altura: c.height_cm,
          objetivo: c.goal || c.objetivo_principal || "saúde geral",
          perfilPCA: (c as any).perfil_pca || "Executor",
          nivelAtividade: c.activity_level || "moderado",
          treino: c.sport || "Musculação / Hipertrofia",
          refeicoes: c.training_frequency || 5,
          calorias: c.vet_kcal || c.get_kcal || null,

          // ── Fase e periodização ──
          fasePeriodizacao: (c as any).fase_periodizacao || null,
          bfAtual: (c as any).bf_atual || null,
          bfMeta: (c as any).bf_meta || null,
          metodoBF: (c as any).metodo_bf || "visual",
          perfilVisual: (c as any).perfil_visual || null,

          // ── Cardio ──
          fazCardio: (c as any).faz_cardio || false,
          cardioModalidades: (c as any).cardio_modalidades || [],
          cardioFrequencia: (c as any).cardio_frequencia || null,
          cardioDuracao: (c as any).cardio_duracao || null,
          cardioQuando: (c as any).cardio_quando || null,
          cardioNoCalculo: (c as any).cardio_no_calculo || false,

          // ── Farmacológico ──
          protocoloFarmacologico: c.active_protocol || "",
          atletaCompetitivo: (c as any).atleta_competitivo || false,
          federacaoCategoria: (c as any).federacao_categoria || null,

          // ── Restrições e preferências ──
          restricoesStr: (c.dietary_restrictions || []).join(", "),
          preferencias: (c as any).preferencias_alimentares || null,
          suplementos: (c as any).suplementacao_atual || null,
          observacoes: (c.health_conditions || []).join(", "),

          // ── Perfil fisiológico ──
          neat: (c as any).neat || "medio",
          qualidadeSono: (c as any).qualidade_sono || "boa",
          semanasEmDeficit: (c as any).semanas_em_deficit || 0,
          cyclingCarbo: (c as any).cycling_carbo || false,
          perfilFisiologico: {
            historico_intestinal: (c as any).historico_intestinal || null,
            fermentados_atual: (c as any).fermentados_atual || null,
            sensibilidade_insulina: (c as any).sensibilidade_insulina || null,
            objetivos_secundarios: (c as any).objetivos_secundarios || [],
            variedade_funcional: (c as any).variedade_funcional || false,
            protocolo_microbiota: (c as any).protocolo_microbiota || false,
            cycling_carbo: (c as any).cycling_carbo || false,
            modo_economico: (c as any).modo_economico || false,
            perfil_economico: (c as any).perfil_economico || "intermediario",
            alimentos_disponiveis: (c as any).alimentos_disponiveis || [],
            outros_alimentos: (c as any).outros_alimentos || null,
            medidas_caseiras: (c as any).medidas_caseiras || false,
          },

          // ── Treino e schedule ──
          workoutSchedule: ws || [],
          trainingSchedulePrompt: ws?.length
            ? ws.map((w: any) =>
                `dia=${w.day_of_week} tipo=${w.workout_type} time=${w.workout_time || "07:00"} duration_min=${w.duration_minutes || 60}`
              ).join("\n")
            : null,

          // ── GLUT-4 ──
          glut4Config: (c as any).glut4_config || null,
          glut4Text: (c as any).glut4_text || null,

          // ── Coach ──
          coachNotes,
          weekStart,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await supabase.from("meal_plan_items").delete()
        .eq("user_id", c.user_id).eq("week_start", weekStart);

      const items: any[] = [];
      for (const day of data.days || []) {
        for (const meal of day.meals) {
          items.push({
            user_id: c.user_id,
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
      await supabase.from("meal_plan_items").insert(items);
      toast.success(`Dieta gerada para ${c.full_name}! 🤖✅`);
      await fetchDiet();
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao gerar dieta: " + e.message);
    }
    setGeneratingDiet(false);
  };

  const generateTraining = async () => {
    if (!selectedClient) return;
    setGeneratingTraining(true);
    try {
      const c = selectedClient;
      const { data, error } = await supabase.functions.invoke("generate-training-plan", {
        body: {
          profile: {
            goal: c.goal || c.objetivo_principal,
            weight_kg: c.weight_kg,
            height_cm: c.height_cm,
            sex: c.sex,
            sport: c.sport,
            training_frequency: c.training_frequency,
            activity_level: c.activity_level,
            nivel_treino: c.nivel_treino,
          },
          coachNotes,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Save to workout_schedule
      await supabase.from("workout_schedule").delete().eq("user_id", c.user_id);

      const inserts: any[] = [];
      for (const day of (data.days || [])) {
        for (const ex of (day.exercises || [])) {
          inserts.push({
            user_id: c.user_id,
            day_of_week: day.day_index,
            workout_type: day.title || ex.name,
            workout_time: "manhã",
            duration_minutes: 60,
            slot: 1,
          });
          break; // 1 entry per day_of_week in workout_schedule
        }
      }
      if (inserts.length) await supabase.from("workout_schedule").insert(inserts);

      setTrainingPlan(data.days || []);
      toast.success(`Treino gerado para ${c.full_name}! 💪✅`);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao gerar treino: " + e.message);
    }
    setGeneratingTraining(false);
  };

  const exportPdf = async () => {
    if (!selectedClient) return;
    setGeneratingPdf(true);
    try {
      const c = selectedClient;
      const dayItems = (d: number) => dietItems.filter(i => i.day_index === d);

      let html = `
      <html><head><meta charset="utf-8"><style>
        body{font-family:'DM Sans',sans-serif;background:#0a0f0a;color:#e0e0e0;padding:40px;max-width:800px;margin:0 auto}
        h1{color:#4ade80;font-size:24px;text-align:center;margin-bottom:4px}
        h2{color:#4ade80;font-size:16px;border-bottom:1px solid #1a2a1a;padding-bottom:4px;margin-top:24px}
        h3{color:#86efac;font-size:13px;margin:12px 0 4px}
        .meta{text-align:center;color:#999;font-size:12px;margin-bottom:20px}
        .targets{display:flex;gap:16px;justify-content:center;margin:16px 0;flex-wrap:wrap}
        .target{background:#111;border:1px solid #1a2a1a;border-radius:8px;padding:12px 20px;text-align:center}
        .target .val{font-size:20px;font-weight:bold;color:#4ade80}
        .target .lbl{font-size:10px;color:#888}
        table{width:100%;border-collapse:collapse;margin:8px 0}
        th{background:#111;color:#4ade80;font-size:11px;padding:6px;text-align:left;border:1px solid #1a2a1a}
        td{padding:6px;font-size:11px;border:1px solid #1a2a1a}
        .section{page-break-inside:avoid}
        .footer{text-align:center;margin-top:40px;color:#555;font-size:10px}
      </style></head><body>
      <h1>🧬 NUTRION — Plano Personalizado</h1>
      <p class="meta">${c.full_name} • ${c.sex === "M" ? "Masculino" : "Feminino"} • ${c.weight_kg || "—"}kg • ${c.height_cm || "—"}cm</p>
      <p class="meta">Semana: ${formatWeekRange(weekStart)} | Objetivo: ${c.goal || c.objetivo_principal || "Saúde"}</p>
      <div class="targets">
        <div class="target"><div class="val">${c.geb_kcal || "—"}</div><div class="lbl">GEB (kcal)</div></div>
        <div class="target"><div class="val">${c.get_kcal || "—"}</div><div class="lbl">GET (kcal)</div></div>
        <div class="target"><div class="val">${c.vet_kcal || "—"}</div><div class="lbl">VET (kcal)</div></div>
        <div class="target"><div class="val">${c.protein_g || "—"}g</div><div class="lbl">Proteína</div></div>
        <div class="target"><div class="val">${c.carbs_g || "—"}g</div><div class="lbl">Carboidrato</div></div>
        <div class="target"><div class="val">${c.fat_g || "—"}g</div><div class="lbl">Gordura</div></div>
      </div>`;

      // Diet section
      if (dietItems.length > 0) {
        html += `<h2>🍽️ PLANO ALIMENTAR</h2>`;
        for (let d = 0; d < 7; d++) {
          const di = dayItems(d);
          if (!di.length) continue;
          const totals = di.reduce((a, i) => ({
            kcal: a.kcal + (i.kcal || 0), p: a.p + (i.protein_g || 0),
            c: a.c + (i.carbs_g || 0), f: a.f + (i.fat_g || 0),
          }), { kcal: 0, p: 0, c: 0, f: 0 });
          html += `<div class="section"><h3>${DAY_LABELS[d]} — ${Math.round(totals.kcal)} kcal | P:${Math.round(totals.p)}g C:${Math.round(totals.c)}g G:${Math.round(totals.f)}g</h3>`;
          html += `<table><tr><th>Refeição</th><th>Alimento</th><th>Porção</th><th>kcal</th><th>P</th><th>C</th><th>G</th></tr>`;
          for (const item of di) {
            const mealLabel = MEAL_TYPES.find(m => m.key === item.meal_type)?.label || item.meal_type;
            html += `<tr><td>${mealLabel}</td><td>${item.food_name}</td><td>${item.portion || "—"}</td><td>${item.kcal}</td><td>${item.protein_g}g</td><td>${item.carbs_g}g</td><td>${item.fat_g}g</td></tr>`;
          }
          html += `</table></div>`;
        }
      }

      // Training section
      if (trainingPlan.length > 0 && trainingPlan.some(d => d.exercises.length > 0)) {
        html += `<h2>💪 PLANO DE TREINO</h2>`;
        for (const day of trainingPlan) {
          if (day.title === "Descanso") {
            html += `<h3>${DAY_LABELS[day.day_index]} — 🛌 Descanso</h3>`;
            continue;
          }
          html += `<div class="section"><h3>${DAY_LABELS[day.day_index]} — ${day.title}</h3>`;
          if (day.exercises.length) {
            html += `<table><tr><th>Exercício</th><th>Séries</th><th>Reps</th><th>Descanso</th><th>Obs</th></tr>`;
            for (const ex of day.exercises) {
              html += `<tr><td>${ex.name}</td><td>${ex.sets}</td><td>${ex.reps}</td><td>${ex.rest}</td><td>${ex.notes || ""}</td></tr>`;
            }
            html += `</table></div>`;
          }
        }
      }

      if (coachNotes.trim()) {
        html += `<h2>📝 OBSERVAÇÕES DO COACH</h2><p style="font-size:12px;line-height:1.6">${coachNotes.replace(/\n/g, "<br/>")}</p>`;
      }

      html += `<div class="footer">Gerado por NUTRION LAB • ${new Date().toLocaleDateString("pt-BR")}</div></body></html>`;

      // Open print dialog
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
      }
      toast.success("PDF gerado! Use Ctrl+P para salvar 📄");
    } catch (e: any) {
      toast.error("Erro ao gerar PDF");
    }
    setGeneratingPdf(false);
  };

  const dayItems = dietItems.filter(i => i.day_index === selectedDay);
  const dayTotals = dayItems.reduce((a, i) => ({
    kcal: a.kcal + (i.kcal || 0), p: a.p + (i.protein_g || 0),
    c: a.c + (i.carbs_g || 0), f: a.f + (i.fat_g || 0),
  }), { kcal: 0, p: 0, c: 0, f: 0 });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (!selectedClient) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-sm font-bold text-foreground flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Selecionar Cliente
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Escolha o cliente para montar o plano personalizado</p>
        </div>

        {clients.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">
            Nenhum cliente encontrado. Adicione alunos ou parceiros primeiro.
          </CardContent></Card>
        ) : (
          <div className="grid gap-2">
            {clients.map(c => (
              <button
                key={c.user_id}
                onClick={() => setSelectedClient(c)}
                className="w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.full_name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {c.goal || c.objetivo_principal || "—"} • {c.weight_kg ? `${c.weight_kg}kg` : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{c.type === "aluno" ? "Aluno" : "Parceiro"}</Badge>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">VET</p>
                      <p className="text-xs font-bold text-primary">{c.vet_kcal || "—"}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const c = selectedClient;

  return (
    <div className="px-4 py-3 space-y-3">
      {/* Client header */}
      <div className="flex items-center gap-3">
        <button onClick={() => setSelectedClient(null)} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">{c.full_name}</p>
          <p className="text-[10px] text-muted-foreground">
            {c.goal || c.objetivo_principal || "—"} • {c.weight_kg}kg • {c.height_cm}cm
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">{c.type === "aluno" ? "Aluno" : "Parceiro"}</Badge>
      </div>

      {/* Metabolic targets */}
      <div className="grid grid-cols-6 gap-1.5">
        {[
          { label: "GEB", value: c.geb_kcal },
          { label: "GET", value: c.get_kcal },
          { label: "VET", value: c.vet_kcal },
          { label: "P", value: c.protein_g, suffix: "g" },
          { label: "C", value: c.carbs_g, suffix: "g" },
          { label: "G", value: c.fat_g, suffix: "g" },
        ].map(t => (
          <div key={t.label} className="bg-card border border-border rounded-lg p-2 text-center">
            <p className="text-xs font-bold text-primary">{t.value || "—"}{t.suffix || ""}</p>
            <p className="text-[9px] text-muted-foreground">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Coach notes */}
      <Textarea
        value={coachNotes}
        onChange={e => setCoachNotes(e.target.value)}
        placeholder="Observações para a IA (ex: preferências, restrições extras, foco em hipertrofia...)"
        className="h-16 text-xs bg-card border-border resize-none"
      />

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button size="sm" onClick={generateDiet} disabled={generatingDiet} className="text-xs">
          {generatingDiet ? <Loader2 className="w-3 h-3 animate-spin" /> : <Utensils className="w-3 h-3" />}
          <span className="ml-1">{generatingDiet ? "Gerando..." : "Gerar Dieta"}</span>
        </Button>
        <Button size="sm" onClick={generateTraining} disabled={generatingTraining} variant="secondary" className="text-xs">
          {generatingTraining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Dumbbell className="w-3 h-3" />}
          <span className="ml-1">{generatingTraining ? "Gerando..." : "Gerar Treino"}</span>
        </Button>
        <Button size="sm" onClick={exportPdf} disabled={generatingPdf} variant="outline" className="text-xs">
          {generatingPdf ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
          <span className="ml-1">PDF</span>
        </Button>
      </div>

      {/* Sub-tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-2 h-8">
          <TabsTrigger value="diet" className="text-xs gap-1"><Utensils className="w-3 h-3" /> Dieta</TabsTrigger>
          <TabsTrigger value="training" className="text-xs gap-1"><Dumbbell className="w-3 h-3" /> Treino</TabsTrigger>
        </TabsList>

        <TabsContent value="diet" className="mt-3 space-y-3">
          {/* Week nav */}
          <div className="flex items-center justify-between">
            <button onClick={() => setWeekStart(addWeeks(weekStart, -1))} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-mono text-foreground">{formatWeekRange(weekStart)}</span>
            <button onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="text-muted-foreground hover:text-foreground"><ChevronRight className="w-4 h-4" /></button>
          </div>

          {/* Day selector */}
          <div className="flex gap-1">
            {DAY_LABELS.map((l, i) => (
              <button key={i} onClick={() => setSelectedDay(i)}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-mono transition-all ${selectedDay === i ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground"}`}>
                {l}
              </button>
            ))}
          </div>

          {/* Day totals */}
          {dayItems.length > 0 && (
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="bg-muted rounded-md p-1.5"><p className="text-xs font-bold text-foreground">{Math.round(dayTotals.kcal)}</p><p className="text-[9px] text-muted-foreground">kcal</p></div>
              <div className="bg-primary/10 rounded-md p-1.5"><p className="text-xs font-bold text-primary">{Math.round(dayTotals.p)}g</p><p className="text-[9px] text-muted-foreground">Prot</p></div>
              <div className="bg-accent/10 rounded-md p-1.5"><p className="text-xs font-bold text-accent">{Math.round(dayTotals.c)}g</p><p className="text-[9px] text-muted-foreground">Carb</p></div>
              <div className="bg-yellow-500/10 rounded-md p-1.5"><p className="text-xs font-bold text-yellow-400">{Math.round(dayTotals.f)}g</p><p className="text-[9px] text-muted-foreground">Gord</p></div>
            </div>
          )}

          {/* Meals */}
          {dayItems.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground text-xs">
              Nenhum plano. Clique em "Gerar Dieta" para criar.
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {MEAL_TYPES.map(mt => {
                const mealItems = dayItems.filter(i => i.meal_type === mt.key);
                if (!mealItems.length) return null;
                return (
                  <Card key={mt.key}>
                    <CardContent className="p-2.5">
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">{mt.label}</p>
                      {mealItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                          <div>
                            <p className="text-xs font-medium text-foreground">{item.food_name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.portion}</p>
                          </div>
                          <div className="text-right text-[10px] text-muted-foreground">
                            <span className="text-foreground font-medium">{item.kcal}</span> kcal
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="training" className="mt-3 space-y-3">
          {trainingPlan.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground text-xs">
              Nenhum treino. Clique em "Gerar Treino" para criar.
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {trainingPlan.map(day => (
                <Card key={day.day_index}>
                  <CardContent className="p-2.5">
                    <p className="text-xs font-bold text-foreground mb-1">
                      {DAY_LABELS[day.day_index]} — {day.title}
                    </p>
                    {day.exercises.length > 0 ? (
                      day.exercises.map((ex, i) => (
                        <div key={i} className="flex justify-between py-1 border-b border-border/50 last:border-0 text-xs">
                          <span className="text-foreground">{ex.name}</span>
                          <span className="text-muted-foreground">{ex.sets}x{ex.reps} | {ex.rest} | {ex.notes}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-muted-foreground">🛌 Descanso</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LabCoachPlanner;
