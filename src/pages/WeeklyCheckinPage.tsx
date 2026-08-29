import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { runSelfAnalysis } from "@/hooks/useProtocolSuggestions";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

function getMonday(d = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().slice(0, 10);
}

const SYMPTOM_OPTIONS = ["cansaço", "queda capilar", "libido baixa", "ansiedade", "retenção hídrica"];

const ADHERENCE_FIELDS: { k: string; label: string }[] = [
  { k: "adherence_diet", label: "Dieta" },
  { k: "adherence_training", label: "Treino" },
  { k: "adherence_sleep", label: "Sono" },
  { k: "adherence_stress", label: "Estresse" },
  { k: "adherence_energy", label: "Energia" },
  { k: "adherence_hunger", label: "Fome" },
];

const STEPS = ["Peso & Medidas", "Aderência", "Digestão", "Notas"];

const WeeklyCheckinPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    weight_kg: "",
    waist_cm: "",
    hip_cm: "",
    arm_cm: "",
    adherence_diet: 7,
    adherence_training: 7,
    adherence_sleep: 7,
    adherence_stress: 5,
    adherence_energy: 7,
    adherence_hunger: 5,
    bristol_scale: 4,
    bloating_days: 0,
    symptoms: [] as string[],
    notes: "",
  });

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const toggleSymptom = (s: string) => {
    set("symptoms", form.symptoms.includes(s)
      ? form.symptoms.filter((x: string) => x !== s)
      : [...form.symptoms, s]);
  };

  const uploadPhoto = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("checkin-photos").upload(path, file);
    if (error) {
      toast({ title: "Erro upload", description: error.message, variant: "destructive" });
    } else {
      setPhotoUrl(path);
      toast({ title: "Foto enviada" });
    }
    setUploading(false);
  };

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    const week_start = getMonday();

    // calc weight delta vs last checkin
    const { data: prev } = await supabase
      .from("weekly_checkins" as any)
      .select("weight_kg")
      .eq("user_id", user.id)
      .lt("week_start", week_start)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    const w = parseFloat(form.weight_kg);
    const prevW = (prev as any)?.weight_kg ? parseFloat((prev as any).weight_kg) : null;
    const weight_delta_kg = !isNaN(w) && prevW != null ? +(w - prevW).toFixed(2) : null;

    const payload: any = {
      user_id: user.id,
      week_start,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      waist_cm: form.waist_cm ? Number(form.waist_cm) : null,
      hip_cm: form.hip_cm ? Number(form.hip_cm) : null,
      arm_cm: form.arm_cm ? Number(form.arm_cm) : null,
      adherence_diet: form.adherence_diet,
      adherence_training: form.adherence_training,
      adherence_sleep: form.adherence_sleep,
      adherence_stress: form.adherence_stress,
      adherence_energy: form.adherence_energy,
      adherence_hunger: form.adherence_hunger,
      bristol_scale: form.bristol_scale,
      bloating_days: form.bloating_days,
      symptoms: form.symptoms,
      notes: form.notes,
      photo_front_url: photoUrl,
      weight_delta_kg,
    };

    const { error } = await supabase
      .from("weekly_checkins" as any)
      .upsert(payload, { onConflict: "user_id,week_start" });
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
      return;
    }
    void runSelfAnalysis(user.id);
    toast({ title: "✅ Check-in enviado!", description: "Seu coach vai responder em até 24h" });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach/dashboard")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">Check-in da Semana</h1>
            <p className="text-sm text-muted-foreground">Etapa {step + 1} de {STEPS.length} — {STEPS[step]}</p>
          </div>
        </div>

        {/* progress */}
        <div className="flex gap-1 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {step === 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["weight_kg", "Peso (kg)"],
                      ["waist_cm", "Cintura (cm)"],
                      ["hip_cm", "Quadril (cm)"],
                      ["arm_cm", "Braço (cm)"],
                    ].map(([k, l]) => (
                      <div key={k}>
                        <Label>{l}</Label>
                        <Input type="number" step="0.1" value={form[k]} onChange={(e) => set(k, e.target.value)} />
                      </div>
                    ))}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    {ADHERENCE_FIELDS.map((f) => (
                      <div key={f.k}>
                        <div className="flex justify-between mb-1">
                          <Label>{f.label}</Label>
                          <span className="text-sm font-semibold text-primary">{form[f.k]}/10</span>
                        </div>
                        <Slider min={1} max={10} step={1} value={[form[f.k]]} onValueChange={(v) => set(f.k, v[0])} />
                      </div>
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <Label>Bristol Scale (1 = duro, 7 = líquido)</Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                          <button
                            key={n}
                            onClick={() => set("bristol_scale", n)}
                            className={`flex-1 aspect-square rounded-lg border-2 font-semibold transition-colors ${
                              form.bristol_scale === n
                                ? "border-primary bg-primary/20 text-primary"
                                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                            }`}
                          >{n}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Dias com inchaço (0–7)</Label>
                      <Input type="number" min={0} max={7} value={form.bloating_days}
                        onChange={(e) => set("bloating_days", parseInt(e.target.value || "0"))} />
                    </div>
                    <div>
                      <Label>Sintomas</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {SYMPTOM_OPTIONS.map((s) => {
                          const active = form.symptoms.includes(s);
                          return (
                            <button
                              key={s}
                              onClick={() => toggleSymptom(s)}
                              className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                                active
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted/30 border-border text-muted-foreground hover:border-primary/40"
                              }`}
                            >{s}</button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Notas livres</Label>
                      <Textarea
                        value={form.notes}
                        onChange={(e) => set("notes", e.target.value.slice(0, 2000))}
                        placeholder="Como foi sua semana? Qualquer observação importante..."
                        rows={5}
                      />
                    </div>
                    <div>
                      <Label>Foto frontal (opcional)</Label>
                      <div className="mt-2 flex items-center gap-3">
                        <label className="flex-1 cursor-pointer border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                          <input
                            type="file" accept="image/*" className="hidden"
                            onChange={(e) => { if (e.target.files?.[0]) uploadPhoto(e.target.files[0]); }}
                          />
                          {uploading ? (
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                          ) : photoUrl ? (
                            <span className="text-sm text-primary flex items-center justify-center gap-2"><Check className="h-4 w-4" /> Foto enviada</span>
                          ) : (
                            <span className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Upload className="h-4 w-4" /> Selecionar foto</span>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-6 pt-4 border-t border-border">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Próximo <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={submit} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Enviar Check-in
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyCheckinPage;
