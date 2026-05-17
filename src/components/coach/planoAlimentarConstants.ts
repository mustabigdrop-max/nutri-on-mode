// ───────────────────────────────────────────────────────────────────────────────
// Constantes aditivas para PlanoAlimentarIA — categorias de esporte, condições
// clínicas, estratégias de recuperação, intra-treino e configuração de PDF.
// ───────────────────────────────────────────────────────────────────────────────

export type ProtocoloEsporte = {
  texto: string;
  tags: string[];
};

export type EsporteOption = {
  v: string;
  l: string;
  protocolo?: ProtocoloEsporte;
};

export type EsporteGroup = {
  grupo: string;
  options: EsporteOption[];
};

const PROT = (texto: string, tags: string[]): ProtocoloEsporte => ({ texto, tags });

export const CATEGORIAS_ESPORTE: EsporteGroup[] = [
  {
    grupo: "FISICULTURISMO E ESTÉTICA",
    options: [
      { v: "bodybuilding", l: "Bodybuilding / Fisiculturismo", protocolo: PROT(
        "Periodização por bulk/cut/peak week. Proteína 2.2–2.8 g/kg. Carb cycling. Manipulação de água e sódio na semana da prova.",
        ["bulk/cut", "peak week", "proteína alta", "carb cycling"]) },
      { v: "classic_physique", l: "Classic Physique", protocolo: PROT(
        "Estética clássica — proporção V e cintura controlada. Cardio LISS + déficit moderado. Carb timing peri-treino.",
        ["estética clássica", "cintura", "LISS", "carb timing"]) },
      { v: "mens_physique", l: "Men's Physique", protocolo: PROT(
        "Foco em superior + abdômen. Carb cycling 5/2. Cardio diário moderado. Sódio controlado para peak.",
        ["abdômen", "carb cycling", "cardio diário"]) },
      { v: "bikini_wellness", l: "Bikini / Wellness", protocolo: PROT(
        "Foco em glúteo e posterior. Proteína 1.8–2.2 g/kg. Carbo periodizado. Hidratação e cortisol monitorados.",
        ["glúteo", "carbo periodizado", "cortisol"]) },
      { v: "figure", l: "Figure", protocolo: PROT(
        "Densidade muscular com baixo BF. Carb cycling. Proteína 2.0–2.4 g/kg. Refeições peri-treino estratégicas.",
        ["densidade muscular", "carb cycling"]) },
      { v: "fitness_funcional", l: "Fitness Funcional", protocolo: PROT(
        "Resistência muscular + cardio. Carbo 4–6 g/kg. Eletrólitos intra-treino. Recuperação acelerada.",
        ["resistência", "eletrólitos", "recuperação"]) },
    ],
  },
  {
    grupo: "ESPORTES DE COMBATE",
    options: [
      { v: "mma", l: "MMA", protocolo: PROT(
        "Periodização por camp de luta. Corte de peso controlado para pesagem. Reidratação pós-pesagem em 24h. Reposição de glicogênio entre lutas. Recuperação 48h pós-luta.",
        ["corte de peso", "reidratação", "camp", "pós-luta"]) },
      { v: "boxe_muaythai", l: "Boxe / Muay Thai", protocolo: PROT(
        "Corte de peso por categoria. Periodização por camp. Reidratação inteligente pós-pesagem. CHO peri-treino para rounds intensos.",
        ["corte de peso", "camp", "reidratação", "CHO peri"]) },
      { v: "bjj_grappling", l: "Jiu-Jitsu / Grappling", protocolo: PROT(
        "Resistência anaeróbica + flexibilidade. Carbo 5–7 g/kg. Recuperação entre lutas no mesmo dia.",
        ["anaeróbico", "recuperação rápida"]) },
      { v: "wrestling_judo", l: "Wrestling / Judô", protocolo: PROT(
        "Corte de peso recorrente. Hidratação progressiva. Sódio e potássio peri-competição.",
        ["corte de peso", "eletrólitos"]) },
      { v: "karate_taekwondo", l: "Karatê / Taekwondo", protocolo: PROT(
        "Explosão + resistência. CHO pré-competição. Hidratação por luta. Recuperação 30–60min entre rounds.",
        ["explosão", "rounds", "CHO pré"]) },
    ],
  },
  {
    grupo: "ENDURANCE",
    options: [
      { v: "corrida", l: "Corrida (5k–42k)", protocolo: PROT(
        "Carb loading 72h pré-prova. Nutrição intra-treino longo com géis e eletrólitos. Cálculo de sódio por litro de suor. Beetroot/nitrato pré-competição. Recuperação pós-treino >2h.",
        ["carb loading", "intra-treino", "eletrólitos", "pré-prova"]) },
      { v: "ultramaratona", l: "Ultramaratona", protocolo: PROT(
        "Nutrição intra >60 g CHO/h. Fat adaptation periodizado. Sódio 800–1200 mg/L de suor. Estratégia sólido + líquido.",
        ["ultra", "fat adaptation", "sódio alto"]) },
      { v: "ciclismo_mtb", l: "Ciclismo / MTB", protocolo: PROT(
        "CHO 60–90 g/h em provas longas. Mix glicose+frutose 2:1. Hidratação contínua. Recuperação com 1.2 g CHO/kg pós.",
        ["CHO intra", "glicose+frutose", "recuperação"]) },
      { v: "triathlon", l: "Triathlon", protocolo: PROT(
        "Periodização por bloco (natação/bike/corrida). Carb loading 48–72h. Nutrição race day por etapa. Recuperação ativa.",
        ["periodização", "race day", "recuperação"]) },
      { v: "natacao", l: "Natação competitiva", protocolo: PROT(
        "CHO 6–8 g/kg em fases pesadas. Refeições leves pré-prova. Recuperação entre baterias.",
        ["CHO alto", "baterias", "pré-prova"]) },
      { v: "remo", l: "Remo", protocolo: PROT(
        "Categorias com corte de peso. Endurance + força. CHO 7–10 g/kg fase competitiva.",
        ["corte de peso", "endurance + força"]) },
    ],
  },
  {
    grupo: "FORÇA E POTÊNCIA",
    options: [
      { v: "powerlifting", l: "Powerlifting", protocolo: PROT(
        "Protocolo de força máxima. Creatina loading 20g/4d. Beta-alanina 3.2g titulação. Nutrição peri-treino alta intensidade. Meet day nutrition.",
        ["força máxima", "creatina loading", "meet day", "peri-treino"]) },
      { v: "weightlifting", l: "Weightlifting (Levantamento Olímpico)", protocolo: PROT(
        "Potência + técnica. CHO 5–7 g/kg. Creatina 5g/dia. Recuperação SNC priorizada.",
        ["potência", "SNC", "creatina"]) },
      { v: "strongman", l: "Strongman", protocolo: PROT(
        "Volumes calóricos altos (>4000 kcal). Proteína 2.0–2.5 g/kg. Eletrólitos para eventos longos.",
        ["alto calórico", "eletrólitos"]) },
      { v: "crossfit_hiit", l: "CrossFit / HIIT", protocolo: PROT(
        "CHO 5–8 g/kg. Beta-alanina + creatina. Refeições peri-WOD. Recuperação 2x ao dia se necessário.",
        ["CHO médio-alto", "peri-WOD", "creatina"]) },
      { v: "calistenia", l: "Calistenia", protocolo: PROT(
        "Razão peso/força. Proteína 1.8–2.2 g/kg. Carbo moderado. Foco em recomposição corporal.",
        ["peso/força", "recomposição"]) },
    ],
  },
  {
    grupo: "ESPORTES COLETIVOS",
    options: [
      { v: "futebol", l: "Futebol", protocolo: PROT(
        "Nutrição por posição e função. Múltiplos treinos por dia. Periodização por temporada. Jogos fora e viagens. Recuperação entre partidas.",
        ["posição", "temporada", "recuperação", "múltiplas sessões"]) },
      { v: "basquete", l: "Basquete", protocolo: PROT(
        "CHO 6–8 g/kg em temporada. Hidratação intra-jogo. Recuperação back-to-back.",
        ["temporada", "back-to-back"]) },
      { v: "volei", l: "Vôlei", protocolo: PROT(
        "Potência + saltos. Proteína 1.8–2.2 g/kg. Magnésio + creatina. CHO peri-jogo.",
        ["potência", "saltos", "creatina"]) },
      { v: "rugby", l: "Rugby", protocolo: PROT(
        "Volumes altos. Proteína 2.0–2.4 g/kg. Recuperação muscular intensa. Hidratação.",
        ["proteína alta", "recuperação"]) },
      { v: "handebol", l: "Handebol", protocolo: PROT(
        "Potência + endurance. CHO 6–7 g/kg. Eletrólitos para jogos quentes.",
        ["potência + endurance"]) },
      { v: "tenis_padel", l: "Tênis / Padel", protocolo: PROT(
        "Jogos longos. Hidratação contínua. CHO intra (banana/géis) em sets >90min.",
        ["sets longos", "CHO intra"]) },
    ],
  },
  {
    grupo: "CLÍNICO / SAÚDE",
    options: [
      { v: "emagrecimento_clinico", l: "Emagrecimento clínico", protocolo: PROT(
        "Déficit moderado e sustentável. Proteína 1.6–2.0 g/kg. Densidade nutricional priorizada.",
        ["déficit moderado", "densidade", "saciedade"]) },
      { v: "diabetes_t1", l: "Diabetes tipo 1", protocolo: PROT(
        "Cálculo de carboidratos para bolus de insulina. Índice glicêmico controlado. Hipoglicemia peri-treino. Janelas de carboidrato seguras. Monitoramento contínuo.",
        ["bolus", "IG controlado", "hipoglicemia", "CGM"]) },
      { v: "diabetes_t2", l: "Diabetes tipo 2", protocolo: PROT(
        "IG baixo a moderado. Distribuição de CHO ao longo do dia. Fibra ≥30 g/dia. Periodização da atividade.",
        ["IG baixo", "fibra alta", "distribuição CHO"]) },
      { v: "doenca_renal", l: "Doença renal crônica", protocolo: PROT(
        "Restrição de potássio e fósforo. Proteína controlada por estágio DRC. Controle de sódio e líquidos. Sem suplementos nefrotóxicos.",
        ["potássio", "fósforo", "proteína controlada", "DRC"]) },
      { v: "oncologia", l: "Oncologia nutricional", protocolo: PROT(
        "Densidade calórica e proteica elevadas. Ômega-3. Manejo de náusea e disgeusia. Evitar restrições agressivas.",
        ["densidade alta", "ômega-3", "manejo sintomas"]) },
      { v: "sindrome_metabolica", l: "Síndrome metabólica", protocolo: PROT(
        "Padrão mediterrâneo. Restrição de açúcares. Fibra ≥30 g. Atividade física integrada ao plano.",
        ["mediterrâneo", "low sugar", "fibra alta"]) },
      { v: "hipotireoidismo", l: "Hipotireoidismo / Hashimoto", protocolo: PROT(
        "Selênio + zinco + iodo equilibrados. Distanciar levotiroxina de cálcio/ferro. Glúten avaliado caso a caso.",
        ["selênio", "zinco", "iodo", "timing medicação"]) },
      { v: "pcos", l: "PCOS", protocolo: PROT(
        "Sensibilizadores de insulina. IG baixo. Inositol + ômega-3. Distribuição proteica por refeição.",
        ["IG baixo", "inositol", "sensibilidade insulínica"]) },
      { v: "sibo_ii", l: "SIBO / Intestino irritável", protocolo: PROT(
        "Low-FODMAP fase 1 (2–6 sem) → reintrodução. Mastigação + horários regulares. Sem fermentados na fase 1.",
        ["low-FODMAP", "reintrodução", "horários regulares"]) },
    ],
  },
  {
    grupo: "FEMININO ESPECIALIZADO",
    options: [
      { v: "atleta_feminina", l: "Atleta feminina geral", protocolo: PROT(
        "Mínimo 45 kcal/kg de massa magra. Ferro + vit D + cálcio monitorados. Periodização por ciclo.",
        ["45 kcal/kg MM", "ferro", "ciclo menstrual"]) },
      { v: "menopausa", l: "Menopausa / Perimenopausa", protocolo: PROT(
        "Proteína 1.6–2.0 g/kg para preservar massa magra. Cálcio + vit D + ômega-3. Fitoestrógenos. Treino de força priorizado.",
        ["proteína alta", "cálcio", "vit D"]) },
      { v: "gestante", l: "Gestante", protocolo: PROT(
        "Ajustes por trimestre. Folato + ferro + DHA. +340/+450 kcal por trimestre. Sem restrições agressivas.",
        ["trimestre", "folato", "DHA"]) },
      { v: "lactante", l: "Lactante / Amamentação", protocolo: PROT(
        "+450–500 kcal/dia. Proteína 1.7–1.9 g/kg. Hidratação +700 ml. DHA + cálcio + colina.",
        ["+500 kcal", "DHA", "hidratação alta"]) },
      { v: "endometriose", l: "Endometriose", protocolo: PROT(
        "Anti-inflamatório (ômega-3, polifenóis). Redução de lácteos e ultraprocessados. Magnésio + vit D.",
        ["anti-inflamatório", "ômega-3"]) },
      { v: "amenorreia_reds", l: "Amenorreia da atleta (RED-S)", protocolo: PROT(
        "Baixa disponibilidade energética revertida. Mínimo 45 kcal/kg de massa magra. Retorno menstrual progressivo. Densidade óssea.",
        ["RED-S", "disponibilidade energética", "retorno menstrual"]) },
      { v: "osteoporose", l: "Osteoporose", protocolo: PROT(
        "Cálcio 1000–1200 mg + vit D 2000 UI + vit K2. Proteína 1.2–1.5 g/kg. Treino de impacto + força.",
        ["cálcio", "vit D", "vit K2"]) },
    ],
  },
];

