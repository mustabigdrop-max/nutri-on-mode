import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type PlanType = "meal_plan" | "training_plan";

interface Props {
  type: PlanType;
  /** Payload que será salvo em sent_plans.plan_data */
  buildPayload: () => any;
  /** id do registro original (training_protocols / coach_meal_plans) */
  sourceId?: string | null;
  /** rótulo curto do que está sendo enviado */
  label?: string;
  className?: string;
}

interface PatientOpt {
  user_id: string;
  name: string;
}

const ACCENT = "#00FF88";

/**
 * Barra fixa e visível para enviar o plano/treino aberto na tela
 * diretamente para um atleta vinculado ao coach.
 */
export default function SendToAthleteBar({ type, buildPayload, sourceId, label, className }: Props) {
  const isMeal = type === "meal_plan";
  const preselected = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get("athlete") || "";
    } catch {
      return "";
    }
  }, []);

  const [coachUserId, setCoachUserId] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientOpt[]>([]);
  const [selected, setSelected] = useState<string>(preselected);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      setCoachUserId(uid);
      if (!uid) return;

      const { data: prof } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();
      if (!prof?.id) return;

      const { data: links } = await supabase
        .from("coach_patients")
        .select("patient_user_id")
        .eq("coach_id", prof.id)
        .eq("status", "active");

      const ids = (links || []).map((l: any) => l.patient_user_id).filter(Boolean);
      if (!ids.length) return;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", ids);

      setPatients(
        ids.map((id: string) => ({
          user_id: id,
          name: profiles?.find((p: any) => p.user_id === id)?.full_name || "Atleta",
        }))
      );
    })();
  }, []);

  const selectedName = patients.find((p) => p.user_id === selected)?.name || "atleta";

  const handleSend = async () => {
    if (!coachUserId) return;
    if (!selected) {
      toast({ title: "Selecione o atleta", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const payload = buildPayload();
      const { error } = await supabase.from("sent_plans").insert({
        coach_id: coachUserId,
        athlete_id: selected,
        type,
        status: "active",
        plan_data: payload ?? {},
        coach_message: message || null,
        metadata: { source_id: sourceId || null, label: label || null },
      });
      if (error) throw error;

      if (sourceId) {
        if (isMeal) {
          await supabase
            .from("coach_meal_plans")
            .update({ patient_user_id: selected, status: "sent", sent_at: new Date().toISOString() })
            .eq("id", sourceId);
        } else {
          await supabase.from("training_protocols").update({ patient_user_id: selected }).eq("id", sourceId);
        }
      }

      await supabase.from("coach_notifications").insert({
        recipient_user_id: selected,
        sender_user_id: coachUserId,
        notification_type: isMeal ? "meal_plan_sent" : "training_plan_sent",
        title: isMeal ? "Novo plano alimentar recebido!" : "Novo treino recebido!",
        message: message || "Seu coach enviou um novo protocolo.",
        action_url: isMeal ? "/meu-plano" : "/meu-treino",
        reference_id: sourceId || null,
      });

      setSentTo(selectedName);
      toast({
        title: isMeal ? "Plano enviado 📨" : "Treino enviado 📨",
        description: `Sincronizado para ${selectedName}`,
      });
    } catch (e: any) {
      toast({ title: "Erro ao enviar", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={`sticky top-0 z-30 rounded-xl px-3 py-2.5 flex flex-wrap items-center gap-2 backdrop-blur ${className || ""}`}
      style={{
        background: "rgba(0,255,136,0.06)",
        border: `1px solid rgba(0,255,136,0.25)`,
      }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>
        {isMeal ? "Enviar plano" : "Enviar treino"}
      </span>

      <select
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          setSentTo(null);
        }}
        className="text-xs rounded-lg px-2 py-1.5 bg-transparent outline-none"
        style={{ border: "1px solid rgba(255,255,255,0.12)", color: "inherit", minWidth: 160 }}
      >
        <option value="" style={{ background: "#0a0a0a" }}>
          Selecione o atleta…
        </option>
        {patients.map((p) => (
          <option key={p.user_id} value={p.user_id} style={{ background: "#0a0a0a" }}>
            {p.name}
          </option>
        ))}
      </select>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mensagem (opcional)"
        className="text-xs rounded-lg px-2 py-1.5 bg-transparent outline-none flex-1 min-w-[140px]"
        style={{ border: "1px solid rgba(255,255,255,0.12)", color: "inherit" }}
      />

      <button
        onClick={handleSend}
        disabled={sending || !selected}
        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
        style={{ background: ACCENT, color: "#04120a" }}
      >
        {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        Enviar agora
      </button>

      {sentTo && (
        <span className="flex items-center gap-1 text-[11px]" style={{ color: ACCENT }}>
          <CheckCircle2 className="w-3.5 h-3.5" /> Enviado para {sentTo}
        </span>
      )}
    </div>
  );
}
