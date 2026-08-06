/** RUN ON — Módulo Híbrido de Performance (Musculação + Corrida) · base estática. */

/* ── PARTE 1 — Ciência do Efeito de Interferência ── */
export const interferenceIntro = [
  "Quando força e endurance são combinados existe um conflito molecular potencial: a via mTOR/S6K1 (anabolismo) pode ser parcialmente suprimida pela via AMPK (adaptação aeróbia). Isso é o Efeito de Interferência.",
  "A interferência é REAL, mas modesta e gerenciável — o problema aparece com volumes altos de cardio intenso próximos aos músculos que você quer desenvolver.",
];

export const interferenceEvidence = [
  { title: "Umbrella Review 2025", desc: "17 meta-análises · 144 estudos · 1.492 participantes: treinamento concorrente produz melhorias aeróbias comparáveis ao endurance isolado.", tag: "PUBMED" },
  { title: "Chen et al. 2024", desc: "Rede de 40 estudos / 841 participantes: HIIT + musculação e ciclismo moderado + musculação foram SUPERIORES à musculação sozinha para MCSA de membros inferiores.", tag: "NETWORK META" },
  { title: "Revisão 2024", desc: "Ciclismo causa significativamente menos interferência na força de membros inferiores que a corrida — menor dano excêntrico.", tag: "MODALIDADE" },
  { title: "Review 2025", desc: "Separar sessões por 6+ horas reduz de forma significativa a supressão aguda de S6K1.", tag: "TIMING" },
];

export const goldenRules = [
  { rule: "< 150 min/semana de LISS = interferência 0–10%", why: "Threshold validado por múltiplos estudos 2024–2026." },
  { rule: "Separar corrida de leg day por 48h", why: "Recuperação das vias moleculares AMPK → mTOR." },
  { rule: "LISS > HIIT para preservar hipertrofia", why: "HIIT recruta fibras tipo II — as mesmas do treino de peso." },
  { rule: "Corrida DEPOIS do treino de peso (mesmo dia)", why: "mTOR é mais sensível nas primeiras horas pós-treino." },
  { rule: "6+ horas entre sessões (ideal)", why: "Reduz supressão aguda de S6K1." },
  { rule: "Nutrição é o mediador #1", why: "Déficit + corrida = catabolismo. Superávit inteligente = sem interferência." },
  { rule: "Zona 2 é sua aliada", why: "60–70% FC máx, pace conversacional, preserva glicogênio." },
];

export const runVsBike: { criterio: string; corrida: string; ciclismo: string; win: "run" | "bike" | "tie" }[] = [
  { criterio: "Dano muscular excêntrico", corrida: "ALTO", ciclismo: "BAIXO", win: "bike" },
  { criterio: "Interferência na hipertrofia de pernas", corrida: "MODERADA", ciclismo: "MÍNIMA", win: "bike" },
  { criterio: "Impacto articular", corrida: "ALTO", ciclismo: "BAIXO", win: "bike" },
  { criterio: "Transferência funcional", corrida: "ALTA", ciclismo: "MODERADA", win: "run" },
  { criterio: "Queima calórica por minuto", corrida: "ALTA", ciclismo: "MODERADA", win: "run" },
  { criterio: "Benefício cardiovascular", corrida: "EXCELENTE", ciclismo: "EXCELENTE", win: "tie" },
  { criterio: "Satisfação / experiência", corrida: "INDIVIDUAL", ciclismo: "INDIVIDUAL", win: "tie" },
];

export const runVsBikeVerdict =
  "Para o bodybuilder que QUER correr, a chave não é evitar — é programar. Ciclismo como cardio complementar nos dias próximos ao leg day; corrida nos dias mais distantes.";

/* ── PARTE 2 — Arquitetura semanal do bodybuilder ── */
export interface BBDay {
  day: string;
  lift: string;
  cardio: string;
  note: string;
  color: string;
}
export interface BBWeek {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  volume: string;
  rule: string;
  days: BBDay[];
}

const GOLD = "#B8922A";
const CY = "#00D4FF";
const GR = "#22c55e";
const OR = "#f97316";
const RD = "#ef4444";
const PU = "#a855f7";

