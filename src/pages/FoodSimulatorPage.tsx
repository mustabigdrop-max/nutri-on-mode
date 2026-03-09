import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface SimFood {
  name: string;
  emoji: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
}

const POPULAR_FOODS: SimFood[] = [
  { name: "Pizza (2 fatias)", emoji: "🍕", kcal: 520, protein: 14, carbs: 62, fat: 18, portion: "2 fatias médias" },
  { name: "Hambúrguer duplo", emoji: "🍔", kcal: 680, protein: 38, carbs: 42, fat: 36, portion: "1 unidade" },
  { name: "Coxinha", emoji: "🍗", kcal: 280, protein: 8, carbs: 28, fat: 16, portion: "1 unidade grande" },
  { name: "Pastel de carne", emoji: "🥟", kcal: 310, protein: 10, carbs: 30, fat: 18, portion: "1 unidade grande" },
  { name: "Esfiha", emoji: "🫓", kcal: 220, protein: 8, carbs: 24, fat: 10, portion: "1 unidade" },
  { name: "Pão de queijo", emoji: "🧀", kcal: 80, protein: 2, carbs: 10, fat: 4, portion: "1 unidade média" },
  { name: "Açaí 300ml", emoji: "🫐", kcal: 450, protein: 4, carbs: 72, fat: 15, portion: "300ml com granola" },
  { name: "Sorvete (2 bolas)", emoji: "🍦", kcal: 280, protein: 4, carbs: 36, fat: 14, portion: "2 bolas" },
  { name: "Chocolate (barra 25g)", emoji: "🍫", kcal: 135, protein: 2, carbs: 14, fat: 8, portion: "25g" },
  { name: "Cerveja long neck", emoji: "🍺", kcal: 150, protein: 1, carbs: 12, fat: 0, portion: "355ml" },
  { name: "Caipirinha", emoji: "🍹", kcal: 230, protein: 0, carbs: 28, fat: 0, portion: "1 copo" },
  { name: "Brigadeiro (3 un)", emoji: "🍬", kcal: 180, protein: 2, carbs: 24, fat: 8, portion: "3 unidades" },
  { name: "Bolo (fatia)", emoji: "🍰", kcal: 350, protein: 4, carbs: 48, fat: 16, portion: "1 fatia média" },
  { name: "Batata frita (porção)", emoji: "🍟", kcal: 420, protein: 5, carbs: 48, fat: 22, portion: "porção média" },
  { name: "Nuggets (6 un)", emoji: "🐔", kcal: 280, protein: 14, carbs: 18, fat: 16, portion: "6 unidades" },
  { name: "Refrigerante (lata)", emoji: "🥤", kcal: 140, protein: 0, carbs: 35, fat: 0, portion: "350ml" },
  { name: "Croissant", emoji: "🥐", kcal: 230, protein: 4, carbs: 26, fat: 12, portion: "1 unidade" },
  { name: "Vinho (taça)", emoji: "🍷", kcal: 125, protein: 0, carbs: 4, fat: 0, portion: "150ml" },
  { name: "Coxinha de frango", emoji: "🍗", kcal: 280, protein: 8, carbs: 28, fat: 16, portion: "1 grande" },
  { name: "Suco de caixinha", emoji: "🧃", kcal: 110, protein: 0, carbs: 27, fat: 0, portion: "200ml" },
];

const FoodSimulatorPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<SimFood | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [todayTotals, setTodayTotals] = useState({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    supabase.from("meal_logs").select("total_kcal, total_protein, total_carbs, total_fat")
      .eq("user_id", user.id).eq("meal_date", today)
      .then(({ data }) => {
        const meals = data || [];
        setTodayTotals({
          kcal: meals.reduce((s, m) => s + (Number(m.total_kcal) || 0), 0),
          protein: meals.reduce((s, m) => s + (Number(m.total_protein) || 0), 0),
          carbs: meals.reduce((s, m) => s + (Number(m.total_carbs) || 0), 0),
          fat: meals.reduce((s, m) => s + (Number(m.total_fat) || 0), 0),
        });
      });
  }, [user]);

  const kcalTarget = profile?.vet_kcal || 2000;
  const proteinTarget = profile?.protein_g || 150;
  const remaining = Math.max(kcalTarget - todayTotals.kcal, 0);

  const filtered = search.trim()
    ? POPULAR_FOODS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : POPULAR_FOODS;

  const impact = selectedFood ? {
    kcal: selectedFood.kcal * quantity,
    protein: selectedFood.protein * quantity,
    carbs: selectedFood.carbs * quantity,
    fat: selectedFood.fat * quantity,
  } : null;

  const fitsInBudget = impact ? impact.kcal <= remaining : false;
  const proteinLow = impact ? (todayTotals.protein + impact.protein) < proteinTarget * 0.8 : false;
  const overBy = impact ? Math.max(impact.kcal - remaining, 0) : 0;

  const registerFood = async () => {
    if (!user || !selectedFood || !impact) return;
    setRegistering(true);
    const hour = new Date().getHours();
    let mealType = "lanche";
    if (hour < 10) mealType = "cafe_da_manha";
    else if (hour < 14) mealType = "almoco";
    else if (hour >= 18) mealType = "jantar";

    const { error } = await supabase.from("meal_logs").insert({
      user_id: user.id,
      meal_type: mealType,
      food_names: [`${quantity}x ${selectedFood.name}`],
      total_kcal: impact.kcal,
      total_protein: impact.protein,
      total_carbs: impact.carbs,
      total_fat: impact.fat,
      notes: `🤔 Simulado e registrado: ${quantity}x ${selectedFood.name}`,
      confirmed: true,
    });
    if (error) toast.error("Erro ao registrar");
    else {
      toast.success(`✅ ${selectedFood.name} registrado!`);
      navigate("/dashboard");
    }
    setRegistering(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => selectedFood ? setSelectedFood(null) : navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">🤔 E se eu comer...?</h1>
            <p className="text-[10px] font-mono text-muted-foreground">Simule antes de decidir</p>
          </div>
        </div>

        {/* Current budget */}
        <div className="rounded-xl border border-border bg-card p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">Saldo disponível hoje:</span>
            <span className={`text-lg font-bold font-mono ${remaining > 300 ? "text-primary" : remaining > 0 ? "text-accent" : "text-destructive"}`}>
              {Math.round(remaining)} kcal
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!selectedFood ? (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="O que você está pensando em comer?"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground font-mono text-sm placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                {filtered.map(food => (
                  <button
                    key={food.name}
                    onClick={() => { setSelectedFood(food); setQuantity(1); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
                  >
                    <span className="text-xl">{food.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-mono text-foreground">{food.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{food.portion} · {food.kcal} kcal</p>
                    </div>
                    <span className="text-xs font-mono text-primary">{food.kcal} kcal</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Selected food header */}
              <div className="text-center mb-6">
                <span className="text-5xl">{selectedFood.emoji}</span>
                <h2 className="text-lg font-bold text-foreground mt-2">{selectedFood.name}</h2>
                <p className="text-xs font-mono text-muted-foreground">{selectedFood.portion}</p>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center text-foreground font-bold text-lg"
                >−</button>
                <span className="text-2xl font-bold font-mono text-foreground">{quantity}x</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center text-foreground font-bold text-lg"
                >+</button>
              </div>

              {/* Impact */}
              {impact && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4">
                  <p className="text-xs font-mono text-primary mb-3">Impacto imediato:</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "Calorias", value: `+${impact.kcal}`, icon: "🔥" },
                      { label: "Proteína", value: `+${impact.protein}g`, icon: "💪" },
                      { label: "Carbo", value: `+${impact.carbs}g`, icon: "🍞" },
                      { label: "Gordura", value: `+${impact.fat}g`, icon: "🫙" },
                    ].map(m => (
                      <div key={m.label}>
                        <span className="text-sm">{m.icon}</span>
                        <p className="text-sm font-bold font-mono text-foreground">{m.value}</p>
                        <p className="text-[9px] font-mono text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verdict */}
              <div className={`rounded-xl border p-4 mb-4 ${fitsInBudget ? "border-primary/20 bg-primary/5" : "border-accent/20 bg-accent/5"}`}>
                {fitsInBudget ? (
                  <>
                    <p className="text-sm font-mono text-foreground mb-2">
                      ✅ Você tem saldo pra isso hoje!
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {quantity}x {selectedFood.name} cabe(m) na sua meta calórica. Aproveita sem culpa. 😊
                      {impact && impact.kcal > remaining * 0.5 && " Só ajusta o restante do dia para algo mais leve."}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-mono text-foreground mb-2">
                      ⚠️ Vai ficar {Math.round(overBy)} kcal acima da meta hoje.
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mb-3">
                      Mas calma — não é o fim do mundo.
                    </p>
                    <div className="space-y-2">
                      {quantity > 1 && (
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-full text-left p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
                        >
                          <p className="text-xs font-mono text-primary">Opção 1:</p>
                          <p className="text-xs font-mono text-foreground">Come {quantity - 1} e fica mais perto da meta ✅</p>
                        </button>
                      )}
                      <button className="w-full text-left p-3 rounded-lg border border-border bg-card">
                        <p className="text-xs font-mono text-primary">Opção {quantity > 1 ? "2" : "1"}:</p>
                        <p className="text-xs font-mono text-foreground">Come e ajusta o restante do dia</p>
                      </button>
                      <button className="w-full text-left p-3 rounded-lg border border-border bg-card">
                        <p className="text-xs font-mono text-primary">Opção {quantity > 1 ? "3" : "2"}:</p>
                        <p className="text-xs font-mono text-foreground">Come e compensa amanhã — 1 dia não define 💪</p>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Protein warning */}
              {proteinLow && impact && (
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 mb-4">
                  <p className="text-xs font-mono text-accent">
                    💡 Sua proteína ainda vai ficar {Math.round(proteinTarget - todayTotals.protein - impact.protein)}g abaixo da meta.
                    Tente combinar com algo proteico!
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={registerFood}
                  disabled={registering}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-mono text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Registrar {selectedFood.name}
                </button>
                <button
                  onClick={() => setSelectedFood(null)}
                  className="w-full py-3 rounded-xl border border-border text-foreground font-mono text-sm"
                >
                  Simular outro alimento
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
};

export default FoodSimulatorPage;
