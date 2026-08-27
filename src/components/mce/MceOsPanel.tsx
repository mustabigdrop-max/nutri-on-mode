import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { mceSounds, type MceSoundName } from "@/lib/mceSounds";
import McePatternDetector from "./McePatternDetector";

const C = {
  bg: "#020205", s1: "#0B0B12", s2: "#10101A", s3: "#181824",
  border: "#ffffff08", cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E", red: "#EF4444",
  purple: "#A855F7", orange: "#F97316", muted: "#4A4A5A", dim: "#333340",
  text: "#C8C8D8", white: "#F0F0F8",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

type OsItem = { id: string; text: string; ref: string };
type OsBlock = {
  id: string; name: string; time: string; pilar: string; pilarColor: string;
  duration: string; science: string; from: number; to: number; items: OsItem[];
  sound?: MceSoundName; audio?: string; audioDur?: string;
};


const BLOCKS: OsBlock[] = [
  {
    sound: "ignition", audio: "Despertar", audioDur: "5 min", id: "ignition", name: "IGNIÇÃO", time: "05:00–06:00", pilar: "MINDSET", pilarColor: C.purple,
    duration: "15-20 min", from: 5, to: 6,
    science: "Kahneman: Sistema 2 está no pico pela manhã. Programe agora ou o Sistema 1 comanda o dia.",
    items: [
      { id: "a1", text: "Âncora de identidade — 'Quem eu sou? O que estou construindo?'", ref: "Bandura · Stanford" },
      { id: "a2", text: "Revisão de intenção — 3 prioridades escritas", ref: "Mueller & Oppenheimer · Princeton" },
      { id: "a3", text: "Exposição à luz + movimento leve (10 min)", ref: "Huberman · Stanford" },
      { id: "a4", text: "Declaração do dia em voz alta", ref: "Frankl · Logoterapia" },
    ],
  },
  {
    sound: "tick", audio: "Corrida 30min", audioDur: "30 min", id: "execution", name: "EXECUÇÃO PRIMÁRIA", time: "06:00–12:00", pilar: "EXECUÇÃO", pilarColor: C.gold,
    duration: "Bloco de fazer", from: 6, to: 12,
    science: "Cortisol e testosterona nos picos. Força de vontade cheia. Período de ouro.",
    items: [
      { id: "b1", text: "Tarefa mais difícil primeiro (deep work)", ref: "Newport · Georgetown" },
      { id: "b2", text: "Treino com intenção — cada série reforça o circuito", ref: "Merzenich · UCSF" },
      { id: "b3", text: "Refeições planejadas cumpridas (sem improviso)", ref: "Kahneman · Sistema 2" },
      { id: "b4", text: "Zero negociação com a meta do dia", ref: "Duckworth · Grit" },
    ],
  },
  {
    sound: "recalibration", audio: "Micro-áudio 2min", audioDur: "2 min", id: "recalibration", name: "RECALIBRAÇÃO", time: "12:00–13:00", pilar: "COMPORTAMENTO", pilarColor: C.cyan,
    duration: "5-10 min", from: 12, to: 13,
    science: "Rotter: locus de controle interno monitora resultados. Nunca deixe 2 erros seguidos acontecerem.",
    items: [
      { id: "c1", text: "Check-in: treinei? refeições no plano? energia?", ref: "Rotter · Locus de controle" },
      { id: "c2", text: "Ajuste da tarde — 1 correção concreta", ref: "Baumeister · What the hell effect" },
      { id: "c3", text: "Reset mental — 3 min sem tela", ref: "Merzenich · Neuroplasticidade" },
    ],
  },
  {
    sound: "tick", id: "sustain", name: "SUSTENTAÇÃO", time: "13:00–18:00", pilar: "COMPORTAMENTO + EXECUÇÃO", pilarColor: C.green,
    duration: "Bloco onde a maioria desiste", from: 13, to: 18,
    science: "Cortisol caiu, força de vontade gasta, Sistema 1 dominando. Ambiente > vontade.",
    items: [
      { id: "d1", text: "Marmita da tarde pronta (não improvisar)", ref: "Clear · Atomic Habits" },
      { id: "d2", text: "Celular longe quando precisa focar", ref: "Kahneman · Sistema 2" },
      { id: "d3", text: "Bloco de trabalho focado — 1 entrega definida", ref: "Newport · Deep Work" },
      { id: "d4", text: "Conteúdo MCE do dia criado ou postado", ref: "Bandura · Autoeficácia" },
    ],
  },
  {
    sound: "consolidation", audio: "Pré-sono", audioDur: "10 min", id: "consolidation", name: "CONSOLIDAÇÃO", time: "20:00–22:00", pilar: "MINDSET + COMPORTAMENTO", pilarColor: C.purple,
    duration: "15-20 min", from: 20, to: 22,
    science: "Hipocampo transfere memórias de curto pra longo prazo durante o sono. A última hora consolida o dia.",
    items: [
      { id: "e1", text: "Revisão MCE do dia — M, C, E (nota 1-10 cada)", ref: "Dweck · Growth Mindset" },
      { id: "e2", text: "1 coisa que vou manter + 1 que vou corrigir", ref: "Rotter · Locus interno" },
      { id: "e3", text: "Prep do amanhã — roupa, marmita, alarme, 1ª tarefa", ref: "Kahneman · Sistema 1" },
      { id: "e4", text: "Desaceleração neural — respiração 4-7-8, sem tela", ref: "Walker · UC Berkeley" },
    ],
  },
];

const TOTAL_ITEMS = BLOCKS.reduce((a, b) => a + b.items.length, 0);
const STORAGE_KEY = "mce_os_day";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadToday(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as { date: string; checked: Record<string, boolean> };
    if (p?.date !== todayKey()) return {};
    return p.checked ?? {};
  } catch {
    return {};
  }
}

