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
