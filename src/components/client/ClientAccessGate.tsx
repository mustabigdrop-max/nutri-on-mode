import { useClientAccess } from "@/hooks/useClientAccess";
import { useProfile } from "@/hooks/useProfile";
import LockedScreen from "@/components/client/LockedScreen";

/**
 * Enquanto o vínculo do aluno estiver bloqueado, o app mostra a tela de acesso
 * pausado em vez do conteúdo. Coach e admin não têm vínculo como aluno e passam direto.
 */
export default function ClientAccessGate({ children }: { children: React.ReactNode }) {
  const { loading, lock } = useClientAccess();
  const { profile } = useProfile();

  if (loading) return <>{children}</>;

  if (lock?.isLocked) {
    return (
      <LockedScreen
        clientName={profile?.full_name ?? null}
        expiredAt={lock.planExpiresAt}
        coachPhone={lock.coachPhone}
      />
    );
  }

  return <>{children}</>;
}
