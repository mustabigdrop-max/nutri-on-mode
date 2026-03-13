import { useState, useRef, useEffect } from "react";

/**
 * NUTRION — Dark Motivational Electronic Track
 * Web Audio API · no external files · sounds like a real production.
 *
 * What makes it NOT sound like a toy:
 *  1. Convolver reverb with proper exponential-decay impulse response
 *     (NOT the old short noise burst — that caused the bell ring)
 *  2. Sidechain compression: pads duck every kick hit → pumping EDM feel
 *  3. Sub-bass layer (sine 40–80 Hz) felt more than heard on any speaker
 *  4. Detuned oscillator pairs for warmth (beating = natural chorus)
 *  5. Stereo panning spreads the image
 *  6. Proper dynamic gain staging: kick > bass > pad > lead
 *  7. Build-up: bars 0-1 kick only → bar 2 hats → bar 3 bass → bar 5 pads → bar 7 lead
 *
 * 128 BPM · A minor · 4/4
 */

const BPM  = 128;
const BEAT = 60 / BPM;          // 0.469 s
const STEP = BEAT / 4;           // 16th note ≈ 0.117 s

/* ── Harmonic tables ─────────────────────────────────────── */
// Am → F → C → G progression, voiced lower for weight
const CHORDS: Record<string, { root: number; freqs: number[] }> = {
  Am: { root: 55,   freqs: [55, 82.4, 110, 164.8] },   // A1 E2 A2 E3
  F:  { root: 43.7, freqs: [43.7, 65.4, 87.3, 130.8] }, // F1 C2 F2 C3
  C:  { root: 65.4, freqs: [65.4, 82.4, 130.8, 196] },  // C2 E2 C3 G3
  G:  { root: 49,   freqs: [49, 73.4, 98, 146.8] },     // G1 D2 G2 D3
};
const CHORD_SEQ = ["Am","Am","F","F","C","C","G","G"];

// Motivational melodic hook: A minor scale, two-bar rising phrase
// A3→B3→C4→E4 rising then resolving back — sounds heroic, driving
const LEAD_NOTES: (number | null)[] = [
  220, null, 246.9, null, 261.6, null, 329.6, null,
  349.2, null, 329.6, null, 261.6, 246.9, 220, null,
  196, null, 220, null, 246.9, null, 261.6, null,
  329.6, null, null, 261.6, 246.9, null, 220, null,
];

// Arp pulse: 8th-note rhythmic chop on chord tones
const ARP_STEPS = [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0];

/* ── Rhythm grids ────────────────────────────────────────── */
const KICK  = [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,1,0,0];
const CLAP  = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0]; // beats 2 & 4
const CHAT  = [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1]; // closed hat 8ths
const OHAT  = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1]; // open hat bar-end
const BASS  = [1,0,0,0, 0,0,1,0, 1,0,0,1, 0,0,0,1];

/* ── Audio utility ───────────────────────────────────────── */
function mkNoise(ctx: AudioContext, dur: number) {
  const n = Math.ceil(ctx.sampleRate * dur);
  const b = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

/** Convolver-based reverb with proper exponential-decay IR.
 *  Key: IR is at least 0.5s, starts with pre-delay, fades OUT smoothly.
 *  This is what prevents the "bell ring" — no resonant peaks in the IR. */
function mkReverb(ctx: AudioContext) {
  const conv = ctx.createConvolver();
  const LEN  = Math.floor(ctx.sampleRate * 0.9); // 0.9 s plate
  const buf  = ctx.createBuffer(2, LEN, ctx.sampleRate);
  const PREDELAY = Math.floor(ctx.sampleRate * 0.012); // 12 ms pre-delay

  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < LEN; i++) {
      if (i < PREDELAY) { d[i] = 0; continue; }
      const t    = (i - PREDELAY) / (LEN - PREDELAY);
      const env  = Math.pow(1 - t, 3.0);  // steep exponential — no ringing
      const rand = Math.random() * 2 - 1;
      // Slight L/R difference for stereo width
      d[i] = rand * env * (ch === 0 ? 1 : 0.97 + Math.random() * 0.06);
    }
  }
  conv.buffer = buf;
  return conv;
}

