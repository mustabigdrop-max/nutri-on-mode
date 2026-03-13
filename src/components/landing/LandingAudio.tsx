import { useState, useRef, useEffect } from "react";

const LandingAudio = () => {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const createAmbient = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Master output with slow fade-in
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.38, ctx.currentTime + 3.5);
    master.connect(ctx.destination);

    // ─── Build layers with ONLY oscillators + gain nodes (no convolver) ───

    // Helper: create a sustained oscillator connected to master
    const addOsc = (freq: number, vol: number): GainNode => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g);
      g.connect(master);
      o.start();
      return g;
    };

    // Helper: LFO → AudioParam (volume tremolo / vibrato)
    const addLFO = (param: AudioParam, rate: number, depth: number) => {
      const l = ctx.createOscillator();
      const lg = ctx.createGain();
      l.type = "sine";
      l.frequency.value = rate;
      lg.gain.value = depth;
      l.connect(lg);
      lg.connect(param);
      l.start();
    };

    // Layer 1 — 41 Hz deep sub drone (felt more than heard)
    const g1 = addOsc(41, 0.45);
    addLFO(g1.gain, 0.08, 0.1);   // very slow breath tremolo

    // Layer 2 — 82 Hz (octave) slight boost
    const g2 = addOsc(82, 0.12);
    addLFO(g2.gain, 0.12, 0.04);

    // Layer 3 — 123 Hz perfect fifth — adds warmth
    const g3 = addOsc(123, 0.07);
    addLFO(g3.gain, 0.19, 0.025);

    // Layer 4 — 164 Hz second octave
    const g4 = addOsc(164, 0.04);
    addLFO(g4.gain, 0.27, 0.012);

    // Layer 5 — 328 Hz upper shimmer (barely audible, adds air)
    const g5 = addOsc(328, 0.012);
    addLFO(g5.gain, 0.22, 0.004);

    // Micro detune on layer 1 for organic beating effect
    const g1b = addOsc(41.3, 0.08); // slightly detuned twin
    addLFO(g1b.gain, 0.06, 0.03);

    ctxRef.current = ctx;
    masterRef.current = master;
  };

  const stopAmbient = () => {
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
    }, 2100);
  };

  const toggle = () => {
    if (on) {
      stopAmbient();
      setOn(false);
    } else {
      createAmbient();
      setOn(true);
    }
  };

  useEffect(() => () => stopAmbient(), []);

  return (
    <button
      onClick={toggle}
      title={on ? "Silenciar" : "Ativar som ambiente"}
      className="fixed bottom-6 right-6 z-[60] w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        background: on ? "rgba(0,240,180,.07)" : "rgba(232,160,32,.05)",
        border: on ? "1px solid rgba(0,240,180,.22)" : "1px solid rgba(232,160,32,.1)",
        backdropFilter: "blur(20px)",
        boxShadow: on
          ? "0 0 24px rgba(0,240,180,.1), 0 4px 24px rgba(0,0,0,.35)"
          : "0 4px 24px rgba(0,0,0,.3)",
      }}
    >
      {on ? (
        <>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="1" y="1" width="3" height="9" rx="0.8" fill="rgba(0,240,180,.75)" />
            <rect x="7" y="1" width="3" height="9" rx="0.8" fill="rgba(0,240,180,.75)" />
          </svg>
          <span className="absolute inset-0 rounded-full opacity-15"
            style={{ background: "rgba(0,240,180,.4)", animation: "ping 2s ease-out infinite" }}
          />
          <div className="absolute -left-8 flex items-end gap-[2px] h-4">
            {[2, 4, 3, 5, 4, 3, 2].map((h, i) => (
              <div key={i} style={{
                width: "2px", height: `${h}px`,
                background: "rgba(0,240,180,.45)", borderRadius: "1px",
                animation: `sound-bar 0.7s ease-in-out ${i * 0.09}s infinite alternate`,
              }} />
            ))}
          </div>
        </>
      ) : (
        <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
          <path d="M1.5 4.5V9.5L6 9.5L11 12.5V1.5L6 4.5H1.5Z" fill="rgba(232,160,32,.65)" />
          <path d="M9 5.5C9.8 6.2 9.8 7.8 9 8.5" stroke="rgba(232,160,32,.3)" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
};

export default LandingAudio;
