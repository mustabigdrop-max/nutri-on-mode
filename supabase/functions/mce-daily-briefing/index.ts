import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json({ error: "Não autenticado" }, 401);
    const { data: { user }, error: authError } = await admin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) return json({ error: "Não autenticado" }, 401);

    const body = await req.json().catch(() => ({}));
    const withAudio = body?.withAudio !== false;
    const today = new Date().toISOString().slice(0, 10);

    // Já existe briefing de hoje?
    const { data: existing } = await admin
      .from("daily_briefings")
      .select("id, text_content")
      .eq("user_id", user.id)
      .eq("briefing_date", today)
      .maybeSingle();

    let text = existing?.text_content || "";

    if (!text) {
      const [{ data: profile }, { data: scores }] = await Promise.all([
        admin.from("profiles").select("full_name, plano_atual, objetivo").eq("user_id", user.id).maybeSingle(),
        admin.from("mce_scores").select("score_m, score_c, score_e, created_at")
          .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

      const firstName = String(profile?.full_name || "atleta").split(" ")[0];
      const m = scores?.score_m ?? 50;
      const c = scores?.score_c ?? 50;
      const e = scores?.score_e ?? 50;

      const prompt = `Você é o Coach Diogo Mello gravando um áudio pessoal para o seu cliente.
Gere um briefing matinal falado (para ser lido em voz alta, 250-400 palavras).
Tom: firme, acolhedor, de mentor. Nunca mencione inteligência artificial, IA, modelos, sistema, plataforma ou nome de produto.
IDENTIDADE: a voz é sua, de pessoa. Este é um ritual diário: NUNCA se apresente, nunca diga "aqui é o Diogo", nunca cite nome de sistema (PRAXIS, NUTRIS, etc). O cliente já sabe quem está falando.

DADOS:
- Nome: ${firstName}
- Objetivo/fase: ${profile?.objetivo || "não informado"}
- MCE: Mente ${m} · Comportamento ${c} · Execução ${e}

ESTRUTURA:
1. "Bom dia, ${firstName}." + contexto do dia
2. Panorama curto (treino/nutrição/fase) em 2-3 frases
3. Um insight MCE focado no pilar mais fraco (se < 70)
4. Uma frase de motivação ligada ao propósito
5. Fechamento: "Bora. O sistema está com você."

REGRAS: narre naturalmente, sem listar dados nem usar marcadores, títulos ou emojis. Texto corrido em parágrafos.`;

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!aiRes.ok) {
        const t = await aiRes.text().catch(() => "");
        return json({ error: "Falha ao gerar briefing", detail: t }, aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 500);
      }
      const aiJson = await aiRes.json();
      text = aiJson?.choices?.[0]?.message?.content?.trim() || "";
      if (!text) return json({ error: "Briefing vazio" }, 502);

      await admin.from("daily_briefings").upsert(
        { user_id: user.id, briefing_date: today, text_content: text },
        { onConflict: "user_id,briefing_date" },
      );
    }

    let audioBase64: string | null = null;
    if (withAudio) {
      const ttsRes = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini-tts",
          input: text.slice(0, 3500),
          voice: "onyx",
          instructions:
            "Fale em português do Brasil, voz masculina grave, ritmo pausado e firme, como um mentor confiante.",
          response_format: "mp3",
          speed: 0.95,
        }),
      });
      if (ttsRes.ok) {
        const buf = new Uint8Array(await ttsRes.arrayBuffer());
        let binary = "";
        const chunk = 8192;
        for (let i = 0; i < buf.length; i += chunk) {
          binary += String.fromCharCode(...buf.subarray(i, i + chunk));
        }
        audioBase64 = btoa(binary);
      }
    }

    return json({ text, audioBase64, date: today });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
