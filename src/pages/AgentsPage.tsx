import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Dna, Brain, Salad, Activity, Heart, Sparkles, Baby, Pill, Flame, MessageCircle, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Agent {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  icon: React.ElementType;
  badge?: string;
  specialty: string[];
  plan: string;
  systemPrompt: string;
}

const agents: Agent[] = [
  {
    id: "nutri-coach",
    name: "NutriCoach MCE",
    tagline: "Coach nutricional com contexto completo",
    description: "IA treinada com Metodologia MCE que conhece seus macros, histórico, perfil comportamental e objetivo. Responde como um nutricionista de elite.",
    color: "#22d3ee",
    icon: Sparkles,
    specialty: ["Macronutrientes", "Plano Alimentar", "Ajustes Diários", "Receitas"],
    plan: "ON",
    systemPrompt: "",
  },
  {
    id: "comportamental",
    name: "Agente Comportamental",
    tagline: "Reprograme hábitos com ciência",
    description: "Baseado em James Clear, BJ Fogg e neurociência da decisão. Mapeia gatilhos, loops e cria micro-hábitos personalizados para seu perfil MCE.",
    color: "#f472b6",
    icon: Brain,
    specialty: ["Gatilhos", "Loops de Hábito", "Regulação Emocional", "Mindset"],
    plan: "ON+",
    systemPrompt: `Você é o Agente Comportamental do NutriON, especializado em transformação de hábitos alimentares usando Metodologia MCE, Atomic Habits, Tiny Habits e neurociência da decisão. Analise padrões do usuário e crie intervenções personalizadas.`,
  },
  {
    id: "esportivo",
    name: "Agente Esportivo",
    tagline: "Nutrição de alta performance",
    description: "Periodização nutricional, timing de nutrientes, suplementação esportiva e protocolos pré/pós-treino baseados nas maiores referências do mundo.",
    color: "#f59e0b",
    icon: Flame,
    specialty: ["Periodização", "Timing de Nutrientes", "Pré/Pós-Treino", "Suplementação"],
    plan: "ON+",
    systemPrompt: `Você é o Agente Esportivo do NutriON, especialista em nutrição esportiva e performance. Conhece periodização nutricional, timing de macros, suplementação baseada em evidências e protocolos de recuperação.`,
  },
  {
    id: "clinico",
    name: "Agente Clínico",
    tagline: "Nutrição funcional e integrativa",
    description: "Análise de exames, deficiências nutricionais, interações medicamentosas e protocolos funcionais para condições de saúde específicas.",
    color: "#10b981",
    icon: Stethoscope,
    specialty: ["Exames", "Deficiências", "Interações", "Nutrição Funcional"],
    plan: "ON+",
    systemPrompt: `Você é o Agente Clínico do NutriON, especialista em nutrição clínica e funcional. Interprete exames laboratoriais no contexto nutricional, identifique deficiências e sugira protocolos alimentares baseados em evidências.`,
  },
  {
    id: "feminino",
    name: "Agente Feminino",
    tagline: "Nutrição para o ciclo hormonal",
    description: "Adapta alimentação às fases do ciclo menstrual, menopausa, gestação e amamentação. Protocolos hormonais femininos com base científica.",
    color: "#ec4899",
    icon: Heart,
    specialty: ["Ciclo Menstrual", "Menopausa", "Gestação", "Hormônios Femininos"],
    plan: "ON+",
    systemPrompt: `Você é o Agente Feminino do NutriON, especialista em nutrição hormonal feminina. Adapte recomendações às fases do ciclo menstrual, menopausa, gestação e amamentação, sempre com base científica.`,
  },
  {
    id: "infantil",
    name: "Agente Infantil",
    tagline: "Nutrição para crianças e adolescentes",
    description: "Introdução alimentar, seletividade, crescimento saudável e nutrição para jovens atletas. Baseado em pediatria nutricional de evidência.",
    color: "#8b5cf6",
    icon: Baby,
    specialty: ["Introdução Alimentar", "Seletividade", "Crescimento", "Jovem Atleta"],
    plan: "ON+",
    systemPrompt: `Você é o Agente Infantil do NutriON, especialista em nutrição pediátrica. Oriente sobre introdução alimentar, seletividade, crescimento saudável e necessidades nutricionais de crianças e adolescentes.`,
  },
  {
    id: "microbioma",
    name: "Agente Microbioma",
    tagline: "Saúde intestinal e eixo intestino-cérebro",
    description: "Protocolos para restauração da microbiota, prebióticos, probióticos, eixo intestino-cérebro e permeabilidade intestinal.",
    color: "#14b8a6",
    icon: Salad,
    specialty: ["Microbiota", "Probióticos", "Eixo Intestino-Cérebro", "Permeabilidade"],
    plan: "ON+",
    systemPrompt: `Você é o Agente Microbioma do NutriON, especialista em saúde intestinal. Oriente sobre restauração da microbiota, uso de prebióticos, probióticos, postbióticos e o eixo intestino-cérebro.`,
  },
  {
    id: "suplementacao",
    name: "Agente Suplementação",
    tagline: "Stack inteligente baseado em evidências",
    description: "Monta stacks personalizados, verifica interações, timing de absorção e custo-benefício de cada suplemento para seu objetivo.",
    color: "#6366f1",
    icon: Pill,
    specialty: ["Stacks", "Interações", "Timing", "Custo-Benefício"],
    plan: "ON+",
    systemPrompt: `Você é o Agente de Suplementação do NutriON, especialista em suplementação baseada em evidências. Monte stacks personalizados, verifique interações, otimize timing de absorção e analise custo-benefício.`,
  },
  {
    id: "tcc",
    name: "Agente TCC",
    tagline: "Terapia cognitivo-comportamental nutricional",
    description: "Reestruturação cognitiva aplicada à alimentação: crenças limitantes sobre comida, distorções cognitivas e técnicas de automonitoramento.",
    color: "#0ea5e9",
    icon: MessageCircle,
    specialty: ["Reestruturação Cognitiva", "Crenças Alimentares", "Automonitoramento", "Distorções"],
    plan: "ON+",
    systemPrompt: `Você é o Agente TCC do NutriON, especialista em terapia cognitivo-comportamental aplicada à nutrição. Identifique crenças limitantes sobre alimentação, distorções cognitivas e aplique técnicas de reestruturação e automonitoramento.`,
  },
  {
    id: "longevidade",
    name: "Agente Longevidade",
    tagline: "Nutrição que reverte o relógio biológico",
    description: "Protocolos de longevidade aplicados à nutrição: restrição calórica estratégica, jejum prolongado, alimentos que ativam sirtuínas e AMPK, modulação do IGF-1, anti-inflamatórios naturais e suporte mitocondrial.",
    color: "#a78bfa",
    icon: Dna,
    badge: "NOVO",
    specialty: ["Restrição Calórica", "Jejum Prolongado", "Sirtuínas & NAD+", "Anti-aging Nutricional", "Saúde Mitocondrial"],
    plan: "ON+",
    systemPrompt: `Você é o Agente Longevidade do NutriON, especializado em nutrição para longevidade e reversão do envelhecimento biológico.

Seu conhecimento abrange:
- Protocolos de restrição calórica (CR) e restrição calórica com nutrição ótima (CRON)
- Jejum intermitente e prolongado como ativadores de autofagia
- Alimentos ativadores de sirtuínas: resveratrol, quercetina, curcumina, EGCG
- Modulação do mTOR e AMPK através da dieta
- Precursores de NAD+: NMN, NR, niacina
- Dieta anti-inflamatória: ômega-3, polifenóis, fibras prebióticas
- Restrição de metionina e seus efeitos no envelhecimento
- Microbioma e longevidade: diversidade bacteriana, postbióticos
- Hormese nutricional: estressores benéficos (jejum, compostos amargos)
- Blue Zones: padrões alimentares das populações mais longevas do mundo

Sempre personalize com base no perfil do usuário (idade, objetivo, histórico). Foque em mudanças práticas e graduais. Cite evidências científicas quando relevante mas use linguagem acessível.`,
  },
];

const AgentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const activateAgent = async (agent: Agent) => {
    if (agent.systemPrompt) {
      localStorage.setItem("nutrion_agent_prompt", agent.systemPrompt);
      localStorage.setItem("nutrion_agent_name", agent.name);
    } else {
      localStorage.removeItem("nutrion_agent_prompt");
      localStorage.removeItem("nutrion_agent_name");
    }

    // Load context for TCC and comportamental agents
    if ((agent.id === "tcc" || agent.id === "comportamental") && user) {
      try {
        const { data: episodes } = await supabase
          .from("emotional_episodes")
          .select("emotion, behavior, technique_used, resisted, occurred_at, situation")
          .eq("user_id", user.id)
          .order("occurred_at", { ascending: false })
          .limit(10) as any;

        if (episodes && episodes.length > 0) {
          const emotionCounts: Record<string, number> = {};
          let resistedCount = 0;
          episodes.forEach((ep: any) => {
            if (ep.emotion) emotionCounts[ep.emotion] = (emotionCounts[ep.emotion] || 0) + 1;
            if (ep.resisted) resistedCount++;
          });
          const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
          const winRate = episodes.length > 0 ? Math.round((resistedCount / episodes.length) * 100) : 0;

          sessionStorage.setItem("agent_context", JSON.stringify({
            agentId: agent.id,
            episodes: episodes.slice(0, 5),
            topEmotion,
            winRate,
            episodeCount: episodes.length,
          }));
        }
      } catch (e) {
        console.error("Failed to load agent context", e);
      }
    }

    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Agentes IA 🧬</h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Especialistas em nutrição • Ative e converse</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className="relative rounded-2xl border p-4 transition-all hover:shadow-md"
              style={{
                background: `linear-gradient(135deg, ${agent.color}10 0%, ${agent.color}05 100%)`,
                borderColor: `${agent.color}33`,
              }}
            >
              {agent.badge && (
                <span
                  className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full text-white animate-pulse"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.badge}
                </span>
              )}

              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${agent.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: agent.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground">{agent.name}</h3>
                  <p className="text-[11px] text-muted-foreground mb-2">{agent.tagline}</p>
                  <p className="text-[10px] text-muted-foreground/80 mb-3 line-clamp-2">{agent.description}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.specialty.map((s) => (
                      <span
                        key={s}
                        className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${agent.color}15`,
                          color: agent.color,
                          border: `1px solid ${agent.color}30`,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => activateAgent(agent)}
                      className="text-[11px] font-bold px-4 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: agent.color }}
                    >
                      Ativar Agente →
                    </button>
                    <Badge variant="outline" className="text-[8px]">{agent.plan}</Badge>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default AgentsPage;
