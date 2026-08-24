import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { requireUser, adminClient } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCHEMA = `{
  "analysis": {
    "content_detected": ["shape","treino","comida","familia","lifestyle"],
    "environment": "academia|casa|rua|praia|parque|estudio|outro",
    "time_of_day": "manhã|tarde|noite",
    "energy": "alta|média|baixa",
    "quality": "alta|média|baixa",
    "products_visible": ["VEMP","MindForce","nutriON"],
    "people": "sozinho|com_filha|com_cliente|grupo",
    "summary": "2 a 3 frases descrevendo o material como um todo",
    "per_file": [{ "index": 0, "kind": "foto|video", "describe": "o que tem nesse arquivo", "best_use": "capa|slide|story|frame de edit|thumbnail" }]
  },
  "decision": {
    "primary_format": "foto_unica|carrossel|reel_edit|reel_video|stories",
    "secondary_formats": ["carrossel","stories","reel_roteiro"],
    "tone": "direto|cientifico|pessoal|humor|militar|pai",
    "objective": "viralizar|engajar|vender",
    "funnel": "tofu|mofu|bofu",
    "product_mention": "nenhum|nutrion|vemp|mindforce|consultoria",
    "best_time": "11:30",
    "best_day": "quarta",
    "potential": "alto|medio|baixo",
    "reasoning": "por que essas escolhas, 2 a 3 frases"
  },
  "content": {
    "caption": "legenda completa pronta pra copiar, com quebras de linha \\n",
    "hook_variations": ["3 hooks diferentes pra mesma peça, mesmo formato e objetivo — o 1º é o do caption"],
    "caption_variations": ["3 legendas completas diferentes (estruturas e hooks distintos), mesmo formato e objetivo — a 1ª é igual ao caption"],
    "caption_alternatives": {
      "cientifico": "...", "pessoal": "...", "humor": "...", "militar": "...", "pai": "...", "direto": "..."
    },

    "carousel_slides": [{ "title": "texto curto do slide", "body": "2 a 3 linhas", "file_index": 0 }, "exatamente 5 itens, o 1º é capa com hook e o 5º é CTA"],
    "stories_frames": [{ "text": "texto grande do story", "body": "linha de apoio", "sticker": "quiz|enquete|link|nenhum", "sticker_content": "conteúdo pronto do sticker", "file_index": 0 }, "4 a 5 itens"],
    "reel_script": {
      "hook": "primeiros 2 segundos",
      "development": "corpo do reel, pronto pra falar",
      "cta": "chamada final",
      "texts_on_screen": ["TEXTO 1","TEXTO 2","TEXTO 3","@diogo.mell0"],
      "duration_suggested": 30,
      "music_suggestion": "tipo de trend/áudio em alta"
    },
    "edit_sequence": [{ "file_index": 0, "duration_s": 0.5, "transition": "zoom_blur|corte_seco|whip_pan|flash", "text": "texto na tela nesse frame" }],
    "video_notes": {
      "rewritten_script": "reescrita otimizada da fala do vídeo (só quando houver vídeo)",
      "screen_texts": [{ "time": "0-2s", "text": "TEXTO" }],
      "cuts": ["0:03-0:05 — remover pausa"],
      "optimized_duration": "28s → 22s",
      "stories_clips": ["Clip 1: hook (0-10s)","Clip 2: desenvolvimento","Clip 3: CTA + enquete"],
      "thumbnail_frame": "descrição do melhor frame pra thumbnail"
    },
    "weekly_package": [{ "weekday": "SEG", "piece": "Post foto shape + legenda MCE", "objective": "engajar", "format": "reel|carrossel|stories|post_unico|live|collab", "pillar": "mce_drop|bastidor|transformacao|entretenimento|cta", "time": "19:30", "hook": "primeira linha do post desse dia" }, "7 itens SEG a DOM, apenas quando houver 3+ arquivos"],
    "hashtags": ["#tag", "... 15 itens: 5 grandes + 7 médias + 3 nichadas"],
    "self_comment": "comentário pronto pro coach postar logo após publicar"
  }
}`;

const REWRITE_SCHEMAS: Record<string, string> = {
  caption: `{"caption":"nova legenda completa com quebras de linha \\n","hook_variations":["3 hooks diferentes, o 1º é o da nova legenda"],"caption_variations":["3 legendas completas diferentes, a 1ª é igual ao caption"],"caption_alternatives":{"cientifico":"...","pessoal":"...","humor":"...","militar":"...","pai":"...","direto":"..."}}`,
  slides: `{"carousel_slides":[{"title":"texto curto do slide","body":"2 a 3 linhas","file_index":0},"exatamente 5 itens, o 1º é capa com hook e o 5º é CTA"]}`,
  both: `{"caption":"nova legenda completa com quebras de linha \\n","hook_variations":["3 hooks diferentes"],"caption_variations":["3 legendas completas diferentes"],"caption_alternatives":{"cientifico":"...","pessoal":"...","humor":"...","militar":"...","pai":"...","direto":"..."},"carousel_slides":[{"title":"texto curto do slide","body":"2 a 3 linhas","file_index":0},"exatamente 5 itens"]}`,
};

