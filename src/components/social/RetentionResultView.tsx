import { useEffect, useState } from "react";
import { copyText } from "./socialUi";

const T = { bg: "#020205", s1: "#0A0A0F", s2: "#111118", cyan: "#00D4FF", gold: "#B8922A", green: "#5DCAA5", red: "#EF4444", yellow: "#EF9F27", purple: "#AFA9EC", muted: "#888", text: "#E8E8F0", white: "#F5F0E8",
  ft: "'Rajdhani',sans-serif", fm: "'Space Mono',monospace" };
export const noteColor = (n: number | null | undefined) => n == null || isNaN(Number(n)) ? T.muted : n >= 8 ? T.green : n >= 4 ? T.yellow : T.red;
const span = (t: string) => { const m = t.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/); return m ? Math.max(1, Number(m[2]) - Number(m[1])) : 1; };
const card: React.CSSProperties = { background: T.s1, border: "1px solid #ffffff10", padding: 16, marginTop: 12 };
const label: React.CSSProperties = { fontFamily: T.fm, fontSize: 10, letterSpacing: 1, color: T.muted, marginBottom: 6 };
const str = (v: any) => typeof v === "string" ? v : v == null ? "" : typeof v === "object" ? (v.texto ?? v.text ?? v.acao ?? JSON.stringify(v)) : String(v);

const Copy = ({ text }: { text: string }) => text ? <button onClick={() => copyText(text)} style={{ background: "none", border: `1px solid ${T.cyan}40`, color: T.cyan, cursor: "pointer", fontFamily: T.fm, fontSize: 9, padding: "2px 8px", borderRadius: 0 }}>COPIAR</button> : null;
const Field = ({ name, color, value }: { name: string; color: string; value: string }) =>
  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", margin: "4px 0" }}>
    <p style={{ fontSize: 12, margin: 0 }}><b style={{ color }}>{name}:</b> {value || <span style={{ color: T.muted }}>não informado</span>}</p><Copy text={value} />
  </div>;

const CHECKS = ["Gancho sem saudação", "Promessa até 6s", "2 ou mais loops abertos", "Mudança visual a cada 2 a 3s", "Payoff entregue", "CTA único", "Legenda na tela desde o primeiro frame"];

function RecordMode({ blocks, onClose }: { blocks: any[]; onClose: (gravado: boolean) => void }) {
  const [i, setI] = useState(0); const [t, setT] = useState(0);
  useEffect(() => { setT(0); const id = setInterval(() => setT(x => x + 0.1), 100); return () => clearInterval(id); }, [i]);
  const b = blocks[i]; const alvo = span(String(b?.tempo ?? ""));
  const next = () => setI(x => Math.min(x + 1, blocks.length - 1));
  return <div onClick={next} style={{ position: "fixed", inset: 0, zIndex: 1000, background: T.bg, color: T.white, display: "flex", flexDirection: "column", padding: 24, cursor: "pointer" }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.fm, fontSize: 12, color: T.muted }}>
      <span>BLOCO {i + 1}/{blocks.length} · {b?.tempo}</span>
      <span style={{ color: t > alvo ? T.red : T.cyan, fontSize: 22, fontFamily: T.ft, fontWeight: 700 }}>{t.toFixed(1)}s / {alvo}s</span>
      <button onClick={e => { e.stopPropagation(); onClose(false); }} style={{ background: "none", border: `1px solid ${T.muted}`, color: T.muted, fontFamily: T.fm, padding: "4px 10px", borderRadius: 0, cursor: "pointer" }}>SAIR</button>
    </div>
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <p style={{ fontFamily: T.ft, fontWeight: 700, fontSize: "clamp(32px, 6vw, 64px)", lineHeight: 1.2, margin: 0 }}>{b?.fala}</p>
    </div>
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      <button onClick={e => { e.stopPropagation(); setI(x => Math.max(0, x - 1)); }} style={{ padding: "12px 20px", background: T.s2, color: T.text, border: "1px solid #ffffff14", borderRadius: 0, fontFamily: T.fm, cursor: "pointer" }}>VOLTAR</button>
      {i === blocks.length - 1
        ? <button onClick={e => { e.stopPropagation(); onClose(true); }} style={{ padding: "12px 28px", background: T.green, color: T.bg, border: "none", borderRadius: 0, fontFamily: T.ft, fontWeight: 700, fontSize: 18, cursor: "pointer" }}>GRAVEI</button>
        : <span style={{ fontFamily: T.fm, fontSize: 11, color: T.muted, alignSelf: "center" }}>Toque para avançar</span>}
    </div>
  </div>;
}

