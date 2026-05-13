import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trophy, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

type ClientRow = { patient_user_id: string; nome: string; athlete_id: string | null };

export default function AthleteSelector({ value, onChange, label = "Atleta / Cliente" }: Props) {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState<AthleteOption[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // 1. Atletas de competição
      const { data: athData } = await supabase
        .from("competition_athletes" as any)
        .select("id,nome,patient_user_id,fase_atual,data_competicao,categoria")
        .eq("coach_id", user.id)
        .eq("ativo", true)
        .order("nome", { ascending: true });
      const athList = ((athData as any) || []) as (AthleteOption & { categoria?: string })[];
      setAthletes(athList);

      // 2. Coach profile -> clientes vinculados
      const { data: cp } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cp?.id) { setClients([]); return; }

      const { data: pats } = await supabase
        .from("coach_patients")
        .select("patient_user_id")
        .eq("coach_id", cp.id)
        .eq("status", "active");
      const ids = (pats || []).map((p: any) => p.patient_user_id).filter(Boolean);
      if (ids.length === 0) { setClients([]); return; }

      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", ids);

      const athByPatient = new Map(athList.filter(a => a.patient_user_id).map(a => [a.patient_user_id!, a.id]));
      const rows: ClientRow[] = (profs || []).map((p: any) => ({
        patient_user_id: p.user_id,
        nome: p.full_name || "Cliente",
        athlete_id: athByPatient.get(p.user_id) || null,
      }));
      setClients(rows);
    })();
  }, [user]);

  const handleSelect = async (v: string) => {
    if (!v) { onChange(null); return; }

    // Caso 1: já é athlete
    const ath = athletes.find((a) => a.id === v);
    if (ath) { onChange(ath); return; }

    // Caso 2: é cliente prefixado "client:<patient_user_id>"
    if (v.startsWith("client:")) {
      const patientId = v.slice(7);
      const client = clients.find((c) => c.patient_user_id === patientId);
      if (!client) return;

      // Já tem athlete vinculado? usa ele
      if (client.athlete_id) {
        const existing = athletes.find((a) => a.id === client.athlete_id);
        if (existing) { onChange(existing); return; }
      }

      // Cria competition_athletes com categoria=cliente
      if (!user) return;
      const { data: created, error } = await supabase
        .from("competition_athletes" as any)
        .insert({
          coach_id: user.id,
          patient_user_id: patientId,
          nome: client.nome,
          categoria: "cliente",
          ativo: true,
        })
        .select("id,nome,patient_user_id,fase_atual,data_competicao")
        .single();
      if (error || !created) {
        toast({ title: "Erro ao vincular cliente", description: error?.message, variant: "destructive" });
        return;
      }
      const newOpt = created as unknown as AthleteOption;
      setAthletes((prev) => [...prev, newOpt].sort((a, b) => a.nome.localeCompare(b.nome)));
      setClients((prev) => prev.map((c) => c.patient_user_id === patientId ? { ...c, athlete_id: newOpt.id } : c));
      onChange(newOpt);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm">
        <Trophy className="h-4 w-4 text-amber-500" /> {label}
      </Label>
      <Select value={value ?? ""} onValueChange={handleSelect}>
        <SelectTrigger className="w-full md:w-80">
          <SelectValue placeholder="Selecione atleta ou cliente..." />
        </SelectTrigger>
        <SelectContent>
          {athletes.length === 0 && clients.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">Nenhum atleta ou cliente cadastrado.</div>
          )}
          {athletes.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                <Trophy className="h-3 w-3 text-amber-500" /> Atletas de competição
              </SelectLabel>
              {athletes.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.nome} {a.fase_atual ? `· ${a.fase_atual}` : ""}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          {clients.filter(c => !c.athlete_id).length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                <Users className="h-3 w-3 text-blue-400" /> Meus clientes
              </SelectLabel>
              {clients.filter(c => !c.athlete_id).map((c) => (
                <SelectItem key={c.patient_user_id} value={`client:${c.patient_user_id}`}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
