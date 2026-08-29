import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { items, loading, unreadCount, markAsRead, markAllAsRead, remove } = useNotifications(100);

  const handleOpen = async (id: string, url: string | null) => {
    await markAsRead(id);
    if (url) navigate(url);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => navigate("/coach/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Notificações</h1>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-1" /> Marcar todas como lidas
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">Você ainda não tem notificações.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map(n => (
              <Card key={n.id} className={`p-3 ${!n.read ? "border-primary/40 bg-primary/5" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => handleOpen(n.id, n.action_url)}
                      className="text-left w-full"
                    >
                      <div className="flex items-center gap-2">
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                      </div>
                      {n.body && <p className="text-xs text-muted-foreground mt-1">{n.body}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(n.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
