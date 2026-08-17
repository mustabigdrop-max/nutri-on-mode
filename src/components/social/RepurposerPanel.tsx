import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, Pill, Section, callSocialAI, copyText } from "./socialUi";
import { ORIGINAL_FORMATS, REPURPOSE_PIECES } from "@/data/socialOnExpert";

type Piece = { key: string; title?: string; blocks?: string[]; content?: string; note?: string };

const asText = (p: Piece) =>
  [p.title, ...(p.blocks || []), p.content, p.note].filter(Boolean).join("\n");

const RepurposerPanel = ({ ctx }: { ctx: Record<string, any> }) => {
  const [source, setSource] = useState("");
  const [origin, setOrigin] = useState("Reel");
  const [busy, setBusy] = useState(false);
  const [pieces, setPieces] = useState<Piece[] | null>(null);

  const run = async () => {
    if (source.trim().length < 20) return toast.error("Cole o roteiro ou legenda do conteúdo original");
    setBusy(true);
    try {
      const r = await callSocialAI({ mode: "repurpose", source, originFormat: origin, ...ctx });
      setPieces((r?.pieces as Piece[]) || []);
      toast.success("7 versões geradas");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Section title="🔄 Repurposer — 1 conteúdo vira 7">
        <p className="text-sm text-muted-foreground">
          1 hora de trabalho vira 7 dias de conteúdo. Cole o roteiro ou legenda do original.
        </p>
        <Textarea rows={6} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Cole aqui o roteiro do seu Reel..." />
        <div className="flex flex-wrap gap-2">
          {ORIGINAL_FORMATS.map((f) => (
            <Pill key={f} label={f} active={origin === f} onClick={() => setOrigin(f)} />
          ))}
        </div>
        <Button onClick={run} disabled={busy} className="gap-2" style={{ background: ACCENT }}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Repurposar
        </Button>
      </Section>

      {pieces?.map((p, i) => {
        const meta = REPURPOSE_PIECES.find((x) => x.key === p.key);
        return (
          <Section
            key={`${p.key}-${i}`}
            title={`${meta?.icon || "•"} ${i + 1}. ${meta?.label || p.key}`}
            right={
              <Button size="sm" variant="ghost" className="gap-1 h-7" onClick={() => copyText(asText(p))}>
                <Copy className="w-3 h-3" /> Copiar
              </Button>
            }
          >
            {p.title && <p className="text-sm font-semibold">{p.title}</p>}
            {(p.blocks || []).map((b, j) => (
              <p key={j} className="text-sm whitespace-pre-wrap text-muted-foreground">{b}</p>
            ))}
            {p.content && <p className="text-sm whitespace-pre-wrap">{p.content}</p>}
            {p.note && <p className="text-[11px] font-mono text-muted-foreground">→ {p.note}</p>}
          </Section>
        );
      })}
    </div>
  );
};

export default RepurposerPanel;
