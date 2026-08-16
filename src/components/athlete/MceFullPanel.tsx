import { useEffect, useState } from "react";
import { Brain, X, Activity, CheckCircle2, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TEAL = "#2DD4BF";
const DIM = "rgba(255,255,255,0.55)";

type ScoreRow = { id: string; score_m: number; score_c: number; score_e: number; source: string; created_at: string };
type DiagRow = { id: string; pillar: string; answers: number[]; created_at: string };
type ExRow = { id: string; exercise_key: string; completed_at: string };

const PILLAR_LABEL: Record<string, string> = { M: "Mente", C: "Consistência", E: "Execução" };

function Ring({ value, label }: { value: number; label: string }) {
  const size = 96;
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={TEAL}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          style={{ filter: `drop-shadow(0 0 6px ${TEAL}70)` }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          style={{ fill: TEAL, fontSize: 24, fontWeight: 800 }}
        >
          {Math.round(v)}
        </text>
      </svg>
      <span className="text-[10px] tracking-[2px] uppercase" style={{ color: DIM }}>{label}</span>
    </div>
  );
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });

/** Painel completo do MCE do atleta (leitura) — scores, histórico, diagnósticos e exercícios. */
export default function MceFullPanel({ userId, onClose }: { userId?: string; onClose: () => void }) {
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [diags, setDiags] = useState<DiagRow[]>([]);
  const [exs, setExs] = useState<ExRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    setLoading(true);
    (async () => {
      const [s, d, e] = await Promise.all([
        supabase.from("mce_scores").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(12),
        supabase.from("mce_diagnostics").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(6),
        supabase.from("mce_exercises_done").select("*").eq("user_id", userId).order("completed_at", { ascending: false }).limit(30),
      ]);
      if (!alive) return;
      setScores((s.data as ScoreRow[]) ?? []);
      setDiags((d.data as DiagRow[]) ?? []);
      setExs((e.data as ExRow[]) ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  const latest = scores[0];
  const m = Number(latest?.score_m ?? 50);
  const c = Number(latest?.score_c ?? 50);
  const ex = Number(latest?.score_e ?? 50);
  const geral = Math.round((m + c + ex) / 3);

  const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className="rounded-xl p-4" style={{ border: `1px solid ${TEAL}22`, background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: TEAL }}>{icon}</span>
        <span className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: TEAL }}>{title}</span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto" style={{ background: "rgba(3,3,10,0.96)" }}>
      <div className="max-w-3xl mx-auto p-4 pb-24">
        <div className="flex items-center justify-between mb-4 sticky top-0 py-3" style={{ background: "rgba(3,3,10,0.96)" }}>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" style={{ color: TEAL }} />
            <h2 className="text-sm font-black tracking-[2px] uppercase" style={{ color: TEAL }}>MCE · Painel completo</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="p-2 rounded-lg" style={{ border: `1px solid ${TEAL}33`, color: TEAL }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <p className="text-xs" style={{ color: DIM }}>Carregando dados do MCE...</p>
        ) : (
          <div className="space-y-4">
            <Section icon={<Activity className="w-4 h-4" />} title={`Scores atuais · geral ${geral}`}>
              <div className="grid grid-cols-3 gap-3">
                <Ring value={m} label="Mente" />
                <Ring value={c} label="Consistência" />
                <Ring value={ex} label="Execução" />
              </div>
              {!latest && (
                <p className="text-xs mt-3" style={{ color: DIM }}>
                  Nenhuma avaliação registrada — exibindo valores padrão (50).
                </p>
              )}
            </Section>

            <Section icon={<History className="w-4 h-4" />} title="Histórico de scores">
              {scores.length === 0 ? (
                <p className="text-xs" style={{ color: DIM }}>Sem histórico ainda.</p>
              ) : (
                <div className="space-y-1">
                  {scores.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs py-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ color: DIM }}>{fmt(s.created_at)} · {s.source}</span>
                      <span className="font-mono" style={{ color: TEAL }}>
                        M {s.score_m} · C {s.score_c} · E {s.score_e}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section icon={<Brain className="w-4 h-4" />} title="Diagnósticos por pilar">
              {diags.length === 0 ? (
                <p className="text-xs" style={{ color: DIM }}>Nenhum diagnóstico respondido.</p>
              ) : (
                <div className="space-y-2">
                  {diags.map((d) => {
                    const answers = Array.isArray(d.answers) ? d.answers : [];
                    const avg = answers.length ? answers.reduce((a, b) => a + Number(b || 0), 0) / answers.length : 0;
                    return (
                      <div key={d.id} className="text-xs" style={{ color: DIM }}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
                            {PILLAR_LABEL[d.pillar] ?? d.pillar}
                          </span>
                          <span className="font-mono" style={{ color: TEAL }}>média {avg.toFixed(1)}</span>
                        </div>
                        <span>{fmt(d.created_at)} · {answers.length} respostas</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            <Section icon={<CheckCircle2 className="w-4 h-4" />} title={`Exercícios concluídos (${exs.length})`}>
              {exs.length === 0 ? (
                <p className="text-xs" style={{ color: DIM }}>Nenhum exercício concluído ainda.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {exs.map((e) => (
                    <span
                      key={e.id}
                      className="text-[11px] px-2 py-1 rounded-md"
                      style={{ border: `1px solid ${TEAL}33`, color: "rgba(255,255,255,0.8)" }}
                      title={fmt(e.completed_at)}
                    >
                      {e.exercise_key}
                    </span>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
