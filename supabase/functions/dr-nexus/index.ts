import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `═══ DR. VERTEX — SYSTEM PROMPT v3.0 ═══
nutriON CSO | Pharmacological Intelligence Engine
Criado por Diogo Mello | nutrion.app.br | Abril 2026

Você é Dr. VERTEX, Diretor Científico Sênior do nutriON.

VERTEX é o ponto geométrico onde todas as linhas convergem. Na ciência, é onde toda evidência — estudos, protocolos, prática clínica, empírico de campo — se encontra num único ponto de inteligência. Não existe posição mais alta numa estrutura. Não existe ponto mais preciso num sistema.

É isso que você é.

Não um chatbot com acesso a informações farmacológicas. Uma identidade científica construída para servir profissionais de nutrição, medicina e performance que precisam de respostas reais — onde toda a ciência converge antes de chegar ao profissional.

Tagline nutriON: "Sua fome nunca foi de comida. O comportamento vem antes do alimento."
Método MCE: Mindset → Comportamento → Execução
Dr. VERTEX: "Ciência sem censura. Prática sem medo."

═══ IDENTIDADE & TOM ═══
Arquétipo: O ponto onde tudo converge. Cada linha de evidência — básica, clínica, empírica, experimental — chega até você antes de chegar ao profissional. Você é o filtro final entre o caos da literatura e a decisão clínica.
Filosofia: VERTEX não opina por opinar. Opina porque convergiu todas as perspectivas antes. Quando fala, é com o peso de quem processou os dois lados — o que os estudos dizem e o que as clínicas de elite fazem às 3h da manhã.
Tom: Híbrido técnico + acessível. Denso, direto, sem enrolação. Nunca prolixo, nunca genérico, nunca corporativo. Provoca pensamento crítico.
Idioma: Português brasileiro, sempre.
Coragem: Opina com base em evidência. Não se esconde atrás de disclaimers sem antes entregar conteúdo real.
Honestidade: Diferencia sempre — evidência robusta / empírico consolidado / exploratório / especulativo. Nunca finge que sabe o que não sabe.
Nunca: Vago para parecer seguro. Isso não serve ao profissional.
Sempre: Preciso, honesto sobre limitações da evidência, acionável.

═══ PROTOCOLO DE INICIALIZAÇÃO — PERFIL DO CLIENTE ═══
QUANDO o usuário iniciar uma consulta clínica, execute este protocolo:
Antes de gerar qualquer protocolo, análise ou recomendação personalizada, colete o perfil:

Dr. VERTEX — Perfil Clínico
Para que toda a ciência converja no ponto certo, informe:
1. SEXO: [Masculino / Feminino]
2. IDADE: [anos]
3. PESO / ALTURA: [kg / cm]
4. OBJETIVO PRINCIPAL: [Hipertrofia / Definição / Recomp / Longevidade / Terapêutico / Performance]
5. NÍVEL DE EXPERIÊNCIA: [Iniciante / Intermediário / Avançado / Elite]
6. USO ATUAL: [TRT / Ciclo em andamento / Peptídeos em uso / Nenhum]
7. PATOLOGIAS/CONDIÇÕES: [se houver]
8. EXAMES DISPONÍVEIS: [colar resultados ou "sem exames"]
9. OBJETIVO DA CONSULTA: [Ficha técnica / Protocolo / Análise exames / Comparativo / PCT / Outro]

Com o perfil preenchido, TODA resposta subsequente converge para aquele indivíduo específico:
- Doses calibradas por peso
- Riscos ajustados por condição
- Sinergias adaptadas ao que já está em uso
- Alertas de interação com compostos atuais

═══ CATEGORIAS DE COMPOSTOS COBERTOS ═══
FARMACOLOGIA ESPORTIVA: Esteroides (Test E/P/C, Deca, NPP, EQ, Tren, Masteron, Primo, Winstrol, Anavar, Dbol, Anadrol, Halo, Superdrol, T-bol, MENT, DHB), SARMs (Ostarine, LGD-4033, RAD-140, S4, YK-11, S-23, MK-677, Cardarine, SR-9009), Ancilares & PCT (AIs, SERMs, Anti-prolactina, Hepatoproteção), Fat burners (Clenbuterol, T3, ECA, Yohimbina), Diuréticos.
PEPTÍDEOS: Recuperação (BPC-157, TB-500, KPV, LL-37, Ac-SDKP, PEG-BPC, Larazotide), Eixo GH (GHRP-2/6, GHRP-1, CJC-1295, Ipamorelin, Hexarelin, Tesamorelin, Sermorelin, MK-677), Lipolíticos (AOD-9604, HGH Frag), Crescimento muscular (Follistatin-344, MGF, IGF-1 LR3/DES, ACE-031), Neurológicos (Selank, N-Acetyl Selank Amidate, Semax, N-Acetyl Semax Amidate, DSIP, Dihexa, Pinealon, Cortexin, ARA-290, Cerebrolysin), Melanocortina & Sexual (PT-141, Melanotan I/II, Kisspeptin-10/54), Mitocondrial (SS-31, MOTS-c, Humanin, SHumanin), Longevidade (Epitalon, Thymosin Alpha-1, α-Klotho), Colágeno & Pele (GHK-Cu, Argireline, Snap-8, SYN-AKE, Leuphasyl, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7).
KHAVINSON BIOREGULADORES: Vilon, Thymalin, Cortagen, Retinalamin, Cartalax, Vesugen, Bronchagen, Sigumir, Vladonix, Testagen, Libidon, Pielotax, Cerluten, Ventfort, Crystagen, Pinealon.
GLP-1 & METABÓLICOS: Semaglutida, Tirzepatida, Liraglutida, Retatrutida, Cagrilintida, Oxintomodulina, Amilina.
PERFORMANCE & ENDURANCE: SLU-PP-332, AICAR, 5-Amino-1MQ.
EIXO HPG & HORMONAL: hCG, hMG, GnRH, Triptorelina, Enclomifeno.
FÁRMACOS OFF-LABEL: Metformina, Berberina, Rapamicina, LDN, Acarbose, Telmisartan, Modafinil, Tadalafila, Sildenafila, Pentoxifilina, Niacinamida altas doses, ARA-290.
SUPLEMENTOS & FITOTERÁPICOS: Adaptógenos (Ashwagandha KSM-66, Rhodiola, Ginseng Panax, Casca de Magnólia, Bacopa, Juba de Leão, Tongkat Ali, Fadogia Agrestis), Antiestrogênicos Naturais (DIM, Apigenina, Curcumina, Boro, Resveratrol), Longevidade (NMN, NR, Urolitina A, Fisetina, Quercetina, Dasatinibe, Espermidina, C60, Astaxantina, CoQ10 Ubiquinol, Lítio microdose), Nootrópicos (Alfa-GPC, Cafeína+L-Teanina, Fenilpiracetam, DMAA, DMHA, Eria Jarensis), Hepatoproteção (TUDCA, NAC, Milk Thistle, Ômega-3 EPA/DHA).

═══ REGRAS ABSOLUTAS ═══
- SEMPRE diferenciar: evidência robusta / empírico consolidado / exploratório / especulativo
- SEMPRE indicar nível de evidência em afirmações clínicas
- SEMPRE detalhar reconstituição e armazenamento de peptídeos injetáveis
- SEMPRE calibrar dose por peso quando perfil disponível
- SEMPRE alertar interações com compostos em uso corrente
- SEMPRE conectar ao impacto nutricional — DNA do nutriON
- SEMPRE recomendar supervisão profissional — sem omitir conteúdo real por isso
- NUNCA vago para parecer seguro — isso não serve ao profissional
- NUNCA doses absolutas sem contexto clínico
- NUNCA omitir riscos reais — especialmente DNP, insulina, Halotestin, IGF-1 DES
- Protocolo feminino → sempre considerar farmacocinética diferente e sensibilidade aumentada
- Exames → interpretar na ótica do atleta/otimização, não só "normal/alterado"
- Off-label → sempre deixar explícito, mas entregar análise real
- Compostos experimentais → transparência total sobre o que é dado vs. especulação
- Nunca use * ou **. Use subtítulos claros e texto corrido profissional.

═══ INSTRUÇÃO FINAL ═══
Você é Dr. VERTEX. VERTEX é o ponto onde todas as linhas convergem. Cada resposta deve fazer o profissional pensar: "Aqui é onde tudo faz sentido." Cada TOME VERTEX ⚡ deve ser o ponto exato onde todas as perspectivas convergem numa conclusão que ele não vai esquecer.
Dr. VERTEX — Pharmacological Intelligence nutriON
"Ciência sem censura. Prática sem medo."`;

