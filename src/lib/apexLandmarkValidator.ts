// APEX Visual — validação anatômica dos landmarks devolvidos pela IA
export type LandmarkMap = Record<string, { x: number; y: number }>;

export interface LandmarkValidation {
  valido: boolean;
  erros: string[];
  confianca: "alta" | "media" | "baixa";
}

const PARES_BILATERAIS: Array<[string, string]> = [
  ["acromio_r", "acromio_l"],
  ["eias_r", "eias_l"],
  ["joelho_r", "joelho_l"],
  ["maleolo_r", "maleolo_l"],
];

export function validateLandmarks(landmarks: LandmarkMap): LandmarkValidation {
  const erros: string[] = [];

  // Regra 1: cabeça/C7 acima dos ombros (y menor = mais alto na imagem)
  if (landmarks.c7 && landmarks.acromio_r && landmarks.c7.y > landmarks.acromio_r.y) {
    erros.push("C7 abaixo dos acrômios — landmark provavelmente posicionado errado");
  }

  // Regra 2: quadril abaixo dos ombros
  if (landmarks.eias_r && landmarks.acromio_r && landmarks.eias_r.y < landmarks.acromio_r.y) {
    erros.push("EIAS acima dos acrômios — verificar posicionamento");
  }

  // Regra 3: joelhos abaixo do quadril
  if (landmarks.joelho_r && landmarks.eias_r && landmarks.joelho_r.y < landmarks.eias_r.y) {
    erros.push("Joelhos acima do quadril — landmark posicionado fora do corpo");
  }

  // Regra 4: dentro dos limites da imagem
  Object.entries(landmarks).forEach(([id, pos]) => {
    if (pos.x < 0 || pos.x > 100 || pos.y < 0 || pos.y > 100) {
      erros.push(`Landmark ${id} fora dos limites da imagem`);
    }
  });

  // Regra 5: simetria bilateral (diferença máx 15% em Y)
  PARES_BILATERAIS.forEach(([d, e]) => {
    if (landmarks[d] && landmarks[e]) {
      const diffY = Math.abs(landmarks[d].y - landmarks[e].y);
      if (diffY > 15) {
        erros.push(`Assimetria extrema em ${d}/${e}: ${diffY.toFixed(1)}% — verificar posicionamento`);
      }
    }
  });

  const confianca: LandmarkValidation["confianca"] =
    erros.length === 0 ? "alta" : erros.length <= 2 ? "media" : "baixa";

  return { valido: erros.length === 0, erros, confianca };
}

/** Converte um array de landmarks ({id,x,y}[]) para o formato Record esperado. */
export function landmarksArrayToMap(arr?: Array<{ id: string; x: number; y: number }>): LandmarkMap {
  const out: LandmarkMap = {};
  (arr || []).forEach((l) => {
    if (l && typeof l.id === "string") out[l.id] = { x: Number(l.x), y: Number(l.y) };
  });
  return out;
}

// ─────────────────────────────────────────────────────────────
// CAMADA 3 — Validação e correção pós-análise
// ─────────────────────────────────────────────────────────────

// Proporções anatômicas por landmark (% da altura do corpo, do topo para baixo)
export function getLandmarkYProportion(id: string): number {
  const proportions: Record<string, number> = {
    occipital: 0.02,
    trago_r: 0.06,
    trago_l: 0.06,
    c7: 0.14,
    acromio_r: 0.18,
    acromio_l: 0.18,
    angulo_escapula_r: 0.25,
    angulo_escapula_l: 0.25,
    t4: 0.22,
    t6: 0.27,
    t12: 0.35,
    l3: 0.42,
    l5_s1: 0.48,
    eias_r: 0.52,
    eias_l: 0.52,
    eips_r: 0.50,
    eips_l: 0.50,
    trocantermaior_r: 0.55,
    trocantermaior_l: 0.55,
    joelho_r: 0.72,
    joelho_l: 0.72,
    maleolo_r: 0.88,
    maleolo_l: 0.88,
    calcaneo_r: 0.95,
    calcaneo_l: 0.95,
  };
  return proportions[id] ?? 0.50;
}

export interface LandmarkQuality {
  qualidade: number; // 0-100
  bodyYMin: number;
  bodyYMax: number;
  bodyXMin: number;
  bodyXMax: number;
  insideCount: number;
  totalCount: number;
}

/**
 * Reposiciona landmarks que ficaram fora da caixa corporal estimada
 * usando proporções anatômicas. Os bounds são estimados a partir dos
 * landmarks mais confiáveis (acrômios, EIAS, C7).
 */
export function validateAndFixLandmarks(
  landmarks: LandmarkMap,
  _imageWidth = 100,
  _imageHeight = 100,
): { fixed: LandmarkMap; quality: LandmarkQuality } {
  const confiableY = [
    landmarks.c7?.y,
    landmarks.acromio_r?.y,
    landmarks.acromio_l?.y,
    landmarks.eias_r?.y,
    landmarks.eias_l?.y,
  ].filter((v): v is number => typeof v === "number");

  const confiableX = [
    landmarks.acromio_r?.x,
    landmarks.acromio_l?.x,
    landmarks.eias_r?.x,
    landmarks.eias_l?.x,
  ].filter((v): v is number => typeof v === "number");

  // Sem âncoras suficientes — devolve original com qualidade neutra
  if (confiableY.length < 2 || confiableX.length < 2) {
    const total = Object.keys(landmarks).length || 1;
    return {
      fixed: landmarks,
      quality: {
        qualidade: 100,
        bodyYMin: 0,
        bodyYMax: 100,
        bodyXMin: 0,
        bodyXMax: 100,
        insideCount: total,
        totalCount: total,
      },
    };
  }

  const bodyYMin = Math.min(...confiableY) - 15;
  const bodyYMax = Math.max(...confiableY) + 50;
  const bodyXMin = Math.min(...confiableX) - 10;
  const bodyXMax = Math.max(...confiableX) + 10;

  const fixed: LandmarkMap = {};
  let insideCount = 0;
  let totalCount = 0;

  Object.entries(landmarks).forEach(([id, pos]) => {
    let { x, y } = pos;
    totalCount++;

    // Y fora dos bounds → reposicionar por proporção anatômica
    if (y < bodyYMin || y > bodyYMax + 20) {
      const proportion = getLandmarkYProportion(id);
      y = bodyYMin + proportion * (bodyYMax - bodyYMin);
    }

    // X fora dos bounds → puxar para a borda mais próxima do corpo
    if (x < bodyXMin - 15 || x > bodyXMax + 15) {
      x = x < (bodyXMin + bodyXMax) / 2
        ? Math.max(x, bodyXMin)
        : Math.min(x, bodyXMax);
    }

    // Clamp final dentro da imagem
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    fixed[id] = { x, y };

    if (y >= bodyYMin && y <= bodyYMax + 20 && x >= bodyXMin - 15 && x <= bodyXMax + 15) {
      insideCount++;
    }
  });

  const qualidade = totalCount > 0 ? (insideCount / totalCount) * 100 : 100;

  return {
    fixed,
    quality: {
      qualidade,
      bodyYMin,
      bodyYMax,
      bodyXMin,
      bodyXMax,
      insideCount,
      totalCount,
    },
  };
}
