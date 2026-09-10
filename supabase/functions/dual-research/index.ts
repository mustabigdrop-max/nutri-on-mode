// Pesquisa Dual (Perplexity Sonar-Pro + Gemini) genérica para TODOS os módulos.
// Mesmo motor usado no BiomechanicsVault, agora aplicado a peptídeos, esteroides,
// microbiota, fitoterápicos, nutrição, treino, exames, metabolismo, corrida,
// APEX, MCE e a qualquer tema escrito à mão pelo coach.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

type Dominio = {
  label: string;
  /** Como o pesquisador busca (inglês + termos técnicos = estudo melhor). */
  query: (tema: string) => string;
  /** O que o especialista precisa extrair da pesquisa. */
  foco: string;
  /** Limites inegociáveis de segurança/legal do domínio. */
  limites: string;
};

const DOMINIOS: Record<string, Dominio> = {
  peptideos: {
    label: "Peptídeos (NEXUS-BIO PeptideVault)",
    query: (t) =>
      `${t} peptide pharmacokinetics half-life receptor mechanism clinical trial dose studied adverse events regulatory status 2023 2024 2025 PubMed`,
    foco:
      "mecanismo de ação no receptor, farmacocinética (meia-vida, tempo até pico, via de administração estudada), farmacodinâmica, dose ESTUDADA em ensaio (nunca sugestão de uso), diferenças de resposta entre homens e mulheres quando o estudo trouxer, efeitos adversos relatados, status regulatório (ANVISA/FDA/EMA), pureza e qualidade do insumo, o que ainda NÃO se sabe.",
    limites:
      "PROIBIDO: prescrever dose, protocolo, ciclo, empilhamento, horário de aplicação ou onde comprar. Só descreva o que os ensaios usaram, sempre com a frase de que é dado de estudo, não recomendação. Conteúdo 18+ e educacional.",
  },
  esteroides: {
    query: (t) =>
      `${t} anabolic androgenic steroid pharmacology androgen receptor binding half-life hepatotoxicity lipid hematocrit HPTA suppression harm reduction study`,
    label: "Esteroides (NEXUS-BIO SteroidVault — redução de danos)",
    foco:
      "farmacologia (ligação ao receptor androgênico, aromatização, 5-alfa redução), meia-vida e curva plasmática relatada, marcadores de risco monitorados em estudo (hematócrito, lipídios, enzimas hepáticas, eixo HPT), diferenças entre homens e mulheres com dados reais, danos documentados, o que a literatura de redução de danos recomenda monitorar.",
    limites:
      "PROIBIDO ABSOLUTO: dose, ciclo, empilhamento, TPC, horário de aplicação, marca, fonte de compra ou qualquer instrução de uso. O enquadramento é SEMPRE educacional e de redução de danos, 18+, com disclaimer médico. Nunca incentive uso.",
  },
  microbiota: {
    label: "Microbiota (GutON / MicrobiotaVault)",
    query: (t) =>
      `${t} gut microbiome randomized controlled trial strain CFU probiotic prebiotic butyrate intestinal permeability human study 2023 2024 2025`,
    foco:
      "cepa específica e dose estudada (CFU), mecanismo (ácidos graxos de cadeia curta, barreira intestinal, eixo intestino-cérebro), tempo de intervenção, desfecho medido, alimentos e fibras com evidência, sequência lógica de repovoamento (remover, repor, reinocular, reparar) sustentada pelos estudos.",
    limites:
      "Nunca prometa cura, diagnóstico ou tratamento de doença. Só cite cepa, dose e tempo que apareçam na pesquisa.",
  },
  fitoterapicos: {
    label: "Fitoterápicos",
    query: (t) =>
      `${t} herbal extract standardized dose bioavailability clinical trial mechanism drug interaction safety human study systematic review`,
    foco:
      "extrato e padronização usados no estudo, dose e duração testadas, biodisponibilidade e cofatores de absorção, mecanismo, interações medicamentosas conhecidas, contraindicações, força da evidência (ensaio humano vs. animal vs. in vitro).",
    limites:
      "Deixe explícito quando a evidência for só animal ou in vitro. Nunca prescreva dose nem substitua tratamento médico.",
  },
  nutricao: {
    label: "Nutrição (NutriPlan)",
    query: (t) =>
      `${t} nutrition randomized controlled trial protein intake energy balance body composition meta-analysis 2023 2024 2025`,
    foco:
      "quantidades estudadas, efeito sobre composição corporal, saciedade e performance, timing quando houver evidência, aplicação prática no dia a dia de quem treina.",
    limites: "Nada de dieta milagrosa, detox ou promessa de resultado em prazo fixo.",
  },
  treino: {
    label: "Treino (TrainingON)",
    query: (t) =>
      `${t} resistance training volume frequency intensity hypertrophy strength meta-analysis periodization 2023 2024 2025`,
    foco:
      "volume, frequência, proximidade da falha, periodização, magnitude do efeito relatada, aplicação prática por nível de treinamento.",
    limites: "Nunca invente percentual, série ou carga que não esteja na pesquisa.",
  },
  exames: {
    label: "Exames laboratoriais (Lab / APEX Clinical)",
    query: (t) =>
      `${t} biomarker reference range clinical interpretation athlete laboratory study evidence 2023 2024 2025`,
    foco:
      "o que o marcador mede, faixas de referência citadas na literatura, fatores que alteram o resultado, o que costuma ser mal interpretado, quando encaminhar para médico.",
    limites: "Nunca diagnostique nem prescreva conduta clínica. Interpretação é sempre educacional.",
  },
  metabolico: {
    label: "MetabolicON",
    query: (t) =>
      `${t} resting metabolic rate energy expenditure adaptive thermogenesis lean body mass clinical study 2023 2024 2025`,
    foco:
      "gasto energético, adaptação metabólica, papel da massa magra, dados de calorimetria, aplicação em déficit e superávit.",
    limites: "Nada de fórmula mágica de metabolismo acelerado.",
  },
  corrida: {
    label: "RunON",
    query: (t) =>
      `${t} endurance running VO2max lactate threshold periodization fueling carbohydrate intake study 2023 2024 2025`,
    foco:
      "limiar, economia de corrida, estratégia de carboidrato por hora, recuperação, dados de estudo com corredores.",
    limites: "Sem prescrição de treino individual.",
  },
  apex: {
    label: "APEX Visual (avaliação antes do treino)",
    query: (t) =>
      `${t} movement screening posture assessment kinetic chain injury risk evidence validity study`,
    foco:
      "o que a avaliação de movimento prevê e o que NÃO prevê, cadeias cinéticas, compensações comuns, por que avaliar antes de prescrever exercício.",
    limites: "Nunca afirme que a avaliação diagnostica lesão.",
  },
  science_hub: {
    label: "Science Hub",
    query: (t) => `${t} systematic review meta-analysis strength of evidence 2024 2025 practical application`,
    foco: "estado da arte, consenso e divergência entre estudos, o que mudou nos últimos 2 anos.",
    limites: "Diferencie consenso de hipótese.",
  },
  mce: {
    label: "Método MCE (Mentalidade, Comportamento, Execução)",
    query: (t) =>
      `${t} behavior change habit formation self-determination theory implementation intentions adherence randomized trial`,
    foco:
      "teoria da autodeterminação, intenções de implementação, desenho de ambiente, aderência de longo prazo, autores clássicos da área (base já usada no Método MCE), sempre traduzido para MENTALIDADE, COMPORTAMENTO e EXECUÇÃO.",
    limites:
      "Use os autores e a base científica que sustentam o Método MCE. Nunca use a palavra Mindset — o M é MENTALIDADE.",
  },
  livre: {
    label: "Tema livre",
    query: (t) => `${t} evidence based study mechanism clinical data 2024 2025 practical application`,
    foco: "mecanismo, números reais, aplicação prática e o que ainda é incerto.",
    limites: "Só afirme o que a pesquisa sustentar.",
  },
};

