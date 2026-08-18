import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Loader2, Rocket, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, ACCENT2, Section, callSocialAI, copyText } from "./socialUi";
import { AUTHORITY_CREDENTIALS, CONTROVERSIES } from "@/data/socialOnSurreal";

const AuthorityPanel = ({ ctx, onOpenScience }: { ctx: Record<string, any>; onOpenScience?: () => void }) => {
  const [stats, setStats] = useState({ clientes: "3", depoimentos: "1", posts_resultado: "2", semanas: "12", posts_mes: "24", stories_mes: "87" });
  const [busy, setBusy] = useState<number | null>(null);
  const [posts, setPosts] = useState<Record<number, any>>({});

  const gerar = async (i: number, tese: string, base: string) => {
    setBusy(i);
    try {
      const r = await callSocialAI({ mode: "controversy_post", thesis: tese, evidence: base, ...ctx });
      setPosts({ ...posts, [i]: r });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  const num = (k: keyof typeof stats, label: string) => (
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <Input value={stats[k]} inputMode="numeric" onChange={(e) => setStats({ ...stats, [k]: e.target.value })} />
    </div>
  );

  return (
    <div className="space-y-4">
      <Section title="1. Credenciais">
        <ul className="text-sm space-y-1">
          {AUTHORITY_CREDENTIALS.map((c) => <li key={c}>☑ {c}</li>)}
        </ul>
        <p className="text-[11px] font-mono text-muted-foreground">Menção sugerida: 2-3x por semana, de forma natural.</p>
      </Section>

      <Section title="2. Prova social (construir)">
        <div className="grid grid-cols-3 gap-2">
          {num("clientes", "Clientes com resultado")}
          {num("depoimentos", "Depoimentos")}
          {num("posts_resultado", "Posts de resultado no mês")}
        </div>
        <p className="text-[11px] font-mono" style={{ color: Number(stats.posts_resultado) >= 4 ? ACCENT2 : "#FF6B6B" }}>
          Meta: 4 posts de resultado por mês · faltam {Math.max(0, 4 - Number(stats.posts_resultado || 0))}
        </p>
      </Section>

      <Section title="3. Conteúdo científico (demonstrar)" right={
        onOpenScience ? <Button size="sm" variant="ghost" className="h-7" onClick={onOpenScience}>📚 Banco de dados</Button> : undefined
      }>
        <p className="text-sm text-muted-foreground">Meta: citar 2 pesquisadores diferentes por semana. Banco com 50 dados científicos com fonte verificável.</p>
      </Section>

      <Section title="4. Consistência (provar)">
        <div className="grid grid-cols-3 gap-2">
          {num("semanas", "Semanas consecutivas")}
          {num("posts_mes", "Posts no mês")}
          {num("stories_mes", "Stories no mês")}
        </div>
      </Section>

      <Section title="5. Controvérsia estratégica (provocar)">
        <p className="text-[11px] text-muted-foreground">
          Não é ser ofensivo — é questionar o senso comum com dado científico por trás.
        </p>
        <div className="space-y-3">
          {CONTROVERSIES.map((c, i) => (
            <div key={c.text} className="rounded-lg border p-3 space-y-2" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <p className="text-sm font-semibold">“{c.text}”</p>
              <p className="text-[11px] font-mono text-muted-foreground">{c.base}</p>
              <div className="flex gap-2">
                <Button size="sm" className="gap-1" style={{ background: ACCENT }} disabled={busy !== null}
                  onClick={() => gerar(i, c.text, c.base)}>
                  {busy === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <Rocket className="w-3 h-3" />} Gerar post
                </Button>
                {posts[i] && (
                  <Button size="sm" variant="ghost" className="gap-1"
                    onClick={() => copyText(`${posts[i].hook}\n\n${posts[i].caption}\n\n${(posts[i].hashtags || []).join(" ")}`)}>
                    <Copy className="w-3 h-3" /> Copiar
                  </Button>
                )}
              </div>
              {posts[i] && (
                <div className="space-y-1">
                  <p className="text-xs font-mono" style={{ color: ACCENT2 }}>{posts[i].hook}</p>
                  <p className="text-sm whitespace-pre-wrap">{posts[i].caption}</p>
                  {posts[i].self_comment && <p className="text-[11px] text-muted-foreground">💬 {posts[i].self_comment}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-[11px] font-mono flex items-center gap-1 text-muted-foreground">
          <ShieldCheck className="w-3 h-3" /> Toda tese vem com base científica anexada.
        </p>
      </Section>
    </div>
  );
};

export default AuthorityPanel;
