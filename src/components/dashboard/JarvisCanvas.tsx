import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * JarvisCanvas — full-screen holographic cockpit backdrop.
 * Pointer-events disabled. position:fixed z-0. Adapts to mobile (lower density).
 */
const STREAM_LABELS = ["TDEE","PCA","ROM","FMS","MCE","IGF-1","GH","RPE","mTOR","KAA","GUT","ATP","VO2","APEX","XP"];

export default function JarvisCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = window.innerWidth;
    let h = window.innerHeight;

    const setSize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();
    window.addEventListener("resize", setSize);

    // Cursor / touch
    const cursor = { x: w / 2, y: h / 2, active: false };
    const onMove = (e: MouseEvent) => { cursor.x = e.clientX; cursor.y = e.clientY; cursor.active = true; };
    const onLeave = () => { cursor.active = false; };
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) { cursor.x = e.touches[0].clientX; cursor.y = e.touches[0].clientY; cursor.active = true; }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onLeave);

    // Hex grid pre-compute
    const hexSize = 28;
    const hexH = Math.sqrt(3) * hexSize;
    type Hex = { cx: number; cy: number; phase: number };
    const hexes: Hex[] = [];
    for (let y = 0, row = 0; y < h + hexH; y += hexH * 0.75, row++) {
      const offset = row % 2 === 0 ? 0 : hexSize * 1.5;
      for (let x = -hexSize * 3; x < w + hexSize * 3; x += hexSize * 3) {
        hexes.push({ cx: x + offset, cy: y, phase: Math.random() * Math.PI * 2 });
      }
    }

    // Particles
    const particleCount = isMobile ? 35 : 100;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.2,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      cyan: Math.random() > 0.75,
      a: 0.05 + Math.random() * 0.15,
    }));

    // Data streams (desktop only)
    const streams = !isMobile ? Array.from({ length: 15 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      v: 0.4 + Math.random() * 0.8,
      label: STREAM_LABELS[i % STREAM_LABELS.length],
      cyan: Math.random() > 0.55,
      a: 0.04 + Math.random() * 0.04,
    })) : [];

    // Orbital rings
    const rings = !isMobile
      ? [
          { r: 80,  spd: 0.007,  dash: [2, 5],  cyan: false, op: 0.20, rot: 0, dots: 6 },
          { r: 130, spd: -0.004, dash: [3, 9],  cyan: true,  op: 0.14, rot: 0, dots: 4 },
          { r: 185, spd: 0.002,  dash: [1, 13], cyan: false, op: 0.08, rot: 0, dots: 8 },
        ]
      : [
          { r: 110, spd: 0.003, dash: [2, 6], cyan: false, op: 0.08, rot: 0, dots: 0 },
        ];

    let radar = 0;
    let t = 0;
    let raf = 0;

    const drawHex = (cx: number, cy: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i;
        const x = cx + hexSize * Math.cos(ang);
        const y = cy + hexSize * Math.sin(ang);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    };

    const render = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Central radial glow
      const cx = w / 2, cy = h / 2;
      const pulse = 0.08 + 0.03 * Math.sin(t * 1.2);
      let cursorBoost = 0;
      if (cursor.active) {
        const dx = cursor.x - cx, dy = cursor.y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        cursorBoost = Math.max(0, 0.04 - d / 12000);
      }
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.55);
      grad.addColorStop(0, `rgba(184,146,42,${pulse + cursorBoost})`);
      grad.addColorStop(0.5, `rgba(0,212,255,${(pulse + cursorBoost) * 0.4})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Hex grid
      ctx.lineWidth = 1;
      for (const hex of hexes) {
        const baseOp = 0.012 + 0.006 * Math.sin(t * 0.6 + hex.phase);
        let op = baseOp;
        if (cursor.active) {
          const dx = cursor.x - hex.cx, dy = cursor.y - hex.cy;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) op = baseOp + (1 - d / 100) * 0.05;
        }
        ctx.strokeStyle = `rgba(184,146,42,${op})`;
        drawHex(hex.cx, hex.cy);
      }

      // Data streams (desktop)
      if (streams.length) {
        ctx.font = "7px 'Space Mono', monospace";
        for (const s of streams) {
          s.y += s.v;
          if (s.y > h + 20) { s.y = -20; s.x = Math.random() * w; }
          ctx.fillStyle = s.cyan ? `rgba(0,212,255,${s.a})` : `rgba(184,146,42,${s.a})`;
          ctx.fillText(s.label, s.x, s.y);
        }
      }

      // Particles + connections + cursor repel
      for (const p of particles) {
        if (cursor.active) {
          const dx = p.x - cursor.x, dy = p.y - cursor.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 6400) {
            const d = Math.sqrt(d2) || 1;
            const force = (1 - d / 80) * 0.12;
            p.vx += (dx / d) * force;
            p.vy += (dy / d) * force;
          }
        }
        // damping toward base velocity
        p.vx *= 0.96; p.vy *= 0.96;
        if (Math.abs(p.vx) < 0.3) p.vx += (Math.random() - 0.5) * 0.05;
        if (Math.abs(p.vy) < 0.3) p.vy += (Math.random() - 0.5) * 0.05;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        ctx.fillStyle = p.cyan ? `rgba(0,212,255,${p.a})` : `rgba(184,146,42,${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Connections
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 60) {
            ctx.strokeStyle = `rgba(184,146,42,${0.04 * (1 - d / 60)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // Cursor line + dot (desktop)
      if (!isMobile && cursor.active) {
        const dx = cursor.x - cx, dy = cursor.y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        const prox = Math.max(0, 1 - d / 600);
        ctx.setLineDash([2, 8]);
        ctx.strokeStyle = `rgba(0,212,255,${0.06 + 0.04 * prox})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cursor.x, cursor.y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(0,212,255,0.4)";
        ctx.beginPath(); ctx.arc(cursor.x, cursor.y, 2, 0, Math.PI * 2); ctx.fill();
      }

      // Orbital rings
      for (const ring of rings) {
        ring.rot += ring.spd;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ring.rot);
        ctx.setLineDash(ring.dash);
        ctx.strokeStyle = ring.cyan ? `rgba(0,212,255,${ring.op})` : `rgba(184,146,42,${ring.op})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0, ring.r, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        // orbiting dots
        for (let i = 0; i < ring.dots; i++) {
          const a = (Math.PI * 2 * i) / ring.dots;
          const x = Math.cos(a) * ring.r;
          const y = Math.sin(a) * ring.r;
          ctx.fillStyle = ring.cyan ? `rgba(0,212,255,${ring.op * 1.6})` : `rgba(184,146,42,${ring.op * 1.6})`;
          ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }

      if (!isMobile) {
        // Inner spherical ellipses
        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = "rgba(184,146,42,0.06)";
        for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.rotate((Math.PI / 3) * i + t * 0.05);
          ctx.beginPath();
          ctx.ellipse(0, 0, 60, 20, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();

        // Radar sweep
        radar += 0.012;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(radar);
        const radarGrad = ctx.createLinearGradient(0, 0, 200, 0);
        radarGrad.addColorStop(0, "rgba(0,212,255,0.18)");
        radarGrad.addColorStop(1, "rgba(0,212,255,0)");
        ctx.fillStyle = radarGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 200, -0.25, 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Central nucleus
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
      for (let i = 1; i <= 3; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.05 / i})`;
        ctx.beginPath(); ctx.arc(cx, cy, 3 + i * 4 + Math.sin(t * 2) * 0.5, 0, Math.PI * 2); ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    if (!prefersReduced) {
      render();
    } else {
      // Single static frame
      render();
      cancelAnimationFrame(raf);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
    />
  );
}
