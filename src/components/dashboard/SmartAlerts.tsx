import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Brain, X, ChevronRight, MessageSquare, TrendingUp, Utensils, AlertTriangle, Info, CheckCircle, Bell } from "lucide-react";

interface Alert {
  id: string;
  tipo_alerta: string;
  mensagem: string;
  lido: boolean;
  enviado_em: string;
}

type Severity = "info" | "warning" | "critical" | "positive";

const ALERT_SEVERITY: Record<string, Severity> = {
  refeicao_atrasada: "warning",
  proteina_baixa: "warning",
  cafe_pulado: "info",
  sexta_alerta: "info",
  streak_risco: "critical",
  plateau: "warning",
  meta_proxima: "positive",
  deficit_agressivo: "critical",
  proteina_hipertrofia: "critical",
  acolhimento_culpa: "positive",
};

const SEVERITY_CONFIG: Record<Severity, { bar: string; border: string; bg: string; icon: typeof Info; iconColor: string; label: string }> = {
  info: { bar: "bg-accent", border: "border-accent/20", bg: "bg-accent/5", icon: Info, iconColor: "text-accent", label: "Info" },
  warning: { bar: "bg-primary", border: "border-primary/20", bg: "bg-primary/5", icon: AlertTriangle, iconColor: "text-primary", label: "Atenção" },
  critical: { bar: "bg-destructive", border: "border-destructive/20", bg: "bg-destructive/5", icon: AlertTriangle, iconColor: "text-destructive", label: "Crítico" },
  positive: { bar: "bg-accent", border: "border-accent/20", bg: "bg-accent/5", icon: CheckCircle, iconColor: "text-accent", label: "Positivo" },
};

const ALERT_CTAS: Record<string, { label: string; path: string; icon: typeof Utensils }[]> = {
  refeicao_atrasada: [{ label: "Registrar agora", path: "/meal-log", icon: Utensils }],
  proteina_baixa: [{ label: "Ver opções de jantar", path: "/meal-plan", icon: Utensils }],
  streak_risco: [{ label: "Registrar agora", path: "/meal-log", icon: Utensils }],
  plateau: [{ label: "Ver histórico", path: "/progress", icon: TrendingUp }, { label: "Falar com coach", path: "/chat", icon: MessageSquare }],
  meta_proxima: [{ label: "Ver progresso", path: "/progress", icon: TrendingUp }],
  deficit_agressivo: [{ label: "Falar com coach", path: "/chat", icon: MessageSquare }],
  proteina_hipertrofia: [{ label: "Ver plano", path: "/meal-plan", icon: Utensils }],
  acolhimento_culpa: [{ label: "Registrar refeição", path: "/meal-log", icon: Utensils }, { label: "Quero conversar", path: "/chat", icon: MessageSquare }],
};

export default function SmartAlerts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    generateAndFetch();
  }, [user]);

  const generateAndFetch = async () => {
    try {
      await supabase.functions.invoke("generate-alerts");
      const { data } = await supabase
        .from("alertas_preditivos")
        .select("*")
        .eq("user_id", user!.id)
        .eq("lido", false)
        .order("enviado_em", { ascending: false })
        .limit(3);
      setAlerts(data || []);
    } catch (e) {
      console.error("Error fetching alerts:", e);
    } finally {
      setLoading(false);
    }
  };

  const dismiss = async (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    await supabase.from("alertas_preditivos").update({ lido: true }).eq("id", id);
  };

  if (loading || alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 mb-1">
        <Brain className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-mono text-primary uppercase tracking-wider">Alertas Inteligentes</span>
      </div>
      <AnimatePresence mode="popLayout">
        {alerts.map((alert, i) => {
          const severity = ALERT_SEVERITY[alert.tipo_alerta] || "info";
          const config = SEVERITY_CONFIG[severity];
          const SeverityIcon = config.icon;
          const ctas = ALERT_CTAS[alert.tipo_alerta] || [];

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.95 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl border ${config.border} ${config.bg} p-0 relative overflow-hidden`}
            >
              {/* Severity side bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bar}`} />

              <div className="pl-4 pr-4 py-4">
                <button
                  onClick={() => dismiss(alert.id)}
                  className="absolute top-2 right-2 p-1 rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                <div className="flex items-start gap-3 pr-6">
                  <SeverityIcon className={`w-4 h-4 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className={config.iconColor}>MCE ·</span> {config.label}
                    </p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {alert.mensagem}
                    </p>

                    {ctas.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {ctas.map(cta => (
                          <button
                            key={cta.path}
                            onClick={() => { dismiss(alert.id); navigate(cta.path); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-xs font-mono text-primary"
                          >
                            <cta.icon className="w-3 h-3" />
                            {cta.label}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
