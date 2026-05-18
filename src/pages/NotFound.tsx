import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { HudShell, HudStatusBar } from "@/components/hud/HudShell";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <HudShell>
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-xl">
          <div className="mb-12">
            <HudStatusBar label="ERRO DE SISTEMA" meta={`ROUTE · ${location.pathname}`} color="#00D4FF" />
          </div>

          <div className="text-center">
            <div
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: "14rem",
                lineHeight: 1,
                color: "#B8922A",
                textShadow: "0 0 80px rgba(184,146,42,0.45)",
                letterSpacing: "0.02em",
              }}
            >
              404
            </div>

            <p className="hud-tech mt-4" style={{ color: "#B8922A" }}>
              MÓDULO NÃO LOCALIZADO
            </p>

            <p className="mt-6 text-base" style={{ color: "#F5F0E8", fontFamily: "'Space Grotesk', sans-serif" }}>
              Este módulo não existe no sistema.
            </p>

            <button onClick={() => navigate("/")} className="hud-btn mt-10">
              ◄ VOLTAR AO SISTEMA
            </button>
          </div>
        </div>
      </div>
    </HudShell>
  );
};

export default NotFound;
