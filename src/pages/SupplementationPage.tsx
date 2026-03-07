import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Pill, Sparkles, Clock, AlertTriangle, Check, Loader2, Sun, Moon, Coffee } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface Supplement {
  name: string;
  dose: string;
  timing: string;
  timingIcon: "morning" | "afternoon" | "night" | "anytime";
  reason: string;
  evidence: string;
  priority: "essential" | "recommended" | "optional";
  warnings?: string;
}

const GOAL_SUPPLEMENTS: Record<string, Supplement[]> = {
  lose_weight: [
    { name: "Whey Protein Isolado", dose: "30g (1 scoop)", timing: "Pós-treino ou entre refeições", timingIcon: "afternoon", reason: "Preserva massa magra durante déficit calórico", evidence: "Meta-análise (2018): +1.8kg massa magra preservada", priority: "essential" },
    { name: "Creatina Monohidratada", dose: "3-5g/dia", timing: "Qualquer horário, com água", timingIcon: "anytime", reason: "Preserva força e massa muscular em cutting", evidence: "ISSN Position Stand 2017: suplemento mais estudado", priority: "essential" },
    { name: "Cafeína", dose: "200-400mg", timing: "30min antes do treino (até 14h)", timingIcon: "morning", reason: "Termogênico, aumenta gasto calórico em 3-11%", evidence: "Dulloo et al. 1989: aumento significativo TEF", priority: "recommended" },
    { name: "Ômega 3 (EPA/DHA)", dose: "2-3g EPA+DHA", timing: "Com refeição gordurosa", timingIcon: "afternoon", reason: "Anti-inflamatório, melhora sensibilidade insulínica", evidence: "Meta-análise 2012: redução inflamação sistêmica", priority: "recommended" },
    { name: "Vitamina D3", dose: "2000-4000 UI", timing: "Manhã, com gordura", timingIcon: "morning", reason: "Deficiência comum no Brasil, essencial para metabolismo", evidence: "Endocrine Society 2011: 50-70% brasileiros deficientes", priority: "essential" },
    { name: "Magnésio Quelado", dose: "200-400mg", timing: "Noite, antes de dormir", timingIcon: "night", reason: "Melhora sono e recuperação, reduz câimbras", evidence: "Abbasi et al. 2012: melhora qualidade do sono", priority: "recommended" },
  ],
  gain_muscle: [
    { name: "Whey Protein Concentrado", dose: "30-40g (1-1.5 scoop)", timing: "Pós-treino + entre refeições", timingIcon: "afternoon", reason: "Síntese proteica muscular otimizada", evidence: "Schoenfeld 2013: 1.6-2.2g/kg proteína total", priority: "essential" },
    { name: "Creatina Monohidratada", dose: "5g/dia", timing: "Qualquer horário", timingIcon: "anytime", reason: "Aumento de força, volume muscular e performance", evidence: "ISSN: ganho médio de 5-10% força", priority: "essential" },
    { name: "Maltodextrina/Dextrose", dose: "30-60g", timing: "Intra ou pós-treino", timingIcon: "afternoon", reason: "Repõe glicogênio, eleva insulina para anabolismo", evidence: "Burke et al. 2011: ressíntese acelerada", priority: "recommended" },
    { name: "Beta-Alanina", dose: "3.2-6.4g/dia", timing: "Dividir em 2 doses", timingIcon: "anytime", reason: "Buffer de pH muscular, atrasa fadiga", evidence: "Hobson et al. 2012: +2.85% performance", priority: "optional" },
    { name: "ZMA (Zinco + Magnésio + B6)", dose: "1 cápsula", timing: "Antes de dormir, em jejum", timingIcon: "night", reason: "Otimiza testosterona e qualidade do sono", evidence: "Brilla & Conte 2000: atletas deficientes", priority: "recommended" },
    { name: "Vitamina D3 + K2", dose: "2000 UI D3 + 100mcg K2", timing: "Manhã com gordura", timingIcon: "morning", reason: "Saúde óssea e hormonal para hipertrofia", evidence: "Wyon et al. 2016: correlação com força", priority: "recommended" },
  ],
  maintain: [
    { name: "Multivitamínico", dose: "1 cápsula", timing: "Manhã, com café da manhã", timingIcon: "morning", reason: "Cobertura de micronutrientes básicos", evidence: "Harvard: seguro para preencher lacunas", priority: "recommended" },
    { name: "Ômega 3", dose: "1-2g EPA+DHA", timing: "Com refeição", timingIcon: "afternoon", reason: "Saúde cardiovascular e cerebral", evidence: "AHA 2002: recomendação para adultos", priority: "recommended" },
    { name: "Vitamina D3", dose: "1000-2000 UI", timing: "Manhã", timingIcon: "morning", reason: "Manutenção de níveis adequados", evidence: "IOM 2011: RDA para adultos", priority: "essential" },
    { name: "Probiótico", dose: "10-20 bilhões UFC", timing: "Manhã, em jejum", timingIcon: "morning", reason: "Saúde intestinal e imunidade", evidence: "WGO 2017: benefício consistente", priority: "optional" },
  ],
};

const TIMING_ICONS = {
  morning: { icon: Coffee, label: "Manhã", color: "text-primary" },
  afternoon: { icon: Sun, label: "Tarde", color: "text-accent" },
  night: { icon: Moon, label: "Noite", color: "text-purple-400" },
  anytime: { icon: Clock, label: "Qualquer hora", color: "text-cyan" },
};

