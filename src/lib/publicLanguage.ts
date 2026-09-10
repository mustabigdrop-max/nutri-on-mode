/**
 * LINGUAGEM PÚBLICA
 *
 * Os nomes internos do nutriON (NutrySync, APEX, Feeder Sets, RPE,
 * BiomechanicsVault...) só fazem sentido pra quem usa a plataforma.
 * Dentro dos SLIDES — que o seguidor vê — tudo isso vira linguagem que
 * qualquer pessoa entende. Na interface do coach os nomes técnicos ficam.
 */

export type TermoPublico = {
  /** Como o público chama */
  publico: string;
  /** Como escrever dentro do slide */
  slide: string;
  /** Explicação curta na primeira menção */
  explicacao?: string;
  /** Termo de marca que pode aparecer no slide */
  aceito?: boolean;
};

export const NOMES_PUBLICO: Record<string, TermoPublico> = {
  NutrySync: { publico: "Ajuste automático de calorias", slide: "o app ajusta suas calorias pelo treino" },
  "APEX System": { publico: "Sistema de treino inteligente", slide: "sistema de treino inteligente" },
  APEX: { publico: "Sistema de treino inteligente", slide: "sistema de treino inteligente" },
  "Feeder Sets": {
    publico: "Aquecimento específico",
    slide: "séries de preparação",
    explicacao: "séries leves antes da série pesada pra ativar o músculo",
  },
  Feeder: { publico: "Aquecimento específico", slide: "séries de preparação" },
  "Top Set": { publico: "Série principal", slide: "série principal", explicacao: "a série com mais carga do dia" },
  "Back-off Sets": { publico: "Séries de volume", slide: "séries de volume" },
  "Back-off": { publico: "Séries de volume", slide: "séries de volume" },
  RPE: { publico: "Nível de esforço", slide: "esforço", explicacao: "esforço 8/10 = poderia fazer mais 2 reps mas para" },
  RIR: { publico: "Reps de reserva", slide: "reps de reserva", explicacao: "RIR 3 = parou com 3 reps sobrando" },
  BiomechanicsVault: { publico: "Análise de exercícios", slide: "análise biomecânica" },
  PeptideVault: { publico: "Enciclopédia de peptídeos", slide: "ciência dos peptídeos" },
  MicrobiotaVault: { publico: "Ciência do intestino", slide: "ciência da microbiota" },
  SteroidVault: { publico: "Ciência dos anabolizantes", slide: "ciência dos esteroides" },
  TrainingON: { publico: "Sistema de treino", slide: "treino prescrito" },
  NutriPlan: { publico: "Plano alimentar", slide: "plano alimentar personalizado" },
  "Dual-AI": { publico: "Análise inteligente", slide: "análise completa" },
  MCE: { publico: "Método MCE", slide: "Mentalidade, Comportamento, Execução", aceito: true },
  nutriON: { publico: "nutriON", slide: "nutriON", aceito: true },
  "NEXUS-BIO": { publico: "Ciência nutriON", slide: "NEXUS-BIO", aceito: true },
};

/** Tags de slide que o público entende (substituem as tags internas). */
export const TAGS_PUBLICAS: Record<string, string> = {
  APEX_treino: "TREINO INTELIGENTE",
  APEX_aquecimento: "AQUECIMENTO QUE MUDA TUDO",
  exercicio_destaque: "EXECUÇÃO CORRETA",
  mapa_muscular: "MÚSCULOS ATIVADOS",
  comparativo_exerc: "COMPARATIVO",
  refeicao_macros: "O QUE TEM NO PRATO",
  timing: "QUANDO COMER IMPORTA",
  medida_caseira: "SEM BALANÇA",
  tempero_funcional: "TEMPERO QUE FUNCIONA",
  ajuste_calorico: "AJUSTE INTELIGENTE",
  dia_treino_vs_off: "DIA DE TREINO vs DIA OFF",
  peptideo: "CIÊNCIA DOS PEPTÍDEOS",
  microbiota: "CIÊNCIA DO INTESTINO",
  esteroide: "CIÊNCIA DOS ANABOLIZANTES",
  mentalidade: "MENTALIDADE",
  comportamento: "COMPORTAMENTO",
  execucao: "EXECUÇÃO",
  anatomia: "ANATOMIA",
  biomecanica: "BIOMECÂNICA",
  erros: "ERROS COMUNS",
  ciencia_exercicio: "O QUE A CIÊNCIA DIZ",
  ficha_tecnica: "FICHA TÉCNICA",
  como_funciona: "COMO FUNCIONA",
  beneficios: "O QUE A CIÊNCIA MOSTRA",
  riscos: "O OUTRO LADO",
  na_pratica: "NA PRÁTICA",
  perguntas_medico: "LEVE PRO SEU MÉDICO",
  resumo: "RESUMO",
  mito_metodo: "MITO OU MÉTODO?",
};

