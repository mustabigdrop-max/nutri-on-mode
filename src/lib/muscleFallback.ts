// Fallback de músculos ativados por exercício + tradução para linguagem leiga.
// Usado quando o guia gerado não traz mapa muscular, para nunca exibir mapa vazio.

import type { GuideMusculo } from "@/lib/exerciseGuide";

export const NOMES_LEIGOS: Record<string, string> = {
  quadriceps: "Quadríceps (frente da coxa)",
  quadriceps_femoral: "Quadríceps (frente da coxa)",
  hamstrings: "Posteriores (trás da coxa)",
  isquiotibiais: "Posteriores (trás da coxa)",
  posteriores: "Posteriores (trás da coxa)",
  glutes: "Glúteo máximo (bumbum)",
  gluteo: "Glúteo máximo (bumbum)",
  "gluteo maximo": "Glúteo máximo (bumbum)",
  gluteos: "Glúteo máximo (bumbum)",
  "gluteus medius": "Glúteo médio (lateral do quadril)",
  "gluteo medio": "Glúteo médio (lateral do quadril)",
  calves: "Panturrilha (batata da perna)",
  panturrilha: "Panturrilha (batata da perna)",
  panturrilhas: "Panturrilha (batata da perna)",
  lats: "Dorsais (costas)",
  dorsais: "Dorsais (costas)",
  "latissimo do dorso": "Dorsais (costas)",
  traps: "Trapézio (parte alta das costas)",
  trapezio: "Trapézio (parte alta das costas)",
  "trapezio medio": "Trapézio médio (parte média das costas)",
  rhomboids: "Romboides (entre as escápulas)",
  romboides: "Romboides (entre as escápulas)",
  pectorals: "Peitoral (peito)",
  peitoral: "Peitoral (peito)",
  peito: "Peitoral (peito)",
  deltoids: "Deltoides (ombros)",
  deltoides: "Deltoides (ombros)",
  ombros: "Deltoides (ombros)",
  "anterior deltoid": "Ombro (frente)",
  "deltoide anterior": "Ombro (frente)",
  "posterior deltoid": "Ombro (trás)",
  "deltoide posterior": "Ombro (trás)",
  "deltoides posteriores": "Ombro (trás)",
  "lateral deltoid": "Ombro (lateral)",
  "deltoide lateral": "Ombro (lateral)",
  biceps: "Bíceps (frente do braço)",
  triceps: "Tríceps (trás do braço)",
  forearms: "Antebraço",
  antebraco: "Antebraço",
  abs: "Abdômen (barriga)",
  abdomen: "Abdômen (barriga)",
  "reto abdominal": "Abdômen (barriga)",
  transverso: "Transverso (abdômen profundo)",
  obliques: "Oblíquos (lateral da barriga)",
  obliquos: "Oblíquos (lateral da barriga)",
  "lower back": "Lombar",
  lombar: "Lombar",
  "erector spinae": "Eretores (coluna lombar)",
  eretores: "Eretores (coluna lombar)",
  "eretores da espinha": "Eretores (coluna lombar)",
  "hip flexors": "Flexores do quadril (frente do quadril)",
  "flexores do quadril": "Flexores do quadril (frente do quadril)",
  adductors: "Adutores (parte interna da coxa)",
  adutores: "Adutores (parte interna da coxa)",
  abductors: "Abdutores (lateral da coxa)",
  abdutores: "Abdutores (lateral da coxa)",
  "rotator cuff": "Manguito rotador (ombro profundo)",
  "manguito rotador": "Manguito rotador (ombro profundo)",
  infraespinhal: "Infraespinhal (manguito rotador)",
  "redondo menor": "Redondo menor (manguito rotador)",
  core: "Core (músculos do tronco)",
  "serratus anterior": "Serrátil (lateral do peito)",
  serratil: "Serrátil (lateral do peito)",
  "tibialis anterior": "Tibial (canela)",
  "tibial anterior": "Tibial (canela)",
  soleus: "Sóleo (panturrilha profunda)",
  soleo: "Sóleo (panturrilha profunda)",
};

