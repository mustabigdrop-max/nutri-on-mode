import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Cinematic Conversion Audio — Dark Premium Sci-Fi
 * 
 * Psychology: Creates a sense of importance, exclusivity, and forward momentum.
 * Not a "song" — a cinematic soundscape that makes the user feel like they're
 * entering something significant. Think: movie trailer meets tech keynote.
 * 
 * Layers (staggered entry for building tension):
 * 1. Deep sub-bass drone (40Hz + 80Hz) — gravitas, "weight"
 * 2. Evolving pad (Am chord, filtered) — emotion, atmosphere
 * 3. Rhythmic pulse (sidechain-style) — forward momentum, urgency
 * 4. High shimmer (filtered noise + sine harmonics) — "premium" texture
 * 5. Tension riser (slow pitch sweep) — anticipation, every 16s
 */
const LandingAudio = () => {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);
  const intervalsRef = useRef<number[]>([]);

  const start = useCallback(() => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const nodes: OscillatorNode[] = [];
    const intervals: number[] = [];

    // Master chain: compressor → destination
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 8;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.15;
    compressor.connect(ctx.destination);

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 4);
    master.connect(compressor);
    masterRef.current = master;

    const now = ctx.currentTime;

    // ===== LAYER 1: Sub-bass drone (immediate) =====
    // Two detuned sines create a slow 0.5Hz beating — organic pulse
    const createDrone = (freq: number, vol: number, delay: number) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(vol, now + delay + 3);
      osc.connect(gain).connect(master);
      osc.start(now);
      nodes.push(osc);
    };

    createDrone(40, 0.25, 0);       // Sub fundamental
    createDrone(40.5, 0.20, 0);     // Beating pair
    createDrone(80, 0.12, 0.5);     // Audible octave
    createDrone(120, 0.06, 1);      // Warmth

    // ===== LAYER 2: Evolving pad (enters at 2s) =====
    // A minor chord: A2, C3, E3 — with slow filter sweep
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 200;
    padFilter.Q.value = 2;
    padFilter.connect(master);

    // Slow filter automation: breathes 200Hz → 1200Hz → 200Hz over 20s
    const animateFilter = () => {
      const t = ctx.currentTime;
      padFilter.frequency.setValueAtTime(200, t);
      padFilter.frequency.linearRampToValueAtTime(1200, t + 10);
      padFilter.frequency.linearRampToValueAtTime(200, t + 20);
    };
    animateFilter();
    const filterInterval = window.setInterval(animateFilter, 20000);
    intervals.push(filterInterval);

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0, now);
    padGain.gain.linearRampToValueAtTime(0, now + 2);
    padGain.gain.linearRampToValueAtTime(0.10, now + 5);
    padGain.connect(padFilter);

    const padNotes = [110, 130.81, 164.81, 220, 329.63]; // A2, C3, E3, A3, E4
    const detunes = [-7, -3, 0, 4, 8];
    padNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = detunes[i];
      
      // Add slow vibrato for organic feel
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.08 + i * 0.02; // Slightly different rates
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 2 + i; // Subtle pitch wobble
      lfo.connect(lfoGain).connect(osc.frequency);
      lfo.start(now);
      nodes.push(lfo);

      osc.connect(padGain);
      osc.start(now);
      nodes.push(osc);
    });

    // ===== LAYER 3: Rhythmic pulse (enters at 4s) =====
    // Sidechain-style pumping sine — creates forward momentum
    const pulseFreq = 55; // A1
    const pulseOsc = ctx.createOscillator();
    pulseOsc.type = "sine";
    pulseOsc.frequency.value = pulseFreq;

    const pulseGain = ctx.createGain();
    pulseGain.gain.setValueAtTime(0, now);
    pulseOsc.connect(pulseGain).connect(master);
    pulseOsc.start(now);
    nodes.push(pulseOsc);

    // Pump pattern: 2 beats per second (120 BPM feel)
    const PUMP_RATE = 0.5; // seconds per pump
    const startPumping = () => {
      const pumpLoop = () => {
        if (!ctxRef.current) return;
        const t = ctx.currentTime;
        // Quick attack, slow release — "sidechain" feel
        pulseGain.gain.cancelScheduledValues(t);
        pulseGain.gain.setValueAtTime(0.18, t);
        pulseGain.gain.exponentialRampToValueAtTime(0.01, t + PUMP_RATE * 0.85);
      };
      // Delay entry by 4 seconds
      const pumpInterval = window.setInterval(pumpLoop, PUMP_RATE * 1000);
      intervals.push(pumpInterval);
      // Start first pump
      setTimeout(pumpLoop, 0);
    };
    setTimeout(startPumping, 4000);

    // ===== LAYER 4: High shimmer texture (enters at 6s) =====
    // Filtered noise + high sine harmonics — "premium" air
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.setValueAtTime(0, now);
    shimmerGain.gain.linearRampToValueAtTime(0, now + 6);
    shimmerGain.gain.linearRampToValueAtTime(0.03, now + 9);

    const shimmerFilter = ctx.createBiquadFilter();
    shimmerFilter.type = "bandpass";
    shimmerFilter.frequency.value = 6000;
    shimmerFilter.Q.value = 0.5;
    shimmerGain.connect(shimmerFilter).connect(master);

    // Noise generator
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    noiseSource.connect(shimmerGain);
    noiseSource.start(now);

    // High harmonic (A5 = 880Hz, very quiet)
    const shimmerSine = ctx.createOscillator();
    shimmerSine.type = "sine";
    shimmerSine.frequency.value = 880;
    const shimmerSineGain = ctx.createGain();
    shimmerSineGain.gain.setValueAtTime(0, now);
    shimmerSineGain.gain.linearRampToValueAtTime(0, now + 6);
    shimmerSineGain.gain.linearRampToValueAtTime(0.015, now + 10);
    shimmerSine.connect(shimmerSineGain).connect(master);
    shimmerSine.start(now);
    nodes.push(shimmerSine);

    // ===== LAYER 5: Tension riser (every 16 seconds) =====
    // Slow pitch sweep up — builds anticipation, resets, repeats
    const createRiser = () => {
      if (!ctxRef.current) return;
      const t = ctx.currentTime;
      const riserOsc = ctx.createOscillator();
      riserOsc.type = "sawtooth";
      riserOsc.frequency.setValueAtTime(60, t);
      riserOsc.frequency.exponentialRampToValueAtTime(400, t + 14);

      const riserFilter = ctx.createBiquadFilter();
      riserFilter.type = "lowpass";
      riserFilter.frequency.setValueAtTime(100, t);
      riserFilter.frequency.linearRampToValueAtTime(2000, t + 12);
      riserFilter.frequency.linearRampToValueAtTime(100, t + 14);
      riserFilter.Q.value = 4;

      const riserGain = ctx.createGain();
      riserGain.gain.setValueAtTime(0, t);
      riserGain.gain.linearRampToValueAtTime(0.06, t + 6);
      riserGain.gain.linearRampToValueAtTime(0.09, t + 12);
      riserGain.gain.linearRampToValueAtTime(0, t + 15);

      riserOsc.connect(riserFilter).connect(riserGain).connect(master);
      riserOsc.start(t);
      riserOsc.stop(t + 16);
    };

    // First riser after 8s, then every 16s
    setTimeout(createRiser, 8000);
    const riserInterval = window.setInterval(createRiser, 16000);
    intervals.push(riserInterval);

    // ===== LAYER 6: Melodic motif (enters at 10s) =====
    // Simple 4-note descending motif, plays every 8s — memorable but not distracting
    const motifNotes = [659.25, 523.25, 440, 329.63]; // E5, C5, A4, E4
    const NOTE_DUR = 0.6;
    const NOTE_GAP = 0.15;

    const playMotif = () => {
      if (!ctxRef.current) return;
      motifNotes.forEach((freq, i) => {
        const t = ctx.currentTime + i * (NOTE_DUR + NOTE_GAP);
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = freq;

        const noteFilter = ctx.createBiquadFilter();
        noteFilter.type = "lowpass";
        noteFilter.frequency.value = 1800;
        noteFilter.Q.value = 1;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.045, t + 0.05);
        gain.gain.setValueAtTime(0.045, t + NOTE_DUR * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, t + NOTE_DUR);

        osc.connect(noteFilter).connect(gain).connect(master);
        osc.start(t);
        osc.stop(t + NOTE_DUR + 0.05);
      });
    };

    setTimeout(playMotif, 10000);
    const motifInterval = window.setInterval(playMotif, 8000);
    intervals.push(motifInterval);

    nodesRef.current = nodes;
    intervalsRef.current = intervals;
    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    intervalsRef.current.forEach(id => clearInterval(id));
    intervalsRef.current = [];

    if (ctxRef.current && masterRef.current) {
      const ctx = ctxRef.current;
      masterRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      setTimeout(() => {
        nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
        nodesRef.current = [];
        ctx.close();
        ctxRef.current = null;
        masterRef.current = null;
      }, 1800);
    }
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
