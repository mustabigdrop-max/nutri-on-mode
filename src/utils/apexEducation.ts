// APEX Visual Intelligence — Conteúdo educativo
// Transforma achados técnicos em linguagem coach-atleta em 3 níveis.

export interface EducationContent {
  o_que_e: {
    titulo: string;
    texto: string;
    analogia: string;
  };
  por_que_importa: {
    impacto_visual: string;
    impacto_palco: string;
    impacto_saude: string;
  };
  o_que_muda: {
    no_treino: string;
    tempo_medio: string;
    resultado: string;
  };
  sabia_que: string;
}

export const EDUCATION_CONTENT: Record<string, EducationContent> = {
  scapula_alada: {
    o_que_e: {
      titulo: "Escápula alada — a omoplata saindo para fora",
      texto:
        "A sua omoplata (o osso triangular das costas) não está \"colada\" perfeitamente no tórax. " +
        "Ela se afasta levemente — especialmente quando você levanta os braços ou empurra algo.",
      analogia:
        "Imagine um livro encostado na parede. A escápula alada é quando esse livro fica com a borda saindo da parede em vez de ficar flat.",
    },
    por_que_importa: {
      impacto_visual:
        "Nas costas você consegue ver a borda da omoplata \"saltando\" para fora, especialmente quando os braços estão elevados.",
      impacto_palco:
        "Na pose de costas do Classic Physique, o juiz vê a escápula projetada — isso rompe a linha limpa das costas e reduz a aparência do V-taper.",
      impacto_saude:
        "Com a escápula instável, o ombro fica sobrecarregado e o risco de impacto subacromial aumenta — especialmente em exercícios acima da cabeça.",
    },
    o_que_muda: {
      no_treino:
        "Exercícios específicos de serrátil anterior entram no aquecimento: serrátil press na parede, wall slides e straight arm pulldown. O TrainingON já ajustou seu protocolo.",
      tempo_medio: "6 a 12 semanas de trabalho específico para redução visual significativa.",
      resultado: "Costas mais planas e simétricas, ombros mais estáveis e V-taper mais limpo.",
    },
    sabia_que:
      "O serrátil anterior — músculo responsável por \"colar\" a escápula — é chamado de \"músculo do boxeador\" porque é muito ativo em socos. Atletas que não treinam puxadas e só fazem supino tendem a ter esse músculo fraco.",
  },

  shoulder_asymmetry: {
    o_que_e: {
      titulo: "Ombros em alturas diferentes",
      texto:
        "Um dos seus ombros está posicionado mais alto que o outro. Isso acontece porque o músculo trapézio de um lado está mais tenso e encurtado, puxando o ombro para cima.",
      analogia:
        "Imagine segurar uma mochila pesada sempre do mesmo lado — o ombro desse lado vai subindo com o tempo. É exatamente o que acontece quando um lado fica mais tenso que o outro.",
    },
    por_que_importa: {
      impacto_visual:
        "Olhando de frente ou de costas, um ombro aparece mais alto, criando uma linha inclinada nos ombros em vez de uma linha horizontal.",
      impacto_palco:
        "Em todas as poses — frente, costas e lateral — a assimetria é visível. Os juízes do Classic Physique avaliam simetria bilateral como critério principal.",
      impacto_saude:
        "O ombro mais elevado sobrecarrega a região cervical do mesmo lado, podendo causar tensão no pescoço e dores de cabeça tensionais.",
    },
    o_que_muda: {
      no_treino:
        "Exercícios unilaterais para o lado mais baixo: elevação lateral com cabo e shrug unilateral. Alongamento do trapézio superior do lado mais alto antes de cada treino de ombro.",
      tempo_medio: "8 a 16 semanas para equalização visível.",
      resultado: "Linha de ombros horizontal, simetria melhorada em todas as poses e redução de tensão cervical.",
    },
    sabia_que:
      "A maioria das pessoas tem uma diferença de até 2° entre os ombros — isso é normal. Acima de 5° começa a ser visível em palco. Destros tendem a ter o ombro direito levemente mais elevado por dominância neural.",
  },

  pelvic_tilt: {
    o_que_e: {
      titulo: "Quadril inclinado para um lado",
      texto:
        "Um lado do seu quadril está mais alto que o outro. Isso geralmente acontece porque o glúteo médio de um lado não está ativando bem, deixando o quadril \"cair\" para esse lado.",
      analogia:
        "Pense em uma balança com um lado mais pesado. O quadril funciona igual — quando um lado está fraco, o outro desce. O corpo compensa automaticamente.",
    },
    por_que_importa: {
      impacto_visual:
        "Visto de costas ou de frente, um lado da cintura parece maior e um lado do quadril mais baixo. Cria uma silhueta assimétrica.",
      impacto_palco:
        "Na pose de costas o nivelamento do quadril é avaliado. Em categorias femininas (Bikini, Wellness) isso é especialmente penalizado.",
      impacto_saude:
        "Quadril desnivelado cria padrão de marcha assimétrico e sobrecarga nos joelhos — risco de joelho valgizado e dor lombar crônica do lado mais alto.",
    },
    o_que_muda: {
      no_treino:
        "Exercícios unilaterais para o glúteo médio do lado mais baixo: clamshell, abdução com cabo, agachamento búlgaro. Prioridade no início do treino de pernas.",
      tempo_medio: "6 a 10 semanas para nivelamento visível.",
      resultado: "Quadril nivelado, silhueta mais simétrica e menor risco de lesão no joelho.",
    },
    sabia_que:
      "O glúteo médio é chamado de \"músculo estabilizador da pelve\" — ele é ativado cada vez que você dá um passo. Pessoas sedentárias e atletas que só fazem agachamento raramente o trabalham de forma isolada.",
  },

  lateral_spine_deviation: {
    o_que_e: {
      titulo: "Coluna com leve curvatura lateral",
      texto:
        "Sua coluna vertebral tem uma curvatura leve para um dos lados em vez de seguir uma linha reta de cima a baixo. Pode ser postural (correção fácil) ou estrutural (curvatura do osso mesmo).",
      analogia:
        "Imagine uma torre de blocos — se um bloco do meio estiver torto, toda a torre inclina. Na coluna, um músculo mais tenso de um lado puxa as vértebras naquela direção.",
    },
    por_que_importa: {
      impacto_visual:
        "Vista de costas, a linha da coluna não é perfeitamente reta — ela faz uma curva sutil para um lado, criando uma assimetria no tronco.",
      impacto_palco:
        "O desvio lateral cria assimetria de cintura — um lado parece mais \"cheio\" que o outro, afetando o V-taper e a simetria geral.",
      impacto_saude:
        "Desvios acima de 5° podem indicar escoliose funcional e precisam de avaliação médica. Desvios menores respondem bem ao treino corretivo.",
    },
    o_que_muda: {
      no_treino:
        "Prancha lateral bilateral, Pallof press e exercícios de core anti-rotação. Se desvio for acima de 5°, encaminhar para fisioterapeuta antes de cargas axiais pesadas.",
      tempo_medio: "8 a 16 semanas para desvios funcionais.",
      resultado: "Coluna mais alinhada, cintura mais simétrica e menor risco de lombalgia.",
    },
    sabia_que:
      "Desvios laterais de até 2° são considerados normais e presentes em mais de 60% da população. A linha de prumo do APEX usa C7 e L5 como referência anatômica exata para detectar desvios reais.",
  },

  hyperlordosis: {
    o_que_e: {
      titulo: "Curva lombar exagerada",
      texto:
        "A região lombar da sua coluna (a parte baixa das costas) tem uma curvatura para dentro maior do que o ideal. O glúteo fica \"empurrado para trás\" e o abdômen para frente.",
      analogia:
        "Imagine a posição de quem usa salto alto o dia todo — a lombar vai para frente, o glúteo vai para trás. Hiperlordose é isso se tornando permanente.",
    },
    por_que_importa: {
      impacto_visual:
        "Vista de lado, a lombar parece \"afundada\" e o glúteo excessivamente projetado para trás, mesmo sem muito desenvolvimento muscular.",
      impacto_palco:
        "Na pose lateral do Classic Physique a hiperlordose distorce a linha da coluna e faz o abdômen parecer mais projetado do que deveria.",
      impacto_saude:
        "Compressão das articulações facetárias lombares — causa de lombalgia crônica em atletas que agacham e levantam terra sem correção postural prévia.",
    },
    o_que_muda: {
      no_treino:
        "Ativação de glúteo e abdômen profundo antes de qualquer treino de pernas. Hollowing abdominal, dead bug e alongamento de flexor de quadril no aquecimento obrigatório.",
      tempo_medio: "8 a 12 semanas de consciência postural.",
      resultado: "Lombar mais estável, abdômen mais controlado na pose lateral e redução de dor lombar em cargas pesadas.",
    },
    sabia_que:
      "A hiperlordose é muito mais comum em pessoas que ficam sentadas por longas horas porque o psoas (músculo do quadril) encurta progressivamente. Fisiculturistas que fazem muito leg press sem treinar glúteo também desenvolvem esse padrão.",
  },

  shoulder_protraction: {
    o_que_e: {
      titulo: "Ombros caindo para frente",
      texto:
        "Seus ombros estão posicionados à frente do alinhamento ideal — em vez de ficarem \"para trás e para baixo\", eles avançam. Isso encurta o peitoral menor e enfraquece os rombóides.",
      analogia:
        "É a postura clássica de quem trabalha no computador — ombros arredondados para frente. Em atletas acontece quando o treino de peito é muito maior que o de costas.",
    },
    por_que_importa: {
      impacto_visual:
        "Vista de lado, os ombros aparecem arredondados e caídos para frente. As costas parecem menos largas e o peito menos expandido.",
      impacto_palco:
        "Na pose de frente do Classic Physique os ombros protraídos reduzem a largura aparente dos ombros e diminuem o V-taper visual.",
      impacto_saude:
        "Ombro protraído é o principal fator de risco para síndrome do impacto subacromial — dor no ombro ao levantar o braço.",
    },
    o_que_muda: {
      no_treino:
        "Retração escapular com faixa, face pull e alongamento de peitoral menor antes de cada treino. Aumentar volume de remada vs supino para equilibrar anterior e posterior.",
      tempo_medio: "6 a 10 semanas para melhora visível.",
      resultado: "Postura mais ereta, ombros mais largos na pose frontal e menor risco de lesão no ombro.",
    },
    sabia_que:
      "Para cada 2,5cm de anteriorização da cabeça e ombros, o peso efetivo sobre a coluna cervical aumenta em aproximadamente 4,5kg. Isso explica por que pessoas com postura protraída sempre têm tensão no pescoço e trapézio.",
  },

  forward_head: {
    o_que_e: {
      titulo: "Cabeça avançada para frente",
      texto:
        "Sua cabeça está posicionada à frente do alinhamento ideal — o lóbulo da orelha deveria estar na mesma linha vertical que o ombro. Quanto mais à frente, maior o esforço da musculatura cervical.",
      analogia:
        "Uma cabeça humana pesa em média 5kg. A cada 2,5cm que ela avança, é como se pesasse 4,5kg a mais para os músculos do pescoço sustentar. Com 7cm de avanço — o equivalente a carregar uma melancia no pescoço o dia todo.",
    },
    por_que_importa: {
      impacto_visual:
        "Vista de lado, a cabeça aparece \"pendurada para frente\" em vez de centralizada sobre os ombros.",
      impacto_palco:
        "Na pose lateral o alinhamento da cabeça sobre o corpo é avaliado. Cabeça protraída distorce a linha cervical e a postura geral.",
      impacto_saude:
        "Tensão crônica nos músculos cervicais posteriores, dores de cabeça tensionais e risco aumentado de hérnia cervical em cargas axiais.",
    },
    o_que_muda: {
      no_treino:
        "Chin tuck (retração cervical) 3×10 antes de cada treino. Alongamento de esternocleidomastóideo e escalenos. Fortalecer flexores profundos do pescoço.",
      tempo_medio: "4 a 8 semanas para melhora postural com prática diária.",
      resultado: "Cabeça centrada sobre os ombros, redução de tensão cervical e postura lateral mais alinhada.",
    },
    sabia_que:
      "O uso de celular por mais de 2 horas por dia — olhando para baixo — é o principal causador de anteriorização da cabeça na geração atual. Já existe o termo clínico \"text neck\" para descrever essa condição.",
  },

  knee_valgus: {
    o_que_e: {
      titulo: "Joelhos colapsando para dentro",
      texto:
        "Seus joelhos tendem a ir para dentro durante movimentos como agachamento, subida de escada ou aterrissagem. O glúteo médio não está ativo o suficiente para manter o joelho alinhado sobre o pé.",
      analogia:
        "Imagine um mastro de tenda — se os cabos de um lado estiverem frouxos, o mastro curva para aquele lado. O joelho valgo é o glúteo médio \"frouxo\" deixando o joelho cair para dentro.",
    },
    por_que_importa: {
      impacto_visual:
        "De frente, os joelhos aparecem mais próximos entre si do que os pés, criando um X visual nas pernas.",
      impacto_palco:
        "Na pose de frente e nos quartos de volta o alinhamento dos joelhos é avaliado. Joelhos em X reduzem a aparência de pernas simétricas e desenvolvidas.",
      impacto_saude:
        "Principal fator de risco para lesão do ligamento cruzado anterior (LCA). Também causa desgaste prematuro do menisco medial e condromalácia patelar.",
    },
    o_que_muda: {
      no_treino:
        "Ativação de glúteo médio obrigatória antes de treino de pernas: clamshell, monster walk e abdução com faixa. Agachamento com faixa elástica nos joelhos para propriocepção.",
      tempo_medio: "6 a 12 semanas de ativação específica.",
      resultado: "Joelhos alinhados sobre os pés, agachamento mais profundo e seguro e risco de lesão reduzido.",
    },
    sabia_que:
      "Mulheres têm maior prevalência de joelho valgo que homens por causa do ângulo Q — o ângulo formado entre o quadril e o joelho é maior nas mulheres por causa da largura pélvica. Por isso o trabalho de glúteo médio é ainda mais crítico no público feminino.",
  },
};

// Mapeia chaves de finding do sistema → chaves do conteúdo educativo
const FINDING_TO_EDU: Record<string, string> = {
  shoulder_tilt: "shoulder_asymmetry",
  shoulder_asymmetry: "shoulder_asymmetry",
  hip_tilt: "pelvic_tilt",
  hip_asymmetry: "pelvic_tilt",
  pelvic_tilt: "pelvic_tilt",
  scapular_axis_tilt: "scapula_alada",
  scapular_winging_left: "scapula_alada",
  scapular_winging_right: "scapula_alada",
  spinal_lateral_deviation: "lateral_spine_deviation",
  plumb_line_deviation: "lateral_spine_deviation",
  lumbar_lordosis: "hyperlordosis",
  thoracic_kyphosis: "shoulder_protraction",
  forward_head_posture: "forward_head",
  head_lateral_tilt: "forward_head",
  knee_valgus_left: "knee_valgus",
  knee_valgus_right: "knee_valgus",
};

export function getEducationContent(findingKey: string): EducationContent | null {
  const eduKey = FINDING_TO_EDU[findingKey] ?? findingKey;
  return EDUCATION_CONTENT[eduKey] ?? null;
}
