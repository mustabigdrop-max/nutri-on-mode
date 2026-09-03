import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MceRadar from "@/components/mce/MceRadar";
import {
  QUESTIONS,
  PILLAR_META,
  GOALS,
  computeScores,
  insightFor,
  weakestPillar,
  COACH_WHATSAPP,
  type DiagAnswer,
  type DiagPillar,
} from "@/data/mceDiagnostico";

const C = {
  bg: "#020205",
  surface: "#0a0e18",
  surfaceLight: "#111827",
  cyan: "#00D4FF",
  gold: "#B8922A",
  red: "#ff4757",
  green: "#00d4a1",
  whatsapp: "#25D366",
  text: "#e8edf5",
  muted: "#6b7a94",
  border: "#1a2236",
};
const MONO = "'Space Mono', ui-monospace, monospace";
const DISPLAY = "'Rajdhani', system-ui, sans-serif";

type Step = "landing" | "quiz" | "capture" | "result";

export default function DiagnosticoMCEPage() {
  const [step, setStep] = useState<Step>("landing");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<DiagAnswer[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    document.title = "Diagnóstico MCE — Coach Diogo Mello";
  }, []);

  const scores = useMemo(() => computeScores(answers), [answers]);

  const q = QUESTIONS[index];
  const meta = q ? PILLAR_META[q.pillar] : PILLAR_META.M;

  function choose(optIndex: number) {
    if (picked !== null || !q) return;
    setPicked(optIndex);
    setTimeout(() => {
      setLeaving(true);
      setTimeout(() => {
        setAnswers((prev) => [
          ...prev,
          { pillar: q.pillar, question_index: index, score: q.options[optIndex].value },
        ]);
        setPicked(null);
        setLeaving(false);
        if (index + 1 >= QUESTIONS.length) setStep("capture");
        else setIndex(index + 1);
      }, 250);
    }, 350);
  }

  async function submit() {
    if (!name.trim() || saving) return;
    setSaving(true);
    const params = new URLSearchParams(window.location.search);
    try {
      await supabase.from("mce_leads").insert({
        name: name.trim(),
        whatsapp: whatsapp.trim() || null,
        goal: goal || null,
        score_mentalidade: scores.M,
        score_comportamento: scores.C,
        score_execucao: scores.E,
        score_total: scores.total,
        level: scores.level,
        answers: answers as unknown as never,
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        device: window.innerWidth < 768 ? "mobile" : "desktop",
        referrer: document.referrer || null,
      });
    } catch {
      /* resultado é exibido mesmo se o registro falhar */
    }
    setSaving(false);
    setStep("result");
    [0, 200, 600, 1600, 2400].forEach((t, i) => setTimeout(() => setReveal(i + 1), t));
  }

  const shell: React.CSSProperties = {
    minHeight: "100vh",
    background: C.bg,
    color: C.text,
    fontFamily: DISPLAY,
    padding: "28px 18px 48px",
  };
  const inner: React.CSSProperties = { maxWidth: 420, margin: "0 auto" };

  const logo = (
    <div
      style={{
        width: 52,
        height: 52,
        border: `2px solid ${C.cyan}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: MONO,
        fontSize: 15,
        color: C.cyan,
        margin: "0 auto",
      }}
    >
      MCE
    </div>
  );

  if (step === "landing") {
    return (
      <div style={shell}>
        <div style={{ ...inner, textAlign: "center" }}>
          {logo}
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 4, color: C.gold, marginTop: 22 }}>
            DIAGNÓSTICO GRATUITO
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.15, margin: "14px 0 12px" }}>
            Descubra por que você ainda não tem o corpo{" "}
            <span style={{ color: C.cyan }}>que merece ter.</span>
          </h1>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
            9 perguntas. 2 minutos. Um raio-X dos 3 pilares que definem se você vai transformar ou só tentar.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, margin: "24px 0" }}>
            {(["M", "C", "E"] as DiagPillar[]).map((p) => (
              <div key={p} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "14px 6px" }}>
                <div style={{ fontSize: 20 }}>{PILLAR_META[p].emoji}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1, color: PILLAR_META[p].color, marginTop: 6 }}>
                  {PILLAR_META[p].label}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep("quiz")}
            style={{
              width: "100%",
              background: C.cyan,
              color: "#000",
              border: "none",
              padding: "16px",
              fontFamily: DISPLAY,
              fontWeight: 700,
              letterSpacing: 1.5,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            COMEÇAR DIAGNÓSTICO
          </button>
          <div style={{ fontFamily: MONO, fontSize: 9, color: C.muted, marginTop: 32, lineHeight: 1.8, letterSpacing: 1 }}>
            CRIADO POR
            <br />
            COACH DIOGO MELLO
            <br />
            @diogo.mell0 — nutrion.app.br
          </div>
        </div>
      </div>
    );
  }

  if (step === "quiz" && q) {
    const progress = ((index + (picked !== null ? 1 : 0)) / QUESTIONS.length) * 100;
    return (
      <div style={shell}>
        <div style={inner}>
          <div style={{ height: 2, background: C.border, marginBottom: 22 }}>
            <div style={{ height: 2, width: `${progress}%`, background: C.cyan, transition: "width .3s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>
              {String(index + 1).padStart(2, "0")}/{String(QUESTIONS.length).padStart(2, "0")}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: 2,
                color: meta.color,
                border: `1px solid ${meta.color}`,
                padding: "3px 8px",
              }}
            >
              {meta.label}
            </span>
          </div>
          <div
            style={{
              opacity: leaving ? 0 : 1,
              transform: leaving ? "translateX(-24px)" : "none",
              transition: "all .25s ease",
              marginTop: 26,
            }}
          >
            <h2 style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.35, marginBottom: 22 }}>
              {q.emoji} {q.text}
            </h2>
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => choose(i)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  background: C.surface,
                  border: `1px solid ${picked === i ? meta.color : C.border}`,
                  color: C.text,
                  padding: "14px 12px",
                  marginBottom: 10,
                  fontFamily: DISPLAY,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    flexShrink: 0,
                    border: `1px solid ${picked === i ? meta.color : C.muted}`,
                    background: picked === i ? meta.color : "transparent",
                    color: "#000",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {picked === i ? "✓" : ""}
                </span>
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === "capture") {
    return (
      <div style={shell}>
        <div style={inner}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 48,
                height: 48,
                border: `2px solid ${C.green}`,
                color: C.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                fontSize: 22,
              }}
            >
              ✓
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 3, color: C.green, marginTop: 16 }}>
              ANÁLISE PROCESSADA
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "10px 0 26px" }}>Seu diagnóstico está pronto</h2>
          </div>
          <Label>NOME</Label>
          <Input value={name} onChange={setName} placeholder="Seu nome" />
          <Label>WHATSAPP</Label>
          <Input value={whatsapp} onChange={setWhatsapp} placeholder="(00) 00000-0000" />
          <Label>OBJETIVO PRINCIPAL</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {GOALS.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                style={{
                  background: goal === g ? C.cyan : C.surface,
                  color: goal === g ? "#000" : C.text,
                  border: `1px solid ${goal === g ? C.cyan : C.border}`,
                  padding: "8px 12px",
                  fontSize: 13,
                  fontFamily: DISPLAY,
                  cursor: "pointer",
                }}
              >
                {g}
              </button>
            ))}
          </div>
          <button
            onClick={submit}
            disabled={!name.trim() || saving}
            style={{
              width: "100%",
              background: name.trim() ? C.cyan : C.surfaceLight,
              color: name.trim() ? "#000" : C.muted,
              border: "none",
              padding: 16,
              fontFamily: DISPLAY,
              fontWeight: 700,
              letterSpacing: 1.5,
              cursor: name.trim() ? "pointer" : "not-allowed",
            }}
          >
            {saving ? "PROCESSANDO..." : "VER MEU RESULTADO"}
          </button>
        </div>
      </div>
    );
  }

  // result
  const weakest = weakestPillar(scores);
  const weakScore = scores[weakest];
  const others = (["M", "C", "E"] as DiagPillar[]).filter((p) => p !== weakest);
  const waMsg = encodeURIComponent(
    `Oi Coach Diogo! Fiz o Diagnóstico MCE.\n\nMeu score: ${scores.total}% (${scores.level})\n🧠 Mentalidade: ${scores.M}%\n⚡ Comportamento: ${scores.C}%\n🎯 Execução: ${scores.E}%\n\nMeu objetivo: ${goal || "não informado"}\n\nQuero entender como evoluir.`
  );

  return (
    <div style={shell}>
      <div style={inner}>
        <div style={{ textAlign: "center", opacity: reveal >= 1 ? 1 : 0, transition: "opacity .4s" }}>
          {logo}
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 3, color: C.gold, marginTop: 14 }}>
            DIAGNÓSTICO MCE
          </div>
        </div>

        <div style={{ opacity: reveal >= 2 ? 1 : 0, transition: "opacity .5s", marginTop: 12 }}>
          <MceRadar m={scores.M} c={scores.C} e={scores.E} />
          <div style={{ textAlign: "center", marginTop: 4 }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: scores.levelColor, lineHeight: 1 }}>
              {scores.total}%
            </div>
            <span
              style={{
                display: "inline-block",
                marginTop: 8,
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: 2,
                color: scores.levelColor,
                border: `1px solid ${scores.levelColor}`,
                padding: "4px 10px",
              }}
            >
              {scores.level.toUpperCase()}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 26 }}>
          {(["M", "C", "E"] as DiagPillar[]).map((p, i) => (
            <div key={p} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 10, letterSpacing: 1 }}>
                <span style={{ color: PILLAR_META[p].color }}>
                  {PILLAR_META[p].emoji} {PILLAR_META[p].label}
                </span>
                <span style={{ color: C.muted }}>{scores[p]}%</span>
              </div>
              <div style={{ height: 6, background: C.border, marginTop: 6 }}>
                <div
                  style={{
                    height: 6,
                    width: reveal >= 3 ? `${scores[p]}%` : "0%",
                    background: PILLAR_META[p].color,
                    transition: `width .8s cubic-bezier(.22,1,.36,1) ${i * 0.4}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ opacity: reveal >= 4 ? 1 : 0, transition: "opacity .6s" }}>
          <div style={{ border: `1px solid ${C.red}55`, background: C.surface, padding: 16, marginTop: 20 }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: C.red }}>MAIOR GAP</div>
            <div style={{ fontSize: 18, fontWeight: 700, margin: "6px 0 8px", color: PILLAR_META[weakest].color }}>
              {PILLAR_META[weakest].emoji} {PILLAR_META[weakest].label} — {weakScore}%
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: C.muted }}>{insightFor(weakest, weakScore)}</p>
          </div>
          {others.map((p) => (
            <div key={p} style={{ border: `1px solid ${C.border}`, background: C.surface, padding: 14, marginTop: 10 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: PILLAR_META[p].color }}>
                {PILLAR_META[p].label} — {scores[p]}%
              </div>
              <p style={{ fontSize: 12.5, lineHeight: 1.65, color: C.muted, marginTop: 6 }}>
                {insightFor(p, scores[p])}
              </p>
            </div>
          ))}
        </div>

        <div style={{ opacity: reveal >= 5 ? 1 : 0, transition: "opacity .6s", marginTop: 28, textAlign: "center" }}>
          <div style={{ fontStyle: "italic", fontSize: 16 }}>"Transformação é sistema."</div>
          <div style={{ color: C.gold, fontFamily: MONO, fontSize: 11, marginTop: 4 }}>
            O comportamento vem antes do alimento.
          </div>
          <a
            href={`https://wa.me/${COACH_WHATSAPP}?text=${waMsg}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "block",
              background: C.whatsapp,
              color: "#fff",
              textDecoration: "none",
              padding: 16,
              marginTop: 20,
              fontWeight: 700,
              letterSpacing: 1.5,
            }}
          >
            FALAR COM O COACH DIOGO
          </a>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: C.muted, marginTop: 8 }}>
            PRIMEIRA CONVERSA GRATUITA
          </div>

          <div style={{ border: `1px solid ${C.border}`, background: C.surface, padding: 16, marginTop: 22 }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: C.muted }}>MEU DIAGNÓSTICO MCE</div>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 12 }}>
              {(["M", "C", "E"] as DiagPillar[]).map((p) => (
                <div key={p}>
                  <div style={{ fontSize: 18 }}>{PILLAR_META[p].emoji}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: PILLAR_META[p].color }}>{scores[p]}%</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: scores.levelColor, marginTop: 10 }}>
              {scores.total}%
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.muted, marginTop: 8, letterSpacing: 1 }}>
              @diogo.mell0 — nutrion.app.br/diagnostico
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: C.muted, marginBottom: 6 }}>{children}</div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        background: C.surface,
        border: `1px solid ${C.border}`,
        color: C.text,
        padding: "13px 12px",
        marginBottom: 18,
        fontFamily: DISPLAY,
        fontSize: 15,
        outline: "none",
        borderRadius: 0,
      }}
    />
  );
}
