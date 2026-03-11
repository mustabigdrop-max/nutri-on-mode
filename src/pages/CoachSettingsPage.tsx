import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Save, Palette, Bell, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CoachSettingsPage = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useCoachProfile();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    professional_name: "",
    crn: "",
    bio: "",
    wl_app_name: "",
    wl_primary: "#E8A020",
    wl_secondary: "#1a1a2e",
    wl_domain: "",
    alert_frequency: "realtime",
    alert_app: true,
    alert_email: false,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        professional_name: profile.professional_name || "",
        crn: profile.crn || "",
        bio: profile.bio || "",
        wl_app_name: profile.white_label_app_name || "",
        wl_primary: profile.white_label_primary_color || "#E8A020",
        wl_secondary: profile.white_label_secondary_color || "#1a1a2e",
        wl_domain: profile.white_label_domain || "",
        alert_frequency: profile.alert_frequency || "realtime",
        alert_app: profile.alert_channels?.app ?? true,
        alert_email: profile.alert_channels?.email ?? false,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("coach_profiles").update({
      professional_name: form.professional_name,
      crn: form.crn || null,
      bio: form.bio || null,
      white_label_app_name: form.wl_app_name || null,
      white_label_primary_color: form.wl_primary,
      white_label_secondary_color: form.wl_secondary,
      white_label_domain: form.wl_domain || null,
      alert_frequency: form.alert_frequency,
      alert_channels: { app: form.alert_app, email: form.alert_email },
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id);

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } else {
      toast({ title: "Configurações salvas ✅" });
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/coach/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
        </Button>

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Configurações do Coach</h1>
          <Badge variant="outline">{profile?.plan === "white_label" ? "White Label" : "Coach Pro"}</Badge>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Perfil Profissional</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Nome profissional</Label>
              <Input value={form.professional_name} onChange={e => setForm(p => ({ ...p, professional_name: e.target.value }))} />
            </div>
            <div>
              <Label>CRN</Label>
              <Input value={form.crn} onChange={e => setForm(p => ({ ...p, crn: e.target.value }))} />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* White Label */}
        {profile?.plan === "white_label" && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" /> White Label
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Nome do app</Label>
                <Input value={form.wl_app_name} onChange={e => setForm(p => ({ ...p, wl_app_name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cor primária</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={form.wl_primary} onChange={e => setForm(p => ({ ...p, wl_primary: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border-0" />
                    <Input value={form.wl_primary} onChange={e => setForm(p => ({ ...p, wl_primary: e.target.value }))} className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label>Cor secundária</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={form.wl_secondary} onChange={e => setForm(p => ({ ...p, wl_secondary: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border-0" />
                    <Input value={form.wl_secondary} onChange={e => setForm(p => ({ ...p, wl_secondary: e.target.value }))} className="flex-1" />
                  </div>
                </div>
              </div>
              <div>
                <Label>Domínio personalizado</Label>
                <Input value={form.wl_domain} onChange={e => setForm(p => ({ ...p, wl_domain: e.target.value }))} placeholder="app.suamarca.com.br" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4" /> Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Frequência</Label>
              <select
                className="w-full p-2 rounded-md border border-border bg-background text-foreground text-sm"
                value={form.alert_frequency}
                onChange={e => setForm(p => ({ ...p, alert_frequency: e.target.value }))}
              >
                <option value="realtime">Tempo real</option>
                <option value="daily">Resumo diário</option>
                <option value="weekly">Resumo semanal</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Notificação no app</Label>
              <Switch checked={form.alert_app} onCheckedChange={v => setForm(p => ({ ...p, alert_app: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Notificação por email</Label>
              <Switch checked={form.alert_email} onCheckedChange={v => setForm(p => ({ ...p, alert_email: v }))} />
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Plano e Cobrança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plano atual</span>
              <Badge>{profile?.plan === "white_label" ? "White Label" : "Coach"} — {profile?.max_patients} pacientes</Badge>
            </div>
            {profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date() && (
              <p className="text-xs text-primary mt-2">
                Trial ativo — expira em {Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
              </p>
            )}
          </CardContent>
        </Card>

        <Button className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default CoachSettingsPage;
