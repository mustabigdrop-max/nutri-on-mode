// APEX Visual — pipeline de auto-detecção (MediaPipe + interpolação + snap + validação)
import { detectPoseFromFile } from "./apexMediaPipeDetector";
import { mapByView, type ApexView, type ApexLandmarkMap } from "./apexLandmarkMapper";
import { validateAndCorrectPosturalLandmarks } from "./apexLandmarkValidator";

export type DetectionSource = "mediapipe+interpolated" | "ai_vision_fallback" | "none";

export interface ApexAutoDetectResult {
  view: ApexView;
  landmarks: ApexLandmarkMap;
  source: DetectionSource;
  confidence: number; // 0-100 (média)
  corrections: string[];
}

const COLUNA_KEYS = ["spine_c7", "spine_l5"] as const;

/** Centraliza coluna no eixo médio dos ombros+quadris detectados. */
function snapColunaCenter(landmarks: ApexLandmarkMap, corrections: string[]): ApexLandmarkMap {
  const sL = landmarks.shoulder_left;
  const sR = landmarks.shoulder_right;
  const hL = landmarks.hip_left;
  const hR = landmarks.hip_right;

  let centerX: number | null = null;
  if (sL && sR && hL && hR) {
    centerX = ((sL.x + sR.x) / 2 + (hL.x + hR.x) / 2) / 2;
  } else if (sL && sR) {
    centerX = (sL.x + sR.x) / 2;
  } else if (hL && hR) {
    centerX = (hL.x + hR.x) / 2;
  }
  if (centerX === null) return landmarks;

  const out = { ...landmarks };
  COLUNA_KEYS.forEach((k) => {
    const p = out[k];
    if (!p) return;
    const dx = Math.abs(p.x - centerX!);
    if (dx > 3) {
      corrections.push(`${k} deslocado ${dx.toFixed(1)}% — centralizado`);
      out[k] = { ...p, x: centerX! };
    }
  });
  return out;
}

/**
 * Roda MediaPipe + mapeamento + snap + validação para um File.
 * Em qualquer falha, retorna source="none" com landmarks vazios — fluxo continua.
 */
export async function autoDetectFromFile(file: File, view: ApexView): Promise<ApexAutoDetectResult> {
  const corrections: string[] = [];
  try {
    const mp = await detectPoseFromFile(file);
    if (!mp) {
      return { view, landmarks: {}, source: "none", confidence: 0, corrections };
    }

    let landmarks = mapByView(mp, view);
    if (Object.keys(landmarks).length < 4) {
      return { view, landmarks: {}, source: "none", confidence: 0, corrections };
    }

    // Snap coluna ao centro
    landmarks = snapColunaCenter(landmarks, corrections);

    // Validação anatômica (compatível: aceita Record<id, {x,y}>)
    try {
      const { landmarks: fixed, correcoes } = validateAndCorrectPosturalLandmarks(landmarks as any);
      if (fixed && typeof fixed === "object") {
        // Preserva confidence/source dos originais quando o validator não devolve
        Object.keys(fixed).forEach((k) => {
          const orig = landmarks[k];
          const next = (fixed as any)[k];
          if (orig && next && typeof next.x === "number" && typeof next.y === "number") {
            (fixed as any)[k] = {
              x: next.x,
              y: next.y,
              confidence: orig.confidence,
              source: orig.source,
            };
          }
        });
        landmarks = fixed as any;
      }
      if (correcoes && Array.isArray(correcoes)) corrections.push(...correcoes);
    } catch (e) {
      console.warn("[APEX auto] validator falhou:", e);
    }

    const confArr = Object.values(landmarks)
      .map((l) => l.confidence)
      .filter((v) => typeof v === "number" && v > 0);
    const avgConf = confArr.length ? confArr.reduce((s, v) => s + v, 0) / confArr.length : 0;

    return {
      view,
      landmarks,
      source: "mediapipe+interpolated",
      confidence: Math.round(avgConf * 100),
      corrections,
    };
  } catch (e) {
    console.warn("[APEX auto] pipeline falhou:", e);
    return { view, landmarks: {}, source: "none", confidence: 0, corrections };
  }
}

/** Roda em paralelo nas 3 vistas. Qualquer file faltando vira null. */
export async function autoDetectAllViews(files: {
  front: File | null;
  back: File | null;
  side: File | null;
}): Promise<{
  front: ApexAutoDetectResult | null;
  back: ApexAutoDetectResult | null;
  lateral: ApexAutoDetectResult | null;
}> {
  const [front, back, lateral] = await Promise.all([
    files.front ? autoDetectFromFile(files.front, "front") : Promise.resolve(null),
    files.back ? autoDetectFromFile(files.back, "back") : Promise.resolve(null),
    files.side ? autoDetectFromFile(files.side, "lateral") : Promise.resolve(null),
  ]);
  return { front, back, lateral };
}

/**
 * Mescla landmarks MediaPipe sobre landmarks da IA: MediaPipe é autoritativo
 * quando presente (source !== "none"). Para campos que MediaPipe não cobriu,
 * mantém o valor da IA.
 */
export function mergeAiWithMediaPipe(
  aiLandmarks: Record<string, any> | undefined,
  mpResult: ApexAutoDetectResult | null,
): { landmarks: Record<string, any>; source: DetectionSource } {
  const ai = (aiLandmarks || {}) as Record<string, any>;
  if (!mpResult || mpResult.source === "none" || !Object.keys(mpResult.landmarks).length) {
    return { landmarks: ai, source: "ai_vision_fallback" };
  }
  const merged: Record<string, any> = { ...ai };
  Object.entries(mpResult.landmarks).forEach(([k, v]) => {
    merged[k] = { x: v.x, y: v.y };
  });
  return { landmarks: merged, source: mpResult.source };
}
