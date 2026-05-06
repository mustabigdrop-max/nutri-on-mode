import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, Minus, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface CheckIn {
  id: string;
  user_id: string;
  week_start: string;
  weight_kg: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  arm_cm: number | null;
  adherence_diet: number | null;
  adherence_training: number | null;
  adherence_sleep: number | null;
  adherence_stress: number | null;
  adherence_energy: number | null;
  adherence_hunger: number | null;
  bristol_scale: number | null;
  bloating_days: number | null;
  symptoms: string[] | null;
  notes: string | null;
  photo_front_url: string | null;
  weight_delta_kg: number | null;
  coach_feedback: string | null;
  coach_macro_adjustment: any;
  coach_responded_at: string | null;
}

const CoachCheckinsTab = ({ patientId }: { patientId: string }) => {
  const [items, setItems] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    load();
  }, [patientId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("weekly_checkins" as any)
      .select("*")
      .eq("user_id", patientId)
      .order("week_start", { ascending: false })
      .limit(12);
    setItems((data as any) || []);
    // signed URLs for photos
    const urls: Record<string, string> = {};
    for (const c of (data as any) || []) {
      if (c.photo_front_url) {
        const { data: signed } = await supabase.storage
          .from("checkin-photos")
          .createSignedUrl(c.photo_front_url, 3600);
        if (signed) urls[c.id] = signed.signedUrl;
      }
    }
    setPhotoUrls(urls);
    setLoading(false);
  };

  const respond = async (c: CheckIn) => {
    const d = draft[c.id] || {};
    setSaving(c.id);
    const macroAdj = {
      kcal: d.kcal ? Number(d.kcal) : 0,
      protein: d.protein ? Number(d.protein) : 0,
      carbs: d.carbs ? Number(d.carbs) : 0,
      fat: d.fat ? Number(d.fat) : 0,
      reason: d.reason || "",
    };
    const { error } = await supabase
      .from("weekly_checkins" as any)
      .update({
        coach_feedback: d.feedback || c.coach_feedback,
        coach_macro_adjustment: macroAdj,
        coach_responded_at: new Date().toISOString(),
      })
      .eq("id", c.id);
    setSaving(null);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Resposta enviada" });
      load();
    }
  };

  const updDraft = (id: string, k: string, v: any) =>
    setDraft((s) => ({ ...s, [id]: { ...(s[id] || {}), [k]: v } }));

  const deltaIcon = (d: number | null) => {
    if (d == null) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (d > 0.05) return <ArrowUp className="h-4 w-4 text-red-400" />;
    if (d < -0.05) return <ArrowDown className="h-4 w-4 text-emerald-400" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>;
  if (!items.length) return <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum check-in registrado.</CardContent></Card>;

  return (
    <div className="space-y-3">
      {items.map((c) => {
        const open = openId === c.id;
        const isNew = !c.coach_responded_at;
        return (
          <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <button
                className="w-full p-4 flex items-center gap-3 text-left"
                onClick={() => setOpenId(open ? null : c.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Semana de {c.week_start}</span>
                    {isNew && <Badge className="bg-amber-500 text-black">NOVO</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      {deltaIcon(c.weight_delta_kg)}
                      {c.weight_kg ? `${c.weight_kg}kg` : "—"}
                      {c.weight_delta_kg != null && (
                        <span className="text-xs">({c.weight_delta_kg > 0 ? "+" : ""}{c.weight_delta_kg}kg)</span>
                      )}
                    </span>
                    {c.adherence_diet != null && <span>Dieta {c.adherence_diet}/10</span>}
                  </div>
                </div>
                {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="border-t border-border space-y-4 pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <Metric label="Cintura" value={c.waist_cm ? `${c.waist_cm}cm` : "—"} />
                        <Metric label="Quadril" value={c.hip_cm ? `${c.hip_cm}cm` : "—"} />
                        <Metric label="Braço" value={c.arm_cm ? `${c.arm_cm}cm` : "—"} />
                        <Metric label="Bristol" value={c.bristol_scale ?? "—"} />
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                        <Metric label="Treino" value={`${c.adherence_training ?? "—"}/10`} />
                        <Metric label="Sono" value={`${c.adherence_sleep ?? "—"}/10`} />
                        <Metric label="Estresse" value={`${c.adherence_stress ?? "—"}/10`} />
                        <Metric label="Energia" value={`${c.adherence_energy ?? "—"}/10`} />
                        <Metric label="Fome" value={`${c.adherence_hunger ?? "—"}/10`} />
                        <Metric label="Inchaço" value={`${c.bloating_days ?? 0}d`} />
                      </div>
                      {c.symptoms && c.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {c.symptoms.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                        </div>
                      )}
                      {c.notes && (
                        <div className="rounded bg-muted/30 p-3 text-sm whitespace-pre-wrap">{c.notes}</div>
                      )}
                      {photoUrls[c.id] && (
                        <img src={photoUrls[c.id]} alt="check-in" className="rounded-lg max-h-64 object-cover" />
                      )}

                      <div className="border-t border-border pt-4 space-y-3">
                        <h4 className="font-semibold text-sm">Resposta do Coach</h4>
                        {c.coach_feedback && c.coach_responded_at && (
                          <div className="rounded bg-primary/10 border border-primary/30 p-3 text-sm">
                            <div className="text-xs text-muted-foreground mb-1">
                              Respondido em {new Date(c.coach_responded_at).toLocaleString("pt-BR")}
                            </div>
                            <div className="whitespace-pre-wrap">{c.coach_feedback}</div>
                            {c.coach_macro_adjustment && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Ajuste: {c.coach_macro_adjustment.kcal} kcal · P {c.coach_macro_adjustment.protein} · C {c.coach_macro_adjustment.carbs} · G {c.coach_macro_adjustment.fat}
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          <Label>Feedback</Label>
                          <Textarea
                            defaultValue={c.coach_feedback || ""}
                            onChange={(e) => updDraft(c.id, "feedback", e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label className="mb-1 block">Ajuste de Macros (±)</Label>
                          <div className="grid grid-cols-4 gap-2">
                            {["kcal", "protein", "carbs", "fat"].map((k) => (
                              <Input key={k} type="number" placeholder={k} onChange={(e) => updDraft(c.id, k, e.target.value)} />
                            ))}
                          </div>
                          <Input className="mt-2" placeholder="Motivo do ajuste" onChange={(e) => updDraft(c.id, "reason", e.target.value)} />
                        </div>
                        <Button onClick={() => respond(c)} disabled={saving === c.id} className="gap-2">
                          {saving === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          Responder
                        </Button>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: any }) => (
  <div className="rounded bg-muted/30 p-2 text-center">
    <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
    <div className="font-semibold text-sm">{value}</div>
  </div>
);

export default CoachCheckinsTab;
