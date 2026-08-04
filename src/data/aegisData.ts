/** AEGIS — Hybrid Protection Protocol · base de conhecimento estática (frontend only). */

export const AEGIS = {
  cyan: "#00D4FF",
  purple: "#a855f7",
  bg: "#0a0a0a",
  card: "#111111",
  inner: "#1a1a1a",
  border: "#222222",
  text: "#f5f5f5",
  muted: "#888888",
} as const;

export type AegisCategory =
  | "preservation"
  | "performance"
  | "recovery"
  | "composition"
  | "protection";

export type AegisEvidence =
  | "scientific"
  | "clinical"
  | "empirical"
  | "bro-science"
  | "controversial";

export type AegisRelevance = "critical" | "high" | "moderate";

/** Nível mínimo de perfil ergogênico necessário para exibir o protocolo. */
export type AegisTier = "natural" | "trt" | "cycle";

export interface AegisCompound {
  name: string;
  dosageRange: string;
  timing: string;
  mechanism: string;
  interactionWithRunning: string;
}

export interface AegisProtocol {
  id: string;
  category: AegisCategory;
  title: string;
  context: string;
  compounds: AegisCompound[];
  warnings: string[];
  evidence: AegisEvidence;
  hybridRelevance: AegisRelevance;
  tier: AegisTier;
}

export const evidenceColors: Record<AegisEvidence, string> = {
  scientific: "#22c55e",
  clinical: "#00D4FF",
  empirical: "#f97316",
  "bro-science": "#ef4444",
  controversial: "#a855f7",
};

export const evidenceLabels: Record<AegisEvidence, string> = {
  scientific: "CIENTÍFICO",
  clinical: "CLÍNICO",
  empirical: "EMPÍRICO",
  "bro-science": "BRO-SCIENCE",
  controversial: "CONTROVERSO",
};

export const relevanceColors: Record<AegisRelevance, string> = {
  critical: "#ef4444",
  high: "#f97316",
  moderate: "#B8922A",
};

export const aegisCategories: {
  id: AegisCategory;
  label: string;
  desc: string;
  color: string;
  icon: string;
}[] = [
  { id: "preservation", label: "PRESERVAÇÃO MUSCULAR", desc: "Segurar massa durante volume alto de corrida.", color: "#00D4FF", icon: "Shield" },
  { id: "performance", label: "PERFORMANCE AERÓBICA", desc: "VO2máx, resistência e capacidade de trabalho.", color: "#22c55e", icon: "Zap" },
  { id: "recovery", label: "RECUPERAÇÃO ACELERADA", desc: "Reduzir o tempo entre sessões duras.", color: "#a855f7", icon: "Moon" },
  { id: "composition", label: "COMPOSIÇÃO CORPORAL", desc: "Shape competitivo sem perder resistência.", color: "#f97316", icon: "Flame" },
  { id: "protection", label: "PROTEÇÃO ARTICULAR", desc: "Corrida desgasta — prevenir custa menos que tratar.", color: "#B8922A", icon: "Bone" },
];

export const AEGIS_DISCLAIMER =
  "AEGIS fornece informações para fins educacionais e de referência. Protocolos farmacológicos devem ser supervisionados por profissional de saúde qualificado. O uso de qualquer substância é de responsabilidade exclusiva do usuário.";

