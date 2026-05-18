import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import {
  PROFILE_META,
  PROFILE_CHOICES,
  isProfessionalType,
  type ProfileChoice,
} from "@/lib/professionalTypes";

type Mode = "login" | "signup";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

// 2-letter hex codes for each profile
const PROFILE_CODES: Record<string, string> = {
  athlete:           "AT",
  nutritionist:      "NT",
  personal_trainer:  "PT",
  nutrition_coach:   "NC",
  bodybuilding_coach:"BC",
  medico:            "MD",
};

const HudInput = ({
  type, placeholder, value, onChange, required, minLength, icon,
}: {
  type: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean; minLength?: number; icon: string;
}) => (
  <div className="relative group">
    <div
      className="absolute left-0 top-0 bottom-0 flex items-center justify-center"
      style={{ width: 44, borderRight: "1px solid rgba(184,146,42,0.2)" }}
    >
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(184,146,42,0.5)" }}>
        {icon}
      </span>
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      minLength={minLength}
      style={{
        width: "100%",
        paddingLeft: 52,
        paddingRight: 16,
        paddingTop: 14,
        paddingBottom: 14,
        background: "rgba(10,10,26,0.8)",
        border: "1px solid rgba(184,146,42,0.18)",
        borderTop: "1px solid rgba(184,146,42,0.08)",
        color: "#F5F0E8",
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "0.9rem",
        outline: "none",
        transition: "border-color 0.2s",
        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
      }}
      onFocus={(e) => { e.target.style.borderColor = `rgba(184,146,42,0.5)`; }}
      onBlur={(e) => { e.target.style.borderColor = "rgba(184,146,42,0.18)"; }}
    />
    <span
      className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
      style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
    />
  </div>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "login");
  const [step, setStep] = useState<1 | 2>(1);
  const [choice, setChoice] = useState<ProfileChoice | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = params.get("profile");
    if (p && PROFILE_CHOICES.includes(p as ProfileChoice)) {
      setMode("signup");
      setChoice(p as ProfileChoice);
      setStep(2);
    }
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const t = window.setTimeout(() => {
      setLoading(false);
      toast.error("Conexão demorou demais. Tente novamente.");
    }, 15000);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) toast.error(error.message);
        else navigate("/dashboard");
      } else {
        if (!choice) { toast.error("Selecione um perfil."); return; }
        const professional_type = isProfessionalType(choice) ? choice : null;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, professional_type },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) toast.error(error.message);
        else toast.success("Conta criada! Verifique seu email para confirmar.");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Erro inesperado.");
    } finally {
      window.clearTimeout(t);
      setLoading(false);
    }
  };

  const selectedMeta = choice ? PROFILE_META[choice] : null;
  const accent = selectedMeta?.color ?? GOLD;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "#0a0a1a", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Hex grid background */}
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

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: 700, height: 500, background: `radial-gradient(ellipse, ${accent}0d 0%, transparent 65%)`, transition: "background 0.5s" }}
      />

      {/* Scan line */}
      <div className="hud-scan-line" />

      {/* Corner brackets */}
      <div className="hud-corner-tl" style={{ top: 24, left: 24 }} />
      <div className="hud-corner-tr" style={{ top: 24, right: 24 }} />
      <div className="hud-corner-bl" style={{ bottom: 24, left: 24 }} />
      <div className="hud-corner-br" style={{ bottom: 24, right: 24 }} />

      {/* Top status bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-3"
        style={{ borderBottom: "1px solid rgba(184,146,42,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: CYAN, boxShadow: `0 0 6px ${CYAN}`, animation: "dotPulse 1.6s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.2em", color: "rgba(0,212,255,0.45)", textTransform: "uppercase" }}>
            Sistema Ativo
          </span>
        </div>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(184,146,42,0.3)" }}>
          AUTH-MODULE · v2.4
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Back button */}
        <button
          onClick={() => (mode === "signup" && step === 2 && !params.get("profile") ? setStep(1) : navigate("/"))}
          className="flex items-center gap-2 mb-8 transition-colors group"
          style={{ color: "rgba(80,80,122,0.7)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(80,80,122,0.7)")}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Voltar
          </span>
        </button>

        {/* Logo */}
        <div className="text-center mb-10">
          <h1
            className="leading-none mb-3"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "3rem", letterSpacing: "0.06em" }}
          >
            <span style={{ color: "#F5F0E8" }}>NUTRI</span>
            <span style={{ color: GOLD, textShadow: `0 0 30px rgba(184,146,42,0.4)` }}>ON</span>
          </h1>

          <AnimatePresence mode="wait">
            {mode === "signup" && step === 1 && (
              <motion.div key="s1-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase" }}>
                  SELECIONE SEU PERFIL DE ACESSO
                </p>
                <p className="mt-1" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.12em", color: "rgba(80,80,122,0.7)" }}>
                  Define os módulos e permissões do sistema
                </p>
              </motion.div>
            )}
            {mode === "login" && (
              <motion.div key="login-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.18em", color: "rgba(80,80,122,0.7)", textTransform: "uppercase" }}>
                  DIAGNÓSTICO INICIADO — AGUARDANDO CREDENCIAIS
                </p>
              </motion.div>
            )}
            {mode === "signup" && step === 2 && selectedMeta && (
              <motion.div key="s2-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.18em", color: "rgba(80,80,122,0.7)", textTransform: "uppercase" }}>
                  PERFIL:{" "}
                  <span style={{ color: accent }}>{selectedMeta.label.toUpperCase()}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">

          {/* Step 1 — Profile selection */}
          {mode === "signup" && step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "rgba(184,146,42,0.08)" }}>
                {PROFILE_CHOICES.map((c) => {
                  const m = PROFILE_META[c];
                  const code = PROFILE_CODES[c];
                  const sel = choice === c;
                  return (
                    <motion.button
                      key={c}
                      type="button"
                      onClick={() => setChoice(c)}
                      whileHover={{ scale: 1.01 }}
                      className="relative text-left group overflow-hidden"
                      style={{
                        background: sel ? `rgba(${m.color === GOLD ? "184,146,42" : m.color === CYAN ? "0,212,255" : "0,200,150"},0.06)` : "#0a0a1a",
                        padding: "20px 18px",
                        transition: "background 0.2s",
                        border: sel ? `1px solid ${m.color}44` : "1px solid transparent",
                      }}
                    >
                      {/* Top glow line */}
                      <span
                        className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
                        style={{ background: `linear-gradient(90deg, transparent, ${m.color}, transparent)`, opacity: sel ? 0.8 : 0 }}
                      />

                      {sel && (
                        <div
                          className="absolute top-2.5 right-2.5 w-4 h-4 flex items-center justify-center"
                          style={{ background: m.color }}
                        >
                          <Check className="w-2.5 h-2.5" style={{ color: "#0a0a1a" }} strokeWidth={3} />
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        {/* Hex icon */}
                        <div
                          className="flex items-center justify-center shrink-0"
                          style={{
                            width: 36, height: 36,
                            background: sel ? `${m.color}18` : "rgba(184,146,42,0.06)",
                            border: `1px solid ${sel ? m.color + "44" : "rgba(184,146,42,0.15)"}`,
                            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                          }}
                        >
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", fontWeight: 700, color: sel ? m.color : "rgba(184,146,42,0.5)", letterSpacing: "0.04em" }}>
                            {code}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#F5F0E8", letterSpacing: "0.03em" }}>
                              {m.label}
                            </span>
                          </div>
                          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", lineHeight: 1.5, color: "rgba(80,80,122,0.8)" }}>
                            {m.description}
                          </p>
                          <div
                            className="inline-block mt-2 px-1.5 py-0.5"
                            style={{
                              border: `1px solid ${m.badgeColor}33`,
                              color: m.badgeColor,
                              fontFamily: "'Space Mono', monospace",
                              fontSize: "0.42rem",
                              letterSpacing: "0.12em",
                            }}
                          >
                            {m.badge}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {choice && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full mt-6 py-3.5 font-bold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: accent,
                    color: "#0a0a1a",
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: "0.15em",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                >
                  CONTINUAR
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
                </motion.button>
              )}

              <p className="text-center mt-6" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.6)" }}>
                JÁ TEM ACESSO?{" "}
                <button onClick={() => setMode("login")} style={{ color: GOLD, textDecoration: "underline" }}>
                  FAZER LOGIN
                </button>
              </p>
            </motion.div>
          )}

          {/* Step 2 / Login — credentials form */}
          {(mode === "login" || (mode === "signup" && step === 2)) && (
            <motion.form
              key="formStep"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="max-w-md mx-auto space-y-3"
            >
              {/* Form border frame */}
              <div
                className="relative p-6 space-y-3"
                style={{
                  border: "1px solid rgba(184,146,42,0.12)",
                  background: "rgba(10,10,26,0.6)",
                  clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                }}
              >
                {/* Corner brackets inside form */}
                <span className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: `1px solid ${GOLD}`, borderLeft: `1px solid ${GOLD}` }} />
                <span className="absolute top-0 right-4 w-4 h-4" style={{ borderTop: `1px solid ${GOLD}44` }} />
                <span className="absolute bottom-4 left-0 w-4 h-4" style={{ borderLeft: `1px solid ${GOLD}44` }} />
                <span className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: `1px solid ${GOLD}`, borderRight: `1px solid ${GOLD}` }} />

                {/* Field ID tag */}
                <div
                  className="absolute top-2.5 right-10 opacity-40"
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.1em", color: GOLD }}
                >
                  {mode === "login" ? "AUTH-IN" : "AUTH-NEW"}
                </div>

                {mode === "signup" && (
                  <HudInput
                    type="text"
                    placeholder="Nome completo"
                    value={fullName}
                    onChange={setFullName}
                    required
                    icon="USR"
                  />
                )}

                <HudInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={setEmail}
                  required
                  icon="EML"
                />

                <HudInput
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={setPassword}
                  required
                  minLength={6}
                  icon="PWD"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{
                  background: accent,
                  color: "#0a0a1a",
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "0.15em",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#0a0a1a", boxShadow: loading ? "0 0 6px #0a0a1a" : "none", animation: loading ? "dotPulse 0.8s ease-in-out infinite" : "none" }}
                />
                {loading ? "AUTENTICANDO..." : mode === "login" ? "ACESSAR SISTEMA" : "ATIVAR CONTA"}
              </button>

              {/* Mode switcher */}
              {mode === "login" ? (
                <div className="text-center pt-2 space-y-2">
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.6)" }}>
                    SEM ACESSO? CRIAR COMO:
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                    {[
                      { key: "athlete" as ProfileChoice, label: "ATLETA", color: "#00C896" },
                      { key: "nutritionist" as ProfileChoice, label: "NUTRICIONISTA", color: GOLD },
                      { key: "bodybuilding_coach" as ProfileChoice, label: "COACH", color: CYAN },
                    ].map(({ key, label, color }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setMode("signup"); setChoice(key); setStep(2); }}
                        style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.1em", color, textDecoration: "underline" }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.6)" }}>
                  JÁ TEM CONTA?{" "}
                  <button type="button" onClick={() => setMode("login")} style={{ color: GOLD, textDecoration: "underline" }}>
                    FAZER LOGIN
                  </button>
                </p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthPage;
