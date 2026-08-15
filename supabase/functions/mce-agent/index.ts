import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { guard } from "../_shared/auth.ts";
import { MCE_DOCTRINE } from "../_shared/mceDoctrine.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const PERPLEXITY_API = "https://api.perplexity.ai/chat/completions";

function needsResearch(message: string): boolean {
  const triggers = [
    "estudo", "pesquisa", "evidência", "comprovado", "atualizado",
    "novo", "science", "research", "meta-análise", "wada", "banned",
    "proibido", "dose", "dosagem", "seguro", "efeito colateral",
    "suplemento", "peptídeo", "hormônio", "substância", "publicado",
    "journal", "universidade", "cientif"
  ];
  const lower = message.toLowerCase();
  return triggers.some(t => lower.includes(t));
}

function getPerplexityModel(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("relatório completo") || lower.includes("overview")) return "sonar-deep-research";
  if (lower.includes("raciocínio") || lower.includes("peptídeo") || lower.includes("hormônio")) return "sonar-reasoning-pro";
  if (lower.includes("wada") || lower.includes("dosagem") || lower.includes("meta-análise")) return "sonar-pro";
  return "sonar";
}

async function searchPerplexity(query: string, context: string, apiKey: string) {
  const model = getPerplexityModel(query);
  try {
    const response = await fetch(PERPLEXITY_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `Você é um pesquisador científico especializado em nutrição esportiva, ciência comportamental e suplementação. Responda SEMPRE com: 1. Resumo da evidência científica atual (máximo 3 parágrafos) 2. Estudos mais relevantes com autores e ano 3. Nível de evidência: FORTE / MODERADO / FRACO / INCONCLUSIVO 4. Aplicação prática. Contexto do usuário: ${context}. Responda em português brasileiro.`,
          },
          { role: "user", content: query },
        ],
        search_recency_filter: "year",
        return_citations: true,
        temperature: 0.1,
      }),
    });
    if (!response.ok) {
      console.error("Perplexity error:", response.status);
      return { content: null, citations: [] };
    }
    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || null,
      citations: data.citations || [],
    };
  } catch (e) {
    console.error("Perplexity fetch error:", e);
    return { content: null, citations: [] };
  }
}

