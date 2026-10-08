import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { copyText } from "./socialUi";

const T = { bg: "#020205", s1: "#0A0A0F", s2: "#111118", cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E", red: "#EF4444", orange: "#F97316", purple: "#A855F7", muted: "#888", text: "#E8E8F0", white: "#FFF",
  ft: "'Rajdhani',sans-serif", fm: "'Space Mono',monospace" };
const OBJ = [{ id: "alcance", label: "Alcance" }, { id: "autoridade", label: "Autoridade" }, { id: "venda", label: "Venda" }];
const scoreColor = (n: number | null) => n === null ? T.muted : n >= 8 ? T.green : n >= 7 ? T.gold : n >= 5 ? T.orange : T.red;
const span = (t: string) => { const m = t.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/); return m ? Math.max(1, Number(m[2]) - Number(m[1])) : 1; };

type Gen = { id: string; created_at: string; tema: string; objetivo: string; tom: string; result: any };
const card: React.CSSProperties = { background: T.s1, border: "1px solid #ffffff10", padding: 16, marginTop: 12 };
const label: React.CSSProperties = { fontFamily: T.fm, fontSize: 10, letterSpacing: 1, color: T.muted, marginBottom: 6 };
const input: React.CSSProperties = { width: "100%", background: T.s2, border: "1px solid #ffffff14", color: T.text, padding: 10, fontSize: 13, borderRadius: 0, boxSizing: "border-box" };

