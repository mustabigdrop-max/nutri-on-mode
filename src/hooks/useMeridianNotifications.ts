// MERIDIAN — Hook de notificações automáticas (lista + marca como lida + scan manual).
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MeridianNotification {
  id: string;
  user_id: string;
  plan_id: string | null;
  competition_id: string | null;
  kind: string;
  severity: "INFO" | "WARN" | "CRITICAL";
  title: string;
  body: string | null;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export function useMeridianNotifications(targetUserId?: string) {
  const { user } = useAuth();
  const uid = targetUserId ?? user?.id;
  const [items, setItems] = useState<MeridianNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const reload = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    const { data } = await supabase
      .from("meridian_notifications" as any)
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data ?? []) as any);
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    reload();
  }, [reload]);

  const markRead = useCallback(
    async (id: string) => {
      await supabase
        .from("meridian_notifications" as any)
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    },
    [],
  );

  const markAllRead = useCallback(async () => {
    if (!uid) return;
    await supabase
      .from("meridian_notifications" as any)
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", uid)
      .is("read_at", null);
    reload();
  }, [uid, reload]);

  const runScan = useCallback(async () => {
    setScanning(true);
    try {
      await supabase.functions.invoke("meridian-scan-notifications", { body: {} });
      await reload();
    } finally {
      setScanning(false);
    }
  }, [reload]);

  const unreadCount = items.filter((n) => !n.read_at).length;

  return { items, unreadCount, loading, scanning, reload, markRead, markAllRead, runScan };
}
