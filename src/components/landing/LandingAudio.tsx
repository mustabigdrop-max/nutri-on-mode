import { useState, useRef, useEffect } from "react";

const LandingAudio = () => {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);

  const createAmbient = async () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);
    master.connect(ctx.destination);

    // Convolution reverb (synthetic impulse response)
    const convolver = ctx.createConvolver();
    const len = ctx.sampleRate * 3.5;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
      }
    }
    convolver.buffer = ir;
    const revGain = ctx.createGain();
    revGain.gain.value = 0.35;
    convolver.connect(revGain);
    revGain.connect(master);

    // Helper: oscillator → master + reverb
    const osc = (freq: number, type: OscillatorType, vol: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g);
      g.connect(master);
      o.connect(convolver);
      o.start();
      return g;
    };

    // LFO helper
    const lfo = (target: AudioParam, rate: number, depth: number) => {
      const l = ctx.createOscillator();
      const lg = ctx.createGain();
      l.frequency.value = rate;
      lg.gain.value = depth;
      l.connect(lg);
      lg.connect(target);
      l.start();
    };

    // Layer 1: Deep sub-bass drone (41 Hz)
    const g1 = osc(41, "sine", 0.28);
    lfo(g1.gain, 0.07, 0.08); // very slow breath

    // Layer 2: Fifth harmonic (61.5 Hz)
    osc(61.5, "sine", 0.06);

    // Layer 3: Mid warmth (164 Hz)
    const g3 = osc(164, "sine", 0.035);
    lfo(g3.gain, 0.25, 0.012);

    // Layer 4: Upper mid (328 Hz)
    const g4 = osc(328, "sine", 0.012);
    lfo(g4.gain, 0.18, 0.005);

    // Layer 5: High shimmer (2196 Hz) — barely audible
    const g5 = osc(2196, "sine", 0.005);
    lfo(g5.gain, 0.13, 0.002);

    ctxRef.current = ctx;
    masterRef.current = master;
  };

  const stopAmbient = () => {
    if (!masterRef.current || !ctxRef.current) return;
    const ctx = ctxRef.current;
    const master = masterRef.current;
    const now = ctx.currentTime;
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 1.8);
    setTimeout(() => {
      ctx.close().catch(() => {});
      ctxRef.current = null;
      masterRef.current = null;
      startedRef.current = false;
    }, 1900);
  };

  const toggle = async () => {
    if (on) {
      stopAmbient();
      setOn(false);
    } else {
      await createAmbient();
      startedRef.current = true;
      setOn(true);
    }
  };

  useEffect(() => () => stopAmbient(), []);

  return (
    <button
      onClick={toggle}
      title={on ? "Silenciar som ambiente" : "Ativar experiência sonora"}
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
          {/* Pause icon */}
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="1" y="1" width="3" height="9" rx="0.8" fill="rgba(0,240,180,.75)" />
            <rect x="7" y="1" width="3" height="9" rx="0.8" fill="rgba(0,240,180,.75)" />
          </svg>
          {/* Pulse ring */}
          <span
            className="absolute inset-0 rounded-full opacity-20"
            style={{
              background: "rgba(0,240,180,.4)",
              animation: "ping 1.5s ease-out infinite",
            }}
          />
          {/* Equalizer bars */}
          <div className="absolute -left-7 flex items-end gap-[2px] h-4">
            {[2, 4, 3, 5, 4, 3, 2].map((h, i) => (
              <div
                key={i}
                style={{
                  width: "2px",
                  height: `${h}px`,
                  background: "rgba(0,240,180,.4)",
                  borderRadius: "1px",
                  animation: `sound-bar 0.7s ease-in-out ${i * 0.09}s infinite alternate`,
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <svg width="12" height="13" viewBox="0 0 12 13" fill="none">
          <path d="M1 4V9L5 9L10 12V1L5 4H1Z" fill="rgba(232,160,32,.6)" />
        </svg>
      )}
    </button>
  );
};

export default LandingAudio;
