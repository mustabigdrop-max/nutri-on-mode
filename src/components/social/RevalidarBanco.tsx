// PROMPT Q2 — Revalidar Banco: runs reels without nota_final through the quality gate, one per request.
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { custoRevalidacao, contarPilares } from "@/lib/revalidarBanco";

const C = { cyan: "#00D4FF", gold: "#B8922A", green: "#5DCAA5", amber: "#EF9F27", red: "#EF4444", text: "#C8C8D8", white: "#F0F0F8", muted: "#555566", dim: "#333340" };
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace" };
const ESTADO: Record<string, { l: string; c: string }> = { elite: { l: "ELITE", c: C.cyan }, aprovado: { l: "APROVADO", c: C.green }, rascunho: { l: "RASCUNHO", c: C.amber } };
const fmt = (v: any, d = 1) => v == null || !Number.isFinite(Number(v)) ? "—" : Number(v).toFixed(d).replace(".", ",");
const cell: React.CSSProperties = { fontFamily: F.m, fontSize: 9, color: C.text, padding: "4px 6px", borderBottom: `1px solid ${C.dim}`, verticalAlign: "top" };

type Linha = { id: string; titulo: string; c1: any; c2: any; teto: any; nota: any; estado: string; pend: string };

export default function RevalidarBanco() {
  const [busy, setBusy] = useState(false);
  const [prog, setProg] = useState<{ feitos: number; total: number } | null>(null);
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [rel, setRel] = useState<{ p1: number; p2: number; p1Slugs: string[]; parou: string | null } | null>(null);

  const rodar = async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return toast.error("Entre na sua conta.");
    const { data: todos } = await supabase.from("retention_scripts").select("id, slug, tema, titulo, nota_final").eq("user_id", user.id).limit(1000);
    const fila = (todos ?? []).filter(s => s.nota_final == null);
    const pil = contarPilares(todos ?? []);
    const c = custoRevalidacao(fila.length);
    if (!fila.length) { setLinhas([]); setRel({ ...pil, parou: null }); return toast("Todos os reels do Banco já têm nota final."); }
    if (!window.confirm(`Revalidar ${fila.length} reel(s) do Banco pela porta de qualidade?\nCusto estimado: de ${c.min} a ${c.max} solicitações de Análise (3 por reel, até ${c.porReelMax} se precisar de 2 rodadas do Revisor).\nConta no limite diário de gerações. Nada será publicado.`)) return;
    setBusy(true); setLinhas([]); setRel(null); setProg({ feitos: 0, total: fila.length });
    let parou: string | null = null; const out: Linha[] = [];
    for (let i = 0; i < fila.length; i++) {
      const s = fila[i];
      const { data, error } = await supabase.functions.invoke("gerar_reel", { body: { modo: "revalidar", script_id: s.id } });
      const d: any = data ?? {};
      if (d.limite) { parou = `${d.error} Revalidados: ${out.length} de ${fila.length}.`; break; }
      if (error || d.error) { out.push({ id: s.id, titulo: s.titulo || s.tema, c1: null, c2: null, teto: null, nota: null, estado: "erro", pend: d.error || "Falha na revalidação" }); }
      else {
        const r = d.script;
        out.push({ id: s.id, titulo: r.titulo || r.tema, c1: r.nota_c1, c2: r.nota_c2, teto: r.teto_verificador, nota: r.nota_final, estado: r.status_qualidade,
          pend: (r.pendencias ?? []).map((p: any) => `B${p.bloco} ${p.regra}`).join("; ") || "—" });
      }
      setLinhas([...out]); setProg({ feitos: i + 1, total: fila.length });
    }
    setRel({ ...pil, parou }); setBusy(false); setProg(null);
    toast.success(`${out.filter(l => l.estado !== "erro").length} reel(s) revalidado(s).`);
  };

  return (
    <div style={{ border: `1px solid ${C.dim}`, padding: 8, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
      <button type="button" onClick={rodar} disabled={busy} style={{ background: "transparent", border: `1px solid ${C.cyan}60`, color: C.cyan, fontFamily: F.t, fontWeight: 700, fontSize: 12, padding: "7px 10px", cursor: busy ? "wait" : "pointer", borderRadius: 0 }}>
        {busy && prog ? `REVALIDANDO ${prog.feitos}/${prog.total}…` : "REVALIDAR BANCO"}
      </button>
      {rel && (
        <div style={{ fontFamily: F.m, fontSize: 9, color: C.text }}>
          Reels de referência no Banco: Pilar 1 (p1-) {rel.p1} · Pilar 2 (p2-) {rel.p2}
          {rel.p1 === 0 && <div style={{ color: C.red }}>Pilar 1 ausente: reinserir o seed.</div>}
          {rel.parou && <div style={{ color: C.amber }}>{rel.parou}</div>}
        </div>
      )}
      {linhas && linhas.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead><tr>{["Reel", "C1", "C2", "Verificador", "Final", "Estado", "Pendências"].map(h => <th key={h} style={{ ...cell, color: C.muted, textAlign: "left" }}>{h}</th>)}</tr></thead>
            <tbody>{linhas.map(l => {
              const e = ESTADO[l.estado] ?? { l: "ERRO", c: C.red };
              return <tr key={l.id}><td style={cell}>{l.titulo}</td><td style={cell}>{fmt(l.c1)}</td><td style={cell}>{fmt(l.c2)}</td><td style={cell}>{fmt(l.teto, 0)}</td>
                <td style={cell}>{fmt(l.nota)}</td><td style={{ ...cell, color: e.c }}>{e.l}</td><td style={cell}>{l.pend}</td></tr>;
            })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
