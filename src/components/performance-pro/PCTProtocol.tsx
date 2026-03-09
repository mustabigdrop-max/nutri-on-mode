import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

interface Props {
  phase: string;
}

const PCT_TIMELINE = [
  {
    weeks: "Semana 1–2",
    title: "Adaptação",
    description: "Queda de performance esperada. Mantenha treino intenso para sinalizar necessidade de massa. Foque em sono e recuperação.",
    nutrition: "Calorias: manutenção | Proteína: 2.4g/kg | Gordura: aumentada para suporte hormonal",
    supplements: ["Tribulus", "Ashwagandha", "Zinco + Magnésio", "Vitamina D", "Ômega 3"],
    color: "border-l-red-500",
  },
  {
    weeks: "Semana 3–4",
    title: "Recuperação progressiva",
    description: "Hormônios começam a se recuperar. Monitore humor, libido e energia como indicadores. Ajuste volume de treino se necessário.",
    nutrition: "Calorias: manutenção | Proteína: 2.2g/kg | Carbo: moderado-alto",
    supplements: ["Creatina 5g/dia", "DHEA (se indicado)", "Ômega 3", "Multivitamínico"],
    color: "border-l-yellow-500",
  },
  {
    weeks: "Semana 5–8",
    title: "Estabilização hormonal",
    description: "Eixo HPT em recuperação. Exames de controle recomendados nesta fase para verificar LH, FSH e testosterona.",
    nutrition: "Calorias: ajuste conforme objetivo | Proteína: 2.0g/kg | Manutenção",
    supplements: ["Manutenção do stack básico", "Creatina", "Suporte articular"],
    color: "border-l-green-500",
  },
];

const PCT_CHECKLIST = [
  "Último pino administrado — aguardar clearance da substância",
  "Exames pré-PCT realizados (LH, FSH, Testo, Estradiol, Hemograma)",
  "Suporte hepático iniciado",
  "Stack de suporte hormonal preparado",
  "Plano nutricional de manutenção definido",
];

const PCTProtocol = ({ phase }: Props) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <RotateCcw className="w-4 h-4 text-[#FF6B00]" />
        Protocolo PCT — Pós-Ciclo
      </h3>

      {phase !== "pct" && (
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            📋 Você não está em fase PCT no momento. As informações abaixo são para referência e planejamento futuro.
          </p>
        </Card>
      )}

      {/* Checklist */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Checklist de Início</p>
        {PCT_CHECKLIST.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-muted-foreground text-sm">☐</span>
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </Card>

      {/* Timeline */}
      {PCT_TIMELINE.map((step, i) => (
        <Card key={i} className={`p-4 border-l-4 ${step.color} space-y-2`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{step.title}</p>
            <Badge variant="outline" className="text-xs">{step.weeks}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{step.description}</p>
          <p className="text-xs">🍽️ {step.nutrition}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {step.supplements.map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px]">
                {s}
              </Badge>
            ))}
          </div>
        </Card>
      ))}

      {/* Monitoring alerts */}
      <Card className="p-4 border-l-4 border-l-[#FF6B00]">
        <p className="text-xs font-medium mb-1">📊 Indicadores de Recuperação</p>
        <p className="text-xs text-muted-foreground">
          Monitore diariamente: humor, libido, energia, qualidade do sono e força no treino.
          Quedas persistentes após a semana 4 indicam necessidade de revisão médica.
        </p>
      </Card>
    </div>
  );
};

export default PCTProtocol;
