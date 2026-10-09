import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import bookSeed from "@/data/academyBook.json";
import lessonsSeed from "@/data/academyLessons.json";
import {
  SELO_FONTE, avaliarCartao, podeVerResposta, recallValido, capituloLido, quizPassou, cartoesIniciais, capituloDominado,
  estadoCapitulo, ritmo, estadoProva, montarProva, provaAprovada, podeRefazerProva, seloModulo, SELO_TEXTO, leituraAtiva,
  diasSeguidosEstudo, notasMarkdown, capituloDaAula, palavras, PAUSA_MIN, RECALL_MIN, notaProva, tempoLeitura, questoesCheckpoint, acertosParaAprovar, podeEntregarProjeto, textoDosBlocos,
  type NivelFonte, type Auto, type QItem, type EstadoCap,
} from "@/lib/bookRules";

const C = { bg: "#05070d", cyan: "#00D4FF", gold: "#B8922A", amber: "#EF9F27", green: "#5DCAA5", lilac: "#AFA9EC", red: "#EF4444", text: "#C8C8D8", white: "#F5F0E8", muted: "#888", line: "#1a1a26" };
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", s: "'Source Serif 4',Georgia,serif" };
type Mod = { slug: string; ordem: number; titulo: string; subtitulo: string | null; descricao: string | null; status: string; capitulos_planejados: string[]; projeto?: any };
type Cap = { slug: string; modulo_slug: string; ordem: number; titulo: string; pergunta_guia: string | null; tempo_leitura_min: number | null; nivel_fonte: NivelFonte; blocos: any[]; glossario: { termo: string; definicao: string }[]; quiz: { pergunta: string; opcoes: string[]; correta: number; explicacao: string }[]; flashcards: { frente: string; verso: string }[]; aplique: { titulo: string; passos: string[]; ligacao: string | null } | null; fontes: { referencia: string; link?: string; tipo: string; observacao?: string }[]; relacionadas: string[]; status: string };
type Prog = { chapter_slug: string; progresso_pct: number; bloco_atual: number; tempo_lendo_seg: number; recall_texto: string | null; recall_feito: boolean; quiz_score: number | null; aplique_feito: boolean; concluido: boolean; concluido_em: string | null; dominado: boolean; iniciado_em: string; ultimo_acesso: string };
type FCard = { id?: string; chapter_slug: string; card_idx: number; caixa: number; due_at: string; acertos: number; erros: number; ultimo_resultado: string | null; updated_at?: string };
type NotaT = { id: string; chapter_slug: string; bloco_idx: number; tipo: "nota" | "destaque" | "duvida"; trecho: string | null; texto: string | null; created_at: string };
type Exam = { id: string; modulo_slug: string; tentativa: number; nota: number; itens: any; created_at: string };
type Proj = { modulo_slug: string; entrega: any; autoavaliacao: any; status: string };
type Plan = { novos_por_dia: number; hora_estudo: string | null; liberacoes: any[]; dicas_vistas: Record<string, boolean> };
type View = { k: "home" } | { k: "mod"; slug: string } | { k: "ler"; slug: string } | { k: "revisao" } | { k: "notas" } | { k: "glossario" } | { k: "prova"; slug: string } | { k: "projeto"; slug: string } | { k: "ritmo" };
export type LabK = "gancho" | "figuras" | "fala";
export type TreinoAlvo = "home" | LabK | "erros" | { aula: string; capSlug: string; capTitulo: string } | { lab: LabK; capSlug: string; capTitulo: string };
const LABS_EXISTENTES: LabK[] = ["gancho", "figuras", "fala"];

const CSS = `
.bk-root{background:#020205;background-image:linear-gradient(#00D4FF0a 1px,transparent 1px),linear-gradient(90deg,#00D4FF0a 1px,transparent 1px),radial-gradient(ellipse at 50% -10%,#00D4FF1f,transparent 60%);background-size:28px 28px,28px 28px,100% 100%}
.bk-p{position:relative;background:#07070dcc;backdrop-filter:blur(6px);border:1px solid #00D4FF33;padding:12px;margin-bottom:10px;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%);animation:bkIn .45s ease both}
.bk-p::before{content:"";position:absolute;left:0;right:12px;top:0;height:1px;background:linear-gradient(90deg,transparent,#00D4FF99,transparent)}
.bk-row{display:flex;align-items:center;gap:8px;width:100%;text-align:left;background:none;border:none;border-top:1px solid #1a1a26;padding:8px 0;cursor:pointer;color:#C8C8D8}
.bk-row:hover{background:#00D4FF08}
.bk-num{font-family:'Rajdhani',sans-serif;font-weight:700;color:transparent;-webkit-text-stroke:1.5px #00D4FF;line-height:.9}
.bk-reader{background:#05070d}
.bk-col{max-width:68ch;margin:0 auto;font-family:'Source Serif 4',Georgia,serif;font-size:18px;line-height:1.7;color:#E8E4DA}
.bk-blk{margin:0 0 1.2em;scroll-margin-top:60px}
.bk-rv{opacity:0;transform:translateY(10px);transition:opacity .5s ease,transform .5s ease}.bk-rv.on{opacity:1;transform:none}
.bk-gl{border-bottom:1px dotted #00D4FF;cursor:help;position:relative}
.bk-gl .tip{position:absolute;left:0;top:1.6em;z-index:5;width:240px;background:#0a0f18;border:1px solid #00D4FF66;padding:8px;font-family:'Space Mono',monospace;font-size:11px;line-height:1.5;color:#C8C8D8}
.bk-an{display:grid;grid-template-columns:1fr;gap:12px}@media(min-width:900px){.bk-an{grid-template-columns:3fr 2fr}}
.bk-ff{display:grid;grid-template-columns:1fr;gap:10px}@media(min-width:640px){.bk-ff{grid-template-columns:1fr 1fr}}
.bk-lay{display:block}@media(min-width:1100px){.bk-lay{display:grid;grid-template-columns:220px 1fr;gap:24px}.bk-toc-m{display:none!important}}
.bk-toc-d{display:none}@media(min-width:1100px){.bk-toc-d{display:block;position:sticky;top:56px;align-self:start;max-height:80vh;overflow:auto}}
mark.bk-hl{background:#00D4FF33;color:inherit}
@keyframes bkIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.bk-p{animation:none!important}.bk-rv{opacity:1!important;transform:none!important;transition:none!important}}
`;
const lbl = (c = C.cyan): React.CSSProperties => ({ fontFamily: F.m, fontSize: 9, letterSpacing: 2, color: c, textTransform: "uppercase", marginBottom: 6 });
const btn = (gold = false, dis = false): React.CSSProperties => ({ fontFamily: F.t, fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: "9px 12px", cursor: dis ? "not-allowed" : "pointer", opacity: dis ? 0.45 : 1, borderRadius: 0, border: `1px solid ${gold ? C.gold : C.cyan}80`, background: gold ? C.gold : "transparent", color: gold ? "#0A0A0A" : C.cyan });
const ta: React.CSSProperties = { width: "100%", minHeight: 90, background: "#0a0a12", border: `1px solid ${C.line}`, color: C.white, fontFamily: F.m, fontSize: 12, padding: 10, borderRadius: 0, boxSizing: "border-box" };
const P = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => <div className="bk-p" style={style}>{children}</div>;
const hojeBR = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const diaBR = (iso: string) => new Date(new Date(iso).getTime() - 3 * 3600e3).toISOString().slice(0, 10);
const ESTADO_COR: Record<EstadoCap, string> = { "não iniciado": C.muted, lendo: C.cyan, "concluído": C.green, dominado: C.gold, revisar: C.amber };

