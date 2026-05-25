import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, Mic, Send, Loader2, ChevronLeft, ArrowLeft } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────────────────────
const C = {
  bg: "#040810",
  surface: "#060c14",
  surface2: "#08101a",
  gold: "#c8a020",
  goldLight: "#f0c840",
  teal: "#00d4aa",
  tealLight: "#60ffdd",
  m: "#9080ff",
  mL: "#c0b8ff",
  cc: "#00e888",
  ccL: "#60ffbb",
  e: "#ffaa00",
  eL: "#ffd060",
  border: "rgba(255,255,255,0.08)",
  text: "#e8e8f0",
  textDim: "#7a7e8a",
};

// ─────────────────────────────────────────────────────────────
// DIMENSION CONTENT (Estudo)
// ─────────────────────────────────────────────────────────────
const DIMS = {
  M: {
    name: "MINDSET",
    color: C.m,
    colorLight: C.mL,
    subtitle: "Fundação cognitiva · crenças e identidade",
    body: `O Mindset é o software operacional do comportamento. Carol Dweck (Stanford) demonstrou que indivíduos com Growth Mindset interpretam falha como dado, não veredito — e por isso atingem desempenho 47% superior em domínios complexos. Prochaska mapeou os 5 estágios de mudança (pré-contemplação, contemplação, preparação, ação, manutenção) e Baumeister provou que willpower é um recurso finito que se regenera com glicose, sono e sentido. Frankl, em Logoterapia, fechou o circuito: a única liberdade inalienável é a escolha da resposta entre estímulo e ação. Sem Mindset destravado, todo protocolo nutricional desaba na primeira fricção emocional.`,
    authors: ["Carol Dweck", "Prochaska", "Baumeister", "Viktor Frankl"],
    quote: "Entre o estímulo e a resposta há um espaço. Nesse espaço está nosso poder de escolher.",
  },
  C: {
    name: "COMPORTAMENTO",
    color: C.cc,
    colorLight: C.ccL,
    subtitle: "Sistema de hábitos · design de rotina",
    body: `Comportamento é função de três variáveis: Motivação, Habilidade e Prompt (B=MAP, BJ Fogg/Stanford). Quando o prompt aparece, se Motivação × Habilidade estiver acima do threshold, o comportamento dispara. James Clear refinou: hábitos são votos de identidade — cada execução é evidência de quem você está se tornando. Duhigg decompôs o loop em Cue → Routine → Reward, e demonstrou que mudar a rotina mantendo o cue e a recompensa é a única via sustentável. Hábitos não são metas: são a arquitetura invisível que decide 43% das ações diárias sem consumir willpower.`,
    authors: ["BJ Fogg", "James Clear", "Charles Duhigg"],
    quote: "Você não sobe ao nível de seus objetivos. Você cai ao nível de seus sistemas.",
  },
  E: {
    name: "EXECUÇÃO",
    color: C.e,
    colorLight: C.eL,
    subtitle: "Disciplina ativa · foco e entrega",
    body: `Execução é a tradução de Mindset + Comportamento em output mensurável. Cal Newport (Georgetown) provou que Deep Work — blocos de 90+ minutos sem distração — é a única forma de produzir valor não-comoditizado em economias do conhecimento. Gary Keller (The ONE Thing) impõe o filtro: qual é a única coisa que, se feita, torna o resto mais fácil ou desnecessário? Covey hierarquiza por urgência × importância (Quadrante II). David Allen (GTD) descarrega cognição para sistemas externos. Sem Execução, Mindset vira filosofia e Comportamento vira terapia.`,
    authors: ["Cal Newport", "Gary Keller", "Stephen Covey", "David Allen"],
    quote: "Foco extremo. Um alvo de cada vez. O resto é ruído.",
  },
} as const;

type DimKey = keyof typeof DIMS;

