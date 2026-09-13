import { useState } from "react";
import { toast } from "sonner";
import { BatteryLow, ShieldCheck } from "lucide-react";
import { setForcedDeload, WeekOverride } from "@/lib/coachOverrides";

const GREEN = "#5DCAA5";
const TEXT = "#F5F0E8";
const TEXT_DIM = "#888";
const BORDER = "rgba(245,240,232,0.08)";

interface Props {
  coachId: string;
  protocolId: string;
  weekNumber: number;
  isPlannedDeload?: boolean;
  current?: WeekOverride | null;
  onChanged?: () => void;
}

export default function CoachWeekControls({
  coachId,
  protocolId,
  weekNumber,
  isPlannedDeload,
  current,
  onChanged,
}: Props) {
  const [busy, setBusy] = useState(false);
  const forced = !!current?.forced_deload;

  const toggle = async () => {
    setBusy(true);
    const err = await setForcedDeload(coachId, protocolId, weekNumber, !forced);
    setBusy(false);
    if (err) { toast.error(err); return; }
    toast.success(!forced ? `Descarga forçada na semana ${weekNumber}` : `Descarga forçada removida da semana ${weekNumber}`);
    onChanged?.();
  };

  return (
    <div className="rounded-xl p-2.5 flex items-center justify-between gap-2" style={{ background: "rgba(93,202,165,0.05)", border: `1px solid ${BORDER}` }}>
      <div>
        <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: GREEN }}>Controles do coach — semana {weekNumber}</p>
        <p className="text-[9px] mt-0.5" style={{ color: TEXT_DIM }}>
          {isPlannedDeload
            ? "Esta semana já é de descarga no plano."
            : forced
              ? "Descarga forçada ativa nesta semana."
              : "Semana de carga normal."}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={busy || isPlannedDeload}
        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold disabled:opacity-40"
        style={{
          background: forced ? "rgba(239,68,68,0.12)" : "rgba(93,202,165,0.15)",
          color: forced ? "#f87171" : GREEN,
        }}
      >
        {forced ? <ShieldCheck className="w-3 h-3" /> : <BatteryLow className="w-3 h-3" />}
        {forced ? "Remover descarga" : "Forçar descarga"}
      </button>
    </div>
  );
}
