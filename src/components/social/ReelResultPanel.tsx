import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const T = { bg: "#020205", s1: "#0A0A0F", s2: "#111118", cyan: "#00D4FF", gold: "#B8922A", green: "#5DCAA5", red: "#EF4444", purple: "#AFA9EC", muted: "#888", text: "#E8E8F0", white: "#F5F0E8",
  ft: "'Rajdhani',sans-serif", fm: "'Space Mono',monospace" };
const card: React.CSSProperties = { background: T.s1, border: "1px solid #ffffff10", padding: 16, marginTop: 12 };
const label: React.CSSProperties = { fontFamily: T.fm, fontSize: 10, letterSpacing: 1, color: T.muted, marginBottom: 6 };
const input: React.CSSProperties = { width: "100%", background: T.s2, border: "1px solid #ffffff14", color: T.text, padding: 8, fontSize: 13, borderRadius: 0, boxSizing: "border-box" };
type Script = { id: string; tema: string; created_at: string; roteiro: any; nota_geral: number | null };

export default function ReelResultPanel() {
  const [scripts, setScripts] = useState<Script[]>([]); const [sel, setSel] = useState("");
  const [faixas, setFaixas] = useState<Record<string, string>>({}); const [pct3, setPct3] = useState(""); const [medio, setMedio] = useState(""); const [coment, setComent] = useState(""); const [salv, setSalv] = useState("");
  const [ranking, setRanking] = useState<any[]>([]);
  const [busy, setBusy] = useState(false); const [res, setRes] = useState<any>(null);

  useEffect(() => { supabase.from("retention_scripts").select("id, tema, created_at, roteiro, nota_geral").order("created_at", { ascending: false }).limit(30)
    .then(({ data }) => setScripts((data as Script[]) ?? []));
    Promise.all([supabase.from("creator_formula_stats").select("formula_id, usos, retencao_3s_media, comentarios_media, salvamentos_media"), supabase.from("hook_formulas").select("id, nome")])
      .then(([s, f]) => setRanking(((s.data ?? []) as any[]).map(r => ({ ...r, nome: (f.data ?? []).find((x: any) => x.id === r.formula_id)?.nome })).sort((a, b) => Number(b.retencao_3s_media ?? -1) - Number(a.retencao_3s_media ?? -1)))); }, []);
  const script = scripts.find(s => s.id === sel);
  const blocos: any[] = script?.roteiro?.blocos ?? [];

  const run = async () => {
    setBusy(true); setRes(null);
    const { data, error } = await supabase.functions.invoke("calibrar", { body: { script_id: sel, faixas, pct_3s: pct3, tempo_medio: medio, comentarios: coment, salvamentos: salv } });
    setBusy(false);
    const msg = (data as any)?.error ?? (error ? (await (error as any).context?.json?.().catch(() => null))?.error ?? "Falha ao enviar feedback" : null);
    if (msg) return toast.error(msg);
    setRes(data); if ((data as any)?.ranking_formulas) setRanking((data as any).ranking_formulas);
  };

  const comp: any[] = res?.comparacao ?? [];
  return <div style={{ background: T.bg, color: T.text, border: "1px solid #ffffff08", padding: 20, marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ color: T.cyan }}>◎</span>
      <h2 style={{ fontFamily: T.ft, fontSize: 18, fontWeight: 700, color: T.white, letterSpacing: 1, margin: 0 }}>RESULTADO DO REEL</h2>
      <span style={{ fontFamily: T.fm, fontSize: 9, color: T.muted }}>Previsto x real · Feedback</span>
    </div>
    <div style={label}>ESCOLHA UM REEL GERADO</div>
    <select style={input} value={sel} onChange={e => { setSel(e.target.value); setFaixas({}); setRes(null); }}>
      <option value="">{scripts.length ? "Selecione..." : "Nenhum reel gerado ainda"}</option>
      {scripts.map(s => <option key={s.id} value={s.id}>{new Date(s.created_at).toLocaleDateString("pt-BR")} · {s.tema}</option>)}
    </select>

    {script && <>
      <div style={{ ...label, marginTop: 14 }}>% DE AUDIÊNCIA NO FIM DE CADA FAIXA (O VÍDEO COMEÇA COM 100%)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 6 }}>
        {blocos.map(b => <label key={b.id} style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>Bloco {b.id} · {b.tempo}
          <input style={input} inputMode="decimal" value={faixas[b.id] ?? ""} onChange={e => setFaixas(f => ({ ...f, [b.id]: e.target.value }))} placeholder="%" /></label>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
        <label style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>% QUE PASSOU DOS 3 PRIMEIROS SEGUNDOS<input style={input} inputMode="decimal" value={pct3} onChange={e => setPct3(e.target.value)} /></label>
        <label style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>TEMPO MÉDIO ASSISTIDO (S)<input style={input} inputMode="decimal" value={medio} onChange={e => setMedio(e.target.value)} /></label>
        <label style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>COMENTÁRIOS<input style={input} inputMode="numeric" value={coment} onChange={e => setComent(e.target.value)} /></label>
        <label style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>SALVAMENTOS<input style={input} inputMode="numeric" value={salv} onChange={e => setSalv(e.target.value)} /></label>
      </div>
      <button onClick={run} disabled={busy} style={{ marginTop: 14, width: "100%", padding: 14, border: "none", borderRadius: 0, background: T.cyan, color: T.bg, fontFamily: T.ft, fontWeight: 700, fontSize: 17, letterSpacing: 1, cursor: busy ? "wait" : "pointer" }}>
        {busy ? "Comparando previsto x real..." : "ENVIAR FEEDBACK"}</button>
    </>}

    {res && <>
      {res.aviso && <p style={{ color: T.gold, fontSize: 12, marginTop: 10 }}>{res.aviso}</p>}
      {res.recalibrado && <p style={{ color: T.muted, fontSize: 11, marginTop: 6 }}>Este reel já tinha resultado: os números foram atualizados, mas ele não conta de novo para os padrões.</p>}
      <div style={{ ...card, borderLeft: `3px solid ${T.red}` }}>
        <div style={label}>MAIOR QUEDA</div>
        {res.maior_queda ? <>
          <p style={{ fontFamily: T.ft, fontSize: 22, fontWeight: 700, color: T.red, margin: 0 }}>-{res.maior_queda.queda_pontos} pontos aos {res.maior_queda.segundo}s</p>
          <p style={{ fontSize: 13, margin: "4px 0 0" }}>Bloco responsável: <b>{res.maior_queda.bloco || "—"}</b>{blocos.find(b => b.id === res.maior_queda.bloco)?.fala ? ` · "${blocos.find(b => b.id === res.maior_queda.bloco).fala}"` : ""}</p>
          {res.analise?.causa_provavel && <p style={{ fontSize: 12, color: T.muted, margin: "6px 0 0" }}>Causa provável: {res.analise.causa_provavel}</p>}
        </> : <p style={{ fontSize: 13, margin: 0 }}>Nenhuma queda entre as faixas informadas.</p>}
      </div>

      <div style={card}>
        <div style={label}>PREVISTO X REAL POR BLOCO (0-10)</div>
        <div style={{ display: "flex", gap: 10, fontFamily: T.fm, fontSize: 10, marginBottom: 8 }}><span style={{ color: T.purple }}>■ Previsto</span><span style={{ color: T.cyan }}>■ Real</span></div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140 }}>
          {comp.map(c => <div key={c.bloco} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: "100%", width: "100%" }}>
              <div title={`Previsto ${c.previsto}`} style={{ flex: 1, height: `${c.previsto * 10}%`, background: T.purple }} />
              <div title={`Real ${c.real ?? "—"}`} style={{ flex: 1, height: `${(c.real ?? 0) * 10}%`, background: c.real == null ? "transparent" : T.cyan, border: c.real == null ? `1px dashed ${T.muted}` : "none" }} />
            </div>
            <div style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, marginTop: 4 }}>B{c.bloco}</div>
            <div style={{ fontFamily: T.fm, fontSize: 9, color: c.erro == null ? T.muted : Math.abs(c.erro) >= 2 ? T.red : T.text }}>{c.previsto}/{c.real ?? "—"}</div>
          </div>)}
        </div>
        <p style={{ fontSize: 11, color: T.muted, margin: "8px 0 0" }}>Real = parte da audiência que entrou no bloco e ficou até o fim dele. Faixa sem dado aparece tracejada.</p>
        {(res.analise?.hipoteses ?? []).map((h: any, i: number) => <p key={i} style={{ fontSize: 12, margin: "6px 0 0" }}><b style={{ color: T.gold }}>Bloco {h.bloco}:</b> {h.hipotese}</p>)}
      </div>

      {(res.padroes?.length > 0 || res.analise?.ajuste_para_proximo_reel?.length > 0) && <div style={card}>
        <div style={label}>PADRÕES</div>
        {res.padroes.map((p: any, i: number) => <p key={i} style={{ fontSize: 12, margin: "4px 0" }}>
          <span style={{ fontFamily: T.fm, fontSize: 9, padding: "2px 6px", marginRight: 6, background: p.confirmado ? `${T.green}25` : `${T.gold}25`, color: p.confirmado ? T.green : T.gold }}>{p.confirmado ? "CONFIRMADO" : "INDÍCIO"}</span>
          <b>{String(p.tipo).toUpperCase()}</b> · {p.texto} <span style={{ color: T.muted }}>({p.amostras}/3 vídeos)</span></p>)}
        {(res.analise?.ajuste_para_proximo_reel ?? []).length > 0 && <>
          <div style={{ ...label, marginTop: 10 }}>AJUSTES PARA O PRÓXIMO REEL</div>
          {res.analise.ajuste_para_proximo_reel.map((a: string, i: number) => <p key={i} style={{ fontSize: 12, margin: "4px 0" }}>{i + 1}. {a}</p>)}
        </>}
      </div>}
    </>}

    {ranking.length > 0 && <div style={card}>
      <div style={label}>SUAS FÓRMULAS, DA QUE MAIS RETÉM À QUE MENOS RETÉM</div>
      {ranking.map((f, i) => <div key={f.formula_id} style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid #ffffff08", fontSize: 12 }}>
        <span style={{ fontFamily: T.ft, fontWeight: 700, color: i === 0 ? T.cyan : T.muted }}>{i + 1}</span>
        <span><b>{f.nome}</b> <span style={{ color: T.muted }}>· {f.usos} {f.usos === 1 ? "reel" : "reels"}</span></span>
        <span style={{ fontFamily: T.fm, fontSize: 10, color: T.text }}>{f.retencao_3s_media ?? "—"}% 3s · {f.comentarios_media ?? "—"} coment. · {f.salvamentos_media ?? "—"} salv.</span>
      </div>)}
      <p style={{ fontSize: 11, color: T.muted, margin: "8px 0 0" }}>O próximo reel prioriza as do topo. A cada 3 reels, um testa uma fórmula nova.</p>
    </div>}
  </div>;
}
