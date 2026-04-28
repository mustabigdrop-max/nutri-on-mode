import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Detecta se o usuário tem acesso à "Área Coach" (visualizar plano alimentar,
 * treino e demais envios feitos por um coach humano).
 *
 * Têm acesso:
 *  - Alunos vinculados a um coach (profiles.coach_profile_id != null OU role = 'aluno_coach')
 *  - Parceiros cadastrados (linha em partners para o user)
 *  - Qualquer usuário que já recebeu pelo menos um envio em protocolo_envios
 */
export function useCoachAccess() {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [reason, setReason] = useState<"aluno" | "partner" | "envio" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setReason(null);
      setLoading(false);
      return;
    }

    const check = async () => {
      // 1) Aluno vinculado
      const { data: prof } = await supabase
        .from("profiles")
        .select("coach_profile_id, role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (prof?.coach_profile_id || prof?.role === "aluno_coach") {
        setHasAccess(true);
        setReason("aluno");
        setLoading(false);
        return;
      }

      // 2) Parceiro
      const { data: partner } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (partner) {
        setHasAccess(true);
        setReason("partner");
        setLoading(false);
        return;
      }

      // 3) Já recebeu envios
      const { count } = await supabase
        .from("protocolo_envios")
        .select("id", { count: "exact", head: true })
        .eq("destinatario_id", user.id);

      if ((count || 0) > 0) {
        setHasAccess(true);
        setReason("envio");
      } else {
        setHasAccess(false);
        setReason(null);
      }
      setLoading(false);
    };

    check();
  }, [user]);

  return { hasAccess, reason, loading };
}
