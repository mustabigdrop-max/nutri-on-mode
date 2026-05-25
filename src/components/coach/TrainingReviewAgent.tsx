import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Send, CheckCircle2, RefreshCw, X } from "lucide-react";

interface Msg {
  role: "user" | "assistant" | "system";
  content: string;
  isError?: boolean;
  retryPayload?: { kind: "chat" | "initial"; messages: Msg[] };
}

interface Props {
  protocolText: string;
  athleteContext: string;
  coachId: string | null;
  athleteId: string | null;
  protocolId: string | null;
  onProtocolUpdate?: (newText: string, newVersion: number) => void;
  onApproved?: () => void;
}

const QUICK_ACTIONS = [
  { label: "🔍 ANALISAR VOLUME", color: "rgba(0,212,170,0.9)", prompt: "Analise o volume total do protocolo. Está adequado para o objetivo e nível do atleta?" },
  { label: "⚡ VERIFICAR PROGRESSÃO", color: "rgba(200,160,32,0.9)", prompt: "A progressão de carga e volume está correta para as semanas disponíveis?" },
  { label: "🎯 REVISAR EXERCÍCIOS", color: "rgba(168,85,247,0.9)", prompt: "Existe algum exercício que deveria ser substituído considerando os scores APEX do atleta?" },
];

