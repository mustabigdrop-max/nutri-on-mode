// Shared authentication / authorization helpers for edge functions.
// Never trust a client-supplied user id: always derive the caller from the JWT
// and verify entitlement before reading/writing another user's data.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string };

/** Validates the bearer JWT and returns the caller's user id. */
export async function requireUser(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  const token = authHeader.replace("Bearer ", "");
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await userClient.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  return { ok: true, userId: data.claims.sub as string };
}

export async function isAdmin(callerId: string): Promise<boolean> {
  const { data } = await adminClient()
    .from("user_roles")
    .select("role")
    .eq("user_id", callerId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

/**
 * True when the caller may act on `targetUserId`:
 * self, an active coach of that patient, or an admin.
 */
export async function canAccessUser(
  callerId: string,
  targetUserId: string,
): Promise<boolean> {
  if (!targetUserId || callerId === targetUserId) return callerId === targetUserId;
  const admin = adminClient();
  const { data: coachOk } = await admin.rpc("is_coach_of_patient", {
    _coach_user_id: callerId,
    _patient_user_id: targetUserId,
  });
  if (coachOk === true) return true;
  return await isAdmin(callerId);
}

export function jsonError(
  status: number,
  error: string,
  corsHeaders: Record<string, string>,
) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * One-shot guard: authenticates the caller and (when `targetUserId` is given)
 * checks entitlement. Returns the resolved acting user id or a Response to return.
 */
export async function guard(
  req: Request,
  corsHeaders: Record<string, string>,
  targetUserId?: string | null,
): Promise<{ userId: string } | { response: Response }> {
  const auth = await requireUser(req);
  if (!auth.ok) return { response: jsonError(auth.status, auth.error, corsHeaders) };
  if (targetUserId && targetUserId !== auth.userId) {
    const allowed = await canAccessUser(auth.userId, targetUserId);
    if (!allowed) return { response: jsonError(403, "Forbidden", corsHeaders) };
  }
  return { userId: auth.userId };
}
