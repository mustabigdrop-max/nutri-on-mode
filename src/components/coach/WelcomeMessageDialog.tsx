import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Pencil, Send, Smartphone } from "lucide-react";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { openWhatsAppWith, renderWelcomeMessage } from "@/lib/welcomeMessage";
import { fetchClientCredentials } from "@/components/coach/ClientCredentialsDialog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  athleteId: string;
  athleteName: string;
  onSent?: () => void;
}

const WelcomeMessageDialog = ({ open, onOpenChange, athleteId, athleteName, onSent }: Props) => {
  const { profile } = useCoachProfile();
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [editPhone, setEditPhone] = useState(false);
  const [message, setMessage] = useState("");
  const [editMsg, setEditMsg] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: prof }, cred] = await Promise.all([
      supabase.from("profiles").select("phone, full_name, email").eq("user_id", athleteId).maybeSingle(),
      fetchClientCredentials(athleteId),
    ]);
    setPhone(prof?.phone || "");
    setMessage(
      renderWelcomeMessage((profile as { welcome_template?: string | null } | null)?.welcome_template, {
        nome: (prof?.full_name || athleteName).split(" ")[0],
        email: cred.email || prof?.email || "",
        senha: cred.password_changed || !cred.temp_password ? "(senha definida pelo cliente)" : cred.temp_password,
        coach: profile?.professional_name || "Seu Coach",
      }),
    );
    setLoading(false);
  }, [athleteId, athleteName, profile]);

  useEffect(() => {
    if (open) {
      setEditPhone(false);
      setEditMsg(false);
      load();
    }
  }, [open, load]);

  const send = async () => {
    if (!phone.replace(/\D/g, "")) {
      toast({ title: "Informe o número de WhatsApp", variant: "destructive" });
      setEditPhone(true);
      return;
    }
    openWhatsAppWith(phone, message);
    await supabase.functions.invoke("client-credentials", {
      body: { action: "mark_welcome", client_id: athleteId },
    });
    onSent?.();
    onOpenChange(false);
  };

  const savePhone = async () => {
    await supabase.from("profiles").update({ phone: phone.trim() || null }).eq("user_id", athleteId);
    setEditPhone(false);
    toast({ title: "Número atualizado" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Smartphone className="w-4 h-4 text-primary" /> Boas-vindas · {athleteName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Número WhatsApp</p>
              {editPhone ? (
                <div className="flex gap-2">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(21) 99999-8888" />
                  <Button size="sm" onClick={savePhone}>Salvar</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-mono flex-1">{phone || "— não informado"}</span>
                  <Button size="sm" variant="outline" onClick={() => setEditPhone(true)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">Preview da mensagem</p>
                <Button size="sm" variant="ghost" onClick={() => setEditMsg((v) => !v)}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> {editMsg ? "Ver preview" : "Editar mensagem"}
                </Button>
              </div>
              {editMsg ? (
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={14} className="font-mono text-xs" />
              ) : (
                <pre className="whitespace-pre-wrap text-xs rounded-lg p-3 max-h-72 overflow-y-auto bg-muted/40 border border-border">
                  {message}
                </pre>
              )}
            </div>

            <Button className="w-full" onClick={send}>
              <Send className="w-4 h-4 mr-2" /> Enviar via WhatsApp
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeMessageDialog;
