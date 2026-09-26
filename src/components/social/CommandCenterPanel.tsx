import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ACCENT2, Section, Pill, copyText } from "./socialUi";
import { cleanCaption } from "@/lib/captionText";

type Tool = "decoder" | "forge" | "hooks" | "sniper";
const TOOLS: { id: Tool; label: string; hint: string; placeholder: string }[] = [
  { id: "decoder", label: "Viral Decoder", hint: "Por que viralizou + sua versão pronta pra gravar", placeholder: 'Tema, hook ou descrição. Ex: "Para de buscar motivação"' },
  { id: "forge", label: "Content Forge", hint: "1 tema → Reel, Carrossel, Stories, Legenda e Hashtags", placeholder: 'Tema. Ex: "creatina e cognição"' },
  { id: "hooks", label: "Hook Lab", hint: "Testa e pontua hooks antes de gravar", placeholder: "Cole 1 ou mais hooks, um por linha" },
  { id: "sniper", label: "Sales Sniper", hint: "Conecta conteúdo a produto e receita", placeholder: "Produto, preço, meta de vendas e público" },
];

export default function CommandCenterPanel({ onBack }: { onBack: () => void }) {
  const [tool, setTool] = useState<Tool>("decoder");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const def = TOOLS.find((t) => t.id === tool)!;

  const run = async () => {
    if (!input.trim()) return toast.error("Preencha o campo");
    setBusy(true);
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
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">← Modos</Button>
      <Section title="🎯 Command Center · analisa, multiplica e converte">
        <div className="flex flex-wrap gap-2">
          {TOOLS.map((t) => <Pill key={t.id} label={t.label} active={tool === t.id} onClick={() => { setTool(t.id); setResult(""); }} />)}
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
        </Section>
      )}
    </div>
  );
}
