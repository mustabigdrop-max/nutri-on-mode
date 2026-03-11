import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CoachAddPatientPage = () => {
  const navigate = useNavigate();
  const { profile } = useCoachProfile();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!profile || !email.trim()) return;
    setLoading(true);

    try {
      // Find user by email in profiles
      const { data: patientProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (!patientProfile) {
        toast({ title: "Paciente não encontrado", description: "O email não está cadastrado no nutriON.", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Check if already linked
      const { data: existing } = await supabase
        .from("coach_patients")
        .select("id")
        .eq("coach_id", profile.id)
        .eq("patient_user_id", patientProfile.user_id)
        .maybeSingle();

      if (existing) {
        toast({ title: "Paciente já vinculado", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("coach_patients").insert({
        coach_id: profile.id,
        patient_user_id: patientProfile.user_id,
      });

      if (error) throw error;

      // Update patient's profile with coach reference
      await supabase
        .from("profiles")
        .update({ coach_profile_id: profile.id })
        .eq("user_id", patientProfile.user_id);

      toast({ title: "Paciente adicionado com sucesso! 🎉" });
      navigate("/coach/dashboard");
    } catch (err: any) {
      toast({ title: "Erro ao adicionar paciente", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/coach/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Adicionar Paciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email do paciente</Label>
              <Input
                type="email"
                placeholder="paciente@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                O paciente precisa ter uma conta ativa no nutriON.
              </p>
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={loading || !email.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Vincular Paciente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoachAddPatientPage;
