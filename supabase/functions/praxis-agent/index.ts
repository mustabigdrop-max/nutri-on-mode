import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { guard, adminClient } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const PRAXIS_DAILY_LIMIT = 30;

const EQUIV_TABLE = `
## TABELA DE EQUIVALÊNCIA PADRÃO
Proteínas:
- Peito de frango ↔ peito de peru ↔ tilápia ↔ merluza (mesma gramagem)
- 150g frango = 140g atum em lata drenado = 170g peixe branco
- 150g frango = 200g carne magra (patinho, alcatra)
- 3 ovos inteiros ≈ 150g frango (macros similares, com gordura)
- 1 scoop whey (30g) ≈ 100g frango (só proteína, sem saciedade)

Carboidratos (mesma gramagem de CHO):
- 100g arroz branco cozido = 100g batata doce cozida = 100g mandioca cozida
- 100g arroz = 80g macarrão cozido = 90g inhame cozido
- 40g aveia = 50g tapioca (seca) = 2 fatias pão integral

Gorduras:
- 1 col sopa azeite (13ml) = 20g abacate = 15g castanhas = 10g manteiga

Frutas (~60kcal):
- 1 banana média = 1 maçã média = 1 fatia média de melão = 15 uvas = 1 pera média
`;

function formatMealPlan(plan: any): string {
  if (!plan) return "Nenhum plano alimentar ativo.";
  const r = plan.resumo || {};
  const lines: string[] = [];
  lines.push(
    `Protocolo: ${r.nome || plan.objetivo || "plano ativo"} | Objetivo: ${r.objetivo || plan.objetivo || "—"}`,
  );
  lines.push(
    `Totais do dia: ${Math.round(r.calorias_totais || 0)} kcal | P ${Math.round(r.proteina_total || 0)}g | C ${Math.round(r.carboidrato_total || 0)}g | G ${Math.round(r.gordura_total || 0)}g`,
  );
  for (const m of plan.refeicoes || []) {
    const foods = (m.alimentos || [])
      .map((a: any) => `${a.alimento}${a.quantidade_g ? ` (${a.quantidade_g}g)` : a.quantidade ? ` (${a.quantidade})` : ""}`)
      .join(", ");
    lines.push(
      `- ${m.refeicao || "Refeição"}${m.horario ? ` às ${m.horario}` : ""}: ${foods || "—"}${
        m.macros ? ` [P${Math.round(m.macros.proteina || 0)} C${Math.round(m.macros.carboidrato || 0)} G${Math.round(m.macros.gordura || 0)}]` : ""
      }`,
    );
  }
  if (r.observacao_protocolo) lines.push(`Observação do protocolo: ${r.observacao_protocolo}`);
  return lines.join("\n");
}

function formatSupplements(plan: any): string {
  const s = plan?.suplementacao;
  if (!Array.isArray(s) || !s.length) return "Não informada.";
  return s
    .map((x: any) => `- ${x.suplemento}${x.dose ? ` · ${x.dose}` : ""}${x.timing ? ` · ${x.timing}` : ""}${x.justificativa ? ` (${x.justificativa})` : ""}`)
    .join("\n");
}

