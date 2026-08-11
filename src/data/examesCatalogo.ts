// Catálogo de exames laboratoriais — módulo Pedido de Exames (NutriPlan / Coach Hub)
export type ExameCategoria =
  | 'hematologico' | 'metabolico' | 'hormonal' | 'hepatico' | 'renal'
  | 'tireoidiano' | 'inflamatorio' | 'vitaminico' | 'cardiaco'
  | 'feminino' | 'longevidade' | 'urinario' | 'outro';

export interface Exame {
  id: string;
  nome: string;
  nomeCompleto: string;
  sigla?: string;
  unidade?: string;
  categoria: ExameCategoria;
  subcategoria?: string;
  material: 'sangue' | 'urina' | 'fezes' | 'saliva';
  jejum: 'sim_12h' | 'sim_8h' | 'sim_4h' | 'nao' | 'recomendado';
  preparo?: string;
  referencia: {
    masculino?: { min: number; max: number; unidade: string };
    feminino?: { min: number; max: number; unidade: string };
    geral?: { min: number; max: number; unidade: string };
    otimo?: { min: number; max: number };
  };
  tags: string[];
  relevancia: {
    objetivos?: string[];
    farmaco?: string[];
    condicoes?: string[];
    sexo?: 'M' | 'F' | 'ambos';
    idadeMin?: number;
    idadeMax?: number;
  };
  alertaSeAlterado?: string;
}

export interface PainelExames { nome: string; descricao: string; exames: string[]; cor: string }

export const CATEGORIA_LABEL: Record<ExameCategoria, string> = {
  hematologico: 'Hematológico', metabolico: 'Metabólico', hormonal: 'Hormonal',
  hepatico: 'Hepático', renal: 'Renal', tireoidiano: 'Tireoidiano',
  inflamatorio: 'Inflamatório', vitaminico: 'Vitaminas / Minerais', cardiaco: 'Cardíaco',
  feminino: 'Feminino', longevidade: 'Longevidade', urinario: 'Urinário', outro: 'Outros',
};

export const JEJUM_LABEL: Record<Exame['jejum'], string> = {
  sim_12h: 'Jejum de 12h', sim_8h: 'Jejum de 8h', sim_4h: 'Jejum de 4h',
  nao: 'Sem jejum', recomendado: 'Jejum recomendado',
};

