import { supabase } from "@/integrations/supabase/client";
import { ENGINE_PROMPT_DEFAULTS, ENGINE_PROMPT_KEYS, ENGINE_ADDENDA, hasAddendum, withAddendum, type EnginePromptKey } from "../../supabase/functions/_shared/engineDefaults";

export { ENGINE_PROMPT_KEYS, ENGINE_PROMPT_DEFAULTS, type EnginePromptKey };
export const ENGINE_LABEL: Record<EnginePromptKey, string> = {
  bloco_0: "Contexto comum", arquiteto: "Arquiteto", redator: "Redator", critico: "Crítico",
  calibracao: "Calibração", atlas: "Atlas de Atenção", retorica: "Biblioteca de Persuasão", angulo: "Ângulo", proibidas: "Palavras proibidas",
};
export const CORE_KEYS: EnginePromptKey[] = ["bloco_0", "arquiteto", "redator", "critico"];
export const PLACEHOLDERS = ["{{perfil}}", "{{vencedores}}", "{{fracos}}", "{{fontes_verificadas}}"];
export const MAX_VERSIONS = 10;

export type EngineRow = { id: string; chave: EnginePromptKey; conteudo: string; padrao: string; versao: number; updated_at: string };

/** Keys whose row is missing, for an idempotent seed that never overwrites. */
export function missingKeys(rows: { chave: string }[]): EnginePromptKey[] {
  return ENGINE_PROMPT_KEYS.filter(k => !rows.some(r => r.chave === k));
}
export function emptyCore(rows: { chave: string; conteudo: string }[]): EnginePromptKey[] {
  return CORE_KEYS.filter(k => !rows.find(r => r.chave === k)?.conteudo?.trim());
}
export function rowState(r?: { conteudo: string; padrao: string }): "Ativa" | "Editada" | "Vazia" {
  if (!r?.conteudo?.trim()) return "Vazia";
  return r.conteudo === r.padrao ? "Ativa" : "Editada";
}
/** Save rules: empty text or the forbidden acronyms block; missing bloco_0 placeholders only warn. */
export function validateInstruction(chave: EnginePromptKey, text: string): { erro?: string; avisos: string[] } {
  if (!text.trim()) return { erro: "O texto não pode ficar vazio.", avisos: [] };
  // The default bloco_0 quotes the acronyms to forbid them; only flag uses outside quotes.
  const unquoted = text.replace(/'[^'\n]*'/g, "").replace(/"[^"\n]*"/g, "");
  if (/\b(IA|AI)\b/.test(unquoted)) return { erro: "Remova as siglas proibidas do texto antes de salvar.", avisos: [] };
  const avisos = chave === "bloco_0" ? PLACEHOLDERS.filter(p => !text.includes(p)).map(p => `Falta o marcador ${p}.`) : [];
  return { avisos };
}

export async function loadAndSeed(userId: string): Promise<EngineRow[]> {
  const sel = () => supabase.from("engine_prompts").select("id, chave, conteudo, padrao, versao, updated_at").eq("user_id", userId);
  const { data } = await sel();
  // K1 addenda: appended once to the user's current text as a new version; never overwrites edits.
  let changed = false;
  for (const r of (data ?? []) as EngineRow[]) {
    if (!hasAddendum(r.chave) || !r.conteudo?.trim()) continue;
    const next = withAddendum(r.chave, r.conteudo);
    if (next !== r.conteudo) { await saveInstruction(userId, r, next); await supabase.from("engine_prompts").update({ padrao: ENGINE_PROMPT_DEFAULTS[r.chave] }).eq("id", r.id).eq("padrao", r.padrao); changed = true; }
  }
  const miss = missingKeys(data ?? []);
  if (!miss.length) return changed ? ((await sel()).data ?? []) as EngineRow[] : (data ?? []) as EngineRow[];
  await supabase.from("engine_prompts").upsert(
    miss.map(k => ({ user_id: userId, chave: k, conteudo: ENGINE_PROMPT_DEFAULTS[k], padrao: ENGINE_PROMPT_DEFAULTS[k] })),
    { onConflict: "user_id,chave", ignoreDuplicates: true });
  const { data: again } = await sel();
  return (again ?? []) as EngineRow[];
}

export async function saveInstruction(userId: string, row: EngineRow, conteudo: string) {
  const versao = row.versao + 1;
  const { error } = await supabase.from("engine_prompts").update({ conteudo, versao, updated_at: new Date().toISOString() }).eq("id", row.id);
  if (error) throw error;
  await supabase.from("engine_prompt_versions").insert({ prompt_id: row.id, user_id: userId, conteudo, versao });
  const { data: old } = await supabase.from("engine_prompt_versions").select("id").eq("prompt_id", row.id).order("created_at", { ascending: false }).range(MAX_VERSIONS, 100);
  if (old?.length) await supabase.from("engine_prompt_versions").delete().in("id", old.map(o => o.id));
}
