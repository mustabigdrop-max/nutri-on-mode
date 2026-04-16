import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

function getExt(filename: string): string {
  const m = filename.match(/\.[^.]+$/);
  return m ? m[0] : ".mov";
}

export function useFFmpegConvert() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    setIsLoading(true);
    try {
      const ffmpeg = new FFmpeg();
      // jsDelivr — CDN mais estável que unpkg
      const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd";

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      ffmpeg.on("progress", ({ progress: p }) => {
        setProgress(Math.max(0, Math.min(100, Math.round(p * 100))));
      });

      ffmpegRef.current = ffmpeg;
      return ffmpeg;
    } finally {
      setIsLoading(false);
    }
  };

  const convert = async (file: File): Promise<File> => {
    setIsConverting(true);
    setProgress(0);
    setError(null);

    try {
      const ffmpeg = await load();
      const inputName = "input" + getExt(file.name);
      const outputName = "output.mp4";

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Comando robusto para MOV do iPhone (HEVC ou H.264)
      await ffmpeg.exec([
        "-i", inputName,
        "-c:v", "libx264",
        "-profile:v", "baseline",
        "-level", "3.0",
        "-preset", "ultrafast",
        "-crf", "28",
        "-c:a", "aac",
        "-b:a", "128k",
        "-ac", "2",
        "-movflags", "+faststart",
        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-y", outputName,
      ]);

      const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
      const buf = new Uint8Array(data);
      const blob = new Blob([buf.buffer as ArrayBuffer], { type: "video/mp4" });
      const converted = new File(
        [blob],
        file.name.replace(/\.[^.]+$/, ".mp4"),
        { type: "video/mp4" }
      );

      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});

      return converted;
    } catch (err) {
      const raw = (err as Error).message || String(err) || "";
      let msg: string;
      if (/SharedArrayBuffer|cross-origin|crossOriginIsolated/i.test(raw)) {
        msg = "Erro de configuração do servidor (Cross-Origin Isolation). Recarregue a página; se persistir, contate o suporte.";
      } else if (/memory|OOM|out of memory|allocat/i.test(raw)) {
        msg = "Vídeo muito grande para converter no navegador. Tente um vídeo menor que 100MB ou recorte para 10–20s.";
      } else {
        msg = "Não foi possível converter o vídeo. No iPhone vá em Ajustes → Câmera → Formatos → 'Mais Compatível' (grava em MP4/H.264) e tente novamente.";
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsConverting(false);
    }
  };

  // Fallback: tenta usar o arquivo original sem converter
  // (funciona para MOV H.264 em Chrome/Edge — falha apenas para HEVC)
  const convertWithFallback = async (file: File): Promise<File> => {
    try {
      return await convert(file);
    } catch (err) {
      console.warn("[FFmpeg] conversão falhou, tentando fallback direto:", err);
      return file;
    }
  };

  const needsConversion = (file: File): boolean => {
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return (
      name.endsWith(".mov") ||
      name.endsWith(".avi") ||
      name.endsWith(".mkv") ||
      name.endsWith(".3gp") ||
      name.endsWith(".wmv") ||
      type === "video/quicktime" ||
      type === "video/x-msvideo" ||
      type === "video/x-matroska"
    );
  };

  return { convert, convertWithFallback, needsConversion, isConverting, isLoading, progress, error };
}
