import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

const LandingAudio = () => {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ gain: GainNode } | null>(null);

  const start = useCallback(() => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Sub-bass 41 Hz
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = 41;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.18;
    sub.connect(subGain).connect(master);
    sub.start();

    // Fifth harmonic
    const fifth = ctx.createOscillator();
    fifth.type = "sine";
    fifth.frequency.value = 61.5;
    const fifthGain = ctx.createGain();
    fifthGain.gain.value = 0.08;
    fifth.connect(fifthGain).connect(master);
    fifth.start();

    // Mid warmth
    const mid = ctx.createOscillator();
    mid.type = "triangle";
    mid.frequency.value = 165;
    const midGain = ctx.createGain();
    midGain.gain.value = 0.04;
    mid.connect(midGain).connect(master);
    mid.start();

    // Shimmer
    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = 528;
    const shimGain = ctx.createGain();
    shimGain.gain.value = 0.015;
    shimmer.connect(shimGain).connect(master);
    shimmer.start();

    // LFO on master
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain).connect(master.gain);
    lfo.start();

    // Convolver reverb (synthetic impulse)
    const convolver = ctx.createConvolver();
    const rate = ctx.sampleRate;
    const length = rate * 3;
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    convolver.buffer = impulse;
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.12;
    master.connect(convolver);
    convolver.connect(reverbGain).connect(ctx.destination);

    // Fade in
    master.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 2);
    nodesRef.current = { gain: master };
    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    if (ctxRef.current && nodesRef.current) {
      nodesRef.current.gain.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 1);
      setTimeout(() => {
        ctxRef.current?.close();
        ctxRef.current = null;
        nodesRef.current = null;
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
