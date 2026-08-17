import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

type Suggestion = {
  suggested_profile: string;
  estimated_bf_range: [number, number];
  fat_distribution: string;
  muscle_development: string;
  visual_indicators: string[];
  nutritional_priorities: string[];
  abw_factor_suggestion: number;
  protein_reference: string;
  confidence: string;
};

async function findPhoto(admin: any, userId: string) {
  const { data: av } = await admin
    .from("athlete_visual_assessments")
    .select("foto_frontal_url, foto_url, foto_lateral_url, foto_posterior_url, data_avaliacao, created_at, bf_estimado, peso_kg")
    .eq("athlete_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const url = av?.foto_frontal_url || av?.foto_url || av?.foto_lateral_url || av?.foto_posterior_url;
  if (url) return { url, date: av.data_avaliacao || av.created_at, source: "apex_visual" };

  const { data: pp } = await admin
    .from("progress_photos")
    .select("photo_url, photo_date, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (pp?.photo_url) return { url: pp.photo_url, date: pp.photo_date || pp.created_at, source: "progress_photo" };

  const { data: po } = await admin
    .from("postural_photos")
    .select("photo_url, photo_date, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (po?.photo_url) return { url: po.photo_url, date: po.photo_date || po.created_at, source: "postural_photo" };

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) return json({ error: "Não autenticado." }, 401);

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: auth } = await userClient.auth.getUser();
    if (!auth?.user) return json({ error: "Não autenticado." }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    const body = await req.json().catch(() => ({}));
    const action: string = body.action || "analyze";
    const patientUserId: string = body.patient_user_id || auth.user.id;

    // Autorização: o próprio usuário, coach vinculado ou admin
    if (patientUserId !== auth.user.id) {
      const { data: isCoach } = await admin.rpc("is_coach_of_patient", {
        _coach_user_id: auth.user.id,
        _patient_user_id: patientUserId,
      });
      const { data: isAdmin } = await admin.rpc("has_role", { _user_id: auth.user.id, _role: "admin" });
      if (!isCoach && !isAdmin) return json({ error: "Sem permissão para este cliente." }, 403);
    }

    if (action === "apply") {
      const s = body.suggestion as Suggestion;
      if (!s?.suggested_profile) return json({ error: "Sugestão inválida." }, 400);
      const bf =
        Array.isArray(s.estimated_bf_range) && s.estimated_bf_range.length === 2
          ? (Number(s.estimated_bf_range[0]) + Number(s.estimated_bf_range[1])) / 2
          : null;
      const { error } = await admin
        .from("profiles")
        .update({
          body_profile: s.suggested_profile,
          bf_percent: bf,
          abw_factor: s.abw_factor_suggestion ?? null,
          fat_distribution: s.fat_distribution ?? null,
          muscle_development: s.muscle_development ?? null,
          protein_reference: s.protein_reference ?? null,
          visual_indicators: s.visual_indicators ?? null,
          nutritional_priorities: s.nutritional_priorities ?? null,
          profile_source: body.source === "manual" ? "manual" : "apex_visual",
          profile_analyzed_at: new Date().toISOString(),
        })
        .eq("user_id", patientUserId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    // ── analyze ──
    const photo = await findPhoto(admin, patientUserId);
    if (!photo) {
      return json({ error: "Nenhuma foto encontrada no APEX. Faça uma avaliação visual primeiro." }, 404);
    }

    const { data: prof } = await admin
      .from("profiles")
      .select("full_name, weight_kg, height_cm, date_of_birth, sex, body_profile, bf_percent, profile_analyzed_at")
      .eq("user_id", patientUserId)
      .maybeSingle();

    const peso = Number(body.weight_kg ?? prof?.weight_kg ?? 0) || null;
    const altura = Number(body.height_cm ?? prof?.height_cm ?? 0) || null;
    const idade =
      Number(body.age) ||
      (prof?.date_of_birth
        ? Math.floor((Date.now() - new Date(prof.date_of_birth).getTime()) / 31557600000)
        : null);
    const sexo = (body.sex || prof?.sex || "male").toString().toLowerCase().startsWith("f") ? "Feminino" : "Masculino";
    const imc = peso && altura ? (peso / Math.pow(altura / 100, 2)).toFixed(1) : "?";

    const prompt = `Você é um sistema de análise corporal para coaching nutricional.

Dados do cliente:
- Peso: ${peso ?? "?"} kg
- Altura: ${altura ?? "?"} cm
- Idade: ${idade ?? "?"} anos
- Sexo: ${sexo}
- IMC calculado: ${imc}

Analise a foto e retorne APENAS um JSON com:

{
  "suggested_profile": "padrao|atletico|sobrepeso|obeso|obeso_severo|masters|adolescente",
  "estimated_bf_range": [min, max],
  "fat_distribution": "androide|ginoide|misto",
  "muscle_development": "baixo|moderado|alto|muito_alto",
  "visual_indicators": ["lista de observações visuais"],
  "nutritional_priorities": ["lista de prioridades pra dieta"],
  "abw_factor_suggestion": 0.25,
  "protein_reference": "real|ideal",
  "confidence": "alta|media|baixa"
}

REGRAS:
- Seja conservador na estimativa de BF (range de 4%)
- Se o IMC > 30 e há acúmulo adiposo visível, sugira "obeso"
- Se há musculatura definida e BF baixo, sugira "atletico"
- Se a idade > 50, sugira "masters" se relevante
- Nunca diagnostique doenças, apenas sugira verificações
- Responda APENAS com o JSON, nada mais`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY não configurada." }, 500);

    const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: photo.url } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!ai.ok) {
      const t = await ai.text();
      console.error("AI error", ai.status, t);
      if (ai.status === 429) return json({ error: "Limite de requisições atingido. Tente em alguns segundos." }, 429);
      if (ai.status === 402) return json({ error: "Créditos de IA insuficientes." }, 402);
      return json({ error: "Falha na análise visual." }, 500);
    }

    const data = await ai.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    let analysis: Suggestion;
    try {
      analysis = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      console.error("parse error", raw);
      return json({ error: "Resposta da análise em formato inválido." }, 502);
    }

    // Histórico (evolução do perfil)
    const { data: hist } = await admin
      .from("athlete_visual_assessments")
      .select("data_avaliacao, created_at, bf_estimado, peso_kg")
      .eq("athlete_id", patientUserId)
      .order("created_at", { ascending: true })
      .limit(12);

    return json({
      ...analysis,
      photo_used: photo.url,
      photo_date: photo.date,
      photo_source: photo.source,
      client_data: { weight: peso, height: altura, age: idade, sex: sexo, imc },
      current_profile: prof?.body_profile ?? null,
      current_bf: prof?.bf_percent ?? null,
      current_analyzed_at: prof?.profile_analyzed_at ?? null,
      history: hist ?? [],
    });
  } catch (e) {
    console.error("analyze-body-profile error", e);
    return json({ error: e instanceof Error ? e.message : "Erro desconhecido" }, 500);
  }
});