const REWRITE_PROMPT = (target: string, analysis: unknown, decision: unknown, current: unknown, instruction: string) =>
`Você é o PRISM Content Intelligence do nutriON, escrevendo na voz do Coach Diogo Mello (@diogo.mell0), criador do Método MCE, fundador do nutriON. Tagline: "Transformação é sistema."

A ANÁLISE VISUAL JÁ FOI FEITA E NÃO MUDA. Mantenha exatamente a mesma leitura do material, o mesmo formato, tom, objetivo, funil e produto decididos:
ANÁLISE: ${JSON.stringify(analysis).slice(0, 3000)}
DECISÃO: ${JSON.stringify(decision).slice(0, 1500)}

VERSÃO ATUAL (não repita, escreva uma versão NOVA e diferente, com outros hooks e outra estrutura de frases):
${JSON.stringify(current).slice(0, 4000)}

PEDIDO DO COACH PARA ESTA NOVA VERSÃO: ${instruction || "gere uma alternativa igualmente forte, com abordagem diferente"}

REGRAS:
- Frases curtas (máx 15 palavras), tom de conversa com autoridade, parágrafos de até 3 linhas separados por linha em branco.
- Hook isolado na 1ª linha. CTA sempre no final da legenda.
- Nunca citação acadêmica nem nome de journal. Máximo 3-4 emojis. Zero hashtags dentro da legenda.
- Mantenha os mesmos file_index dos slides atuais quando existirem.
- Nunca se apresente como IA.
- Responda JSON puro, sem markdown, exatamente neste schema:
${REWRITE_SCHEMAS[target]}`;

