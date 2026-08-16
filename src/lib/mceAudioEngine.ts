/**
 * MCE Audio Engine — camada sonora (soundscape sintético + batimento binaural).
 * Roda 100% no browser via Web Audio API, sem depender de arquivos externos.
 *
 * Camadas:
 *  1. Voz do coach  -> elemento <audio> (fora deste engine)
 *  2. Soundscape    -> ruído filtrado / pads / percussão gerados aqui
 *  3. Frequência    -> batimento binaural com rampa ao longo do áudio
 */

export type MceAudioMode =
  | "acordando"
  | "a_caminho"
  | "corrida"
  | "musculacao"
  | "cozinhando"
  | "dia_dificil"
  | "relaxando"
  | "dormindo";

export type ModeConfig = {
  key: MceAudioMode;
  label: string;
  icon: string;
  color: string;
  /** Hz do batimento no início e no fim (rampa linear). */
  beatStartHz: number;
  beatEndHz: number;
  /** Portadora inaudível conscientemente. */
  carrierHz: number;
  /** Volume do binaural (0-1). */
  beatVolume: number;
  /** Volume do soundscape (0-1). */
  scapeVolume: number;
  /** Textura sintética usada no soundscape. */
  texture: "dawn" | "lofi" | "tribal" | "industrial" | "kitchen" | "piano" | "bowl" | "rain";
  /** Pulso rítmico em BPM (0 = sem percussão). */
  bpmStart: number;
  bpmEnd: number;
  scapeName: string;
  blurb: string;
};

export const MCE_AUDIO_MODES: ModeConfig[] = [
  {
    key: "acordando", label: "Acordando", icon: "☀️", color: "#F59E0B",
    beatStartHz: 6, beatEndHz: 12, carrierHz: 200, beatVolume: 0.06, scapeVolume: 0.18,
    texture: "dawn", bpmStart: 0, bpmEnd: 0,
    scapeName: "Amanhecer na montanha",
    blurb: "Theta → Alpha. Despertar suave até alerta relaxado.",
  },
  {
    key: "a_caminho", label: "A caminho", icon: "🚌", color: "#60A5FA",
    beatStartHz: 12, beatEndHz: 15, carrierHz: 190, beatVolume: 0.06, scapeVolume: 0.16,
    texture: "lofi", bpmStart: 0, bpmEnd: 0,
    scapeName: "Lo-fi ambient + chuva suave",
    blurb: "SMR. Concentração calma para absorver conteúdo.",
  },
  {
    key: "corrida", label: "Corrida", icon: "🏃", color: "#00D4FF",
    beatStartHz: 15, beatEndHz: 20, carrierHz: 210, beatVolume: 0.05, scapeVolume: 0.22,
    texture: "tribal", bpmStart: 120, bpmEnd: 140,
    scapeName: "Tribal run (120→140 bpm)",
    blurb: "Beta. Energia e cadência progressiva.",
  },
  {
    key: "musculacao", label: "Musculação", icon: "🏋️", color: "#E8A020",
    beatStartHz: 18, beatEndHz: 25, carrierHz: 220, beatVolume: 0.05, scapeVolume: 0.20,
    texture: "industrial", bpmStart: 0, bpmEnd: 0,
    scapeName: "Iron temple — sub-bass industrial",
    blurb: "High Beta. Intensidade e foco absoluto.",
  },
  {
    key: "cozinhando", label: "Cozinhando", icon: "🍳", color: "#4ADE80",
    beatStartHz: 8, beatEndHz: 10, carrierHz: 190, beatVolume: 0.06, scapeVolume: 0.15,
    texture: "kitchen", bpmStart: 0, bpmEnd: 0,
    scapeName: "Acústico leve + cozinha",
    blurb: "Alpha baixo. Relaxamento produtivo.",
  },
  {
    key: "dia_dificil", label: "Dia difícil", icon: "😤", color: "#F472B6",
    beatStartHz: 6, beatEndHz: 8, carrierHz: 180, beatVolume: 0.07, scapeVolume: 0.16,
    texture: "piano", bpmStart: 0, bpmEnd: 0,
    scapeName: "Piano solo + cordas sutis",
    blurb: "Theta baixo. Acolhimento e processamento emocional.",
  },
  {
    key: "relaxando", label: "Relaxando", icon: "🧘", color: "#2DD4BF",
    beatStartHz: 7, beatEndHz: 4, carrierHz: 170, beatVolume: 0.07, scapeVolume: 0.18,
    texture: "bowl", bpmStart: 0, bpmEnd: 0,
    scapeName: "Tigela tibetana + água",
    blurb: "Theta. Introspecção e meditação profunda.",
  },
  {
    key: "dormindo", label: "Dormindo", icon: "🌙", color: "#A78BFA",
    beatStartHz: 3, beatEndHz: 1, carrierHz: 150, beatVolume: 0.07, scapeVolume: 0.20,
    texture: "rain", bpmStart: 60, bpmEnd: 48,
    scapeName: "Rain on tent + heartbeat 60→48",
    blurb: "Delta. Indução ao sono profundo com fade total.",
  },
];

