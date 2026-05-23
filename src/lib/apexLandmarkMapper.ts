// APEX Visual — mapeamento MediaPipe → IDs APEX por vista (frente/costas/lateral)
// Coordenadas de saída em 0-100 (overlay APEX espera percentuais).
import { MP_LM, type MpLandmark } from "./apexMediaPipeDetector";

export type ApexView = "front" | "back" | "lateral";

export interface ApexLm {
  x: number; // 0-100
  y: number; // 0-100
  confidence: number; // 0-1
  source: "mediapipe" | "interpolated";
}

export type ApexLandmarkMap = Record<string, ApexLm>;

const VIS_THRESHOLD = 0.4;

function pct(v: number) {
  return Math.max(0, Math.min(100, v * 100));
}

function lm(arr: MpLandmark[], idx: number): MpLandmark | null {
  const l = arr[idx];
  if (!l) return null;
  if ((l.visibility ?? 0) < VIS_THRESHOLD) return null;
  return l;
}

function toApex(l: MpLandmark): ApexLm {
  return {
    x: pct(l.x),
    y: pct(l.y),
    confidence: l.visibility,
    source: "mediapipe",
  };
}

function interp(x: number, y: number, conf: number): ApexLm {
  return { x: pct(x), y: pct(y), confidence: conf, source: "interpolated" };
}

// ─── VISTA DE FRENTE ─────────────────────────────────────────
// Atleta de frente para câmera: LEFT_* do MediaPipe = lado E do atleta
// que aparece à DIREITA na imagem. APEX usa convenção do ATLETA:
//   shoulder_left = ombro E do atleta = LEFT_SHOULDER do MediaPipe
//   shoulder_right = ombro D do atleta = RIGHT_SHOULDER do MediaPipe
export function mapFront(mp: MpLandmark[]): ApexLandmarkMap {
  const out: ApexLandmarkMap = {};
  const lShoulder = lm(mp, MP_LM.LEFT_SHOULDER);
  const rShoulder = lm(mp, MP_LM.RIGHT_SHOULDER);
  const lHip = lm(mp, MP_LM.LEFT_HIP);
  const rHip = lm(mp, MP_LM.RIGHT_HIP);
  const lKnee = lm(mp, MP_LM.LEFT_KNEE);
  const rKnee = lm(mp, MP_LM.RIGHT_KNEE);
  const lAnkle = lm(mp, MP_LM.LEFT_ANKLE);
  const rAnkle = lm(mp, MP_LM.RIGHT_ANKLE);
  const lEar = lm(mp, MP_LM.LEFT_EAR);
  const rEar = lm(mp, MP_LM.RIGHT_EAR);
  const nose = lm(mp, MP_LM.NOSE);

  if (lShoulder) out.shoulder_left = toApex(lShoulder);
  if (rShoulder) out.shoulder_right = toApex(rShoulder);
  if (lHip) out.hip_left = toApex(lHip);
  if (rHip) out.hip_right = toApex(rHip);
  if (lKnee) out.knee_left = toApex(lKnee);
  if (rKnee) out.knee_right = toApex(rKnee);
  if (lAnkle) out.ankle_left = toApex(lAnkle);
  if (rAnkle) out.ankle_right = toApex(rAnkle);

  if (lEar) out.ear_left = toApex(lEar);
  if (rEar) out.ear_right = toApex(rEar);
  if (lEar && rEar) {
    out.ear = interp((lEar.x + rEar.x) / 2, (lEar.y + rEar.y) / 2, Math.min(lEar.visibility, rEar.visibility));
  } else if (nose) {
    out.ear = { ...toApex(nose), source: "interpolated" };
  }

  return out;
}

