/**
 * Potencial de conteúdo por exercício na BiomechanicsVault.
 * Marca quais exercícios rendem mais React Coach, carrossel salvável
 * ou desmonte de mito — usado para priorizar o que o coach grava.
 */

export type PotencialTag = "REACT" | "SAVES" | "MITO";

export const POTENCIAL_LABEL: Record<PotencialTag, string> = {
  REACT: "🔥 REACT",
  SAVES: "💾 SAVES",
  MITO: "💀 MITO",
};

export const POTENCIAL_COR: Record<PotencialTag, string> = {
  REACT: "#EF9F27",
  SAVES: "#5DCAA5",
  MITO: "#AFA9EC",
};

/** Exercícios que quase todo mundo faz — alcance máximo, carrossel salvável. */
const ALTA_PRIORIDADE = [
  "agachamento livre", "supino reto", "puxada frontal", "remada curvada",
  "desenvolvimento", "rosca direta", "stiff", "rdl", "leg press",
  "elevacao lateral", "prancha",
];

/** Exercícios cercados de crenças populares — polêmica educativa. */
const ALTA_POLEMICA = [
  "agachamento", "puxada atras da nuca", "supino com smith", "smith",
  "leg press", "stiff", "cadeira extensora", "extensora", "abdominal",
  "pull-up", "pull up", "barra fixa",
];

/** Exercícios com erro visual óbvio — ótimos para React Coach. */
const ALTA_REACT = [
  "elevacao lateral", "rosca direta", "puxada frontal", "remada curvada",
  "supino reto", "desenvolvimento", "agachamento", "stiff",
];

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const bate = (nome: string, lista: string[]) => {
  const n = norm(nome);
  return lista.some((t) => n.includes(t));
};

/** Badges de potencial de conteúdo do exercício (pode voltar vazio). */
export function potencialDoExercicio(nome: string): PotencialTag[] {
  const tags: PotencialTag[] = [];
  if (bate(nome, ALTA_REACT)) tags.push("REACT");
  if (bate(nome, ALTA_PRIORIDADE)) tags.push("SAVES");
  if (bate(nome, ALTA_POLEMICA)) tags.push("MITO");
  return tags;
}

/** Score simples pra ordenar sugestões do treino do dia. */
export const scorePotencial = (nome: string) => potencialDoExercicio(nome).length;
