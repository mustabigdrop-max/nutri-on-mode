import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  MessageCircle, BookOpen, Search, Shield, AlertTriangle,
  Send, ChevronDown, ChevronUp, ArrowLeft, Loader2, Sparkles, ExternalLink, Save, Trash2
} from "lucide-react";
import { PeptideNutritionalStrategy } from "@/components/lab/PeptideNutritionalStrategy";
import {
  peptides, protocols, dietRevolutionCards, alerts as initialAlerts,
  quickPrompts, searchSuggestions, type Peptide, type Alert
} from "@/data/peptideVaultData";

type Tab = "oracle" | "encyclopedia" | "research" | "protocols" | "alerts";

const tabConfig: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "oracle", label: "Oracle", icon: <MessageCircle className="w-5 h-5" /> },
  { id: "encyclopedia", label: "Enciclopédia", icon: <BookOpen className="w-5 h-5" /> },
  { id: "research", label: "Pesquisa", icon: <Search className="w-5 h-5" /> },
  { id: "protocols", label: "Protocolos", icon: <Shield className="w-5 h-5" /> },
  { id: "alerts", label: "Alertas", icon: <AlertTriangle className="w-5 h-5" /> },
];

type Msg = { role: "user" | "assistant"; content: string };

export default function PeptideVaultPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("oracle");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0f0a", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/lab")} className="text-[#4ade80]">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-[#4ade80]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            🧬 NEXUS-BIO PeptideVault
          </h1>
          <p className="text-xs text-gray-500">Enciclopédia viva de peptídeos com IA</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "oracle" && <OracleTab userId={user?.id} />}
        {activeTab === "encyclopedia" && <EncyclopediaTab />}
        {activeTab === "research" && <ResearchTab userId={user?.id} />}
        {activeTab === "protocols" && <ProtocolsTab />}
        {activeTab === "alerts" && <AlertsTab userId={user?.id} />}
      </div>

      {/* Bottom Nav */}
      <div className="border-t border-gray-800 bg-[#0a0f0a]/95 backdrop-blur px-2 py-2 flex justify-around">
        {tabConfig.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === t.id ? "text-[#4ade80]" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t.icon}
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ==================== ORACLE TAB ==================== */
function OracleTab({ userId }: { userId?: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const saveMsg = async (role: string, content: string) => {
    if (!userId) return;
    await supabase.from("nexus_bio_messages").insert({ user_id: userId, role, content });
  };

  const saveToNotebook = async (content: string) => {
    if (!userId) return;
    try {
      await supabase.from("nexus_bio_messages").insert({ user_id: userId, role: "notebook", content });
      toast.success("Salvo no caderno!");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);
    await saveMsg("user", userMsg.content);

    let assistantSoFar = "";
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nexus-bio-chat`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-20) }),
      });

      if (!resp.ok || !resp.body) throw new Error("Falha na conexão");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const c = JSON.parse(json).choices?.[0]?.delta?.content;
            if (c) {
              assistantSoFar += c;
              setMessages((p) => {
                const last = p[p.length - 1];
                if (last?.role === "assistant") return p.map((m, i) => (i === p.length - 1 ? { ...m, content: assistantSoFar } : m));
                return [...p, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {}
        }
      }

      if (assistantSoFar) await saveMsg("assistant", assistantSoFar);
    } catch (e: any) {
      toast.error(e.message || "Erro na IA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {messages.length > 0 && (
        <div className="px-4 pt-2 flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearChat} className="text-gray-500 hover:text-red-400 text-xs gap-1">
            <Trash2 className="w-3 h-3" /> Limpar conversa
          </Button>
        </div>
      )}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <div className="text-5xl">🧬</div>
              <h2 className="text-[#4ade80] font-bold text-xl" style={{ fontFamily: "'Space Grotesk'" }}>NEXUS-BIO Oracle</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">Pergunte sobre peptídeos, protocolos, mecanismos moleculares e aplicações práticas.</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {quickPrompts.map((q) => (
                  <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 rounded-full border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/10 transition">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div className={`rounded-xl px-4 py-3 text-sm ${
                  m.role === "user" ? "bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/20" : "bg-gray-900 text-gray-200 border border-gray-800"
                }`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : m.content}
                </div>
                {m.role === "assistant" && !loading && (
                  <button
                    onClick={() => saveToNotebook(m.content)}
                    className="self-start flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#4ade80] transition px-1"
                  >
                    <Save className="w-3 h-3" /> Salvar no caderno
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-1.5 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder="Pergunte ao NEXUS-BIO..."
            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/50"
          />
          <Button onClick={() => send(input)} disabled={loading || !input.trim()} className="bg-[#4ade80] hover:bg-[#22c55e] text-black rounded-xl px-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}



/* ==================== ENCYCLOPEDIA TAB ==================== */
function EncyclopediaTab() {
  const [selected, setSelected] = useState<Peptide | null>(null);
  const [catFilter, setCatFilter] = useState("Todos");
  const [tagFilter, setTagFilter] = useState("todos");
  const [sortBy, setSortBy] = useState<"status" | "name" | "category">("status");

  const filtered = useMemo(() => {
    let list = peptides;
    if (catFilter !== "Todos") list = list.filter(p => p.category === catFilter);
    if (tagFilter !== "todos") list = list.filter(p => p.tags?.includes(tagFilter));
    if (sortBy === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "category") list = [...list].sort((a, b) => a.category.localeCompare(b.category));
    return list;
  }, [catFilter, tagFilter, sortBy]);

  if (selected) {
    return (
      <ScrollArea className="h-full px-4">
        <div className="py-4 space-y-4">
          <Button variant="ghost" onClick={() => setSelected(null)} className="text-[#4ade80] -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk'" }}>{selected.name}</h2>
            <Badge style={{ backgroundColor: `${selected.badgeColor}20`, color: selected.badgeColor, borderColor: `${selected.badgeColor}40` }} className="border text-xs">
              {selected.badge}
            </Badge>
          </div>
          <p className="text-sm text-gray-400">{selected.classe} — {selected.status}</p>

          {[
            { title: "🔬 Descoberta", content: selected.discovery },
            { title: "⚙️ Mecanismo Molecular", content: selected.mechanism },
            { title: "💊 Farmacocinética", content: selected.pharmacokinetics },
            { title: "📊 Dados Clínicos", content: selected.clinicalData },
            { title: "💉 Dosagem", content: selected.dosage },
            { title: "🔗 Sinergias", content: selected.synergies },
            { title: "🍽️ Impacto na Dieta", content: selected.dietImpact, highlight: true },
          ].map((s) => (
            <Card key={s.title} className={`border ${s.highlight ? "" : "border-gray-800 bg-gray-900/50"}`}
              style={s.highlight ? { borderColor: `${selected.color}40`, backgroundColor: `${selected.color}08` } : {}}>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold" style={{ color: s.highlight ? selected.color : "#d1d5db" }}>{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-xs text-gray-400 leading-relaxed">{s.content}</p>
              </CardContent>
            </Card>
          ))}

          <Card className="border border-gray-800 bg-gray-900/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-yellow-400">🔬 Estudos Recentes</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {selected.recentStudies.map((s, i) => (
                <p key={i} className="text-xs text-gray-400">{s}</p>
              ))}
            </CardContent>
          </Card>

          <PeptideNutritionalStrategy
            peptideSlug={
              ({ bpc157: "bpc-157", semaglutide: "semaglutida", tirzepatide: "tirzepatida", ipamorelin: "ipamorelin-cjc1295", cjc1295: "ipamorelin-cjc1295", tb500: "tb-500", follistatin344: "folistatina-344", aod9604: "aod-9604", ghkcu: "ghk-cu", motsc: "mots-c" } as Record<string, string>)[selected.id] || selected.id
            }
            fallbackData={{
              dietImpact: selected.dietImpact,
              synergies: selected.synergies,
              dosage: selected.dosage,
              mechanism: selected.mechanism,
            }}
          />
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full px-4">
      <div className="py-4 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: "🧪", val: peptides.length, label: "Total" },
            { icon: "✅", val: peptides.filter(p => p.badge.includes("APROVADO")).length, label: "Aprovados" },
            { icon: "🔄", val: peptides.filter(p => p.badge.includes("BLEND")).length, label: "Blends" },
            { icon: "🔥", val: peptides.filter(p => p.badge.includes("VANGUARDA")).length, label: "Vanguarda+" },
          ].map(s => (
            <div key={s.label} className="rounded-lg border border-gray-800 bg-gray-900/50 p-2 text-center">
              <span className="text-lg">{s.icon}</span>
              <p className="text-sm font-bold text-white">{s.val}</p>
              <p className="text-[9px] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          {["Todos","Metabólico","Eixo GH","Eixo IGF","Reparo","Blends","Neuro/Cognitivo","Longevidade","Bioreguladores","Sexual/Melanocortina","Cosmético","Imune"].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${catFilter === c ? "bg-[#4ade80]/20 border-[#4ade80]/50 text-[#4ade80]" : "border-gray-700 text-gray-500 hover:text-gray-300"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Tag filter */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] text-gray-600 self-center mr-1">Objetivo:</span>
          {["todos","emagrecimento","musculação","longevidade","neuro","imune","reparo","sono","sexual","metabolismo","aprovado","gh","blend","anti-aging","cognitivo"].map(t => (
            <button key={t} onClick={() => setTagFilter(t)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${tagFilter === t ? "bg-[#4ade80]/15 border-[#4ade80]/40 text-[#4ade80]" : "border-gray-800 text-gray-600 hover:text-gray-400"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span>Ordenar:</span>
          {(["status","name","category"] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-2 py-0.5 rounded border transition ${sortBy === s ? "border-[#4ade80]/40 text-[#4ade80]" : "border-gray-800 hover:text-gray-300"}`}>
              {s === "status" ? "Status" : s === "name" ? "A-Z" : "Categoria"}
            </button>
          ))}
        </div>

        <p className="text-[10px] text-gray-600">{filtered.length} de {peptides.length} compostos</p>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p) => (
            <button key={p.id} onClick={() => setSelected(p)}
              className="text-left rounded-xl p-3 border transition-all hover:scale-[1.02]"
              style={{ borderColor: `${p.color}30`, backgroundColor: `${p.color}08` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = p.color)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${p.color}30`)}>
              <Badge className="text-[9px] mb-2 border" style={{ backgroundColor: `${p.badgeColor}15`, color: p.badgeColor, borderColor: `${p.badgeColor}40` }}>
                {p.badge}
              </Badge>
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk'" }}>{p.name}</h3>
              <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{p.classe}</p>
              <p className="text-[9px] text-gray-600 mt-0.5">{p.category}t½ {p.halfLife}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {p.tags?.slice(0, 3).map(t => (
                  <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full border border-gray-800 text-gray-500">{t}</span>
                ))}
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-[10px] text-gray-700 py-4">
          NEXUS-BIO PeptideVault v2 · nutriON · Fins educacionais e científicos. Não substituem orientação médica.
        </p>
      </div>
    </ScrollArea>
  );
}

/* ==================== RESEARCH TAB ==================== */
function ResearchTab({ userId }: { userId?: string }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [citations, setCitations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (q: string) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setResult("");
    setCitations([]);
    try {
      const { data, error } = await supabase.functions.invoke("peptide-research", { body: { query: q.trim(), type: "research" } });
      if (error) throw error;
      setResult(data.content);
      setCitations(data.citations || []);
      if (userId) {
        await supabase.from("peptide_search_history").insert({ user_id: userId, query: q.trim(), result_summary: data.content?.slice(0, 500) });
      }
    } catch (e: any) {
      toast.error(e.message || "Erro na pesquisa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollArea className="h-full px-4">
      <div className="py-4 space-y-4">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(query)}
            placeholder="Pesquisar estudos sobre peptídeos..."
            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/50"
          />
          <Button onClick={() => search(query)} disabled={loading} className="bg-[#4ade80] hover:bg-[#22c55e] text-black rounded-xl px-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4 mr-1" /> ANALISAR</>}
          </Button>
        </div>

        {!result && !loading && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Sugestões de pesquisa:</p>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map((s) => (
                <button key={s} onClick={() => { setQuery(s); search(s); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#4ade80]/20 text-[#4ade80]/80 hover:bg-[#4ade80]/10 transition">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#4ade80] mx-auto" />
            <p className="text-sm text-gray-500">Pesquisando bases científicas...</p>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="sm" onClick={() => { setResult(""); setCitations([]); setQuery(""); }} className="text-gray-500 hover:text-red-400 text-xs gap-1">
                <Trash2 className="w-3 h-3" /> Nova pesquisa
              </Button>
              {userId && (
                <Button variant="ghost" size="sm" onClick={async () => {
                  try {
                    await supabase.from("nexus_bio_messages").insert({ user_id: userId, role: "notebook", content: result });
                    toast.success("Salvo no caderno!");
                  } catch { toast.error("Erro ao salvar"); }
                }} className="text-gray-500 hover:text-[#4ade80] text-xs gap-1">
                  <Save className="w-3 h-3" /> Salvar no caderno
                </Button>
              )}
            </div>
            <Card className="border border-[#4ade80]/20 bg-gray-900/50">
              <CardContent className="p-4">
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                {citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-800 space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Fontes:</p>
                    {citations.map((c, i) => (
                      <a key={i} href={c} target="_blank" rel="noopener noreferrer" className="text-xs text-[#4ade80]/70 hover:text-[#4ade80] flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> {c}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

/* ==================== PROTOCOLS TAB ==================== */
function ProtocolsTab() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ScrollArea className="h-full px-4">
      <div className="py-4 space-y-3">
        {protocols.map((p) => (
          <Collapsible key={p.id} open={openId === p.id} onOpenChange={(o) => setOpenId(o ? p.id : null)}>
            <Card className="border" style={{ borderColor: `${p.color}30`, backgroundColor: `${p.color}05` }}>
              <CollapsibleTrigger className="w-full text-left">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold" style={{ color: p.color, fontFamily: "'Space Grotesk'" }}>{p.name}</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">{p.objective}</p>
                  </div>
                  {openId === p.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  <div>
                    <p className="text-xs font-semibold text-gray-300 mb-2">Stack:</p>
                    {p.stack.map((s, i) => (
                      <div key={i} className="flex justify-between text-xs py-1.5 border-b border-gray-800/50 last:border-0">
                        <span className="text-white font-medium">{s.peptide}</span>
                        <span className="text-gray-400">{s.dose}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-300 mb-1">🍽️ Dieta:</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{p.diet}</p>
                  </div>
                  <Badge className="text-[10px]" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
                    ⏱️ Duração: {p.duration}
                  </Badge>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}

        {/* Diet Revolution Section */}
        <div className="pt-6 pb-2">
          <h3 className="text-sm font-bold text-[#4ade80] mb-3" style={{ fontFamily: "'Space Grotesk'" }}>
            A REVOLUÇÃO DA DIETA
          </h3>
          <div className="space-y-3">
            {dietRevolutionCards.map((c) => (
              <Card key={c.title} className="border border-[#4ade80]/15 bg-[#4ade80]/5">
                <CardContent className="p-3 flex gap-3">
                  <span className="text-2xl">{c.emoji}</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#4ade80]">{c.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{c.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

/* ==================== ALERTS TAB ==================== */
function AlertsTab({ userId }: { userId?: string }) {
  const [checking, setChecking] = useState(false);
  const [extraAlerts, setExtraAlerts] = useState("");

  const checkNew = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("peptide-research", {
        body: { query: "peptides clinical trials new studies 2025 BPC-157 retatrutide semaglutide tirzepatide epithalon", type: "alerts" },
      });
      if (error) throw error;
      setExtraAlerts(data.content);
    } catch (e: any) {
      toast.error("Erro ao verificar novos estudos");
    } finally {
      setChecking(false);
    }
  };

  const impactIcon = (i: string) => (i === "CRÍTICO" ? "🔴" : i === "ALTO" ? "🟠" : "🟡");

  return (
    <ScrollArea className="h-full px-4">
      <div className="py-4 space-y-3">
        <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk'" }}>
          <AlertTriangle className="w-4 h-4 inline mr-2 text-yellow-400" />
          Alertas de Estudos Recentes
        </h3>

        {initialAlerts.map((a) => (
          <Card key={a.id} className="border border-gray-800 bg-gray-900/50">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-gray-500">{a.date}</span>
                    <Badge className="text-[9px] px-1.5 py-0" style={{ backgroundColor: `${a.impactColor}15`, color: a.impactColor }}>
                      {impactIcon(a.impact)} {a.impact}
                    </Badge>
                  </div>
                  <p className="text-xs text-white font-medium">{a.headline}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{a.journal} · {a.peptide}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {extraAlerts && (
          <Card className="border border-[#4ade80]/20 bg-[#4ade80]/5">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-xs font-bold text-[#4ade80]">
                <Sparkles className="w-3 h-3 inline mr-1" /> Novos Estudos Encontrados
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="prose prose-sm prose-invert max-w-none text-xs">
                <ReactMarkdown>{extraAlerts}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        <Button onClick={checkNew} disabled={checking} className="w-full bg-gray-900 border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/10 rounded-xl">
          {checking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
          VERIFICAR NOVOS ESTUDOS
        </Button>
      </div>
    </ScrollArea>
  );
}
