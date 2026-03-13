import { useState, useRef, useEffect } from "react";

/**
 * NUTRION — Motivational Electronic Track
 * Web Audio API music engine. No external files.
 *
 * Architecture  (124 BPM, A minor):
 *  — Kick      : 4/4 pattern + ghost on beat 3 offbeat
 *  — Snare/Clap: Beats 2 & 4 (bandpass noise + tone layer)
 *  — Hi-hat    : 8th-note grid, open-hat accents
 *  — Bass      : Sawtooth + aggressive lowpass (Am pentatonic root walk)
 *  — Pads      : 4 detuned sines per chord, Am→F→C→G→Am→F→Em→Am
 *  — Arp       : Triangle osc, A-minor pentatonic rising 16ths (enters bar 2)
 *  — Lead      : Filtered square, call-and-response melody (enters bar 4)
 *  — Build swell: filter sweep on pad layer, opened every 8 bars
 *  — Master    : DynamicsCompressor → Gain (fade 3 s)
 *
 * Scheduler: setInterval 50 ms, 0.3 s lookahead — zero-jitter event booking.
 */

const BPM = 124;
const BEAT = 60 / BPM;
const STEP = BEAT / 4; // 16th note ≈ 0.121 s

/* ── Harmonic tables ─────────────────────────────────────── */
const CHORDS: Record<string, number[]> = {
  Am: [110, 130.81, 164.81, 220.00],
  F:  [87.31, 110.00, 130.81, 174.61],
  C:  [65.41, 82.41,  98.00, 130.81],
  G:  [98.00, 123.47, 146.83, 196.00],
  Em: [82.41, 98.00, 123.47, 164.81],
};
const CHORD_SEQ = ["Am","Am","F","F","C","C","G","G","Am","Am","F","F","Em","Em","Am","Am"];

// A-minor pentatonic: A2 C3 E3 G3 A3 C4 E4 A4
const ARP_NOTES = [110, 130.81, 164.81, 196.00, 220.00, 261.63, 329.63, 440.00];

// ARP pattern — 16th-note step index → ARP_NOTES index (or null)
const ARP: (number | null)[] = [
  0, null, 1, null, 2, null, 3, null,
  4, null, 3, null, 5, null, 6, null,
];

// Lead melody — A-minor scale, 2-bar phrase
const LEAD: (number | null)[] = [
  220, null, 246.94, null, 261.63, 246.94, null, 220,
  196.00, null, 220, null, 246.94, null, null, null,
  220, null, null, 196.00, 174.61, null, 196.00, null,
  220, null, 246.94, null, 261.63, null, null, null,
];

/* ── Rhythm grids (16 steps) ─────────────────────────────── */
const KICK  = [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,1,0,0];
const SNARE = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0];
const HAT   = [1,1,1,0, 1,1,1,0, 1,1,1,1, 1,1,1,2]; // 2=open
const BASS  = [1,0,0,0, 0,0,1,0, 1,0,0,1, 0,0,0,0];

/* ── Utility ─────────────────────────────────────────────── */
function mkNoise(ctx: AudioContext, dur: number) {
  const len = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/* ── Instrument schedulers ───────────────────────────────── */
function kick(ctx: AudioContext, dst: AudioNode, t: number, vel = 1) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(190, t);
  o.frequency.exponentialRampToValueAtTime(26, t + 0.32);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(1.2 * vel, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
  o.connect(g); g.connect(dst);
  o.start(t); o.stop(t + 0.5);
}

function snare(ctx: AudioContext, dst: AudioNode, t: number) {
  // Noise layer
  const ns = ctx.createBufferSource();
  ns.buffer = mkNoise(ctx, 0.18);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = 3200; bp.Q.value = 0.7;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 900;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0, t);
  ng.gain.linearRampToValueAtTime(0.45, t + 0.002);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  ns.connect(bp); bp.connect(hp); hp.connect(ng); ng.connect(dst);
  ns.start(t); ns.stop(t + 0.18);

  // Tone layer (snap)
  const ot = ctx.createOscillator();
  const og = ctx.createGain();
  ot.type = "triangle"; ot.frequency.value = 180;
  og.gain.setValueAtTime(0, t);
  og.gain.linearRampToValueAtTime(0.25, t + 0.002);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  ot.connect(og); og.connect(dst);
  ot.start(t); ot.stop(t + 0.1);
}

function hat(ctx: AudioContext, dst: AudioNode, t: number, open: boolean) {
  const ns = ctx.createBufferSource();
  ns.buffer = mkNoise(ctx, open ? 0.28 : 0.05);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 9000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(open ? 0.14 : 0.09, t + 0.001);
  g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.25 : 0.04));
  ns.connect(hp); hp.connect(g); g.connect(dst);
  ns.start(t); ns.stop(t + (open ? 0.28 : 0.06));
}

function bass(ctx: AudioContext, dst: AudioNode, t: number, freq: number, dur = STEP) {
  const o = ctx.createOscillator();
  const lp = ctx.createBiquadFilter();
  const g = ctx.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(freq, t);
  lp.type = "lowpass"; lp.frequency.value = 440; lp.Q.value = 3.5;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.62, t + 0.006);
  g.gain.setValueAtTime(0.62, t + dur * 0.82);
  g.gain.linearRampToValueAtTime(0.001, t + dur * 0.95);
  o.connect(lp); lp.connect(g); g.connect(dst);
  o.start(t); o.stop(t + dur);
}

