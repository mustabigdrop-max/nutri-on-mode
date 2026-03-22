import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useLabSubscription = () => {
  const { user } = useAuth();
  const [hasLab, setHasLab] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setHasLab(false); setLoading(false); return; }
    const check = async () => {
      const { data } = await supabase
        .from("lab_subscriptions")
        .select("id, status, expires_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      
      if (data) {
        const notExpired = !data.expires_at || new Date(data.expires_at) > new Date();
        setHasLab(notExpired);
      } else {
        setHasLab(false);
      }
      setLoading(false);
    };
    check();
  }, [user]);

  return { hasLab, loading };
};
