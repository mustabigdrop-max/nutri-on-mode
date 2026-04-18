// STRATUM NEXUS — Camada 6 (Integração com PeptideVault)
// Sugere peptídeos baseado em volume/intensidade do treino
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

    const { context } = await req.json(); // { volume, tipo, lesao, sono_score }

    const sugestoes: any[] = [];

    if (context?.volume && context.volume > 18) {
      sugestoes.push({
        trigger: "volume_alto",
        titulo: "Volume elevado — recuperação sistêmica",
        peptideos: [
          { nome: "BPC-157", dose: "250mcg 2x/dia", razao: "Reparo tecidual sistêmico" },
          { nome: "TB-500", dose: "2mg 2x/semana", razao: "Anti-inflamatório + regeneração" },
        ],
      });
    }
    if (context?.tipo && (context.tipo.includes("forca") || context.tipo.includes("força"))) {
      sugestoes.push({
        trigger: "forca_maxima",
        titulo: "Sessão de força máxima — recuperação articular/tendinosa",
        peptideos: [
          { nome: "GHK-Cu", dose: "2mg/dia", razao: "Colágeno + regeneração" },
          { nome: "BPC-157", dose: "250mcg 2x/dia", razao: "Proteção tendínea" },
        ],
      });
    }
    if (context?.lesao) {
      sugestoes.push({
        trigger: "lesao",
        titulo: `Desconforto reportado em ${context.lesao}`,
        peptideos: [
          { nome: "BPC-157", dose: "500mcg 2x/dia SC próximo à lesão", razao: "Reparo agudo" },
          { nome: "TB-500", dose: "5mg 2x/semana (carga 6 sem)", razao: "Regeneração" },
          { nome: "KPV", dose: "1mg 2x/dia oral", razao: "Anti-inflamatório" },
        ],
      });
    }
    if (context?.sono_score && context.sono_score < 6) {
      sugestoes.push({
        trigger: "sono_comprometido",
        titulo: "Sono comprometido — otimizar recuperação noturna",
        peptideos: [
          { nome: "Ipamorelin", dose: "300mcg 30min antes de dormir", razao: "GH noturno" },
          { nome: "DSIP", dose: "300mcg SC 45min antes de dormir", razao: "Profundidade do sono" },
        ],
      });
    }

    // Salva como adaptação se houve sugestão
    if (sugestoes.length > 0) {
      await supabase.from("stratum_adaptations").insert({
        user_id: user.id,
        tipo: "sync_nexus",
        detalhe: sugestoes.map(s => s.titulo).join(" | "),
        dados: { sugestoes, context },
      });
    }

    return new Response(JSON.stringify({ sugestoes, aviso: "Uso de peptídeos requer orientação profissional." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
