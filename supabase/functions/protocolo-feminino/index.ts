import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { guard } from "../_shared/auth.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PERPLEXITY_KEY = Deno.env.get("PERPLEXITY_API_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── Perplexity query por contexto ──
function getPerplexityQuery(usuario: any): string {
  if (usuario.triada_suspeita) {
    return `Tríade da atleta feminina RED-S 2024 2025: disponibilidade energética cálculo thresholds, recuperação ciclo menstrual intervenção nutricional, densidade óssea reversibilidade, protocolo mínimo calorias recuperação hormonal atletas. Fontes: BJSM, IOC Consensus, PubMed. Português. Máx 500 palavras.`;
  }
  if (usuario.menopausa && usuario.menopausa !== "nao") {
    return `Nutrição menopausa perimenopausa atlética 2024 2025: proteína ótima dose frequência sarcopenia, creatina pós-menopausa composição corporal cognição, HIIT vs musculação composição corporal, fitoestrógenos soja linhaça evidência, D3 K2 cálcio saúde óssea atletas. Fontes: Menopause Journal, JCEM, PubMed, BJSM. Português. Máx 500 palavras.`;
  }
  if (usuario.anticoncepcional && usuario.anticoncepcional !== "nao") {
    return `Anticoncepcional hormonal performance atleta 2024 2025: impacto ACO combinado performance ganho massa, depleção nutricional B6 magnésio zinco magnitude reposição, diferenças pílula combinada mini-pílula DIU hormonal impacto esportivo, creatina com ACO interação, estratégias nutricionais minimizar impacto negativo composição corporal. Fontes: BJSM, PubMed, Clinical Endocrinology. Português. Máx 500 palavras.`;
  }
  if (usuario.tpm_severa) {
    return `TPM PMDD intervenção nutricional ergogênica atletas 2024 2025: magnésio dose forma quelada timing ciclo, vitamina B6 P5P piridoxina dose combinação Mg, cálcio papel TPM mecanismo dose, ômega-3 ratio EPA DHA sintomas TPM, intervenções nutricionais emergentes 2024 2025 atletas. Fontes: PubMed, Gynecological Endocrinology, JISSN. Português. Máx 500 palavras.`;
  }
  return `Periodização nutricional treino ciclo menstrual atletas 2024 2025: variação força VO2max composição corporal folicular vs lútea, macro periodização ciclo evidência atual, timing treinos fase ciclo hipertrofia, creatina mulheres estudos fase ciclo, lesões lassidão ligamentar ovulação protocolo prevenção. Fontes: BJSM, PubMed, JISSN, Hormones and Behavior. Português. Máx 500 palavras.`;
}

