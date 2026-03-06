import { motion } from "framer-motion";
import { X, Download } from "lucide-react";
import { useRef, useCallback } from "react";
import type { ProgressPhoto } from "@/hooks/useProgressPhotos";

interface TransformationShareCardProps {
  before: ProgressPhoto;
  after: ProgressPhoto;
  onClose: () => void;
  userName: string;
  streakDays: number;
}

const TransformationShareCard = ({ before, after, onClose, userName, streakDays }: TransformationShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `nutrion-transformation-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch { /* fallback */ }
  }, []);

  const weightDiff = before.weight_kg && after.weight_kg
    ? (after.weight_kg - before.weight_kg).toFixed(1)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm space-y-4"
      >
        <div
          ref={cardRef}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)",
            border: "1px solid hsl(var(--border))",
          }}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-primary font-black text-sm tracking-tighter">nutri</span>
              <span className="text-foreground font-black text-sm tracking-tighter">ON</span>
            </div>
            <span className="text-[9px] text-primary font-mono">TRANSFORMAÇÃO</span>
          </div>

          {/* Photos side by side */}
          <div className="grid grid-cols-2 gap-1 px-2">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
              <img src={before.signedUrl} alt="Antes" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 p-2">
                <p className="text-[9px] font-bold text-muted-foreground">ANTES</p>
                <p className="text-[10px] font-mono text-foreground">{before.photo_date}</p>
                {before.weight_kg && <p className="text-[10px] font-mono text-foreground">{before.weight_kg}kg</p>}
              </div>
            </div>
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
              <img src={after.signedUrl} alt="Depois" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 p-2">
                <p className="text-[9px] font-bold text-primary-foreground">DEPOIS</p>
                <p className="text-[10px] font-mono text-primary-foreground">{after.photo_date}</p>
                {after.weight_kg && <p className="text-[10px] font-mono text-primary-foreground">{after.weight_kg}kg</p>}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 py-3 flex items-center justify-around">
            {weightDiff && (
              <div className="text-center">
                <p className="text-lg font-black text-primary">{Number(weightDiff) > 0 ? "+" : ""}{weightDiff}kg</p>
                <p className="text-[9px] text-muted-foreground font-mono">VARIAÇÃO</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-lg font-black text-foreground">{streakDays}🔥</p>
              <p className="text-[9px] text-muted-foreground font-mono">STREAK</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 pb-3 text-center border-t border-border pt-2">
            <p className="text-[10px] text-muted-foreground">{userName}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={downloadCard}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Salvar Imagem
          </button>
          <button onClick={onClose} className="px-4 py-3 rounded-xl bg-card border border-border text-muted-foreground text-xs">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TransformationShareCard;