export const bbWeeks: BBWeek[] = [
  {
    id: "off",
    name: "OFF-SEASON",
    subtitle: "Hipertrofia de pernas + corrida recreativa",
    color: GR,
    volume: "65–90 min corrida/semana",
    rule: "Mínimo 48h entre corrida e dia de pernas",
    days: [
      { day: "SEG", lift: "PERNAS A (quad-dominant) — volume alto", cardio: "Sem cardio", note: "Squat, leg press, hack, extensora, avanço. Proteger mTOR.", color: RD },
      { day: "TER", lift: "PEITO + TRÍCEPS (manhã)", cardio: "Corrida LISS Z2 · 30–40 min (tarde)", note: "Pace conversacional, FC 60–70% máx. Pós: 30g whey + 40g carb.", color: CY },
      { day: "QUA", lift: "COSTAS + BÍCEPS — sessão completa", cardio: "Sem cardio", note: "Recuperação do SNC.", color: RD },
      { day: "QUI", lift: "PERNAS B (posterior/glúteo) — intensidade", cardio: "Sem cardio", note: "RDL, stiff, leg curl, hip thrust, panturrilha.", color: RD },
      { day: "SEX", lift: "OMBROS + BRAÇOS (manhã)", cardio: "Corrida 35–45 min (tarde)", note: "10 min Z2 + 4×3 min tempo + 10 min Z2 cooldown. Pós: refeição P+C+G.", color: OR },
      { day: "SÁB", lift: "Opcional: posing practice", cardio: "Ciclismo LISS ou caminhada inclinada 30–45 min", note: "Zona 2 estrita — recuperação ativa.", color: GR },
      { day: "DOM", lift: "REST DAY TOTAL", cardio: "—", note: "Mobilidade, foam rolling, sauna. Sono 8h+, hidratação, magnésio.", color: PU },
    ],
  },
  {
    id: "prep16",
    name: "PRE-CONTEST 16–8w",
    subtitle: "Secagem com corrida mantida",
    color: CY,
    volume: "Cardio total ↑ · intensidade mantida BAIXA",
    rule: "Zona 2 é aliada na secagem — o problema é correr forte em déficit",
    days: [
      { day: "SEG", lift: "PERNAS A — volume moderado (-10/15%)", cardio: "Sem cardio", note: "Manter intensidade, reduzir volume vs off-season.", color: RD },
      { day: "TER", lift: "PEITO + TRÍCEPS (manhã)", cardio: "Corrida LISS Z2 · 25–35 min", note: "Fasted cardio opcional conforme protocolo termogênico.", color: CY },
      { day: "QUA", lift: "COSTAS + BÍCEPS (manhã)", cardio: "Caminhada inclinada 30 min (10–15% incline)", note: "Gasto calórico sem dano excêntrico.", color: GOLD },
      { day: "QUI", lift: "PERNAS B — manutenção", cardio: "Sem cardio", note: "Manter cargas, reduzir sets.", color: RD },
      { day: "SEX", lift: "OMBROS + BRAÇOS (manhã)", cardio: "Corrida LISS 20–30 min · pace leve", note: "Sem tempo runs nesta fase.", color: CY },
      { day: "SÁB", lift: "Posing practice obrigatório (30 min)", cardio: "Ciclismo LISS ou caminhada 20–30 min", note: "Baixo impacto.", color: GR },
      { day: "DOM", lift: "Posing, fotos de progresso, ajuste de dieta", cardio: "Rest ou caminhada leve 20 min", note: "Checkpoint semanal.", color: PU },
    ],
  },
  {
    id: "prep8",
    name: "PREP FINAL 8–4w",
    subtitle: "Preservação máxima · impacto mínimo",
    color: OR,
    volume: "Corrida reduzida ou substituída",
    rule: "Minimizar dano excêntrico mantendo gasto calórico",
    days: [
      { day: "SEG", lift: "PERNAS A — preservação (70–80% 1RM, 3–4 sets)", cardio: "Sem cardio", note: "Estímulo mínimo eficaz.", color: RD },
      { day: "TER", lift: "PEITO + TRÍCEPS (manhã)", cardio: "Caminhada inclinada 35–45 min", note: "Substitui a corrida.", color: GOLD },
      { day: "QUA", lift: "COSTAS + BÍCEPS (manhã)", cardio: "Ciclismo leve 25–35 min", note: "Zero impacto articular.", color: GR },
      { day: "QUI", lift: "PERNAS B — preservação", cardio: "Sem cardio", note: "Cargas mantidas, volume mínimo.", color: RD },
      { day: "SEX", lift: "OMBROS + BRAÇOS (manhã)", cardio: "Corrida LISS leve 20 min OU caminhada 30 min", note: "Só se o condicionamento permitir.", color: CY },
      { day: "SÁB", lift: "Posing 30 min", cardio: "Caminhada 30 min", note: "Prática de palco.", color: GOLD },
      { day: "DOM", lift: "REST TOTAL", cardio: "—", note: "Recuperação integral.", color: PU },
    ],
  },
];

