import { useState } from "react";
import { INTENSITY_TECHNIQUES } from "@/data/trainingSystems";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

export interface AppliedTechnique {
  id: string;
  param?: string;
}

interface Props {
  exerciseName?: string;
  initialTempo?: string;
  initialRIR?: number;
  onChange?: (data: { techniques: AppliedTechnique[]; tempo: string; rir: number }) => void;
}

export default function IntensityTechniquesPicker({ exerciseName = "Exercício", initialTempo = "2-0-1-0", initialRIR = 2, onChange }: Props) {
  const [applied, setApplied] = useState<AppliedTechnique[]>([]);
  const [tempo, setTempo] = useState(initialTempo);
  const [rir, setRir] = useState(initialRIR);

  const update = (next: AppliedTechnique[], nextTempo = tempo, nextRir = rir) => {
    setApplied(next);
    setTempo(nextTempo);
    setRir(nextRir);
    onChange?.({ techniques: next, tempo: nextTempo, rir: nextRir });
  };

  const toggle = (id: string) => {
    const exists = applied.find((a) => a.id === id);
    if (exists) update(applied.filter((a) => a.id !== id));
    else update([...applied, { id, param: "" }]);
  };

  const setParam = (id: string, param: string) => {
    update(applied.map((a) => (a.id === id ? { ...a, param } : a)));
  };

  const rirLabel = ["Falha (0)", "1 reserva", "2 reserva", "3 reserva", "4 reserva", "Muito fácil (5)"][rir];

  return (
    <div className="space-y-4 p-4 rounded-xl border border-border bg-card">
      <div>
        <h4 className="text-sm font-black text-foreground">Técnicas para: {exerciseName}</h4>
        <p className="text-[11px] text-muted-foreground">Selecione técnicas, tempo e RIR alvo.</p>
      </div>

      {/* Tempo */}
      <div>
        <label className="text-xs font-bold text-foreground">Tempo de Execução (Excêntrica - Pausa baixo - Concêntrica - Pausa topo)</label>
        <Input
          value={tempo}
          onChange={(e) => update(applied, e.target.value, rir)}
          placeholder="4-0-1-0"
          className="mt-1 h-9 text-sm"
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {["4-0-1-0", "2-2-1-1", "1-0-X-0", "3-1-1-0"].map((t) => (
            <button key={t} onClick={() => update(applied, t, rir)} className="text-[10px] px-2 py-0.5 rounded-md bg-muted hover:bg-primary/20 text-muted-foreground">{t}</button>
          ))}
        </div>
      </div>

      {/* RIR */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground">RIR Alvo (Reps in Reserve)</label>
          <span className="text-xs font-bold text-primary">{rirLabel}</span>
        </div>
        <Slider value={[rir]} onValueChange={(v) => update(applied, tempo, v[0])} min={0} max={5} step={1} className="mt-2" />
      </div>

      {/* Techniques grid */}
      <div>
        <label className="text-xs font-bold text-foreground">Técnicas de Intensidade</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {INTENSITY_TECHNIQUES.map((t) => {
            const ap = applied.find((a) => a.id === t.id);
            const active = !!ap;
            return (
              <div key={t.id} className={`p-2 rounded-lg border ${active ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
                <button onClick={() => toggle(t.id)} className="w-full flex items-start gap-2 text-left">
                  <div className={`w-4 h-4 rounded border ${active ? "bg-primary border-primary" : "border-muted-foreground"} flex items-center justify-center mt-0.5 shrink-0`}>
                    {active && <span className="text-[10px] text-primary-foreground">✓</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-foreground">{t.nome}</span>
                      {t.precisaParceiro && <Users className="w-3 h-3 text-amber-500" aria-label="Precisa parceiro" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{t.descricao}</p>
                  </div>
                </button>
                {active && t.paramLabel && (
                  <Input
                    value={ap?.param || ""}
                    onChange={(e) => setParam(t.id, e.target.value)}
                    placeholder={t.paramLabel}
                    className="mt-2 h-7 text-[11px]"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
