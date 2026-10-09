import { Component, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CommandCenterAutomation from "./CommandCenterAutomation";
import { needsSourceWarning } from "@/lib/pillarReels";

/* Metade inferior do Command Center: Fórmulas, Alertas, Meta, Automação, Atalhos.
   Tudo calculado de dados reais do usuário; sem dado, o item some ou mostra estado vazio. */

const C = { cyan: "#00D4FF", gold: "#B8922A", red: "#EF4444", green: "#5DCAA5", amber: "#EF9F27", text: "#C8C8D8", white: "#F0F0F8", muted: "#555566", dim: "#333340" };
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace" };
const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", background: "#0A0A12", border: `1px solid ${C.dim}`, color: C.white, fontFamily: F.m, fontSize: 11, padding: "8px 10px", borderRadius: 0 };
const btn = (primary?: boolean): React.CSSProperties => ({ flex: 1, background: primary ? C.gold : "transparent", border: primary ? "none" : `1px solid ${C.cyan}50`, color: primary ? "#0A0A0A" : C.cyan, fontFamily: F.t, fontWeight: 700, fontSize: 13, padding: "10px 0", cursor: "pointer", borderRadius: 0 });
const mini = (c: string): React.CSSProperties => ({ background: "transparent", border: `1px solid ${c}60`, color: c, fontFamily: F.t, fontWeight: 700, fontSize: 11, padding: "4px 10px", cursor: "pointer", borderRadius: 0, flexShrink: 0 });
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const DAY = 864e5;

function useCountUp(target: number, ms = 1000) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (reduced()) { setV(target); return; }
    const t0 = performance.now(); let raf = 0;
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / ms); setV(target * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}
const Num = ({ v, dec = 0 }: { v: number; dec?: number }) => { const x = useCountUp(v); return <>{x.toFixed(dec).replace(".", ",")}</>; };

function Panel({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="cc-rise" style={{ scrollMarginTop: 80, position: "relative", background: "rgba(10,10,18,0.72)", border: `1px solid ${C.cyan}33`, clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)", padding: 14, overflow: "hidden", boxShadow: `inset 0 1px 0 ${C.cyan}22` }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${C.cyan}55, transparent)`, pointerEvents: "none" }} />
      {children}
    </div>
  );
}
const Label = ({ children, color }: { children: React.ReactNode; color?: string }) => <div style={{ fontFamily: F.m, fontSize: 9, letterSpacing: 2, color: color || C.muted, textTransform: "uppercase" }}>{children}</div>;
const Skel = ({ h }: { h: number }) => <div className="cc-skel" style={{ height: h, marginTop: 8 }} />;
const Txt = ({ children, c = C.text, s = 10 }: { children: React.ReactNode; c?: string; s?: number }) => <div style={{ fontFamily: F.m, fontSize: s, color: c, lineHeight: 1.5 }}>{children}</div>;

/** Erro num bloco não derruba a página: mostra aviso e "Tentar de novo" só nele. */
class BlockBoundary extends Component<{ children: React.ReactNode; onRetry?: () => void }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() {
    if (!this.state.err) return this.props.children;
    return <Panel><Txt c={C.red}>Não foi possível carregar este bloco.</Txt>
      <button type="button" style={{ ...mini(C.cyan), marginTop: 8 }} onClick={() => { this.setState({ err: false }); this.props.onRetry?.(); }}>Tentar de novo</button></Panel>;
  }
}

