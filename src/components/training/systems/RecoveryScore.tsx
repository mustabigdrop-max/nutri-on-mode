import { useState, useMemo } from "react";
import { HeartPulse, Zap, Moon, Dumbbell, Brain } from "lucide-react";

interface Props {
  pharmacological?: boolean; // PRO users com TRT/NPP têm threshold ajustado
}

const QUESTIONS = [
  { key: "energy", label: "Energia agora", icon: Zap, invert: false },
  { key: "sleep", label: "Como dormiu", icon: Moon, invert: false },
  { key: "soreness", label: "Dor muscular", icon: Dumbbell, invert: true },
  { key: "stress", label: "Estresse hoje", icon: Brain, invert: true },
];

export default function RecoveryScore({ pharmacological = false }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({ energy: 3, sleep: 3, soreness: 3, stress: 3 });

  const score = useMemo(() => {
    const vals = QUESTIONS.map((q) => {
      const a = answers[q.key] ?? 3;
      return q.invert ? 6 - a : a;
    });
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.round(avg * 20);
  }, [answers]);

  const minThreshold = pharmacological ? 35 : 40;
  const recommendation = useMemo(() => {
    if (score >= 80) return { color: "#4ade80", title: "💪 Você está ótimo!", text: "Tente PR no exercício principal. Sessão completa." };
    if (score >= 60) return { color: "#fbbf24", title: "✅ Bom para treinar", text: "Reduzir volume em 15%. Manter intensidade." };
    if (score >= minThreshold) return { color: "#fb923c", title: "⚠️ Recuperação incompleta", text: "Treino leve ou técnico. Sem falha muscular hoje." };
    return { color: "#f87171", title: "🔴 Recuperação crítica", text: "Descanso ativo: caminhada 30min + mobilidade." };
  }, [score, minThreshold]);

  return (
    <div className="space-y-4 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2">
        <HeartPulse className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Recovery Score (Pré-treino)</h3>
        {pharmacological && <span className="text-[9px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">PRO • baseline ajustado</span>}
      </div>
      <p className="text-[11px] text-muted-foreground">4 perguntas (30s) para calibrar a sessão.</p>

      <div className="space-y-3">
        {QUESTIONS.map((q) => (
          <div key={q.key}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <q.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground">{q.label} {q.invert && <span className="text-[9px] text-muted-foreground">(invertido)</span>}</span>
              </div>
              <span className="text-xs font-bold text-primary">{answers[q.key]}/5</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setAnswers({ ...answers, [q.key]: v })}
                  className={`flex-1 h-8 rounded-md text-xs font-bold transition ${
                    answers[q.key] === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/20"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Score bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-foreground">Recovery Score</span>
          <span className="text-2xl font-black tabular-nums" style={{ color: recommendation.color }}>{score}</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: recommendation.color }} />
        </div>
      </div>

      <div className="p-3 rounded-lg border" style={{ borderColor: recommendation.color + "60", background: recommendation.color + "12" }}>
        <p className="text-xs font-black" style={{ color: recommendation.color }}>{recommendation.title}</p>
        <p className="text-[11px] text-foreground mt-1">{recommendation.text}</p>
      </div>
    </div>
  );
}