/* ── PARTE 3 — Mestres ── */
export interface Master {
  name: string;
  role: string;
  bio: string;
  color: string;
  principles: string[];
  application?: string;
}

export const masters: Master[] = [
  {
    name: "Alex Viada",
    role: "Complete Human Performance",
    bio: "Criador do conceito Hybrid Athlete. Agachamento 700 lbs + milha sub-4:30 + ultramaratonas. Autor de The Hybrid Athlete (2015) e The Ultimate Hybrid Athlete (2025).",
    color: CY,
    principles: [
      "Força e endurance não são entidades separadas — cada componente respeita os desafios do outro.",
      "Periodização cruzada: blocos de volume de corrida em semanas de deload de peso e vice-versa.",
      "Corrida longa e lenta NÃO impede ganhos de força — o que impede é correr forte demais, comer pouco e dormir mal.",
      "Nutrição é o diferencial, especialmente micronutrientes (ferro, cálcio, magnésio) depletados pelo treino concorrente.",
      "Os limites de performance simultânea são muito mais altos do que se acredita.",
    ],
    application: "O RUN ON usa os princípios de Viada para calcular a periodização cruzada entre blocos, evitando sobrecarga simultânea nos dois sistemas.",
  },
  {
    name: "Nick Bare",
    role: "BPN Training · Hybrid Build",
    bio: "Fundador da Bare Performance Nutrition, ex-líder de pelotão de infantaria. Maratona 2:48, Ironman, ultra de 100 milhas e competição de bodybuilding.",
    color: GOLD,
    principles: [
      "Nutrição como fundação — proteína alta e calorias totais suficientes.",
      "Progressive overload na musculação — 6–12 reps, múltiplos sets, descanso curto.",
      "Corrida como complemento, não inimiga: músculos e quilometragem trabalham juntos.",
      "Volume alto de musculação mesmo correndo 40–85 milhas/semana.",
      "5 sessões de musculação + 5 de corrida/semana para avançados.",
      "2 dias de mobilidade/recuperação obrigatórios.",
    ],
    application: "Cardio pela manhã, musculação à tarde — o RUN ON adapta esse modelo priorizando hipertrofia.",
  },
  {
    name: "Barbell Medicine",
    role: "Dr. Jordan Feigenbaum & Dr. Austin Baraki",
    bio: "Referência clínica em treinamento baseado em evidência.",
    color: GR,
    principles: [
      "LISS é superior para preservar hipertrofia — 3–4 sessões/semana em Zona 2.",
      "O efeito de interferência é real, mas gerenciável com nutrição e programação.",
      "Não empilhar HIIT sobre treino de pernas pesado.",
      "A interferência é modality-specific: corrida afeta mais pernas do que upper body.",
      "Ciclismo causa menos interferência que corrida em membros inferiores.",
    ],
  },
  {
    name: "Broderick Chavez",
    role: "Sports Performance Expert",
    bio: "Biólogo e químico com 30+ anos em performance esportiva. Treinou IFBB Pros e atletas olímpicos.",
    color: PU,
    principles: [
      "Equipoise favorece atletas que fazem cardio por aumentar eritropoiese e transporte de oxigênio.",
      "Estrogênio em range fisiológico é cardioprotetor — não esmagar com inibidor de aromatase.",
      "Cardio é obrigatório para saúde cardiovascular de quem usa AAS (cardiomiopatia, HVE, dislipidemia).",
      "Dose-resposta: doses moderadas + cardio = longevidade no esporte.",
    ],
  },
];

/* ── PARTE 4 — Farmacologia do atleta híbrido ── */
export const pharmaDisclaimer =
  "Conteúdo educacional e referencial, baseado em literatura científica e práticas documentadas no esporte competitivo. Todo uso de substâncias exige acompanhamento de profissional médico habilitado. Detalhes completos no módulo Dr. VERTEX.";

export interface Compound {
  name: string;
  mechanism: string;
  benefit: string;
  note: string;
}