export const CONDICOES_CLINICAS_GROUPS: Array<{ grupo: string; itens: string[] }> = [
  { grupo: "METABÓLICO", itens: ["Resistência insulínica", "Diabetes T1", "Diabetes T2", "Síndrome metabólica", "Hipotireoidismo", "Hipertireoidismo", "PCOS", "Hiperuricemia/Gota"] },
  { grupo: "DIGESTIVO", itens: ["SIBO", "Intestino irritável", "Doença de Crohn", "Colite ulcerativa", "Refluxo/DRGE", "Celíaca", "Intolerância lactose", "Sensibilidade glúten"] },
  { grupo: "RENAL/CARDIOVASCULAR", itens: ["Doença renal crônica", "Hipertensão", "Dislipidemia", "Insuficiência cardíaca"] },
  { grupo: "FEMININO", itens: ["Endometriose", "Amenorreia", "Menopausa", "Gestante", "Lactante", "SOP/PCOS"] },
  { grupo: "ÓSSEO/ARTICULAR", itens: ["Osteoporose", "Osteopenia", "Artrite", "Lesão articular crônica"] },
  { grupo: "PSICOLÓGICO/COMPORTAMENTAL", itens: ["Histórico de compulsão", "Transtorno alimentar", "Ansiedade alimentar", "Ortorexia"] },
  { grupo: "ONCOLÓGICO", itens: ["Em tratamento oncológico", "Pós-tratamento oncológico"] },
];

