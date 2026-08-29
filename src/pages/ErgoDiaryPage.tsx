import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Plus,
  BookOpen,
  Sparkles,
  Calendar,
  Trash2,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ── Paleta (alinhada ao ERGO VAULT) ──────────────────────────────────────
const PALETTE = {
  obsidian: "#05050A",
  rose: "#C4546A",
  rosePale: "#E8A0AE",
  gold: "#C9A96E",
  sage: "#7A9A7A",
  lavender: "#8878AA",
  cream: "#EDE6DA",
};

const FONT_DISPLAY = "'Playfair Display', serif";
const FONT_UI = "'Barlow Condensed', sans-serif";
const FONT_MONO = "'Share Tech Mono', monospace";

type Msg = { role: "user" | "assistant"; content: string };

interface Diary {
  id: string;
  nome: string;
  objetivo: string | null;
  duracao_semanas: number | null;
  data_inicio: string | null;
  status: string | null;
  created_at: string;
}

const STARTERS = [
  { label: "Iniciar novo diário de ciclo", text: "Quero iniciar um novo diário de ciclo." },
  { label: "Registrar check-in semanal", text: "Quero registrar meu check-in semanal." },
  { label: "Analisar exames laboratoriais", text: "Quero analisar meus exames laboratoriais." },
  { label: "Consultar histórico de ciclos", text: "Quero consultar meu histórico de ciclos." },
  { label: "Tirar dúvida sobre substância", text: "Tenho uma dúvida sobre uma substância ou protocolo." },
];

