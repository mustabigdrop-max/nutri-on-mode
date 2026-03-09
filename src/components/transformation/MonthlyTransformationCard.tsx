import { motion } from "framer-motion";
import { X, Download, Share2, Camera, Trophy, Flame, Target, TrendingDown, TrendingUp, Minus, Sparkles } from "lucide-react";
import { useRef, useCallback, useState } from "react";

interface MonthlyCardData {
  month: string; // e.g. "Março 2026"
  userName: string;
  beforePhoto?: string;
  afterPhoto?: string;
  beforeWeight?: number;
  afterWeight?: number;
  beforeDate?: string;
  afterDate?: string;
  consistencyScore: number;
  totalMealsLogged: number;
  badgesUnlocked: number;
  maxStreak: number;
  proteinDaysHit: number;
  aiMessage?: string;
}

interface MonthlyTransformationCardProps {
  data: MonthlyCardData;
  onClose: () => void;
}

const MonthlyTransformationCard = ({ data, onClose }: MonthlyTransformationCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const weightDiff = data.beforeWeight && data.afterWeight
    ? data.afterWeight - data.beforeWeight
    : null;

  const getTrendIcon = () => {
    if (!weightDiff) return <Minus className="w-3 h-3" />;
    if (weightDiff < -0.5) return <TrendingDown className="w-3 h-3 text-green-400" />;
    if (weightDiff > 0.5) return <TrendingUp className="w-3 h-3 text-orange-400" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const downloadCard = useCallback(async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement("a");
      link.download = `nutrion-transformacao-${data.month.toLowerCase().replace(" ", "-")}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (e) {
      console.error("Download error:", e);
    }
    setDownloading(false);
  }, [data.month, downloading]);

  const shareToInstagram = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "nutrion-transformacao.png", { type: "image/png" });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Minha transformação - ${data.month}`,
            text: "Confira minha evolução no nutriON! 💪 #nutriON #transformação",
          });
        } else {
          // Fallback: download
          downloadCard();
        }
      }, "image/png");
    } catch { downloadCard(); }
  }, [data.month, downloadCard]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm space-y-4 my-8"
      >
        {/* The shareable card */}
        <div
          ref={cardRef}
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(165deg, hsl(220 20% 10%) 0%, hsl(220 30% 6%) 50%, hsl(var(--primary) / 0.15) 100%)",
          }}
        >
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} 
          />

          {/* Header */}
          <div className="relative px-5 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-primary font-black text-sm tracking-tight">nutri</span>
                    <span className="text-foreground font-black text-sm tracking-tight">ON</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">Transformação</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-foreground">{data.month}</p>
                <p className="text-[9px] text-muted-foreground">{data.userName}</p>
              </div>
            </div>
          </div>

          {/* Photos section */}
          {(data.beforePhoto || data.afterPhoto) ? (
            <div className="px-4 pb-3">
              <div className="grid grid-cols-2 gap-2">
                {/* Before */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border/50">
                  {data.beforePhoto ? (
                    <img src={data.beforePhoto} alt="Antes" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-3 pt-8">
                    <p className="text-[10px] font-bold text-muted-foreground mb-0.5">ANTES</p>
                    {data.beforeDate && <p className="text-[9px] font-mono text-foreground/70">{data.beforeDate}</p>}
                    {data.beforeWeight && (
                      <p className="text-sm font-black text-foreground">{data.beforeWeight}kg</p>
                    )}
                  </div>
                </div>

                {/* After */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-primary/30">
                  {data.afterPhoto ? (
                    <img src={data.afterPhoto} alt="Depois" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Camera className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent p-3 pt-8">
                    <p className="text-[10px] font-bold text-primary-foreground/80 mb-0.5">DEPOIS</p>
                    {data.afterDate && <p className="text-[9px] font-mono text-primary-foreground/70">{data.afterDate}</p>}
                    {data.afterWeight && (
                      <p className="text-sm font-black text-primary-foreground">{data.afterWeight}kg</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Weight change highlight */}
          {weightDiff !== null && (
            <div className="px-4 pb-3">
              <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-4 flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {getTrendIcon()}
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-foreground">
                    {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)}kg
                  </p>
                  <p className="text-[9px] text-muted-foreground font-mono uppercase">variação no mês</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="px-4 pb-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-card/30 backdrop-blur rounded-xl p-3 text-center border border-border/30">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                  <Target className="w-3 h-3 text-primary" />
                </div>
                <p className="text-lg font-black text-foreground">{data.consistencyScore}</p>
                <p className="text-[8px] text-muted-foreground font-mono">SCORE</p>
              </div>
              <div className="bg-card/30 backdrop-blur rounded-xl p-3 text-center border border-border/30">
                <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center mx-auto mb-1.5">
                  <Flame className="w-3 h-3 text-orange-500" />
                </div>
                <p className="text-lg font-black text-foreground">{data.maxStreak}</p>
                <p className="text-[8px] text-muted-foreground font-mono">STREAK</p>
              </div>
              <div className="bg-card/30 backdrop-blur rounded-xl p-3 text-center border border-border/30">
                <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-xs">🍽️</span>
                </div>
                <p className="text-lg font-black text-foreground">{data.totalMealsLogged}</p>
                <p className="text-[8px] text-muted-foreground font-mono">REFEIÇÕES</p>
              </div>
              <div className="bg-card/30 backdrop-blur rounded-xl p-3 text-center border border-border/30">
                <div className="w-6 h-6 rounded-lg bg-yellow-500/10 flex items-center justify-center mx-auto mb-1.5">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                </div>
                <p className="text-lg font-black text-foreground">{data.badgesUnlocked}</p>
                <p className="text-[8px] text-muted-foreground font-mono">BADGES</p>
              </div>
            </div>
          </div>

          {/* Protein days */}
          {data.proteinDaysHit > 0 && (
            <div className="px-4 pb-3">
              <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Dias com meta de proteína batida</span>
                <span className="text-sm font-black text-primary">{data.proteinDaysHit} dias 💪</span>
              </div>
            </div>
          )}

          {/* AI Message */}
          {data.aiMessage && (
            <div className="px-4 pb-4">
              <div className="bg-card/40 backdrop-blur border border-border/30 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Mensagem da IA</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed italic">
                  "{data.aiMessage}"
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-center gap-2 text-[9px] text-muted-foreground/50">
              <span>@nutrion_app</span>
              <span>•</span>
              <span>#nutriON</span>
              <span>•</span>
              <span>#transformação</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={downloadCard}
            disabled={downloading}
            className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Salvando..." : "Salvar Imagem"}
          </button>
          <button
            onClick={shareToInstagram}
            className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose} 
            className="px-4 py-3.5 rounded-xl bg-card border border-border text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground/50 text-center">
          Toque no botão compartilhar para postar no Instagram
        </p>
      </motion.div>
    </motion.div>
  );
};

export default MonthlyTransformationCard;
