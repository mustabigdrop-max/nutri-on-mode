import { adminClient } from "./auth.ts";

/** The caller ID must come from requireUser, never request JSON. */
export async function loadCreatorProfile(userId: string) {
  const { data, error } = await adminClient().from("social_profile")
    .select("instagram_handle, niches, products, differentials, creator_profile")
    .eq("coach_id", userId).maybeSingle();
  if (error) throw new Error("Não foi possível carregar o perfil do criador. Tente novamente.");
  return data;
}