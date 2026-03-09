import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Check, Minus, X } from "lucide-react";
import { VISUAL_MEASURES, CATEGORY_LABELS, type VisualMeasure } from "@/data/visualMeasures";

interface SelectedVisualFood {
  measure: VisualMeasure;
  quantity: number;
}

interface Props {
  onAddFoods: (foods: Array<{
    id: string;
    name: string;
    portion: string;
    portionGrams: number;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    category: string;
  }>) => void;
}

const VisualPortionSelector = ({ onAddFoods }: Props) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedVisualFood[]>([]);

  const filtered = useMemo(() => {
    let items = VISUAL_MEASURES;
    if (activeCategory) items = items.filter(m => m.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    }
    return items;
  }, [search, activeCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, VisualMeasure[]> = {};
    filtered.forEach(m => {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    });
    return groups;
  }, [filtered]);

  const toggleItem = (measure: VisualMeasure) => {
    setSelected(prev => {
      const exists = prev.find(s => s.measure.id === measure.id);
      if (exists) return prev.filter(s => s.measure.id !== measure.id);
      return [...prev, { measure, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setSelected(prev =>
      prev.map(s => s.measure.id === id ? { ...s, quantity: Math.max(0.5, s.quantity + delta) } : s)
        .filter(s => s.quantity > 0)
    );
  };

  const confirmAll = () => {
    const foods = selected.map(s => ({
      id: `visual-${s.measure.id}-${Date.now()}`,
      name: s.measure.name,
      portion: `${s.measure.description} (${s.measure.grams}g)`,
      portionGrams: s.measure.grams,
      kcal: Math.round(s.measure.kcal * s.quantity),
      protein: Math.round(s.measure.protein * s.quantity * 10) / 10,
      carbs: Math.round(s.measure.carbs * s.quantity * 10) / 10,
      fat: Math.round(s.measure.fat * s.quantity * 10) / 10,
      category: "👐 Sem Balança",
    }));
    onAddFoods(foods);
    setSelected([]);
  };

  const categories = Object.entries(CATEGORY_LABELS);
  const isSelected = (id: string) => selected.some(s => s.measure.id === id);

  const totals = useMemo(() => ({
    kcal: selected.reduce((s, i) => s + i.measure.kcal * i.quantity, 0),
    protein: selected.reduce((s, i) => s + i.measure.protein * i.quantity, 0),
  }), [selected]);

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
        <p className="text-xs text-foreground font-mono leading-relaxed">
          👐 <span className="font-bold">Modo Sem Balança</span> — toque na medida que mais se parece com o que você comeu. Sem pesar nada!
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar alimento..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-mono font-medium transition-all ${
            !activeCategory ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
          }`}
        >
          Todos
        </button>
        {categories.map(([key, { label, emoji }]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(activeCategory === key ? null : key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-mono font-medium transition-all ${
              activeCategory === key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Selected items summary */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-primary/20 bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-primary uppercase tracking-wider">
                  {selected.length} selecionado(s)
                </span>
                <span className="text-xs font-mono text-foreground font-bold">
                  {Math.round(totals.kcal)}kcal · {Math.round(totals.protein)}g prot
                </span>
              </div>
              {selected.map(s => (
                <div key={s.measure.id} className="flex items-center gap-2 text-xs">
                  <span>{s.measure.emoji}</span>
                  <span className="flex-1 text-foreground font-mono truncate">{s.measure.name}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(s.measure.id, -0.5)} className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground">
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-xs font-mono font-bold text-foreground w-6 text-center">{s.quantity}</span>
                    <button onClick={() => updateQty(s.measure.id, 0.5)} className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground">
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button onClick={() => toggleItem(s.measure)} className="w-6 h-6 rounded flex items-center justify-center text-destructive">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={confirmAll}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold font-mono hover:bg-primary/90 transition-colors"
              >
                Adicionar {selected.length} item(ns) à refeição
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food grid by category */}
      {Object.entries(grouped).map(([cat, items]) => {
        const catInfo = CATEGORY_LABELS[cat];
        return (
          <div key={cat}>
            <h3 className="text-xs font-mono text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
              <span>{catInfo?.emoji}</span> {catInfo?.label || cat}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {items.map(item => {
                const sel = isSelected(item.id);
                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleItem(item)}
                    className={`relative text-left rounded-xl border p-3 transition-all ${
                      sel ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/20"
                    }`}
                  >
                    {sel && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <span className="text-2xl block mb-1">{item.emoji}</span>
                    <p className="text-xs font-semibold text-foreground leading-tight">{item.name}</p>
                    <p className="text-[10px] text-primary font-mono font-medium mt-0.5">{item.description}</p>
                    <p className="text-[9px] text-muted-foreground font-mono mt-1">
                      {item.kcal}kcal · P:{item.protein}g · C:{item.carbs}g
                    </p>
                    <p className="text-[9px] text-muted-foreground/60 font-mono">≈ {item.grams}g</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VisualPortionSelector;
