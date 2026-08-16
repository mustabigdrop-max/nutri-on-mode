import { CalendarClock } from "lucide-react";

const CYAN = "#00D4FF";
const GREEN = "#00FF88";
const DIM = "#8A8A8A";

export interface RoutineItem {
  key: string;
  time: string;
  emoji: string;
  label: string;
  detail?: string;
  /** Itens fixos (treino, cardio) não são marcáveis pelo atleta aqui. */
  checkable?: boolean;
}

interface Props {
  items: RoutineItem[];
  completed: Record<string, boolean>;
  onToggle: (key: string) => void;
  readOnly?: boolean;
}

const toMin = (t: string) => {
  const m = String(t || "").match(/(\d{1,2})\s*[:hH]\s*(\d{2})/);
  return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
};

export default function DayRoutineTimeline({ items, completed, onToggle, readOnly }: Props) {
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const nextItem = items.find((i) => {
    const t = toMin(i.time);
    return !completed[i.key] && t !== null && t >= nowMin;
  });
  const done = items.filter((i) => completed[i.key]).length;

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        border: `1px solid ${GREEN}22`,
        borderLeft: `3px solid ${GREEN}`,
        background: `linear-gradient(135deg, ${GREEN}0d, ${GREEN}03)`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock className="w-4 h-4" style={{ color: GREEN }} />
        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: GREEN }}>
          Rotina de hoje
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs" style={{ color: DIM }}>
          Sem rotina definida — seu coach ainda não enviou o plano do dia.
        </p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => {
            const isDone = !!completed[item.key];
            const isNext = nextItem?.key === item.key;
            const color = isDone ? GREEN : isNext ? CYAN : DIM;
            return (
              <button
                key={item.key}
                disabled={readOnly || !item.checkable}
                onClick={() => item.checkable && onToggle(item.key)}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left disabled:cursor-default"
                style={{ background: isNext ? `${CYAN}0f` : "transparent" }}
              >
                <span className="text-[11px] font-mono w-11 flex-shrink-0" style={{ color: DIM }}>
                  {item.time || "--:--"}
                </span>
                <span className="text-sm flex-shrink-0">{item.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span
                    className="text-xs block truncate"
                    style={{
                      color: isDone ? DIM : "#fff",
                      textDecoration: isDone ? "line-through" : "none",
                    }}
                  >
                    {item.label}
                  </span>
                  {item.detail && (
                    <span className="text-[10px] block truncate" style={{ color: DIM }}>
                      {item.detail}
                    </span>
                  )}
                </span>
                <span className="text-xs flex-shrink-0" style={{ color }}>
                  {isDone ? "✅" : isNext ? "◉" : "○"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <p
          className="text-[11px] font-mono mt-3 pt-3"
          style={{ color: DIM, borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          ✅ {done}/{items.length} concluídas
          {nextItem ? ` · ◉ próxima: ${nextItem.label}` : " · dia completo!"}
        </p>
      )}
    </div>
  );
}
