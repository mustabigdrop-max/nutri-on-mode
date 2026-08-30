// Modo Ensaio — fullscreen, 1 slide por vez, teleprompter com a fala do
// palestrante embaixo e dois cronômetros (o do slide e o da palestra inteira).
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ACCENT, ACCENT2 } from "./socialUi";
import { LectureKit, TYPE_COLOR, TYPE_LABEL, totalMinutes } from "@/lib/lectureKit";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const LectureRehearsal = ({ kit, target, onClose }: { kit: LectureKit; target: number; onClose: () => void }) => {
  const [i, setI] = useState(0);
  const [slideSec, setSlideSec] = useState(0);
  const [totalSec, setTotalSec] = useState(0);
  const slides = kit.slides;
  const slide = slides[i];
  const estimated = useMemo(() => totalMinutes(slides), [slides]);

  useEffect(() => {
    const t = setInterval(() => {
      setSlideSec((s) => s + 1);
      setTotalSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { setSlideSec(0); }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") setI((v) => Math.min(v + 1, slides.length - 1));
      if (e.key === "ArrowLeft") setI((v) => Math.max(v - 1, 0));
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length, onClose]);

  if (!slide) return null;
  const color = TYPE_COLOR[slide.tipo];
  const overSlide = slideSec > slide.tempoMin * 60;
  const overTotal = totalSec > target * 60;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#050508" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: `${ACCENT}22` }}>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span style={{ color }}>{String(i + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")} · {TYPE_LABEL[slide.tipo]}</span>
          <span style={{ color: overSlide ? "#EF4444" : "rgba(255,255,255,0.6)" }}>
            slide {fmt(slideSec)} / {slide.tempoMin}:00
          </span>
          <span style={{ color: overTotal ? "#F59E0B" : ACCENT2 }}>
            total {fmt(totalSec)} / {target}:00 (estimado {estimated} min)
          </span>
        </div>
        <button onClick={onClose} aria-label="Sair do ensaio" className="text-white/60 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto px-6 md:px-16 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="pl-5 border-l-4" style={{ borderColor: color }}>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">{slide.titulo}</h2>
          </div>
          <ul className="space-y-3">
            {slide.bullets.map((b, bi) => (
              <li key={bi} className="text-lg md:text-2xl text-white/85">• {b}</li>
            ))}
          </ul>
          {slide.referencia && <p className="text-sm" style={{ color: ACCENT2 }}>🔬 {slide.referencia}</p>}
        </div>
      </div>

      <div className="border-t px-6 md:px-16 py-5 max-h-[38vh] overflow-auto" style={{ borderColor: `${ACCENT}22`, background: "rgba(255,255,255,0.03)" }}>
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Teleprompter</p>
        <p className="text-base md:text-xl italic text-white/80 whitespace-pre-wrap max-w-4xl mx-auto">{slide.fala}</p>
      </div>

      <div className="flex items-center justify-between px-6 py-3">
        <button onClick={() => setI((v) => Math.max(v - 1, 0))} disabled={i === 0} className="px-4 py-2 rounded-lg flex items-center gap-1 text-sm text-white/80 disabled:opacity-30" style={{ border: `1px solid ${ACCENT}33` }}>
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        {overSlide && <span className="text-xs" style={{ color: "#EF4444" }}>Tempo do slide excedido</span>}
        <button onClick={() => setI((v) => Math.min(v + 1, slides.length - 1))} disabled={i === slides.length - 1} className="px-4 py-2 rounded-lg flex items-center gap-1 text-sm font-semibold disabled:opacity-30" style={{ background: ACCENT, color: "#020205" }}>
          Avançar <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LectureRehearsal;
