import type { DominioPesquisa, PesquisaDual } from "@/lib/dualResearch";

export type CarouselNiche = "nutricao" | "treino" | "hormonal" | "mce" | "livre";
export type CarouselTone = "cientifico" | "didatico" | "motivacional" | "coach";
export type SVGCategory = "muscular" | "nutricao" | "hormonal" | "comportamento";
export type SVGElement = "fibras" | "sarcomero" | "mtor" | "mitocondria" | "krebs" | "cadeia_eletrons" | "glicolise" | "receptor" | "eixo" | "feedback" | "radar_mce" | "habito" | "neuronio";
export type Accent = "cyan" | "gold";

export type CarouselCard = { icon?: string; accent?: Accent; title: string; description: string };
export type CarouselBlock = { title: string; description: string; reference?: string };
export type CarouselParagraph = { title?: string; text: string; reference?: string };

export type CoverSlide = {
  slide_number: 1; type: "cover"; eyebrow: string; title: string; accent_word?: string;
  subtitle: string; svg_category: SVGCategory; svg_element: SVGElement;
};
export type ContentSlide = {
  slide_number: 2 | 3 | 4; type: "content"; variation: "A" | "B" | "C";
  header: string; category_tag?: string; svg_category: SVGCategory; svg_element: SVGElement;
  cards?: CarouselCard[]; paragraphs?: CarouselParagraph[]; blocks?: CarouselBlock[];
};
export type CtaSlide = {
  slide_number: 5; type: "cta"; impact_phrase: string; cta_text: string;
};
export type CarouselEngineSlide = CoverSlide | ContentSlide | CtaSlide;
export type CarouselScore = {
  total_score?: number; breakdown?: { share?: number; hook?: number; seo?: number; save?: number };
  verdict?: "PUBLICAR" | "OTIMIZAR" | "REFAZER"; top_fix?: string; optimized_hook?: string;
};
export type CarouselEngineContent = {
  topic: string; niche: CarouselNiche; tone: CarouselTone; slides: CarouselEngineSlide[];
  caption?: string; sources?: string[]; score?: CarouselScore | null; research?: PesquisaDual | null;
};
export type CarouselHistoryRow = {
  id: string; topic: string; niche: CarouselNiche; tone: CarouselTone;
  slides: CarouselEngineSlide[]; caption: string | null; sources: string[] | null;
  score: CarouselScore | null; created_at: string;
};

export const nicheToDomain: Record<CarouselNiche, DominioPesquisa> = {
  nutricao: "nutricao", treino: "treino", hormonal: "livre", mce: "mce", livre: "livre",
};
