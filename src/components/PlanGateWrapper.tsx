import { useState } from "react";
import { usePlanGate, type PlanTier } from "@/hooks/usePlanGate";
import UpgradeModal from "@/components/landing/UpgradeModal";

interface PlanGateWrapperProps {
  children: React.ReactNode;
  requiredPlan: PlanTier;
  featureName: string;
}

const PlanGateWrapper = ({ children, requiredPlan, featureName }: PlanGateWrapperProps) => {
  const { plan, loading, hasAccess, isCoachStudent } = usePlanGate();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Coach students get ON+ access — block ON PRO features
  if (isCoachStudent && requiredPlan === "ON PRO") {
    return (
      <UpgradeModal
        open={true}
        onClose={() => navigate("/coach/dashboard")}
        fromPlan="ON +"
        lockedFeature={featureName}
      />
    );
  }

  if (!hasAccess(requiredPlan)) {
    return (
      <>
        <UpgradeModal
          open={true}
          onClose={() => navigate("/coach/dashboard")}
          fromPlan={plan === "free" ? "ON" : plan}
          lockedFeature={featureName}
        />
      </>
    );
  }

  return <>{children}</>;
};

export default PlanGateWrapper;