type OsResult = {
  day_verdict?: string;
  feedback?: string;
  correction?: { what?: string; how?: string; science?: string } | null;
  tomorrow_focus?: string;
  content_idea?: string;
  mce_quote?: string;
};

function Block({ block, hour, checked, onCheck, soundEnabled }: { block: OsBlock; hour: number; checked: Record<string, boolean>; onCheck: (id: string) => void; soundEnabled: boolean }) {
  const active = hour >= block.from && hour < block.to;
  const done = block.items.filter((i) => checked[i.id]).length;
  const total = block.items.length;
  const pct = Math.round((done / total) * 100);
  const allDone = done === total;
  const [expanded, setExpanded] = useState(active);
  const prevDone = useRef(done);

  useEffect(() => {
    if (soundEnabled && done > prevDone.current && done === total) mceSounds.blockComplete();
    prevDone.current = done;
  }, [done, total, soundEnabled]);

  const R = 14, CIRC = 2 * Math.PI * R;

  return (
    <div style={{
      background: active ? `${block.pilarColor}05` : C.s1,
      border: `1px solid ${active ? `${block.pilarColor}25` : C.border}`,
      marginBottom: 10, position: "relative",
    }}>
      <button onClick={() => { const next = !expanded; setExpanded(next); if (next && soundEnabled && block.sound) mceSounds[block.sound](); }} style={{

        width: "100%", padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 10, textAlign: "left",
      }}>
        <div style={{ position: "relative", width: 34, height: 34, flexShrink: 0 }}>
          <svg width={34} height={34} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={17} cy={17} r={R} fill="none" stroke={C.s3} strokeWidth={3} />
            <circle
              cx={17} cy={17} r={R} fill="none" stroke={allDone ? C.green : block.pilarColor} strokeWidth={3}
              strokeDasharray={CIRC} strokeDashoffset={CIRC - (CIRC * pct) / 100}
              style={{ transition: "stroke-dashoffset .3s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: F.m, fontSize: 10, color: allDone ? C.green : C.text,
          }}>
            {allDone ? "✓" : done}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: C.white }}>{block.name}</span>
            <span style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 1, color: block.pilarColor }}>{block.pilar}</span>
            {active && (
              <span style={{
                fontFamily: F.m, fontSize: 7, letterSpacing: 1, color: C.bg, background: block.pilarColor,
                padding: "2px 5px", animation: "mceOsPulse 2s infinite",
              }}>AGORA</span>
            )}
          </div>
          <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 2 }}>{block.time} · {block.duration}</div>
        </div>

        {block.audio && (
          <span style={{
            display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
            border: `1px solid ${C.border}`, background: C.s2, padding: "3px 6px",
          }}>
            <span style={{ fontSize: 10 }}>🎧</span>
            <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted }}>{block.audio}{block.audioDur ? ` · ${block.audioDur}` : ""}</span>
          </span>
        )}

        <span style={{ fontFamily: F.m, fontSize: 11, color: C.dim }}>{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 14px" }}>
          <div style={{
            background: C.s2, borderLeft: `2px solid ${block.pilarColor}40`, padding: "8px 10px",
            fontFamily: F.b, fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 10,
          }}>
            {block.science}
          </div>

          {block.items.map((item) => {
            const isDone = !!checked[item.id];
            return (
              <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                <button
                  onClick={() => { onCheck(item.id); if (!isDone && soundEnabled) mceSounds.tick(); }}

                  aria-pressed={isDone}
                  style={{
                    width: 22, height: 22, background: isDone ? C.green : C.s3,
                    border: `1px solid ${isDone ? C.green : C.border}`, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    marginTop: 1, fontSize: 11, color: C.white, transition: "all .15s",
                  }}
                >{isDone ? "✓" : ""}</button>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0, fontFamily: F.b, fontSize: 12.5, lineHeight: 1.45,
                    color: isDone ? C.muted : C.text, textDecoration: isDone ? "line-through" : "none",
                  }}>{item.text}</p>
                  <span style={{ fontFamily: F.m, fontSize: 8, color: C.dim }}>{item.ref}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MceScoreInput({ scores, onChange }: { scores: Record<string, number>; onChange: (s: Record<string, number>) => void }) {
  const pillars = [
    { id: "m", label: "Mindset", color: C.purple, q: "Como está seu sistema operacional hoje?" },
    { id: "c", label: "Comportamento", color: C.cyan, q: "Seus padrões automáticos estão no plano?" },
    { id: "e", label: "Execução", color: C.gold, q: "O que foi entregue de fato?" },
  ];
  const total = Math.round((((scores.m || 0) + (scores.c || 0) + (scores.e || 0)) / 3) * 10);
  return (
    <div style={{ background: C.s1, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.muted }}>MCE SCORE</span>
        <span style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: total >= 70 ? C.green : total >= 40 ? C.gold : C.red }}>
          {total}/100
        </span>
      </div>
      {pillars.map((p) => (
        <div key={p.id} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, background: p.color, display: "inline-block" }} />
              <span style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: C.white }}>{p.label}</span>
            </span>
            <span style={{ fontFamily: F.m, fontSize: 12, color: p.color }}>{scores[p.id] ?? 5}</span>
          </div>
          <p style={{ margin: "2px 0 6px", fontFamily: F.b, fontSize: 11, color: C.muted }}>{p.q}</p>
          <input
            type="range" min={1} max={10} step={1} value={scores[p.id] ?? 5}
            onChange={(e) => onChange({ ...scores, [p.id]: Number(e.target.value) })}
            aria-label={p.label}
            style={{ width: "100%", accentColor: p.color }}
          />
        </div>
      ))}
    </div>
  );
}