function pad(ctx: AudioContext, dst: AudioNode, t: number, chord: string, dur: number, filterFreq: number) {
  const freqs = CHORDS[chord];
  freqs.forEach((freq, i) => {
    const o = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq * (1 + (i % 2 === 0 ? 0.0025 : -0.0025));
    lp.type = "lowpass"; lp.frequency.value = filterFreq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.033, t + 0.12);
    g.gain.setValueAtTime(0.033, t + dur - 0.15);
    g.gain.linearRampToValueAtTime(0.001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(dst);
    o.start(t); o.stop(t + dur + 0.1);
  });
}

function arp(ctx: AudioContext, dst: AudioNode, t: number, freq: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.08, t + 0.005);
  g.gain.setValueAtTime(0.08, t + STEP * 0.65);
  g.gain.linearRampToValueAtTime(0.001, t + STEP * 0.85);
  o.connect(g); g.connect(dst);
  o.start(t); o.stop(t + STEP);
}

function lead(ctx: AudioContext, dst: AudioNode, t: number, freq: number) {
  const o = ctx.createOscillator();
  const lp = ctx.createBiquadFilter();
  const g = ctx.createGain();
  o.type = "square";
  o.frequency.value = freq;
  lp.type = "lowpass"; lp.frequency.value = 1800;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.055, t + 0.008);
  g.gain.setValueAtTime(0.055, t + STEP * 0.7);
  g.gain.linearRampToValueAtTime(0.001, t + STEP * 0.9);
  o.connect(lp); lp.connect(g); g.connect(dst);
  o.start(t); o.stop(t + STEP);
}

/* ── Component ───────────────────────────────────────────── */
const LandingAudio = () => {
  const [on, setOn] = useState(false);
  const ctxRef    = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const compRef   = useRef<DynamicsCompressorNode | null>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextRef   = useRef(0);
  const stepRef   = useRef(0);
  const barRef    = useRef(0);

  const schedule = (ctx: AudioContext, dst: AudioNode) => {
    const lookahead = 0.3;
    while (nextRef.current < ctx.currentTime + lookahead) {
      const t   = nextRef.current;
      const s   = stepRef.current % 16;
      const bar = barRef.current;

      /* Kick */
      if (KICK[s]) kick(ctx, dst, t, s === 0 ? 1 : 0.82);

      /* Snare */
      if (SNARE[s] && bar >= 1) snare(ctx, dst, t);

      /* Hi-hat (from bar 0) */
      if (HAT[s]) hat(ctx, dst, t, HAT[s] === 2);

      /* Bass root (Am pentatonic root walk) */
      const chordName = CHORD_SEQ[bar % CHORD_SEQ.length];
      const bassRoot = CHORDS[chordName][0];
      if (BASS[s]) bass(ctx, dst, t, bassRoot, STEP * (s === 0 || s === 8 ? 3 : 1.5));

      /* Pads — trigger on quarter note, filter sweeps up after bar 4 */
      if (s % 4 === 0) {
        const filterOpen = bar >= 4 ? 2200 : 800;
        pad(ctx, dst, t, chordName, BEAT - 0.05, filterOpen);
      }

      /* Arp — from bar 2 */
      if (bar >= 2 && ARP[s] !== null) {
        const arpNote = ARP_NOTES[ARP[s] as number];
        arp(ctx, dst, t, arpNote);
      }

      /* Lead melody — from bar 4, 32-step loop */
      if (bar >= 4) {
        const leadStep = ((bar - 4) * 16 + s) % 32;
        if (LEAD[leadStep] !== null) lead(ctx, dst, t, LEAD[leadStep] as number);
      }

      nextRef.current += STEP;
      stepRef.current++;
      if (stepRef.current % 16 === 0) barRef.current++;
    }
  };

  const startEngine = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 8;
    comp.ratio.value = 5;
    comp.attack.value = 0.002;
    comp.release.value = 0.2;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.78, ctx.currentTime + 3);

    comp.connect(master);
    master.connect(ctx.destination);

    ctxRef.current    = ctx;
    masterRef.current = master;
    compRef.current   = comp;
    stepRef.current   = 0;
    barRef.current    = 0;
    nextRef.current   = ctx.currentTime + 0.1;

    timerRef.current = setInterval(() => {
      if (ctxRef.current) schedule(ctxRef.current, comp);
    }, 50);
  };

  const stopEngine = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const ctx    = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 1.8);
    setTimeout(() => {
      ctx.close().catch(() => {});
      ctxRef.current    = null;
      masterRef.current = null;
      compRef.current   = null;
    }, 2000);
  };

  const toggle = () => {
    if (on) { stopEngine(); setOn(false); }
    else    { startEngine(); setOn(true); }
  };

  useEffect(() => () => stopEngine(), []);

  return (
    <button
      onClick={toggle}
      title={on ? "Pausar trilha" : "Tocar trilha NUTRION"}
      aria-label={on ? "Pausar trilha" : "Tocar trilha NUTRION"}
      className="fixed bottom-6 right-6 z-[60] w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        background: on ? "rgba(0,240,180,.07)" : "rgba(232,160,32,.05)",
        border: on ? "1px solid rgba(0,240,180,.22)" : "1px solid rgba(232,160,32,.1)",
        backdropFilter: "blur(20px)",
        boxShadow: on
          ? "0 0 24px rgba(0,240,180,.12), 0 4px 20px rgba(0,0,0,.4)"
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
          {/* EQ bars */}
          <div className="absolute -left-9 flex items-end gap-[2px] pb-0.5">
            {[3,5,7,5,6,4,5,3].map((h, i) => (
              <div key={i} style={{
                width: "2px", height: `${h}px`,
                background: i < 4 ? "rgba(0,240,180,.5)" : "rgba(232,160,32,.5)",
                borderRadius: "1px",
                animation: `sound-bar ${0.6 + i * 0.08}s ease-in-out ${i * 0.09}s infinite alternate`,
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
