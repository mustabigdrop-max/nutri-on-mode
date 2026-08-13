// Estrutura declarativa da Anamnese nutriON (9 seções)
// Cada seção corresponde a uma coluna JSONB da tabela `anamnesis`.

export type AnamnesisFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "time"
  | "radio"
  | "multi";

export interface AnamnesisField {
  key: string;
  label: string;
  type: AnamnesisFieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  suffix?: string;
  hint?: string;
  /** Mostra o campo apenas se a condição for verdadeira (recebe todos os dados) */
  showIf?: (all: Record<string, any>) => boolean;
}

export interface AnamnesisSection {
  key:
    | "personal"
    | "health_history"
    | "diet_history"
    | "lifestyle"
    | "training"
    | "goals"
    | "digestive"
    | "hormonal"
    | "pharmacology";
  title: string;
  subtitle: string;
  fields: AnamnesisField[];
}

const isFemale = (all: Record<string, any>) =>
  String(all?.personal?.sex || "").toLowerCase() === "feminino";

export const ANAMNESIS_SECTIONS: AnamnesisSection[] = [
  {
    key: "personal",
    title: "Dados pessoais",
    subtitle: "Quem é você",
    fields: [
      { key: "full_name", label: "Nome completo", type: "text", required: true },
      { key: "birth_date", label: "Data de nascimento", type: "date", required: true },
      { key: "sex", label: "Sexo biológico", type: "radio", options: ["Masculino", "Feminino"], required: true },
      { key: "gender_identity", label: "Identidade de gênero (opcional)", type: "text" },
      { key: "phone", label: "Telefone / WhatsApp", type: "text", required: true, placeholder: "(11) 90000-0000" },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "profession", label: "Profissão", type: "text" },
      { key: "city", label: "Cidade / Estado", type: "text" },
      { key: "marital_status", label: "Estado civil", type: "radio", options: ["Solteiro", "Casado/União estável", "Divorciado", "Viúvo"] },
      { key: "children", label: "Tem filhos?", type: "radio", options: ["Não", "Sim"] },
      { key: "children_count", label: "Quantos filhos?", type: "number", showIf: (a) => a?.personal?.children === "Sim" },
      { key: "living", label: "Mora", type: "radio", options: ["Sozinho", "Com parceiro(a)", "Com família", "República/dividido"] },
    ],
  },
  {
    key: "health_history",
    title: "Histórico de saúde",
    subtitle: "Diagnósticos, medicamentos e cirurgias",
    fields: [
      {
        key: "conditions",
        label: "Doenças diagnosticadas",
        type: "multi",
        options: [
          "Diabetes tipo 1", "Diabetes tipo 2", "Hipertensão", "Hipotensão",
          "Colesterol alto", "Triglicerídeos alto", "Hipotireoidismo", "Hipertireoidismo",
          "Hashimoto", "SOP (Ovários Policísticos)", "Resistência à insulina",
          "Esteatose hepática", "Gastrite / Refluxo", "Síndrome do intestino irritável",
          "Doença celíaca", "Anemia", "Depressão / Ansiedade", "Asma",
          "Artrite / Artrose", "Hérnia de disco", "Nenhuma diagnosticada",
        ],
      },
      { key: "other_conditions", label: "Outras doenças ou condições", type: "textarea" },
      { key: "medications", label: "Medicamentos em uso contínuo", type: "textarea", placeholder: "Ex: Levotiroxina 50mcg, Losartana 50mg..." },
      { key: "surgeries", label: "Cirurgias realizadas", type: "textarea", placeholder: "Ex: Bariátrica (2019), Apendicite (2015)..." },
      { key: "has_recent_labs", label: "Tem exames recentes?", type: "radio", options: ["Não", "Sim"] },
      { key: "labs_date", label: "Data dos exames", type: "date", showIf: (a) => a?.health_history?.has_recent_labs === "Sim" },
      {
        key: "family_history",
        label: "Histórico familiar (parentes de 1º grau)",
        type: "multi",
        options: ["Diabetes", "Hipertensão", "Doença cardíaca", "Câncer", "Obesidade", "Tireoide"],
      },
    ],
  },
  {
    key: "diet_history",
    title: "Histórico alimentar",
    subtitle: "Dietas, hábitos e relação com a comida",
    fields: [
      { key: "previous_followups", label: "Já fez acompanhamento nutricional antes?", type: "radio", options: ["Nunca", "Sim, 1 vez", "Sim, 2-3 vezes", "Sim, várias vezes"] },
      { key: "followup_duration", label: "Por quanto tempo?", type: "radio", options: ["< 1 mês", "1-3 meses", "3-6 meses", "6-12 meses", "1+ ano"] },
      { key: "followup_result", label: "Resultado", type: "radio", options: ["Funcionou e manteve", "Funcionou mas voltou ao peso", "Não funcionou"] },
      { key: "previous_diets_count", label: "Quantas dietas restritivas já fez na vida?", type: "radio", options: ["Nenhuma", "1-2", "3-5", "6+"] },
      { key: "lowest_adult_weight", label: "Menor peso adulto", type: "number", suffix: "kg" },
      { key: "lowest_weight_held", label: "Manteve por", type: "radio", options: ["< 1 mês", "1-3 meses", "3-6 meses", "6+ meses"] },
      { key: "highest_adult_weight", label: "Maior peso adulto", type: "number", suffix: "kg" },
      { key: "yoyo_effect", label: "Efeito sanfona?", type: "radio", options: ["Não", "Leve", "Moderado", "Severo"] },
      {
        key: "methods_used",
        label: "Já usou / usa",
        type: "multi",
        options: [
          "Termogênicos", "Shakes substitutos", "Jejum intermitente", "Dieta cetogênica",
          "Low carb", "Dieta da proteína", "Remédio pra emagrecer", "Laxantes",
          "Semaglutida / Ozempic", "Nenhum destes",
        ],
      },
      { key: "current_meals_per_day", label: "Quantas refeições faz por dia atualmente?", type: "radio", options: ["1-2", "3", "4", "5", "6+"] },
      { key: "skips_meals", label: "Pula refeições?", type: "radio", options: ["Não", "Às vezes", "Frequentemente"] },
      { key: "skipped_meal", label: "Qual refeição mais pula?", type: "radio", options: ["Café", "Almoço", "Jantar", "Lanches"] },
      { key: "emotional_eating", label: "Come por ansiedade/emoção?", type: "radio", options: ["Nunca", "Às vezes", "Frequentemente", "Sempre"] },
      { key: "binge_eating", label: "Compulsão alimentar?", type: "radio", options: ["Nunca tive", "Já tive no passado", "Tenho atualmente"] },
      {
        key: "food_relationship",
        label: "Relação com comida",
        type: "radio",
        options: [
          "Saudável — como bem sem culpa",
          "Regular — alguns conflitos",
          "Difícil — culpa, restrição, ciclos",
          "Muito difícil — transtorno alimentar diagnosticado",
        ],
      },
      { key: "loved_foods", label: "Alimentos que AMA (quer no plano)", type: "textarea", placeholder: "Ex: açaí, frango, arroz com feijão, banana..." },
      { key: "hated_foods", label: "Alimentos que ODEIA (não quer no plano)", type: "textarea", placeholder: "Ex: fígado, beterraba, quiabo, peixe..." },
      { key: "trigger_foods", label: "Alimentos gatilho (causam compulsão)", type: "textarea", placeholder: "Ex: chocolate, pizza, sorvete, biscoito..." },
      {
        key: "restrictions",
        label: "Restrições alimentares",
        type: "multi",
        options: ["Lactose", "Glúten", "Frutos do mar", "Amendoim", "Ovo", "Soja", "Vegetariano", "Vegano", "Sem carne vermelha", "Sem porco"],
      },
      { key: "other_restriction", label: "Outra restrição", type: "text" },
      { key: "intolerances", label: "Intolerâncias relatadas", type: "textarea", placeholder: "Ex: FODMAP, histamina, frutose..." },
    ],
  },
  {
    key: "lifestyle",
    title: "Rotina e estilo de vida",
    subtitle: "Sono, trabalho, estresse e cozinha",
    fields: [
      { key: "wake_time", label: "Horário que acorda", type: "time" },
      { key: "sleep_time", label: "Horário que dorme", type: "time" },
      { key: "sleep_hours", label: "Horas de sono médias", type: "number", suffix: "h" },
      {
        key: "sleep_quality",
        label: "Qualidade do sono",
        type: "radio",
        options: [
          "Boa — durmo bem e acordo descansado",
          "Regular — acordo cansado às vezes",
          "Ruim — insônia, sono fragmentado",
          "Péssima — uso medicação pra dormir",
        ],
      },
      { key: "sleep_aids", label: "Usa algo para dormir?", type: "multi", options: ["Melatonina", "Magnésio", "Chás", "Medicamento", "Nada"] },
      { key: "work_type", label: "Tipo de trabalho", type: "radio", options: ["Sedentário (escritório/computador)", "Moderado (em pé, andando)", "Ativo (manual, carregando peso)", "Noturno (turno/plantão)", "Home office"] },
      { key: "sitting_hours", label: "Horas sentado por dia", type: "radio", options: ["< 4h", "4-8h", "8-12h", "12h+"] },
      { key: "stress_level", label: "Nível de estresse atual", type: "radio", options: ["Baixo", "Moderado", "Alto", "Muito alto / Burnout"] },
      { key: "stress_source", label: "Principal fonte de estresse", type: "radio", options: ["Trabalho", "Financeiro", "Relacionamento", "Saúde", "Família", "Outro"] },
      { key: "alcohol", label: "Consumo de álcool", type: "radio", options: ["Não bebe", "Social (1-2x/mês)", "Semanal (1-3 doses)", "Frequente (4+ doses/semana)"] },
      { key: "smoking", label: "Tabagismo", type: "radio", options: ["Não", "Ex-fumante", "Sim"] },
      { key: "caffeine", label: "Consumo de café/cafeína", type: "radio", options: ["Não toma", "1-2 xícaras/dia", "3-4 xícaras/dia", "5+ xícaras/dia"] },
      { key: "water_intake", label: "Ingestão de água atual", type: "radio", options: ["< 1L", "1-2L", "2-3L", "3L+", "Não sei"] },
      { key: "cooking_skill", label: "Habilidade na cozinha", type: "radio", options: ["Não cozinho", "Básico — arroz, ovo, frango", "Intermediário — sigo receitas", "Avançado — cozinho bem"] },
      { key: "meal_prep", label: "Faz meal prep?", type: "radio", options: ["Não", "Às vezes", "Sim, 2-3 dias", "Sim, semana toda"] },
      { key: "eating_out", label: "Refeições fora de casa", type: "radio", options: ["Raro (< 1x/semana)", "1-2x/semana", "3-5x/semana", "Diário"] },
      { key: "who_cooks", label: "Quem cozinha em casa?", type: "radio", options: ["Eu mesmo", "Parceiro(a)", "Mãe/família", "Funcionária", "Delivery/restaurante"] },
      { key: "economic_tier", label: "Condição econômica para alimentação", type: "radio", options: ["Econômico — preciso de opções acessíveis", "Intermediário — mix acessível e premium", "Premium — sem restrição de custo"] },
    ],
  },
  {
    key: "training",
    title: "Treino e atividade física",
    subtitle: "Modalidade, volume e composição corporal",
    fields: [
      { key: "trains", label: "Pratica exercício físico?", type: "radio", options: ["Sim", "Não", "Já pratiquei mas parei"] },
      { key: "modality", label: "Modalidade principal", type: "radio", options: ["Musculação", "CrossFit", "Funcional", "Corrida", "Natação", "Luta", "Outro"] },
      { key: "years_training", label: "Há quanto tempo treina", type: "radio", options: ["< 6 meses", "6-12 meses", "1-2 anos", "2-5 anos", "5-10 anos", "10+ anos"] },
      { key: "frequency", label: "Frequência semanal", type: "radio", options: ["1-2x", "3-4x", "5-6x", "7x"] },
      { key: "training_time", label: "Horário do treino", type: "time" },
      { key: "duration_min", label: "Duração média", type: "number", suffix: "min" },
      { key: "intensity", label: "Intensidade percebida", type: "radio", options: ["Leve — não suo muito", "Moderada — suo bastante", "Alta — chego no limite", "Muito alta — treino pesado"] },
      { key: "does_cardio", label: "Faz cardio?", type: "radio", options: ["Não", "Sim"] },
      { key: "cardio_detail", label: "Cardio: tipo · frequência · duração", type: "text", placeholder: "Ex: esteira · 3x/sem · 30min", showIf: (a) => a?.training?.does_cardio === "Sim" },
      { key: "has_injuries", label: "Tem lesões ou limitações?", type: "radio", options: ["Não", "Sim"] },
      { key: "injuries", label: "Descreva as lesões/limitações", type: "textarea", placeholder: "Ex: dor no ombro direito, hérnia lombar L4-L5...", showIf: (a) => a?.training?.has_injuries === "Sim" },
      { key: "training_goal", label: "Objetivo no treino", type: "radio", options: ["Ganhar massa", "Perder gordura", "Ficar mais forte", "Saúde geral", "Performance esportiva", "Preparação pra competição", "Estética/shape"] },
      { key: "weight", label: "Peso atual", type: "number", suffix: "kg" },
      { key: "height", label: "Altura", type: "number", suffix: "cm" },
      { key: "body_fat", label: "% Gordura (se souber)", type: "number", suffix: "%" },
      { key: "lean_mass", label: "Massa magra (se souber)", type: "number", suffix: "kg" },
      { key: "bf_method", label: "Método de avaliação", type: "radio", options: ["Bioimpedância", "DEXA", "Adipômetro", "Estimativa"] },
      { key: "waist", label: "Cintura", type: "number", suffix: "cm" },
      { key: "hip", label: "Quadril", type: "number", suffix: "cm" },
      { key: "arm_r", label: "Braço D", type: "number", suffix: "cm" },
      { key: "arm_l", label: "Braço E", type: "number", suffix: "cm" },
      { key: "thigh_r", label: "Coxa D", type: "number", suffix: "cm" },
      { key: "thigh_l", label: "Coxa E", type: "number", suffix: "cm" },
      { key: "calf", label: "Panturrilha", type: "number", suffix: "cm" },
      { key: "chest", label: "Tórax", type: "number", suffix: "cm" },
    ],
  },
  {
    key: "goals",
    title: "Objetivos e expectativas",
    subtitle: "Onde você quer chegar",
    fields: [
      {
        key: "main_objective",
        label: "Qual seu objetivo PRINCIPAL?",
        type: "radio",
        required: true,
        options: [
          "Emagrecer / Perder gordura",
          "Ganhar massa muscular",
          "Recomposição (perder gordura e ganhar massa)",
          "Melhorar performance no esporte",
          "Saúde e qualidade de vida",
          "Preparação para competição",
          "Manter o shape atual",
        ],
      },
      { key: "target_weight", label: "Peso desejado (deixe vazio se não tem número)", type: "number", suffix: "kg" },
      { key: "has_deadline", label: "Tem prazo?", type: "radio", options: ["Não — progresso sustentável", "Sim"] },
      { key: "deadline_date", label: "Data alvo", type: "date", showIf: (a) => a?.goals?.has_deadline === "Sim" },
      { key: "event_type", label: "Qual o evento?", type: "radio", options: ["Viagem", "Casamento", "Competição", "Praia/verão", "Foto/ensaio", "Sem evento — só meta pessoal"], showIf: (a) => a?.goals?.has_deadline === "Sim" },
      { key: "motivation", label: "O que te motivou a procurar acompanhamento AGORA?", type: "textarea" },
      { key: "what_failed", label: "Já tentou sozinho? O que não funcionou?", type: "textarea" },
      {
        key: "commitment",
        label: "Nível de comprometimento (honestidade)",
        type: "radio",
        options: [
          "Total — faço tudo que for prescrito",
          "Alto — sigo 80-90% do plano",
          "Médio — preciso de flexibilidade",
          "Baixo — tenho dificuldade com dieta",
        ],
      },
    ],
  },
  {
    key: "digestive",
    title: "Saúde digestiva",
    subtitle: "Intestino, sintomas e diagnósticos",
    fields: [
      { key: "bowel_frequency", label: "Frequência de evacuação", type: "radio", options: ["1-2x/dia — normal", "3+/dia — frequente", "Dia sim dia não", "Irregular — 2-3x/semana"] },
      { key: "stool_consistency", label: "Consistência", type: "radio", options: ["Dura/ressecada", "Normal/formada", "Pastosa/mole", "Líquida frequente"] },
      {
        key: "symptoms",
        label: "Sintomas digestivos",
        type: "multi",
        options: [
          "Distensão abdominal", "Gases excessivos", "Azia / refluxo", "Náusea após comer",
          "Dor abdominal", "Empachamento", "Má digestão de gordura", "Má digestão de carne",
          "Desconforto com laticínios", "Desconforto com glúten/trigo", "Desconforto com feijão/lentilha",
          "Nenhum sintoma",
        ],
      },
      {
        key: "diagnoses",
        label: "Diagnósticos digestivos",
        type: "multi",
        options: [
          "Gastrite", "Úlcera", "Refluxo (DRGE)", "Síndrome do intestino irritável (SII)",
          "Doença de Crohn", "Colite ulcerativa", "Intolerância à lactose (confirmada)",
          "Doença celíaca (confirmada)", "Esteatose hepática", "Nenhuma",
        ],
      },
      { key: "digestive_supplements", label: "Suplementos para digestão", type: "multi", options: ["Probiótico", "Enzimas digestivas", "Glutamina", "Fibra (psyllium, etc.)", "Nenhum"] },
    ],
  },
  {
    key: "hormonal",
    title: "Saúde hormonal e sono",
    subtitle: "Energia, libido e ciclo",
    fields: [
      { key: "energy_pattern", label: "Energia ao longo do dia", type: "radio", options: ["Estável — energia boa o dia todo", "Cai à tarde — crash pós-almoço", "Baixa o dia todo", "Oscila muito"] },
      { key: "libido", label: "Libido atual", type: "radio", options: ["Normal", "Reduzida", "Muito baixa"] },
      { key: "water_retention", label: "Retenção hídrica", type: "radio", options: ["Não percebo", "Leve — pernas/mãos", "Moderada — visível", "Severa"] },
      { key: "hair_nails", label: "Queda de cabelo ou unhas fracas?", type: "radio", options: ["Não", "Leve", "Moderada", "Severa"] },
      {
        key: "menstrual_status",
        label: "Status menstrual",
        type: "radio",
        showIf: isFemale,
        options: [
          "Ciclo regular", "Ciclo irregular", "Amenorreia (sem menstruar há 3+ meses)",
          "Menopausa", "Usa anticoncepcional hormonal", "DIU hormonal",
          "Gestante", "Pós-parto", "Amamentando",
        ],
      },
      { key: "contraceptive", label: "Qual anticoncepcional?", type: "text", showIf: (a) => isFemale(a) && a?.hormonal?.menstrual_status === "Usa anticoncepcional hormonal" },
      { key: "cycle_length", label: "Duração média do ciclo", type: "number", suffix: "dias", showIf: (a) => isFemale(a) && a?.hormonal?.menstrual_status === "Ciclo regular" },
      { key: "last_period", label: "Primeiro dia da última menstruação", type: "date", showIf: (a) => isFemale(a) && String(a?.hormonal?.menstrual_status || "").startsWith("Ciclo") },
      { key: "pms", label: "TPM forte?", type: "radio", options: ["Não", "Sim"], showIf: isFemale },
      { key: "pms_symptoms", label: "Sintomas de TPM", type: "multi", options: ["Inchaço", "Humor", "Fome", "Dor"], showIf: (a) => isFemale(a) && a?.hormonal?.pms === "Sim" },
      { key: "gyn_diagnoses", label: "Diagnósticos ginecológicos", type: "multi", options: ["SOP (Ovários Policísticos)", "Endometriose", "Mioma", "Nenhuma"], showIf: isFemale },
    ],
  },
  {
    key: "pharmacology",
    title: "Suplementação e farmacologia",
    subtitle: "Sigiloso — usado apenas para proteção orgânica",
    fields: [
      {
        key: "supplements_used",
        label: "Suplementos que usa atualmente",
        type: "multi",
        options: [
          "Whey protein", "Creatina", "BCAA / EAA", "Glutamina", "Multivitamínico",
          "Ômega-3", "Vitamina D", "Vitamina C", "Magnésio", "Zinco", "Melatonina",
          "Ashwagandha", "Cafeína / Pré-treino", "Colágeno", "Nenhum suplemento",
        ],
      },
      { key: "supplements_doses", label: "Doses e marcas (opcional)", type: "textarea", placeholder: "Ex: Whey 30g, Creatina 5g, Vit D 4000UI..." },
      {
        key: "uses_pharma",
        label: "Utiliza suporte farmacológico (hormônios, anabolizantes)?",
        type: "radio",
        options: ["Não — Natural", "Sim", "Já usei mas parei"],
        hint: "Esta informação é sigilosa e será usada APENAS para ajustar seu protocolo nutricional com foco em saúde e proteção orgânica. Não será compartilhada com terceiros.",
      },
      { key: "stopped_since", label: "Parou há quanto tempo?", type: "text", showIf: (a) => a?.pharmacology?.uses_pharma === "Já usei mas parei" },
      { key: "description", label: "Descreva o que usa atualmente", type: "textarea", placeholder: "Ex: Testosterona Enantato 300mg/sem, Oxandrolona 20mg...", showIf: (a) => a?.pharmacology?.uses_pharma === "Sim" },
      {
        key: "profile",
        label: "Perfil farmacológico",
        type: "radio",
        showIf: (a) => a?.pharmacology?.uses_pharma === "Sim",
        options: [
          "TRT / Reposição hormonal", "Ciclo leve (1-2 compostos)", "Ciclo moderado (2-3 compostos)",
          "Ciclo avançado (3+ compostos)", "GH / Peptídeos", "SARMs", "PCT / Terapia pós-ciclo",
        ],
      },
      { key: "medical_followup", label: "Faz acompanhamento médico?", type: "radio", options: ["Sim", "Não"] },
      { key: "last_bloodwork", label: "Último exame de sangue", type: "radio", options: ["< 1 mês", "1-3 meses", "3-6 meses", "6+ meses", "Nunca fez"] },
    ],
  },
];

export const TOTAL_SECTIONS = ANAMNESIS_SECTIONS.length;
