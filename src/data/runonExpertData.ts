/** RunON — Adendo Expert: base de dados curada (Stride Lab, Shoes, BFR, Joint, Weather, Recovery, Mind, Couch to RunON, Ranks, Metrics). */

/* ─────────── 1. STRIDE LAB — drills ─────────── */
export interface Drill {
  name: string;
  focus: string;
  prescription: string;
  why: string;
}

export const bodybuilderDrills: Drill[] = [
  {
    name: "A-Skips Modificados",
    focus: "Coordenação e ciclo de perna",
    prescription: "3 × 20 m · amplitude reduzida (coxa a ~70°)",
    why: "A massa de quadríceps e glúteo limita a ROM de quadril. Forçar amplitude de corredor leve gera compensação lombar.",
  },
  {
    name: "Wall Lean Marches",
    focus: "Postura de corrida + core",
    prescription: "3 × 20 s por perna · tronco inclinado 10–15°",
    why: "Ensina inclinação a partir do tornozelo (não da cintura) — crítico para tronco musculoso com centro de gravidade alto.",
  },
  {
    name: "Pogos (saltos curtos)",
    focus: "Elasticidade do tendão de Aquiles",
    prescription: "3 × 15 saltos · contato mínimo com o solo",
    why: "Atleta pesado precisa de rigidez elástica no Aquiles para reaproveitar energia e reduzir carga articular.",
  },
  {
    name: "Hip Flexor Mobilization",
    focus: "Flexores de quadril",
    prescription: "2 × 45 s por lado · couch stretch / half-kneeling",
    why: "Volume alto de agachamento e leg press encurta cronicamente o psoas, o que reduz extensão de quadril na passada.",
  },
  {
    name: "Ankle Dorsiflexion Drills",
    focus: "Absorção de impacto",
    prescription: "2 × 15 knee-to-wall por lado · alvo > 35°",
    why: "Dorsiflexão limitada transfere impacto direto para joelho e fáscia plantar em atletas de 90 kg+.",
  },
  {
    name: "Cadence Metronome Run",
    focus: "Cadência alvo",
    prescription: "10 min em Z2 com metrônomo na cadência-alvo",
    why: "Aumentar cadência 5–10% reduz overstriding e estresse articular sem aumentar esforço cardiovascular.",
  },
];

export const strideChecks = [
  { name: "Foot Strike", ideal: "Médio-pé sob o centro de massa", risk: "Calcanhar à frente do joelho = freio + pico de impacto" },
  { name: "Overstriding", ideal: "Tíbia vertical no contato", risk: "Passada longa é o erro nº 1 do bodybuilder que corre" },
  { name: "Inclinação de Tronco", ideal: "8–12° a partir do tornozelo", risk: "Tronco ereto ou dobrado na cintura sobrecarrega lombar" },
  { name: "Alinhamento de Joelho", ideal: "Joelho alinhado com 2º dedo", risk: "Valgo dinâmico sob carga = sobrecarga patelofemoral" },
  { name: "Braço/Ombro", ideal: "Cotovelo ~90°, ombro relaxado", risk: "Dorsal e trapézio hipertróficos travam a rotação de tronco" },
];

/* ─────────── 2. SHOE SELECTOR ─────────── */
export interface ShoeTier {
  id: string;
  range: string;
  min: number;
  max: number;
  type: string;
  models: string[];
  why: string;
  color: string;
}

