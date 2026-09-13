import { useState, useMemo } from "react";

const COLORS = {
  bg: "#020205",
  surface: "#0a0a10",
  card: "#0f0f18",
  cyan: "#00D4FF",
  gold: "#B8922A",
  goldDim: "rgba(184,146,42,0.2)",
  cyanDim: "rgba(0,212,255,0.12)",
  text: "#e8e8ec",
  textDim: "#7a7a8a",
  green: "#22c55e",
  greenDim: "rgba(34,197,94,0.12)",
  red: "#ef4444",
  redDim: "rgba(239,68,68,0.12)",
  orange: "#f59e0b",
  orangeDim: "rgba(245,158,11,0.12)",
  purple: "#a855f7",
  purpleDim: "rgba(168,85,247,0.12)",
  border: "rgba(255,255,255,0.06)",
} as const;

type Status = "add" | "change";
type Priority = "alta" | "média" | "baixa";

interface Item {
  status: Status;
  title: string;
  desc: string;
  priority: Priority;
}

interface Category {
  title: string;
  icon: string;
  items: Item[];
}

const categories: Category[] = [
  {
    title: "PROGRESSÃO & VISUALIZAÇÃO",
    icon: "📈",
    items: [
      {
        status: "add",
        title: "Navegação semana-a-semana dentro do mesociclo",
        desc: "Hoje o aluno vê o treino do dia mas não navega entre semanas pra ver a progressão. Adicionar pills de semana (Sem 1 / Sem 2 / ... / Deload) com status visual (concluída, ativa, futura, deload).",
        priority: "alta",
      },
      {
        status: "add",
        title: "Delta de progressão por exercício",
        desc: "Mostrar o incremento de carga entre semanas ao lado do exercício. Ex: '80kg → 82.5kg (+2.5kg)' em verde. O aluno precisa VER que está progredindo.",
        priority: "alta",
      },
      {
        status: "add",
        title: "Barra de progresso geral do mesociclo",
        desc: "Percentual de conclusão do meso inteiro (semanas × sessões × exercícios executados). Visual rápido de onde o aluno está.",
        priority: "média",
      },
      {
        status: "change",
        title: "Volume Load total por semana",
        desc: "O volume realizado/prescrito já existe por grupo. Adicionar VL total (carga × reps × sets) como métrica de progressão semanal com gráfico de tendência.",
        priority: "média",
      },
      {
        status: "add",
        title: "Aderência (%) por semana",
        desc: "Percentual de treinos realizados vs programados na semana. Visível pro aluno e pro coach.",
        priority: "média",
      },
    ],
  },
  {
    title: "TÉCNICAS AVANÇADAS",
    icon: "⚡",
    items: [
      {
        status: "add",
        title: "Motor de seleção de técnicas avançadas",
        desc: "O sistema deve sugerir automaticamente quando aplicar REST-PAUSE, DROP-SET, CLUSTER SET, MYOREPS ou BISET. Gatilhos: semana 3+ do meso, isoladores, nível intermediário+. Limite: 2 técnicas por sessão.",
        priority: "alta",
      },
      {
        status: "add",
        title: "Badge de técnica no card do exercício",
        desc: "Ao lado das tags HX/BA/Z3/RIR, adicionar badge colorida quando uma técnica avançada está programada. Ex: 'REST-PAUSE' em roxo, 'DROP-SET' em laranja.",
        priority: "alta",
      },
      {
        status: "add",
        title: "Protocolo da técnica expandível",
        desc: "Ao clicar no badge da técnica, expandir com instruções: quantos drops, tempo de rest, quando parar. O aluno precisa saber COMO executar.",
        priority: "média",
      },
      {
        status: "add",
        title: "BFR (Blood Flow Restriction) como opção",
        desc: "Programar BFR em isoladores de membros, especialmente em deload ativo e reabilitação. Protocolo: 30/15/15/15, carga 20-40% 1RM, com alerta de contraindicações.",
        priority: "baixa",
      },
    ],
  },
  {
    title: "INTELIGÊNCIA DO STRATUM",
    icon: "🧠",
    items: [
      {
        status: "add",
        title: "Detecção automática de platô (De-Output)",
        desc: "Se 2+ semanas sem progressão de carga no mesmo exercício → alertar coach com escada de intervenções: trocar variação → alterar zona de rep → adicionar técnica → mini-deload → trocar divisão.",
        priority: "alta",
      },
      {
        status: "change",
        title: "RIR automático por fase (já tem RIR fixo)",
        desc: "O RIR atual parece fixo em 2 pra todos os exercícios da sessão. Deveria variar: compostos working = RIR mais alto que isoladores. E descer ao longo do meso (3→2→1→deload 4-5).",
        priority: "alta",
      },
      {
        status: "add",
        title: "Seleção automática de exercício stretch-loaded",
        desc: "Garantir pelo menos 1 exercício com ênfase na posição alongada por grupo/semana. Tags: crucifixo inclinado, pullover, rosca inclinada, stiff, tríceps francês.",
        priority: "média",
      },
      {
        status: "add",
        title: "Validação de recuperação 48h",
        desc: "O sistema deve verificar que nenhum grupo muscular é treinado com menos de 48h de intervalo. Se PPLx2, checar que Push1 e Push2 têm pelo menos 48h entre eles.",
        priority: "média",
      },
      {
        status: "add",
        title: "Flag de multi-modalidade",
        desc: "Se o aluno pratica outro esporte (corrida, luta, crossfit), o STRATUM reduz volume em 20-30% e ajusta posição dos treinos. Input no perfil do aluno.",
        priority: "baixa",
      },
    ],
  },
  {
    title: "INTERFACE COACH vs ALUNO",
    icon: "👥",
    items: [
      {
        status: "add",
        title: "Interface separada do Coach",
        desc: "O coach precisa de uma view diferente: ver todos os alunos, seus mesociclos, aderência, alertas de platô, e poder fazer override em qualquer exercício/semana sem que o aluno veja o 'rascunho'.",
        priority: "alta",
      },
      {
        status: "add",
        title: "Override por exercício com propagação",
        desc: "Coach edita séries/carga/RPE/tipo de um exercício e escolhe: aplicar só nesta semana OU propagar para as semanas seguintes. Botão 'Aplicar Override' + 'Propagar'.",
        priority: "alta",
      },
      {
        status: "add",
        title: "Painel STRATUM Engine pro coach",
        desc: "Dashboard mostrando os parâmetros ativos da engine: modelo de progressão, incrementos, RPE target, rampa de volume, deload. Tudo editável.",
        priority: "média",
      },
      {
        status: "add",
        title: "Botões rápidos do coach",
        desc: "'+ Exercício', 'Trocar exercício', 'Forçar Deload', 'Regenerar Semana'. O coach precisa de agilidade pra ajustar on-the-fly.",
        priority: "média",
      },
      {
        status: "change",
        title: "Visão do aluno — mesociclo completo",
        desc: "O aluno hoje vê o treino individual. Expandir pra ver o mesociclo inteiro: todas as semanas, com progressão visual, o que já foi feito e o que vem pela frente.",
        priority: "alta",
      },
    ],
  },
  {
    title: "INTEGRAÇÃO NUTRIPLAN ↔ TRAININGON",
    icon: "🔗",
    items: [
      {
        status: "add",
        title: "Cross-talk de fase",
        desc: "A fase do treino (acumulação/transmutação/realização/cutting) deve sinalizar automaticamente pro NutriPlan ajustar macros. Cutting → proteína 2.2-2.6g/kg. Acumulação → superávit.",
        priority: "alta",
      },
      {
        status: "add",
        title: "Ajuste de volume em cutting",
        desc: "Quando NutriPlan detecta déficit calórico, STRATUM reduz volume 20-30% e mantém intensidade. Prioriza compostos pesados pra preservar massa.",
        priority: "alta",
      },
      {
        status: "change",
        title: "Antropometria compartilhada",
        desc: "Dados de composição corporal devem estar acessíveis tanto no NutriPlan quanto no TrainingON. Peso, BF%, circunferências alimentam decisões de ambos os módulos.",
        priority: "média",
      },
    ],
  },
  {
    title: "ALERTAS INTELIGENTES",
    icon: "⚠️",
    items: [
      {
        status: "change",
        title: "Alertas de volume com ação sugerida",
        desc: "Os alertas amarelos de volume (20/13 sér excedendo) já existem e são ótimos. Melhorar: além de 'Revise a distribuição', sugerir a ação específica — 'Remover 1 série do Crossover' ou 'Mover 2 séries pra outro dia'.",
        priority: "média",
      },
      {
        status: "add",
        title: "Alerta de RPE divergente",
        desc: "Se aluno reporta RPE muito acima ou abaixo do target → carga errada. 'RPE reportado 9, target era 7 — considere reduzir carga em 5%.'",
        priority: "média",
      },
      {
        status: "add",
        title: "Alerta de falha não programada",
        desc: "Se aluno chega à falha em composto pesado sem estar programado → flag pro coach. 'Aluno atingiu falha no Agachamento — carga possivelmente alta demais.'",
        priority: "média",
      },
      {
        status: "add",
        title: "Notificação de deload automático",
        desc: "'Semana 12 é deload — volume reduzido automaticamente. Mantenha RPE 5-6.' Visível pro aluno com explicação de por que o treino é mais leve.",
        priority: "baixa",
      },
    ],
  },
];

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  add: { label: "ADICIONAR", color: COLORS.green, bg: COLORS.greenDim },
  change: { label: "MUDAR", color: COLORS.orange, bg: COLORS.orangeDim },
};