function Selo({ n }: { n: NivelFonte }) {
  const s = SELO_FONTE[n] ?? SELO_FONTE.verificada;
  return <span style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
    <span style={{ fontFamily: F.m, fontSize: 9, letterSpacing: 1, color: s.cor, border: `1px solid ${s.cor}70`, padding: "2px 6px", alignSelf: "flex-start" }}>{s.label.toUpperCase()}</span>
    {s.aviso && <span style={{ fontFamily: F.m, fontSize: 9, color: s.cor }}>{s.aviso}</span>}
  </span>;
}
function Ring({ pct, size = 44, cor = C.cyan }: { pct: number; size?: number; cor?: string }) {
  const r = size / 2 - 4, c = 2 * Math.PI * r;
  return <svg width={size} height={size} aria-hidden><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${cor}22`} strokeWidth={4} />
    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={cor} strokeWidth={4} strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    <text x="50%" y="54%" textAnchor="middle" fontSize={10} fontFamily="'Space Mono',monospace" fill={C.white}>{Math.round(pct)}%</text></svg>;
}
function Hl({ t, q }: { t: string; q: string }) {
  if (!q) return <>{t}</>;
  const i = t.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{t}</>;
  return <>{t.slice(0, i)}<mark className="bk-hl">{t.slice(i, i + q.length)}</mark>{t.slice(i + q.length)}</>;
}
function baixar(nome: string, conteudo: string) {
  const b = new Blob([conteudo], { type: "text/markdown;charset=utf-8" }); const u = URL.createObjectURL(b);
  const a = document.createElement("a"); a.href = u; a.download = nome; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000);
}

export default function BibliotecaPanel({ onClose, onTreinos, initialCap }: { onClose: () => void; onTreinos: (alvo: TreinoAlvo) => void; initialCap?: string }) {
  const [uid, setUid] = useState<string | null>(null);
  const [mods, setMods] = useState<Mod[]>(bookSeed.modulos as Mod[]);
  const [caps, setCaps] = useState<Cap[]>(bookSeed.capitulos as unknown as Cap[]);
  const [prog, setProg] = useState<Record<string, Prog>>({});
  const [cards, setCards] = useState<FCard[]>([]);
  const [notas, setNotas] = useState<NotaT[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [projs, setProjs] = useState<Record<string, Proj>>({});
  const [plan, setPlan] = useState<Plan>({ novos_por_dia: 1, hora_estudo: null, liberacoes: [], dicas_vistas: {} });
  const [erros, setErros] = useState<{ regra: string; lesson_slug: string | null; status: string }[]>([]);
  const [view, setView] = useState<View>(initialCap ? { k: "ler", slug: initialCap } : { k: "home" });
  const [trava, setTrava] = useState<{ slug: string; motivo: string } | null>(null);
  const [busca, setBusca] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.getElementById("bk-serif")) {
      const l = document.createElement("link"); l.id = "bk-serif"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  const load = async () => {
    const { data: s } = await supabase.auth.getSession(); const u = s.session?.user?.id ?? null; setUid(u);
    const [{ data: m }, { data: c }] = await Promise.all([
      supabase.from("academy_modules").select("*").order("ordem"),
      supabase.from("academy_chapters").select("*").eq("status", "publicado").order("ordem"),
    ]);
    if (m?.length) setMods(m as unknown as Mod[]);
    if (c?.length) setCaps(c as unknown as Cap[]);
    if (!u) return;
    const [{ data: p }, { data: fc }, { data: nt }, { data: ex }, { data: pj }, { data: pl }, { data: er }] = await Promise.all([
      supabase.from("chapter_progress").select("*").eq("user_id", u),
      supabase.from("flashcard_state").select("*").eq("user_id", u),
      supabase.from("chapter_notes").select("*").eq("user_id", u).order("created_at"),
      supabase.from("module_exams").select("*").eq("user_id", u).order("created_at"),
      supabase.from("module_projects").select("*").eq("user_id", u),
      supabase.from("study_plan").select("*").eq("user_id", u).maybeSingle(),
      supabase.from("error_notebook").select("regra,lesson_slug,status").eq("user_id", u).limit(500),
    ]);
    setProg(Object.fromEntries((p ?? []).map((r: any) => [r.chapter_slug, r])));
    setCards((fc ?? []) as FCard[]); setNotas((nt ?? []) as NotaT[]); setExams((ex ?? []) as Exam[]);
    setProjs(Object.fromEntries((pj ?? []).map((r: any) => [r.modulo_slug, r])));
    if (pl) setPlan({ novos_por_dia: (pl as any).novos_por_dia ?? 1, hora_estudo: (pl as any).hora_estudo, liberacoes: (pl as any).liberacoes ?? [], dicas_vistas: (pl as any).dicas_vistas ?? {} });
    setErros((er ?? []) as any[]);
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key !== "Escape") return; if (view.k === "home") onClose(); else setView({ k: "home" }); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [view.k]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [view]);

  const savePlan = async (patch: Partial<Plan>) => {
    const next = { ...plan, ...patch }; setPlan(next);
    if (uid) await supabase.from("study_plan").upsert({ user_id: uid, novos_por_dia: next.novos_por_dia, hora_estudo: next.hora_estudo, liberacoes: next.liberacoes, dicas_vistas: next.dicas_vistas } as any);
  };
  const registrarUso = (tipo: string, alvo: string) => savePlan({ liberacoes: [...plan.liberacoes, { tipo, alvo, at: new Date().toISOString() }] });

  const agora = Date.now();
  const vencidos = cards.filter(c => new Date(c.due_at).getTime() <= agora);
  const cardsDe = (slug: string) => cards.filter(c => c.chapter_slug === slug);
  const estado = (slug: string) => estadoCapitulo(prog[slug], cardsDe(slug));
  const capsOrd = useMemo(() => [...caps].sort((a, b) => (mods.find(m => m.slug === a.modulo_slug)?.ordem ?? 0) - (mods.find(m => m.slug === b.modulo_slug)?.ordem ?? 0) || a.ordem - b.ordem), [caps, mods]);
  const novosHoje = Object.values(prog).filter(p => diaBR(p.iniciado_em) === hojeBR()).length;
  const continuar = capsOrd.filter(c => prog[c.slug] && !prog[c.slug].concluido).sort((a, b) => prog[b.slug].ultimo_acesso.localeCompare(prog[a.slug].ultimo_acesso))[0] ?? null;
  const proximoNovo = capsOrd.find(c => !prog[c.slug]) ?? null;
  const nConcl = Object.values(prog).filter(p => p.concluido).length;
  const nDom = caps.filter(c => estado(c.slug) === "dominado").length;
  const xp = nConcl * 10;
  const semana = cards.filter(c => c.ultimo_resultado && c.updated_at && agora - new Date(c.updated_at).getTime() < 7 * 864e5).length;
  const tempoTotal = Object.values(prog).reduce((s, p) => s + (p.tempo_lendo_seg ?? 0), 0);
  const dias = diasSeguidosEstudo([...new Set([...Object.values(prog).map(p => diaBR(p.ultimo_acesso)), ...cards.filter(c => c.updated_at && c.ultimo_resultado).map(c => diaBR(c.updated_at!))])], hojeBR());
  const titulos = Object.fromEntries(caps.map(c => [c.slug, c.titulo]));

  const abrir = (slug: string) => {
    const r = ritmo({ jaIniciado: !!prog[slug], novosHoje, limite: plan.novos_por_dia, revisoesVencidas: vencidos.length });
    if (!r.liberado) { setTrava({ slug, motivo: r.motivo! }); return; }
    void iniciar(slug);
  };
  const iniciar = async (slug: string) => {
    if (uid && !prog[slug]) {
      const row = { user_id: uid, chapter_slug: slug, iniciado_em: new Date().toISOString(), ultimo_acesso: new Date().toISOString() };
      const { data } = await supabase.from("chapter_progress").upsert(row as any, { onConflict: "user_id,chapter_slug", ignoreDuplicates: true }).select().maybeSingle();
      if (data) setProg(p => ({ ...p, [slug]: data as any }));
    }
    setView({ k: "ler", slug });
  };

  const header = (titulo: string, back?: () => void) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
      <button type="button" onClick={back ?? onClose} aria-label={back ? "Voltar" : "Voltar ao Command Center"} style={{ ...btn(), padding: "4px 10px" }}>{back ? "←" : "← COMMAND CENTER"}</button>
      <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 20, color: C.white, letterSpacing: 1, flex: 1, minWidth: 140 }}>{titulo}</div>
      <span style={{ fontFamily: F.m, fontSize: 10, color: C.gold }}>{nDom} DOMINADOS · {nConcl} CONCLUÍDOS · {xp} XP</span>
    </div>
  );
  const home = () => setView({ k: "home" });

  // Busca
  const q = busca.trim();
  const resultados = q.length < 2 ? null : {
    caps: caps.filter(c => (c.titulo + " " + textoDosBlocos(c.blocos)).toLowerCase().includes(q.toLowerCase())),
    gl: caps.flatMap(c => c.glossario.filter(g => (g.termo + " " + g.definicao).toLowerCase().includes(q.toLowerCase())).map(g => ({ ...g, cap: c.slug }))),
    nt: notas.filter(n => ((n.trecho ?? "") + " " + (n.texto ?? "")).toLowerCase().includes(q.toLowerCase())),
  };
  const recorrentes = Object.entries(erros.filter(e => e.status !== "superado").reduce((acc, e) => { acc[e.regra] ??= { n: 0, lesson: e.lesson_slug }; acc[e.regra].n++; return acc; }, {} as Record<string, { n: number; lesson: string | null }>)).sort((a, b) => b[1].n - a[1].n).slice(0, 3);

  return (
    <div ref={scrollRef} role="dialog" aria-label="Biblioteca GRAVITAS" className={view.k === "ler" ? "bk-reader" : "bk-root"} style={{ position: "fixed", inset: 0, zIndex: 10000, overflowY: "auto", color: C.text }}>
      <style>{CSS}</style>
      {view.k === "ler" ? (() => {
        const cap = caps.find(c => c.slug === view.slug);
        if (!cap) return null;
        const i = capsOrd.findIndex(c => c.slug === cap.slug);
        return <Leitor key={cap.slug} cap={cap} uid={uid} prog={prog[cap.slug]} notas={notas.filter(n => n.chapter_slug === cap.slug)} scrollEl={scrollRef}
          plan={plan} onDica={() => savePlan({ dicas_vistas: { ...plan.dicas_vistas, anotar: true } })}
          prev={capsOrd[i - 1] ?? null} next={capsOrd[i + 1] ?? null} onAbrir={abrir} onVoltar={home} onTreinos={onTreinos} onClose={onClose}
          setProgLocal={(p) => setProg(x => ({ ...x, [cap.slug]: { ...(x[cap.slug] ?? {} as Prog), ...p } as Prog }))}
          onNota={(n) => setNotas(x => [...x, n])} reload={load} />;
      })() : (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
          {view.k === "home" && <>
            {header("BIBLIOTECA GRAVITAS")}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <button type="button" style={btn()} onClick={() => onTreinos("home")}>TREINOS RÁPIDOS</button>
              <button type="button" style={btn()} onClick={() => setView({ k: "ritmo" })}>RITMO DE ESTUDO</button>
            </div>
            <P>
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar no livro, no glossário e nas minhas notas" aria-label="Buscar no livro" style={{ ...ta, minHeight: 0 }} />
              {resultados && <div style={{ marginTop: 8, fontFamily: F.m, fontSize: 11 }}>
                {!resultados.caps.length && !resultados.gl.length && !resultados.nt.length && <div style={{ color: C.muted }}>Nada encontrado.</div>}
                {resultados.caps.map(c => <button key={c.slug} type="button" className="bk-row" onClick={() => abrir(c.slug)}>CAPÍTULO · <Hl t={c.titulo} q={q} /> {(() => { const t = textoDosBlocos(c.blocos); const k = t.toLowerCase().indexOf(q.toLowerCase()); return k >= 0 ? <span style={{ color: C.muted }}>… <Hl t={t.slice(Math.max(0, k - 40), k + 60)} q={q} />…</span> : null; })()}</button>)}
                {resultados.gl.map((g, j) => <div key={j} className="bk-row">GLOSSÁRIO · <b><Hl t={g.termo} q={q} /></b>: <Hl t={g.definicao} q={q} /></div>)}
                {resultados.nt.map(n => <button key={n.id} type="button" className="bk-row" onClick={() => abrir(n.chapter_slug)}>NOTA · <Hl t={(n.trecho ?? "") + (n.texto ? ` — ${n.texto}` : "")} q={q} /></button>)}
              </div>}
            </P>
            <P style={{ borderColor: `${C.gold}66` }}>
              <div style={lbl(C.gold)}>Continuar de onde parou</div>
              {continuar ? <>
                <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 18, color: C.white }}>{continuar.titulo}</div>
                <div style={{ fontFamily: F.m, fontSize: 10, margin: "4px 0 8px" }}>{prog[continuar.slug].progresso_pct}% lido · faltam ~{Math.max(1, Math.ceil((continuar.tempo_leitura_min ?? tempoLeitura(continuar.blocos)) * (1 - prog[continuar.slug].progresso_pct / 100)))} min</div>
                <button type="button" style={btn(true)} onClick={() => abrir(continuar.slug)}>CONTINUAR</button>
              </> : <button type="button" style={btn(true)} onClick={() => abrir(capsOrd[0]?.slug ?? "c0-como-estudar-aqui")}>{nConcl ? "ESCOLHER NO LIVRO" : "COMEÇAR PELO CAPÍTULO 0"}</button>}
            </P>
            <P>
              <div style={lbl()}>Hoje</div>
              <button type="button" className="bk-row" onClick={() => vencidos.length && setView({ k: "revisao" })}><span style={{ color: vencidos.length ? C.amber : C.muted }}>1 · Revisões vencidas: {vencidos.length}</span>{vencidos.length > 0 && <span style={{ marginLeft: "auto", fontFamily: F.m, fontSize: 10, color: C.cyan }}>REVISAR →</span>}</button>
              <button type="button" className="bk-row" onClick={() => proximoNovo && abrir(proximoNovo.slug)}><span>2 · Capítulo novo: {proximoNovo ? proximoNovo.titulo : "nenhum disponível"}</span>{proximoNovo && <span style={{ marginLeft: "auto", fontFamily: F.m, fontSize: 10, color: ritmo({ jaIniciado: false, novosHoje, limite: plan.novos_por_dia, revisoesVencidas: vencidos.length }).liberado ? C.cyan : C.muted }}>{ritmo({ jaIniciado: false, novosHoje, limite: plan.novos_por_dia, revisoesVencidas: vencidos.length }).liberado ? "LER →" : "TRAVADO"}</span>}</button>
              <button type="button" className="bk-row" onClick={() => onTreinos("home")}>3 · Treino de 60s <span style={{ marginLeft: "auto", fontFamily: F.m, fontSize: 10, color: C.cyan }}>TREINAR →</span></button>
            </P>
            <div style={{ ...lbl(), marginTop: 6 }}>O Livro</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10, marginBottom: 10 }}>
              {[...mods].sort((a, b) => a.ordem - b.ordem).map(m => {
                const cs = caps.filter(c => c.modulo_slug === m.slug); const pub = m.status === "publicado";
                const pct = cs.length ? (cs.filter(c => prog[c.slug]?.concluido).length / cs.length) * 100 : 0;
                return <div key={m.slug} className="bk-p" style={{ opacity: pub ? 1 : 0.5, margin: 0, cursor: pub ? "pointer" : "default", background: "linear-gradient(160deg,#0b0f18,#05070d)" }}
                  role={pub ? "button" : undefined} tabIndex={pub ? 0 : -1} onClick={() => pub && setView({ k: "mod", slug: m.slug })} onKeyDown={e => pub && e.key === "Enter" && setView({ k: "mod", slug: m.slug })}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className="bk-num" style={{ fontSize: 56 }}>{m.ordem}</span>
                    {pub ? <Ring pct={pct} /> : <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted, border: `1px solid ${C.muted}`, padding: "2px 6px" }}>EM BREVE</span>}
                  </div>
                  <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 17, color: C.white, marginTop: 4 }}>{m.titulo}</div>
                  <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted }}>{m.subtitulo}</div>
                  <div style={{ fontFamily: F.m, fontSize: 9, color: C.cyan, marginTop: 6 }}>{pub ? cs.length : m.capitulos_planejados.length} CAPÍTULOS{pub ? "" : " PLANEJADOS"}</div>
                  {!pub && <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontFamily: F.m, fontSize: 10, color: C.muted }}>{m.capitulos_planejados.map(t => <li key={t}>{t}</li>)}</ul>}
                </div>;
              })}
            </div>
            <P>
              <div style={lbl()}>Meu progresso</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8, fontFamily: F.m, fontSize: 10 }}>
                {[["Concluídos", nConcl], ["Dominados", nDom], ["Cartões revisados na semana", semana], ["Dias seguidos", dias], ["Tempo lendo", `${Math.round(tempoTotal / 60)} min`]].map(([k, v]) =>
                  <div key={k as string}><div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 22, color: C.white }}>{v}</div>{k}</div>)}
              </div>
              <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 6 }}>Tempo conta só com a aba aberta e com rolagem ou toque no último minuto.</div>
            </P>
            <P>
              <div style={lbl()}>Caderno</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" style={btn()} onClick={() => setView({ k: "notas" })}>MINHAS NOTAS ({notas.length})</button>
                <button type="button" style={btn()} onClick={() => setView({ k: "glossario" })}>GLOSSÁRIO</button>
                <button type="button" style={btn()} onClick={() => onTreinos("erros")}>MEUS ERROS</button>
              </div>
              {recorrentes.length > 0 && <div style={{ marginTop: 8, fontFamily: F.m, fontSize: 10 }}>
                <div style={lbl(C.red)}>Erros recorrentes</div>
                {recorrentes.map(([regra, v]) => { const cp = capituloDaAula(v.lesson, caps); return <div key={regra} className="bk-row">{regra} · {v.n}× {cp ? <button type="button" style={{ ...btn(), padding: "2px 8px", marginLeft: "auto" }} onClick={() => abrir(cp.slug)}>CAPÍTULO: {cp.titulo}</button> : <span style={{ marginLeft: "auto", color: C.muted }}>sem capítulo ainda</span>}</div>; })}
              </div>}
            </P>
          </>}

          {view.k === "ritmo" && <>{header("RITMO DE ESTUDO", home)}
            <P>
              <div style={lbl()}>Capítulos novos por dia</div>
              <div style={{ display: "flex", gap: 8 }}>{[1, 2].map(n => <button key={n} type="button" style={btn(plan.novos_por_dia === n)} onClick={() => savePlan({ novos_por_dia: n })}>{n}</button>)}</div>
              <div style={{ ...lbl(), marginTop: 12 }}>Horário de estudo</div>
              <input type="time" value={plan.hora_estudo?.slice(0, 5) ?? ""} onChange={e => savePlan({ hora_estudo: e.target.value || null })} style={{ ...ta, minHeight: 0, width: 140 }} aria-label="Horário de estudo" />
              <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, marginTop: 10 }}>Liberações antecipadas registradas: {plan.liberacoes.length}</div>
            </P>
          </>}

          {view.k === "mod" && (() => {
            const m = mods.find(x => x.slug === view.slug)!; const cs = capsOrd.filter(c => c.modulo_slug === m.slug);
            const todos = cs.length > 0 && cs.every(c => prog[c.slug]?.concluido);
            const ult = cs.map(c => prog[c.slug]?.concluido_em).filter(Boolean).sort().pop() ?? null;
            const pv = estadoProva(todos, ult);
            const ex = exams.filter(e => e.modulo_slug === m.slug); const melhor = ex.length ? Math.max(...ex.map(e => e.nota)) : null;
            const pj = projs[m.slug]; const selo = seloModulo(melhor, pj?.status === "entregue");
            const ultEx = ex[ex.length - 1] ?? null;
            const refazer = !ultEx || provaAprovada(ultEx.nota) || podeRefazerProva(ultEx.created_at);
            return <>{header(`MÓDULO ${m.ordem}`, home)}
              <P><div style={{ display: "flex", gap: 12, alignItems: "center" }}><span className="bk-num" style={{ fontSize: 64 }}>{m.ordem}</span><div><div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 22, color: C.white }}>{m.titulo}</div><div style={{ fontFamily: F.m, fontSize: 11 }}>{m.descricao}</div></div></div></P>
              <P>
                <div style={lbl()}>Capítulos</div>
                {cs.map(c => { const e = estado(c.slug); return <button key={c.slug} type="button" className="bk-row" onClick={() => abrir(c.slug)}>
                  <span className="bk-num" style={{ fontSize: 22, width: 28 }}>{c.ordem}</span><span style={{ flex: 1 }}>{c.titulo}</span>
                  <span style={{ fontFamily: F.m, fontSize: 9, color: ESTADO_COR[e] }}>{e.toUpperCase()}</span></button>; })}
              </P>
              <P>
                <div style={lbl()}>Prova do módulo</div>
                {!pv.visivel ? <div style={{ fontFamily: F.m, fontSize: 11 }}>Aparece quando todos os capítulos estiverem concluídos.</div> : <>
                  {melhor != null && <div style={{ fontFamily: F.m, fontSize: 11, marginBottom: 6 }}>Melhor nota: {melhor} · {ex.length} tentativa(s)</div>}
                  {!refazer ? <div style={{ fontFamily: F.m, fontSize: 11, color: C.amber }}>Nova tentativa liberada 24h depois da última.</div>
                    : pv.pronta ? <button type="button" style={btn(true)} onClick={() => setView({ k: "prova", slug: m.slug })}>FAZER PROVA</button>
                      : <><div style={{ fontFamily: F.m, fontSize: 11, marginBottom: 6 }}>O ideal é esperar 2 dias depois do último capítulo.</div><button type="button" style={btn()} onClick={() => { void registrarUso("prova", m.slug); setView({ k: "prova", slug: m.slug }); }}>FAZER AGORA</button></>}
                </>}
              </P>
              <P>
                <div style={lbl()}>Projeto do módulo</div>
                {m.projeto ? <button type="button" style={btn()} onClick={() => setView({ k: "projeto", slug: m.slug })}>{pj?.status === "entregue" ? "VER ENTREGA" : "ABRIR PROJETO"}</button>
                  : <div style={{ fontFamily: F.m, fontSize: 11, color: C.muted }}>Projeto deste módulo ainda não definido.</div>}
              </P>
              <P style={{ borderColor: selo ? `${C.gold}88` : undefined }}>
                <div style={lbl(C.gold)}>Selo do módulo</div>
                <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 16, color: selo ? C.gold : C.muted }}>{selo ? "CONQUISTADO" : "Prova aprovada + projeto entregue"}</div>
                <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 4 }}>{SELO_TEXTO}</div>
              </P>
            </>;
          })()}

          {view.k === "revisao" && <>{header("REVISÃO", home)}<Revisao uid={uid} fila={vencidos} caps={caps} onDone={load} onAbrir={abrir} /></>}

          {view.k === "notas" && <>{header("MINHAS NOTAS", home)}
            <P>
              <button type="button" style={btn(true)} disabled={!notas.length} onClick={() => baixar("minhas-notas.md", notasMarkdown(notas, titulos))}>BAIXAR MINHAS NOTAS (.MD)</button>
              {!notas.length && <div style={{ fontFamily: F.m, fontSize: 11, marginTop: 8 }}>Nenhuma nota ainda. Selecione um trecho no leitor para anotar.</div>}
              {caps.filter(c => notas.some(n => n.chapter_slug === c.slug)).map(c => <div key={c.slug} style={{ marginTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ fontFamily: F.t, fontWeight: 700, color: C.white, flex: 1 }}>{c.titulo}</div>
                  <button type="button" style={{ ...btn(), padding: "3px 8px" }} onClick={() => baixar(`notas-${c.slug}.md`, notasMarkdown(notas.filter(n => n.chapter_slug === c.slug), titulos))}>.MD</button></div>
                {notas.filter(n => n.chapter_slug === c.slug).map(n => <div key={n.id} className="bk-row" style={{ flexDirection: "column", alignItems: "flex-start", cursor: "default" }}>
                  <span style={{ fontFamily: F.m, fontSize: 9, color: n.tipo === "duvida" ? C.amber : n.tipo === "destaque" ? C.cyan : C.green }}>{n.tipo === "duvida" ? "DÚVIDA" : n.tipo === "destaque" ? "MARCAÇÃO" : "NOTA"}</span>
                  {n.trecho && <span style={{ fontFamily: F.s, fontStyle: "italic" }}>“{n.trecho}”</span>}
                  {n.texto && <span style={{ fontFamily: F.m, fontSize: 11 }}>{n.texto}</span>}
                </div>)}
              </div>)}
            </P>
          </>}

          {view.k === "glossario" && <>{header("GLOSSÁRIO", home)}
            <P>{caps.flatMap(c => c.glossario.map(g => ({ ...g, cap: c.titulo }))).sort((a, b) => a.termo.localeCompare(b.termo)).map(g =>
              <div key={g.termo + g.cap} className="bk-row" style={{ flexDirection: "column", alignItems: "flex-start", cursor: "default" }}>
                <b style={{ fontFamily: F.t, color: C.white, fontSize: 15 }}>{g.termo}</b><span style={{ fontFamily: F.m, fontSize: 11 }}>{g.definicao}</span><span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{g.cap}</span></div>)}</P>
          </>}

          {view.k === "prova" && <>{header("PROVA DO MÓDULO", () => setView({ k: "mod", slug: view.slug }))}
            <Prova uid={uid} modulo={mods.find(m => m.slug === view.slug)!} mods={mods} caps={capsOrd} exams={exams.filter(e => e.modulo_slug === view.slug)} onDone={async () => { await load(); }} onAbrir={abrir} /></>}

          {view.k === "projeto" && <>{header("PROJETO DO MÓDULO", () => setView({ k: "mod", slug: view.slug }))}
            <Projeto uid={uid} modulo={mods.find(m => m.slug === view.slug)!} atual={projs[view.slug]} onSaved={load} /></>}
        </div>
      )}

      {trava && <div role="alertdialog" aria-label="Ritmo de estudo" style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 10001, display: "grid", placeItems: "center", padding: 16 }}>
        <div className="bk-p" style={{ maxWidth: 420, borderColor: `${C.amber}88` }}>
          <div style={lbl(C.amber)}>Ritmo de estudo</div>
          <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 17, color: C.white, marginBottom: 6 }}>{trava.motivo}</div>
          <div style={{ fontFamily: F.m, fontSize: 10, marginBottom: 10 }}>Capítulos novos hoje: {novosHoje}/{plan.novos_por_dia} · revisões vencidas: {vencidos.length}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {vencidos.length > 0 && <button type="button" style={btn(true)} onClick={() => { setTrava(null); setView({ k: "revisao" }); }}>REVISAR AGORA</button>}
            <button type="button" style={btn()} onClick={() => { const s = trava.slug; setTrava(null); void registrarUso("capitulo", s); void iniciar(s); }}>LIBERAR MESMO ASSIM</button>
            <button type="button" style={{ ...btn(), borderColor: C.line, color: C.muted }} onClick={() => setTrava(null)}>FECHAR</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

/* ───────────── LEITOR ───────────── */
function Leitor({ cap, uid, prog, notas, scrollEl, plan, onDica, prev, next, onAbrir, onVoltar, onTreinos, onClose, setProgLocal, onNota, reload }: {
  cap: Cap; uid: string | null; prog?: Prog; notas: NotaT[]; scrollEl: React.RefObject<HTMLDivElement>; plan: Plan; onDica: () => void;
  prev: Cap | null; next: Cap | null; onAbrir: (s: string) => void; onVoltar: () => void; onTreinos: (a: TreinoAlvo) => void; onClose: () => void;
  setProgLocal: (p: Partial<Prog>) => void; onNota: (n: NotaT) => void; reload: () => Promise<void>;
}) {
  const tempoMin = cap.tempo_leitura_min ?? tempoLeitura(cap.blocos);
  const [pct, setPct] = useState(prog?.progresso_pct ?? 0);
  const [seg, setSeg] = useState(prog?.tempo_lendo_seg ?? 0);
  const [bloco, setBloco] = useState(prog?.bloco_atual ?? 0);
  const [toc, setToc] = useState(false);
  const [etapa, setEtapa] = useState<"ler" | "recordar" | "checkpoint" | "aplicar" | "fim">(prog?.concluido ? "ler" : prog?.recall_feito ? (prog.quiz_score != null && quizPassou(prog.quiz_score, 100) ? "aplicar" : "checkpoint") : "ler");
  const [sel, setSel] = useState<{ texto: string; bloco: number } | null>(null);
  const [notaTxt, setNotaTxt] = useState<string | null>(null);
  const [duvidaSalva, setDuvidaSalva] = useState(false);
  const lastI = useRef(Date.now());
  const st = useRef({ pct, seg, bloco }); st.current = { pct, seg, bloco };
  const [vis, setVis] = useState<Set<number>>(new Set());
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const salvar = async (extra: Record<string, unknown> = {}) => {
    if (!uid) return;
    const row = { user_id: uid, chapter_slug: cap.slug, progresso_pct: Math.round(st.current.pct), bloco_atual: st.current.bloco, tempo_lendo_seg: st.current.seg, ultimo_acesso: new Date().toISOString(), ...extra };
    setProgLocal(row as any);
    await supabase.from("chapter_progress").upsert(row as any, { onConflict: "user_id,chapter_slug" });
  };
  // Leitura ativa + posição
  useEffect(() => {
    const el = scrollEl.current; if (!el) return;
    const mark = () => { lastI.current = Date.now(); };
    const onScroll = () => {
      mark();
      const max = el.scrollHeight - el.clientHeight; const p = max > 0 ? (el.scrollTop / max) * 100 : 100;
      setPct(x => Math.max(x, Math.min(100, Math.round(p))));
      const bs = el.querySelectorAll<HTMLElement>("[data-b]"); let cur = 0;
      bs.forEach(b => { if (b.getBoundingClientRect().top < window.innerHeight * 0.5) cur = Number(b.dataset.b); });
      setBloco(cur);
    };
    el.addEventListener("scroll", onScroll, { passive: true }); el.addEventListener("touchstart", mark, { passive: true }); el.addEventListener("pointerdown", mark); window.addEventListener("keydown", mark);
    const tick = setInterval(() => { if (leituraAtiva(document.visibilityState === "visible", lastI.current)) setSeg(s => s + 1); }, 1000);
    const save = setInterval(() => void salvar(), 15000);
    // restaura posição
    setTimeout(() => { const t = el.querySelector<HTMLElement>(`[data-b="${prog?.bloco_atual ?? 0}"]`); if (t && (prog?.bloco_atual ?? 0) > 0) t.scrollIntoView(); }, 120);
    return () => { el.removeEventListener("scroll", onScroll); el.removeEventListener("touchstart", mark); el.removeEventListener("pointerdown", mark); window.removeEventListener("keydown", mark); clearInterval(tick); clearInterval(save); void salvar(); window.speechSynthesis?.cancel(); };
  }, []);
  // Entrada suave
  useEffect(() => {
    if (reduced || typeof IntersectionObserver === "undefined") { setVis(new Set(cap.blocos.map((_, i) => i))); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setVis(v => new Set(v).add(Number((e.target as HTMLElement).dataset.b))); }), { threshold: 0.1 });
    scrollEl.current?.querySelectorAll("[data-b]").forEach(b => io.observe(b)); return () => io.disconnect();
  }, [etapa]);

  const lido = capituloLido(pct, seg, tempoMin);
  // Glossário: primeiro uso de cada termo no capítulo
  const usados = new Set<string>();
  const comGlossario = (texto: string, key: string) => {
    const out: React.ReactNode[] = []; let rest = texto; let k = 0;
    for (;;) {
      let best: { i: number; g: { termo: string; definicao: string } } | null = null;
      for (const g of cap.glossario) { if (usados.has(g.termo)) continue; const i = rest.toLowerCase().indexOf(g.termo.toLowerCase()); if (i >= 0 && (!best || i < best.i)) best = { i, g }; }
      if (!best) break;
      usados.add(best.g.termo);
      out.push(rest.slice(0, best.i)); out.push(<Termo key={`${key}-${k++}`} t={rest.slice(best.i, best.i + best.g.termo.length)} d={best.g.definicao} />);
      rest = rest.slice(best.i + best.g.termo.length);
    }
    out.push(rest); return out;
  };
  const secoes = cap.blocos.map((b, i) => ({ i, t: b.tipo === "destaque" ? "Em uma frase" : b.tipo === "cuidado" ? "Cuidado" : b.tipo === "pausa" ? "Pare e pense" : b.tipo === "exercicio" ? "Pratique" : b.tipo === "tabela" ? b.titulo : b.tipo === "analise" ? b.titulo : b.tipo === "fraco_forte" ? "Fraco × Forte" : String(b.texto ?? "").split(/\s+/).slice(0, 6).join(" ") + "…" }));
  const irPara = (i: number) => { setToc(false); scrollEl.current?.querySelector<HTMLElement>(`[data-b="${i}"]`)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); };

  const onSelecao = () => {
    const s = window.getSelection(); const t = s?.toString().trim() ?? "";
    if (t.length < 3) return;
    const node = s?.anchorNode instanceof Element ? s.anchorNode : s?.anchorNode?.parentElement;
    const b = Number(node?.closest?.("[data-b]")?.getAttribute("data-b") ?? 0);
    setSel({ texto: t.slice(0, 500), bloco: b }); setDuvidaSalva(false); setNotaTxt(null);
  };
  const salvarNota = async (tipo: NotaT["tipo"], texto: string | null) => {
    if (!uid || !sel) { toast.error("Entre na sua conta para salvar."); return; }
    const { data, error } = await supabase.from("chapter_notes").insert({ user_id: uid, chapter_slug: cap.slug, bloco_idx: sel.bloco, tipo, trecho: sel.texto, texto } as any).select().single();
    if (error) { toast.error("Não foi possível salvar."); return; }
    onNota(data as any);
    if (!plan.dicas_vistas.anotar) { toast("Marcar ajuda a achar o trecho depois. O que fixa é se testar sem olhar. Use as perguntas do capítulo.", { duration: 8000 }); onDica(); }
    if (tipo === "duvida") setDuvidaSalva(true); else setSel(null);
    setNotaTxt(null); toast.success(tipo === "duvida" ? "Dúvida salva" : tipo === "destaque" ? "Trecho marcado" : "Nota salva");
  };

  const fim = () => { void salvar(); scrollEl.current?.scrollTo({ top: 0 }); };

  return <div onMouseUp={onSelecao} onTouchEnd={() => setTimeout(onSelecao, 50)}>
    <div style={{ position: "sticky", top: 0, zIndex: 4, background: "#05070dee", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ height: 3, background: C.cyan, width: `${pct}%`, transition: reduced ? "none" : "width .2s" }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso de leitura" />
      <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "6px 12px", flexWrap: "wrap" }}>
        <button type="button" style={{ ...btn(), padding: "3px 10px" }} onClick={() => { void salvar(); onVoltar(); }} aria-label="Voltar à Biblioteca">← BIBLIOTECA</button>
        <button type="button" className="bk-toc-m" style={{ ...btn(), padding: "3px 10px" }} onClick={() => setToc(t => !t)}>ÍNDICE</button>
        <Escuta cap={cap} />
        <span style={{ marginLeft: "auto", fontFamily: F.m, fontSize: 9, color: C.muted }}>{pct}% · {Math.floor(seg / 60)} min ativos</span>
      </div>
      {toc && <div style={{ padding: "6px 12px 10px", maxHeight: "50vh", overflow: "auto" }}>{secoes.map(s => <button key={s.i} type="button" className="bk-row" style={{ fontFamily: F.m, fontSize: 11 }} onClick={() => irPara(s.i)}>{s.t}</button>)}</div>}
    </div>

    <div className="bk-lay" style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 16px 120px" }}>
      <nav className="bk-toc-d" aria-label="Índice do capítulo">
        <div style={lbl()}>Índice</div>
        {secoes.map(s => <button key={s.i} type="button" className="bk-row" onClick={() => irPara(s.i)} style={{ fontFamily: F.m, fontSize: 10, color: bloco === s.i ? C.cyan : C.text }}>{s.t}</button>)}
      </nav>
      <article className="bk-col">
        {etapa === "ler" && <>
          <header style={{ marginBottom: 28 }}>
            <div className="bk-num" style={{ fontSize: 96 }}>{cap.ordem}</div>
            <h1 style={{ fontFamily: F.t, fontWeight: 700, fontSize: 34, lineHeight: 1.1, color: C.white, margin: "4px 0 12px" }}>{cap.titulo}</h1>
            {cap.pergunta_guia && <p style={{ borderLeft: `3px solid ${C.cyan}`, paddingLeft: 12, fontStyle: "italic", color: C.white, margin: "0 0 12px" }}>{cap.pergunta_guia}</p>}
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}><span style={{ fontFamily: F.m, fontSize: 10, color: C.muted }}>{tempoMin} MIN DE LEITURA</span><Selo n={cap.nivel_fonte} /></div>
          </header>
          {cap.blocos.map((b, i) => <section key={i} data-b={i} className={`bk-blk bk-rv${vis.has(i) ? " on" : ""}`}>
            <Bloco b={b} i={i} gl={(t) => comGlossario(t, `g${i}`)} uid={uid} cap={cap} />
          </section>)}
          {cap.fontes.length > 0 && <section style={{ marginTop: 28, fontFamily: F.m, fontSize: 11, lineHeight: 1.6 }}>
            <div style={lbl()}>Fontes</div>
            {cap.fontes.map((f, j) => <div key={j} style={{ marginBottom: 8 }}>
              <span style={{ color: f.tipo === "primaria" ? C.green : f.tipo === "classica" ? C.lilac : C.amber }}>[{f.tipo === "primaria" ? "PRIMÁRIA" : f.tipo === "classica" ? "CLÁSSICA" : "SECUNDÁRIA"}]</span> {f.link ? <a href={f.link} target="_blank" rel="noreferrer" style={{ color: C.cyan }}>{f.referencia}</a> : f.referencia}
              {f.observacao && <div style={{ color: C.muted }}>{f.observacao}</div>}
            </div>)}
          </section>}
          {cap.relacionadas.some(s => (lessonsSeed as any[]).some(x => x.slug === s)) && <section style={{ marginTop: 20 }}>
            <div style={lbl()}>Treinos relacionados</div>
            {cap.relacionadas.map(s => { const l = (lessonsSeed as any[]).find(x => x.slug === s); if (!l) return null; return <button key={s} type="button" className="bk-row" style={{ fontFamily: F.m, fontSize: 11 }} onClick={() => onTreinos({ aula: s, capSlug: cap.slug, capTitulo: cap.titulo })}>{l.titulo} →</button>; })}
          </section>}
          <div className="bk-p" style={{ marginTop: 28, fontFamily: F.m, fontSize: 11 }}>
            {prog?.concluido ? <div style={{ color: C.green }}>Capítulo concluído. Você pode reler quando quiser.</div> : <>
              <div style={lbl()}>Terminou de ler?</div>
              <div style={{ marginBottom: 8 }}>Conta como lido com 90% de rolagem ({pct}%) e ao menos {Math.ceil(tempoMin / 2)} min de leitura ativa ({Math.floor(seg / 60)} min).</div>
              <button type="button" style={btn(true, !lido)} disabled={!lido} onClick={() => { setEtapa(prog?.recall_feito ? "checkpoint" : "recordar"); fim(); }}>RECORDAR →</button>
            </>}
          </div>
          <nav style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 16 }} aria-label="Capítulos">
            {prev ? <button type="button" style={btn()} onClick={() => { void salvar(); onAbrir(prev.slug); }}>← {prev.titulo}</button> : <span />}
            {next ? <button type="button" style={btn()} onClick={() => { void salvar(); onAbrir(next.slug); }}>{next.titulo} →</button> : <span />}
          </nav>
        </>}
        {etapa === "recordar" && <Recordar cap={cap} onOk={async (texto) => { await salvar({ recall_texto: texto, recall_feito: true }); setEtapa("checkpoint"); fim(); }} />}
        {etapa === "checkpoint" && <Checkpoint cap={{ ...cap, quiz: questoesCheckpoint(cap.quiz as any[]) }} onReler={(i) => { setEtapa("ler"); setTimeout(() => irPara(i), 150); }}
          onOk={async (score) => { await salvar({ quiz_score: score }); setEtapa("aplicar"); fim(); }} onScore={(s) => void salvar({ quiz_score: s })} />}
        {etapa === "aplicar" && <Aplicar cap={cap} feito={!!prog?.aplique_feito} onTreinos={onTreinos} onClose={onClose}
          onFiz={(v) => void salvar({ aplique_feito: v })}
          onConcluir={async () => {
            if (!uid) return;
            await salvar({ concluido: true, concluido_em: new Date().toISOString() });
            const rows = cartoesIniciais(cap.flashcards.length).map(c => ({ ...c, user_id: uid, chapter_slug: cap.slug }));
            if (rows.length) await supabase.from("flashcard_state").upsert(rows as any, { onConflict: "user_id,chapter_slug,card_idx", ignoreDuplicates: true });
            toast.success(`Capítulo concluído · +10 XP · ${rows.length} cartões para revisar amanhã`);
            await reload(); setEtapa("fim"); fim();
          }} />}
        {etapa === "fim" && <div className="bk-p" style={{ fontFamily: F.m, fontSize: 12 }}>
          <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 24, color: C.green }}>CAPÍTULO CONCLUÍDO</div>
          <p>{cap.flashcards.length} cartões entram na revisão amanhã. Volte para revisar antes do próximo capítulo.</p>
          <button type="button" style={btn(true)} onClick={onVoltar}>VOLTAR À BIBLIOTECA</button>
        </div>}
      </article>
    </div>

    {sel && etapa === "ler" && <div role="toolbar" aria-label="Anotar trecho" onMouseUp={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}
      style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 6, background: "#0a0f18", borderTop: `1px solid ${C.cyan}66`, padding: 10 }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: F.s, fontStyle: "italic", fontSize: 14, color: C.white, marginBottom: 6, maxHeight: 48, overflow: "hidden" }}>“{sel.texto}”</div>
        {duvidaSalva ? <div style={{ fontFamily: F.m, fontSize: 11 }}>Dúvida salva em Minhas notas. <button type="button" style={{ ...btn(), padding: "3px 8px" }} onClick={() => setSel(null)}>OK</button></div>
          : notaTxt != null ? <div style={{ display: "flex", gap: 6 }}><input autoFocus value={notaTxt} onChange={e => setNotaTxt(e.target.value)} placeholder="Sua nota" style={{ ...ta, minHeight: 0 }} aria-label="Sua nota" /><button type="button" style={btn(true)} onClick={() => salvarNota("nota", notaTxt.trim() || null)}>SALVAR</button></div>
            : <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button type="button" style={btn()} onClick={() => setNotaTxt("")}>ANOTAR</button>
              <button type="button" style={btn()} onClick={() => salvarNota("destaque", null)}>MARCAR</button>
              <button type="button" style={btn()} onClick={() => salvarNota("duvida", null)}>DÚVIDA</button>
              <button type="button" style={{ ...btn(), borderColor: C.line, color: C.muted }} onClick={() => setSel(null)}>FECHAR</button>
            </div>}
      </div>
    </div>}
    {notas.length > 0 && etapa === "ler" && !sel && <div style={{ position: "fixed", right: 12, bottom: 12, zIndex: 5 }}>
      <button type="button" style={{ ...btn(), background: "#05070d" }} onClick={() => baixar(`notas-${cap.slug}.md`, notasMarkdown(notas, { [cap.slug]: cap.titulo }))}>BAIXAR NOTAS ({notas.length})</button>
    </div>}
  </div>;
}

function Termo({ t, d }: { t: string; d: string }) {
  const [on, setOn] = useState(false);
  return <span className="bk-gl" tabIndex={0} role="button" aria-label={`${t}: ${d}`} onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)} onFocus={() => setOn(true)} onBlur={() => setOn(false)} onClick={() => setOn(o => !o)}>{t}{on && <span className="tip" role="tooltip">{d}</span>}</span>;
}

function Bloco({ b, i, gl, uid, cap }: { b: any; i: number; gl: (t: string) => React.ReactNode; uid: string | null; cap: Cap }) {
  const caixa = (cor: string, titulo: string, corpo: React.ReactNode) => <div style={{ border: `1px solid ${cor}66`, background: `${cor}0d`, padding: "12px 14px" }}><div style={{ ...lbl(cor), marginBottom: 4 }}>{titulo}</div>{corpo}</div>;
  switch (b.tipo) {
    case "texto": return <p style={{ margin: 0 }}>{gl(b.texto)}</p>;
    case "destaque": return caixa(C.cyan, "Em uma frase", <p style={{ margin: 0, fontWeight: 600, color: C.white }}>{gl(b.texto)}</p>);
    case "cuidado": return caixa(C.amber, "Cuidado", <p style={{ margin: 0 }}>{gl(b.texto)}</p>);
    case "fraco_forte": return <div className="bk-ff">
      {caixa(C.red, "Fraco", <p style={{ margin: 0 }}>{b.fraco}</p>)}{caixa(C.green, "Forte", <p style={{ margin: 0 }}>{b.forte}</p>)}
      {b.porque && <p style={{ margin: 0, gridColumn: "1/-1", fontSize: 16 }}><b>Por quê:</b> {b.porque}</p>}</div>;
    case "tabela": return <div style={{ overflowX: "auto" }}>
      {b.titulo && <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 18, color: C.white, marginBottom: 6 }}>{b.titulo}</div>}
      <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: F.m, fontSize: 12, lineHeight: 1.5 }}>
        <thead><tr>{(b.colunas ?? []).map((c: string) => <th key={c} style={{ textAlign: "left", borderBottom: `1px solid ${C.cyan}66`, padding: 6, color: C.cyan }}>{c}</th>)}</tr></thead>
        <tbody>{(b.linhas ?? []).map((l: string[], j: number) => <tr key={j}>{l.map((c, k) => <td key={k} style={{ borderBottom: `1px solid ${C.line}`, padding: 6, color: k === 0 ? C.white : C.text }}>{c}</td>)}</tr>)}</tbody>
      </table></div>;
    case "analise": return <div>
      {b.titulo && <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 18, color: C.white, marginBottom: 6 }}>{b.titulo}</div>}
      <div className="bk-an">
        <p style={{ margin: 0 }}>{(b.trecho ?? []).map((t: any) => <span key={t.n}>{t.texto} <sup style={{ color: C.cyan, fontFamily: F.m }}>[{t.n}]</sup> </span>)}</p>
        <ol style={{ margin: 0, paddingLeft: 18, fontFamily: F.m, fontSize: 12, lineHeight: 1.6 }}>{(b.trecho ?? []).map((t: any) => <li key={t.n} value={t.n}>{t.nota}</li>)}</ol>
      </div></div>;
    case "pausa": return <Pausa b={b} />;
    case "exercicio": return <Exercicio b={b} i={i} uid={uid} cap={cap} />;
    default: return null;
  }
}

function Pausa({ b }: { b: any }) {
  const [t, setT] = useState(""); const [ver, setVer] = useState(false); const ok = podeVerResposta(t);
  return <div style={{ border: `1px solid ${C.lilac}66`, background: `${C.lilac}0d`, padding: "12px 14px" }}>
    <div style={lbl(C.lilac)}>Pare e pense</div>
    <p style={{ margin: "0 0 8px", color: C.white }}>{b.pergunta}</p>
    <textarea value={t} onChange={e => setT(e.target.value)} style={ta} aria-label="Sua resposta" placeholder="Escreva a sua resposta antes de ver" />
    {!ver ? <button type="button" style={{ ...btn(false, !ok), marginTop: 6 }} disabled={!ok} onClick={() => setVer(true)}>VER RESPOSTA</button> : <p style={{ margin: "8px 0 0", fontSize: 16 }}><b>Resposta:</b> {b.resposta}</p>}
    {!ok && <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 4 }}>Escreva pelo menos {PAUSA_MIN} palavras ({palavras(t)}/{PAUSA_MIN}).</div>}
  </div>;
}
function Exercicio({ b, i, uid, cap }: { b: any; i: number; uid: string | null; cap: Cap }) {
  const [t, setT] = useState(""); const [ok, setOk] = useState(false);
  return <div style={{ border: `1px solid ${C.gold}66`, background: `${C.gold}0d`, padding: "12px 14px" }}>
    <div style={lbl(C.gold)}>Pratique</div>
    <p style={{ margin: "0 0 8px", color: C.white }}>{b.texto}</p>
    <textarea value={t} onChange={e => setT(e.target.value)} style={ta} aria-label="Sua prática" />
    <button type="button" style={{ ...btn(true, !t.trim()), marginTop: 6 }} disabled={!t.trim() || !uid} onClick={async () => {
      const { error } = await supabase.from("chapter_notes").insert({ user_id: uid, chapter_slug: cap.slug, bloco_idx: i, tipo: "nota", trecho: `Pratique: ${b.texto}`.slice(0, 500), texto: t.trim() } as any);
      if (error) toast.error("Não foi possível salvar."); else { setOk(true); toast.success("Prática salva em Minhas notas"); }
    }}>SALVAR</button>{ok && <span style={{ fontFamily: F.m, fontSize: 10, color: C.green, marginLeft: 8 }}>salvo</span>}
  </div>;
}

function Escuta({ cap }: { cap: Cap }) {
  const ok = typeof window !== "undefined" && "speechSynthesis" in window;
  const [st, setSt] = useState<"parado" | "lendo" | "pausa">("parado"); const [vel, setVel] = useState(1);
  if (!ok) return null;
  const falar = () => {
    const s = window.speechSynthesis; s.cancel();
    const partes = [cap.titulo, cap.pergunta_guia ?? "", ...cap.blocos.map(b => b.tipo === "tabela" ? `${b.titulo ?? ""}. ${(b.linhas ?? []).map((l: string[]) => l.join(", ")).join(". ")}` : b.tipo === "pausa" ? `Pare e pense. ${b.pergunta}` : b.tipo === "fraco_forte" ? `Fraco: ${b.fraco}. Forte: ${b.forte}. ${b.porque ?? ""}` : b.tipo === "analise" ? (b.trecho ?? []).map((t: any) => t.texto).join(" ") : b.texto ?? "")].filter(Boolean);
    const voz = s.getVoices().find(v => v.lang?.toLowerCase().startsWith("pt-br")) ?? s.getVoices().find(v => v.lang?.startsWith("pt"));
    partes.forEach((p, i) => { const u = new SpeechSynthesisUtterance(p); u.lang = "pt-BR"; u.rate = vel; if (voz) u.voice = voz; if (i === partes.length - 1) u.onend = () => setSt("parado"); s.speak(u); });
    setSt("lendo");
  };
  return <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
    {st === "parado" && <button type="button" style={{ ...btn(), padding: "3px 10px" }} onClick={falar} aria-label="Ouvir capítulo">▶ OUVIR</button>}
    {st === "lendo" && <button type="button" style={{ ...btn(), padding: "3px 10px" }} onClick={() => { window.speechSynthesis.pause(); setSt("pausa"); }}>❚❚ PAUSAR</button>}
    {st === "pausa" && <button type="button" style={{ ...btn(), padding: "3px 10px" }} onClick={() => { window.speechSynthesis.resume(); setSt("lendo"); }}>▶ CONTINUAR</button>}
    {st !== "parado" && <button type="button" style={{ ...btn(), padding: "3px 8px" }} onClick={() => { window.speechSynthesis.cancel(); setSt("parado"); }} aria-label="Parar">■</button>}
    <select value={vel} onChange={e => { setVel(Number(e.target.value)); if (st !== "parado") { window.speechSynthesis.cancel(); setSt("parado"); } }} aria-label="Velocidade" style={{ background: "#0a0a12", color: C.cyan, border: `1px solid ${C.line}`, fontFamily: F.m, fontSize: 10 }}>
      {[0.8, 1, 1.25, 1.5].map(v => <option key={v} value={v}>{v}×</option>)}
    </select>
  </span>;
}

function Recordar({ cap, onOk }: { cap: Cap; onOk: (t: string) => Promise<void> }) {
  const [t, setT] = useState(""); const [conf, setConf] = useState(false); const [marc, setMarc] = useState<Set<number>>(new Set());
  const [crono, setCrono] = useState<number | null>(null);
  useEffect(() => { if (crono == null) return; const id = setInterval(() => setCrono(c => (c ?? 0) + 1), 1000); return () => clearInterval(id); }, [crono != null]);
  const pontos = [...cap.blocos.filter(b => b.tipo === "destaque").map(b => b.texto as string), ...cap.flashcards.map(f => `${f.frente} — ${f.verso}`)];
  const ok = recallValido(t);
  return <div style={{ fontFamily: F.m, fontSize: 13 }}>
    <div className="bk-p">
      <div style={lbl(C.gold)}>Recordar</div>
      <h2 style={{ fontFamily: F.t, fontWeight: 700, fontSize: 26, color: C.white, margin: "0 0 8px" }}>Feche o capítulo e escreva o que você lembra</h2>
      <div style={{ marginBottom: 8 }}>{crono == null ? <button type="button" style={{ ...btn(), padding: "3px 10px" }} onClick={() => setCrono(0)}>CRONÔMETRO</button> : <span style={{ color: C.cyan }}>{Math.floor(crono / 60)}:{String(crono % 60).padStart(2, "0")}</span>}</div>
      <textarea value={t} onChange={e => setT(e.target.value)} disabled={conf} style={{ ...ta, minHeight: 160, fontFamily: F.s, fontSize: 16 }} aria-label="O que você lembra" />
      <div style={{ fontSize: 10, color: ok ? C.green : C.muted, margin: "4px 0 8px" }}>{palavras(t)}/{RECALL_MIN} palavras</div>
      {!conf && <button type="button" style={btn(true, !ok)} disabled={!ok} onClick={() => setConf(true)}>CONFERIR</button>}
    </div>
    {conf && <div className="bk-p">
      <div style={lbl()}>Marque o que você lembrou</div>
      {pontos.map((p, i) => <label key={i} className="bk-row" style={{ cursor: "pointer" }}><input type="checkbox" checked={marc.has(i)} onChange={() => setMarc(m => { const n = new Set(m); n.has(i) ? n.delete(i) : n.add(i); return n; })} /> <span style={{ fontFamily: F.s, fontSize: 15 }}>{p}</span></label>)}
      <div style={{ margin: "8px 0", fontSize: 11 }}>Lembrou {marc.size} de {pontos.length}.</div>
      <button type="button" style={btn(true)} onClick={() => onOk(JSON.stringify({ texto: t, lembrados: [...marc], total: pontos.length }))}>IR PARA O CHECKPOINT →</button>
    </div>}
  </div>;
}

function Checkpoint({ cap, onOk, onScore, onReler }: { cap: Cap; onOk: (s: number) => Promise<void>; onScore: (s: number) => void; onReler: (i: number) => void }) {
  const [i, setI] = useState(0); const [resp, setResp] = useState<(number | null)[]>(cap.quiz.map(() => null)); const [fim, setFim] = useState(false);
  const q = cap.quiz[i];
  const acertos = resp.filter((r, k) => r === cap.quiz[k].correta).length;
  const score = cap.quiz.length ? Math.round((acertos / cap.quiz.length) * 100) : 100;
  const passou = quizPassou(acertos, cap.quiz.length) || !cap.quiz.length;
  const secaoDe = (k: number) => { // bloco com mais palavras em comum com a pergunta e a opção correta
    const alvo = new Set((cap.quiz[k].pergunta + " " + cap.quiz[k].opcoes[cap.quiz[k].correta]).toLowerCase().split(/\W+/).filter(w => w.length > 4));
    let best = 0, bi = 0; cap.blocos.forEach((b, j) => { const n = textoDosBlocos([b]).toLowerCase().split(/\W+/).filter(w => alvo.has(w)).length; if (n > best) { best = n; bi = j; } }); return bi;
  };
  if (!cap.quiz.length) return <div className="bk-p"><button type="button" style={btn(true)} onClick={() => onOk(100)}>CONTINUAR</button></div>;
  if (fim) return <div className="bk-p" style={{ fontFamily: F.m, fontSize: 12 }}>
    <div style={lbl()}>Checkpoint</div>
    <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 30, color: passou ? C.green : C.amber }}>{score}%</div>
    {passou ? <button type="button" style={btn(true)} onClick={() => onOk(score)}>APLICAR →</button> : <>
      <p>Para concluir, acerte 75% ou mais. Releia estas partes:</p>
      {cap.quiz.map((qq, k) => resp[k] !== qq.correta && <button key={k} type="button" className="bk-row" onClick={() => onReler(secaoDe(k))}>{qq.pergunta} → reler</button>)}
      <button type="button" style={{ ...btn(), marginTop: 8 }} onClick={() => { setResp(cap.quiz.map(() => null)); setI(0); setFim(false); }}>REFAZER</button>
    </>}
  </div>;
  return <div className="bk-p" style={{ fontFamily: F.m, fontSize: 13 }}>
    <div style={lbl()}>Checkpoint · {i + 1}/{cap.quiz.length}</div>
    <p style={{ fontFamily: F.s, fontSize: 18, color: C.white }}>{q.pergunta}</p>
    {q.opcoes.map((o, k) => { const r = resp[i]; const cor = r == null ? C.line : k === q.correta ? C.green : k === r ? C.red : C.line;
      return <button key={k} type="button" disabled={r != null} onClick={() => setResp(x => x.map((v, j) => j === i ? k : v))} style={{ display: "block", width: "100%", textAlign: "left", margin: "0 0 6px", padding: 10, background: "#0a0a12", border: `1px solid ${cor}`, color: C.text, fontFamily: F.m, fontSize: 12, cursor: r == null ? "pointer" : "default" }}>{o}</button>; })}
    {resp[i] != null && <><p style={{ fontSize: 12, color: resp[i] === q.correta ? C.green : C.amber }}>{resp[i] === q.correta ? "Certo. " : "Não. "}{q.explicacao}</p>
      <button type="button" style={btn(true)} onClick={() => { if (i + 1 < cap.quiz.length) setI(i + 1); else { setFim(true); onScore(score); } }}>{i + 1 < cap.quiz.length ? "PRÓXIMA" : "VER RESULTADO"}</button></>}
  </div>;
}

function Aplicar({ cap, feito, onFiz, onConcluir, onTreinos, onClose }: { cap: Cap; feito: boolean; onFiz: (v: boolean) => void; onConcluir: () => Promise<void>; onTreinos: (a: TreinoAlvo) => void; onClose: () => void }) {
  const [f, setF] = useState(feito); const [busy, setBusy] = useState(false); const a = cap.aplique;
  return <div className="bk-p" style={{ fontFamily: F.m, fontSize: 13 }}>
    <div style={lbl(C.gold)}>Aplicar</div>
    {a ? <>
      <h2 style={{ fontFamily: F.t, fontWeight: 700, fontSize: 24, color: C.white, margin: "0 0 8px" }}>{a.titulo}</h2>
      <ol style={{ fontFamily: F.s, fontSize: 16, lineHeight: 1.6 }}>{a.passos.map((p, i) => <li key={i}>{p}</li>)}</ol>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        {a.ligacao?.startsWith("lab_") && LABS_EXISTENTES.includes(a.ligacao.slice(4) as LabK) && <button type="button" style={btn()} onClick={() => onTreinos({ lab: a.ligacao!.slice(4) as LabK, capSlug: cap.slug, capTitulo: cap.titulo })}>ABRIR LABORATÓRIO</button>}
        {a.ligacao === "missao" && <button type="button" style={btn()} onClick={() => { window.dispatchEvent(new CustomEvent("cc-tecnica-dica", { detail: cap.titulo })); onClose(); setTimeout(() => document.getElementById("cc-missao")?.scrollIntoView({ behavior: "smooth" }), 80); }}>USAR NO MEU PRÓXIMO REEL</button>}
      </div>
      <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", marginBottom: 10 }}><input type="checkbox" checked={f} onChange={e => { setF(e.target.checked); onFiz(e.target.checked); }} /> Fiz (opcional; conta para o domínio)</label>
    </> : <p>Este capítulo não tem tarefa de aplicação.</p>}
    <button type="button" style={btn(true, busy)} disabled={busy} onClick={async () => { setBusy(true); await onConcluir(); setBusy(false); }}>CONCLUIR CAPÍTULO</button>
  </div>;
}

/* ───────────── REVISÃO ───────────── */
function Revisao({ uid, fila, caps, onDone, onAbrir }: { uid: string | null; fila: FCard[]; caps: Cap[]; onDone: () => Promise<void>; onAbrir: (s: string) => void }) {
  const [lista] = useState(fila); const [i, setI] = useState(0); const [t, setT] = useState(""); const [ver, setVer] = useState(false); const [busy, setBusy] = useState(false);
  const c = lista[i]; const cap = c && caps.find(x => x.slug === c.chapter_slug); const fc = cap?.flashcards[c.card_idx];
  const nota = <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 10 }}>Esses intervalos são a regra de estudo do app. Pesquisas mostram que espaçar ajuda e que o melhor intervalo cresce com o tempo que você quer lembrar.</div>;
  if (!c || !fc) return <P><div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 20, color: C.green }}>{lista.length ? "REVISÕES DE HOJE FEITAS" : "NENHUMA REVISÃO VENCIDA"}</div>{nota}</P>;
  const avaliar = async (r: Auto) => {
    if (!uid) return; setBusy(true);
    const n = avaliarCartao(c.caixa, r);
    await supabase.from("flashcard_state").update({ caixa: n.caixa, due_at: n.due_at, acertos: c.acertos + (r === "lembrei" ? 1 : 0), erros: c.erros + (r === "nao" ? 1 : 0), ultimo_resultado: r, updated_at: new Date().toISOString() } as any).eq("user_id", uid).eq("chapter_slug", c.chapter_slug).eq("card_idx", c.card_idx);
    // Recalcula domínio do capítulo
    const { data: todos } = await supabase.from("flashcard_state").select("caixa").eq("user_id", uid).eq("chapter_slug", c.chapter_slug);
    const { data: pr } = await supabase.from("chapter_progress").select("aplique_feito").eq("user_id", uid).eq("chapter_slug", c.chapter_slug).maybeSingle();
    await supabase.from("chapter_progress").update({ dominado: capituloDominado((todos ?? []) as any, !!(pr as any)?.aplique_feito) } as any).eq("user_id", uid).eq("chapter_slug", c.chapter_slug);
    setBusy(false); setT(""); setVer(false); setI(i + 1); if (i + 1 >= lista.length) void onDone();
  };
  return <P>
    <div style={lbl()}>Cartão {i + 1}/{lista.length} · caixa {c.caixa} · {cap.titulo}</div>
    <p style={{ fontFamily: F.s, fontSize: 20, color: C.white }}>{fc.frente}</p>
    <input value={t} onChange={e => setT(e.target.value)} disabled={ver} placeholder="Escreva a resposta em uma linha" aria-label="Sua resposta" style={{ ...ta, minHeight: 0 }} />
    {!ver ? <button type="button" style={{ ...btn(true), marginTop: 8 }} onClick={() => setVer(true)}>VER VERSO</button> : <>
      <p style={{ fontFamily: F.s, fontSize: 17, borderLeft: `3px solid ${C.cyan}`, paddingLeft: 10 }}>{fc.verso}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" style={btn(true, busy)} disabled={busy} onClick={() => avaliar("lembrei")}>LEMBREI</button>
        <button type="button" style={btn(false, busy)} disabled={busy} onClick={() => avaliar("quase")}>QUASE</button>
        <button type="button" style={{ ...btn(false, busy), borderColor: `${C.red}80`, color: C.red }} disabled={busy} onClick={() => avaliar("nao")}>NÃO LEMBREI</button>
        <button type="button" style={{ ...btn(), borderColor: C.line, color: C.muted }} onClick={() => onAbrir(cap.slug)}>RELER CAPÍTULO</button>
      </div></>}
    {nota}
  </P>;
}

/* ───────────── PROVA ───────────── */
function Prova({ uid, modulo, mods, caps, exams, onDone, onAbrir }: { uid: string | null; modulo: Mod; mods: Mod[]; caps: Cap[]; exams: Exam[]; onDone: () => Promise<void>; onAbrir: (s: string) => void }) {
  const toQ = (c: Cap) => c.quiz.map((q, k) => ({ ...q, id: `${c.slug}#${k}`, chapter_slug: c.slug }));
  const [itens] = useState<QItem[]>(() => {
    const doMod = caps.filter(c => c.modulo_slug === modulo.slug).flatMap(toQ);
    return montarProva(doMod, exams.map(e => (e.itens ?? []).map((x: any) => x.id)));
  });
  const [resp, setResp] = useState<Record<string, number>>({}); const [res, setRes] = useState<{ nota: number; erradas: QItem[] } | null>(null);
  if (!itens.length) return <P>Sem questões disponíveis.</P>;
  if (res) {
    const rever = [...new Set(res.erradas.map(q => q.chapter_slug))];
    return <P>
      <div style={lbl()}>Resultado</div>
      <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 34, color: provaAprovada(res.nota) ? C.green : C.amber }}>{res.nota}% · {provaAprovada(res.nota) ? "APROVADO" : "NÃO APROVADO"}</div>
      {!provaAprovada(res.nota) && <><div style={{ fontFamily: F.m, fontSize: 11, margin: "6px 0" }}>{acertosParaAprovar(itens.length)} acertos para aprovar. Nova tentativa em 24 horas. Capítulos a rever:</div>
        {rever.map(s => <button key={s} type="button" className="bk-row" onClick={() => onAbrir(s)}>{caps.find(c => c.slug === s)?.titulo ?? s} →</button>)}</>}
    </P>;
  }
  const enviar = async () => {
    const erradas = itens.filter(q => resp[q.id] !== q.correta); const nota = notaProva(itens.length - erradas.length, itens.length);
    if (uid) await supabase.from("module_exams").insert({ user_id: uid, modulo_slug: modulo.slug, tentativa: exams.length + 1, nota, itens: itens.map(q => ({ id: q.id, resposta: resp[q.id] ?? null, correta: q.correta })) } as any);
    setRes({ nota, erradas }); void onDone();
  };
  return <P>
    <div style={lbl()}>{itens.length} questões · {acertosParaAprovar(itens.length)} acertos para aprovar</div>
    {itens.map((q, n) => <div key={q.id} style={{ marginBottom: 14 }}>
      <p style={{ fontFamily: F.s, fontSize: 17, color: C.white, margin: "0 0 6px" }}>{n + 1}. {q.pergunta}</p>
      {q.opcoes.map((o, k) => <label key={k} style={{ display: "flex", gap: 8, fontFamily: F.m, fontSize: 12, padding: "4px 0", cursor: "pointer" }}><input type="radio" name={q.id} checked={resp[q.id] === k} onChange={() => setResp(r => ({ ...r, [q.id]: k }))} />{o}</label>)}
    </div>)}
    <button type="button" style={btn(true, Object.keys(resp).length < itens.length)} disabled={Object.keys(resp).length < itens.length} onClick={enviar}>ENTREGAR PROVA</button>
  </P>;
}

