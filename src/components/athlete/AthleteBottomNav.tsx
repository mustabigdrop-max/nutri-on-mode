import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, UtensilsCrossed, Plus, Dumbbell, User } from "lucide-react";

const CYAN = "#00D4FF";
const GREEN = "#00FF88";
const GOLD = "#FFD700";

const ITEMS = [
  { id: "home", icon: Home, label: "Home", path: "/dashboard", color: CYAN },
  { id: "plan", icon: UtensilsCrossed, label: "Plano", path: "/my-plan", color: CYAN },
  { id: "checkin", icon: Plus, label: "Check-in", path: "/checkin", color: GOLD },
  { id: "training", icon: Dumbbell, label: "Treino", path: "/my-training", color: GREEN },
  { id: "profile", icon: User, label: "Perfil", path: "/profile", color: CYAN },
];

const AthleteBottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 backdrop-blur-md z-50"
      style={{ background: "rgba(2,2,5,0.96)", borderTop: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="max-w-lg mx-auto flex items-end justify-around py-2 px-2">
        {ITEMS.map((item) => {
          const isActive = pathname === item.path;

          if (item.id === "checkin") {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 min-w-[56px]"
                aria-label="Check-in"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="rounded-2xl flex items-center justify-center -mt-6"
                  style={{
                    width: 52,
                    height: 52,
                    background: `linear-gradient(135deg, ${GOLD}, #E0A800)`,
                    color: "#1a1200",
                    boxShadow: "0 0 22px rgba(255,215,0,0.35)",
                  }}
                >
                  <Plus className="w-6 h-6" strokeWidth={3} />
                </motion.div>
                <span className="text-[10px] font-semibold" style={{ color: GOLD }}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 py-1 min-w-[56px]"
            >
              <item.icon className="w-5 h-5" style={{ color: isActive ? item.color : "#6b7280" }} />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? item.color : "#6b7280" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AthleteBottomNav;
