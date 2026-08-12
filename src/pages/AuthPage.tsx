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

type Mode = "login" | "signup" | "forgot" | "recovery";

const PROFILE_CODE: Record<ProfileChoice, string> = {
  athlete: "AT",
  nutritionist: "NT",
  personal_trainer: "PT",
  nutrition_coach: "NC",
  bodybuilding_coach: "BC",
  medico: "MD",
};

const safeNext = (value: string | null) =>
  value && /^\/(?!\/)/.test(value) ? value : null;

// Supabase devolve mensagens de erro em inglês — traduzimos as mais comuns
// para não quebrar a experiência em português no momento mais sensível do fluxo.
const AUTH_ERROR_MAP: Record<string, string> = {
  "invalid login credentials": "Email ou senha incorretos.",
  "email not confirmed": "Confirme seu email antes de entrar — verifique sua caixa de entrada (e o spam).",
  "user already registered": "Este email já tem uma conta. Faça login em vez de cadastrar.",
  "already been registered": "Este email já tem uma conta. Faça login em vez de cadastrar.",
  "password is known to be weak": "Essa senha aparece em vazamentos públicos. Escolha uma senha mais forte e única (letras, números e símbolos).",
  "pwned": "Essa senha aparece em vazamentos públicos. Escolha uma senha mais forte e única (letras, números e símbolos).",
  "password should be at least": "A senha é curta demais. Use pelo menos 6 caracteres.",
  "unable to validate email address: invalid format": "Email inválido. Verifique e tente novamente.",
  "invalid email": "Email inválido. Verifique e tente novamente.",
  "email address": "Email inválido ou não permitido. Tente outro endereço.",
  "signups not allowed": "Cadastros estão temporariamente desabilitados. Fale com o suporte.",
  "not authorized": "Cadastros estão temporariamente desabilitados. Fale com o suporte.",
  "new password should be different from the old password": "A nova senha precisa ser diferente da senha atual.",
};

const translateAuthError = (message: string | undefined | null): string => {
  if (!message) return "Não foi possível concluir. Tente novamente em instantes.";
  const key = message.trim().toLowerCase();
  const mapped = Object.entries(AUTH_ERROR_MAP).find(([en]) => key.includes(en));
  if (mapped) return mapped[1];
  if (key.includes("rate limit") || key.includes("security purposes") || key.includes("too many")) {
    return "Muitas tentativas seguidas. Aguarde um minuto e tente de novo.";
  }
  if (key.includes("failed to fetch") || key.includes("networkerror")) {
    return "Sem conexão com o servidor. Verifique sua internet e tente novamente.";
  }
  return `Erro no cadastro: ${message}`;
};

const AuthPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const nextPath = safeNext(params.get("next"));


  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "login");
  const [step, setStep] = useState<1 | 2>(1);
  const [choice, setChoice] = useState<ProfileChoice | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  // Link de "esqueci minha senha" no email traz o usuário de volta aqui com uma
  // sessão de recuperação — o Supabase dispara PASSWORD_RECOVERY quando isso acontece.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("recovery");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) toast.error(translateAuthError(error.message));
      else toast.success("Link de recuperação enviado! Confira seu email.");
    } catch {
      toast.error("Não foi possível enviar o link. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) toast.error(translateAuthError(error.message));
      else {
        toast.success("Senha atualizada! Redirecionando…");
        navigate(nextPath || "/dashboard");
      }
    } catch {
      toast.error("Não foi possível atualizar a senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail.includes("@")) {
      toast.error("Email inválido. Verifique e tente novamente.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (mode === "signup" && !cleanName) {
      toast.error("Informe seu nome completo.");
      return;
    }

    setLoading(true);
    const t = window.setTimeout(() => {
      setLoading(false);
      toast.error("Conexão demorou demais. Tente novamente.");
    }, 15000);

    console.log("[AUTH DEBUG] modo:", mode);
    console.log("[AUTH DEBUG] email:", cleanEmail);
    console.log("[AUTH DEBUG] nome:", cleanName);
    console.log("[AUTH DEBUG] password length:", password?.length);
    console.log("[AUTH DEBUG] perfil:", choice);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) {
          console.error("[AUTH] login error:", error.status, error.message);
          toast.error(translateAuthError(error.message));
        } else if (nextPath) window.location.href = nextPath;
        else navigate("/dashboard");
      } else {
        if (!choice) { toast.error("Selecione um perfil."); return; }
        const professional_type = isProfessionalType(choice) ? choice : null;
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: cleanName, professional_type },
            emailRedirectTo: nextPath
              ? `${window.location.origin}${nextPath}`
              : window.location.origin,
          },
        });

        if (error) {
          console.error("[AUTH] signup error:", error.status, error.message);
          toast.error(translateAuthError(error.message));
          return;
        }

        if (data.user && data.user.identities && data.user.identities.length === 0) {
          toast.error('Este email já tem uma conta. Use "FAZER LOGIN".');
          return;
        }

        if (data.session) {
          toast.success("Conta ativada! Redirecionando…");
          navigate(nextPath || "/dashboard");
        } else {
          toast.success("Conta criada! Verifique seu email para confirmar.", { duration: 6000 });
        }
      }
    } catch (err: any) {
      console.error("[AUTH] unexpected error:", err);
      toast.error(translateAuthError(err?.message));
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
              meta={`AUTH-MODULE · v2.4 · ${
                mode === "signup" ? (step === 1 ? "PROFILE-SELECT" : "REGISTER")
                : mode === "forgot" ? "RECUPERAR SENHA"
                : mode === "recovery" ? "NOVA SENHA"
                : "LOGIN"
              }`}
              color="#00D4FF"
            />
          </div>

          <button
            onClick={() => {
              if (mode === "signup" && step === 2 && !params.get("profile")) setStep(1);
              else if (mode === "forgot") setMode("login");
              else navigate("/");
            }}
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
            {mode === "forgot" && (
              <p className="hud-tech" style={{ color: "rgba(80,80,122,1)" }}>
                DIGITE SEU EMAIL — ENVIAMOS UM LINK DE RECUPERAÇÃO
              </p>
            )}
            {mode === "recovery" && (
              <p className="hud-tech" style={{ color: "rgba(80,80,122,1)" }}>
                ESCOLHA SUA NOVA SENHA
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

                    {mode === "login" && (
                      <div className="text-right -mt-1">
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="hud-tech underline"
                          style={{ color: "rgba(80,80,122,1)", fontSize: 11 }}
                        >
                          ESQUECI MINHA SENHA
                        </button>
                      </div>
                    )}

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
                      <button
                        type="button"
                        onClick={() => { setMode("signup"); setChoice(null); setStep(1); }}
                        className="underline"
                        style={{ color: "#B8922A" }}
                      >
                        ESCOLHER MEU PERFIL E CADASTRAR
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

            {mode === "forgot" && (
              <motion.div key="forgotStep" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-md mx-auto">
                <HudPanel tag="AUTH-RECOVER" tagColor="#B8922A">
                  <form onSubmit={handleForgotSubmit} className="space-y-4 p-6 pt-8">
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

                    <button type="submit" disabled={loading} className="hud-btn w-full mt-2" style={{ background: "#B8922A" }}>
                      {loading ? "ENVIANDO..." : "► ENVIAR LINK DE RECUPERAÇÃO"}
                    </button>
                  </form>
                </HudPanel>

                <p className="text-center pt-6 hud-tech">
                  <span style={{ color: "rgba(80,80,122,1)" }}>LEMBROU A SENHA? </span>
                  <button type="button" onClick={() => setMode("login")} className="underline" style={{ color: "#B8922A" }}>
                    FAZER LOGIN
                  </button>
                </p>
              </motion.div>
            )}

            {mode === "recovery" && (
              <motion.div key="recoveryStep" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-md mx-auto">
                <HudPanel tag="AUTH-NEW-PWD" tagColor="#00D4FF">
                  <form onSubmit={handleRecoverySubmit} className="space-y-4 p-6 pt-8">
                    <div className="hud-input-row">
                      <span className="hud-tag">PWD</span>
                      <input
                        type="password"
                        placeholder="Nova senha (mín. 6 caracteres)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="hud-input-row">
                      <span className="hud-tag">PWD</span>
                      <input
                        type="password"
                        placeholder="Confirme a nova senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    <button type="submit" disabled={loading} className="hud-btn w-full mt-2" style={{ background: "#00D4FF" }}>
                      {loading ? "SALVANDO..." : "► SALVAR NOVA SENHA"}
                    </button>
                  </form>
                </HudPanel>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </HudShell>
  );
};

export default AuthPage;