export const compoundsFavor: Compound[] = [
  { name: "Equipoise (Boldenona)", mechanism: "Aumenta eritropoiese", benefit: "Melhor transporte de O₂ e endurance", note: "Aromatização fraca — bom para composição corporal" },
  { name: "Primobolan (Metenolona)", mechanism: "Anabólico suave, baixa retenção", benefit: "Preserva massa magra sem peso extra", note: "Ideal para prep + corrida" },
  { name: "Anavar (Oxandrolona)", mechanism: "Força sem massa excessiva", benefit: "Não compromete power-to-weight", note: "Bom para fases de corte" },
  { name: "Testosterona (base)", mechanism: "Fundação hormonal", benefit: "Mantém anabolismo e cardioproteção via E2", note: "Dose moderada 200–500 mg/sem" },
  { name: "GH", mechanism: "Lipólise, recuperação, colágeno", benefit: "Acelera recuperação entre sessões duplas", note: "Sinérgico com peptídeos" },
  { name: "Cardarine (GW-501516)", mechanism: "Ativador PPARδ", benefit: "Oxidação de ácidos graxos, endurance", note: "Não é SARM · status regulatório controverso" },
];

export const compoundsAgainst = [
  { name: "Trembolona", issue: "Prejudica capacidade cardiovascular, aumenta FC basal" },
  { name: "Dianabol (alta dose)", issue: "Retenção hídrica excessiva, peso desnecessário" },
  { name: "Anadrol", issue: "Retenção massiva, pressão arterial, compromete cardio" },
  { name: "Halotestin", issue: "Extremamente hepatotóxico, sem benefício para endurance" },
  { name: "Insulina (má gestão)", issue: "Risco de hipoglicemia durante a corrida = PERIGO" },
];

export const pharmaPhases = [
  {
    phase: "OFF-SEASON",
    subtitle: "Hipertrofia + corrida recreativa",
    color: GR,
    items: [
      "Base: Testosterona 300–500 mg/sem",
      "Opcional: Equipoise 300–400 mg/sem (eritropoiese + lean gains)",
      "GH: 2–4 UI/dia (recuperação + colágeno)",
      "Secretagogos: CJC-1295 + Ipamorelin (noturno)",
    ],
  },
  {
    phase: "PRE-CONTEST",
    subtitle: "Secagem + corrida mantida",
    color: OR,
    items: [
      "Base: Testosterona Propionato 200 mg/sem (ou dose TRT)",
      "Primobolan 400–600 mg/sem (preservação muscular)",
      "Anavar 40–60 mg/dia (últimas 6–8 semanas)",
      "Masteron 400–600 mg/sem (hardening + anti-E2 leve)",
      "GH: 4–6 UI/dia (lipólise + preservação)",
      "Opcionais: T3 (25–50 mcg), Clembuterol (2on/2off)",
    ],
  },
];

export const cardioSafety = [
  "Manter estrogênio em range fisiológico — cardioproteção.",
  "Não usar inibidor de aromatase em excesso: esmagar E2 piora perfil lipídico.",
  "Cardio LISS regular mitiga efeitos adversos dos AAS no coração.",
  "Monitorar hematócrito (especialmente com Equipoise) — doar sangue se necessário.",
  "Exames regulares: lipidograma, ecocardiograma, hemograma completo.",
];

/* ── PARTE 5 — Peptídeos ── */
export interface Peptide {
  id: string;
  name: string;
  full: string;
  category: "Reparo tecidual" | "Mitocondrial" | "GH Secretagogo" | "Metabólico";
  color: string;
  what: string;
  mechanism: string;
  forAthlete: string;
  protocol: string;
  evidence?: string;
  wada?: string;
  extra?: string[];
}

