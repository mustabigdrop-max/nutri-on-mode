import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trophy, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Athlete {
  id: string;
  nome: string;
  categoria: string | null;
  data_competicao: string | null;
  fase_atual: string | null;
  peso_kg: number | null;
  bf_atual: number | null;
  total_avaliacoes?: number;
  ultimo_score?: number | null;
  ultimo_peso?: number | null;
  ultimo_bf?: number | null;
}

const diasAteCompeticao = (data: string | null) => {
  if (!data) return null;
  const diff = Math.ceil((new Date(data).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
};

export default function AthleteRoster() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [atletas, setAtletas] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("athlete_progress_summary" as any)
          .select("*")
          .eq("coach_id", user.id);
        if (error) throw error;
        setAtletas((data as any) || []);
      } catch (e: any) {
        // fallback para tabela base
        const { data } = await supabase
          .from("competition_athletes" as any)
          .select("*")
          .eq("coach_id", user.id)
          .eq("ativo", true);
        setAtletas((data as any) || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const novoAtleta = async () => {
    const nome = prompt("Nome do atleta:");
    if (!nome || !user) return;
    const categoria = prompt("Categoria (ex.: Men's Physique, Bikini):") || null;
    const dataComp = prompt("Data da competição (YYYY-MM-DD) ou vazio:") || null;
    try {
      const { error } = await supabase.from("competition_athletes" as any).insert({
        coach_id: user.id,
        nome,
        categoria,
        data_competicao: dataComp,
        fase_atual: "off-season",
        ativo: true,
      });
      if (error) throw error;
      toast.success("Atleta adicionado");
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/coach/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <Button onClick={novoAtleta} className="bg-primary">
            <Plus className="w-4 h-4 mr-2" /> Novo atleta
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-7 h-7 text-primary" /> APEX Visual Coach
          </h1>
          <p className="text-muted-foreground">Gestão fotográfica e periodização de atletas de competição</p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Carregando atletas...</p>
        ) : atletas.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum atleta cadastrado</h3>
            <p className="text-muted-foreground mb-4">Comece adicionando seu primeiro atleta de competição.</p>
            <Button onClick={novoAtleta}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar atleta
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {atletas.map((a) => {
              const dias = diasAteCompeticao(a.data_competicao);
              const urgente = dias !== null && dias > 0 && dias <= 56;
              return (
                <Card
                  key={a.id}
                  className="p-5 cursor-pointer hover:border-primary transition-all"
                  onClick={() => navigate(`/coach/atletas/${a.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{a.nome}</h3>
                      {a.categoria && <p className="text-xs text-muted-foreground">{a.categoria}</p>}
                    </div>
                    {urgente && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="w-3 h-3" /> {dias}d
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    {a.fase_atual && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fase</span>
                        <Badge variant="outline">{a.fase_atual}</Badge>
                      </div>
                    )}
                    {a.data_competicao && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Palco
                        </span>
                        <span className="font-medium">
                          {dias !== null && dias > 0 ? `${dias} dias` : "—"}
                        </span>
                      </div>
                    )}
                    {(a.ultimo_peso ?? a.peso_kg) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Peso</span>
                        <span className="font-medium">{a.ultimo_peso ?? a.peso_kg} kg</span>
                      </div>
                    )}
                    {(a.ultimo_bf ?? a.bf_atual) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">BF</span>
                        <span className="font-medium">{a.ultimo_bf ?? a.bf_atual}%</span>
                      </div>
                    )}
                    {a.ultimo_score != null && (
                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Score
                        </span>
                        <span className="font-bold text-primary">{a.ultimo_score}</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
