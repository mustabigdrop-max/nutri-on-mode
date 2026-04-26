// ============================================================
// BIBLIOTECA DE SISTEMAS DE TREINAMENTO — 24+ Sistemas
// Categorizados em 5 grupos científicos
// ============================================================

export type SystemCategory =
  | "Periodização"
  | "Força Lendária"
  | "Hipertrofia Específica"
  | "Atlético/Olímpico"
  | "Bodybuilding Clássico";

export interface TrainingSystem {
  id: string;
  nome: string;
  category: SystemCategory;
  emoji: string;
  resumo: string;
  quandoUsar: string;
  indicadoPara: string;
  duracaoIdeal: string;
  complexidade: 1 | 2 | 3 | 4 | 5;
  origem?: string;
  alerta?: string;
}

export const TRAINING_SYSTEMS: TrainingSystem[] = [
  // ── PERIODIZAÇÃO ──
  { id: "linear-simples", nome: "Linear Simples", category: "Periodização", emoji: "📈",
    resumo: "Aumenta carga e reduz reps semana a semana. Modelo previsível.",
    quandoUsar: "Início de macrociclos, novatos, fases de adaptação.",
    indicadoPara: "Iniciantes a Intermediários", duracaoIdeal: "8-16 semanas", complexidade: 1,
    origem: "Matveyev (anos 60)" },

  { id: "dup", nome: "Ondulatória Diária (DUP)", category: "Periodização", emoji: "🌊",
    resumo: "Varia intensidade/volume a cada sessão dentro da semana (força/hipertrofia/potência).",
    quandoUsar: "Intermediários estagnados em modelo linear; powerlifters.",
    indicadoPara: "Intermediário a Avançado", duracaoIdeal: "6-12 semanas", complexidade: 3 },

  { id: "wup", nome: "Ondulatória Semanal (WUP)", category: "Periodização", emoji: "📊",
    resumo: "Cada semana tem foco diferente (volume / intensidade / técnica). Recuperação melhor que DUP.",
    quandoUsar: "Atletas com baixa tolerância a variação intra-semanal.",
    indicadoPara: "Intermediário", duracaoIdeal: "8-12 semanas", complexidade: 2 },

  { id: "conjugada", nome: "Conjugada (Westside)", category: "Periodização", emoji: "⚙️",
    resumo: "Max Effort + Dynamic Effort em rotação. Bandas, correntes, exercícios variados a cada semana.",
    quandoUsar: "Powerlifting equipado, atletas avançados de força.",
    indicadoPara: "Avançado a Elite", duracaoIdeal: "12+ semanas (contínuo)", complexidade: 5,
    origem: "Louie Simmons / Westside Barbell" },

  { id: "block", nome: "Bloco (Block Periodization)", category: "Periodização", emoji: "🧱",
    resumo: "Acumulação → Transmutação → Realização. Cada bloco foca uma adaptação específica.",
    quandoUsar: "Atletas com competição programada; bodybuilders pré-contest.",
    indicadoPara: "Avançado", duracaoIdeal: "12-20 semanas", complexidade: 4,
    origem: "Verkhoshansky / Issurin" },

  { id: "apre", nome: "Autoregulada (APRE)", category: "Periodização", emoji: "🎯",
    resumo: "Set 3 dita carga do set 4 (AMRAP). Ajusta automaticamente à recuperação do dia.",
    quandoUsar: "Atletas com recuperação irregular, fases de stress alto.",
    indicadoPara: "Intermediário a Avançado", duracaoIdeal: "6-12 semanas", complexidade: 3 },

  // ── FORÇA LENDÁRIA ──
  { id: "531", nome: "5/3/1 (Wendler)", category: "Força Lendária", emoji: "💀",
    resumo: "4 ondas mensais nos 4 grandes (squat/bench/dl/ohp). 90% TM. AMRAP no top set.",
    quandoUsar: "Construção de força a longo prazo, qualquer atleta intermediário+.",
    indicadoPara: "Intermediário a Elite", duracaoIdeal: "16+ semanas (cíclico)", complexidade: 2,
    origem: "Jim Wendler (2009)" },

  { id: "531-monolith", nome: "5/3/1 Building the Monolith", category: "Força Lendária", emoji: "🗿",
    resumo: "Variante de 6 semanas: muito volume acessório, dieta hipercalórica, ênfase em massa+força.",
    quandoUsar: "Off-season, ganho de massa agressivo com força base.",
    indicadoPara: "Intermediário+", duracaoIdeal: "6 semanas", complexidade: 3 },

  { id: "smolov", nome: "Smolov (Squat)", category: "Força Lendária", emoji: "🏋️",
    resumo: "Especialização brutal em squat: 4 fases, frequência 4x/sem, picos em 105% 1RM.",
    quandoUsar: "Quebra de platô em squat. Atletas de força.",
    indicadoPara: "Avançado", duracaoIdeal: "13 semanas", complexidade: 5,
    alerta: "Risco alto de overtraining e lesão. Apenas para avançados com base." },

  { id: "texas-method", nome: "Texas Method", category: "Força Lendária", emoji: "🤠",
    resumo: "3x/sem: Volume Day (5x5) → Recovery Day → Intensity Day (PR de 5RM).",
    quandoUsar: "Transição de novato → intermediário em força.",
    indicadoPara: "Intermediário", duracaoIdeal: "12-20 semanas", complexidade: 2,
    origem: "Mark Rippetoe / Glenn Pendlay" },

  { id: "cube", nome: "Cube Method", category: "Força Lendária", emoji: "🎲",
    resumo: "Rotação semanal Heavy / Explosive / Volume nos 3 grandes. Híbrido conjugada+linear.",
    quandoUsar: "Powerlifters raw que não respondem a Westside puro.",
    indicadoPara: "Avançado", duracaoIdeal: "10-16 semanas", complexidade: 4,
    origem: "Brandon Lilly" },

  // ── HIPERTROFIA ESPECÍFICA ──
  { id: "gvt", nome: "German Volume Training (GVT)", category: "Hipertrofia Específica", emoji: "🇩🇪",
    resumo: "10x10 com 60% 1RM, 60-90s descanso. Choque metabólico extremo.",
    quandoUsar: "Quebra de platô de hipertrofia em grupo específico.",
    indicadoPara: "Intermediário a Avançado", duracaoIdeal: "4-6 semanas", complexidade: 3,
    alerta: "Catabólico se prolongado. Não passar de 6 semanas." },

  { id: "gvt-poliquin", nome: "GVT Modificado (Poliquin)", category: "Hipertrofia Específica", emoji: "🔧",
    resumo: "10x6 com 70% 1RM e tempo 4-0-2-0. Mais força que o GVT clássico.",
    quandoUsar: "Atletas que querem hipertrofia + força simultâneas.",
    indicadoPara: "Avançado", duracaoIdeal: "5 semanas", complexidade: 4,
    origem: "Charles Poliquin" },

  { id: "doggcrapp", nome: "Doggcrapp (DC Training)", category: "Hipertrofia Específica", emoji: "🐕",
    resumo: "1 set até falha + rest-pause (2 mini-sets) + extreme stretching. Rotação de exercícios.",
    quandoUsar: "Atletas avançados com pouco tempo (45min/sessão).",
    indicadoPara: "Avançado a Elite", duracaoIdeal: "6-12 semanas (Blast), depois Cruise", complexidade: 5,
    origem: "Dante Trudel",
    alerta: "Exige técnica perfeita. Falha real é necessária." },

  { id: "mountain-dog", nome: "Mountain Dog (Meadows)", category: "Hipertrofia Específica", emoji: "🐺",
    resumo: "Pump sets → Stretch sets → Contraction sets. Foco em conexão mente-músculo e ROM.",
    quandoUsar: "Bodybuilders com pontos fracos estéticos.",
    indicadoPara: "Intermediário a Avançado", duracaoIdeal: "8-12 semanas por grupo", complexidade: 3,
    origem: "John Meadows" },

  { id: "rp", nome: "Renaissance Periodization (RP)", category: "Hipertrofia Específica", emoji: "🧠",
    resumo: "Volume progressivo MEV→MAV→MRV→Deload com referências científicas (Israetel).",
    quandoUsar: "Atletas que querem progressão calculada e baseada em evidência.",
    indicadoPara: "Intermediário a Elite", duracaoIdeal: "5-8 semanas por mesociclo", complexidade: 4 },

  { id: "edt", nome: "Escalating Density (EDT)", category: "Hipertrofia Específica", emoji: "⏱️",
    resumo: "PR Zones: 15min para fazer o máximo de reps em 2 exercícios antagonistas. Bate o nº na próxima.",
    quandoUsar: "Atletas com pouco tempo, foco em densidade.",
    indicadoPara: "Intermediário", duracaoIdeal: "4-6 semanas", complexidade: 2,
    origem: "Charles Staley" },

  { id: "heavy-duty", nome: "Heavy Duty (Mentzer)", category: "Hipertrofia Específica", emoji: "💪",
    resumo: "1 set até falha absoluta por exercício. Frequência baixa (1x/sem por grupo).",
    quandoUsar: "Hardgainers, pessoas com baixa recuperação.",
    indicadoPara: "Intermediário a Avançado", duracaoIdeal: "Indefinido", complexidade: 2,
    origem: "Mike Mentzer" },

  // ── ATLÉTICO/OLÍMPICO ──
  { id: "triphasic", nome: "Triphasic Training", category: "Atlético/Olímpico", emoji: "⚡",
    resumo: "Excêntrica → Isométrica → Concêntrica. 3 fases dedicadas à força reativa.",
    quandoUsar: "Atletas de esportes explosivos (futebol, sprint, salto).",
    indicadoPara: "Avançado", duracaoIdeal: "12 semanas (4+4+4)", complexidade: 5,
    origem: "Cal Dietz" },

  { id: "french-contrast", nome: "French Contrast Method", category: "Atlético/Olímpico", emoji: "🇫🇷",
    resumo: "Heavy → Plyo → Light dynamic → Plyo assistido. PAP máximo.",
    quandoUsar: "Aumento de potência em atletas de elite.",
    indicadoPara: "Elite", duracaoIdeal: "4-6 semanas", complexidade: 5 },

  { id: "vbt", nome: "Velocity Based Training (VBT)", category: "Atlético/Olímpico", emoji: "📡",
    resumo: "Carga ajustada pela velocidade real da barra. Biofeedback objetivo.",
    quandoUsar: "Atletas com acelerômetro/encoder; gestão precisa de fadiga.",
    indicadoPara: "Avançado a Elite", duracaoIdeal: "Contínuo", complexidade: 4 },

  { id: "bulgarian", nome: "Bulgarian Method (Adaptado)", category: "Atlético/Olímpico", emoji: "🇧🇬",
    resumo: "Daily max nos compostos. Frequência diária, intensidade máxima.",
    quandoUsar: "Levantadores olímpicos avançados.",
    indicadoPara: "Elite", duracaoIdeal: "6-8 semanas (peaking)", complexidade: 5,
    alerta: "Risco altíssimo de lesão sem suporte farmacológico/recuperação elite." },

  // ── BODYBUILDING CLÁSSICO ──
  { id: "weider", nome: "Sistema Weider", category: "Bodybuilding Clássico", emoji: "🏆",
    resumo: "Bro split (1 grupo/dia), volume alto, técnicas de intensidade variadas.",
    quandoUsar: "Bodybuilders clássicos, atletas com foco estético.",
    indicadoPara: "Intermediário a Avançado", duracaoIdeal: "8-16 semanas", complexidade: 2,
    origem: "Joe Weider" },

  { id: "flushing", nome: "Flushing Method", category: "Bodybuilding Clássico", emoji: "🩸",
    resumo: "3-4 exercícios para o mesmo músculo em sequência. Bombeio máximo.",
    quandoUsar: "Pré-contest, dia de pump, especialização.",
    indicadoPara: "Intermediário+", duracaoIdeal: "Sessão única / fase curta", complexidade: 2 },

  { id: "staggered", nome: "Staggered Sets", category: "Bodybuilding Clássico", emoji: "🔀",
    resumo: "Inserir sets de grupo lagging entre sets do principal (ex: panturrilha entre squats).",
    quandoUsar: "Aumento de volume em grupo defasado sem estender treino.",
    indicadoPara: "Qualquer nível", duracaoIdeal: "Contínuo", complexidade: 1 },

  { id: "super-comp", nome: "Super Compensation Protocol", category: "Bodybuilding Clássico", emoji: "📐",
    resumo: "Ciclo overreach (2-3 sem alto volume) → deload → super compensação.",
    quandoUsar: "Quebra de platô planejada, picos pré-foto/competição.",
    indicadoPara: "Intermediário a Avançado", duracaoIdeal: "4 semanas", complexidade: 3 },
];

