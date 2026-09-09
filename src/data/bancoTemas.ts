/**
 * Banco de temas do Social ON, organizado por vault/série.
 * Alimenta as sugestões do plano de hoje e a geração de carrosséis:
 * cada tema já carrega o formato ideal, o tipo de conteúdo e o potencial viral.
 */

export type TemaTipo =
  | "educativo"
  | "polêmica"
  | "mito_metodo"
  | "comparativo"
  | "novidade"
  | "bastidor"
  | "reflexivo";

export type TemaFormato = "carrossel" | "reels" | "stories";

export type CategoriaTema =
  | "STEROID_VAULT"
  | "MICROBIOTA_VAULT"
  | "PEPTIDE_VAULT"
  | "TREINO"
  | "NUTRICAO"
  | "MCE_COMPORTAMENTO"
  | "CIENCIA_GERAL"
  | "LIFESTYLE";

export type Tema = {
  titulo: string;
  subtitulo: string;
  potencial: number;
  tipo: TemaTipo;
  formato_ideal: TemaFormato;
};

export type CategoriaBanco = {
  icone: string;
  label: string;
  temas: Tema[];
};

export const BANCO_TEMAS: Record<CategoriaTema, CategoriaBanco> = {
  STEROID_VAULT: {
    icone: "💉",
    label: "SteroidVault",
    temas: [
      { titulo: "TRT vs Esteroides", subtitulo: "A diferença que ninguém explica", potencial: 10, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Por que bodybuilders morrem jovens", subtitulo: "O que a ciência realmente diz", potencial: 10, tipo: "polêmica", formato_ideal: "carrossel" },
      { titulo: "Trembolona: o mais perigoso e mais usado", subtitulo: "Dados reais de efeitos colaterais", potencial: 9, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Oxandrolona pra mulheres", subtitulo: "Mitos vs realidade científica", potencial: 9, tipo: "mito_metodo", formato_ideal: "carrossel" },
      { titulo: "GH sintético vale o custo?", subtitulo: "Dose-resposta e custo-benefício real", potencial: 8, tipo: "comparativo", formato_ideal: "carrossel" },
      { titulo: "Exames obrigatórios pra quem usa", subtitulo: "O checklist que pode salvar sua vida", potencial: 9, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "SARMs são mais seguros?", subtitulo: "A ciência diz NÃO", potencial: 9, tipo: "mito_metodo", formato_ideal: "carrossel" },
      { titulo: "PCT: o que funciona de verdade", subtitulo: "Tamoxifeno vs Clomifeno vs HCG", potencial: 8, tipo: "comparativo", formato_ideal: "carrossel" },
      { titulo: "Fertilidade e esteroides", subtitulo: "Dá pra reverter?", potencial: 8, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Insulina no bodybuilding", subtitulo: "O anabólico mais perigoso que existe", potencial: 10, tipo: "educativo", formato_ideal: "reels" },
    ],
  },

  MICROBIOTA_VAULT: {
    icone: "🦠",
    label: "MicrobiotaVault",
    temas: [
      { titulo: "Ozempic natural via microbiota", subtitulo: "Seu intestino produz GLP-1 de graça", potencial: 10, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Kefir vs Yakult vs Kombucha", subtitulo: "Comparativo de cepas e benefícios", potencial: 9, tipo: "comparativo", formato_ideal: "carrossel" },
      { titulo: "Ansiedade começa no intestino?", subtitulo: "Eixo intestino-cérebro explicado", potencial: 9, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Whey sem fibra destrói intestino?", subtitulo: "O que acontece com excesso de proteína", potencial: 8, tipo: "mito_metodo", formato_ideal: "reels" },
      { titulo: "Arroz de ontem é prebiótico", subtitulo: "Amido resistente e meal prep", potencial: 9, tipo: "educativo", formato_ideal: "stories" },
      { titulo: "7 sinais de disbiose", subtitulo: "Seu intestino pedindo socorro", potencial: 8, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Sono ruim? Pode ser o intestino", subtitulo: "Serotonina e melatonina intestinal", potencial: 8, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Reconstruir microbiota pós-antibiótico", subtitulo: "Protocolo baseado em ciência", potencial: 8, tipo: "educativo", formato_ideal: "carrossel" },
    ],
  },

  PEPTIDE_VAULT: {
    icone: "🧬",
    label: "PeptideVault",
    temas: [
      { titulo: "Ozempic vs Mounjaro", subtitulo: "Semaglutide vs Tirzepatide com dados", potencial: 10, tipo: "comparativo", formato_ideal: "carrossel" },
      { titulo: "BPC-157: cura tudo?", subtitulo: "O que a ciência realmente mostra", potencial: 9, tipo: "mito_metodo", formato_ideal: "carrossel" },
      { titulo: "Retatrutide: o agonista triplo", subtitulo: "O futuro dos peptídeos metabólicos", potencial: 8, tipo: "novidade", formato_ideal: "carrossel" },
      { titulo: "Melanotan: bronzeamento sem sol", subtitulo: "Riscos reais que ninguém fala", potencial: 9, tipo: "educativo", formato_ideal: "reels" },
      { titulo: "Semaglutide oral funciona igual?", subtitulo: "Rybelsus vs Ozempic injetável", potencial: 8, tipo: "comparativo", formato_ideal: "carrossel" },
    ],
  },

  TREINO: {
    icone: "💪",
    label: "Treino",
    temas: [
      { titulo: "Exercícios que todo mundo faz errado", subtitulo: "Série educativa por exercício", potencial: 10, tipo: "educativo", formato_ideal: "reels" },
      { titulo: "Volume vs Intensidade", subtitulo: "O debate que a ciência já resolveu", potencial: 9, tipo: "mito_metodo", formato_ideal: "carrossel" },
      { titulo: "Treino em jejum queima mais?", subtitulo: "O que a pesquisa mostra de verdade", potencial: 9, tipo: "mito_metodo", formato_ideal: "carrossel" },
      { titulo: "Deload: treinar MENOS pra crescer MAIS", subtitulo: "A ciência da recuperação", potencial: 8, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Tempo de descanso ideal", subtitulo: "60s vs 120s vs 180s — dados reais", potencial: 8, tipo: "comparativo", formato_ideal: "carrossel" },
      { titulo: "Overtraining existe?", subtitulo: "Ou é desculpa pra não treinar?", potencial: 9, tipo: "mito_metodo", formato_ideal: "reels" },
      // Costas / Pull
      { titulo: "Puxada vs Remada", subtitulo: "O que cada uma constrói nas suas costas", potencial: 9, tipo: "comparativo", formato_ideal: "carrossel" },
      { titulo: "Costas largas: amplitude completa", subtitulo: "Por que meia repetição rouba seu dorsal", potencial: 9, tipo: "educativo", formato_ideal: "reels" },
      { titulo: "Pegada pronada, supinada ou neutra?", subtitulo: "A ciência por trás de cada pegada nas costas", potencial: 8, tipo: "comparativo", formato_ideal: "carrossel" },
      // Pernas / Legs
      { titulo: "Agachamento profundo estraga o joelho?", subtitulo: "O mito que te impede de ter pernas fortes", potencial: 10, tipo: "mito_metodo", formato_ideal: "carrossel" },
      { titulo: "Posterior de coxa: o grupo mais negligenciado", subtitulo: "Mesa flexora não é suficiente — e a ciência explica", potencial: 8, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Panturrilha não cresce?", subtitulo: "Frequência e amplitude que realmente funcionam", potencial: 8, tipo: "educativo", formato_ideal: "reels" },
      // Peito / Push
      { titulo: "Supino reto vs inclinado", subtitulo: "O que a eletromiografia mostra pro peito", potencial: 9, tipo: "comparativo", formato_ideal: "carrossel" },
      { titulo: "Crucifixo antes ou depois do supino?", subtitulo: "Ordem de exercícios e fadiga no peito", potencial: 8, tipo: "educativo", formato_ideal: "reels" },
      // Ombros
      { titulo: "Desenvolvimento atrás da nuca", subtitulo: "Por que esse exercício de ombro virou vilão", potencial: 9, tipo: "mito_metodo", formato_ideal: "carrossel" },
      { titulo: "Elevação lateral: carga ou controle?", subtitulo: "O erro que trava seu deltóide lateral", potencial: 8, tipo: "educativo", formato_ideal: "reels" },
      // Braços
      { titulo: "Bíceps: rosca direta não é o suficiente", subtitulo: "Cabeça longa, curta e braquial pela ciência", potencial: 8, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Tríceps é 2/3 do braço", subtitulo: "Os exercícios que realmente enchem a manga", potencial: 9, tipo: "educativo", formato_ideal: "carrossel" },
    ],
  },

  NUTRICAO: {
    icone: "🍽️",
    label: "Nutrição",
    temas: [
      { titulo: "Janela anabólica existe?", subtitulo: "Sim, mas não como te falaram", potencial: 9, tipo: "mito_metodo", formato_ideal: "carrossel" },
      { titulo: "Quanta proteína por dia?", subtitulo: "1.6g vs 2.2g vs 3g/kg — meta-análises", potencial: 10, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Creatina: guia completo", subtitulo: "O suplemento mais estudado do mundo", potencial: 10, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Álcool e hipertrofia", subtitulo: "Quanto uma cerveja custa em ganho", potencial: 9, tipo: "educativo", formato_ideal: "reels" },
      { titulo: "Carboidrato à noite engorda?", subtitulo: "O mito mais persistente do fitness", potencial: 9, tipo: "mito_metodo", formato_ideal: "carrossel" },
      { titulo: "Adoçante faz mal?", subtitulo: "Aspartame, sucralose, stevia pela ciência", potencial: 8, tipo: "mito_metodo", formato_ideal: "carrossel" },
      { titulo: "Cafeína e performance", subtitulo: "Dose, timing, tolerância — guia completo", potencial: 8, tipo: "educativo", formato_ideal: "carrossel" },
    ],
  },

  MCE_COMPORTAMENTO: {
    icone: "🧠",
    label: "MCE · Comportamento",
    temas: [
      { titulo: "Por que você desiste na 3ª semana", subtitulo: "O padrão que ninguém te explicou", potencial: 10, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Comer emocional", subtitulo: "Seu corpo não tá com fome, sua mente tá", potencial: 9, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Disciplina é finita", subtitulo: "Por que sistema vence motivação", potencial: 9, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Perfeccionismo fitness", subtitulo: "O inimigo disfarçado de aliado", potencial: 8, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Comparação com Instagram", subtitulo: "Como isso destrói seu progresso", potencial: 9, tipo: "educativo", formato_ideal: "reels" },
    ],
  },

  CIENCIA_GERAL: {
    icone: "🔬",
    label: "Ciência geral",
    temas: [
      { titulo: "Sono: o anabólico de R$0", subtitulo: "Como o sono constrói músculo", potencial: 10, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Vitamina D: o hormônio deficiente", subtitulo: "Quase todo brasileiro tem pouca", potencial: 8, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Magnésio melhora TUDO", subtitulo: "Sono, treino, humor, intestino", potencial: 9, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Ashwagandha funciona?", subtitulo: "O que as meta-análises dizem", potencial: 8, tipo: "mito_metodo", formato_ideal: "carrossel" },
      { titulo: "Cortisol e shape", subtitulo: "Como estresse destrói seu resultado", potencial: 9, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Treino e ciclo menstrual", subtitulo: "Como ciclar o treino com o hormônio", potencial: 9, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "Melatonina: dose certa", subtitulo: "Menos que você toma", potencial: 8, tipo: "educativo", formato_ideal: "stories" },
    ],
  },

  LIFESTYLE: {
    icone: "👨‍👧",
    label: "Lifestyle",
    temas: [
      { titulo: "Dia na vida de um coach", subtitulo: "Rotina real, sem glamour", potencial: 8, tipo: "bastidor", formato_ideal: "reels" },
      { titulo: "Minha suplementação completa", subtitulo: "Com ciência de cada um", potencial: 9, tipo: "educativo", formato_ideal: "carrossel" },
      { titulo: "O que como num dia inteiro", subtitulo: "Com macros e propósito", potencial: 9, tipo: "bastidor", formato_ideal: "reels" },
      { titulo: "Erros que cometi como coach", subtitulo: "Vulnerabilidade gera conexão", potencial: 8, tipo: "reflexivo", formato_ideal: "carrossel" },
      { titulo: "O que 16 anos de Marinha me ensinaram", subtitulo: "Sobre disciplina, sistema e vida", potencial: 9, tipo: "reflexivo", formato_ideal: "carrossel" },
      { titulo: "Paternidade e fitness", subtitulo: "Como ser pai presente e treinar", potencial: 9, tipo: "reflexivo", formato_ideal: "stories" },
      { titulo: "Como construí o nutriON", subtitulo: "Do zero, sem investidor, no Lovable", potencial: 8, tipo: "bastidor", formato_ideal: "reels" },
      { titulo: "Representatividade negra no fitness", subtitulo: "Por que importa e o que falta", potencial: 10, tipo: "reflexivo", formato_ideal: "carrossel" },
    ],
  },
};

export const CATEGORIAS_TEMA = Object.keys(BANCO_TEMAS) as CategoriaTema[];

export type TemaComCategoria = Tema & { categoria: CategoriaTema; icone: string };

/** Todos os temas do banco, já com a categoria e o ícone embutidos. */
export const todosOsTemas = (): TemaComCategoria[] =>
  CATEGORIAS_TEMA.flatMap((cat) =>
    BANCO_TEMAS[cat].temas.map((t) => ({ ...t, categoria: cat, icone: BANCO_TEMAS[cat].icone })),
  );

/** Rotação semanal: cada dia da semana puxa de categorias diferentes. */
export const ROTACAO_SEMANAL: Record<number, { label: string; categorias: CategoriaTema[] }> = {
  0: { label: "Reflexão + Paternidade", categorias: ["LIFESTYLE", "MCE_COMPORTAMENTO"] },
  1: { label: "MCE + Treino", categorias: ["MCE_COMPORTAMENTO", "TREINO"] },
  2: { label: "NEXUS + Polêmica", categorias: ["PEPTIDE_VAULT", "MICROBIOTA_VAULT"] },
  3: { label: "Nutrição + Ciência geral", categorias: ["NUTRICAO", "CIENCIA_GERAL"] },
  4: { label: "SteroidVault + Treino", categorias: ["STEROID_VAULT", "TREINO"] },
  5: { label: "Lifestyle + Representatividade", categorias: ["LIFESTYLE", "MCE_COMPORTAMENTO"] },
  6: { label: "Bastidor + nutriON", categorias: ["LIFESTYLE", "CIENCIA_GERAL"] },
};

export type TemaPostado = { titulo: string; postado_em: string; formato?: string | null };

const DIAS_BLOQUEIO = 30;

/** Dias desde o último post do tema, ou null se nunca foi postado. */
export const diasDesdePost = (titulo: string, postados: TemaPostado[]): number | null => {
  const registros = postados.filter((p) => p.titulo === titulo);
  if (!registros.length) return null;
  const maisRecente = registros
    .map((p) => new Date(`${p.postado_em}T00:00:00`).getTime())
    .sort((a, b) => b - a)[0];
  return Math.floor((Date.now() - maisRecente) / 86400000);
};

/** Nunca sugerir tema postado há menos de 30 dias. */
export const filtrarTemasDisponiveis = <T extends { titulo: string }>(temas: T[], postados: TemaPostado[]): T[] =>
  temas.filter((t) => {
    const dias = diasDesdePost(t.titulo, postados);
    return dias === null || dias > DIAS_BLOQUEIO;
  });

/** Sugestões do dia: rotação da semana, potencial alto primeiro, sem repetir em 30 dias. */
export function sugestoesDoDia(postados: TemaPostado[], data = new Date(), limite = 4): TemaComCategoria[] {
  const rotacao = ROTACAO_SEMANAL[data.getDay()];
  const doDia = todosOsTemas().filter((t) => rotacao.categorias.includes(t.categoria));
  const disponiveis = filtrarTemasDisponiveis(doDia, postados);
  const base = disponiveis.length ? disponiveis : filtrarTemasDisponiveis(todosOsTemas(), postados);
  return [...base].sort((a, b) => b.potencial - a.potencial).slice(0, limite);
}

/** Vault/config de carrossel que o gerador deve usar para o tema. */
export const tipoCarrosselDoTema = (t: { categoria: CategoriaTema; tipo: TemaTipo }): string => {
  if (t.categoria === "STEROID_VAULT") return "NEXUS_ESTEROIDE";
  if (t.categoria === "MICROBIOTA_VAULT") return "NEXUS_MICROBIOTA";
  if (t.categoria === "PEPTIDE_VAULT") return "NEXUS_PEPTIDEO";
  if (t.tipo === "mito_metodo") return "MITO_METODO";
  if (t.categoria === "NUTRICAO") return "REFEICAO";
  if (t.categoria === "TREINO") return "RESULTADO_PROTOCOLO";
  return "MCE";
};

/** É um tema de vault científico (gera pelo template NEXUS-BIO). */
export const ehTemaNexus = (categoria: CategoriaTema) =>
  categoria === "STEROID_VAULT" || categoria === "MICROBIOTA_VAULT" || categoria === "PEPTIDE_VAULT";

export const FORMATO_LABEL: Record<TemaFormato, string> = {
  carrossel: "Carrossel",
  reels: "Reels",
  stories: "Stories",
};

export const TIPO_LABEL: Record<TemaTipo, string> = {
  educativo: "Educativo",
  "polêmica": "Polêmica",
  mito_metodo: "Mito ou Método",
  comparativo: "Comparativo",
  novidade: "Novidade",
  bastidor: "Bastidor",
  reflexivo: "Reflexivo",
};
