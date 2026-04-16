import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;

async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  const ffmpeg = new FFmpeg();
  if (onLog) ffmpeg.on("log", ({ message }) => onLog(message));
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

/**
 * Verifica se o navegador consegue decodificar o vídeo (toca metadata + 1 seek).
 */
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
 * Transcodifica qualquer vídeo (.mov, HEVC etc.) para MP4 H.264 + AAC compatível com browser.
 */
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
  const inputName = "input." + (file.name.split(".").pop() || "mov");
  const outputName = "output.mp4";
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-crf", "28",
    "-vf", "scale='min(720,iw)':-2",
    "-an", // sem áudio (não precisamos para análise)
    "-movflags", "+faststart",
    outputName,
  ]);
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data as Uint8Array], { type: "video/mp4" });
  return new File([blob], file.name.replace(/\.[^.]+$/, ".mp4"), { type: "video/mp4" });
}
