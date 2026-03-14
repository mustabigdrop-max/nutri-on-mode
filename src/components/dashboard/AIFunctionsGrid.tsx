import { motion } from "framer-motion";
import { usePlanGate } from "@/hooks/usePlanGate";
import { Lock, Brain, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type AIFunction = {
  key: string;
  emoji: string;
  label: string;
  desc: string;
  requiredPlan: "free" | "ON" | "ON +" | "ON PRO";
  relatedPage?: string;
};

const AI_FUNCTIONS: AIFunction[] = [
  // Free
  { key: "analyze-meal", emoji: "📸", label: "Análise de Refeição", desc: "IA analisa foto e estima macros", requiredPlan: "free", relatedPage: "/meal-log" },
  { key: "onboarding-chat", emoji: "👋", label: "Onboarding Inteligente", desc: "Chat guiado para configuração inicial", requiredPlan: "free", relatedPage: "/onboarding" },
  { key: "faq-search", emoji: "❓", label: "Busca FAQ", desc: "Pesquisa inteligente de dúvidas", requiredPlan: "free", relatedPage: "/support" },

  // ON
  { key: "nutri-coach", emoji: "🤖", label: "NutriCoach IA", desc: "Chat nutricional com contexto completo", requiredPlan: "ON", relatedPage: "/chat" },
  { key: "generate-meal-plan", emoji: "🍎", label: "Gerar Plano Alimentar", desc: "Cardápio semanal personalizado por IA", requiredPlan: "ON", relatedPage: "/meal-plan" },
  { key: "generate-challenges", emoji: "🎮", label: "Gerar Desafios", desc: "Desafios diários personalizados", requiredPlan: "ON", relatedPage: "/gamification" },
  { key: "generate-missions", emoji: "🎯", label: "Gerar Missões", desc: "Missões semanais adaptativas", requiredPlan: "ON", relatedPage: "/gamification" },
  { key: "generate-alerts", emoji: "🔔", label: "Alertas Inteligentes", desc: "Notificações proativas baseadas em padrão", requiredPlan: "ON" },
  { key: "generate-proactive-notification", emoji: "💡", label: "Notificação Proativa", desc: "IA sugere ações antes de acontecer", requiredPlan: "ON" },
  { key: "perplexity-search", emoji: "🔍", label: "Busca Avançada", desc: "Pesquisa científica com IA", requiredPlan: "ON", relatedPage: "/chat" },

  // ON+
  { key: "generate-consistency-score", emoji: "📊", label: "Score Consistência", desc: "Análise semanal de aderência", requiredPlan: "ON +", relatedPage: "/progress" },
  { key: "generate-sabotage-report", emoji: "🚨", label: "Diagnóstico Sabotagem", desc: "Identifica padrões de autossabotagem", requiredPlan: "ON +" },
  { key: "generate-monthly-report", emoji: "📈", label: "Relatório Mensal", desc: "Análise completa do mês com projeções", requiredPlan: "ON +", relatedPage: "/monthly-report" },
  { key: "generate-circadian-plan", emoji: "🌅", label: "Plano Circadiano", desc: "Nutrição sincronizada com relógio biológico", requiredPlan: "ON +", relatedPage: "/circadian" },
  { key: "generate-supplement-stack", emoji: "💊", label: "Stack de Suplementos", desc: "Suplementação personalizada por IA", requiredPlan: "ON +", relatedPage: "/supplementation" },
  { key: "generate-energy-insights", emoji: "⚡", label: "Insights de Energia", desc: "Correlações entre alimentação e disposição", requiredPlan: "ON +", relatedPage: "/mental-performance" },
  { key: "generate-nootropic-stack", emoji: "🧠", label: "Stack Nootrópico", desc: "Protocolo cognitivo personalizado", requiredPlan: "ON +", relatedPage: "/mental-performance" },
  { key: "generate-focus-protocol", emoji: "🎯", label: "Protocolo de Foco", desc: "Nutrição otimizada para concentração", requiredPlan: "ON +", relatedPage: "/mental-performance" },
  { key: "generate-event-strategy", emoji: "📅", label: "Estratégia de Evento", desc: "Plano nutricional pré/durante/pós evento", requiredPlan: "ON +", relatedPage: "/event-mode" },
  { key: "generate-plan-revision", emoji: "🔄", label: "Revisão de Plano", desc: "Ajuste automático baseado em resultados", requiredPlan: "ON +" },
  { key: "analyze-blood-test", emoji: "🩸", label: "Análise de Exames", desc: "IA interpreta seus exames de sangue", requiredPlan: "ON +", relatedPage: "/blood-test" },
  { key: "glp1-ai-analysis", emoji: "💉", label: "Análise GLP-1", desc: "Otimização nutricional com agonistas", requiredPlan: "ON +", relatedPage: "/glp1" },
  { key: "detect-abandonment-risk", emoji: "⚠️", label: "Detecção de Risco", desc: "Prevê risco de abandono do protocolo", requiredPlan: "ON +" },
  { key: "send-recovery-notifications", emoji: "💬", label: "Recuperação Ativa", desc: "Notificações de reengajamento", requiredPlan: "ON +" },
  { key: "process-voice-checkin", emoji: "🎤", label: "Check-in por Voz", desc: "Registro de refeição por áudio", requiredPlan: "ON +" },
  { key: "generate-pca-result", emoji: "🧪", label: "Análise PCA", desc: "Componentes principais do seu perfil", requiredPlan: "ON +" },

  // ON PRO
  { key: "generate-performance-protocol", emoji: "🏋️", label: "Protocolo Performance", desc: "Nutrição avançada para atletas", requiredPlan: "ON PRO", relatedPage: "/performance-pro" },
  { key: "generate-coach-briefing", emoji: "🩺", label: "Briefing do Coach", desc: "Resumo semanal para o profissional", requiredPlan: "ON PRO", relatedPage: "/professional" },
  { key: "kiwify-webhook", emoji: "🔗", label: "Integração Kiwify", desc: "Webhook de pagamento automático", requiredPlan: "ON PRO" },
];

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "FREE", color: "text-muted-foreground bg-secondary" },
  ON: { label: "ON", color: "text-primary bg-primary/10" },
  "ON +": { label: "ON+", color: "text-accent bg-accent/10" },
  "ON PRO": { label: "PRO", color: "text-destructive bg-destructive/10" },
};

