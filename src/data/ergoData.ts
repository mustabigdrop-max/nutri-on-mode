// ERGO VAULT FEMININO — Database de compostos
// nutriON · Diogo Mello

export type ErgoCategoria =
  | "ergogenico"
  | "hormonal"
  | "peptideo"
  | "esteroide"
  | "adaptogeno"
  | "metabolico";

export type ErgoRisco = "baixo" | "medio" | "alto" | "extremo";

export type FaseCiclo = "menstrual" | "folicular" | "ovulatoria" | "lutea";

export interface ErgoProtocolo {
  objetivo: string;
  dose: string;
  timing: string;
  duracao: string;
  stack: string;
}

export interface ErgoBroScience {
  fonte: string;
  quote: string;
  autor: string;
}

export interface ErgoCompound {
  id: string;
  categoria: ErgoCategoria;
  nome: string;
  nomeCientifico: string;
  apelidos?: string[];
  risco: ErgoRisco;
  doseFeminina: string;
  doseMasculina?: string;
  timing: string;
  cicloSemanas?: string;
  descricao: string;
  diferencialFeminino: string;
  broScience?: ErgoBroScience[];
  beneficios: string[];
  efeitos_adversos?: string[];
  aviso?: string;
  quickActionsVertex: string[];
  quickActionsNexus: string[];
  protocolos?: ErgoProtocolo[];
  faseCiclo?: FaseCiclo[];
}