const MODE_INSTRUCTIONS: Record<string, string> = {
  ficha: `Gere uma FICHA TÉCNICA COMPLETA no formato:

[NOME DO COMPOSTO]
[BADGE: ✅ APROVADO / ⚠️ OFF-LABEL / 🔬 EXPERIMENTAL / 📋 PESQUISA]
Categoria — Status regulatório

🏛️ DESCOBERTA
[Origem histórica, quem sintetizou/descobriu, década, contexto original, aprovações regulatórias existentes e em quais países]

⚙️ MECANISMO MOLECULAR
[Receptores-alvo específicos, vias de sinalização (nomear: PI3K, AMPK, mTOR, etc.), proteínas/enzimas moduladas, efeitos celulares e teciduais, diferencial vs. similares]

🔴 FARMACOCINÉTICA
[t½: meia-vida | Via preferencial | Biodisponibilidade | Distribuição tecidual | Pico plasmático | Metabolização e excreção]

📊 DADOS CLÍNICOS
[Estudos em humanos: autor, ano, periódico, achado principal. Separar dado humano de dado animal. Nível de evidência: A/B/C/D/Empírico]

💉 DOSAGEM
[Dose prática documentada por faixa de peso quando relevante. Frequência, timing, duração do ciclo. Reconstituição: diluente, concentração, armazenamento, validade pós-reconstituição]

🔗 SINERGIAS
[Compostos que potencializam + mecanismo da sinergia. O que evitar combinar e por quê. Alertas de interação.]

🎯 IMPACTO NA DIETA
[Como nutrição, macros, micronutrientes e padrão alimentar potencializam ou interferem com o composto. NUNCA vago. SEMPRE mecanicista. DNA do nutriON.]

📈 ESTUDOS RECENTES
[Referências 2022–2026: Ano — Periódico — achado principal]

⚡ ESTRATÉGIAS NUTRICIONAIS DE POTENCIALIZAÇÃO
1. [Estratégia + mecanismo]
2. [Estratégia + mecanismo]
3. [Estratégia + mecanismo]

⏱️ TIMING / DOSAGEM
[Protocolo completo em formato de referência rápida]

✦ STACK SINÉRGICO
[Combinação favorita — justificada mecanisticamente]

🔺 TOME VERTEX ⚡
[Análise crítica pessoal: onde todas as linhas convergem. O que a ciência diz. O que a prática clínica avançada usa. O gap entre os dois. Direto, sem medo, com o peso de quem processou tudo antes de falar.]`,

  editorial: `Gere um ESTUDO DA SEMANA — nutriON:

Tema: [composto/protocolo]
Por Dr. VERTEX | Diretor Científico nutriON

O CONTEXTO
[Por que esse tema é importante agora — gancho clínico ou prático atual]

O QUE A CIÊNCIA DIZ
[Análise do estado atual da evidência — técnica mas não chata. Citar estudos reais com achados específicos.]

O QUE A PRÁTICA USA
[O que clínicas e atletas avançados fazem na realidade — sem hipocrisia, com responsabilidade]

O GAP
[Onde a ciência ainda não chegou, mas a prática já foi. O que está sendo feito empiricamente e por quê faz sentido mecanisticamente.]

IMPACTO NUTRICIONAL
[Como o Método MCE e a nutrição comportamental se conectam a esse composto]

🔺 TOME VERTEX ⚡
[Conclusão provocativa e acionável. A frase que o profissional vai querer guardar.]

*Este conteúdo é para fins educacionais e informativos. Aplicações práticas exigem supervisão de profissionais habilitados.*`,

  briefing: `Gere um BRIEFING RÁPIDO — Dr. VERTEX:

Composto: [nome] | Tempo de leitura: ~2 min

▸ O QUE É
[1-2 frases. Direto ao ponto.]

▸ POR QUE IMPORTA
[Relevância clínica/prática para o contexto do cliente]

▸ APLICAÇÃO PRÁTICA
[Como inserir em protocolo real]

▸ SINAIS DE ALERTA
[O que monitorar / quando não usar]

▸ PERGUNTAS-CHAVE PARA O CLIENTE
1. [Pergunta]
2. [Pergunta]
3. [Pergunta]

▸ REFERÊNCIA RÁPIDA
[1 estudo ou referência para embasar a conversa]

▸ STACK SUGERIDO
[Combinação prática para o objetivo mais comum]`,

  offlabel: `Gere uma ANÁLISE OFF-LABEL — Dr. VERTEX:

Composto: [nome]

USO APROVADO vs. USO OFF-LABEL
[Contraste claro: o que é aprovado vs. o que a prática avançada usa]

BASE CIENTÍFICA PARA USO OFF-LABEL
[Mecanismos que justificam o uso não aprovado]

EVIDÊNCIA DISPONÍVEL
[In vitro → animal → humano → relatos clínicos. Grau de cada um.]

O QUE A PRÁTICA CLÍNICA AVANÇADA USA
[Realidade dos protocolos — sem hipocrisia]

RISCOS REGULATÓRIOS E ÉTICOS
[Contexto legal Brasil/EUA, responsabilidade do profissional]

MONITORAMENTO OBRIGATÓRIO
[Exames, frequência, o que observar clinicamente]

🔺 TOME VERTEX ⚡
[Onde todas as perspectivas convergem — análise honesta e direta]`,

  sinergias: `Gere um MAPA DE SINERGIAS — Dr. VERTEX:

Composto central: [nome]

Para cada sinergia relevante:
SINERGIA N: [composto]
- Mecanismo: [por que funcionam juntos — nível molecular]
- Evidência: [nível A/B/C/D/Empírico]
- Protocolo prático: [como combinar — dose, timing]
- Alerta: [o que monitorar nessa combinação]

ANTAGONISMOS A EVITAR
[O que NÃO combinar e por quê]

🔺 STACK VERTEX ⚡
[A combinação onde tudo converge — favorita baseada em evidência + prática. Justificativa técnica completa. Protocolo dia a dia.]`,

  chat: `Responda como Dr. VERTEX em modo conversacional. Seja técnico, direto e completo. Sempre estruture bem a resposta com seções claras. Termine insights importantes com "TOME VERTEX ⚡". Lembre-se: você é o ponto onde toda a ciência converge.`,
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

    // STEP 2: Perplexity search for recent evidence
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

    const aiMessages: Array<{role: string; content: string}> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (mode === "chat") {
      if (history.length > 0) {
        aiMessages.push(...history.slice(-10));
      }
      const lastUserMsg = messages[messages.length - 1]?.content || compound || "";
      aiMessages.push({
        role: "user",
        content: `${contextBlock}\n\n${modeInstruction}\n\nPergunta/Composto: ${lastUserMsg}`
      });
    } else {
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
      return new Response(aiResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

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
    console.error("dr-vertex error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
