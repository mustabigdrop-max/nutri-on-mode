import { FlaskConical } from "lucide-react";

interface ScienceIndicatorProps {
  studyCount: number;
  timestamp?: string;
}

const ScienceIndicator = ({ studyCount, timestamp }: ScienceIndicatorProps) => {
  const now = timestamp ? new Date(timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-lg p-3 mb-4 flex items-center gap-3" style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.20)" }}>
      <FlaskConical className="w-5 h-5 flex-shrink-0" style={{ color: "#4ade80" }} />
      <div>
        <p className="text-xs font-medium" style={{ color: "#4ade80" }}>
          Pesquisado em tempo real via Perplexity Sonar Pro
        </p>
        <p className="text-xs" style={{ color: "#9ca3af" }}>
          Analisado por Dr. TrainingON · nutriON · {studyCount} estudo{studyCount !== 1 ? "s" : ""} encontrado{studyCount !== 1 ? "s" : ""} · {now}
        </p>
      </div>
    </div>
  );
};

export default ScienceIndicator;
