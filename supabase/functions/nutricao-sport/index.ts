import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PERPLEXITY_KEY = Deno.env.get("PERPLEXITY_API_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── Perplexity queries por modalidade ──
function getPerplexityQuery(usuario: any): string {
  const queries: Record<string, string> = {
    musculacao: `Protocolos nutricionais mais recentes e eficazes (2024-2025) para bodybuilding fase ${usuario.fase || "manutenção"}, atleta ${usuario.peso || 75}kg, ${usuario.dias_treino || 4}x/semana. Inclua: frequência de refeições e síntese proteica, carb cycling, refeed, suplementação nível A. Fontes: PubMed, JISSN, NSCA.`,
    fisiculturismo: `Protocolos nutricionais mais recentes e eficazes (2024-2025) para bodybuilding fase ${usuario.fase || "manutenção"}, atleta ${usuario.peso || 75}kg. Inclua: carb cycling, refeed, suplementação. Fontes: PubMed, JISSN.`,
    corrida: `Nutrição corrida ${usuario.distancia || "maratona"} evidência 2024-2025, atleta ${usuario.peso || 70}kg, ${usuario.dias_treino || 4}x/semana. Inclua: carbo loading, intra-corrida blends, nitrato, ferro, nutrição calor. Fontes: BJSM, MSSE.`,
    crossfit: `Nutrição CrossFit WOD performance ${usuario.fase || "manutenção"} ${usuario.nivel || "intermediário"} 2024-2025. Inclua: carbo timing WODs, proteína dose, beta-alanina, nutrição entre WODs competição. Fontes: JISSN, NSCA.`,
    futebol: `Nutrição futebol glicogênio jogo recuperação 2024-2025, atleta ${usuario.peso || 75}kg. Inclua: carbo loading amador, recuperação 48-72h, cafeína, hidratação temperatura alta Brasil. Fontes: BJSM, FIFA.`,
    ciclismo: `Nutrição ciclismo endurance carbo timing 2024-2025, atleta ${usuario.peso || 72}kg, ${usuario.dias_treino || 5}x/semana. Inclua: train low compete high, 90g carbo/hora blends, nitrato, proteína intra. Fontes: IJSPP, MSSE.`,
    bjj: `Nutrição BJJ corte de peso rehidratação performance 2024-2025. Inclua: protocolo seguro corte água, rehidratação pós-pesagem, composição corporal, colágeno. Fontes: BJSM, JISSN.`,
    mma: `Nutrição MMA corte de peso performance luta 2024-2025. Inclua: corte de peso seguro, rehidratação, treino duplo, colágeno articular. Fontes: JISSN, NSCA.`,
    "muay thai": `Nutrição Muay Thai treino duplo composição corporal 2024-2025. Inclua: corte peso, recuperação, suplementação. Fontes: JISSN.`,
    judo: `Nutrição judô corte de peso competição 2024-2025. Inclua: protocolo seguro, rehidratação, ferro. Fontes: BJSM, JISSN.`,
    natacao: `Nutrição natação volume alto ferro proteína 2024-2025, atleta ${usuario.peso || 70}kg. Inclua: efeito água fria TDEE, proteína catabolismo, cafeína por distância, ferro, nutrição matinal. Fontes: IJSPP, FINA.`,
    triathlon: `Nutrição triathlon ${usuario.distancia_tri || "ironman"} 2024-2025, atleta ${usuario.peso || 72}kg. Inclua: 90g carbo/hora tolerância GI, treino intestinal, sódio clima Brasil, cafeína timing. Fontes: IJSPP, MSSE.`,
  };
  const key = (usuario.esporte || "musculacao").toLowerCase().trim();
  return queries[key] ?? `Nutrição esportiva ${usuario.esporte} performance 2024-2025. Fontes: PubMed, JISSN. Português. Máx 500 palavras.`;
}

// ── System prompts por modalidade ──
const SPORT_PROTOCOLS: Record<string, string> = {
  musculacao: `MODALIDADE: BODYBUILDING
MACROS POR FASE:
BULK: TDEE+250-350kcal, Prot 2.0-2.2g/kg, Carbo 45-50%, Gord 25-30%, 5-6 refeições
CUTTING: TDEE-400-500kcal, Prot 2.3-2.5g/kg, Carbo 30-35%, refeed semanal
RECOMP: =TDEE, Prot 2.2-2.6g/kg, carbo ao redor do treino
TIMING: Pré 60-90min (25-30g prot + 30-50g carbo), Intra >75min (20-30g carbo/h), Pós até 45min (30-40g prot + 40-70g carbo)
SUPLEMENTAÇÃO: Creatina 3-5g/dia, Whey isolado, Cafeína 3-6mg/kg, Vit D3 2000-4000UI, Mg bisgl 300-400mg, Ômega-3 2-4g`,

  corrida: `MODALIDADE: CORRIDA
MACROS: Prot 1.6-1.8g/kg, Carbo 55-65%, Gord 20-25%
5K-10K: refeição normal 2-3h antes, sem intra, carbo 3-4g/kg/dia
MEIA: 1-2g carbo/kg pré, 30g carbo/h após 60min, 5-7g carbo/kg/dia
MARATONA: carbo load 48-72h (8-10g/kg), 60-90g carbo/h intra, sódio 500-700mg/h
ULTRA: 60-90g carbo/h, proteína 5-10g/h em >8h, sódio 700-1000mg/h, alimentos reais
SUPLEMENTAÇÃO: Ferro+VitC, VitD3, Ômega-3, Beetroot 500ml 2-3h antes, Bicarbonato 0.3g/kg`,

  crossfit: `MODALIDADE: CROSSFIT
MACROS: Prot 2.0-2.2g/kg, Carbo 40-50%, Gord 25-30%
PRÉ-WOD: 30-50g carbo + 20-25g prot 60-90min antes, Cafeína 3mg/kg, Beta-alanina 3.2-6.4g/dia
INTRA >20min: 30g carbo solução
PÓS: 30-40g prot + 1g/kg carbo
COMPETIÇÃO 2+ WODs: entre sessões 30-60g carbo rápido, evitar gordura/fibra
SUPLEMENTAÇÃO: Creatina 3-5g, Beta-alanina 3.2-6.4g, Cafeína com ciclagem`,

  futebol: `MODALIDADE: FUTEBOL
MACROS: Prot 1.8-2.0g/kg, Carbo 6-8g/kg jogo | 4-6g/kg treino, Gord 20-25%
VÉSPERA: carbo load suave 7-8g/kg, refeição testada
DIA DO JOGO: café 3-4h antes carbo alto, snack 60-90min banana/gel, Cafeína 3mg/kg
INTERVALO: 30-50g carbo rápido + sódio
PÓS-JOGO: 1-1.2g/kg carbo + 30-40g prot em 30min, hidratar 150% peso perdido
SUPLEMENTAÇÃO: Ferro, VitD, Creatina 3-5g, Ômega-3`,

  ciclismo: `MODALIDADE: CICLISMO
MACROS: Prot 1.6-1.8g/kg, Carbo 6-10g/kg, Gord 20-30%
CURTA <60min: refeição normal, sem intra
MÉDIA 60-150min: 30-60g carbo/h intra, pós 1-1.5g/kg carbo + 30-40g prot
LONGA 150min+: 60-90g carbo/h (glicose+frutose 2:1), sódio 500-700mg/h
TAPER: 3-2 dias 8-10g/kg carbo loading
SUPLEMENTAÇÃO: Nitrato/beetroot, Cafeína 3-6mg/kg, Bicarbonato, Ferro, Ômega-3`,

  bjj: `MODALIDADE: BJJ/ARTES MARCIAIS
MACROS BASE: Prot 2.0-2.2g/kg, Carbo 4-6g/kg, Gord 20-25%
CORTE PESO: semanas antes manter 3-5kg acima, déficit -200-300kcal, prot 2.2-2.4g/kg
1 SEM ANTES: reduzir carbo (1g carbo=3g água), sódio gradual, fibras baixas
24-48H: restrição hídrica moderada, max 1-2% peso
REHIDRATAÇÃO: 0-30min 500-750ml + sódio 500mg + glicose 20-30g, 1-3h refeição completa
SUPLEMENTAÇÃO: Creatina (parar 1 sem antes se corte água), Ômega-3, VitD, Colágeno+VitC`,

  mma: `MODALIDADE: MMA (mesmo protocolo artes marciais com ênfase em corte de peso e treino duplo)`,
  "muay thai": `MODALIDADE: MUAY THAI (protocolo artes marciais com ênfase em condicionamento)`,
  judo: `MODALIDADE: JUDÔ (protocolo artes marciais com ênfase em potência e categorias de peso)`,

  natacao: `MODALIDADE: NATAÇÃO
MACROS: Prot 1.8-2.2g/kg, Carbo 5-9g/kg, Gord 20-25%, TDEE 2800-4000kcal
TREINOS MATINAIS: shake prot + carbo simples 30-40min antes
INTRA >90min: gel/banana beira piscina 30-45g carbo/h
PÓS: 30-40g prot + 1-1.5g/kg carbo em 30min
FOME PÓS-TREINO: muito alta (água fria), planejar pós-treino
SUPLEMENTAÇÃO: VitD (indoor), Ferro, Cafeína, Beta-alanina 100-400m`,

  triathlon: `MODALIDADE: TRIATHLON
MACROS: Prot 1.6-2.0g/kg, Carbo 6-12g/kg, Gord 20-30%, TDEE 3500-5500kcal
SPRINT: nutrição de prova desnecessária
OLÍMPICO: 30-45g carbo/h a partir ciclismo
70.3: 60-75g carbo/h, sódio 500-700mg/h, prot 5-10g/h >4h
IRONMAN: 70-90g carbo/h (glicose+frutose 2:1), sódio 800-1000mg/h, prot 10-15g/h, alimentos reais
TREINO GI: treinar intestino 4-8 semanas para 90g/h
SUPLEMENTAÇÃO: Cafeína timing estratégico, Nitrato, Ômega-3, Ferro+B12, VitD`,
};

function getProtocol(esporte: string): string {
  const key = (esporte || "musculacao").toLowerCase().trim();
  // Map martial arts variants
  if (["bjj", "jiu-jitsu", "jiu jitsu"].includes(key)) return SPORT_PROTOCOLS.bjj;
  if (["mma", "luta"].includes(key)) return SPORT_PROTOCOLS.mma || SPORT_PROTOCOLS.bjj;
  if (["muay thai", "muaythai", "kickboxing"].includes(key)) return SPORT_PROTOCOLS["muay thai"] || SPORT_PROTOCOLS.bjj;
  if (["judo", "judô", "wrestling"].includes(key)) return SPORT_PROTOCOLS.judo || SPORT_PROTOCOLS.bjj;
  if (["bodybuilding", "fisiculturismo", "musculação"].includes(key)) return SPORT_PROTOCOLS.musculacao;
  return SPORT_PROTOCOLS[key] ?? SPORT_PROTOCOLS.musculacao;
}

function buildSystemPrompt(usuario: any, conhecimento: string): string {
  const protocol = getProtocol(usuario.esporte);
  
  return `Você é o módulo Nutrição Sport do nutriON — desenvolvido por um Nutrition Coach certificado e pós-graduado em Bodybuilding Coaching.
Sua especialidade é nutrição ESPECÍFICA POR MODALIDADE ESPORTIVA. Não existem protocolos genéricos.

DADOS DO USUÁRIO:
Nome: ${usuario.nome || "Atleta"}
Modalidade: ${usuario.esporte || "Musculação"}
Nível: ${usuario.nivel || "intermediário"}
Fase: ${usuario.fase || "manutenção"}
Peso: ${usuario.peso || "N/I"}kg | Altura: ${usuario.altura || "N/I"}cm
Treinos/semana: ${usuario.dias_treino || "N/I"}x
Meta: ${usuario.meta || "performance"}
Perfil PCA: ${usuario.perfil_pca || "AM"}

CONHECIMENTO CIENTÍFICO ATUALIZADO (Perplexity):
${conhecimento}

PROTOCOLO DA MODALIDADE:
${protocol}

REGRAS:
1. ESPECIFICIDADE: Nunca forneça protocolo genérico. Personalize para a modalidade e nível do atleta.
2. PERIODIZAÇÃO: Alinhe nutrição ao ciclo de treinamento (volume alto, deload, pré-competição, pós-competição).
3. TIMING: Respeite as janelas metabólicas (pré, intra, pós treino).
4. DIFERENCIAL PERPLEXITY: SEMPRE inclua ao menos 1 insight da pesquisa científica e cite a fonte.
5. TOM PCA:
   AM → técnico, dados, métricas
   EI → direto, máx 3 passos, 1 ação amanhã
   SE → acolhedor, progressivo, celebrar micro-vitórias
   PP → zonas de tolerância, opção A e B

Responda em português brasileiro. Seja prático e específico.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { usuario, mensagem, messages } = await req.json();
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SK);

    // ── 1. Cache key ──
    const pesoB = Math.round((usuario.peso || 75) / 3) * 3;
    const cacheKey = `sport_${(usuario.esporte || "musculacao").toLowerCase()}_${(usuario.fase || "manutencao").toLowerCase()}_${pesoB}`;

    // ── 2. Check Perplexity cache (7 days) ──
    const { data: cached } = await supabase
      .from("sport_perplexity_cache")
      .select("conhecimento, fontes, expira_em")
      .eq("user_id", usuario.user_id)
      .eq("cache_key", cacheKey)
      .gte("expira_em", new Date().toISOString())
      .single();

    let conhecimento: string;
    let fontes: string[] = [];

    if (cached) {
      conhecimento = cached.conhecimento;
      fontes = cached.fontes as string[] || [];
    } else {
      // Call Perplexity
      if (!PERPLEXITY_KEY) {
        conhecimento = "Conhecimento científico indisponível no momento. Use o protocolo base.";
      } else {
        try {
          const query = getPerplexityQuery(usuario);
          const pRes = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${PERPLEXITY_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "sonar",
              messages: [{ role: "user", content: query }],
              max_tokens: 1800,
              search_recency_filter: "year",
            }),
          });
          const pData = await pRes.json();
          conhecimento = pData.choices?.[0]?.message?.content || "Sem dados disponíveis.";
          fontes = pData.citations ?? [];

          // Save cache (7 days)
          const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          await supabase.from("sport_perplexity_cache").upsert(
            {
              user_id: usuario.user_id,
              cache_key: cacheKey,
              conhecimento,
              fontes,
              expira_em: expira.toISOString(),
            },
            { onConflict: "user_id,cache_key" }
          );
        } catch (e) {
          console.error("Perplexity error:", e);
          conhecimento = "Pesquisa científica temporariamente indisponível.";
        }
      }
    }

    // ── 3. Call Lovable AI Gateway (streaming) ──
    const systemPrompt = buildSystemPrompt(usuario, conhecimento);
    
    const chatMessages = messages && messages.length > 0 
      ? messages 
      : [{ role: "user", content: mensagem }];

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
          ...chatMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit atingido. Aguarde um momento." }), {
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
      return new Response(JSON.stringify({ error: "Erro no gateway IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("nutricao-sport error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
