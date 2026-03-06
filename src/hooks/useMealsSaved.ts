import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MealSaved {
  id: string;
  user_id: string;
  nome: string;
  alimentos: Array<{ food_id: string; nome: string; grams: number }>;
  total_macros: { kcal: number; protein: number; carbs: number; fat: number };
  created_at: string;
}

export const useMealsSaved = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealSaved[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("meals_saved")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setMeals((data as unknown as MealSaved[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const saveMeal = useCallback(async (meal: Pick<MealSaved, "nome" | "alimentos" | "total_macros">) => {
    if (!user) return;
    const { error } = await supabase
      .from("meals_saved")
      .insert({ user_id: user.id, nome: meal.nome, alimentos: meal.alimentos as any, total_macros: meal.total_macros as any });
    if (!error) await fetchMeals();
    return error;
  }, [user, fetchMeals]);

  const deleteMeal = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from("meals_saved").delete().eq("id", id).eq("user_id", user.id);
    await fetchMeals();
  }, [user, fetchMeals]);

  return { meals, loading, saveMeal, deleteMeal, refetch: fetchMeals };
};
