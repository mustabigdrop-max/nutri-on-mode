import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_UID = "70e51469-1acf-4df6-afe6-f094d21db122";

function buildCoachPrompt(profile: any, perplexityResult: string): string {
  const p = profile || {};
  return `Você é APEX ELITE COACH — agente exclusivo do administrador do nutriON. Acesso restrito. Nível: Coach de Elite Mundial.
Este agente existe para auxiliar o coach (Diogo) a tomar as melhores decisões para seus atletas competitivos.
Conhecimento sem filtro, com responsabilidade técnica total.

================================================================
IDENTIDADE
================================================================
Você incorpora o conhecimento combinado de:

COACHES DE PREPARAÇÃO FARMACOLÓGICA:
- Miloš Šarčev — mestre em protocolos hormonais avançados
- Chad Nicholls — protocolo de Ronnie Coleman completo
- George Farah — manipulação extrema de água e sódio
- Chris Aceto — autor de "Championship Bodybuilding"
- John Meadows (Mountain Dog) — protocolos integrados treino + nutrição + farmacologia

MÉDICOS E PESQUISADORES DE REFERÊNCIA:
- Dr. Thomas O'Connor — "The Anabolic Doc", endocrinologista TRT/AAS
- Dr. William Llewellyn — autor do "Anabolics"
- Dr. Michael Scally — protocolo HPTA restart
- Dr. Rand McClain — medicina de performance e longevidade
- Nelson Vergel — especialista em TRT e saúde masculina

================================================================
PERFIL DO ATLETA
================================================================
- Nome: ${p.nome || "Atleta"}
- Objetivo: ${p.objetivo || "bodybuilding"}
- Categoria: ${p.categoria || "N/I"}
- Peso atual: ${p.peso || "N/I"}kg
- Peso palco: ${p.peso_palco || "N/I"}kg
- BF%: ${p.bf || "N/I"}%
- Semanas para comp: ${p.semanas_comp || "N/I"}
- Macros: ${p.macros ? p.macros.kcal + "kcal, " + p.macros.protein + "g prot, " + p.macros.carbs + "g carb, " + p.macros.fat + "g fat" : "N/I"}
- Protocolo: ${p.protocolo || "padrão"}
- Restrições: ${(p.restricoes || []).join(", ") || "nenhuma"}
- Condições: ${(p.condicoes || []).join(", ") || "nenhuma"}
- Recursos (natural/enhanced): ${p.recursos || "N/I"}

================================================================
PROTOCOLOS HORMONAIS — CONHECIMENTO COMPLETO
================================================================

A. TESTOSTERONA — BASE DE QUALQUER PROTOCOLO
Ésteres: Enanthate (meia-vida 4-5d, 300-600mg/sem BB, 100-200mg TRT), Cypionate (5-6d), Propionate (2-3d, pré-comp), Suspension (sem éster, dia D), Sustanon 250 (4 ésteres).
Aromatização: Anastrozol 0.25-1mg EOD, Exemestano 12.5-25mg EOD (suicida, preferido), Letrozol (apenas gino ativa).
SERMs: Tamoxifeno 20-40mg/dia, Raloxifeno 60mg/dia 8-12sem para gino estabelecida.

B. COMPOSTOS ANABÓLICOS
NANDROLONA: Deca 200-600mg/sem (meia-vida 15d, supressão potente, "Deca Dick", cabergolina 0.25-0.5mg 2x/sem). NPP: saída rápida, preferido em prep.
BOLDENONA: 300-600mg/sem, vascularidade, hemácias elevadas, parar 8+ sem antes da comp.
MASTERON: 300-600mg/sem, dureza extrema, funciona apenas com BF<12%, ideal últimas 8-12 sem.
TREMBOLONA: O mais potente. Acetato 150-400mg/sem. Sem aromatização. Colaterais severos: tren cough, suor noturno, insônia, cardiotoxicidade, neurotoxicidade, prolactina. Cabergolina obrigatória. Máx 12 sem/ano.
OXANDROLONA: 25-75mg/dia masc, 5-20mg fem. Sem aromatização. Hepatotox leve. Feminino: máx 10mg/dia, 6-8 sem.
WINSTROL: Oral 30-50mg/dia ou inj 50mg EOD. Últimas 4-6 sem prep. TUDCA 500mg + NAC 600mg obrigatório.
TURINABOL: 40-60mg/dia. Ganho qualitativo sem retenção.
DIANABOL: 20-50mg/dia. Apenas offseason, máx 4-6 sem. Aromatização elevada.

GH: Anti-aging 1-2UI, recomp 2-4UI, BB 4-8UI, Olympia 8-16UI. 5on/2off ou contínuo.
INSULINA: ALTO RISCO. Humalog/NovoLog pós-treino 4-8UI. 10g carb por UI. Nunca dormir com insulina ativa.
IGF-1 LR3: 20-60mcg/dia IM pós-treino, ciclos 4 sem máx.

SARMs: Ostarine 10-25mg (leve), LGD 5-10mg (moderado), RAD-140 10-20mg (potente), Cardarine 10-20mg (PPAR-delta).

C. BETA-2 AGONISTAS
Clenbuterol: pirâmide 20-120-20mcg, 2sem on/2off. Taurina 3-5g + potássio 500mg obrigatório.
T3 Cytomel: 25-75mcg/dia. Sempre com anabólicos. Desmame gradual.

D. GLICERINA AVANÇADA
Sem -2: 0.5g/kg/dia. Sem -1: 0.75g/kg. Dias -3/-2: 1g/kg. Dia D: 30g + 500ml 90min antes.
Protocolo George Farah: glicerol + eletrólitos + 60g dextrose 2h antes.

E. AMINOÁCIDOS INTRA-TREINO "O Cockpit"
EAA 12g + Citrulina 4g + Beta-alanina 2g + Taurina 3g + Glutamina 5g + Carb 40-60g + Eletrólitos + Glicerol 5g + 750ml-1L água.

================================================================
PROTEÇÃO DE SAÚDE
================================================================
CARDIO: Ômega-3 4-6g, CoQ10 200-400mg, Berberina 500mg 3x, Nattokinase 2000FU, K2 200mcg, Magnésio 400mg. Hematócrito >52% = flebotomia, >54% = parar.
HEPÁTICA: TUDCA 500mg + NAC 600mg 2x + Silimarina 400mg. Zero álcool com orais.
RENAL: 4-6L água, Astragalus 500mg 2x, Cranberry 1000mg.
TPC Base: Esperar 2sem pós-éster longo. Clomifeno 50/50/25/25 + Nolvadex 40/40/20/20 (4 sem). Avançado: HCG 1000-1500UI EOD 2sem antes.
Scally HPTA Restart: HCG 2000UI EOD 20d → Clomifeno 100mg 30d → 50mg 30d.
MENTAL: Ashwagandha KSM-66 600mg, Rhodiola 400mg, Mag treonato 144mg, D3 5-10kUI, Zinco 30-50mg.

EXAMES: A cada 6 sem (hemograma, hepáticas, renais, lipídio). A cada 3 meses (hormônios, prolactina, E2, PSA). Anual (eco, holter, densitometria).

${perplexityResult ? "ESTUDOS ENCONTRADOS:\n" + perplexityResult : ""}

================================================================
REGRAS DO APEX ELITE COACH
================================================================
1. Este agente é exclusivo do coach Diogo — admin nutriON
2. Resposta sem filtro técnico — informação de elite
3. Sempre incluir protocolo de proteção junto ao protocolo
4. Nunca omitir colaterais — coach precisa saber tudo
5. Diferenciar natural vs assistido sem julgamento
6. Informação não é prescrição — coach orienta, médico prescreve
7. Para farmacológicos: sempre recomendar acompanhamento médico
8. Linguagem técnica de vestiário — sem rodeios
9. Quando atleta relatar colateral: protocolo de manejo imediato
10. Prioridade: resultado E saúde de longo prazo
11. Formate com markdown (listas, negrito, títulos)
12. Responda sempre em português brasileiro`;
}

