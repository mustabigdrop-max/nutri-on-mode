/**
 * Padrão de duração exibido nos slides sociais.
 * Todo tempo de treino aparece como faixa de 50 a 80 min — nunca um número exato.
 */
export const FAIXA_DURACAO = "50 a 80 min";

/** Normaliza qualquer duração vinda do protocolo para a faixa padrão dos slides. */
export function duracaoSlide(valor?: string | number | null): string {
  if (valor === null || valor === undefined) return FAIXA_DURACAO;
  const texto = String(valor).trim();
  if (!texto) return FAIXA_DURACAO;
  return FAIXA_DURACAO;
}
