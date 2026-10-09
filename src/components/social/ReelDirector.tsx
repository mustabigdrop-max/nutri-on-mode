// PROMPT Q1 — Núcleo de Atenção real (Content Score) + Diretor de Reels com porta de qualidade.
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Nucleus3D } from "./ccSurreal";
import { BlockQuality } from "./ReelBlockQuality";
import { runGerarReel, mergeBlocks, DIRETOR_ETAPAS } from "@/lib/retentionEngine";
import { contentScores, parsePesos, COMP_LABEL, MIN_REELS, MIN_CORRELACAO, spearman, prontoParaGravar, ehRascunho, type Comp } from "@/lib/contentScore";

const C = { cyan: "#00D4FF", gold: "#B8922A", amber: "#EF9F27", green: "#5DCAA5", red: "#EF4444", text: "#C8C8D8", white: "#F0F0F8", muted: "#555566", dim: "#333340", violet: "#AFA9EC" };
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace" };
const L = ({ children, c }: { children: React.ReactNode; c?: string }) => <div style={{ fontFamily: F.m, fontSize: 9, letterSpacing: 2, color: c ?? C.muted, textTransform: "uppercase" }}>{children}</div>;
const T = ({ children, c, s = 10 }: { children: React.ReactNode; c?: string; s?: number }) => <div style={{ fontFamily: F.m, fontSize: s, color: c ?? C.text, lineHeight: 1.5 }}>{children}</div>;
const b = (primary?: boolean, c = C.cyan): React.CSSProperties => ({ background: primary ? C.gold : "transparent", border: primary ? "none" : `1px solid ${c}60`, color: primary ? "#0A0A0A" : c, fontFamily: F.t, fontWeight: 700, fontSize: 12, padding: "8px 10px", cursor: "pointer", borderRadius: 0 });
const scoreCor = (s: number | null) => s == null ? C.muted : s < 40 ? C.red : s < 70 ? C.amber : C.cyan;
const ESTADO: Record<string, { l: string; c: string }> = { elite: { l: "ELITE", c: C.cyan }, aprovado: { l: "APROVADO", c: C.green }, rascunho: { l: "RASCUNHO", c: C.amber }, precisa_revisao: { l: "RASCUNHO", c: C.amber } };
const fmt = (v: number | null | undefined, d = 1) => v == null || !Number.isFinite(Number(v)) ? "—" : Number(v).toFixed(d).replace(".", ",");
const GRAV_COR: Record<string, string> = { critico: C.red, moderado: C.amber, leve: C.muted };

type Props = {
  scripts: any[]; results: any[]; loaded: boolean; pesosTxt?: string | null;
  onReload: () => Promise<void> | void; onGravar: (s: any) => void; onAbrirLab: (lab: "gancho" | "fala") => void; scrollTo: (id: string) => void;
};

