import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Droplets, Plus, User, Microscope, Lock, ClipboardList } from "lucide-react";
import { useLabSubscription } from "@/hooks/useLabSubscription";
import { useCoachAccess } from "@/hooks/useCoachAccess";
import LabUpsellModal from "@/components/lab/LabUpsellModal";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { hasLab, loading: labLoading } = useLabSubscription();
  const { hasAccess: hasCoachAccess } = useCoachAccess();
  const [showUpsell, setShowUpsell] = useState(false);

  const NAV_ITEMS = [
    { id: "home", icon: BarChart3, label: "Home", path: "/dashboard" },
    { id: "hydration", icon: Droplets, label: "Água", path: "/hydration" },
    { id: "add", icon: Plus, label: "", path: "/meal-log" },
    ...(hasCoachAccess
      ? [{ id: "coach", icon: ClipboardList, label: "Coach", path: "/meus-protocolos" }]
      : [{ id: "lab", icon: Microscope, label: "LAB", path: "/lab" }]),
    { id: "profile", icon: User, label: "Perfil", path: "/profile" },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.path;

            if (item.id === "add") {
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground -mt-5 glow-gold"
                  >
                    <Plus className="w-6 h-6" />
                  </motion.div>
                </button>
              );
            }

            if (item.id === "lab") {
              const locked = !labLoading && !hasLab;
              return (
                <button
                  key={item.id}
                  onClick={() => locked ? setShowUpsell(true) : navigate(item.path)}
                  className="flex flex-col items-center gap-0.5 py-1 min-w-[48px] relative"
                >
                  <div className="relative">
                    <item.icon
                      className={`w-5 h-5 ${isActive ? "text-primary" : locked ? "text-muted-foreground/50" : "text-muted-foreground"}`}
                    />
                    {locked && (
                      <Lock className="w-2.5 h-2.5 text-muted-foreground absolute -top-1 -right-1.5" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-mono ${isActive ? "text-primary" : locked ? "text-muted-foreground/50" : "text-muted-foreground"}`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]"
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={`text-[10px] font-mono ${isActive ? "text-primary" : "text-muted-foreground"}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <LabUpsellModal open={showUpsell} onClose={() => setShowUpsell(false)} />
    </>
  );
};

export default BottomNav;