const callGateway = async (apiKey: string, model: string, messages: unknown[]) => {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, response_format: { type: "json_object" } }),
  });
  if (res.status === 429) throw Object.assign(new Error("Limite de uso atingido. Tente novamente em instantes."), { status: 429 });
  if (res.status === 402) throw Object.assign(new Error("Créditos de IA esgotados no workspace."), { status: 402 });
  if (!res.ok) throw new Error(`Gateway ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const json = await res.json();
  const raw = json?.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(String(raw).replace(/```json|```/g, "").trim());
  }
};

const PROMPT = (ctx: string, filesCount: number, imgCount: number, videoInfo: string, extra: string) =>
`Você é o PRISM Content Intelligence do nutriON.

PERFIL DO COACH:
- Nome: Diogo Mello (@diogo.mell0)
- Nutrition & Business Coach — certificação americana
- Automação & IA no Fitness
- Criador do Método MCE (Mindset, Comportamento, Execução) · Fundador nutriON (nutrion.app.br)
- Pai de menina · 16 anos de Marinha do Brasil
- Produtos: nutriON (plataforma), VEMP (roupa), MindForce (creatina)
- Tagline: "Transformação é sistema."

CONTEXTO DADO PELO COACH: ${ctx || "nenhum"}
ARQUIVOS: ${filesCount} no total (${imgCount} imagens analisadas visualmente)${videoInfo}
DIA/HORA ATUAL (Brasil): ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
${extra}

${COACH_CONTEXT}

ANALISE as imagens enviadas e decida sozinho o melhor formato, tom, objetivo, produto e horário. Depois gere TODO o conteúdo.

REGRAS:
- Legenda: frases curtas (máx 15 palavras), tom de conversa com autoridade, parágrafos de até 3 linhas separados por linha em branco, hook isolado na 1ª linha.
- Nunca citação acadêmica (Autor et al., ano) nem nome de journal.
- Máximo 3-4 emojis na legenda inteira. Hashtags só no campo hashtags.
- Hashtags: 15 no total (5 grandes + 7 médias + 3 nichadas).
- Carrossel: exatamente 5 slides. Stories: 4 a 5 frames com stickers.
- Com múltiplas fotos: preencher edit_sequence com timing por frame e file_index real.
- Com vídeo: preencher video_notes (roteiro reescrito, textos por segundo, cortes, clips de stories).
- Com 3+ arquivos: preencher weekly_package com 7 dias, cada dia com format, pillar, time (HH:MM realista pro público brasileiro, variando entre os dias) e hook.
- Nunca forçar venda. Mencionar produto só quando natural.
- Sempre terminar a legenda com CTA (salva / manda / comenta / segue).
- SEMPRE preencher hook_variations e caption_variations com exatamente 3 itens cada, mantendo o MESMO formato, objetivo e produto — muda só o ângulo, o hook e a estrutura das frases. A 1ª variação é a versão principal (caption).
- Nunca se apresente como IA. A voz é a do próprio Diogo Mello.
- Responda JSON puro, sem markdown, exatamente neste schema:
${SCHEMA}`;

// ───────────────── STUDIO (modos do hub PRISM) ─────────────────

const COACH_CONTEXT = `CONTEXTO DO COACH:
- Diogo Mello, @diogo.mell0
- Negro brasileiro — conteúdo de representatividade é autêntico e importante pra sua audiência
- Pai de menina — conteúdo familiar viraliza muito
- 16 anos de Marinha do Brasil — disciplina militar é storytelling forte
- Nutrition & Business Coach (certificação americana) · Criador do Método MCE (Mindset, Comportamento, Execução)
- Produtos: nutriON (plataforma, nutrion.app.br), VEMP (roupa), MindForce (creatina)
- Consultoria: R$ 247/mês
- Tagline: "Transformação é sistema."

REGRA DE PRODUCT PLACEMENT:
- Máximo 20% do conteúdo menciona produto. Product placement > venda direta.
- Quando mencionar produto, fazer de forma NATURAL. Nunca forçar venda em conteúdo TOFU.
- MindForce: sempre na rotina, nunca como anúncio. VEMP: vestir nos vídeos, nunca falar "compre".
- nutriON: mostrar a tela como parte da rotina. Consultoria: só em BOFU com CTA claro.

REGRA DE REPRESENTATIVIDADE:
- Tratar com orgulho e autenticidade. Nunca vitimizar — sempre empoderar.
- Conectar identidade com disciplina e evolução. Pai negro presente é conteúdo poderoso.
- Shape negro + confiança = viral garantido.

REGRA DE VIRAL:
- Edits curtos (8-15s) viralizam mais que longos. Fisheye + letras bold = formato em alta.
- POV sempre começa com "POV:" na tela. Cada texto na tela sincronizado com a batida.
- Hook nos primeiros 2 segundos ou perde. Trends musicais > música aleatória.
- Humor inteligente > humor tosco.

REGRAS DE ESCRITA:
- Frases curtas (máx 15 palavras), tom de conversa com autoridade, hook isolado na 1ª linha.
- Máximo 3-4 emojis por legenda. Hashtags só no campo hashtags. Nunca citação acadêmica.
- Nunca se apresente como IA. A voz é a do próprio Diogo Mello.`;

const STUDIO_SCHEMA = `{
  "headline": "título curto do que foi gerado",
  "strategy": {
    "format": "reel|carrossel|stories|post_unico",
    "tone": "direto|cientifico|pessoal|humor|militar|pai",
    "objective": "viralizar|engajar|vender",
    "funnel": "tofu|mofu|bofu",
    "product_mention": "nenhum|nutrion|mindforce|vemp|consultoria",
    "sale_level": "invisivel|suave|direto|nenhum",
    "best_time": "19:30",
    "best_day": "quarta",
    "potential": "alto|medio|baixo",
    "reasoning": "por que essas escolhas, 2 frases"
  },
  "concepts": [{
    "title": "nome do conceito",
    "format": "reel|carrossel|stories|post_unico",
    "tone": "direto|cientifico|pessoal|humor|militar|pai",
    "why": "por que esse conceito funciona, 1 frase",
    "hook": "primeiros 2 segundos",
    "hook_variations": ["exatamente 3 hooks diferentes pra essa mesma peça — o 1º é igual ao hook"],
    "screen_texts": ["Beat 1: POV:", "Beat 2: TEXTO", "Beat 3: TEXTO"],
    "script": { "hook": "...", "development": "corpo pronto pra falar", "cta": "chamada final" },
    "edit_sequence": [{ "file_index": 0, "duration_s": 0.5, "transition": "zoom_blur|flash|whip_pan|slide|corte_seco", "text": "texto na tela" }],
    "shot_list": ["1 foto rosto sério (close)", "1 foto shape frente"],
    "editing_tips": ["Fisheye no CapCut: Body > Lens > Wide 30-50%", "Font Anton branca contorno preto 3px"],
    "music_suggestion": "tipo de trend/áudio em alta",
    "duration_suggested": 12,
    "caption": "legenda pronta com quebras de linha \\n",
    "caption_variations": ["exatamente 3 legendas completas diferentes pra essa mesma peça — a 1ª é igual ao caption"],
    "hashtags": ["#tag", "15 no total: 5 grandes + 7 médias + 3 nichadas"],
    "self_comment": "comentário pra postar logo após publicar"
  }, "3 conceitos quando não houver material; 1 a 3 quando houver"],
  "week": [{
    "weekday": "SEG", "date_label": "SEG 25/08",
    "piece": "Reel POV fisheye", "format": "reel|carrossel|stories|post_unico",
    "pillar": "mce_drop|bastidor|transformacao|entretenimento|cta",
    "objective": "viralizar|engajar|vender", "funnel": "tofu|mofu|bofu",
    "time": "19:30", "hook": "primeira linha do post", "product": "nenhum|nutrion|mindforce|vemp|consultoria",
    "caption": "legenda pronta", "stories": ["Story 1: ...", "8 itens"]
  }, "7 itens SEG a DOM apenas no modo pack_semanal, senão []"],
  "week_summary": "resumo do mix TOFU/MOFU/BOFU e produtos — só no pack_semanal"
}`;

const MODE_BRIEF: Record<string, string> = {
  viral_trend: "MODO VIRAL/TREND: conteúdo TOFU puro, feito pra viralizar e trazer seguidor novo. Curto, bold, hook brutal. No subtipo 'polemica' gere 5 conceitos, cada um com tema polêmico, formato e roteiro completo.",
  reels: "MODO REELS: roteiro completo de um Reel do tipo escolhido, pronto pra gravar hoje: hook, fala, textos na tela por beat, dicas de edição no CapCut, música e duração.",
  vender: "MODO VENDER: conteúdo de conversão respeitando o nível de venda escolhido (invisível = product placement puro sem mencionar; suave = menção natural sem CTA de compra; direto = CTA explícito com preço quando fizer sentido).",
  representatividade: "MODO REPRESENTATIVIDADE: gere 3 conceitos de edit/roteiro com identidade negra, orgulho e superação, sempre conectando com disciplina e evolução. Nunca vitimizar.",
  lifestyle_pai: "MODO LIFESTYLE/PAI: conteúdo pessoal, íntimo, real. Rotina, família, bastidor. Sem venda. Storytelling que gera conexão.",
  pack_semanal: "MODO PACK SEMANAL: preencha 'week' com 7 dias (SEG a DOM), cada dia com peça principal, 8 stories, produto e horário realista. Respeite a proporção TOFU/MOFU/BOFU e os produtos permitidos. Preencha 'concepts' com no máximo 2 destaques da semana.",
  ia_decide: "MODO IA DECIDE (Relâmpago): decida sozinho formato, tom, objetivo, funil e produto a partir do material. Entregue 1 conceito matador e 2 alternativas.",
  post_pronto: "MODO POST PRONTO: pacote completo a partir do material enviado.",
  reel_diario: `MODO REEL DIÁRIO: gere EXATAMENTE 1 conceito de Reel, pronto pra gravar hoje, seguindo à risca o PILAR DO DIA e a FÓRMULA escolhida.
- screen_texts DEVE vir com marcação de tempo no início de cada item, no formato "0-2s | TEXTO NA TELA".
- O roteiro (script.development) é a fala pronta, palavra por palavra, no ritmo de 15 a 40 segundos.
- editing_tips: cortes, transições e dicas de CapCut. music_suggestion: tipo de trend/áudio em alta hoje.
- shot_list: exatamente o que gravar (ângulo, local, roupa, luz).
- Sempre respeitar a estrutura da fórmula (hook / corpo / punch / CTA).`,
  pack_dia: `MODO PACK DO DIA: gere EXATAMENTE 4 conceitos, nesta ordem:
1) "Reel do dia" — roteiro completo com screen_texts marcados por tempo ("0-2s | TEXTO"), fala pronta, música e dicas de edição.
2) "Story 1 · Bastidor" — formato stories, texto grande e legenda de apoio.
3) "Story 2 · Micro-conteúdo" — frase MCE ou dica de 15s, formato stories.
4) "Story 3 · CTA" — enquete, quiz, link ou gatilho de DM pronto, formato stories.
Tudo alinhado ao pilar e ao produto do dia. Os 3 stories devem conversar com o Reel.`,
};

const STUDIO_PROMPT = (o: {
  mode: string; subtype: string; saleLevel: string; tone: string; objective: string;
  theme: string; filesInfo: string; mix: string; products: string; extra: string;
}) =>
`Você é o PRISM Content Intelligence do nutriON, escrevendo na voz do Coach Diogo Mello.

