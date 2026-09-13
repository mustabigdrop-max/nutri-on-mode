import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, ChevronDown, ChevronUp, Dumbbell, Eye, Link2, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getApexTrainingRules, getLatestApexBodyContext, type ApexTrainingBridgeResult } from "@/utils/apexTrainingBridge";
import type { WorkoutLogRow } from "@/lib/mesocyclePlan";

type Tab = "diagnostico" | "treino" | "nutricao" | "evolucao";
type MuscleScoreRow = Record<string, string | number | null> & { assessment_date: string };

const SCORE_LABELS: Record<string, string> = {
  abs_obliques: "Oblíquos", abs_rectus: "Reto abdominal", adductors: "Adutores",
  biceps_l: "Bíceps esquerdo", biceps_r: "Bíceps direito", calves_l: "Panturrilha esquerda",
  calves_r: "Panturrilha direita", chest_lower: "Peitoral inferior", chest_upper: "Peitoral superior",
  erectors: "Eretores da coluna", forearms_l: "Antebraço esquerdo", forearms_r: "Antebraço direito",
  glute_max: "Glúteo máximo", glute_med: "Glúteo médio", hams_l: "Posterior esquerdo",
  hams_r: "Posterior direito", lats: "Dorsais", quads_l: "Quadríceps esquerdo",
  quads_r: "Quadríceps direito", rhomboids: "Romboides", shoulder_ant: "Deltóide anterior",
  shoulder_lat: "Deltóide lateral", shoulder_post: "Deltóide posterior", traps_lower: "Trapézio inferior",
  traps_mid: "Trapézio médio", traps_upper: "Trapézio superior", triceps_l: "Tríceps esquerdo",
  triceps_r: "Tríceps direito",
};

const norm = (value: unknown) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const fmt = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");

function relatedExercises(label: string, days: Array<{ day_number?: number | null; exercises?: any[] }>) {
  const words = norm(label).split(/\s+/).filter((word) => word.length > 3);
  return days.flatMap((day, dayIndex) => (day.exercises || []).map((exercise) => ({
    day: Number(day?.day_number) || dayIndex + 1,
    name: String(exercise?.name || exercise?.nome || ""),
    sets: exercise?.sets ?? exercise?.series ?? exercise?.structure?.work_sets?.sets ?? null,
    reps: exercise?.reps ?? exercise?.repeticoes ?? exercise?.structure?.work_sets?.reps ?? null,
    muscle: String(exercise?.muscle_target || exercise?.grupo_muscular || ""),
  }))).filter((exercise) => words.some((word) => norm(`${exercise.name} ${exercise.muscle}`).includes(word)));
}

