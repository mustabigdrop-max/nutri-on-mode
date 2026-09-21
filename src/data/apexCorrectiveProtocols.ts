// APEX ASSESSMENT PIPELINE — CAMADA 4: CORRECT
// Protocolos corretivos biomecânicos por marcação do checklist.
// Sequência fixa: Release → Stretch/Mobilize → Re-Pattern → Activate → Integrate.
// Corretivo sempre vem antes de ativação e de volume.

export type FaseCorretiva = "RELEASE" | "STRETCH" | "MOBILIZE" | "PATTERN" | "ACTIVATE" | "INTEGRATE" | "EVITAR";

export interface ItemCorretivoTag {
  fase: FaseCorretiva;
  exercicio: string;
  volume: string;
  objetivo: string;
}

export interface ProtocoloCorretivo {
  tag: string;
  titulo: string;
  trigger: string;
  problema: string;
  itens: ItemCorretivoTag[];
  protocolo: string;
  progressao: string;
  encaminhamento?: string;
}

const I = (fase: FaseCorretiva, exercicio: string, volume: string, objetivo: string): ItemCorretivoTag => ({
  fase,
  exercicio,
  volume,
  objetivo,
});

export const APEX_CORRECTIVE_PROTOCOLS: ProtocoloCorretivo[] = [
  {
    tag: "COMPENSACAO_TRAPEZIO_SUPERIOR",
    titulo: "Dominância de trapézio superior",
    trigger: "D1(c), D3(b), D6(c/d)",
    problema: "O trapézio superior assume o trabalho do latíssimo e do trapézio inferior.",
    itens: [
      I("RELEASE", "Auto-liberação do trapézio superior com bola", "2×30s/lado", "Reduzir tônus hiperativo"),
      I("STRETCH", "Alongamento do trapézio superior (orelha ao ombro)", "2×20s/lado", "Aumentar comprimento"),
      I("ACTIVATE", "Prone Y-T-W sem peso", "2×8 cada posição", "Ativar trapézio inferior e serrátil"),
      I("INTEGRATE", "Lat Pulldown com depressão escapular consciente", "3×10", "Reprogramar o padrão motor"),
    ],
    protocolo: "Fases 1-3 antes de todo treino de costas por 4-6 semanas. A fase 4 substitui o 1º exercício de costas com carga leve.",
    progressao: "Quando D1 e D3 chegarem na opção (a), escalar para ativação normal.",
  },
  {
    tag: "FLAG_ANTERIORIZACAO_PELVICA",
    titulo: "Anteriorização pélvica",
    trigger: "G7(b/c), G1(c/d), G3(c/d)",
    problema: "Pelve em anteriorização inibe o glúteo máximo; a extensão passa a ser dominada por isquiotibiais e eretores.",
    itens: [
      I("RELEASE", "Rolo no reto femoral e TFL", "2×30s/lado", "Reduzir tônus dos flexores de quadril"),
      I("STRETCH", "Half-Kneeling Hip Flexor Stretch com contração do glúteo no final", "3×30s/lado", "Alongar psoas com ativação recíproca"),
      I("PATTERN", "Dead Bug com retroversão pélvica", "2×10/lado", "Ensinar a pelve a posteriorizar"),
      I("ACTIVATE", "Glute Bridge com retroversão intencional (achatar a lombar antes de subir)", "3×10 (3s hold)", "Recrutar glúteo na posição correta"),
      I("INTEGRATE", "Goblet Squat mantendo pelve neutra", "3×10", "Transferir o padrão para o agachamento"),
    ],
    protocolo: "Fases 1-3 diariamente (10min). Fases 4-5 antes do treino de inferiores por 6-8 semanas.",
    progressao: "Escalar quando G7 e G1 melhorarem no checklist.",
  },
  {
    tag: "FLAG_VALGO",
    titulo: "Joelho valgo",
    trigger: "G5(b/c)",
    problema: "Glúteo médio insuficiente — o joelho colapsa medialmente.",
    itens: [
      I("RELEASE", "Auto-liberação de adutores e TFL", "2×30s/lado", "Reduzir tônus dos antagonistas"),
      I("ACTIVATE", "Clamshell com banda progressiva", "3×15/lado", "Ativar glúteo médio isolado"),
      I("ACTIVATE", "Band Walk lateral em meio-agachamento", "2×15/direção", "Glúteo médio em cadeia fechada"),
      I("INTEGRATE", "Goblet Squat com banda nos joelhos (empurrar pra fora)", "3×10", "Reprogramar alinhamento"),
      I("INTEGRATE", "Step-Down unilateral controlando o alinhamento", "2×8/lado", "Controle excêntrico unilateral"),
    ],
    protocolo: "Fases 1-3 antes do treino de inferiores. Fases 4-5 substituem o agachamento pesado por 4 semanas.",
    progressao: "Quando G5 chegar em (a), liberar agachamento pesado e manter o Clamshell como aquecimento permanente.",
  },
  {
    tag: "FLAG_PROTRACAO_ESCAPULAR",
    titulo: "Protração escapular crônica",
    trigger: "O6(b/c) ou P1(b) + P3(c)",
    problema: "Peitoral menor e deltoide anterior encurtados; trapézio inferior e serrátil fracos.",
    itens: [
      I("RELEASE", "Bola no peitoral menor contra a parede", "2×30s/lado", "Reduzir tônus do peitoral menor"),
      I("STRETCH", "Doorway Pec Stretch (90° e 120°)", "2×30s/lado/ângulo", "Alongar peitoral maior e menor"),
      I("ACTIVATE", "Wall Slide (Wall Angel)", "2×12", "Ativar trapézio inferior e serrátil"),
      I("ACTIVATE", "Band Pull-Apart supinado com retração", "3×15", "Fortalecer retratores"),
      I("INTEGRATE", "Push-Up Plus (protração no topo, retração na descida)", "2×10", "Controle escapular dinâmico"),
    ],
    protocolo: "Fases 1-4 diariamente (10min). Fase 5 antes do treino de peito e ombro por 6 semanas.",
    progressao: "Escalar quando O6 chegar em (a).",
  },
  {
    tag: "COMPENSACAO_LOMBAR_HINGE",
    titulo: "Dominância lombar no hip hinge",
    trigger: "IC2(c/d) ou G3(d)",
    problema: "Eretores dominam a extensão de quadril — risco lombar aumentado.",
    itens: [
      I("RELEASE", "Auto-liberação dos eretores laterais com rolo (nunca sobre a coluna)", "2×30s/lado", "Reduzir tônus dos eretores"),
      I("PATTERN", "Hip Hinge com bastão (3 pontos: cabeça, torácica, sacro)", "3×10", "Ensinar o padrão correto"),
      I("ACTIVATE", "Pull-Through com corda (apertar glúteo na extensão)", "3×12", "Ativar glúteos sem carga axial"),
      I("INTEGRATE", "RDL com haltere leve e pausa 2s", "3×8", "Transferir o padrão com carga"),
    ],
    protocolo: "Fase 2 como drill diário. Fases 1-3 antes do treino de posterior. Fase 4 substitui o stiff pesado por 4 semanas.",
    progressao: "Escalar quando IC2 chegar em (a) ou (b).",
  },
  {
    tag: "COMPENSACAO_LOMBAR_EXTENSAO",
    titulo: "Dominância lombar na extensão de quadril",
    trigger: "G3(d)",
    problema: "A extensão de quadril é conduzida pela lombar em vez do glúteo.",
    itens: [
      I("RELEASE", "Auto-liberação dos eretores laterais com rolo", "2×30s/lado", "Reduzir tônus dos eretores"),
      I("PATTERN", "Hip Hinge com bastão", "3×10", "Ensinar dissociação lombo-pélvica"),
      I("ACTIVATE", "Glute Bridge com retroversão e squeeze 5s", "3×10", "Recrutar glúteo sem extensão lombar"),
      I("INTEGRATE", "Hip Thrust com amplitude controlada", "3×10", "Extensão de quadril sem hiperextensão lombar"),
    ],
    protocolo: "Fases 1-3 antes do treino de glúteo por 4-6 semanas.",
    progressao: "Escalar quando G3 chegar em (a) ou (b).",
  },
  {
    tag: "FLAG_IMPINGEMENT",
    titulo: "Impingement de ombro",
    trigger: "O5(b/c/d)",
    problema: "Dor ou pinçamento em movimentos de empurrar.",
    itens: [
      I("RELEASE", "Bola no infraespinhal e cápsula posterior", "2×30s/lado", "Mobilizar cápsula posterior"),
      I("MOBILIZE", "Sleeper Stretch (rotação interna passiva)", "2×30s/lado", "Restaurar rotação interna glenoumeral"),
      I("ACTIVATE", "Rotação externa com banda (cotovelo 90° colado)", "3×15/lado", "Fortalecer manguito"),
      I("ACTIVATE", "Prone I-Y-T com carga mínima", "2×8/posição", "Estabilizadores escapulares"),
      I("INTEGRATE", "Landmine Press unilateral", "3×10/lado", "Press em arco natural"),
    ],
    protocolo: "Fases 1-4 antes de todo treino de empurrar. Fase 5 substitui o desenvolvimento pesado enquanto houver desconforto.",
    progressao: "Escalar somente quando O5 chegar em (a).",
    encaminhamento:
      "Dor frequente ou constante: recomendamos avaliação com fisioterapeuta ou ortopedista antes de prosseguir. Nenhum exercício de ombro é prescrito até a avaliação profissional.",
  },
  {
    tag: "FLAG_DOR_JOELHO",
    titulo: "Dor no joelho",
    trigger: "Q3(c/d)",
    problema: "Dor patelar frequente ao agachar ou descer escadas.",
    itens: [
      I("RELEASE", "Auto-liberação de quadríceps e TFL", "2×30s/lado", "Reduzir tônus e tração patelar"),
      I("ACTIVATE", "Terminal Knee Extension (TKE) com banda", "3×15/perna", "Reforçar extensão terminal e VMO"),
      I("INTEGRATE", "Step-Down controlado com amplitude sem dor", "2×8/lado", "Controle excêntrico sem provocar dor"),
      I("EVITAR", "Agachamento profundo com carga e extensora com amplitude dolorosa", "—", "Não agravar o quadro"),
    ],
    protocolo: "Fases 1-3 antes do treino de inferiores, sempre dentro da amplitude sem dor.",
    progressao: "Escalar quando Q3 chegar em (a) ou (b).",
    encaminhamento:
      "Dor frequente ou constante no joelho: recomendamos avaliação profissional antes de progredir neste protocolo.",
  },
  {
    tag: "FLAG_PATELAR",
    titulo: "Sinal patelar com VMO deficiente",
    trigger: "Q2(c) + Q3(b/c)",
    problema: "Falta de VMO associada a desconforto patelar.",
    itens: [
      I("RELEASE", "Auto-liberação do vasto lateral e TFL", "2×30s/lado", "Reduzir tração lateral da patela"),
      I("ACTIVATE", "Terminal Knee Extension (TKE) com banda", "3×15/perna", "Ativar VMO"),
      I("ACTIVATE", "Wall Sit isométrico 90°", "2×30-45s", "Reforço isométrico sem impacto"),
      I("INTEGRATE", "Split Squat com amplitude sem dor", "2×10/lado", "Padrão unilateral controlado"),
    ],
    protocolo: "Fases 1-3 antes do treino de inferiores por 4-6 semanas.",
    progressao: "Escalar quando Q2 e Q3 melhorarem no checklist.",
  },
  {
    tag: "FLAG_LESAO_POSTERIOR",
    titulo: "Histórico de lesão no posterior",
    trigger: "IC4(c/d)",
    problema: "Vulnerabilidade no isquiotibial — progressão precisa ser lenta.",
    itens: [
      I("MOBILIZE", "Mobilidade de quadril sem alongamento agressivo", "2×30s/lado", "Preparar tecido sem provocar"),
      I("ACTIVATE", "Isometria de leg curl em amplitude média", "3×15s", "Ativar sem tensão excêntrica máxima"),
      I("INTEGRATE", "Nordic excêntrico assistido com amplitude reduzida", "2×5", "Reintroduzir excêntrico progressivamente"),
      I("EVITAR", "Stiff pesado e sprints máximos enquanto houver desconforto", "—", "Prevenir recidiva"),
    ],
    protocolo: "Progressão lenta, respeitando ausência de dor em cada etapa.",
    progressao: "Escalar somente quando IC4 chegar em (a) ou (b).",
    encaminhamento:
      "Lesão recorrente ou desconforto atual: recomendamos avaliação profissional antes de progredir neste protocolo.",
  },
  {
    tag: "FLAG_DIASTASE",
    titulo: "Diástase abdominal",
    trigger: "A6(c/d)",
    problema: "Separação da linha alba — exercícios de flexão espinhal com carga podem agravar.",
    itens: [
      I("ACTIVATE", "Vacuum abdominal", "3×15-20s, diário", "Ativar transverso do abdômen"),
      I("ACTIVATE", "Dead Bug modificado (amplitude reduzida)", "2×8/lado", "Core sem pressão intra-abdominal excessiva"),
      I("EVITAR", "Crunch tradicional, sit-up e flexão espinhal com carga", "—", "Não agravar a separação"),
    ],
    protocolo: "Trabalho diário de transverso, sem flexão espinhal carregada.",
    progressao: "Reavaliar o checklist em 4 semanas.",
    encaminhamento: "Diástase significativa: recomendamos avaliação com fisioterapeuta especializado.",
  },
  {
    tag: "COMPENSACAO_FLEXOR_QUADRIL",
    titulo: "Dominância de flexor de quadril no core",
    trigger: "A2(d)",
    problema: "O abdominal é substituído pelo psoas nos exercícios de flexão.",
    itens: [
      I("RELEASE", "Rolo no reto femoral e TFL", "2×30s/lado", "Reduzir tônus dos flexores"),
      I("PATTERN", "Dead Bug com retroversão pélvica", "2×10/lado", "Dissociar core de flexor de quadril"),
      I("ACTIVATE", "Reverse Crunch com pelve retrovertida", "2×12", "Recrutar reto abdominal inferior"),
    ],
    protocolo: "Fases 1-3 antes do treino de core.",
    progressao: "Escalar quando A2 sair da opção (d).",
  },
  {
    tag: "COMPENSACAO_DELTOIDE_ANTERIOR",
    titulo: "Dominância de deltoide anterior no peitoral",
    trigger: "P1(b) + P3(c)",
    problema: "O deltoide anterior assume o trabalho do peitoral nos empurrões.",
    itens: [
      I("RELEASE", "Bola no peitoral menor e deltoide anterior", "2×30s/lado", "Reduzir tônus anterior"),
      I("STRETCH", "Doorway Pec Stretch", "2×30s/lado", "Restaurar comprimento do peitoral"),
      I("ACTIVATE", "Cable Crossover com pausa 3s", "3×12", "Recrutar peitoral em adução horizontal"),
      I("INTEGRATE", "Supino com escápulas retraídas e deprimidas", "3×10 carga leve", "Reprogramar o padrão de empurrar"),
    ],
    protocolo: "Fases 1-3 antes do treino de peito por 4-6 semanas.",
    progressao: "Escalar quando P1 e P3 chegarem em (a).",
  },
  {
    tag: "DOMINANCIA_VASTO_LATERAL",
    titulo: "Dominância de vasto lateral",
    trigger: "Q1(b)",
    problema: "Recrutamento concentrado no vasto lateral, com VMO subutilizado.",
    itens: [
      I("RELEASE", "Auto-liberação do vasto lateral e TFL", "2×30s/lado", "Reduzir dominância lateral"),
      I("ACTIVATE", "Terminal Knee Extension (TKE) com banda", "3×15/perna", "Ativar extensão terminal e VMO"),
      I("INTEGRATE", "Split Squat com calcanhar elevado", "2×10/lado", "Distribuir recrutamento no quadríceps"),
    ],
    protocolo: "Fases 1-2 antes do treino de inferiores.",
    progressao: "Escalar quando Q1 chegar em (a).",
  },
  {
    tag: "DOMINANCIA_BICEPS_PUXADAS",
    titulo: "Dominância de bíceps nas puxadas",
    trigger: "B3(c)",
    problema: "O bíceps fadiga antes das costas, limitando o estímulo no dorsal.",
    itens: [
      I("ACTIVATE", "Straight-Arm Pulldown com pausa 3s", "3×12", "Ativar latíssimo sem flexão de cotovelo"),
      I("INTEGRATE", "Puxada com pegada neutra e depressão escapular consciente", "3×10", "Reduzir participação do bíceps"),
      I("EVITAR", "Rosca direta imediatamente antes do treino de costas", "—", "Preservar o bíceps para a puxada"),
    ],
    protocolo: "Ativação antes de toda sessão de costas.",
    progressao: "Escalar quando B3 sair da opção (c).",
  },
  {
    tag: "ENCURTAMENTO_POSTERIOR",
    titulo: "Encurtamento de isquiotibiais",
    trigger: "IC3(c) + IC5(c/d)",
    problema: "Amplitude limitada no hip hinge por encurtamento posterior.",
    itens: [
      I("RELEASE", "Rolo nos isquiotibiais", "2×30s/lado", "Reduzir tônus"),
      I("STRETCH", "Alongamento ativo do posterior em hip hinge", "3×30s/lado", "Ganhar amplitude"),
      I("ACTIVATE", "Leg Curl com pausa 2s no pico", "3×12", "Força em amplitude encurtada"),
      I("INTEGRATE", "RDL com amplitude progressiva", "3×8", "Amplitude com controle"),
    ],
    protocolo: "Fases 1-3 antes do treino de posterior.",
    progressao: "Escalar quando IC5 melhorar no checklist.",
  },
];

export const APEX_CORRECTIVE_BY_TAG: Record<string, ProtocoloCorretivo> = Object.fromEntries(
  APEX_CORRECTIVE_PROTOCOLS.map((p) => [p.tag, p]),
);