export const ESTRATEGIAS_RECUPERACAO = [
  "Crioterapia", "Sauna", "Massagem", "Compressão",
  "Alongamento diário", "Meditação / HRV", "Nenhuma estratégia",
];

export const TIPOS_INTRA_TREINO = [
  "Nada", "Água apenas", "Eletrólitos",
  "Carboidrato simples", "Géis energéticos", "BCAA/EAA",
  "Maltodextrina", "Dextrose", "Waxy maize", "Banana", "Tâmara",
  "Bebida esportiva", "Mix customizado",
];

export const NIVEIS_ESTRESSE: Array<{ v: string; l: string }> = [
  { v: "baixo", l: "Baixo (vida tranquila)" },
  { v: "moderado", l: "Moderado (trabalho normal)" },
  { v: "alto", l: "Alto (muito estresse diário)" },
  { v: "muito_alto", l: "Muito alto (burnout / competição)" },
];

export const IDIOMAS_PDF: Array<{ v: string; l: string }> = [
  { v: "pt-BR", l: "Português (BR)" },
  { v: "en", l: "English" },
  { v: "es", l: "Español" },
  { v: "it", l: "Italiano" },
  { v: "fr", l: "Français" },
];

export const FORMATOS_MEDIDA: Array<{ v: string; l: string }> = [
  { v: "gramas", l: "Gramas" },
  { v: "caseiras", l: "Medidas caseiras" },
  { v: "ambos", l: "Ambos (gramas + medidas caseiras)" },
];

