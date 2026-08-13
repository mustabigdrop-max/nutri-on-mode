import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResultadoPCAType, PerfilPCA } from "@/types/pca";
import { HudShell, HudStatusBar, HudPanel, HudHex } from "@/components/hud/HudShell";
import { Activity, Brain, Target, Zap, ArrowRight } from "lucide-react";

const CONFIG_PERFIL: Record<PerfilPCA, {
  cor: string;
  code: string;
  headline: string;
  descricao: string;
  pontoForte: string;
  desafio: string;
  comoAjuda: string;
  recomendacoes: string[];
}> = {
  "Atleta Mental": {
    cor: "#00C896",
    code: "AM",
    headline: "Disciplinado, orientado a dados e pronto para o próximo nível.",
    descricao: "Você já tem a mentalidade certa. O que falta é um sistema com dados precisos para otimizar além do básico.",
    pontoForte: "Consistência excepcional — você aparece mesmo sem motivação.",
    desafio: "Otimizar além do básico sem dados precisos para guiar cada decisão.",
    comoAjuda: "Macros precisos, Carb Cycling avançado e pesquisa global atualizada. Cada protocolo baseado em estudos reais.",
    recomendacoes: [
      "Ativar módulo NutriSync para periodização avançada",
      "Habilitar Lab Performance Pro para biomarcadores",
      "Conectar wearables para tracking contínuo",
    ],
  },
  "Sabotador Emocional": {
    cor: "#C04828",
    code: "SE",
    headline: "Você come com o coração. Está na hora de entender o porquê.",
    descricao: "Não é fraqueza — é comportamento. Você responde a emoções com comida, e isso tem solução com o suporte certo.",
    pontoForte: "Alta sensibilidade emocional que, quando direcionada, vira combustível.",
    desafio: "Quebrar ciclos de culpa e comer emocional sem suporte adequado.",
    comoAjuda: "O sistema reconhece seu estado emocional antes de qualquer orientação técnica. Foco em um passo de cada vez.",
    recomendacoes: [
      "Ativar Behavioral Triggers para mapear gatilhos",
      "Habilitar Emotional Scan diário",
      "Diário comportamental contextual",
    ],
  },
  "Executor Inconsistente": {
    cor: "#B8922A",
    code: "EI",
    headline: "Você sabe o que fazer. O problema é manter por mais de 3 semanas.",
    descricao: "Alta motivação no início, queda rápida depois. Não é falta de força de vontade — é falta do sistema certo.",
    pontoForte: "Capacidade de começar com alta energia — falta só o sistema para sustentar.",
    desafio: "Manter consistência por mais de 2-3 semanas sem perder o ritmo.",
    comoAjuda: "Missões simples, streak visual, notificações no momento certo e protocolo de retomada sem drama.",
    recomendacoes: [
      "Ativar Gamification para missões diárias",
      "Habilitar Smart Alerts contextuais",
      "Score de consistência semanal",
    ],
  },
  "Perfeccionista Paralisado": {
    cor: "#00D4FF",
    code: "PP",
    headline: "Tudo ou nada. Descubra que 80% bate 100% intermitente.",
    descricao: "Você quer fazer certo, e isso é uma força. Mas quando 'certo' vira inimigo do 'bom', você paralisa.",
    pontoForte: "Atenção ao detalhe e comprometimento quando engajado.",
    desafio: "Um erro vira abandono total. Perfeição como inimiga da consistência.",
    comoAjuda: "Plano com opção A (fácil) e B (completa). '80% consistente bate 100% intermitente — sempre'.",
    recomendacoes: [
      "Modo dual: plano mínimo + plano completo",
      "Vulnerability Map para identificar gatilhos de paralisia",
      "Refeed protocol sem culpa",
    ],
  },
};

const BARRAS_ORDER = [
  { label: "Atleta Mental", key: "AM" as const, cor: "#00C896" },
  { label: "Executor Inconsistente", key: "EI" as const, cor: "#B8922A" },
  { label: "Sabotador Emocional", key: "SE" as const, cor: "#C04828" },
  { label: "Perfeccionista Paralisado", key: "PP" as const, cor: "#00D4FF" },
];

