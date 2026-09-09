/**
 * Utilitários para edição manual dos textos de um carrossel já gerado.
 * Percorre o objeto de conteúdo e expõe cada texto como um campo editável,
 * sem alterar a estrutura nem inventar valores.
 */

export type SlideTextField = {
  /** Caminho até o texto dentro do objeto de conteúdo. */
  path: (string | number)[];
  /** Rótulo legível, ex.: "capa · título". */
  label: string;
  /** Grupo (primeira chave do caminho), usado para agrupar na tela. */
  group: string;
  value: string;
  /** Textos longos ganham área de texto maior. */
  long: boolean;
};

const HIDDEN = new Set(["handle", "origem", "composto", "tema", "slide1_status", "nivel_evidencia", "evidencia"]);

const humanize = (k: string | number) =>
  String(k)
    .replace(/^slide\d+_/, "")
    .replace(/_/g, " ")
    .replace(/\bdesc\b/, "descrição")
    .replace(/\btitulo\b/, "título")
    .trim();

/** Lista todos os textos editáveis do conteúdo de um carrossel. */
export function collectSlideTexts(content: unknown, base: (string | number)[] = []): SlideTextField[] {
  const out: SlideTextField[] = [];
  const walk = (node: unknown, path: (string | number)[]) => {
    if (typeof node === "string") {
      if (!node.trim()) return;
      const group = String(path[0] ?? "");
      out.push({
        path,
        label: path.map(humanize).filter(Boolean).join(" · "),
        group: humanize(group) || "conteúdo",
        value: node,
        long: node.length > 60,
      });
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, [...path, i]));
      return;
    }
    if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (path.length === 0 && HIDDEN.has(k)) continue;
        walk(v, [...path, k]);
      }
    }
  };
  walk(content, base);
  return out;
}

/** Devolve uma cópia do conteúdo com o texto do caminho indicado substituído. */
export function setAtPath<T>(content: T, path: (string | number)[], value: string): T {
  if (path.length === 0) return value as unknown as T;
  const [head, ...rest] = path;
  if (Array.isArray(content)) {
    const copy = [...content] as unknown[];
    copy[head as number] = setAtPath(copy[head as number], rest, value);
    return copy as unknown as T;
  }
  const copy = { ...(content as Record<string, unknown>) };
  copy[head as string] = setAtPath(copy[head as string], rest, value);
  return copy as unknown as T;
}
