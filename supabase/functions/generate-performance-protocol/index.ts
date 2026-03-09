import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { substances, current_phase, objective, experience_level } = await req.json();

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const systemPrompt = `Você é um nutricionista esportivo especializado em atletas avançados que utilizam recursos farmacológicos para performance.

IMPORTANTE: Você NÃO prescreve substâncias. Você gera APENAS o protocolo NUTRICIONAL e de SUPLEMENTAÇÃO DE SUPORTE para quem já está usando.

Com base nas substâncias informadas, fase do ciclo, objetivo e experiência, gere:

1. nutrition_plan: objeto com { calories (string descritiva ex: "+500 acima do TDEE"), protein (string ex: "2.4g/kg"), carbs (string), fat (string), timing (string), hydration (string), notes (string com observações importantes) }

2. support_stack: array de objetos { name, dose, timing, category (hepatico|cardiovascular|hormonal|recuperacao|geral), reason }
   - Sempre incluir suporte hepático se há orais/SARMs
   - Sempre incluir suporte cardiovascular
   - Incluir suporte hormonal

3. safety_alerts: array de objetos { level (warning|critical), message }
   - Trembolona → monitorar PA obrigatório
   - Orais por 6+ semanas → alertar pausa
   - Diuréticos → alerta de eletrólitos
   - Combinações perigosas

4. ai_message: mensagem personalizada em português do Brasil, 3-5 frases, explicando a lógica do protocolo gerado.

REGRAS POR FASE:
- inicio: calorias moderadas, adaptação, exames baseline
- meio: pico anabólico, superávit controlado, monitoramento intenso
- final: preparar saída, redução gradual, exames
- pct: manutenção, proteína alta, suporte hormonal natural
- pre_comp: depleção/supercompensação, manipulação hídrica e de sódio

REGRAS POR OBJETIVO:
- massa: superávit +400-500kcal, proteína 2.2-2.8g/kg, carbo alto
- recomposicao: manutenção ou leve déficit, proteína 2.2-2.5g/kg
- definicao: déficit -300 a -500kcal, proteína 2.5-3.0g/kg, carbo ciclado
- pre_comp: protocolo peak week com fases de depleção e supercompensação

Responda APENAS com JSON válido, sem markdown.`;

    const userPrompt = `Substâncias: ${substances.join(", ")}
Fase: ${current_phase}
Objetivo: ${objective}
Experiência: ${experience_level}`;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        nutrition_plan: { calories: "Consulte um nutricionista", protein: "2.2g/kg", carbs: "Moderado", fat: "Moderado", timing: "4-6 refeições", hydration: "3-4L/dia", notes: "Protocolo padrão" },
        support_stack: [],
        safety_alerts: [{ level: "warning", message: "Protocolo gerado com valores padrão. Consulte um profissional." }],
        ai_message: "Protocolo base gerado. Recomendamos consultar um nutricionista esportivo para personalização completa.",
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
