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

    const makeOsc = (freq: number, type: OscillatorType, vol: number, lfoRate: number) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      osc.connect(gain).connect(master);

      // Tremolo LFO
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = lfoRate;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = vol * 0.3;
      lfo.connect(lfoGain).connect(gain.gain);
      lfo.start();
      osc.start();
    };

    // 6 pure oscillators — no convolver
    makeOsc(41, "sine", 0.18, 0.06);      // Sub-bass
    makeOsc(82, "sine", 0.10, 0.08);      // Oitava
    makeOsc(123, "sine", 0.06, 0.11);     // Quinta perfeita
    makeOsc(164, "triangle", 0.04, 0.14); // Mid warmth
    makeOsc(328, "sine", 0.015, 0.27);    // Shimmer
    makeOsc(41.3, "sine", 0.16, 0.07);    // Gêmeo desafinado — batimento orgânico

    // Fade in 3.5s
    master.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 3.5);
    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    if (ctxRef.current && masterRef.current) {
      masterRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 1);
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
