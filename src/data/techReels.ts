// 3 Reels de Tecnologia — nutriON (voz do Coach Diogo Mello)
// APEX · PRISM · NutrySync — roteiros prontos para gravação

export interface TechReelFrame {
  time: string;
  onScreen: string;
  speech: string;
  broll: string;
}

export interface TechReel {
  id: "apex" | "prism" | "nutrysync";
  module: string;
  title: string;
  duration: string;
  format: string;
  objective: string;
  color: string;
  postDay: string;
  postTime: string;
  frames: TechReelFrame[];
  caption: string;
  hashtags: string[];
  selfComment: string;
  editingTips: string[];
}

export const TECH_REELS: TechReel[] = [
  {
    id: "apex",
    module: "APEX VISUAL INTELLIGENCE",
    title: "Isso é o que eu faço com 1 foto",
    duration: "35-45s",
    format: "Screen recording + câmera frontal (picture-in-picture no canto inferior direito)",
    objective: "Viralizar (TOFU) — mostrar tecnologia que não existe no mercado",
    color: "#22d3ee",
    postDay: "Dia 2",
    postTime: "19h",
    frames: [
      {
        time: "0-3s",
        onScreen: "1 FOTO",
        speech: "Isso é o que eu faço com UMA foto do meu aluno.",
        broll: "Câmera frontal, olhando na lente, expressão séria. Texto bold branco no centro.",
      },
      {
        time: "3-7s",
        onScreen: "—",
        speech: "Subo a foto...",
        broll: "Tela do APEX: arrastar a foto do cliente pro campo de upload. Deixa a tela falar.",
      },
      {
        time: "7-12s",
        onScreen: "11 LANDMARKS DETECTADOS",
        speech: "...e a inteligência artificial detecta 11 landmarks biomecânicos.",
        broll: "Análise rodando: pontos cyan aparecendo nos ombros, quadril, joelhos e tornozelos. Zoom digital leve.",
      },
      {
        time: "12-18s",
        onScreen: "CADEIAS DE COMPENSAÇÃO",
        speech:
          "Mapeia as cadeias de compensação. Identifica EXATAMENTE onde o corpo está compensando e por quê.",
        broll: "Scroll rápido pelas cadeias — Upper Crossed, cervical, cintura escapular.",
      },
      {
        time: "18-25s",
        onScreen: "TREINO CORRETIVO AUTOMÁTICO",
        speech:
          "E gera o treino corretivo automaticamente. Fase 1: inibir o que tá hiperativo. Fase 2: ativar o que tá inibido. Fase 3: integrar tudo.",
        broll: "Gerador de Sessão Corretiva — Cervical + Ombro, 30 min, fases INIBIR / ATIVAR / INTEGRAR aparecendo.",
      },
      {
        time: "25-32s",
        onScreen: "ANÁLISE DE PALCO NPC/IFBB",
        speech:
          "E analisa o shape pelo padrão NPC e IFBB. O que ganha ponto e o que perde ponto no palco.",
        broll: "Aba Palco: 'Ganha pontos' em verde, 'Perde pontos' em vermelho.",
      },
      {
        time: "32-40s",
        onScreen: "APEX VISUAL INTELLIGENCE → @diogo.mell0 · nutrion.app.br",
        speech:
          "Tudo isso com uma foto. Online. Em segundos. Nenhum estúdio de avaliação presencial do Brasil entrega isso. Isso é o nutriON APEX.",
        broll: "Câmera frontal em tela cheia, olhando direto. Card final com assinatura.",
      },
    ],
    caption: `Isso é o que 1 foto faz no nutriON.

11 landmarks biomecânicos detectados.
Cadeias de compensação mapeadas.
Desvios posturais identificados.
Treino corretivo gerado automaticamente.
Análise de palco com critérios NPC/IFBB.

Com UMA FOTO. Online. Em segundos.

Nenhum estúdio presencial entrega isso.
Nenhum coach do Brasil tem essa tecnologia.

nutriON APEX Visual Intelligence.

Salva esse vídeo. Manda pro seu coach e pergunta se ele faz isso.

@diogo.mell0 · nutrion.app.br`,
    hashtags: [
      "#APEX",
      "#nutriON",
      "#IA",
      "#AnálisePostural",
      "#Biomecânica",
      "#CoachNutricional",
      "#Fitness",
      "#Tecnologia",
      "#IFBB",
      "#MCE",
    ],
    selfComment: "Quer ver como funciona ao vivo? Manda DM 'APEX' que eu te mostro com a SUA foto.",
    editingTips: [
      "CapCut: legendas automáticas (Auto Captions)",
      "Zoom digital leve quando mostrar os landmarks",
      "Transição rápida entre as telas (corte seco)",
      "Música: ambient tech sutil (não compete com a voz)",
      "Thumbnail: frame dos landmarks na foto (impactante)",
    ],
  },
  {
    id: "prism",
    module: "PRISM CONTENT INTELLIGENCE",
    title: "1 foto. 15 conteúdos. 30 segundos.",
    duration: "30-40s",
    format: "Screen recording do SOCIAL ON + câmera frontal nas pontas",
    objective: "Viralizar + atrair profissionais (TOFU/MOFU)",
    color: "#C05BF5",
    postDay: "Dia 3",
    postTime: "11h30",
    frames: [
      {
        time: "0-3s",
        onScreen: "SEM TEMPO PRA POSTAR?",
        speech: "Todo coach reclama que não tem tempo de postar. Olha isso.",
        broll: "Câmera frontal, expressão de 'presta atenção'.",
      },
      {
        time: "3-8s",
        onScreen: "1 FOTO",
        speech: "Subo uma foto...",
        broll: "Screen recording: abrir SOCIAL ON → PRISM / Post Pronto → subir 1 foto sua.",
      },
      {
        time: "8-12s",
        onScreen: "PRISM ANALISANDO...",
        speech: "Seleciono o que quero...",
        broll: "Selecionar Shape/Físico + Viralizar, clicar 'Gerar pacote completo'. Loading de 2-3s.",
      },
      {
        time: "12-20s",
        onScreen: "3 FOTOS EDITADAS → LEGENDA PRONTA → 5 SLIDES → 4 STORIES → HASHTAGS + HORÁRIO",
        speech:
          "E em 30 segundos o sistema entrega: foto editada em 3 versões, legenda pronta, carrossel de 5 slides, 4 stories com sticker, hashtags, horário ideal e self-comment.",
        broll: "Scroll RÁPIDO (1.3x) pelo resultado — cada seção que aparece dispara um texto novo na tela.",
      },
      {
        time: "20-25s",
        onScreen: "1 FOTO = 15 CONTEÚDOS",
        speech: "15 peças de conteúdo. De uma foto. Em 30 segundos.",
        broll: "Resumo do pacote: ✅ 1 foto → 15 peças de conteúdo. Texto grande no centro.",
      },
      {
        time: "25-35s",
        onScreen: "PRISM CONTENT INTELLIGENCE → @diogo.mell0 · nutrion.app.br",
        speech:
          "Se você é coach, personal, nutricionista e não tem tempo de criar conteúdo... agora tem. Isso é o PRISM. Só existe dentro do nutriON.",
        broll: "Volta pra câmera frontal em tela cheia.",
      },
    ],
    caption: `Todo coach fala que não tem tempo de postar.

Agora não tem desculpa.

1 foto. 30 segundos. 15 peças de conteúdo:
✅ Foto editada em 3 versões
✅ Legenda pronta com ciência
✅ Carrossel de 5 slides
✅ 4 frames de Stories com sticker sugerido
✅ 15 hashtags categorizadas
✅ Horário ideal de postagem
✅ Self-comment pronto

Isso é o PRISM Content Intelligence.
Só existe dentro do nutriON.

Se você cria conteúdo fitness e quer produzir em 30 segundos o que leva 1 hora, segue aqui. Ou manda DM "PRISM".

@diogo.mell0 · nutrion.app.br`,
    hashtags: [
      "#PRISM",
      "#nutriON",
      "#SocialMedia",
      "#ContentCreator",
      "#CoachFitness",
      "#MarketingFitness",
      "#IA",
      "#ConteudoFitness",
      "#PersonalTrainer",
    ],
    selfComment: "Qual é o formato que você mais usa? Reel, carrossel ou stories? Comenta 👇",
    editingTips: [
      "O scroll rápido pelo resultado é o momento WOW",
      "Cada seção que aparece = 1 texto na tela novo",
      "Velocidade 1.3x no scroll (parece mais impressionante)",
      "Som: beat tech/futurista no momento que o pacote aparece",
      "Thumbnail: print da tela com '1 FOTO = 15 CONTEÚDOS'",
    ],
  },
  {
    id: "nutrysync",
    module: "NUTRYSYNC",
    title: "Seu treino muda sua dieta. Automaticamente.",
    duration: "25-35s",
    format: "Screen recording do dashboard + câmera frontal",
    objective: "Engajar + converter (MOFU/BOFU)",
    color: "#E8A020",
    postDay: "Dia 1",
    postTime: "12h",
    frames: [
      {
        time: "0-3s",
        onScreen: "TREINOU PERNA?",
        speech: "O que acontece com suas calorias quando você treina perna?",
        broll: "Câmera frontal, pergunta direta na lente.",
      },
      {
        time: "3-6s",
        onScreen: "1.800 KCAL",
        speech: "Aqui tá o plano. 1.800 calorias. Sem ajuste.",
        broll: "NutrySync do cliente: META HOJE 1.800 kcal, AJUSTES +0.",
      },
      {
        time: "6-12s",
        onScreen: "LEGS · 55 MIN",
        speech: "Aí o aluno registra: treino de perna, 55 minutos.",
        broll: "Adicionar atividade → LEGS → 55 min. Mostrar o cálculo MET 6.0 × peso × tempo.",
      },
      {
        time: "12-18s",
        onScreen: "+280 KCAL AUTOMÁTICO",
        speech: "E o sistema ajusta automaticamente. Mais 280 calorias. Macros recalculados. Em tempo real.",
        broll: "AJUSTES +280 kcal, META 1.800 → 2.080. Zoom no número subindo (momento WOW).",
      },
      {
        time: "18-22s",
        onScreen: "31°C → +500ML",
        speech: "E se tá calor lá fora? A água também ajusta.",
        broll: "Hidratação mudando pela temperatura da cidade.",
      },
      {
        time: "22-30s",
        onScreen: "NUTRYSYNC → 1 DE 19 MÓDULOS → @diogo.mell0 · nutrion.app.br",
        speech:
          "Nenhum nutricionista do Brasil ajusta seu plano todo dia. O nutriON ajusta TODA HORA. Isso é NutrySync. E isso é só 1 dos 19 módulos.",
        broll: "Volta pra câmera frontal. Cards finais em sequência.",
      },
    ],
    caption: `Treinou perna? Suas calorias mudam.

Não amanhã. Não na próxima consulta.
AGORA.

O NutrySync detecta:
→ Treino do dia (+280 kcal pra Legs)
→ Temperatura da cidade (+500ml se 31°C)
→ Fase do plano (bulk/cut/recomp)
→ Sono da noite anterior
→ Dia de descanso (-200 kcal)

E recalcula TUDO automaticamente.
Macros. Hidratação. Meta calórica.

Seu nutricionista faz isso?
Pergunta honesta.

Isso é o NutrySync. 1 dos 19 módulos do nutriON.

"Transformação é sistema."

Link na bio. Ou DM "NUTRISYNC".

@diogo.mell0 · nutrion.app.br`,
    hashtags: [
      "#NutrySync",
      "#nutriON",
      "#NutriçãoInteligente",
      "#AjusteAutomático",
      "#IA",
      "#FitnessTech",
      "#CoachNutricional",
      "#PlanoAlimentar",
      "#TreinoDePerna",
      "#LegDay",
    ],
    selfComment: "Quantas kcal você acha que gasta num treino de perna de 1 hora? Comenta 👇",
    editingTips: [
      "O momento WOW é o número mudando de 1.800 → 2.080",
      "Se possível: zoom no número mudando",
      "Corte rápido entre as telas (cada tela 3-5 segundos)",
      "Música: beat que sobe quando o número muda",
      "Thumbnail: 'SEU TREINO MUDA SUA DIETA' com o NutrySync",
    ],
  },
];

