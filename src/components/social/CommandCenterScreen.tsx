import { useEffect, useMemo, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════
   COMMAND CENTER — tela principal do Social ON
   Visual + navegação apenas. Todos os dados são de
   exemplo (placeholder) até a lógica ser conectada.
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
@keyframes ccSweep { 0%{transform:translateX(-100%)} 100%{transform:translateX(220%)} }
@media (prefers-reduced-motion: reduce) {
  .cc-anim, .cc-anim * { animation: none !important; transition: none !important; }
}
.cc-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
@media (min-width: 900px) { .cc-grid { grid-template-columns: 1fr 1fr; } }
`;

/** Painel de vidro escuro com canto cortado e brilho fino no topo. */
function Panel({ children, style, glow }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
  return (
    <div
      style={{
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

/* ── Dados de exemplo ── */
const SAMPLE = {
  streak: 6,
  score: 78,
  subs: [
    { k: "SHARE", v: 82 },
    { k: "HOOK", v: 74 },
    { k: "SEO", v: 69 },
    { k: "SAVE", v: 88 },
  ],
  missao: {
    tema: "Por que você estanca no cutting mesmo comendo pouco",
    formula: "F3 · Quebra de crença",
    abertura: "Comer menos pode ser exatamente o que está te travando.",
  },
  blocos: [
    { id: 1, t: "0-2s", nota: 9, fala: "Comer menos pode ser o que te trava.", tela: "MENOS COMIDA = PIOR?", est: "Corte seco no rosto" },
    { id: 2, t: "2-6s", nota: 8, fala: "Seu corpo defende o peso quando o déficit passa do ponto.", tela: "DEFESA METABÓLICA", est: "Zoom + gráfico caindo" },
    { id: 3, t: "6-13s", nota: 7, fala: "O metabolismo adapta. A fome sobe. O gasto cai.", tela: "ADAPTAÇÃO", est: "B-roll prato vazio" },
    { id: 4, t: "13-20s", nota: 6, fala: "A saída não é cortar mais. É periodizar o déficit.", tela: "PERIODIZAR", est: "Mudança de cena" },
    { id: 5, t: "20-28s", nota: 8, fala: "Semanas de déficit alternadas com semanas de manutenção.", tela: "DÉFICIT + MANUTENÇÃO", est: "Calendário na tela" },
    { id: 6, t: "28-35s", nota: 9, fala: "Comenta PLANO que eu te mando a estrutura.", tela: "COMENTA PLANO", est: "Apontar pra baixo" },
  ],
  ontem: {
    previsto: [9, 8, 7, 6, 8, 9],
    real: [8, 7, 6, 4, 7, 8],
    queda: "Bloco 4",
  },
  formulas: [
    { nome: "Quebra de crença", ret: 74 },
    { nome: "Curiosidade aberta", ret: 68 },
    { nome: "Prova pessoal", ret: 61 },
    { nome: "Medo de perder", ret: 55 },
    { nome: "Identidade", ret: 49 },
    { nome: "Pergunta direta", ret: 42 },
  ],
  alertas: [
    { tipo: "TENDÊNCIA", txt: "Temas de 'metabolismo adaptativo' subindo no nicho esta semana.", cor: C.cyan },
    { tipo: "RECICLAGEM", txt: "O reel de 12/09 reteve 71% — candidato a virar carrossel.", cor: C.gold },
    { tipo: "RITMO", txt: "Bloco 4 caiu nos últimos 3 reels. Encurtar a explicação do meio.", cor: C.red },
    { tipo: "META", txt: "Faltam 2 publicações para bater a meta semanal de 5.", cor: C.muted },
  ],
  meta90: { planejado: 62, real: 48 },
};

/* ── Núcleo de Atenção (anel SVG) ── */
function Nucleo() {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setShown(SAMPLE.score); return; }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1200);
      setShown(Math.round(SAMPLE.score * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const R = 84, CX = 110, CY = 110, circ = 2 * Math.PI * R;
  const arc = (v: number, i: number) => {
    const a0 = -90 + i * 90 + 6, a1 = -90 + i * 90 + 84;
    const r = 64;
    const p = (a: number) => [CX + r * Math.cos((a * Math.PI) / 180), CY + r * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a0 + (84 * v) / 100);
    return { d: `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`, end: p(a1) };
  };
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 4px" }}>
      <div
        style={{
          position: "absolute", inset: -40, pointerEvents: "none",
          background: `radial-gradient(circle at 50% 45%, ${C.cyan}14, transparent 60%)`,
        }}
      />
      <svg width={220} height={220} viewBox="0 0 220 220" className="cc-anim" style={{ animation: "ccPulse 4s ease-in-out infinite" }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={`${C.cyan}18`} strokeWidth={6} />
        <circle
          cx={CX} cy={CY} r={R} fill="none" stroke={C.cyan} strokeWidth={6}
          strokeLinecap="butt"
          strokeDasharray={`${(shown / 100) * circ} ${circ}`}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ filter: `drop-shadow(0 0 6px ${C.cyan}80)` }}
        />
        {SAMPLE.subs.map((s, i) => (
          <path
            key={s.k}
            d={arc(s.v, i).d}
            fill="none" stroke={s.v >= 80 ? C.gold : C.cyan} strokeWidth={3}
            opacity={0.9}
          />
        ))}
      </svg>
      <div style={{ position: "absolute", top: 88, textAlign: "center" }}>
        <div style={{ fontFamily: F.t, fontSize: 52, fontWeight: 700, color: C.white, lineHeight: 1 }}>{shown}</div>
        <Label color={C.cyan}>Content Score</Label>
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 12 }}>
        {SAMPLE.subs.map((s) => (
          <div key={s.k} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: s.v >= 80 ? C.gold : C.cyan }}>{s.v}</div>
            <Label>{s.k}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Linha da Atenção ── */
function LinhaAtencao({ open, onToggle }: { open: number | null; onToggle: (i: number | null) => void }) {
  const cor = (n: number) => (n >= 8 ? C.gold : n >= 6 ? C.cyan : C.red);
  const W = 600, H = 60;
  const pts = SAMPLE.blocos.map((b, i) => [20 + (i * (W - 40)) / (SAMPLE.blocos.length - 1), H - 8 - (b.nota / 10) * (H - 16)]);
  const path = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
  const sel = open != null ? SAMPLE.blocos[open] : null;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 60, display: "block" }}>
        <path d={path} fill="none" stroke={`${C.cyan}60`} strokeWidth={1.5} strokeDasharray="3 3" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={cor(SAMPLE.blocos[i].nota)} />
        ))}
      </svg>
      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
        {SAMPLE.blocos.map((b, i) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onToggle(open === i ? null : i)}
            className="cc-anim"
            style={{
              flex: 1, border: `1px solid ${open === i ? cor(b.nota) : `${cor(b.nota)}40`}`,
              background: open === i ? `${cor(b.nota)}22` : `${cor(b.nota)}0d`,
              borderRadius: 0, padding: "6px 2px", cursor: "pointer",
              animation: `ccBlockIn .4s ease ${i * 0.08}s both`,
            }}
          >
            <div style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: cor(b.nota) }}>{b.nota}</div>
            <div style={{ fontFamily: F.m, fontSize: 7, color: C.muted }}>{b.t}</div>
          </button>
        ))}
      </div>
      {sel && (
        <div style={{ marginTop: 8, borderLeft: `2px solid ${cor(sel.nota)}`, padding: "8px 12px", background: `${C.cyan}08` }}>
          <div style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: C.white, lineHeight: 1.3 }}>“{sel.fala}”</div>
          <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: F.m, fontSize: 9, color: C.cyan }}>TELA: {sel.tela}</span>
            <span style={{ fontFamily: F.m, fontSize: 9, color: C.gold }}>ESTÍMULO: {sel.est}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Gráfico previsto x real ── */
function PrevReal() {
  const W = 600, H = 90;
  const mk = (arr: number[]) =>
    arr.map((v, i) => [20 + (i * (W - 40)) / (arr.length - 1), H - 10 - (v / 10) * (H - 20)]);
  const line = (pts: number[][]) => pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
  const prev = mk(SAMPLE.ontem.previsto), real = mk(SAMPLE.ontem.real);
  const dropIdx = 3;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 90, display: "block" }}>
      <path d={line(prev)} fill="none" stroke={`${C.cyan}70`} strokeWidth={1.5} strokeDasharray="4 3" />
      <path d={line(real)} fill="none" stroke={C.gold} strokeWidth={2} />
      {real.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === dropIdx ? 5 : 3} fill={i === dropIdx ? C.red : C.gold} />
      ))}
      <text x={real[dropIdx][0]} y={real[dropIdx][1] + 18} textAnchor="middle" fill={C.red} fontSize={11} fontFamily={F.m}>
        ▼ {SAMPLE.ontem.queda}
      </text>
    </svg>
  );
}

/* ── Modo Gravação (tela cheia) ── */
function ModoGravacao({ onClose }: { onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [seg, setSeg] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    timer.current = setInterval(() => setSeg((s) => s + 1), 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);
  const b = SAMPLE.blocos[idx];
  const avancar = () => {
    if (idx < SAMPLE.blocos.length - 1) { setIdx(idx + 1); setSeg(0); }
    else setDone(true);
  };
  const mm = String(Math.floor(seg / 60)).padStart(2, "0");
  const ss = String(seg % 60).padStart(2, "0");
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999, background: "#000",
        display: "flex", flexDirection: "column", padding: 20,
      }}
      onClick={!done ? avancar : undefined}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Label color={C.cyan}>MODO GRAVAÇÃO · BLOCO {idx + 1}/{SAMPLE.blocos.length}</Label>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{ background: "none", border: `1px solid ${C.dim}`, color: C.muted, fontFamily: F.m, fontSize: 10, padding: "4px 10px", cursor: "pointer", borderRadius: 0 }}
        >
          SAIR
        </button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: F.t, fontSize: 34, fontWeight: 700, color: C.gold }}>ROTEIRO COMPLETO</div>
            <div style={{ fontFamily: F.m, fontSize: 11, color: C.muted, marginTop: 8 }}>Boa gravação. Revise os takes e poste no horário sugerido.</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: F.m, fontSize: 11, color: C.cyan, letterSpacing: 2 }}>{b.t} · ALVO {b.t.split("-")[1]}</div>
            <div style={{ fontFamily: F.t, fontSize: 34, fontWeight: 700, color: C.white, lineHeight: 1.25 }}>{b.fala}</div>
            <div style={{ fontFamily: F.m, fontSize: 12, color: C.gold }}>TELA: {b.tela}</div>
            <div style={{ fontFamily: F.m, fontSize: 11, color: C.muted }}>ESTÍMULO: {b.est}</div>
          </>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: F.m, fontSize: 22, color: C.cyan }}>{mm}:{ss}</span>
        {!done && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); avancar(); }}
            style={{
              background: C.gold, color: "#0A0A0A", border: "none", borderRadius: 0,
              fontFamily: F.t, fontWeight: 700, fontSize: 16, padding: "12px 28px", cursor: "pointer",
            }}
          >
            GRAVEI →
          </button>
        )}
        {done && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{
              background: C.cyan, color: "#0A0A0A", border: "none", borderRadius: 0,
              fontFamily: F.t, fontWeight: 700, fontSize: 16, padding: "12px 28px", cursor: "pointer",
            }}
          >
            CONCLUIR
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Tela principal ── */
export default function CommandCenterScreen({
  onOpenTool,
  onOpenZone,
}: {
  onOpenTool?: (id: string) => void;
  onOpenZone?: (zone: string) => void;
}) {
  const [blocoAberto, setBlocoAberto] = useState<number | null>(null);
  const [gravando, setGravando] = useState(false);
  const hoje = useMemo(
    () => new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).toUpperCase(),
    [],
  );
  const atalhos: { id: string; nome: string; zone?: string; tool?: string }[] = [
    { id: "studio", nome: "STUDIO", tool: "studio" },
    { id: "strategy", nome: "STRATEGY", zone: "strategy" },
    { id: "planner", nome: "PLANNER", tool: "calendario" },
    { id: "growth", nome: "GROWTH", zone: "growth" },
    { id: "learn", nome: "LEARN", zone: "learn" },
  ];

  return (
    <div
      className="cc-anim"
      style={{
        position: "relative", background: C.bg, borderRadius: 0, overflow: "hidden",
        padding: "14px 14px 20px", margin: "-16px -16px 0",
      }}
    >
      <style>{CSS}</style>
      {/* fundo em camadas: grade + grão */}
      <div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04,
          backgroundImage: `linear-gradient(${C.cyan} 1px, transparent 1px), linear-gradient(90deg, ${C.cyan} 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />
      <div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.05, mixBlendMode: "overlay",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
        }}
      />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* 1 · Barra superior SIGNAL */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="cc-anim" style={{ width: 7, height: 7, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 8px ${C.cyan}`, animation: "ccDot 1.6s ease infinite" }} />
            <span style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: C.white, letterSpacing: 2 }}>SIGNAL</span>
            <Label color={C.cyan}>ATIVO</Label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: F.m, fontSize: 10, color: C.gold }}>🔥 {SAMPLE.streak} DIAS</span>
            <span style={{ fontFamily: F.m, fontSize: 10, color: C.muted }}>{hoje}</span>
          </div>
        </div>

        {/* 2 · Núcleo de Atenção */}
        <Panel glow={C.cyan}>
          <Nucleo />
        </Panel>

        {/* 3 · Missão de hoje */}
        <Panel glow={C.gold}>
          <Label color={C.gold}>MISSÃO DE HOJE</Label>
          <div style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: C.white, lineHeight: 1.25, marginTop: 6 }}>
            {SAMPLE.missao.tema}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: F.m, fontSize: 9, color: C.cyan, border: `1px solid ${C.cyan}40`, padding: "2px 8px" }}>
              {SAMPLE.missao.formula.toUpperCase()}
            </span>
          </div>
          <div style={{ fontFamily: F.m, fontSize: 11, color: C.text, marginTop: 10, lineHeight: 1.5 }}>
            ABERTURA: “{SAMPLE.missao.abertura}”
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              type="button"
              onClick={() => document.getElementById("cc-linha-atencao")?.scrollIntoView({ behavior: "smooth", block: "center" })}
              style={{
                flex: 1, background: "transparent", border: `1px solid ${C.cyan}50`, color: C.cyan,
                fontFamily: F.t, fontWeight: 700, fontSize: 13, padding: "10px 0", cursor: "pointer", borderRadius: 0,
              }}
            >
              LINHA DA ATENÇÃO
            </button>
            <button
              type="button"
              onClick={() => setGravando(true)}
              style={{
                flex: 1, background: C.gold, border: "none", color: "#0A0A0A",
                fontFamily: F.t, fontWeight: 700, fontSize: 13, padding: "10px 0", cursor: "pointer", borderRadius: 0,
                position: "relative", overflow: "hidden",
              }}
            >
              <span className="cc-anim" style={{ position: "absolute", top: 0, bottom: 0, width: "40%", background: "linear-gradient(90deg, transparent, #ffffff30, transparent)", animation: "ccSweep 2.8s ease infinite" }} />
              ▶ GRAVAR AGORA
            </button>
          </div>
        </Panel>

        {/* desktop: duas colunas a partir daqui */}
        <div className="cc-grid">
          {/* 4 · Linha da Atenção */}
          <Panel>
            <div id="cc-linha-atencao" style={{ scrollMarginTop: 80 }}>
              <Label color={C.cyan}>LINHA DA ATENÇÃO</Label>
              <div style={{ marginTop: 10 }}>
                <LinhaAtencao open={blocoAberto} onToggle={setBlocoAberto} />
              </div>
            </div>
          </Panel>

          {/* 5 · Resultado de ontem */}
          <Panel>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Label color={C.gold}>RESULTADO DE ONTEM</Label>
              <button
                type="button"
                onClick={() => onOpenTool?.("estrategista")}
                style={{
                  background: `${C.cyan}12`, border: `1px solid ${C.cyan}40`, color: C.cyan,
                  fontFamily: F.t, fontWeight: 700, fontSize: 11, padding: "5px 12px", cursor: "pointer", borderRadius: 0,
                }}
              >
                LANÇAR RETENÇÃO
              </button>
            </div>
            <div style={{ marginTop: 8 }}>
              <PrevReal />
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
              <span style={{ fontFamily: F.m, fontSize: 9, color: C.cyan }}>- - PREVISTO</span>
              <span style={{ fontFamily: F.m, fontSize: 9, color: C.gold }}>— REAL</span>
              <span style={{ fontFamily: F.m, fontSize: 9, color: C.red }}>● MAIOR QUEDA</span>
            </div>
          </Panel>

          {/* 6 · Suas fórmulas */}
          <Panel>
            <Label color={C.cyan}>SUAS FÓRMULAS</Label>
            <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto", paddingBottom: 4 }}>
              {SAMPLE.formulas.map((f, i) => (
                <div
                  key={f.nome}
                  style={{
                    minWidth: 120, border: `1px solid ${i === 0 ? `${C.gold}60` : `${C.cyan}25`}`,
                    background: i === 0 ? `${C.gold}10` : `${C.cyan}06`, padding: "10px 12px", flexShrink: 0,
                  }}
                >
                  <div style={{ fontFamily: F.m, fontSize: 8, color: i === 0 ? C.gold : C.muted }}>#{i + 1}</div>
                  <div style={{ fontFamily: F.t, fontSize: 13, fontWeight: 700, color: C.white, marginTop: 2 }}>{f.nome}</div>
                  <div style={{ height: 3, background: `${C.dim}`, marginTop: 8 }}>
                    <div style={{ height: "100%", width: `${f.ret}%`, background: i === 0 ? C.gold : C.cyan }} />
                  </div>
                  <div style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: i === 0 ? C.gold : C.cyan, marginTop: 4 }}>{f.ret}%</div>
                </div>
              ))}
            </div>
          </Panel>

          {/* 7 · Alertas e oportunidades */}
          <Panel>
            <Label color={C.red}>ALERTAS E OPORTUNIDADES</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {SAMPLE.alertas.map((a) => (
                <div key={a.tipo} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: F.m, fontSize: 8, color: a.cor, border: `1px solid ${a.cor}50`, padding: "2px 6px", flexShrink: 0, marginTop: 1 }}>
                    {a.tipo}
                  </span>
                  <span style={{ fontFamily: F.m, fontSize: 10, color: C.text, lineHeight: 1.5 }}>{a.txt}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* 8 · Meta 90 dias */}
          <Panel>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <Label color={C.cyan}>META 90 DIAS</Label>
              <span style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: C.gold }}>{SAMPLE.meta90.real}%</span>
            </div>
            <div style={{ position: "relative", height: 8, background: C.dim, marginTop: 10 }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${SAMPLE.meta90.planejado}%`, background: `${C.cyan}30` }} />
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${SAMPLE.meta90.real}%`, background: C.gold }} />
              <div style={{ position: "absolute", left: `${SAMPLE.meta90.planejado}%`, top: -3, bottom: -3, width: 1, background: C.cyan }} />
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
              <span style={{ fontFamily: F.m, fontSize: 9, color: C.cyan }}>▮ PLANEJADO {SAMPLE.meta90.planejado}%</span>
              <span style={{ fontFamily: F.m, fontSize: 9, color: C.gold }}>▮ REAL {SAMPLE.meta90.real}%</span>
            </div>
          </Panel>

          {/* 9 · Atalhos */}
          <Panel>
            <Label>ATALHOS</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 6, marginTop: 10 }}>
              {atalhos.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => (a.zone ? onOpenZone?.(a.zone) : a.tool ? onOpenTool?.(a.tool) : undefined)}
                  style={{
                    background: `${C.cyan}08`, border: `1px solid ${C.cyan}25`, color: C.text,
                    fontFamily: F.t, fontWeight: 700, fontSize: 12, letterSpacing: 1,
                    padding: "12px 4px", cursor: "pointer", borderRadius: 0,
                  }}
                >
                  {a.nome}
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {gravando && <ModoGravacao onClose={() => setGravando(false)} />}
    </div>
  );
}
