import { PoseLandmarker, FilesetResolver, type NormalizedLandmark } from "@mediapipe/tasks-vision";

// MediaPipe Pose landmark indexes
export const LM = {
  NOSE: 0,
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16,
  LEFT_HIP: 23, RIGHT_HIP: 24,
  LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
};

export type FrameAnalysis = {
  t: number; // ms timestamp
  angles: {
    leftKnee: number; rightKnee: number;
    leftHip: number; rightHip: number;
    leftElbow: number; rightElbow: number;
    leftShoulder: number; rightShoulder: number;
    trunkLean: number;
  };
  hipY: number; // 0-1, for rep detection
};

let cachedLandmarker: PoseLandmarker | null = null;

export async function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (cachedLandmarker) return cachedLandmarker;
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
  );
  const modelPath =
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
  try {
    cachedLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: modelPath, delegate: "GPU" },
      runningMode: "VIDEO",
      numPoses: 1,
    });
  } catch (gpuErr) {
    console.warn("GPU delegate falhou, caindo para CPU:", gpuErr);
    cachedLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: modelPath, delegate: "CPU" },
      runningMode: "VIDEO",
      numPoses: 1,
    });
  }
  return cachedLandmarker;
}

function angleDeg(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);
  if (magAB === 0 || magCB === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return Math.round((Math.acos(cos) * 180) / Math.PI);
}

export function analyzeFrame(landmarks: NormalizedLandmark[], t: number): FrameAnalysis {
  const a = (i: number) => landmarks[i];
  const trunkAngle = angleDeg(a(LM.LEFT_SHOULDER), a(LM.LEFT_HIP), a(LM.LEFT_KNEE));
  return {
    t: Math.round(t),
    angles: {
      leftKnee: angleDeg(a(LM.LEFT_HIP), a(LM.LEFT_KNEE), a(LM.LEFT_ANKLE)),
      rightKnee: angleDeg(a(LM.RIGHT_HIP), a(LM.RIGHT_KNEE), a(LM.RIGHT_ANKLE)),
      leftHip: angleDeg(a(LM.LEFT_SHOULDER), a(LM.LEFT_HIP), a(LM.LEFT_KNEE)),
      rightHip: angleDeg(a(LM.RIGHT_SHOULDER), a(LM.RIGHT_HIP), a(LM.RIGHT_KNEE)),
      leftElbow: angleDeg(a(LM.LEFT_SHOULDER), a(LM.LEFT_ELBOW), a(LM.LEFT_WRIST)),
      rightElbow: angleDeg(a(LM.RIGHT_SHOULDER), a(LM.RIGHT_ELBOW), a(LM.RIGHT_WRIST)),
      leftShoulder: angleDeg(a(LM.LEFT_ELBOW), a(LM.LEFT_SHOULDER), a(LM.LEFT_HIP)),
      rightShoulder: angleDeg(a(LM.RIGHT_ELBOW), a(LM.RIGHT_SHOULDER), a(LM.RIGHT_HIP)),
      trunkLean: trunkAngle,
    },
    hipY: (a(LM.LEFT_HIP).y + a(LM.RIGHT_HIP).y) / 2,
  };
}

export function countReps(frames: FrameAnalysis[]): number {
  if (frames.length < 8) return 0;
  // Use average knee angle oscillation as proxy
  const series = frames.map(f => (f.angles.leftKnee + f.angles.rightKnee) / 2);
  let reps = 0;
  let state: "up" | "down" = "up";
  let lastExtreme = series[0];
  const THRESHOLD = 25;
  for (const v of series) {
    if (state === "up" && v < lastExtreme - THRESHOLD) {
      state = "down";
      lastExtreme = v;
    } else if (state === "down" && v > lastExtreme + THRESHOLD) {
      state = "up";
      lastExtreme = v;
      reps++;
    }
    if (state === "up" && v > lastExtreme) lastExtreme = v;
    if (state === "down" && v < lastExtreme) lastExtreme = v;
  }
  return reps;
}
