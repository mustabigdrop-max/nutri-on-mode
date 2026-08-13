import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UtensilsCrossed, Dumbbell, Droplets, Pill, TrendingUp, MessageSquare,
  ChevronRight, Bell, User, Flame, Camera, Scale, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAthleteView } from "@/hooks/useAthleteView";
import { useAthletePlans, mealKcal } from "@/hooks/useAthletePlans";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import AthleteBottomNav from "@/components/athlete/AthleteBottomNav";
import PraxisFAB from "@/components/praxis/PraxisFAB";
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
  const waterTarget = 3400;

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
        {/* Plano + Treino */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Card accent={CYAN} onClick={() => !preview && navigate("/my-plan")}>
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

          <Card accent={GREEN} onClick={() => !preview && navigate("/my-training")}>
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

        {/* Hidratação + Suplementação */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Card accent={CYAN}>
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-4 h-4" style={{ color: CYAN }} />
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: CYAN }}>
                Hidratação
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (waterMl / waterTarget) * 100)}%` }}
                style={{ background: CYAN }}
              />
            </div>
            <p className="text-xs mt-2 font-mono" style={{ color: DIM }}>
              {(waterMl / 1000).toFixed(1)} / {(waterTarget / 1000).toFixed(1)} L
            </p>
            <div className="flex gap-2 mt-3">
              {[250, 500].map((ml) => (
                <button
                  key={ml}
                  disabled={preview}
                  onClick={() => !preview && addWater(ml)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40"
                  style={{ background: `${CYAN}14`, color: CYAN, border: `1px solid ${CYAN}33` }}
                >
                  + {ml}ml
                </button>
              ))}
            </div>
          </Card>

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

      <PraxisFAB />
      <AthleteBottomNav />
    </div>
  );
};

export default AthleteDashboard;