export const MODE_BY_KEY: Record<MceAudioMode, ModeConfig> = MCE_AUDIO_MODES.reduce(
  (acc, m) => { acc[m.key] = m; return acc; },
  {} as Record<MceAudioMode, ModeConfig>,
);

/** Sugere o modo pelo horário local. */
export function suggestModeByHour(hour = new Date().getHours()): MceAudioMode {
  if (hour >= 4 && hour < 8) return "acordando";
  if (hour >= 8 && hour < 11) return "a_caminho";
  if (hour >= 11 && hour < 14) return "cozinhando";
  if (hour >= 14 && hour < 18) return "musculacao";
  if (hour >= 18 && hour < 21) return "relaxando";
  if (hour >= 21 || hour < 4) return "dormindo";
  return "a_caminho";
}

type NoiseKind = "white" | "pink" | "brown";

function makeNoiseBuffer(ctx: AudioContext, kind: NoiseKind, seconds = 4): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === "white") d[i] = w;
    else if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    else {
      b0 = 0.99765 * b0 + w * 0.0990460;
      b1 = 0.96300 * b1 + w * 0.2965164;
      b2 = 0.57000 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.25;
    }
  }
  return buf;
}

export type EngineState = {
  mode: MceAudioMode;
  binauralEnabled: boolean;
  soundscapeEnabled: boolean;
};

/**
 * Motor de camadas. Uma instância por player.
 * Todos os nós vivem sob um masterGain para fade in/out limpo.
 */