export const shoeTiers: ShoeTier[] = [
  {
    id: "t1", range: "80–90 kg", min: 0, max: 90,
    type: "Max Cushion Neutro",
    models: ["HOKA Bondi 9", "Brooks Glycerin 23"],
    why: "EVA supercrítica não achata sob carga repetitiva.",
    color: "#22c55e",
  },
  {
    id: "t2", range: "90–100 kg", min: 90, max: 100,
    type: "Max Cushion + Estabilidade",
    models: ["ASICS Gel-Kayano 32", "Saucony Hurricane"],
    why: "4D Guidance, base larga e suporte de pronação.",
    color: "#00D4FF",
  },
  {
    id: "t3", range: "100–110 kg", min: 100, max: 110,
    type: "Heavy Duty Stability",
    models: ["Brooks Beast GTS 26", "NB Fresh Foam X 1080v14"],
    why: "Controle máximo, larguras extras e durabilidade.",
    color: "#f97316",
  },
  {
    id: "t4", range: "110+ kg", min: 110, max: 999,
    type: "Custom / Especializado",
    models: ["Brooks Beast + palmilha custom"],
    why: "Necessária avaliação podológica presencial.",
    color: "#ef4444",
  },
];

export const shoeRules = [
  "Nunca correr com tênis de treino/academia — amortecimento zero para impacto repetitivo.",
  "Trocar a cada 400–500 km (corredor leve: 600–800 km) — a espuma comprime mais rápido sob carga pesada.",
  "Preferir base LARGA e stack ALTO (35 mm+ no calcanhar). Minimalista está fora de cogitação.",
  "Testar em loja especializada — a pisada do bodybuilder costuma ser supinada ou neutra, raramente pronada.",
  "Dois pares em rotação — a espuma recupera entre sessões e dura mais.",
];

/* ─────────── 3. HRV READINESS ─────────── */
export const hrvWearables = [
  { name: "Apple Watch", metric: "SDNN / RMSSD noturno" },
  { name: "Whoop", metric: "HRV validado contra ECG" },
  { name: "Garmin", metric: "Body Battery + HRV Status" },
  { name: "Oura Ring", metric: "HRV noturno + temperatura" },
];

/* ─────────── 4. BFR — FLOW LOCK ─────────── */
export interface BfrProtocol {
  id: string;
  name: string;
  when: string;
  pressure: string;
  scheme: string;
  detail: string;
  color: string;
}

export const bfrProtocols: BfrProtocol[] = [
  {
    id: "walk", name: "BFR Walking", when: "Dias de cardio LISS complementar",
    pressure: "40–60% da POA (pressão de oclusão arterial)",
    scheme: "4 × 3 min caminhada · 1 min rest",
    detail: "Esteira em inclinação 8–12%, velocidade 5–6 km/h. Estímulo de hipertrofia + cardio com ZERO impacto de corrida.",
    color: "#00D4FF",
  },
  {
    id: "cycle", name: "BFR Cycling", when: "Alternativa em dias adjacentes ao leg day",
    pressure: "40–60% da POA",
    scheme: "4 × 3 min · 1 min rest · resistência leve",
    detail: "Melhora VO2max e endurance muscular local sem dano excêntrico.",
    color: "#22c55e",
  },
  {
    id: "ext", name: "BFR Leg Extension / Curl", when: "Finisher em dia de upper body",
    pressure: "40–60% da POA",
    scheme: "30 / 15 / 15 / 15 reps · 20–30% 1RM · 30–60 s rest",
    detail: "Hipertrofia adicional com carga mínima sobre tendões e articulações.",
    color: "#a855f7",
  },
];

export const bfrScheduling = [
  { day: "Leg day pesado", rule: "NÃO usar BFR", ok: false, note: "Estímulo já é suficiente." },
  { day: "Dia de cardio LISS", rule: "BFR Walking / Cycling", ok: true, note: "Janela ideal." },
  { day: "Dia de upper body", rule: "BFR Leg Ext/Curl como finisher", ok: true, note: "Mantém pernas sem impacto." },
  { day: "Rest day", rule: "NÃO usar BFR", ok: false, note: "Recuperação total." },
];

export const bfrEvidence = [
  "Meta-análise 2025 (BMC Sports Science): BFR + endurance → ganho significativo de força de membros inferiores mesmo com cargas leves.",
  "Melhora moderada de VO2max com menor volume de corrida real.",
  "Ambiente hipóxico local recruta fibras tipo II sem carga pesada.",
];

