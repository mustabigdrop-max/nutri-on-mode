import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles, Clock, Search, MessageSquare, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  SUBSTITUTION_BANK,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  type FoodCategory,
} from "@/data/substitutionBank";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/substitution-agent`;

const SubstitutionsAgentPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"banco" | "chat">("banco");
  const [activeMeal, setActiveMeal] = useState(SUBSTITUTION_BANK[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<FoodCategory | "all">("all");

  // chat
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const meal = SUBSTITUTION_BANK.find((m) => m.id === activeMeal)!;

  const filteredMains = meal.mains.map((main) => ({
    ...main,
    substitutes: main.substitutes.filter((s) => {
      const matchCat = filterCategory === "all" || s.category === filterCategory;
      const matchSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        main.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    }),
  }));

  const allCategories: FoodCategory[] = [
    "ave", "carne vermelha", "porco", "peixe", "frutos do mar",
    "laticínios", "shake", "fruta", "legume", "vegetal",
  ];

  const askAgent = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Muitas requisições. Aguarde alguns segundos.");
        else if (resp.status === 402) toast.error("Créditos esgotados.");
        else toast.error("Erro ao consultar agente.");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantSoFar = "";
      let done = false;

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Falha de conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Quero substituir o frango do almoço por algo diferente",
    "Me dê opções de peixe para o jantar",
    "O que posso comer no pós-treino imediato sem ser shake?",
    "Variedade de frutas para o café da manhã",
    "Substitutos para o feijão no pós-treino sólido",
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold">Substituições NUTRION</h1>
            </div>
            <p className="text-xs text-muted-foreground">Banco expandido v2.0 — variedade real por refeição</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-3 flex gap-2">
          <button
            onClick={() => setTab("banco")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "banco" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Banco
          </button>
          <button
            onClick={() => setTab("chat")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "chat" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Agente
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4">
        {tab === "banco" ? (
          <div className="space-y-4">
            {/* Refeições */}
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {SUBSTITUTION_BANK.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMeal(m.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeMeal === m.id
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span className="font-bold">{m.time}</span>
                    </div>
                    <div className="mt-0.5">{m.label}</div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            {/* Header refeição */}
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">{meal.id.toUpperCase()}</div>
                  <div className="text-xl font-bold mt-1">{meal.label}</div>
                  <div className="text-sm text-muted-foreground">{meal.time} · {meal.kcal} kcal</div>
                </div>
              </div>
              {meal.protocol && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-200">
                  ⚡ <strong>Protocolo:</strong> {meal.protocol}
                </div>
              )}
            </Card>

            {/* Filtros */}
            <div className="space-y-2">
              <Input
                placeholder="Buscar alimento ou substituto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card"
              />
              <ScrollArea className="w-full">
                <div className="flex gap-1.5 pb-2">
                  <button
                    onClick={() => setFilterCategory("all")}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${
                      filterCategory === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground"
                    }`}
                  >
                    Todas
                  </button>
                  {allCategories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilterCategory(c)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${
                        filterCategory === c
                          ? "bg-primary text-primary-foreground border-primary"
                          : `${CATEGORY_COLORS[c]}`
                      }`}
                    >
                      {CATEGORY_ICONS[c]} {c}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Lista de mains */}
            <div className="space-y-4">
              {filteredMains.map((main, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <div className="p-4 bg-card border-b border-border">
                    <div className="font-bold text-sm">{main.name}</div>
                    {main.note && (
                      <div className="text-xs text-muted-foreground mt-1 italic">{main.note}</div>
                    )}
                  </div>
                  {main.substitutes.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      Nenhum substituto com este filtro
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {main.substitutes.map((sub, sIdx) => (
                        <motion.div
                          key={sIdx}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: sIdx * 0.02 }}
                          className="p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{sub.name}</span>
                                <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[sub.category]}`}>
                                  {CATEGORY_ICONS[sub.category]} {sub.category}
                                </Badge>
                              </div>
                              <div className="text-xs text-primary mt-1 font-mono">{sub.portion}</div>
                              <div className="text-xs text-muted-foreground mt-1">{sub.note}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // CHAT
          <div className="flex flex-col h-[calc(100vh-200px)]">
            <ScrollArea className="flex-1 pr-2" ref={scrollRef as any}>
              <div className="space-y-4 pb-4">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <Card className="p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="font-bold text-sm">Agente de Substituições</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pergunte sobre qualquer alimento do seu plano. Eu ofereço de 3 a 5 substitutos com
                        variedade real de categorias (peixes, aves, carnes, porco, laticínios, frutas, shakes...).
                      </p>
                    </Card>

                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Sugestões rápidas
                      </div>
                      {quickPrompts.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => askAgent(p)}
                          className="w-full text-left p-3 bg-card border border-border rounded-lg text-sm hover:border-primary transition-all"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border"
                        }`}
                      >
                        {m.role === "assistant" ? (
                          <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-2 prose-strong:text-primary">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        ) : (
                          m.content
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-2xl px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-2 border-t border-border">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askAgent(input)}
                placeholder="Pergunte sobre uma substituição..."
                disabled={isLoading}
                className="bg-card"
              />
              <Button
                onClick={() => askAgent(input)}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SubstitutionsAgentPage;
