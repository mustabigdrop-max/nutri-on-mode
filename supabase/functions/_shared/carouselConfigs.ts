/**
 * Configuração do conteúdo PÓS-SLIDES (legenda, self-comment, hashtags, CTA)
 * por tipo de carrossel. Cada tipo tem seu universo próprio: MCE não fala de
 * peptídeo, NEXUS não fala de pilares M/C/E, e por aí vai. A única ponte comum
 * é o CTA do diagnóstico, que é o funil universal.
 */

export type TipoCarrossel =
  | "MCE"
  | "NEXUS_PEPTIDEO"
  | "NEXUS_MICROBIOTA"
  | "NEXUS_ESTEROIDE"
  | "RESULTADO_PROTOCOLO"
  | "REFEICAO"
  | "NUTRION_FEATURE"
  | "MITO_METODO";

export type CarrosselConfig = {
  prompt_legenda: string;
  prompt_self_comment: string;
  hashtags_top5: string[];
  hashtags_15: string[];
  hashtags_por_grupo?: Record<string, string[]>;
  cta: string;
  cta_save: string;
  disclaimer?: string | null;
  tema_emojis: string;
  /** Termos proibidos na legenda desse universo. */
  proibidos: string[];
};

const CONFIG_MCE: CarrosselConfig = {
  prompt_legenda: `Gere legenda sobre o tema comportamental: {tema}.
Estrutura: gancho com aspas → desenvolvimento → 3 pilares com emojis (🧠⚡🎯) → CTA salvar → CTA diagnóstico.
Tom: coach. Máximo 600 caracteres. SEM hashtags.`,
  prompt_self_comment: `Pergunta sobre comportamento/mindset que gere resposta fácil, conectando com os pilares M, C ou E. Ex: "Qual pilar te trava mais? M, C ou E?"`,
  hashtags_top5: ["#metodomce", "#nutrion", "#mindset", "#transformacao", "#habitossaudaveis"],
  hashtags_15: [
    "#metodomce", "#nutrion", "#coachdiogomello",
    "#mindset", "#transformacao", "#habitossaudaveis",
    "#comportamento", "#disciplina", "#consistencia",
    "#fitness", "#emagrecimento", "#mudancadevida",
    "#desenvolvimentopessoal", "#mentalidade", "#foco",
  ],
  cta: "Diagnóstico MCE gratuito — link na bio",
  cta_save: "Salva esse post — vai precisar reler.",
  disclaimer: null,
  tema_emojis: "🧠⚡🎯",
  proibidos: ["peptídeo", "peptideo", "peptídeos", "peptideos", "microbiota", "probiótico", "probiotico", "cepa"],
};

const CONFIG_NEXUS_PEPTIDEO: CarrosselConfig = {
  prompt_legenda: `Gere legenda CIENTÍFICA sobre o peptídeo: {tema}.
Estrutura: nome + classe → o que faz em 1 frase → dado principal com número → risco principal → CTA pra quem quer entender mais → disclaimer.
Tom: educador científico, NÃO coach motivacional.
NÃO mencionar MCE, Mentalidade, Comportamento ou Execução.
Máximo 600 caracteres. SEM hashtags.`,
  prompt_self_comment: `Pergunta científica sobre o peptídeo que gere debate ou curiosidade. Ex: "Você já ouviu falar desse peptídeo? O que achou?" ou "Qual peptídeo você quer ver no próximo post?". NÃO mencionar MCE.`,
  hashtags_top5: ["#peptideos", "#nutrion", "#ciencia", "#saude", "#farmaconutricao"],
  hashtags_15: [
    "#peptideos", "#nutrion", "#nexusbio",
    "#ciencia", "#saude", "#farmaconutricao",
    "#endocrinologia", "#metabolismo", "#bioquimica",
    "#semaglutide", "#glp1", "#longevidade",
    "#medicinaintegrativa", "#nutrologia", "#evidencia",
  ],
  cta: "Quer entender mais sobre peptídeos? Link na bio.",
  cta_save: "Salva — essa informação você não acha fácil.",
  disclaimer: "⚕️ Informação educacional. Consulte seu médico.",
  tema_emojis: "🧬🔬📊",
  proibidos: ["mce", "mentalidade", "comportamento", "execução", "execucao", "método mce", "metodo mce"],
};

