import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale, Camera, Send, Loader2, Image, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string; images?: string[] };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-body-composition`;

export default function BodyCompositionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res((reader.result as string).split(",")[1]);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 4 - pendingImages.length);
    for (const f of arr) {
      if (f.size > 10 * 1024 * 1024) { toast.error("Arquivo muito grande (máx 10MB)"); continue; }
      const b64 = await toBase64(f);
      setPendingImages(prev => [...prev, b64]);
    }
  }, [pendingImages.length]);

  const removePending = (idx: number) => setPendingImages(prev => prev.filter((_, i) => i !== idx));

  const sendMessage = async () => {
    const text = input.trim();
    const images = [...pendingImages];
    if (!text && images.length === 0) return;

    const userMsg: Msg = { role: "user", content: text || "Analise esta(s) foto(s).", images: images.length > 0 ? images : undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setPendingImages([]);
    setIsLoading(true);

    // Build messages for API
    const apiMessages = [...messages, userMsg].map(m => {
      if (m.images && m.images.length > 0) {
        return {
          role: m.role,
          content: [
            { type: "text" as const, text: m.content },
            ...m.images.map(img => ({
              type: "image_url" as const,
              image_url: { url: `data:image/jpeg;base64,${img}` },
            })),
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    const perfilUsuario = profile ? {
      sexo: profile.sex || undefined,
      idade: profile.date_of_birth ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / 31557600000) : undefined,
      peso: profile.weight_kg || undefined,
      altura: profile.height_cm || undefined,
      objetivo: profile.objetivo_principal || profile.goal || undefined,
      metaCalorica: profile.vet_kcal || undefined,
    } : undefined;

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, perfilUsuario }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
        toast.error(err.error || "Erro na análise");
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No stream body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch { /* partial */ }
        }
      }

      // flush remaining
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw || !raw.startsWith("data: ")) continue;
          const j = raw.slice(6).trim();
          if (j === "[DONE]") continue;
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao conectar com o agente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3 border-b border-white/5">
        <button onClick={() => navigate("/coach/dashboard")} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Composição Corporal</h1>
          <p className="text-xs text-white/50">Análise visual + dados integrados</p>
        </div>
        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <Scale size={18} className="text-blue-400" />
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-40">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto">
                <Scale size={28} className="text-blue-400" />
              </div>
              <h2 className="text-lg font-bold">Agente de Composição Corporal</h2>
              <p className="text-white/50 text-sm max-w-xs mx-auto">
                Envie suas fotos corporais para uma análise técnica completa com estimativa de % gordura, perfil morfológico e recomendações de fase.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-400">📸 Fotos ideais:</p>
              <ul className="text-xs text-white/60 space-y-1 ml-2">
                <li>• Frontal — braços levemente afastados, relaxado</li>
                <li>• Lateral — perfil direito ou esquerdo</li>
                <li>• Posterior — de costas</li>
              </ul>
              <p className="text-xs text-white/40 mt-2">Se tiver, adicione peso (kg), altura (cm) e bioimpedância (% gordura) na mensagem.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Quero fazer minha avaliação inicial",
                "Tenho fotos de antes e depois",
                "Peso 85kg, 178cm, quero análise",
                "Qual fase devo seguir agora?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-left text-xs p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-colors text-white/70"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              m.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-white/[0.05] border border-white/10 text-white/90"
            }`}>
              {m.images && m.images.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {m.images.map((img, j) => (
                    <img key={j} src={`data:image/jpeg;base64,${img}`} alt="Foto" className="w-20 h-20 object-cover rounded-lg" />
                  ))}
                </div>
              )}
              {m.role === "assistant" ? (
                <div className="prose prose-invert prose-sm max-w-none [&_h2]:text-blue-400 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-white/80 [&_h3]:text-xs [&_p]:text-xs [&_p]:leading-relaxed [&_li]:text-xs [&_strong]:text-white">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{m.content}</p>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-blue-400" />
              <span className="text-xs text-white/50">Analisando...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Pending images preview */}
      <AnimatePresence>
        {pendingImages.length > 0 && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/5 bg-black">
            <div className="flex gap-2 px-4 py-2">
              {pendingImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={`data:image/jpeg;base64,${img}`} alt="" className="w-16 h-16 object-cover rounded-lg" />
                  <button onClick={() => removePending(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <X size={10} />
                  </button>
                </div>
              ))}
              {pendingImages.length < 4 && (
                <button onClick={() => fileRef.current?.click()} className="w-16 h-16 rounded-lg border border-dashed border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors">
                  <Plus size={16} className="text-white/40" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-black/90 backdrop-blur border-t border-white/5 px-4 py-3">
        <div className="flex items-end gap-2 max-w-xl mx-auto">
          <button
            onClick={() => fileRef.current?.click()}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <Camera size={18} className="text-blue-400" />
          </button>
          <input
            type="file"
            ref={fileRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Descreva ou envie fotos..."
              rows={1}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={isLoading && !input.trim() && pendingImages.length === 0}
            size="icon"
            className="rounded-xl bg-blue-600 hover:bg-blue-700 h-11 w-11 flex-shrink-0"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
