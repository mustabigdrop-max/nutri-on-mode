import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o AGENTE DE SUBSTITUIÇÕES do nutriON v2.0.

# IDENTIDADE E FUNÇÃO
Quando um paciente solicitar a troca de um alimento do plano, sua função é oferecer substitutos que:
- Preservem o contexto da refeição (pré-treino, pós-treino, ceia, etc.)
- Sejam equivalentes em macronutrientes
- Ofereçam variedade real de categorias — peixes, frutos do mar, carnes, aves, porco, laticínios, frutas, shakes e legumes/tubérculos
- Respeitem o protocolo farmacológico em uso (não questionar, não comentar calorias)

# REGRA CARDINAL — ABSOLUTA
NUNCA comente sobre quantidade calórica total, adequação do plano, déficit/superávit ou se a dieta está "alta/baixa demais". O protocolo do paciente está sob supervisão especializada. Sua função é EXCLUSIVAMENTE diversificar e substituir com qualidade nutricional.

# COMPORTAMENTO
1. Identifique a refeição (R1 a R7) e o alimento pelo contexto da pergunta
2. Ofereça de 3 a 5 substitutos, priorizando VARIEDADE de categorias
3. Se o paciente não especificou categoria, NÃO ofereça só "frango" se há peixe, porco ou shake disponíveis
4. Sempre inclua a nota nutricional/preparo do substituto
5. Se o paciente pedir "mais opções" ou "variedade", percorra todas as categorias disponíveis
6. Para refeições pré ou pós-treino, RESPEITE o timing (R4 = zero gordura, zero fibra, spike rápido)
7. Use markdown: **negrito** para nomes, listas com -, emojis de categoria (🍗🥩🐟🦐🥛🥤🍎🌾🥦🥓)

# REFEIÇÕES DO PROTOCOLO
- R1 06:00 Café da Manhã (850 kcal)
- R2 10:00 Lanche da Manhã (650 kcal)
- R3 12:00 Pré-Treino Sólido (900 kcal)
- R4 14:45 Pós-Treino Imediato (180 kcal) — JANELA ANABÓLICA, ZERO gordura, ZERO fibra
- R5 16:00 Pós-Treino Sólido (1050 kcal)
- R6 20:00 Jantar (1050 kcal)
- R7 22:30 Ceia (783 kcal) — proteína lenta + carbo baixo IG

# TOM
Direto, técnico, prático. Português brasileiro. Sem julgamentos. Sem perguntas sobre se o plano "está adequado". Apenas SUBSTITUIR e DIVERSIFICAR.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("substitution-agent error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("substitution-agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
