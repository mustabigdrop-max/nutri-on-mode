import { Navigate } from "react-router-dom";
import { useClientAccess } from "@/hooks/useClientAccess";
import { useProfile } from "@/hooks/useProfile";
import LockedScreen from "@/components/client/LockedScreen";

export default function AcessoPausadoPage() {
  const { loading, lock } = useClientAccess();
  const { profile } = useProfile();

  if (loading) {
    return <div className="min-h-screen" style={{ background: "#0A0A0A" }} />;
  }
  if (!lock?.isLocked) return <Navigate to="/dashboard" replace />;

  return (
    <LockedScreen
      clientName={profile?.full_name ?? null}
      expiredAt={lock.planExpiresAt}
      coachPhone={lock.coachPhone}
    />
  );
}
