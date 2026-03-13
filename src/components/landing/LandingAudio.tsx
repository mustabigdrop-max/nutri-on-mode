import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

const LandingAudio = () => {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const start = useCallback(() => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterRef.current = master;

    // Each layer starts at gain 0 and ramps up with staggered delays
    // so no two layers activate simultaneously → zero transients
    const makeLayer = (
      freq: number,
      type: OscillatorType,
      peakVol: number,
      lfoRate: number,
      delaySeconds: number,
      rampSeconds: number
    ) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      // Staggered fade-in: starts silent, ramps after delay
      gain.gain.setValueAtTime(0, ctx.currentTime + delaySeconds);
      gain.gain.linearRampToValueAtTime(
        peakVol,
        ctx.currentTime + delaySeconds + rampSeconds
      );

      osc.connect(gain).connect(master);

      // Tremolo LFO — asymmetric breathing
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = lfoRate;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = peakVol * 0.25;
      lfo.connect(lfoGain).connect(gain.gain);

      lfo.start();
      osc.start();
    };

    // Layer 1: Sub-bass foundation — 40Hz (felt, not heard on small speakers)
    makeLayer(40, "sine", 0.18, 0.07, 0, 2.0);

    // Layer 2: Detuned twin — 40.5Hz creates 0.5Hz organic beat with Layer 1
    makeLayer(40.5, "sine", 0.16, 0.11, 0.3, 2.0);

    // Layer 3: Audible bass — 80Hz (this is what laptops/phones actually hear)
    makeLayer(80, "sine", 0.10, 0.08, 0.8, 1.8);

    // Layer 4: Harmonic warmth — 120Hz quinta
    makeLayer(120, "sine", 0.05, 0.09, 1.1, 1.5);

    // Layer 5: Upper shimmer — 240Hz soft triangle
    makeLayer(240, "triangle", 0.02, 0.13, 1.5, 1.5);

    // Master fade-in envelope
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.24, ctx.currentTime + 3.5);

    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    if (ctxRef.current && masterRef.current) {
      masterRef.current.gain.linearRampToValueAtTime(
        0,
        ctxRef.current.currentTime + 1
      );
      setTimeout(() => {
        ctxRef.current?.close();
        ctxRef.current = null;
        masterRef.current = null;
      }, 1200);
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
      aria-label={playing ? "Desligar som" : "Ligar som ambiente"}
      title="Som ambiente"
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
