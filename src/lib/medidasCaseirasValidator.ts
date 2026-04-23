import { VISUAL_MEASURES, VisualMeasure } from "@/data/visualMeasures";

export interface MedidasPrefs {
  colher: "sopa" | "cha" | "ambas";
  xicara: "cha_240" | "grande_300" | "ambas";
  copo: "americano_200" | "grande_300" | "ambas";
  concha: "pequena_50" | "media_80" | "grande_120";
  proteinaUnidade: "palma" | "filé_tamanho" | "gramas_visuais";
  usarPunhado: boolean;
  usarFatias: boolean;
  observacoesMedidas?: string;
}

export type ValidationSeverity = "ok" | "warn" | "error";

export interface UnidadeValidacao {
  unidade: string;          // rótulo legível (ex.: "Colher de chá")
  chave: string;            // chave técnica (ex.: "colher_cha")
  status: ValidationSeverity;
  encontrados: number;      // nº de itens no banco
  esperadoMin: number;      // mínimo desejável para boa cobertura
  exemplos: string[];       // até 3 exemplos do banco
  mensagem: string;
  categoriasFaltantes?: string[];
}

export interface ValidationReport {
  total: number;
  ok: number;
  warn: number;
  error: number;
  itens: UnidadeValidacao[];
  resumo: string;
}

// Heurística leve baseada nas descrições de VISUAL_MEASURES
const matchByKeyword = (kw: RegExp): VisualMeasure[] =>
  VISUAL_MEASURES.filter(v => kw.test(v.description.toLowerCase()) || kw.test(v.name.toLowerCase()));

const buildItem = (
  unidade: string,
  chave: string,
  matches: VisualMeasure[],
  esperadoMin: number,
  categoriasEsperadas: string[] = [],
): UnidadeValidacao => {
  const encontrados = matches.length;
  const cats = new Set(matches.map(m => m.category));
  const categoriasFaltantes = categoriasEsperadas.filter(c => !cats.has(c as any));
  let status: ValidationSeverity = "ok";
  let mensagem = `Cobertura adequada (${encontrados} itens no banco).`;

  if (encontrados === 0) {
    status = "error";
    mensagem = `Nenhum item de referência encontrado para "${unidade}". A IA pode não ter equivalência confiável.`;
  } else if (encontrados < esperadoMin) {
    status = "warn";
    mensagem = `Apenas ${encontrados} item(ns) com "${unidade}" no banco (mínimo recomendado: ${esperadoMin}). Equivalências podem ser limitadas.`;
  } else if (categoriasFaltantes.length > 0) {
    status = "warn";
    mensagem = `Cobertura ok (${encontrados} itens), mas faltam categorias: ${categoriasFaltantes.join(", ")}.`;
  }

  return {
    unidade,
    chave,
    status,
    encontrados,
    esperadoMin,
    exemplos: matches.slice(0, 3).map(m => `${m.emoji} ${m.name}`),
    mensagem,
    categoriasFaltantes: categoriasFaltantes.length ? categoriasFaltantes : undefined,
  };
};

export function validateMedidasCaseiras(prefs: MedidasPrefs): ValidationReport {
  const itens: UnidadeValidacao[] = [];

  // Colher
  if (prefs.colher === "sopa" || prefs.colher === "ambas") {
    itens.push(buildItem("Colher de sopa", "colher_sopa",
      matchByKeyword(/colher de sopa/), 2, ["carboidratos", "gorduras"]));
  }
  if (prefs.colher === "cha" || prefs.colher === "ambas") {
    itens.push(buildItem("Colher de chá", "colher_cha",
      matchByKeyword(/colher de ch[aá]/), 1));
  }

  // Xícara
  if (prefs.xicara === "cha_240" || prefs.xicara === "ambas") {
    itens.push(buildItem("Xícara de chá (240ml)", "xicara_cha",
      matchByKeyword(/x[ií]cara/), 1));
  }
  if (prefs.xicara === "grande_300" || prefs.xicara === "ambas") {
    itens.push(buildItem("Xícara grande (300ml)", "xicara_grande",
      matchByKeyword(/x[ií]cara.*grande|300\s?ml/), 1));
  }

  // Copo
  if (prefs.copo === "americano_200" || prefs.copo === "ambas") {
    itens.push(buildItem("Copo americano (200ml)", "copo_americano",
      matchByKeyword(/copo|200\s?ml/), 2, ["bebidas", "lacticinios"]));
  }
  if (prefs.copo === "grande_300" || prefs.copo === "ambas") {
    itens.push(buildItem("Copo grande (300ml)", "copo_grande",
      matchByKeyword(/300\s?ml|copo.*grande/), 1));
  }

  // Concha
  const conchaLabel = {
    pequena_50: "Concha pequena (~50ml)",
    media_80: "Concha média (~80ml)",
    grande_120: "Concha grande (~120ml)",
  }[prefs.concha];
  itens.push(buildItem(conchaLabel, `concha_${prefs.concha}`,
    matchByKeyword(/concha/), 1, ["proteinas"]));

  // Proteína
  if (prefs.proteinaUnidade === "palma") {
    itens.push(buildItem("Palma da mão (proteína)", "palma",
      matchByKeyword(/palma/), 1, ["proteinas"]));
  }
  if (prefs.proteinaUnidade === "filé_tamanho") {
    itens.push(buildItem("Filé pequeno/médio/grande", "file_tamanho",
      matchByKeyword(/fil[eé]/), 1, ["proteinas"]));
  }
  if (prefs.proteinaUnidade === "gramas_visuais") {
    itens.push(buildItem("Comparações visuais (baralho, etc.)", "visual_compare",
      matchByKeyword(/baralho|deck|punho|bola/), 1, ["proteinas"]));
  }

  // Punhado
  if (prefs.usarPunhado) {
    itens.push(buildItem("Punhado (oleaginosas/frutas secas)", "punhado",
      matchByKeyword(/punhado/), 1));
  }

  // Fatias
  if (prefs.usarFatias) {
    itens.push(buildItem("Fatias (pão/queijo/frios)", "fatia",
      matchByKeyword(/fatia/), 2, ["carboidratos", "lacticinios"]));
  }

  const ok = itens.filter(i => i.status === "ok").length;
  const warn = itens.filter(i => i.status === "warn").length;
  const error = itens.filter(i => i.status === "error").length;

  let resumo = "";
  if (error > 0) resumo = `${error} unidade(s) sem equivalência no banco — ajuste as preferências ou enriqueça o catálogo.`;
  else if (warn > 0) resumo = `${warn} unidade(s) com cobertura limitada — a IA pode improvisar conversões.`;
  else resumo = `Todas as ${itens.length} unidades selecionadas têm cobertura adequada no banco.`;

  return { total: itens.length, ok, warn, error, itens, resumo };
}
