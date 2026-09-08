import { supabase } from "@/integrations/supabase/client";
import { fallbackMusculos, nomeLeigo } from "@/lib/muscleFallback";

export interface GuideErro {
  erro: string;
  correcao: string;
}

export interface GuideMusculo {
  nome: string;
  tipo: "principal" | "secundario" | string;
  ativacao: number;
}

export interface ExerciseGuide {
  aparelho?: string;
  ajuste?: string;
  pegada?: string;
  passos?: string[];
  erros?: GuideErro[];
  musculos?: GuideMusculo[];
  dica_coach?: string;
}

/** Chave estável do exercício para cache (sem acentos, pontuação ou variações de caixa). */
export function exerciseKey(name: string): string {
  return (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function normalize(raw: any): ExerciseGuide | null {
  if (!raw || typeof raw !== "object") return null;
  const musculos: GuideMusculo[] = Array.isArray(raw.musculos)
    ? raw.musculos
        .filter((m: any) => m && m.nome)
        .map((m: any) => ({
          nome: String(m.nome),
          tipo: m.tipo === "principal" ? "principal" : "secundario",
          ativacao: Math.max(0, Math.min(100, Number(m.ativacao) || 0)),
        }))
    : [];
  const erros: GuideErro[] = Array.isArray(raw.erros)
    ? raw.erros
        .filter((e: any) => e && (e.erro || e.correcao))
        .map((e: any) => ({ erro: String(e.erro || ""), correcao: String(e.correcao || "") }))
    : [];
  const passos: string[] = Array.isArray(raw.passos)
    ? raw.passos.filter(Boolean).map((p: any) => String(p))
    : [];
  const guide: ExerciseGuide = {
    aparelho: raw.aparelho ? String(raw.aparelho) : undefined,
    ajuste: raw.ajuste ? String(raw.ajuste) : undefined,
    pegada: raw.pegada ? String(raw.pegada) : undefined,
    passos,
    erros,
    musculos,
    dica_coach: raw.dica_coach ? String(raw.dica_coach) : undefined,
  };
  if (!guide.passos?.length && !guide.aparelho) return null;
  return guide;
}

/** Garante mapa muscular: usa fallback pelo nome e traduz para linguagem acessível. */
function aplicarMusculos(guide: ExerciseGuide, nome: string) {
  const temPrincipal = guide.musculos?.some((m) => m.tipo === "principal");
  if (!temPrincipal) {
    guide.musculos = fallbackMusculos(nome) || guide.musculos || [];
  }
  guide.musculos = (guide.musculos || []).map((m) => ({ ...m, nome: nomeLeigo(m.nome) }));
}

/** Busca no cache do banco; se não existir, gera e salva uma única vez. */
export async function loadExerciseGuide(params: {
  name: string;
  muscleTarget?: string | null;
  tempo?: string | null;
}): Promise<ExerciseGuide> {
  const key = exerciseKey(params.name);
  if (!key) throw new Error("Exercício sem nome.");

  const { data: cached } = await supabase
    .from("exercise_guides")
    .select("guide")
    .eq("exercise_key", key)
    .maybeSingle();

  const fromCache = normalize(cached?.guide);
  if (fromCache) {
    aplicarMusculos(fromCache, params.name);
    return fromCache;
  }

  const { data, error } = await supabase.functions.invoke("exercise-guide", {
    body: {
      mode: "guide",
      exercise_name: params.name,
      muscle_target: params.muscleTarget || "",
      tempo: params.tempo || "",
    },
  });
  if (error) throw new Error(error.message);
  const guide = normalize((data as any)?.guide);
  if (!guide) throw new Error("Não foi possível montar o guia deste exercício.");
  aplicarMusculos(guide, params.name);

  await supabase
    .from("exercise_guides")
    .upsert({ exercise_key: key, exercise_name: params.name, guide: guide as any }, { onConflict: "exercise_key" });

  return guide;
}