const SCHEMA = `{
 "titulo":"título curto do briefing",
 "resumo":"3 a 4 frases do que a pesquisa mostra, direto",
 "dados":[{"valor":"número/percentual/tempo real","significado":"o que esse número quer dizer na prática"}],
 "mecanismo":["explicação do mecanismo em linguagem acessível, 2 a 4 itens"],
 "farmaco":{"meia_vida":"","pico":"","via_estudada":"","dose_estudada":"","observacao_homens":"","observacao_mulheres":""},
 "perguntas_publico":["as 5 a 7 dúvidas que as pessoas mais pesquisam sobre isso"],
 "mitos":[{"mito":"","veredito":"","porque":""}],
 "riscos":["riscos e efeitos adversos documentados"],
 "regulatorio":"status regulatório quando aplicável, senão vazio",
 "ganchos":["6 hooks de post que param o scroll, baseados nos dados acima"],
 "teaser":"o que fica de fora do post e só existe na consultoria/enciclopédia — sem entregar o material completo",
 "incerto":["o que a ciência ainda não respondeu"],
 "fontes":["referências reais retornadas pela pesquisa"]
}`;

async function fetchTimeout(url: string, options: RequestInit, ms = 30000) {
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: c.signal });
  } finally {
    clearTimeout(id);
  }
}

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
    const tema = String(body?.tema || "").trim();
    const dominioKey = String(body?.dominio || "livre");
    const anguloLivre = String(body?.angulo || "").trim();
    if (!tema) {
      return new Response(JSON.stringify({ error: "Escreva o tema da pesquisa." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dom = DOMINIOS[dominioKey] || DOMINIOS.livre;
    const PPX = Deno.env.get("PERPLEXITY_API_KEY");
    const LOVABLE = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE) throw new Error("LOVABLE_API_KEY não configurada");

    // 1) Pesquisa real (Perplexity Sonar-Pro) — mesma engine da BiomechanicsVault.
    let raw = "";
    let citations: string[] = [];
    if (PPX) {
      try {
        const r = await fetchTimeout("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${PPX}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              {
                role: "system",
                content:
                  "Pesquisador científico. Busque ensaios clínicos, revisões e meta-análises recentes. Traga números concretos (doses estudadas, meia-vida, percentuais, n amostral), autor, ano e achado principal. Se a evidência for animal ou in vitro, diga isso.",
              },
              { role: "user", content: dom.query(tema) + (anguloLivre ? ` | ângulo: ${anguloLivre}` : "") },
            ],
            search_recency_filter: "year",
          }),
        });
        const d = await r.json();
        raw = d?.choices?.[0]?.message?.content || "";
        citations = Array.isArray(d?.citations) ? d.citations : [];
      } catch (e) {
        console.error("Perplexity indisponível:", e);
      }
    }

    // 2) Especialista organiza a pesquisa em briefing de conteúdo.
    const system = `Você é o pesquisador-chefe do NEXUS-BIO. Domínio: ${dom.label}.
EXTRAIA: ${dom.foco}
LIMITES: ${dom.limites}
REGRAS GERAIS:
- Só afirme número, dose, meia-vida, percentual, estudo ou status regulatório que esteja na pesquisa recebida. Sem dado, deixe o campo vazio — nunca invente.
- Escreva em português do Brasil, frases curtas, sem markdown, sem asteriscos.
- Nunca use as palavras "IA", "AI" ou "inteligência artificial".
- "teaser" é o que desperta curiosidade sem entregar o material completo: o post mostra a ponta, o aprofundamento fica na consultoria e na enciclopédia do nutriON.
- Responda SOMENTE JSON válido no schema pedido.`;

    const res = await fetchTimeout(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: `Tema: ${tema}${anguloLivre ? `\nÂngulo pedido pelo coach: ${anguloLivre}` : ""}\n\nPesquisa encontrada:\n${raw || "Pesquisa externa indisponível — use apenas conhecimento consolidado e deixe vazios os campos numéricos que não puder sustentar."}\n\nFontes: ${JSON.stringify(citations).slice(0, 2000)}\n\nSchema:\n${SCHEMA}`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      },
      45000,
    );

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de uso atingido. Tente em instantes." }), {
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
    const txt = json?.choices?.[0]?.message?.content ?? "{}";
    let brief: Record<string, unknown>;
    try {
      brief = JSON.parse(txt);
    } catch {
      brief = JSON.parse(String(txt).replace(/```json|```/g, "").trim());
    }
    if (!Array.isArray((brief as { fontes?: unknown }).fontes) || !(brief as { fontes: unknown[] }).fontes.length) {
      (brief as Record<string, unknown>).fontes = citations;
    }

    return new Response(
      JSON.stringify({ brief, dominio: dominioKey, dominioLabel: dom.label, tema, citations, pesquisaBruta: raw }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("dual-research error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message || "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