/* ── Núcleo de Atenção (real) ── */
export function NucleoReal({ scripts, results, loaded, pesosTxt, scrollTo, onAbrirLab, hoje }: Props & { hoje: any | null }) {
  const [modo, setModo] = useState<"real" | "previsto">("real");
  const pesos = useMemo(() => parsePesos(pesosTxt), [pesosTxt]);
  const cs = useMemo(() => contentScores(results, pesos), [results, pesos]);
  const ult = cs.ultimo;
  const prev = hoje?.nota_final != null ? Number(hoje.nota_final) : null;
  const real = modo === "real";
  const val = real ? (cs.pronto ? ult?.score ?? null : null) : prev;
  const col = real ? scoreCor(val) : C.violet;
  const aguardando = results.find(r => r.status === "aguardando" && Date.now() - +new Date(r.created_at) >= 864e5);
  const acao: Record<Comp, { t: string; run?: () => void }> = {
    gancho: { t: "Laboratório de Gancho", run: () => onAbrirLab("gancho") },
    retencao: { t: "Treino de ritmo (Laboratório de Fala)", run: () => onAbrirLab("fala") },
    acao: { t: "Treino de CTA ainda não existe na Academia" },
    seguidor: { t: "Oficina de Posicionamento ainda não existe" },
  };
  const gauges: { k: Comp; txt: (v: number) => string }[] = [
    { k: "gancho", txt: v => `${fmt(v, 0)}% retido aos 3s` }, { k: "retencao", txt: v => `${fmt(v, 0)}% assistido em média` },
    { k: "acao", txt: v => `${fmt(v * 100, 1)}% salvou ou enviou` }, { k: "seguidor", txt: v => `${fmt(v, 1)} seguidores / mil views` },
  ];
  if (!loaded) return <div className="cc-skel" style={{ width: 180, height: 180, borderRadius: "50%", margin: "14px auto 0" }} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0 4px", gap: 8 }}>
      <div role="group" aria-label="Previsto ou Real" style={{ display: "flex", alignSelf: "flex-end" }}>
        {(["previsto", "real"] as const).map(m => (
          <button key={m} type="button" aria-pressed={modo === m} onClick={() => setModo(m)}
            style={{ fontFamily: F.m, fontSize: 9, letterSpacing: 1, padding: "3px 10px", borderRadius: 0, cursor: "pointer", border: `1px solid ${m === "real" ? C.cyan : C.violet}70`, background: modo === m ? (m === "real" ? C.cyan : C.violet) : "transparent", color: modo === m ? "#0A0A0A" : m === "real" ? C.cyan : C.violet }}>
            {m === "real" ? "REAL" : "PREVISTO"}
          </button>
        ))}
      </div>
      <Nucleus3D shown={val ?? 0} score={val} exemplo={false} color={col} dashed={real ? !cs.pronto : prev == null} max={real ? 100 : 10}>
        <div style={{ fontFamily: F.t, fontSize: 56, fontWeight: 700, color: C.white, lineHeight: 1 }}>{val == null ? "—" : real ? val : fmt(val)}</div>
        <L c={col}>{real ? "Content Score" : "Nota do roteiro de hoje"}</L>
        {real && cs.pronto && cs.delta != null && <div style={{ fontFamily: F.m, fontSize: 10, color: C.text, marginTop: 4 }}>vs. sua mediana: {cs.delta >= 0 ? "+" : "−"}{Math.abs(cs.delta)}</div>}
      </Nucleus3D>
      {real && !cs.pronto && <T c={C.amber}>Calibrando {cs.n}/{MIN_REELS} reels com resultado</T>}
      {!real && <T c={C.violet}>{prev == null ? "Nenhum roteiro hoje passou pela porta de qualidade." : "Previsão do roteiro (0 a 10). Não é resultado real."}</T>}
      {real && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8, width: "100%", maxWidth: 380 }}>
          {gauges.map(g => {
            const v = ult?.val[g.k] ?? null, p = ult?.pct[g.k] ?? null;
            return (
              <div key={g.k} style={{ textAlign: "center", minWidth: 0, border: `1px solid ${C.dim}`, padding: "6px 2px" }}>
                <div style={{ fontFamily: F.t, fontSize: 13, fontWeight: 700, color: v == null ? C.muted : C.white, lineHeight: 1.15 }}>{v == null ? "—" : g.txt(v)}</div>
                <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, marginTop: 3 }}>{p == null ? COMP_LABEL[g.k].toUpperCase() : `${COMP_LABEL[g.k].toUpperCase()} · P${p}`}</div>
              </div>
            );
          })}
        </div>
      )}
      {real && ult && <T c={C.muted} s={9}>Componentes usados: {ult.usados.map(c => COMP_LABEL[c]).join(", ")}. Os pesos são uma escolha de produto, não um achado de estudo.</T>}
      {real && cs.fraco && (
        <T>Próxima ação: {COMP_LABEL[cs.fraco]} foi o ponto mais fraco.{" "}
          {acao[cs.fraco].run ? <button type="button" onClick={acao[cs.fraco].run} style={{ fontFamily: F.m, fontSize: 10, color: C.cyan, background: "none", border: "none", textDecoration: "underline", cursor: "pointer", padding: 0 }}>{acao[cs.fraco].t}</button> : <span style={{ color: C.muted }}>{acao[cs.fraco].t}</span>}
        </T>
      )}
      {aguardando && <button type="button" onClick={() => scrollTo("cc-resultado")} style={{ ...b(false, C.amber), width: "100%" }}>Lançar o resultado do reel de ontem</button>}
      <button type="button" onClick={() => scrollTo("cc-resultado")} style={{ ...b(), width: "100%" }}>Lançar resultado</button>
    </div>
  );
}

