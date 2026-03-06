import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { NutrientSummary, DailyNutrientData } from "@/hooks/useMicronutrients";

interface NutrientChartProps {
  dailyData: DailyNutrientData[];
  nutrients: NutrientSummary[];
}

const TOP_NUTRIENTS = ["ferro_mg", "calcio_mg", "vitamina_c_mg", "vitamina_d_mcg", "fibras_g", "omega3_mg"];

const NutrientChart = ({ dailyData, nutrients }: NutrientChartProps) => {
  const [selected, setSelected] = useState<string[]>(["ferro_mg", "vitamina_c_mg"]);

  const toggle = (key: string) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : prev.length < 3 ? [...prev, key] : [key]
    );
  };

  const chartNutrients = nutrients.filter(n => TOP_NUTRIENTS.includes(n.nutrient));

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      {/* Selector chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {chartNutrients.map(n => (
          <button
            key={n.nutrient}
            onClick={() => toggle(n.nutrient)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              selected.includes(n.nutrient)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={dailyData}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={v => v.slice(5)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
              fontSize: 11,
            }}
          />
          {selected.map(key => {
            const cfg = nutrients.find(n => n.nutrient === key);
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={cfg?.label || key}
                stroke={cfg?.color || "hsl(var(--primary))"}
                strokeWidth={2}
                dot={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NutrientChart;
