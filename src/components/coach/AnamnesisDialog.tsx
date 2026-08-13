import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, FileDown, FileText, Loader2, PencilLine, Send, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { anamnesisLink, buildAlerts, exportAnamnesisPDF, rowToData, stashPrefill, type AnamnesisRow } from "@/lib/anamnesis";
import { createAnamnesis, getLatestAnamnesisForAthlete } from "@/lib/anamnesisApi";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  athleteId: string;
  athleteName: string;
}

const CYAN = "#00D4FF";

const AnamnesisDialog = ({ open, onOpenChange, athleteId, athleteName }: Props) => {
  const nav = useNavigate();
  const [row, setRow] = useState<AnamnesisRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getLatestAnamnesisForAthlete(athleteId)
      .then(setRow)
      .catch(() => toast.error("Erro ao carregar anamnese"))
      .finally(() => setLoading(false));
  }, [open, athleteId]);

  const ensure = async (mode: "online" | "presencial"): Promise<AnamnesisRow | null> => {
    if (row && row.status !== "completed" && row.mode === mode) return row;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.error("Sessão expirada");
      return null;
    }
    const created = await createAnamnesis({
      coachId: auth.user.id,
      athleteId,
      athleteName,
      mode,
    });
    setRow(created);
    return created;
  };

  const sendOnline = async () => {
    setBusy(true);
    try {
      const r = await ensure("online");
      if (!r?.invite_token) return;
      const link = anamnesisLink(r.invite_token);
      await navigator.clipboard.writeText(link).catch(() => undefined);
      toast.success("Link copiado — válido por 7 dias", { description: link });
      window.open(`https://wa.me/?text=${encodeURIComponent(`Oi ${athleteName}! Preenche sua anamnese aqui: ${link}`)}`, "_blank");
    } catch {
      toast.error("Não foi possível gerar o link");
    } finally {
      setBusy(false);
    }
  };

  const fillNow = async () => {
    setBusy(true);
    try {
      const r = await ensure("presencial");
      if (r) nav(`/coach/anamneses?id=${r.id}`);
    } catch {
      toast.error("Não foi possível abrir a anamnese");
    } finally {
      setBusy(false);
    }
  };

  const alerts = row ? buildAlerts(rowToData(row)) : [];
  const completed = row?.status === "completed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">📋 Anamnese · {athleteName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">
              Status:{" "}
              {completed ? (
                <span style={{ color: "#00FF88" }}>✅ {row?.sections_completed}/{row?.total_sections} seções preenchidas</span>
              ) : row ? (
                <span style={{ color: "#FFD700" }}>⏳ Em andamento ({row.sections_completed}/{row.total_sections})</span>
              ) : (
                <span style={{ color: "#FF4444" }}>⚠️ Não preenchida</span>
              )}
            </p>

            <button className="quick-action-sm w-full justify-center" disabled={busy} onClick={sendOnline}>
              <Send className="w-3.5 h-3.5" /> Enviar para o cliente preencher (Online)
            </button>
            <button className="quick-action-sm w-full justify-center" disabled={busy} onClick={fillNow}>
              <PencilLine className="w-3.5 h-3.5" /> Preencher agora (Presencial)
            </button>

            {row && (
              <>
                <button className="quick-action-sm w-full justify-center" onClick={() => nav(`/coach/anamneses?id=${row.id}`)}>
                  <FileText className="w-3.5 h-3.5" /> Ver anamnese completa
                </button>
                <button
                  className="quick-action-sm w-full justify-center"
                  onClick={() => {
                    stashPrefill(athleteId, rowToData(row));
                    nav("/coach/plano-alimentar");
                  }}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" /> Abrir NutriPlan (dados pré-preenchidos)
                </button>
                <button className="quick-action-sm w-full justify-center" onClick={() => exportAnamnesisPDF(row, rowToData(row))}>
                  <FileDown className="w-3.5 h-3.5" /> Exportar PDF da anamnese
                </button>
                {row.invite_token && (
                  <button
                    className="quick-action-sm w-full justify-center"
                    onClick={() => {
                      navigator.clipboard.writeText(anamnesisLink(row.invite_token!));
                      toast.success("Link copiado");
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar link ({row.invite_token})
                  </button>
                )}
              </>
            )}

            {alerts.length > 0 && (
              <div className="rounded-lg p-3" style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.25)" }}>
                <p className="text-[11px] font-bold mb-1" style={{ color: "#FF4444" }}>⚠️ ALERTAS AUTOMÁTICOS</p>
                <ul className="text-[12px] text-muted-foreground space-y-0.5">
                  {alerts.map((a) => <li key={a}>• {a}</li>)}
                </ul>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground" style={{ color: CYAN }}>
              O link de anamnese expira em 7 dias.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnamnesisDialog;
