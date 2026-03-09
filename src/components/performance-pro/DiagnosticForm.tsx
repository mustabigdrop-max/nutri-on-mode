import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

const SUBSTANCES = [
  { key: "testo_enantato", label: "Testosterona Enantato" },
  { key: "testo_cipionato", label: "Testosterona Cipionato" },
  { key: "testo_propionato", label: "Testosterona Propionato" },
  { key: "deca", label: "Nandrolona (Deca)" },
  { key: "npp", label: "Nandrolona NPP" },
  { key: "trembo_enantato", label: "Trembolona Enantato" },
  { key: "trembo_acetato", label: "Trembolona Acetato" },
  { key: "boldenona", label: "Boldenona" },
  { key: "oxandrolona", label: "Oxandrolona (Anavar)" },
  { key: "stanozolol", label: "Stanozolol" },
  { key: "ostarine", label: "SARM — Ostarine" },
  { key: "lgd4033", label: "SARM — LGD-4033" },
  { key: "rad140", label: "SARM — RAD-140" },
  { key: "mk677", label: "SARM — MK-677" },
  { key: "bpc157", label: "Peptídeo — BPC-157" },
  { key: "hgh", label: "HGH" },
  { key: "igf1", label: "IGF-1" },
  { key: "tb500", label: "TB-500" },
  { key: "cjc1295", label: "CJC-1295" },
  { key: "furosemida", label: "Furosemida" },
  { key: "espironolactona", label: "Espironolactona" },
  { key: "hidroclorotiazida", label: "Hidroclorotiazida" },
];

const PHASES = [
  { key: "inicio", label: "🟡 Início do ciclo (semanas 1–4)", color: "border-yellow-500" },
  { key: "meio", label: "🔴 Meio do ciclo (semanas 5–10)", color: "border-red-500" },
  { key: "final", label: "🟠 Final do ciclo (semanas 11+)", color: "border-orange-500" },
  { key: "pct", label: "🟢 PCT — pós-ciclo", color: "border-green-500" },
  { key: "pre_comp", label: "🏆 Pré-competição (últimas 4–12 semanas)", color: "border-purple-500" },
];

const OBJECTIVES = [
  { key: "massa", label: "Ganho de massa máximo" },
  { key: "recomposicao", label: "Recomposição corporal" },
  { key: "definicao", label: "Definição e corte" },
  { key: "pre_comp", label: "Pré-competição / peak week" },
];

const EXPERIENCE = [
  { key: "primeiro", label: "Primeiro ciclo" },
  { key: "intermediario", label: "Intermediário (2–5 ciclos)" },
  { key: "avancado", label: "Avançado (5+ ciclos)" },
];

interface DiagnosticFormProps {
  onSubmit: (data: {
    substances: string[];
    current_phase: string;
    objective: string;
    experience_level: string;
  }) => Promise<unknown>;
}

const DiagnosticForm = ({ onSubmit }: DiagnosticFormProps) => {
  const [step, setStep] = useState(0);
  const [substances, setSubstances] = useState<string[]>([]);
  const [otherSubstance, setOtherSubstance] = useState("");
  const [phase, setPhase] = useState("");
  const [objective, setObjective] = useState("");
  const [experience, setExperience] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleSubstance = (key: string) => {
    setSubstances((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const allSubstances = otherSubstance
      ? [...substances, otherSubstance]
      : substances;
    await onSubmit({
      substances: allSubstances,
      current_phase: phase,
      objective,
      experience_level: experience,
    });
    setSubmitting(false);
  };

  const canAdvance = [
    substances.length > 0,
    !!phase,
    !!objective,
    !!experience,
  ];

  const steps = [
    // Step 0: Substances
    <div key="substances" className="space-y-3">
      <h2 className="text-lg font-bold">Substâncias em uso</h2>
      <p className="text-sm text-muted-foreground">Selecione todas que está usando atualmente</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-2">
        {SUBSTANCES.map((s) => (
          <label
            key={s.key}
            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
              substances.includes(s.key)
                ? "border-[#FF6B00] bg-[#FF6B00]/10"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <Checkbox
              checked={substances.includes(s.key)}
              onCheckedChange={() => toggleSubstance(s.key)}
            />
            <span className="text-sm">{s.label}</span>
          </label>
        ))}
      </div>
      <Input
        placeholder="Outro — digite aqui"
        value={otherSubstance}
        onChange={(e) => setOtherSubstance(e.target.value)}
        className="mt-2"
      />
    </div>,

    // Step 1: Phase
    <div key="phase" className="space-y-3">
      <h2 className="text-lg font-bold">Fase atual</h2>
      <div className="space-y-2">
        {PHASES.map((p) => (
          <button
            key={p.key}
            onClick={() => setPhase(p.key)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
              phase === p.key
                ? `${p.color} bg-[#FF6B00]/10`
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <span className="text-sm font-medium">{p.label}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Objective
    <div key="objective" className="space-y-3">
      <h2 className="text-lg font-bold">Objetivo</h2>
      <div className="space-y-2">
        {OBJECTIVES.map((o) => (
          <button
            key={o.key}
            onClick={() => setObjective(o.key)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
              objective === o.key
                ? "border-[#FF6B00] bg-[#FF6B00]/10"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <span className="text-sm font-medium">{o.label}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Experience
    <div key="experience" className="space-y-3">
      <h2 className="text-lg font-bold">Experiência</h2>
      <div className="space-y-2">
        {EXPERIENCE.map((e) => (
          <button
            key={e.key}
            onClick={() => setExperience(e.key)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
              experience === e.key
                ? "border-[#FF6B00] bg-[#FF6B00]/10"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <span className="text-sm font-medium">{e.label}</span>
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-[#FF6B00]" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Card className="p-5">{steps[step]}</Card>

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button
              className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
              disabled={!canAdvance[step]}
              onClick={() => setStep(step + 1)}
            >
              Próximo <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
              disabled={!canAdvance[step] || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando protocolo...
                </>
              ) : (
                "Gerar protocolo"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticForm;
