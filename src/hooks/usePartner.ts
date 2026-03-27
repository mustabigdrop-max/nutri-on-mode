import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function usePartner() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const check = async () => {
      // Check admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      
      const admin = roles?.some((r: any) => r.role === "admin") ?? false;
      setIsAdmin(admin);

      // Check partner
      const { data } = await supabase
        .from("partners")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      setPartner(data);
      setLoading(false);
    };

    check();
  }, [user]);

  return { partner, isAdmin, loading };
}
