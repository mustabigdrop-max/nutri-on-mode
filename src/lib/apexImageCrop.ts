// APEX Visual — crop automático da imagem para o atleta antes de enviar para a análise principal
import { supabase } from "@/integrations/supabase/client";

interface BoundingBox {
  x_min: number; // % da largura (0-100)
  y_min: number;
  x_max: number;
  y_max: number;
}

async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = dataUrl;
  });
}

function cropDataUrl(img: HTMLImageElement, bbox: BoundingBox): string {
  const margin = 5; // 5% extra de margem
  const xMin = Math.max(0, bbox.x_min - margin);
  const yMin = Math.max(0, bbox.y_min - margin);
  const xMax = Math.min(100, bbox.x_max + margin);
  const yMax = Math.min(100, bbox.y_max + margin);

  const sx = (xMin / 100) * img.naturalWidth;
  const sy = (yMin / 100) * img.naturalHeight;
  const sw = ((xMax - xMin) / 100) * img.naturalWidth;
  const sh = ((yMax - yMin) / 100) * img.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw);
  canvas.height = Math.round(sh);
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Tenta detectar o bounding box do atleta via IA (chamada leve) e recortar a imagem.
 * Em qualquer falha retorna a imagem original — fluxo nunca é bloqueado.
 */
export async function cropToAthlete(imageBase64: string): Promise<{
  cropped: string;
  bbox: BoundingBox | null;
  heightPct: number | null;
}> {
  try {
    const { data, error } = await supabase.functions.invoke("apex-detect-bbox", {
      body: { imageBase64 },
    });
    if (error || !data?.bbox) {
      return { cropped: imageBase64, bbox: null, heightPct: null };
    }
    const bbox = data.bbox as BoundingBox;
    const heightPct = Math.max(0, Math.min(100, bbox.y_max - bbox.y_min));
    const img = await loadImage(
      imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
    );
    const cropped = cropDataUrl(img, bbox);
    return { cropped, bbox, heightPct };
  } catch (e) {
    console.warn("[apex] cropToAthlete falhou, usando imagem original:", e);
    return { cropped: imageBase64, bbox: null, heightPct: null };
  }
}
