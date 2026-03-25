import { useState } from "react";
import { RefreshCw, Plus, ArrowRight, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { BehavioralLoop } from "@/hooks/useBehavioral";

interface Props {
  loops: BehavioralLoop[];
  onAdd: (loop: Partial<BehavioralLoop>) => void;
}

export default function BehavioralLoops({ loops, onAdd }: Props) {
  const [adding, setAdding] = useState(false);
  const [gatilho, setGatilho] = useState("");
  const [rotinaAntiga, setRotinaAntiga] = useState("");
  const [rotinaNova, setRotinaNova] = useState("");
  const [recompensa, setRecompensa] = useState("");

  const handleSave = () => {
    onAdd({ tipo: "alimentar", gatilho, rotina_antiga: rotinaAntiga, rotina_nova: rotinaNova, recompensa, ativo: true });
    setAdding(false);
    setGatilho("");
    setRotinaAntiga("");
    setRotinaNova("");
    setRecompensa("");
  };

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" /> Loops Comportamentais
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setAdding(!adding)} className="h-7 text-[10px] gap-1">
            <Plus className="w-3 h-3" /> Loop
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">Mapeie gatilhos e substitua rotinas negativas</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && (
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
            <Input placeholder="Gatilho (ex: estresse do trabalho às 18h)" value={gatilho} onChange={e => setGatilho(e.target.value)} className="text-xs h-8" />
            <Input placeholder="Rotina antiga (ex: comer ultra-processado)" value={rotinaAntiga} onChange={e => setRotinaAntiga(e.target.value)} className="text-xs h-8" />
            <Input placeholder="Nova rotina (ex: 5min respiração + proteína)" value={rotinaNova} onChange={e => setRotinaNova(e.target.value)} className="text-xs h-8" />
            <Input placeholder="Recompensa (ex: alívio + protocolo mantido)" value={recompensa} onChange={e => setRecompensa(e.target.value)} className="text-xs h-8" />
            <Button onClick={handleSave} disabled={!gatilho || !rotinaNova} className="w-full" size="sm">Salvar Loop</Button>
          </div>
        )}

        {loops.length === 0 && !adding && (
          <p className="text-[10px] text-muted-foreground text-center py-4">
            Nenhum loop mapeado. Identifique seus gatilhos e crie rotinas substitutas!
          </p>
        )}

        {loops.map(loop => {
          const taxa = loop.vezes_ativado > 0 ? Math.round((loop.vezes_sucesso / loop.vezes_ativado) * 100) : 0;
          return (
            <div key={loop.id} className="p-3 rounded-xl border border-border space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={loop.ativo ? "default" : "secondary"} className="text-[8px]">
                  {loop.ativo ? "Ativo" : "Inativo"}
                </Badge>
                {loop.vezes_ativado > 0 && (
                  <span className="text-[9px] text-muted-foreground">{taxa}% sucesso ({loop.vezes_sucesso}/{loop.vezes_ativado})</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-red-400 font-medium">⚡ {loop.gatilho}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                <span className="text-muted-foreground line-through">{loop.rotina_antiga}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-400 font-medium">{loop.rotina_nova}</span>
              </div>
              {loop.recompensa && (
                <p className="text-[9px] text-primary">🎯 {loop.recompensa}</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
