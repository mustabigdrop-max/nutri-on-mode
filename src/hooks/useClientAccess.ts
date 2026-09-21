import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LockData {
  isLocked: boolean;
  lockedAt: string | null;
  lockReason: string | null;
  planExpiresAt: string | null;
  coachPhone: string | null;
  coachName: string | null;
}

/**
 * Verifica se o vínculo do aluno com o coach está bloqueado.
 * Usa somente o que está registrado: se o coach não definiu validade, nada bloqueia.
 * Se a data já passou, a tela bloqueia na hora — a rotina diária confirma no banco.
 */
export function useClientAccess() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lock, setLock] = useState<LockData | null>(null);

  const check = useCallback(async () => {
    if (!user?.id) {
      setLock(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data } = await supabase
      .from("coach_patients")
      .select("coach_id, is_locked, locked_at, lock_reason, plan_expires_at, status")
      .eq("patient_user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      setLock(null);
      setLoading(false);
      return;
    }

    const expirou =
      !!data.plan_expires_at && new Date(data.plan_expires_at).getTime() <= Date.now();
    const bloqueado = !!data.is_locked || expirou;

    if (!bloqueado) {
      setLock(null);
      setLoading(false);
      return;
    }

    let coachPhone: string | null = null;
    let coachName: string | null = null;
    if (data.coach_id) {
      const { data: coach } = await supabase
        .from("coach_profiles")
        .select("professional_name, user_id")
        .eq("id", data.coach_id)
        .maybeSingle();
      coachName = coach?.professional_name ?? null;
      if (coach?.user_id) {
        const { data: coachProfile } = await supabase
          .from("profiles")
          .select("phone")
          .eq("user_id", coach.user_id)
          .maybeSingle();
        coachPhone = coachProfile?.phone ?? null;
      }
    }

    setLock({
      isLocked: true,
      lockedAt: data.locked_at ?? (expirou ? new Date().toISOString() : null),
      lockReason: data.lock_reason ?? (expirou ? "plan_expired" : null),
      planExpiresAt: data.plan_expires_at ?? null,
      coachPhone,
      coachName,
    });
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    check();
  }, [check]);

  return { loading, lock, isLocked: !!lock?.isLocked, refetch: check };
}
