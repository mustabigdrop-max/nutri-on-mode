// ============================================================
// MODELOS DE PERIODIZAÇÃO — 6 MODELOS CIENTÍFICOS
// ============================================================

export interface PeriodizationWeek {
  semana: string;
  protocolo: string;
  detalhe?: string;
}

export interface PeriodizationModel {
  id: string;
  nome: string;
  emoji: string;
  shortLabel: string;
  publico: string; // Iniciante | Intermediário | Avançado | Elite
  complexidade: 1 | 2 | 3 | 4 | 5;
  resumo: string;
  origem?: string;
  comoFunciona: string[];
  estrutura: PeriodizationWeek[];
  vantagens: string[];
  desvantagens: string[];
  quandoUsar: string;
  exemploPratico: string;
  alerta?: string;
}

export const PERIODIZATION_MODELS: PeriodizationModel[] = [
  // ─────────────────────────────────────────
  {
    id: "linear-simples",
    nome: "Linear Simples",
    emoji: "📈",
    shortLabel: "Linear",
    publico: "Iniciantes a Intermediários",
    complexidade: 1,
    resumo: "Reduz reps e aumenta carga progressivamente a cada semana. O modelo mais simples e previsível.",
    origem: "Modelo clássico ocidental (anos 50-70).",
    comoFunciona: [
      "Carga sobe de forma linear semana a semana.",
      "Reps caem proporcionalmente.",
      "Volume diminui, intensidade aumenta.",
      "Ciclos de 4 semanas com deload no final do macro.",
    ],
    estrutura: [
      { semana: "Semana 1", protocolo: "3 × 12", detalhe: "Adaptação / volume" },
      { semana: "Semana 2", protocolo: "3 × 10", detalhe: "Hipertrofia" },
      { semana: "Semana 3", protocolo: "3 × 8", detalhe: "Hipertrofia + força" },
      { semana: "Semana 4", protocolo: "4 × 6", detalhe: "Força — pico do mesociclo" },
    ],
    vantagens: [
      "Extremamente simples de programar e seguir",
      "Excelente para iniciantes (progressão clara)",
      "Fácil de medir progresso",
    ],
    desvantagens: [
      "Pouca variação = platô em intermediários/avançados",
      "Não considera recuperação diária",
      "Foco em uma só qualidade física por vez",
    ],
    quandoUsar: "Primeiros 6-12 meses de treino sério, ou ao iniciar um novo exercício.",
    exemploPratico: "Supino: Sem 1 → 60kg 3×12 / Sem 2 → 65kg 3×10 / Sem 3 → 70kg 3×8 / Sem 4 → 75kg 4×6.",
  },
  // ─────────────────────────────────────────
  {
    id: "dup",
    nome: "Ondulatória Diária (DUP)",
    emoji: "🌊",
    shortLabel: "DUP",
    publico: "Intermediários a Avançados",
    complexidade: 3,
    resumo: "Varia força, potência e hipertrofia DENTRO da MESMA semana. Modelo mais sofisticado e validado cientificamente.",
    origem: "Daily Undulating Periodization — popularizada por Rhea, Kraemer (anos 2000).",
    comoFunciona: [
      "Cada sessão semanal foca em uma qualidade diferente.",
      "Estímulos variados = maior recrutamento neural + hipertrofia.",
      "Permite frequência 3x/semana no mesmo grupo muscular.",
      "Recuperação otimizada por variação de intensidade.",
    ],
    estrutura: [
      { semana: "Segunda", protocolo: "Força — 4-6 reps @ 85-90% 1RM", detalhe: "Carga alta, baixo volume" },
      { semana: "Quarta", protocolo: "Potência — 3-5 reps @ 70-80% explosiva", detalhe: "Velocidade máxima na concêntrica" },
      { semana: "Sexta", protocolo: "Hipertrofia — 8-15 reps @ 65-75%", detalhe: "Volume alto, pump" },
    ],
    vantagens: [
      "Superior à linear em intermediários (Rhea 2002, Stone 1999)",
      "Trabalha múltiplas qualidades simultaneamente",
      "Reduz risco de platô e overtraining",
    ],
    desvantagens: [
      "Requer planejamento mais cuidadoso",
      "Não ideal para iniciantes (excesso de variação)",
    ],
    quandoUsar: "1+ ano de treino. Quando a periodização linear estagnou.",
    exemploPratico: "Supino — Seg: 80kg 5×5 / Qua: 65kg 6×3 explosivo / Sex: 60kg 4×12.",
    alerta: "Você está usando este modelo atualmente. ✅",
  },
  // ─────────────────────────────────────────
  {
    id: "wup",
    nome: "Ondulatória Semanal (WUP)",
    emoji: "📊",
    shortLabel: "WUP",
    publico: "Intermediários a Avançados",
    complexidade: 3,
    resumo: "Cada semana trabalha uma qualidade física diferente, com deload no final do mesociclo.",
    origem: "Weekly Undulating Periodization — variante da DUP.",
    comoFunciona: [
      "Mesociclo de 4 semanas, cada uma com foco diferente.",
      "Permite acumulação de volume por qualidade.",
      "Ideal para quem treina cada grupo apenas 1-2x/semana.",
    ],
    estrutura: [
      { semana: "Semana 1", protocolo: "Força — 5×5 @ 85%", detalhe: "Base neural" },
      { semana: "Semana 2", protocolo: "Hipertrofia — 4×10 @ 70%", detalhe: "Volume máximo" },
      { semana: "Semana 3", protocolo: "Potência — 6×3 @ 75% explosivo", detalhe: "Conversão neural" },
      { semana: "Semana 4", protocolo: "Deload — 3×8 @ 50-60%", detalhe: "Recuperação ativa" },
    ],
    vantagens: [
      "Mais simples que DUP, mais variado que linear",
      "Ótimo para split tradicional (1x/semana por grupo)",
      "Deload programado evita overtraining",
    ],
    desvantagens: [
      "Menos estímulo neural por semana que DUP",
      "Adaptação mais lenta",
    ],
    quandoUsar: "Splits ABCDE / push-pull-legs com baixa frequência por grupo.",
    exemploPratico: "Macro de 4 semanas: força → hipertrofia → potência → deload → repetir com cargas maiores.",
  },
  // ─────────────────────────────────────────
  {
    id: "conjugada",
    nome: "Conjugada (Westside)",
    emoji: "🏋️",
    shortLabel: "Westside",
    publico: "Avançados a Elite",
    complexidade: 5,
    resumo: "Combina Esforço Máximo (ME) e Esforço Dinâmico (DE) na mesma semana. Padrão-ouro de powerlifters de elite.",
    origem: "Criado por Louie Simmons no Westside Barbell — usado por powerlifters de classe mundial.",
    comoFunciona: [
      "ME Day: cargas máximas (1-3 reps @ 90-100% 1RM).",
      "DE Day: 50-60% 1RM com VELOCIDADE máxima (8-12 sets × 2-3 reps).",
      "Exercício principal do ME Day VARIA toda semana (rotação de variações).",
      "Acessórios construídos sobre fraquezas específicas.",
    ],
    estrutura: [
      { semana: "Seg (ME Inferior)", protocolo: "Agachamento variação × 1-3 RM", detalhe: "Box squat, agacho c/ correntes, etc." },
      { semana: "Qua (ME Superior)", protocolo: "Supino variação × 1-3 RM", detalhe: "Floor press, supino c/ board, etc." },
      { semana: "Sex (DE Inferior)", protocolo: "Agacho/Levantamento 50-60% × 8-12 × 2-3 reps explosivos", detalhe: "Velocidade > carga" },
      { semana: "Dom (DE Superior)", protocolo: "Supino 50% × 9 × 3 reps explosivos", detalhe: "Conversão neural" },
    ],
    vantagens: [
      "Desenvolve força + velocidade simultaneamente (mais unidades motoras)",
      "Variação contínua = sem platô",
      "Validado em powerlifters de elite por 30+ anos",
    ],
    desvantagens: [
      "Complexo de programar",
      "Requer acesso a correntes, bands, racks especializados",
      "Risco de lesão se aplicado por iniciantes",
    ],
    quandoUsar: "Powerlifters intermediários/avançados. Bodybuilders avançados em fase de força.",
    exemploPratico: "Adaptado para BB: ME day com compostos pesados (1-5 reps); DE day com mesmos padrões a 50% + explosão na concêntrica.",
    alerta: "Avançado — exige experiência técnica. Para BB, adapte: ME = 1-5 reps / DE = 50% explosivo.",
  },
  // ─────────────────────────────────────────
  {
    id: "bloco",
    nome: "Bloco (Block Periodization)",
    emoji: "🧱",
    shortLabel: "Bloco",
    publico: "Avançados",
    complexidade: 4,
    resumo: "Três blocos sequenciais: Acumulação → Transmutação → Realização. Escola soviética de alto rendimento.",
    origem: "Issurin / Verkhoshansky — escola soviética de periodização.",
    comoFunciona: [
      "Acumulação (3-4 sem): volume alto, intensidade moderada — base.",
      "Transmutação (2-4 sem): converte volume em força/potência específica.",
      "Realização (1-2 sem): pico de performance, baixo volume + alta intensidade.",
      "Cada bloco foca em UMA qualidade dominante.",
    ],
    estrutura: [
      { semana: "Bloco 1 — Acumulação", protocolo: "4-5 sem × 4-5×10-12 @ 65-75%", detalhe: "Volume hipertrófico" },
      { semana: "Bloco 2 — Transmutação", protocolo: "3-4 sem × 4-5×5-8 @ 75-85%", detalhe: "Conversão para força" },
      { semana: "Bloco 3 — Realização", protocolo: "1-2 sem × 3-4×2-4 @ 85-95%", detalhe: "Pico — testes de RM" },
    ],
    vantagens: [
      "Adaptações profundas por concentração de estímulo",
      "Ideal para periodizar competições/peak weeks",
      "Base científica robusta (escola soviética)",
    ],
    desvantagens: [
      "Perda parcial das qualidades não treinadas no bloco atual",
      "Complexo para autoregulação",
    ],
    quandoUsar: "Atletas com data-alvo (competição, peak week, ensaio fotográfico).",
    exemploPratico: "12 sem para uma competição: 5 sem volume → 4 sem força → 2 sem peak → 1 sem deload + competição.",
  },
  // ─────────────────────────────────────────
  {
    id: "apre",
    nome: "Autoregulada (APRE)",
    emoji: "🎯",
    shortLabel: "APRE",
    publico: "Intermediários a Avançados",
    complexidade: 4,
    resumo: "Auto-Regulated Progressive Resistance Exercise — ajusta o peso baseado na performance REAL do dia.",
    origem: "Mann, Thyfault, Ivey, Sayers (Univ. Missouri, 2010) — superior à periodização linear em estudos controlados.",
    comoFunciona: [
      "Set 1: nº fixo de reps com peso de trabalho (warm-up das séries efetivas).",
      "Set 2: AMRAP — máximo de reps com o mesmo peso até a falha.",
      "Set 3: peso AJUSTADO baseado na performance do set 2.",
      "Adaptação dinâmica ao estado real do atleta naquele dia.",
    ],
    estrutura: [
      { semana: "Set 1", protocolo: "10 reps × peso fixo", detalhe: "Carga base" },
      { semana: "Set 2 (AMRAP)", protocolo: "Máximo de reps × mesmo peso", detalhe: "Determina o ajuste do set 3" },
      { semana: "Ajuste — Set 2 com 0-6 reps", protocolo: "↓ Diminuir 2,5-5kg no set 3", detalhe: "Recuperação ruim" },
      { semana: "Ajuste — Set 2 com 7-10 reps", protocolo: "= Manter peso no set 3", detalhe: "Performance esperada" },
      { semana: "Ajuste — Set 2 com 11-12 reps", protocolo: "↑ Aumentar 2,5kg no set 3", detalhe: "Bom dia" },
      { semana: "Ajuste — Set 2 com 13+ reps", protocolo: "↑↑ Aumentar 5-7kg no set 3", detalhe: "Dia excepcional" },
    ],
    vantagens: [
      "Superior à linear em estudos controlados (Mann 2010)",
      "Adapta-se à variação diária de recuperação/sono/stress",
      "Auto-corrige cargas — sem peso 'fantasma' programado",
      "Sempre próximo da intensidade ótima",
    ],
    desvantagens: [
      "Requer disciplina para ir até a falha verdadeira",
      "Difícil de pré-programar exatamente",
      "Pode subestimar carga se a falha não for real",
    ],
    quandoUsar: "Quando você sente que peso fixo programado não está funcionando — corpo varia dia a dia.",
    exemploPratico: "Supino 80kg — Set 1: 10 reps / Set 2: 12 reps (AMRAP) → Set 3: 82,5kg × 8-10. Próximo treino começa em 82,5kg.",
    alerta: "Por que é superior: o corpo VARIA dia a dia. Peso fixo ignora recuperação. APRE se adapta ao estado real do atleta.",
  },
];
