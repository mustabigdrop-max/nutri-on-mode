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
  // ─────────────────────────────────────────
  {
    id: "531-wendler",
    nome: "5/3/1 (Jim Wendler)",
    emoji: "🔱",
    shortLabel: "5/3/1",
    publico: "Intermediários a Avançados",
    complexidade: 3,
    resumo: "Um dos métodos mais populares do mundo. Ciclo mensal de 4 semanas baseado em % do 1RM, com AMRAP no último set como termômetro de progressão.",
    origem: "Criado por Jim Wendler (ex-powerlifter Westside) — milhões de adeptos globalmente.",
    comoFunciona: [
      "Use 90% do 1RM como Training Max (TM) — todos os % são calculados sobre o TM, não sobre o 1RM real.",
      "4 lifts principais (squat, supino, deadlift, desenvolvimento), cada um treinado 1x por semana.",
      "Último set de cada semana é AMRAP (máximo de reps) — é o seu termômetro.",
      "Progressão mensal: +2,5kg upper body / +5kg lower body no TM se AMRAP foi bom.",
      "Para BB: aplicar nos compostos principais (hack squat, supino, remada, desenvolvimento) + adicionar volume acessório depois.",
    ],
    estrutura: [
      { semana: "Semana 1", protocolo: "5/5/5+ @ 65/75/85% TM", detalhe: "Volume — último set AMRAP (mín. 5 reps)" },
      { semana: "Semana 2", protocolo: "3/3/3+ @ 70/80/90% TM", detalhe: "Intensidade — último set AMRAP (mín. 3 reps)" },
      { semana: "Semana 3", protocolo: "5/3/1+ @ 75/85/95% TM", detalhe: "Pico — último set AMRAP (mín. 1 rep)" },
      { semana: "Semana 4", protocolo: "Deload — 5/5/5 @ 40/50/60% TM", detalhe: "Recuperação ativa obrigatória" },
    ],
    vantagens: [
      "Progressão lenta e sustentável — anti-platô",
      "AMRAP fornece feedback real semanal",
      "Flexível: combina com qualquer rotina de acessórios",
      "Variações: 5/3/1 Forever (mais volume), Building the Monolith (força + massa), SVR II (mais BB)",
    ],
    desvantagens: [
      "Progresso percebido como lento por iniciantes",
      "Apenas 1x/semana por lift — pode ser pouca frequência para alguns",
      "Requer 1RM/TM acurado",
    ],
    quandoUsar: "Após sair do progresso linear. Ideal para intermediários consolidando força nos compostos.",
    exemploPratico: "Supino TM=100kg — Sem 1: 65×5, 75×5, 85×AMRAP / Sem 2: 70×3, 80×3, 90×AMRAP / Sem 3: 75×5, 85×3, 95×AMRAP / Sem 4: deload.",
    alerta: "Regra do AMRAP: se conseguir 2-3 reps acima do mínimo, próximo ciclo aumenta TM. Se mal bater o mínimo, mantém.",
  },
  // ─────────────────────────────────────────
  {
    id: "smolov",
    nome: "Smolov (Squat Russo)",
    emoji: "🦵",
    shortLabel: "Smolov",
    publico: "Avançados a Elite",
    complexidade: 5,
    resumo: "13 semanas de especialização BRUTAL no agachamento. Ganhos típicos de 20-40kg no squat. Para preparar quadríceps explosivos antes de prep.",
    origem: "Programa do treinador russo Sergey Smolov — usado por powerlifters soviéticos.",
    comoFunciona: [
      "Especialização TOTAL no agachamento por 13 semanas.",
      "Frequência altíssima: 4 sessões de squat/semana na fase base.",
      "Volume crescente até MRV (Maximum Recoverable Volume) extremo.",
      "Fase de intensificação reduz frequência mas aumenta carga.",
      "Outros lifts em manutenção apenas — TUDO gira em torno do squat.",
    ],
    estrutura: [
      { semana: "Sem 1-2 — Introdução", protocolo: "4× / sem — 4×9, 5×7, 7×5, 10×3 @ 70-85%", detalhe: "Adaptação ao volume" },
      { semana: "Sem 3-6 — Fase Base", protocolo: "4× / sem — volume crescente até MRV", detalhe: "MRV brutal — fase mais difícil" },
      { semana: "Sem 7-8 — Switching", protocolo: "Transição com volume reduzido", detalhe: "Recuperação dirigida" },
      { semana: "Sem 9-12 — Intensificação", protocolo: "3× / sem — cargas mais pesadas (85-95%)", detalhe: "Conversão em força máxima" },
      { semana: "Sem 13 — Realização", protocolo: "Teste de novo 1RM", detalhe: "PR esperado: +20-40kg" },
    ],
    vantagens: [
      "Ganhos brutais e mensuráveis no squat",
      "Excelente para destravar platôs de pernas",
      "Desenvolvimento explosivo do quadríceps (ideal antes de prep)",
    ],
    desvantagens: [
      "Recuperação extremamente exigente",
      "Risco real de overtraining se nutrição/sono não forem perfeitos",
      "Sacrifica progresso em todos os outros lifts",
      "Não recomendado para iniciantes ou histórico de lesão de joelho/lombar",
    ],
    quandoUsar: "Atleta avançado, bem recuperado, com 6+ meses de off-season. Antes de prep para destravar pernas.",
    exemploPratico: "Squat 1RM=180kg — Sem 1: 4 sessões/sem, volume crescente. Sem 13: testar 1RM novo (esperado 200-220kg).",
    alerta: "PROGRAMA EXTREMO. Exige nutrição em superávit, 8h+ sono, zero stress externo. Não combinar com cutting agressivo.",
  },
  // ─────────────────────────────────────────
  {
    id: "sheiko",
    nome: "Sheiko (Powerlifting Russo)",
    emoji: "🇷🇺",
    shortLabel: "Sheiko",
    publico: "Avançados",
    complexidade: 4,
    resumo: "Frequência altíssima nos 3 lifts. Volume baixo por sessão, volume MUITO alto por semana. Princípio: frequência > volume por sessão.",
    origem: "Boris Sheiko — treinador da equipe russa de powerlifting (múltiplas medalhas mundiais).",
    comoFunciona: [
      "Squat 4x/semana, Bench 4x/semana, Deadlift 3x/semana.",
      "Cargas moderadas (70-85% 1RM) na maioria das sessões.",
      "Volume distribuído ao longo da semana = mais prática técnica + recuperação por sessão.",
      "Programado em ciclos de 4 semanas com variação de volume/intensidade.",
      "Para BB: adaptar com menos carga e mais reps por set (8-12 vez de 3-5).",
    ],
    estrutura: [
      { semana: "Segunda", protocolo: "Squat pesado + Bench moderado + acessórios", detalhe: "Sessão técnica completa" },
      { semana: "Terça", protocolo: "Bench pesado + Deadlift leve + acessórios", detalhe: "Foco superior" },
      { semana: "Quarta", protocolo: "Squat leve + Bench leve (técnica)", detalhe: "Sessão de prática" },
      { semana: "Sexta", protocolo: "Squat moderado + Bench pesado + Deadlift moderado", detalhe: "Sessão completa" },
      { semana: "Sábado", protocolo: "Squat leve + Bench moderado + Deadlift pesado", detalhe: "Encerra a semana" },
    ],
    vantagens: [
      "Aprimora técnica via repetição constante",
      "Recuperação distribuída — menos fadiga acumulada por sessão",
      "Validado em medalhistas mundiais",
      "Excelente para platôs em força máxima",
    ],
    desvantagens: [
      "Exige 5-6 dias de treino/semana (alta carga horária)",
      "Pouco espaço para hipertrofia pura",
      "Difícil para quem trabalha em horários irregulares",
    ],
    quandoUsar: "Powerlifters intermediários/avançados. BBs com tempo livre que querem técnica + força.",
    exemploPratico: "Squat 200kg 1RM — segunda 5×3 @ 80% / quarta 5×3 @ 70% (técnica) / sexta 4×4 @ 75% / sábado 6×2 @ 85%.",
  },
  // ─────────────────────────────────────────
  {
    id: "cube-method",
    nome: "Cube Method (Brandon Lilly)",
    emoji: "🎲",
    shortLabel: "Cube",
    publico: "Intermediários a Avançados",
    complexidade: 3,
    resumo: "3 lifts principais rotacionados em 3 estilos: Pesado / Explosivo / Moderado. Cada lift é trabalhado de 3 formas diferentes a cada 3 semanas.",
    origem: "Criado por Brandon Lilly — powerlifter americano de classe mundial.",
    comoFunciona: [
      "Rotação em ciclo de 3 semanas para os 3 lifts principais (squat, bench, deadlift).",
      "Cada semana, cada lift recebe um tipo de estímulo diferente.",
      "Adaptação máxima sem acomodação — corpo nunca se 'acostuma'.",
      "Acessórios complementam o estímulo da semana.",
    ],
    estrutura: [
      { semana: "Semana 1", protocolo: "Pesado SQUAT / Moderado BENCH / Explosivo DEADLIFT", detalhe: "Squat 5×1-3 @ 90%+, Bench 4×5 @ 75%, DL 8×2 explosivo @ 60%" },
      { semana: "Semana 2", protocolo: "Explosivo SQUAT / Pesado BENCH / Moderado DEADLIFT", detalhe: "Squat 8×3 @ 60%, Bench 5×1-3 @ 90%+, DL 4×5 @ 75%" },
      { semana: "Semana 3", protocolo: "Moderado SQUAT / Explosivo BENCH / Pesado DEADLIFT", detalhe: "Squat 4×5 @ 75%, Bench 8×3 @ 60%, DL 5×1-3 @ 90%+" },
      { semana: "Semana 4", protocolo: "Deload + recomeça ciclo", detalhe: "Cargas leves técnicas" },
    ],
    vantagens: [
      "Variedade balanceada por ciclo (sem perder nenhuma qualidade)",
      "Recuperação inteligente: nunca pesado em tudo na mesma semana",
      "Anti-acomodação por design",
      "Fácil de acompanhar e programar",
    ],
    desvantagens: [
      "Apenas 1x/semana por lift",
      "Requer entender bem o que é 'explosivo' vs 'pesado' vs 'moderado'",
    ],
    quandoUsar: "Intermediários querendo balancear força, velocidade e técnica sem complexidade Westside.",
    exemploPratico: "Ciclo de 3 sem para squat: pesado (5×1-3) → explosivo (8×3 rápido) → moderado (4×5) → repetir com mais carga.",
  },
  // ─────────────────────────────────────────
  {
    id: "texas-method",
    nome: "Texas Method",
    emoji: "🤠",
    shortLabel: "Texas",
    publico: "Intermediários a Avançados",
    complexidade: 2,
    resumo: "Ciclo semanal: Volume (Seg) → Recuperação (Qua) → Intensidade/PR (Sex). Simples, brutal e muito efetivo.",
    origem: "Atribuído a Glenn Pendlay — derivado do Starting Strength para intermediários.",
    comoFunciona: [
      "Ciclo SEMANAL (não mensal) — o PR vem toda sexta.",
      "Segunda: Volume Day — 5×5 @ 90% do peso de trabalho da sexta passada.",
      "Quarta: Recovery Day — 5×5 @ 80% (sessão leve, técnica).",
      "Sexta: Intensity Day — 1×5 PR (tentativa de recorde de 5RM).",
      "Se bater PR na sexta, próxima segunda usa esse novo peso como base.",
    ],
    estrutura: [
      { semana: "Segunda — Volume", protocolo: "5×5 @ 90% do PR atual de 5RM", detalhe: "Sessão mais difícil — volume puro" },
      { semana: "Quarta — Recovery", protocolo: "2-3×5 @ 80% (squat) / 5×5 leve (bench)", detalhe: "Recuperação ativa" },
      { semana: "Sexta — Intensity", protocolo: "Aquecer e ir para 1×5 PR", detalhe: "Tentativa de novo recorde de 5RM" },
    ],
    vantagens: [
      "Progressão SEMANAL (não mensal) — feedback rápido",
      "Estrutura simples — fácil de seguir",
      "Validado em milhares de intermediários",
      "Funciona bem para squat, bench, deadlift e desenvolvimento",
    ],
    desvantagens: [
      "Volume Day é brutal — exige recuperação perfeita",
      "Para de funcionar quando você se torna avançado (precisa migrar para mensal)",
      "Pouco espaço para acessórios pesados",
    ],
    quandoUsar: "Intermediário recém-saído do progresso linear (Starting Strength). 1-2 anos de treino sério.",
    exemploPratico: "Squat: PR de 5RM = 140kg → Seg: 5×5 @ 125kg / Qua: 2×5 @ 115kg / Sex: 1×5 @ 142,5kg (novo PR).",
  },
];
