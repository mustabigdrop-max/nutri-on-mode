import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Loader2, Trophy } from "lucide-react";
import { levelBadge, medal } from "@/lib/challenge";

type Row = { full_name: string; mce_score: number; streak: number; position: number };

export default function ChallengePublicRankingPage() {
  const { slug = "" } = useParams();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    supabase
      .rpc("get_challenge_ranking_public", { _slug: slug })
      .then(({ data }) => setRows((data as Row[]) ?? []));
  }, [slug]);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.4em] text-muted-foreground">N U T R I O N</p>
          <h1 className="mt-1 flex items-center justify-center gap-2 text-2xl font-black">
            <Trophy className="w-6 h-6 text-primary" /> RANKING PÚBLICO
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Desafio 90 Dias · Transformação é sistema.</p>
        </div>

        {rows === null ? (
          <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : rows.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Ranking ainda não iniciado.</p>
        ) : (
          rows.map((r) => {
            const badge = levelBadge(r.mce_score);
            return (
              <Card key={`${r.position}-${r.full_name}`}>
                <CardContent className="p-3 flex items-center gap-3">
                  <span className="w-8 text-center text-sm font-bold">{medal(r.position)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">{r.full_name}</p>
                    <p className="text-[11px]" style={{ color: badge.color }}>{badge.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">MCE {r.mce_score}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center justify-end gap-1">
                      <Flame className="w-3 h-3 text-orange-400" /> {r.streak}d
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}

        <Button asChild className="w-full h-12 font-bold">
          <Link to={`/desafio/${slug}`}>🚀 Entrar no desafio</Link>
        </Button>
      </div>
    </div>
  );
}
