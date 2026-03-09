import { PerformanceProtocol, PerformanceExam } from "@/hooks/usePerformancePro";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SafetyAlerts from "./SafetyAlerts";
import ExamTracker from "./ExamTracker";
import CycleTimeline from "./CycleTimeline";
import PCTProtocol from "./PCTProtocol";
import SupportStack from "./SupportStack";
import { Zap, FlaskConical, Shield, Activity, RotateCcw } from "lucide-react";

const PHASE_LABELS: Record<string, string> = {
  inicio: "🟡 Início do ciclo",
  meio: "🔴 Meio do ciclo",
  final: "🟠 Final do ciclo",
  pct: "🟢 PCT — Pós-ciclo",
  pre_comp: "🏆 Pré-competição",
};

const OBJ_LABELS: Record<string, string> = {
  massa: "Ganho de massa",
  recomposicao: "Recomposição corporal",
  definicao: "Definição e corte",
  pre_comp: "Pré-competição",
};

interface Props {
  protocol: PerformanceProtocol;
  exams: PerformanceExam[];
  onSaveExam: (exam: Omit<PerformanceExam, "id" | "ai_analysis">) => Promise<void>;
}

const ProtocolDashboard = ({ protocol, exams, onSaveExam }: Props) => {
  const plan = protocol.nutrition_plan as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FF6B00]/20 to-background p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#FF6B00]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Performance Pro</h1>
            <p className="text-xs text-muted-foreground">Protocolo ativo</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-[#FF6B00]/40 text-[#FF6B00]">
            {PHASE_LABELS[protocol.current_phase] || protocol.current_phase}
          </Badge>
          <Badge variant="outline">
            {OBJ_LABELS[protocol.objective] || protocol.objective}
          </Badge>
          {protocol.substances.slice(0, 3).map((s) => (
            <Badge key={s} variant="secondary" className="text-xs">
              {s}
            </Badge>
          ))}
          {protocol.substances.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{protocol.substances.length - 3}
            </Badge>
          )}
        </div>

        {protocol.ai_message && (
          <Card className="p-4 bg-card/80 border-[#FF6B00]/20">
            <p className="text-sm whitespace-pre-line">{protocol.ai_message}</p>
          </Card>
        )}
      </div>

      {/* Nutrition Plan Summary */}
      {plan && Object.keys(plan).length > 0 && (
        <div className="px-4 mt-4">
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#FF6B00]" />
              Protocolo Nutricional
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(plan as Record<string, unknown>).calories && (
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Calorias</p>
                  <p className="text-lg font-bold text-[#FF6B00]">{String((plan as Record<string, unknown>).calories)}</p>
                </div>
              )}
              {(plan as Record<string, unknown>).protein && (
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Proteína</p>
                  <p className="text-lg font-bold">{String((plan as Record<string, unknown>).protein)}</p>
                </div>
              )}
              {(plan as Record<string, unknown>).carbs && (
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Carboidrato</p>
                  <p className="text-lg font-bold">{String((plan as Record<string, unknown>).carbs)}</p>
                </div>
              )}
              {(plan as Record<string, unknown>).fat && (
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Gordura</p>
                  <p className="text-lg font-bold">{String((plan as Record<string, unknown>).fat)}</p>
                </div>
              )}
            </div>
            {(plan as Record<string, unknown>).timing && (
              <p className="text-xs text-muted-foreground">
                ⏰ {String((plan as Record<string, unknown>).timing)}
              </p>
            )}
            {(plan as Record<string, unknown>).hydration && (
              <p className="text-xs text-muted-foreground">
                💧 {String((plan as Record<string, unknown>).hydration)}
              </p>
            )}
            {(plan as Record<string, unknown>).notes && (
              <p className="text-xs text-muted-foreground">
                📋 {String((plan as Record<string, unknown>).notes)}
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 mt-4">
        <Tabs defaultValue="alerts">
          <TabsList className="w-full grid grid-cols-5 h-auto">
            <TabsTrigger value="alerts" className="text-xs py-2 flex flex-col items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="stack" className="text-xs py-2 flex flex-col items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Suporte</span>
            </TabsTrigger>
            <TabsTrigger value="cycle" className="text-xs py-2 flex flex-col items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Ciclo</span>
            </TabsTrigger>
            <TabsTrigger value="exams" className="text-xs py-2 flex flex-col items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Exames</span>
            </TabsTrigger>
            <TabsTrigger value="pct" className="text-xs py-2 flex flex-col items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>PCT</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="mt-4">
            <SafetyAlerts
              alerts={protocol.safety_alerts}
              substances={protocol.substances}
              phase={protocol.current_phase}
            />
          </TabsContent>

          <TabsContent value="stack" className="mt-4">
            <SupportStack stack={protocol.support_stack} />
          </TabsContent>

          <TabsContent value="cycle" className="mt-4">
            <CycleTimeline
              phase={protocol.current_phase}
              startedAt={protocol.started_at}
              substances={protocol.substances}
            />
          </TabsContent>

          <TabsContent value="exams" className="mt-4">
            <ExamTracker exams={exams} onSaveExam={onSaveExam} />
          </TabsContent>

          <TabsContent value="pct" className="mt-4">
            <PCTProtocol phase={protocol.current_phase} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProtocolDashboard;
