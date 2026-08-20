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
  caption: `{"caption":"nova legenda completa com quebras de linha \\n","caption_alternatives":{"cientifico":"...","pessoal":"...","humor":"...","militar":"...","pai":"...","direto":"..."}}`,
  slides: `{"carousel_slides":[{"title":"texto curto do slide","body":"2 a 3 linhas","file_index":0},"exatamente 5 itens, o 1º é capa com hook e o 5º é CTA"]}`,
  both: `{"caption":"nova legenda completa com quebras de linha \\n","caption_alternatives":{"cientifico":"...","pessoal":"...","humor":"...","militar":"...","pai":"...","direto":"..."},"carousel_slides":[{"title":"texto curto do slide","body":"2 a 3 linhas","file_index":0},"exatamente 5 itens"]}`,
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
- Nunca se apresente como IA. A voz é a do próprio Diogo Mello.
- Responda JSON puro, sem markdown, exatamente neste schema:
${SCHEMA}`;

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
