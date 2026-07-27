import { defineTool } from "@lovable.dev/mcp-js";
import { fail, ok, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "get_profile",
  title: "Obter perfil nutricional",
  description:
    "Retorna o perfil do usuário autenticado: objetivo, peso, altura, metas de calorias e macros, nível de treino e plano atual.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const { data, error } = await supabaseForUser(ctx)
      .from("profiles")
      .select(
        "full_name, sex, date_of_birth, weight_kg, height_cm, meta_peso, goal, objetivo_principal, activity_level, nivel_treino, training_frequency, sport, dietary_restrictions, health_conditions, geb_kcal, get_kcal, vet_kcal, protein_g, carbs_g, fat_g, plano_atual, streak_days, level, xp"
      )
      .eq("user_id", ctx.getUserId())
      .maybeSingle();

    if (error) return fail(error.message);
    if (!data) return fail("Perfil não encontrado para este usuário.");
    return ok(data);
  },
});