export const ERGO_COMPOUNDS: ErgoCompound[] = [
  // ═══════════════ ERGOGÊNICOS ═══════════════
  {
    id: "creatina-monohidratada",
    categoria: "ergogenico",
    nome: "Creatina Monoidratada",
    nomeCientifico: "Methylguanidine-acetic acid",
    apelidos: ["Creapure", "Creatine MH"],
    risco: "baixo",
    doseFeminina: "3–5g/dia (sem fase de saturação)",
    doseMasculina: "5g/dia",
    timing: "Diário, qualquer horário (preferência pós-treino com carbo)",
    descricao:
      "Aumenta reserva de fosfocreatina muscular, melhorando performance em esforços de alta intensidade. Em mulheres a reserva basal é 20–30% menor que em homens, o que torna a suplementação proporcionalmente mais impactante. Atravessa a barreira hematoencefálica — efeitos cognitivos, neuroprotetores e melhora de humor especialmente relevantes na fase lútea. Evidência robusta para preservação óssea em mulheres pré e pós-menopausa.",
    diferencialFeminino:
      "Reserva basal menor → resposta proporcionalmente maior. Estudos mostram benefício cognitivo e de humor durante fase lútea. Dose de saturação NÃO é necessária e pode causar retenção hídrica indesejada em fase pré-competição.",
    beneficios: [
      "Força e potência",
      "Volume muscular",
      "Cognição e humor",
      "Saúde óssea",
      "Neuroproteção",
    ],
    quickActionsVertex: [
      "Creatina causa retenção que atrapalha definição?",
      "Posso usar creatina em pré-contest?",
      "Creatina e ciclo menstrual: como ajustar?",
      "Melhor forma: monohidratada vs HCl?",
      "Stack creatina + beta-alanina é seguro?",
    ],
    quickActionsNexus: [
      "Por que tenho medo de 'inchar' com creatina?",
      "Como lidar com a balança subindo no início?",
      "Creatina é 'doping leve'? Como pensar isso?",
      "Consistência: tomar todo dia mesmo sem treinar?",
    ],
    faseCiclo: ["menstrual", "folicular", "ovulatoria", "lutea"],
  },
  {
    id: "beta-alanina",
    categoria: "ergogenico",
    nome: "Beta-Alanina",
    nomeCientifico: "β-Alanine (CarnoSyn®)",
    risco: "baixo",
    doseFeminina: "3.2g/dia fracionada (4× 800mg)",
    doseMasculina: "5–6g/dia",
    timing: "Fracionada ao longo do dia para minimizar parestesia",
    descricao:
      "Precursor da carnosina muscular, tampona íons H+ retardando fadiga em esforços de 60s a 4min. Mulheres têm carnosina basal naturalmente menor que homens, especialmente em fibras tipo II. Fracionamento da dose é OBRIGATÓRIO para evitar a parestesia (formigamento) — mais incômoda em pele feminina mais sensível. Saturação plena leva 4–6 semanas.",
    diferencialFeminino:
      "Carnosina basal menor → maior janela de ganho. Pele mais sensível → fracionamento obrigatório. Especialmente útil em treinos de glúteo/perna em alta repetição (12–20 reps).",
    beneficios: [
      "Resistência muscular",
      "Tampão lactato",
      "Volume de treino",
      "Hipertrofia em altas reps",
    ],
    efeitos_adversos: ["Parestesia (formigamento) em doses únicas >800mg"],
    quickActionsVertex: [
      "Como minimizar o formigamento?",
      "Beta-alanina funciona para HIIT?",
      "Stack com creatina vale a pena?",
      "Quanto tempo para ver resultado?",
    ],
    quickActionsNexus: [
      "Esquecer dose: como criar rotina de 4×/dia?",
      "Vale o incômodo do formigamento?",
    ],
    faseCiclo: ["folicular", "ovulatoria"],
  },
  {
    id: "hmb",
    categoria: "ergogenico",
    nome: "HMB",
    nomeCientifico: "β-Hydroxy β-Methylbutyrate",
    risco: "baixo",
    doseFeminina: "3g/dia (3× 1g)",
    timing: "1g pré-treino, 1g pós-treino, 1g antes de dormir",
    descricao:
      "Metabólito da leucina que age via inibição da via ubiquitina-proteassoma, reduzindo proteólise muscular. Ação anti-catabólica forte — particularmente útil em déficit calórico, fase lútea (catabolismo aumentado pela progesterona), pré-palco e em mulheres acima de 40 anos.",
    diferencialFeminino:
      "Fase lútea aumenta catabolismo proteico em até 30% — HMB protege massa magra justamente nessa janela. Ferramenta clássica de coach de pré-contest feminino para preservar densidade durante peak week.",
    beneficios: [
      "Anti-catabólico",
      "Preservação de massa magra em cutting",
      "Recuperação",
      "Suporte em peak week",
    ],
    quickActionsVertex: [
      "HMB vs leucina: qual escolher?",
      "Protocolo HMB para peak week?",
      "Funciona em jejum intermitente?",
      "Stack HMB + creatina + EAA?",
    ],
    quickActionsNexus: [
      "Medo de perder músculo em cutting: como gerenciar?",
    ],
    faseCiclo: ["lutea"],
  },
  {
    id: "cafeina-teanina",
    categoria: "ergogenico",
    nome: "Cafeína + L-Teanina",
    nomeCientifico: "1,3,7-trimethylxanthine + γ-glutamylethylamide",
    risco: "baixo",
    doseFeminina: "100–200mg cafeína + 200–400mg teanina (ratio 1:2)",
    doseMasculina: "200–400mg cafeína",
    timing: "30–45min pré-treino. Evitar após 14h.",
    descricao:
      "Stack clássico de foco e energia com ansiedade reduzida. Em mulheres usando anticoncepcional oral, o etinilestradiol inibe o CYP1A2 hepático em ~40%, reduzindo o clearance da cafeína e DOBRANDO sua meia-vida. Dose deve ser reduzida pela metade. Teanina suaviza picos adrenérgicos e reduz tremor.",
    diferencialFeminino:
      "ACO inibe CYP1A2 → cafeína dura o dobro do tempo → ansiedade, insônia e palpitação se não ajustar a dose. Fase lútea já tem cortisol/ansiedade elevados — reduzir cafeína ainda mais nesta fase.",
    beneficios: ["Foco", "Energia", "Performance aeróbica", "Termogênese leve", "Anti-ansiedade (teanina)"],
    efeitos_adversos: ["Insônia", "Taquicardia", "Ansiedade", "Refluxo"],
    aviso: "Usuárias de ACO: reduzir cafeína em 50%. Monitorar ferritina (cafeína inibe absorção de ferro).",
    quickActionsVertex: [
      "Cafeína afeta ferro: como compensar?",
      "Pré-treino sem cafeína funciona?",
      "Teanina sozinha vale a pena?",
      "Cafeína e ciclo menstrual: ajustar como?",
    ],
    quickActionsNexus: [
      "Dependência de café: como reduzir sem crash?",
      "Ansiedade pós-pré-treino: o que fazer?",
    ],
    faseCiclo: ["folicular", "ovulatoria"],
  },
  {
    id: "omega-3",
    categoria: "ergogenico",
    nome: "Ômega-3 EPA/DHA",
    nomeCientifico: "Eicosapentaenoic + Docosahexaenoic acid",
    risco: "baixo",
    doseFeminina: "2–3g EPA+DHA/dia (mínimo 1g EPA isolado para dismenorreia)",
    timing: "Com refeição que contenha gordura. Dividir em 2 doses.",
    descricao:
      "EPA tem ação anti-inflamatória sistêmica via redução de prostaglandinas pró-inflamatórias (PGE2, TXA2). Meta-análise de 2023 mostrou eficácia de EPA 1.5–3g/dia para dismenorreia primária EQUIVALENTE ao ibuprofeno, sem efeitos gástricos. DHA é essencial para SNC, retina e crítico no pós-parto e amamentação.",
    diferencialFeminino:
      "Cólica menstrual reduzida em até 60% com 1.5g EPA. DHA preserva massa cinzenta no pós-parto. Reduz DOMS pós-treino em mulheres ~30% mais que em homens (estudos de IL-6).",
    beneficios: ["Anti-inflamatório", "Cólica menstrual", "Saúde cardiovascular", "Cognição", "DOMS reduzido"],
    quickActionsVertex: [
      "EPA vs DHA: qual ratio escolher?",
      "Ômega-3 para cólica: protocolo?",
      "Posso usar óleo de algas (vegano)?",
      "Quanto tempo até ver efeito anti-inflamatório?",
    ],
    quickActionsNexus: [
      "Cólica afetando treino: como planejar a semana?",
    ],
    faseCiclo: ["menstrual", "lutea"],
  },

  // ═══════════════ HORMONAL ═══════════════
  {
    id: "mio-inositol",
    categoria: "hormonal",
    nome: "Mio-Inositol + D-Chiro (40:1)",
    nomeCientifico: "Myo-inositol + D-chiro-inositol",
    risco: "baixo",
    doseFeminina: "2g mio + 50mg D-chiro, 2× ao dia (total 4g mio)",
    timing: "Manhã e noite, com ou sem alimento",
    cicloSemanas: "Uso contínuo (mínimo 3 meses para SOP)",
    descricao:
      "Segundos mensageiros da insulina no ovário. A proporção 40:1 mio:D-chiro reflete o balanço fisiológico ovariano. Padrão-ouro em SOP — restaura ovulação em até 70% das mulheres em 3–6 meses, reduz andrógenos, melhora qualidade oocitária. Comparável à metformina em sensibilidade insulínica, sem efeitos GI.",
    diferencialFeminino:
      "Composto FEMININO por excelência. Atua diretamente no eixo insulina-ovário. Reduz acne hormonal, hirsutismo e ansiedade cíclica. Primeira linha em SOP, resistência insulínica feminina e infertilidade ovulatória.",
    beneficios: [
      "SOP",
      "Sensibilidade insulínica",
      "Acne hormonal",
      "Ansiedade cíclica",
      "Fertilidade",
      "Qualidade oocitária",
    ],
    aviso: "D-Chiro isolado em altas doses pode prejudicar qualidade do óvulo. Manter SEMPRE ratio 40:1.",
    quickActionsVertex: [
      "Inositol vs metformina para SOP?",
      "Quanto tempo para regularizar ciclo?",
      "Posso usar tentando engravidar?",
      "Stack inositol + berberina é seguro?",
      "Funciona se eu não tiver SOP?",
    ],
    quickActionsNexus: [
      "Diagnóstico de SOP: como aceitar e agir?",
      "Ansiedade cíclica: relação com hormônios",
    ],
    faseCiclo: ["menstrual", "folicular", "ovulatoria", "lutea"],
  },
  {
    id: "magnesio-bisglicinato",
    categoria: "hormonal",
    nome: "Magnésio Bisglicinato",
    nomeCientifico: "Magnesium bis-glycinate",
    risco: "baixo",
    doseFeminina: "300–400mg magnésio elementar/dia",
    timing: "À noite, 30–60min antes de dormir",
    descricao:
      "Forma quelada com glicina — alta biodisponibilidade, sem efeito laxativo. Cofator de >300 reações enzimáticas. Em mulheres é especificamente indicado para: cólica menstrual (relaxamento de musculatura uterina), TPM (reduz IL-6 e prostaglandinas), sono (potencializa GABA), cortisol elevado e suporte à síntese de progesterona. Stack clássico com B6 (P5P) potencializa absorção e ação anti-TPM.",
    diferencialFeminino:
      "Mulheres com TPM têm magnésio intracelular significativamente menor. Reposição reduz sintomas de TPM em 41% (estudos clássicos). Crítico em fase lútea para sono e cortisol.",
    beneficios: ["Sono", "Cólica", "TPM", "Ansiedade", "Cortisol", "Suporte hormonal"],
    quickActionsVertex: [
      "Bisglicinato vs treonato vs malato?",
      "Magnésio para cólica: qual dose aguda?",
      "Stack magnésio + B6 + L-teanina?",
      "Posso tomar com creatina?",
    ],
    quickActionsNexus: [
      "Sono ruim na fase lútea: além do magnésio?",
    ],
    faseCiclo: ["menstrual", "lutea"],
  },
  {
    id: "zinco-bisglicinato",
    categoria: "hormonal",
    nome: "Zinco Bisglicinato",
    nomeCientifico: "Zinc bis-glycinate",
    risco: "baixo",
    doseFeminina: "15–25mg/dia",
    timing: "À noite, longe de cálcio e ferro",
    descricao:
      "Cofator essencial para síntese de progesterona, conversão de T4→T3 e enzimas antioxidantes. Em mulheres atletas, deficiência é comum e impacta diretamente a fase lútea (baixa progesterona = TPM intensa, ciclos curtos, infertilidade). Stack ZMA (Zinco + Magnésio + B6) noturno suporta GH pulsátil fisiológico durante o sono.",
    diferencialFeminino:
      "Zinco é cofator OBRIGATÓRIO da síntese de progesterona. Deficiência → fase lútea inadequada → TPM, infertilidade, baixa libido. Mulheres com fluxo intenso perdem zinco mensalmente.",
    beneficios: ["Progesterona", "Tireoide", "Imunidade", "Pele", "Cabelo", "GH noturno"],
    aviso: "Não exceder 40mg/dia por longos períodos (depleta cobre).",
    quickActionsVertex: [
      "Stack ZMA realmente funciona?",
      "Zinco deve ser tomado em jejum?",
      "Sinais de deficiência de zinco em mulher?",
      "Zinco + cobre: precisa balancear?",
    ],
    quickActionsNexus: [],
    faseCiclo: ["lutea"],
  },
  {
    id: "vitamina-d3-k2",
    categoria: "hormonal",
    nome: "Vitamina D3 + K2-MK7",
    nomeCientifico: "Cholecalciferol + Menaquinone-7",
    risco: "baixo",
    doseFeminina: "2000–5000 UI D3 + 100–200mcg K2-MK7/dia",
    timing: "Com refeição contendo gordura (almoço ideal)",
    descricao:
      "D3 funciona como hormônio esteroide, com receptores (VDR) em ovários, útero e mama. Modula síntese de testosterona livre feminina, fertilidade e sensibilidade insulínica (crítico em SOP). K2-MK7 direciona o cálcio para os ossos e impede calcificação arterial — combinação obrigatória em qualquer protocolo de longo prazo.",
    diferencialFeminino:
      "VDR ovariano → D3 modula esteroidogênese feminina diretamente. Mulheres com SOP têm 67–85% de deficiência. Mantém testosterona livre saudável (libido, força, composição corporal). Pós-menopausa: K2 é fator chave de proteção óssea.",
    beneficios: ["Testosterona livre", "SOP", "Imunidade", "Saúde óssea", "Humor", "Sensibilidade insulínica"],
    quickActionsVertex: [
      "Como dosar D3 sem fazer exame?",
      "K2 MK4 vs MK7: qual escolher?",
      "Posso tomar 10.000 UI por dia?",
      "Stack D3 + magnésio + zinco?",
    ],
    quickActionsNexus: [],
    faseCiclo: ["menstrual", "folicular", "ovulatoria", "lutea"],
  },
  {
    id: "maca-peruana",
    categoria: "hormonal",
    nome: "Maca Peruana (Black + Red)",
    nomeCientifico: "Lepidium meyenii",
    risco: "baixo",
    doseFeminina: "1.5–3g/dia (Black: energia/libido. Red: hormonal/menopausa)",
    timing: "Manhã ou pré-treino. Evitar à noite (energizante).",
    descricao:
      "Adaptógeno andino que atua no eixo hipotálamo-hipófise SEM conter hormônios ou fitoestrógenos diretos. Modula a sinalização hormonal de forma adaptativa. Black Maca: melhor para energia, performance e libido feminina. Red Maca: melhor para sintomas hormonais, menopausa e densidade óssea. Estudos mostram benefício em libido pós-SSRI (depressão).",
    diferencialFeminino:
      "Não contém hormônio — segura para mulheres com histórico de câncer hormônio-dependente (consultar médico). Eficaz em libido pós-SSRI, fogachos de menopausa e energia em fase lútea.",
    beneficios: ["Libido", "Energia", "Fertilidade", "Menopausa (Red)", "Humor", "Sem efeito hormonal direto"],
    quickActionsVertex: [
      "Black vs Red vs Yellow Maca: qual escolher?",
      "Maca gelatinizada é melhor?",
      "Quanto tempo para sentir efeito na libido?",
      "Posso usar tentando engravidar?",
    ],
    quickActionsNexus: [
      "Libido baixa: hormônio ou cabeça?",
      "Como reconectar com prazer no corpo?",
    ],
    faseCiclo: ["folicular", "ovulatoria", "lutea"],
  },
  {
    id: "vitamina-b6-p5p",
    categoria: "hormonal",
    nome: "Vitamina B6 (P5P)",
    nomeCientifico: "Pyridoxal-5-Phosphate",
    risco: "baixo",
    doseFeminina: "25–50mg P5P/dia",
    timing: "Manhã, com alimento",
    descricao:
      "Forma ativa coenzimática da B6 — não precisa ser convertida no fígado. Cofator essencial na síntese de serotonina, dopamina, GABA e progesterona. Reduz prolactina elevada (fator chave de TPM). Stack com magnésio é o protocolo clássico anti-TPM, com 3–4 RCTs validando redução de sintomas em 30–50%.",
    diferencialFeminino:
      "P5P é a base bioquímica do controle de TPM. Sem B6 não há conversão eficiente de triptofano em serotonina (humor) nem síntese adequada de progesterona.",
    beneficios: ["TPM", "Humor", "Progesterona", "Sono", "Redução de prolactina"],
    aviso: "Não exceder 100mg/dia por longos períodos (neuropatia periférica).",
    quickActionsVertex: [
      "P5P vs piridoxina HCl?",
      "Stack B6 + magnésio + inositol?",
      "Quanto tempo para efeito anti-TPM?",
    ],
    quickActionsNexus: [],
    faseCiclo: ["lutea"],
  },

  // ═══════════════ ADAPTÓGENO ═══════════════
  {
    id: "ashwagandha-ksm66",
    categoria: "adaptogeno",
    nome: "Ashwagandha KSM-66",
    nomeCientifico: "Withania somnifera (extrato padronizado)",
    risco: "baixo",
    doseFeminina: "600mg/dia (1× ou dividido)",
    timing: "À noite ou dividido manhã/noite. Com alimento.",
    cicloSemanas: "8–12 semanas com pausa de 2–4 semanas",
    descricao:
      "Adaptógeno ayurvédico padronizado em 5% de withanolides. RCT clássico mostrou redução de cortisol em 27.9% após 60 dias. Em mulheres, eleva testosterona livre (mantendo dentro de range fisiológico — não viriliza), melhora libido, qualidade do sono e força. Estudos mostram benefício em sintomas de SOP via redução do cortisol crônico.",
    diferencialFeminino:
      "Eleva testosterona livre feminina dentro de range FISIOLÓGICO — sem risco de virilização. Reduz cortisol → melhora composição corporal e fertilidade. Particularmente útil para mulheres com burnout adrenal, treinos pesados e SOP.",
    beneficios: ["Cortisol", "Testosterona livre", "Sono", "Libido", "Força", "Recuperação", "SOP"],
    aviso: "Evitar em hipertireoidismo (pode estimular T4). Cautela em autoimunidade.",
    quickActionsVertex: [
      "KSM-66 vs Sensoril: qual escolher?",
      "Posso usar com sertralina/SSRI?",
      "Ashwagandha realmente eleva testosterona feminina?",
      "Por quanto tempo posso usar contínuo?",
      "Stack ashwagandha + rhodiola?",
    ],
    quickActionsNexus: [
      "Burnout de coach: como reconhecer?",
      "Quando o cortisol vira sabotador?",
    ],
    faseCiclo: ["lutea"],
  },
  {
    id: "rhodiola-rosea",
    categoria: "adaptogeno",
    nome: "Rhodiola Rosea",
    nomeCientifico: "Rhodiola rosea (3% rosavins, 1% salidroside)",
    risco: "baixo",
    doseFeminina: "200–400mg/dia",
    timing: "Manhã e início da tarde. Evitar à noite.",
    cicloSemanas: "6–8 semanas com pausa",
    descricao:
      "Adaptógeno energizante que age via inibição da COMT (catecol-O-metiltransferase), aumentando dopamina/noradrenalina disponíveis no SNC. Eficaz contra burnout, fadiga mental, depressão leve e melhora VO2max em ~9% em mulheres atletas. Diferentemente da ashwagandha (calmante), Rhodiola é estimulante adaptogênica.",
    diferencialFeminino:
      "Mulheres com burnout, ansiedade-depressão leve da fase lútea, ou dificuldade de concentração no trabalho intelectual têm boa resposta. Útil para atletas em fase de cutting agressivo (preserva motivação).",
    beneficios: ["Energia mental", "Burnout", "VO2max", "Humor", "Foco", "Fase lútea"],
    aviso: "Evitar em transtorno bipolar. Pode causar insônia se tomada à noite.",
    quickActionsVertex: [
      "Rhodiola vs cafeína para foco?",
      "Stack ashwagandha (noite) + rhodiola (manhã)?",
      "Funciona para depressão leve?",
      "Quanto tempo para efeito?",
    ],
    quickActionsNexus: [
      "Procrastinação na fase lútea: o que fazer?",
    ],
    faseCiclo: ["lutea", "menstrual"],
  },
  {
    id: "maitake-reishi",
    categoria: "adaptogeno",
    nome: "Maitake + Reishi",
    nomeCientifico: "Grifola frondosa + Ganoderma lucidum",
    risco: "baixo",
    doseFeminina: "500–1000mg de cada/dia",
    timing: "Reishi à noite (calmante). Maitake manhã.",
    descricao:
      "Cogumelos medicinais com beta-glucanos imunomoduladores. Maitake (D-Fraction) é estudado para SOP, sensibilidade insulínica e indução de ovulação. Reishi atua como modulador imune, reduz inflamação, melhora sono profundo e age no eixo HPA. Combinação útil em mulheres com inflamação crônica de baixo grau, autoimunidade leve e estresse oxidativo.",
    diferencialFeminino:
      "Maitake D-Fraction tem evidência específica para SOP e ovulação. Reishi suporta sono profundo (REM e fase 4) — crítico em fase lútea quando o sono piora.",
    beneficios: ["Imunidade", "SOP (Maitake)", "Sono profundo (Reishi)", "Anti-inflamatório", "Eixo HPA"],
    quickActionsVertex: [
      "Maitake D-Fraction vs Mio-Inositol para SOP?",
      "Reishi causa sonolência diurna?",
      "Stack com cordyceps?",
    ],
    quickActionsNexus: [],
    faseCiclo: ["lutea", "menstrual"],
  },
  {
    id: "shatavari",
    categoria: "adaptogeno",
    nome: "Shatavari",
    nomeCientifico: "Asparagus racemosus",
    risco: "baixo",
    doseFeminina: "500–1000mg/dia",
    timing: "Com refeição",
    descricao:
      "Adaptógeno feminino clássico da medicina ayurvédica — o nome significa 'aquela que possui cem maridos', referência à sua reputação como tônico hormonal feminino. Contém saponinas esteroidais (shatavarinas) com ação fitoestrogênica leve. Tradicionalmente usado para lactação, equilíbrio hormonal feminino, menopausa e mucosa vaginal seca.",
    diferencialFeminino:
      "Composto puramente feminino na ayurveda. Útil em menopausa (fogachos, secura vaginal), pós-parto (lactação) e desequilíbrio hormonal cíclico.",
    beneficios: ["Lactação", "Menopausa", "Hidratação mucosa", "Equilíbrio hormonal", "Libido"],
    aviso: "Evitar em câncer hormônio-dependente. Cautela em alergia a aspargo.",
    quickActionsVertex: [
      "Shatavari para menopausa: protocolo?",
      "Posso usar amamentando?",
      "Shatavari vs Maca para libido?",
    ],
    quickActionsNexus: [
      "Menopausa e identidade: como reconstruir?",
    ],
    faseCiclo: ["lutea"],
  },

  // ═══════════════ METABÓLICO ═══════════════
  {
    id: "l-carnitina-tartarato",
    categoria: "metabolico",
    nome: "L-Carnitina Tartarato",
    nomeCientifico: "L-Carnitine L-Tartrate (LCLT)",
    risco: "baixo",
    doseFeminina: "1.5–3g/dia",
    timing: "Pré-treino + com refeição rica em carbo",
    descricao:
      "Transportador de ácidos graxos para mitocôndria. A absorção é INSULINO-DEPENDENTE — daí a necessidade de tomar com carboidrato. L-Tartarato tem evidência específica para recuperação muscular (redução de marcadores de dano) e melhora de sensibilidade insulínica. Em mulheres, fase folicular favorece o uso (sensibilidade insulínica máxima).",
    diferencialFeminino:
      "Mulheres oxidam mais gordura que homens em exercício moderado — carnitina potencializa essa via. Recuperação muscular pós-treino mais rápida (relevante em ciclos de 5–6 treinos/semana).",
    beneficios: ["Oxidação de gordura", "Sensibilidade insulínica", "Recuperação", "Energia"],
    quickActionsVertex: [
      "L-Tartarato vs Acetil-L-Carnitina vs Propionil?",
      "Funciona sem carbo junto?",
      "Carnitina injetável é mito?",
      "Stack carnitina + cafeína pré-treino?",
    ],
    quickActionsNexus: [],
    faseCiclo: ["folicular"],
  },
  {
    id: "cla",
    categoria: "metabolico",
    nome: "CLA",
    nomeCientifico: "Conjugated Linoleic Acid",
    risco: "baixo",
    doseFeminina: "3–4g/dia",
    timing: "Com refeições contendo gordura",
    descricao:
      "Ácido graxo com duas isomerias principais (cis-9, trans-11 e trans-10, cis-12). Promove lipólise leve e modulação da composição corporal. NÃO é termogênico — efeito é gradual e modesto (perda de 0.5–1kg de gordura em 12 semanas). Expectativas devem ser corretas: é ferramenta complementar, não primária. Funciona melhor combinado com treino de força.",
    diferencialFeminino:
      "Resposta feminina ao CLA é tipicamente menor que a masculina nos estudos. Útil como composto de longo prazo em recomposição corporal — não como queimador agudo.",
    beneficios: ["Composição corporal (lento)", "Lipólise leve", "Anti-inflamatório"],
    aviso: "Pode aumentar resistência insulínica em altas doses. Não usar em SOP/diabetes.",
    quickActionsVertex: [
      "CLA realmente funciona?",
      "Quando ESPERAR ver resultado?",
      "Vale a pena vs ômega-3?",
    ],
    quickActionsNexus: [
      "Expectativa irreal com 'queimadores': como ajustar?",
    ],
    faseCiclo: ["folicular", "ovulatoria"],
  },
  {
    id: "berberina",
    categoria: "metabolico",
    nome: "Berberina",
    nomeCientifico: "Berberine HCl",
    risco: "medio",
    doseFeminina: "500mg, 2–3× ao dia (com refeições contendo carbo)",
    timing: "15min antes das refeições principais",
    cicloSemanas: "8–12 semanas com pausa",
    descricao:
      "Alcalóide isoquinolínico com ação ATIVADORA da AMPK — mesmo mecanismo da metformina. Reduz glicose pós-prandial, HbA1c, triglicérides e LDL. Meta-análises mostram eficácia em SOP COMPARÁVEL à metformina, sem efeitos GI severos. Modula microbiota intestinal positivamente. Considerada alternativa natural à metformina por muitos endócrinos.",
    diferencialFeminino:
      "Padrão-ouro natural para SOP com resistência insulínica. Reduz andrógenos, melhora ciclo, ajuda perda de gordura visceral. Berberina + Inositol é stack de elite para SOP.",
    beneficios: ["Sensibilidade insulínica", "SOP", "Glicose pós-prandial", "Lipídios", "Microbiota"],
    efeitos_adversos: ["Constipação leve", "Gases (primeiras semanas)"],
    aviso: "Inibe CYP3A4 — interage com MUITOS medicamentos. Não usar em gestação/lactação. Consultar médico se em uso de psicotrópicos.",
    quickActionsVertex: [
      "Berberina vs Metformina: estudos comparativos?",
      "Stack berberina + inositol para SOP?",
      "Posso ciclar para sempre?",
      "Dihydroberberine: vale o preço?",
    ],
    quickActionsNexus: [
      "Resistência à 'medicação' para SOP: como pensar suplementação?",
    ],
    faseCiclo: ["menstrual", "folicular", "ovulatoria", "lutea"],
  },

  // ═══════════════ PEPTÍDEOS ═══════════════
  {
    id: "bpc-157",
    categoria: "peptideo",
    nome: "BPC-157",
    nomeCientifico: "Body Protective Compound-157",
    risco: "medio",
    doseFeminina: "200–500mcg/dia (SC ou oral)",
    timing: "1× ao dia, qualquer horário (SC: próximo da lesão)",
    cicloSemanas: "4–8 semanas",
    descricao:
      "Pentadecapeptídeo derivado de proteína gástrica humana. Acelera cicatrização de tendões, ligamentos, mucosa gastrointestinal e tecido neural via upregulation de VEGF e síntese de colágeno. Em mulheres é particularmente relevante para reparo de LCA (lesão 3–6× mais comum em mulheres devido ao ângulo Q e estrogênio). Ação serotoninérgica central com efeitos antidepressivos em estudos animais.",
    diferencialFeminino:
      "LCA, fascite plantar e tendinopatias femininas têm prevalência elevada — BPC-157 é ferramenta de recuperação de elite. Reparo de mucosa GI útil em mulheres com SII (3× mais comum em mulheres).",
    beneficios: ["Cicatrização tendínea/ligamentar", "Reparo GI", "Antidepressivo (estudos animais)", "Anti-inflamatório local"],
    aviso: "Status legal varia por país. Não aprovado pelo FDA. Off-label. Pureza varia entre fornecedores.",
    quickActionsVertex: [
      "BPC-157 oral vs SC: qual mais eficaz?",
      "Protocolo para tendinite de patela?",
      "Stack BPC + TB-500 para lesão?",
      "Quanto tempo manter o uso?",
    ],
    quickActionsNexus: [
      "Frustração com lesão recorrente: como processar?",
    ],
  },
  {
    id: "tb-500",
    categoria: "peptideo",
    nome: "TB-500",
    nomeCientifico: "Thymosin Beta-4 (fragmento)",
    risco: "medio",
    doseFeminina: "2–5mg/semana (dividido em 2 doses)",
    timing: "2× por semana (segunda e quinta), SC",
    cicloSemanas: "4–6 semanas",
    descricao:
      "Fragmento sintético da timosina beta-4 com ação anti-fibrose, angiogênese e migração celular. Particularmente útil em recuperação pós-parto de atletas (reparo de assoalho pélvico, diástase abdominal), flexibilidade articular e lesões antigas com tecido fibrótico. Stack clássico com BPC-157 para lesões agudas severas.",
    diferencialFeminino:
      "Pós-parto de atletas: reparo de tecido conjuntivo, redução de fibrose pélvica. Síndrome aderencial pós-cesárea.",
    beneficios: ["Anti-fibrose", "Angiogênese", "Recuperação pós-parto", "Flexibilidade articular"],
    aviso: "Off-label. Status legal varia. Pureza variável.",
    quickActionsVertex: [
      "TB-500 para diástase pós-parto?",
      "Stack BPC-157 + TB-500: protocolo?",
      "Frequência de injeção semanal?",
    ],
    quickActionsNexus: [
      "Volta ao treino pós-parto: gestão de expectativa",
    ],
  },
  {
    id: "ipamorelin",
    categoria: "peptideo",
    nome: "Ipamorelin",
    nomeCientifico: "Ipamorelin (GHRP seletivo)",
    risco: "medio",
    doseFeminina: "200mcg, 2–3× ao dia (SC)",
    timing: "Manhã em jejum, pré-treino, antes de dormir",
    cicloSemanas: "8–12 semanas com pausa",
    descricao:
      "Pentapeptídeo análogo da grelina com ação SELETIVA no receptor GHS-R1a — libera GH SEM elevar cortisol, prolactina ou ACTH (diferente de GHRP-2/6). Promove pulso fisiológico de GH similar ao endógeno. Em mulheres é o GHRP de escolha pela ausência de efeito hormonal cruzado (sem retenção, sem fome excessiva, sem afetar ciclo).",
    diferencialFeminino:
      "Sem elevação de cortisol = não atrapalha fase lútea. Sem prolactina = não afeta ciclo. Resultados em pele, cabelo, unhas e gordura abdominal são bem documentados em mulheres 35+.",
    beneficios: ["GH pulsátil", "Pele/cabelo/unhas", "Composição corporal", "Sono profundo", "Anti-aging"],
    aviso: "Status off-label. Stack típico com CJC-1295 (GHRH).",
    quickActionsVertex: [
      "Ipamorelin vs Sermorelin: qual preferir?",
      "Stack Ipamorelin + CJC-1295 sem DAC?",
      "Quantos pulsos por dia ideal?",
      "Resistência insulínica com uso longo?",
    ],
    quickActionsNexus: [
      "Decisão de usar peptídeos: como racionalizar?",
    ],
  },
  {
    id: "cjc-1295-no-dac",
    categoria: "peptideo",
    nome: "CJC-1295 sem DAC",
    nomeCientifico: "Modified GRF (1-29) — sem Drug Affinity Complex",
    risco: "medio",
    doseFeminina: "100mcg, 2–3× ao dia (SC)",
    timing: "Junto com Ipamorelin (mesmas injeções)",
    cicloSemanas: "8–12 semanas",
    descricao:
      "Análogo de GHRH (hormônio liberador de GH) de meia-vida CURTA (~30min) — preserva o padrão pulsátil fisiológico de GH. A versão SEM DAC é a preferida em mulheres pois mantém a oscilação natural; a versão COM DAC eleva GH continuamente e altera o padrão fisiológico (mais efeitos colaterais como retenção, túnel do carpo, resistência insulínica).",
    diferencialFeminino:
      "Padrão pulsátil = padrão fisiológico feminino. Versão sem DAC respeita o ritmo natural de GH durante o sono. Combinação obrigatória com Ipamorelin para sinergia GHRH+GHRP.",
    beneficios: ["GH pulsátil fisiológico", "Composição corporal", "Sono profundo", "Recuperação"],
    aviso: "Status off-label. Pureza variável. NUNCA usar versão COM DAC sem orientação médica.",
    quickActionsVertex: [
      "Por que sem DAC para mulheres?",
      "Quantas injeções por dia ideal?",
      "Stack CJC + Ipamorelin: doses?",
      "Quando avaliar IGF-1?",
    ],
    quickActionsNexus: [],
  },
  {
    id: "hgh-frag-176-191",
    categoria: "peptideo",
    nome: "HGH Fragment 176-191",
    nomeCientifico: "AOD9604 / HGH Fragment 176-191",
    risco: "medio",
    doseFeminina: "250–500mcg/dia (SC, manhã em jejum)",
    timing: "Jejum matinal OU pré-cardio em jejum",
    cicloSemanas: "8–12 semanas",
    descricao:
      "Fragmento sintético do GH contendo APENAS a porção lipolítica (aminoácidos 176–191), sem efeito sobre IGF-1 ou crescimento. Ativa receptores β-3 adrenérgicos no tecido adiposo com seletividade ~12× maior que clenbuterol. Lipólise direcionada à gordura visceral e subcutânea resistente. Não causa retenção, não altera glicose. Anti-aging conforme protocolos do Dr. William Seeds.",
    diferencialFeminino:
      "Gordura feminina resistente (quadril, coxa interna, abdômen baixo) tem alta densidade de receptores β-3. Frag 176-191 é uma das ferramentas mais cirúrgicas para essa gordura específica.",
    beneficios: ["Lipólise seletiva β-3", "Gordura resistente feminina", "Sem efeito hormonal cruzado", "Anti-aging"],
    aviso: "Status off-label. Pureza variável.",
    quickActionsVertex: [
      "Frag 176-191 vs GH completo?",
      "Cardio em jejum + Frag: protocolo?",
      "Quanto tempo até ver resultado?",
      "Posso stackar com Ipamorelin?",
    ],
    quickActionsNexus: [
      "Gordura resistente: além do composto, o que mais?",
    ],
  },
  {
    id: "pt-141",
    categoria: "peptideo",
    nome: "PT-141 (Bremelanotide)",
    nomeCientifico: "Bremelanotide (Vyleesi®)",
    risco: "medio",
    doseFeminina: "0.5–1.75mg SC, on-demand (45min antes do ato)",
    timing: "Sob demanda (não diário)",
    descricao:
      "Análogo da α-MSH com ação central nos receptores MC3R e MC4R hipotalâmicos — primeiro composto APROVADO PELO FDA (Vyleesi, 2019) para HSDD (Transtorno do Desejo Sexual Hipoativo) em mulheres pré-menopausa. Ação puramente central — não depende de fluxo sanguíneo. Efetivo em libido baixa pós-SSRI, pós-parto e pós-menopausa.",
    diferencialFeminino:
      "Único composto APROVADO pelo FDA especificamente para libido feminina. Atua no desejo (cérebro), não na resposta vascular. Ferramenta poderosa em libido pós-SSRI ou hormonal-induzida.",
    beneficios: ["HSDD (FDA-approved)", "Libido pós-SSRI", "Libido pós-parto", "Libido pós-menopausa"],
    efeitos_adversos: ["Náusea (40%)", "Rubor facial", "Hiperpigmentação dose-dependente"],
    aviso: "Náusea é comum nas primeiras doses (titular dose). Não usar com hipertensão não controlada.",
    quickActionsVertex: [
      "Como minimizar a náusea?",
      "PT-141 funciona pós-menopausa?",
      "Pode usar com SSRI?",
      "Frequência máxima por semana?",
    ],
    quickActionsNexus: [
      "Libido baixa: vergonha ou solução técnica?",
      "Sexualidade feminina e bodybuilding: paradoxo?",
    ],
  },
  {
    id: "semaglutida",
    categoria: "peptideo",
    nome: "Semaglutida",
    nomeCientifico: "Semaglutide (Ozempic®, Wegovy®)",
    risco: "medio",
    doseFeminina: "0.25mg → titular até 1.0–2.4mg/semana (SC)",
    timing: "1× por semana, mesmo dia",
    cicloSemanas: "Tratamento contínuo prescrito",
    descricao:
      "Análogo de GLP-1 de longa duração — promove saciedade central, retarda esvaziamento gástrico e melhora sensibilidade insulínica. Em mulheres com SOP é especialmente eficaz (resistência insulínica é o motor da SOP). RISCO PRINCIPAL EM MULHERES ATIVAS: subalimentação involuntária → catabolismo muscular severo. Proteína mínima 1.6–2.0g/kg de massa magra é INEGOCIÁVEL.",
    diferencialFeminino:
      "SOP feminina responde excepcionalmente bem (perda de gordura visceral, restauração de ovulação). MAS: massa magra precisa ser monitorada semanalmente (bioimpedância). EAA pré-treino se não conseguir comer antes.",
    beneficios: ["Saciedade", "SOP", "Sensibilidade insulínica", "Perda de gordura visceral"],
    efeitos_adversos: ["Náusea", "Constipação", "Refluxo", "Perda de massa magra (se mal monitorado)", "Pancreatite (raro)"],
    aviso: "PRESCRIÇÃO MÉDICA OBRIGATÓRIA. Proteína 1.6–2.0g/kg MM. Treino de força não-negociável. Monitoramento semanal de massa magra.",
    quickActionsVertex: [
      "Como manter massa magra com semaglutida?",
      "EAA pré-treino: dose ideal?",
      "Náusea persistente: o que fazer?",
      "Quando suspender? Estratégia de saída?",
      "Stack com creatina e HMB?",
    ],
    quickActionsNexus: [
      "Comer por horário, não por fome: como adaptar mindset?",
      "Identidade após perda rápida de peso",
      "Medo de reganhar pós-suspensão",
    ],
  },

  // ═══════════════ ESTEROIDE (EDUCACIONAL) ═══════════════
  {
    id: "oxandrolona",
    categoria: "esteroide",
    nome: "Oxandrolona (Anavar)",
    nomeCientifico: "Oxandrolone",
    apelidos: ["Anavar", "Var"],
    risco: "alto",
    doseFeminina: "5–10mg/dia (MÁXIMO 20mg/dia)",
    doseMasculina: "40–80mg/dia",
    timing: "Dividido 2× ao dia, com refeição",
    cicloSemanas: "6–8 semanas (NUNCA exceder)",
    descricao:
      "Esteroide oral C-17 alfa alquilado, derivado da DHT. Ratio anabólico:androgênico de aproximadamente 10:1 (entre os melhores). Não aromatiza (sem ginecomastia/retenção). É historicamente o esteroide 'feminino' por sua janela terapêutica relativamente mais larga — MAS virilização permanece dose-dependente e individual. Limite máximo absoluto: 20mg/dia por 6–8 semanas.",
    diferencialFeminino:
      "Sinais precoces de virilização (acne severa, voz mais grave, clitoromegalia, hirsutismo facial) DEVEM levar à interrupção IMEDIATA — alguns efeitos (voz, clitóris) são IRREVERSÍVEIS. Hepatotoxicidade real: monitorar TGO/TGP/GGT a cada 4 semanas.",
    beneficios: ["Anabolismo (limitado)", "Densidade muscular", "Sem aromatização", "Vascularização"],
    efeitos_adversos: ["Virilização (dose-dependente)", "Hepatotoxicidade", "Supressão de HDL", "Supressão do eixo HPG", "Acne", "Queda capilar"],
    aviso: "USO ILEGAL SEM PRESCRIÇÃO MÉDICA. Conteúdo educacional/clínico. Sinais de virilização → SUSPENDER IMEDIATAMENTE. Voz, clitóris e hirsutismo facial podem ser IRREVERSÍVEIS.",
    quickActionsVertex: [
      "Sinais precoces de virilização: como identificar?",
      "Exames obrigatórios durante o ciclo?",
      "Protocolo de saída pós-ciclo feminino?",
      "Por que NÃO existe TPC clássico para mulher?",
      "Hepatoprotetores realmente funcionam?",
    ],
    quickActionsNexus: [
      "Decisão de usar AAS: pressão estética vs saúde",
      "Identidade de competidora: limites éticos",
      "Como falar com o médico abertamente?",
      "Arrependimento pós-ciclo: como processar?",
    ],
  },
  {
    id: "drostanolona-propionato",
    categoria: "esteroide",
    nome: "Drostanolona Propionato (Masteron)",
    nomeCientifico: "Drostanolone Propionate",
    apelidos: ["Masteron P", "Mast"],
    risco: "alto",
    doseFeminina: "25–50mg/semana MÁXIMO (dividido 2×/sem)",
    doseMasculina: "300–500mg/semana",
    timing: "2× por semana, IM ou SC profundo",
    cicloSemanas: "4–6 semanas (peak week)",
    descricao:
      "Derivado da DHT — anti-aromatase natural (compete com aromatase reduzindo conversão de testosterona em estrogênio). Densifica musculatura, melhora vascularização e aspecto 'seco'. Versão PROPIONATO (éster curto) é OBRIGATÓRIA para mulheres — meia-vida de 1–2 dias permite suspensão rápida ao primeiro sinal de virilização. ENANTATO é PROIBIDO em mulheres (meia-vida de 7–10 dias = impossível reverter rápido).",
    diferencialFeminino:
      "Voz grave por Masteron é IRREVERSÍVEL. Risco de virilização significativo mesmo em doses 'baixas'. Propionato APENAS — Enantato em mulher é erro grave de coach. Uso restrito a peak week IFBB/NPC sob orientação médica + coach experiente.",
    beneficios: ["Densidade muscular", "Vascularização", "Anti-aromatase", "Aspecto 'seco' em peak week"],
    efeitos_adversos: ["Virilização (alta)", "VOZ IRREVERSÍVEL", "Acne severa", "Hirsutismo", "Queda capilar androgênica", "Supressão HPG"],
    aviso: "USO ILEGAL SEM PRESCRIÇÃO. PROPIONATO APENAS — NUNCA Enantato em mulher. Voz é IRREVERSÍVEL. Suspender ao primeiro sinal de gravamento da voz. Coaches IFBB experientes (Chad Nicholls, Jerry Ward) descrevem protocolos restritos a peak week com monitoramento DIÁRIO.",
    quickActionsVertex: [
      "Por que SÓ propionato em mulher?",
      "Sinais que voz está mudando: o que fazer?",
      "Masteron em peak week: protocolo?",
      "Diferença Masteron vs Primobolan para mulher?",
    ],
    quickActionsNexus: [
      "Voz irreversível: ponderar antes de iniciar",
      "Coach pressiona uso de Masteron: como decidir?",
    ],
  },
  {
    id: "metenolona-enantato",
    categoria: "esteroide",
    nome: "Metenolona Enantato (Primobolan)",
    nomeCientifico: "Methenolone Enanthate",
    apelidos: ["Primo", "Primobolan"],
    risco: "alto",
    doseFeminina: "50–100mg/semana (MÁXIMO 100mg)",
    doseMasculina: "400–700mg/semana",
    timing: "1× por semana, IM",
    cicloSemanas: "8–12 semanas",
    descricao:
      "Derivado da DHT, considerado o esteroide injetável de MENOR potencial de virilização da classe. Não aromatiza, não causa retenção hídrica, ratio anabólico:androgênico aproximadamente 88:44. Protocolo CLÁSSICO de competição feminina IFBB old-school. MESMO ASSIM, virilização é possível em uso prolongado ou doses >100mg/sem.",
    diferencialFeminino:
      "Mais 'tolerado' entre os AAS injetáveis para mulheres, mas falsa sensação de segurança é perigosa. Monitoramento clínico obrigatório. Original (Schering) extremamente raro — falsificações abundantes no mercado paralelo.",
    beneficios: ["Densidade muscular", "Sem aromatização", "Sem retenção", "Menor virilização da classe injetável"],
    efeitos_adversos: ["Virilização (menor mas presente)", "Supressão HPG", "Lipídios alterados", "Queda capilar (DHT)"],
    aviso: "USO ILEGAL SEM PRESCRIÇÃO. Falsificações dominam o mercado. 'Menor risco' ≠ 'sem risco'.",
    quickActionsVertex: [
      "Primobolan vs Anavar para iniciante feminina?",
      "Como identificar Primo verdadeiro?",
      "Protocolo clássico de competição feminina?",
      "Stack Primo + Anavar: lógica?",
    ],
    quickActionsNexus: [
      "Pressão para 'evoluir' no palco: limites pessoais",
    ],
  },
  {
    id: "trt-feminina",
    categoria: "esteroide",
    nome: "Testosterona (TRT Feminina)",
    nomeCientifico: "Testosterone (subcutânea ou gel)",
    risco: "medio",
    doseFeminina: "Gel: 1/10 dose masc. | Propionato SC: 5–10mg/sem",
    timing: "Gel: diário | Propionato: 2×/sem SC",
    descricao:
      "Reposição fisiológica de testosterona em mulheres com testosterona total <15ng/dL ou livre baixa, sintomáticas (fadiga, libido baixa, perda de massa magra, depressão refratária). Indicado especialmente em pós-menopausa, pós-ooforectomia ou hipogonadismo feminino. Objetivo: restaurar níveis ao TERÇO SUPERIOR do range feminino — NÃO acima.",
    diferencialFeminino:
      "TRT feminina é terapia LEGÍTIMA e crescente em endocrinologia. Diferente de uso ergogênico — objetivo é range fisiológico. Gel transdérmico é mais previsível; propionato SC requer monitoramento mais próximo. Reavaliar a cada 6 semanas com exames.",
    beneficios: ["Libido", "Energia", "Composição corporal", "Densidade óssea", "Humor", "Função cognitiva"],
    efeitos_adversos: ["Acne (se supraterapêutico)", "Hirsutismo (se supraterapêutico)", "Hematócrito elevado"],
    aviso: "PRESCRIÇÃO MÉDICA OBRIGATÓRIA. Diferenciar TRT (terapêutica) de uso ergogênico. Monitorar T total, livre, SHBG, hematócrito a cada 6 semanas.",
    quickActionsVertex: [
      "Quando TRT é indicada para mulher?",
      "Gel vs propionato SC: qual escolher?",
      "Exames obrigatórios e frequência?",
      "Posso fazer TRT amamentando?",
    ],
    quickActionsNexus: [
      "TRT feminina: superar tabu cultural",
      "Diferença entre 'precisar' e 'querer mais'",
    ],
  },
  {
    id: "gh-recombinante",
    categoria: "esteroide",
    nome: "GH Recombinante (Somatropina)",
    nomeCientifico: "Recombinant Human Growth Hormone (rHGH)",
    apelidos: ["Somatropina", "rGH", "HGH"],
    risco: "alto",
    doseFeminina: "1–2 UI/dia (sensibilidade 2–3× maior que homem)",
    doseMasculina: "3–6 UI/dia",
    timing: "Manhã em jejum + pré-treino OU 1× ao deitar",
    cicloSemanas: "16–24 semanas (uso prolongado)",
    descricao:
      "Hormônio de crescimento humano recombinante. Em mulheres, a sensibilidade aos efeitos do GH é 2–3× MAIOR que em homens — doses devem ser proporcionalmente menores. Lipólise potente, anabolismo modesto, anti-aging marcante (pele, colágeno, cabelo). Risco principal: resistência insulínica progressiva → diabetes induzido se mal monitorado. TRT-GH em mulheres 45+ é prática crescente em medicina anti-aging.",
    diferencialFeminino:
      "Sensibilidade DOBRADA → doses MAIS BAIXAS produzem mesmos efeitos. Mais propensão a edema/túnel do carpo nas primeiras semanas. Resposta de pele/colágeno é dramática em mulheres pós-40.",
    beneficios: ["Lipólise potente", "Pele/colágeno", "Recuperação", "Composição corporal", "Sono profundo"],
    efeitos_adversos: ["Resistência insulínica", "Túnel do carpo", "Edema", "Hipoglicemia reativa", "Custo elevado"],
    aviso: "PRESCRIÇÃO MÉDICA OBRIGATÓRIA. Monitorar HbA1c, glicemia jejum, IGF-1 a cada 8 semanas. Mulheres respondem com 1/3 a 1/2 da dose masculina.",
    quickActionsVertex: [
      "GH em jejum vs pré-treino vs noite?",
      "GH e SOP: cuidado com resistência insulínica?",
      "Stack GH + Ipamorelin faz sentido?",
      "Quanto tempo até efeito visível na pele?",
      "Sinais de túnel do carpo: o que fazer?",
    ],
    quickActionsNexus: [
      "GH como anti-aging: limites éticos pessoais",
      "Custo elevado e identidade de atleta",
    ],
  },
];

