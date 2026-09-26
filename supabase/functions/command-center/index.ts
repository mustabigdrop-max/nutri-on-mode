import { COMMAND_CENTER_SPEC } from "./spec.ts";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const TOOLS: Record<string, string> = {
  decoder: "FERRAMENTA 1: VIRAL DECODER", forge: "FERRAMENTA 2: CONTENT FORGE",
  hooks: "FERRAMENTA 3: HOOK LAB", sniper: "FERRAMENTA 4: SALES SNIPER",
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    if (!req.headers.get("Authorization")) return json({ error: "Não autenticado" }, 401);
    const { tool, input } = await req.json();
    if (!TOOLS[tool] || !String(input || "").trim()) return json({ error: "Escolha a ferramenta e preencha o campo" }, 400);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const system = `${COMMAND_CENTER_SPEC}\n\nEXECUTE AGORA APENAS a ${TOOLS[tool]}. Responda em português do Brasil, exatamente no "Formato de Saída" dessa ferramenta (texto puro, sem markdown com ** ou #). Nunca escreva "IA" ou "AI". Nunca invente estudos, números de pesquisa ou códigos NEXUS: se não tiver certeza, escreva "sem referência confirmada". Métricas de score são estimativas da análise.`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: [{ role: "system", content: system }, { role: "user", content: String(input).slice(0, 4000) }] }),
    });
    if (res.status === 429) return json({ error: "Limite de uso atingido. Tente em instantes." }, 429);
    if (res.status === 402) return json({ error: "Créditos esgotados no espaço de trabalho." }, 402);
    if (!res.ok) return json({ error: "Falha ao gerar análise" }, 500);
    const d = await res.json();
    return json({ result: d.choices?.[0]?.message?.content ?? "" });
  } catch (e) { return json({ error: e instanceof Error ? e.message : "Erro" }, 500); }
});
