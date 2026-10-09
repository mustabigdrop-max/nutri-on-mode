import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ReelFactoryPanel from "./ReelFactoryPanel";
import CommandCenterLower from "./CommandCenterLower";
import EngineInstructionsPanel from "./EngineInstructionsPanel";
import CardStudioPanel from "./CardStudioPanel";
import { loadAndSeed, emptyCore, CORE_KEYS, ENGINE_LABEL, type EngineRow } from "@/lib/engineInstructions";
import { BlockQuality, QualitySeal, VoiceText, sealReason } from "./ReelBlockQuality";
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
  const [auto, setAuto] = useState<any>(null);
  const [chips, setChips] = useState<string[]>([]);
  const [genErr, setGenErr] = useState<string | null>(null);
  const [engRows, setEngRows] = useState<EngineRow[]>([]);
  const [engUser, setEngUser] = useState("");
  const [engOpen, setEngOpen] = useState(false);
  const loadEngine = async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; setEngUser(user.id); setEngRows(await loadAndSeed(user.id)); };
  useEffect(() => { loadEngine(); }, []);
  const vazias = engRows.length ? emptyCore(engRows) : [];
  const MOTOR_INSTRUCOES = { ativas: engRows.length ? CORE_KEYS.length - vazias.length : 0, total: CORE_KEYS.length };
  const abrirInstrucoes = () => { setEngOpen(true); setTimeout(() => document.getElementById("cc-instrucoes")?.scrollIntoView({ behavior: "smooth" }), 50); };
  const [fresh, setFresh] = useState(false);
  const [atlas, setAtlas] = useState<{ id: number; nome: string }[]>([]);
  const [bankAll, setBankAll] = useState<any[] | null>(null);
  const [pillarsAll, setPillarsAll] = useState<any[] | null>(null);
  const [leadsCount, setLeadsCount] = useState<number | null>(null);
  const [dica, setDica] = useState<{ id: number; nome: string } | null>(null);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoaded(true); return; }
    const since = new Date(Date.now() - 120 * 864e5).toISOString();
    const [s, r, f, h, g, a, bk, pl, ba, pa, ld] = await Promise.all([
      supabase.from("retention_scripts").select("id, created_at, tema, objetivo, tom, roteiro, notas, nota_geral, estrutura, formula_id, fonte_status, fonte_conferida_em, angulo, motivos_nota, status_qualidade").eq("user_id", user.id).gte("created_at", since).order("created_at", { ascending: false }).limit(200),
      supabase.from("retention_results").select("id, script_id, pct_3s, tempo_medio, curva_real, created_at").eq("user_id", user.id).gte("created_at", since).order("created_at", { ascending: false }),
      supabase.from("creator_formula_stats").select("formula_id, usos, retencao_3s_media").eq("user_id", user.id),
      supabase.from("hook_formulas").select("id, nome").order("id"),
      supabase.from("creator_goals").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("cc_automation_settings").select("limite_diario, pausado").eq("user_id", user.id).maybeSingle(),
      supabase.from("reel_bank").select("tema").eq("user_id", user.id).in("status", ["novo", "guardado"]).order("nota", { ascending: false }).limit(12),
      supabase.from("content_pillars").select("nome, ativo").eq("user_id", user.id).eq("ativo", true).order("ordem").limit(8),
      supabase.from("reel_bank").select("id, tema, pilar, status, created_at, updated_at, script_id, agendado_para").eq("user_id", user.id).neq("status", "descartado").order("created_at", { ascending: false }).limit(1000),
      supabase.from("content_pillars").select("nome, chave, created_at").eq("user_id", user.id).eq("ativo", true),
      supabase.from("leads").select("id", { count: "exact", head: true }),
    ]);
    setScripts(s.data ?? []); setResults(r.data ?? []);
    setAtlas((h.data ?? []) as any[]);
    setBankAll(ba.error ? null : (ba.data ?? [])); setPillarsAll(pa.error ? null : (pa.data ?? []));
    setLeadsCount(ld.error ? null : (ld.count ?? null));
    setFormulas(((f.data ?? []) as any[]).map(x => ({ ...x, nome: (h.data ?? []).find((y: any) => y.id === x.formula_id)?.nome ?? `Fórmula ${x.formula_id}` }))
      .sort((a, b) => Number(b.retencao_3s_media ?? -1) - Number(a.retencao_3s_media ?? -1)));
    setAuto(a.data ?? null);
    const bankT = ((bk.data ?? []) as any[]).map(x => x.tema).filter(Boolean);
    const pilT = ((pl.data ?? []) as any[]).map(x => x.nome).filter(Boolean);
    const mix: string[] = []; for (let i = 0; mix.length < 6 && (i < bankT.length || i < pilT.length); i++) { if (bankT[i]) mix.push(bankT[i]); if (pilT[i] && mix.length < 6) mix.push(pilT[i]); }
    setChips([...new Set(mix)].slice(0, 6));
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

  const [angOpen, setAngOpen] = useState(false);
  const gerar = async () => {
    if (!tema.trim()) return toast.error("Escreva o tema do reel");
    setGenErr(null); setStage("arquiteto");
    try {
      const script = await runGerarReel({ tema: tema.trim(), objetivo, tom: "direto", ...(dica ? { formula_dica: dica.id } : {}) } as any, setStage);
      setDica(null);
      toast.success("Reel de hoje pronto");
      setTemaOpen(false); setTema(""); setBlocoAberto(null);
      await load(); setTodayIdx(0); setFresh(true);
      void script;
    } catch (e: any) { setGenErr(e?.message || "Não foi possível gerar o reel."); } finally { setStage(null); }
  };

  const trocarAngulo = async (a: any) => {
    if (!reel) return;
    setGenErr(null); setStage("arquiteto"); setAngOpen(false);
    try {
      const outros = [reel.angulo.escolhido, ...reel.angulo.outros.filter((o: any) => o.titulo !== a.titulo)];
      await runGerarReel({ tema: reel.angulo?.escolhido ? (reel.tema) : reel.tema, objetivo: reel.objetivo ?? objetivo, tom: "direto", angulo_escolhido: a, angulo_outros: outros } as any, setStage);
      toast.success("Reel regerado com o novo ângulo");
      await load(); setTodayIdx(0); setFresh(true);
    } catch (e: any) { setGenErr(e?.message || "Não foi possível regerar o reel."); } finally { setStage(null); }
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

  const hoje = useMemo(() => new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).toUpperCase(), []);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const testarFormula = (id: number, nome: string) => {
    setDica({ id, nome }); setTemaOpen(true); scrollTo("cc-missao");
    toast.success(`${nome} vai como sugestão na próxima geração`);
  };
  const rodarAgora = () => {
    const lim = auto?.limite_diario ?? 1;
    if (doDia.length >= lim) return toast.error(`Limite de hoje atingido: ${doDia.length} de ${lim} gerações.`);
    if (!window.confirm(`Rodar agora usa 1 geração (3 passes: Arquiteto, Redator e Crítico).\nHoje: ${doDia.length} de ${lim} usadas. Continuar?`)) return;
    setTemaOpen(true); if (!tema && chips[0]) setTema(chips[0]); scrollTo("cc-missao");
  };
  const busy = stage !== null;
  const abertura = reel ? (blocos[0]?.fala ?? reel.roteiro?.gancho) : null;
  const comp: any[] = calib?.comparacao ?? ontemResult?.curva_real?.comparacao ?? [];

  const exemplo = loaded && results.length === 0;
  const stepIdx = stage === "arquiteto" ? 0 : stage === "redator" ? 1 : stage ? 2 : -1;
  const motorOk = MOTOR_INSTRUCOES.ativas === MOTOR_INSTRUCOES.total && !auto?.pausado;
  const led = !loaded ? C.muted : motorOk ? "#5DCAA5" : "#EF9F27";
  const fontes: any[] = (reel?.roteiro?.fontes ?? reel?.estrutura?.fontes ?? []) as any[];
  const notaR = reel?.nota_geral == null ? null : Number(reel.nota_geral);
  const Skel = ({ h }: { h: number }) => <div className="cc-skel" style={{ height: h, marginTop: 8 }} />;

  return (
    <div className="cc-anim cc-root" style={{ position: "relative", background: C.bg, borderRadius: 0, overflow: "hidden", overflowX: "hidden", padding: "14px 14px 20px", margin: "-16px -16px 0" }}>
      <style>{CSS}</style>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04, backgroundImage: `linear-gradient(${C.cyan} 1px, transparent 1px), linear-gradient(90deg, ${C.cyan} 1px, transparent 1px)`, backgroundSize: "36px 36px" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.05, mixBlendMode: "overlay", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")" }} />

      <div className="cc-stack" style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Barra SIGNAL */}
        <div className="cc-rise" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, borderBottom: `1px solid ${C.cyan}22`, paddingBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="cc-anim" style={{ width: 7, height: 7, borderRadius: "50%", background: led, boxShadow: `0 0 8px ${led}`, animation: "ccDot 1.6s ease infinite" }} />
            <span style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: C.white, letterSpacing: 2 }}>SIGNAL</span>
            <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{hoje}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            {[
              { t: `STREAK ${streak} ${streak === 1 ? "DIA" : "DIAS"}`, c: C.gold },
              { t: auto?.limite_diario ? `HOJE ${doDia.length} DE ${auto.limite_diario}` : `HOJE ${doDia.length} ${doDia.length === 1 ? "REEL" : "REELS"}`, c: C.cyan },
              { t: `MOTOR: ${MOTOR_INSTRUCOES.ativas} DE ${MOTOR_INSTRUCOES.total} INSTRUÇÕES ATIVAS`, c: motorOk ? "#5DCAA5" : "#EF9F27" },
            ].map(x => <span key={x.t} style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 1, color: x.c, border: `1px solid ${x.c}40`, padding: "2px 6px", whiteSpace: "nowrap" }}>{x.t}</span>)}
            <button type="button" onClick={abrirInstrucoes} style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 1, color: C.cyan, background: "none", border: `1px solid ${C.cyan}60`, padding: "2px 6px", cursor: "pointer", borderRadius: 0 }}>INSTRUÇÕES</button>
          </div>
        </div>

        <Panel glow={C.cyan}><Label color={C.cyan}>Núcleo de Atenção</Label>
          {loaded ? <Nucleo score={score} subs={subs} exemplo={exemplo} /> : <><div className="cc-skel" style={{ width: 180, height: 180, borderRadius: "50%", margin: "14px auto 0" }} /><Skel h={40} /></>}
        </Panel>

        {/* Missão de hoje */}
        <Panel glow={C.gold}>
          <div id="cc-missao" style={{ scrollMarginTop: 80 }} />
          <Label color={C.gold}>Missão de hoje</Label>
          {dica && (
            <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontFamily: F.m, fontSize: 9, color: C.cyan, border: `1px solid ${C.cyan}40`, padding: "4px 8px" }}>
              Fórmula sugerida ao Arquiteto: {dica.nome}
              <button type="button" onClick={() => setDica(null)} style={{ fontFamily: F.m, fontSize: 9, color: C.muted, background: "none", border: "none", cursor: "pointer" }}>remover</button>
            </div>
          )}
          {engRows.length > 0 && (
            <button type="button" onClick={vazias.length ? abrirInstrucoes : undefined} style={{ marginTop: 6, fontFamily: F.m, fontSize: 9, letterSpacing: 1, color: vazias.length ? "#EF9F27" : "#5DCAA5", background: "none", border: `1px solid ${vazias.length ? "#EF9F27" : "#5DCAA5"}50`, padding: "2px 8px", cursor: vazias.length ? "pointer" : "default", borderRadius: 0 }}>
              Motor: {MOTOR_INSTRUCOES.ativas} de {MOTOR_INSTRUCOES.total} instruções ativas
            </button>
          )}
          {vazias.length > 0 && (
            <div style={{ marginTop: 8, border: `1px solid ${C.red}60`, padding: 8, fontFamily: F.m, fontSize: 10, color: C.red }}>
              Instrução vazia: {vazias.map(k => ENGINE_LABEL[k]).join(", ")}.{" "}
              <button type="button" onClick={abrirInstrucoes} style={{ fontFamily: F.m, fontSize: 10, color: C.white, background: "none", border: `1px solid ${C.red}`, padding: "2px 8px", cursor: "pointer", borderRadius: 0 }}>Abrir instruções do motor</button>
            </div>
          )}
          {!loaded ? <><Skel h={22} /><Skel h={36} /><Skel h={42} /></> : reel ? (
            <div className={fresh ? "cc-rise" : undefined}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
                <svg width={46} height={46} viewBox="0 0 46 46" style={{ flexShrink: 0 }} aria-label={`Nota ${dash(notaR)}`}>
                  <circle cx={23} cy={23} r={19} fill="none" stroke={`${C.cyan}18`} strokeWidth={4} />
                  <circle cx={23} cy={23} r={19} fill="none" stroke={corSeg(notaR ?? undefined)} strokeWidth={4} strokeDasharray={`${((notaR ?? 0) / 10) * 119.4} 119.4`} transform="rotate(-90 23 23)" />
                  <text x={23} y={28} textAnchor="middle" fill={C.white} fontFamily={F.t} fontWeight={700} fontSize={14}>{dash(notaR)}</text>
                </svg>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: C.white, lineHeight: 1.2 }}>{reel.tema}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {reel.estrutura?.formula_nome && <span style={{ fontFamily: F.m, fontSize: 9, color: C.cyan, border: `1px solid ${C.cyan}40`, padding: "2px 8px" }}>{String(reel.estrutura.formula_nome).toUpperCase()}</span>}
                    <QualitySeal status={reel.status_qualidade} nota={notaR} motivo={sealReason(reel)} />
                    {reel.angulo?.escolhido?.titulo && <span style={{ fontFamily: F.m, fontSize: 9, color: C.cyan, border: `1px solid ${C.cyan}40`, padding: "2px 8px" }}>Ângulo: {reel.angulo.escolhido.titulo}</span>}
                    {reel.angulo?.outros?.length > 0 && <button type="button" onClick={() => setAngOpen(o => !o)} style={{ fontFamily: F.m, fontSize: 9, color: C.cyan, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>Ver outros {reel.angulo.outros.length} ângulos</button>}
                    {fontes.length > 0 && <span style={{ fontFamily: F.m, fontSize: 9, color: "#5DCAA5", border: "1px solid #5DCAA550", padding: "2px 8px" }}>{fontes.length} {fontes.length === 1 ? "FONTE" : "FONTES"}</span>}
                    {doDia.length > 1 && <button type="button" onClick={() => { setTodayIdx((todayIdx + 1) % doDia.length); setBlocoAberto(null); }} style={{ fontFamily: F.m, fontSize: 9, color: C.muted, background: "none", border: `1px solid ${C.dim}`, padding: "2px 8px", cursor: "pointer", borderRadius: 0 }}>OPÇÃO {Math.min(todayIdx, doDia.length - 1) + 1}/{doDia.length} ↻</button>}
                  </div>
                </div>
              </div>
              {angOpen && reel.angulo?.outros?.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {reel.angulo.outros.map((a: any) => (
                    <button key={a.titulo} type="button" disabled={busy} onClick={() => trocarAngulo(a)} style={{ textAlign: "left", fontFamily: F.m, fontSize: 10, color: C.text, background: `${C.cyan}06`, border: `1px solid ${C.cyan}25`, padding: "6px 8px", cursor: "pointer", borderRadius: 0 }}>
                      <b style={{ color: C.cyan }}>{a.titulo}</b>{a.pontos != null ? ` · ${a.pontos} pts` : ""}<br />{a.tensao}
                    </button>
                  ))}
                </div>
              )}
              {blocos.length > 0 ? (
                <div style={{ marginTop: 12, borderLeft: `1px solid ${C.cyan}30`, marginLeft: 6, paddingLeft: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  {blocos.map((b, i) => (
                    <div key={String(b.id)} className="cc-anim" style={{ position: "relative", animation: `ccBlockIn .4s ease ${i * 0.06}s both` }}>
                      <span style={{ position: "absolute", left: -19, top: 4, width: 9, height: 9, background: corSeg(b.nota), boxShadow: `0 0 6px ${corSeg(b.nota)}` }} />
                      <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{dash(b.tempo)} · NOTA <span style={{ color: corSeg(b.nota) }}>{dash(b.nota)}</span></div>
                      <div style={{ fontFamily: F.m, fontSize: 11, color: C.text, lineHeight: 1.5, marginTop: 2 }}>{b.fala ? <VoiceText text={String(b.fala)} /> : dash(b.fala)}</div>
                      <BlockQuality scriptId={reel.id} blocoId={Number(b.id)} motivo={(reel.motivos_nota ?? []).find((m: any) => m.id === Number(b.id))} onUpdated={() => load()} />
                    </div>
                  ))}
                </div>
              ) : abertura && <div style={{ fontFamily: F.m, fontSize: 11, color: C.text, marginTop: 10, lineHeight: 1.5 }}>ABERTURA: “{String(abertura)}”</div>}
            </div>
          ) : <Empty>Nenhum reel gerado hoje.</Empty>}

          {loaded && (temaOpen || !reel) && !busy && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <input style={{ ...inp, fontSize: 12, padding: "10px 12px", borderColor: `${C.cyan}40` }} value={tema} onChange={e => setTema(e.target.value)} placeholder="Tema do reel" />
              {chips.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {chips.map(c => (
                    <button key={c} type="button" onClick={() => setTema(c)} style={{ fontFamily: F.m, fontSize: 9, color: tema === c ? C.cyan : C.text, background: tema === c ? `${C.cyan}18` : `${C.cyan}06`, border: `1px solid ${tema === c ? C.cyan : `${C.cyan}25`}`, padding: "4px 8px", cursor: "pointer", borderRadius: 0, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c}</button>
                  ))}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 6 }}>
                {[["alcance", "Alcance", "◎"], ["autoridade", "Autoridade", "◆"], ["venda", "Venda", "➚"]].map(([id, l, ic]) => {
                  const on = objetivo === id;
                  return (
                    <button key={id} type="button" onClick={() => setObjetivo(id)} aria-pressed={on}
                      style={{ background: on ? `${C.cyan}14` : "transparent", border: `1px solid ${on ? C.cyan : C.dim}`, color: on ? C.cyan : C.muted, boxShadow: on ? `0 0 12px -2px ${C.cyan}90, inset 0 0 8px ${C.cyan}30` : "none", fontFamily: F.t, fontWeight: 700, fontSize: 12, padding: "8px 0", cursor: "pointer", borderRadius: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <span style={{ fontSize: 16, lineHeight: 1 }}>{ic}</span>{l}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {busy && (
            <div style={{ marginTop: 14 }} role="status" aria-live="polite">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 4 }}>
                {["Arquitetando", "Redigindo", "Criticando"].map((l, i) => (
                  <div key={l}>
                    <div style={{ height: 4, background: i < stepIdx ? C.cyan : i === stepIdx ? `${C.cyan}` : C.dim, opacity: i === stepIdx ? 1 : i < stepIdx ? 0.7 : 1, boxShadow: i <= stepIdx ? `0 0 8px ${C.cyan}` : "none", position: "relative", overflow: "hidden" }}>
                      {i === stepIdx && <span className="cc-anim" style={{ position: "absolute", inset: 0, width: "40%", background: "linear-gradient(90deg, transparent, #ffffffaa, transparent)", animation: "ccSweep 1.2s linear infinite" }} />}
                    </div>
                    <div style={{ fontFamily: F.m, fontSize: 9, marginTop: 5, color: i <= stepIdx ? C.cyan : C.muted, letterSpacing: 1 }}>{i < stepIdx ? "✓ " : ""}{l.toUpperCase()}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: F.m, fontSize: 10, color: C.text, marginTop: 8 }}>{STAGE_LABEL[stage ?? "arquiteto"] ?? "Projetando atenção..."}</div>
            </div>
          )}

          {genErr && !busy && (
            <div style={{ marginTop: 12, border: `1px solid ${C.red}50`, background: `${C.red}0c`, padding: "8px 10px" }}>
              <div style={{ fontFamily: F.m, fontSize: 10, color: C.red, lineHeight: 1.5 }}>{genErr}</div>
              <button type="button" onClick={gerar} style={{ ...btn(), flex: "none", marginTop: 8, padding: "6px 14px", borderColor: `${C.red}70`, color: C.red }}>TENTAR DE NOVO</button>
            </div>
          )}

          {loaded && !busy && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {reel && !temaOpen ? (
                <>
                  <button type="button" onClick={() => setTemaOpen(true)} style={btn()}>TROCAR TEMA</button>
                  <button type="button" onClick={() => setGravando(true)} disabled={!blocos.length} style={{ ...btn(true), position: "relative", overflow: "hidden" }}>
                    <span className="cc-anim" style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "35%", background: "linear-gradient(90deg, transparent, #ffffff40, transparent)", animation: "ccSweep4 4s ease infinite" }} />
                    ▶ Gravar agora
                  </button>
                </>
              ) : (
                <>
                  {reel && <button type="button" onClick={() => setTemaOpen(false)} style={btn()}>CANCELAR</button>}
                  <button type="button" onClick={gerar} style={{ ...btn(true), position: "relative", overflow: "hidden", padding: "13px 0", fontSize: 15, letterSpacing: 1, boxShadow: `0 0 18px -6px ${C.gold}` }}>
                    <span className="cc-anim" style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "35%", background: "linear-gradient(90deg, transparent, #ffffff55, transparent)", animation: "ccSweep4 4s ease infinite" }} />
                    {reel ? "GERAR OUTRA OPÇÃO" : "GERAR REEL DE HOJE"}
                  </button>
                </>
              )}
            </div>
          )}
        </Panel>


        <Panel glow={C.gold}>
          <div id="cc-fabrica" style={{ scrollMarginTop: 80 }} />
          <ReelFactoryPanel onChosen={load} />
        </Panel>

        <Panel glow={C.cyan}><div id="cc-cards" style={{ scrollMarginTop: 80 }} /><CardStudioPanel /></Panel>

        {engUser && <Panel glow={C.cyan}><EngineInstructionsPanel rows={engRows} userId={engUser} open={engOpen} onToggle={() => setEngOpen(o => !o)} onChanged={loadEngine} /></Panel>}

        <div className="cc-grid">
          <Panel>
            <div id="cc-linha-atencao" style={{ scrollMarginTop: 80 }}>
              <Label color={C.cyan}>Linha da Atenção</Label>
              <div style={{ marginTop: 10 }}><LinhaAtencao blocos={blocos} open={blocoAberto} onToggle={setBlocoAberto} /></div>
            </div>
          </Panel>

          {/* Resultado de ontem */}
          <Panel>
            <div id="cc-resultado" style={{ scrollMarginTop: 80 }} />
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

          <CommandCenterLower loaded={loaded} scripts={scripts} results={results} stats={formulas} atlas={atlas}
            bank={bankAll} pillars={pillarsAll} leadsCount={leadsCount} goal={goal} meta={meta} goalForm={goalForm}
            setGoalForm={setGoalForm} salvarMeta={salvarMeta} streak={streak} reelsHoje={doDia.length}
            blocosFracos={blocos.filter(b => b.nota != null && b.nota < 7)}
            onTestar={testarFormula} onRodarAgora={rodarAgora} onLancar={() => scrollTo("cc-resultado")} onFabrica={() => scrollTo("cc-fabrica")}
            onOpenZone={onOpenZone} onOpenTool={onOpenTool} reload={load} />
        </div>
      </div>

      {gravando && blocos.length > 0 && <ModoGravacao blocos={blocos} onClose={() => setGravando(false)} />}
    </div>
  );
}
