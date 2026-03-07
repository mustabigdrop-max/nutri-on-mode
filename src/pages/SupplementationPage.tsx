import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Pill, Sparkles, Clock, AlertTriangle, Check,
  Loader2, Sun, Moon, Coffee, FlaskConical, FileText, ChevronDown, ChevronUp
} from "lucide-react";
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

interface BloodAddition {
  supplement: string;
  deficiency: string;
  marker_value: string;
}

const GOAL_SUPPLEMENTS: Record<string, Supplement[]> = {
  lose_weight: [
    { name: "Whey Protein Isolado", dose: "30g (1 scoop)", timing: "Pós-treino ou entre refeições", timingIcon: "afternoon", reason: "Preserva massa magra durante déficit calórico", evidence: "Meta-análise (2018): +1.8kg massa magra preservada", priority: "essential" },
    { name: "Creatina Monohidratada", dose: "3-5g/dia", timing: "Qualquer horário, com água", timingIcon: "anytime", reason: "Preserva força e massa muscular em cutting", evidence: "ISSN Position Stand 2017", priority: "essential" },
    { name: "Cafeína", dose: "200-400mg", timing: "30min antes do treino (até 14h)", timingIcon: "morning", reason: "Termogênico, aumenta gasto calórico em 3-11%", evidence: "Dulloo et al. 1989", priority: "recommended" },
    { name: "Ômega 3 (EPA/DHA)", dose: "2-3g EPA+DHA", timing: "Com refeição gordurosa", timingIcon: "afternoon", reason: "Anti-inflamatório, melhora sensibilidade insulínica", evidence: "Meta-análise 2012", priority: "recommended" },
    { name: "Vitamina D3", dose: "2000-4000 UI", timing: "Manhã, com gordura", timingIcon: "morning", reason: "Deficiência comum no Brasil", evidence: "Endocrine Society 2011", priority: "essential" },
    { name: "Magnésio Quelado", dose: "200-400mg", timing: "Noite, antes de dormir", timingIcon: "night", reason: "Melhora sono e recuperação", evidence: "Abbasi et al. 2012", priority: "recommended" },
  ],
  gain_muscle: [
    { name: "Whey Protein Concentrado", dose: "30-40g (1-1.5 scoop)", timing: "Pós-treino + entre refeições", timingIcon: "afternoon", reason: "Síntese proteica muscular otimizada", evidence: "Schoenfeld 2013: 1.6-2.2g/kg", priority: "essential" },
    { name: "Creatina Monohidratada", dose: "5g/dia", timing: "Qualquer horário", timingIcon: "anytime", reason: "Aumento de força, volume muscular e performance", evidence: "ISSN: ganho médio de 5-10% força", priority: "essential" },
    { name: "Maltodextrina", dose: "30-60g", timing: "Intra ou pós-treino", timingIcon: "afternoon", reason: "Repõe glicogênio, eleva insulina", evidence: "Burke et al. 2011", priority: "recommended" },
    { name: "Beta-Alanina", dose: "3.2-6.4g/dia", timing: "Dividir em 2 doses", timingIcon: "anytime", reason: "Buffer de pH muscular, atrasa fadiga", evidence: "Hobson et al. 2012", priority: "optional" },
    { name: "ZMA (Zn + Mg + B6)", dose: "1 cápsula", timing: "Antes de dormir, em jejum", timingIcon: "night", reason: "Otimiza testosterona e sono", evidence: "Brilla & Conte 2000", priority: "recommended" },
    { name: "Vitamina D3 + K2", dose: "2000 UI D3 + 100mcg K2", timing: "Manhã com gordura", timingIcon: "morning", reason: "Saúde óssea e hormonal", evidence: "Wyon et al. 2016", priority: "recommended" },
  ],
  maintain: [
    { name: "Multivitamínico", dose: "1 cápsula", timing: "Manhã, com café da manhã", timingIcon: "morning", reason: "Cobertura de micronutrientes básicos", evidence: "Harvard: seguro para lacunas", priority: "recommended" },
    { name: "Ômega 3", dose: "1-2g EPA+DHA", timing: "Com refeição", timingIcon: "afternoon", reason: "Saúde cardiovascular e cerebral", evidence: "AHA 2002", priority: "recommended" },
    { name: "Vitamina D3", dose: "1000-2000 UI", timing: "Manhã", timingIcon: "morning", reason: "Manutenção de níveis adequados", evidence: "IOM 2011", priority: "essential" },
    { name: "Probiótico", dose: "10-20 bilhões UFC", timing: "Manhã, em jejum", timingIcon: "morning", reason: "Saúde intestinal e imunidade", evidence: "WGO 2017", priority: "optional" },
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
  const [bloodAdditions, setBloodAdditions] = useState<BloodAddition[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [hasBloodData, setHasBloodData] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [showExamSection, setShowExamSection] = useState(false);
  const [bloodTestDetails, setBloodTestDetails] = useState<any>(null);

  const goal = profile?.goal || "maintain";

  useEffect(() => {
    const baseStack = GOAL_SUPPLEMENTS[goal] || GOAL_SUPPLEMENTS.maintain;
    setStack(baseStack);
    if (user) checkBloodTests();
  }, [goal, user]);

  const checkBloodTests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("blood_tests")
      .select("ai_analysis, test_date, status")
      .eq("user_id", user.id)
      .eq("status", "analyzed")
      .order("test_date", { ascending: false })
      .limit(1);

    if (data && data.length > 0 && data[0].ai_analysis) {
      setHasBloodData(true);
      setBloodTestDetails(data[0]);
      const analysis = data[0].ai_analysis as any;
      const warnings: string[] = [];
      if (analysis.markers) {
        for (const marker of analysis.markers) {
          if (marker.status === "low" || marker.status === "high" || marker.status === "critical") {
            warnings.push(`${marker.name}: ${marker.value} ${marker.unit} (${marker.status === "low" ? "⬇️ baixo" : marker.status === "high" ? "⬆️ alto" : "🔴 crítico"}) — ${marker.interpretation || ""}`);
          }
        }
      }
      setBloodTestWarnings(warnings);
    }
  };

  const generateAIStack = async () => {
    if (!user || !profile) {
      toast.error("Complete seu perfil antes de gerar o stack.");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-supplement-stack", {
        body: {
          profile: {
            goal: profile.goal,
            weight: profile.weight_kg,
            height: profile.height_cm,
            activity: profile.activity_level,
            sport: profile.sport,
            conditions: profile.health_conditions,
            restrictions: profile.dietary_restrictions,
            uses_glp1: profile.uses_glp1,
          },
        },
      });

      if (error) throw error;
      if (data?.error) {
        if (data.error.includes("requisições")) {
          toast.error("Muitas requisições. Aguarde alguns segundos.");
        } else {
          toast.error(data.error);
        }
        setGenerating(false);
        return;
      }

      if (data?.supplements && data.supplements.length > 0) {
        setStack(data.supplements);
        setBloodAdditions(data.blood_based_additions || []);
        setAiSummary(data.summary || "");
        setHasBloodData(data.has_blood_data || false);
        setIsAIGenerated(true);
        toast.success(data.has_blood_data
          ? "Stack gerado com base no perfil + exames! 🧬"
          : "Stack personalizado gerado pela IA! 💊"
        );
      } else {
        toast.error("IA não retornou suplementos. Usando stack padrão.");
      }
    } catch (e: any) {
      console.error(e);
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
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-border bg-card">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Stack de Suplementação</h1>
            <p className="text-xs text-muted-foreground font-mono">
              {isAIGenerated ? (
                <span className="text-primary">✨ Gerado por IA{hasBloodData ? " + Exames" : ""}</span>
              ) : (
                <>Objetivo: <span className="text-primary">{goal === "lose_weight" ? "Emagrecimento" : goal === "gain_muscle" ? "Hipertrofia" : "Manutenção"}</span></>
              )}
            </p>
          </div>
          <Pill className="w-5 h-5 text-primary" />
        </div>

        {/* AI Summary */}
        {isAIGenerated && aiSummary && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-foreground">{aiSummary}</p>
            </div>
          </motion.div>
        )}

        {/* Blood test integration section */}
        {(bloodTestWarnings.length > 0 || hasBloodData) && (
          <div className="mb-4">
            <button
              onClick={() => setShowExamSection(!showExamSection)}
              className="w-full flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 transition-all hover:bg-destructive/10"
            >
              <FlaskConical className="w-5 h-5 text-destructive flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-foreground">Dados do exame de sangue</p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {bloodTestWarnings.length} marcador{bloodTestWarnings.length !== 1 ? "es" : ""} fora da faixa
                </p>
              </div>
              {showExamSection ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {showExamSection && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-b-xl border border-t-0 border-destructive/20 bg-card p-3 space-y-2">
                    {bloodTestWarnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">{w}</p>
                      </div>
                    ))}

                    {bloodAdditions.length > 0 && (
                      <div className="border-t border-border pt-2 mt-2">
                        <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Suplementos adicionados pelo exame:</p>
                        {bloodAdditions.map((ba, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                            <span className="text-primary">+</span>
                            <span className="font-semibold">{ba.supplement}</span>
                            <span className="text-muted-foreground">→ {ba.deficiency} ({ba.marker_value})</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {bloodTestDetails && (
                      <button
                        onClick={() => navigate("/blood-test")}
                        className="flex items-center gap-1.5 text-xs font-mono text-primary hover:underline mt-2"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ver exame completo
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* AI generate button */}
        <button
          onClick={generateAIStack}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 text-primary font-semibold text-sm mb-6 hover:from-primary/20 hover:to-accent/20 transition-all disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analisando perfil{hasBloodData ? " + exames" : ""}...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {isAIGenerated ? "Regenerar stack com IA" : "Gerar stack personalizado com IA"}
              {hasBloodData && <FlaskConical className="w-3.5 h-3.5 ml-1" />}
            </>
          )}
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
                <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                  {supps.filter(s => checkedSupps.includes(s.name)).length}/{supps.length}
                </span>
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
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
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
          {isAIGenerated && (
            <p className="text-[9px] font-mono text-muted-foreground mt-2">
              ✨ Stack gerado por IA · {hasBloodData ? "Integrado com exames" : "Baseado no perfil"}
            </p>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default SupplementationPage;
