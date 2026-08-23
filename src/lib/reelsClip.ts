// Reels Studio — análise de energia do áudio e exportação do trecho recortado

export type EnergyAnalysis = {
  /** Envelope de energia normalizado (0–1) por janela. */
  envelope: number[];
  /** Segundos por janela do envelope. */
  windowSeconds: number;
  /** Melhor ponto de início sugerido para o hook (segundos). */
  suggestedStart: number;
  /** Pico absoluto de energia (segundos). */
  peakAt: number;
};

/**
 * Decodifica o áudio do vídeo e devolve o envelope de energia (RMS).
 * O melhor início do hook é o ponto logo antes do primeiro grande salto de energia.
 */
export async function analyzeVideoEnergy(file: File, windowSeconds = 0.25): Promise<EnergyAnalysis | null> {
  const AC: typeof AudioContext | undefined =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;

  const ctx = new AC();
  try {
    const buf = await file.arrayBuffer();
    const audio = await ctx.decodeAudioData(buf.slice(0));
    const data = audio.getChannelData(0);
    const rate = audio.sampleRate;
    const win = Math.max(1, Math.floor(rate * windowSeconds));

    const envelope: number[] = [];
    for (let i = 0; i < data.length; i += win) {
      let sum = 0;
      const end = Math.min(i + win, data.length);
      for (let j = i; j < end; j++) sum += data[j] * data[j];
      envelope.push(Math.sqrt(sum / Math.max(1, end - i)));
    }
    if (!envelope.length) return null;

    const max = Math.max(...envelope);
    if (max <= 0) return null;
    const norm = envelope.map((v) => v / max);

    const peakIdx = norm.indexOf(Math.max(...norm));

    // Primeiro salto sustentado de energia: onde a média das 4 janelas seguintes
    // supera 55% do pico e cresce em relação à janela anterior.
    let onset = peakIdx;
    for (let i = 1; i < norm.length - 4; i++) {
      const ahead = (norm[i] + norm[i + 1] + norm[i + 2] + norm[i + 3]) / 4;
      if (ahead > 0.55 && ahead > norm[i - 1] * 1.25) { onset = i; break; }
    }

    // Recua ~0,4s para não cortar o ataque do som.
    const suggested = Math.max(0, (onset * windowSeconds) - 0.4);

    return {
      envelope: norm,
      windowSeconds,
      suggestedStart: Math.round(suggested * 10) / 10,
      peakAt: Math.round(peakIdx * windowSeconds * 10) / 10,
    };
  } catch {
    return null;
  } finally {
    ctx.close().catch(() => undefined);
  }
}

function pickMime(): string | undefined {
  const candidates = [
    "video/mp4;codecs=avc1,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m));
}

export type ClipResult = { blob: Blob; ext: "mp4" | "webm"; seconds: number };

/**
 * Grava em tempo real o trecho [start,end] do elemento de vídeo e devolve o arquivo.
 * Usa MP4 quando o navegador suporta, senão WebM.
 */
export async function exportClip(
  video: HTMLVideoElement,
  start: number,
  end: number,
  onProgress?: (pct: number) => void,
): Promise<ClipResult> {
  const stream = (video as HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream });
  const capture = stream.captureStream?.bind(stream) || stream.mozCaptureStream?.bind(stream);
  if (!capture) throw new Error("Seu navegador não permite exportar o trecho. Use o Chrome no computador.");

  const mime = pickMime();
  if (!mime) throw new Error("Navegador sem suporte a gravação de vídeo.");

  const media = capture();
  const recorder = new MediaRecorder(media, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  const seconds = Math.max(0.5, end - start);
  const wasMuted = video.muted;

  await new Promise<void>((resolve) => {
    const onSeeked = () => { video.removeEventListener("seeked", onSeeked); resolve(); };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = start;
  });

  return new Promise<ClipResult>((resolve, reject) => {
    let timer = 0;
    const finish = () => {
      window.clearInterval(timer);
      video.removeEventListener("timeupdate", tick);
      video.pause();
      video.muted = wasMuted;
      if (recorder.state !== "inactive") recorder.stop();
    };
    const tick = () => {
      const pct = Math.min(100, Math.max(0, ((video.currentTime - start) / seconds) * 100));
      onProgress?.(pct);
      if (video.currentTime >= end) finish();
    };

    recorder.onstop = () => {
      const ext: "mp4" | "webm" = mime.startsWith("video/mp4") ? "mp4" : "webm";
      resolve({ blob: new Blob(chunks, { type: mime }), ext, seconds });
    };
    recorder.onerror = () => { finish(); reject(new Error("Falha ao gravar o trecho.")); };

    video.addEventListener("timeupdate", tick);
    timer = window.setInterval(tick, 200);
    recorder.start(250);
    video.play().catch(() => { finish(); reject(new Error("Não consegui reproduzir o vídeo para exportar.")); });
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