const EIXOS = [
  { key: "MINDSET", label: "MINDSET", icon: Brain, color: "#00D4FF", desc: "Como você pensa sobre nutrição e disciplina" },
  { key: "COMPORTAMENTO", label: "COMPORTAMENTO", icon: Activity, color: "#C04828", desc: "Como você reage emocionalmente à comida" },
  { key: "EXECUÇÃO", label: "EXECUÇÃO", icon: Target, color: "#B8922A", desc: "Como você sustenta hábitos no tempo" },
];

export default function ResultadoPCAPage() {
  const navigate = useNavigate();
  const [resultado, setResultado] = useState<ResultadoPCAType | null>(null);
  const [barrasAnimadas, setBarrasAnimadas] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("resultado_pca");
    if (!raw) { navigate("/assessment"); return; }
    setResultado(JSON.parse(raw) as ResultadoPCAType);
    setTimeout(() => setBarrasAnimadas(true), 400);
  }, [navigate]);

  if (!resultado) return null;

  const config = CONFIG_PERFIL[resultado.perfil_principal];
  const configSec = CONFIG_PERFIL[resultado.perfil_secundario];

  const barras = BARRAS_ORDER
    .map(b => ({ ...b, valor: resultado.pontuacao[b.key] }))
    .sort((a, b) => b.valor - a.valor);

  const total = barras.reduce((s, b) => s + b.valor, 0) || 1;

  return (
    <HudShell>
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="max-w-3xl mx-auto px-5 py-8 pb-16">
        {/* Status bar */}
        <div className="mb-6">
          <HudStatusBar
            label="PCA · DIAGNÓSTICO COMPLETO"
            meta={`MOD · 04 · ${new Date().toISOString().slice(0, 10)}`}
            color={config.cor}
          />
        </div>

        {/* Header */}
        <div className="mb-6" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          <p
            className="text-[10px] uppercase mb-2"
            style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.3em", color: "rgba(245,240,232,0.4)" }}
          >
            // PERFIL COMPORTAMENTAL ATIVADO
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight"
            style={{ color: "#F5F0E8", letterSpacing: "0.02em" }}
          >
            VOCÊ É UM{" "}
            <span style={{ color: config.cor, textShadow: `0 0 24px ${config.cor}66` }}>
              {resultado.perfil_principal.toUpperCase()}
            </span>
          </h1>
        </div>

        {/* Painel principal */}
        <HudPanel tag={`ID · ${config.code}`} tagColor={config.cor} className="p-6 md:p-8 mb-5">
          <div className="flex items-center gap-5 mb-5">
            <HudHex code={config.code} color={config.cor} size={72} />
            <div className="flex-1">
              <p
                className="text-[10px] uppercase mb-1"
                style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.25em", color: config.cor }}
              >
                ASSINATURA PRIMÁRIA
              </p>
              <p
                className="text-xl md:text-2xl font-semibold leading-snug"
                style={{ fontFamily: "'Rajdhani', sans-serif", color: "#F5F0E8" }}
              >
                {config.headline}
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(245,240,232,0.7)" }}>
            {config.descricao}
          </p>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-4" style={{ border: `1px solid ${config.cor}33`, background: "rgba(0,200,150,0.04)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="hud-status-dot" style={{ background: "#00C896" }} />
                <span
                  className="text-[10px] uppercase"
                  style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em", color: "#00C896" }}
                >
                  PONTO FORTE
                </span>
              </div>
              <p className="text-sm" style={{ color: "#F5F0E8" }}>{config.pontoForte}</p>
            </div>
            <div className="p-4" style={{ border: "1px solid rgba(192,72,40,0.3)", background: "rgba(192,72,40,0.04)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="hud-status-dot" style={{ background: "#C04828" }} />
                <span
                  className="text-[10px] uppercase"
                  style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em", color: "#C04828" }}
                >
                  DESAFIO CENTRAL
                </span>
              </div>
              <p className="text-sm" style={{ color: "#F5F0E8" }}>{config.desafio}</p>
            </div>
          </div>
        </HudPanel>

        {/* Resumo por eixo */}
        <HudPanel tag="AXIS · MAP" className="p-6 md:p-8 mb-5">
          <p
            className="text-[10px] uppercase mb-5"
            style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.25em", color: "#00D4FF" }}
          >
            DIAGNÓSTICO POR EIXO
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {EIXOS.map((eixo) => {
              const Icon = eixo.icon;
              return (
                <div
                  key={eixo.key}
                  className="p-4"
                  style={{ border: `1px solid ${eixo.color}26`, background: "rgba(10,10,26,0.5)" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={16} style={{ color: eixo.color }} />
                    <span
                      className="text-[10px] uppercase"
                      style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em", color: eixo.color }}
                    >
                      {eixo.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(245,240,232,0.65)" }}>
                    {eixo.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </HudPanel>

        {/* Distribuição */}
        <HudPanel tag="DIST · 04" className="p-6 md:p-8 mb-5">
          <p
            className="text-[10px] uppercase mb-5"
            style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.25em", color: "#B8922A" }}
          >
            DISTRIBUIÇÃO COMPORTAMENTAL
          </p>
          <div className="space-y-4">
            {barras.map((b) => {
              const pct = Math.round((b.valor / 30) * 100);
              const share = Math.round((b.valor / total) * 100);
              const isPrincipal = b.label === resultado.perfil_principal;
              return (
                <div key={b.key}>
                  <div
                    className="flex justify-between items-center text-[11px] mb-2"
                    style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em" }}
                  >
                    <span
                      className="uppercase"
                      style={{ color: isPrincipal ? b.cor : "rgba(245,240,232,0.7)", fontWeight: isPrincipal ? 700 : 400 }}
                    >
                      {b.label} {isPrincipal && "●"}
                    </span>
                    <span style={{ color: "rgba(80,80,122,1)" }}>
                      {b.valor}PTS · {share}%
                    </span>
                  </div>
                  <div className="w-full h-[6px] relative" style={{ background: "rgba(184,146,42,0.08)" }}>
                    <div
                      className="h-full transition-all duration-[1200ms] ease-out"
                      style={{
                        width: barrasAnimadas ? `${pct}%` : "0%",
                        backgroundColor: b.cor,
                        boxShadow: isPrincipal ? `0 0 12px ${b.cor}` : "none",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div
            className="mt-5 pt-4 text-[11px] uppercase"
            style={{
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.18em",
              color: "rgba(245,240,232,0.5)",
              borderTop: "1px solid rgba(184,146,42,0.15)",
            }}
          >
            ASSINATURA SECUNDÁRIA ·{" "}
            <span style={{ color: configSec.cor }}>{resultado.perfil_secundario}</span>
          </div>
        </HudPanel>

        {/* Recomendações */}
        <HudPanel tag="REC · SYS" tagColor={config.cor} className="p-6 md:p-8 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <Zap size={14} style={{ color: config.cor }} />
            <span
              className="text-[10px] uppercase"
              style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.25em", color: config.cor }}
            >
              PROTOCOLOS RECOMENDADOS PARA SEU PERFIL
            </span>
          </div>
          <p className="text-sm mb-5 leading-relaxed" style={{ color: "rgba(245,240,232,0.7)" }}>
            {config.comoAjuda}
          </p>
          <div className="space-y-2">
            {config.recomendacoes.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3"
                style={{ border: "1px solid rgba(184,146,42,0.15)", background: "rgba(10,10,26,0.5)" }}
              >
                <span
                  className="text-[10px] flex-shrink-0 mt-0.5"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    color: config.cor,
                    letterSpacing: "0.15em",
                  }}
                >
                  R-{String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm" style={{ color: "#F5F0E8" }}>{rec}</span>
              </div>
            ))}
          </div>
        </HudPanel>

        {/* CTA */}
        <button
          onClick={() => navigate("/dashboard")}
          className="hud-btn w-full py-4 px-6 flex items-center justify-center gap-3 group"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          ATIVAR SISTEMA <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </HudShell>
  );
}
