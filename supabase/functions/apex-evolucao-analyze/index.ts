// APEX Evolução — análise visual semanal com Gemini 2.5 Pro (vision)
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPT = `Você é o APEX Visual Coach do nutriON — o sistema de análise visual de atletas de fisiculturismo mais avançado do Brasil.
Você analisa fotos como Hany Rambod, Neil Hill e Chad Nicholls. Linguagem técnica, direta, sem elogios vazios.

Retorne APENAS JSON válido (sem markdown, sem texto fora do JSON):
{
  "score_geral": number (0-10, uma casa decimal),
  "score_separacao": number (0-10),
  "score_textura": number (0-10),
  "score_dureza": number (0-10),
  "score_proporcao": number (0-10),
  "parecer_geral": "string — 2-3 frases como um top coach diria olhando o atleta",
  "pontos_fortes": ["string","string","string"],
  "pontos_fracos": ["string","string","string"],
  "grupos_prioritarios": [{"musculo":"nome","score":number,"observacao":"string"}],
  "ajustes_semana": {
    "dieta":"string","treino":"string","cardio":"string"
  },
  "delta_comparativo": {
    "evolucao":"melhorou|manteve|piorou",
    "delta_texto":"string ou null",
    "pontos_melhorados":["string"],
    "pontos_regredidos":["string"]
  },
  "stage_readiness_score": number (0-100, inteiro),
  "stage_readiness_label":"Fora de Forma|Longe do Palco|No Caminho|Pronto para Competir|Elite",
  "recomendacao_coach":"string — 1 frase final"
}

Se a foto tiver qualidade baixa demais para analisar, retorne score_geral = null e parecer_geral explicando o motivo.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      atletaNome, categoriaAtleta, semana, semanasRestantes, fase,
      peso, bf, fotoAtualBase64, fotoAtualMime = "image/jpeg",
      fotoAnteriorBase64, fotoAnteriorMime = "image/jpeg",
    } = body ?? {};

    if (!fotoAtualBase64) {
      return new Response(JSON.stringify({ error: "fotoAtualBase64 é obrigatória" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY ausente" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userContent: any[] = [
      {
        type: "text",
        text:
`Analise este atleta:
Nome: ${atletaNome ?? "—"}
Categoria: ${categoriaAtleta ?? "—"}
Semana de preparação: ${semana ?? "—"}
Semanas até o palco: ${semanasRestantes ?? "—"}
Fase: ${fase ?? "—"}
Peso: ${peso ?? "—"}kg | BF: ${bf ?? "—"}%

${fotoAnteriorBase64
  ? `Esta é a foto da SEMANA ${semana}. Logo a seguir está a foto da SEMANA ${Number(semana) - 1} para comparação direta.`
  : "Esta é a PRIMEIRA foto de avaliação deste atleta — sem comparativo."}`
      },
      {
        type: "image_url",
        image_url: { url: `data:${fotoAtualMime};base64,${fotoAtualBase64}` },
      },
    ];

    if (fotoAnteriorBase64) {
      userContent.push(
        { type: "text", text: `Foto da semana anterior (semana ${Number(semana) - 1}):` },
        { type: "image_url", image_url: { url: `data:${fotoAnteriorMime};base64,${fotoAnteriorBase64}` } },
      );
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições da IA atingido. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos da IA esgotados. Adicione saldo no workspace Lovable." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: `IA falhou: ${t}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let analise: any;
    try {
      analise = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      const match = String(raw).match(/\{[\s\S]*\}/);
      analise = match ? JSON.parse(match[0]) : { error: "Resposta inválida da IA", raw };
    }

    return new Response(JSON.stringify({ analise }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
