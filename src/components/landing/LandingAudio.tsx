import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

const LandingAudio = () => {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const schedulerRef = useRef<number | null>(null);

  const BPM = 124;
  const BEAT = 60 / BPM;
  const BAR = BEAT * 4;
  const LOOKAHEAD = 0.25;
  const SCHEDULE_INTERVAL = 100;

  const Am = [220, 261.63, 329.63, 440];
  const F  = [174.61, 220, 261.63, 349.23];
  const C  = [130.81, 196, 261.63, 329.63];
  const G  = [196, 246.94, 293.66, 392];
  const CHORDS = [Am, F, C, G];

  // A minor pentatonic melody — call and response phrase
  const MELODY_PHRASE = [
    440, 523.25, 659.25, 523.25,  // call
    440, 392, 329.63, 0,          // response (0 = rest)
    523.25, 659.25, 784, 659.25,  // call 2
    523.25, 440, 392, 0,          // response 2
  ];

  // Arp notes (A minor pentatonic ascending patterns)
  const ARP_NOTES = [
    220, 261.63, 329.63, 392, 440, 523.25, 659.25, 784,
    659.25, 523.25, 440, 392, 329.63, 261.63, 220, 261.63,
  ];

  const start = useCallback(() => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    // Tighter compressor
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -22;
    compressor.knee.value = 6;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.002;
    compressor.release.value = 0.1;
    compressor.connect(ctx.destination);

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.38, ctx.currentTime + 3);
    master.connect(compressor);
    masterRef.current = master;

    // Sub-buses
    const drumBus = ctx.createGain();
    drumBus.gain.value = 0.65;
    drumBus.connect(master);

    const bassBus = ctx.createGain();
    bassBus.gain.value = 0.30;
    bassBus.connect(master);

    // Pad bus with sweepable filter
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 800;
    padFilter.Q.value = 1.5;
    padFilter.connect(master);

    const padBus = ctx.createGain();
    padBus.gain.value = 0.14;
    padBus.connect(padFilter);

    const arpBus = ctx.createGain();
    arpBus.gain.value = 0;
    arpBus.connect(master);

    const melodyBus = ctx.createGain();
    melodyBus.gain.value = 0;
    melodyBus.connect(master);

    const leadBus = ctx.createGain();
    leadBus.gain.value = 0;
    const leadFilter = ctx.createBiquadFilter();
    leadFilter.type = "lowpass";
    leadFilter.frequency.value = 1200;
    leadFilter.Q.value = 2;
    leadBus.connect(leadFilter).connect(master);

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

    const playSnare = (time: number) => {
      // Noise layer — bandpass
      const bufLen = ctx.sampleRate * 0.12;
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 3500;
      bp.Q.value = 1.2;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.55, time);
      nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      noise.connect(bp).connect(nGain).connect(drumBus);
      noise.start(time);
      noise.stop(time + 0.13);

      // Tonal snap layer
      const snap = ctx.createOscillator();
      snap.type = "triangle";
      snap.frequency.setValueAtTime(220, time);
      snap.frequency.exponentialRampToValueAtTime(120, time + 0.04);
      const sGain = ctx.createGain();
      sGain.gain.setValueAtTime(0.4, time);
      sGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
      snap.connect(sGain).connect(drumBus);
      snap.start(time);
      snap.stop(time + 0.08);
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
      gain.gain.setValueAtTime(open ? 0.3 : 0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      src.connect(hp).connect(gain).connect(drumBus);
      src.start(time);
      src.stop(time + dur + 0.01);
    };

    const playBass = (time: number, freq: number) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq / 2;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 420;
      lp.Q.value = 3.5;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7, time);
      gain.gain.setValueAtTime(0.7, time + BEAT - 0.05);
      gain.gain.linearRampToValueAtTime(0, time + BEAT);
      osc.connect(lp).connect(gain).connect(bassBus);
      osc.start(time);
      osc.stop(time + BEAT + 0.01);
    };

    const playPad = (time: number, chord: number[]) => {
      const detunes = [-8, -3, 3, 8];
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

    const playArp = (time: number, freq: number) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      const noteDur = BEAT * 0.4;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.5, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + noteDur);
      osc.connect(gain).connect(arpBus);
      osc.start(time);
      osc.stop(time + noteDur + 0.01);
    };

    const playLead = (time: number, freq: number) => {
      if (freq === 0) return;
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.45, time + 0.02);
      gain.gain.setValueAtTime(0.45, time + BEAT * 0.6);
      gain.gain.linearRampToValueAtTime(0, time + BEAT * 0.9);
      osc.connect(gain).connect(leadBus);
      osc.start(time);
      osc.stop(time + BEAT + 0.05);
    };

    // ---- SCHEDULER ----
    const LOOP_BARS = 8;
    const LOOP_BEATS = LOOP_BARS * 4;
    let nextBeatTime = ctx.currentTime + 0.05;
    let currentBeat = 0;

    const schedule = () => {
      while (nextBeatTime < ctx.currentTime + LOOKAHEAD) {
        const barIndex = Math.floor(currentBeat / 4) % 4; // chord repeats every 4 bars
        const globalBar = Math.floor(currentBeat / 4);
        const beatInBar = currentBeat % 4;

        // Kick on 0, 2
        if (beatInBar === 0 || beatInBar === 2) {
          playKick(nextBeatTime);
        }

        // Snare/clap on beats 1 and 3 (backbeat)
        if (beatInBar === 1 || beatInBar === 3) {
          playSnare(nextBeatTime);
        }

        // Hi-hat every 8th
        const isOpen = beatInBar === 2;
        playHiHat(nextBeatTime, isOpen);
        playHiHat(nextBeatTime + BEAT / 2, false);

        // Bass on beat 0 and 2 — walking root
        if (beatInBar === 0) {
          playBass(nextBeatTime, CHORDS[barIndex][0]);
        } else if (beatInBar === 2) {
          // Walk to 5th
          playBass(nextBeatTime, CHORDS[barIndex][0] * 1.5);
        }

        // Pads every bar
        if (beatInBar === 0) {
          playPad(nextBeatTime, CHORDS[barIndex]);
        }

        // Filter sweep: from bar 4, open pad filter 800→2200Hz
        if (globalBar >= 4 && beatInBar === 0) {
          const sweepProgress = (globalBar - 4) / 4;
          const targetFreq = 800 + sweepProgress * 1400;
          padFilter.frequency.linearRampToValueAtTime(
            Math.min(targetFreq, 2200), nextBeatTime + BAR
          );
        }

        // Arp enters from bar 2 (beat 8+), progressive volume
        if (currentBeat >= 8) {
          const arpIdx = currentBeat % ARP_NOTES.length;
          playArp(nextBeatTime, ARP_NOTES[arpIdx]);
          // Ramp arp volume up progressively
          if (currentBeat === 8) {
            arpBus.gain.linearRampToValueAtTime(0.06, nextBeatTime + 0.01);
          } else if (currentBeat === 16) {
            arpBus.gain.linearRampToValueAtTime(0.10, nextBeatTime + 0.01);
          }
        }

        // Lead melody enters from bar 4 (beat 16+), call-and-response
        if (currentBeat >= 16) {
          const mIdx = (currentBeat - 16) % MELODY_PHRASE.length;
          playLead(nextBeatTime, MELODY_PHRASE[mIdx]);
          if (currentBeat === 16) {
            leadBus.gain.linearRampToValueAtTime(0.08, nextBeatTime + 0.01);
            melodyBus.gain.linearRampToValueAtTime(0.08, nextBeatTime + 0.01);
          }
        }

        // Original triangle melody from bar 1
        if (currentBeat >= 4 && currentBeat < 16) {
          const mNotes = [440, 523.25, 440, 392, 349.23, 329.63, 293.66, 329.63, 349.23, 392, 440, 523.25];
          const melodyIdx = (currentBeat - 4) % mNotes.length;
          const osc = ctx.createOscillator();
          osc.type = "triangle";
          osc.frequency.value = mNotes[melodyIdx];
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0, nextBeatTime);
          gain.gain.linearRampToValueAtTime(0.5, nextBeatTime + 0.03);
          gain.gain.setValueAtTime(0.5, nextBeatTime + BEAT * 0.7);
          gain.gain.linearRampToValueAtTime(0, nextBeatTime + BEAT);
          osc.connect(gain).connect(melodyBus);
          osc.start(nextBeatTime);
          osc.stop(nextBeatTime + BEAT + 0.05);
          if (currentBeat === 4) {
            melodyBus.gain.linearRampToValueAtTime(0.10, nextBeatTime + 0.01);
          }
        }

        currentBeat = (currentBeat + 1) % LOOP_BEATS;
        nextBeatTime += BEAT;

        // Reset filter on loop restart
        if (currentBeat === 0) {
          padFilter.frequency.setValueAtTime(800, nextBeatTime);
        }
      }
    };

    schedulerRef.current = window.setInterval(schedule, SCHEDULE_INTERVAL);
    schedule();
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
      setTimeout(() => { ctx.close(); ctxRef.current = null; masterRef.current = null; }, 1200);
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
