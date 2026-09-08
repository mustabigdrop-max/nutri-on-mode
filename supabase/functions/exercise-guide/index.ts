import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GUIDE_PROMPT = `Você é o Coach Diogo Mello explicando um exercício de musculação para alguém que pode ser iniciante completo.

REGRAS:
- Linguagem SIMPLES e direta, como se estivesse do lado da pessoa na academia.
- Nunca usar jargão sem explicar (ex: "pegada pronada (palmas viradas pra frente)").
- Os passos devem trazer cues sensoriais ("sinta", "imagine", "pense em").
- Cada erro comum precisa de uma correção prática, com metáfora quando fizer sentido.
- Cite o aparelho como a pessoa vai encontrar na academia (nomes alternativos ajudam).
- Nada de emojis. Nada de mencionar sistemas, tecnologia ou análise automatizada.

Responda SOMENTE com JSON puro neste formato:
{
  "aparelho": "Nome do aparelho/máquina e como identificar na academia",
  "ajuste": "Como ajustar o equipamento para o corpo da pessoa",
  "pegada": "Tipo de pegada e posição das mãos, explicado em linguagem simples",
  "passos": ["Passo 1 ...", "Passo 2 ...", "Passo 3 ...", "Passo 4 ..."],
  "erros": [{ "erro": "o que a pessoa faz errado", "correcao": "cue prático para corrigir" }],
  "musculos": [{ "nome": "Grande dorsal", "tipo": "principal", "ativacao": 85 }],
  "dica_coach": "Dica prática, tom pessoal, como se estivesse falando com a pessoa"
}
Use 4 a 6 passos, 3 erros e 3 a 4 músculos (1 principal, o resto secundário, ativação de 0 a 100).`;

const ANSWER_PROMPT = `Você é o Coach Diogo Mello respondendo a dúvida de um aluno sobre um exercício do treino dele.
Responda em 2 a 4 frases, tom direto, prático e acolhedor, em português do Brasil.
Se o aluno não tem o aparelho, dê a alternativa exata e o que ajustar. Sem jargão. Sem emojis. Só o texto da resposta, sem aspas.`;

async function callAI(system: string, user: string, key: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI error: ${res.status}`);
  const data = await res.json();
  return String(data.choices?.[0]?.message?.content || "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const mode: string = body?.mode || "guide";
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) throw new Error("LOVABLE_API_KEY not configured");

    if (mode === "answer") {
      const text = await callAI(
        ANSWER_PROMPT,
        `Aluno: ${body?.client_name || "aluno"}\nExercício: ${body?.exercise_name || ""}\nTreino: ${
          body?.day_label || "-"
        }\nDúvida: ${body?.question || ""}`,
        key,
      );
      return new Response(JSON.stringify({ answer: text.trim() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = await callAI(
      GUIDE_PROMPT,
      `Exercício: ${body?.exercise_name || ""}\nGrupo muscular alvo: ${
        body?.muscle_target || "não informado"
      }\nTempo prescrito: ${body?.tempo || "não informado"}`,
      key,
    );
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let guide: unknown;
    try {
      guide = JSON.parse(cleaned);
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      guide = m ? JSON.parse(m[0]) : null;
    }
    if (!guide) throw new Error("Não foi possível montar o guia deste exercício.");

    return new Response(JSON.stringify({ guide }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
