import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, ShoppingCart, Check, ChevronLeft, ChevronRight,
  Apple, Drumstick, Milk, Wheat, Package, Leaf
} from "lucide-react";

const SECTIONS: Record<string, { label: string; icon: typeof Apple; keywords: string[] }> = {
  hortifruti: {
    label: "Hortifrúti",
    icon: Apple,
    keywords: ["banana", "maçã", "morango", "laranja", "limão", "abacate", "tomate", "alface", "brócolis", "cenoura", "cebola", "alho", "batata", "batata doce", "mandioca", "legume", "salada", "fruta", "verdura", "espinafre", "couve", "pepino", "abóbora", "berinjela", "abobrinha", "milho"],
  },
  proteinas: {
    label: "Proteínas",
    icon: Drumstick,
    keywords: ["frango", "carne", "peixe", "salmão", "tilápia", "atum", "ovo", "peito", "filé", "patinho", "acém", "moída", "alcatra", "camarão", "sardinha", "linguiça", "pernil", "strogonoff"],
  },
  laticinios: {
    label: "Laticínios",
    icon: Milk,
    keywords: ["leite", "iogurte", "queijo", "requeijão", "cottage", "creme de leite", "manteiga", "nata", "cream cheese", "mussarela", "ricota"],
  },
  graos: {
    label: "Grãos e Cereais",
    icon: Wheat,
    keywords: ["arroz", "feijão", "aveia", "granola", "quinoa", "lentilha", "grão de bico", "pão", "torrada", "tapioca", "farinha", "macarrão", "massa"],
  },
  suplementos: {
    label: "Suplementos",
    icon: Package,
    keywords: ["whey", "caseína", "creatina", "proteína", "barra de proteína", "scoop", "shake", "suplemento", "colágeno", "multivitamínico"],
  },
  outros: {
    label: "Outros",
    icon: Leaf,
    keywords: ["azeite", "óleo", "mel", "pasta de amendoim", "castanha", "nuts", "amendoim", "canela", "açúcar", "sal", "tempero", "gelatina", "chá", "café"],
  },
};

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().split("T")[0];
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + "T12:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

function classifyItem(foodName: string): string {
  const lower = foodName.toLowerCase();
  for (const [section, { keywords }] of Object.entries(SECTIONS)) {
    if (keywords.some(kw => lower.includes(kw))) return section;
  }
  return "outros";
}

interface ShoppingItem {
  name: string;
  portion: string;
  count: number;
  section: string;
  checked: boolean;
}

const ShoppingListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [planItems, setPlanItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase
        .from("meal_plan_items")
        .select("food_name, portion")
        .eq("user_id", user.id)
        .eq("week_start", weekStart);
      setPlanItems(data ?? []);
      setLoading(false);
    };
    fetchPlan();
  }, [user, weekStart]);

  const shoppingList = useMemo(() => {
    const map = new Map<string, ShoppingItem>();
    for (const item of planItems) {
      const key = item.food_name.toLowerCase();
      if (map.has(key)) {
        map.get(key)!.count++;
      } else {
        map.set(key, {
          name: item.food_name,
          portion: item.portion || "",
          count: 1,
          section: classifyItem(item.food_name),
          checked: false,
        });
      }
    }
    return Array.from(map.values());
  }, [planItems]);

  const grouped = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    for (const item of shoppingList) {
      if (!groups[item.section]) groups[item.section] = [];
      groups[item.section].push(item);
    }
    return groups;
  }, [shoppingList]);

  const toggleCheck = (name: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const totalItems = shoppingList.length;
  const checkedCount = checkedItems.size;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/meal-plan")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Lista de Compras</h1>
            <p className="text-xs text-muted-foreground font-mono">Gerada do plano semanal</p>
          </div>
          <ShoppingCart className="w-5 h-5 text-primary" />
        </div>

        {/* Week selector */}
        <div className="flex items-center justify-between mb-4 rounded-xl border border-border bg-card p-3">
          <button onClick={() => setWeekStart(addWeeks(weekStart, -1))} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-mono text-foreground">{formatWeekRange(weekStart)}</span>
          <button onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        {totalItems > 0 && (
          <div className="rounded-xl border border-border bg-card p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted-foreground">Progresso</span>
              <span className="text-xs font-mono text-primary font-semibold">{checkedCount}/{totalItems}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` }}
                className="h-full rounded-full bg-primary"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : totalItems === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Nenhum plano encontrado</p>
            <p className="text-xs text-muted-foreground">Gere um plano semanal primeiro para ter sua lista de compras</p>
            <button
              onClick={() => navigate("/meal-plan")}
              className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
            >
              Ir para o Plano
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {Object.entries(SECTIONS).map(([sectionKey, { label, icon: Icon }]) => {
                const sectionItems = grouped[sectionKey];
                if (!sectionItems || sectionItems.length === 0) return null;
                const allChecked = sectionItems.every(i => checkedItems.has(i.name));
                return (
                  <motion.div
                    key={sectionKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <div className={`flex items-center gap-2 px-3 py-2.5 border-b border-border ${allChecked ? "bg-primary/5" : ""}`}>
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground flex-1">{label}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{sectionItems.length} itens</span>
                    </div>
                    <div className="divide-y divide-border">
                      {sectionItems.map(item => {
                        const isChecked = checkedItems.has(item.name);
                        return (
                          <button
                            key={item.name}
                            onClick={() => toggleCheck(item.name)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all ${isChecked ? "bg-primary/5" : "hover:bg-muted/30"}`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                              isChecked ? "bg-primary text-primary-foreground" : "border border-border"
                            }`}>
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${isChecked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {item.name}
                              </p>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">
                              ×{item.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingListPage;