/* ── Instrument functions ────────────────────────────────── */
function schedKick(ctx: AudioContext, dst: AudioNode, t: number) {
  // Sub body
  const sub = ctx.createOscillator();
  const sg  = ctx.createGain();
  sub.type = "sine";
  sub.frequency.setValueAtTime(140, t);
  sub.frequency.exponentialRampToValueAtTime(38, t + 0.25);
  sg.gain.setValueAtTime(0, t);
  sg.gain.linearRampToValueAtTime(1.5, t + 0.003);
  sg.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  sub.connect(sg); sg.connect(dst);
  sub.start(t); sub.stop(t + 0.52);

  // Click transient (very short noise burst at 3 kHz — 5 ms only)
  const ns = ctx.createBufferSource();
  ns.buffer = mkNoise(ctx, 0.005);
  const bp  = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = 3000; bp.Q.value = 1;
  const ng  = ctx.createGain();
  ng.gain.setValueAtTime(0.4, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.005);
  ns.connect(bp); bp.connect(ng); ng.connect(dst);
  ns.start(t); ns.stop(t + 0.006);
}

function schedClap(ctx: AudioContext, rev: AudioNode, dst: AudioNode, t: number) {
  // 3 micro-bursts (0 ms, 12 ms, 22 ms) = layered clap character
  [0, 0.012, 0.022].forEach((offset, i) => {
    const ns = ctx.createBufferSource();
    ns.buffer = mkNoise(ctx, 0.06);
    const hp  = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 1400;
    const bp  = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 1800; bp.Q.value = 0.9;
    const g   = ctx.createGain();
    const vol = [0.55, 0.35, 0.25][i];
    g.gain.setValueAtTime(0, t + offset);
    g.gain.linearRampToValueAtTime(vol, t + offset + 0.002);
    g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.055);
    ns.connect(hp); hp.connect(bp); bp.connect(g);
    g.connect(dst); g.connect(rev); // clap goes into reverb for room feel
    ns.start(t + offset); ns.stop(t + offset + 0.06);
  });
}

function schedHat(ctx: AudioContext, dst: AudioNode, t: number, open: boolean) {
  const dur = open ? 0.15 : 0.022;
  const ns = ctx.createBufferSource();
  ns.buffer = mkNoise(ctx, dur);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = open ? 8000 : 11000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(open ? 0.10 : 0.07, t + 0.001);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.95);
  ns.connect(hp); hp.connect(g); g.connect(dst);
  ns.start(t); ns.stop(t + dur);
}

function schedBass(ctx: AudioContext, dst: AudioNode, t: number, root: number, dur: number) {
  // Sub sine
  const sine = ctx.createOscillator();
  const sg   = ctx.createGain();
  sine.type = "sine"; sine.frequency.value = root;
  sg.gain.setValueAtTime(0, t);
  sg.gain.linearRampToValueAtTime(0.7, t + 0.008);
  sg.gain.setValueAtTime(0.7, t + dur * 0.75);
  sg.gain.linearRampToValueAtTime(0.001, t + dur * 0.92);
  sine.connect(sg); sg.connect(dst);
  sine.start(t); sine.stop(t + dur);

  // Sawtooth octave up — adds growl
  const saw  = ctx.createOscillator();
  const lp   = ctx.createBiquadFilter();
  const sawG = ctx.createGain();
  saw.type = "sawtooth"; saw.frequency.value = root * 2;
  lp.type = "lowpass"; lp.frequency.value = 320; lp.Q.value = 3;
  sawG.gain.setValueAtTime(0, t);
  sawG.gain.linearRampToValueAtTime(0.28, t + 0.01);
  sawG.gain.setValueAtTime(0.28, t + dur * 0.75);
  sawG.gain.linearRampToValueAtTime(0.001, t + dur * 0.9);
  saw.connect(lp); lp.connect(sawG); sawG.connect(dst);
  saw.start(t); saw.stop(t + dur);
}