/* ───────────── PROJETO ───────────── */
function Projeto({ uid, modulo, atual, onSaved }: { uid: string | null; modulo: Mod; atual?: Proj; onSaved: () => Promise<void> }) {
  const pj = modulo.projeto ?? {}; const rub: string[] = pj.rubrica ?? [];
  const [texto, setTexto] = useState<string>(atual?.entrega?.plano ?? atual?.entrega?.texto ?? ""); const [reels, setReels] = useState<string>(atual?.entrega?.balanco ?? atual?.entrega?.reels ?? "");
  const [av, setAv] = useState<Record<string, number>>(atual?.autoavaliacao ?? {});
  const salvar = async (status: "rascunho" | "entregue") => {
    if (!uid) return;
    await supabase.from("module_projects").upsert({ user_id: uid, modulo_slug: modulo.slug, entrega: { plano: texto, balanco: reels }, autoavaliacao: av, status, updated_at: new Date().toISOString() } as any, { onConflict: "user_id,modulo_slug" });
    toast.success(status === "entregue" ? "Projeto entregue" : "Rascunho salvo"); void onSaved();
  };
  return <P>
    <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 20, color: C.white }}>{pj.titulo ?? "Projeto"}</div>
    {pj.passos && <ol style={{ fontFamily: F.s, fontSize: 16 }}>{pj.passos.map((p: string, i: number) => <li key={i}>{p}</li>)}</ol>}
    <textarea value={texto} onChange={e => setTexto(e.target.value)} style={ta} placeholder="Seu plano" aria-label="Seu plano" />
    <textarea value={reels} onChange={e => setReels(e.target.value)} style={{ ...ta, marginTop: 6 }} placeholder="Balanço final" aria-label="Balanço final" />
    {rub.length > 0 && <div style={{ marginTop: 8 }}><div style={lbl()}>Autoavaliação (0 a 2)</div>
      {rub.map(r => <div key={r} className="bk-row" style={{ cursor: "default" }}><span style={{ flex: 1, fontFamily: F.m, fontSize: 11 }}>{r}</span>{[0, 1, 2].map(n => <button key={n} type="button" style={{ ...btn(av[r] === n), padding: "2px 8px" }} onClick={() => setAv(a => ({ ...a, [r]: n }))}>{n}</button>)}</div>)}</div>}
    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
      <button type="button" style={btn()} onClick={() => salvar("rascunho")}>SALVAR RASCUNHO</button>
      {(() => { const ok = podeEntregarProjeto({ plano: texto, balanco: reels, rubrica: rub, av, diasRevisao: null }); return <button type="button" style={btn(true, !ok)} disabled={!ok} onClick={() => salvar("entregue")}>ENTREGAR</button>; })()}
    </div>
  </P>;
}