export const peptides: Peptide[] = [
  {
    id: "bpc157", name: "BPC-157", full: "Body Protection Compound-157", category: "Reparo tecidual", color: GR,
    what: "Pentadecapeptídeo gástrico de 15 aminoácidos.",
    mechanism: "Upregula receptores de GH, promove angiogênese na inserção tendinosa, modula o sistema do óxido nítrico.",
    forAthlete: "Reparo de tendões (Aquiles, patelar, fáscia plantar) — as lesões mais comuns em quem corre e faz leg day pesado.",
    protocol: "250–500 mcg/dia SC próximo ao tendão afetado · 4–12 semanas na lesão ou ciclos de manutenção de 4–6 semanas.",
    evidence: "Revisão sistemática 2025 (ortopedia esportiva) confirmou resultados funcionais, estruturais e biomecânicos positivos em modelos animais. Piloto humano: 7/12 com alívio de dor crônica no joelho por 6+ meses após injeção única.",
    wada: "Proibido desde 2022",
  },
  {
    id: "tb500", name: "TB-500", full: "Thymosin Beta-4", category: "Reparo tecidual", color: GR,
    what: "Fragmento sintético da Timosina Beta-4.",
    mechanism: "Migração celular via actina, angiogênese e remodelação tecidual.",
    forAthlete: "Reparo sistêmico para múltiplas áreas de estresse — ideal para quem treina peso e corre.",
    protocol: "Carga: 2–2.5 mg 2×/semana por 4–6 semanas · Manutenção: 2 mg 1×/semana.",
    extra: [
      "Janela biológica mais longa que o BPC-157 (dias vs horas) — menos injeções.",
      "Wolverine Stack: BPC-157 (local) + TB-500 (sistêmico) — mecanismos complementares.",
    ],
    wada: "Flagada em contextos de TUE",
  },
  {
    id: "ghkcu", name: "GHK-Cu", full: "Glycyl-L-Histidyl-L-Lysine Copper", category: "Reparo tecidual", color: CY,
    what: "Tripeptídeo naturalmente presente no plasma humano que liga cobre.",
    mechanism: "Estimula colágeno, elastina e glicosaminoglicanos. Modula expressão de 4.000+ genes.",
    forAthlete: "Qualidade de tecido conectivo (tendões, ligamentos, pele) e remodelação de colágeno. NÃO é peptídeo de crescimento muscular nem de perda de gordura.",
    protocol: "1–2 mg/dia SC · ciclos de 4–8 semanas.",
    extra: [
      "GLOW Stack: GHK-Cu + BPC-157 + TB-500 para reparo full-spectrum.",
      "Classic Physique: qualidade de pele pré-competição + reparo de tendões do treino duplo.",
    ],
    wada: "Não está na lista proibida (2026)",
  },
  {
    id: "motsc", name: "MOTS-c", full: "Mitochondrial ORF of 12S rRNA type-c", category: "Mitocondrial", color: OR,
    what: "Peptídeo derivado do DNA mitocondrial — um hormônio mitocondrial.",
    mechanism: "Ativa AMPK, promove oxidação de ácidos graxos, regula glicose e melhora flexibilidade metabólica via PGC-1α e biogênese mitocondrial.",
    forAthlete: "O peptídeo mais promissor para endurance: melhora a capacidade de alternar entre carboidrato e gordura como combustível.",
    protocol: "5–10 mg, 3–5×/semana SC · ciclos de 4–8 semanas on / 4 off.",
    evidence: "Corredores de maratona vs sedentários: níveis séricos associados à capacidade aeróbia. Em ratos, MOTS-c exógeno melhorou capacidade de exercício, função sistólica e eficiência miocárdica.",
    wada: "Provavelmente proibido (hormônios peptídicos)",
  },
  {
    id: "ss31", name: "SS-31", full: "Elamipretide", category: "Mitocondrial", color: OR,
    what: "Tetrapeptídeo sintético que se acumula na membrana mitocondrial interna.",
    mechanism: "Liga-se à cardiolipina, estabiliza a membrana interna e melhora a eficiência da cadeia transportadora de elétrons. Não é estimulante — é infraestrutura.",
    forAthlete: "Mais ATP, menos dano oxidativo, maior resistência à fadiga. Trata o gargalo mitocondrial do treino intenso.",
    protocol: "0.25–1 mg/kg/dia SC ou IV.",
    evidence: "Ratos idosos: tratamento agudo restaurou energética mitocondrial a níveis jovens. 8 semanas: aumento de massa do gastrocnêmio e maior endurance. Ensaios humanos em miopatias mitocondriais mostraram melhorias funcionais.",
    extra: ["SS-31 = estabilização de membrana · MOTS-c = condicionamento metabólico. Juntos: infraestrutura + eficiência."],
    wada: "Pode cair sob S0 (substâncias não aprovadas)",
  },
  {
    id: "humanin", name: "Humanin", full: "Peptídeo mitocondrial", category: "Mitocondrial", color: OR,
    what: "Peptídeo derivado do DNA mitocondrial, como o MOTS-c.",
    mechanism: "Citoproteção, neuroproteção e proteção cardíaca.",
    forAthlete: "Proteção cardiovascular (relevante para quem usa AAS e faz cardio) e longevidade celular.",
    protocol: "Experimental — sinergia com SS-31 para proteção cognitiva e cardíaca de longo prazo.",
    wada: "Experimental, não proibido",
  },
  {
    id: "cjc-ipa", name: "CJC-1295 + Ipamorelin", full: "O stack clássico", category: "GH Secretagogo", color: GOLD,
    what: "CJC-1295 (análogo de GHRH) + Ipamorelin (GHRP que não eleva cortisol).",
    mechanism: "Ativação dual-receptor (GHRH + grelina) produz 3–5× mais GH do que qualquer um isolado.",
    forAthlete: "Lipólise preservando massa, síntese de colágeno (protege tendões do impacto), melhora do sono e preservação de massa magra em déficit.",
    protocol: "100 mcg + 100 mcg, 2–3×/dia (ao acordar, pré-treino e antes de dormir) · 8–12 semanas on / 4 off, ou 5 on / 2 off semanal.",
  },
  {
    id: "tesa", name: "Tesamorelin", full: "Egrifta", category: "GH Secretagogo", color: GOLD,
    what: "Único análogo de GHRH aprovado pela FDA (lipodistrofia associada ao HIV).",
    mechanism: "Redução de gordura visceral de 15–18% em ensaios clínicos, mensurável por DEXA.",
    forAthlete: "Ataca gordura abdominal profunda preservando massa magra. Menos gordura visceral = melhor relação potência/peso.",
    protocol: "2 mg/dia SC, injeção noturna. Stack de prep: Tesamorelin + CJC-1295 + Ipamorelin.",
  },
  {
    id: "aod", name: "AOD-9604", full: "Advanced Obesity Drug", category: "Metabólico", color: PU,
    what: "Fragmento do HGH (aminoácidos 177-191) ligado ao metabolismo de gordura.",
    mechanism: "Ação lipolítica direta sem afetar glicemia ou IGF-1.",
    forAthlete: "Perda de gordura sem retenção hídrica nem risco de hipoglicemia. Sinergia com corrida LISS em jejum.",
    protocol: "250–500 mcg/dia SC, pela manhã em jejum.",
  },
  {
    id: "mk677", name: "MK-677", full: "Ibutamoren", category: "GH Secretagogo", color: GOLD,
    what: "Secretagogo de GH oral que mimetiza a grelina.",
    mechanism: "Elevação sustentada de GH/IGF-1 por via oral.",
    forAthlete: "Off-season com foco em hipertrofia e corrida recreativa — o apetite elevado é bem-vindo. Desvantagem: retenção hídrica e fome intensa.",
    protocol: "10–25 mg/dia, antes de dormir.",
  },
  {
    id: "5a1mq", name: "5-Amino-1MQ", full: "Inibidor de NNMT", category: "Metabólico", color: PU,
    what: "Molécula oral que bloqueia armazenamento de gordura.",
    mechanism: "Inibe a NNMT (nicotinamide N-methyltransferase).",
    forAthlete: "Aumenta gasto energético basal sem estimulação do SNC — não interfere na FC da corrida.",
    protocol: "50–150 mg/dia oral · ciclos de 8–12 semanas.",
  },
  {
    id: "glp1", name: "Semaglutida / Tirzepatida", full: "Agonistas GLP-1", category: "Metabólico", color: PU,
    what: "Agonistas de receptor GLP-1 usados para controle de apetite.",
    mechanism: "Retardo do esvaziamento gástrico e sinalização central de saciedade.",
    forAthlete: "Risco de perda de massa magra em doses altas. Para quem treina pesado E corre, doses baixas ajudam composição sem catabolismo significativo.",
    protocol: "Uso estratégico em prep: microdoses (0.25–0.5 mg/semana) nas últimas semanas.",
    wada: "Programa de monitoramento 2024 (não proibidos)",
  },
];