export const NIVEIS_DETALHE: Array<{ v: string; l: string }> = [
  { v: "completo", l: "Completo (para nutricionistas)" },
  { v: "resumido", l: "Resumido (para o paciente)" },
  { v: "ultra", l: "Ultra-detalhado (com ciência e referências)" },
];

export const ITENS_INCLUIR_PDF = [
  "Justificativa científica de cada refeição",
  "Timing e horários sugeridos",
  "Lista de compras semanal",
  "Receitas adaptadas",
  "Instruções de preparo",
  "Alertas farmacológicos",
  "Protocolo de suplementação",
  "Metas semanais de evolução",
];

export const ESPECIALIDADES_PROFISSIONAL: Array<{ v: string; l: string }> = [
  { v: "nutri_clinico", l: "Nutricionista Clínico" },
  { v: "nutri_esportivo", l: "Nutricionista Esportivo" },
  { v: "nutrition_coach", l: "Nutrition Coach" },
  { v: "personal", l: "Personal Trainer" },
  { v: "preparador", l: "Preparador Físico" },
  { v: "medico_nutrologo", l: "Médico Nutrólogo" },
  { v: "outro", l: "Outro" },
];

// ─── Defaults para campos novos do form ────────────────────────────────────────
export type IdentidadeProfissional = {
  nome: string;
  registro: string;
  especialidade: string;
  consultorio: string;
  cidade: string;
  exibirNoPdf: boolean;
};

