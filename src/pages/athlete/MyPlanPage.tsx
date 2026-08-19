import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronDown, UtensilsCrossed, Pill, Repeat, Info, Table2, ShoppingCart,
} from "lucide-react";
import { useAthletePlans, mealKcal, type AthleteMeal } from "@/hooks/useAthletePlans";
import AthleteBottomNav from "@/components/athlete/AthleteBottomNav";
import NutritionMap from "@/components/athlete/NutritionMap";
import { useAthleteTarget } from "@/hooks/useAthleteTarget";
import { useCoachRoleConfig } from "@/hooks/useCoachRoleConfig";
import { LoadingState, ErrorState } from "@/components/nutriplan/NutriPlanStates";
import { sanitizeClientText, coachGuidanceText } from "@/lib/clientLanguage";
import { safeString } from "@/lib/utils";
import { normalizeFoodItem, type NormalizedFood } from "@/lib/foodSpecificity";
import { buildShoppingList } from "@/lib/shoppingList";
import { supabase } from "@/integrations/supabase/client";
import LipedemaChecklist from "@/components/athlete/LipedemaChecklist";


const BG = "#020205";
const CYAN = "#00D4FF";
const TEXT = "#FFFFFF";
const DIM = "#A0A0A0";
const FREE = "#00FF88";

const FOOD_EMOJI: Array<[RegExp, string]> = [
  [/ovo/i, "🥚"], [/aveia|granola|cereal/i, "🥣"], [/banana/i, "🍌"], [/ma[çc][ãa]/i, "🍎"],
  [/frango|peito de frango/i, "🍗"], [/carne|patinho|alcatra|b[íi]fe/i, "🥩"], [/peixe|til[áa]pia|salm[ãa]o|atum/i, "🐟"],
  [/arroz/i, "🍚"], [/feij[ãa]o|lentilha|gr[ãa]o/i, "🫘"], [/batata|mandioca|inhame/i, "🥔"],
  [/leite|iogurte|whey|queijo/i, "🥛"], [/p[ãa]o|tapioca|torrada/i, "🍞"], [/azeite|[óo]leo|manteiga/i, "🫒"],
  [/castanha|am[êe]ndoa|noz|pasta de amendoim/i, "🥜"], [/br[óo]colis|cenoura|abobrinha|vagem|legume/i, "🥦"],
  [/salada|alface|r[úu]cula|agri[ãa]o|vegetal|verdura/i, "🥗"],
  [/fruta|mam[ãa]o|melancia|abacaxi|morango|laranja/i, "🍓"], [/abacate/i, "🥑"], [/[áa]gua|suco|ch[áa]/i, "💧"],
];

const emojiFor = (name: unknown) => {
  const n = safeString(name);
  for (const [re, e] of FOOD_EMOJI) if (re.test(n)) return e;
  return "•";
};

const GROUP_LABEL: Record<string, string> = {
  protein: "PROTEÍNA",
  carb: "CARBOIDRATO",
  fat: "GORDURA",
  vegetable: "VEGETAL / FIBRA",
  dairy: "LÁCTEO",
  fruit: "FRUTA",
};

/** Medida caseira é o principal; gramatura fica como referência secundária. */

