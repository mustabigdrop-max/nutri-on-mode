import { useState } from "react";
import { ArrowRight, Brain, Activity, Zap, Target, CheckCircle2 } from "lucide-react";
import type { PillarKey } from "@/data/mceData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MONO = "'Space Mono', ui-monospace, monospace";
const DISPLAY = "'Rajdhani', system-ui, sans-serif";

const GOALS = [
  { id: "fat_loss", label: "Perder gordura", desc: "Foco em déficit sustentável e aderência" },
  { id: "muscle_gain", label: "Ganhar massa", desc: "Superávit controlado e treino progressivo" },
  { id: "performance", label: "Performance", desc: "Energia, recuperação e consistência" },
  { id: "health", label: "Saúde / Longevidade", desc: "Hábitos, sono e composição corporal" },
];

const PILLAR_COLORS: Record<PillarKey, string> = { M: "#A78BFA", C: "#00FF88", E: "#F59E0B" };

export default function MceOnboarding({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<Record<PillarKey, number[]>>({ M: [5, 5, 5], C: [5, 5, 5], E: [5, 5, 5] });
  const [saving, setSaving] = useState(false);

  const totalSteps = 5;

  const updateDiagnostic = (p: PillarKey, idx: number, val: number) => {
    setDiagnostic((prev) => ({ ...prev, [p]: prev[p].map((v, i) => (i === idx ? val : v)) }));
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const scores: Record<PillarKey, number> = { M: 50, C: 50, E: 50 };
    for (const p of (["M", "C", "E"] as PillarKey[])) {
      const answers = diagnostic[p];
      const score = Math.round((answers.reduce((a, b) => a + b, 0) / 30) * 100);
      scores[p] = score;
      await supabase.from("mce_diagnostics").upsert(
        { user_id: user.id, pillar: p, answers },
        { onConflict: "user_id,pillar" },
      );
    }
    await supabase.from("mce_scores").insert({
      user_id: user.id,
      score_m: scores.M,
      score_c: scores.C,
      score_e: scores.E,
      source: "diagnostic",
    });
    localStorage.setItem("mce-onboarding-v1", "done");
    setSaving(false);
    onComplete();
  };

  const screens = [
    // 1. Welcome
    <div key="welcome" style={{ textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
        <Brain size={28} color="#A78BFA" />
        <Activity size={28} color="#00FF88" />
        <Zap size={28} color="#F59E0B" />
      </div>
      <h2 style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, color: "#fff", margin: 0 }}>Bem-vindo ao MCE</h2>
      <p style={{ fontFamily: DISPLAY, fontSize: 16, color: "rgba(255,255,255,0.6)", marginTop: 12, lineHeight: 1.5 }}>
        Mentalidade · Comportamento · Execução.<br />
        O único método que mede o que realmente importa: <strong style={{ color: "#B8922A" }}>seu sistema diário</strong>.
      </p>
      <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: "rgba(184,146,42,0.08)", border: "1px solid rgba(184,146,42,0.2)" }}>
        <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>
          Em 2 minutos você define sua linha de base e aprende a fazer o check-in diário que alimenta seu score em tempo real.
        </p>
      </div>
    </div>,

    // 2. Goal
    <div key="goal">
      <h2 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>Qual é seu objetivo principal?</h2>
      <p style={{ fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Isso personaliza a prioridade dos 3 pilares.</p>
      <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
        {GOALS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGoal(g.id)}
            style={{
              textAlign: "left", padding: 16, borderRadius: 12, cursor: "pointer",
              background: goal === g.id ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${goal === g.id ? "rgba(0,212,255,0.5)" : "rgba(255,255,255,0.08)"}`,
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Target size={18} color={goal === g.id ? "#00D4FF" : "rgba(255,255,255,0.35)"} />
              <div>
                <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: goal === g.id ? "#00D4FF" : "#fff" }}>{g.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{g.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>,

    // 3. Quick diagnostic
    <div key="diagnostic">
      <h2 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>Diagnóstico rápido</h2>
      <p style={{ fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Avalie cada pilar de 1 a 10 com honestidade.</p>
      <div style={{ display: "grid", gap: 18, marginTop: 20 }}>
        {(["M", "C", "E"] as PillarKey[]).map((p) => (
          <div key={p} style={{ padding: 14, borderRadius: 12, background: `${PILLAR_COLORS[p]}08`, border: `1px solid ${PILLAR_COLORS[p]}22` }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: PILLAR_COLORS[p], marginBottom: 10 }}>
              {p === "M" ? "MINDSET" : p === "C" ? "COMPORTAMENTO" : "EXECUÇÃO"}
            </div>
            {diagnostic[p].map((val, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                    {p === "M" ? ["Clareza de propósito", "Gestão do estresse", "Foco no processo"][idx]
                      : p === "C" ? ["Aderência alimentar", "Planejamento de refeições", "Controle de gatilhos"][idx]
                        : ["Intensidade do treino", "Recuperação / sono", "Consistência semanal"][idx]}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: PILLAR_COLORS[p] }}>{val}</span>
                </div>
                <input
                  type="range" min={1} max={10} step={1} value={val}
                  onChange={(e) => updateDiagnostic(p, idx, Number(e.target.value))}
                  style={{ width: "100%", accentColor: PILLAR_COLORS[p] }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>,

    // 4. How check-in works
    <div key="how">
      <h2 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>Como funciona o check-in</h2>
      <p style={{ fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>6 perguntas, menos de 1 minuto, todo dia.</p>
      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        {[
          { p: "M", text: "Foco / Clareza mental + Nível de estresse" },
          { p: "C", text: "Aderência nutricional + Hidratação" },
          { p: "E", text: "Movimento / Treino + Qualidade do sono" },
        ].map((item) => (
          <div key={item.p} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: PILLAR_COLORS[item.p as PillarKey] }}>{item.p}</span>
            <span style={{ fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.75)" }}>{item.text}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}>
        <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>
          O score usa uma média móvel de 7 dias. Um dia ruim não quebra o processo — o padrão é que importa.
        </p>
      </div>
    </div>,

    // 5. Done
    <div key="done" style={{ textAlign: "center" }}>
      <CheckCircle2 size={48} color="#00FF88" style={{ margin: "0 auto 16px" }} />
      <h2 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, color: "#fff", margin: 0 }}>Pronto para começar</h2>
      <p style={{ fontFamily: DISPLAY, fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 12, lineHeight: 1.5 }}>
        Seu diagnóstico inicial será salvo como linha de base.<br />
        A partir de amanhã, o check-in diário alimenta seu score real.
      </p>
    </div>,
  ];

  const canAdvance = step === 1 ? !!goal : true;
  const isLast = step === totalSteps - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: "fixed", inset: 0, zIndex: 90, background: "#020205", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}
    >
      <div style={{ width: "100%", maxWidth: 520, padding: 28, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? "#B8922A" : "rgba(255,255,255,0.08)" }} />
          ))}
        </div>

        {screens[step]}

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              style={{
                padding: "12px 20px", borderRadius: 8, cursor: "pointer",
                fontFamily: MONO, fontSize: 11, letterSpacing: 2,
                background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)",
              }}
            >
              VOLTAR
            </button>
          )}
          <button
            type="button"
            disabled={!canAdvance || saving}
            onClick={() => isLast ? save() : setStep((s) => s + 1)}
            style={{
              flex: 1, padding: "12px 20px", borderRadius: 8, cursor: canAdvance ? "pointer" : "default",
              fontFamily: MONO, fontSize: 11, letterSpacing: 2,
              background: canAdvance ? "rgba(184,146,42,0.18)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${canAdvance ? "rgba(184,146,42,0.5)" : "rgba(255,255,255,0.08)"}`,
              color: canAdvance ? "#B8922A" : "rgba(255,255,255,0.3)",
              display: "flex", alignItems:"center", justifyContent: "center", gap: 8,
            }}
          >
            {saving ? "SALVANDO..." : isLast ? "ENTRAR NO MCE" : <>AVANÇAR <ArrowRight size={14} /></>}
          </button>
        </div>

        <button
          type="button"
          onClick={() => { localStorage.setItem("mce-onboarding-v1", "done"); onComplete(); }}
          style={{
            marginTop: 14, width: "100%", padding: "10px 0", background: "transparent", border: "none",
            fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: "rgba(255,255,255,0.3)", cursor: "pointer",
          }}
        >
          Já conheço o MCE · pular introdução
        </button>
      </div>
    </div>
  );
}
