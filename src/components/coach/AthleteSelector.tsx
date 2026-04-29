import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trophy } from "lucide-react";

export interface AthleteOption {
  id: string;
  nome: string;
  patient_user_id: string | null;
  fase_atual: string | null;
  data_competicao: string | null;
}

interface Props {
  value: string | null;
  onChange: (athlete: AthleteOption | null) => void;
  label?: string;
}

export default function AthleteSelector({ value, onChange, label = "Atleta" }: Props) {
  const { user } = useAuth();
  const [list, setList] = useState<AthleteOption[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("competition_athletes" as any)
        .select("id,nome,patient_user_id,fase_atual,data_competicao")
        .eq("coach_id", user.id)
        .eq("ativo", true)
        .order("nome", { ascending: true });
      setList(((data as any) || []) as AthleteOption[]);
    })();
  }, [user]);

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm">
        <Trophy className="h-4 w-4 text-amber-500" /> {label}
      </Label>
      <Select
        value={value ?? ""}
        onValueChange={(v) => {
          const ath = list.find((a) => a.id === v) || null;
          onChange(ath);
        }}
      >
        <SelectTrigger className="w-full md:w-80">
          <SelectValue placeholder="Selecione um atleta..." />
        </SelectTrigger>
        <SelectContent>
          {list.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">Nenhum atleta cadastrado.</div>
          )}
          {list.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.nome} {a.fase_atual ? `· ${a.fase_atual}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
