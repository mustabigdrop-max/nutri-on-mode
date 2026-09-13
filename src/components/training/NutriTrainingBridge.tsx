import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Link2, Ruler, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  blockFromWeekPhase,
  computeEnergyBalance,
  currentProteinPerKg,
  phaseNutritionSignal,
  sharedAnthropometry,
  volumeAdjustmentForDeficit,
  type NutriProfileData,
} from "@/lib/nutriTrainingBridge";

const SURFACE = "#0f0f11";
const SURFACE2 = "#16161a";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#F5F0E8";
const MUTED = "#888";
const ORANGE = "#EF9F27";
const TEAL = "#5DCAA5";
const LILAC = "#AFA9EC";

const n = (v: number | null, suffix = "") => (v === null ? "—" : `${String(v).replace(".", ",")}${suffix}`);

/**
 * Fase 5 — ponte NutriPlan ↔ TrainingON.
 * Lê o perfil real do aluno; sem dados nutricionais, o painel não aparece.
 */
export default function NutriTrainingBridge({
  athleteUserId,
  weekPhaseId,
  isDeloadWeek,
  days,
}: {
  athleteUserId?: string | null;
  weekPhaseId?: string | null;
  isDeloadWeek?: boolean;
  days: Array<{ exercises?: any[] }>;
}) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<NutriProfileData | null>(null);

  useEffect(() => {
    if (!athleteUserId) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("weight_kg, lean_mass_kg, bf_percent, waist_cm, height_cm, get_kcal, vet_kcal, protein_g, carbs_g, fat_g, goal, objetivo_principal")
        .eq("user_id", athleteUserId)
        .maybeSingle();
      setProfile((data as NutriProfileData) || null);
    })();
  }, [athleteUserId]);

  const energy = useMemo(() => computeEnergyBalance(profile), [profile]);
  const block = useMemo(() => blockFromWeekPhase(weekPhaseId, isDeloadWeek), [weekPhaseId, isDeloadWeek]);
  const signal = useMemo(() => phaseNutritionSignal(block, energy), [block, energy]);
  const volume = useMemo(() => volumeAdjustmentForDeficit(energy, days || [], !!isDeloadWeek), [energy, days, isDeloadWeek]);
  const antro = useMemo(() => sharedAnthropometry(profile), [profile]);
  const protNow = useMemo(() => currentProteinPerKg(profile), [profile]);

  const hasAnyData =
    energy.state !== "SEM_DADO" ||
    antro.weight_kg !== null ||
    antro.bf_percent !== null ||
    protNow !== null;
  if (!profile || !hasAnyData) return null;

  const stateColor =
    energy.state === "DEFICIT" ? ORANGE : energy.state === "SUPERAVIT" ? TEAL : LILAC;
  const stateLabel =
    energy.state === "DEFICIT" ? "Déficit" : energy.state === "SUPERAVIT" ? "Superávit" : energy.state === "MANUTENCAO" ? "Manutenção" : "Sem dado";

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-2 px-4 py-3">
        <Link2 className="w-3.5 h-3.5" style={{ color: TEAL }} />
        <span className="text-[11px] font-black tracking-wide" style={{ color: TEXT }}>
          NUTRIPLAN ↔ TRAININGON
        </span>
        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${stateColor}1f`, color: stateColor }}>
          {signal.blockLabel} · {stateLabel}
        </span>
        <span className="ml-auto">
          {open ? <ChevronUp className="w-3.5 h-3.5" style={{ color: MUTED }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: MUTED }} />}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2.5">
          {/* Cross-talk de fase */}
          <div className="rounded-lg p-3" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Flame className="w-3 h-3" style={{ color: ORANGE }} />
              <span className="text-[10px] font-bold" style={{ color: TEXT }}>Sinal de fase para o plano alimentar</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]" style={{ color: MUTED }}>
              <div>
                Proteína sugerida:{" "}
                <b style={{ color: TEXT }}>
                  {String(signal.proteinRange[0]).replace(".", ",")}–{String(signal.proteinRange[1]).replace(".", ",")} g/kg
                </b>
              </div>
              <div>
                Proteína atual do plano: <b style={{ color: TEXT }}>{protNow === null ? "sem dado" : `${n(protNow)} g/kg`}</b>
              </div>
              <div>
                Direção calórica: <b style={{ color: TEXT }}>{signal.energyDirection === "DEFICIT" ? "Déficit" : signal.energyDirection === "SUPERAVIT" ? "Superávit leve" : "Manutenção"}</b>
              </div>
              <div>
                Carboidrato: <b style={{ color: TEXT }}>{signal.carbPriority}</b>
              </div>
              {energy.state !== "SEM_DADO" && (
                <div className="col-span-2">
                  GET <b style={{ color: TEXT }}>{n(energy.get_kcal)} kcal</b> · plano{" "}
                  <b style={{ color: TEXT }}>{n(energy.vet_kcal)} kcal</b> ·{" "}
                  <b style={{ color: stateColor }}>
                    {energy.deltaKcal !== null && energy.deltaKcal > 0 ? "+" : ""}
                    {n(energy.deltaKcal)} kcal ({n(energy.deltaPercent, "%")})
                  </b>
                </div>
              )}
            </div>
            {signal.note && (
              <p className="text-[9px] mt-1.5 leading-relaxed" style={{ color: MUTED }}>{signal.note}</p>
            )}
          </div>

          {/* Ajuste de volume em déficit */}
          {volume && (
            <div className="rounded-lg p-3" style={{ background: "rgba(239,159,39,0.07)", border: `1px solid rgba(239,159,39,0.2)` }}>
              <p className="text-[10px] font-bold mb-1" style={{ color: ORANGE }}>
                Déficit de {n(Math.abs(energy.deltaPercent || 0), "%")} — reduzir volume em {volume.reductionPercent}%
              </p>
              <div className="text-[10px] space-y-0.5" style={{ color: MUTED }}>
                {volume.currentSets > 0 && (
                  <p>
                    Séries na semana: <b style={{ color: TEXT }}>{volume.currentSets}</b> → alvo{" "}
                    <b style={{ color: TEXT }}>{volume.targetSets}</b> (retirar {volume.setsToRemove})
                  </p>
                )}
                <p>{volume.keepIntensity}</p>
                <p>{volume.priority}</p>
              </div>
            </div>
          )}

          {/* Antropometria compartilhada */}
          <div className="rounded-lg p-3" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Ruler className="w-3 h-3" style={{ color: LILAC }} />
              <span className="text-[10px] font-bold" style={{ color: TEXT }}>Antropometria compartilhada</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]" style={{ color: MUTED }}>
              <div>Peso <b style={{ color: TEXT }}>{n(antro.weight_kg, " kg")}</b></div>
              <div>Gordura <b style={{ color: TEXT }}>{n(antro.bf_percent, "%")}</b></div>
              <div>Massa magra <b style={{ color: TEXT }}>{n(antro.lean_mass_kg, " kg")}</b></div>
              <div>Cintura <b style={{ color: TEXT }}>{n(antro.waist_cm, " cm")}</b></div>
              <div>Altura <b style={{ color: TEXT }}>{n(antro.height_cm, " cm")}</b></div>
            </div>
            <p className="text-[9px] mt-1.5" style={{ color: MUTED }}>
              Os mesmos números alimentam o plano alimentar e as decisões de carga. Campos vazios aparecem como “—”.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
