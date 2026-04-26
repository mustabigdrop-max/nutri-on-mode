import { useState, useMemo } from "react";
import { TRAINING_SYSTEMS, SYSTEM_CATEGORIES, TrainingSystem } from "@/data/trainingSystems";
import { ChevronDown, ChevronUp, AlertTriangle, Check } from "lucide-react";

interface Props {
  selectedId?: string;
  onSelect?: (s: TrainingSystem) => void;
}

export default function SystemSelector({ selectedId, onSelect }: Props) {
  const [openCat, setOpenCat] = useState<string | null>(SYSTEM_CATEGORIES[0].key);
  const [expandedId, setExpandedId] = useState<string | null>(selectedId ?? null);

  const grouped = useMemo(() => {
    const map: Record<string, TrainingSystem[]> = {};
    TRAINING_SYSTEMS.forEach((s) => {
      (map[s.category] ||= []).push(s);
    });
    return map;
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Sistema de Treinamento Base</h3>
        <p className="text-xs text-muted-foreground mt-1">Escolha o framework científico que organizará todo o protocolo.</p>
      </div>

      {SYSTEM_CATEGORIES.map((cat) => {
        const items = grouped[cat.key] || [];
        const isOpen = openCat === cat.key;
        return (
          <div key={cat.key} className="rounded-xl border border-border overflow-hidden bg-card">
            <button
              onClick={() => setOpenCat(isOpen ? null : cat.key)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-sm font-bold" style={{ color: cat.color }}>{cat.label}</span>
                <span className="text-[10px] text-muted-foreground">({items.length})</span>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {isOpen && (
              <div className="border-t border-border divide-y divide-border">
                {items.map((s) => {
                  const isSelected = selectedId === s.id;
                  const isExpanded = expandedId === s.id;
                  return (
                    <div key={s.id} className={isSelected ? "bg-primary/5" : ""}>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        className="w-full text-left px-4 py-3 hover:bg-muted/20 transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span>{s.emoji}</span>
                            <span className="text-sm font-semibold text-foreground truncate">{s.nome}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className={`w-1 h-3 rounded-sm ${i < s.complexidade ? "bg-primary" : "bg-muted"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{s.resumo}</p>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-2 text-xs">
                          <p className="text-foreground/80"><b className="text-foreground">Resumo:</b> {s.resumo}</p>
                          <p className="text-foreground/80"><b className="text-foreground">Quando usar:</b> {s.quandoUsar}</p>
                          <p className="text-foreground/80"><b className="text-foreground">Indicado para:</b> {s.indicadoPara}</p>
                          <p className="text-foreground/80"><b className="text-foreground">Duração ideal:</b> {s.duracaoIdeal}</p>
                          {s.origem && <p className="text-muted-foreground italic">Origem: {s.origem}</p>}
                          {s.alerta && (
                            <div className="flex gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/30">
                              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                              <p className="text-destructive text-[11px]">{s.alerta}</p>
                            </div>
                          )}
                          <button
                            onClick={() => onSelect?.(s)}
                            className="w-full mt-2 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90"
                          >
                            {isSelected ? "✓ Selecionado" : "Selecionar este sistema"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
