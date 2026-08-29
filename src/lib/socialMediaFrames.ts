// SOCIAL ON — captura de frames de foto/vídeo pro pipeline de IA.
// Compartilhado entre "1 Toque" e "Modo Lote" pra não duplicar a correção
// de compatibilidade com o Safari do iPhone (vídeo precisa estar no DOM).

/** Reduz uma imagem pra no máximo `max`px no maior lado antes de mandar pro sistema. */
export function compressImageFile(file: File, max = 1024): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > max || h > max) {
        if (w > h) { h = Math.round((h * max) / w); w = max; } else { w = Math.round((w * max) / h); h = max; }
      }
      c.width = w; c.height = h;
      c.getContext("2d")?.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}

/** Frações da duração onde os frames são capturados — cobre abertura, desenvolvimento e fechamento do vídeo. */
export const STORYBOARD_FRACTIONS = [0.06, 0.28, 0.5, 0.72, 0.92];

export function captureFrame(v: HTMLVideoElement, max = 1024): string {
  const c = document.createElement("canvas");
  let w = v.videoWidth, h = v.videoHeight;
  if (w > max || h > max) {
    if (w > h) { h = Math.round((h * max) / w); w = max; } else { w = Math.round((w * max) / h); h = max; }
  }
  c.width = w; c.height = h;
  c.getContext("2d")?.drawImage(v, 0, 0, w, h);
  return c.toDataURL("image/jpeg", 0.75);
}

export const seekTo = (v: HTMLVideoElement, t: number): Promise<void> =>
  new Promise((resolve) => {
    const onSeek = () => { v.removeEventListener("seeked", onSeek); resolve(); };
    v.addEventListener("seeked", onSeek);
    v.currentTime = t;
  });

export type Storyboard = { frames: string[]; video: HTMLVideoElement; duration: number };

/**
 * Carrega o vídeo e captura vários frames espalhados pela linha do tempo
 * (abertura, meio, fim) — dá pra IA uma visão do vídeo inteiro, não só de
 * um instante parado. O elemento <video> é inserido no DOM (invisível):
 * o Safari do iPhone se recusa a carregar/decodificar vídeo fora do DOM,
 * então "loadeddata"/"seeked" nunca disparariam sem isso.
 */
export function storyboardFromUrl(url: string, timeoutMs = 25000): Promise<Storyboard> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      fn();
    };
    const timer = window.setTimeout(() => {
      finish(() => {
        v.remove();
        reject(new Error(
          "Esse vídeo travou pra carregar (formato não suportado pelo navegador). Tenta gravar em MP4 ou usar outro vídeo.",
        ));
      });
    }, timeoutMs);

    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    Object.assign(v.style, {
      position: "fixed", left: "-9999px", top: "0", width: "1px", height: "1px", opacity: "0", pointerEvents: "none",
    });
    document.body.appendChild(v);
    v.src = url;
    v.onerror = () => finish(() => { v.remove(); reject(new Error("Não consegui ler o vídeo.")); });
    v.onloadeddata = async () => {
      const duration = v.duration || 0;
      const frames: string[] = [];
      try {
        for (const frac of STORYBOARD_FRACTIONS) {
          await seekTo(v, Math.max(0, Math.min(duration || 1, duration * frac)));
          frames.push(captureFrame(v));
        }
      } catch {
        // segue com os frames que conseguiu capturar
      }
      if (!frames.length) {
        finish(() => { v.remove(); reject(new Error("Não consegui capturar nenhum frame do vídeo.")); });
        return;
      }
      // reposiciona no primeiro frame pra manter a prévia/reprodução consistente
      await seekTo(v, Math.max(0, Math.min(duration || 1, duration * STORYBOARD_FRACTIONS[0])));
      finish(() => resolve({ frames, video: v, duration }));
    };
    v.load();
  });
}
