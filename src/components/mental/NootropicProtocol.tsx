import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FlaskConical, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const CHALLENGES = [
  "Foco e concentração", "Memória e aprendizado", "Criatividade e ideação",
  "Controle de ansiedade e estresse", "Energia mental sustentada", "Clareza mental — brain fog",
];
const CAFFEINE = ["Não consumo", "1 café por dia", "2–3 cafés por dia", "Mais de 3 cafés — possível dependência"];
const HEALTH = ["Ansiedade / Transtorno de pânico", "Hipertensão", "Insônia crônica", "Nenhuma das anteriores"];
const OBJECTIVES = ["Performance no trabalho / estudos", "Performance no treino + mental", "Redução de brain fog", "Longevidade cognitiva"];

const evidenceColor: Record<string, string> = { high: "bg-green-500/20 text-green-400", moderate: "bg-yellow-500/20 text-yellow-400", low: "bg-red-500/20 text-red-400" };
const evidenceLabel: Record<string, string> = { high: "🟢 Alta", moderate: "🟡 Moderada", low: "🔴 Baixa" };

interface Props { mp: any }

const NootropicProtocol = ({ mp }: Props) => {
  const [step, setStep] = useState(mp.nootropicStack ? "result" : "challenge");
  const [challenge, setChallenge] = useState("");
  const [caffeine, setCaffeine] = useState("");
  const [healthConds, setHealthConds] = useState<string[]>([]);
  const [objective, setObjective] = useState("");

  const handleGenerate = async () => {
    await mp.generateStack({ challenge, caffeine_tolerance: caffeine, health_conditions: healthConds, objective });
    setStep("result");
  };

  const toggleHealth = (v: string) => setHealthConds(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const stack = mp.nootropicStack?.generated_stack;

  if (step === "result" && stack) {
    const sections = [
      { key: "morning", icon: "🌅", title: "Manhã" },
      { key: "pre_workout", icon: "🏋️", title: "Pré-treino" },
      { key: "afternoon", icon: "🌆", title: "Tarde" },
      { key: "evening", icon: "🌙", title: "Noite" },
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2"><FlaskConical className="w-5 h-5 text-[hsl(263,70%,58%)]" /> Seu Stack Nootrópico</h2>
          <Button variant="outline" size="sm" onClick={() => setStep("challenge")}>Refazer</Button>
        </div>

        {stack.summary && <p className="text-sm text-muted-foreground">{stack.summary}</p>}

        {sections.map(s => {
          const items = stack[s.key];
          if (!items || items.length === 0) return null;
          return (
            <Card key={s.key} className="bg-card/80 border-[hsl(263,70%,58%)]/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">{s.icon} {s.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item: any, i: number) => (
                  <div key={i} className="bg-secondary/50 rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.icon || "💊"} {item.name} — {item.dose}</span>
                      <Badge className={evidenceColor[item.evidence] || "bg-muted text-muted-foreground"} variant="outline">
                        {evidenceLabel[item.evidence] || item.evidence}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.mechanism}</p>
                    {item.timing && <p className="text-xs text-[hsl(263,70%,58%)]"><Clock className="w-3 h-3 inline mr-1" />{item.timing}</p>}
                    {item.interactions && <p className="text-xs text-destructive"><AlertTriangle className="w-3 h-3 inline mr-1" />{item.interactions}</p>}
                    {item.cost_brl && <p className="text-xs text-muted-foreground">💰 ~R${item.cost_brl}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {stack.warnings?.length > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <p className="font-medium text-sm text-destructive mb-2">⚠️ Avisos Importantes</p>
              {stack.warnings.map((w: string, i: number) => <p key={i} className="text-xs text-muted-foreground">• {w}</p>)}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Questionnaire
  const steps: Record<string, JSX.Element> = {
    challenge: (
      <Card className="bg-card/80">
        <CardHeader><CardTitle className="text-base">Qual seu maior desafio cognitivo?</CardTitle></CardHeader>
        <CardContent>
          <RadioGroup value={challenge} onValueChange={setChallenge} className="space-y-2">
            {CHALLENGES.map(c => (
              <div key={c} className="flex items-center space-x-2 bg-secondary/50 rounded-lg p-3">
                <RadioGroupItem value={c} id={c} /><Label htmlFor={c} className="text-sm cursor-pointer flex-1">{c}</Label>
              </div>
            ))}
          </RadioGroup>
          <Button className="w-full mt-4 bg-[hsl(263,70%,58%)]" disabled={!challenge} onClick={() => setStep("caffeine")}>Próximo</Button>
        </CardContent>
      </Card>
    ),
    caffeine: (
      <Card className="bg-card/80">
        <CardHeader><CardTitle className="text-base">Você consome cafeína atualmente?</CardTitle></CardHeader>
        <CardContent>
          <RadioGroup value={caffeine} onValueChange={setCaffeine} className="space-y-2">
            {CAFFEINE.map(c => (
              <div key={c} className="flex items-center space-x-2 bg-secondary/50 rounded-lg p-3">
                <RadioGroupItem value={c} id={`caf-${c}`} /><Label htmlFor={`caf-${c}`} className="text-sm cursor-pointer flex-1">{c}</Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setStep("challenge")} className="flex-1">Voltar</Button>
            <Button className="flex-1 bg-[hsl(263,70%,58%)]" disabled={!caffeine} onClick={() => setStep("health")}>Próximo</Button>
          </div>
        </CardContent>
      </Card>
    ),
    health: (
      <Card className="bg-card/80">
        <CardHeader><CardTitle className="text-base">Condições de saúde relevantes?</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {HEALTH.map(h => (
              <div key={h} className="flex items-center space-x-2 bg-secondary/50 rounded-lg p-3">
                <Checkbox id={`h-${h}`} checked={healthConds.includes(h)} onCheckedChange={() => toggleHealth(h)} />
                <Label htmlFor={`h-${h}`} className="text-sm cursor-pointer flex-1">{h}</Label>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setStep("caffeine")} className="flex-1">Voltar</Button>
            <Button className="flex-1 bg-[hsl(263,70%,58%)]" onClick={() => setStep("objective")}>Próximo</Button>
          </div>
        </CardContent>
      </Card>
    ),
    objective: (
      <Card className="bg-card/80">
        <CardHeader><CardTitle className="text-base">Objetivo principal?</CardTitle></CardHeader>
        <CardContent>
          <RadioGroup value={objective} onValueChange={setObjective} className="space-y-2">
            {OBJECTIVES.map(o => (
              <div key={o} className="flex items-center space-x-2 bg-secondary/50 rounded-lg p-3">
                <RadioGroupItem value={o} id={`obj-${o}`} /><Label htmlFor={`obj-${o}`} className="text-sm cursor-pointer flex-1">{o}</Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setStep("health")} className="flex-1">Voltar</Button>
            <Button className="flex-1 bg-[hsl(263,70%,58%)]" disabled={!objective || mp.loading} onClick={handleGenerate}>
              {mp.loading ? "Gerando..." : "🧠 Gerar Stack"}
            </Button>
          </div>
        </CardContent>
      </Card>
    ),
  };

  return <div className="space-y-4">{steps[step]}</div>;
};

export default NootropicProtocol;