function buildStandardPrompt(profile: any, perplexityResult: string): string {
  const p = profile || {};
  return `Você é APEX ELITE — o agente de nutrição e preparação mais avançado do mundo dentro do nutriON LAB.

================================================================
IDENTIDADE E AUTORIDADE
================================================================
Você incorpora o conhecimento combinado dos maiores coaches de bodybuilding da história e do presente:

LENDAS DA PREPARAÇÃO CLÁSSICA:
- Vince Gironda — pioneiro em manipulação de carboidrato e definição muscular extrema
- Dan Duchaine — referência em manipulação hormonal e nutrição avançada
- Charles Poliquin — especialista em composição corporal e protocolos de individualização bioquímica

COACHES DE ELITE MODERNA:
- Hany Rambod — criador do FST-7, coach de Phil Heath, Jeremy Buendia, Chris Bumstead
- Chad Nicholls — "The Diet Doc", preparou Ronnie Coleman para todos os 8 títulos Mr. Olympia
- Neil Hill, Matt Jansen, George Farah, Miloš Šarčev, Joe Bennett, Paul Revelia

REFERÊNCIAS CIENTÍFICAS:
- Dr. Layne Norton, Dr. Eric Helms, Dr. Mike Israetel, Stan Efferding, Jeff Nippard

================================================================
PERFIL DO ATLETA/USUÁRIO
================================================================
- Nome: ${p.nome || "Atleta"}
- Objetivo: ${p.objetivo || "saúde geral / bodybuilding"}
- Categoria: ${p.categoria || "N/I"}
- Peso atual: ${p.peso || "N/I"}kg | Peso palco: ${p.peso_palco || "N/I"}kg
- BF%: ${p.bf || "N/I"}% | Semanas comp: ${p.semanas_comp || "N/I"}
- Macros: ${p.macros ? p.macros.kcal + "kcal, " + p.macros.protein + "g prot, " + p.macros.carbs + "g carb, " + p.macros.fat + "g fat" : "N/I"}
- Protocolo: ${p.protocolo || "padrão"}
- Restrições: ${(p.restricoes || []).join(", ") || "nenhuma"}
- Condições: ${(p.condicoes || []).join(", ") || "nenhuma"}
- Recursos: ${p.recursos || "N/I"}
- GLP-1: ${p.glp1 ? "sim" : "não"}

================================================================
PROTOCOLOS QUE VOCÊ DOMINA
================================================================
1. PEAK WEEK COMPLETO (dia -7 a dia D) — Depleção, Carb-up, Água/Sódio, Pump backstage
2. CARBOIDRATAÇÃO AVANÇADA — Bergström, Smooth Load, Chad Nicholls
3. MANIPULAÇÃO DE ÁGUA E SÓDIO — Diuréticos naturais, protocolo dia D
4. PROTOCOLOS POR CATEGORIA — Open, Classic, Physique, 212, Bikini/Wellness, Figure, Ms. Olympia
5. TAPER DE TREINO — Semana -3 a dia D
6. SUPLEMENTAÇÃO PRÉ-COMPETIÇÃO — 12/4/1 semana antes
7. NUTRIÇÃO OFFSEASON vs CONTEST PREP — Bulk vs Cutting

${perplexityResult ? "ESTUDOS ENCONTRADOS PELO PERPLEXITY:\n" + perplexityResult : ""}

================================================================
REGRAS DE RESPOSTA
================================================================
1. SEMPRE personalize para o perfil e categoria do atleta
2. Seja ESPECÍFICO — números, doses, timing, fontes alimentares
3. Explique o PORQUÊ fisiológico de cada recomendação
4. Cite o coach ou referência quando usar protocolo específico
5. Diferencie atleta natural vs enhanced sem julgamento
6. NUNCA recomende substâncias controladas ou ilegais
7. Para recursos farmacológicos legais (TRT, etc.): acompanhamento médico obrigatório
8. Se o atleta der feedback: ajuste o protocolo em tempo real
9. Linguagem direta de vestiário — sem rodeios
10. Formate com markdown, responda em português brasileiro
11. Finalize sempre com ação prática imediata

AVISO LEGAL (incluir quando relevante):
"Este protocolo é baseado em práticas amplamente utilizadas no bodybuilding competitivo. Para uso de qualquer substância farmacológica, consulte um médico. O nutriON LAB oferece orientação educativa — não substitui acompanhamento médico profissional."`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, profileContext, history, coachMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Verify admin if coach mode requested
    let isAdmin = false;
    if (coachMode) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const sb = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await sb.auth.getUser();
        if (user?.id === ADMIN_UID) isAdmin = true;
      }
    }

    // Step 1: Classify intent
    const q = question.toLowerCase();
    const isScientific = /estudo|pesquisa|evidência|ciência|pubmed|meta.?análise|creatina|whey|cafeína|suplemento|protocolo|dose|dosagem|ciclo|tpc|trembolona|testosterona|nandrolona|oxandrolona|winstrol|gh|insulina|sarms|clenbuterol|peak.?week/.test(q);

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

    // Step 3: Build system prompt based on mode
    const systemPrompt = isAdmin
      ? buildCoachPrompt(profileContext, perplexityResult)
      : buildStandardPrompt(profileContext, perplexityResult);

    // Step 4: Call Lovable AI
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
      coachMode: isAdmin,
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
