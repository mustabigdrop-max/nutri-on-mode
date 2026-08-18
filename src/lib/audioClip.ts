/** Extrai um trecho de um áudio e devolve um WAV (Blob) pronto para download. */

function encodeWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const len = buffer.length;
  const sampleRate = buffer.sampleRate;
  const bytes = 44 + len * numCh * 2;
  const view = new DataView(new ArrayBuffer(bytes));

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, bytes - 8, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, len * numCh * 2, true);

  const channels = Array.from({ length: numCh }, (_, c) => buffer.getChannelData(c));
  let offset = 44;
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([view.buffer], { type: "audio/wav" });
}

export async function extractClip(src: string, start: number, end: number): Promise<Blob> {
  if (!(end > start)) throw new Error("Intervalo inválido");
  const res = await fetch(src);
  if (!res.ok) throw new Error("Não foi possível carregar o áudio");
  const arr = await res.arrayBuffer();

  const Ctx: typeof AudioContext =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  const ctx = new Ctx();
  const decoded = await ctx.decodeAudioData(arr.slice(0));
  await ctx.close();

  const rate = decoded.sampleRate;
  const from = Math.max(0, Math.floor(start * rate));
  const to = Math.min(decoded.length, Math.ceil(end * rate));
  const frames = Math.max(1, to - from);

  const OfflineCtx: typeof OfflineAudioContext =
    (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  const offline = new OfflineCtx(decoded.numberOfChannels, frames, rate);
  const clip = offline.createBuffer(decoded.numberOfChannels, frames, rate);
  for (let c = 0; c < decoded.numberOfChannels; c++) {
    clip.copyToChannel(decoded.getChannelData(c).subarray(from, to), c);
  }
  return encodeWav(clip);
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
