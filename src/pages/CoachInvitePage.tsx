import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserCheck, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const CoachInvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [coachName, setCoachName] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [inviteKind, setInviteKind] = useState<"professional" | "legacy">("legacy");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  // Registration form (if not logged in)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!token) return;
    validateInvite();
  }, [token]);

  const validateInvite = async () => {
    const { data, error } = await supabase
      .from("coach_convites")
      .select("*, coach_profiles:coach_id(professional_name)")
      .eq("token", token!)
      .eq("usado", false)
      .maybeSingle();

    if (error || !data) {
      setInviteValid(false);
      return;
    }

    if (new Date(data.expires_at) < new Date()) {
      setInviteValid(false);
      return;
    }

    // coach_profiles is joined via coach_id = user_id, but RLS might not allow this
    // We'll get coach name from the accept response instead
    setCoachName("seu Coach");
    setInviteValid(true);
  };

  const acceptInvite = async () => {
    if (!token) return;
    setAccepting(true);

    try {
      const { data, error } = await supabase.functions.invoke("accept-coach-invite", {
        body: { invite_token: token },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAccepted(true);
      setCoachName(data.coach_name || "seu Coach");
      toast({ title: "Convite aceito! 🎉", description: `Você agora é aluno de ${data.coach_name}` });

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
        options: {
          data: { full_name: name.trim() },
        },
      });

      if (error) throw error;

      toast({
        title: "Conta criada! 📧",
        description: "Verifique seu email para confirmar a conta, depois volte aqui para aceitar o convite.",
      });
    } catch (err: any) {
      toast({ title: "Erro ao criar conta", description: err.message, variant: "destructive" });
    } finally {
      setRegistering(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (inviteValid === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Convite Inválido</h2>
            <p className="text-muted-foreground">
              Este convite expirou ou já foi utilizado. Solicite um novo link ao seu coach.
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteValid === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="max-w-md w-full border-primary/50">
            <CardContent className="p-8 text-center space-y-4">
              <UserCheck className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-2xl font-bold text-foreground">Bem-vindo! 🎉</h2>
              <p className="text-muted-foreground">
                Você agora é aluno de <strong>{coachName}</strong>. Seu acesso ON+ está ativo!
              </p>
              <p className="text-xs text-muted-foreground">Redirecionando...</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // User is logged in — show accept button
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle>Convite de Coach</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Você recebeu um convite para se tornar aluno acompanhado. Ao aceitar, você terá acesso
              às funcionalidades do plano <strong>ON+</strong> gratuitamente.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-left space-y-1">
              <p>✅ Plano alimentar personalizado</p>
              <p>✅ Chat com IA nutricionista</p>
              <p>✅ Suplementação e protocolos</p>
              <p>✅ Acompanhamento direto com seu coach</p>
            </div>
            <Button className="w-full" onClick={acceptInvite} disabled={accepting}>
              {accepting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Aceitar Convite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in — show registration form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-2" />
          <CardTitle>Convite de Coach</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Crie sua conta para aceitar o convite e começar o acompanhamento.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome completo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          <div>
            <Label>Senha</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
          <Button className="w-full" onClick={handleRegister} disabled={registering}>
            {registering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Criar Conta
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Já tem conta?{" "}
            <button onClick={() => navigate(`/auth?redirect=/convite/${token}`)} className="text-primary underline">
              Fazer login
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachInvitePage;
