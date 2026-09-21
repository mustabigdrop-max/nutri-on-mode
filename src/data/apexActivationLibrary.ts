// APEX ASSESSMENT PIPELINE — CAMADA 3: ACTIVATE
// Biblioteca de ativação por marcação do checklist. Todo exercício carrega o
// cue de execução obrigatório. Ativação não é treino: carga leve, RPE 4-5,
// pausa isométrica no pico, sem falha, não conta no volume da sessão.

export interface ExercicioAtivacao {
  nome: string;
  prescricao: string;
  cue: string;
}

export interface ProtocoloAtivacao {
  tag: string;
  titulo: string;
  exercicios: ExercicioAtivacao[];
}

export const ATIVACAO_PRINCIPIOS = {
  momento: "Pré-treino, como aquecimento específico do grupo",
  series: "2-3 séries",
  reps: "10-15 repetições",
  carga: "carga leve a moderada",
  pausa: "pausa isométrica de 2-3s no pico de contração",
  descanso: "30-45s entre séries",
  rpe: "RPE 4-5 — recrutar, não fadigar",
  aviso: "Ativação não é treino: sem falha, sem carga alta, não conta no volume da sessão.",
};

const P = (tag: string, titulo: string, exercicios: ExercicioAtivacao[]): ProtocoloAtivacao => ({ tag, titulo, exercicios });
const E = (nome: string, prescricao: string, cue: string): ExercicioAtivacao => ({ nome, prescricao, cue });

