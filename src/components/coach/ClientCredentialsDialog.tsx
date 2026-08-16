import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Copy, Eye, EyeOff, KeyRound, Loader2, RefreshCw, Send, AlertTriangle } from "lucide-react";
import { LOGIN_URL } from "@/lib/welcomeMessage";

export type ClientCredentials = {
  email: string;
  temp_password: string | null;
  password_changed: boolean;
  welcome_sent: boolean;
  welcome_sent_at: string | null;
};

export async function fetchClientCredentials(clientId: string): Promise<ClientCredentials> {
  const [{ data: prof }, { data: cred }] = await Promise.all([
    supabase.from("profiles").select("email, phone, full_name").eq("user_id", clientId).maybeSingle(),
    supabase
      .from("client_credentials")
      .select("email, temp_password, password_changed, welcome_sent, welcome_sent_at")
      .eq("client_id", clientId)
      .maybeSingle(),
  ]);
  return {
    email: cred?.email || prof?.email || "",
    temp_password: cred?.temp_password || null,
    password_changed: cred?.password_changed ?? false,
    welcome_sent: cred?.welcome_sent ?? false,
    welcome_sent_at: cred?.welcome_sent_at ?? null,
  };
}

const copy = (value: string, label: string) => {
  navigator.clipboard.writeText(value);
  toast({ title: `${label} copiado` });
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  athleteId: string;
  athleteName: string;
  onSendWelcome?: () => void;
  onChanged?: () => void;
}

const ClientCredentialsDialog = ({ open, onOpenChange, athleteId, athleteName, onSendWelcome, onChanged }: Props) => {
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [show, setShow] = useState(false);
  const [cred, setCred] = useState<ClientCredentials | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setCred(await fetchClientCredentials(athleteId));
    setLoading(false);
  }, [athleteId]);

  useEffect(() => {
    if (open) {
      setShow(false);
      load();
    }
  }, [open, load]);

  const resetPassword = async () => {
    setResetting(true);
    const { data, error } = await supabase.functions.invoke("client-credentials", {
      body: { action: "reset", client_id: athleteId },
    });
    setResetting(false);
    if (error || data?.error) {
      toast({ title: "Erro ao resetar senha", description: data?.error || error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "Nova senha temporária gerada 🔑" });
    setShow(true);
    await load();
    onChanged?.();
  };

  const hasPassword = !!cred?.temp_password && !cred.password_changed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <KeyRound className="w-4 h-4 text-primary" /> Credenciais · {athleteName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">E-mail</p>
              <div className="flex items-center gap-2">
                <span className="font-mono truncate flex-1">{cred?.email || "—"}</span>
                <Button size="sm" variant="outline" onClick={() => copy(cred?.email || "", "E-mail")}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Senha</p>
              {hasPassword ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono truncate flex-1">
                    {show ? cred?.temp_password : "●●●●●●●●"}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => copy(cred?.temp_password || "", "Senha")}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShow((v) => !v)}>
                    {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="font-mono">●●●●●●●●</span>
                  <p className="text-xs flex items-center gap-1" style={{ color: "#FFD700" }}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {cred?.password_changed
                      ? "O cliente já alterou a senha."
                      : "Nenhuma senha temporária registrada."}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Link de acesso</p>
              <div className="flex items-center gap-2">
                <span className="font-mono truncate flex-1">{LOGIN_URL}</span>
                <Button size="sm" variant="outline" onClick={() => copy(`https://${LOGIN_URL}`, "Link")}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={resetPassword} disabled={resetting}>
                {resetting ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
                Resetar senha
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onSendWelcome?.();
                }}
              >
                <Send className="w-3.5 h-3.5 mr-1" /> Enviar boas-vindas
              </Button>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClientCredentialsDialog;
