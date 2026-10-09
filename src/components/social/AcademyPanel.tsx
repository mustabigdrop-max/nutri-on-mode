import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import lessonsSeed from "@/data/academyLessons.json";
import {
  FONTE_SELO, TRILHAS, EIXOS, EIXO_LABEL, RADAR_EXEMPLO, medirFala, notaObjetiva,
  ritmoEixo, MULETAS_PADRAO, type FonteNivel, type Marca, type MedidasFala,
} from "@/lib/academy";
import {
  eixoDaAula, tempoEstimado, verificarPratica, dominada, addScore, dominioEixos, dominioGeral, nivelPorDominio, xpN1,
  plano14, eixoMaisFraco, TRILHA_DO_EIXO, revisoesDaAula, revisaoAposErro, treinarErro, REGRAS, AULA_DA_REGRA, regraDoMotivo,
  comparativoTecnica, TECNICA_DA_AULA, origemTreino, diasSeguidos, type EixoN1,
} from "../../../supabase/functions/_shared/academyRules";

const C = { bg: "#020205", cyan: "#00D4FF", gold: "#B8922A", text: "#C8C8D8", white: "#F0F0F8", muted: "#6b6b80", line: "#1a1a26", green: "#5DCAA5", amber: "#EF9F27", red: "#EF4444" };
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace" };
type Lesson = { slug: string; trilha: string; ordem: number; titulo: string; fonte_nivel: FonteNivel; conceito: string; no_reel: string; fraco: string; forte: string; exercicio: string; fontes: { ref: string; url: string | null }[] };
type Attempt = { id: string; tipo: string; nota: number; resultado: any; created_at: string };
type Prog = { concluida: boolean; dominada: boolean; etapa_atual: number; pratica_scores: { dia: string; nota: number }[] };
type Review = { id: string; lesson_slug: string; due_at: string; intervalo_dias: number; feita: boolean; acerto: boolean | null };
type Erro = { id: string; origem: string; frase: string; regra: string; correcao_sugerida: string | null; lesson_slug: string | null; status: string; acertos_seguidos: number; created_at: string };
type View = { k: "home" } | { k: "aula"; slug: string } | { k: "lab"; lab: "gancho" | "figuras" | "fala"; preset?: string; figura?: string } | { k: "revisao" } | { k: "erros" } | { k: "treino" } | { k: "diag" };

const CSS = `
.gv-root{background:#020205;background-image:linear-gradient(#00D4FF0a 1px,transparent 1px),linear-gradient(90deg,#00D4FF0a 1px,transparent 1px),radial-gradient(ellipse at 50% -10%,#00D4FF1f,transparent 60%);background-size:28px 28px,28px 28px,100% 100%}
.gv-p{position:relative;background:#07070dcc;backdrop-filter:blur(6px);border:1px solid #00D4FF33;padding:12px;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%);animation:gvIn .45s ease both}
.gv-p::before{content:"";position:absolute;left:0;right:12px;top:0;height:1px;background:linear-gradient(90deg,transparent,#00D4FF99,transparent)}
.gv-row{display:flex;align-items:center;gap:8px;width:100%;text-align:left;background:none;border:none;border-top:1px solid #1a1a26;padding:8px 0;cursor:pointer;color:#C8C8D8}
.gv-row:hover{background:#00D4FF08}
.gv-sk{background:linear-gradient(90deg,#11111a,#1a1a26,#11111a);background-size:200% 100%;animation:gvSk 1.2s linear infinite;height:14px;margin:6px 0}
@keyframes gvIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes gvSk{to{background-position:-200% 0}}
@media (prefers-reduced-motion: reduce){.gv-p,.gv-sk{animation:none!important}}
`;
const box: React.CSSProperties = { marginBottom: 10 };
const lbl = (c = C.cyan): React.CSSProperties => ({ fontFamily: F.m, fontSize: 9, letterSpacing: 2, color: c, textTransform: "uppercase", marginBottom: 6 });
const btn = (gold = false): React.CSSProperties => ({ fontFamily: F.t, fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: "9px 12px", cursor: "pointer", borderRadius: 0, border: `1px solid ${gold ? C.gold : C.cyan}80`, background: gold ? C.gold : "transparent", color: gold ? "#0A0A0A" : C.cyan });
const ta: React.CSSProperties = { width: "100%", minHeight: 90, background: "#0a0a12", border: `1px solid ${C.line}`, color: C.white, fontFamily: F.m, fontSize: 12, padding: 10, borderRadius: 0, boxSizing: "border-box" };
const P = ({ children, i = 0, style }: { children: React.ReactNode; i?: number; style?: React.CSSProperties }) => <div className="gv-p" style={{ ...box, animationDelay: `${i * 60}ms`, ...style }}>{children}</div>;
const Sk = ({ n = 3 }: { n?: number }) => <>{Array.from({ length: n }, (_, i) => <div key={i} className="gv-sk" style={{ width: `${90 - i * 15}%` }} />)}</>;
const hojeBR = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);

