// ============================================================
// NEXUS-BIO SteroidVault — 300mg fracionada vs 500mg convencional
// Conteúdo estritamente educacional. Não é prescrição.
// ============================================================

export type FonteBadge = "ESTUDO" | "DADO" | "BRO SCIENCE" | "OFF-LABEL";

export interface PilarCientifico {
  id: string;
  titulo: string;
  texto: string;
}

export interface ProtocoloFracionamento {
  id: string;
  nome: string;
  destaque?: string;
  dose: string;
  como?: string;
  flutuacao: string;
  nivel: string;
  ia?: string;
  pros: string[];
  contras?: string[];
}

export interface LinhaComparativa {
  parametro: string;
  convencional: string;
  fracionada: string;
  favoravel: "fracionada" | "convencional" | "empate";
}

export interface NotaEmpirica {
  badge: FonteBadge;
  titulo: string;
  texto: string;
}

export const FRAC_CURVA_DOSE_RESPOSTA = {
  referencia: "Bhasin et al. — NEJM 1996 e JCEM 2001 (testosterona enantato, homens jovens)",
  pontos: [
    { dose: "125 mg/sem", ganho: "+1,4 kg massa magra", colaterais: "mínimos" },
    { dose: "300 mg/sem", ganho: "+5,2 kg massa magra", colaterais: "moderados" },
    { dose: "600 mg/sem", ganho: "+7,9 kg massa magra", colaterais: "significativos" },
  ],
  leitura: "300 mg captura ~65% do ganho de 600 mg com ~40% dos colaterais.",
};

export const FRAC_PILARES: PilarCientifico[] = [
  {
    id: "aromatizacao",
    titulo: "Aromatização exponencial por pico",
    texto:
      "A aromatase (CYP19A1) tem cinética de saturação. Quando o pico ultrapassa ~30-35 nmol/L, a aromatização sobe exponencialmente. 500 mg 2x/sem gera pico >2000 ng/dL, que aromatiza desproporcionalmente. 300 mg ED mantém ~1000-1100 ng/dL estáveis — abaixo do limiar de aromatização exponencial.",
  },
  {
    id: "receptor",
    titulo: "Receptor androgênico: tempo de exposição > pico",
    texto:
      "O AR tem sítios finitos por célula. Acima de certa concentração, o excesso vira substrato para aromatase (→ estradiol) ou 5α-redutase (→ DHT). O que importa é o tempo total acima do limiar de ativação, não o pico. 300 mg ED = AR ativado ~98% do tempo. 500 mg 2x/sem = ~60% do tempo.",
  },
  {
    id: "mps",
    titulo: "Síntese proteica tem teto",
    texto:
      "A MPS é estimulada até um platô em ~800-1200 ng/dL. 300 mg ED mantém esse range 24h. 500 mg 2x/sem oscila entre 600 e 2000+ — os picos acima de 1500 não adicionam MPS, apenas aromatização.",
  },
];

export const FRAC_PROTOCOLOS: ProtocoloFracionamento[] = [
  {
    id: "ed",
    nome: "Diária (ED)",
    destaque: "Gold standard",
    dose: "300 mg ÷ 7 = ~43 mg/dia",
    como: "Seringa de insulina 29G × 0,5\" — SC abdômen ou deltoide",
    flutuacao: "<5%",
    nivel: "~900-1100 ng/dL estável 24h/dia",
    ia: "Raro",
    pros: ["Zero flutuação", "Sem acne/retenção", "Injeção indolor"],
    contras: ["Exige disciplina diária"],
  },
  {
    id: "eod",
    nome: "Dia sim, dia não (EOD)",
    dose: "300 mg ÷ 3,5 = ~86 mg EOD",
    flutuacao: "~10-12%",
    nivel: "~850-1050 ng/dL",
    ia: "Raramente necessário",
    pros: ["Menos injeções", "Boa adesão"],
  },
  {
    id: "mwf",
    nome: "3x/semana (seg/qua/sex)",
    dose: "300 mg ÷ 3 = 100 mg por aplicação",
    flutuacao: "~15-18%",
    nivel: "~800-1100 ng/dL",
    pros: ["Calendário fixo", "Fácil de lembrar"],
  },
];

export const FRAC_VIA_SC_IM = {
  titulo: "Via SC vs IM",
  texto:
    "Estudos (Al-Futaisi 2006; Olsson 2014) mostram absorção da testosterona SC comparável à IM. A via SC com insulina 29-31G é indolor e sem risco de sangramento. A absorção SC é ligeiramente mais lenta, o que suaviza o pico ainda mais.",
};

