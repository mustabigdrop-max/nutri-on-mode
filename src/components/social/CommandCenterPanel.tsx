import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ACCENT2, Section, Pill, copyText } from "./socialUi";
import { cleanCaption } from "@/lib/captionText";
import { RetentionReview } from "./RetentionReview";
import RetentionFeedbackPanel from "./RetentionFeedbackPanel";

type Tool = "decoder" | "forge" | "hooks" | "sniper" | "impact_angulos" | "impact_pesquisa" | "impact_writer";
const TOOLS: { id: Tool; label: string; hint: string; placeholder: string; group: "cc" | "impact" }[] = [
  { id: "decoder", label: "Viral Decoder", hint: "Por que viralizou + sua versão pronta pra gravar", placeholder: 'Tema, hook ou descrição. Ex: "Para de buscar motivação"', group: "cc" },
  { id: "forge", label: "Content Forge", hint: "1 tema → Reel, Carrossel, Stories, Legenda e Hashtags", placeholder: 'Tema. Ex: "creatina e cognição"', group: "cc" },
  { id: "hooks", label: "Hook Lab", hint: "Testa e pontua hooks antes de gravar", placeholder: "Cole 1 ou mais hooks, um por linha", group: "cc" },
  { id: "sniper", label: "Sales Sniper", hint: "Conecta conteúdo a produto e receita", placeholder: "Produto, preço, meta de vendas e público", group: "cc" },
  { id: "impact_angulos", label: "Ângulos", hint: "3 abordagens estratégicas com score de impacto + roteiro pronto", placeholder: 'Tema ou frase. Ex: "Por que você desiste no dia 14"', group: "impact" },
  { id: "impact_pesquisa", label: "Pesquisa", hint: "Tendências do nicho, insights de impacto e gaps", placeholder: 'Tema ou nicho. Ex: "desistência fitness"', group: "impact" },
  { id: "impact_writer", label: "Writer", hint: "Conteúdo completo: Legenda, Roteiro, Carrossel e Stories", placeholder: 'Tema (+ formato/tom opcionais). Ex: "Motivação é mentira — formato: carrossel"', group: "impact" },
];

export default function CommandCenterPanel({ onBack }: { onBack: () => void }) {
  const [tool, setTool] = useState<Tool>("decoder");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [review, setReview] = useState<unknown>(null);
  const [prefill, setPrefill] = useState<{ id: number; tempo: string; previsto: number }[]>([]);
  const def = TOOLS.find((t) => t.id === tool) ?? TOOLS[0];
  const ccTools = TOOLS.filter((t) => t.group === "cc");
  const impactTools = TOOLS.filter((t) => t.group === "impact");

  const run = async () => {
    if (!input.trim()) return toast.error("Preencha o campo");
    setBusy(true);
    setReview(null);
    try {
      const { data, error } = await supabase.functions.invoke("command-center", { body: { tool, input } });
      if (error) {
        const ctx = (error as any)?.context;
        let msg = "Falha ao gerar análise";
        if (ctx instanceof Response) { try { msg = (await ctx.clone().json())?.error || msg; } catch { /* */ } }
        throw new Error(msg);
      }
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(cleanCaption((data as any).result));
      setReview(data?.critica_retencao);
      const script = (data as any)?.roteiros_retencao?.[0]?.blocos ?? [];
      const notes = (data as any)?.critica_retencao?.[0]?.notas_por_bloco ?? [];
      setPrefill(script.map((b: any) => ({ id: b.id, tempo: b.tempo, previsto: notes.find((n: any) => n.id === b.id)?.nota })).filter((b: any) => typeof b.previsto === "number"));
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">← Modos</Button>
      <Section title="🎯 Command Center · analisa, multiplica e converte">
        <div className="flex flex-wrap gap-2">
          {ccTools.map((t) => <Pill key={t.id} label={t.label} active={tool === t.id} onClick={() => { setTool(t.id); setResult(""); setReview(null); }} />)}
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">✍️ Impact Writer · cria conteúdo pronto</p>
        <div className="flex flex-wrap gap-2">
          {impactTools.map((t) => <Pill key={t.id} label={t.label} active={tool === t.id} onClick={() => { setTool(t.id); setResult(""); setReview(null); }} />)}
        </div>
        <p className="text-xs text-muted-foreground">{def.hint}</p>
        <Textarea rows={4} value={input} onChange={(e) => setInput(e.target.value)} placeholder={def.placeholder} />
        <Button onClick={run} disabled={busy} className="gap-2" style={{ background: ACCENT2, color: "#010108" }}>
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Gerar análise
        </Button>
      </Section>
      {result && (
        <Section title={def.label} right={<Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(result)}><Copy className="w-3 h-3" /> Copiar</Button>}>
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{result}</pre>
          <RetentionReview value={review} />
        </Section>
      )}
      <RetentionFeedbackPanel prefill={prefill} />
    </div>
  );
}
