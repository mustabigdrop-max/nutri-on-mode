import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

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

const BUCKETS = ["apex-visual-photos", "progress-photos"];

async function toDataUrl(supabase: any, raw: string): Promise<string | null> {
  try {
    let url = raw;
    if (!/^https?:\/\//i.test(raw)) {
      let signed: string | null = null;
      for (const bucket of BUCKETS) {
        const path = raw.replace(/^\/+/, "").replace(new RegExp(`^${bucket}/`), "");
        const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 600);
        if (data?.signedUrl) { signed = data.signedUrl; break; }
      }
      if (!signed) return null;
      url = signed;
    }
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buf.length; i += 8192) {
      binary += String.fromCharCode(...buf.subarray(i, i + 8192));
    }
    const mime = res.headers.get("content-type") || "image/jpeg";
    return `data:${mime};base64,${btoa(binary)}`;
  } catch (e) {
    console.error("[body-profile] image error", e);
    return null;
  }
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) return json({ error: "Não autenticado." }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return json({ error: "Sessão inválida." }, 401);

    const body = await req.json().catch(() => ({}));
    const athleteId: string | undefined = body?.athleteId;
    const manual = body?.manual || {};
    const uploadedImage: string | undefined =
      typeof body?.imageBase64 === "string" && body.imageBase64.length > 100
        ? body.imageBase64
        : undefined;
    if (!athleteId || typeof athleteId !== "string") {
      return json({ error: "Selecione o cliente para analisar as fotos." }, 400);
    }

    // 1. Foto mais recente do APEX Visual
    let apex: any = null;
    let photoRaw: string | null = null;
    let photoDate: string | null = null;

    {
      const { data } = await supabase
        .from("athlete_visual_assessments")
        .select("foto_frontal_url, foto_lateral_url, foto_url, peso_kg, bf_estimado, data_avaliacao, created_at")
        .eq("athlete_id", athleteId)
        .order("data_avaliacao", { ascending: false })
        .limit(1)
        .maybeSingle();
      apex = data;
      photoRaw = data?.foto_frontal_url || data?.foto_url || data?.foto_lateral_url || null;
      photoDate = data?.data_avaliacao || data?.created_at || null;
    }

    if (!photoRaw) {
      const { data: pp } = await supabase
        .from("progress_photos")
        .select("photo_url, photo_date")
        .eq("user_id", athleteId)
        .order("photo_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      photoRaw = pp?.photo_url || null;
      photoDate = pp?.photo_date || photoDate;
    }

    if (!photoRaw && !uploadedImage) {
      return json({
        error: "Nenhuma foto encontrada. Envie uma foto pelo botão 'Enviar foto' ou faça uma avaliação no APEX Visual.",
      }, 404);
    }


    // 2. Dados do cliente
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, weight_kg, height_cm, age, date_of_birth, sex")
      .eq("user_id", athleteId)
      .maybeSingle();

    const weight = Number(manual.weight_kg || profile?.weight_kg || apex?.peso_kg || 0);
    const height = Number(manual.height_cm || profile?.height_cm || 0);
    let age = Number(manual.age || profile?.age || 0);
    if (!age && profile?.date_of_birth) {
      age = Math.floor(
        (Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 864e5)
      );
    }
    const sexRaw = String(manual.sex || profile?.sex || "M").toLowerCase();
    const sex = sexRaw.startsWith("f") ? "F" : "M";
    const imc = weight && height ? (weight / (height / 100) ** 2).toFixed(1) : "?";

    const image = uploadedImage
      ? (uploadedImage.startsWith("data:") ? uploadedImage : `data:image/jpeg;base64,${uploadedImage}`)
      : await toDataUrl(supabase, photoRaw!);
    if (!image) return json({ error: "Não consegui abrir a foto. Envie a foto manualmente pelo botão 'Enviar foto'." }, 422);
    if (uploadedImage) photoDate = new Date().toISOString();


    const prompt = `Você é um sistema de análise corporal para coaching nutricional.

Dados do cliente:
- Peso: ${weight || "?"} kg
- Altura: ${height || "?"} cm
- Idade: ${age || "?"} anos
- Sexo: ${sex === "M" ? "Masculino" : "Feminino"}
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
- Se o IMC > 30 e há acúmulo adiposo visível, sugira "obeso"; IMC > 40 → "obeso_severo"
- Se há musculatura definida e BF baixo, sugira "atletico"
- Se a idade > 50, sugira "masters" se relevante
- Nunca diagnostique doenças, apenas sugira verificações
- Responda APENAS com o JSON, nada mais`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: image } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("[body-profile] AI error", aiRes.status, t);
      if (aiRes.status === 429) return json({ error: "Limite de uso atingido. Tente em alguns segundos." }, 429);
      if (aiRes.status === 402) return json({ error: "Créditos insuficientes." }, 402);
      return json({ error: "Falha na análise visual." }, 502);
    }

    const data = await aiRes.json();
    const raw = data?.choices?.[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return json({ error: "Resposta inválida da análise." }, 502);

    let analysis: any;
    try {
      analysis = JSON.parse(match[0]);
    } catch {
      return json({ error: "Resposta inválida da análise." }, 502);
    }

    return json({
      ...analysis,
      photo_date: photoDate,
      client_data: { weight_kg: weight, height_cm: height, age, sex, imc },
    });
  } catch (e) {
    console.error("[body-profile] error", e);
    return json({ error: e instanceof Error ? e.message : "Erro desconhecido" }, 500);
  }
});
