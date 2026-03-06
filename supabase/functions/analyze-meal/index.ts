import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, query, imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let messages: any[];

    if (mode === "photo") {
      // Photo analysis with vision
      messages = [
        {
          role: "system",
          content: `Você é um nutricionista especialista em análise visual de alimentos. Analise a foto da refeição e retorne APENAS um JSON válido sem markdown, sem backticks.

Formato obrigatório:
{"foods":[{"name":"string","portion":"string","kcal":number,"protein":number,"carbs":number,"fat":number}],"comment":"string"}

Regras:
- Identifique TODOS os alimentos visíveis no prato
- Estime porções em medidas caseiras brasileiras (colher de sopa, xícara, fatia, unidade, gramas)
- Use valores nutricionais da tabela TACO/IBGE
- O "comment" deve ser uma dica rápida sobre a refeição (qualidade, equilíbrio, sugestão)
- Responda APENAS com o JSON, sem texto extra`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analise esta foto de refeição e identifique os alimentos com macros:" },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ];
    } else {
      // Text-based AI food search
      messages = [
        {
          role: "system",
          content: `Você é um nutricionista especialista em alimentos brasileiros. O usuário descreve o que comeu em linguagem natural. Retorne APENAS um JSON válido sem markdown, sem backticks.

Formato obrigatório:
{"foods":[{"name":"string","portion":"string","kcal":number,"protein":number,"carbs":number,"fat":number}],"comment":"string"}

Regras:
- Interprete descrições em português brasileiro coloquial
- Use valores da tabela TACO/IBGE
- Porções em medidas caseiras (colher de sopa, xícara, fatia, unidade, concha, etc.)
- Se mencionou "prato de arroz com feijão", separe em itens individuais com porções típicas
- O "comment" deve ser uma dica rápida sobre a refeição
- Responda APENAS com o JSON, sem texto extra`
        },
        {
          role: "user",
          content: `Analise esta descrição de refeição e retorne os alimentos com macros: "${query}"`
        }
      ];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: mode === "photo" ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro na análise" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle potential markdown wrapping)
    let parsed;
    try {
      const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Não foi possível analisar a resposta da IA", raw: content }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-meal error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
