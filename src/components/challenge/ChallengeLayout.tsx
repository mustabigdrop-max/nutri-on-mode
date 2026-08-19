import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { Home, UtensilsCrossed, Trophy, Headphones, User } from "lucide-react";
import { useChallenge } from "@/hooks/useChallenge";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/desafio/dashboard", label: "Home", icon: Home },
  { to: "/desafio/plano", label: "Plano", icon: UtensilsCrossed },
  { to: "/desafio/ranking", label: "Ranking", icon: Trophy },
  { to: "/desafio/mce", label: "MCE", icon: Headphones },
  { to: "/desafio/perfil", label: "Perfil", icon: User },
];

export default function ChallengeLayout() {
  const { participant, loading } = useChallenge();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!participant) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Outlet />

      <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]")} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function ChallengeHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="px-4 pt-6 pb-3">
      <p className="text-[10px] tracking-[0.35em] text-muted-foreground">N U T R I O N</p>
      <h1 className="mt-1 text-2xl font-black tracking-tight">{title}</h1>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </header>
  );
}
