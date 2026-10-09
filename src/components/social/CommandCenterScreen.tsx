import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ReelFactoryPanel from "./ReelFactoryPanel";
import CommandCenterAutomation from "./CommandCenterAutomation";
import { runGerarReel, mergeBlocks, contentScore, STAGE_LABEL } from "@/lib/retentionEngine";

/* ═══════════════════════════════════════════════════
   COMMAND CENTER — tela principal do Social ON
   Dados reais do Motor de Retenção por usuário.
    
   ═══════════════════════════════════════════════════ */

const C = {
  bg: "#020205",
  cyan: "#00D4FF",
  gold: "#B8922A",
  red: "#EF4444",
  text: "#C8C8D8",
  white: "#F0F0F8",
  muted: "#555566",
  dim: "#333340",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace" };

const CSS = `
@keyframes ccPulse { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:1;transform:scale(1.02)} }
@keyframes ccDot { 0%,100%{opacity:.35} 50%{opacity:1} }
@keyframes ccBlockIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes ccSweep { 0%{transform:translateX(-100%)} 100%{transform:translateX(260%)} }
@keyframes ccSweep4 { 0%,70%{transform:translateX(-120%)} 100%{transform:translateX(320%)} }
@keyframes ccSpin { to { transform: rotate(360deg) } }
@keyframes ccGlow { 0%,100%{opacity:.35} 50%{opacity:.9} }
@keyframes ccScan { 0%{left:-30%} 100%{left:100%} }
@keyframes ccShimmer { 0%{background-position:-200px 0} 100%{background-position:200px 0} }
.cc-rise { animation: ccBlockIn .5s ease both; }
.cc-stack > *:nth-child(1){animation-delay:0ms}.cc-stack > *:nth-child(2){animation-delay:60ms}.cc-stack > *:nth-child(3){animation-delay:120ms}.cc-stack > *:nth-child(4){animation-delay:180ms}.cc-stack > *:nth-child(5){animation-delay:240ms}
.cc-grid > *:nth-child(1){animation-delay:300ms}.cc-grid > *:nth-child(2){animation-delay:360ms}.cc-grid > *:nth-child(3){animation-delay:420ms}.cc-grid > *:nth-child(4){animation-delay:480ms}.cc-grid > *:nth-child(5){animation-delay:540ms}.cc-grid > *:nth-child(6){animation-delay:600ms}.cc-grid > *:nth-child(7){animation-delay:660ms}
.cc-root button { transition: transform .15s ease, box-shadow .15s ease, filter .15s ease; }
.cc-root button:not(:disabled):hover, .cc-root button:not(:disabled):active { transform: translateY(-1px); box-shadow: 0 4px 14px -6px #00D4FF80; filter: brightness(1.12); }
.cc-skel { background: linear-gradient(90deg, #ffffff08 0px, #00D4FF18 80px, #ffffff08 160px); background-size: 400px 100%; animation: ccShimmer 1.4s linear infinite; }
.cc-range { width: 100%; accent-color: #00D4FF; }
.cc-root, .cc-root * { max-width: 100%; }
@media (prefers-reduced-motion: reduce) {
  .cc-anim, .cc-anim *, .cc-root, .cc-root * { animation: none !important; transition: none !important; }
}
.cc-grid { display: grid; grid-template-columns: minmax(0,1fr); gap: 14px; }
@media (min-width: 900px) { .cc-grid { grid-template-columns: minmax(0,1fr) minmax(0,1fr); } }
`;
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function useCountUp(target: number, ms = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (reducedMotion()) { setV(target); return; }
    const t0 = performance.now(); let raf = 0;
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / ms); setV(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}
/** Instruções do motor: CONTEXTO_COMUM, ARQUITETO, REDATOR e CRITICO. Hoje estão vazias no servidor. */
const MOTOR_INSTRUCOES = { ativas: 0, total: 4 };

/** Painel de vidro escuro com canto cortado e brilho fino no topo. */
function Panel({ children, style, glow }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
  return (
    <div
      className="cc-rise"
      style={{
        backdropFilter: "blur(6px)",
        boxShadow: `inset 0 1px 0 ${glow || C.cyan}22`,
        position: "relative",
        background: "rgba(10,10,18,0.72)",
        border: `1px solid ${C.cyan}33`,
        borderRadius: 0,
        clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)",
        padding: 14,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${glow || C.cyan}55, transparent)`,
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}

function Label({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontFamily: F.m, fontSize: 9, letterSpacing: 2, color: color || C.muted, textTransform: "uppercase" }}>
      {children}
    </div>
  );
}


type Bloco = { id: any; tempo?: string; nota?: number; fala?: string; texto_tela?: string; estimulo_visual?: string };
const dash = (v: any) => (v == null || v === "" ? "—" : String(v));
const corNota = (n?: number) => (n == null ? C.muted : n >= 8 ? C.gold : n >= 6 ? C.cyan : C.red);
const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", background: "#0A0A12", border: `1px solid ${C.dim}`, color: C.white, fontFamily: F.m, fontSize: 11, padding: "8px 10px", borderRadius: 0 };
const btn = (primary?: boolean): React.CSSProperties => ({ flex: 1, background: primary ? C.gold : "transparent", border: primary ? "none" : `1px solid ${C.cyan}50`, color: primary ? "#0A0A0A" : C.cyan, fontFamily: F.t, fontWeight: 700, fontSize: 13, padding: "10px 0", cursor: "pointer", borderRadius: 0 });
const Empty = ({ children }: { children: React.ReactNode }) => <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, marginTop: 10, lineHeight: 1.5 }}>{children}</div>;

/* ── Núcleo de Atenção (anel SVG em três camadas) ── */
const EXEMPLO = { score: 72, subs: [
  { k: "HOOK", v: 78, trend: [60, 66, 63, 71, 78] },
  { k: "RETENÇÃO", v: 70, trend: [62, 65, 70, 68, 70] },
  { k: "REAL 3S", v: 64, trend: [55, 58, 61, 60, 64] },
  { k: "RITMO", v: 76, trend: [57, 71, 71, 86, 76] },
] };
type Sub = { k: string; v: number | null; trend?: number[] };

function Spark({ data, color }: { data?: number[]; color: string }) {
  if (!data || data.length < 2) return <svg width={44} height={12} aria-hidden><line x1={0} y1={6} x2={44} y2={6} stroke={C.dim} strokeDasharray="2 2" /></svg>;
  const mi = Math.min(...data), ma = Math.max(...data), r = ma - mi || 1;
  const d = data.map((v, i) => `${i ? "L" : "M"} ${(i * 44) / (data.length - 1)} ${11 - ((v - mi) / r) * 10}`).join(" ");
  return <svg width={44} height={12} aria-hidden><path d={d} fill="none" stroke={color} strokeWidth={1.2} /></svg>;
}

function MiniGauge({ s }: { s: Sub }) {
  const val = useCountUp(s.v ?? 0, 900);
  const cor = s.v == null ? C.muted : s.v >= 80 ? C.gold : C.cyan;
  const r = 20, len = Math.PI * r, p = s.v == null ? 0 : (val / 100) * len;
  return (
    <div style={{ textAlign: "center", minWidth: 0 }}>
      <svg width={56} height={32} viewBox="0 0 56 32" aria-hidden>
        <path d="M 8 28 A 20 20 0 0 1 48 28" fill="none" stroke={`${C.cyan}18`} strokeWidth={4} />
        <path d="M 8 28 A 20 20 0 0 1 48 28" fill="none" stroke={cor} strokeWidth={4} strokeDasharray={`${p} ${len}`} style={{ filter: `drop-shadow(0 0 3px ${cor}90)` }} />
        <text x={28} y={27} textAnchor="middle" fill={C.white} fontFamily={F.t} fontWeight={700} fontSize={13}>{s.v == null ? "—" : val}</text>
      </svg>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 2 }}><Spark data={s.trend} color={cor} /></div>
      <Label>{s.k}</Label>
    </div>
  );
}

function Nucleo({ score, subs, exemplo }: { score: number | null; subs: Sub[]; exemplo: boolean }) {
  const sc = exemplo ? EXEMPLO.score : score;
  const ss: Sub[] = exemplo ? EXEMPLO.subs : subs;
  const shown = useCountUp(sc ?? 0);
  const CX = 110, CY = 110, R = 78, circ = 2 * Math.PI * R;
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0 4px" }}>
      {exemplo && <span style={{ position: "absolute", top: 0, right: 0, fontFamily: F.m, fontSize: 9, letterSpacing: 2, color: "#EF9F27", border: "1px solid #EF9F2770", padding: "2px 8px", background: "#EF9F2712" }}>EXEMPLO</span>}
      <div style={{ position: "absolute", inset: -40, pointerEvents: "none", background: `radial-gradient(circle at 50% 42%, ${C.cyan}16, transparent 60%)` }} />
      <div style={{ position: "relative", width: 220, height: 220 }}>
        <svg width={220} height={220} viewBox="0 0 220 220" style={{ position: "absolute", inset: 0 }}>
          <g className="cc-anim" style={{ transformOrigin: "110px 110px", animation: "ccSpin 40s linear infinite" }}>
            <circle cx={CX} cy={CY} r={102} fill="none" stroke={`${C.cyan}55`} strokeWidth={1} strokeDasharray="2 7" />
            <circle cx={CX} cy={CY} r={96} fill="none" stroke={`${C.cyan}22`} strokeWidth={1} strokeDasharray="18 30" />
          </g>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={`${C.cyan}14`} strokeWidth={7} />
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={exemplo ? "#EF9F27" : C.cyan} strokeWidth={7} strokeLinecap="butt"
            strokeDasharray={`${(shown / 100) * circ} ${circ}`} transform={`rotate(-90 ${CX} ${CY})`}
            style={{ filter: `drop-shadow(0 0 8px ${exemplo ? "#EF9F27" : C.cyan}90)` }} />
          <circle className="cc-anim" cx={CX} cy={CY} r={60} fill={`${C.cyan}08`} stroke={`${C.cyan}40`} strokeWidth={1}
            style={{ animation: "ccGlow 3.2s ease-in-out infinite", filter: `drop-shadow(0 0 10px ${C.cyan})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: F.t, fontSize: 56, fontWeight: 700, color: C.white, lineHeight: 1, textShadow: `0 0 18px ${C.cyan}60` }}>{sc == null ? "—" : shown}</div>
          <Label color={C.cyan}>Content Score</Label>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8, marginTop: 8, width: "100%", maxWidth: 340 }}>
        {ss.map((s) => <MiniGauge key={s.k} s={s} />)}
      </div>
      {exemplo && <Empty>Lance o resultado de um reel para ver o seu score.</Empty>}
    </div>
  );
}

