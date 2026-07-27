import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_weight_logs",
  title: "Histórico de peso",
  description:
    "Retorna o histórico de peso corporal do usuário autenticado, do mais recente para o mais antigo.",
  inputSchema: {
    limit: z.number().int().min(1).max(200).default(30).describe("Máximo de registros."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const { data, error } = await supabaseForUser(ctx)
      .from("weight_logs")
      .select("id, weight_kg, body_fat_pct, muscle_mass_kg, logged_at")
      .eq("user_id", ctx.getUserId())
      .order("logged_at", { ascending: false })
      .limit(limit ?? 30);

    if (error) return fail(error.message);
    return ok({ logs: data ?? [] });
  },
});