export const IDENTIDADE_DEFAULT: IdentidadeProfissional = {
  nome: "", registro: "", especialidade: "nutri_esportivo",
  consultorio: "", cidade: "", exibirNoPdf: false,
};

export type IntraTreinoCfg = {
  ativo: boolean;
  tipos: string[];
  choHora: string;
  sodioLitro: string;
};
export const INTRA_DEFAULT: IntraTreinoCfg = {
  ativo: false, tipos: [], choHora: "", sodioLitro: "",
};

export type PdfCfg = {
  idioma: string;
  formato: string;
  detalhe: string;
  incluir: string[];
};
export const PDF_DEFAULT: PdfCfg = {
  idioma: "pt-BR", formato: "gramas", detalhe: "completo",
  incluir: ["Timing e horários sugeridos", "Lista de compras semanal", "Protocolo de suplementação"],
};

export type RecuperacaoCfg = {
  nivelEstresse: string;
  estrategias: string[];
  hrvMonitorado: boolean;
  hrvMedio: string;
  lesaoAtiva: boolean;
  lesaoDesc: string;
};
export const RECUPERACAO_DEFAULT: RecuperacaoCfg = {
  nivelEstresse: "moderado", estrategias: [],
  hrvMonitorado: false, hrvMedio: "",
  lesaoAtiva: false, lesaoDesc: "",
};

export type ModoEspecialExtras = {
  // Combate
  pesoAtual?: string; categoriaAlvo?: string; diasPesagem?: string;
  protocoloCorte?: "desidratacao" | "restricao_cho" | "combinado";
  reidratacao?: boolean; horasPesagemLuta?: string;
  // Endurance
  distanciaProva?: string; dataProva?: string;
  carbLoading?: "24h" | "48h" | "72h"; nutricaoIntra?: boolean;
  tipoIntra?: "geis" | "banana" | "tamara" | "mix";
  // Peak Strength
  categoriasPeso?: string; numTentativas?: string;
  horarioProvas?: string; alimentacaoEntre?: string;
  // Feminino Hormonal
  faseCicloExt?: "menstrual" | "folicular" | "ovulatoria" | "lutea";
  sintomas?: string; contraceptivo?: boolean; menopausa?: boolean;
};
export const MODO_EXTRAS_DEFAULT: ModoEspecialExtras = {};
