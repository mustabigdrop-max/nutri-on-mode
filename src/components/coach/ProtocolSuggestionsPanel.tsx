import { Zap } from "lucide-react";
import { useProtocolSuggestions } from "@/hooks/useProtocolSuggestions";
import SuggestionCard from "./SuggestionCard";

interface Props {
  athleteIds: string[];
  athleteNames: Record<string, string>;
}

const ProtocolSuggestionsPanel = ({ athleteIds, athleteNames }: Props) => {
  const { suggestions, loading, busyId, approve, dismiss, snooze } = useProtocolSuggestions(
    athleteIds,
    athleteNames
  );

  if (loading || suggestions.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" style={{ color: "#E8A020" }} /> Sugestões de ajuste
        </p>
        <span className="text-[11px] font-mono text-muted-foreground">
          {suggestions.length} pendente{suggestions.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            busy={busyId === s.id}
            defaultOpen={i === 0}
            onApprove={(idx, custom) => approve(s, idx, custom)}
            onDismiss={() => dismiss(s)}
            onSnooze={() => snooze(s, 7)}
          />
        ))}
      </div>
    </section>
  );
};

export default ProtocolSuggestionsPanel;