export default function MceOsPanel({ streak = 0, rankName = "Iniciante" }: { streak?: number; rankName?: string }) {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const [checked, setChecked] = useState<Record<string, boolean>>(() => loadToday());
  const [scores, setScores] = useState<Record<string, number>>({ m: 5, c: 5, e: 5 });
  const [result, setResult] = useState<OsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), checked })); } catch { /* ignore */ }
  }, [checked]);

  const doneItems = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const dayPct = Math.round((doneItems / TOTAL_ITEMS) * 100);

  const prevDoneRef = useRef(doneItems);
  useEffect(() => {
    if (soundEnabled && doneItems === TOTAL_ITEMS && prevDoneRef.current < TOTAL_ITEMS) mceSounds.dayComplete();
    prevDoneRef.current = doneItems;
  }, [doneItems, soundEnabled]);

  const blocksStatus = useMemo(() => BLOCKS.map((b) => {
    const d = b.items.filter((i) => checked[i.id]).length;
    return { name: b.name, done: d, total: b.items.length, pct: Math.round((d / b.items.length) * 100) };
  }), [checked]);
  const weakBlock = useMemo(() => blocksStatus.filter((b) => b.pct < 50).sort((a, b) => a.pct - b.pct)[0] ?? null, [blocksStatus]);
  const weakPillar = scores.m <= scores.c && scores.m <= scores.e ? "Mindset" : scores.c <= scores.e ? "Comportamento" : "Execução";


  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id] && user) {
        void supabase.from("mce_exercises_done").insert({ user_id: user.id, exercise_key: `mce_os_${id}` });
      }
      return next;
    });
  }, [user]);

  const getFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.functions.invoke("mce-forge", {
        body: {
          mode: "os_feedback",
          scores, doneCount: doneItems, totalCount: TOTAL_ITEMS, hour, streak, rank: rankName,
          done: Object.entries(checked).filter(([, v]) => v).map(([k]) => k),
        },
      });
      if (err) throw err;
      setResult(data as OsResult);
    } catch {
      setError("Não foi possível gerar o feedback agora. Tente de novo em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const verdictColors: Record<string, string> = { EXCEPCIONAL: C.green, BOM: C.cyan, MEDIANO: C.gold, FRACO: C.red };
  const verdictColor = verdictColors[result?.day_verdict ?? ""] ?? C.cyan;

  return (
    <div>
      <style>{`@keyframes mceOsPulse{0%,100%{opacity:.45}50%{opacity:1}}`}</style>

      {/* Hero do dia */}
      <div style={{ background: `linear-gradient(135deg,${C.s1},${C.gold}04)`, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
          <div>
            <div style={{ fontFamily: F.m, fontSize: 9, letterSpacing: 1.5, color: C.muted, textTransform: "uppercase" }}>
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" })}
            </div>
            <p style={{ margin: "4px 0 0", fontFamily: F.t, fontSize: 17, fontWeight: 700, color: C.white }}>
              O comportamento vem antes do protocolo.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: F.t, fontSize: 30, fontWeight: 700, lineHeight: 1, color: dayPct >= 70 ? C.green : dayPct >= 40 ? C.gold : C.muted }}>
              {dayPct}%
            </div>
            <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{doneItems}/{TOTAL_ITEMS}</div>
          </div>
        </div>
        <div style={{ marginTop: 12, height: 4, background: C.s3 }}>
          <div style={{
            width: `${dayPct}%`, height: "100%", background: `linear-gradient(90deg,${C.gold},${C.green})`,
            boxShadow: dayPct >= 50 ? `0 0 12px ${C.gold}30` : "none", transition: "width .35s ease",
          }} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button
          onClick={() => { const n = !soundEnabled; setSoundEnabled(n); if (n) mceSounds.tick(); }}
          aria-pressed={soundEnabled}
          style={{
            background: soundEnabled ? `${C.cyan}10` : C.s3, border: `1px solid ${soundEnabled ? `${C.cyan}40` : C.border}`,
            padding: "5px 9px", cursor: "pointer", fontFamily: F.m, fontSize: 9, letterSpacing: 1,
            color: soundEnabled ? C.cyan : C.dim,
          }}
        >{soundEnabled ? "🔊 SOM" : "🔇 SOM"}</button>
      </div>

      <McePatternDetector
        scores={scores}
        streak={streak}
        hour={hour}
        doneItems={doneItems}
        totalItems={TOTAL_ITEMS}
        weakBlock={weakBlock}
        weakPillar={weakPillar}
        soundEnabled={soundEnabled}
      />

      {BLOCKS.map((b) => (
        <Block key={b.id} block={b} hour={hour} checked={checked} onCheck={toggle} soundEnabled={soundEnabled} />
      ))}


      <MceScoreInput scores={scores} onChange={setScores} />

      <button
        onClick={getFeedback}
        disabled={loading}
        style={{
          width: "100%", padding: "14px", background: loading ? C.s2 : `${C.gold}12`,
          border: `1px solid ${C.gold}40`, color: C.gold, fontFamily: F.t, fontSize: 15, fontWeight: 700,
          letterSpacing: 1, cursor: loading ? "wait" : "pointer", marginBottom: 12,
        }}
      >
        {loading ? "Analisando seu dia..." : "GERAR FEEDBACK MCE"}
      </button>

      {error && (
        <div style={{ background: `${C.red}08`, border: `1px solid ${C.red}30`, padding: 12, marginBottom: 12, fontFamily: F.b, fontSize: 12, color: C.red }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ background: C.s1, border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: verdictColor }}>{result.day_verdict}</span>
            <span style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 1.5, color: C.muted }}>MCE OS · FEEDBACK</span>
          </div>

          <div style={{ padding: 14 }}>
            {result.feedback && (
              <p style={{ margin: "0 0 12px", fontFamily: F.b, fontSize: 13, lineHeight: 1.6, color: C.text }}>{result.feedback}</p>
            )}

            {result.correction && (
              <div style={{ background: `${C.red}06`, border: `1px solid ${C.red}20`, padding: 12, marginBottom: 12 }}>
                <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.red, marginBottom: 6 }}>CORREÇÃO</div>
                <p style={{ margin: "0 0 4px", fontFamily: F.t, fontSize: 14, fontWeight: 700, color: C.white }}>{result.correction.what}</p>
                <p style={{ margin: "0 0 6px", fontFamily: F.b, fontSize: 12, color: C.text, lineHeight: 1.5 }}>{result.correction.how}</p>
                <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{result.correction.science}</span>
              </div>
            )}

            {result.tomorrow_focus && (
              <div style={{ background: C.s2, padding: 12, marginBottom: 12 }}>
                <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.cyan, marginBottom: 4 }}>AMANHÃ</div>
                <p style={{ margin: 0, fontFamily: F.b, fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{result.tomorrow_focus}</p>
              </div>
            )}

            {result.content_idea && (
              <div style={{ background: `${C.purple}06`, border: `1px solid ${C.purple}18`, padding: 12, marginBottom: 12 }}>
                <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.purple, marginBottom: 4 }}>CONTEÚDO DO DIA</div>
                <p style={{ margin: 0, fontFamily: F.b, fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{result.content_idea}</p>
              </div>
            )}

            {result.mce_quote && (
              <div style={{ background: `linear-gradient(135deg,${C.s2},${C.gold}06)`, border: `1px solid ${C.gold}18`, padding: 14 }}>
                <p style={{ margin: 0, fontFamily: F.t, fontSize: 16, fontWeight: 700, color: C.gold, textAlign: "center" }}>
                  "{result.mce_quote}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {streak > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
          background: `${C.orange}06`, border: `1px solid ${C.orange}20`, padding: 12, marginBottom: 12,
        }}>
          <span style={{ fontFamily: F.b, fontSize: 12, color: C.text }}>
            Se parar hoje: {streak} dias de streak + rank {rankName} perdidos
          </span>
          <span style={{ fontSize: 18 }}>🔥</span>
        </div>
      )}

      <div style={{ textAlign: "center", fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.dim, padding: "8px 0 16px" }}>
        MCE OS · NUTRION
      </div>
    </div>
  );
}
