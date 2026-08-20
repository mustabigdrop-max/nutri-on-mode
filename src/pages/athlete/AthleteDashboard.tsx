import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UtensilsCrossed, Dumbbell, Pill, TrendingUp, MessageSquare,
  ChevronRight, Bell, User, Flame, Camera, Scale, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAthleteView } from "@/hooks/useAthleteView";
import { useAthletePlans, mealKcal } from "@/hooks/useAthletePlans";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { useDailyActivities } from "@/hooks/useDailyActivities";
import { useDayContext } from "@/hooks/useDayContext";
import AthleteBottomNav from "@/components/athlete/AthleteBottomNav";
import NutrySyncPanel from "@/components/athlete/NutrySyncPanel";
import HydrationCard from "@/components/athlete/HydrationCard";
import DayRoutineTimeline, { type RoutineItem } from "@/components/athlete/DayRoutineTimeline";
import AddActivitySheet from "@/components/athlete/AddActivitySheet";
import { metActivity } from "@/lib/nutrySyncMet";
import MceScoreCard from "@/components/athlete/MceScoreCard";
import PraxisFAB from "@/components/praxis/PraxisFAB";
import {
  CLIMATE_OPTIONS, calculateDailyHydration, detectPhase, activityMeta,
} from "@/lib/nutrySync";
import { parseProtocolToDays } from "@/lib/parseProtocolMarkdown";
import { parseProtocolText } from "@/lib/parseProtocolText";


const BG = "#020205";
const CYAN = "#00D4FF";
const GREEN = "#00FF88";
const GOLD = "#FFD700";
const TEXT = "#FFFFFF";
const DIM = "#A0A0A0";

