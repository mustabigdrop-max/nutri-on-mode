import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Gym = {
  id: string;
  name: string;
  city: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  active: boolean;
};

interface Props {
  coachUserId: string;
  coachProfileId?: string | null;
}

export default function PartnerGymsPanel({ coachUserId, coachProfileId }: Props) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", contact_name: "", contact_phone: "" });
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("partner_gyms")
      .select("id, name, city, contact_name, contact_phone, active")
      .order("created_at", { ascending: false });
    if (error) toast.error("Não foi possível carregar as academias.");
    setGyms((data as Gym[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addGym = async () => {
    if (form.name.trim().length < 2) return toast.error("Informe o nome da academia.");
    setSaving(true);
    const { error } = await supabase.from("partner_gyms").insert({
      coach_user_id: coachUserId,
      coach_profile_id: coachProfileId ?? null,
      name: form.name.trim(),
      city: form.city.trim() || null,
      contact_name: form.contact_name.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error("Erro ao cadastrar academia.");
    setForm({ name: "", city: "", contact_name: "", contact_phone: "" });
    setShowForm(false);
    toast.success("Academia cadastrada.");
    load();
  };

  const toggleGym = async (gym: Gym) => {
    setGyms((prev) => prev.map((g) => (g.id === gym.id ? { ...g, active: !g.active } : g)));
    const { error } = await supabase
      .from("partner_gyms")
      .update({ active: !gym.active })
      .eq("id", gym.id);
    if (error) {
      toast.error("Erro ao atualizar status.");
      load();
    }
  };

  const removeGym = async (gym: Gym) => {
    const { error } = await supabase.from("partner_gyms").delete().eq("id", gym.id);
    if (error) return toast.error("Erro ao remover academia.");
    setGyms((prev) => prev.filter((g) => g.id !== gym.id));
  };

  const ativas = gyms.filter((g) => g.active).length;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5" /> Academias parceiras — {ativas} ativas
        </p>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowForm((v) => !v)}>
          <Plus className="w-4 h-4" /> Nova academia
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Nome da academia"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Cidade"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              placeholder="Responsável"
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
            />
            <Input
              placeholder="Telefone / WhatsApp"
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
            />
            <Button className="sm:col-span-2" onClick={addGym} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Cadastrar academia
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Carregando…</p>
          ) : gyms.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma academia parceira cadastrada ainda.
            </p>
          ) : (
            gyms.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate flex items-center gap-2">
                    {g.name}
                    <Badge variant="outline" className="text-[10px]">
                      {g.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[g.city, g.contact_name, g.contact_phone].filter(Boolean).join(" · ") || "Sem dados de contato"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Switch checked={g.active} onCheckedChange={() => toggleGym(g)} />
                  <Button variant="ghost" size="icon" onClick={() => removeGym(g)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
