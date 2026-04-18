import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { useStratum } from "@/hooks/useStratum";
import { toast } from "sonner";

type Ex = { exercicio: string; sets?: number; reps_target?: string; carga?: number; rpe?: number; rir?: number; pr?: boolean };

export default function StratumSessionLogger() {
  const { logSession, runAdapt } = useStratum();
  const [modulo, setModulo] = useState("chest");
  const [tipo, setTipo] = useState("volume");
  const [grupo, setGrupo] = useState("chest");
  const [rpeMed, setRpeMed] = useState(7);
  const [duracao, setDuracao] = useState(60);
  const [fadiga, setFadiga] = useState(5);
  const [exs, setExs] = useState<Ex[]>([{ exercicio: "" }]);
  const [loading, setLoading] = useState(false);

  const update = (i: number, k: keyof Ex, v: any) => setExs(p => p.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const add = () => setExs(p => [...p, { exercicio: "" }]);
  const remove = (i: number) => setExs(p => p.filter((_, idx) => idx !== i));

  const save = async () => {
    const valid = exs.filter(e => e.exercicio.trim());
    if (!valid.length) { toast.error("Adicione ao menos 1 exercício"); return; }
    setLoading(true);
    try {
      const totalSets = valid.reduce((s, e) => s + (e.sets || 0), 0);
      await logSession({
        modulo, tipo_treino: tipo, grupo_principal: grupo,
        volume_total: totalSets, rpe_medio: rpeMed, duracao_minutos: duracao,
        fadiga_reportada: fadiga, exercicios: valid,
      });
      await runAdapt();
      toast.success("Sessão registrada · STRATUM ADAPT executado");
      setExs([{ exercicio: "" }]);
    } catch (e: any) { toast.error(e?.message || "Erro"); }
    setLoading(false);
  };

  return (
    <Card className="border-[#DC2626]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#DC2626] text-sm">
          <Save className="w-4 h-4" /> Registrar sessão · STRATUM ADAPT
        </CardTitle>
        <p className="text-xs text-muted-foreground">Camada 2 · cada treino registrado adapta o próximo</p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Módulo</label>
            <select value={modulo} onChange={e => setModulo(e.target.value)} className="w-full bg-background border border-border rounded p-1">
              {["chest","arms","back","shoulders","legs","upper","lower","core","feminino","athlete"].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Tipo</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full bg-background border border-border rounded p-1">
              <option value="forca">Força</option>
              <option value="volume">Volume</option>
              <option value="deload">Deload</option>
              <option value="cardio">Cardio</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Grupo principal</label>
            <Input value={grupo} onChange={e => setGrupo(e.target.value)} className="h-8" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">RPE médio: {rpeMed}</label>
            <input type="range" min={1} max={10} value={rpeMed} onChange={e => setRpeMed(+e.target.value)} className="w-full accent-[#DC2626]" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Duração (min)</label>
            <Input type="number" value={duracao} onChange={e => setDuracao(+e.target.value)} className="h-8" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Fadiga (1-10): {fadiga}</label>
            <input type="range" min={1} max={10} value={fadiga} onChange={e => setFadiga(+e.target.value)} className="w-full accent-[#DC2626]" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Exercícios</span>
            <Button onClick={add} size="sm" variant="ghost" className="h-7 text-xs"><Plus className="w-3 h-3" /> Adicionar</Button>
          </div>
          {exs.map((e, i) => (
            <div key={i} className="grid grid-cols-12 gap-1 items-center">
              <Input placeholder="Exercício" value={e.exercicio} onChange={ev => update(i, "exercicio", ev.target.value)} className="col-span-4 h-8" />
              <Input placeholder="Sets" type="number" value={e.sets || ""} onChange={ev => update(i, "sets", +ev.target.value)} className="col-span-1 h-8" />
              <Input placeholder="Reps" value={e.reps_target || ""} onChange={ev => update(i, "reps_target", ev.target.value)} className="col-span-2 h-8" />
              <Input placeholder="Kg" type="number" step="0.5" value={e.carga || ""} onChange={ev => update(i, "carga", +ev.target.value)} className="col-span-2 h-8" />
              <Input placeholder="RPE" type="number" min={1} max={10} value={e.rpe || ""} onChange={ev => update(i, "rpe", +ev.target.value)} className="col-span-1 h-8" />
              <label className="col-span-1 flex items-center gap-1 text-[10px]">
                <input type="checkbox" checked={e.pr || false} onChange={ev => update(i, "pr", ev.target.checked)} /> PR
              </label>
              <Button onClick={() => remove(i)} size="icon" variant="ghost" className="col-span-1 h-7 w-7"><Trash2 className="w-3 h-3" /></Button>
            </div>
          ))}
        </div>

        <Button onClick={save} disabled={loading} className="w-full bg-[#DC2626] hover:bg-[#DC2626]/90">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar sessão e rodar STRATUM ADAPT"}
        </Button>
      </CardContent>
    </Card>
  );
}
