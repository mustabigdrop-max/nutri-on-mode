import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Dna, Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, Section, callSocialAI, copyText } from "./socialUi";

type Dna = {
  identidade_visual?: string[];
  formato_vencedor?: string[];
  hook_pattern?: string[];
  audiencia?: string[];
  formula?: string;
  posts?: { titulo: string; hook: string; roteiro: string }[];
};

const ContentDnaPanel = ({ ctx }: { ctx: Record<string, any> }) => {
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [dna, setDna] = useState<Dna | null>(null);

  const run = async (withPosts: boolean) => {
    setBusy(withPosts ? "posts" : "dna");
    try {
      const r = await callSocialAI({ mode: "content_dna", generatePosts: withPosts, bestPosts: notes, ...ctx });
      setDna((prev) => (withPosts ? { ...(prev || {}), ...r } : r));
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  const List = ({ title, items }: { title: string; items?: string[] }) =>
    items?.length ? (
      <div className="space-y-1">
        <p className="text-[11px] font-mono" style={{ color: ACCENT }}>{title}</p>
        <ul className="text-sm space-y-1">{items.map((x, i) => <li key={i}>→ {x}</li>)}</ul>
      </div>
    ) : null;

  return (
    <div className="space-y-4">
      <Section title="🧬 Content DNA">
        <p className="text-sm text-muted-foreground">
          Descreva seus melhores posts (tema, formato, resultado) para o sistema mapear o padrão que faz o SEU conteúdo funcionar.
        </p>
        <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Reel de perna com hook '1.247 refeições' — 82k views; carrossel de sono — 900 salvamentos…" />
        <Button className="gap-2" style={{ background: ACCENT }} disabled={!!busy} onClick={() => run(false)}>
          {busy === "dna" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dna className="w-4 h-4" />} Mapear meu DNA
        </Button>
      </Section>

      {dna && (
        <Section title="Seu código genético de conteúdo" right={
          <Button size="sm" variant="ghost" className="h-7 gap-1"
            onClick={() => copyText(JSON.stringify(dna, null, 2))}><Copy className="w-3 h-3" /> Copiar</Button>
        }>
          <List title="IDENTIDADE VISUAL" items={dna.identidade_visual} />
          <List title="FORMATO VENCEDOR" items={dna.formato_vencedor} />
          <List title="HOOK PATTERN" items={dna.hook_pattern} />
          <List title="AUDIÊNCIA" items={dna.audiencia} />
          {dna.formula && (
            <p className="text-sm p-3 rounded-lg" style={{ background: `${ACCENT}18` }}>
              🧬 <strong>Fórmula replicável:</strong> {dna.formula}
            </p>
          )}
          <Button size="sm" className="gap-2" style={{ background: ACCENT }} disabled={!!busy} onClick={() => run(true)}>
            {busy === "posts" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Rocket className="w-3 h-3" />} Gerar 5 posts usando meu DNA
          </Button>
        </Section>
      )}

      {dna?.posts?.map((p, i) => (
        <Section key={i} title={`${i + 1}. ${p.titulo}`} right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(`${p.titulo}\n${p.hook}\n\n${p.roteiro}`)}>
            <Copy className="w-3 h-3" /> Copiar
          </Button>
        }>
          <p className="text-[11px] font-mono text-muted-foreground">Hook: {p.hook}</p>
          <p className="text-sm whitespace-pre-wrap">{p.roteiro}</p>
        </Section>
      ))}
    </div>
  );
};

export default ContentDnaPanel;
