/**
 * ============================================================================
 * Edge Function — regenerate-legacy-protocol
 * ----------------------------------------------------------------------------
 * Migra um protocolo legado (markdown) da tabela `training_protocols` para o
 * padrão Mello v1 (JSON estruturado).
 *
 * Fluxo:
 *  1. Valida JWT do usuário
 *  2. Busca o legado (RLS garante ownership)
 *  3. Extrai athlete payload das colunas existentes
 *  4. Chama a Edge Function `generate-mello-protocol`
 *  5. Insere novo registro com format_version='mello_v1' + migration_source_id
 *  6. Marca o legado como is_legacy_replaced=true
 * ============================================================================
 */
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface LegacyRow {
  id: string;
  user_id: string;
  client_name: string | null;
  phase: string | null;
  muscles: string[] | null;
  level: string | null;
  weeks: string | null;
  days_per_week: string | null;
  equipment: string | null;
  injuries: string | null;
  session_duration: string | null;
  protocol_text: string | null;
  format_version: string;
  is_legacy_replaced: boolean;
}

interface AthletePayload {
  name: string;
  category: string;
  phase: string;
  readiness: number;
  apex_priorities: string[];
  fiber_profile: string;
  biotype: string;
  restrictions: string[];
  division: string;
  total_weeks: number;
  current_week: number;
  deload_week: number;
}

// Converte string tipo "12 semanas" / "12" em number
function parseWeeks(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const m = String(raw).match(/\d+/);
  return m ? parseInt(m[0], 10) : fallback;
}

function extractAthlete(
  legacy: LegacyRow,
  override?: Partial<AthletePayload>,
): AthletePayload {
  const totalWeeks = override?.total_weeks ?? parseWeeks(legacy.weeks, 16);
  return {
    name: override?.name ?? legacy.client_name ?? "Atleta",
    category: override?.category ?? "Classic Physique",
    phase: override?.phase ?? legacy.phase ?? "Off-season",
    readiness: override?.readiness ?? 7,
    apex_priorities: override?.apex_priorities ?? (legacy.muscles ?? []),
    fiber_profile: override?.fiber_profile ?? "padrão de atleta",
    biotype: override?.biotype ?? "mesomorfo",
    restrictions:
      override?.restrictions ??
      (legacy.injuries ? [legacy.injuries] : []),
    division: override?.division ?? "Bro Split Adaptado",
    total_weeks: totalWeeks,
    current_week: override?.current_week ?? 1,
    deload_week: override?.deload_week ?? Math.max(4, Math.floor(totalWeeks / 3)),
  };
}

async function callMelloGenerator(
  athlete: AthletePayload,
  jwt: string,
): Promise<Record<string, unknown>> {
  const url = `${Deno.env.get("SUPABASE_URL")!}/functions/v1/generate-mello-protocol`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ athlete }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`generate-mello-protocol ${res.status}: ${txt}`);
  }
  const json = await res.json();
  if (!json.protocol) throw new Error("generate-mello-protocol sem payload");
  return json.protocol;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const jwt = authHeader.replace("Bearer ", "");

    const body = await req.json().catch(() => ({}));
    const legacyId: string | undefined = body?.legacy_protocol_id;
    const override: Partial<AthletePayload> | undefined = body?.athlete_override;

    if (!legacyId) {
      return new Response(
        JSON.stringify({ error: "missing_legacy_protocol_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Validação de auth + ownership (RLS)
    const { data: claims, error: authErr } = await userClient.auth.getClaims(jwt);
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: legacy, error: fetchErr } = await userClient
      .from("training_protocols")
      .select("*")
      .eq("id", legacyId)
      .maybeSingle<LegacyRow>();

    if (fetchErr || !legacy) {
      return new Response(
        JSON.stringify({ error: "legacy_not_found", details: fetchErr?.message }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (legacy.format_version !== "legacy") {
      return new Response(
        JSON.stringify({
          error: "not_a_legacy_protocol",
          message: `format_version='${legacy.format_version}'`,
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (legacy.is_legacy_replaced) {
      return new Response(JSON.stringify({ error: "already_replaced" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const athlete = extractAthlete(legacy, override);
    const protocolJson = await callMelloGenerator(athlete, jwt);

    const { data: inserted, error: insertErr } = await adminClient
      .from("training_protocols")
      .insert({
        user_id: legacy.user_id,
        client_name: athlete.name,
        phase: athlete.phase,
        muscles: athlete.apex_priorities,
        level: legacy.level,
        weeks: String(athlete.total_weeks),
        days_per_week: legacy.days_per_week,
        equipment: legacy.equipment,
        injuries: athlete.restrictions.join("; ") || null,
        session_duration: legacy.session_duration,
        protocol_text: legacy.protocol_text,
        format_version: "mello_v1",
        protocol_json: protocolJson,
        migration_source_id: legacy.id,
        migrated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      throw new Error(`insert failed: ${insertErr?.message}`);
    }

    const { error: updateErr } = await adminClient
      .from("training_protocols")
      .update({
        is_legacy_replaced: true,
        migrated_at: new Date().toISOString(),
      })
      .eq("id", legacy.id);

    if (updateErr) {
      console.warn("[regenerate-legacy] flag legacy failed", updateErr);
    }

    return new Response(
      JSON.stringify({
        new_protocol_id: inserted.id,
        legacy_protocol_id: legacy.id,
        title: (protocolJson as any)?.meta?.title,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[regenerate-legacy] error:", message);
    return new Response(
      JSON.stringify({ error: "internal", message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
