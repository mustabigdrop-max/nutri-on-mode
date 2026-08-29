// SOCIAL ON — MODO LOTE: sobe várias fotos/vídeos de uma vez, a IA analisa
// cada um (vídeo inteiro, não só 1 frame) e devolve a semana de conteúdo
// pronta — legenda, hashtags, texto e horário sugerido — com agendamento
// automático direto no Instagram.
import { useRef, useState } from "react";
import {
  Calendar, Check, Instagram, Loader2, Rocket, Send, Sparkles, Trash2, Upload, X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useInstagramAccount } from "@/hooks/useInstagramAccount";
import { usePublishToInstagram } from "@/hooks/usePublishToInstagram";
import { useFFmpegConvert } from "@/hooks/useFFmpegConvert";
import { compressImageFile, storyboardFromUrl } from "@/lib/socialMediaFrames";

const C = {
  bg: "#020205", border: "#B8922A22", gold: "#B8922A",
  goldBg: "#B8922A08", cyan: "#00D4FF", green: "#00C896", red: "#ff4444",
  text: "#F5F0E8", textMid: "#888888", textMuted: "#2A2A2A",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

const MAX_BATCH = 7;
const WEEKDAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
const DEFAULT_TIMES = ["19:30", "12:30", "19:30", "12:30", "19:30", "11:00", "18:00"];

type Version = { nome?: string; texto_video?: string; legenda?: string; hashtags?: string[]; self_comment?: string; horario?: string };

type Item = {
  id: string;
  file: File;
  kind: "image" | "video";
  thumb: string | null;
  status: "queued" | "processing" | "done" | "error";
  error?: string;
  version?: Version;
  scheduledAt: string; // valor de <input type="datetime-local">
  outcome?: "scheduled" | "published" | "failed";
};

const uid = () => Math.random().toString(36).slice(2);

const detectKind = (f: File): "image" | "video" | null => {
  if (f.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name)) return "image";
  if (f.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|m4v|3gp)$/i.test(f.name)) return "video";
  return null;
};

const parseTime = (s?: string): string | null => {
  const m = (s || "").match(/(\d{1,2})[:h](\d{2})?/);
  if (!m) return null;
  const h = Math.min(23, parseInt(m[1], 10));
  const min = m[2] ? Math.min(59, parseInt(m[2], 10)) : 0;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
};

