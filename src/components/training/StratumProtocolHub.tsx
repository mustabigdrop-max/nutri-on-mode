import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StratumIntake from "./stratum/StratumIntake";
import StratumReadiness from "./stratum/StratumReadiness";
import StratumSessionLogger from "./stratum/StratumSessionLogger";
import StratumWeekly from "./stratum/StratumWeekly";
import StratumAdaptationsLog from "./stratum/StratumAdaptationsLog";

export default function StratumProtocolHub() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#DC2626]/40 bg-gradient-to-br from-[#DC2626]/10 to-transparent p-4">
        <h2 className="text-xl font-bold text-[#DC2626]">STRATUM Protocol</h2>
        <p className="text-xs text-muted-foreground mt-1">7 camadas de inteligência · Sistema que aprende o atleta · Diogo Mello</p>
      </div>

      <Tabs defaultValue="ready" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="ready">Ready</TabsTrigger>
          <TabsTrigger value="intake">Intake</TabsTrigger>
          <TabsTrigger value="log">Sessão</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="adapt">Ajustes</TabsTrigger>
        </TabsList>
        <TabsContent value="ready" className="mt-4"><StratumReadiness /></TabsContent>
        <TabsContent value="intake" className="mt-4"><StratumIntake /></TabsContent>
        <TabsContent value="log" className="mt-4"><StratumSessionLogger /></TabsContent>
        <TabsContent value="weekly" className="mt-4"><StratumWeekly /></TabsContent>
        <TabsContent value="adapt" className="mt-4"><StratumAdaptationsLog /></TabsContent>
      </Tabs>

      <p className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border">
        STRATUM Protocol | TrainingON | nutriON 360 — Baseado em evidências científicas. Não substitui avaliação profissional.
      </p>
    </div>
  );
}
