import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ScoreKey = "diversidade" | "fermentados" | "sintomas" | "disruptores";

const OPTIONS: Record<ScoreKey, { label: string; pts: number }[]> = {
  diversidade: [
    { label: "> 30 espécies vegetais/semana", pts: 25 },
    { label: "20-30 espécies", pts: 18 },
    { label: "10-20 espécies", pts: 12 },
    { label: "< 10 espécies", pts: 5 },
  ],
  fermentados: [
    { label: "Diário + variedade", pts: 25 },
    { label: "Diário sem variedade", pts: 18 },
    { label: "3-4x/semana", pts: 12 },
    { label: "1-2x/semana", pts: 6 },
    { label: "Nunca", pts: 0 },
  ],
  sintomas: [
    { label: "Sem sintomas + trânsito ideal", pts: 25 },
    { label: "1-2 sintomas leves", pts: 15 },
    { label: "3+ sintomas moderados", pts: 8 },
    { label: "Sintomas graves", pts: 3 },
  ],
  disruptores: [
    { label: "Nenhum disruptor", pts: 25 },
    { label: "1 disruptor", pts: 18 },
    { label: "2 disruptores", pts: 10 },
    { label: "3+ disruptores", pts: 3 },
  ],
};

const LABELS: Record<ScoreKey, string> = {
  diversidade: "Diversidade alimentar (vegetais/semana)",
  fermentados: "Fermentados",
  sintomas: "Sintomas",
  disruptores: "Disruptores (antibiótico, álcool, AINE, IBP, adoçantes)",
};

const MicrobiomeScoreCalculator = () => {
  const [picks, setPicks] = useState<Partial<Record<ScoreKey, number>>>({});
  const [showResult, setShowResult] = useState(false);

  const score = useMemo(
    () =>
      (Object.keys(OPTIONS) as ScoreKey[]).reduce(
        (sum, k) => sum + (picks[k] !== undefined ? OPTIONS[k][picks[k]!].pts : 0),
        0
      ),
    [picks]
  );

  const allAnswered = (Object.keys(OPTIONS) as ScoreKey[]).every((k) => picks[k] !== undefined);

  const interpret = (s: number) => {
    if (s >= 90) return { label: "🟢 Microbiota Elite", color: "text-green-500", proto: "Manter stack atual + rotação trimestral de cepas." };
    if (s >= 75) return { label: "🟡 Muito boa — ajustes finos", color: "text-yellow-500", proto: "Adicionar 1-2 fermentados/dia e prebiótico XOS 2g." };
    if (s >= 60) return { label: "🟠 Boa — protocolo moderado", color: "text-orange-500", proto: "Stack mínimo (LGG + BB536 + S. boulardii) + FOS 5g/dia + kefir 200ml." };
    if (s >= 45) return { label: "🔴 Regular — protocolo intensivo", color: "text-red-500", proto: "Fase 1 (REMOVER) 4 sem → Fase 2 (REPOVOAR) Stack Elite completo + glutamina 10g/dia." };
    return { label: "⛔ Comprometida — reparo urgente", color: "text-red-600", proto: "Protocolo 4 fases completo + investigar SIBO/Candida + colostro 20g + BPC-157 + exames laboratoriais." };
  };

  const result = interpret(score);

  return (
    <Card className="bg-yellow-500/5 border-yellow-500/20 p-3 space-y-3">
      <p className="text-xs font-semibold text-yellow-500">📊 MICROBIOME SCORE — Autoavaliação</p>
      {(Object.keys(OPTIONS) as ScoreKey[]).map((key) => (
        <div key={key} className="space-y-1">
          <p className="text-[11px] text-foreground font-medium">{LABELS[key]}</p>
          <div className="flex flex-wrap gap-1">
            {OPTIONS[key].map((opt, i) => (
              <button
                key={i}
                onClick={() => setPicks({ ...picks, [key]: i })}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                  picks[key] === i
                    ? "bg-yellow-500/20 border-yellow-500 text-yellow-500"
                    : "border-border/40 text-muted-foreground hover:border-yellow-500/50"
                }`}
              >
                {opt.label} ({opt.pts}pt)
              </button>
            ))}
          </div>
        </div>
      ))}
      <Button
        size="sm"
        disabled={!allAnswered}
        onClick={() => setShowResult(true)}
        className="w-full text-xs bg-yellow-500 hover:bg-yellow-600 text-black"
      >
        Calcular meu Score
      </Button>
      {showResult && allAnswered && (
        <Card className="bg-card border-border/40 p-3 space-y-1">
          <p className="text-xs">
            <span className="text-muted-foreground">Pontuação:</span>{" "}
            <span className="font-bold text-foreground text-base">{score}/100</span>
          </p>
          <p className={`text-xs font-semibold ${result.color}`}>{result.label}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            <span className="text-foreground font-medium">Protocolo recomendado:</span> {result.proto}
          </p>
        </Card>
      )}
    </Card>
  );
};

export default MicrobiomeScoreCalculator;