const defaultSlotFor = (index: number, version?: Version): string => {
  const d = new Date();
  d.setDate(d.getDate() + index + 1); // começa amanhã
  const time = parseTime(version?.horario) || DEFAULT_TIMES[index % DEFAULT_TIMES.length];
  const [h, m] = time.split(":");
  d.setHours(Number(h), Number(m), 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function SocialOnBatchPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [processingAll, setProcessingAll] = useState(false);
  const [schedulingAll, setSchedulingAll] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [igToken, setIgToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const coachId = user?.id;
  const ig = useInstagramAccount(!!coachId);
  const ffConvert = useFFmpegConvert();
  const { publish, schedule, publishing } = usePublishToInstagram();

  const canPublish = !!ig.account && ig.account.source !== "screenshot";

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const room = MAX_BATCH - items.length;
    if (room <= 0) { toast.error(`Máximo ${MAX_BATCH} arquivos por lote (dá pra rodar de novo depois)`); return; }
    const picked = Array.from(list).slice(0, room);
    const next: Item[] = [];
    picked.forEach((file) => {
      const kind = detectKind(file);
      if (!kind) { toast.error(`${file.name}: formato não suportado`); return; }
      next.push({ id: uid(), file, kind, thumb: null, status: "queued", scheduledAt: "" });
    });
    setItems((p) => [...p, ...next]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeItem = (id: string) => setItems((p) => p.filter((i) => i.id !== id));

  const connectInstagram = async () => {
    if (igToken.trim().length < 20) return;
    setConnecting(true);
    try {
      await ig.connect(igToken.trim());
      setIgToken("");
      setShowConnect(false);
      toast.success("Instagram conectado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao conectar Instagram.");
    } finally {
      setConnecting(false);
    }
  };

  /** Processa 1 item: captura frame(s), chama a IA, guarda a versão gerada. */
  const processItem = async (item: Item, index: number) => {
    setItems((p) => p.map((i) => (i.id === item.id ? { ...i, status: "processing" } : i)));
    try {
      let image: string | null = null;
      let frames: string[] | null = null;
      let thumb: string | null = null;

      if (item.kind === "image") {
        image = await compressImageFile(item.file);
        if (!image) throw new Error("Não consegui ler essa imagem.");
        thumb = image;
      } else {
        let workingFile = item.file;
        if (ffConvert.needsConversion(workingFile)) {
          workingFile = await ffConvert.convertWithFallback(workingFile);
        }
        const url = URL.createObjectURL(workingFile);
        try {
          const board = await storyboardFromUrl(url);
          frames = board.frames;
          thumb = board.frames[0] ?? null;
          board.video.remove();
        } finally {
          URL.revokeObjectURL(url);
        }
      }

      const { data: res, error: fnErr } = await supabase.functions.invoke("prism-analyze", {
        body: frames
          ? { mode: "social_versoes", images: frames, from_video: true }
          : { mode: "social_versoes", image, from_video: false },
      });
      if (fnErr) throw new Error(fnErr.message);
      if ((res as { error?: string })?.error) throw new Error((res as { error?: string }).error as string);
      const versoes = ((res as { result?: { versoes?: Version[] } })?.result?.versoes || []).filter(Boolean);
      if (!versoes.length) throw new Error("A IA não devolveu nenhuma versão.");
      const version = versoes[0];

      setItems((p) => p.map((i) => (i.id === item.id
        ? { ...i, status: "done", thumb, version, scheduledAt: defaultSlotFor(index, version) }
        : i)));
    } catch (e) {
      setItems((p) => p.map((i) => (i.id === item.id
        ? { ...i, status: "error", error: e instanceof Error ? e.message : "Falha ao processar" }
        : i)));
    }
  };

  const processAll = async () => {
    setProcessingAll(true);
    try {
      const queue = items.filter((i) => i.status === "queued" || i.status === "error");
      for (let k = 0; k < queue.length; k++) {
        const idxInItems = items.findIndex((i) => i.id === queue[k].id);
        await processItem(queue[k], idxInItems);
      }
      toast.success("Semana de conteúdo pronta");
    } finally {
      setProcessingAll(false);
    }
  };

  const scheduleItem = async (item: Item) => {
    if (!coachId || !item.version) return;
    if (!canPublish) { setShowConnect(true); return; }
    try {
      const caption = [item.version.legenda, "", (item.version.hashtags ?? []).join(" ")].filter(Boolean).join("\n");
      await schedule({
        coachId,
        file: item.file,
        mediaKind: item.kind === "video" ? "REELS" : "IMAGE",
        caption,
        scheduledAt: new Date(item.scheduledAt),
        forceConvert: false,
      });
      setItems((p) => p.map((i) => (i.id === item.id ? { ...i, outcome: "scheduled" } : i)));
      toast.success("Agendado!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao agendar");
    }
  };

  const publishItemNow = async (item: Item) => {
    if (!coachId || !item.version) return;
    if (!canPublish) { setShowConnect(true); return; }
    try {
      const caption = [item.version.legenda, "", (item.version.hashtags ?? []).join(" ")].filter(Boolean).join("\n");
      await publish({
        coachId,
        file: item.file,
        mediaKind: item.kind === "video" ? "REELS" : "IMAGE",
        caption,
        forceConvert: false,
      });
      setItems((p) => p.map((i) => (i.id === item.id ? { ...i, outcome: "published" } : i)));
      toast.success("Publicado!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao publicar");
    }
  };

  const scheduleAll = async () => {
    if (!canPublish) { setShowConnect(true); return; }
    setSchedulingAll(true);
    try {
      const pending = items.filter((i) => i.status === "done" && !i.outcome);
      for (const item of pending) {
        await scheduleItem(item);
      }
    } finally {
      setSchedulingAll(false);
    }
  };

  const doneCount = items.filter((i) => i.status === "done").length;
  const scheduledCount = items.filter((i) => i.outcome === "scheduled" || i.outcome === "published").length;

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ ...fT, fontSize: 24, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
          <Rocket size={18} color={C.gold} /> SOCIAL ON · MODO LOTE
        </div>
        <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 2 }}>
          Sobe até {MAX_BATCH} fotos/vídeos de uma vez — sai a semana inteira de posts prontos e agendados
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={(e) => addFiles(e.target.files)} style={{ display: "none" }} />

      {items.length === 0 && (
        <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${C.border}`, padding: "44px 16px", textAlign: "center", cursor: "pointer" }}>
          <Upload size={28} color={C.gold} style={{ margin: "0 auto" }} />
          <div style={{ ...fT, fontSize: 20, color: C.text, marginTop: 10 }}>Sobe a semana toda de uma vez</div>
          <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 4 }}>Fotos e vídeos misturados · até {MAX_BATCH} arquivos</div>
        </div>
      )}

      {items.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={items.length >= MAX_BATCH}
              style={{ padding: "9px 14px", background: "transparent", border: `1px solid ${C.border}`, ...fM, fontSize: 12, color: C.textMid, cursor: items.length >= MAX_BATCH ? "default" : "pointer", opacity: items.length >= MAX_BATCH ? 0.5 : 1, display: "flex", alignItems: "center", gap: 6 }}
            >
              <Upload size={12} /> ADICIONAR MAIS
            </button>
            <button
              onClick={processAll}
              disabled={processingAll || !items.some((i) => i.status === "queued" || i.status === "error")}
              style={{ flex: 1, minWidth: 200, padding: "12px 0", background: C.gold, border: "none", ...fT, fontSize: 14, color: C.bg, cursor: processingAll ? "default" : "pointer", opacity: processingAll ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {processingAll ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {processingAll ? "Gerando conteúdo..." : "GERAR CONTEÚDO DE TODOS"}
            </button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {items.map((item, idx) => (
              <div key={item.id} style={{ border: `1px solid ${C.border}`, padding: 10, display: "flex", gap: 10 }}>
                <div style={{ width: 56, flexShrink: 0 }}>
                  {item.thumb ? (
                    <img src={item.thumb} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 4 }} />
                  ) : (
                    <div style={{ width: 56, height: 56, background: C.goldBg, display: "grid", placeItems: "center", borderRadius: 4 }}>
                      {item.status === "processing" ? <Loader2 size={16} color={C.gold} className="animate-spin" /> : <span style={{ ...fM, fontSize: 10, color: C.textMuted }}>{item.kind === "video" ? "VÍDEO" : "FOTO"}</span>}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {item.status === "error" && (
                    <p style={{ ...fM, fontSize: 11, color: C.red }}>{item.error}</p>
                  )}
                  {item.status === "queued" && (
                    <p style={{ ...fM, fontSize: 11, color: C.textMid }}>{item.file.name} · aguardando gerar</p>
                  )}
                  {item.status === "processing" && (
                    <p style={{ ...fM, fontSize: 11, color: C.gold }}>Analisando...</p>
                  )}
                  {item.status === "done" && item.version && (
                    <div style={{ display: "grid", gap: 4 }}>
                      <p style={{ ...fT, fontSize: 13, color: C.text }}>{item.version.texto_video || item.version.nome}</p>
                      <p style={{ ...fM, fontSize: 11, color: C.textMid, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {(item.version.legenda || "").slice(0, 70)}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ ...fM, fontSize: 10, color: C.cyan, display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={11} /> {WEEKDAYS[new Date(item.scheduledAt).getDay()]}
                        </span>
                        <input
                          type="datetime-local"
                          value={item.scheduledAt}
                          onChange={(e) => setItems((p) => p.map((i) => (i.id === item.id ? { ...i, scheduledAt: e.target.value } : i)))}
                          disabled={!!item.outcome}
                          style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text, ...fM, fontSize: 11, padding: "3px 6px" }}
                        />
                      </div>
                      {item.outcome ? (
                        <span style={{ ...fM, fontSize: 11, color: C.green, display: "flex", alignItems: "center", gap: 4 }}>
                          <Check size={12} /> {item.outcome === "scheduled" ? "Agendado" : "Publicado"}
                        </span>
                      ) : (
                        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                          <button onClick={() => scheduleItem(item)} disabled={publishing} style={{ padding: "6px 10px", background: C.goldBg, border: `1px solid ${C.border}`, ...fM, fontSize: 11, color: C.gold, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                            <Calendar size={11} /> AGENDAR
                          </button>
                          <button onClick={() => publishItemNow(item)} disabled={publishing} style={{ padding: "6px 10px", background: "transparent", border: `1px solid ${C.border}`, ...fM, fontSize: 11, color: C.textMid, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                            <Send size={11} /> PUBLICAR AGORA
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!item.outcome && (
                  <button onClick={() => removeItem(item.id)} aria-label="Remover" style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", alignSelf: "flex-start" }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {doneCount > 0 && (
            <div style={{ border: `1px solid ${C.border}`, padding: 10, display: "grid", gap: 8 }}>
              {canPublish ? (
                <button
                  onClick={scheduleAll}
                  disabled={schedulingAll || doneCount === scheduledCount}
                  style={{ width: "100%", padding: "13px 0", background: C.green, border: "none", ...fT, fontSize: 15, color: "#02150E", cursor: schedulingAll ? "default" : "pointer", opacity: schedulingAll ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {schedulingAll ? <Loader2 size={15} className="animate-spin" /> : <Calendar size={15} />}
                  {schedulingAll ? "Agendando a semana..." : `AGENDAR A SEMANA TODA (${doneCount - scheduledCount})`}
                </button>
              ) : showConnect ? (
                <>
                  <p style={{ ...fM, fontSize: 11, color: C.textMid, lineHeight: 1.5 }}>
                    Cole o token de acesso da sua conta Instagram Business/Creator (Meta Graph API) pra agendar e publicar direto daqui.
                  </p>
                  <input
                    type="password"
                    value={igToken}
                    onChange={(e) => setIgToken(e.target.value)}
                    placeholder="Token de acesso do Instagram/Facebook"
                    style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "10px 12px", ...fM, fontSize: 13 }}
                  />
                  <button
                    onClick={connectInstagram}
                    disabled={connecting || igToken.trim().length < 20}
                    style={{ width: "100%", padding: "10px 0", background: C.gold, border: "none", ...fT, fontSize: 13, color: C.bg, cursor: connecting ? "default" : "pointer", opacity: connecting ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    {connecting ? <Loader2 size={13} className="animate-spin" /> : <Instagram size={13} />} CONECTAR
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowConnect(true)}
                  style={{ width: "100%", padding: "13px 0", background: "transparent", border: `1px dashed ${C.border}`, ...fT, fontSize: 14, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <Instagram size={15} color={C.gold} /> CONECTAR INSTAGRAM PRA AGENDAR
                </button>
              )}
            </div>
          )}

          <p style={{ ...fM, fontSize: 10, color: C.textMuted, lineHeight: 1.6 }}>
            No modo lote, o vídeo é publicado como veio (sem o texto na tela queimado) — pra isso, use o "1 Toque" com um vídeo por vez.
          </p>

          {items.some((i) => i.outcome) && (
            <button
              onClick={() => setItems((p) => p.filter((i) => !i.outcome))}
              style={{ width: "100%", padding: "10px 0", background: "transparent", border: `1px solid ${C.border}`, ...fT, fontSize: 12, color: C.textMid, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Trash2 size={12} /> LIMPAR JÁ AGENDADOS/PUBLICADOS
            </button>
          )}
        </div>
      )}
    </div>
  );
}
