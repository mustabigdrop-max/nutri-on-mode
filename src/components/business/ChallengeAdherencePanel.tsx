import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Activity, CalendarRange, Loader2, Flame } from "lucide-react";
import {
  PERIOD_PRESETS, adherenceSummary, buildPeriod, dailyAdherence, fmtDay,
  participantAdherence, previousPeriod, todayISO,
  type AdherenceLogLite, type AdherenceParticipantLite, type PeriodPresetId,
} from "@/lib/challengeAdherence";

type ChallengeLite = { id: string; name: string; start_date: string; end_date: string };

const Bar = ({ pct, tone }: { pct: number; tone: "amber" | "emerald" }) => (
  <div className="h-1.5 rounded-full bg-muted overflow-hidden w-full">
    <div
      className={`h-full rounded-full ${tone === "amber" ? "bg-amber-500" : "bg-emerald-500"}`}
      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
    />
  </div>
);

export default function ChallengeAdherencePanel() {
  const [challenges, setChallenges] = useState<ChallengeLite[] | null>(null);
  const [challengeId, setChallengeId] = useState<string>("");
  const [participants, setParticipants] = useState<AdherenceParticipantLite[]>([]);
  const [logs, setLogs] = useState<AdherenceLogLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [preset, setPreset] = useState<PeriodPresetId>("7d");
  const [custom, setCustom] = useState({ start: todayISO(), end: todayISO() });
  const [view, setView] = useState<"atletas" | "datas">("atletas");

  useEffect(() => {
    supabase
      .from("gym_challenges")
      .select("id,name,start_date,end_date")
      .order("start_date", { ascending: false })
      .then(({ data }) => {
        const list = (data as ChallengeLite[]) ?? [];
        setChallenges(list);
        setChallengeId((prev) => prev || list[0]?.id || "");
      });
  }, []);

  const challenge = useMemo(
    () => challenges?.find((c) => c.id === challengeId) ?? null,
    [challenges, challengeId],
  );

  const load = useCallback(async () => {
    if (!challengeId) return;
    setLoading(true);
    const [{ data: parts }, { data: dl }] = await Promise.all([
      supabase
        .from("challenge_participants")
        .select("id,user_id,full_name,tier,streak,mce_score")
        .eq("challenge_id", challengeId)
        .eq("status", "active"),
      supabase
        .from("challenge_daily_logs")
        .select("user_id,log_date,day_completed,checkin_at,points")
        .eq("challenge_id", challengeId),
    ]);
    setParticipants(
      ((parts as any[]) ?? []).map((p) => ({
        id: p.id, user_id: p.user_id, full_name: p.full_name,
        tier: p.tier ?? "free", streak: p.streak ?? 0, mce_score: p.mce_score ?? 0,
      })),
    );
    setLogs(((dl as any[]) ?? []) as AdherenceLogLite[]);
    setLoading(false);
  }, [challengeId]);

  useEffect(() => { load(); }, [load]);

  const range = useMemo(
    () => (challenge ? buildPeriod(preset, challenge, custom) : null),
    [challenge, preset, custom],
  );

  const rows = useMemo(
    () => (range ? participantAdherence(participants, logs, range) : []),
    [participants, logs, range],
  );
  const prevRows = useMemo(
    () => (range ? participantAdherence(participants, logs, previousPeriod(range)) : []),
    [participants, logs, range],
  );
  const days = useMemo(
    () => (range ? dailyAdherence(participants, logs, range).slice().reverse() : []),
    [participants, logs, range],
  );

  const now = adherenceSummary(rows);
  const before = adherenceSummary(prevRows);
  const sig = (n: number) => `${n > 0 ? "+" : ""}${n}`;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-500" /> Aderência do desafio
          </p>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Select value={challengeId} onValueChange={setChallengeId}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Desafio" /></SelectTrigger>
            <SelectContent>
              {(challenges ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={preset} onValueChange={(v) => setPreset(v as PeriodPresetId)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>
              {PERIOD_PRESETS.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
              <SelectItem value="custom">Período personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {preset === "custom" && (
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" className="h-9 text-xs" value={custom.start}
              onChange={(e) => setCustom({ ...custom, start: e.target.value })} />
            <Input type="date" className="h-9 text-xs" value={custom.end}
              onChange={(e) => setCustom({ ...custom, end: e.target.value })} />
          </div>
        )}

        {!challenges?.length && (
          <p className="text-xs text-muted-foreground">Crie um desafio para acompanhar a aderência.</p>
        )}

        {range && (
          <>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5" />
              {fmtDay(range.start)} a {fmtDay(range.end)} · {rows.length} participantes
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { l: "Taxa de check-in", v: `${now.checkinRate}%`, d: now.checkinRate - before.checkinRate },
                { l: "Conclusão do dia", v: `${now.completionRate}%`, d: now.completionRate - before.completionRate },
                { l: "Pontos médios", v: String(now.avgPoints), d: now.avgPoints - before.avgPoints },
                { l: "Sem nenhum check-in", v: String(now.zeroCheckin), d: now.zeroCheckin - before.zeroCheckin },
              ].map((s) => (
                <div key={s.l} className="rounded-lg border border-border p-2 text-center">
                  <p className="text-lg font-bold tabular-nums">{s.v}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">{s.l}</p>
                  <p className={`text-[10px] tabular-nums ${s.d > 0 ? "text-emerald-500" : s.d < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    {sig(s.d)} vs. período anterior
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {(["atletas", "datas"] as const).map((v) => (
                <Button key={v} size="sm" variant={view === v ? "default" : "outline"}
                  className="h-7 text-[11px] capitalize" onClick={() => setView(v)}>
                  {v === "atletas" ? "Ranking por atleta" : "Por data"}
                </Button>
              ))}
            </div>

            {view === "atletas" && (
              <div className="space-y-2">
                {rows.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum participante ativo neste desafio.</p>
                )}
                {rows.map((r, i) => (
                  <div key={r.participant_id} className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-5 text-muted-foreground tabular-nums">{i + 1}.</span>
                      <span className="flex-1 truncate">{r.full_name}</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />{r.streak}d
                      </span>
                      <span className="tabular-nums text-amber-500 font-semibold w-10 text-right">{r.checkinRate}%</span>
                      <span className="tabular-nums text-emerald-500 font-semibold w-10 text-right">{r.completionRate}%</span>
                    </div>
                    <div className="flex gap-1 pl-7">
                      <Bar pct={r.checkinRate} tone="amber" />
                      <Bar pct={r.completionRate} tone="emerald" />
                    </div>
                    <p className="pl-7 text-[10px] text-muted-foreground">
                      {r.checkins}/{r.expected} check-ins · {r.completions} dias concluídos · {r.avgPoints} pts médios
                    </p>
                  </div>
                ))}
              </div>
            )}

            {view === "datas" && (
              <div className="space-y-1.5">
                {days.map((d) => (
                  <div key={d.date} className="flex items-center gap-2 text-xs">
                    <span className="w-12 text-muted-foreground tabular-nums">{fmtDay(d.date)}</span>
                    <div className="flex-1 flex gap-1">
                      <Bar pct={d.checkinRate} tone="amber" />
                      <Bar pct={d.completionRate} tone="emerald" />
                    </div>
                    <span className="tabular-nums text-amber-500 w-10 text-right">{d.checkinRate}%</span>
                    <span className="tabular-nums text-emerald-500 w-10 text-right">{d.completionRate}%</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[10px] text-muted-foreground">
              <span className="text-amber-500">Âmbar</span> = fez check-in ·{" "}
              <span className="text-emerald-500">Verde</span> = concluiu o dia
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
