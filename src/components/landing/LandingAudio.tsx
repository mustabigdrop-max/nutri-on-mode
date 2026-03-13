import { useState, useRef, useEffect } from "react";

/**
 * NUTRION Motivational Track — Web Audio API music engine.
 *
 * Architecture:
 *  - BPM: 124, Key: A minor
 *  - Kick drum: pitch envelope (180Hz→28Hz) + sharp gain envelope
 *  - Hi-hat: filtered white noise bursts (highpass 7kHz), 16th-note grid
 *  - Bass: sawtooth + lowpass 380Hz, follows kick pattern + fills
 *  - Pad chords: 4 detuned sines per chord (Am, F, C, G) cycling every 4 bars
 *  - Melody: triangle oscillators on A-minor scale, call-and-response
 *  - Master: compressor + limiter chain, global volume fade-in over 3s
 *
 * Scheduler pattern: setInterval every 50ms, lookahead 0.25s
 * Each "event" is scheduled via AudioParam automation — no clicks/pops.
 */

const BPM = 124;
const BEAT = 60 / BPM;          // seconds per beat
const STEP = BEAT / 4;           // 16th note

// Chord voicings (root + third + fifth + octave, Hz)
const CHORDS: Record<string, number[]> = {
  Am: [110, 130.8, 165.0, 220],
  F:  [87.3, 110.0, 130.8, 174.6],
  C:  [65.4, 82.5, 98.0, 130.8],
  G:  [98.0, 123.5, 146.8, 196.0],
};
const CHORD_SEQ = ["Am", "Am", "F", "C", "G", "G", "Am", "Am"];

// Melody notes (Hz) for A-minor scale, one phrase repeats
const MEL: (number | null)[] = [
  220, null, 246.9, null, 261.6, 246.9, null, 220,
  196, null, 220, null, 246.9, null, null, null,
];

// Kick pattern (16 steps): 1=kick
const KICK = [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,1,0,0];
// Hi-hat (16 steps): 1=closed, 2=open
const HAT  = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,2];
// Bass (16 steps): 1=note
const BASS = [1,0,0,0, 0,0,1,0, 1,0,0,1, 0,0,0,0];

function makeNoise(ctx: AudioContext, duration: number) {
  const len = Math.ceil(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function scheduleKick(ctx: AudioContext, dest: AudioNode, t: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(28, t + 0.28);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(1.1, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
  o.connect(g); g.connect(dest);
  o.start(t); o.stop(t + 0.45);
}

function scheduleHat(ctx: AudioContext, dest: AudioNode, t: number, open: boolean) {
  const src = ctx.createBufferSource();
  src.buffer = makeNoise(ctx, open ? 0.25 : 0.06);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(open ? 0.18 : 0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.22 : 0.05));
  src.connect(hp); hp.connect(g); g.connect(dest);
  src.start(t); src.stop(t + (open ? 0.25 : 0.07));
}

function scheduleBass(ctx: AudioContext, dest: AudioNode, t: number, freq: number) {
  const o = ctx.createOscillator();
  const lp = ctx.createBiquadFilter();
  const g = ctx.createGain();
  o.type = "sawtooth";
  o.frequency.value = freq;
  lp.type = "lowpass"; lp.frequency.value = 380; lp.Q.value = 2;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.55, t + 0.008);
  g.gain.setValueAtTime(0.55, t + STEP * 0.8);
  g.gain.linearRampToValueAtTime(0.001, t + STEP * 0.9);
  o.connect(lp); lp.connect(g); g.connect(dest);
  o.start(t); o.stop(t + STEP);
}

function scheduleChord(
  ctx: AudioContext,
  dest: AudioNode,
  t: number,
  chordName: string,
  dur: number
) {
  const freqs = CHORDS[chordName];
  freqs.forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq * (1 + (i % 2 === 0 ? 0.002 : -0.002)); // slight detune
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.038, t + 0.06);
    g.gain.setValueAtTime(0.038, t + dur - 0.1);
    g.gain.linearRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  });
}

function scheduleMelNote(ctx: AudioContext, dest: AudioNode, t: number, freq: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.09, t + 0.01);
  g.gain.setValueAtTime(0.09, t + STEP * 0.7);
  g.gain.linearRampToValueAtTime(0.001, t + STEP * 0.9);
  o.connect(g); g.connect(dest);
  o.start(t); o.stop(t + STEP);
}

