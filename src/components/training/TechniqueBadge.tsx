import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getTechniqueInfo, type TechniqueKey } from "@/lib/advancedTechniques";

/**
 * Badge de técnica avançada com protocolo expandível.
 * Clique abre as instruções de execução (quantas reduções, descanso, quando parar).
 */
export default function TechniqueBadge({ technique }: { technique?: TechniqueKey | null }) {
  const [open, setOpen] = useState(false);
  const info = getTechniqueInfo(technique);
  if (!info) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="text-[7px] px-1.5 py-0.5 rounded font-black tracking-wide"
        style={{ background: info.bg, color: info.color, border: `1px solid ${info.color}33` }}
        title="Ver protocolo da técnica"
      >
        {info.label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="basis-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-1.5 rounded-lg p-2.5 text-left" style={{ background: "rgba(255,255,255,0.03)", borderLeft: `3px solid ${info.color}` }}>
              <p className="text-[9px] font-black tracking-widest" style={{ color: info.color }}>{info.label}</p>
              <p className="text-[10px] mt-1" style={{ color: "#c9c9c9" }}>{info.resumo}</p>
              <ol className="mt-1.5 space-y-0.5">
                {info.passos.map((p, i) => (
                  <li key={i} className="text-[10px]" style={{ color: "#9a9a9a" }}>
                    {i + 1}. {p}
                  </li>
                ))}
              </ol>
              <p className="text-[9px] mt-1.5" style={{ color: "#EF9F27" }}>Quando parar: {info.parar}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