// ── Cache key ──
function getCacheKey(usuario: any): string {
  const contexto = usuario.triada_suspeita
    ? "triada"
    : usuario.menopausa !== "nao"
    ? "menopausa"
    : usuario.anticoncepcional !== "nao"
    ? "aco"
    : usuario.tpm_severa
    ? "tpm"
    : `ciclo_${usuario.fase_ciclo}`;
  return `fem_${contexto}_${usuario.esporte || "geral"}_${usuario.fase || "manutencao"}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");
}

// ── TTL por contexto (dias) ──
function getTTL(usuario: any): number {
  if (usuario.triada_suspeita) return 1;
  if (usuario.menopausa !== "nao") return 14;
  if (usuario.anticoncepcional !== "nao") return 14;
  return 3;
}

// ── System prompts por fase ──
const PHASE_PROTOCOLS: Record<string, string> = {
  menstruacao: `=== FASE 1: MENSTRUAÇÃO (Dias 1-5) ===
CONTEXTO HORMONAL: Estrogênio e progesterona em mínima. Inflamação, cólicas, fadiga.
NUTRIÇÃO: TDEE ou leve superávit (+100-200kcal). Proteína 1.8-2.0g/kg. Carbo moderado-alto. Gorduras anti-inflamatórias.
ALIMENTOS FOCO: Ferro (carne vermelha, lentilha + vit C), Anti-inflamatório (salmão, sardinha, chia), Magnésio (chocolate >70%, banana), Vitamina C.
REDUZIR: Sódio alto, laticínios em excesso, álcool, cafeína em excesso.
TREINO: Performance reduzida (força -5-8%). Treino leve a moderado. Validar redução de intensidade.
ERGOGÊNICOS: Magnésio bisglicinato 300-400mg, Ômega-3 2-4g/dia, Vitamina B1 100mg/dia, Vitamina E 400UI, Cafeína dose reduzida, Creatina manter base. EVITAR beta-alanina dose alta.
FERRO: Somente se ferritina <20ng/ml — 40-60mg + vit C. NUNCA sem exame.`,

  folicular: `=== FASE 2: FOLICULAR (Dias 6-13) ===
CONTEXTO HORMONAL: Estrogênio em ascensão. Testosterona subindo. MELHOR fase metabólica: máxima sensibilidade insulínica, maior síntese proteica.
NUTRIÇÃO: TDEE ou déficit moderado (-200-300kcal para cutting). Proteína 1.8-2.2g/kg. Carbo AUMENTAR. Gordura 20-25%.
ESTRATÉGIA: Melhor fase para déficit agressivo, treinos pesados e PRs. Menor craving natural.
TREINO: MELHOR FASE para PRs. Estrogênio alto = síntese proteica + recuperação. ATENÇÃO: lassidão ligamentar — aquecimento completo obrigatório.
ERGOGÊNICOS: Cafeína 3-6mg/kg (máxima eficácia), Creatina alta resposta, Beta-alanina 3.2g/dia, Citrulina 6-8g (pump aumentado), Whey peritraining.`,

  ovulacao: `=== FASE 3: OVULAÇÃO (Dias 13-16) ===
CONTEXTO HORMONAL: Pico estrogênio + LH + testosterona. Pico de força, libido, energia. Janela curta (2-3 dias) excepcional.
NUTRIÇÃO: Manutenção ou leve superávit (+100-150kcal). Proteína 2.0-2.2g/kg. Carbo moderado-alto. Hidratação aumentar.
TREINO: JANELA DE PRs. Testosterona no pico. ATENÇÃO CRÍTICA: risco LCA 2-8x maior (BJSM). Aquecimento longo obrigatório. PRs de upper body preferencial.
ERGOGÊNICOS: Cafeína pico (5-6mg/kg), Citrulina + arginina máximo pump, Creatina manter, Colágeno + Vit C 10-15g + 50mg FUNDAMENTAL (proteção articular BJSM 2023), Vit D3 manter.`,

  lutea: `=== FASE 4: LÚTEA (Dias 17-28) ===
CONTEXTO HORMONAL: Progesterona domina. Temperatura +0.3-0.5°C → TDEE +100-300kcal. Resistência insulínica leve. Cravings fisiológicos. Retenção hídrica normal (1-3kg).
NUTRIÇÃO: TDEE +100-200kcal (aceitar sinal hormonal). Para cutting: déficit MENOR. Proteína 1.8-2.0g/kg. Carbo COMPLEXO (aveia, batata doce). Triptofano (ovo, peru, abacate).
ANTI-CRAVING: Tâmara + pasta amendoim + cacau. Snack proteico + eletrólitos. Lanche preventivo 14h30. Não ignorar craving — redirecionar.
RETENÇÃO: Fisiológica. NUNCA interpretar como gordura. Reduzir sódio processado, NÃO cortar água. Mg + B6 auxiliam.
TREINO: Força -5-10%. Reduzir carga 10-15% mantendo volume. NUNCA dizer que está "fraca" — é fisiologia.
ERGOGÊNICOS: Magnésio PRIORIDADE 300-400mg noite, B6 P5P 50-100mg, Cálcio 500-600mg, Ômega-3 2-4g, Cafeína REDUZIR (max 2-3mg/kg, evitar após 14h), Creatina manter, Ashwagandha 300-600mg, Beta-alanina dose reduzida.`,
};

const ACO_PROTOCOL = `=== CONTEXTO: ANTICONCEPCIONAL HORMONAL ===
ACO suprime variação natural do ciclo. Periodização por fase é atenuada mas relevante.
DEPLEÇÕES NUTRICIONAIS DO ACO: B6 suplementar 25-50mg/dia, B12 monitorar, Folato 400mcg/dia, Magnésio 300-400mg/dia, Zinco 15-25mg/dia, Vitamina C 500mg/dia, CoQ10 100-200mg/dia, Selênio 55-100mcg/dia.
SEMPRE RECOMENDAR: Multivitamínico + Mg bisglicinato + B6 P5P + Zinco separado de cálcio.
IMPACTO PERFORMANCE: Atenua pico força ovulação. Pode reduzir VO2max. Massa muscular: evidências mistas (efeito anti-androgênico). Comunicar: não é preguiça, pode ser efeito do ACO.
PROTOCOLO: Manter periodização com variações menores. Semana placebo simular menstruação. Focar reposição nutrientes + CoQ10.`;

const MENOPAUSE_PROTOCOL = `=== CONTEXTO: MENOPAUSA/PERIMENOPAUSA ===
MUDANÇAS: Sarcopenia acelerada 3-8%/década. Redistribuição gordura visceral. Osteopenia/osteoporose. Resistência insulínica. Recuperação mais lenta. Sono fragmentado.
NUTRIÇÃO: Proteína AUMENTAR 2.0-2.4g/kg. Leucina 2.5-3g/refeição. 4-5 refeições ≥25-30g prot cada. Cálcio 1200mg/dia. D3 2000-4000UI + K2. Carbo IG baixo. Fitoestrógenos linhaça 2col/dia, soja fermentada. Colágeno 10-15g + vit C.
TREINO: Musculação ESSENCIAL min 2-3x/sem carga progressiva. Exercícios impacto (estimulam remodelação óssea). HIIT 2x/sem.
ERGOGÊNICOS: Creatina PRIORIDADE 3-5g/dia (+1.4kg massa magra meta-análise 2021), Whey 25-30g/refeição, Leucina 2g/dose, Cálcio 500-600mg dividido, D3 2000-4000UI + K2 100mcg, Mg 300-400mg, Ômega-3 2-4g, CoQ10 100-200mg, Ashwagandha 300-600mg, Colágeno 10-15g + vit C. DHEA somente com prescrição médica.`;

const TRIAD_ALERT = `=== ALERTA: TRÍADE DA ATLETA FEMININA ===
SINAIS: Ciclo ausente >2 meses + restrição calórica severa + fadiga crônica + lesões estresse recorrentes + queda performance + preocupação excessiva peso.
RESPOSTA IMEDIATA: NUNCA continuar protocolo restritivo. Responder:
"A ausência do ciclo em atletas é um sinal de alerta importante. Pode indicar déficit energético maior que o ideal para saúde hormonal e óssea. Recomendo avaliação com ginecologista e médico do esporte antes de continuarmos. Sua saúde vem antes de qualquer meta estética ou esportiva."
NUNCA encaminhar ao upsell neste contexto. Foco total em segurança.`;

const ERGOGENICS_PROTOCOL = `=== ERGOGÊNICOS FEMININOS COMPLETO ===
CREATINA: 3-5g/dia sem loading. Folicular/Ovulação alta eficácia. Lútea atenua queda performance. Menopausa PRIORIDADE. Mito retenção: é intracelular = positivo.
CAFEÍNA: 2-5mg/kg. Folicular maior sensibilidade. Lútea metabolização lenta, menor dose. Doses altas+TPM = ansiedade.
BETA-ALANINA: 3.2-4.8g/dia. Folicular/Ovulação boa tolerância. Lútea/Menstruação parestesia intensa, dividir doses.
CITRULINA: 6-8g pré-treino. Folicular/Ovulação melhor pump. Lútea resposta reduzida.
ÔMEGA-3: 2-4g/dia EPA>DHA. Menstruação reduz cólicas (evidência A). Lútea anti-inflamatório. Menopausa cardiovascular.
MAGNÉSIO BISGLICINATO: 300-400mg noite. TPM -40% sintomas. Sono, insulina, contração.
COLÁGENO+VIT C: 10-15g + 50mg pré-treino. CRÍTICO na ovulação (lassidão ligamentar). Menopausa: ósseo+articular.
D3+K2: 2000-4000UI D3 + 100mcg K2 MK-7 com gordura. Força, humor, TPM, menopausa trio D3/K2/Ca.
ASHWAGANDHA: 300-600mg KSM-66. TPM cortisol ansiedade. Menopausa humor libido. Noite ou 2x.
B6 P5P: 25-100mg. ACO depleta. Retenção irritabilidade lútea.
ZINCO: 15-25mg longe de cálcio/ferro. ACO depleta. Suporte hormonal. Imunidade.
NUNCA ORIENTAR: hormônios, DHEA sem médico, inibidores aromatase, peptídeos, moduladores hormonais.`;

function buildSystemPrompt(usuario: any, conhecimento: string): string {
  const faseProt = PHASE_PROTOCOLS[usuario.fase_ciclo] || "";
  const acoProt = usuario.anticoncepcional !== "nao" ? ACO_PROTOCOL : "";
  const menoProt = usuario.menopausa !== "nao" ? MENOPAUSE_PROTOCOL : "";
  const triadaProt = usuario.triada_suspeita ? TRIAD_ALERT : "";

  return `Você é o módulo Protocolo Feminino do nutriON — desenvolvido por um Nutrition Coach certificado e pós-graduado em Bodybuilding Coaching.

PRINCÍPIO CENTRAL: Mulheres não são 'homens menores'. A fisiologia feminina tem ciclos hormonais, demandas metabólicas e respostas a ergogênicos completamente distintas. Este módulo existe para respeitar e OTIMIZAR essa fisiologia.

DADOS DA USUÁRIA:
Nome: ${usuario.nome || "Atleta"}
Peso: ${usuario.peso || "N/I"}kg | Altura: ${usuario.altura || "N/I"}cm
Modalidade: ${usuario.esporte || "N/I"}
Fase objetivo: ${usuario.fase || "manutenção"}
Treinos/semana: ${usuario.dias_treino || "N/I"}x
Ciclo menstrual: ${usuario.ciclo || "regular"}
Fase atual: ${usuario.fase_ciclo || "folicular"}
Duração ciclo: ${usuario.duracao_ciclo || 28} dias
Anticoncepcional: ${usuario.anticoncepcional || "nao"}
Menopausa: ${usuario.menopausa || "nao"}
Perfil PCA: ${usuario.perfil_pca || "AM"}

CONHECIMENTO GLOBAL ATUALIZADO (Perplexity):
${conhecimento}

INSTRUÇÃO: Use o conhecimento Perplexity como BASE CIENTÍFICA. Cite fontes ao usar dados específicos. Combine com protocolos abaixo para resposta personalizada.

REGRAS ABSOLUTAS:
1. LINGUAGEM: NUNCA minimize sintomas. NUNCA culpabilize craving/retenção/variação. SEMPRE empodere com conhecimento.
2. CICLO É DADO CLÍNICO: Fase afeta metabolismo, força, recuperação, composição. SEMPRE considere fase atual.
3. ACO MUDA TUDO: Atenua variações naturais. Depleta B6, Mg, Zn, CoQ10. Adapte protocolo ao tipo.
4. TRÍADE — SEGURANÇA PRIMEIRO: Ciclo ausente >3 meses + restrição + queda performance → NUNCA protocolo restritivo.
5. TOM PCA: AM→dados/métricas, EI→1 ajuste de cada vez, SE→acolher sem culpa, PP→variar é fisiológico não falha.
6. ERGOGÊNICOS: Dose e timing variam por fase/hormônio. NUNCA substâncias controladas ou hormônios.

${faseProt}

${acoProt}

${menoProt}

${triadaProt}

${ERGOGENICS_PROTOCOL}

ESTRUTURA DA RESPOSTA:
1. Fase atual + contexto hormonal
2. Protocolo nutricional da fase
3. Ergogênicos da fase
4. Treino alinhado
5. Insight Perplexity com fonte
6. Próxima fase: o que vem

Responda em português brasileiro. Seja prática, empática e específica.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { usuario, mensagem, messages } = await req.json();
    const g = await guard(req, corsHeaders, usuario?.user_id);
    if ("response" in g) return g.response;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SK);

    // ── 1. Cache ──
    const cacheKey = getCacheKey(usuario);
    const ttlDias = getTTL(usuario);
    const agora = new Date();

    const { data: cached } = await supabase
      .from("feminino_perplexity_cache")
      .select("conhecimento, fontes, expira_em")
      .eq("user_id", usuario.user_id)
      .eq("cache_key", cacheKey)
      .gte("expira_em", agora.toISOString())
      .single();

    let conhecimento: string;
    let fontes: string[] = [];

    if (cached) {
      conhecimento = cached.conhecimento;
      fontes = (cached.fontes as string[]) || [];
    } else {
      if (!PERPLEXITY_KEY) {
        conhecimento = "Conhecimento científico indisponível no momento. Use o protocolo base.";
      } else {
        try {
          const query = getPerplexityQuery(usuario);
          const pRes = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${PERPLEXITY_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "sonar-pro",
              messages: [{ role: "user", content: query }],
              max_tokens: 1800,
              search_recency_filter: "year",
            }),
          });
          const pData = await pRes.json();
          conhecimento = pData.choices?.[0]?.message?.content || "Sem dados disponíveis.";
          fontes = pData.citations ?? [];

          const expira = new Date(agora.getTime() + ttlDias * 24 * 60 * 60 * 1000);
          await supabase.from("feminino_perplexity_cache").upsert(
            {
              user_id: usuario.user_id,
              cache_key: cacheKey,
              conhecimento,
              fontes,
              gerado_em: agora.toISOString(),
              expira_em: expira.toISOString(),
            },
            { onConflict: "user_id,cache_key" }
          );
        } catch (e) {
          console.error("Perplexity error:", e);
          conhecimento = "Pesquisa científica temporariamente indisponível.";
        }
      }
    }

    // ── 2. Call Lovable AI Gateway (streaming) ──
    const systemPrompt = buildSystemPrompt(usuario, conhecimento);
    const chatMessages =
      messages && messages.length > 0 ? messages : [{ role: "user", content: mensagem }];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...chatMessages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Aguarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("protocolo-feminino error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
