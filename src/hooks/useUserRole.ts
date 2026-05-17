import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isProfessionalType, type ProfessionalType } from "@/lib/professionalTypes";

interface State {
  role: string;
  professionalType: ProfessionalType | null;
  isProfessional: boolean;
  isAthlete: boolean;
  isElite: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const initial: State = {
  role: "user",
  professionalType: null,
  isProfessional: false,
  isAthlete: true,
  isElite: false,
  isAdmin: false,
  loading: true,
};

export const useUserRole = () => {
  const { user } = useAuth();
  const [s, setS] = useState<State>(initial);

  useEffect(() => {
    if (!user) { setS({ ...initial, loading: false }); return; }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role, professional_type")
        .eq("user_id", user.id)
        .maybeSingle();
      const role = (data?.role as string) || "user";
      const pt = (data as any)?.professional_type ?? null;
      const proType = isProfessionalType(pt) ? pt : null;
      const isProfessional = role === "coach" || role === "admin" || !!proType;
      setS({
        role,
        professionalType: proType,
        isProfessional,
        isAthlete: !isProfessional,
        isElite: proType === "bodybuilding_coach",
        isAdmin: role === "admin",
        loading: false,
      });
    })();
  }, [user]);

  return s;
};
