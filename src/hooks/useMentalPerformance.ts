import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useMentalPerformance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nootropicStack, setNootropicStack] = useState<any>(null);
  const [energyScores, setEnergyScores] = useState<any[]>([]);
  const [energyInsights, setEnergyInsights] = useState<any[]>([]);
  const [focusLogs, setFocusLogs] = useState<any[]>([]);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [stackRes, scoresRes, insightsRes, focusRes, logsRes] = await Promise.all([
        supabase.from("nootropic_stacks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("energy_scores").select("*").eq("user_id", user.id).order("score_date", { ascending: false }).limit(30),
        supabase.from("energy_insights").select("*").eq("user_id", user.id).order("generated_at", { ascending: false }).limit(10),
        supabase.from("focus_mode_logs").select("*").eq("user_id", user.id).order("event_date", { ascending: false }).limit(20),
        supabase.from("nootropic_daily_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(30),
      ]);
      setNootropicStack(stackRes.data?.[0] || null);
      setEnergyScores(scoresRes.data || []);
      setEnergyInsights(insightsRes.data || []);
      setFocusLogs(focusRes.data || []);
      setDailyLogs(logsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [user]);

  const generateStack = async (answers: { challenge: string; caffeine_tolerance: string; health_conditions: string[]; objective: string }) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-nootropic-stack", { body: answers });
      if (error) throw error;
      const stack = data.stack;
      await supabase.from("nootropic_stacks").insert({ user_id: user.id, ...answers, generated_stack: stack });
      await fetchAll();
      toast({ title: "Stack nootrópico gerado!", description: "Seu protocolo personalizado está pronto." });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const logEnergyScore = async (score: number, possibleCause?: string) => {
    if (!user) return;
    try {
      await supabase.from("energy_scores").insert({ user_id: user.id, score, possible_cause: possibleCause });
      toast({ title: "Energia registrada!", description: `Score: ${score}/10` });
      await fetchAll();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const activateFocusMode = async (eventType: string, eventTime: string, durationHours: number) => {
    if (!user) return null;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-focus-protocol", {
        body: { event_type: eventType, event_time: eventTime, duration_hours: durationHours },
      });
      if (error) throw error;
      await supabase.from("focus_mode_logs").insert({
        user_id: user.id, event_type: eventType, event_time: eventTime,
        duration_hours: durationHours, protocol_generated: data.protocol,
      });
      toast({ title: "⚡ Modo Foco ativado!", description: "Protocolo gerado para seu evento." });
      await fetchAll();
      return data.protocol;
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (!user || energyScores.length < 7) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-energy-insights", { body: { scores: energyScores } });
      if (error) throw error;
      if (data.insights) {
        for (const insight of data.insights) {
          await supabase.from("energy_insights").insert({ user_id: user.id, insight_text: insight.text, insight_type: insight.type });
        }
      }
      await fetchAll();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const logDailyNootropic = async (itemsTaken: any[], adherenceScore: number) => {
    if (!user) return;
    await supabase.from("nootropic_daily_logs").insert({ user_id: user.id, items_taken: itemsTaken, adherence_score: adherenceScore });
    await fetchAll();
  };

  const rateFocusPerformance = async (logId: string, score: number) => {
    if (!user) return;
    await supabase.from("focus_mode_logs").update({ performance_score: score }).eq("id", logId).eq("user_id", user.id);
    await fetchAll();
  };

  return {
    loading, nootropicStack, energyScores, energyInsights, focusLogs, dailyLogs,
    generateStack, logEnergyScore, activateFocusMode, generateInsights, logDailyNootropic, rateFocusPerformance, refetch: fetchAll,
  };
};

export const usePerplexitySearch = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ answer: string; citations: string[] } | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("research_searches").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setHistory(data || []));
  }, [user]);

  const search = async (query: string, category: string = "general") => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("perplexity-search", { body: { query, category } });
      if (error) throw error;
      setResults({ answer: data.answer, citations: data.citations });
      await supabase.from("research_searches").insert({ user_id: user.id, query, category, results: { answer: data.answer }, citations: data.citations });
      const { data: updated } = await supabase.from("research_searches").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      setHistory(updated || []);
    } catch (e: any) {
      toast({ title: "Erro na pesquisa", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return { loading, results, history, search, clearResults: () => setResults(null) };
};
