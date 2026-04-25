// ============================================================
// BANCO DE DADOS LOCAL DE EXERCÍCIOS — SELEÇÃO INTELIGENTE
// ============================================================

export interface ExerciseSubstitute {
  nome: string;
  motivo: string;
  equipamento: string;
}

export interface ExerciseEntry {
  nome: string;
  rank: "🥇" | "🥈";
  execucao: string;
  series: string;
  dicas: string[];
  erros: string[];
  fases: { bulking: string; cutting: string };
  substitutos?: ExerciseSubstitute[];
}

export interface MuscleSubgroup {
  id: string;
  nome: string;
  emoji: string;
  descricao: string;
  funcao: string;
  visual: string;
  nota?: string;
  exercicios: ExerciseEntry[];
}

export interface MuscleGroup {
  id: string;
  nome: string;
  emoji: string;
  vista: "frente" | "costas" | "ambos";
  subgrupos: MuscleSubgroup[];
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  // ===================== COSTAS =====================
  {
    id: "costas", nome: "Costas", emoji: "🔙", vista: "costas",
    subgrupos: [
      {
        id: "trapezio-superior", nome: "Trapézio Superior", emoji: "🔵",
        descricao: "Espessura pescoço/ombro", funcao: "Elevação da escápula",
        visual: "\"Gola\" muscular entre pescoço e ombro",
        nota: "Geralmente hiperativo — supino e press já ativam muito",
        exercicios: [
          { nome: "Shrug com Barra", rank: "🥇",
            execucao: "Barra na frente, pegada pronada. Elevar ombros verticalmente — NÃO girar. Pausa 1-2s no topo. Descida controlada 2-3s.",
            series: "3-4 × 8-12", dicas: ["Carga pesada — trapézio aguenta", "NÃO inclinar o pescoço"],
            erros: ["Rotacionar ombros (mito e lesão)", "Usar o pescoço"], fases: { bulking: "4×6-8 pesado", cutting: "3×15-20 cabo" },
            substitutos: [
              { nome: "Shrug no Smith Machine", motivo: "Mais estabilidade, foco puro no trapézio", equipamento: "Smith Machine" },
              { nome: "Shrug com Trap Bar", motivo: "Pegada neutra, menos stress no ombro", equipamento: "Trap Bar" },
            ] },
          { nome: "Shrug com Halteres", rank: "🥈",
            execucao: "Halteres ao lado do corpo. Maior amplitude que barra. Elevar e pausar.",
            series: "3 × 10-15", dicas: ["Mais fácil manter técnica", "Maior ROM"], erros: ["Usar momentum"], fases: { bulking: "3×10-12", cutting: "3×15" } },
          { nome: "Farmer's Carry", rank: "🥈",
            execucao: "Halteres/kettlebells pesados, caminhar mantendo postura. Ativação isométrica do trapézio.",
            series: "3-4 × 30-40m", dicas: ["Carregamento funcional", "Ombros deprimidos"], erros: ["Inclinar o tronco"], fases: { bulking: "4×40m pesado", cutting: "3×30m" } },
        ]
      },
      {
        id: "trapezio-medio", nome: "Trapézio Médio", emoji: "🟣",
        descricao: "Espessura entre escápulas", funcao: "Retração escapular",
        visual: "Espessura entre as escápulas — postura",
        nota: "Fraco na maioria — causa postura arredondada. PRIORIZAR em cifose.",
        exercicios: [
          { nome: "Face Pull", rank: "🥇",
            execucao: "Polia altura dos olhos. Corda dupla. Cotovelos ACIMA da linha da corda. Puxar até o rosto. Posição W no final. Separar corda ao máximo. Escápulas retraídas. Excêntrico 3s.",
            series: "4 × 15-20", dicas: ["3-4x/semana — preventivo", "Ombros deprimidos sempre"], erros: ["Cotovelos abaixo da corda", "Puxar para o pescoço"],
            fases: { bulking: "4×15-20 3-4x/sem", cutting: "4×15-20 3-4x/sem" } },
          { nome: "Band Pull-Apart", rank: "🥈",
            execucao: "Elástico na frente, puxar até trás do corpo. Cotovelos levemente flexos e fixos.",
            series: "3 × 20-30", dicas: ["Excelente aquecimento diário"], erros: ["Flexionar os cotovelos ativamente"], fases: { bulking: "3×25", cutting: "3×25" } },
        ]
      },
      {
        id: "lat-superior", nome: "Latíssimo Dorso — Superior", emoji: "🔴",
        descricao: "Largura do tronco (axila)", funcao: "Adução horizontal + depressão do ombro",
        visual: "V-shape no topo — largura nas axilas",
        exercicios: [
          { nome: "Puxada Aberta Pronada", rank: "🥇",
            execucao: "Pegada 1.5× largura dos ombros. Inclinar tronco 10-15° para trás. Deprimir escápula ANTES de puxar. Cotovelos puxam para BAIXO e para o LADO. Puxar até queixo/clavícula. Excêntrico 3s com alongamento completo no alto.",
            series: "4 × 6-10", dicas: ["Sente contração ao lado do peito (axila) = certo", "NÃO puxar atrás da cabeça"],
            erros: ["Puxar para trás da cabeça", "Não deprimir escápula antes"], fases: { bulking: "4×6-8 + pull-over cabo 3×12", cutting: "3×10-12" },
            substitutos: [
              { nome: "Barra Fixa (Pull-up)", motivo: "Mesmo padrão, peso corporal + lastro", equipamento: "Barra fixa" },
              { nome: "Puxada com Triângulo", motivo: "Alternativa se não tiver barra longa", equipamento: "Polia alta + triângulo" },
            ] },
          { nome: "Pull-over no Cabo", rank: "🥈",
            execucao: "Braços retos, puxar de cima para baixo. Cotovelos levemente flexos (fixos). Ativa lat em extensão do ombro.",
            series: "3 × 12-15", dicas: ["Excelente isolamento do lat superior"], erros: ["Flexionar cotovelos demais"], fases: { bulking: "3×12", cutting: "3×15" } },
        ]
      },
      {
        id: "lat-inferior", nome: "Latíssimo Dorso — Inferior", emoji: "🟡",
        descricao: "Inserção lombar — V-shape profundo", funcao: "Extensão do ombro + adução",
        visual: "V-shape inferior — inserção lombar",
        exercicios: [
          { nome: "Remada Curvada Cotovelo Aduzido", rank: "🥇",
            execucao: "Tronco 45° com chão. Coluna NEUTRA. Cotovelos PRÓXIMOS ao corpo. 'Encostar cotovelo no bolso de trás'. Puxar ao umbigo. Pausa 2s com cotovelo atrás do tronco.",
            series: "4 × 8-10", dicas: ["Cotovelo aduzido = lat inferior", "Cotovelo para lado = romboides"],
            erros: ["Arredondar coluna", "Cotovelos abertos"], fases: { bulking: "4×6-8 overload", cutting: "3×12-15 cabo" } },
          { nome: "Remada Haltere Unilateral", rank: "🥈",
            execucao: "Maior ROM que barra. Cotovelo rente ao corpo, puxar até quadril. Não rotacionar tronco.",
            series: "4 × 10 cada", dicas: ["Correção de assimetrias", "ROM completa"], erros: ["Rotacionar o tronco"], fases: { bulking: "4×10 cada", cutting: "3×12 cada" } },
        ]
      },
      {
        id: "eretores", nome: "Eretores da Espinha", emoji: "🟦",
        descricao: "Coluna lombar e torácica", funcao: "Extensão e estabilização da coluna",
        visual: "Musculatura paravertebral",
        exercicios: [
          { nome: "Good Morning", rank: "🥇",
            execucao: "Barra nas costas. Dobrar no quadril (hinge). Coluna NEUTRA durante todo o movimento. Retornar contraindo eretores.",
            series: "3 × 10-12", dicas: ["Carga moderada — técnica > carga"], erros: ["Arredondar lombar", "Flexionar joelhos demais"],
            fases: { bulking: "3×10-12", cutting: "3×12-15" } },
          { nome: "Hiperextensão 45°", rank: "🥈",
            execucao: "Banco de hiperextensão. Movimento controlado. Não hiperextender.",
            series: "3 × 12-15", dicas: ["Pode segurar peso no peito para progressão"], erros: ["Hiperextender no topo"],
            fases: { bulking: "3×12 com peso", cutting: "3×15" } },
        ]
      },
    ]
  },
  // ===================== PEITO =====================
  {
    id: "peito", nome: "Peito", emoji: "💪", vista: "frente",
    subgrupos: [
      {
        id: "peitoral-superior", nome: "Peitoral Superior (Clavicular)", emoji: "🔴",
        descricao: "Linha da clavícula — fullness", funcao: "Flexão e adução do ombro (fibras superiores)",
        visual: "\"Shelf\" acima do peito — fullness superior",
        nota: "Ponto mais fraco da maioria",
        exercicios: [
          { nome: "Supino Inclinado 30° Halteres", rank: "🥇",
            execucao: "Banco a 30° exatos (NÃO 45° — muito deltóide). Halteres com convergência natural. Descida com cotovelos a 70° do tronco. ROM completa. Subida convergente. Pausa 1s no estiramento.",
            series: "4 × 8-10", dicas: ["30° é o ângulo ótimo", "Convergir halteres no topo"],
            erros: ["Usar 45° (muito deltóide)", "ROM parcial"], fases: { bulking: "4×8-10 + cabo baixo 3×15", cutting: "3×12-15" },
            substitutos: [
              { nome: "Supino Inclinado Barra", motivo: "Mais overload, ideal para força", equipamento: "Banco inclinado + barra" },
              { nome: "Landmine Press", motivo: "Sem banco, padrão de push angular", equipamento: "Barra + landmine" },
              { nome: "Crossover Cabo Baixo", motivo: "Tensão constante, sem banco", equipamento: "Polia baixa" },
            ] },
          { nome: "Cabo Baixo para Cima (Crossover Inclinado)", rank: "🥈",
            execucao: "Polia no chão. Puxar em diagonal para cima. Tensão constante em todo ROM.",
            series: "3 × 12-15", dicas: ["Superior ao halter para tensão constante"], erros: ["Usar os ombros"],
            fases: { bulking: "3×12-15", cutting: "4×15-20" } },
        ]
      },
      {
        id: "peitoral-medio", nome: "Peitoral Médio (Esternocostal)", emoji: "🟠",
        descricao: "Massa central — o mais visível", funcao: "Adução horizontal do ombro",
        visual: "A massa principal do peito",
        exercicios: [
          { nome: "Supino Reto Halteres", rank: "🥇",
            execucao: "Banco plano. Halteres descem além do peito (maior ROM que barra). Cotovelos 70-75° do tronco. Pausa 1s no estiramento. Convergência no topo.",
            series: "4 × 8-12", dicas: ["Maior ROM que barra", "Não bater halteres no topo"],
            erros: ["Bater halteres", "Cotovelos a 90°"], fases: { bulking: "4×8-10", cutting: "3×12-15" },
            substitutos: [
              { nome: "Supino Reto Barra", motivo: "Mais carga, progressão linear", equipamento: "Barra + banco" },
              { nome: "Floor Press", motivo: "Sem banco, limita ROM, protege ombro", equipamento: "Halteres ou barra" },
              { nome: "Chest Press Máquina", motivo: "Estabilidade total, sem necessidade de spotter", equipamento: "Máquina chest press" },
            ] },
          { nome: "Crossover Cabo Médio", rank: "🥈",
            execucao: "Polias na altura média. Tensão constante em todo o arco. Contrair no centro.",
            series: "3 × 12-15", dicas: ["Tensão constante — superior para hipertrofia"], erros: ["Inclinar demais o tronco"],
            fases: { bulking: "3×12", cutting: "3×15-20" } },
        ]
      },
      {
        id: "peitoral-inferior", nome: "Peitoral Inferior (Abdominal)", emoji: "🟡",
        descricao: "Definição inferior — linha de corte", funcao: "Adução do ombro com extensão",
        visual: "Linha embaixo do peito — dá \"gravidade\" ao peito",
        exercicios: [
          { nome: "Dip (Mergulho) Paralelas", rank: "🥇",
            execucao: "Inclinar tronco 30-45° para FRENTE. Cotovelos ligeiramente abertos. Descer PROFUNDO (90°+). Subir sem travar.",
            series: "4 × 8-12", dicas: ["Tronco inclinado = mais peito", "Adicionar peso se fácil"],
            erros: ["Tronco vertical (vira tríceps)", "ROM parcial"], fases: { bulking: "4×8-12 com peso", cutting: "3×15-20" },
            substitutos: [
              { nome: "Dip na Máquina Gravitron", motivo: "Assistência para quem não faz com peso corporal", equipamento: "Gravitron" },
              { nome: "Decline Push-up", motivo: "Sem equipamento, mesmo padrão", equipamento: "Banco/step" },
            ] },
          { nome: "Cabo Alto para Baixo (Crossover Declinado)", rank: "🥈",
            execucao: "Polia alta. Puxar em diagonal para BAIXO. Mãos cruzando na frente do umbigo.",
            series: "3 × 12-15", dicas: ["Máxima ativação do peitoral inferior"], erros: ["Não cruzar suficiente"],
            fases: { bulking: "3×12", cutting: "3×15-20" } },
        ]
      },
      {
        id: "peitoral-interno", nome: "Peitoral Interno (Separação)", emoji: "🟢",
        descricao: "Separação central no esterno", funcao: "Adução completa do ombro",
        visual: "Linha de separação no centro do peito",
        nota: "Existe debate se é possível isolar — foco na adução COMPLETA",
        exercicios: [
          { nome: "Peck Deck com Pausa Central", rank: "🥇",
            execucao: "Pausar 2-3s quando os braços estão unidos. Imaginar 'esmagar laranja entre as mãos'.",
            series: "3 × 15-20", dicas: ["Pausa longa no centro = chave"], erros: ["Sem pausa no centro"],
            fases: { bulking: "3×15", cutting: "4×20" } },
          { nome: "Cable Crossover com Cruzamento", rank: "🥈",
            execucao: "Cruzar as mãos além da linha do corpo. Alternar qual braço cruza por cima.",
            series: "3 × 12-15", dicas: ["Cruzar além do corpo"], erros: ["Parar antes de cruzar"],
            fases: { bulking: "3×12", cutting: "3×15-20" } },
        ]
      },
    ]
  },
  // ===================== OMBROS =====================
  {
    id: "ombros", nome: "Ombros", emoji: "🎯", vista: "frente",
    subgrupos: [
      {
        id: "deltoide-anterior", nome: "Deltóide Anterior", emoji: "🔵",
        descricao: "Ombro frontal", funcao: "Flexão do ombro",
        visual: "Parte frontal do ombro",
        nota: "GERALMENTE SOBREATIVO — supino + press já ativam muito. Raramente precisa de trabalho direto.",
        exercicios: [
          { nome: "Elevação Frontal Halteres", rank: "🥇",
            execucao: "Halteres à frente, elevar até paralelo. Controlar descida. Volume BAIXO.",
            series: "3 × 12", dicas: ["Volume BAIXO — já sobreativado"], erros: ["Excesso de volume"],
            fases: { bulking: "3×12 se necessário", cutting: "Geralmente dispensável" } },
        ]
      },
      {
        id: "deltoide-medio", nome: "Deltóide Médio (Lateral)", emoji: "🟡",
        descricao: "Largura de ombros — o mais importante", funcao: "Abdução do ombro",
        visual: "\"Bolas de canhão\" — largura de ombros",
        nota: "Só desenvolvido com trabalho direto. Músculo pequeno e teimoso — MUITO VOLUME necessário.",
        exercicios: [
          { nome: "Elevação Lateral com Cabo", rank: "🥇",
            execucao: "Polia no tornozelo. Handle cruzado. Cotovelo 15-20° flexo FIXO. Elevar COTOVELO (não mão). Até paralelo. Excêntrico 3-4s. Pausa 1-2s no topo. SEM balanço.",
            series: "4-5 × 15-20", dicas: ["Cabo > halter: tensão no estiramento", "16-20 séries/semana"],
            erros: ["Elevar a mão em vez do cotovelo", "Balanço do corpo"], fases: { bulking: "4×12-15 pesada + 4×10-12 halter", cutting: "4×15-20" } },
          { nome: "Elevação Lateral Haltere", rank: "🥈",
            execucao: "Inclinar levemente para o lado (apoio). Cotovelo levemente flexo. Até paralelo ao chão.",
            series: "3-4 × 12-15", dicas: ["Inclinação para o lado = mais isolamento"], erros: ["Usar trapézio para elevar"],
            fases: { bulking: "4×10-12", cutting: "3×15-20" } },
        ]
      },
      {
        id: "deltoide-posterior", nome: "Deltóide Posterior", emoji: "🔴",
        descricao: "Ombro posterior — postura", funcao: "Extensão horizontal do ombro",
        visual: "Parte traseira do ombro",
        nota: "FREQUENTEMENTE FRACO — causa lesões e desequilíbrio visual. NUNCA cortar volume.",
        exercicios: [
          { nome: "Face Pull", rank: "🥇",
            execucao: "Mesmo do trapézio médio — ativa ambos. 4×15-20, 3-4x/semana OBRIGATÓRIO.",
            series: "4 × 15-20", dicas: ["Preventivo — nunca cortar", "3-4x/semana em QUALQUER fase"],
            erros: ["Cotovelos abaixo da corda"], fases: { bulking: "4×15-20 4x/sem", cutting: "4×15-20 4x/sem" } },
          { nome: "Rear Delt Fly (Banco Inclinado)", rank: "🥈",
            execucao: "Deitado de bruços no banco inclinado. Braços em arco para o lado. Cotovelo fixo levemente flexo.",
            series: "3 × 15-20", dicas: ["Sem usar o corpo"], erros: ["Usar momentum"],
            fases: { bulking: "3×15-20", cutting: "3×15-20" } },
        ]
      },
    ]
  },
  // ===================== BÍCEPS =====================
  {
    id: "biceps", nome: "Bíceps", emoji: "💪", vista: "frente",
    subgrupos: [
      {
        id: "biceps-longa", nome: "Cabeça Longa (Pico)", emoji: "🔴",
        descricao: "Parte externa — altura do bíceps", funcao: "Flexão de cotovelo + supinação",
        visual: "Pico visual quando contraído",
        exercicios: [
          { nome: "Rosca Inclinada (Incline Curl)", rank: "🥇",
            execucao: "Banco 45-60°. Braços pendurados atrás do corpo. Subir SUPINANDO. Cotovelo NÃO avança. Descer COMPLETAMENTE (máx estiramento). Sem balanço.",
            series: "3-4 × 10-12", dicas: ["Máximo pré-estiramento da cabeça longa", "Nenhum outro exercício estica mais"],
            erros: ["Cotovelo avança", "ROM parcial"], fases: { bulking: "4×10-12", cutting: "3×12-15" } },
          { nome: "Rosca Barra Reta", rank: "🥈",
            execucao: "Cotovelo no lado do corpo. NÃO avançar cotovelo. Supinação no topo.",
            series: "3 × 8-10", dicas: ["Cotovelo fixo ao lado"], erros: ["Usar o corpo para impulso"],
            fases: { bulking: "3×8-10", cutting: "3×12" } },
        ]
      },
      {
        id: "biceps-curta", nome: "Cabeça Curta (Largura)", emoji: "🟠",
        descricao: "Parte interna — espessura", funcao: "Flexão de cotovelo (cotovelo à frente)",
        visual: "Largura/espessura do bíceps",
        exercicios: [
          { nome: "Rosca Scott / Preacher Curl", rank: "🥇",
            execucao: "Apoio no banco scott. Cotovelo fixo à frente. ROM completa (sem hiperestender). Pausa 1s no topo.",
            series: "3 × 10-12", dicas: ["Cotovelo à frente = cabeça curta"], erros: ["Hiperestender no fundo", "Usar impulso"],
            fases: { bulking: "3×10-12", cutting: "3×12-15" } },
          { nome: "Rosca Concentrada", rank: "🥈",
            execucao: "Cotovelo apoiado na coxa interna. Máximo isolamento.",
            series: "3 × 12-15", dicas: ["Isolamento puro"], erros: ["Usar o ombro"],
            fases: { bulking: "3×12", cutting: "3×15" } },
        ]
      },
      {
        id: "braquial", nome: "Braquial (Espessura Base)", emoji: "🟡",
        descricao: "Empurra bíceps para cima", funcao: "Flexão pura de cotovelo (não supina)",
        visual: "Músculo abaixo do bíceps — quando desenvolvido \"levanta\" o bíceps",
        exercicios: [
          { nome: "Rosca Martelo (Hammer Curl)", rank: "🥇",
            execucao: "Pegada neutra (palma para dentro). Braquial + Braquiorradial + Bíceps. Funcional e versátil.",
            series: "3 × 10-12", dicas: ["Mais funcional", "Ativa braquiorradial também"],
            erros: ["Usar momentum"], fases: { bulking: "3×10-12", cutting: "3×12-15" } },
          { nome: "Rosca Pronada (Reverse Curl)", rank: "🥈",
            execucao: "Pegada pronada (palma para baixo). Bíceps desligado. Braquial puro.",
            series: "3 × 10-12", dicas: ["Bíceps desligado — braquial puro"], erros: ["Carga alta demais"],
            fases: { bulking: "3×10-12", cutting: "3×12-15" } },
        ]
      },
    ]
  },
  // ===================== TRÍCEPS =====================
  {
    id: "triceps", nome: "Tríceps", emoji: "🔱", vista: "costas",
    subgrupos: [
      {
        id: "triceps-longa", nome: "Cabeça Longa (Massa)", emoji: "🔴",
        descricao: "Parte interna — maior cabeça (60-70%)", funcao: "Extensão de cotovelo + extensão de ombro",
        visual: "Maior das 3 cabeças — determina o volume total",
        exercicios: [
          { nome: "Francês (Overhead Extension)", rank: "🥇",
            execucao: "Braços elevados acima da cabeça. Cotovelos FIXOS (não abrir). Descer atrás da cabeça. ROM completa (máximo estiramento). Apertar ao subir.",
            series: "4 × 10-12", dicas: ["Braço elevado = máximo estiramento da longa", "ROM completa é chave"],
            erros: ["Abrir cotovelos", "ROM parcial"], fases: { bulking: "4×10 + skullcrusher 3×8", cutting: "3×15 cabo" } },
          { nome: "Tríceps Corda Sobre a Cabeça", rank: "🥈",
            execucao: "Polia baixa, corda. Inclinado para frente. Braços elevados, estender para cima. Tensão constante.",
            series: "3 × 12-15", dicas: ["Tensão constante da cabeça longa"], erros: ["Cotovelos abrem"],
            fases: { bulking: "3×12", cutting: "3×15" } },
        ]
      },
      {
        id: "triceps-lateral", nome: "Cabeça Lateral (Ferradura)", emoji: "🟠",
        descricao: "Parte externa — visual de ferradura", funcao: "Extensão de cotovelo (cotovelo ao lado)",
        visual: "Forma de U invertido (\"horseshoe\")",
        exercicios: [
          { nome: "Tríceps Pulley (Pushdown)", rank: "🥇",
            execucao: "Barra V ou reta. Cotovelos fixos rente ao corpo. Puxar para baixo completamente. Pausa 1-2s. Excêntrico controlado.",
            series: "4 × 12-15", dicas: ["Cotovelos FIXOS", "Contração máxima no baixo"],
            erros: ["Cotovelos sobem", "Usar corpo para ajudar"], fases: { bulking: "4×12 + supino fechado 3×6", cutting: "4×15-20 corda" } },
          { nome: "Tríceps Coice (Kickback)", rank: "🥈",
            execucao: "Tronco inclinado. Cotovelo ao lado do corpo. Estender completamente para trás. Pausa 2s no topo.",
            series: "3 × 12-15", dicas: ["Pausa no topo é essencial"], erros: ["Usar momentum"],
            fases: { bulking: "3×12", cutting: "3×15" } },
        ]
      },
    ]
  },
  // ===================== PERNAS =====================
  {
    id: "pernas", nome: "Pernas", emoji: "🦵", vista: "frente",
    subgrupos: [
      {
        id: "vmo", nome: "Quadríceps VMO (Gota d'Água)", emoji: "🔴",
        descricao: "Acima e medial ao joelho", funcao: "Extensão final do joelho (últimos 30°)",
        visual: "\"Gota\" acima do joelho — saúde e visual",
        nota: "Fraco = joelho valgo + dor patelar",
         exercicios: [
          { nome: "Leg Extension (ROM completa + Pausa 2s)", rank: "🥇",
            execucao: "Movimento COMPLETO. Pausa 2s na extensão TOTAL (no topo). Últimos 30° = máxima ativação VMO. NÃO fazer parcial. Pé neutro — para deslocar para vasto lateral, ponta do pé levemente para DENTRO.",
            series: "3-4 × 12-15", dicas: ["Extensão TOTAL é obrigatória", "Pausa 2s no topo (apertar o quadríceps)", "Ponta do pé p/ dentro = mais vasto lateral"],
            erros: ["ROM parcial (perde o VMO)", "Carga excessiva com compensação", "Sem pausa no topo"], fases: { bulking: "4×12-15", cutting: "3×15-20" } },
          { nome: "Hack Squat Profundo", rank: "🥈",
            execucao: "Descer completamente (90°+). Mais VMO que Leg Press. Pés próximos e paralelos.",
            series: "4 × 10-12", dicas: ["Profundidade é chave", "Pre-exhaust ideal: extensora ANTES da hack squat"], erros: ["Descer pouco"],
            fases: { bulking: "4×10-12", cutting: "3×12-15" } },
          { nome: "Sissy Squat", rank: "🥉",
            execucao: "Em pé, calcanhares elevados. Joelhos avançam à frente enquanto o tronco se inclina para trás (linha reta joelho-quadril-ombro). Descer até quase encostar no chão. Foco máximo nos vastos.",
            series: "3 × 10-15", dicas: ["Isolamento brutal do quadríceps", "Use suporte para equilíbrio", "Excêntrica controlada (3s)"],
            erros: ["Sentar (vira agachamento)", "Calcanhar no chão"], fases: { bulking: "3×10-12", cutting: "3×12-15" } },
        ]
      },
      {
        id: "vasto-lateral", nome: "Quadríceps Lateral (Sweep)", emoji: "🟠",
        descricao: "Curvatura lateral da coxa — o 'sweep'", funcao: "Extensão de joelho (porção lateral)",
        visual: "Curvatura externa da coxa (90% genética, 10% trabalho focado)",
        nota: "Back Squat NÃO é o melhor para sweep — preferir Hack Squat pés fechados (maior impacto direto no vasto lateral, menor envolvimento de glúteo/posterior).",
        exercicios: [
          { nome: "Hack Squat Pés Fechados (Substitui Back Squat)", rank: "🥇",
            execucao: "Pés JUNTOS e paralelos no centro/baixo da plataforma. Joelhos acompanham os pés (avanço permitido). Profundidade abaixo do paralelo. Excêntrica 3s. Substitui o Back Squat para foco em vasto lateral — maior impacto direto, menor compensação de glúteo/posterior.",
            series: "4 × 8-12", dicas: ["Pés FECHADOS = sweep máximo", "Substitui back squat para hipertrofia de vasto lateral", "Joelho à frente é desejado aqui"], erros: ["Pés afastados (perde foco no sweep)", "ROM parcial"],
            fases: { bulking: "4×8-10", cutting: "3×12-15" } },
          { nome: "Búlgaro Passada Curta", rank: "🥈",
            execucao: "Pé traseiro elevado no banco. PASSADA CURTA (pé da frente próximo do banco) = joelho avança = quadríceps/vasto lateral dominante. Tronco vertical. Descer profundo.",
            series: "3 × 10-12 cada", dicas: ["Passada curta = quadríceps", "Passada longa = glúteo (não é o foco aqui)", "Joelho pode passar do pé"],
            erros: ["Passada longa (vira exercício de glúteo)", "Tronco inclinado à frente"], fases: { bulking: "3×10 cada", cutting: "3×12 cada" } },
          { nome: "Leg Press Pés Baixos e Próximos", rank: "🥉",
            execucao: "Pés no centro/baixo da plataforma, próximos. Máxima flexão de joelho.",
            series: "3 × 12-15", dicas: ["Posição dos pés define o estímulo"], erros: ["Pés muito altos na plataforma"],
            fases: { bulking: "3×12", cutting: "3×15" } },
        ]
      },
      {
        id: "isquio-longa", nome: "Isquiotibiais — Cabeça Longa", emoji: "🟡",
        descricao: "Posterior superior", funcao: "Extensão de quadril (hip hinge)",
        visual: "Parte superior da posterior — conexão glúteo",
        exercicios: [
          { nome: "RDL (Romanian Deadlift)", rank: "🥇",
            execucao: "Joelhos 15-20° flexos FIXOS. Quadril empurra para TRÁS (não agachar). Coluna NEUTRA. Descer até sentir estiramento. Subir empurrando chão + avançando quadril.",
            series: "4 × 8-10", dicas: ["Hinge de quadril — não agachamento", "Coluna NEUTRA sempre"],
            erros: ["Arredondar lombar", "Flexionar joelhos demais"], fases: { bulking: "4×8-10", cutting: "3×10-12" },
            substitutos: [
              { nome: "Stiff com Halteres", motivo: "Mais ROM, sem barra", equipamento: "Halteres" },
              { nome: "Good Morning", motivo: "Mesmo padrão hip hinge", equipamento: "Barra" },
              { nome: "Leg Curl Deitado", motivo: "Isolamento se não puder hip hinge", equipamento: "Máquina leg curl" },
            ] },
          { nome: "Nordic Hamstring Curl", rank: "🥈",
            execucao: "Joelhos fixos, descer controlado para o chão. Excêntrico máximo. Progredir gradualmente.",
            series: "3 × 5-8", dicas: ["Reduz lesão de isquio em 50%", "O mais difícil"],
            erros: ["Descer rápido (perder excêntrico)"], fases: { bulking: "3×5-8", cutting: "3×5-8" } },
        ]
      },
      {
        id: "gluteo-max", nome: "Glúteo Máximo", emoji: "🔵",
        descricao: "Maior músculo — volume total", funcao: "Extensão de quadril + retroversão pélvica",
        visual: "O músculo mais subestimado e mais importante",
        exercicios: [
          { nome: "Hip Thrust", rank: "🥇",
            execucao: "Banco na altura dos omoplatas. Pés sob joelhos (90° no topo). RETROVERSÃO PÉLVICA no topo ('enfiar o rabo'). NÃO hiperextender lombar. Pausa 2-3s no TOPO. 'Apertar laranja entre glúteos'.",
            series: "4 × 10-15", dicas: ["Retroversão pélvica = ativa máximo o glúteo", "Pausa no topo é essencial"],
            erros: ["Hiperextender lombar", "Sem retroversão pélvica"], fases: { bulking: "4×8-10 overload", cutting: "4×15-20" },
            substitutos: [
              { nome: "Glute Bridge no Chão", motivo: "Sem banco, mesmo padrão motor", equipamento: "Barra ou haltere" },
              { nome: "Hip Thrust na Máquina", motivo: "Setup mais fácil, carga guiada", equipamento: "Máquina hip thrust" },
              { nome: "Cable Pull-Through", motivo: "Sem banco, tensão constante", equipamento: "Polia baixa" },
            ] },
          { nome: "Agachamento Búlgaro", rank: "🥈",
            execucao: "Pé traseiro elevado. Corpo inclinado para frente. Mais glúteo que agachamento convencional.",
            series: "3 × 10-12 cada", dicas: ["Inclinação para frente = mais glúteo"], erros: ["Tronco muito vertical (vira quad)"],
            fases: { bulking: "3×10 cada", cutting: "3×12-15 cada" } },
        ]
      },
      {
        id: "gluteo-medio", nome: "Glúteo Médio (Lateral)", emoji: "🟣",
        descricao: "Lateral — largura do quadril", funcao: "Abdução + estabilização do quadril",
        visual: "Largura lateral do quadril",
        nota: "Frequentemente fraco — causa valgo de joelho",
        exercicios: [
          { nome: "Abdução no Cabo (Em Pé)", rank: "🥇",
            execucao: "Polia baixa no tornozelo. Elevar perna lateralmente. 90° máximo. Controlar descida.",
            series: "3-4 × 15-20", dicas: ["Tensão constante do cabo"], erros: ["Inclinar o tronco"],
            fases: { bulking: "4×15-20", cutting: "3×15-20" } },
          { nome: "Monster Walk (Elástico)", rank: "🥈",
            execucao: "Elástico acima dos joelhos. Andar lateralmente mantendo tensão.",
            series: "3 × 15 passos cada", dicas: ["Excelente ativação"], erros: ["Passos muito curtos"],
            fases: { bulking: "3×15 cada", cutting: "3×15 cada" } },
        ]
      },
      {
        id: "panturrilha-gastro", nome: "Gastrocnêmio (Barriga)", emoji: "🟤",
        descricao: "Barriga da panturrilha", funcao: "Flexão plantar (joelho estendido)",
        visual: "Volume visível da panturrilha",
        exercicios: [
          { nome: "Panturrilha em Pé (Standing)", rank: "🥇",
            execucao: "Joelho ESTENDIDO = gastrocnêmio ativo. ROM COMPLETA. Pausa 2s no topo. Não quicar no fundo.",
            series: "4 × 12-15 + drop set", dicas: ["ROM completa é tudo", "Drop set final"],
            erros: ["Quicar no fundo (lesão)", "ROM parcial"], fases: { bulking: "4×12-15 + drop", cutting: "4×15-20" } },
        ]
      },
      {
        id: "panturrilha-soleo", nome: "Sóleo (Profunda)", emoji: "⬜",
        descricao: "Panturrilha profunda — fibras tipo I", funcao: "Flexão plantar (joelho flexionado)",
        visual: "Profundidade da panturrilha",
        exercicios: [
          { nome: "Panturrilha Sentado (Seated)", rank: "🥇",
            execucao: "Joelho FLEXIONADO = gastro desativado = sóleo isolado. ROM completa. Pausa 2s no topo. Excêntrico 3-4s.",
            series: "4 × 20-30", dicas: ["Fibras tipo I = ALTA REPETIÇÃO", "Sentado = sóleo puro"],
            erros: ["Reps baixas (sóleo é tipo I)", "ROM parcial"], fases: { bulking: "4×20-30", cutting: "4×25-30" } },
        ]
      },
    ]
  },
];