/* ── Diretor de Reels ── */
export function DiretorReels({ scripts, onReload, onGravar, scrollTo }: Props) {
  const [tema, setTema] = useState("");
  const [etapa, setEtapa] = useState<string | null>(null);
  const [rodada, setRodada] = useState(0);
  const [feitas, setFeitas] = useState<string[]>([]);
  const [temaEscolhido, setTemaEscolhido] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [atual, setAtual] = useState<any | null>(null);
  const [semana, setSemana] = useState<{ feitos: number; total: number } | null>(null);
  const [aba, setAba] = useState<"prontos" | "rascunhos" | null>(null);
  const ac = useRef<AbortController | null>(null);
  const busy = etapa !== null;

  const hojeIni = new Date(); hojeIni.setHours(0, 0, 0, 0);
  const doDia = scripts.find(s => new Date(s.created_at) >= hojeIni && s.nota_final != null) ?? null;
  const reel = atual ?? doDia;
  const prontos = scripts.filter(prontoParaGravar);
  const rascunhos = scripts.filter(ehRascunho);
  const p1 = new Set(scripts.filter(s => /^p1-/.test(s.slug ?? "")).map(s => s.slug)).size;
  const p2 = new Set(scripts.filter(s => /^p2-/.test(s.slug ?? "")).map(s => s.slug)).size;

  const rodar = async (body: any) => {
    const ctrl = new AbortController(); ac.current = ctrl;
    setErro(null); setFeitas([]); setRodada(0); setTemaEscolhido(null); setEtapa("tema");
    try {
      const s = await runGerarReel({ objetivo: "alcance", tom: "direto", diretor: true, ...body }, (st, ev) => {
        setEtapa(st); setFeitas(f => f.includes(st) ? f : [...f, st]);
        if (st === "revisao" && ev?.rodada) setRodada(ev.rodada);
        if (st === "tema" && ev?.tema) setTemaEscolhido(ev.tema);
      }, ctrl.signal);
      setAtual(s); setFeitas(f => [...f, "pronto"]);
      return s;
    } finally { setEtapa(null); ac.current = null; }
  };
  const gerar = async () => {
    try { await rodar({ tema: tema.trim() }); setTema(""); await onReload(); }
    catch (e: any) { setErro(e?.name === "AbortError" ? "Geração parada." : e?.message || "Não foi possível gerar."); }
  };
  const parar = () => { ac.current?.abort(); setSemana(s => s && { ...s, total: s.feitos }); };
  const planejarSemana = async () => {
    setSemana({ feitos: 0, total: 7 });
    let n = 0;
    for (let i = 0; i < 7; i++) {
      try { await rodar({}); n++; setSemana({ feitos: n, total: 7 }); }
      catch (e: any) {
        if (e?.name === "AbortError") { toast(`Parado. ${n} de 7 reels feitos.`); break; }
        if (e?.status === 409) { toast.error(`${e.message} ${n} de 7 reels feitos.`); break; }
        setErro(e?.message || "Falha"); break;
      }
    }
    setSemana(null); await onReload();
    if (n === 7) toast.success("7 reels feitos para a semana.");
  };
  const outroAngulo = async () => {
    const prox = reel?.angulo?.outros?.[0];
    if (!prox) return toast.error("Este reel não tem outro ângulo do Passo 0.");
    try { await rodar({ tema: reel.tema, angulo_escolhido: prox, angulo_outros: [reel.angulo.escolhido, ...reel.angulo.outros.slice(1)] }); await onReload(); }
    catch (e: any) { setErro(e?.message || "Falha"); }
  };
  const marcarGravado = async (s: any, forcar = false) => {
    if (ehRascunho(s) && !forcar) return;
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const { error } = await supabase.from("retention_scripts").update({ gravado_em: new Date().toISOString() }).eq("id", s.id);
    if (error) return toast.error("Não foi possível marcar como gravado.");
    const { data: ex } = await supabase.from("retention_results").select("id").eq("script_id", s.id).limit(1);
    if (!ex?.length) await supabase.from("retention_results").insert({ script_id: s.id, user_id: user.id, status: "aguardando" });
    toast.success("Marcado como gravado. Lance o resultado em 24 horas.");
    setAtual((a: any) => a?.id === s.id ? { ...a, gravado_em: new Date().toISOString() } : a); await onReload();
  };
  const gravarMesmoAssim = async (s: any) => {
    const abertas = (s.pendencias ?? []) as any[];
    const lista = abertas.map((p: any) => `• Bloco ${p.bloco} (${p.gravidade}): ${p.regra}${p.trecho ? ` — "${p.trecho}"` : ""}`).join("\n");
    if (!window.confirm(`Este reel não passou da porta (nota ${fmt(s.nota_final)}).\nPendências abertas:\n${lista || "• nenhuma listada"}\n\nGravar mesmo assim?`)) return;
    await supabase.from("retention_scripts").update({ gravado_mesmo_assim: { em: new Date().toISOString(), pendencias: abertas } }).eq("id", s.id);
    onGravar(s);
  };
  const copiar = async (s: any) => {
    const txt = (s.roteiro?.blocos ?? []).map((x: any) => `${x.tempo ?? ""} ${x.fala ?? ""}`.trim()).join("\n");
    try { await navigator.clipboard.writeText(txt); toast.success("Roteiro copiado"); } catch { toast.error("Não foi possível copiar"); }
  };

  const etIdx = DIRETOR_ETAPAS.findIndex(e => e.k === etapa);
  return (
    <div style={{ marginTop: 14, borderTop: `1px solid ${C.cyan}22`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <L c={C.gold}>Diretor de Reels</L>
      {!busy && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button type="button" onClick={gerar} style={{ ...b(true), flex: "2 1 180px", padding: "13px 0", fontSize: 15, letterSpacing: 1 }}>GERAR REEL DE HOJE</button>
          <input value={tema} onChange={e => setTema(e.target.value)} placeholder="Tema (opcional)" aria-label="Tema (opcional)"
            style={{ flex: "1 1 140px", background: "#0A0A12", border: `1px solid ${C.cyan}40`, color: C.white, fontFamily: F.m, fontSize: 11, padding: "8px 10px", borderRadius: 0 }} />
        </div>
      )}
      {busy && (
        <div role="status" aria-live="polite" style={{ border: `1px solid ${C.cyan}30`, padding: 10 }}>
          {temaEscolhido && <T c={C.cyan}>Tema: {temaEscolhido}</T>}
          {semana && <><T>Planejando a semana: {semana.feitos} de {semana.total}</T><div style={{ height: 4, background: C.dim, margin: "4px 0 8px" }}><div style={{ height: "100%", width: `${(semana.feitos / 7) * 100}%`, background: C.gold }} /></div></>}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {DIRETOR_ETAPAS.map((e, i) => {
              const ok = feitas.includes(e.k) && i < etIdx, now = e.k === etapa;
              return <div key={e.k} style={{ fontFamily: F.m, fontSize: 10, color: now ? C.cyan : ok ? C.green : C.muted }}>{ok ? "✓" : now ? "●" : "○"} {e.l}{e.k === "revisao" && rodada ? ` (rodada ${rodada})` : ""}</div>;
            })}
          </div>
          <button type="button" onClick={parar} style={{ ...b(false, C.red), marginTop: 8, width: "100%" }}>Parar</button>
        </div>
      )}
      {erro && !busy && <T c={C.red}>{erro}</T>}
      {reel && !busy && <ReelDeHoje s={reel} onGravar={onGravar} onMarcar={() => marcarGravado(reel)} onMesmoAssim={() => gravarMesmoAssim(reel)} onCopiar={() => copiar(reel)} onOutro={outroAngulo} onReload={async () => { await onReload(); setAtual(null); }} scrollTo={scrollTo} />}
      {!busy && (
        <>
          <button type="button" onClick={() => setAba(a => a === "prontos" ? null : "prontos")} style={{ ...b(), textAlign: "left" }}>Ou grave um dos {prontos.length} prontos do Banco</button>
          <T c={C.muted} s={9}>Reels de referência: Pilar 1 {p1}/10 · Pilar 2 {p2}/10{p1 + p2 < 20 ? ` · faltam ${20 - p1 - p2} dos 20` : ""}</T>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" onClick={planejarSemana} style={{ ...b(), flex: 1 }}>Planejar a semana (7 reels)</button>
            <button type="button" onClick={() => setAba(a => a === "rascunhos" ? null : "rascunhos")} style={{ ...b(false, C.amber), flex: 1 }}>Rascunhos ({rascunhos.length})</button>
          </div>
          {aba && <ListaBanco itens={aba === "prontos" ? prontos : rascunhos} rascunho={aba === "rascunhos"} onAbrir={s => { setAtual(s); setAba(null); }} />}
        </>
      )}
    </div>
  );
}

function ListaBanco({ itens, rascunho, onAbrir }: { itens: any[]; rascunho: boolean; onAbrir: (s: any) => void }) {
  if (!itens.length) return <T c={C.muted}>{rascunho ? "Nenhum rascunho." : "Nenhum reel APROVADO ou ELITE ainda não gravado."}</T>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 280, overflowY: "auto" }}>
      {itens.slice(0, 40).map(s => {
        const e = ESTADO[s.status_qualidade] ?? ESTADO.rascunho;
        return (
          <button key={s.id} type="button" onClick={() => onAbrir(s)} style={{ textAlign: "left", background: `${C.cyan}06`, border: `1px solid ${e.c}30`, padding: "6px 8px", cursor: "pointer", borderRadius: 0 }}>
            <span style={{ fontFamily: F.m, fontSize: 9, color: e.c }}>{e.l} · {fmt(s.nota_final ?? s.nota_geral)}</span>
            <span style={{ fontFamily: F.m, fontSize: 10, color: C.text, marginLeft: 8 }}>{s.titulo || s.tema}</span>
            {rascunho && (s.pendencias ?? []).length > 0 && <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 2 }}>{(s.pendencias as any[]).length} pendência(s): {(s.pendencias as any[]).slice(0, 3).map(p => p.regra).join(", ")}</div>}
          </button>
        );
      })}
    </div>
  );
}

