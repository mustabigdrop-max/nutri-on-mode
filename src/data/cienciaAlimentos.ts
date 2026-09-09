/**
 * Ciência por alimento — base fixa usada quando o coach posta foto de REFEIÇÃO.
 * Cada entrada cruza o alimento do NutriPlan com o mecanismo real e, quando
 * existe, com a conexão de microbiota (MicrobiotaVault / NEXUS-BIO).
 * Nada aqui é gerado: é conteúdo curado. Alimento sem entrada não recebe
 * "ciência inventada" — simplesmente não aparece nos slides científicos.
 */

export type CienciaAlimento = {
  chave: string;
  nutriente_chave: string;
  mecanismo: string;
  dado?: string;
  bonus?: string;
  conexao_microbiota?: string;
  conexao_mce?: string;
  estudo?: string;
};

export const CIENCIA_POR_ALIMENTO: Record<string, CienciaAlimento> = {
  frango: {
    chave: "frango",
    nutriente_chave: "Leucina",
    mecanismo: "Ativa mTOR — principal via de síntese proteica muscular",
    dado: "2,5g de leucina por 100g de peito de frango",
    conexao_mce: "Pilar E — proteína na hora certa, na dose certa",
  },
  arroz: {
    chave: "arroz",
    nutriente_chave: "Glicose / Amido",
    mecanismo: "Repõe glicogênio muscular no pós-treino",
    dado: "Treino de pernas deplecia boa parte do glicogênio do músculo",
    bonus: "Arroz resfriado (de ontem) tem amido resistente tipo 3 — prebiótico",
    conexao_microbiota: "Amido resistente alimenta Bifidobacterium e gera butirato",
  },
  feijao: {
    chave: "feijao",
    nutriente_chave: "Amido resistente tipo 2 + fibra",
    mecanismo: "Prebiótico natural — fermenta no cólon e alimenta bactérias benéficas",
    dado: "Produz butirato, combustível das células intestinais",
    conexao_microbiota: "Aumenta Bifidobacterium e Lactobacillus",
    bonus: "Proteína vegetal complementar (lisina)",
  },
  brocolis: {
    chave: "brocolis",
    nutriente_chave: "Sulforafano",
    mecanismo: "Ativa a via Nrf2 — maior sistema antioxidante do corpo",
    dado: "Reduz marcadores inflamatórios pós-exercício",
    conexao_microbiota: "Fibra fermentável — alimenta a diversidade microbiana",
  },
  curcuma: {
    chave: "curcuma",
    nutriente_chave: "Curcumina",
    mecanismo: "Anti-inflamatório via inibição de NF-κB e COX-2",
    dado: "Sozinha: cerca de 1% de biodisponibilidade. Com piperina (pimenta-preta): até 2.000%",
    estudo: "Shoba et al., Planta Medica, 1998",
    conexao_microbiota: "Modula a microbiota — aumenta diversidade e Lactobacillus",
  },
  ovo: {
    chave: "ovo",
    nutriente_chave: "Colina + proteína completa",
    mecanismo: "Colina vira acetilcolina (neurotransmissor) e compõe a membrana celular",
    dado: "1 ovo = ~147mg de colina (27% do valor diário)",
    conexao_microbiota: "Colina é metabolizada pela microbiota — perfil saudável reduz TMAO",
  },
  "batata doce": {
    chave: "batata doce",
    nutriente_chave: "Carboidrato complexo + beta-caroteno",
    mecanismo: "Liberação lenta de glicose — energia sustentada",
    dado: "Índice glicêmico menor que o da batata inglesa",
    conexao_microbiota: "Fibra solúvel alimenta a produção de propionato",
  },
  iogurte: {
    chave: "iogurte",
    nutriente_chave: "Caseína + probióticos",
    mecanismo: "Caseína: absorção lenta (6-8h) — anticatabólico noturno",
    dado: "Cepas vivas: Lactobacillus + Streptococcus thermophilus",
    conexao_microbiota: "Probiótico direto — coloniza temporariamente e modula o pH",
  },
  "castanha do para": {
    chave: "castanha do para",
    nutriente_chave: "Selênio + ácidos graxos",
    mecanismo: "Selênio é essencial pra tireoide (T4→T3) e pra glutationa peroxidase",
    dado: "1 castanha = 70-90mcg de selênio (valor diário: 55mcg)",
    conexao_microbiota: "Selênio modula a resposta imune intestinal",
  },
  aveia: {
    chave: "aveia",
    nutriente_chave: "Beta-glucana",
    mecanismo: "Fibra solúvel que forma gel — saciedade e controle de colesterol",
    dado: "3g por dia reduzem o LDL entre 5% e 10%",
    conexao_microbiota: "Prebiótico potente — aumenta Akkermansia e Bifidobacterium",
  },
  banana: {
    chave: "banana",
    nutriente_chave: "Potássio + FOS",
    mecanismo: "Potássio é essencial pra contração muscular. FOS é prebiótico.",
    dado: "Banana verde é rica em amido resistente",
    conexao_microbiota: "FOS alimenta Bifidobacterium de forma seletiva",
  },
  abacate: {
    chave: "abacate",
    nutriente_chave: "Ácido oleico + fibra",
    mecanismo: "Gordura monoinsaturada — saciedade e absorção de vitaminas lipossolúveis",
    dado: "Melhora o perfil lipídico e a diversidade microbiana",
    conexao_microbiota: "Aumenta bactérias produtoras de ácidos graxos de cadeia curta",
  },
  kefir: {
    chave: "kefir",
    nutriente_chave: "Probióticos diversos (30+ cepas)",
    mecanismo: "Fermentação por grãos de kefir — diversidade única de lactobacilos e leveduras",
    dado: "~10 bilhões de UFC por copo",
    conexao_microbiota: "Probiótico mais diverso disponível — superior ao iogurte comum",
  },
};

