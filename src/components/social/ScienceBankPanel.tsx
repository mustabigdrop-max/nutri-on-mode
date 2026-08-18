import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Loader2, Rocket, Search } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, ACCENT2, Section, callSocialAI, copyText } from "./socialUi";
import { SCIENCE_CATEGORIES, SCIENCE_FACTS } from "@/data/socialOnSurreal";

const ScienceBankPanel = ({ ctx }: { ctx: Record<string, any> }) => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [posts, setPosts] = useState<Record<string, any>>({});

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return SCIENCE_FACTS.filter(
      (f) =>
        (!cat || f.category === cat) &&
        (!term || `${f.fact} ${f.source} ${f.category}`.toLowerCase().includes(term)),
    );
  }, [q, cat]);

  const gerar = async (id: string, fact: string, source: string) => {
    setBusy(id);
    try {
      const r = await callSocialAI({ mode: "science_post", fact, source, ...ctx });
      setPosts({ ...posts, [id]: r });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      <Section title="📚 Banco de dados científicos">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-3 top-3 text-muted-foreground" />
          <Input className="pl-8" placeholder="Buscar: sono e músculo, creatina, hábito…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SCIENCE_CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => setCat(cat === c ? null : c)}
              className="px-2.5 py-1 rounded-full text-[11px] border transition-colors"
              style={{ borderColor: cat === c ? ACCENT : "rgba(255,255,255,0.12)", background: cat === c ? `${ACCENT}22` : "transparent" }}>
              {c}
            </button>
          ))}
        </div>
        <p className="text-[11px] font-mono text-muted-foreground">{list.length} de {SCIENCE_FACTS.length} dados · todos com fonte verificável</p>
      </Section>

      {list.map((f) => (
        <Section key={f.id} title={`${f.emoji} ${f.category}`} right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(`${f.fact}\nFonte: ${f.source}`)}>
            <Copy className="w-3 h-3" /> Copiar
          </Button>
        }>
          <p className="text-sm">{f.fact}</p>
          <p className="text-[11px] font-mono text-muted-foreground">Fonte: {f.source}</p>
          <Button size="sm" className="gap-1" style={{ background: ACCENT }} disabled={busy !== null}
            onClick={() => gerar(f.id, f.fact, f.source)}>
            {busy === f.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Rocket className="w-3 h-3" />} Criar post com esse dado
          </Button>
          {posts[f.id] && (
            <div className="space-y-1 pt-1">
              <p className="text-xs font-mono" style={{ color: ACCENT2 }}>{posts[f.id].hook}</p>
              <p className="text-sm whitespace-pre-wrap">{posts[f.id].caption}</p>
              {posts[f.id].hashtags?.length ? (
                <p className="text-[11px]" style={{ color: ACCENT2 }}>{posts[f.id].hashtags.join(" ")}</p>
              ) : null}
              <Button size="sm" variant="ghost" className="h-7 gap-1"
                onClick={() => copyText(`${posts[f.id].hook}\n\n${posts[f.id].caption}\n\n${(posts[f.id].hashtags || []).join(" ")}`)}>
                <Copy className="w-3 h-3" /> Copiar post
              </Button>
            </div>
          )}
        </Section>
      ))}
    </div>
  );
};

export default ScienceBankPanel;
