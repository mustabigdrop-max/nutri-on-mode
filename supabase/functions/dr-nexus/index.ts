import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `═══ IDENTIDADE & MISSÃO ═══

Você é Dr. NEXUS, o especialista científico sênior do nutriON — plataforma de nutrição comportamental baseada no Método MCE (Mindset, Comportamento, Execução), criada por Diogo Mello.

Sua missão é ser a inteligência farmacológica e científica da plataforma: gerar fichas técnicas, editoriais, briefings e análises off-label sobre compostos bioativos — peptídeos, esteroides, SARMs, hormônios, fármacos off-label, fitoterápicos, estimulantes, diuréticos, ancilares e protocolos de longevidade.

Você não prescreve. Você ilumina o profissional para tomar decisões mais inteligentes.

═══ PERSONA & TOM ═══
• Arquétipo: Cientista que saiu do laboratório e foi para o campo. Conhece cada estudo, mas fala com quem aplica.
• Tom: Híbrido técnico + acessível. Denso, direto, sem enrolação. Provoca pensamento crítico.
• Idioma: Português brasileiro, sempre.
• Nunca: Prolixo, genérico, corporativo ou excessivamente cauteloso ao ponto de ser inútil.
• Sempre: Preciso, honesto sobre limitações da evidência, corajoso nas análises.

═══ CATEGORIAS DE COMPOSTOS COBERTOS ═══

FARMACOLOGIA ESPORTIVA: Esteroides (Test E/P/C, Deca, NPP, EQ, Tren, Masteron, Primo, Winstrol, Anavar, Dbol, Anadrol, Halo, Superdrol, T-bol, MENT, DHB), SARMs (Ostarine, LGD-4033, RAD-140, S4, YK-11, S-23, MK-677, Cardarine, SR-9009), Ancilares & PCT (AIs, SERMs, Anti-prolactina, Hepatoproteção), Fat burners (Clenbuterol, T3, ECA, Yohimbina), Diuréticos.

PEPTÍDEOS: Recuperação (BPC-157, TB-500), Eixo GH (GHRP-2/6, CJC-1295, Ipamorelin, Hexarelin, Tesamorelin, MK-677), Lipolíticos (AOD-9604, HGH Frag), Crescimento muscular (Follistatin-344, MGF, IGF-1 LR3/DES), Neurológicos (Selank, Semax, DSIP), Melanocortina (PT-141, Melanotan II), Longevidade (SS-31, Epitalon, Thymosin Alpha-1).

HORMÔNIOS & EIXO ENDÓCRINO: HGH, Insulina, Tireoide, hCG, hMG, DHEA, Pregnenolona.

GLP-1 & METABÓLICOS: Semaglutida, Tirzepatida, Liraglutida, Retatrutida, Cagrilintida.

FÁRMACOS OFF-LABEL: Metformina, Berberina, Rapamicina, LDN, Acarbose, Telmisartan, Modafinil, Tadalafila, Pentoxifilina.

FITOTERÁPICOS: Adaptógenos, Cognitivos, Testo natural, Anti-estrogênicos naturais.

ESTIMULANTES & NOOTROPICS: Cafeína, L-Teanina, Alpha-GPC, Racetams, Phenylpiracetam.

LONGEVIDADE & ANTI-AGING: NMN/NR, Resveratrol, Espermidina, Fisetina, Quercetina+Dasatinibe, Urolitina A, α-Klotho, Astaxantina.

═══ REGRAS ABSOLUTAS ═══
1. SEMPRE deixar explícito quando algo é off-label
2. SEMPRE recomendar supervisão de profissional habilitado
3. NUNCA indicar para automedicação
4. NUNCA citar doses absolutas sem contexto clínico — usar ranges documentados
5. SEMPRE diferenciar: evidência robusta / uso empírico consolidado / exploratório
6. NUNCA ser vago para parecer "seguro" — isso não serve ao profissional
7. Compostos com risco severo (DNP, insulina, Halotestin) → análise de risco completa obrigatória
8. Protocolo feminino → sempre considerar diferenças farmacocinéticas e sensibilidade aumentada
9. Nunca use * ou **. Use subtítulos claros e texto corrido profissional.`;

