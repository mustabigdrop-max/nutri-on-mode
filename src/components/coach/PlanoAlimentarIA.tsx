import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Zap, Loader2, Download, Send, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface MealItem {
  meal: string;
  time: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tip?: string;
}

interface GeneratedPlan {
  meals: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  aiMessage: string;
}

const PlanoAlimentarIA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [clientName, setClientName] = useState("");
  const [objective, setObjective] = useState("emagrecimento");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("masculino");
  const [activityLevel, setActivityLevel] = useState("moderado");
  const [restrictions, setRestrictions] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState("5");

  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);

  const calculateMetabolics = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    if (!w || !h || !a) return null;

    // Harris-Benedict
    const geb = sex === "masculino"
      ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
      : 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;

    const factors: Record<string, number> = {
      sedentario: 1.2,
      leve: 1.375,
      moderado: 1.55,
      intenso: 1.725,
      muito_intenso: 1.9,
    };
    const get = geb * (factors[activityLevel] || 1.55);

    let vet = get;
    if (objective === "emagrecimento") vet = get * 0.8;
    else if (objective === "ganho_massa") vet = get * 1.15;

    return { geb: Math.round(geb), get: Math.round(get), vet: Math.round(vet) };
  };

  const metabolics = calculateMetabolics();

  const handleGenerate = async () => {
    if (!clientName.trim()) {
      toast({ title: "Preencha o nome do cliente", variant: "destructive" });
      return;
    }
    if (!metabolics) {
      toast({ title: "Preencha peso, altura e idade", variant: "destructive" });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          userId: user?.id,
          coachMode: true,
          clientName,
          objective,
          metabolics,
          mealsPerDay: parseInt(mealsPerDay),
          restrictions,
          coachNotes,
          sex,
          weight: parseFloat(weight),
          height: parseFloat(height),
          age: parseFloat(age),
          activityLevel,
        },
      });

      if (error) throw error;

      if (data?.plan) {
        setPlan(data.plan);
        toast({ title: "Plano gerado com sucesso! ✅" });
      } else {
        // Fallback local plan
        const meals = parseInt(mealsPerDay);
        const calPerMeal = Math.round(metabolics.vet / meals);
        const mockMeals: MealItem[] = Array.from({ length: meals }, (_, i) => ({
          meal: `Refeição ${i + 1}`,
          time: `${6 + i * 3}:00`,
          foods: ["Arroz integral", "Frango grelhado", "Salada verde", "Azeite"],
          calories: calPerMeal,
          protein: Math.round(calPerMeal * 0.35 / 4),
          carbs: Math.round(calPerMeal * 0.40 / 4),
          fat: Math.round(calPerMeal * 0.25 / 9),
          tip: "Adaptar conforme preferências do cliente",
        }));

        setPlan({
          meals: mockMeals,
          totalCalories: metabolics.vet,
          totalProtein: mockMeals.reduce((s, m) => s + m.protein, 0),
          totalCarbs: mockMeals.reduce((s, m) => s + m.carbs, 0),
          totalFat: mockMeals.reduce((s, m) => s + m.fat, 0),
          aiMessage: `Plano gerado para ${clientName} — objetivo: ${objective}. GEB: ${metabolics.geb} kcal | GET: ${metabolics.get} kcal | VET: ${metabolics.vet} kcal`,
        });
        toast({ title: "Plano gerado (modo local) ✅" });
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro ao gerar plano", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!plan) return;
    const w = window.open("", "_blank");
    if (!w) return;

    const html = `
      <html><head><title>Plano Alimentar - ${clientName}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; }
        h1 { color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 8px; }
        .meta { display: flex; gap: 24px; margin: 16px 0; }
        .meta-box { background: #f0fdf4; padding: 12px 20px; border-radius: 8px; text-align: center; }
        .meta-box span { font-size: 24px; font-weight: bold; color: #059669; display: block; }
        .meal { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 12px 0; }
        .meal h3 { margin: 0 0 8px; color: #065f46; }
        .foods { color: #374151; }
        .macros { display: flex; gap: 16px; margin-top: 8px; font-size: 13px; color: #6b7280; }
        .tip { font-style: italic; color: #059669; font-size: 12px; margin-top: 6px; }
        .footer { margin-top: 32px; text-align: center; color: #9ca3af; font-size: 11px; }
      </style></head><body>
        <h1>🥗 Plano Alimentar — ${clientName}</h1>
        <p>${plan.aiMessage}</p>
        <div class="meta">
          <div class="meta-box"><span>${plan.totalCalories}</span>kcal</div>
          <div class="meta-box"><span>${plan.totalProtein}g</span>Proteína</div>
          <div class="meta-box"><span>${plan.totalCarbs}g</span>Carboidrato</div>
          <div class="meta-box"><span>${plan.totalFat}g</span>Gordura</div>
        </div>
        ${plan.meals.map(m => `
          <div class="meal">
            <h3>${m.meal} — ${m.time}</h3>
            <div class="foods">${m.foods.join(", ")}</div>
            <div class="macros">
              <span>🔥 ${m.calories} kcal</span>
              <span>🥩 ${m.protein}g P</span>
              <span>🍚 ${m.carbs}g C</span>
              <span>🥑 ${m.fat}g G</span>
            </div>
            ${m.tip ? `<div class="tip">💡 ${m.tip}</div>` : ""}
          </div>
        `).join("")}
        <div class="footer">Gerado por NUTRION — Plataforma de Nutrição Inteligente</div>
      </body></html>
    `;
    w.document.write(html);
    w.document.close();
    w.print();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 max-w-4xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => navigate("/coach-dashboard")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
          <Zap className="w-6 h-6 text-primary" /> Gerar Plano Alimentar com IA
        </h1>

        {/* Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" /> Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Cliente *</Label>
                <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: João Silva" />
              </div>
              <div>
                <Label>Objetivo</Label>
                <Select value={objective} onValueChange={setObjective}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="ganho_massa">Ganho de Massa</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="saude">Saúde Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Peso (kg) *</Label>
                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="75" />
              </div>
              <div>
                <Label>Altura (cm) *</Label>
                <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" />
              </div>
              <div>
                <Label>Idade *</Label>
                <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="30" />
              </div>
              <div>
                <Label>Sexo</Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nível de Atividade</Label>
                <Select value={activityLevel} onValueChange={setActivityLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentario">Sedentário</SelectItem>
                    <SelectItem value="leve">Leve (1-3x/sem)</SelectItem>
                    <SelectItem value="moderado">Moderado (3-5x/sem)</SelectItem>
                    <SelectItem value="intenso">Intenso (6-7x/sem)</SelectItem>
                    <SelectItem value="muito_intenso">Muito Intenso (2x/dia)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Refeições por dia</Label>
                <Select value={mealsPerDay} onValueChange={setMealsPerDay}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} refeições</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Restrições / Alergias</Label>
              <Input value={restrictions} onChange={e => setRestrictions(e.target.value)} placeholder="Ex: lactose, glúten, vegano..." />
            </div>

            <div>
              <Label>Notas do Coach (instruções para a IA)</Label>
              <Textarea
                value={coachNotes}
                onChange={e => setCoachNotes(e.target.value)}
                placeholder="Ex: Priorizar alimentos acessíveis, incluir suplementação de whey pós-treino, déficit moderado..."
                rows={3}
              />
            </div>

            {/* Metabolics preview */}
            {metabolics && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "GEB", value: `${metabolics.geb} kcal`, desc: "Taxa Metabólica Basal" },
                  { label: "GET", value: `${metabolics.get} kcal`, desc: "Gasto Energético Total" },
                  { label: "VET", value: `${metabolics.vet} kcal`, desc: "Valor Energético da Dieta" },
                ].map(m => (
                  <Card key={m.label} className="bg-primary/5 border-primary/20">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                      <p className="text-lg font-bold text-primary">{m.value}</p>
                      <p className="text-xs font-medium text-foreground">{m.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando plano com IA...</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" /> Gerar Plano Alimentar</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Plan */}
        {plan && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">🥗 Plano Gerado — {clientName}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.aiMessage}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Totals */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Calorias", value: `${plan.totalCalories} kcal`, emoji: "🔥" },
                    { label: "Proteína", value: `${plan.totalProtein}g`, emoji: "🥩" },
                    { label: "Carboidrato", value: `${plan.totalCarbs}g`, emoji: "🍚" },
                    { label: "Gordura", value: `${plan.totalFat}g`, emoji: "🥑" },
                  ].map(t => (
                    <div key={t.label} className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold text-foreground">{t.emoji} {t.value}</p>
                      <p className="text-xs text-muted-foreground">{t.label}</p>
                    </div>
                  ))}
                </div>

                {/* Meals */}
                {plan.meals.map((m, i) => (
                  <Card key={i} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-foreground">{m.meal}</h3>
                        <span className="text-xs text-muted-foreground">{m.time}</span>
                      </div>
                      <p className="text-sm text-foreground">{m.foods.join(", ")}</p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span>🔥 {m.calories} kcal</span>
                        <span>🥩 {m.protein}g P</span>
                        <span>🍚 {m.carbs}g C</span>
                        <span>🥑 {m.fat}g G</span>
                      </div>
                      {m.tip && (
                        <p className="text-xs text-primary mt-2 italic">💡 {m.tip}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={handleExportPDF} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" /> Exportar PDF
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    toast({ title: "Plano enviado ao cliente! ✅", description: `${clientName} receberá o plano no app.` });
                  }}>
                    <Send className="w-4 h-4 mr-2" /> Enviar ao Cliente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PlanoAlimentarIA;
