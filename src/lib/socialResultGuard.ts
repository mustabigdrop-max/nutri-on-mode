import { supabase } from "@/integrations/supabase/client";
import { toText } from "@/lib/captionText";

/**
 * Às vezes a geração devolve um campo de texto como objeto
 * { script_hook, caption_body, caption_cta }. Renderizar isso direto quebra a
 * tela (React #31). Aqui convertemos esses objetos em texto em qualquer
 * profundidade, para todos os formatos do Social ON.
 */
const CAPTION_KEYS = ["script_hook", "caption_body", "caption_cta"];
const isCaptionObj = (v: unknown) =>
  !!v && typeof v === "object" && !Array.isArray(v) && CAPTION_KEYS.some((k) => k in (v as object));

export const normalizeCaptionObjects = (v: unknown, depth = 0): unknown => {
  if (depth > 8 || v == null || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map((x) => normalizeCaptionObjects(x, depth + 1));
  if (isCaptionObj(v) && depth > 0) return toText(v);
  const out: Record<string, unknown> = {};
  for (const [k, x] of Object.entries(v as Record<string, unknown>)) out[k] = normalizeCaptionObjects(x, depth + 1);
  return out;
};

const GUARDED = new Set(["social-on-generate", "command-center"]);
const fns = supabase.functions as unknown as { invoke: (...a: unknown[]) => Promise<{ data: unknown; error: unknown }> };
const original = fns.invoke.bind(supabase.functions);
fns.invoke = async (name: unknown, ...rest: unknown[]) => {
  const res = await original(name, ...rest);
  if (typeof name === "string" && GUARDED.has(name) && res?.data && typeof res.data === "object") {
    const data = res.data as Record<string, unknown>;
    // resultado inteiro no formato legenda → mantém campos e adiciona legenda pronta
    if (isCaptionObj(data.result)) {
      const r = data.result as Record<string, unknown>;
      return { ...res, data: { ...data, result: { ...r, legenda: r.legenda ?? toText(r), caption: r.caption ?? toText(r) } } };
    }
    return { ...res, data: normalizeCaptionObjects(data) };
  }
  return res;
};
