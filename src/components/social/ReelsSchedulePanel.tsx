import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Film, Layers, Loader2, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const C = {
  bg: "#020205", card: "#080810", border: "#B8922A22", gold: "#B8922A",
  green: "#00C896", red: "#FF4D6D", text: "#F5F0E8", textMid: "#A0A0A0",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

export type ScheduledPost = {
  id: string;
  calendar_id: string | null;
  kind: string;
  media_type: string;
  media_url: string;
  caption: string | null;
  status: string;
  scheduled_at: string | null;
  permalink: string | null;
  error: string | null;
};

const callIg = async <T,>(payload: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke("instagram-publish", { body: payload });
  if (error) throw new Error(error.message);
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return (data as { result: T }).result;
};

export const useScheduledPosts = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const r = await callIg<{ posts: ScheduledPost[] }>({ action: "list_scheduled" });
      setPosts(r.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  return { posts, loading, refresh };
};

const statusColor = (s: string) =>
  s === "published" ? C.green : s === "failed" ? C.red : s === "publishing" ? C.gold : C.textMid;

const localValue = (date: string, time: string) => `${date}T${time}`;

export default function ReelsSchedulePanel({
  open, onClose, date, hook, caption, calendarId, onDone,
}: {
  open: boolean;
  onClose: () => void;
  date: string;
  hook?: string | null;
  caption?: string | null;
  calendarId: string;
  onDone?: () => void;
}) {
  const [kind, setKind] = useState<"reel" | "stories">("reel");
  const [mediaUrl, setMediaUrl] = useState("");
  const [when, setWhen] = useState(() => localValue(date, "19:30"));
  const [text, setText] = useState(caption || hook || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setWhen(localValue(date, kind === "stories" ? "12:00" : "19:30")); }, [date, kind]);
  useEffect(() => { setText(caption || hook || ""); }, [caption, hook]);

  if (!open) return null;

  const submit = async () => {
    if (!/^https:\/\/.+/i.test(mediaUrl.trim())) return toast.error("Cole a URL pública https do vídeo ou imagem");
    if (!when) return toast.error("Escolha data e hora");
    setSaving(true);
    try {
      await callIg({
        action: "schedule",
        kind,
        media_type: kind === "stories" ? "STORIES" : /\.(jpg|jpeg|png)(\?|$)/i.test(mediaUrl) ? "IMAGE" : "REELS",
        media_url: mediaUrl.trim(),
        caption: kind === "stories" ? "" : text,
        calendar_id: calendarId,
        scheduled_at: new Date(when).toISOString(),
      });
      toast.success("Publicação agendada");
      onDone?.();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao agendar");
    } finally {
      setSaving(false);
    }
  };

  const input = {
    width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text,
    padding: "10px 12px", ...fM, fontSize: 13,
  } as const;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 60, display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 18, width: "min(520px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ ...fT, fontSize: 22, color: C.text, display: "flex", gap: 8, alignItems: "center" }}>
            <CalendarClock size={18} color={C.gold} /> AGENDAR NO INSTAGRAM
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{ background: "none", border: "none", color: C.textMid, cursor: "pointer" }}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {([{ id: "reel", label: "REEL", Icon: Film }, { id: "stories", label: "STORIES", Icon: Layers }] as const).map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setKind(id)}
              style={{ flex: 1, padding: "10px 12px", background: kind === id ? `${C.gold}1c` : "transparent", border: `1px solid ${kind === id ? `${C.gold}66` : C.border}`, color: kind === id ? C.gold : C.textMid, ...fM, fontSize: 13, cursor: "pointer", display: "flex", justifyContent: "center", gap: 6, alignItems: "center" }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <label style={{ ...fM, fontSize: 12, color: C.textMid }}>URL pública do vídeo/imagem (https)</label>
        <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://..." style={{ ...input, margin: "6px 0 12px" }} />

        <label style={{ ...fM, fontSize: 12, color: C.textMid }}>Data e hora</label>
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} style={{ ...input, margin: "6px 0 12px" }} />

        {kind === "reel" && (
          <>
            <label style={{ ...fM, fontSize: 12, color: C.textMid }}>Legenda</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} style={{ ...input, margin: "6px 0 12px", resize: "vertical" }} />
          </>
        )}

        <button onClick={submit} disabled={saving}
          style={{ width: "100%", padding: "12px 16px", background: C.gold, border: "none", color: C.bg, ...fT, fontSize: 16, cursor: "pointer", display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <CalendarClock size={15} />} AGENDAR
        </button>
        <p style={{ ...fM, fontSize: 11, color: C.textMid, marginTop: 10, lineHeight: 1.6 }}>
          O envio acontece automaticamente no horário escolhido pela sua conta Instagram Business conectada em Social ON.
        </p>
      </div>
    </div>
  );
}

export function ScheduleBadge({ post, onCancel }: { post: ScheduledPost; onCancel?: () => void }) {
  const label = useMemo(() => {
    if (!post.scheduled_at) return post.status;
    return new Date(post.scheduled_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }, [post]);
  const color = statusColor(post.status);
  return (
    <span style={{ ...fM, fontSize: 11, color, border: `1px solid ${color}55`, padding: "4px 8px", display: "inline-flex", gap: 6, alignItems: "center" }}>
      {post.kind === "stories" ? <Layers size={11} /> : <Film size={11} />} {label}
      {onCancel && (post.status === "scheduled" || post.status === "failed") && (
        <button onClick={onCancel} aria-label="Cancelar agendamento" style={{ background: "none", border: "none", color, cursor: "pointer", padding: 0 }}>
          <Trash2 size={11} />
        </button>
      )}
    </span>
  );
}

export const cancelScheduled = async (id: string) => {
  await callIg({ action: "cancel_scheduled", id });
};