/* ── Linha da Atenção ── */
const corSeg = (n?: number) => (n == null ? C.muted : n >= 8 ? "#5DCAA5" : n >= 5 ? "#EF9F27" : C.red);
function LinhaAtencao({ blocos, open, onToggle }: { blocos: Bloco[]; open: number | null; onToggle: (i: number | null) => void }) {
  if (!blocos.length) return (
    <div>
      <div style={{ position: "relative", height: 26, display: "flex", gap: 3, overflow: "hidden" }}>
        {[1.2, 1, 1.4, 0.9, 1.1, 1].map((w, i) => <div key={i} style={{ flex: w, background: `${C.cyan}0c`, border: `1px solid ${C.cyan}18` }} />)}
        <div className="cc-anim" style={{ position: "absolute", top: 0, bottom: 0, width: "30%", background: `linear-gradient(90deg, transparent, ${C.cyan}40, transparent)`, animation: "ccScan 2.4s linear infinite" }} />
      </div>
      <Empty>Gere um reel para ver a curva de atenção.</Empty>
    </div>
  );
  const W = 600, H = 60, n = Math.max(1, blocos.length - 1);
  const pts = blocos.map((b, i) => [20 + (i * (W - 40)) / n, H - 8 - ((b.nota ?? 0) / 10) * (H - 16)]);
  const path = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const sel = open != null ? blocos[open] : null;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 60, display: "block" }}>
        <path d={path} fill="none" stroke={`${C.cyan}60`} strokeWidth={1.5} strokeDasharray="3 3" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={corSeg(blocos[i].nota)} />)}
      </svg>
      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
        {blocos.map((b, i) => (
          <button key={String(b.id)} type="button" onClick={() => onToggle(open === i ? null : i)} title={`${dash(b.tempo)} · nota ${dash(b.nota)}`} className="cc-anim"
            style={{ flex: 1, border: `1px solid ${open === i ? corSeg(b.nota) : `${corSeg(b.nota)}40`}`, background: open === i ? `${corSeg(b.nota)}22` : `${corSeg(b.nota)}0d`, borderRadius: 0, padding: "6px 2px", cursor: "pointer", animation: `ccBlockIn .4s ease ${i * 0.08}s both` }}>
            <div style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: corSeg(b.nota) }}>{dash(b.nota)}</div>
            <div style={{ fontFamily: F.m, fontSize: 7, color: C.muted }}>{dash(b.tempo)}</div>
          </button>
        ))}
      </div>
      {sel && (
        <div style={{ marginTop: 8, borderLeft: `2px solid ${corSeg(sel.nota)}`, padding: "8px 12px", background: `${C.cyan}08` }}>
          <div style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: C.white, lineHeight: 1.3 }}>“{dash(sel.fala)}”</div>
          <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: F.m, fontSize: 9, color: C.cyan }}>TELA: {dash(sel.texto_tela)}</span>
            <span style={{ fontFamily: F.m, fontSize: 9, color: C.gold }}>ESTÍMULO: {dash(sel.estimulo_visual)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Gráfico previsto x real ── */
function PrevReal({ comp, quedaBloco }: { comp: { bloco: any; previsto: number; real: number | null }[]; quedaBloco?: any }) {
  if (comp.length < 2) return null;
  const W = 600, H = 90;
  const x = (i: number) => 20 + (i * (W - 40)) / (comp.length - 1);
  const y = (v: number) => H - 10 - (v / 10) * (H - 20);
  const prev = comp.map((c, i) => `${i ? "L" : "M"} ${x(i)} ${y(c.previsto)}`).join(" ");
  const realPts = comp.map((c, i) => (c.real == null ? null : [x(i), y(c.real), i])).filter(Boolean) as number[][];
  const real = realPts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const di = comp.findIndex(c => String(c.bloco) === String(quedaBloco));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 90, display: "block" }}>
      <path d={prev} fill="none" stroke={`${C.cyan}70`} strokeWidth={1.5} strokeDasharray="4 3" />
      <path d={real} fill="none" stroke={C.gold} strokeWidth={2} />
      {realPts.map((p) => <circle key={p[2]} cx={p[0]} cy={p[1]} r={p[2] === di ? 5 : 3} fill={p[2] === di ? C.red : C.gold} />)}
      {di >= 0 && comp[di].real != null && <text x={x(di)} y={Math.min(H - 2, y(comp[di].real!) + 18)} textAnchor="middle" fill={C.red} fontSize={11} fontFamily={F.m}>▼ BLOCO {String(comp[di].bloco)}</text>}
    </svg>
  );
}

