import { useMemo, useState } from "react";
import { TRAINING_SYSTEMS, SYSTEM_CATEGORIES, TrainingSystem } from "@/data/trainingSystems";
import { recommendSystem, RecommendationContext } from "@/data/recommendSystem";
import { Sparkles, ChevronDown, AlertTriangle, Check } from "lucide-react";
import RecommendationRationalePanel from "./RecommendationRationalePanel";

interface Props {
  context: RecommendationContext;
  selectedId: string;
  onSelect: (id: string) => void;
  // Visual tokens to match TrainingPage palette
  surface?: string; surface2?: string; border?: string; borderActive?: string;
  green?: string; greenDim?: string; text?: string; textDim?: string; textMuted?: string;
}

export default function SystemSelectorInline({
  context, selectedId, onSelect,
  surface = "#0c120c", surface2 = "#111a11",
  border = "rgba(74,222,128,0.1)", borderActive = "rgba(74,222,128,0.35)",
  green = "#4ade80", greenDim = "rgba(74,222,128,0.08)",
  text = "#f0fdf4", textDim = "#94a3b8", textMuted = "#64748b",
}: Props) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const reco = useMemo(() => recommendSystem(context), [context]);
  const recommendedId = reco.best.id;
  const top5Ids = useMemo(() => new Set(reco.scores.map((s) => s.system.id)), [reco]);

  const selected = TRAINING_SYSTEMS.find((s) => s.id === selectedId) || reco.best;

  const grouped = useMemo(() => {
    const map: Record<string, TrainingSystem[]> = {};
    TRAINING_SYSTEMS.forEach((s) => {
      (map[s.category] ||= []).push(s);
    });
    return map;
  }, []);

  // Auto-select recommended if nothing chosen yet
  if (!selectedId) {
    setTimeout(() => onSelect(recommendedId), 0);
  }

  return (
    <div className="space-y-2">
      {/* Painel clicável de motivos detalhados da recomendação */}
      <RecommendationRationalePanel
        context={context}
        best={reco.best}
        reasons={reco.scores[0]?.reasons || []}
        surface={surface} surface2={surface2}
        border={border} borderActive={borderActive}
        green={green} greenDim={greenDim}
        text={text} textDim={textDim} textMuted={textMuted}
      />

      {/* Trigger card */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-3 rounded-xl text-left transition-all"
        style={{ background: surface, border: `1px solid ${selected.id === recommendedId ? borderActive : border}` }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{selected.emoji}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold truncate" style={{ color: text }}>{selected.nome}</p>
                {selected.id === recommendedId && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5" style={{ background: greenDim, color: green, border: `1px solid ${borderActive}` }}>
                    <Sparkles className="w-2.5 h-2.5" /> RECOMENDADO
                  </span>
                )}
              </div>
              <p className="text-[10px] truncate" style={{ color: textMuted }}>{selected.category} · {selected.resumo.substring(0, 60)}…</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: textDim, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
        </div>
      </button>

      {open && (
        <div className="rounded-xl space-y-2 p-3" style={{ background: surface2, border: `1px solid ${border}` }}>
          {/* Recommendation rationale */}
          <div className="p-2 rounded-lg" style={{ background: greenDim, border: `1px solid ${borderActive}` }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3 h-3" style={{ color: green }} />
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: green }}>Por que recomendamos {reco.best.nome}</span>
            </div>
            <ul className="text-[10px] space-y-0.5" style={{ color: text }}>
              {reco.scores[0].reasons.slice(0, 4).map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </div>

          {/* Toggle ver todos */}
          <button
            onClick={() => setShowAll((s) => !s)}
            className="w-full text-[10px] font-bold py-1.5 rounded-lg transition"
            style={{ background: showAll ? greenDim : "transparent", color: showAll ? green : textDim, border: `1px solid ${border}` }}
          >
            {showAll ? "Mostrando todos os 27 sistemas" : "Mostrar apenas Top 5 recomendados"}
          </button>

          {/* Lista por categoria */}
          {SYSTEM_CATEGORIES.map((cat) => {
            const items = (grouped[cat.key] || []).filter((s) => showAll || top5Ids.has(s.id));
            if (items.length === 0) return null;
            return (
              <div key={cat.key} className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: cat.color }}>
                  {cat.emoji} {cat.label}
                </p>
                {items.map((s) => {
                  const isSelected = selectedId === s.id;
                  const isReco = s.id === recommendedId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { onSelect(s.id); setOpen(false); }}
                      className="w-full p-2 rounded-lg text-left transition-all"
                      style={{
                        background: isSelected ? greenDim : "transparent",
                        border: `1px solid ${isSelected ? borderActive : border}`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span>{s.emoji}</span>
                          <span className="text-[11px] font-bold truncate" style={{ color: text }}>{s.nome}</span>
                          {isReco && (
                            <span className="text-[7px] px-1 py-0.5 rounded font-black" style={{ background: green, color: "#000" }}>★</span>
                          )}
                          {isSelected && <Check className="w-3 h-3 shrink-0" style={{ color: green }} />}
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="w-0.5 h-2.5 rounded-sm" style={{ background: i < s.complexidade ? green : "rgba(255,255,255,0.1)" }} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[9px] line-clamp-1 mt-0.5" style={{ color: textMuted }}>{s.resumo}</p>
                      {s.alerta && isSelected && (
                        <div className="flex items-start gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
                          <p className="text-[9px]" style={{ color: "#fbbf24" }}>{s.alerta}</p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
