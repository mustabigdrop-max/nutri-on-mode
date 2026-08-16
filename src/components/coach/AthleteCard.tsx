import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Dumbbell, BarChart3, MessageSquare, AlertTriangle, Zap, Eye, ClipboardList, Clock, CheckCircle2, Pencil, Trash2, KeyRound, Smartphone } from "lucide-react";
import AnamnesisDialog from "@/components/coach/AnamnesisDialog";
import EditAthleteDialog from "@/components/coach/EditAthleteDialog";
import DeleteAthleteDialog from "@/components/coach/DeleteAthleteDialog";
import ClientCredentialsDialog from "@/components/coach/ClientCredentialsDialog";
import WelcomeMessageDialog from "@/components/coach/WelcomeMessageDialog";
import { supabase } from "@/integrations/supabase/client";
import type { CoachAthlete } from "@/hooks/useCoachAthletes";

const RISK_COLOR: Record<CoachAthlete["riskLevel"], string> = {
  ok: "#00FF88",
  attention: "#FFD700",
  risk: "#FF4444",
};

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "—";

interface Props {
  athlete: CoachAthlete;
  onSendMeal: (a: CoachAthlete) => void;
  onSendTraining: (a: CoachAthlete) => void;
  onUpdated?: () => void;
}

const AthleteCard = ({ athlete: a, onSendMeal, onSendTraining, onUpdated }: Props) => {
  const navigate = useNavigate();
  const [anamneseOpen, setAnamneseOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [credOpen, setCredOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [welcomeSentAt, setWelcomeSentAt] = useState<string | null>(null);
  const color = RISK_COLOR[a.riskLevel];

  useEffect(() => {
    let alive = true;
    supabase
      .from("client_credentials")
      .select("welcome_sent, welcome_sent_at")
      .eq("client_id", a.userId)
      .maybeSingle()
      .then(({ data }) => {
        if (alive && data?.welcome_sent) setWelcomeSentAt(data.welcome_sent_at ?? null);
      });
    return () => {
      alive = false;
    };
  }, [a.userId]);

  return (
    <div
      className="rounded-xl p-5 transition-colors"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
            style={{ background: `${color}22`, color }}
          >
            {a.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="font-semibold text-foreground truncate">{a.name}</p>
              {a.accessStatus === "pendente" ? (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
                  style={{ background: "rgba(255,215,0,0.12)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}
                  title="Conta criada — aguardando primeiro acesso do atleta"
                >
                  <Clock className="w-3 h-3" /> PENDENTE
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
                  style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }}
                  title="Atleta ativo na plataforma"
                >
                  <CheckCircle2 className="w-3 h-3" /> ATIVO
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {a.objetivo}
              {a.fase && a.fase !== "—" ? ` · ${a.fase}` : ""}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          {a.riskLevel === "risk" && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded mb-1"
              style={{ background: "rgba(255,68,68,0.15)", color: "#FF4444", border: "1px solid rgba(255,68,68,0.3)" }}
            >
              <AlertTriangle className="w-3 h-3" /> RISCO
            </span>
          )}
          <p className="text-[10px] text-muted-foreground font-mono">Score {a.score}/100</p>
          <div className="w-24 h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full" style={{ width: `${a.score}%`, background: color }} />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs mb-4">
        <p className="text-muted-foreground font-mono">
          Peso: <span className="text-foreground">{a.pesoAtual ? `${a.pesoAtual}kg` : "—"}</span>
          {a.semanaAtual && a.semanasTotal ? ` · Semana ${a.semanaAtual}/${a.semanasTotal}` : ""}
        </p>
        <p className="text-muted-foreground">
          Último check-in:{" "}
          <span className="text-foreground">
            {a.diasDesdeCheckin > 900 ? "nunca" : `há ${a.diasDesdeCheckin} dia(s)`}
          </span>{" "}
          {a.diasDesdeCheckin <= 7 ? "✅" : a.diasDesdeCheckin <= 30 ? "⚠️" : "❌"}
        </p>
        <p className="text-muted-foreground">
          Plano alimentar:{" "}
          {a.hasActiveMealPlan ? (
            <span style={{ color: "#00FF88" }}>✅ Ativo (enviado {fmt(a.mealPlanSentAt)})</span>
          ) : (
            <span style={{ color: "#FF4444" }}>❌ Nenhum enviado</span>
          )}
        </p>
        <p className="text-muted-foreground">
          Treino:{" "}
          {a.hasActiveTrainingPlan ? (
            <span style={{ color: "#00FF88" }}>✅ Ativo (enviado {fmt(a.trainingPlanSentAt)})</span>
          ) : (
            <span style={{ color: "#FFD700" }}>⚠️ Não enviado</span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="quick-action-sm" onClick={() => onSendMeal(a)}>
          <UtensilsCrossed className="w-3.5 h-3.5" /> Enviar Plano
        </button>
        <button className="quick-action-sm" onClick={() => onSendTraining(a)}>
          <Dumbbell className="w-3.5 h-3.5" /> Enviar Treino
        </button>
        <button className="quick-action-sm" onClick={() => navigate(`/coach/patient/${a.userId}`)}>
          <BarChart3 className="w-3.5 h-3.5" /> Ver Perfil
        </button>
        <button className="quick-action-sm" onClick={() => navigate(`/coach/patient/${a.userId}?tab=messages`)}>
          <MessageSquare className="w-3.5 h-3.5" /> Msg
        </button>
        <button className="quick-action-sm" onClick={() => navigate(`/coach/view-as/${a.userId}`)}>
          <Eye className="w-3.5 h-3.5" /> Ver como cliente
        </button>
        <button className="quick-action-sm" onClick={() => navigate(`/coach/praxis-logs/${a.userId}`)}>
          <Zap className="w-3.5 h-3.5" /> PRAXIS
        </button>
        <button className="quick-action-sm" onClick={() => setAnamneseOpen(true)}>
          <ClipboardList className="w-3.5 h-3.5" /> Anamnese
        </button>
        <button className="quick-action-sm" onClick={() => setEditOpen(true)}>
          <Pencil className="w-3.5 h-3.5" /> Editar dados
        </button>
        <button className="quick-action-sm" onClick={() => setCredOpen(true)}>
          <KeyRound className="w-3.5 h-3.5" /> Login
        </button>
        <button className="quick-action-sm" onClick={() => setWelcomeOpen(true)}>
          <Smartphone className="w-3.5 h-3.5" />
          {welcomeSentAt ? `Boas-vindas ✅ (${fmt(welcomeSentAt)})` : "Boas-vindas"}
        </button>
        <button
          className="quick-action-sm"
          onClick={() => setDeleteOpen(true)}
          style={{ color: "#EF4444", background: "transparent", border: "1px solid rgba(239,68,68,0.35)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Trash2 className="w-3.5 h-3.5" /> Excluir
        </button>
      </div>

      <DeleteAthleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        linkId={a.id}
        athleteId={a.userId}
        athleteName={a.name}
        onDeleted={onUpdated}
      />

      <EditAthleteDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        athleteId={a.userId}
        athleteName={a.name}
        onSaved={onUpdated}
      />


      <AnamnesisDialog
        open={anamneseOpen}
        onOpenChange={setAnamneseOpen}
        athleteId={a.userId}
        athleteName={a.name}
      />

      <ClientCredentialsDialog
        open={credOpen}
        onOpenChange={setCredOpen}
        athleteId={a.userId}
        athleteName={a.name}
        onSendWelcome={() => setWelcomeOpen(true)}
      />

      <WelcomeMessageDialog
        open={welcomeOpen}
        onOpenChange={setWelcomeOpen}
        athleteId={a.userId}
        athleteName={a.name}
        onSent={() => setWelcomeSentAt(new Date().toISOString())}
      />
    </div>
  );
};

export default memo(AthleteCard);
