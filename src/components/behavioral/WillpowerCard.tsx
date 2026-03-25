import { useState } from "react";
import { Battery, Plus, Check, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ENVIRONMENT_CHECKLIST = [
  "Junk food: fora de casa",
  "Frutas e proteínas: na frente da geladeira",
  "Garrafa de água: na mesa de trabalho",
  "Roupas de treino: na cadeira ao lado da cama",
  "App de delivery: deletado",
];

interface Props {
  profile: any;
  onSave: (data: any) => void;
}

export default function WillpowerCard({ profile, onSave }: Props) {
  const [showIntents, setShowIntents] = useState(false);
  const [intents, setIntents] = useState<string[]>(profile?.implementation_intents || []);
  const [newIntent, setNewIntent] = useState("");
  const [envChecked, setEnvChecked] = useState<string[]>(profile?.environment_design?.checked || []);

  const addIntent = () => {
    if (!newIntent.trim()) return;
    const updated = [...intents, newIntent.trim()];
    setIntents(updated);
    setNewIntent("");
    onSave({ implementation_intents: updated });
  };

  const toggleEnv = (item: string) => {
    const updated = envChecked.includes(item) ? envChecked.filter(i => i !== item) : [...envChecked, item];
    setEnvChecked(updated);
    onSave({ environment_design: { checked: updated } });
  };

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Battery className="w-4 h-4 text-amber-400" /> Força de Vontade Científica
        </CardTitle>
        <p className="text-[10px] text-muted-foreground italic">"O objetivo não é ter mais força de vontade — é precisar usar menos dela"</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Implementation Intentions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold flex items-center gap-1"><Lightbulb className="w-3 h-3 text-amber-400" /> Se... Então...</p>
            <Button variant="ghost" size="sm" onClick={() => setShowIntents(!showIntents)} className="h-6 text-[10px]">
              {showIntents ? "Fechar" : "Editar"}
            </Button>
          </div>
          
          {intents.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {intents.map((intent, i) => (
                <p key={i} className="text-[10px] p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  {intent}
                </p>
              ))}
            </div>
          )}

          {showIntents && (
            <div className="flex gap-2">
              <Input placeholder='Se [situação], então [ação]' value={newIntent} onChange={e => setNewIntent(e.target.value)} className="text-xs h-8 flex-1" />
              <Button onClick={addIntent} size="sm" className="h-8 px-3"><Plus className="w-3 h-3" /></Button>
            </div>
          )}
        </div>

        {/* Environment Design */}
        <div>
          <p className="text-[10px] font-semibold mb-2">🏠 Design de Ambiente</p>
          <div className="space-y-1.5">
            {ENVIRONMENT_CHECKLIST.map(item => (
              <button key={item} onClick={() => toggleEnv(item)}
                className={`w-full text-left flex items-center gap-2 p-2 rounded-lg text-[10px] border transition-all ${envChecked.includes(item) ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"}`}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${envChecked.includes(item) ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30"}`}>
                  {envChecked.includes(item) && <Check className="w-3 h-3 text-white" />}
                </div>
                {item}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
