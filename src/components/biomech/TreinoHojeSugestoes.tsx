/**
 * Sugestões de conteúdo ligadas ao treino REAL de hoje (TrainingON).
 * Para cada exercício da sessão do dia, indica o que vale gerar agora:
 * carrossel salvável, React Coach, Mito ou Método e Stories rápido.
 * Nada de exercício inventado — só o que está na sessão do dia.
 */

import type { TreinoHoje } from "@/lib/treinoHojeData";
import { potencialDoExercicio, scorePotencial } from "@/lib/biomechPotencial";

export type SugestaoAngulo =
  | "educativo" | "react_coach" | "mito_metodo" | "comparativo" | "erro_comum" | "desafio_seguidor";
export type SugestaoFormato = "carrossel" | "reels" | "stories" | "todos";

export type SugestaoDoDia = {
  exercicio: string;
  rotulo: string;
  descricao: string;
  angulo: SugestaoAngulo;
  formato: SugestaoFormato;
  cor: string;
};

const GOLD = "#EF9F27";
const GREEN = "#5DCAA5";
const PURPLE = "#AFA9EC";

/** Monta as sugestões do dia a partir dos exercícios reais da sessão. */
export function sugestoesDoTreino(treino: TreinoHoje | null): SugestaoDoDia[] {
  const exercicios = (treino?.exercicios || []).map((e) => e.nome).filter(Boolean);
  const ordenados = [...exercicios].sort((a, b) => scorePotencial(b) - scorePotencial(a));
  const out: SugestaoDoDia[] = [];

  for (const nome of ordenados) {
    const tags = potencialDoExercicio(nome);
    if (tags.includes("SAVES")) {
      out.push({
        exercicio: nome, rotulo: "📑 Carrossel salvável", cor: GREEN,
        descricao: `Ciência de ${nome} em carrossel — conteúdo que o seguidor salva.`,
        angulo: "educativo", formato: "carrossel",
      });
    }
    if (tags.includes("REACT")) {
      out.push({
        exercicio: nome, rotulo: "🔥 React Coach", cor: GOLD,
        descricao: `Erro clássico em ${nome} — reação + correção em Reels.`,
        angulo: "react_coach", formato: "reels",
      });
    }
    if (tags.includes("MITO")) {
      out.push({
        exercicio: nome, rotulo: "💀 Mito ou Método", cor: PURPLE,
        descricao: `Desmonte a crença popular sobre ${nome} com a pesquisa da vault.`,
        angulo: "mito_metodo", formato: "carrossel",
      });
    }
    if (!tags.length) {
      out.push({
        exercicio: nome, rotulo: "📱 Stories rápido", cor: GREEN,
        descricao: `Detalhe de execução de ${nome} em 4 frames.`,
        angulo: "erro_comum", formato: "stories",
      });
    }
  }

  // Fecha o dia sempre com um Stories do exercício mais forte da sessão.
  if (ordenados[0] && !out.some((s) => s.formato === "stories")) {
    out.push({
      exercicio: ordenados[0], rotulo: "📱 Stories rápido", cor: GREEN,
      descricao: `Bastidor do treino de hoje com ${ordenados[0]} em 4 frames.`,
      angulo: "erro_comum", formato: "stories",
    });
  }

  return out.slice(0, 6);
}

export default function TreinoHojeSugestoes({
  treino, ativo, onEscolher,
}: {
  treino: TreinoHoje | null;
  ativo?: { exercicio: string; angulo: SugestaoAngulo; formato: SugestaoFormato } | null;
  onEscolher: (s: SugestaoDoDia) => void;
}) {
  const sugestoes = sugestoesDoTreino(treino);
  if (!treino || !sugestoes.length) return null;

  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(93,202,165,0.05)", border: "1px solid rgba(93,202,165,0.22)" }}>
      <div className="text-[10px] tracking-widest" style={{ color: GREEN }}>
        O QUE GERAR HOJE — {(treino.nomeTreino || "TREINO").toUpperCase()}
      </div>
      <p className="mt-1 text-[11px]" style={{ color: "#9ca3af" }}>
        Sugestões montadas em cima dos exercícios reais da sua sessão de hoje.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {sugestoes.map((s, i) => {
          const selecionado =
            ativo?.exercicio === s.exercicio && ativo?.angulo === s.angulo && ativo?.formato === s.formato;
          return (
            <button
              key={`${s.exercicio}-${s.angulo}-${i}`}
              onClick={() => onEscolher(s)}
              className="text-left rounded-lg p-3 transition-all"
              style={{
                background: selecionado ? `${s.cor}1f` : "rgba(255,255,255,0.03)",
                border: `1px solid ${selecionado ? s.cor : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <div className="text-[11px] font-bold" style={{ color: s.cor }}>{s.rotulo}</div>
              <div className="mt-0.5 text-xs font-semibold" style={{ color: "#f0fdf4" }}>{s.exercicio}</div>
              <div className="mt-1 text-[11px] leading-snug" style={{ color: "#9ca3af" }}>{s.descricao}</div>
              <div className="mt-2 text-[10px] uppercase tracking-wide" style={{ color: s.cor }}>
                ▶ Abrir no hub
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
