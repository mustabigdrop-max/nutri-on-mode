import { Bell, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { items, unreadCount, markAsRead, markAllAsRead } = useNotifications(15);

  const handleClick = async (id: string, url: string | null) => {
    await markAsRead(id);
    if (url) navigate(url);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center bg-primary text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="text-sm font-semibold">Notificações</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
              <Check className="w-3 h-3 mr-1" /> Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Sem notificações.</p>
          ) : (
            <div className="divide-y divide-border">
              {items.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n.id, n.action_url)}
                  className={`w-full text-left p-3 hover:bg-muted/50 transition ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    {n.action_url && <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate("/notificacoes")}>
            Ver todas
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
