import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface PerformanceExam {
  id: string;
  exam_date: string;
  ldl: number | null;
  hdl: number | null;
  triglycerides: number | null;
  tgo: number | null;
  tgp: number | null;
  ggt: number | null;
  testosterone_total: number | null;
  testosterone_free: number | null;
  estradiol: number | null;
  lh: number | null;
  fsh: number | null;
  prolactin: number | null;
  hematocrit: number | null;
  hemoglobin: number | null;
  creatinine: number | null;
  urea: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  psa: number | null;
  notes: string | null;
  ai_analysis: Record<string, unknown>;
}

export interface PerformanceProtocol {
  id: string;
  substances: string[];
  current_phase: string;
  objective: string;
  experience_level: string;
  nutrition_plan: Record<string, unknown>;
  support_stack: Record<string, unknown>[];
  safety_alerts: Record<string, unknown>[];
  ai_message: string | null;
  started_at: string;
}

export const usePerformancePro = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [protocol, setProtocol] = useState<PerformanceProtocol | null>(null);
  const [exams, setExams] = useState<PerformanceExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);

    const [consentRes, protocolRes, examsRes] = await Promise.all([
      supabase
        .from("performance_pro_consent")
        .select("id")
        .eq("user_id", user.id)
        .limit(1),
      supabase
        .from("performance_pro_protocols")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("performance_pro_exams")
        .select("*")
        .eq("user_id", user.id)
        .order("exam_date", { ascending: false }),
    ]);

    setHasConsent(!!consentRes.data?.length);
    setProtocol((protocolRes.data?.[0] as unknown as PerformanceProtocol) ?? null);
    setExams((examsRes.data as unknown as PerformanceExam[]) ?? []);
    setLoading(false);
  };

  const acceptConsent = async () => {
    if (!user) return;
    const { error } = await supabase.from("performance_pro_consent").insert({
      user_id: user.id,
    });
    if (!error) {
      setHasConsent(true);
      toast({ title: "Acesso liberado", description: "Bem-vindo ao Performance Pro" });
    }
  };

  const createProtocol = async (data: {
    substances: string[];
    current_phase: string;
    objective: string;
    experience_level: string;
  }) => {
    if (!user) return null;

    // Call AI to generate protocol
    const { data: aiResult, error: aiError } = await supabase.functions.invoke(
      "generate-performance-protocol",
      {
        body: { ...data, user_id: user.id },
      }
    );

    const protocolData = {
      user_id: user.id,
      substances: data.substances,
      current_phase: data.current_phase,
      objective: data.objective,
      experience_level: data.experience_level,
      nutrition_plan: aiResult?.nutrition_plan ?? {},
      support_stack: aiResult?.support_stack ?? [],
      safety_alerts: aiResult?.safety_alerts ?? [],
      ai_message: aiResult?.ai_message ?? null,
    };

    const { data: inserted, error } = await supabase
      .from("performance_pro_protocols")
      .insert(protocolData)
      .select()
      .single();

    if (!error && inserted) {
      setProtocol(inserted as unknown as PerformanceProtocol);
      toast({ title: "Protocolo gerado", description: "Seu protocolo personalizado está pronto" });
    }
    return inserted;
  };

  const saveExam = async (exam: Omit<PerformanceExam, "id" | "ai_analysis">) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("performance_pro_exams")
      .insert({ ...exam, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setExams((prev) => [data as unknown as PerformanceExam, ...prev]);
      toast({ title: "Exame registrado", description: "Valores salvos com sucesso" });
    }
  };

  return {
    hasConsent,
    protocol,
    exams,
    loading,
    acceptConsent,
    createProtocol,
    saveExam,
    refetch: fetchAll,
  };
};
