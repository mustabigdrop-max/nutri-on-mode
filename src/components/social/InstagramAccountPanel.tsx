import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Check, Instagram, Loader2, RefreshCw, Unlink } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, ACCENT2, Section } from "./socialUi";
import type { InstagramAccount, InstagramExtracted, InstagramMedia } from "@/hooks/useInstagramAccount";

type Props = {
  account: InstagramAccount | null;
  loading: boolean;
  onConnect: (token: string) => Promise<unknown>;
  onSync: () => Promise<unknown>;
  onDisconnect: () => Promise<unknown>;
  onAnalyzeScreenshot?: (imageDataUrl: string) => Promise<InstagramExtracted>;
  onConnectManual?: (data: InstagramExtracted) => Promise<unknown>;
};

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("Não consegui ler a imagem."));
    fr.readAsDataURL(file);
  });

const InstagramAccountPanel = ({
  account,
  loading,
  onConnect,
  onSync,
  onDisconnect,
  onAnalyzeScreenshot,
  onConnectManual,
}: Props) => {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [mode, setMode] = useState<"screenshot" | "token">("screenshot");
  const [draft, setDraft] = useState<InstagramExtracted | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const handleScreenshot = async (file: File) => {
    if (!onAnalyzeScreenshot) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx. 8MB).");
      return;
    }
    setBusy("shot");
    try {
      const dataUrl = await readAsDataUrl(file);
      const extracted = await onAnalyzeScreenshot(dataUrl);
      setDraft(extracted);
      toast.success("Dados lidos do print. Confira antes de salvar.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui ler esse print.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const numField = (label: string, key: "followers_count" | "follows_count" | "media_count") => (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</label>
      <Input
        type="number"
        inputMode="numeric"
        value={draft?.[key] ?? ""}
        onChange={(e) =>
          setDraft((d) => (d ? { ...d, [key]: e.target.value === "" ? null : Number(e.target.value) } : d))
        }
      />
    </div>
  );

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
          Traga nome, bio e números reais do seu perfil para a Prova Social e para os DM scripts.
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "screenshot" ? "default" : "outline"}
            className="gap-2"
            style={mode === "screenshot" ? { background: ACCENT } : undefined}
            onClick={() => setMode("screenshot")}
          >
            <Camera className="w-3 h-3" /> 📸 Conectar por screenshot
          </Button>
          <Button size="sm" variant={mode === "token" ? "default" : "outline"} onClick={() => setMode("token")}>
            Token da Meta (avançado)
          </Button>
        </div>

        {mode === "screenshot" ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Jeito mais fácil: tire um print da tela do seu perfil (nome, @, bio e números visíveis) e envie aqui.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleScreenshot(e.target.files[0])}
            />
            <Button
              size="sm"
              className="gap-2"
              style={{ background: ACCENT }}
              disabled={busy === "shot" || !onAnalyzeScreenshot}
              onClick={() => fileRef.current?.click()}
            >
              {busy === "shot" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              {busy === "shot" ? "Lendo o print…" : "Enviar screenshot do perfil"}
            </Button>

            {draft && (
              <div className="space-y-3 rounded-lg border border-white/10 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: ACCENT2 }}>
                  Confira os dados extraídos
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Nome</label>
                    <Input
                      value={draft.full_name ?? ""}
                      onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Username</label>
                    <Input
                      value={draft.username ?? ""}
                      onChange={(e) => setDraft({ ...draft, username: e.target.value.replace(/^@/, "") })}
                      placeholder="seu.perfil"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Bio</label>
                  <Textarea
                    rows={4}
                    value={draft.biography ?? ""}
                    onChange={(e) => setDraft({ ...draft, biography: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {numField("Seguidores", "followers_count")}
                  {numField("Seguindo", "follows_count")}
                  {numField("Posts", "media_count")}
                </div>
                <Button
                  size="sm"
                  className="gap-2"
                  style={{ background: ACCENT }}
                  disabled={busy === "manual" || !draft.username?.trim() || !onConnectManual}
                  onClick={() =>
                    run("manual", async () => {
                      await onConnectManual?.(draft);
                      setDraft(null);
                    }, "Perfil conectado")
                  }
                >
                  {busy === "manual" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Confirmar dados
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Conexão completa com a API (permite publicar e agendar). Exige conta Business/Creator vinculada a uma Página do Facebook.
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
          </div>
        )}
      </Section>
    );
  }

  const media = account.recent_media || [];

  const engagement = (m: InstagramMedia) => (m.like_count ?? 0) + (m.comments_count ?? 0);

  const topMedia = [...media].sort((a, b) => engagement(b) - engagement(a)).slice(0, 3);

  const avgByType = (() => {
    const groups: Record<string, number[]> = {};
    media.forEach((m) => {
      const type = m.media_type === "VIDEO" || m.media_type === "REELS" ? "Reels/Vídeo" : m.media_type === "CAROUSEL_ALBUM" ? "Carrossel" : "Foto";
      (groups[type] ||= []).push(engagement(m));
    });
    return Object.entries(groups)
      .filter(([, vals]) => vals.length >= 2)
      .map(([type, vals]) => ({ type, avg: vals.reduce((a, b) => a + b, 0) / vals.length, n: vals.length }))
      .sort((a, b) => b.avg - a.avg);
  })();

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

      {topMedia.some((m) => engagement(m) > 0) && (
        <div className="pt-2 border-t border-white/5 space-y-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">🏆 Seus posts que mais engajaram</p>
          <div className="grid grid-cols-3 gap-2">
            {topMedia.map((m, i) => (
              <a key={m.id} href={m.permalink ?? "#"} target="_blank" rel="noreferrer" className="block relative">
                <img
                  src={m.media_url ?? ""}
                  alt={m.caption?.slice(0, 60) || "Publicação do Instagram"}
                  className="w-full aspect-square object-cover rounded-md border border-white/10"
                  loading="lazy"
                />
                <span
                  className="absolute top-1 left-1 text-[9px] font-mono px-1 rounded"
                  style={{ background: "rgba(0,0,0,0.7)", color: i === 0 ? "#FFD700" : ACCENT2 }}
                >
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {engagement(m).toLocaleString("pt-BR")}
                </span>
              </a>
            ))}
          </div>
          {avgByType.length >= 2 && (
            <p className="text-xs text-muted-foreground">
              💡 <b style={{ color: ACCENT2 }}>{avgByType[0].type}</b> engaja em média{" "}
              {avgByType[1].avg > 0 ? `${Math.round((avgByType[0].avg / avgByType[1].avg - 1) * 100)}%` : "muito"} mais que{" "}
              {avgByType[1].type.toLowerCase()} no seu perfil — priorize esse formato nesta semana.
            </p>
          )}
        </div>
      )}

      {media.length > 0 && (
        <div className="pt-2 space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Últimos posts</p>
          <div className="grid grid-cols-4 gap-1.5">
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
        </div>
      )}
    </Section>
  );
};

export default InstagramAccountPanel;