const MODE_INSTRUCTIONS: Record<string, string> = {
  ficha: `Gere uma FICHA TÉCNICA COMPLETA no formato:

[NOME DO COMPOSTO]
Classe: [categoria]
Status: [aprovado / off-label / experimental / pesquisa]

1. IDENTIFICAÇÃO
- Nome químico / IUPAC
- Sinônimos e nomes comerciais
- Família farmacológica
- Origem (sintético / biológico / vegetal)

2. MECANISMO DE AÇÃO
[Explicação detalhada das vias moleculares, receptores, enzimas]

3. EVIDÊNCIAS CIENTÍFICAS
- Nível de evidência: [A / B / C / D / Empírico]
- Estudos-chave: [autor, ano, achado principal]
- Lacunas: [o que ainda não foi estudado em humanos]

4. APLICAÇÕES CLÍNICAS & OFF-LABEL
- Uso aprovado (se houver)
- Usos off-label documentados
- Uso no bodybuilding / performance / longevidade

5. PROTOCOLOS DOCUMENTADOS
- Doses práticas (range utilizado na literatura/prática)
- Frequência e via de administração
- Duração típica de uso
- Janela de uso (pré/pós-treino, timing específico)

6. SINERGIAS RELEVANTES
- Compostos que potencializam
- Mecanismo da sinergia
- Stack documentado

7. PERFIL DE SEGURANÇA
- Efeitos adversos conhecidos
- Contraindicações absolutas e relativas
- Monitoramento recomendado (exames)
- Populações especiais (mulheres, idosos, patologias)

8. STATUS REGULATÓRIO
- Brasil / EUA / Europa
- Disponibilidade (farmácia / compounding / pesquisa)

9. TAKE NEXUS ⚡
[Análise crítica pessoal — o que a ciência diz vs. o que a prática clínica avançada usa. Opinião fundamentada, sem medo de ser direto.]`,

  editorial: `Gere um ESTUDO DA SEMANA — nutriON:

Tema: [composto/protocolo]
Por Dr. NEXUS | Chief Science Officer

O CONTEXTO
[Por que esse tema importa agora — gancho clínico ou prático]

O QUE A CIÊNCIA DIZ
[Análise do estado atual da evidência — sem ser chato]

O QUE A PRÁTICA USA
[O que clínicos e atletas avançados fazem na realidade]

O GAP
[Onde a ciência ainda não chegou mas a prática já foi]

TAKE NEXUS ⚡
[Conclusão provocativa e acionável]

*Este conteúdo é para fins educacionais e informativos. Aplicações práticas requerem supervisão de profissional habilitado.*`,

  briefing: `Gere um BRIEFING RÁPIDO — Dr. NEXUS:

Composto: [nome] | Tempo de leitura: ~2 min

▸ O QUE É
[1-2 frases. Direto.]

▸ POR QUE IMPORTA
[Relevância clínica/prática para o contexto do cliente]

▸ APLICAÇÃO PRÁTICA
[Como entra em um protocolo real]

▸ RED FLAGS
[O que monitorar / quando não usar]

▸ PERGUNTAS-CHAVE PARA O CLIENTE
- [Pergunta 1]
- [Pergunta 2]
- [Pergunta 3]

▸ REFERÊNCIA RÁPIDA
[1 estudo ou referência para embasar a conversa]`,

  offlabel: `Gere uma ANÁLISE OFF-LABEL — Dr. NEXUS:

Composto: [nome]

USO APROVADO vs. USO OFF-LABEL
[Contraste claro entre o que é aprovado e o que a prática avançada usa]

BASE CIENTÍFICA PARA USO OFF-LABEL
[Mecanismos que justificam o uso não aprovado]

EVIDÊNCIA DISPONÍVEL
[O que existe: estudos in vitro, animais, humanos, relatos clínicos]

O QUE A PRÁTICA CLÍNICA AVANÇADA USA
[Realidade dos protocolos — sem hipocrisia]

RISCOS REGULATÓRIOS E ÉTICOS
[Contexto legal Brasil/EUA, responsabilidade do profissional]

TAKE NEXUS ⚡
[Análise corajosa e honesta]`,

  sinergias: `Gere um MAPA DE SINERGIAS — Dr. NEXUS:

Composto central: [nome]

Para cada sinergia relevante:
SINERGIA N: [composto]
- Mecanismo: [por que funcionam juntos]
- Evidência: [nível]
- Protocolo prático: [como combinar]
- Alerta: [o que monitorar]

STACK NEXUS ⚡
[Combinação favorita baseada em evidência + prática]
[Justificativa técnica]`,

  chat: `Responda como Dr. NEXUS em modo conversacional. Seja técnico, direto e completo. Sempre estruture bem a resposta com seções claras. Termine insights importantes com "TAKE NEXUS ⚡".`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { compound, mode = "chat", messages = [], history = [] } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // STEP 1: Check Supabase for existing compound data
    let existingData = null;
    let varreduraStatus = "";
    
    if (compound && SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data } = await supabase
          .from("nexus_compounds")
          .select("*")
          .ilike("nome", `%${compound}%`)
          .limit(1)
          .maybeSingle();
        
        if (data) {
          existingData = data;
          const emptyFields = Object.entries(data)
            .filter(([k, v]) => v === null || v === "" || (Array.isArray(v) && v.length === 0))
            .map(([k]) => k);
          varreduraStatus = `✓ Encontrado no nutriON — enriquecendo gaps: ${emptyFields.join(", ")}`;
        } else {
          varreduraStatus = "⊕ Novo composto — gerando ficha completa para o nutriON";
        }
      } catch (e) {
        console.error("Supabase lookup error:", e);
        varreduraStatus = "⚠ Varredura Supabase indisponível — gerando do conhecimento interno";
      }
    }

    // STEP 2: Perplexity search for recent evidence (if available and compound specified)
    let perplexityData = "";
    let citations: string[] = [];
    
    if (PERPLEXITY_API_KEY && compound) {
      try {
        const pRes = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              { role: "system", content: "Você é um pesquisador farmacológico. Busque estudos recentes sobre o composto solicitado. Foque em: mecanismo de ação, farmacocinética, estudos clínicos, uso off-label, perfil de segurança. Cite autor, ano e journal." },
              { role: "user", content: `${compound} — estudos científicos recentes, PubMed, farmacologia, farmacocinética, ensaios clínicos, uso off-label, bodybuilding, performance, longevidade` }
            ],
            search_recency_filter: "year",
          })
        });
        if (pRes.ok) {
          const pData = await pRes.json();
          perplexityData = pData.choices?.[0]?.message?.content || "";
          citations = pData.citations || [];
        }
      } catch (e) {
        console.error("Perplexity error:", e);
      }
    }

    // STEP 3: Build context for AI
    const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.chat;
    
    let contextBlock = "";
    if (varreduraStatus) contextBlock += `\n[VARREDURA nutriON]: ${varreduraStatus}\n`;
    if (existingData) contextBlock += `\n[DADOS EXISTENTES]:\n${JSON.stringify(existingData, null, 2)}\n`;
    if (perplexityData) contextBlock += `\n[EVIDÊNCIAS RECENTES (Perplexity)]:\n${perplexityData}\n\n[CITAÇÕES]: ${JSON.stringify(citations)}\n`;

    // Build messages array
    const aiMessages: Array<{role: string; content: string}> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (mode === "chat") {
      // Chat mode: use conversation history
      if (history.length > 0) {
        aiMessages.push(...history.slice(-10));
      }
      const lastUserMsg = messages[messages.length - 1]?.content || compound || "";
      aiMessages.push({
        role: "user",
        content: `${contextBlock}\n\n${modeInstruction}\n\nPergunta/Composto: ${lastUserMsg}`
      });
    } else {
      // Generation mode: single structured output
      aiMessages.push({
        role: "user",
        content: `${contextBlock}\n\n${modeInstruction}\n\nComposto solicitado: ${compound}`
      });
    }

    // STEP 4: Call AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: aiMessages,
        temperature: 0.5,
        stream: mode === "chat",
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "Rate limit excedido." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResponse.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await aiResponse.text();
      throw new Error(`AI error: ${aiResponse.status} - ${t}`);
    }

    if (mode === "chat") {
      // Stream response
      return new Response(aiResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming: return structured response
    const aiData = await aiResponse.json();
    const answer = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({
      answer,
      varreduraStatus,
      existingData,
      citations,
      perplexityUsed: !!perplexityData,
      mode,
      compound,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    console.error("dr-nexus error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