export const tagPublica = (chave: string) => TAGS_PUBLICAS[chave] || chave.replace(/_/g, " ").toUpperCase();

/** Substituições literais aplicadas no texto que vai pro slide. */
const SUBSTITUICOES: Array<[RegExp, string]> = [
  [/\bNutry\s?Sync\b/gi, "ajuste automático de calorias"],
  [/\bAPEX\s+System\b/gi, "sistema de treino inteligente"],
  [/\bSistema\s+APEX\b/gi, "sistema de treino inteligente"],
  [/\bAPEX\b/g, "treino inteligente"],
  [/\bSTRATUM\b/gi, "progressão controlada"],
  [/\bFeeder\s+Sets?\b/gi, "séries de preparação"],
  [/\bTop\s+Set\b/gi, "série principal"],
  [/\bBack[-\s]?off\s+Sets?\b/gi, "séries de volume"],
  [/\bBack[-\s]?off\b/gi, "séries de volume"],
  [/\bRPE\s*(\d+(?:[.,]\d+)?)/gi, "esforço $1/10"],
  [/\bRPE\b/gi, "esforço de 1 a 10"],
  [/\bRIR\s*(\d+)/gi, "$1 reps de reserva"],
  [/\bRIR\b/gi, "reps de reserva"],
  [/\bBiomechanics\s?Vault\b/gi, "análise biomecânica"],
  [/\bPeptide\s?Vault\b/gi, "ciência dos peptídeos"],
  [/\bMicrobiota\s?Vault\b/gi, "ciência da microbiota"],
  [/\bSteroid\s?Vault\b/gi, "ciência dos esteroides"],
  [/\bDual[-\s]?AI\b/gi, "análise completa"],
  [/\bTraining\s?ON\b/gi, "treino prescrito"],
  [/\bNutri\s?Plan\b/gi, "plano alimentar"],
];

/** Troca jargão interno por linguagem que o seguidor entende. */
export const traduzirTermosPublicos = (texto: string): string => {
  if (!texto) return texto;
  let out = texto;
  for (const [re, sub] of SUBSTITUICOES) out = out.replace(re, sub);
  return out.replace(/\s{2,}/g, " ").trim();
};

/** Numeração decorativa ("01 ", "1) ", "1. ") no começo de item de lista. */
export const semNumeracao = (texto: string): string =>
  (texto || "").replace(/^\s*(?:\(?\d{1,2}\)?[).\-–—:]|0\d)\s+/, "").trim();

/** Enquete, quiz e caixa de perguntas não são slide — são ação no Instagram. */
const INTERATIVO = /(enquete|quiz|caixa de perguntas|responde aqui|vota a[ií]|sim\s*\/\s*n[ãa]o)/i;
export const ehTextoInterativo = (texto: string) => INTERATIVO.test(texto || "");

/** Sanitiza recursivamente o conteúdo gerado que vai virar slide. */
export const sanitizarConteudoPublico = <T,>(valor: T, chave = ""): T => {
  const chaveLivre = /legenda|caption|texto_longo|descricao_longa|instruc|acoes_instagram/i.test(chave);
  if (typeof valor === "string") {
    if (chaveLivre) return valor as T;
    return semNumeracao(traduzirTermosPublicos(valor)) as unknown as T;
  }
  if (Array.isArray(valor)) return valor.map((v) => sanitizarConteudoPublico(v, chave)) as unknown as T;
  if (valor && typeof valor === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) out[k] = sanitizarConteudoPublico(v, k);
    return out as unknown as T;
  }
  return valor;
};

