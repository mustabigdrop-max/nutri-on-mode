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
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

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

      await ffmpeg.exec([
        "-i", inputName,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-movflags", "+faststart",
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
      const msg = (err as Error).message || "Erro na conversão";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsConverting(false);
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

  return { convert, needsConversion, isConverting, isLoading, progress, error };
}
