import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, CalendarDays, Check, Film, Layers, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CALENDAR_30, DAILY_PILLARS, pillarById } from "@/data/dailyContentSystem";
import ReelsSchedulePanel, { ScheduleBadge, cancelScheduled, useScheduledPosts } from "./ReelsSchedulePanel";

const C = {
  bg: "#020205", card: "#080810", border: "#B8922A22", gold: "#B8922A",
  green: "#00C896", cyan: "#00D4FF", text: "#F5F0E8", textMid: "#A0A0A0", textMuted: "#4A4A4A",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

type Row = {
  id: string;
  date: string;
  day_index: number | null;
  topic: string;
  hook: string | null;
  pillar: string;
  status: string;
  reel_done: boolean;
  stories_done: boolean;
};

const isoDay = (start: Date, offset: number) => {
  const d = new Date(start);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export default function ReelsCalendar30() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [scheduleFor, setScheduleFor] = useState<Row | null>(null);
  const { posts, refresh: refreshPosts } = useScheduledPosts();

  const start = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const endDate = useMemo(() => isoDay(start, 29), [start]);
  const startDate = useMemo(() => isoDay(start, 0), [start]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("social_content_calendar")
      .select("id, date, day_index, topic, hook, pillar, status, reel_done, stories_done")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });
    setRows((data as Row[]) || []);
    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => { load(); }, [load]);

  const seed = async () => {
    if (seeding) return;
    setSeeding(true);
    const { data: userData } = await supabase.auth.getUser();
    const coach_id = userData.user?.id;
    if (!coach_id) { toast.error("Você precisa estar logado"); setSeeding(false); return; }

    const existing = new Set(rows.map((r) => r.date));
    const payload = CALENDAR_30.filter((d) => !existing.has(isoDay(start, d.day - 1))).map((d) => {
      const p = pillarById(d.pillar);
      return {
        coach_id,
        date: isoDay(start, d.day - 1),
        day_index: d.day,
        topic: d.notes || d.hook,
        hook: d.hook,
        pillar: p?.dbPillar || "mce_drop",
        format: "reel",
        status: "planejado",
        source: "reels_studio",
      };
    });
    if (!payload.length) { toast.info("Calendário já está montado"); setSeeding(false); return; }
    const { error } = await supabase.from("social_content_calendar").insert(payload as never);
    if (error) toast.error("Erro ao montar calendário");
    else { toast.success("30 dias montados"); await load(); }
    setSeeding(false);
  };

  const toggle = async (row: Row, field: "reel_done" | "stories_done") => {
    const value = !row[field];
    const next = { ...row, [field]: value };
    const status = next.reel_done && next.stories_done ? "pronto" : next.reel_done || next.stories_done ? "em_producao" : "planejado";
    setRows((p) => p.map((r) => (r.id === row.id ? { ...next, status } : r)));
    const { error } = await supabase
      .from("social_content_calendar")
      .update({ [field]: value, status } as never)
      .eq("id", row.id);
    if (error) { toast.error("Erro ao salvar"); load(); }
  };

  const done = rows.filter((r) => r.reel_done && r.stories_done).length;
  const pct = rows.length ? Math.round((done / rows.length) * 100) : 0;

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ ...fT, fontSize: 22, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarDays size={18} color={C.gold} /> CALENDÁRIO 30 DIAS
          </div>
          <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 2 }}>
            {rows.length ? `${done}/${rows.length} dias prontos · ${pct}%` : "Monte o plano de 30 dias"}
          </div>
        </div>
        <button
          onClick={rows.length ? load : seed}
          disabled={seeding || loading}
          style={{ padding: "10px 16px", background: rows.length ? "transparent" : C.gold, border: rows.length ? `1px solid ${C.border}` : "none", ...fT, fontSize: 15, color: rows.length ? C.textMid : C.bg, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          <RefreshCw size={14} className={seeding || loading ? "animate-spin" : ""} /> {rows.length ? "ATUALIZAR" : "MONTAR 30 DIAS"}
        </button>
      </div>

      {rows.length > 0 && (
        <div style={{ height: 4, background: C.border, marginBottom: 12 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: C.green, transition: "width .4s" }} />
        </div>
      )}

      {loading ? (
        <div style={{ ...fM, fontSize: 13, color: C.textMid }}>Carregando…</div>
      ) : rows.length === 0 ? (
        <div style={{ ...fM, fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>
          Nenhum dia planejado ainda. Monte os 30 dias com os pilares em rotação (Mindset, Treino, Nutrição, Business, Prova Social, Lifestyle, Reflexão).
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 520, overflowY: "auto" }}>
          {rows.map((r) => {
            const pillar = DAILY_PILLARS.find((p) => p.dbPillar === r.pillar);
            const color = pillar?.color || C.cyan;
            const ready = r.reel_done && r.stories_done;
            return (
              <div key={r.id} style={{ background: C.card, border: `1px solid ${ready ? `${C.green}44` : C.border}`, padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ ...fT, fontSize: 20, color, width: 42, flexShrink: 0 }}>D{r.day_index ?? "-"}</div>
                <div style={{ flex: "1 1 220px", minWidth: 180 }}>
                  <div style={{ ...fT, fontSize: 16, color: C.text, lineHeight: 1.3 }}>{r.hook || r.topic}</div>
                  <div style={{ ...fM, fontSize: 11, color: C.textMid, marginTop: 3 }}>
                    {new Date(`${r.date}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", weekday: "short" })} · {pillar?.label || r.pillar} · {ready ? "PRONTO" : r.status.toUpperCase()}
                  </div>
                  {posts.filter((p) => p.calendar_id === r.id).length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                      {posts.filter((p) => p.calendar_id === r.id).map((p) => (
                        <ScheduleBadge
                          key={p.id}
                          post={p}
                          onCancel={async () => {
                            try { await cancelScheduled(p.id); toast.success("Agendamento cancelado"); refreshPosts(); }
                            catch { toast.error("Falha ao cancelar"); }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setScheduleFor(r)}
                    style={{ padding: "8px 12px", background: `${C.gold}14`, border: `1px solid ${C.gold}55`, ...fM, fontSize: 12, color: C.gold, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <CalendarClock size={13} /> AGENDAR
                  </button>
                  {([
                    { field: "reel_done" as const, label: "REEL", Icon: Film },
                    { field: "stories_done" as const, label: "STORIES", Icon: Layers },
                  ]).map(({ field, label, Icon }) => {
                    const on = r[field];
                    return (
                      <button
                        key={field}
                        onClick={() => toggle(r, field)}
                        style={{ padding: "8px 12px", background: on ? `${C.green}18` : "transparent", border: `1px solid ${on ? `${C.green}66` : C.border}`, ...fM, fontSize: 12, color: on ? C.green : C.textMid, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                      >
                        {on ? <Check size={13} /> : <Icon size={13} />} {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ReelsSchedulePanel
        open={!!scheduleFor}
        onClose={() => setScheduleFor(null)}
        date={scheduleFor?.date || ""}
        hook={scheduleFor?.hook}
        caption={scheduleFor?.topic}
        calendarId={scheduleFor?.id || ""}
        onDone={refreshPosts}
      />
    </div>
  );
}
