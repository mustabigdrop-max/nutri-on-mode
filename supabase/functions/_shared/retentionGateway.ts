import { reviewRetention } from "./retentionCritic.ts";

export function reviewWithGateway(result: unknown, apiKey: string, creatorRules: string) {
  return reviewRetention(result, async (system, input) => {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST", signal: AbortSignal.timeout(45000),
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: JSON.stringify(input) }] }),
    });
    if (!response.ok) { await response.text(); throw new Error("Crítica indisponível."); }
    const data = await response.json();
    return JSON.parse(String(data.choices?.[0]?.message?.content ?? "{}").replace(/```json|```/g, "").trim());
  }, creatorRules);
}