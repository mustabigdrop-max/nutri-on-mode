import { COMMAND_CENTER_SPEC } from "./spec.ts";
import { IMPACT_WRITER_SPEC } from "./impactSpec.ts";
import { requireUser } from "../_shared/auth.ts";
import { loadCreatorProfile } from "../_shared/loadCreatorProfile.ts";
import { creatorScriptPrompt } from "../_shared/creatorScriptRules.ts";
import { reviewWithGateway } from "../_shared/retentionGateway.ts";
import { jsonrepair } from "npm:jsonrepair@3.13.1";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const TOOLS: Record<string, { spec: string; label: string }> = {
  decoder: { spec: "cc", label: "FERRAMENTA 1: VIRAL DECODER" },
  forge: { spec: "cc", label: "FERRAMENTA 2: CONTENT FORGE" },
  hooks: { spec: "cc", label: "FERRAMENTA 3: HOOK LAB" },
  sniper: { spec: "cc", label: "FERRAMENTA 4: SALES SNIPER" },
  impact_angulos: { spec: "impact", label: "FERRAMENTA 1: ÂNGULOS" },
  impact_pesquisa: { spec: "impact", label: "FERRAMENTA 2: PESQUISA" },
  impact_writer: { spec: "impact", label: "FERRAMENTA 3: WRITER" },
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return json({ error: "Não autenticado" }, auth.status);
    const body = await req.json();
    const { tool, input } = body;
    const def = TOOLS[tool];
    if (!def || !String(input || "").trim()) return json({ error: "Escolha a ferramenta e preencha o campo" }, 400);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const baseSpec = def.spec === "impact" ? IMPACT_WRITER_SPEC : COMMAND_CENTER_SPEC;
    const profile = await loadCreatorProfile(auth.userId);
    const system = `${baseSpec}\n\nEXECUTE AGORA APENAS a ${def.label}. Coloque o "Formato de Saída" dessa ferramenta no campo content do JSON {"content":"texto da ferramenta"}, sem markdown com ** ou #. Nunca invente estudos, números de pesquisa ou códigos NEXUS: se não tiver certeza, escreva "sem referência confirmada". Métricas de score são estimativas da análise.\n\n${creatorScriptPrompt(profile, body)}`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", response_format: { type: "json_object" }, messages: [{ role: "system", content: `${system}\nCONTRATO FINAL OBRIGATÓRIO: o campo content é SEMPRE uma string contendo o resultado inteiro da ferramenta, nunca objeto ou array. planejamento_retencao e roteiros_retencao são campos irmãos de content. Cada caminho de fala deve apontar a ["content"]. Não retorne somente o planejamento.` }, { role: "user", content: String(input).slice(0, 4000) }] }),
    });
    if (res.status === 429) return json({ error: "Limite de uso atingido. Tente em instantes." }, 429);
    if (res.status === 402) return json({ error: "Créditos esgotados no espaço de trabalho." }, 402);
    if (!res.ok) return json({ error: "Falha ao gerar análise" }, 500);
    const d = await res.json();
    const raw = String(d.choices?.[0]?.message?.content ?? "{}").replace(/```json|```/g, "").trim();
    let draft: Record<string, unknown>;
    try { draft = JSON.parse(raw); } catch { draft = JSON.parse(jsonrepair(raw)); }
    // Preserve supplied content without letting objects reach React or rewriting its meaning.
    if (draft.content && typeof draft.content === "object") {
      const lines = (value: unknown): string => typeof value === "string" ? value : Array.isArray(value)
        ? value.map(lines).join("\n") : value && typeof value === "object"
          ? Object.entries(value).map(([key, v]) => `${key}\n${lines(v)}`).join("\n\n") : String(value ?? "");
      draft.content = lines(draft.content);
      if (Array.isArray(draft.roteiros_retencao)) for (const script of draft.roteiros_retencao) {
        if (Array.isArray(script?.blocos)) for (const block of script.blocos) block.caminho = ["content"];
      }
    }
    const parsed = await reviewWithGateway(draft, apiKey ?? "", creatorScriptPrompt(profile, body)) as Record<string, unknown>;
    if (typeof parsed.content !== "string") return json({ error: "Resposta inválida. Tente novamente." }, 502);
    return json({ result: parsed.content, planejamento_retencao: parsed.planejamento_retencao, critica_retencao: parsed.critica_retencao });
  } catch (e) { return json({ error: e instanceof Error ? e.message : "Erro" }, 500); }
});