// ─────────────────────────────────────────────────────────────
// EXERCISES
// ─────────────────────────────────────────────────────────────
const EXERCISES: Record<DimKey, { key: string; title: string; meta: string }[]> = {
  M: [
    { key: "m0", title: "Diário de crenças limitantes", meta: "10min · manhã" },
    { key: "m1", title: "Reframing cognitivo", meta: "5min · noite" },
    { key: "m2", title: "Leitura: Mindset — Dweck", meta: "20min · livre" },
    { key: "m3", title: "Mapa de identidade MCE", meta: "15min · semanal" },
  ],
  C: [
    { key: "c0", title: "Mapeamento de gatilhos", meta: "10min · tarde" },
    { key: "c1", title: "Stack de hábitos — Fogg", meta: "5min · manhã" },
    { key: "c2", title: "Auditoria semanal de rotina", meta: "15min · domingo" },
    { key: "c3", title: "Environment design sprint", meta: "20min · fim de semana" },
  ],
  E: [
    { key: "e0", title: "Bloco Deep Work 90min", meta: "manhã" },
    { key: "e1", title: "MIT — 3 tarefas críticas", meta: "5min · início do dia" },
    { key: "e2", title: "Revisão semanal GTD", meta: "30min · domingo" },
    { key: "e3", title: "Proteção de calendário", meta: "10min · domingo" },
  ],
};

// ─────────────────────────────────────────────────────────────
// DIAGNOSTIC QUESTIONS
// ─────────────────────────────────────────────────────────────
const QUESTIONS: { dim: DimKey; q: string; opts: string[] }[] = [
  { dim: "M", q: "Quando enfrento um obstáculo sério, minha reação é:", opts: ["Desisto rapidamente", "Tento mas frustro fácil", "Persisto com esforço", "Me energiza — é gasolina"] },
  { dim: "M", q: "Minha crença sobre minha capacidade de mudar hábitos:", opts: ["Não consigo mudar", "Mudo às vezes", "Mudo com método", "É natural para mim"] },
  { dim: "M", q: "Quando falho em um objetivo, o que acontece internamente?", opts: ["Culpa e abandono", "Frustração longa", "Reflexão e ajuste", "Recalibro e sigo no mesmo dia"] },
  { dim: "C", q: "Minha consistência com hábitos de saúde nos últimos 30 dias:", opts: ["<25% dos dias", "25–50%", "50–75%", ">75% dos dias"] },
  { dim: "C", q: "Quando meu ambiente não favorece meu objetivo:", opts: ["Cedo sempre", "Cedo na maioria", "Resisto com esforço", "Ambiente sob controle total"] },
  { dim: "C", q: "Meus hábitos foram projetados conscientemente?", opts: ["Nunca pensei nisso", "Alguns sim", "Maioria sim", "Design completo e revisado"] },
  { dim: "E", q: "Minha taxa de conclusão de tarefas importantes esta semana:", opts: ["<30%", "30–50%", "50–80%", ">80%"] },
  { dim: "E", q: "Quando preciso fazer algo difícil e importante:", opts: ["Adio sempre", "Adio às vezes", "Faço com fricção", "Protejo esse tempo"] },
  { dim: "E", q: "Minha capacidade de trabalho focado sem distração:", opts: ["<30 min", "30–60 min", "60–90 min", "90min+ em fluxo"] },
];