async function call(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("academia", { body });
  if (error) {
    let msg = "Falha na análise. Tente de novo.";
    try { msg = (await (error as any).context?.json())?.error ?? msg; } catch { /* keep */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

function Selo({ n }: { n: FonteNivel }) {
  const s = FONTE_SELO[n] ?? FONTE_SELO.classica;
  const label = n === "classica" ? "Tradição" : s.label;
  return <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
    <span style={{ fontFamily: F.m, fontSize: 9, letterSpacing: 1, color: s.color, border: `1px solid ${s.color}70`, padding: "2px 6px" }}>{label.toUpperCase()}</span>
    {s.aviso && <span style={{ fontFamily: F.m, fontSize: 9, color: s.color }}>{s.aviso}</span>}
  </div>;
}

function Radar({ v, exemplo }: { v: Record<string, number | null>; exemplo: boolean }) {
  const S = 220, cx = S / 2, cy = S / 2, R = 72;
  const ang = EIXOS.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / EIXOS.length);
  const pt = (a: number, r: number) => `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  const col = exemplo ? C.amber : C.cyan;
  return <div style={{ position: "relative" }}>
    {exemplo && <span style={{ position: "absolute", top: 0, right: 0, fontFamily: F.m, fontSize: 9, color: C.amber, border: `1px solid ${C.amber}`, padding: "1px 5px" }}>EXEMPLO</span>}
    <svg width={S} height={S} style={{ display: "block", margin: "0 auto" }} role="img" aria-label="Radar de domínio">
      {[0.25, 0.5, 0.75, 1].map(f => <polygon key={f} points={ang.map(a => pt(a, R * f)).join(" ")} fill="none" stroke={C.line} />)}
      {ang.map((a, i) => <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * R} y2={cy + Math.sin(a) * R} stroke={C.line} />)}
      <polygon points={ang.map((a, i) => pt(a, (R * Math.max(3, v[EIXOS[i]] ?? 0)) / 100)).join(" ")} fill={`${col}22`} stroke={col} strokeWidth={2} strokeDasharray={exemplo ? "4 3" : undefined} />
      {ang.map((a, i) => <text key={i} x={cx + Math.cos(a) * (R + 24)} y={cy + Math.sin(a) * (R + 24) + 3} textAnchor="middle" fontSize={9} fontFamily="'Space Mono',monospace" fill={C.text}>{EIXO_LABEL[EIXOS[i]]} {v[EIXOS[i]] ?? "—"}</text>)}
    </svg>
  </div>;
}

function Ring({ pct, size = 44 }: { pct: number; size?: number }) {
  const r = size / 2 - 4, c = 2 * Math.PI * r;
  return <svg width={size} height={size}><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${C.cyan}22`} strokeWidth={4} />
    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.cyan} strokeWidth={4} strokeDasharray={`${pct * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fill={C.white} fontFamily={F.t} fontWeight={700} fontSize={12}>{Math.round(pct * 100)}%</text></svg>;
}

const ESTADO_COR: Record<string, string> = { "não iniciada": C.muted, "em andamento": C.cyan, "concluída": C.green, "dominada": C.gold, "revisar": C.red };

export default function AcademyPanel({ onClose, initialLab, initialErros }: { onClose: () => void; initialLab?: "gancho" | "figuras" | "fala"; initialErros?: boolean }) {
  const [uid, setUid] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>(lessonsSeed as Lesson[]);
  const [prog, setProg] = useState<Record<string, Prog>>({});
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [erros, setErros] = useState<Erro[]>([]);
  const [diag, setDiag] = useState<any | undefined>(undefined);
  const [proibidas, setProibidas] = useState<string[]>([]);
  const [dados, setDados] = useState<{ scripts: any[]; results: any[] }>({ scripts: [], results: [] });
  const [view, setView] = useState<View>(initialLab ? { k: "lab", lab: initialLab } : initialErros ? { k: "erros" } : { k: "home" });

  const load = async () => {
    const { data: s } = await supabase.auth.getSession(); const u = s.session?.user?.id ?? null; setUid(u);
    const { data: l } = await supabase.from("academy_lessons").select("*").order("ordem");
    if (l?.length) setLessons(l as unknown as Lesson[]);
    if (!u) { setLoaded(true); return; }
    const [{ data: p }, { data: a }, { data: rv }, { data: er }, { data: dg }, { data: pr }, { data: sc }, { data: rs }] = await Promise.all([
      supabase.from("academy_progress").select("lesson_slug,concluida,dominada,etapa_atual,pratica_scores").eq("user_id", u),
      supabase.from("lab_attempts").select("id,tipo,nota,resultado,created_at").eq("user_id", u).order("created_at", { ascending: false }).limit(300),
      supabase.from("academy_reviews").select("*").eq("user_id", u).order("due_at"),
      supabase.from("error_notebook").select("*").eq("user_id", u).order("created_at", { ascending: false }).limit(500),
      supabase.from("academy_diagnostic").select("*").eq("user_id", u).maybeSingle(),
      supabase.from("engine_prompts").select("conteudo").eq("user_id", u).eq("chave", "proibidas").maybeSingle(),
      supabase.from("retention_scripts").select("id,tecnicas").eq("user_id", u).limit(500),
      supabase.from("retention_results").select("script_id,pct_3s").eq("user_id", u).limit(500),
    ]);
    setProg(Object.fromEntries((p ?? []).map((r: any) => [r.lesson_slug, { concluida: r.concluida, dominada: r.dominada, etapa_atual: r.etapa_atual ?? 0, pratica_scores: Array.isArray(r.pratica_scores) ? r.pratica_scores : [] }])));
    setAttempts((a ?? []) as Attempt[]); setReviews((rv ?? []) as Review[]); setErros((er ?? []) as Erro[]); setDiag(dg ?? null);
    setProibidas(String((pr as any)?.conteudo ?? "").split("\n").map(x => x.trim()).filter(Boolean));
    setDados({ scripts: (sc ?? []) as any[], results: (rs ?? []) as any[] });
    setLoaded(true);
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { if (view.k === "home") onClose(); else setView({ k: "home" }); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [view.k]);

  // Domínio por eixo: notas de prática + laboratórios, ponderadas por recência.
  const itens = useMemo(() => {
    const out: { eixo: string; nota: number; created_at: string }[] = [];
    for (const a of attempts) {
      if (a.resultado?.eixos) for (const [e, v] of Object.entries(a.resultado.eixos)) if (typeof v === "number") out.push({ eixo: e, nota: v, created_at: a.created_at });
    }
    return out;
  }, [attempts]);
  const dom = dominioEixos(itens);
  const temDom = Object.values(dom).some(v => v != null);
  const geral = dominioGeral(dom);
  const nDominadas = lessons.filter(l => prog[l.slug]?.dominada).length;
  const nivel = nivelPorDominio(geral, nDominadas);
  const revFeitas = reviews.filter(r => r.feita && r.acerto).length;
  const xp = xpN1(lessons.filter(l => prog[l.slug]?.concluida).length, attempts.filter(a => a.nota >= 70).length, revFeitas);
  const agora = Date.now();
  const revHoje = reviews.filter(r => !r.feita && new Date(r.due_at).getTime() <= agora);
  const revisar = new Set(reviews.filter(r => r.feita && r.acerto === false).map(r => r.lesson_slug).filter(s => reviews.some(x => x.lesson_slug === s && !x.feita && x.intervalo_dias === 1)));
  const estado = (slug: string) => revisar.has(slug) ? "revisar" : prog[slug]?.dominada ? "dominada" : prog[slug]?.concluida ? "concluída" : (prog[slug]?.etapa_atual ?? 0) > 0 || (prog[slug]?.pratica_scores?.length ?? 0) > 0 ? "em andamento" : "não iniciada";
  const trilhas = [...TRILHAS, ...(lessons.some(l => /posicionamento/i.test(l.trilha)) ? [lessons.find(l => /posicionamento/i.test(l.trilha))!.trilha] : [])];
  const ordenadas = trilhas.flatMap(t => lessons.filter(l => l.trilha === t).sort((a, b) => a.ordem - b.ordem));
  const planoHoje = diag?.plano?.find?.((d: any) => d.data === hojeBR() && d.aula);
  const proxima = (planoHoje && lessons.find(l => l.slug === planoHoje.aula && !prog[l.slug]?.dominada)) || ordenadas.find(l => revisar.has(l.slug)) || ordenadas.find(l => !prog[l.slug]?.concluida) || ordenadas.find(l => !prog[l.slug]?.dominada) || null;

  const salvarTentativa = async (tipo: string, entrada: string, resultado: any, nota: number) => {
    if (!uid) return;
    await supabase.from("lab_attempts").insert({ user_id: uid, tipo, entrada: entrada.slice(0, 6000), resultado, nota: Math.max(0, Math.min(100, Math.round(nota))) });
    // Caderno de erros a partir dos laboratórios (máx. 3 por tentativa).
    const motivos: string[] = tipo === "gancho" ? (resultado?.verificador?.motivos ?? []) : [];
    const regs = [...new Set(motivos.map(regraDoMotivo).filter(Boolean))].slice(0, 3) as string[];
    if (tipo === "fala") for (const f of (resultado?.medidas?.frases_longas ?? []).slice(0, 3)) await supabase.from("error_notebook").insert({ user_id: uid, origem: "lab_fala", frase: String(f).slice(0, 400), regra: "frase longa", correcao_sugerida: "Quebre em frases de até 14 palavras.", lesson_slug: AULA_DA_REGRA["frase longa"] }).then(() => {}, () => {});
    for (const r of regs) await supabase.from("error_notebook").insert({ user_id: uid, origem: "lab_gancho", frase: entrada.slice(0, 400), regra: r, correcao_sugerida: motivos.find(m => regraDoMotivo(m) === r) ?? null, lesson_slug: (AULA_DA_REGRA as any)[r] }).then(() => {}, () => {});
    void load();
  };

  const header = (titulo: string, back?: () => void) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
      <button type="button" onClick={back ?? onClose} aria-label={back ? "Voltar" : "Voltar ao Command Center"} style={{ ...btn(), padding: "4px 10px" }}>{back ? "←" : "← COMMAND CENTER"}</button>
      <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 20, color: C.white, letterSpacing: 1, flex: 1, minWidth: 140 }}>{titulo}</div>
      <span style={{ fontFamily: F.m, fontSize: 10, color: C.gold }}>{nivel.toUpperCase()} · DOMÍNIO {geral ?? "—"} · {xp} XP</span>
    </div>
  );

  return (
    <div role="dialog" aria-label="Academia GRAVITAS" className="gv-root" style={{ position: "fixed", inset: 0, zIndex: 10000, overflowY: "auto", color: C.text }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
        {view.k === "home" && <>
          {header("ACADEMIA GRAVITAS")}
          {!loaded ? <><P><Sk /></P><P i={1}><Sk /></P><P i={2}><Sk n={4} /></P></> : <>
            <P i={0} style={{ borderColor: `${C.gold}66` }}>
              <div style={lbl(C.gold)}>Continuar</div>
              {proxima ? <>
                <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 18, color: C.white }}>{proxima.titulo}</div>
                <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, margin: "4px 0 8px" }}>{proxima.trilha} · cerca de {tempoEstimado(proxima)} min · {estado(proxima.slug)}</div>
                <button type="button" style={btn(true)} onClick={() => setView({ k: "aula", slug: proxima.slug })}>CONTINUAR</button>
              </> : <div style={{ fontFamily: F.m, fontSize: 11 }}>Todas as aulas dominadas. Siga com revisões e treinos.</div>}
            </P>
            <P i={1}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div><div style={lbl()}>Revisões de hoje</div>
                  <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 16, color: revHoje.length ? C.white : C.muted }}>{revHoje.length ? `${revHoje.length} para revisar` : "Nada para revisar hoje"}</div></div>
                {revHoje.length > 0 && <button type="button" style={btn()} onClick={() => setView({ k: "revisao" })}>REVISAR AGORA</button>}
              </div>
            </P>
            {diag === null && <P i={2}>
              <div style={lbl(C.amber)}>Diagnóstico inicial</div>
              <div style={{ fontFamily: F.m, fontSize: 11, marginBottom: 8 }}>8 perguntas tiradas das aulas. Mostra o seu eixo mais fraco e monta um plano de 14 dias.</div>
              <button type="button" style={btn(true)} onClick={() => setView({ k: "diag" })}>FAZER DIAGNÓSTICO DE 3 MINUTOS</button>
            </P>}
            {diag && Array.isArray(diag.plano) && <P i={2}>
              <div style={lbl()}>Plano de 14 dias · trilha {diag.trilha_recomendada}</div>
              <div style={{ display: "flex", gap: 3 }}>{diag.plano.map((d: any) => { const h = d.data === hojeBR(); const ok = d.aula && prog[d.aula]?.concluida;
                return <div key={d.dia} title={d.descanso ? `Dia ${d.dia}: descanso` : `Dia ${d.dia}: ${lessons.find(l => l.slug === d.aula)?.titulo ?? ""} + treino de ${d.treino}`}
                  style={{ flex: 1, height: h ? 22 : 14, background: d.descanso ? "transparent" : ok ? C.green : h ? C.gold : `${C.cyan}33`, border: `1px solid ${d.descanso ? C.line : h ? C.gold : `${C.cyan}55`}`, alignSelf: "flex-end" }} />; })}</div>
              <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 4 }}>1 aula + 1 treino por dia · descanso a cada 5 dias · marca dourada = hoje</div>
            </P>}
            {trilhas.map((t, ti) => {
              const ls = lessons.filter(l => l.trilha === t).sort((a, b) => a.ordem - b.ordem); if (!ls.length) return null;
              const d = ls.filter(l => prog[l.slug]?.dominada).length;
              return <P key={t} i={3 + ti}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <Ring pct={ls.length ? d / ls.length : 0} />
                  <div><div style={{ fontFamily: F.t, fontWeight: 700, color: C.white, fontSize: 16 }}>{t}</div>
                    <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{d} de {ls.length} dominadas</div></div>
                </div>
                {ls.map(l => { const e = estado(l.slug); return (
                  <button key={l.slug} type="button" className="gv-row" onClick={() => setView({ k: "aula", slug: l.slug })}>
                    <span style={{ fontFamily: F.m, fontSize: 9, color: ESTADO_COR[e], border: `1px solid ${ESTADO_COR[e]}66`, padding: "1px 5px", minWidth: 78, textAlign: "center" }}>{e.toUpperCase()}</span>
                    <span style={{ flex: 1, fontFamily: F.m, fontSize: 11, color: C.white }}>{l.titulo}</span>
                    <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{tempoEstimado(l)} min</span>
                    <span style={{ fontFamily: F.m, fontSize: 8, color: (FONTE_SELO[l.fonte_nivel] ?? FONTE_SELO.classica).color }}>{l.fonte_nivel === "verificada" ? "FONTE" : l.fonte_nivel === "classica" ? "TRADIÇÃO" : "PRODUÇÃO"}</span>
                    <span style={{ color: C.cyan }}>›</span>
                  </button>); })}
              </P>;
            })}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <P i={8} style={{ borderColor: `${C.gold}55` }}><div style={lbl(C.gold)}>Treino de 60s</div><div style={{ fontFamily: F.m, fontSize: 10, marginBottom: 8 }}>Cronômetro, texto e resultado na hora.</div><button type="button" style={btn(true)} onClick={() => setView({ k: "treino" })}>COMEÇAR</button></P>
              <P i={9}><div style={lbl(C.red)}>Meus erros</div><div style={{ fontFamily: F.m, fontSize: 10, marginBottom: 8 }}>{erros.filter(e => e.status === "aberto").length} abertos · {erros.filter(e => e.status === "superado").length} superados</div><button type="button" style={btn()} onClick={() => setView({ k: "erros" })}>ABRIR CADERNO</button></P>
            </div>
            <P i={10}>
              <div style={lbl()}>Radar de domínio</div>
              <Radar v={temDom ? dom : RADAR_EXEMPLO} exemplo={!temDom} />
              {!temDom && <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, textAlign: "center" }}>Sem prática ainda. Pratique numa aula ou laboratório para ver o seu radar.</div>}
              <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 6 }}>Ouvinte &lt;30 · Orador 30-59 · Retor 60-79 · Mestre 80+ (Retor e Mestre pedem 8 aulas dominadas). XP: 10 por aula, 5 por tentativa com 70+, 3 por revisão.</div>
            </P>
            <div style={lbl()}>Laboratórios</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {(["gancho", "figuras", "fala"] as const).map(k => <button key={k} type="button" style={btn()} onClick={() => setView({ k: "lab", lab: k })}>{k === "gancho" ? "GANCHO" : k === "figuras" ? "FIGURAS" : "FALA"}</button>)}
            </div>
          </>}
        </>}

        {view.k === "aula" && (() => {
          const l = lessons.find(x => x.slug === view.slug); if (!l) return null;
          const prox = ordenadas[ordenadas.findIndex(x => x.slug === l.slug) + 1] ?? null;
          return <>{header(l.titulo, () => setView({ k: "home" }))}
            <Aula l={l} uid={uid} prog={prog[l.slug]} proibidas={proibidas} dados={dados} salvar={salvarTentativa} proxima={prox}
              onLab={(lab) => setView({ k: "lab", lab })} onProxima={(s) => setView({ k: "aula", slug: s })}
              onUsar={(tec) => { window.dispatchEvent(new CustomEvent("cc-tecnica-dica", { detail: tec })); onClose(); setTimeout(() => document.getElementById("cc-missao")?.scrollIntoView({ behavior: "smooth" }), 80); }}
              reload={load} /></>;
        })()}

        {view.k === "diag" && <>{header("DIAGNÓSTICO", () => setView({ k: "home" }))}<Diagnostico uid={uid} lessons={lessons} onDone={() => { void load(); setView({ k: "home" }); }} /></>}
        {view.k === "revisao" && <>{header("REVISÃO", () => setView({ k: "home" }))}<Revisao uid={uid} fila={revHoje} lessons={lessons} proibidas={proibidas} onDone={load} /></>}
        {view.k === "erros" && <>{header("MEUS ERROS", () => setView({ k: "home" }))}<MeusErros erros={erros} lessons={lessons} proibidas={proibidas} onAula={s => setView({ k: "aula", slug: s })} reload={load} /></>}
        {view.k === "treino" && <>{header("TREINO DE 60S", () => setView({ k: "home" }))}<Treino60 uid={uid} erros={erros} dom={dom} attempts={attempts} proibidas={proibidas} salvar={salvarTentativa} reload={load} /></>}

        {view.k === "lab" && <>
          {header(view.lab === "gancho" ? "LABORATÓRIO DE GANCHO" : view.lab === "figuras" ? "LABORATÓRIO DE FIGURAS" : "LABORATÓRIO DE FALA", () => setView({ k: "home" }))}
          {view.lab === "gancho" && <LabGancho salvar={salvarTentativa} />}
          {view.lab === "figuras" && <LabFiguras figuraInicial={view.figura} salvar={salvarTentativa} />}
          {view.lab === "fala" && <LabFala uid={uid} salvar={salvarTentativa} onCard={(t) => { window.dispatchEvent(new CustomEvent("cc-card-pedido", { detail: t })); onClose(); setTimeout(() => document.getElementById("cc-cards")?.scrollIntoView({ behavior: "smooth" }), 80); }} />}
        </>}
      </div>
    </div>
  );
}

/* ── Quiz reutilizável: explicação após cada resposta ── */
function Quiz({ qs, onAnswer }: { qs: { pergunta: string; opcoes: string[]; correta: number; explicacao?: string }[]; onAnswer?: (i: number, ok: boolean) => void }) {
  const [esc, setEsc] = useState<Record<number, number>>({});
  return <>{qs.map((q, i) => <div key={i} style={{ marginBottom: 10 }}>
    <div style={{ fontFamily: F.m, fontSize: 12, color: C.white, marginBottom: 4 }}>{i + 1}. {q.pergunta}</div>
    {q.opcoes.map((o, j) => { const sel = esc[i] === j; const show = esc[i] != null; const ok = j === q.correta;
      return <button key={j} type="button" disabled={show} onClick={() => { setEsc(s => ({ ...s, [i]: j })); onAnswer?.(i, j === q.correta); }} style={{ display: "block", width: "100%", textAlign: "left", margin: "3px 0", padding: "6px 8px", fontFamily: F.m, fontSize: 11, borderRadius: 0, cursor: show ? "default" : "pointer", background: "transparent", color: show && ok ? C.green : sel ? C.red : C.text, border: `1px solid ${show && ok ? C.green : sel ? C.red : C.line}` }}>{o}</button>; })}
    {esc[i] != null && q.explicacao && <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, marginTop: 4 }}>{q.explicacao}</div>}
  </div>)}</>;
}

/* ── Resultado de prática em código ── */
function ResultadoPratica({ r, extra }: { r: ReturnType<typeof verificarPratica>; extra?: { feedback?: string; reescrita?: string } }) {
  return <div style={{ marginTop: 10 }}>
    <div style={{ fontFamily: F.t, fontSize: 30, fontWeight: 700, color: r.nota >= 70 ? C.green : r.nota >= 50 ? C.amber : C.red }}>{r.nota}/100</div>
    {r.bons.map(b => <div key={b} style={{ fontFamily: F.m, fontSize: 11, color: C.green }}>✓ {b}</div>)}
    {r.corrigir.map(b => <div key={b} style={{ fontFamily: F.m, fontSize: 11, color: C.amber }}>• Corrigir: {b}</div>)}
    {extra?.feedback && <div style={{ fontFamily: F.m, fontSize: 11, color: C.white, marginTop: 6 }}>{extra.feedback}</div>}
    {extra?.reescrita && <div style={{ fontFamily: F.m, fontSize: 11, color: C.white, marginTop: 4 }}><span style={{ color: C.gold }}>Reescrita: </span>{extra.reescrita}</div>}
  </div>;
}

/* ── AULA EM 5 ETAPAS ── */
const ETAPAS = ["Conceito", "Fraco × Forte", "Pratique", "Quiz", "Aplique"];
function Aula({ l, uid, prog, proibidas, dados, salvar, onLab, onUsar, onProxima, proxima, reload }: { l: Lesson; uid: string | null; prog?: Prog; proibidas: string[]; dados: { scripts: any[]; results: any[] };
  salvar: (t: string, e: string, r: any, n: number) => Promise<void>; onLab: (lab: "gancho" | "figuras" | "fala") => void; onUsar: (tec: string) => void; onProxima: (s: string) => void; proxima: Lesson | null; reload: () => void }) {
  const [etapa, setEtapa] = useState(Math.min(4, prog?.etapa_atual ?? 0));
  const [ordem] = useState(() => Math.random() < 0.5);
  const [esc, setEsc] = useState<"fraco" | "forte" | null>(null);
  const [resp, setResp] = useState(""); const [pr, setPr] = useState<ReturnType<typeof verificarPratica> | null>(null); const [extra, setExtra] = useState<any>(null);
  const [quiz, setQuiz] = useState<any[] | null>(null); const [acertos, setAcertos] = useState(0);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null); const [fim, setFim] = useState(false);
  const eixo = eixoDaAula(l.slug, l.titulo);
  const tec = TECNICA_DA_AULA[l.slug] ?? null;

  const ir = async (n: number) => {
    const e = Math.max(0, Math.min(4, n)); setEtapa(e);
    if (uid) await supabase.from("academy_progress").upsert({ user_id: uid, lesson_slug: l.slug, etapa_atual: Math.max(e, prog?.etapa_atual ?? 0), ultimo_acesso: new Date().toISOString(), concluida: prog?.concluida ?? false }, { onConflict: "user_id,lesson_slug" });
  };
  useEffect(() => {
    const k = (ev: KeyboardEvent) => { if ((ev.target as HTMLElement)?.tagName === "TEXTAREA" || (ev.target as HTMLElement)?.tagName === "INPUT") return; if (ev.key === "ArrowRight") void ir(etapa + 1); if (ev.key === "ArrowLeft") void ir(etapa - 1); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [etapa]);

  const praticar = async () => {
    setBusy(true); setErr(null);
    const r = verificarPratica(resp, proibidas); setPr(r); let ex: any = null; let nota = r.nota;
    try {
      if (eixo === "gancho") { const d = await call({ modo: "gancho", texto: resp }); nota = Math.min(r.nota, d.nota); ex = { feedback: d.comentario, reescrita: d.reescritas?.[0]?.texto }; }
      else if (eixo === "figuras") { const d = await call({ modo: "figuras", figura: "antítese", ideia: l.titulo, texto: resp }); nota = Math.min(r.nota, d.nota); ex = { feedback: d.feedback, reescrita: d.versao_melhorada }; }
      else { const d = await call({ modo: "treino", texto: resp, pedido: l.exercicio }); ex = { feedback: d.feedback, reescrita: d.reescritas?.[0] }; }
    } catch (e) { setErr((e as Error).message); }
    const final = { ...r, nota }; setPr(final); setExtra(ex);
    await salvar(`pratica:${l.slug}`, resp, { pratica: true, slug: l.slug, eixos: { [eixo]: nota }, verificador: r.verificador, extra: ex }, nota);
    if (uid) {
      const scores = addScore(prog?.pratica_scores ?? [], hojeBR(), nota);
      await supabase.from("academy_progress").upsert({ user_id: uid, lesson_slug: l.slug, pratica_scores: scores, dominada: dominada(scores), etapa_atual: Math.max(2, prog?.etapa_atual ?? 0), ultimo_acesso: new Date().toISOString(), concluida: prog?.concluida ?? false }, { onConflict: "user_id,lesson_slug" });
      if (nota < 70) for (const rg of r.regras.slice(0, 3)) await supabase.from("error_notebook").insert({ user_id: uid, origem: "treino", origem_id: l.slug, frase: resp.slice(0, 400), regra: rg, correcao_sugerida: r.corrigir.find(m => regraDoMotivo(m) === rg) ?? null, lesson_slug: AULA_DA_REGRA[rg] }).then(() => {}, () => {});
    }
    setBusy(false); reload();
  };
  const carregarQuiz = async () => { setBusy(true); setErr(null); try { setQuiz((await call({ modo: "quiz", slug: l.slug })).perguntas); } catch (e) { setErr((e as Error).message); } setBusy(false); };
  useEffect(() => { if (etapa === 3 && !quiz && !busy) void carregarQuiz(); }, [etapa]);

  const concluir = async () => {
    if (!uid) return;
    await supabase.from("academy_progress").upsert({ user_id: uid, lesson_slug: l.slug, concluida: true, quiz_acertos: acertos, resposta_exercicio: resp || null, concluida_em: new Date().toISOString(), etapa_atual: 4, ultimo_acesso: new Date().toISOString() }, { onConflict: "user_id,lesson_slug" });
    // 4 lembretes (1, 3, 7, 21 dias); o índice único impede duplicar.
    await supabase.from("academy_reviews").upsert(revisoesDaAula(l.slug).map(r => ({ ...r, user_id: uid })), { onConflict: "user_id,lesson_slug,intervalo_dias", ignoreDuplicates: true });
    window.dispatchEvent(new CustomEvent("cc-burst", { detail: "#B8922A" }));
    setFim(true); reload();
  };
  const sec = (t: string, v: string, c?: string) => <P><div style={lbl(c)}>{t}</div><div style={{ fontFamily: F.m, fontSize: 12, color: C.white, lineHeight: 1.6 }}>{v}</div></P>;
  const cmp = tec ? comparativoTecnica(tec, dados.scripts, dados.results) : null;

  if (fim) return <P style={{ borderColor: `${C.gold}66` }}>
    <div style={lbl(C.gold)}>Aula concluída · +10 XP</div>
    <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 18, color: C.white }}>Você aprendeu: {l.no_reel.split(/(?<=[.!?])\s/)[0]}</div>
    <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, margin: "6px 0 10px" }}>4 revisões marcadas: em 1, 3, 7 e 21 dias. A aula fica dominada com nota 70+ na prática em 2 dias diferentes.</div>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {!prog?.dominada && <button type="button" style={btn()} onClick={() => { setFim(false); setEtapa(2); }}>PRATICAR DE NOVO AMANHÃ</button>}
      {proxima && <button type="button" style={btn(true)} onClick={() => onProxima(proxima.slug)}>PRÓXIMA: {proxima.titulo.toUpperCase()}</button>}
    </div>
  </P>;

  return <div>
    <div style={{ display: "flex", gap: 4, marginBottom: 10 }} role="tablist">
      {ETAPAS.map((e, i) => <button key={e} type="button" role="tab" aria-selected={i === etapa} onClick={() => void ir(i)} style={{ flex: 1, padding: "6px 2px", fontFamily: F.m, fontSize: 9, borderRadius: 0, cursor: "pointer", background: i === etapa ? `${C.cyan}22` : "transparent", color: i <= etapa ? C.cyan : C.muted, border: `1px solid ${i === etapa ? C.cyan : C.line}` }}>{i + 1}. {e}</button>)}
    </div>
    <div style={{ marginBottom: 10 }}><Selo n={l.fonte_nivel} /></div>

    {etapa === 0 && <>
      {sec("Conceito", l.conceito)}
      {sec("No reel", l.no_reel)}
      <P><div style={lbl(C.muted)}>Fontes</div>{l.fontes.map((f, i) => <div key={i} style={{ fontFamily: F.m, fontSize: 11 }}>{f.url ? <a href={f.url} target="_blank" rel="noreferrer" style={{ color: C.cyan }}>{f.ref} ↗</a> : <span>{f.ref}</span>}</div>)}</P>
      {l.fonte_nivel === "tecnica_de_producao" && tec && cmp && <P style={{ borderColor: `${C.amber}55` }}>
        <div style={lbl(C.amber)}>Nos seus dados · {tec}</div>
        {cmp.reels === 0 ? <div style={{ fontFamily: F.m, fontSize: 11 }}>Sem dados ainda. Use a técnica em 3 reels e lance os resultados.</div> : <>
          <div style={{ fontFamily: F.m, fontSize: 11, color: C.white }}>{cmp.reels} reel(s) com resultado usaram a técnica · retenção média nos 3s: {cmp.com ?? "—"}% com · {cmp.sem ?? "—"}% sem</div>
          <span style={{ fontFamily: F.m, fontSize: 9, color: cmp.selo === "Indício" ? C.amber : C.green, border: "1px solid currentColor", padding: "1px 6px", display: "inline-block", marginTop: 4 }}>{cmp.selo}</span>
        </>}
        <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 4 }}>Comparação simples, sem controle de outros fatores.</div>
      </P>}
    </>}

    {etapa === 1 && <P>
      <div style={lbl()}>Qual frase é mais forte?</div>
      {(ordem ? (["fraco", "forte"] as const) : (["forte", "fraco"] as const)).map(k => { const show = esc != null; const ok = k === "forte";
        return <button key={k} type="button" disabled={show} onClick={() => setEsc(k)} style={{ display: "block", width: "100%", textAlign: "left", margin: "4px 0", padding: 10, fontFamily: F.m, fontSize: 12, borderRadius: 0, cursor: show ? "default" : "pointer", background: "transparent", color: C.white, border: `1px solid ${show ? (ok ? C.green : C.red) : C.line}` }}>{k === "fraco" ? l.fraco : l.forte}</button>; })}
      {esc && <div style={{ fontFamily: F.m, fontSize: 11, marginTop: 6, color: esc === "forte" ? C.green : C.amber }}>{esc === "forte" ? "Isso. " : "A outra é a mais forte. "}<span style={{ color: C.white }}>Por quê: {l.no_reel}</span></div>}
    </P>}

    {etapa === 2 && <P>
      <div style={lbl(C.gold)}>Pratique</div>
      <div style={{ fontFamily: F.m, fontSize: 12, color: C.white, marginBottom: 8 }}>{l.exercicio}</div>
      <textarea style={ta} value={resp} onChange={e => setResp(e.target.value)} placeholder="Sua resposta" />
      <button type="button" style={{ ...btn(true), marginTop: 8 }} disabled={busy || !resp.trim() || !uid} onClick={praticar}>{busy ? "Verificando..." : "ENVIAR"}</button>
      {err && <div style={{ color: C.red, fontFamily: F.m, fontSize: 11, marginTop: 6 }}>{err} (nota feita só pelo Verificador)</div>}
      {pr && <ResultadoPratica r={pr} extra={extra} />}
      <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 6 }}>Notas de prática: {(prog?.pratica_scores ?? []).slice(-5).map(s => `${s.nota} (${s.dia.slice(5)})`).join(" · ") || "nenhuma"}{prog?.dominada ? " · DOMINADA" : ""}</div>
    </P>}

    {etapa === 3 && <P>
      <div style={lbl()}>Quiz · 3 perguntas do texto da aula</div>
      {busy && !quiz && <Sk />}
      {err && <div style={{ color: C.red, fontFamily: F.m, fontSize: 11 }}>{err} <button type="button" style={{ ...btn(), padding: "2px 8px" }} onClick={carregarQuiz}>Tentar de novo</button></div>}
      {quiz && <Quiz qs={quiz} onAnswer={(_, ok) => ok && setAcertos(a => a + 1)} />}
    </P>}

    {etapa === 4 && <P>
      <div style={lbl(C.gold)}>Aplique</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button type="button" style={btn()} onClick={() => onUsar(tec ?? l.titulo)}>USAR NO MEU PRÓXIMO REEL</button>
        <button type="button" style={btn()} onClick={() => onLab(eixo === "voz" || eixo === "ritmo" ? "fala" : "gancho")}>TREINAR COM UM REEL MEU</button>
        <button type="button" style={btn(true)} disabled={!uid || prog?.concluida} onClick={concluir}>{prog?.concluida ? "AULA CONCLUÍDA ✓" : "CONCLUIR AULA"}</button>
      </div>
    </P>}

    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
      <button type="button" style={btn()} disabled={etapa === 0} onClick={() => void ir(etapa - 1)}>← VOLTAR</button>
      <button type="button" style={btn()} disabled={etapa === 4} onClick={() => void ir(etapa + 1)}>AVANÇAR →</button>
    </div>
  </div>;
}

/* ── DIAGNÓSTICO ── */
function Diagnostico({ uid, lessons, onDone }: { uid: string | null; lessons: Lesson[]; onDone: () => void }) {
  const [qs, setQs] = useState<any[] | null>(null); const [resp, setResp] = useState<Record<number, boolean>>({}); const [err, setErr] = useState<string | null>(null); const [res, setRes] = useState<any>(null);
  const carregar = async () => { setErr(null); try { setQs((await call({ modo: "diagnostico" })).perguntas); } catch (e) { setErr((e as Error).message); } };
  useEffect(() => { void carregar(); }, []);
  const terminar = async () => {
    if (!qs || !uid) return;
    const ac: Record<string, { ok: number; total: number }> = {};
    qs.forEach((q, i) => { const a = (ac[q.eixo] ??= { ok: 0, total: 0 }); a.total++; if (resp[i]) a.ok++; });
    const fraco = eixoMaisFraco(ac);
    const plano = plano14(fraco, lessons, hojeBR());
    const trilha = TRILHA_DO_EIXO[fraco];
    await supabase.from("academy_diagnostic").upsert({ user_id: uid, respostas: qs.map((q, i) => ({ eixo: q.eixo, acertou: !!resp[i] })), trilha_recomendada: trilha, plano });
    setRes({ fraco, trilha });
  };
  if (err) return <P><div style={{ color: C.red, fontFamily: F.m, fontSize: 11 }}>{err}</div><button type="button" style={btn()} onClick={carregar}>Tentar de novo</button></P>;
  if (!qs) return <P><Sk n={5} /></P>;
  if (res) return <P style={{ borderColor: `${C.gold}66` }}>
    <div style={lbl(C.gold)}>Resultado</div>
    <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 18, color: C.white }}>Eixo mais fraco: {EIXO_LABEL[res.fraco as EixoN1]}</div>
    <div style={{ fontFamily: F.m, fontSize: 11, margin: "6px 0 10px" }}>Trilha recomendada: {res.trilha}. O plano de 14 dias começa hoje.</div>
    <button type="button" style={btn(true)} onClick={onDone}>VER MEU PLANO</button>
  </P>;
  return <P>
    <div style={lbl()}>{Object.keys(resp).length} de {qs.length} respondidas</div>
    <Quiz qs={qs} onAnswer={(i, ok) => setResp(r => ({ ...r, [i]: ok }))} />
    <button type="button" style={btn(true)} disabled={Object.keys(resp).length < qs.length} onClick={terminar}>VER RESULTADO</button>
  </P>;
}

/* ── REVISÃO ESPAÇADA ── */
function Revisao({ uid, fila, lessons, proibidas, onDone }: { uid: string | null; fila: Review[]; lessons: Lesson[]; proibidas: string[]; onDone: () => void }) {
  const [i, setI] = useState(0); const [q, setQ] = useState<any>(null); const [ok, setOk] = useState<boolean | null>(null); const [frase, setFrase] = useState(""); const [pr, setPr] = useState<any>(null); const [err, setErr] = useState<string | null>(null);
  const r = fila[i]; const l = r ? lessons.find(x => x.slug === r.lesson_slug) : null;
  useEffect(() => { setQ(null); setOk(null); setFrase(""); setPr(null); setErr(null); if (l) call({ modo: "quiz", slug: l.slug }).then(d => setQ(d.perguntas?.[0] ?? null), e => setErr(e.message)); }, [i, l?.slug]);
  if (!r || !l) return <P><div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 16, color: C.white }}>Nada para revisar hoje.</div></P>;
  const enviar = async () => {
    if (!uid) return;
    const v = verificarPratica(frase, proibidas); setPr(v);
    const acerto = !!ok && v.nota >= 70;
    await supabase.from("academy_reviews").update({ feita: true, acerto }).eq("id", r.id);
    if (!acerto) await supabase.from("academy_reviews").upsert({ ...revisaoAposErro(l.slug), user_id: uid }, { onConflict: "user_id,lesson_slug,intervalo_dias" });
    onDone();
  };
  return <P>
    <div style={lbl()}>Cartão {i + 1} de {fila.length} · {l.titulo}</div>
    {err && <div style={{ color: C.red, fontFamily: F.m, fontSize: 11 }}>{err}</div>}
    {!q && !err ? <Sk /> : q && <Quiz qs={[q]} onAnswer={(_, a) => setOk(a)} />}
    <div style={{ fontFamily: F.m, fontSize: 11, color: C.white, margin: "6px 0" }}>Reescreva em 1 frase mais forte: “{l.fraco}”</div>
    <textarea style={{ ...ta, minHeight: 60 }} value={frase} onChange={e => setFrase(e.target.value)} />
    {!pr ? <button type="button" style={{ ...btn(true), marginTop: 8 }} disabled={ok === null || !frase.trim()} onClick={enviar}>ENVIAR</button> : <>
      <ResultadoPratica r={pr} />
      <div style={{ fontFamily: F.m, fontSize: 10, color: ok && pr.nota >= 70 ? C.green : C.red, margin: "6px 0" }}>{ok && pr.nota >= 70 ? "Acertou. Vale o próximo intervalo." : "Errou. A revisão volta para amanhã e a aula fica em REVISAR."}</div>
      <button type="button" style={btn()} onClick={() => setI(x => x + 1)}>PRÓXIMO CARTÃO</button>
    </>}
  </P>;
}

/* ── CADERNO DE ERROS ── */
function MeusErros({ erros, lessons, proibidas, onAula, reload }: { erros: Erro[]; lessons: Lesson[]; proibidas: string[]; onAula: (s: string) => void; reload: () => void }) {
  const [f, setF] = useState(""); const [tr, setTr] = useState<Erro | null>(null); const [txt, setTxt] = useState(""); const [pr, setPr] = useState<any>(null);
  const mes = Date.now() - 30 * 864e5;
  const cont = REGRAS.map(r => ({ r, n: erros.filter(e => e.regra === r && new Date(e.created_at).getTime() >= mes).length })).filter(x => x.n).sort((a, b) => b.n - a.n);
  const lista = erros.filter(e => !f || e.regra === f);
  const semanas = Array.from({ length: 8 }, (_, i) => { const fim = Date.now() - i * 7 * 864e5, ini = fim - 7 * 864e5; return erros.filter(e => { const t = new Date(e.created_at).getTime(); return t >= ini && t < fim; }).length; }).reverse();
  const max = Math.max(1, ...semanas);
  const treinar = async () => {
    if (!tr) return;
    const v = verificarPratica(txt, proibidas); setPr(v);
    const acertou = v.nota >= 70 && !v.regras.includes(tr.regra as any);
    const nx = treinarErro(tr, acertou);
    await supabase.from("error_notebook").update(nx).eq("id", tr.id);
    setTr({ ...tr, ...nx }); reload();
  };
  return <>
    <P>
      <div style={lbl()}>Erros por semana</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60, borderBottom: `1px solid ${C.line}` }}>{semanas.map((n, i) => <div key={i} title={`${n}`} style={{ flex: 1, height: `${(n / max) * 100}%`, minHeight: n ? 3 : 0, background: C.red }} />)}</div>
      <div style={lbl(C.gold)}>Mais frequentes (30 dias)</div>
      {!cont.length ? <div style={{ fontFamily: F.m, fontSize: 11, color: C.muted }}>Nenhum erro registrado neste mês.</div> : cont.slice(0, 3).map(x => <div key={x.r} style={{ fontFamily: F.m, fontSize: 11, display: "flex", justifyContent: "space-between", gap: 6 }}>
        <span>Você fez “{x.r}” {x.n} vez(es) neste mês.</span>
        <button type="button" style={{ ...btn(), padding: "2px 8px", fontSize: 11 }} onClick={() => onAula(AULA_DA_REGRA[x.r])}>AULA: {lessons.find(l => l.slug === AULA_DA_REGRA[x.r])?.titulo ?? "abrir"}</button></div>)}
    </P>
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
      {["", ...REGRAS].map(r => <button key={r} type="button" onClick={() => setF(r)} style={{ ...btn(f === r), padding: "4px 8px", fontSize: 11 }}>{r || "todas"}</button>)}
    </div>
    {tr && <P style={{ borderColor: `${C.gold}66` }}>
      <div style={lbl(C.gold)}>Treinar este erro · {tr.regra} · {tr.acertos_seguidos}/2 acertos seguidos</div>
      <div style={{ fontFamily: F.m, fontSize: 11, color: C.red, marginBottom: 6 }}>“{tr.frase}”</div>
      {tr.status === "superado" ? <div style={{ fontFamily: F.t, fontWeight: 700, color: C.green }}>SUPERADO ✓</div> : <>
        <textarea style={{ ...ta, minHeight: 60 }} value={txt} onChange={e => setTxt(e.target.value)} placeholder="Reescreva a frase" />
        <button type="button" style={{ ...btn(true), marginTop: 6 }} disabled={!txt.trim()} onClick={treinar}>VERIFICAR</button>
      </>}
      {pr && <ResultadoPratica r={pr} />}
    </P>}
    {!lista.length ? <P><div style={{ fontFamily: F.m, fontSize: 11, color: C.muted }}>Nenhum erro aqui.</div></P> : lista.slice(0, 100).map((e, i) => <P key={e.id} i={Math.min(i, 8)}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
        <span style={{ fontFamily: F.m, fontSize: 9, color: e.status === "superado" ? C.green : C.red }}>{e.regra.toUpperCase()} · {e.origem} · {e.status.toUpperCase()}</span>
        <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{new Date(e.created_at).toLocaleDateString("pt-BR")}</span>
      </div>
      <div style={{ fontFamily: F.m, fontSize: 11, color: C.white, margin: "4px 0" }}>“{e.frase}”</div>
      {e.correcao_sugerida && <div style={{ fontFamily: F.m, fontSize: 10, color: C.amber }}>{e.correcao_sugerida}</div>}
      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
        {e.status === "aberto" && <button type="button" style={{ ...btn(), padding: "4px 8px", fontSize: 11 }} onClick={() => { setTr(e); setTxt(""); setPr(null); window.scrollTo({ top: 0 }); }}>TREINAR ESTE ERRO</button>}
        {e.lesson_slug && <button type="button" style={{ ...btn(), padding: "4px 8px", fontSize: 11 }} onClick={() => onAula(e.lesson_slug!)}>AULA QUE CORRIGE</button>}
      </div>
    </P>)}
  </>;
}

/* ── TREINO DE 60 SEGUNDOS ── */
function Treino60({ uid, erros, dom, attempts, proibidas, salvar, reload }: { uid: string | null; erros: Erro[]; dom: Record<string, number | null>; attempts: Attempt[]; proibidas: string[]; salvar: (t: string, e: string, r: any, n: number) => Promise<void>; reload: () => void }) {
  const [origem] = useState(() => origemTreino(erros, dom));
  const [seg, setSeg] = useState(60); const [on, setOn] = useState(false); const [txt, setTxt] = useState(""); const [pr, setPr] = useState<any>(null); const [fb, setFb] = useState<any>(null); const [err, setErr] = useState<string | null>(null);
  const ref = useRef<any>(null);
  useEffect(() => { if (!on) return; ref.current = setInterval(() => setSeg(s => { if (s <= 1) { clearInterval(ref.current); setOn(false); return 0; } return s - 1; }), 1000); return () => clearInterval(ref.current); }, [on]);
  const dias = attempts.filter(a => a.tipo === "treino60").map(a => new Date(new Date(a.created_at).getTime() - 3 * 3600e3).toISOString().slice(0, 10));
  const streak = diasSeguidos(dias, hojeBR());
  const enviar = async () => {
    setOn(false); clearInterval(ref.current);
    const v = verificarPratica(txt, proibidas); setPr(v); setErr(null);
    try { setFb(await call({ modo: "treino", texto: txt, pedido: origem.texto })); } catch (e) { setErr((e as Error).message); }
    const eixo = origem.tipo === "eixo" ? origem.eixo : "gancho";
    await salvar("treino60", txt, { eixos: { [eixo]: v.nota }, verificador: v.verificador, origem: origem.tipo }, v.nota);
    if (origem.tipo === "erro" && uid) { const nx = treinarErro(origem.erro as any, v.nota >= 70 && !v.regras.includes(origem.erro.regra as any)); await supabase.from("error_notebook").update(nx).eq("id", origem.erro.id); }
    reload();
  };
  return <P>
    <div style={{ display: "flex", justifyContent: "space-between" }}><div style={lbl(C.gold)}>{origem.tipo === "erro" ? "Do seu caderno de erros" : origem.tipo === "eixo" ? "Seu eixo mais fraco" : "Exercício do dia"}</div><span style={{ fontFamily: F.m, fontSize: 9, color: C.gold }}>{streak} dia(s) seguidos</span></div>
    <div style={{ fontFamily: F.m, fontSize: 12, color: C.white, marginBottom: 8 }}>{origem.texto}</div>
    <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 34, color: seg <= 10 ? C.red : C.cyan }} aria-live="polite">{seg}s</div>
    <textarea style={ta} value={txt} onFocus={() => !on && seg === 60 && setOn(true)} onChange={e => setTxt(e.target.value)} placeholder="Escreva aqui. O cronômetro começa quando você digita." disabled={!!pr} />
    {!pr && <button type="button" style={{ ...btn(true), marginTop: 8 }} disabled={!txt.trim()} onClick={enviar}>ENVIAR</button>}
    {pr && <ResultadoPratica r={pr} extra={{ feedback: fb?.feedback }} />}
    {err && <div style={{ color: C.red, fontFamily: F.m, fontSize: 11 }}>{err}</div>}
    {fb?.reescritas?.map((r: string, i: number) => <div key={i} style={{ fontFamily: F.m, fontSize: 11, color: C.white, marginTop: 4 }}><span style={{ color: C.gold }}>Reescrita {i + 1}: </span>{r}</div>)}
  </P>;
}
const lbox: React.CSSProperties = { border: `1px solid ${C.line}`, background: "#07070d", padding: 12 };

function useRun() {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const run = async <T,>(fn: () => Promise<T>) => { setBusy(true); setErr(null); try { return await fn(); } catch (e) { setErr((e as Error).message); return null; } finally { setBusy(false); } };
  return { busy, err, run };
}
const Err = ({ e, retry }: { e: string | null; retry: () => void }) => e ? <div style={{ color: C.red, fontFamily: F.m, fontSize: 11, margin: "6px 0" }}>{e} <button type="button" style={{ ...btn(), padding: "2px 8px" }} onClick={retry}>Tentar de novo</button></div> : null;

function LabGancho({ salvar }: { salvar: (t: string, e: string, r: any, n: number) => Promise<void> }) {
  const [t, setT] = useState(""); const [r, setR] = useState<any>(null); const { busy, err, run } = useRun();
  const go = () => run(async () => { const d = await call({ modo: "gancho", texto: t }); setR(d); await salvar("gancho", t, d, d.nota); });
  const CRIT: Record<string, string> = { tensao_clara: "Tensão clara", promessa_6s: "Promessa em 6s", especificidade: "Especificidade", identificacao: "Identificação", curiosidade_sem_enganar: "Curiosidade sem enganar" };
  return <div>
    <textarea style={ta} value={t} onChange={e => setT(e.target.value)} placeholder="Escreva a abertura do reel" />
    <button type="button" style={{ ...btn(true), marginTop: 8 }} disabled={busy || !t.trim()} onClick={go}>{busy ? "Testando o gancho..." : "ANÁLISE"}</button>
    <Err e={err} retry={go} />
    {r && <div style={{ marginTop: 12 }}>
      <div style={{ ...lbox, marginBottom: 8 }}><div style={lbl()}>Nota</div><div style={{ fontFamily: F.t, fontSize: 32, fontWeight: 700, color: r.nota10 >= 7 ? C.green : r.nota10 >= 5 ? C.amber : C.red }}>{r.nota10}/10</div>
        {Object.entries(r.criterios).map(([k, v]) => <div key={k} style={{ fontFamily: F.m, fontSize: 11, display: "flex", justifyContent: "space-between" }}><span>{CRIT[k]}</span><span>{String(v)}/2</span></div>)}
        {r.comentario && <div style={{ fontFamily: F.m, fontSize: 11, color: C.white, marginTop: 6 }}>{r.comentario}</div>}</div>
      <div style={{ ...lbox, marginBottom: 8 }}><div style={lbl(C.amber)}>Verificador · limite {r.verificador.teto}/10</div>
        {[...r.verificador.motivos, ...r.verificador.riscos, ...r.verificador.avisos].length ? [...r.verificador.motivos, ...r.verificador.riscos, ...r.verificador.avisos].map((m: string, i: number) => <div key={i} style={{ fontFamily: F.m, fontSize: 11 }}>· {m}</div>) : <div style={{ fontFamily: F.m, fontSize: 11, color: C.green }}>Sem saudação, até 12 palavras, sem termo proibido.</div>}</div>
      <div style={lbox}><div style={lbl(C.gold)}>3 reescritas</div>
        {r.reescritas.map((x: any, i: number) => <div key={i} style={{ borderTop: i ? `1px solid ${C.line}` : "none", padding: "6px 0" }}><div style={{ fontFamily: F.m, fontSize: 9, color: C.gold }}>{x.formula}</div><div style={{ fontFamily: F.m, fontSize: 12, color: C.white }}>{x.texto}</div></div>)}</div>
    </div>}
  </div>;
}

const FIGURAS = ["antítese", "anáfora", "regra de três", "pergunta retórica", "prolepse"];
function LabFiguras({ figuraInicial, salvar }: { figuraInicial?: string; salvar: (t: string, e: string, r: any, n: number) => Promise<void> }) {
  const [fig, setFig] = useState(figuraInicial && FIGURAS.includes(figuraInicial) ? figuraInicial : FIGURAS[0]);
  const [ideia, setIdeia] = useState(""); const [t, setT] = useState(""); const [r, setR] = useState<any>(null); const { busy, err, run } = useRun();
  const go = () => run(async () => { const d = await call({ modo: "figuras", figura: fig, ideia, texto: t }); setR(d); await salvar("figuras", `${fig} | ${ideia} | ${t}`, d, d.nota); });
  return <div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>{FIGURAS.map(f => <button key={f} type="button" onClick={() => setFig(f)} style={{ ...btn(f === fig), padding: "5px 8px", fontSize: 12 }}>{f}</button>)}</div>
    <input value={ideia} onChange={e => setIdeia(e.target.value)} placeholder="A ideia (ex.: disciplina não basta)" style={{ ...ta, minHeight: 0, marginBottom: 8 }} />
    <textarea style={ta} value={t} onChange={e => setT(e.target.value)} placeholder={`Sua frase com ${fig}`} />
    <button type="button" style={{ ...btn(true), marginTop: 8 }} disabled={busy || !t.trim()} onClick={go}>{busy ? "Lendo a frase..." : "FEEDBACK"}</button>
    <Err e={err} retry={go} />
    {r && <div style={{ ...lbox, marginTop: 12 }}>
      <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 16, color: r.aplicada ? C.green : C.amber }}>{r.aplicada ? "Figura aplicada" : "Figura não aplicada"} · {r.nota}/100</div>
      <div style={{ fontFamily: F.m, fontSize: 12, color: C.white, margin: "6px 0" }}>{r.feedback}</div>
      <div style={lbl(C.gold)}>Versão melhorada</div><div style={{ fontFamily: F.m, fontSize: 12, color: C.white }}>{r.versao_melhorada}</div>
    </div>}
  </div>;
}

const AVISO_DITADO = "O áudio não é guardado pelo app. O ditado ao vivo usa o reconhecimento de voz do navegador, que pode enviar o áudio ao serviço do fabricante. Se isso for um problema, cole a transcrição.";
function LabFala({ uid, salvar, onCard }: { uid: string | null; salvar: (t: string, e: string, r: any, n: number) => Promise<void>; onCard: (t: string) => void }) {
  const [t, setT] = useState(""); const [dur, setDur] = useState(""); const [origem, setOrigem] = useState<"colada" | "ditado">("colada");
  const [muletasTxt, setMuletasTxt] = useState(() => localStorage.getItem("academia_muletas") ?? MULETAS_PADRAO.join(", "));
  const [marcas, setMarcas] = useState<Marca[]>([]); const [gravando, setGravando] = useState(false); const [avisoOk, setAvisoOk] = useState(false);
  const [med, setMed] = useState<MedidasFala | null>(null); const [an, setAn] = useState<any>(null); const [nota, setNota] = useState<number | null>(null);
  const [nova, setNova] = useState<string | null>(null); const [salva, setSalva] = useState(false);
  const { busy, err, run } = useRun();
  const rec = useRef<any>(null); const t0 = useRef(0); const finalTxt = useRef("");
  const SR = typeof window !== "undefined" ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;
  const muletas = useMemo(() => muletasTxt.split(",").map(s => s.trim()).filter(Boolean), [muletasTxt]);

  const iniciar = () => {
    if (!SR) return;
    const r = new SR(); r.lang = "pt-BR"; r.continuous = true; r.interimResults = true;
    finalTxt.current = ""; setMarcas([]); setT(""); t0.current = performance.now(); setOrigem("ditado");
    r.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) { const s = e.results[i][0].transcript; if (e.results[i].isFinal) finalTxt.current += s + " "; else interim += s; }
      const full = (finalTxt.current + interim).trim(); setT(full);
      const n = full.split(/\s+/).filter(Boolean).length;
      setMarcas(m => (m.length && m[m.length - 1].palavras === n ? m : [...m, { t: (performance.now() - t0.current) / 1000, palavras: n }]));
    };
    r.onend = () => { setGravando(false); setDur(String(Math.round((performance.now() - t0.current) / 1000))); };
    rec.current = r; r.start(); setGravando(true);
  };
  const parar = () => rec.current?.stop();
  useEffect(() => () => rec.current?.abort?.(), []);

  const analisar = () => run(async () => {
    localStorage.setItem("academia_muletas", muletasTxt);
    const m = medirFala(t, { duracao_seg: Number(dur) || null, marcas: origem === "ditado" ? marcas : undefined, muletas });
    setMed(m); setNova(null); setSalva(false);
    const d = await call({ modo: "fala", texto: t }); const a = d.analise ?? {}; setAn(a);
    const n = Math.round(notaObjetiva(m) * 0.5 + (Number(a.nota_qualitativa) || 0) * 0.5); setNota(n);
    const eixos: Record<string, number> = { gancho: Number(a.gancho) || 0, prova: Number(a.prova) || 0, voz: Number(a.voz) || 0, cta: Number(a.cta?.nota) || 0 };
    const rt = ritmoEixo(m); if (rt != null) eixos.ritmo = rt;
    await salvar("fala", t, { medidas: m, analise: a, eixos }, n);
  });
  const salvarTranscricao = async () => { if (!uid) return; const { error } = await supabase.from("transcripts").insert({ user_id: uid, texto: t, duracao_seg: Number(dur) || null, origem }); if (!error) setSalva(true); };
  const reescrever = () => run(async () => setNova((await call({ modo: "reescrever", texto: t })).texto));
  const maxPps = Math.max(3.5, ...(med?.trechos.map(x => x.pps) ?? [0]));

  return <div>
    <div style={{ ...lbox, marginBottom: 8, borderColor: `${C.amber}60` }}><div style={{ fontFamily: F.m, fontSize: 10, color: C.amber }}>{AVISO_DITADO}</div>
      {SR ? (!avisoOk ? <button type="button" style={{ ...btn(), marginTop: 8 }} onClick={() => setAvisoOk(true)}>Entendi, usar ditado</button>
        : <button type="button" style={{ ...btn(gravando), marginTop: 8 }} onClick={gravando ? parar : iniciar}>{gravando ? "■ PARAR DITADO" : "● INICIAR DITADO"}</button>)
        : <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, marginTop: 6 }}>Este navegador não tem ditado. Cole a transcrição.</div>}
    </div>
    <textarea style={{ ...ta, minHeight: 130 }} value={t} onChange={e => { setT(e.target.value); if (!gravando) setOrigem("colada"); }} placeholder="Cole aqui a transcrição da sua fala" />
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, marginTop: 8 }}>
      <input value={dur} onChange={e => setDur(e.target.value.replace(/\D/g, ""))} placeholder="Duração (s)" style={{ ...ta, minHeight: 0 }} />
      <input value={muletasTxt} onChange={e => setMuletasTxt(e.target.value)} aria-label="Muletas" style={{ ...ta, minHeight: 0 }} />
    </div>
    <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 4 }}>Muletas (separe por vírgula). Palavras por segundo só com duração ou ditado.</div>
    <button type="button" style={{ ...btn(true), marginTop: 8 }} disabled={busy || !t.trim() || gravando} onClick={analisar}>{busy ? "Analisando a fala..." : "ANÁLISE"}</button>
    <Err e={err} retry={analisar} />

    {med && <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
      {nota != null && <div style={lbox}><div style={lbl()}>Nota</div><div style={{ fontFamily: F.t, fontSize: 32, fontWeight: 700, color: nota >= 70 ? C.green : nota >= 50 ? C.amber : C.red }}>{nota}/100</div>
        <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>Metade pelas medidas em código, metade pela análise do texto.</div></div>}
      <div style={lbox}><div style={lbl()}>Medidas</div>
        {[["Palavras", med.total_palavras], ["Palavras por segundo", med.pps ?? "— (informe a duração)"], ["Frases com mais de 14 palavras", med.frases_longas.length], ["Abertura", `${med.abertura_palavras} palavras${med.abertura_longa ? " · longa" : ""}`], ["Saudação na abertura", med.saudacao ? "sim" : "não"], ["Muletas por 100 palavras", med.muletas_por_100], ["Pausas (estimativa)", med.pausas_estimadas ?? "— só no ditado"]].map(([k, v]) =>
          <div key={String(k)} style={{ fontFamily: F.m, fontSize: 11, display: "flex", justifyContent: "space-between", borderTop: `1px solid ${C.line}`, padding: "4px 0" }}><span>{k}</span><span style={{ color: C.white }}>{String(v)}</span></div>)}
        {med.frases_longas.map((f, i) => <div key={i} style={{ fontFamily: F.m, fontSize: 10, color: C.amber, marginTop: 4 }}>· {f}</div>)}
      </div>
      {med.trechos.length > 0 && <div style={lbox}><div style={lbl()}>Ritmo por trecho de 5s{origem === "colada" ? " · distribuição uniforme" : ""}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90, borderBottom: `1px solid ${C.line}` }}>
          {med.trechos.map((x, i) => <div key={i} title={`${x.ini}-${x.fim}s: ${x.pps}`} style={{ flex: 1, height: `${(x.pps / maxPps) * 100}%`, background: x.pps >= 2.5 && x.pps <= 3 ? C.green : C.amber }} />)}
        </div>
        <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 4 }}>Faixa verde: 2,5 a 3 palavras por segundo.</div></div>}
      <div style={lbox}><div style={lbl()}>Muletas</div>{med.muletas.length ? med.muletas.map(m => <span key={m.termo} style={{ fontFamily: F.m, fontSize: 11, marginRight: 10 }}>{m.termo} ×{m.n}</span>) : <span style={{ fontFamily: F.m, fontSize: 11, color: C.green }}>Nenhuma.</span>}</div>
      {an && <>
        <div style={lbox}><div style={lbl()}>Análise</div>
          <div style={{ fontFamily: F.m, fontSize: 11 }}>Gancho: {an.gancho ?? "—"}/100 · CTA: {an.cta?.nota ?? "—"}/100 · Prova: {an.prova ?? "—"}/100</div>
          {an.cta?.comentario && <div style={{ fontFamily: F.m, fontSize: 11, color: C.white }}>{an.cta.comentario}</div>}
          <div style={{ fontFamily: F.m, fontSize: 11, marginTop: 4 }}>Elementos concretos: {(an.especificidade?.elementos ?? []).join(", ") || "nenhum"}</div>
          <div style={{ fontFamily: F.m, fontSize: 11 }}>Perguntas sem resposta: {(an.perguntas_sem_resposta ?? []).join(" | ") || "nenhuma"}</div>
          <div style={{ fontFamily: F.m, fontSize: 11 }}>Figura: {an.figura?.nome || "nenhuma"}{an.figura?.trecho ? ` — "${an.figura.trecho}"` : ""}</div>
        </div>
        <div style={lbox}><div style={lbl(C.gold)}>Trechos para reescrever</div>{(an.trechos ?? []).slice(0, 3).map((x: any, i: number) => <div key={i} style={{ borderTop: i ? `1px solid ${C.line}` : "none", padding: "6px 0", fontFamily: F.m, fontSize: 11 }}><div style={{ color: C.red }}>{x.original}</div><div style={{ color: C.green }}>→ {x.melhor}</div></div>)}</div>
        <div style={{ ...lbox, borderColor: `${C.gold}60` }}><div style={lbl(C.gold)}>3 ajustes para a próxima gravação</div>{(an.ajustes ?? []).slice(0, 3).map((a: string, i: number) => <div key={i} style={{ fontFamily: F.m, fontSize: 12, color: C.white }}>{i + 1}. {a}</div>)}</div>
      </>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <button type="button" style={btn()} disabled={salva || !uid} onClick={salvarTranscricao}>{salva ? "TRANSCRIÇÃO SALVA ✓" : "SALVAR TRANSCRIÇÃO"}</button>
        <button type="button" style={btn()} disabled={busy} onClick={reescrever}>GERAR VERSÃO COM MAIS ATENÇÃO</button>
        <button type="button" style={btn()} onClick={() => onCard(nova ?? t)}>ENVIAR AO ESTÚDIO DE CARDS</button>
      </div>
      {nova && <div style={lbox}><div style={lbl(C.green)}>Versão com mais atenção</div><div style={{ fontFamily: F.m, fontSize: 12, color: C.white, whiteSpace: "pre-wrap" }}>{nova}</div></div>}
    </div>}
  </div>;
}