function formatTrainingPlan(t: any): string {
  if (!t) return "Nenhum plano de treino ativo.";
  const head = `Fase: ${t.phase || "—"} | Semanas: ${t.weeks || "—"} | Dias/semana: ${t.days_per_week || "—"} | Nível: ${t.level || "—"}`;
  let body = "";
  const raw = t.protocol_text;
  if (typeof raw === "string") body = raw;
  else if (raw) body = JSON.stringify(raw);
  return `${head}\n${body.slice(0, 9000)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const g = await guard(req, corsHeaders);
    if ("response" in g) return g.response;
    const userId = g.userId;

    const userMessage: string = (body?.userMessage || "").toString().trim();
    if (!userMessage) throw new Error("userMessage is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const admin = adminClient();

    // Rate limit — 30 mensagens por dia
    const today = new Date().toISOString().split("T")[0];
    const { count } = await admin
      .from("praxis_conversations")
      .select("id", { count: "exact", head: true })
      .eq("athlete_id", userId)
      .gte("created_at", `${today}T00:00:00Z`);
    if ((count || 0) >= PRAXIS_DAILY_LIMIT) {
      return new Response(
        JSON.stringify({
          error: `Você atingiu o limite de ${PRAXIS_DAILY_LIMIT} perguntas hoje. Volta amanhã ou fala direto com seu coach.`,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const [{ data: profile }, { data: sent }, { data: legacyMeal }, { data: legacyTraining }, { data: checkins }, { data: weights }] =
      await Promise.all([
        admin.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        admin
          .from("sent_plans")
          .select("type, plan_data, coach_message, created_at")
          .eq("athlete_id", userId)
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        admin
          .from("coach_meal_plans")
          .select("plano, objetivo, observacao, updated_at")
          .eq("patient_user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        admin
          .from("training_protocols")
          .select("*")
          .eq("patient_user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        admin
          .from("weekly_checkins")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(4),
        admin
          .from("weight_logs")
          .select("weight_kg, logged_at")
          .eq("user_id", userId)
          .order("logged_at", { ascending: false })
          .limit(10),
      ]);

    const sentMeal = (sent || []).find((s: any) => s.type === "meal_plan");
    const sentTraining = (sent || []).find((s: any) => s.type === "training_plan");

    const mealPlan = sentMeal?.plan_data || legacyMeal?.plano || null;
    const trainingPlan = sentTraining?.plan_data || legacyTraining || null;

    const coachNotes =
      sentMeal?.coach_message || sentTraining?.coach_message || legacyMeal?.observacao || null;

    const weightHistory = (weights || [])
      .map((w: any) => `${new Date(w.logged_at).toLocaleDateString("pt-BR")}: ${w.weight_kg}kg`)
      .join(" | ");

    const lastCheckin = checkins?.[0]
      ? JSON.stringify(checkins[0]).slice(0, 1200)
      : "Nenhum";

    const systemPrompt = `
Você é o Coach Diogo Mello falando diretamente com o seu cliente dentro do nutriON.
A voz é SUA, de pessoa. NUNCA se apresente como sistema, plataforma, assistente, agente ou IA.
Nunca diga "eu sou o PRAXIS", "eu sou o NUTRIS", "sou um assistente virtual", "como IA", "como modelo de linguagem", nem qualquer nome de sistema.
Se perguntarem quem é você, responda como pessoa: "Aqui é o Diogo, seu coach." e siga ajudando.
Nunca abra com apresentação nem com "Como posso ajudar?". Se precisar convidar a pergunta, use "Pergunta o que precisar."

## SEU PAPEL
Responder dúvidas práticas do cliente sobre o protocolo alimentar e de treino dele.
Você conhece o plano dele — refeições, macros, treino, suplementação, evolução.
Responda direto, prático, como um coach de nutrição esportiva experiente.

## REGRAS ABSOLUTAS
1. NUNCA contradiga o protocolo do coach. O plano é lei. Mudança estrutural → encaminhe ao coach.
2. NUNCA prescreva medicamentos nem altere protocolo farmacológico.
3. NUNCA faça diagnóstico médico. Sintomas preocupantes (dor forte, tontura persistente, desmaio, dor no peito) → mande procurar um médico e falar com o coach.
4. NUNCA mude os macros totais do plano. Substituições equivalentes são permitidas.
5. Se não souber ou for complexo: "Essa é uma boa pergunta pro seu coach. Manda mensagem pra ele."
6. Português brasileiro, tom direto e amigável, sem formalidade excessiva.
7. Use o nome do cliente com moderação.
8. Respostas curtas e práticas — no máximo 200 palavras. Se precisar de mais, pergunte se quer detalhes.
9. Em substituições, SEMPRE dê a gramagem equivalente e compare macros.
10. 💪 e 🔥 com moderação. Sem excesso de emoji.
11. Não dê conselhos de vida pessoal, não compare com outros atletas, não compartilhe dados de terceiros.

## DADOS DO CLIENTE
Nome: ${profile?.full_name || "atleta"}
Idade: ${profile?.age ?? profile?.idade ?? "—"}
Sexo: ${profile?.sexo || profile?.gender || "—"}
Peso atual: ${profile?.weight_kg ?? "—"}kg
Altura: ${profile?.height_cm ?? profile?.altura_cm ?? "—"}cm
BF%: ${profile?.body_fat_percentage ?? profile?.bf_percent ?? "—"}
Objetivo: ${profile?.objetivo_principal || profile?.goal || "—"}
Macros de referência: ${profile?.vet_kcal ? `${profile.vet_kcal} kcal | P${profile.protein_g}g C${profile.carbs_g}g G${profile.fat_g}g` : "ver plano"}

## PLANO ALIMENTAR ATIVO
${formatMealPlan(mealPlan)}

## PLANO DE TREINO ATIVO
${formatTrainingPlan(trainingPlan)}

## SUPLEMENTAÇÃO
${formatSupplements(mealPlan)}

## OBSERVAÇÕES DO COACH
${coachNotes || "Nenhuma observação registrada."}

## HISTÓRICO RECENTE
Último check-in: ${lastCheckin}
Evolução de peso: ${weightHistory || "Sem dados suficientes"}

${EQUIV_TABLE}
`;

    const history = Array.isArray(body?.history) ? body.history.slice(-10) : [];
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m: any) => ({
        role: m.role === "praxis" || m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || ""),
      })),
      { role: "user", content: userMessage },
    ];

    const aiResponse = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, stream: false }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Muitas perguntas ao mesmo tempo. Tenta de novo em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("PRAXIS AI error:", status, await aiResponse.text());
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const answer =
      aiData.choices?.[0]?.message?.content || "Não consegui processar agora. Tenta de novo.";

    const lower = userMessage.toLowerCase();
    const topic = /(troc|substitu)/.test(lower)
      ? "substituicoes"
      : /(suplement|creatina|whey|vitamin)/.test(lower)
        ? "suplementos"
        : /(treino|exerc|s[eé]rie|carga)/.test(lower)
          ? "treino"
          : /(fora|churrasco|restaurante|festa|social)/.test(lower)
            ? "comer_fora"
            : /(evolu|progress|peso|resultado)/.test(lower)
              ? "evolucao"
              : /(refei|macro|kcal|caloria|carbo|prote)/.test(lower)
                ? "plano"
                : "geral";

    const { error: insErr } = await admin.from("praxis_conversations").insert({
      athlete_id: userId,
      message_user: userMessage,
      message_praxis: answer,
      topic,
    });
    if (insErr) console.error("PRAXIS insert error:", insErr);

    return new Response(JSON.stringify({ answer, topic, remaining: PRAXIS_DAILY_LIMIT - (count || 0) - 1 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("PRAXIS error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
