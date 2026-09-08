// ============================================================
// NEXUS-BIO MicrobiotaVault — Enciclopédia viva da microbiota
// Informação educacional. Não substitui avaliação profissional.
// ============================================================

export type MicrobiotaStatus = "VALIDADO" | "EMERGENTE" | "VANGUARDA" | "PESQUISA";
export type Evidencia = "FORTE" | "MODERADA" | "PRELIMINAR";

export type MicrobiotaCategoria =
  | "Probióticos"
  | "Prebióticos"
  | "Posbióticos"
  | "Eixo Intestino-Cérebro"
  | "Metabolismo"
  | "Imune"
  | "Performance"
  | "Longevidade"
  | "Pele"
  | "Sono"
  | "Humor";

export interface MicrobiotaItem {
  id: string;
  nome: string;
  classe: string;
  categoria: MicrobiotaCategoria;
  cepa?: string;
  status: MicrobiotaStatus;
  objetivos: string[];
  mecanismo_acao: string;
  beneficios?: string[];
  evidencia_cientifica?: Evidencia;
  dose_estudada?: string;
  alimentos_fonte?: string[];
  notas?: string;
  conexao_mce?: string;
  dica_pratica?: string;
}

export const MICROBIOTA_DISCLAIMER =
  "⚕️ Informação educacional. Não constitui prescrição ou recomendação de uso. Consulte um médico ou nutricionista.";

export const MICROBIOTA_CATEGORIAS: (MicrobiotaCategoria | "Todos")[] = [
  "Todos",
  "Probióticos",
  "Prebióticos",
  "Posbióticos",
  "Eixo Intestino-Cérebro",
  "Metabolismo",
  "Imune",
  "Performance",
  "Longevidade",
  "Pele",
  "Sono",
  "Humor",
];

export const MICROBIOTA_OBJETIVOS = [
  "todos",
  "emagrecimento",
  "imunidade",
  "digestão",
  "humor",
  "sono",
  "performance",
  "pele",
  "inflamação",
  "longevidade",
  "massa muscular",
];

export const MICROBIOTA_HOOKS = [
  "Seu intestino produz o mesmo hormônio do Ozempic — de graça.",
  "95% da sua serotonina não vem do cérebro.",
  "Você não está triste. Sua microbiota está.",
  "O alimento mais barato que melhora sua microbiota — e você joga fora.",
  "Atletas de elite têm uma bactéria que transforma lactato em energia.",
  "Whey protein sem fibra está destruindo seu intestino.",
  "Arroz de ontem é melhor que arroz de hoje — e a ciência explica.",
  "Kefir vs Yakult: um tem 50 bilhões de bactérias, o outro tem marketing.",
  "3 sinais de que sua microbiota está pedindo socorro.",
  "A dieta perfeita existe — mas é diferente pra cada microbiota.",
];

export const MICROBIOTA_ANGULOS = [
  { id: "educativo", label: "Educativo", hint: "o que é, como funciona" },
  { id: "mito_metodo", label: "Mito ou Método", hint: "desmistificar" },
  { id: "comparativo", label: "Comparativo", hint: "um contra o outro" },
  { id: "novidade", label: "Novidade", hint: "estudo recente" },
  { id: "leigos", label: "Para leigos", hint: "explicar simples" },
  { id: "receita", label: "Receita/Prático", hint: "o que comer" },
  { id: "mce_microbiota", label: "MCE + Microbiota", hint: "como o método integra" },
  { id: "cross_vault", label: "Cross-Vault (Peptídeos × Microbiota)", hint: "comparação de ouro" },
];

export const MICROBIOTA_FORMATOS = [
  { id: "carrossel", label: "Carrossel Educativo", hint: "7 slides" },
  { id: "reels", label: "Roteiro Reels", hint: "30-60s" },
  { id: "stories", label: "Stories Sequência", hint: "3-4 frames" },
];

const STATUS_ORDER: Record<MicrobiotaStatus, number> = {
  VANGUARDA: 0,
  VALIDADO: 1,
  EMERGENTE: 2,
  PESQUISA: 3,
};

export const STATUS_COLOR: Record<MicrobiotaStatus, string> = {
  VALIDADO: "#4ade80",
  EMERGENTE: "#38bdf8",
  VANGUARDA: "#EF9F27",
  PESQUISA: "#a78bfa",
};

