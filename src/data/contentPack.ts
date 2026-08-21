// Pack de Conteúdo nutriON — Representatividade + Viral + Vendas
// Voz do Coach Diogo Mello

export interface PackFrame {
  time: string;
  visual: string;
  onScreen?: string;
}

export interface PackItem {
  id: string;
  category: "representatividade" | "pov" | "vendas" | "mindforce";
  title: string;
  subtitle?: string;
  format: string;
  duration: string;
  music?: string;
  frames: PackFrame[];
  notes?: string[];
  caption?: string;
  hashtags?: string[];
  whyItWorks?: string;
  script?: string;
}

export const PACK_CATEGORIES: Record<PackItem["category"], { label: string; color: string; hint: string }> = {
  representatividade: {
    label: "Representatividade",
    color: "#E8A020",
    hint: "Edits que conectam: ancestralidade, paternidade e presença negra.",
  },
  pov: {
    label: "POVs Virais",
    color: "#22d3ee",
    hint: "Fisheye + letras na batida. Formato feito pra alcance (TOFU).",
  },
  vendas: {
    label: "Vender nutriON",
    color: "#4ade80",
    hint: "MOFU/BOFU — mostrar a diferença e converter.",
  },
  mindforce: {
    label: "MindForce Creatina",
    color: "#C05BF5",
    hint: "Nunca vender forçado. Product placement natural + evidência.",
  },
};

