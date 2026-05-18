import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  PROFILE_META,
  PROFILE_CHOICES,
  isProfessionalType,
  type ProfileChoice,
} from "@/lib/professionalTypes";
import { HudShell, HudStatusBar, HudHex, HudPanel } from "@/components/hud/HudShell";

type Mode = "login" | "signup";

const PROFILE_CODE: Record<ProfileChoice, string> = {
  athlete: "AT",
  nutritionist: "NT",
  personal_trainer: "PT",
  nutrition_coach: "NC",
  bodybuilding_coach: "BC",
  medico: "MD",
};

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
  const accent = selectedMeta?.color ?? "#B8922A";

  return (
    <HudShell>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
          {/* Status bar topo */}
          <div className="mb-8">
            <HudStatusBar
              label="SISTEMA ATIVO"
              meta={`AUTH-MODULE · v2.4 · ${mode === "signup" ? (step === 1 ? "PROFILE-SELECT" : "REGISTER") : "LOGIN"}`}
              color="#00D4FF"
            />
          </div>

          <button
            onClick={() => (mode === "signup" && step === 2 && !params.get("profile") ? setStep(1) : navigate("/"))}
            className="flex items-center gap-2 mb-8 hud-tech hover:text-[#B8922A] transition-colors"
            style={{ color: "rgba(80,80,122,1)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            VOLTAR
          </button>

          {/* Logo */}
          <div className="text-center mb-8">
            <h1
              className="text-4xl mb-3"
              style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: "0.08em" }}
            >
              <span style={{ color: "#F5F0E8" }}>NUTRI</span>
              <span style={{ color: "#B8922A", textShadow: "0 0 24px rgba(184,146,42,0.7)" }}>ON</span>
            </h1>
            {mode === "login" && (
              <p className="hud-tech" style={{ color: "rgba(80,80,122,1)" }}>
                DIAGNÓSTICO INICIADO — AGUARDANDO CREDENCIAIS
              </p>
            )}
            {mode === "signup" && step === 1 && (
              <p className="hud-tech" style={{ color: "rgba(80,80,122,1)" }}>
                SELECIONE SEU PERFIL DE OPERAÇÃO
              </p>
            )}
            {mode === "signup" && step === 2 && selectedMeta && (
              <p className="hud-tech">
                <span style={{ color: "rgba(80,80,122,1)" }}>PERFIL · </span>
                <span style={{ color: accent }}>{selectedMeta.label.toUpperCase()}</span>
              </p>
            )}
          </div>

          <AnimatePresence mode="wait">
            {mode === "signup" && step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROFILE_CHOICES.map((c) => {
                    const m = PROFILE_META[c];
                    const sel = choice === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setChoice(c)}
                        className="relative text-left transition-all overflow-hidden"
                        style={{
                          background: sel ? `${m.color}10` : "rgba(10,10,26,0.8)",
                          border: `1px solid ${sel ? m.color : "rgba(184,146,42,0.18)"}`,
                          padding: 18,
                          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                        }}
                      >
                        {sel && (
                          <div
                            className="absolute top-0 left-0 right-0 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, ${m.color}, transparent)` }}
                          />
                        )}
                        <div className="flex items-start gap-3">
                          <HudHex code={PROFILE_CODE[c]} color={m.color} size={44} />
                          <div className="flex-1 min-w-0">
                            <div
                              style={{
                                fontFamily: "'Rajdhani', sans-serif",
                                fontWeight: 700,
                                fontSize: 17,
                                color: "#F5F0E8",
                                letterSpacing: "0.04em",
                              }}
                            >
                              {m.label}
                            </div>
                            <p
                              className="mt-1"
                              style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: 11,
                                lineHeight: 1.45,
                                color: "rgba(80,80,122,1)",
                              }}
                            >
                              {m.description}
                            </p>
                            <div
                              className="inline-block mt-2 px-1.5 py-0.5"
                              style={{
                                border: `1px solid ${m.badgeColor}44`,
                                color: m.badgeColor,
                                fontFamily: "'Space Mono', monospace",
                                fontSize: 8,
                                letterSpacing: "0.18em",
                              }}
                            >
                              {m.badge}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {choice && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="button"
                    onClick={() => setStep(2)}
                    className="hud-btn w-full mt-6 flex items-center justify-center gap-2"
                    style={{ background: accent }}
                  >
                    CONTINUAR <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
                  </motion.button>
                )}

                <p className="text-center mt-6 hud-tech">
                  <span style={{ color: "rgba(80,80,122,1)" }}>JÁ POSSUI CONTA? </span>
                  <button
                    onClick={() => setMode("login")}
                    className="underline"
                    style={{ color: "#B8922A" }}
                  >
                    FAZER LOGIN
                  </button>
                </p>
              </motion.div>
            )}

            {(mode === "login" || (mode === "signup" && step === 2)) && (
              <motion.div key="formStep" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-md mx-auto">
                <HudPanel tag={mode === "login" ? "AUTH-IN" : "AUTH-NEW"} tagColor={accent}>
                  <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-8">
                    {mode === "signup" && (
                      <div className="hud-input-row">
                        <span className="hud-tag">USR</span>
                        <input
                          type="text"
                          placeholder="Seu nome completo"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <div className="hud-input-row">
                      <span className="hud-tag">EML</span>
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="hud-input-row">
                      <span className="hud-tag">PWD</span>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="hud-btn w-full mt-2"
                      style={{ background: accent }}
                    >
                      {loading ? "PROCESSANDO..." : mode === "login" ? "► ACESSAR SISTEMA" : "► ATIVAR CONTA"}
                    </button>
                  </form>
                </HudPanel>

                {mode === "login" ? (
                  <div className="text-center pt-6 space-y-3">
                    <p className="hud-tech" style={{ color: "rgba(80,80,122,1)" }}>
                      AINDA NÃO CADASTRADO?
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 hud-tech">
                      <span style={{ color: "rgba(80,80,122,1)" }}>CADASTRAR ·</span>
                      <button
                        type="button"
                        onClick={() => { setMode("signup"); setChoice("athlete"); setStep(2); }}
                        className="underline"
                        style={{ color: "#00C896" }}
                      >
                        ATLETA
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMode("signup"); setChoice("nutritionist"); setStep(2); }}
                        className="underline"
                        style={{ color: "#B8922A" }}
                      >
                        PROFISSIONAL
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMode("signup"); setChoice("bodybuilding_coach"); setStep(2); }}
                        className="underline"
                        style={{ color: "#00D4FF" }}
                      >
                        COACH
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center pt-6 hud-tech">
                    <span style={{ color: "rgba(80,80,122,1)" }}>JÁ POSSUI CONTA? </span>
                    <button type="button" onClick={() => setMode("login")} className="underline" style={{ color: "#B8922A" }}>
                      FAZER LOGIN
                    </button>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </HudShell>
  );
};

export default AuthPage;
