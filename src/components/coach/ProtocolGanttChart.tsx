import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

const PHASE_TYPES = [
  { v: "cutting", label: "Cutting" },
  { v: "bulking", label: "Bulking" },
  { v: "recomp", label: "Recomp" },
  { v: "maintenance", label: "Manutenção" },
  { v: "deload", label: "Deload" },
  { v: "contest_prep", label: "Contest Prep" },
  { v: "peak_week", label: "Peak Week" },
];
const EMOJIS = ["🎯", "🔥", "💪", "🥩", "⚡"];
const COLORS = ["#E8A020", "#4ade80", "#3b82f6", "#a855f7", "#ef4444", "#f59e0b", "#06b6d4", "#ec4899"];

interface Phase {
  id: string;
  patient_user_id: string;
  coach_id: string;
  name: string;
  phase_type: string;
  emoji: string;
  color: string;
  start_date: string;
  end_date: string;
  status: string;
  target_weight_kg: number | null;
  target_body_fat: number | null;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  carb_cycling: boolean;
  refeed_protocol: string | null;
  cardio_protocol: string | null;
  template_id: string | null;
  visible_to_patient: boolean;
  completion_rating: number | null;
  completion_notes: string | null;
}

const emptyForm: Partial<Phase> = {
  name: "",
  phase_type: "maintenance",
  emoji: "🎯",
  color: "#E8A020",
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10),
  status: "planned",
  visible_to_patient: true,
  carb_cycling: false,
};

const monthLabel = (d: Date) => d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
const diffDays = (a: string, b: string) => Math.max(1, Math.round((+new Date(b) - +new Date(a)) / 86400000));

