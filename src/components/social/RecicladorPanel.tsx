import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, Section, callSocialAI, copyText } from "./socialUi";

type Bloco = { formato: string; titulo?: string; itens?: string[]; texto?: string };

const ORDEM: { key: string; label: string; icone: string }[] = [
  { key: "stories_enquete", label: "3 Stories com enquete", icone: "📱" },
  { key: "reels_falado", label: "Reels 30s (versão falada)", icone: "🎬" },
  { key: "thread_texto", label: "Thread / caption em texto corrido", icone: "📝" },
  { key: "imagem_citacao", label: "Imagem com citação (post único)", icone: "🖼️" },
  { key: "infografico", label: "Infográfico resumo (salvável)", icone: "📊" },
  { key: "respostas_comentarios", label: "5 respostas pra comentários", icone: "💬" },
  { key: "story_dado", label: "Story com dado científico", icone: "🧬" },
  { key: "desafio", label: "Versão desafio pro seguidor", icone: "🏆" },
  { key: "repost_30dias", label: "Repost otimizado (30 dias depois)", icone: "♻️" },
];

export default function RecicladorPanel({ ctx }: { ctx?: Record<string, unknown> }) {
  const [original, setOriginal] = useState("");
  const [busy, setBusy] = useState(false);
  const [blocos, setBlocos] = useState<Record<string, Bloco> | null>(null);

  const gerar = async () => {
    if (original.trim().length < 20) return toast.error("Cole o conteúdo original (slides, roteiro ou legenda)");
    setBusy(true);
    try {
      const r = await callSocialAI({ mode: "reciclar_10", conteudo_original: original, ...(ctx || {}) });
      setBlocos((r?.formatos || r) as Record<string, Bloco>);
      toast.success("Formatos gerados");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar");
    } finally {
      setBusy(false);
    }
  };

  const texto = (b?: Bloco) => [b?.titulo, ...(b?.itens || []), b?.texto].filter(Boolean).join("\n");

  return (
    <div className="space-y-4">
      <Section title="♻️ Reciclador — 1 peça vira 10 formatos">
        <p className="text-sm text-muted-foreground">
          Uma ideia boa merece 10 formatos. O algoritmo mostra cada formato pra audiências diferentes.
        </p>
        <Textarea rows={7} value={original} onChange={(e) => setOriginal(e.target.value)} placeholder="Cole aqui o carrossel, roteiro ou legenda original…" />
        <Button onClick={() => void gerar()} disabled={busy} className="gap-2" style={{ background: ACCENT }}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Gerar todos
        </Button>
      </Section>

      {blocos &&
        ORDEM.map((f) => {
          const b = blocos[f.key];
          if (!b) return null;
          return (
            <Section
              key={f.key}
              title={`${f.icone} ${f.label}`}
              right={<Button size="sm" variant="ghost" className="h-7" onClick={() => copyText(texto(b))}>Copiar</Button>}
            >
              {b.titulo && <p className="text-sm font-semibold">{b.titulo}</p>}
              {(b.itens || []).map((i, idx) => <p key={idx} className="text-sm text-muted-foreground whitespace-pre-wrap">• {i}</p>)}
              {b.texto && <p className="text-sm whitespace-pre-wrap">{b.texto}</p>}
            </Section>
          );
        })}
    </div>
  );
}