export default function WeakPointIntelligence({ athleteUserId, days, logs }: {
  athleteUserId?: string | null;
  days: Array<{ day_number?: number | null; exercises?: any[] }>;
  logs: WorkoutLogRow[];
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("diagnostico");
  const [selected, setSelected] = useState(0);
  const [scores, setScores] = useState<MuscleScoreRow[]>([]);
  const [apex, setApex] = useState<ApexTrainingBridgeResult | null>(null);
  const [nutrition, setNutrition] = useState<{ get_kcal: number | null; vet_kcal: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null } | null>(null);

  useEffect(() => {
    let active = true;
    if (!athleteUserId) {
      setScores([]); setApex(null); setNutrition(null);
      return;
    }
    Promise.all([
      supabase.from("apex_muscle_scores").select("*").eq("user_id", athleteUserId).order("assessment_date", { ascending: false }).limit(8),
      getLatestApexBodyContext(athleteUserId).then((context) => context ? getApexTrainingRules(context.athleteId) : null),
      supabase.from("profiles").select("get_kcal, vet_kcal, protein_g, carbs_g, fat_g").eq("user_id", athleteUserId).maybeSingle(),
    ]).then(([scoreResult, apexResult, profileResult]) => {
      if (!active) return;
      setScores((scoreResult.data as MuscleScoreRow[] | null) || []);
      setApex(apexResult);
      setNutrition(profileResult.data || null);
    });
    return () => { active = false; };
  }, [athleteUserId]);

  const findings = useMemo(() => {
    const latest = scores[0];
    const scored = latest ? Object.entries(SCORE_LABELS).flatMap(([key, label]) => {
      const value = Number(latest[key]);
      return Number.isFinite(value) ? [{ key, label, score: value, source: "APEX muscular" }] : [];
    }).sort((a, b) => a.score - b.score).slice(0, 4) : [];
    const seen = new Set(scored.map((item) => norm(item.label)));
    const priorities = (apex?.bodyContext?.priorities || []).flatMap((label, index) => {
      if (seen.has(norm(label))) return [];
      return [{ key: `priority-${index}`, label, score: null, source: "Prioridade APEX" }];
    });
    return [...scored, ...priorities].slice(0, 6);
  }, [scores, apex]);

  if (!findings.length) return null;
  const finding = findings[Math.min(selected, findings.length - 1)];
  const exercises = relatedExercises(finding.label, days);
  const exerciseNames = new Set(exercises.map((exercise) => norm(exercise.name)));
  const relatedLogs = logs.filter((log) => exerciseNames.has(norm(log.exercise_name)));
  const history = scores.slice().reverse().flatMap((row) => {
    const value = Number(row[finding.key]);
    return Number.isFinite(value) ? [{ date: row.assessment_date, value }] : [];
  });
  const hasNutrition = nutrition && Object.values(nutrition).some((value) => typeof value === "number");

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-2 px-4 py-3 text-left">
        <Activity className="h-4 w-4 text-primary" />
        <div>
          <p className="text-[11px] font-black tracking-wide text-foreground">WEAK POINT INTELLIGENCE</p>
          <p className="text-[9px] text-muted-foreground">APEX → TrainingON → NutriPlan → reavaliação</p>
        </div>
        <span className="ml-auto text-muted-foreground">{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
      </button>

      {open && <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {findings.map((item, index) => <button key={item.key} onClick={() => { setSelected(index); setTab("diagnostico"); }} className={`min-w-36 border px-3 py-2 text-left ${selected === index ? "border-primary bg-primary/10" : "border-border bg-muted/30"}`}>
            <p className="text-[10px] font-bold text-foreground">{item.label}</p>
            <p className="mt-1 text-[9px] text-muted-foreground">{item.score === null ? item.source : `Score registrado: ${fmt(item.score)}`}</p>
          </button>)}
        </div>

        <div className="grid grid-cols-4 gap-1">
          {([ ["diagnostico", Eye, "Diagnóstico"], ["treino", Dumbbell, "Treino"], ["nutricao", Utensils, "Nutrição"], ["evolucao", BarChart3, "Evolução"] ] as const).map(([value, Icon, label]) => <button key={value} onClick={() => setTab(value)} className={`flex min-h-10 items-center justify-center gap-1 border text-[9px] font-bold ${tab === value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}><Icon className="h-3 w-3" />{label}</button>)}
        </div>

        {tab === "diagnostico" && <div className="space-y-2">
          <DataBlock title="Evidência registrada" text={finding.score === null ? finding.label : `${finding.label}: ${fmt(finding.score)} na avaliação de ${new Date(scores[0].assessment_date).toLocaleDateString("pt-BR")}. Está entre as menores pontuações desta avaliação.`} />
          <DataBlock title="Fontes conectadas" text={[finding.source, apex?.achadosAtivos.length ? `${apex.achadosAtivos.length} achado(s) postural(is) APEX` : null, relatedLogs.length ? `${relatedLogs.length} registro(s) de carga/RPE relacionado(s)` : null].filter(Boolean).join(" · ")} />
          <p className="text-[9px] leading-relaxed text-muted-foreground">A pontuação visual é contexto secundário. A decisão final considera execução, histórico, recuperação e revisão do coach.</p>
        </div>}

        {tab === "treino" && <div className="space-y-2">
          {exercises.length ? exercises.map((exercise, index) => <div key={`${exercise.day}-${exercise.name}-${index}`} className="border-l-2 border-primary bg-muted/30 p-3">
            <p className="text-[10px] font-bold text-foreground">D{exercise.day} · {exercise.name}</p>
            <p className="mt-1 text-[9px] text-muted-foreground">Séries {exercise.sets ?? "—"} · repetições {exercise.reps ?? "—"}</p>
          </div>) : <Empty text="Nenhum exercício relacionado foi identificado no protocolo salvo. O coach pode revisar a cobertura antes de ajustar o treino." />}
          {!!apex?.corretivos.length && <DataBlock title="Corretivos APEX registrados" text={apex.corretivos.slice(0, 4).map((item) => `${item.nome} — ${item.series}×${item.reps}`).join(" · ")} />}
        </div>}

        {tab === "nutricao" && (hasNutrition ? <div className="grid grid-cols-2 gap-2">
          <Mini label="GET" value={nutrition?.get_kcal == null ? "—" : `${nutrition.get_kcal} kcal`} />
          <Mini label="Plano" value={nutrition?.vet_kcal == null ? "—" : `${nutrition.vet_kcal} kcal`} />
          <Mini label="Proteína" value={nutrition?.protein_g == null ? "—" : `${nutrition.protein_g} g`} />
          <Mini label="Carboidratos" value={nutrition?.carbs_g == null ? "—" : `${nutrition.carbs_g} g`} />
          <p className="col-span-2 text-[9px] leading-relaxed text-muted-foreground">Valores atuais do NutriPlan. Este painel não cria dose, suplemento ou macro adicional automaticamente.</p>
        </div> : <Empty text="Não há dados nutricionais persistidos para relacionar a este ponto." />)}

        {tab === "evolucao" && (history.length ? <div className="space-y-2">
          {history.map((item, index) => <div key={`${item.date}-${index}`} className="flex items-center gap-3 border-b border-border py-2">
            <span className="text-[9px] text-muted-foreground">{new Date(item.date).toLocaleDateString("pt-BR")}</span>
            <div className="h-1.5 flex-1 overflow-hidden bg-muted"><div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, item.value * 10))}%` }} /></div>
            <b className="text-[10px] text-foreground">{fmt(item.value)}</b>
          </div>)}
        </div> : <Empty text="Ainda não há duas avaliações comparáveis para mostrar evolução." />)}

        <div className="flex items-start gap-2 border border-border bg-muted/20 p-3">
          <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="text-[9px] leading-relaxed text-muted-foreground">Ciclo conectado: APEX identifica, TrainingON acompanha e o NutriPlan fornece o contexto nutricional já salvo.</p>
        </div>
      </div>}
    </section>
  );
}

function DataBlock({ title, text }: { title: string; text: string }) {
  return <div className="border border-border bg-muted/30 p-3"><p className="text-[9px] font-bold uppercase text-primary">{title}</p><p className="mt-1 text-[10px] leading-relaxed text-foreground">{text || "Sem dado registrado."}</p></div>;
}

function Empty({ text }: { text: string }) {
  return <p className="border border-dashed border-border p-3 text-[10px] leading-relaxed text-muted-foreground">{text}</p>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="border border-border bg-muted/30 p-3"><p className="text-[9px] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-bold text-foreground">{value}</p></div>;
}