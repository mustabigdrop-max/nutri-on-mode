import { useCallback, useEffect, useMemo, useState } from "react";
import { HeartPulse } from "lucide-react";
import { getLocalDateStr } from "@/lib/utils";
import {
  lipedemaChecklist,
  SODIUM_TARGET_DEFAULT_MG,
  sodiumAvoidList,
  type ProtocolChecklistItem,
} from "@/lib/specialConditions";

const CYAN = "#00D4FF";
const GREEN = "#00FF88";
const DIM = "#A0A0A0";

/** Segunda-feira da semana atual — chave estável para itens semanais. */
const weekKey = () => {
  const d = new Date();
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return getLocalDateStr(d);
};

interface Props {
  userId?: string | null;
  sodiumTargetMg?: number | null;
}

export default function LipedemaChecklist({ userId, sodiumTargetMg }: Props) {
  const target = sodiumTargetMg && sodiumTargetMg > 0 ? sodiumTargetMg : SODIUM_TARGET_DEFAULT_MG;
  const items = useMemo(() => lipedemaChecklist(target), [target]);

  const scope = userId || "anon";
  const dayKey = `nutrion:lipedema-daily:${scope}:${getLocalDateStr()}`;
  const wkKey = `nutrion:lipedema-weekly:${scope}:${weekKey()}`;

  const [daily, setDaily] = useState<Record<string, boolean>>({});
  const [weekly, setWeekly] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      setDaily(JSON.parse(localStorage.getItem(dayKey) || "{}"));
      setWeekly(JSON.parse(localStorage.getItem(wkKey) || "{}"));
    } catch {
      setDaily({});
      setWeekly({});
    }
  }, [dayKey, wkKey]);

  const toggleDaily = useCallback(
    (key: string) => {
      setDaily((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        try { localStorage.setItem(dayKey, JSON.stringify(next)); } catch { /* noop */ }
        return next;
      });
    },
    [dayKey],
  );

  const bumpWeekly = useCallback(
    (item: ProtocolChecklistItem) => {
      setWeekly((prev) => {
        const max = item.timesPerWeek || 1;
        const cur = prev[item.key] || 0;
        const next = { ...prev, [item.key]: cur >= max ? 0 : cur + 1 };
        try { localStorage.setItem(wkKey, JSON.stringify(next)); } catch { /* noop */ }
        return next;
      });
    },
    [wkKey],
  );

  const dailyItems = items.filter((i) => i.cadence === "daily");
  const weeklyItems = items.filter((i) => i.cadence === "weekly");
  const doneDaily = dailyItems.filter((i) => daily[i.key]).length;
  const doneWeekly = weeklyItems.reduce(
    (acc, i) => acc + Math.min(weekly[i.key] || 0, i.timesPerWeek || 1),
    0,
  );
  const totalWeekly = weeklyItems.reduce((acc, i) => acc + (i.timesPerWeek || 1), 0);
  const pct = Math.round((doneDaily / Math.max(1, dailyItems.length)) * 100);

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        border: `1px solid ${CYAN}22`,
        borderLeft: `3px solid ${CYAN}`,
        background: `linear-gradient(135deg, ${CYAN}0d, ${CYAN}03)`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <HeartPulse className="w-4 h-4" style={{ color: CYAN }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: CYAN }}>
          Protocolo lipedema · hoje
        </span>
      </div>
      <p className="text-[11px] mb-3" style={{ color: DIM }}>
        Meta de sódio definida pelo seu coach: <span style={{ color: "#fff" }}>&lt; {target.toLocaleString("pt-BR")} mg/dia</span>
      </p>

      <div className="h-1 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-1 rounded-full transition-all"
          style={{ width: `${pct}%`, background: pct === 100 ? GREEN : CYAN }}
        />
      </div>

      <div className="space-y-1">
        {dailyItems.map((item) => {
          const done = !!daily[item.key];
          return (
            <button
              key={item.key}
              onClick={() => toggleDaily(item.key)}
              className="w-full flex items-start gap-2.5 px-2 py-2 rounded-lg text-left"
              style={{ background: done ? `${GREEN}0d` : "transparent" }}
            >
              <span className="text-sm flex-shrink-0">{item.emoji}</span>
              <span className="flex-1 min-w-0">
                <span
                  className="text-xs block"
                  style={{ color: done ? DIM : "#fff", textDecoration: done ? "line-through" : "none" }}
                >
                  {item.label}
                </span>
                <span className="text-[10px] block" style={{ color: DIM }}>{item.detail}</span>
              </span>
              <span className="text-xs flex-shrink-0" style={{ color: done ? GREEN : DIM }}>
                {done ? "✅" : "○"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] font-mono mt-3 pt-3" style={{ color: DIM, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        ✅ {doneDaily}/{dailyItems.length} do dia
      </p>

      <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: DIM }}>
          Semana · {doneWeekly}/{totalWeekly}
        </p>
        <div className="space-y-1">
          {weeklyItems.map((item) => {
            const max = item.timesPerWeek || 1;
            const count = Math.min(weekly[item.key] || 0, max);
            const full = count >= max;
            return (
              <button
                key={item.key}
                onClick={() => bumpWeekly(item)}
                className="w-full flex items-start gap-2.5 px-2 py-2 rounded-lg text-left"
                style={{ background: full ? `${GREEN}0d` : "transparent" }}
              >
                <span className="text-sm flex-shrink-0">{item.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="text-xs block" style={{ color: full ? DIM : "#fff" }}>{item.label}</span>
                  <span className="text-[10px] block" style={{ color: DIM }}>{item.detail}</span>
                </span>
                <span className="text-[11px] font-mono flex-shrink-0" style={{ color: full ? GREEN : DIM }}>
                  {count}/{max}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] mt-3" style={{ color: "#666" }}>
        🧂 Evitar nesta meta: {sodiumAvoidList(target).join(" · ")}
      </p>
    </div>
  );
}
