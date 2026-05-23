// APEX Visual — detecção de pose via MediaPipe Tasks Vision (singleton, modo IMAGE)
import { PoseLandmarker, FilesetResolver, type NormalizedLandmark } from "@mediapipe/tasks-vision";

let cached: PoseLandmarker | null = null;
let initPromise: Promise<PoseLandmarker> | null = null;

export const MP_LM = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

async function getDetector(): Promise<PoseLandmarker> {
  if (cached) return cached;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm",
    );
    const modelPath =
      "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task";
    try {
      cached = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: modelPath, delegate: "GPU" },
        runningMode: "IMAGE",
        numPoses: 1,
        minPoseDetectionConfidence: 0.3,
        minPosePresenceConfidence: 0.3,
        minTrackingConfidence: 0.3,
      });
    } catch (gpuErr) {
      console.warn("[APEX MP] GPU falhou, usando CPU:", gpuErr);
      cached = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: modelPath, delegate: "CPU" },
        runningMode: "IMAGE",
        numPoses: 1,
        minPoseDetectionConfidence: 0.3,
        minPosePresenceConfidence: 0.3,
        minTrackingConfidence: 0.3,
      });
    }
    return cached;
  })();
  return initPromise;
}

async function fileToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = (e) => rej(e);
      img.src = url;
    });
    // Decode garante que está pronto para canvas/MediaPipe
    if (img.decode) {
      try {
        await img.decode();
      } catch {
        /* ignore */
      }
    }
    return img;
  } finally {
    // Não revogar imediatamente: o caller pode precisar — revogamos depois do detect
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export interface MpLandmark {
  index: number;
  x: number; // 0-1
  y: number; // 0-1
  z: number;
  visibility: number;
}

/** Pré-processa a imagem aumentando contraste/brilho para favorecer detecção. */
function preprocessForMediaPipe(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d")!;
  // @ts-ignore — filter é suportado em browsers modernos
  ctx.filter = "contrast(1.4) brightness(1.1)";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  // @ts-ignore
  ctx.filter = "none";
  return canvas;
}

/**
 * Detecta pose a partir de um File. Retorna 33 landmarks normalizados (0-1).
 * Retorna null se MediaPipe não detectar corpo ou falhar.
 */
export async function detectPoseFromFile(file: File): Promise<MpLandmark[] | null> {
  try {
    const detector = await getDetector();
    const img = await fileToImage(file);
    const canvas = preprocessForMediaPipe(img);
    let result = detector.detect(canvas);
    let lms = result?.landmarks?.[0];
    // Fallback: tenta com imagem original se canvas pré-processado falhar
    if (!lms || lms.length < 20) {
      result = detector.detect(img);
      lms = result?.landmarks?.[0];
    }
    if (!lms || lms.length < 20) return null;
    return lms.map((l: NormalizedLandmark, i: number) => ({
      index: i,
      x: l.x,
      y: l.y,
      z: (l as any).z ?? 0,
      visibility: (l as any).visibility ?? 0,
    }));
  } catch (e) {
    console.warn("[APEX MP] detectPoseFromFile falhou:", e);
    return null;
  }
}