export const aegisProtocols: AegisProtocol[] = [
  /* ───── PRESERVAÇÃO MUSCULAR ───── */
  {
    id: "pres-anticatabolico",
    category: "preservation",
    title: "Anti-Catabólico Base",
    context: "Volume aeróbico acima de 30 km/semana com meta de manter massa magra.",
    evidence: "scientific",
    hybridRelevance: "critical",
    tier: "trt",
    compounds: [
      {
        name: "Testosterona (base)",
        dosageRange: "200–500 mg/semana",
        timing: "Dividir em 2 aplicações semanais",
        mechanism: "Aumenta síntese proteica e retenção de nitrogênio; reduz catabolismo induzido por cortisol.",
        interactionWithRunning: "Hematócrito sobe com volume aeróbico alto — monitorar e hidratar de forma agressiva.",
      },
    ],
    warnings: ["Monitorar hematócrito, pressão arterial e lipídeos a cada 8–12 semanas."],
  },
  {
    id: "pres-shield-stack",
    category: "preservation",
    title: "Shield Stack",
    context: "Fase de corrida intensa mantendo densidade muscular e baixa retenção.",
    evidence: "clinical",
    hybridRelevance: "critical",
    tier: "cycle",
    compounds: [
      { name: "Primobolan", dosageRange: "400 mg/semana", timing: "2x/semana", mechanism: "Anabólico de baixa aromatização, preserva massa em déficit.", interactionWithRunning: "Baixa retenção hídrica — não prejudica pace nem termorregulação." },
      { name: "Testosterona", dosageRange: "300 mg/semana", timing: "2x/semana", mechanism: "Base hormonal para manter função e libido.", interactionWithRunning: "Melhora recuperação entre sessões duplas." },
    ],
    warnings: ["Custo elevado e alta taxa de falsificação de Primobolan — exigir laudo HPLC."],
  },
  {
    id: "pres-anabolico-suave",
    category: "preservation",
    title: "Anabólico Suave",
    context: "Blocos curtos de recomposição sem ganho de peso corporal.",
    evidence: "scientific",
    hybridRelevance: "high",
    tier: "cycle",
    compounds: [
      { name: "Oxandrolona", dosageRange: "20–40 mg/dia (6–8 semanas)", timing: "Dividir em 2 tomadas", mechanism: "Anabólico oral com forte preservação de massa em déficit calórico.", interactionWithRunning: "Não aumenta peso — vantagem direta no pace. Impacto hepático e lipídico relevante." },
    ],
    warnings: ["Supressão de HDL acentuada. Não combinar com outros orais 17-alfa-alquilados."],
  },
  {
    id: "pres-natural-stack",
    category: "preservation",
    title: "Natural Stack",
    context: "Atleta natural em volume aeróbico crescente.",
    evidence: "scientific",
    hybridRelevance: "high",
    tier: "natural",
    compounds: [
      { name: "Creatina", dosageRange: "5 g/dia", timing: "Qualquer horário, uso contínuo", mechanism: "Ressíntese de fosfocreatina e volumização celular.", interactionWithRunning: "Não prejudica a corrida; ganho de ~1 kg de água intracelular é irrelevante no pace." },
      { name: "HMB", dosageRange: "3 g/dia", timing: "Dividir em 3 tomadas", mechanism: "Reduz proteólise muscular em treino de alto volume.", interactionWithRunning: "Mais útil justamente em fases de corrida longa e déficit." },
      { name: "Leucina", dosageRange: "5 g/dia", timing: "Peri-treino e pré-longão", mechanism: "Gatilho de mTOR.", interactionWithRunning: "Útil em easy run em jejum estratégico." },
    ],
    warnings: [],
  },
  {
    id: "pres-gh-pulse",
    category: "preservation",
    title: "GH Pulse",
    context: "Preservação de tecido em fases de alto volume e déficit moderado.",
    evidence: "clinical",
    hybridRelevance: "high",
    tier: "cycle",
    compounds: [
      { name: "GH", dosageRange: "2–4 UI/dia", timing: "Dividir AM/PM", mechanism: "IGF-1 elevado, lipólise e reparo de tecido conjuntivo.", interactionWithRunning: "Auxilia tendões sob carga de impacto repetida." },
      { name: "MK-677", dosageRange: "25 mg/dia", timing: "Noite", mechanism: "Secretagogo oral de GH.", interactionWithRunning: "Retenção hídrica pode incomodar em provas longas." },
    ],
    warnings: ["Risco de resistência à insulina — monitorar glicemia de jejum."],
  },
  {
    id: "pres-sarm",
    category: "preservation",
    title: "SARM Alternativo",
    context: "Alternativa de menor supressão para blocos de manutenção.",
    evidence: "empirical",
    hybridRelevance: "moderate",
    tier: "cycle",
    compounds: [
      { name: "Ostarine (MK-2866)", dosageRange: "15–25 mg/dia (8 semanas)", timing: "Dose única diária", mechanism: "Modulador seletivo do receptor androgênico.", interactionWithRunning: "Boa preservação em déficit sem ganho de peso." },
    ],
    warnings: ["Supressão do eixo é real apesar do marketing. Qualidade de fornecimento é inconsistente."],
  },

  /* ───── PERFORMANCE AERÓBICA ───── */
  {
    id: "perf-vo2",
    category: "performance",
    title: "VO2máx Boost",
    context: "Blocos de construção aeróbica com foco em capacidade de trabalho.",
    evidence: "empirical",
    hybridRelevance: "high",
    tier: "cycle",
    compounds: [
      { name: "Boldenona (EQ)", dosageRange: "300–600 mg/semana", timing: "1–2x/semana", mechanism: "Aumento de eritropoiese e apetite; mais hemácias, mais transporte de O2.", interactionWithRunning: "Ganho real de resistência, mas hematócrito pode ultrapassar limites seguros." },
    ],
    warnings: ["Hematócrito acima de 54% exige interrupção e avaliação médica.", "Meia-vida longa: efeito persiste por semanas após a suspensão."],
  },
  {
    id: "perf-natural",
    category: "performance",
    title: "Endurance Stack Natural",
    context: "Base de performance para qualquer perfil, inclusive natural.",
    evidence: "scientific",
    hybridRelevance: "critical",
    tier: "natural",
    compounds: [
      { name: "Beta-Alanina", dosageRange: "6.4 g/dia", timing: "Dividir em 2–4 doses", mechanism: "Eleva carnosina muscular, tamponando H+ no esforço intenso.", interactionWithRunning: "Ganho mensurável em tiros e tempo run." },
      { name: "Beterraba (nitrato)", dosageRange: "500 mg de nitrato", timing: "2–3 h antes da sessão", mechanism: "Via NO — melhora economia de oxigênio.", interactionWithRunning: "Reduz custo de O2 no mesmo pace." },
      { name: "Cafeína", dosageRange: "3–6 mg/kg", timing: "45–60 min pré-sessão", mechanism: "Antagonismo de adenosina, redução da percepção de esforço.", interactionWithRunning: "Ciclar a cada 8 semanas para manter a resposta." },
    ],
    warnings: [],
  },
  {
    id: "perf-cardarine",
    category: "performance",
    title: "Cardarine (GW501516)",
    context: "Aumento de resistência via metabolismo oxidativo.",
    evidence: "controversial",
    hybridRelevance: "high",
    tier: "cycle",
    compounds: [
      { name: "Cardarine", dosageRange: "10–20 mg/dia", timing: "1–2 h pré-sessão", mechanism: "Agonista PPAR-delta: shift para oxidação de gordura.", interactionWithRunning: "Efeito percebido mais forte em Z2 longo do que em tiros." },
    ],
    warnings: ["Estudos em roedores com doses supra-fisiológicas mostraram carcinogênese — risco não resolvido.", "Banido pela WADA."],
  },
  {
    id: "perf-iron",
    category: "performance",
    title: "Iron Protocol",
    context: "Corredor com fadiga persistente e ferritina baixa (comum em alto volume).",
    evidence: "scientific",
    hybridRelevance: "high",
    tier: "natural",
    compounds: [
      { name: "Ferro quelado", dosageRange: "25–65 mg", timing: "Em jejum, longe de cálcio e café", mechanism: "Repõe substrato para hemoglobina.", interactionWithRunning: "Hemólise de impacto no pé consome ferro em corredores de volume." },
      { name: "Vitamina C", dosageRange: "500 mg", timing: "Junto com o ferro", mechanism: "Aumenta absorção de ferro não-heme.", interactionWithRunning: "—" },
    ],
    warnings: ["Só suplementar com exame de ferritina — excesso de ferro é hepatotóxico."],
  },
  {
    id: "perf-altitude",
    category: "performance",
    title: "Altitude Simulation",
    context: "Suporte adaptogênico em blocos de carga elevada.",
    evidence: "clinical",
    hybridRelevance: "moderate",
    tier: "natural",
    compounds: [
      { name: "Rhodiola", dosageRange: "500 mg/dia", timing: "Manhã", mechanism: "Adaptógeno, reduz fadiga percebida.", interactionWithRunning: "Bom em semanas de pico." },
      { name: "Cordyceps", dosageRange: "1–3 g/dia", timing: "Manhã", mechanism: "Suporte à utilização de O2.", interactionWithRunning: "Efeito modesto, cumulativo." },
    ],
    warnings: [],
  },

  /* ───── RECUPERAÇÃO ACELERADA ───── */
  {
    id: "rec-tissue",
    category: "recovery",
    title: "Tissue Repair",
    context: "Tendinites, canelite e sobrecarga articular por volume de corrida.",
    evidence: "clinical",
    hybridRelevance: "critical",
    tier: "cycle",
    compounds: [
      { name: "BPC-157", dosageRange: "250–500 mcg/dia", timing: "Próximo à região afetada", mechanism: "Angiogênese e reparo de tendão/ligamento.", interactionWithRunning: "Permite manter volume durante reabilitação leve." },
      { name: "TB-500", dosageRange: "2 mg, 2x/semana", timing: "Subcutâneo", mechanism: "Regulação de actina, migração celular no reparo.", interactionWithRunning: "Sinergia clássica com BPC-157 para lesões de impacto." },
    ],
    warnings: ["Exigir laudo HPLC de pureza. Uso somente 18+."],
  },
  {
    id: "rec-sleep",
    category: "recovery",
    title: "Sleep Optimization",
    context: "Sono é a variável nº 1 do atleta híbrido.",
    evidence: "scientific",
    hybridRelevance: "high",
    tier: "natural",
    compounds: [
      { name: "Melatonina", dosageRange: "1–3 mg", timing: "30–60 min pré-sono", mechanism: "Sincroniza o ciclo circadiano.", interactionWithRunning: "Essencial em quem faz sessão noturna." },
      { name: "Magnésio", dosageRange: "400 mg (glicinato)", timing: "Noite", mechanism: "Relaxamento neuromuscular; perdas via suor.", interactionWithRunning: "Reduz cãibras em volume alto." },
      { name: "Ashwagandha", dosageRange: "600 mg/dia", timing: "Noite", mechanism: "Reduz cortisol.", interactionWithRunning: "Útil em fase de pico com dupla sessão." },
    ],
    warnings: [],
  },
  {
    id: "rec-gh-frag",
    category: "recovery",
    title: "GH Recovery",
    context: "Recuperação tecidual noturna sem dose cheia de GH.",
    evidence: "clinical",
    hybridRelevance: "moderate",
    tier: "cycle",
    compounds: [
      { name: "GH Fragment 176-191", dosageRange: "250–500 mcg", timing: "Pré-sono, em jejum", mechanism: "Fração lipolítica do GH.", interactionWithRunning: "Efeito principal é composição, não reparo estrutural." },
    ],
    warnings: ["Evidência de reparo tecidual é fraca comparada ao GH integral."],
  },
  {
    id: "rec-antiinflam",
    category: "recovery",
    title: "Anti-Inflammation",
    context: "Controle inflamatório sem abolir a adaptação ao treino.",
    evidence: "scientific",
    hybridRelevance: "high",
    tier: "natural",
    compounds: [
      { name: "Ômega-3", dosageRange: "3 g EPA+DHA/dia", timing: "Com refeições", mechanism: "Resolução inflamatória e saúde articular.", interactionWithRunning: "Reduz dor muscular tardia após longão." },
      { name: "Curcumina", dosageRange: "1 g/dia (com piperina)", timing: "Pós-treino", mechanism: "Inibição de NF-kB.", interactionWithRunning: "Não usar em doses altas cronicamente — pode blunt adaptação." },
    ],
    warnings: ["Evitar AINEs de rotina: prejudicam adaptação óssea e tendínea."],
  },
  {
    id: "rec-peptide",
    category: "recovery",
    title: "Peptide Recovery",
    context: "Pulso de GH endógeno para acelerar recuperação entre sessões.",
    evidence: "clinical",
    hybridRelevance: "high",
    tier: "cycle",
    compounds: [
      { name: "Ipamorelin", dosageRange: "200 mcg", timing: "Pré-sono, estômago vazio", mechanism: "Secretagogo seletivo, sem pico de cortisol/prolactina.", interactionWithRunning: "Boa qualidade de sono profundo em fase de pico." },
      { name: "CJC-1295", dosageRange: "100 mcg", timing: "Junto ao Ipamorelin", mechanism: "Análogo de GHRH — amplia o pulso.", interactionWithRunning: "Sinergia padrão com Ipamorelin." },
    ],
    warnings: ["Aplicar com no mínimo 2 h de jejum de carboidrato para não abortar o pulso."],
  },

  /* ───── COMPOSIÇÃO CORPORAL ───── */
  {
    id: "comp-recomp",
    category: "composition",
    title: "Recomp Hybrid",
    context: "Manter shape competitivo enquanto o volume aeróbico sobe.",
    evidence: "empirical",
    hybridRelevance: "critical",
    tier: "cycle",
    compounds: [
      { name: "Testosterona + Primobolan", dosageRange: "Ajustar por perfil e fase", timing: "2x/semana", mechanism: "Base anabólica de baixa retenção.", interactionWithRunning: "Combinar com cardio periodizado: Z2 nos dias de superior, nada intenso perto de perna." },
    ],
    warnings: ["Sem periodização de cardio, nenhum composto salva a hipertrofia."],
  },
  {
    id: "comp-glp1",
    category: "composition",
    title: "GLP-1 Strategy",
    context: "Redução de gordura com fome controlada em atleta híbrido.",
    evidence: "scientific",
    hybridRelevance: "high",
    tier: "cycle",
    compounds: [
      { name: "Semaglutida ou Tirzepatida", dosageRange: "0.25–1 mg/semana (titulado)", timing: "Dose semanal fixa", mechanism: "Agonismo GLP-1: saciedade e esvaziamento gástrico lento.", interactionWithRunning: "Esvaziamento lento atrapalha fueling de longão — evitar dose 48 h antes de prova." },
    ],
    warnings: ["Risco de perda de massa magra: proteína mínima 2.0–2.2 g/kg obrigatória."],
  },
  {
    id: "comp-thyroid",
    category: "composition",
    title: "Thyroid Support",
    context: "Suporte metabólico em déficit prolongado com TSH alterado.",
    evidence: "scientific",
    hybridRelevance: "moderate",
    tier: "cycle",
    compounds: [
      { name: "T4 (Levotiroxina)", dosageRange: "25–75 mcg/dia", timing: "Jejum matinal", mechanism: "Repõe substrato tireoidiano.", interactionWithRunning: "T3 em excesso acelera catabolismo — péssimo em volume aeróbico alto." },
    ],
    warnings: ["Somente com TSH/T4 livre documentados e acompanhamento médico."],
  },
  {
    id: "comp-cutting-natural",
    category: "composition",
    title: "Cutting Natural",
    context: "Perfil natural em fase de definição.",
    evidence: "scientific",
    hybridRelevance: "moderate",
    tier: "natural",
    compounds: [
      { name: "Cafeína", dosageRange: "3–6 mg/kg", timing: "Pré-sessão", mechanism: "Termogênese leve e menor percepção de esforço.", interactionWithRunning: "Evitar à noite para não comprometer o sono." },
      { name: "L-Carnitina", dosageRange: "2 g/dia", timing: "Com carboidrato", mechanism: "Transporte de ácidos graxos à mitocôndria.", interactionWithRunning: "Efeito modesto; melhor com base aeróbica consolidada." },
      { name: "CLA", dosageRange: "3 g/dia", timing: "Com refeições", mechanism: "Efeito marginal sobre gordura corporal.", interactionWithRunning: "—" },
    ],
    warnings: [],
  },
  {
    id: "comp-gh-lipo",
    category: "composition",
    title: "GH Lipolysis",
    context: "Lipólise dirigida antes de sessão aeróbica em jejum.",
    evidence: "clinical",
    hybridRelevance: "high",
    tier: "cycle",
    compounds: [
      { name: "GH", dosageRange: "2–4 UI", timing: "Manhã, em jejum, antes do easy run", mechanism: "Mobiliza ácidos graxos livres.", interactionWithRunning: "Combinar com easy run em jejum + BCAA maximiza oxidação." },
    ],
    warnings: ["Monitorar glicemia; risco de túnel do carpo e retenção."],
  },

  /* ───── PROTEÇÃO ARTICULAR ───── */
  {
    id: "prot-joint-shield",
    category: "protection",
    title: "Joint Shield",
    context: "Base preventiva para qualquer atleta acumulando quilometragem.",
    evidence: "scientific",
    hybridRelevance: "critical",
    tier: "natural",
    compounds: [
      { name: "UC-II", dosageRange: "40 mg/dia", timing: "Noite, estômago vazio", mechanism: "Tolerância oral ao colágeno tipo II — modula resposta articular.", interactionWithRunning: "Evidência boa em joelho de corredor." },
      { name: "Colágeno tipo I/II", dosageRange: "10 g + vitamina C", timing: "30–60 min antes da sessão", mechanism: "Substrato para síntese de matriz sob carga.", interactionWithRunning: "Tomar antes do impacto potencializa a incorporação." },
    ],
    warnings: [],
  },
  {
    id: "prot-nandrolona",
    category: "protection",
    title: "Nandrolona Low Dose",
    context: "Desconforto articular crônico em atleta já em protocolo hormonal.",
    evidence: "clinical",
    hybridRelevance: "high",
    tier: "cycle",
    compounds: [
      { name: "Deca / NPP", dosageRange: "50–100 mg/semana (dose terapêutica)", timing: "1–2x/semana", mechanism: "Aumenta síntese de colágeno e retenção de água intra-articular.", interactionWithRunning: "Alívio articular real, mas mascara dor — risco de progredir lesão silenciosa." },
    ],
    warnings: ["Supressão prolongada do eixo e impacto em prolactina.", "Nunca usar dor mascarada como sinal verde para aumentar volume."],
  },
  {
    id: "prot-peptide-joint",
    category: "protection",
    title: "Peptide Joint",
    context: "Ponto específico de dor articular ou tendínea.",
    evidence: "clinical",
    hybridRelevance: "high",
    tier: "cycle",
    compounds: [
      { name: "BPC-157 (local + sistêmico)", dosageRange: "250 mcg subQ próximo à articulação", timing: "Diário por 4–6 semanas", mechanism: "Reparo tecidual localizado.", interactionWithRunning: "Reduzir volume 30% durante a fase de reparo." },
    ],
    warnings: ["Uso somente 18+ e com laudo de pureza."],
  },
  {
    id: "prot-lubrication",
    category: "protection",
    title: "Lubrication",
    context: "Manutenção de longo prazo para volume crônico.",
    evidence: "scientific",
    hybridRelevance: "moderate",
    tier: "natural",
    compounds: [
      { name: "Glucosamina", dosageRange: "1500 mg/dia", timing: "Com refeição", mechanism: "Substrato de glicosaminoglicanos.", interactionWithRunning: "Efeito cumulativo em 8–12 semanas." },
      { name: "Condroitina", dosageRange: "1200 mg/dia", timing: "Com refeição", mechanism: "Retenção hídrica na cartilagem.", interactionWithRunning: "—" },
      { name: "MSM", dosageRange: "1000 mg/dia", timing: "Com refeição", mechanism: "Enxofre biodisponível, efeito analgésico leve.", interactionWithRunning: "Ajuda em DOMS pós-longão." },
    ],
    warnings: [],
  },
  {
    id: "prot-anti-impact",
    category: "protection",
    title: "Anti-Impact",
    context: "A intervenção com melhor custo-benefício de todas.",
    evidence: "scientific",
    hybridRelevance: "critical",
    tier: "natural",
    compounds: [
      { name: "Calçado adequado", dosageRange: "Trocar a cada 600–800 km", timing: "Rotacionar 2 pares", mechanism: "Distribuição de força de impacto.", interactionWithRunning: "Tênis morto é a causa nº 1 de canelite em quem sobe volume." },
      { name: "Técnica de corrida", dosageRange: "Cadência 170–180 ppm", timing: "Drills 2x/semana", mechanism: "Reduz overstriding e força de frenagem no joelho.", interactionWithRunning: "Maior retorno em prevenção de lesão de todo o protocolo." },
    ],
    warnings: [],
  },
];