${COACH_CONTEXT}

${MODE_BRIEF[o.mode] || MODE_BRIEF.post_pronto}

PARÂMETROS:
- Modo: ${o.mode}
- Subtipo: ${o.subtype || "não definido — escolha o melhor"}
- Nível de venda: ${o.saleLevel || "não se aplica"}
- Tom pedido: ${o.tone || "escolha o melhor"}
- Objetivo: ${o.objective || "escolha o melhor"}
- Tema / o que está acontecendo: ${o.theme || "não informado"}
- Material: ${o.filesInfo}
${o.mix ? `- Proporção da semana: ${o.mix}` : ""}
${o.products ? `- Produtos permitidos esta semana: ${o.products}` : ""}
- DIA/HORA ATUAL (Brasil): ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
${o.extra}

REGRAS DE SAÍDA:
- Quando houver arquivos enviados, use file_index reais no edit_sequence e descreva o que está em cada um.
- Quando NÃO houver material, preencha shot_list dizendo exatamente que fotos/vídeos gravar.
- Sempre 15 hashtags por conceito e sempre CTA no fim da legenda.
- Em CADA conceito, preencher hook_variations e caption_variations com exatamente 3 itens cada, mantendo o MESMO formato, objetivo, tom e produto. Muda só o ângulo de entrada, o hook e a estrutura das frases. A 1ª variação é sempre a versão principal.
- Responda JSON puro, sem markdown, exatamente neste schema:
${STUDIO_SCHEMA}`;

serve(async (req) => {

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const images: string[] = Array.isArray(body?.images) ? body.images.slice(0, 10) : [];
    const videos: { name?: string; duration?: number; frames?: string[] }[] = Array.isArray(body?.videos) ? body.videos.slice(0, 3) : [];
    const context: string = typeof body?.context === "string" ? body.context.slice(0, 2000) : "";
    const history: string = typeof body?.history === "string" ? body.history.slice(0, 4000) : "";
    const igProfile = body?.ig_profile ?? null;

    const apiKeyEnv = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKeyEnv) throw new Error("LOVABLE_API_KEY não configurada");

    // ---- MODO REESCRITA: nova versão de legenda/slides mantendo a MESMA análise ----
    if (body?.mode === "rewrite") {
      const target: string = ["caption", "slides", "both"].includes(body?.target) ? body.target : "caption";
      if (!body?.analysis || !body?.decision) {
        return new Response(JSON.stringify({ error: "Rode o PRISM antes de pedir uma nova versão." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const instruction: string = typeof body?.instruction === "string" ? body.instruction.slice(0, 600) : "";
      try {
        const parsedRw = await callGateway(apiKeyEnv, "google/gemini-2.5-flash", [
          { role: "system", content: "Você é o PRISM Content Intelligence. Responda SEMPRE apenas JSON válido, sem markdown." },
          { role: "user", content: REWRITE_PROMPT(target, body.analysis, body.decision, body?.current ?? {}, instruction) },
        ]);
        return new Response(JSON.stringify({ result: parsedRw }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        const status = (e as any)?.status ?? 500;
        return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro inesperado" }), {
          status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ---- MODO REELS STUDIO: 1 mídia + template visual -> pacote completo de Reel ----
    if (body?.mode === "reels_studio") {
      const tplName = typeof body?.template_name === "string" ? body.template_name.slice(0, 60) : "Livre";
      const tplDesc = typeof body?.template_desc === "string" ? body.template_desc.slice(0, 200) : "";
      const frame = typeof body?.image === "string" ? body.image : (images[0] ?? null);
      const isVideo = !!body?.from_video;

      const sys = `Você é o PRISM Content Intelligence do nutriON, sistema do coach Diogo Mello (@diogo.mell0).

