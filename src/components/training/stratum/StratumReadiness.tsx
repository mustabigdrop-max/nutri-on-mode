import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Loader2 } from "lucide-react";
import { useStratum } from "@/hooks/useStratum";
import { toast } from "sonner";

const ZONA_COLORS: Record<string, string> = {
  verde: "bg-green-500/20 border-green-500/40 text-green-400",
  amarelo: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400",
  laranja: "bg-orange-500/20 border-orange-500/40 text-orange-400",
  vermelho: "bg-red-500/20 border-red-500/40 text-red-400",
};

export default function StratumReadiness() {
  const { todayReadiness, submitReadiness } = useStratum();
  const [sono, setSono] = useState(7);
  const [energia, setEnergia] = useState(7);
  const [dor, setDor] = useState("nenhuma");
  const [estresse, setEstresse] = useState("medio");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await submitReadiness({ sono, energia, dor, estresse });
      toast.success("Check-in registrado");
    } catch (e: any) { toast.error(e?.message || "Erro"); }
    setLoading(false);
  };

  if (todayReadiness) {
    const cls = ZONA_COLORS[todayReadiness.zona || "amarelo"];
    return (
      <Card className={`border ${cls}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4" /> STRATUM READY · Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{todayReadiness.score}/100</div>
          <div className="text-xs uppercase mt-1">{todayReadiness.zona}</div>
          <p className="text-xs mt-2 text-foreground/80">{todayReadiness.recomendacao}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#DC2626]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#DC2626] text-sm">
          <Activity className="w-4 h-4" /> Check-in STRATUM READY
        </CardTitle>
        <p className="text-xs text-muted-foreground">Camada 3 · 60 segundos antes do treino</p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <label className="text-xs text-muted-foreground">Sono ontem (1-10): {sono}</label>
          <input type="range" min={1} max={10} value={sono} onChange={e => setSono(+e.target.value)} className="w-full accent-[#DC2626]" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Energia agora (1-10): {energia}</label>
          <input type="range" min={1} max={10} value={energia} onChange={e => setEnergia(+e.target.value)} className="w-full accent-[#DC2626]" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Dor muscular/articular</label>
          <select value={dor} onChange={e => setDor(e.target.value)} className="w-full bg-background border border-border rounded p-1 text-sm">
            <option value="nenhuma">Nenhuma</option>
            <option value="leve">Leve</option>
            <option value="moderada">Moderada</option>
            <option value="severa">Severa</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Estresse hoje</label>
          <select value={estresse} onChange={e => setEstresse(e.target.value)} className="w-full bg-background border border-border rounded p-1 text-sm">
            <option value="baixo">Baixo</option>
            <option value="medio">Médio</option>
            <option value="alto">Alto</option>
          </select>
        </div>
        <Button onClick={submit} disabled={loading} className="w-full bg-[#DC2626] hover:bg-[#DC2626]/90">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Calcular prontidão"}
        </Button>
      </CardContent>
    </Card>
  );
}
