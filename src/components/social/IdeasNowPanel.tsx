import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, Section, callSocialAI, copyText } from "./socialUi";
import { SITUATIONS } from "@/data/socialOnExpert";

const IdeasNowPanel = ({ ctx, onUseIdea }: { ctx: Record<string, any>; onUseIdea?: (topic: string) => void }) => {
  const [sit, setSit] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  const gen = async (situation: string, append = false) => {
    setSit(situation);
    setBusy(true);
    try {
      const r = await callSocialAI({
        mode: "ideas_now",
        situation,
        exclude: append ? ideas.map((i) => i.titulo).join(" | ") : "",
        ...ctx,
      });
      const list = r?.ideas || [];
      setIdeas(append ? [...ideas, ...list] : list);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Section title="🎯 O que postar agora?">
        <p className="text-sm text-muted-foreground">O que você está fazendo?</p>
        <div className="flex flex-wrap gap-2">
          {SITUATIONS.map((s) => (
            <button key={s.key} type="button" onClick={() => gen(s.label)}
              className="px-3 py-2 rounded-lg text-xs border transition-colors"
              style={{
                borderColor: sit === s.label ? ACCENT : "rgba(255,255,255,0.12)",
                background: sit === s.label ? `${ACCENT}22` : "transparent",
              }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        {busy && <p className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Gerando ideias…</p>}
      </Section>

      {ideas.map((idea, i) => (
        <Section key={i} title={`${i + 1}. ${idea.titulo || "Ideia"}`}
          right={<Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(`${idea.titulo}\n\n${idea.roteiro || ""}`)}><Copy className="w-3 h-3" /> Copiar</Button>}>
          <p className="text-[11px] font-mono text-muted-foreground">
            Funil: {String(idea.funil || "").toUpperCase()} · Hook: {idea.hook}
            {idea.produto ? ` · Produto: ${idea.produto}` : ""}
          </p>
          {open === i && idea.roteiro && <p className="text-sm whitespace-pre-wrap">{idea.roteiro}</p>}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setOpen(open === i ? null : i)}>
              {open === i ? "Ocultar roteiro" : "Ver roteiro completo"}
            </Button>
            {onUseIdea && (
              <Button size="sm" style={{ background: ACCENT }} onClick={() => onUseIdea(idea.titulo)}>
                Criar conteúdo
              </Button>
            )}
          </div>
        </Section>
      ))}

      {ideas.length > 0 && sit && (
        <Button variant="outline" className="gap-2 w-full" disabled={busy} onClick={() => gen(sit, true)}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Gerar mais 5 ideias
        </Button>
      )}
    </div>
  );
};

export default IdeasNowPanel;
