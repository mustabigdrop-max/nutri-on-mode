// MERIDIAN — helper compartilhado para extrair erro real de Edge Function.
import { supabase } from "@/integrations/supabase/client";

export interface MeridianInvokeError {
  error: string;
  message?: string;
  required_markers?: string[];
  next_steps?: string[];
}

export async function invokeMeridianCalculatePlan(payload: {
  competition_id: string;
  athlete_params_override?: Record<string, unknown>;
  patient_user_id?: string;
}): Promise<{ ok: true; plan: any } | { ok: false; payload: MeridianInvokeError }> {
  const { data, error } = await supabase.functions.invoke("meridian-calculate-plan", {
    body: payload,
  });

  if (error) {
    // Tenta extrair mensagem real do corpo da resposta da Edge Function.
    let parsed: MeridianInvokeError | null = null;
    try {
      const ctx = (error as any).context;
      const raw = ctx?.body ?? ctx;
      if (raw) {
        if (typeof raw === "string") {
          parsed = JSON.parse(raw);
        } else if (typeof (raw as any).text === "function") {
          const txt = await (raw as any).text();
          parsed = txt ? JSON.parse(txt) : null;
        } else {
          parsed = raw as MeridianInvokeError;
        }
      }
    } catch (_) {
      // ignora parse failure
    }
    if (parsed && (parsed.error || parsed.message)) {
      return { ok: false, payload: parsed };
    }
    return {
      ok: false,
      payload: { error: error.message || "Falha ao chamar Edge Function MERIDIAN." },
    };
  }

  if ((data as any)?.error) {
    return { ok: false, payload: data as MeridianInvokeError };
  }
  return { ok: true, plan: (data as any)?.plan };
}
