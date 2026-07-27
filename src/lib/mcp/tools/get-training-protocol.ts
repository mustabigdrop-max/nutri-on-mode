import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "get_training_protocol",
  title: "Obter protocolo de treino",
  description:
    "Retorna o conteúdo completo de um protocolo de treino do usuário autenticado a partir do seu id.",
  inputSchema: {
    protocol_id: z.string().uuid().describe("Id do protocolo (use list_training_protocols)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ protocol_id }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const { data, error } = await supabaseForUser(ctx)
      .from("training_protocols")
      .select("*")
      .eq("user_id", ctx.getUserId())
      .eq("id", protocol_id)
      .maybeSingle();

    if (error) return fail(error.message);
    if (!data) return fail("Protocolo não encontrado.");
    return ok(data);
  },
});