export const ERGO_CATEGORIAS: { id: ErgoCategoria | "todos"; label: string; cor: string }[] = [
  { id: "todos", label: "Todos", cor: "rose" },
  { id: "ergogenico", label: "Ergogênicos", cor: "sage" },
  { id: "hormonal", label: "Hormonal", cor: "rose" },
  { id: "adaptogeno", label: "Adaptógenos", cor: "lavender" },
  { id: "metabolico", label: "Metabólico", cor: "cyan" },
  { id: "peptideo", label: "Peptídeos", cor: "gold" },
  { id: "esteroide", label: "Esteroides", cor: "mauve" },
];

export const RISCO_CONFIG: Record<ErgoRisco, { label: string; bg: string; text: string }> = {
  baixo: { label: "RISCO BAIXO", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  medio: { label: "RISCO MÉDIO", bg: "bg-amber-500/10", text: "text-amber-400" },
  alto: { label: "RISCO ALTO", bg: "bg-rose-500/10", text: "text-rose-400" },
  extremo: { label: "RISCO EXTREMO", bg: "bg-red-600/15", text: "text-red-500" },
};

export const FASES_CICLO: Record<FaseCiclo, { label: string; dias: string; cor: string; hex: string }> = {
  menstrual: { label: "Menstrual", dias: "D1–5", cor: "rose", hex: "#C4546A" },
  folicular: { label: "Folicular", dias: "D6–13", cor: "sage", hex: "#7A9A7A" },
  ovulatoria: { label: "Ovulatória", dias: "D14–16", cor: "gold", hex: "#C9A96E" },
  lutea: { label: "Lútea", dias: "D17–28", cor: "mauve", hex: "#9B6D8A" },
};