/** Bloco de regras injetado nos prompts de geração de conteúdo. */
export const REGRAS_LINGUAGEM_PUBLICA = `REGRAS DE LINGUAGEM PÚBLICA (valem para TODOS os textos de slide, story e reels):
Estes termos NUNCA podem aparecer nos slides — o público não sabe o que significam:
- NutrySync → "o app ajusta suas calorias pelo treino"
- APEX / STRATUM → "sistema de treino inteligente" ou não mencionar
- Feeder Sets → "séries de preparação" ou "aquecimento específico"
- Top Set → "série principal" ou "série mais pesada"
- Back-off → "séries de volume" ou "séries com menos peso"
- RPE → "esforço 8/10" ou "poderia fazer mais 2 reps mas para"
- RIR → "reps de reserva"
- BiomechanicsVault → "análise biomecânica"
- PeptideVault → "enciclopédia de peptídeos"
- MicrobiotaVault → "ciência da microbiota"
- SteroidVault → "ciência dos esteroides"
- Dual-AI → não mencionar
PODEM aparecer: nutriON, Método MCE, NEXUS-BIO (tag sutil), nomes de exercícios, nomes de compostos e termos científicos traduzidos (mTOR → "via de construção muscular").
PRIMEIRA MENÇÃO de termo técnico: explicar entre parênteses — "esforço 8/10 (poderia fazer mais 2 reps mas para)". Nas seguintes, só o termo simples.
NUNCA presuma que o seguidor sabe jargão de treino. Escreva como se explicasse pra alguém que treina há 3 meses.

REGRAS DE SLIDE LIMPO:
- NÃO numere itens dentro dos slides ("01", "02", "1)", "Passo 1"). A ordem já é dada pela sequência do carrossel.
- Números só quando são DADO: "-15.8%", "+2.000%", "150min", "P 70g C 77g G 8g", "85%".
- Em CARROSSEL: nada de enquete, quiz ou "responde aqui" dentro do slide.
- Em STORY: o slide de ENQUETE/QUIZ/CAIXA DE PERGUNTAS É permitido e serve de fundo padronizado para o sticker nativo. No slide vai SÓ a pergunta grande + espaço vazio no centro. NUNCA escreva as opções ("A) ... B) ..."), "responde aqui" nem botões falsos.
- As opções de resposta vão no JSON, em "opcoes"/"resposta_certa"/"instrucao", que aparecem nas instruções abaixo do slide para o coach montar o sticker.

FORMATO DO STORY INTERATIVO:
{"tipo":"ENQUETE","pergunta":"texto curto no slide","sticker_tipo":"enquete|quiz|caixa_perguntas|slider","opcoes":["opção 1","opção 2"],"resposta_certa":"só se for quiz","instrucao":"o que o coach faz no Instagram"}`;

export type AcaoInstagram = { story: string; titulo: string; detalhe?: string; opcoes?: string[] };

/** Instruções que ficam ABAIXO dos slides, para o coach aplicar no Instagram. */
export const acoesInstagram = (opts?: { tema?: string; pergunta?: string; enquete?: { pergunta: string; opcao1: string; opcao2: string } }): AcaoInstagram[] => {
  const tema = opts?.tema ? ` sobre ${opts.tema}` : "";
  const enq = opts?.enquete;
  return [
    { story: "Story 1", titulo: "Postar o slide da capa", detalhe: "Sem sticker — deixa a headline respirar." },
    {
      story: "Story 2",
      titulo: "Adicionar ENQUETE do Instagram",
      detalhe: enq?.pergunta || "Você treinou hoje?",
      opcoes: [enq?.opcao1 || "SIM 💪", enq?.opcao2 || "NÃO 😴"],
    },
    {
      story: "Story 3",
      titulo: "Adicionar CAIXA DE PERGUNTAS",
      detalhe: opts?.pergunta || `Manda sua dúvida${tema || " sobre o treino"}`,
    },
    { story: "Story 4", titulo: "Slide CTA com link na bio", detalhe: "Diagnóstico MCE gratuito — link na bio." },
  ];
};

type FrameInterativo = {
  tipo?: string;
  pergunta?: string;
  sticker_tipo?: string;
  opcoes?: string[];
  opcao_1?: string;
  opcao_2?: string;
  resposta_certa?: string;
  instrucao?: string;
};

const NOME_STICKER: Record<string, string> = {
  enquete: "ENQUETE",
  quiz: "QUIZ",
  caixa_perguntas: "CAIXA DE PERGUNTAS",
  slider: "SLIDER (barra de emoji)",
};

/** Instruções derivadas dos frames de story realmente gerados. */
export const acoesDosStories = (frames: FrameInterativo[]): AcaoInstagram[] =>
  (frames || []).map((f, i) => {
    const tipo = (f.sticker_tipo || f.tipo || "").toLowerCase().replace(/\s/g, "_");
    const sticker = NOME_STICKER[tipo];
    const opcoes = f.opcoes?.length ? f.opcoes : [f.opcao_1, f.opcao_2].filter(Boolean) as string[];
    return {
      story: `Story ${i + 1}`,
      titulo: sticker ? `Colar o sticker de ${sticker} por cima` : "Postar o slide como está",
      detalhe:
        f.instrucao ||
        (sticker
          ? `${f.pergunta || ""}${f.resposta_certa ? ` · resposta certa: ${f.resposta_certa}` : ""}`.trim()
          : "Sem sticker — deixa o texto respirar."),
      opcoes: opcoes.length ? opcoes : undefined,
    };
  });

export const DICA_INSTAGRAM =
  "Use as ferramentas NATIVAS do Instagram (enquete, quiz, caixa de perguntas). Não precisa estar no slide — adicione POR CIMA do story ao postar.";
