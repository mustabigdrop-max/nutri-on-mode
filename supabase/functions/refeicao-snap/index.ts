import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { tipo, texto, imagemBase64, perfilUsuario } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const perfilTexto = perfilUsuario
      ? `Perfil: sexo ${perfilUsuario.sexo || "?"}, ${perfilUsuario.idade || "?"} anos, peso ${perfilUsuario.peso || "?"}kg, objetivo: ${perfilUsuario.objetivo || "?"}, meta calórica: ${perfilUsuario.metaCalorica || "?"}kcal/dia.`
      : "";

    const systemPrompt = `Você é o Agente Nutricional do nutriON, especialista em análise de refeições com base na tabela TACO e USDA FoodData Central.
Analise refeições e retorne APENAS JSON válido, sem markdown, sem backticks, sem texto extra.

${perfilTexto}

Retorne este JSON exato:
{
  "refeicao": {
    "descricao": "string",
    "itens": [{"alimento":"string","porcao_g":number,"calorias":number,"proteinas_g":number,"carboidratos_g":number,"gorduras_g":number,"fibras_g":number}]
  },
  "totais": {
    "calorias":number,"proteinas_g":number,"carboidratos_g":number,"carboidratos_simples_g":number,"carboidratos_complexos_g":number,"fibras_g":number,
    "gorduras_g":number,"gorduras_saturadas_g":number,"gorduras_insaturadas_g":number,"gorduras_trans_g":number,"sodio_mg":number,"indice_glicemico":"baixo|medio|alto"
  },
  "micronutrientes": {
    "vitamina_c_pct":number,"vitamina_a_pct":number,"vitamina_d_pct":number,"ferro_pct":number,"calcio_pct":number,
    "magnesio_pct":number,"zinco_pct":number,"potassio_pct":number,"antioxidantes":["string"],"prebioticos_presentes":boolean
  },
  "score": {"total":number,"classificacao":"string","emoji":"string","densidade_nutricional":number,"equilibrio_macros":number,"qualidade_alimentos":number,"indice_inflamatorio":number},
  "insights": {
    "o_que_faz_nas_proximas_2h":"string","ponto_forte":"string","o_que_faltou":"string","sugestao_complemento":"string","impacto_microbioma":"string"
  },
  "social": {
    "legenda_educativa":"string","legenda_motivacional":"string","legenda_casual":"string",
    "hashtags":["string"],"frase_destaque":"string"
  }
}`;

    let messages: any[];

    if (tipo === "foto" && imagemBase64) {
      messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Analise esta foto de refeição e retorne o JSON completo." },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imagemBase64}` } },
          ],
        },
      ];
    } else {
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analise esta refeição: "${texto}"` },
      ];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: tipo === "foto" ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Tente em alguns segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "Erro na análise" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let analise;
    try {
      analise = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
    } catch {
      console.error("Parse fail:", content);
      return new Response(JSON.stringify({ error: "Erro ao processar resposta da IA", raw: content }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, analise }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("refeicao-snap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