export const TECH_REELS_ORDER = [
  {
    day: "Dia 1 (hoje/amanhã)",
    reel: "Reel 3 — NutrySync",
    time: "12h",
    why: "Mais fácil de gravar (só screen recording) e já mostra tecnologia.",
  },
  {
    day: "Dia 2",
    reel: "Reel 1 — APEX",
    time: "19h",
    why: "Os landmarks na foto são o visual mais impactante — maior chance de viralizar.",
  },
  {
    day: "Dia 3",
    reel: "Reel 2 — PRISM",
    time: "11h30",
    why: "Atrai PROFISSIONAIS que viram os 2 primeiros e querem saber mais.",
  },
];

export const TECH_REELS_DM_REPLY = `Fala! Que bom que chamou. 💪

Isso que você viu é o nutriON — o sistema mais completo de coaching nutricional e esportivo do Brasil.

Funciona pra coaches, nutricionistas, personais e treinadores.

Posso te dar 7 dias grátis pra testar com seus alunos. Sem compromisso.

Me conta: você trabalha com quantos alunos hoje?`;

export const techReelScriptText = (r: TechReel) =>
  [
    `ROTEIRO REEL — ${r.module}`,
    `"${r.title}"`,
    `Duração: ${r.duration} · Formato: ${r.format}`,
    `Objetivo: ${r.objective}`,
    "",
    ...r.frames.map(
      (f, i) =>
        `[FRAME ${i + 1} — ${f.time}]\nFALA: ${f.speech}\nTEXTO NA TELA: ${f.onScreen}\nGRAVAÇÃO: ${f.broll}\n`,
    ),
    "──────────────────────────────",
    "LEGENDA:",
    r.caption,
    "",
    r.hashtags.join(" "),
    "",
    "SELF-COMMENT:",
    r.selfComment,
    "",
    "DICAS DE EDIÇÃO:",
    ...r.editingTips.map((t) => `→ ${t}`),
  ].join("\n");
