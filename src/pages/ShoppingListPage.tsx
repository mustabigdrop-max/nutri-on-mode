import { useState, useEffect, useMemo } from "react";
import BottomNav from "@/components/BottomNav";
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

// Preços médios por porção (R$) — base mercados brasileiros Mar/2026
// Fontes: CEAGESP, DIEESE Cesta Básica, supermercados regionais
const ITEM_PRICES: Record<string, number> = {
  // Proteínas
  "frango grelhado": 4.20, "peito de frango": 4.50, "frango": 3.80, "frango desfiado": 3.80,
  "coxa": 2.80, "sobrecoxa": 2.80,
  "carne moída": 5.50, "carne": 6.00, "patinho": 6.50, "acém": 5.00, "alcatra": 7.50,
  "filé mignon": 12.00, "strogonoff": 5.00,
  "peixe": 6.50, "salmão": 14.00, "tilápia": 5.80, "sardinha": 3.50, "atum": 4.50,
  "camarão": 10.00,
  "ovo": 0.75, "ovos": 2.25, "omelete": 2.25,
  "linguiça": 3.50, "pernil": 4.00,
  // Laticínios
  "whey": 3.50, "caseína": 4.00, "albumina": 2.00,
  "queijo branco": 2.80, "queijo": 3.00, "mussarela": 3.50, "cottage": 4.00, "ricota": 2.50,
  "iogurte": 2.20, "iogurte natural": 2.00,
  "leite": 1.80, "requeijão": 1.50, "cream cheese": 2.50,
  "manteiga": 1.00, "nata": 1.50,
  // Grãos e carboidratos
  "arroz": 0.55, "arroz integral": 0.70,
  "feijão": 0.75, "feijão preto": 0.80, "lentilha": 1.20, "grão de bico": 1.50,
  "batata doce": 0.80, "batata": 0.60, "mandioca": 0.70,
  "aveia": 0.60, "granola": 1.50,
  "pão integral": 0.50, "pão": 0.45, "torrada": 0.30,
  "tapioca": 0.80, "crepioca": 1.20,
  "macarrão": 0.80, "massa": 0.80,
  "quinoa": 2.50, "farinha": 0.30,
  // Frutas
  "banana": 0.45, "maçã": 1.20, "laranja": 0.60, "limão": 0.25,
  "morango": 2.50, "mamão": 0.80, "manga": 1.00, "abacate": 1.50,
  "melancia": 0.80, "uva": 2.00, "kiwi": 1.80, "pêra": 1.50,
  "acerola": 0.80, "goiaba": 0.70,
  // Vegetais
  "tomate": 0.70, "alface": 1.20, "brócolis": 1.80, "cenoura": 0.45,
  "cebola": 0.35, "alho": 0.25, "espinafre": 1.50, "couve": 0.60,
  "pepino": 0.50, "abóbora": 0.60, "berinjela": 0.70, "abobrinha": 0.60,
  "repolho": 0.50, "chuchu": 0.40, "beterraba": 0.50,
  "pimentão": 0.80, "milho": 0.60,
  // Suplementos
  "barra de proteína": 6.00, "shake": 3.50, "creatina": 1.50,
  "colágeno": 2.00, "multivitamínico": 1.00,
  "scoop": 3.50,
  // Outros
  "azeite": 1.80, "óleo": 0.40,
  "pasta de amendoim": 1.20, "castanha": 2.50, "castanha-do-pará": 1.50,
  "nuts": 2.50, "amendoim": 1.00, "chia": 1.00, "linhaça": 0.80,
  "mel": 0.80, "canela": 0.10,
  "gelatina": 1.00, "chá": 0.50, "café": 0.30,
  "açaí": 4.50,
  "wrap": 1.50, "sanduíche": 2.00,
  "sopa": 3.00, "caldo": 2.50,
  "panqueca": 1.80,
  "default": 2.50,
};

function estimatePrice(foodName: string): number {
  const lower = foodName.toLowerCase();
  // Try longest match first for specificity
  let bestMatch = "";
  let bestPrice = ITEM_PRICES.default;
  for (const [key, price] of Object.entries(ITEM_PRICES)) {
    if (key !== "default" && lower.includes(key) && key.length > bestMatch.length) {
      bestMatch = key;
      bestPrice = price;
    }
  }
  return bestPrice;
}

interface ShoppingItem {
  name: string;
  portion: string;
  count: number;
  section: string;
  checked: boolean;
  estimatedPrice: number;
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
          estimatedPrice: estimatePrice(item.food_name),
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

        {/* Progress + Cost */}
        {totalItems > 0 && (
          <>
            <div className="rounded-xl border border-border bg-card p-3 mb-2">
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
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Custo estimado semanal</p>
                  <p className="text-xl font-bold font-mono text-primary">
                    R$ {shoppingList.reduce((s, i) => s + i.estimatedPrice * i.count, 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-muted-foreground">Por refeição</p>
                  <p className="text-sm font-bold font-mono text-foreground">
                    ~R$ {(shoppingList.reduce((s, i) => s + i.estimatedPrice * i.count, 0) / Math.max(shoppingList.reduce((s, i) => s + i.count, 0), 1)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </>
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
                            <div className="text-right flex-shrink-0">
                              <span className="text-[10px] font-mono text-muted-foreground">×{item.count}</span>
                              <p className="text-[9px] font-mono text-primary">R$ {(item.estimatedPrice * item.count).toFixed(2)}</p>
                            </div>
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
      <BottomNav />
    </div>
  );
};

export default ShoppingListPage;