/* ── helpers puros ── */
const realMedia = (r: any): number | null => {
  const comp: any[] = r?.curva_real?.comparacao ?? [];
  const v = comp.map(c => Number(c.real)).filter(Number.isFinite);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
const prevMedia = (r: any): number | null => {
  const comp: any[] = r?.curva_real?.comparacao ?? [];
  const v = comp.map(c => Number(c.previsto)).filter(Number.isFinite);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

export type LowerProps = {
  loaded: boolean; scripts: any[]; results: any[]; stats: any[]; atlas: { id: number; nome: string }[];
  bank: any[] | null; pillars: any[] | null; leadsCount: number | null;
  goal: any; meta: { atual: number; alvo: number; dia: number } | null; goalForm: { metrica: string; alvo: string };
  setGoalForm: (f: (g: any) => any) => void; salvarMeta: () => void;
  streak: number; reelsHoje: number; blocosFracos: any[];
  onTestar: (formulaId: number, nome: string) => void; onRodarAgora: () => void; onLancar: () => void; onFabrica: () => void;
  onOpenZone?: (z: string) => void; onOpenTool?: (t: string) => void; reload: () => void;
};

/* ── 1) SUAS FÓRMULAS ── */
function Formulas({ loaded, stats, atlas, scripts, results, onTestar }: LowerProps) {
  const rows = useMemo(() => {
    const medidas = stats.filter(s => s.usos > 0).map(s => {
      const ids = new Set(scripts.filter(x => x.formula_id === s.formula_id).map(x => x.id));
      const rm = results.filter(r => ids.has(r.script_id)).map(realMedia).filter((v): v is number => v != null);
      return { ...s, nome: atlas.find(a => a.id === s.formula_id)?.nome ?? `Fórmula ${s.formula_id}`, ret: rm.length ? (rm.reduce((a, b) => a + b, 0) / rm.length) * 10 : null };
    }).sort((a, b) => Number(b.retencao_3s_media ?? -1) - Number(a.retencao_3s_media ?? -1));
    const nao = atlas.filter(a => !medidas.some(m => m.formula_id === a.id));
    return { medidas, nao };
  }, [stats, atlas, scripts, results]);
  return (
    <Panel>
      <Label color={C.cyan}>Suas fórmulas</Label>
      <Txt c={C.muted} s={9}>80% das ideias usam as fórmulas que mais retiveram. 20% testam fórmulas novas.</Txt>
      {!loaded ? <><Skel h={22} /><Skel h={22} /><Skel h={22} /></> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {rows.medidas.map((f, i) => {
            const conf = f.usos >= 3;
            return (
              <div key={f.formula_id} style={{ borderLeft: `2px solid ${i === 0 ? C.gold : C.cyan}`, padding: "4px 8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 6, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: C.white }}>{f.nome}</span>
                  <span style={{ fontFamily: F.m, fontSize: 8, color: conf ? C.green : C.amber, border: `1px solid ${conf ? C.green : C.amber}50`, padding: "1px 6px" }}>{conf ? "Confirmada" : "Indício"}</span>
                </div>
                <div style={{ height: 4, background: C.dim, marginTop: 5 }}>
                  <div style={{ height: "100%", width: `${Math.min(100, f.ret ?? 0)}%`, background: i === 0 ? C.gold : C.cyan, transition: "width .8s ease" }} />
                </div>
                <div style={{ fontFamily: F.m, fontSize: 9, color: C.text, marginTop: 4 }}>
                  Retenção média {f.ret == null ? "—" : <><Num v={f.ret} />%</>} · {f.usos} {f.usos === 1 ? "vídeo" : "vídeos"} · {f.retencao_3s_media == null ? "—" : <><Num v={Number(f.retencao_3s_media)} />%</>} passou dos 3s
                </div>
              </div>
            );
          })}
          {rows.nao.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.6 }}>
              <span style={{ fontFamily: F.t, fontSize: 13, fontWeight: 700, color: C.muted, flex: 1, minWidth: 0 }}>{a.nome}</span>
              <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted }}>0 testes</span>
              <button type="button" style={mini(C.cyan)} onClick={() => onTestar(a.id, a.nome)}>Testar</button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/* ── 2) ALERTAS ── */
type Alerta = { p: number; icon: string; cor: string; txt: string; acao: string; fn: () => void };
function Alertas(p: LowerProps & { metaStatus: string | null }) {
  const { loaded, scripts, results, bank, pillars, stats, atlas, streak, reelsHoje, blocosFracos, metaStatus } = p;
  const list = useMemo(() => {
    const a: Alerta[] = []; const now = Date.now();
    const comResultado = new Set(results.map(r => r.script_id));
    (bank ?? []).filter(b => b.status === "postado" && now - new Date(b.updated_at).getTime() > DAY && (!b.script_id || !comResultado.has(b.script_id)))
      .slice(0, 1).forEach(b => a.push({ p: 1, icon: "◷", cor: C.gold, txt: `Postado há mais de 24h sem resultado.`, acao: `Lançar resultado de ${b.tema}`, fn: () => p.onOpenZone?.("strategy") }));
    scripts.filter(needsSourceWarning).slice(0, 1).forEach(s => a.push({ p: 2, icon: "⚑", cor: C.amber, txt: "Fonte pendente antes de gravar.", acao: `Conferir fonte de ${s.tema}`, fn: p.onFabrica }));
    const ult3 = results.slice(0, 3).map(r => [realMedia(r), prevMedia(r)]).filter(([r, v]) => r != null && v != null && v > 0) as number[][];
    if (ult3.length === 3) { const r = ult3.reduce((s, x) => s + x[0], 0), v = ult3.reduce((s, x) => s + x[1], 0); if (r < v * 0.85) a.push({ p: 3, icon: "↘", cor: C.red, txt: "Retenção abaixo da curva nos últimos 3 reels.", acao: "Ver a maior queda", fn: () => p.onOpenZone?.("strategy") }); }
    if (metaStatus === "Atrasado") a.push({ p: 4, icon: "◎", cor: C.red, txt: "Você está abaixo da meta desta semana.", acao: "Ver a meta", fn: () => document.getElementById("cc-meta")?.scrollIntoView({ behavior: "smooth" }) });
    if (streak > 0 && reelsHoje === 0 && new Date().getHours() >= 18) a.push({ p: 5, icon: "⚡", cor: C.amber, txt: `${streak} dias seguidos em risco.`, acao: "Gerar o reel de hoje", fn: p.onRodarAgora });
    if (bank && pillars) for (const pl of pillars) {
      const ult = bank.filter(b => b.pilar === pl.nome || b.pilar === pl.chave).map(b => new Date(b.created_at).getTime()).sort((x, y) => y - x)[0];
      const desde = ult ?? new Date(pl.created_at).getTime();
      const n = Math.floor((now - desde) / DAY);
      if (n >= 7) { a.push({ p: 6, icon: "▤", cor: C.cyan, txt: `Pilar ${pl.nome} está parado há ${n} dias.`, acao: "Abrir a Fábrica", fn: p.onFabrica }); break; }
    }
    const best = stats.filter(s => s.usos >= 3 && s.retencao_3s_media != null).sort((x, y) => Number(y.retencao_3s_media) - Number(x.retencao_3s_media))[0];
    if (best) { const nome = atlas.find(f => f.id === best.formula_id)?.nome ?? `Fórmula ${best.formula_id}`; a.push({ p: 7, icon: "★", cor: C.green, txt: `${nome} é a que mais retém.`, acao: "Usar no próximo reel", fn: () => p.onTestar(best.formula_id, nome) }); }
    if (blocosFracos.length) a.push({ p: 8, icon: "!", cor: C.red, txt: `${blocosFracos.length} bloco(s) do reel de hoje abaixo de 7.`, acao: "Ver Linha da Atenção", fn: () => document.getElementById("cc-linha-atencao")?.scrollIntoView({ behavior: "smooth" }) });
    return a.sort((x, y) => x.p - y.p).slice(0, 4);
  }, [scripts, results, bank, pillars, stats, atlas, streak, reelsHoje, blocosFracos, metaStatus]);
  return (
    <Panel>
      <Label color={C.red}>Alertas e oportunidades</Label>
      {!loaded ? <><Skel h={30} /><Skel h={30} /></> : !list.length ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontFamily: F.t, fontSize: 16, fontWeight: 700, color: C.green }}>✓ Tudo em dia</div>
          <Txt c={C.muted}>Próximo passo: gere o reel de hoje.</Txt>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {list.map((x, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", borderLeft: `2px solid ${x.cor}`, padding: "4px 8px" }}>
              <span aria-hidden style={{ color: x.cor, fontSize: 14, width: 16, textAlign: "center" }}>{x.icon}</span>
              <span style={{ flex: 1, minWidth: 140, fontFamily: F.m, fontSize: 10, color: C.text }}>{x.txt}</span>
              <button type="button" style={{ ...mini(x.cor), whiteSpace: "normal", textAlign: "left" }} onClick={x.fn}>{x.acao}</button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/* ── 3) META DE 90 DIAS ── */
export function metaCalc(alvo: number, atual: number, dia: number) {
  const faltamDias = Math.max(0, 90 - dia);
  const semanas = Math.max(1, faltamDias / 7);
  const ritmo = Math.max(0, alvo - atual) / semanas;
  const ref = (alvo * dia) / 90;
  const status = dia < 1 ? "No ritmo" : atual > ref * 1.05 ? "Adiantado" : atual < ref * 0.95 ? "Atrasado" : "No ritmo";
  return { faltamDias, ritmo, ref, status, pct: alvo > 0 ? Math.min(100, (atual / alvo) * 100) : 0 };
}
function Meta(p: LowerProps & { calc: ReturnType<typeof metaCalc> | null; curva: { d: number; v: number }[] }) {
  const { loaded, goal, meta, calc, curva, goalForm, setGoalForm, salvarMeta } = p;
  const [edit, setEdit] = useState(false);
  const reels = goal?.metrica !== "retencao_3s";
  const un = reels ? "reels" : "%";
  const W = 300, H = 90;
  const x = (d: number) => (d / 90) * W, y = (v: number) => H - (meta && meta.alvo ? Math.min(1, v / meta.alvo) : 0) * (H - 6) - 3;
  const pct = useCountUp(calc?.pct ?? 0);
  const corSt = calc?.status === "Atrasado" ? C.red : calc?.status === "Adiantado" ? C.green : C.cyan;
  const form = (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
      <select style={inp} value={goalForm.metrica} onChange={e => setGoalForm(g => ({ ...g, metrica: e.target.value }))}>
        <option value="reels_publicados">Reels com resultado lançado</option>
        <option value="retencao_3s">Média de % que passou dos 3s</option>
      </select>
      <input style={inp} inputMode="decimal" value={goalForm.alvo} onChange={e => setGoalForm(g => ({ ...g, alvo: e.target.value }))} placeholder="Alvo em 90 dias" />
      <button type="button" onClick={() => { salvarMeta(); setEdit(false); }} style={{ ...btn(!goal), flex: "none" }}>{goal ? "SALVAR META" : "DEFINIR META"}</button>
    </div>
  );
  return (
    <Panel id="cc-meta">
      <Label color={C.cyan}>Meta de 90 dias</Label>
      {!loaded ? <><div className="cc-skel" style={{ width: 120, height: 120, borderRadius: "50%", margin: "12px auto 0" }} /><Skel h={60} /></> : !goal || !meta || !calc ? form : (
        <>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
            <svg width={110} height={110} viewBox="0 0 110 110" style={{ flexShrink: 0 }}>
              <circle cx={55} cy={55} r={46} fill="none" stroke={`${C.cyan}18`} strokeWidth={7} />
              <circle cx={55} cy={55} r={46} fill="none" stroke={C.cyan} strokeWidth={7} strokeDasharray={`${(pct / 100) * 289} 289`} transform="rotate(-90 55 55)" />
              <text x={55} y={52} textAnchor="middle" fill={C.white} fontFamily={F.t} fontWeight={700} fontSize={22}>{Math.round(pct)}%</text>
              <text x={55} y={70} textAnchor="middle" fill={C.text} fontFamily={F.m} fontSize={9}>{String(meta.atual).replace(".", ",")} / {String(meta.alvo).replace(".", ",")}</text>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
              <span style={{ alignSelf: "flex-start", fontFamily: F.m, fontSize: 9, color: corSt, border: `1px solid ${corSt}60`, padding: "2px 8px" }}>{calc.status}</span>
              <Txt c={C.white} s={11}>Dia {meta.dia} de 90 · Faltam {calc.faltamDias} dias</Txt>
              <Txt>Ritmo necessário: {calc.ritmo.toFixed(1).replace(".", ",")} {un} por semana</Txt>
              <Txt c={C.muted} s={9}>{reels ? "Reels com resultado lançado" : "Média de % que passou dos 3s"}</Txt>
            </div>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ marginTop: 10, display: "block" }} preserveAspectRatio="none">
            <line x1={x(0)} y1={y(0)} x2={x(90)} y2={y(meta.alvo)} stroke={C.muted} strokeDasharray="4 4" strokeWidth={1.2} />
            <text x={W - 4} y={12} textAnchor="end" fill={C.muted} fontFamily={F.m} fontSize={8}>referência</text>
            {curva.length > 0 && <polyline fill="none" stroke={C.gold} strokeWidth={2} points={curva.map(c => `${x(c.d)},${y(c.v)}`).join(" ")} />}
            <line x1={x(meta.dia)} y1={0} x2={x(meta.dia)} y2={H} stroke={`${C.cyan}50`} strokeWidth={1} />
          </svg>
          {!curva.length && <Txt c={C.muted} s={9}>Lance o primeiro valor para começar a curva.</Txt>}
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            <button type="button" style={btn()} onClick={p.onLancar}>Registrar valor de hoje</button>
            <button type="button" style={{ ...mini(C.muted), padding: "8px 12px" }} onClick={() => setEdit(e => !e)}>{edit ? "Fechar" : "Editar meta"}</button>
          </div>
          <Txt c={C.muted} s={9}>O valor vem dos resultados lançados: registrar abre o lançamento da retenção.</Txt>
          {edit && form}
        </>
      )}
    </Panel>
  );
}

/* ── 4) AUTOMAÇÃO ── */
export function proximaExecucao(hora: number, now = new Date()) {
  const n = new Date(now); n.setUTCMinutes(0, 0, 0); n.setUTCHours((hora + 3) % 24); // Brasília = UTC-3
  if (n.getTime() <= now.getTime()) n.setTime(n.getTime() + DAY);
  return n;
}
function Automacao({ loaded, onRodarAgora, reload }: LowerProps) {
  const [cfg, setCfg] = useState<any>(undefined); const [last, setLast] = useState<any>(null); const [now, setNow] = useState(Date.now()); const [k, setK] = useState(0);
  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const [s, r] = await Promise.all([
      supabase.from("cc_automation_settings").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("cc_automation_runs").select("created_at, status, erro, tipo").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setCfg(s.data ?? null); setLast(r.data ?? null);
  };
  useEffect(() => { load(); }, [k]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  const hora = cfg?.hora ?? 7; const hh = `${String(hora).padStart(2, "0")}:00`;
  const ativa = cfg && !cfg.pausado;
  const prox = proximaExecucao(hora, new Date(now)); const falta = prox.getTime() - now;
  const toggle = async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const { error } = await supabase.from("cc_automation_settings").upsert({ user_id: user.id, hora, limite_diario: cfg?.limite_diario ?? 1, pausado: !!ativa, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    toast.success(ativa ? "Automação pausada" : "Automação ativada"); setK(x => x + 1); reload();
  };
  const passos = [
    { h: hh, t: "Gera o reel do dia e o briefing." },
    { h: "+24h", t: "Depois de postar: lembrete para lançar o resultado." },
    { h: "DOM", t: "Revisão semanal e alerta de queda." },
  ];
  return (
    <Panel id="cc-automacao">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <Label color={C.cyan}>Automação diária</Label>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: F.m, fontSize: 9, color: ativa ? C.green : C.muted }}>
          <span className="cc-anim" style={{ width: 7, height: 7, borderRadius: "50%", background: ativa ? C.green : C.muted, boxShadow: ativa ? `0 0 8px ${C.green}` : "none", animation: ativa ? "ccDot 1.6s ease infinite" : "none" }} />
          {cfg === undefined ? "…" : ativa ? "ATIVA" : cfg ? "PAUSADA" : "DESLIGADA"}
        </span>
      </div>
      {!loaded || cfg === undefined ? <><Skel h={24} /><Skel h={24} /><Skel h={24} /></> : (
        <>
          <div style={{ marginTop: 10, borderLeft: `1px solid ${C.cyan}40`, marginLeft: 6, paddingLeft: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {passos.map(s => (
              <div key={s.h} style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: -19, top: 3, width: 9, height: 9, background: "#020205", border: `1px solid ${C.cyan}` }} />
                <span style={{ fontFamily: F.t, fontWeight: 700, fontSize: 13, color: C.cyan, marginRight: 8 }}>{s.h}</span>
                <span style={{ fontFamily: F.m, fontSize: 10, color: C.text }}>{s.t}</span>
              </div>
            ))}
          </div>
          <Txt c={C.gold} s={9}>Nada é publicado automaticamente.</Txt>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
            {last ? <Txt>Última execução: {new Date(last.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} · <span style={{ color: last.status === "erro" ? C.red : C.green }}>{last.status === "erro" ? "erro" : last.status}</span>{last.erro ? ` · ${last.erro}` : ""}</Txt>
              : <Txt c={C.muted}>Ainda não rodou. Clique em Rodar agora para testar.</Txt>}
            {ativa && <Txt>Próxima execução: {prox.toLocaleString("pt-BR", { weekday: "short", hour: "2-digit", minute: "2-digit" })} · em {Math.floor(falta / 36e5)}h {Math.floor((falta % 36e5) / 6e4)}min</Txt>}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            <button type="button" style={{ ...btn(true), minWidth: 110 }} onClick={onRodarAgora}>Rodar agora</button>
            <button type="button" style={{ ...btn(), minWidth: 90 }} onClick={toggle}>{ativa ? "Pausar" : "Ativar"}</button>
          </div>
          <div style={{ marginTop: 10 }}><CommandCenterAutomation onChanged={() => { setK(x => x + 1); reload(); }} /></div>
        </>
      )}
    </Panel>
  );
}

/* ── 5) ATALHOS ── */
const ICON: Record<string, JSX.Element> = {
  studio: <path d="M4 6h11v12H4zM15 10l5-3v10l-5-3" />,
  strategy: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  planner: <path d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5" />,
  growth: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  learn: <path d="M4 5h7v14H4zM13 5h7v14h-7" />,
};
function Atalhos({ loaded, bank, results, leadsCount, onOpenZone, onOpenTool }: LowerProps) {
  const hoje = new Date().toISOString().slice(0, 10);
  const items = [
    { id: "studio", nome: "Studio", d: "Roteiros e Modo Gravação", n: bank ? bank.length : null, tool: "studio" },
    { id: "strategy", nome: "Strategy", d: "Calibração e fórmulas", n: results.length || null, zone: "strategy" },
    { id: "planner", nome: "Planner", d: "Calendário de postagens", n: bank ? bank.filter(b => b.agendado_para && b.agendado_para >= hoje).length || null : null, tool: "calendario" },
    { id: "growth", nome: "Growth", d: "Análises e leads", n: leadsCount, zone: "growth" },
    { id: "learn", nome: "Learn", d: "Biblioteca e fontes", n: null, zone: "learn" },
  ];
  return (
    <Panel>
      <Label>Atalhos</Label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginTop: 10 }}>
        {items.map(a => (
          <button key={a.id} type="button" className="cc-short" onClick={() => (a.zone ? onOpenZone?.(a.zone) : onOpenTool?.(a.tool!))}
            style={{ textAlign: "left", background: `${C.cyan}08`, border: `1px solid ${C.cyan}25`, padding: 10, cursor: "pointer", borderRadius: 0, position: "relative", minWidth: 0 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.cyan} strokeWidth={1.6} strokeLinecap="square">{ICON[a.id]}</svg>
            {loaded && a.n != null && a.n > 0 && <span style={{ position: "absolute", top: 8, right: 8, fontFamily: F.m, fontSize: 9, color: C.gold }}><Num v={a.n} /></span>}
            <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 14, color: C.white, marginTop: 6, letterSpacing: 1 }}>{a.nome}</div>
            <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, lineHeight: 1.4 }}>{a.d}</div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

export default function CommandCenterLower(p: LowerProps) {
  const calc = p.meta && p.goal ? metaCalc(p.meta.alvo, p.meta.atual, p.meta.dia) : null;
  const curva = useMemo(() => {
    if (!p.goal) return [] as { d: number; v: number }[];
    const ini = new Date(`${p.goal.inicio}T00:00:00`).getTime();
    const rs = p.results.filter(r => new Date(r.created_at).getTime() >= ini).sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    const out: { d: number; v: number }[] = []; let soma = 0; let n = 0;
    for (const r of rs) {
      const d = Math.min(90, (new Date(r.created_at).getTime() - ini) / DAY);
      if (p.goal.metrica === "retencao_3s") { const v = Number(r.pct_3s); if (!Number.isFinite(v)) continue; soma += v; n++; out.push({ d, v: soma / n }); }
      else { n++; out.push({ d, v: n }); }
    }
    return out.length ? [{ d: out[0].d, v: p.goal.metrica === "retencao_3s" ? out[0].v : 0 }, ...out] : out;
  }, [p.goal, p.results]);
  return (
    <>
      <style>{`.cc-short:hover,.cc-short:active{border-color:#00D4FF80 !important;box-shadow:0 0 16px -4px #00D4FF80 !important}`}</style>
      <BlockBoundary onRetry={p.reload}><Formulas {...p} /></BlockBoundary>
      <BlockBoundary onRetry={p.reload}><Alertas {...p} metaStatus={calc?.status ?? null} /></BlockBoundary>
      <BlockBoundary onRetry={p.reload}><Meta {...p} calc={calc} curva={curva} /></BlockBoundary>
      <BlockBoundary onRetry={p.reload}><Automacao {...p} /></BlockBoundary>
      <BlockBoundary onRetry={p.reload}><Atalhos {...p} /></BlockBoundary>
    </>
  );
}