const CONFIG_NEXUS_MICROBIOTA: CarrosselConfig = {
  prompt_legenda: `Gere legenda CIENTÍFICA sobre microbiota: {tema}.
Estrutura: nome da cepa/conceito → o que faz no intestino → dado surpreendente com número → como obter na prática (alimento ou suplemento) → disclaimer.
Tom: professor que traduz ciência pro dia a dia.
NÃO mencionar MCE, Mentalidade, Comportamento ou Execução.
Máximo 600 caracteres. SEM hashtags.`,
  prompt_self_comment: `Pergunta sobre microbiota/intestino que gere curiosidade. Ex: "Você sabia que isso acontecia no seu intestino?" ou "Qual alimento desses você come todo dia?". NÃO mencionar MCE.`,
  hashtags_top5: ["#microbiota", "#nutrion", "#saudeintestinal", "#probioticos", "#ciencia"],
  hashtags_15: [
    "#microbiota", "#nutrion", "#nexusbio",
    "#saudeintestinal", "#probioticos", "#prebioticos",
    "#intestino", "#eixointestinocerebro", "#ciencia",
    "#nutricaofuncional", "#microbioma", "#kefir",
    "#fermentados", "#serotonina", "#longevidade",
  ],
  cta: "Enciclopédia completa de microbiota no nutriON — link na bio.",
  cta_save: "Salva — manda pra alguém que precisa ver isso.",
  disclaimer: "⚕️ Informação educacional. Consulte um profissional.",
  tema_emojis: "🦠🧬🔬",
  proibidos: ["mce", "mentalidade", "comportamento", "execução", "execucao", "método mce", "metodo mce"],
};

const CONFIG_RESULTADO: CarrosselConfig = {
  prompt_legenda: `Gere legenda mostrando resultado + protocolo: {tema}.
Estrutura: resultado em 1 frase → protocolo resumido (APEX) → 3 diferenciais do treino → nutrição do dia → CTA pra quem quer o mesmo protocolo.
Tom: coach mostrando seu próprio resultado com orgulho.
Use SOMENTE os números que vierem nos dados. Máximo 600 caracteres. SEM hashtags.`,
  prompt_self_comment: `Pergunta sobre treino que gere resposta. Ex: "Você sabe o que é RPE no treino? Comenta 👇" ou "Quantos minutos seu treino de pernas dura?"`,
  hashtags_top5: ["#treino", "#nutrion", "#hipertrofia", "#academia", "#shape"],
  hashtags_15: [
    "#treino", "#nutrion", "#coachdiogomello",
    "#hipertrofia", "#academia", "#treinointeligente",
    "#musculacao", "#fitness", "#shape",
    "#personaltrainer", "#treinopesado", "#gymlife",
    "#evolucao", "#disciplina", "#performance",
  ],
  hashtags_por_grupo: {
    pernas: ["#legday", "#treinodepernas", "#agachamento", "#gluteos", "#posterior"],
    costas: ["#backday", "#treinodecostas", "#pullday", "#dorsais", "#remada"],
    peito: ["#chestday", "#treinodepeito", "#supino", "#pushday", "#peitoral"],
    ombros: ["#shoulderday", "#treinodeombros", "#desenvolvimento", "#deltoides"],
    bracos: ["#armday", "#treinodebracos", "#biceps", "#triceps", "#rosca"],
  },
  cta: 'Quer esse protocolo no seu celular? DM "TREINO" ou link na bio.',
  cta_save: "Salva o treino completo — tá tudo aqui.",
  disclaimer: null,
  tema_emojis: "🏋️💪🔥",
  proibidos: ["peptídeo", "peptideo", "microbiota", "cepa"],
};

