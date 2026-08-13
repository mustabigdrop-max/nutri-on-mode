import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CYAN = "#00D4FF";

interface Row {
  id: string;
  message_user: string;
  message_praxis: string;
  topic: string | null;
  created_at: string;
}

const TOPIC_LABEL: Record<string, string> = {
  substituicoes: "substituições",
  suplementos: "suplementos",
  treino: "treino",
  comer_fora: "comer fora",
  evolucao: "evolução",
  plano: "plano/macros",
  geral: "geral",
};

const PraxisLogsPage = () => {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState<string>("Atleta");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "PRAXIS Logs · NUTRION";
  }, []);

  useEffect(() => {
    (async () => {
      if (!athleteId) return;
      setLoading(true);
      const [{ data: logs }, { data: profile }] = await Promise.all([
        supabase
          .from("praxis_conversations")
          .select("id, message_user, message_praxis, topic, created_at")
          .eq("athlete_id", athleteId)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase.from("profiles").select("full_name").eq("user_id", athleteId).maybeSingle(),
      ]);
      setRows((logs as Row[]) || []);
      if (profile?.full_name) setName(profile.full_name);
      setLoading(false);
    })();
  }, [athleteId]);

  const grouped = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of rows) {
      const key = new Date(r.created_at).toLocaleDateString("pt-BR");
      map.set(key, [...(map.get(key) || []), r]);
    }
    return Array.from(map.entries());
  }, [rows]);

  const summary = useMemo(() => {
    const weekAgo = Date.now() - 7 * 864e5;
    const week = rows.filter((r) => new Date(r.created_at).getTime() >= weekAgo);
    const counts: Record<string, number> = {};
    for (const r of week) {
      const t = r.topic || "geral";
      counts[t] = (counts[t] || 0) + 1;
    }
    return { total: week.length, counts };
  }, [rows]);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "#020205", color: "#fff" }}>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/coach/dashboard")}
          className="flex items-center gap-1.5 text-xs font-semibold mb-6"
          style={{ color: "#8a8a8a" }}
        >
          <ArrowLeft className="w-4 h-4" /> Painel do coach
        </button>

        <h1 className="text-xl font-bold flex items-center gap-2 mb-1">
          {name} <span style={{ color: "#555" }}>›</span>
          <Zap className="w-4 h-4" style={{ color: CYAN }} />
          <span style={{ color: CYAN }}>PRAXIS Logs</span>
        </h1>
        <p className="text-xs mb-6" style={{ color: "#777" }}>
          Perguntas do atleta ao PRAXIS e as respostas dadas.
        </p>

        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: CYAN }} />
        ) : rows.length === 0 ? (
          <p className="text-sm" style={{ color: "#777" }}>
            Nenhuma conversa registrada ainda.
          </p>
        ) : (
          <>
            <div
              className="rounded-xl p-4 mb-6 text-xs"
              style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}
            >
              <p className="font-semibold mb-1" style={{ color: CYAN }}>
                📊 Resumo: {summary.total} perguntas nos últimos 7 dias
              </p>
              <p style={{ color: "#aaa" }}>
                Temas:{" "}
                {Object.entries(summary.counts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([t, n]) => `${TOPIC_LABEL[t] || t} (${n})`)
                  .join(", ") || "—"}
              </p>
            </div>

            <div className="space-y-6">
              {grouped.map(([day, items]) => (
                <div key={day}>
                  <p
                    className="text-[11px] font-mono mb-2 tracking-widest"
                    style={{ color: "#666" }}
                  >
                    ── {day} ──
                  </p>
                  <div className="space-y-3">
                    {items.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-xl p-3 text-sm"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <p className="text-xs mb-1" style={{ color: "#8a8a8a" }}>
                          {new Date(r.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          {r.topic ? ` · ${TOPIC_LABEL[r.topic] || r.topic}` : ""}
                        </p>
                        <p className="mb-2">
                          <strong>{name.split(" ")[0]}:</strong> {r.message_user}
                        </p>
                        <p style={{ color: "#cfcfcf" }} className="whitespace-pre-wrap">
                          <strong style={{ color: CYAN }}>PRAXIS:</strong> {r.message_praxis}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PraxisLogsPage;
