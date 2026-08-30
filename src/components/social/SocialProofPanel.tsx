import { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Download, Copy, Rocket } from "lucide-react";
import { toast } from "sonner";
import { isMobileDevice, saveImage } from "@/lib/socialImageKit";
import { ACCENT, ACCENT2, Section, callSocialAI, copyText } from "./socialUi";

type Athlete = { userId: string; name: string };

type Stats = {
  name: string;
  weeks: number;
  startWeight: number | null;
  currentWeight: number | null;
  mceStart: number | null;
  mceNow: number | null;
  adherence: number | null;
  workouts: number;
  streak: number;
};

const SocialProofPanel = ({
  coachProfileId,
  coachAvatar,
  ctx,
}: {
  coachProfileId?: string | null;
  // Não usados na renderização do card: nem @handle nem nome do coach
  // aparecem na imagem exportada (só o resultado do cliente).
  handle?: string;
  coachName?: string | null;
  coachAvatar?: string | null;
  ctx: Record<string, any>;
}) => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (!coachProfileId) return;
      const { data: links } = await supabase
        .from("coach_patients")
        .select("patient_user_id")
        .eq("coach_id", coachProfileId)
        .eq("status", "active");
      const ids = (links || []).map((l) => l.patient_user_id).filter(Boolean) as string[];
      if (!ids.length) return setAthletes([]);
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
      setAthletes((profs || []).map((p) => ({ userId: p.user_id as string, name: (p.full_name as string) || "Atleta" })));
    })();
  }, [coachProfileId]);

  const load = useCallback(async (uid: string) => {
    setBusy("load");
    setCaption(null);
    try {
      const [{ data: prof }, { data: weights }, { data: mce }, { data: checkins }, { data: workouts }] = await Promise.all([
        supabase.from("profiles").select("full_name, weight_kg, streak_days").eq("user_id", uid).maybeSingle(),
        supabase.from("weight_logs").select("weight_kg, logged_at").eq("user_id", uid).order("logged_at", { ascending: true }),
        supabase.from("mce_scores").select("score_m, score_c, score_e, created_at").eq("user_id", uid).order("created_at", { ascending: true }),
        supabase.from("weekly_checkins").select("created_at, weight_kg").eq("user_id", uid).order("created_at", { ascending: true }),
        supabase.from("workout_logs").select("day_number, week_number").eq("athlete_id", uid),
      ]);

      const w = (weights || []) as any[];
      const ck = (checkins || []) as any[];
      const m = (mce || []) as any[];
      const avg = (r: any) => Math.round(((r.score_m || 0) + (r.score_c || 0) + (r.score_e || 0)) / 3);
      const firstDate = w[0]?.logged_at || ck[0]?.created_at || m[0]?.created_at;
      const weeks = firstDate ? Math.max(1, Math.round((Date.now() - new Date(firstDate).getTime()) / 604800000)) : 0;

      setStats({
        name: (prof?.full_name as string) || "Atleta",
        weeks,
        startWeight: w[0]?.weight_kg ?? ck[0]?.weight_kg ?? null,
        currentWeight: w[w.length - 1]?.weight_kg ?? (prof?.weight_kg as number) ?? null,
        mceStart: m.length ? avg(m[0]) : null,
        mceNow: m.length ? avg(m[m.length - 1]) : null,
        adherence: m.length ? Math.min(100, avg(m[m.length - 1])) : null,
        workouts: new Set(((workouts || []) as any[]).map((w) => `${w.week_number}-${w.day_number}`)).size,
        streak: (prof?.streak_days as number) || 0,
      });
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(null); }
  }, []);

  const download = async () => {
    if (!cardRef.current) return;
    if (!authorized) return toast.error("Confirme a autorização do cliente");
    const canvas = await html2canvas(cardRef.current, { backgroundColor: "#020205", scale: 3, useCORS: true });
    const filename = `nutrion-resultado-${(stats?.name || "cliente").toLowerCase().replace(/\s+/g, "-")}.png`;
    const saved = await saveImage(canvas.toDataURL("image/png"), filename);
    if (saved) toast.success(isMobileDevice() ? 'Toque em "Salvar imagem" para ir pra galeria' : `${filename} baixado!`);
    else toast.error("Não consegui salvar o card");
  };

  const genCaption = async () => {
    if (!stats) return;
    setBusy("cap");
    try {
      const r = await callSocialAI({ mode: "proof_caption", proof: JSON.stringify(stats), ...ctx });
      setCaption([r?.caption, (r?.hashtags || []).join(" ")].filter(Boolean).join("\n\n"));
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  const delta = stats?.startWeight != null && stats?.currentWeight != null
    ? Math.round((stats.currentWeight - stats.startWeight) * 10) / 10 : null;

  return (
    <div className="space-y-4">
      <Section title="📸 Gerador de prova social">
        <p className="text-sm text-muted-foreground">Puxa os dados reais do cliente e monta o card 1080×1080.</p>
        <select
          className="w-full h-10 rounded-md bg-transparent border px-3 text-sm"
          style={{ borderColor: `${ACCENT}44` }}
          value={selected}
          onChange={(e) => { setSelected(e.target.value); if (e.target.value) load(e.target.value); }}
        >
          <option value="">Selecione o cliente…</option>
          {athletes.map((a) => <option key={a.userId} value={a.userId} className="bg-background">{a.name}</option>)}
        </select>
        {busy === "load" && <p className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Carregando dados…</p>}
      </Section>

      {stats && (
        <>
          <div className="flex justify-center">
            <div ref={cardRef} className="w-[340px] h-[340px] p-6 flex flex-col justify-between"
              style={{ background: "#020205", border: `1px solid ${ACCENT}55` }}>
              <div>
                <div className="w-9 h-1.5 rounded-full mb-3" style={{ background: ACCENT }} />
                <p className="text-lg font-bold text-white">RESULTADO REAL 📊</p>
                <p className="text-xs text-white/60 mt-1">
                  {stats.name.split(" ")[0]} {stats.name.split(" ")[1]?.[0] ? `${stats.name.split(" ")[1][0]}.` : ""} · {stats.weeks} semanas
                </p>
              </div>
              <div className="space-y-1.5 text-sm text-white">
                {stats.startWeight != null && stats.currentWeight != null && (
                  <p>Peso: {stats.startWeight}kg → {stats.currentWeight}kg {delta != null && <span style={{ color: ACCENT2 }}>({delta > 0 ? "+" : ""}{delta}kg)</span>}</p>
                )}
                {stats.mceStart != null && <p>MCE Score: {stats.mceStart} → {stats.mceNow}</p>}
                {stats.adherence != null && <p>Aderência: {stats.adherence}%</p>}
                <p>Treinos: {stats.workouts} concluídos</p>
                <p>Streak: {stats.streak} dias 🔥</p>
              </div>
              {coachAvatar && (
                <div className="flex items-center gap-2">
                  <img
                    src={coachAvatar}
                    alt="Foto de perfil do coach"
                    crossOrigin="anonymous"
                    className="w-8 h-8 rounded-full object-cover"
                    style={{ border: `1px solid ${ACCENT}77` }}
                  />
                </div>
              )}
            </div>
          </div>

          <Section title="Publicação">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={authorized} onCheckedChange={(v) => setAuthorized(!!v)} />
              Cliente autorizou o uso dos dados
            </label>
            <p className="text-[11px] text-amber-400">⚠️ Pedir autorização do cliente antes de postar.</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="gap-2" style={{ background: ACCENT }} onClick={download}>
                <Download className="w-3 h-3" /> Baixar PNG
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={genCaption} disabled={busy === "cap"}>
                {busy === "cap" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Rocket className="w-3 h-3" />} Gerar legenda
              </Button>
            </div>
            {caption && (
              <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: `${ACCENT}44` }}>
                <p className="text-sm whitespace-pre-wrap">{caption}</p>
                <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(caption)}><Copy className="w-3 h-3" /> Copiar</Button>
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
};

export default SocialProofPanel;
