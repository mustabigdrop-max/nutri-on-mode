import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, Palette } from "lucide-react";

const SPECIALTIES = [
  "emagrecimento", "hipertrofia", "performance", "GLP-1",
  "esportiva", "infantil", "clínica",
];

const CoachOnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlan = (location.state as any)?.plan || "coach";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    professional_name: "",
    crn: "",
    bio: "",
    specialties: [] as string[],
    // white label
    wl_app_name: "",
    wl_primary: "#E8A020",
    wl_secondary: "#1a1a2e",
    wl_domain: "",
  });

  const toggleSpecialty = (s: string) => {
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter(x => x !== s)
        : [...prev.specialties, s],
    }));
  };

  const handleSubmit = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!form.professional_name.trim()) {
      toast({ title: "Preencha seu nome profissional", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("coach_profiles").insert({
        user_id: user.id,
        professional_name: form.professional_name,
        crn: form.crn || null,
        bio: form.bio || null,
        specialties: form.specialties,
        plan: selectedPlan,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ...(selectedPlan === "white_label" ? {
          white_label_app_name: form.wl_app_name || null,
          white_label_primary_color: form.wl_primary,
          white_label_secondary_color: form.wl_secondary,
          white_label_domain: form.wl_domain || null,
        } : {}),
      });
      if (error) throw error;
      toast({ title: "Perfil de coach criado com sucesso! 🎉" });
      navigate("/coach/dashboard");
    } catch (err: any) {
      toast({ title: "Erro ao criar perfil", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {selectedPlan === "white_label" ? "White Label Partner" : "Coach Pro"}
          </Badge>
          <h1 className="text-2xl font-bold text-foreground">Configure seu perfil profissional</h1>
          <p className="text-sm text-muted-foreground">Preencha os dados para começar a gerenciar seus pacientes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados Profissionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome profissional *</Label>
              <Input
                placeholder="Dra. Ana Paula"
                value={form.professional_name}
                onChange={e => setForm(p => ({ ...p, professional_name: e.target.value }))}
              />
            </div>
            <div>
              <Label>CRN (opcional)</Label>
              <Input
                placeholder="CRN-3 12345"
                value={form.crn}
                onChange={e => setForm(p => ({ ...p, crn: e.target.value }))}
              />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea
                placeholder="Conte sobre sua experiência e especialidades..."
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <Label>Especialidades</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SPECIALTIES.map(s => (
                  <Badge
                    key={s}
                    variant={form.specialties.includes(s) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleSpecialty(s)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedPlan === "white_label" && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Configuração White Label
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome do app personalizado</Label>
                <Input
                  placeholder='Ex: "NutriVida by Dra. Ana"'
                  value={form.wl_app_name}
                  onChange={e => setForm(p => ({ ...p, wl_app_name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cor primária</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={form.wl_primary}
                      onChange={e => setForm(p => ({ ...p, wl_primary: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={form.wl_primary}
                      onChange={e => setForm(p => ({ ...p, wl_primary: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Cor secundária</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={form.wl_secondary}
                      onChange={e => setForm(p => ({ ...p, wl_secondary: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={form.wl_secondary}
                      onChange={e => setForm(p => ({ ...p, wl_secondary: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>Domínio personalizado</Label>
                <Input
                  placeholder="app.draanapaula.com.br"
                  value={form.wl_domain}
                  onChange={e => setForm(p => ({ ...p, wl_domain: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">Configure via CNAME após ativação</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Criar meu perfil de coach
        </Button>
      </div>
    </div>
  );
};

export default CoachOnboardingPage;
