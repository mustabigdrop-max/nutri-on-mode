import { useEffect, useState } from "react";
import { Copy, Loader2, MessageCircle, RefreshCw, Send, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface LeadScript {
  msg_inicial: string;
  msg_sim: string;
  msg_fechamento: string;
  msg_followup_24h: string;
  msg_nao_agora: string;
  msg_objecao_preco: string;
  resposta_destacada?: string;
}

interface Props {
  leadId: string;
  leadName: string;
  answersText: { pergunta: string; resposta: string; pilar: string }[];
  open: boolean;
  onClose: () => void;
  /** Abre o WhatsApp com a mensagem inicial e registra o contato. */
  onSendInitial: (message: string) => void;
}

const copy = (text: string) => {
  void navigator.clipboard.writeText(text);
  toast.success("Mensagem copiada");
};

export default function LeadScriptDialog({ leadId, leadName, answersText, open, onClose, onSendInitial }: Props) {
  const [script, setScript] = useState<LeadScript | null>(null);
  const [loading, setLoading] = useState(false);
  const first = leadName.split(" ")[0];

  async function generate() {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("lead-whatsapp-script", {
      body: { lead_id: leadId, answers_text: answersText },
    });
    setLoading(false);
    if (error || (data as { error?: string })?.error) {
      toast.error((data as { error?: string })?.error || "Não foi possível gerar o script agora");
      return;
    }
    setScript((data as { script: LeadScript }).script);
  }

  useEffect(() => {
    if (open && !script && !loading) void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 overflow-y-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3 sticky top-0 bg-background py-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} /> Script WhatsApp — {first}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={generate} disabled={loading} className="p-2 border border-border disabled:opacity-40" title="Gerar de novo">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={onClose} className="p-2 border border-border">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading && !script ? (
          <div className="border border-border bg-card p-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Montando o script personalizado...
          </div>
        ) : script ? (
          <>
            {script.resposta_destacada && (
              <div className="border border-border bg-card p-4">
                <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground mb-1">RESPOSTA QUE REVELA O PADRÃO</div>
                <p className="text-sm">“{script.resposta_destacada}”</p>
              </div>
            )}

            <Block title="MENSAGEM INICIAL (ENVIAR PRIMEIRO)" text={script.msg_inicial} highlight>
              <button
                onClick={() => onSendInitial(script.msg_inicial)}
                className="px-3 py-2 text-[10px] font-mono tracking-widest flex items-center gap-1"
                style={{ background: "#25D366", color: "#fff" }}
              >
                <Send className="w-3 h-3" /> ENVIAR NO WHATSAPP
              </button>
            </Block>
            <Block title='QUANDO ELE RESPONDER "SIM"' text={script.msg_sim} />
            <Block title="FECHAMENTO / CTA" text={script.msg_fechamento} />
            <Block title="SE NÃO RESPONDER EM 24H" text={script.msg_followup_24h} />
            <Block title='SE RESPONDER "NÃO AGORA" / "DEPOIS"' text={script.msg_nao_agora} />
            <Block title="SE FALAR DE PREÇO" text={script.msg_objecao_preco} />
          </>
        ) : (
          <div className="border border-border bg-card p-6 text-sm text-muted-foreground">
            Não foi possível montar o script. Tente novamente.
          </div>
        )}
      </div>
    </div>
  );
}

function Block({
  title,
  text,
  highlight,
  children,
}: {
  title: string;
  text: string;
  highlight?: boolean;
  children?: React.ReactNode;
}) {
  if (!text) return null;
  return (
    <div className="border bg-card p-4 space-y-3" style={{ borderColor: highlight ? "#25D366" : "hsl(var(--border))" }}>
      <div className="text-[9px] font-mono tracking-[2px]" style={{ color: highlight ? "#25D366" : undefined }}>
        {title}
      </div>
      <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => copy(text)}
          className="px-3 py-2 text-[10px] font-mono tracking-widest border border-border flex items-center gap-1"
        >
          <Copy className="w-3 h-3" /> COPIAR
        </button>
        {children}
      </div>
    </div>
  );
}