IDENTIDADE:
- Nutrition Coach e Business Coach com certificação americana
- Criador do Método MCE (Mindset, Comportamento, Execução) · Fundador do nutriON
- 16 anos de Marinha do Brasil · pai de menina · bodybuilder · Nilópolis/RJ
- Tagline: "Transformação é sistema."
- Tom: direto, sem enrolação, técnico mas acessível, nunca guru, nunca se apresenta como IA.

TEMPLATE ESCOLHIDO: ${tplName} — ${tplDesc}

AUTORES MCE (usar só quando fizer sentido): Dweck, Kahneman, Bandura, Frankl, Rotter, Merzenich, Clear, Duhigg, Fogg, Thaler, Baumeister, Prochaska.

REGRAS:
- 100% português brasileiro. Nunca genérico.
- Frases MCE naturais: "O comportamento vem antes do alimento", "O processo é o produto", "Disciplina é arquitetura comportamental".
- NUNCA use "jornada", "mindful", "empoderamento", "desbloqueie seu potencial".
- Hashtags misturando BR e internacionais.
- Toda legenda termina com CTA forte. O self-comment tem que gerar DM.

Responda SOMENTE JSON válido neste schema:
{
 "analise_visual": "1-2 frases do que você vê",
 "template_match": "por que o template encaixa",
 "hook": "frase de impacto dos 2 primeiros segundos",
 "roteiro": {
  "hook_0_2s": "texto na tela",
  "corpo_2_20s": "ações, cortes e textos do corpo",
  "punch_20_28s": "frase de impacto final",
  "cta_28_35s": "CTA final",
  "duracao_total": "ex: 22s",
  "musica": "estilo ou áudio trending",
  "edicao": "transições, velocidade, efeitos"
 },
 "legendas": [
  {"tom":"DIRETO","texto":"..."},
  {"tom":"CIENTÍFICO","texto":"..."},
  {"tom":"PESSOAL","texto":"..."}
 ],
 "hashtags": ["#...", "até 25"],
 "self_comment": "...",
 "melhor_horario": "dia e horário",
 "stories": ["Story 1: ...", "Story 2: ...", "Story 3: ... com CTA"],
 "produto_sugerido": "nutriON | MCE | Business Coaching | MindForce Creatine",
 "nivel_funil": "TOFU | MOFU | BOFU"
}`;

      const userText = `Analise ${isVideo ? "este frame extraído do vídeo" : "esta imagem"} e gere o pacote completo de Reel.