/* ── Modo Gravação (tela cheia) ── */
function ModoGravacao({ blocos, onClose }: { blocos: Bloco[]; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [seg, setSeg] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => { const t = setInterval(() => setSeg((s) => s + 1), 1000); return () => clearInterval(t); }, []);
  const b = blocos[idx];
  const avancar = () => { if (idx < blocos.length - 1) { setIdx(idx + 1); setSeg(0); } else setDone(true); };
  const mm = String(Math.floor(seg / 60)).padStart(2, "0"), ss = String(seg % 60).padStart(2, "0");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column", padding: 20 }} onClick={!done ? avancar : undefined}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Label color={C.cyan}>MODO GRAVAÇÃO · BLOCO {idx + 1}/{blocos.length}</Label>
        <button type="button" onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ background: "none", border: `1px solid ${C.dim}`, color: C.muted, fontFamily: F.m, fontSize: 10, padding: "4px 10px", cursor: "pointer", borderRadius: 0 }}>SAIR</button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: F.t, fontSize: 34, fontWeight: 700, color: C.gold }}>ROTEIRO COMPLETO</div>
            <div style={{ fontFamily: F.m, fontSize: 11, color: C.muted, marginTop: 8 }}>Boa gravação. Depois de postar, lance o resultado aqui.</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: F.m, fontSize: 11, color: C.cyan, letterSpacing: 2 }}>{dash(b?.tempo)} · NOTA {dash(b?.nota)}</div>
            <div style={{ fontFamily: F.t, fontSize: 34, fontWeight: 700, color: C.white, lineHeight: 1.25 }}>{dash(b?.fala)}</div>
            <div style={{ fontFamily: F.m, fontSize: 12, color: C.gold }}>TELA: {dash(b?.texto_tela)}</div>
            <div style={{ fontFamily: F.m, fontSize: 11, color: C.muted }}>ESTÍMULO: {dash(b?.estimulo_visual)}</div>
          </>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: F.m, fontSize: 22, color: C.cyan }}>{mm}:{ss}</span>
        <button type="button" onClick={(e) => { e.stopPropagation(); done ? onClose() : avancar(); }} style={{ background: C.gold, color: "#0A0A0A", border: "none", borderRadius: 0, fontFamily: F.t, fontWeight: 700, fontSize: 16, padding: "12px 28px", cursor: "pointer" }}>
          {done ? "FECHAR" : "GRAVEI →"}
        </button>
      </div>
    </div>
  );
}

