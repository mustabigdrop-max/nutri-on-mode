import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Loader2, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useStratum } from "@/hooks/useStratum";
import { toast } from "sonner";

export default function StratumIntake({ onFinalized }: { onFinalized?: () => void }) {
  const { callIntake, profile } = useStratum();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finalized, setFinalized] = useState(!!profile?.diagnostico_completo);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (finalize = false) => {
    const text = finalize ? "Finalizar diagnóstico." : input.trim();
    if (!text && !finalize) return;
    const newMsgs = [...messages, { role: "user" as const, content: text }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const r = await callIntake(newMsgs, finalize);
      setMessages([...newMsgs, { role: "assistant", content: r.reply }]);
      if (r.finalized) {
        setFinalized(true);
        toast.success("Diagnóstico STRATUM concluído");
        onFinalized?.();
      }
    } catch (e: any) {
      toast.error(e?.message || "Erro");
    }
    setLoading(false);
  };

  const startIntake = async () => {
    setLoading(true);
    try {
      const r = await callIntake([{ role: "user", content: "Iniciar diagnóstico STRATUM." }], false);
      setMessages([{ role: "assistant", content: r.reply }]);
    } catch (e: any) { toast.error(e?.message || "Erro"); }
    setLoading(false);
  };

  return (
    <Card className="bg-card border-[#DC2626]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#DC2626]">
          <Brain className="w-5 h-5" /> STRATUM INTAKE — Diagnóstico Inicial
        </CardTitle>
        <p className="text-xs text-muted-foreground">Camada 1 · Anamnese técnica em 8 blocos</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {finalized && profile?.diagnostico_completo && (
          <div className="rounded-lg border border-[#DC2626]/40 bg-[#DC2626]/5 p-3 text-xs">
            <div className="flex items-center gap-2 mb-2 text-[#DC2626]">
              <CheckCircle2 className="w-4 h-4" /> Diagnóstico ativo
            </div>
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{profile.diagnostico_completo}</ReactMarkdown>
            </div>
          </div>
        )}

        {messages.length === 0 && !finalized ? (
          <Button onClick={startIntake} disabled={loading} className="w-full bg-[#DC2626] hover:bg-[#DC2626]/90">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Iniciar diagnóstico"}
          </Button>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto space-y-2 rounded border border-border p-3 bg-background/50">
              {messages.map((m, i) => (
                <div key={i} className={`text-sm rounded p-2 ${m.role === "user" ? "bg-muted ml-8" : "bg-[#DC2626]/10 mr-8"}`}>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="flex gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && send()} placeholder="Sua resposta..." disabled={loading} />
              <Button onClick={() => send()} disabled={loading || !input.trim()} size="icon" className="bg-[#DC2626] hover:bg-[#DC2626]/90">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            {messages.length >= 4 && !finalized && (
              <Button onClick={() => send(true)} disabled={loading} variant="outline" size="sm" className="w-full border-[#DC2626]/40 text-[#DC2626]">
                Finalizar e gerar diagnóstico
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
