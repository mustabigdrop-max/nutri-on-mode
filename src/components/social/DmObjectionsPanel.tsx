import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, Pill, Section, callSocialAI, copyText } from "./socialUi";
import { DM_SCENARIOS, DM_STAGES, OBJECTIONS } from "@/data/socialOnExpert";

const Right = ({ text }: { text: string }) => (
  <div className="rounded-lg border p-3 text-sm whitespace-pre-wrap" style={{ borderColor: "#22c55e55", background: "#22c55e0f" }}>
    <span className="text-[11px] font-mono text-emerald-400 block mb-1">✅ CERTO</span>
    {text}
  </div>
);

const Wrong = ({ text, why }: { text: string; why?: string }) => (
  <div className="rounded-lg border p-3 text-sm" style={{ borderColor: "#ef444455", background: "#ef44440f" }}>
    <span className="text-[11px] font-mono text-red-400 block mb-1">❌ ERRADO</span>
    <p className="whitespace-pre-wrap">{text}</p>
    {why && <p className="text-[11px] text-muted-foreground mt-1">({why})</p>}
  </div>
);

const DmObjectionsPanel = ({ ctx }: { ctx: Record<string, any> }) => {
  const [scenario, setScenario] = useState(DM_SCENARIOS[0]);
  const [busy, setBusy] = useState<string | null>(null);
  const [variation, setVariation] = useState<string | null>(null);
  const [objKey, setObjKey] = useState(OBJECTIONS[0].key);
  const [objVariation, setObjVariation] = useState<string | null>(null);

  const obj = OBJECTIONS.find((o) => o.key === objKey)!;

  const fullConversation = DM_STAGES.map(
    (s) => `ETAPA ${s.n} — ${s.title} (${s.subtitle})\n${s.lead ? `Pessoa: ${s.lead}\n` : ""}${s.right}\n`
  ).join("\n");

  const genVariation = async () => {
    setBusy("dm");
    try {
      const r = await callSocialAI({ mode: "dm_variation", scenario, baseline: fullConversation, ...ctx });
      setVariation(r?.conversation || JSON.stringify(r));
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  const genObjVariation = async () => {
    setBusy("obj");
    try {
      const r = await callSocialAI({ mode: "objection_variation", objection: obj.label, baseline: obj.answer, ...ctx });
      setObjVariation(r?.answer || JSON.stringify(r));
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      <Section title="💬 DM Scripts — conversão no privado">
        <label className="text-xs text-muted-foreground">Cenário</label>
        <Input value={scenario} onChange={(e) => setScenario(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {DM_SCENARIOS.map((s) => (
            <Pill key={s} label={s.length > 34 ? `${s.slice(0, 32)}…` : s} active={scenario === s} onClick={() => setScenario(s)} />
          ))}
        </div>
      </Section>

      {DM_STAGES.map((s) => (
        <Section key={s.n} title={`ETAPA ${s.n} — ${s.title} (${s.subtitle})`}>
          {s.lead && <p className="text-sm text-muted-foreground">Pessoa: {s.lead}</p>}
          {s.wrong && <Wrong text={s.wrong} why={s.wrongWhy} />}
          <Right text={s.right} />
          <p className="text-[11px] text-muted-foreground">→ Por que funciona: {s.why}</p>
        </Section>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => copyText(fullConversation)}>
          <Copy className="w-3 h-3" /> Copiar conversa
        </Button>
        <Button size="sm" className="gap-2" style={{ background: ACCENT }} onClick={genVariation} disabled={busy === "dm"}>
          {busy === "dm" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Gerar variação
        </Button>
      </div>

      {variation && (
        <Section title="Variação gerada" right={<Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(variation)}><Copy className="w-3 h-3" /> Copiar</Button>}>
          <p className="text-sm whitespace-pre-wrap">{variation}</p>
        </Section>
      )}

      <Section title="🛡️ Handler de objeções">
        <div className="flex flex-wrap gap-2">
          {OBJECTIONS.map((o) => (
            <Pill key={o.key} label={o.label} active={objKey === o.key} onClick={() => { setObjKey(o.key); setObjVariation(null); }} />
          ))}
        </div>
        {obj.wrong && <Wrong text={obj.wrong} why={obj.wrongWhy} />}
        <Right text={obj.answer} />
        <p className="text-[11px] text-muted-foreground">Gatilhos: {obj.triggers}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => copyText(obj.answer)}>
            <Copy className="w-3 h-3" /> Copiar
          </Button>
          <Button size="sm" className="gap-2" style={{ background: ACCENT }} onClick={genObjVariation} disabled={busy === "obj"}>
            {busy === "obj" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Gerar variação
          </Button>
        </div>
        {objVariation && (
          <div className="rounded-lg border p-3 text-sm whitespace-pre-wrap" style={{ borderColor: `${ACCENT}44` }}>
            {objVariation}
          </div>
        )}
      </Section>
    </div>
  );
};

export default DmObjectionsPanel;
