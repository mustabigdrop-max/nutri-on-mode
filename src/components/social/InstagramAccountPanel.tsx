import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Loader2, RefreshCw, Unlink } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, ACCENT2, Section } from "./socialUi";
import type { InstagramAccount } from "@/hooks/useInstagramAccount";

type Props = {
  account: InstagramAccount | null;
  loading: boolean;
  onConnect: (token: string) => Promise<unknown>;
  onSync: () => Promise<unknown>;
  onDisconnect: () => Promise<unknown>;
};

const InstagramAccountPanel = ({ account, loading, onConnect, onSync, onDisconnect }: Props) => {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<unknown>, ok: string) => {
    setBusy(key);
    try {
      await fn();
      toast.success(ok);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na operação");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <Section title="Instagram">
        <p className="text-xs font-mono text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" /> Verificando conexão…
        </p>
      </Section>
    );
  }

  if (!account) {
    return (
      <Section title="📷 Conectar Instagram">
        <p className="text-sm text-muted-foreground">
          Conecte sua conta Instagram Business/Creator para trazer nome, bio e fotos reais para a Prova Social e para os DM scripts.
        </p>
        <Input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Cole aqui o token de acesso da Meta"
          type="password"
        />
        <Button
          size="sm"
          className="gap-2"
          style={{ background: ACCENT }}
          disabled={busy === "connect" || token.trim().length < 20}
          onClick={() => run("connect", () => onConnect(token).then(() => setToken("")), "Instagram conectado")}
        >
          {busy === "connect" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Instagram className="w-3 h-3" />} Conectar conta
        </Button>
      </Section>
    );
  }

  const media = account.recent_media || [];

  return (
    <Section
      title="📷 Conta conectada"
      right={
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1"
            disabled={busy === "sync"}
            onClick={() => run("sync", onSync, "Perfil atualizado")}
          >
            {busy === "sync" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Sincronizar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 text-red-400"
            disabled={busy === "disc"}
            onClick={() => run("disc", onDisconnect, "Conta desconectada")}
          >
            <Unlink className="w-3 h-3" /> Desconectar
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        {account.profile_picture_url ? (
          <img
            src={account.profile_picture_url}
            alt={`Foto de perfil de @${account.username ?? "instagram"}`}
            className="w-16 h-16 rounded-full object-cover border"
            style={{ borderColor: `${ACCENT}66` }}
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-16 rounded-full border flex items-center justify-center" style={{ borderColor: `${ACCENT}66` }}>
            <Instagram className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{account.full_name || account.username}</p>
          <a
            href={`https://instagram.com/${account.username ?? ""}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono"
            style={{ color: ACCENT2 }}
          >
            @{account.username}
          </a>
          {account.biography && <p className="text-xs text-muted-foreground whitespace-pre-wrap mt-1">{account.biography}</p>}
          <div className="flex gap-4 mt-2 text-[11px] font-mono text-muted-foreground">
            <span>{account.followers_count ?? "—"} seguidores</span>
            <span>{account.media_count ?? "—"} posts</span>
          </div>
        </div>
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {media.slice(0, 8).map((m) => (
            <a key={m.id} href={m.permalink ?? "#"} target="_blank" rel="noreferrer" className="block">
              <img
                src={m.media_url ?? ""}
                alt={m.caption?.slice(0, 60) || "Publicação do Instagram"}
                className="w-full aspect-square object-cover rounded-md border border-white/10"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}
    </Section>
  );
};

export default InstagramAccountPanel;
