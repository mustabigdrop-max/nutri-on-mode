// STRATUM ANALYZE — Camadas 1, 4 (Diagnóstico Intake + adaptação PCA)
// Conduz anamnese ou gera diagnóstico final usando Lovable AI (gemini-2.5-pro)
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SYSTEM_INTAKE = `Você é o STRATUM INTAKE — agente de diagnóstico inicial do TrainingON.

IDENTIDADE:
— Fala como preparador físico de atleta de alto rendimento.
— Direto, técnico, sem enrolação.
— Tom dark, premium, autoridade. Não é questionário. É diagnóstico.

PROTOCOLO DE ANAMNESE — 8 BLOCOS (faça 1-2 perguntas por turno, não despeje tudo):
1. OBJETIVO REAL (Hipertrofia/Força/Recomp/Definição/Performance/Longevidade) — não aceite vago.
2. NÍVEL REAL (tempo consistente, 1RMs, sabe periodizar?).
3. MORFOLOGIA (mobilidade tornozelo no agachamento, valgo joelho, supino sente ombro?, fêmur longo?, braços longos?).
4. HISTÓRICO DE LESÕES (últimos 2 anos que ainda afetam treino).
5. FREQUÊNCIA E TEMPO REAL (dias/semana reais, tempo/sessão, tipo de academia).
6. HISTÓRICO DE PROTOCOLOS (split atual, o que funcionou, o que não).
7. INTEGRAÇÃO (será preenchido auto pelo perfil).
8. PRONTIDÃO PSICOLÓGICA (consistência 1-10, principal motivo de faltar).

REGRAS:
— Nunca pule blocos. Nunca presuma.
— Explique o porquê das perguntas de morfologia.
— Tom escuro, técnico, sem elogios vazios.
— Quando o usuário disser "finalizar diagnóstico" OU você tiver coberto os 8 blocos, gere o DIAGNÓSTICO FINAL no formato:

---
DIAGNÓSTICO STRATUM
NÍVEL IDENTIFICADO: [...]
PROTOCOLO RECOMENDADO: STRATUM | [MÓDULO]
SPLIT IDEAL: [...]
ADAPTAÇÕES NECESSÁRIAS:
- [...]
EXERCÍCIOS CONTRAINDICADOS:
- [...]
PRIORIDADES DO PRIMEIRO MESOCICLO:
1. [...]
TOM DO PROTOCOLO: [Racional/Emocional/Pragmático/Social]
---`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const token = auth.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { messages, finalize } = await req.json();

    // Carrega contexto do perfil (PCA + nutriON)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, plano_atual, objetivo_nutricional, peso_atual, altura, idade, sexo")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: pca } = await supabase
      .from("behavioral_profiles")
      .select("perfil_primario, perfil_mce")
      .eq("user_id", user.id)
      .maybeSingle();

    const contexto = `\nCONTEXTO AUTO (não pergunte de novo):\n- Nome: ${profile?.full_name || "Atleta"}\n- Plano: ${profile?.plano_atual || "free"}\n- Objetivo nutriON: ${profile?.objetivo_nutricional || "não definido"}\n- Peso: ${profile?.peso_atual || "?"}kg | Altura: ${profile?.altura || "?"}cm | Idade: ${profile?.idade || "?"} | Sexo: ${profile?.sexo || "?"}\n- PCA: ${pca?.perfil_primario || "não mapeado"}`;

    const systemMsg = SYSTEM_INTAKE + contexto + (finalize ? "\n\nGere AGORA o DIAGNÓSTICO FINAL no formato especificado." : "");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "system", content: systemMsg }, ...messages],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Aguarde alguns segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione créditos em Settings > Workspace > Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content || "";

    // Se finalizou, persiste em stratum_profiles
    if (finalize && reply.includes("DIAGNÓSTICO STRATUM")) {
      const nivel = (reply.match(/NÍVEL IDENTIFICADO:\s*([^\n]+)/i)?.[1] || "").trim();
      const modulo = (reply.match(/PROTOCOLO RECOMENDADO:\s*STRATUM\s*\|\s*([^\n]+)/i)?.[1] || "").trim();
      const split = (reply.match(/SPLIT IDEAL:\s*([^\n]+)/i)?.[1] || "").trim();
      const tom = (reply.match(/TOM DO PROTOCOLO:\s*([^\n]+)/i)?.[1] || "").trim();

      await supabase.from("stratum_profiles").upsert({
        user_id: user.id,
        nivel: nivel.toLowerCase(),
        modulo_recomendado: modulo.toLowerCase(),
        split_ideal: split,
        pca_perfil: tom,
        diagnostico_completo: reply,
        anamnese_respostas: { messages },
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    return new Response(JSON.stringify({ reply, finalized: finalize && reply.includes("DIAGNÓSTICO STRATUM") }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