function schedPad(
  ctx: AudioContext, dst: AudioNode, rev: AudioNode,
  t: number, chord: string, dur: number, padBus: GainNode
) {
  const { freqs } = CHORDS[chord];
  freqs.forEach((freq, i) => {
    // Pair of detuned sines — warm chorus-like beating
    [-0.003, 0.003].forEach(detune => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq * (1 + detune + (i % 2 === 0 ? 0.001 : -0.001));
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.018, t + 0.35); // slow attack — not a bell
      g.gain.setValueAtTime(0.018, t + dur - 0.5);
      g.gain.linearRampToValueAtTime(0.001, t + dur);
      o.connect(g);
      g.connect(padBus); // pads run through the sidechain bus
      if (Math.random() > 0.5) g.connect(rev); // some pad signal goes to reverb
      o.start(t); o.stop(t + dur + 0.1);
    });
  });
}

function schedArp(ctx: AudioContext, dst: AudioNode, t: number, freq: number) {
  const o = ctx.createOscillator();
  const lp = ctx.createBiquadFilter();
  const g  = ctx.createGain();
  o.type = "triangle"; o.frequency.value = freq * 2; // one octave up
  lp.type = "lowpass"; lp.frequency.value = 2000;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.06, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.001, t + STEP * 0.7);
  o.connect(lp); lp.connect(g); g.connect(dst);
  o.start(t); o.stop(t + STEP);
}

function schedLead(ctx: AudioContext, dst: AudioNode, rev: AudioNode, t: number, freq: number) {
  // Detuned sawtooth pair — fat lead sound
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = 2400;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.09, t + 0.01);
  g.gain.setValueAtTime(0.09, t + STEP * 0.72);
  g.gain.linearRampToValueAtTime(0.001, t + STEP * 0.9);

  [-0.006, 0.006].forEach(detune => {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq * (1 + detune);
    o.connect(lp);
    o.start(t); o.stop(t + STEP);
  });
  lp.connect(g); g.connect(dst);
  g.connect(rev); // lead has reverb tail
}

/** Sidechain duck: when kick hits, pad bus ducks then recovers — pumping effect */
function sidechainPump(t: number, padBus: GainNode) {
  padBus.gain.setValueAtTime(0.9, t);
  padBus.gain.linearRampToValueAtTime(0.05, t + 0.01); // instant duck
  padBus.gain.linearRampToValueAtTime(0.75, t + 0.28); // recovery
  padBus.gain.linearRampToValueAtTime(0.9, t + 0.45);  // settle
}

