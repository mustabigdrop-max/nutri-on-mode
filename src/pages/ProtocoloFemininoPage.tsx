import { useState, useRef, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useFeminineProfile } from "@/hooks/useFeminineProfile";
import ChatMessage from "@/components/chat/ChatMessage";
import { ArrowLeft, Send, Heart, Loader2, Sparkles, Moon, Sun, Flower2, Baby } from "lucide-react";
import { toast } from "sonner";

const FEM_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/protocolo-feminino`;

type Msg = { role: "user" | "assistant"; content: string };

const PHASES = [
  { key: "menstruacao", label: "Menstruação", emoji: "🔴", icon: Moon, desc: "Dias 1-5", color: "text-red-400" },
  { key: "folicular", label: "Folicular", emoji: "🌱", icon: Sun, desc: "Dias 6-13", color: "text-emerald-400" },
  { key: "ovulacao", label: "Ovulação", emoji: "⚡", icon: Sparkles, desc: "Dias 13-16", color: "text-amber-400" },
  { key: "lutea", label: "Lútea", emoji: "🌙", icon: Moon, desc: "Dias 17-28", color: "text-purple-400" },
];

const CONTEXTS = [
  { key: "ciclo", label: "Ciclo Natural", emoji: "🔄" },
  { key: "aco", label: "Anticoncepcional", emoji: "💊" },
  { key: "menopausa", label: "Menopausa", emoji: "🔥" },
];

const ACO_TYPES = [
  { key: "pilula_combinada", label: "Pílula combinada" },
  { key: "mini_pilula", label: "Mini-pílula" },
  { key: "diu_hormonal", label: "DIU hormonal (Mirena)" },
  { key: "adesivo", label: "Adesivo / Anel" },
  { key: "injecao", label: "Injeção" },
];

const MENOPAUSE_TYPES = [
  { key: "perimenopausa", label: "Perimenopausa" },
  { key: "menopausa", label: "Menopausa" },
];

const SUGGESTIONS: Record<string, string[]> = {
  menstruacao: [
    "Protocolo anti-inflamatório para cólicas menstruais",
    "Suplementação de ferro: quando e como fazer?",
    "Treino na menstruação: devo reduzir?",
    "Alimentos que pioram ou melhoram cólicas",
  ],
  folicular: [
    "Como aproveitar a janela anabólica da folicular?",
    "Protocolo de cutting adaptado à fase folicular",
    "Ergogênicos de máxima eficácia nesta fase",
    "Timing de treino e nutrição para hipertrofia",
  ],
  ovulacao: [
    "Protocolo de proteção articular na ovulação",
    "Colágeno + Vit C: dose e timing correto",
    "Posso tentar PRs na ovulação? Risco de lesão?",
    "Nutrição para suportar treinos intensos nesta janela",
  ],
  lutea: [
    "Estratégia anti-craving que realmente funciona",
    "Retenção hídrica: como diferenciar de ganho de gordura?",
    "Suplementação para reduzir TPM (magnésio, B6, cálcio)",
    "Treino na lútea: como adaptar sem perder progresso?",
  ],
};

const ProtocoloFemininoPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { profile: femProfile, saveProfile: saveFemProfile } = useFeminineProfile();
  const navigate = useNavigate();

  const [context, setContext] = useState("ciclo");
  const [phase, setPhase] = useState(femProfile?.fase_ciclo || "folicular");
  const [acoType, setAcoType] = useState(femProfile?.anticoncepcional || "nao");
  const [menoType, setMenoType] = useState(femProfile?.menopausa || "nao");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (femProfile) {
      setPhase(femProfile.fase_ciclo || "folicular");
      if (femProfile.menopausa !== "nao") {
        setContext("menopausa");
        setMenoType(femProfile.menopausa);
      } else if (femProfile.anticoncepcional !== "nao") {
        setContext("aco");
        setAcoType(femProfile.anticoncepcional);
      }
    }
  }, [femProfile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const buildUsuario = () => ({
    user_id: user?.id,
    nome: profile?.full_name || "Atleta",
    peso: profile?.weight_kg || 60,
    altura: profile?.height_cm || 165,
    esporte: profile?.sport || "musculacao",
    fase: profile?.goal || "manutencao",
    dias_treino: profile?.training_frequency || 4,
    perfil_pca: profile?.perfil_comportamental || "AM",
    ciclo: context === "ciclo" ? "regular" : context === "aco" ? "regulado" : "ausente",
    fase_ciclo: phase,
    duracao_ciclo: femProfile?.duracao_ciclo || 28,
    anticoncepcional: context === "aco" ? acoType : "nao",
    menopausa: context === "menopausa" ? menoType : "nao",
    tpm_severa: femProfile?.tpm_severa || false,
    triada_suspeita: femProfile?.triada_suspeita || false,
  });

  const send = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isLoading) return;

    // Save feminine profile context
    saveFemProfile({
      fase_ciclo: phase,
      anticoncepcional: context === "aco" ? acoType : "nao",
      menopausa: context === "menopausa" ? menoType : "nao",
    });

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
      const resp = await fetch(FEM_URL, {
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
      toast.error("Erro ao conectar com o Protocolo Feminino");
    }
    setIsLoading(false);
  };

  const quickStart = () => {
    const phaseLabel = PHASES.find((p) => p.key === phase)?.label || phase;
    const contextLabel = context === "aco" ? `com ${ACO_TYPES.find(a => a.key === acoType)?.label || "anticoncepcional"}` :
      context === "menopausa" ? `em ${MENOPAUSE_TYPES.find(m => m.key === menoType)?.label || "menopausa"}` :
      `na fase ${phaseLabel}`;
    send(`Gere meu protocolo feminino completo ${contextLabel}. Inclua nutrição adaptada, ergogênicos da fase, ajustes de treino e suplementação específica. Quero entender o que está acontecendo hormonalmente e como otimizar.`);
  };

  const currentPhase = PHASES.find((p) => p.key === phase);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/20 flex items-center justify-center">
            <Flower2 className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Protocolo Feminino</h1>
            <div className="flex items-center gap-1.5">
              <Heart className="w-3 h-3 text-pink-400" />
              <span className="text-[10px] text-pink-400 font-mono">Ciclo · Ergogênicos · Evidência Científica</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!started ? (
          <div className="space-y-6">
            {/* Context Selector */}
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Contexto hormonal</p>
              <div className="grid grid-cols-3 gap-2">
                {CONTEXTS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setContext(c.key)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center ${
                      context === c.key
                        ? "border-pink-500/50 bg-pink-500/10 text-pink-400"
                        : "border-border bg-card text-muted-foreground hover:border-pink-500/30"
                    }`}
                  >
                    <span className="text-xl">{c.emoji}</span>
                    <span className="text-[10px] font-medium leading-tight">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ACO Type */}
            {context === "aco" && (
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Tipo de anticoncepcional</p>
                <div className="space-y-1.5">
                  {ACO_TYPES.map((a) => (
                    <button
                      key={a.key}
                      onClick={() => setAcoType(a.key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        acoType === a.key
                          ? "bg-pink-500/10 text-pink-400 border border-pink-500/30"
                          : "bg-card border border-border text-muted-foreground hover:border-pink-500/30"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Menopause Type */}
            {context === "menopausa" && (
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Estágio</p>
                <div className="space-y-1.5">
                  {MENOPAUSE_TYPES.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setMenoType(m.key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        menoType === m.key
                          ? "bg-pink-500/10 text-pink-400 border border-pink-500/30"
                          : "bg-card border border-border text-muted-foreground hover:border-pink-500/30"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phase Selector (always shown for cycle context, simplified for ACO) */}
            {(context === "ciclo" || context === "aco") && (
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                  {context === "aco" ? "Fase da cartela" : "Fase do ciclo"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PHASES.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPhase(p.key)}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                        phase === p.key
                          ? "border-pink-500/50 bg-pink-500/10"
                          : "border-border bg-card hover:border-pink-500/30"
                      }`}
                    >
                      <span className="text-lg">{p.emoji}</span>
                      <div className="text-left">
                        <span className={`text-xs font-bold ${phase === p.key ? p.color : "text-foreground"}`}>{p.label}</span>
                        <p className="text-[9px] text-muted-foreground font-mono">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phase Info Card */}
            {currentPhase && context !== "menopausa" && (
              <div className={`p-4 rounded-xl border bg-card/50 ${phase === "menstruacao" ? "border-red-500/20" : phase === "folicular" ? "border-emerald-500/20" : phase === "ovulacao" ? "border-amber-500/20" : "border-purple-500/20"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{currentPhase.emoji}</span>
                  <span className={`text-sm font-bold ${currentPhase.color}`}>{currentPhase.label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{currentPhase.desc}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {phase === "menstruacao" && "Hormônios em mínima. Foco em anti-inflamatório, ferro e conforto."}
                  {phase === "folicular" && "Estrogênio subindo. Melhor fase para treinos pesados e déficit."}
                  {phase === "ovulacao" && "Pico hormonal. Máxima força mas atenção articular (LCA)."}
                  {phase === "lutea" && "Progesterona domina. TDEE +100-300kcal. Cravings são fisiológicos."}
                </p>
              </div>
            )}

            {/* Quick Start */}
            <button
              onClick={quickStart}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              Gerar Protocolo Feminino
            </button>

            {/* Suggestions */}
            {(context === "ciclo" || context === "aco") && (
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Ou pergunte diretamente</p>
                <div className="space-y-2">
                  {(SUGGESTIONS[phase] || SUGGESTIONS.folicular).map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-card border border-border text-xs text-muted-foreground hover:border-pink-500/40 hover:text-foreground transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Differentiator badge */}
            <div className="text-center py-3">
              <span className="text-[10px] font-mono text-pink-400/60 uppercase tracking-widest">
                Único app brasileiro com periodização pelo ciclo menstrual
              </span>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} />
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <Flower2 className="w-3.5 h-3.5 text-pink-400" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-pink-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-pink-400/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-pink-400/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">pesquisando evidência + gerando protocolo...</span>
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
              placeholder="Pergunte sobre seu ciclo, nutrição, ergogênicos..."
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center disabled:opacity-50 transition-all"
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

export default ProtocoloFemininoPage;
