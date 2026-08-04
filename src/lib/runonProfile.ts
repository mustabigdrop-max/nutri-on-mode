/** Perfil do atleta híbrido (RunON) — persistido em localStorage. */

export const RUNON_PROFILE_KEY = "runon_athlete_profile";

export interface HybridProfile {
  // Step 1
  nome: string;
  peso: string;
  altura: string;
  gordura: number;
  objetivo: string;
  nivelMusculacao: string;
  // Step 2
  diasMusculacao: number;
  split: string;
  diasSemanaMusculacao: string[];
  duracaoTreino: string;
  prioridadeMuscular: string[];
  // Step 3
  nivelCorrida: string;
  atividadesAerobicas: string[];
  diasCardio: string[];
  distanciaMedia: string;
  paceMedio: string;
  fcMaxima: string;
  // Step 4
  temProva: boolean;
  distanciaAlvo: string;
  dataProva: string;
  nomeProva: string;
  objetivoGeral: string;
  diasDisponiveisCorrida: string[];
  horarioPreferido: string;
  // Step 5 — AEGIS
  usoErgogenicos: string;
  compostosAtuais: string[];
  peptideos: string[];
  suplementacao: string[];
  restricoes: string;
  historicoLesoes: string;
}

export const emptyProfile: HybridProfile = {
  nome: "",
  peso: "",
  altura: "",
  gordura: 15,
  objetivo: "",
  nivelMusculacao: "",
  diasMusculacao: 4,
  split: "",
  diasSemanaMusculacao: [],
  duracaoTreino: "",
  prioridadeMuscular: [],
  nivelCorrida: "",
  atividadesAerobicas: [],
  diasCardio: [],
  distanciaMedia: "",
  paceMedio: "",
  fcMaxima: "",
  temProva: false,
  distanciaAlvo: "",
  dataProva: "",
  nomeProva: "",
  objetivoGeral: "",
  diasDisponiveisCorrida: [],
  horarioPreferido: "",
  usoErgogenicos: "",
  compostosAtuais: [],
  peptideos: [],
  suplementacao: [],
  restricoes: "",
  historicoLesoes: "",
};

export function loadProfile(): HybridProfile | null {
  try {
    const raw = localStorage.getItem(RUNON_PROFILE_KEY);
    if (!raw) return null;
    return { ...emptyProfile, ...JSON.parse(raw) } as HybridProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: HybridProfile) {
  try {
    localStorage.setItem(RUNON_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* storage indisponível */
  }
}

/** Nível de acesso a protocolos AEGIS derivado do perfil ergogênico. */
export function aegisTierFromProfile(profile: HybridProfile | null): "natural" | "trt" | "cycle" {
  switch (profile?.usoErgogenicos) {
    case "TRT / Reposição hormonal":
      return "trt";
    case "Ciclo completo":
    case "Blast & Cruise":
      return "cycle";
    default:
      return "natural";
  }
}

export const WEEKDAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