export default function RetentionEnginePanel() {
  const [tema, setTema] = useState(""); const [objetivo, setObjetivo] = useState("alcance"); const [tom, setTom] = useState("");
  const [busy, setBusy] = useState(false); const [gen, setGen] = useState<Gen | null>(null); const [history, setHistory] = useState<Gen[]>([]);

  const loadHistory = async () => {
    const { data } = await supabase.from("reel_generations").select("id, created_at, tema, objetivo, tom, result").order("created_at", { ascending: false }).limit(20);
    setHistory((data as Gen[]) ?? []);
  };
  useEffect(() => { loadHistory(); }, []);

  const run = async () => {
    if (!tema.trim() || !tom.trim()) return toast.error("Preencha tema e tom");
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("retention-engine", { body: { tema, objetivo, tom } });
      if (error) { let msg = "Falha ao gerar reel"; const c = (error as any)?.context; if (c instanceof Response) { try { msg = (await c.clone().json())?.error || msg; } catch { /* */ } } throw new Error(msg); }
      setGen(data as Gen); loadHistory();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const r = gen?.result;
  const blocks: any[] = Array.isArray(r?.blocos) ? r.blocos : [];
  const total = blocks.reduce((n, b) => n + span(String(b.tempo)), 0) || 1;

  return <div style={{ background: T.bg, color: T.text, border: "1px solid #ffffff08", padding: 20, marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ color: T.purple }}>⚡</span>
      <h2 style={{ fontFamily: T.ft, fontSize: 18, fontWeight: 700, color: T.white, letterSpacing: 1, margin: 0 }}>MOTOR DE RETENÇÃO</h2>
      <span style={{ fontFamily: T.fm, fontSize: 9, color: T.muted }}>Arquiteto → Redator → Crítico</span>
    </div>
    <div style={label}>TEMA</div>
    <input style={input} value={tema} onChange={e => setTema(e.target.value)} placeholder='Ex: "Por que você desiste da dieta na segunda semana"' />
    <div style={{ ...label, marginTop: 12 }}>OBJETIVO</div>
    <div style={{ display: "flex", gap: 6 }}>{OBJ.map(o => <button key={o.id} onClick={() => setObjetivo(o.id)} style={{ padding: "6px 14px", borderRadius: 0, cursor: "pointer", fontFamily: T.fm, fontSize: 11,
      background: objetivo === o.id ? `${T.purple}25` : T.s2, color: objetivo === o.id ? T.purple : T.muted, border: `1px solid ${objetivo === o.id ? T.purple : "#ffffff14"}` }}>{o.label}</button>)}</div>
    <div style={{ ...label, marginTop: 12 }}>TOM</div>
    <input style={input} value={tom} onChange={e => setTom(e.target.value)} placeholder="Ex: direto, provocador" />
    <button onClick={run} disabled={busy} style={{ marginTop: 14, width: "100%", padding: 12, borderRadius: 0, border: "none", cursor: busy ? "wait" : "pointer", background: T.purple, color: T.bg, fontFamily: T.ft, fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>
      {busy ? "GERANDO… (até 1 min)" : "⚡ GERAR REEL"}</button>

    {r && <>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={label}>LINHA DO TEMPO · NOTA ESTIMADA POR BLOCO</div>
          <span style={{ fontFamily: T.ft, fontSize: 20, fontWeight: 700, color: scoreColor(r.nota_geral) }}>{r.nota_geral}/10</span>
        </div>
        <div style={{ display: "flex", gap: 2, overflowX: "auto" }}>
          {blocks.map(b => <div key={b.id} title={b.causa_da_queda} style={{ flex: `${span(String(b.tempo)) / total * 100} 0 56px`, background: `${scoreColor(b.nota)}22`, borderTop: `3px solid ${scoreColor(b.nota)}`, padding: "8px 6px" }}>
            <div style={{ fontFamily: T.fm, fontSize: 9, color: T.muted }}>{b.tempo}</div>
            <div style={{ fontFamily: T.ft, fontSize: 18, fontWeight: 700, color: scoreColor(b.nota) }}>{b.nota ?? "—"}</div>
            <div style={{ fontFamily: T.fm, fontSize: 9, color: T.text, textTransform: "uppercase" }}>{b.funcao}</div>
          </div>)}
        </div>
        <p style={{ fontSize: 12, color: T.muted, margin: "10px 0 0" }}>{r.rodadas} revisões · {r.veredito}</p>
        {(r.avisos ?? []).map((a: any) => <p key={a.id} role="alert" style={{ color: T.red, fontSize: 12, margin: "6px 0 0" }}>Bloco {a.id}: {a.texto}</p>)}
        {(r.riscos_de_conteudo ?? []).map((a: any, i: number) => <p key={i} style={{ color: T.red, fontSize: 12, margin: "6px 0 0" }}>Risco · bloco {a.id}: {a.risco}</p>)}
      </div>

      <div style={card}>
        <div style={label}>ROTEIRO BLOCO A BLOCO</div>
        {blocks.map(b => <div key={b.id} style={{ borderLeft: `3px solid ${scoreColor(b.nota)}`, padding: "8px 12px", marginBottom: 10, background: T.s2 }}>
          <div style={{ fontFamily: T.fm, fontSize: 10, color: scoreColor(b.nota) }}>BLOCO {b.id} · {b.tempo} · {String(b.funcao).toUpperCase()} · {b.nota ?? "—"}/10</div>
          <p style={{ fontSize: 14, color: T.white, margin: "6px 0" }}>🎙 {b.fala}</p>
          {b.texto_tela && <p style={{ fontSize: 12, margin: "2px 0" }}><b style={{ color: T.cyan }}>Texto na tela:</b> {b.texto_tela}</p>}
          {b.estimulo_visual && <p style={{ fontSize: 12, margin: "2px 0" }}><b style={{ color: T.gold }}>Estímulo visual:</b> {b.estimulo_visual}</p>}
          {b.gatilho && <p style={{ fontSize: 12, margin: "2px 0" }}><b style={{ color: T.purple }}>Gatilho:</b> {b.gatilho}</p>}
          {b.nota !== null && b.nota < 8 && b.correcao && <p style={{ fontSize: 11, color: T.muted, margin: "4px 0 0" }}>Feedback: {b.correcao}</p>}
        </div>)}
      </div>

      <div style={card}>
        <div style={label}>3 ABERTURAS ALTERNATIVAS</div>
        {(r.aberturas_alternativas ?? []).map((a: string, i: number) => <p key={i} style={{ fontSize: 13, background: T.s2, padding: 10, margin: "0 0 6px" }}>{i + 1}. {a}</p>)}
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><div style={label}>LEGENDA</div>
          <button onClick={() => copyText(`${r.legenda}\n\n${(r.hashtags ?? []).join(" ")}`)} style={{ background: "none", border: "none", color: T.cyan, cursor: "pointer", fontFamily: T.fm, fontSize: 10 }}>COPIAR</button></div>
        <p style={{ fontSize: 13, whiteSpace: "pre-wrap", margin: 0 }}>{r.legenda}</p>
        <p style={{ fontSize: 12, color: T.cyan, marginTop: 8 }}>{(r.hashtags ?? []).join(" ")}</p>
      </div>
    </>}

    {history.length > 0 && <div style={card}>
      <div style={label}>HISTÓRICO</div>
      {history.map(h => <button key={h.id} onClick={() => setGen(h)} style={{ display: "flex", justifyContent: "space-between", width: "100%", background: gen?.id === h.id ? T.s2 : "transparent", border: "none", borderBottom: "1px solid #ffffff08", color: T.text, padding: "8px 4px", cursor: "pointer", textAlign: "left", fontSize: 12 }}>
        <span>{h.tema} · {h.objetivo}</span><span style={{ color: scoreColor(h.result?.nota_geral ?? null), fontFamily: T.fm }}>{h.result?.nota_geral ?? "—"} · {new Date(h.created_at).toLocaleDateString("pt-BR")}</span>
      </button>)}
    </div>}
  </div>;
}
