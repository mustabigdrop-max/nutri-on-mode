import { Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAthleteView } from "@/hooks/useAthleteView";
import { useAthleteTarget } from "@/hooks/useAthleteTarget";

const AthleteDashboard = lazy(() => import("@/pages/athlete/AthleteDashboard"));

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: "#020205" }}>
    <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "#00D4FF", borderTopColor: "transparent" }} />
  </div>
);

/**
 * Rende o Dashboard do Atleta (visão restrita) quando o usuário é um
 * cliente vinculado a um coach; caso contrário mostra o dashboard padrão.
 */
export const AthleteDashboardGate = ({ children }: { children: React.ReactNode }) => {
  const { loading, isRestrictedAthlete } = useAthleteView();
  if (loading) return <Loader />;
  if (isRestrictedAthlete) {
    return (
      <Suspense fallback={<Loader />}>
        <AthleteDashboard />
      </Suspense>
    );
  }
  return <>{children}</>;
};

/**
 * Bloqueia rotas de ferramentas internas do coach para clientes/atletas restritos.
 */
export const CoachToolRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, isRestrictedAthlete } = useAthleteView();
  if (loading) return <Loader />;
  if (isRestrictedAthlete) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

/**
 * Rotas exclusivas do atleta restrito (meu plano, meu treino, check-in).
 */
export const AthleteOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, isRestrictedAthlete } = useAthleteView();
  const targetId = useAthleteTarget();
  if (loading) return <Loader />;
  // coach visualizando um atleta específico também pode abrir (RLS protege os dados)
  if (!isRestrictedAthlete && !targetId) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