export default function RetentionResultView({ r, blocks }: { r: any; blocks: any[] }) {
  const total = blocks.reduce((n, b) => n + span(String(b.tempo)), 0) || 1;
  const [rec, setRec] = useState(false); const [gravado, setGravado] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(CHECKS.map(() => false));
  const allOk = checks.every(Boolean);
  const edicao: any[] = r.lista_edicao ?? r.edicao ?? r.lista_de_edicao ?? [];
  const aberturas: any[] = r.aberturas_alternativas ?? [];

  // Curva prevista: nota de cada bloco posicionada no meio do seu tempo
  let acc = 0;
  const pts = blocks.map(b => { const w = span(String(b.tempo)); const x = (acc + w / 2) / total * 100; acc += w; return { x, y: b.nota == null ? null : 40 - Number(b.nota) * 3.6 }; }).filter(p => p.y !== null) as { x: number; y: number }[];

  return <>
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={label}>LINHA DO TEMPO · CURVA DE ATENÇÃO PREVISTA</div>
        <span style={{ fontFamily: T.ft, fontSize: 20, fontWeight: 700, color: noteColor(r.nota_geral) }}>{r.nota_geral ?? "—"}/10</span>
      </div>
      {pts.length > 1 && <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: "100%", height: 60, display: "block" }}>
        <polyline points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke={T.cyan} strokeWidth={0.8} vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 0 3px ${T.cyan})` }} />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={1} fill={T.cyan} />)}
      </svg>}
      <div style={{ display: "flex", gap: 2 }}>
        {blocks.map(b => <div key={b.id} title={b.causa_da_queda} style={{ flex: `${span(String(b.tempo)) / total * 100} 0 0`, minWidth: 0, background: `${noteColor(b.nota)}30`, borderTop: `3px solid ${noteColor(b.nota)}`, padding: "8px 4px" }}>
          <div style={{ fontFamily: T.fm, fontSize: 9, color: T.muted }}>{b.tempo}</div>
          <div style={{ fontFamily: T.ft, fontSize: 18, fontWeight: 700, color: noteColor(b.nota) }}>{b.nota ?? "—"}</div>
          <div style={{ fontFamily: T.fm, fontSize: 9, color: T.text, textTransform: "uppercase", overflowWrap: "anywhere" }}>{b.funcao}</div>
        </div>)}
      </div>
      <p style={{ fontSize: 12, color: T.muted, margin: "10px 0 0" }}>{r.rodadas ?? 0} revisões · {r.veredito}</p>
      {(r.avisos ?? []).map((a: any, i: number) => <p key={i} role="alert" style={{ color: T.red, fontSize: 12, margin: "6px 0 0" }}>Bloco {a.id}: {a.texto}</p>)}
      {(r.riscos_de_conteudo ?? []).map((a: any, i: number) => <p key={i} style={{ color: T.red, fontSize: 12, margin: "6px 0 0" }}>Risco · bloco {a.id}: {a.risco}</p>)}
      <button onClick={() => setRec(true)} disabled={!blocks.length} style={{ marginTop: 12, width: "100%", padding: 12, background: T.s2, color: T.cyan, border: `1px solid ${T.cyan}`, borderRadius: 0, fontFamily: T.ft, fontWeight: 700, fontSize: 16, letterSpacing: 1, cursor: "pointer" }}>
        {gravado ? "✓ GRAVADO · MODO GRAVAÇÃO" : "MODO GRAVAÇÃO"}</button>
    </div>

    <div style={card}>
      <div style={label}>ROTEIRO BLOCO A BLOCO</div>
      {blocks.map(b => <div key={b.id} style={{ borderLeft: `3px solid ${noteColor(b.nota)}`, padding: "8px 12px", marginBottom: 10, background: T.s2 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontFamily: T.fm, fontSize: 10, color: noteColor(b.nota) }}>BLOCO {b.id} · {b.tempo} · {String(b.funcao ?? "").toUpperCase()} · NOTA {b.nota ?? "—"}/10</div>
          <Copy text={String(b.nota ?? "")} />
        </div>
        <Field name="🎙 Fala" color={T.white} value={str(b.fala)} />
        <Field name="Texto na tela" color={T.cyan} value={str(b.texto_tela)} />
        <Field name="Estímulo visual" color={T.gold} value={str(b.estimulo_visual)} />
        <Field name="Gatilho" color={T.purple} value={str(b.gatilho)} />
        {b.nota != null && b.nota < 8 && b.correcao && <p style={{ fontSize: 11, color: T.muted, margin: "4px 0 0" }}>Feedback: {b.correcao}</p>}
      </div>)}
    </div>

    <div style={card}>
      <div style={label}>LISTA DE EDIÇÃO · ONDE CORTAR, ONDE DAR ZOOM</div>
      {edicao.length ? edicao.map((e: any, i: number) => <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, background: T.s2, padding: 8, marginBottom: 4 }}>
        <p style={{ fontSize: 12, margin: 0 }}>{e?.tempo && <b style={{ color: T.cyan }}>{e.tempo} · </b>}{e?.tipo && <b style={{ color: T.gold }}>{String(e.tipo).toUpperCase()} · </b>}{str(e?.acao ?? e?.descricao ?? e)}</p><Copy text={str(e?.acao ?? e?.descricao ?? e)} />
      </div>) : <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>A análise não retornou lista de edição para este reel.</p>}
    </div>

    <div style={card}>
      <div style={label}>3 ABERTURAS ALTERNATIVAS · FORÇA</div>
      {aberturas.map((a: any, i: number) => { const txt = str(a); const nota = typeof a === "object" ? (a.nota ?? a.forca ?? a.nota_forca) : null;
        return <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", background: T.s2, padding: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: T.ft, fontWeight: 700, fontSize: 16, color: noteColor(nota), minWidth: 36 }}>{nota ?? "—"}</span>
          <p style={{ fontSize: 13, margin: 0, flex: 1 }}>{txt}</p><Copy text={txt} />
        </div>; })}
    </div>

    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between" }}><div style={label}>LEGENDA</div><Copy text={str(r.legenda)} /></div>
      <p style={{ fontSize: 13, whiteSpace: "pre-wrap", margin: 0 }}>{str(r.legenda)}</p>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <p style={{ fontSize: 12, color: T.cyan, margin: 0 }}>{(r.hashtags ?? []).join(" ")}</p><Copy text={(r.hashtags ?? []).join(" ")} />
      </div>
    </div>

    <div style={card}>
      <div style={label}>CHECKLIST FINAL</div>
      {CHECKS.map((c, i) => <label key={c} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, padding: "6px 0", cursor: "pointer" }}>
        <input type="checkbox" checked={checks[i]} onChange={() => setChecks(s => s.map((v, j) => j === i ? !v : v))} style={{ accentColor: T.green }} />{c}
      </label>)}
      <button disabled={!allOk} style={{ marginTop: 10, width: "100%", padding: 14, border: "none", borderRadius: 0, fontFamily: T.ft, fontWeight: 700, fontSize: 18, letterSpacing: 1,
        background: allOk ? T.green : T.s2, color: allOk ? T.bg : T.muted, cursor: allOk ? "pointer" : "not-allowed" }}>
        {allOk ? "✓ PRONTO PARA POSTAR" : `PRONTO PARA POSTAR · ${checks.filter(Boolean).length}/${CHECKS.length}`}</button>
    </div>

    {rec && <RecordMode blocks={blocks} onClose={ok => { setRec(false); if (ok) setGravado(true); }} />}
  </>;
}
