import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { useCoachTier } from "@/hooks/useCoachTier";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Copy, Crown, Dumbbell, Eye, Home, Link2, Loader2, RefreshCw, UserPlus, UtensilsCrossed, CheckCircle2, MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Mode = "direct" | "invite";

const OBJETIVOS = [
  "Hipertrofia",
  "Emagrecimento",
  "Recomposição",
  "Performance",
  "Competição",
  "Saúde / Longevidade",
];

export const generateTempPassword = (): string =>
  `nutrion${Math.floor(1000 + Math.random() * 9000)}`;

export const generateWhatsAppMessage = (
  c: { name: string; email: string; password: string },
  coachName?: string | null,
): string => {
  const firstName = c.name.split(" ")[0];
  return `Fala, ${firstName}! 💪

Sua conta no nutriON foi criada.
Acesse: nutrion.app.br

Login: ${c.email}
Senha: ${c.password}

Troque a senha no primeiro acesso.
Seu plano alimentar e treino já vão estar lá!

${coachName ? `Coach ${coachName}` : "Seu Coach"}
nutrion.app.br`;
};

const openWhatsApp = (phone: string, message: string) => {
  const clean = phone.replace(/\D/g, "");
  const br = clean.startsWith("55") ? clean : `55${clean}`;
  window.open(`https://wa.me/${br}?text=${encodeURIComponent(message)}`, "_blank");
};

interface Props {
  trigger?: React.ReactNode;
  onCreated?: () => void;
}

