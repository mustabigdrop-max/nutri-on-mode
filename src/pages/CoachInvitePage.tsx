import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const HudInput = ({
  type, placeholder, value, onChange, icon,
}: {
  type: string; placeholder: string; value: string;
  onChange: (v: string) => void; icon: string;
}) => (
  <div className="relative group">
    <div
      className="absolute left-0 top-0 bottom-0 flex items-center justify-center"
      style={{ width: 44, borderRight: "1px solid rgba(184,146,42,0.2)" }}
    >
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.1em", color: "rgba(184,146,42,0.5)" }}>
        {icon}
      </span>
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        paddingLeft: 52,
        paddingRight: 16,
        paddingTop: 13,
        paddingBottom: 13,
        background: "rgba(10,10,26,0.8)",
        border: "1px solid rgba(184,146,42,0.18)",
        color: "#F5F0E8",
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "0.88rem",
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

const HudShell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
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
      style={{ width: 600, height: 400, background: `radial-gradient(ellipse, rgba(184,146,42,0.07) 0%, transparent 65%)` }}
    />
    <div className="hud-scan-line" />
    <div className="hud-corner-tl" style={{ top: 24, left: 24 }} />
    <div className="hud-corner-tr" style={{ top: 24, right: 24 }} />
    <div className="hud-corner-bl" style={{ bottom: 24, left: 24 }} />
    <div className="hud-corner-br" style={{ bottom: 24, right: 24 }} />
    {children}
  </div>
);

const CoachInvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [coachName, setCoachName] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [inviteKind, setInviteKind] = useState<"professional" | "legacy">("legacy");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!token) return;
    validateInvite();
  }, [token]);

  const validateInvite = async () => {
    const { data: profInvite } = await supabase
      .from("professional_invites")
      .select("*, coach_profiles:coach_profile_id(professional_name, professional_type)")
      .eq("invite_code", token!)
      .eq("status", "pending")
      .maybeSingle();

    if (profInvite) {
      if (new Date(profInvite.expires_at) < new Date()) { setInviteValid(false); return; }
      setInviteKind("professional");
      const cp: any = (profInvite as any).coach_profiles;
      setCoachName(cp?.professional_name || "seu Profissional");
      setInviteValid(true);
      return;
    }

    const { data, error } = await supabase
      .from("coach_convites")
      .select("*, coach_profiles:coach_id(professional_name)")
      .eq("token", token!)
      .eq("usado", false)
      .maybeSingle();

    if (error || !data) { setInviteValid(false); return; }
    if (new Date(data.expires_at) < new Date()) { setInviteValid(false); return; }
    setInviteKind("legacy");
    setCoachName("seu Coach");
    setInviteValid(true);
  };

  const acceptInvite = async () => {
    if (!token) return;
    setAccepting(true);
    try {
      const fnName = inviteKind === "professional" ? "accept-professional-invite" : "accept-coach-invite";
      const body = inviteKind === "professional" ? { invite_code: token } : { invite_token: token };
      const { data, error } = await supabase.functions.invoke(fnName, { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAccepted(true);
      setCoachName(data.coach_name || "seu Profissional");
      toast({ title: "Convite aceito!", description: `Você agora é cliente de ${data.coach_name}` });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err: any) {
      toast({ title: "Erro ao aceitar convite", description: err.message, variant: "destructive" });
    } finally {
      setAccepting(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    setRegistering(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) throw error;
      toast({
        title: "Conta criada!",
        description: "Verifique seu email para confirmar, depois volte para aceitar o convite.",
      });
    } catch (err: any) {
      toast({ title: "Erro ao criar conta", description: err.message, variant: "destructive" });
    } finally {
      setRegistering(false);
    }
  };

  // Loading
  if (authLoading || inviteValid === null) {
    return (
      <HudShell>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className="w-12 h-12 flex items-center justify-center"
            style={{
              border: `1px solid ${GOLD}44`,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              animation: "hud-flicker 2s ease-in-out infinite",
            }}
          >
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", color: GOLD }}>SYS</span>
          </div>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(184,146,42,0.5)", textTransform: "uppercase" }}>
            Validando convite...
          </span>
        </motion.div>
      </HudShell>
    );
  }

  // Invalid invite
  if (inviteValid === false) {
    return (
      <HudShell>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div
            className="inline-flex items-center justify-center mb-6"
            style={{
              width: 56, height: 56,
              border: `1px solid rgba(239,68,68,0.4)`,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          >
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", fontWeight: 700, color: "#ef4444" }}>ERR</span>
          </div>

          <h2
            className="mb-3 leading-tight"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "2rem", color: "#F5F0E8" }}
          >
            CONVITE INVÁLIDO
          </h2>
          <p className="mb-8" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.8)", lineHeight: 1.7 }}>
            Este convite expirou ou já foi utilizado.<br />
            Solicite um novo link ao seu coach.
          </p>

          <button
            onClick={() => navigate("/auth")}
            style={{
              background: GOLD,
              color: "#0a0a1a",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "0.9rem 2rem",
              clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
              border: "none",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Ir para Login
          </button>
        </motion.div>
      </HudShell>
    );
  }

  // Accepted success
  if (accepted) {
    return (
      <HudShell>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm text-center"
        >
          <div
            className="inline-flex items-center justify-center mb-6"
            style={{
              width: 64, height: 64,
              background: "rgba(0,212,255,0.1)",
              border: `1px solid ${CYAN}44`,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          >
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", fontWeight: 700, color: CYAN }}>OK</span>
          </div>

          <h2
            className="mb-2 leading-tight"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "2.5rem", color: "#F5F0E8" }}
          >
            ACESSO ATIVADO
          </h2>
          <p className="mb-2" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", color: "rgba(80,80,122,0.8)" }}>
            Você agora é aluno de{" "}
            <span style={{ color: CYAN }}>{coachName}</span>.
          </p>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.5)" }}>
            Redirecionando...
          </p>
        </motion.div>
      </HudShell>
    );
  }

  // Logged in — accept invite
  if (user) {
    return (
      <HudShell>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center mb-4"
              style={{
                width: 56, height: 56,
                background: "rgba(184,146,42,0.1)",
                border: `1px solid ${GOLD}44`,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            >
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", fontWeight: 700, color: GOLD }}>INV</span>
            </div>
            <h2
              className="leading-tight mb-1"
              style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "2rem", color: "#F5F0E8" }}
            >
              CONVITE DE COACH
            </h2>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.7)" }}>
              PROTOCOLO DE ATIVAÇÃO · ON+
            </p>
          </div>

          {/* Details card */}
          <div
            className="mb-5 p-5"
            style={{
              border: "1px solid rgba(184,146,42,0.12)",
              background: "rgba(10,10,26,0.6)",
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          >
            <p className="mb-4" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.08em", color: "rgba(80,80,122,0.9)", lineHeight: 1.7 }}>
              Ao aceitar, você terá acesso às funcionalidades do plano{" "}
              <span style={{ color: GOLD }}>ON+</span> gratuitamente.
            </p>
            <ul className="space-y-2">
              {[
                "Plano alimentar personalizado",
                "Chat com IA nutricionista",
                "Suplementação e protocolos",
                "Acompanhamento direto com seu coach",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ background: CYAN }} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.06em", color: "rgba(245,240,232,0.6)" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={acceptInvite}
            disabled={accepting}
            style={{
              width: "100%",
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
              cursor: accepting ? "not-allowed" : "pointer",
              opacity: accepting ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {accepting ? "ATIVANDO..." : "ACEITAR CONVITE →"}
          </button>
        </motion.div>
      </HudShell>
    );
  }

  // Not logged in — register
  return (
    <HudShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center mb-4"
            style={{
              width: 56, height: 56,
              background: "rgba(0,212,255,0.1)",
              border: `1px solid ${CYAN}44`,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          >
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", fontWeight: 700, color: CYAN }}>NEW</span>
          </div>
          <h2
            className="leading-tight mb-1"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "2rem", color: "#F5F0E8" }}
          >
            CRIAR ACESSO
          </h2>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.7)" }}>
            ATIVE SUA CONTA PARA ACEITAR O CONVITE
          </p>
        </div>

        <div
          className="p-5 space-y-3 mb-4"
          style={{
            border: "1px solid rgba(184,146,42,0.12)",
            background: "rgba(10,10,26,0.6)",
            clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          }}
        >
          <HudInput type="text" placeholder="Nome completo" value={name} onChange={setName} icon="USR" />
          <HudInput type="email" placeholder="Email" value={email} onChange={setEmail} icon="EML" />
          <HudInput type="password" placeholder="Senha (mínimo 6 caracteres)" value={password} onChange={setPassword} icon="PWD" />
        </div>

        <button
          onClick={handleRegister}
          disabled={registering}
          style={{
            width: "100%",
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
            cursor: registering ? "not-allowed" : "pointer",
            opacity: registering ? 0.6 : 1,
            marginBottom: 12,
          }}
        >
          {registering ? "CRIANDO CONTA..." : "CRIAR CONTA →"}
        </button>

        <p className="text-center" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.08em", color: "rgba(80,80,122,0.6)" }}>
          JÁ TEM CONTA?{" "}
          <button
            onClick={() => navigate(`/auth?redirect=/convite/${token}`)}
            style={{ color: GOLD, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}
          >
            FAZER LOGIN
          </button>
        </p>
      </motion.div>
    </HudShell>
  );
};

export default CoachInvitePage;
