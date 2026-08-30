// Kit de Palestra — módulos de conversão: demos ao vivo, estratégia de DM,
// funil pós-palestra, ofertas por público, kit de conteúdo, checklist e ZIP.
// Tudo determinístico (sem geração externa) pra sair pronto junto do roteiro.

import { LectureKit, LectureSlide, TYPE_LABEL, totalMinutes } from "@/lib/lectureKit";

const uid = () => Math.random().toString(36).slice(2, 10);

/* ─────────────────────────  DEMOS AO VIVO  ───────────────────────── */

export interface DemoSpec {
  titulo: string;
  abrir: string;
  mostrar: string;
  falar: string;
  backup: string;
  tempoMin: number;
  after: "MCE" | "MENTALIDADE" | "FIM" | "META";
}

export const DEMOS: DemoSpec[] = [
  {
    titulo: "DEMO 1 — MCE Intelligence ao vivo",
    abrir: "nutrion.app.br/mce",
    mostrar: "Os 3 anéis (Mentalidade · MCE Score · Execução) e o Protocolo 24H com os 5 blocos — marcar 1 item ao vivo na frente da plateia.",
    falar: "Esses são meus scores reais. O sistema mede. Todo dia.",
    backup: "Se a internet cair: abrir o screenshot da tela do MCE salvo no celular e espelhar no projetor.",
    tempoMin: 4,
    after: "MCE",
  },
  {
    titulo: "DEMO 2 — Diagnóstico ao vivo com voluntário",
    abrir: "nutrion.app.br/mce (seção Diagnóstico)",
    mostrar: "Chamar 1 voluntário da plateia, fazer as perguntas ao vivo e ajustar os sliders com as respostas dele.",
    falar: "Em 2 minutos eu diagnostiquei onde está o problema. Antes de prescrever treino, eu sei se o cliente acredita que é capaz.",
    backup: "Se a internet cair: fazer o diagnóstico no quadro/flipchart com as mesmas 3 perguntas.",
    tempoMin: 5,
    after: "MENTALIDADE",
  },
  {
    titulo: "DEMO 3 — Social ON gerando conteúdo",
    abrir: "nutrion.app.br/coach/social",
    mostrar: "Digitar o tema desta palestra e gerar o conteúdo ao vivo — mostrar hook, copy e hashtags saindo na tela.",
    falar: "Essa palestra que dei agora vira 5 posts amanhã. O sistema gera tudo.",
    backup: "Se a internet cair: mostrar o screenshot do último conteúdo gerado.",
    tempoMin: 3,
    after: "FIM",
  },
  {
    titulo: "DEMO 4 — Kit de Palestra (meta-momento)",
    abrir: "nutrion.app.br/coach/palestra",
    mostrar: "Digitar o tema e gerar o roteiro ao vivo, mostrando os cards de slide aparecendo.",
    falar: "O roteiro dessa palestra foi gerado pela própria plataforma.",
    backup: "Se a internet cair: mostrar o PDF deste roteiro no celular.",
    tempoMin: 2,
    after: "META",
  },
];

const toSlide = (d: DemoSpec): LectureSlide => ({
  id: uid(),
  tipo: "DEMO",
  bloco: "DEMO",
  titulo: d.titulo,
  bullets: ["Demonstração ao vivo na tela", d.mostrar.slice(0, 90)],
  fala: d.falar,
  tempoMin: d.tempoMin,
  referencia: "",
  demo: { abrir: d.abrir, mostrar: d.mostrar, falar: d.falar, backup: d.backup },
});

const idxOfWord = (slides: LectureSlide[], words: string[], from = 0) =>
  slides.findIndex((s, i) => {
    if (i < from) return false;
    const hay = `${s.titulo} ${s.bullets.join(" ")} ${s.bloco}`.toLowerCase();
    return words.some((w) => hay.includes(w));
  });

