import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Sparkles, Flame, Zap, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const DAY_NAMES = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const DAY_LABEL: Record<string, string> = {
  domingo: "Domingo", segunda: "Segunda-feira", terca: "Terça-feira",
  quarta: "Quarta-feira", quinta: "Quinta-feira", sexta: "Sexta-feira", sabado: "Sábado",
};

const DAY_PATTERNS: Record<string, RegExp> = {
  segunda: /segunda[- ]?feira[:\s]*([\s\S]*?)(?=ter[cç]a|quarta|quinta|sexta|s[aá]bado|domingo|##|$)/i,
  terca:   /ter[cç]a[- ]?feira[:\s]*([\s\S]*?)(?=quarta|quinta|sexta|s[aá]bado|domingo|segunda|##|$)/i,
  quarta:  /quarta[- ]?feira[:\s]*([\s\S]*?)(?=quinta|sexta|s[aá]bado|domingo|segunda|ter[cç]a|##|$)/i,
  quinta:  /quinta[- ]?feira[:\s]*([\s\S]*?)(?=sexta|s[aá]bado|domingo|segunda|ter[cç]a|quarta|##|$)/i,
  sexta:   /sexta[- ]?feira[:\s]*([\s\S]*?)(?=s[aá]bado|domingo|segunda|ter[cç]a|quarta|quinta|##|$)/i,
  sabado:  /s[aá]bado[:\s]*([\s\S]*?)(?=domingo|segunda|ter[cç]a|quarta|quinta|sexta|##|$)/i,
  domingo: /domingo[:\s]*([\s\S]*?)(?=segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado|##|$)/i,
};

const SECTION_PATTERNS = {
  ativacao: /(?:##\s*)?ATIVA[CÇ][AÃ]O[\s\S]*?(?=\n##|\nFINALIZADORES|\nSEMANA|$)/i,
  finalizadores: /(?:##\s*)?FINALIZADORES[\s\S]*?(?=\n##|$)/i,
  semanaTipo: /(?:##\s*)?SEMANA[_ ]?TIPO[\s\S]*?(?=\n##|$)/i,
};

interface ParsedExercise {
  raw: string;
  name: string;
  detail: string;
  isApex: boolean;
  isPostural: boolean;
  muscle?: string;
}

function parseExercises(block: string): ParsedExercise[] {
  if (!block) return [];
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines
    .filter((l) => /^[-•\d]/.test(l) || /\d+\s*[xX×]\s*\d+/.test(l))
    .map((raw) => {
      const cleaned = raw.replace(/^[-•\d.\)]+\s*/, "");
      const [name, ...rest] = cleaned.split(/[—:-]/);
      const detail = rest.join(" - ").trim();
      const isApex = /apex|corretiv/i.test(raw);
      const isPostural = /postural|ativa[cç][aã]o/i.test(raw);
      return { raw, name: name.trim(), detail, isApex, isPostural };
    });
}

function extractSection(text: string, key: keyof typeof SECTION_PATTERNS): string | null {
  const match = text.match(SECTION_PATTERNS[key]);
  return match ? match[0] : null;
}

function parseDayFromTraining(trainingText: string, dayName: string): string | null {
  const semanaTipo = extractSection(trainingText, "semanaTipo") ?? trainingText;
  const pattern = DAY_PATTERNS[dayName];
  if (!pattern) return null;
  const match = semanaTipo.match(pattern);
  return match ? match[1].trim() : null;
}

function getMuscleScore(scores: any, muscle: string): number | null {
  if (!scores || typeof scores !== "object") return null;
  const lower = muscle.toLowerCase();
  for (const k of Object.keys(scores)) {
    if (k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase())) {
      const v = Number(scores[k]);
      if (!isNaN(v)) return v;
    }
  }
  return null;
}

interface CountdownProps { seconds: number }
function Countdown({ seconds }: CountdownProps) {
  const [time, setTime] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || time <= 0) return;
    const id = setInterval(() => setTime((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [running, time]);

  const mm = String(Math.floor(time / 60)).padStart(2, "0");
  const ss = String(time % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm tabular-nums text-foreground">{mm}:{ss}</span>
      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setRunning((r) => !r)}>
        {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </Button>
      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setRunning(false); setTime(seconds); }}>
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export default function AthleteTodayTrainingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [athleteRecord, setAthleteRecord] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [sync, setSync] = useState<any>(null);
  const [scores, setScores] = useState<any>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [loads, setLoads] = useState<Record<string, string>>({});
  const [showCheckin, setShowCheckin] = useState(false);
  const [feeling, setFeeling] = useState(3);
  const [connection, setConnection] = useState(7);
  const [hasPain, setHasPain] = useState(false);
  const [painNote, setPainNote] = useState("");

  const today = new Date();
  const todayKey = DAY_NAMES[today.getDay()];

  useEffect(() => { load(true); }, []);

  // Realtime: refetch automatically when APEX/coach data changes
  useEffect(() => {
    if (!athleteRecord?.id) return;
    const filter = `athlete_id=eq.${athleteRecord.id}`;
    const channel = supabase
      .channel(`athlete-today-${athleteRecord.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "corrective_training_plans", filter }, () => {
        toast.info("🔄 Treino atualizado pelo coach");
        load(false);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "apex_training_sync", filter }, () => {
        load(false);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "apex_analyses", filter }, () => {
        toast.info("🔬 Nova análise APEX recebida");
        load(false);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [athleteRecord?.id]);

  const load = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: athlete } = await supabase
        .from("competition_athletes")
        .select("id, nome, fase_atual, categoria, coach_id")
        .eq("patient_user_id", user.id)
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!athlete) { setLoading(false); return; }
      setAthleteRecord(athlete);

      const { data: activePlan } = await supabase
        .from("corrective_training_plans")
        .select("*")
        .eq("athlete_id", athlete.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setPlan(activePlan);

      const { data: syncData } = await supabase
        .from("apex_training_sync")
        .select("*")
        .eq("athlete_id", athlete.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setSync(syncData);

      const { data: lastApex } = await supabase
        .from("apex_analyses")
        .select("scores")
        .eq("athlete_id", athlete.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setScores(lastApex?.scores ?? null);
    } catch (e) {
      console.error(e);
      if (showSpinner) toast.error("Erro ao carregar treino do dia");
    } finally {
      setLoading(false);
    }
  };

  const dayBlock = useMemo(() => plan ? parseDayFromTraining(plan.training_text ?? "", todayKey) : null, [plan, todayKey]);
  const ativacao = useMemo(() => plan ? extractSection(plan.training_text ?? "", "ativacao") : null, [plan]);
  const finalizadores = useMemo(() => plan ? extractSection(plan.training_text ?? "", "finalizadores") : null, [plan]);

  const ativacaoExs = useMemo(() => parseExercises(ativacao ?? ""), [ativacao]);
  const finalizadoresExs = useMemo(() => parseExercises(finalizadores ?? ""), [finalizadores]);
  const mainExs = useMemo(() => parseExercises(dayBlock ?? ""), [dayBlock]);

  const totalExs = mainExs.length + ativacaoExs.length + finalizadoresExs.length;
  const apexCount = [...mainExs, ...ativacaoExs, ...finalizadoresExs].filter(e => e.isApex || e.isPostural).length;
  const hasPostural = !!(sync?.postural_deviations && sync.postural_deviations.length > 0);

  const toggle = (key: string) => setCompleted((p) => ({ ...p, [key]: !p[key] }));

  const submitCheckin = async () => {
    if (!athleteRecord) return;
    try {
      await supabase.from("training_feedback").insert({
        athlete_id: athleteRecord.id,
        coach_id: athleteRecord.coach_id,
        session_date: new Date().toISOString().slice(0, 10),
        muscle_connections: { overall: connection, feeling },
        pump_scores: loads,
        notes: hasPain ? `Dor: ${painNote}` : null,
      });
      toast.success("✓ Check-in salvo!");
      setShowCheckin(false);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar check-in");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!athleteRecord) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/coach/dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Você ainda não está vinculado como atleta de um coach.</p>
          </Card>
        </div>
      </div>
    );
  }

  const phase = athleteRecord.fase_atual || "Acumulação";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/coach/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>

        {/* Header */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Treino de hoje · {DAY_LABEL[todayKey]}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {today.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{phase}</Badge>
              {apexCount > 0 && (
                <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30">
                  <Sparkles className="h-3 w-3 mr-1" /> +{apexCount} Corretivo APEX
                </Badge>
              )}
            </div>
          </div>
          {plan && (
            <p className="text-xs text-muted-foreground mt-3">
              {totalExs} exercícios · ~{Math.max(30, totalExs * 4)}min
            </p>
          )}
        </Card>

        {!plan && (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Nenhum protocolo de treino ativo ainda.</p>
            <p className="text-xs text-muted-foreground mt-1">Aguarde seu coach gerar seu plano corretivo APEX.</p>
          </Card>
        )}

        {plan && !dayBlock && (
          <Card className="p-6 text-center">
            <p className="text-foreground font-medium">Dia de descanso ativo 💤</p>
            <p className="text-sm text-muted-foreground mt-1">Aproveite para recuperar — mobilidade leve e hidratação.</p>
          </Card>
        )}

        {/* Ativação */}
        {hasPostural && ativacaoExs.length > 0 && (
          <Card className="p-5 border-orange-500/30 bg-orange-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="font-bold text-foreground">Ativação Pré-Treino · 10 min</h2>
              <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-xs">🔬 Correção postural</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Execute antes do aquecimento principal.</p>
            <div className="space-y-2">
              {ativacaoExs.map((ex, i) => {
                const k = `act-${i}`;
                return (
                  <div key={k} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                    <input type="checkbox" checked={!!completed[k]} onChange={() => toggle(k)} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{ex.name}</p>
                      {ex.detail && <p className="text-xs text-muted-foreground mt-0.5">{ex.detail}</p>}
                    </div>
                    <Countdown seconds={45} />
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Treino Principal */}
        {mainExs.length > 0 && (
          <Card className="p-5">
            <h2 className="font-bold text-foreground mb-4">Treino Principal</h2>
            <div className="space-y-3">
              {mainExs.map((ex, i) => {
                const k = `main-${i}`;
                const score = getMuscleScore(scores, ex.name);
                const weak = score !== null && score < 6;
                const strong = score !== null && score >= 8;
                return (
                  <div key={k} className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={!!completed[k]} onChange={() => toggle(k)} className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">#{i + 1}</span>
                          <p className="font-semibold text-foreground">{ex.name}</p>
                          {ex.isApex && (
                            <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-xs">🎯 APEX</Badge>
                          )}
                          {weak && (
                            <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-xs">
                              Ponto fraco · score {score}
                            </Badge>
                          )}
                          {strong && (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs">
                              ✓ Forte · {score}
                            </Badge>
                          )}
                        </div>
                        {ex.detail && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{ex.detail}</p>
                        )}
                        {weak && (
                          <p className="text-xs text-red-600 mt-2">
                            🎯 Ponto de desenvolvimento — foco total na conexão muscular hoje.
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <Input
                            type="text"
                            placeholder="Carga (kg)"
                            value={loads[k] ?? ""}
                            onChange={(e) => setLoads((p) => ({ ...p, [k]: e.target.value }))}
                            className="h-8 w-32 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Finalizadores */}
        {finalizadoresExs.length > 0 && (
          <Card className="p-5 border-purple-500/30 bg-purple-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-purple-500" />
              <h2 className="font-bold text-foreground">Finalizadores Corretivos · 10 min</h2>
            </div>
            <div className="space-y-2">
              {finalizadoresExs.map((ex, i) => {
                const k = `fin-${i}`;
                return (
                  <div key={k} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                    <input type="checkbox" checked={!!completed[k]} onChange={() => toggle(k)} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{ex.name}</p>
                      {ex.detail && <p className="text-xs text-muted-foreground mt-0.5">{ex.detail}</p>}
                    </div>
                    <Countdown seconds={60} />
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Botão finalizar */}
        {plan && dayBlock && (
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold"
            onClick={() => setShowCheckin(true)}
          >
            <CheckCircle2 className="h-5 w-5 mr-2" /> Finalizar Treino
          </Button>
        )}
      </div>

      {/* Check-in modal */}
      <Dialog open={showCheckin} onOpenChange={setShowCheckin}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Check-in pós-treino</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <p className="text-sm font-medium mb-2">Como você se sentiu?</p>
              <div className="flex justify-between">
                {["😫", "😕", "😐", "😊", "🔥"].map((e, i) => (
                  <button
                    key={i}
                    onClick={() => setFeeling(i + 1)}
                    className={`text-2xl p-2 rounded-lg transition ${feeling === i + 1 ? "bg-primary/20 scale-110" : ""}`}
                  >{e}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Conexão muscular: <span className="text-primary">{connection}/10</span></p>
              <Slider value={[connection]} onValueChange={(v) => setConnection(v[0])} min={1} max={10} step={1} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={hasPain} onChange={(e) => setHasPain(e.target.checked)} />
                Sentiu alguma dor ou desconforto?
              </label>
              {hasPain && (
                <Textarea
                  className="mt-2"
                  placeholder="Descreva a região e intensidade..."
                  value={painNote}
                  onChange={(e) => setPainNote(e.target.value)}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckin(false)}>Cancelar</Button>
            <Button onClick={submitCheckin}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
