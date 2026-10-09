import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import lessonsSeed from "@/data/academyLessons.json";
import {
  FONTE_SELO, TRILHAS, EIXOS, EIXO_LABEL, RADAR_EXEMPLO, radarDominio, calcXp, nivelDe, medirFala, notaObjetiva,
  ritmoEixo, MULETAS_PADRAO, treinoDoDia, type FonteNivel, type Marca, type MedidasFala,
} from "@/lib/academy";

const C = { bg: "#020205", cyan: "#00D4FF", gold: "#B8922A", text: "#C8C8D8", white: "#F0F0F8", muted: "#6b6b80", line: "#1a1a26", green: "#5DCAA5", amber: "#EF9F27", red: "#EF4444" };
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace" };
type Lesson = { slug: string; trilha: string; ordem: number; titulo: string; fonte_nivel: FonteNivel; conceito: string; no_reel: string; fraco: string; forte: string; exercicio: string; fontes: { ref: string; url: string | null }[] };
type Attempt = { id: string; tipo: string; nota: number; resultado: any; created_at: string };
type View = { k: "home" } | { k: "aula"; slug: string } | { k: "lab"; lab: "gancho" | "figuras" | "fala"; preset?: string; figura?: string };

const box: React.CSSProperties = { border: `1px solid ${C.line}`, background: "#07070d", padding: 12 };
const lbl = (c = C.cyan): React.CSSProperties => ({ fontFamily: F.m, fontSize: 9, letterSpacing: 2, color: c, textTransform: "uppercase", marginBottom: 6 });
const btn = (gold = false): React.CSSProperties => ({ fontFamily: F.t, fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: "9px 12px", cursor: "pointer", borderRadius: 0, border: `1px solid ${gold ? C.gold : C.cyan}80`, background: gold ? C.gold : "transparent", color: gold ? "#0A0A0A" : C.cyan });
const ta: React.CSSProperties = { width: "100%", minHeight: 90, background: "#0a0a12", border: `1px solid ${C.line}`, color: C.white, fontFamily: F.m, fontSize: 12, padding: 10, borderRadius: 0 };

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
  const s = FONTE_SELO[n];
  return <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
    <span style={{ fontFamily: F.m, fontSize: 9, letterSpacing: 1, color: s.color, border: `1px solid ${s.color}70`, padding: "2px 6px" }}>{s.label.toUpperCase()}</span>
    {s.aviso && <span style={{ fontFamily: F.m, fontSize: 9, color: s.color }}>{s.aviso}</span>}
  </div>;
}