const ProtocolGanttChart = ({ patientId }: { patientId: string }) => {
  const { user } = useAuth();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Phase | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<Partial<Phase>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completion, setCompletion] = useState<{ rating: number; notes: string }>({ rating: 5, notes: "" });
  const [templates, setTemplates] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    load();
  }, [patientId]);

  useEffect(() => {
    if (!user) return;
    supabase.from("coach_protocol_templates" as any).select("id, name").eq("coach_id", user.id)
      .then(({ data }) => setTemplates((data as any) || []));
  }, [user]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("protocol_phases" as any)
      .select("*")
      .eq("patient_user_id", patientId)
      .order("start_date", { ascending: true });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    setPhases((data as any) || []);
    setLoading(false);
  };

  const today = new Date();
  const { rangeStart, rangeEnd, months, totalDays } = useMemo(() => {
    let start = new Date(today.getFullYear(), today.getMonth(), 1);
    let end = new Date(today.getFullYear(), today.getMonth() + 12, 0);
    for (const p of phases) {
      const s = new Date(p.start_date);
      const e = new Date(p.end_date);
      if (s < start) start = new Date(s.getFullYear(), s.getMonth(), 1);
      if (e > end) end = new Date(e.getFullYear(), e.getMonth() + 1, 0);
    }
    const months: Date[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      months.push(new Date(cur));
      cur.setMonth(cur.getMonth() + 1);
    }
    const totalDays = diffDays(start.toISOString(), end.toISOString());
    return { rangeStart: start, rangeEnd: end, months, totalDays };
  }, [phases]);

  const dayWidth = 4; // px per day
  const ganttWidth = totalDays * dayWidth;
  const todayOffset = Math.max(0, diffDays(rangeStart.toISOString(), today.toISOString())) * dayWidth;

  const phasePos = (p: Phase) => {
    const offset = Math.max(0, diffDays(rangeStart.toISOString(), p.start_date)) * dayWidth;
    const width = diffDays(p.start_date, p.end_date) * dayWidth;
    return { left: offset, width };
  };

  const openNew = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setSheetOpen(true);
  };
  const openEdit = (p: Phase) => {
    setForm(p);
    setEditingId(p.id);
    setSheetOpen(true);
    setSelected(null);
  };

  const save = async () => {
    if (!form.name?.trim() || !user) return;
    setSaving(true);
    const payload: any = {
      ...form,
      patient_user_id: patientId,
      coach_id: user.id,
    };
    if (editingId) payload.id = editingId;
    const { error } = await supabase.from("protocol_phases" as any).upsert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Fase atualizada" : "Fase criada" });
      setSheetOpen(false);
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir fase?")) return;
    const { error } = await supabase.from("protocol_phases" as any).delete().eq("id", id);
    if (error) toast({ title: "Erro", variant: "destructive" });
    else { toast({ title: "Fase excluída" }); setSelected(null); load(); }
  };

  const markCompleted = async () => {
    if (!selected) return;
    const { error } = await supabase.from("protocol_phases" as any).update({
      status: "completed",
      completion_rating: completion.rating,
      completion_notes: completion.notes,
    }).eq("id", selected.id);
    if (error) toast({ title: "Erro", variant: "destructive" });
    else {
      toast({ title: "Fase concluída" });
      setCompleteOpen(false);
      setSelected(null);
      load();
    }
  };

  // Summary
  const activePhase = phases.find((p) => p.status === "active") || phases.find(
    (p) => new Date(p.start_date) <= today && new Date(p.end_date) >= today
  );
  const nextPhase = phases.find((p) => new Date(p.start_date) > today);
  const remainingDays = activePhase ? diffDays(today.toISOString(), activePhase.end_date) : 0;
  const totalProtocol = phases.length
    ? diffDays(phases[0].start_date, phases[phases.length - 1].end_date) : 0;
  const elapsed = phases.length
    ? Math.max(0, diffDays(phases[0].start_date, today.toISOString())) : 0;
  const progress = totalProtocol ? Math.min(100, Math.round((elapsed / totalProtocol) * 100)) : 0;

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Periodização do Protocolo</h3>
        <Button onClick={openNew} size="sm" className="gap-2"><Plus className="h-4 w-4" /> Nova Fase</Button>
      </div>

      {/* Gantt */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div style={{ width: ganttWidth + 16, minWidth: "100%" }} className="p-2">
              {/* Months row */}
              <div className="flex border-b border-border pb-1 mb-2 text-xs text-muted-foreground">
                {months.map((m, i) => {
                  const next = months[i + 1] || rangeEnd;
                  const w = diffDays(m.toISOString(), next.toISOString()) * dayWidth;
                  return (
                    <div key={i} style={{ width: w }} className="border-l border-border/40 pl-1">
                      {monthLabel(m)}
                    </div>
                  );
                })}
              </div>

              {/* Bars */}
              <div className="relative" style={{ minHeight: phases.length * 40 + 20 }}>
                {/* Today line */}
                <div
                  className="absolute top-0 bottom-0 border-l-2 border-dashed border-primary/60 z-10"
                  style={{ left: todayOffset }}
                >
                  <span className="absolute -top-4 -translate-x-1/2 text-[10px] text-primary">hoje</span>
                </div>

                <TooltipProvider>
                  {phases.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      Nenhuma fase criada. Clique em "Nova Fase" para começar.
                    </div>
                  ) : phases.map((p, i) => {
                    const { left, width } = phasePos(p);
                    const active = p.status === "active" ||
                      (new Date(p.start_date) <= today && new Date(p.end_date) >= today);
                    return (
                      <Tooltip key={p.id}>
                        <TooltipTrigger asChild>
                          <motion.button
                            onClick={() => setSelected(p)}
                            initial={{ opacity: 0 }}
                            animate={active
                              ? { opacity: 1, scale: [1, 1.02, 1] }
                              : { opacity: 1 }
                            }
                            transition={active
                              ? { scale: { duration: 1.5, repeat: Infinity }, opacity: { duration: 0.3 } }
                              : { duration: 0.3 }
                            }
                            className="absolute h-8 rounded-md border border-white/10 px-2 text-xs font-semibold text-black truncate flex items-center gap-1 shadow-sm hover:opacity-90"
                            style={{
                              left,
                              width,
                              top: i * 40,
                              backgroundColor: p.color,
                              opacity: p.status === "completed" ? 0.6 : 1,
                            }}
                          >
                            <span>{p.emoji}</span>
                            <span className="truncate">{p.name}</span>
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs space-y-0.5">
                            <div className="font-semibold">{p.name}</div>
                            <div>Meta: {p.target_weight_kg ?? "—"} kg</div>
                            <div>Kcal: {p.kcal ?? "—"}</div>
                            <div>{Math.round(diffDays(p.start_date, p.end_date) / 7)} semanas</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Fase Atual" value={activePhase ? `${activePhase.emoji} ${activePhase.name}` : "—"} />
        <SummaryCard label="Duração restante" value={activePhase ? `${remainingDays} dias` : "—"} />
        <SummaryCard label="Próxima Fase" value={nextPhase ? `${nextPhase.emoji} ${nextPhase.name}` : "—"} />
        <SummaryCard label="Progresso" value={`${progress}%`} />
      </div>

      {/* Sheet form */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Editar Fase" : "Nova Fase"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome</Label>
              <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.phase_type} onValueChange={(v) => setForm({ ...form, phase_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PHASE_TYPES.map((t) => <SelectItem key={t.v} value={t.v}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Emoji</Label>
              <div className="flex gap-2 mt-1">
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => setForm({ ...form, emoji: e })}
                    className={`w-10 h-10 rounded border text-xl ${form.emoji === e ? "border-primary bg-primary/20" : "border-border"}`}>{e}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-8 h-8 rounded-full border-2 ${form.color === c ? "border-foreground" : "border-transparent"}`} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Início</Label>
                <Input type="date" value={form.start_date || ""} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <Label>Fim</Label>
                <Input type="date" value={form.end_date || ""} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Meta peso (kg)</Label>
                <Input type="number" step="0.1" value={form.target_weight_kg ?? ""} onChange={(e) => setForm({ ...form, target_weight_kg: parseFloat(e.target.value) })} />
              </div>
              <div>
                <Label>Meta % gordura</Label>
                <Input type="number" step="0.1" value={form.target_body_fat ?? ""} onChange={(e) => setForm({ ...form, target_body_fat: parseFloat(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[["kcal", "Kcal"], ["protein_g", "P (g)"], ["carbs_g", "C (g)"], ["fat_g", "G (g)"]].map(([k, l]) => (
                <div key={k}>
                  <Label>{l}</Label>
                  <Input type="number" value={(form as any)[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: parseInt(e.target.value) } as any)} />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between rounded border border-border/40 p-2">
              <Label htmlFor="cc">Carb Cycling</Label>
              <Switch id="cc" checked={!!form.carb_cycling} onCheckedChange={(v) => setForm({ ...form, carb_cycling: v })} />
            </div>
            <div>
              <Label>Refeed Protocol</Label>
              <Textarea value={form.refeed_protocol || ""} onChange={(e) => setForm({ ...form, refeed_protocol: e.target.value })} />
            </div>
            <div>
              <Label>Cardio Protocol</Label>
              <Textarea value={form.cardio_protocol || ""} onChange={(e) => setForm({ ...form, cardio_protocol: e.target.value })} />
            </div>
            <div>
              <Label>Baseado em template</Label>
              <Select value={form.template_id || "none"} onValueChange={(v) => setForm({ ...form, template_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded border border-border/40 p-2">
              <Label htmlFor="vis">Visível para paciente</Label>
              <Switch id="vis" checked={!!form.visible_to_patient}
                onCheckedChange={(v) => setForm({ ...form, visible_to_patient: v })} />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar Fase
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Selected phase side panel */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span style={{ color: selected.color }}>{selected.emoji}</span>
                  {selected.name}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-3 py-4 text-sm">
                <Badge variant="outline">{selected.phase_type}</Badge>
                <Badge className="ml-2" variant={selected.status === "active" ? "default" : "secondary"}>{selected.status}</Badge>
                <div>📅 {selected.start_date} → {selected.end_date}</div>
                <div>⚖️ Meta: {selected.target_weight_kg ?? "—"} kg / {selected.target_body_fat ?? "—"}% bf</div>
                <div>🍽️ {selected.kcal ?? "—"} kcal · P{selected.protein_g ?? "—"} C{selected.carbs_g ?? "—"} G{selected.fat_g ?? "—"}</div>
                {selected.carb_cycling && <Badge>Carb Cycling</Badge>}
                {selected.refeed_protocol && <div><strong>Refeed:</strong> {selected.refeed_protocol}</div>}
                {selected.cardio_protocol && <div><strong>Cardio:</strong> {selected.cardio_protocol}</div>}
                {selected.completion_rating && (
                  <div className="rounded bg-muted/30 p-2">
                    ⭐ {selected.completion_rating}/5 — {selected.completion_notes}
                  </div>
                )}
              </div>
              <SheetFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
                <Button onClick={() => openEdit(selected)} variant="outline" className="w-full">
                  <Pencil className="h-4 w-4 mr-2" /> Editar
                </Button>
                {selected.status !== "completed" && (
                  <Button onClick={() => setCompleteOpen(true)} className="w-full">
                    <Check className="h-4 w-4 mr-2" /> Marcar como Concluída
                  </Button>
                )}
                <Button onClick={() => remove(selected.id)} variant="ghost" className="w-full text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Completion dialog */}
      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Concluir Fase</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Avaliação (1-5)</Label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setCompletion({ ...completion, rating: n })}
                    className={`w-10 h-10 rounded border text-lg ${completion.rating === n ? "border-primary bg-primary/20 text-primary" : "border-border"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea value={completion.notes} onChange={(e) => setCompletion({ ...completion, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteOpen(false)}>Cancelar</Button>
            <Button onClick={markCompleted}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
  <Card>
    <CardContent className="p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-semibold mt-1 truncate">{value}</div>
    </CardContent>
  </Card>
);

export default ProtocolGanttChart;
