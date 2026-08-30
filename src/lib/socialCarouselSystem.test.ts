import { describe, expect, it } from "vitest";
import { countSlideWords, normalizeCarouselSlides } from "./socialCarouselSystem";

describe("normalizeCarouselSlides", () => {
  it("creates a complete 6-8 slide sequence with bounded copy", () => {
    const slides = normalizeCarouselSlides([
      { type: "hook", title: "Você sabia que seu cérebro pode sabotar completamente todas as suas decisões noturnas?" },
      { type: "content", title: "Padrão sustenta", body: "Motivação oscila e um sistema reduz decisões quando sua energia mental está baixa demais." },
      { type: "content", title: "Padrão sustenta", body: "Motivação oscila e um sistema reduz decisões quando sua energia mental está baixa demais." },
    ], "Sistema vence motivação", "mindset");

    expect(slides.length).toBeGreaterThanOrEqual(6);
    expect(slides.length).toBeLessThanOrEqual(8);
    expect(slides[0].type).toBe("hook");
    expect(slides.at(-1)?.type).toBe("cta");
    expect(slides[0].title.toLocaleLowerCase("pt-BR")).not.toContain("você sabia que");
    expect(slides.every((slide) => countSlideWords(slide) <= 20)).toBe(true);
    expect(new Set(slides.map((slide) => `${slide.title} ${slide.body || ""}`)).size).toBe(slides.length);
  });
});
describe("normalizeCarouselSlides overflow", () => {
  it("keeps the CTA slide when the model returns a full deck without problem slide", () => {
    const input = [
      { type: "hook" as const, title: "Sistema vence motivação" },
      ...Array.from({ length: 6 }, (_, i) => ({
        type: "content" as const,
        title: `Bloco ${i + 1}`,
        body: `Detalhe prático número ${i + 1} do sistema.`,
      })),
      { type: "cta" as const, title: "Salva esse carrossel", body: "Manda pra quem precisa." },
    ];
    const slides = normalizeCarouselSlides(input, "Sistema vence motivação", "execucao");
    expect(slides.length).toBeLessThanOrEqual(8);
    expect(slides.at(-1)?.type).toBe("cta");
    expect(slides.some((s) => s.type === "takeaway")).toBe(true);
  });
});
