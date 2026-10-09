import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const C = { cyan: "#00D4FF", gold: "#B8922A", red: "#EF4444", text: "#C8C8D8", white: "#F0F0F8", muted: "#555566", dim: "#333340" };
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace" };
const inp: React.CSSProperties = { background: "#0A0A12", border: `1px solid ${C.dim}`, color: C.white, fontFamily: F.m, fontSize: 11, padding: "5px 7px", borderRadius: 0, boxSizing: "border-box" };
const lbl: React.CSSProperties = { fontFamily: F.m, fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase" };
const sm = (c: string): React.CSSProperties => ({ background: "transparent", border: `1px solid ${c}60`, color: c, fontFamily: F.t, fontWeight: 700, fontSize: 11, padding: "4px 8px", cursor: "pointer", borderRadius: 0 });

/** Matriz: edit pillars, register real cases and see 3s retention per pillar x angle (only measured reels). */
export default function ContentMatrixPanel() {
  const [pillars, setPillars] = useState<any[]>([]);
  const [angles, setAngles] = useState<string[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [cells, setCells] = useState<Record<string, number[]>>({});
  const [novo, setNovo] = useState({ titulo: "", descricao: "", autorizado: false });

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    await supabase.rpc("seed_content_pillars", { _user_id: user.id });
    const [p, a, c, b, r] = await Promise.all([
      supabase.from("content_pillars").select("*").eq("user_id", user.id).order("ordem"),
      supabase.from("content_angles").select("nome").order("id"),
      supabase.from("content_cases").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("reel_bank").select("pilar, angulo, script_id").eq("user_id", user.id).not("script_id", "is", null),
      supabase.from("retention_results").select("script_id, pct_3s").eq("user_id", user.id),
    ]);
    setPillars(p.data ?? []); setAngles((a.data ?? []).map((x: any) => x.nome)); setCases(c.data ?? []);
    const r3 = new Map((r.data ?? []).filter((x: any) => x.pct_3s != null).map((x: any) => [x.script_id, Number(x.pct_3s)]));
    const m: Record<string, number[]> = {};
    for (const x of b.data ?? []) { const v = r3.get(x.script_id); if (v == null || !x.pilar || !x.angulo) continue; (m[`${x.pilar}|${x.angulo}`] ??= []).push(v); }
    setCells(m);
  };
  useEffect(() => { load(); }, []);

  const upd = async (id: string, patch: any) => {
    setPillars(ps => ps.map(p => (p.id === id ? { ...p, ...patch } : p)));
    const { error } = await supabase.from("content_pillars").update(patch).eq("id", id);
    if (error) toast.error(error.message);
  };
  const addCase = async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user || !novo.titulo.trim()) return;
    const { error } = await supabase.from("content_cases").insert({ user_id: user.id, ...novo, titulo: novo.titulo.trim() });
    if (error) return toast.error(error.message);
    setNovo({ titulo: "", descricao: "", autorizado: false }); load();
  };
  const delCase = async (id: string) => { await supabase.from("content_cases").delete().eq("id", id); load(); };

  const all = Object.values(cells).flat();
  const max = all.length ? Math.max(...all) : 1;
  const total = pillars.filter(p => p.ativo).reduce((s, p) => s + p.qtd_diaria, 0);
  const temCaso = cases.some(c => c.autorizado && c.ativo);

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ ...lbl, color: C.gold }}>Pilares · {total} ideias por dia</div>
      {pillars.map(p => (
        <div key={p.id} style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, opacity: p.ativo ? 1 : 0.45 }}>
          <input type="checkbox" checked={p.ativo} onChange={e => upd(p.id, { ativo: e.target.checked })} aria-label="Ativo" />
          <input style={{ ...inp, flex: 1 }} value={p.nome} onChange={e => setPillars(ps => ps.map(x => (x.id === p.id ? { ...x, nome: e.target.value } : x)))} onBlur={e => e.target.value.trim() && upd(p.id, { nome: e.target.value.trim() })} />
          <input type="number" min={0} max={100} style={{ ...inp, width: 56 }} value={p.qtd_diaria} onChange={e => upd(p.id, { qtd_diaria: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} />
        </div>
      ))}
      <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
        Cada pilar usa pelo menos 5 ângulos por lote e nenhum passa de 30%. {pillars.some(p => p.exige_caso_real) && !temCaso && "Provas e casos reais fica parado até você cadastrar um caso autorizado; as vagas vão para Comportamento, Mitos e Profissionais."}
      </div>

      <div style={{ ...lbl, marginTop: 14 }}>Casos reais</div>
      {cases.map(c => (
        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontFamily: F.m, fontSize: 10, color: C.text, marginTop: 4 }}>
          <span>{c.titulo} · <span style={{ color: c.autorizado ? C.cyan : C.red }}>{c.autorizado ? "AUTORIZADO" : "SEM AUTORIZAÇÃO"}</span></span>
          <button type="button" style={sm(C.muted)} onClick={() => delCase(c.id)}>REMOVER</button>
        </div>
      ))}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
        <input style={inp} placeholder="Título do caso" value={novo.titulo} onChange={e => setNovo(n => ({ ...n, titulo: e.target.value }))} />
        <textarea style={{ ...inp, minHeight: 50 }} placeholder="O que aconteceu, com dados reais" value={novo.descricao} onChange={e => setNovo(n => ({ ...n, descricao: e.target.value }))} />
        <label style={{ ...lbl, display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={novo.autorizado} onChange={e => setNovo(n => ({ ...n, autorizado: e.target.checked }))} />Tenho autorização para usar</label>
        <button type="button" style={sm(C.cyan)} onClick={addCase}>ADICIONAR CASO</button>
      </div>

      <div style={{ ...lbl, marginTop: 14, color: C.gold }}>Matriz · retenção média aos 3s</div>
      {!all.length ? <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, marginTop: 6 }}>Sem dados reais ainda. Lance o resultado do último reel.</div> : (
        <div style={{ overflowX: "auto", marginTop: 6 }}>
          <table style={{ borderCollapse: "collapse", fontFamily: F.m, fontSize: 9 }}>
            <thead><tr><th />{angles.map(a => <th key={a} style={{ color: C.muted, padding: 3, fontWeight: 400, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{a}</th>)}</tr></thead>
            <tbody>{pillars.map(p => (
              <tr key={p.id}><td style={{ color: C.text, padding: "3px 6px 3px 0", whiteSpace: "nowrap", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>{p.nome}</td>
                {angles.map(a => { const xs = cells[`${p.nome}|${a}`]; const v = xs ? xs.reduce((s, x) => s + x, 0) / xs.length : null;
                  return <td key={a} title={v == null ? "sem dados" : `${v.toFixed(0)}% · ${xs!.length} reel(s)`} style={{ width: 26, height: 22, textAlign: "center", border: `1px solid ${C.dim}`, color: C.white, background: v == null ? "transparent" : `rgba(0,212,255,${0.15 + 0.75 * (v / max)})` }}>{v == null ? "" : Math.round(v)}</td>; })}
              </tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