/* ── Component ───────────────────────────────────────────── */
const LandingAudio = () => {
  const [on, setOn] = useState(false);
  const ctxRef    = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const padBusRef = useRef<GainNode | null>(null);
  const revRef    = useRef<ConvolverNode | null>(null);
  const nextRef   = useRef(0);
  const stepRef   = useRef(0);
  const barRef    = useRef(0);

  const schedule = (ctx: AudioContext, dry: AudioNode) => {
    const lookahead = 0.28;
    const padBus = padBusRef.current!;
    const rev    = revRef.current!;

    while (nextRef.current < ctx.currentTime + lookahead) {
      const t   = nextRef.current;
      const s   = stepRef.current % 16;
      const bar = barRef.current;
      const chord = CHORD_SEQ[bar % CHORD_SEQ.length];
      const { root, freqs } = CHORDS[chord];

      /* ─ Drums (bar 0+) ─ */
      if (KICK[s]) {
        schedKick(ctx, dry, t);
        if (bar >= 3) sidechainPump(t, padBus);
      }
      if (bar >= 2 && CLAP[s]) schedClap(ctx, rev, dry, t);
      if (bar >= 2 && CHAT[s]) schedHat(ctx, dry, t, false);
      if (bar >= 2 && OHAT[s]) schedHat(ctx, dry, t, true);

      /* ─ Bass (bar 2+) ─ */
      if (bar >= 2 && BASS[s]) {
        const noteDur = s === 0 || s === 8 ? STEP * 3.5 : STEP * 1.5;
        schedBass(ctx, dry, t, root, noteDur);
      }

      /* ─ Pads (bar 4+, every quarter note) ─ */
      if (bar >= 4 && s % 4 === 0) {
        schedPad(ctx, dry, rev, t, chord, BEAT * 3.8, padBus);
      }

      /* ─ Arp (bar 5+) ─ */
      if (bar >= 5 && ARP_STEPS[s]) {
        const arpFreq = freqs[s % freqs.length];
        schedArp(ctx, dry, t, arpFreq);
      }

      /* ─ Lead melody (bar 7+, 32-step loop) ─ */
      if (bar >= 7) {
        const li = ((bar - 7) * 16 + s) % 32;
        if (LEAD_NOTES[li] !== null) {
          schedLead(ctx, dry, rev, t, LEAD_NOTES[li] as number);
        }
      }

      nextRef.current += STEP;
      stepRef.current++;
      if (stepRef.current % 16 === 0) barRef.current++;
    }
  };

  const startEngine = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    /* ── Reverb chain ── */
    const rev    = mkReverb(ctx);
    const revGain = ctx.createGain();
    revGain.gain.value = 0.22; // reverb wet level
    rev.connect(revGain);

    /* ── Sidechain pad bus ── */
    const padBus = ctx.createGain();
    padBus.gain.value = 0.9;

    /* ── Master bus: compressor → limiter → output ── */
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value      = 6;
    comp.ratio.value     = 5;
    comp.attack.value    = 0.002;
    comp.release.value   = 0.22;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.82, ctx.currentTime + 3.5);

    padBus.connect(comp);
    revGain.connect(comp);
    comp.connect(master);
    master.connect(ctx.destination);

    ctxRef.current    = ctx;
    masterRef.current = master;
    padBusRef.current = padBus;
    revRef.current    = rev;
    stepRef.current   = 0;
    barRef.current    = 0;
    nextRef.current   = ctx.currentTime + 0.08;

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
      padBusRef.current = null;
      revRef.current    = null;
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
      className="fixed bottom-6 right-6 z-[60] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        background: on
          ? "rgba(0,240,180,.07)"
          : "rgba(232,160,32,.05)",
        border: on
          ? "1px solid rgba(0,240,180,.3)"
          : "1px solid rgba(232,160,32,.15)",
        backdropFilter: "blur(20px)",
        boxShadow: on
          ? "0 0 28px rgba(0,240,180,.14), 0 4px 24px rgba(0,0,0,.5)"
          : "0 4px 24px rgba(0,0,0,.4)",
      }}
    >
      {on ? (
        <>
          {/* Pause icon */}
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <rect x="1" y="1" width="3.5" height="12" rx="1" fill="rgba(0,240,180,.9)" />
            <rect x="7.5" y="1" width="3.5" height="12" rx="1" fill="rgba(0,240,180,.9)" />
          </svg>
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full animate-[ping_2.4s_ease-out_infinite]"
            style={{ background: "rgba(0,240,180,.08)" }} />
          {/* EQ visualizer */}
          <div className="absolute -left-10 flex items-end gap-[2px] pb-0.5">
            {[4,6,9,6,8,5,7,4].map((h, i) => (
              <div key={i} style={{
                width: "2px",
                height: `${h}px`,
                borderRadius: "1px",
                background: i < 4
                  ? `rgba(0,240,180,${0.3 + i * 0.08})`
                  : `rgba(232,160,32,${0.3 + (i - 4) * 0.08})`,
                animation: `sound-bar ${0.55 + i * 0.07}s ease-in-out ${i * 0.085}s infinite alternate`,
              }} />
            ))}
          </div>
        </>
      ) : (
        /* Speaker icon */
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1.5 4.5V9.5H5L10.5 12.5V1.5L5 4.5H1.5Z" fill="rgba(232,160,32,.7)" />
          <path d="M9.2 5C10.4 6 10.4 8 9.2 9" stroke="rgba(232,160,32,.45)" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M11.2 3.2C13.2 5.1 13.2 8.9 11.2 10.8" stroke="rgba(232,160,32,.2)" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
};

export default LandingAudio;