const FoodRow = ({ food, last }: { food: NormalizedFood; last: boolean }) => {
  const [showSubs, setShowSubs] = useState(false);
  return (
    <div
      className="py-3"
      style={{ borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.05)" }}
    >
      <p className="flex items-center gap-2" style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>
        <span>{emojiFor(food.alimento)}</span> {food.alimento}
      </p>

      {food.livre ? (
        <p className="mt-0.5 pl-6 italic" style={{ fontSize: 14, color: FREE }} data-testid="portion-free">
          À vontade
        </p>
      ) : (
        <>
          <p
            className="mt-0.5 pl-6"
            style={{ fontSize: 16, fontWeight: 700, color: TEXT }}
            data-testid="portion-primary"
          >
            {food.medida}
          </p>
          {food.gramas && (
            <p
              className="mt-0.5 pl-6 font-mono"
              style={{ fontSize: 12, color: "#555" }}
              data-testid="portion-secondary"
            >
              ≈ {food.gramas.replace(/^≈\s*/, "")}
            </p>
          )}
        </>
      )}

      {food.observacao && (
        <p className="mt-1 pl-6 flex items-start gap-1" style={{ fontSize: 12, color: "#8a8a8a", fontStyle: "italic" }}>
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" /> {sanitizeClientText(food.observacao)}
        </p>
      )}

      {!!food.substituicoes.length && (
        <div className="pl-6 mt-2">
          <button
            onClick={() => setShowSubs((s) => !s)}
            className="flex items-center gap-1.5"
            style={{ fontSize: 11, color: CYAN }}
          >
            <Repeat className="w-3 h-3" />
            {showSubs ? "Ocultar substituições" : "Ver substituições"}
            <ChevronDown className="w-3 h-3 transition-transform" style={{ transform: showSubs ? "rotate(180deg)" : "none" }} />
          </button>
          {showSubs && (
            <div className="mt-1.5 space-y-1" style={{ borderLeft: `1px solid ${CYAN}33`, paddingLeft: 10 }}>
              <p className="font-mono uppercase tracking-wider" style={{ fontSize: 9, color: `${CYAN}99` }}>
                Mesmo grupo: {GROUP_LABEL[food.grupo] || "equivalente"}
              </p>
              {food.substituicoes.map((s, i) => (
                <p key={i} style={{ fontSize: 12, color: DIM }}>
                  <span style={{ color: TEXT }}>{s.alimento}</span> — {s.medida}
                </p>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

const MealCard = ({ meal, index }: { meal: AthleteMeal; index: number }) => {
  const [open, setOpen] = useState(index === 0);
  const foods = useMemo(
    () => (meal.alimentos || []).flatMap((a) => normalizeFoodItem(a)),
    [meal.alimentos],
  );

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: `1px solid ${CYAN}22`,
        borderLeft: `3px solid ${CYAN}`,
        background: `linear-gradient(135deg, ${CYAN}0d, ${CYAN}03)`,
      }}
    >
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{meal.refeicao}</p>
          <p className="text-xs mt-0.5 font-mono" style={{ color: DIM }}>
            {meal.horario || "--:--"} · {mealKcal(meal)} kcal
          </p>
        </div>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform"
          style={{ color: DIM, transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {foods.map((f, i) => (
                <FoodRow key={`${f.alimento}-${i}`} food={f} last={i === foods.length - 1} />
              ))}

              <div className="pt-2 flex items-center gap-3 font-mono" style={{ fontSize: 11, color: DIM }}>
                <span>P {Math.round(Number(meal.macros?.proteina) || 0)}g</span>
                <span>·</span>
                <span>C {Math.round(Number(meal.macros?.carboidrato) || 0)}g</span>
                <span>·</span>
                <span>G {Math.round(Number(meal.macros?.gordura) || 0)}g</span>
              </div>

              {meal.nota && (
                <p className="text-[11px] pt-2 italic" style={{ color: DIM }}>
                  {sanitizeClientText(meal.nota)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MyPlanPage = () => {
  const navigate = useNavigate();
  const targetId = useAthleteTarget();
  const { loading, error, mealPlan, refetch } = useAthletePlans(targetId || undefined);
  const [tab, setTab] = useState<"plano" | "mapa">("plano");
  const { config: roleConfig } = useCoachRoleConfig(targetId || undefined);

  useEffect(() => {
    document.title = "Meu Plano Alimentar · NUTRION";
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => { void refetch(); }} />;
  }


  const r = (mealPlan?.resumo || {}) as Record<string, any>;
  const orientacao = coachGuidanceText(mealPlan?.observacao || r.observacao_protocolo);
  const compras = mealPlan ? buildShoppingList(mealPlan.refeicoes) : [];

  return (
    <div className="min-h-screen pb-28" style={{ background: BG, color: TEXT }}>
      <header className="px-4 pt-6 pb-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)" }}
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" style={{ color: DIM }} />
          </button>
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5" style={{ color: CYAN }} />
              Meu Plano Alimentar
            </h1>
            {mealPlan && (
              <p className="text-[11px]" style={{ color: DIM }}>
                Atualizado em {new Date(mealPlan.updatedAt).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        </div>

        {mealPlan && (
          <div className="flex gap-2">
            {([["plano", "Plano"], ["mapa", "Mapa Nutricional"]] as const).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setTab(v)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{
                  border: `1px solid ${tab === v ? CYAN : "rgba(255,255,255,0.12)"}`,
                  background: tab === v ? `${CYAN}18` : "transparent",
                  color: tab === v ? CYAN : DIM,
                }}
              >
                {v === "mapa" && <Table2 className="w-3 h-3" />} {l}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="px-4 max-w-3xl mx-auto space-y-3">
        {!mealPlan ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ border: `1px solid ${CYAN}22`, background: `${CYAN}08` }}
          >
            <p className="text-sm font-semibold">Nenhum plano alimentar enviado ainda</p>
            <p className="text-xs mt-1" style={{ color: DIM }}>
              Assim que seu coach enviar, ele aparece aqui.
            </p>
          </div>
        ) : tab === "mapa" ? (
          <NutritionMap
            meals={mealPlan.refeicoes}
            resumo={r}
            userId={targetId || undefined}
          />
        ) : (
          <>
            <div
              className="rounded-2xl p-4 grid grid-cols-4 gap-2 text-center"
              style={{ border: `1px solid ${CYAN}22`, background: `linear-gradient(135deg, ${CYAN}12, ${CYAN}03)` }}
            >
              {[
                ["kcal", Math.round(r.calorias_totais || 0)],
                ["Prot", `${Math.round(r.proteina_total || 0)}g`],
                ["Carb", `${Math.round(r.carboidrato_total || 0)}g`],
                ["Gord", `${Math.round(r.gordura_total || 0)}g`],
              ].map(([l, v]) => (
                <div key={l as string}>
                  <p className="text-lg font-black font-mono" style={{ color: CYAN }}>{v}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: DIM }}>{l}</p>
                </div>
              ))}
            </div>

            {(mealPlan.objetivo || r.objetivo) && (
              <p className="text-xs px-1" style={{ color: DIM }}>
                Objetivo: <span style={{ color: TEXT }}>{sanitizeClientText(r.objetivo || mealPlan.objetivo)}</span>
              </p>
            )}

            {mealPlan.refeicoes.map((m, i) => (
              <MealCard key={i} meal={m} index={i} />
            ))}

            {!!mealPlan.suplementacao.length && (
              <div
                className="rounded-2xl p-4"
                style={{ border: `1px solid ${CYAN}22`, background: `${CYAN}08` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="w-4 h-4" style={{ color: CYAN }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: CYAN }}>
                    Suplementação
                  </span>
                </div>
                <div className="space-y-2">
                  {mealPlan.suplementacao.map((s, i) => (
                    <div key={i}>
                      <p className="text-sm">
                        {s.suplemento} <span style={{ color: CYAN }}>{s.dose}</span>
                      </p>
                      <p className="text-[11px]" style={{ color: DIM }}>
                        {sanitizeClientText(s.timing)} {s.justificativa ? `· ${sanitizeClientText(s.justificativa)}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!!compras.length && (
              <div
                className="rounded-2xl p-4"
                style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-4 h-4" style={{ color: CYAN }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: CYAN }}>
                    Lista de compras semanal
                  </p>
                </div>
                <p className="text-[11px] mb-3" style={{ color: DIM }}>
                  Baseada no seu plano · 7 dias
                </p>

                <div className="space-y-4">
                  {compras.map((g) => (
                    <div key={g.section}>
                      <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: TEXT }}>
                        {g.emoji} {g.label}
                      </p>
                      <div className="space-y-1">
                        {g.items.map((it) => (
                          <div
                            key={it.name}
                            className="flex items-baseline gap-2 text-[12px]"
                            style={{ fontFamily: "'Space Mono', ui-monospace, monospace" }}
                          >
                            <span className="capitalize" style={{ color: TEXT }}>{it.name}</span>
                            <span className="flex-1" style={{ borderBottom: "1px dotted rgba(255,255,255,0.15)" }} />
                            <span style={{ color: it.amount === "à vontade" ? FREE : DIM }}>{it.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              className="rounded-2xl p-4"
              style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: DIM }}>
                Orientações do coach
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {orientacao || "Plano gerado e validado pelo NUTRION ENGINE."}
              </p>
              <p className="text-[11px] mt-3 pt-3 italic" style={{ color: "#666", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {roleConfig.planNoun} · {roleConfig.disclaimer}
              </p>
            </div>
          </>
        )}
      </main>

      <AthleteBottomNav />
    </div>
  );
};

export default MyPlanPage;

