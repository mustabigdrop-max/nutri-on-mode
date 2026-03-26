import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sintomas, score, perfil } = await req.json();

    if (!sintomas || !Array.isArray(sintomas)) {
      return new Response(
        JSON.stringify({ error: "Sintomas inválidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const perfilContexto = perfil
      ? `Perfil do usuário:
- Sexo: ${perfil.sexo || "não informado"}
- Idade: ${perfil.idade || "não informada"} anos
- Peso: ${perfil.peso || "não informado"} kg
- Objetivo: ${perfil.objetivo || "não informado"}
- Nível de atividade: ${perfil.atividade || "não informado"}
- Meta de fibras calculada: ${perfil.metaFibras || "não calculada"}g/dia
- Score de microbiota: ${score}/100`
      : `Score de microbiota: ${score}/100`;

    const sintomasTexto = sintomas.length > 0 ? sintomas.join(", ") : "nenhum sintoma selecionado";

    let classificacao = "";
    if (score >= 80) classificacao = "Microbiota equilibrada";
    else if (score >= 60) classificacao = "Disbiose leve";
    else if (score >= 40) classificacao = "Disbiose moderada";
    else classificacao = "Disbiose severa";

    const systemPrompt = `Você é o Agente Microbioma do nutriON, especialista em saúde intestinal com base nos estudos do Sonnenburg Lab (Stanford), pesquisa PREDICT (King's College London / Tim Spector), Clarke et al. 2014 sobre microbiota de atletas, Cryan et al. 2019 sobre eixo intestino-cérebro, e diretrizes do NIH Human Microbiome Project.

Sua linguagem é científica mas acessível, direta, sem rodeios. Você acredita que comportamento e consistência vêm antes de qualquer suplemento ou alimento isolado. Nunca substitua avaliação médica — sempre sinalize quando necessário.

Responda SEMPRE em português brasileiro. Seja específico, personalizado e entregue valor real. Nada de respostas genéricas.`;

    const userPrompt = `${perfilContexto}

Sintomas relatados: ${sintomasTexto}
Classificação atual: ${classificacao}

Com base nesse perfil completo, gere uma análise estruturada contendo exatamente:

**1. DIAGNÓSTICO FUNCIONAL**
2-3 frases descrevendo o estado atual da microbiota dessa pessoa com base nos sintomas e perfil. Seja específico — mencione quais famílias bacterianas provavelmente estão desequilibradas.

**2. DESEQUILÍBRIOS IDENTIFICADOS**
Liste os 3 principais desequilíbrios em ordem de prioridade, cada um com 1 linha de explicação.

**3. TOP 5 AÇÕES PRIORITÁRIAS**
Ações concretas e ranqueadas por impacto para ESSA pessoa especificamente. Cada ação com: o que fazer + quando/como + por quê funciona (base científica em 1 linha).

**4. ALIMENTO FUNCIONAL SURPRESA**
Um alimento pouco conhecido ou subutilizado que age diretamente no perfil de sintomas descrito. Explique o mecanismo de ação.

**5. MENSAGEM MOTIVACIONAL nutriON**
Uma frase poderosa alinhada à filosofia: "sua fome nunca foi de comida — o comportamento vem antes do alimento."

---
Se o score for abaixo de 40, inclua ao final uma nota clara recomendando acompanhamento com gastroenterologista ou nutrólogo.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro na API de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("microbioma-agent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
