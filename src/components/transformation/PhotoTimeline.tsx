import { motion } from "framer-motion";
import type { ProgressPhoto } from "@/hooks/useProgressPhotos";
import { Trash2 } from "lucide-react";

interface PhotoTimelineProps {
  photos: ProgressPhoto[];
  onSelect: (photo: ProgressPhoto) => void;
  onDelete: (photo: ProgressPhoto) => void;
  selectedIds: string[];
}

const PhotoTimeline = ({ photos, onSelect, onDelete, selectedIds }: PhotoTimelineProps) => {
  // Group by month
  const grouped: Record<string, ProgressPhoto[]> = {};
  for (const p of photos) {
    const month = p.photo_date.slice(0, 7); // YYYY-MM
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(p);
  }

  const monthNames: Record<string, string> = {
    "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
    "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
    "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro",
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([month, monthPhotos]) => {
        const [year, m] = month.split("-");
        return (
          <div key={month}>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {monthNames[m] || m} {year}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {monthPhotos.map((photo, i) => {
                const isSelected = selectedIds.includes(photo.id);
                return (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="relative group"
                  >
                    <button
                      onClick={() => onSelect(photo)}
                      className={`w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected ? "border-primary shadow-[0_0_12px_-4px_hsl(var(--primary)/0.4)]" : "border-border"
                      }`}
                    >
                      <img
                        src={photo.signedUrl}
                        alt={photo.photo_date}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-2">
                        <p className="text-[9px] font-mono text-foreground">{photo.photo_date.slice(5)}</p>
                        {photo.weight_kg && (
                          <p className="text-[9px] font-mono text-primary">{photo.weight_kg}kg</p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[9px] text-primary-foreground font-bold">
                            {selectedIds.indexOf(photo.id) + 1}
                          </span>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(photo); }}
                      className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-2.5 h-2.5 text-destructive-foreground" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PhotoTimeline;