/* ─────────── 5. JOINT SHIELD ─────────── */
export const jointSupplements = [
  { name: "Colágeno tipo II", dose: "10 g/dia (ou 40 mg UC-II)", goal: "Matriz de cartilagem" },
  { name: "Glucosamina + Condroitina", dose: "1500 / 1200 mg/dia", goal: "Suporte de cartilagem" },
  { name: "MSM", dose: "3 g/dia", goal: "Anti-inflamatório articular" },
  { name: "Ácido Hialurônico oral", dose: "200 mg/dia", goal: "Viscosidade sinovial" },
  { name: "Vitamina C", dose: "500 mg – 1 g/dia", goal: "Cofator na síntese de colágeno" },
  { name: "Ômega-3", dose: "3–4 g EPA+DHA/dia", goal: "Modulação inflamatória" },
];

export const jointPeptides = [
  { name: "BPC-157", goal: "Proteção de tendões e cartilagem" },
  { name: "GHK-Cu", goal: "Remodelação de colágeno" },
  { name: "TB-500", goal: "Reparo sistêmico de tecido conectivo" },
];

export const surfaceTable = [
  { surface: "Grama / terra", impact: "BAIXO", rec: "IDEAL para bodybuilder pesado", color: "#22c55e" },
  { surface: "Esteira", impact: "BAIXO-MÉDIO", rec: "Boa opção — amortecimento do deck", color: "#22c55e" },
  { surface: "Asfalto", impact: "MÉDIO-ALTO", rec: "Aceitável com tênis adequado", color: "#f97316" },
  { surface: "Concreto / calçada", impact: "ALTO", rec: "EVITAR — impacto máximo", color: "#ef4444" },
  { surface: "Trilha / trail", impact: "VARIÁVEL", rec: "Bom para variação — cuidado com torções", color: "#00D4FF" },
  { surface: "Areia", impact: "BAIXO impacto / ALTA exigência", rec: "Esporádico — excelente para panturrilha", color: "#a855f7" },
];

/* ─────────── 6. RESTORE ENGINE ─────────── */
export const recoveryMatrix = [
  { modality: "Sono 8–9 h", evidence: "ALTO", benefit: "#1 — não existe substituto", timing: "Toda noite", color: "#22c55e" },
  { modality: "Nutrição adequada", evidence: "ALTO", benefit: "#2 — proteína + carbs + micros", timing: "Toda refeição", color: "#22c55e" },
  { modality: "Caminhada leve", evidence: "ALTO", benefit: "Recovery ativo — circulação sem estresse", timing: "Dias de rest", color: "#22c55e" },
  { modality: "Sauna 15–20 min (80–100 °C)", evidence: "MODERADO-ALTO", benefit: "Heat shock proteins, adaptação cardiovascular", timing: "2–3×/sem pós-treino", color: "#f97316" },
  { modality: "Foam Rolling", evidence: "MODERADO", benefit: "Reduz DOMS, ROM temporário", timing: "Pós-treino/corrida", color: "#00D4FF" },
  { modality: "Cold Plunge 2–5 min (10–15 °C)", evidence: "MODERADO", benefit: "Reduz inflamação aguda e DOMS", timing: "Somente pós-corrida", color: "#00D4FF" },
  { modality: "Compression Boots", evidence: "MODERADO", benefit: "Reduz edema, clearance metabólico", timing: "Pós-corrida / pós-leg day", color: "#00D4FF" },
  { modality: "Massagem", evidence: "MODERADO", benefit: "DOMS e relaxamento neural", timing: "1×/semana", color: "#00D4FF" },
  { modality: "Alongamento estático", evidence: "BAIXO-MODERADO", benefit: "Nunca pré-treino; leve à noite", timing: "Noite / pós-treino", color: "#2A2A2A" },
];

export const saunaBenefits = [
  "Aumento de volume plasmático — adaptação similar à de endurance.",
  "Ativação de heat shock proteins (HSP70/HSP90) — cardioproteção.",
  "Melhora de sensibilidade à insulina.",
  "Para atleta em AAS: efeito cardioprotetor é especialmente valioso.",
];

