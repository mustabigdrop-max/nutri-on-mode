// NEXUS-BIO PeptideVault — Diluições com Referências Científicas
// nutriON 360 | Diogo Mello | "Ciência e prática — cada número tem uma referência"

export interface PeptideReconstitution {
  vialMg: number;          // mg do frasco
  bacWaterMl: number;      // mL de água bacteriostática recomendada
  bacWaterCurrentMl?: number; // mL atual (se houver correção sugerida)
  doseMcg: string;         // faixa de dose terapêutica (mcg)
  unitsPer100u: string;    // unidades resultantes em seringa 100U
  concentration: string;   // concentração final (mcg/mL)
  note?: string;           // nota clínica/prática
  warning?: string;        // aviso de segurança
  references: { citation: string; source?: string }[];
  oral?: boolean;          // peptídeo oral — sem reconstituição
  topical?: boolean;       // peptídeo tópico — sem injeção
  ready?: boolean;         // produto pronto, sem reconstituição
}

export const peptideReconstitution: Record<string, PeptideReconstitution> = {
  // ── EIXO GH ──
  "cjc-1295": {
    vialMg: 2, bacWaterMl: 2,
    doseMcg: "100-300 mcg",
    unitsPer100u: "10-30 U",
    concentration: "1.000 mcg/mL",
    note: "Padrão de compounding pharmacies USA (Empower, Tailor Made) — 2mL/frasco 2mg.",
    references: [
      { citation: "Walker RF. Sermorelin: a better approach to management of adult-onset growth hormone insufficiency? Clinical Interventions in Aging, 2006." },
      { citation: "Prakash A, Goa KL. Sermorelin: a review of its use in the diagnosis and treatment of children with idiopathic GH deficiency. BioDrugs, 1999." },
    ],
  },
  "cjc-1295-dac": {
    vialMg: 2, bacWaterMl: 2,
    doseMcg: "1.000-2.000 mcg/semana",
    unitsPer100u: "100-200 U/semana",
    concentration: "1.000 mcg/mL",
    note: "Dose semanal — 2mL adequado.",
    references: [
      { citation: "Teichman SL et al. Prolonged stimulation of GH and IGF-I secretion by CJC-1295. J Clin Endocrinol Metab, 2006." },
    ],
  },
  ipamorelin: {
    vialMg: 2, bacWaterMl: 2,
    doseMcg: "200-300 mcg",
    unitsPer100u: "20-30 U",
    concentration: "1.000 mcg/mL",
    note: "Protocolo padrão de clínicas de longevidade nos EUA (Defy Medical, Maximus).",
    references: [
      { citation: "Raun K et al. Ipamorelin, the first selective growth hormone secretagogue. Eur J Endocrinol, 1998." },
      { citation: "Svensson J et al. MK-677 increases GH secretion, fat-free mass and energy expenditure. JCEM, 1998." },
    ],
  },
  "ghrp-2": {
    vialMg: 5, bacWaterMl: 5, bacWaterCurrentMl: 2,
    doseMcg: "100-300 mcg",
    unitsPer100u: "20-60 U (com 5mL)",
    concentration: "1.000 mcg/mL",
    warning: "Atualização recomendada: 5mL — 2mL resulta em doses pequenas (~4U) com pouca precisão.",
    references: [
      { citation: "Bowers CY et al. Structure-activity relationships of a synthetic pentapeptide that releases GH in vitro. Endocrinology, 1984." },
    ],
  },
  "ghrp-6": {
    vialMg: 5, bacWaterMl: 5, bacWaterCurrentMl: 2,
    doseMcg: "100-300 mcg",
    unitsPer100u: "20-60 U (com 5mL)",
    concentration: "1.000 mcg/mL",
    warning: "Atualização recomendada: 5mL pelo mesmo raciocínio do GHRP-2.",
    references: [
      { citation: "Bowers CY. GH releasing peptides. J Pediatr Endocrinol, 1993." },
    ],
  },
  hexarelin: {
    vialMg: 2, bacWaterMl: 2,
    doseMcg: "50-200 mcg",
    unitsPer100u: "5-20 U",
    concentration: "1.000 mcg/mL",
    references: [
      { citation: "Ghigo E et al. Hexarelin, a new GH-releasing peptide, is a powerful stimulator of GH secretion. JCEM, 1994." },
    ],
  },
  tesamorelin: {
    vialMg: 2, bacWaterMl: 1, bacWaterCurrentMl: 2,
    doseMcg: "1.000-2.000 mcg (frasco/dose)",
    unitsPer100u: "50-100 U",
    concentration: "2.000 mcg/mL",
    warning: "Dose ≈ frasco inteiro por aplicação — reconstituir em 1mL é mais prático.",
    references: [
      { citation: "FDA approval Egrifta — bula oficial Theratechnologies, 2010." },
      { citation: "Falutz J et al. Tesamorelin in HIV-infected patients with excess abdominal fat. NEJM, 2010." },
    ],
  },
  sermorelin: {
    vialMg: 15, bacWaterMl: 5, bacWaterCurrentMl: 3,
    doseMcg: "200-500 mcg",
    unitsPer100u: "7-17 U (com 5mL)",
    concentration: "3.000 mcg/mL",
    warning: "3mL gera concentração muito alta (5.000 mcg/mL = 4-10U). Recomendado 5mL para precisão.",
    references: [
      { citation: "Walker RF, 2006 (Clinical Interventions in Aging)." },
    ],
  },
  "mk-677": {
    vialMg: 0, bacWaterMl: 0,
    doseMcg: "10-25 mg/dia VO",
    unitsPer100u: "—",
    concentration: "ORAL — sem reconstituição",
    oral: true,
    references: [
      { citation: "Copinschi G et al. Prolonged oral treatment with MK-677 improves sleep quality. Neuroendocrinology, 1997." },
    ],
  },

  // ── EIXO IGF ──
  "igf-1-lr3": {
    vialMg: 1, bacWaterMl: 2, bacWaterCurrentMl: 1,
    doseMcg: "20-100 mcg",
    unitsPer100u: "4-20 U (com 2mL)",
    concentration: "500 mcg/mL",
    warning: "Usar álcool bacteriostático — IGF-1 LR3 é sensível a água pura. 1mL gera doses muito pequenas.",
    references: [
      { citation: "Baxter RC. IGF-binding proteins: interactions with IGFs and intrinsic bioactivities. Am J Physiol, 2000." },
    ],
  },
  "igf-1-des": {
    vialMg: 1, bacWaterMl: 1,
    doseMcg: "50-150 mcg",
    unitsPer100u: "5-15 U",
    concentration: "1.000 mcg/mL",
    references: [
      { citation: "Ballard FJ et al. Des(1-3)IGF-I: a truncated form of IGF-I. Int J Biochem Cell Biol, 1997." },
    ],
  },
  mgf: {
    vialMg: 2, bacWaterMl: 2,
    doseMcg: "200-400 mcg",
    unitsPer100u: "20-40 U",
    concentration: "1.000 mcg/mL",
    references: [
      { citation: "Yang SY, Goldspink G. IGF-I Ec peptide (MGF) and mature IGF-I in myoblast proliferation. FEBS Lett, 2002." },
    ],
  },
  "peg-mgf": {
    vialMg: 2, bacWaterMl: 2,
    doseMcg: "200-400 mcg",
    unitsPer100u: "20-40 U",
    concentration: "1.000 mcg/mL",
    note: "Sem referência clínica humana — extrapolado de MGF.",
    references: [
      { citation: "Yang SY, Goldspink G. FEBS Lett, 2002 (referência de MGF)." },
    ],
  },
  "follistatin-344": {
    vialMg: 1, bacWaterMl: 1,
    doseMcg: "50-200 mcg",
    unitsPer100u: "5-20 U",
    concentration: "1.000 mcg/mL",
    warning: "Ciclos máximos de 10 dias — risco de crescimento desequilibrado.",
    references: [
      { citation: "Rodino-Klapac LR et al. Inhibition of myostatin with follistatin as therapy for muscle disease. Muscle Nerve, 2009." },
    ],
  },

  // ── REPARO ──
  "bpc-157": {
    vialMg: 5, bacWaterMl: 2,
    doseMcg: "200-500 mcg",
    unitsPer100u: "8-20 U",
    concentration: "2.500 mcg/mL",
    note: "Protocolo padrão PepCalc.com e Peptide Sciences dosing guides.",
    references: [
      { citation: "Sikiric P et al. Stable gastric pentadecapeptide BPC 157: novel therapy in GI tract. Curr Pharm Des, 2011." },
      { citation: "Chang CH et al. Promoting effect of BPC 157 on tendon healing. Acta Pharmacol Sin, 2011." },
    ],
  },
  "tb-500": {
    vialMg: 5, bacWaterMl: 2,
    doseMcg: "2.000-5.000 mcg",
    unitsPer100u: "80-200 U",
    concentration: "2.500 mcg/mL",
    warning: "Dose alta — praticamente o frasco inteiro por aplicação. Aceitável: 1-2 frascos/semana.",
    references: [
      { citation: "Goldstein AL et al. Thymosin beta4: actin-sequestering protein moonlights to repair tissues. Trends Mol Med, 2012." },
    ],
  },
  kpv: {
    vialMg: 5, bacWaterMl: 5, bacWaterCurrentMl: 2,
    doseMcg: "500-1.500 mcg (oral)",
    unitsPer100u: "—",
    concentration: "1.000 mcg/mL",
    warning: "Atualização recomendada: 5mL para uso oral — 2mL fica muito concentrado.",
    references: [
      { citation: "Catania A et al. The melanocortin system in control of inflammation. Scientific World Journal, 2010." },
    ],
  },
  "aod-9604": {
    vialMg: 5, bacWaterMl: 2,
    doseMcg: "300-600 mcg",
    unitsPer100u: "12-24 U",
    concentration: "2.500 mcg/mL",
    note: "FDA IND nº 71.031 (Investigational New Drug).",
    references: [
      { citation: "Heffernan M et al. Effects of human GH and AOD9604 on lipid metabolism. Endocrinology, 2001." },
    ],
  },
  "ghk-cu": {
    vialMg: 50, bacWaterMl: 10, bacWaterCurrentMl: 5,
    doseMcg: "1.000-3.000 mcg (SC)",
    unitsPer100u: "20-60 U (com 10mL)",
    concentration: "5.000 mcg/mL",
    warning: "5mL ainda gera concentração alta — 10mL ideal para SC. Tópico usa % em creme.",
    references: [
      { citation: "Pickart L, Margolina A. Regenerative and Protective Actions of GHK-Cu Peptide. Int J Mol Sci, 2018." },
    ],
  },
  "ll-37": {
    vialMg: 5, bacWaterMl: 2,
    doseMcg: "100-500 mcg",
    unitsPer100u: "4-20 U",
    concentration: "2.500 mcg/mL",
    references: [
      { citation: "Vandamme D et al. A comprehensive summary of LL-37, the factotum human cathelicidin. Cell Immunol, 2012." },
    ],
  },

  // ── METABÓLICO / GLP-1 ──
  semaglutide: {
    vialMg: 2, bacWaterMl: 1,
    doseMcg: "250-2.400 mcg/semana",
    unitsPer100u: "12-120 U",
    concentration: "2.000 mcg/mL",
    warning: "Escalonamento obrigatório — doses iniciais pequenas exigem seringa precisa.",
    references: [
      { citation: "FDA NDA 209637 — Ozempic, bula oficial Novo Nordisk." },
      { citation: "Wilding JPH et al. Once-Weekly Semaglutide in Adults with Overweight or Obesity. NEJM, 2021 (STEP-1)." },
    ],
  },
  tirzepatide: {
    vialMg: 5, bacWaterMl: 2, bacWaterCurrentMl: 1,
    doseMcg: "2.500-15.000 mcg/semana",
    unitsPer100u: "100-600 U (com 2mL)",
    concentration: "2.500 mcg/mL",
    warning: "Para doses iniciais baixas (2,5mg), usar 2mL aumenta a precisão.",
    references: [
      { citation: "FDA NDA 215866 — Mounjaro, bula oficial Eli Lilly." },
      { citation: "Jastreboff AM et al. Tirzepatide Once Weekly for the Treatment of Obesity. NEJM, 2022 (SURMOUNT-1)." },
    ],
  },
  retatrutide: {
    vialMg: 5, bacWaterMl: 1,
    doseMcg: "Escalonado (fase 3)",
    unitsPer100u: "—",
    concentration: "5.000 mcg/mL",
    warning: "Composto em fase 3 — sem bula oficial. Diluição extrapolada de tirzepatide.",
    references: [
      { citation: "Jastreboff AM et al. Triple-Hormone-Receptor Agonist Retatrutide for Obesity. NEJM, 2023." },
    ],
  },

  // ── NEURO / COGNITIVO ──
  selank: {
    vialMg: 5, bacWaterMl: 5,
    doseMcg: "250-600 mcg (intranasal)",
    unitsPer100u: "—",
    concentration: "1.000 mcg/mL (0,15% nasal)",
    note: "Formulação nasal padrão russa = 0,15 mg/mL.",
    references: [
      { citation: "Semenova TP et al. Selank and Semax affect expression of immune and opioid system genes. Biomed Khim, 2010." },
    ],
  },
  semax: {
    vialMg: 5, bacWaterMl: 5,
    doseMcg: "250-1.000 mcg (intranasal)",
    unitsPer100u: "—",
    concentration: "1.000 mcg/mL (0,1% nasal)",
    note: "Formulações russas aprovadas: 0,1% e 1%. Para 1%, usar 0,5mL/5mg.",
    references: [
      { citation: "Grigorenko EL et al. Cognitive enhancers as adjuncts to psychotherapy. Psychopharmacol Bull, 2002." },
    ],
  },
  cerebrolysin: {
    vialMg: 0, bacWaterMl: 0,
    doseMcg: "5-30 mL IV/IM",
    unitsPer100u: "—",
    concentration: "Pronto para uso",
    ready: true,
    note: "Frasco já em solução (5mL/10mL) — IV ou IM direto.",
    references: [
      { citation: "Álvarez XA et al. Cerebrolysin reduces brain amyloid burden. J Neural Transm, 2011." },
    ],
  },
  dsip: {
    vialMg: 5, bacWaterMl: 2,
    doseMcg: "100-500 mcg",
    unitsPer100u: "4-20 U",
    concentration: "2.500 mcg/mL",
    references: [
      { citation: "Monnier M, Schoenenberger GA. Characterization of a delta-EEG-inducing peptide. Arch Ital Biol, 1977." },
    ],
  },

  // ── LONGEVIDADE / MITOCONDRIAL ──
  epithalon: {
    vialMg: 10, bacWaterMl: 2,
    doseMcg: "5.000-10.000 mcg",
    unitsPer100u: "100-200 U",
    concentration: "5.000 mcg/mL",
    note: "Dose ≈ frasco inteiro — 2mL é prático para seringa 1mL cheia.",
    references: [
      { citation: "Khavinson VKh et al. Epithalon peptide induces telomerase activity and telomere elongation. Bull Exp Biol Med, 2003." },
      { citation: "Anisimov VN et al. Effect of Epitalon on lifespan increase in Drosophila. Mech Ageing Dev, 2004." },
    ],
  },
  "mots-c": {
    vialMg: 5, bacWaterMl: 1, bacWaterCurrentMl: 2,
    doseMcg: "5.000-10.000 mcg",
    unitsPer100u: "100-200 U",
    concentration: "5.000 mcg/mL",
    warning: "Dose = 1-2 frascos. 1mL concentra mais e facilita aplicação.",
    references: [
      { citation: "Lee C et al. The mitochondrial-derived peptide MOTS-c promotes metabolic homeostasis. Cell Metab, 2015 (Kim lab, USC)." },
    ],
  },
  humanin: {
    vialMg: 5, bacWaterMl: 2,
    doseMcg: "1.000-5.000 mcg",
    unitsPer100u: "8-40 U",
    concentration: "2.500 mcg/mL",
    references: [
      { citation: "Hashimoto Y et al. Rescue factor abolishing neuronal cell death by familial Alzheimer's genes and Aβ. PNAS, 2001." },
    ],
  },
  "ss-31": {
    vialMg: 5, bacWaterMl: 2,
    doseMcg: "1.000-5.000 mcg",
    unitsPer100u: "8-40 U",
    concentration: "2.500 mcg/mL",
    note: "Elamipretide — em estudos fase 2 da Stealth BioTherapeutics para insuficiência cardíaca.",
    references: [
      { citation: "Szeto HH. First-in-class cardiolipin-protective compound to restore mitochondrial bioenergetics. Br J Pharmacol, 2014." },
    ],
  },
  "foxo4-dri": {
    vialMg: 5, bacWaterMl: 2,
    doseMcg: "5.000-15.000 mcg",
    unitsPer100u: "40-120 U",
    concentration: "2.500 mcg/mL",
    warning: "Estudo em camundongos — sem dados clínicos humanos publicados.",
    references: [
      { citation: "Baar MP et al. Targeted Apoptosis of Senescent Cells Restores Tissue Homeostasis. Cell, 2017 (van Deursen lab, Mayo Clinic)." },
    ],
  },

  // ── SEXUAL / MELANOCORTINA ──
  "pt-141": {
    vialMg: 10, bacWaterMl: 2,
    doseMcg: "500-2.000 mcg",
    unitsPer100u: "10-40 U",
    concentration: "5.000 mcg/mL",
    references: [
      { citation: "Diamond LE et al. Safety and PK/PD of intranasal PT-141. J Sex Med, 2004." },
      { citation: "FDA NDA 210557 — Vyleesi (bremelanotide), bula Palatin Technologies." },
    ],
  },
  "melanotan-ii": {
    vialMg: 10, bacWaterMl: 2,
    doseMcg: "250-1.000 mcg",
    unitsPer100u: "5-20 U",
    concentration: "5.000 mcg/mL",
    warning: "Sem aprovação regulatória — uso off-label.",
    references: [
      { citation: "Dorr RT et al. Evaluation of melanotan-II in pilot phase-I clinical study. Life Sci, 1996." },
    ],
  },
  gonadorelin: {
    vialMg: 2, bacWaterMl: 2,
    doseMcg: "100-250 mcg",
    unitsPer100u: "10-25 U",
    concentration: "1.000 mcg/mL",
    references: [
      { citation: "FDA NDA 017168 — Factrel (gonadorelin), bula Pfizer." },
    ],
  },
  triptorelin: {
    vialMg: 3.75, bacWaterMl: 2,
    doseMcg: "3.750 mcg (frasco/depot)",
    unitsPer100u: "100 U",
    concentration: "1.875 mcg/mL",
    references: [
      { citation: "FDA NDA 020715 — Trelstar, bula Watson Pharma." },
    ],
  },

  // ── IMUNE / TERAPÊUTICO ──
  "thymosin-alpha-1": {
    vialMg: 1.6, bacWaterMl: 1,
    doseMcg: "900-1.600 mcg",
    unitsPer100u: "56-100 U",
    concentration: "1.600 mcg/mL",
    note: "Frasco comercial Zadaxin (SciClone) = 1,6 mg/mL.",
    references: [
      { citation: "Goldstein AL et al. Thymosin alpha 1: biological activities and clinical applications. Expert Opin Biol Ther, 2009." },
      { citation: "Wu J et al. Thymosin Alpha-1 for SARS-CoV-2 Infection. Front Immunol, 2021." },
    ],
  },
  glutathione: {
    vialMg: 600, bacWaterMl: 10,
    doseMcg: "600-2.400 mg IV",
    unitsPer100u: "—",
    concentration: "200 mg/mL (compounding)",
    ready: true,
    note: "Compounding IV padrão = 200 mg/mL. Pode vir já em solução.",
    references: [
      { citation: "Mischley LK et al. Glutathione as a Treatment for Parkinson's Disease: Meta-Analysis. J Parkinsons Dis, 2017." },
    ],
  },
  "nad-plus": {
    vialMg: 500, bacWaterMl: 250,
    doseMcg: "250-500 mg em 250mL SF",
    unitsPer100u: "—",
    concentration: "Diluir em SF (não água bacteriostática)",
    note: "Infusão lenta de 4-8h.",
    references: [
      { citation: "Martens CR et al. Chronic NR supplementation elevates NAD+ in healthy adults. Nat Commun, 2018." },
    ],
  },

  // ── COSMÉTICOS (tópicos) ──
  argireline: {
    vialMg: 0, bacWaterMl: 0, doseMcg: "5-10% em sérum", unitsPer100u: "—",
    concentration: "Tópico — sem reconstituição injetável", topical: true,
    references: [{ citation: "Lintner K. Cosmetic ingredient that inhibits neuronal exocytosis. IFSCC Magazine, 2002." }],
  },
};

