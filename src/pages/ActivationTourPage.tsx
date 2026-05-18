import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";
const GREEN = "#00C896";

const TOUR_STEPS = [
  {
    code: "MC",
    id: "T-01",
    title: "Painel de Macros em Tempo Real",
    description: "Proteína, carboidrato e gordura atualizados a cada registro. Seu protocolo nutriON visualizado em tempo real.",
    color: GOLD,
  },
  {
    code: "RF",
    id: "T-02",
    title: "Registros Flexíveis",
    description: "'Comi fora' e 'Refeição Livre' — para quando a vida não segue o plano. O sistema recalibra. Sem culpa.",
    color: CYAN,
  },
  {
    code: "IA",
    id: "T-03",
    title: "IA de Decisão",
    description: "'E se eu comer?' — antes de qualquer desvio, consulta a IA primeiro. Ela te dá opções inteligentes, sem julgamento.",
    color: GOLD,
  },
];

const HudShell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
    style={{ background: "#0a0a1a", fontFamily: "'Space Grotesk', sans-serif" }}
  >
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(184,146,42,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(184,146,42,.04) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }}
    />
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ width: 600, height: 400, background: `radial-gradient(ellipse, rgba(184,146,42,0.06) 0%, transparent 65%)` }}
    />
    <div className="hud-scan-line" />
    <div className="hud-corner-tl" style={{ top: 24, left: 24 }} />
    <div className="hud-corner-tr" style={{ top: 24, right: 24 }} />
    <div className="hud-corner-bl" style={{ bottom: 24, left: 24 }} />
    <div className="hud-corner-br" style={{ bottom: 24, right: 24 }} />
    {children}
  </div>
);

