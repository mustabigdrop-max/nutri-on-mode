import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { PILAR2 } from "./pilar2.ts";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = Deno.env.get("SUPABASE_URL")!;
  const user = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
  const { data: u } = await user.auth.getUser();
  if (!u?.user) return json({ error: "Faça login novamente." }, 401);
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { error: e1 } = await admin.from("script_templates").upsert(PILAR2.map(p => ({ slug: p.slug, pilar: 2, payload: p })), { onConflict: "slug" });
  if (e1) return json({ error: "Falha ao preparar os modelos." }, 500);
  const { data, error } = await user.rpc("seed_pilar_templates", { _pilar: 2 });
  if (error) return json({ error: "Falha ao carregar os reels." }, 500);
  return json({ carregados: data });
});