function norm(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Converte nome técnico em nome acessível, quando houver correspondência. */
export function nomeLeigo(nome: string): string {
  const k = norm(nome);
  if (NOMES_LEIGOS[k]) return NOMES_LEIGOS[k];
  const hit = Object.keys(NOMES_LEIGOS).find((n) => k === n || k.includes(n));
  return hit ? NOMES_LEIGOS[hit] : nome;
}

type Musc = { nome: string; ativacao: number };
type Fallback = { principal: Musc[]; secundario: Musc[] };

/** Regras por palavra-chave no nome do exercício (do mais específico para o mais genérico). */
const REGRAS: Array<{ match: RegExp; data: Fallback }> = [
  {
    match: /mobilidade de quadril|circulo de quadril|rotacao de quadril/,
    data: {
      principal: [
        { nome: "Flexores do quadril (frente do quadril)", ativacao: 60 },
        { nome: "Glúteo máximo (bumbum)", ativacao: 50 },
      ],
      secundario: [
        { nome: "Adutores (parte interna da coxa)", ativacao: 40 },
        { nome: "Core (músculos do tronco)", ativacao: 30 },
      ],
    },
  },
  {
    match: /alongamento dinamico de tronco|rotacao de tronco|mobilidade toracica/,
    data: {
      principal: [
        { nome: "Oblíquos (lateral da barriga)", ativacao: 60 },
        { nome: "Eretores (coluna lombar)", ativacao: 50 },
      ],
      secundario: [{ nome: "Core (músculos do tronco)", ativacao: 40 }],
    },
  },
  {
    match: /remada/,
    data: {
      principal: [
        { nome: "Romboides (entre as escápulas)", ativacao: 65 },
        { nome: "Dorsais (costas)", ativacao: 60 },
      ],
      secundario: [
        { nome: "Bíceps (frente do braço)", ativacao: 35 },
        { nome: "Ombro (trás)", ativacao: 30 },
      ],
    },
  },
  {
    match: /rotacao externa de ombro|manguito|face pull/,
    data: {
      principal: [
        { nome: "Infraespinhal (manguito rotador)", ativacao: 70 },
        { nome: "Redondo menor (manguito rotador)", ativacao: 60 },
      ],
      secundario: [{ nome: "Ombro (trás)", ativacao: 30 }],
    },
  },
  {
    match: /ativacao de gluteo|ponte de gluteo|elevacao pelvica|hip thrust|coice|abducao/,
    data: {
      principal: [
        { nome: "Glúteo máximo (bumbum)", ativacao: 85 },
        { nome: "Glúteo médio (lateral do quadril)", ativacao: 60 },
      ],
      secundario: [
        { nome: "Posteriores (trás da coxa)", ativacao: 35 },
        { nome: "Core (músculos do tronco)", ativacao: 30 },
      ],
    },
  },
  {
    match: /prancha|abdominal|core|abdomen/,
    data: {
      principal: [
        { nome: "Abdômen (barriga)", ativacao: 80 },
        { nome: "Transverso (abdômen profundo)", ativacao: 75 },
      ],
      secundario: [
        { nome: "Oblíquos (lateral da barriga)", ativacao: 50 },
        { nome: "Eretores (coluna lombar)", ativacao: 40 },
      ],
    },
  },
  {
    match: /agachamento|leg press|avanco|afundo|passada|bulgaro/,
    data: {
      principal: [
        { nome: "Quadríceps (frente da coxa)", ativacao: 85 },
        { nome: "Glúteo máximo (bumbum)", ativacao: 70 },
      ],
      secundario: [
        { nome: "Posteriores (trás da coxa)", ativacao: 40 },
        { nome: "Core (músculos do tronco)", ativacao: 35 },
      ],
    },
  },
  {
    match: /stiff|levantamento terra|terra romeno|mesa flexora|flexora/,
    data: {
      principal: [
        { nome: "Posteriores (trás da coxa)", ativacao: 85 },
        { nome: "Glúteo máximo (bumbum)", ativacao: 70 },
      ],
      secundario: [
        { nome: "Eretores (coluna lombar)", ativacao: 50 },
        { nome: "Core (músculos do tronco)", ativacao: 30 },
      ],
    },
  },
  {
    match: /supino|crucifixo|flexao de bra|peck deck|crossover/,
    data: {
      principal: [{ nome: "Peitoral (peito)", ativacao: 85 }],
      secundario: [
        { nome: "Tríceps (trás do braço)", ativacao: 45 },
        { nome: "Ombro (frente)", ativacao: 40 },
      ],
    },
  },
  {
    match: /puxada|barra fixa|pulldown|pull up/,
    data: {
      principal: [{ nome: "Dorsais (costas)", ativacao: 85 }],
      secundario: [
        { nome: "Bíceps (frente do braço)", ativacao: 45 },
        { nome: "Romboides (entre as escápulas)", ativacao: 40 },
      ],
    },
  },
  {
    match: /desenvolvimento|elevacao lateral|elevacao frontal|ombro/,
    data: {
      principal: [{ nome: "Deltoides (ombros)", ativacao: 80 }],
      secundario: [
        { nome: "Trapézio (parte alta das costas)", ativacao: 40 },
        { nome: "Tríceps (trás do braço)", ativacao: 30 },
      ],
    },
  },
  {
    match: /rosca|biceps/,
    data: {
      principal: [{ nome: "Bíceps (frente do braço)", ativacao: 85 }],
      secundario: [{ nome: "Antebraço", ativacao: 40 }],
    },
  },
  {
    match: /triceps|frances|mergulho|paralela/,
    data: {
      principal: [{ nome: "Tríceps (trás do braço)", ativacao: 85 }],
      secundario: [{ nome: "Ombro (frente)", ativacao: 30 }],
    },
  },
  {
    match: /panturrilha|gemeos|elevacao de calcanhar/,
    data: {
      principal: [{ nome: "Panturrilha (batata da perna)", ativacao: 90 }],
      secundario: [{ nome: "Sóleo (panturrilha profunda)", ativacao: 55 }],
    },
  },
  {
    match: /cadeira extensora|extensora/,
    data: {
      principal: [{ nome: "Quadríceps (frente da coxa)", ativacao: 90 }],
      secundario: [{ nome: "Core (músculos do tronco)", ativacao: 20 }],
    },
  },
  {
    match: /adutor/,
    data: {
      principal: [{ nome: "Adutores (parte interna da coxa)", ativacao: 85 }],
      secundario: [{ nome: "Core (músculos do tronco)", ativacao: 25 }],
    },
  },
  {
    match: /corrida|esteira|bike|bicicleta|eliptico|polichinelo|aquecimento|cardio|caminhada/,
    data: {
      principal: [
        { nome: "Quadríceps (frente da coxa)", ativacao: 55 },
        { nome: "Panturrilha (batata da perna)", ativacao: 50 },
      ],
      secundario: [
        { nome: "Glúteo máximo (bumbum)", ativacao: 40 },
        { nome: "Core (músculos do tronco)", ativacao: 30 },
      ],
    },
  },
  {
    match: /alongamento|mobilidade|ativacao/,
    data: {
      principal: [{ nome: "Core (músculos do tronco)", ativacao: 50 }],
      secundario: [
        { nome: "Glúteo máximo (bumbum)", ativacao: 35 },
        { nome: "Eretores (coluna lombar)", ativacao: 30 },
      ],
    },
  },
];

/** Retorna músculos estimados pelo nome do exercício, ou null quando não há regra. */
export function fallbackMusculos(nomeExercicio: string): GuideMusculo[] | null {
  const n = norm(nomeExercicio);
  const regra = REGRAS.find((r) => r.match.test(n));
  if (!regra) return null;
  return [
    ...regra.data.principal.map((m) => ({ ...m, tipo: "principal" as const })),
    ...regra.data.secundario.map((m) => ({ ...m, tipo: "secundario" as const })),
  ];
}

/** Nunca renderizar mapa vazio: só exibe quando há ao menos um músculo principal. */
export function deveMostrarMapa(musculos?: GuideMusculo[] | null): boolean {
  return !!musculos?.some((m) => m.tipo === "principal");
}
