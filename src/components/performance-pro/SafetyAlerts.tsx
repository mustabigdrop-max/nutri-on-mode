import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

interface Props {
  alerts: Record<string, unknown>[];
  substances: string[];
  phase: string;
}

const STATIC_ALERTS: { condition: (s: string[], p: string) => boolean; icon: "warn" | "danger"; message: string }[] = [
  {
    condition: (s) => s.some((x) => x.includes("trembo")),
    icon: "danger",
    message: "Trembolona detectada — monitoramento de pressão arterial obrigatório. Registre sua pressão 3x por semana.",
  },
  {
    condition: (s) => s.some((x) => ["oxandrolona", "stanozolol", "ostarine", "lgd4033", "rad140"].includes(x)),
    icon: "warn",
    message: "Oral/SARM detectado — monitore enzimas hepáticas. Recomendamos TUDCA 500mg/dia como suporte.",
  },
  {
    condition: (s) => s.some((x) => ["furosemida", "espironolactona", "hidroclorotiazida"].includes(x)),
    icon: "danger",
    message: "Diurético registrado — monitore eletrólitos. Risco de câimbra e arritmia em caso de depleção severa.",
  },
  {
    condition: (s) => s.some((x) => x.includes("deca") || x.includes("npp")),
    icon: "warn",
    message: "Nandrolona detectada — monitore prolactina e considere suporte com vitamina B6 (P-5-P).",
  },
  {
    condition: (_, p) => p === "final",
    icon: "warn",
    message: "Fase final do ciclo — comece a planejar seu PCT. Verifique seus exames antes de encerrar.",
  },
];

const SafetyAlerts = ({ alerts, substances, phase }: Props) => {
  const activeStaticAlerts = STATIC_ALERTS.filter((a) => a.condition(substances, phase));

  const aiAlerts = (alerts || []).map((a) => ({
    icon: (a as Record<string, string>).level === "critical" ? "danger" : "warn",
    message: (a as Record<string, string>).message || "",
  }));

  const allAlerts = [...activeStaticAlerts.map((a) => ({ icon: a.icon, message: a.message })), ...aiAlerts];

  if (allAlerts.length === 0) {
    return (
      <Card className="p-6 text-center space-y-2">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
        <p className="font-medium">Tudo sob controle</p>
        <p className="text-sm text-muted-foreground">
          Exames dentro do esperado para esta fase do ciclo. Continue o protocolo de suporte.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-[#FF6B00]" />
        Alertas de Segurança
      </h3>
      {allAlerts.map((alert, i) => (
        <Card
          key={i}
          className={`p-4 border-l-4 ${
            alert.icon === "danger"
              ? "border-l-red-500 bg-red-500/5"
              : "border-l-yellow-500 bg-yellow-500/5"
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`w-5 h-5 mt-0.5 shrink-0 ${
                alert.icon === "danger" ? "text-red-500" : "text-yellow-500"
              }`}
            />
            <p className="text-sm">{alert.message}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SafetyAlerts;
