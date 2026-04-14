import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Tag, FileText, Microscope, BookOpen, Loader2, ChevronDown, ChevronUp, ExternalLink, Copy, Search, FileDown, Dumbbell, Clock, Target, Shield, Flame, TrendingUp, Brain, Award, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { exportTrainingPDF } from "@/lib/trainingPdfExport";
import { motion, AnimatePresence } from "framer-motion";

interface SavedItem {
  id: string;
  tipo: string;
  titulo: string | null;
  conteudo: any;
  tags: string[];
  created_at: string;
}

const TIPO_ICON: Record<string, any> = {
  resposta: Microscope,
  protocolo: BookOpen,
  estudo: FileText,
  pesquisa: Search,
  coach_resposta: Microscope,
  elite_protocolo: Microscope,
  protocolo_treino: Dumbbell,
};

const TIPO_LABEL: Record<string, string> = {
  resposta: "Resposta APEX",
  protocolo: "Protocolo",
  estudo: "Estudo",
  pesquisa: "Pesquisa",
  coach_resposta: "Coach Mode",
  elite_protocolo: "APEX Elite",
  protocolo_treino: "TrainingON",
};

/* ── Design tokens for training view ── */
const BG_T = "#060a06";
const SURFACE_T = "#0c120c";
const SURFACE2_T = "#111a11";
const BORDER_T = "rgba(74,222,128,0.1)";
const BORDER_ACTIVE_T = "rgba(74,222,128,0.35)";
const GREEN_T = "#4ade80";
const GREEN_DIM_T = "rgba(74,222,128,0.08)";
const TEXT_T = "#f0fdf4";
const TEXT_DIM_T = "#94a3b8";
const TEXT_MUTED_T = "#64748b";
const FONT_T = "'Space Grotesk', sans-serif";

const hasMeaningfulValueT = (value: unknown) => {
  if (value === undefined || value === null) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized !== "" && normalized !== "undefined" && normalized !== "null";
};

