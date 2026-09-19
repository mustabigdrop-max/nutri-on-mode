/**
 * Validação de fontes: só entram no conteúdo referências de pesquisa reais
 * devolvidas pelas buscas científicas (URL, DOI, PMID ou citação autor+ano).
 * Texto genérico do tipo "estudos mostram" nunca é aceito como fonte.
 */

const GENERICAS = [
  "pesquisa em andamento",
  "referencias completas",
  "referências completas",
  "estudos mostram",
  "segundo estudos",
  "literatura",
  "consenso",
  "sem fonte",
  "n/a",
  "nao informado",
  "não informado",
];

const temUrl = (fonte: string) => /https?:\/\/\S+\.\S+/i.test(fonte);
const temDoi = (fonte: string) => /\b10\.\d{4,9}\/\S+/i.test(fonte);
const temPmid = (fonte: string) => /\bpmid[:\s]*\d{5,}/i.test(fonte);
const temAutorAno = (fonte: string) =>
  /\b(18|19|20)\d{2}\b/.test(fonte) && /[A-Za-zÀ-ÿ]{3,}/.test(fonte);

/** Uma fonte é real quando é rastreável: link, DOI, PMID ou citação com autor e ano. */
export const isRealResearchSource = (fonte: unknown): fonte is string => {
  if (typeof fonte !== "string") return false;
  const texto = fonte.trim();
  if (texto.length < 8) return false;
  const baixo = texto.toLowerCase();
  if (GENERICAS.some((g) => baixo.includes(g))) return false;
  return temUrl(texto) || temDoi(texto) || temPmid(texto) || temAutorAno(texto);
};

/** Normaliza, remove duplicadas e descarta tudo que não for pesquisa rastreável. */
export const normalizeResearchSources = (fontes: unknown): string[] => {
  const lista = Array.isArray(fontes) ? fontes : [];
  const vistas = new Set<string>();
  const saida: string[] = [];
  for (const item of lista) {
    if (typeof item !== "string") continue;
    const texto = item.trim().replace(/\s+/g, " ");
    if (!isRealResearchSource(texto)) continue;
    const chave = texto.toLowerCase();
    if (vistas.has(chave)) continue;
    vistas.add(chave);
    saida.push(texto);
  }
  return saida;
};

/** Rótulo curto para exibir em slide/story (hostname quando é link). */
export const researchSourceLabel = (fonte: string): string => {
  const match = fonte.match(/https?:\/\/([^/\s]+)/i);
  if (match) return match[1].replace(/^www\./i, "");
  return fonte.length > 90 ? `${fonte.slice(0, 87)}…` : fonte;
};

/**
 * Extrai do corpo da análise as referências rastreáveis já citadas no texto:
 * links, DOIs, PMIDs e citações do tipo "Autor et al., 2021".
 */
export const extractResearchSources = (texto: unknown): string[] => {
  if (typeof texto !== "string" || !texto.trim()) return [];
  const achados: string[] = [];

  for (const m of texto.matchAll(/https?:\/\/[^\s)\]]+/gi)) achados.push(m[0].replace(/[.,;:]+$/, ""));
  for (const m of texto.matchAll(/\b10\.\d{4,9}\/[^\s)\]]+/gi)) achados.push(`DOI ${m[0].replace(/[.,;:]+$/, "")}`);
  for (const m of texto.matchAll(/\bPMID[:\s]*\d{5,}/gi)) achados.push(m[0]);
  // Citação com autor e ano: "Schoenfeld et al., 2019" / "Schoenfeld & Grgic (2020)"
  for (const m of texto.matchAll(
    /\b([A-ZÀ-Þ][A-Za-zÀ-ÿ'-]{2,}(?:\s*(?:et al\.?|&|e)\s*[A-ZÀ-Þ]?[A-Za-zÀ-ÿ'-]*)?)[,\s]*\(?((?:19|20)\d{2})\)?/g,
  )) {
    achados.push(`${m[1].trim()}, ${m[2]}`);
  }

  return normalizeResearchSources(achados);
};

export const SEM_FONTE_REAL =
  "Nenhuma fonte de pesquisa rastreável foi retornada (link, DOI, PMID ou autor e ano). Refaça a pesquisa científica antes de gerar o conteúdo.";
