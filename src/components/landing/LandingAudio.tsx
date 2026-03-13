import { useState, useRef, useEffect } from "react";

/**
 * Ambient drone — pure Web Audio API, no external files.
 *
 * Architecture: two detuned oscillators only (40Hz + 40.5Hz).
 * Each has its own gain node starting at 0 and ramping up with
 * staggered delays so there's ZERO transient attack / bell sound.
 * A very slow LFO (0.07 Hz) creates an organic "breathing" pulse.
 * No convolver, no filters, no high frequencies.
 *
 * On laptop/phone speakers (which can't reproduce 40Hz):
 * the 80Hz 2nd harmonic from the intermodulation of two close
 * frequencies provides the audible low drone.
 */
const LandingAudio = () => {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const start = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    // Master — stays at fixed volume, individual gains handle fade-in
    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    const addLayer = (freq: number, targetVol: number, delay: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      // Each gain starts at absolute 0 → ramps to target over 4s after delay
      g.gain.setValueAtTime(0, now + delay);
      g.gain.linearRampToValueAtTime(targetVol, now + delay + 4);
      o.connect(g);
      g.connect(master);
      o.start(now);
      return g;
    };

    // Pair 1: 40Hz + 40.5Hz — creates slow 0.5Hz "beating" between them
    const ga = addLayer(40, 0.38, 0);
    const gb = addLayer(40.5, 0.10, 0.3);

    // Pair 2: 80Hz octave (audible on laptop speakers)
    const gc = addLayer(80, 0.08, 0.8);
    const gd = addLayer(80.4, 0.025, 1.1);

    // Single mid tone 120Hz — very quiet warmth
    const ge = addLayer(120, 0.018, 1.5);

    // LFO on the main drone — "breathing" pulse
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.07; // one breath every ~14 seconds
    lfoG.gain.value = 0.08;
    lfo.connect(lfoG);
    // Apply to the dominant gain node
    lfoG.connect(ga.gain);
    lfo.start(now);

    // Second LFO on octave layer — slightly different rate for organic feel
    const lfo2 = ctx.createOscillator();
    const lfo2G = ctx.createGain();
    lfo2.type = "sine";
    lfo2.frequency.value = 0.11;
    lfo2G.gain.value = 0.03;
    lfo2.connect(lfo2G);
    lfo2G.connect(gc.gain);
    lfo2.start(now);

    ctxRef.current = ctx;
    masterRef.current = master;
  };

  const stop = () => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 2.5);
    setTimeout(() => {
      ctx.close().catch(() => {});
      ctxRef.current = null;
      masterRef.current = null;
    }, 2600);
  };

  const toggle = () => {
    if (on) { stop(); setOn(false); }
    else { start(); setOn(true); }
  };

  useEffect(() => () => stop(), []);

  return (
    <button
      onClick={toggle}
      title={on ? "Silenciar" : "Ativar som ambiente"}
      aria-label={on ? "Silenciar som" : "Ativar som ambiente"}
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
          {/* Pause bars */}
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="1" y="1" width="3" height="9" rx="0.8" fill="rgba(0,240,180,.8)" />
            <rect x="7" y="1" width="3" height="9" rx="0.8" fill="rgba(0,240,180,.8)" />
          </svg>
          {/* Slow pulse ring */}
          <span className="absolute inset-0 rounded-full opacity-10 animate-[ping_2.5s_ease-out_infinite]"
            style={{ background: "rgba(0,240,180,.6)" }} />
          {/* EQ bars */}
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
        /* Speaker icon */
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
