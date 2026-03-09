import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, transcription, audioDuration } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!transcription) throw new Error("No transcription provided");

    // Fetch user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, objetivo_principal, vet_kcal, protein_g, perfil_comportamental")
      .eq("user_id", userId)
      .single();

    // Build AI prompt to extract foods, mood, and context
    const prompt = `Você é um assistente nutricional. Analise a transcrição de voz de um usuário registrando sua refeição e extraia as informações.

TRANSCRIÇÃO:
"${transcription}"

CONTEXTO DO USUÁRIO:
- Nome: ${profile?.full_name || "Usuário"}
- Objetivo: ${profile?.objetivo_principal || "não definido"}
- Meta calórica: ${profile?.vet_kcal || 2000}kcal

EXTRAIA:
1. Alimentos mencionados com porções estimadas (use medidas brasileiras: escumadeira, concha, palma da mão, colher de sopa)
2. Macros estimados para cada alimento
3. Tipo de refeição (se mencionado: café, almoço, lanche, jantar)
4. Estado emocional/humor (se mencionado)
5. Contexto adicional (treino, trabalho, evento social, etc)

Retorne JSON:
{
  "foods": [
    {
      "name": "nome do alimento",
      "portion": "descrição da porção",
      "grams": número estimado em gramas,
      "kcal": número,
      "protein": número,
      "carbs": número,
      "fat": número
    }
  ],
  "meal_type": "cafe_manha" | "lanche_manha" | "almoco" | "lanche_tarde" | "jantar" | "ceia" | null,
  "mood": "animado" | "cansado" | "estressado" | "tranquilo" | "ansioso" | null,
  "context": "string descrevendo contexto adicional" | null,
  "total_kcal": número,
  "total_protein": número,
  "total_carbs": número,
  "total_fat": número,
  "feedback": "mensagem curta e motivacional para o usuário"
}

IMPORTANTE:
- Se não conseguir identificar um alimento claramente, pergunte no feedback
- Use porções típicas brasileiras quando não especificado
- Priorize proteína na análise para dar feedback útil
- Seja breve e direto no feedback

Responda APENAS com JSON válido.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.text();
      console.error("AI error:", err);
      throw new Error("AI extraction failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        foods: [],
        meal_type: null,
        mood: null,
        context: null,
        total_kcal: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        feedback: "Não consegui processar o áudio. Pode repetir ou digitar os alimentos?",
      };
    }

    // Save voice check-in record
    const { data: checkin, error: insertError } = await supabase
      .from("voice_checkins")
      .insert({
        user_id: userId,
        audio_duration: audioDuration || 0,
        transcription: transcription,
        extracted_foods: parsed.foods || [],
        extracted_mood: parsed.mood,
        extracted_context: parsed.context,
        confirmed: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
    }

    // Calculate remaining protein for the day
    const today = new Date().toISOString().split("T")[0];
    const { data: todayMeals } = await supabase
      .from("meal_logs")
      .select("total_protein")
      .eq("user_id", userId)
      .eq("meal_date", today);

    const consumedProtein = todayMeals?.reduce((s, m) => s + (m.total_protein || 0), 0) || 0;
    const targetProtein = profile?.protein_g || 150;
    const remainingProtein = Math.max(0, targetProtein - consumedProtein - (parsed.total_protein || 0));

    return new Response(JSON.stringify({
      success: true,
      checkin_id: checkin?.id,
      extraction: {
        foods: parsed.foods,
        meal_type: parsed.meal_type,
        mood: parsed.mood,
        context: parsed.context,
        totals: {
          kcal: parsed.total_kcal || 0,
          protein: parsed.total_protein || 0,
          carbs: parsed.total_carbs || 0,
          fat: parsed.total_fat || 0,
        },
      },
      feedback: parsed.feedback,
      remaining_protein: remainingProtein,
      transcription: transcription,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-voice-checkin error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