export default function ErgoDiaryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [activeDiaryId, setActiveDiaryId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeDiary = useMemo(
    () => diaries.find((d) => d.id === activeDiaryId) || null,
    [diaries, activeDiaryId],
  );

  // Carregar diários
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("ergo_diaries")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setDiaries(data as Diary[]);
    })();
  }, [user]);

  // Carregar histórico de mensagens
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("ergo_diary_messages")
        .select("role, content")
        .order("created_at", { ascending: true })
        .limit(60);
      if (data && data.length > 0) {
        setMessages(data as Msg[]);
      }
    })();
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const persistMsg = async (role: "user" | "assistant", content: string) => {
    if (!user) return;
    await supabase.from("ergo_diary_messages").insert({
      user_id: user.id,
      diary_id: activeDiaryId,
      role,
      content,
    });
  };

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setStreaming(true);
    persistMsg("user", userMsg.content);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ergo-diary-agent`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: activeDiary
            ? {
                diario_ativo: activeDiary.nome,
                objetivo: activeDiary.objetivo,
                duracao_semanas: activeDiary.duracao_semanas,
                data_inicio: activeDiary.data_inicio,
              }
            : null,
        }),
      });

      if (resp.status === 429) {
        toast.error("Limite de requisições excedido. Aguarde.");
        setStreaming(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("Créditos esgotados. Adicione créditos na workspace.");
        setStreaming(false);
        return;
      }
      if (!resp.ok || !resp.body) {
        toast.error("Falha ao iniciar a resposta.");
        setStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantSoFar = "";
      let started = false;
      let done = false;

      while (!done) {
        const { value, done: rd } = await reader.read();
        if (rd) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || !line.trim()) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantSoFar += delta;
              if (!started) {
                started = true;
                setMessages((p) => [...p, { role: "assistant", content: assistantSoFar }]);
              } else {
                setMessages((p) =>
                  p.map((m, i) =>
                    i === p.length - 1 ? { ...m, content: assistantSoFar } : m,
                  ),
                );
              }
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (assistantSoFar) {
        persistMsg("assistant", assistantSoFar);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro de conexão.");
    } finally {
      setStreaming(false);
    }
  };

  const createDiary = async () => {
    if (!user) return;
    const nome = window.prompt("Nome do ciclo (ex: Bulking Q1 2025):");
    if (!nome) return;
    const { data, error } = await supabase
      .from("ergo_diaries")
      .insert({ user_id: user.id, nome, status: "ativo" })
      .select()
      .single();
    if (error) {
      toast.error("Erro ao criar diário.");
      return;
    }
    setDiaries((p) => [data as Diary, ...p]);
    setActiveDiaryId(data.id);
    toast.success("Diário criado.");
    send(
      `Acabei de criar o diário "${nome}". Me ajude a estruturar o protocolo do zero, fazendo as perguntas necessárias.`,
    );
  };

  const deleteDiary = async (id: string) => {
    if (!confirm("Excluir este diário e seus check-ins?")) return;
    await supabase.from("ergo_diaries").delete().eq("id", id);
    setDiaries((p) => p.filter((d) => d.id !== id));
    if (activeDiaryId === id) setActiveDiaryId(null);
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        background: `radial-gradient(ellipse at top, rgba(196,84,106,0.08) 0%, ${PALETTE.obsidian} 50%)`,
        color: PALETTE.cream,
        fontFamily: FONT_UI,
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Barlow+Condensed:wght@300;400;500;600&family=Share+Tech+Mono&display=swap"
      />

      {/* Topbar */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-xl"
        style={{
          borderColor: "rgba(196,84,106,0.15)",
          background: "rgba(5,5,10,0.85)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <button
            onClick={() => navigate("/coach/dashboard")}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] opacity-70 hover:opacity-100"
            style={{ fontFamily: FONT_MONO, color: PALETTE.cream }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" style={{ color: PALETTE.rose }} />
            <span
              className="text-base"
              style={{ fontFamily: FONT_DISPLAY, letterSpacing: "0.05em" }}
            >
              Diários <span style={{ color: PALETTE.rose }}>Ergogênicos</span>
            </span>
          </div>
          <button
            onClick={createDiary}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition"
            style={{
              fontFamily: FONT_MONO,
              color: PALETTE.rose,
              borderColor: "rgba(196,84,106,0.4)",
              background: "rgba(196,84,106,0.06)",
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Novo
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar — Diários */}
        <aside className="space-y-3">
          <div
            className="text-[10px] uppercase tracking-[0.3em] opacity-60"
            style={{ fontFamily: FONT_MONO }}
          >
            Meus Ciclos · {diaries.length}
          </div>

          {diaries.length === 0 && (
            <div
              className="rounded-xl border p-4 text-sm opacity-70"
              style={{
                borderColor: "rgba(196,84,106,0.18)",
                background: "rgba(196,84,106,0.04)",
              }}
            >
              Nenhum diário ainda. Clique em <b>Novo</b> para começar.
            </div>
          )}

          {diaries.map((d) => (
            <motion.button
              key={d.id}
              onClick={() => setActiveDiaryId(d.id === activeDiaryId ? null : d.id)}
              whileHover={{ scale: 1.01 }}
              className="w-full rounded-xl border p-3 text-left transition"
              style={{
                borderColor:
                  d.id === activeDiaryId
                    ? "rgba(196,84,106,0.6)"
                    : "rgba(196,84,106,0.18)",
                background:
                  d.id === activeDiaryId
                    ? "rgba(196,84,106,0.10)"
                    : "rgba(5,5,10,0.5)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div
                    className="truncate text-sm font-semibold"
                    style={{ color: PALETTE.cream }}
                  >
                    {d.nome}
                  </div>
                  <div
                    className="mt-1 flex items-center gap-2 text-[10px] opacity-60"
                    style={{ fontFamily: FONT_MONO }}
                  >
                    <Calendar className="h-2.5 w-2.5" />
                    {new Date(d.created_at).toLocaleDateString("pt-BR")}
                    {d.status && <span>· {d.status}</span>}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDiary(d.id);
                  }}
                  className="opacity-40 hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.button>
          ))}
        </aside>

        {/* Chat */}
        <main
          className="flex h-[calc(100vh-9rem)] flex-col rounded-2xl border"
          style={{
            borderColor: "rgba(196,84,106,0.18)",
            background: "rgba(5,5,10,0.6)",
          }}
        >
          {activeDiary && (
            <div
              className="border-b px-4 py-2 text-xs"
              style={{
                borderColor: "rgba(196,84,106,0.15)",
                fontFamily: FONT_MONO,
                color: PALETTE.rosePale,
              }}
            >
              📋 Contexto ativo: <b>{activeDiary.nome}</b>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="space-y-5">
                <div
                  className="rounded-xl border p-5"
                  style={{
                    borderColor: "rgba(196,84,106,0.2)",
                    background: "rgba(196,84,106,0.05)",
                  }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" style={{ color: PALETTE.rose }} />
                    <span
                      className="text-sm uppercase tracking-[0.2em]"
                      style={{ fontFamily: FONT_MONO, color: PALETTE.rose }}
                    >
                      ErgoDiário AI
                    </span>
                  </div>
                  <div
                    className="text-base"
                    style={{ fontFamily: FONT_DISPLAY, color: PALETTE.cream }}
                  >
                    Documentação inteligente, análise de protocolo e suporte
                    educacional para uso consciente de ergogênicos.
                  </div>
                  <div className="mt-2 text-xs opacity-70">
                    Científico · Sem julgamento · Baseado em evidências
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => send(s.text)}
                      className="rounded-lg border px-3 py-2.5 text-left text-sm transition hover:scale-[1.01]"
                      style={{
                        borderColor: "rgba(201,169,110,0.3)",
                        background: "rgba(201,169,110,0.05)",
                        color: PALETTE.cream,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-3 text-sm"
                  style={{
                    background:
                      m.role === "user"
                        ? "rgba(196,84,106,0.18)"
                        : "rgba(122,154,122,0.08)",
                    border:
                      m.role === "user"
                        ? "1px solid rgba(196,84,106,0.35)"
                        : "1px solid rgba(122,154,122,0.25)",
                    color: PALETTE.cream,
                  }}
                >
                  <div className="prose prose-sm prose-invert max-w-none [&_*]:!text-current [&_strong]:font-semibold">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {streaming && (
              <div className="flex items-center gap-2 text-xs opacity-60">
                <Loader2 className="h-3 w-3 animate-spin" /> ErgoDiário pensando…
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className="border-t p-3"
            style={{ borderColor: "rgba(196,84,106,0.15)" }}
          >
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Descreva seu ciclo, cole exames, faça uma pergunta…"
                rows={2}
                className="flex-1 resize-none rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1"
                style={{
                  borderColor: "rgba(196,84,106,0.25)",
                  color: PALETTE.cream,
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || streaming}
                className="flex h-10 w-10 items-center justify-center rounded-lg border transition hover:scale-[1.05] disabled:opacity-40"
                style={{
                  borderColor: "rgba(196,84,106,0.4)",
                  background: "rgba(196,84,106,0.12)",
                  color: PALETTE.rose,
                }}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div
              className="mt-2 text-[10px] opacity-50"
              style={{ fontFamily: FONT_MONO }}
            >
              ErgoDiário AI não é médico. Não prescreve. Apenas documenta e analisa.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
