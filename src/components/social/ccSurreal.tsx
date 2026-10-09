import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/* Camada visual "surreal" do Command Center: só apresentação, nenhuma regra de negócio. */

export type FxLevel = "completo" | "equilibrado" | "leve";
export const FX_LABEL: Record<FxLevel, string> = { completo: "Completo", equilibrado: "Equilibrado", leve: "Leve" };
const KEY = "cc_efeitos";
const isLevel = (v: unknown): v is FxLevel => v === "completo" || v === "equilibrado" || v === "leve";

export function defaultFxLevel(): FxLevel {
  const mem = (navigator as any)?.deviceMemory;
  return typeof mem === "number" && mem <= 4 ? "leve" : "equilibrado";
}

export function prefersReduced() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Nível de efeitos: perfil do usuário (metadados da conta) com cópia local para abrir rápido. */
export function useFxLevel() {
  const [level, setLevelState] = useState<FxLevel>(() => {
    try { const v = localStorage.getItem(KEY); if (isLevel(v)) return v; } catch { /* */ }
    return defaultFxLevel();
  });
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const v = data.user?.user_metadata?.[KEY];
      if (isLevel(v)) { setLevelState(v); try { localStorage.setItem(KEY, v); } catch { /* */ } }
    });
  }, []);
  const setLevel = (v: FxLevel) => {
    setLevelState(v);
    try { localStorage.setItem(KEY, v); } catch { /* */ }
    supabase.auth.updateUser({ data: { [KEY]: v } }).catch(() => { /* fica salvo localmente */ });
  };
  return [level, setLevel] as const;
}

