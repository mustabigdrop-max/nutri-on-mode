import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Dumbbell, ChevronRight, Star, AlertTriangle, Target, RotateCcw, X, Zap, Scissors, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MUSCLE_GROUPS, type MuscleGroup, type MuscleSubgroup, type ExerciseEntry } from "@/data/exerciseDb";

type Phase = "bulking" | "cutting" | "manutencao";

const PHASE_CONFIG: Record<Phase, { label: string; emoji: string; icon: React.ReactNode; color: string }> = {
  bulking: { label: "Bulking", emoji: "🍗", icon: <Zap className="w-3.5 h-3.5" />, color: "text-green-400" },
  cutting: { label: "Cutting", emoji: "✂️", icon: <Scissors className="w-3.5 h-3.5" />, color: "text-red-400" },
  manutencao: { label: "Manutenção", emoji: "⚖️", icon: <Scale className="w-3.5 h-3.5" />, color: "text-blue-400" },
};

const VIEW_LABELS = { frente: "Frente", costas: "Costas", ambos: "Ambos" };

// ─── Exercise Detail Card ───
function ExerciseCard({ ex, phase }: { ex: ExerciseEntry; phase: Phase }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-border bg-card/80 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left p-3 flex items-center gap-3">
        <span className="text-lg">{ex.rank}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{ex.nome}</p>
          <p className="text-[10px] text-muted-foreground">{ex.series}</p>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase mb-1">Execução</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{ex.execucao}</p>
              </div>
              {ex.dicas.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-green-400 uppercase mb-1 flex items-center gap-1"><Star className="w-3 h-3" /> Dicas</p>
                  <ul className="space-y-0.5">{ex.dicas.map((d, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1"><span className="text-green-400">•</span>{d}</li>)}</ul>
                </div>
              )}
              {ex.erros.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-red-400 uppercase mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Erros Comuns</p>
                  <ul className="space-y-0.5">{ex.erros.map((e, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1"><span className="text-red-400">✗</span>{e}</li>)}</ul>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400">Bulk: {ex.fases.bulking}</Badge>
                <Badge variant="outline" className="text-[9px] border-red-500/30 text-red-400">Cut: {ex.fases.cutting}</Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── Subgroup Detail View ───
function SubgroupDetail({ sub, phase, onBack }: { sub: MuscleSubgroup; phase: Phase; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8"><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{sub.emoji} {sub.nome}</p>
          <p className="text-[10px] text-muted-foreground">{sub.descricao}</p>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3 pb-4">
          {/* Info */}
          <Card className="p-3 bg-primary/5 border-primary/20 space-y-1">
            <p className="text-[10px] font-bold text-primary uppercase">Função</p>
            <p className="text-xs text-foreground">{sub.funcao}</p>
            <p className="text-[10px] font-bold text-primary uppercase mt-2">Visual</p>
            <p className="text-xs text-foreground">{sub.visual}</p>
            {sub.nota && (
              <div className="flex gap-1.5 items-start mt-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-yellow-300">{sub.nota}</p>
              </div>
            )}
          </Card>

          {/* Phase indicator */}
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs text-muted-foreground">Protocolo para fase:</p>
            <Badge className={`text-[10px] ${PHASE_CONFIG[phase].color} bg-transparent border-current`}>
              {PHASE_CONFIG[phase].emoji} {PHASE_CONFIG[phase].label}
            </Badge>
          </div>

          {/* Exercises */}
          <div className="space-y-2">
            {sub.exercicios.map((ex, i) => <ExerciseCard key={i} ex={ex} phase={phase} />)}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Muscle Group View ───
function MuscleGroupView({ group, onSelectSubgroup }: { group: MuscleGroup; onSelectSubgroup: (sub: MuscleSubgroup) => void }) {
  return (
    <div className="space-y-2 px-4 py-3">
      <p className="text-xs text-muted-foreground mb-2">Selecione a área específica:</p>
      {group.subgrupos.map((sub) => (
        <motion.button
          key={sub.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectSubgroup(sub)}
          className="w-full text-left p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors flex items-center gap-3"
        >
          <span className="text-xl">{sub.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{sub.nome}</p>
            <p className="text-[10px] text-muted-foreground">{sub.descricao}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      ))}
    </div>
  );
}

// ─── Main Component ───
export default function ExerciseSelector() {
  const [vista, setVista] = useState<"frente" | "costas">("frente");
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null);
  const [selectedSubgroup, setSelectedSubgroup] = useState<MuscleSubgroup | null>(null);
  const [phase, setPhase] = useState<Phase>("manutencao");

  const filteredGroups = MUSCLE_GROUPS.filter(g => g.vista === vista || g.vista === "ambos");

  const handleBack = () => {
    if (selectedSubgroup) { setSelectedSubgroup(null); return; }
    if (selectedGroup) { setSelectedGroup(null); return; }
  };

  // Subgroup detail
  if (selectedSubgroup) {
    return <SubgroupDetail sub={selectedSubgroup} phase={phase} onBack={handleBack} />;
  }

  // Group detail (list of subgroups)
  if (selectedGroup) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8"><ArrowLeft className="w-4 h-4" /></Button>
          <p className="text-sm font-bold text-foreground">{selectedGroup.emoji} {selectedGroup.nome}</p>
        </div>
        <ScrollArea className="flex-1">
          <MuscleGroupView group={selectedGroup} onSelectSubgroup={setSelectedSubgroup} />
        </ScrollArea>
      </div>
    );
  }

  // Main — muscle group selection
  return (
    <div className="flex flex-col h-full">
      {/* Phase selector */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-border space-y-2">
        <p className="text-[10px] text-muted-foreground uppercase font-bold">Sua fase atual:</p>
        <div className="flex gap-2">
          {(Object.entries(PHASE_CONFIG) as [Phase, typeof PHASE_CONFIG[Phase]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setPhase(key)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                phase === key
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/20"
              }`}
            >
              {cfg.emoji} {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vista toggle */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-foreground">Qual área quer trabalhar?</p>
          <div className="flex bg-card border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setVista("frente")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${vista === "frente" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
            >
              Frente
            </button>
            <button
              onClick={() => setVista("costas")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${vista === "costas" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
            >
              Costas
            </button>
          </div>
        </div>
      </div>

      {/* Muscle groups grid */}
      <ScrollArea className="flex-1 px-4">
        <div className="grid grid-cols-2 gap-2 pb-4">
          {filteredGroups.map((group) => (
            <motion.button
              key={group.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedGroup(group)}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors text-center space-y-1"
            >
              <span className="text-3xl block">{group.emoji}</span>
              <p className="text-sm font-bold text-foreground">{group.nome}</p>
              <p className="text-[10px] text-muted-foreground">{group.subgrupos.length} subdivisões</p>
            </motion.button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
