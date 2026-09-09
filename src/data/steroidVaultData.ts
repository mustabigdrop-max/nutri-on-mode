// ============================================================
// NEXUS-BIO SteroidVault — Enciclopédia de esteroides, SARMs e PEDs
// Abordagem EDUCACIONAL e de REDUÇÃO DE DANOS.
// Não promove uso. Não demoniza. Informa com ciência.
// ============================================================

export type SteroidStatus = "CONTROLADO" | "PESQUISA" | "BANIDO_ESPORTE";
export type SteroidEvidencia = "FORTE" | "MODERADA" | "PRELIMINAR" | "ANECDÓTICA";
export type Severidade = "LEVE" | "MODERADO" | "GRAVE" | "POTENCIALMENTE_FATAL";

export type SteroidCategoria =
  | "Testosterona e Ésteres"
  | "Derivados 19-nor"
  | "Derivados da DHT"
  | "Orais"
  | "SARMs"
  | "Auxiliares / PCT"
  | "GH e Insulina";

export interface SteroidColateral {
  efeito: string;
  severidade: Severidade;
  dose_dependente: boolean;
  reversivel: boolean;
  frequencia: "comum" | "incomum" | "raro";
}

export interface SteroidEstudo {
  autor: string;
  ano: number;
  journal: string;
  achado_principal: string;
  n?: number;
}

export interface SteroidEmpilhamento {
  nome: string;
  compostos: string[];
  objetivo: string;
  risco: string;
}

export interface SteroidItem {
  id: string;
  nome: string;
  classe: string;
  categoria: SteroidCategoria;
  status: SteroidStatus;

  // Farmacologia
  meia_vida: string;
  via: string;
  deteccao: string;

  // Anabolismo vs androgenismo
  ratio_anabolico_androgenico: string;
  comparativo_testosterona: string;

  // Dose-resposta (foco principal)
  dose_trt?: string;
  dose_performance?: string;
  dose_abuso?: string;
  ganho_esperado?: {
    dose_baixa?: string;
    dose_media?: string;
    dose_alta?: string;
    eficiencia?: string;
  };

  beneficios: string[];
  efeitos_colaterais: SteroidColateral[];

  estudos_chave: SteroidEstudo[];
  evidencia: SteroidEvidencia;

  ponto_retorno_decrescente?: string;
  colateral_por_mg_extra?: string;

  empilhamentos_comuns?: SteroidEmpilhamento[];
  pct_recomendado?: string;
  exames_obrigatorios: string[];
  interacoes_perigosas: string[];

  legalidade_brasil: string;
  classificacao_anvisa: string;
  sinais_alerta: string[];
}

export const STEROID_DISCLAIMER =
  "⚕️ Conteúdo estritamente educacional baseado em literatura científica. Esteroides anabolizantes são substâncias controladas no Brasil (Portaria 344/98 ANVISA). O uso sem prescrição médica é ilegal. Este conteúdo NÃO constitui recomendação de uso, dosagem ou protocolo. Consulte um endocrinologista.";

export const STEROID_CATEGORIAS: (SteroidCategoria | "Todos")[] = [
  "Todos",
  "Testosterona e Ésteres",
  "Derivados 19-nor",
  "Derivados da DHT",
  "Orais",
  "SARMs",
  "Auxiliares / PCT",
  "GH e Insulina",
];

export const STATUS_COLOR_STEROID: Record<SteroidStatus, string> = {
  CONTROLADO: "#EF9F27",
  PESQUISA: "#AFA9EC",
  BANIDO_ESPORTE: "#EF4444",
};

/** Curva dose-resposta do estudo clássico de Bhasin et al., 2001. */
export const BHASIN_2001 = {
  referencia: "Bhasin S. et al., 2001 — Am J Physiol Endocrinol Metab (testosterona enantato, 20 semanas, homens jovens)",
  pontos: [
    { dose: "125 mg/semana", ganho_kg: 3.4, eficiencia_relativa: "100% (referência)" },
    { dose: "300 mg/semana", ganho_kg: 5.2, eficiencia_relativa: "63%" },
    { dose: "600 mg/semana", ganho_kg: 7.9, eficiencia_relativa: "48%" },
  ],
  leitura: "2,4x a dose entregou 1,5x o resultado. 4,8x a dose entregou 2,3x o resultado.",
  tese: "O ganho de massa magra cresce de forma logarítmica. Os efeitos colaterais crescem de forma linear com a dose.",
};

/** Efeitos que escalam com a dose — base da tese "menos é mais". */
export const COLATERAIS_DOSE_DEPENDENTES = [
  "Hipertrofia cardíaca patológica",
  "Alteração lipídica (HDL despenca)",
  "Hematócrito elevado (risco trombótico e de AVC)",
  "Supressão do eixo hormonal endógeno",
  "Lesão tendinosa (músculo cresce, tendão não acompanha)",
  "Dano hepático (principalmente orais 17-alfa-alquilados)",
  "Dano renal",
  "Atrofia testicular",
  "Ginecomastia",
  "Acne severa",
  "Alterações comportamentais",
];

export const EXAMES_OBRIGATORIOS = [
  "Hemograma completo (atenção ao hematócrito)",
  "Perfil lipídico (HDL, LDL, triglicerídeos)",
  "Função hepática (TGO, TGP, GGT)",
  "Função renal (creatinina, ureia)",
  "Hormonal (LH, FSH, testosterona total e livre, estradiol, prolactina)",
  "PSA (próstata)",
  "ECG + ecocardiograma",
  "Composição corporal (DEXA)",
];

export const SINAIS_ALERTA_GERAIS = [
  "Dor no peito, falta de ar ou palpitações",
  "Pressão arterial persistentemente elevada",
  "Hematócrito acima da faixa de referência",
  "Icterícia, urina escura ou dor abdominal alta",
  "Edema súbito, ganho rápido de peso em água",
  "Alterações de humor intensas, agressividade ou insônia grave",
];

export const STEROID_HOOKS = [
  "Mais dose não significa mais músculo. A ciência já mostrou onde a curva quebra.",
  "2,4x a dose entregou 1,5x o resultado. O resto foi só efeito colateral.",
  "O ganho é logarítmico. O risco é linear. Esse é o problema.",
  "Quem usa e não faz exame não está fazendo protocolo. Está apostando.",
  "Hematócrito alto não avisa antes de virar problema.",
  "O músculo cresce em semanas. O tendão leva meses. Aí vem a lesão.",
  "Dose mínima efetiva é conceito de ciência. Dose máxima tolerada é conceito de fórum.",
];