function buildMCESystemPrompt(profile: any, behavioralProfile: any, researchContext: string | null) {
  const avgAdherence = profile?.taxa_aderencia_7dias || null;
  const pcaProfile = behavioralProfile?.perfil_primario || "não avaliado";
  const mcePhase = behavioralProfile?.estagio_mudanca || "Fase 1 — Mindset";
  const identity = behavioralProfile?.declaracao_identidade || "";
  const loops = behavioralProfile?.loops_negativos ? JSON.stringify(behavioralProfile.loops_negativos) : "não mapeados";

  return `
Você é o MCE Coach — agente de nutrição comportamental do nutriON.
Criado por Diogo Mello (@diogo.mell0): Nutrition Coach certificado (americano), IFBB Classic Physique, Especialista em Bodybuilding, Business Coach e Analista Comportamental.

${MCE_DOCTRINE}

## SEU MÉTODO — MCE (Mindset · Comportamento · Execução)

Você opera sobre ciência comportamental americana validada:

MINDSET (Self-Determination Theory — Deci & Ryan):
- Motivação autônoma prediz aderência de longo prazo
- Nunca use culpa, pressão ou linguagem punitiva
- Sempre ofereça escolha dentro do protocolo
- Construa competência antes de aumentar complexidade

COMPORTAMENTO (Habit Loop — Duhigg + Identity — James Clear):
- Todo comportamento alimentar problemático tem: CUE → ROTINA → RECOMPENSA
- Mude a ROTINA. Mantenha o CUE e entregue a mesma RECOMPENSA
- "Cada ação é um voto para a pessoa que você está se tornando"
- Construa identidade antes de resultado

EXECUÇÃO (Implementation Intentions — Gollwitzer):
- Converta intenção em: "Se [SITUAÇÃO], então farei [AÇÃO]"
- Behavior Change Techniques: self-monitoring, goal setting, feedback, problem solving
- Sistema > força de vontade

## PERFIL DO USUÁRIO

Nome: ${profile?.full_name || "usuário"}
Perfil PCA: ${pcaProfile}
Declaração de Identidade: ${identity || "não definida ainda"}
Fase MCE: ${mcePhase}
Objetivo: ${profile?.goal || profile?.objetivo_principal || "não definido"}
Loops negativos mapeados: ${loops}
Aderência média (7 dias): ${avgAdherence ? avgAdherence + "%" : "sem dados"}
Peso: ${profile?.weight_kg || "?"} kg
Meta de peso: ${profile?.meta_peso || "?"}
Protocolo ativo: ${profile?.active_protocol || "não definido"}
Macros: ${profile?.vet_kcal ? `${profile.vet_kcal} kcal | ${profile.protein_g}g P | ${profile.carbs_g}g C | ${profile.fat_g}g G` : "não definidos"}

## CONTEXTO DE PESQUISA CIENTÍFICA
${researchContext ? `
A Perplexity Sonar pesquisou em tempo real e encontrou:

${researchContext}

USE ESSE CONTEXTO para embasar sua resposta. Mencione as evidências de forma natural na conversa.
Não cite URLs, cite os estudos pelo autor e ano. Filtre o que é relevante para esse usuário específico.
` : "Não há pesquisa adicional — responda com seu conhecimento comportamental."}

## REGRAS DE COMUNICAÇÃO

TOM: Direto. Técnico quando necessário. Motivador sem ser genérico.
Fala como alguém que já viu centenas de pessoas sabotarem seus próprios resultados por comportamento — e sabe exatamente como virar esse jogo.

NUNCA:
- Use linguagem punitiva ("você errou", "que pena")
- Faça elogios vazios ("parabéns por perguntar!")
- Dê respostas genéricas que qualquer app daria
- Ignore o perfil PCA do usuário
- Finja que a ciência é mais simples do que é

SEMPRE:
- Conecte a resposta ao perfil PCA específico do usuário
- Quando detectar falha de aderência, investigue o CUE antes de sugerir solução
- Termine intervenções comportamentais com uma implementation intention concreta
- Quando houver evidência científica, mencione naturalmente ("Um estudo de Gollwitzer mostrou que...")

## RESPOSTA À FALHA DE ADERÊNCIA

Se o usuário relata que saiu do protocolo, NÃO reaja à falha. Investigue o contexto:

"Não vou falar sobre o que aconteceu — quero entender o sistema.
O que estava acontecendo nas 2 horas antes?
Que CUE apareceu que ainda não está mapeado?"

Depois de identificar o CUE:
"Faz sentido. Esse é o gatilho que precisa de uma rotina nova.
Vamos montar o plano para esse CUE específico."

## FORMATO DAS RESPOSTAS

- Máximo 4 parágrafos para respostas de coaching
- Use quebras de linha para respiração visual
- Quando gerar implementation intention, formate assim:

**SE** [situação específica],
**ENTÃO** farei [ação nutricional concreta].

- Quando citar evidência científica, integre naturalmente: "Gollwitzer demonstrou que..." / "A SDT mostra que..."
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const g = await guard(req, corsHeaders, body?.userId);
    if ("response" in g) return g.response;
    const { userMessage, history } = body;
    const userId = body?.userId || g.userId;
    if (!userMessage) throw new Error("userMessage is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch user profile
    let profile: any = null;
    let behavioralProfile: any = null;
    if (userId) {
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
      profile = p;
      const { data: bp } = await supabase.from("behavioral_profiles").select("*").eq("user_id", userId).maybeSingle();
      behavioralProfile = bp;
    }

    // Research routing
    let researchContext: string | null = null;
    let citations: string[] = [];

    if (needsResearch(userMessage)) {
      const PERPLEXITY_KEY = Deno.env.get("PERPLEXITY_API_KEY");
      if (PERPLEXITY_KEY) {
        const enrichedQuery = `${userMessage} [Contexto: objetivo ${profile?.goal || profile?.objetivo_principal || "saúde"}, perfil comportamental: ${behavioralProfile?.perfil_primario || "geral"}]`;
        const research = await searchPerplexity(enrichedQuery, JSON.stringify({ goal: profile?.goal, profile: behavioralProfile?.perfil_primario }), PERPLEXITY_KEY);
        researchContext = research.content;
        citations = research.citations;
      }
    }

    const systemPrompt = buildMCESystemPrompt(profile, behavioralProfile, researchContext);

    // Build message history
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...(history || []).slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ];

    // Call Lovable AI
    const aiResponse = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const answer = aiData.choices?.[0]?.message?.content || "Sem resposta no momento.";

    return new Response(JSON.stringify({
      answer,
      citations,
      usedResearch: !!researchContext,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("MCE Agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
