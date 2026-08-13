import { useState } from "react";
import { AlertTriangle, AlertCircle, Info, Check, X, Clock, Pencil, ChevronDown, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ProtocolSuggestion } from "@/hooks/useProtocolSuggestions";
import type { Confidence, Severity } from "@/lib/protocolAdjustment";

const SEVERITY_STYLE: Record<Severity, { color: string; bg: string; border: string; label: string; Icon: typeof Info }> = {
  urgent: {
    color: "#FF4444",
    bg: "rgba(255,68,68,0.06)",
    border: "rgba(255,68,68,0.2)",
    label: "URGENTE",
    Icon: AlertCircle,
  },
  attention: {
    color: "#FFD700",
    bg: "rgba(255,215,0,0.06)",
    border: "rgba(255,215,0,0.2)",
    label: "ATENÇÃO",
    Icon: AlertTriangle,
  },
  info: {
    color: "#00D4FF",
    bg: "rgba(0,212,255,0.04)",
    border: "rgba(0,212,255,0.12)",
    label: "INFO",
    Icon: Info,
  },
};

const CONFIDENCE: Record<Confidence, { width: string; color: string }> = {
  alta: { width: "80%", color: "#00FF88" },
  média: { width: "60%", color: "#FFD700" },
  baixa: { width: "40%", color: "#FF6B6B" },
};

interface Props {
  suggestion: ProtocolSuggestion;
  busy: boolean;
  defaultOpen?: boolean;
  onApprove: (optionIndex: number, customAction?: string) => void;
  onDismiss: () => void;
  onSnooze: () => void;
}

const SuggestionCard = ({ suggestion: s, busy, defaultOpen = false, onApprove, onDismiss, onSnooze }: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");
  const sv = SEVERITY_STYLE[s.severity] ?? SEVERITY_STYLE.info;

  return (
    <div
      style={{
        background: sv.bg,
        border: `0.5px solid ${sv.border}`,
        borderLeft: `3px solid ${sv.color}`,
        borderRadius: 12,
        padding: 20,
      }}
    >
      <button
        className="w-full flex items-start justify-between gap-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-start gap-2 min-w-0">
          <sv.Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: sv.color }} />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {s.athleteName} · {s.title}
            </p>
            {s.analysis && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.analysis}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="px-1.5 py-0.5 text-[9px] font-mono tracking-widest"
            style={{ color: sv.color, border: `1px solid ${sv.color}55`, borderRadius: 2 }}
          >
            {sv.label}
          </span>
          <ChevronDown
            className="w-4 h-4 text-muted-foreground transition-transform"
            style={{ transform: open ? "rotate(180deg)" : "none" }}
          />
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Opções</p>

          {s.options.map((opt, i) => {
            const conf = CONFIDENCE[opt.confidence] ?? CONFIDENCE.média;
            return (
              <div
                key={`${opt.label}-${i}`}
                className="transition-colors"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "0.5px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: 14,
                  margin: "8px 0",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      <span className="font-mono text-muted-foreground mr-2">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.detail}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", width: 80 }}
                      >
                        <div
                          style={{
                            height: 4,
                            borderRadius: 2,
                            width: conf.width,
                            background: conf.color,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        Confiança: {opt.confidence}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => onApprove(i)}
                    className="shrink-0 gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Aprovar
                  </Button>
                </div>
              </div>
            );
          })}

          {s.reasoning && (
            <div className="flex gap-2 text-xs text-muted-foreground bg-white/[0.02] p-3 rounded-lg">
              <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: sv.color }} />
              <p>
                <span className="font-semibold text-foreground">Raciocínio: </span>
                {s.reasoning}
              </p>
            </div>
          )}

          {customMode ? (
            <div className="space-y-2">
              <Textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Descreva o ajuste personalizado que será aplicado e comunicado ao atleta..."
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={busy || !customText.trim()}
                  onClick={() => onApprove(0, customText.trim())}
                >
                  Aplicar ajuste personalizado
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setCustomMode(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="outline" disabled={busy} onClick={() => setCustomMode(true)} className="gap-1">
                <Pencil className="w-3.5 h-3.5" /> Ajuste personalizado
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={onDismiss} className="gap-1">
                <X className="w-3.5 h-3.5" /> Ignorar
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={onSnooze} className="gap-1">
                <Clock className="w-3.5 h-3.5" /> Lembrar em 7 dias
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;
