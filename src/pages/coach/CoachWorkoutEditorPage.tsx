import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Save, Trash2, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import WorkoutShareCard from "@/components/workout/WorkoutShareCard";
import { buildWorkoutShareData } from "@/lib/workoutShareAdapter";
import { parseProtocolToDays } from "@/lib/parseProtocolMarkdown";
import {
  toEditableProtocol,
  serializeEditableProtocol,
  emptyDay,
  emptyExercise,
  type EditableProtocol,
  type EditableExercise,
} from "@/lib/workoutEditorModel";

type ProtocolRow = {
  id: string;
  client_name: string | null;
  phase: string | null;
  days_per_week?: number | null;
  weeks: string | null;
  muscles: string[] | null;
  protocol_text: string | null;
  created_at: string | null;
};

const FIELDS: Array<{ key: keyof EditableExercise; label: string; placeholder: string; wide?: boolean }> = [
  { key: "name", label: "Exercício", placeholder: "Supino inclinado com halteres", wide: true },
  { key: "muscle_target", label: "Músculo", placeholder: "Peitoral superior" },
  { key: "sets", label: "Séries", placeholder: "4" },
  { key: "reps", label: "Reps", placeholder: "8-10" },
  { key: "rpe", label: "RPE", placeholder: "8" },
  { key: "rir", label: "RIR", placeholder: "2" },
  { key: "rest", label: "Descanso", placeholder: "120s" },
];

