import { useEffect, useState } from "react";
import { Loader2, Check, Circle, AlertTriangle, RotateCcw, X } from "lucide-react";

const GREEN = "#00e888";
const BG = "rgba(0,18,8,0.95)";
const BORDER = "rgba(0,232,136,0.2)";

const STEPS = [
  "Analisando perfil do atleta...",
  "Calculando volume MEV→MAV→MRV...",
  "Montando divisão de treino...",
  "Selecionando exercícios por EMG...",
  "Adicionando feeder sets e cues...",
  "Gerando progressão semanal...",
  "Finalizando protocolo...",
];

interface Props {
  elapsedMs?: number;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

export default function StratumGenerationProgress({ error, onRetry, onCancel }: Props) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (error) return;
    const stepInterval = setInterval(() => {
      setCurrent((c) => Math.min(c + 1, STEPS.length - 1));
    }, 6500);
    const progInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / 45, 95));
    }, 1000);
    return () => {
      clearInterval(stepInterval);
      clearInterval(progInterval);
    };
  }, [error]);

  if (error) {
    const isTimeout = /timeout|abort|excedeu|demorou/i.test(error);
    const title = isTimeout ? "Geração demorou mais que o esperado" : "Falha na geração do protocolo";
    const desc = isTimeout
      ? "O protocolo é complexo. Tente novamente — geralmente funciona na segunda tentativa."
      : "Erro de conexão com a IA. Verifique sua conexão e tente novamente.";
    return (
      <div
        className="rounded-xl p-4 max-w-2xl mx-auto"
        style={{
          background: "rgba(30,8,8,0.9)",
          border: "0.5px solid rgba(255,64,96,0.3)",
          borderLeft: "2px solid #ff4060",
        }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} style={{ color: "#ff4060" }} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: "#ff4060" }}>{title}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>{desc}</p>
            <p className="text-[10px] mt-2 font-mono opacity-50" style={{ color: "rgba(255,255,255,0.4)" }}>{error}</p>
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  style={{ background: GREEN, color: "#001208" }}
                >
                  <RotateCcw size={12} /> TENTAR NOVAMENTE
                </button>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
                >
                  <X size={12} /> CANCELAR
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-6 max-w-2xl mx-auto"
      style={{ background: BG, border: `0.5px solid ${BORDER}` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Loader2 size={32} className="animate-spin" style={{ color: GREEN }} />
        <div>
          <p className="text-base font-bold tracking-wide" style={{ color: GREEN }}>
            GERANDO PROTOCOLO ELITE
          </p>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            STRATUM Elite Engine · TrainingON
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              {done ? (
                <Check size={14} style={{ color: GREEN }} />
              ) : active ? (
                <Loader2 size={14} className="animate-spin" style={{ color: GREEN }} />
              ) : (
                <Circle size={14} style={{ color: "rgba(255,255,255,0.2)" }} />
              )}
              <span style={{ color: done ? GREEN : active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)" }}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-[3px] w-full rounded-full overflow-hidden" style={{ background: "rgba(0,232,136,0.08)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%`, background: GREEN }}
        />
      </div>

      <p className="text-[10px] mt-3 text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
        Isso pode levar até 45 segundos. O protocolo será exibido completo.
      </p>
    </div>
  );
}
