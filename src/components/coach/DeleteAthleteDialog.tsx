import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** coach_patients row id */
  linkId: string;
  athleteId: string;
  athleteName: string;
  onDeleted?: () => void;
}

const DeleteAthleteDialog = ({ open, onOpenChange, linkId, athleteId, athleteName, onDeleted }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("Sessão expirada. Faça login novamente.");

      // valida que o vínculo pertence a um coach_profile do usuário logado
      const { data: link, error: linkErr } = await supabase
        .from("coach_patients")
        .select("id, coach_id, patient_user_id")
        .eq("id", linkId)
        .maybeSingle();
      if (linkErr) throw linkErr;
      if (!link) throw new Error("Vínculo não encontrado.");

      const { data: prof } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();

      if (!prof || prof.id !== link.coach_id) {
        throw new Error("Você não tem permissão para excluir este atleta.");
      }

      // dados relacionados (best-effort — RLS pode bloquear alguns)
      await Promise.allSettled([
        supabase.from("coach_meal_plans").delete().eq("patient_user_id", athleteId).eq("coach_id", prof.id),
        supabase.from("training_protocols").delete().eq("patient_user_id", athleteId),
        supabase.from("sent_plans").delete().eq("athlete_id", athleteId).eq("coach_id", prof.id),
        supabase.from("anamnesis").delete().eq("athlete_id", athleteId).eq("coach_id", prof.id),
        supabase.from("coach_messages").delete().eq("patient_user_id", athleteId).eq("coach_id", prof.id),
        supabase.from("weekly_checkins").delete().eq("user_id", athleteId),
      ]);

      const { error: delErr } = await supabase.from("coach_patients").delete().eq("id", linkId);
      if (delErr) throw delErr;

      toast.success("Atleta excluído com sucesso");
      onOpenChange(false);
      onDeleted?.();
    } catch (e: any) {
      console.error("Erro ao excluir atleta:", e);
      toast.error(e?.message || "Erro ao excluir atleta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent
        className="sm:max-w-md"
        style={{ background: "#0a0a12", border: "1px solid rgba(239,68,68,0.25)" }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: "#EF4444" }}>
            <AlertTriangle className="w-5 h-5" /> Excluir atleta
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tem certeza que deseja excluir <span className="text-foreground font-semibold">{athleteName}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Esta ação vai remover:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Todos os planos alimentares deste atleta</li>
            <li>Todos os planos de treino</li>
            <li>Histórico de check-ins</li>
            <li>Dados de anamnese</li>
            <li>Mensagens</li>
          </ul>
          <p className="pt-2 font-semibold" style={{ color: "#EF4444" }}>
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            style={{ background: "#EF4444", color: "#fff" }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Excluindo...
              </>
            ) : (
              "Excluir permanentemente"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAthleteDialog;
