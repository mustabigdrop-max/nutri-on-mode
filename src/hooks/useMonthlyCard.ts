import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import type { ProgressPhoto } from "@/hooks/useProgressPhotos";

export interface MonthlyCardData {
  month: string;
  userName: string;
  beforePhoto?: string;
  afterPhoto?: string;
  beforeWeight?: number;
  afterWeight?: number;
  beforeDate?: string;
  afterDate?: string;
  consistencyScore: number;
  totalMealsLogged: number;
  badgesUnlocked: number;
  maxStreak: number;
  proteinDaysHit: number;
  aiMessage?: string;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const useMonthlyCard = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState<MonthlyCardData | null>(null);

  const generateCard = useCallback(async (
    photos: ProgressPhoto[],
    targetMonth?: Date
  ) => {
    if (!user) return null;
    setLoading(true);

    try {
      const now = targetMonth || new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const monthName = `${MONTH_NAMES[month]} ${year}`;

      // Get month boundaries
      const monthStart = new Date(year, month, 1).toISOString().split("T")[0];
      const monthEnd = new Date(year, month + 1, 0).toISOString().split("T")[0];

      // Filter photos for this month
      const monthPhotos = photos
        .filter(p => p.photo_date >= monthStart && p.photo_date <= monthEnd)
        .sort((a, b) => a.photo_date.localeCompare(b.photo_date));

      const beforePhoto = monthPhotos[0];
      const afterPhoto = monthPhotos.length > 1 ? monthPhotos[monthPhotos.length - 1] : undefined;

      // Get meals logged this month
      const { count: mealsCount } = await supabase
        .from("meal_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("meal_date", monthStart)
        .lte("meal_date", monthEnd);

      // Get consistency scores for this month
      const { data: scores } = await supabase
        .from("consistency_scores")
        .select("total_score")
        .eq("user_id", user.id)
        .gte("week_start", monthStart)
        .lte("week_end", monthEnd);

      const avgScore = scores && scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + (s.total_score || 0), 0) / scores.length)
        : profile?.streak_days ? Math.min(profile.streak_days * 10, 100) : 0;

      // Get protein days from monthly_reports if available
      const { data: monthlyReport } = await supabase
        .from("monthly_reports")
        .select("protein_days_hit")
        .eq("user_id", user.id)
        .eq("report_month", monthStart)
        .single();

      const proteinDays = monthlyReport?.protein_days_hit || 0;

      // Get badges earned this month
      const { count: badgesCount } = await supabase
        .from("user_badges")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("earned_at", monthStart)
        .lte("earned_at", monthEnd + "T23:59:59");

      // Generate AI message
      let aiMessage = "";
      if (mealsCount && mealsCount > 0) {
        try {
          const { data: aiResponse } = await supabase.functions.invoke("nutri-coach", {
            body: {
              messages: [{
                role: "user",
                content: `Gere uma frase motivacional curta (máximo 2 frases) para um card de transformação mensal com estes dados:
- Mês: ${monthName}
- Refeições registradas: ${mealsCount}
- Score de consistência: ${avgScore}
- Dias com meta de proteína: ${proteinDays}
- Variação de peso: ${beforePhoto?.weight_kg && afterPhoto?.weight_kg ? (afterPhoto.weight_kg - beforePhoto.weight_kg).toFixed(1) + "kg" : "não registrado"}

Tom: inspirador, personalizado, comemore as conquistas. Não use aspas.`
              }],
              profileContext: profile?.full_name || "",
            },
          });

          // Parse streaming response
          const reader = aiResponse?.getReader?.();
          if (reader) {
            const decoder = new TextDecoder();
            let buffer = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              let idx: number;
              while ((idx = buffer.indexOf("\n")) !== -1) {
                let line = buffer.slice(0, idx);
                buffer = buffer.slice(idx + 1);
                if (line.endsWith("\r")) line = line.slice(0, -1);
                if (!line.startsWith("data: ")) continue;
                const json = line.slice(6).trim();
                if (json === "[DONE]") break;
                try {
                  const parsed = JSON.parse(json);
                  const c = parsed.choices?.[0]?.delta?.content;
                  if (c) aiMessage += c;
                } catch { /* skip */ }
              }
            }
          }
        } catch (e) {
          console.error("AI message error:", e);
        }
      }

      // Fallback message
      if (!aiMessage) {
        aiMessage = mealsCount && mealsCount > 20
          ? `${mealsCount} refeições registradas mostram seu comprometimento. Continue assim!`
          : "Cada registro é um passo na direção certa. O progresso é construído dia a dia.";
      }

      const data: MonthlyCardData = {
        month: monthName,
        userName: profile?.full_name || "Usuário",
        beforePhoto: beforePhoto?.signedUrl,
        afterPhoto: afterPhoto?.signedUrl,
        beforeWeight: beforePhoto?.weight_kg || undefined,
        afterWeight: afterPhoto?.weight_kg || undefined,
        beforeDate: beforePhoto?.photo_date,
        afterDate: afterPhoto?.photo_date,
        consistencyScore: avgScore,
        totalMealsLogged: mealsCount || 0,
        badgesUnlocked: badgesCount || 0,
        maxStreak: profile?.streak_days || 0,
        proteinDaysHit: proteinDays,
        aiMessage,
      };

      setCardData(data);
      return data;
    } catch (e) {
      console.error("Generate card error:", e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  return { cardData, loading, generateCard, setCardData };
};
