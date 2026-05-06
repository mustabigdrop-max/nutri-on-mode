import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useFoods, type Food } from "@/hooks/useFoods";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Save, Sparkles, Loader2, Search, ChevronLeft, ChevronRight, Dumbbell, Bed } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { buildTrainingDayMap, classifyMealVsWorkout, splitWeeklyAverages, type TrainingDayInfo } from "@/lib/trainingDayMap";

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
function addWeeks(s: string, w: number) {
  const d = new Date(s);
  d.setDate(d.getDate() + w * 7);
  return d.toISOString().split("T")[0];
}
function fmtRange(s: string) {
  const a = new Date(s + "T12:00:00");
  const b = new Date(a);
  b.setDate(b.getDate() + 6);
  const f = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${f(a)} – ${f(b)}`;
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
  coach_edited?: boolean;
}

interface Props {
  patientId: string;
  patient: any;
}

export default function CoachWeekMealGrid({ patientId, patient }: Props) {
  const { foods } = useFoods();
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [items, setItems] = useState<PlanItem[]>([]);
  const [trainingMap, setTrainingMap] = useState<Record<number, TrainingDayInfo>>(() => {
    const m: Record<number, TrainingDayInfo> = {};
    for (let d = 0; d < 7; d++) m[d] = { isTraining: false };
    return m;
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    objetivo: "",
    peso: 0,
    kcal: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
  });

  useEffect(() => {
    if (patient) {
      setAiForm({
        objetivo: patient.objetivo_principal || patient.goal || "",
        peso: patient.weight_kg || 0,
        kcal: patient.vet_kcal || 0,
        protein_g: patient.protein_g || 0,
        carbs_g: patient.carbs_g || 0,
        fat_g: patient.fat_g || 0,
      });
    }
  }, [patient]);

  const fetchItems = async () => {
    if (!patientId) return;
    setLoading(true);
    const { data } = await supabase
      .from("meal_plan_items")
      .select("*")
      .eq("user_id", patientId)
      .eq("week_start", weekStart);
    setItems((data as PlanItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    (async () => {
      const { data } = await supabase
        .from("workout_schedule")
        .select("day_of_week, workout_type, workout_time, duration_minutes, slot")
        .eq("user_id", patientId);
      setTrainingMap(buildTrainingDayMap(data as any));
    })();
  }, [patientId, weekStart]);

  const getCell = (day: number, meal: string) =>
    items.find((i) => i.day_index === day && i.meal_type === meal);

  const dayTotals = useMemo(() => {
    const t: Record<number, { kcal: number; p: number; c: number; g: number }> = {};
    for (let d = 0; d < 7; d++) t[d] = { kcal: 0, p: 0, c: 0, g: 0 };
    items.forEach((i) => {
      t[i.day_index].kcal += Number(i.kcal) || 0;
      t[i.day_index].p += Number(i.protein_g) || 0;
      t[i.day_index].c += Number(i.carbs_g) || 0;
      t[i.day_index].g += Number(i.fat_g) || 0;
    });
    return t;
  }, [items]);

  const replaceCell = async (
    day: number,
    meal: string,
    food: Food,
    grams: number,
    existing?: PlanItem,
  ) => {
    const factor = grams / 100;
    const payload: any = {
      user_id: patientId,
      week_start: weekStart,
      day_index: day,
      meal_type: meal,
      food_name: food.nome,
      portion: `${grams}g`,
      kcal: Math.round(food.calorias_100g * factor),
      protein_g: +(food.proteina_100g * factor).toFixed(1),
      carbs_g: +(food.carbo_100g * factor).toFixed(1),
      fat_g: +(food.gordura_100g * factor).toFixed(1),
      coach_edited: true,
    };
    if (existing) payload.id = existing.id;
    const { error } = await supabase.from("meal_plan_items").upsert(payload);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    await fetchItems();
  };

  const savePlan = async () => {
    setSaving(true);
    // Bulk mark all current items as coach_edited (snapshot save)
    const ids = items.map((i) => i.id);
    if (ids.length > 0) {
      await supabase
        .from("meal_plan_items")
        .update({ coach_edited: true } as any)
        .in("id", ids);
    }
    setSaving(false);
    toast({ title: "Plano salvo ✅" });
  };

  const generateWithAI = async () => {
    setGenerating(true);
    try {
      const { data: workoutData } = await supabase
        .from("workout_schedule")
        .select("day_of_week, workout_type, workout_time, duration_minutes, slot")
        .eq("user_id", patientId);

      const profilePayload = {
        ...patient,
        objetivo_principal: aiForm.objetivo,
        weight_kg: aiForm.peso,
        vet_kcal: aiForm.kcal,
        protein_g: aiForm.protein_g,
        carbs_g: aiForm.carbs_g,
        fat_g: aiForm.fat_g,
      };

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          profile: profilePayload,
          weekStart,
          budgetMode: false,
          workoutSchedule: workoutData || [],
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await supabase
        .from("meal_plan_items")
        .delete()
        .eq("user_id", patientId)
        .eq("week_start", weekStart);

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
          });
        }
      }
      await supabase.from("meal_plan_items").insert(newItems);
      toast({ title: "Plano gerado com IA 🤖✨" });
      setAiOpen(false);
      await fetchItems();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, -1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-mono text-foreground">{fmtRange(weekStart)}</span>
          <Button variant="ghost" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAiOpen(true)}>
            <Sparkles className="w-4 h-4 mr-1" /> Gerar com IA
          </Button>
          <Button
            size="sm"
            onClick={savePlan}
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Salvar Plano
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground bg-muted/20 border border-border rounded-md px-3 py-2">
            <span>⚡ Pré-treino</span>
            <span>💪 Pós-treino</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Treino</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/50" /> Descanso</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-xs min-w-[900px]">
              <thead>
                <tr className="bg-muted/40">
                  <th className="p-2 text-left font-bold text-foreground sticky left-0 bg-muted/40 z-10">Refeição</th>
                  {DAY_LABELS.map((d, i) => {
                    const info = trainingMap[i];
                    return (
                      <th key={i} className="p-2 text-center font-bold text-foreground border-l border-border">
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex flex-col items-center gap-1"
                        >
                          <span>{d}</span>
                          {info?.isTraining ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-primary/20 text-primary border border-primary/30">
                              <Dumbbell className="w-2.5 h-2.5" /> TREINO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-muted/40 text-muted-foreground">
                              <Bed className="w-2.5 h-2.5" /> DESCANSO
                            </span>
                          )}
                          {info?.isTraining && info.muscleGroup && (
                            <span className="text-[8px] font-mono text-primary/80 truncate max-w-[80px]">{info.muscleGroup}</span>
                          )}
                        </motion.div>
                      </th>
                    );
                  })}
                </tr>
                <tr className="bg-amber-500/5 border-t border-border">
                  <th className="p-1 text-left text-[10px] text-muted-foreground sticky left-0 bg-amber-500/5 z-10">
                    Totais
                  </th>
                  {DAY_LABELS.map((_, i) => {
                    const isTr = trainingMap[i]?.isTraining;
                    return (
                      <th key={i} className="p-1 text-center text-[10px] border-l border-border">
                        <div className="text-amber-400 font-bold">{Math.round(dayTotals[i].kcal)}kcal</div>
                        <div className={`${isTr ? "text-foreground font-bold" : "text-muted-foreground font-normal"}`}>
                          P{Math.round(dayTotals[i].p)} C{Math.round(dayTotals[i].c)} G{Math.round(dayTotals[i].g)}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {MEAL_TYPES.map(({ key, label }) => (
                  <tr key={key} className="border-t border-border">
                    <td className="p-2 font-medium text-foreground sticky left-0 bg-card z-10 whitespace-nowrap">
                      {label}
                    </td>
                    {DAY_LABELS.map((_, dayIdx) => {
                      const cell = getCell(dayIdx, key);
                      const info = trainingMap[dayIdx];
                      const tag = info?.isTraining ? classifyMealVsWorkout(key, info.workoutTime) : null;
                      return (
                        <td
                          key={dayIdx}
                          className={`border-l border-border p-1 align-top relative ${
                            tag === "pre" ? "border-l-2 border-l-accent" : tag === "post" ? "border-l-2 border-l-primary" : ""
                          }`}
                        >
                          {tag && (
                            <span
                              className={`absolute top-0.5 right-0.5 text-[8px] font-mono px-1 rounded ${
                                tag === "pre" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                              }`}
                            >
                              {tag === "pre" ? "Pré ⚡" : "Pós 💪"}
                            </span>
                          )}
                          <CellEditor
                            cell={cell}
                            foods={foods}
                            onReplace={(food, grams) => replaceCell(dayIdx, key, food, grams, cell)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Weekly training vs rest summary */}
          {(() => {
            const { training, rest, carbDeltaPct } = splitWeeklyAverages(dayTotals, trainingMap);
            if (training.count === 0 && rest.count === 0) return null;
            const fmt = (v: number) => Math.round(v);
            return (
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                  Médias semanais
                  {training.count > 0 && rest.count > 0 && (
                    <span className={`text-[10px] font-mono ${carbDeltaPct >= 0 ? "text-primary" : "text-accent"}`}>
                      {carbDeltaPct >= 0 ? "+" : ""}{carbDeltaPct}% carbos no treino
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded border border-primary/30 bg-primary/5 p-2">
                    <div className="flex items-center gap-1 text-primary font-bold mb-1">
                      <Dumbbell className="w-3 h-3" /> Treino ({training.count}d)
                    </div>
                    <div className="text-foreground font-bold">{fmt(training.kcal)} kcal</div>
                    <div className="text-muted-foreground">P{fmt(training.p)}g · C{fmt(training.c)}g · G{fmt(training.g)}g</div>
                  </div>
                  <div className="rounded border border-border bg-muted/20 p-2">
                    <div className="flex items-center gap-1 text-muted-foreground font-bold mb-1">
                      <Bed className="w-3 h-3" /> Descanso ({rest.count}d)
                    </div>
                    <div className="text-foreground">{fmt(rest.kcal)} kcal</div>
                    <div className="text-muted-foreground">P{fmt(rest.p)}g · C{fmt(rest.c)}g · G{fmt(rest.g)}g</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* AI Dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Gerar plano com IA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Objetivo</Label>
              <Input
                value={aiForm.objetivo}
                onChange={(e) => setAiForm({ ...aiForm, objetivo: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Peso (kg)</Label>
                <Input
                  type="number"
                  value={aiForm.peso || ""}
                  onChange={(e) => setAiForm({ ...aiForm, peso: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs">Kcal alvo</Label>
                <Input
                  type="number"
                  value={aiForm.kcal || ""}
                  onChange={(e) => setAiForm({ ...aiForm, kcal: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Prot (g)</Label>
                <Input
                  type="number"
                  value={aiForm.protein_g || ""}
                  onChange={(e) => setAiForm({ ...aiForm, protein_g: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs">Carb (g)</Label>
                <Input
                  type="number"
                  value={aiForm.carbs_g || ""}
                  onChange={(e) => setAiForm({ ...aiForm, carbs_g: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs">Gord (g)</Label>
                <Input
                  type="number"
                  value={aiForm.fat_g || ""}
                  onChange={(e) => setAiForm({ ...aiForm, fat_g: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAiOpen(false)}>Cancelar</Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-black"
              onClick={generateWithAI}
              disabled={generating}
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Gerando...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-1" /> Gerar</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function CellEditor({
  cell,
  foods,
  onReplace,
}: {
  cell?: PlanItem;
  foods: Food[];
  onReplace: (food: Food, grams: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [grams, setGrams] = useState(100);
  const [selected, setSelected] = useState<Food | null>(null);
  const [busy, setBusy] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return foods.slice(0, 10);
    const q = query.toLowerCase();
    return foods.filter((f) => f.nome.toLowerCase().includes(q)).slice(0, 10);
  }, [query, foods]);

  const submit = async () => {
    if (!selected) return;
    setBusy(true);
    await onReplace(selected, grams);
    setBusy(false);
    setOpen(false);
    setQuery("");
    setSelected(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`w-full text-left p-1.5 rounded hover:bg-muted/60 transition min-h-[52px] ${
            cell?.coach_edited ? "bg-amber-500/10 border border-amber-500/30" : ""
          }`}
        >
          {cell ? (
            <>
              <div className="text-[11px] text-foreground line-clamp-2 font-medium">{cell.food_name}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                P{cell.protein_g} C{cell.carbs_g} G{cell.fat_g}
              </div>
            </>
          ) : (
            <div className="text-[10px] text-muted-foreground italic">+ vazio</div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-3 h-3 text-muted-foreground" />
            <Input
              placeholder="Buscar alimento..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-7 h-8 text-xs"
            />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {results.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelected(f)}
                className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-muted ${
                  selected?.id === f.id ? "bg-amber-500/20 text-amber-300" : "text-foreground"
                }`}
              >
                {f.nome}
                <span className="text-muted-foreground ml-1">({f.calorias_100g}kcal/100g)</span>
              </button>
            ))}
            {results.length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center py-2">Nada encontrado</p>
            )}
          </div>
          <div className="flex gap-2 items-end pt-1 border-t border-border">
            <div className="flex-1">
              <Label className="text-[10px]">Gramas</Label>
              <Input
                type="number"
                value={grams}
                onChange={(e) => setGrams(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
            <Button
              size="sm"
              onClick={submit}
              disabled={!selected || busy}
              className="bg-amber-500 hover:bg-amber-600 text-black h-8"
            >
              {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : "Substituir"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
