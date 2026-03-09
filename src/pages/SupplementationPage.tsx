import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useSupplements, type SupplementItem } from "@/hooks/useSupplements";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Sparkles, Coffee, Sun, Moon, Clock,
  FlaskConical, ChevronDown, ChevronUp, Loader2, Flame, Wallet,
  RotateCcw, Pill,
} from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import SupplementOnboarding from "@/components/supplements/SupplementOnboarding";
import SupplementCard from "@/components/supplements/SupplementCard";
import SupplementTimeline from "@/components/supplements/SupplementTimeline";
import StackGapAnalysis from "@/components/supplements/StackGapAnalysis";
import InteractionWarnings from "@/components/supplements/InteractionWarnings";

const TIMING_GROUPS = [
  { key: "morning", label: "Manhã", icon: Coffee, color: "text-amber-400" },
  { key: "afternoon", label: "Tarde", icon: Sun, color: "text-orange-400" },
  { key: "night", label: "Noite", icon: Moon, color: "text-purple-400" },
  { key: "anytime", label: "Qualquer hora", icon: Clock, color: "text-cyan-400" },
] as const;

const SupplementationPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { user } = useAuth();
  const { stack: savedStack, todayLogs, streak, logSupplement, saveStack, loading } = useSupplements();

  const [generating, setGenerating] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [displayStack, setDisplayStack] = useState<SupplementItem[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [budgetMessage, setBudgetMessage] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [currentSupps, setCurrentSupps] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [showExams, setShowExams] = useState(false);
  const [bloodWarnings, setBloodWarnings] = useState<string[]>([]);
  const [hasBloodData, setHasBloodData] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "stack" | "analysis">("timeline");

  useEffect(() => {
    if (savedStack) {
      setDisplayStack(savedStack.supplements);
      setAiSummary(savedStack.ai_summary || "");
      setCurrentSupps(savedStack.current_supplements || []);
      setConditions(savedStack.health_conditions || []);
      setTotalCost(savedStack.monthly_cost || 0);
    }
  }, [savedStack]);

  useEffect(() => {
    if (user) checkBloodTests();
  }, [user]);

  const checkBloodTests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("blood_tests")
      .select("ai_analysis, test_date")
      .eq("user_id", user.id)
      .eq("status", "analyzed")
      .order("test_date", { ascending: false })
      .limit(1);

    if (data?.[0]?.ai_analysis) {
      setHasBloodData(true);
      const analysis = data[0].ai_analysis as any;
      const warnings: string[] = [];
      if (analysis.markers) {
        for (const marker of analysis.markers) {
          if (["low", "high", "critical"].includes(marker.status)) {
            warnings.push(`${marker.name}: ${marker.value} ${marker.unit} (${marker.status === "low" ? "⬇️ baixo" : "⬆️ alto"})`);
          }
        }
      }
      setBloodWarnings(warnings);
    }
  };

  const handleGenerate = async (data: {
    goal: string;
    budget: string;
    restrictions: string[];
    currentSupps: string[];
    conditions: string[];
  }) => {
    if (!user || !profile) {
      toast.error("Complete seu perfil primeiro.");
      return;
    }
    setGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-supplement-stack", {
        body: {
          profile: {
            goal: profile.goal,
            weight_kg: profile.weight_kg,
            height_cm: profile.height_cm,
            activity_level: profile.activity_level,
            sport: profile.sport,
            health_conditions: data.conditions,
            dietary_restrictions: data.restrictions,
            uses_glp1: profile.uses_glp1,
          },
          goal: data.goal,
          budget: data.budget,
          currentSupplements: data.currentSupps,
          healthConditions: data.conditions,
          dietaryRestrictions: data.restrictions,
        },
      });

      if (error) throw error;
      if (result?.error) {
        toast.error(result.error);
        setGenerating(false);
        return;
      }

      if (result?.supplements?.length > 0) {
        setDisplayStack(result.supplements);
        setAiSummary(result.summary || "");
        setBudgetMessage(result.budget_message || "");
        setTotalCost(result.total_monthly_cost || 0);
        setCurrentSupps(data.currentSupps);
        setConditions(data.conditions);
        setShowOnboarding(false);

        await saveStack(
          result.supplements,
          data.goal,
          data.budget,
          data.currentSupps,
          data.conditions,
          data.restrictions,
          result.summary || "",
          result.total_monthly_cost || 0,
        );

        toast.success("Stack personalizado gerado! 💊");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar stack.");
    }
    setGenerating(false);
  };

  const needsOnboarding = !savedStack && !showOnboarding;
  const showSetup = showOnboarding || needsOnboarding;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-border bg-card">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              💊 Suplementação Inteligente
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {savedStack ? (
                <span className="text-purple-400">Stack ativo · {streak > 0 ? `🔥 ${streak} dias` : "Inicie sua streak"}</span>
              ) : "Configure seu stack personalizado"}
            </p>
          </div>
          {savedStack && (
            <button
              onClick={() => setShowOnboarding(true)}
              className="p-2 rounded-lg border border-border bg-card hover:border-purple-500/30 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Onboarding / Setup */}
        {(showSetup || showOnboarding) && !savedStack ? (
          <SupplementOnboarding onComplete={handleGenerate} generating={generating} />
        ) : showOnboarding ? (
          <div>
            <SupplementOnboarding onComplete={handleGenerate} generating={generating} />
            <button onClick={() => setShowOnboarding(false)} className="w-full text-center text-xs text-muted-foreground mt-3 hover:text-foreground">
              Cancelar e voltar ao stack atual
            </button>
          </div>
        ) : (
          <>
            {/* AI Summary */}
            {aiSummary && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 mb-4"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground">{aiSummary}</p>
                </div>
              </motion.div>
            )}

            {/* Budget Message */}
            {budgetMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-border bg-card p-3 mb-4"
              >
                <div className="flex items-start gap-2">
                  <Wallet className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-foreground">{budgetMessage}</p>
                    {totalCost > 0 && (
                      <p className="text-xs font-mono text-purple-400 mt-1">
                        Stack atual: ~R${totalCost}/mês
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Blood test section */}
            {bloodWarnings.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowExams(!showExams)}
                  className="w-full flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3"
                >
                  <FlaskConical className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-foreground flex-1 text-left">
                    {bloodWarnings.length} marcador{bloodWarnings.length > 1 ? "es" : ""} fora da faixa
                  </span>
                  {showExams ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {showExams && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border border-t-0 border-red-500/20 rounded-b-xl bg-card p-3 space-y-1">
                        {bloodWarnings.map((w, i) => (
                          <p key={i} className="text-xs text-muted-foreground">{w}</p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Streak badge */}
            {streak > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 mb-4"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">💊 Stack Ativo — {streak} dia{streak > 1 ? "s" : ""}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">Mantenha a consistência para melhores resultados</p>
                </div>
              </motion.div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-card border border-border mb-4">
              {[
                { key: "timeline", label: "Hoje" },
                { key: "stack", label: "Stack Completo" },
                { key: "analysis", label: "Análise" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono transition-all ${
                    activeTab === tab.key
                      ? "bg-purple-500/20 text-purple-400 font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "timeline" && (
                <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SupplementTimeline
                    supplements={displayStack}
                    logs={todayLogs}
                    onToggle={(name) => logSupplement(name)}
                  />
                </motion.div>
              )}

              {activeTab === "stack" && (
                <motion.div key="stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Interaction warnings */}
                  <InteractionWarnings supplements={displayStack} conditions={conditions} />

                  {TIMING_GROUPS.map(group => {
                    const supps = displayStack.filter(s => s.timingIcon === group.key);
                    if (supps.length === 0) return null;
                    return (
                      <div key={group.key} className="mb-5 mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <group.icon className={`w-4 h-4 ${group.color}`} />
                          <h3 className="text-sm font-bold text-foreground">{group.label}</h3>
                          <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                            {supps.filter(s => todayLogs.some(l => l.supplement_name === s.name && !l.skipped)).length}/{supps.length}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {supps.map((supp, i) => (
                            <SupplementCard
                              key={supp.name}
                              {...supp}
                              isChecked={todayLogs.some(l => l.supplement_name === supp.name && !l.skipped)}
                              onToggle={() => logSupplement(supp.name)}
                              index={i}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Total cost */}
                  {totalCost > 0 && (
                    <div className="rounded-xl border border-border bg-card p-3 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Custo total estimado</span>
                        <span className="text-sm font-bold text-purple-400 font-mono">~R${totalCost}/mês</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "analysis" && (
                <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <StackGapAnalysis currentSupps={currentSupps} recommended={displayStack} />

                  {/* Summary progress */}
                  <div className="rounded-xl border border-purple-500/20 bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-2">📋 Resumo do dia</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {todayLogs.filter(l => !l.skipped).length}/{displayStack.length} suplementos tomados
                    </p>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden mt-2">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400"
                        animate={{ width: `${(todayLogs.filter(l => !l.skipped).length / Math.max(displayStack.length, 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default SupplementationPage;
