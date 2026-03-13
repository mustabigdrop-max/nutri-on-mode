import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Full 124 BPM music engine in A minor via Web Audio API.
 * Kick, hi-hat, bass synth, chord pads, melody — all synthesized.
 * Lookahead scheduler for gapless looping.
 */
const LandingAudio = () => {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const schedulerRef = useRef<number | null>(null);

  const BPM = 124;
  const BEAT = 60 / BPM; // ~0.484s
  const BAR = BEAT * 4;
  const LOOKAHEAD = 0.25;
  const SCHEDULE_INTERVAL = 100; // ms

  // A minor scale: A B C D E F G
  const Am = [220, 261.63, 329.63, 440]; // A3 C4 E4 A4
  const F  = [174.61, 220, 261.63, 349.23]; // F3 A3 C4 F4
  const C  = [130.81, 196, 261.63, 329.63]; // C3 G3 C4 E4
  const G  = [196, 246.94, 293.66, 392]; // G3 B3 D4 G4
  const CHORDS = [Am, F, C, G]; // 1 bar each, 4-bar loop

  // Melody (A minor pentatonic), quarter notes, enters bar 2
  const MELODY_NOTES = [
    440, 523.25, 440, 392, // bar 2
    349.23, 329.63, 293.66, 329.63, // bar 3
    349.23, 392, 440, 523.25, // bar 4 (loop wrap)
  ];

  const start = useCallback(() => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    // Master chain: compressor → gain → destination
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.15;
    compressor.connect(ctx.destination);

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 3);
    master.connect(compressor);
    masterRef.current = master;

    // Sub-buses
    const drumBus = ctx.createGain();
    drumBus.gain.value = 0.7;
    drumBus.connect(master);

    const bassBus = ctx.createGain();
    bassBus.gain.value = 0.25;
    bassBus.connect(master);

    const padBus = ctx.createGain();
    padBus.gain.value = 0.12;
    padBus.connect(master);

    const melodyBus = ctx.createGain();
    melodyBus.gain.value = 0.10;
    melodyBus.connect(master);

    // ---- INSTRUMENTS ----

    const playKick = (time: number) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(28, time + 0.08);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.9, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      osc.connect(gain).connect(drumBus);
      osc.start(time);
      osc.stop(time + 0.4);
    };

    const playHiHat = (time: number, open: boolean) => {
      const bufferSize = ctx.sampleRate * (open ? 0.15 : 0.05);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const src = ctx.createBufferSource();
      src.buffer = buffer;

      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 7000;

      const gain = ctx.createGain();
      const dur = open ? 0.12 : 0.04;
      gain.gain.setValueAtTime(open ? 0.35 : 0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      src.connect(hp).connect(gain).connect(drumBus);
      src.start(time);
      src.stop(time + dur + 0.01);
    };

    const playBass = (time: number, freq: number) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq / 2; // one octave down

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 380;
      lp.Q.value = 2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, time);
      gain.gain.setValueAtTime(0.6, time + BEAT - 0.05);
      gain.gain.linearRampToValueAtTime(0, time + BEAT);

      osc.connect(lp).connect(gain).connect(bassBus);
      osc.start(time);
      osc.stop(time + BEAT + 0.01);
    };

    const playPad = (time: number, chord: number[]) => {
      const detunes = [-6, -2, 2, 6];
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.detune.value = detunes[i];

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.5, time + 0.3);
        gain.gain.setValueAtTime(0.5, time + BAR - 0.2);
        gain.gain.linearRampToValueAtTime(0, time + BAR);

        osc.connect(gain).connect(padBus);
        osc.start(time);
        osc.stop(time + BAR + 0.05);
      });
    };

    const playMelody = (time: number, freq: number) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.6, time + 0.03);
      gain.gain.setValueAtTime(0.6, time + BEAT * 0.7);
      gain.gain.linearRampToValueAtTime(0, time + BEAT);

      osc.connect(gain).connect(melodyBus);
      osc.start(time);
      osc.stop(time + BEAT + 0.05);
    };

    // ---- SCHEDULER ----
    const LOOP_BARS = 4;
    const LOOP_BEATS = LOOP_BARS * 4; // 16 beats
    let nextBeatTime = ctx.currentTime + 0.05;
    let currentBeat = 0;

    const schedule = () => {
      while (nextBeatTime < ctx.currentTime + LOOKAHEAD) {
        const barIndex = Math.floor(currentBeat / 4) % LOOP_BARS;
        const beatInBar = currentBeat % 4;

        // Kick on beats 0, 2 (four-on-floor would be every beat, this is half-time feel)
        if (beatInBar === 0 || beatInBar === 2) {
          playKick(nextBeatTime);
        }

        // Hi-hat on every 8th note
        const isOpen = beatInBar === 2;
        playHiHat(nextBeatTime, isOpen);
        // offbeat 8th
        playHiHat(nextBeatTime + BEAT / 2, false);

        // Bass on beat 0 and 2 of each bar — root of current chord
        if (beatInBar === 0 || beatInBar === 2) {
          playBass(nextBeatTime, CHORDS[barIndex][0]);
        }

        // Pad: trigger once per bar on beat 0
        if (beatInBar === 0) {
          playPad(nextBeatTime, CHORDS[barIndex]);
        }

        // Melody: enters from bar 1 (beat 4+), quarter notes
        if (currentBeat >= 4) {
          const melodyIdx = (currentBeat - 4) % MELODY_NOTES.length;
          playMelody(nextBeatTime, MELODY_NOTES[melodyIdx]);
        }

        currentBeat = (currentBeat + 1) % LOOP_BEATS;
        nextBeatTime += BEAT;
      }
    };

    schedulerRef.current = window.setInterval(schedule, SCHEDULE_INTERVAL);
    schedule(); // kick off immediately

    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    if (schedulerRef.current !== null) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    if (ctxRef.current && masterRef.current) {
      const ctx = ctxRef.current;
      masterRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => {
        ctx.close();
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
