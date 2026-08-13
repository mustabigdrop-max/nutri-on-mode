import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  athleteId: string;
  athleteName: string;
  onSaved?: () => void;
}

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  sex: string;
  age: string;
  weight_kg: string;
  height_cm: string;
  meta_peso: string;
  objetivo_principal: string;
  nivel_treino: string;
  training_frequency: string;
  active_protocol: string;
  coach_notes: string;
}

const EMPTY: FormState = {
  full_name: "",
  email: "",
  phone: "",
  sex: "",
  age: "",
  weight_kg: "",
  height_cm: "",
  meta_peso: "",
  objetivo_principal: "",
  nivel_treino: "",
  training_frequency: "",
  active_protocol: "",
  coach_notes: "",
};

const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));
const int = (v: string) => (v.trim() === "" ? null : parseInt(v, 10) || null);
const txt = (v: string) => (v.trim() === "" ? null : v.trim());

const EditAthleteDialog = ({ open, onOpenChange, athleteId, athleteName, onSaved }: Props) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !athleteId) return;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, email, phone, sex, age, weight_kg, height_cm, meta_peso, objetivo_principal, nivel_treino, training_frequency, active_protocol, coach_notes"
        )
        .eq("user_id", athleteId)
        .maybeSingle();

      if (error) {
        toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" });
      }
      const p: any = data || {};
      setForm({
        full_name: p.full_name || "",
        email: p.email || "",
        phone: p.phone || "",
        sex: p.sex || "",
        age: p.age?.toString() || "",
        weight_kg: p.weight_kg?.toString() || "",
        height_cm: p.height_cm?.toString() || "",
        meta_peso: p.meta_peso?.toString() || "",
        objetivo_principal: p.objetivo_principal || "",
        nivel_treino: p.nivel_treino || "",
        training_frequency: p.training_frequency?.toString() || "",
        active_protocol: p.active_protocol || "",
        coach_notes: p.coach_notes || "",
      });
      setLoading(false);
    })();
  }, [open, athleteId]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  /** O banco só aceita 'male' | 'female' — normaliza pt-BR e valores livres. */
  const normalizeSex = (v: string): "male" | "female" | null => {
    const s = (v || "").trim().toLowerCase();
    if (!s) return null;
    if (["male", "m", "masculino", "homem"].includes(s)) return "male";
    if (["female", "f", "feminino", "mulher"].includes(s)) return "female";
    return null;
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim(),
        phone: txt(form.phone),
        sex: normalizeSex(form.sex),
        age: int(form.age),
        weight_kg: num(form.weight_kg),
        height_cm: num(form.height_cm),
        meta_peso: num(form.meta_peso),
        objetivo_principal: txt(form.objetivo_principal),
        nivel_treino: txt(form.nivel_treino),
        training_frequency: int(form.training_frequency),
        active_protocol: txt(form.active_protocol),
        coach_notes: txt(form.coach_notes),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", athleteId);
    setSaving(false);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Dados atualizados ✅", description: form.full_name.trim() });
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar dados · {athleteName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Nome completo</Label>
              <Input value={form.full_name} onChange={set("full_name")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>E-mail (somente leitura)</Label>
                <Input value={form.email} disabled />
              </div>
              <div className="space-y-1">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={set("phone")} placeholder="(11) 90000-0000" />
              </div>
              <div className="space-y-1">
                <Label>Sexo</Label>
                <Input value={form.sex} onChange={set("sex")} placeholder="masculino / feminino" />
              </div>
              <div className="space-y-1">
                <Label>Idade</Label>
                <Input value={form.age} onChange={set("age")} inputMode="numeric" />
              </div>
              <div className="space-y-1">
                <Label>Peso atual (kg)</Label>
                <Input value={form.weight_kg} onChange={set("weight_kg")} inputMode="decimal" />
              </div>
              <div className="space-y-1">
                <Label>Altura (cm)</Label>
                <Input value={form.height_cm} onChange={set("height_cm")} inputMode="decimal" />
              </div>
              <div className="space-y-1">
                <Label>Meta de peso (kg)</Label>
                <Input value={form.meta_peso} onChange={set("meta_peso")} inputMode="decimal" />
              </div>
              <div className="space-y-1">
                <Label>Treinos / semana</Label>
                <Input value={form.training_frequency} onChange={set("training_frequency")} inputMode="numeric" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Objetivo principal</Label>
              <Input value={form.objetivo_principal} onChange={set("objetivo_principal")} placeholder="Ex.: Recomposição corporal" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Nível de treino</Label>
                <Input value={form.nivel_treino} onChange={set("nivel_treino")} placeholder="iniciante / intermediário / avançado" />
              </div>
              <div className="space-y-1">
                <Label>Fase / protocolo ativo</Label>
                <Input value={form.active_protocol} onChange={set("active_protocol")} placeholder="Ex.: Cutting" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Notas do coach</Label>
              <Textarea value={form.coach_notes} onChange={set("coach_notes")} rows={3} />
            </div>

            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar alterações
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditAthleteDialog;
