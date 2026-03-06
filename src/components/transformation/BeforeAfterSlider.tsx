import { useState, useRef } from "react";
import { motion } from "framer-motion";
import type { ProgressPhoto } from "@/hooks/useProgressPhotos";

interface BeforeAfterSliderProps {
  before: ProgressPhoto;
  after: ProgressPhoto;
}

const BeforeAfterSlider = ({ before, after }: BeforeAfterSliderProps) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current || !dragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-border cursor-col-resize select-none"
      onMouseDown={() => { dragging.current = true; }}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
      onMouseMove={e => handleMove(e.clientX)}
      onTouchStart={() => { dragging.current = true; }}
      onTouchEnd={() => { dragging.current = false; }}
      onTouchMove={e => handleMove(e.touches[0].clientX)}
    >
      {/* After (full background) */}
      <img
        src={after.signedUrl}
        alt="Depois"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={before.signedUrl}
          alt="Antes"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${containerRef.current?.offsetWidth || 300}px` }}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
        style={{ left: `${position}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3L2 8L5 13" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" />
            <path d="M11 3L14 8L11 13" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-background/80 backdrop-blur text-[10px] font-bold text-foreground">
        ANTES · {before.photo_date}
      </div>
      <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-primary/80 backdrop-blur text-[10px] font-bold text-primary-foreground">
        DEPOIS · {after.photo_date}
      </div>

      {/* Weight badges */}
      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-background/80 backdrop-blur text-[10px] font-mono text-foreground">
        {before.weight_kg ? `${before.weight_kg}kg` : "—"}
      </div>
      <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-primary/80 backdrop-blur text-[10px] font-mono text-primary-foreground">
        {after.weight_kg ? `${after.weight_kg}kg` : "—"}
        {before.weight_kg && after.weight_kg && (
          <span className="ml-1">
            ({(after.weight_kg - before.weight_kg) > 0 ? "+" : ""}{(after.weight_kg - before.weight_kg).toFixed(1)})
          </span>
        )}
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
