import { useMemo, useState } from "react";
import { ChevronDown, Sparkles, Activity, Layers, Calendar, Dna, Target, Trophy, Info } from "lucide-react";
import { TrainingSystem } from "@/data/trainingSystems";
import { RecommendationContext } from "@/data/recommendSystem";

interface Props {
  context: RecommendationContext;
  best: TrainingSystem;
  reasons: string[];
  // theme
  surface?: string;
  surface2?: string;
  border?: string;
  borderActive?: string;
  green?: string;
  greenDim?: string;
  text?: string;
  textDim?: string;
  textMuted?: string;
}

type FactorKey = "phase" | "level" | "days" | "weeks" | "fiber" | "weak" | "goal";

const PHASE_LABEL: Record<string, string> = {
  bulking: "Bulking (hipertrofia em superávit)",
  cutting: "Cutting (definição em déficit)",
  manutencao: "Manutenção",
  recomposicao: "Recomposição corporal",
  emagrecimento: "Emagrecimento",
  performance: "Performance / Força atlética",
};

const LEVEL_LABEL: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
  atleta: "Atleta / Elite",
};

const FIBER_LABEL: Record<string, string> = {
  tipo_i: "Tipo I (lentas / endurance)",
  tipo_iia: "Tipo IIa (mistas / hipertrofia mecânica)",
  tipo_iix: "Tipo IIx (rápidas / força e potência)",
  misto: "Misto (perfil equilibrado)",
};