const Card = ({
  accent, children, onClick, className = "",
}: { accent: string; children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl p-4 ${onClick ? "cursor-pointer transition-transform active:scale-[0.99]" : ""} ${className}`}
    style={{
      borderLeft: `3px solid ${accent}`,
      border: `1px solid ${accent}22`,
      borderLeftWidth: 3,
      borderLeftColor: accent,
      background: `linear-gradient(135deg, ${accent}0f, ${accent}03)`,
    }}
  >
    {children}
  </div>
);

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

export interface AthleteDashboardProps {
  /** Quando presente, mostra os dados deste atleta (modo "ver como cliente") */
  overrideUserId?: string;
  /** Nome exibido no cabeçalho quando em modo visualização */
  overrideName?: string | null;
  viewMode?: "normal" | "coach-preview";
}

const AthleteDashboard = ({ overrideUserId, overrideName, viewMode = "normal" }: AthleteDashboardProps = {}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const preview = viewMode === "coach-preview";
  const { coachName, fullName } = useAthleteView();
  const { loading, mealPlan, training, coachMessage } = useAthletePlans(overrideUserId);
  const { todayLog, addWater } = useWaterLogs(overrideUserId);
  const { logs: weightLogs } = useWeightLogs(undefined, -0.5, overrideUserId);
  const [suppChecked, setSuppChecked] = useState<Record<number, boolean>>({});
  const targetUserId = overrideUserId || user?.id;
  const { activities, addActivity, removeActivity, totals: activityTotals } =
    useDailyActivities(overrideUserId);
  const { completed, toggleMeal, climate, setClimate } = useDayContext(targetUserId);
  const [showActivitySheet, setShowActivitySheet] = useState(false);
  const [weightKg, setWeightKg] = useState(70);

  useEffect(() => {
    if (!targetUserId) return;
    let alive = true;
    supabase
      .from("profiles")
      .select("weight_kg")
      .eq("user_id", targetUserId)
      .maybeSingle()
      .then(({ data }) => {
        if (alive && data?.weight_kg) setWeightKg(Number(data.weight_kg));
      });
    return () => {
      alive = false;
    };
  }, [targetUserId]);


  const firstName = (overrideName || fullName || user?.user_metadata?.full_name || "Atleta").split(" ")[0];

  const nextMeal = useMemo(() => {
    if (!mealPlan?.refeicoes?.length) return null;
    const now = new Date().getHours() * 60 + new Date().getMinutes();
    const toMin = (h?: string) => {
      const m = String(h || "").match(/(\d{1,2})\s*[:hH]\s*(\d{2})/);
      return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
    };
    return (
      mealPlan.refeicoes.find((r) => {
        const t = toMin(r.horario);
        return t !== null && t >= now;
      }) || mealPlan.refeicoes[0]
    );
  }, [mealPlan]);

  const todayTraining = useMemo(() => {
    if (!training?.protocolText) return null;
    const { json, markdown } = parseProtocolText(training.protocolText);
    const parsed = parseProtocolToDays(json || markdown);
    if (!parsed.days.length) return null;
    const idx = (new Date().getDay() + 6) % 7;
    return parsed.days[idx % parsed.days.length];
  }, [training]);

  const waterMl = todayLog?.ml_total ?? 0;

  /* ---------------------------------------------------------- NutrySync */
  const phase = useMemo(
    () => detectPhase(mealPlan?.resumo?.objetivo || mealPlan?.objetivo),
    [mealPlan],
  );

  const trainingMinutes = useMemo(() => {
    const m = String(todayTraining?.estimated_duration || "").match(/(\d{2,3})/);
    return todayTraining ? (m ? parseInt(m[1], 10) : 60) : 0;
  }, [todayTraining]);

  const trainingKcal = useMemo(
    () => Math.round(6.5 * trainingMinutes * ((weightKg || 70) / 70)),
    [trainingMinutes, weightKg],
  );

  const baseKcal = Math.round(mealPlan?.resumo?.calorias_totais || 0);
  const adjustKcal = trainingKcal + activityTotals.kcal;

  const routineItems = useMemo<RoutineItem[]>(() => {
    const items: RoutineItem[] = (mealPlan?.refeicoes || []).map((r, i) => ({
      key: `meal-${i}`,
      time: r.horario || "",
      emoji: "🍽️",
      label: r.refeicao || `Refeição ${i + 1}`,
      detail: `${mealKcal(r)} kcal`,
      checkable: true,
    }));
    if (todayTraining) {
      items.push({
        key: "training",
        time: "",
        emoji: "🏋️",
        label: todayTraining.session_title || "Treino de hoje",
        detail: todayTraining.estimated_duration || undefined,
        checkable: true,
      });
    }
    activities.forEach((a) => {
      const meta = metActivity(a.activity_type) ?? activityMeta(a.activity_type);
      items.push({
        key: `act-${a.id}`,
        time: new Date(a.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        emoji: meta.emoji,
        label: a.activity_label || meta.label,
        detail: `${a.duration_min} min · +${a.kcal_adjustment} kcal`,
        checkable: false,
      });
    });
    return items;
  }, [mealPlan, todayTraining, activities]);

  const consumedKcal = useMemo(
    () =>
      (mealPlan?.refeicoes || []).reduce(
        (sum, r, i) => (completed[`meal-${i}`] ? sum + mealKcal(r) : sum),
        0,
      ),
    [mealPlan, completed],
  );

  const consumedMacros = useMemo(
    () =>
      (mealPlan?.refeicoes || []).reduce(
        (acc, r, i) =>
          completed[`meal-${i}`]
            ? {
                protein: acc.protein + (r.macros?.proteina || 0),
                carbs: acc.carbs + (r.macros?.carboidrato || 0),
                fat: acc.fat + (r.macros?.gordura || 0),
              }
            : acc,
        { protein: 0, carbs: 0, fat: 0 },
      ),
    [mealPlan, completed],
  );

  const targetMacros = useMemo(
    () => ({
      protein: Math.round((mealPlan?.resumo?.proteina_total || 0) + activityTotals.protein),
      carbs: Math.round((mealPlan?.resumo?.carboidrato_total || 0) + activityTotals.carb),
      fat: Math.round((mealPlan?.resumo?.gordura_total || 0) + activityTotals.fat),
    }),
    [mealPlan, activityTotals],
  );

  const climateOption = CLIMATE_OPTIONS.find((c) => c.band === climate);

  const hydration = useMemo(
    () =>
      calculateDailyHydration({
        weightKg,
        climate,
        trainingMinutes,
        activityMl: activityTotals.hydrationMl,
        phase: phase.phase,
      }),
    [weightKg, climate, trainingMinutes, activityTotals.hydrationMl, phase],
  );


  const weightInfo = useMemo(() => {
    if (!weightLogs.length) return null;
    const sorted = [...weightLogs].sort(
      (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    );
    const latest = sorted[0];
    const oldest = sorted[sorted.length - 1];
    return {
      weight: latest.weight_kg,
      delta: Math.round((latest.weight_kg - oldest.weight_kg) * 10) / 10,
      count: sorted.length,
    };
  }, [weightLogs]);

  const supplements = mealPlan?.suplementacao || [];

  useEffect(() => {
    document.title = preview ? "Ver como cliente · NUTRION" : "Meu Painel · NUTRION";
  }, [preview]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: CYAN }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: BG, color: TEXT }}>
      {/* Header */}
      <header className="px-4 pt-6 pb-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-black tracking-[0.2em]" style={{ color: CYAN }}>
            NUTRION
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/notificacoes")}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)" }}
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4" style={{ color: DIM }} />
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)" }}
              aria-label="Perfil"
            >
              <User className="w-4 h-4" style={{ color: DIM }} />
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight">{greeting()}, {firstName} 👋</h1>
        <p className="text-sm mt-1" style={{ color: DIM }}>
          {preview ? "Visualização do painel do cliente." : coachName ? `${coachName} preparou tudo pra hoje.` : "Seu coach preparou tudo pra hoje."}
        </p>
      </header>

      <main className="px-4 max-w-3xl mx-auto space-y-3">
        <NutrySyncPanel
          phase={phase}
          baseKcal={baseKcal}
          adjustKcal={adjustKcal}
          consumedKcal={consumedKcal}
          targetMacros={targetMacros}
          consumedMacros={consumedMacros}
          trainingLabel={todayTraining?.session_title || null}
          trainingKcal={trainingKcal}
          activities={activities}
          climateLabel={climateOption?.label}
          climateMl={climateOption?.ml || 0}
          onAddActivity={() => setShowActivitySheet(true)}
          onRemoveActivity={removeActivity}
          readOnly={preview}
        />

        <DayRoutineTimeline
          items={routineItems}
          completed={completed}
          onToggle={toggleMeal}
          readOnly={preview}
        />

        {/* Plano + Treino */}

        <div className="grid gap-3 sm:grid-cols-2">
          <Card accent={CYAN} onClick={() => navigate(`/my-plan${overrideUserId ? `?athlete=${overrideUserId}` : ""}`)}>
            <div className="flex items-center gap-2 mb-3">
              <UtensilsCrossed className="w-4 h-4" style={{ color: CYAN }} />
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: CYAN }}>
                Meu plano alimentar
              </span>
            </div>
            {mealPlan ? (
              <>
                <p className="text-sm font-semibold">
                  {mealPlan.resumo?.objetivo || mealPlan.objetivo || "Protocolo ativo"}
                </p>
                <p className="text-xs mt-1" style={{ color: DIM }}>
                  {Math.round(mealPlan.resumo?.calorias_totais || 0)} kcal ·{" "}
                  {mealPlan.refeicoes.length} refeições
                </p>
                {nextMeal && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: DIM }}>
                      Próxima: {nextMeal.refeicao}
                    </p>
                    <p className="text-xs mt-1 line-clamp-2">
                      {(nextMeal.alimentos || []).slice(0, 3).map((a) => a.alimento).join(" + ") || "—"}
                    </p>
                    <p className="text-xs mt-1 font-mono" style={{ color: CYAN }}>
                      {nextMeal.horario || "--:--"} · {mealKcal(nextMeal)} kcal
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs" style={{ color: DIM }}>
                Nenhum plano alimentar enviado ainda.
              </p>
            )}
            <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: CYAN }}>
              Ver plano completo <ChevronRight className="w-3 h-3" />
            </div>
          </Card>

          <Card accent={GREEN} onClick={() => navigate(`/my-training${overrideUserId ? `?athlete=${overrideUserId}` : ""}`)}>
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="w-4 h-4" style={{ color: GREEN }} />
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: GREEN }}>
                Meu treino de hoje
              </span>
            </div>
            {training ? (
              <>
                <p className="text-sm font-semibold">
                  {todayTraining?.session_title || training.phase || "Protocolo ativo"}
                </p>
                <p className="text-xs mt-1" style={{ color: DIM }}>
                  {todayTraining?.estimated_duration || training.weeks || ""}
                  {training.daysPerWeek ? ` · ${training.daysPerWeek}x/semana` : ""}
                </p>
                {todayTraining?.muscle_tags?.length ? (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {todayTraining.muscle_tags.slice(0, 4).map((m) => (
                      <span
                        key={m}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: `${GREEN}14`, color: GREEN }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-xs" style={{ color: DIM }}>
                Nenhum treino enviado ainda.
              </p>
            )}
            <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: GREEN }}>
              Ver treino completo <ChevronRight className="w-3 h-3" />
            </div>
          </Card>
        </div>

        {/* MCE */}
        <MceScoreCard userId={targetUserId} readOnly={preview} />

        <button
          onClick={() => !preview && navigate("/audio")}
          disabled={preview}
          className="w-full text-left rounded-2xl p-4"
          style={{
            border: "1px solid rgba(232,160,32,0.25)",
            borderLeft: "3px solid #E8A020",
            background: "linear-gradient(135deg, rgba(232,160,32,0.08), transparent)",
          }}
        >
          <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#E8A020" }}>
            🎧 MCE Audio Academy
          </span>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            Briefing do dia, séries M/C/E, aulas científicas e rituais — para ouvir no cardio.
          </p>
        </button>



        {/* Hidratação + Suplementação */}
        <div className="grid gap-3 sm:grid-cols-2">
          <HydrationCard
            consumedMl={waterMl}
            target={hydration}
            climate={climate}
            onClimateChange={setClimate}
            onAdd={(ml) => !preview && addWater(ml)}
            readOnly={preview}
          />


          <Card accent={GOLD}>
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-4 h-4" style={{ color: GOLD }} />
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: GOLD }}>
                Suplementação hoje
              </span>
            </div>
            {supplements.length ? (
              <div className="space-y-2">
                {supplements.slice(0, 5).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSuppChecked((p) => ({ ...p, [i]: !p[i] }))}
                    className="flex items-start gap-2 w-full text-left"
                  >
                    <span
                      className="mt-0.5 w-3.5 h-3.5 rounded-[4px] flex-shrink-0"
                      style={{
                        border: `1px solid ${GOLD}66`,
                        background: suppChecked[i] ? GOLD : "transparent",
                      }}
                    />
                    <span
                      className="text-xs"
                      style={{
                        color: suppChecked[i] ? DIM : TEXT,
                        textDecoration: suppChecked[i] ? "line-through" : "none",
                      }}
                    >
                      {s.suplemento} {s.dose ? `· ${s.dose}` : ""}{" "}
                      <span style={{ color: DIM }}>{s.timing ? `(${s.timing})` : ""}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: DIM }}>
                Sem suplementação prescrita.
              </p>
            )}
          </Card>
        </div>

        {/* Evolução */}
        <Card accent={GOLD}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" style={{ color: GOLD }} />
            <span className="text-xs font-bold tracking-wider uppercase" style={{ color: GOLD }}>
              Minha evolução
            </span>
          </div>
          {weightInfo ? (
            <p className="text-sm">
              Peso: <strong>{weightInfo.weight.toFixed(1)} kg</strong>{" "}
              <span style={{ color: weightInfo.delta <= 0 ? GREEN : GOLD }}>
                ({weightInfo.delta > 0 ? "+" : ""}
                {weightInfo.delta} kg)
              </span>
            </p>
          ) : (
            <p className="text-xs" style={{ color: DIM }}>
              Nenhum registro de peso ainda.
            </p>
          )}
          <p className="text-xs mt-2 flex items-center gap-1" style={{ color: DIM }}>
            <Flame className="w-3 h-3" style={{ color: GOLD }} />
            {weightInfo?.count || 0} registros enviados ao coach
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => !preview && navigate("/checkin")}
              disabled={preview}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40"
              style={{ background: `${GOLD}14`, color: GOLD, border: `1px solid ${GOLD}33` }}
            >
              <Camera className="w-3 h-3" /> Registrar check-in
            </button>
            <button
              onClick={() => !preview && navigate("/checkin")}
              disabled={preview}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.05)", color: DIM }}
            >
              <Scale className="w-3 h-3" /> Registrar peso
            </button>
          </div>
        </Card>

        {/* Mensagem do coach */}
        {coachMessage && (
          <Card accent={CYAN}>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4" style={{ color: CYAN }} />
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: CYAN }}>
                Mensagem do coach
              </span>
            </div>
            <p className="text-sm italic">"{coachMessage.text}"</p>
            <p className="text-[11px] mt-2" style={{ color: DIM }}>
              — {coachName || "Coach"} ·{" "}
              {new Date(coachMessage.date).toLocaleDateString("pt-BR")}
            </p>
          </Card>
        )}
      </main>

      <AddActivitySheet
        open={showActivitySheet && !preview}
        weightKg={weightKg}
        baseKcal={baseKcal + adjustKcal}
        onClose={() => setShowActivitySheet(false)}
        onAdd={async (input) => {
          await addActivity({ ...input, weightKg, climate });
          setShowActivitySheet(false);
        }}
      />
      <PraxisFAB disabled={preview} />
      {!preview && <AthleteBottomNav />}


    </div>
  );
};

export default AthleteDashboard;
