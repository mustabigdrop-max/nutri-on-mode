import { useSearchParams } from "react-router-dom";

const KEY = "viewAsAthleteId";

/** Guarda o atleta que o coach está visualizando (modo "ver como cliente"). */
export function setViewAsAthlete(id: string | null) {
  try {
    if (id) sessionStorage.setItem(KEY, id);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

export function getViewAsAthlete(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/**
 * Retorna o ID do atleta cujos dados devem ser carregados:
 * ?athlete= na URL, senão o atleta em modo visualização, senão null (usuário logado).
 */
export function useAthleteTarget(): string | null {
  const [params] = useSearchParams();
  return params.get("athlete") || getViewAsAthlete();
}

/** Sufixo de querystring para preservar o modo visualização na navegação. */
export function athleteQuery(id: string | null | undefined): string {
  return id ? `?athlete=${id}` : "";
}
