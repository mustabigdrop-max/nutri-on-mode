import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FONTE_SELO, CORTE_LABEL, ressalvaIndex, canJumpTo, needsSourceWarning, voiceParts, type FonteStatus } from "@/lib/pillarReels";

const C = { cyan: "#00D4FF", gold: "#B8922A", red: "#EF4444", white: "#F0F0F8", muted: "#777788", dim: "#333340", s: "#0A0A12" };
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace" };
const inp: React.CSSProperties = { background: C.s, border: `1px solid ${C.dim}`, color: C.white, fontFamily: F.m, fontSize: 11, padding: "6px 8px", borderRadius: 0 };
const sm = (c: string, on = true): React.CSSProperties => ({ background: "transparent", border: `1px solid ${c}60`, color: on ? c : C.muted, fontFamily: F.t, fontWeight: 700, fontSize: 11, padding: "5px 9px", cursor: on ? "pointer" : "not-allowed", borderRadius: 0, opacity: on ? 1 : .5 });
const lbl: React.CSSProperties = { fontFamily: F.m, fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase" };

const Fala = ({ fala, size }: { fala: string; size: number }) => <span style={{ fontSize: size }}>
  {voiceParts(fala).map((p, i) => p.kind === "enfase" ? <b key={i} style={{ color: C.gold, textDecoration: "underline" }}>{p.t}</b>
    : p.kind === "pausa" ? <span key={i} style={{ color: C.cyan, fontFamily: F.m, fontSize: Math.max(10, size * .4) }}> {p.t} </span> : <span key={i}>{p.t}</span>)}
</span>;

function Selo({ s }: { s: any }) {
  const sel = FONTE_SELO[s.fonte_status as FonteStatus]; if (!sel) return null;
  return <span style={{ fontFamily: F.m, fontSize: 9, color: sel.color, border: `1px solid ${sel.color}`, padding: "2px 6px" }}>
    {s.fonte_conferida_em ? `✓ ${sel.label} · conferida ${new Date(s.fonte_conferida_em).toLocaleDateString("pt-BR")}` : sel.label}</span>;
}

function Gravacao({ reels, onClose }: { reels: any[]; onClose: () => void }) {
  const [r, setR] = useState(0); const [b, setB] = useState(0); const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const [ok, setOk] = useState<Record<number, boolean>>({}); const [seg, setSeg] = useState(0);
  useEffect(() => { const t = setInterval(() => setSeg(s => s + 1), 1000); return () => clearInterval(t); }, []);
  const reel = reels[r]; const done = r >= reels.length;
  const blocos: any[] = reel?.roteiro?.blocos ?? []; const ri = reel ? ressalvaIndex(blocos, reel.ressalva_obrigatoria) : -1;
  const go = (to: number) => { if (to < 0 || to >= blocos.length) return; if (!canJumpTo(to, seen, ri)) { toast.error("Ressalva obrigatória: grave esse bloco antes de avançar."); return; }
    setB(to); setSeen(s => new Set(s).add(to)); };
  const next = () => { setR(r + 1); setB(0); setSeen(new Set([0])); setSeg(0); };
  const warn = !done && needsSourceWarning(reel) && !ok[r];
  const bl = blocos[b];
  return <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column", padding: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ ...lbl, color: C.cyan }}>MODO GRAVAÇÃO · REEL {Math.min(r + 1, reels.length)}/{reels.length}{!done && !warn && ` · BLOCO ${b + 1}/${blocos.length}`}</div>
      <button onClick={onClose} style={sm(C.muted)}>SAIR</button>
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
      {done ? <div style={{ textAlign: "center", fontFamily: F.t, fontSize: 32, fontWeight: 700, color: C.gold }}>LOTE COMPLETO</div>
      : warn ? <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: F.t, fontSize: 26, fontWeight: 700, color: C.gold }}>Este reel tem pendência de fonte. Gravar mesmo assim?</div>
          <div style={{ fontFamily: F.m, fontSize: 11, color: C.muted, marginTop: 8 }}>{reel.titulo}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
            <button onClick={onClose} style={sm(C.muted)}>Voltar</button>
            <button onClick={() => setOk(o => ({ ...o, [r]: true }))} style={sm(C.gold)}>Gravar mesmo assim</button>
          </div>
        </div>
      : <>
          <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted }}>{reel.titulo}</div>
          <div style={{ fontFamily: F.m, fontSize: 11, color: C.cyan }}>{bl?.tempo ?? "—"}{b === ri && <span style={{ color: C.red, border: `1px solid ${C.red}`, padding: "1px 6px", marginLeft: 8 }}>RESSALVA OBRIGATÓRIA</span>}</div>
          <div onClick={() => go(b + 1)} style={{ fontFamily: F.t, fontWeight: 700, color: C.white, lineHeight: 1.25, cursor: "pointer" }}><Fala fala={bl?.fala ?? "—"} size={34} /></div>
          <div style={{ fontFamily: F.m, fontSize: 12, color: C.gold }}>TELA: {bl?.texto_tela || "—"}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button disabled={b === 0} onClick={() => go(b - 1)} style={sm(C.muted, b > 0)}>← BLOCO</button>
            <button disabled={b >= blocos.length - 1} onClick={() => go(b + 1)} style={sm(C.cyan, b < blocos.length - 1)}>BLOCO →</button>
          </div>
        </>}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontFamily: F.m, fontSize: 22, color: C.cyan }}>{String(Math.floor(seg / 60)).padStart(2, "0")}:{String(seg % 60).padStart(2, "0")}</span>
      {!done && !warn && <button disabled={ri >= 0 && !seen.has(ri)} onClick={next} style={{ background: ri >= 0 && !seen.has(ri) ? C.dim : C.gold, color: "#0A0A0A", border: "none", fontFamily: F.t, fontWeight: 700, fontSize: 16, padding: "12px 28px", cursor: "pointer", borderRadius: 0 }}>GRAVEI →</button>}
      {done && <button onClick={onClose} style={sm(C.gold)}>FECHAR</button>}
    </div>
  </div>;
}

