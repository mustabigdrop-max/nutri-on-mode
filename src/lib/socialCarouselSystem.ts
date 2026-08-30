export type CarouselPreset = "dark_authority" | "bold_impact" | "minimal_clean";
export type McePillar = "mindset" | "comportamento" | "execucao";
export type CarouselSlideType = "hook" | "problem" | "content" | "takeaway" | "cta";
export type CoachPhotoMode = "none" | "cover" | "cta_circle";

export type ProprietarySlide = {
  type: CarouselSlideType;
  title: string;
  body?: string;
  pillar?: McePillar;
  reference?: string;
  keywords?: string[];
  file_index?: number;
};

export const MCE_ACCENTS: Record<McePillar, string> = {
  mindset: "#A855F7",
  comportamento: "#00D4FF",
  execucao: "#D4A72C",
};

const FORBIDDEN = [
  "você sabia que",
  "neste post vamos falar sobre",
  "fique até o final",
  "curta e compartilhe",
];

const words = (value = "") => value.trim().split(/\s+/).filter(Boolean);
const clampWords = (value: string, limit: number) => words(value).slice(0, limit).join(" ");
const clean = (value = "") => {
  let output = value.replace(/\s+/g, " ").trim();
  for (const phrase of FORBIDDEN) {
    if (output.toLocaleLowerCase("pt-BR").includes(phrase)) output = output.replace(new RegExp(phrase, "ig"), "").trim();
  }
  return output.replace(/^[\s:–—-]+|[\s:–—-]+$/g, "");
};

const signature = (slide: Pick<ProprietarySlide, "title" | "body">) =>
  `${slide.title} ${slide.body || ""}`.toLocaleLowerCase("pt-BR").replace(/[^a-z0-9á-ú]+/g, " ").trim();

export const normalizeCarouselSlides = (
  input: Partial<ProprietarySlide>[] | undefined,
  fallbackHook: string,
  pillar: McePillar = "comportamento",
): ProprietarySlide[] => {
  const source = (input || []).filter((slide) => slide?.title);
  const typed: ProprietarySlide[] = source.map((slide, index) => ({
    type: slide.type || (index === 0 ? "hook" : index === source.length - 1 ? "cta" : "content"),
    title: clean(String(slide.title || "")),
    body: clean(String(slide.body || "")) || undefined,
    pillar: slide.pillar || pillar,
    reference: clean(String(slide.reference || "")) || undefined,
    keywords: (slide.keywords || []).map((item) => clampWords(clean(String(item)), 3)).filter(Boolean).slice(0, 3),
    file_index: typeof slide.file_index === "number" ? slide.file_index : undefined,
  }));

  const defaults: ProprietarySlide[] = [
    { type: "hook", title: clean(fallbackHook) || "O comportamento vem antes do protocolo.", pillar },
    { type: "problem", title: "Você conhece o plano.", body: "O ambiente ainda decide por você.", pillar },
    { type: "content", title: "Motivação oscila.", body: "Um sistema reduz decisões e protege a execução.", pillar, keywords: ["sistema"] },
    { type: "content", title: "Mude o gatilho.", body: "A resposta muda quando o contexto deixa de sabotar.", pillar, keywords: ["gatilho"] },
    { type: "content", title: "Repita o padrão certo.", body: "Consistência transforma intenção em comportamento automático.", pillar, keywords: ["consistência"] },
    { type: "takeaway", title: "O comportamento vem antes do protocolo.", pillar },
    { type: "cta", title: "Salva antes do próximo treino.", body: "Manda pra alguém que precisa ouvir isso.", pillar },
  ];

  const ordered: ProprietarySlide[] = [];
  const requested = typed.length >= 6 ? typed : defaults.map((fallback, index) => typed[index] || fallback);
  const seen = new Set<string>();

  for (const slide of requested) {
    const titleLimit = slide.type === "hook" ? 8 : 12;
    const title = clampWords(slide.title, titleLimit);
    const remaining = Math.max(0, 20 - words(title).length - words(slide.reference).length);
    const body = remaining ? clampWords(slide.body || "", remaining) : "";
    const next = { ...slide, title, body: body || undefined, pillar: slide.pillar || pillar };
    const key = signature(next);
    if (!title || seen.has(key)) continue;
    seen.add(key);
    ordered.push(next);
    if (ordered.length === 8) break;
  }

  if (ordered[0]?.type !== "hook") ordered.unshift(defaults[0]);
  if (!ordered.some((slide) => slide.type === "problem")) ordered.splice(1, 0, defaults[1]);
  if (!ordered.some((slide) => slide.type === "takeaway")) ordered.splice(-1, 0, defaults[5]);
  if (ordered[ordered.length - 1]?.type !== "cta") ordered.push(defaults[6]);
  return ordered.slice(0, 8);
};

export const countSlideWords = (slide: Pick<ProprietarySlide, "title" | "body" | "reference">) =>
  words(`${slide.title} ${slide.body || ""} ${slide.reference || ""}`).length;