import { useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  PROFESSIONAL_ROLES, ROLE_META, SCOPES, CATEGORY_LABEL,
  type ProfessionalRole,
} from "@/lib/professionalScopes";

const CYAN = "#00D4FF";

interface Props {
  patientId: string;
  patientName: string;
  onClose: () => void;
  onInvited: () => void;
}

const InviteProfessionalDialog = ({ patientId, patientName, onClose, onInvited }: Props) => {
  const [role, setRole] = useState<ProfessionalRole>("personal_trainer");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scope = SCOPES[role];

  const submit = async () => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) { toast.error("Informe o email do profissional"); return; }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-team-professional", {
        body: { patient_id: patientId, email: normalized, professional_role: role, message },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Convite enviado. O paciente será notificado para autorizar o compartilhamento.");
      onInvited();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Não foi possível enviar o convite");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6" style={{ background: "rgba(0,0,0,0.8)" }}>
      <div
        className="w-full md:max-w-lg max-h-[92vh] overflow-y-auto p-5 space-y-4"
        style={{ background: "#07070f", border: `1px solid ${CYAN}33` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.18em", color: `${CYAN}99` }}>
              CONVIDAR PROFISSIONAL
            </div>
            <h2 className="text-foreground" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 20 }}>
              {patientName}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <label className="block space-y-1">
          <span className="text-muted-foreground" style={{ fontSize: 11, letterSpacing: "0.1em" }}>TIPO DE PROFISSIONAL</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as ProfessionalRole)}
            className="w-full bg-transparent text-foreground px-3 py-2"
            style={{ border: `1px solid ${CYAN}33`, fontSize: 14 }}
          >
            {PROFESSIONAL_ROLES.map((r) => (
              <option key={r} value={r} style={{ background: "#07070f" }}>
                {ROLE_META[r].label} ({ROLE_META[r].registration})
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-muted-foreground" style={{ fontSize: 11, letterSpacing: "0.1em" }}>EMAIL DO PROFISSIONAL</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="profissional@email.com"
            className="w-full bg-transparent text-foreground px-3 py-2"
            style={{ border: `1px solid ${CYAN}33`, fontSize: 14 }}
          />
        </label>

        <div className="space-y-1 p-3" style={{ border: `1px solid ${CYAN}22`, background: `${CYAN}08` }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.16em", color: `${CYAN}aa` }}>
            PERMISSÕES PADRÃO · {ROLE_META[role].label.toUpperCase()}
          </div>
          {scope.canWrite.map((c) => (
            <div key={`w-${c}`} className="text-foreground" style={{ fontSize: 12 }}>✅ {CATEGORY_LABEL[c]} (criar e editar)</div>
          ))}
          {scope.canRead.map((c) => (
            <div key={`r-${c}`} className="text-muted-foreground" style={{ fontSize: 12 }}>👁️ {CATEGORY_LABEL[c]} (somente leitura)</div>
          ))}
          {scope.cannotSee.map((c) => (
            <div key={`n-${c}`} style={{ fontSize: 12, color: "#FF6B6B" }}>❌ {CATEGORY_LABEL[c]} (não visível)</div>
          ))}
        </div>

        <label className="block space-y-1">
          <span className="text-muted-foreground" style={{ fontSize: 11, letterSpacing: "0.1em" }}>MENSAGEM (OPCIONAL)</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full bg-transparent text-foreground px-3 py-2"
            style={{ border: `1px solid ${CYAN}33`, fontSize: 13 }}
          />
        </label>

        <p className="text-muted-foreground" style={{ fontSize: 11 }}>
          ⚠️ O paciente será notificado sobre o novo profissional. Os dados só são compartilhados após o aceite do
          profissional e a autorização do paciente.
        </p>

        <button
          onClick={submit}
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          style={{ background: CYAN, color: "#020205", fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em" }}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          ENVIAR CONVITE
        </button>
      </div>
    </div>
  );
};

export default InviteProfessionalDialog;
