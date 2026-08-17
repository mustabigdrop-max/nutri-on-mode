import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Lock, Play, Hourglass, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const GOLD = "#E8A020";
const DIM = "rgba(255,255,255,0.55)";
const BUCKET = "mce-voice";

type Note = {
  id: string;
  kind: "journal" | "capsule";
  audio_path: string;
  duration_seconds: number;
  note_date: string;
  unlock_at: string | null;
  created_at: string;
};

const CAPSULE_WINDOWS = [
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
  { label: "180 dias", days: 180 },
  { label: "365 dias", days: 365 },
];

const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

/** 📼 Voice Journal + ⏳ Cápsula do Tempo — gravações de voz própria do cliente. */
export default function VoiceJournalPanel({ onPlay }: { onPlay: (src: string, title: string) => void }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [recording, setRecording] = useState<null | { kind: "journal" | "capsule"; days?: number }>(null);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("mce_voice_notes")
      .select("id, kind, audio_path, duration_seconds, note_date, unlock_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setNotes((data as Note[]) ?? []);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const stopTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => () => stopTimer(), []);

  const start = async (kind: "journal" | "capsule", days?: number) => {
    if (!user) return;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error("Precisamos do microfone para gravar.");
      return;
    }
    chunksRef.current = [];
    const rec = new MediaRecorder(stream);
    rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      stopTimer();
      const seconds = elapsedRef.current;
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
      setRecording(null);
      setElapsed(0);
      if (blob.size < 2048) {
        toast.error("Gravação muito curta — tente de novo.");
        return;
      }
      setBusy(true);
      const ext = (rec.mimeType || "").includes("mp4") ? "m4a" : "webm";
      const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type });
      if (up.error) {
        setBusy(false);
        toast.error("Não foi possível salvar a gravação.");
        return;
      }
      const unlock_at = days ? new Date(Date.now() + days * 86400000).toISOString() : null;
      await supabase.from("mce_voice_notes").insert({
        user_id: user.id,
        kind,
        audio_path: path,
        duration_seconds: seconds,
        unlock_at,
      });
      setBusy(false);
      toast.success(kind === "capsule" ? "Cápsula trancada. Até o desbloqueio." : "Nota de voz salva.");
      load();
    };
    recRef.current = rec;
    rec.start();
    setRecording({ kind, days });
    setElapsed(0);
    elapsedRef.current = 0;
    timerRef.current = window.setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
  };

  const stop = () => recRef.current?.stop();

  const play = async (n: Note) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(n.audio_path, 3600);
    if (error || !data?.signedUrl) {
      toast.error("Não foi possível abrir esta gravação.");
      return;
    }
    onPlay(data.signedUrl, n.kind === "capsule" ? `Cápsula de ${fmtDate(n.created_at)}` : `Voice Journal · ${fmtDate(n.created_at)}`);
  };

  const journal = notes.filter((n) => n.kind === "journal");
  const capsules = notes.filter((n) => n.kind === "capsule");

  return (
    <section className="rounded-2xl p-4 space-y-4" style={{ border: `1px solid ${GOLD}22`, background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center gap-2">
        <Radio className="w-4 h-4" style={{ color: GOLD }} />
        <h2 className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: GOLD }}>
          📼 Voice Journal · ⏳ Cápsula do Tempo
        </h2>
      </div>

      {recording ? (
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "#EF4444" }} />
          <span className="text-sm font-mono">{String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}</span>
          <button onClick={stop} className="text-xs font-bold px-3 py-2 rounded-lg inline-flex items-center gap-2" style={{ background: "#EF4444", color: "#03030a" }}>
            <Square className="w-3.5 h-3.5" /> Parar e salvar
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => start("journal")}
            disabled={busy}
            className="text-xs font-bold px-3 py-2 rounded-lg inline-flex items-center gap-2"
            style={{ background: GOLD, color: "#03030a", opacity: busy ? 0.6 : 1 }}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mic className="w-3.5 h-3.5" />}
            Gravar nota do dia
          </button>
          {CAPSULE_WINDOWS.map((c) => (
            <button
              key={c.days}
              onClick={() => start("capsule", c.days)}
              disabled={busy}
              className="text-xs font-bold px-3 py-2 rounded-lg inline-flex items-center gap-1.5"
              style={{ border: `1px solid ${GOLD}55`, color: GOLD }}
            >
              <Hourglass className="w-3.5 h-3.5" /> Cápsula {c.label}
            </button>
          ))}
        </div>
      )}

      {capsules.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[1.5px]" style={{ color: DIM }}>Cápsulas</p>
          {capsules.map((n) => {
            const locked = n.unlock_at ? new Date(n.unlock_at) > new Date() : false;
            return (
              <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <button
                  onClick={() => (locked ? toast.message(`Desbloqueia em ${fmtDate(n.unlock_at!)}`) : play(n))}
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: locked ? "rgba(255,255,255,0.08)" : GOLD, color: locked ? DIM : "#03030a" }}
                  aria-label={locked ? "Cápsula trancada" : "Ouvir cápsula"}
                >
                  {locked ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Gravada em {fmtDate(n.created_at)}</p>
                  <p className="text-[11px]" style={{ color: DIM }}>
                    {locked ? `Trancada até ${fmtDate(n.unlock_at!)}` : "Desbloqueada — ouça sua voz do passado"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {journal.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[1.5px]" style={{ color: DIM }}>
            Timeline sonora · {journal.length} gravações
          </p>
          {journal.slice(0, 12).map((n) => (
            <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
              <button
                onClick={() => play(n)}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: GOLD, color: "#03030a" }}
                aria-label="Ouvir nota"
              >
                <Play className="w-3.5 h-3.5 ml-0.5" />
              </button>
              <p className="text-sm">{fmtDate(n.created_at)}</p>
              <p className="text-[11px] ml-auto font-mono" style={{ color: DIM }}>
                {Math.floor(n.duration_seconds / 60)}:{String(n.duration_seconds % 60).padStart(2, "0")}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
