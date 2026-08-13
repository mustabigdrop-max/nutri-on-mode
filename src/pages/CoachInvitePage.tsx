import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { HudShell, HudStatusBar, HudHex, HudPanel } from "@/components/hud/HudShell";

const CoachInvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [coachName, setCoachName] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [inviteKind, setInviteKind] = useState<"professional" | "legacy">("legacy");
  const [, setInviteMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!token) return;
    validateInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setInviteMessage(profInvite.message ?? null);
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
        email: email.trim(), password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) throw error;
      toast({
        title: "Conta criada!",
        description: "Verifique seu email para confirmar a conta, depois volte aqui para aceitar o convite.",
      });
    } catch (err: any) {
      toast({ title: "Erro ao criar conta", description: err.message, variant: "destructive" });
    } finally {
      setRegistering(false);
    }
  };

  const Center = ({ children }: { children: React.ReactNode }) => (
    <HudShell>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </HudShell>
  );

  if (authLoading || inviteValid === null) {
    return (
      <Center>
        <div className="text-center space-y-5">
          <div className="inline-block">
            <HudHex code="SYS" color="#00D4FF" size={72} />
          </div>
          <p className="hud-tech" style={{ color: "#00D4FF" }}>
            <Loader2 className="w-3 h-3 inline animate-spin mr-2" />
            VALIDANDO CONVITE...
          </p>
        </div>
      </Center>
    );
  }

  if (inviteValid === false) {
    return (
      <Center>
        <div className="text-center space-y-5">
          <div className="inline-block"><HudHex code="ERR" color="#ff4444" size={72} /></div>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28, color: "#F5F0E8", letterSpacing: "0.05em" }}>
            CONVITE INVÁLIDO
          </h2>
          <p style={{ color: "rgba(170,170,200,0.85)", fontFamily: "'Space Grotesk', sans-serif" }}>
            Este convite expirou ou já foi utilizado. Solicite um novo link ao seu coach.
          </p>
          <button onClick={() => navigate("/auth")} className="hud-btn">
            ► IR PARA LOGIN
          </button>
        </div>
      </Center>
    );
  }

  if (accepted) {
    return (
      <Center>
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-5">
          <div className="inline-block"><HudHex code="OK" color="#00D4FF" size={80} /></div>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 30, color: "#F5F0E8", letterSpacing: "0.05em" }}>
            ACESSO ATIVADO
          </h2>
          <p style={{ color: "rgba(170,170,200,0.85)", fontFamily: "'Space Grotesk', sans-serif" }}>
            Você agora é aluno de <strong style={{ color: "#B8922A" }}>{coachName}</strong>. Seu acesso ON+ está ativo.
          </p>
          <p className="hud-tech" style={{ color: "#00D4FF" }}>REDIRECIONANDO...</p>
        </motion.div>
      </Center>
    );
  }

  if (user) {
    return (
      <Center>
        <div className="mb-6"><HudStatusBar label="CONVITE RECEBIDO" meta="INV-MODULE" color="#B8922A" /></div>
        <HudPanel tag="INVITE">
          <div className="p-8 text-center space-y-5">
            <div className="inline-block"><HudHex code="INV" color="#B8922A" size={64} /></div>
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: "#F5F0E8", letterSpacing: "0.05em" }}>
              CONVITE DE COACH
            </h2>
            <p style={{ color: "rgba(170,170,200,0.85)", fontFamily: "'Space Grotesk', sans-serif" }}>
              Você recebeu um convite para se tornar aluno acompanhado. Ao aceitar, você terá acesso
              às funcionalidades do plano <strong style={{ color: "#B8922A" }}>ON+</strong> gratuitamente.
            </p>
            <div className="text-left space-y-2 pt-2">
              {[
                "Plano alimentar personalizado",
                "Chat nutricionista",
                "Suplementação e protocolos",
                "Acompanhamento direto com seu coach",
              ].map((s) => (
                <div key={s} className="flex items-center gap-2 hud-tech" style={{ color: "#F5F0E8" }}>
                  <span className="hud-status-dot" style={{ color: "#00D4FF" }} />
                  <span className="uppercase">{s}</span>
                </div>
              ))}
            </div>
            <button onClick={acceptInvite} disabled={accepting} className="hud-btn w-full">
              {accepting ? "PROCESSANDO..." : "► ACEITAR CONVITE"}
            </button>
          </div>
        </HudPanel>
      </Center>
    );
  }

  return (
    <Center>
      <div className="mb-6"><HudStatusBar label="NOVO USUÁRIO" meta="REG-MODULE" color="#00D4FF" /></div>
      <div className="text-center mb-6 space-y-3">
        <div className="inline-block"><HudHex code="NEW" color="#00D4FF" size={64} /></div>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: "#F5F0E8", letterSpacing: "0.05em" }}>
          CONVITE DE COACH
        </h2>
        <p className="hud-tech" style={{ color: "rgba(80,80,122,1)" }}>
          CRIE SUA CONTA PARA ACEITAR O CONVITE
        </p>
      </div>
      <HudPanel tag="AUTH-NEW">
        <div className="p-6 space-y-4">
          <div className="hud-input-row">
            <span className="hud-tag">USR</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div className="hud-input-row">
            <span className="hud-tag">EML</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          <div className="hud-input-row">
            <span className="hud-tag">PWD</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
          <button onClick={handleRegister} disabled={registering} className="hud-btn w-full">
            {registering ? "PROCESSANDO..." : "► CRIAR CONTA"}
          </button>
          <p className="text-center hud-tech pt-2">
            <span style={{ color: "rgba(80,80,122,1)" }}>JÁ POSSUI CONTA? </span>
            <button onClick={() => navigate(`/auth?redirect=/convite/${token}`)} className="underline" style={{ color: "#B8922A" }}>
              FAZER LOGIN
            </button>
          </p>
        </div>
      </HudPanel>
    </Center>
  );
};

export default CoachInvitePage;
