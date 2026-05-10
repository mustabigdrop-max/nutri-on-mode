import { motion } from "framer-motion";
import { Zap, Dumbbell, Sparkles } from "lucide-react";

interface Glut4SyncCardProps {
  workoutTime?: string | null; // "HH:MM"
  workoutType?: string;
  durationMin?: number;
  compostosAtivos?: string[];
}

// Compound-aware peri-workout strategy hints
function buildCompoundHints(compostos: string[]): { phase: "pre" | "intra" | "post"; text: string }[] {
  const hints: { phase: "pre" | "intra" | "post"; text: string }[] = [];
  const has = (re: RegExp) => compostos.some((c) => re.test(c));

  if (has(/GLP-?1|Sema|Tirzepa|Reta/i)) {
    hints.push({ phase: "pre", text: "GLP-1 ativo: pré-treino menor (½ porção CHO) p/ evitar náusea." });
    hints.push({ phase: "post", text: "Pós: priorize líquidos + whey p/ saciedade reduzida." });
  }
  if (has(/SLU-?PP-?332/i)) {
    hints.push({ phase: "pre", text: "SLU-PP-332: CHO baixo IG (aveia/batata-doce) 60–90min antes." });
  }
  if (has(/Cardarine|GW-?501516/i)) {
    hints.push({ phase: "intra", text: "Cardarine: tolerância a jejum intra; foco oxidação lipídica." });
  }
  if (has(/Test|Nandro|Oxa|Tren|Mast|AAS/i)) {
    hints.push({ phase: "intra", text: "AAS: +5g leucina intra-treino p/ saturar mTORC1." });
    hints.push({ phase: "post", text: "Janela 0–30min: 0,4g/kg whey + 1g/kg CHO alto IG." });
  }
  if (has(/BPC-?157|TB-?500/i)) {
    hints.push({ phase: "post", text: "BPC/TB-500: +10g glicina + 5g glutamina p/ reparo conjuntivo." });
  }
  if (has(/Ipamorelin|CJC|MK-?677|GH/i)) {
    hints.push({ phase: "post", text: "GH-secretagogo: evite CHO alto 2h pré-bedtime (suprime pico)." });
  }
  return hints;
}

function shiftTime(hhmm: string, deltaMin: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + deltaMin;
  const hh = Math.floor((total + 1440) % 1440 / 60);
  const mm = ((total + 1440) % 60 + 60) % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export default function Glut4SyncCard({
  workoutTime,
  workoutType,
  durationMin = 60,
  compostosAtivos = [],
}: Glut4SyncCardProps) {
  if (!workoutTime) return null;

  const hints = buildCompoundHints(compostosAtivos);
  const intraNeeded = (durationMin || 60) > 60;

  const phases = [
    {
      key: "pre" as const,
      label: "Pré-treino",
      window: `${shiftTime(workoutTime, -90)} → ${shiftTime(workoutTime, -60)}`,
      base: "0,3g/kg CHO baixo IG + 25–30g whey isolado.",
      mechanism: "Disponibiliza glicogênio + leucina pico (mTORC1).",
    },
    {
      key: "intra" as const,
      label: "Intra-treino",
      window: intraNeeded ? `${workoutTime} → ${shiftTime(workoutTime, durationMin)}` : "—",
      base: intraNeeded
        ? "30–60g CHO alto IG (maltodextrina/ciclodextrina) + 5g EAAs."
        : "Não necessário (<60min).",
      mechanism: intraNeeded ? "Mantém glicemia + reduz catabolismo." : "",
    },
    {
      key: "post" as const,
      label: "Pós-treino (0–30min)",
      window: `${shiftTime(workoutTime, durationMin)} → ${shiftTime(workoutTime, durationMin + 30)}`,
      base: "0,4g/kg whey + 1,0g/kg CHO alto IG (banana, arroz branco, dextrose).",
      mechanism: "Janela GLUT-4 sensível: ressíntese de glicogênio + síntese proteica.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl mb-3 border border-primary/40"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--primary) / 0.18) 0%, hsl(var(--background)) 60%, hsl(var(--primary) / 0.10) 100%)",
        boxShadow: "0 0 24px -8px hsl(var(--primary) / 0.45)",
      }}
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 20% 20%, hsl(var(--primary)) 1px, transparent 1px)", backgroundSize: "12px 12px" }}
      />

      <div className="relative p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-primary tracking-wide">GLUT-4 SYNC · Peri-workout</h3>
            <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Dumbbell className="w-3 h-3" />
              {workoutType || "Treino"} · {workoutTime} · {durationMin}min
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {phases.map((p) => (
            <div
              key={p.key}
              className="rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary/80">{p.label}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{p.window}</span>
              </div>
              <p className="text-xs text-foreground leading-snug mb-1">{p.base}</p>
              {p.mechanism && (
                <p className="text-[10px] text-muted-foreground italic leading-snug">{p.mechanism}</p>
              )}
              {hints.filter((h) => h.phase === p.key).map((h, i) => (
                <div key={i} className="mt-2 flex gap-1.5 items-start rounded-md bg-primary/10 px-2 py-1">
                  <Sparkles className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] text-primary/90 leading-snug">{h.text}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
