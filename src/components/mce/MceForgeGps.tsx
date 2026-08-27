import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const C = {
  bg: "#020205", s1: "#0B0B12", s2: "#10101A", s3: "#181824",
  border: "#ffffff08", cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E", red: "#EF4444",
  purple: "#A855F7", orange: "#F97316", muted: "#4A4A5A", dim: "#333340",
  text: "#C8C8D8", white: "#F0F0F8",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

type Step = {
  id: string; pillar: "M" | "C" | "E"; title: string; desc: string;
  action?: string; error?: string;
};

const PHASES: { id: number; name: string; sub: string; color: string; icon: string; desc: string; gate: string; steps: Step[] }[] = [
  {
    id: 0, name: "Fundação", sub: "Semana 1-2", color: C.cyan, icon: "◇",
    desc: "Instalar os 3 hábitos-âncora. Sem isso, nada funciona.",
    gate: "3 check-ins seguidos + 1 treino registrado",
    steps: [
      { id: "m1", pillar: "M", title: "Defina seu porquê", desc: "Escreva em 1 frase por que você começou. Não é o corpo — é o que o corpo representa.", action: "Abra o MCE e preencha o campo 'Meu Porquê'", error: "Não escreva metas vagas como 'ficar saudável'. Seja específico: 'quero subir 3 lances sem ofegar pra brincar com meu filho.'" },
      { id: "m2", pillar: "M", title: "Áudio de ativação", desc: "Ouça o áudio 'Despertar' toda manhã. 5 minutos. Antes do celular, antes do café.", action: "Vá em MCE > Audio Academy > Despertar. Coloque alarme 5 min antes de levantar.", error: "Se ouvir no carro ou no trabalho, perde o efeito. O cérebro precisa estar em estado alfa (recém-acordado)." },
      { id: "c1", pillar: "C", title: "Check-in matinal", desc: "Todo dia ao acordar: 30 segundos respondendo como dormiu, mindset e se sabe o plano.", action: "Abra o FORGE > Check-in ☀. São 3 perguntas. Tapa e pronto.", error: "Se pular o check-in, o sistema não calibra seu dia. Sem dados = sem correção = sem evolução." },
      { id: "c2", pillar: "C", title: "Protocolo 24H ativo", desc: "Registre cada refeição no dia que comer. Não no dia seguinte. No ATO.", action: "NutriPlan > Registrar refeição. Foto ou texto. 10 segundos.", error: "Registrar 'depois' = esquecer. O comportamento que não é registrado não é gerenciado." },
      { id: "e1", pillar: "E", title: "Primeiro treino registrado", desc: "Faça seu treino e registre no TrainingON. Qualquer treino. O importante é o REGISTRO.", action: "TrainingON > Iniciar treino > Siga a sequência > Finalize.", error: "Treinar sem registrar é invisível. O sistema precisa dos dados pra periodizar. Sem registro = sem STRATUM." },
      { id: "e2", pillar: "E", title: "Check-in noturno", desc: "Antes de dormir: 30 segundos avaliando treino, dieta, conteúdo e execução geral.", action: "FORGE > Check-in 🌙. 4 perguntas. Fecha o ciclo do dia.", error: "O check-in noturno é onde a IA detecta desvios. Sem ele, o Protocolo de Correção não ativa." },
    ],
  },
  {
    id: 1, name: "Construção", sub: "Semana 3-4", color: C.purple, icon: "◈",
    desc: "Transformar ações em hábitos. Consistência > intensidade.",
    gate: "7 dias de streak + check-ins completos",
    steps: [
      { id: "m3", pillar: "M", title: "Journaling MCE semanal", desc: "Todo domingo: 5 minutos escrevendo o que deu certo, o que errou, e 1 ajuste pra semana seguinte.", action: "MCE > Journaling > Preencha os 3 campos. A IA gera insights.", error: "Não transforme em redação. São 3 frases. Curto, direto, honesto." },
      { id: "m4", pillar: "M", title: "Identifique seus gatilhos", desc: "Quando você sai do plano, o que aconteceu antes? Estresse? Sono ruim? Social?", action: "MCE > PCA Comportamental > Mapeie seus 3 principais gatilhos.", error: "Não liste gatilhos genéricos. 'Estresse' não serve. 'Quando chego do trabalho depois das 20h e não jantei' serve." },
      { id: "c3", pillar: "C", title: "Consistência alimentar", desc: "Meta: 5 de 7 dias no plano nutricional. Não 7/7 — isso é insustentável na Fase 2.", action: "NutriPlan > Acompanhe seu score semanal. 5/7 = verde. Abaixo = alerta.", error: "Buscar 100% na Fase 2 causa efeito rebote. 70-80% é o alvo. Perfeição é inimiga da consistência." },
      { id: "c4", pillar: "C", title: "Hidratação rastreada", desc: "35ml por kg de peso. Marque cada vez que beber água.", action: "NutriPlan > Hidratação > Registre ao longo do dia.", error: "Beber tudo de uma vez não conta. Distribuir ao longo do dia é o que importa pro metabolismo." },
      { id: "e3", pillar: "E", title: "3 treinos/semana registrados", desc: "Não importa se é 3, 4 ou 6. Na Fase 2, o mínimo são 3 registrados no sistema.", action: "TrainingON > Siga o plano STRATUM da semana. Finalize cada sessão.", error: "Treinar 5x mas registrar 2x = o sistema vê 2x. O que não registra, não existiu." },
      { id: "e4", pillar: "E", title: "1 conteúdo/semana", desc: "Poste pelo menos 1 conteúdo no Instagram. Qualquer formato. O importante é começar.", action: "Social ON > Studio > Crie e poste. Use o Content Score antes.", error: "Não espere o conteúdo perfeito. Postar mediano > não postar. A prática melhora o conteúdo." },
    ],
  },
  {
    id: 2, name: "Aceleração", sub: "Mês 2-3", color: C.gold, icon: "✦",
    desc: "Hábitos instalados. Agora é otimizar e escalar.",
    gate: "21 dias de streak + Brand Score > 50",
    steps: [
      { id: "m5", pillar: "M", title: "Estudo semanal de performance", desc: "1 hora por semana estudando um dos 12 autores do MCE. Dweck, Kahneman, Fogg, Duckworth...", action: "MCE > Academia > Escolha o autor da semana. Leia o resumo + ouça o áudio." },
      { id: "m6", pillar: "M", title: "Mentalidade de criador", desc: "Pare de consumir. Comece a produzir. Cada conteúdo que você cria fortalece o MCE em você." },
      { id: "c5", pillar: "C", title: "Protocolo 24H completo", desc: "Agora todas as refeições, treino, sono e hidratação rastreados. O dashboard reflete sua vida real." },
      { id: "c6", pillar: "C", title: "Social proof ativo", desc: "Comece a documentar resultados. Transformações, métricas, depoimentos. Isso é combustível pra autoridade." },
      { id: "e5", pillar: "E", title: "3+ conteúdos/semana", desc: "Escale pra 3 posts semanais. Use o SIGNAL pra saber o que postar. Use o Recycler pra reaproveitar." },
      { id: "e6", pillar: "E", title: "STRATUM otimizado", desc: "Agora a periodização avança. Blocos de intensidade, deload, feeder sets. O sistema adapta ao seu corpo." },
    ],
  },
  {
    id: 3, name: "Maestria", sub: "Mês 3+", color: "#FF0040", icon: "♛",
    desc: "Você É o método. Vive, ensina, inspira.",
    gate: "90 dias de streak + Rank Elite",
    steps: [
      { id: "m7", pillar: "M", title: "Ensine o MCE", desc: "A forma mais profunda de aprender é ensinar. Crie conteúdo sobre cada pilar. Vire referência." },
      { id: "m8", pillar: "M", title: "Mentoria ativa", desc: "Aplique o MCE nos seus clientes. Use o PRAXIS pra entregar a experiência completa." },
      { id: "c7", pillar: "C", title: "Comportamento automatizado", desc: "Nessa fase, os hábitos são automáticos. O foco muda de construir pra manter e refinar." },
      { id: "e7", pillar: "E", title: "Conteúdo diário", desc: "Poste todo dia. Use o SIGNAL. O Social ON faz o trabalho pesado — você foca na mensagem." },
      { id: "e8", pillar: "E", title: "Escale com o nutriON", desc: "Agora o sistema trabalha pra você. Clientes entram pelo funil. Conversion Bridge mostra o ROI." },
    ],
  },
];

const pillarColors: Record<string, string> = { M: C.purple, C: C.cyan, E: C.gold };
const pillarNames: Record<string, string> = { M: "Mindset", C: "Comportamento", E: "Execução" };

type Tip = { next_focus: string; tip: string; mce_principle: string };

function StepCard({ step, done, onToggle }: { step: Step; done: boolean; onToggle: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showError, setShowError] = useState(false);
  const pc = pillarColors[step.pillar];
  return (
    <div style={{
      background: done ? `${C.green}04` : C.s1,
      border: `1px solid ${done ? `${C.green}20` : C.border}`,
      marginBottom: 6, overflow: "hidden", opacity: done ? 0.7 : 1, transition: "all .3s",
    }}>
      <button onClick={() => setExpanded(!expanded)} style={{
        width: "100%", padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 10, textAlign: "left",
      }}>
        <span
          role="checkbox" aria-checked={done} tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); onToggle(); } }}
          style={{
            width: 22, height: 22, background: done ? C.green : C.s3, border: `1px solid ${done ? C.green : C.border}`,
            borderRadius: 0, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0, fontSize: 11, color: C.white, transition: "all .2s",
          }}
        >{done ? "✓" : ""}</span>
        <span style={{ fontFamily: F.m, fontSize: 9, color: pc, background: `${pc}12`, padding: "2px 6px", letterSpacing: 1, flexShrink: 0 }}>{step.pillar}</span>
        <span style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: done ? C.dim : C.white, flex: 1, textDecoration: done ? "line-through" : "none" }}>{step.title}</span>
        <span style={{ color: expanded ? C.cyan : C.dim, fontSize: 12, transition: "color .2s", flexShrink: 0 }}>{expanded ? "▾" : "▸"}</span>
      </button>
      {expanded && (
        <div style={{ padding: "0 16px 14px 48px" }}>
          <p style={{ fontFamily: F.b, fontSize: 12, color: C.text, margin: "0 0 10px", lineHeight: 1.6 }}>{step.desc}</p>
          {step.action && (
            <div style={{ background: `${C.green}06`, borderLeft: `3px solid ${C.green}`, padding: "10px 12px", marginBottom: 8 }}>
              <div style={{ fontFamily: F.m, fontSize: 8, color: C.green, letterSpacing: 1.5, marginBottom: 4 }}>FAÇA ISSO</div>
              <p style={{ fontFamily: F.b, fontSize: 12, color: C.green, margin: 0, lineHeight: 1.5 }}>{step.action}</p>
            </div>
          )}
          {step.error && (
            <div>
              <button onClick={() => setShowError(!showError)} style={{
                background: `${C.red}06`, border: `1px solid ${C.red}15`, borderRadius: 0,
                padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, width: "100%",
              }}>
                <span style={{ fontFamily: F.m, fontSize: 8, color: C.red, letterSpacing: 1 }}>⚠ ERRO COMUM</span>
                <span style={{ fontFamily: F.m, fontSize: 9, color: C.dim, marginLeft: "auto" }}>{showError ? "▾" : "▸"}</span>
              </button>
              {showError && (
                <div style={{ background: `${C.red}04`, borderLeft: `3px solid ${C.red}`, padding: "10px 12px", marginTop: 2 }}>
                  <p style={{ fontFamily: F.b, fontSize: 12, color: C.red, margin: 0, lineHeight: 1.5, opacity: 0.9 }}>{step.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MceForgeGps() {
  const { user } = useAuth();
  const [activePhase, setActivePhase] = useState(0);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [aiTip, setAiTip] = useState<Tip | null>(null);
  const [tipLoading, setTipLoading] = useState(false);

  // Carrega progresso persistido (mce_exercises_done: exercise_key = "forge_gps_<stepid>")
  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase
        .from("mce_exercises_done")
        .select("exercise_key")
        .eq("user_id", user.id)
        .like("exercise_key", "forge_gps_%");
      setDoneIds(new Set(((data as { exercise_key: string }[]) ?? []).map((r) => r.exercise_key.replace("forge_gps_", ""))));
    })();
  }, [user]);

  const phase = PHASES[activePhase];
  const isDone = useCallback((id: string) => doneIds.has(id), [doneIds]);

  const phaseDoneCount = (pIdx: number) => PHASES[pIdx].steps.filter((s) => isDone(s.id)).length;
  const doneCount = phaseDoneCount(activePhase);
  const totalCount = phase.steps.length;
  const pct = Math.round((doneCount / totalCount) * 100);
  const phaseComplete = doneCount === totalCount;

  const toggleStep = async (stepId: string) => {
    if (!user) return;
    const key = `forge_gps_${stepId}`;
    const next = new Set(doneIds);
    if (next.has(stepId)) {
      next.delete(stepId);
      await supabase.from("mce_exercises_done").delete().eq("user_id", user.id).eq("exercise_key", key);
    } else {
      next.add(stepId);
      await supabase.from("mce_exercises_done").insert({ user_id: user.id, exercise_key: key });
    }
    setDoneIds(next);
  };

  const getAITip = async () => {
    setTipLoading(true);
    const incomplete = phase.steps.filter((s) => !isDone(s.id)).map((s) => `${s.pillar}: ${s.title}`);
    try {
      const { data } = await supabase.functions.invoke("mce-forge", {
        body: { mode: "forge_tip", phase: phase.name, doneCount, totalCount, incomplete },
      });
      if (data) setAiTip(data as Tip);
    } catch { /* silencia */ }
    setTipLoading(false);
  };

  const byPillar: Record<string, Step[]> = { M: [], C: [], E: [] };
  phase.steps.forEach((s) => byPillar[s.pillar]?.push(s));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: C.white, letterSpacing: 1 }}>🧭 GPS</span>
        <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>Passo a passo · Impossível se perder</span>
      </div>

      {/* Phase selector */}
      <div style={{ display: "flex", border: `1px solid ${C.border}`, marginBottom: 16 }}>
        {PHASES.map((p, i) => {
          const pDone = phaseDoneCount(i);
          const pTotal = PHASES[i].steps.length;
          const locked = i > 0 && phaseDoneCount(i - 1) < PHASES[i - 1].steps.length;
          return (
            <button key={i} onClick={() => !locked && setActivePhase(i)} style={{
              flex: 1, padding: "12px 4px", background: activePhase === i ? `${p.color}06` : "transparent",
              border: "none", borderBottom: activePhase === i ? `2px solid ${p.color}` : "2px solid transparent",
              cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.3 : 1, textAlign: "center", transition: "all .2s",
            }}>
              <span style={{ fontFamily: F.t, fontSize: 16, color: activePhase === i ? p.color : C.dim }}>{p.icon}</span>
              <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 1, color: activePhase === i ? p.color : C.dim, marginTop: 2 }}>{p.name.toUpperCase()}</div>
              <div style={{ fontFamily: F.m, fontSize: 8, color: C.dim, marginTop: 1 }}>{pDone}/{pTotal}</div>
              {locked && <div style={{ fontFamily: F.m, fontSize: 7, color: C.red, marginTop: 2 }}>🔒</div>}
            </button>
          );
        })}
      </div>

      {/* Phase header */}
      <div style={{ background: `${phase.color}06`, border: `1px solid ${phase.color}15`, padding: "16px 20px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: phase.color }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: F.t, fontSize: 24, color: phase.color }}>{phase.icon}</span>
              <span style={{ fontFamily: F.t, fontSize: 22, fontWeight: 700, color: C.white, letterSpacing: 1 }}>Fase {phase.id + 1}: {phase.name}</span>
              <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{phase.sub}</span>
            </div>
            <p style={{ fontFamily: F.b, fontSize: 13, color: C.text, margin: "0 0 6px", lineHeight: 1.5 }}>{phase.desc}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 1 }}>GATE →</span>
              <span style={{ fontFamily: F.b, fontSize: 11, color: phase.color }}>{phase.gate}</span>
            </div>
          </div>
          <div style={{ textAlign: "center", flexShrink: 0, marginLeft: 16 }}>
            <div style={{ fontFamily: F.t, fontSize: 36, fontWeight: 700, color: phase.color, lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted }}>{doneCount}/{totalCount}</div>
          </div>
        </div>
        <div style={{ height: 3, background: C.s3, marginTop: 12 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: phase.color, transition: "width .8s" }} />
        </div>
      </div>

      {/* AI Tip */}
      {!phaseComplete && (
        <div style={{ marginBottom: 16 }}>
          {!aiTip && !tipLoading ? (
            <button onClick={getAITip} style={{
              width: "100%", padding: "10px", background: `${C.cyan}06`, border: `1px solid ${C.cyan}15`,
              borderRadius: 0, cursor: "pointer", fontFamily: F.m, fontSize: 10, color: C.cyan, letterSpacing: 1,
            }}>🧠 PEDIR DICA DA IA → QUAL PASSO ATACAR AGORA?</button>
          ) : tipLoading ? (
            <div style={{ background: C.s1, border: `1px solid ${C.border}`, padding: "12px 16px", textAlign: "center" }}>
              <span style={{ fontFamily: F.m, fontSize: 10, color: C.cyan }}>Analisando seu progresso...</span>
            </div>
          ) : aiTip ? (
            <div style={{ background: C.s1, border: `1px solid ${C.cyan}15`, padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 14 }}>🧠</span>
                <span style={{ fontFamily: F.t, fontSize: 13, fontWeight: 700, color: C.cyan }}>Foco agora: {aiTip.next_focus}</span>
              </div>
              <p style={{ fontFamily: F.b, fontSize: 12, color: C.text, margin: "0 0 6px", lineHeight: 1.5 }}>{aiTip.tip}</p>
              <div style={{ background: `${C.gold}08`, padding: "6px 10px" }}>
                <span style={{ fontFamily: F.m, fontSize: 8, color: C.gold, letterSpacing: 1 }}>MCE</span>
                <span style={{ fontFamily: F.b, fontSize: 11, color: C.gold, marginLeft: 6 }}>{aiTip.mce_principle}</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Phase complete */}
      {phaseComplete && activePhase < PHASES.length - 1 && (
        <div style={{ background: `${C.green}08`, border: `1px solid ${C.green}25`, padding: "16px 20px", marginBottom: 16, textAlign: "center" }}>
          <span style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: C.green }}>✓ FASE COMPLETA</span>
          <p style={{ fontFamily: F.b, fontSize: 13, color: C.text, margin: "8px 0" }}>Próxima fase desbloqueada: {PHASES[activePhase + 1].name}</p>
          <button onClick={() => setActivePhase(activePhase + 1)} style={{
            padding: "12px 24px", background: C.green, border: "none", borderRadius: 0, cursor: "pointer",
            fontFamily: F.t, fontSize: 16, fontWeight: 700, color: C.bg, letterSpacing: 1,
          }}>→ AVANÇAR PRA FASE {activePhase + 2}</button>
        </div>
      )}

      {/* Steps by pillar */}
      {["M", "C", "E"].map((pillar) => {
        const pillarSteps = byPillar[pillar];
        if (!pillarSteps || pillarSteps.length === 0) return null;
        const pc = pillarColors[pillar];
        const pillarDone = pillarSteps.filter((s) => isDone(s.id)).length;
        return (
          <div key={pillar} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 6, height: 20, background: pc }} />
              <span style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: pc, letterSpacing: 0.5 }}>{pillarNames[pillar]}</span>
              <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{pillarDone}/{pillarSteps.length}</span>
              <div style={{ flex: 1, height: 1, background: `${pc}15`, marginLeft: 4 }} />
            </div>
            {pillarSteps.map((s) => (
              <StepCard key={s.id} step={s} done={isDone(s.id)} onToggle={() => void toggleStep(s.id)} />
            ))}
          </div>
        );
      })}

      {/* Phase summary */}
      <div style={{ background: C.s1, border: `1px solid ${C.border}`, padding: "14px 16px", marginTop: 8 }}>
        <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>RESUMO DA FASE</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {["M", "C", "E"].map((p) => {
            const ps = byPillar[p] || [];
            const d = ps.filter((s) => isDone(s.id)).length;
            const pc = pillarColors[p];
            return (
              <div key={p} style={{ background: `${pc}06`, border: `1px solid ${pc}15`, padding: "10px", textAlign: "center" }}>
                <div style={{ fontFamily: F.t, fontSize: 22, fontWeight: 700, color: pc }}>{d}/{ps.length}</div>
                <div style={{ fontFamily: F.m, fontSize: 8, color: pc, letterSpacing: 1 }}>{pillarNames[p].toUpperCase()}</div>
                <div style={{ height: 3, background: C.s3, marginTop: 6 }}>
                  <div style={{ height: "100%", width: `${ps.length ? (d / ps.length) * 100 : 0}%`, background: pc }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
