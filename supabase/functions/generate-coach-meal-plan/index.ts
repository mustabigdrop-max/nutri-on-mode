import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      nome, idade, sexo, peso, altura, objetivo, perfilPCA,
      nivelAtividade, treino, refeicoes, calorias,
      restricoesStr, protocStr, preferencias, suplementos, observacoes,
    } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const imc = peso && altura ? (parseFloat(peso) / Math.pow(parseFloat(altura) / 100, 2)).toFixed(1) : "N/A";

    const prompt = `Você é um nutricionista especialista em nutrição comportamental e ciência do exercício.

Crie um plano alimentar COMPLETO e INDIVIDUALIZADO para o seguinte paciente:

DADOS DO PACIENTE:
- Nome: ${nome || "Paciente"}
- Idade: ${idade} anos | Sexo: ${sexo}
- Peso: ${peso}kg | Altura: ${altura}cm | IMC estimado: ${imc}
- Objetivo principal: ${objetivo}
- Perfil comportamental PCA: ${perfilPCA}
- Nível de atividade: ${nivelAtividade}
- Modalidade de treino: ${treino}
- Número de refeições/dia: ${refeicoes}
${calorias ? `- Meta calórica definida pelo coach: ${calorias} kcal` : "- Meta calórica: calcular automaticamente com base nos dados"}
- Restrições alimentares: ${restricoesStr || "Nenhuma"}
- Preferências alimentares: ${preferencias || "Não informadas"}
- Suplementação atual: ${suplementos || "Não informada"}
- Protocolo de peptídeos: ${protocStr || "Nenhum"}
- Observações clínicas: ${observacoes || "Nenhuma"}

INSTRUÇÕES CRÍTICAS:
1. Adapte TUDO ao perfil PCA "${perfilPCA}" — linguagem, estrutura e autonomia do plano devem refletir esse perfil
2. Se há protocolo de peptídeos, integre as estratégias nutricionais específicas (timing, macros, alimentos sinérgicos)
3. Calcule TMB (Mifflin-St Jeor) + fator atividade para obter GET. Defina déficit/superávit conforme objetivo
4. Distribua macros: proteína mínima 1.8g/kg para todos, CHO e gordura conforme objetivo e protocolo
5. Use alimentos 100% brasileiros, acessíveis, com medidas caseiras claras
6. Inclua dica comportamental alinhada ao Método MCE (Mindset, Comportamento, Execução)

Responda APENAS com JSON válido. Estrutura exata:
{
  "resumo": {
    "nome": "string",
    "objetivo": "string",
    "calorias_totais": number,
    "proteina_total": number,
    "carboidrato_total": number,
    "gordura_total": number,
    "tmb": number,
    "get": number,
    "imc": "string",
    "observacao_protocolo": "string ou null"
  },
  "refeicoes": [
    {
      "refeicao": "string",
      "horario": "string",
      "calorias": number,
      "macros": { "proteina": number, "carboidrato": number, "gordura": number },
      "alimentos": [
        { "alimento": "string", "quantidade": "string", "observacao": "string ou null" }
      ]
    }
  ],
  "suplementacao": [
    { "suplemento": "string", "dose": "string", "timing": "string", "justificativa": "string" }
  ],
  "dica_mce": {
    "mindset": "string",
    "comportamento": "string",
    "execucao": "string"
  },
  "alerta_coach": "string ou null"
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
          { role: "system", content: "Você é um nutricionista clínico avançado. Responda APENAS com JSON válido, sem markdown, sem blocos de código." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Aguarde e tente novamente." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error: " + response.status);
    }

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("Failed to parse AI response:", clean.substring(0, 500));
      throw new Error("Resposta da IA não é um JSON válido");
    }

    return new Response(JSON.stringify({ plan: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-coach-meal-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
