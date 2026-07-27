import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_training_protocols",
  title: "Listar protocolos de treino",
  description:
    "Lista os protocolos de treino (TrainingON) do usuário autenticado, com fase, nível, músculos e duração.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("Máximo de protocolos."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const { data, error } = await supabaseForUser(ctx)
      .from("training_protocols")
      .select(
        "id, client_name, phase, level, muscles, weeks, days_per_week, session_duration, equipment, injuries, created_at"
      )
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);

    if (error) return fail(error.message);
    return ok({ protocols: data ?? [] });
  },
});