Template: ${tplName} (${tplDesc})
${context ? `Contexto do coach: ${context}` : "Sem contexto adicional."}
${history ? `Histórico recente (não repita temas):\n${history}` : ""}
Gere o JSON completo.`;

      const content: unknown[] = [];
      if (frame) content.push({ type: "image_url", image_url: { url: frame } });
      content.push({ type: "text", text: userText });

      try {
        const parsedReel = await callGateway(
          apiKeyEnv,
          frame ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
          [{ role: "system", content: sys }, { role: "user", content }],
        );
        let reelId: string | null = null;
        try {
          const { data } = await adminClient().from("prism_analyses").insert({
            coach_id: auth.userId,
            files_count: 1,
            file_types: [isVideo ? "video" : "image"],
            context,
            mode: "reels_studio",
            subtype: tplName,
            ai_content: parsedReel ?? null,
            format_used: "reel",
          }).select("id").single();
          reelId = data?.id ?? null;
        } catch (_) { /* persistência não bloqueia */ }

        return new Response(JSON.stringify({ id: reelId, result: parsedReel }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        const status = (e as any)?.status ?? 500;
        return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro inesperado" }), {
          status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ---- MODO SOCIAL VERSOES: 1 mídia -> 4 versões prontas pra postar ----
    if (body?.mode === "social_versoes") {
      const frame = typeof body?.image === "string" ? body.image : (images[0] ?? null);

      const sysV = `Você é o sistema de conteúdo do nutriON, escrevendo na voz do Coach Diogo Mello (@diogo.mell0).

${COACH_CONTEXT}

REGRAS:
- 100% português brasileiro, direto, sem enrolação. "Transformação é sistema."
- NUNCA use "jornada", "mindful", "empoderamento", "desbloqueie seu potencial".
- Nunca se apresente como IA nem como sistema: a voz é do Diogo Mello.
- Cada "texto_video" é curto (máx 6 palavras) e bate forte na tela.

Analise a mídia e gere 4 VERSÕES DIFERENTES de conteúdo pro Instagram, cada uma com estilo e propósito próprio.

Responda SOMENTE JSON válido neste schema:
{"versoes":[
{"nome":"REEL IMPACTO","texto_video":"máx 6 palavras de impacto","legenda":"legenda completa com CTA e @diogo.mell0","hashtags":["até 20 hashtags"],"self_comment":"comentário pra gerar DMs","musica":"áudio trending","horario":"melhor horário"},
{"nome":"STORY FRASE","texto_video":"frase curta emocional ou MCE","legenda":"legenda curta pra story","hashtags":["até 10 hashtags"],"self_comment":"","musica":"","horario":""},
{"nome":"FEED EDUCATIVO","texto_video":"título educativo curto","legenda":"legenda longa educativa com referência do método MCE e CTA","hashtags":["até 20 hashtags"],"self_comment":"comentário técnico","musica":"","horario":"melhor horário"},
{"nome":"PROVOCAÇÃO","texto_video":"frase provocativa de 4-6 palavras","legenda":"legenda direta provocativa com CTA forte","hashtags":["até 15 hashtags"],"self_comment":"comentário que gera debate","musica":"","horario":""}
]}`;

      const vContent: unknown[] = [];
      if (frame) vContent.push({ type: "image_url", image_url: { url: frame } });
      vContent.push({
        type: "text",
        text: `Analise ${frame ? (body?.from_video ? "este frame do vídeo" : "esta imagem") : "o contexto"} e gere as 4 versões.
