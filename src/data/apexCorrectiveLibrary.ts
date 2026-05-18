// APEX Visual — Biblioteca Corretiva Completa
// 6 regiões · 4 fases · 3 opções de liberação (foam roller / bola / sem equipamento)

export type Tool = "foam" | "ball" | "none";
export type Phase = 1 | 2 | 3 | 4;

export interface ReleaseOption {
  tool: Tool;
  toolLabel: string;
  available: boolean; // none é sempre true
  protocol: string;
}

export interface Exercise {
  name: string;
  phase: Phase;
  target: string;
  status?: "shortened" | "inhibited";
  releases?: ReleaseOption[]; // só fase 1
  sets?: string;
  repsOrDuration?: string;
  cues?: string[];
  errors?: string[];
  regression?: string;
  progression?: string;
}

export interface Region {
  id: string;
  title: string;
  subtitle: string;
  dominant: string;
  inhibited: string;
  phases: {
    1: Exercise[];
    2: Exercise[];
    3: Exercise[];
    4: Exercise[];
  };
  contraindicated: { item: string; reason: string }[];
}

const NONE_ALWAYS = (protocol: string): ReleaseOption => ({
  tool: "none",
  toolLabel: "Sem equipamento",
  available: true,
  protocol,
});

export const APEX_CORRECTIVE_LIBRARY: Region[] = [
  // ───────────────────── REGIÃO 1 ─────────────────────
  {
    id: "cervical_ombro",
    title: "Cervical + Ombro",
    subtitle: "Upper Crossed Syndrome",
    dominant: "Trapézio superior, levantador da escápula, ECOM, suboccipitais, escalenos, peitoral menor",
    inhibited: "Flexores cervicais profundos, trapézio médio/inferior, romboides, serrátil anterior",
    phases: {
      1: [
        {
          name: "Liberação — Trapézio Superior", phase: 1, target: "Trapézio superior", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "Rolo na base do crânio, inclinar cabeça para o lado contralateral. 60-90s cada lado." },
            { tool: "ball", toolLabel: "Bola de tênis", available: false, protocol: "Encostar na parede, bola entre trapézio e parede, inclinar peso suavemente. 30-60s no ponto de maior tensão cada lado." },
            NONE_ALWAYS("Inclinação cervical contralateral lenta, expiração de 4s. 10 reps cada lado. Variação: mão ipsilateral segura o banco para tração suave."),
          ],
        },
        {
          name: "Liberação — Levantador da Escápula", phase: 1, target: "Levantador da escápula", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "Não se aplica — músculo profundo." },
            { tool: "ball", toolLabel: "Bola de tênis", available: false, protocol: "Ângulo superior da escápula contra parede, inclinar peso progressivamente. 45-60s." },
            NONE_ALWAYS("Rotação cervical contralateral + flexão anterior leve (olhar para axila oposta). Hold 20s, 3x cada lado."),
          ],
        },
        {
          name: "Liberação — Suboccipitais", phase: 1, target: "Suboccipitais", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "Rolo na base do crânio em supino, peso da cabeça como pressão. 60-90s." },
            { tool: "ball", toolLabel: "Bola de tênis", available: false, protocol: "Supino, bola nos suboccipitais, deixar peso da cabeça agir, respiração lenta. 60s." },
            NONE_ALWAYS("Chin tuck lento sustentado — empurrar queixo para trás e para baixo. Hold 5s, 10 reps. Sensação de alongamento na nuca = correto."),
          ],
        },
        {
          name: "Liberação — Peitoral Menor", phase: 1, target: "Peitoral menor", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "Supino sobre rolo longitudinal, braços em T, gravidade alonga. 90s." },
            { tool: "ball", toolLabel: "Bola de tênis", available: false, protocol: "Bola no processo coracoide (2 dedos abaixo da clavícula, lateral), pressão do próprio peso em supino. 45s cada lado." },
            NONE_ALWAYS("Doorway stretch dinâmico — cotovelo a 90°, avançar tórax pela porta. 3x30s. Sem bater no fim da amplitude."),
          ],
        },
        {
          name: "Liberação — ECOM / Escalenos", phase: 1, target: "ECOM e escalenos", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "CONTRAINDICADO — área de carótida. Nunca compressão direta no pescoço." },
            { tool: "ball", toolLabel: "Bola de tênis", available: false, protocol: "CONTRAINDICADO nessa região." },
            NONE_ALWAYS("Rotação + inclinação contralateral com tração manual leve pela própria mão no topo do crânio. 3x20s cada lado. Nunca compressão direta no triângulo anterior do pescoço."),
          ],
        },
      ],
      2: [
        { name: "Chin tuck ativo", phase: 2, target: "Flexores cervicais profundos", status: "inhibited",
          sets: "3", repsOrDuration: "10 reps · hold 5s",
          cues: ["Empurrar queixo para trás (não para baixo)", "Criar 'papada'", "Pescoço neutro, sem extensão"],
          progression: "Chin tuck + retração escapular simultânea" },
        { name: "Stretch escalenos lateral", phase: 2, target: "Escalenos",
          sets: "3", repsOrDuration: "30s cada lado",
          cues: ["Mão ipsilateral segura a borda da cadeira (ancora ombro)", "Inclinar para o oposto + leve rotação contralateral", "Nunca forçar com a mão na cabeça"] },
        { name: "Alongamento peitoral 90-90-90", phase: 2, target: "Peitoral maior/menor",
          sets: "3", repsOrDuration: "45s cada lado",
          cues: ["Antebraço na parede a 90°", "Girar tronco para longe da parede", "Cotovelo na altura do ombro (não acima — evita impingement)", "3 posições: 60° / 90° / 120°"] },
        { name: "Trapézio superior com tração", phase: 2, target: "Trapézio superior",
          sets: "3", repsOrDuration: "30s cada lado",
          cues: ["Mão ipsilateral embaixo da coxa (ancora o ombro)", "Outra mão guia (não força) a inclinação lateral", "Expirar ao chegar no limite"] },
      ],
      3: [
        { name: "Chin tuck + retração escapular", phase: 3, target: "Flexores profundos + trapézio inferior", status: "inhibited",
          sets: "3", repsOrDuration: "15 reps · hold 3s",
          cues: ["Orelhas para longe dos ombros", "Ombros para baixo e para trás simultaneamente"] },
        { name: "Face pull corretivo", phase: 3, target: "Trapézio inferior + rotadores externos",
          sets: "3", repsOrDuration: "15 reps · pausa 2s",
          cues: ["Cable/band na altura dos olhos", "Puxar para a testa dividindo as mãos", "Cotovelos acima dos pulsos no fim"],
          regression: "Sem equipamento: band presa na porta" },
        { name: "Prone Y-T-W", phase: 3, target: "Trapézio médio/inferior + romboides",
          sets: "2", repsOrDuration: "10 reps cada letra",
          cues: ["Decúbito ventral, sem forçar extensão lombar", "Levantar só o suficiente para sentir trapézio inferior"] },
        { name: "Wall slide (serrátil)", phase: 3, target: "Serrátil anterior",
          sets: "3", repsOrDuration: "10 reps",
          cues: ["Antebraços na parede", "Deslizar para cima mantendo escápula colada à caixa torácica", "'Empurrar a parede para longe com os ombros'"],
          progression: "Sobre superfície instável" },
        { name: "Rotação externa com band", phase: 3, target: "Infraespinhal · redondo menor",
          sets: "3", repsOrDuration: "15 cada lado",
          cues: ["Cotovelo colado ao corpo a 90°", "Sem compensar com tronco"],
          regression: "Sem band: livro pesado na mão" },
      ],
      4: [
        { name: "Remada unilateral com supinação", phase: 4, target: "Integração escapular",
          cues: ["Priorizar antes de remada bilateral"] },
        { name: "Pulldown com retração escapular ativa", phase: 4, target: "Integração",
          cues: ["Iniciar movimento com escápulas, não braços"] },
        { name: "Press neutro unilateral", phase: 4, target: "Integração",
          cues: ["Evitar pronação forçada enquanto UCS ativa"] },
        { name: "Face pull como aquecimento", phase: 4, target: "Pré-empurrar",
          cues: ["Obrigatório antes de qualquer exercício de empurrar"] },
      ],
    },
    contraindicated: [
      { item: "Desenvolvimento por trás da nuca", reason: "Impingement subacromial + compressão C5-C6" },
      { item: "Pulley por trás da nuca", reason: "Extensão cervical forçada + impingement" },
      { item: "Remada alta", reason: "Elevação do ombro reforça dominância do trapézio superior" },
      { item: "Supino pegada larga + pronação agressiva", reason: "Anterioriza ainda mais a cabeça do úmero" },
      { item: "Encolhimento de ombros com carga", reason: "Reforça dominância do trapézio superior encurtado" },
    ],
  },

  // ───────────────────── REGIÃO 2 ─────────────────────
  {
    id: "toracica",
    title: "Coluna Torácica",
    subtitle: "Cifose + Hipomobilidade Torácica",
    dominant: "Peitoral maior, peitoral menor, eretores torácicos superficiais encurtados",
    inhibited: "Extensores torácicos profundos, multífido torácico, romboides, trapézio médio",
    phases: {
      1: [
        {
          name: "Liberação — Eretores torácicos / peitoral", phase: 1, target: "Eretores torácicos · peitoral maior", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "Perpendicular à coluna em T4-T8, braços cruzados no peito, extensão sobre o rolo, 3-5s por segmento, progredir T12→T1. Nunca em região lombar com extensão." },
            { tool: "ball", toolLabel: "Bola de tênis ('peanut')", available: false, protocol: "Duas bolas de tênis dentro de uma meia. Posicionar nos paravertebrais torácicos bilateralmente, extensão suave em supino. 60s por segmento. Custo zero." },
            NONE_ALWAYS("Extensão torácica sobre encosto de cadeira — encosto no ápice da cifose, braços cruzados no peito, extensão lenta. 10 reps x 3 posições (alta/média/baixa)."),
          ],
        },
      ],
      2: [
        { name: "Extensão torácica sobre rolo/cadeira", phase: 2, target: "Mobilidade extensão torácica",
          sets: "3", repsOrDuration: "10 extensões lentas + hold 3s",
          cues: ["Custo zero: encosto de cadeira comum funciona"] },
        { name: "Thread the needle (rotação torácica)", phase: 2, target: "Rotação torácica",
          sets: "3", repsOrDuration: "10 cada lado",
          cues: ["Em 4 apoios, passar braço por baixo do corpo seguindo com o olhar", "Voltar lentamente"] },
        { name: "Doorway stretch torácico", phase: 2, target: "Peitoral",
          sets: "3", repsOrDuration: "30s",
          cues: ["Mãos na lateral da porta à altura do peito", "Avançar tórax para dentro da porta", "Escápulas neutras"] },
        { name: "Posição passiva sobre rolo/toalha longitudinal", phase: 2, target: "Extensão torácica passiva",
          sets: "1", repsOrDuration: "2 min",
          cues: ["Alternativa custo zero: toalha de banho enrolada (15-20cm de diâmetro)"] },
      ],
      3: [
        { name: "Prone cobra", phase: 3, target: "Extensores torácicos", status: "inhibited",
          sets: "3", repsOrDuration: "10 reps · hold 3s",
          cues: ["Decúbito ventral, braços ao longo do corpo", "Levantar tórax SEM usar lombar", "Foco em extensores torácicos"] },
        { name: "Prone Y-T-W", phase: 3, target: "Trapézio médio/inferior · romboides",
          sets: "2", repsOrDuration: "10 cada letra" },
        { name: "Remada baixa com retração e depressão", phase: 3, target: "Retratores escapulares",
          sets: "3", repsOrDuration: "12 · pausa 2s",
          regression: "Band presa na porta" },
      ],
      4: [
        { name: "Agachamento goblet", phase: 4, target: "Integração com torácica ereta",
          cues: ["Foco em manter torácica ereta durante todo o movimento"] },
        { name: "Overhead press", phase: 4, target: "Integração",
          cues: ["Mobilidade torácica como pré-requisito checado antes de cada set"] },
        { name: "Deadlift", phase: 4, target: "Integração",
          cues: ["Cue 'tórax orgulhoso'"] },
      ],
    },
    contraindicated: [
      { item: "Agachamento barra alta sem mobilidade torácica prévia", reason: "Compensa com lombar" },
      { item: "Overhead com cifose ativa", reason: "Risco de impingement" },
      { item: "Remada com arqueamento lombar excessivo", reason: "Compensa torácica rígida" },
    ],
  },

  // ───────────────────── REGIÃO 3 ─────────────────────
  {
    id: "quadril_lombar",
    title: "Quadril · Pelve · Lombar",
    subtitle: "Lower Crossed Syndrome",
    dominant: "Iliopsoas, reto femoral, TFL, piriforme, quadrado lombar, eretores lombares superficiais",
    inhibited: "Glúteo máximo, glúteo médio, transverso abdominal, multífido lombar, isquiotibiais proximais",
    phases: {
      1: [
        {
          name: "Liberação — TFL / IT Band", phase: 1, target: "TFL · banda iliotibial", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "Deitado de lado, rolo na lateral da coxa do quadril ao joelho. 90s cada lado. Parar nos pontos de tensão máxima." },
            { tool: "ball", toolLabel: "Bola de tênis", available: false, protocol: "Sentado na borda da cadeira, bola sob o TFL (lateral superior da coxa), peso do próprio corpo. 45s cada lado." },
            NONE_ALWAYS("Pigeon standing — cruzamento de pernas em pé, rotação interna lenta do quadril. 10 reps + hold 3s cada lado."),
          ],
        },
        {
          name: "Liberação — Iliopsoas", phase: 1, target: "Iliopsoas", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "Decúbito ventral, rolo oblíquo na região inguinal (diagonal quadril↔umbigo). NÃO pressionar coluna. Rotação lenta do quadril sobre o rolo. 60s." },
            { tool: "ball", toolLabel: "Bola de tênis", available: false, protocol: "Mesma posição, bola na região inguinal, peso em decúbito ventral. 45s cada lado." },
            NONE_ALWAYS("Lunges estáticos com retificação da pelve (anteversão→neutra). 10 reps lentas. Sentir alongamento inguinal na perna de trás."),
          ],
        },
        {
          name: "Liberação — Piriforme", phase: 1, target: "Piriforme", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "Sentado no rolo, figura 4, inclinar peso para o lado afetado. 90s cada lado." },
            { tool: "ball", toolLabel: "Bola de tênis", available: false, protocol: "Sentar sobre bola no meio do glúteo (não na isquiática), figura 4, pressão progressiva. 60s cada lado." },
            NONE_ALWAYS("Figura 4 em supino — puxar joelho em direção ao ombro oposto, respiração lenta. Hold 30s x3 cada lado."),
          ],
        },
        {
          name: "Liberação — Quadrado Lombar", phase: 1, target: "Quadrado lombar", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "De lado, rolo entre crista ilíaca e última costela, rolamento lento. 60s cada lado." },
            { tool: "ball", toolLabel: "Bola de tênis", available: false, protocol: "Em pé, bola entre as costas e a parede no quadrado lombar, agachar levemente para rolar. 45s." },
            NONE_ALWAYS("Inclinação lateral com tração — uma mão na parede, inclinação contralateral lenta com expiração. 10x cada lado."),
          ],
        },
      ],
      2: [
        { name: "Knight lunge (iliopsoas 90/90)", phase: 2, target: "Iliopsoas",
          sets: "3", repsOrDuration: "45s cada lado",
          cues: ["Joelho traseiro no chão (joelheira/toalha)", "Avançar quadril para frente com pelve neutra (não em anteversão)", "Braço ipsilateral acima da cabeça amplifica"],
          progression: "Adicionar rotação de tronco" },
        { name: "Thomas test stretch", phase: 2, target: "Iliopsoas · TFL",
          sets: "3", repsOrDuration: "45s cada lado",
          cues: ["Sentar borda da cama, deitar puxando um joelho ao peito, deixar a outra perna cair", "Joelho livre acima da horizontal = iliopsoas encurtado", "Perna abduz = TFL"] },
        { name: "Figura 4 em supino", phase: 2, target: "Piriforme",
          sets: "3", repsOrDuration: "40s cada lado" },
        { name: "Hip 90/90", phase: 2, target: "Mobilidade quadril",
          sets: "3", repsOrDuration: "10 transições lentas",
          cues: ["Ambas pernas em 90° (frente e atrás)", "Alternar lados sem usar as mãos"] },
        { name: "Flexão lombar descompressiva", phase: 2, target: "Eretores lombares",
          sets: "2", repsOrDuration: "60s",
          cues: ["Posição fetal em supino (joelhos ao peito), rolamento suave", "Alternativa: child's pose"] },
      ],
      3: [
        { name: "Ponte glútea isométrica", phase: 3, target: "Glúteo máximo", status: "inhibited",
          sets: "3", repsOrDuration: "15 · hold 3s no topo",
          cues: ["Iniciar contração pelo glúteo (não isquiotibiais)", "'Apertar uma laranja entre as nádegas no topo'"],
          progression: "1 perna só → band acima dos joelhos → pés elevados em banco" },
        { name: "Clamshell com band", phase: 3, target: "Glúteo médio",
          sets: "3", repsOrDuration: "20 cada lado",
          cues: ["Deitado de lado, quadris 45°, joelhos 90°", "Abrir joelho superior sem mover quadril"],
          regression: "Sem band: mais lento, pausa isométrica 2s no topo" },
        { name: "Bird dog", phase: 3, target: "Estabilização lombo-pélvica",
          sets: "3", repsOrDuration: "10 cada lado · hold 3s",
          cues: ["Pelve absolutamente neutra", "'Copo d'água nas costas — não pode derramar'"] },
        { name: "Dead bug", phase: 3, target: "Transverso · estabilização",
          sets: "3", repsOrDuration: "10 cada lado",
          cues: ["Lombar colada ao chão durante TODO o movimento"],
          regression: "Só os braços", progression: "Pesos nos pés" },
        { name: "Drawing in + respiração (transverso)", phase: 3, target: "Transverso abdominal",
          sets: "3", repsOrDuration: "10 · hold 5s respirando",
          cues: ["Expirar completamente e 'sugar' umbigo para dentro/cima", "Manter respiração normal com transverso ativado"] },
        { name: "Lateral band walk", phase: 3, target: "Glúteo médio",
          sets: "3", repsOrDuration: "15 passos cada direção",
          cues: ["Band acima dos joelhos", "Agachamento parcial, sem inclinar o tronco"],
          regression: "Sem band: resistência manual na lateral do joelho" },
      ],
      4: [
        { name: "Hip thrust com band acima dos joelhos", phase: 4, target: "Glúteo máximo + médio" },
        { name: "Agachamento goblet", phase: 4, target: "Integração", cues: ["Cueing de glúteo ativo"] },
        { name: "RDL romeno", phase: 4, target: "Cadeia posterior",
          cues: ["'Empurrar o chão para trás com os calcanhares'"] },
        { name: "Step up unilateral", phase: 4, target: "Unilateral", cues: ["Controle de valgo"] },
      ],
    },
    contraindicated: [
      { item: "Leg press com amplitude excessiva (joelho acima do umbigo)", reason: "Força retroversão pélvica agressiva com glúteo inibido" },
      { item: "Stiff sem ativação glútea pré-confirmada", reason: "Isquiotibiais dominam e reforçam o padrão" },
      { item: "Extensora lombar em hiperextensão", reason: "Reforça dominância dos eretores superficiais" },
      { item: "Agachamento profundo sem mobilidade de tornozelo + força glútea", reason: "Compensação total" },
      { item: "Exercícios de 'lombar' em máquina", reason: "Reforça eretores já dominantes" },
    ],
  },

  // ───────────────────── REGIÃO 4 ─────────────────────
  {
    id: "joelho",
    title: "Joelho",
    subtitle: "Valgo Funcional",
    dominant: "TFL, adutores (médio e longo), gastrocnêmio medial, bíceps femoral",
    inhibited: "Glúteo médio, VMO (vasto medial oblíquo), tibial posterior, glúteo máximo",
    phases: {
      1: [
        {
          name: "Liberação — Adutores", phase: 1, target: "Adutores", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "Decúbito ventral, rolo na face interna da coxa, rolamento lento. 90s cada lado." },
            { tool: "ball", toolLabel: "Bola de tênis", available: false, protocol: "Sentado, bola na face interna da coxa (médio/longo adutor). 45s cada lado." },
            NONE_ALWAYS("Separação ativa das pernas em supino contra resistência manual própria — mãos nas faces internas dos joelhos. 10 reps de contração-relaxamento."),
          ],
        },
        {
          name: "Liberação — Gastrocnêmio / Sóleo", phase: 1, target: "Panturrilha", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "Panturrilha sobre o rolo, cruzar uma perna para aumentar pressão. 90s cada lado." },
            { tool: "ball", toolLabel: "Bola de tênis", available: false, protocol: "Sentado, bola sob a panturrilha, elevar/abaixar peso lentamente ou pressão estática. 60s cada lado." },
            NONE_ALWAYS("Stretching ativo de panturrilha na borda de um degrau (dorsiflexão máxima). Leve flexão de joelho atinge sóleo. Hold 30s x3."),
          ],
        },
      ],
      2: [
        { name: "Borboleta (adutores)", phase: 2, target: "Adutores",
          sets: "3", repsOrDuration: "45s",
          cues: ["Sola dos pés juntos, inclinar tronco à frente", "Não empurrar joelhos com as mãos — deixar peso agir"] },
        { name: "Knee-to-wall (mobilidade tornozelo)", phase: 2, target: "Dorsiflexão",
          sets: "3", repsOrDuration: "10 cada lado",
          cues: ["Pé apoiado totalmente, joelho sobre o 5° dedo sem levantar calcanhar", "Meta: ≥10cm joelho-parede"] },
        { name: "Pigeon stretch", phase: 2, target: "Glúteo profundo · piriforme",
          sets: "3", repsOrDuration: "45s cada lado" },
      ],
      3: [
        { name: "Clamshell", phase: 3, target: "Glúteo médio", status: "inhibited",
          sets: "3", repsOrDuration: "20 cada lado" },
        { name: "Lateral band walk", phase: 3, target: "Glúteo médio",
          sets: "3", repsOrDuration: "15 passos cada direção" },
        { name: "Terminal knee extension (TKE)", phase: 3, target: "VMO",
          sets: "3", repsOrDuration: "20 cada lado",
          cues: ["Band atrás do joelho, extensão final (últimos 10°) com foco no VMO"],
          regression: "Sem band: extensão unilateral leve sentado na borda da cadeira" },
        { name: "Single leg balance progressivo", phase: 3, target: "Estabilização",
          sets: "3", repsOrDuration: "30s cada lado",
          progression: "Olhos fechados → superfície instável → perturbação manual" },
      ],
      4: [
        { name: "Step down excêntrico", phase: 4, target: "Controle de valgo (principal)",
          sets: "3", repsOrDuration: "10 cada lado · descer em 3s",
          cues: ["Joelho rastreia sobre o 2° dedo durante TODA a descida"] },
        { name: "Búlgaro com band acima dos joelhos", phase: 4, target: "Unilateral" },
        { name: "Single leg squat com espelho", phase: 4, target: "Feedback visual de valgo" },
      ],
    },
    contraindicated: [
      { item: "Qualquer salto sem padrão de aterrissagem correto", reason: "Reforça valgo dinâmico" },
      { item: "Corrida sem correção do valgo ativo", reason: "Reforça padrão disfuncional" },
      { item: "Agachamento sumô sem controle de quadril", reason: "Adutores dominam, glúteo médio inibido" },
      { item: "Leg press com pés muito abertos sem força glútea estabelecida", reason: "Adutores compensam" },
    ],
  },

  // ───────────────────── REGIÃO 5 ─────────────────────
  {
    id: "tornozelo_pe",
    title: "Tornozelo · Pé",
    subtitle: "Hiperpronação + Restrição de Dorsiflexão",
    dominant: "Perôneos, gastrocnêmio, sóleo, flexores dos dedos",
    inhibited: "Tibial posterior, tibial anterior, intrínsecos do pé",
    phases: {
      1: [
        {
          name: "Liberação — Perôneos", phase: 1, target: "Perôneos (face lateral da perna)", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "Face lateral da perna, entre cabeça da fíbula e maléolo lateral. 60s." },
            { tool: "ball", toolLabel: "Bola de tênis", available: false, protocol: "Sentado, bola na face lateral da perna, pressão com a mão contralateral. 45s." },
            NONE_ALWAYS("Inversão ativa do pé contra resistência manual leve (mão no bordo lateral do pé). 10 reps contração-relaxamento."),
          ],
        },
        {
          name: "Liberação — Fáscia plantar", phase: 1, target: "Fáscia plantar", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "Não se aplica." },
            { tool: "ball", toolLabel: "Bola de tênis / golfe", available: false, protocol: "PISAR sobre a bola, rolamento do calcanhar aos dedos, pressão progressiva. 60-90s cada pé. Alternativa custo zero: garrafa PET gelada." },
            NONE_ALWAYS("Extensão dos dedos em pé — levantar só o dedão mantendo os outros no chão e vice-versa. 10 reps cada padrão."),
          ],
        },
      ],
      2: [
        { name: "Panturrilha no degrau (joelho estendido)", phase: 2, target: "Gastrocnêmio",
          sets: "3", repsOrDuration: "45s cada lado" },
        { name: "Panturrilha no degrau (joelho flexionado)", phase: 2, target: "Sóleo",
          sets: "3", repsOrDuration: "45s cada lado" },
        { name: "Knee-to-wall", phase: 2, target: "Dorsiflexão",
          sets: "3", repsOrDuration: "10 reps cada lado" },
        { name: "Windlass stretch", phase: 2, target: "Mecanismo do arco plantar",
          sets: "3", repsOrDuration: "30s",
          cues: ["Extensão passiva dos dedos ativa o mecanismo de arco"] },
      ],
      3: [
        { name: "Towel scrunches", phase: 3, target: "Intrínsecos do pé", status: "inhibited",
          sets: "3", repsOrDuration: "20 contrações",
          cues: ["Amassar toalha com os dedos", "Custo zero"] },
        { name: "Short foot exercise", phase: 3, target: "Arco plantar ativo",
          sets: "3", repsOrDuration: "15 · hold 3s",
          cues: ["'Encurtar' o pé puxando a cabeça do 1° metatarso em direção ao calcanhar", "Criar arco SEM flexionar os dedos"] },
        { name: "Tibial posterior — inversão com band", phase: 3, target: "Tibial posterior",
          sets: "3", repsOrDuration: "15 cada lado",
          regression: "Sem band: inversão ativa contra resistência da mão contralateral" },
        { name: "Elevação unilateral excêntrica de panturrilha", phase: 3, target: "Tríceps sural",
          sets: "3", repsOrDuration: "15 (subir 2 pernas, descer 1)" },
      ],
      4: [
        { name: "Single leg balance", phase: 4, target: "Integração proprioceptiva" },
        { name: "Agachamento unilateral com foco no arco plantar", phase: 4, target: "Integração" },
        { name: "Aterrissagem de salto com short foot ativo", phase: 4, target: "Integração pliométrica" },
      ],
    },
    contraindicated: [],
  },

  // ───────────────────── REGIÃO 6 ─────────────────────
  {
    id: "core",
    title: "Core · Estabilização Profunda",
    subtitle: "Padrão respiratório + transverso",
    dominant: "Reto abdominal, oblíquos superficiais, eretores lombares superficiais, psoas (como flexor de tronco)",
    inhibited: "Transverso abdominal, multífido, assoalho pélvico, diafragma",
    phases: {
      1: [
        {
          name: "Liberação — Reto abdominal / oblíquos", phase: 1, target: "Reto · oblíquos superficiais", status: "shortened",
          releases: [
            { tool: "foam", toolLabel: "Foam roller", available: false, protocol: "Não indicado para inibição direta." },
            { tool: "ball", toolLabel: "Bola de tênis", available: false, protocol: "Supino, bola nos pontos gatilho do reto abdominal (2-3cm lateral ao umbigo), pressão leve. 30-45s." },
            NONE_ALWAYS("Respiração diafragmática 360° — mão no abdômen, mão nas costelas laterais, inspirar expandindo LATERALMENTE (não para cima), expirar completamente. 10 respirações lentas. Downregula reto abdominal e ativa transverso."),
          ],
        },
      ],
      2: [], // sem fase de alongamento — vai direto para ativação
      3: [
        { name: "Drawing in com respiração", phase: 3, target: "Transverso abdominal", status: "inhibited",
          sets: "3", repsOrDuration: "10 · hold 5s",
          cues: ["Expirar e 'afundar' umbigo para dentro/cima", "Manter respiração normal com transverso ativado"] },
        { name: "Dead bug", phase: 3, target: "Estabilização",
          sets: "3", repsOrDuration: "10 cada lado",
          regression: "Apenas braços", progression: "Pesos nos pés" },
        { name: "Pallof press (anti-rotação)", phase: 3, target: "Anti-rotação",
          sets: "3", repsOrDuration: "12 cada lado",
          cues: ["Empurrar para frente e voltar sem que o tronco gire", "Zero rotação = correto"],
          regression: "Sem band: farmer's carry unilateral focando anti-lateral-flexão" },
        { name: "Plank com ativação de transverso", phase: 3, target: "Estabilização global",
          sets: "3", repsOrDuration: "20-30s",
          cues: ["Ativar transverso ANTES de subir", "'Afundar umbigo para a coluna'", "Não empinar glúteo"] },
        { name: "McGill Big 3 — Bird dog", phase: 3, target: "Segurança lombar",
          sets: "3", repsOrDuration: "10 cada lado" },
        { name: "McGill Big 3 — Curl up", phase: 3, target: "Reto sem flexão lombar",
          sets: "3", repsOrDuration: "10",
          cues: ["NÃO é crunch — cabeça levanta 2-3cm apenas", "Lombar em neutro"] },
        { name: "McGill Big 3 — Side bridge", phase: 3, target: "Quadrado lombar funcional",
          sets: "3", repsOrDuration: "10-20s cada lado" },
      ],
      4: [
        { name: "Composto com transverso ativo", phase: 4, target: "Integração",
          cues: ["Ativar transverso antes de cada execução"] },
        { name: "Respiração mantida na concêntrica", phase: 4, target: "Padrão respiratório",
          cues: ["Nunca prender o ar para compensar core fraco"] },
        { name: "Farmer's carry bilateral e unilateral", phase: 4, target: "Carga sob respiração" },
        { name: "Pallof press em agachamento", phase: 4, target: "Anti-rotação sob carga axial" },
      ],
    },
    contraindicated: [
      { item: "Crunch com carga", reason: "Reforça reto sobre transverso" },
      { item: "Sit-up completo", reason: "Substituir por dead bug" },
      { item: "Extensora lombar em máquina", reason: "Eretores superficiais já dominantes ficam mais dominantes" },
      { item: "Carga compressiva axial sem estabilização profunda prévia", reason: "Risco lombar" },
    ],
  },
];

export const PHASE_META: Record<Phase, { label: string; color: string; hint: string }> = {
  1: { label: "Inibir",   color: "#D94040", hint: "Liberação miofascial / inibição neural — 3 opções por ferramenta" },
  2: { label: "Alongar",  color: "#C47A15", hint: "Alongamento dos músculos encurtados" },
  3: { label: "Ativar",   color: "#0F8A63", hint: "Ativação dos músculos inibidos" },
  4: { label: "Integrar", color: "#534AB7", hint: "Integração no padrão de movimento global" },
};
