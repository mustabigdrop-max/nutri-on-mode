import { useState, useRef, useEffect } from "react";

/**
 * NUTRION — Ambient Tech Soundtrack
 * Web Audio API · 96 BPM · A minor · Minimal / Lo-fi electronic
 */

const BPM  = 96;
const BEAT = 60 / BPM;
const BAR  = BEAT * 4;

const PEN  = [220, 261.6, 293.7, 329.6, 392];

const PADS: Record<string, number[]> = {
  Am: [55, 82.4, 110, 164.8],
  F:  [43.7, 65.4, 130.8],
  C:  [65.4, 130.8, 196],
  G:  [49, 98, 146.8],
};
const CHORD_SEQ = ["Am","Am","F","F","C","C","G","G"];

function mkNoise(ctx: AudioContext, dur: number) {
  const n = Math.ceil(ctx.sampleRate * dur);
  const b = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

function mkReverb(ctx: AudioContext) {
  const conv = ctx.createConvolver();
  const LEN  = Math.floor(ctx.sampleRate * 2.2);
  const buf  = ctx.createBuffer(2, LEN, ctx.sampleRate);
  const PRE  = Math.floor(ctx.sampleRate * 0.025);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < LEN; i++) {
      if (i < PRE) { d[i] = 0; continue; }
      const t = (i - PRE) / (LEN - PRE);
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.5) * (ch === 0 ? 1 : 0.94 + Math.random() * 0.12);
    }
  }
  conv.buffer = buf;
  return conv;
}

function schedSubKick(ctx: AudioContext, dst: AudioNode, t: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(80, t);
  o.frequency.exponentialRampToValueAtTime(35, t + 0.35);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.55, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
  o.connect(g); g.connect(dst);
  o.start(t); o.stop(t + 0.56);
}

function schedPad(ctx: AudioContext, dst: AudioNode, rev: AudioNode, t: number, chord: string) {
  const freqs = PADS[chord];
  freqs.forEach((freq, i) => {
    [-0.004, 0.004].forEach(det => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq * (1 + det + (i % 2 === 0 ? 0.0015 : -0.0015));
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.014, t + 1.2);
      g.gain.setValueAtTime(0.014, t + BAR - 0.8);
      g.gain.linearRampToValueAtTime(0.001, t + BAR);
      o.connect(g);
      g.connect(dst);
      if (i > 0) g.connect(rev);
      o.start(t); o.stop(t + BAR + 0.1);
    });
  });
}

function schedPing(ctx: AudioContext, rev: AudioNode, t: number, freq: number) {
  const o  = ctx.createOscillator();
  const lp = ctx.createBiquadFilter();
  const g  = ctx.createGain();
  o.type = "triangle"; o.frequency.value = freq * 2;
  lp.type = "lowpass"; lp.frequency.value = 1800;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.05, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
  o.connect(lp); lp.connect(g); g.connect(rev);
  o.start(t); o.stop(t + 0.95);
}

function schedHat(ctx: AudioContext, dst: AudioNode, t: number) {
  const ns = ctx.createBufferSource();
  ns.buffer = mkNoise(ctx, 0.018);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 9000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.035, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.017);
  ns.connect(hp); hp.connect(g); g.connect(dst);
  ns.start(t); ns.stop(t + 0.02);
}

const LandingAudio = () => {
  const [on, setOn] = useState(false);
  const ctxRef    = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextRef   = useRef(0);
  const beatRef   = useRef(0);
  const barRef    = useRef(0);
  const pingRef   = useRef(0);

  const schedule = (ctx: AudioContext, dry: AudioNode, rev: AudioNode) => {
    const lookahead = 0.35;
    while (nextRef.current < ctx.currentTime + lookahead) {
      const t = nextRef.current;
      const bar = barRef.current;
      const beat = beatRef.current;
      const chord = CHORD_SEQ[bar % CHORD_SEQ.length];

      if (bar >= 2 && beat === 0) schedSubKick(ctx, dry, t);
      if (bar >= 3 && beat === 0) schedPad(ctx, dry, rev, t, chord);
      if (bar >= 4 && Math.random() > 0.55) schedHat(ctx, dry, t + BEAT * 0.5);

      if (bar >= 6 && beat === Math.floor(Math.random() * 4) && t > pingRef.current) {
        const f = PEN[Math.floor(Math.random() * PEN.length)];
        schedPing(ctx, rev, t, f);
        pingRef.current = t + BAR * 2;
      }

      nextRef.current += BEAT;
      if (beat === 3) {
        barRef.current += 1;
        beatRef.current = 0;
      } else {
        beatRef.current += 1;
      }
    }
  };

  const startEngine = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const rev  = mkReverb(ctx);
    const revG = ctx.createGain();
    revG.gain.value = 0.38;
    rev.connect(revG);

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 4;
    comp.attack.value = 0.003; comp.release.value = 0.3;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.42, ctx.currentTime + 6);

    revG.connect(comp); comp.connect(master); master.connect(ctx.destination);

    ctxRef.current = ctx; masterRef.current = master;
    nextRef.current = ctx.currentTime + 0.1;
    barRef.current = 0; pingRef.current = 0;

    timerRef.current = setInterval(() => {
      if (ctxRef.current) schedule(ctxRef.current, comp, rev);
    }, 60);
  };

  const stopEngine = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const ctx = ctxRef.current; const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 2.5);
    setTimeout(() => {
      ctx.close().catch(() => {});
      ctxRef.current = null; masterRef.current = null;
    }, 2800);
  };

  const toggle = () => { if (on) { stopEngine(); setOn(false); } else { startEngine(); setOn(true); } };

  useEffect(() => () => stopEngine(), []);

  return (
    <button
      onClick={toggle}
      title={on ? "Pausar música" : "Tocar trilha ambiente"}
      aria-label={on ? "Pausar trilha" : "Tocar trilha NUTRION"}
      className="fixed bottom-6 right-6 z-[60] w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        background: on ? "rgba(0,240,180,.06)" : "rgba(255,255,255,.03)",
        border: on ? "1px solid rgba(0,240,180,.2)" : "1px solid rgba(255,255,255,.08)",
        backdropFilter: "blur(16px)",
        boxShadow: on ? "0 0 20px rgba(0,240,180,.1)" : "0 4px 20px rgba(0,0,0,.4)",
      }}
    >
      {on ? (
        <>
          <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
            <rect x="0.5" y="0.5" width="3" height="11" rx="1" fill="rgba(0,240,180,.8)" />
            <rect x="6.5" y="0.5" width="3" height="11" rx="1" fill="rgba(0,240,180,.8)" />
          </svg>
          <span className="absolute inset-0 rounded-full animate-[ping_3s_ease-out_infinite]"
            style={{ background: "rgba(0,240,180,.05)" }} />
          <div className="absolute -left-8 flex items-end gap-[2px]">
            {[3,5,7,5,4].map((h, i) => (
              <div key={i} style={{
                width: "2px", height: `${h}px`, borderRadius: "1px",
                background: `rgba(0,240,180,${0.25 + i * 0.07})`,
                animation: `sound-bar ${0.6 + i * 0.09}s ease-in-out ${i * 0.1}s infinite alternate`,
              }} />
            ))}
          </div>
        </>
      ) : (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M1 4.5V8.5H4L9 11.5V1.5L4 4.5H1Z" fill="rgba(255,255,255,.3)" />
          <path d="M8.5 4.8C9.4 5.7 9.4 7.3 8.5 8.2" stroke="rgba(255,255,255,.2)" strokeWidth="1.1" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
};

export default LandingAudio;
