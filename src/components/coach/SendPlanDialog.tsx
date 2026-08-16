import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Send, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { CoachAthlete } from "@/hooks/useCoachAthletes";

export type SendPlanType = "meal_plan" | "training_plan";

interface PlanOption {
  id: string;
  label: string;
  createdAt: string;
  data: any;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  athlete: CoachAthlete | null;
  type: SendPlanType;
  coachProfileId: string;
  coachUserId: string;
  onSent?: () => void;
}

const SendPlanDialog = ({ open, onOpenChange, athlete, type, coachProfileId, coachUserId, onSent }: Props) => {
  const navigate = useNavigate();
  const [options, setOptions] = useState<PlanOption[]>([]);
  const [selected, setSelected] = useState<string>("new");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentInfo, setSentInfo] = useState<null | { label: string }>(null);

  const isMeal = type === "meal_plan";

  useEffect(() => {
    if (!open || !athlete) return;
    setSentInfo(null);
    setSelected("new");
    setMessage("");
    setLoading(true);
    (async () => {
      if (isMeal) {
        const { data } = await supabase
          .from("coach_meal_plans")
          .select("id, patient_name, objetivo, plano, created_at")
          .eq("coach_id", coachProfileId)
          .order("created_at", { ascending: false })
          .limit(200);
        setOptions(
          (data || []).map((p: any) => ({
            id: p.id,
            label: `${p.objetivo || "Plano alimentar"} — ${p.patient_name || "sem nome"}`,
            createdAt: p.created_at,
            data: p.plano,
          }))
        );
      } else {
        const { data } = await supabase
          .from("training_protocols")
          .select("id, client_name, phase, weeks, protocol_text, periodizacao_text, created_at")
          .eq("user_id", coachUserId)
          .order("created_at", { ascending: false })
          .limit(200);
        setOptions(
          (data || []).map((p: any) => ({
            id: p.id,
            label: `${p.phase || "Treino"} — ${p.client_name || "sem nome"}${p.weeks ? ` · ${p.weeks} sem` : ""}`,
            createdAt: p.created_at,
            data: {
              protocol_text: p.protocol_text,
              periodizacao_text: p.periodizacao_text,
              phase: p.phase,
              weeks: p.weeks,
              client_name: p.client_name,
            },
          }))
        );
      }
      setLoading(false);
    })();
  }, [open, athlete, type, coachProfileId, coachUserId, isMeal]);

  const goGenerate = () => {
    if (!athlete) return;
    onOpenChange(false);
    navigate(isMeal ? `/coach/plano-alimentar?athlete=${athlete.userId}` : `/training?athlete=${athlete.userId}`);
  };

  const handleSend = async () => {
    if (!athlete) return;
    if (selected === "new") return goGenerate();
    const opt = options.find((o) => o.id === selected);
    if (!opt) return;

    setSending(true);
    try {
      const { error } = await supabase.from("sent_plans").insert({
        coach_id: coachUserId,
        athlete_id: athlete.userId,
        type,
        status: "active",
        plan_data: opt.data ?? {},
        coach_message: message || "",
        metadata: { source_id: opt.id, label: opt.label },
      });
      if (error) throw error;

      if (isMeal) {
        await supabase
          .from("coach_meal_plans")
          .update({ patient_user_id: athlete.userId, status: "sent", sent_at: new Date().toISOString(), observacao: message || null })
          .eq("id", opt.id);
      } else {
        await supabase.from("training_protocols").update({ patient_user_id: athlete.userId }).eq("id", opt.id);
      }

      await supabase.from("coach_notifications").insert({
        recipient_user_id: athlete.userId,
        sender_user_id: coachUserId,
        notification_type: isMeal ? "meal_plan_sent" : "training_plan_sent",
        title: isMeal ? "Novo plano alimentar recebido!" : "Novo treino recebido!",
        message: message || "Seu coach enviou um novo protocolo.",
        reference_id: opt.id,
      });

      setSentInfo({ label: opt.label });
      onSent?.();
      toast({ title: isMeal ? "Plano enviado 📨" : "Treino enviado 📨", description: `Para ${athlete.name}` });
    } catch (e: any) {
      toast({ title: "Erro ao enviar", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            {isMeal ? "Enviar plano alimentar" : "Enviar treino"} · {athlete?.name}
          </DialogTitle>
        </DialogHeader>

        {sentInfo ? (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: "#00FF88" }} />
            <div>
              <p className="font-semibold text-foreground">Enviado com sucesso</p>
              <p className="text-sm text-muted-foreground">
                {athlete?.name} já pode ver {isMeal ? "o plano" : "o treino"} no app.
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-mono">{sentInfo.label}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              Voltar ao Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Origem</p>

              <button
                onClick={() => setSelected("new")}
                className="w-full text-left rounded-lg p-3 border transition-colors"
                style={{
                  borderColor: selected === "new" ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.08)",
                  background: selected === "new" ? "rgba(0,212,255,0.08)" : "transparent",
                }}
              >
                <p className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Gerar novo {isMeal ? "plano" : "treino"} agora
                </p>
                <p className="text-xs text-muted-foreground">
                  Abre o {isMeal ? "NutriPlan" : "TrainingON"} com {athlete?.name} pré-selecionado
                </p>
              </button>

              {loading ? (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Carregando histórico...
                </p>
              ) : options.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum protocolo no histórico ainda.</p>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar no histórico..."
                      className="h-8 text-xs"
                    />
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {filtered.length}/{options.length}
                    </span>
                  </div>

                  <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
                    {filtered.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nenhum resultado para "{search}".</p>
                    ) : (
                      filtered.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => setSelected(o.id)}
                          className="w-full text-left rounded-lg p-3 border transition-colors"
                          style={{
                            borderColor: selected === o.id ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.08)",
                            background: selected === o.id ? "rgba(0,212,255,0.08)" : "transparent",
                          }}
                        >
                          <p className="text-sm font-medium truncate">
                            {o.id === options[0]?.id ? "Último gerado · " : ""}
                            {o.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Mensagem (opcional)</p>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex.: aumentei o carboidrato no pré-treino e adicionei refeed na sexta."
                rows={3}
              />
            </div>

            <Button className="w-full" onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {selected === "new" ? "Abrir gerador" : "Enviar agora"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SendPlanDialog;
