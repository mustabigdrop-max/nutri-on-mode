/**
 * KINESIS — Seção 2: LABORATÓRIO MUSCULAR.
 * Dossiê de desenvolvimento por grupo e subgrupo: função, exercícios
 * prioritários, princípio mecânico, cue-chave, volume dedicado e notas do APEX.
 */

import type { DossieGrupo } from "./kinesisTypes";

export const KINESIS_LAB: DossieGrupo[] = [
  {
    grupo: "DORSAL",
    anatomia_resumo:
      "O complexo dorsal inclui latíssimo dorsal (maior músculo das costas, responsável pelo V-taper), trapézio (superior, médio e inferior), romboides (retração escapular), teres major (assistente do lat) e infraespinhal/redondo menor (rotação externa).",
    subgrupos: [
      {
        subgrupo: "Latíssimo Dorsal — Porção Superior",
        funcao: "Adução e extensão do ombro com o braço em posição elevada",
        exercicios_prioritarios: ["Pulldown pegada aberta pronada", "Pull-up pegada larga", "Pullover no cabo"],
        principio: "Puxada VERTICAL com braço em abdução. Quanto mais o braço começa acima e aberto, mais recruta a porção superior.",
        cue_chave: "Puxe os cotovelos pra baixo e pra FORA do corpo.",
        volume_recomendado: "6-10 séries/semana dedicadas",
        erro_comum: "Pegada muito fechada — recruta mais braquial e porção inferior.",
      },
      {
        subgrupo: "Latíssimo Dorsal — Porção Inferior",
        funcao: "Extensão e adução do ombro com o braço próximo do corpo",
        exercicios_prioritarios: [
          "Remada curvada pegada supinada (Yates Row)",
          "Straight-Arm Pulldown com pausa no pico",
          "Pulldown pegada neutra estreita",
          "Remada no cabo com triângulo",
        ],
        principio: "O COTOVELO viaja rente ao corpo e para trás/baixo. A inserção inferior responde a extensão pura de ombro.",
        cue_chave: "Cotovelos colados no corpo, puxe em direção ao QUADRIL, não ao peito.",
        volume_recomendado: "6-10 séries/semana dedicadas",
        erro_comum: "Puxar pro peito com cotovelos abertos — recruta porção superior e trapézio.",
        nota_apex: "É o subgrupo que mais aparece como DEFICIT DE ATIVAÇÃO no APEX Assessment: a maioria nunca treinou lat inferior com intenção.",
      },
      {
        subgrupo: "Trapézio Médio + Romboides",
        funcao: "Retração e depressão escapular",
        exercicios_prioritarios: ["Face Pull com rotação externa", "Band Pull-Apart", "Remada alta no cabo com corda", "Prone Y-T-W no banco inclinado"],
        principio: "Retração escapular pura, sem flexão significativa de cotovelo. O foco é a escápula se movendo.",
        cue_chave: "Junte as escápulas como se segurasse uma moeda entre elas. Ombros longe das orelhas.",
        volume_recomendado: "4-8 séries/semana (pode entrar no aquecimento)",
        erro_comum: "Encolher os ombros — recruta trapézio superior no lugar do médio.",
      },
      {
        subgrupo: "Trapézio Inferior",
        funcao: "Depressão escapular e rotação superior da escápula",
        exercicios_prioritarios: ["Prone Y-Raise", "Cable Y-Raise na polia baixa", "Scapular Pull-Up"],
        principio: "Movimentos que levam a escápula PARA BAIXO. Essencial para postura e para desligar o trapézio superior compensatório.",
        cue_chave: "Escápulas pra baixo e juntas — a contração é embaixo, perto da coluna.",
        volume_recomendado: "3-6 séries/semana (aquecimento ou ativação)",
        nota_apex: "Base do protocolo CORRECT de dominância de trapézio superior: fortalecer o inferior é o antídoto.",
      },
    ],
    principio_geral:
      "Dorsal bem desenvolvido exige VARIEDADE DE ÂNGULOS E PEGADAS na mesma semana: puxada vertical + puxada horizontal, alternando pegada pronada, supinada e neutra.",
    treino_exemplo: {
      contexto: "Aluno com deficit de ATIVAÇÃO no dorsal inferior (score visual 42/100 no APEX).",
      exercicios: [
        { ordem: 1, exercicio: "Straight-Arm Pulldown com pausa 3s", series_reps: "3×12", nota: "[ACTIVATE] — isola lat inferior sem bíceps" },
        { ordem: 2, exercicio: "Remada Curvada Supinada (Yates)", series_reps: "4×8-10", nota: "Cotovelo rente, puxar em direção ao quadril" },
        { ordem: 3, exercicio: "Pulldown Pegada Neutra Estreita", series_reps: "3×10-12", nota: "Cotovelos descem rente ao corpo" },
        { ordem: 4, exercicio: "Seal Row com Halteres", series_reps: "3×10-12", nota: "Elimina momentum" },
        { ordem: 5, exercicio: "Pullover no Cabo com pausa", series_reps: "3×12", nota: "Extensão pura de ombro" },
      ],
      volume_total: "16 séries de dorsal com ênfase inferior",
      nota: "Pausa isométrica no primeiro e no último exercício reforça a ativação; todos têm cotovelo rente e extensão de ombro.",
    },
    temas_conteudo: [
      "Dorsal inferior: o subgrupo que quase ninguém treina",
      "3 pegadas, 3 ênfases diferentes nas costas",
      "Teste de 30s: seu dorsal ativa ou seu bíceps faz tudo?",
      "A ordem dos exercícios de costas que quase ninguém segue",
    ],
  },
  {
    grupo: "PEITORAL",
    anatomia_resumo:
      "Peitoral maior com porção clavicular (superior), esternal (média) e abdominal (inferior); peitoral menor abaixo, ligado à estabilização escapular; serrátil anterior como parceiro do movimento de empurrar.",
    subgrupos: [
      {
        subgrupo: "Peitoral Superior (clavicular)",
        funcao: "Flexão de ombro com adução",
        exercicios_prioritarios: ["Supino inclinado 30° com halteres", "Crossover de baixo para cima", "Supino inclinado na máquina"],
        principio: "Quanto mais flexão de ombro (braço subindo à frente), mais porção clavicular.",
        cue_chave: "Empurre em direção ao queixo, não ao teto.",
        volume_recomendado: "6-10 séries/semana quando é prioridade",
        erro_comum: "Inclinação acima de 45° — o deltoide anterior assume.",
        nota_apex: "Deficit ESTÉTICO mais comum do peitoral no APEX Visual.",
      },
      {
        subgrupo: "Peitoral Médio (esternal)",
        funcao: "Adução horizontal do ombro",
        exercicios_prioritarios: ["Supino reto", "Crucifixo no cabo na linha do peito", "Peck deck"],
        principio: "Adução no plano horizontal com cotovelos a 45-60° do tronco.",
        cue_chave: "Junte os peitorais no meio; o braço é só a alavanca.",
        volume_recomendado: "8-12 séries/semana",
      },
      {
        subgrupo: "Peitoral Inferior",
        funcao: "Adução com extensão de ombro",
        exercicios_prioritarios: ["Supino declinado", "Crossover de cima para baixo", "Paralelas com tronco inclinado"],
        principio: "Vetor de força de cima para baixo.",
        cue_chave: "Cruze as mãos abaixo da linha do peito no fim da rep.",
        volume_recomendado: "4-6 séries/semana",
      },
    ],
    principio_geral:
      "O peitoral responde a mudança de VETOR (ângulo do banco/polia) mais do que a troca de aparelho. Um treino completo cobre três vetores: subindo, horizontal e descendo.",
    temas_conteudo: [
      "Peitoral superior: o ângulo que resolve (e o que exagera)",
      "Supino não é o único empurrar: vetores que faltam no seu treino",
      "Dor no ombro no supino: o ajuste de cotovelo",
    ],
  },
  {
    grupo: "DELTOIDES",
    anatomia_resumo:
      "Deltoide anterior (flexão), lateral (abdução) e posterior (extensão e rotação externa), com manguito rotador estabilizando a cabeça do úmero.",
    subgrupos: [
      {
        subgrupo: "Deltoide Lateral",
        funcao: "Abdução de ombro — responsável pela largura",
        exercicios_prioritarios: ["Elevação lateral no cabo", "Elevação lateral com halteres", "Lateral na máquina"],
        principio: "Abdução pura até a linha dos ombros, sem encolhimento escapular.",
        cue_chave: "Lidere com o cotovelo, ombro longe da orelha.",
        volume_recomendado: "8-16 séries/semana (tolera volume alto)",
        erro_comum: "Iniciar encolhido — o trabalho vai pro trapézio superior.",
      },
      {
        subgrupo: "Deltoide Posterior",
        funcao: "Extensão e rotação externa de ombro",
        exercicios_prioritarios: ["Crucifixo inverso no cabo", "Face Pull", "Remada com cotovelos altos"],
        principio: "Cotovelos ACIMA da linha dos ombros com abdução horizontal.",
        cue_chave: "Abra os braços como se fosse rasgar uma folha na frente do peito.",
        volume_recomendado: "6-12 séries/semana",
        nota_apex: "Deficit frequente em quem tem muito volume de empurrar — aparece como assimetria postural no APEX.",
      },
      {
        subgrupo: "Deltoide Anterior",
        funcao: "Flexão de ombro",
        exercicios_prioritarios: ["Desenvolvimento com halteres", "Arnold Press", "Elevação frontal no cabo"],
        principio: "Já recebe volume indireto de todo empurrar horizontal; raramente precisa de prioridade.",
        cue_chave: "Empurre para cima sem projetar as costelas à frente.",
        volume_recomendado: "4-8 séries/semana diretas",
      },
    ],
    principio_geral:
      "Na maioria dos alunos a proporção está invertida: muito anterior, pouco lateral e posterior. A correção é redistribuir volume, não somar mais empurrar.",
    temas_conteudo: [
      "Ombro largo é deltoide LATERAL — e o seu treino quase não tem",
      "Deltoide posterior: o subgrupo que melhora a postura e o físico",
      "Trapézio roubando sua elevação lateral",
    ],
  },
  {
    grupo: "QUADRICEPS",
    anatomia_resumo:
      "Reto femoral (cruza quadril e joelho), vasto lateral, vasto medial (VMO) e vasto intermédio. Só o reto femoral cruza o quadril — por isso o ângulo do quadril muda a ênfase.",
    subgrupos: [
      {
        subgrupo: "Vasto Lateral",
        funcao: "Extensão de joelho — volume lateral da coxa",
        exercicios_prioritarios: ["Hack Squat", "Leg Press com pés baixos", "Extensora"],
        principio: "Extensão de joelho com carga alta e amplitude completa.",
        cue_chave: "Empurre com o meio do pé, joelho acompanha a linha do segundo dedo.",
        volume_recomendado: "8-14 séries/semana",
      },
      {
        subgrupo: "Vasto Medial (VMO)",
        funcao: "Extensão terminal do joelho e estabilização patelar",
        exercicios_prioritarios: ["Extensora com pausa nos últimos 20°", "TKE com banda", "Agachamento com calcanheira e amplitude completa"],
        principio: "A porção final da extensão (últimos 20-30°) é onde o VMO participa mais.",
        cue_chave: "Trave o joelho com força nos últimos centímetros e segure 2s.",
        volume_recomendado: "4-8 séries/semana quando é deficit",
        nota_apex: "Deficit de VMO aparece junto de valgo dinâmico no checklist funcional do APEX.",
      },
      {
        subgrupo: "Reto Femoral",
        funcao: "Extensão de joelho + flexão de quadril",
        exercicios_prioritarios: ["Extensora sentado com tronco ereto", "Sissy Squat", "Leg Press com tronco mais vertical"],
        principio: "Quadril mais estendido aumenta a contribuição do reto femoral na extensão de joelho.",
        cue_chave: "Tronco ereto e quadril aberto: assim o reto femoral entra.",
        volume_recomendado: "4-8 séries/semana",
      },
    ],
    principio_geral:
      "Quadríceps precisa de amplitude profunda E extensão terminal. Só agachar cobre o meio da curva; faltam os extremos.",
    temas_conteudo: [
      "VMO: como treinar a parte do quadríceps que estabiliza o joelho",
      "Posição dos pés no leg press muda mais do que você pensa",
      "Amplitude parcial no agachamento: quando faz sentido",
    ],
  },
  {
    grupo: "GLUTEOS",
    anatomia_resumo:
      "Glúteo máximo (extensão e rotação externa do quadril), glúteo médio e mínimo (abdução e estabilização pélvica no plano frontal).",
    subgrupos: [
      {
        subgrupo: "Glúteo Máximo",
        funcao: "Extensão de quadril",
        exercicios_prioritarios: ["Hip Thrust", "RDL", "Cadeira abdutora com tronco inclinado", "Step-up alto"],
        principio: "Combinar exercício com pico de tensão no encurtamento (hip thrust) e no alongamento (RDL).",
        cue_chave: "Quadril pra cima com costelas pra baixo; squeeze de 2s no topo.",
        volume_recomendado: "10-16 séries/semana quando é prioridade",
      },
      {
        subgrupo: "Glúteo Médio",
        funcao: "Abdução de quadril e estabilização pélvica",
        exercicios_prioritarios: ["Abdução no cabo em pé", "Side-lying abduction", "Monster walk com banda"],
        principio: "Trabalho no plano frontal, sem rotação do tronco.",
        cue_chave: "Abra a perna sem inclinar o tronco: só o quadril trabalha.",
        volume_recomendado: "4-8 séries/semana",
        nota_apex: "Fraqueza de glúteo médio é a causa mais comum de valgo dinâmico detectado no APEX — tratar antes de subir carga.",
      },
    ],
    principio_geral:
      "Glúteo responde a extensão de quadril carregada no topo + abdução estabilizadora. Deixar o plano frontal de fora é o erro mais frequente.",
    temas_conteudo: [
      "Glúteo médio: a peça que impede o joelho de cair pra dentro",
      "Hip thrust vs agachamento: o que cada um entrega",
      "Lombar arqueando no glúteo? Corrija a pelve primeiro",
    ],
  },
  {
    grupo: "POSTERIOR DE COXA",
    anatomia_resumo:
      "Bíceps femoral (cabeça longa e curta), semitendinoso e semimembranoso. Todos cruzam o joelho; exceto a cabeça curta do bíceps femoral, todos cruzam o quadril.",
    subgrupos: [
      {
        subgrupo: "Função de quadril (porção proximal)",
        funcao: "Extensão de quadril com joelho quase estendido",
        exercicios_prioritarios: ["RDL", "Good Morning", "Hiperextensão 45° com foco em posterior"],
        principio: "Alongamento sob carga — o estímulo vem do hinge.",
        cue_chave: "Quadril pra trás; sinta o elástico esticando atrás da coxa.",
        volume_recomendado: "6-10 séries/semana",
      },
      {
        subgrupo: "Função de joelho (porção distal)",
        funcao: "Flexão de joelho",
        exercicios_prioritarios: ["Mesa flexora", "Cadeira flexora sentado", "Nordic Curl"],
        principio: "Flexão de joelho isolada; o flexor sentado deixa o quadril fletido e alonga a porção longa.",
        cue_chave: "Puxe o calcanhar em direção ao glúteo e segure 1s.",
        volume_recomendado: "6-10 séries/semana",
        nota_apex: "Programas só com flexora deixam a função de quadril sem estímulo — e vice-versa.",
      },
    ],
    principio_geral: "Posterior completo exige um exercício de QUADRIL e um de JOELHO na mesma semana.",
    temas_conteudo: [
      "Posterior de coxa: dois exercícios, duas funções diferentes",
      "Só flexora não constrói posterior",
      "Histórico de estiramento: como progredir sem recaída",
    ],
  },
  {
    grupo: "BRACOS",
    anatomia_resumo:
      "Bíceps braquial (cabeça longa e curta), braquial e braquiorradial na flexão de cotovelo; tríceps com porções longa (cruza o ombro), lateral e medial na extensão.",
    subgrupos: [
      {
        subgrupo: "Bíceps — Cabeça Longa",
        funcao: "Flexão de cotovelo com ombro estendido",
        exercicios_prioritarios: ["Rosca inclinada no banco", "Rosca no cabo atrás do corpo", "Rosca Scott inversa"],
        principio: "Ombro em extensão alonga a cabeça longa.",
        cue_chave: "Cotovelo fixo atrás da linha do tronco.",
        volume_recomendado: "4-8 séries/semana",
      },
      {
        subgrupo: "Braquial e Braquiorradial",
        funcao: "Flexão de cotovelo em pegada neutra/pronada",
        exercicios_prioritarios: ["Rosca martelo", "Rosca inversa", "Rosca na corda"],
        principio: "Pegada neutra e pronada tira o bíceps de vantagem mecânica.",
        cue_chave: "Punho firme, sem rodar; empurre o antebraço contra a resistência.",
        volume_recomendado: "3-6 séries/semana",
      },
      {
        subgrupo: "Tríceps — Porção Longa",
        funcao: "Extensão de cotovelo com ombro fletido",
        exercicios_prioritarios: ["Extensão overhead no cabo", "Francês com halter", "Pushdown com tronco inclinado"],
        principio: "Braço acima da cabeça alonga a porção longa — a de maior volume no tríceps.",
        cue_chave: "Cotovelos apontando pra frente e fixos ao lado da cabeça.",
        volume_recomendado: "4-8 séries/semana",
        nota_apex: "Braço que não cresce apesar do volume normalmente tem zero trabalho overhead.",
      },
    ],
    principio_geral: "Braço cresce por ÂNGULO de ombro, não por quantidade de exercícios: um com ombro fletido, um neutro, um estendido.",
    temas_conteudo: [
      "Tríceps: por que o overhead é obrigatório",
      "Rosca martelo não é rosca 'mais fácil' — é outro músculo",
      "Braço travado há meses: revise o ângulo, não o volume",
    ],
  },
  {
    grupo: "PANTURRILHA",
    anatomia_resumo: "Gastrocnêmio (cruza o joelho, responde melhor com joelho estendido) e sóleo (joelho fletido, predominância de fibras lentas).",
    subgrupos: [
      {
        subgrupo: "Gastrocnêmio",
        funcao: "Flexão plantar com joelho estendido",
        exercicios_prioritarios: ["Panturrilha em pé", "Panturrilha no leg press com joelho quase estendido", "Donkey calf"],
        principio: "Joelho estendido coloca o gastrocnêmio em vantagem.",
        cue_chave: "Suba na ponta do dedão, pausa de 2-3s no topo e desça alongando por 3s.",
        volume_recomendado: "8-16 séries/semana",
      },
      {
        subgrupo: "Sóleo",
        funcao: "Flexão plantar com joelho fletido",
        exercicios_prioritarios: ["Panturrilha sentado", "Flexão plantar no leg press com joelho dobrado"],
        principio: "Joelho fletido retira o gastrocnêmio; fibras lentas pedem repetição alta e tempo sob tensão.",
        cue_chave: "Série longa e controlada: 15-25 reps com pausa no topo.",
        volume_recomendado: "6-12 séries/semana",
      },
    ],
    principio_geral: "Panturrilha exige amplitude completa, pausa no topo e excêntrico lento. Reps rápidas usam o tendão, não o músculo.",
    temas_conteudo: [
      "Panturrilha: duas posições de joelho, dois músculos",
      "Por que suas reps de panturrilha não contam",
    ],
  },
];

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** Busca o dossiê de um grupo muscular (tolerante a acento e sinônimo simples). */
export function dossieDoGrupo(grupo: string): DossieGrupo | null {
  const g = norm(grupo);
  if (!g) return null;
  const direto = KINESIS_LAB.find((d) => norm(d.grupo) === g);
  if (direto) return direto;
  const sinonimos: Record<string, string> = {
    costas: "DORSAL",
    lat: "DORSAL",
    latissimo: "DORSAL",
    dorsais: "DORSAL",
    peito: "PEITORAL",
    peitorais: "PEITORAL",
    ombro: "DELTOIDES",
    ombros: "DELTOIDES",
    deltoide: "DELTOIDES",
    quadriceps: "QUADRICEPS",
    perna: "QUADRICEPS",
    gluteo: "GLUTEOS",
    gluteos: "GLUTEOS",
    posterior: "POSTERIOR DE COXA",
    isquiotibiais: "POSTERIOR DE COXA",
    biceps: "BRACOS",
    triceps: "BRACOS",
    bracos: "BRACOS",
    panturrilhas: "PANTURRILHA",
  };
  const chave = Object.keys(sinonimos).find((k) => g.includes(k));
  if (chave) return KINESIS_LAB.find((d) => d.grupo === sinonimos[chave]) || null;
  return KINESIS_LAB.find((d) => g.includes(norm(d.grupo)) || norm(d.grupo).includes(g)) || null;
}

/** Subgrupos de um grupo com nota do APEX (usados no cruzamento com deficits). */
export function subgruposComNotaApex(grupo: string) {
  return (dossieDoGrupo(grupo)?.subgrupos || []).filter((s) => !!s.nota_apex);
}
