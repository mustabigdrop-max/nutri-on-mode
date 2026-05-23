// APEX NPC Judge — análise estética via Lovable AI (Gemini 2.5 Pro vision)
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface Body {
  imageBase64: string; // data URL ou base64 puro
  categoria: string;   // NPCCategory
  categoriaNome: string;
  categoriaDescricao: string;
  vista: "FRENTE" | "COSTAS" | "LATERAL";
  proporcoes: { grupo: string; peso_visual: number; descricao_ideal: string }[];
  ratios: { nome: string; ideal: string }[];
  penalizacoes: { condicao: string; impacto: string }[];
  achados: { titulo: string; graus: number }[];
  atleta: { nome?: string | null; bf?: string | null; sexo?: string | null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    if (!body.imageBase64) throw new Error("imageBase64 required");

    const imageUrl = body.imageBase64.startsWith("data:")
      ? body.imageBase64
      : `data:image/jpeg;base64,${body.imageBase64}`;

    const sys = `Você é um juiz NPC/IFBB certificado com 20 anos de experiência julgando competições profissionais.
Sua avaliação é técnica, objetiva e direta — como num briefing pós-palco.
Nenhum atleta é perfeito: nenhum score deve passar de 95.
Sempre cite os critérios NPC oficiais da categoria avaliada.
Retorne APENAS JSON válido — sem markdown, sem texto adicional.`;

    const prompt = `CATEGORIA: ${body.categoriaNome}
VISTA: ${body.vista}
ATLETA: ${body.atleta?.nome ?? "—"} · BF estimado: ${body.atleta?.bf ?? "--"}%

DESCRIÇÃO DA CATEGORIA:
${body.categoriaDescricao}

ACHADOS POSTURAIS APEX (já detectados):
${(body.achados || []).map((a) => `• ${a.titulo}: ${a.graus}°`).join("\n") || "— nenhum"}

CRITÉRIOS NPC POR GRUPO (peso/10):
${body.proporcoes.map((p) => `• ${p.grupo} (peso ${p.peso_visual}/10): ${p.descricao_ideal}`).join("\n")}

PROPORÇÕES IDEAIS:
${body.ratios.map((r) => `• ${r.nome}: ${r.ideal}`).join("\n")}

PENALIZAÇÕES NPC:
${body.penalizacoes.map((p) => `• [${p.impacto}] ${p.condicao}`).join("\n")}

Analise a foto com olhar de juiz NPC. Retorne EXATAMENTE este JSON:
{
  "score_geral": number (0-95),
  "score_simetria": number (0-95),
  "score_proporcao": number (0-95),
  "score_condicionamento": number (0-95),
  "grupos": [
    {
      "nome": string,
      "score": number (0-10),
      "lado_dominante": "E"|"D"|"SIMETRICO",
      "assimetria_pct": number,
      "descricao": string,
      "pontos_fortes": [string],
      "pontos_fracos": [string],
      "comparacao_npc": string
    }
  ],
  "proporcoes": [
    { "nome": string, "valor": number, "ideal": string, "status": "EXCELENTE"|"BOM"|"REGULAR"|"FRACO", "diferenca": string }
  ],
  "penalizacoes": [
    { "descricao": string, "impacto": string, "urgencia": "IMEDIATA"|"PROXIMA_PREP"|"LONGO_PRAZO" }
  ],
  "categoria_atual": "${body.categoria}",
  "categoria_ideal": string,
  "motivo_categoria": string,
  "mensagem_juiz": string,
  "top_3_prioridades": [string, string, string]
}`;

    const resp = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: sys },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageUrl } },
              { type: "text", text: prompt },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione créditos em Settings → Workspace → Usage." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "Falha na análise IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSON não encontrado na resposta");
    const parsed = JSON.parse(match[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("apex-npc-judge error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