const ActivationTourPage = () => {
  const [step, setStep] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifTimes, setNotifTimes] = useState({ cafe: "07:00", almoco: "12:00", jantar: "19:00", lanche: "" });
  const [includeLanche, setIncludeLanche] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfile } = useProfile();

  const handleTourNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setShowNotifications(true);
    }
  };

  const handleFinish = async (withNotifications: boolean) => {
    if (user) {
      await updateProfile({ activation_completed: true } as any);
      const prefs = withNotifications ? {
        enabled: true,
        times: {
          cafe: notifTimes.cafe,
          almoco: notifTimes.almoco,
          jantar: notifTimes.jantar,
          ...(includeLanche ? { lanche: notifTimes.lanche } : {}),
        },
      } : { enabled: false };
      await supabase.from("activation_metrics").upsert({
        user_id: user.id,
        tour_completed_at: new Date().toISOString(),
        notifications_configured: withNotifications,
        notification_preferences: prefs,
      }, { onConflict: "user_id" });
    }
    navigate("/dashboard");
  };

  // Notification setup screen
  if (showNotifications) {
    return (
      <HudShell>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center mb-4"
              style={{
                width: 52, height: 52,
                background: "rgba(0,212,255,0.1)",
                border: `1px solid ${CYAN}44`,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            >
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700, color: CYAN }}>BEL</span>
            </div>
            <h1
              className="leading-tight mb-1"
              style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "2rem", color: "#F5F0E8" }}
            >
              CONFIGURAR ALERTAS
            </h1>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.12em", color: "rgba(80,80,122,0.7)" }}>
              QUANDO REGISTRAR SUAS REFEIÇÕES?
            </p>
          </div>

          {/* Time slots */}
          <div
            className="space-y-2 p-5 mb-4"
            style={{
              border: "1px solid rgba(184,146,42,0.12)",
              background: "rgba(10,10,26,0.6)",
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          >
            {[
              { key: "cafe",   label: "CAFÉ DA MANHÃ", code: "BK" },
              { key: "almoco", label: "ALMOÇO",         code: "LN" },
              { key: "jantar", label: "JANTAR",         code: "DN" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 28, height: 28,
                      background: "rgba(184,146,42,0.08)",
                      border: "1px solid rgba(184,146,42,0.2)",
                      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    }}
                  >
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", color: GOLD }}>{item.code}</span>
                  </div>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.1em", color: "rgba(245,240,232,0.7)" }}>
                    {item.label}
                  </span>
                </div>
                <input
                  type="time"
                  value={(notifTimes as any)[item.key]}
                  onChange={(e) => setNotifTimes(prev => ({ ...prev, [item.key]: e.target.value }))}
                  style={{
                    padding: "6px 10px",
                    background: "rgba(10,10,26,0.9)",
                    border: "1px solid rgba(184,146,42,0.25)",
                    color: GOLD,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.7rem",
                    outline: "none",
                  }}
                />
              </div>
            ))}

            {!includeLanche ? (
              <button
                onClick={() => setIncludeLanche(true)}
                className="w-full py-2.5 transition-colors"
                style={{
                  border: "1px dashed rgba(184,146,42,0.2)",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.55rem",
                  letterSpacing: "0.1em",
                  color: "rgba(80,80,122,0.7)",
                  background: "transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(80,80,122,0.7)")}
              >
                + ADICIONAR LANCHE DA TARDE
              </button>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 28, height: 28,
                      background: "rgba(0,212,255,0.08)",
                      border: "1px solid rgba(0,212,255,0.2)",
                      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    }}
                  >
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", color: CYAN }}>LC</span>
                  </div>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.1em", color: "rgba(245,240,232,0.7)" }}>
                    LANCHE DA TARDE
                  </span>
                </div>
                <input
                  type="time"
                  value={notifTimes.lanche}
                  onChange={(e) => setNotifTimes(prev => ({ ...prev, lanche: e.target.value }))}
                  style={{
                    padding: "6px 10px",
                    background: "rgba(10,10,26,0.9)",
                    border: "1px solid rgba(0,212,255,0.25)",
                    color: CYAN,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.7rem",
                    outline: "none",
                  }}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => handleFinish(true)}
            className="w-full mb-2"
            style={{
              background: GOLD,
              color: "#0a0a1a",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "1rem",
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              border: "none",
              cursor: "pointer",
            }}
          >
            ATIVAR ALERTAS →
          </button>

          <button
            onClick={() => handleFinish(false)}
            className="w-full py-3 transition-colors"
            style={{
              background: "transparent",
              border: "none",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.55rem",
              letterSpacing: "0.1em",
              color: "rgba(80,80,122,0.6)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.5)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(80,80,122,0.6)")}
          >
            PREFIRO SEM NOTIFICAÇÕES
          </button>
        </motion.div>
      </HudShell>
    );
  }

  // Tour steps
  const current = TOUR_STEPS[step];

  return (
    <HudShell>
      <motion.div className="relative z-10 w-full max-w-md">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {TOUR_STEPS.map((s, i) => (
            <div
              key={i}
              className="transition-all duration-300"
              style={{
                height: 3,
                width: i === step ? 32 : 16,
                background: i <= step ? (i === step ? s.color : "rgba(184,146,42,0.4)") : "rgba(80,80,122,0.3)",
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Hex icon */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center justify-center mb-6"
              style={{
                width: 72, height: 72,
                background: `rgba(${current.color === GOLD ? "184,146,42" : "0,212,255"},0.1)`,
                border: `1px solid ${current.color}44`,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                boxShadow: `0 0 40px ${current.color}22`,
              }}
            >
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.9rem", fontWeight: 700, color: current.color }}>
                {current.code}
              </span>
            </motion.div>

            {/* ID tag */}
            <div className="mb-4" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.2em", color: `${current.color}66` }}>
              {current.id}
            </div>

            <h2
              className="mb-4 leading-tight"
              style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.8rem", color: "#F5F0E8" }}
            >
              {current.title.toUpperCase()}
            </h2>

            <p
              className="mb-8 max-w-xs mx-auto"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.08em", color: "rgba(80,80,122,0.9)", lineHeight: 1.8 }}
            >
              {current.description}
            </p>

            <button
              onClick={handleTourNext}
              className="mx-auto"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: current.color,
                color: "#0a0a1a",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "0.9rem 2.5rem",
                clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                border: "none",
                cursor: "pointer",
                minWidth: 220,
              }}
            >
              {step === TOUR_STEPS.length - 1 ? "ATIVAR SISTEMA →" : "CONTINUAR →"}
            </button>

            <p className="mt-5" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.15em", color: "rgba(80,80,122,0.5)" }}>
              PASSO {step + 1} DE {TOUR_STEPS.length}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </HudShell>
  );
};

export default ActivationTourPage;