/** Aliases: como o alimento costuma aparecer escrito no plano alimentar. */
const ALIASES: Record<string, string> = {
  "peito de frango": "frango",
  "file de frango": "frango",
  "arroz branco": "arroz",
  "arroz integral": "arroz",
  "feijao preto": "feijao",
  "feijao carioca": "feijao",
  "brocolis cozido": "brocolis",
  cenoura: "brocolis",
  "pimenta preta": "curcuma",
  "pimenta-do-reino": "curcuma",
  acafrao: "curcuma",
  "acafrao da terra": "curcuma",
  "clara de ovo": "ovo",
  "ovos mexidos": "ovo",
  "iogurte grego": "iogurte",
  "iogurte natural": "iogurte",
  castanha: "castanha do para",
  "castanha-do-para": "castanha do para",
};

const normalizar = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Encontra a ciência do alimento pelo nome escrito no plano. null quando não existe. */
export function cienciaDoAlimento(nome: string): CienciaAlimento | null {
  const n = normalizar(nome);
  if (!n) return null;
  for (const [alias, chave] of Object.entries(ALIASES)) {
    if (n.includes(alias)) return CIENCIA_POR_ALIMENTO[chave] || null;
  }
  for (const chave of Object.keys(CIENCIA_POR_ALIMENTO)) {
    if (n.includes(chave)) return CIENCIA_POR_ALIMENTO[chave];
  }
  return null;
}

/** Lista de ciência para os alimentos de uma refeição, sem repetir a mesma entrada. */
export function cienciaDaRefeicao(alimentos: { nome: string }[]): { alimento: string; ciencia: CienciaAlimento }[] {
  const vistos = new Set<string>();
  const out: { alimento: string; ciencia: CienciaAlimento }[] = [];
  for (const a of alimentos) {
    const c = cienciaDoAlimento(a.nome);
    if (!c || vistos.has(c.chave)) continue;
    vistos.add(c.chave);
    out.push({ alimento: a.nome, ciencia: c });
  }
  return out;
}
