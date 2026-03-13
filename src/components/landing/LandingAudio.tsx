import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Cinematic Conversion Audio — Production-Grade
 * 
 * Reverb (ConvolverNode), sidechain pumping, layered sub-bass,
 * surgical kick, progressive structure, heroic melody.
 */

// Create a realistic impulse response buffer for convolution reverb
function createImpulseResponse(ctx: AudioContext, duration = 0.9, preDelay = 0.012): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * (duration + preDelay));
  const buffer = ctx.createBuffer(2, length, sampleRate);
  const preDelaySamples = Math.floor(sampleRate * preDelay);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = preDelaySamples; i < length; i++) {
      const t = (i - preDelaySamples) / sampleRate;
      // Exponential decay + diffusion (stereo randomness)
      const decay = Math.exp(-t / (duration * 0.35));
      data[i] = (Math.random() * 2 - 1) * decay * 0.4;
    }
  }
  return buffer;
}

const BPM = 124;
const BEAT = 60 / BPM; // ~0.484s
const BAR = BEAT * 4;

const LandingAudio = () => {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const start = useCallback(() => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const timeouts: number[] = [];
    const intervals: number[] = [];
    const allNodes: (AudioNode | AudioScheduledSourceNode)[] = [];

    // === MASTER CHAIN ===
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.knee.value = 6;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.002;
    compressor.release.value = 0.12;
    compressor.connect(ctx.destination);

    // Reverb send
    const reverb = ctx.createConvolver();
    reverb.buffer = createImpulseResponse(ctx, 0.9, 0.012);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.25;
    reverb.connect(reverbGain).connect(compressor);

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.38, ctx.currentTime + 2);
    master.connect(compressor);
    masterRef.current = master;

    // Dry/wet send helper
    const connectWithReverb = (node: AudioNode, dryLevel = 0.85, wetLevel = 0.3) => {
      const dry = ctx.createGain();
      dry.gain.value = dryLevel;
      const wet = ctx.createGain();
      wet.gain.value = wetLevel;
      node.connect(dry).connect(master);
      node.connect(wet).connect(reverb);
      return dry;
    };

    const now = ctx.currentTime;

    // === SIDECHAIN TARGET: pad gain node ===
    const padSidechainGain = ctx.createGain();
    padSidechainGain.gain.value = 1;
    padSidechainGain.connect(master);
    // Also connect pads to reverb
    const padWet = ctx.createGain();
    padWet.gain.value = 0.35;
    padSidechainGain.connect(padWet).connect(reverb);

    // === KICK (surgical) ===
    let kickCount = 0;
    const scheduleKick = (time: number) => {
      // Sub component: sine 140→38Hz in 0.25s
      const kickOsc = ctx.createOscillator();
      kickOsc.type = "sine";
      kickOsc.frequency.setValueAtTime(140, time);
      kickOsc.frequency.exponentialRampToValueAtTime(38, time + 0.25);
      const kickGain = ctx.createGain();
      kickGain.gain.setValueAtTime(0.55, time);
      kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
      kickOsc.connect(kickGain).connect(master);
      kickOsc.start(time);
      kickOsc.stop(time + 0.4);

      // Click transient: 5ms noise burst at 3kHz
      const clickLen = Math.floor(ctx.sampleRate * 0.005);
      const clickBuf = ctx.createBuffer(1, clickLen, ctx.sampleRate);
      const clickData = clickBuf.getChannelData(0);
      for (let i = 0; i < clickLen; i++) {
        clickData[i] = (Math.random() * 2 - 1) * (1 - i / clickLen);
      }
      const clickSrc = ctx.createBufferSource();
      clickSrc.buffer = clickBuf;
      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = "bandpass";
      clickFilter.frequency.value = 3000;
      clickFilter.Q.value = 1.5;
      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.35, time);
      clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.008);
      clickSrc.connect(clickFilter).connect(clickGain).connect(master);
      clickSrc.start(time);

      // Sidechain: duck pads to 5%, recover in 0.45s
      padSidechainGain.gain.cancelScheduledValues(time);
      padSidechainGain.gain.setValueAtTime(0.05, time);
      padSidechainGain.gain.linearRampToValueAtTime(1.0, time + 0.45);
    };

    // === HI-HAT ===
    const scheduleHat = (time: number, open = false) => {
      const len = open ? 0.12 : 0.04;
      const bufLen = Math.floor(ctx.sampleRate * len);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.3));
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const hpf = ctx.createBiquadFilter();
      hpf.type = "highpass";
      hpf.frequency.value = 7000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(open ? 0.08 : 0.06, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + len);
      src.connect(hpf).connect(g).connect(master);
      src.start(time);
    };

    // === CLAP ===
    const scheduleClap = (time: number) => {
      // 3 layered noise bursts
      for (let layer = 0; layer < 3; layer++) {
        const delay = layer * 0.008;
        const len = Math.floor(ctx.sampleRate * 0.03);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.25));
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bpf = ctx.createBiquadFilter();
        bpf.type = "bandpass";
        bpf.frequency.value = 1200;
        bpf.Q.value = 0.8;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.12, time + delay);
        g.gain.exponentialRampToValueAtTime(0.001, time + delay + 0.08);
        src.connect(bpf).connect(g);
        connectWithReverb(g, 0.7, 0.5);
        src.start(time + delay);
      }
    };

    // === SUB-BASS (layered) ===
    // Layer 1: sine fundamental (38-80Hz range depending on note)
    // Layer 2: sawtooth one octave up, lowpass 320Hz for growl
    const bassOscSine = ctx.createOscillator();
    bassOscSine.type = "sine";
    bassOscSine.frequency.value = 55; // A1
    const bassGainSine = ctx.createGain();
    bassGainSine.gain.value = 0;
    bassOscSine.connect(bassGainSine).connect(master);
    bassOscSine.start(now);
    allNodes.push(bassOscSine);

    const bassOscSaw = ctx.createOscillator();
    bassOscSaw.type = "sawtooth";
    bassOscSaw.frequency.value = 110; // A2 (octave up)
    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = "lowpass";
    bassFilter.frequency.value = 320;
    bassFilter.Q.value = 2;
    const bassGainSaw = ctx.createGain();
    bassGainSaw.gain.value = 0;
    bassOscSaw.connect(bassFilter).connect(bassGainSaw).connect(master);
    bassOscSaw.start(now);
    allNodes.push(bassOscSaw);

    const bassNotes = [55, 55, 65.41, 55]; // A1, A1, C2, A1 per bar
    let bassNoteIdx = 0;

    const scheduleBassNote = (time: number) => {
      const freq = bassNotes[bassNoteIdx % bassNotes.length];
      bassOscSine.frequency.setValueAtTime(freq, time);
      bassOscSaw.frequency.setValueAtTime(freq * 2, time);
      // Pump envelope
      bassGainSine.gain.cancelScheduledValues(time);
      bassGainSine.gain.setValueAtTime(0.30, time);
      bassGainSine.gain.setValueAtTime(0.30, time + BEAT * 0.7);
      bassGainSine.gain.linearRampToValueAtTime(0.10, time + BEAT * 0.95);
      bassGainSaw.gain.cancelScheduledValues(time);
      bassGainSaw.gain.setValueAtTime(0.12, time);
      bassGainSaw.gain.linearRampToValueAtTime(0.04, time + BEAT * 0.9);
      bassNoteIdx++;
    };

    // === PADS (Am chord with filter sweep) ===
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 200;
    padFilter.Q.value = 1.5;
    padFilter.connect(padSidechainGain);

    const padMaster = ctx.createGain();
    padMaster.gain.value = 0;
    padMaster.connect(padFilter);

    const padFreqs = [220, 261.63, 329.63, 440, 659.25]; // A3, C4, E4, A4, E5
    padFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      osc.detune.value = [-8, -4, 0, 5, 9][i];
      // Slow vibrato
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.06 + i * 0.015;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 1.5 + i * 0.5;
      lfo.connect(lfoG).connect(osc.frequency);
      lfo.start(now);
      allNodes.push(lfo);
      osc.connect(padMaster);
      osc.start(now);
      allNodes.push(osc);
    });

    // Pad filter automation (breathe)
    const animatePadFilter = () => {
      if (!ctxRef.current) return;
      const t = ctx.currentTime;
      padFilter.frequency.cancelScheduledValues(t);
      padFilter.frequency.setValueAtTime(300, t);
      padFilter.frequency.linearRampToValueAtTime(2200, t + 8);
      padFilter.frequency.linearRampToValueAtTime(300, t + 16);
    };

    // === ARP ===
    const arpNotes = [440, 523.25, 659.25, 880, 659.25, 523.25]; // A4 C5 E5 A5 E5 C5
    let arpIdx = 0;
    const scheduleArp = (time: number) => {
      const freq = arpNotes[arpIdx % arpNotes.length];
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(0.04, time + 0.015);
      g.gain.setValueAtTime(0.04, time + BEAT * 0.4);
      g.gain.exponentialRampToValueAtTime(0.001, time + BEAT * 0.48);
      osc.connect(g);
      connectWithReverb(g, 0.6, 0.4);
      osc.start(time);
      osc.stop(time + BEAT * 0.5);
      arpIdx++;
    };

    // === HEROIC MELODY (A3→B3→C4→E4→F4, detuned sawtooth pair) ===
    const melodyNotes = [220, 246.94, 261.63, 329.63, 349.23]; // A3 B3 C4 E4 F4
    const NOTE_DUR = BEAT * 1.5;

    const scheduleMelody = (startTime: number) => {
      melodyNotes.forEach((freq, i) => {
        const t = startTime + i * BEAT;
        // Detuned pair
        for (const detune of [-6, 6]) {
          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.value = freq;
          osc.detune.value = detune;
          const melFilter = ctx.createBiquadFilter();
          melFilter.type = "lowpass";
          melFilter.frequency.value = 1800;
          melFilter.Q.value = 0.7;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.035, t + 0.03);
          g.gain.setValueAtTime(0.035, t + NOTE_DUR * 0.5);
          g.gain.exponentialRampToValueAtTime(0.001, t + NOTE_DUR);
          osc.connect(melFilter).connect(g);
          connectWithReverb(g, 0.5, 0.55);
          osc.start(t);
          osc.stop(t + NOTE_DUR + 0.05);
        }
      });
    };

    // =============================================
    // PROGRESSIVE STRUCTURE — bar-by-bar scheduling
    // =============================================
    // Bar 1: kick only (tension)
    // Bar 2: + hats + clap + bass
    // Bar 4: + pads
    // Bar 5: + arp
    // Bar 7: + melody
    // Then loops from bar 2 pattern

    let currentBar = 0;
    let beatInBar = 0;
    const TOTAL_INTRO_BARS = 8;

    const tick = () => {
      if (!ctxRef.current) return;
      const t = ctx.currentTime + 0.05; // small lookahead

      const globalBeat = currentBar * 4 + beatInBar;

      // Kick on every beat from bar 0
      if (currentBar >= 0) {
        scheduleKick(t);
        kickCount++;
      }

      // Hats: 8th notes from bar 2
      if (currentBar >= 1) {
        scheduleHat(t);
        scheduleHat(t + BEAT * 0.5, currentBar >= 3 && beatInBar === 2); // open hat on beat 3 after bar 3
      }

      // Clap on beats 2 and 4 from bar 2
      if (currentBar >= 1 && (beatInBar === 1 || beatInBar === 3)) {
        scheduleClap(t);
      }

      // Bass from bar 2
      if (currentBar >= 1 && (beatInBar === 0 || beatInBar === 2)) {
        scheduleBassNote(t);
      }

      // Pads fade in at bar 4
      if (currentBar === 3 && beatInBar === 0) {
        padMaster.gain.setValueAtTime(0, t);
        padMaster.gain.linearRampToValueAtTime(0.08, t + BAR * 2);
        animatePadFilter();
        intervals.push(window.setInterval(animatePadFilter, 16000));
      }

      // Arp from bar 5, every 8th note
      if (currentBar >= 4) {
        scheduleArp(t);
        scheduleArp(t + BEAT * 0.5);
      }

      // Melody from bar 7, every 8 bars
      if (currentBar >= 6 && beatInBar === 0 && currentBar % 2 === 0) {
        scheduleMelody(t);
      }

      // Advance
      beatInBar++;
      if (beatInBar >= 4) {
        beatInBar = 0;
        currentBar++;
      }
    };

    // Schedule ticks
    const tickInterval = window.setInterval(tick, BEAT * 1000);
    intervals.push(tickInterval);
    // Start first tick immediately
    tick();

    // === CLEANUP ===
    stopRef.current = () => {
      intervals.forEach(id => clearInterval(id));
      timeouts.forEach(id => clearTimeout(id));

      if (masterRef.current) {
        masterRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      }
      setTimeout(() => {
        allNodes.forEach(n => { try { (n as any).stop?.(); } catch {} });
        try { ctx.close(); } catch {}
        ctxRef.current = null;
        masterRef.current = null;
      }, 1500);
    };

    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    setPlaying(false);
  }, []);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
      onClick={playing ? stop : start}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full border border-border bg-card/80 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
      aria-label={playing ? "Desligar música" : "Ligar música ambiente"}
      title="Música ambiente"
    >
      {playing ? (
        <Volume2 className="w-5 h-5 text-primary animate-pulse" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
      {playing && (
        <span className="absolute inset-0 rounded-full border border-primary/30 animate-ping" />
      )}
    </motion.button>
  );
};

export default LandingAudio;