/** Carrosséis educativos prontos — tese "menos é mais". */
export const STEROID_CARROSSEIS_PRONTOS: {
  id: string;
  titulo: string;
  slides: { titulo: string; linhas: string[] }[];
}[] = [
  {
    id: "curva",
    titulo: "A curva que ninguém te mostra",
    slides: [
      { titulo: "Mais dose NÃO significa mais músculo", linhas: ["A ciência já provou onde a curva quebra."] },
      {
        titulo: "Dose x ganho (Bhasin, 2001)",
        linhas: [
          "125 mg/sem → +3,4 kg de massa magra",
          "300 mg/sem → +5,2 kg",
          "600 mg/sem → +7,9 kg",
          "2,4x a dose = apenas 1,5x o resultado",
        ],
      },
      {
        titulo: "Dose x colaterais",
        linhas: [
          "Ganho de massa: curva logarítmica",
          "Efeitos colaterais: curva linear",
          "A partir de certo ponto, cada mg extra compra mais risco que músculo",
        ],
      },
      {
        titulo: "O que acontece com o excesso",
        linhas: [
          "Mais aromatização, mais estrogênio",
          "HDL despenca — risco cardiovascular",
          "Hematócrito sobe — risco trombótico",
          "Tendão não acompanha o músculo — lesão",
        ],
      },
      {
        titulo: "Atletas de elite usam mais por causa do peso?",
        linhas: [
          "Doses maiores aparecem em atletas maiores",
          "Mas a eficiência por mg cai conforme a dose sobe",
          "Mais massa corporal não devolve a eficiência perdida",
        ],
      },
      {
        titulo: "O que a ciência sugere",
        linhas: [
          "Dose mínima efetiva > dose máxima tolerada",
          "Monitoramento constante com exames",
          "Não é sobre quanto se usa. É sobre quanto o corpo responde.",
        ],
      },
      { titulo: "Informação antes de decisão", linhas: [STEROID_DISCLAIMER] },
    ],
  },
  {
    id: "comparativo",
    titulo: "Comparativo real de doses",
    slides: [
      { titulo: "Dois cenários, uma conta diferente", linhas: ["O que a literatura descreve em faixas distintas de uso."] },
      {
        titulo: "Cenário A — dose moderada",
        linhas: [
          "Faixa próxima de 300 mg/semana de testosterona",
          "Ganho descrito: ~5 kg de massa magra em 20 semanas",
          "Colaterais tipicamente leves e monitoráveis",
          "Recuperação hormonal mais viável",
        ],
      },
      {
        titulo: "Cenário B — stack de dose alta",
        linhas: [
          "Somatórios acima de 1 g/semana com múltiplos compostos",
          "Ganho maior, porém com eficiência por mg muito menor",
          "Colaterais cardiovasculares, hepáticos e hormonais mais severos",
          "Recuperação hormonal incerta",
        ],
      },
      {
        titulo: "A conta que importa",
        linhas: ["O cenário B ganha mais massa.", "E paga desproporcionalmente mais em saúde por cada quilo extra."],
      },
      { titulo: "Informação antes de decisão", linhas: [STEROID_DISCLAIMER] },
    ],
  },
  {
    id: "exames",
    titulo: "Exames obrigatórios — se usa, monitore",
    slides: [
      { titulo: "Sem exame não existe controle", linhas: ["Monitorar é a única parte do processo que reduz risco de verdade."] },
      { titulo: "O painel mínimo", linhas: EXAMES_OBRIGATORIOS },
      { titulo: "Sinais para parar imediatamente", linhas: SINAIS_ALERTA_GERAIS },
      { titulo: "Informação antes de decisão", linhas: [STEROID_DISCLAIMER] },
    ],
  },
];

const EXAMES_PADRAO = EXAMES_OBRIGATORIOS;
const LEGAL_BR =
  "Substância sujeita a controle especial. Venda e uso somente com prescrição e retenção de receita. Uso sem prescrição é ilegal.";
const ANVISA_C5 = "Portaria 344/98 — Lista C5 (anabolizantes)";

