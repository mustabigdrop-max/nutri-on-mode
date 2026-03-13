import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Brain, X, ChevronRight, MessageSquare, TrendingUp, Utensils, Zap, AlertTriangle, Heart, Target } from "lucide-react";

interface Alert {
  id: string;
  tipo_alerta: string;
  mensagem: string;
  lido: boolean;
  enviado_em: string;
}

// Alert metadata: icon, accent color, severity, label
const ALERT_META: Record<string, {
  icon: string;
  accentColor: string;
  borderColor: string;
  bgColor: string;
  label: string;
  severity: "info" | "warning" | "critical" | "positive";
}> = {
  refeicao_atrasada:    { icon: "🍽️", accentColor: "text-primary",     borderColor: "border-primary/25",     bgColor: "bg-primary/5",     label: "Refeição",       severity: "info" },
  proteina_baixa:       { icon: "💪", accentColor: "text-destructive", borderColor: "border-destructive/25", bgColor: "bg-destructive/5", label: "Proteína",       severity: "warning" },
  cafe_pulado:          { icon: "☀️", accentColor: "text-accent",      borderColor: "border-accent/25",      bgColor: "bg-accent/5",      label: "Café da manhã",  severity: "info" },
  sexta_alerta:         { icon: "📅", accentColor: "text-primary",     borderColor: "border-primary/25",     bgColor: "bg-primary/5",     label: "Semana",         severity: "info" },
  streak_risco:         { icon: "🔥", accentColor: "text-primary",     borderColor: "border-primary/30",     bgColor: "bg-primary/8",     label: "Streak em risco", severity: "warning" },
  plateau:              { icon: "📊", accentColor: "text-accent",      borderColor: "border-accent/25",      bgColor: "bg-accent/5",      label: "Plateau",        severity: "warning" },
  meta_proxima:         { icon: "🎯", accentColor: "text-primary",     borderColor: "border-primary/30",     bgColor: "bg-primary/8",     label: "Meta próxima",   severity: "positive" },
  deficit_agressivo:    { icon: "⚠️", accentColor: "text-destructive", borderColor: "border-destructive/30", bgColor: "bg-destructive/5", label: "Déficit alto",   severity: "critical" },
  proteina_hipertrofia: { icon: "💪", accentColor: "text-destructive", borderColor: "border-destructive/25", bgColor: "bg-destructive/5", label: "Hipertrofia",    severity: "warning" },
  acolhimento_culpa:    { icon: "💙", accentColor: "text-accent",      borderColor: "border-accent/25",      bgColor: "bg-accent/5",      label: "MCE Comportamental", severity: "positive" },
};

const ALERT_CTAS: Record<string, { label: string; path: string; icon: typeof Utensils }[]> = {
  refeicao_atrasada:    [{ label: "Registrar agora", path: "/meal-log", icon: Utensils }],
  proteina_baixa:       [{ label: "Ver jantar proteico", path: "/meal-plan", icon: Utensils }],
  streak_risco:         [{ label: "Registrar agora", path: "/meal-log", icon: Utensils }],
  plateau:              [{ label: "Ver histórico", path: "/progress", icon: TrendingUp }, { label: "Falar com coach", path: "/chat", icon: MessageSquare }],
  meta_proxima:         [{ label: "Ver progresso", path: "/progress", icon: TrendingUp }],
  deficit_agressivo:    [{ label: "Falar com coach", path: "/chat", icon: MessageSquare }],
  proteina_hipertrofia: [{ label: "Ver plano", path: "/meal-plan", icon: Utensils }],
  acolhimento_culpa:    [{ label: "Registrar refeição", path: "/meal-log", icon: Utensils }, { label: "Conversar", path: "/chat", icon: MessageSquare }],
};

const SEVERITY_BAR: Record<string, string> = {
  info:     "bg-primary",
  warning:  "bg-[hsl(38,80%,52%)]",
  critical: "bg-destructive",
  positive: "bg-accent",
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
    <div className="space-y-2.5 mb-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
          <Brain className="w-3 h-3 text-primary" />
        </div>
        <span className="text-[10px] font-mono text-primary uppercase tracking-wider font-bold">Alertas Inteligentes</span>
        <span className="ml-auto text-[9px] font-mono text-muted-foreground">{alerts.length} ativo{alerts.length !== 1 ? "s" : ""}</span>
      </div>

      <AnimatePresence mode="popLayout">
        {alerts.map((alert, i) => {
          const meta = ALERT_META[alert.tipo_alerta] ?? {
            icon: "🔔",
            accentColor: "text-primary",
            borderColor: "border-primary/20",
            bgColor: "bg-primary/5",
            label: "Alerta",
            severity: "info" as const,
          };
          const ctas = ALERT_CTAS[alert.tipo_alerta] || [];
          const severityBar = SEVERITY_BAR[meta.severity];

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -120, scale: 0.95 }}
              transition={{ delay: i * 0.07, duration: 0.25 }}
              className={`relative rounded-xl border ${meta.borderColor} ${meta.bgColor} overflow-hidden`}
            >
              {/* Left severity bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${severityBar}`} />

              <div className="pl-4 pr-3 py-3">
                {/* Alert header row */}
                <div className="flex items-start gap-2.5 mb-2">
                  <span className="text-lg flex-shrink-0 leading-none mt-0.5">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] font-mono uppercase tracking-wider font-bold ${meta.accentColor}`}>
                        MCE · {meta.label}
                      </span>
                      {meta.severity === "critical" && (
                        <AlertTriangle className="w-2.5 h-2.5 text-destructive" />
                      )}
                      {meta.severity === "positive" && (
                        <Zap className="w-2.5 h-2.5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {alert.mensagem}
                    </p>
                  </div>
                  <button
                    onClick={() => dismiss(alert.id)}
                    className="p-1 rounded-lg hover:bg-foreground/8 transition-colors flex-shrink-0"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>

                {/* CTAs */}
                {ctas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ctas.map(cta => (
                      <button
                        key={cta.path}
                        onClick={() => { dismiss(alert.id); navigate(cta.path); }}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors text-[10px] font-mono border ${
                          meta.severity === "critical"
                            ? "bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
                            : meta.severity === "positive"
                              ? "bg-accent/10 border-accent/20 text-accent hover:bg-accent/20"
                              : "bg-primary/8 border-primary/15 text-primary hover:bg-primary/15"
                        }`}
                      >
                        <cta.icon className="w-2.5 h-2.5" />
                        {cta.label}
                        <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
