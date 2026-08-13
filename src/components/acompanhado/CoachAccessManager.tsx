import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, Save } from "lucide-react";
import { toast } from "sonner";

interface CoachAccessManagerProps {
  patientUserId: string;
  coachProfileId: string;
}

const TOGGLEABLE = [
  { key: "receitas", label: "Receitas personalizadas" },
  { key: "lista_compras", label: "Lista de compras" },
  { key: "historico_completo", label: "Histórico completo" },
] as const;

const CoachAccessManager = ({ patientUserId, coachProfileId }: CoachAccessManagerProps) => {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [chatUnlimited, setChatUnlimited] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("coach_patients")
        .select("features_override")
        .eq("coach_id", coachProfileId)
        .eq("patient_user_id", patientUserId)
        .maybeSingle();

      if (data?.features_override) {
        const fo = data.features_override as Record<string, any>;
        const loaded: Record<string, boolean> = {};
        TOGGLEABLE.forEach(t => {
          if (fo[t.key]) loaded[t.key] = true;
        });
        setOverrides(loaded);
        setChatUnlimited(fo.chat_limit === -1);
      }
    };
    load();
  }, [patientUserId, coachProfileId]);

  const handleSave = async () => {
    setSaving(true);
    const featuresOverride: Record<string, any> = { ...overrides };
    if (chatUnlimited) featuresOverride.chat_limit = -1;

    const { error } = await supabase
      .from("coach_patients")
      .update({ features_override: featuresOverride } as any)
      .eq("coach_id", coachProfileId)
      .eq("patient_user_id", patientUserId);

    if (error) {
      toast.error("Erro ao salvar configurações");
    } else {
      toast.success("Configurações de acesso salvas ✓");
    }
    setSaving(false);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Acesso do Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Libere features extras como recompensa para este cliente.
        </p>

        {TOGGLEABLE.map(t => (
          <div key={t.key} className="flex items-center justify-between">
            <span className="text-sm text-foreground">{t.label}</span>
            <Switch
              checked={!!overrides[t.key]}
              onCheckedChange={(checked) =>
                setOverrides(prev => ({ ...prev, [t.key]: checked }))
              }
            />
          </div>
        ))}

        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Chat ilimitado</span>
          <Switch
            checked={chatUnlimited}
            onCheckedChange={setChatUnlimited}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground text-xs font-bold"
          size="sm"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {saving ? "Salvando..." : "Salvar configurações de acesso"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CoachAccessManager;
