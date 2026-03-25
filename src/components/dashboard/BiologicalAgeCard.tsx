
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, ChevronRight, Dna } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { differenceInYears } from "date-fns";

const BiologicalAgeCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [bioAge, setBioAge] = useState<number | null>(null);
  const [chronoAge, setChronoAge] = useState<number | null>(null);
  const [delta, setDelta] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const chronological = profile?.birth_date
      ? differenceInYears(new Date(), new Date(profile.birth_date))
      : null;
    setChronoAge(chronological);

    const fetchLatest = async () => {
      const { data } = await supabase
        .from("biological_age_scores")
        .select("biological_age, age_delta, chronological_age")
        .eq("user_id", user.id)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setBioAge(Number(data.biological_age));
        setDelta(Number(data.age_delta));
        if (!chronological) setChronoAge(Number(data.chronological_age));
      }
    };
    fetchLatest();
  }, [user?.id, profile?.birth_date]);

  const isYounger = delta !== null && delta < 0;
  const isOlder = delta !== null && delta > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate("/biological-age")}
      className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <Dna className="w-4 h-4 text-[hsl(var(--accent))]" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-primary">Idade Biológica</span>
      </div>

      {bioAge !== null && chronoAge !== null ? (
        <>
          <div className="flex items-end justify-center gap-6 mb-3">
            <div className="text-center">
              <span className="text-3xl font-mono font-bold text-foreground">{chronoAge}</span>
              <p className="text-[9px] font-mono text-muted-foreground mt-0.5">Cronológica</p>
            </div>
            <div className="text-center">
              <span className={`text-3xl font-mono font-bold ${isYounger ? "text-emerald-400" : isOlder ? "text-[hsl(var(--destructive))]" : "text-foreground"}`}>
                {Math.round(bioAge)}
              </span>
              <p className="text-[9px] font-mono text-muted-foreground mt-0.5">Biológica</p>
            </div>
          </div>

          {delta !== null && (
            <div className="flex items-center justify-center gap-1.5">
              {isYounger ? (
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 text-[hsl(var(--destructive))]" />
              )}
              <span className={`text-xs font-mono font-bold ${isYounger ? "text-emerald-400" : "text-[hsl(var(--destructive))]"}`}>
                {delta > 0 ? "+" : ""}{Math.round(delta)} anos
              </span>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs font-mono text-muted-foreground text-center py-2">Calcule sua idade biológica</p>
      )}

      <div className="flex items-center justify-center gap-1 mt-3 text-primary">
        <span className="text-[10px] font-mono">Ver detalhes</span>
        <ChevronRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
};

export default BiologicalAgeCard;
