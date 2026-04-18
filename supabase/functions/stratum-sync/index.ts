// STRATUM SYNC — Camada 5 (Integração nutriON)
// Quando uma sessão é registrada, calcula ajuste de macros do dia
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { session_id } = await req.json();

    const { data: session } = await supabase
      .from("stratum_sessions")
      .select("*")
      .eq("id", session_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!session) return new Response(JSON.stringify({ error: "session not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: profile } = await supabase
      .from("profiles")
      .select("peso_atual")
      .eq("user_id", user.id)
      .maybeSingle();

    const peso = profile?.peso_atual || 70;
    const grupo = (session.grupo_principal || "").toLowerCase();
    const tipo = (session.tipo_treino || "").toLowerCase();

    // Lookup table conforme spec
    let carbo_g_kg = 3, proteina_g_kg = 2.0, pre_treino = "padrão", pos_treino = "padrão", multiplier = 1.0;

    if (grupo.includes("leg") || grupo.includes("quad") || grupo.includes("perna")) {
      carbo_g_kg = 6; proteina_g_kg = 2.4; pre_treino = "50-70g carbo + 25g whey 60-90min antes"; pos_treino = "80-100g carbo + 40g whey imediato"; multiplier = 1.5;
    } else if (tipo.includes("forca") || tipo.includes("força")) {
      carbo_g_kg = 5; proteina_g_kg = 2.2; pre_treino = "40-50g carbo + 20-25g whey"; pos_treino = "60-80g carbo + 35g whey"; multiplier = 1.35;
    } else if (tipo.includes("volume")) {
      carbo_g_kg = 4.5; proteina_g_kg = 2.2; multiplier = 1.25;
    } else if (tipo.includes("deload")) {
      carbo_g_kg = 2.5; proteina_g_kg = 2.2; multiplier = 0.8;
    }

    const ajuste = {
      session_id,
      data: session.data_sessao,
      carbo_g: Math.round(carbo_g_kg * peso),
      proteina_g: Math.round(proteina_g_kg * peso),
      pre_treino,
      pos_treino,
      multiplier,
      mensagem: `nutriON SYNC: ${session.tipo_treino || "treino"} ${grupo ? "(" + grupo + ")" : ""} → carbo ${Math.round(carbo_g_kg * peso)}g | proteína ${Math.round(proteina_g_kg * peso)}g`,
    };

    await supabase.from("stratum_adaptations").insert({
      user_id: user.id,
      tipo: "sync_nutrion",
      detalhe: ajuste.mensagem,
      dados: ajuste,
      aplicado: true,
    });

    return new Response(JSON.stringify(ajuste), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
