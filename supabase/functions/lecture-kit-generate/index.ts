// Kit de Palestra — monta um roteiro estruturado (slide a slide, com fala do
// palestrante, tempo estimado e tipo de slide) pra uma apresentação ao vivo,
// cruzando os domínios que o coach escolher.
//
// Importante sobre evidência científica: este motor NUNCA inventa estudo,
// autor, ano ou estatística. Os achados científicos vêm de fora (a função
// pubmed-live, que faz busca real na web) e chegam aqui já prontos, em
// `body.scienceContext` — o motor só organiza e explica esse material real em
// formato de slide.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";
import { MCE_DOCTRINE } from "../_shared/mceDoctrine.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `
Você monta roteiros de palestra pra profissionais de nutrição esportiva,
treino e fisiculturismo apresentarem pessoalmente (slides + fala ao vivo).

REGRAS OBRIGATÓRIAS:
1. Use SOMENTE os achados científicos fornecidos no contexto pra qualquer
   afirmação que soe como dado de pesquisa. NUNCA invente nome de estudo,
   autor, ano, revista ou estatística fora do contexto. Sem contexto, fale em
   termos de consenso estabelecido, sem fingir citação específica.
2. Cada slide é enxuto: máximo 4 bullets curtos (o que vai NA TELA), mais uma
   "fala_do_palestrante" separada e mais longa (roteiro real da fala, tom
   conversacional, primeira pessoa).
3. Tipos de slide permitidos: ABERTURA, GANCHO, PROBLEMA, CONTEUDO, DADO,
   HISTORIA, INTERACAO, PROVA, CTA, FECHAMENTO.
4. Estrutura obrigatória:
   - slide 1 = GANCHO (pergunta provocativa ou dado impactante). NUNCA comece
     com apresentação pessoal.
   - slide 2 = ABERTURA: apresentação do palestrante em no máximo 20 segundos
     de fala (2 a 3 frases, credencial concreta, nada de "é uma honra")
   - pelo menos 1 slide INTERACAO a cada 15 minutos de palestra
   - pelo menos 2 slides DADO (número grande + contexto no primeiro bullet)
   - pelo menos 1 slide HISTORIA (narrativa; se não houver história real do
     palestrante no contexto, escreva um roteiro de história genérico marcado
     com [ADAPTE COM SUA HISTÓRIA REAL])
   - penúltimo slide = CTA
   - último slide = FECHAMENTO com frase de impacto
5. Some os "tempo_min" de todos os slides aproximadamente igual à duração alvo.
6. Nunca se apresente como sistema automático. Nada de clichê motivacional vazio.
6.1 TOM DA FALA: direto, de quem vive aquilo. Frases curtas. Experiência real.
    PROIBIDO: "É uma honra estar aqui", "Vamos discutir", "Como futuros colegas",
    "Você sabia que", "Fique até o final". USE: "Eu vivo isso todo dia",
    "Na minha última preparação...", "Meus clientes passam por isso".
6.2 A cada 15 minutos de palestra insira 1 slide INTERACAO (pergunta pra plateia,
    enquete de mão levantada ou exercício rápido). Palestra de 60+ min = mínimo 3.
6.3 Inclua pelo menos 2 slides HISTORIA: 1 história pessoal do palestrante e 1 de
    cliente/caso real, ambas marcadas com [ADAPTE COM SUA HISTÓRIA REAL].
6.4 NUNCA repita a mesma estrutura de fala em dois slides seguidos. Alterne entre:
    afirmação direta, pergunta retórica, história, dado estatístico e demonstração.
7. No método MCE os pilares se chamam MENTALIDADE, COMPORTAMENTO e EXECUÇÃO
   (nunca "Mindset"). Quando o MCE estiver ativo, plante sementes do método a
   partir do slide 3 — não deixe pra segunda metade. Ex.: "isso é o E do MCE,
   Execução. Mas fica comigo que vêm as outras duas camadas." Distribua ao longo
   do roteiro os seis autores base: Dweck (Stanford), Kahneman (Princeton),
   Bandura (Stanford), Frankl (Viena), Rotter (Connecticut) e Merzenich (UCSF).
8. Responda SEMPRE apenas JSON válido no schema pedido, sem markdown.
`.trim();

interface LectureBody {
  topic?: string;
  domains?: string[];
  durationMinutes?: number;
  scienceContext?: string;
  handle?: string;
  niches?: string[];
  differentials?: string[];
  audience?: string;
  level?: string;
  tone?: string;
  includeMce?: boolean;
  includeDemos?: boolean;
  // Regeneração de um slide isolado
  mode?: "full" | "slide";
  slide?: Record<string, unknown>;
  outline?: string;
}

function coachIdentity(body: LectureBody): string {
  const handle = (body.handle || "").replace("@", "").trim();
  const nome = String((body as { ig_profile?: { name?: string } }).ig_profile?.name || "").trim();
  const niches = Array.isArray(body.niches) ? body.niches.filter(Boolean) : [];
  const differentials = Array.isArray(body.differentials) ? body.differentials.filter(Boolean) : [];
  if (!handle && !nome && !niches.length && !differentials.length) {
    return "PALESTRANTE: perfil ainda não preenchido — escreva de forma profissional e genérica, sem inventar nome, credencial ou história pessoal.";
  }
  return [
    nome ? `NOME REAL DO PALESTRANTE (use na abertura): ${nome}` : "",
    handle ? `PALESTRANTE: @${handle}` : "",
    niches.length ? `Nicho: ${niches.join(", ")}` : "",
    differentials.length ? `Diferenciais (use pra personalizar o tom, sem inventar além disso): ${differentials.join(", ")}` : "",
  ].filter(Boolean).join("\n");
}

const SLIDE_SCHEMA = `{
  "numero": 1,
  "tipo": "ABERTURA | GANCHO | PROBLEMA | CONTEUDO | DADO | HISTORIA | INTERACAO | PROVA | CTA | FECHAMENTO",
  "bloco": "domínio tratado (TREINO, NUTRICAO, FARMACOLOGIA, COMPORTAMENTO, MENTALIDADE, MCE, SUPLEMENTACAO, RECUPERACAO, FISIOLOGIA) ou GERAL",
  "titulo_slide": "título curto que aparece na projeção",
  "bullets": ["2 a 4 bullets curtos, o que vai NA TELA"],
  "fala_do_palestrante": "o que dizer em voz alta nesse slide — texto corrido, conversacional",
  "tempo_min": 3,
  "referencia": "Autor, ano, estudo — apenas se vier do contexto científico; senão string vazia",
  "dado_cientifico": "achado real usado nesse slide, ou string vazia"
}`;

const SCHEMA = `{
  "titulo": "título de impacto da palestra",
  "subtitulo": "linha de apoio curta",
  "gancho_abertura": "pergunta provocativa de 1-2 frases pros primeiros 2 minutos",
  "agenda": ["3 a 6 blocos, na ordem"],
  "slides": [${SLIDE_SCHEMA}],
  "citacoes_chave": ["fontes reais citadas, no formato em que vieram do contexto — vazio se não houver contexto"],
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
    const audience = (body.audience || "").trim();
    const level = (body.level || "").trim();
    const tone = (body.tone || "").trim();
    const isSlideMode = body.mode === "slide";

    const sharedContext = [
      `TEMA DA PALESTRA: ${topic}`,
      `DOMÍNIOS A COBRIR (nesta ordem): ${domains.join(", ")}`,
      audience ? `PÚBLICO-ALVO: ${audience}` : "",
      level ? `NÍVEL DO PÚBLICO: ${level} — calibre profundidade e jargão para esse nível.` : "",
      tone ? `TOM DA PALESTRA: ${tone}` : "",
      coachIdentity(body),
      body.includeDemos === false ? "" : "O palestrante fará demonstrações ao vivo da plataforma nutriON durante a palestra (slides de demo são inseridos automaticamente depois) — deixe espaço de respiro no roteiro e cite a plataforma naturalmente na fala, sem inventar telas.",
      body.includeMce ? `INTEGRE O MÉTODO MCE (pilares MENTALIDADE, COMPORTAMENTO, EXECUÇÃO) ao roteiro, citando os autores da doutrina abaixo:\n${MCE_DOCTRINE}` : "",
      scienceContext
        ? `ACHADOS CIENTÍFICOS REAIS (única fonte permitida pra citação):\n${scienceContext}`
        : "Nenhum achado científico foi fornecido — fale em termos de consenso e prática estabelecida, sem citar estudo específico nenhum.",
    ].filter(Boolean).join("\n\n");

    const userPrompt = isSlideMode
      ? [
          sharedContext,
          `ROTEIRO ATUAL (para não repetir conteúdo):\n${(body.outline || "").slice(0, 4000)}`,
          `SLIDE A REESCREVER (mantenha o mesmo "numero" e o mesmo "tipo", troque o conteúdo por uma versão melhor e diferente):\n${JSON.stringify(body.slide || {})}`,
          `Responda apenas com o objeto JSON de UM slide no schema:\n${SLIDE_SCHEMA}`,
        ].join("\n\n")
      : [
          sharedContext,
          `DURAÇÃO ALVO: ${duration} minutos — gere entre ${Math.max(8, Math.round(duration * 0.5))} e ${Math.max(12, Math.round(duration * 0.8))} slides, e a soma dos "tempo_min" deve ficar próxima de ${duration}.`,
          `Gere no schema JSON:\n${SCHEMA}`,
        ].join("\n\n");

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
        return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione créditos em Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Falha ao gerar o kit." }), {
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
      return new Response(JSON.stringify({ error: "Resposta inválida. Tente novamente." }), {
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
