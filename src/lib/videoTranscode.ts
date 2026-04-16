// Conversão nativa via canvas + MediaRecorder (sem FFmpeg/wasm).
// Suporta MOV, AVI, MKV → MP4 (ou WebM como fallback) usando recursos do navegador.

export function needsConversion(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    name.endsWith(".mov") ||
    name.endsWith(".avi") ||
    name.endsWith(".mkv") ||
    type === "video/quicktime" ||
    type === "video/x-msvideo" ||
    type === "video/x-matroska"
  );
}

export async function canBrowserDecode(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      URL.revokeObjectURL(url);
      resolve(ok);
    };
    v.onloadedmetadata = () => {
      if (!isFinite(v.duration) || v.duration === 0) return finish(false);
      v.currentTime = Math.min(0.1, v.duration / 2);
    };
    v.onseeked = () => finish(true);
    v.onerror = () => finish(false);
    setTimeout(() => finish(false), 5000);
    v.src = url;
  });
}

/**
 * Converte um vídeo (MOV/AVI/MKV) para MP4 (ou WebM como fallback) usando
 * canvas + MediaRecorder. Reporta progresso baseado no currentTime/duration.
 */
export async function transcodeToMp4(
  file: File,
  onProgress?: (pct: number) => void
): Promise<File> {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("Seu navegador não suporta conversão de vídeo. Converta para MP4 no celular e tente novamente.");
  }

  return new Promise<File>((resolve, reject) => {
    const tmpVideo = document.createElement("video");
    tmpVideo.muted = true;
    tmpVideo.playsInline = true;
    tmpVideo.preload = "auto";
    tmpVideo.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(tmpVideo);

    const url = URL.createObjectURL(file);
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      try { tmpVideo.pause(); } catch {}
      try { document.body.removeChild(tmpVideo); } catch {}
      URL.revokeObjectURL(url);
    };

    tmpVideo.addEventListener("error", () => {
      cleanup();
      reject(new Error("Não foi possível converter. Converta para MP4 no celular e tente novamente."));
    });

    tmpVideo.addEventListener("loadedmetadata", async () => {
      try {
        const w = tmpVideo.videoWidth || 640;
        const h = tmpVideo.videoHeight || 360;
        const duration = isFinite(tmpVideo.duration) && tmpVideo.duration > 0 ? tmpVideo.duration : 0;

        const cvs = document.createElement("canvas");
        cvs.width = w;
        cvs.height = h;
        const ctx = cvs.getContext("2d");
        if (!ctx) throw new Error("Canvas indisponível neste navegador.");

        const mimeCandidates = [
          "video/mp4;codecs=h264",
          "video/mp4",
          "video/webm;codecs=vp9",
          "video/webm;codecs=vp8",
          "video/webm",
        ];
        const mimeType =
          mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || "video/webm";

        const stream = (cvs as any).captureStream ? (cvs as HTMLCanvasElement).captureStream(30) : null;
        if (!stream) throw new Error("captureStream indisponível neste navegador.");

        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 2_500_000,
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onerror = () => {
          cleanup();
          reject(new Error("Não foi possível converter. Converta para MP4 no celular e tente novamente."));
        };
        recorder.onstop = () => {
          try {
            const blob = new Blob(chunks, { type: mimeType });
            const ext = mimeType.includes("mp4") ? ".mp4" : ".webm";
            const outType = mimeType.includes("mp4") ? "video/mp4" : "video/webm";
            const converted = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, ext),
              { type: outType }
            );
            cleanup();
            onProgress?.(100);
            resolve(converted);
          } catch (e) {
            cleanup();
            reject(e instanceof Error ? e : new Error("Falha ao finalizar conversão."));
          }
        };

        recorder.start(100);

        // Safety timer: força stop após duração + 5s (evita travamento)
        const safetyTimer = window.setTimeout(() => {
          if (recorder.state === "recording") {
            try { recorder.stop(); } catch {}
          }
        }, ((duration || 60) * 1000) + 5000);

        // Trata bloqueio de autoplay (Safari/iOS)
        await tmpVideo.play().catch(() => {
          clearTimeout(safetyTimer);
          if (recorder.state === "recording") {
            try { recorder.stop(); } catch {}
          }
          cleanup();
          reject(new Error("Não foi possível reproduzir o vídeo para conversão. Toque para liberar a reprodução e tente novamente."));
        });

        const drawLoop = () => {
          if (cleaned) { clearTimeout(safetyTimer); return; }
          if (tmpVideo.paused || tmpVideo.ended) {
            clearTimeout(safetyTimer);
            try { recorder.state !== "inactive" && recorder.stop(); } catch {}
            return;
          }
          ctx.drawImage(tmpVideo, 0, 0, w, h);
          if (duration > 0 && onProgress) {
            onProgress(Math.min(99, Math.round((tmpVideo.currentTime / duration) * 100)));
          }
          requestAnimationFrame(drawLoop);
        };
        drawLoop();

        tmpVideo.addEventListener("ended", () => {
          clearTimeout(safetyTimer);
          try { recorder.state !== "inactive" && recorder.stop(); } catch {}
        });
      } catch (err) {
        cleanup();
        reject(err instanceof Error ? err : new Error("Falha ao converter o vídeo."));
      }
    });

    tmpVideo.src = url;
  });
}
