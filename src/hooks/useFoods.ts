import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Food {
  id: string;
  nome: string;
  calorias_100g: number;
  proteina_100g: number;
  carbo_100g: number;
  gordura_100g: number;
  fibra: number | null;
  sodio: number | null;
  vitaminas: Record<string, unknown>;
  fonte: string;
  created_at: string;
}

export const useFoods = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("foods")
      .select("*")
      .order("nome");
    setFoods((data as Food[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const searchFoods = useCallback(async (query: string) => {
    if (!query.trim()) return foods;
    const { data } = await supabase
      .from("foods")
      .select("*")
      .ilike("nome", `%${query}%`)
      .order("nome")
      .limit(20);
    return (data as Food[]) ?? [];
  }, [foods]);

  const calcMacros = useCallback((food: Food, grams: number) => {
    const factor = grams / 100;
    return {
      kcal: Math.round(food.calorias_100g * factor),
      protein: Math.round(food.proteina_100g * factor * 10) / 10,
      carbs: Math.round(food.carbo_100g * factor * 10) / 10,
      fat: Math.round(food.gordura_100g * factor * 10) / 10,
    };
  }, []);

  return { foods, loading, searchFoods, calcMacros, refetch: fetchFoods };
};