const priorityConfig: Record<Priority, { color: string }> = {
  alta: { color: COLORS.red },
  média: { color: COLORS.orange },
  baixa: { color: COLORS.textDim },
};

const phases = [
  { phase: "FASE 1", label: "Progressão visível", desc: "Navegação por semana, delta de carga, barra de progresso, RIR variável por fase", color: COLORS.red },
  { phase: "FASE 2", label: "Interface Coach", desc: "View separada, override por exercício, painel STRATUM, botões rápidos", color: COLORS.red },
  { phase: "FASE 3", label: "Técnicas avançadas", desc: "Motor de seleção, badges, protocolo expandível", color: COLORS.orange },
  { phase: "FASE 4", label: "Inteligência", desc: "Detecção de platô, stretch-loaded, validação 48h, alertas inteligentes", color: COLORS.orange },
  { phase: "FASE 5", label: "Integração NutriPlan", desc: "Cross-talk de fase, ajuste cutting, antropometria compartilhada", color: COLORS.cyan },
];

interface StatBoxProps {
  label: string;
  value: number;
  color: string;
  active: boolean;
  onClick: () => void;
}

const StatBox = ({ label, value, color, active, onClick }: StatBoxProps) => (
  <button
    onClick={onClick}
    style={{
      background: active ? COLORS.card : COLORS.surface,
      border: `1px solid ${active ? color : COLORS.border}`,
      padding: "14px 18px",
      borderRadius: 8,
      cursor: "pointer",
      minWidth: 120,
      textAlign: "left",
      transition: "all 0.15s ease",
    }}
  >
    <div style={{ fontSize: 11, letterSpacing: 1, color: COLORS.textDim, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color, marginTop: 4, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>{value}</div>
  </button>
);

export default function GapAnalysisPage() {
  const [openCat, setOpenCat] = useState<number | null>(0);
  const [filter, setFilter] = useState<"all" | Status>("all");

  const counts = useMemo(() => {
    const total = categories.reduce((sum, c) => sum + c.items.length, 0);
    const add = categories.reduce((sum, c) => sum + c.items.filter((i) => i.status === "add").length, 0);
    const change = categories.reduce((sum, c) => sum + c.items.filter((i) => i.status === "change").length, 0);
    return { total, add, change };
  }, []);

  const filtered = useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        items: cat.items.filter((i) => filter === "all" || i.status === filter),
      })),
    [filter]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 11,
              letterSpacing: 2,
              color: COLORS.gold,
              border: `1px solid ${COLORS.goldDim}`,
              padding: "4px 10px",
              borderRadius: 4,
              marginBottom: 12,
            }}
          >
            STRATUM ENGINE v2
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, letterSpacing: -1 }}>
            <span style={{ color: COLORS.text }}>GAP</span>{" "}
            <span style={{ color: COLORS.cyan }}>ANALYSIS</span>
          </h1>
          <p style={{ color: COLORS.textDim, margin: "8px 0 0", fontSize: 15 }}>
            TrainingON — O que mudar e adicionar
          </p>
          <p style={{ color: COLORS.textDim, margin: "4px 0 0", fontSize: 13, opacity: 0.8 }}>
            Comparação: estado atual nutrion.app.br vs STRATUM Engine Rules
          </p>
        </header>

        {/* Summary Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <StatBox label="Total" value={counts.total} color={COLORS.cyan} active={filter === "all"} onClick={() => setFilter("all")} />
          <StatBox label="Adicionar" value={counts.add} color={COLORS.green} active={filter === "add"} onClick={() => setFilter("add")} />
          <StatBox label="Mudar" value={counts.change} color={COLORS.orange} active={filter === "change"} onClick={() => setFilter("change")} />
        </div>

        {/* Priority Legend */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            marginBottom: 24,
            fontSize: 12,
            color: COLORS.textDim,
          }}
        >
          <span>Prioridade:</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.red }} /> ALTA
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.orange }} /> MÉDIA
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.textDim }} /> BAIXA
          </span>
        </div>

        {/* Categories */}
        <section style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {filtered.map((cat, ci) => (
            <div
              key={cat.title}
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setOpenCat(openCat === ci ? null : ci)}
                style={{
                  width: "100%",
                  background: openCat === ci ? COLORS.card : "transparent",
                  border: "none",
                  borderBottom: `1px solid ${openCat === ci ? COLORS.border : "transparent"}`,
                  padding: "14px 16px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: COLORS.text,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{cat.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>{cat.title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: COLORS.textDim, fontSize: 12 }}>
                  <span>
                    {cat.items.length} item{cat.items.length !== 1 ? "s" : ""}
                  </span>
                  <span style={{ transform: openCat === ci ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
                </div>
              </button>

              {openCat === ci && cat.items.length > 0 && (
                <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {cat.items.map((item, ii) => {
                    const s = statusConfig[item.status];
                    const p = priorityConfig[item.priority];
                    return (
                      <div
                        key={ii}
                        style={{
                          background: COLORS.bg,
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: 8,
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: s.color,
                              background: s.bg,
                              padding: "3px 7px",
                              borderRadius: 4,
                              whiteSpace: "nowrap",
                              letterSpacing: 0.5,
                            }}
                          >
                            {s.label}
                          </span>
                          <span style={{ fontSize: 10, color: p.color, fontWeight: 700, marginLeft: "auto" }}>● {item.priority.toUpperCase()}</span>
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: COLORS.text }}>{item.title}</h3>
                        <p style={{ fontSize: 13, lineHeight: 1.5, color: COLORS.textDim, margin: 0 }}>{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {openCat === ci && cat.items.length === 0 && (
                <div style={{ padding: 16, color: COLORS.textDim, fontSize: 13 }}>Nenhum item com esse filtro.</div>
              )}
            </div>
          ))}
        </section>

        {/* Implementation Order */}
        <section
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            padding: "20px",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px", letterSpacing: 1 }}>
            ORDEM DE IMPLEMENTAÇÃO SUGERIDA
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {phases.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  borderLeft: `3px solid ${p.color}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    minWidth: 64,
                    fontSize: 11,
                    fontWeight: 800,
                    color: p.color,
                    letterSpacing: 0.5,
                  }}
                >
                  {p.phase}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{p.label}</div>
                  <div style={{ fontSize: 13, color: COLORS.textDim, lineHeight: 1.45 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
