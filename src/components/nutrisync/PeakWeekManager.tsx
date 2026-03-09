import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trophy, Calendar as CalendarIcon, Check, Droplets, Flame, TrendingDown, TrendingUp, Zap, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface DayProtocol {
  day: number;
  label: string;
  phase: "depletion" | "supercomp" | "event";
  carbMultiplier: number;
  waterLiters: number;
  sodiumLevel: "high" | "moderate" | "low" | "cut";
  kcalMultiplier: number;
  checklist: string[];
  tip: string;
}

const PEAK_PROTOCOL: DayProtocol[] = [
  {
    day: 1, label: "Depleção 1", phase: "depletion",
    carbMultiplier: 0.30, waterLiters: 5.0, sodiumLevel: "high", kcalMultiplier: 0.85,
    checklist: ["Treino de alto volume (15-20 reps)", "Carb < 50g no dia", "Água: 5L mínimo", "Sódio elevado"],
    tip: "Esgote glicogênio com volume alto. Sem carb, muita água e sódio para ativar aldosterona."
  },
  {
    day: 2, label: "Depleção 2", phase: "depletion",
    carbMultiplier: 0.25, waterLiters: 5.0, sodiumLevel: "high", kcalMultiplier: 0.80,
    checklist: ["Treino de depleção (supersets)", "Carb < 30g", "Água: 5L", "Sódio alto mantido"],
    tip: "Continue a depleção. Músculos devem ficar 'flat'. Isso é esperado."
  },
  {
    day: 3, label: "Depleção 3", phase: "depletion",
    carbMultiplier: 0.20, waterLiters: 4.0, sodiumLevel: "moderate", kcalMultiplier: 0.80,
    checklist: ["Treino leve ou descanso", "Carb mínimo", "Reduzir água para 4L", "Começar a reduzir sódio"],
    tip: "Último dia de depleção. Transição para supercompensação amanhã."
  },
  {
    day: 4, label: "Supercompensação 1", phase: "supercomp",
    carbMultiplier: 2.0, waterLiters: 3.0, sodiumLevel: "low", kcalMultiplier: 1.20,
    checklist: ["Carb loading: 8-10g/kg", "Fontes: arroz, batata, macarrão", "Água: 3L", "Sódio reduzido", "Sem treino pesado"],
    tip: "Músculos vão absorver carb como esponja. Cada 1g de glicogênio puxa 3g de água intramuscular."
  },
  {
    day: 5, label: "Supercompensação 2", phase: "supercomp",
    carbMultiplier: 1.8, waterLiters: 2.0, sodiumLevel: "low", kcalMultiplier: 1.15,
    checklist: ["Carb moderado-alto", "Reduzir água para 2L", "Sódio baixo", "Refeições menores e frequentes"],
    tip: "Continue o carb loading. Reduza a água gradualmente. Visual deve melhorar."
  },
  {
    day: 6, label: "Véspera", phase: "supercomp",
    carbMultiplier: 1.5, waterLiters: 1.0, sodiumLevel: "cut", kcalMultiplier: 1.10,
    checklist: ["Carb moderado", "Água: sips apenas", "Cortar sódio", "Refeição final 6h antes de dormir", "Preparar poses/outfit"],
    tip: "Pele fina, músculos cheios. Beba apenas goles. Última refeição cedo."
  },
  {
    day: 7, label: "Dia do Evento", phase: "event",
    carbMultiplier: 1.2, waterLiters: 0.5, sodiumLevel: "cut", kcalMultiplier: 1.0,
    checklist: ["Snacks de carb rápido antes do palco", "Mel + banana 30min antes", "Pump-up leve", "Sips de água apenas"],
    tip: "Pump com bandas. Carb rápido para vascularity. Você está pronto. 🏆"
  },
];

const PHASE_COLORS = {
  depletion: { bg: "bg-destructive/10", border: "border-destructive/20", text: "text-destructive", icon: TrendingDown },
  supercomp: { bg: "bg-primary/10", border: "border-primary/20", text: "text-primary", icon: TrendingUp },
  event: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent", icon: Trophy },
};

const SODIUM_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: "Alto", color: "text-destructive" },
  moderate: { label: "Moderado", color: "text-primary" },
  low: { label: "Baixo", color: "text-accent" },
  cut: { label: "Zero", color: "text-muted-foreground" },
};