export const CONTENT_PACK: PackItem[] = [
  {
    id: "edit-linhagem",
    category: "representatividade",
    title: "Eles Abriram o Caminho",
    subtitle: "A linhagem continua",
    format: "Edit com suas fotos + fotos/vídeos de ícones negros",
    duration: "8-15s",
    music: "Trend em alta (instrumental épico ou hip-hop consciente)",
    frames: [
      { time: "0.0-0.5s", visual: "Lewis Hamilton pilotando" },
      { time: "0.5-1.0s", visual: "Muhammad Ali no ringue" },
      { time: "1.0-1.5s", visual: "Pelé comemorando" },
      { time: "1.5-2.0s", visual: "Michael Jordan voando" },
      { time: "2.0-2.5s", visual: "Usain Bolt cruzando a linha" },
      { time: "2.5-3.5s", visual: "SUA FOTO — shape, pose confiante", onScreen: "A LINHAGEM CONTINUA." },
      { time: "3.5-4.5s", visual: "SUA FOTO com a filha" },
      { time: "4.5-6.0s", visual: "SUA FOTO treino/barra — segura mais", onScreen: "@diogo.mell0" },
    ],
    notes: [
      "Transições: zoom blur sincronizado com a batida",
      "Cada frame cai exatamente na batida da música",
    ],
    caption: `Hamilton na pista. Ali no ringue. Pelé no campo.
Jordan no ar. Bolt na reta.

Homens negros que mudaram a história de quem veio depois.

Eu não compito com eles.
Eu construo o que eles abriram.

Todo dia. Na academia. Na cozinha. Com a minha filha.

A linhagem continua. E nunca vai parar.`,
    hashtags: [
      "#Representatividade",
      "#HomemNegro",
      "#Fitness",
      "#PretosQueInspiram",
      "#MCE",
      "#Bodybuilding",
      "#ForçaNegra",
      "#Pride",
    ],
  },
  {
    id: "edit-meu-pai",
    category: "representatividade",
    title: "Meu Pai Não Teve Isso",
    subtitle: "Edit pessoal + storytelling",
    format: "Edit pessoal com storytelling",
    duration: "10-15s",
    music: "Piano emocional ou lo-fi",
    frames: [
      { time: "0-2s", visual: "Foto/vídeo seu treinando pesado", onScreen: "Meu pai não teve academia." },
      { time: "2-4s", visual: "Foto da sua marmita/comida", onScreen: "Não teve plano alimentar." },
      { time: "4-6s", visual: "Foto sua no celular (nutriON)", onScreen: "Não teve tecnologia." },
      { time: "6-8s", visual: "Foto com a filha", onScreen: "Não teve referência." },
      { time: "8-12s", visual: "Melhor foto de shape", onScreen: "Eu sou a referência que ele não teve." },
      {
        time: "12-15s",
        visual: "Foto rosto confiante",
        onScreen: "Pra ela nunca dizer o mesmo. · @diogo.mell0",
      },
    ],
    caption: `Meu pai não teve academia.
Não teve plano. Não teve coach.
Não teve ninguém dizendo "você pode".

Eu tenho.

E vou construir tão forte que minha filha nunca vai precisar dizer o que eu disse.

O shape é o reflexo.
A disciplina é a herança.`,
    hashtags: [
      "#PaiNegro",
      "#Representatividade",
      "#Herança",
      "#Disciplina",
      "#MCE",
      "#ForçaNegra",
      "#Bodybuilding",
    ],
    whyItWorks:
      "Toca em paternidade + ancestralidade + superação. Público feminino conecta com pai presente negro; público masculino se identifica com a missão.",
  },
  {
    id: "edit-preto-no-topo",
    category: "representatividade",
    title: "Preto no Topo",
    subtitle: "Edit de transição rápido",
    format: "Edit transição rápido com suas fotos",
    duration: "6-10s",
    music: "Trap/hip-hop pesado (beat agressivo)",
    frames: [
      { time: "0-0.3s", visual: "Close rosto sério" },
      { time: "0.3-0.6s", visual: "Shape frente (flash transition)" },
      { time: "0.6-1.0s", visual: "Fazendo barra (fisheye de baixo)" },
      { time: "1.0-1.3s", visual: "Foto com VEMP" },
      { time: "1.3-1.8s", visual: "Shape costas (zoom lento)" },
      { time: "1.8-2.5s", visual: "Andando na rua confiante" },
      { time: "2.5-4.0s", visual: "Com a filha nos ombros", onScreen: "PAI." },
      { time: "4.0-6.0s", visual: "Melhor foto shape — segura", onScreen: "ATLETA. COACH. CEO. · @diogo.mell0" },
    ],
    notes: ["Frames 1 a 5 sem texto — as fotos falam"],
    caption: `Preto. Pai. Atleta. Coach. CEO.

5 palavras. Zero permissão pedida.`,
    hashtags: ["#PretoNoTopo", "#HomemNegro", "#Bodybuilding", "#CEO", "#Pai", "#ForçaNegra"],
  },
  {
    id: "pov-seu-ano",
    category: "pov",
    title: "POV: Você decidiu que esse vai ser seu ano",
    format: "Fisheye de baixo, caminhando/treinando",
    duration: "8-15s",
    music: "Trend em alta (beat motivacional)",
    frames: [
      { time: "Beat 1", visual: "Fisheye de baixo, andando em direção à câmera", onScreen: "POV:" },
      { time: "Beat 2", visual: "Continua caminhando", onScreen: "VOCÊ CANSOU DE COMEÇAR DE NOVO" },
      { time: "Beat 3", visual: "Corte na barra fixa", onScreen: "CANSOU DE DESCULPA" },
      { time: "Beat 4", visual: "Peso na barra", onScreen: "CANSOU DE SEGUNDA-FEIRA" },
      { time: "Beat 5", visual: "Encara a câmera, sério", onScreen: "E DECIDIU QUE ESSE VAI SER SEU ANO. · @diogo.mell0" },
    ],
    notes: [
      "CapCut: Body > Lens > Fisheye (distorção 30-50%)",
      "Letras: Anton ou Impact, brancas com contorno preto grosso (stroke 3px)",
      "Tamanho: 50% da tela, centralizado",
      "Cada texto entra com scale up rápido (0.2s) na batida",
      "Contraste +15, saturação +10",
    ],
    caption: `POV: Você cansou.

De começar toda segunda.
De largar na terça.
De prometer em janeiro.
De desistir em fevereiro.

O corpo que você quer mora na pessoa que você ainda não decidiu ser.

Decida hoje. O sistema faz o resto.

"Transformação é sistema."`,
    hashtags: ["#POV", "#Fitness", "#Motivação", "#Disciplina", "#MCE", "#Treino", "#BodyBuilding"],
  },
  {
    id: "pov-audio-5h",
    category: "pov",
    title: "POV: Seu coach te manda um áudio às 5h da manhã",
    format: "Tela escura → MCE Audio → treino",
    duration: "12-20s",
    music: "Ambient subindo pra beat pesado",
    frames: [
      { time: "0-3s", visual: "Tela preta, alarme tocando 5:00 AM", onScreen: "POV: seu coach te manda um áudio às 5 da manhã" },
      { time: "3-6s", visual: "Colocando o fone, só a luz do celular no rosto. Tela do MCE Audio tocando" },
      { time: "6-8s", visual: "Saindo de casa, ainda escuro (fisheye, ângulo baixo)" },
      { time: "8-15s", visual: "Sequência rápida de treino: barra, peso, corrida", onScreen: "ENQUANTO ELES DORMEM" },
      { time: "15-20s", visual: "Selfie pós-treino, pump, suado", onScreen: "O SISTEMA ACORDA MAIS CEDO. · @diogo.mell0" },
    ],
    caption: `5:00 AM. O alarme toca. O MCE Audio começa.

"Abre os olhos. Não se mexe ainda. Esse segundo vai determinar as próximas 16 horas da sua vida."

Isso é o que meus alunos ouvem toda manhã. Na MINHA voz. 264 áudios. Despertar, pré-treino, corrida, pré-sono.

Enquanto o mercado manda PDF e diz "boa sorte", o nutriON acorda com você.

"Transformação é sistema."`,
    hashtags: ["#MCEAudio", "#5AM", "#DisciplinaReal", "#nutriON", "#CoachNutricional", "#Fitness", "#Treino"],
  },
  {
    id: "pov-unico-negro",
    category: "pov",
    title: "POV: Você é o único negro na academia",
    format: "Fisheye, caminhando na academia",
    duration: "8-12s",
    music: "Trap confiante",
    frames: [
      { time: "0-2s", visual: "Fisheye de baixo, entrando na academia", onScreen: "POV: você é o único negro na academia" },
      { time: "2-4s", visual: "Colocando peso na barra", onScreen: "e o mais forte também." },
      { time: "4-8s", visual: "Treino pesado (agachamento, barra, supino) — sem texto" },
      { time: "8-12s", visual: "Saindo da academia, costas largas", onScreen: "O shape não pede permissão. · @diogo.mell0" },
    ],
    caption: `Único negro na academia.
O mais forte também.

O shape não pede permissão.
Não pede desculpa.
Não espera aprovação.

É construído em silêncio.
E fala por si.`,
    hashtags: ["#Representatividade", "#HomemNegro", "#Fitness", "#ShapeReal", "#ForçaNegra", "#Bodybuilding"],
  },
  {
    id: "venda-split",
    category: "vendas",
    title: "O que meu aluno vê vs o que seu nutricionista manda",
    format: "Tela dividida",
    duration: "15-25s",
    frames: [
      {
        time: "Lado esquerdo",
        visual: "PDF genérico, planilha Excel, texto no WhatsApp — cinza, estático, sem graça",
        onScreen: "SEU NUTRICIONISTA",
      },
      {
        time: "Lado direito",
        visual: "Dashboard animado, NutrySync mudando, MCE Audio tocando, carrossel sendo gerado — colorido e vivo",
        onScreen: "nutriON",
      },
      { time: "Final", visual: "Fecha nos dois lados lado a lado", onScreen: "Qual você escolheria?" },
    ],
    notes: ["CTA: DM 'NUTRION' ou link na bio"],
  },
  {
    id: "venda-antes-depois",
    category: "vendas",
    title: "O Antes e Depois do Meu Método",
    format: "Talking head",
    duration: "30s",
    frames: [{ time: "0-30s", visual: "Talking head, close, luz frontal. Cortes secos a cada frase." }],
    script: `Antes do MCE, eu mandava dieta por WhatsApp.
O aluno seguia 2 semanas e sumia.

Aí eu construí o nutriON.

Agora o sistema acorda com ele.
Ajusta o plano pelo treino dele.
Mede o comportamento dele.
E me avisa quando ele tá prestes a desistir.

Resultado: aderência de 38% pra 91%. Em 8 semanas.

Isso não é coaching. É engenharia de comportamento.

nutrion.app.br · link na bio.`,
  },
  {
    id: "mindforce-verdade",
    category: "mindforce",
    title: "A Creatina que Eu Uso e Por Quê",
    format: "Talking head + produto na mão",
    duration: "30-45s",
    frames: [
      { time: "0-3s", visual: "Close no rosto, hook direto", onScreen: "500+ ESTUDOS" },
      { time: "3-15s", visual: "Falando sobre evidência e pureza do mercado", onScreen: "100% PURA" },
      { time: "15-25s", visual: "Mostra o pote MindForce, gira o rótulo, mostra o laudo", onScreen: "COM LAUDO" },
      { time: "25-30s", visual: "Volta pro close, CTA", onScreen: "5G/DIA · @diogo.mell0" },
    ],
    script: `Vou te falar a verdade sobre creatina que a maioria esconde.

Creatina é o suplemento mais estudado do mundo. Mais de 500 estudos. Consenso: funciona. Mas tem um problema.

90% das creatinas do mercado brasileiro não são 100% puras. Misturam maltodextrina, taurina, ou simplesmente não entregam a dosagem que prometem.

Por isso eu criei a MindForce. 100% monohidratada. Pura. Com laudo. Sem mistura. Sem enganação.

5 gramas por dia. Todo dia. Sem ciclagem. É o que a ciência recomenda.

Se você quer uma creatina que é exatamente o que diz ser, link na bio. MindForce.`,
    caption: `500 estudos. Consenso absoluto. Creatina funciona.

Mas 90% das marcas não são 100% puras.
Misturam maltodextrina pra render mais.
Não mostram laudo. Não provam pureza.

MindForce é diferente:
✅ 100% creatina monohidratada
✅ Com laudo de pureza
✅ Sem misturas
✅ 5g/dia — dose da ciência

Não é marketing. É evidência.

Link na bio. Ou DM "CREATINA".`,
    hashtags: [
      "#MindForce",
      "#Creatina",
      "#Suplemento",
      "#100PorCentoPura",
      "#Fitness",
      "#Bodybuilding",
      "#Evidência",
      "#Ciência",
    ],
  },
  {
    id: "mindforce-placement",
    category: "mindforce",
    title: "Product Placement Natural",
    subtitle: "Rotina matinal (TOFU)",
    format: "Rotina matinal — a creatina aparece, não é vendida",
    duration: "15-20s",
    frames: [
      { time: "1", visual: "Alarme 5:30, acorda" },
      { time: "2", visual: "Faz café (MindForce visível na bancada)" },
      { time: "3", visual: "Coloca MindForce na água (close rápido, 2s)" },
      { time: "4", visual: "Café da manhã (marmita)" },
      { time: "5", visual: "Sai pra treinar" },
      { time: "6", visual: "Treino pesado" },
      { time: "7", visual: "Selfie pump", onScreen: "5:30 AM. Todo dia. Sem negociação." },
    ],
    notes: [
      "A MindForce aparece só no frame 3, por 2 segundos. Sem destaque, sem CTA.",
      "Quem vê pergunta 'que creatina é essa?' nos comentários — aí você responde: 'MindForce. Link na bio.'",
    ],
  },
];

