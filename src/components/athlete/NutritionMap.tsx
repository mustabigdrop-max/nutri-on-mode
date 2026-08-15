import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AthleteMeal } from "@/hooks/useAthletePlans";
import { safeString } from "@/lib/utils";

const CYAN = "#00D4FF";
const GREEN = "#00FF88";
const AMBER = "#F59E0B";
const DIM = "#A0A0A0";
const MONO = "'Space Mono', ui-monospace, monospace";

const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(safeString(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const gramsOf = (item: { quantidade_g?: string; quantidade?: string }) => {
  const raw = safeString(item.quantidade_g) || safeString(item.quantidade);
  const m = raw.match(/(\d+(?:[.,]\d+)?)\s*g/i) || raw.match(/(\d+(?:[.,]\d+)?)/);
  return m ? num(m[1]) : 0;
};

export interface NutritionMapProps {
  meals: AthleteMeal[];
  resumo: Record<string, unknown>;
  userId?: string | null;
}

const NutritionMap = ({ meals, resumo, userId }: NutritionMapProps) => {
  const [weightKg, setWeightKg] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("weight_kg")
        .eq("user_id", userId)
        .maybeSingle();
      if (alive) setWeightKg(data?.weight_kg ?? null);
    })();
    return () => { alive = false; };
  }, [userId]);

  const rows = useMemo(
    () =>
      meals.map((m) => {
        const p = num(m.macros?.proteina);
        const c = num(m.macros?.carboidrato);
        const g = num(m.macros?.gordura);
        const kcal = num(m.kcal_calculada) || num(m.calorias) || Math.round(p * 4 + c * 4 + g * 9);
        return { nome: safeString(m.refeicao) || "Refeição", p, c, g, kcal, alimentos: m.alimentos || [] };
      }),
    [meals],
  );

  const totals = useMemo(() => {
    const t = rows.reduce(
      (a, r) => ({ p: a.p + r.p, c: a.c + r.c, g: a.g + r.g, kcal: a.kcal + r.kcal }),
      { p: 0, c: 0, g: 0, kcal: 0 },
    );
    const resumoKcal = num((resumo as any)?.calorias_totais);
    return {
      p: Math.round(num((resumo as any)?.proteina_total) || t.p),
      c: Math.round(num((resumo as any)?.carboidrato_total) || t.c),
      g: Math.round(num((resumo as any)?.gordura_total) || t.g),
      kcal: Math.round(resumoKcal || t.kcal),
    };
  }, [rows, resumo]);

  const kcalFromMacros = totals.p * 4 + totals.c * 4 + totals.g * 9 || 1;
  const pct = {
    p: Math.round((totals.p * 4 * 100) / kcalFromMacros),
    c: Math.round((totals.c * 4 * 100) / kcalFromMacros),
    g: Math.round((totals.g * 9 * 100) / kcalFromMacros),
  };

  const fibras = num((resumo as any)?.fibras_total) || num((resumo as any)?.fibra_total);
  const agua = weightKg ? (weightKg * 35) / 1000 : null;

  const Bar = ({ label, grams, percent, color }: { label: string; grams: number; percent: number; color: string }) => (
    <div className="flex items-center gap-2">
      <span className="w-[86px] text-[11px]" style={{ fontFamily: MONO, color }}>{label}</span>
      <div className="flex-1 h-[10px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: `${Math.min(percent, 100)}%`, height: "100%", background: color }} />
      </div>
      <span className="w-[52px] text-right text-[11px]" style={{ fontFamily: MONO, color: "#fff" }}>{grams}g</span>
      <span className="w-[38px] text-right text-[11px]" style={{ fontFamily: MONO, color: DIM }}>{percent}%</span>
    </div>
  );

  return (
    <section
      className="rounded-2xl p-4 mt-2"
      style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${CYAN}33` }}
    >
      <h2
        className="text-sm font-black uppercase"
        style={{ fontFamily: MONO, letterSpacing: 3, color: CYAN }}
      >
        Mapa Nutricional
      </h2>
      <p className="text-[11px] mt-1" style={{ color: DIM }}>
        Referência técnica com gramaturas exatas
      </p>

      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: DIM, fontFamily: MONO }}>
          Meta diária: <span style={{ color: "#fff" }}>{totals.kcal.toLocaleString("pt-BR")} kcal</span>
        </p>
        <div className="space-y-1.5">
          <Bar label="Proteína" grams={totals.p} percent={pct.p} color={CYAN} />
          <Bar label="Carboidrato" grams={totals.c} percent={pct.c} color={GREEN} />
          <Bar label="Gordura" grams={totals.g} percent={pct.g} color={AMBER} />
        </div>
        <p className="text-[11px] mt-2" style={{ color: DIM, fontFamily: MONO }}>
          Fibras: {fibras ? `~${Math.round(fibras)}g` : "—"} · Água sugerida: {agua ? `~${agua.toFixed(1)}L` : "—"}
        </p>
      </div>

      <h3 className="text-[11px] uppercase tracking-widest mt-5 mb-2" style={{ color: CYAN, fontFamily: MONO }}>
        Distribuição por refeição
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontFamily: MONO, fontSize: 12 }}>
          <thead>
            <tr style={{ color: DIM }}>
              <th className="text-left py-1">Refeição</th>
              <th className="text-right py-1" style={{ color: CYAN }}>P</th>
              <th className="text-right py-1" style={{ color: GREEN }}>C</th>
              <th className="text-right py-1" style={{ color: AMBER }}>G</th>
              <th className="text-right py-1">kcal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ background: i % 2 ? "rgba(255,255,255,0.02)" : "transparent", color: "#fff" }}>
                <td className="py-1 pr-2">{r.nome}</td>
                <td className="py-1 text-right">{Math.round(r.p)}g</td>
                <td className="py-1 text-right">{Math.round(r.c)}g</td>
                <td className="py-1 text-right">{Math.round(r.g)}g</td>
                <td className="py-1 text-right">{Math.round(r.kcal)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: `1px solid ${CYAN}55`, color: "#fff", fontWeight: 700 }}>
              <td className="py-1.5">TOTAL</td>
              <td className="py-1.5 text-right">{totals.p}g</td>
              <td className="py-1.5 text-right">{totals.c}g</td>
              <td className="py-1.5 text-right">{totals.g}g</td>
              <td className="py-1.5 text-right">{totals.kcal}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-[11px] uppercase tracking-widest mt-5 mb-2" style={{ color: CYAN, fontFamily: MONO }}>
        Gramatura por alimento
      </h3>
      <div className="space-y-4">
        {rows.map((r, i) => (
          <div key={i}>
            <p className="text-[12px] mb-1" style={{ color: "#fff", fontFamily: MONO }}>{r.nome}</p>
            <table className="w-full" style={{ fontFamily: MONO, fontSize: 12 }}>
              <thead>
                <tr style={{ color: DIM }}>
                  <th className="text-left py-1">Alimento</th>
                  <th className="text-right py-1">Gramas</th>
                  <th className="text-right py-1">Medida caseira</th>
                </tr>
              </thead>
              <tbody>
                {r.alimentos.map((a, j) => {
                  const grams = gramsOf(a);
                  const caseira = safeString(a.quantidade);
                  const isCaseira = caseira && !/^\s*\d+(?:[.,]\d+)?\s*g\s*$/i.test(caseira);
                  return (
                    <tr key={j} style={{ background: j % 2 ? "rgba(255,255,255,0.02)" : "transparent", color: "#fff" }}>
                      <td className="py-1 pr-2">{safeString(a.alimento)}</td>
                      <td className="py-1 text-right">{grams ? `${Math.round(grams)}g` : "—"}</td>
                      <td className="py-1 text-right" style={{ color: DIM }}>{isCaseira ? caseira : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NutritionMap;