const CV: SteroidColateral = { efeito: "Alteração do perfil lipídico com queda de HDL", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" };
const SUP: SteroidColateral = { efeito: "Supressão do eixo hipotálamo-hipófise-gonadal", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" };
const HEMA: SteroidColateral = { efeito: "Aumento de hematócrito e hemoglobina", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" };
const CARDIO: SteroidColateral = { efeito: "Hipertrofia ventricular esquerda e disfunção diastólica", severidade: "POTENCIALMENTE_FATAL", dose_dependente: true, reversivel: false, frequencia: "incomum" };
const HEPATO: SteroidColateral = { efeito: "Hepatotoxicidade (elevação de transaminases, colestase)", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" };
const ACNE: SteroidColateral = { efeito: "Acne e pele oleosa", severidade: "LEVE", dose_dependente: true, reversivel: true, frequencia: "comum" };
const GINE: SteroidColateral = { efeito: "Ginecomastia por aromatização", severidade: "MODERADO", dose_dependente: true, reversivel: false, frequencia: "comum" };
const HUMOR: SteroidColateral = { efeito: "Irritabilidade, agressividade e alterações de sono", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" };
const ATROFIA: SteroidColateral = { efeito: "Atrofia testicular e queda de espermatogênese", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" };
const ALOPECIA: SteroidColateral = { efeito: "Aceleração de alopecia androgenética em predispostos", severidade: "LEVE", dose_dependente: true, reversivel: false, frequencia: "comum" };
const TENDAO: SteroidColateral = { efeito: "Lesão tendínea por descompasso entre força e tecido conjuntivo", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "incomum" };

const ESTUDO_BHASIN: SteroidEstudo = {
  autor: "Bhasin S. et al.",
  ano: 2001,
  journal: "American Journal of Physiology — Endocrinology and Metabolism",
  achado_principal:
    "Relação dose-resposta da testosterona: 125 mg/sem → +3,4 kg; 300 mg/sem → +5,2 kg; 600 mg/sem → +7,9 kg de massa magra em 20 semanas, com eficiência por mg decrescente.",
  n: 61,
};
const ESTUDO_BHASIN_1996: SteroidEstudo = {
  autor: "Bhasin S. et al.",
  ano: 1996,
  journal: "New England Journal of Medicine",
  achado_principal: "600 mg/sem de testosterona enantato aumentou massa magra e força mesmo sem treino, e mais ainda com treino.",
  n: 43,
};
const ESTUDO_BAGGISH: SteroidEstudo = {
  autor: "Baggish A.L. et al.",
  ano: 2017,
  journal: "Circulation",
  achado_principal: "Usuários de longo prazo apresentaram disfunção sistólica e diastólica do ventrículo esquerdo e maior placa coronariana que não usuários.",
  n: 140,
};
const ESTUDO_POPE: SteroidEstudo = {
  autor: "Pope H.G. et al.",
  ano: 2014,
  journal: "Endocrine Reviews",
  achado_principal: "Revisão dos efeitos adversos do uso de esteroides androgênicos anabolizantes: cardiovasculares, hepáticos, neuroendócrinos e psiquiátricos.",
};
const ESTUDO_RASMUSSEN: SteroidEstudo = {
  autor: "Rasmussen J.J. et al.",
  ano: 2016,
  journal: "PLOS ONE",
  achado_principal: "Supressão do eixo gonadal persistiu por meses a anos após a interrupção em ex-usuários.",
  n: 132,
};
const ESTUDO_DALTON: SteroidEstudo = {
  autor: "Dalton J.T. et al.",
  ano: 2011,
  journal: "Journal of Cachexia, Sarcopenia and Muscle",
  achado_principal: "Ostarine (enobosarm) aumentou massa magra e função física em ensaio de fase II, com supressão parcial de testosterona.",
  n: 120,
};
const ESTUDO_BASARIA: SteroidEstudo = {
  autor: "Basaria S. et al.",
  ano: 2013,
  journal: "The Journal of Clinical Endocrinology & Metabolism",
  achado_principal: "LGD-4033 aumentou massa magra de forma dose-dependente em 21 dias, com supressão de testosterona total e HDL.",
  n: 76,
};

const menosEMais = (ponto: string) => ponto;

export const steroidItems: SteroidItem[] = [
  // ===================== Testosterona e Ésteres =====================
  {
    id: "testo-enantato",
    nome: "Testosterona Enantato",
    classe: "Andrógeno / éster de testosterona",
    categoria: "Testosterona e Ésteres",
    status: "CONTROLADO",
    meia_vida: "~4,5 dias",
    via: "Intramuscular",
    deteccao: "Relatada em até ~3 meses em testes antidoping",
    ratio_anabolico_androgenico: "100:100",
    comparativo_testosterona: "É a própria referência da escala",
    dose_trt: "Reposição médica individualizada, definida por endocrinologista",
    dose_performance: "Faixas descritas na literatura de pesquisa: 125 a 600 mg/semana",
    dose_abuso: "Relatos de uso acima de 1 g/semana em levantamentos com usuários",
    ganho_esperado: {
      dose_baixa: "125 mg/sem → ~3,4 kg de massa magra em 20 semanas (Bhasin, 2001)",
      dose_media: "300 mg/sem → ~5,2 kg",
      dose_alta: "600 mg/sem → ~7,9 kg",
      eficiencia: "Eficiência por mg cai para ~63% em 300 mg e ~48% em 600 mg, tomando 125 mg como referência",
    },
    beneficios: [
      "Aumento de massa magra e força documentado em ensaios controlados",
      "Melhora de densidade mineral óssea em hipogonadismo",
      "Correção de sintomas de deficiência androgênica quando há diagnóstico",
    ],
    efeitos_colaterais: [CV, SUP, HEMA, CARDIO, GINE, ACNE, ATROFIA, ALOPECIA, HUMOR, TENDAO],
    estudos_chave: [ESTUDO_BHASIN, ESTUDO_BHASIN_1996, ESTUDO_BAGGISH, ESTUDO_RASMUSSEN],
    evidencia: "FORTE",
    ponto_retorno_decrescente: menosEMais("A eficiência por mg começa a cair de forma marcada acima de ~300 mg/semana nos dados de Bhasin, 2001"),
    colateral_por_mg_extra: "Cada incremento de dose eleva de forma aproximadamente linear hematócrito, queda de HDL e supressão do eixo, sem elevar o ganho na mesma proporção",
    empilhamentos_comuns: [
      { nome: "Base androgênica isolada", compostos: ["Testosterona Enantato"], objetivo: "Cenário mais estudado em ensaios clínicos", risco: "Menor complexidade de monitoramento que stacks múltiplos" },
    ],
    pct_recomendado: "Retomada do eixo é assunto médico. Protocolos de recuperação exigem acompanhamento endocrinológico com dosagens seriadas.",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Anticoagulantes orais", "Insulina e antidiabéticos", "Outros agentes que elevam hematócrito"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "testo-cipionato",
    nome: "Testosterona Cipionato",
    classe: "Andrógeno / éster de testosterona",
    categoria: "Testosterona e Ésteres",
    status: "CONTROLADO",
    meia_vida: "~8 dias",
    via: "Intramuscular",
    deteccao: "Relatada em até ~3 meses",
    ratio_anabolico_androgenico: "100:100",
    comparativo_testosterona: "Mesma molécula ativa do enantato, com liberação um pouco mais lenta",
    dose_trt: "Reposição médica individualizada",
    dose_performance: "Faixas de pesquisa equivalentes às do enantato",
    dose_abuso: "Relatos acima de 1 g/semana em levantamentos",
    ganho_esperado: {
      dose_baixa: "Equivalente ao enantato em base molar (Bhasin, 2001)",
      eficiencia: "Mesma curva de retorno decrescente do enantato",
    },
    beneficios: ["Aumento de massa magra e força", "Estabilidade sérica com menos aplicações que ésteres curtos"],
    efeitos_colaterais: [CV, SUP, HEMA, CARDIO, GINE, ACNE, ATROFIA, HUMOR],
    estudos_chave: [ESTUDO_BHASIN, ESTUDO_BAGGISH],
    evidencia: "FORTE",
    ponto_retorno_decrescente: "Mesma inflexão descrita para testosterona acima de ~300 mg/semana",
    colateral_por_mg_extra: "Eleva hematócrito e reduz HDL proporcionalmente à dose",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Anticoagulantes orais", "Insulina"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "testo-propionato",
    nome: "Testosterona Propionato",
    classe: "Andrógeno / éster curto",
    categoria: "Testosterona e Ésteres",
    status: "CONTROLADO",
    meia_vida: "~19 a 24 horas",
    via: "Intramuscular",
    deteccao: "Relatada em torno de 2 a 3 semanas",
    ratio_anabolico_androgenico: "100:100",
    comparativo_testosterona: "Mesma molécula ativa, com pico e queda rápidos",
    dose_trt: "Reposição médica individualizada",
    dose_performance: "Aplicações mais frequentes devido à meia-vida curta",
    beneficios: ["Ajuste sérico rápido", "Retirada mais rápida em caso de efeito adverso"],
    efeitos_colaterais: [CV, SUP, HEMA, GINE, ACNE, { efeito: "Dor e irritação no local da aplicação", severidade: "LEVE", dose_dependente: false, reversivel: true, frequencia: "comum" }],
    estudos_chave: [ESTUDO_BHASIN, ESTUDO_POPE],
    evidencia: "MODERADA",
    ponto_retorno_decrescente: "Segue a curva geral da testosterona",
    colateral_por_mg_extra: "Oscilação sérica maior tende a acentuar variações de humor e retenção",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Anticoagulantes orais"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "testo-undecanoato",
    nome: "Testosterona Undecanoato (oral)",
    classe: "Andrógeno / éster de absorção linfática",
    categoria: "Testosterona e Ésteres",
    status: "CONTROLADO",
    meia_vida: "Curta na forma oral, exigindo doses diárias divididas",
    via: "Oral (também existe apresentação injetável de longa duração)",
    deteccao: "Variável conforme apresentação",
    ratio_anabolico_androgenico: "100:100",
    comparativo_testosterona: "Mesma molécula ativa após clivagem do éster",
    dose_trt: "Prescrição médica, tomada com refeição gordurosa para absorção",
    beneficios: ["Alternativa oral aprovada para reposição em hipogonadismo diagnosticado"],
    efeitos_colaterais: [CV, SUP, HEMA, { efeito: "Elevação de pressão arterial", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" }],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "MODERADA",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Anti-hipertensivos", "Anticoagulantes orais"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "sustanon",
    nome: "Sustanon 250",
    classe: "Blend de quatro ésteres de testosterona",
    categoria: "Testosterona e Ésteres",
    status: "CONTROLADO",
    meia_vida: "Mista — do propionato (~1 dia) ao decanoato (~7 a 9 dias)",
    via: "Intramuscular",
    deteccao: "Relatada em até ~3 meses",
    ratio_anabolico_androgenico: "100:100",
    comparativo_testosterona: "Mesma molécula ativa liberada em tempos diferentes",
    dose_trt: "Prescrição médica em hipogonadismo",
    beneficios: ["Liberação escalonada com menos aplicações"],
    efeitos_colaterais: [CV, SUP, HEMA, GINE, ACNE, ATROFIA],
    estudos_chave: [ESTUDO_BHASIN, ESTUDO_POPE],
    evidencia: "MODERADA",
    ponto_retorno_decrescente: "Segue a curva da testosterona total administrada",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Anticoagulantes orais"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },

  // ===================== 19-nor =====================
  {
    id: "nandrolona-decanoato",
    nome: "Nandrolona Decanoato",
    classe: "Esteroide 19-nortestosterona",
    categoria: "Derivados 19-nor",
    status: "CONTROLADO",
    meia_vida: "~6 a 12 dias",
    via: "Intramuscular",
    deteccao: "Metabólitos relatados por até ~18 meses",
    ratio_anabolico_androgenico: "125:37 (dados pré-clínicos)",
    comparativo_testosterona: "Mais anabólico e menos androgênico que a testosterona na escala clássica",
    dose_trt: "Uso médico em anemia da doença renal e caquexia, sob prescrição",
    dose_performance: "Faixas descritas em relatos de usuários, não em ensaios de performance",
    beneficios: ["Ganho de massa magra", "Uso clínico documentado em anemia e caquexia", "Relatos de conforto articular sem confirmação em ensaios controlados"],
    efeitos_colaterais: [
      SUP,
      CV,
      { efeito: "Disfunção erétil e queda de libido por elevação de prolactina e supressão androgênica", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Supressão prolongada do eixo após interrupção", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" },
      GINE,
      HUMOR,
    ],
    estudos_chave: [ESTUDO_RASMUSSEN, ESTUDO_POPE],
    evidencia: "MODERADA",
    ponto_retorno_decrescente: "Doses maiores aumentam supressão e alteração lipídica sem ganho proporcional",
    colateral_por_mg_extra: "Mais supressão do eixo e maior tempo de recuperação hormonal",
    pct_recomendado: "Recuperação do eixo requer acompanhamento médico prolongado por causa da meia-vida longa",
    exames_obrigatorios: [...EXAMES_PADRAO, "Prolactina seriada"],
    interacoes_perigosas: ["Anticoagulantes orais", "Outros supressores do eixo gonadal"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "npp",
    nome: "Nandrolona Fenilpropionato (NPP)",
    classe: "Esteroide 19-nortestosterona / éster curto",
    categoria: "Derivados 19-nor",
    status: "CONTROLADO",
    meia_vida: "~2 a 3 dias",
    via: "Intramuscular",
    deteccao: "Metabólitos relatados por vários meses",
    ratio_anabolico_androgenico: "125:37 (dados pré-clínicos)",
    comparativo_testosterona: "Mesma molécula ativa da nandrolona, com liberação mais rápida",
    beneficios: ["Ganho de massa magra", "Retirada mais rápida que o decanoato em caso de efeito adverso"],
    efeitos_colaterais: [SUP, CV, GINE, HUMOR],
    estudos_chave: [ESTUDO_RASMUSSEN, ESTUDO_POPE],
    evidencia: "PRELIMINAR",
    exames_obrigatorios: [...EXAMES_PADRAO, "Prolactina seriada"],
    interacoes_perigosas: ["Anticoagulantes orais"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "trembolona-acetato",
    nome: "Trembolona Acetato",
    classe: "Esteroide 19-nor de uso veterinário",
    categoria: "Derivados 19-nor",
    status: "BANIDO_ESPORTE",
    meia_vida: "~1 dia",
    via: "Intramuscular",
    deteccao: "Relatada em torno de 4 a 5 meses",
    ratio_anabolico_androgenico: "500:500 (dados pré-clínicos)",
    comparativo_testosterona: "Muito mais potente que a testosterona na escala clássica, com androgenicidade equivalente à sua potência anabólica",
    dose_performance: "Sem ensaios clínicos em humanos que sustentem qualquer faixa de uso",
    beneficios: ["Uso original é veterinário, para ganho de peso em bovinos", "Não existe indicação humana aprovada"],
    efeitos_colaterais: [
      { efeito: "Insônia grave e sudorese noturna", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Queda acentuada de HDL", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Alterações comportamentais intensas e ansiedade", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Intolerância cardiovascular e falta de ar em esforço leve", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Elevação de prolactina com disfunção sexual", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      SUP,
      CARDIO,
    ],
    estudos_chave: [ESTUDO_POPE, ESTUDO_BAGGISH],
    evidencia: "ANECDÓTICA",
    ponto_retorno_decrescente: "Sem dados humanos de dose-resposta; toda a informação de uso vem de relatos, não de ensaios",
    colateral_por_mg_extra: "Aumento consistente de efeitos cardiovasculares, neuropsiquiátricos e de sono já em doses baixas relatadas",
    exames_obrigatorios: [...EXAMES_PADRAO, "Prolactina", "Pressão arterial ambulatorial"],
    interacoes_perigosas: ["Estimulantes", "Outros compostos que elevam pressão e frequência cardíaca"],
    legalidade_brasil: "Não possui registro para uso humano no Brasil. Comercialização e uso humano são ilegais.",
    classificacao_anvisa: "Sem registro para uso humano; anabolizante sob controle especial",
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "trembolona-enantato",
    nome: "Trembolona Enantato",
    classe: "Esteroide 19-nor de uso veterinário / éster longo",
    categoria: "Derivados 19-nor",
    status: "BANIDO_ESPORTE",
    meia_vida: "~5 a 7 dias",
    via: "Intramuscular",
    deteccao: "Relatada em torno de 5 meses",
    ratio_anabolico_androgenico: "500:500 (dados pré-clínicos)",
    comparativo_testosterona: "Mesma molécula ativa da trembolona, com liberação mais lenta",
    beneficios: ["Sem indicação humana aprovada"],
    efeitos_colaterais: [SUP, CV, CARDIO, HUMOR],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "ANECDÓTICA",
    colateral_por_mg_extra: "Meia-vida mais longa prolonga o tempo de exposição aos efeitos adversos",
    exames_obrigatorios: [...EXAMES_PADRAO, "Prolactina"],
    interacoes_perigosas: ["Estimulantes"],
    legalidade_brasil: "Sem registro para uso humano no Brasil.",
    classificacao_anvisa: "Sem registro para uso humano",
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },

  // ===================== DHT =====================
  {
    id: "oxandrolona",
    nome: "Oxandrolona (Anavar)",
    classe: "Esteroide derivado da DHT, 17-alfa-alquilado",
    categoria: "Derivados da DHT",
    status: "CONTROLADO",
    meia_vida: "~9 horas",
    via: "Oral",
    deteccao: "Relatada em torno de 3 semanas",
    ratio_anabolico_androgenico: "322 a 630 : 24 (dados pré-clínicos)",
    comparativo_testosterona: "Alta razão anabólica sobre androgênica na escala clássica",
    dose_trt: "Uso clínico aprovado em recuperação de queimados e perda de peso pós-cirúrgica, sob prescrição",
    beneficios: ["Uso clínico documentado em grandes queimados", "Menor androgenicidade relativa"],
    efeitos_colaterais: [
      HEPATO,
      { efeito: "Queda expressiva de HDL, mesmo em doses clínicas", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" },
      SUP,
      { efeito: "Virilização em mulheres (voz, pelos, clitoromegalia)", severidade: "GRAVE", dose_dependente: true, reversivel: false, frequencia: "incomum" },
    ],
    estudos_chave: [
      { autor: "Wolf S.E. et al.", ano: 2006, journal: "Journal of Burn Care & Research", achado_principal: "Oxandrolona melhorou balanço proteico e recuperação em pacientes queimados.", n: 81 },
      ESTUDO_POPE,
    ],
    evidencia: "MODERADA",
    ponto_retorno_decrescente: "Doses acima das clínicas aumentam impacto hepático e lipídico sem ganho proporcional",
    colateral_por_mg_extra: "Mais estresse hepático e queda adicional de HDL",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Varfarina (potencializa anticoagulação)", "Outros hepatotóxicos"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "estanozolol",
    nome: "Estanozolol (Winstrol)",
    classe: "Esteroide derivado da DHT, 17-alfa-alquilado",
    categoria: "Derivados da DHT",
    status: "CONTROLADO",
    meia_vida: "~9 horas (oral) e ~24 horas (injetável)",
    via: "Oral e intramuscular",
    deteccao: "Relatada em torno de 2 meses",
    ratio_anabolico_androgenico: "320:30 (dados pré-clínicos)",
    comparativo_testosterona: "Alta razão anabólica sobre androgênica na escala clássica",
    dose_trt: "Uso clínico histórico em angioedema hereditário",
    beneficios: ["Indicação clínica documentada em angioedema hereditário", "Não aromatiza"],
    efeitos_colaterais: [
      HEPATO,
      { efeito: "Queda severa de HDL", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Dor articular e ressecamento de tecido conjuntivo relatados", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      TENDAO,
      SUP,
    ],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "MODERADA",
    colateral_por_mg_extra: "Impacto hepático e lipídico aumenta rapidamente com a dose",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Varfarina", "Outros hepatotóxicos"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "metenolona",
    nome: "Metenolona (Primobolan)",
    classe: "Esteroide derivado da DHT",
    categoria: "Derivados da DHT",
    status: "CONTROLADO",
    meia_vida: "~5 horas (acetato oral) e ~10 dias (enantato injetável)",
    via: "Oral e intramuscular",
    deteccao: "Relatada em torno de 4 a 5 meses para o enantato",
    ratio_anabolico_androgenico: "88:44 a 57 (dados pré-clínicos)",
    comparativo_testosterona: "Potência anabólica menor que a da testosterona na escala clássica",
    beneficios: ["Não aromatiza", "Perfil androgênico mais brando em relatos clínicos antigos"],
    efeitos_colaterais: [CV, SUP, ALOPECIA, ACNE],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "PRELIMINAR",
    colateral_por_mg_extra: "Doses altas apenas aproximam o perfil de risco dos demais andrógenos, sem vantagem proporcional",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Anticoagulantes orais"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "drostanolona",
    nome: "Drostanolona (Masteron)",
    classe: "Esteroide derivado da DHT",
    categoria: "Derivados da DHT",
    status: "CONTROLADO",
    meia_vida: "~2 dias (propionato) e ~10 dias (enantato)",
    via: "Intramuscular",
    deteccao: "Relatada em torno de 3 meses para o enantato",
    ratio_anabolico_androgenico: "62 a 130 : 25 a 40 (dados pré-clínicos)",
    comparativo_testosterona: "Menor potência anabólica, com ação antiestrogênica relatada",
    dose_trt: "Uso clínico histórico em câncer de mama avançado, hoje abandonado",
    beneficios: ["Não aromatiza", "Uso oncológico histórico documentado"],
    efeitos_colaterais: [CV, ALOPECIA, ACNE, SUP],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "PRELIMINAR",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Anticoagulantes orais"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "turinabol",
    nome: "Turinabol (clorodesidrometiltestosterona)",
    classe: "Esteroide oral 17-alfa-alquilado",
    categoria: "Derivados da DHT",
    status: "BANIDO_ESPORTE",
    meia_vida: "~16 horas",
    via: "Oral",
    deteccao: "Metabólitos de longa duração já detectados por muitos meses em reanálises antidoping",
    ratio_anabolico_androgenico: "54:6 (dados pré-clínicos)",
    comparativo_testosterona: "Menor potência anabólica absoluta, com baixa androgenicidade relativa",
    beneficios: ["Não aromatiza"],
    efeitos_colaterais: [HEPATO, CV, SUP],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "PRELIMINAR",
    colateral_por_mg_extra: "Aumento de estresse hepático em uso oral prolongado",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Hepatotóxicos", "Álcool"],
    legalidade_brasil: "Sem registro no Brasil.",
    classificacao_anvisa: "Anabolizante sob controle especial, sem registro nacional",
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },

  // ===================== Orais =====================
  {
    id: "oximetolona",
    nome: "Oximetolona (Hemogenin)",
    classe: "Esteroide oral 17-alfa-alquilado",
    categoria: "Orais",
    status: "CONTROLADO",
    meia_vida: "~8 a 9 horas",
    via: "Oral",
    deteccao: "Relatada em torno de 2 meses",
    ratio_anabolico_androgenico: "320:45 (dados pré-clínicos)",
    comparativo_testosterona: "Alta potência anabólica na escala clássica, com forte impacto hepático",
    dose_trt: "Uso clínico aprovado em anemias, sob prescrição",
    beneficios: ["Indicação clínica em anemias aplásicas e de Fanconi", "Ganho rápido de peso corporal, boa parte em água"],
    efeitos_colaterais: [
      { efeito: "Hepatotoxicidade importante, incluindo peliose hepática relatada", severidade: "POTENCIALMENTE_FATAL", dose_dependente: true, reversivel: false, frequencia: "incomum" },
      { efeito: "Retenção hídrica e elevação de pressão arterial", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      CV,
      SUP,
      GINE,
    ],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "MODERADA",
    ponto_retorno_decrescente: "Grande parte do ganho inicial é água; doses maiores aumentam risco hepático sem ganho de tecido proporcional",
    colateral_por_mg_extra: "Elevação adicional de transaminases e de pressão arterial",
    exames_obrigatorios: [...EXAMES_PADRAO, "Ultrassom hepático em uso prolongado"],
    interacoes_perigosas: ["Álcool", "Paracetamol em dose alta", "Varfarina"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "metandrostenolona",
    nome: "Metandrostenolona (Dianabol)",
    classe: "Esteroide oral 17-alfa-alquilado",
    categoria: "Orais",
    status: "CONTROLADO",
    meia_vida: "~4,5 a 6 horas",
    via: "Oral",
    deteccao: "Relatada em torno de 5 a 6 semanas",
    ratio_anabolico_androgenico: "90 a 210 : 40 a 60 (dados pré-clínicos)",
    comparativo_testosterona: "Aromatiza com facilidade, gerando estrogênio elevado",
    beneficios: ["Ganho rápido de peso e força relatado historicamente"],
    efeitos_colaterais: [HEPATO, GINE, { efeito: "Retenção hídrica e hipertensão", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" }, CV, SUP],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "PRELIMINAR",
    colateral_por_mg_extra: "Mais aromatização, mais retenção e mais estresse hepático",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Álcool", "Hepatotóxicos"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "oxandrolona-oral",
    nome: "Oxandrolona — apresentação oral",
    classe: "Esteroide oral 17-alfa-alquilado",
    categoria: "Orais",
    status: "CONTROLADO",
    meia_vida: "~9 horas",
    via: "Oral",
    deteccao: "Relatada em torno de 3 semanas",
    ratio_anabolico_androgenico: "322 a 630 : 24 (dados pré-clínicos)",
    comparativo_testosterona: "Mesma ficha da oxandrolona; listada aqui pelo perfil de oral alquilado",
    beneficios: ["Indicação clínica em recuperação de queimados"],
    efeitos_colaterais: [HEPATO, CV, SUP],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "MODERADA",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Varfarina", "Álcool"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "estanozolol-oral",
    nome: "Estanozolol — apresentação oral",
    classe: "Esteroide oral 17-alfa-alquilado",
    categoria: "Orais",
    status: "CONTROLADO",
    meia_vida: "~9 horas",
    via: "Oral",
    deteccao: "Relatada em torno de 2 meses",
    ratio_anabolico_androgenico: "320:30 (dados pré-clínicos)",
    comparativo_testosterona: "Mesma ficha do estanozolol; a via oral concentra o impacto hepático",
    beneficios: ["Indicação clínica histórica em angioedema hereditário"],
    efeitos_colaterais: [HEPATO, CV, TENDAO, SUP],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "MODERADA",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Varfarina", "Álcool"],
    legalidade_brasil: LEGAL_BR,
    classificacao_anvisa: ANVISA_C5,
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },

  // ===================== SARMs =====================
  {
    id: "ostarine",
    nome: "Ostarine (MK-2866 / enobosarm)",
    classe: "Modulador seletivo do receptor androgênico (SARM)",
    categoria: "SARMs",
    status: "PESQUISA",
    meia_vida: "~24 horas",
    via: "Oral",
    deteccao: "Detectável em antidoping por semanas; proibido pela WADA",
    ratio_anabolico_androgenico: "Seletividade tecidual relatada em pré-clínico; escala clássica não se aplica",
    comparativo_testosterona: "Menor potência anabólica que doses supra-fisiológicas de testosterona nos ensaios disponíveis",
    dose_performance: "Sem aprovação regulatória; doses de ensaio clínico foram testadas apenas em pesquisa",
    beneficios: ["Aumento de massa magra e função física em ensaio de fase II", "Investigado em caquexia associada a câncer"],
    efeitos_colaterais: [
      { efeito: "Supressão parcial de testosterona endógena", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Redução de HDL", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Elevação de transaminases e casos relatados de lesão hepática", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "incomum" },
    ],
    estudos_chave: [ESTUDO_DALTON],
    evidencia: "PRELIMINAR",
    ponto_retorno_decrescente: "Nos ensaios, aumentos de dose elevaram supressão e alterações laboratoriais mais do que o ganho de massa",
    colateral_por_mg_extra: "Mais supressão do eixo e maior queda de HDL",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Hepatotóxicos", "Outros supressores do eixo"],
    legalidade_brasil: "Sem registro na ANVISA. Venda como suplemento é proibida.",
    classificacao_anvisa: "Substância não aprovada para uso humano no Brasil",
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "ligandrol",
    nome: "Ligandrol (LGD-4033)",
    classe: "Modulador seletivo do receptor androgênico (SARM)",
    categoria: "SARMs",
    status: "PESQUISA",
    meia_vida: "~24 a 36 horas",
    via: "Oral",
    deteccao: "Detectável em antidoping; proibido pela WADA",
    ratio_anabolico_androgenico: "Seletividade tecidual relatada em pré-clínico",
    comparativo_testosterona: "Ganho de massa magra em 21 dias descrito em ensaio de fase I",
    beneficios: ["Aumento dose-dependente de massa magra em ensaio de fase I"],
    efeitos_colaterais: [
      { efeito: "Supressão de testosterona total e SHBG", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Queda de HDL", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Casos de hepatotoxicidade relatados na literatura", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "incomum" },
    ],
    estudos_chave: [ESTUDO_BASARIA],
    evidencia: "PRELIMINAR",
    ponto_retorno_decrescente: "No ensaio de fase I, a supressão hormonal escalou com a dose junto com o ganho",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Hepatotóxicos"],
    legalidade_brasil: "Sem registro na ANVISA.",
    classificacao_anvisa: "Substância não aprovada para uso humano no Brasil",
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "rad-140",
    nome: "RAD-140 (testolone)",
    classe: "Modulador seletivo do receptor androgênico (SARM)",
    categoria: "SARMs",
    status: "PESQUISA",
    meia_vida: "Relatada entre ~20 e 60 horas, com dados humanos limitados",
    via: "Oral",
    deteccao: "Detectável em antidoping; proibido pela WADA",
    ratio_anabolico_androgenico: "Seletividade tecidual relatada em pré-clínico",
    comparativo_testosterona: "Sem ensaios de performance em humanos que permitam comparação direta",
    beneficios: ["Investigado em oncologia; sem indicação aprovada"],
    efeitos_colaterais: [
      { efeito: "Lesão hepática grave descrita em relatos de caso", severidade: "POTENCIALMENTE_FATAL", dose_dependente: true, reversivel: false, frequencia: "raro" },
      SUP,
      CV,
    ],
    estudos_chave: [
      { autor: "Barbara M. et al.", ano: 2020, journal: "ACG Case Reports Journal", achado_principal: "Relato de lesão hepática induzida por RAD-140 usado como suplemento.", n: 1 },
    ],
    evidencia: "ANECDÓTICA",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Hepatotóxicos", "Álcool"],
    legalidade_brasil: "Sem registro na ANVISA.",
    classificacao_anvisa: "Substância não aprovada para uso humano no Brasil",
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "yk-11",
    nome: "YK-11",
    classe: "Esteroide sintético com ação em receptor androgênico, comercializado como SARM",
    categoria: "SARMs",
    status: "PESQUISA",
    meia_vida: "Desconhecida em humanos",
    via: "Oral",
    deteccao: "Proibido pela WADA",
    ratio_anabolico_androgenico: "Sem dados humanos",
    comparativo_testosterona: "Sem ensaios clínicos em humanos",
    beneficios: ["Sem benefício comprovado em humanos — dados restritos a cultura celular"],
    efeitos_colaterais: [
      { efeito: "Perfil de segurança desconhecido em humanos", severidade: "GRAVE", dose_dependente: true, reversivel: false, frequencia: "comum" },
      HEPATO,
      SUP,
    ],
    estudos_chave: [
      { autor: "Kanno Y. et al.", ano: 2013, journal: "Biological & Pharmaceutical Bulletin", achado_principal: "Descrição da atividade do YK-11 sobre o receptor androgênico em células musculares, sem dados humanos." },
    ],
    evidencia: "ANECDÓTICA",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Hepatotóxicos"],
    legalidade_brasil: "Sem registro na ANVISA.",
    classificacao_anvisa: "Substância não aprovada para uso humano no Brasil",
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "cardarine",
    nome: "Cardarine (GW-501516)",
    classe: "Agonista de PPAR-delta (não é SARM)",
    categoria: "SARMs",
    status: "PESQUISA",
    meia_vida: "~24 horas",
    via: "Oral",
    deteccao: "Proibido pela WADA",
    ratio_anabolico_androgenico: "Não se aplica — não age no receptor androgênico",
    comparativo_testosterona: "Mecanismo completamente diferente; não é anabolizante",
    beneficios: ["Aumento de capacidade oxidativa descrito em modelos animais"],
    efeitos_colaterais: [
      { efeito: "Desenvolvimento acelerado de tumores em múltiplos órgãos em roedores, motivo do abandono do desenvolvimento clínico", severidade: "POTENCIALMENTE_FATAL", dose_dependente: true, reversivel: false, frequencia: "comum" },
    ],
    estudos_chave: [
      { autor: "Geiger L.E. et al.", ano: 2009, journal: "The Toxicologist (SOT abstracts)", achado_principal: "Estudos de carcinogenicidade de dois anos mostraram tumores em múltiplos tecidos, levando à descontinuação do desenvolvimento." },
    ],
    evidencia: "PRELIMINAR",
    exames_obrigatorios: EXAMES_PADRAO,
    interacoes_perigosas: ["Sem dados humanos suficientes"],
    legalidade_brasil: "Sem registro na ANVISA.",
    classificacao_anvisa: "Substância não aprovada para uso humano no Brasil",
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },
  {
    id: "mk-677",
    nome: "MK-677 (ibutamoren)",
    classe: "Secretagogo de GH, agonista do receptor de grelina",
    categoria: "SARMs",
    status: "PESQUISA",
    meia_vida: "~4 a 6 horas",
    via: "Oral",
    deteccao: "Proibido pela WADA",
    ratio_anabolico_androgenico: "Não se aplica — não age no receptor androgênico",
    comparativo_testosterona: "Não é anabolizante androgênico; eleva GH e IGF-1",
    beneficios: ["Elevação sustentada de GH e IGF-1 em ensaios clínicos", "Aumento de massa livre de gordura em idosos"],
    efeitos_colaterais: [
      { efeito: "Aumento de apetite e retenção hídrica", severidade: "LEVE", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Elevação de glicemia de jejum e resistência à insulina", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Letargia e dor articular relatadas", severidade: "LEVE", dose_dependente: true, reversivel: true, frequencia: "incomum" },
    ],
    estudos_chave: [
      { autor: "Nass R. et al.", ano: 2008, journal: "Annals of Internal Medicine", achado_principal: "MK-677 aumentou GH e IGF-1 e a massa livre de gordura em idosos, sem melhora de força; glicemia de jejum aumentou.", n: 65 },
    ],
    evidencia: "MODERADA",
    ponto_retorno_decrescente: "Nos ensaios, doses maiores elevaram glicemia sem ganho funcional proporcional",
    exames_obrigatorios: [...EXAMES_PADRAO, "Glicemia de jejum e HbA1c", "IGF-1"],
    interacoes_perigosas: ["Insulina e antidiabéticos", "GH exógeno"],
    legalidade_brasil: "Sem registro na ANVISA.",
    classificacao_anvisa: "Substância não aprovada para uso humano no Brasil",
    sinais_alerta: SINAIS_ALERTA_GERAIS,
  },

  // ===================== Auxiliares / PCT =====================
  {
    id: "tamoxifeno",
    nome: "Tamoxifeno",
    classe: "Modulador seletivo do receptor de estrogênio (SERM)",
    categoria: "Auxiliares / PCT",
    status: "CONTROLADO",
    meia_vida: "~5 a 7 dias",
    via: "Oral",
    deteccao: "Proibido pela WADA para homens",
    ratio_anabolico_androgenico: "Não se aplica",
    comparativo_testosterona: "Não é anabolizante; atua no receptor de estrogênio",
    dose_trt: "Uso clínico aprovado em câncer de mama, sob prescrição",
    beneficios: ["Bloqueio do receptor de estrogênio na mama", "Estímulo de LH e FSH descrito em homens"],
    efeitos_colaterais: [
      { efeito: "Risco tromboembólico aumentado", severidade: "POTENCIALMENTE_FATAL", dose_dependente: false, reversivel: false, frequencia: "raro" },
      { efeito: "Alterações visuais e oculares", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "raro" },
      { efeito: "Fogachos e náusea", severidade: "LEVE", dose_dependente: true, reversivel: true, frequencia: "comum" },
    ],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "FORTE",
    exames_obrigatorios: [...EXAMES_PADRAO, "Avaliação oftalmológica em uso prolongado"],
    interacoes_perigosas: ["Anticoagulantes", "Inibidores potentes de CYP2D6"],
    legalidade_brasil: "Medicamento sob prescrição médica.",
    classificacao_anvisa: "Medicamento registrado, uso sob prescrição",
    sinais_alerta: ["Dor ou inchaço em panturrilha", "Falta de ar súbita", "Alteração de visão"],
  },
  {
    id: "clomifeno",
    nome: "Clomifeno",
    classe: "Modulador seletivo do receptor de estrogênio (SERM)",
    categoria: "Auxiliares / PCT",
    status: "CONTROLADO",
    meia_vida: "~5 a 7 dias (isômeros com meia-vida mais longa)",
    via: "Oral",
    deteccao: "Proibido pela WADA",
    ratio_anabolico_androgenico: "Não se aplica",
    comparativo_testosterona: "Não é anabolizante; estimula liberação de gonadotrofinas",
    dose_trt: "Uso clínico em infertilidade, sob prescrição",
    beneficios: ["Aumento de LH e FSH com elevação de testosterona endógena em homens com hipogonadismo secundário"],
    efeitos_colaterais: [
      { efeito: "Alterações visuais", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "incomum" },
      { efeito: "Alterações de humor", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
    ],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "MODERADA",
    exames_obrigatorios: [...EXAMES_PADRAO, "LH e FSH seriados"],
    interacoes_perigosas: ["Outros SERMs"],
    legalidade_brasil: "Medicamento sob prescrição médica.",
    classificacao_anvisa: "Medicamento registrado, uso sob prescrição",
    sinais_alerta: ["Alteração de visão", "Cefaleia intensa"],
  },
  {
    id: "anastrozol",
    nome: "Anastrozol",
    classe: "Inibidor de aromatase não esteroidal",
    categoria: "Auxiliares / PCT",
    status: "CONTROLADO",
    meia_vida: "~46 horas",
    via: "Oral",
    deteccao: "Proibido pela WADA",
    ratio_anabolico_androgenico: "Não se aplica",
    comparativo_testosterona: "Reduz a conversão de testosterona em estradiol",
    dose_trt: "Uso clínico aprovado em câncer de mama, sob prescrição",
    beneficios: ["Redução de estradiol quando há elevação documentada em exame"],
    efeitos_colaterais: [
      { efeito: "Queda excessiva de estradiol com perda de densidade óssea", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Dor articular e queda de libido", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Piora do perfil lipídico", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
    ],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "FORTE",
    colateral_por_mg_extra: "Estradiol baixo demais é tão problemático quanto estradiol alto",
    exames_obrigatorios: [...EXAMES_PADRAO, "Estradiol por método sensível", "Densitometria óssea em uso prolongado"],
    interacoes_perigosas: ["Outros inibidores de aromatase"],
    legalidade_brasil: "Medicamento sob prescrição médica.",
    classificacao_anvisa: "Medicamento registrado, uso sob prescrição",
    sinais_alerta: ["Dor articular difusa", "Perda de libido acentuada", "Fadiga persistente"],
  },
  {
    id: "letrozol",
    nome: "Letrozol",
    classe: "Inibidor de aromatase não esteroidal de alta potência",
    categoria: "Auxiliares / PCT",
    status: "CONTROLADO",
    meia_vida: "~2 dias",
    via: "Oral",
    deteccao: "Proibido pela WADA",
    ratio_anabolico_androgenico: "Não se aplica",
    comparativo_testosterona: "Supressão de estradiol mais intensa que a do anastrozol",
    dose_trt: "Uso clínico aprovado em câncer de mama, sob prescrição",
    beneficios: ["Supressão potente de estradiol em contexto oncológico"],
    efeitos_colaterais: [
      { efeito: "Supressão excessiva de estradiol com dor articular e impacto ósseo", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Piora de perfil lipídico", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
    ],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "FORTE",
    exames_obrigatorios: [...EXAMES_PADRAO, "Estradiol por método sensível"],
    interacoes_perigosas: ["Outros inibidores de aromatase"],
    legalidade_brasil: "Medicamento sob prescrição médica.",
    classificacao_anvisa: "Medicamento registrado, uso sob prescrição",
    sinais_alerta: ["Dor articular intensa", "Fadiga e queda de libido"],
  },
  {
    id: "hcg",
    nome: "HCG (gonadotrofina coriônica)",
    classe: "Análogo de LH",
    categoria: "Auxiliares / PCT",
    status: "CONTROLADO",
    meia_vida: "~24 a 36 horas",
    via: "Subcutânea ou intramuscular",
    deteccao: "Proibido pela WADA para homens",
    ratio_anabolico_androgenico: "Não se aplica",
    comparativo_testosterona: "Estimula a produção testicular em vez de repor testosterona exógena",
    dose_trt: "Uso clínico em infertilidade e hipogonadismo, sob prescrição",
    beneficios: ["Manutenção de função e volume testicular", "Estímulo da esteroidogênese testicular"],
    efeitos_colaterais: [
      { efeito: "Elevação de estradiol", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Dessensibilização das células de Leydig em uso contínuo de dose alta", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "incomum" },
    ],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "MODERADA",
    exames_obrigatorios: [...EXAMES_PADRAO, "Estradiol", "Testosterona total e livre"],
    interacoes_perigosas: ["Inibidores de aromatase sem controle laboratorial"],
    legalidade_brasil: "Medicamento sob prescrição médica.",
    classificacao_anvisa: "Medicamento registrado, uso sob prescrição",
    sinais_alerta: ["Ginecomastia dolorosa", "Retenção hídrica acentuada"],
  },
  {
    id: "cabergolina",
    nome: "Cabergolina",
    classe: "Agonista dopaminérgico D2",
    categoria: "Auxiliares / PCT",
    status: "CONTROLADO",
    meia_vida: "~63 a 69 horas",
    via: "Oral",
    deteccao: "Não é substância proibida pela WADA",
    ratio_anabolico_androgenico: "Não se aplica",
    comparativo_testosterona: "Não é anabolizante; reduz prolactina",
    dose_trt: "Uso clínico aprovado em hiperprolactinemia, sob prescrição",
    beneficios: ["Redução de prolactina quando há elevação documentada"],
    efeitos_colaterais: [
      { efeito: "Valvulopatia cardíaca em doses altas e uso prolongado", severidade: "POTENCIALMENTE_FATAL", dose_dependente: true, reversivel: false, frequencia: "raro" },
      { efeito: "Hipotensão, náusea e tontura", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Alterações de controle de impulsos", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "incomum" },
    ],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "FORTE",
    exames_obrigatorios: [...EXAMES_PADRAO, "Prolactina", "Ecocardiograma em uso prolongado"],
    interacoes_perigosas: ["Anti-hipertensivos", "Antipsicóticos"],
    legalidade_brasil: "Medicamento sob prescrição médica.",
    classificacao_anvisa: "Medicamento registrado, uso sob prescrição",
    sinais_alerta: ["Falta de ar", "Edema de membros", "Sopro cardíaco novo"],
  },

  // ===================== GH e Insulina =====================
  {
    id: "gh-sintetico",
    nome: "GH sintético (somatropina)",
    classe: "Hormônio de crescimento recombinante",
    categoria: "GH e Insulina",
    status: "CONTROLADO",
    meia_vida: "~2 a 4 horas após aplicação subcutânea",
    via: "Subcutânea",
    deteccao: "Detectável por testes de isoformas e marcadores; proibido pela WADA",
    ratio_anabolico_androgenico: "Não se aplica",
    comparativo_testosterona: "Mecanismo distinto: age via IGF-1, com efeito muito menor sobre força que andrógenos",
    dose_trt: "Uso clínico em deficiência de GH diagnosticada, sob prescrição",
    beneficios: ["Redução de massa gorda e aumento de massa magra em revisões", "Indicação aprovada em deficiência de GH"],
    efeitos_colaterais: [
      { efeito: "Retenção hídrica, síndrome do túnel do carpo e artralgia", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Resistência à insulina e hiperglicemia", severidade: "GRAVE", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Crescimento de tecidos e vísceras em uso prolongado de dose alta", severidade: "GRAVE", dose_dependente: true, reversivel: false, frequencia: "incomum" },
    ],
    estudos_chave: [
      { autor: "Liu H. et al.", ano: 2008, journal: "Annals of Internal Medicine", achado_principal: "Revisão sistemática: GH em adultos saudáveis aumentou massa magra sem melhora consistente de força, com mais efeitos adversos.", n: 303 },
    ],
    evidencia: "FORTE",
    ponto_retorno_decrescente: "Doses maiores elevam retenção hídrica e glicemia bem antes de entregar ganho funcional adicional",
    exames_obrigatorios: [...EXAMES_PADRAO, "IGF-1", "Glicemia de jejum e HbA1c"],
    interacoes_perigosas: ["Insulina", "Corticoides"],
    legalidade_brasil: "Medicamento sob prescrição médica e controle especial.",
    classificacao_anvisa: "Medicamento registrado, uso sob prescrição",
    sinais_alerta: ["Formigamento persistente nas mãos", "Edema acentuado", "Glicemia em elevação"],
  },
  {
    id: "insulina",
    nome: "Insulina",
    classe: "Hormônio peptídico",
    categoria: "GH e Insulina",
    status: "CONTROLADO",
    meia_vida: "Variável conforme o análogo, de minutos a mais de 24 horas",
    via: "Subcutânea",
    deteccao: "Proibida pela WADA fora de uso terapêutico autorizado",
    ratio_anabolico_androgenico: "Não se aplica",
    comparativo_testosterona: "Mecanismo distinto: transporte de nutrientes e sinalização anabólica",
    dose_trt: "Uso clínico em diabetes, sob prescrição e monitoramento glicêmico",
    beneficios: ["Indicação clínica essencial em diabetes"],
    efeitos_colaterais: [
      { efeito: "Hipoglicemia grave, com risco de coma e morte", severidade: "POTENCIALMENTE_FATAL", dose_dependente: true, reversivel: false, frequencia: "comum" },
      { efeito: "Ganho de gordura corporal", severidade: "MODERADO", dose_dependente: true, reversivel: true, frequencia: "comum" },
      { efeito: "Lipodistrofia no local de aplicação", severidade: "LEVE", dose_dependente: false, reversivel: true, frequencia: "comum" },
    ],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "FORTE",
    colateral_por_mg_extra: "Não existe margem de segurança em uso não terapêutico: erro de dose pode ser fatal em minutos",
    exames_obrigatorios: [...EXAMES_PADRAO, "Glicemia capilar frequente", "HbA1c"],
    interacoes_perigosas: ["GH", "Álcool", "Jejum prolongado", "Betabloqueadores (mascaram hipoglicemia)"],
    legalidade_brasil: "Medicamento sob prescrição médica.",
    classificacao_anvisa: "Medicamento registrado, uso sob prescrição",
    sinais_alerta: ["Tremor, sudorese fria, confusão mental", "Visão turva ou desmaio", "Fome súbita e intensa"],
  },
  {
    id: "igf-1",
    nome: "IGF-1 (mecasermina e análogos)",
    classe: "Fator de crescimento semelhante à insulina",
    categoria: "GH e Insulina",
    status: "CONTROLADO",
    meia_vida: "Curta na forma livre; prolongada quando ligada a proteínas carreadoras",
    via: "Subcutânea",
    deteccao: "Proibido pela WADA",
    ratio_anabolico_androgenico: "Não se aplica",
    comparativo_testosterona: "Mecanismo distinto: sinalização de crescimento tecidual",
    dose_trt: "Uso clínico restrito a deficiência grave de IGF-1 primária, sob prescrição",
    beneficios: ["Indicação clínica em deficiência grave de IGF-1"],
    efeitos_colaterais: [
      { efeito: "Hipoglicemia", severidade: "POTENCIALMENTE_FATAL", dose_dependente: true, reversivel: false, frequencia: "comum" },
      { efeito: "Hipertrofia de tecidos e amígdalas", severidade: "MODERADO", dose_dependente: true, reversivel: false, frequencia: "incomum" },
      { efeito: "Preocupação teórica com proliferação celular em uso prolongado", severidade: "GRAVE", dose_dependente: true, reversivel: false, frequencia: "raro" },
    ],
    estudos_chave: [ESTUDO_POPE],
    evidencia: "PRELIMINAR",
    exames_obrigatorios: [...EXAMES_PADRAO, "IGF-1", "Glicemia"],
    interacoes_perigosas: ["Insulina", "GH"],
    legalidade_brasil: "Medicamento sob prescrição médica.",
    classificacao_anvisa: "Medicamento registrado para indicação restrita",
    sinais_alerta: ["Sinais de hipoglicemia", "Edema", "Dor de cabeça persistente"],
  },
];

export const steroidStats = () => ({
  total: steroidItems.length,
  categorias: new Set(steroidItems.map((i) => i.categoria)).size,
  banidos: steroidItems.filter((i) => i.status === "BANIDO_ESPORTE").length,
  estudos: steroidItems.reduce((acc, i) => acc + i.estudos_chave.length, 0),
});

export const ordenarSteroids = (list: SteroidItem[], by: "status" | "nome" | "categoria") => {
  const ordemStatus: SteroidStatus[] = ["CONTROLADO", "PESQUISA", "BANIDO_ESPORTE"];
  return [...list].sort((a, b) => {
    if (by === "nome") return a.nome.localeCompare(b.nome);
    if (by === "categoria") return a.categoria.localeCompare(b.categoria) || a.nome.localeCompare(b.nome);
    return ordemStatus.indexOf(a.status) - ordemStatus.indexOf(b.status) || a.nome.localeCompare(b.nome);
  });
};
