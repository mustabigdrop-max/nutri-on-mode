import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScanLine, ChevronRight, TrendingUp, GitCompare, ArrowRight } from "lucide-react";

const CYAN = "#00D4FF";
const DIM = "rgba(255,255,255,0.55)";

type Row = {
  id: string;
  created_at: string;
  category_label?: string | null;
  cycle_goal?: string | null;
  bf_estimated?: number | null;
  bf_target?: number | null;
  weeks_estimated?: number | null;
  priority_1?: string | null;
  scores?: any;
};

const parseScores = (scores: any): { label: string; score: number }[] => {
  if (!scores) return [];
  const arr = Array.isArray(scores) ? scores : Array.isArray(scores?.segments) ? scores.segments : [];
  return arr
    .map((s: any) => ({ label: String(s.label ?? s.name ?? ""), score: Number(s.score ?? s.value ?? 0) }))
    .filter((s: any) => s.label && s.score > 0);
};

const modeLabel = (r: Row) =>
  [r.category_label, r.cycle_goal].filter(Boolean).join(" · ") || "Análise visual";

const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

const Delta = ({ a, b, invert }: { a?: number | null; b?: number | null; invert?: boolean }) => {
  if (a == null || b == null) return <span style={{ color: DIM }}>—</span>;
  const d = Number(b) - Number(a);
  if (!d) return <span style={{ color: DIM }}>igual</span>;
  const good = invert ? d < 0 : d > 0;
  return (
    <span style={{ color: good ? "#1DB87A" : "#FFB800" }}>
      {d > 0 ? "+" : ""}
      {Math.round(d * 10) / 10}
    </span>
  );
};