const dayStart = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

export default function CommandCenterScreen({ onOpenTool, onOpenZone }: { onOpenTool?: (id: string) => void; onOpenZone?: (zone: string) => void }) {
  const [gravando, setGravando] = useState(false);
  const [blocoAberto, setBlocoAberto] = useState<number | null>(null);
  const [scripts, setScripts] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [goal, setGoal] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [temaOpen, setTemaOpen] = useState(false);
  const [tema, setTema] = useState(""); const [objetivo, setObjetivo] = useState("alcance");
  const [todayIdx, setTodayIdx] = useState(0);
  const [pct3, setPct3] = useState(""); const [medio, setMedio] = useState(""); const [faixas, setFaixas] = useState<Record<string, string>>({});
  const [calib, setCalib] = useState<any>(null); const [calibBusy, setCalibBusy] = useState(false);
  const [goalForm, setGoalForm] = useState({ metrica: "reels_publicados", alvo: "" });

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoaded(true); return; }
    const since = new Date(Date.now() - 120 * 864e5).toISOString();
    const [s, r, f, h, g] = await Promise.all([
      supabase.from("retention_scripts").select("id, created_at, tema, objetivo, tom, roteiro, notas, nota_geral, estrutura, formula_id").eq("user_id", user.id).gte("created_at", since).order("created_at", { ascending: false }).limit(200),
      supabase.from("retention_results").select("id, script_id, pct_3s, tempo_medio, curva_real, created_at").eq("user_id", user.id).gte("created_at", since).order("created_at", { ascending: false }),
      supabase.from("creator_formula_stats").select("formula_id, usos, retencao_3s_media").eq("user_id", user.id),
      supabase.from("hook_formulas").select("id, nome"),
      supabase.from("creator_goals").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    setScripts(s.data ?? []); setResults(r.data ?? []);
    setFormulas(((f.data ?? []) as any[]).map(x => ({ ...x, nome: (h.data ?? []).find((y: any) => y.id === x.formula_id)?.nome ?? `Fórmula ${x.formula_id}` }))
      .sort((a, b) => Number(b.retencao_3s_media ?? -1) - Number(a.retencao_3s_media ?? -1)));
    setGoal(g.data ?? null); setLoaded(true);
  };
  useEffect(() => { load(); }, []);

  const hojeIni = dayStart(new Date());
  const ontemIni = new Date(hojeIni.getTime() - 864e5);
  const doDia = scripts.filter(s => new Date(s.created_at) >= hojeIni);
  const reel = doDia[Math.min(todayIdx, Math.max(0, doDia.length - 1))] ?? null;
  const blocos: Bloco[] = useMemo(() => mergeBlocks(reel), [reel]);
  const ontem = scripts.find(s => { const d = new Date(s.created_at); return d >= ontemIni && d < hojeIni; }) ?? null;
  const ontemBlocos: Bloco[] = useMemo(() => mergeBlocks(ontem), [ontem]);
  const ontemResult = ontem ? results.find(r => r.script_id === ontem.id) : null;
  const { score, subs } = useMemo(() => contentScore(scripts, results), [scripts, results]);

  const streak = useMemo(() => {
    const days = new Set(scripts.map(s => dayStart(new Date(s.created_at)).getTime()));
    let n = 0, d = hojeIni.getTime();
    if (!days.has(d)) d -= 864e5;
    while (days.has(d)) { n++; d -= 864e5; }
    return n;
  }, [scripts]);

  const gerar = async () => {
    if (!tema.trim()) return toast.error("Escreva o tema do reel");
    try {
      const script = await runGerarReel({ tema: tema.trim(), objetivo, tom: "direto" }, setStage);
      toast.success("Reel de hoje pronto");
      setTemaOpen(false); setTema(""); setBlocoAberto(null);
      await load(); setTodayIdx(0);
      void script;
    } catch (e: any) { toast.error(e.message); } finally { setStage(null); }
  };

  const calibrar = async () => {
    if (!ontem) return;
    setCalibBusy(true);
    const { data, error } = await supabase.functions.invoke("calibrar", { body: { script_id: ontem.id, faixas, pct_3s: pct3, tempo_medio: medio } });
    setCalibBusy(false);
    const msg = (data as any)?.error ?? (error ? (await (error as any).context?.json?.().catch(() => null))?.error ?? "Falha ao calibrar" : null);
    if (msg) return toast.error(msg);
    setCalib(data); load();
  };

  const salvarMeta = async () => {
    const alvo = Number(goalForm.alvo.replace(",", "."));
    if (!(alvo > 0)) return toast.error("Informe um alvo maior que zero");
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const { error } = await supabase.from("creator_goals").upsert({ user_id: user.id, metrica: goalForm.metrica, alvo, inicio: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    load();
  };

  const meta = useMemo(() => {
    if (!goal) return null;
    const ini = new Date(`${goal.inicio}T00:00:00`);
    const dias = Math.max(0, Math.min(90, (Date.now() - ini.getTime()) / 864e5));
    const planejado = Math.round((dias / 90) * 100);
    const rs = results.filter(r => new Date(r.created_at) >= ini);
    const atual = goal.metrica === "reels_publicados" ? rs.length : (() => { const v = rs.map(r => Number(r.pct_3s)).filter(Number.isFinite); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; })();
    const real = Math.min(100, Math.round((atual / Number(goal.alvo)) * 100));
    return { planejado, real, atual: Math.round(atual * 10) / 10, alvo: Number(goal.alvo), dia: Math.floor(dias) };
  }, [goal, results]);

  const alertas = useMemo(() => {
    const a: { tipo: string; txt: string; cor: string }[] = [];
    if (ontem && !ontemResult) a.push({ tipo: "RESULTADO", txt: "Lance a retenção de ontem. É isso que afina o próximo lote.", cor: C.gold });
    const fracos = blocos.filter(b => b.nota != null && b.nota < 7);
    if (fracos.length) a.push({ tipo: "RITMO", txt: `${fracos.length} bloco(s) do reel de hoje abaixo de 7: ${fracos.map(b => b.id).join(", ")}.`, cor: C.red });
    if (meta && meta.real < meta.planejado) a.push({ tipo: "META", txt: `Abaixo do planejado: ${meta.real}% real x ${meta.planejado}% esperado no dia ${meta.dia}.`, cor: C.cyan });
    return a;
  }, [ontem, ontemResult, blocos, meta]);

  const hoje = useMemo(() => new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).toUpperCase(), []);
  const atalhos: { id: string; nome: string; zone?: string; tool?: string }[] = [
    { id: "studio", nome: "STUDIO", tool: "studio" },
    { id: "strategy", nome: "STRATEGY", zone: "strategy" },
    { id: "planner", nome: "PLANNER", tool: "calendario" },
    { id: "growth", nome: "GROWTH", zone: "growth" },
    { id: "learn", nome: "LEARN", zone: "learn" },
  ];
  const busy = stage !== null;
  const abertura = reel ? (blocos[0]?.fala ?? reel.roteiro?.gancho) : null;
  const comp: any[] = calib?.comparacao ?? ontemResult?.curva_real?.comparacao ?? [];

  return (
    <div className="cc-anim" style={{ position: "relative", background: C.bg, borderRadius: 0, overflow: "hidden", padding: "14px 14px 20px", margin: "-16px -16px 0" }}>
      <style>{CSS}</style>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04, backgroundImage: `linear-gradient(${C.cyan} 1px, transparent 1px), linear-gradient(90deg, ${C.cyan} 1px, transparent 1px)`, backgroundSize: "36px 36px" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.05, mixBlendMode: "overlay", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")" }} />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="cc-anim" style={{ width: 7, height: 7, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 8px ${C.cyan}`, animation: "ccDot 1.6s ease infinite" }} />
            <span style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: C.white, letterSpacing: 2 }}>SIGNAL</span>
            <Label color={C.cyan}>{loaded ? "ATIVO" : "CARREGANDO"}</Label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: F.m, fontSize: 10, color: C.gold }}>🔥 {streak} dias seguidos. Mantenha.</span>
            <span style={{ fontFamily: F.m, fontSize: 10, color: C.muted }}>{hoje}</span>
          </div>
        </div>

        <Panel glow={C.cyan}><Label color={C.cyan}>Núcleo de Atenção</Label><Nucleo score={score} subs={subs} /></Panel>

        {/* Missão de hoje */}
        <Panel glow={C.gold}>
          <Label color={C.gold}>Missão de hoje</Label>
          {reel ? (
            <>
              <div style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: C.white, lineHeight: 1.25, marginTop: 6 }}>{reel.tema}</div>
              <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                {reel.estrutura?.formula_nome && <span style={{ fontFamily: F.m, fontSize: 9, color: C.cyan, border: `1px solid ${C.cyan}40`, padding: "2px 8px" }}>{String(reel.estrutura.formula_nome).toUpperCase()}</span>}
                <span style={{ fontFamily: F.m, fontSize: 9, color: corNota(reel.nota_geral ?? undefined), border: `1px solid ${C.dim}`, padding: "2px 8px" }}>NOTA {dash(reel.nota_geral)}</span>
                {doDia.length > 1 && <button type="button" onClick={() => { setTodayIdx((todayIdx + 1) % doDia.length); setBlocoAberto(null); }} style={{ fontFamily: F.m, fontSize: 9, color: C.muted, background: "none", border: `1px solid ${C.dim}`, padding: "2px 8px", cursor: "pointer", borderRadius: 0 }}>OPÇÃO {Math.min(todayIdx, doDia.length - 1) + 1}/{doDia.length} ↻</button>}
              </div>
              {abertura && <div style={{ fontFamily: F.m, fontSize: 11, color: C.text, marginTop: 10, lineHeight: 1.5 }}>ABERTURA: “{String(abertura)}”</div>}
            </>
          ) : <Empty>{loaded ? "Nenhum reel gerado hoje." : "Carregando..."}</Empty>}

          {(temaOpen || (!reel && loaded)) && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <input style={inp} value={tema} onChange={e => setTema(e.target.value)} placeholder="Tema do reel" disabled={busy} />
              <div style={{ display: "flex", gap: 6 }}>
                {[["alcance", "Alcance"], ["autoridade", "Autoridade"], ["venda", "Venda"]].map(([id, l]) => (
                  <button key={id} type="button" onClick={() => setObjetivo(id)} style={{ ...btn(), flex: 1, fontSize: 11, padding: "6px 0", color: objetivo === id ? C.gold : C.muted, borderColor: objetivo === id ? C.gold : C.dim }}>{l}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {busy ? (
              <div style={{ ...btn(true), textAlign: "center", cursor: "wait" }}>{STAGE_LABEL[stage ?? "arquiteto"] ?? "Projetando atenção..."}</div>
            ) : reel && !temaOpen ? (
              <>
                <button type="button" onClick={() => setTemaOpen(true)} style={btn()}>TROCAR TEMA</button>
                <button type="button" onClick={() => setGravando(true)} disabled={!blocos.length} style={{ ...btn(true), position: "relative", overflow: "hidden" }}>
                  <span className="cc-anim" style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "40%", background: "linear-gradient(90deg, transparent, #ffffff30, transparent)", animation: "ccSweep 2.8s ease infinite" }} />
                  ▶ Gravar agora
                </button>
              </>
            ) : (
              <>
                {reel && <button type="button" onClick={() => setTemaOpen(false)} style={btn()}>CANCELAR</button>}
                <button type="button" onClick={gerar} style={btn(true)}>{reel ? "GERAR OUTRA OPÇÃO" : "GERAR REEL DE HOJE"}</button>
              </>
            )}
          </div>
        </Panel>

        <Panel glow={C.gold}>
          <ReelFactoryPanel onChosen={load} />
        </Panel>

        <div className="cc-grid">
          <Panel>
            <div id="cc-linha-atencao" style={{ scrollMarginTop: 80 }}>
              <Label color={C.cyan}>Linha da Atenção</Label>
              <div style={{ marginTop: 10 }}><LinhaAtencao blocos={blocos} open={blocoAberto} onToggle={setBlocoAberto} /></div>
            </div>
          </Panel>

          {/* Resultado de ontem */}
          <Panel>
            <Label color={C.gold}>Resultado de ontem</Label>
            {!ontem ? <Empty>Sem dados reais ainda. Lance o resultado do último reel.</Empty> : (
              <>
                <div style={{ fontFamily: F.m, fontSize: 10, color: C.text, marginTop: 6 }}>{ontem.tema}</div>
                {(calib || ontemResult) && comp.length > 1 && (
                  <>
                    <div style={{ marginTop: 8 }}><PrevReal comp={comp} quedaBloco={(calib?.maior_queda ?? ontemResult?.curva_real?.maior_queda)?.bloco} /></div>
                    <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                      <span style={{ fontFamily: F.m, fontSize: 9, color: C.cyan }}>- - PREVISTO</span>
                      <span style={{ fontFamily: F.m, fontSize: 9, color: C.gold }}>— REAL</span>
                      <span style={{ fontFamily: F.m, fontSize: 9, color: C.red }}>● MAIOR QUEDA</span>
                    </div>
                  </>
                )}
                {calib && (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                    {calib.aviso && <div style={{ fontFamily: F.m, fontSize: 10, color: C.gold }}>{calib.aviso}</div>}
                    <div style={{ fontFamily: F.m, fontSize: 10, color: C.red }}>{calib.maior_queda ? `MAIOR QUEDA: -${calib.maior_queda.queda_pontos} pts aos ${calib.maior_queda.segundo}s · bloco ${dash(calib.maior_queda.bloco)}` : "Nenhuma queda entre as faixas informadas."}</div>
                    {calib.analise?.causa_provavel && <div style={{ fontFamily: F.m, fontSize: 10, color: C.text }}>APRENDIZADO: {calib.analise.causa_provavel}</div>}
                    {(calib.analise?.ajuste_para_proximo_reel ?? []).map((t: string, i: number) => <div key={i} style={{ fontFamily: F.m, fontSize: 10, color: C.text }}>{i + 1}. {t}</div>)}
                    {(calib.padroes ?? []).map((p: any, i: number) => <div key={i} style={{ fontFamily: F.m, fontSize: 9, color: p.confirmado ? C.gold : C.muted }}>{p.confirmado ? "CONFIRMADO" : "INDÍCIO"} · {p.texto} ({p.amostras}/3)</div>)}
                  </div>
                )}
                {!calib && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {!ontemResult && <Empty>Sem dados reais ainda. Lance o resultado do último reel.</Empty>}
                    {ontemResult && <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>Já lançado: {dash(ontemResult.pct_3s)}% passou dos 3s · {dash(ontemResult.tempo_medio)}s médio. Enviar de novo atualiza os números.</div>}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      <input style={inp} inputMode="decimal" value={pct3} onChange={e => setPct3(e.target.value)} placeholder="% passou dos 3s" />
                      <input style={inp} inputMode="decimal" value={medio} onChange={e => setMedio(e.target.value)} placeholder="Tempo médio (s)" />
                    </div>
                    <Label>% de audiência no fim de cada faixa</Label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 6 }}>
                      {ontemBlocos.map(b => <input key={String(b.id)} style={inp} inputMode="decimal" value={faixas[b.id] ?? ""} onChange={e => setFaixas(f => ({ ...f, [b.id]: e.target.value }))} placeholder={`B${b.id} · ${dash(b.tempo)}`} />)}
                    </div>
                    <button type="button" onClick={calibrar} disabled={calibBusy} style={{ ...btn(true), flex: "none", cursor: calibBusy ? "wait" : "pointer" }}>{calibBusy ? "Comparando previsto x real..." : "Lançar retenção"}</button>
                  </div>
                )}
              </>
            )}
          </Panel>

          {/* Suas fórmulas */}
          <Panel>
            <Label color={C.cyan}>Suas fórmulas</Label>
            {!formulas.length ? <Empty>Nenhuma fórmula com resultado ainda. Lance a retenção dos reels para formar o ranking.</Empty> : (
              <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto", paddingBottom: 4 }}>
                {formulas.map((f, i) => (
                  <div key={f.formula_id} style={{ minWidth: 120, border: `1px solid ${i === 0 ? `${C.gold}60` : `${C.cyan}25`}`, background: i === 0 ? `${C.gold}10` : `${C.cyan}06`, padding: "10px 12px", flexShrink: 0 }}>
                    <div style={{ fontFamily: F.m, fontSize: 8, color: i === 0 ? C.gold : C.muted }}>#{i + 1} · {f.usos} {f.usos === 1 ? "REEL" : "REELS"}</div>
                    <div style={{ fontFamily: F.t, fontSize: 13, fontWeight: 700, color: C.white, marginTop: 2 }}>{f.nome}</div>
                    <div style={{ height: 3, background: C.dim, marginTop: 8 }}><div style={{ height: "100%", width: `${Math.min(100, Number(f.retencao_3s_media ?? 0))}%`, background: i === 0 ? C.gold : C.cyan }} /></div>
                    <div style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: i === 0 ? C.gold : C.cyan, marginTop: 4 }}>{f.retencao_3s_media == null ? "—" : `${f.retencao_3s_media}%`}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Alertas */}
          <Panel>
            <Label color={C.red}>Alertas e oportunidades</Label>
            {!alertas.length ? <Empty>Nenhum alerta agora.</Empty> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                {alertas.map((a) => (
                  <div key={a.tipo} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: F.m, fontSize: 8, color: a.cor, border: `1px solid ${a.cor}50`, padding: "2px 6px", flexShrink: 0, marginTop: 1 }}>{a.tipo}</span>
                    <span style={{ fontFamily: F.m, fontSize: 10, color: C.text, lineHeight: 1.5 }}>{a.txt}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Meta 90 dias */}
          <Panel>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <Label color={C.cyan}>Meta de 90 dias</Label>
              {meta && <span style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: C.gold }}>{meta.real}%</span>}
            </div>
            {meta ? (
              <>
                <div style={{ fontFamily: F.m, fontSize: 9, color: C.text, marginTop: 6 }}>
                  {goal.metrica === "reels_publicados" ? `${meta.atual}/${meta.alvo} reels com resultado lançado` : `${meta.atual}% / ${meta.alvo}% média passou dos 3s`} · DIA {meta.dia}/90
                </div>
                <div style={{ position: "relative", height: 8, background: C.dim, marginTop: 10 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${meta.planejado}%`, background: `${C.cyan}30` }} />
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${meta.real}%`, background: C.gold }} />
                  <div style={{ position: "absolute", left: `${meta.planejado}%`, top: -3, bottom: -3, width: 1, background: C.cyan }} />
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                  <span style={{ fontFamily: F.m, fontSize: 9, color: C.cyan }}>▮ PLANEJADO {meta.planejado}%</span>
                  <span style={{ fontFamily: F.m, fontSize: 9, color: C.gold }}>▮ REAL {meta.real}%</span>
                  <button type="button" onClick={() => setGoal(null)} style={{ marginLeft: "auto", fontFamily: F.m, fontSize: 9, color: C.muted, background: "none", border: "none", cursor: "pointer" }}>EDITAR</button>
                </div>
              </>
            ) : (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                <select style={inp} value={goalForm.metrica} onChange={e => setGoalForm(g => ({ ...g, metrica: e.target.value }))}>
                  <option value="reels_publicados">Reels com resultado lançado</option>
                  <option value="retencao_3s">Média de % que passou dos 3s</option>
                </select>
                <input style={inp} inputMode="decimal" value={goalForm.alvo} onChange={e => setGoalForm(g => ({ ...g, alvo: e.target.value }))} placeholder="Alvo em 90 dias" />
                <button type="button" onClick={salvarMeta} style={{ ...btn(true), flex: "none" }}>DEFINIR META</button>
              </div>
            )}
          </Panel>

          <Panel>
            <CommandCenterAutomation onChanged={load} />
          </Panel>

          <Panel>
            <Label>ATALHOS</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 6, marginTop: 10 }}>
              {atalhos.map((a) => (
                <button key={a.id} type="button" onClick={() => (a.zone ? onOpenZone?.(a.zone) : a.tool ? onOpenTool?.(a.tool) : undefined)}
                  style={{ background: `${C.cyan}08`, border: `1px solid ${C.cyan}25`, color: C.text, fontFamily: F.t, fontWeight: 700, fontSize: 12, letterSpacing: 1, padding: "12px 4px", cursor: "pointer", borderRadius: 0 }}>
                  {a.nome}
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {gravando && blocos.length > 0 && <ModoGravacao blocos={blocos} onClose={() => setGravando(false)} />}
    </div>
  );
}