export interface PeptideStack {
  id: string;
  name: string;
  phase: string;
  color: string;
  goal: string;
  items: { compound: string; dose: string; freq: string }[];
}

export const peptideStacks: PeptideStack[] = [
  {
    id: "iron", name: "IRON RUNNER", phase: "Off-season · hipertrofia + corrida", color: GR,
    goal: "Recuperação acelerada entre sessões duplas, proteção de tendões, melhora aeróbia e composição corporal.",
    items: [
      { compound: "CJC-1295 (sem DAC)", dose: "100 mcg", freq: "2×/dia (manhã + noite)" },
      { compound: "Ipamorelin", dose: "100 mcg", freq: "2×/dia (manhã + noite)" },
      { compound: "BPC-157", dose: "250 mcg", freq: "1×/dia (tendões estressados)" },
      { compound: "MOTS-c", dose: "10 mg", freq: "3×/semana (dias de corrida)" },
    ],
  },
  {
    id: "stage", name: "STAGE READY", phase: "Pre-contest · secagem com corrida", color: OR,
    goal: "Lipólise máxima com preservação muscular, proteção mitocondrial no déficit e reparo durante volume de cardio aumentado.",
    items: [
      { compound: "Tesamorelin", dose: "2 mg", freq: "1×/dia (noite)" },
      { compound: "CJC-1295 + Ipamorelin", dose: "100 + 100 mcg", freq: "2×/dia" },
      { compound: "AOD-9604", dose: "300 mcg", freq: "1×/dia (jejum, pré-corrida)" },
      { compound: "BPC-157 + TB-500", dose: "250 mcg + 2 mg", freq: "conforme necessidade" },
      { compound: "SS-31", dose: "0.5 mg/kg", freq: "3×/semana (treino intenso)" },
    ],
  },
  {
    id: "wolverine", name: "WOLVERINE RECOVERY", phase: "Lesão · reabilitação", color: RD,
    goal: "Reparo agressivo de tecido conectivo e retorno mais rápido ao treinamento.",
    items: [
      { compound: "BPC-157", dose: "500 mcg", freq: "2×/dia (local)" },
      { compound: "TB-500", dose: "2.5 mg", freq: "2×/semana" },
      { compound: "GHK-Cu", dose: "1–2 mg", freq: "1×/dia" },
      { compound: "Ipamorelin + CJC-1295", dose: "100 + 100 mcg", freq: "1×/dia (noite)" },
    ],
  },
  {
    id: "mito", name: "MITOCHONDRIAL UPGRADE", phase: "Performance de endurance", color: CY,
    goal: "Biogênese mitocondrial, eficiência da cadeia de elétrons, flexibilidade metabólica e endurance.",
    items: [
      { compound: "MOTS-c", dose: "10 mg", freq: "5×/semana" },
      { compound: "SS-31", dose: "0.5 mg/kg", freq: "3×/semana" },
      { compound: "CJC-1295 + Ipamorelin", dose: "100 + 100 mcg", freq: "1×/dia (noite)" },
    ],
  },
];

