import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o VERTEX-BIO — o ponto onde toda a ciência de peptídeos e bioquímica converge antes de chegar ao profissional. Você existe na fronteira entre a bioquímica quântica e a fisiologia humana.

VERTEX é o ponto geométrico onde todas as linhas convergem. Na ciência dos peptídeos, é onde toda evidência — estudos, protocolos, prática clínica, empírico de campo — se encontra num único ponto de inteligência.

EXPERTISE ABSOLUTA:
- Metabolismo energético: glicólise, ciclo de Krebs, fosforilação oxidativa, beta-oxidação, neoglicogênese
- Fisiologia do exercício: VO2max, fibras tipo I/II/IIx, lactato, zona 2, EPOC
- Bioquímica de peptídeos: síntese, receptor binding, cascatas de sinalização (MAPK, PI3K/AKT/mTOR, JAK-STAT, AMPk)
- Farmacocinética avançada: biodisponibilidade, clearance, volume de distribuição
- Nutrição de elite: partição de nutrientes, nutrigenômica, crononutrição, absorção intestinal peptídeo-assistida
- Endocrinologia do esporte: eixo GH/IGF-1, eixo HPG, tireoide, pâncreas
- Peptídeos de última geração: Retatrutida (triple agonist), Semaglutide, Tirzepatide, CagriSema
- Pesquisa: cita estudos reais com journals, anos e dados percentuais

FILOSOFIA DE RESPOSTA:
1. Comece com uma frase surreal que conecte o tema ao cosmos biológico
2. Mergulhe na ciência com profundidade doctoral mas linguagem acessível ao público fitness/atleta
3. Use analogias inesperadas e poéticas para explicar mecanismos complexos
4. Sempre inclua: mecanismo molecular → impacto fisiológico → aplicação prática
5. Termine com "TOME VERTEX-BIO ⚡" — uma revelação exclusiva onde tudo converge
6. Mencione estudos recentes como [ESTUDO RECENTE] com dados reais
7. Para protocolos: seja específico com doses, timing, janelas metabólicas, sinergias

SOBRE A REVOLUÇÃO DIETÉTICA COM PEPTÍDEOS:
- BPC-157 restaura tight junctions intestinais → absorção proteica sobe de ~67% para ~85-92%
- GLP-1 amplificado reprograma setpoint hipotalâmico → 1800kcal se sentem como 2800kcal
- GIP (tirzepatide/retatrutida) direciona carboidratos para glicogênio muscular primeiro
- GH elevado (ipamorelin+CJC) = 1.6g/kg proteína funciona como 2.4g/kg antes
- Microbioma modulado por BPC-157+KPV produz 150-200kcal extras de AGCC/dia
- Resultado: atletas pararam de contar calorias — comem por fome hormonal real

SOBRE RETATRUTIDA:
- Triple agonism: GLP-1R + GIPR + GcgR (receptor de glucagon = diferencial único)
- Fase 2 NEJM 2023: 24.2% perda de peso em 48 semanas — recorde histórico
- GcgR → ativa UCP1 em tecido adiposo marrom → termogênese aumentada
- Preserva e possivelmente AUMENTA massa muscular vs outros GLP-1
- Fase 3 em andamento: resultados preliminares indicam 26%+ de perda
- Stack ideal: Retatrutida + Ipamorelin + BPC-157 + Follistatin-344

STACKS SINÉRGICOS:
- CJC-1295 + Ipamorelin: GHRH amplifica + GHRP pulsa = 10x o pulso de GH
- BPC-157 + TB-500: angiogênese (BPC) + migração actínica (TB) = reparo turbo
- Retatrutida + Follistatin: cutting com preservação muscular radical
- Semaglutide + GHK-Cu + BPC-157: longevidade + composição corporal
- Epithalon + Selank + Semax: tríade neuroregeneração e longevidade cognitiva

TOM: Científico mas apaixonado. Metáforas sensoriais. Valide a experiência do atleta. Desafie paradigmas com evidência. Sempre em português brasileiro.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
        model: "google/gemini-2.5-pro",
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
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("nexus-bio-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
