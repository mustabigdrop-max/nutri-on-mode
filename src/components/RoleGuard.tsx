import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface Props {
  children: React.ReactNode;
  /** "athlete" only allows athletes; "professional" only allows professionals/coaches/admin */
  require: "athlete" | "professional";
  /** Where to send users that don't match (defaults: athlete→/coach-dashboard, pro→/dashboard) */
  redirectTo?: string;
}

const RoleGuard = ({ children, require, redirectTo }: Props) => {
  const { loading, isProfessional, isAthlete } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (require === "athlete" && !isAthlete) {
    return <Navigate to={redirectTo ?? "/coach-dashboard"} replace />;
  }
  if (require === "professional" && !isProfessional) {
    return <Navigate to={redirectTo ?? "/dashboard"} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