export const SYSTEM_CATEGORIES: { key: SystemCategory; label: string; emoji: string; color: string }[] = [
  { key: "Periodização", label: "Periodização", emoji: "🌀", color: "#4ade80" },
  { key: "Força Lendária", label: "Força Lendária", emoji: "💀", color: "#f87171" },
  { key: "Hipertrofia Específica", label: "Hipertrofia Específica", emoji: "💪", color: "#fbbf24" },
  { key: "Atlético/Olímpico", label: "Atlético / Olímpico", emoji: "⚡", color: "#60a5fa" },
  { key: "Bodybuilding Clássico", label: "Bodybuilding Clássico", emoji: "🏆", color: "#c084fc" },
];

// ============================================================
// TÉCNICAS DE INTENSIDADE
// ============================================================
export interface IntensityTechniqueDef {
  id: string;
  nome: string;
  descricao: string;
  precisaParceiro?: boolean;
  paramLabel?: string; // ex: "Quantas drops?"
  paramType?: "number" | "text";
}

export const INTENSITY_TECHNIQUES: IntensityTechniqueDef[] = [
  { id: "drop-set", nome: "Drop Set", descricao: "Reduzir carga 20-30% e continuar até falha.", paramLabel: "Quantas drops?", paramType: "number" },
  { id: "rest-pause", nome: "Rest-Pause", descricao: "Falha → 10-15s descanso → continuar. Repetir 2-3x.", paramLabel: "Mini-sets adicionais", paramType: "number" },
  { id: "myo-reps", nome: "Myo-Reps", descricao: "Set ativador (12-20 reps) → 5 mini-sets de 3-5 reps com 5 respirações.", paramLabel: "Mini-sets" , paramType: "number" },
  { id: "forced-reps", nome: "Forced Reps", descricao: "Parceiro ajuda a passar do ponto de falha (2-3 reps extras).", precisaParceiro: true, paramLabel: "Reps forçadas", paramType: "number" },
  { id: "negative-reps", nome: "Negative Reps", descricao: "Foco em excêntrica (4-8s descida) com carga supramáxima.", paramLabel: "Tempo excêntrica (s)", paramType: "number" },
  { id: "super-set", nome: "Super Set", descricao: "Dois exercícios em sequência sem descanso.", paramLabel: "Pareado com:", paramType: "text" },
  { id: "giant-set", nome: "Giant Set", descricao: "4+ exercícios em sequência para o mesmo grupo.", paramLabel: "Quantos exercícios?", paramType: "number" },
  { id: "pre-exhaust", nome: "Pré-exaustão", descricao: "Isolador antes do composto (ex: crucifixo antes do supino).", paramLabel: "Exercício isolador:", paramType: "text" },
  { id: "pause-reps", nome: "Pause Reps", descricao: "Pausa em ponto específico do ROM (ex: bottom do squat).", paramLabel: "Segundos de pausa", paramType: "number" },
  { id: "partial-reps", nome: "Partial Reps", descricao: "Trabalhar apenas porção do ROM (top/bottom).", paramLabel: "Qual porção do ROM?", paramType: "text" },
  { id: "bfr", nome: "BFR (Oclusão Vascular)", descricao: "Restrição de fluxo sanguíneo. 30% 1RM, alto volume.", paramLabel: "Pressão (% oclusão)", paramType: "number" },
  { id: "cluster", nome: "Cluster Sets", descricao: "Set dividido em mini-clusters com 15-30s entre eles.", paramLabel: "Reps por cluster", paramType: "number" },
  { id: "wave-loading", nome: "Wave Loading", descricao: "Ondas de carga: 3/2/1 → aumenta → 3/2/1.", paramLabel: "Nº de ondas", paramType: "number" },
  { id: "accommodating", nome: "Accommodating Resistance", descricao: "Bandas ou correntes para resistência variável.", paramLabel: "Tipo (banda/corrente)", paramType: "text" },
  { id: "static", nome: "Static Contraction", descricao: "Contração isométrica máxima por 6-10s no peak.", paramLabel: "Tempo (s)", paramType: "number" },
  { id: "contrast", nome: "Contrast Training", descricao: "Heavy compound → exercício explosivo (ex: squat + salto).", paramLabel: "Exercício explosivo", paramType: "text" },
];
