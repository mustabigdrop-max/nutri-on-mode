import { MessageSquare, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ChatLimitBannerProps {
  used: number;
  limit: number;
  isUnlimited: boolean;
}

const ChatLimitBanner = ({ used, limit, isUnlimited }: ChatLimitBannerProps) => {
  if (isUnlimited) return null;

  const pct = Math.min((used / limit) * 100, 100);
  const remaining = Math.max(0, limit - used);
  const isNearLimit = used >= limit - 2 && used < limit;
  const isAtLimit = used >= limit;

  if (isAtLimit) {
    return (
      <div className="mx-4 mb-3 rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Limite atingido</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Você usou todas as mensagens deste mês.
          Seu coach ainda pode te orientar pelo painel.
          Ou assine o ON+ para chat ilimitado.
        </p>
        <Button
          size="sm"
          className="w-full bg-primary text-primary-foreground text-xs font-bold"
          onClick={() => window.location.href = "/#planos"}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Assinar ON+ →
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-3 rounded-xl border border-border bg-card/50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-mono text-muted-foreground">
            💬 {used} de {limit} mensagens usadas este mês
          </span>
        </div>
        <span className="text-xs font-mono text-primary">{remaining} restantes</span>
      </div>
      <Progress value={pct} className="h-1.5 bg-secondary [&>div]:bg-primary" />
      {isNearLimit && (
        <p className="text-[10px] text-primary/80 font-mono">
          ⚠️ Você está chegando no limite
        </p>
      )}
    </div>
  );
};

export default ChatLimitBanner;
