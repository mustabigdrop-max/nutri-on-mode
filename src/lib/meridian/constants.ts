// MERIDIAN — Constantes visuais e copy SITREP.
import type { AthleteTrack, MeridianPhase } from "./types";

export const TRACK_META: Record<
  AthleteTrack,
  { label: string; color: string; bg: string; description: string; available: boolean }
> = {
  ENHANCED: {
    label: "Enhanced",
    color: "#B8922A",
    bg: "rgba(184,146,42,0.08)",
    description:
      "Federações sem teste antidoping (IFBB Pro, NPC, IFBB Elite Pro). Taxas de perda mais agressivas. Calibração assume assistência farmacológica.",
    available: true,
  },
  NATURAL: {
    label: "Natural",
    color: "#4B5320",
    bg: "rgba(75,83,32,0.08)",
    description:
      "Federações drug-free (WNBF, INBA, ANB, DFAC). Taxas conservadoras, recovery longo, drug test calendar obrigatório.",
    available: true,
  },
  LIFESTYLE: {
    label: "Lifestyle",
    color: "#1B4965",
    bg: "rgba(27,73,101,0.08)",
    description:
      "Não-competidor. Stage-ready em janelas planejadas. Foco em sustentabilidade e adesão de longo prazo.",
    available: false,
  },
};

export const PHASE_COLORS: Record<MeridianPhase, string> = {
  OFF_SEASON: "#3a3a3a",
  PRE_PREP: "#5a5a3a",
  DIET_PRINCIPAL: "#8a6a2a",
  HARD_CUT: "#B8922A",
  FINAL_SHARPENING: "#d4a72c",
  PEAK_WEEK: "#f0c040",
  POST_STAGE_RECOVERY: "#2a4a5a",
};

export const SITREP_COPY = {
  pre_competition: "SITREP // OPERAÇÃO EM CURSO",
  pre_prep: "SITREP // FASE: PRE-PREP",
  diet: "SITREP // FASE: DIET PRINCIPAL",
  hard_cut: "SITREP // FASE: HARD CUT",
  final: "SITREP // FASE: FINAL SHARPENING",
  peak: "SITREP // PEAK WEEK ATIVA",
  recovery: "SITREP // RECOVERY PÓS-PALCO",
  viability_green: "STATUS: VERDE — janela viável.",
  viability_yellow: "STATUS: AMARELO — buffer comprometido.",
  viability_red: "STATUS: VERMELHO — janela insuficiente.",
};
