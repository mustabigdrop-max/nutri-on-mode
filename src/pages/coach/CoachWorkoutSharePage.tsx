import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import WorkoutShareCard from "@/components/workout/WorkoutShareCard";
import { buildWorkoutShareData } from "@/lib/workoutShareAdapter";
import { parseProtocolToDays } from "@/lib/parseProtocolMarkdown";

type ProtocolRow = {
  id: string;
  client_name: string | null;
  phase: string | null;
  weeks: string | null;
  muscles: string[] | null;
  protocol_text: string | null;
  created_at: string | null;
};

export default function CoachWorkoutSharePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProtocolRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dayIndex, setDayIndex] = useState(0);

  useEffect(() => {
    document.title = "Compartilhar treino · TrainingON";
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("training_protocols")
        .select("id, client_name, phase, weeks, muscles, protocol_text, created_at")
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

  const days = useMemo(() => {
    if (!selected?.protocol_text) return [];
    return parseProtocolToDays(selected.protocol_text).days.filter((day) => (day.exercises || []).length > 0);
  }, [selected]);

  const shareData = useMemo(() => {
    const day = days[dayIndex] || days[0];
    if (!day || !selected) return null;
    return buildWorkoutShareData(day, {
      phase: selected.phase,
      weeks: selected.weeks,
      muscles: selected.muscles,
      updatedAt: selected.created_at,
    });
  }, [days, dayIndex, selected]);

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
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach/trainingon")} aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="font-tech text-[10px] uppercase tracking-[0.18em] text-cyan">Ultra Share View</p>
            <h1 className="flex items-center gap-2 font-display text-xl font-bold">
              <Share2 className="h-5 w-5 text-primary" /> Compartilhar treino
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 p-4 md:grid-cols-[260px_1fr]">
        <aside className="space-y-2">
          <p className="font-tech text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Protocolos salvos</p>
          {rows.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Nenhum protocolo salvo ainda. Gere e salve um treino no TrainingON para liberar o card.
            </p>
          )}
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => { setSelectedId(row.id); setDayIndex(0); }}
              className={`w-full border px-3 py-2 text-left transition-colors ${
                selectedId === row.id ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"
              }`}
            >
              <p className="text-sm font-semibold">{row.client_name || "Protocolo sem nome"}</p>
              <p className="text-[11px] text-muted-foreground">
                {[row.phase, row.weeks ? `${row.weeks} sem` : null].filter(Boolean).join(" · ") || "—"}
              </p>
            </button>
          ))}
        </aside>

        <section className="space-y-4">
          {days.length > 1 && (
            <div className="flex flex-wrap gap-1">
              {days.map((day, index) => (
                <Button
                  key={day.day_number}
                  type="button"
                  size="sm"
                  variant={dayIndex === index ? "default" : "outline"}
                  className="h-8 rounded-none px-3 font-tech text-[10px]"
                  onClick={() => setDayIndex(index)}
                >
                  D{day.day_number}
                </Button>
              ))}
            </div>
          )}

          {shareData ? (
            <div className="overflow-x-auto pb-3">
              <WorkoutShareCard {...shareData} />
            </div>
          ) : (
            <div className="border border-border/60 p-6 text-center">
              <p className="text-sm font-semibold">Card indisponível para este protocolo</p>
              <p className="mt-1 text-xs text-muted-foreground">
                O protocolo selecionado não está no formato estruturado com dias e exercícios. Gere novamente pelo TrainingON para liberar o card.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