function Radar({ v, exemplo }: { v: Record<string, number>; exemplo: boolean }) {
  const S = 220, cx = S / 2, cy = S / 2, R = 72;
  const ang = EIXOS.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / EIXOS.length);
  const pt = (a: number, r: number) => `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  const col = exemplo ? C.amber : C.cyan;
  return <div style={{ position: "relative" }}>
    {exemplo && <span style={{ position: "absolute", top: 0, right: 0, fontFamily: F.m, fontSize: 9, color: C.amber, border: `1px solid ${C.amber}`, padding: "1px 5px" }}>EXEMPLO</span>}
    <svg width={S} height={S} style={{ display: "block", margin: "0 auto" }} role="img" aria-label="Radar de domínio">
      {[0.25, 0.5, 0.75, 1].map(f => <polygon key={f} points={ang.map(a => pt(a, R * f)).join(" ")} fill="none" stroke={C.line} />)}
      {ang.map((a, i) => <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * R} y2={cy + Math.sin(a) * R} stroke={C.line} />)}
      <polygon points={ang.map((a, i) => pt(a, (R * Math.max(3, v[EIXOS[i]])) / 100)).join(" ")} fill={`${col}22`} stroke={col} strokeWidth={2} strokeDasharray={exemplo ? "4 3" : undefined} />
      {ang.map((a, i) => <text key={i} x={cx + Math.cos(a) * (R + 24)} y={cy + Math.sin(a) * (R + 24) + 3} textAnchor="middle" fontSize={9} fontFamily="'Space Mono',monospace" fill={C.text}>{EIXO_LABEL[EIXOS[i]]} {v[EIXOS[i]]}</text>)}
    </svg>
  </div>;
}

export default function AcademyPanel({ onClose, initialLab }: { onClose: () => void; initialLab?: "gancho" | "figuras" | "fala" }) {
  const [uid, setUid] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>(lessonsSeed as Lesson[]);
  const [prog, setProg] = useState<Record<string, { concluida: boolean }>>({});
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [view, setView] = useState<View>(initialLab ? { k: "lab", lab: initialLab } : { k: "home" });

  const load = async () => {
    const { data: s } = await supabase.auth.getSession(); const u = s.session?.user?.id ?? null; setUid(u);
    const { data: l } = await supabase.from("academy_lessons").select("*").order("ordem");
    if (l?.length) setLessons(l as unknown as Lesson[]);
    if (!u) return;
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from("academy_progress").select("lesson_slug,concluida").eq("user_id", u),
      supabase.from("lab_attempts").select("id,tipo,nota,resultado,created_at").eq("user_id", u).order("created_at", { ascending: false }).limit(200),
    ]);
    setProg(Object.fromEntries((p ?? []).map(r => [r.lesson_slug, { concluida: r.concluida }])));
    setAttempts((a ?? []) as Attempt[]);
  };
  useEffect(() => { void load(); }, []);

  const feitas = lessons.filter(l => prog[l.slug]?.concluida).length;
  const xp = calcXp(feitas, attempts.map(a => a.nota));
  const nv = nivelDe(xp);
  const radar = radarDominio(attempts);
  const treino = treinoDoDia();

  const salvarTentativa = async (tipo: string, entrada: string, resultado: any, nota: number) => {
    if (!uid) return;
    await supabase.from("lab_attempts").insert({ user_id: uid, tipo, entrada: entrada.slice(0, 6000), resultado, nota: Math.max(0, Math.min(100, Math.round(nota))) });
    void load();
  };

  const header = (titulo: string, back?: () => void) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <button type="button" onClick={back ?? onClose} style={{ ...btn(), padding: "4px 10px" }}>←</button>
      <div style={{ fontFamily: F.t, fontWeight: 700, fontSize: 20, color: C.white, letterSpacing: 1, flex: 1 }}>{titulo}</div>
      <span style={{ fontFamily: F.m, fontSize: 10, color: C.gold }}>{nv.nome.toUpperCase()} · {xp} XP</span>
    </div>
  );

  return (
    <div role="dialog" aria-label="Academia GRAVITAS" style={{ position: "fixed", inset: 0, zIndex: 10000, background: C.bg, overflowY: "auto", color: C.text }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
        {view.k === "home" && <>
          {header("ACADEMIA GRAVITAS")}
          <div style={{ ...box, marginBottom: 12 }}>
            <div style={lbl(C.gold)}>Nível</div>
            <div style={{ fontFamily: F.t, fontSize: 16, color: C.white, fontWeight: 700 }}>{nv.nome}{nv.prox ? ` · faltam ${nv.faltam} XP para ${nv.prox}` : ""}</div>
            <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 4 }}>10 XP por aula · 5 XP por tentativa de laboratório com nota 70 ou mais</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8, marginBottom: 12 }}>
            {TRILHAS.map(t => {
              const ls = lessons.filter(l => l.trilha === t); const d = ls.filter(l => prog[l.slug]?.concluida).length;
              return <div key={t} style={box}>
                <div style={{ fontFamily: F.t, fontWeight: 700, color: C.white, fontSize: 15 }}>{t}</div>
                <div style={{ height: 3, background: C.line, margin: "6px 0" }}><div style={{ height: 3, width: `${ls.length ? (d / ls.length) * 100 : 0}%`, background: C.cyan }} /></div>
                <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginBottom: 6 }}>{d} de {ls.length} aulas</div>
                {ls.map(l => <button key={l.slug} type="button" onClick={() => setView({ k: "aula", slug: l.slug })} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderTop: `1px solid ${C.line}`, padding: "6px 0", color: prog[l.slug]?.concluida ? C.green : C.text, fontFamily: F.m, fontSize: 11, cursor: "pointer" }}>{prog[l.slug]?.concluida ? "✓ " : "· "}{l.titulo}</button>)}
              </div>;
            })}
          </div>
          <div style={{ ...box, marginBottom: 12, borderColor: `${C.gold}60` }}>
            <div style={lbl(C.gold)}>Treino de 60s de hoje</div>
            <div style={{ fontFamily: F.m, fontSize: 12, color: C.white, marginBottom: 8 }}>{treino.texto}</div>
            <button type="button" style={btn(true)} onClick={() => setView({ k: "lab", lab: treino.lab, preset: treino.lab === "fala" ? "" : "", figura: "figura" in treino ? treino.figura : undefined })}>COMEÇAR</button>
          </div>
          <div style={{ ...box, marginBottom: 12 }}>
            <div style={lbl()}>Radar de domínio</div>
            <Radar v={radar ?? RADAR_EXEMPLO} exemplo={!radar} />
            {!radar && <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, textAlign: "center" }}>Faça uma tentativa nos laboratórios para ver o seu radar.</div>}
          </div>
          <div style={lbl()}>Laboratórios</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {(["gancho", "figuras", "fala"] as const).map(k => <button key={k} type="button" style={btn()} onClick={() => setView({ k: "lab", lab: k })}>{k === "gancho" ? "GANCHO" : k === "figuras" ? "FIGURAS" : "FALA"}</button>)}
          </div>
        </>}

        {view.k === "aula" && (() => {
          const l = lessons.find(x => x.slug === view.slug); if (!l) return null;
          return <>{header(l.titulo, () => setView({ k: "home" }))}<Aula l={l} uid={uid} done={!!prog[l.slug]?.concluida} onDone={load} /></>;
        })()}

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

function Aula({ l, uid, done, onDone }: { l: Lesson; uid: string | null; done: boolean; onDone: () => void }) {
  const [resp, setResp] = useState("");
  const [quiz, setQuiz] = useState<{ pergunta: string; opcoes: string[]; correta: number }[] | null>(null);
  const [esc, setEsc] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const carregarQuiz = async () => { setBusy(true); setErr(null); try { setQuiz((await call({ modo: "quiz", slug: l.slug })).perguntas); } catch (e) { setErr((e as Error).message); } setBusy(false); };
  const acertos = quiz ? quiz.filter((q, i) => esc[i] === q.correta).length : 0;
  const concluir = async () => {
    if (!uid) return;
    await supabase.from("academy_progress").upsert({ user_id: uid, lesson_slug: l.slug, concluida: true, quiz_acertos: acertos, resposta_exercicio: resp || null, concluida_em: new Date().toISOString() }, { onConflict: "user_id,lesson_slug" });
    window.dispatchEvent(new CustomEvent("cc-burst", { detail: "#B8922A" }));
    onDone();
  };
  const sec = (t: string, v: string, c?: string) => <div style={{ ...box, marginBottom: 8 }}><div style={lbl(c)}>{t}</div><div style={{ fontFamily: F.m, fontSize: 12, color: C.white, lineHeight: 1.6 }}>{v}</div></div>;
  return <div>
    <div style={{ marginBottom: 10 }}><Selo n={l.fonte_nivel} /></div>
    {sec("Conceito", l.conceito)}
    {sec("No reel", l.no_reel)}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
      <div style={{ ...box, borderColor: `${C.red}60` }}><div style={lbl(C.red)}>Fraco</div><div style={{ fontFamily: F.m, fontSize: 12, color: C.white }}>{l.fraco}</div></div>
      <div style={{ ...box, borderColor: `${C.green}60` }}><div style={lbl(C.green)}>Forte</div><div style={{ fontFamily: F.m, fontSize: 12, color: C.white }}>{l.forte}</div></div>
    </div>
    <div style={{ ...box, marginBottom: 8 }}><div style={lbl(C.gold)}>Exercício</div><div style={{ fontFamily: F.m, fontSize: 12, color: C.white, marginBottom: 8 }}>{l.exercicio}</div>
      <textarea style={ta} value={resp} onChange={e => setResp(e.target.value)} placeholder="Sua resposta" /></div>
    <div style={{ ...box, marginBottom: 8 }}>
      <div style={lbl()}>Quiz · 3 perguntas</div>
      {!quiz && <button type="button" style={btn()} disabled={busy} onClick={carregarQuiz}>{busy ? "Montando perguntas..." : "Abrir quiz"}</button>}
      {err && <div style={{ color: C.red, fontFamily: F.m, fontSize: 11, marginTop: 6 }}>{err} <button type="button" style={{ ...btn(), padding: "2px 8px" }} onClick={carregarQuiz}>Tentar de novo</button></div>}
      {quiz?.map((q, i) => <div key={i} style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: F.m, fontSize: 12, color: C.white, marginBottom: 4 }}>{i + 1}. {q.pergunta}</div>
        {q.opcoes.map((o, j) => { const sel = esc[i] === j; const show = esc[i] != null; const ok = j === q.correta;
          return <button key={j} type="button" disabled={show} onClick={() => setEsc(s => ({ ...s, [i]: j }))} style={{ display: "block", width: "100%", textAlign: "left", margin: "3px 0", padding: "6px 8px", fontFamily: F.m, fontSize: 11, borderRadius: 0, cursor: show ? "default" : "pointer", background: "transparent", color: show && ok ? C.green : sel ? C.red : C.text, border: `1px solid ${show && ok ? C.green : sel ? C.red : C.line}` }}>{o}</button>; })}
      </div>)}
      {quiz && <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted }}>Acertos: {acertos} de {quiz.length}</div>}
    </div>
    <div style={{ ...box, marginBottom: 8 }}><div style={lbl(C.muted)}>Fontes</div>
      {l.fontes.map((f, i) => <div key={i} style={{ fontFamily: F.m, fontSize: 11 }}>{f.url ? <a href={f.url} target="_blank" rel="noreferrer" style={{ color: C.cyan }}>{f.ref} ↗</a> : <span style={{ color: C.text }}>{f.ref}</span>}</div>)}
    </div>
    <button type="button" style={{ ...btn(true), width: "100%" }} disabled={done || !uid} onClick={concluir}>{done ? "AULA CONCLUÍDA ✓" : "CONCLUIR AULA"}</button>
  </div>;
}

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
      <div style={{ ...box, marginBottom: 8 }}><div style={lbl()}>Nota</div><div style={{ fontFamily: F.t, fontSize: 32, fontWeight: 700, color: r.nota10 >= 7 ? C.green : r.nota10 >= 5 ? C.amber : C.red }}>{r.nota10}/10</div>
        {Object.entries(r.criterios).map(([k, v]) => <div key={k} style={{ fontFamily: F.m, fontSize: 11, display: "flex", justifyContent: "space-between" }}><span>{CRIT[k]}</span><span>{String(v)}/2</span></div>)}
        {r.comentario && <div style={{ fontFamily: F.m, fontSize: 11, color: C.white, marginTop: 6 }}>{r.comentario}</div>}</div>
      <div style={{ ...box, marginBottom: 8 }}><div style={lbl(C.amber)}>Verificador · limite {r.verificador.teto}/10</div>
        {[...r.verificador.motivos, ...r.verificador.riscos, ...r.verificador.avisos].length ? [...r.verificador.motivos, ...r.verificador.riscos, ...r.verificador.avisos].map((m: string, i: number) => <div key={i} style={{ fontFamily: F.m, fontSize: 11 }}>· {m}</div>) : <div style={{ fontFamily: F.m, fontSize: 11, color: C.green }}>Sem saudação, até 12 palavras, sem termo proibido.</div>}</div>
      <div style={box}><div style={lbl(C.gold)}>3 reescritas</div>
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
    {r && <div style={{ ...box, marginTop: 12 }}>
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
    <div style={{ ...box, marginBottom: 8, borderColor: `${C.amber}60` }}><div style={{ fontFamily: F.m, fontSize: 10, color: C.amber }}>{AVISO_DITADO}</div>
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
      {nota != null && <div style={box}><div style={lbl()}>Nota</div><div style={{ fontFamily: F.t, fontSize: 32, fontWeight: 700, color: nota >= 70 ? C.green : nota >= 50 ? C.amber : C.red }}>{nota}/100</div>
        <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>Metade pelas medidas em código, metade pela análise do texto.</div></div>}
      <div style={box}><div style={lbl()}>Medidas</div>
        {[["Palavras", med.total_palavras], ["Palavras por segundo", med.pps ?? "— (informe a duração)"], ["Frases com mais de 14 palavras", med.frases_longas.length], ["Abertura", `${med.abertura_palavras} palavras${med.abertura_longa ? " · longa" : ""}`], ["Saudação na abertura", med.saudacao ? "sim" : "não"], ["Muletas por 100 palavras", med.muletas_por_100], ["Pausas (estimativa)", med.pausas_estimadas ?? "— só no ditado"]].map(([k, v]) =>
          <div key={String(k)} style={{ fontFamily: F.m, fontSize: 11, display: "flex", justifyContent: "space-between", borderTop: `1px solid ${C.line}`, padding: "4px 0" }}><span>{k}</span><span style={{ color: C.white }}>{String(v)}</span></div>)}
        {med.frases_longas.map((f, i) => <div key={i} style={{ fontFamily: F.m, fontSize: 10, color: C.amber, marginTop: 4 }}>· {f}</div>)}
      </div>
      {med.trechos.length > 0 && <div style={box}><div style={lbl()}>Ritmo por trecho de 5s{origem === "colada" ? " · distribuição uniforme" : ""}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90, borderBottom: `1px solid ${C.line}` }}>
          {med.trechos.map((x, i) => <div key={i} title={`${x.ini}-${x.fim}s: ${x.pps}`} style={{ flex: 1, height: `${(x.pps / maxPps) * 100}%`, background: x.pps >= 2.5 && x.pps <= 3 ? C.green : C.amber }} />)}
        </div>
        <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 4 }}>Faixa verde: 2,5 a 3 palavras por segundo.</div></div>}
      <div style={box}><div style={lbl()}>Muletas</div>{med.muletas.length ? med.muletas.map(m => <span key={m.termo} style={{ fontFamily: F.m, fontSize: 11, marginRight: 10 }}>{m.termo} ×{m.n}</span>) : <span style={{ fontFamily: F.m, fontSize: 11, color: C.green }}>Nenhuma.</span>}</div>
      {an && <>
        <div style={box}><div style={lbl()}>Análise</div>
          <div style={{ fontFamily: F.m, fontSize: 11 }}>Gancho: {an.gancho ?? "—"}/100 · CTA: {an.cta?.nota ?? "—"}/100 · Prova: {an.prova ?? "—"}/100</div>
          {an.cta?.comentario && <div style={{ fontFamily: F.m, fontSize: 11, color: C.white }}>{an.cta.comentario}</div>}
          <div style={{ fontFamily: F.m, fontSize: 11, marginTop: 4 }}>Elementos concretos: {(an.especificidade?.elementos ?? []).join(", ") || "nenhum"}</div>
          <div style={{ fontFamily: F.m, fontSize: 11 }}>Perguntas sem resposta: {(an.perguntas_sem_resposta ?? []).join(" | ") || "nenhuma"}</div>
          <div style={{ fontFamily: F.m, fontSize: 11 }}>Figura: {an.figura?.nome || "nenhuma"}{an.figura?.trecho ? ` — "${an.figura.trecho}"` : ""}</div>
        </div>
        <div style={box}><div style={lbl(C.gold)}>Trechos para reescrever</div>{(an.trechos ?? []).slice(0, 3).map((x: any, i: number) => <div key={i} style={{ borderTop: i ? `1px solid ${C.line}` : "none", padding: "6px 0", fontFamily: F.m, fontSize: 11 }}><div style={{ color: C.red }}>{x.original}</div><div style={{ color: C.green }}>→ {x.melhor}</div></div>)}</div>
        <div style={{ ...box, borderColor: `${C.gold}60` }}><div style={lbl(C.gold)}>3 ajustes para a próxima gravação</div>{(an.ajustes ?? []).slice(0, 3).map((a: string, i: number) => <div key={i} style={{ fontFamily: F.m, fontSize: 12, color: C.white }}>{i + 1}. {a}</div>)}</div>
      </>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <button type="button" style={btn()} disabled={salva || !uid} onClick={salvarTranscricao}>{salva ? "TRANSCRIÇÃO SALVA ✓" : "SALVAR TRANSCRIÇÃO"}</button>
        <button type="button" style={btn()} disabled={busy} onClick={reescrever}>GERAR VERSÃO COM MAIS ATENÇÃO</button>
        <button type="button" style={btn()} onClick={() => onCard(nova ?? t)}>ENVIAR AO ESTÚDIO DE CARDS</button>
      </div>
      {nova && <div style={box}><div style={lbl(C.green)}>Versão com mais atenção</div><div style={{ fontFamily: F.m, fontSize: 12, color: C.white, whiteSpace: "pre-wrap" }}>{nova}</div></div>}
    </div>}
  </div>;
}
