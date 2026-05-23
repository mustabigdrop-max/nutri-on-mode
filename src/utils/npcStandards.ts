// APEX Visual Intelligence — NPC/IFBB Official Standards (2024)
// Critérios oficiais de julgamento por categoria.

export type NPCCategory =
  | "CLASSIC_PHYSIQUE"
  | "MENS_PHYSIQUE"
  | "BODYBUILDING"
  | "BIKINI"
  | "WELLNESS"
  | "FIGURE"
  | "WOMENS_PHYSIQUE";

export interface NPCCategoryStandard {
  categoria: NPCCategory;
  nome: string;
  descricao: string;
  proporcoes: {
    grupo: string;
    peso_visual: number;
    descricao_ideal: string;
    erros_comuns: string[];
  }[];
  poses: {
    nome: string;
    focos: string[];
    erros: string[];
  }[];
  ratios: {
    nome: string;
    ideal: string;
    formula: string;
    tolerancia: number;
  }[];
  penalizacoes: {
    condicao: string;
    impacto: "ELIMINATORIO" | "GRAVE" | "MODERADO" | "LEVE";
    descricao: string;
  }[];
}

export const NPC_STANDARDS: Record<NPCCategory, NPCCategoryStandard> = {
  CLASSIC_PHYSIQUE: {
    categoria: "CLASSIC_PHYSIQUE",
    nome: "Classic Physique",
    descricao:
      "Físico clássico com proporcionalidade, simetria e condicionamento. Sem musculatura excessiva. Cintura estreita, ombros largos, V-taper pronunciado.",
    proporcoes: [
      { grupo: "Ombros / Deltóides", peso_visual: 10,
        descricao_ideal: "Deltóides redondos e cheios em todas as três porções. Largura de ombros deve criar V-taper pronunciado. Separação visível entre deltóide e bíceps.",
        erros_comuns: ["Deltóide lateral subdesenvolvido — ombro plano", "Ausência de deltóide posterior — pose de costas fraca", "Assimetria bilateral acima de 15%"] },
      { grupo: "Costas / Dorsal", peso_visual: 10,
        descricao_ideal: "V-taper máximo — dorsais largos com inserção baixa. 'Asa' visível na pose de costas aberta. Separação de grupos musculares visível.",
        erros_comuns: ["Inserção alta do dorsal — V-taper reduzido", "Ausência de espessura — costas planas", "Escápulas aladas — quebra a linha das costas"] },
      { grupo: "Peito / Peitoral", peso_visual: 8,
        descricao_ideal: "Peitoral superior cheio — linha de inserção clavicular bem definida. Não pode ser excessivo — deve ser proporcional ao restante.",
        erros_comuns: ["Peitoral inferior caído — ginecomastia aparente", "Ausência de peitoral superior", "Assimetria bilateral visível"] },
      { grupo: "Braços / Bíceps e Tríceps", peso_visual: 9,
        descricao_ideal: "Bíceps com pico visível na pose. Tríceps com separação de cabeças — especialmente cabeça longa visível na lateral. Proporção braquial harmoniosa.",
        erros_comuns: ["Bíceps sem pico — falta cabeça longa", "Tríceps sem volume lateral", "Antebraço desproporcional ao braço"] },
      { grupo: "Abdômen / Core", peso_visual: 9,
        descricao_ideal: "Abdômen definido — não precisa ser estriado. Cintura estreita é FUNDAMENTAL para Classic. Oblíquos visíveis mas não 'blocados'.",
        erros_comuns: ["Cintura larga — elimina o V-taper", "Abdômen distendido — bubble gut", "Falta de definição abdominal"] },
      { grupo: "Pernas / Quadríceps", peso_visual: 8,
        descricao_ideal: "Quadríceps com separação visível. Vasto medial ('gota') desenvolvido. Proporcional ao tronco — não pode ser excessivo.",
        erros_comuns: ["Ausência de gota do quadríceps", "Pernas desproporcionalmente pequenas", "Assimetria bilateral de quadríceps"] },
      { grupo: "Glúteo e Posterior", peso_visual: 7,
        descricao_ideal: "Glúteo firme e desenvolvido. Posterior visível na pose de costas. Transição harmoniosa glúteo-posterior.",
        erros_comuns: ["Glúteo 'vazio' — falta volume", "Posterior sem separação", "Sulco glúteo-femoral ausente"] },
      { grupo: "Panturrilha", peso_visual: 7,
        descricao_ideal: "Panturrilha proporcional à coxa. Desenvolvimento bilateral igual. Gastrocnêmio com forma de diamante.",
        erros_comuns: ["Panturrilha desproporcionalmente pequena", "Assimetria bilateral visível", "Ausência de separação gastrocnêmio-sóleo"] },
    ],
    poses: [
      { nome: "Relaxed Front", focos: ["Largura de ombros vs cintura (V-taper)", "Simetria bilateral geral", "Condicionamento — definição sem estriação", "Proporção tronco vs pernas"], erros: ["Joelhos valgizados", "Ombros assimétricos", "Cintura excessivamente larga", "Abdômen distendido"] },
      { nome: "Relaxed Back", focos: ["V-taper — largura dorsal vs cintura", "Escápulas planas — sem alamento", "Glúteo e posterior visíveis", "Simetria de ombros vista de costas"], erros: ["Escápulas aladas", "Dorsais sem inserção baixa", "Assimetria de ombros visível", "Costelas visíveis — muito magro"] },
      { nome: "Side Chest", focos: ["Espessura geral do físico", "Peitoral cheio e levantado", "Tríceps com volume lateral", "Linha abdominal da lateral"], erros: ["Peitoral caído", "Ausência de tríceps cabeça longa", "Postura com hiperlordose visível"] },
      { nome: "Side Tricep", focos: ["Tríceps com separação total", "Hamstring visível da lateral", "Panturrilha da lateral", "Glúteo projetado"], erros: ["Tríceps plano sem separação", "Hamstring ausente da lateral", "Anteriorização de cabeça visível"] },
    ],
    ratios: [
      { nome: "V-Taper Index", ideal: "1.618 (proporção áurea)", formula: "largura_ombros / largura_cintura", tolerancia: 10 },
      { nome: "Proporção Braço-Antebraço", ideal: "1.5:1", formula: "circ_braco / circ_antebraco", tolerancia: 15 },
      { nome: "Proporção Coxa-Panturrilha", ideal: "1.8:1", formula: "circ_coxa / circ_panturrilha", tolerancia: 12 },
    ],
    penalizacoes: [
      { condicao: "Cintura claramente larga — sem V-taper", impacto: "GRAVE", descricao: "Elimina possibilidade de top 5" },
      { condicao: "Escápulas aladas bilateral severo", impacto: "MODERADO", descricao: "Perde pontos em todas as poses de costas" },
      { condicao: "Assimetria bilateral acima de 20%", impacto: "GRAVE", descricao: "Simetria é critério primário de julgamento" },
      { condicao: "Condicionamento insuficiente (BF >10%)", impacto: "ELIMINATORIO", descricao: "Abaixo de 10% BF para palco" },
      { condicao: "Hiperlordose visível em pose lateral", impacto: "MODERADO", descricao: "Distorce a linha do físico" },
    ],
  },

  MENS_PHYSIQUE: {
    categoria: "MENS_PHYSIQUE",
    nome: "Men's Physique",
    descricao: "Físico atlético, estético e proporcional. Foco no tronco superior — avaliado de bermuda. Não pode ser excessivamente musculoso.",
    proporcoes: [
      { grupo: "Ombros / Deltóides", peso_visual: 10, descricao_ideal: "PRIORIDADE MÁXIMA em Men's Physique. Deltóides arredondados e cheios. Largura de ombros é o critério número 1.", erros_comuns: ["Ombros estreitos — elimina o V-taper", "Deltóide lateral ausente", "Assimetria visível"] },
      { grupo: "Abdômen", peso_visual: 10, descricao_ideal: "Abdômen definido e estriado é esperado. Cintura estreita — fundamental para V-taper. Oblíquos definidos mas não excessivos.", erros_comuns: ["Falta de definição", "Cintura larga", "Abdômen distendido"] },
      { grupo: "Peito", peso_visual: 8, descricao_ideal: "Peitoral cheio e definido. Não excessivo — estético, não volumoso.", erros_comuns: ["Peitoral inferior pendente", "Ausência de definição"] },
      { grupo: "Costas", peso_visual: 9, descricao_ideal: "V-taper visível mesmo de bermuda. Largura do dorsal proporcional aos ombros.", erros_comuns: ["Costas planas sem largura", "Escápulas aladas"] },
      { grupo: "Braços", peso_visual: 8, descricao_ideal: "Proporcionais ao tronco. Definição visível mas não excessiva.", erros_comuns: ["Braços desproporcionalmente pequenos", "Sem definição"] },
    ],
    poses: [
      { nome: "Front Quarter Turn", focos: ["V-taper geral", "Definição abdominal", "Largura de ombros", "Simetria bilateral"], erros: ["Postura inadequada", "Falta de definição", "Ombros assimétricos"] },
      { nome: "Back Quarter Turn", focos: ["V-taper de costas", "Largura do dorsal", "Proporção geral"], erros: ["Escápulas aladas", "Sem largura dorsal"] },
    ],
    ratios: [{ nome: "V-Taper Index", ideal: "1.5 ou superior", formula: "largura_ombros / largura_cintura", tolerancia: 8 }],
    penalizacoes: [
      { condicao: "Musculatura excessiva para categoria", impacto: "ELIMINATORIO", descricao: "Move para Classic ou Bodybuilding" },
      { condicao: "Condicionamento insuficiente", impacto: "GRAVE", descricao: "Definição abdominal é obrigatória" },
      { condicao: "V-taper ausente", impacto: "GRAVE", descricao: "Critério primário da categoria" },
    ],
  },

  BODYBUILDING: {
    categoria: "BODYBUILDING",
    nome: "Bodybuilding",
    descricao: "Máxima massa muscular com condicionamento extremo. Estriação e separação muscular total. Simetria e proporção entre grupos musculares.",
    proporcoes: [
      { grupo: "Geral", peso_visual: 10, descricao_ideal: "Cada grupo muscular deve estar completamente desenvolvido. Nenhum grupo pode ser ponto fraco. Condicionamento com estriação completa.", erros_comuns: ["Qualquer grupo muscular visivelmente menor", "Condicionamento insuficiente", "Assimetria bilateral"] },
    ],
    poses: [{ nome: "Mandatory Poses", focos: ["Massa muscular total", "Condicionamento — estriação completa", "Simetria bilateral", "Separação muscular"], erros: ["Qualquer grupo muscular fraco", "Falta de estriação", "Assimetria"] }],
    ratios: [{ nome: "Simetria Bilateral", ideal: "< 5% diferença entre lados", formula: "abs(E - D) / ((E + D) / 2)", tolerancia: 5 }],
    penalizacoes: [{ condicao: "Condicionamento insuficiente", impacto: "ELIMINATORIO", descricao: "Sem estriação = fora da competição" }],
  },

  BIKINI: {
    categoria: "BIKINI",
    nome: "Bikini",
    descricao: "Físico feminino atlético e tônico. Glúteo desenvolvido é o foco principal. Não pode ter musculatura excessiva ou estriação severa.",
    proporcoes: [
      { grupo: "Glúteo", peso_visual: 10, descricao_ideal: "CRITÉRIO NÚMERO 1 em Bikini. Glúteo redondo, cheio e levantado. Sulco glúteo-femoral bem definido.", erros_comuns: ["Glúteo plano ou vazio", "Sem definição do sulco", "Assimetria bilateral"] },
      { grupo: "Ombros", peso_visual: 9, descricao_ideal: "Ombros femininos — redondos mas não excessivos. Proporção com quadril cria a silhueta ideal.", erros_comuns: ["Ombros muito largos — masculiniza", "Ombros muito estreitos — sem forma"] },
      { grupo: "Cintura", peso_visual: 9, descricao_ideal: "Cintura estreita cria a proporção ampulheta. Definição mas não estriação.", erros_comuns: ["Cintura larga — perde a curva", "Estriação excessiva — para Figure/WP"] },
      { grupo: "Pernas", peso_visual: 8, descricao_ideal: "Coxas tônicas sem estriação. Panturrilha proporcional. Linha limpa da perna inteira.", erros_comuns: ["Pernas muito volumosas — masculiniza", "Pernas sem tônus"] },
    ],
    poses: [
      { nome: "Front Presentation", focos: ["Proporção geral ampulheta", "Simetria bilateral", "Condicionamento — sem estriação excessiva", "Porte e apresentação"], erros: ["Postura inadequada", "Musculatura excessiva", "Falta de feminilidade"] },
      { nome: "Back Presentation", focos: ["Glúteo — CRITÉRIO PRIMÁRIO", "Proporção costas-glúteo", "Condicionamento geral"], erros: ["Glúteo insuficiente", "Estriação excessiva", "Falta de curva"] },
    ],
    ratios: [{ nome: "Proporção Ampulheta", ideal: "Ombros ≈ Quadril, Cintura 30% menor", formula: "cintura / ((ombros + quadril) / 2)", tolerancia: 10 }],
    penalizacoes: [
      { condicao: "Estriação severa e musculatura excessiva", impacto: "ELIMINATORIO", descricao: "Categoria errada — Figure ou WP" },
      { condicao: "Glúteo insuficiente", impacto: "GRAVE", descricao: "Critério número 1 da categoria" },
    ],
  },

  WELLNESS: {
    categoria: "WELLNESS",
    nome: "Wellness",
    descricao: "Físico feminino com foco na parte inferior. Glúteo e coxas muito desenvolvidas. Parte superior menos volumosa que a inferior.",
    proporcoes: [
      { grupo: "Glúteo + Posterior", peso_visual: 10, descricao_ideal: "Glúteo máximo e médio muito desenvolvidos. Posterior cheio e separado. É a categoria do glúteo mais desenvolvido.", erros_comuns: ["Glúteo insuficiente para categoria", "Posterior sem volume", "Assimetria glútea"] },
      { grupo: "Coxas", peso_visual: 9, descricao_ideal: "Quadríceps volumosos mas femininos. Adutores desenvolvidos. Panturrilha proporcional.", erros_comuns: ["Pernas finas para categoria", "Estriação excessiva de quadríceps"] },
      { grupo: "Parte superior", peso_visual: 6, descricao_ideal: "Menos desenvolvida que parte inferior — é proposital. Ombros menores que o quadril é o padrão.", erros_comuns: ["Parte superior igual ou maior que inferior", "Ombros muito largos"] },
    ],
    poses: [
      { nome: "Front Presentation", focos: ["Proporção inferior maior que superior", "Coxas volumosas", "Simetria geral"], erros: ["Parte superior dominante", "Coxas finas para categoria"] },
      { nome: "Back Presentation", focos: ["Glúteo — CRITÉRIO MÁXIMO", "Volume da parte inferior", "Separação glúteo-posterior"], erros: ["Glúteo insuficiente", "Falta de volume inferior"] },
    ],
    ratios: [{ nome: "Proporção Superior-Inferior", ideal: "Inferior 30-40% mais desenvolvida", formula: "volume_inferior / volume_superior", tolerancia: 15 }],
    penalizacoes: [{ condicao: "Parte inferior insuficiente", impacto: "ELIMINATORIO", descricao: "Não atende ao padrão da categoria" }],
  },

  FIGURE: {
    categoria: "FIGURE",
    nome: "Figure",
    descricao: "Entre Bikini e Women's Physique. Musculatura mais desenvolvida que Bikini. Estriação leve aceitável. Simetria é chave.",
    proporcoes: [
      { grupo: "Ombros", peso_visual: 10, descricao_ideal: "Deltóides desenvolvidos — mais que Bikini. Separação deltóide-bíceps visível.", erros_comuns: ["Ombros muito pequenos para categoria", "Sem separação muscular"] },
      { grupo: "Costas", peso_visual: 9, descricao_ideal: "Dorsal com V-taper visível. Espessura moderada. Mais desenvolvida que Bikini.", erros_comuns: ["Costas planas", "Escápulas aladas"] },
      { grupo: "Pernas", peso_visual: 8, descricao_ideal: "Quadríceps com separação leve. Posterior definido. Panturrilha proporcional.", erros_comuns: ["Pernas sem definição", "Musculatura excessiva — para WP"] },
    ],
    poses: [{ nome: "T-Walk + Poses", focos: ["Simetria bilateral total", "Separação muscular moderada", "Condicionamento — estriação leve ok", "Proporção ampulheta feminina"], erros: ["Musculatura excessiva", "Falta de definição", "Assimetria visível"] }],
    ratios: [{ nome: "V-Taper Feminino", ideal: "1.4 ou superior", formula: "largura_ombros / largura_cintura", tolerancia: 10 }],
    penalizacoes: [
      { condicao: "Musculatura de bodybuilding", impacto: "ELIMINATORIO", descricao: "Mover para Women's Physique" },
      { condicao: "Condicionamento de Bikini", impacto: "GRAVE", descricao: "Pouco desenvolvida para Figure" },
    ],
  },

  WOMENS_PHYSIQUE: {
    categoria: "WOMENS_PHYSIQUE",
    nome: "Women's Physique",
    descricao: "Máxima musculatura feminina aceitável. Separação e estriação completas. V-taper feminino com musculatura atlética total.",
    proporcoes: [
      { grupo: "Ombros + Costas", peso_visual: 10, descricao_ideal: "Deltóides muito desenvolvidos. V-taper pronunciado com costas largas. Separação muscular completa.", erros_comuns: ["Musculatura insuficiente", "Falta de V-taper", "Sem separação"] },
      { grupo: "Pernas", peso_visual: 9, descricao_ideal: "Quadríceps com separação total. Posterior estriado. Panturrilha desenvolvida.", erros_comuns: ["Pernas finas para categoria"] },
    ],
    poses: [{ nome: "Mandatory Poses", focos: ["Desenvolvimento muscular total", "Simetria bilateral", "Condicionamento com estriação", "Feminilidade mantida"], erros: ["Musculatura insuficiente", "Falta de feminilidade"] }],
    ratios: [{ nome: "V-Taper Feminino Atlético", ideal: "1.5 ou superior", formula: "largura_ombros / largura_cintura", tolerancia: 8 }],
    penalizacoes: [{ condicao: "Musculatura insuficiente", impacto: "GRAVE", descricao: "Mover para Figure" }],
  },
};

// Mapeia CategoryKey do dashboard → NPCCategory
export function mapCategoryKeyToNPC(key: string): NPCCategory {
  const map: Record<string, NPCCategory> = {
    mens_physique: "MENS_PHYSIQUE",
    classic_physique: "CLASSIC_PHYSIQUE",
    bodybuilding: "BODYBUILDING",
    bikini: "BIKINI",
    wellness: "WELLNESS",
    figure: "FIGURE",
    womens_physique: "WOMENS_PHYSIQUE",
    shape_lifestyle: "CLASSIC_PHYSIQUE",
  };
  return map[key] || "CLASSIC_PHYSIQUE";
}
