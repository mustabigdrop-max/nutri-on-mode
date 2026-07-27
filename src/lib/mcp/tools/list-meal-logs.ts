import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_meal_logs",
  title: "Listar refeições registradas",
  description:
    "Lista as refeições registradas pelo usuário autenticado, com calorias e macros, opcionalmente filtradas por intervalo de datas.",
  inputSchema: {
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Data inicial (YYYY-MM-DD)."),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Data final (YYYY-MM-DD)."),
    limit: z.number().int().min(1).max(100).default(30).describe("Máximo de registros."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ from, to, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    let query = supabaseForUser(ctx)
      .from("meal_logs")
      .select(
        "id, meal_date, meal_type, total_kcal, total_protein, total_carbs, total_fat, food_names, quality_score, confirmed, notes"
      )
      .eq("user_id", ctx.getUserId())
      .order("meal_date", { ascending: false })
      .limit(limit ?? 30);

    if (from) query = query.gte("meal_date", from);
    if (to) query = query.lte("meal_date", to);

    const { data, error } = await query;
    if (error) return fail(error.message);
    return ok({ meals: data ?? [] });
  },
});