const CONFIG_REFEICAO: CarrosselConfig = {
  prompt_legenda: `Gere legenda sobre a refeição: {tema}.
Estrutura: o que tem no prato → propósito de cada alimento em 1 frase → 1 dado científico surpreendente → NutrySync ajustou as calorias → CTA.
Tom: educador prático que traduz ciência no prato.
Use SOMENTE alimentos, porções e números que vierem nos dados. Máximo 600 caracteres. SEM hashtags.`,
  prompt_self_comment: `Pergunta sobre nutrição prática. Ex: "Você sabe por que a cúrcuma só funciona com pimenta?" ou "Qual desses alimentos você come todo dia?"`,
  hashtags_top5: ["#nutricao", "#nutrion", "#comidadeverdade", "#macros", "#postreino"],
  hashtags_15: [
    "#nutrion", "#nutricao", "#coachdiogomello",
    "#comidadeverdade", "#macros", "#refeicao",
    "#postreino", "#mealprep", "#dietaflexivel",
    "#alimentacaosaudavel", "#proteina", "#fitness",
    "#comidasaudavel", "#nutricaoesportiva", "#planoalimentar",
  ],
  cta: "Plano alimentar com ciência por trás de cada alimento — link na bio.",
  cta_save: "Salva essa — cada alimento tem um motivo.",
  disclaimer: null,
  tema_emojis: "🍽️🧬📊",
  proibidos: ["mce", "mentalidade", "execução", "execucao", "peptídeo", "peptideo"],
};

const CONFIG_MITO: CarrosselConfig = {
  prompt_legenda: `Gere legenda polêmica sobre a crença: {tema}.
Estrutura: afirmação provocativa → "mito ou método?" → veredito em 1 frase com dado → convite pra debate nos comentários → CTA compartilhar.
Tom: provocativo mas embasado. Gerar debate.
NÃO mencionar MCE. Máximo 600 caracteres. SEM hashtags.`,
  prompt_self_comment: `Pergunta polarizadora sobre o mito. Ex: "Concorda ou discorda? Comenta sua opinião 👇" ou "Manda pra aquele amigo que acredita nisso 💀"`,
  hashtags_top5: ["#mitooumetodo", "#nutrion", "#verdadesfitness", "#ciencia", "#fitness"],
  hashtags_15: [
    "#mitooumetodo", "#nutrion", "#coachdiogomello",
    "#verdadesfitness", "#ciencia", "#mitos",
    "#fitnessfacts", "#nutricao", "#treino",
    "#emagrecimento", "#dieta", "#saude",
    "#educacaofisica", "#evidencia", "#desmistificando",
  ],
  cta: "Manda pra quem precisa ver isso 👇",
  cta_save: "Salva e manda pra quem acredita nesse mito.",
  disclaimer: null,
  tema_emojis: "💀🔬❌✅",
  proibidos: ["mce", "mentalidade", "comportamento", "execução", "execucao"],
};

const CONFIG_NUTRION: CarrosselConfig = {
  prompt_legenda: `Gere legenda mostrando a funcionalidade do nutriON: {tema}.
Estrutura: problema que existia antes → como o nutriON resolve → 1 feature destaque → convite pra conhecer.
Tom: fundador orgulhoso mostrando o que construiu.
NÃO mencionar MCE a menos que o módulo seja o diagnóstico MCE.
Máximo 600 caracteres. SEM hashtags.`,
  prompt_self_comment: `Pergunta sobre a dor que o módulo resolve. Ex: "Seu app de treino mostra mapa muscular de cada exercício?" ou "Seu plano alimentar ajusta calorias pelo treino do dia?"`,
  hashtags_top5: ["#nutrion", "#fitnesstech", "#coachdiogomello", "#tecnologia", "#inovacao"],
  hashtags_15: [
    "#nutrion", "#fitnesstech", "#coachdiogomello",
    "#tecnologia", "#inovacao", "#startupbrasil",
    "#appfitness", "#personaltrainer", "#coach",
    "#plataforma", "#fitness", "#treino",
    "#nutricao", "#saude", "#empreendedorismo",
  ],
  cta: "Conheça o nutriON — link na bio.",
  cta_save: "Salva — você nunca viu um app assim.",
  disclaimer: null,
  tema_emojis: "⚡📱🚀",
  proibidos: ["peptídeo", "peptideo", "microbiota", "cepa"],
};


