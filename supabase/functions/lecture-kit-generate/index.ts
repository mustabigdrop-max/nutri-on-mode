// Kit de Palestra — monta um roteiro de slides + fala do palestrante pra
// uma apresentação ao vivo (ex: palestra de fisiculturismo), cruzando os
// domínios que o coach escolher (treino, nutrição, farmacologia).
//
// Importante sobre evidência científica: este motor NUNCA inventa estudo,
// autor, ano ou estatística. Os achados científicos vêm de fora (a função
// pubmed-live, que faz busca real na web) e chegam aqui já prontos, em
// `body.scienceContext` — a IA só organiza e explica esse material real em
// formato de slide. Isso existe porque um LLM "lembrando" citações de
// memória erra referência com frequência — inaceitável pra alguém citar
// ao vivo pra uma plateia.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `
Você monta roteiros de palestra pra profissionais de nutrição esportiva e
fisiculturismo apresentarem pessoalmente (slides no PowerPoint + fala ao
vivo), no nível de quem já é autoridade no assunto — didático, mas sem
soar básico pra uma audiência que já treina ou atende atletas.

REGRAS OBRIGATÓRIAS:
1. Use SOMENTE os achados científicos fornecidos no contexto abaixo pra
   qualquer afirmação que soe como dado de pesquisa. NUNCA invente nome de
   estudo, autor, ano, revista científica ou estatística que não esteja
   no contexto — se o contexto não cobrir algo, fale em termos de
   consenso/prática estabelecida, sem fingir que é uma citação específica.
2. Cada slide é enxuto: máximo 4 bullets curtos (o que vai NA TELA), mais
   uma "fala_do_palestrante" separada e mais completa (o que a pessoa diz
   em voz alta — pode ser mais longa, é o roteiro real da fala).
3. Estrutura por blocos, cobrindo só os domínios pedidos, na ordem:
   abertura (autoridade + gancho) → domínios pedidos, cada um com
   contexto científico real → encerramento com CTA de autoridade.
4. Tom: direto, técnico sem ser hermético, sem clichê motivacional vazio.
   Nunca se apresente como IA.
5. Responda SEMPRE apenas JSON válido no schema pedido, sem markdown, sem
   texto fora do JSON.
`.trim();

interface LectureBody {
  topic?: string;
  domains?: string[];
  durationMinutes?: number;
  scienceContext?: string;
  handle?: string;
  niches?: string[];
  differentials?: string[];
}

function coachIdentity(body: LectureBody): string {
  const handle = (body.handle || "").replace("@", "").trim();
  const niches = Array.isArray(body.niches) ? body.niches.filter(Boolean) : [];
  const differentials = Array.isArray(body.differentials) ? body.differentials.filter(Boolean) : [];
  if (!handle && !niches.length && !differentials.length) {
    return "PALESTRANTE: perfil ainda não preenchido — escreva de forma profissional e genérica, sem inventar nome, credencial ou história pessoal.";
  }
  return [
    handle ? `PALESTRANTE: @${handle}` : "",
    niches.length ? `Nicho: ${niches.join(", ")}` : "",
    differentials.length ? `Diferenciais (use pra personalizar o tom, sem inventar além disso): ${differentials.join(", ")}` : "",
  ].filter(Boolean).join("\n");
}

const SCHEMA = `{
  "titulo": "título de impacto pra abrir a palestra",
  "subtitulo": "linha de apoio curta",
  "gancho_abertura": "frase ou pergunta de 1-2 frases pra prender a plateia nos primeiros 30 segundos",
  "agenda": ["3 a 6 blocos, na ordem em que serão apresentados"],
  "slides": [
    {
      "numero": 1,
      "bloco": "ABERTURA | TREINO | NUTRICAO | FARMACOLOGIA | ENCERRAMENTO",
      "titulo_slide": "título curto pra colocar no PowerPoint",
      "bullets": ["2 a 4 bullets curtos, o que vai NA TELA"],
      "fala_do_palestrante": "o que dizer em voz alta nesse slide — mais completo que os bullets, texto corrido",
      "dado_cientifico": "achado real do contexto fornecido usado nesse slide, ou string vazia se este slide não citar dado científico"
    }
  ],
  "citacoes_chave": ["lista das fontes/achados reais citados ao longo da palestra, no formato que vieram do contexto — vazio se não houver contexto científico"],
  "encerramento_cta": "fechamento que reforça autoridade e convida a plateia pra um próximo passo concreto"
}`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY ausente" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: LectureBody = await req.json().catch(() => ({}));
    const topic = (body.topic || "").trim();
    if (!topic) {
      return new Response(JSON.stringify({ error: "Informe o tema da palestra." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const domains = Array.isArray(body.domains) && body.domains.length ? body.domains : ["treino", "nutricao"];
    const duration = body.durationMinutes && body.durationMinutes > 0 ? body.durationMinutes : 25;
    const scienceContext = (body.scienceContext || "").trim();

    const userPrompt = [
      `TEMA DA PALESTRA: ${topic}`,
      `DOMÍNIOS A COBRIR (nesta ordem): ${domains.join(", ")}`,
      `DURAÇÃO ALVO: ${duration} minutos — gere entre ${Math.max(6, Math.round(duration * 0.5))} e ${Math.max(10, Math.round(duration * 0.7))} slides no total, incluindo abertura e encerramento.`,
      coachIdentity(body),
      scienceContext
        ? `ACHADOS CIENTÍFICOS REAIS (única fonte permitida pra citação — use e distribua entre os slides dos domínios correspondentes):\n${scienceContext}`
        : "Nenhum achado científico foi fornecido — fale em termos de consenso e prática estabelecida, sem citar estudo específico nenhum.",
      `Gere no schema JSON:\n${SCHEMA}`,
    ].filter(Boolean).join("\n\n");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000);
    let resp: Response;
    try {
      resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        signal: controller.signal,
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        }),
      });
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("[lecture-kit-generate] fetch aborted/failed", err);
      return new Response(JSON.stringify({ error: "A geração demorou demais para responder. Tente novamente." }), {
        status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    clearTimeout(timeoutId);

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("[lecture-kit-generate] gateway error", resp.status, txt);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos da IA esgotados. Adicione créditos em Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Falha no gateway de IA." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const raw: string = data?.choices?.[0]?.message?.content || "";
    let result: unknown = null;
    try {
      result = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try { result = JSON.parse(match[0]); } catch { /* ignore */ }
      }
    }
    if (!result) {
      return new Response(JSON.stringify({ error: "IA retornou JSON inválido. Tente novamente." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ result }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[lecture-kit-generate] error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
