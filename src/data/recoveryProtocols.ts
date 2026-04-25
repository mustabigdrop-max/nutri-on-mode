// ============================================================
// PROTOCOLOS DE RECUPERAÇÃO — RECOVERY ARSENAL
// ============================================================

export interface RecoveryStep {
  fase: string;
  descricao: string;
  duracao?: string;
}

export interface RecoveryProtocol {
  id: string;
  nome: string;
  emoji: string;
  shortLabel: string;
  categoria: "Ativa" | "Térmica" | "Sono" | "Vascular" | "Hormonal";
  intensidade: 1 | 2 | 3 | 4 | 5; // estresse fisiológico (5 = mais demandante)
  resumo: string;
  protocolo: RecoveryStep[];
  beneficios: string[];
  sinergias: string[]; // sinergia com peptídeos / suplementos / treino
  quandoUsar: string;
  evitar?: string;
  alerta?: string;
}

export const RECOVERY_PROTOCOLS: RecoveryProtocol[] = [
  // ─────────────────────────────────────────
  {
    id: "active-recovery",
    nome: "Active Recovery (Recuperação Ativa)",
    emoji: "🚶",
    shortLabel: "Active",
    categoria: "Ativa",
    intensidade: 1,
    resumo:
      "Movimento leve em dias de descanso para acelerar a recuperação muscular. Mais fluxo sanguíneo = mais nutrientes chegando ao músculo, sem adicionar fadiga ao SNC.",
    protocolo: [
      { fase: "Caminhada Zona 1", descricao: "Caminhada leve, conversa fluida possível, FC 50-60% máx.", duracao: "20-30 min" },
      { fase: "Mobilidade", descricao: "Mobilidade articular global: quadril, ombros, coluna torácica.", duracao: "10 min" },
      { fase: "Alongamento estático leve", descricao: "Mantido por 30-45s por grupo muscular trabalhado na semana.", duracao: "10 min" },
      { fase: "Foam roller / liberação miofascial", descricao: "Rolar quadríceps, glúteos, posterior, lats e peitoral. 30-60s por região.", duracao: "10 min" },
    ],
    beneficios: [
      "Aumento do fluxo sanguíneo periférico = mais nutrientes ao músculo",
      "Remoção de metabólitos residuais (lactato, H+)",
      "Redução da percepção de DOMS (dor tardia)",
      "Manutenção da mobilidade articular sem adicionar fadiga",
    ],
    sinergias: [
      "Combinar com hidratação + eletrólitos pós-sessão",
      "Ideal antes de banho de contraste (vasodilatação prévia)",
      "Sinergia com refeição rica em ômega-3 no mesmo dia",
    ],
    quandoUsar:
      "Dias de OFF entre treinos pesados, ou na manhã do dia seguinte a treinos de pernas/costas pesados.",
  },

  // ─────────────────────────────────────────
  {
    id: "cold-heat-contrast",
    nome: "Banho de Contraste (Cold/Heat)",
    emoji: "🥶",
    shortLabel: "Contraste",
    categoria: "Vascular",
    intensidade: 3,
    resumo:
      "Alternância entre água fria e quente cria efeito de bombeamento vascular (vasoconstrição → vasodilatação), acelerando a remoção de subprodutos da fadiga.",
    protocolo: [
      { fase: "Banho frio", descricao: "Água fria (10-15°C). Foco em pernas, costas e ombros.", duracao: "3-4 min" },
      { fase: "Banho quente", descricao: "Água quente (38-42°C), confortável mas intensa.", duracao: "3-4 min" },
      { fase: "Repetir ciclo", descricao: "Alternar 3-4 vezes, sempre terminando no FRIO se quiser efeito anti-inflamatório, ou no QUENTE se quiser relaxamento.", duracao: "20-30 min total" },
    ],
    beneficios: [
      "Bombeamento vascular acelera clearance metabólico",
      "Redução de inchaço e DOMS percebido",
      "Melhora do retorno venoso (excelente para pernas)",
      "Estímulo simpático leve = aumento de alerta e bem-estar",
    ],
    sinergias: [
      "Cold exposure pré-cardio jejum = maior oxidação de gordura",
      "Combina bem com sauna (Nordic cycle: sauna → frio)",
    ],
    quandoUsar:
      "Pelo menos 6h após treino de hipertrofia, ou em dias de descanso. Ideal pela manhã ou início da tarde.",
    evitar:
      "NÃO usar imediatamente pós-treino de hipertrofia (até 6h depois).",
    alerta:
      "Frio imediatamente pós-treino reduz a inflamação anabólica inicial — atrapalha o sinal de hipertrofia (mTOR/MPS). Usar com pelo menos 6h de janela.",
  },

  // ─────────────────────────────────────────
  {
    id: "sauna",
    nome: "Sauna (Heat Therapy)",
    emoji: "🔥",
    shortLabel: "Sauna",
    categoria: "Térmica",
    intensidade: 3,
    resumo:
      "Exposição ao calor (80-100°C) ativa Heat Shock Proteins (HSP) e libera GH em até 16x. Ferramenta poderosa de recuperação e otimização hormonal.",
    protocolo: [
      { fase: "Ciclo 1 - Sauna", descricao: "80-100°C. Manter calmo, respiração nasal, hidratação prévia.", duracao: "15-20 min" },
      { fase: "Descanso", descricao: "Sair, hidratar com água + eletrólitos, baixar FC.", duracao: "10 min" },
      { fase: "Ciclo 2 - Sauna", descricao: "Repetir mesma duração.", duracao: "15-20 min" },
      { fase: "Descanso", descricao: "Hidratação adicional. Opcional: chuveiro frio ao final.", duracao: "10 min" },
      { fase: "Ciclo 3 (opcional)", descricao: "Para usuários adaptados.", duracao: "15-20 min" },
    ],
    beneficios: [
      "Heat Shock Proteins (HSP70/HSP90) = reparo proteico acelerado",
      "GH aumentado em até 16x após sessão (Laukkanen et al.)",
      "Adaptação cardiovascular (similar a cardio leve)",
      "Detox via suor (metais pesados, BPA)",
      "Redução de mortalidade cardiovascular (estudos finlandeses)",
    ],
    sinergias: [
      "SINERGIA MÁXIMA com CJC-1295 / Ipamorelin (potencializa pulso GH)",
      "Sinergia com sono profundo na mesma noite (pico GH noturno amplificado)",
      "Pré-treino leve: sauna eleva temperatura central = melhor performance",
    ],
    quandoUsar:
      "Pós-treino (após reidratação) ou em dias de descanso. 3-4x por semana é o sweet spot baseado em dados finlandeses.",
    alerta:
      "Hidratar agressivamente (água + sódio + potássio). Não usar em jejum prolongado, com álcool ou após esforço extremo. Mulheres gestantes: evitar.",
  },

  // ─────────────────────────────────────────
  {
    id: "sleep-optimization",
    nome: "Sleep Optimization Protocol",
    emoji: "😴",
    shortLabel: "Sleep",
    categoria: "Sono",
    intensidade: 1,
    resumo:
      "8-10h de sono otimizado é a ferramenta de recuperação mais subutilizada. Sono profundo = pico de GH endógeno, reparo neural e síntese proteica máxima.",
    protocolo: [
      { fase: "Ambiente", descricao: "Quarto a 18-20°C, escuridão TOTAL (blackout), silêncio (white noise se necessário).", duracao: "Toda a noite" },
      { fase: "Sem telas", descricao: "Bloqueio de luz azul 1h antes. Modo noturno ou óculos blue-blocker.", duracao: "1h antes de dormir" },
      { fase: "Stack noturno", descricao: "Magnésio glicinato 400mg + Glicina 3g + Cereja azeda (Tart Cherry) 150ml + Ashwagandha KSM-66 600mg.", duracao: "30-60 min antes de dormir" },
      { fase: "Rotina de wind-down", descricao: "Banho morno, leitura, respiração 4-7-8. Evitar discussões, e-mail, decisões.", duracao: "30-45 min antes" },
      { fase: "Janela de sono", descricao: "Dormir entre 22h-23h para alinhar com pico noturno de melatonina e GH.", duracao: "8-10h" },
    ],
    beneficios: [
      "Pico de GH endógeno nas primeiras 90 min de sono profundo",
      "Síntese proteica máxima durante REM e NREM-3",
      "Consolidação de memória motora (aprendizado de padrões de movimento)",
      "Redução de cortisol matinal e melhor sensibilidade à insulina",
      "Recuperação do SNC (essencial para treinos de força)",
    ],
    sinergias: [
      "SINERGIA CRÍTICA com CJC-1295 / Ipamorelin (aplicar pré-sono potencializa o pulso GH natural)",
      "Magnésio + Glicina = redução da temperatura central + relaxamento GABAérgico",
      "Ashwagandha = redução de cortisol noturno (ideal para off-season)",
      "Tart Cherry = melatonina endógena + anti-inflamatório natural",
    ],
    quandoUsar: "TODO DIA. Não-negociável para atletas em off-season ou em busca de hipertrofia máxima.",
    alerta:
      "Cafeína tem meia-vida de 5-7h. Cortar consumo até 14h para sono de qualidade. Álcool destrói a arquitetura de sono REM mesmo em doses pequenas.",
  },

  // ─────────────────────────────────────────
  {
    id: "sleep-periodization",
    nome: "Periodização do Sono",
    emoji: "🛌",
    shortLabel: "Sleep Per.",
    categoria: "Sono",
    intensidade: 2,
    resumo:
      "Estratégia usada por atletas olímpicos: ajustar a quantidade e prioridade do sono conforme a demanda do treino do dia. Treino pesado = sono inegociável.",
    protocolo: [
      { fase: "Dia de treino PESADO", descricao: "Prioridade máxima: zero compromisso após o treino, dormir 30-60 min mais cedo, 9-10h de sono.", duracao: "9-10h" },
      { fase: "Dia de treino MODERADO", descricao: "Sono padrão 8h, manter rotina de wind-down.", duracao: "8h" },
      { fase: "Dia de descanso ATIVO", descricao: "Flexibilidade leve, 7,5-8h, pode ter compromissos sociais.", duracao: "7,5-8h" },
      { fase: "Dia pré-competição / PR", descricao: "Duas noites antes é a mais importante (não a véspera). Garantir 9h+ na antepenúltima noite.", duracao: "9h+" },
      { fase: "Nap estratégico", descricao: "Cochilo de 20 min (power nap) ou 90 min (ciclo completo). Evitar 30-60 min (acorda em sono profundo).", duracao: "20 ou 90 min" },
    ],
    beneficios: [
      "Recuperação proporcional à demanda do treino",
      "Redução de risco de overtraining e lesão",
      "Maximização de adaptações em janelas-chave",
      "Melhor performance em treinos de PR (Personal Record)",
    ],
    sinergias: [
      "Combina com periodização ondulatória (heavy days = sleep prioritário)",
      "Sinergia com block periodization (semanas de acúmulo demandam mais sono)",
      "Track com wearable (Whoop, Oura) para ajuste fino",
    ],
    quandoUsar:
      "Atletas intermediários e avançados que treinam 5-6x/semana com cargas pesadas, ou em fase de prep competitiva.",
  },
];
