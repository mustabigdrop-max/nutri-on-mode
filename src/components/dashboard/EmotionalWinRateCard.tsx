import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, startOfDay } from "date-fns";

interface DayStat {
  date: string;
  total: number;
  resisted: number;
}

export default function EmotionalWinRateCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ total: number; resisted: number; winRate: number; days: DayStat[]; topTechnique: string; topEmotion: string }>({
    total: 0, resisted: 0, winRate: 0, days: [], topTechnique: "", topEmotion: "",
  });

  useEffect(() => {
    if (!user) return;
    loadStats();
  }, [user]);

  async function loadStats() {
    if (!user) return;
    setLoading(true);
    const since = subDays(new Date(), 7).toISOString();
    const { data: episodes } = await supabase
      .from("emotional_episodes")
      .select("occurred_at, resisted, technique_used, emotion, day_of_week")
      .eq("user_id", user.id)
      .gte("occurred_at", since)
      .eq("hunger_type", "emotional") as any;

    if (!episodes || episodes.length === 0) {
      setStats({ total: 0, resisted: 0, winRate: 0, days: [], topTechnique: "", topEmotion: "" });
      setLoading(false);
      return;
    }

    const total = episodes.length;
    const resisted = episodes.filter((e: any) => e.resisted === true).length;
    const winRate = total > 0 ? Math.round((resisted / total) * 100) : 0;

    // Group by day
    const dayMap: Record<string, DayStat> = {};
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      dayMap[d] = { date: d, total: 0, resisted: 0 };
    }
    episodes.forEach((ep: any) => {
      const d = format(new Date(ep.occurred_at), "yyyy-MM-dd");
      if (dayMap[d]) {
        dayMap[d].total++;
        if (ep.resisted) dayMap[d].resisted++;
      }
    });

    // Top technique & emotion
    const techCount: Record<string, number> = {};
    const emotionCount: Record<string, number> = {};
    episodes.forEach((ep: any) => {
      if (ep.technique_used) techCount[ep.technique_used] = (techCount[ep.technique_used] || 0) + 1;
      if (ep.emotion) emotionCount[ep.emotion] = (emotionCount[ep.emotion] || 0) + 1;
    });
    const topTechnique = Object.entries(techCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
    const topEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    setStats({ total, resisted, winRate, days: Object.values(dayMap), topTechnique, topEmotion });
    setLoading(false);
  }

  const EMOTION_EMOJIS: Record<string, string> = {
    ansiedade: "😰", estresse: "😤", tedio: "😴", tristeza: "😢",
    solidao: "😔", culpa: "😞", comemoracao: "🥳", cansaco: "😓",
  };

  const DOW_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  function getDotColor(day: DayStat) {
    if (day.total === 0) return "bg-white/10";
    if (day.resisted === day.total) return "bg-emerald-500";
    if (day.resisted > 0) return "bg-amber-500";
    return "bg-red-500";
  }

  const winColor = stats.winRate >= 70 ? "text-emerald-400" : stats.winRate >= 50 ? "text-amber-400" : "text-red-400";

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-3" />
        <div className="h-10 bg-muted rounded w-1/2 mx-auto mb-3" />
        <div className="h-3 bg-muted rounded w-2/3 mx-auto" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate("/behavioral-triggers")}
      className="rounded-2xl border border-border bg-card p-4 cursor-pointer hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold font-mono">Batalhas desta semana</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      {stats.total === 0 ? (
        <p className="text-[10px] font-mono text-muted-foreground text-center py-4">
          Nenhum episódio registrado — use o botão SOS quando sentir urgência
        </p>
      ) : (
        <>
          <div className="text-center mb-3">
            <p className="text-3xl font-black font-mono text-foreground">
              {stats.resisted}/{stats.total}
            </p>
            <p className={`text-sm font-bold font-mono ${winColor}`}>
              {stats.winRate}% win rate
            </p>
          </div>

          {/* Mini heatmap */}
          <div className="flex justify-between gap-1 mb-3">
            {stats.days.map((day, i) => (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <div className={`w-4 h-4 rounded-full ${getDotColor(day)}`} />
                <span className="text-[8px] font-mono text-muted-foreground">
                  {DOW_LABELS[new Date(day.date + "T12:00").getDay()]}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {stats.topTechnique && (
              <p className="text-[10px] font-mono text-muted-foreground">
                Técnica mais eficaz: <span className="text-primary font-bold">{stats.topTechnique}</span>
              </p>
            )}
            {stats.topEmotion && (
              <p className="text-[10px] font-mono text-muted-foreground">
                Gatilho principal: <span className="font-bold">{EMOTION_EMOJIS[stats.topEmotion] || ""} {stats.topEmotion}</span>
              </p>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
