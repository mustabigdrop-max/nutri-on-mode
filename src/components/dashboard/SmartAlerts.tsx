import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Brain, X, ChevronRight, MessageSquare, TrendingUp, Utensils } from "lucide-react";

interface Alert {
  id: string;
  tipo_alerta: string;
  mensagem: string;
  lido: boolean;
  enviado_em: string;
}

const ALERT_ICONS: Record<string, string> = {
  refeicao_atrasada: "🍽️",
  proteina_baixa: "💪",
  cafe_pulado: "☀️",
  sexta_alerta: "📅",
  streak_risco: "🔥",
  plateau: "📊",
  meta_proxima: "🎯",
  deficit_agressivo: "⚠️",
  proteina_hipertrofia: "💪",
  acolhimento_culpa: "💙",
};

const ALERT_COLORS: Record<string, string> = {
  deficit_agressivo: "border-destructive/30 bg-destructive/5",
  proteina_hipertrofia: "border-destructive/30 bg-destructive/5",
  streak_risco: "border-primary/30 bg-primary/5",
  meta_proxima: "border-primary/30 bg-primary/5",
  acolhimento_culpa: "border-accent/30 bg-accent/5",
};

const ALERT_CTAS: Record<string, { label: string; path: string; icon: typeof Utensils }[]> = {
  refeicao_atrasada: [
    { label: "Registrar agora", path: "/meal-log", icon: Utensils },
  ],
  proteina_baixa: [
    { label: "Ver opções de jantar", path: "/meal-plan", icon: Utensils },
  ],
  streak_risco: [
    { label: "Registrar agora", path: "/meal-log", icon: Utensils },
  ],
  plateau: [
    { label: "Ver histórico", path: "/progress", icon: TrendingUp },
    { label: "Falar com coach", path: "/chat", icon: MessageSquare },
  ],
  meta_proxima: [
    { label: "Ver progresso", path: "/progress", icon: TrendingUp },
  ],
  deficit_agressivo: [
    { label: "Falar com coach", path: "/chat", icon: MessageSquare },
  ],
  proteina_hipertrofia: [
    { label: "Ver plano", path: "/meal-plan", icon: Utensils },
  ],
  acolhimento_culpa: [
    { label: "Registrar refeição", path: "/meal-log", icon: Utensils },
    { label: "Quero conversar", path: "/chat", icon: MessageSquare },
  ],
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
      // Trigger alert generation
      await supabase.functions.invoke("generate-alerts");
      // Fetch unread alerts
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
          const colorClass = ALERT_COLORS[alert.tipo_alerta] || "border-primary/20 bg-primary/5";
          const icon = ALERT_ICONS[alert.tipo_alerta] || "🔔";
          const ctas = ALERT_CTAS[alert.tipo_alerta] || [];

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.95 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl border ${colorClass} p-4 relative`}
            >
              <button
                onClick={() => dismiss(alert.id)}
                className="absolute top-2 right-2 p-1 rounded-lg hover:bg-foreground/5 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <div className="flex items-start gap-3 pr-6">
                <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {alert.mensagem}
                  </p>

                  {ctas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {ctas.map(cta => (
                        <button
                          key={cta.path}
                          onClick={() => {
                            dismiss(alert.id);
                            navigate(cta.path);
                          }}
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
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