const LandingAudio = () => {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextStepTimeRef = useRef(0);
  const stepRef = useRef(0);
  const barRef = useRef(0);

  const schedule = (ctx: AudioContext, dest: AudioNode) => {
    const lookahead = 0.25;
    while (nextStepTimeRef.current < ctx.currentTime + lookahead) {
      const t = nextStepTimeRef.current;
      const s = stepRef.current % 16;
      const bar = barRef.current;

      // Kick
      if (KICK[s]) scheduleKick(ctx, dest, t);

      // Hi-hat (start at bar 2 for build)
      if (bar >= 1 && HAT[s]) scheduleHat(ctx, dest, t, HAT[s] === 2);

      // Bass root note — follows chord
      const chordIdx = Math.floor(s / 2) % CHORD_SEQ.length;
      const chordName = CHORD_SEQ[Math.floor(bar / 1) % CHORD_SEQ.length];
      const bassRoot = CHORDS[chordName][0];
      if (BASS[s]) scheduleBass(ctx, dest, t, bassRoot);

      // Chord pad — trigger at start of every 4 steps (quarter note)
      if (s % 4 === 0) {
        const padChord = CHORD_SEQ[Math.floor(bar % CHORD_SEQ.length)];
        scheduleChord(ctx, dest, t, padChord, BEAT - 0.05);
      }

      // Melody — start at bar 2
      if (bar >= 2) {
        const melNote = MEL[s];
        if (melNote !== null) scheduleMelNote(ctx, dest, t, melNote);
      }

      nextStepTimeRef.current += STEP;
      stepRef.current++;
      if (stepRef.current % 16 === 0) barRef.current++;
    }
  };

  const start = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 10;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.82, ctx.currentTime + 3);

    comp.connect(master);
    master.connect(ctx.destination);

    ctxRef.current = ctx;
    masterRef.current = master;
    stepRef.current = 0;
    barRef.current = 0;
    nextStepTimeRef.current = ctx.currentTime + 0.1;

    schedulerRef.current = setInterval(() => {
      if (ctxRef.current) schedule(ctxRef.current, comp);
    }, 50);
  };

  const stop = () => {
    if (schedulerRef.current) { clearInterval(schedulerRef.current); schedulerRef.current = null; }
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 2);
    setTimeout(() => {
      ctx.close().catch(() => {});
      ctxRef.current = null;
      masterRef.current = null;
    }, 2200);
  };

  const toggle = () => {
    if (on) { stop(); setOn(false); }
    else { start(); setOn(true); }
  };

  useEffect(() => () => stop(), []);

  return (
    <button
      onClick={toggle}
      title={on ? "Pausar música" : "Tocar trilha NUTRION"}
      aria-label={on ? "Pausar música" : "Tocar trilha NUTRION"}
      className="fixed bottom-6 right-6 z-[60] w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        background: on ? "rgba(0,240,180,.07)" : "rgba(232,160,32,.05)",
        border: on ? "1px solid rgba(0,240,180,.22)" : "1px solid rgba(232,160,32,.1)",
        backdropFilter: "blur(20px)",
        boxShadow: on
          ? "0 0 24px rgba(0,240,180,.1), 0 4px 20px rgba(0,0,0,.4)"
          : "0 4px 20px rgba(0,0,0,.3)",
      }}
    >
      {on ? (
        <>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="1" y="1" width="3" height="9" rx="0.8" fill="rgba(0,240,180,.8)" />
            <rect x="7" y="1" width="3" height="9" rx="0.8" fill="rgba(0,240,180,.8)" />
          </svg>
          <span className="absolute inset-0 rounded-full opacity-10 animate-[ping_2.5s_ease-out_infinite]"
            style={{ background: "rgba(0,240,180,.6)" }} />
          <div className="absolute -left-8 flex items-end gap-[2px] pb-0.5">
            {[3, 5, 4, 6, 5, 4, 3].map((h, i) => (
              <div key={i} style={{
                width: "2px", height: `${h}px`,
                background: "rgba(0,240,180,.5)", borderRadius: "1px",
                animation: `sound-bar 0.9s ease-in-out ${i * 0.11}s infinite alternate`,
              }} />
            ))}
          </div>
        </>
      ) : (
        <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
          <path d="M1.5 4.5V9.5H5L10.5 12.5V1.5L5 4.5H1.5Z" fill="rgba(232,160,32,.65)" />
          <path d="M9.2 5C10.3 5.9 10.3 8.1 9.2 9" stroke="rgba(232,160,32,.4)" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M11 3.5C12.8 5.2 12.8 8.8 11 10.5" stroke="rgba(232,160,32,.18)" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
};

export default LandingAudio;
