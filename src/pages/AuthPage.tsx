import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Mail, Lock, User, ArrowLeft, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  PROFILE_META,
  PROFILE_CHOICES,
  isProfessionalType,
  type ProfileChoice,
} from "@/lib/professionalTypes";

type Mode = "login" | "signup";

const AuthPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // mode
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "login");

  // wizard step (signup only)
  const [step, setStep] = useState<1 | 2>(1);
  const [choice, setChoice] = useState<ProfileChoice | null>(null);

  // form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-select profile if ?profile=athlete|nutritionist|...
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px]"
        style={{ background: `${accent}10` }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <button
          onClick={() => (mode === "signup" && step === 2 && !params.get("profile") ? setStep(1) : navigate("/"))}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Voltar</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.05em" }}>
            <span className="text-foreground">NUTRI</span>
            <span style={{ color: "#B8922A" }}>ON</span>
          </h1>
          {mode === "signup" && step === 1 && (
            <>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#B8922A", letterSpacing: "0.15em" }}>
                QUAL É O SEU PERFIL?
              </p>
              <p className="mt-1" style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#6a6a6a" }}>
                Isso define sua experiência no sistema
              </p>
            </>
          )}
          {mode === "login" && (
            <p className="text-muted-foreground text-sm">Entre na sua conta</p>
          )}
          {mode === "signup" && step === 2 && selectedMeta && (
            <p className="text-muted-foreground text-sm">
              Criando conta como <span style={{ color: accent, fontWeight: 600 }}>{selectedMeta.label}</span>
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {mode === "signup" && step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROFILE_CHOICES.map((c) => {
                  const m = PROFILE_META[c];
                  const Icon = m.icon;
                  const sel = choice === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setChoice(c)}
                      className="relative text-left transition-all"
                      style={{
                        background: sel ? `${m.color}10` : "#020205",
                        border: sel ? `2px solid ${m.color}` : "1px solid #B8922A0A",
                        padding: 18,
                      }}
                    >
                      {sel && (
                        <div
                          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center"
                          style={{ background: m.color }}
                        >
                          <Check className="w-3.5 h-3.5" style={{ color: "#020205" }} strokeWidth={3} />
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <Icon className="w-6 h-6 shrink-0 mt-0.5" style={{ color: sel ? m.color : "#8a8a8a" }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              style={{
                                fontFamily: "Rajdhani, sans-serif",
                                fontWeight: 700,
                                fontSize: 17,
                                color: "#F5F0E8",
                                letterSpacing: "0.02em",
                              }}
                            >
                              {m.label}
                            </span>
                          </div>
                          <p
                            style={{
                              fontFamily: "'Space Mono', monospace",
                              fontSize: 9,
                              lineHeight: 1.4,
                              color: "#9a9a9a",
                            }}
                          >
                            {m.description}
                          </p>
                          <div
                            className="inline-block mt-2 px-1.5 py-0.5"
                            style={{
                              border: `1px solid ${m.badgeColor}33`,
                              color: m.badgeColor,
                              fontFamily: "'Space Mono', monospace",
                              fontSize: 7,
                              letterSpacing: "0.1em",
                              borderRadius: 2,
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
                  className="w-full mt-6 py-3 font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  style={{
                    background: accent,
                    color: "#020205",
                    fontFamily: "Rajdhani, sans-serif",
                    letterSpacing: "0.1em",
                    fontSize: 15,
                  }}
                >
                  CONTINUAR
                  <ArrowRight className="w-4 h-4" strokeWidth={3} />
                </motion.button>
              )}

              <p className="text-center mt-6 text-sm text-muted-foreground">
                Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="text-primary hover:underline font-semibold">
                  Fazer login
                </button>
              </p>
            </motion.div>
          )}

          {(mode === "login" || (mode === "signup" && step === 2)) && (
            <motion.form
              key="formStep"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="space-y-4 max-w-md mx-auto"
            >
              {mode === "signup" && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors"
                    style={{ borderColor: `${accent}33` }}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none"
                  style={{ borderColor: `${accent}33` }}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none"
                  style={{ borderColor: `${accent}33` }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-bold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: accent,
                  color: "#020205",
                  fontFamily: "Rajdhani, sans-serif",
                  letterSpacing: "0.1em",
                  fontSize: 15,
                }}
              >
                <Zap className="w-4 h-4" />
                {loading ? "CARREGANDO..." : mode === "login" ? "ENTRAR" : "CRIAR CONTA"}
              </button>

              {mode === "login" ? (
                <div className="text-center pt-2 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Ainda não tem conta?
                  </p>
                  <div
                    className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: 11 }}
                  >
                    <span className="text-muted-foreground">Cadastrar como</span>
                    <button
                      type="button"
                      onClick={() => { setMode("signup"); setChoice("athlete"); setStep(2); }}
                      className="hover:underline font-semibold"
                      style={{ color: "#00C896" }}
                    >
                      Atleta
                    </button>
                    <span className="text-muted-foreground">·</span>
                    <button
                      type="button"
                      onClick={() => { setMode("signup"); setChoice("nutritionist"); setStep(2); }}
                      className="hover:underline font-semibold"
                      style={{ color: "#B8922A" }}
                    >
                      Profissional
                    </button>
                    <span className="text-muted-foreground">·</span>
                    <button
                      type="button"
                      onClick={() => { setMode("signup"); setChoice("bodybuilding_coach"); setStep(2); }}
                      className="hover:underline font-semibold"
                      style={{ color: "#00D4FF" }}
                    >
                      Coach
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Já tem conta?{" "}
                  <button type="button" onClick={() => setMode("login")} className="text-primary hover:underline font-semibold">
                    Fazer login
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