/* ─────────── 7. WEATHER SHIELD ─────────── */
export const weatherBands = [
  { id: "ideal", label: "IDEAL", cond: "< 20 °C · < 60% umidade", action: "Programação normal.", color: "#22c55e" },
  { id: "moderado", label: "MODERADO", cond: "20–28 °C · 60–75%", action: "Pace −5 a −10%. +500 ml de hidratação. Preferir 05:30–07:00 ou 18:00+.", color: "#00D4FF" },
  { id: "alto", label: "ALTO", cond: "28–33 °C · > 75%", action: "Pace −15 a −20%. Volume −20%. Eletrólitos obrigatórios acima de 30 min.", color: "#f97316" },
  { id: "critico", label: "CRÍTICO", cond: "> 33 °C ou sensação > 35 °C", action: "Substituir corrida por esteira climatizada ou ciclismo indoor.", color: "#ef4444" },
];

/* ─────────── 8. MIND TRACK ─────────── */
export const mindConflicts = [
  "Medo de perder massa — “vou ficar menor”.",
  "Ego de pace — quer correr forte demais logo no início.",
  "Comparação com corredores leves de 65 kg.",
  "Ansiedade pré-competição — “e se a corrida me tirar tamanho antes do show?”.",
];

export const mindReframes = [
  {
    title: "Seu pace não é seu valor.",
    body: "Um atleta de 95 kg a 6:30/km gera MAIS trabalho mecânico do que um de 65 kg a 5:00/km. O gasto energético é proporcional à massa.",
  },
  {
    title: "Pernas que correm são pernas que crescem.",
    body: "Meta-análise em rede (2024): HIIT + musculação mostrou MAIS hipertrofia de membros inferiores que musculação isolada.",
  },
  {
    title: "Você não é corredor. Você é um atleta completo.",
    body: "Mentalidade Alex Viada: seus limites estão muito acima do que você acredita hoje.",
  },
  {
    title: "O cardio não rouba massa.",
    body: "O mediador é a nutrição. Déficit calórico sem suporte proteico e sono é que rouba — não a corrida.",
  },
];

/* ─────────── 9. COUCH TO RUN ON ─────────── */
export const couchProgram = [
  { weeks: "SEMANA 1–2", phase: "WALK PHASE", session: "3×/sem · 20 min caminhada rápida (8–9 min/km)", goal: "Adaptação de tendões e articulações ao impacto", color: "#22c55e" },
  { weeks: "SEMANA 3–4", phase: "WALK-JOG PHASE", session: "3×/sem · 20 min (3 min walk / 1 min jog) × 5", goal: "Introduzir impacto de corrida gradualmente", color: "#22c55e" },
  { weeks: "SEMANA 5–6", phase: "JOG PHASE", session: "3×/sem · 20–25 min (2 min jog / 1 min walk) × 7–8", goal: "Aumentar tempo de corrida contínua", color: "#00D4FF" },
  { weeks: "SEMANA 7–8", phase: "CONTINUOUS JOG", session: "2–3×/sem · 15–20 min jogging contínuo Z2", goal: "Primeira corrida sem pausa", color: "#00D4FF" },
  { weeks: "SEMANA 9–10", phase: "BASE BUILDING", session: "2×/sem · 20–25 min Z2 + 1 caminhada complementar", goal: "Construir base aeróbia", color: "#a855f7" },
  { weeks: "SEMANA 11–12", phase: "RUN ON READY", session: "2×/sem · 25–35 min Z2 + 4×2 min tempo / 2 min easy", goal: "Pronto para a programação completa do RunON", color: "#B8922A" },
];

export const preStartChecklist = [
  "Tênis adequado para o seu peso (ver Shoe Selector)",
  "Exame médico — ECG de esforço se > 35 anos ou em uso de AAS",
  "Ecocardiograma (especialmente com histórico de Tren, Dbol ou altas doses de Test)",
  "Hemograma completo — hematócrito e ferritina",
  "Dorsiflexão de tornozelo mínima > 35°",
  "Sem dor articular ativa em joelhos ou tornozelos",
];

