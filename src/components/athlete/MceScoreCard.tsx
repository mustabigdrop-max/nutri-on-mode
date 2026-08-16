import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TEAL = "#2DD4BF";
const DIM = "#A0A0A0";

type Scores = { score_m: number | null; score_c: number | null; score_e: number | null };

const Bar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] tracking-wider uppercase" style={{ color: DIM }}>{label}</span>
      <span className="text-xs font-bold" style={{ color: TEAL }}>{Math.round(value)}</span>
    </div>
    <div className="h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: TEAL }}
      />
    </div>
  </div>
);

/** Card de score MCE no painel do atleta (somente leitura em modo preview). */
export default function MceScoreCard({
  userId,
  readOnly = false,
}: {
  userId?: string;
  readOnly?: boolean;
}) {
  const navigate = useNavigate();
  const [scores, setScores] = useState<Scores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    setLoading(true);
    supabase
      .from("mce_scores")
      .select("score_m, score_c, score_e")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        setScores((data as Scores) ?? null);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  const m = Number(scores?.score_m ?? 50);
  const c = Number(scores?.score_c ?? 50);
  const e = Number(scores?.score_e ?? 50);
  const geral = Math.round((m + c + e) / 3);

  return (
    <div
      onClick={() => !readOnly && navigate("/mce")}
      className={`rounded-2xl p-4 ${readOnly ? "" : "cursor-pointer transition-transform active:scale-[0.99]"}`}
      style={{
        border: `1px solid ${TEAL}22`,
        borderLeft: `3px solid ${TEAL}`,
        background: `linear-gradient(135deg, ${TEAL}0f, ${TEAL}03)`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" style={{ color: TEAL }} />
          <span className="text-xs font-bold tracking-wider uppercase" style={{ color: TEAL }}>
            MCE · Comportamento
          </span>
        </div>
        <span className="text-lg font-black" style={{ color: TEAL }}>
          {loading ? "—" : geral}
        </span>
      </div>

      {loading ? (
        <p className="text-xs" style={{ color: DIM }}>Carregando...</p>
      ) : (
        <>
          {!scores && (
            <p className="text-xs mb-3" style={{ color: DIM }}>
              Nenhuma avaliação registrada — valores padrão (50).
            </p>
          )}
          <div className="grid grid-cols-3 gap-3">
            <Bar label="Mente" value={m} />
            <Bar label="Consistência" value={c} />
            <Bar label="Execução" value={e} />
          </div>
        </>
      )}

      {!readOnly && (
        <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: TEAL }}>
          Abrir MCE <ChevronRight className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
