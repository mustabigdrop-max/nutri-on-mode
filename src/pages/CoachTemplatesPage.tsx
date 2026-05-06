import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Copy, Trash2, Send, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

type Template = {
  id: string;
  coach_id: string;
  name: string;
  category: string;
  description: string | null;
  tags: string[] | null;
  protein_per_kg: number;
  carbs_per_kg: number;
  fat_per_kg: number;
  training_day_carb_mult: number;
  rest_day_carb_mult: number;
  pharma_notes: string | null;
  use_glut4_post_workout: boolean;
  use_microbiota_protocol: boolean;
  use_carb_cycling: boolean;
  use_chronobiology: boolean;
  used_count: number;
};

const CATEGORIES = [
  { v: "cutting", label: "Cutting", color: "bg-red-500/20 text-red-300 border-red-500/40" },
  { v: "bulking", label: "Bulking", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  { v: "recomp", label: "Recomp", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  { v: "maintenance", label: "Manutenção", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  { v: "contest_prep", label: "Contest Prep", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
];

const emptyForm: Partial<Template> = {
  name: "",
  category: "maintenance",
  description: "",
  tags: [],
  protein_per_kg: 1.8,
  carbs_per_kg: 4,
  fat_per_kg: 1,
  training_day_carb_mult: 1.0,
  rest_day_carb_mult: 0.7,
  pharma_notes: "",
  use_glut4_post_workout: false,
  use_microbiota_protocol: false,
  use_carb_cycling: false,
  use_chronobiology: false,
};

const CoachTemplatesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile: coachProfile } = useCoachProfile();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<Partial<Template>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyTemplateId, setApplyTemplateId] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coach_protocol_templates" as any)
      .select("*")
      .eq("coach_id", user!.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    } else {
      setTemplates((data as any) || []);
    }
    setLoading(false);
  };

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setTagInput("");
    setSheetOpen(true);
  };

  const openEdit = (t: Template) => {
    setForm(t);
    setEditingId(t.id);
    setTagInput("");
    setSheetOpen(true);
  };

  const save = async () => {
    if (!form.name?.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload: any = {
      coach_id: user!.id,
      name: form.name,
      category: form.category,
      description: form.description,
      tags: form.tags || [],
      protein_per_kg: Number(form.protein_per_kg),
      carbs_per_kg: Number(form.carbs_per_kg),
      fat_per_kg: Number(form.fat_per_kg),
      training_day_carb_mult: Number(form.training_day_carb_mult),
      rest_day_carb_mult: Number(form.rest_day_carb_mult),
      pharma_notes: form.pharma_notes,
      use_glut4_post_workout: !!form.use_glut4_post_workout,
      use_microbiota_protocol: !!form.use_microbiota_protocol,
      use_carb_cycling: !!form.use_carb_cycling,
      use_chronobiology: !!form.use_chronobiology,
    };
    if (editingId) payload.id = editingId;

    const { error } = await supabase
      .from("coach_protocol_templates" as any)
      .upsert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editingId ? "Template atualizado" : "Template criado" });
    setSheetOpen(false);
    load();
  };

  const duplicate = async (t: Template) => {
    const { id, used_count, ...rest } = t as any;
    const { error } = await supabase
      .from("coach_protocol_templates" as any)
      .insert({ ...rest, name: `${t.name} (cópia)`, used_count: 0 });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Template duplicado" }); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir template?")) return;
    const { error } = await supabase.from("coach_protocol_templates" as any).delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Template excluído" }); load(); }
  };

  const openApply = async (templateId: string) => {
    setApplyTemplateId(templateId);
    setApplyDialogOpen(true);
    if (!coachProfile) return;
    const { data: pats } = await supabase
      .from("coach_patients")
      .select("patient_user_id")
      .eq("coach_id", coachProfile.id)
      .eq("status", "active");
    if (pats && pats.length) {
      const ids = pats.map((p: any) => p.patient_user_id);
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", ids);
      setPatients(profs || []);
    } else {
      setPatients([]);
    }
  };

  const applyToPatient = async (patientId: string) => {
    if (!applyTemplateId) return;
    // increment used_count
    const t = templates.find((x) => x.id === applyTemplateId);
    if (t) {
      await supabase
        .from("coach_protocol_templates" as any)
        .update({ used_count: (t.used_count || 0) + 1 })
        .eq("id", applyTemplateId);
    }
    setApplyDialogOpen(false);
    navigate(`/diet-builder?patientId=${patientId}&templateId=${applyTemplateId}`);
  };

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    setForm((f) => ({ ...f, tags: [...(f.tags || []), v] }));
    setTagInput("");
  };
  const removeTag = (i: number) => {
    setForm((f) => ({ ...f, tags: (f.tags || []).filter((_, idx) => idx !== i) }));
  };

  const catBadge = (c: string) => {
    const meta = CATEGORIES.find((x) => x.v === c) || CATEGORIES[3];
    return <Badge className={`${meta.color} border`} variant="outline">{meta.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/coach/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Biblioteca de Templates</h1>
              <p className="text-sm text-muted-foreground">Protocolos reutilizáveis por categoria</p>
            </div>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Template
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div>
        ) : templates.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            Nenhum template criado ainda. Clique em "Novo Template" para começar.
          </Card>
        ) : (
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          >
            {templates.map((t) => (
              <motion.div
                key={t.id}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              >
                <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{t.name}</CardTitle>
                      {catBadge(t.category)}
                    </div>
                    {t.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-3">
                    <div className="text-xs text-muted-foreground">Usado {t.used_count}× </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded bg-muted/40 p-2 text-center">
                        <div className="text-[10px] text-muted-foreground">P/kg</div>
                        <div className="font-semibold">{t.protein_per_kg}g</div>
                      </div>
                      <div className="rounded bg-muted/40 p-2 text-center">
                        <div className="text-[10px] text-muted-foreground">C/kg</div>
                        <div className="font-semibold">{t.carbs_per_kg}g</div>
                      </div>
                      <div className="rounded bg-muted/40 p-2 text-center">
                        <div className="text-[10px] text-muted-foreground">G/kg</div>
                        <div className="font-semibold">{t.fat_per_kg}g</div>
                      </div>
                    </div>
                    {t.tags && t.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {t.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
                      <Button size="sm" className="col-span-2 gap-1" onClick={() => openApply(t.id)}>
                        <Send className="h-3 w-3" /> Aplicar em Paciente
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                        <Pencil className="h-3 w-3 mr-1" /> Editar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => duplicate(t)}>
                        <Copy className="h-3 w-3 mr-1" /> Duplicar
                      </Button>
                      <Button size="sm" variant="ghost" className="col-span-2 text-destructive" onClick={() => remove(t.id)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Sheet criar/editar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Editar Template" : "Novo Template"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome</Label>
              <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.v} value={c.v}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="adicionar e pressionar Enter"
                />
                <Button type="button" variant="outline" onClick={addTag}>+</Button>
              </div>
              {form.tags && form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags.map((t, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {t}
                      <button onClick={() => removeTag(i)}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Proteína g/kg</Label>
                <Input type="number" step="0.1" value={form.protein_per_kg ?? ""}
                  onChange={(e) => setForm({ ...form, protein_per_kg: parseFloat(e.target.value) })} />
              </div>
              <div>
                <Label>Carbo g/kg</Label>
                <Input type="number" step="0.1" value={form.carbs_per_kg ?? ""}
                  onChange={(e) => setForm({ ...form, carbs_per_kg: parseFloat(e.target.value) })} />
              </div>
              <div>
                <Label>Gordura g/kg</Label>
                <Input type="number" step="0.1" value={form.fat_per_kg ?? ""}
                  onChange={(e) => setForm({ ...form, fat_per_kg: parseFloat(e.target.value) })} />
              </div>
            </div>

            <div>
              <Label>Ajuste dia de treino (carbos): {(form.training_day_carb_mult ?? 1).toFixed(2)}x</Label>
              <Slider min={0.8} max={1.2} step={0.05}
                value={[form.training_day_carb_mult ?? 1]}
                onValueChange={(v) => setForm({ ...form, training_day_carb_mult: v[0] })} />
            </div>
            <div>
              <Label>Ajuste dia de descanso (carbos): {(form.rest_day_carb_mult ?? 0.7).toFixed(2)}x</Label>
              <Slider min={0.5} max={0.9} step={0.05}
                value={[form.rest_day_carb_mult ?? 0.7]}
                onValueChange={(v) => setForm({ ...form, rest_day_carb_mult: v[0] })} />
            </div>

            <div>
              <Label>Notas farmacológicas</Label>
              <Textarea value={form.pharma_notes || ""} onChange={(e) => setForm({ ...form, pharma_notes: e.target.value })} />
            </div>

            <div className="space-y-2">
              {[
                ["use_glut4_post_workout", "GLUT-4 pós-treino"],
                ["use_microbiota_protocol", "Microbiota Protocol"],
                ["use_carb_cycling", "Carb Cycling"],
                ["use_chronobiology", "Cronobiologia"],
              ].map(([k, label]) => (
                <div key={k} className="flex items-center justify-between rounded border border-border/40 p-2">
                  <Label htmlFor={k}>{label}</Label>
                  <Switch id={k}
                    checked={!!(form as any)[k]}
                    onCheckedChange={(v) => setForm({ ...form, [k]: v } as any)} />
                </div>
              ))}
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Template
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Modal aplicar paciente */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aplicar em Paciente</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {patients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum paciente ativo.</p>
            ) : patients.map((p) => (
              <button
                key={p.user_id}
                className="w-full text-left p-3 rounded border border-border/40 hover:border-primary/60 transition-colors"
                onClick={() => applyToPatient(p.user_id)}
              >
                {p.full_name || "Paciente"}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachTemplatesPage;