export class MceSoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private beatGain: GainNode | null = null;
  private scapeGain: GainNode | null = null;
  private nodes: AudioScheduledSourceNode[] = [];
  private pulseTimer: number | null = null;
  private started = false;
  private currentMode: MceAudioMode | null = null;

  get isRunning() { return this.started; }
  get mode() { return this.currentMode; }

  /** Inicia (ou troca) a camada sonora do modo. `durationSeconds` guia a rampa de frequência. */
  async start(mode: MceAudioMode, durationSeconds = 600, opts?: { binaural?: boolean; soundscape?: boolean }) {
    const cfg = MODE_BY_KEY[mode];
    if (!cfg) return;
    this.stop(true);

    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = this.ctx && this.ctx.state !== "closed" ? this.ctx : new Ctor();
    this.ctx = ctx;
    if (ctx.state === "suspended") await ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(1, now + 3);
    master.connect(ctx.destination);
    this.master = master;

    const dur = Math.max(60, durationSeconds || 600);

    // ---- Camada 3: binaural ----
    if (opts?.binaural !== false) {
      const beatGain = ctx.createGain();
      beatGain.gain.value = cfg.beatVolume;
      beatGain.connect(master);
      this.beatGain = beatGain;

      const merger = ctx.createChannelMerger(2);
      merger.connect(beatGain);

      const left = ctx.createOscillator();
      const right = ctx.createOscillator();
      left.type = "sine";
      right.type = "sine";
      left.frequency.setValueAtTime(cfg.carrierHz, now);
      right.frequency.setValueAtTime(cfg.carrierHz + cfg.beatStartHz, now);
      right.frequency.linearRampToValueAtTime(cfg.carrierHz + cfg.beatEndHz, now + dur);

      const gl = ctx.createGain(); gl.gain.value = 0.5;
      const gr = ctx.createGain(); gr.gain.value = 0.5;
      left.connect(gl); right.connect(gr);
      gl.connect(merger, 0, 0);
      gr.connect(merger, 0, 1);
      left.start(); right.start();
      this.nodes.push(left, right);
    }

    // ---- Camada 2: soundscape sintético ----
    if (opts?.soundscape !== false) {
      const scapeGain = ctx.createGain();
      scapeGain.gain.value = cfg.scapeVolume;
      scapeGain.connect(master);
      this.scapeGain = scapeGain;
      this.buildTexture(ctx, cfg, scapeGain, dur);
      if (cfg.bpmStart > 0) this.startPulse(ctx, cfg, scapeGain, dur);
    }

    this.started = true;
    this.currentMode = mode;
  }

  private buildTexture(ctx: AudioContext, cfg: ModeConfig, out: GainNode, dur: number) {
    const now = ctx.currentTime;

    const noise = (kind: NoiseKind, freq: number, type: BiquadFilterType, q: number, gain: number) => {
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, kind);
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = freq;
      filter.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = gain;
      src.connect(filter).connect(g).connect(out);
      src.start();
      this.nodes.push(src);
      return { filter, g };
    };

    const pad = (freq: number, gain: number, type: OscillatorType = "sine", detune = 0) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(gain, now + 4);
      // respiração lenta do pad
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06 + Math.random() * 0.05;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = gain * 0.4;
      lfo.connect(lfoGain).connect(g.gain);
      lfo.start();
      osc.connect(g).connect(out);
      osc.start();
      this.nodes.push(osc, lfo);
      return g;
    };

    switch (cfg.texture) {
      case "dawn": {
        noise("pink", 2200, "bandpass", 0.8, 0.10); // brisa
        pad(196, 0.05); pad(294, 0.035); pad(392, 0.02);
        this.scheduleChirps(ctx, out, dur);
        break;
      }
      case "lofi": {
        noise("pink", 1200, "lowpass", 0.7, 0.12); // chuva suave
        pad(146.8, 0.05); pad(220, 0.03, "triangle"); pad(174.6, 0.025);
        break;
      }
      case "tribal": {
        noise("brown", 300, "lowpass", 0.7, 0.06);
        pad(82.4, 0.06, "triangle");
        break;
      }
      case "industrial": {
        pad(41.2, 0.11, "sine");
        pad(61.7, 0.05, "triangle");
        noise("brown", 120, "lowpass", 0.9, 0.05);
        break;
      }
      case "kitchen": {
        noise("pink", 3000, "bandpass", 1.2, 0.05); // água/vapor distante
        pad(261.6, 0.04); pad(329.6, 0.03); pad(392, 0.02);
        break;
      }
      case "piano": {
        pad(130.8, 0.05); pad(196, 0.035); pad(233.1, 0.025);
        noise("pink", 700, "lowpass", 0.6, 0.03);
        break;
      }
      case "bowl": {
        pad(136.1, 0.07); pad(272.2, 0.03); pad(204.2, 0.02, "triangle", 6);
        noise("brown", 400, "lowpass", 0.6, 0.05); // fluxo d'água
        break;
      }
      case "rain": {
        noise("white", 900, "lowpass", 0.5, 0.14);
        noise("brown", 200, "lowpass", 0.7, 0.08);
        pad(65.4, 0.04);
        break;
      }
    }
  }

  /** Cantos de pássaros esparsos no modo acordando. */
  private scheduleChirps(ctx: AudioContext, out: GainNode, dur: number) {
    const total = Math.min(dur, 900);
    for (let t = 3; t < total; t += 6 + Math.random() * 12) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const at = ctx.currentTime + t;
      const base = 1800 + Math.random() * 1400;
      osc.type = "sine";
      osc.frequency.setValueAtTime(base, at);
      osc.frequency.exponentialRampToValueAtTime(base * 1.5, at + 0.09);
      osc.frequency.exponentialRampToValueAtTime(base * 0.8, at + 0.2);
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.035, at + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
      osc.connect(g).connect(out);
      osc.start(at);
      osc.stop(at + 0.35);
      this.nodes.push(osc);
    }
  }

  /** Percussão/heartbeat com BPM em rampa (corrida, dormindo). */
  private startPulse(ctx: AudioContext, cfg: ModeConfig, out: GainNode, dur: number) {
    const startedAt = ctx.currentTime;
    const isHeartbeat = cfg.texture === "rain";
    const tick = () => {
      if (!this.started && this.pulseTimer !== null) return;
      const elapsed = ctx.currentTime - startedAt;
      const p = Math.min(1, elapsed / dur);
      const bpm = cfg.bpmStart + (cfg.bpmEnd - cfg.bpmStart) * p;
      const interval = 60 / Math.max(30, bpm);

      const hit = (at: number, freq: number, gain: number, decay: number) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, at);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, at + decay);
        g.gain.setValueAtTime(0, at);
        g.gain.linearRampToValueAtTime(gain, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
        osc.connect(g).connect(out);
        osc.start(at);
        osc.stop(at + decay + 0.05);
      };

      const at = ctx.currentTime + 0.05;
      if (isHeartbeat) {
        hit(at, 62, 0.32, 0.16);
        hit(at + 0.22, 55, 0.2, 0.14);
      } else {
        hit(at, 78, 0.28, 0.18);
        if (Math.random() > 0.55) hit(at + interval / 2, 140, 0.08, 0.08);
      }

      this.pulseTimer = window.setTimeout(tick, interval * 1000);
    };
    tick();
  }

  setSoundscapeVolume(v: number) {
    if (this.scapeGain && this.ctx) this.scapeGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.2);
  }

  setBinauralVolume(v: number) {
    if (this.beatGain && this.ctx) this.beatGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.2);
  }

  suspend() { this.ctx?.suspend().catch(() => {}); }
  resume() { this.ctx?.resume().catch(() => {}); }

  /** Para tudo. `keepContext` mantém o AudioContext vivo para troca de modo. */
  stop(keepContext = false) {
    if (this.pulseTimer !== null) { clearTimeout(this.pulseTimer); this.pulseTimer = null; }
    for (const n of this.nodes) { try { n.stop(); } catch { /* já parado */ } }
    this.nodes = [];
    try { this.master?.disconnect(); } catch { /* noop */ }
    this.master = null;
    this.beatGain = null;
    this.scapeGain = null;
    this.started = false;
    this.currentMode = null;
    if (!keepContext && this.ctx && this.ctx.state !== "closed") {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