export default function TrainingReviewAgent({
  protocolText,
  athleteContext,
  coachId,
  athleteId,
  protocolId,
  onProtocolUpdate,
  onApproved,
}: Props) {
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState(1);
  const [status, setStatus] = useState<"reviewing" | "approved">("reviewing");
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [regenOption, setRegenOption] = useState<"partial" | "full" | "day">("partial");
  const [regenDay, setRegenDay] = useState("D1");
  const [regenInstruction, setRegenInstruction] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const bootRef = useRef(false);

  const scrollDown = () => requestAnimationFrame(() => chatRef.current?.scrollTo({ top: 99999, behavior: "smooth" }));

  // Load or create review
  useEffect(() => {
    if (!coachId || !athleteId || !protocolText) return;
    (async () => {
      const { data } = await supabase
        .from("protocol_reviews" as any)
        .select("*")
        .eq("coach_id", coachId)
        .eq("athlete_id", athleteId)
        .eq("protocol_id", protocolId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const row: any = data;
        setReviewId(row.id);
        setMessages((row.messages as Msg[]) || []);
        setVersion(row.protocol_version || 1);
        setStatus(row.status || "reviewing");
      } else {
        const { data: created } = await supabase
          .from("protocol_reviews" as any)
          .insert({ coach_id: coachId, athlete_id: athleteId, protocol_id: protocolId, messages: [] })
          .select()
          .single();
        if (created) setReviewId((created as any).id);
      }
    })();
  }, [coachId, athleteId, protocolId, protocolText]);

  // Initial automatic analysis
  useEffect(() => {
    if (bootRef.current || !reviewId || messages.length > 0 || !protocolText) return;
    bootRef.current = true;
    void sendInitialAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewId, messages.length, protocolText]);

  const persistMessages = useCallback(
    async (next: Msg[], extra: Record<string, any> = {}) => {
      if (!reviewId) return;
      await supabase.from("protocol_reviews" as any).update({ messages: next, ...extra }).eq("id", reviewId);
    },
    [reviewId],
  );

  const callAgent = useCallback(
    async (nextMessages: Msg[]) => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("training-review-agent", {
          body: { mode: "chat", messages: nextMessages, protocol: protocolText, athleteContext },
        });
        if (error) throw new Error(error.message);
        if ((data as any)?.error) throw new Error((data as any).error);
        const text = (data as any)?.text || "";
        const final = [...nextMessages, { role: "assistant" as const, content: text }];
        setMessages(final);
        await persistMessages(final);
        scrollDown();
      } catch (e: any) {
        toast({ title: "Erro no Training Agent", description: e?.message || "Falha", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [protocolText, athleteContext, persistMessages],
  );

  const sendInitialAnalysis = async () => {
    const initial: Msg = {
      role: "user",
      content:
        "Analise este protocolo gerado para o atleta. Identifique: 1 ponto forte, 1 ponto de atenção, e faça 1 pergunta técnica ao coach para refinar o protocolo.",
    };
    // We don't show the seed user message; we synthesize the assistant's first turn directly.
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("training-review-agent", {
        body: { mode: "chat", messages: [initial], protocol: protocolText, athleteContext },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      const text = (data as any)?.text || "";
      const final: Msg[] = [{ role: "assistant", content: text }];
      setMessages(final);
      await persistMessages(final);
      scrollDown();
    } catch (e: any) {
      toast({ title: "Erro ao iniciar análise", description: e?.message || "Falha", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(next);
    setInput("");
    scrollDown();
    await callAgent(next);
  };

  const handleRegenerate = async () => {
    if (!reviewId) return;
    setRegenerating(true);
    setShowRegenModal(false);
    try {
      const opt = regenOption === "day" ? `day:${regenDay}` : regenOption === "full" ? "full" : "partial";
      const { data, error } = await supabase.functions.invoke("training-review-agent", {
        body: {
          mode: "regenerate",
          messages,
          protocol: protocolText,
          athleteContext,
          regenOption: opt,
          extraInstruction: regenInstruction,
        },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      const newProtocol = (data as any)?.text || "";
      if (!newProtocol) throw new Error("Resposta vazia");

      const newVersion = version + 1;
      setVersion(newVersion);
      onProtocolUpdate?.(newProtocol, newVersion);

      const note: Msg = {
        role: "assistant",
        content: `Protocolo regenerado incorporando ${messages.filter((m) => m.role === "user").length} ajuste(s) da revisão. Versão ${newVersion} pronta para revisão.`,
      };
      const next = [...messages, note];
      setMessages(next);
      await persistMessages(next, { protocol_version: newVersion, final_protocol: newProtocol });
      setRegenInstruction("");
      toast({ title: `✓ Protocolo regenerado · v${newVersion}` });
    } catch (e: any) {
      toast({ title: "Erro ao regenerar", description: e?.message || "Falha", variant: "destructive" });
    } finally {
      setRegenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!reviewId) return;
    setShowApproveModal(false);
    try {
      await supabase
        .from("protocol_reviews" as any)
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          final_protocol: protocolText,
          protocol_version: version,
        })
        .eq("id", reviewId);
      setStatus("approved");
      const note: Msg = {
        role: "assistant",
        content: `Protocolo aprovado e salvo. Versão ${version} disponível no TrainingON do atleta.`,
      };
      const next = [...messages, note];
      setMessages(next);
      await persistMessages(next);
      onApproved?.();
      toast({ title: "✓ Protocolo aprovado" });
    } catch (e: any) {
      toast({ title: "Erro ao aprovar", description: e?.message || "Falha", variant: "destructive" });
    }
  };

  return (
    <div
      className="flex flex-col rounded-md"
      style={{
        background: "linear-gradient(180deg, rgba(4,8,16,0.95), rgba(8,12,20,0.98))",
        border: "0.5px solid rgba(0,212,170,0.18)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(0,212,170,0.08), rgba(4,8,16,0.95))",
          borderBottom: "0.5px solid rgba(0,212,170,0.2)",
          borderTop: "2px solid #00d4aa",
          borderRadius: "6px 6px 0 0",
          padding: "10px 14px",
        }}
        className="flex items-center gap-3"
      >
        <div className="relative">
          <div
            className="w-6 h-6 rounded-full animate-pulse"
            style={{
              background: "radial-gradient(circle, #00d4aa 0%, rgba(0,212,170,0.2) 60%, transparent 100%)",
              boxShadow: "0 0 12px rgba(0,212,170,0.6)",
            }}
          />
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">TRAINING AGENT</div>
          <div className="text-[9px] font-mono" style={{ color: "#60ffdd" }}>
            Coach · Revisor · Co-autor
          </div>
        </div>
        <div
          className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ background: "rgba(200,160,32,0.12)", color: "#e8a020", border: "0.5px solid rgba(200,160,32,0.3)" }}
        >
          APEX + STRATUM
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-1.5 flex-wrap px-3 pt-3">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            disabled={loading || regenerating}
            onClick={() => sendMessage(a.prompt)}
            className="transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              padding: "4px 8px",
              fontSize: 8,
              border: `0.5px solid ${a.color}`,
              color: a.color,
              borderRadius: 3,
              background: "transparent",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {a.label}
          </button>
        ))}
        <button
          disabled={loading || regenerating || status === "approved"}
          onClick={() => setShowRegenModal(true)}
          className="transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{
            padding: "4px 8px",
            fontSize: 8,
            border: "0.5px solid rgba(239,68,68,0.9)",
            color: "rgba(239,68,68,0.95)",
            borderRadius: 3,
            background: "transparent",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          🔄 REGENERAR PROTOCOLO
        </button>
      </div>

      {/* Chat */}
      <div ref={chatRef} className="px-3 py-3 overflow-y-auto" style={{ maxHeight: 320, minHeight: 200 }}>
        {messages.length === 0 && !loading && (
          <div className="text-[10px] italic opacity-60 text-center py-6">Iniciando análise do protocolo...</div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className="mb-2"
            style={
              m.role === "assistant"
                ? {
                    background: "rgba(0,212,170,0.04)",
                    borderLeft: "2px solid rgba(0,212,170,0.3)",
                    borderRadius: "0 6px 6px 6px",
                    padding: "8px 10px",
                    fontSize: 11,
                    lineHeight: 1.7,
                    color: "hsl(var(--foreground))",
                  }
                : {
                    background: "rgba(200,160,32,0.05)",
                    borderRight: "2px solid rgba(200,160,32,0.3)",
                    borderRadius: "6px 0 6px 6px",
                    padding: "8px 10px",
                    fontSize: 11,
                    color: "hsl(var(--muted-foreground))",
                    textAlign: "right",
                    marginLeft: "20%",
                  }
            }
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[10px]" style={{ color: "#60ffdd" }}>
            <Sparkles className="h-3 w-3 animate-pulse" />
            Analisando...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 space-y-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              void sendMessage(input);
            }
          }}
          disabled={loading || regenerating || status === "approved"}
          placeholder="Escreva sua opinião, dúvida ou sugestão sobre o protocolo... (Ctrl+Enter)"
          style={{
            minHeight: 60,
            maxHeight: 120,
            width: "100%",
            background: "rgba(8,16,26,0.95)",
            border: "0.5px solid rgba(0,212,170,0.15)",
            borderBottom: "1.5px solid rgba(0,212,170,0.3)",
            borderRadius: 4,
            padding: "8px 10px",
            fontSize: 11,
            color: "hsl(var(--foreground))",
            fontFamily: "'Courier New', monospace",
            resize: "vertical",
            outline: "none",
          }}
        />
        <div className="flex justify-between gap-2">
          <button
            onClick={() => void sendMessage(input)}
            disabled={loading || regenerating || !input.trim() || status === "approved"}
            className="flex items-center gap-1.5 transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              background: "rgba(0,212,170,0.1)",
              border: "0.5px solid rgba(0,212,170,0.3)",
              color: "#60ffdd",
              fontSize: 9,
              padding: "5px 12px",
              borderRadius: 3,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <Send className="h-3 w-3" /> Enviar
          </button>
        </div>

        {/* Approve button */}
        <button
          onClick={() => setShowApproveModal(true)}
          disabled={status === "approved" || loading || regenerating}
          className="w-full transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
          style={{
            background: status === "approved" ? "rgba(0,212,170,0.2)" : "rgba(0,212,170,0.1)",
            border: "1px solid rgba(0,212,170,0.4)",
            color: "#60ffdd",
            fontSize: 12,
            fontWeight: 700,
            padding: "10px 0",
            borderRadius: 4,
            letterSpacing: "0.1em",
            opacity: status === "approved" ? 0.7 : 1,
          }}
        >
          {status === "approved" ? "APROVADO ✓" : "✓ APROVAR E FINALIZAR PROTOCOLO"}
        </button>
      </div>

      {/* Regen Modal */}
      {showRegenModal && (
        <Modal onClose={() => setShowRegenModal(false)} accent="#e8a020">
          <div style={{ color: "#e8a020", fontSize: 14, fontWeight: 700, letterSpacing: "0.08em" }}>
            REGENERAR PROTOCOLO
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 mb-4">
            O agente irá incorporar todos os ajustes discutidos nesta conversa.
          </div>
          <div className="space-y-2 mb-4">
            {[
              { v: "partial", label: "Regenerar parcialmente (apenas seções com ajustes sugeridos)" },
              { v: "full", label: "Regenerar completamente (novo protocolo incorporando todo o feedback)" },
              { v: "day", label: "Regenerar apenas um dia específico" },
            ].map((o) => (
              <label key={o.v} className="flex items-start gap-2 cursor-pointer text-[11px]">
                <input
                  type="radio"
                  checked={regenOption === (o.v as any)}
                  onChange={() => setRegenOption(o.v as any)}
                  style={{ accentColor: "#e8a020", marginTop: 2 }}
                />
                <span>{o.label}</span>
              </label>
            ))}
            {regenOption === "day" && (
              <select
                value={regenDay}
                onChange={(e) => setRegenDay(e.target.value)}
                className="ml-5 mt-1 text-[11px] bg-background border border-border rounded px-2 py-1"
              >
                {["D1", "D2", "D3", "D4", "D5", "D6", "D7"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            )}
          </div>
          <textarea
            value={regenInstruction}
            onChange={(e) => setRegenInstruction(e.target.value)}
            placeholder="Instrução adicional para o agente... (opcional)"
            className="w-full text-[11px] bg-background border border-border rounded p-2 mb-4"
            style={{ minHeight: 60 }}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowRegenModal(false)}
              className="px-3 py-1.5 text-[10px] border border-border rounded uppercase tracking-wider"
            >
              Cancelar
            </button>
            <button
              onClick={handleRegenerate}
              className="px-3 py-1.5 text-[10px] rounded uppercase tracking-wider font-bold"
              style={{ background: "rgba(200,160,32,0.15)", border: "1px solid rgba(200,160,32,0.5)", color: "#e8a020" }}
            >
              Regenerar agora →
            </button>
          </div>
        </Modal>
      )}

      {showApproveModal && (
        <Modal onClose={() => setShowApproveModal(false)} accent="#00d4aa">
          <div style={{ color: "#60ffdd", fontSize: 14, fontWeight: 700, letterSpacing: "0.08em" }}>
            CONFIRMAR APROVAÇÃO
          </div>
          <div className="text-[11px] text-muted-foreground mt-2 mb-4">
            Confirmar aprovação do protocolo? Isso irá salvar a versão final (v{version}) e enviar para o TrainingON do atleta.
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowApproveModal(false)}
              className="px-3 py-1.5 text-[10px] border border-border rounded uppercase tracking-wider"
            >
              Cancelar
            </button>
            <button
              onClick={handleApprove}
              className="px-3 py-1.5 text-[10px] rounded uppercase tracking-wider font-bold"
              style={{ background: "rgba(0,212,170,0.15)", border: "1px solid rgba(0,212,170,0.5)", color: "#60ffdd" }}
            >
              Confirmar aprovação
            </button>
          </div>
        </Modal>
      )}

      {regenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-40">
          <div className="flex items-center gap-2 text-xs" style={{ color: "#e8a020" }}>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Regenerando protocolo...
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({ children, onClose, accent }: { children: React.ReactNode; onClose: () => void; accent: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div
        className="relative w-full max-w-[480px]"
        style={{ background: "#060c14", border: `0.5px solid ${accent}55`, borderRadius: 8, padding: 24 }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function ReviewStatusBadge({ status, version }: { status: "reviewing" | "approved"; version: number }) {
  if (status === "approved") {
    return (
      <div
        className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded"
        style={{ background: "rgba(0,212,170,0.12)", color: "#60ffdd", border: "0.5px solid rgba(0,212,170,0.4)", letterSpacing: "0.1em" }}
      >
        <CheckCircle2 className="h-3 w-3" /> APROVADO ✓ · v{version}
      </div>
    );
  }
  return (
    <div
      className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded"
      style={{ background: "rgba(200,160,32,0.1)", color: "#e8a020", border: "0.5px solid rgba(200,160,32,0.4)", letterSpacing: "0.1em" }}
    >
      AGUARDANDO REVISÃO {version > 1 ? `· VERSÃO ${version} · REVISADO` : ""}
    </div>
  );
}
