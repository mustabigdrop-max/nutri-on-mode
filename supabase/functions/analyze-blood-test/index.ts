import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_UID = "70e51469-1acf-4df6-afe6-f094d21db122";

function getSystemPrompt(plan: string, role: string, userId: string, profile: any) {
  const isAdmin = userId === ADMIN_UID || role === "admin";
  const isPro = plan === "ON PRO" || plan === "on_pro" || plan === "max";
  const isPlus = plan === "ON +" || plan === "on_plus" || plan === "full";

  const contextoPaciente = `
DADOS DO PACIENTE:
- Peso: ${profile?.weight_kg || "não informado"} kg
- Altura: ${profile?.height_cm || "não informado"} cm
- Objetivo: ${profile?.goal || "não informado"}
- Restrições: ${profile?.dietary_restrictions?.join(", ") || "nenhuma"}
- Condições: ${profile?.health_conditions?.join(", ") || "nenhuma"}
- Protocolo ativo: ${profile?.active_protocol || "padrão"}
- VET atual: ${profile?.vet_kcal || "não calculado"} kcal
- Proteína atual: ${profile?.protein_g || "não calculado"} g`;

  // Base prompt for all paid plans
  const basePrompt = `Você é o Agente de Exames APEX Elite do nutriON.
Especialista clínico-esportivo com foco em atletas de bodybuilding e fisiculturismo.

Referências: Dr. Thomas O'Connor, Dr. Peter Attia, Dr. Michael Scally, ISSN, ACSM.

${contextoPaciente}

PRINCÍPIO FUNDAMENTAL:
Valores de referência laboratoriais são para população GERAL sedentária.
Atletas têm perfis hormonais, metabólicos e cardiovasculares diferentes.

INTERPRETAR EM 3 NÍVEIS:
- NÍVEL 1: Referência laboratorial padrão
- NÍVEL 2: Referência para atleta natural
- NÍVEL 3: Referência para atleta em uso/pós-uso (se aplicável)

SISTEMA DE SEMÁFORO:
🟢 Normal/Ótimo — sem ação necessária
🟡 Atenção — monitorar ou ajuste leve
🔴 Crítico — ação imediata necessária

ALERTAS VERMELHOS AUTOMÁTICOS:
- Hematócrito > 55% → risco de trombose
- E2 < 10 pg/mL → risco cardiovascular
- LDL > 250 + HDL < 25 → risco cardíaco extremo
- PA > 160/100 → crise hipertensiva
- PSA > 4 com elevação rápida → investigação urgente

PAINÉIS DE ANÁLISE:
1. HORMONAL: Testosterona (total/livre), E2, LH, FSH, SHBG, Prolactina, DHEA-S, IGF-1, Cortisol
2. HEPÁTICO: AST/ALT com diferenciação muscular vs hepática (GGT como divisor), Bilirrubinas, FA
3. CARDIOVASCULAR: LDL, HDL, Triglicerídeos, Hematócrito, Hemoglobina, PCR-us, Homocisteína
4. RENAL: Creatinina (ajustar para massa muscular), Ureia, Ácido Úrico, TFG, Microalbuminúria
5. TIREOIDIANO: TSH, T3 livre, T4 livre
6. METABÓLICO: Glicemia, Insulina, HbA1c, HOMA-IR
7. ÓSSEO/GERAL: Vitamina D (alvo 60-80 ng/mL), Cálcio, Ferro, Ferritina, B12, Zinco, Magnésio
8. PROSTÁTICO: PSA (quando disponível)

Para cada marcador alterado, fornecer:
- Interpretação no contexto esportivo
- Protocolo de suplementação natural (Silimarina, TUDCA, NAC, Ômega-3, Bergamota, etc.)
- Ações prioritárias ordenadas por urgência
- Próximos exames recomendados com timeline`;

  // Pharmacological context for Admin and PRO only
  const farmaContext = (isAdmin || isPro) ? `

CONTEXTO FARMACOLÓGICO HABILITADO:
Você analisa exames no contexto de uso de recursos farmacológicos (AAS, GH, Peptídeos, Insulina).
Sua abordagem é SEM JULGAMENTO — o atleta já fez a escolha, seu papel é minimizar riscos.

CICLOS TÍPICOS E PADRÕES:
- Bulk (Test E + Deca): monitorar prolactina, E2, hematócrito
- Cutting (Test P + Tren + Winny): lipídeos CRÍTICOS, HDL pode ir a 15-20
- TRT: monitoramento padrão trimestral
- TPC: acompanhar recuperação de LH/FSH/Testosterona

INTERPRETAÇÕES FARMACOLÓGICAS:
- LH/FSH = 0 durante uso: esperado, monitorar com HCG
- Testosterona > 1000 ng/dL: contexto exógeno, monitorar E2, Ht, PSA
- Prolactina elevada com 19-nors: Cabergolina, NÃO anti-E2
- E2 < 15: provavelmente excesso de AI, mais perigoso que E2 alto
- AST/ALT elevados: diferenciar muscular (GGT normal) vs hepático (GGT alto)
- Hematócrito > 54%: doação de sangue + Nattokinase + hidratação

PROTOCOLOS DE SUPORTE:
- Hepático: Silimarina Siliphos 240mg 3x + TUDCA 500mg 2x + NAC 600mg 2x
- Cardiovascular: Ômega-3 4-6g + Bergamota BPF 500mg 2x + CoQ10 400mg
- Renal: Telmisartan 40mg (nefroprotetor) + TUDCA + hidratação 40ml/kg
- Prostático: Saw Palmetto 320mg + Licopeno 15mg
- Hormonal: HCG 250-500UI 2x/sem durante ciclo

FREQUÊNCIA DE MONITORAMENTO:
- Pré-ciclo: baseline completo obrigatório
- Durante: a cada 4-6 semanas (Ht + lipídeos + fígado)
- TPC: semana 2 (LH/FSH/T), semana 6 (completo), semana 12 (comparar baseline)
- Anual: Ecocardiograma + CAC Score (> 35 anos) + DEXA` : `

NOTA: Interpretação limitada ao contexto de atleta NATURAL.
Para análise em contexto farmacológico, upgrade para ON PRO é necessário.
Foque em otimização hormonal natural, biomarcadores gerais, vitaminas e minerais.`;

  const outputFormat = `

FORMATO DE SAÍDA — RETORNE APENAS JSON VÁLIDO:
{
  "semaforo_geral": "verde" | "amarelo" | "vermelho",
  "resumo_executivo": "3 linhas: o que está bem, o que monitorar, o que precisa ação",
  "markers": [
    {
      "name": "Nome do marcador",
      "value": número,
      "unit": "unidade",
      "reference_range": "faixa referência padrão",
      "reference_athlete": "faixa para atleta",
      "status": "normal" | "low" | "high" | "critical",
      "nivel_semaforo": "verde" | "amarelo" | "vermelho",
      "interpretation": "interpretação clínico-esportiva detalhada",
      "acao": "ação recomendada específica"
    }
  ],
  "summary": "Resumo clínico-esportivo completo",
  "risk_alerts": [
    {
      "nivel": "vermelho" | "amarelo",
      "marcador": "nome",
      "mensagem": "descrição do risco",
      "acao_imediata": "o que fazer agora"
    }
  ],
  "dietary_recommendations": [
    {
      "recommendation": "recomendação nutricional específica",
      "priority": "high" | "medium" | "low",
      "related_markers": ["marcadores relacionados"]
    }
  ],
  "suplementacao_ajustada": [
    {
      "suplemento": "nome",
      "dose": "dosagem",
      "horario": "quando tomar",
      "motivo": "marcador que justifica"
    }
  ],
  "proximos_exames": {
    "prazo": "quando repetir",
    "exames": ["lista de exames prioritários"]
  },
  "suggested_plan_changes": {
    "increase_nutrients": ["nutrientes para aumentar"],
    "decrease_nutrients": ["nutrientes para diminuir"],
    "add_foods": ["alimentos para adicionar"],
    "avoid_foods": ["alimentos para evitar"],
    "protein_adjustment": null ou número,
    "calorie_adjustment": null ou número
  }
}

IMPORTANTE: Retorne SOMENTE o JSON, sem markdown, sem explicações extras.`;

  return basePrompt + farmaContext + outputFormat;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { blood_test_id, pdf_url } = await req.json();
    if (!blood_test_id || !pdf_url) throw new Error("Missing blood_test_id or pdf_url");

    // Download the file from storage
    const pathParts = pdf_url.split("/blood-tests/");
    const filePath = pathParts[pathParts.length - 1];
    
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from("blood-tests")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      throw new Error("Failed to download file");
    }

    // Detect MIME type
    const ext = filePath.split(".").pop()?.toLowerCase() || "";
    const mimeMap: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      heic: "image/heic",
      heif: "image/heif",
    };
    const mimeType = mimeMap[ext] || fileData.type || "application/pdf";

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);

    // Get user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const plan = profile?.plano_atual || "free";
    const role = profile?.role || "user";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = getSystemPrompt(plan, role, user.id, profile);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analise este exame de sangue e forneça a interpretação clínico-esportiva APEX completa com semáforo, alertas e protocolos."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes para análise de IA." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      analysis = { summary: content, markers: [], risk_alerts: [], dietary_recommendations: [], suggested_plan_changes: {} };
    }

    // Update blood test record
    const { error: updateError } = await supabase
      .from("blood_tests")
      .update({
        status: "analyzed",
        ai_analysis: analysis,
        suggested_changes: analysis.suggested_plan_changes || {},
        updated_at: new Date().toISOString(),
      })
      .eq("id", blood_test_id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to save analysis");
    }

    // Save structured exam data to athlete_exams if markers exist
    if (analysis.markers?.length > 0) {
      const markerMap: Record<string, string> = {
        "Testosterona Total": "testosterona_total",
        "Testosterona Livre": "testosterona_livre",
        "Estradiol": "estradiol",
        "LH": "lh",
        "FSH": "fsh",
        "SHBG": "shbg",
        "Prolactina": "prolactina",
        "DHEA-S": "dhea_s",
        "IGF-1": "igf1",
        "Cortisol": "cortisol_matinal",
        "TSH": "tsh",
        "T3 Livre": "t3_livre",
        "T4 Livre": "t4_livre",
        "AST": "ast_tgo", "TGO": "ast_tgo",
        "ALT": "alt_tgp", "TGP": "alt_tgp",
        "GGT": "ggt",
        "Fosfatase Alcalina": "fosfatase_alcalina",
        "Bilirrubina Total": "bilirrubina_total",
        "Colesterol Total": "colesterol_total",
        "LDL": "ldl",
        "HDL": "hdl",
        "Triglicerídeos": "triglicerideos", "Triglicerideos": "triglicerideos",
        "PCR": "pcr_ultrassensivel",
        "Homocisteína": "homocisteina",
        "Hematócrito": "hematocrito", "Hematocrito": "hematocrito",
        "Hemoglobina": "hemoglobina",
        "Leucócitos": "leucocitos",
        "Plaquetas": "plaquetas",
        "Creatinina": "creatinina",
        "Ureia": "ureia",
        "Ácido Úrico": "acido_urico",
        "Glicemia": "glicemia_jejum", "Glicose": "glicemia_jejum",
        "Insulina": "insulina_jejum",
        "HbA1c": "hba1c", "Hemoglobina Glicada": "hba1c",
        "HOMA-IR": "homa_ir",
        "Vitamina D": "vitamina_d",
        "Cálcio": "calcio",
        "Ferro": "ferro_serico",
        "Ferritina": "ferritina",
        "Vitamina B12": "b12", "B12": "b12",
        "Zinco": "zinco",
        "Magnésio": "magnesio",
        "PSA": "psa",
      };

      const examRow: any = {
        user_id: user.id,
        data_coleta: new Date().toISOString().split("T")[0],
        analise_ia: analysis.summary || analysis.resumo_executivo || "",
        alertas: analysis.risk_alerts?.map((a: any) => typeof a === "string" ? a : a.mensagem) || [],
        acoes_prioritarias: analysis.suplementacao_ajustada || null,
        proximos_exames: analysis.proximos_exames || null,
        semaforo_geral: analysis.semaforo_geral || "amarelo",
      };

      for (const marker of analysis.markers) {
        const name = marker.name?.trim();
        for (const [key, col] of Object.entries(markerMap)) {
          if (name?.toLowerCase().includes(key.toLowerCase())) {
            examRow[col] = marker.value;
            break;
          }
        }
      }

      await supabase.from("athlete_exams").insert(examRow);
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-blood-test error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
