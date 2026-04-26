import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, ChevronRight, Users } from "lucide-react";

const CoachCompetitionShortcut = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [planCount, setPlanCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Admin?
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      // Coach profile?
      const { data: coach } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const isAdmin = profile?.role === "admin";
      const isCoach = !!coach?.id;

      if (!isAdmin && !isCoach) return;

      if (coach?.id) {
        const { count } = await supabase
          .from("competition_plans" as any)
          .select("id", { count: "exact", head: true })
          .eq("coach_id", coach.id);
        setPlanCount(count || 0);
      }
      setShow(true);
    })();
  }, [user]);

  if (!show) return null;

  return (
    <Card
      className="bg-gradient-to-br from-amber-500/15 via-card to-card border-amber-500/30 cursor-pointer hover:border-amber-500/50 transition-all"
      onClick={() => navigate("/coach/dashboard")}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="h-6 w-6 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground">
                Modo Competição <span className="text-amber-500">🏆</span>
              </h3>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Crie e gerencie planos de prep (Off-season → Peak Week) com Dual-AI
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Coach Dashboard
              </Badge>
              {planCount > 0 && (
                <Badge className="text-xs bg-amber-500/20 text-amber-500 border-amber-500/30">
                  {planCount} {planCount === 1 ? "plano" : "planos"} ativos
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoachCompetitionShortcut;
