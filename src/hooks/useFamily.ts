import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfWeek } from "date-fns";

export interface FamilyMember {
  id: string;
  owner_id: string;
  name: string;
  profile_type: "adult" | "child" | "elderly";
  avatar_emoji: string;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  dietary_restrictions: string[];
  health_notes: string | null;
  hydration_goal_ml: number;
  medications: string[];
  parental_lock: boolean;
  xp: number;
  stars: number;
  created_at: string;
}

export interface FamilyMealLog {
  id: string;
  owner_id: string;
  member_id: string;
  meal_date: string;
  meal_type: string;
  description: string | null;
  quality_score: number | null;
  hydration_ml: number;
  fruits_eaten: number;
  veggies_eaten: number;
  created_at: string;
}

export const useFamily = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [mealLogs, setMealLogs] = useState<FamilyMealLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("family_members")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at");
    setMembers((data as FamilyMember[]) ?? []);
    setLoading(false);
  };

  const fetchMealLogs = async (since?: string) => {
    if (!user) return;
    const sinceDate = since ?? format(subDays(new Date(), 7), "yyyy-MM-dd");
    const { data } = await supabase
      .from("family_meal_logs")
      .select("*")
      .eq("owner_id", user.id)
      .gte("meal_date", sinceDate)
      .order("meal_date", { ascending: false });
    setMealLogs((data as FamilyMealLog[]) ?? []);
  };

  useEffect(() => {
    if (user) {
      fetchMembers();
      fetchMealLogs();
    }
  }, [user]);

  const addMember = async (member: Partial<FamilyMember>) => {
    if (!user) return;
    const { error } = await supabase
      .from("family_members")
      .insert({ ...member, owner_id: user.id } as any);
    if (!error) await fetchMembers();
    return error;
  };

  const updateMember = async (id: string, updates: Partial<FamilyMember>) => {
    if (!user) return;
    const { error } = await supabase
      .from("family_members")
      .update(updates as any)
      .eq("id", id)
      .eq("owner_id", user.id);
    if (!error) await fetchMembers();
    return error;
  };

  const deleteMember = async (id: string) => {
    if (!user) return;
    await supabase.from("family_members").delete().eq("id", id).eq("owner_id", user.id);
    await fetchMembers();
  };

  const addMealLog = async (log: Partial<FamilyMealLog>) => {
    if (!user) return;
    const { error } = await supabase
      .from("family_meal_logs")
      .insert({ ...log, owner_id: user.id } as any);
    if (!error) await fetchMealLogs();
    return error;
  };

  const awardStars = async (memberId: string, count: number) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    await updateMember(memberId, { stars: (member.stars ?? 0) + count } as any);
  };

  // Weekly family report data
  const getWeeklyReport = () => {
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const weekLogs = mealLogs.filter((l) => l.meal_date >= weekStart);

    return members.map((member) => {
      const memberLogs = weekLogs.filter((l) => l.member_id === member.id);
      const totalMeals = memberLogs.length;
      const avgQuality = totalMeals > 0
        ? Math.round(memberLogs.reduce((s, l) => s + (l.quality_score ?? 0), 0) / totalMeals)
        : 0;
      const totalFruits = memberLogs.reduce((s, l) => s + (l.fruits_eaten ?? 0), 0);
      const totalVeggies = memberLogs.reduce((s, l) => s + (l.veggies_eaten ?? 0), 0);
      const totalHydration = memberLogs.reduce((s, l) => s + (l.hydration_ml ?? 0), 0);

      return {
        member,
        totalMeals,
        avgQuality,
        totalFruits,
        totalVeggies,
        totalHydration,
      };
    });
  };

  return {
    members,
    mealLogs,
    loading,
    addMember,
    updateMember,
    deleteMember,
    addMealLog,
    awardStars,
    getWeeklyReport,
    refetch: fetchMembers,
  };
};
