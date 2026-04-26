import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Trophy, Camera, Loader2, Upload, Scale, Activity,
  Heart, Moon, Zap, Dumbbell, Save, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: string;
  athlete_id: string;
  nome_competicao: string;
  data_competicao: string;
  peso_atual: number;
  peso_alvo_palco: number;
  semana_atual: number;
  bloco_atual?: string;
  blocos: any[];
}

const AthleteCompetitionCheckInPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [semana, setSemana] = useState<number>(1);
  const [peso, setPeso] = useState<string>("");
  const [bf, setBf] = useState<string>("");
  const [cintura, setCintura] = useState<string>("");
  const [recovery, setRecovery] = useState<number[]>([7]);
  const [aderTreino, setAderTreino] = useState<number[]>([90]);
  const [aderDieta, setAderDieta] = useState<number[]>([90]);
  const [sonoQual, setSonoQual] = useState<number[]>([7]);
  const [sonoHoras, setSonoHoras] = useState<string>("8");
  const [energia, setEnergia] = useState<number[]>([7]);
  const [dorMuscular, setDorMuscular] = useState<number[]>([5]);
  const [forcaStatus, setForcaStatus] = useState<string>("manteve");
  const [posingMin, setPosingMin] = useState<string>("0");
  const [posingMusica, setPosingMusica] = useState(false);
  const [maiorDif, setMaiorDif] = useState("");
  const [compulsao, setCompulsao] = useState(false);

  // Photos
  const [fotoFrente, setFotoFrente] = useState<File | null>(null);
  const [fotoLateral, setFotoLateral] = useState<File | null>(null);
  const [fotoCostas, setFotoCostas] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!planId || !user) return;
      const { data, error } = await supabase
        .from("competition_plans")
        .select("*")
        .eq("id", planId)
        .eq("athlete_id", user.id)
        .maybeSingle();
      if (error || !data) {
        toast.error("Plano não encontrado");
        navigate("/dashboard");
        return;
      }
      setPlan(data as any);
      setSemana(data.semana_atual || 1);
      setPeso(String(data.peso_atual || ""));
      setLoading(false);
    };
    load();
  }, [planId, user, navigate]);

  const blocoAtual = useMemo(() => {
    if (!plan) return null;
    return plan.blocos?.find(
      (b: any) => semana >= b.semana_inicio && semana <= b.semana_fim
    );
  }, [plan, semana]);

  const uploadPhoto = async (file: File, tipo: string): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/comp-${planId}/s${semana}-${tipo}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("progress-photos")
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error(`Erro ao enviar foto ${tipo}`);
      return null;
    }
    return path;
  };

  const handleSubmit = async () => {
    if (!plan || !user) return;
    if (!peso) {
      toast.error("Informe o peso atual");
      return;
    }
    setSaving(true);
    try {
      const [frenteUrl, lateralUrl, costasUrl] = await Promise.all([
        fotoFrente ? uploadPhoto(fotoFrente, "frente") : null,
        fotoLateral ? uploadPhoto(fotoLateral, "lateral") : null,
        fotoCostas ? uploadPhoto(fotoCostas, "costas") : null,
      ]);

      const payload = {
        competition_plan_id: plan.id,
        semana,
        bloco: blocoAtual?.tipo || null,
        peso: parseFloat(peso),
        bf_estimado: bf ? parseFloat(bf) : null,
        circunferencia_cintura: cintura ? parseFloat(cintura) : null,
        foto_frente_url: frenteUrl,
        foto_lateral_url: lateralUrl,
        foto_costas_url: costasUrl,
        recovery_score: recovery[0],
        aderencia_treino: aderTreino[0],
        aderencia_dieta: aderDieta[0],
        qualidade_sono: sonoQual[0],
        horas_sono_media: parseFloat(sonoHoras),
        energia_geral: energia[0],
        dor_muscular: dorMuscular[0],
        forca_status: forcaStatus,
        posing_minutos: parseInt(posingMin) || 0,
        posing_com_musica: posingMusica,
        maior_dificuldade: maiorDif || null,
        episodio_compulsao: compulsao,
      };

      const { error } = await supabase
        .from("competition_weekly_logs")
        .insert(payload);
      if (error) throw error;

      // update semana_atual
      await supabase
        .from("competition_plans")
        .update({ semana_atual: semana + 1, peso_atual: parseFloat(peso) })
        .eq("id", plan.id);

      toast.success("Check-in semanal registrado!");
      navigate("/dashboard");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao salvar check-in");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) return null;

  const perdaSemana = plan.peso_atual && peso
    ? (plan.peso_atual - parseFloat(peso)).toFixed(2)
    : "0";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-background to-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="mb-3 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <div className="flex items-start gap-3">
            <Trophy className="h-8 w-8 text-primary mt-1" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                Check-in Semanal
              </h1>
              <p className="text-sm text-muted-foreground">
                {plan.nome_competicao}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">Semana {semana}</Badge>
                {blocoAtual && (
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {blocoAtual.nome}
                  </Badge>
                )}
                <Badge variant="outline">
                  Meta palco: {plan.peso_alvo_palco}kg
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Biometria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="h-5 w-5 text-primary" /> Biometria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Semana</Label>
                <Input
                  type="number"
                  value={semana}
                  onChange={(e) => setSemana(parseInt(e.target.value) || 1)}
                  min={1}
                />
              </div>
              <div>
                <Label>Peso atual (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ex: 82.5"
                />
              </div>
              <div>
                <Label>BF estimado (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={bf}
                  onChange={(e) => setBf(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <Label>Cintura (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={cintura}
                  onChange={(e) => setCintura(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>
            {peso && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                <span className="text-muted-foreground">
                  Variação vs. semana anterior:
                </span>{" "}
                <span className="font-semibold text-foreground">
                  {parseFloat(perdaSemana) > 0 ? "-" : "+"}
                  {Math.abs(parseFloat(perdaSemana))} kg
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fotos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-5 w-5 text-primary" /> Fotos de Progresso
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            {[
              { label: "Frente", file: fotoFrente, set: setFotoFrente },
              { label: "Lateral", file: fotoLateral, set: setFotoLateral },
              { label: "Costas", file: fotoCostas, set: setFotoCostas },
            ].map((p) => (
              <label
                key={p.label}
                className="border-2 border-dashed border-border rounded-lg p-3 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    p.set(e.target.files?.[0] || null)
                  }
                />
                {p.file ? (
                  <CheckCircle2 className="h-6 w-6 mx-auto text-primary mb-1" />
                ) : (
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                )}
                <p className="text-xs font-medium">{p.label}</p>
                {p.file && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {p.file.name}
                  </p>
                )}
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Recovery & Aderência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-primary" /> Recovery & Aderência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <SliderField
              label="Recovery Score"
              icon={<Heart className="h-4 w-4" />}
              value={recovery}
              onChange={setRecovery}
              min={0}
              max={10}
              suffix="/10"
            />
            <SliderField
              label="Aderência ao treino"
              icon={<Dumbbell className="h-4 w-4" />}
              value={aderTreino}
              onChange={setAderTreino}
              min={0}
              max={100}
              suffix="%"
            />
            <SliderField
              label="Aderência à dieta"
              icon={<Activity className="h-4 w-4" />}
              value={aderDieta}
              onChange={setAderDieta}
              min={0}
              max={100}
              suffix="%"
            />
          </CardContent>
        </Card>

        {/* Sono & Energia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="h-5 w-5 text-primary" /> Sono & Energia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <SliderField
              label="Qualidade do sono"
              icon={<Moon className="h-4 w-4" />}
              value={sonoQual}
              onChange={setSonoQual}
              min={0}
              max={10}
              suffix="/10"
            />
            <div>
              <Label>Horas médias de sono</Label>
              <Input
                type="number"
                step="0.5"
                value={sonoHoras}
                onChange={(e) => setSonoHoras(e.target.value)}
                className="mt-1"
              />
            </div>
            <SliderField
              label="Energia geral"
              icon={<Zap className="h-4 w-4" />}
              value={energia}
              onChange={setEnergia}
              min={0}
              max={10}
              suffix="/10"
            />
            <SliderField
              label="Dor muscular (DOMS)"
              icon={<AlertTriangle className="h-4 w-4" />}
              value={dorMuscular}
              onChange={setDorMuscular}
              min={0}
              max={10}
              suffix="/10"
            />
          </CardContent>
        </Card>

        {/* Performance & Posing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Dumbbell className="h-5 w-5 text-primary" /> Performance & Posing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Status de força nesta semana</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { v: "subiu", label: "Subiu" },
                  { v: "manteve", label: "Manteve" },
                  { v: "caiu", label: "Caiu" },
                ].map((s) => (
                  <Button
                    key={s.v}
                    type="button"
                    variant={forcaStatus === s.v ? "default" : "outline"}
                    size="sm"
                    onClick={() => setForcaStatus(s.v)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Minutos totais de posing na semana</Label>
              <Input
                type="number"
                value={posingMin}
                onChange={(e) => setPosingMin(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Praticou posing com música?</p>
                <p className="text-xs text-muted-foreground">
                  Importante a partir do pré-peak
                </p>
              </div>
              <Switch checked={posingMusica} onCheckedChange={setPosingMusica} />
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Observações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Maior dificuldade desta semana</Label>
              <Textarea
                value={maiorDif}
                onChange={(e) => setMaiorDif(e.target.value)}
                placeholder="Fome, fadiga, dor, falta de tempo..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <div>
                <p className="text-sm font-medium">Houve episódio de compulsão?</p>
                <p className="text-xs text-muted-foreground">
                  Sinal importante para ajuste do coach
                </p>
              </div>
              <Switch checked={compulsao} onCheckedChange={setCompulsao} />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={saving}
          size="lg"
          className="w-full"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Enviar check-in da semana {semana}
        </Button>
      </div>
    </div>
  );
};

const SliderField = ({
  label, icon, value, onChange, min, max, suffix,
}: {
  label: string;
  icon: React.ReactNode;
  value: number[];
  onChange: (v: number[]) => void;
  min: number;
  max: number;
  suffix: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <Label className="flex items-center gap-1.5 text-sm">
        {icon} {label}
      </Label>
      <span className="text-sm font-semibold text-primary">
        {value[0]}
        {suffix}
      </span>
    </div>
    <Slider
      value={value}
      onValueChange={onChange}
      min={min}
      max={max}
      step={1}
    />
  </div>
);

export default AthleteCompetitionCheckInPage;
