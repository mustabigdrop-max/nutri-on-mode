/**
 * Histórico local dos conteúdos já gerados por exercício na BiomechanicsVault.
 * Fica no dispositivo do coach — serve pra não repetir o mesmo ângulo.
 */

export type BiomechHistoricoItem = {
  exercicio: string;
  formato: "carrossel" | "reels" | "stories";
  foco: string;
  angulo: string;
  data: string;
};

const KEY = "biomech_historico_v1";

const ler = (): BiomechHistoricoItem[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as BiomechHistoricoItem[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export function historicoDoExercicio(exercicio: string): BiomechHistoricoItem[] {
  return ler()
    .filter((i) => norm(i.exercicio) === norm(exercicio))
    .sort((a, b) => (a.data < b.data ? 1 : -1))
    .slice(0, 12);
}

export function registrarGeracao(item: Omit<BiomechHistoricoItem, "data">): BiomechHistoricoItem[] {
  const todos = [{ ...item, data: new Date().toISOString() }, ...ler()].slice(0, 200);
  try {
    localStorage.setItem(KEY, JSON.stringify(todos));
  } catch {
    /* armazenamento cheio ou bloqueado — histórico é opcional */
  }
  return historicoDoExercicio(item.exercicio);
}

export const dataCurta = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};