const CreateClientDialog = ({ trigger, onCreated }: Props) => {
  const navigate = useNavigate();
  const { profile } = useCoachProfile();
  const { canAddMore, currentClients, maxClients, isCoachPro, isAdmin } = useCoachTier();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("direct");
  const [loading, setLoading] = useState(false);

  // cadastro direto
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [objective, setObjective] = useState("");
  const [notes, setNotes] = useState("");
  const [password, setPassword] = useState(generateTempPassword());
  const [created, setCreated] = useState<{ userId: string; name: string; email: string; password: string } | null>(null);

  // convite
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const inviteUrl = generatedCode ? `${window.location.origin}/convite/${generatedCode}` : "";

  const reset = () => {
    setMode("direct");
    setName(""); setEmail(""); setPhone(""); setSex(""); setAge("");
    setWeight(""); setHeight(""); setObjective(""); setNotes("");
    setPassword(generateTempPassword());
    setCreated(null);
    setInviteEmail(""); setInviteMessage(""); setGeneratedCode(null);
  };

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) {
      toast({ title: "Preencha nome e email", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-client", {
        body: {
          email: email.trim().toLowerCase(),
          password,
          full_name: name.trim(),
          phone: phone.trim() || null,
          sex: sex || null,
          age: age ? Number(age) : null,
          weight: weight ? Number(weight) : null,
          height: height ? Number(height) : null,
          objective: objective || null,
          notes: notes.trim() || null,
        },
      });

      const errMsg = (data as any)?.error || (error as any)?.message;
      if (!data?.userId) throw new Error(errMsg || "Não foi possível criar a conta.");

      setCreated({ userId: data.userId, name: name.trim(), email: email.trim().toLowerCase(), password });
      toast({ title: "Cliente cadastrado! 🎉", description: data.message });
      onCreated?.();
    } catch (err: any) {
      toast({ title: "Erro ao cadastrar cliente", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("professional_invites")
        .insert({
          coach_profile_id: profile.id,
          email: inviteEmail.trim() || null,
          message: inviteMessage.trim() || null,
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

  const waMessage = created
    ? generateWhatsAppMessage(created, profile?.professional_name)
    : "";

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2">
            <UserPlus className="w-4 h-4" /> Cadastrar Cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            {created ? "Cliente cadastrado" : "Cadastrar Cliente"}
          </DialogTitle>
        </DialogHeader>

        {!canAddMore && !created ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-yellow-500/15 flex items-center justify-center">
              <Crown className="w-7 h-7 text-yellow-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Limite Coach Free atingido</p>
              <p className="text-sm text-muted-foreground mt-1">
                Você tem {currentClients}/{maxClients} clientes. Faça upgrade para Coach Pro e tenha clientes ilimitados.
              </p>
            </div>
            <Button className="w-full" onClick={() => { setOpen(false); navigate("/coach/settings"); }}>
              Fazer Upgrade
            </Button>
          </div>
        ) : created ? (
          /* ---------- SUCESSO ---------- */
          <div className="space-y-4">
            <div className="rounded-lg p-3 space-y-1 text-sm" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)" }}>
              <p className="flex items-center gap-2 font-semibold" style={{ color: "#00FF88" }}>
                <CheckCircle2 className="w-4 h-4" /> Conta criada com sucesso
              </p>
              <p>👤 {created.name}</p>
              <p className="font-mono text-xs">📧 {created.email}</p>
              <p className="font-mono text-xs">🔑 Senha: {created.password}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Enviar credenciais</Label>
              <div className="bg-muted/50 rounded-lg p-3 text-xs whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                {waMessage}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => { navigator.clipboard.writeText(waMessage); toast({ title: "Mensagem copiada!" }); }}
                >
                  <Copy className="w-4 h-4" /> Copiar
                </Button>
                <Button
                  className="gap-2"
                  disabled={!phone.trim()}
                  onClick={() => openWhatsApp(phone, waMessage)}
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </Button>
              </div>
              {!phone.trim() && (
                <p className="text-[11px] text-muted-foreground">
                  Sem telefone cadastrado — copie a mensagem e envie manualmente.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Próximos passos</Label>
              <div className="grid gap-2">
                <Button variant="outline" className="justify-start gap-2" onClick={() => { setOpen(false); navigate(`/coach/nutriplan?patient=${created.userId}`); }}>
                  <UtensilsCrossed className="w-4 h-4" /> Enviar Plano Alimentar agora
                </Button>
                <Button variant="outline" className="justify-start gap-2" onClick={() => { setOpen(false); navigate(`/coach/trainingon?patient=${created.userId}`); }}>
                  <Dumbbell className="w-4 h-4" /> Enviar Treino agora
                </Button>
                <Button variant="outline" className="justify-start gap-2" onClick={() => { setOpen(false); navigate(`/coach/view-as/${created.userId}`); }}>
                  <Eye className="w-4 h-4" /> Ver como cliente
                </Button>
                <Button variant="ghost" className="justify-start gap-2" onClick={() => { setOpen(false); reset(); }}>
                  <Home className="w-4 h-4" /> Voltar ao Dashboard
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* MODO */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode("direct")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold border transition-colors ${mode === "direct" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}
              >
                Cadastro direto
              </button>
              <button
                onClick={() => setMode("invite")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold border transition-colors ${mode === "invite" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}
              >
                Link de convite
              </button>
            </div>

            {!isCoachPro && !isAdmin && (
              <div className="text-[11px] text-muted-foreground bg-muted/40 rounded px-2 py-1.5 font-mono">
                {currentClients}/{maxClients} clientes · Coach Free
              </div>
            )}

            {mode === "direct" ? (
              <>
                <div>
                  <Label>Nome completo *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Marcus Avila" maxLength={120} />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" maxLength={255} />
                </div>
                <div>
                  <Label>WhatsApp / Telefone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(21) 99999-9999" maxLength={30} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Sexo</Label>
                    <Select value={sex} onValueChange={setSex}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Idade</Label>
                    <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="32" min={10} max={110} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Peso (kg)</Label>
                    <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="85" min={20} max={400} />
                  </div>
                  <div>
                    <Label>Altura (cm)</Label>
                    <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="178" min={80} max={260} />
                  </div>
                </div>

                <div>
                  <Label>Objetivo principal</Label>
                  <Select value={objective} onValueChange={setObjective}>
                    <SelectTrigger><SelectValue placeholder="Selecione o objetivo" /></SelectTrigger>
                    <SelectContent>
                      {OBJETIVOS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Observações iniciais (opcional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Treina há 3 anos, quer ganhar massa, sem restrições..."
                  />
                </div>

                <div className="rounded-lg p-3 space-y-2" style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)" }}>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Credenciais</Label>
                  <div className="flex items-center gap-2">
                    <Input value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono" maxLength={72} />
                    <Button type="button" variant="secondary" size="icon" onClick={() => setPassword(generateTempPassword())} aria-label="Gerar outra senha">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    ⚠️ O cliente usará esta senha no primeiro login. Ele poderá alterar depois em Perfil &gt; Segurança.
                  </p>
                </div>

                <Button className="w-full gap-2" onClick={handleCreate} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Criar Conta e Adicionar
                </Button>
              </>
            ) : !generatedCode ? (
              <>
                <div>
                  <Label>Email do cliente (opcional)</Label>
                  <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="cliente@email.com" />
                  <p className="text-xs text-muted-foreground mt-1">Você compartilhará o link manualmente.</p>
                </div>
                <div>
                  <Label>Mensagem personalizada (opcional)</Label>
                  <Textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    rows={3}
                    placeholder="Olá! Estou te convidando para acompanhamento via nutriON..."
                  />
                </div>
                <Button className="w-full gap-2" onClick={handleGenerateInvite} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  Gerar Link de Convite
                </Button>
              </>
            ) : (
              <>
                <div className="bg-muted/50 p-3 rounded-lg break-all text-xs font-mono">{inviteUrl}</div>
                <Button className="w-full gap-2" onClick={() => { navigator.clipboard.writeText(inviteUrl); toast({ title: "Link copiado!" }); }}>
                  <Copy className="w-4 h-4" /> Copiar Link
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setGeneratedCode(null)}>
                  Gerar outro convite
                </Button>
                <p className="text-xs text-muted-foreground text-center">O convite expira em 7 dias.</p>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientDialog;