export const EXAMES_CATALOGO: Exame[] = [

  // ═══════════════════════════════════════════════════
  // HEMATOLÓGICO
  // ═══════════════════════════════════════════════════
  {
    id: 'hemograma',
    nome: 'Hemograma completo',
    nomeCompleto: 'Hemograma completo com contagem de plaquetas',
    categoria: 'hematologico',
    material: 'sangue',
    jejum: 'nao',
    referencia: {
      masculino: { min: 13.5, max: 17.5, unidade: 'g/dL (hemoglobina)' },
      feminino: { min: 12.0, max: 16.0, unidade: 'g/dL (hemoglobina)' }
    },
    tags: ['basico', 'farmaco', 'trt', 'competicao'],
    relevancia: { objetivos: ['todos'] },
    alertaSeAlterado: 'Hematócrito elevado → aumentar hidratação, considerar doação de sangue se >54%'
  },
  {
    id: 'hematocrito',
    nome: 'Hematócrito',
    nomeCompleto: 'Hematócrito',
    categoria: 'hematologico',
    material: 'sangue',
    jejum: 'nao',
    referencia: {
      masculino: { min: 40, max: 54, unidade: '%' },
      feminino: { min: 36, max: 48, unidade: '%' },
      otimo: { min: 42, max: 48 }
    },
    tags: ['farmaco', 'trt', 'eritrocitose'],
    relevancia: { farmaco: ['trt', 'ciclo_leve', 'ciclo_moderado', 'ciclo_avancado'] },
    alertaSeAlterado: 'Se >52% com uso de AAS → risco cardiovascular aumentado'
  },
  {
    id: 'ferritina',
    nome: 'Ferritina',
    nomeCompleto: 'Ferritina sérica',
    categoria: 'hematologico',
    material: 'sangue',
    jejum: 'recomendado',
    referencia: {
      masculino: { min: 30, max: 400, unidade: 'ng/mL' },
      feminino: { min: 13, max: 150, unidade: 'ng/mL' },
      otimo: { min: 50, max: 150 }
    },
    tags: ['ferro', 'anemia', 'inflamacao', 'feminino'],
    relevancia: { sexo: 'ambos', condicoes: ['anemia', 'fadiga'] },
    alertaSeAlterado: '<30 → priorizar ferro heme + vitamina C. >300 → investigar hemocromatose.'
  },

  // ═══════════════════════════════════════════════════
  // METABÓLICO
  // ═══════════════════════════════════════════════════
  {
    id: 'glicemia_jejum',
    nome: 'Glicemia de jejum',
    nomeCompleto: 'Glicose sérica (jejum)',
    categoria: 'metabolico',
    material: 'sangue',
    jejum: 'sim_8h',
    referencia: {
      geral: { min: 70, max: 99, unidade: 'mg/dL' },
      otimo: { min: 75, max: 90 }
    },
    tags: ['basico', 'diabetes', 'insulina', 'gh'],
    relevancia: { objetivos: ['todos'], farmaco: ['gh_peptideos', 'gh_aas'] },
    alertaSeAlterado: '100-125 → pré-diabetes. ≥126 → diabetes. Com GH → monitorar quinzenalmente.'
  },
  {
    id: 'hba1c',
    nome: 'Hemoglobina glicada (HbA1c)',
    nomeCompleto: 'Hemoglobina glicada (HbA1c)',
    categoria: 'metabolico',
    material: 'sangue',
    jejum: 'nao',
    referencia: {
      geral: { min: 4.0, max: 5.6, unidade: '%' },
      otimo: { min: 4.5, max: 5.2 }
    },
    tags: ['diabetes', 'gh', 'longevidade'],
    relevancia: { farmaco: ['gh_peptideos', 'gh_aas', 'semaglutida'] },
    alertaSeAlterado: '5.7-6.4% → pré-diabetes. ≥6.5% → diabetes. Fundamental com uso de GH.'
  },
  {
    id: 'insulina_jejum',
    nome: 'Insulina de jejum',
    nomeCompleto: 'Insulina sérica (jejum)',
    categoria: 'metabolico',
    material: 'sangue',
    jejum: 'sim_8h',
    referencia: {
      geral: { min: 2.0, max: 25.0, unidade: 'µUI/mL' },
      otimo: { min: 3.0, max: 8.0 }
    },
    tags: ['insulina', 'resistencia', 'emagrecimento'],
    relevancia: { objetivos: ['emagrecimento', 'recomposicao'], condicoes: ['resistencia_insulinica'] },
    alertaSeAlterado: '>10 com glicemia normal → resistência insulínica subclínica. Ativar carb cycling.'
  },
  {
    id: 'colesterol_total',
    nome: 'Colesterol total',
    nomeCompleto: 'Colesterol total',
    categoria: 'metabolico',
    material: 'sangue',
    jejum: 'sim_12h',
    referencia: { geral: { min: 0, max: 190, unidade: 'mg/dL' } },
    tags: ['lipideos', 'cardiovascular', 'farmaco'],
    relevancia: { objetivos: ['todos'] }
  },
  {
    id: 'hdl',
    nome: 'HDL-colesterol',
    nomeCompleto: 'HDL-colesterol',
    categoria: 'metabolico',
    material: 'sangue',
    jejum: 'sim_12h',
    referencia: {
      masculino: { min: 40, max: 999, unidade: 'mg/dL' },
      feminino: { min: 50, max: 999, unidade: 'mg/dL' },
      otimo: { min: 60, max: 999 }
    },
    tags: ['lipideos', 'cardiovascular', 'farmaco'],
    relevancia: { farmaco: ['ciclo_leve', 'ciclo_moderado', 'ciclo_avancado', 'sarms'] },
    alertaSeAlterado: 'AAS tipicamente DESTROE HDL. Se <35 → risco cardiovascular significativo.'
  },
  {
    id: 'ldl',
    nome: 'LDL-colesterol',
    nomeCompleto: 'LDL-colesterol (calculado ou direto)',
    categoria: 'metabolico',
    material: 'sangue',
    jejum: 'sim_12h',
    referencia: {
      geral: { min: 0, max: 130, unidade: 'mg/dL' },
      otimo: { min: 0, max: 100 }
    },
    tags: ['lipideos', 'cardiovascular'],
    relevancia: { objetivos: ['todos'] }
  },
  {
    id: 'vldl',
    nome: 'VLDL-colesterol',
    nomeCompleto: 'VLDL-colesterol',
    categoria: 'metabolico',
    material: 'sangue',
    jejum: 'sim_12h',
    referencia: { geral: { min: 0, max: 30, unidade: 'mg/dL' } },
    tags: ['lipideos'],
    relevancia: { objetivos: ['todos'] }
  },
  {
    id: 'triglicerideos',
    nome: 'Triglicerídeos',
    nomeCompleto: 'Triglicerídeos',
    categoria: 'metabolico',
    material: 'sangue',
    jejum: 'sim_12h',
    referencia: {
      geral: { min: 0, max: 150, unidade: 'mg/dL' },
      otimo: { min: 0, max: 100 }
    },
    tags: ['lipideos', 'metabolico'],
    relevancia: { objetivos: ['todos'] },
    alertaSeAlterado: '>150 → reduzir CHO simples e frutose. Aumentar ômega-3.'
  },
  {
    id: 'apob',
    nome: 'Apolipoproteína B (ApoB)',
    nomeCompleto: 'Apolipoproteína B',
    categoria: 'metabolico',
    material: 'sangue',
    jejum: 'sim_12h',
    referencia: {
      geral: { min: 0, max: 100, unidade: 'mg/dL' },
      otimo: { min: 0, max: 80 }
    },
    tags: ['cardiovascular', 'longevidade', 'elite'],
    relevancia: { condicoes: ['risco_cardiovascular'] },
    alertaSeAlterado: 'Melhor preditor de risco CV que LDL. >120 → intervenção nutricional agressiva.'
  },
  {
    id: 'lpa',
    nome: 'Lipoproteína(a) — Lp(a)',
    nomeCompleto: 'Lipoproteína(a)',
    categoria: 'metabolico',
    material: 'sangue',
    jejum: 'nao',
    referencia: { geral: { min: 0, max: 30, unidade: 'mg/dL' } },
    tags: ['cardiovascular', 'longevidade', 'genetico'],
    relevancia: { condicoes: ['risco_cardiovascular'] },
    alertaSeAlterado: 'Genético, não muda com dieta. Se elevado → risco CV aumentado → intensificar outros fatores.'
  },
  {
    id: 'acido_urico',
    nome: 'Ácido úrico',
    nomeCompleto: 'Ácido úrico sérico',
    categoria: 'metabolico',
    material: 'sangue',
    jejum: 'sim_8h',
    referencia: {
      masculino: { min: 2.5, max: 7.0, unidade: 'mg/dL' },
      feminino: { min: 1.5, max: 6.0, unidade: 'mg/dL' }
    },
    tags: ['renal', 'gota', 'dieta_proteica'],
    relevancia: { condicoes: ['gota', 'dieta_hiperproteica'] },
    alertaSeAlterado: 'Elevado com dieta hiperproteica → aumentar hidratação, reduzir vísceras e frutos do mar.'
  },

  // ═══════════════════════════════════════════════════
  // HORMONAL MASCULINO
  // ═══════════════════════════════════════════════════
  {
    id: 'testosterona_total',
    nome: 'Testosterona total',
    nomeCompleto: 'Testosterona total sérica',
    categoria: 'hormonal',
    material: 'sangue',
    jejum: 'sim_8h',
    preparo: 'Coleta entre 7h-10h da manhã (pico circadiano)',
    referencia: {
      masculino: { min: 300, max: 1000, unidade: 'ng/dL' },
      otimo: { min: 500, max: 900 }
    },
    tags: ['hormonal', 'masculino', 'trt', 'pct', 'farmaco'],
    relevancia: { sexo: 'M', farmaco: ['trt', 'ciclo_leve', 'ciclo_moderado', 'ciclo_avancado', 'pct', 'sarms'] }
  },
  {
    id: 'testosterona_livre',
    nome: 'Testosterona livre',
    nomeCompleto: 'Testosterona livre (calculada ou por diálise)',
    categoria: 'hormonal',
    material: 'sangue',
    jejum: 'sim_8h',
    referencia: { masculino: { min: 9.0, max: 30.0, unidade: 'pg/mL' } },
    tags: ['hormonal', 'masculino', 'trt'],
    relevancia: { sexo: 'M', farmaco: ['trt', 'pct'] }
  },
  {
    id: 'estradiol',
    nome: 'Estradiol (E2)',
    nomeCompleto: 'Estradiol (E2) — método sensível/ultrassensível',
    categoria: 'hormonal',
    material: 'sangue',
    jejum: 'nao',
    referencia: {
      masculino: { min: 15, max: 40, unidade: 'pg/mL' },
      otimo: { min: 20, max: 35 }
    },
    tags: ['hormonal', 'masculino', 'farmaco', 'aromatizacao'],
    relevancia: { sexo: 'M', farmaco: ['trt', 'ciclo_leve', 'ciclo_moderado', 'ciclo_avancado'] },
    alertaSeAlterado: '>50 → aromatização excessiva. Incluir crucíferos diários, zinco, reduzir BF%.'
  },
  {
    id: 'lh',
    nome: 'LH',
    nomeCompleto: 'Hormônio Luteinizante (LH)',
    categoria: 'hormonal',
    material: 'sangue',
    jejum: 'nao',
    referencia: { masculino: { min: 1.7, max: 8.6, unidade: 'mUI/mL' } },
    tags: ['hormonal', 'eixo', 'pct', 'sarms'],
    relevancia: { farmaco: ['pct', 'sarms'] },
    alertaSeAlterado: 'Suprimido em uso de AAS. Fundamental monitorar durante PCT.'
  },
  {
    id: 'fsh',
    nome: 'FSH',
    nomeCompleto: 'Hormônio Folículo-Estimulante (FSH)',
    categoria: 'hormonal',
    material: 'sangue',
    jejum: 'nao',
    referencia: { masculino: { min: 1.5, max: 12.4, unidade: 'mUI/mL' } },
    tags: ['hormonal', 'eixo', 'pct', 'fertilidade'],
    relevancia: { farmaco: ['pct', 'sarms'] }
  },
  {
    id: 'shbg',
    nome: 'SHBG',
    nomeCompleto: 'Globulina Ligadora de Hormônios Sexuais (SHBG)',
    categoria: 'hormonal',
    material: 'sangue',
    jejum: 'nao',
    referencia: { masculino: { min: 10, max: 57, unidade: 'nmol/L' } },
    tags: ['hormonal', 'trt', 'biodisponibilidade'],
    relevancia: { sexo: 'M' }
  },
  {
    id: 'prolactina',
    nome: 'Prolactina',
    nomeCompleto: 'Prolactina sérica',
    categoria: 'hormonal',
    material: 'sangue',
    jejum: 'nao',
    preparo: 'Repouso de 30min antes da coleta. Evitar estimulação mamária.',
    referencia: { masculino: { min: 2.1, max: 17.7, unidade: 'ng/mL' } },
    tags: ['hormonal', 'farmaco', 'nandrolona', 'trembolona'],
    relevancia: { farmaco: ['ciclo_moderado', 'ciclo_avancado'] },
    alertaSeAlterado: 'Elevada com 19-nor (Deca, Trembolona). Cabergolina pode ser necessária.'
  },
  {
    id: 'dhea_s',
    nome: 'DHEA-S',
    nomeCompleto: 'Dehidroepiandrosterona sulfato (DHEA-S)',
    categoria: 'hormonal',
    material: 'sangue',
    jejum: 'nao',
    referencia: {
      masculino: { min: 160, max: 449, unidade: 'µg/dL' },
      feminino: { min: 35, max: 430, unidade: 'µg/dL' }
    },
    tags: ['hormonal', 'adrenal', 'longevidade'],
    relevancia: { condicoes: ['fadiga_adrenal', 'longevidade'] }
  },
  {
    id: 'psa',
    nome: 'PSA total',
    nomeCompleto: 'Antígeno Prostático Específico (PSA) total',
    categoria: 'hormonal',
    material: 'sangue',
    jejum: 'nao',
    preparo: 'Evitar ejaculação, exercícios intensos e andar de bicicleta 48h antes.',
    referencia: { masculino: { min: 0, max: 4.0, unidade: 'ng/mL' } },
    tags: ['prostata', 'farmaco', 'trt', 'masculino'],
    relevancia: { sexo: 'M', idadeMin: 35, farmaco: ['trt', 'ciclo_leve', 'ciclo_moderado', 'ciclo_avancado'] },
    alertaSeAlterado: 'Monitorar aumento >0.75 ng/mL/ano. Qualquer elevação com AAS → urologista.'
  },
  {
    id: 'cortisol',
    nome: 'Cortisol matinal',
    nomeCompleto: 'Cortisol sérico (8h manhã)',
    categoria: 'hormonal',
    material: 'sangue',
    jejum: 'nao',
    preparo: 'Coleta entre 7h-9h da manhã.',
    referencia: { geral: { min: 6.2, max: 19.4, unidade: 'µg/dL' } },
    tags: ['estresse', 'adrenal', 'overtraining', 'performance'],
    relevancia: { condicoes: ['estresse_alto', 'overtraining'] },
    alertaSeAlterado: '>20 → estresse crônico/overtraining. Não fazer déficit agressivo. Magnésio, ashwagandha.'
  },
  {
    id: 'igf1',
    nome: 'IGF-1',
    nomeCompleto: 'Fator de Crescimento Semelhante à Insulina tipo 1 (IGF-1)',
    categoria: 'hormonal',
    material: 'sangue',
    jejum: 'sim_8h',
    referencia: { geral: { min: 100, max: 350, unidade: 'ng/mL' } },
    tags: ['gh', 'peptideos', 'crescimento'],
    relevancia: { farmaco: ['gh_peptideos', 'gh_aas', 'mk677'] },
    alertaSeAlterado: 'Marcador de atividade de GH. Monitorar se >400 → risco de crescimento tecidual.'
  },

  // ═══════════════════════════════════════════════════
  // HEPÁTICO
  // ═══════════════════════════════════════════════════
  {
    id: 'tgo',
    nome: 'TGO (AST)',
    nomeCompleto: 'Transaminase Glutâmico-Oxalacética (TGO/AST)',
    sigla: 'TGO',
    categoria: 'hepatico',
    material: 'sangue',
    jejum: 'nao',
    referencia: { geral: { min: 0, max: 40, unidade: 'U/L' } },
    tags: ['hepatico', 'farmaco', 'oral_17alpha'],
    relevancia: { farmaco: ['ciclo_leve', 'ciclo_moderado', 'ciclo_avancado', 'sarms'] },
    alertaSeAlterado: '>80 → estresse hepático significativo. NAC 1200mg + TUDCA 500mg. Considerar descontinuar oral.'
  },
  {
    id: 'tgp',
    nome: 'TGP (ALT)',
    nomeCompleto: 'Transaminase Glutâmico-Pirúvica (TGP/ALT)',
    sigla: 'TGP',
    categoria: 'hepatico',
    material: 'sangue',
    jejum: 'nao',
    referencia: {
      geral: { min: 0, max: 41, unidade: 'U/L' },
      otimo: { min: 0, max: 25 }
    },
    tags: ['hepatico', 'farmaco', 'oral_17alpha'],
    relevancia: { farmaco: ['ciclo_leve', 'ciclo_moderado', 'ciclo_avancado', 'sarms'] },
    alertaSeAlterado: 'TGP é mais específica de fígado que TGO. Ideal <25 U/L para saúde ótima.'
  },
  {
    id: 'ggt',
    nome: 'GGT',
    nomeCompleto: 'Gama-Glutamil Transferase (GGT)',
    sigla: 'GGT',
    categoria: 'hepatico',
    material: 'sangue',
    jejum: 'sim_8h',
    referencia: {
      masculino: { min: 0, max: 60, unidade: 'U/L' },
      feminino: { min: 0, max: 40, unidade: 'U/L' }
    },
    tags: ['hepatico', 'alcool', 'farmaco'],
    relevancia: { farmaco: ['ciclo_moderado', 'ciclo_avancado'] },
    alertaSeAlterado: 'Sensível a álcool e hepatotoxinas. Se elevada → eliminar álcool, cúrcuma, silimarina.'
  },
  {
    id: 'bilirrubina_total',
    nome: 'Bilirrubina total e frações',
    nomeCompleto: 'Bilirrubina total, direta e indireta',
    categoria: 'hepatico',
    material: 'sangue',
    jejum: 'sim_4h',
    referencia: { geral: { min: 0.1, max: 1.2, unidade: 'mg/dL' } },
    tags: ['hepatico'],
    relevancia: { condicoes: ['hepatopatia'] }
  },
  {
    id: 'fosfatase_alcalina',
    nome: 'Fosfatase alcalina',
    nomeCompleto: 'Fosfatase alcalina',
    categoria: 'hepatico',
    material: 'sangue',
    jejum: 'nao',
    referencia: { geral: { min: 30, max: 120, unidade: 'U/L' } },
    tags: ['hepatico', 'osseo'],
    relevancia: { condicoes: ['hepatopatia'] }
  },
  {
    id: 'albumina',
    nome: 'Albumina',
    nomeCompleto: 'Albumina sérica',
    categoria: 'hepatico',
    material: 'sangue',
    jejum: 'nao',
    referencia: { geral: { min: 3.5, max: 5.2, unidade: 'g/dL' } },
    tags: ['hepatico', 'nutricional', 'proteina'],
    relevancia: { condicoes: ['desnutricao', 'hepatopatia'] },
    alertaSeAlterado: '<3.5 → desnutrição proteica ou disfunção hepática. Aumentar PTN de alto valor biológico.'
  },

  // ═══════════════════════════════════════════════════
  // RENAL
  // ═══════════════════════════════════════════════════
  {
    id: 'creatinina',
    nome: 'Creatinina',
    nomeCompleto: 'Creatinina sérica',
    categoria: 'renal',
    material: 'sangue',
    jejum: 'nao',
    referencia: {
      masculino: { min: 0.7, max: 1.3, unidade: 'mg/dL' },
      feminino: { min: 0.6, max: 1.1, unidade: 'mg/dL' }
    },
    tags: ['renal', 'farmaco', 'proteina_alta'],
    relevancia: { farmaco: ['ciclo_moderado', 'ciclo_avancado', 'gh_aas'] },
    alertaSeAlterado: 'Pode estar falsamente elevada com creatina e massa muscular alta. Avaliar junto com TFG e cistatina C.'
  },
  {
    id: 'ureia',
    nome: 'Ureia',
    nomeCompleto: 'Ureia sérica',
    categoria: 'renal',
    material: 'sangue',
    jejum: 'sim_8h',
    referencia: { geral: { min: 15, max: 40, unidade: 'mg/dL' } },
    tags: ['renal', 'proteina'],
    relevancia: { objetivos: ['todos'] }
  },
  {
    id: 'tfg',
    nome: 'TFG (estimada)',
    nomeCompleto: 'Taxa de Filtração Glomerular estimada (CKD-EPI)',
    sigla: 'TFG',
    categoria: 'renal',
    material: 'sangue',
    jejum: 'nao',
    referencia: { geral: { min: 90, max: 999, unidade: 'mL/min/1.73m²' } },
    tags: ['renal', 'farmaco'],
    relevancia: { farmaco: ['ciclo_moderado', 'ciclo_avancado'] },
    alertaSeAlterado: '<60 → ALERTA. Limitar PTN ≤1.6g/kg. Encaminhar nefrologista.'
  },
  {
    id: 'cistatina_c',
    nome: 'Cistatina C',
    nomeCompleto: 'Cistatina C sérica',
    categoria: 'renal',
    material: 'sangue',
    jejum: 'nao',
    referencia: { geral: { min: 0.55, max: 1.15, unidade: 'mg/L' } },
    tags: ['renal', 'elite', 'farmaco'],
    relevancia: { farmaco: ['ciclo_avancado', 'gh_aas'] },
    alertaSeAlterado: 'Mais preciso que creatinina em atletas musculosos. Padrão ouro para TFG real.'
  },
  {
    id: 'microalbuminuria',
    nome: 'Microalbuminúria',
    nomeCompleto: 'Relação albumina/creatinina urinária (RAC)',
    categoria: 'renal',
    material: 'urina',
    jejum: 'nao',
    referencia: { geral: { min: 0, max: 30, unidade: 'mg/g' } },
    tags: ['renal', 'farmaco', 'pressao'],
    relevancia: { farmaco: ['ciclo_avancado'], condicoes: ['hipertensao'] },
    alertaSeAlterado: '>30 → dano renal precoce. Reduzir proteína se >2.5g/kg. Controlar PA.'
  },
  {
    id: 'eas',
    nome: 'EAS (Urina tipo I)',
    nomeCompleto: 'Exame de urina tipo I (Elementos Anormais e Sedimento)',
    sigla: 'EAS',
    categoria: 'urinario',
    material: 'urina',
    jejum: 'nao',
    referencia: { geral: { min: 0, max: 0, unidade: 'qualitativo' } },
    tags: ['renal', 'basico'],
    relevancia: { objetivos: ['todos'] }
  },

  // ═══════════════════════════════════════════════════
  // TIREOIDIANO
  // ═══════════════════════════════════════════════════
  {
    id: 'tsh',
    nome: 'TSH',
    nomeCompleto: 'Hormônio Tireoestimulante (TSH) ultrassensível',
    sigla: 'TSH',
    categoria: 'tireoidiano',
    material: 'sangue',
    jejum: 'nao',
    referencia: {
      geral: { min: 0.4, max: 4.0, unidade: 'µUI/mL' },
      otimo: { min: 1.0, max: 2.5 }
    },
    tags: ['tireoide', 'metabolismo', 'emagrecimento'],
    relevancia: { objetivos: ['emagrecimento'], condicoes: ['hipotireoidismo'] },
    alertaSeAlterado: '>4.0 → hipotireoidismo. Metabolismo lento. Ajustar meta calórica. Selênio (castanhas).'
  },
  {
    id: 't4_livre',
    nome: 'T4 livre',
    nomeCompleto: 'Tiroxina livre (T4L)',
    categoria: 'tireoidiano',
    material: 'sangue',
    jejum: 'nao',
    referencia: { geral: { min: 0.8, max: 1.8, unidade: 'ng/dL' } },
    tags: ['tireoide', 'metabolismo'],
    relevancia: { condicoes: ['hipotireoidismo', 'hipertireoidismo'] }
  },
  {
    id: 't3_livre',
    nome: 'T3 livre',
    nomeCompleto: 'Triiodotironina livre (T3L)',
    categoria: 'tireoidiano',
    material: 'sangue',
    jejum: 'nao',
    referencia: { geral: { min: 2.3, max: 4.2, unidade: 'pg/mL' } },
    tags: ['tireoide', 'metabolismo', 'dieta_restritiva'],
    relevancia: { condicoes: ['dieta_cronica'] },
    alertaSeAlterado: 'Cai em dietas restritivas prolongadas. Se baixo → refeed ou reverse diet.'
  },
  {
    id: 'anti_tpo',
    nome: 'Anti-TPO',
    nomeCompleto: 'Anticorpos anti-tireoperoxidase (Anti-TPO)',
    categoria: 'tireoidiano',
    material: 'sangue',
    jejum: 'nao',
    referencia: { geral: { min: 0, max: 35, unidade: 'UI/mL' } },
    tags: ['tireoide', 'autoimune', 'hashimoto'],
    relevancia: { condicoes: ['hipotireoidismo', 'hashimoto'] }
  },

  // ═══════════════════════════════════════════════════
  // VITAMÍNICO / MINERAIS
  // ═══════════════════════════════════════════════════
  {
    id: 'vitamina_d',
    nome: 'Vitamina D (25-OH)',
    nomeCompleto: '25-Hidroxivitamina D (25-OH Vitamina D)',
    categoria: 'vitaminico',
    material: 'sangue',
    jejum: 'nao',
    referencia: {
      geral: { min: 30, max: 100, unidade: 'ng/mL' },
      otimo: { min: 50, max: 80 }
    },
    tags: ['vitamina', 'imunidade', 'hormonal', 'osso'],
    relevancia: { objetivos: ['todos'] },
    alertaSeAlterado: '<30 → suplementar D3 5000UI + K2 MK-7. <20 → dose de ataque necessária.'
  },
  {
    id: 'vitamina_b12',
    nome: 'Vitamina B12',
    nomeCompleto: 'Cianocobalamina (Vitamina B12)',
    categoria: 'vitaminico',
    material: 'sangue',
    jejum: 'nao',
    referencia: {
      geral: { min: 200, max: 900, unidade: 'pg/mL' },
      otimo: { min: 500, max: 800 }
    },
    tags: ['vitamina', 'vegano', 'energia', 'neurologico'],
    relevancia: { condicoes: ['vegano', 'vegetariano', 'fadiga'] },
    alertaSeAlterado: '<300 → suplementar metilcobalamina 1000-5000mcg. Essencial para veganos.'
  },
  {
    id: 'acido_folico',
    nome: 'Ácido fólico (B9)',
    nomeCompleto: 'Folato sérico',
    categoria: 'vitaminico',
    material: 'sangue',
    jejum: 'nao',
    referencia: { geral: { min: 3.0, max: 17.0, unidade: 'ng/mL' } },
    tags: ['vitamina', 'gestante', 'homocisteina'],
    relevancia: { condicoes: ['gestante', 'homocisteina_alta'] }
  },
  {
    id: 'ferro_serico',
    nome: 'Ferro sérico',
    nomeCompleto: 'Ferro sérico',
    categoria: 'vitaminico',
    material: 'sangue',
    jejum: 'sim_8h',
    referencia: {
      masculino: { min: 65, max: 175, unidade: 'µg/dL' },
      feminino: { min: 50, max: 170, unidade: 'µg/dL' }
    },
    tags: ['ferro', 'anemia', 'feminino', 'performance'],
    relevancia: { sexo: 'ambos' }
  },
  {
    id: 'zinco',
    nome: 'Zinco sérico',
    nomeCompleto: 'Zinco sérico',
    categoria: 'vitaminico',
    material: 'sangue',
    jejum: 'sim_8h',
    referencia: { geral: { min: 70, max: 120, unidade: 'µg/dL' } },
    tags: ['mineral', 'hormonal', 'imunidade', 'testosterona'],
    relevancia: { objetivos: ['hipertrofia'], farmaco: ['trt', 'pct'] },
    alertaSeAlterado: '<70 → suplementar 30-50mg/dia. Fundamental para produção de testosterona.'
  },
  {
    id: 'magnesio',
    nome: 'Magnésio sérico',
    nomeCompleto: 'Magnésio sérico',
    categoria: 'vitaminico',
    material: 'sangue',
    jejum: 'sim_8h',
    referencia: {
      geral: { min: 1.6, max: 2.6, unidade: 'mg/dL' },
      otimo: { min: 2.0, max: 2.4 }
    },
    tags: ['mineral', 'sono', 'muscular', 'estresse'],
    relevancia: { condicoes: ['estresse_alto', 'caimbras', 'insonia'] },
    alertaSeAlterado: 'Sérico normal NÃO exclui deficiência intracelular. Se sintomas → suplementar.'
  },

  // ═══════════════════════════════════════════════════
  // INFLAMATÓRIO
  // ═══════════════════════════════════════════════════
  {
    id: 'pcr',
    nome: 'PCR ultrassensível',
    nomeCompleto: 'Proteína C-Reativa ultrassensível (PCR-us)',
    sigla: 'PCR-us',
    categoria: 'inflamatorio',
    material: 'sangue',
    jejum: 'nao',
    referencia: {
      geral: { min: 0, max: 1.0, unidade: 'mg/L' },
      otimo: { min: 0, max: 0.5 }
    },
    tags: ['inflamacao', 'cardiovascular', 'longevidade'],
    relevancia: { objetivos: ['todos'] },
    alertaSeAlterado: '>3.0 → inflamação sistêmica. Ômega-3 4g+, cúrcuma, eliminar ultraprocessados.'
  },
  {
    id: 'homocisteina',
    nome: 'Homocisteína',
    nomeCompleto: 'Homocisteína plasmática',
    categoria: 'inflamatorio',
    material: 'sangue',
    jejum: 'sim_8h',
    referencia: {
      geral: { min: 5, max: 12, unidade: 'µmol/L' },
      otimo: { min: 5, max: 8 }
    },
    tags: ['cardiovascular', 'inflamacao', 'longevidade'],
    relevancia: { condicoes: ['risco_cardiovascular', 'longevidade'] },
    alertaSeAlterado: '>12 → suplementar B6 + B9 + B12 (metilados). Risco cardiovascular.'
  },
  {
    id: 'vhs',
    nome: 'VHS',
    nomeCompleto: 'Velocidade de Hemossedimentação (VHS)',
    sigla: 'VHS',
    categoria: 'inflamatorio',
    material: 'sangue',
    jejum: 'nao',
    referencia: {
      masculino: { min: 0, max: 15, unidade: 'mm/h' },
      feminino: { min: 0, max: 20, unidade: 'mm/h' }
    },
    tags: ['inflamacao'],
    relevancia: { condicoes: ['inflamacao_cronica'] }
  },

  // ═══════════════════════════════════════════════════
  // CARDÍACO
  // ═══════════════════════════════════════════════════
  {
    id: 'bnp',
    nome: 'BNP / NT-proBNP',
    nomeCompleto: 'Peptídeo Natriurético Cerebral (BNP ou NT-proBNP)',
    categoria: 'cardiaco',
    material: 'sangue',
    jejum: 'nao',
    referencia: { geral: { min: 0, max: 100, unidade: 'pg/mL' } },
    tags: ['cardiaco', 'farmaco', 'hipertrofia_cardiaca'],
    relevancia: { farmaco: ['ciclo_avancado', 'gh_aas'] },
    alertaSeAlterado: 'Marcador de estresse cardíaco. Elevado → ecocardiograma + cardiologista.'
  },
  {
    id: 'ck_total',
    nome: 'CK total (CPK)',
    nomeCompleto: 'Creatinoquinase total (CK/CPK)',
    sigla: 'CK',
    categoria: 'cardiaco',
    material: 'sangue',
    jejum: 'nao',
    preparo: 'Evitar treino intenso 48-72h antes da coleta.',
    referencia: {
      masculino: { min: 32, max: 294, unidade: 'U/L' },
      feminino: { min: 33, max: 211, unidade: 'U/L' }
    },
    tags: ['muscular', 'rabdomiolise', 'treino'],
    relevancia: { condicoes: ['overtraining'] },
    alertaSeAlterado: '>1000 com sintomas → rabdomiólise. Hidratar agressivamente. Emergência.'
  },
  {
    id: 'ck_mb',
    nome: 'CK-MB',
    nomeCompleto: 'Creatinoquinase fração MB (CK-MB)',
    categoria: 'cardiaco',
    material: 'sangue',
    jejum: 'nao',
    referencia: { geral: { min: 0, max: 25, unidade: 'U/L' } },
    tags: ['cardiaco', 'farmaco'],
    relevancia: { farmaco: ['ciclo_avancado'] }
  },

  // ═══════════════════════════════════════════════════
  // FEMININO
  // ═══════════════════════════════════════════════════
  {
    id: 'estradiol_fem',
    nome: 'Estradiol (E2)',
    nomeCompleto: 'Estradiol (E2)',
    categoria: 'feminino',
    material: 'sangue',
    jejum: 'nao',
    preparo: 'Informar dia do ciclo menstrual na coleta.',
    referencia: {
      feminino: { min: 12, max: 400, unidade: 'pg/mL (varia por fase)' }
    },
    tags: ['hormonal', 'feminino', 'ciclo'],
    relevancia: { sexo: 'F' }
  },
  {
    id: 'progesterona',
    nome: 'Progesterona',
    nomeCompleto: 'Progesterona sérica',
    categoria: 'feminino',
    material: 'sangue',
    jejum: 'nao',
    preparo: 'Coletar na fase lútea (21º dia do ciclo) para avaliar ovulação.',
    referencia: { feminino: { min: 0.2, max: 25, unidade: 'ng/mL (varia por fase)' } },
    tags: ['hormonal', 'feminino', 'ciclo', 'fertilidade'],
    relevancia: { sexo: 'F', condicoes: ['amenorreia', 'irregularidade_menstrual'] }
  },
  {
    id: 'testosterona_fem',
    nome: 'Testosterona total (feminina)',
    nomeCompleto: 'Testosterona total sérica',
    categoria: 'feminino',
    material: 'sangue',
    jejum: 'sim_8h',
    referencia: { feminino: { min: 8, max: 60, unidade: 'ng/dL' } },
    tags: ['hormonal', 'feminino', 'sop'],
    relevancia: { sexo: 'F', condicoes: ['sop', 'hirsutismo'] }
  },

  // ═══════════════════════════════════════════════════
  // LONGEVIDADE / AVANÇADO
  // ═══════════════════════════════════════════════════
  {
    id: 'vitamina_a',
    nome: 'Vitamina A (Retinol)',
    nomeCompleto: 'Retinol sérico',
    categoria: 'vitaminico',
    material: 'sangue',
    jejum: 'sim_8h',
    referencia: { geral: { min: 30, max: 80, unidade: 'µg/dL' } },
    tags: ['vitamina', 'imunidade', 'pele'],
    relevancia: { condicoes: ['imunidade_baixa'] }
  },
  {
    id: 'vitamina_e',
    nome: 'Vitamina E (Tocoferol)',
    nomeCompleto: 'Alfa-tocoferol sérico',
    categoria: 'vitaminico',
    material: 'sangue',
    jejum: 'sim_12h',
    referencia: { geral: { min: 5.5, max: 17.0, unidade: 'mg/L' } },
    tags: ['antioxidante', 'longevidade'],
    relevancia: { condicoes: ['longevidade'] }
  },
  {
    id: 'selenio',
    nome: 'Selênio',
    nomeCompleto: 'Selênio sérico',
    categoria: 'vitaminico',
    material: 'sangue',
    jejum: 'nao',
    referencia: { geral: { min: 70, max: 150, unidade: 'µg/L' } },
    tags: ['mineral', 'tireoide', 'antioxidante'],
    relevancia: { condicoes: ['hipotireoidismo', 'hashimoto'] }
  },
  {
    id: 'omega3_indice',
    nome: 'Índice de Ômega-3',
    nomeCompleto: 'Índice de Ômega-3 eritrocitário (EPA+DHA)',
    categoria: 'longevidade',
    material: 'sangue',
    jejum: 'nao',
    referencia: {
      geral: { min: 8, max: 12, unidade: '%' },
      otimo: { min: 8, max: 12 }
    },
    tags: ['cardiovascular', 'inflamacao', 'longevidade', 'elite'],
    relevancia: { condicoes: ['longevidade', 'inflamacao'] },
    alertaSeAlterado: '<4% → alto risco cardiovascular. Suplementar 3-4g EPA+DHA/dia.'
  },
  {
    id: 'glicemia_pos_prandial',
    nome: 'Glicemia pós-prandial (2h)',
    nomeCompleto: 'Glicose sérica 2 horas pós-prandial (75g glicose)',
    categoria: 'metabolico',
    material: 'sangue',
    jejum: 'nao',
    preparo: 'Realizado após ingestão de 75g de glicose (TOTG).',
    referencia: { geral: { min: 0, max: 140, unidade: 'mg/dL' } },
    tags: ['diabetes', 'insulina', 'resistencia'],
    relevancia: { condicoes: ['resistencia_insulinica', 'pre_diabetes'] }
  }
];