function Detalhe({ s, fontes, onConferida }: { s: any; fontes: any[]; onConferida: () => void }) {
  const [chk, setChk] = useState<boolean[]>([]);
  const lista: string[] = Array.isArray(s.checklist) ? s.checklist : [];
  const conferir = async () => { const { error } = await supabase.rpc("mark_fonte_conferida", { _script_id: s.id }); if (error) toast.error("Falha ao registrar."); else { toast.success("Fonte conferida."); onConferida(); } };
  return <div style={{ marginTop: 8, padding: 10, background: "#06060C", border: `1px solid ${C.dim}` }}>
    {s.ajuste_obrigatorio && <div style={{ border: `1px solid ${C.gold}`, padding: 8, marginBottom: 8 }}><div style={{ ...lbl, color: C.gold }}>AJUSTE OBRIGATÓRIO</div><div style={{ fontFamily: F.t, fontSize: 15, color: C.white, fontWeight: 700 }}>{s.ajuste_obrigatorio}</div></div>}
    <div style={lbl}>ANTES DE GRAVAR</div>
    {lista.map((c, i) => <label key={i} style={{ display: "flex", gap: 6, fontSize: 12, color: C.white, padding: "3px 0" }}><input type="checkbox" checked={!!chk[i]} onChange={() => setChk(x => { const n = [...x]; n[i] = !n[i]; return n; })} />{c}</label>)}
    <button onClick={conferir} style={{ ...sm(C.cyan), marginTop: 6 }}>{s.fonte_conferida_em ? "✓ FONTE CONFERIDA · ATUALIZAR" : "FONTE CONFERIDA"}</button>
    <div style={{ ...lbl, marginTop: 10 }}>FONTES</div>
    {fontes.length ? fontes.map(f => <div key={f.id} style={{ fontSize: 12, color: C.white, margin: "4px 0" }}>
      {f.link ? <a href={f.link} target="_blank" rel="noopener noreferrer" style={{ color: C.cyan }}>{f.referencia || f.link}</a> : f.referencia}
      {f.tipo === "secundaria" && <span style={{ color: C.gold, fontFamily: F.m, fontSize: 9 }}> · resumo de terceiros: conferir no original</span>}
      {f.observacao && <span style={{ color: C.muted }}> · {f.observacao}</span>}
    </div>) : <div style={{ fontSize: 12, color: C.muted }}>Nenhuma fonte cadastrada.</div>}
    {s.risco && <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Risco: {s.risco}</div>}
    <div style={{ ...lbl, marginTop: 10 }}>BLOCOS</div>
    {(s.roteiro?.blocos ?? []).map((b: any, i: number) => <div key={i} style={{ background: C.s, padding: 8, marginTop: 4 }}>
      <div style={{ fontFamily: F.m, fontSize: 9, color: C.cyan }}>{b.tempo} · CORTE {CORTE_LABEL[b.corte] ?? b.corte ?? "—"}</div>
      <div style={{ fontFamily: F.t, fontSize: 15, color: C.white }}><Fala fala={b.fala ?? ""} size={15} /></div>
      <div style={{ fontFamily: F.m, fontSize: 10, color: C.gold }}>TELA: {b.texto_tela}</div>
      <button disabled title="Disponível no módulo de Cortes" style={{ ...sm(C.muted, false), marginTop: 4 }}>Gerar corte</button>
    </div>)}
  </div>;
}