export default function RecommendationRationalePanel({
  context, best, reasons,
  surface = "#0c120c", surface2 = "#111a11",
  border = "rgba(74,222,128,0.1)", borderActive = "rgba(74,222,128,0.35)",
  green = "#4ade80", greenDim = "rgba(74,222,128,0.08)",
  text = "#f0fdf4", textDim = "#94a3b8", textMuted = "#64748b",
}: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<FactorKey | null>(null);

  const factors = useMemo(() => {
    const days = parseInt(context.days || "4");
    const weeks = parseInt(context.weeks || "8");
    const list: { key: FactorKey; icon: any; label: string; value: string; rationale: string }[] = [
      {
        key: "phase",
        icon: Target,
        label: "Fase / Objetivo",
        value: PHASE_LABEL[context.phase] || context.phase || "—",
        rationale: phaseRationale(context.phase, best),
      },
      {
        key: "level",
        icon: Trophy,
        label: "Nível do atleta",
        value: LEVEL_LABEL[context.level] || context.level || "—",
        rationale: levelRationale(context.level, best),
      },
      {
        key: "days",
        icon: Calendar,
        label: "Dias por semana",
        value: `${days} dias/semana`,
        rationale: daysRationale(days, best),
      },
      {
        key: "weeks",
        icon: Layers,
        label: "Duração do mesociclo",
        value: `${weeks} semanas`,
        rationale: weeksRationale(weeks, best),
      },
      {
        key: "fiber",
        icon: Dna,
        label: "Tipo de fibra muscular",
        value: context.fiberType ? (FIBER_LABEL[context.fiberType] || context.fiberType) : "Não informado",
        rationale: fiberRationale(context.fiberType, best),
      },
      {
        key: "weak",
        icon: Activity,
        label: "Pontos fracos",
        value: context.weakPoints?.trim() ? context.weakPoints : "Nenhum prioritário",
        rationale: weakRationale(context.weakPoints, best),
      },
    ];
    if (context.specificGoal?.trim()) {
      list.push({
        key: "goal",
        icon: Sparkles,
        label: "Meta específica",
        value: context.specificGoal,
        rationale: `O sistema ${best.nome} foi calibrado considerando essa meta como prioridade na geração do protocolo.`,
      });
    }
    return list;
  }, [context, best]);

  return (
    <div className="rounded-xl" style={{ background: surface2, border: `1px solid ${border}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-3 text-left flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Info className="w-4 h-4 shrink-0" style={{ color: green }} />
          <div className="min-w-0">
            <p className="text-xs font-black" style={{ color: text }}>
              Por que <span style={{ color: green }}>{best.nome}</span>?
            </p>
            <p className="text-[10px]" style={{ color: textMuted }}>
              Toque para ver os critérios usados na recomendação
            </p>
          </div>
        </div>
        <ChevronDown
          className="w-4 h-4 shrink-0"
          style={{ color: textDim, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
        />
      </button>

      {open && (
        <div className="p-3 pt-0 space-y-2">
          {/* Resumo dos motivos do score */}
          {reasons.length > 0 && (
            <div className="p-2 rounded-lg" style={{ background: greenDim, border: `1px solid ${borderActive}` }}>
              <p className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: green }}>
                Sinais decisivos do score
              </p>
              <ul className="text-[10px] space-y-0.5" style={{ color: text }}>
                {reasons.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Grid de fatores clicáveis */}
          <div className="grid grid-cols-2 gap-1.5">
            {factors.map((f) => {
              const Icon = f.icon;
              const isActive = active === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setActive((curr) => (curr === f.key ? null : f.key))}
                  className="p-2 rounded-lg text-left transition-all"
                  style={{
                    background: isActive ? greenDim : surface,
                    border: `1px solid ${isActive ? borderActive : border}`,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className="w-3 h-3 shrink-0" style={{ color: isActive ? green : textDim }} />
                    <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: isActive ? green : textDim }}>
                      {f.label}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold line-clamp-2" style={{ color: text }}>
                    {f.value}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Detalhe expandido do fator selecionado */}
          {active && (
            <div className="p-2.5 rounded-lg animate-in fade-in slide-in-from-top-1" style={{ background: surface, border: `1px solid ${borderActive}` }}>
              <p className="text-[10px] leading-relaxed" style={{ color: text }}>
                {factors.find((f) => f.key === active)?.rationale}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────── Rationale builders ───────────
function phaseRationale(phase: string, s: TrainingSystem): string {
  const map: Record<string, string> = {
    bulking: `Em bulking priorizamos volume e estresse mecânico para hipertrofia. O ${s.nome} entrega esse estímulo dentro da janela calórica positiva, maximizando a síntese proteica.`,
    cutting: `No cutting o objetivo é preservar massa em déficit. ${s.nome} mantém intensidade alta com volume controlado, evitando catabolismo e excesso de fadiga sistêmica.`,
    manutencao: `Para manutenção, ${s.nome} oferece progressão sustentável de longo prazo, com risco baixo de overreaching.`,
    recomposicao: `Recomposição exige equilíbrio força + hipertrofia. ${s.nome} mescla padrões neurais e metabólicos — ideal para ganhar massa enquanto reduz gordura.`,
    emagrecimento: `Densidade de trabalho elevada acelera gasto calórico. ${s.nome} otimiza tempo sob tensão por minuto de sessão.`,
    performance: `Performance demanda força máxima e taxa de desenvolvimento de força. ${s.nome} prioriza padrões neurais e potência específica.`,
  };
  return map[phase] || `O sistema ${s.nome} é compatível com a fase atual.`;
}

function levelRationale(level: string, s: TrainingSystem): string {
  const lvl = ({ iniciante: 1, intermediario: 2, avancado: 3, atleta: 4 } as any)[level] || 2;
  const diff = Math.abs(s.complexidade - lvl);
  if (diff === 0) return `Complexidade ${s.complexidade}/5 do ${s.nome} bate exatamente com seu nível (${LEVEL_LABEL[level]}). É o ponto ideal entre desafio e execução técnica.`;
  if (diff === 1) return `${s.nome} (complexidade ${s.complexidade}/5) está um passo do seu nível atual — ainda compatível, mas exige atenção redobrada à técnica.`;
  return `O ${s.nome} possui complexidade ${s.complexidade}/5. Para o nível ${LEVEL_LABEL[level]}, o sistema foi escolhido apesar da distância porque outros critérios (fase, dias, fibras) compensaram.`;
}

function daysRationale(days: number, s: TrainingSystem): string {
  const ideal: Record<string, string> = {
    "doggcrapp": "DC trabalha cada grupo 2x por semana com rotação A/B/C — 3 a 4 dias é a frequência ouro.",
    "weider": "Bro split divide um grupo por dia — exige no mínimo 5 dias para cobrir o corpo inteiro.",
    "conjugada": "Westside Conjugado roda 2 dias Max Effort + 2 dias Dynamic Effort — formato 4 dias é o clássico.",
    "531": "5/3/1 funciona em template 3 ou 4 dias com rotação dos 4 lifts principais.",
    "texas-method": "Texas Method é literalmente 3 dias: Volume / Recovery / Intensity.",
    "bulgarian": "Bulgarian exige altíssima frequência (5-6 dias) no mesmo padrão diário.",
  };
  return ideal[s.id] || `Com ${days} dias/semana, ${s.nome} consegue cobrir a frequência mínima para gerar adaptação sem acumular fadiga.`;
}

function weeksRationale(weeks: number, s: TrainingSystem): string {
  const ideal: Record<string, string> = {
    "smolov": "Smolov exige 13 semanas completas (Intro + Base + Switching + Intense). Ciclos curtos não fecham a curva de SRA.",
    "gvt": "GVT 10x10 satura SNC em 4-6 semanas — além disso o retorno cai drasticamente.",
    "531-monolith": "Monolith é um template fechado de 6 semanas (3+3) com pico planejado.",
    "block": "Periodização em Blocos precisa de 12+ semanas para encadear Acumulação → Transmutação → Realização.",
  };
  return ideal[s.id] || `Duração de ${weeks} semanas é suficiente para completar o mesociclo do ${s.nome} com deload planejado.`;
}

function fiberRationale(fiber: string | undefined, s: TrainingSystem): string {
  if (!fiber) return `Sem teste de fibras, o ${s.nome} foi escolhido por compatibilidade neutra com perfil misto. Recomendamos testar % 1RM x reps para refinar.`;
  const map: Record<string, string> = {
    tipo_i: `Fibras Tipo I respondem melhor a volumes altos, reps elevadas e tempo sob tensão prolongado — exatamente o estímulo dominante do ${s.nome}.`,
    tipo_iia: `Tipo IIa é a fibra mais responsiva a hipertrofia mecânica em zonas 6-12 reps com cargas pesadas — central no ${s.nome}.`,
    tipo_iix: `Tipo IIx exige cargas máximas, baixas reps e velocidade alta de execução. ${s.nome} prioriza padrões neurais que recrutam essas fibras.`,
    misto: `Perfil misto se beneficia de ondulação de estímulos. ${s.nome} alterna padrões evitando especialização excessiva em uma fibra.`,
  };
  return map[fiber] || `O ${s.nome} é compatível com o perfil de fibras informado.`;
}

function weakRationale(weak: string | undefined, s: TrainingSystem): string {
  if (!weak || weak.trim().length < 3) return `Nenhum ponto fraco prioritário foi declarado. O sistema foi escolhido pelos demais critérios (fase, nível, dias, fibras).`;
  if (["mountain-dog", "rp", "gvt"].includes(s.id)) {
    return `Você indicou: "${weak}". O ${s.nome} permite especialização direta nesse(s) grupo(s) com mais volume e técnicas de pico de contração — ideal para corrigir assimetrias.`;
  }
  return `Você indicou: "${weak}". O ${s.nome} foi escolhido por outros critérios; ainda assim, podemos adicionar trabalho extra direcionado ao(s) ponto(s) fraco(s) na geração do protocolo.`;
}
