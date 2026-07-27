import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "log_weight",
  title: "Registrar peso corporal",
  description:
    "Registra um novo peso corporal (e opcionalmente percentual de gordura e massa muscular) para o usuário autenticado.",
  inputSchema: {
    weight_kg: z.number().min(20).max(400).describe("Peso em quilogramas."),
    body_fat_pct: z.number().min(1).max(70).optional().describe("Percentual de gordura corporal."),
    muscle_mass_kg: z.number().min(1).max(200).optional().describe("Massa muscular em kg."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ weight_kg, body_fat_pct, muscle_mass_kg }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const { data, error } = await supabaseForUser(ctx)
      .from("weight_logs")
      .insert({
        user_id: ctx.getUserId(),
        weight_kg,
        body_fat_pct: body_fat_pct ?? null,
        muscle_mass_kg: muscle_mass_kg ?? null,
      })
      .select("id, weight_kg, body_fat_pct, muscle_mass_kg, logged_at")
      .maybeSingle();

    if (error) return fail(error.message);
    return ok(data);
  },
});
