import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTrainingCycle } from "@/hooks/useTrainingCycle";
import { REST_TYPE_LABEL, type RestType } from "@/lib/trainingFatigue";
import { PATTERN_LABEL, type CyclePattern, todaySaoPaulo } from "@/lib/trainingCycle";

const fmt = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" });

/** Escala de treino em ciclo contínuo: configuração, próximos 7 dias e ajustes manuais. */
export default function TrainingCyclePanel({ athleteUserId, canConfigure }: { athleteUserId?: string | null; canConfigure: boolean }) {
  const c = useTrainingCycle(athleteUserId);
  const [pattern, setPattern] = useState<CyclePattern>("semana");
  const [custom, setCustom] = useState("treino-treino-folga");
  const [start, setStart] = useState(todaySaoPaulo());
  const [adjDate, setAdjDate] = useState(todaySaoPaulo());
  const [saving, setSaving] = useState(false);
  const [restType, setRestType] = useState<RestType>("total");
  const [priority, setPriority] = useState("");

  useEffect(() => {
    if (c.config) {
      setPattern(c.config.pattern);
      setStart(c.config.start_date);
      setRestType(c.config.rest_type || "total");
      setPriority(c.config.priority_group || "");
      if (c.config.custom_sequence?.length) setCustom(c.config.custom_sequence.join("-"));
    } else setPattern("semana");
  }, [c.config]);

  if (!athleteUserId || c.loading) return null;

  const save = async () => {
    setSaving(true);
    const seq = custom.toLowerCase().split(/[^a-z]+/).filter((s) => s === "treino" || s === "folga");
    await c.saveConfig({ pattern, start_date: start, custom_sequence: pattern === "custom" ? seq : null, rest_type: restType, priority_group: priority.trim() || null });
    setSaving(false);
  };

  const next = c.next7?.find((d) => d.isTraining);

  return (
    <section className="mt-6 border border-border/50 p-4 space-y-4">
      <div>
        <p className="font-tech text-[10px] uppercase tracking-[0.18em] text-cyan">Escala de treino</p>
        <h2 className="font-display text-lg font-bold">
          {c.config ? PATTERN_LABEL[c.config.pattern] : "Dias fixos da semana"}
        </h2>
        {next && (
          <p className="text-sm mt-1">
            Próximo treino: <strong>{c.dayLabel(next.workoutIndex)}</strong> · {fmt(next.date)}
          </p>
        )}
      </div>

      {c.next7 && (
        <div className="grid grid-cols-7 gap-1">
          {c.next7.map((d) => (
            <div key={d.date} className={`p-2 text-center border ${d.isTraining ? "border-primary/60 bg-primary/10" : "border-border/40"}`}>
              <p className="text-[10px] text-muted-foreground">{fmt(d.date)}</p>
              <p className="text-[11px] font-bold leading-tight mt-1">
                {d.beforeStart ? "—" : d.isTraining ? c.dayLabel(d.workoutIndex) : "Folga"}
              </p>
              {d.isTraining && c.fatigue[d.date] && (
                <p className="text-[9px] mt-0.5 text-muted-foreground" title={c.fatigue[d.date].reasons.join(" · ")}>
                  {c.fatigue[d.date].level}{c.fatigue[d.date].volumeReduction ? ` · -${c.fatigue[d.date].volumeReduction}%` : ""}
                </p>
              )}
              {!d.isTraining && !d.beforeStart && c.config?.rest_type && c.config.rest_type !== "total" && (
                <p className="text-[9px] mt-0.5 text-muted-foreground">{c.config.rest_type === "sessao_leve" ? "sessão leve (opcional)" : "recup. ativa"}</p>
              )}
              {d.adjustment && <p className="text-[9px] text-primary mt-0.5">ajuste</p>}
            </div>
          ))}
        </div>
      )}

      {c.config && c.next7?.some((d) => d.isTraining && c.fatigue[d.date]?.reasons.length) && (
        <ul className="text-[11px] text-muted-foreground space-y-0.5">
          {c.next7.filter((d) => d.isTraining && c.fatigue[d.date]?.reasons.length).map((d) => (
            <li key={d.date}>{fmt(d.date)} · {c.dayLabel(d.workoutIndex)}: {c.fatigue[d.date].reasons.join(" · ")}</li>
          ))}
        </ul>
      )}

      {c.config && (
        <div className="border border-border/40 p-3 text-xs space-y-1">
          <p className="font-tech text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Dia de folga · {REST_TYPE_LABEL[c.config.rest_type || "total"]}</p>
          <p className="font-semibold">{c.restContent.title}</p>
          {c.restContent.type === "recuperacao_ativa" && <p>{c.restContent.items.join(" · ")} — sem séries nem carga.</p>}
          {c.restContent.type === "sessao_leve" && (
            <>
              <p className="text-muted-foreground">{c.restContent.note}</p>
              <ul>{c.restContent.exercises.map((e) => <li key={e.name}>{e.name} — {e.sets} séries · RPE {e.rpe}</li>)}</ul>
            </>
          )}
        </div>
      )}

      {canConfigure && (
        <div className="grid sm:grid-cols-3 gap-2 items-end">
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Padrão de treino</span>
            <select className="w-full h-9 bg-background border border-input px-2 text-sm" value={pattern} onChange={(e) => setPattern(e.target.value as CyclePattern)}>
              {(Object.keys(PATTERN_LABEL) as CyclePattern[]).map((p) => <option key={p} value={p}>{PATTERN_LABEL[p]}</option>)}
            </select>
          </label>
          {pattern !== "semana" && (
            <label className="text-xs space-y-1">
              <span className="text-muted-foreground">Data de início do ciclo</span>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
          )}
          {pattern === "custom" && (
            <label className="text-xs space-y-1 sm:col-span-3">
              <span className="text-muted-foreground">Sequência (ex: treino-treino-folga-treino-folga)</span>
              <Input value={custom} onChange={(e) => setCustom(e.target.value)} />
            </label>
          )}
          {pattern !== "semana" && (
            <label className="text-xs space-y-1">
              <span className="text-muted-foreground">Tipo de folga</span>
              <select className="w-full h-9 bg-background border border-input px-2 text-sm" value={restType} onChange={(e) => setRestType(e.target.value as RestType)}>
                {(Object.keys(REST_TYPE_LABEL) as RestType[]).map((r) => <option key={r} value={r}>{REST_TYPE_LABEL[r]}</option>)}
              </select>
            </label>
          )}
          {pattern !== "semana" && restType === "sessao_leve" && (
            <label className="text-xs space-y-1">
              <span className="text-muted-foreground">Grupo prioritário</span>
              <Input value={priority} placeholder="ex: Costas" onChange={(e) => setPriority(e.target.value)} />
            </label>
          )}
          <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar escala"}</Button>
        </div>
      )}

      {c.config && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Ajuste manual de um dia (o ciclo recalcula a partir dele)</p>
          <div className="flex flex-wrap gap-2">
            <Input type="date" className="w-auto" value={adjDate} onChange={(e) => setAdjDate(e.target.value)} />
            <Button variant="outline" onClick={() => c.addAdjustment(adjDate, "folga_extra")}>Folga extra</Button>
            <Button variant="outline" onClick={() => c.addAdjustment(adjDate, "treino_adiantado")}>Treino adiantado</Button>
          </div>
          {c.adjustments.length > 0 && (
            <div>
              <p className="text-xs font-semibold mt-2">Histórico de ajustes</p>
              <ul className="text-xs divide-y divide-border/40">
                {c.adjustments.map((a) => (
                  <li key={a.id} className="flex justify-between py-1.5">
                    <span>{fmt(a.adjust_date)} · {a.kind === "folga_extra" ? "Folga extra" : "Treino adiantado"}
                      <span className="text-muted-foreground"> · {a.created_by === athleteUserId ? "pelo aluno" : "pelo coach"} em {new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
                    </span>
                    <button className="text-destructive" onClick={() => c.removeAdjustment(a.id)}>remover</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Linha compacta para o painel do coach. */
export function TrainingCycleSummary({ athleteUserId }: { athleteUserId: string }) {
  const c = useTrainingCycle(athleteUserId);
  if (c.loading || !c.config) return null;
  const next = c.next7?.find((d) => d.isTraining);
  return (
    <p className="text-[11px] text-muted-foreground">
      Escala {c.config.pattern === "custom" ? "personalizada" : c.config.pattern}
      {next ? ` · próximo: ${c.dayLabel(next.workoutIndex)} (${fmt(next.date)})` : ""}
    </p>
  );
}