export const microbiotaItems: MicrobiotaItem[] = [
  // ─────────────── PROBIÓTICOS · Lactobacillus ───────────────
  {
    id: "lgg",
    nome: "Lactobacillus rhamnosus GG (LGG)",
    classe: "Probiótico — Lactobacillus",
    categoria: "Probióticos",
    cepa: "LGG (ATCC 53103)",
    status: "VALIDADO",
    objetivos: ["imunidade", "digestão", "inflamação"],
    mecanismo_acao:
      "Adere à mucosa intestinal, fortalece a barreira epitelial, modula resposta imune via células dendríticas e produção de IgA secretória.",
    beneficios: [
      "Reduz duração de diarreia infecciosa em cerca de 1 dia",
      "Previne diarreia associada a antibióticos",
      "Fortalece a barreira intestinal",
      "Modula imunidade inata e adaptativa",
    ],
    evidencia_cientifica: "FORTE",
    dose_estudada: "10-20 bilhões UFC/dia",
    alimentos_fonte: ["kefir", "iogurte fermentado"],
    notas: "Uma das cepas mais estudadas do mundo, com mais de 300 publicações clínicas.",
    conexao_mce: "Pilar E — suplementação baseada em evidência, não em rótulo.",
    dica_pratica: "Confira a cepa no rótulo: 'Lactobacillus rhamnosus' sozinho não é LGG.",
  },
  {
    id: "l-reuteri-17938",
    nome: "Lactobacillus reuteri DSM 17938",
    classe: "Probiótico — Lactobacillus",
    categoria: "Probióticos",
    cepa: "DSM 17938",
    status: "VALIDADO",
    objetivos: ["digestão", "inflamação", "longevidade"],
    mecanismo_acao:
      "Produz reuterina (antimicrobiano natural), modula a motilidade intestinal e reduz citocinas inflamatórias.",
    beneficios: ["Reduz cólica infantil", "Melhora motilidade gástrica", "Evidência em saúde óssea"],
    evidencia_cientifica: "FORTE",
    dose_estudada: "100 milhões a 10 bilhões UFC/dia",
    dica_pratica: "Uma das poucas cepas com evidência de efeito fora do intestino (densidade óssea).",
  },
  {
    id: "l-gasseri-sbt2055",
    nome: "Lactobacillus gasseri SBT2055",
    classe: "Probiótico — Lactobacillus",
    categoria: "Metabolismo",
    cepa: "SBT2055",
    status: "EMERGENTE",
    objetivos: ["emagrecimento", "inflamação"],
    mecanismo_acao:
      "Reduz a absorção de gordura no intestino, modula adipocinas e diminui o tamanho dos adipócitos.",
    beneficios: [
      "Redução de gordura visceral de cerca de 8,5% em 12 semanas",
      "Redução de circunferência abdominal",
      "Redução de peso corporal",
    ],
    evidencia_cientifica: "MODERADA",
    dose_estudada: "10 bilhões UFC/dia",
    notas:
      "Estudos principalmente em população japonesa. Resultados promissores, mas precisam de replicação em populações diversas.",
    conexao_mce: "Pilar C — o probiótico ajuda na margem; o comportamento alimentar decide o resultado.",
  },
  {
    id: "l-plantarum-299v",
    nome: "Lactobacillus plantarum 299v",
    classe: "Probiótico — Lactobacillus",
    categoria: "Probióticos",
    cepa: "299v",
    status: "VALIDADO",
    objetivos: ["digestão", "inflamação"],
    mecanismo_acao:
      "Adere à mucosa, compete com patógenos e melhora a absorção de ferro não-heme.",
    beneficios: [
      "Reduz sintomas de síndrome do intestino irritável",
      "Melhora absorção de ferro",
      "Reduz inchaço abdominal",
    ],
    evidencia_cientifica: "FORTE",
    dica_pratica: "Boa opção para quem treina e vive com ferritina baixa: tomar junto da refeição com ferro.",
  },
  {
    id: "l-helveticus-r0052",
    nome: "Lactobacillus helveticus R0052",
    classe: "Probiótico — Lactobacillus",
    categoria: "Humor",
    cepa: "R0052",
    status: "EMERGENTE",
    objetivos: ["humor", "sono", "inflamação"],
    mecanismo_acao:
      "Produz peptídeos bioativos durante a fermentação, modula o eixo HPA (cortisol) e influencia a produção de GABA via nervo vago.",
    beneficios: ["Reduz cortisol e ansiedade", "Melhora qualidade do sono", "Reduz reatividade ao estresse"],
    evidencia_cientifica: "MODERADA",
    notas: "Funciona melhor em combo com B. longum R0175.",
    conexao_mce: "Pilar M — humor e motivação também se constroem no intestino.",
  },
  {
    id: "l-brevis-gaba",
    nome: "Lactobacillus brevis (produtor de GABA)",
    classe: "Probiótico — Lactobacillus",
    categoria: "Sono",
    status: "PESQUISA",
    objetivos: ["sono", "humor"],
    mecanismo_acao:
      "Converte glutamato em GABA no intestino; o sinal chega ao cérebro via nervo vago.",
    evidencia_cientifica: "PRELIMINAR",
    alimentos_fonte: ["kimchi", "picles fermentado natural"],
  },
  {
    id: "l-casei-shirota",
    nome: "Lactobacillus casei Shirota",
    classe: "Probiótico — Lactobacillus",
    categoria: "Imune",
    cepa: "Shirota (YIT 9029)",
    status: "VALIDADO",
    objetivos: ["imunidade", "digestão", "humor"],
    mecanismo_acao: "Aumenta atividade de células NK e modula resposta imune de mucosa.",
    evidencia_cientifica: "MODERADA",
    notas:
      "Cepa do Yakult. O produto tradicional tem açúcar e contagem menor que suplementos concentrados — compare rótulo, não marketing.",
  },
  {
    id: "l-acidophilus-ncfm",
    nome: "Lactobacillus acidophilus NCFM",
    classe: "Probiótico — Lactobacillus",
    categoria: "Probióticos",
    cepa: "NCFM",
    status: "VALIDADO",
    objetivos: ["digestão", "imunidade"],
    mecanismo_acao: "Produz lactase, melhora tolerância à lactose e compete com patógenos na mucosa.",
    evidencia_cientifica: "MODERADA",
  },

  // ─────────────── PROBIÓTICOS · Bifidobacterium ───────────────
  {
    id: "b-longum-r0175",
    nome: "Bifidobacterium longum R0175",
    classe: "Probiótico — Bifidobacterium",
    categoria: "Humor",
    cepa: "R0175",
    status: "EMERGENTE",
    objetivos: ["humor", "sono", "inflamação"],
    mecanismo_acao:
      "Modula o eixo intestino-cérebro via produção de ácidos graxos de cadeia curta e sinalização do nervo vago.",
    beneficios: ["Reduz ansiedade e cortisol urinário", "Melhora humor em pessoas saudáveis"],
    evidencia_cientifica: "MODERADA",
    conexao_mce: "Pilar M — o que você sente é, em parte, o que sua microbiota produz.",
  },
  {
    id: "b-lactis-hn019",
    nome: "Bifidobacterium lactis HN019",
    classe: "Probiótico — Bifidobacterium",
    categoria: "Imune",
    cepa: "HN019",
    status: "VALIDADO",
    objetivos: ["imunidade", "digestão", "performance"],
    mecanismo_acao: "Aumenta atividade de células NK, melhora fagocitose e acelera o trânsito intestinal.",
    beneficios: ["Aumenta imunidade inata", "Reduz tempo de trânsito intestinal", "Diminui inchaço e constipação"],
    evidencia_cientifica: "FORTE",
  },
  {
    id: "b-lactis-bb12",
    nome: "Bifidobacterium lactis BB-12",
    classe: "Probiótico — Bifidobacterium",
    categoria: "Imune",
    cepa: "BB-12",
    status: "VALIDADO",
    objetivos: ["imunidade", "digestão", "inflamação"],
    mecanismo_acao: "Aumenta IgA secretória, reforça a barreira intestinal e modula a resposta inflamatória.",
    evidencia_cientifica: "FORTE",
    notas: "Cepa mais documentada do gênero Bifidobacterium.",
  },
  {
    id: "b-breve-b3",
    nome: "Bifidobacterium breve B-3",
    classe: "Probiótico — Bifidobacterium",
    categoria: "Metabolismo",
    cepa: "B-3",
    status: "EMERGENTE",
    objetivos: ["emagrecimento", "inflamação"],
    mecanismo_acao:
      "Modula o metabolismo lipídico e reduz adiposidade via ácidos graxos de cadeia curta.",
    evidencia_cientifica: "MODERADA",
  },
  {
    id: "b-longum-1714",
    nome: "Bifidobacterium longum 1714",
    classe: "Probiótico — Bifidobacterium",
    categoria: "Humor",
    cepa: "1714",
    status: "EMERGENTE",
    objetivos: ["humor", "sono", "longevidade"],
    mecanismo_acao: "Modula a resposta ao estresse agudo e melhora consolidação de memória.",
    evidencia_cientifica: "MODERADA",
    notas: "Cepa estudada no University College Cork (Irlanda).",
  },
  {
    id: "b-infantis-evc001",
    nome: "Bifidobacterium infantis EVC001",
    classe: "Probiótico — Bifidobacterium",
    categoria: "Imune",
    cepa: "EVC001",
    status: "EMERGENTE",
    objetivos: ["imunidade", "digestão"],
    mecanismo_acao:
      "Consome oligossacarídeos do leite humano e produz ácido lático e acetato, acidificando o cólon e reduzindo patógenos.",
    evidencia_cientifica: "MODERADA",
  },

  // ─────────────── PROBIÓTICOS · outras cepas ───────────────
  {
    id: "akkermansia",
    nome: "Akkermansia muciniphila",
    classe: "Probiótico de nova geração",
    categoria: "Metabolismo",
    status: "VANGUARDA",
    objetivos: ["emagrecimento", "inflamação", "longevidade"],
    mecanismo_acao:
      "Degrada mucina e estimula sua regeneração, fortalece as tight junctions, melhora sensibilidade à insulina e reduz endotoxemia metabólica.",
    beneficios: [
      "Melhora marcadores metabólicos em sobrepeso e obesidade",
      "Fortalece a barreira intestinal",
      "Reduz inflamação sistêmica de baixo grau",
      "A versão pasteurizada (inativada) mantém efeitos",
    ],
    evidencia_cientifica: "FORTE",
    notas:
      "Considerada o probiótico mais importante da próxima geração. Forma pasteurizada aprovada como novel food na União Europeia.",
    dica_pratica: "Polifenóis (cacau puro, chá verde, frutas vermelhas) aumentam Akkermansia sem suplemento.",
  },
  {
    id: "s-boulardii",
    nome: "Saccharomyces boulardii CNCM I-745",
    classe: "Probiótico — Levedura",
    categoria: "Probióticos",
    cepa: "CNCM I-745",
    status: "VALIDADO",
    objetivos: ["digestão", "imunidade"],
    mecanismo_acao:
      "Levedura resistente a antibióticos. Secreta proteases que degradam toxinas de C. difficile e estimula IgA.",
    evidencia_cientifica: "FORTE",
    notas: "Único probiótico levedura amplamente validado. Pode ser tomado junto com antibióticos.",
  },
  {
    id: "f-prausnitzii",
    nome: "Faecalibacterium prausnitzii",
    classe: "Probiótico de nova geração",
    categoria: "Longevidade",
    status: "PESQUISA",
    objetivos: ["inflamação", "longevidade", "digestão"],
    mecanismo_acao:
      "Maior produtor de butirato no cólon. Anti-inflamatório potente via inibição de NF-κB.",
    evidencia_cientifica: "MODERADA",
    notas: "Ainda não disponível comercialmente. Baixa abundância é marcador de disbiose.",
  },
  {
    id: "bacillus-coagulans",
    nome: "Bacillus coagulans GBI-30 6086",
    classe: "Probiótico esporulado",
    categoria: "Performance",
    cepa: "GBI-30 6086",
    status: "EMERGENTE",
    objetivos: ["digestão", "massa muscular", "performance"],
    mecanismo_acao:
      "Forma esporos resistentes ao ácido gástrico, melhora digestão e absorção de proteínas e produz ácido lático.",
    beneficios: [
      "Melhora o aproveitamento de proteína",
      "Reduz inchaço e gases",
      "Não precisa de refrigeração",
    ],
    evidencia_cientifica: "MODERADA",
    notas: "Muito relevante para o público fitness — melhora aproveitamento de whey protein.",
    conexao_mce: "Pilar E — não adianta aumentar a proteína se você não absorve.",
  },
  {
    id: "bacillus-subtilis-de111",
    nome: "Bacillus subtilis DE111",
    classe: "Probiótico esporulado",
    categoria: "Performance",
    cepa: "DE111",
    status: "EMERGENTE",
    objetivos: ["digestão", "performance", "imunidade"],
    mecanismo_acao: "Esporulado estável, produz enzimas digestivas e compete com bactérias oportunistas.",
    evidencia_cientifica: "PRELIMINAR",
  },
  {
    id: "kefir",
    nome: "Kefir (consórcio de cepas)",
    classe: "Alimento fermentado — consórcio",
    categoria: "Probióticos",
    status: "VALIDADO",
    objetivos: ["digestão", "imunidade", "inflamação"],
    mecanismo_acao:
      "Combina dezenas de bactérias e leveduras vivas com peptídeos bioativos produzidos na fermentação.",
    evidencia_cientifica: "MODERADA",
    alimentos_fonte: ["kefir de leite", "kefir de água"],
    dica_pratica: "1 copo por dia no café da manhã entrega mais diversidade do que a maioria das cápsulas.",
    conexao_mce: "Pilar C — o hábito barato repetido vence o suplemento caro esquecido na gaveta.",
  },

  // ─────────────── PREBIÓTICOS ───────────────
  {
    id: "inulina",
    nome: "Inulina",
    classe: "Prebiótico — Frutano",
    categoria: "Prebióticos",
    status: "VALIDADO",
    objetivos: ["digestão", "emagrecimento", "longevidade"],
    mecanismo_acao:
      "Fermenta no cólon produzindo ácidos graxos de cadeia curta (o combustível das células do intestino), principalmente propionato e butirato. Alimenta seletivamente Bifidobacterium.",
    evidencia_cientifica: "FORTE",
    dose_estudada: "5-15 g/dia",
    alimentos_fonte: ["chicória", "alho", "cebola", "banana verde"],
    notas: "Acima de 10 g pode causar gases em pessoas sensíveis. Começar com 3-5 g e subir aos poucos.",
  },
  {
    id: "fos",
    nome: "FOS (Frutooligossacarídeos)",
    classe: "Prebiótico — Frutano",
    categoria: "Prebióticos",
    status: "VALIDADO",
    objetivos: ["digestão", "imunidade"],
    mecanismo_acao: "Fermentação seletiva por bifidobactérias, com aumento da absorção de cálcio e magnésio.",
    evidencia_cientifica: "MODERADA",
    dose_estudada: "5-10 g/dia",
    alimentos_fonte: ["banana", "cebola", "alho", "aspargo"],
  },
  {
    id: "gos",
    nome: "GOS (Galactooligossacarídeos)",
    classe: "Prebiótico — Galactano",
    categoria: "Prebióticos",
    status: "VALIDADO",
    objetivos: ["digestão", "imunidade", "humor"],
    mecanismo_acao: "Fermentação bifidogênica com efeito documentado sobre a resposta ao estresse.",
    evidencia_cientifica: "MODERADA",
    dose_estudada: "5,5 g/dia",
    notas: "Estudo da Universidade de Oxford mostrou redução do cortisol ao acordar com 5,5 g/dia de GOS.",
  },
  {
    id: "amido-resistente",
    nome: "Amido Resistente",
    classe: "Prebiótico — Amido",
    categoria: "Prebióticos",
    status: "VALIDADO",
    objetivos: ["emagrecimento", "digestão", "longevidade"],
    mecanismo_acao:
      "Escapa da digestão no intestino delgado e é fermentado no cólon, gerando butirato e melhorando a resposta à insulina.",
    evidencia_cientifica: "FORTE",
    alimentos_fonte: ["banana verde", "batata cozida e resfriada", "arroz resfriado", "feijão"],
    notas:
      "O arroz do meal prep de ontem tem mais amido resistente que o arroz feito na hora. Meal prep é prebiótico natural.",
    conexao_mce: "Pilar C — o mesmo prato, organizado de outro jeito, vira outro alimento.",
    dica_pratica: "Cozinhe o arroz e a batata na véspera e guarde na geladeira.",
  },
  {
    id: "polidextrose",
    nome: "Polidextrose",
    classe: "Prebiótico — Sintético",
    categoria: "Prebióticos",
    status: "EMERGENTE",
    objetivos: ["emagrecimento", "digestão"],
    mecanismo_acao: "Fibra fermentável de baixa caloria que aumenta saciedade e regulariza o trânsito.",
    evidencia_cientifica: "MODERADA",
  },
  {
    id: "beta-glucana",
    nome: "Beta-glucana",
    classe: "Prebiótico — Fibra solúvel",
    categoria: "Imune",
    status: "VALIDADO",
    objetivos: ["imunidade", "inflamação", "emagrecimento"],
    mecanismo_acao:
      "Forma gel viscoso que reduz absorção de colesterol e ativa receptores imunes (dectina-1) em macrófagos.",
    evidencia_cientifica: "FORTE",
    alimentos_fonte: ["aveia", "cogumelos", "levedura"],
  },
  {
    id: "psyllium",
    nome: "Psyllium (Plantago ovata)",
    classe: "Prebiótico — Fibra solúvel",
    categoria: "Prebióticos",
    status: "VALIDADO",
    objetivos: ["digestão", "emagrecimento"],
    mecanismo_acao: "Fibra formadora de gel: regulariza trânsito nos dois sentidos e reduz colesterol LDL.",
    evidencia_cientifica: "FORTE",
    dose_estudada: "5-10 g/dia",
  },
  {
    id: "pectina",
    nome: "Pectina",
    classe: "Prebiótico — Polissacarídeo",
    categoria: "Prebióticos",
    status: "VALIDADO",
    objetivos: ["digestão", "emagrecimento"],
    mecanismo_acao: "Fermentação lenta que gera acetato e propionato, com efeito sobre saciedade e colesterol.",
    evidencia_cientifica: "MODERADA",
    alimentos_fonte: ["maçã", "frutas cítricas"],
  },
  {
    id: "polifenois",
    nome: "Polifenóis (como prebióticos)",
    classe: "Prebiótico — Compostos bioativos",
    categoria: "Longevidade",
    status: "EMERGENTE",
    objetivos: ["inflamação", "longevidade", "pele"],
    mecanismo_acao:
      "Não digeridos, chegam ao cólon e são metabolizados pela microbiota, estimulando o crescimento de Akkermansia e Bifidobacterium.",
    evidencia_cientifica: "MODERADA",
    alimentos_fonte: ["cacau puro", "chá verde", "frutas vermelhas", "azeite extra-virgem"],
    dica_pratica: "30 g de cacau 70%+ por dia já muda o perfil de fermentação em algumas semanas.",
  },

  // ─────────────── POSBIÓTICOS ───────────────
  {
    id: "butirato",
    nome: "Butirato (ácido butírico)",
    classe: "Posbiótico — AGCC",
    categoria: "Posbióticos",
    status: "VALIDADO",
    objetivos: ["inflamação", "digestão", "longevidade"],
    mecanismo_acao:
      "Principal fonte de energia dos colonócitos. Inibe NF-κB, reforça as tight junctions e regula a diferenciação celular do epitélio.",
    evidencia_cientifica: "FORTE",
    notas:
      "Produzido pela fermentação de fibras por F. prausnitzii e Roseburia. Suplementação direta (tributirina) disponível.",
    dica_pratica: "Mais fibra fermentável no prato = mais butirato produzido de graça.",
  },
  {
    id: "propionato",
    nome: "Propionato",
    classe: "Posbiótico — AGCC",
    categoria: "Posbióticos",
    status: "VALIDADO",
    objetivos: ["emagrecimento", "metabolismo" as never, "inflamação"].filter(Boolean) as string[],
    mecanismo_acao:
      "Ativa receptores de ácidos graxos livres (FFAR2/3) no intestino e estimula a liberação de GLP-1 e PYY, os hormônios da saciedade.",
    evidencia_cientifica: "FORTE",
  },
  {
    id: "acetato",
    nome: "Acetato",
    classe: "Posbiótico — AGCC",
    categoria: "Posbióticos",
    status: "VALIDADO",
    objetivos: ["emagrecimento", "performance"],
    mecanismo_acao:
      "AGCC mais abundante. Absorvido e usado como substrato energético; chega ao cérebro e modula apetite via hipotálamo.",
    evidencia_cientifica: "MODERADA",
  },
  {
    id: "urolitina-a",
    nome: "Urolitina A",
    classe: "Posbiótico — Metabólito de polifenol",
    categoria: "Longevidade",
    status: "VANGUARDA",
    objetivos: ["longevidade", "performance", "massa muscular"],
    mecanismo_acao:
      "Induz mitofagia (reciclagem de mitocôndrias danificadas) e melhora a função mitocondrial muscular.",
    evidencia_cientifica: "MODERADA",
    alimentos_fonte: ["romã", "nozes"],
    notas:
      "Produzida pela microbiota a partir de elagitaninos. Nem todo mundo produz — depende do perfil da microbiota.",
    conexao_mce: "Pilar E — dois corpos, mesma comida, resultados diferentes: medir é o que diferencia.",
  },
  {
    id: "vitaminas-bacterianas",
    nome: "Vitaminas do complexo B (produção bacteriana)",
    classe: "Posbiótico — Vitaminas",
    categoria: "Posbióticos",
    status: "VALIDADO",
    objetivos: ["performance", "longevidade"],
    mecanismo_acao: "A microbiota produz B1, B2, B3, B5, B6, B9, B12 e K2 no cólon.",
    evidencia_cientifica: "MODERADA",
    notas: "Disbiose pode significar deficiência mesmo com dieta adequada.",
  },
  {
    id: "gaba-bacteriano",
    nome: "GABA (produção por Lactobacillus)",
    classe: "Posbiótico — Neurotransmissor",
    categoria: "Sono",
    status: "PESQUISA",
    objetivos: ["sono", "humor"],
    mecanismo_acao:
      "Lactobacillus brevis e L. plantarum produzem GABA no intestino; via nervo vago, o sinal modula o sistema nervoso central.",
    evidencia_cientifica: "PRELIMINAR",
  },
  {
    id: "serotonina-intestinal",
    nome: "Serotonina intestinal (5-HT)",
    classe: "Posbiótico — Neurotransmissor",
    categoria: "Humor",
    status: "VALIDADO",
    objetivos: ["humor", "sono", "digestão"],
    mecanismo_acao:
      "Cepas indígenas de Clostridium estimulam células enterocromafins a produzir serotonina, que regula motilidade e sinaliza ao cérebro.",
    evidencia_cientifica: "FORTE",
    notas: "95% da serotonina do corpo é produzida no intestino.",
    conexao_mce: "Pilar M — humor não é só cabeça: é fisiologia alimentada três vezes por dia.",
  },

  // ─────────────── EIXO INTESTINO-CÉREBRO ───────────────
  {
    id: "nervo-vago",
    nome: "Nervo Vago (via de comunicação)",
    classe: "Eixo — Neuroanatomia",
    categoria: "Eixo Intestino-Cérebro",
    status: "VALIDADO",
    objetivos: ["humor", "sono", "digestão"],
    mecanismo_acao:
      "Principal via bidirecional entre intestino e cérebro. Metabólitos bacterianos ativam receptores vagais aferentes que sinalizam ao sistema nervoso central.",
    evidencia_cientifica: "FORTE",
    conexao_mce:
      "Pilar M — o que você sente (ansiedade, motivação, humor) é modulado pelo que acontece no seu intestino.",
  },
  {
    id: "eixo-hpa",
    nome: "Eixo HPA (Hipotálamo-Hipófise-Adrenal)",
    classe: "Eixo — Neuroendócrino",
    categoria: "Eixo Intestino-Cérebro",
    status: "VALIDADO",
    objetivos: ["humor", "sono", "inflamação"],
    mecanismo_acao:
      "A microbiota modula a resposta ao estresse via cortisol. Disbiose se associa a hiperativação do eixo e cortisol cronicamente elevado.",
    evidencia_cientifica: "MODERADA",
  },
  {
    id: "permeabilidade",
    nome: "Permeabilidade Intestinal (leaky gut)",
    classe: "Eixo — Barreira",
    categoria: "Eixo Intestino-Cérebro",
    status: "EMERGENTE",
    objetivos: ["inflamação", "imunidade", "performance"],
    mecanismo_acao:
      "Tight junctions comprometidas permitem passagem de LPS (endotoxina) → inflamação sistêmica → neuroinflamação → fadiga, névoa mental e humor deprimido.",
    evidencia_cientifica: "MODERADA",
    notas: "Termo popularizado além da evidência: o fenômeno existe, o diagnóstico caseiro por sintomas não.",
  },
  {
    id: "triptofano",
    nome: "Triptofano → Serotonina → Melatonina",
    classe: "Eixo — Via metabólica",
    categoria: "Sono",
    status: "VALIDADO",
    objetivos: ["humor", "sono", "performance"],
    mecanismo_acao:
      "A microbiota influencia o metabolismo do triptofano. O desvio para a via da quinurenina (inflamatória) reduz a serotonina disponível.",
    evidencia_cientifica: "MODERADA",
    conexao_mce:
      "Pilar C — seu comportamento alimentar afeta diretamente a produção de serotonina e melatonina.",
  },

  // ─────────────── PERFORMANCE ───────────────
  {
    id: "veillonella",
    nome: "Veillonella atypica",
    classe: "Bactéria — Performance",
    categoria: "Performance",
    status: "PESQUISA",
    objetivos: ["performance"],
    mecanismo_acao:
      "Converte lactato em propionato no intestino. Maratonistas de elite apresentam maior abundância no pós-corrida.",
    evidencia_cientifica: "PRELIMINAR",
    notas: "Scheiman et al. (2019, Nature Medicine). O microbioma como órgão de performance.",
    conexao_mce: "Pilar E — o que você mede no treino tem eco em um lugar que ninguém olha.",
  },
  {
    id: "diversidade-vo2",
    nome: "Diversidade microbiana e VO2máx",
    classe: "Conceito — Performance",
    categoria: "Performance",
    status: "EMERGENTE",
    objetivos: ["performance", "longevidade"],
    mecanismo_acao:
      "Atletas têm microbioma mais diverso. Exercício moderado a intenso aumenta a diversidade; sedentarismo reduz.",
    evidencia_cientifica: "MODERADA",
    conexao_mce: "Pilar E — seu treino melhora sua microbiota, que melhora seu treino. Ciclo virtuoso.",
  },
  {
    id: "proteina-microbiota",
    nome: "Proteína e microbiota",
    classe: "Conceito — Nutrição esportiva",
    categoria: "Performance",
    status: "EMERGENTE",
    objetivos: ["massa muscular", "digestão", "inflamação"],
    mecanismo_acao:
      "Excesso de proteína animal sem fibra suficiente favorece bactérias proteolíticas que produzem compostos indesejáveis (amônia, sulfetos, p-cresol).",
    evidencia_cientifica: "MODERADA",
    conexao_mce: "Pilar C — não é só comer proteína, é como você equilibra o prato.",
    dica_pratica: "Regra simples: cada 30 g de proteína pede pelo menos 7-10 g de fibra no dia.",
  },
  {
    id: "endurance-permeabilidade",
    nome: "Intestino do endurance (isquemia de esforço)",
    classe: "Conceito — Performance",
    categoria: "Performance",
    status: "EMERGENTE",
    objetivos: ["performance", "digestão"],
    mecanismo_acao:
      "Esforço prolongado desvia sangue do intestino, aumentando permeabilidade e sintomas gastrointestinais em provas longas.",
    evidencia_cientifica: "MODERADA",
    dica_pratica: "Treinar o intestino com carboidrato durante o treino reduz sintomas na prova.",
  },

  // ─────────────── METABOLISMO ───────────────
  {
    id: "firmicutes-bacteroidetes",
    nome: "Razão Firmicutes/Bacteroidetes e obesidade",
    classe: "Conceito — Metabolismo",
    categoria: "Metabolismo",
    status: "EMERGENTE",
    objetivos: ["emagrecimento", "inflamação"],
    mecanismo_acao:
      "Estudos iniciais mostraram razão alterada em obesos. A visão atual é mais complexa: diversidade importa mais que a razão simples.",
    evidencia_cientifica: "PRELIMINAR",
    notas: "Conceito simplificado demais pela mídia. Usar com cautela em conteúdo.",
  },
  {
    id: "tmao",
    nome: "TMAO (Trimetilamina N-óxido)",
    classe: "Metabólito — Risco cardiovascular",
    categoria: "Metabolismo",
    status: "EMERGENTE",
    objetivos: ["longevidade", "inflamação"],
    mecanismo_acao:
      "Produzido pela microbiota a partir de carnitina e colina (carne vermelha, ovos). Níveis elevados se associam a risco cardiovascular.",
    evidencia_cientifica: "MODERADA",
    notas: "Não significa que carne ou ovo fazem mal — depende da composição da microbiota.",
  },
  {
    id: "glp1-endogeno",
    nome: "GLP-1 endógeno e microbiota",
    classe: "Conceito — Metabólico",
    categoria: "Metabolismo",
    status: "VANGUARDA",
    objetivos: ["emagrecimento", "digestão", "longevidade"],
    mecanismo_acao:
      "Ácidos graxos de cadeia curta (principalmente propionato e butirato) estimulam as células L a produzir GLP-1 naturalmente. Microbiota saudável funciona como fábrica de GLP-1 endógeno.",
    evidencia_cientifica: "FORTE",
    conexao_mce:
      "Conexão PeptideVault: a semaglutida imita o que uma microbiota saudável faz naturalmente. A diferença é que o peptídeo é externo e temporário — a microbiota é interna e sustentável.",
    notas: "Um dos melhores temas de conteúdo: 'seu intestino produz o mesmo hormônio do Ozempic — de graça'.",
    dica_pratica: "Fibra fermentável em todas as refeições é o gatilho mais barato de saciedade que existe.",
  },
  {
    id: "adocantes-microbiota",
    nome: "Adoçantes e microbiota",
    classe: "Conceito — Metabolismo",
    categoria: "Metabolismo",
    status: "EMERGENTE",
    objetivos: ["emagrecimento", "digestão"],
    mecanismo_acao:
      "Alguns adoçantes não calóricos alteram a composição bacteriana e a resposta glicêmica de forma individual.",
    evidencia_cientifica: "PRELIMINAR",
    notas: "Efeito varia muito entre pessoas. Não é motivo para pânico, é motivo para observar a resposta individual.",
  },

  // ─────────────── IMUNE ───────────────
  {
    id: "gut-imune",
    nome: "GALT — o intestino como órgão imune",
    classe: "Conceito — Imunidade",
    categoria: "Imune",
    status: "VALIDADO",
    objetivos: ["imunidade", "inflamação"],
    mecanismo_acao:
      "Cerca de 70% das células imunes do corpo estão associadas ao tecido linfoide intestinal, educado diariamente pela microbiota.",
    evidencia_cientifica: "FORTE",
  },
  {
    id: "iga-secretoria",
    nome: "IgA secretória",
    classe: "Marcador — Imunidade de mucosa",
    categoria: "Imune",
    status: "VALIDADO",
    objetivos: ["imunidade", "performance"],
    mecanismo_acao:
      "Anticorpo de mucosa que controla a aderência de patógenos. Cai em períodos de treino intenso e sono ruim.",
    evidencia_cientifica: "FORTE",
    dica_pratica: "Queda de IgA explica a gripe que sempre aparece depois de blocos muito pesados.",
  },
  {
    id: "treg-agcc",
    nome: "Células T reguladoras induzidas por AGCC",
    classe: "Mecanismo — Imunidade",
    categoria: "Imune",
    status: "VALIDADO",
    objetivos: ["imunidade", "inflamação", "longevidade"],
    mecanismo_acao:
      "Butirato induz diferenciação de linfócitos T reguladores, que controlam a inflamação e a autoimunidade.",
    evidencia_cientifica: "FORTE",
  },

  // ─────────────── PELE ───────────────
  {
    id: "eixo-intestino-pele",
    nome: "Eixo intestino-pele",
    classe: "Conceito — Dermatologia",
    categoria: "Pele",
    status: "EMERGENTE",
    objetivos: ["pele", "inflamação"],
    mecanismo_acao:
      "Inflamação sistêmica de origem intestinal e metabólitos bacterianos modulam a barreira cutânea e a produção de sebo.",
    evidencia_cientifica: "MODERADA",
  },
  {
    id: "probiotico-acne",
    nome: "Probióticos e acne",
    classe: "Aplicação — Pele",
    categoria: "Pele",
    status: "EMERGENTE",
    objetivos: ["pele", "inflamação"],
    mecanismo_acao:
      "Cepas de Lactobacillus e Bifidobacterium reduzem IGF-1 e inflamação, com melhora de lesões inflamatórias em estudos pequenos.",
    evidencia_cientifica: "PRELIMINAR",
  },
  {
    id: "colageno-microbiota",
    nome: "Colágeno, peptídeos e microbiota",
    classe: "Conceito — Pele",
    categoria: "Pele",
    status: "EMERGENTE",
    objetivos: ["pele", "longevidade"],
    mecanismo_acao:
      "Peptídeos de colágeno são absorvidos e também fermentados; a resposta na pele varia com a composição bacteriana.",
    evidencia_cientifica: "PRELIMINAR",
  },

  // ─────────────── SONO ───────────────
  {
    id: "ritmo-circadiano-microbiota",
    nome: "Ritmo circadiano da microbiota",
    classe: "Conceito — Cronobiologia",
    categoria: "Sono",
    status: "EMERGENTE",
    objetivos: ["sono", "emagrecimento", "performance"],
    mecanismo_acao:
      "A composição bacteriana oscila ao longo do dia e é sincronizada pelo horário das refeições. Comer tarde desalinha o ciclo.",
    evidencia_cientifica: "MODERADA",
    conexao_mce: "Pilar C — não é só o que você come, é a que horas você come.",
    dica_pratica: "Janela alimentar estável de 10-12 h ajuda a sincronizar microbiota e sono.",
  },
  {
    id: "privacao-sono-disbiose",
    nome: "Privação de sono e disbiose",
    classe: "Conceito — Sono",
    categoria: "Sono",
    status: "EMERGENTE",
    objetivos: ["sono", "emagrecimento", "humor"],
    mecanismo_acao:
      "Dormir mal reduz diversidade bacteriana e piora a sensibilidade à insulina em poucos dias.",
    evidencia_cientifica: "MODERADA",
  },

  // ─────────────── HUMOR ───────────────
  {
    id: "psicobioticos",
    nome: "Psicobióticos",
    classe: "Conceito — Neurogastroenterologia",
    categoria: "Humor",
    status: "EMERGENTE",
    objetivos: ["humor", "sono"],
    mecanismo_acao:
      "Probióticos e prebióticos com efeito documentado sobre humor, ansiedade e resposta ao estresse.",
    evidencia_cientifica: "MODERADA",
    conexao_mce: "Pilar M — mentalidade tem substrato biológico.",
  },
  {
    id: "dieta-inflamatoria-humor",
    nome: "Dieta ultraprocessada e humor",
    classe: "Conceito — Humor",
    categoria: "Humor",
    status: "VALIDADO",
    objetivos: ["humor", "inflamação"],
    mecanismo_acao:
      "Padrão pobre em fibras e rico em emulsificantes reduz produtores de butirato e aumenta inflamação de baixo grau associada a sintomas depressivos.",
    evidencia_cientifica: "MODERADA",
  },

  // ─────────────── LONGEVIDADE ───────────────
  {
    id: "diversidade-longevidade",
    nome: "Diversidade microbiana e longevidade",
    classe: "Conceito — Longevidade",
    categoria: "Longevidade",
    status: "VALIDADO",
    objetivos: ["longevidade", "inflamação"],
    mecanismo_acao:
      "Centenários mantêm perfis únicos e diversos; a perda de diversidade acompanha fragilidade e inflammaging.",
    evidencia_cientifica: "MODERADA",
    dica_pratica: "Meta prática: 30 espécies vegetais diferentes por semana.",
  },
  {
    id: "inflammaging",
    nome: "Inflammaging intestinal",
    classe: "Conceito — Longevidade",
    categoria: "Longevidade",
    status: "EMERGENTE",
    objetivos: ["longevidade", "inflamação", "massa muscular"],
    mecanismo_acao:
      "Barreira intestinal envelhecida deixa passar mais endotoxina, sustentando inflamação crônica que acelera sarcopenia.",
    evidencia_cientifica: "MODERADA",
  },
  {
    id: "transplante-fecal",
    nome: "Transplante de microbiota fecal (FMT)",
    classe: "Intervenção — Clínica",
    categoria: "Longevidade",
    status: "PESQUISA",
    objetivos: ["digestão", "inflamação"],
    mecanismo_acao:
      "Transferência de microbiota de doador saudável. Validado para infecção recorrente por C. difficile; experimental para outras indicações.",
    evidencia_cientifica: "MODERADA",
    notas: "Procedimento médico. Nunca improvisado.",
  },
];

export function ordenarMicrobiota(
  itens: MicrobiotaItem[],
  sortBy: "status" | "nome" | "categoria",
): MicrobiotaItem[] {
  const list = [...itens];
  if (sortBy === "nome") return list.sort((a, b) => a.nome.localeCompare(b.nome));
  if (sortBy === "categoria") return list.sort((a, b) => a.categoria.localeCompare(b.categoria));
  return list.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

export const microbiotaStats = () => ({
  total: microbiotaItems.length,
  validados: microbiotaItems.filter((i) => i.status === "VALIDADO").length,
  cepas: microbiotaItems.filter((i) => !!i.cepa).length,
  vanguarda: microbiotaItems.filter((i) => i.status === "VANGUARDA").length,
});
