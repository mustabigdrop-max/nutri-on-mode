import { useState, useMemo } from "react";
import { Award, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Block {
  id: string;
  name: string;
  weeksRange: string;
  weeksFrom: number;
  weeksTo: number;
  emoji: string;
  color: string;
  training: string;
  cardio: string;
  nutrition: string;
  focus: string;
}

const BLOCKS: Block[] = [
  { id: "acumulacao", name: "Bloco 1 — Acumulação", weeksRange: "agora → -24", weeksFrom: 999, weeksTo: 24, emoji: "🏗️", color: "#4ade80",
    training: "Volume máximo (MAV → MRV). Hipertrofia em todos os grupos.", cardio: "30min 2x/sem (manutenção CV).",
    nutrition: "Superávit 200-400 kcal. Proteína 2.0-2.4 g/kg.", focus: "Ganho de massa muscular máximo." },
  { id: "forca", name: "Bloco 2 — Força", weeksRange: "-24 → -16", weeksFrom: 24, weeksTo: 16, emoji: "💀", color: "#f87171",
    training: "5/3/1 nos compostos principais. Volume acessório mantido.", cardio: "30min 3x/sem (LISS).",
    nutrition: "Manutenção/leve superávit. Proteína 2.4 g/kg.", focus: "Converter volume em densidade neural." },
  { id: "transmutacao", name: "Bloco 3 — Transmutação", weeksRange: "-16 → -8", weeksFrom: 16, weeksTo: 8, emoji: "🔄", color: "#fbbf24",
    training: "Volume reduz gradualmente. Intensidade aumenta. Híbrido.", cardio: "40min 4x/sem (LISS+HIIT).",
    nutrition: "Déficit moderado 300-500 kcal. Proteína 2.6-2.8 g/kg.", focus: "Manter massa, iniciar definição." },
  { id: "realizacao", name: "Bloco 4 — Realização", weeksRange: "-8 → -1", weeksFrom: 8, weeksTo: 1, emoji: "🎭", color: "#60a5fa",
    training: "Volume baixo, intensidade alta, pump training. Posing diário.", cardio: "45-60min 5-6x/sem.",
    nutrition: "Déficit agressivo 500-700 kcal. Proteína 3.0 g/kg.", focus: "Expressar o físico (definição máxima)." },
  { id: "peakweek", name: "Bloco 5 — Peak Week", weeksRange: "-1 → 0", weeksFrom: 1, weeksTo: 0, emoji: "👑", color: "#c084fc",
    training: "Pump específico. Posing intensivo 2-3x/dia.", cardio: "Reduz progressivamente.",
    nutrition: "Depleção CHO (3 dias) → carregamento (2-3 dias). Manipulação de água/sódio.", focus: "Pico estético no dia D." },
];

export default function CompetitionModeBlocks() {
  const [competitionDate, setCompetitionDate] = useState<string>("");

  const weeksUntil = useMemo(() => {
    if (!competitionDate) return null;
    const diff = new Date(competitionDate).getTime() - Date.now();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24 * 7)));
  }, [competitionDate]);

  const currentBlockIdx = useMemo(() => {
    if (weeksUntil === null) return -1;
    return BLOCKS.findIndex((b) => weeksUntil <= b.weeksFrom && weeksUntil > b.weeksTo) ;
  }, [weeksUntil]);

  return (
    <div className="space-y-4 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Competition Mode (Periodização Off-Season)</h3>
      </div>

      <div>
        <label className="text-[10px] font-bold text-muted-foreground uppercase">Data da competição</label>
        <Input type="date" value={competitionDate} onChange={(e) => setCompetitionDate(e.target.value)} className="mt-1 h-9 text-sm" />
        {weeksUntil !== null && (
          <p className="mt-1 text-xs text-primary font-bold">
            <Calendar className="inline w-3 h-3 mr-1" />
            Faltam {weeksUntil} semanas
          </p>
        )}
      </div>

      <div className="space-y-2">
        {BLOCKS.map((b, i) => {
          const isCurrent = i === currentBlockIdx;
          return (
            <div
              key={b.id}
              className={`p-3 rounded-lg border-l-4 transition ${isCurrent ? "ring-2 ring-primary/40" : ""}`}
              style={{ borderLeftColor: b.color, background: isCurrent ? b.color + "15" : "hsl(var(--muted) / 0.2)" }}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-black" style={{ color: b.color }}>
                  {b.emoji} {b.name}
                </p>
                <span className="text-[10px] text-muted-foreground">Sem {b.weeksRange}</span>
              </div>
              {isCurrent && <span className="text-[9px] px-2 py-0.5 rounded bg-primary text-primary-foreground font-bold mb-2 inline-block">VOCÊ ESTÁ AQUI</span>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <div className="p-2 rounded-md bg-background/60">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground">Treino</p>
                  <p className="text-[11px] text-foreground">{b.training}</p>
                </div>
                <div className="p-2 rounded-md bg-background/60">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground">Cardio</p>
                  <p className="text-[11px] text-foreground">{b.cardio}</p>
                </div>
                <div className="p-2 rounded-md bg-background/60">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground">Nutrição</p>
                  <p className="text-[11px] text-foreground">{b.nutrition}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic">Foco: {b.focus}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