const PeakWeekManager = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [activePlan, setActivePlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [eventDate, setEventDate] = useState<Date>();
  const [eventName, setEventName] = useState("Competição");
  const [creating, setCreating] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const baseCarbs = profile?.carbs_g || 250;
  const baseKcal = profile?.vet_kcal || 2000;
  const weightKg = profile?.weight_kg || 70;

  const fetchPlan = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("peak_week_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setActivePlan(data);
    if (data?.daily_protocol) {
      try {
        const stored = typeof data.daily_protocol === "string" ? JSON.parse(data.daily_protocol) : data.daily_protocol;
        if (stored.checkedItems) setCheckedItems(stored.checkedItems);
      } catch {}
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const createPlan = async () => {
    if (!user || !eventDate) return;
    setCreating(true);
    const startDate = addDays(eventDate, -6);
    await supabase.from("peak_week_plans").upsert({
      user_id: user.id,
      event_name: eventName,
      event_date: format(eventDate, "yyyy-MM-dd"),
      start_date: format(startDate, "yyyy-MM-dd"),
      status: "active",
      daily_protocol: { checkedItems: {} },
    }, { onConflict: "user_id,event_date" });
    setCreating(false);
    await fetchPlan();
  };

  const deletePlan = async () => {
    if (!activePlan) return;
    await supabase.from("peak_week_plans").update({ status: "completed" }).eq("id", activePlan.id);
    setActivePlan(null);
    setCheckedItems({});
  };

  const toggleCheck = async (key: string) => {
    const updated = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(updated);
    if (activePlan) {
      await supabase.from("peak_week_plans").update({
        daily_protocol: { checkedItems: updated },
      }).eq("id", activePlan.id);
    }
  };

  const daysUntilEvent = useMemo(() => {
    if (!activePlan) return null;
    return differenceInDays(new Date(activePlan.event_date), new Date());
  }, [activePlan]);

  const currentDayIndex = useMemo(() => {
    if (!activePlan) return -1;
    const start = new Date(activePlan.start_date);
    const diff = differenceInDays(new Date(), start);
    return diff >= 0 && diff <= 6 ? diff : -1;
  }, [activePlan]);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  // No active plan — show creation form
  if (!activePlan) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground mb-2">Ativar Peak Week</h2>
          <p className="text-xs font-mono text-muted-foreground mb-5 leading-relaxed">
            Protocolo de 7 dias com depleção de carb (dias 1-3), supercompensação (dias 4-6) e dia do evento.
            Manipulação automática de água, sódio e calorias.
          </p>

          <div className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">Nome do evento</label>
              <Input
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                placeholder="Ex: Campeonato, Ensaio fotográfico..."
                className="bg-background"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">Data do evento</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-md border border-input bg-background text-sm",
                    !eventDate && "text-muted-foreground"
                  )}>
                    <CalendarIcon className="w-4 h-4" />
                    {eventDate ? format(eventDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
                    disabled={(date) => date < addDays(new Date(), 6)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {eventDate && (
                <p className="text-[10px] font-mono text-primary mt-1.5">
                  Peak Week inicia em {format(addDays(eventDate, -6), "dd/MM")} · {differenceInDays(eventDate, new Date())} dias restantes
                </p>
              )}
            </div>

            <button
              onClick={createPlan}
              disabled={!eventDate || creating}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {creating ? "Criando..." : "⚡ Ativar Peak Week"}
            </button>
          </div>
        </div>

        {/* Protocol Preview */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Preview do Protocolo</h3>
          <div className="space-y-1.5">
            {PEAK_PROTOCOL.map(day => {
              const phaseStyle = PHASE_COLORS[day.phase];
              return (
                <div key={day.day} className={`flex items-center gap-3 p-2.5 rounded-lg border ${phaseStyle.border} ${phaseStyle.bg}`}>
                  <span className={`text-xs font-mono font-bold w-6 ${phaseStyle.text}`}>D{day.day}</span>
                  <phaseStyle.icon className={`w-3.5 h-3.5 ${phaseStyle.text}`} />
                  <div className="flex-1">
                    <p className="text-xs font-mono text-foreground font-bold">{day.label}</p>
                    <p className="text-[9px] font-mono text-muted-foreground">Carb {Math.round(day.carbMultiplier * 100)}% · Água {day.waterLiters}L</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  // Active plan — show daily protocol
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Countdown Header */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1">🏆 {activePlan.event_name}</p>
          <p className="text-xs text-muted-foreground font-mono mb-2">
            {format(new Date(activePlan.event_date), "dd 'de' MMMM", { locale: ptBR })}
          </p>
          {daysUntilEvent !== null && daysUntilEvent >= 0 ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex flex-col items-center"
            >
              <span className="text-5xl font-bold font-mono text-primary">{daysUntilEvent}</span>
              <span className="text-xs font-mono text-muted-foreground">dias restantes</span>
            </motion.div>
          ) : (
            <div className="text-2xl font-bold text-primary">🏆 Hoje é o dia!</div>
          )}
          <div className="flex justify-center mt-3">
            <button onClick={deletePlan} className="text-[10px] font-mono text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
              <Trash2 className="w-3 h-3" /> Encerrar Peak Week
            </button>
          </div>
        </div>
      </div>

      {/* Week Timeline */}
      <div className="flex gap-1">
        {PEAK_PROTOCOL.map(day => {
          const phaseStyle = PHASE_COLORS[day.phase];
          const isActive = currentDayIndex === day.day - 1;
          const isPast = currentDayIndex > day.day - 1;
          return (
            <div
              key={day.day}
              className={`flex-1 rounded-lg p-1.5 text-center border transition-all ${
                isActive ? `${phaseStyle.border} ${phaseStyle.bg} ring-1 ring-primary/30` :
                isPast ? "border-border bg-card/30 opacity-50" :
                `${phaseStyle.border} ${phaseStyle.bg}`
              }`}
            >
              <p className={`text-[9px] font-mono font-bold ${isActive ? phaseStyle.text : "text-muted-foreground"}`}>D{day.day}</p>
              {isPast && <Check className="w-3 h-3 text-primary mx-auto" />}
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-0.5 animate-pulse" />}
            </div>
          );
        })}
      </div>

      {/* Daily Protocol Cards */}
      {PEAK_PROTOCOL.map(day => {
        const phaseStyle = PHASE_COLORS[day.phase];
        const isActive = currentDayIndex === day.day - 1;
        const isPast = currentDayIndex > day.day - 1;
        const dayCarbs = Math.round(baseCarbs * day.carbMultiplier);
        const dayKcal = Math.round(baseKcal * day.kcalMultiplier);
        const sodium = SODIUM_LABELS[day.sodiumLevel];

        return (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: day.day * 0.05 }}
            className={`rounded-2xl border p-4 ${
              isActive ? `${phaseStyle.border} ${phaseStyle.bg} ring-1 ring-primary/20` :
              isPast ? "border-border bg-card/50 opacity-60" :
              "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${phaseStyle.bg} ${phaseStyle.text}`}>
                  Dia {day.day}
                </span>
                <span className="text-sm font-bold text-foreground">{day.label}</span>
                {isActive && <span className="text-[9px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">HOJE</span>}
              </div>
              <phaseStyle.icon className={`w-4 h-4 ${phaseStyle.text}`} />
            </div>

            {/* Macro adjustments */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="rounded-lg bg-background border border-border p-2 text-center">
                <Flame className="w-3 h-3 text-primary mx-auto mb-0.5" />
                <p className="text-sm font-bold font-mono text-foreground">{dayKcal}</p>
                <p className="text-[8px] font-mono text-muted-foreground">kcal</p>
              </div>
              <div className="rounded-lg bg-background border border-border p-2 text-center">
                <span className="text-xs">🍚</span>
                <p className="text-sm font-bold font-mono text-foreground">{dayCarbs}g</p>
                <p className="text-[8px] font-mono text-muted-foreground">carb</p>
              </div>
              <div className="rounded-lg bg-background border border-border p-2 text-center">
                <Droplets className="w-3 h-3 text-accent mx-auto mb-0.5" />
                <p className="text-sm font-bold font-mono text-foreground">{day.waterLiters}L</p>
                <p className="text-[8px] font-mono text-muted-foreground">água</p>
              </div>
              <div className="rounded-lg bg-background border border-border p-2 text-center">
                <span className="text-xs">🧂</span>
                <p className={`text-sm font-bold font-mono ${sodium.color}`}>{sodium.label}</p>
                <p className="text-[8px] font-mono text-muted-foreground">sódio</p>
              </div>
            </div>

            {/* Tip */}
            <div className="rounded-lg bg-background/50 border border-border p-2.5 mb-3">
              <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">💡 {day.tip}</p>
            </div>

            {/* Checklist */}
            <div className="space-y-1.5">
              {day.checklist.map((item, i) => {
                const checkKey = `d${day.day}-${i}`;
                const checked = !!checkedItems[checkKey];
                return (
                  <button
                    key={i}
                    onClick={() => (isActive || !isPast) && toggleCheck(checkKey)}
                    disabled={isPast}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all ${
                      checked ? "bg-primary/5 border border-primary/10" : "border border-border hover:border-primary/10"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      checked ? "bg-primary border-primary" : "border-muted-foreground"
                    }`}>
                      {checked && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className={`text-xs font-mono ${checked ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      {/* Wearables teaser */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⌚</span>
          <h3 className="text-sm font-bold text-foreground">Integração com Wearables</h3>
        </div>
        <p className="text-xs font-mono text-muted-foreground mb-3">
          Estrutura preparada para Apple Health, Google Fit, Garmin e Polar.
        </p>
        <div className="flex gap-2 flex-wrap">
          {["Apple Health", "Google Fit", "Garmin", "Polar"].map(w => (
            <span key={w} className="text-[10px] font-mono text-muted-foreground bg-background border border-border rounded-full px-3 py-1">{w}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PeakWeekManager;