const CONFIG_NEXUS_ESTEROIDE: CarrosselConfig = {
  prompt_legenda: `Gere legenda EDUCATIVA e de REDUÇÃO DE DANOS sobre: {tema}.
Estrutura: composto + classe → o que a ciência mostra em 1 frase com dado → tese "menos é mais" com número (ganho logarítmico x colateral linear) → risco principal com o MESMO peso do benefício → exames obrigatórios → disclaimer.
Tom: educador científico. NÃO promover uso. NÃO demonizar. NÃO glamourizar.
NUNCA recomendar dose, protocolo, ciclo ou combinação.
NÃO mencionar MCE, Mentalidade, Comportamento ou Execução.
Máximo 600 caracteres. SEM hashtags. SEM markdown.`,
  prompt_self_comment: `Pergunta educativa sobre monitoramento ou sobre a curva dose-resposta. Ex: "Você sabia que dobrar a dose não dobra o ganho?" ou "Quem usa e nunca fez hemograma, comenta aí." NÃO recomendar uso nem dose.`,
  hashtags_top5: ["#reducaodedanos", "#nutrion", "#ciencia", "#hormonios", "#saudemasculina"],
  hashtags_15: [
    "#reducaodedanos", "#nutrion", "#nexusbio",
    "#ciencia", "#hormonios", "#saudemasculina",
    "#endocrinologia", "#exameslaboratoriais", "#educacaoemsaude",
    "#testosterona", "#evidencia", "#saudecardiovascular",
    "#atleta", "#performance", "#medicinaesportiva",
  ],
  cta: "Diagnóstico gratuito — link na bio",
  cta_save: "Salva esse — informação antes de decisão.",
  disclaimer:
    "⚕️ Conteúdo estritamente educacional baseado em literatura científica. Esteroides anabolizantes são substâncias controladas no Brasil (Portaria 344/98 ANVISA). O uso sem prescrição médica é ilegal. Este conteúdo NÃO constitui recomendação de uso, dosagem ou protocolo. Consulte um endocrinologista.",
  tema_emojis: "💉🔬📉",
  proibidos: [
    "mce", "mentalidade", "comportamento", "execução", "execucao",
    "microbiota", "cepa", "recomendo", "sugiro a dose", "ciclo ideal",
  ],
};

export const CARROSSEL_CONFIGS: Record<TipoCarrossel, CarrosselConfig> = {
  MCE: CONFIG_MCE,
  NEXUS_PEPTIDEO: CONFIG_NEXUS_PEPTIDEO,
  NEXUS_MICROBIOTA: CONFIG_NEXUS_MICROBIOTA,
  NEXUS_ESTEROIDE: CONFIG_NEXUS_ESTEROIDE,
  RESULTADO_PROTOCOLO: CONFIG_RESULTADO,
  REFEICAO: CONFIG_REFEICAO,
  NUTRION_FEATURE: CONFIG_NUTRION,
  MITO_METODO: CONFIG_MITO,
};

export const getConfigPorTipo = (tipo?: string): CarrosselConfig =>
  CARROSSEL_CONFIGS[(tipo as TipoCarrossel)] ?? CONFIG_MCE;

const TOM_POR_TIPO: Record<TipoCarrossel, string> = {
  MCE: "coach",
  NEXUS_PEPTIDEO: "educador científico",
  NEXUS_MICROBIOTA: "educador científico",
  NEXUS_ESTEROIDE: "educador científico de redução de danos",
  RESULTADO_PROTOCOLO: "atleta mostrando o próprio resultado",
  REFEICAO: "prático",
  NUTRION_FEATURE: "fundador",
  MITO_METODO: "provocador",
};

