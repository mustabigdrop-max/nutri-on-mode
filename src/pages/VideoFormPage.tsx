import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Video, Upload, Loader2, Activity, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { getPoseLandmarker, analyzeFrame, countReps, detectExercise, type FrameAnalysis } from "@/lib/poseAnalysis";
import { useFFmpegConvert } from "@/hooks/useFFmpegConvert";

const EXERCISES = [
  "Agachamento livre", "Agachamento com barra", "Leg press", "Stiff", "Levantamento terra",
  "Hip thrust", "Supino reto", "Supino inclinado", "Desenvolvimento militar", "Rosca direta",
  "Rosca alternada", "Tríceps testa", "Remada curvada", "Puxada frontal", "Push-up",
  "Prancha", "Avanço/passada", "Burpee",
];

const VideoFormPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exercise, setExercise] = useState("auto");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState<{ content: string; reps: number; frames: number } | null>(null);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const { convert: ffmpegConvert, needsConversion, isConverting: ffmpegConverting, isLoading: ffmpegLoading, progress: ffmpegProgress } = useFFmpegConvert();

  const showConversionError = (msg: string) => {
    setConversionError(msg);
    window.setTimeout(() => setConversionError(null), 8000);
  };

  const mountVideoPlayer = (file: File, displayName: string) => {
    // Hard-reset obrigatório — sem isso o browser ignora a nova src
    const v = videoRef.current;
    if (v) {
      try { v.pause(); } catch {}
      v.removeAttribute("src");
      try { v.load(); } catch {}
    }
    setVideoUrl(null);
    setOriginalFileName(displayName);
    // Delay 80ms para o browser liberar o recurso anterior antes da nova src
    setTimeout(() => {
      setVideoUrl(URL.createObjectURL(file));
    }, 80);
  };

  const [convertingFileName, setConvertingFileName] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v|avi|mkv|3gp|wmv)$/i.test(file.name);
    if (!isVideo) {
      toast({ title: "Arquivo inválido", description: "Envie um vídeo (.mp4, .mov, .webm, .avi, .mkv)", variant: "destructive" });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "Vídeo muito grande", description: "Máximo 100MB. Recorte para 10-20s.", variant: "destructive" });
      return;
    }

    setResult(null);
    setVideoUrl(null);

    let fileToLoad = file;
    if (needsConversion(file)) {
      setConvertingFileName(file.name);
      try {
        fileToLoad = await ffmpegConvert(file);
        toast({ title: "Vídeo convertido", description: "Pronto para análise." });
      } catch (err: any) {
        console.error("[VideoForm] conversão falhou:", err);
        showConversionError(err?.message || "Não foi possível converter. Converta para MP4 no celular e tente novamente.");
        setConvertingFileName(null);
        return;
      } finally {
        setConvertingFileName(null);
      }
    }

    mountVideoPlayer(fileToLoad, file.name);
  };

  const extractPoseData = async (): Promise<FrameAnalysis[]> => {
    const video = videoRef.current!;

    // Garantir que metadata carregou (duration disponível)
    if (!isFinite(video.duration) || video.duration === 0) {
      await new Promise<void>((resolve, reject) => {
        const onMeta = () => { video.removeEventListener("loadedmetadata", onMeta); resolve(); };
        const onErr = () => { video.removeEventListener("error", onErr); reject(new Error("Falha ao carregar o vídeo")); };
        video.addEventListener("loadedmetadata", onMeta);
        video.addEventListener("error", onErr);
        video.load();
        setTimeout(() => reject(new Error("Timeout carregando metadata do vídeo")), 10000);
      });
    }

    const landmarker = await getPoseLandmarker();
    const frames: FrameAnalysis[] = [];
    const duration = video.duration;
    if (!isFinite(duration) || duration <= 0) {
      throw new Error("Não foi possível ler a duração do vídeo. Tente outro arquivo (.mp4 H.264).");
    }
    const STEP = 0.15; // ~7 fps amostragem (mais leve)

    for (let t = 0; t < duration; t += STEP) {
      try {
        video.currentTime = t;
        await new Promise<void>((resolve, reject) => {
          const onSeek = () => { video.removeEventListener("seeked", onSeek); resolve(); };
          video.addEventListener("seeked", onSeek);
          setTimeout(() => { video.removeEventListener("seeked", onSeek); resolve(); }, 2000);
        });
        const result = landmarker.detectForVideo(video, Math.round(t * 1000));
        if (result.landmarks?.[0]) {
          frames.push(analyzeFrame(result.landmarks[0], t * 1000));
        }
      } catch (frameErr) {
        console.warn("Frame falhou em t=", t, frameErr);
      }
      setProgress(Math.min(95, Math.round((t / duration) * 90)));
    }
    return frames;
  };

  const handleAnalyze = async () => {
    if (!videoRef.current || !videoUrl) {
      toast({ title: "Envie um vídeo", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    setProgress(5);
    setStatusText("Carregando modelo de pose estimation...");
    setResult(null);

    try {
      setStatusText("Analisando frames do vídeo...");
      const frames = await extractPoseData();

      if (frames.length < 5) {
        toast({
          title: "Dados insuficientes",
          description: "Não foi possível detectar o corpo no vídeo. Verifique iluminação e enquadramento.",
          variant: "destructive",
        });
        setAnalyzing(false);
        setProgress(0);
        return;
      }

      const reps = countReps(frames);
      const clientHint = exercise === "auto" ? detectExercise(frames) : null;
      setStatusText("Enviando para o VideoForm AI...");
      setProgress(96);

      const { data, error } = await supabase.functions.invoke("videoform-ai", {
        body: {
          exerciseName: exercise === "auto" ? null : exercise,
          poseData: frames,
          repsDetected: reps,
          source: "upload",
          clientHint,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult({ content: data.content, reps, frames: frames.length });
      setProgress(100);
      setStatusText("");
    } catch (e: any) {
      console.error("[VideoForm] erro completo:", e);
      let msg = "Erro desconhecido";
      if (e instanceof Event) {
        const v = videoRef.current;
        const code = v?.error?.code;
        const codeMap: Record<number, string> = {
          1: "Carregamento abortado",
          2: "Erro de rede ao carregar vídeo",
          3: "Falha ao decodificar (codec não suportado — use MP4 H.264)",
          4: "Formato de vídeo não suportado pelo navegador (use MP4 H.264, evite .mov/HEVC do iPhone)",
        };
        msg = code ? codeMap[code] || `Erro de vídeo (código ${code})` : "Falha ao processar o vídeo. Tente outro arquivo (MP4 H.264).";
      } else if (e?.message) {
        msg = e.message;
      } else if (typeof e === "string") {
        msg = e;
      }
      toast({ title: "Erro na análise", description: msg, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-4 sticky top-0 bg-background/90 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Video className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">VideoForm AI</h1>
            <p className="text-xs text-muted-foreground">Análise biomecânica de execução pelo sistema · Pose estimation + Dr. BioMech</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        <Card className="border-primary/20">
          <CardContent className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Exercício (opcional)</label>
                <Select value={exercise} onValueChange={setExercise}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🤖 Detectar automaticamente</SelectItem>
                    {EXERCISES.map(ex => <SelectItem key={ex} value={ex}>{ex}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Vídeo (10–20s, lateral)</label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            </div>

            {videoUrl && (
              <div className="space-y-2">
                <div className="rounded-lg overflow-hidden border border-border bg-black">
                  <video ref={videoRef} src={videoUrl} controls className="w-full max-h-[400px] mx-auto" playsInline muted />
                </div>
                {originalFileName && (
                  <p className="text-xs text-muted-foreground font-mono truncate">📁 {originalFileName}</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || !videoUrl}
                className="flex-1"
                size="lg"
              >
                {analyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analisando...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Analisar Execução</>
                )}
              </Button>
            </div>

            {analyzing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{statusText}</span>
                  <span className="font-mono text-primary">{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!videoUrl && !result && (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="p-8 text-center space-y-3">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="font-semibold">Como gravar o vídeo ideal</h3>
              <ul className="text-sm text-muted-foreground space-y-1 max-w-md mx-auto text-left list-disc pl-5">
                <li><strong>Ângulo:</strong> lateral 90° (para agachamento, terra, hip thrust, push-up, prancha)</li>
                <li><strong>Distância:</strong> corpo inteiro visível com 20cm de margem</li>
                <li><strong>Iluminação:</strong> evite contraluz; ambiente bem iluminado</li>
                <li><strong>Duração:</strong> 10-20 segundos com 3-5 repetições limpas</li>
                <li><strong>Roupa:</strong> ajustada ao corpo facilita detecção dos pontos</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/30">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">
                    {result.frames} frames analisados · {result.reps} reps detectadas
                  </span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{result.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      {convertingFileName && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 backdrop-blur-md shadow-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              <p className="text-sm font-semibold text-amber-500 truncate">
                Convertendo {convertingFileName}…
              </p>
            </div>
            <p className="text-xs text-amber-200/80">
              {ffmpegLoading
                ? "Carregando FFmpeg (primeira vez ~30MB)…"
                : ffmpegProgress > 0
                ? `${ffmpegProgress}% concluído`
                : "Iniciando FFmpeg…"}
            </p>
            <div className="h-1.5 rounded-full bg-amber-950/40 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-200"
                style={{ width: `${ffmpegProgress}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-amber-200/60 text-right">{ffmpegProgress}%</p>
          </div>
        </div>
      )}

      {conversionError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
          <div className="rounded-lg border border-destructive/50 bg-destructive/15 backdrop-blur-md shadow-2xl p-4">
            <p className="text-sm font-semibold text-destructive">Erro na conversão</p>
            <p className="text-xs text-destructive/90 mt-1">{conversionError}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFormPage;
