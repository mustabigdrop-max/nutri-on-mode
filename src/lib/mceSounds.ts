// Motor sonoro do MCE OS — Web Audio API (sem dependências externas).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type ToneOpts = {
  freq: number;
  at?: number;      // offset em segundos
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  release?: number;
};

function tone({ freq, at = 0, dur = 0.15, type = "sine", gain = 0.18, attack = 0.01, release = 0.12 }: ToneOpts) {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + at;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + release);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + release + 0.05);
}

const N = { C3: 130.81, E3: 164.81, G4: 392.0, A4: 440.0, C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5, E6: 1318.5 };

export const mceSounds = {
  /** Item marcado */
  tick: () => tone({ freq: N.C6, dur: 0.05, gain: 0.12, release: 0.06 }),

  /** Bloco 100% concluído */
  blockComplete: () => {
    tone({ freq: N.E5, at: 0, dur: 0.09, type: "triangle" });
    tone({ freq: N.G5, at: 0.12, dur: 0.09, type: "triangle" });
    tone({ freq: N.C6, at: 0.24, dur: 0.2, type: "triangle" });
  },

  /** Dia 100% concluído */
  dayComplete: () => {
    tone({ freq: N.C5, at: 0, dur: 0.16, type: "triangle" });
    tone({ freq: N.E5, at: 0.15, dur: 0.16, type: "triangle" });
    tone({ freq: N.G5, at: 0.15, dur: 0.16, type: "triangle", gain: 0.12 });
    tone({ freq: N.G5, at: 0.3, dur: 0.45, type: "triangle" });
    tone({ freq: N.C6, at: 0.3, dur: 0.45, type: "triangle", gain: 0.12 });
    tone({ freq: N.E6, at: 0.3, dur: 0.45, type: "triangle", gain: 0.09 });
  },

  /** Bloco IGNIÇÃO */
  ignition: () => {
    tone({ freq: N.C3, dur: 0.8, gain: 0.14, attack: 0.35, release: 0.6 });
    tone({ freq: N.E3, at: 0.6, dur: 0.7, gain: 0.12, attack: 0.25, release: 0.5 });
  },

  /** Bloco RECALIBRAÇÃO */
  recalibration: () => {
    tone({ freq: N.G5, dur: 0.04, type: "square", gain: 0.07, release: 0.04 });
    tone({ freq: N.G5, at: 0.15, dur: 0.04, type: "square", gain: 0.07, release: 0.04 });
  },

  /** Bloco CONSOLIDAÇÃO */
  consolidation: () => tone({ freq: N.G4, dur: 1.4, gain: 0.09, attack: 0.6, release: 1.0 }),

  /** Alerta de padrão de risco */
  warning: () => {
    tone({ freq: N.A4, dur: 0.06, type: "sawtooth", gain: 0.06 });
    tone({ freq: N.A4, at: 0.2, dur: 0.06, type: "sawtooth", gain: 0.06 });
    tone({ freq: N.A4, at: 0.4, dur: 0.06, type: "sawtooth", gain: 0.06 });
  },
};

export type MceSoundName = keyof typeof mceSounds;
