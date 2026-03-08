import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlanSlot {
  plan_key: string;
  max_slots: number;
  used_slots: number;
}

export function usePlanSlots() {
  const [slots, setSlots] = useState<Record<string, PlanSlot>>({});

  useEffect(() => {
    // Initial fetch
    supabase
      .from("plan_slots")
      .select("plan_key, max_slots, used_slots")
      .then(({ data }) => {
        if (data) {
          const map: Record<string, PlanSlot> = {};
          data.forEach((row) => (map[row.plan_key] = row as PlanSlot));
          setSlots(map);
        }
      });

    // Realtime subscription
    const channel = supabase
      .channel("plan_slots_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plan_slots" },
        (payload) => {
          const row = payload.new as PlanSlot;
          if (row?.plan_key) {
            setSlots((prev) => ({ ...prev, [row.plan_key]: row }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getRemaining = (key: string) => {
    const s = slots[key];
    if (!s) return null;
    return Math.max(0, s.max_slots - s.used_slots);
  };

  return { slots, getRemaining };
}
