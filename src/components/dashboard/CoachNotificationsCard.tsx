import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Dumbbell, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Notif = {
  id: string;
  notification_type: string;
  title: string;
  message: string | null;
  action_url: string | null;
  reference_id: string | null;
  read: boolean;
  created_at: string;
};

const CoachNotificationsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<Notif[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("coach_notifications")
      .select("*")
      .eq("recipient_user_id", user.id)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(5);
    setNotifs((data as Notif[]) || []);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`coach-notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "coach_notifications", filter: `recipient_user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleClick = async (n: Notif) => {
    await supabase.from("coach_notifications").update({ read: true }).eq("id", n.id);
    setNotifs(prev => prev.filter(x => x.id !== n.id));
    if (n.action_url) navigate(n.action_url);
  };

  const dismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("coach_notifications").update({ read: true }).eq("id", id);
    setNotifs(prev => prev.filter(x => x.id !== id));
  };

  if (notifs.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <AnimatePresence>
        {notifs.map(n => (
          <motion.button
            key={n.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            onClick={() => handleClick(n)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 hover:border-primary/50 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              {n.notification_type === "training_plan" ? (
                <Dumbbell className="w-4 h-4 text-primary" />
              ) : (
                <Bell className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
              {n.message && <p className="text-[10px] font-mono text-muted-foreground truncate">{n.message}</p>}
            </div>
            <ChevronRight className="w-4 h-4 text-primary/60 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            <button
              onClick={e => dismiss(n.id, e)}
              className="p-1 rounded hover:bg-foreground/5 flex-shrink-0"
              aria-label="Dispensar"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CoachNotificationsCard;