export const PAINEIS: Record<string, PainelExames> = {
  basico: {
    nome: 'Painel Básico',
    descricao: 'Hemograma, glicemia, insulina, lipídeos. Base para qualquer protocolo.',
    exames: ['hemograma', 'glicemia_jejum', 'hba1c', 'insulina_jejum', 'colesterol_total', 'hdl', 'ldl', 'vldl', 'triglicerideos'],
    cor: '#00D4FF'
  },

  hormonal_masc: {
    nome: 'Painel Hormonal Masculino',
    descricao: 'Eixo HPT completo + marcadores de aromatização e próstata.',
    exames: ['testosterona_total', 'testosterona_livre', 'estradiol', 'lh', 'fsh', 'shbg', 'prolactina', 'dhea_s', 'psa', 'cortisol', 'igf1'],
    cor: '#00D4FF'
  },

  hormonal_fem: {
    nome: 'Painel Hormonal Feminino',
    descricao: 'Hormônios femininos + tireoide + ferro para ciclo menstrual.',
    exames: ['estradiol_fem', 'progesterona', 'testosterona_fem', 'lh', 'fsh', 'prolactina', 'tsh', 't4_livre', 'dhea_s', 'cortisol', 'ferro_serico', 'ferritina'],
    cor: '#FF69B4'
  },

  metabolico: {
    nome: 'Painel Metabólico',
    descricao: 'Sensibilidade insulínica, ácido úrico, perfil lipídico completo.',
    exames: ['glicemia_jejum', 'hba1c', 'insulina_jejum', 'colesterol_total', 'hdl', 'ldl', 'vldl', 'triglicerideos', 'apob', 'acido_urico'],
    cor: '#FFD700'
  },

  hepatico: {
    nome: 'Painel Hepático',
    descricao: 'Função hepática completa. Obrigatório com uso de orais 17α-alquilados.',
    exames: ['tgo', 'tgp', 'ggt', 'bilirrubina_total', 'fosfatase_alcalina', 'albumina'],
    cor: '#FF6B00'
  },

  renal: {
    nome: 'Painel Renal',
    descricao: 'Função renal + urina. Importante com dieta hiperproteica e/ou farmacologia.',
    exames: ['creatinina', 'ureia', 'tfg', 'cistatina_c', 'microalbuminuria', 'eas', 'acido_urico'],
    cor: '#FF6B00'
  },

  tireoidiano: {
    nome: 'Painel Tireoidiano',
    descricao: 'Função tireoidiana completa + autoimunidade.',
    exames: ['tsh', 't4_livre', 't3_livre', 'anti_tpo'],
    cor: '#9B59B6'
  },

  vitaminico: {
    nome: 'Painel Vitamínico / Minerais',
    descricao: 'Micronutrientes essenciais para performance e saúde.',
    exames: ['vitamina_d', 'vitamina_b12', 'acido_folico', 'ferro_serico', 'ferritina', 'zinco', 'magnesio', 'selenio'],
    cor: '#00FF88'
  },

  inflamatorio: {
    nome: 'Painel Inflamatório',
    descricao: 'Marcadores de inflamação sistêmica e risco cardiovascular.',
    exames: ['pcr', 'homocisteina', 'vhs', 'ferritina'],
    cor: '#FF4444'
  },

  cardiaco: {
    nome: 'Painel Cardíaco',
    descricao: 'Marcadores de estresse cardíaco e dano muscular.',
    exames: ['bnp', 'ck_total', 'ck_mb', 'pcr'],
    cor: '#FF4444'
  },

  farmacologico: {
    nome: 'Painel Farmacológico',
    descricao: 'Monitoramento completo para quem utiliza suporte farmacológico.',
    exames: ['hemograma', 'hematocrito', 'tgo', 'tgp', 'ggt', 'creatinina', 'tfg', 'colesterol_total', 'hdl', 'ldl', 'triglicerideos', 'testosterona_total', 'estradiol', 'prolactina', 'psa', 'glicemia_jejum', 'hba1c', 'pcr'],
    cor: '#FF6B00'
  },

  atleta_performance: {
    nome: 'Painel Atleta Performance',
    descricao: 'Otimização de performance: hormônios, micronutrientes, inflamação e recuperação.',
    exames: ['hemograma', 'ferritina', 'ferro_serico', 'vitamina_d', 'vitamina_b12', 'zinco', 'magnesio', 'cortisol', 'testosterona_total', 'igf1', 'tsh', 't3_livre', 'pcr', 'ck_total', 'insulina_jejum'],
    cor: '#00D4FF'
  },

  longevidade: {
    nome: 'Painel Longevidade',
    descricao: 'Marcadores avançados de envelhecimento saudável e risco cardiovascular.',
    exames: ['hemograma', 'glicemia_jejum', 'hba1c', 'insulina_jejum', 'apob', 'lpa', 'pcr', 'homocisteina', 'vitamina_d', 'omega3_indice', 'tsh', 'cortisol', 'dhea_s', 'igf1', 'ferritina'],
    cor: '#9B59B6'
  },

  feminino: {
    nome: 'Painel Feminino Completo',
    descricao: 'Hormônios, ferro, tireoide e vitaminas essenciais para saúde da mulher.',
    exames: ['estradiol_fem', 'progesterona', 'testosterona_fem', 'lh', 'fsh', 'prolactina', 'tsh', 't4_livre', 'anti_tpo', 'ferro_serico', 'ferritina', 'vitamina_d', 'vitamina_b12', 'acido_folico', 'zinco', 'magnesio'],
    cor: '#FF69B4'
  },

  checkup_completo: {
    nome: 'CHECK-UP COMPLETO',
    descricao: 'Todos os marcadores essenciais em um pedido. O mais completo.',
    exames: ['hemograma', 'glicemia_jejum', 'hba1c', 'insulina_jejum', 'colesterol_total', 'hdl', 'ldl', 'vldl', 'triglicerideos', 'tgo', 'tgp', 'ggt', 'creatinina', 'ureia', 'tfg', 'acido_urico', 'tsh', 't4_livre', 'vitamina_d', 'vitamina_b12', 'ferro_serico', 'ferritina', 'zinco', 'magnesio', 'pcr', 'homocisteina', 'eas'],
    cor: '#00FF88'
  }
};

