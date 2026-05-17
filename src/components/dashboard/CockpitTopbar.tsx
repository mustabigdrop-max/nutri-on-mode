import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface CockpitTopbarProps {
  phaseLabel?: string;
  onSignOut?: () => void;
}

const NAV = [
  { label: "Home", path: "/dashboard" },
  { label: "NutriPlan", path: "/meal-plan" },
  { label: "TrainingON", path: "/nutrisync" },
  { label: "LAB", path: "/lab" },
  { label: "Perfil", path: "/profile" },
];

export default function CockpitTopbar({ phaseLabel = "BULKING", onSignOut }: CockpitTopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 flex h-12 items-center justify-between px-3 md:px-5"
      style={{
        background: "rgba(2,2,5,0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(184,146,42,0.18)",
      }}
    >
      {/* Left: logo + cockpit badge */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-baseline gap-0.5 leading-none"
          style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.02em" }}
        >
          <span style={{ color: "#F5F0E8" }}>NUTRI</span>
          <span style={{ color: "#B8922A" }}>ON</span>
        </div>
        <span
          className="hidden sm:inline-flex items-center"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.22em",
            color: "rgba(184,146,42,0.55)",
            border: "1px solid rgba(184,146,42,0.33)",
            padding: "2px 6px",
            borderRadius: 2,
          }}
        >
          COCKPIT
        </span>
      </div>

      {/* Center nav (desktop only) */}
      <nav className="hidden md:flex items-center gap-6">
        {NAV.map((n) => {
          const active = location.pathname === n.path;
          return (
            <button
              key={n.path}
              onClick={() => navigate(n.path)}
              className="relative py-3 transition-colors"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: active ? "#B8922A" : "#5A5A5A",
                borderBottom: active ? "1px solid #B8922A" : "1px solid transparent",
              }}
            >
              {n.label}
            </button>
          );
        })}
      </nav>

      {/* Right: status + phase + logout */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden sm:flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#00D4FF", boxShadow: "0 0 6px #00D4FF" }}
          />
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: "0.18em",
              color: "rgba(0,212,255,0.55)",
            }}
          >
            SISTEMA ATIVO
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-1"
          style={{
            border: "1px solid rgba(0,212,255,0.25)",
            borderRadius: 2,
            background: "rgba(0,212,255,0.03)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#00D4FF" }}
          />
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: "0.18em",
              color: "#00D4FF",
            }}
          >
            {phaseLabel}
          </span>
        </div>
        <NotificationBell />
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="p-1.5 transition-colors"
            style={{ color: "#5A5A5A" }}
            aria-label="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.header>
  );
}