const sanitizeRenderedTextT = (value: unknown, fallback: string) => {
  if (!hasMeaningfulValueT(value)) return fallback;

  const cleaned = String(value)
    .replace(/\bundefined\b/gi, "")
    .replace(/\bnull\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned || fallback;
};

const joinDefinedPartsT = (parts: Array<string | false | null | undefined>, separator = " • ") => (
  parts.filter(Boolean).join(separator)
);

const formatEffortT = (data: { rpe?: unknown; rir?: unknown }, fallback = "intensidade guiada") => {
  if (hasMeaningfulValueT(data.rpe)) return `RPE ${sanitizeRenderedTextT(data.rpe, "")}`;
  if (hasMeaningfulValueT(data.rir)) return `RIR ${sanitizeRenderedTextT(data.rir, "")}`;
  return fallback;
};

const formatSetLabelT = (prefix: string, sets: unknown, fallback: string) => (
  hasMeaningfulValueT(sets) ? `${prefix} ${sanitizeRenderedTextT(sets, "")}${Number(sets) > 1 ? "s" : ""}` : fallback
);

/* ── Training Protocol Viewer ── */
const TrainingProtocolViewer = ({ item, onExportPDF }: { item: SavedItem; onExportPDF: () => void }) => {
  const data = item.conteudo?.protocol;
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [expandedEx, setExpandedEx] = useState<string | null>(null);

  if (!data) return <p className="text-xs text-muted-foreground">Sem dados do protocolo</p>;

  const parsed = typeof data === "string" ? (() => { try { return JSON.parse(data); } catch { return null; } })() : data;
  if (!parsed) return <p className="text-xs text-muted-foreground whitespace-pre-wrap">{String(data).slice(0, 500)}</p>;

  const ov = parsed.block_overview;
  const pp = parsed.phase_plan;
  const days = parsed.training_days || [];
  const alerts = parsed.improvement_alerts || [];

  return (
    <div className="space-y-3">
      {/* Block Overview */}
      {ov && (
        <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${SURFACE_T} 0%, ${SURFACE2_T} 100%)`, border: `1px solid ${BORDER_ACTIVE_T}` }}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl" style={{ background: "rgba(74,222,128,0.06)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-3.5 h-3.5" style={{ color: GREEN_T }} />
              <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: GREEN_T }}>Protocolo de Elite</span>
            </div>
            <h3 className="text-sm font-black mb-1" style={{ color: TEXT_T, fontFamily: FONT_T }}>{ov.title}</h3>
            {ov.split_justification && <p className="text-[10px] leading-relaxed" style={{ color: TEXT_DIM_T }}>{ov.split_justification}</p>}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <MiniStat label="Duração" value={`${ov.duration_weeks} sem`} />
              <MiniStat label="Divisão" value={ov.split_type} />
              <MiniStat label="Deload" value={`Sem ${ov.deload_week}`} />
            </div>
          </div>
        </div>
      )}

      {/* Progression Model */}
      {ov?.progression_model && (
        <div className="rounded-xl p-3" style={{ background: SURFACE_T, border: `1px solid ${BORDER_T}` }}>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3 h-3" style={{ color: GREEN_T }} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: GREEN_T }}>Progressão</span>
          </div>
          <p className="text-[10px]" style={{ color: TEXT_DIM_T }}>{ov.progression_model}</p>
        </div>
      )}

      {/* Muscle Priorities */}
      {ov?.muscle_priorities?.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: SURFACE_T, border: `1px solid ${BORDER_T}` }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Flame className="w-3 h-3" style={{ color: "#f97316" }} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: TEXT_T }}>Prioridade Muscular</span>
          </div>
          <div className="space-y-1.5">
            {ov.muscle_priorities.map((mp: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: mp.priority === "alta" ? "#f97316" : GREEN_T }} />
                <span className="text-[10px] font-semibold flex-1" style={{ color: TEXT_T }}>{mp.muscle}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: GREEN_DIM_T, color: GREEN_T }}>{mp.weekly_sets} s/sem</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coach Notes */}
      {ov?.coach_notes && (
        <div className="rounded-xl p-3" style={{ background: "rgba(74,222,128,0.04)", borderLeft: `3px solid ${GREEN_T}` }}>
          <div className="flex items-center gap-1 mb-1">
            <Brain className="w-3 h-3" style={{ color: GREEN_T }} />
            <span className="text-[9px] font-bold" style={{ color: GREEN_T }}>Observações</span>
          </div>
          <p className="text-[10px] leading-relaxed" style={{ color: TEXT_DIM_T }}>{ov.coach_notes}</p>
        </div>
      )}

      {/* Training Days */}
      {days.map((day: any, idx: number) => (
        <div key={idx} className="rounded-xl overflow-hidden" style={{ background: SURFACE_T, border: `1px solid ${expandedDay === idx ? BORDER_ACTIVE_T : BORDER_T}` }}>
          <button onClick={() => setExpandedDay(expandedDay === idx ? null : idx)} className="w-full p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px]" style={{ background: GREEN_DIM_T, color: GREEN_T, fontFamily: FONT_T }}>
                D{day.day_number || idx + 1}
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold" style={{ color: TEXT_T }}>{day.session_title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {day.estimated_duration && <span className="text-[8px] flex items-center gap-0.5" style={{ color: TEXT_MUTED_T }}><Clock className="w-2.5 h-2.5" />{day.estimated_duration}</span>}
                  {day.focus_muscles?.slice(0, 3).map((m: string, i: number) => (
                    <span key={i} className="text-[7px] px-1 py-0.5 rounded-full" style={{ background: GREEN_DIM_T, color: GREEN_T }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
            {expandedDay === idx ? <ChevronUp className="w-3.5 h-3.5" style={{ color: TEXT_MUTED_T }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: TEXT_MUTED_T }} />}
          </button>
          <AnimatePresence>
            {expandedDay === idx && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="px-3 pb-3 space-y-2">
                  {day.warmup?.length > 0 && (
                    <div className="rounded-lg p-2" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.1)" }}>
                      <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: "#60a5fa" }}>🔥 WARM-UP</span>
                      <div className="mt-1 space-y-1">
                        {day.warmup.map((w: any, i: number) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-[10px]" style={{ color: TEXT_T }}>{w.name}</span>
                            <span className="text-[9px]" style={{ color: TEXT_DIM_T }}>{w.sets}×{w.reps}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {day.exercises?.map((ex: any, i: number) => {
                    const exKey = `${idx}-${i}`;
                    const struct = ex.structure || {};
                    const isExpanded = expandedEx === exKey;
                    const safeExerciseName = sanitizeRenderedTextT(ex.name, "Exercício prescrito");
                    const safeMuscleTarget = sanitizeRenderedTextT(ex.muscle_target, "Alvo muscular ajustado");
                    const safeExecutionCues = hasMeaningfulValueT(ex.execution_cues)
                      ? sanitizeRenderedTextT(ex.execution_cues, "Execução guiada pelo coach.")
                      : "";
                    const safeWhyThisExercise = hasMeaningfulValueT(ex.why_this_exercise)
                      ? sanitizeRenderedTextT(ex.why_this_exercise, "Escolha técnica ajustada ao bloco.")
                      : "";

                    return (
                      <div key={i} className="rounded-lg overflow-hidden" style={{ background: SURFACE2_T, border: `1px solid ${BORDER_T}` }}>
                        <button onClick={() => setExpandedEx(isExpanded ? null : exKey)} className="w-full p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black" style={{ background: GREEN_DIM_T, color: GREEN_T }}>{ex.order || i + 1}</div>
                            <div className="text-left">
                              <p className="text-[10px] font-bold" style={{ color: TEXT_T }}>{safeExerciseName}</p>
                              <p className="text-[8px]" style={{ color: TEXT_MUTED_T }}>{safeMuscleTarget}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {struct.top_set && <span className="text-[7px] px-1 py-0.5 rounded-full font-bold" style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}>TOP</span>}
                            {isExpanded ? <ChevronUp className="w-3 h-3" style={{ color: TEXT_MUTED_T }} /> : <ChevronDown className="w-3 h-3" style={{ color: TEXT_MUTED_T }} />}
                          </div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                              <div className="px-2.5 pb-2.5 space-y-1.5">
                                {struct.feeder_sets?.map((f: any, fi: number) => (
                                  <SetBadge
                                    key={fi}
                                    label={sanitizeRenderedTextT(f.set_label, `Feeder ${fi + 1}`)}
                                    detail={joinDefinedPartsT([
                                      hasMeaningfulValueT(f.load_percent) ? sanitizeRenderedTextT(f.load_percent, "") : "carga guiada",
                                      hasMeaningfulValueT(f.reps) ? sanitizeRenderedTextT(f.reps, "") : "reps ajustadas",
                                    ], " × ")}
                                    color="#818cf8"
                                  />
                                ))}
                                {struct.top_set && (
                                  <SetBadge
                                    label="Top Set"
                                    detail={joinDefinedPartsT([
                                      `${sanitizeRenderedTextT(struct.top_set.sets, "1")}×${sanitizeRenderedTextT(struct.top_set.reps, "6-10")}`,
                                      formatEffortT(struct.top_set, "esforço principal guiado"),
                                    ], " ")}
                                    color="#f97316"
                                    rest={struct.top_set.rest}
                                  />
                                )}
                                {struct.backoff_sets && (
                                  <SetBadge
                                    label={formatSetLabelT("Back-off", struct.backoff_sets.sets, "Back-off ajustado")}
                                    detail={joinDefinedPartsT([
                                      hasMeaningfulValueT(struct.backoff_sets.reps) ? sanitizeRenderedTextT(struct.backoff_sets.reps, "") : "faixa ajustada",
                                      hasMeaningfulValueT(struct.backoff_sets.load_reduction)
                                        ? `(${sanitizeRenderedTextT(struct.backoff_sets.load_reduction, "")})`
                                        : "redução guiada",
                                    ], " ")}
                                    color="#fbbf24"
                                    rest={struct.backoff_sets.rest}
                                  />
                                )}
                                {struct.work_sets && (
                                  <SetBadge
                                    label={formatSetLabelT("Trabalho", struct.work_sets.sets, "Trabalho ajustado")}
                                    detail={joinDefinedPartsT([
                                      hasMeaningfulValueT(struct.work_sets.reps) ? sanitizeRenderedTextT(struct.work_sets.reps, "") : "faixa de reps ajustada",
                                      formatEffortT(struct.work_sets),
                                    ])}
                                    color={GREEN_T}
                                    rest={struct.work_sets.rest}
                                  />
                                )}
                                {safeExecutionCues && (
                                  <div className="rounded-lg p-2" style={{ background: "rgba(74,222,128,0.04)" }}>
                                    <span className="text-[7px] font-bold" style={{ color: GREEN_T }}>EXECUÇÃO</span>
                                    <p className="text-[9px] mt-0.5" style={{ color: TEXT_DIM_T }}>{safeExecutionCues}</p>
                                  </div>
                                )}
                                {safeWhyThisExercise && (
                                  <div className="rounded-lg p-2" style={{ background: "rgba(139,92,246,0.04)" }}>
                                    <span className="text-[7px] font-bold" style={{ color: "#a78bfa" }}>POR QUÊ?</span>
                                    <p className="text-[9px] mt-0.5" style={{ color: TEXT_DIM_T }}>{safeWhyThisExercise}</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                  {day.session_notes && (
                    <div className="rounded-lg p-2" style={{ background: "rgba(74,222,128,0.04)", borderLeft: `2px solid ${GREEN_T}` }}>
                      <p className="text-[9px]" style={{ color: TEXT_DIM_T }}>{day.session_notes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" style={{ color: "#fbbf24" }} />
            <span className="text-[9px] font-bold uppercase" style={{ color: "#fbbf24" }}>Alertas</span>
          </div>
          {alerts.map((a: any, i: number) => (
            <div key={i} className="rounded-lg p-2" style={{ background: a.severity === "alta" ? "rgba(239,68,68,0.06)" : "rgba(251,191,36,0.06)", border: `1px solid ${a.severity === "alta" ? "rgba(239,68,68,0.15)" : "rgba(251,191,36,0.15)"}` }}>
              <span className="text-[9px] font-bold" style={{ color: a.severity === "alta" ? "#ef4444" : "#fbbf24" }}>{a.area}</span>
              <p className="text-[9px]" style={{ color: TEXT_DIM_T }}>{a.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* PDF Export */}
      <button onClick={onExportPDF} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.01]" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}>
        <FileDown className="w-4 h-4" /> Exportar PDF Premium
      </button>
    </div>
  );
};

const SetBadge = ({ label, detail, color, rest }: { label: string; detail: string; color: string; rest?: string }) => {
  const safeLabel = sanitizeRenderedTextT(label, "Estrutura ajustada");
  const safeDetail = sanitizeRenderedTextT(detail, "Parâmetros autoajustados");
  const safeRest = hasMeaningfulValueT(rest) ? sanitizeRenderedTextT(rest, "") : "";

  return (
    <div className="rounded-lg p-2" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold" style={{ color }}>{safeLabel}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono font-bold" style={{ color: TEXT_T }}>{safeDetail}</span>
          {safeRest && <span className="text-[8px] px-1 py-0.5 rounded" style={{ background: `${color}10`, color: TEXT_MUTED_T }}>⏱ {safeRest}</span>}
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg p-2 text-center" style={{ background: SURFACE2_T }}>
    <p className="text-[7px] font-bold tracking-wider uppercase" style={{ color: TEXT_MUTED_T }}>{label}</p>
    <p className="text-[10px] font-bold mt-0.5" style={{ color: TEXT_T }}>{value}</p>
  </div>
);

const NotebookCard = ({ item, onDelete, onCopy }: { item: SavedItem; onDelete: (id: string) => void; onCopy: (item: SavedItem) => void }) => {
  const [open, setOpen] = useState(false);
  const Icon = TIPO_ICON[item.tipo] || FileText;
  const isTraining = item.tipo === "protocolo_treino";
  const hasAnswer = !!item.conteudo?.answer;
  const hasSummary = !!item.conteudo?.summary;
  const hasQuestion = !!item.conteudo?.question;
  const hasFontes = item.conteudo?.fontes?.length > 0;
  const hasSource = !!item.conteudo?.source;
  const badge = item.conteudo?.badge;

  const handleExportPDF = () => {
    const protData = item.conteudo?.protocol;
    if (!protData) return;
    const parsed = typeof protData === "string" ? (() => { try { return JSON.parse(protData); } catch { return null; } })() : protData;
    if (!parsed) return;
    exportTrainingPDF(parsed, item.conteudo?.clientName || "Cliente", {
      phase: item.conteudo?.phase || "",
      level: item.conteudo?.level || "",
      weeks: item.conteudo?.weeks || "",
      days: item.conteudo?.days || "",
    });
    toast.success("PDF premium exportado!");
  };

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardHeader className="cursor-pointer py-3 px-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold truncate">{item.titulo || "Sem título"}</CardTitle>
                <Badge variant="outline" className={`text-[9px] flex-shrink-0 ${isTraining ? "text-emerald-400 border-emerald-400/30" : "text-primary border-primary/30"}`}>
                  {TIPO_LABEL[item.tipo] || item.tipo}
                </Badge>
                {badge && (
                  <Badge variant="outline" className={`text-[9px] flex-shrink-0 ${
                    badge === "favorable" ? "text-accent border-accent/30" :
                    badge === "refutes" ? "text-destructive border-destructive/30" :
                    "text-primary border-primary/30"
                  }`}>
                    {badge === "favorable" ? "✅" : badge === "refutes" ? "❌" : "⚠️"}
                  </Badge>
                )}
              </div>
              {!open && (
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  {isTraining
                    ? `${item.conteudo?.clientName || ""} · ${item.conteudo?.phase || ""}`
                    : (item.conteudo?.summary || (item.conteudo?.answer || "").slice(0, 100))}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[9px] text-muted-foreground/50">
              {new Date(item.created_at).toLocaleDateString("pt-BR")}
            </span>
            {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 px-4 pb-4 text-xs text-muted-foreground leading-relaxed space-y-3">
          {/* Training Protocol */}
          {isTraining ? (
            <TrainingProtocolViewer item={item} onExportPDF={handleExportPDF} />
          ) : (
            <>
              {hasQuestion && (
                <Card className="bg-secondary/30 border-border p-3">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Pergunta</p>
                  <p className="text-xs text-foreground">{item.conteudo.question}</p>
                </Card>
              )}
              {hasAnswer && (
                <div className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed [&_strong]:text-primary [&_h3]:text-primary [&_h3]:text-xs [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-4">
                  <ReactMarkdown>{item.conteudo.answer}</ReactMarkdown>
                </div>
              )}
              {hasSummary && !hasAnswer && (
                <p className="text-xs text-foreground leading-relaxed">{item.conteudo.summary}</p>
              )}
              {hasFontes && (
                <div className="space-y-1 pt-2 border-t border-border">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">{item.conteudo.fontes.length} fontes</p>
                  {item.conteudo.fontes.slice(0, 5).map((f: string, i: number) => (
                    <a key={i} href={f} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary truncate">
                      <ExternalLink className="w-3 h-3 flex-shrink-0" /> {f}
                    </a>
                  ))}
                </div>
              )}
              {hasSource && !hasFontes && (
                <a href={item.conteudo.source} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary">
                  <ExternalLink className="w-3 h-3" /> Ver estudo original
                </a>
              )}
            </>
          )}

          {/* Tags */}
          {(item.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.slice(0, 5).map(tag => (
                <Badge key={tag} variant="secondary" className="text-[9px]">
                  <Tag className="w-2.5 h-2.5 mr-0.5" /> {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => onCopy(item)}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors">
              <Copy className="w-3 h-3" /> Copiar
            </button>
            <button onClick={() => onDelete(item.id)}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-3 h-3" /> Remover
            </button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const LabNotebook = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchItems = async () => {
    if (!user) return;
    let q = supabase
      .from("lab_saved_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (filter) q = q.contains("tags", [filter]);
    const { data } = await q;
    setItems((data as SavedItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [user, filter]);

  const deleteItem = async (id: string) => {
    await supabase.from("lab_saved_items").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Removido do caderno");
  };

  const copyContent = (item: SavedItem) => {
    const text = item.conteudo?.answer || item.conteudo?.summary || item.conteudo?.question || "";
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const allTags = [...new Set(items.flatMap(i => i.tags || []))];

  const filteredItems = searchQuery
    ? items.filter(i =>
        (i.titulo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(i.conteudo || {}).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      {items.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar no caderno..."
            className="pl-9 h-9 text-xs bg-card border-border"
          />
        </div>
      )}

      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter(null)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-colors ${
              !filter ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/20"
            }`}>
            Todos ({items.length})
          </button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setFilter(tag)}
              className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-colors ${
                filter === tag ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/20"
              }`}>
              <Tag className="w-2.5 h-2.5 inline mr-1" /> {tag}
            </button>
          ))}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "Nenhum resultado encontrado" : "Seu caderno está vazio"}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {searchQuery ? "Tente outra busca" : "Salve respostas do APEX, estudos e protocolos para consultar depois."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map(item => (
            <NotebookCard key={item.id} item={item} onDelete={deleteItem} onCopy={copyContent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LabNotebook;
