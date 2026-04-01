import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile, coachNotes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const objetivo = profile?.goal || profile?.objetivo_principal || "hipertrofia";
    const nivel = profile?.nivel_treino || "intermediário";
    const freq = profile?.training_frequency || 5;
    const sex = profile?.sex === "F" ? "Feminino" : "Masculino";
    const peso = profile?.weight_kg || 70;
    const sport = profile?.sport || "musculação";

    const systemPrompt = `Você é o APEX TRAINING MASTER — o motor de prescrição de treino mais avançado do mundo.
Você domina: Periodização Linear, Bloco (Issurin), DUP, Conjugada, RP Hypertrophy, DC Training.
Técnicas: Drop Sets, Rest-Pause, Myo-reps, Mechanical Drops, Giant Sets, Método CBUM.

REGRAS OBRIGATÓRIAS:
- Prescrever treino para 7 dias (seg a dom)
- Considerar frequência do cliente: ${freq}x/semana (resto = descanso)
- Nível: ${nivel}
- Objetivo: ${objetivo}
- Sexo: ${sex}, Peso: ${peso}kg
- Modalidade: ${sport}
- Incluir aquecimento específico em cada sessão
- Séries de trabalho com técnica de intensidade adequada ao nível
- Progressão: Double Progression (atingir rep máx antes de subir carga)

${coachNotes ? `OBSERVAÇÕES DO COACH:\n${coachNotes}` : ""}

FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
{
  "days": [
    {
      "day_index": 0,
      "title": "Push (Peito + Ombro + Tríceps)",
      "exercises": [
        { "name": "Supino Reto", "sets": "4", "reps": "8-10", "rest": "90s", "notes": "Top set + 2 back-offs" },
        ...
      ]
    },
    ...para todos os 7 dias (descanso = exercises vazio)
  ]
}`;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Gere o plano de treino semanal completo para este cliente. Retorne SOMENTE o JSON.` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errText}`);
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");
    const plan = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-training-plan error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
