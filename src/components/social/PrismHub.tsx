import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Library, Sparkles } from "lucide-react";
import PrismPanel from "./PrismPanel";
import PrismStudioPanel from "./PrismStudioPanel";
import TechReelsPanel from "./TechReelsPanel";
import ContentPackPanel from "./ContentPackPanel";
import DailyReelPanel from "./DailyReelPanel";
import HookBankPanel from "./HookBankPanel";
import ContentCalendarPanel from "./ContentCalendarPanel";
import { PRISM_MODES, modeById, type PrismMode } from "@/data/prismModes";

const PRISM = "#A855F7";

export default function PrismHub({
  ctx, handle, onManualMode,
}: { ctx: Record<string, any>; handle?: string | null; onManualMode?: () => void }) {
  const [mode, setMode] = useState<PrismMode | null>(null);
  const [library, setLibrary] = useState(false);
  const def = mode ? modeById(mode) : null;

  if (!mode || !def) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border p-4" style={{ borderColor: `${PRISM}33`, background: `${PRISM}0d` }}>
          <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: PRISM }}>
            <Sparkles className="w-4 h-4" /> PRISM · Centro de Comando de Conteúdo
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Escolha o modo. Tudo que envolve criar, editar, planejar e postar vive aqui. "Transformação é sistema."
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PRISM_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className="text-left rounded-xl border p-4 transition-transform hover:-translate-y-0.5"
              style={{ borderColor: `${m.color}40`, background: `${m.color}0f` }}
            >
              <span className="text-2xl">{m.emoji}</span>
              <p className="text-sm font-semibold mt-2" style={{ color: m.color }}>{m.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "reel_diario" || mode === "pack_dia") {
    return <DailyReelPanel packMode={mode === "pack_dia"} onBack={() => setMode(null)} />;
  }

  if (mode === "hooks") return <HookBankPanel onBack={() => setMode(null)} />;
  if (mode === "calendario") return <ContentCalendarPanel onBack={() => setMode(null)} />;

  if (mode === "post_pronto") {
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => setMode(null)} className="text-xs">← Modos</Button>
        <PrismPanel ctx={ctx} handle={handle} onManualMode={onManualMode} />
      </div>
    );
  }

  const hasLibrary = mode === "reels" || mode === "pack_semanal" || mode === "representatividade" || mode === "vender";

  return (
    <div className="space-y-4">
      <PrismStudioPanel mode={def} ctx={ctx} onBack={() => { setMode(null); setLibrary(false); }} />

      {hasLibrary && (
        <div className="space-y-3">
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => setLibrary((v) => !v)}>
            <Library className="w-3.5 h-3.5" />
            {library ? "Ocultar biblioteca pronta" : "Biblioteca pronta (roteiros e packs já escritos)"}
          </Button>
          {library && (mode === "reels" ? <TechReelsPanel /> : <ContentPackPanel />)}
        </div>
      )}
    </div>
  );
}
