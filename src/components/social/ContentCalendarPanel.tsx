import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, ChevronLeft, ChevronRight, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Section, Pill, copyText } from "./socialUi";
import {
  CALENDAR_30, DAILY_PILLARS, pillarById, formulaById, type DailyPillarId,
} from "@/data/dailyContentSystem";

type Row = {
  id: string; date: string; pillar: string; format: string; topic: string;
  hook: string | null; caption: string | null; status: string;
};

const STATUS: { id: string; label: string; color: string }[] = [
  { id: "draft", label: "Rascunho", color: "#8A8A8A" },
  { id: "ready", label: "Pronto", color: "#00D4FF" },
  { id: "published", label: "Postado", color: "#00FF88" },
  { id: "skipped", label: "Pulado", color: "#FF4D6D" },
];

const iso = (d: Date) => d.toISOString().slice(0, 10);

export default function ContentCalendarPanel({ onBack }: { onBack?: () => void }) {
  const [ref, setRef] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filter, setFilter] = useState<DailyPillarId | "">("");
  const [sel, setSel] = useState<string | null>(null);

  const year = ref.getFullYear();
  const month = ref.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const from = iso(new Date(year, month, 1));
      const to = iso(new Date(year, month, daysInMonth));
      const { data, error } = await supabase
        .from("social_content_calendar")
        .select("id,date,pillar,format,topic,hook,caption,status")
        .gte("date", from).lte("date", to).order("date");
      if (error) throw error;
      setRows((data || []) as Row[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao carregar calendário");
    } finally {
      setLoading(false);
    }
  }, [year, month, daysInMonth]);

  useEffect(() => { load(); }, [load]);

  const byDate = useMemo(() => {
    const m = new Map<string, Row>();
    rows.forEach((r) => { if (!m.has(r.date)) m.set(r.date, r); });
    return m;
  }, [rows]);

  const planFor = (day: number) => CALENDAR_30.find((c) => c.day === day) || null;

  const seedMonth = async () => {
    setSeeding(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const coachId = auth?.user?.id;
      if (!coachId) throw new Error("Sessão expirada");
      const inserts = CALENDAR_30
        .filter((c) => c.day <= daysInMonth && !byDate.has(iso(new Date(year, month, c.day))))
        .map((c) => {
          const p = pillarById(c.pillar)!;
          const f = formulaById(c.formula);
          return {
            coach_id: coachId,
            date: iso(new Date(year, month, c.day)),
            scheduled_time: "19:30",
            pillar: p.dbPillar,
            format: "reel",
            topic: `${p.label} · ${f?.label || c.formula}`,
            hook: c.hook,
            caption: c.notes || null,
            hashtags: [],
            status: "draft",
            source: "prism",
          };
        });
      if (!inserts.length) return toast.info("Mês já preenchido");
      const { error } = await supabase.from("social_content_calendar").insert(inserts);
      if (error) throw error;
      toast.success(`${inserts.length} dias criados`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar o mês");
    } finally {
      setSeeding(false);
    }
  };

  const cycleStatus = async (r: Row) => {
    const i = STATUS.findIndex((s) => s.id === r.status);
    const next = STATUS[(i + 1) % STATUS.length].id;
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
    const { error } = await supabase.from("social_content_calendar").update({ status: next }).eq("id", r.id);
    if (error) { toast.error("Falha ao atualizar"); load(); }
  };

  const shift = (n: number) => setRef(new Date(year, month + n, 1));

  const monthLabel = ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const selRow = sel ? rows.find((r) => r.id === sel) : null;

  return (
    <div className="space-y-4">
      {onBack && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">← Modos</Button>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#00D4FF" }}>🗓️ Calendário de Conteúdo</p>
            <p className="text-[11px] text-muted-foreground">Pilar, fórmula, hook e status de cada dia</p>
          </div>
        </div>
      )}

      <Section
        title={monthLabel}
        right={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => shift(-1)}><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => shift(1)}><ChevronRight className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" className="text-[11px] h-7 gap-1" onClick={seedMonth} disabled={seeding}>
              {seeding ? <Loader2 className="w-3 h-3 animate-spin" /> : <CalendarPlus className="w-3 h-3" />} Plano 30 dias
            </Button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Pill label="Todos os pilares" active={!filter} onClick={() => setFilter("")} />
          {DAILY_PILLARS.map((p) => (
            <Pill key={p.id} label={`${p.emoji} ${p.label}`} active={filter === p.id} onClick={() => setFilter(filter === p.id ? "" : p.id)} />
          ))}
        </div>

        {loading ? (
          <div className="py-8 grid place-items-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
              <div key={i} className="text-[9px] text-center text-muted-foreground font-mono py-1">{d}</div>
            ))}
            {Array.from({ length: firstDow }).map((_, i) => <div key={`b${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = iso(new Date(year, month, day));
              const row = byDate.get(dateStr);
              const plan = planFor(day);
              const p = pillarById((plan?.pillar || "") as DailyPillarId)
                || DAILY_PILLARS.find((x) => x.dbPillar === row?.pillar);
              const dimmed = filter && plan?.pillar !== filter;
              const st = STATUS.find((s) => s.id === row?.status);
              return (
                <button
                  key={day}
                  onClick={() => row && setSel(row.id === sel ? null : row.id)}
                  className="rounded-md border p-1.5 text-left min-h-[62px] transition-opacity"
                  style={{
                    borderColor: row ? `${p?.color || "#888"}55` : "rgba(255,255,255,0.07)",
                    background: row ? `${p?.color || "#888"}0f` : "transparent",
                    opacity: dimmed ? 0.25 : 1,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground">{day}</span>
                    {st && <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />}
                  </div>
                  <p className="text-[9px] leading-tight mt-0.5" style={{ color: p?.color }}>{p?.emoji} {p?.label}</p>
                  {plan && <p className="text-[8px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">{formulaById(plan.formula)?.label}</p>}
                </button>
              );
            })}
          </div>
        )}
      </Section>

      {selRow && (
        <Section
          title={new Date(`${selRow.date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" })}
          right={
            <Button variant="outline" size="sm" className="text-[11px] h-7" onClick={() => cycleStatus(selRow)}>
              {STATUS.find((s) => s.id === selRow.status)?.label || selRow.status} →
            </Button>
          }
        >
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-[10px]">{selRow.format}</Badge>
              <Badge variant="outline" className="text-[10px]">{selRow.topic}</Badge>
            </div>
            {selRow.hook && <p className="text-sm font-medium">{selRow.hook}</p>}
            {selRow.caption && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{selRow.caption}</p>}
            <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => copyText([selRow.hook, selRow.caption].filter(Boolean).join("\n\n"))}>
              <Copy className="w-3.5 h-3.5" /> Copiar
            </Button>
          </div>
        </Section>
      )}

      <div className="flex flex-wrap gap-2">
        {STATUS.map((s) => (
          <span key={s.id} className="text-[10px] flex items-center gap-1 text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} /> {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