${context ? `Contexto do coach: ${context}` : "Sem contexto adicional."}
Responda JSON puro.`,
      });

      try {
        const parsedV = await callGateway(
          apiKeyEnv,
          frame ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
          [{ role: "system", content: sysV }, { role: "user", content: vContent }],
        );
        try {
          await adminClient().from("prism_analyses").insert({
            coach_id: auth.userId,
            files_count: frame ? 1 : 0,
            file_types: [body?.from_video ? "video" : "image"],
            context,
            mode: "social_versoes",
            subtype: "4-versoes",
            ai_content: parsedV ?? null,
            format_used: "reel",
          });
        } catch (_) { /* persistência não bloqueia */ }

        return new Response(JSON.stringify({ result: parsedV }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        const status = (e as any)?.status ?? 500;
        return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro inesperado" }), {
          status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }


    // ---- MODO SOCIAL PRO: 1 mídia + vibe visual -> texto do vídeo, legenda, hashtags, stories ----
    if (body?.mode === "social_pro") {
      const vibeName = typeof body?.vibe === "string" ? body.vibe.slice(0, 40) : "POV";
      const frame = typeof body?.image === "string" ? body.image : (images[0] ?? null);

      const sysPro = `Você é o PRISM Content Intelligence do nutriON, escrevendo na voz do Coach Diogo Mello (@diogo.mell0).

${COACH_CONTEXT}

VIBE VISUAL ESCOLHIDA: ${vibeName}

REGRAS:
- 100% português brasileiro, direto, sem enrolação. "Transformação é sistema."
- NUNCA use "jornada", "mindful", "empoderamento", "desbloqueie seu potencial".
- Nunca se apresente como IA nem como sistema: a voz é do Diogo Mello.
- O texto do vídeo tem no máximo 8 palavras e precisa bater forte na tela.

Responda SOMENTE JSON válido neste schema:
{
 "texto_video": "texto curto pra queimar no vídeo (máx 8 palavras)",
 "hook": "hook de 2 segundos pra abrir o reel",
 "legenda": "legenda completa pro Instagram com quebras de linha e CTA final",
 "hashtags": ["#tag", "até 20"],
 "self_comment": "comentário no próprio post pra gerar DM",
 "musica": "sugestão de áudio trending",
 "horario": "melhor horário pra postar",
 "stories": ["story 1", "story 2", "story 3"]
}`;

      const proContent: unknown[] = [];
      if (frame) proContent.push({ type: "image_url", image_url: { url: frame } });
      proContent.push({
        type: "text",
        text: `Analise ${frame ? (body?.from_video ? "este frame do vídeo" : "esta imagem") : "o contexto"} e gere o pacote completo.
