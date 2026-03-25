import { useState } from "react";
import { BookOpen, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { BehavioralDiaryEntry } from "@/hooks/useBehavioral";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const EMOCOES_RAPIDAS = ["😊 Bem", "😐 Neutro", "😰 Ansioso", "😢 Triste", "😤 Irritado", "🥱 Cansado", "🎉 Animado"];

interface Props {
  entries: BehavioralDiaryEntry[];
  onAdd: (entry: Partial<BehavioralDiaryEntry>) => void;
}

export default function BehavioralDiary({ entries, onAdd }: Props) {
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [emocao, setEmocao] = useState("");
  const [intensidade, setIntensidade] = useState([5]);
  const [fome, setFome] = useState([5]);
  const [fomeReal, setFomeReal] = useState<boolean | null>(null);
  const [aconteceu, setAconteceu] = useState("");
  const [aprendi, setAprendi] = useState("");
  const [proximaVez, setProximaVez] = useState("");

  const handleSave = () => {
    onAdd({
      emocao_primaria: emocao,
      emocao_intensidade: intensidade[0],
      fome_antes: fome[0],
      fome_real: fomeReal,
      o_que_aconteceu: aconteceu,
      o_que_aprendi: aprendi,
      proxima_vez: proximaVez,
    });
    setAdding(false);
    setEmocao("");
    setAconteceu("");
    setAprendi("");
    setProximaVez("");
  };

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Diário Comportamental
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setAdding(!adding)} className="h-7 text-[10px] gap-1">
            <Plus className="w-3 h-3" /> Registro
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && (
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div>
              <p className="text-[10px] text-muted-foreground mb-1.5">Como você está?</p>
              <div className="flex flex-wrap gap-1.5">
                {EMOCOES_RAPIDAS.map(e => (
                  <button key={e} onClick={() => setEmocao(e)}
                    className={`px-2.5 py-1 rounded-full text-[10px] border transition-all ${emocao === e ? "border-primary bg-primary/20" : "border-border"}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Intensidade: {intensidade[0]}/10</p>
              <Slider value={intensidade} onValueChange={setIntensidade} min={1} max={10} step={1} />
            </div>

            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Nível de fome: {fome[0]}/10</p>
              <Slider value={fome} onValueChange={setFome} min={1} max={10} step={1} />
            </div>

            <div>
              <p className="text-[10px] text-muted-foreground mb-1">É fome real (física)?</p>
              <div className="flex gap-2">
                {[true, false].map(v => (
                  <button key={String(v)} onClick={() => setFomeReal(v)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] border transition-all ${fomeReal === v ? "border-primary bg-primary/10" : "border-border"}`}>
                    {v ? "Sim, fome física" : "Não, emocional"}
                  </button>
                ))}
              </div>
            </div>

            <Textarea placeholder="O que aconteceu?" value={aconteceu} onChange={e => setAconteceu(e.target.value)} className="text-xs min-h-[60px]" />
            <Textarea placeholder="O que aprendi sobre mim?" value={aprendi} onChange={e => setAprendi(e.target.value)} className="text-xs min-h-[40px]" />
            <Textarea placeholder="O que farei diferente na próxima vez?" value={proximaVez} onChange={e => setProximaVez(e.target.value)} className="text-xs min-h-[40px]" />

            <Button onClick={handleSave} disabled={!emocao} className="w-full" size="sm">Salvar Registro</Button>
          </div>
        )}

        {entries.length === 0 && !adding && (
          <p className="text-[10px] text-muted-foreground text-center py-4">Nenhum registro ainda. Comece registrando como se sente!</p>
        )}

        {entries.slice(0, 10).map(entry => {
          const isExpanded = expandedId === entry.id;
          return (
            <button key={entry.id} onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              className="w-full text-left p-3 rounded-xl border border-border hover:bg-muted/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{entry.emocao_primaria?.split(" ")[0] || "📝"}</span>
                  <div>
                    <p className="text-xs font-medium">{entry.emocao_primaria?.split(" ").slice(1).join(" ") || "Registro"}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {format(new Date(entry.created_at), "dd MMM HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {entry.emocao_intensidade && (
                    <Badge variant="outline" className="text-[8px]">{entry.emocao_intensidade}/10</Badge>
                  )}
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </div>
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-border space-y-1.5">
                  {entry.fome_real !== null && (
                    <p className="text-[10px]">Fome: {entry.fome_real ? "Física" : "Emocional"} ({entry.fome_antes}/10)</p>
                  )}
                  {entry.o_que_aconteceu && <p className="text-[10px] text-muted-foreground">{entry.o_que_aconteceu}</p>}
                  {entry.o_que_aprendi && <p className="text-[10px] text-emerald-400">💡 {entry.o_que_aprendi}</p>}
                  {entry.proxima_vez && <p className="text-[10px] text-primary">→ {entry.proxima_vez}</p>}
                </div>
              )}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