/** Insere os slides de DEMO nos pontos certos do roteiro. */
export function withDemoSlides(kit: LectureKit, opts: { includeMeta?: boolean } = {}): LectureKit {
  if (kit.slides.some((s) => s.tipo === "DEMO")) return kit;
  const slides = [...kit.slides];
  const lastContentIdx = () => {
    const i = slides.findIndex((s) => ["CTA", "QRCODE", "FECHAMENTO"].includes(s.tipo));
    return i < 0 ? slides.length : i;
  };

  const insertAfter = (index: number, spec: DemoSpec) => {
    const at = Math.min(Math.max(index + 1, 2), lastContentIdx());
    slides.splice(at, 0, toSlide(spec));
  };

  const mceIdx = idxOfWord(slides, ["mce", "método", "metodo"], 2);
  insertAfter(mceIdx >= 0 ? mceIdx : Math.floor(slides.length / 3), DEMOS[0]);

  const mentIdx = idxOfWord(slides, ["mentalidade", "crença", "crenca", "autoeficácia", "autoeficacia"], 2);
  insertAfter(mentIdx >= 0 ? mentIdx : Math.floor(slides.length / 2), DEMOS[1]);

  slides.splice(lastContentIdx(), 0, toSlide(DEMOS[2]));
  if (opts.includeMeta) slides.splice(lastContentIdx(), 0, toSlide(DEMOS[3]));

  return { ...kit, slides };
}

/* ─────────────────────  ESTRATÉGIA DE CONVERSÃO  ───────────────────── */

export interface DmMessage { quando: string; texto: string }
export interface Offer { nome: string; descricao: string; ancora: string }

export interface ConversionStrategy {
  gatilho: string;
  scriptGatilho: string;
  ondeFalar: string;
  funil: DmMessage[];
  ofertas: Offer[];
}

const stripAccents = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function triggerWord(topic: string): string {
  const stop = new Set(["para", "sobre", "como", "treino", "the", "and", "com", "dos", "das", "uma", "que", "por", "baseado", "baseada", "evidencia"]);
  const words = stripAccents(topic)
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 5 && w.length <= 12 && !stop.has(w.toLowerCase()));
  return words[0] || "PALESTRA";
}

export function offersFor(audience: string): Offer[] {
  const a = audience.toLowerCase();
  if (a.includes("graduand") || a.includes("personal"))
    return [
      { nome: "Mentoria MCE PRO", descricao: "Formação no método Mentalidade · Comportamento · Execução aplicado ao atendimento.", ancora: "Pra quem atende cliente e quer parar de perder aluno por falta de adesão." },
      { nome: "Acesso ao nutriON", descricao: "Plataforma completa pra prescrever, acompanhar e reter.", ancora: "O mesmo sistema que você viu funcionando aqui." },
    ];
  if (a.includes("atleta"))
    return [
      { nome: "Consultoria individual", descricao: "Acompanhamento direto de treino, nutrição e fase competitiva.", ancora: "Pra quem compete e não pode errar timing." },
      { nome: "Plano no nutriON", descricao: "Protocolo vivo que se ajusta a cada treino e a cada peso registrado.", ancora: "Seu plano muda com você, em tempo real." },
    ];
  if (a.includes("empres") || a.includes("academia"))
    return [
      { nome: "nutriON pra academia", descricao: "Retenção medida por comportamento, não por palpite.", ancora: "Churn cai quando o aluno vê progresso semanal." },
      { nome: "Certificação MCE", descricao: "Time treinado no método, padrão de atendimento único.", ancora: "Diferencial competitivo direto na sua unidade." },
    ];
  if (a.includes("nutricion"))
    return [
      { nome: "Mentoria MCE PRO", descricao: "Camada comportamental aplicada à consulta nutricional.", ancora: "O comportamento vem antes do protocolo." },
      { nome: "Acesso ao nutriON", descricao: "Prescrição, adesão e acompanhamento em um lugar só.", ancora: "Menos planilha, mais resultado." },
    ];
  return [
    { nome: "Programa MCE Performance (12 semanas)", descricao: "Mentalidade, Comportamento e Execução aplicados na prática, semana a semana.", ancora: "Transformação é sistema." },
  ];
}

