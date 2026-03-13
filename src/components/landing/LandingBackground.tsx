import { useEffect, useRef } from "react";

const LandingBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let animId: number;
    let t = 0;

    // Mouse position for reactive particles
    const mouse = { x: -9999, y: -9999 };
    const handleMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouse);

    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Bioluminescent cell particles
    const cells = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.018 + Math.random() * 0.028,
      colorIdx: Math.floor(Math.random() * 3),
    }));

    const COLORS: [number, number, number][] = [
      [232, 160, 32],   // gold
      [0, 240, 180],    // cyan
      [120, 140, 255],  // blue-violet
    ];

    // DNA Helix strands — multiple across screen
    const numHelices = Math.max(2, Math.floor(W / 480));
    const helices = Array.from({ length: numHelices }, (_, i) => ({
      x: (W / (numHelices + 1)) * (i + 1),
      phase: (Math.PI * 2 * i) / numHelices + Math.random() * 0.5,
      amplitude: 30 + Math.random() * 25,
      speed: 0.003 + Math.random() * 0.004,
      colorA: i % 2 === 0 ? ([232, 160, 32] as [number, number, number]) : ([0, 240, 180] as [number, number, number]),
      colorB: i % 2 === 0 ? ([0, 240, 180] as [number, number, number]) : ([120, 140, 255] as [number, number, number]),
    }));

    // Molecular ring fragments
    const rings = Array.from({ length: 6 }, () => ({
      cx: Math.random() * W,
      cy: Math.random() * H,
      r: 40 + Math.random() * 80,
      phase: Math.random() * Math.PI * 2,
      speed: (Math.random() - 0.5) * 0.008,
      alpha: 0.015 + Math.random() * 0.025,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      t++;

      // Draw molecular rings (faint, background)
      rings.forEach((ring) => {
        ring.phase += ring.speed;
        ctx.beginPath();
        ctx.arc(ring.cx, ring.cy, ring.r, ring.phase, ring.phase + Math.PI * 1.4);
        ctx.strokeStyle = `rgba(232,160,32,${ring.alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ring.cx, ring.cy, ring.r * 0.6, ring.phase + Math.PI, ring.phase + Math.PI * 2.2);
        ctx.strokeStyle = `rgba(0,240,180,${ring.alpha * 0.7})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });

      // Draw DNA helices
      helices.forEach(({ x, phase, amplitude, speed, colorA, colorB }) => {
        const steps = 100;
        const stepH = H / steps;

        // Strand A
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const y = i * stepH;
          const angle = (y / H) * Math.PI * 10 + t * speed * 40 + phase;
          const px = x + Math.cos(angle) * amplitude;
          if (i === 0) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        const alphaA = 0.045 + Math.sin(t * 0.008 + phase) * 0.02;
        ctx.strokeStyle = `rgba(${colorA[0]},${colorA[1]},${colorA[2]},${alphaA})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();

        // Strand B
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const y = i * stepH;
          const angle = (y / H) * Math.PI * 10 + t * speed * 40 + phase + Math.PI;
          const px = x + Math.cos(angle) * amplitude;
          if (i === 0) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        const alphaB = 0.03 + Math.sin(t * 0.01 + phase + 1) * 0.015;
        ctx.strokeStyle = `rgba(${colorB[0]},${colorB[1]},${colorB[2]},${alphaB})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // Connecting rungs (base pairs)
        for (let i = 0; i <= steps; i += 5) {
          const y = i * stepH;
          const angle = (y / H) * Math.PI * 10 + t * speed * 40 + phase;
          const x1 = x + Math.cos(angle) * amplitude;
          const x2 = x + Math.cos(angle + Math.PI) * amplitude;
          const rungAlpha = 0.025 + Math.sin(t * 0.015 + i * 0.3) * 0.01;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = `rgba(232,160,32,${rungAlpha})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
          // Rung nodes
          ctx.beginPath();
          ctx.arc(x1, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colorA[0]},${colorA[1]},${colorA[2]},${alphaA * 1.8})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x2, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colorB[0]},${colorB[1]},${colorB[2]},${alphaB * 1.8})`;
          ctx.fill();
        }
      });

      // Draw bioluminescent cells
      cells.forEach((cell) => {
        // Mouse repulsion — particles gently flee the cursor
        const mdx = cell.x - mouse.x;
        const mdy = cell.y - mouse.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 180 && md > 0) {
          const force = (1 - md / 180) * 0.18;
          cell.vx += (mdx / md) * force;
          cell.vy += (mdy / md) * force;
        }
        // Velocity damping
        cell.vx *= 0.978;
        cell.vy *= 0.978;

        cell.x += cell.vx;
        cell.y += cell.vy;
        cell.pulse += cell.pulseSpeed;
        if (cell.x < -8) cell.x = W + 8;
        if (cell.x > W + 8) cell.x = -8;
        if (cell.y < -8) cell.y = H + 8;
        if (cell.y > H + 8) cell.y = -8;

        const [r, g, b] = COLORS[cell.colorIdx];
        const glow = 0.3 + Math.sin(cell.pulse) * 0.25;

        // Outer glow halo
        const grad = ctx.createRadialGradient(cell.x, cell.y, 0, cell.x, cell.y, cell.r * 7);
        grad.addColorStop(0, `rgba(${r},${g},${b},${glow * 0.45})`);
        grad.addColorStop(0.4, `rgba(${r},${g},${b},${glow * 0.12})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, cell.r * 7, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Cell core
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, cell.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${glow})`;
        ctx.fill();
      });

      // Draw neural connections between close cells
      for (let i = 0; i < cells.length; i++) {
        for (let j = i + 1; j < cells.length; j++) {
          const dx = cells[i].x - cells[j].x;
          const dy = cells[i].y - cells[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(cells[i].x, cells[i].y);
            ctx.lineTo(cells[j].x, cells[j].y);
            const [r, g, b] = COLORS[cells[i].colorIdx];
            ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d / 100) * 0.06})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" />

      {/* Honeycomb cellular grid */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='111'%3E%3Cpath d='M32 2 L62 18 L62 52 L32 68 L2 52 L2 18 Z' fill='none' stroke='rgba(232,160,32,.016)' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "64px 111px",
        }}
      />

      {/* Deep space nebula — gold top-right */}
      <div className="fixed pointer-events-none z-[1]" style={{
        top: "-20%", right: "-10%", width: "900px", height: "900px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,160,32,.06) 0%, rgba(100,50,200,.03) 40%, transparent 65%)",
        filter: "blur(90px)",
      }} />

      {/* Deep space nebula — cyan bottom-left */}
      <div className="fixed pointer-events-none z-[1]" style={{
        bottom: "-28%", left: "-6%", width: "850px", height: "850px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,200,150,.045) 0%, rgba(0,80,200,.025) 45%, transparent 68%)",
        filter: "blur(90px)",
      }} />

      {/* Deep space nebula — purple center */}
      <div className="fixed pointer-events-none z-[1]" style={{
        top: "35%", left: "22%", width: "700px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(80,0,200,.03) 0%, transparent 65%)",
        filter: "blur(110px)",
      }} />

      {/* Radial vignette */}
      <div className="fixed inset-0 pointer-events-none z-[1]" style={{
        background: "radial-gradient(ellipse 94% 94% at 50% 50%, transparent 16%, rgba(3,3,10,.82) 100%)",
      }} />

      {/* Film grain texture */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.14]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`,
      }} />
    </>
  );
};

export default LandingBackground;
