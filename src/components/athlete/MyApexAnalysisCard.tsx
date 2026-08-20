import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScanLine, ChevronRight, TrendingUp } from "lucide-react";

const CYAN = "#00D4FF";
const DIM = "rgba(255,255,255,0.55)";

type Row = {
  id: string;
  created_at: string;
  category_label?: string | null;
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

export default function MyApexAnalysisCard({ userId }: { userId?: string | null }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);

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
        .select("id, created_at, category_label, bf_estimated, bf_target, weeks_estimated, priority_1, scores")
        .in("athlete_id", ids)
        .order("created_at", { ascending: false })
        .limit(6);
      setRows(((data as any[]) || []) as Row[]);
    })();
  }, [userId]);

  if (!rows.length) return null;

  const latest = rows[0];
  const scores = parseScores(latest.scores);
  const strengths = [...scores].sort((a, b) => b.score - a.score).slice(0, 2);
  const attentions = [...scores].sort((a, b) => a.score - b.score).slice(0, 2);
  const history = rows.slice(1);

  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${CYAN}33` }}>
      <div className="flex items-center gap-2 mb-3">
        <ScanLine className="w-4 h-4" style={{ color: CYAN }} />
        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: CYAN }}>
          Minha análise APEX
        </span>
        <span className="ml-auto text-[10px]" style={{ color: DIM }}>
          {new Date(latest.created_at).toLocaleDateString("pt-BR")}
        </span>
      </div>

      <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
        Seu coach analisou suas fotos e montou um mapa do seu corpo. Sem julgamento — só direção.
      </p>

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
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-3 flex items-center gap-1 text-xs font-semibold"
            style={{ color: CYAN }}
          >
            <TrendingUp className="w-3 h-3" /> Minha evolução ({history.length})
            <ChevronRight className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`} />
          </button>
          {open && (
            <div className="mt-2 space-y-1">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-xs" style={{ color: DIM }}>
                  <span>{new Date(h.created_at).toLocaleDateString("pt-BR")}</span>
                  <span>{h.bf_estimated != null ? `${h.bf_estimated}% gordura` : "—"}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
