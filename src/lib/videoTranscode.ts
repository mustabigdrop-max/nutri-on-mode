import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import coreURL from "@ffmpeg/core?url";
import wasmURL from "@ffmpeg/core/wasm?url";

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

async function loadWithTimeout(ffmpeg: FFmpeg, onLog?: (msg: string) => void): Promise<void> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 20000);

  try {
    await ffmpeg.load(
      {
        coreURL: await toBlobURL(coreURL, "text/javascript"),
        wasmURL: await toBlobURL(wasmURL, "application/wasm"),
      },
      { signal: controller.signal }
    );
  } catch (error) {
    ffmpeg.terminate();
    if (controller.signal.aborted) {
      throw new Error("O motor de conversão demorou para iniciar. Tente novamente em uma conexão melhor ou envie o vídeo já em MP4.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    if (onLog) ffmpeg.off("log", ({ message }) => onLog(message));
  }
}

async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;

  if (!ffmpegLoadPromise) {
    const ffmpeg = new FFmpeg();
    if (onLog) ffmpeg.on("log", ({ message }) => onLog(message));

    ffmpegLoadPromise = loadWithTimeout(ffmpeg, onLog)
      .then(() => {
        ffmpegInstance = ffmpeg;
        return ffmpeg;
      })
      .catch((error) => {
        ffmpegLoadPromise = null;
        throw error;
      });
  }

  return ffmpegLoadPromise;
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

export async function transcodeToMp4(
  file: File,
  onProgress?: (pct: number) => void
): Promise<File> {
  const ffmpeg = await getFFmpeg();
  if (onProgress) {
    ffmpeg.on("progress", ({ progress }) => {
      onProgress(Math.min(99, Math.round(progress * 100)));
    });
  }

  const inputExt = file.name.split(".").pop() || "mov";
  const inputName = `input.${inputExt}`;
  const outputName = "output.mp4";
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const primaryArgs = [
    "-i", inputName,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-crf", "30",
    "-vf", "scale=720:-2:force_original_aspect_ratio=decrease",
    "-pix_fmt", "yuv420p",
    "-an",
    "-movflags", "+faststart",
    outputName,
  ];

  const fallbackArgs = [
    "-i", inputName,
    "-c:v", "mpeg4",
    "-q:v", "8",
    "-vf", "scale=720:-2:force_original_aspect_ratio=decrease",
    "-an",
    outputName,
  ];

  let exitCode = await ffmpeg.exec(primaryArgs, 120000);
  if (exitCode !== 0) {
    try {
      await ffmpeg.deleteFile(outputName);
    } catch {}
    exitCode = await ffmpeg.exec(fallbackArgs, 120000);
  }

  if (exitCode !== 0) {
    throw new Error("Falha ao converter o vídeo no navegador.");
  }

  const data = await ffmpeg.readFile(outputName);
  const bytes = data instanceof Uint8Array ? new Uint8Array(data) : new TextEncoder().encode(data as string);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "video/mp4" });
  return new File([blob], file.name.replace(/\.[^.]+$/, ".mp4"), { type: "video/mp4" });
}