// ─────────────────────────────────────────────────────────────
// PARTICLES CANVAS
// ─────────────────────────────────────────────────────────────
function ParticlesBg() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let raf = 0;
    const colors = [C.teal, C.gold, C.m];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const parts = Array.from({ length: 24 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * 3)],
    }));
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.fillStyle = p.c; ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
      });
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 80) {
            ctx.strokeStyle = parts[i].c; ctx.globalAlpha = (1 - d / 80) * 0.18;
            ctx.lineWidth = 0.5; ctx.beginPath();
            ctx.moveTo(parts[i].x, parts[i].y); ctx.lineTo(parts[j].x, parts[j].y); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.5 }} />;
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function MCEPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scores, setScores] = useState({ m: 50, c: 50, e: 50 });
  const [activeDim, setActiveDim] = useState<DimKey>("M");
  const [tab, setTab] = useState<"estudo" | "diag" | "ex" | "prog">("estudo");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState(0);
  const [autoMsg, setAutoMsg] = useState<{ text: string; nonce: number } | null>(null);

  // Load saved data
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: s } = await supabase.from("mce_scores").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (s) setScores({ m: s.score_m, c: s.score_c, e: s.score_e });
      const { data: ex } = await supabase.from("mce_exercises_done").select("exercise_key,completed_at").eq("user_id", user.id);
      if (ex) {
        const map: Record<string, boolean> = {};
        const days = new Set<string>();
        ex.forEach((r: any) => { map[r.exercise_key] = true; days.add(new Date(r.completed_at).toISOString().slice(0, 10)); });
        setDone(map);
        setStreak(days.size);
      }
    })();
  }, [user]);

  // Debounced save on manual changes
  const saveTimer = useRef<number | null>(null);
  const queueSave = useCallback((next: typeof scores, source: "manual" | "diagnostico") => {
    if (!user) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      await supabase.from("mce_scores").insert({ user_id: user.id, score_m: next.m, score_c: next.c, score_e: next.e, source });
    }, source === "manual" ? 2000 : 0);
  }, [user]);

  const updateScore = (k: keyof typeof scores, v: number) => {
    setScores((prev) => { const next = { ...prev, [k]: v }; queueSave(next, "manual"); return next; });
  };

  const toggleExercise = async (key: string) => {
    if (!user) return;
    const wasDone = done[key];
    setDone((d) => ({ ...d, [key]: !wasDone }));
    if (!wasDone) {
      await supabase.from("mce_exercises_done").insert({ user_id: user.id, exercise_key: key });
    } else {
      await supabase.from("mce_exercises_done").delete().eq("user_id", user.id).eq("exercise_key", key);
    }
  };

  const dim = DIMS[activeDim];
  const totalDone = Object.values(done).filter(Boolean).length;
  const mceScore = Math.round((scores.m + scores.c + scores.e) / 3);
  const critical = (Object.keys(scores) as (keyof typeof scores)[]).reduce((a, b) => (scores[a] < scores[b] ? a : b));
  const criticalDim: DimKey = critical.toUpperCase() as DimKey;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: C.bg, color: C.text, fontFamily: "'Courier New', monospace" }}>
      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      {/* Scan line */}
      <div className="fixed left-0 right-0 h-px pointer-events-none z-10" style={{ background: "rgba(0,212,170,0.04)", animation: "mceScan 8s linear infinite" }} />
      <ParticlesBg />

      <style>{`
        @keyframes mceScan { 0%{top:0} 100%{top:100%} }
        @keyframes mcePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.2)} }
        @keyframes ringExp { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2);opacity:0} }
        @keyframes wave { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
        .mce-btn { transition: all .2s ease; }
        .mce-btn:hover { border-color: ${C.gold}; }
      `}</style>

      <div className="relative z-20 max-w-6xl mx-auto px-4 py-4">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded hover:bg-white/5" aria-label="Voltar">
              <ArrowLeft className="w-4 h-4" style={{ color: C.textDim }} />
            </button>
            <div className="text-base tracking-widest">
              <span style={{ color: "#fff" }}>NUTRI</span>
              <span style={{ color: C.gold }}>ON</span>
              <span style={{ color: C.textDim }}> · </span>
              <span style={{ color: C.teal }}>MCE INTELLIGENCE</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span style={{ color: C.textDim }}>Sistema comportamental</span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.cc, animation: "mcePulse 1.5s ease-in-out infinite" }} />
            <span style={{ color: C.cc }}>ONLINE</span>
          </div>
        </div>

        {/* DATA COLS + NEURAL WEB */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <DataCol side="left" scores={scores} />
          <NeuralWeb scores={scores} onSelect={(d) => { setActiveDim(d); setTab("estudo"); }} />
          <DataCol side="right" scores={scores} />
        </div>

        {/* SCORE STRIP */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(["M", "C", "E"] as DimKey[]).map((k) => {
            const d = DIMS[k];
            const sk = k.toLowerCase() as keyof typeof scores;
            const isActive = activeDim === k;
            return (
              <button key={k} onClick={() => { setActiveDim(k); setTab("estudo"); }}
                className="text-left p-3 mce-btn" style={{
                  background: C.surface, border: `0.5px solid ${isActive ? d.color : C.border}`, borderRadius: 4,
                }}>
                <div className="flex items-baseline justify-between mb-2">
                  <span style={{ color: d.color, fontSize: 44, fontWeight: 700, lineHeight: 1 }}>{k}</span>
                  <span style={{ color: C.textDim, fontSize: 11 }}>{d.name}</span>
                </div>
                <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div style={{
                    width: `${scores[sk]}%`, height: "100%", background: d.color,
                    transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
                  }} />
                </div>
                <div className="text-[12px] mt-1" style={{ color: C.textDim }}>{scores[sk]}/100</div>
              </button>
            );
          })}
        </div>

        {/* TABS */}
        <div className="flex gap-1 mb-4 border-b" style={{ borderColor: C.border }}>
          {([["estudo", "Estudo"], ["diag", "Diagnóstico"], ["ex", "Exercícios"], ["prog", "Progresso"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className="px-4 py-2 text-[12px] uppercase tracking-widest mce-btn"
              style={{
                color: tab === k ? C.gold : C.textDim,
                borderBottom: `2px solid ${tab === k ? C.gold : "transparent"}`,
              }}>{l}</button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="mb-6">
          {tab === "estudo" && <EstudoTab dim={dim} scores={scores} onChange={updateScore} />}
          {tab === "diag" && <DiagTab onComplete={(next) => {
            setScores(next);
            queueSave(next, "diagnostico");
            const critK = (Object.keys(next) as (keyof typeof next)[]).reduce((a, b) => (next[a] < next[b] ? a : b));
            const critDim = DIMS[critK.toUpperCase() as DimKey];
            const txt = `Diagnóstico concluído. M ${next.m} · C ${next.c} · E ${next.e}. Dimensão crítica: ${critDim.name.charAt(0) + critDim.name.slice(1).toLowerCase()}. Protocolo ativado.`;
            setAutoMsg({ text: txt, nonce: Date.now() });
            setTab("prog");
          }} />}
          {tab === "ex" && <ExTab dim={activeDim} done={done} onToggle={toggleExercise} />}
          {tab === "prog" && <ProgTab streak={streak} totalDone={totalDone} mceScore={mceScore} scores={scores} criticalDim={criticalDim} />}
        </div>

        {/* CHAT */}
        <MceChat scores={scores} autoMessage={autoMsg} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUBCOMPONENTS
// ─────────────────────────────────────────────────────────────
function DataCol({ side, scores }: { side: "left" | "right"; scores: { m: number; c: number; e: number } }) {
  const items = side === "left"
    ? [{ l: "SCORE M", v: scores.m, c: C.m }, { l: "AUTOR BASE", v: "Dweck/Stanford", c: C.textDim }, { l: "STATUS", v: "ATIVO", c: C.cc }]
    : [{ l: "SCORE E", v: scores.e, c: C.e }, { l: "AUTOR BASE", v: "Newport/Georgetown", c: C.textDim }, { l: "FOCO", v: scores.e < 40 ? "CRÍTICO" : scores.e < 70 ? "ATENÇÃO" : "ESTÁVEL", c: scores.e < 40 ? "#ff5555" : scores.e < 70 ? C.gold : C.cc }];
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="p-2.5" style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: 4 }}>
          <div className="text-[10px] tracking-widest mb-1" style={{ color: C.textDim }}>{it.l}</div>
          <div className="text-[14px] font-bold" style={{ color: it.c }}>{it.v}</div>
        </div>
      ))}
    </div>
  );
}

