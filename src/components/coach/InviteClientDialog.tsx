import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Copy, Loader2, Mail, Link2, UserPlus, Crown } from "lucide-react";
import { useCoachTier } from "@/hooks/useCoachTier";
import { useNavigate } from "react-router-dom";

type Props = {
  trigger?: React.ReactNode;
};

const InviteClientDialog = ({ trigger }: Props) => {
  const { profile } = useCoachProfile();
  const { canAddMore, currentClients, maxClients, isCoachPro, isAdmin } = useCoachTier();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const inviteUrl = generatedCode
    ? `${window.location.origin}/convite/${generatedCode}`
    : "";

  const handleGenerate = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("professional_invites")
        .insert({
          coach_profile_id: profile.id,
          email: email.trim() || null,
          message: message.trim() || null,
        })
        .select("invite_code")
        .single();

      if (error) throw error;
      setGeneratedCode(data.invite_code);
      toast({ title: "Convite gerado!", description: "Compartilhe o link com seu cliente." });
    } catch (err: any) {
      toast({ title: "Erro ao gerar convite", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast({ title: "Link copiado!" });
  };

  const handleReset = () => {
    setGeneratedCode(null);
    setEmail("");
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) handleReset(); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2">
            <UserPlus className="w-4 h-4" /> Convidar Cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Convidar Cliente
          </DialogTitle>
        </DialogHeader>

        {!generatedCode ? (
          <div className="space-y-4">
            <div>
              <Label>Email do cliente (opcional)</Label>
              <Input
                type="email"
                placeholder="cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Você compartilhará o link manualmente.
              </p>
            </div>
            <div>
              <Label>Mensagem personalizada (opcional)</Label>
              <Textarea
                placeholder="Olá! Estou te convidando para acompanhamento via nutriON..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <Button className="w-full gap-2" onClick={handleGenerate} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              Gerar Link de Convite
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg break-all text-xs font-mono">
              {inviteUrl}
            </div>
            <Button className="w-full gap-2" onClick={handleCopy}>
              <Copy className="w-4 h-4" /> Copiar Link
            </Button>
            <Button variant="ghost" className="w-full" onClick={handleReset}>
              Gerar outro convite
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              O convite expira em 7 dias.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteClientDialog;