/* ── PARTE 6 — Fuel Matrix ── */
export const hybridMacros = [
  { name: "PROTEÍNA", value: "2.0–2.4 g/kg/dia", note: "Mais alta que bodybuilder puro — compensa oxidação de aminoácidos na corrida.", color: GOLD },
  { name: "CARBOIDRATO", value: "Off 4–6 · Prep 2–4 g/kg", note: "+30–50g extra pré e pós corrida longa. Periodizar com dias de realimentação.", color: CY },
  { name: "GORDURA", value: "0.8–1.2 g/kg/dia", note: "Sustenta produção hormonal, sobretudo com eixo HPT suprimido.", color: OR },
];

export const criticalMicros = [
  { name: "Ferro", dose: "Monitorar ferritina", note: "A corrida depleta significativamente" },
  { name: "Magnésio", dose: "400–600 mg/dia", note: "Função muscular + sono" },
  { name: "Cálcio", dose: "1000–1200 mg/dia", note: "Impacto repetitivo + densidade óssea" },
  { name: "Vitamina D", dose: "3000–5000 UI/dia", note: "Suporte hormonal e imune" },
  { name: "Eletrólitos", dose: "Sódio · potássio · magnésio", note: "Crítico em clima quente" },
  { name: "Zinco", dose: "25–50 mg/dia", note: "Suporte hormonal" },
];

export const doubleSessionTimeline = [
  { time: "05:30", action: "Acordar" },
  { time: "05:45", action: "Pré-corrida: 20–30g CHO rápido + café (ou fasted)" },
  { time: "06:00", action: "CORRIDA LISS · 30–40 min Zona 2" },
  { time: "06:45", action: "Pós-corrida: 30g whey + 40g CHO + eletrólitos" },
  { time: "08:00", action: "Refeição completa: arroz + frango + vegetais + gordura" },
  { time: "12:00", action: "Almoço P+C+G (mais carbs se treina à tarde)" },
  { time: "15:30", action: "Pré-treino: 30–40g CHO + creatina + café" },
  { time: "16:00", action: "MUSCULAÇÃO · 60–75 min" },
  { time: "17:15", action: "Pós-treino: 40g whey + 60g CHO rápido" },
  { time: "19:00", action: "Jantar P+C+G moderado em carbs" },
  { time: "21:00", action: "Ceia: caseína + gorduras + magnésio" },
  { time: "21:30", action: "Protocolo noturno de recuperação" },
  { time: "22:00", action: "Dormir — mínimo 8h" },
];

