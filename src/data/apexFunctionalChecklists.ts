// APEX ASSESSMENT PIPELINE — CAMADA 1B
// Checklist neuromuscular por grupo muscular.
// Cada opção carrega apenas as marcações (flags) que o próprio checklist detecta.
// Nada aqui é estimativa: o que não gera marcação fica sem marcação.

export type ChecklistFlag =
  | "OK"
  | "ATIVACAO"
  | "BIOMECANICO"
  | "VOLUME"
  | "ASSIMETRIA"
  | "DOR"
  | "ENCAMINHAMENTO";

export interface ChecklistOption {
  key: string;
  texto: string;
  flags: ChecklistFlag[];
}

export interface ChecklistQuestion {
  id: string;
  pergunta: string;
  detecta: string;
  opcoes: ChecklistOption[];
}

export interface ChecklistGroup {
  key: string;
  nome: string;
  subgrupos: string[];
  perguntas: ChecklistQuestion[];
}

const o = (key: string, texto: string, flags: ChecklistFlag[] = []): ChecklistOption => ({ key, texto, flags });

export const APEX_CHECKLISTS: ChecklistGroup[] = [
  {
    key: "dorsal",
    nome: "Dorsal (Costas)",
    subgrupos: [
      "Dorsal Superior (Trapézio Médio/Inferior, Romboides)",
      "Dorsal Médio (Latíssimo — porção média)",
      "Dorsal Inferior (Latíssimo — porção inferior, Redondo Maior)",
    ],
    perguntas: [
      {
        id: "D1",
        pergunta: "No pulldown/puxada, onde sente mais?",
        detecta: "Capacidade de ativação do latíssimo",
        opcoes: [
          o("a", "Costas inteiras", ["OK"]),
          o("b", "Mais bíceps que costas", ["ATIVACAO"]),
          o("c", "Mais trapézio superior", ["ATIVACAO", "BIOMECANICO"]),
          o("d", "Não sinto nada definido", ["ATIVACAO"]),
        ],
      },
      {
        id: "D2",
        pergunta: "Consegue fazer retração escapular isolada sem encolher os ombros?",
        detecta: "Controle escapular / romboides",
        opcoes: [
          o("a", "Sim, com facilidade", ["OK"]),
          o("b", "Sim, mas compenso um pouco", ["BIOMECANICO"]),
          o("c", "Não consigo isolar", ["BIOMECANICO", "ATIVACAO"]),
          o("d", "Nunca tentei", ["ATIVACAO"]),
        ],
      },
      {
        id: "D3",
        pergunta: "Na remada, mantém os ombros baixos e puxa com os cotovelos?",
        detecta: "Dominância de trapézio superior vs latíssimo",
        opcoes: [
          o("a", "Sim", ["OK"]),
          o("b", "Ombros sobem involuntariamente", ["BIOMECANICO"]),
          o("c", "Puxo mais com os braços", ["ATIVACAO"]),
          o("d", "Não sei avaliar", ["ATIVACAO"]),
        ],
      },
      {
        id: "D4",
        pergunta: "Consegue fazer scapular pull-up (só o movimento escapular na barra)?",
        detecta: "Ativação do latíssimo inferior em alongamento",
        opcoes: [
          o("a", "Sim, controle total", ["OK"]),
          o("b", "Parcialmente", ["ATIVACAO"]),
          o("c", "Não consigo", ["ATIVACAO"]),
          o("d", "Nunca tentei", ["ATIVACAO"]),
        ],
      },
      {
        id: "D5",
        pergunta: "Sente diferença de contração entre lado direito e esquerdo das costas?",
        detecta: "Assimetria neuromuscular",
        opcoes: [
          o("a", "Não, simétrico", ["OK"]),
          o("b", "Lado direito mais forte", ["ASSIMETRIA"]),
          o("c", "Lado esquerdo mais forte", ["ASSIMETRIA"]),
          o("d", "Não consigo sentir nenhum dos lados", ["ATIVACAO"]),
        ],
      },
      {
        id: "D6",
        pergunta: "No final de um treino de costas pesado, qual região fica mais fadigada?",
        detecta: "Padrão de recrutamento dominante",
        opcoes: [
          o("a", "Costas inteiras", ["OK"]),
          o("b", "Bíceps", ["ATIVACAO"]),
          o("c", "Trapézio/pescoço", ["BIOMECANICO"]),
          o("d", "Lombar", ["BIOMECANICO"]),
        ],
      },
      {
        id: "D7",
        pergunta: "Na pose de duplo bíceps de costas, contrai o dorsal voluntariamente?",
        detecta: "Conexão mente-músculo",
        opcoes: [
          o("a", "Sim, contração forte e visível", ["OK"]),
          o("b", "Consigo contrair mas é fraco", ["ATIVACAO"]),
          o("c", "Não consigo contrair voluntariamente", ["ATIVACAO"]),
          o("d", "Nunca tentei", ["ATIVACAO"]),
        ],
      },
    ],
  },
  {
    key: "peitoral",
    nome: "Peitoral",
    subgrupos: [
      "Peitoral Superior (Clavicular)",
      "Peitoral Médio (Esternal)",
      "Peitoral Inferior (Costal/Abdominal)",
    ],
    perguntas: [
      {
        id: "P1",
        pergunta: "No supino reto, onde sente mais o trabalho?",
        detecta: "Ativação peitoral vs compensação",
        opcoes: [
          o("a", "Peito inteiro", ["OK"]),
          o("b", "Mais ombros (deltóide anterior)", ["ATIVACAO", "BIOMECANICO"]),
          o("c", "Mais tríceps", ["ATIVACAO"]),
          o("d", "Não sinto peito definido", ["ATIVACAO"]),
        ],
      },
      {
        id: "P2",
        pergunta: "Na adução horizontal do braço, sente o peitoral contrair forte?",
        detecta: "Conexão mente-músculo",
        opcoes: [
          o("a", "Sim, contração clara", ["OK"]),
          o("b", "Sinto mas é fraco", ["ATIVACAO"]),
          o("c", "Não sinto peitoral", ["ATIVACAO"]),
          o("d", "Nunca testei", ["ATIVACAO"]),
        ],
      },
      {
        id: "P3",
        pergunta: "No crucifixo/fly, sente mais o peitoral ou o deltóide anterior?",
        detecta: "Padrão de recrutamento em alongamento",
        opcoes: [
          o("a", "Peitoral dominante", ["OK"]),
          o("b", "50/50", ["ATIVACAO"]),
          o("c", "Mais ombro", ["ATIVACAO", "BIOMECANICO"]),
          o("d", "Mais alongamento que contração", ["ATIVACAO"]),
        ],
      },
      {
        id: "P4",
        pergunta: "O peitoral superior tem volume visível abaixo da clavícula?",
        detecta: "Desenvolvimento da porção clavicular",
        opcoes: [
          o("a", "Volume visível no peitoral superior", ["OK"]),
          o("b", "Um pouco, mas poderia ser mais", ["VOLUME"]),
          o("c", "Praticamente reto/flat", ["VOLUME"]),
          o("d", "Não sei avaliar"),
        ],
      },
      {
        id: "P5",
        pergunta: "No supino inclinado, sente que trabalha mais que no reto?",
        detecta: "Capacidade de recrutar a porção clavicular",
        opcoes: [
          o("a", "Sim, sinto mais o peitoral superior", ["OK"]),
          o("b", "Não sinto diferença", ["ATIVACAO"]),
          o("c", "Sinto mais o ombro no inclinado", ["BIOMECANICO"]),
          o("d", "Não faço inclinado", ["VOLUME"]),
        ],
      },
      {
        id: "P6",
        pergunta: "Sente assimetria entre peitoral direito e esquerdo?",
        detecta: "Assimetria",
        opcoes: [
          o("a", "Simétricos", ["OK"]),
          o("b", "Direito maior/mais forte", ["ASSIMETRIA"]),
          o("c", "Esquerdo maior/mais forte", ["ASSIMETRIA"]),
          o("d", "Não sei avaliar"),
        ],
      },
      {
        id: "P7",
        pergunta: "Na pose most muscular ou side chest, contrai o peitoral voluntariamente?",
        detecta: "Controle voluntário",
        opcoes: [
          o("a", "Sim, contração forte", ["OK"]),
          o("b", "Consigo mas fraco", ["ATIVACAO"]),
          o("c", "Não consigo isolar", ["ATIVACAO"]),
          o("d", "Nunca tentei", ["ATIVACAO"]),
        ],
      },
    ],
  },
  {
    key: "deltoides",
    nome: "Deltóides (Ombros)",
    subgrupos: ["Deltóide Anterior", "Deltóide Lateral (Medial)", "Deltóide Posterior"],
    perguntas: [
      {
        id: "O1",
        pergunta: "Na elevação lateral, sente mais o ombro lateral ou o trapézio superior subindo?",
        detecta: "Ativação do deltóide lateral vs compensação de trapézio",
        opcoes: [
          o("a", "Ombro lateral claro", ["OK"]),
          o("b", "Ombro + trapézio juntos", ["BIOMECANICO"]),
          o("c", "Mais trapézio", ["BIOMECANICO", "ATIVACAO"]),
          o("d", "Não sei diferenciar", ["ATIVACAO"]),
        ],
      },
      {
        id: "O2",
        pergunta: "Consegue parar a elevação lateral a 60-70° sem encolher os ombros?",
        detecta: "Controle glenoumeral vs compensação",
        opcoes: [
          o("a", "Sim, controle total", ["OK"]),
          o("b", "Ombro sobe um pouco", ["BIOMECANICO"]),
          o("c", "Impossível sem encolher", ["BIOMECANICO"]),
          o("d", "Nunca prestei atenção", ["ATIVACAO"]),
        ],
      },
      {
        id: "O3",
        pergunta: "O deltóide posterior tem volume visível na vista lateral?",
        detecta: "Desenvolvimento do posterior",
        opcoes: [
          o("a", "Sim, redondo e projetado", ["OK"]),
          o("b", "Algum volume", ["VOLUME"]),
          o("c", "Praticamente flat", ["VOLUME"]),
          o("d", "Não sei avaliar"),
        ],
      },
      {
        id: "O4",
        pergunta: "No rear delt fly/face pull, sente o posterior do ombro ou mais costas/trapézio?",
        detecta: "Ativação do deltóide posterior",
        opcoes: [
          o("a", "Deltóide posterior claro", ["OK"]),
          o("b", "Mistura de posterior e costas", ["ATIVACAO"]),
          o("c", "Mais costas/trapézio", ["ATIVACAO", "BIOMECANICO"]),
          o("d", "Não sinto nada definido", ["ATIVACAO"]),
        ],
      },
      {
        id: "O5",
        pergunta: "Sente dor ou impingement no ombro no supino ou desenvolvimento?",
        detecta: "Saúde articular / possível impingement",
        opcoes: [
          o("a", "Nunca", ["OK"]),
          o("b", "Às vezes, leve", ["DOR"]),
          o("c", "Frequentemente", ["DOR", "BIOMECANICO", "ENCAMINHAMENTO"]),
          o("d", "Sempre, preciso evitar certos ângulos", ["DOR", "BIOMECANICO", "ENCAMINHAMENTO"]),
        ],
      },
      {
        id: "O6",
        pergunta: "Os ombros caem para frente (protração) na postura natural?",
        detecta: "Postura escapular / encurtamento de peitoral menor",
        opcoes: [
          o("a", "Não, ombros neutros", ["OK"]),
          o("b", "Levemente pra frente", ["BIOMECANICO"]),
          o("c", "Visivelmente protraídos", ["BIOMECANICO"]),
          o("d", "Não sei avaliar"),
        ],
      },
    ],
  },
  {
    key: "gluteos",
    nome: "Glúteos",
    subgrupos: ["Glúteo Máximo", "Glúteo Médio", "Glúteo Mínimo (estabilização)"],
    perguntas: [
      {
        id: "G1",
        pergunta: "No agachamento, sente mais quadríceps ou glúteos trabalhando?",
        detecta: "Padrão de recrutamento no agachamento",
        opcoes: [
          o("a", "Glúteos dominantes", ["OK"]),
          o("b", "50/50"),
          o("c", "Mais quadríceps", ["ATIVACAO"]),
          o("d", "Não sinto glúteos", ["ATIVACAO"]),
        ],
      },
      {
        id: "G2",
        pergunta: "Contrai o glúteo máximo voluntariamente estando em pé?",
        detecta: "Conexão mente-músculo / amnésia glútea",
        opcoes: [
          o("a", "Sim, contração forte bilateral", ["OK"]),
          o("b", "Sim, mas um lado mais fraco", ["ASSIMETRIA"]),
          o("c", "Contração fraca", ["ATIVACAO"]),
          o("d", "Não consigo ativar voluntariamente", ["ATIVACAO"]),
        ],
      },
      {
        id: "G3",
        pergunta: "No hip thrust, sente mais glúteos ou posterior de coxa/lombar?",
        detecta: "Ativação específica em extensão de quadril",
        opcoes: [
          o("a", "Glúteos dominantes", ["OK"]),
          o("b", "Mistura glúteo + posterior"),
          o("c", "Mais posterior de coxa", ["ATIVACAO"]),
          o("d", "Mais lombar", ["BIOMECANICO", "ATIVACAO"]),
        ],
      },
      {
        id: "G4",
        pergunta: "Ao subir escadas ou fazer step-up, sente os glúteos ativando?",
        detecta: "Ativação funcional em cadeia cinética fechada",
        opcoes: [
          o("a", "Sim, claramente", ["OK"]),
          o("b", "Um pouco"),
          o("c", "Só quadríceps", ["ATIVACAO"]),
          o("d", "Não presto atenção"),
        ],
      },
      {
        id: "G5",
        pergunta: "Tem padrão de joelho valgo (joelhos pra dentro) no agachamento?",
        detecta: "Fraqueza de glúteo médio / rotadores externos",
        opcoes: [
          o("a", "Não, joelhos alinhados", ["OK"]),
          o("b", "Leve valgo", ["BIOMECANICO"]),
          o("c", "Valgo visível", ["BIOMECANICO"]),
          o("d", "Não sei avaliar"),
        ],
      },
      {
        id: "G6",
        pergunta: "Sente diferença de tamanho ou força entre glúteo direito e esquerdo?",
        detecta: "Assimetria",
        opcoes: [
          o("a", "Simétricos", ["OK"]),
          o("b", "Direito maior", ["ASSIMETRIA"]),
          o("c", "Esquerdo maior", ["ASSIMETRIA"]),
          o("d", "Não sei"),
        ],
      },
      {
        id: "G7",
        pergunta: "Tem anteriorização pélvica (lordose acentuada com pelve rodada à frente)?",
        detecta: "Tilt pélvico afetando recrutamento",
        opcoes: [
          o("a", "Não, pelve neutra", ["OK"]),
          o("b", "Leve anteriorização", ["BIOMECANICO"]),
          o("c", "Anteriorização visível", ["BIOMECANICO"]),
          o("d", "Não sei avaliar"),
        ],
      },
    ],
  },
  {
    key: "posterior_coxa",
    nome: "Posterior de Coxa (Isquiotibiais)",
    subgrupos: ["Bíceps Femoral (cabeça longa e curta)", "Semitendíneo", "Semimembranáceo"],
    perguntas: [
      {
        id: "IC1",
        pergunta: "Treina posterior de coxa com exercícios específicos (stiff, leg curl, nordic)?",
        detecta: "Volume de treino dedicado",
        opcoes: [
          o("a", "Sim, 2+ exercícios por semana", ["OK"]),
          o("b", "1 exercício por semana"),
          o("c", "Raramente", ["VOLUME"]),
          o("d", "Nunca", ["VOLUME"]),
        ],
      },
      {
        id: "IC2",
        pergunta: "No stiff/RDL, sente o alongamento do posterior ou a lombar sobrecarregando?",
        detecta: "Padrão de hip hinge",
        opcoes: [
          o("a", "Posterior de coxa dominante", ["OK"]),
          o("b", "Mistura posterior + lombar", ["BIOMECANICO"]),
          o("c", "Mais lombar", ["BIOMECANICO"]),
          o("d", "Não sinto posterior", ["ATIVACAO"]),
        ],
      },
      {
        id: "IC3",
        pergunta: "No leg curl, contrai forte no pico e segura 2 segundos?",
        detecta: "Força concêntrica e controle do pico",
        opcoes: [
          o("a", "Sim, contração forte", ["OK"]),
          o("b", "Consigo mas fraco", ["ATIVACAO"]),
          o("c", "Câimbra ou não consigo manter", ["ATIVACAO"]),
          o("d", "Não faço leg curl", ["VOLUME"]),
        ],
      },
      {
        id: "IC4",
        pergunta: "Já teve lesão ou desconforto no posterior de coxa?",
        detecta: "Histórico de lesão / vulnerabilidade",
        opcoes: [
          o("a", "Nunca", ["OK"]),
          o("b", "Uma vez, resolvido"),
          o("c", "Recorrente", ["DOR", "ENCAMINHAMENTO"]),
          o("d", "Atualmente com desconforto", ["DOR", "ENCAMINHAMENTO"]),
        ],
      },
      {
        id: "IC5",
        pergunta: "Consegue tocar as mãos no chão com pernas estendidas?",
        detecta: "Flexibilidade / encurtamento",
        opcoes: [
          o("a", "Sim, palmas no chão", ["OK"]),
          o("b", "Pontas dos dedos"),
          o("c", "Só até a canela", ["BIOMECANICO"]),
          o("d", "Mal passo do joelho", ["BIOMECANICO"]),
        ],
      },
      {
        id: "IC6",
        pergunta: "No agachamento profundo, sente o posterior de coxa participando?",
        detecta: "Participação excêntrica no agachamento",
        opcoes: [
          o("a", "Posterior participa", ["OK"]),
          o("b", "Não sinto posterior no agachamento", ["ATIVACAO"]),
          o("c", "Nunca prestei atenção", ["ATIVACAO"]),
        ],
      },
    ],
  },
  {
    key: "quadriceps",
    nome: "Quadríceps",
    subgrupos: ["Reto Femoral", "Vasto Lateral", "Vasto Medial (VMO)", "Vasto Intermédio"],
    perguntas: [
      {
        id: "Q1",
        pergunta: "No leg press ou agachamento, sente o quadríceps inteiro ou mais a parte externa?",
        detecta: "Distribuição de recrutamento",
        opcoes: [
          o("a", "Quadríceps inteiro uniforme", ["OK"]),
          o("b", "Mais vasto lateral (externo)"),
          o("c", "Mais reto femoral (frente)"),
          o("d", "Não sei diferenciar", ["ATIVACAO"]),
        ],
      },
      {
        id: "Q2",
        pergunta: "O VMO (gota acima do joelho, lado interno) é visível com a perna contraída?",
        detecta: "Desenvolvimento do vasto medial",
        opcoes: [
          o("a", "Sim, bem definido", ["OK"]),
          o("b", "Algum volume", ["VOLUME"]),
          o("c", "Praticamente inexistente", ["VOLUME", "ATIVACAO"]),
          o("d", "Não sei onde fica", ["ATIVACAO"]),
        ],
      },
      {
        id: "Q3",
        pergunta: "Sente dor no joelho ao agachar profundo ou descer escadas?",
        detecta: "Saúde patelar / relação VMO:VL",
        opcoes: [
          o("a", "Nunca", ["OK"]),
          o("b", "Às vezes", ["DOR"]),
          o("c", "Frequentemente", ["DOR", "ENCAMINHAMENTO"]),
          o("d", "Sempre", ["DOR", "ENCAMINHAMENTO"]),
        ],
      },
      {
        id: "Q4",
        pergunta: "Na cadeira extensora, mantém a contração máxima no topo por 3 segundos?",
        detecta: "Força isométrica em extensão total",
        opcoes: [
          o("a", "Sim, contração forte", ["OK"]),
          o("b", "Consigo mas treme", ["ATIVACAO"]),
          o("c", "Não consigo manter", ["ATIVACAO"]),
          o("d", "Não faço extensora", ["VOLUME"]),
        ],
      },
      {
        id: "Q5",
        pergunta: "Sente assimetria de força ou tamanho entre quadríceps direito e esquerdo?",
        detecta: "Assimetria",
        opcoes: [
          o("a", "Simétricos", ["OK"]),
          o("b", "Direito mais forte", ["ASSIMETRIA"]),
          o("c", "Esquerdo mais forte", ["ASSIMETRIA"]),
          o("d", "Não sei"),
        ],
      },
      {
        id: "Q6",
        pergunta: "Ao contrair o quadríceps em pé, a contração é visível e forte?",
        detecta: "Controle voluntário",
        opcoes: [
          o("a", "Sim, separação visível", ["OK"]),
          o("b", "Contrai mas sem definição", ["ATIVACAO"]),
          o("c", "Não consigo contrair forte", ["ATIVACAO"]),
          o("d", "Nunca tentei", ["ATIVACAO"]),
        ],
      },
    ],
  },
  {
    key: "biceps",
    nome: "Bíceps",
    subgrupos: ["Bíceps Braquial (cabeça longa e curta)", "Braquial", "Braquiorradial"],
    perguntas: [
      {
        id: "B1",
        pergunta: "Na rosca direta, sente o bíceps inteiro ou mais uma porção?",
        detecta: "Distribuição de recrutamento",
        opcoes: [
          o("a", "Bíceps inteiro", ["OK"]),
          o("b", "Mais a parte interna"),
          o("c", "Mais a parte externa"),
          o("d", "Mais o antebraço", ["ATIVACAO"]),
        ],
      },
      {
        id: "B2",
        pergunta: "O bíceps tem pico (peak) visível ao flexionar?",
        detecta: "Desenvolvimento da cabeça longa",
        opcoes: [
          o("a", "Pico pronunciado", ["OK"]),
          o("b", "Algum pico", ["VOLUME"]),
          o("c", "Redondo sem pico", ["VOLUME"]),
          o("d", "Flat / não vejo pico", ["VOLUME"]),
        ],
      },
      {
        id: "B3",
        pergunta: "No treino de costas, os bíceps fadigam antes das costas?",
        detecta: "Dominância de bíceps em puxadas",
        opcoes: [
          o("a", "Não, costas fadigam primeiro", ["OK"]),
          o("b", "Às vezes"),
          o("c", "Sempre, bíceps limita o treino de costas", ["BIOMECANICO"]),
          o("d", "Não sei"),
        ],
      },
      {
        id: "B4",
        pergunta: "Na rosca com supinação consciente, sente diferença?",
        detecta: "Recrutamento da cabeça curta via supinação",
        opcoes: [
          o("a", "Sim, sinto mais o bíceps com supinação", ["OK"]),
          o("b", "Não sinto diferença", ["ATIVACAO"]),
          o("c", "Nunca tentei", ["ATIVACAO"]),
        ],
      },
      {
        id: "B5",
        pergunta: "Sente assimetria entre bíceps direito e esquerdo?",
        detecta: "Assimetria",
        opcoes: [
          o("a", "Simétricos", ["OK"]),
          o("b", "Direito maior", ["ASSIMETRIA"]),
          o("c", "Esquerdo maior", ["ASSIMETRIA"]),
          o("d", "Não sei"),
        ],
      },
    ],
  },
  {
    key: "triceps",
    nome: "Tríceps",
    subgrupos: ["Cabeça Longa", "Cabeça Lateral", "Cabeça Medial"],
    perguntas: [
      {
        id: "T1",
        pergunta: "No tríceps pulley, sente a contração mais na parte de fora ou de trás do braço?",
        detecta: "Cabeça lateral vs cabeça longa",
        opcoes: [
          o("a", "Parte lateral (de fora)"),
          o("b", "Parte posterior (de trás)"),
          o("c", "Igual", ["OK"]),
          o("d", "Não sei diferenciar", ["ATIVACAO"]),
        ],
      },
      {
        id: "T2",
        pergunta: "O tríceps tem a ferradura (separação entre cabeças) visível?",
        detecta: "Desenvolvimento equilibrado das 3 cabeças",
        opcoes: [
          o("a", "Sim, separação clara", ["OK"]),
          o("b", "Alguma definição", ["VOLUME"]),
          o("c", "Sem separação visível", ["VOLUME"]),
          o("d", "Não sei avaliar"),
        ],
      },
      {
        id: "T3",
        pergunta: "Na extensão overhead, sente a cabeça longa do tríceps?",
        detecta: "Ativação da cabeça longa",
        opcoes: [
          o("a", "Sim, contração e alongamento claros", ["OK"]),
          o("b", "Sinto mas é leve", ["ATIVACAO"]),
          o("c", "Mais ombro/desconforto", ["BIOMECANICO", "DOR"]),
          o("d", "Não faço overhead", ["VOLUME"]),
        ],
      },
      {
        id: "T4",
        pergunta: "No supino fechado, o tríceps domina o movimento?",
        detecta: "Recrutamento do tríceps em multiarticular",
        opcoes: [
          o("a", "Sim, tríceps claro", ["OK"]),
          o("b", "Mistura tríceps + peito"),
          o("c", "Mais peito/ombro", ["ATIVACAO"]),
          o("d", "Não faço", ["VOLUME"]),
        ],
      },
      {
        id: "T5",
        pergunta: "Sente assimetria entre tríceps direito e esquerdo?",
        detecta: "Assimetria",
        opcoes: [
          o("a", "Simétricos", ["OK"]),
          o("b", "Direito maior", ["ASSIMETRIA"]),
          o("c", "Esquerdo maior", ["ASSIMETRIA"]),
          o("d", "Não sei"),
        ],
      },
    ],
  },
  {
    key: "panturrilha",
    nome: "Panturrilha",
    subgrupos: ["Gastrocnêmio (cabeça medial e lateral)", "Sóleo"],
    perguntas: [
      {
        id: "PA1",
        pergunta: "Treina panturrilha com exercícios específicos regularmente?",
        detecta: "Volume de treino",
        opcoes: [
          o("a", "Sim, 2+ vezes por semana", ["OK"]),
          o("b", "1 vez por semana"),
          o("c", "Raramente", ["VOLUME"]),
          o("d", "Nunca", ["VOLUME"]),
        ],
      },
      {
        id: "PA2",
        pergunta: "Na panturrilha em pé, sobe até a extensão máxima e segura 2s?",
        detecta: "Força concêntrica e amplitude do gastrocnêmio",
        opcoes: [
          o("a", "Sim, contração forte", ["OK"]),
          o("b", "Sobe mas não consegue manter", ["ATIVACAO"]),
          o("c", "Amplitude limitada", ["BIOMECANICO"]),
          o("d", "Não faço", ["VOLUME"]),
        ],
      },
      {
        id: "PA3",
        pergunta: "Na panturrilha sentado, sente diferença comparado à em pé?",
        detecta: "Ativação do sóleo",
        opcoes: [
          o("a", "Sim, sinto mais profundo (sóleo)", ["OK"]),
          o("b", "Não sinto diferença", ["ATIVACAO"]),
          o("c", "Não faço sentado", ["VOLUME"]),
          o("d", "Nunca comparei"),
        ],
      },
      {
        id: "PA4",
        pergunta: "A panturrilha tem formato/volume visível?",
        detecta: "Desenvolvimento visual",
        opcoes: [
          o("a", "Volume bom bilateral", ["OK"]),
          o("b", "Algum volume", ["VOLUME"]),
          o("c", "Praticamente sem volume", ["VOLUME"]),
          o("d", "Assimétrica", ["ASSIMETRIA"]),
        ],
      },
      {
        id: "PA5",
        pergunta: "Sente diferença de tamanho entre panturrilha direita e esquerda?",
        detecta: "Assimetria",
        opcoes: [
          o("a", "Simétricas", ["OK"]),
          o("b", "Direita maior", ["ASSIMETRIA"]),
          o("c", "Esquerda maior", ["ASSIMETRIA"]),
          o("d", "Não sei"),
        ],
      },
    ],
  },
  {
    key: "core",
    nome: "Abdômen / Core",
    subgrupos: [
      "Reto Abdominal (superior e inferior)",
      "Oblíquos (interno e externo)",
      "Transverso Abdominal",
    ],
    perguntas: [
      {
        id: "A1",
        pergunta: "Quanto tempo sustenta a prancha com boa forma?",
        detecta: "Resistência do core / transverso",
        opcoes: [
          o("a", "60s+ sem tremer", ["OK"]),
          o("b", "30-60s"),
          o("c", "Menos de 30s", ["ATIVACAO"]),
          o("d", "Não consigo manter", ["ATIVACAO"]),
        ],
      },
      {
        id: "A2",
        pergunta: "No crunch, sente mais a parte superior ou inferior do abdômen?",
        detecta: "Padrão de recrutamento",
        opcoes: [
          o("a", "Superior claro"),
          o("b", "Inferior claro"),
          o("c", "Inteiro", ["OK"]),
          o("d", "Mais flexor de quadril que abdômen", ["BIOMECANICO", "ATIVACAO"]),
        ],
      },
      {
        id: "A3",
        pergunta: "Consegue fazer vacuum abdominal e manter?",
        detecta: "Ativação do transverso",
        opcoes: [
          o("a", "Sim, 15s+", ["OK"]),
          o("b", "Sim, mas pouco tempo", ["ATIVACAO"]),
          o("c", "Não consigo", ["ATIVACAO"]),
          o("d", "Nunca tentei", ["ATIVACAO"]),
        ],
      },
      {
        id: "A4",
        pergunta: "O abdômen tem separação visível dos gomos (com BF% adequado)?",
        detecta: "Desenvolvimento do reto abdominal",
        opcoes: [
          o("a", "Sim, 6-pack visível", ["OK"]),
          o("b", "Parte superior visível", ["VOLUME"]),
          o("c", "Sem separação", ["VOLUME"]),
          o("d", "BF% muito alto pra avaliar"),
        ],
      },
      {
        id: "A5",
        pergunta: "Sente os oblíquos trabalhando em exercícios rotacionais?",
        detecta: "Ativação de oblíquos",
        opcoes: [
          o("a", "Sim, contração clara", ["OK"]),
          o("b", "Pouco", ["ATIVACAO"]),
          o("c", "Não sinto", ["ATIVACAO"]),
          o("d", "Não faço rotacionais", ["VOLUME"]),
        ],
      },
      {
        id: "A6",
        pergunta: "Tem diástase abdominal (separação do reto abdominal)?",
        detecta: "Integridade estrutural",
        opcoes: [
          o("a", "Não", ["OK"]),
          o("b", "Não sei"),
          o("c", "Sim, leve", ["ENCAMINHAMENTO"]),
          o("d", "Sim, significativa", ["ENCAMINHAMENTO"]),
        ],
      },
    ],
  },
];

export const APEX_CHECKLIST_BY_KEY: Record<string, ChecklistGroup> = Object.fromEntries(
  APEX_CHECKLISTS.map((g) => [g.key, g]),
);
