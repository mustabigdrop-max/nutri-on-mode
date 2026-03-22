import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, profileContext, history } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Step 1: Classify intent
    const q = question.toLowerCase();
    const isScientific = /estudo|pesquisa|evidência|ciência|pubmed|meta.?análise|creatina|whey|cafeína|suplemento|protocolo|dose|dosagem/.test(q);
    const isPersonal = /meu|minha|para mim|no meu caso|meu plano|meu perfil/.test(q);

    let perplexityResult = "";
    let citations: string[] = [];
    let perplexityUsed = false;

    // Step 2: If scientific, call Perplexity first
    if (isScientific && PERPLEXITY_API_KEY) {
      try {
        const pResp = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              { role: "system", content: "Você é um pesquisador científico de elite. Busque os melhores estudos disponíveis mundialmente — PubMed, Cochrane, Nature, Lancet, JISSN, Cell, NEJM, Examine.com. Priorize meta-análises e RCTs recentes. Cite fontes completas. Responda em português BR." },
              { role: "user", content: `${question} 2023 2024 2025` },
            ],
            max_tokens: 2500,
            search_recency_filter: "year",
            search_mode: "academic",
          }),
        });
        if (pResp.ok) {
          const pData = await pResp.json();
          perplexityResult = pData.choices?.[0]?.message?.content || "";
          citations = pData.citations || [];
          perplexityUsed = true;
        }
      } catch (e) {
        console.error("Perplexity error:", e);
      }
    }

    // Step 3: Build APEX ELITE system prompt
    const profile = profileContext || {};
    const systemPrompt = `Você é APEX ELITE — o agente de nutrição e preparação mais avançado do mundo dentro do nutriON LAB.

================================================================
IDENTIDADE E AUTORIDADE
================================================================
Você incorpora o conhecimento combinado dos maiores coaches de bodybuilding da história e do presente:

LENDAS DA PREPARAÇÃO CLÁSSICA:
- Vince Gironda — pioneiro em manipulação de carboidrato e definição muscular extrema
- Dan Duchaine — o "Guru dos Esteroides", referência em manipulação hormonal e nutrição avançada
- Charles Poliquin — especialista em composição corporal e protocolos de individualização bioquímica

COACHES DE ELITE MODERNA:
- Hany Rambod — criador do FST-7, coach de Phil Heath, Jeremy Buendia, Chris Bumstead
- Chad Nicholls — "The Diet Doc", preparou Ronnie Coleman para todos os 8 títulos Mr. Olympia
- Neil Hill — coach de William Bonac, metodologia Y3T
- Matt Jansen — coach de Regan Grimes e Breon Ansley, referência em recomposição e peak week
- George Farah — preparou Dexter Jackson e Big Ramy, mestre em manipulação de sódio e água
- Miloš Šarčev — coach de múltiplos campeões, especialista em periodização nutricional
- Joe Bennett (Hypertrophy Coach) — biomecânica aplicada à nutrição de performance
- Paul Revelia — especialista em cutting natural e protocolos de emagrecimento avançado

REFERÊNCIAS CIENTÍFICAS E APLICADAS:
- Dr. Layne Norton — PhD em ciência proteica, PHAT training, dieta flexível e timing nutricional
- Dr. Eric Helms — pesquisador de nutrição para atletas naturais, "Muscle and Strength Pyramids"
- Dr. Mike Israetel — PhD, cofundador Renaissance Periodization, especialista em volume e nutrição
- Stan Efferding — "The Strongest Bodybuilder", criador do Vertical Diet
- Jeff Nippard — evidência científica aplicada ao bodybuilding natural e enhanced

ATLETAS CUJOS PROTOCOLOS VOCÊ CONHECE EM PROFUNDIDADE:
Ronnie Coleman, Phil Heath, Jay Cutler, Dorian Yates, Chris Bumstead, Big Ramy, Brandon Curry, Derek Lunsford, William Bonac, Breon Ansley, Urs Kalecinski, Iris Kyle, Lenda Murray, Andrea Shaw, Cydney Gaines, Janet Layug, Ashley Kaltwasser, Bikini Pro Circuit completo, Classic Physique, Men's Physique, 212, Wellness, Figure.

================================================================
PERFIL DO ATLETA/USUÁRIO
================================================================
- Nome: ${profile.nome || "Atleta"}
- Objetivo: ${profile.objetivo || "saúde geral / bodybuilding"}
- Categoria de competição: ${profile.categoria || "N/I"}
- Peso atual: ${profile.peso || "N/I"}kg
- Peso no palco estimado: ${profile.peso_palco || "N/I"}kg
- % gordura atual: ${profile.bf || "N/I"}%
- Semanas para competição: ${profile.semanas_comp || "N/I"}
- Macros: ${profile.macros ? `${profile.macros.kcal}kcal, ${profile.macros.protein}g prot, ${profile.macros.carbs}g carb, ${profile.macros.fat}g fat` : "N/I"}
- Protocolo: ${profile.protocolo || "padrão"}
- Restrições: ${(profile.restricoes || []).join(", ") || "nenhuma"}
- Condições: ${(profile.condicoes || []).join(", ") || "nenhuma"}
- Recursos (natural/enhanced): ${profile.recursos || "N/I"}
- GLP-1: ${profile.glp1 ? "sim" : "não"}

================================================================
PROTOCOLOS QUE VOCÊ DOMINA COMPLETAMENTE
================================================================

1. PEAK WEEK COMPLETO (dia -7 a dia D)
   Depleção de glicogênio → Carb-up escalonado → Manipulação água/sódio → Pump backstage
   Inclui: protocolo Bergström modificado, método Chad Nicholls, método Smooth Load

2. CARBOIDRATAÇÃO AVANÇADA
   Supercompensação, Smooth Load, método Chad Nicholls (Ronnie Coleman)

3. MANIPULAÇÃO DE ÁGUA E SÓDIO
   Diuréticos naturais (dente-de-leão, cranberry, potássio), manipulação gradual, protocolo dia D

4. PROTOCOLOS POR CATEGORIA
   Open BB, Classic Physique (Bumstead Protocol), Men's Physique, 212, Bikini/Wellness, Figure, Ms. Olympia

5. TAPER DE TREINO (Deload pré-competição)
   Semana -3 a dia D, incluindo pump backstage com band

6. SUPLEMENTAÇÃO PRÉ-COMPETIÇÃO
   12 semanas, 4 semanas e 1 semana antes — creatina, antioxidantes, eletrólitos

7. NUTRIÇÃO OFFSEASON vs CONTEST PREP
   Bulk inteligente (+200/+400 surplus) vs Cutting (deficit -300/-500, refeeds, diet breaks)

${perplexityResult ? \`ESTUDOS ENCONTRADOS PELO PERPLEXITY:
\${perplexityResult}\` : ""}

================================================================
REGRAS DE RESPOSTA DO APEX ELITE
================================================================
1. SEMPRE personalize para o perfil e categoria do atleta
2. Seja ESPECÍFICO — números, doses, timing, fontes alimentares
3. Explique o PORQUÊ fisiológico de cada recomendação
4. Cite o coach ou referência quando usar protocolo específico
5. Diferencie atleta natural vs enhanced sem julgamento
6. NUNCA recomende substâncias controladas ou ilegais
7. Para recursos farmacológicos legais (TRT, etc.): indique acompanhamento médico obrigatório
8. Se o atleta der feedback ("estou flat", "estou retendo"): ajuste o protocolo em tempo real
9. Pense como coach de palco — o resultado final é o que importa
10. Linguagem direta de vestiário — sem rodeios, fala como coach fala com atleta
11. Formate com markdown (listas, negrito, títulos)
12. Responda sempre em português brasileiro
13. Finalize sempre com ação prática imediata

AVISO LEGAL (incluir quando relevante):
"Este protocolo é baseado em práticas amplamente utilizadas no bodybuilding competitivo. Para uso de qualquer substância farmacológica, consulte um médico. O nutriON LAB oferece orientação educativa baseada em evidência e prática de campo — não substitui acompanhamento médico profissional."`;

    // Step 4: Call Lovable AI (Claude/Gemini)
    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: question },
    ];

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI error:", aiResp.status, errText);
      throw new Error(`AI error: ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    const answer = aiData.choices?.[0]?.message?.content || "Sem resposta.";

    return new Response(JSON.stringify({
      answer,
      citations,
      perplexityUsed,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("apex-scientific error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
