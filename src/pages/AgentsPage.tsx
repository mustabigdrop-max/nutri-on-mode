import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Zap, TrendingDown, Dumbbell, Trophy, Heart, Users, ChevronRight, MessageSquare, ExternalLink } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";

interface Agent {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  expertise: string[];
  icon: typeof Brain;
  color: string;
  accentBg: string;
  accentBorder: string;
  action: { label: string; path: string; prompt?: string };
  badge?: string;
}

const AGENTS: Agent[] = [
  {
    id: "mce",
    name: "NutriCoach MCE",
    subtitle: "Motor Comportamental Especializado",
    description:
      "Agente principal de coaching nutricional. Analisa seu histórico, padrões alimentares e responde com base no seu protocolo ativo. Especialista em TCC nutricional e mudança comportamental.",
    expertise: ["TCC Nutricional", "Padrões alimentares", "Mindful eating", "Histórico real"],
    icon: Brain,
    color: "hsl(var(--primary))",
    accentBg: "bg-primary/5",
    accentBorder: "border-primary/20",
    action: { label: "Abrir chat MCE", path: "/chat" },
    badge: "Principal",
  },
  {
    id: "cutting",
    name: "Agente Corte",
    subtitle: "Especialista em Déficit e Definição",
    description:
      "Protocolo de cutting avançado. Calcula déficit ideal por fase, estratégias anti-catabolismo, timing de refeeds e gerenciamento de adapatação metabólica. Para atletas e bodybuilders.",
    expertise: ["Déficit calórico", "Anti-catabolismo", "Refeeds", "Adaptação metabólica"],
    icon: TrendingDown,
    color: "#00f0b4",
    accentBg: "bg-[#00f0b4]/5",
    accentBorder: "border-[#00f0b4]/20",
    action: {
      label: "Consultar Agente Corte",
      path: "/chat",
      prompt: "Quero iniciar uma consulta com o Agente Corte especializado. Analise meu perfil atual e me dê um diagnóstico do meu protocolo de cutting: déficit atual, risco de catabolismo, necessidade de refeed e estratégia de periodização para as próximas semanas.",
    },
  },
  {
    id: "hypertrophy",
    name: "Agente Hipertrofia",
    subtitle: "Especialista em Ganho de Massa Muscular",
    description:
      "Otimização de superávit calórico, distribuição de macros por treino, janela anabólica, sincronização de nutrição com periodização de treino. FFMI tracking e projeções de ganho.",
    expertise: ["Superávit limpo", "Janela anabólica", "Periodização nutricional", "FFMI"],
    icon: Dumbbell,
    color: "#e8a020",
    accentBg: "bg-[#e8a020]/5",
    accentBorder: "border-[#e8a020]/20",
    action: {
      label: "Consultar Agente Hipertrofia",
      path: "/chat",
      prompt: "Quero uma consulta com o Agente Hipertrofia. Com base no meu perfil, treino e histórico alimentar: analise meu superávit atual, distribuição de macros nos dias de treino vs. descanso, e me dê um protocolo de periodização nutricional para maximizar ganho de massa com mínimo de gordura.",
    },
  },
  {
    id: "recomp",
    name: "Agente Recomposição",
    subtitle: "Simultaneous Fat Loss + Muscle Gain",
    description:
      "O protocolo mais complexo. Ciclagem calórica avançada, nutrição por tipo de treino, timing de carboidratos para recomposição. Para atletas com experiência >2 anos.",
    expertise: ["Ciclagem calórica", "Nutrição periodizada", "Carboidratos estratégicos", "Body recomp"],
    icon: Zap,
    color: "#7890ff",
    accentBg: "bg-[#7890ff]/5",
    accentBorder: "border-[#7890ff]/20",
    action: {
      label: "Consultar Agente Recomposição",
      path: "/chat",
      prompt: "Quero uma consulta focada em recomposição corporal simultânea. Analise meu perfil e histórico: sou candidato a recomposição? Qual protocolo de ciclagem calórica se encaixa para mim? Como devo distribuir carboidratos nos dias de treino heavy vs. leve vs. descanso para maximizar recomposição?",
    },
  },
  {
    id: "competition",
    name: "Agente Competição",
    subtitle: "Peak Week & Prep Avançada",
    description:
      "Protocolo completo de preparação para competição: cronograma de depleção, carb loading, manipulação de sódio e água, peak week. Para atletas de bodybuilding e fisiculturismo.",
    expertise: ["Peak week", "Carb loading", "Water manipulation", "Depleção"],
    icon: Trophy,
    color: "#e8a020",
    accentBg: "bg-[#e8a020]/5",
    accentBorder: "border-[#e8a020]/20",
    action: {
      label: "Consultar Agente Competição",
      path: "/chat",
      prompt: "Quero um protocolo de peak week e preparação para competição. Analise minha situação atual e me dê: cronograma de depleção de carboidratos (quando e como), protocolo de carb loading (quantas horas antes, qual fonte, quantidade), manipulação de sódio e água (quando cortar, quando reintroduzir), e como estruturar a semana de competição dia a dia.",
    },
    badge: "PRO",
  },
  {
    id: "tcc",
    name: "Agente TCC",
    subtitle: "Terapia Cognitivo-Comportamental Nutricional",
    description:
      "Especializado em reestruturação cognitiva para comportamentos alimentares. Identifica crenças limitantes, gatilhos emocionais, padrões de sabotagem e aplica técnicas de TCC adaptadas à nutrição.",
    expertise: ["Reestruturação cognitiva", "Gatilhos emocionais", "Anti-sabotagem", "Identidade alimentar"],
    icon: Heart,
    color: "#00f0b4",
    accentBg: "bg-[#00f0b4]/5",
    accentBorder: "border-[#00f0b4]/20",
    action: {
      label: "Sessão TCC",
      path: "/chat",
      prompt: "Quero uma sessão com o Agente TCC Nutricional. Me ajude a identificar meus principais padrões cognitivos que sabotam minha dieta: quais são minhas crenças limitantes sobre alimentação? Quais gatilhos emocionais me levam a comer fora do plano? Que técnicas de TCC posso aplicar especificamente para meu padrão alimentar?",
    },
  },
  {
    id: "coach_pro",
    name: "Agente Coach Pro",
    subtitle: "Ferramentas para Nutricionistas & Coaches",
    description:
      "Ferramentas especializadas para profissionais: geração de anamneses, criação de protocolos personalizados para pacientes, análise de exames, geração de relatórios e textos de feedback.",
    expertise: ["Anamnese inteligente", "Protocolo por paciente", "Análise de exames", "Relatórios"],
    icon: Users,
    color: "hsl(var(--accent))",
    accentBg: "bg-accent/5",
    accentBorder: "border-accent/20",
    action: { label: "Painel Coach Pro", path: "/coach/dashboard" },
    badge: "Coach",
  },
];

const AgentsPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const name = profile?.full_name?.split(" ")[0] || "Piloto";

  const handleAgentAction = (agent: Agent) => {
    if (agent.action.prompt) {
      // Store the prompt so ChatPage can pre-fill it
      sessionStorage.setItem("nutrion-agent-prompt", agent.action.prompt);
    }
    navigate(agent.action.path);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur sticky top-0">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Central de Agentes IA</h1>
          <p className="text-[10px] text-muted-foreground font-mono">Motor MCE · {AGENTS.length} agentes especializados</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-5">

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/15 bg-primary/5 p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Ecossistema NUTRION · MCE</p>
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-bold">{name}</span>, cada agente é especializado em uma área específica.
                Escolha o agente certo para sua necessidade atual.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Agent cards */}
        <div className="space-y-3">
          {AGENTS.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.06 }}
                className={`rounded-xl border ${agent.accentBorder} ${agent.accentBg} overflow-hidden`}
              >
                {/* Top accent */}
                <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${agent.color}50, transparent)` }} />

                <div className="p-4">
                  {/* Agent header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}>
                      <Icon className="w-5 h-5" style={{ color: agent.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-bold text-foreground">{agent.name}</h3>
                        {agent.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[7px] font-mono font-bold uppercase"
                            style={{ background: `${agent.color}20`, color: agent.color, border: `1px solid ${agent.color}30` }}>
                            {agent.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono" style={{ color: `${agent.color}80` }}>{agent.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{agent.description}</p>

                  {/* Expertise chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {agent.expertise.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded text-[8px] font-mono"
                        style={{ background: `${agent.color}10`, color: `${agent.color}90`, border: `1px solid ${agent.color}20` }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action button */}
                  <motion.button
                    onClick={() => handleAgentAction(agent)}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-bold transition-all"
                    style={{
                      background: `${agent.color}12`,
                      border: `1px solid ${agent.color}25`,
                      color: agent.color,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {agent.action.prompt ? <MessageSquare className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                      {agent.action.label}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-[9px] font-mono text-muted-foreground/40 mt-8 pb-4">
          Todos os agentes têm acesso ao seu perfil, protocolo ativo e histórico alimentar.
          <br />Respostas personalizadas. Nenhum agente genérico.
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default AgentsPage;
