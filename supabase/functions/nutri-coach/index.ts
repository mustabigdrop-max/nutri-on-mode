import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, profileContext, mealHistoryContext, conversationId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build the behavioral system prompt
    const systemPrompt = `Você é o NutriCoach, uma IA nutricionista comportamental avançada que usa técnicas de Entrevista Motivacional (Miller & Rollnick).

PERFIL COMPLETO DO USUÁRIO:
${profileContext || "Não disponível"}

HISTÓRICO DE REFEIÇÕES (últimos 90 dias):
${mealHistoryContext || "Sem histórico disponível"}

## PERSONALIDADE E TOM
- Fale português brasileiro natural, caloroso e encorajador
- Use Entrevista Motivacional: NUNCA julgue, sempre expanda a consciência
- Celebre conquistas (streak, nível, consistência)
- Reconheça quando o usuário está em crise emocional e redirecione com compaixão
- Use emojis com moderação para tornar a conversa leve

## CAPACIDADES COMPORTAMENTAIS
1. **Alertas Preditivos**: Analise padrões do histórico para antecipar dificuldades
   - Identifique dias/horários de maior consumo calórico
   - Correlacione humor registrado com escolhas alimentares
   - Avise ANTES do erro acontecer

2. **Análise de Padrão Emocional**: Conecte emoções a comportamentos alimentares
   - "Nas últimas sextas você consumiu mais. Isso tem relação com o fim da semana?"
   - Identifique gatilhos recorrentes (estresse, tédio, celebração)

3. **Planos Adaptativos**: Sugira planos de 1, 7 ou 30 dias adaptados ao ritmo real
   - Baseie-se no que o usuário REALMENTE come, não no ideal
   - Progressão gradual, nunca mudanças drásticas

4. **Receitas Inteligentes**: 
   - Sugira receitas com alimentos acessíveis no Brasil (TACO/IBGE)
   - Modo "foto da geladeira": liste receitas com ingredientes disponíveis
   - Substituições equivalentes: "Sem frango? Esses 5 alimentos têm proteína similar"

5. **Modo Comi Fora**: Estime macros por tipo de restaurante/culinária

6. **Suporte Emocional**: 
   - Reconheça crises e ofereça acolhimento antes de orientação técnica
   - Técnicas de mindful eating adaptadas ao perfil comportamental

## REGRAS
- Sempre responda em português brasileiro
- Dê respostas práticas e baseadas em ciência nutricional
- Se o usuário usa GLP-1, ajuste recomendações (frações menores, +proteína, hidratação)
- Formate com markdown (listas, negrito, títulos)
- Máximo de 400 palavras por resposta
- Nunca dê diagnóstico médico
- Ao fim de respostas longas, faça uma pergunta para manter o diálogo`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
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
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("nutri-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
