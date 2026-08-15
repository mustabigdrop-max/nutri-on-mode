import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, Flame } from "lucide-react";
import { MCE_24H_BLOCKS, MCE_24H_TOTAL_ITEMS } from "@/data/mceProtocol24hBlocks";

const MONO = "'Space Mono', ui-monospace, monospace";
const DISPLAY = "'Rajdhani', system-ui, sans-serif";

const STORAGE_KEY = "mce_24h_checklist";
const STREAK_KEY = "mce_24h_streak";

type Stored = { date: string; done: string[] };

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadToday(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as Stored;
    if (parsed?.date !== todayKey()) return new Set();
    return new Set(Array.isArray(parsed.done) ? parsed.done : []);
  } catch {
    return new Set();
  }
}

function readStreak(): { count: number; lastDate: string } {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, lastDate: "" };
    const p = JSON.parse(raw);
    return { count: Number(p?.count) || 0, lastDate: String(p?.lastDate || "") };
  } catch {
    return { count: 0, lastDate: "" };
  }
}

export default function Protocol24hChecklist() {
  const [done, setDone] = useState<Set<string>>(() => loadToday());
  const [streak, setStreak] = useState(() => readStreak().count);

  useEffect(() => {
    const payload: Stored = { date: todayKey(), done: Array.from(done) };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch { /* ignore */ }
  }, [done]);

  const completed = done.size;
  const pct = Math.round((completed / MCE_24H_TOTAL_ITEMS) * 100);

  // Streak: conta o dia quando o protocolo é 100% concluído
  useEffect(() => {
    if (completed !== MCE_24H_TOTAL_ITEMS) return;
    const { count, lastDate } = readStreak();
    const today = todayKey();
    if (lastDate === today) return;
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yKey = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, "0")}-${String(yest.getDate()).padStart(2, "0")}`;
    const next = lastDate === yKey ? count + 1 : 1;
    try { localStorage.setItem(STREAK_KEY, JSON.stringify({ count: next, lastDate: today })); } catch { /* ignore */ }
    setStreak(next);
  }, [completed]);

  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleBlock = useCallback((ids: string[], allDone: boolean) => {
    setDone((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allDone ? next.delete(id) : next.add(id)));
      return next;
    });
  }, []);

  const resetDay = useCallback(() => setDone(new Set()), []);

  const blocks = useMemo(() => MCE_24H_BLOCKS, []);

  return (
    <div style={{ marginBottom: 22 }}>
      {/* Header / progresso global */}
      <div style={{
        padding: "16px 16px 14px", borderRadius: 14, marginBottom: 14,
        background: "rgba(45,212,191,0.05)", border: "1px solid rgba(45,212,191,0.22)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1.5, color: "#2DD4BF" }}>
              CHECKLIST DIÁRIO · {todayKey()}
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
              {completed} de {MCE_24H_TOTAL_ITEMS} ações concluídas · {pct}%
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {streak > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999,
                background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)",
                fontFamily: MONO, fontSize: 11, color: "#F59E0B",
              }}>
                <Flame size={13} /> {streak}D
              </div>
            )}
            <button
              onClick={resetDay}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
                background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)", fontFamily: MONO, fontSize: 11, cursor: "pointer",
              }}
            >
              <RotateCcw size={12} /> RESETAR
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{
            width: `${pct}%`, height: "100%", borderRadius: 999,
            background: "linear-gradient(90deg,#2DD4BF,#4ADE80)", transition: "width .35s ease",
          }} />
        </div>
      </div>

      {/* Blocos */}
      <div style={{ display: "grid", gap: 12 }}>
        {blocks.map((block) => {
          const ids = block.items.map((i) => i.id);
          const blockDone = ids.filter((id) => done.has(id)).length;
          const allDone = blockDone === ids.length;
          return (
            <div key={block.id} style={{
              borderRadius: 14, padding: "14px 14px 10px",
              background: allDone ? `${block.color}0f` : "rgba(255,255,255,0.02)",
              border: `1px solid ${allDone ? `${block.color}55` : "rgba(255,255,255,0.07)"}`,
              transition: "background .25s ease, border-color .25s ease",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1.2, color: block.color }}>
                    {block.time} · {block.pillarLabel} · {block.duration}
                  </div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>
                    {block.title}
                  </div>
                </div>
                <button
                  onClick={() => toggleBlock(ids, allDone)}
                  style={{
                    padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                    background: allDone ? `${block.color}22` : "transparent",
                    border: `1px solid ${block.color}66`, color: block.color,
                    fontFamily: MONO, fontSize: 10, whiteSpace: "nowrap",
                  }}
                >
                  {allDone ? "DESMARCAR" : "MARCAR TUDO"}
                </button>
              </div>

              <div style={{ marginTop: 6, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{
                  width: `${(blockDone / ids.length) * 100}%`, height: "100%",
                  background: block.color, transition: "width .3s ease",
                }} />
              </div>

              <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                {block.items.map((item) => {
                  const checked = done.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      aria-pressed={checked}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                        padding: "8px 10px", borderRadius: 10, cursor: "pointer",
                        background: checked ? "rgba(255,255,255,0.04)" : "transparent",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <span style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: checked ? block.color : "transparent",
                        border: `1px solid ${checked ? block.color : "rgba(255,255,255,0.25)"}`,
                        transition: "background .2s ease",
                      }}>
                        {checked && <Check size={12} color="#04070a" strokeWidth={3} />}
                      </span>
                      <span style={{
                        fontFamily: DISPLAY, fontSize: 14,
                        color: checked ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.85)",
                        textDecoration: checked ? "line-through" : "none",
                      }}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
