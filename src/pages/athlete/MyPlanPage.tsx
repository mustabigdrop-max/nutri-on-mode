import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronDown, UtensilsCrossed, Pill, Repeat, Info, Table2,
} from "lucide-react";
import { useAthletePlans, mealKcal, type AthleteMeal } from "@/hooks/useAthletePlans";
import AthleteBottomNav from "@/components/athlete/AthleteBottomNav";
import NutritionMap from "@/components/athlete/NutritionMap";
import { useAthleteTarget } from "@/hooks/useAthleteTarget";
import { LoadingState, ErrorState } from "@/components/nutriplan/NutriPlanStates";
import { sanitizeClientText, coachGuidanceText } from "@/lib/clientLanguage";
import { safeString, safeLower } from "@/lib/utils";
import { portionOf, portionParts } from "@/lib/portionDisplay";


const BG = "#020205";
const CYAN = "#00D4FF";
const TEXT = "#FFFFFF";
const DIM = "#A0A0A0";

const FOOD_EMOJI: Array<[RegExp, string]> = [
  [/ovo/i, "🥚"], [/aveia|granola|cereal/i, "🥣"], [/banana/i, "🍌"], [/ma[çc][ãa]/i, "🍎"],
  [/frango|peito de frango/i, "🍗"], [/carne|patinho|alcatra|b[íi]fe/i, "🥩"], [/peixe|til[áa]pia|salm[ãa]o|atum/i, "🐟"],
  [/arroz/i, "🍚"], [/feij[ãa]o|lentilha|gr[ãa]o/i, "🫘"], [/batata|mandioca|inhame/i, "🥔"],
  [/leite|iogurte|whey|queijo/i, "🥛"], [/p[ãa]o|tapioca|torrada/i, "🍞"], [/azeite|[óo]leo|manteiga/i, "🫒"],
  [/castanha|am[êe]ndoa|noz|pasta de amendoim/i, "🥜"], [/salada|alface|br[óo]colis|legume|vegetal/i, "🥗"],
  [/fruta|mam[ãa]o|melancia|abacaxi|morango|laranja/i, "🍓"], [/abacate/i, "🥑"], [/[áa]gua|suco|ch[áa]/i, "💧"],
];

const emojiFor = (name: unknown) => {
  const n = safeString(name);
  for (const [re, e] of FOOD_EMOJI) if (re.test(n)) return e;
  return "•";
};

/** Medida caseira é o principal; gramatura fica como referência secundária. */


const MealCard = ({ meal, index }: { meal: AthleteMeal; index: number }) => {
  const [open, setOpen] = useState(index === 0);
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
              {(meal.alimentos || []).map((a, i) => (
                <div
                  key={i}
                  className="py-3"
                  style={{ borderBottom: i < (meal.alimentos?.length || 0) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                >
                  <p className="text-[13px] font-semibold flex items-center gap-2" style={{ color: TEXT }}>
                    <span>{emojiFor(a.alimento)}</span> {safeString(a.alimento)}
                  </p>
                  <p
                    className="text-[15px] mt-0.5 pl-6 font-semibold"
                    style={{ color: TEXT }}
                    data-testid="portion-primary"
                  >
                    {portionParts(a).primary}
                  </p>
                  {portionParts(a).secondary && (
                    <p
                      className="text-[11px] mt-0.5 pl-6 font-mono"
                      style={{ color: DIM }}
                      data-testid="portion-secondary"
                    >
                      ≈ {portionParts(a).secondary}
                    </p>
                  )}
                  {a.observacao && (
                    <p className="mt-1 pl-6 flex items-start gap-1" style={{ fontSize: 12, color: "#8a8a8a", fontStyle: "italic" }}>
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" /> {sanitizeClientText(a.observacao)}
                    </p>
                  )}
                  {!!a.substituicoes?.length && (
                    <p className="text-[11px] mt-1 pl-6 flex items-start gap-1" style={{ color: DIM }}>
                      <Repeat className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: CYAN }} />
                      {a.substituicoes
                        .map((s) => `${safeString(s.alimento)} ${portionOf(s)}`.trim())
                        .join(" · ")}
                    </p>
                  )}
                </div>
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


const weeklyShoppingList = (meals: AthleteMeal[]) => {
  const map = new Map<string, number>();
  meals.forEach((m) =>
    (m.alimentos || []).forEach((a) => {
      const name = safeString(a.alimento).trim();
      if (!name) return;
      const raw = safeString(a.quantidade_g) || safeString(a.quantidade);
      const match = raw.match(/(\d+(?:[.,]\d+)?)\s*g/i);
      const grams = match ? parseFloat(match[1].replace(",", ".")) : 0;
      const key = safeLower(name);
      map.set(key, (map.get(key) || 0) + grams * 7);
    }),
  );
  return Array.from(map.entries())
    .map(([name, grams]) => ({ name, grams }))
    .sort((a, b) => b.grams - a.grams);
};

const MyPlanPage = () => {
  const navigate = useNavigate();
  const targetId = useAthleteTarget();
  const { loading, error, mealPlan, refetch } = useAthletePlans(targetId || undefined);
  const [tab, setTab] = useState<"plano" | "mapa">("plano");

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
  const compras = mealPlan ? weeklyShoppingList(mealPlan.refeicoes) : [];

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
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: CYAN }}>
                  Lista de compras semanal
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {compras.map((c) => (
                    <div key={c.name} className="flex justify-between text-[12px]" style={{ fontFamily: "'Space Mono', ui-monospace, monospace" }}>
                      <span className="truncate capitalize" style={{ color: TEXT }}>{c.name}</span>
                      <span style={{ color: DIM }}>{c.grams ? `${(c.grams / 1000).toFixed(2)}kg` : "—"}</span>
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
            </div>
          </>
        )}
      </main>

      <AthleteBottomNav />
    </div>
  );
};

export default MyPlanPage;