export default function MyApexAnalysisCard({ userId }: { userId?: string | null }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data: athletes } = await supabase
        .from("competition_athletes" as any)
        .select("id")
        .eq("patient_user_id", userId);
      const ids = (athletes || []).map((a: any) => a.id);
      if (!ids.length) return;
      const { data } = await supabase
        .from("apex_analyses" as any)
        .select(
          "id, created_at, category_label, cycle_goal, bf_estimated, bf_target, weeks_estimated, priority_1, scores",
        )
        .in("athlete_id", ids)
        .order("created_at", { ascending: false })
        .limit(50);
      setRows(((data as any[]) || []) as Row[]);
    })();
  }, [userId]);

  const pair = useMemo(() => {
    if (picked.length !== 2) return null;
    const found = picked.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as Row[];
    if (found.length !== 2) return null;
    // ordem cronológica: antes → depois
    return found.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
  }, [picked, rows]);

  const comparison = useMemo(() => {
    if (!pair) return [];
    const [a, b] = pair;
    const sa = parseScores(a.scores);
    const sb = parseScores(b.scores);
    const labels = Array.from(new Set([...sa, ...sb].map((s) => s.label)));
    return labels.map((l) => ({
      label: l,
      a: sa.find((s) => s.label === l)?.score ?? null,
      b: sb.find((s) => s.label === l)?.score ?? null,
    }));
  }, [pair]);

  if (!rows.length) return null;

  const latest = rows[0];
  const scores = parseScores(latest.scores);
  const strengths = [...scores].sort((a, b) => b.score - a.score).slice(0, 2);
  const attentions = [...scores].sort((a, b) => a.score - b.score).slice(0, 2);
  const history = rows.slice(1);

  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-2)));

  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${CYAN}33` }}>
      <div className="flex items-center gap-2 mb-3">
        <ScanLine className="w-4 h-4" style={{ color: CYAN }} />
        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: CYAN }}>
          Minha análise APEX
        </span>
        <span className="ml-auto text-[10px]" style={{ color: DIM }}>
          {fmtDate(latest.created_at)}
        </span>
      </div>

      <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
        Seu coach analisou suas fotos e montou um mapa do seu corpo. Sem julgamento — só direção.
      </p>
      <div className="text-[10px] mt-1" style={{ color: DIM }}>
        Modo: {modeLabel(latest)}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { l: "Gordura hoje", v: latest.bf_estimated != null ? `${latest.bf_estimated}%` : "—" },
          { l: "Meta", v: latest.bf_target != null ? `${latest.bf_target}%` : "—" },
          { l: "Semanas", v: latest.weeks_estimated ?? "—" },
        ].map((x) => (
          <div key={x.l} className="rounded-xl px-2 py-2 text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="text-base font-black" style={{ color: CYAN }}>{x.v}</div>
            <div className="text-[10px]" style={{ color: DIM }}>{x.l}</div>
          </div>
        ))}
      </div>

      {!!strengths.length && (
        <div className="mt-3 space-y-1">
          {strengths.map((s) => (
            <div key={`s-${s.label}`} className="text-xs">✅ <b>{s.label}</b> está evoluindo bem</div>
          ))}
          {attentions.map((s) => (
            <div key={`a-${s.label}`} className="text-xs">⚠️ <b>{s.label}</b> merece atenção nas próximas semanas</div>
          ))}
        </div>
      )}

      {latest.priority_1 && (
        <div className="mt-3 rounded-xl px-3 py-2 text-xs" style={{ background: "rgba(0,212,255,0.08)" }}>
          <b style={{ color: CYAN }}>Foco agora:</b> {latest.priority_1}
        </div>
      )}

      {!!history.length && (
        <>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: CYAN }}
            >
              <TrendingUp className="w-3 h-3" /> Histórico completo ({rows.length})
              <ChevronRight className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`} />
            </button>
            {open && (
              <button
                onClick={() => {
                  setCompareMode((v) => !v);
                  setPicked([]);
                }}
                className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: compareMode ? "#FFB800" : DIM }}
              >
                <GitCompare className="w-3 h-3" /> {compareMode ? "Cancelar comparação" : "Comparar duas"}
              </button>
            )}
          </div>

          {open && (
            <div className="mt-2 space-y-1">
              {compareMode && (
                <div className="text-[10px] mb-1" style={{ color: DIM }}>
                  Selecione 2 análises ({picked.length}/2)
                </div>
              )}
              {rows.map((h) => {
                const active = picked.includes(h.id);
                return (
                  <button
                    key={h.id}
                    disabled={!compareMode}
                    onClick={() => togglePick(h.id)}
                    className="w-full flex items-center justify-between gap-2 text-xs rounded-lg px-2 py-1.5 text-left disabled:cursor-default"
                    style={{
                      background: active ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${active ? CYAN : "transparent"}`,
                    }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.85)" }}>{fmtDate(h.created_at)}</span>
                    <span className="flex-1 truncate text-[10px]" style={{ color: DIM }}>
                      {modeLabel(h)}
                    </span>
                    <span style={{ color: DIM }}>{h.bf_estimated != null ? `${h.bf_estimated}%` : "—"}</span>
                  </button>
                );
              })}
            </div>
          )}

          {pair && (
            <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${CYAN}33` }}>
              <div className="flex items-center gap-2 text-xs font-bold mb-2" style={{ color: CYAN }}>
                {fmtDate(pair[0].created_at)} <ArrowRight className="w-3 h-3" /> {fmtDate(pair[1].created_at)}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                {[
                  { l: "Gordura", a: pair[0].bf_estimated, b: pair[1].bf_estimated, invert: true },
                  { l: "Meta", a: pair[0].bf_target, b: pair[1].bf_target, invert: true },
                  { l: "Semanas", a: pair[0].weeks_estimated, b: pair[1].weeks_estimated, invert: true },
                ].map((x) => (
                  <div key={x.l} className="rounded-lg py-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div style={{ color: "rgba(255,255,255,0.85)" }}>
                      {x.a ?? "—"} → <b>{x.b ?? "—"}</b>
                    </div>
                    <div className="text-[10px]" style={{ color: DIM }}>
                      {x.l} · <Delta a={x.a} b={x.b} invert={x.invert} />
                    </div>
                  </div>
                ))}
              </div>

              {!!comparison.length && (
                <div className="mt-3 space-y-1">
                  {comparison.map((c) => (
                    <div key={c.label} className="flex items-center justify-between text-[11px]">
                      <span className="truncate" style={{ color: "rgba(255,255,255,0.85)" }}>{c.label}</span>
                      <span style={{ color: DIM }}>
                        {c.a ?? "—"} → {c.b ?? "—"} <Delta a={c.a} b={c.b} />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
