import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Copy, Check, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint32Array(10);
  crypto.getRandomValues(bytes);
  return "GYM" + Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

export default function DesafioSignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [created, setCreated] = useState<{ password: string; needsConfirm: boolean } | null>(null);

  const password = useMemo(generatePassword, []);
  const gymSlug = useMemo(
    () => new URLSearchParams(window.location.search).get("gym"),
    [],
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/runon/desafio-21", { replace: true });
    });
  }, [navigate]);

  const handleSignup = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) return toast.error("Informe seu nome.");
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return toast.error("Informe um email válido.");

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: cleanName },
          emailRedirectTo: `${window.location.origin}/runon/desafio-21`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast.error("Este email já tem uma conta. Faça login para entrar no desafio.");
        navigate("/auth?next=/runon/desafio-21");
        return;
      }

      if (data.user) {
        await supabase
          .from("profiles")
          .update({ plano_atual: "free" })
          .eq("user_id", data.user.id);
      }

      await supabase.from("challenge_signups").insert({
        user_id: data.user?.id ?? null,
        email: cleanEmail,
        full_name: cleanName,
        source: "qr",
        gym_slug: gymSlug,
      });

      setCreated({ password, needsConfirm: !data.session });
      if (data.session) {
        toast.success("Conta criada! Bem-vindo ao desafio.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(created?.password || password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-500 shrink-0" />
            <div>
              <h1 className="text-lg font-bold">Desafio 30 Dias · Academia</h1>
              <p className="text-xs text-muted-foreground">
                Cadastro rápido com plano gratuito e senha gerada automaticamente
              </p>
            </div>
          </div>

          {!created ? (
            <>
              <div className="space-y-3">
                <Input
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
                <Input
                  type="email"
                  placeholder="Seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="rounded-xl border border-border bg-card/50 p-3 space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5" /> Senha gerada
                </p>
                <p className="font-mono text-sm">{password}</p>
                <p className="text-[11px] text-muted-foreground">
                  Guarde esta senha — você poderá alterá-la depois no perfil.
                </p>
              </div>

              <Button className="w-full" onClick={handleSignup} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Entrar no desafio (grátis)
              </Button>

              <button
                className="w-full text-xs text-muted-foreground underline"
                onClick={() => navigate("/auth?next=/runon/desafio-21")}
              >
                Já tenho conta
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                <p className="text-sm font-semibold text-emerald-400">Conta criada com plano gratuito</p>
                <p className="text-xs text-muted-foreground">Email: {email.trim().toLowerCase()}</p>
                <p className="text-xs text-muted-foreground">
                  Senha: <span className="font-mono text-foreground">{created.password}</span>
                </p>
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={copyPassword}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Senha copiada" : "Copiar senha"}
                </Button>
              </div>

              {created.needsConfirm ? (
                <p className="text-xs text-muted-foreground text-center">
                  Confirme seu email para liberar o acesso e voltar direto ao desafio.
                </p>
              ) : (
                <Button className="w-full" onClick={() => navigate("/runon/desafio-21")}>
                  Começar o desafio
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