/** Hook utilitário: aba visível? */
function useVisibleRef() {
  const r = useRef(typeof document === "undefined" ? true : !document.hidden);
  useEffect(() => {
    const on = () => { r.current = !document.hidden; };
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  return r;
}

/* ── 2) Campo de Atenção ── */
export function AttentionField({ level, score, paused }: { level: FxLevel; score: number | null; paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const visible = useVisibleRef();
  const pausedRef = useRef(paused); pausedRef.current = paused;
  const scoreRef = useRef(score); scoreRef.current = score;
  const off = level === "leve" || prefersReduced();

  useEffect(() => {
    if (off) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0;
    const size = () => { w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const ro = new ResizeObserver(size); ro.observe(canvas);
    const max = level === "completo" ? 120 : 60;
    let cap = max;
    const mk = () => { const z = Math.random(); return { x: Math.random() * w, y: Math.random() * h, z, vx: (Math.random() - 0.5) * (0.15 + z * 0.5), vy: (Math.random() - 0.5) * (0.15 + z * 0.5), cyan: Math.random() > 0.4 }; };
    const ps = Array.from({ length: max }, mk);
    const ptr = { x: 0, y: 0, on: false };
    const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = true; };
    const onLeave = () => { ptr.on = false; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    let raf = 0, frames = 0, t0 = performance.now(), last = t0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible.current || pausedRef.current) { last = t; t0 = t; frames = 0; return; }
      frames++;
      if (t - t0 >= 1000) {
        const fps = (frames * 1000) / (t - t0);
        if (fps < 45 && cap > 15) cap = Math.max(15, Math.floor(cap * 0.75));
        frames = 0; t0 = t;
      }
      const dt = Math.min(3, (t - last) / 16.7); last = t;
      const sc = scoreRef.current;
      const n = Math.min(cap, Math.round(cap * (0.35 + 0.65 * ((sc ?? 50) / 100))));
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < n; i++) {
        const p = ps[i];
        if (ptr.on) { const dx = ptr.x - p.x, dy = ptr.y - p.y, d2 = dx * dx + dy * dy; if (d2 < 40000 && d2 > 1) { const f = 0.004 * p.z; p.vx += dx * f / Math.sqrt(d2); p.vy += dy * f / Math.sqrt(d2); } }
        p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < 0) p.x += w; if (p.x > w) p.x -= w; if (p.y < 0) p.y += h; if (p.y > h) p.y -= h;
        const a = 0.12 + p.z * 0.35, r = 0.4 + p.z * 1.3;
        ctx.fillStyle = p.cyan ? `rgba(0,212,255,${a})` : `rgba(239,159,39,${a * 0.8})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerleave", onLeave); };
  }, [level, off, visible]);

  if (off) return null;
  return (
    <div aria-hidden style={{ position: "sticky", top: 0, height: "100vh", marginBottom: "-100vh", pointerEvents: "none", zIndex: 0 }}>
      <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block", opacity: paused ? 0.25 : 1, transition: "opacity .4s" }} />
    </div>
  );
}

/* ── 3) Parallax + brilho de borda (CSS vars no root) ── */
export function useParallax(root: React.RefObject<HTMLElement>, level: FxLevel) {
  useEffect(() => {
    const el = root.current; if (!el) return;
    if (level === "leve" || prefersReduced()) { el.style.setProperty("--px", "0"); el.style.setProperty("--py", "0"); return; }
    let raf = 0; let tx = 0, ty = 0;
    const apply = () => { raf = 0; el.style.setProperty("--px", tx.toFixed(3)); el.style.setProperty("--py", ty.toFixed(3)); };
    const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2; ty = (e.clientY / window.innerHeight - 0.5) * 2; queue();
      const panel = (e.target as HTMLElement)?.closest?.(".cc-panel") as HTMLElement | null;
      if (panel) { const r = panel.getBoundingClientRect(); panel.style.setProperty("--mx", `${e.clientX - r.left}px`); panel.style.setProperty("--my", `${e.clientY - r.top}px`); }
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 30)); ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30)); queue();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    if (level === "completo") window.addEventListener("deviceorientation", onTilt);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("deviceorientation", onTilt); if (raf) cancelAnimationFrame(raf); };
  }, [root, level]);
}

/* ── 6) Linha de onda viva ── */
export function WaveStrip({ stage, level, pulseKey }: { stage: string | null; level: FxLevel; pulseKey: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const visible = useVisibleRef();
  const stageRef = useRef(stage); stageRef.current = stage;
  const pulseRef = useRef(-1);
  useEffect(() => { if (pulseKey > 0) pulseRef.current = 0; }, [pulseKey]);
  const still = level === "leve" || prefersReduced();
  useEffect(() => {
    const c = ref.current; if (!c) return; const ctx = c.getContext("2d"); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0; const h = 18;
    const size = () => { w = c.clientWidth; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); const ro = new ResizeObserver(size); ro.observe(c);
    let raf = 0, t = 0, amp = 2;
    const draw = () => {
      const s = stageRef.current;
      const target = s === "arquiteto" ? 4 : s === "redator" ? 6 : s ? 7.5 : 1.6;
      amp += (target - amp) * 0.05;
      const speed = s ? 0.12 : 0.03;
      t += speed;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(0,212,255,0.75)"; ctx.shadowColor = "#00D4FF"; ctx.shadowBlur = s ? 6 : 2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) { const y = h / 2 + Math.sin(x * 0.045 + t) * amp * Math.sin(x * 0.007 + t * 0.3) + (s ? Math.sin(x * 0.13 - t * 2) * amp * 0.25 : 0); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.shadowBlur = 0;
      if (pulseRef.current >= 0) {
        const px = pulseRef.current * w;
        const g = ctx.createRadialGradient(px, h / 2, 0, px, h / 2, 40);
        g.addColorStop(0, "rgba(255,255,255,0.9)"); g.addColorStop(0.4, "rgba(239,159,39,0.5)"); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.fillRect(px - 40, 0, 80, h);
        pulseRef.current += 0.02; if (pulseRef.current > 1.1) pulseRef.current = -1;
      }
    };
    if (still) { draw(); return () => ro.disconnect(); }
    const loop = () => { raf = requestAnimationFrame(loop); if (visible.current) draw(); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [still, visible]);
  return <canvas ref={ref} aria-hidden style={{ width: "100%", height: 18, display: "block" }} />;
}

/* ── 7) Onda de luz ao concluir ação ── */
export function lightBurst(color = "#00D4FF") {
  if (prefersReduced()) return;
  const root = document.querySelector(".cc-root") as HTMLElement | null;
  if (!root || root.classList.contains("cc-fx-leve")) return;
  const d = document.createElement("div");
  d.className = "cc-burst";
  d.style.setProperty("--bc", color);
  root.appendChild(d);
  setTimeout(() => d.remove(), 1300);
}

/* ── 1) Núcleo tridimensional ── */
export function Nucleus3D({ shown, score, exemplo, children }: { shown: number; score: number | null; exemplo: boolean; children: React.ReactNode }) {
  const col = exemplo ? "#EF9F27" : "#00D4FF";
  const s = score ?? 0;
  const thick = 3 + (s / 100) * 7;
  const glow = 4 + (s / 100) * 14;
  const R = 78, circ = 2 * Math.PI * R;
  return (
    <div className="cc-n3d" style={{ position: "relative", width: 220, height: 220, perspective: 700 }}>
      <div className="cc-anim cc-ring cc-ring1" style={{ borderColor: `${col}55` }} />
      <div className="cc-anim cc-ring cc-ring2" style={{ borderColor: `${col}38` }} />
      <div className="cc-anim cc-ring3" style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
        <svg width={220} height={220} viewBox="0 0 220 220" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <circle cx={110} cy={110} r={R} fill="none" stroke={`${col}18`} strokeWidth={thick} />
          <circle cx={110} cy={110} r={R} fill="none" stroke={col} strokeWidth={thick}
            strokeDasharray={`${(shown / 100) * circ} ${circ}`} transform="rotate(-90 110 110)"
            style={{ filter: `drop-shadow(0 0 ${glow}px ${col})` }} />
        </svg>
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

/* ── 4) Paleta de comandos ── */
export type PaletteAction = { id: string; label: string; hint?: string; run: () => void };
export function CommandPalette({ open, onClose, actions }: { open: boolean; onClose: () => void; actions: PaletteAction[] }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const list = useMemo(() => actions.filter(a => norm(a.label + " " + (a.hint ?? "")).includes(norm(q))), [actions, q]);
  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current?.focus(), 10); } }, [open]);
  useEffect(() => { setSel(0); }, [q]);
  if (!open) return null;
  const exec = (a?: PaletteAction) => { if (!a) return; onClose(); setTimeout(a.run, 30); };
  return (
    <div role="dialog" aria-modal aria-label="Paleta de comandos" onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(2,2,5,0.78)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" }}>
      <div onClick={e => e.stopPropagation()} className="cc-palette"
        style={{ width: "min(560px, 92vw)", background: "rgba(10,10,18,0.96)", border: "1px solid #00D4FF55", clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)", boxShadow: "0 20px 60px -20px #00D4FF60" }}>
        <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar ação..."
          onKeyDown={e => {
            if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(list.length - 1, s + 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
            else if (e.key === "Enter") { e.preventDefault(); exec(list[sel]); }
            else if (e.key === "Escape") { e.preventDefault(); onClose(); }
          }}
          style={{ width: "100%", boxSizing: "border-box", background: "transparent", border: "none", borderBottom: "1px solid #00D4FF33", color: "#F0F0F8", fontFamily: "'Space Mono',monospace", fontSize: 13, padding: "14px 16px", outline: "none" }} />
        <div role="listbox" style={{ maxHeight: "50vh", overflowY: "auto", padding: 6 }}>
          {list.length === 0 && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#888", padding: 12 }}>Nenhuma ação encontrada.</div>}
          {list.map((a, i) => (
            <button key={a.id} type="button" role="option" aria-selected={i === sel} onMouseEnter={() => setSel(i)} onClick={() => exec(a)}
              style={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 10, textAlign: "left", background: i === sel ? "#00D4FF18" : "transparent", borderLeft: `2px solid ${i === sel ? "#00D4FF" : "transparent"}`, border: "none", color: i === sel ? "#F0F0F8" : "#C8C8D8", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 15, padding: "9px 12px", cursor: "pointer", borderRadius: 0 }}>
              <span>{a.label}</span>{a.hint && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#888", alignSelf: "center" }}>{a.hint}</span>}
            </button>
          ))}
        </div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#888", padding: "6px 14px 10px", borderTop: "1px solid #ffffff10" }}>↑ ↓ navegar · Enter executar · Esc fechar</div>
      </div>
    </div>
  );
}

export const SURREAL_CSS = `
@keyframes ccR1 { from{transform:rotateX(72deg) rotateZ(0)} to{transform:rotateX(72deg) rotateZ(360deg)} }
@keyframes ccR2 { from{transform:rotateY(68deg) rotateZ(0)} to{transform:rotateY(68deg) rotateZ(-360deg)} }
@keyframes ccR3 { 0%,100%{transform:rotateX(10deg) rotateY(-8deg)} 50%{transform:rotateX(-8deg) rotateY(10deg)} }
@keyframes ccBurst { from{opacity:.55;transform:translate(-50%,-50%) scale(.1)} to{opacity:0;transform:translate(-50%,-50%) scale(1)} }
.cc-ring { position:absolute; inset:2px; border-radius:50%; border:1px dashed; transform-style:preserve-3d; }
.cc-ring1 { animation: ccR1 22s linear infinite; }
.cc-ring2 { inset:12px; border-style:dotted; border-width:2px; animation: ccR2 30s linear infinite; }
.cc-ring3 { animation: ccR3 14s ease-in-out infinite; }
.cc-panel { translate: calc(var(--px,0) * var(--depth,3px)) calc(var(--py,0) * var(--depth,3px)); transition: translate .5s cubic-bezier(.2,.7,.2,1), opacity .4s, filter .4s; }
.cc-panel::before { content:""; position:absolute; inset:0; pointer-events:none; opacity:0; transition:opacity .3s; background: radial-gradient(220px circle at var(--mx,50%) var(--my,0), #00D4FF1c, transparent 70%); }
.cc-panel:hover::before { opacity:1; }
.cc-panel::after { content:""; position:absolute; inset:0; pointer-events:none; opacity:.035; background: repeating-linear-gradient(0deg, #ffffff 0 1px, transparent 1px 3px); }
.cc-fx-leve .cc-panel { translate:none; }
.cc-fx-leve .cc-panel::before { display:none; }
.cc-fx-leve .cc-anim[style*="infinite"], .cc-fx-leve .cc-skel { animation:none !important; }
.cc-burst { position:absolute; left:50%; top:30%; width:180vmax; height:180vmax; border-radius:50%; pointer-events:none; z-index:5; background: radial-gradient(circle, transparent 55%, var(--bc) 62%, transparent 68%); animation: ccBurst 1.2s ease-out forwards; }
.cc-focus .cc-stack > *:not(.cc-keep) { opacity:.06; filter: blur(2px); pointer-events:none; }
.cc-focus .cc-keep { position:relative; z-index:3; box-shadow: 0 0 0 1px #EF9F2760, 0 30px 80px -30px #EF9F2780; }
.cc-focus .cc-keep .cc-hide-focus { display:none; }
.cc-focus-veil { position:absolute; inset:0; background: rgba(0,0,0,.55); pointer-events:none; z-index:1; transition: opacity .4s; }
@media (prefers-reduced-motion: reduce) { .cc-panel { translate:none !important; } .cc-burst { display:none; } }
`;
