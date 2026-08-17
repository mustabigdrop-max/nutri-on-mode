import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND = `MARCA: nutriON (nutrion.app.br) — plataforma de coaching nutricional.
COACH: @diogo.mell0 — Coach Nutricional, IFBB Classic Physique, criador do Método MCE (Mindset, Comportamento, Execução).
TAGLINE: "Sua fome nunca foi de comida. O comportamento vem antes do alimento."
PALETA: #020205 / #00D4FF / #00FF88. Tipografia Rajdhani.
PILARES: mce_drop (educativo 30%), bastidor (pessoal 25%), transformacao (prova social 20%), entretenimento (15%), cta (venda suave 10%).
TOM: direto, científico sem ser acadêmico, português do Brasil, frases curtas, zero clichê motivacional vazio. Nunca se apresente como IA.`;

type Mode = "caption" | "reel" | "calendar" | "hashtags" | "stories" | "audit" | "bio_audit" | "feed_audit" | "content_full"
  | "repurpose" | "dm_variation" | "objection_variation" | "viral_pattern" | "viral_ideas" | "ideas_now" | "proof_caption";

const SCHEMAS: Record<Mode, string> = {
  caption: `{"hook":"primeira linha que para o scroll","caption":"legenda completa com quebras de linha \\n","cta":"chamada final","hashtags":["#tag", "... 15 a 20 itens"]}`,
  reel: `{"hook":"0-2s","tensao":"5-15s","desenvolvimento":"15-35s","cta":"últimos 5s","texto_na_tela":["4 a 6 frases curtas"],"audio_sugerido":"string","duracao":"30-60s"}`,
  calendar: `{"week":[{"weekday":"SEG","pillar":"mce_drop","format":"carrossel","topic":"tema","hook":"hook","note":"observação curta de produção"}, "... 7 dias SEG a DOM respeitando a distribuição dos pilares"]}`,
  hashtags: `{"grandes":["5 hashtags de alto volume"],"medias":["10 hashtags de volume médio"],"nichadas":["5 hashtags de nicho"]}`,
  stories: `{"manha":["4 stories"],"tarde":["4 stories"],"noite":["3 stories"],"enquete":"pergunta de enquete do dia"}`,
  audit: `{"bio_score":0,"bio_issues":["..."],"bio_suggestion":"bio completa em até 150 caracteres com emojis e quebras de linha","content_mix":{"educativo":0,"pessoal":0,"prova_social":0,"entretenimento":0,"venda":0},"content_mix_ideal":{"educativo":35,"pessoal":25,"prova_social":20,"entretenimento":15,"venda":12},"frequency_current":0,"frequency_ideal":5,"issues":["..."],"quick_wins":["3 ações imediatas"],"content_pillars_suggested":["4 a 5 pilares"],"series_suggestions":["séries recorrentes"]}`,
  bio_audit: `{"score":0,"criteria":[{"key":"nome_busca","label":"Nome otimizado pra busca","ok":false,"points":-10}, "... um item para cada critério enviado"],"options":[{"id":"A","style":"autoridade","bio":"bio completa com quebras de linha \\n"},{"id":"B","style":"storytelling","bio":"..."},{"id":"C","style":"direto ao ponto","bio":"..."}]}`,
  feed_audit: `{"current_mix":{"educativo":0,"pessoal":0,"prova_social":0,"entretenimento":0,"venda":0},"ideal_mix":{"educativo":30,"pessoal":25,"prova_social":15,"entretenimento":20,"venda":10},"problems":["3 a 4 problemas objetivos comparando os mixes"],"actions":["3 ações imediatas"]}`,
  repurpose: `{"pieces":[{"key":"carrossel","title":"...","blocks":["Slide 1: ...","Slide 2: ...","Slide 3: ...","Slide 4: ...","Slide 5: CTA + @handle"],"note":"dica de produção"},{"key":"stories","title":"...","blocks":["Story 1: ...","Story 2: ...","Story 3: ...","Story 4: enquete ou CTA"]},{"key":"legenda","title":"...","content":"legenda longa com quebras de linha \\n"},{"key":"reel_curto","title":"...","content":"roteiro de 15s: hook + 1 ponto + CTA"},{"key":"thread","title":"...","blocks":["comentário 1","comentário 2","comentário 3"]},{"key":"live","title":"...","blocks":["bloco 1 (0-2min)","bloco 2","bloco 3","encerramento"]},{"key":"repost_30d","title":"novo hook, mesma essência","content":"versão reformulada"}]}` ,
  dm_variation: `{"conversation":"conversa completa de DM em 5 etapas (CONEXÃO, DIAGNÓSTICO, DEMONSTRAÇÃO, OFERTA, OBJEÇÃO) com falas do lead e respostas do coach, texto puro com quebras de linha \\n"}`,
  objection_variation: `{"answer":"nova resposta para a objeção, texto puro com quebras de linha \\n","triggers":["gatilhos usados"]}`,
  viral_pattern: `{"viral_patterns":["4 a 5 padrões dos posts que performaram"],"weak_patterns":["4 a 5 padrões dos posts fracos"],"recommendations":["4 recomendações práticas"],"best_times":"faixas de horário recomendadas"}`,
  viral_ideas: `{"ideas":[{"titulo":"...","funil":"TOFU|MOFU|BOFU","hook":"...","roteiro":"roteiro completo com marcações de tempo"}, "exatamente 3 itens"]}`,
  ideas_now: `{"ideas":[{"titulo":"...","funil":"TOFU|MOFU|BOFU","hook":"...","produto":"MindForce|nutriON|VEMP ou vazio","roteiro":"roteiro curto pronto pra gravar agora"}, "exatamente 5 itens"]}`,
  proof_caption: `{"caption":"legenda de prova social respeitando privacidade do cliente, com quebras de linha \\n","hashtags":["#tag","... 8 a 12 itens"]}`,
  content_full: `{"titulo":"resumo curto","roteiro":[{"bloco":"HOOK (0-2s)","direcao":"instrução de câmera/cena","fala":"o que falar"},{"bloco":"DESENVOLVIMENTO (2-25s)","direcao":"...","fala":"..."},{"bloco":"CTA (25-30s)","direcao":"...","fala":"..."}],"stories_sequence":[{"numero":1,"visual":"o que aparece na tela","texto":"texto do story","gatilho":"gatilho usado"}],"caption":"legenda completa com quebras de linha \\n","hashtags":["#tag","... 8 a 15 itens"],"production_tips":{"camera":"...","audio":"...","texto_na_tela":"...","duracao":"...","proporcao":"9:16","melhor_horario":"...","edicao":["4 a 6 passos de edição no CapCut"]},"strategy":{"porque_funciona":["4 a 5 razões numeradas"],"gatilhos":["Autoridade","Curiosidade"]}}`,
};


serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const mode: Mode = body?.mode;
    if (!mode || !SCHEMAS[mode]) {
      return new Response(JSON.stringify({ error: "mode inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada");

    const ctx = [
      body?.pillar ? `Pilar: ${body.pillar}` : "",
      body?.format ? `Formato: ${body.format}` : "",
      body?.topic ? `Tema: ${body.topic}` : "",
      body?.style ? `Estilo: ${body.style}` : "",
      body?.duration ? `Duração: ${body.duration}` : "",
      body?.handle ? `Handle: @${String(body.handle).replace("@", "")}` : "",
      body?.bio ? `Bio atual: ${body.bio}` : "",
      body?.notes ? `Contexto extra: ${body.notes}` : "",
      body?.weekStart ? `Semana começando em: ${body.weekStart}` : "",
      body?.funnel ? `Etapa do funil: ${body.funnel} (tofu=audiência, mofu=confiança, bofu=venda)` : "",
      body?.objective ? `Objetivo específico: ${body.objective}` : "",
      body?.product ? `Produto em foco: ${body.product}` : "",
      Array.isArray(body?.niches) && body.niches.length ? `Nichos: ${body.niches.join(", ")}` : "",
      Array.isArray(body?.products) && body.products.length ? `Produtos do coach: ${body.products.join(", ")}` : "",
      Array.isArray(body?.differentials) && body.differentials.length ? `Diferenciais únicos: ${body.differentials.join(", ")}` : "",
      Array.isArray(body?.criteria) && body.criteria.length
        ? `Critérios de avaliação da bio (key|label|peso): ${body.criteria.map((c: any) => `${c.key}|${c.label}|${c.weight}`).join(" ; ")}`
        : "",
      body?.source ? `Conteúdo original para repurposar:\n${body.source}` : "",
      body?.originFormat ? `Formato original: ${body.originFormat}` : "",
      body?.scenario ? `Cenário do DM: ${body.scenario}` : "",
      body?.baseline ? `Versão base (gere uma variação diferente, mesma estratégia):\n${body.baseline}` : "",
      body?.objection ? `Objeção do lead: ${body.objection}` : "",
      body?.bestPosts ? `Posts com melhor performance:\n${body.bestPosts}` : "",
      body?.worstPosts ? `Posts com pior performance:\n${body.worstPosts}` : "",
      body?.formula ? `Fórmula viral identificada: ${body.formula}` : "",
      body?.situation ? `Situação atual do coach agora: ${body.situation}` : "",
      body?.exclude ? `Não repita estas ideias: ${body.exclude}` : "",
      body?.proof ? `Dados reais do cliente (não invente números): ${body.proof}` : "",
      body?.posts ? `Últimos posts descritos pelo coach:\n${body.posts}` : "",
      body?.ig_profile
        ? `Perfil real do Instagram conectado (use nome, bio e temas dos posts para personalizar; não invente dados):\n${JSON.stringify(body.ig_profile)}`
        : "",
      body?.format === "stories" ? "Para formato stories, preencha stories_sequence com 6 stories e deixe roteiro como array vazio." : "",
    ].filter(Boolean).join("\n");


    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `${BRAND}\n\nVocê é o motor SOCIAL ON. Responda SEMPRE apenas JSON válido no schema pedido, sem markdown.` },
          { role: "user", content: `${ctx}\n\nGere no schema:\n${SCHEMAS[mode]}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de uso atingido. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos esgotados no workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) throw new Error(`Gateway ${res.status}: ${await res.text()}`);

    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    }

    return new Response(JSON.stringify({ mode, result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro inesperado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
