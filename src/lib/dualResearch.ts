import { supabase } from "@/integrations/supabase/client";

/** Domínios de pesquisa disponíveis — espelham os módulos do nutriON. */
export const DOMINIOS_PESQUISA = [
  { id: "peptideos", label: "Peptídeos", hint: "meia-vida, mecanismo, dose estudada" },
  { id: "esteroides", label: "Esteroides", hint: "farmacologia e redução de danos" },
  { id: "microbiota", label: "Microbiota", hint: "cepas, fibras, repovoamento" },
  { id: "fitoterapicos", label: "Fitoterápicos", hint: "extratos, interações, evidência" },
  { id: "nutricao", label: "Nutrição · NutriPlan", hint: "proteína, energia, composição" },
  { id: "treino", label: "Treino · TrainingON", hint: "volume, frequência, falha" },
  { id: "exames", label: "Exames · Lab", hint: "marcadores e interpretação" },
  { id: "metabolico", label: "MetabolicON", hint: "gasto energético e adaptação" },
  { id: "corrida", label: "RunON", hint: "limiar, economia, carboidrato" },
  { id: "apex", label: "APEX Visual", hint: "avaliação antes de treinar" },
  { id: "science_hub", label: "Science Hub", hint: "estado da arte" },
  { id: "mce", label: "Método MCE", hint: "comportamento e aderência" },
  { id: "livre", label: "Tema livre", hint: "escreva o que quiser pesquisar" },
] as const;

export type DominioPesquisa = (typeof DOMINIOS_PESQUISA)[number]["id"];

export type PesquisaBrief = {
  titulo?: string;
  resumo?: string;
  dados?: { valor: string; significado: string }[];
  mecanismo?: string[];
  farmaco?: {
    meia_vida?: string;
    pico?: string;
    via_estudada?: string;
    dose_estudada?: string;
    observacao_homens?: string;
    observacao_mulheres?: string;
  };
  perguntas_publico?: string[];
  mitos?: { mito: string; veredito: string; porque: string }[];
  riscos?: string[];
  regulatorio?: string;
  ganchos?: string[];
  teaser?: string;
  incerto?: string[];
  fontes?: string[];
};

export type PesquisaDual = {
  brief: PesquisaBrief;
  dominio: DominioPesquisa;
  dominioLabel: string;
  tema: string;
  citations: string[];
};

/** Roda a pesquisa dual (busca científica + especialista) para qualquer tema. */
export async function pesquisarDual(opts: {
  tema: string;
  dominio: DominioPesquisa;
  angulo?: string;
}): Promise<PesquisaDual> {
  const { data, error } = await supabase.functions.invoke("dual-research", {
    body: { tema: opts.tema, dominio: opts.dominio, angulo: opts.angulo || "" },
  });
  if (error) throw error;
  const res = data as PesquisaDual & { error?: string };
  if (res?.error) throw new Error(res.error);
  return res;
}

/**
 * Empacota a pesquisa para ir junto de qualquer geração de conteúdo.
 * O gerador usa isso como fonte única de dados científicos.
 */
export const pesquisaParaGeracao = (p: PesquisaDual | null) =>
  p ? { tema: p.tema, dominio: p.dominio, dominioLabel: p.dominioLabel, brief: p.brief } : undefined;

/* ── Pesquisa ativa: compartilhada entre todos os geradores ────────────── */

let pesquisaAtiva: PesquisaDual | null = null;
const EVT = "nutrion:pesquisa-ativa";

export const getPesquisaAtiva = () => pesquisaAtiva;

export const setPesquisaAtiva = (p: PesquisaDual | null) => {
  pesquisaAtiva = p;
  window.dispatchEvent(new CustomEvent(EVT));
};

/** Anexa a pesquisa ativa (se houver) ao corpo de qualquer geração. */
export const comPesquisa = <T extends Record<string, unknown>>(body: T) => {
  const p = pesquisaParaGeracao(pesquisaAtiva);
  return p ? { ...body, pesquisa: p } : body;
};

export const PESQUISA_EVENT = EVT;
