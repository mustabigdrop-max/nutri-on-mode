// ============================================================
// TÉCNICAS DE INTENSIDADE — APLICÁVEIS A QUALQUER PROGRAMA
// ============================================================

export interface IntensityTechniqueExample {
  exercicio: string;
  protocolo: string;
}

export interface IntensityTechnique {
  id: string;
  nome: string;
  emoji: string;
  shortLabel: string;
  categoria: "Pós-Falha" | "Tensão Mecânica" | "Volume Adicional" | "Neural" | "Metabólico";
  intensidade: 1 | 2 | 3 | 4 | 5; // estresse no SNC
  resumo: string;
  comoFazer: string[];
  exemplos: IntensityTechniqueExample[];
  beneficios: string[];
  limites: string[]; // quantas vezes/treino, frequência
  idealPara: string;
  alerta?: string;
}

export const INTENSITY_TECHNIQUES: IntensityTechnique[] = [
  // ─────────────────────────────────────────
  {
    id: "forced-reps",
    nome: "Forced Reps (Reps Forçadas)",
    emoji: "🤝",
    shortLabel: "Forced",
    categoria: "Pós-Falha",
    intensidade: 4,
    resumo: "Após a falha técnica, parceiro ajuda nas últimas 2-3 reps. Maior recrutamento de unidades motoras de alto limiar.",
    comoFazer: [
      "Atinja a falha técnica real (não conseguir mais subir sozinho com forma).",
      "Parceiro aplica ajuda MÍNIMA na fase concêntrica — apenas o suficiente para completar o movimento.",
      "Você continua controlando 100% da fase excêntrica (descida).",
      "Adicione 2-3 reps forçadas além da falha.",
    ],
    exemplos: [
      { exercicio: "Supino", protocolo: "8 reps falha → parceiro ajuda mais 2-3 reps na subida" },
      { exercicio: "Hack squat", protocolo: "10 reps falha → parceiro empurra plataforma 2-3 reps" },
      { exercicio: "Rosca direta", protocolo: "10 reps falha → parceiro auxilia subida 2-3 reps" },
    ],
    beneficios: [
      "Recruta fibras de alto limiar não atingidas em sets normais",
      "Aumenta volume efetivo do set",
      "Estímulo neural máximo",
    ],
    limites: [
      "Apenas 1× por exercício",
      "Não mais que 2× por treino",
      "Não usar em todos os treinos (esgota SNC)",
    ],
    idealPara: "Último set do exercício principal. Avançados com parceiro confiável.",
    alerta: "EXIGE parceiro experiente — assistência excessiva = não há mais sobrecarga. Ajuda mínima é a regra.",
  },
  // ─────────────────────────────────────────
  {
    id: "negative-reps",
    nome: "Negative Reps (Excêntrico Forçado)",
    emoji: "⬇️",
    shortLabel: "Negativas",
    categoria: "Pós-Falha",
    intensidade: 5,
    resumo: "Cargas ALÉM do 1RM concêntrico. Parceiro ajuda subir, você resiste sozinho na descida em 6-8s. Músculo é 40% mais forte na excêntrica.",
    comoFazer: [
      "Carregue 105-120% do seu 1RM concêntrico.",
      "Parceiro(s) ajudam a posicionar a carga no topo (concêntrica completamente assistida).",
      "Você desce SOZINHO em 6-8 segundos, resistindo ao máximo.",
      "Repetir por 3-5 reps controladas.",
      "Ideal: 1 set negativo após o trabalho normal.",
    ],
    exemplos: [
      { exercicio: "Hack squat (quadríceps)", protocolo: "120% 1RM → parceiro ajuda subir → desce em 6-8s × 4 reps" },
      { exercicio: "Supino", protocolo: "110% 1RM → assistido subir → desce 6s controlado × 3-4 reps" },
      { exercicio: "Pull-up", protocolo: "Pular para o topo da barra → descer em 8-10s × 3-5 reps" },
    ],
    beneficios: [
      "Máximo dano muscular = máxima síntese proteica",
      "Cargas além do 1RM concêntrico",
      "Excelente para destravar platôs",
      "Recruta fibras tipo IIx (as mais hipertróficas)",
    ],
    limites: [
      "1 set negativo no FINAL do exercício",
      "Máximo 1-2 exercícios por treino com negativas",
      "Recuperação muscular leva 5-7 dias após sessão pesada de negativas",
    ],
    idealPara: "Avançados em platô. Compostos pesados (squat, supino, hack, pull-up).",
    alerta: "DOR muscular tardia (DOMS) extrema. Espalhe ao menos 7 dias entre sessões com negativas no mesmo grupo.",
  },
  // ─────────────────────────────────────────
  {
    id: "static-contraction",
    nome: "Static Contraction (Isometria)",
    emoji: "⏹️",
    shortLabel: "Isometria",
    categoria: "Tensão Mecânica",
    intensidade: 3,
    resumo: "Segurar o ponto de MAIOR TENSÃO por 30-60s. Recruta fibras que reps normais não atingem.",
    comoFazer: [
      "Identifique o ponto de máxima tensão do exercício.",
      "Posicione-se com peso (60-80% do peso normal de trabalho).",
      "Mantenha a posição estaticamente por 30-60 segundos.",
      "Foco máximo na contração consciente do músculo-alvo.",
    ],
    exemplos: [
      { exercicio: "Cadeira extensora", protocolo: "Segurar no TOPO (extensão completa) por 30-60s" },
      { exercicio: "Hack squat", protocolo: "Segurar no PARALELO por 30s (máxima tensão no quad)" },
      { exercicio: "Crucifixo", protocolo: "Segurar braços abertos a 90° por 30-45s" },
    ],
    beneficios: [
      "Recruta fibras profundas que reps dinâmicas não atingem",
      "Melhora conexão mente-músculo",
      "Sem stress articular intenso",
      "Útil em reabilitação e fortalecimento de pontos fracos",
    ],
    limites: [
      "1× por exercício, no FIM da série",
      "Não substituir movimento dinâmico — é complementar",
    ],
    idealPara: "Exercícios isolados (extensora, flexora, crucifixo, lateral). Finalizadores.",
  },
  // ─────────────────────────────────────────
  {
    id: "bfr-occlusion",
    nome: "BFR / Occlusion Training",
    emoji: "🩸",
    shortLabel: "BFR",
    categoria: "Metabólico",
    intensidade: 2,
    resumo: "Manguito na coxa/braço (50-80% oclusão) + cargas de 20-30% 1RM. Hipertrofia equivalente a treino pesado, sem stress articular.",
    comoFazer: [
      "Aplique faixas BFR específicas (Kaatsu/B-Strong) na origem do membro (raiz da coxa ou braço).",
      "Pressão: 50-80% de oclusão (sentir pulsação distal, mas sem dormência).",
      "Carga: APENAS 20-30% do 1RM.",
      "Protocolo clássico: 30-15-15-15 reps com 30s de descanso entre sets.",
      "Sensação de queimação extrema é normal e esperada.",
    ],
    exemplos: [
      { exercicio: "Cadeira extensora", protocolo: "30% 1RM → 30 reps / 30s desc / 15 / 30s / 15 / 30s / 15" },
      { exercicio: "Leg press com BFR", protocolo: "30% 1RM → 30-15-15-15 com 30s descanso" },
      { exercicio: "Rosca bíceps", protocolo: "Faixa no braço → 30% 1RM 30-15-15-15" },
    ],
    beneficios: [
      "Hipertrofia comparável a treino pesado",
      "ZERO stress articular — ideal com articulações sobrecarregadas",
      "Excelente em deload ou fase de pico (peak week)",
      "Resposta hormonal anabólica robusta (GH, IGF-1)",
    ],
    limites: [
      "Requer faixas BFR específicas (não improvisar com elástico)",
      "Não usar em varizes, trombose, hipertensão grave",
      "Apenas em membros (braço/coxa) — nunca em tronco",
    ],
    idealPara: "Off-season com articulações sobrecarregadas. Deload. Volume extra sem fadiga sistêmica.",
    alerta: "EQUIPAMENTO específico obrigatório. Improvisar com elásticos pode causar lesão vascular. Contraindicado em varizes/trombose.",
  },
  // ─────────────────────────────────────────
  {
    id: "intra-set-stretching",
    nome: "Intra-Set Stretching (Estiramento Entre Sets)",
    emoji: "🧘",
    shortLabel: "Intra-Stretch",
    categoria: "Metabólico",
    intensidade: 2,
    resumo: "60-90s de estiramento ativo do músculo trabalhado ENTRE sets. Mais sangue + mais mTOR ativado = mais hipertrofia.",
    comoFazer: [
      "Após cada set de trabalho, em vez de descansar parado, faça estiramento ATIVO do músculo trabalhado.",
      "Duração: 60-90 segundos.",
      "Estiramento na posição de máximo alongamento (com leve tensão).",
      "Próximo set imediatamente após o estiramento.",
    ],
    exemplos: [
      { exercicio: "Hack squat", protocolo: "Set → 60s lunge profundo (estira quadríceps) → próximo set" },
      { exercicio: "Supino", protocolo: "Set → 60s peitoral em quadro de porta → próximo set" },
      { exercicio: "Remada", protocolo: "Set → 60s estiramento do dorsal (pendurar barra) → próximo set" },
    ],
    beneficios: [
      "Aumenta perfusão sanguínea no músculo (mais nutrientes)",
      "Ativa mTOR (síntese proteica) via tensão alongada",
      "Pode expandir fáscia muscular ao longo do tempo",
      "Usado por John Meadows e Nick Walker (pros do BB)",
    ],
    limites: [
      "Não substitui descanso entre sets pesados de força (1-5 reps)",
      "Melhor em sets de hipertrofia (8-15 reps)",
    ],
    idealPara: "Treinos de hipertrofia, off-season, ênfase em qualidade muscular.",
  },
  // ─────────────────────────────────────────
  {
    id: "partial-reps",
    nome: "Partial Reps (Reps Parciais)",
    emoji: "✂️",
    shortLabel: "Parciais",
    categoria: "Volume Adicional",
    intensidade: 2,
    resumo: "Após falha completa, fazer 10-15 reps PARCIAIS no terço de máxima contração. Volume extra sem fadiga sistêmica.",
    comoFazer: [
      "Execute o set completo até a FALHA técnica.",
      "Continue imediatamente com 10-15 reps parciais no terço onde o músculo está em PICO de contração.",
      "Movimento curto, controlado, sem descanso.",
      "Excêntrica curta também (apenas o terço final).",
    ],
    exemplos: [
      { exercicio: "Cadeira extensora (vasto lateral)", protocolo: "Set completo até falha → 15 reps parciais no TERÇO SUPERIOR (pico de contração)" },
      { exercicio: "Elevação lateral", protocolo: "12 reps falha → 10 reps parciais no topo (pico do deltóide)" },
      { exercicio: "Rosca bíceps", protocolo: "10 reps falha → 10 parciais no terço médio (máxima tensão)" },
    ],
    beneficios: [
      "Volume extra sem esgotar SNC",
      "Estímulo no ponto de pico de contração",
      "Excelente para músculos que respondem a alta repetição (deltoides, panturrilhas, vastos)",
      "Pump intenso",
    ],
    limites: [
      "Só após o set completo até a falha real",
      "Forma técnica não pode degradar",
    ],
    idealPara: "Isolamentos. Músculos com fibras tipo I dominantes (panturrilhas, sóleo, vastos).",
  },
  // ─────────────────────────────────────────
  {
    id: "giant-sets",
    nome: "Giant Sets (Séries Gigantes)",
    emoji: "🦏",
    shortLabel: "Giant",
    categoria: "Metabólico",
    intensidade: 4,
    resumo: "4-6 exercícios em sequência SEM descanso, mesmo grupo muscular. Volume imenso em 10-15min = pump extremo + hipertrofia sarcoplasmática.",
    comoFazer: [
      "Selecione 4-6 exercícios para o MESMO grupo muscular.",
      "Comece com o composto mais pesado e termine com isolamento.",
      "Execute todos em sequência SEM descanso entre exercícios.",
      "Descanse 2-3 min apenas APÓS completar a sequência inteira.",
      "Repetir 2-3 rounds completos.",
    ],
    exemplos: [
      { exercicio: "Quadríceps Giant Set", protocolo: "Extensora 12 → Hack squat 10 → Leg press 12 → Sissy squat 10 → Extensora parcial 15 (sem descanso)" },
      { exercicio: "Peito Giant Set", protocolo: "Supino 8 → Inclinado 10 → Crucifixo 12 → Crossover 15" },
      { exercicio: "Costas Giant Set", protocolo: "Pulldown 10 → Remada baixa 10 → Pullover 12 → Remada unilateral 12" },
    ],
    beneficios: [
      "Volume brutal em 10-15 min",
      "Pump extremo = hipertrofia sarcoplasmática",
      "Excelente em off-season de ganho",
      "Treino time-efficient",
    ],
    limites: [
      "Cargas reduzidas (~70% do normal de cada exercício)",
      "Não usar em todos os treinos (alto stress metabólico)",
      "Exige planejamento de equipamentos (ocupar 4-6 estações)",
    ],
    idealPara: "Off-season, finalizadores de treino, dias de pump.",
  },
  // ─────────────────────────────────────────
  {
    id: "pause-reps",
    nome: "Pause Reps (Reps com Pausa)",
    emoji: "⏸️",
    shortLabel: "Pausa",
    categoria: "Tensão Mecânica",
    intensidade: 3,
    resumo: "Pausa de 2-3s no ponto de MAIOR TENSÃO. Elimina momentum = tensão mecânica pura = mais hipertrofia com menos peso.",
    comoFazer: [
      "Identifique o ponto de máxima tensão do exercício.",
      "Pause 2-3 segundos NESSA posição em cada repetição.",
      "Sem relaxar — manter contração ativa durante a pausa.",
      "Cargas ~70-80% do peso normal de trabalho.",
    ],
    exemplos: [
      { exercicio: "Hack squat", protocolo: "Pausa 2-3s no PARALELO em cada rep × 8-10 reps" },
      { exercicio: "RDL", protocolo: "Pausa 2-3s no estiramento máximo (parte baixa) × 8-10 reps" },
      { exercicio: "Hip thrust", protocolo: "Pausa 2-3s no TOPO (contração máxima do glúteo) × 10-12 reps" },
      { exercicio: "Supino", protocolo: "Pausa 2s no peito × 5-8 reps" },
    ],
    beneficios: [
      "Elimina momentum (movimento puramente muscular)",
      "Tensão mecânica máxima — principal driver de hipertrofia",
      "Melhora controle e técnica",
      "Reduz risco de lesão (sem rebote)",
    ],
    limites: [
      "Cargas devem ser reduzidas (~80% do normal)",
      "Não usar em todos os sets — alguns sets normais mantêm volume total",
    ],
    idealPara: "Compostos onde momentum compromete o estímulo (squat, RDL, supino, hip thrust).",
  },
  // ─────────────────────────────────────────
  {
    id: "contrast-pap",
    nome: "Contrast Training (PAP)",
    emoji: "⚡",
    shortLabel: "PAP",
    categoria: "Neural",
    intensidade: 5,
    resumo: "Post-Activation Potentiation: pesado (85-95% 1RM) → 3-5min descanso → explosivo. Ativação neural máxima = mais unidades motoras.",
    comoFazer: [
      "SET 1: exercício pesado, 3-5 reps a 85-95% 1RM.",
      "DESCANSO: 3-5 minutos COMPLETOS (essencial para PAP funcionar).",
      "SET 2: exercício explosivo ou pliometria do mesmo padrão motor.",
      "Repetir 3-4 rounds.",
      "PAP exige SNC fresco — usar no INÍCIO do treino.",
    ],
    exemplos: [
      { exercicio: "Pernas (PAP)", protocolo: "Hack squat 3 reps @ 90% → 3 min desc → Jump squat 5 reps explosivo" },
      { exercicio: "Peito (PAP)", protocolo: "Supino 3 reps @ 90% → 3 min desc → Plyo push-up 5 reps" },
      { exercicio: "Costas (PAP)", protocolo: "Remada pesada 3 reps → 3 min → Remada explosiva 5 reps" },
    ],
    beneficios: [
      "Ativação neural máxima do SNC",
      "Recrutamento de unidades motoras de alto limiar",
      "Mais força + potência simultaneamente",
      "Excelente para atletas explosivos (atletismo, MMA, futebol)",
    ],
    limites: [
      "Apenas com SNC FRESCO (início do treino)",
      "Descanso de 3-5min é OBRIGATÓRIO",
      "Não para iniciantes — exige forma perfeita em cargas altas",
    ],
    idealPara: "Atletas avançados focados em força + potência. Início de treino de pernas/peito.",
    alerta: "Descanso curto = anula o efeito PAP. Mínimo 3 min, ideal 4-5 min entre o pesado e o explosivo.",
  },
  // ─────────────────────────────────────────
  {
    id: "isokinetic-tempo",
    nome: "Isokinetic / Controle de Tempo",
    emoji: "⏲️",
    shortLabel: "Tempo",
    categoria: "Tensão Mecânica",
    intensidade: 2,
    resumo: "Velocidade constante em todo o ROM. Sem equipamento: controlar conscientemente 2s concêntrica / 2s excêntrica.",
    comoFazer: [
      "Defina um TEMPO para cada fase do movimento (notação 2-1-2-1: ecc-pausa-conc-pausa).",
      "Mantenha a velocidade CONSTANTE durante todo o ROM.",
      "Sem acelerações ou momentum.",
      "Use cronômetro mental ou parceiro contando.",
    ],
    exemplos: [
      { exercicio: "Hack squat (tempo 3-1-2-0)", protocolo: "3s descida / 1s pausa fundo / 2s subida / 0s topo × 8-10 reps" },
      { exercicio: "Supino (tempo 4-0-1-0)", protocolo: "4s descida controlada / 1s subida explosiva × 6-8 reps" },
      { exercicio: "Rosca direta (tempo 2-1-2-1)", protocolo: "Isokinético manual × 10-12 reps" },
    ],
    beneficios: [
      "Tempo sob tensão (TUT) maximizado",
      "Reduz lesão (controle total)",
      "Melhora conexão mente-músculo",
      "Usado em reabilitação e esporte olímpico",
    ],
    limites: [
      "Cargas reduzidas em ~20-30%",
      "Treinos mais longos por set",
    ],
    idealPara: "Hipertrofia. Reabilitação. Aprendizado técnico. Pontos fracos.",
  },
  // ─────────────────────────────────────────
  {
    id: "accommodating-resistance",
    nome: "Accommodating Resistance (Bandas/Correntes)",
    emoji: "⛓️",
    shortLabel: "Bandas/Correntes",
    categoria: "Neural",
    intensidade: 4,
    resumo: "Bandas elásticas ou correntes na barra: carga LEVE no fundo, MÁXIMA no topo. Tensão acomodada à curva de força. Westside Barbell.",
    comoFazer: [
      "Adicione bandas elásticas ou correntes à barra/máquina.",
      "No fundo do movimento: carga é menor (banda/corrente solta).",
      "No topo: carga adicional (banda esticada / corrente fora do chão).",
      "Use 25-35% do peso vindo de bandas/correntes + barra com 60-70% 1RM.",
      "Mantém tensão MÁXIMA na parte mais forte da curva de força.",
    ],
    exemplos: [
      { exercicio: "Leg press com bandas", protocolo: "150kg + 2 bandas pretas → 6-8 reps explosivas" },
      { exercicio: "Hip thrust com bandas", protocolo: "100kg + 2 bandas vermelhas → 8-10 reps" },
      { exercicio: "Supino com correntes", protocolo: "70kg barra + 20kg correntes → 5 reps" },
      { exercicio: "Hack squat com bandas", protocolo: "120kg + bandas → tensão máxima no topo" },
    ],
    beneficios: [
      "Tensão acomodada à curva de força natural do músculo",
      "Força explosiva em todo o ROM",
      "Recrutamento neural máximo no topo",
      "Westside Barbell usa há décadas com powerlifters de elite",
    ],
    limites: [
      "Requer bandas/correntes específicas",
      "Curva de aprendizado para dosar a tensão",
      "Não para iniciantes — exige forma sólida",
    ],
    idealPara: "Avançados em fase de força ou pico de contração. Hip thrust, leg press, supino.",
  },
];

// Categorias para agrupamento na UI
export const TECHNIQUE_CATEGORIES = [
  { id: "Pós-Falha", emoji: "💥", color: "red" },
  { id: "Tensão Mecânica", emoji: "🎯", color: "blue" },
  { id: "Volume Adicional", emoji: "📊", color: "green" },
  { id: "Neural", emoji: "⚡", color: "yellow" },
  { id: "Metabólico", emoji: "🩸", color: "purple" },
] as const;