export const EXAME_BY_ID: Record<string, Exame> = Object.fromEntries(
  EXAMES_CATALOGO.map((e) => [e.id, e])
);

export interface PatientProfileExames {
  sexo?: 'M' | 'F' | string | null;
  idade?: number | null;
  objetivo?: string | null;
  pharmEnabled?: boolean;
  pharmProfile?: string | null;
  condicoes?: string[];
}

/** Auto-sugestão de painéis com base no perfil do paciente. */
export function autoSuggestPanels(patient: PatientProfileExames): string[] {
  const suggested: string[] = ['basico'];
  const raw = (patient.sexo || '').toString().toUpperCase();
  const sexo = raw ? (raw.startsWith('F') ? 'F' : 'M') : null;
  const idade = patient.idade ?? 0;
  const obj = (patient.objetivo || '').toLowerCase();

  if (sexo === 'M') suggested.push('hormonal_masc');
  if (sexo === 'F') suggested.push('hormonal_fem');

  if (patient.pharmEnabled && patient.pharmProfile && patient.pharmProfile !== 'natural') {
    suggested.push('hepatico', 'renal', 'farmacologico');
  }

  if (obj.includes('emagre') || obj.includes('cut')) suggested.push('tireoidiano', 'metabolico');
  if (obj.includes('performance') || obj.includes('atleta')) suggested.push('atleta_performance');
  if (obj.includes('longevidade') || obj.includes('saude')) suggested.push('longevidade');

  if (idade >= 45) suggested.push('cardiaco');

  if (patient.condicoes?.includes('hipotireoidismo')) suggested.push('tireoidiano');
  if (patient.condicoes?.includes('resistencia_insulinica')) suggested.push('metabolico');

  return [...new Set(suggested)].filter((p) => p in PAINEIS);
}

/** Custo estimado (laboratório popular) em R$. */
export function estimateCost(examIds: string[]): { min: number; max: number } {
  const n = examIds.length;
  return { min: Math.round(n * 12), max: Math.round(n * 18) };
}

export function nextRequestDate(periodicity: string, from = new Date()): Date | null {
  const d = new Date(from);
  const map: Record<string, number> = { mensal: 1, trimestral: 3, semestral: 6, anual: 12 };
  const m = map[periodicity];
  if (!m) return null;
  d.setMonth(d.getMonth() + m);
  return d;
}

export const PERIODICIDADES = [
  { id: 'pre_protocolo', label: 'Pré-protocolo' },
  { id: 'mensal', label: 'Mensal' },
  { id: 'trimestral', label: 'Trimestral' },
  { id: 'semestral', label: 'Semestral' },
  { id: 'anual', label: 'Anual' },
  { id: 'personalizada', label: 'Personalizada' },
] as const;