export const APEX_ACTIVATION_LIBRARY: ProtocoloAtivacao[] = [
  P("DEFICIT_ATIVACAO_DORSAL_INFERIOR", "Ativação — latíssimo inferior", [
    E("Scapular Pull-Up com banda", "3×8-10", "Puxe o corpo pra cima SÓ com as escápulas, braços retos"),
    E("Straight-Arm Pulldown com pausa 3s", "3×12", "Empurre a barra pro chão com as COSTAS, não com os braços"),
    E("Single-Arm Lat Stretch + isometria", "2×8/lado", "Sinta a costela separando do quadril"),
  ]),
  P("DEFICIT_ATIVACAO_DORSAL", "Ativação — dorsal", [
    E("Band Pull-Apart com depressão escapular", "3×12-15", "Ombros longe das orelhas, escápulas juntas"),
    E("Prone Y-Raise sem carga", "2×12", "Sinta o trapézio inferior entre as escápulas"),
    E("Single-Arm Cable Row isométrico 5s", "2×8/lado", "Cotovelo pra trás e pra baixo, segure e aperte"),
  ]),
  P("COMPENSACAO_TRAPEZIO_SUPERIOR", "Ativação — reprogramar puxada", [
    E("Face Pull com rotação externa", "3×15", "Mãos terminam ao lado das orelhas, cotovelos altos"),
    E("Lat Pulldown com depressão consciente", "3×10", "PRIMEIRO deprima as escápulas, SÓ DEPOIS flexione os cotovelos"),
  ]),
  P("DEFICIT_ATIVACAO_PEITORAL", "Ativação — peitoral", [
    E("Cable Crossover com pausa 3s", "3×12", "Cruze as mãos e APERTE como se abraçasse uma árvore"),
    E("Pec Deck isométrico 5s", "2×8", "Sinta o peito encurtando, não o braço empurrando"),
    E("Push-Up Plus com protração escapular", "2×12", "No topo, empurre o chão pra longe e arredonde as costas"),
  ]),
  P("DEFICIT_ATIVACAO_PEITORAL_SUPERIOR", "Ativação — peitoral clavicular", [
    E("Low Cable Fly (baixo→cima) com pausa 2s", "3×12", "Mãos juntas na frente do ROSTO, não do peito"),
    E("Incline Push-Up com squeeze", "2×15", "Na subida, tente juntar as mãos mentalmente"),
    E("Plate Squeeze Press", "2×12", "A força que mantém os pratos juntos é o peitoral"),
  ]),
  P("DEFICIT_ATIVACAO_DELTOIDE_POSTERIOR", "Ativação — deltoide posterior", [
    E("Reverse Pec Deck com pausa 3s", "3×12", "NÃO aperte as escápulas — pare ANTES, só posterior do ombro"),
    E("Band Pull-Apart na altura do rosto", "3×15", "Cotovelos na altura dos ombros, trapézio NÃO sobe"),
    E("Prone Incline Reverse Fly", "2×12", "Polegares pra cima, levante até sentir o posterior do ombro"),
  ]),
  P("COMPENSACAO_TRAPEZIO_LATERAL", "Ativação — deltoide lateral sem trapézio", [
    E("Elevação lateral com pausa 2s no ponto morto inferior", "3×12", "INICIE o movimento com o ombro, não encolhendo"),
    E("Cable Lateral Raise leve", "2×15", "Cabo cruza na frente do corpo — tensão constante no lateral"),
  ]),
  P("DEFICIT_ATIVACAO_GLUTEO", "Ativação — glúteo máximo", [
    E("Glute Bridge com banda + squeeze 5s", "3×10", "Aperte como se segurasse uma nota entre as nádegas"),
    E("Quadruped Hip Extension", "2×12/lado", "Movimento do QUADRIL, não da lombar — umbigo puxado"),
    E("Pull-Through com corda", "3×12", "O cabo puxa seu quadril pra trás — vença com o glúteo"),
  ]),
  P("AMNESIA_GLUTEA", "Ativação — reconexão glútea", [
    E("Contração isométrica em pé 5s", "3×10", "Aperte o glúteo sem mexer a pelve nem a lombar"),
    E("Glute Bridge unilateral", "2×10/lado", "Se a lombar ativar mais que o glúteo, reduza a amplitude"),
  ]),
  P("DEFICIT_ATIVACAO_GLUTEO_MEDIO", "Ativação — glúteo médio", [
    E("Side-Lying Hip Abduction com pausa 3s", "3×12/lado", "Abertura do quadril, joelho não roda"),
    E("Band Walk / Monster Walk", "2×15 passos/direção", "Passos controlados, quadril baixo"),
    E("Single-Leg Glute Bridge", "2×10/lado", "Se a lombar ativar mais que o glúteo, diminua a amplitude"),
  ]),
  P("DEFICIT_ATIVACAO_POSTERIOR", "Ativação — isquiotibiais", [
    E("Slider Leg Curl / toalha", "3×8-10", "Puxe com o CALCANHAR, sinta o posterior encurtar"),
    E("Single-Leg RDL sem carga", "2×10/lado", "Quadril vai pra trás como uma dobradiça"),
    E("Nordic Curl excêntrico assistido", "3×5 (excêntrico 4-5s)", "DESÇA o mais devagar possível"),
  ]),
  P("DEFICIT_VOLUME_POSTERIOR", "Ativação — isquiotibiais", [
    E("Slider Leg Curl / toalha", "3×8-10", "Puxe com o CALCANHAR, sinta o posterior encurtar"),
    E("Single-Leg RDL sem carga", "2×10/lado", "Quadril vai pra trás como uma dobradiça"),
  ]),
  P("DEFICIT_ATIVACAO_QUAD", "Ativação — quadríceps", [
    E("Terminal Knee Extension (TKE) com banda", "3×15/perna", "Trave o joelho COMPLETAMENTE — sinta a gota do VMO"),
    E("Wall Sit isométrico 90°", "2×30-45s", "Empurre os CALCANHARES no chão, não a ponta dos pés"),
    E("Split Squat com calcanhar elevado", "2×10/lado", "Calcanhar elevado joga mais trabalho pro quadríceps"),
  ]),
  P("DEFICIT_VMO", "Ativação — VMO", [
    E("Terminal Knee Extension (TKE) com banda", "3×15/perna", "Trave o joelho COMPLETAMENTE — sinta a gota do VMO"),
    E("Wall Sit isométrico 90°", "2×30-45s", "Empurre os CALCANHARES no chão, não a ponta dos pés"),
  ]),
  P("DEFICIT_CABECA_LONGA_BICEPS", "Ativação — cabeça longa do bíceps", [
    E("Incline Dumbbell Curl (banco 45-60°)", "2×12", "Braço começa ATRÁS do corpo — pré-alonga a cabeça longa"),
    E("Hammer Curl com pausa 3s no pico", "2×10", "Aperte como se quebrasse uma noz no punho"),
  ]),
  P("DEFICIT_CABECA_LONGA_TRICEPS", "Ativação — cabeça longa do tríceps", [
    E("Overhead Cable Extension com pausa 2s", "3×12", "Sinta o tríceps ESTICANDO na descida e APERTANDO na extensão"),
    E("Diamond Push-Up isométrico 90°", "2×20s", "Cotovelos colados no corpo"),
  ]),
  P("DEFICIT_ATIVACAO_GASTROCNEMIO", "Ativação — gastrocnêmio", [
    E("Single-Leg Calf Raise com pausa 3s + excêntrico 4s", "3×10/lado", "Suba na ponta do DEDÃO, não do dedinho"),
  ]),
  P("DEFICIT_ATIVACAO_SOLEO", "Ativação — sóleo", [
    E("Seated Calf Raise com pausa 3s", "2×15", "Joelho dobrado isola o SÓLEO — mais profundo que em pé"),
  ]),
  P("DEFICIT_VOLUME_PANTURRILHA", "Ativação — panturrilha", [
    E("Single-Leg Calf Raise com pausa 3s + excêntrico 4s", "3×10/lado", "Suba na ponta do DEDÃO, não do dedinho"),
    E("Seated Calf Raise com pausa 3s", "2×15", "Joelho dobrado isola o SÓLEO — mais profundo que em pé"),
  ]),
  P("DEFICIT_ATIVACAO_CORE", "Ativação — core", [
    E("Dead Bug", "2×10/lado", "A lombar NÃO descola do chão"),
    E("Pallof Press isométrico 10s", "3×10s/lado", "O core resiste à rotação — oblíquos e transverso sem se mover"),
    E("Vacuum abdominal", "3×15-20s", "Expire TUDO e puxe o umbigo na direção da coluna"),
  ]),
];

export const APEX_ACTIVATION_BY_TAG: Record<string, ProtocoloAtivacao> = Object.fromEntries(
  APEX_ACTIVATION_LIBRARY.map((p) => [p.tag, p]),
);