/** Hashtags finais do tipo, já ajustadas por grupo muscular quando existir. */
export function hashtagsDoTipo(tipo: TipoCarrossel, grupo?: string) {
  const config = CARROSSEL_CONFIGS[tipo] ?? CONFIG_MCE;
  const chave = (grupo || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const doGrupo = config.hashtags_por_grupo?.[chave];
  if (!doGrupo?.length) return { top5: config.hashtags_top5, quinze: config.hashtags_15 };

  const top5 = [doGrupo[0], "#nutrion", ...doGrupo.slice(1, 4)].filter(Boolean).slice(0, 5);
  const quinze = Array.from(new Set([...doGrupo, ...config.hashtags_15])).slice(0, 15);
  return { top5, quinze };
}

/** Monta o prompt do conteúdo pós-slides respeitando o universo do tipo. */
export function promptPosSlides(tipo: TipoCarrossel, tema: string, dados?: unknown, grupo?: string) {
  const config = CARROSSEL_CONFIGS[tipo] ?? CONFIG_MCE;
  const { top5, quinze } = hashtagsDoTipo(tipo, grupo);
  const dadosTxt = dados ? JSON.stringify(dados).slice(0, 4000) : "sem dados extras";

  return `Gere o conteúdo pós-slides para um carrossel do tipo: ${tipo}
Tema: ${tema}
Dados reais (fonte única, nunca invente número, alimento, estudo ou exercício fora daqui): ${dadosTxt}

${config.prompt_legenda.replaceAll("{tema}", tema)}

Self-comment: ${config.prompt_self_comment}

REGRAS DE UNIVERSO (obrigatórias):
- Tom deste tipo: ${TOM_POR_TIPO[tipo]}.
- Nunca cruzar universos: MCE fala de comportamento; NEXUS fala de ciência (sem pilares M/C/E); RESULTADO fala de treino/APEX; REFEIÇÃO fala de nutrição/NutrySync; MITO fala de polêmica embasada; NUTRION fala de produto.
- Termos proibidos nesta legenda: ${config.proibidos.join(", ")}.
- A legenda vai SEM hashtags (elas voltam em campo próprio) e SEM markdown.
- Nunca use as palavras "IA", "AI" ou "inteligência artificial".
- O self_comment precisa gerar resposta fácil (sim/não ou escolha), máximo 80 caracteres.
- Devolva as hashtags EXATAMENTE como estão abaixo:
hashtags_top5 = ${JSON.stringify(top5)}
hashtags_15 = ${JSON.stringify(quinze)}
- cta = "${config.cta}"
- cta_save = "${config.cta_save}"${config.disclaimer ? `\n- disclaimer = "${config.disclaimer}"` : ""}`;
}

const semAcento = (v: string) =>
  v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/**
 * Aplica o config por cima do que a IA devolveu: hashtags, CTA e disclaimer
 * são sempre os do tipo, e frases que invadem outro universo são removidas.
 */
export function aplicarConfigPosSlides(
  tipo: TipoCarrossel,
  raw: Record<string, unknown>,
  grupo?: string,
) {
  const config = CARROSSEL_CONFIGS[tipo] ?? CONFIG_MCE;
  const { top5, quinze } = hashtagsDoTipo(tipo, grupo);
  const proibidos = config.proibidos.map(semAcento);

  const limpar = (texto: string) =>
    texto
      .split(/\n{2,}/)
      .map((bloco) =>
        bloco
          .split(/(?<=[.!?])\s+/)
          .filter((frase) => !proibidos.some((termo) => semAcento(frase).includes(termo)))
          .join(" ")
          .trim(),
      )
      .filter(Boolean)
      .join("\n\n")
      .trim();

  const legenda = limpar(String(raw.legenda ?? "")).slice(0, 600);
  const selfRaw = String(raw.self_comment ?? "");
  const selfLimpo = proibidos.some((t) => semAcento(selfRaw).includes(t)) ? "" : selfRaw.slice(0, 80);

  return {
    legenda,
    self_comment: selfLimpo,
    hashtags_top5: top5,
    hashtags_15: quinze,
    cta: config.cta,
    cta_save: config.cta_save,
    disclaimer: config.disclaimer ?? null,
    tema_emojis: config.tema_emojis,
    melhor_horario: String(raw.melhor_horario ?? ""),
    dica_engajamento: String(raw.dica_engajamento ?? ""),
  };
}
