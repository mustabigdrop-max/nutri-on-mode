import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Bookmark } from "lucide-react";
import VoiceRecorderButton from "@/components/ui/VoiceRecorderButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VertexLogo48, VertexLogo20 } from "@/components/vertex/VertexLogoSmall";

interface VertexMessage {
  role: "user" | "assistant";
  content: string;
}

const DrNexusChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<VertexMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingContent]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: VertexMessage = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      const response = await supabase.functions.invoke("dr-nexus", {
        body: {
          compound: text.trim(),
          mode: "chat",
          messages: [{ role: "user", content: text.trim() }],
          history: messages.slice(-10),
        },
      });

      if (response.data instanceof ReadableStream) {
        const reader = response.data.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content || "";
              fullContent += delta;
              setStreamingContent(fullContent);
            } catch {}
          }
        }

        setMessages(prev => [...prev, { role: "assistant", content: fullContent }]);
        setStreamingContent("");
      } else if (response.data?.answer) {
        setMessages(prev => [...prev, { role: "assistant", content: response.data.answer }]);
      } else if (response.error) {
        throw new Error(response.error.message || "Erro na resposta");
      }
    } catch (e: any) {
      console.error("Dr. VERTEX error:", e);
      toast.error("Erro ao conectar com Dr. VERTEX.");
    }
    setIsLoading(false);
  };

  const saveToNotebook = async (msg: VertexMessage, idx: number) => {
    if (!user) return;
    const questionMsg = messages[idx - 1];
    await supabase.from("lab_saved_items").insert({
      user_id: user.id,
      tipo: "resposta",
      titulo: questionMsg?.content?.slice(0, 80) || "Resposta Dr. VERTEX",
      conteudo: { question: questionMsg?.content, answer: msg.content, source: "dr-vertex" },
      tags: ["dr-vertex", "farmacologia"],
    });
    toast.success("Salvo no Caderno Científico!");
  };

  return (
    <div className="flex flex-col flex-1">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !streamingContent && (
          <div className="text-center py-12 space-y-3">
            <VertexLogo48 className="mx-auto" />
            <p className="text-sm text-muted-foreground font-['JetBrains_Mono']">Pergunte ao Dr. VERTEX sobre qualquer composto</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["Retatrutida", "BPC-157 + TB-500", "Protocolo PCT", "Ashwagandha KSM-66", "TRT otimizada"].map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[11px] text-[#a78bfa] hover:bg-[#7c3aed]/20 transition-colors font-['JetBrains_Mono']">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-[#7c3aed]/20 flex items-center justify-center flex-shrink-0 mt-1 border border-[#7c3aed]/30">
                <VertexLogo20 />
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === "user" ? "rounded-2xl rounded-br-md bg-[#7c3aed] text-white px-4 py-3" : ""}`}>
              {msg.role === "assistant" ? (
                <div>
                  <span className="text-[9px] font-['JetBrains_Mono'] text-[#a78bfa] uppercase tracking-wider mb-1 block">DR. VERTEX</span>
                  <div className="rounded-2xl rounded-bl-md bg-[#0a0514] border border-[#7c3aed]/20 px-4 py-3 space-y-2">
                    <div className="prose prose-sm prose-invert max-w-none text-sm
                      [&_p]:mb-2 [&_ul]:mb-2 [&_strong]:text-[#a78bfa] [&_h3]:text-[#a78bfa] [&_h3]:text-sm [&_h3]:font-bold
                      [&_h2]:text-[#a78bfa] [&_h2]:text-base [&_h2]:font-bold [&_h1]:text-[#c4b5fd]
                      [&_code]:bg-[#7c3aed]/10 [&_code]:text-[#06b6d4] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <button onClick={() => saveToNotebook(msg, i)}
                      className="flex items-center gap-1 text-[10px] font-['JetBrains_Mono'] text-muted-foreground hover:text-[#a78bfa] transition-colors mt-1">
                      <Bookmark className="w-3 h-3" /> Salvar no Caderno Científico
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </motion.div>
        ))}

        {(isLoading || streamingContent) && !messages.find((_, i) => i === messages.length - 1 && messages[i]?.role === "assistant") && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-[#7c3aed]/20 flex items-center justify-center flex-shrink-0 border border-[#7c3aed]/30">
              <VertexLogo20 />
            </div>
            <div className="flex-1">
              <span className="text-[9px] font-['JetBrains_Mono'] text-[#a78bfa] uppercase tracking-wider mb-1 block">DR. VERTEX</span>
              <div className="bg-[#0a0514] border border-[#7c3aed]/20 rounded-2xl rounded-bl-md px-4 py-3">
                {streamingContent ? (
                  <div className="prose prose-sm prose-invert max-w-none text-sm [&_strong]:text-[#a78bfa] [&_h3]:text-[#a78bfa]">
                    <ReactMarkdown>{streamingContent}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#7c3aed] animate-spin" />
                    <span className="text-[10px] font-['JetBrains_Mono'] text-muted-foreground">convergindo evidências...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 pb-20 border-t border-[#7c3aed]/15 bg-[#030408]/95 backdrop-blur">
        <div className="flex gap-2 max-w-lg mx-auto">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            placeholder="Pergunte ao Dr. VERTEX..."
            className="flex-1 px-4 py-3 rounded-xl border border-[#7c3aed]/20 bg-[#0a0514] text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 font-['JetBrains_Mono']" />
          <VoiceRecorderButton onTranscript={(t) => setInput(prev => prev ? prev + " " + t : t)} disabled={isLoading} />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center disabled:opacity-50 transition-all hover:bg-[#6d28d9]">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrNexusChat;