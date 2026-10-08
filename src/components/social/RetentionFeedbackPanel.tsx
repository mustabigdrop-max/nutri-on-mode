import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ACCENT2, Section } from "./socialUi";

type Prefill = { id: number; tempo: string; previsto: number }[];
const parseBlocks = (t: string) => t.split("\n").map(l => l.split("|").map(s => s.trim())).filter(p => p.length >= 3)
  .map(([id, tempo, nota]) => ({ id: Number(id), tempo, previsto: Number(nota.replace(",", ".")) }));
const parsePoints = (t: string) => t.split(/[\n;]/).map(l => l.match(/(\d+(?:[.,]\d+)?)\s*s?\s*[:=]\s*(\d+(?:[.,]\d+)?)/)).filter(Boolean)
  .map(m => ({ segundo: Number(m![1].replace(",", ".")), audiencia: Number(m![2].replace(",", ".")) }));

export default function RetentionFeedbackPanel({ prefill }: { prefill?: Prefill }) {
  const [blocks, setBlocks] = useState("");
  const [points, setPoints] = useState("");
  const [pass3, setPass3] = useState("");
  const [avg, setAvg] = useState("");
  const [busy, setBusy] = useState(false);
  const [r, setR] = useState<any>(null);
  useEffect(() => { if (prefill?.length) setBlocks(prefill.map(b => `${b.id} | ${b.tempo} | ${b.previsto}`).join("\n")); }, [prefill]);

  const run = async () => {
    setBusy(true); setR(null);
    try {
      const { data, error } = await supabase.functions.invoke("retention-feedback", { body: { blocos: parseBlocks(blocks), pontos: parsePoints(points), passou_3s: pass3, tempo_medio_s: avg } });
      if (error) { let msg = "Falha ao analisar"; const c = (error as any)?.context; if (c instanceof Response) { try { msg = (await c.clone().json())?.error || msg; } catch { /* */ } } throw new Error(msg); }
      setR(data);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return <Section title="📊 Previsto vs real · vídeo publicado">
    <p className="text-xs text-muted-foreground">Blocos: um por linha "id | tempo | nota prevista". Ex: 1 | 0-2s | 7</p>
    <Textarea rows={4} value={blocks} onChange={e => setBlocks(e.target.value)} placeholder={"1 | 0-2s | 7\n2 | 2-6s | 8"} />
    <p className="text-xs text-muted-foreground">Audiência real por segundo "segundo: %". Ex: 0: 100, 3: 62</p>
    <Textarea rows={4} value={points} onChange={e => setPoints(e.target.value)} placeholder={"0: 100\n3: 62\n10: 41"} />
    <div className="flex gap-2">
      <Input inputMode="decimal" placeholder="% que passou dos 3s" value={pass3} onChange={e => setPass3(e.target.value)} />
      <Input inputMode="decimal" placeholder="Tempo médio assistido (s)" value={avg} onChange={e => setAvg(e.target.value)} />
    </div>
    <Button onClick={run} disabled={busy} className="gap-2" style={{ background: ACCENT2, color: "#010108" }}>{busy && <Loader2 className="w-4 h-4 animate-spin" />} Comparar</Button>
    {r && <div className="space-y-3 text-sm border-t border-border pt-3">
      {r.maior_queda ? <p className="font-semibold text-destructive">Maior queda: {r.maior_queda.segundo}s · bloco {r.maior_queda.bloco || "fora dos blocos"} · -{r.maior_queda.queda_pontos} pontos. {r.maior_queda.causa_provavel}</p> : <p>Sem queda entre os pontos informados.</p>}
      {r.previsto_vs_real?.map((c: any) => <div key={c.bloco} className="border-l border-border pl-3">
        <p className={c.erro !== null && Math.abs(c.erro) >= 2 ? "font-semibold text-destructive" : "font-semibold"}>Bloco {c.bloco} · previsto {c.previsto} · real {c.real ?? "sem dado"}</p>
        {c.hipotese && <p className="text-muted-foreground">{c.hipotese}</p>}
      </div>)}
      <p className="text-[11px] text-muted-foreground">Real = parte do público do início do bloco que chegou ao fim dele, de 0 a 10.</p>
      {r.padroes_confirmados?.length > 0 && <div><p className="font-semibold">Padrões confirmados (3+ vídeos) · salvos no perfil</p>{r.padroes_confirmados.map((p: any) => <p key={p.chave}>✅ {p.descricao} · {p.videos} vídeos</p>)}</div>}
      {r.indicios?.length > 0 && <div><p className="font-semibold">Indícios (ainda não são regra)</p>{r.indicios.map((p: any) => <p key={p.chave} className="text-muted-foreground">• {p.descricao} · {p.videos} de 3 vídeos</p>)}</div>}
      {r.ajuste_para_proximo_reel?.length > 0 && <div><p className="font-semibold">Ajustes para o próximo Reel</p>{r.ajuste_para_proximo_reel.map((a: string, i: number) => <p key={i}>→ {a}</p>)}</div>}
    </div>}
  </Section>;
}