export function buildStrategy(opts: { topic: string; audience: string; handle: string; material?: string }): ConversionStrategy {
  const gatilho = triggerWord(opts.topic);
  const at = (opts.handle || "diogo.mell0").replace("@", "");
  const oferta = offersFor(opts.audience)[0]?.nome || "Programa MCE Performance";
  return {
    gatilho,
    scriptGatilho: `Se vocês quiserem o material completo dessa palestra, me mandem a palavra ${gatilho} no Instagram @${at}. Eu mando tudo.`,
    ondeFalar: "Fale no slide de CTA e repita no fechamento — mínimo 2 vezes na palestra.",
    funil: [
      {
        quando: "Imediata (resposta automática)",
        texto: `Fala! Que bom que curtiu a palestra sobre ${opts.topic}. Aqui está o material que prometi: ${opts.material || "[link do material]"}. Qual parte te impactou mais?`,
      },
      {
        quando: "48 horas depois",
        texto: `E aí, [nome]? Já aplicou alguma coisa da palestra? Se quiser se aprofundar no Método MCE, tenho ${oferta} que pode te ajudar. Quer saber mais?`,
      },
      {
        quando: "7 dias depois",
        texto: `Semana passada falamos sobre ${opts.topic}. Postei um conteúdo aprofundando [tópico X] — dá uma olhada no meu último post. Se tiver dúvida, me manda aqui.`,
      },
    ],
    ofertas: offersFor(opts.audience),
  };
}

export const strategyText = (s: ConversionStrategy) =>
  [
    `PALAVRA-GATILHO: ${s.gatilho}`,
    s.scriptGatilho,
    s.ondeFalar,
    "",
    "FUNIL DE DMs:",
    ...s.funil.map((m) => `[${m.quando}]\n${m.texto}\n`),
    "OFERTAS:",
    ...s.ofertas.map((o) => `• ${o.nome} — ${o.descricao} (${o.ancora})`),
  ].join("\n");

export const funnelText = (s: ConversionStrategy) =>
  s.funil.map((m) => `[${m.quando}]\n${m.texto}`).join("\n\n");

/* ────────────────────  KIT DE CONTEÚDO PÓS-PALESTRA  ──────────────────── */

export interface ReelScript { titulo: string; duracao: string; hook: string; corpo: string; cta: string }
export interface ContentKit {
  reels: ReelScript[];
  carrossel: { slides: string[]; copy: string; hashtags: string[] };
  stories: string[];
  postAgradecimento: string;
}

