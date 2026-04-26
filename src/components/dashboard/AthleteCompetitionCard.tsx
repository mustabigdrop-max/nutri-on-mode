import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, ChevronRight, Scale } from "lucide-react";

interface Plan {
  id: string;
  nome_competicao: string;
  data_competicao: string;
  semana_atual: number;
  bloco_atual?: string;
  peso_atual: number;
  peso_alvo_palco: number;
  blocos: any[];
  status: string;
}

const AthleteCompetitionCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("competition_plans")
        .select("id,nome_competicao,data_competicao,semana_atual,bloco_atual,peso_atual,peso_alvo_palco,blocos,status")
        .eq("athlete_id", user.id)
        .eq("status", "active")
        .order("data_competicao", { ascending: true });
      setPlans((data as any) || []);
    })();
  }, [user]);

  if (plans.length === 0) return null;

  return (
    <div className="space-y-3">
      {plans.map((p) => {
        const dias = Math.ceil(
          (new Date(p.data_competicao).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        );
        const bloco = p.blocos?.find(
          (b: any) =>
            p.semana_atual >= b.semana_inicio && p.semana_atual <= b.semana_fim
        );
        return (
          <Card
            key={p.id}
            className="bg-gradient-to-br from-primary/15 via-card to-card border-primary/30 cursor-pointer hover:border-primary/50 transition-all"
            onClick={() =>
              navigate(`/athlete/competition/${p.id}/check-in`)
            }
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {p.nome_competicao}
                    </h3>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {dias > 0 ? `${dias}d` : "Hoje"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Semana {p.semana_atual}
                    </Badge>
                    {bloco && (
                      <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                        {bloco.nome}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      <Scale className="h-3 w-3 mr-1" />
                      {p.peso_atual} → {p.peso_alvo_palco}kg
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/athlete/competition/${p.id}/check-in`);
                    }}
                  >
                    Fazer check-in da semana {p.semana_atual}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AthleteCompetitionCard;
