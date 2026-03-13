import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pontos_se, pontos_ei, pontos_pp, pontos_am, perfil_principal, perfil_secundario } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Você é o sistema de análise comportamental do nutriON.

# RESULTADO DO ASSESSMENT
Pontuação SE (Sabotador Emocional): ${pontos_se}
Pontuação EI (Executor Inconsistente): ${pontos_ei}
Pontuação PP (Perfeccionista Paralisado): ${pontos_pp}
Pontuação AM (Atleta Mental): ${pontos_am}
Perfil principal: ${perfil_principal}
Perfil secundário: ${perfil_secundario}

# INSTRUÇÃO
Gere o texto da tela de revelação de perfil em formato JSON.
Tom: revelador, preciso, sem julgamento, levemente surpreendente.
O usuário deve sentir que o app 'o entendeu de verdade'.

# FORMATO DE RESPOSTA (JSON puro, sem markdown):
{
  "titulo_perfil": "string (Ex: 'Você é um Executor Inconsistente')",
  "headline": "string (1 frase que resume o perfil, max 80 chars)",
  "descricao": "string (2-3 linhas sobre o perfil, 120-180 chars)",
  "ponto_forte": "string (O maior ativo deste perfil, 1 linha)",
  "desafio_central": "string (O maior obstáculo, 1 linha, sem julgamento)",
  "como_nutrion_ajuda": "string (Como o app foi adaptado para este perfil, 2 linhas)",
  "cta": "string (Texto do botão de ação, max 35 chars)",
  "perfil_secundario_nota": "string (Breve menção ao 2o perfil, 1 linha)"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você gera JSONs precisos para o sistema nutriON. Responda APENAS com JSON válido, sem markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let result;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      result = { raw: content };
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-pca-result error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
