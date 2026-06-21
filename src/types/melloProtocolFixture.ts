/**
 * ============================================================================
 * Mello Protocol — Fixture (dev/storybook/preview)
 * ============================================================================
 * Dados representativos do "Mello Atualização" para desenvolvimento visual
 * do <MelloProtocolViewer />. NÃO usar em produção.
 * ============================================================================
 */

import type { MelloProtocol } from "./melloProtocol";

export const melloFixture: MelloProtocol = {
  block_overview: {
    title: "Protocolo de Recomposição Mello - Weider Clássico (Semana 1/16)",
    client_name: "Atleta Mello",
    category: "Classic Physique",
    phase: "Recomposição",
    mesocycle_duration_weeks: 16,
    training_frequency_days_per_week: 5,
    split: "Bro Split (Quad+Glúteo / Peito+Tríceps / Costas+Deltóide)",
    progression_model:
      "Sobrecarga progressiva baseada em RIR e adição de séries semanais. Microciclo de 3 sessões repetido com rotação de ênfase. Deload programado na semana 5 com redução de 40% no volume e RIR +2.",
    muscle_priorities: [
      { muscle: "Quadríceps", weekly_sets: 17, priority: "alta", rationale: "Prioridade APEX: ganho de massa em membros inferiores" },
      { muscle: "Glúteos", weekly_sets: 17, priority: "alta", rationale: "Sinergia com quadríceps e posterior, foco estético Classic" },
      { muscle: "Posterior de Coxa", weekly_sets: 14, priority: "alta", rationale: "Equilíbrio anterior/posterior e saúde do joelho" },
      { muscle: "Peito", weekly_sets: 14, priority: "media", rationale: "Volume MAV mantido, foco em região clavicular" },
      { muscle: "Costas", weekly_sets: 16, priority: "alta", rationale: "Densidade de dorsais e linha estética V-taper" },
      { muscle: "Deltóide Lateral", weekly_sets: 14, priority: "alta", rationale: "Largura de ombro - prioridade Classic Physique" },
      { muscle: "Deltóide Posterior", weekly_sets: 24, priority: "alta", rationale: "Compensação postural por restrição rotação interna" },
      { muscle: "Bíceps", weekly_sets: 14, priority: "media", rationale: "Subdose intencional - foco indireto via costas" },
      { muscle: "Tríceps", weekly_sets: 14, priority: "media", rationale: "Pico de braço, foco em cabeça longa" },
    ],
    notes:
      "Protocolo integrado ao APEX da semana — restrição de rotação interna do ombro esquerdo exige cuidado em supinos com pegada fechada. Hiperlordose lombar detectada demanda fortalecimento de core anti-extensão. RIR conservador na semana 1 para calibração de cargas.",
  },
  phase_plan: [
    { week: 1, phase: "Acumulação", intent: "Calibração de cargas e densidade", volume_modifier: "100%", intensity_modifier: "RIR 2-3", is_deload: false },
    { week: 2, phase: "Acumulação", intent: "Aumento progressivo de volume", volume_modifier: "+1 série/exerc", intensity_modifier: "RIR 2", is_deload: false },
    { week: 3, phase: "Intensificação", intent: "Carga máxima da fase", volume_modifier: "+1 série/exerc", intensity_modifier: "RIR 1", is_deload: false },
    { week: 4, phase: "Intensificação", intent: "Pico de volume e intensidade", volume_modifier: "+2 séries/exerc", intensity_modifier: "RIR 0-1", is_deload: false },
    { week: 5, phase: "Deload", intent: "Recuperação supercompensatória", volume_modifier: "-40%", intensity_modifier: "RIR 4", is_deload: true },
  ],
  training_days: [
    {
      day_number: 1,
      title: "Quadríceps & Glúteos (Volume & Técnica)",
      focus: "QUADRÍCEPS · GLÚTEOS · POSTERIOR",
      warmup: [
        { name: "Rotação de Quadril", sets: "2", reps: "10 cada lado", notes: "foco: mobilidade de quadril" },
        { name: "Glute Bridge", sets: "2", reps: "15", notes: "ativação de glúteos" },
        { name: "Bird Dog", sets: "2", reps: "10 cada", notes: "estabilização de core" },
        { name: "Agachamento Goblet leve", sets: "2", reps: "12", notes: "preparação de padrão motor" },
      ],
      exercises: [
        { order: 1, name: "Agachamento Smith com calço", sets: "4", reps: "8-10", rir: "RIR 2", rest_seconds: 180, tempo: "3-0-1-0", technique: "", notes: "Calço sob calcanhar para maior ênfase em quadríceps. Z3." },
        { order: 2, name: "Leg Press 45 (unilateral)", sets: "3", reps: "10-12", rir: "RIR 2", rest_seconds: 120, tempo: "2-0-1-0", technique: "Unilateral", notes: "Misto · ênfase em glúteos com tronco inclinado. Z3." },
        { order: 3, name: "Cadeira Extensora", sets: "4", reps: "12-15", rir: "RIR 1", rest_seconds: 90, tempo: "2-1-1-1", technique: "", notes: "Pausa de 1s na contração máxima." },
        { order: 4, name: "Stiff com halteres", sets: "3", reps: "10-12", rir: "RIR 2", rest_seconds: 120, tempo: "3-0-1-0", technique: "", notes: "Foco em alongamento de posterior, joelhos macios." },
        { order: 5, name: "Cadeira Flexora", sets: "3", reps: "12-15", rir: "RIR 1", rest_seconds: 90, tempo: "2-1-1-0", technique: "", notes: "Última série em rest-pause." },
      ],
      finisher: "Esta sessão foca no volume e técnica de membros inferiores. RIR conservador na semana 1 para estabelecer baseline de cargas.",
    },
    {
      day_number: 2,
      title: "Peito & Tríceps",
      focus: "PEITO · TRÍCEPS · CORE",
      warmup: [
        { name: "Cat-Cow", sets: "2", reps: "10", notes: "mobilidade torácica" },
        { name: "Band Pull-Apart", sets: "2", reps: "15", notes: "ativação posterior" },
        { name: "Push-up", sets: "2", reps: "10", notes: "preparação padrão" },
        { name: "Tríceps com elástico", sets: "2", reps: "15", notes: "pré-ativação" },
      ],
      exercises: [
        { order: 1, name: "Supino Inclinado com halteres", sets: "4", reps: "8-10", rir: "RIR 2", rest_seconds: 180, tempo: "3-0-1-0", technique: "", notes: "Inclinação 30° — região clavicular. Evitar pegada fechada (restrição ombro)." },
        { order: 2, name: "Supino Reto na Máquina", sets: "3", reps: "10-12", rir: "RIR 2", rest_seconds: 120, tempo: "2-0-1-1", technique: "", notes: "Estabilidade priorizada sobre carga máxima." },
        { order: 3, name: "Crucifixo Pec Deck", sets: "3", reps: "12-15", rir: "RIR 1", rest_seconds: 90, tempo: "2-1-1-0", technique: "Drop-set", notes: "Última série em drop-set 2x." },
        { order: 4, name: "Tríceps Pulley corda", sets: "4", reps: "12-15", rir: "RIR 1", rest_seconds: 75, tempo: "2-0-1-1", technique: "", notes: "Pausa de 1s contração máxima." },
        { order: 5, name: "Tríceps Francês unilateral", sets: "3", reps: "10-12", rir: "RIR 2", rest_seconds: 90, tempo: "3-0-1-0", technique: "Unilateral", notes: "Foco em cabeça longa." },
      ],
      finisher: "Sessão de empurrar. Cuidado com restrição de rotação interna no ombro esquerdo.",
    },
    {
      day_number: 3,
      title: "Costas & Deltóides",
      focus: "COSTAS · DELTÓIDES · BÍCEPS",
      warmup: [
        { name: "Dead Hang", sets: "2", reps: "20s", notes: "descompressão" },
        { name: "Scapular Pull-up", sets: "2", reps: "10", notes: "ativação escapular" },
        { name: "Face Pull com elástico", sets: "2", reps: "15", notes: "ativação posterior" },
        { name: "Remada com elástico", sets: "2", reps: "15", notes: "padrão de puxada" },
      ],
      exercises: [
        { order: 1, name: "Puxada Aberta na Polia", sets: "4", reps: "8-10", rir: "RIR 2", rest_seconds: 180, tempo: "2-0-2-0", technique: "", notes: "Pegada pronada, foco em V-taper." },
        { order: 2, name: "Remada Curvada com barra", sets: "3", reps: "10-12", rir: "RIR 2", rest_seconds: 150, tempo: "2-0-1-1", technique: "", notes: "Tronco a 45°, controle excêntrico." },
        { order: 3, name: "Remada Cavalinho", sets: "3", reps: "10-12", rir: "RIR 1", rest_seconds: 120, tempo: "2-0-1-1", technique: "", notes: "Densidade de dorsais médias." },
        { order: 4, name: "Elevação Lateral com halteres", sets: "5", reps: "12-15", rir: "RIR 1", rest_seconds: 60, tempo: "2-0-1-1", technique: "", notes: "Volume alto — largura de ombro prioritária." },
        { order: 5, name: "Face Pull na polia", sets: "4", reps: "15", rir: "RIR 1", rest_seconds: 60, tempo: "2-1-1-1", technique: "", notes: "Compensação postural — manter por toda a fase." },
        { order: 6, name: "Rosca Direta", sets: "3", reps: "10-12", rir: "RIR 1", rest_seconds: 90, tempo: "2-0-1-0", technique: "", notes: "Volume moderado, complemento de costas." },
      ],
      finisher: "Sessão de puxar com foco em densidade e largura. Face Pull obrigatório.",
    },
  ],
  improvement_alerts: [
    "Estabilização Core: A hiperlordose lombar detectada no APEX exige inclusão diária de exercícios anti-extensão (dead bug, plank). Sem isso, a sobrecarga em agachamento e stiff vira fator de risco.",
    "Saúde do Ombro: A rotação interna restrita no ombro esquerdo contraindica supino com pegada fechada e desenvolvimento atrás da nuca. Manter Face Pull em todas as sessões de puxar.",
  ],
};
