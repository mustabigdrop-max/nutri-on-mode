import { useState } from "react";
import { ExternalLink, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

interface CitationBadgeProps {
  citations: string[];
  lastUpdated?: string;
  source?: string;
}

const CitationBadge = ({ citations, lastUpdated, source = "Perplexity Sonar Pro" }: CitationBadgeProps) => {
  const [expanded, setExpanded] = useState(false);

  const timeAgo = lastUpdated
    ? (() => {
        const diff = Date.now() - new Date(lastUpdated).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "agora";
        if (mins < 60) return `há ${mins}min`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `há ${hours}h`;
        return `há ${Math.floor(hours / 24)} dias`;
      })()
    : "agora";

  return (
    <div className="rounded-lg p-3 mb-4" style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.20)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium" style={{ color: "#4ade80" }}>
            🔬 Baseado em {citations.length} fonte{citations.length !== 1 ? "s" : ""} recente{citations.length !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-xs" style={{ color: "#9ca3af" }}>
          {source} · {timeAgo}
        </span>
      </div>

      {citations.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-2 text-xs font-medium transition-colors"
          style={{ color: "#4ade80" }}
        >
          <BookOpen className="w-3 h-3" />
          {expanded ? "Ocultar fontes" : "Ver fontes"}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}

      {expanded && (
        <div className="mt-2 space-y-1">
          {citations.map((c, i) => (
            <div key={i} className="rounded-r-md pl-3 py-1.5" style={{ borderLeft: "2px solid rgba(74,222,128,0.40)", background: "rgba(74,222,128,0.04)" }}>
              <a href={c} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs hover:underline" style={{ color: "#4ade80" }}>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{c}</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitationBadge;