export const FRAC_COMPARATIVO: LinhaComparativa[] = [
  { parametro: "Dose total/semana", convencional: "500 mg", fracionada: "300 mg (↓40%)", favoravel: "fracionada" },
  { parametro: "Flutuação", convencional: "25-30%", fracionada: "<5%", favoravel: "fracionada" },
  { parametro: "Pico máximo", convencional: "~2000+ ng/dL", fracionada: "~1100 ng/dL", favoravel: "fracionada" },
  { parametro: "Vale mínimo", convencional: "~600 ng/dL", fracionada: "~950 ng/dL", favoravel: "fracionada" },
  { parametro: "Tempo em range ótimo", convencional: "~60%", fracionada: "~98%", favoravel: "fracionada" },
  { parametro: "Aromatização", convencional: "alta (por pico)", fracionada: "baixa (estável)", favoravel: "fracionada" },
  { parametro: "Necessidade de IA", convencional: "frequente", fracionada: "rara", favoravel: "fracionada" },
  { parametro: "HDL", convencional: "↓40-50%", fracionada: "↓15-25%", favoravel: "fracionada" },
  { parametro: "LDL", convencional: "↑30-40%", fracionada: "↑10-20%", favoravel: "fracionada" },
  { parametro: "Acne", convencional: "moderada-alta", fracionada: "mínima", favoravel: "fracionada" },
  { parametro: "Retenção hídrica", convencional: "significativa", fracionada: "mínima", favoravel: "fracionada" },
  { parametro: "Humor", convencional: "montanha-russa", fracionada: "estável", favoravel: "fracionada" },
  { parametro: "Ganho bruto 16 sem", convencional: "~7-8 kg", fracionada: "~5-6 kg", favoravel: "convencional" },
  { parametro: "Ganho líquido (sem água)", convencional: "~5-6 kg", fracionada: "~5-6 kg", favoravel: "empate" },
  { parametro: "Custo mensal", convencional: "~R$150-200", fracionada: "~R$90-120", favoravel: "fracionada" },
];

export const FRAC_CONCLUSAO =
  "O ganho bruto de 500 mg parece maior, mas ~2 kg são retenção hídrica por excesso estrogênico. O ganho líquido de tecido é comparável. 300 mg ED preserva HDL, evita IA, mantém humor estável, visual mais seco e custo menor.";

export const FRAC_NOTAS: NotaEmpirica[] = [
  {
    badge: "BRO SCIENCE",
    titulo: "\"Menos é mais quando é todo dia\"",
    texto:
      "Atletas que migraram de 500 mg 2x/sem para 200-300 mg ED relatam mesma força, menos retenção, pele melhor, humor estável e libido mais consistente.",
  },
  {
    badge: "BRO SCIENCE",
    titulo: "\"SC com seringa de insulina mudou o jogo\"",
    texto:
      "Antes do protocolo SC, fracionar significava múltiplas IM dolorosas com 22-23G. A agulha 29-31G SC democratizou o fracionamento.",
  },
  {
    badge: "OFF-LABEL",
    titulo: "TRT otimizada",
    texto:
      "Médicos progressistas (Defy Medical, Marek Health) prescrevem testosterona SC EOD/ED, 100-150 mg/sem, com resultados superiores ao convencional de 200 mg IM a cada 14 dias.",
  },
  {
    badge: "OFF-LABEL",
    titulo: "Combinação com hCG",
    texto:
      "Testosterona 300 mg/sem ED + hCG 500 UI EOD mantém fertilidade e tamanho testicular. Com dose estável, a dose de hCG necessária é menor.",
  },
  {
    badge: "DADO",
    titulo: "O cálculo completo",
    texto:
      "500 mg × 16 sem = 8.000 mg totais + IA (~R$100/mês) + TPC agressiva. 300 mg × 16 sem = 4.800 mg totais (↓40%) + sem IA + TPC leve. No ciclo completo, 300 mg ED sai ~30% mais barato.",
  },
];

/** Texto pronto para copiar (roteiro educativo). */
export const fracionamentoRoteiro = (): string =>
  [
    "300mg FRACIONADA vs 500mg CONVENCIONAL",
    "",
    "A CIÊNCIA — curva dose-resposta logarítmica",
    ...FRAC_CURVA_DOSE_RESPOSTA.pontos.map((p) => `• ${p.dose} → ${p.ganho} | colaterais: ${p.colaterais}`),
    `• ${FRAC_CURVA_DOSE_RESPOSTA.leitura}`,
    `Fonte: ${FRAC_CURVA_DOSE_RESPOSTA.referencia}`,
    "",
    ...FRAC_PILARES.flatMap((p) => [`${p.titulo.toUpperCase()}`, p.texto, ""]),
    "PROTOCOLOS DE FRACIONAMENTO",
    ...FRAC_PROTOCOLOS.map(
      (p) =>
        `• ${p.nome}${p.destaque ? ` (${p.destaque})` : ""}: ${p.dose} | flutuação ${p.flutuacao} | ${p.nivel}`,
    ),
    "",
    FRAC_VIA_SC_IM.titulo.toUpperCase(),
    FRAC_VIA_SC_IM.texto,
    "",
    "COMPARAÇÃO DIRETA (500mg 2x/sem vs 300mg ED)",
    ...FRAC_COMPARATIVO.map((l) => `• ${l.parametro}: ${l.convencional} vs ${l.fracionada}`),
    "",
    `CONCLUSÃO: ${FRAC_CONCLUSAO}`,
    "",
    ...FRAC_NOTAS.map((n) => `[${n.badge}] ${n.titulo} — ${n.texto}`),
  ].join("\n");