export interface StoryStep {
  step: string;
  visual: string;
  text: string;
  sticker: string;
}

export const MINDFORCE_STORY_SEQUENCE: StoryStep[] = [
  { step: "Story 1", visual: "Foto do pote na bancada + café", text: "O ritual de todo dia.", sticker: "—" },
  { step: "Story 2", visual: "Close colocando na água", text: "5g. Sem ciclagem. Todo dia.", sticker: "—" },
  { step: "Story 3", visual: "Print do laudo de pureza", text: "100% pura. Com prova.", sticker: "—" },
  {
    step: "Story 4",
    visual: "Shape/pump pós-treino",
    text: "O resultado fala.",
    sticker: "Enquete: 'Você usa creatina?' [Sim] [Ainda não]",
  },
  {
    step: "Story 5",
    visual: "Só pra quem respondeu 'Ainda não'",
    text: "Se nunca usou, MindForce é a melhor pra começar. 100% pura. Com laudo. Sem mistura.",
    sticker: "Link: nutrion.app.br/mindforce",
  },
];

export interface PackWeekDay {
  day: string;
  feed: string;
  stories: string;
  goal: string;
}

export const PACK_WEEK: PackWeekDay[] = [
  { day: "Segunda", feed: "🍽️ Carrossel educativo MCE", stories: "8 Stories rotina + 1 MindForce natural", goal: "Engajar" },
  { day: "Terça", feed: "🎬 Reel POV viral fisheye", stories: "8 Stories treino + produto VEMP", goal: "Viralizar" },
  { day: "Quarta", feed: "📱 Reel tecnologia nutriON", stories: "8 Stories comida + bastidor", goal: "Viralizar + converter" },
  { day: "Quinta", feed: "🎬 Edit representatividade negra", stories: "8 Stories pessoal com a filha", goal: "Viralizar + conectar" },
  { day: "Sexta", feed: "🎬 Reel humor/trend", stories: "8 Stories treino + MindForce placement", goal: "Viralizar" },
  { day: "Sábado", feed: "📸 Foto shape + legenda storytelling", stories: "8 Stories bastidor lifestyle + VEMP", goal: "Engajar" },
  { day: "Domingo", feed: "📱 Sequência de venda nutriON", stories: "Resumo da semana MCE", goal: "Vender" },
];

export const packItemText = (i: PackItem) =>
  [
    `${PACK_CATEGORIES[i.category].label.toUpperCase()} — ${i.title}`,
    i.subtitle ? i.subtitle : "",
    `Formato: ${i.format} · Duração: ${i.duration}${i.music ? ` · Música: ${i.music}` : ""}`,
    "",
    ...i.frames.map(
      (f) => `[${f.time}] ${f.visual}${f.onScreen ? `\nTEXTO NA TELA: ${f.onScreen}` : ""}`,
    ),
    i.script ? `\nROTEIRO/FALA:\n${i.script}` : "",
    i.notes?.length ? `\nNOTAS:\n${i.notes.map((n) => `→ ${n}`).join("\n")}` : "",
    i.caption ? `\nLEGENDA:\n${i.caption}` : "",
    i.hashtags?.length ? `\n${i.hashtags.join(" ")}` : "",
    i.whyItWorks ? `\nPOR QUE VIRALIZA: ${i.whyItWorks}` : "",
    "\n@diogo.mell0 · nutrion.app.br",
  ]
    .filter(Boolean)
    .join("\n");