function NeuralWeb({ scores, onSelect }: { scores: { m: number; c: number; e: number }; onSelect: (d: DimKey) => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="text-[12px] tracking-widest mb-1" style={{ color: C.textDim }}>MÉTODO COMPORTAMENTAL · v2.0</div>
      <div className="font-bold mb-3 tracking-tight" style={{ color: "#fff", fontSize: 42, lineHeight: 1 }}>
        MC<span style={{ color: C.gold }}>E</span>
      </div>
      <svg viewBox="0 0 240 230" className="w-full max-w-[280px]">
        <defs>
          <radialGradient id="centerG"><stop offset="0%" stopColor={C.goldLight} /><stop offset="100%" stopColor={C.gold} stopOpacity="0" /></radialGradient>
        </defs>
        {/* Orbital rings */}
        <circle cx="120" cy="120" r="70" fill="none" stroke={C.gold} strokeOpacity="0.15" strokeDasharray="2 4" />
        <circle cx="120" cy="120" r="92" fill="none" stroke={C.teal} strokeOpacity="0.1" strokeDasharray="1 6" />
        {/* Connections — triangle: M top, C bottom-left, E bottom-right */}
        <line x1="120" y1="25" x2="55" y2="190" stroke="#fff" strokeOpacity="0.18" strokeDasharray="2 3" />
        <line x1="120" y1="25" x2="185" y2="190" stroke="#fff" strokeOpacity="0.18" strokeDasharray="2 3" />
        <line x1="55" y1="190" x2="185" y2="190" stroke="#fff" strokeOpacity="0.18" strokeDasharray="2 3" />
        <line x1="120" y1="120" x2="120" y2="25" stroke={C.m} strokeOpacity="0.3" />
        <line x1="120" y1="120" x2="55" y2="190" stroke={C.cc} strokeOpacity="0.3" />
        <line x1="120" y1="120" x2="185" y2="190" stroke={C.e} strokeOpacity="0.3" />
        {/* Center */}
        <circle cx="120" cy="120" r="18" fill="url(#centerG)" />
        <circle cx="120" cy="120" r="8" fill={C.gold} />
        <text x="120" y="123" textAnchor="middle" fontSize="7" fill="#000" fontWeight="700">MCE</text>
        {/* Nodes — M TOPO, C inf-esq, E inf-dir */}
        {[
          { k: "M" as DimKey, x: 120, y: 25, c: C.m, labelDy: -22 },
          { k: "C" as DimKey, x: 55, y: 190, c: C.cc, labelDy: 26 },
          { k: "E" as DimKey, x: 185, y: 190, c: C.e, labelDy: 26 },
        ].map((n) => (
          <g key={n.k} onClick={() => onSelect(n.k)} style={{ cursor: "pointer" }}>
            <circle cx={n.x} cy={n.y} r="16" fill={n.c} fillOpacity="0.15" />
            <circle cx={n.x} cy={n.y} r="10" fill={n.c} />
            <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize="9" fill="#000" fontWeight="700">{n.k}</text>
            <text x={n.x} y={n.y + n.labelDy} textAnchor="middle" fontSize="6" fill={C.textDim}>{DIMS[n.k].name.slice(0, 8)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function EstudoTab({ dim, scores, onChange }: { dim: typeof DIMS[DimKey]; scores: any; onChange: (k: "m" | "c" | "e", v: number) => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-4" style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 4 }}>
        <span className="inline-block text-[11px] px-2 py-0.5 mb-3 tracking-widest" style={{ background: `${dim.color}22`, color: dim.color, borderRadius: 3 }}>
          {dim.name}
        </span>
        <div className="text-[15px] mb-1" style={{ color: dim.colorLight }}>{dim.name.charAt(0) + dim.name.slice(1).toLowerCase()}</div>
        <div className="text-[11px] mb-3" style={{ color: C.textDim }}>{dim.subtitle}</div>
        <p className="text-[14px] leading-relaxed mb-3" style={{ color: C.text }}>{dim.body}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {dim.authors.map((a) => (
            <span key={a} className="text-[11px] px-2 py-0.5" style={{ background: `${dim.color}15`, color: dim.colorLight, borderRadius: 99 }}>{a}</span>
          ))}
        </div>
        <div className="text-[13px] italic pl-3" style={{ color: C.textDim, borderLeft: `2px solid ${dim.color}` }}>"{dim.quote}"</div>
      </div>
      <div className="p-4 space-y-4" style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 4 }}>
        <div className="text-[11px] tracking-widest" style={{ color: C.textDim }}>CALIBRAÇÃO MANUAL</div>
        {(["m", "c", "e"] as const).map((k) => {
          const d = DIMS[k.toUpperCase() as DimKey];
          return (
            <div key={k}>
              <div className="flex justify-between text-[12px] mb-1">
                <span style={{ color: d.color }}>{d.name}</span>
                <span style={{ color: C.text }}>{scores[k]}/100</span>
              </div>
              <input type="range" min={0} max={100} value={scores[k]} onChange={(e) => onChange(k, +e.target.value)}
                className="w-full" style={{ accentColor: d.color }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiagTab({ onComplete }: { onComplete: (s: { m: number; c: number; e: number }) => void }) {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<number[]>(Array(QUESTIONS.length).fill(-1));
  const q = QUESTIONS[i];
  const finish = () => {
    const byDim: Record<DimKey, number[]> = { M: [], C: [], E: [] };
    QUESTIONS.forEach((qq, idx) => { if (ans[idx] >= 0) byDim[qq.dim].push(ans[idx] + 1); });
    const calc = (arr: number[]) => arr.length ? Math.round(((arr.reduce((a, b) => a + b, 0) / arr.length - 1) / 3) * 100) : 50;
    onComplete({ m: calc(byDim.M), c: calc(byDim.C), e: calc(byDim.E) });
  };
  const segColor = (idx: number) => DIMS[QUESTIONS[idx].dim].color;
  return (
    <div className="p-5" style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 4 }}>
      <div className="flex gap-0.5 mb-4">
        {QUESTIONS.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 rounded-full" style={{ background: ans[idx] >= 0 ? segColor(idx) : "rgba(255,255,255,0.08)" }} />
        ))}
      </div>
      <div className="text-[11px] tracking-widest mb-2" style={{ color: DIMS[q.dim].color }}>{DIMS[q.dim].name} · QUESTÃO {i + 1}/9</div>
      <div className="text-[15px] mb-4" style={{ color: C.text }}>{q.q}</div>
      <div className="space-y-2 mb-5">
        {q.opts.map((o, idx) => (
          <button key={idx} onClick={() => setAns((a) => { const n = [...a]; n[i] = idx; return n; })}
            className="w-full text-left p-3 text-[13px] mce-btn" style={{
              background: ans[i] === idx ? `${DIMS[q.dim].color}22` : C.surface2,
              border: `0.5px solid ${ans[i] === idx ? DIMS[q.dim].color : C.border}`, borderRadius: 3, color: C.text,
            }}>{o}</button>
        ))}
      </div>
      <div className="flex justify-between">
        <button disabled={i === 0} onClick={() => setI(i - 1)}
          className="text-[12px] px-4 py-2 mce-btn disabled:opacity-30"
          style={{ border: `0.5px solid ${C.border}`, color: C.textDim, borderRadius: 3 }}>← Voltar</button>
        {i < QUESTIONS.length - 1 ? (
          <button disabled={ans[i] < 0} onClick={() => setI(i + 1)}
            className="text-[12px] px-4 py-2 mce-btn disabled:opacity-30"
            style={{ background: C.gold, color: "#000", borderRadius: 3, fontWeight: 700 }}>Próximo →</button>
        ) : (
          <button disabled={ans.some((a) => a < 0)} onClick={finish}
            className="text-[12px] px-4 py-2 mce-btn disabled:opacity-30"
            style={{ background: C.teal, color: "#000", borderRadius: 3, fontWeight: 700 }}>Finalizar</button>
        )}
      </div>
    </div>
  );
}

function ExTab({ dim, done, onToggle }: { dim: DimKey; done: Record<string, boolean>; onToggle: (k: string) => void }) {
  const d = DIMS[dim];
  return (
    <div>
      <div className="text-[11px] tracking-widest mb-3" style={{ color: d.color }}>EXERCÍCIOS · {d.name}</div>
      <div className="grid md:grid-cols-2 gap-3">
        {EXERCISES[dim].map((ex) => {
          const isDone = !!done[ex.key];
          return (
            <div key={ex.key} className="p-3 flex items-start justify-between mce-btn"
              style={{ background: C.surface, border: `0.5px solid ${isDone ? C.cc : C.border}`, borderRadius: 4 }}>
              <div className="flex-1 pr-3">
                <div className="text-[13px] mb-1" style={{ color: isDone ? C.textDim : C.text, textDecoration: isDone ? "line-through" : "none" }}>{ex.title}</div>
                <div className="text-[11px]" style={{ color: C.textDim }}>{ex.meta}</div>
              </div>
              <button onClick={() => onToggle(ex.key)}
                className="w-5 h-5 flex items-center justify-center"
                style={{ border: `1px solid ${isDone ? C.cc : C.border}`, background: isDone ? C.cc : "transparent", borderRadius: 3, color: "#000", fontSize: 11 }}>
                {isDone && "✓"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgTab({ streak, totalDone, mceScore, scores, criticalDim }: { streak: number; totalDone: number; mceScore: number; scores: any; criticalDim: DimKey }) {
  const d = DIMS[criticalDim];
  const sk = criticalDim.toLowerCase() as "m" | "c" | "e";
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "STREAK", v: `${streak}d`, c: C.gold },
          { l: "CONCLUÍDOS", v: totalDone, c: C.teal },
          { l: "MCE SCORE", v: `${mceScore}/100`, c: C.cc },
        ].map((m, i) => (
          <div key={i} className="p-4 text-center" style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 4 }}>
            <div className="font-bold mb-1" style={{ color: m.c, fontSize: 32, lineHeight: 1.1 }}>{m.v}</div>
            <div className="text-[11px] tracking-widest" style={{ color: C.textDim }}>{m.l}</div>
          </div>
        ))}
      </div>
      <div className="p-4" style={{ background: C.surface, border: `0.5px solid ${d.color}55`, borderRadius: 4 }}>
        <div className="text-[11px] tracking-widest mb-2" style={{ color: d.color }}>ANÁLISE PRESCRITIVA</div>
        <p className="text-[13px] leading-relaxed" style={{ color: C.text }}>
          <span style={{ color: d.color, fontWeight: 700 }}>{d.name.charAt(0) + d.name.slice(1).toLowerCase()}</span> ({scores[sk]}/100) é sua dimensão crítica. Concentre 70% dos exercícios MCE aqui por 14 dias antes de redistribuir o esforço.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────────────────────────
type Msg = { role: "user" | "assistant"; content: string };

function MceChat({ scores, autoMessage }: { scores: { m: number; c: number; e: number }; autoMessage?: { text: string; nonce: number } | null }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const recRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastAutoNonce = useRef<number | null>(null);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR"; u.rate = 0.95; u.pitch = 0.9;
    u.onend = () => setState("idle");
    u.onerror = () => setState("idle");
    synthRef.current = u;
    setState("speaking");
    window.speechSynthesis.speak(u);
  }, []);

  useEffect(() => {
    if (!autoMessage || autoMessage.nonce === lastAutoNonce.current) return;
    lastAutoNonce.current = autoMessage.nonce;
    setMsgs((m) => [...m, { role: "assistant", content: autoMessage.text }]);
    speak(autoMessage.text);
  }, [autoMessage, speak]);

  const statusText = {
    idle: "Neural · Standby",
    listening: "Ouvindo sua voz...",
    thinking: "Processando resposta...",
    speaking: "Transmitindo resposta...",
  }[state];

  const send = async (text: string) => {
    if (!text.trim()) return;
    const newMsgs: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(newMsgs);
    setInput("");
    setState("thinking");
    try {
      const { data, error } = await supabase.functions.invoke("mce-intelligence", {
        body: { message: text, scores, history: newMsgs.slice(-8) },
      });
      if (error) throw error;
      const answer = data?.answer || "Sem resposta.";
      setMsgs((m) => [...m, { role: "assistant", content: answer }]);
      // Speak
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(answer);
        u.lang = "pt-BR"; u.rate = 0.95; u.pitch = 0.9;
        u.onend = () => setState("idle");
        u.onerror = () => setState("idle");
        synthRef.current = u;
        setState("speaking");
        window.speechSynthesis.speak(u);
      } else {
        setState("idle");
      }
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", content: "Erro de transmissão. Tente novamente." }]);
      setState("idle");
    }
  };

  const onMic = () => {
    if (state === "speaking") { window.speechSynthesis.cancel(); setState("idle"); return; }
    if (state === "listening") { recRef.current?.stop(); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Web Speech API não suportada neste navegador."); return; }
    const rec = new SR();
    rec.lang = "pt-BR"; rec.interimResults = false; rec.continuous = false;
    rec.onresult = (e: any) => { const t = e.results[0][0].transcript; send(t); };
    rec.onend = () => { setState((s) => (s === "listening" ? "idle" : s)); };
    rec.onerror = () => setState("idle");
    recRef.current = rec;
    setState("listening");
    rec.start();
  };

  return (
    <div className="p-4" style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 4 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: C.border }}>
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full" style={{ background: C.gold, opacity: 0.2, animation: "mcePulse 2s ease-in-out infinite" }} />
            <div className="absolute inset-1 rounded-full" style={{ background: C.gold, opacity: 0.4 }} />
            <div className="relative w-3 h-3 rounded-full" style={{ background: C.goldLight }} />
          </div>
          <div>
            <div className="text-[12px]" style={{ color: C.gold }}>MCE Intelligence</div>
            <div className="text-[9px]" style={{ color: C.textDim }}>{statusText}</div>
          </div>
        </div>
        <span className="text-[9px] px-2 py-0.5" style={{ background: `${C.teal}22`, color: C.teal, borderRadius: 99 }}>Voice · Active</span>
      </div>

      {/* Messages */}
      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
        {msgs.length === 0 && <div className="text-[10px] text-center py-6" style={{ color: C.textDim }}>Pressione o microfone ou digite. A resposta será lida em voz.</div>}
        {msgs.map((m, i) => (
          <div key={i} className="text-[11px] p-2" style={{
            background: m.role === "user" ? "rgba(0,212,170,0.06)" : "rgba(200,160,32,0.06)",
            borderLeft: `2px solid ${m.role === "user" ? C.teal : C.gold}`,
            color: C.text, borderRadius: 2,
          }}>
            <div className="text-[8px] mb-1 tracking-widest" style={{ color: m.role === "user" ? C.teal : C.gold }}>{m.role === "user" ? "VOCÊ" : "MCE"}</div>
            {m.content}
          </div>
        ))}
      </div>

      {/* Voice button */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <Waveform active={state === "listening" || state === "speaking"} color={state === "speaking" ? C.cc : C.gold} side="L" />
        <button onClick={onMic} className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center"
          style={{
            border: `1.5px solid ${state === "speaking" ? C.cc : C.gold}`,
            background: state === "speaking" ? `${C.cc}22` : `${C.gold}22`,
          }}>
          {(state === "listening" || state === "speaking") && (
            <>
              <span className="absolute inset-0 rounded-full" style={{ border: `1px solid ${state === "speaking" ? C.cc : C.gold}`, animation: "ringExp 1.5s ease-out infinite" }} />
              <span className="absolute inset-0 rounded-full" style={{ border: `1px solid ${state === "speaking" ? C.cc : C.gold}`, animation: "ringExp 1.5s ease-out infinite .5s" }} />
              <span className="absolute inset-0 rounded-full" style={{ border: `1px solid ${state === "speaking" ? C.cc : C.gold}`, animation: "ringExp 1.5s ease-out infinite 1s" }} />
            </>
          )}
          {state === "thinking" ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: C.gold }} />
            : <Mic className="w-5 h-5" style={{ color: state === "speaking" ? C.cc : C.gold }} />}
        </button>
        <Waveform active={state === "listening" || state === "speaking"} color={state === "speaking" ? C.cc : C.gold} side="R" />
      </div>
      <div className="text-center text-[9px] mb-3" style={{ color: C.textDim }}>
        {state === "idle" && "Pressione para falar"}
        {state === "listening" && "Ouvindo..."}
        {state === "thinking" && "Processando..."}
        {state === "speaking" && "Falando..."}
      </div>

      {/* Text input */}
      <div className="flex gap-2 mb-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Digite sua mensagem..." className="flex-1 px-3 py-2 text-[11px]"
          style={{ background: C.surface2, border: `0.5px solid ${C.border}`, color: C.text, borderRadius: 3, fontFamily: "inherit" }} />
        <button onClick={() => send(input)} className="px-3 mce-btn" style={{ background: C.gold, color: "#000", borderRadius: 3 }}>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: "Protocolo M", q: "Qual o protocolo Mindset desta semana para mim?", c: C.m },
          { l: "Sistema C", q: "Como aplicar o sistema de hábitos Fogg/Clear no meu dia?", c: C.cc },
          { l: "Execução E", q: "Como estruturar meu bloco Deep Work Newport hoje?", c: C.e },
        ].map((a) => (
          <button key={a.l} onClick={() => send(a.q)} className="text-[10px] py-2 mce-btn"
            style={{ background: C.surface2, border: `0.5px solid ${C.border}`, color: a.c, borderRadius: 3 }}>{a.l}</button>
        ))}
      </div>
    </div>
  );
}

function Waveform({ active, color, side }: { active: boolean; color: string; side: "L" | "R" }) {
  return (
    <div className={`flex items-center gap-0.5 ${side === "L" ? "flex-row-reverse" : ""}`}>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="block w-0.5 rounded-full" style={{
          height: active ? `${8 + Math.random() * 16}px` : "3px",
          background: color, opacity: active ? 0.8 : 0.3,
          animation: active ? `wave ${0.6 + Math.random() * 0.6}s ease-in-out ${i * 0.05}s infinite` : "none",
          transformOrigin: "center",
        }} />
      ))}
    </div>
  );
}