// ─── VISTA DE COSTAS ─────────────────────────────────────────
// Atleta de costas: LEFT_* do MediaPipe (lado E do atleta) agora aparece
// à ESQUERDA da imagem. APEX continua na convenção do ATLETA, então o
// mapeamento direto se mantém — porém escápulas e linha média mudam.
export function mapBack(mp: MpLandmark[]): ApexLandmarkMap {
  const out: ApexLandmarkMap = {};
  const lShoulder = lm(mp, MP_LM.LEFT_SHOULDER);
  const rShoulder = lm(mp, MP_LM.RIGHT_SHOULDER);
  const lHip = lm(mp, MP_LM.LEFT_HIP);
  const rHip = lm(mp, MP_LM.RIGHT_HIP);
  const lEar = lm(mp, MP_LM.LEFT_EAR);
  const rEar = lm(mp, MP_LM.RIGHT_EAR);
  const lKnee = lm(mp, MP_LM.LEFT_KNEE);
  const rKnee = lm(mp, MP_LM.RIGHT_KNEE);
  const lAnkle = lm(mp, MP_LM.LEFT_ANKLE);
  const rAnkle = lm(mp, MP_LM.RIGHT_ANKLE);

  if (lShoulder) out.shoulder_left = toApex(lShoulder);
  if (rShoulder) out.shoulder_right = toApex(rShoulder);
  if (lHip) out.hip_left = toApex(lHip);
  if (rHip) out.hip_right = toApex(rHip);
  if (lKnee) out.knee_left = toApex(lKnee);
  if (rKnee) out.knee_right = toApex(rKnee);
  if (lAnkle) out.ankle_left = toApex(lAnkle);
  if (rAnkle) out.ankle_right = toApex(rAnkle);

  // C7 — entre orelhas, descido 85% até linha dos ombros
  if (lEar && rEar && lShoulder && rShoulder) {
    const earMidX = (lEar.x + rEar.x) / 2;
    const earMidY = (lEar.y + rEar.y) / 2;
    const shoulMidY = (lShoulder.y + rShoulder.y) / 2;
    out.spine_c7 = interp(
      earMidX,
      earMidY + (shoulMidY - earMidY) * 0.85,
      Math.min(lEar.visibility, rEar.visibility) * 0.9,
    );
  } else if (lShoulder && rShoulder) {
    // Sem orelhas: C7 = meio dos ombros, 3% acima
    out.spine_c7 = interp(
      (lShoulder.x + rShoulder.x) / 2,
      (lShoulder.y + rShoulder.y) / 2 - 0.03,
      Math.min(lShoulder.visibility, rShoulder.visibility) * 0.7,
    );
  }

  // L5 — meio dos quadris, 2.5% acima
  if (lHip && rHip) {
    out.spine_l5 = interp(
      (lHip.x + rHip.x) / 2,
      (lHip.y + rHip.y) / 2 - 0.025,
      Math.min(lHip.visibility, rHip.visibility) * 0.9,
    );
  }

  // Escápulas — 35% do caminho ombro→quadril, a meio caminho entre
  // o ombro e a linha média do tronco.
  const hipMidY = lHip && rHip ? (lHip.y + rHip.y) / 2 : null;
  const trunkCenterX =
    lShoulder && rShoulder && lHip && rHip
      ? ((lShoulder.x + rShoulder.x) / 2 + (lHip.x + rHip.x) / 2) / 2
      : null;

  if (lShoulder && hipMidY !== null && trunkCenterX !== null) {
    const escY = lShoulder.y + (hipMidY - lShoulder.y) * 0.35;
    const escX = (lShoulder.x + trunkCenterX) / 2;
    out.scapula_left = interp(escX, escY, lShoulder.visibility * 0.8);
  }
  if (rShoulder && hipMidY !== null && trunkCenterX !== null) {
    const escY = rShoulder.y + (hipMidY - rShoulder.y) * 0.35;
    const escX = (rShoulder.x + trunkCenterX) / 2;
    out.scapula_right = interp(escX, escY, rShoulder.visibility * 0.8);
  }

  return out;
}

// ─── VISTA LATERAL ───────────────────────────────────────────
// Usa o lado com maior visibilidade média (geralmente o lado voltado p/ câmera).
export function mapLateral(mp: MpLandmark[]): ApexLandmarkMap {
  const out: ApexLandmarkMap = {};

  const leftVis =
    ((mp[MP_LM.LEFT_SHOULDER]?.visibility ?? 0) +
      (mp[MP_LM.LEFT_HIP]?.visibility ?? 0) +
      (mp[MP_LM.LEFT_KNEE]?.visibility ?? 0) +
      (mp[MP_LM.LEFT_ANKLE]?.visibility ?? 0)) /
    4;
  const rightVis =
    ((mp[MP_LM.RIGHT_SHOULDER]?.visibility ?? 0) +
      (mp[MP_LM.RIGHT_HIP]?.visibility ?? 0) +
      (mp[MP_LM.RIGHT_KNEE]?.visibility ?? 0) +
      (mp[MP_LM.RIGHT_ANKLE]?.visibility ?? 0)) /
    4;
  const useLeft = leftVis >= rightVis;

  const shoulder = lm(mp, useLeft ? MP_LM.LEFT_SHOULDER : MP_LM.RIGHT_SHOULDER);
  const hip = lm(mp, useLeft ? MP_LM.LEFT_HIP : MP_LM.RIGHT_HIP);
  const knee = lm(mp, useLeft ? MP_LM.LEFT_KNEE : MP_LM.RIGHT_KNEE);
  const ankle = lm(mp, useLeft ? MP_LM.LEFT_ANKLE : MP_LM.RIGHT_ANKLE);
  const ear = lm(mp, useLeft ? MP_LM.LEFT_EAR : MP_LM.RIGHT_EAR);

  if (ear) out.ear = toApex(ear);
  if (shoulder) {
    out.shoulder = toApex(shoulder);
    // Algumas chamadas do APEX usam tb shoulder_left/right na lateral
    out[useLeft ? "shoulder_left" : "shoulder_right"] = toApex(shoulder);
  }
  if (hip) {
    out.hip_greater_trochanter = toApex(hip);
    out[useLeft ? "hip_left" : "hip_right"] = toApex(hip);
  }
  if (knee) {
    out.knee_lateral = toApex(knee);
    out[useLeft ? "knee_left" : "knee_right"] = toApex(knee);
  }
  if (ankle) {
    out.ankle_lateral = toApex(ankle);
    out[useLeft ? "ankle_left" : "ankle_right"] = toApex(ankle);
  }

  // C7 lateral — 70% do caminho orelha→ombro
  if (ear && shoulder) {
    out.spine_c7 = interp(
      ear.x * 0.3 + shoulder.x * 0.7,
      ear.y * 0.3 + shoulder.y * 0.7,
      Math.min(ear.visibility, shoulder.visibility) * 0.85,
    );
  }
  // L5 lateral — logo acima do trocânter
  if (hip && shoulder) {
    out.spine_l5 = interp(
      hip.x,
      hip.y - (hip.y - shoulder.y) * 0.08,
      hip.visibility * 0.85,
    );
  }

  return out;
}

export function mapByView(mp: MpLandmark[], view: ApexView): ApexLandmarkMap {
  switch (view) {
    case "front":
      return mapFront(mp);
    case "back":
      return mapBack(mp);
    case "lateral":
      return mapLateral(mp);
  }
}
