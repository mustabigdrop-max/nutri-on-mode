import { useCallback, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";

const T = {
  s: "#0a0e18", s2: "#111827", cyan: "#00D4FF", green: "#00d4a1",
  red: "#ff4757", text: "#e8edf5", muted: "#6b7a94", border: "#1e2d45",
};

const btn: React.CSSProperties = {
  padding: 14, background: T.cyan, color: "#000", border: "none", borderRadius: 8,
  fontSize: 13, fontWeight: 800, letterSpacing: 1, cursor: "pointer", width: "100%",
};

function pickMime() {
  const opts = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  return opts.find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) || "";
}

/** Grava a tela (com o vídeo congelado rodando), corta o início e entrega o arquivo pronto pro Reels. */
export default function BreakdownRecorder({ onBack }: { onBack: () => void }) {
  const [recording, setRecording] = useState(false);
  const [raw, setRaw] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [cut, setCut] = useState(0);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);

  const supported = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getDisplayMedia;

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = pickMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime || "video/webm" });
        setRaw(URL.createObjectURL(blob));
        setFinalUrl(null); setCut(0);
        stream.getTracks().forEach((t) => t.stop());
      };
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        if (rec.state !== "inactive") rec.stop();
        setRecording(false);
      });
      rec.start(500);
      recRef.current = rec;
      setRecording(true);
    } catch {
      toast({ title: "Gravação cancelada", description: "Permita a captura da tela para gravar.", variant: "destructive" });
    }
  }, []);

  const stop = () => {
    recRef.current?.state !== "inactive" && recRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
  };

  /** Regrava a partir do ponto de corte, gerando o arquivo final sem o começo. */
  const exportCut = useCallback(async () => {
    const v = previewRef.current;
    if (!v) return;
    if (cut <= 0.1) { setFinalUrl(raw); return; }
    setProcessing(true);
    try {
      const stream = (v as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream?.();
      if (!stream) { setFinalUrl(raw); return; }
      const mime = pickMime();
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const done = new Promise<void>((r) => { rec.onstop = () => r(); });
      v.currentTime = cut;
      await new Promise<void>((r) => { v.onseeked = () => r(); });
      rec.start(500);
      await v.play();
      await new Promise<void>((r) => { v.onended = () => r(); });
      rec.stop();
      await done;
      setFinalUrl(URL.createObjectURL(new Blob(chunks, { type: mime || "video/webm" })));
    } catch {
      toast({ title: "Não consegui cortar", description: "Baixe a gravação completa e corte no celular.", variant: "destructive" });
      setFinalUrl(raw);
    } finally {
      setProcessing(false);
    }
  }, [cut, raw]);

  const box: React.CSSProperties = { background: T.s, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, display: "grid", gap: 10 };

  return (
    <div style={{ ...box }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: T.cyan, letterSpacing: 1 }}>PASSO 4 — GRAVAR REELS</div>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, fontSize: 10, fontFamily: "monospace", padding: "5px 10px", borderRadius: 6, cursor: "pointer" }}>VOLTAR AO PLAYER</button>
      </div>

      {!supported && (
        <div style={{ fontSize: 12, color: T.text, background: T.s2, borderRadius: 8, padding: "10px 12px", lineHeight: 1.6 }}>
          Seu aparelho não permite gravar a tela pelo navegador. No celular: use a gravação de tela nativa, volte ao player, dê play e depois corte o início pelo app de fotos.
        </div>
      )}

      {supported && !raw && (
        <>
          <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.6 }}>
            Clique em gravar, escolha esta aba, volte ao player e dê play. O vídeo congela sozinho em cada momento com a análise completa.
          </p>
          {!recording ? (
            <button onClick={start} style={btn}>● COMEÇAR GRAVAÇÃO</button>
          ) : (
            <button onClick={stop} style={{ ...btn, background: T.red, color: "#fff" }}>■ PARAR GRAVAÇÃO</button>
          )}
        </>
      )}

      {raw && (
        <>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: T.muted, letterSpacing: 1 }}>CORTE O INÍCIO DA GRAVAÇÃO</div>
          <video ref={previewRef} src={raw} controls playsInline style={{ width: "100%", borderRadius: 10, background: "#000", maxHeight: 360 }}
            onLoadedMetadata={() => setDuration(previewRef.current?.duration || 0)} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: T.muted }}>
            <span style={{ width: 60, fontFamily: "monospace", color: T.green }}>{cut.toFixed(1)}s</span>
            <input type="range" min={0} max={Math.max(duration - 1, 0)} step={0.1} value={cut}
              onChange={(e) => { const v = parseFloat(e.target.value); setCut(v); if (previewRef.current) previewRef.current.currentTime = v; }}
              style={{ flex: 1, accentColor: T.green }} />
          </label>
          <button onClick={exportCut} disabled={processing} style={{ ...btn, opacity: processing ? 0.6 : 1 }}>
            {processing ? "PROCESSANDO..." : "GERAR VÍDEO CORTADO"}
          </button>
          {finalUrl && (
            <>
              <video src={finalUrl} controls playsInline style={{ width: "100%", borderRadius: 10, background: "#000", maxHeight: 360 }} />
              <a href={finalUrl} download="breakdown-reels.webm" style={{ ...btn, textAlign: "center", textDecoration: "none", display: "block", background: T.green }}>
                ⬇ BAIXAR PARA POSTAR
              </a>
            </>
          )}
          <button onClick={() => { setRaw(null); setFinalUrl(null); setCut(0); }} style={{ ...btn, background: T.s2, color: T.muted, border: `1px solid ${T.border}` }}>GRAVAR DE NOVO</button>
        </>
      )}
    </div>
  );
}
