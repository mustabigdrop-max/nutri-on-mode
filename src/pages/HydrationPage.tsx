import { Droplets, Plus, Minus, GlassWater } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const QUICK_ADD = [200, 300, 500];
const DEFAULT_GOAL = 2500;

const HydrationPage = () => {
  const { todayLog, loading, addWater, setWater } = useWaterLogs();
  const { profile } = useProfile();

  const current = todayLog?.ml_total ?? 0;
  const goal = DEFAULT_GOAL;
  const pct = Math.min(100, Math.round((current / goal) * 100));

  const handleAdd = async (ml: number) => {
    const res = await addWater(ml);
    if (res?.error) toast.error("Erro ao registrar água");
    else toast.success(`+${ml}ml registrado! 💧`);
  };

  const handleRemove = async () => {
    if (current <= 0) return;
    const res = await setWater(Math.max(0, current - 200));
    if (!res?.error) toast.info("-200ml removido");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-500 to-cyan-600 px-4 pt-12 pb-8 text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Droplets className="h-7 w-7" /> Hidratação
        </h1>
        <p className="text-sky-100 text-sm mt-1">Acompanhe sua ingestão de água diária</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Progress circle card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <motion.div
              className="relative w-44 h-44 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {/* SVG ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                <motion.circle
                  cx="80" cy="80" r="70" fill="none"
                  stroke="hsl(200, 90%, 50%)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * pct) / 100 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
              <div className="text-center z-10">
                <span className="text-3xl font-bold text-foreground">{current}</span>
                <span className="text-sm text-muted-foreground block">/ {goal} ml</span>
              </div>
            </motion.div>

            <Progress value={pct} className="h-2 w-full" />
            <p className="text-sm text-muted-foreground">
              {pct >= 100
                ? "🎉 Meta atingida! Continue hidratado."
                : `Faltam ${goal - current}ml para a meta`}
            </p>
          </CardContent>
        </Card>

        {/* Quick add buttons */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <GlassWater className="h-5 w-5 text-sky-500" /> Adicionar Água
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {QUICK_ADD.map((ml) => (
              <motion.div key={ml} whileTap={{ scale: 0.93 }} className="flex-1 min-w-[90px]">
                <Button
                  variant="outline"
                  className="w-full h-14 text-lg font-semibold border-sky-200 hover:bg-sky-50 hover:border-sky-400 transition-colors"
                  onClick={() => handleAdd(ml)}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-1" /> {ml}ml
                </Button>
              </motion.div>
            ))}
            <motion.div whileTap={{ scale: 0.93 }} className="w-full">
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={handleRemove}
                disabled={loading || current <= 0}
              >
                <Minus className="h-4 w-4 mr-1" /> Remover 200ml
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-0 shadow-md bg-sky-50 dark:bg-sky-950/30">
          <CardContent className="pt-4 text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">💡 Dicas de hidratação</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Beba um copo ao acordar para ativar o metabolismo</li>
              <li>Mantenha uma garrafa por perto durante o dia</li>
              <li>Água com limão ou hortelã conta!</li>
              <li>Chás sem açúcar também ajudam na meta</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HydrationPage;