// Aliases — ids alternativos usados no peptideVaultData
export const reconstitutionAliases: Record<string, string> = {
  bpc157: "bpc-157",
  tb500: "tb-500",
  cjc1295: "cjc-1295",
  "cjc-1295-no-dac": "cjc-1295",
  ghrp2: "ghrp-2",
  ghrp6: "ghrp-6",
  igf1lr3: "igf-1-lr3",
  "igf-1lr3": "igf-1-lr3",
  igf1des: "igf-1-des",
  pegmgf: "peg-mgf",
  follistatin344: "follistatin-344",
  follistatin: "follistatin-344",
  aod9604: "aod-9604",
  ghkcu: "ghk-cu",
  ll37: "ll-37",
  motsc: "mots-c",
  ss31: "ss-31",
  elamipretide: "ss-31",
  foxo4dri: "foxo4-dri",
  pt141: "pt-141",
  bremelanotide: "pt-141",
  melanotan2: "melanotan-ii",
  melanotanII: "melanotan-ii",
  thymosinalpha1: "thymosin-alpha-1",
  "thymosin-α-1": "thymosin-alpha-1",
  ta1: "thymosin-alpha-1",
  mk677: "mk-677",
  nad: "nad-plus",
  "nad+": "nad-plus",
};

export function getReconstitution(peptideId: string): PeptideReconstitution | undefined {
  const direct = peptideReconstitution[peptideId];
  if (direct) return direct;
  const alias = reconstitutionAliases[peptideId];
  return alias ? peptideReconstitution[alias] : undefined;
}
