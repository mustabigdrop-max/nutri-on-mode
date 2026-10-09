import { supabase } from "@/integrations/supabase/client";

export const STAGE_LABEL: Record<string, string> = {
  angulo: "Escolhendo o ângulo...",
  arquiteto: "Projetando atenção...",
  redator: "Projetando atenção...",
  critico: "Testando o gancho...",
  reescrita: "Reescrevendo pontos fracos...",
  originalidade: "Filtrando o que se repete...",
};

/** Runs gerar_reel and streams step events. Resolves with the saved script. */
export async function runGerarReel(
  body: { tema: string; objetivo: string; tom: string; quero_mais?: string },
  onStage: (stage: string) => void,
): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Entre na sua conta para gerar");
  onStage("arquiteto");
  const res = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/gerar_reel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    let msg = "Falha ao gerar reel";
    try { msg = (await res.json())?.error || msg; } catch { /* */ }
    throw new Error(msg);
  }
  const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = "";
  for (;;) {
    const chunk = await reader.read(); if (chunk.done) break;
    buf += dec.decode(chunk.value, { stream: true });
    const lines = buf.split("\n"); buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const ev = JSON.parse(line);
      if (ev.etapa === "erro") throw new Error(ev.error);
      if (ev.etapa === "pronto") return ev.script;
      if (ev.etapa === "teste") return ev.resultado;
      onStage(ev.etapa);
    }
  }
  throw new Error("A geração foi interrompida. Tente novamente.");
}

/** Merge roteiro.blocos with critic notes. */
export function mergeBlocks(script: any): any[] {
  const blocos = Array.isArray(script?.roteiro?.blocos) ? script.roteiro.blocos : [];
  const notas = script?.notas?.notas_por_bloco ?? [];
  return blocos.map((b: any) => ({ ...b, ...notas.find((n: any) => n.id === b.id), fala: b.fala }));
}

const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);

/** Content Score 0-100 from recent reels. Each part is null when there is no data. */
export function contentScore(scripts: any[], results: any[], now = new Date()) {
  const recent = scripts.slice(0, 10);
  const retencao = avg(recent.map(s => Number(s.nota_geral)).filter(n => Number.isFinite(n)));
  const hook = avg(recent.map(s => Number(mergeBlocks(s)[0]?.nota)).filter(n => Number.isFinite(n)));
  const ids = new Set(recent.map(s => s.id));
  const real3 = avg(results.filter(r => ids.has(r.script_id)).map(r => Number(r.pct_3s)).filter(n => Number.isFinite(n)));
  const weekAgo = now.getTime() - 7 * 864e5;
  const days = new Set(scripts.filter(s => new Date(s.created_at).getTime() >= weekAgo).map(s => new Date(s.created_at).toDateString()));
  const subs = [
    { k: "HOOK", v: hook == null ? null : Math.round(hook * 10) },
    { k: "RETENÇÃO", v: retencao == null ? null : Math.round(retencao * 10) },
    { k: "REAL 3S", v: real3 == null ? null : Math.round(real3) },
    { k: "RITMO", v: scripts.length ? Math.round((days.size / 7) * 100) : null },
  ];
  const vals = subs.map(s => s.v).filter((v): v is number => v != null);
  return { score: vals.length ? Math.round(avg(vals)!) : null, subs };
}