export function buildContentKit(opts: { kit: LectureKit; topic: string; handle: string; gatilho: string; evento?: string }): ContentKit {
  const at = (opts.handle || "diogo.mell0").replace("@", "");
  const evento = opts.evento || "[NOME DO EVENTO]";
  const pontos = opts.kit.slides
    .filter((s) => ["CONTEUDO", "DADO", "PROVA"].includes(s.tipo))
    .map((s) => s.titulo)
    .slice(0, 5);
  const p1 = pontos[0] || opts.topic;

  return {
    reels: [
      {
        titulo: "Reels 1 — O momento mais impactante da palestra",
        duracao: "30s",
        hook: `Foi nesse momento que a sala inteira parou: ${p1}.`,
        corpo: "Corte do trecho ao vivo (áudio original) + legenda queimada com a frase de impacto.",
        cta: `Manda ${opts.gatilho} no direct que eu te mando o material completo.`,
      },
      {
        titulo: "Reels 2 — 1 conceito da palestra que muda tudo",
        duracao: "60s",
        hook: `${p1}. Eu explico em 60 segundos.`,
        corpo: "Você falando direto pra câmera: contexto (10s) → conceito (30s) → aplicação prática hoje (20s).",
        cta: "Salva esse pra consultar antes do próximo treino.",
      },
      {
        titulo: "Reels 3 — A reação da plateia na demo ao vivo",
        duracao: "15s",
        hook: "Mostrei o sistema rodando ao vivo. Olha a reação.",
        corpo: "Bastidor: plano da plateia + tela do notebook + seu rosto explicando em 1 frase.",
        cta: `@${at} · MCE`,
      },
    ],
    carrossel: {
      slides: [
        `Capa: ${opts.kit.titulo}`,
        pontos[0] || "Ponto 1 da palestra",
        pontos[1] || "Ponto 2 da palestra",
        pontos[2] || "Ponto 3 da palestra",
        "Takeaway: o comportamento vem antes do protocolo.",
        `CTA: manda ${opts.gatilho} no direct · @${at} · MCE`,
      ],
      copy: `${opts.kit.titulo}. Falei sobre ${opts.topic} em ${evento} e resumi aqui os pontos que mais impactaram a plateia. Mentalidade, Comportamento e Execução — nessa ordem. Manda ${opts.gatilho} no direct que eu envio o material completo.`,
      hashtags: ["#MCE", "#transformacaoesistema", "#nutriON", "#bodybuilding", "#performance", "#comportamento", "#coach"],
    },
    stories: [
      `Story 1 (bastidor): "Daqui a pouco, palestra em ${evento} sobre ${opts.topic}."`,
      "Story 2 (plateia): vídeo rápido de 5s mostrando a sala cheia.",
      "Story 3 (interação ao vivo): clipe do momento do voluntário na demo.",
      `Story 4 (agradecimento): "Obrigado ${evento} pela recepção."`,
      `Story 5 (CTA): enquete/caixinha — "Manda ${opts.gatilho} no direct que eu envio o material."`,
    ],
    postAgradecimento: `Obrigado, ${evento}. Falei sobre ${opts.topic} pra uma sala que ficou até o último slide. O recado central é o mesmo de sempre: transformação é sistema — Mentalidade, Comportamento e Execução, nessa ordem. Quem quiser o material completo, manda ${opts.gatilho} no direct. @${at}`,
  };
}

export const contentKitText = (c: ContentKit) =>
  [
    "REELS:",
    ...c.reels.map((r) => `${r.titulo} (${r.duracao})\nHook: ${r.hook}\nCorpo: ${r.corpo}\nCTA: ${r.cta}\n`),
    "CARROSSEL:",
    ...c.carrossel.slides.map((s, i) => `${i + 1}. ${s}`),
    `Copy: ${c.carrossel.copy}`,
    `Hashtags: ${c.carrossel.hashtags.join(" ")}`,
    "",
    "STORIES:",
    ...c.stories,
    "",
    "POST DE AGRADECIMENTO:",
    c.postAgradecimento,
  ].join("\n");

/* ─────────────────────────  CHECKLIST  ───────────────────────── */

export const CHECKLIST: { fase: string; itens: string[] }[] = [
  {
    fase: "Antes da palestra",
    itens: [
      "Notebook carregado 100% + carregador na bolsa",
      "Hotspot do celular configurado (backup de internet)",
      "Abas abertas: /mce, /coach/social, /coach/palestra, /coach/dashboard",
      "Screenshots das telas no celular (backup se o WiFi cair)",
      "Testar projetor + WiFi no local 15 min antes",
      "QR code do Instagram no último slide",
      "Alguém designado pra filmar (tripé ou pessoa)",
      "Vestimenta profissional (camisa polo/social, não regata)",
      "Cartões ou QR code impresso na mesa de entrada",
      "Água no púlpito",
    ],
  },
  {
    fase: "Durante a palestra",
    itens: [
      "Começar com GANCHO, não com apresentação",
      "Apresentação pessoal em no máximo 20 segundos",
      "Manter contato visual com diferentes partes da plateia",
      "Não ler os slides — usar como âncora visual",
      "Chamar voluntário pra demo ao vivo",
      "Falar a palavra-gatilho de DM pelo menos 2x",
      "Tirar foto com a plateia no final",
    ],
  },
  {
    fase: "Depois da palestra",
    itens: [
      "Postar story de agradecimento em até 2h",
      "Responder todas as DMs com palavra-gatilho em até 24h",
      "Postar Reels com o melhor momento em até 48h",
      "Enviar follow-up para leads em 48h",
      "Postar carrossel resumo em até 1 semana",
    ],
  },
];

