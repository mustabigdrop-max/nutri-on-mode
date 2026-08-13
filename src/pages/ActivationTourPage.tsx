import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Check } from "lucide-react";
import { HudShell, HudStatusBar, HudHex, HudPanel } from "@/components/hud/HudShell";

const TOUR_STEPS = [
  {
    code: "MC",
    id: "T-01",
    title: "PAINEL DE MACROS ATIVO.",
    description: "Atualiza em tempo real a cada registro. Proteína, carboidrato e gordura — leitura visual instantânea.",
    color: "#B8922A",
  },
  {
    code: "RF",
    id: "T-02",
    title: "PROTOCOLO DE EXCEÇÃO.",
    description: "'Comi fora' e 'Refeição Livre' — para quando a operação foge do plano. Sem culpa, com dados.",
    color: "#00D4FF",
  },
  {
    code: "IA",
    id: "T-03",
    title: "CONSULTA PRÉ-DESVIO.",
    description: "'E se eu comer?' — antes de qualquer desvio, consulta o sistema primeiro. Ela calcula opções sem julgamento.",
    color: "#00C896",
  },
];

const MEAL_LABELS: { key: string; code: string; label: string }[] = [
  { key: "cafe", code: "BK", label: "Café da manhã" },
  { key: "almoco", code: "LN", label: "Almoço" },
  { key: "jantar", code: "DN", label: "Jantar" },
];

const ActivationTourPage = () => {
  const [step, setStep] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifTimes, setNotifTimes] = useState({
    cafe: "07:00", almoco: "12:00", jantar: "19:00", lanche: "",
  });
  const [includeLanche, setIncludeLanche] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfile } = useProfile();

  const handleTourNext = () => {
    if (step < TOUR_STEPS.length - 1) setStep(step + 1);
    else setShowNotifications(true);
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

  if (showNotifications) {
    return (
      <HudShell>
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
            <div className="mb-6"><HudStatusBar label="NOTIFY-MODULE" meta="STEP · 04/04" color="#B8922A" /></div>

            <div className="text-center mb-6 space-y-3">
              <div className="inline-block"><HudHex code="BL" color="#B8922A" size={64} /></div>
              <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 26, color: "#F5F0E8", letterSpacing: "0.05em" }}>
                CONFIGURAR ALERTAS
              </h1>
              <p className="hud-tech" style={{ color: "rgba(80,80,122,1)" }}>
                QUANDO O SISTEMA DEVE TE NOTIFICAR PARA REGISTRAR?
              </p>
            </div>

            <HudPanel tag="ALERT-CFG">
              <div className="p-6 space-y-3">
                {MEAL_LABELS.map((item) => (
                  <div key={item.key} className="hud-input-row">
                    <span className="hud-tag">{item.code}</span>
                    <div className="flex-1 flex items-center justify-between px-3">
                      <span style={{ color: "#F5F0E8", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14 }}>
                        {item.label}
                      </span>
                      <input
                        type="time"
                        value={(notifTimes as any)[item.key]}
                        onChange={(e) => setNotifTimes((prev) => ({ ...prev, [item.key]: e.target.value }))}
                        style={{
                          background: "rgba(10,10,26,0.6)",
                          border: "1px solid rgba(184,146,42,0.25)",
                          color: "#B8922A",
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 12,
                          padding: "4px 8px",
                          flex: "0 0 auto",
                          width: "auto",
                        }}
                      />
                    </div>
                  </div>
                ))}

                {!includeLanche ? (
                  <button
                    onClick={() => setIncludeLanche(true)}
                    className="w-full p-3 hud-tech transition-colors"
                    style={{
                      background: "transparent",
                      border: "1px dashed rgba(184,146,42,0.3)",
                      color: "rgba(80,80,122,1)",
                    }}
                  >
                    + ADICIONAR LANCHE DA TARDE
                  </button>
                ) : (
                  <div className="hud-input-row">
                    <span className="hud-tag">LC</span>
                    <div className="flex-1 flex items-center justify-between px-3">
                      <span style={{ color: "#F5F0E8", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14 }}>
                        Lanche da tarde
                      </span>
                      <input
                        type="time"
                        value={notifTimes.lanche}
                        onChange={(e) => setNotifTimes((prev) => ({ ...prev, lanche: e.target.value }))}
                        style={{
                          background: "rgba(10,10,26,0.6)",
                          border: "1px solid rgba(184,146,42,0.25)",
                          color: "#B8922A",
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 12,
                          padding: "4px 8px",
                          flex: "0 0 auto",
                          width: "auto",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </HudPanel>

            <div className="space-y-2 mt-6">
              <button onClick={() => handleFinish(true)} className="hud-btn w-full">
                ► ATIVAR ALERTAS
              </button>
              <button
                onClick={() => handleFinish(false)}
                className="w-full py-3 hud-tech transition-colors hover:text-[#B8922A]"
                style={{ color: "rgba(80,80,122,1)" }}
              >
                CONTINUAR SEM ALERTAS
              </button>
            </div>
          </motion.div>
        </div>
      </HudShell>
    );
  }

  const current = TOUR_STEPS[step];

  return (
    <HudShell>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <HudStatusBar label="TOUR-MODULE" meta={`STEP · 0${step + 1}/04`} color={current.color} />
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {TOUR_STEPS.map((s, i) => (
              <div
                key={i}
                className="h-[3px] transition-all"
                style={{
                  width: i === step ? 32 : 16,
                  background: i <= step ? s.color : "rgba(184,146,42,0.18)",
                }}
              />
            ))}
            <div
              className="h-[3px] transition-all"
              style={{ width: 16, background: "rgba(184,146,42,0.18)" }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-7"
            >
              <div className="inline-block"><HudHex code={current.code} color={current.color} size={96} /></div>

              <p className="hud-tech" style={{ color: current.color }}>{current.id}</p>

              <div>
                <h2
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontWeight: 700,
                    fontSize: 28,
                    color: "#F5F0E8",
                    letterSpacing: "0.04em",
                  }}
                >
                  {current.title}
                </h2>
                <p
                  className="mt-4 max-w-sm mx-auto"
                  style={{ color: "rgba(170,170,200,0.85)", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.55 }}
                >
                  {current.description}
                </p>
              </div>

              <button
                onClick={handleTourNext}
                className="hud-btn w-full max-w-xs mx-auto flex items-center justify-center gap-2"
                style={{ background: current.color }}
              >
                {step === TOUR_STEPS.length - 1 ? (
                  <>
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    ATIVAR SISTEMA
                  </>
                ) : (
                  <>
                    CONTINUAR <ChevronRight className="w-3.5 h-3.5" strokeWidth={3} />
                  </>
                )}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </HudShell>
  );
};

export default ActivationTourPage;
