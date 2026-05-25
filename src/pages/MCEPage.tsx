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
    const colors = ["#00d4aa", "#c8a020", "#9080ff", "#ffffff"];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const parts = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.24, vy: (Math.random() - 0.5) * 0.24,
      r: 0.8 + Math.random() * 1.2,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.fillStyle = p.c; ctx.globalAlpha = 0.75;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.strokeStyle = parts[i].c; ctx.globalAlpha = (1 - d / 90) * 0.15;
            ctx.lineWidth = 0.3; ctx.beginPath();
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
  return <canvas ref={ref} className="fixed inset-0 w-full h-full pointer-events-none z-[2]" style={{ opacity: 0.85 }} />;
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
    <div className="min-h-screen relative overflow-hidden" style={{ color: C.text, fontFamily: "'Courier New', monospace" }}>
      {/* Layer 1 — radial base */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(0,180,140,0.06) 0%, rgba(9,9,20,1) 55%, #040810 100%)",
      }} />
      {/* Layer 2 — dual grid */}
      <div className="fixed inset-0 pointer-events-none z-[1]" style={{
        backgroundImage: [
          "linear-gradient(rgba(0,212,170,0.04) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(0,212,170,0.04) 1px, transparent 1px)",
          "linear-gradient(rgba(200,160,32,0.02) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(200,160,32,0.02) 1px, transparent 1px)",
        ].join(","),
        backgroundSize: "40px 40px, 40px 40px, 8px 8px, 8px 8px",
      }} />
      {/* Layer 3 — vignette */}
      <div className="fixed inset-0 pointer-events-none z-[3]" style={{
        boxShadow: "inset 0 0 120px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.4)",
      }} />
      {/* Layer 4 — particles */}
      <ParticlesBg />
      {/* Layer 5 — scan line */}
      <div className="fixed left-0 right-0 pointer-events-none z-[4]" style={{
        height: 1,
        background: "linear-gradient(90deg, transparent 0%, rgba(0,212,170,0.15) 30%, rgba(0,212,170,0.4) 50%, rgba(0,212,170,0.15) 70%, transparent 100%)",
        animation: "mceScan 6s linear infinite",
      }} />

      <style>{`
        @keyframes mceScan { 0%{top:-1px;opacity:1} 100%{top:100vh;opacity:1} }
        @keyframes mcePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.15)} }
        @keyframes mceOrbPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
        @keyframes mceRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes mceRotateR { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }
        @keyframes mceDash { from{stroke-dashoffset:0} to{stroke-dashoffset:-20} }
        @keyframes ringExp { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2);opacity:0} }
        @keyframes wave { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
        @keyframes mceCenterPulse { 0%,100%{r:19} 50%{r:21} }
        .mce-btn { transition: all .2s ease; }
        .mce-btn:hover { border-color: ${C.gold}; }
        .mce-rotate-slow { transform-origin: center; animation: mceRotate 8s linear infinite; transform-box: fill-box; }
        .mce-rotate-rev { transform-origin: center; animation: mceRotateR 20s linear infinite; transform-box: fill-box; }
        .mce-dash { animation: mceDash 1.5s linear infinite; }
        .mce-center-pulse { animation: mceCenterPulse 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .mce-input:focus { outline: none; border-color: rgba(200,160,32,0.5) !important; box-shadow: 0 0 0 1px rgba(200,160,32,0.1), 0 0 12px rgba(200,160,32,0.08); }
      `}</style>

      <div className="relative z-20 max-w-6xl mx-auto px-4 py-4">
        {/* TOP BAR — cockpit */}
        <div className="flex items-center justify-between mb-6 px-4" style={{
          height: 44,
          background: "linear-gradient(180deg, rgba(0,212,170,0.06) 0%, rgba(4,8,16,0.95) 100%)",
          borderBottom: "1px solid rgba(0,212,170,0.15)",
          boxShadow: "0 1px 0 rgba(0,212,170,0.08), 0 4px 20px rgba(0,0,0,0.6)",
          borderRadius: 4,
        }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded hover:bg-white/5" aria-label="Voltar">
              <ArrowLeft className="w-4 h-4" style={{ color: C.textDim }} />
            </button>
            <div className="flex items-baseline gap-2">
              <span style={{ color: "#e8f0ff", fontSize: 14, fontWeight: 900, letterSpacing: "0.25em" }}>NUTRI</span>
              <span style={{ color: "#f0c840", fontSize: 14, fontWeight: 900, letterSpacing: "0.25em" }}>ON</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
              <span style={{ color: "#00d4aa", fontSize: 11, fontWeight: 400, letterSpacing: "0.3em" }}>MCE INTELLIGENCE</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span style={{ color: C.textDim, letterSpacing: "0.15em" }}>SISTEMA COMPORTAMENTAL</span>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#00e888",
              boxShadow: "0 0 6px #00e888, 0 0 12px rgba(0,232,136,0.4)",
              animation: "mcePulse 2s ease-in-out infinite",
            }} />
            <span style={{ color: "#00e888", letterSpacing: "0.2em" }}>ONLINE</span>
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
                className="text-left mce-btn relative overflow-hidden"
                style={{
                  height: 88,
                  background: "linear-gradient(135deg, rgba(8,12,22,0.95) 0%, rgba(12,18,32,0.9) 100%)",
                  border: `0.5px solid ${isActive ? d.color : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 6,
                  padding: "12px 14px",
                  boxShadow: isActive
                    ? `0 0 24px ${d.color}33, inset 0 0 18px ${d.color}10`
                    : `inset 0 0 18px ${d.color}06`,
                }}>
                {/* top accent bar */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: d.color,
                  boxShadow: `0 0 8px ${d.color}99`,
                }} />
                {/* giant watermark letter */}
                <span style={{
                  position: "absolute", right: 12, bottom: -10,
                  fontSize: 52, fontWeight: 900, lineHeight: 1,
                  color: d.color, opacity: 0.12, letterSpacing: "-0.04em",
                }}>{k}</span>
                <div style={{ color: d.color, fontSize: 9, letterSpacing: "0.14em", fontWeight: 600 }}>{d.name}</div>
                <div className="mt-1.5" style={{ color: "#e8f0ff", fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
                  {scores[sk]}<span style={{ color: C.textDim, fontSize: 11, fontWeight: 400 }}>/100</span>
                </div>
                <div className="mt-3 w-full rounded-full overflow-hidden" style={{ height: 2, background: "rgba(255,255,255,0.04)" }}>
                  <div style={{
                    width: `${scores[sk]}%`, height: "100%",
                    background: `linear-gradient(90deg, ${d.color}, ${d.color}55)`,
                    boxShadow: `0 0 6px ${d.color}`,
                    transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
                  }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* TABS */}
        <div className="flex gap-1 mb-4 p-[3px]" style={{
          background: "rgba(4,8,14,0.8)",
          border: "0.5px solid rgba(255,255,255,0.05)",
          borderRadius: 4,
        }}>
          {([["estudo", "Estudo"], ["diag", "Diagnóstico"], ["ex", "Exercícios"], ["prog", "Progresso"]] as const).map(([k, l]) => {
            const active = tab === k;
            return (
              <button key={k} onClick={() => setTab(k)}
                className="flex-1 px-4 py-2 text-[12px] uppercase tracking-widest mce-btn"
                style={{
                  color: active ? "#f0c840" : C.textDim,
                  background: active
                    ? "linear-gradient(135deg, rgba(200,160,32,0.12) 0%, rgba(200,160,32,0.06) 100%)"
                    : "transparent",
                  border: `0.5px solid ${active ? "rgba(200,160,32,0.3)" : "transparent"}`,
                  borderRadius: 3,
                  boxShadow: active ? "0 0 8px rgba(200,160,32,0.1)" : "none",
                }}>{l}</button>
            );
          })}
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
  const items: { l: string; v: any; c: string; bar?: number }[] = side === "left"
    ? [{ l: "SCORE M", v: scores.m, c: C.m, bar: scores.m }, { l: "AUTOR BASE", v: "Dweck/Stanford", c: C.textDim }, { l: "STATUS", v: "ATIVO", c: C.cc }]
    : [{ l: "SCORE E", v: scores.e, c: C.e, bar: scores.e }, { l: "AUTOR BASE", v: "Newport/Georgetown", c: C.textDim }, { l: "FOCO", v: scores.e < 40 ? "CRÍTICO" : scores.e < 70 ? "ATENÇÃO" : "ESTÁVEL", c: scores.e < 40 ? "#ff5555" : scores.e < 70 ? C.gold : C.cc }];
  const sideBorder = side === "left"
    ? { borderLeft: "1.5px solid rgba(0,212,170,0.3)" }
    : { borderRight: "1.5px solid rgba(255,170,0,0.3)" };
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="p-2.5" style={{
          background: "rgba(6,10,18,0.9)",
          border: "0.5px solid rgba(0,212,170,0.08)",
          ...sideBorder,
          borderRadius: 4,
          boxShadow: typeof it.bar === "number" ? `inset 0 0 16px ${it.c}10` : "none",
        }}>
          <div className="mb-1" style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(0,212,170,0.6)", textTransform: "uppercase" }}>{it.l}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: typeof it.bar === "number" ? "#e8f0ff" : it.c }}>
            {it.v}{typeof it.bar === "number" && <span className="ml-1" style={{ color: C.textDim, fontSize: 11, fontWeight: 400 }}>/100</span>}
          </div>
          {typeof it.bar === "number" && (
            <div className="mt-2 w-full rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,0.05)" }}>
              <div style={{
                width: `${it.bar}%`, height: "100%",
                background: `linear-gradient(90deg, ${it.c}, ${it.c}55)`,
                boxShadow: `0 0 6px ${it.c}`,
                transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
              }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function NeuralWeb({ scores, onSelect }: { scores: { m: number; c: number; e: number }; onSelect: (d: DimKey) => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "rgba(0,212,170,0.5)", textTransform: "uppercase", marginBottom: 6 }}>
        MÉTODO COMPORTAMENTAL · v2.0
      </div>
      <div className="font-black mb-3" style={{
        fontSize: 52, lineHeight: 1, letterSpacing: "0.2em",
        textShadow: "0 0 20px rgba(200,160,32,0.4), 0 0 40px rgba(200,160,32,0.2), 0 0 80px rgba(200,160,32,0.1)",
      }}>
        <span style={{ color: "#e8f0ff" }}>MC</span><span style={{ color: "#f0c840" }}>E</span>
      </div>
      <svg viewBox="0 0 400 320" className="w-full max-w-[420px]" style={{ height: 320 }}>
        <defs>
          <linearGradient id="grad-m" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9080ff" /><stop offset="100%" stopColor="#c8a020" />
          </linearGradient>
          <linearGradient id="grad-c" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00e888" /><stop offset="100%" stopColor="#c8a020" />
          </linearGradient>
          <linearGradient id="grad-e" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffaa00" /><stop offset="100%" stopColor="#c8a020" />
          </linearGradient>
          <radialGradient id="grad-center"><stop offset="0%" stopColor="#f0c840" /><stop offset="100%" stopColor="#c8a020" /></radialGradient>
        </defs>

        {/* Orbital rings */}
        <circle cx="200" cy="160" r="120" fill="none" stroke="rgba(0,212,170,0.04)" strokeDasharray="1 6" />
        <circle cx="200" cy="160" r="155" fill="none" stroke="rgba(200,160,32,0.03)" strokeDasharray="2 8" />

        {/* Outer triangle (no animation) */}
        <line x1="200" y1="40" x2="80" y2="240" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <line x1="200" y1="40" x2="320" y2="240" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <line x1="80" y1="240" x2="320" y2="240" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

        {/* Animated connections to center */}
        <line x1="200" y1="40" x2="200" y2="175" stroke="url(#grad-m)" strokeWidth="0.8" strokeDasharray="6 4" strokeOpacity="0.4" className="mce-dash" />
        <line x1="80" y1="240" x2="200" y2="175" stroke="url(#grad-c)" strokeWidth="0.8" strokeDasharray="6 4" strokeOpacity="0.4" className="mce-dash" />
        <line x1="320" y1="240" x2="200" y2="175" stroke="url(#grad-e)" strokeWidth="0.8" strokeDasharray="6 4" strokeOpacity="0.4" className="mce-dash" />

        {/* CENTER NODE */}
        <g>
          <circle cx="200" cy="175" r="26" fill="none" stroke="rgba(200,160,32,0.2)" strokeDasharray="3 6" className="mce-rotate-rev" style={{ transformOrigin: "200px 175px" } as any} />
          <circle cx="200" cy="175" r="19" fill="rgba(200,160,32,0.08)" stroke="rgba(200,160,32,0.5)" filter="url(#)" />
          <circle cx="200" cy="175" r="13" fill="rgba(200,160,32,0.18)" stroke="#c8a020" strokeWidth="1.5" />
          <text x="200" y="178" textAnchor="middle" fontSize="8" fill="#f0c840" fontWeight="900" letterSpacing="0.5">MCE</text>
        </g>

        {/* NODE M — top */}
        <g onClick={() => onSelect("M")} style={{ cursor: "pointer", filter: "drop-shadow(0 0 8px rgba(144,128,255,0.4))" }}>
          <circle cx="200" cy="40" r="38" fill="none" stroke="rgba(144,128,255,0.3)" strokeDasharray="4 8"
            className="mce-rotate-slow" style={{ transformOrigin: "200px 40px" } as any} />
          <circle cx="200" cy="40" r="32" fill="rgba(144,128,255,0.06)" stroke="rgba(144,128,255,0.5)" strokeWidth="0.8" />
          <circle cx="200" cy="40" r="22" fill="rgba(144,128,255,0.12)" stroke="rgba(144,128,255,0.7)" strokeWidth="1" />
          <circle cx="200" cy="40" r="14" fill="rgba(144,128,255,0.25)" stroke="#9080ff" strokeWidth="1.5" />
          <text x="200" y="44" textAnchor="middle" fontSize="13" fill="#c0b8ff" fontWeight="900">M</text>
          <text x="200" y="14" textAnchor="middle" fontSize="7" fill="rgba(144,128,255,0.7)" letterSpacing="1.5">MINDSET</text>
        </g>

        {/* NODE C — bottom-left */}
        <g onClick={() => onSelect("C")} style={{ cursor: "pointer", filter: "drop-shadow(0 0 8px rgba(0,232,136,0.4))" }}>
          <circle cx="80" cy="240" r="38" fill="none" stroke="rgba(0,232,136,0.3)" strokeDasharray="4 8"
            className="mce-rotate-slow" style={{ transformOrigin: "80px 240px" } as any} />
          <circle cx="80" cy="240" r="32" fill="rgba(0,232,136,0.06)" stroke="rgba(0,232,136,0.5)" strokeWidth="0.8" />
          <circle cx="80" cy="240" r="22" fill="rgba(0,232,136,0.12)" stroke="rgba(0,232,136,0.7)" strokeWidth="1" />
          <circle cx="80" cy="240" r="14" fill="rgba(0,232,136,0.25)" stroke="#00e888" strokeWidth="1.5" />
          <text x="80" y="244" textAnchor="middle" fontSize="13" fill="#60ffbb" fontWeight="900">C</text>
          <text x="80" y="294" textAnchor="middle" fontSize="7" fill="rgba(0,232,136,0.7)" letterSpacing="1.5">COMPORT.</text>
        </g>

        {/* NODE E — bottom-right */}
        <g onClick={() => onSelect("E")} style={{ cursor: "pointer", filter: "drop-shadow(0 0 8px rgba(255,170,0,0.4))" }}>
          <circle cx="320" cy="240" r="38" fill="none" stroke="rgba(255,170,0,0.3)" strokeDasharray="4 8"
            className="mce-rotate-slow" style={{ transformOrigin: "320px 240px" } as any} />
          <circle cx="320" cy="240" r="32" fill="rgba(255,170,0,0.06)" stroke="rgba(255,170,0,0.5)" strokeWidth="0.8" />
          <circle cx="320" cy="240" r="22" fill="rgba(255,170,0,0.12)" stroke="rgba(255,170,0,0.7)" strokeWidth="1" />
          <circle cx="320" cy="240" r="14" fill="rgba(255,170,0,0.25)" stroke="#ffaa00" strokeWidth="1.5" />
          <text x="320" y="244" textAnchor="middle" fontSize="13" fill="#ffd060" fontWeight="900">E</text>
          <text x="320" y="294" textAnchor="middle" fontSize="7" fill="rgba(255,170,0,0.7)" letterSpacing="1.5">EXECUÇÃO</text>
        </g>
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

function pickJarvisVoice(list: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    list.find((v) => /google/i.test(v.name) && v.lang === "pt-BR") ||
    list.find((v) => v.lang === "pt-BR") ||
    list.find((v) => /google/i.test(v.name) && v.lang?.toLowerCase().startsWith("pt")) ||
    list.find((v) => v.lang?.toLowerCase().startsWith("pt")) ||
    list.find((v) => /daniel|reed|google uk/i.test(v.name))
  );
}

function MceChat({ scores, autoMessage }: { scores: { m: number; c: number; e: number }; autoMessage?: { text: string; nonce: number } | null }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const recRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastAutoNonce = useRef<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const selectedVoiceRef = useRef<string>("");

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      if (!list.length) return;
      setVoices(list);
      const saved = localStorage.getItem("mce_voice_preference") || "";
      if (saved && list.some((v) => v.voiceURI === saved)) {
        setSelectedVoiceURI(saved);
        selectedVoiceRef.current = saved;
      } else {
        const pick = pickJarvisVoice(list);
        if (pick) {
          setSelectedVoiceURI(pick.voiceURI);
          selectedVoiceRef.current = pick.voiceURI;
        }
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = null as any; };
  }, []);

  const applyVoice = useCallback((u: SpeechSynthesisUtterance) => {
    const list = window.speechSynthesis.getVoices();
    const uri = selectedVoiceRef.current;
    const v = list.find((x) => x.voiceURI === uri) || pickJarvisVoice(list);
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = "pt-BR"; }
    u.rate = 0.88; u.pitch = 0.75; u.volume = 1.0;
  }, []);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    applyVoice(u);
    u.onend = () => setState("idle");
    u.onerror = () => setState("idle");
    synthRef.current = u;
    setState("speaking");
    window.speechSynthesis.speak(u);
  }, [applyVoice]);

  useEffect(() => {
    if (!autoMessage || autoMessage.nonce === lastAutoNonce.current) return;
    lastAutoNonce.current = autoMessage.nonce;
    setMsgs((m) => [...m, { role: "assistant", content: autoMessage.text }]);
    speak(autoMessage.text);
  }, [autoMessage, speak]);

  const onVoiceChange = (uri: string) => {
    setSelectedVoiceURI(uri);
    selectedVoiceRef.current = uri;
    localStorage.setItem("mce_voice_preference", uri);
  };

  const testVoice = () => speak("MCE Intelligence online. Sistema comportamental ativado.");

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
        applyVoice(u);
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
            <div className="text-[14px]" style={{ color: C.gold }}>MCE Intelligence</div>
            <div className="text-[11px]" style={{ color: C.textDim }}>{statusText}</div>
          </div>
        </div>
        <span className="text-[11px] px-2 py-0.5" style={{ background: `${C.teal}22`, color: C.teal, borderRadius: 99 }}>Voice · Active</span>
      </div>

      {/* Messages */}
      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
        {msgs.length === 0 && <div className="text-[12px] text-center py-6" style={{ color: C.textDim }}>Pressione o microfone ou digite. A resposta será lida em voz.</div>}
        {msgs.map((m, i) => (
          <div key={i} className="text-[13px] p-2" style={{
            background: m.role === "user" ? "rgba(0,212,170,0.06)" : "rgba(200,160,32,0.06)",
            borderLeft: `2px solid ${m.role === "user" ? C.teal : C.gold}`,
            color: C.text, borderRadius: 2,
          }}>
            <div className="text-[10px] mb-1 tracking-widest" style={{ color: m.role === "user" ? C.teal : C.gold }}>{m.role === "user" ? "VOCÊ" : "MCE"}</div>
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
      <div className="text-center text-[12px] mb-3" style={{ color: C.textDim }}>
        {state === "idle" && "Pressione para falar"}
        {state === "listening" && "Ouvindo..."}
        {state === "thinking" && "Processando..."}
        {state === "speaking" && "Falando..."}
      </div>

      {/* Voice selector */}
      <div className="mb-3">
        <div className="text-[9px] tracking-widest mb-1" style={{ color: C.teal }}>VOZ DO SISTEMA</div>
        <div className="flex gap-2 items-center">
          <select
            value={selectedVoiceURI}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="flex-1 px-2 py-1"
            style={{
              background: "#060c14",
              border: `0.5px solid ${C.gold}`,
              color: C.gold,
              fontSize: 11,
              borderRadius: 3,
              fontFamily: "inherit",
            }}
          >
            {voices.length === 0 && <option value="">— sem vozes disponíveis —</option>}
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI} style={{ background: "#060c14", color: C.gold }}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
          <button
            onClick={testVoice}
            className="px-3 py-1 mce-btn"
            style={{
              border: `0.5px solid ${C.gold}`,
              color: C.gold,
              background: `${C.gold}15`,
              fontSize: 11,
              borderRadius: 3,
              letterSpacing: "0.1em",
            }}
          >
            TESTAR
          </button>
        </div>
      </div>

      {/* Text input */}
      <div className="flex gap-2 mb-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Digite sua mensagem..." className="flex-1 px-3 py-2 text-[13px]"
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
          <button key={a.l} onClick={() => send(a.q)} className="text-[12px] py-2 mce-btn"
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