export const checklistText = () =>
  CHECKLIST.map((g) => [`${g.fase.toUpperCase()}:`, ...g.itens.map((i) => `[ ] ${i}`)].join("\n")).join("\n\n");

/* ─────────────────────────  NETWORKING  ───────────────────────── */

export const INTERESSES = ["Quer ser cliente", "Quer parceria", "Quer mentoria", "Só networking", "Possível collab"] as const;
export const FOLLOWUPS = ["Pendente", "Mensagem enviada", "Respondeu", "Convertido"] as const;

export const FOLLOWUP_COLOR: Record<string, string> = {
  Pendente: "#F59E0B",
  "Mensagem enviada": "#00D4FF",
  Respondeu: "#A855F7",
  Convertido: "#22C55E",
};

export interface LectureContact {
  id: string;
  nome: string;
  contato: string;
  interesse: string;
  nota: string;
  status: string;
  tema: string;
  criadoEm: string;
}

const CONTACTS_KEY = "nutrion.lecture.contacts";

export const loadContacts = (): LectureContact[] => {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    return raw ? (JSON.parse(raw) as LectureContact[]) : [];
  } catch {
    return [];
  }
};

export const saveContacts = (list: LectureContact[]) => {
  try { localStorage.setItem(CONTACTS_KEY, JSON.stringify(list)); } catch { /* ignore */ }
};

export const newContact = (tema: string): LectureContact => ({
  id: uid(), nome: "", contato: "", interesse: INTERESSES[0], nota: "",
  status: FOLLOWUPS[0], tema, criadoEm: new Date().toISOString(),
});

/* ─────────────────────────  ROTEIRO EM TEXTO  ───────────────────────── */

export const scriptText = (kit: LectureKit) => {
  const lines: string[] = [kit.titulo, kit.subtitulo, `${totalMinutes(kit.slides)} min estimados`, ""];
  kit.slides.forEach((s, i) => {
    lines.push(`--- SLIDE ${String(i + 1).padStart(2, "0")} · ${TYPE_LABEL[s.tipo]} · ${s.tempoMin} min ---`, s.titulo);
    s.bullets.forEach((b) => lines.push(`• ${b}`));
    if (s.demo) {
      lines.push(`ABRIR: ${s.demo.abrir}`, `MOSTRAR: ${s.demo.mostrar}`, `FALAR: ${s.demo.falar}`, `BACKUP: ${s.demo.backup}`);
    }
    if (s.fala) lines.push("", `Fala: ${s.fala}`);
    if (s.referencia) lines.push(`Referência: ${s.referencia}`);
    lines.push("");
  });
  return lines.join("\n");
};

/* ─────────────────────────  ZIP DO KIT  ───────────────────────── */

const slug = (t: string) =>
  stripAccents(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "palestra";

/** ZIP com roteiro, estratégia, scripts de DM, conteúdo e checklist. */
export async function exportKitZip(opts: {
  kit: LectureKit;
  strategy: ConversionStrategy;
  content: ContentKit;
  handle: string;
  pptx?: Blob | null;
}) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const name = slug(opts.kit.titulo);

  zip.file("01-roteiro.txt", scriptText(opts.kit));
  zip.file("02-estrategia-de-conversao.txt", strategyText(opts.strategy));
  zip.file("03-funil-de-dms.txt", funnelText(opts.strategy));
  zip.file("04-conteudo-pos-palestra.txt", contentKitText(opts.content));
  zip.file("05-checklist-do-palestrante.txt", checklistText());
  if (opts.pptx) zip.file(`slides-${name}.pptx`, opts.pptx);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kit-palestra-${name}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
