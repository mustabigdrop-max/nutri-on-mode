import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  action_url: string | null;
  metadata: any;
  read: boolean;
  created_at: string;
}

export const useNotifications = (limit = 30) => {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    const { data } = await supabase
      .from("notifications" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    setItems((data as any) || []);
    setLoading(false);
  }, [user, limit]);

  useEffect(() => {
    fetchItems();
    if (!user) return;
    const ch = supabase
      .channel(`notifications:${user.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => fetchItems()
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, fetchItems]);

  const unreadCount = items.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    await supabase.from("notifications" as any).update({ read: true }).eq("id", id);
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase.from("notifications" as any).update({ read: true }).eq("user_id", user.id).eq("read", false);
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  const remove = async (id: string) => {
    await supabase.from("notifications" as any).delete().eq("id", id);
    setItems(prev => prev.filter(n => n.id !== id));
  };

  return { items, loading, unreadCount, markAsRead, markAllAsRead, remove, refetch: fetchItems };
};