export default function CoachWorkoutEditorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<ProtocolRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [model, setModel] = useState<EditableProtocol | null>(null);
  const [dayIndex, setDayIndex] = useState(0);

  useEffect(() => {
    document.title = "Editar treino · TrainingON";
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("training_protocols")
        .select("id, client_name, phase, weeks, days_per_week, muscles, protocol_text, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!active) return;
      const list = (data || []) as ProtocolRow[];
      setRows(list);
      setSelectedId((prev) => prev || list[0]?.id || null);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user]);

  const selected = useMemo(() => rows.find((row) => row.id === selectedId) || null, [rows, selectedId]);

  useEffect(() => {
    if (!selected) { setModel(null); return; }
    const next = toEditableProtocol(selected.protocol_text);
    setModel(next.days.length ? next : { ...next, days: [emptyDay(1)] });
    setDayIndex(0);
  }, [selected]);

  const day = model?.days[dayIndex] || null;

  const updateDay = (patch: Partial<EditableProtocol["days"][number]>) => {
    setModel((prev) => {
      if (!prev) return prev;
      const days = prev.days.map((item, index) => (index === dayIndex ? { ...item, ...patch } : item));
      return { ...prev, days };
    });
  };

  const updateExercise = (exerciseIndex: number, key: keyof EditableExercise, value: string) => {
    if (!day) return;
    const exercises = day.exercises.map((item, index) => (index === exerciseIndex ? { ...item, [key]: value } : item));
    updateDay({ exercises });
  };

  const shareData = useMemo(() => {
    if (!model || !day) return null;
    const serialized = serializeEditableProtocol(model);
    const parsed = parseProtocolToDays(serialized);
    const parsedDay = parsed.days[dayIndex];
    if (!parsedDay || !(parsedDay.exercises || []).length) return null;
    return buildWorkoutShareData(parsedDay, {
      phase: selected?.phase,
      weeks: selected?.weeks,
      daysPerWeek: selected?.days_per_week,
      muscles: selected?.muscles,
      updatedAt: selected?.created_at,
    });
  }, [model, day, dayIndex, selected]);

  const handleSave = async () => {
    if (!model || !selectedId) return;
    setSaving(true);
    const protocol_text = serializeEditableProtocol(model);
    const { error } = await supabase.from("training_protocols").update({ protocol_text }).eq("id", selectedId);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar o treino.");
      return;
    }
    setRows((prev) => prev.map((row) => (row.id === selectedId ? { ...row, protocol_text } : row)));
    toast.success("Treino salvo. O card já reflete as alterações.");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b border-border/60 px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach/trainingon")} aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <p className="font-tech text-[10px] uppercase tracking-[0.18em] text-cyan">TrainingON</p>
            <h1 className="flex items-center gap-2 font-display text-xl font-bold">
              <Dumbbell className="h-5 w-5 text-primary" /> Editar treino
            </h1>
          </div>
          <Button onClick={handleSave} disabled={saving || !model} className="rounded-none">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 p-4 lg:grid-cols-[220px_1fr_400px]">
        <aside className="space-y-2">
          <p className="font-tech text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Treinos salvos</p>
          {rows.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhum treino salvo ainda.</p>
          )}
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSelectedId(row.id)}
              className={`w-full border px-3 py-2 text-left transition-colors ${
                selectedId === row.id ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"
              }`}
            >
              <p className="text-sm font-semibold">{row.client_name || "Treino sem nome"}</p>
              <p className="text-[11px] text-muted-foreground">
                {[row.phase, row.weeks ? `${row.weeks} sem` : null].filter(Boolean).join(" · ") || "—"}
              </p>
            </button>
          ))}
        </aside>

        <section className="space-y-4">
          {model && (
            <div className="flex flex-wrap items-center gap-1">
              {model.days.map((item, index) => (
                <Button
                  key={index}
                  type="button"
                  size="sm"
                  variant={dayIndex === index ? "default" : "outline"}
                  className="h-8 rounded-none px-3 font-tech text-[10px]"
                  onClick={() => setDayIndex(index)}
                >
                  D{item.day_number || index + 1}
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 rounded-none px-3 font-tech text-[10px]"
                onClick={() => {
                  setModel((prev) => {
                    if (!prev) return prev;
                    const next = [...prev.days, emptyDay(prev.days.length + 1)];
                    setDayIndex(next.length - 1);
                    return { ...prev, days: next };
                  });
                }}
              >
                <Plus className="mr-1 h-3 w-3" /> Dia
              </Button>
              {model.days.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-none px-3 font-tech text-[10px] text-destructive"
                  onClick={() => {
                    setModel((prev) => {
                      if (!prev) return prev;
                      const days = prev.days.filter((_, index) => index !== dayIndex);
                      setDayIndex(Math.max(0, dayIndex - 1));
                      return { ...prev, days };
                    });
                  }}
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Remover dia
                </Button>
              )}
            </div>
          )}

          {day && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-tech text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Título da sessão</label>
                  <Input
                    value={day.session_title}
                    onChange={(event) => updateDay({ session_title: event.target.value })}
                    placeholder="Push A — Peitoral e Deltoides"
                    className="rounded-none"
                  />
                </div>
                <div>
                  <label className="font-tech text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Duração estimada</label>
                  <Input
                    value={day.estimated_duration}
                    onChange={(event) => updateDay({ estimated_duration: event.target.value })}
                    placeholder="75min"
                    className="rounded-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-tech text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Foco da sessão</label>
                <Textarea
                  value={day.session_notes}
                  onChange={(event) => updateDay({ session_notes: event.target.value })}
                  placeholder="Prioridade: contração no peitoral superior."
                  className="min-h-[60px] rounded-none"
                />
              </div>

              <div className="space-y-3">
                {day.exercises.map((exercise, exerciseIndex) => (
                  <div key={exerciseIndex} className="border border-border/60 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-tech text-[10px] uppercase tracking-[0.14em] text-cyan">
                        Exercício {exerciseIndex + 1}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        aria-label={`Remover exercício ${exerciseIndex + 1}`}
                        onClick={() => updateDay({ exercises: day.exercises.filter((_, index) => index !== exerciseIndex) })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-4">
                      {FIELDS.map((field) => (
                        <div key={field.key} className={field.wide ? "sm:col-span-2" : ""}>
                          <label className="font-tech text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                            {field.label}
                          </label>
                          <Input
                            value={exercise[field.key]}
                            onChange={(event) => updateExercise(exerciseIndex, field.key, event.target.value)}
                            placeholder={field.placeholder}
                            className="h-9 rounded-none"
                          />
                        </div>
                      ))}
                      <div className="sm:col-span-4">
                        <label className="font-tech text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Observações</label>
                        <Input
                          value={exercise.notes}
                          onChange={(event) => updateExercise(exerciseIndex, "notes", event.target.value)}
                          placeholder="Unilateral, cadência 3s na excêntrica"
                          className="h-9 rounded-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-none"
                  onClick={() => updateDay({ exercises: [...day.exercises, emptyExercise()] })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Adicionar exercício
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <p className="font-tech text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Card do treino</p>
          {shareData ? (
            <div className="overflow-x-auto pb-3">
              <WorkoutShareCard {...shareData} />
            </div>
          ) : (
            <div className="border border-border/60 p-6 text-center text-xs text-muted-foreground">
              Preencha ao menos um exercício com nome para gerar o card.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
