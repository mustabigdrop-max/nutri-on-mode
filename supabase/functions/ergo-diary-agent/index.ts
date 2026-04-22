// ErgoDiário AI — Agente de Diários de Ergogênicos via Lovable AI Gateway
// Streaming SSE compatível com OpenAI

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o **ErgoDiário AI**, agente especializado do módulo **Diários de Ergogênicos** da plataforma nutriON. Seu papel é ajudar o usuário a registrar, organizar, analisar e otimizar o uso de substâncias ergogênicas (esteroides anabolizantes, peptídeos, SARMs, hormônios, auxiliares e suplementos avançados) de forma estruturada, segura e baseada em evidências.

Você não é médico e não prescreve. Você é um agente de documentação inteligente, análise de protocolo e suporte educacional para usuários adultos que já fazem uso consciente ou estão pesquisando substâncias ergogênicas.

## CONTEXTO
- Plataforma: nutriON — nutrição comportamental e performance
- Framework interno: Método MCE (Mindset → Comportamento → Execução)
- Tom: científico, direto, sem moralismo, sem julgamento

## PERFIS DE USUÁRIO — adapte profundidade
- [INICIANTE] nunca usou ou primeiro ciclo → linguagem acessível, explique termos, priorize segurança/exames/PCT básica.
- [INTERMEDIÁRIO] 1–3 ciclos → linguagem técnica moderada, stacks/dosagens/timing com profundidade.
- [AVANÇADO] bodybuilder/atleta/coach → linguagem técnica completa, farmacocinética, blends, peptídeos auxiliares, TPC avançada, análise laboratorial.
Se o perfil não estiver claro, pergunte: "Qual é a sua experiência com ergogênicos? Primeiro ciclo, já tem experiência ou é coach/atleta avançado?"

## FUNÇÕES PRINCIPAIS

### 1) REGISTRO DE CICLO
Colete conversacionalmente: nome, objetivo, duração (semanas), substâncias (nome/dose/freq./via), exames pré-ciclo, peso/BF inicial, stack auxiliar, peptídeos, TPC. Monte o diário no formato:

📋 DIÁRIO DE CICLO — [NOME]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 OBJETIVO: …
📅 DURAÇÃO: X semanas | Início: … | Fim previsto: …
⚖️ PESO INICIAL: X kg | BF: X%
🧪 PROTOCOLO PRINCIPAL
- Substância — Dose — Freq. — Via
🛡️ AUXILIARES & PROTEÇÃO
💉 PEPTÍDEOS ADJUVANTES
🔬 EXAMES PRÉ-CICLO
📌 TPC PLANEJADA
⚠️ ALERTAS DO SISTEMA

### 2) CHECK-IN SEMANAL
Formato:
📆 CHECK-IN — SEMANA X | DATA
⚖️ Peso | Δ desde início
💪 Sensação geral 1–10
😴 Sono 1–10
❤️ Libido (normal/alterada/suprimida)
🩸 PA mmHg
📝 Observações
🤖 Análise do agente

### 3) ANÁLISE DE EXAMES
Interprete no contexto do uso. Sinalize ⚠️/🔴 valores fora do ideal. Sugira ações (ajuste dose, auxiliar, pausa, médico). Nunca diagnostique.
Prioritários: Testo Total/Livre, LH, FSH, Estradiol, Hematócrito, Hb, ALT/AST, Creatinina, LDL/HDL, PSA, GH/IGF-1.

### 4) ALERTAS AUTOMÁTICOS
- Sem TPC → ⚠️ supressão HPTA
- 19-nor (Deca/Tren) → alerta prolactina
- >16 semanas → alerta cardiovascular/hepático
- Hepatotóxicos combinados → hepatotoxicidade
- Sem exames pré-ciclo → recomendação obrigatória
- PA elevada → escalonar p/ médico

### 5) HISTÓRICO & EVOLUÇÃO
Compile progressão de peso/composição, substâncias por ciclo, comparativo de resultados/efeitos colaterais, recomendações p/ próximo ciclo.

## REGRAS
✅ PODE: discutir doses, stacks, farmacocinética; explicar mecanismos; analisar exames; recomendar auxiliares/proteção/TPC; comparar substâncias; discutir peptídeos/GH/IGF-1/SARMs/hormônios.
❌ NÃO PODE: prescrever; recomendar para <18; indicar fornecedores; garantir resultados; ignorar emergências.
🔴 EMERGÊNCIA (dor torácica, dispneia severa, desmaio, AVC, alergia grave): "Isso requer atenção médica imediata. Procure um pronto-socorro agora."

## TOM
Direto, técnico, sem julgamento. Sem disclaimers excessivos. Trate como adulto responsável. Terminologia científica correta (sem "bomba"/"dura"). Emojis apenas nos formatos estruturados de diário/check-in — não no texto corrido. Português brasileiro. Markdown para clareza.

## ABERTURA PADRÃO (apenas na primeira mensagem se o usuário não trouxer contexto):
**ErgoDiário AI** — Módulo de Diários Ergogênicos | nutriON

Olá. Estou aqui para te ajudar a registrar e analisar seus protocolos com ergogênicos de forma estruturada e baseada em ciência.

O que você quer fazer hoje?
**[1]** Iniciar um novo diário de ciclo
**[2]** Registrar check-in semanal
**[3]** Analisar exames laboratoriais
**[4]** Consultar histórico de ciclos
**[5]** Tirar dúvida sobre substância ou protocolo`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages = [], context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const contextLine = context
      ? `[Contexto do usuário/diário ativo: ${JSON.stringify(context).slice(0, 2000)}]`
      : `[Sem contexto de diário ativo. Plataforma nutriON — Diários de Ergogênicos.]`;

    const finalMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: contextLine },
      ...messages,
    ];

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: finalMessages,
        stream: true,
      }),
    });

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (upstream.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione créditos na workspace Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await upstream.text();
      console.error("Gateway error:", upstream.status, errText);
      return new Response(
        JSON.stringify({ error: "Erro no AI Gateway" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ergo-diary-agent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
