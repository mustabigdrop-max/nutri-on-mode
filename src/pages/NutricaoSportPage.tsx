import { useState, useRef, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import ChatMessage from "@/components/chat/ChatMessage";
import { ArrowLeft, Send, Dumbbell, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

const SPORT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nutricao-sport`;

type Msg = { role: "user" | "assistant"; content: string };

const SPORTS = [
  { key: "musculacao", label: "Musculação", emoji: "💪" },
  { key: "corrida", label: "Corrida", emoji: "🏃" },
  { key: "crossfit", label: "CrossFit", emoji: "🔥" },
  { key: "futebol", label: "Futebol", emoji: "⚽" },
  { key: "ciclismo", label: "Ciclismo", emoji: "🚴" },
  { key: "bjj", label: "Artes Marciais", emoji: "🥊" },
  { key: "natacao", label: "Natação", emoji: "🏊" },
  { key: "triathlon", label: "Triathlon", emoji: "🏅" },
];

const SPORT_SUGGESTIONS: Record<string, string[]> = {
  musculacao: [
    "Qual o melhor pré-treino para musculação em cutting?",
    "Protocolo de carb cycling para hipertrofia",
    "Suplementação ideal para recomposição corporal",
    "Timing de proteína pós-treino: whey vs refeição sólida?",
  ],
  corrida: [
    "Como fazer carb loading para uma maratona?",
    "Nutrição intra-corrida para meia maratona",
    "Protocolo de ferro para corredores de alto volume",
    "Melhor estratégia de hidratação em corrida no calor",
  ],
  crossfit: [
    "Nutrição entre WODs em dia de competição",
    "Melhor pré-treino para WODs de alta intensidade",
    "Protocolo de carbo para AMRAPs longos",
    "Suplementação com beta-alanina: como fazer loading?",
  ],
  futebol: [
    "Protocolo nutricional para dia de jogo",
    "O que comer no intervalo do jogo?",
    "Recuperação nutricional entre jogos em 48h",
    "Hidratação ideal para treino em temperatura alta",
  ],
  ciclismo: [
    "Como treinar o intestino para 90g carbo/hora?",
    "Nutrição para saídas longas de mais de 3 horas",
    "Protocolo de nitrato/beterraba para ciclistas",
    "Fat adaptation: quando vale a pena?",
  ],
  bjj: [
    "Protocolo de corte de peso seguro para BJJ",
    "Rehidratação pós-pesagem em 4 horas",
    "Nutrição para treino duplo: BJJ + musculação",
    "Suplementação para saúde articular em lutadores",
  ],
  natacao: [
    "O que comer antes de treino às 5h da manhã?",
    "Protocolo nutricional para nadadores de alto volume",
    "Como lidar com a fome pós-treino na natação?",
    "Suplementação de ferro para nadadores",
  ],
  triathlon: [
    "Nutrição intra-prova para Ironman completo",
    "Protocolo de taper nutricional pré-Ironman",
    "Como treinar o GI para alto volume de carbo?",
    "Estratégia de cafeína para prova de 8-17 horas",
  ],
};

const SPORT_PHASES: Record<string, { key: string; label: string }[]> = {
  musculacao: [
    { key: "bulk", label: "Bulk" },
    { key: "cutting", label: "Cutting" },
    { key: "recomp", label: "Recomposição" },
    { key: "manutencao", label: "Manutenção" },
  ],
  corrida: [
    { key: "base", label: "Base / Volume" },
    { key: "intensidade", label: "Intensidade" },
    { key: "taper", label: "Taper pré-prova" },
    { key: "recuperacao", label: "Recuperação" },
  ],
  crossfit: [
    { key: "forca", label: "Bloco de Força" },
    { key: "condicionamento", label: "Condicionamento" },
    { key: "competicao", label: "Pré-competição" },
    { key: "manutencao", label: "Manutenção" },
  ],
  futebol: [
    { key: "pre_temporada", label: "Pré-temporada" },
    { key: "temporada", label: "Em temporada" },
    { key: "dia_jogo", label: "Semana de jogo" },
    { key: "ferias", label: "Férias / Off" },
  ],
  ciclismo: [
    { key: "base", label: "Base / Volume" },
    { key: "build", label: "Build / Intensidade" },
    { key: "taper", label: "Taper pré-prova" },
    { key: "recuperacao", label: "Recuperação" },
  ],
  bjj: [
    { key: "treino_normal", label: "Treino regular" },
    { key: "pre_competicao", label: "Pré-competição" },
    { key: "corte_peso", label: "Corte de peso" },
    { key: "recuperacao", label: "Recuperação" },
  ],
  natacao: [
    { key: "volume", label: "Volume alto" },
    { key: "intensidade", label: "Intensidade" },
    { key: "taper", label: "Taper pré-prova" },
    { key: "recuperacao", label: "Recuperação" },
  ],
  triathlon: [
    { key: "base", label: "Base / Volume" },
    { key: "build", label: "Build / Específico" },
    { key: "taper", label: "Taper pré-prova" },
    { key: "recuperacao", label: "Recuperação" },
  ],
};

const LEVELS = [
  { key: "iniciante", label: "Iniciante" },
  { key: "intermediario", label: "Intermediário" },
  { key: "avancado", label: "Avançado" },
  { key: "elite", label: "Elite" },
];

const NutricaoSportPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [selectedSport, setSelectedSport] = useState(profile?.sport || "");
  const [phase, setPhase] = useState("manutencao");
  const [level, setLevel] = useState(profile?.nivel_treino || "intermediario");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const buildUsuario = () => ({
    user_id: user?.id,
    nome: profile?.full_name || "Atleta",
    esporte: selectedSport,
    nivel: level,
    fase: phase,
    peso: profile?.weight_kg || 75,
    altura: profile?.height_cm || 175,
    dias_treino: profile?.training_frequency || 4,
    meta: profile?.goal || "performance",
    perfil_pca: profile?.perfil_comportamental || "AM",
  });

  const send = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isLoading) return;

    const userMsg: Msg = { role: "user", content: msgText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    if (!started) setStarted(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(SPORT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          usuario: buildUsuario(),
          mensagem: msgText,
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (resp.status === 429) { toast.error("Muitas mensagens. Aguarde."); setIsLoading(false); return; }
      if (resp.status === 402) { toast.error("Créditos insuficientes."); setIsLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Erro na conexão");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao conectar com o Nutrição Sport");
    }
    setIsLoading(false);
  };

  const quickStart = (sport: string) => {
    setSelectedSport(sport);
    const sportLabel = SPORTS.find((s) => s.key === sport)?.label || sport;
    send(`Crie meu protocolo nutricional completo para ${sportLabel}, fase ${(SPORT_PHASES[sport] || SPORT_PHASES.musculacao).find(p => p.key === phase)?.label || phase}, nível ${LEVELS.find(l => l.key === level)?.label || level}. Inclua macros, timing, pré/intra/pós treino e suplementação.`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Nutrição Sport</h1>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-accent" />
              <span className="text-[10px] text-accent font-mono">8 modalidades · Perplexity + IA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!started ? (
          <div className="space-y-6">
            {/* Sport Selector */}
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Modalidade</p>
              <div className="grid grid-cols-4 gap-2">
                {SPORTS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSelectedSport(s.key)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center ${
                      selectedSport === s.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-[10px] font-medium leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Phase & Level */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Fase</p>
                <div className="space-y-1.5">
                  {(SPORT_PHASES[selectedSport] || SPORT_PHASES.musculacao).map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPhase(p.key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        phase === p.key
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-card border border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Nível</p>
                <div className="space-y-1.5">
                  {LEVELS.map((l) => (
                    <button
                      key={l.key}
                      onClick={() => setLevel(l.key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        level === l.key
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-card border border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Start */}
            {selectedSport && (
              <button
                onClick={() => quickStart(selectedSport)}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Zap className="w-4 h-4" />
                Gerar Protocolo {SPORTS.find((s) => s.key === selectedSport)?.label}
              </button>
            )}

            {/* Suggestions */}
            {selectedSport && (
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Ou pergunte diretamente</p>
                <div className="space-y-2">
                  {(SPORT_SUGGESTIONS[selectedSport] || []).map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-card border border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} />
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">pesquisando + gerando protocolo...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      {started && (
        <div className="relative z-10 px-4 py-3 border-t border-border bg-background/95 backdrop-blur">
          <div className="flex gap-2 max-w-lg mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Pergunte sobre nutrição esportiva..."
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
};

export default NutricaoSportPage;
