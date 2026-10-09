import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ContentMatrixPanel from "./ContentMatrixPanel";
import PillarReelsPanel from "./PillarReelsPanel";

const C = { cyan: "#00D4FF", gold: "#B8922A", red: "#EF4444", text: "#C8C8D8", white: "#F0F0F8", muted: "#555566", dim: "#333340" };
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace" };
const inp: React.CSSProperties = { background: "#0A0A12", border: `1px solid ${C.dim}`, color: C.white, fontFamily: F.m, fontSize: 11, padding: "6px 8px", borderRadius: 0, boxSizing: "border-box" };
const sm = (c: string): React.CSSProperties => ({ background: "transparent", border: `1px solid ${c}60`, color: c, fontFamily: F.t, fontWeight: 700, fontSize: 11, padding: "5px 9px", cursor: "pointer", borderRadius: 0 });
const lbl: React.CSSProperties = { fontFamily: F.m, fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase" };
const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 };
/** Same formula as the server estimate (reel_factory/logic.ts). */
export const estimateCalls = (n: number) => 1 + n * 2 + Math.ceil(n * 0.8) + Math.ceil(n * 0.8 * 0.5) * 2;
const STATUS = ["novo", "escolhido", "guardado", "gravado", "postado"];
const ST_LABEL: Record<string, string> = { fila: "NA FILA", rodando: "GERANDO", concluido: "CONCLUÍDO", erro: "ERRO", pausado: "PAUSADO" };
const riscoAberto = (x: any) => Array.isArray(x?.notas?.riscos_de_conteudo) && x.notas.riscos_de_conteudo.length > 0;
const TEMA_SAUDE = /(saud|treino|trein|suplement|creatin|whey|proteina|dieta|caloria|aliment|comida|nutri|emagrec|gordura|musculo|hipertrof|vitamin|sono|horm|jejum|carbo|acucar|exame)/;
const ehSaude = (x: any) => TEMA_SAUDE.test(`${x.tema ?? ""} ${x.pilar ?? ""}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
const PesquisarAntes = () => <button type="button" disabled title="Disponível com a Sala de Pesquisa" style={{ ...sm(C.muted), opacity: 0.5, cursor: "not-allowed" }}>Pesquisar antes</button>;
const corNota = (n: any) => (n == null ? C.muted : n >= 8 ? C.gold : n >= 6 ? C.cyan : C.red);

async function call(body: any) {
  const { data, error } = await supabase.functions.invoke("reel_factory", { body });
  const msg = (data as any)?.error ?? (error ? (await (error as any).context?.json?.().catch(() => null))?.error ?? "Falha na Fábrica" : null);
  if (msg) throw new Error(msg);
  return data as any;
}

function LoteGravacao({ reels, onGravei, onClose }: { reels: any[]; onGravei: (id: string) => void; onClose: () => void }) {
  const [r, setR] = useState(0); const [b, setB] = useState(0); const [seg, setSeg] = useState(0); const [troca, setTroca] = useState(false);
  useEffect(() => { const t = setInterval(() => setSeg(s => s + 1), 1000); return () => clearInterval(t); }, []);
  const reel = reels[r]; const blocos: any[] = reel?.roteiro?.blocos ?? []; const bl = blocos[b];
  const done = r >= reels.length;
  const gravei = () => {
    onGravei(reel.id);
    const next = reels[r + 1];
    setTroca(!!next && next.pilar !== reel.pilar);
    setR(r + 1); setB(0); setSeg(0);
  };
  const mm = String(Math.floor(seg / 60)).padStart(2, "0"), ss = String(seg % 60).padStart(2, "0");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column", padding: 20 }}>
      <div style={row}>
        <div style={{ ...lbl, color: C.cyan }}>LOTE DE GRAVAÇÃO · REEL {Math.min(r + 1, reels.length)}/{reels.length}{!done && ` · BLOCO ${b + 1}/${blocos.length}`}</div>
        <button type="button" onClick={onClose} style={sm(C.muted)}>SAIR</button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
        {done ? <div style={{ textAlign: "center", fontFamily: F.t, fontSize: 32, fontWeight: 700, color: C.gold }}>LOTE COMPLETO</div> : troca ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: F.t, fontSize: 30, fontWeight: 700, color: C.gold }}>TROQUE DE ROUPA OU CENÁRIO</div>
            <div style={{ fontFamily: F.m, fontSize: 11, color: C.muted, marginTop: 8 }}>Próximo reel é de outro pilar: {reel.pilar ?? "—"}</div>
            <button type="button" onClick={() => setTroca(false)} style={{ ...sm(C.cyan), marginTop: 16 }}>PRONTO</button>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted }}>{reel.tema} · {reel.pilar ?? "—"}</div>
            <div style={{ fontFamily: F.m, fontSize: 11, color: C.cyan }}>{bl?.tempo ?? "—"}</div>
            <div onClick={() => b < blocos.length - 1 && setB(b + 1)} style={{ fontFamily: F.t, fontSize: 34, fontWeight: 700, color: C.white, lineHeight: 1.25, cursor: "pointer" }}>{bl?.fala ?? "—"}</div>
            <div style={{ fontFamily: F.m, fontSize: 12, color: C.gold }}>TELA: {bl?.texto_tela || "—"}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" disabled={b === 0} onClick={() => setB(b - 1)} style={sm(C.muted)}>← BLOCO</button>
              <button type="button" disabled={b >= blocos.length - 1} onClick={() => setB(b + 1)} style={sm(C.cyan)}>BLOCO →</button>
            </div>
          </>
        )}
      </div>
      <div style={row}>
        <span style={{ fontFamily: F.m, fontSize: 22, color: C.cyan }}>{mm}:{ss}</span>
        {!done && !troca && <button type="button" onClick={gravei} style={{ background: C.gold, color: "#0A0A0A", border: "none", fontFamily: F.t, fontWeight: 700, fontSize: 16, padding: "12px 28px", cursor: "pointer", borderRadius: 0 }}>GRAVEI →</button>}
        {done && <button type="button" onClick={onClose} style={sm(C.gold)}>FECHAR</button>}
      </div>
    </div>
  );
}

export default function ReelFactoryPanel({ onChosen }: { onChosen?: () => void }) {
  const [cfg, setCfg] = useState<any>(null);
  const [form, setForm] = useState({ n_ideias: 100, limite_roteiros_dia: 100, hora: 6, pausado: false, automatico: false, limite_agendados_dia: 1, ritmo_semana: 5 });
  const [batches, setBatches] = useState<any[]>([]);
  const [bank, setBank] = useState<any[]>([]);
  const [open, setOpen] = useState<"" | "config" | "banco" | "historico" | "matriz">("");
  useEffect(() => { const on = () => setOpen("banco"); window.addEventListener("cc-open-banco", on); return () => window.removeEventListener("cc-open-banco", on); }, []);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ q: "", pilar: "", formula: "", nota: "", status: "", descartados: false });
  const [sel, setSel] = useState<string[]>([]);
  const [lote, setLote] = useState<any[] | null>(null);
  const [refCount, setRefCount] = useState<number | null>(null);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const [s, b, k] = await Promise.all([
      supabase.from("reel_factory_settings").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("reel_factory_batches").select("id, data, origem, status, etapa, n_ideias, cursor, aprovados, descartados, chamadas, estimativa_chamadas, tentativas, erro, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("reel_bank").select("id, batch_id, pilar, angulo, formula_id, formula_nome, tema, abertura, duracao_seg, nota, roteiro, status, motivo_descarte, agendado_para, created_at, notas").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
    ]);
    const { count } = await supabase.from("retention_scripts").select("id", { count: "exact", head: true }).eq("user_id", user.id).or("slug.like.p1-%,slug.like.p2-%");
    setRefCount(count ?? 0);
    setCfg(s.data); if (s.data) setForm({ n_ideias: s.data.n_ideias, limite_roteiros_dia: s.data.limite_roteiros_dia, hora: s.data.hora, pausado: s.data.pausado, automatico: s.data.automatico, limite_agendados_dia: s.data.limite_agendados_dia, ritmo_semana: s.data.ritmo_semana });
    setBatches(b.data ?? []); setBank(k.data ?? []);
  };
  useEffect(() => { load(); }, []);
  const ativo = batches.find(b => b.status === "fila" || b.status === "rodando");
  useEffect(() => { if (!ativo) return; const t = setInterval(load, 8000); return () => clearInterval(t); }, [ativo?.id]);

  const salvar = async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const { error } = await supabase.from("reel_factory_settings").upsert({ user_id: user.id, ...form, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    toast.success("Fábrica atualizada"); load();
  };
  const gerar = async () => {
    const n = Math.min(form.n_ideias, form.limite_roteiros_dia);
    if (!window.confirm(`Gerar lote de até ${n} ideias?\nEstimativa: cerca de ${estimateCalls(n)} solicitações de Análise, descontadas dos créditos do espaço de trabalho.\nNada será publicado.`)) return;
    setBusy(true);
    try { await call({ action: "start" }); toast.success("Lote iniciado"); load(); } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  const escolher = async (id: string) => {
    try { const r = await call({ action: "choose", reel_id: id }); toast.success("Escolhido pra hoje"); if (r.aviso) toast.warning(r.aviso); load(); onChosen?.(); } catch (e: any) { toast.error(e.message); }
  };
  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reel_bank").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setBank(bk => bk.map(x => x.id === id ? { ...x, status } : x));
  };

  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  const loteHoje = batches.find(b => b.data === hoje);
  const top = bank.filter(x => x.batch_id === loteHoje?.id && x.status === "novo").sort((a, b) => Number(b.nota ?? -1) - Number(a.nota ?? -1)).slice(0, 10);
  const pilares = [...new Set(bank.map(x => x.pilar).filter(Boolean))];
  const formulas = [...new Map(bank.filter(x => x.formula_id).map(x => [x.formula_id, x.formula_nome ?? `Fórmula ${x.formula_id}`])).entries()];
  const filtrado = useMemo(() => bank.filter(x =>
    (f.descartados ? (["reprovado", "descartado"].includes(x.status) || Number(x.nota ?? 0) < 7 || riscoAberto(x)) : !["reprovado", "descartado"].includes(x.status) && Number(x.nota ?? 0) >= 7 && !riscoAberto(x)) &&
    (!f.status || x.status === f.status) && (!f.pilar || x.pilar === f.pilar) && (!f.formula || String(x.formula_id) === f.formula) &&
    (!f.nota || Number(x.nota ?? 0) >= Number(f.nota)) && (!f.q || `${x.tema} ${x.abertura ?? ""}`.toLowerCase().includes(f.q.toLowerCase()))), [bank, f]);

  const Item = ({ x, actions }: { x: any; actions: React.ReactNode }) => (
    <div style={{ borderBottom: `1px solid ${C.dim}`, padding: "8px 0" }}>
      <div style={row}>
        <div style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: C.white, lineHeight: 1.2 }}>{x.tema}</div>
        <span style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: corNota(x.nota) }}>{x.nota ?? "—"}</span>
      </div>
      <div style={{ fontFamily: F.m, fontSize: 9, color: C.cyan, marginTop: 3 }}>{(x.formula_nome ?? "—").toUpperCase()} · {x.pilar ?? "—"}{x.angulo ? ` · ${x.angulo}` : ""} · {x.duracao_seg ? `${x.duracao_seg}s` : "—"} · {x.status.toUpperCase()}</div>
      {x.abertura && <div style={{ fontFamily: F.m, fontSize: 10, color: C.text, marginTop: 4 }}>“{x.abertura}”</div>}
      {x.motivo_descarte && <div style={{ fontFamily: F.m, fontSize: 9, color: C.red, marginTop: 4 }}>MOTIVO: {x.motivo_descarte}</div>}
      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>{actions}</div>
    </div>
  );

  return (
    <div>
      <div style={row}>
        <div style={{ ...lbl, color: C.gold }}>Fábrica de reels</div>
        <span style={{ fontFamily: F.m, fontSize: 9, color: cfg?.pausado ? C.gold : C.muted }}>{cfg?.pausado ? "PAUSADA" : cfg?.automatico ? `AUTOMÁTICA · ${String(cfg.hora).padStart(2, "0")}:00` : "MANUAL"}</span>
      </div>

      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={row}>
          <span style={lbl}>Ideias por lote</span>
          <span style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: C.cyan }}>{form.n_ideias}</span>
        </div>
        <input type="range" min={5} max={100} step={5} value={form.n_ideias} className="cc-range" aria-label="Ideias por lote"
          onChange={e => setForm(p => ({ ...p, n_ideias: Number(e.target.value) }))}
          onPointerUp={() => salvar()} onKeyUp={() => salvar()} />
        <div style={{ fontFamily: F.m, fontSize: 9, color: C.gold }}>ESTIMATIVA: ~{estimateCalls(Math.min(form.n_ideias, form.limite_roteiros_dia))} solicitações de Análise</div>
        {batches[0] && (() => {
          const b0 = batches[0]; const p = b0.n_ideias ? Math.min(100, Math.round((b0.cursor / b0.n_ideias) * 100)) : 0;
          return (
            <>
              <div style={{ height: 4, background: C.dim, position: "relative", overflow: "hidden", marginTop: 4 }}>
                <div style={{ position: "absolute", inset: 0, width: `${p}%`, background: C.cyan, boxShadow: `0 0 8px ${C.cyan}`, transition: "width .6s ease" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {([["GERADOS", b0.cursor, C.cyan], ["APROVADOS", b0.aprovados, C.gold], ["DESCARTADOS", b0.descartados, C.muted]] as const).map(([l, v, c]) => (
                  <div key={l} style={{ border: `1px solid ${c}30`, padding: "6px 8px" }}>
                    <div style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: c }}>{v ?? 0}</div>
                    <div style={{ ...lbl, fontSize: 8, letterSpacing: 1 }}>{l}</div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </div>

      {batches[0] && (
        <div style={{ marginTop: 8, fontFamily: F.m, fontSize: 10, color: C.text, lineHeight: 1.6 }}>
          LOTE {new Date(`${batches[0].data}T12:00:00`).toLocaleDateString("pt-BR")} · <span style={{ color: batches[0].status === "erro" ? C.red : C.cyan }}>{ST_LABEL[batches[0].status]}</span>
          {" · "}{batches[0].etapa === "ideias" ? "Projetando atenção..." : `${batches[0].cursor}/${batches[0].n_ideias} roteiros`} · {batches[0].aprovados} aprovados · {batches[0].descartados} descartados · {batches[0].chamadas}/{batches[0].estimativa_chamadas ?? "—"} solicitações
          {batches[0].erro && <div style={{ color: C.red }}>{batches[0].erro}</div>}
          {batches[0].status === "pausado" && <button type="button" onClick={() => call({ action: "resume", batch_id: batches[0].id }).then(load).catch(e => toast.error(e.message))} style={{ ...sm(C.cyan), marginTop: 4 }}>RETOMAR</button>}
        </div>
      )}

      <div style={{ ...lbl, marginTop: 12 }}>Prontos pra gravar</div>
      {!top.length ? <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, marginTop: 6 }}>{batches.length ? "Nenhum roteiro novo neste lote ainda." : "Nenhum lote ainda. Gere o primeiro e comece a aprender com os seus dados."}</div> :
        top.map(x => <Item key={x.id} x={x} actions={<>
          <button type="button" onClick={() => escolher(x.id)} style={sm(C.gold)}>Escolher pra hoje</button>
          <button type="button" onClick={() => setStatus(x.id, "guardado")} style={sm(C.cyan)}>Guardar no banco</button>
          {ehSaude(x) && <PesquisarAntes />}
          <button type="button" onClick={() => setStatus(x.id, "descartado")} style={sm(C.muted)}>DESCARTAR</button>
        </>} />)}

      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        <button type="button" disabled={busy || !!ativo || cfg?.pausado} onClick={gerar} style={{ ...sm(C.gold), background: C.gold, color: "#0A0A0A" }}>{ativo ? "LOTE EM ANDAMENTO" : "⚡ GERAR LOTE"}</button>
        <button type="button" onClick={() => setOpen(open === "banco" ? "" : "banco")} style={sm(C.cyan)}>▤ Banco de reels</button>
        <button type="button" onClick={() => setOpen(open === "matriz" ? "" : "matriz")} style={sm(C.gold)}>Matriz</button>
        <button type="button" onClick={() => setOpen(open === "config" ? "" : "config")} style={sm(C.cyan)}>⚙ CONFIGURAR</button>
        <button type="button" onClick={() => setOpen(open === "historico" ? "" : "historico")} style={sm(C.muted)}>⟲ HISTÓRICO</button>
      </div>

      {open === "matriz" && <ContentMatrixPanel />}
      {open === "config" && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {([["n_ideias", "IDEIAS POR LOTE", 5, 100], ["limite_roteiros_dia", "LIMITE DE GERAÇÕES POR DIA", 5, 200], ["limite_agendados_dia", "REELS AGENDADOS POR DIA", 1, 10], ["ritmo_semana", "RITMO (REELS POR SEMANA)", 1, 70]] as const).map(([k, l, mi, ma]) => (
            <label key={k} style={{ ...row, ...lbl }}>{l}
              <input type="number" min={mi} max={ma} style={{ ...inp, width: 80 }} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: Math.max(mi, Math.min(ma, Number(e.target.value) || mi)) }))} /></label>
          ))}
          <label style={{ ...row, ...lbl }}>LOTE AUTOMÁTICO DIÁRIO<input type="checkbox" checked={form.automatico} onChange={e => setForm(p => ({ ...p, automatico: e.target.checked }))} /></label>
          <label style={{ ...row, ...lbl }}>HORÁRIO (BRASÍLIA)
            <select style={inp} value={form.hora} onChange={e => setForm(p => ({ ...p, hora: Number(e.target.value) }))}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}</select></label>
          <label style={{ ...row, ...lbl }}>PAUSAR FÁBRICA<input type="checkbox" checked={form.pausado} onChange={e => setForm(p => ({ ...p, pausado: e.target.checked }))} /></label>
          <div style={{ fontFamily: F.m, fontSize: 10, color: C.gold }}>ESTIMATIVA POR LOTE: ~{estimateCalls(Math.min(form.n_ideias, form.limite_roteiros_dia))} solicitações de Análise.</div>
          <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, lineHeight: 1.5 }}>Nada é publicado sozinho. Todo reel precisa da sua escolha. A cada lote, 80% das ideias usam as fórmulas que mais retiveram e 20% testam fórmulas novas.</div>
          <button type="button" onClick={salvar} style={{ background: C.gold, color: "#0A0A0A", border: "none", fontFamily: F.t, fontWeight: 700, fontSize: 13, padding: "10px 0", cursor: "pointer", borderRadius: 0 }}>SALVAR</button>
        </div>
      )}

      {open === "historico" && (
        <div style={{ marginTop: 10 }}>
          {!batches.length ? <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted }}>Nenhum lote ainda. Gere o primeiro e comece a aprender com os seus dados.</div> : batches.map(b => (
            <div key={b.id} style={{ display: "grid", gridTemplateColumns: "80px 90px 1fr", gap: 6, fontFamily: F.m, fontSize: 9, color: C.text, borderBottom: `1px solid ${C.dim}`, padding: "4px 0" }}>
              <span>{new Date(b.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
              <span style={{ color: b.status === "erro" ? C.red : b.status === "pausado" ? C.gold : C.cyan }}>{ST_LABEL[b.status]}{b.tentativas > 1 ? " · 2ª" : ""}</span>
              <span style={{ color: C.muted }}>{b.erro ?? `${b.aprovados} aprovados · ${b.descartados} descartados · ${b.chamadas} solicitações`}</span>
            </div>
          ))}
        </div>
      )}

      {open === "banco" && (
        <div style={{ marginTop: 10 }}>
          {refCount != null && refCount < 20 && <div style={{ fontFamily: F.m, fontSize: 10, color: C.gold, border: `1px solid ${C.gold}50`, padding: "6px 8px", marginBottom: 8 }}>Faltam os reels de referência (Pilares 1 e 2) · {refCount} de 20 carregados.</div>}
          <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginBottom: 6 }}>Mostrando só nota 7 ou mais e sem risco aberto. O resto fica em Ver descartados.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <input style={{ ...inp, gridColumn: "1 / -1" }} placeholder="Buscar tema ou abertura" value={f.q} onChange={e => setF(p => ({ ...p, q: e.target.value }))} />
            <select style={inp} value={f.pilar} onChange={e => setF(p => ({ ...p, pilar: e.target.value }))}><option value="">Todos os pilares</option>{pilares.map(p => <option key={p} value={p}>{p}</option>)}</select>
            <select style={inp} value={f.formula} onChange={e => setF(p => ({ ...p, formula: e.target.value }))}><option value="">Todas as fórmulas</option>{formulas.map(([id, n]) => <option key={id} value={String(id)}>{n}</option>)}</select>
            <select style={inp} value={f.nota} onChange={e => setF(p => ({ ...p, nota: e.target.value }))}><option value="">Qualquer nota</option>{[9, 8, 7, 6].map(n => <option key={n} value={n}>Nota ≥ {n}</option>)}</select>
            <select style={inp} value={f.status} onChange={e => setF(p => ({ ...p, status: e.target.value }))} disabled={f.descartados}><option value="">Todos os status</option>{STATUS.map(s => <option key={s} value={s}>{s}</option>)}</select>
          </div>
          <div style={{ ...row, marginTop: 8 }}>
            <label style={{ ...lbl, display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={f.descartados} onChange={e => setF(p => ({ ...p, descartados: e.target.checked, status: "" }))} />VER DESCARTADOS</label>
            <button type="button" disabled={sel.length < 3 || sel.length > 15} onClick={() => setLote(sel.map(id => bank.find(x => x.id === id)).filter(Boolean))} style={sm(C.gold)}>GRAVAR LOTE ({sel.length}/3-15)</button>
          </div>
          {!filtrado.length ? <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, marginTop: 8 }}>Nada encontrado.</div> : filtrado.slice(0, 100).map(x => <Item key={x.id} x={x} actions={f.descartados ? null : <>
            <label style={{ ...lbl, display: "flex", gap: 4, alignItems: "center" }}><input type="checkbox" checked={sel.includes(x.id)} onChange={e => setSel(s => e.target.checked ? (s.length < 15 ? [...s, x.id] : s) : s.filter(i => i !== x.id))} />LOTE</label>
            {["novo", "guardado"].includes(x.status) && <button type="button" onClick={() => escolher(x.id)} style={sm(C.gold)}>Escolher pra hoje</button>}
            {x.status !== "gravado" && x.status !== "postado" && <button type="button" onClick={() => setStatus(x.id, "gravado")} style={sm(C.cyan)}>GRAVADO</button>}
            {x.status !== "postado" && <button type="button" onClick={() => setStatus(x.id, "postado")} style={sm(C.cyan)}>POSTADO</button>}
            {ehSaude(x) && <PesquisarAntes />}
            <button type="button" onClick={() => setStatus(x.id, "descartado")} style={sm(C.muted)}>DESCARTAR</button>
          </>} />)}
          <PillarReelsPanel />
        </div>
      )}

      {lote && <LoteGravacao reels={lote} onGravei={id => setStatus(id, "gravado")} onClose={() => { setLote(null); setSel([]); }} />}
    </div>
  );
}
