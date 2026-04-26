import { useMemo } from "react";
import { AlertTriangle, ShieldAlert, Wrench, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { detectSystemConflicts, SystemConflict } from "@/data/systemConflicts";
import { TRAINING_SYSTEMS } from "@/data/trainingSystems";

interface Props {
  systemId: string;
  injuries: string;
  equipment: string[];
  sessionDuration: string;
  onSwitchSystem?: (id: string) => void;
  // theme
  surface?: string; surface2?: string;
  border?: string; borderActive?: string;
  text?: string; textDim?: string; textMuted?: string;
}

const CAT_ICON = { injury: ShieldAlert, equipment: Wrench, time: Clock } as const;

const SEV_STYLE = {
  block: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.4)", color: "#f87171", label: "BLOQUEIO" },
  warn:  { bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.4)", color: "#fbbf24", label: "ATENÇÃO" },
  info:  { bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.3)", color: "#4ade80", label: "INFO" },
} as const;

export default function SystemConflictAlerts({
  systemId, injuries, equipment, sessionDuration, onSwitchSystem,
  surface = "#0c120c", surface2 = "#111a11",
  border = "rgba(74,222,128,0.1)",
  text = "#f0fdf4", textMuted = "#64748b",
}: Props) {
  const conflicts = useMemo<SystemConflict[]>(
    () => detectSystemConflicts({ systemId, injuries, equipment, sessionDuration }),
    [systemId, injuries, equipment, sessionDuration]
  );

  if (conflicts.length === 0) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl"
        style={{ background: "rgba(74,222,128,0.06)", border: `1px solid rgba(74,222,128,0.25)` }}>
        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#4ade80" }} />
        <p className="text-[11px] font-bold" style={{ color: text }}>
          Nenhum conflito detectado entre o sistema escolhido e suas restrições.
        </p>
      </div>
    );
  }

  const blocks = conflicts.filter((c) => c.severity === "block");
  const warns = conflicts.filter((c) => c.severity === "warn");

  return (
    <div className="space-y-2">
      {/* Header sumário */}
      <div className="flex items-center gap-2 p-2 rounded-lg"
        style={{ background: blocks.length ? SEV_STYLE.block.bg : SEV_STYLE.warn.bg,
                 border: `1px solid ${blocks.length ? SEV_STYLE.block.border : SEV_STYLE.warn.border}` }}>
        <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: blocks.length ? SEV_STYLE.block.color : SEV_STYLE.warn.color }} />
        <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: blocks.length ? SEV_STYLE.block.color : SEV_STYLE.warn.color }}>
          {blocks.length > 0
            ? `${blocks.length} bloqueio${blocks.length > 1 ? "s" : ""}${warns.length ? ` + ${warns.length} aviso${warns.length > 1 ? "s" : ""}` : ""}`
            : `${warns.length} aviso${warns.length > 1 ? "s" : ""} de compatibilidade`}
        </p>
      </div>

      {/* Cards individuais */}
      {conflicts.map((c) => {
        const Icon = CAT_ICON[c.category];
        const sev = SEV_STYLE[c.severity];
        return (
          <div key={c.id} className="p-2.5 rounded-xl"
            style={{ background: sev.bg, border: `1px solid ${sev.border}` }}>
            <div className="flex items-start gap-2">
              <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: sev.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-[8px] px-1.5 py-0.5 rounded font-black" style={{ background: sev.color, color: "#0a0a0a" }}>
                    {sev.label}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: sev.color }}>
                    {c.category === "injury" ? "Lesão" : c.category === "equipment" ? "Equipamento" : "Tempo"}
                  </span>
                </div>
                <p className="text-[11px] font-bold leading-snug" style={{ color: text }}>{c.title}</p>
                <p className="text-[10px] mt-1 leading-relaxed" style={{ color: textMuted }}>{c.detail}</p>
                {c.suggestion && (
                  <p className="text-[10px] mt-1.5 italic leading-relaxed" style={{ color: sev.color }}>
                    💡 {c.suggestion}
                  </p>
                )}
                {c.alternativeSystemIds && c.alternativeSystemIds.length > 0 && onSwitchSystem && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.alternativeSystemIds
                      .map((id) => TRAINING_SYSTEMS.find((s) => s.id === id))
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((s) => (
                        <button
                          key={s!.id}
                          onClick={() => onSwitchSystem(s!.id)}
                          className="text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1 transition"
                          style={{ background: surface, border: `1px solid ${border}`, color: text }}
                        >
                          {s!.emoji} {s!.nome}
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