export default function PillarReelsPanel() {
  const [rows, setRows] = useState<any[]>([]); const [fontes, setFontes] = useState<any[]>([]);
  const [f, setF] = useState({ pilar: "2", fonte: "" }); const [open, setOpen] = useState<string | null>(null);
  const [rec, setRec] = useState<any[] | null>(null); const [busy, setBusy] = useState(false);
  const load = async () => {
    const { data } = await supabase.from("retention_scripts").select("id,slug,titulo,pilar,formula,estrutura_nome,figura,risco,ordem_lote,fonte_status,fonte_conferida_em,ajuste_obrigatorio,ressalva_obrigatoria,checklist,roteiro,status").not("pilar", "is", null).order("ordem_lote");
    setRows(data ?? []);
    const { data: fs } = await supabase.from("script_sources").select("*").order("ordem"); setFontes(fs ?? []);
  };
  useEffect(() => { load(); }, []);
  const carregar = async () => { setBusy(true); const { data, error } = await supabase.functions.invoke("seed_pilar", { body: {} }); setBusy(false);
    if (error || (data as any)?.error) toast.error((data as any)?.error ?? "Falha ao carregar."); else { toast.success(`${(data as any).carregados} reels do Pilar 2 prontos.`); load(); } };
  const pilares = useMemo(() => [...new Set(rows.map(r => r.pilar))].sort(), [rows]);
  const lista = rows.filter(r => (!f.pilar || String(r.pilar) === f.pilar) && (!f.fonte || r.fonte_status === f.fonte));
  const p2 = rows.filter(r => r.pilar === 2).sort((a, b) => (a.ordem_lote ?? 99) - (b.ordem_lote ?? 99));

  return <div style={{ marginTop: 12, borderTop: `1px solid ${C.dim}`, paddingTop: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
      <div style={{ ...lbl, color: C.gold }}>REELS POR PILAR · COM FONTE</div>
      <button onClick={carregar} disabled={busy} style={sm(C.cyan)}>{busy ? "CARREGANDO..." : rows.some(r => r.pilar === 2) ? "ATUALIZAR PILAR 2" : "CARREGAR PILAR 2"}</button>
    </div>
    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
      <select style={inp} value={f.pilar} onChange={e => setF(p => ({ ...p, pilar: e.target.value }))}><option value="">Todos os pilares</option>{pilares.map(p => <option key={p} value={String(p)}>Pilar {p}</option>)}</select>
      <select style={inp} value={f.fonte} onChange={e => setF(p => ({ ...p, fonte: e.target.value }))}><option value="">Toda fonte</option>
        <option value="verificada">Verificada</option><option value="parcial">Parcial</option><option value="sem_fonte_primaria">Sem fonte primária</option></select>
    </div>
    {p2.length > 0 && <button onClick={() => setRec(p2)} style={{ ...sm(C.gold), marginTop: 8, width: "100%" }}>LOTE DE GRAVAÇÃO DO PILAR 2 ({p2.length})</button>}
    {!lista.length && <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, marginTop: 8 }}>Nenhum reel de pilar ainda.</div>}
    {lista.map(s => <div key={s.id} style={{ background: C.s, border: `1px solid ${C.dim}`, padding: 10, marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 15, color: C.white }}>{s.ordem_lote ? `${s.ordem_lote}. ` : ""}{s.titulo}</div><Selo s={s} />
      </div>
      <div style={{ fontFamily: F.m, fontSize: 9, color: C.cyan, marginTop: 3 }}>PILAR {s.pilar} · {s.formula ?? "—"} · {s.estrutura_nome ?? "—"} · {s.figura ?? "—"}</div>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <button onClick={() => setOpen(open === s.id ? null : s.id)} style={sm(C.cyan)}>{open === s.id ? "FECHAR" : "ABRIR"}</button>
        <button onClick={() => setRec([s])} style={sm(C.gold)}>GRAVAR</button>
      </div>
      {open === s.id && <Detalhe s={s} fontes={fontes.filter(x => x.script_id === s.id)} onConferida={load} />}
    </div>)}
    {rec && <Gravacao reels={rec} onClose={() => setRec(null)} />}
  </div>;
}
