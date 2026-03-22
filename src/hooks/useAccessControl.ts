import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanGate } from "@/hooks/usePlanGate";

export type AcompanhadoFeature =
  | "tracking_macros"
  | "plano_semanal"
  | "chat_ia"
  | "diario_foto"
  | "score_nutricional"
  | "alertas_preditivos"
  | "modo_comi_fora"
  | "gamificacao_completa"
  | "receitas"
  | "lista_compras"
  | "suplementacao_ia"
  | "relatorio_pdf"
  | "historico_completo"
  | "integracao_wearables"
  | "ranking"
  | "badges_especiais"
  | "niveis_avancados";

// Features available in Modo Acompanhado by default
const ACOMPANHADO_ALLOWED: Set<AcompanhadoFeature> = new Set([
  "tracking_macros",
  "plano_semanal",
  "chat_ia",
  "diario_foto",
  "score_nutricional",
  "alertas_preditivos",
  "modo_comi_fora",
]);

// Features blocked in Modo Acompanhado
const ACOMPANHADO_BLOCKED: Set<AcompanhadoFeature> = new Set([
  "receitas",
  "lista_compras",
  "suplementacao_ia",
  "relatorio_pdf",
  "historico_completo",
  "integracao_wearables",
  "gamificacao_completa",
  "ranking",
  "badges_especiais",
  "niveis_avancados",
]);

export const FEATURE_LABELS: Record<AcompanhadoFeature, string> = {
  tracking_macros: "Tracking de Macros",
  plano_semanal: "Plano Semanal por IA",
  chat_ia: "Chat com IA",
  diario_foto: "Diário Fotográfico",
  score_nutricional: "Score Nutricional",
  alertas_preditivos: "Alertas Preditivos",
  modo_comi_fora: "Modo Comi Fora",
  gamificacao_completa: "Gamificação Completa",
  receitas: "Receitas Personalizadas",
  lista_compras: "Lista de Compras",
  suplementacao_ia: "Suplementação IA",
  relatorio_pdf: "Relatório PDF Pessoal",
  historico_completo: "Histórico Completo",
  integracao_wearables: "Integração Wearables",
  ranking: "Ranking entre Usuários",
  badges_especiais: "Badges Especiais",
  niveis_avancados: "Níveis Avançados",
};

// Override keys the coach can toggle
export const COACH_TOGGLEABLE_FEATURES: AcompanhadoFeature[] = [
  "receitas",
  "lista_compras",
  "historico_completo",
];

interface FeaturesOverride {
  receitas?: boolean;
  lista_compras?: boolean;
  chat_limit?: number;
  historico_completo?: boolean;
  suplementacao_ia?: boolean;
  relatorio_pdf?: boolean;
  integracao_wearables?: boolean;
  [key: string]: boolean | number | undefined;
}

export const useAccessControl = () => {
  const { user } = useAuth();
  const { plan, role, loading: planLoading } = usePlanGate();
  const [featuresOverride, setFeaturesOverride] = useState<FeaturesOverride | null>(null);
  const [chatUsedThisMonth, setChatUsedThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [coachName, setCoachName] = useState<string | null>(null);
  const [coachBio, setCoachBio] = useState<string | null>(null);
  const [coachAvatar, setCoachAvatar] = useState<string | null>(null);

  const isAcompanhado = role === "aluno_coach";

  useEffect(() => {
    if (!user || planLoading) return;

    const fetchData = async () => {
      if (!isAcompanhado) {
        setLoading(false);
        return;
      }

      // Get profile features_override and coach info
      const { data: profileData } = await supabase
        .from("profiles")
        .select("features_override, coach_profile_id")
        .eq("user_id", user.id)
        .single();

      // Get coach patient override
      if (profileData?.coach_profile_id) {
        const { data: patientData } = await supabase
          .from("coach_patients")
          .select("features_override")
          .eq("coach_id", profileData.coach_profile_id)
          .eq("patient_user_id", user.id)
          .maybeSingle();

        // Merge overrides: coach_patients override takes priority
        const profileOverride = (profileData.features_override as FeaturesOverride) || {};
        const patientOverride = (patientData?.features_override as FeaturesOverride) || {};
        setFeaturesOverride({ ...profileOverride, ...patientOverride });

        // Get coach info
        const { data: coachData } = await supabase
          .from("coach_profiles")
          .select("professional_name, bio, avatar_url")
          .eq("id", profileData.coach_profile_id)
          .single();

        if (coachData) {
          setCoachName(coachData.professional_name || "Coach");
          setCoachBio(coachData.bio || null);
          setCoachAvatar(coachData.avatar_url || null);
        }
      }

      // Count chat messages this month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("role", "user")
        .gte("created_at", monthStart);

      setChatUsedThisMonth(count || 0);
      setLoading(false);
    };

    fetchData();
  }, [user, isAcompanhado, planLoading]);

  const chatLimit = featuresOverride?.chat_limit ?? 10;
  const chatRemaining = Math.max(0, chatLimit - chatUsedThisMonth);
  const isChatUnlimited = !isAcompanhado || (featuresOverride?.chat_limit === -1);

  const checkAccess = (feature: AcompanhadoFeature): boolean => {
    // Non-acompanhado users: check plan normally
    if (!isAcompanhado) return true;

    // Check override first
    const overrideKey = feature as string;
    if (featuresOverride && featuresOverride[overrideKey] === true) return true;

    // Chat limit special case
    if (feature === "chat_ia") {
      if (isChatUnlimited) return true;
      return chatUsedThisMonth < chatLimit;
    }

    // Default allowed features
    if (ACOMPANHADO_ALLOWED.has(feature)) return true;

    return false;
  };

  const isReadOnly = (feature: AcompanhadoFeature): boolean => {
    if (!isAcompanhado) return false;
    return feature === "plano_semanal";
  };

  const historyDaysLimit = (): number | null => {
    if (!isAcompanhado) return null;
    if (featuresOverride?.historico_completo) return null;
    return 7;
  };

  const incrementChatCount = () => {
    setChatUsedThisMonth(prev => prev + 1);
  };

  return {
    checkAccess,
    isReadOnly,
    isAcompanhado,
    loading: loading || planLoading,
    chatUsedThisMonth,
    chatLimit,
    chatRemaining,
    isChatUnlimited,
    historyDaysLimit: historyDaysLimit(),
    coachName,
    coachBio,
    coachAvatar,
    featuresOverride,
    incrementChatCount,
  };
};
