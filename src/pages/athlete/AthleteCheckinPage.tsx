import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, Scale, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { useProgressPhotos } from "@/hooks/useProgressPhotos";
import { useToast } from "@/hooks/use-toast";
import AthleteBottomNav from "@/components/athlete/AthleteBottomNav";

const BG = "#020205";
const GOLD = "#FFD700";
const TEXT = "#FFFFFF";
const DIM = "#A0A0A0";

const SLIDERS: { key: string; label: string }[] = [
  { key: "adherence_diet", label: "Adesão à dieta" },
  { key: "adherence_training", label: "Adesão ao treino" },
  { key: "adherence_sleep", label: "Qualidade do sono" },
  { key: "adherence_energy", label: "Energia" },
  { key: "adherence_stress", label: "Estresse" },
  { key: "adherence_hunger", label: "Fome" },
];

const mondayOf = (d = new Date()) => {
  const x = new Date(d);
  const diff = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - diff);
  return x.toISOString().slice(0, 10);
};

const AthleteCheckinPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addLog, latestWeight } = useWeightLogs();
  const { uploadPhoto, uploading } = useProgressPhotos();

  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(SLIDERS.map((s) => [s.key, 3]))
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Check-in · NUTRION";
  }, []);

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const w = weight ? Number(weight) : null;
      if (w) await addLog(w);
      if (photo) await uploadPhoto(photo, { weight_kg: w ?? undefined, notes });

      const { error } = await supabase.from("weekly_checkins" as any).upsert(
        {
          user_id: user.id,
          week_start: mondayOf(),
          weight_kg: w,
          ...scores,
          notes: notes || null,
        } as any,
        { onConflict: "user_id,week_start" }
      );
      if (error) throw error;

      toast({ title: "✅ Check-in enviado", description: "Seu coach já pode ver seus dados." });
      navigate("/dashboard");
    } catch (e: any) {
      toast({
        title: "Erro ao enviar check-in",
        description: e?.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: BG, color: TEXT }}>
      <header className="px-4 pt-6 pb-4 max-w-2xl mx-auto flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.05)" }}
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4" style={{ color: DIM }} />
        </button>
        <div>
          <h1 className="text-xl font-black">Check-in</h1>
          <p className="text-[11px]" style={{ color: DIM }}>
            Peso, foto e percepções — enviado direto ao seu coach
          </p>
        </div>
      </header>

      <main className="px-4 max-w-2xl mx-auto space-y-3">
        <section
          className="rounded-2xl p-4"
          style={{ border: `1px solid ${GOLD}22`, background: `${GOLD}08` }}
        >
          <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: GOLD }}>
            <Scale className="w-4 h-4" /> Peso de hoje
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={latestWeight ? `${latestWeight} kg` : "kg"}
            className="mt-3 w-full rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none"
            style={{ border: "1px solid rgba(255,255,255,0.12)", color: TEXT }}
          />
        </section>

        <section
          className="rounded-2xl p-4"
          style={{ border: `1px solid ${GOLD}22`, background: `${GOLD}08` }}
        >
          <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: GOLD }}>
            <Camera className="w-4 h-4" /> Foto de progresso (opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="mt-3 w-full text-xs"
            style={{ color: DIM }}
          />
        </section>

        <section
          className="rounded-2xl p-4 space-y-4"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: DIM }}>
            Como foi a semana? (1 a 5)
          </p>
          {SLIDERS.map((s) => (
            <div key={s.key}>
              <div className="flex justify-between text-xs mb-1">
                <span>{s.label}</span>
                <span className="font-mono" style={{ color: GOLD }}>{scores[s.key]}</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={scores[s.key]}
                onChange={(e) => setScores((p) => ({ ...p, [s.key]: Number(e.target.value) }))}
                className="w-full"
                style={{ accentColor: GOLD }}
              />
            </div>
          ))}
        </section>

        <section
          className="rounded-2xl p-4"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
        >
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: DIM }}>
            Observações para o coach
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Dificuldades, dores, eventos sociais..."
            className="mt-3 w-full rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none resize-none"
            style={{ border: "1px solid rgba(255,255,255,0.12)", color: TEXT }}
          />
        </section>

        <button
          onClick={submit}
          disabled={saving || uploading}
          className="w-full rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: GOLD, color: "#1a1200" }}
        >
          {saving || uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Enviar check-in
        </button>
      </main>

      <AthleteBottomNav />
    </div>
  );
};

export default AthleteCheckinPage;
