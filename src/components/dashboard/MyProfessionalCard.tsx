import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stethoscope, Dumbbell, Brain, Trophy, HeartPulse, UserRound, ChevronRight, FileText } from "lucide-react";
import { PROFILE_META, type ProfessionalType } from "@/lib/professionalTypes";

type CoachInfo = {
  id: string;
  professional_name: string | null;
  professional_type: ProfessionalType | null;
  unique_code: string | null;
  clinic_name: string | null;
};

type PlanRow = {
  id: string;
  patient_name: string;
  objetivo: string | null;
  status: string;
  sent_at: string | null;
  created_at: string;
};

const ICONS: Record<string, any> = {
  nutritionist: Stethoscope,
  personal_trainer: Dumbbell,
  nutrition_coach: Brain,
  bodybuilding_coach: Trophy,
  medico: HeartPulse,
};

const MyProfessionalCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coach, setCoach] = useState<CoachInfo | null>(null);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("coach_profile_id, role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.coach_profile_id) {
        setLoading(false);
        return;
      }

      const { data: cp } = await supabase
        .from("coach_profiles")
        .select("id, professional_name, professional_type, unique_code, clinic_name")
        .eq("id", profile.coach_profile_id)
        .maybeSingle();

      if (cp) setCoach(cp as CoachInfo);

      const { data: plansData } = await supabase
        .from("coach_meal_plans")
        .select("id, patient_name, objetivo, status, sent_at, created_at")
        .eq("patient_user_id", user.id)
        .in("status", ["sent", "active"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (plansData) setPlans(plansData as PlanRow[]);
      setLoading(false);
    })();
  }, [user]);

  if (loading || !coach) return null;

  const meta = coach.professional_type ? PROFILE_META[coach.professional_type] : null;
  const Icon = coach.professional_type ? ICONS[coach.professional_type] ?? UserRound : UserRound;

  return (
    <div className="space-y-3 mb-4">
      {/* MEU PROFISSIONAL */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Meu Profissional
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {coach.professional_name || "Profissional"}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {meta && (
                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                    {meta.label}
                  </Badge>
                )}
                {coach.clinic_name && (
                  <span className="text-[10px] text-muted-foreground truncate">
                    {coach.clinic_name}
                  </span>
                )}
              </div>
              {coach.unique_code && (
                <p className="text-[9px] font-mono text-muted-foreground mt-1">
                  {coach.unique_code}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PLANOS RECEBIDOS */}
      {plans.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Planos Recebidos
              </p>
              <Badge variant="secondary" className="text-[9px]">{plans.length}</Badge>
            </div>
            <div className="space-y-2">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => navigate("/meal-plan")}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                >
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {plan.objetivo || "Plano Alimentar"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(plan.sent_at || plan.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyProfessionalCard;
