import { useEffect, useState } from "react";
import { ChallengeHeader } from "@/components/challenge/ChallengeLayout";
import { useChallenge } from "@/hooks/useChallenge";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Loader2 } from "lucide-react";
import { CHALLENGE_DAYS, challengeDay, challengePhase, levelBadge, medal } from "@/lib/challenge";
import { cn } from "@/lib/utils";

type Row = { id: string; full_name: string; mce_score: number; streak: number; tier: string; user_id: string };
type SortKey = "mce_score" | "streak";

export default function ChallengeRankingPage() {
  const { participant, challenge } = useChallenge();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [sort, setSort] = useState<SortKey>("mce_score");

  useEffect(() => {
    if (!participant) return;
    supabase
      .from("challenge_participants")
      .select("id,full_name,mce_score,streak,tier,user_id")
      .eq("challenge_id", participant.challenge_id)
      .eq("status", "active")
      .order(sort, { ascending: false })
      .limit(200)
      .then(({ data }) => setRows((data as Row[]) ?? []));
  }, [participant, sort]);

  if (!participant) return null;
  const day = challengeDay(challenge?.start_date);
  const phase = challengePhase(day);

  return (
    <div className="mx-auto max-w-lg">
      <ChallengeHeader
        title="🏆 Ranking"
        subtitle={`Dia ${day}/${CHALLENGE_DAYS} · ${phase.name} · ${CHALLENGE_DAYS - day} dias restantes`}
      />

      <div className="px-4 space-y-3">
        <div className="flex gap-2">
          {([["mce_score", "MCE Score"], ["streak", "Streak"]] as [SortKey, string][]).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              className={cn(
                "flex-1 rounded-lg border px-3 py-1.5 text-xs font-semibold",
                sort === k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {rows === null ? (
          <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : (
          rows.map((r, i) => {
            const badge = levelBadge(r.mce_score);
            const me = r.user_id === participant.user_id;
            return (
              <Card key={r.id} className={cn(me && "border-primary bg-primary/10")}>
                <CardContent className="p-3 flex items-center gap-3">
                  <span className="w-8 text-center text-sm font-bold">{medal(i + 1)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {r.full_name || "Participante"} {me && <span className="text-[10px] text-primary">· você</span>}
                    </p>
                    <p className="text-[11px]" style={{ color: badge.color }}>{badge.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">MCE {r.mce_score}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end">
                      <Flame className="w-3 h-3 text-orange-400" /> {r.streak}d
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        <div className="pb-4" />
      </div>
    </div>
  );
}
