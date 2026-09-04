import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MceRadar3 from "@/components/mce/MceRadar3";
import {
  QUESTIONS,
  PILLAR_META,
  DOMAIN_META,
  GOALS,
  computeScores,
  crossScores,
  deepInsight,
  COACH_WHATSAPP,
  type DiagAnswer,
  type DiagPillar,
  type DiagDomain,
} from "@/data/mceDiagnostico";
import { trackFunnel } from "@/lib/mceFunnel";

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
  border: "#1e2d45",
};
const MONO = "'Space Mono', ui-monospace, monospace";
const DISPLAY = "'Rajdhani', system-ui, sans-serif";

const PILLARS: DiagPillar[] = ["M", "C", "E"];
const DOMAINS: DiagDomain[] = ["TR", "AL", "VD"];

type Step = "landing" | "quiz" | "capture" | "result";

export default function DiagnosticoMCEPage() {
  const [step, setStep] = useState<Step>("landing");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<DiagAnswer[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [domainIntro, setDomainIntro] = useState(false);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [reveal, setReveal] = useState(0);
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    document.title = "Diagnóstico MCE — Coach Diogo Mello";
    void trackFunnel("view");
  }, []);

  const scores = useMemo(() => computeScores(answers), [answers]);
  const q = QUESTIONS[index];
  const dMeta = q ? DOMAIN_META[q.domain] : DOMAIN_META.TR;
  const pMeta = q ? PILLAR_META[q.pillar] : PILLAR_META.M;

  useEffect(() => {
    if (step !== "quiz" || !q) return;
    const prev = index > 0 ? QUESTIONS[index - 1].domain : null;
    if (index === 0 || q.domain !== prev) {
      setDomainIntro(true);
      const t = setTimeout(() => setDomainIntro(false), index === 0 ? 1000 : 1200);
      return () => clearTimeout(t);
    }
  }, [step, index, q]);

  function choose(optIndex: number) {
    if (picked !== null || !q) return;
    setPicked(optIndex);
    setTimeout(() => {
      setLeaving(true);
      setTimeout(() => {
        setAnswers((prev) => [
          ...prev,
          { pillar: q.pillar, domain: q.domain, question_index: index, score: q.options[optIndex].value },
        ]);
        setPicked(null);
        setLeaving(false);
        if (index + 1 >= QUESTIONS.length) {
          void trackFunnel("quiz_complete");
          setStep("capture");
        } else setIndex(index + 1);
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
    void trackFunnel("lead_submitted");
    setSaving(false);
    setStep("result");
    setTimeout(() => setAnim(true), 200);
    [0, 400, 1600, 2400, 3200].forEach((t, i) => setTimeout(() => setReveal(i + 1), t));
  }

  const shell: React.CSSProperties = {
    minHeight: "100vh",
    background: C.bg,
    color: C.text,
    fontFamily: DISPLAY,
    padding: "28px 18px 48px",
  };
  const inner: React.CSSProperties = { maxWidth: 440, margin: "0 auto" };

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

  /* ── LANDING ── */
  if (step === "landing") {
    return (
      <div style={shell}>
        <div style={{ ...inner, textAlign: "center" }}>
          {logo}
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 4, color: C.gold, marginTop: 22 }}>
            DIAGNÓSTICO DE TRANSFORMAÇÃO
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.12, margin: "14px 0 12px" }}>
            Você sabe o que fazer.
            <br />
            Então por que ainda
            <br />
            <span style={{ color: C.cyan }}>não consegue?</span>
          </h1>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
            14 perguntas que revelam exatamente onde seu sistema trava — no treino, na alimentação e na vida.
          </p>

          <div style={{ display: "grid", gap: 8, margin: "24px 0" }}>
            {[
              { d: "TR" as DiagDomain, sub: "Por que você não progride como deveria" },
              { d: "AL" as DiagDomain, sub: "Por que a dieta nunca dura" },
              { d: "VD" as DiagDomain, sub: "Como estresse, sono e foco sabotam tudo" },
            ].map(({ d, sub }) => (
              <div
                key={d}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "left",
                  background: C.surface,
                  border: `1px solid ${DOMAIN_META[d].color}30`,
                  padding: "13px 14px",
                }}
              >
                <span style={{ fontSize: 22 }}>{DOMAIN_META[d].emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: DOMAIN_META[d].color }}>{DOMAIN_META[d].name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16, textAlign: "left" }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: C.gold, marginBottom: 10 }}>
              O QUE VOCÊ RECEBE
            </div>
            {[
              "Score MCE nos 3 pilares × 3 áreas da vida",
              "Mapa visual de onde você está travando",
              "Diagnóstico personalizado com ação imediata",
              "Clareza sobre seu próximo passo",
            ].map((t) => (
              <div key={t} style={{ fontSize: 13, color: C.muted, lineHeight: 1.9 }}>
                <span style={{ color: C.cyan }}>✦</span> {t}
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              void trackFunnel("quiz_start");
              setStep("quiz");
            }}
            style={{
              width: "100%",
              background: C.cyan,
              color: "#000",
              border: "none",
              padding: 17,
              marginTop: 20,
              fontFamily: DISPLAY,
              fontWeight: 800,
              letterSpacing: 1.5,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            INICIAR DIAGNÓSTICO
          </button>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: C.muted, marginTop: 10 }}>
            GRATUITO · 4 MINUTOS · RESULTADO IMEDIATO
          </div>

          <div style={{ marginTop: 32 }}>
            <div style={{ fontStyle: "italic", fontSize: 15 }}>"Transformação é sistema."</div>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: C.muted, marginTop: 6 }}>
              COACH DIOGO MELLO · @diogo.mell0
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── QUIZ ── */
  if (step === "quiz" && q) {
    if (domainIntro) {
      return (
        <div style={{ ...shell, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 46 }}>{dMeta.emoji}</div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: 5,
                color: dMeta.color,
                marginTop: 12,
              }}
            >
              {dMeta.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 10 }}>{dMeta.question}</div>
          </div>
        </div>
      );
    }

    return (
      <div style={shell}>
        <div style={inner}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>
              {String(index + 1).padStart(2, "0")}/{String(QUESTIONS.length).padStart(2, "0")}
            </span>
            <span style={{ display: "flex", gap: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: dMeta.color, border: `1px solid ${dMeta.color}`, padding: "3px 7px" }}>
                {dMeta.label}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: pMeta.color, border: `1px solid ${pMeta.color}`, padding: "3px 7px" }}>
                {pMeta.label}
              </span>
            </span>
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {DOMAINS.map((d) => {
              const list = QUESTIONS.filter((qq) => qq.domain === d);
              const done = answers.filter((a) => a.domain === d).length;
              const filled = Math.min(100, (done / list.length) * 100);
              return (
                <div key={d} style={{ flex: list.length, height: 3, background: C.border }}>
                  <div style={{ height: 3, width: `${filled}%`, background: DOMAIN_META[d].color, transition: "width .4s ease" }} />
                </div>
              );
            })}
          </div>

          <div
            style={{
              opacity: leaving ? 0 : 1,
              transform: leaving ? "translateX(-24px)" : "none",
              transition: "all .25s ease",
              marginTop: 26,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: C.muted, marginBottom: 8 }}>
              {q.phase.toUpperCase()}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, marginBottom: 20 }}>{q.text}</h2>
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => choose(i)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  gap: 11,
                  alignItems: "flex-start",
                  background: picked === i ? `${dMeta.color}12` : C.surface,
                  border: `1px solid ${picked === i ? dMeta.color : C.border}`,
                  color: picked === i ? C.text : C.muted,
                  padding: 14,
                  marginBottom: 10,
                  fontFamily: DISPLAY,
                  fontSize: 14,
                  lineHeight: 1.5,
                  cursor: picked === null ? "pointer" : "default",
                  transition: "all .15s ease",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    flexShrink: 0,
                    border: `1px solid ${picked === i ? dMeta.color : C.muted}`,
                    background: picked === i ? dMeta.color : "transparent",
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

  /* ── CAPTURE ── */
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
              DIAGNÓSTICO PROCESSADO
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "10px 0 4px" }}>Seu mapa está pronto</h2>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
              Preencha para liberar o resultado completo
            </p>
          </div>
          <Label>SEU NOME</Label>
          <Input value={name} onChange={setName} placeholder="Como posso te chamar?" />
          <Label>WHATSAPP</Label>
          <Input value={whatsapp} onChange={setWhatsapp} placeholder="(21) 99999-9999" />
          <Label>O QUE VOCÊ MAIS QUER AGORA?</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {GOALS.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                style={{
                  background: goal === g ? `${C.cyan}18` : C.surface,
                  color: goal === g ? C.cyan : C.muted,
                  border: `1px solid ${goal === g ? C.cyan : C.border}`,
                  padding: "8px 12px",
                  fontSize: 12,
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
              padding: 17,
              fontFamily: DISPLAY,
              fontWeight: 800,
              letterSpacing: 1.5,
              cursor: name.trim() ? "pointer" : "not-allowed",
            }}
          >
            {saving ? "PROCESSANDO..." : "VER MEU DIAGNÓSTICO COMPLETO"}
          </button>
        </div>
      </div>
    );
  }

  /* ── RESULT ── */
  const cross = crossScores(answers);
  const sorted = [...cross].sort((a, b) => a.score - b.score);
  const weakest = sorted[0] ?? { domain: "TR" as DiagDomain, pillar: "M" as DiagPillar, score: 0 };
  const strongest = sorted[sorted.length - 1] ?? weakest;
  const weakDomain = DOMAIN_META[weakest.domain];
  const weakPillar = PILLAR_META[weakest.pillar];
  const strongDomain = DOMAIN_META[strongest.domain];
  const strongPillar = PILLAR_META[strongest.pillar];

  const waMsg = encodeURIComponent(
    `Oi Coach Diogo! Fiz o Diagnóstico MCE.\n\n📊 Score: ${scores.total}% (${scores.level})\n\n🧠 Mentalidade: ${scores.M}%\n⚡ Comportamento: ${scores.C}%\n🎯 Execução: ${scores.E}%\n\n🏋️ Treino: ${scores.TR}%\n🍽️ Alimentação: ${scores.AL}%\n🔥 Vida: ${scores.VD}%\n\nMaior gap: ${weakDomain.name} × ${weakPillar.name} (${weakest.score}%)\nObjetivo: ${goal || "transformação"}\n\nQuero saber como evoluir.`
  );

  return (
    <div style={shell}>
      <div style={inner}>
        <div style={{ textAlign: "center", opacity: reveal >= 1 ? 1 : 0, transition: "opacity .4s" }}>
          {logo}
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 3, color: C.gold, marginTop: 14 }}>
            DIAGNÓSTICO MCE COMPLETO
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{name}, este é seu mapa</h2>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            Treino × Alimentação × Vida — analisados nos 3 pilares MCE
          </p>
          <div style={{ fontSize: 52, fontWeight: 800, color: scores.levelColor, lineHeight: 1.1, marginTop: 16 }}>
            {scores.total}%
          </div>
          <span
            style={{
              display: "inline-block",
              marginTop: 6,
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 20 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "12px 4px" }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 2, color: C.muted, textAlign: "center" }}>
              PILARES MCE
            </div>
            <MceRadar3
              values={PILLARS.map((p) => scores[p])}
              labels={PILLARS.map((p) => PILLAR_META[p].label)}
              colors={PILLARS.map((p) => PILLAR_META[p].color)}
              animate={anim}
              size={175}
              accent={C.cyan}
            />
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "12px 4px" }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 2, color: C.muted, textAlign: "center" }}>
              ÁREAS DE VIDA
            </div>
            <MceRadar3
              values={DOMAINS.map((d) => scores[d])}
              labels={DOMAINS.map((d) => DOMAIN_META[d].label)}
              colors={DOMAINS.map((d) => DOMAIN_META[d].color)}
              animate={anim}
              size={175}
              accent={C.gold}
            />
          </div>
        </div>

        <SectionTitle>PILARES</SectionTitle>
        {PILLARS.map((p, i) => (
          <Bar
            key={p}
            label={`${PILLAR_META[p].emoji} ${PILLAR_META[p].label}`}
            score={scores[p]}
            color={PILLAR_META[p].color}
            fill={anim}
            delay={i * 0.25}
          />
        ))}

        <SectionTitle>ÁREAS DE VIDA</SectionTitle>
        {DOMAINS.map((d, i) => (
          <Bar
            key={d}
            label={`${DOMAIN_META[d].emoji} ${DOMAIN_META[d].label}`}
            score={scores[d]}
            color={DOMAIN_META[d].color}
            fill={anim}
            delay={i * 0.25}
          />
        ))}

        <div style={{ opacity: reveal >= 3 ? 1 : 0, transition: "opacity .6s" }}>
          <div style={{ border: `1px solid ${C.red}55`, background: C.surface, padding: 16, marginTop: 22 }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: C.red }}>ONDE VOCÊ MAIS TRAVA</div>
            <div style={{ fontSize: 18, fontWeight: 700, margin: "8px 0 2px" }}>
              {weakDomain.emoji} {weakDomain.name} × {weakPillar.emoji} {weakPillar.name}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.red }}>{weakest.score}%</div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: C.muted, marginTop: 8 }}>
              {deepInsight(weakest.domain, weakest.pillar, weakest.score)}
            </p>
          </div>

          <div style={{ border: `1px solid ${C.green}44`, background: C.surface, padding: 14, marginTop: 10 }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: C.green }}>SUA MAIOR FORÇA</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6 }}>
              {strongDomain.emoji} {strongDomain.name} × {strongPillar.emoji} {strongPillar.name} — {strongest.score}%
            </div>
          </div>
        </div>

        <div style={{ opacity: reveal >= 4 ? 1 : 0, transition: "opacity .6s" }}>
          {DOMAINS.map((d) => (
            <div key={d} style={{ border: `1px solid ${C.border}`, background: C.surface, padding: 14, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{DOMAIN_META[d].emoji}</span>
                <span style={{ fontWeight: 700, color: DOMAIN_META[d].color }}>
                  {DOMAIN_META[d].name} — {scores[d]}%
                </span>
              </div>
              {PILLARS.map((p) => {
                const item = cross.find((c) => c.domain === d && c.pillar === p);
                if (!item) return null;
                return (
                  <div key={p} style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 9, letterSpacing: 1.5 }}>
                      <span style={{ color: PILLAR_META[p].color }}>
                        {PILLAR_META[p].emoji} {PILLAR_META[p].label}
                      </span>
                      <span style={{ color: C.muted }}>{item.score}%</span>
                    </div>
                    <p style={{ fontSize: 12.5, lineHeight: 1.65, color: C.muted, marginTop: 6 }}>
                      {deepInsight(d, p, item.score)}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ opacity: reveal >= 5 ? 1 : 0, transition: "opacity .6s", marginTop: 28, textAlign: "center" }}>
          <div style={{ fontStyle: "italic", fontSize: 16 }}>"Transformação é sistema."</div>
          <div style={{ color: C.gold, fontFamily: MONO, fontSize: 11, marginTop: 4 }}>
            O comportamento vem antes do alimento.
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16, marginTop: 18 }}>
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>
              O Método MCE é o sistema que integra treino, alimentação e vida num protocolo único.
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: C.muted, marginTop: 8 }}>
              Seu gap principal — {weakDomain.name} × {weakPillar.name} — é exatamente o ponto onde o MCE começa a
              trabalhar.
            </p>
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
              marginTop: 16,
              fontWeight: 800,
              letterSpacing: 1.5,
            }}
          >
            FALAR COM O COACH DIOGO
          </a>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: C.muted, marginTop: 8 }}>
            PRIMEIRA CONVERSA GRATUITA
          </div>

          <div style={{ border: `1px solid ${C.border}`, background: C.surface, padding: 16, marginTop: 22 }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: C.muted }}>
              COMPARTILHE SEU RESULTADO
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 12 }}>
              {PILLARS.map((p) => (
                <div key={p}>
                  <div style={{ fontSize: 18 }}>{PILLAR_META[p].emoji}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: PILLAR_META[p].color }}>{scores[p]}%</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 10 }}>
              {DOMAINS.map((d) => (
                <div key={d}>
                  <div style={{ fontSize: 18 }}>{DOMAIN_META[d].emoji}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: DOMAIN_META[d].color }}>{scores[d]}%</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: scores.levelColor, marginTop: 12 }}>
              SCORE MCE: {scores.total}%
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.muted, marginTop: 8, letterSpacing: 1 }}>
              nutrion.app.br/diagnostico · @diogo.mell0
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 26, paddingBottom: 30 }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 3, color: C.muted }}>POWERED BY</div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1, color: C.text, marginTop: 4 }}>
              nutriON
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 3, color: C.muted, margin: "22px 0 10px" }}>
      {children}
    </div>
  );
}

function Bar({
  label,
  score,
  color,
  fill,
  delay,
}: {
  label: string;
  score: number;
  color: string;
  fill: boolean;
  delay: number;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 10, letterSpacing: 1 }}>
        <span style={{ color }}>{label}</span>
        <span style={{ color: C.muted }}>{score}%</span>
      </div>
      <div style={{ height: 6, background: C.border, marginTop: 6 }}>
        <div
          style={{
            height: 6,
            width: fill ? `${score}%` : "0%",
            background: color,
            transition: `width .9s cubic-bezier(.22,1,.36,1) ${delay}s`,
          }}
        />
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
        boxSizing: "border-box",
      }}
    />
  );
}