function ReelDeHoje({ s, onGravar, onMarcar, onMesmoAssim, onCopiar, onOutro, onReload, scrollTo }: { s: any; onGravar: (s: any) => void; onMarcar: () => void; onMesmoAssim: () => void; onCopiar: () => void; onOutro: () => void; onReload: () => void; scrollTo: (id: string) => void }) {
  const [blocosOpen, setBlocosOpen] = useState(false);
  const [diario, setDiario] = useState(false);
  const [apoio, setApoio] = useState(false);
  const e = ESTADO[s.status_qualidade] ?? ESTADO.rascunho;
  const rasc = ehRascunho(s);
  const pend = (s.pendencias ?? []) as any[];
  const blocos = mergeBlocks(s);
  const hist = (s.historico_revisoes ?? []) as any[];
  return (
    <div style={{ border: `1px solid ${e.c}50`, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      <L c={C.gold}>Reel de hoje</L>
      <div style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: C.white, lineHeight: 1.2 }}>{s.titulo || s.tema}</div>
      {s.angulo_usado && <T c={C.cyan} s={9}>Ângulo: {s.angulo_usado}</T>}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: F.t, fontWeight: 700, fontSize: 14, color: "#0A0A0A", background: e.c, padding: "2px 10px" }}>{e.l} · {fmt(s.nota_final)}</span>
        <span style={{ fontFamily: F.m, fontSize: 9, color: C.text }}>Crítico 1 {fmt(s.nota_c1)} · Crítico 2 {fmt(s.nota_c2)} · Verificador {fmt(s.teto_verificador, 0)}</span>
      </div>
      {rasc && <T c={C.amber}>Não passou da porta (nota {fmt(s.nota_final)}).</T>}
      {pend.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <L>Pendências ({pend.length})</L>
          {pend.map((p, i) => <T key={i} s={9} c={GRAV_COR[p.gravidade] ?? C.text}>Bloco {p.bloco} · {p.gravidade.toUpperCase()} · {p.regra}{p.trecho ? ` — “${p.trecho}”` : ""}</T>)}
        </div>
      )}
      {hist.length > 0 && (
        <div>
          <button type="button" onClick={() => setDiario(d => !d)} aria-expanded={diario} style={{ fontFamily: F.m, fontSize: 10, color: C.cyan, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
            Diário de revisões: {hist.map(h => `Rodada ${h.rodada}: ${fmt(h.nota_final)}`).join(" → ")} {diario ? "▲" : "▼"}
          </button>
          {diario && hist.map(h => (
            <div key={h.rodada} style={{ borderLeft: `2px solid ${C.cyan}40`, paddingLeft: 8, marginTop: 6 }}>
              <T s={9} c={C.cyan}>Rodada {h.rodada} · nota {fmt(h.nota_final)} · {h.pendencias} pendência(s){h.angulo ? ` · ${h.angulo}` : ""} · {h.motivo}</T>
              {(h.blocos_alterados ?? []).map((m: any, i: number) => <T key={i} s={9}>B{m.id}{m.regra ? ` (${m.regra})` : ""}: “{m.antes || "—"}” → “{m.depois}”</T>)}
              {(h.rejeitadas ?? []).map((m: any, i: number) => <T key={`r${i}`} s={9} c={C.muted}>B{m.id}: mudança recusada · {m.motivo}</T>)}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 6 }}>
        {rasc ? <>
          <button type="button" onClick={() => setBlocosOpen(true)} style={b(false, C.amber)}>Corrigir à mão</button>
          <button type="button" onClick={onMesmoAssim} style={b(false, C.red)}>Gravar mesmo assim</button>
        </> : <button type="button" onClick={() => onGravar(s)} style={b(true)}>▶ Modo Gravação</button>}
        <button type="button" onClick={onCopiar} style={b()}>Copiar roteiro</button>
        <button type="button" onClick={() => setApoio(a => !a)} style={b()}>Pacote de apoio</button>
        <button type="button" onClick={onOutro} style={b()}>Outro ângulo</button>
        {!rasc && <button type="button" onClick={onMarcar} disabled={!!s.gravado_em} style={{ ...b(false, C.green), opacity: s.gravado_em ? 0.5 : 1 }}>{s.gravado_em ? "✓ Gravado" : "Marcar como gravado"}</button>}
        <button type="button" onClick={() => setBlocosOpen(o => !o)} style={b(false, C.muted)}>{blocosOpen ? "Esconder blocos" : `Ver blocos (${blocos.length})`}</button>
      </div>
      {apoio && (
        <div style={{ border: `1px solid ${C.dim}`, padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          <T s={9} c={C.muted}>LEGENDA</T><T>{s.roteiro?.legenda || "—"}</T>
          {(s.roteiro?.hashtags ?? []).length > 0 && <T c={C.cyan} s={9}>{s.roteiro.hashtags.join(" ")}</T>}
          {s.roteiro?.versao_tiktok && <><T s={9} c={C.muted}>VERSÃO TIKTOK</T><T>{s.roteiro.versao_tiktok}</T></>}
          {s.roteiro?.versao_shorts && <><T s={9} c={C.muted}>VERSÃO SHORTS</T><T>{s.roteiro.versao_shorts}</T></>}
          <button type="button" onClick={() => scrollTo("cc-cards")} style={{ ...b(), alignSelf: "flex-start" }}>Abrir Estúdio de Cards</button>
        </div>
      )}
      {blocosOpen && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, borderLeft: `1px solid ${C.cyan}30`, paddingLeft: 10 }}>
          {blocos.map((x: any) => (
            <div key={String(x.id)}>
              <T s={9} c={C.muted}>{x.tempo ?? "—"}{/ressalva/i.test(x.funcao ?? "") ? " · RESSALVA" : ""} · NOTA {x.nota ?? "—"}</T>
              <T s={11}>{x.fala}</T>
              <BlockQuality scriptId={s.id} blocoId={Number(x.id)} motivo={(s.motivos_nota ?? []).find((m: any) => m.id === Number(x.id))} onUpdated={onReload} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Calibração: previsto × real ── */
export function PrevistoRealScatter({ scripts, results, pesosTxt }: { scripts: any[]; results: any[]; pesosTxt?: string | null }) {
  const cs = useMemo(() => contentScores(results, parsePesos(pesosTxt)), [results, pesosTxt]);
  const pts = cs.reels.map(r => { const s = scripts.find(x => x.id === r.script_id); return s?.nota_final != null && r.score != null ? [Number(s.nota_final), r.score] as [number, number] : null; }).filter(Boolean) as [number, number][];
  if (pts.length < MIN_CORRELACAO) return <T c={C.muted}>Previsto × real: precisa de {MIN_CORRELACAO} reels com nota do roteiro e resultado ({pts.length}/{MIN_CORRELACAO}).</T>;
  const rho = spearman(pts);
  const W = 260, H = 160;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 360, display: "block" }} aria-label="Dispersão nota do roteiro × score real">
        <line x1={24} y1={H - 18} x2={W - 6} y2={H - 18} stroke={C.dim} /><line x1={24} y1={6} x2={24} y2={H - 18} stroke={C.dim} />
        {pts.map(([x, y], i) => <circle key={i} cx={24 + (x / 10) * (W - 30)} cy={H - 18 - (y / 100) * (H - 24)} r={3.5} fill={C.cyan} />)}
        <text x={W - 6} y={H - 4} textAnchor="end" fill={C.muted} fontSize={8} fontFamily={F.m}>nota do roteiro (0-10)</text>
        <text x={4} y={10} fill={C.muted} fontSize={8} fontFamily={F.m}>score</text>
      </svg>
      <T>Correlação de postos (Spearman): {rho == null ? "—" : fmt(rho, 2)} · n = {pts.length}</T>
      <T c={C.muted} s={9}>Com poucos reels esta correlação é instável.</T>
      {rho != null && rho < 0.3 && <T c={C.amber}>A nota do roteiro ainda não prevê o seu resultado. Use os dados para ajustar o Crítico.</T>}
    </div>
  );
}
