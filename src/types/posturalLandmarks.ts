// APEX Visual — 33 landmarks profissionais
export type LandmarkBlock =
  | "cranial"
  | "scapular"
  | "spinal"
  | "pelvic"
  | "lower_limb"
  | "foot";

export type LandmarkSide = "left" | "right" | "center";

export type LandmarkSeverity = "normal" | "mild" | "moderate" | "severe";

export interface PosturalLandmark {
  id: string;
  label: string;
  x: number; // 0-100 % da largura da imagem
  y: number; // 0-100 % da altura da imagem
  block: LandmarkBlock;
  side: LandmarkSide;
  severity?: LandmarkSeverity;
}

// Catálogo padrão dos 33 landmarks (label + bloco + lado)
export interface LandmarkDef {
  id: string;
  label: string;
  block: LandmarkBlock;
  side: LandmarkSide;
}

export const LANDMARK_CATALOG: LandmarkDef[] = [
  // BLOCO 1 — Crânio/Cervical
  { id: "trago_r",   label: "Trago D",   block: "cranial", side: "right" },
  { id: "trago_l",   label: "Trago E",   block: "cranial", side: "left" },
  { id: "c7",        label: "C7",        block: "cranial", side: "center" },
  { id: "occipital", label: "Occipital", block: "cranial", side: "center" },

  // BLOCO 2 — Cintura Escapular
  { id: "acromio_r",          label: "Acrômio D",          block: "scapular", side: "right" },
  { id: "acromio_l",          label: "Acrômio E",          block: "scapular", side: "left" },
  { id: "angulo_escapula_r",  label: "Ângulo escápula D",  block: "scapular", side: "right" },
  { id: "angulo_escapula_l",  label: "Ângulo escápula E",  block: "scapular", side: "left" },
  { id: "esterno_manubrio",   label: "Manúbrio esternal",  block: "scapular", side: "center" },
  { id: "glenoumeral_r",      label: "Glenoumeral D",      block: "scapular", side: "right" },
  { id: "glenoumeral_l",      label: "Glenoumeral E",      block: "scapular", side: "left" },

  // BLOCO 3 — Coluna Torácica/Lombar
  { id: "t4",     label: "T4",     block: "spinal", side: "center" },
  { id: "t6",     label: "T6",     block: "spinal", side: "center" },
  { id: "t12",    label: "T12",    block: "spinal", side: "center" },
  { id: "l3",     label: "L3",     block: "spinal", side: "center" },
  { id: "l5_s1",  label: "L5–S1",  block: "spinal", side: "center" },

  // BLOCO 4 — Pelve
  { id: "eias_r", label: "EIAS D", block: "pelvic", side: "right" },
  { id: "eias_l", label: "EIAS E", block: "pelvic", side: "left" },
  { id: "eips_r", label: "EIPS D", block: "pelvic", side: "right" },
  { id: "eips_l", label: "EIPS E", block: "pelvic", side: "left" },

  // BLOCO 5 — Membros Inferiores
  { id: "trocantermaior_r", label: "Trocânter maior D", block: "lower_limb", side: "right" },
  { id: "trocantermaior_l", label: "Trocânter maior E", block: "lower_limb", side: "left" },
  { id: "joelho_r",         label: "Joelho D",          block: "lower_limb", side: "right" },
  { id: "joelho_l",         label: "Joelho E",          block: "lower_limb", side: "left" },
  { id: "cabeca_fibula_r",  label: "Cabeça fíbula D",   block: "lower_limb", side: "right" },
  { id: "cabeca_fibula_l",  label: "Cabeça fíbula E",   block: "lower_limb", side: "left" },
  { id: "maleolo_r",        label: "Maléolo D",         block: "lower_limb", side: "right" },
  { id: "maleolo_l",        label: "Maléolo E",         block: "lower_limb", side: "left" },

  // BLOCO 6 — Pé
  { id: "calcaneo_r",            label: "Calcâneo D",        block: "foot", side: "right" },
  { id: "calcaneo_l",            label: "Calcâneo E",        block: "foot", side: "left" },
  { id: "cabeca_1metatarso_r",   label: "Cab. 1º MTT D",     block: "foot", side: "right" },
  { id: "cabeca_1metatarso_l",   label: "Cab. 1º MTT E",     block: "foot", side: "left" },
  { id: "cabeca_5metatarso_r",   label: "Cab. 5º MTT D",     block: "foot", side: "right" },
  { id: "cabeca_5metatarso_l",   label: "Cab. 5º MTT E",     block: "foot", side: "left" },
];

export const LANDMARK_IDS = LANDMARK_CATALOG.map((l) => l.id);

export const BLOCK_META: Record<LandmarkBlock, { label: string; color: string }> = {
  cranial:    { label: "Crânio/Cervical",   color: "#4A90D9" },
  scapular:   { label: "Cintura Escapular", color: "#1D9E75" },
  spinal:     { label: "Coluna",            color: "#B8922A" },
  pelvic:     { label: "Pelve",             color: "#EF9F27" },
  lower_limb: { label: "Membros Inferiores", color: "#C56CE0" },
  foot:       { label: "Pé",                color: "#E24B4A" },
};

export const SEVERITY_COLOR: Record<LandmarkSeverity | "unknown", string> = {
  normal:   "#1D9E75",
  mild:     "#EF9F27",
  moderate: "#E24B4A",
  severe:   "#A32D2D",
  unknown:  "#4A90D9",
};

// Educational labels (clinical)
export const EDU_LABELS: Record<string, string> = {
  trago_r: "Trago da orelha D — referência cervical lateral",
  trago_l: "Trago da orelha E — referência cervical lateral",
  c7: "Processo espinhoso de C7 — base cervical",
  occipital: "Occipital — alinhamento cabeça/cervical",
  acromio_r: "Acrômio D — altura do ombro",
  acromio_l: "Acrômio E — altura do ombro",
  angulo_escapula_r: "Ângulo inferior da escápula D",
  angulo_escapula_l: "Ângulo inferior da escápula E",
  esterno_manubrio: "Manúbrio esternal — linha média anterior",
  glenoumeral_r: "Articulação glenoumeral D",
  glenoumeral_l: "Articulação glenoumeral E",
  t4: "T4 — ápice cifose torácica",
  t6: "T6 — meio torácico",
  t12: "T12 — transição toracolombar",
  l3: "L3 — ápice lordose lombar",
  l5_s1: "L5–S1 — base lombar",
  eias_r: "Espinha ilíaca ântero-superior D",
  eias_l: "Espinha ilíaca ântero-superior E",
  eips_r: "Espinha ilíaca póstero-superior D",
  eips_l: "Espinha ilíaca póstero-superior E",
  trocantermaior_r: "Trocânter maior D",
  trocantermaior_l: "Trocânter maior E",
  joelho_r: "Interlinha articular do joelho D",
  joelho_l: "Interlinha articular do joelho E",
  cabeca_fibula_r: "Cabeça da fíbula D",
  cabeca_fibula_l: "Cabeça da fíbula E",
  maleolo_r: "Maléolo lateral D",
  maleolo_l: "Maléolo lateral E",
  calcaneo_r: "Calcâneo D — retropé",
  calcaneo_l: "Calcâneo E — retropé",
  cabeca_1metatarso_r: "Cabeça 1º metatarso D",
  cabeca_1metatarso_l: "Cabeça 1º metatarso E",
  cabeca_5metatarso_r: "Cabeça 5º metatarso D",
  cabeca_5metatarso_l: "Cabeça 5º metatarso E",
};
