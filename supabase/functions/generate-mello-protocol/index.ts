/**
 * ============================================================================
 * Supabase Edge Function — generate-mello-protocol
 * ============================================================================
 * Gera um protocolo de treino no padrão "Mello Atualização" usando Gemini
 * 2.5 Flash Lite via Lovable AI Gateway. Valida com Zod e re-tenta 1x.
 * ============================================================================
 */

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  MelloProtocolSchema,
  MELLO_GEMINI_RESPONSE_SCHEMA,
  MELLO_SYSTEM_PROMPT,
} from "../_shared/melloProtocol.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GEMINI_MODEL = "google/gemini-2.5-flash-lite";
const TIMEOUT_MS = 120_000;
const DEFAULT_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

function buildUserMessage(athlete: Record<string, unknown>): string {
  return [
    "Gere o protocolo de treino no padrão Mello Atualização para o atleta abaixo.",
    "",
    "DADOS DO ATLETA:",
    JSON.stringify(athlete, null, 2),
    "",
    "Lembre: retorne APENAS o JSON conforme o response_schema. Sem texto fora.",
  ].join("\n");
}

async function callGemini(athlete: Record<string, unknown>, attempt: number) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const LOVABLE_API_BASE_URL = Deno.env.get("LOVABLE_API_BASE_URL") ?? DEFAULT_GATEWAY_URL;

  if (!LOVABLE_API_KEY) {
    throw new Error("Missing LOVABLE_API_KEY");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const retryHint =
    attempt > 0
      ? "\n\nIMPORTANTE: a tentativa anterior falhou na validação. Garanta TODOS os campos obrigatórios e respeite minItems (8 grupos em muscle_priorities, 2 improvement_alerts, 3 sessões em training_days, 4+ exercícios em warmup, 3+ exercícios por sessão)."
      : "";

  try {
    const response = await fetch(`${LOVABLE_API_BASE_URL}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        temperature: 0.7,
        messages: [
          { role: "system", content: MELLO_SYSTEM_PROMPT + retryHint },
          { role: "user", content: buildUserMessage(athlete) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: MELLO_GEMINI_RESPONSE_SCHEMA,
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty content from Gemini");
    return JSON.parse(content);
  } catch (err) {
    clearTimeout(timeoutId);
    if ((err as any)?.name === "AbortError") {
      throw new Error("timeout");
    }
    throw err;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const athlete = body?.athlete;
    if (!athlete || typeof athlete !== "object") {
      return new Response(
        JSON.stringify({ error: "missing_athlete_payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Tentativa 1
    let rawProtocol = await callGemini(athlete, 0);
    let parsed = MelloProtocolSchema.safeParse(rawProtocol);

    // Auto-retry 1x se falhar validação
    if (!parsed.success) {
      console.warn("[mello] Validation failed on attempt 1, retrying once", {
        issues: parsed.error.issues.slice(0, 5),
      });
      rawProtocol = await callGemini(athlete, 1);
      parsed = MelloProtocolSchema.safeParse(rawProtocol);
    }

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "validation_failed",
          details: parsed.error.issues,
          raw: rawProtocol,
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ protocol: parsed.data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[mello] Edge function error:", message);

    const status = message === "timeout" ? 504 : 500;
    const code = message === "timeout" ? "timeout" : "gemini_failed";

    return new Response(JSON.stringify({ error: code, message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
