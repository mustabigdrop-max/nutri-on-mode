import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Trophy } from "lucide-react";
import { levelBadge, medal } from "@/lib/challenge";

type Row = { display_name: string; mce_score: number; streak: number; rank_position: number; tier: string };

export default function WallDisplayPage() {
  const { slug = "" } = useParams();
  const [rows, setRows] = useState<Row[]>([]);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const fetchRows = () =>
      supabase
        .rpc("get_challenge_ranking_public", { _slug: slug })
        .then(({ data }) => setRows(((data as Row[]) ?? []).slice(0, 10)));
    fetchRows();
    const poll = setInterval(fetchRows, 30000);
    const tick = setInterval(() => setClock(new Date()), 1000);
    return () => { clearInterval(poll); clearInterval(tick); };
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#03030a] text-foreground overflow-hidden px-10 py-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm tracking-[0.5em] text-muted-foreground">N U T R I O N</p>
          <h1 className="mt-1 flex items-center gap-3 text-5xl font-black">
            <Trophy className="w-10 h-10 text-primary" /> THE WALL
          </h1>
          <p className="mt-1 text-lg text-primary font-semibold">Desafio 90 Dias · Transformação é sistema.</p>
        </div>
        <p className="text-4xl font-black tabular-nums text-muted-foreground">
          {clock.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {rows.map((r) => {
          const badge = levelBadge(r.mce_score);
          return (
            <div
              key={`${r.rank_position}-${r.display_name}`}
              className="flex items-center gap-6 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4"
            >
              <span className="w-16 text-center text-3xl font-black">{medal(r.rank_position)}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-3xl font-black">{r.display_name}</p>
                <p className="text-base font-semibold" style={{ color: badge.color }}>{badge.label}</p>
              </div>
              <p className="text-2xl font-bold text-muted-foreground flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-400" /> {r.streak}d
              </p>
              <p className="w-40 text-right text-4xl font-black text-primary">{r.mce_score}</p>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="py-20 text-center text-2xl text-muted-foreground">Aguardando os primeiros check-ins…</p>
        )}
      </div>
    </div>
  );
}