const PRIORITY_STYLES = {
  essential: { label: "Essencial", bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  recommended: { label: "Recomendado", bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  optional: { label: "Opcional", bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
};

const SupplementationPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [stack, setStack] = useState<Supplement[]>([]);
  const [checkedSupps, setCheckedSupps] = useState<string[]>([]);
  const [bloodTestWarnings, setBloodTestWarnings] = useState<string[]>([]);

  const goal = profile?.goal || "maintain";

  useEffect(() => {
    // Load base stack from goal
    const baseStack = GOAL_SUPPLEMENTS[goal] || GOAL_SUPPLEMENTS.maintain;
    setStack(baseStack);

    // Check blood tests for deficiency-based adjustments
    if (user) {
      checkBloodTests();
    }
  }, [goal, user]);

  const checkBloodTests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("blood_tests")
      .select("ai_analysis")
      .eq("user_id", user.id)
      .eq("status", "analyzed")
      .order("test_date", { ascending: false })
      .limit(1);

    if (data && data.length > 0 && data[0].ai_analysis) {
      const analysis = data[0].ai_analysis as any;
      const warnings: string[] = [];
      if (analysis.markers) {
        for (const marker of analysis.markers) {
          if (marker.status === "low") {
            warnings.push(`${marker.name} baixo (${marker.value} ${marker.unit}) — considere suplementar`);
          }
        }
      }
      setBloodTestWarnings(warnings);
    }
  };

  const generateAIStack = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-missions", {
        body: {
          type: "supplements",
          profile: {
            goal: profile?.goal,
            weight: profile?.weight_kg,
            activity: profile?.activity_level,
            sport: profile?.sport,
            conditions: profile?.health_conditions,
            restrictions: profile?.dietary_restrictions,
            uses_glp1: profile?.uses_glp1,
          },
        },
      });
      if (data?.supplements) {
        setStack(data.supplements);
      }
      toast.success("Stack personalizado gerado pela IA!");
    } catch {
      toast.error("Erro ao gerar stack. Usando recomendações padrão.");
    }
    setGenerating(false);
  };

  const toggleCheck = (name: string) => {
    setCheckedSupps(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const timingGroups = {
    morning: stack.filter(s => s.timingIcon === "morning"),
    afternoon: stack.filter(s => s.timingIcon === "afternoon"),
    night: stack.filter(s => s.timingIcon === "night"),
    anytime: stack.filter(s => s.timingIcon === "anytime"),
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-border">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Stack de Suplementação</h1>
            <p className="text-xs text-muted-foreground font-mono">
              Personalizado para: <span className="text-primary">{goal === "lose_weight" ? "Emagrecimento" : goal === "gain_muscle" ? "Hipertrofia" : "Manutenção"}</span>
            </p>
          </div>
          <Pill className="w-5 h-5 text-primary ml-auto" />
        </div>

        {/* Blood test warnings */}
        {bloodTestWarnings.length > 0 && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground mb-1">Alertas dos exames</p>
                {bloodTestWarnings.map((w, i) => (
                  <p key={i} className="text-xs text-muted-foreground">• {w}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI generate button */}
        <button
          onClick={generateAIStack}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/20 bg-primary/5 text-primary font-mono text-sm mb-6 hover:bg-primary/10 transition-all disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? "Gerando stack personalizado..." : "Gerar stack com IA (objetivo + exames)"}
        </button>

        {/* Supplements by timing */}
        {Object.entries(timingGroups).map(([timing, supps]) => {
          if (supps.length === 0) return null;
          const t = TIMING_ICONS[timing as keyof typeof TIMING_ICONS];
          return (
            <div key={timing} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <t.icon className={`w-4 h-4 ${t.color}`} />
                <h3 className="text-sm font-bold text-foreground">{t.label}</h3>
              </div>
              <div className="space-y-2">
                {supps.map((supp, i) => {
                  const priority = PRIORITY_STYLES[supp.priority];
                  const isChecked = checkedSupps.includes(supp.name);
                  return (
                    <motion.div
                      key={supp.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`rounded-xl border bg-card p-4 transition-all ${
                        isChecked ? "border-primary/30 bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleCheck(supp.name)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                            isChecked ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-primary-foreground" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-foreground">{supp.name}</h4>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${priority.bg} ${priority.text}`}>
                              {priority.label}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-primary mb-1">💊 {supp.dose}</p>
                          <p className="text-xs text-muted-foreground mb-1">⏰ {supp.timing}</p>
                          <p className="text-xs text-muted-foreground">{supp.reason}</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1 italic">📚 {supp.evidence}</p>
                          {supp.warnings && (
                            <p className="text-[10px] text-destructive mt-1">⚠️ {supp.warnings}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Summary */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mt-4">
          <h3 className="text-sm font-bold text-foreground mb-2">📋 Resumo do dia</h3>
          <p className="text-xs text-muted-foreground font-mono">
            {checkedSupps.length}/{stack.length} suplementos tomados
          </p>
          <div className="h-2 rounded-full bg-secondary overflow-hidden mt-2">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              animate={{ width: `${(checkedSupps.length / Math.max(stack.length, 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default SupplementationPage;