/* ── PARTE 8 — Monitoramento ── */
export interface Kpi {
  metric: string;
  freq: string;
  alert: string;
  color: string;
}

export const hybridKpis: Kpi[] = [
  { metric: "Circunferência de coxa", freq: "Semanal", alert: "Queda > 1cm em 2 semanas → reduzir corrida", color: RD },
  { metric: "1RM Leg Press / Squat", freq: "Mensal", alert: "Queda > 5% → ajustar programação", color: OR },
  { metric: "Pace Zona 2", freq: "Semanal", alert: "Melhora = adaptação cardiovascular", color: GR },
  { metric: "FC de repouso", freq: "Diário", alert: "Aumento sustentado = overtraining", color: RD },
  { metric: "Qualidade de sono", freq: "Diário", alert: "Abaixo de 7h → reduzir volume", color: OR },
  { metric: "Peso corporal", freq: "Diário", alert: "Queda brusca em off-season = calorias insuficientes", color: GOLD },
  { metric: "Hematócrito", freq: "Mensal", alert: "> 52% = preocupação", color: RD },
  { metric: "Ferritina", freq: "Trimestral", alert: "< 30 ng/mL = suplementar ferro", color: OR },
  { metric: "Lipidograma", freq: "Trimestral", alert: "HDL < 40 = ajustar compostos", color: RD },
];

export const overreachingSignals = [
  "FC de repouso > 10% acima da baseline por 3+ dias consecutivos",
  "Perda de > 1cm na circunferência de coxa em 2 semanas",
  "Queda de > 5% nas cargas de leg press",
  "Pace de Zona 2 piorando (FC mais alta para o mesmo pace)",
  "Sono consistentemente abaixo de 7h",
  "Humor e motivação em queda (autorrelato)",
];

export const overreachingAction =
  "Ação automática: deload na corrida primeiro (preservando o treino de peso), ajuste calórico e reavaliação de recuperação.";

/* ── PARTE 10 — Diferencial competitivo ── */
export const competitiveEdge = [
  { feature: "Integração musculação + corrida", others: "Tratam separados", runon: "CRUZADO" },
  { feature: "Proteção de hipertrofia de pernas", others: "Não existe", runon: "LEG GUARD" },
  { feature: "Gestão do Interference Effect", others: "Não existe em nenhum app", runon: "ALGORITMO" },
  { feature: "Protocolos farmacológicos integrados", others: "Não existe", runon: "VIA DR. VERTEX" },
  { feature: "Stack de peptídeos para atleta híbrido", others: "Não existe", runon: "VIA NEXUS-BIO" },
  { feature: "Timing nutricional para sessões duplas", others: "Não existe", runon: "FUEL MATRIX" },
  { feature: "Prep de palco com corrida integrada", others: "Ninguém faz isso", runon: "STAGE MODE" },
  { feature: "Monitoramento de overreaching específico", others: "Não existe", runon: "ALERTAS AUTO" },
];

export const scientificRefs = [
  "Umbrella Review 2025 — Maximizing Adaptations in Concurrent Training (17 meta-análises, 144 estudos)",
  "Chen et al., 2024 — Network meta-analysis: concurrent training e hipertrofia de membros inferiores",
  "Wang et al., 2025 — Semi-Systematic Review on concurrent training sequences (Frontiers in Sports)",
  "Mendonca et al., 2025 — Effects of concurrent training on maximal and explosive strength",
  "Garcia-Ramos et al., 2024 — Optimizing Concurrent Training Programs (MSSE)",
  "Lundberg et al., 2022 — Concurrent training and muscle fiber hypertrophy (Sports Medicine)",
  "BPC-157 Systematic Review 2025 — Orthopaedic Sports Medicine (modelos animais)",
  "Yuan et al., 2021 — MOTS-c improves myocardial performance during exercise training",
  "SS-31 reverses age-related redox stress and improves exercise tolerance (2018)",
  "Alex Viada — The Hybrid Athlete (2015) & The Ultimate Hybrid Athlete (2025)",
  "Nick Bare — BPN Hybrid Build 6 Pillars (2022) · Barbell Medicine — Interference Effect (2025)",
];