/* ─────────── 10. RANKS ─────────── */
export const runonBadges = [
  { icon: "🏅", name: "First Mile", req: "Primeira corrida contínua de 1 milha", meaning: "Início da jornada" },
  { icon: "💪", name: "Iron Runner", req: "30 dias consecutivos de treino duplo", meaning: "Consistência absoluta" },
  { icon: "🦵", name: "Leg Guard Elite", req: "3 meses crescendo perna + correndo 2×/sem", meaning: "Prova que é possível" },
  { icon: "🏃", name: "5K Muscle", req: "Primeira prova de 5K pesando > 85 kg", meaning: "Atleta híbrido confirmado" },
  { icon: "⚡", name: "Sub-30 Heavy", req: "5K abaixo de 30 min pesando > 90 kg", meaning: "Performance excepcional" },
  { icon: "🔥", name: "Stage + Finish Line", req: "Show de BB + prova de corrida no mesmo ano", meaning: "Lenda" },
  { icon: "🧬", name: "Protocol Master", req: "12 semanas de stack sem interrupção", meaning: "Disciplina farmacológica" },
  { icon: "💎", name: "Zero Interference", req: "8 semanas com IRS < 3.0", meaning: "Programação perfeita" },
];

/* ─────────── 11. INTEGRAÇÕES ─────────── */
export const integrationMap = [
  { module: "TrainingON", route: "/training", points: ["Treino considera os dias de corrida", "Overreaching reduz volume automaticamente", "STRATUM inclui run load como variável"] },
  { module: "NutriPlan / MATRIX", route: "/nutrisync", points: ["Dias de corrida = +200–400 kcal", "+30–50 g CHO nos dias de corrida", "Timing específico para sessões duplas"] },
  { module: "Dr. VERTEX", route: "/coach/apex-visual", points: ["Notas de compatibilidade dos compostos com corrida", "Alerta: Trenbolona compromete capacidade cardiovascular"] },
  { module: "NEXUS-BIO PeptideVault", route: "/lab", points: ["Schedule de peptídeos integrado aos dias de corrida", "Stacks por fase (off-season vs prep)"] },
  { module: "TENSOR (Body Comp)", route: "/body-composition", points: ["Composição mês a mês", "Correlação volume de corrida × massa magra", "Alerta de perda sem causa nutricional"] },
  { module: "APEX Visual Intelligence", route: "/coach/apex-visual", points: ["Análise biomecânica de corrida por câmera", "Pose detection adaptado a movimento dinâmico"] },
  { module: "MERIDIAN (Prep)", route: "/coach/competition-plan", points: ["Timing engine reduz corrida conforme o show se aproxima"] },
  { module: "VERA (Feminino)", route: "/protocolo-feminino", points: ["Fase folicular: maior capacidade de corrida", "Fase lútea: reduzir intensidade"] },
  { module: "MCE Intelligence", route: "/mce", points: ["Cards de mentalidade baseados no progresso de corrida"] },
];

/* ─────────── 12. MÉTRICAS ÚNICAS ─────────── */
export const uniqueMetrics = [
  { code: "IRS", name: "Interference Risk Score", desc: "0–10 · proximidade de corrida com leg day, volume total, HRV e sono." },
  { code: "LPI", name: "Leg Protection Index", desc: "Circunferência de coxa + 1RM leg press + volume de corrida — detecta perda muscular precoce." },
  { code: "DLS", name: "Dual Load Score", desc: "Soma ponderada de volume de peso + corrida com threshold individual." },
  { code: "CSI", name: "Cardiac Stress Index", desc: "Compostos + volume de cardio + FC de repouso + último ECG." },
  { code: "MFS", name: "Metabolic Flexibility Score", desc: "Proporção estimada de oxidação de gordura vs carboidrato em Z2." },
  { code: "TLS", name: "Tendon Load Score", desc: "Peso corporal × distância × superfície × estado do tênis." },
];