Vibe: ${vibeName}
${context ? `Contexto do coach: ${context}` : "Sem contexto adicional."}
Responda JSON puro.`,
      });

      try {
        const parsedPro = await callGateway(
          apiKeyEnv,
          frame ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
          [{ role: "system", content: sysPro }, { role: "user", content: proContent }],
        );
        try {
          await adminClient().from("prism_analyses").insert({
            coach_id: auth.userId,
            files_count: frame ? 1 : 0,
            file_types: [body?.from_video ? "video" : "image"],
            context,
            mode: "social_pro",
            subtype: vibeName,
            ai_content: parsedPro ?? null,
            format_used: "reel",
          });
        } catch (_) { /* persistência não bloqueia */ }

        return new Response(JSON.stringify({ result: parsedPro }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        const status = (e as any)?.status ?? 500;
        return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro inesperado" }), {
          status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ---- MODO STUDIO: modos do hub (viral, reels, vender, representatividade, lifestyle, pack, ia_decide) ----
    if (body?.mode === "studio") {
      const s = (v: unknown, n = 60) => (typeof v === "string" ? v.slice(0, n) : "");
      const pMode = s(body?.prism_mode, 40) || "ia_decide";
      const studioFrames = videos.flatMap((v) => (Array.isArray(v.frames) ? v.frames.slice(0, 3) : []));
      const studioImages = [...images, ...studioFrames].slice(0, 14);
      const trimInfo = videos
        .filter((v: any) => v?.trim && Number.isFinite(v.trim.duration))
        .map((v: any) => `${v.name || "vídeo"}: trecho ${v.trim.start}s→${v.trim.end}s (${v.trim.duration}s)`)
        .join(" | ");
      const filesInfo = studioImages.length
        ? `${images.length} foto(s) e ${videos.length} vídeo(s) enviados — imagens anexadas nesta mensagem${trimInfo ? `. Trechos selecionados: ${trimInfo}. Ajuste roteiro e legenda à duração do trecho.` : ""}`
        : "nenhum material enviado — só ideia";

      const messages = [
        { role: "system", content: "Você é o PRISM Content Intelligence. Responda SEMPRE apenas JSON válido, sem markdown." },
        {
          role: "user",
          content: [
            ...studioImages.map((url) => ({ type: "image_url", image_url: { url } })),
            {
              type: "text",
              text: STUDIO_PROMPT({
                mode: pMode,
                subtype: s(body?.subtype, 40),
                saleLevel: s(body?.sale_level, 20),
                tone: s(body?.tone, 20),
                objective: s(body?.objective, 20),
                theme: s(body?.theme ?? body?.context, 600),
                filesInfo,
                mix: s(body?.mix, 120),
                products: Array.isArray(body?.products) ? body.products.map((p: unknown) => s(p, 30)).join(", ") : "",
                 extra: [
                   s(body?.daily_brief, 2500) ? `BRIEFING DO DIA (obrigatório seguir):\n${s(body?.daily_brief, 2500)}` : "",
                   history ? `HISTÓRICO RECENTE (não repita temas):\n${history}` : "",
                  igProfile ? `PERFIL REAL DO INSTAGRAM:\n${JSON.stringify(igProfile).slice(0, 1200)}` : "",
                ].filter(Boolean).join("\n\n"),
              }),
            },
          ],
        },
      ];

      try {
        const parsedStudio = await callGateway(
          apiKeyEnv,
          studioImages.length ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
          messages,
        );

        let studioId: string | null = null;
        try {
          const { data } = await adminClient()
            .from("prism_analyses")
            .insert({
              coach_id: auth.userId,
              files_count: images.length + videos.length,
              file_types: [...images.map(() => "image"), ...videos.map(() => "video")],
              context: s(body?.theme ?? body?.context, 2000),
              mode: pMode,
              subtype: s(body?.subtype, 40) || null,
              sale_level: s(body?.sale_level, 20) || null,
              product_mentioned: parsedStudio?.strategy?.product_mention ?? null,
              ai_decision: parsedStudio?.strategy ?? null,
              ai_content: parsedStudio ?? null,
              tone_used: parsedStudio?.strategy?.tone ?? null,
              objective_used: parsedStudio?.strategy?.objective ?? null,
              format_used: parsedStudio?.strategy?.format ?? null,
            })
            .select("id")
            .single();
          studioId = data?.id ?? null;
        } catch (_) { /* persistência não bloqueia a entrega */ }

        return new Response(JSON.stringify({ id: studioId, result: parsedStudio }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        const status = (e as any)?.status ?? 500;
        return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro inesperado" }), {
          status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }



    const videoFrames = videos.flatMap((v) => (Array.isArray(v.frames) ? v.frames.slice(0, 4) : []));
    const allImages = [...images, ...videoFrames].slice(0, 14);

    if (!allImages.length) {
      return new Response(JSON.stringify({ error: "Envie pelo menos uma foto ou vídeo." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = apiKeyEnv;

    const videoInfo = videos.length
      ? `\nVÍDEOS: ${videos.length} — ${videos.map((v, i) => `vídeo ${i + 1}: ${Math.round(v.duration || 0)}s (${(v.frames || []).length} frames extraídos enviados como imagem)`).join("; ")}`
      : "";

    const extra = [
      history ? `HISTÓRICO RECENTE DE CONTEÚDO (não repita temas dos últimos 7 dias):\n${history}` : "",
      igProfile ? `PERFIL REAL DO INSTAGRAM:\n${JSON.stringify(igProfile).slice(0, 1500)}` : "",
    ].filter(Boolean).join("\n\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: "Você é o PRISM Content Intelligence. Responda SEMPRE apenas JSON válido, sem markdown." },
          {
            role: "user",
            content: [
              ...allImages.map((url) => ({ type: "image_url", image_url: { url } })),
              { type: "text", text: PROMPT(context, images.length + videos.length, allImages.length, videoInfo, extra) },
            ],
          },
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
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados no workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) throw new Error(`Gateway ${res.status}: ${(await res.text()).slice(0, 400)}`);

    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = JSON.parse(String(raw).replace(/```json|```/g, "").trim());
    }

    const fileTypes = [
      ...images.map(() => "image"),
      ...videos.map(() => "video"),
    ];

    let saved: any = null;
    try {
      const { data } = await adminClient()
        .from("prism_analyses")
        .insert({
          coach_id: auth.userId,
          files_count: images.length + videos.length,
          file_types: fileTypes,
          context,
          ai_analysis: parsed?.analysis ?? null,
          ai_decision: parsed?.decision ?? null,
          ai_content: parsed?.content ?? null,
          tone_used: parsed?.decision?.tone ?? null,
          objective_used: parsed?.decision?.objective ?? null,
          format_used: parsed?.decision?.primary_format ?? null,
        })
        .select("id")
        .single();
      saved = data;
    } catch (_) { /* persistência não bloqueia a entrega */ }

    return new Response(JSON.stringify({ id: saved?.id ?? null, result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro inesperado" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
