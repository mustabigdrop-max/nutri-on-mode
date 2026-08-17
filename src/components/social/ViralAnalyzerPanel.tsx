import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Microscope, Rocket, Copy } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, Section, callSocialAI, copyText } from "./socialUi";

type Row = { topic: string; views: string };
const emptyRows = (n: number): Row[] => Array.from({ length: n }, () => ({ topic: "", views: "" }));

const ViralAnalyzerPanel = ({ ctx }: { ctx: Record<string, any> }) => {
  const [best, setBest] = useState<Row[]>(emptyRows(3));
  const [worst, setWorst] = useState<Row[]>(emptyRows(3));
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[] | null>(null);

  const set = (list: Row[], setter: (r: Row[]) => void, i: number, k: keyof Row, v: string) => {
    const next = [...list];
    next[i] = { ...next[i], [k]: v };
    setter(next);
  };

  const fmt = (rows: Row[]) => rows.filter((r) => r.topic.trim()).map((r) => `${r.topic} — ${r.views || "?"} views`).join("\n");

  const analyze = async () => {
    if (!fmt(best) || !fmt(worst)) return toast.error("Preencha ao menos 1 melhor e 1 pior post");
    setBusy("an");
    try {
      const r = await callSocialAI({ mode: "viral_pattern", bestPosts: fmt(best), worstPosts: fmt(worst), ...ctx });
      setResult(r);
      setIdeas(null);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  const genFromFormula = async () => {
    setBusy("gen");
    try {
      const r = await callSocialAI({ mode: "viral_ideas", formula: JSON.stringify(result), ...ctx });
      setIdeas(r?.ideas || []);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  const RowInputs = ({ list, setter, label, offset }: { list: Row[]; setter: (r: Row[]) => void; label: string; offset: number }) => (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      {list.map((r, i) => (
        <div key={i} className="flex gap-2">
          <Input className="flex-1 h-9 text-sm" placeholder={`Reel ${i + 1 + offset}: tema/descrição`} value={r.topic}
            onChange={(e) => set(list, setter, i, "topic", e.target.value)} />
          <Input className="w-28 h-9 text-sm font-mono" inputMode="numeric" placeholder="views" value={r.views}
            onChange={(e) => set(list, setter, i, "views", e.target.value)} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <Section title="🔬 Analisador viral">
        <RowInputs list={best} setter={setBest} label="Seus 3 melhores Reels" offset={0} />
        <RowInputs list={worst} setter={setWorst} label="Seus 3 piores Reels" offset={3} />
        <Button onClick={analyze} disabled={busy === "an"} className="gap-2" style={{ background: ACCENT }}>
          {busy === "an" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Microscope className="w-4 h-4" />} Analisar padrão
        </Button>
      </Section>

      {result && (
        <>
          <Section title="Sua fórmula viral">
            <p className="text-[11px] font-mono text-muted-foreground">O que seus posts VIRAIS têm em comum</p>
            {(result.viral_patterns || []).map((p: string, i: number) => <p key={i} className="text-sm">✅ {p}</p>)}
            <p className="text-[11px] font-mono text-muted-foreground pt-2">O que seus posts FRACOS têm em comum</p>
            {(result.weak_patterns || []).map((p: string, i: number) => <p key={i} className="text-sm">❌ {p}</p>)}
            <p className="text-[11px] font-mono text-muted-foreground pt-2">Recomendações</p>
            {(result.recommendations || []).map((p: string, i: number) => <p key={i} className="text-sm">→ {p}</p>)}
            {result.best_times && <p className="text-sm text-muted-foreground">⏰ Melhores horários: {result.best_times}</p>}
            <Button size="sm" className="gap-2 mt-2" style={{ background: ACCENT }} onClick={genFromFormula} disabled={busy === "gen"}>
              {busy === "gen" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Rocket className="w-3 h-3" />} Gerar 3 Reels com a fórmula
            </Button>
          </Section>

          {ideas?.map((idea: any, i: number) => (
            <Section key={i} title={`Reel ${i + 1} · ${idea.funil || ""}`}
              right={<Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(`${idea.hook}\n\n${idea.roteiro}`)}><Copy className="w-3 h-3" /> Copiar</Button>}>
              <p className="text-sm font-semibold">{idea.titulo}</p>
              <p className="text-sm text-muted-foreground">Hook: {idea.hook}</p>
              <p className="text-sm whitespace-pre-wrap">{idea.roteiro}</p>
            </Section>
          ))}
        </>
      )}
    </div>
  );
};

export default ViralAnalyzerPanel;