const AIFunctionsGrid = () => {
  const { hasAccess } = usePlanGate();
  const [expanded, setExpanded] = useState(false);

  const visibleFunctions = expanded ? AI_FUNCTIONS : AI_FUNCTIONS.slice(0, 6);
  const totalUnlocked = AI_FUNCTIONS.filter(f => hasAccess(f.requiredPlan)).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.15 }}
      className="mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-4 h-px bg-accent" />
          <h3 className="text-[10px] font-mono text-accent uppercase tracking-[.2em]">Motor IA</h3>
          <Brain className="w-3.5 h-3.5 text-accent" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-muted-foreground">
            {totalUnlocked}/{AI_FUNCTIONS.length} ativas
          </span>
          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(totalUnlocked / AI_FUNCTIONS.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {visibleFunctions.map((fn, i) => {
          const unlocked = hasAccess(fn.requiredPlan);
          const planInfo = PLAN_LABELS[fn.requiredPlan];

          return (
            <motion.div
              key={fn.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
              className={`relative rounded-xl border p-3 transition-all group overflow-hidden ${
                unlocked
                  ? "border-border bg-card hover:border-accent/30 cursor-default"
                  : "border-border/50 bg-card/40 opacity-60"
              }`}
            >
              {/* Plan badge */}
              <span className={`absolute top-2 right-2 text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-full ${planInfo.color}`}>
                {planInfo.label}
              </span>

              {!unlocked && (
                <Lock className="w-3 h-3 text-muted-foreground absolute bottom-2 right-2" />
              )}

              {/* Active pulse */}
              {unlocked && (
                <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              )}

              <div className="flex items-start gap-2 mt-1">
                <span className="text-xl leading-none">{fn.emoji}</span>
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-[11px] font-bold text-foreground leading-tight mb-0.5 truncate">{fn.label}</p>
                  <p className="text-[8px] font-mono text-muted-foreground leading-snug line-clamp-2">{fn.desc}</p>
                </div>
              </div>

              {/* Shimmer on unlocked */}
              {unlocked && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent pointer-events-none"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Toggle expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-card hover:border-accent/20 transition-all group"
      >
        <span className="text-[10px] font-mono text-muted-foreground group-hover:text-accent transition-colors">
          {expanded ? "Mostrar menos" : `Ver todas as ${AI_FUNCTIONS.length} funções IA`}
        </span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
        )}
      </button>
    </motion.div>
  );
};

export default AIFunctionsGrid;
