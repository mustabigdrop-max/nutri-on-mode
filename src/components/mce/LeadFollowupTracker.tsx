import { Clock } from "lucide-react";

interface Props {
  contactedAt: string | null;
  scheduledCallAt: string | null;
  replied: boolean | null;
  onShowFollowupScript: () => void;
  onMark: (patch: { replied?: boolean; scheduled_call_at?: string | null }) => void;
}

function since(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 36e5);
  if (h < 1) return "há menos de 1h";
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)} dia(s)`;
}

export default function LeadFollowupTracker({
  contactedAt,
  scheduledCallAt,
  replied,
  onShowFollowupScript,
  onMark,
}: Props) {
  if (!contactedAt) return null;
  return (
    <div className="border border-border bg-card p-4 space-y-3">
      <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground flex items-center gap-2">
        <Clock className="w-3 h-3" /> FOLLOW-UP
      </div>
      <p className="text-sm">Mensagem enviada {since(contactedAt)}.</p>
      <p className="text-xs text-muted-foreground">Se não responder em 24h, mande o follow-up curto do script.</p>
      <button
        onClick={onShowFollowupScript}
        className="px-3 py-2 text-[10px] font-mono tracking-widest border border-border"
      >
        VER SCRIPT DE FOLLOW-UP
      </button>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => onMark({ replied: true })}
          className="px-3 py-2 text-[10px] font-mono tracking-widest border"
          style={replied === true ? { background: "#00d4a1", color: "#000", borderColor: "#00d4a1" } : { borderColor: "hsl(var(--border))" }}
        >
          RESPONDEU
        </button>
        <button
          onClick={() => onMark({ replied: false })}
          className="px-3 py-2 text-[10px] font-mono tracking-widest border"
          style={replied === false ? { background: "#ffd93d", color: "#000", borderColor: "#ffd93d" } : { borderColor: "hsl(var(--border))" }}
        >
          NÃO RESPONDEU
        </button>
      </div>

      <label className="block text-[10px] font-mono tracking-widest text-muted-foreground">
        AGENDOU CONVERSA PARA
        <input
          type="datetime-local"
          value={scheduledCallAt ? new Date(scheduledCallAt).toISOString().slice(0, 16) : ""}
          onChange={(e) => onMark({ scheduled_call_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
          className="mt-1 w-full bg-background border border-border p-2 text-sm outline-none font-sans"
        />
      </label>
    </div>
  );
}
