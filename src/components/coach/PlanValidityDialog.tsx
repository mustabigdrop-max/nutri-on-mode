import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Save, Unlock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** id da linha de vínculo coach ↔ aluno */
  linkId: string;
  athleteId: string;
  athleteName: string;
  onSaved?: () => void;
}

const paraInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");
const paraFimDoDia = (data: string) => new Date(`${data}T23:59:59`).toISOString();

const PlanValidityDialog = ({ open, onOpenChange, linkId, athleteId, athleteName, onSaved }: Props) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [historico, setHistorico] = useState<unknown[]>([]);

  useEffect(() => {
    if (!open || !linkId) return;
    setLoading(true);
    (async () => {
      const { data: row, error } = await supabase
        .from("coach_patients")
        .select("plan_expires_at, is_locked, lock_history")
        .eq("id", linkId)
        .maybeSingle();
      if (error) toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
      setData(paraInput((row?.plan_expires_at as string) ?? null));
      setIsLocked(!!row?.is_locked);
      setHistorico(Array.isArray(row?.lock_history) ? (row?.lock_history as unknown[]) : []);
      setLoading(false);
    })();
  }, [open, linkId]);

  const salvarValidade = async () => {
    if (!data) {
      toast({ title: "Informe a data de validade", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("coach_patients")
      .update({ plan_expires_at: paraFimDoDia(data) })
      .eq("id", linkId);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Validade atualizada", description: new Date(paraFimDoDia(data)).toLocaleDateString("pt-BR") });
    onSaved?.();
    onOpenChange(false);
  };

  const desbloquear = async () => {
    if (!data) {
      toast({ title: "Defina a nova data de validade antes de liberar o acesso", variant: "destructive" });
      return;
    }
    setSaving(true);
    const agora = new Date().toISOString();
    const novaValidade = paraFimDoDia(data);
    const { error } = await supabase
      .from("coach_patients")
      .update({
        is_locked: false,
        unlocked_at: agora,
        locked_at: null,
        lock_reason: null,
        lock_notified: false,
        plan_expires_at: novaValidade,
        lock_history: [
          ...historico,
          { action: "unlocked", reason: "renewal", new_expiry: novaValidade, at: agora, by: "coach" },
        ],
      })
      .eq("id", linkId);

    if (!error) {
      await supabase.from("notifications").insert({
        user_id: athleteId,
        type: "plan_renewed",
        title: "Acesso liberado",
        body: `Seu plano foi renovado até ${new Date(novaValidade).toLocaleDateString("pt-BR")}. Bora continuar a transformação.`,
        action_url: "/dashboard",
        read: false,
      });
    }
    setSaving(false);

    if (error) {
      toast({ title: "Erro ao liberar acesso", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Acesso liberado", description: athleteName });
    onSaved?.();
    onOpenChange(false);
  };

  const bloquearAgora = async () => {
    setSaving(true);
    const agora = new Date().toISOString();
    const { error } = await supabase
      .from("coach_patients")
      .update({
        is_locked: true,
        locked_at: agora,
        lock_reason: "manual",
        lock_notified: true,
        lock_history: [...historico, { action: "locked", reason: "manual", at: agora, by: "coach" }],
      })
      .eq("id", linkId);

    if (!error) {
      await supabase.from("notifications").insert({
        user_id: athleteId,
        type: "plan_expired",
        title: "Seu acesso foi pausado",
        body: "Fale com o Coach Diogo Mello para liberar novamente o seu acompanhamento.",
        action_url: "/acesso-pausado",
        read: false,
      });
    }
    setSaving(false);

    if (error) {
      toast({ title: "Erro ao bloquear", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Aluno bloqueado", description: athleteName });
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Validade do plano · {athleteName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Plano válido até</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                No dia seguinte ao vencimento o acesso do aluno é pausado automaticamente. Ele recebe aviso 7, 3 e 1 dia
                antes.
              </p>
            </div>

            {isLocked && (
              <div
                className="text-xs p-3"
                style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.3)", color: "#FF4444" }}
              >
                Este aluno está com o acesso pausado. Defina a nova data e libere o acesso.
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={salvarValidade} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar validade
              </Button>

              {isLocked ? (
                <Button onClick={desbloquear} disabled={saving} variant="secondary">
                  <Unlock className="w-4 h-4" /> Liberar acesso
                </Button>
              ) : (
                <Button onClick={bloquearAgora} disabled={saving} variant="outline">
                  <Lock className="w-4 h-4" /> Pausar acesso agora
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlanValidityDialog;
