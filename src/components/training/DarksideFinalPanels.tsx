import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { findExerciseProfile } from "@/utils/exerciseProfiles";
import { getSMHProtocol } from "@/utils/smhProtocol";
import {
  SupercompWindow,
  SupercompPhase,
  fetchSupercompWindows,
} from "@/utils/supercompensation";
import { RBEStatus, fetchRBEStatuses } from "@/utils/repeatedBoutEffect";

/* ─────────────── SMH PANEL (per exercise, ALONGADO only) ─────────────── */
export function SMHPanel({ exerciseName }: { exerciseName: string }) {
  const profile = findExerciseProfile(exerciseName);
  const protocol = getSMHProtocol(exerciseName);
  const [open, setOpen] = useState(false);
  if (!profile || profile.perfil !== "ALONGADO" || !protocol) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 10,
          fontWeight: 600,
          color: "#34D399",
          background: "rgba(52,211,153,0.08)",
          border: "0.5px solid rgba(52,211,153,0.2)",
          borderRadius: 8,
          padding: "3px 9px",
          cursor: "pointer",
        }}
      >
        ↕ SMH Protocol {open ? "▲" : "▼"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                marginTop: 8,
                padding: "10px 12px",
                background: "rgba(52,211,153,0.05)",
                border: "0.5px solid rgba(52,211,153,0.15)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {[
                  { label: "Cadência", value: protocol.cadencia },
                  { label: "Pausa", value: protocol.tempo_pausa },
                  { label: "Carga", value: `${protocol.carga_pct}% vs normal` },
                  { label: "RIR", value: `RIR ${protocol.rir_ideal}` },
                ].map((f, i) => (
                  <div key={i}>
                    <p
                      style={{
                        fontSize: 9,
                        color: "rgba(255,255,255,0.3)",
                        margin: "0 0 2px",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {f.label}
                    </p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#34D399", margin: 0 }}>
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
              <p
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.55)",
                  margin: "0 0 4px",
                  lineHeight: 1.5,
                }}
              >
                → {protocol.foco_tecnico}
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "rgba(52,211,153,0.6)",
                  margin: "0 0 4px",
                  lineHeight: 1.5,
                }}
              >
                ↕ {protocol.amplitude}
              </p>
              {protocol.aviso_risco && (
                <p
                  style={{
                    fontSize: 9,
                    color: "rgba(251,191,36,0.7)",
                    margin: "4px 0 0",
                    fontStyle: "italic",
                  }}
                >
                  ⚠ {protocol.aviso_risco}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────── SUPERCOMPENSATION CHART (session-level) ─────────────── */
const PHASE_CFG: Record<SupercompPhase, { cor: string; label: string }> = {
  ESTIMULO: { cor: "#38BDF8", label: "Estímulo" },
  FADIGA: { cor: "#EF4444", label: "Fadiga" },
  RECUPERACAO: { cor: "#FBBF24", label: "Recuperação" },
  SUPERCOMPENSACAO: { cor: "#34D399", label: "Supercomp ★" },
  DETRAINING: { cor: "rgba(255,255,255,0.3)", label: "Detraining" },
};

export function SupercompPanel({
  athleteId,
  muscleGroups,
}: {
  athleteId: string | null | undefined;
  muscleGroups: string[];
}) {
  const [open, setOpen] = useState(false);
  const [windows, setWindows] = useState<SupercompWindow[]>([]);

  useEffect(() => {
    if (!athleteId || !muscleGroups.length) return;
    fetchSupercompWindows(athleteId, muscleGroups).then(setWindows);
  }, [athleteId, muscleGroups.join("|")]);

  if (!athleteId || !windows.length) return null;
  const prontos = windows.filter((w) => w.pronto);

  return (
    <div
      style={{
        marginBottom: 12,
        padding: "10px 12px",
        background: "rgba(52,211,153,0.04)",
        border: "0.5px solid rgba(52,211,153,0.15)",
        borderRadius: 10,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "#34D399",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Supercompensação · {prontos.length} pronto(s)
        </span>
        <span style={{ fontSize: 10, color: "#34D399" }}>{open ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: 10 }}>
              {prontos.length > 0 && (
                <div
                  style={{
                    marginBottom: 10,
                    padding: "8px 10px",
                    background: "rgba(52,211,153,0.07)",
                    border: "0.5px solid rgba(52,211,153,0.25)",
                    borderRadius: 8,
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#34D399",
                      margin: "0 0 5px",
                    }}
                  >
                    ★ Janela aberta — priorizar volume
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {prontos.map((w) => (
                      <span
                        key={w.musculo}
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          background: "rgba(52,211,153,0.15)",
                          border: "0.5px solid rgba(52,211,153,0.3)",
                          borderRadius: 8,
                          color: "#34D399",
                          fontWeight: 600,
                        }}
                      >
                        {w.musculo}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {windows.map((w) => {
                  const cfg = PHASE_CFG[w.fase];
                  const pct = Math.min(100, (w.diasDesde / Math.max(w.janela_fim, 1)) * 100);
                  return (
                    <div key={w.musculo}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 3,
                        }}
                      >
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                          {w.musculo}
                        </span>
                        <span style={{ fontSize: 10, color: cfg.cor, fontWeight: 500 }}>
                          {cfg.label} · dia {w.diasDesde}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 5,
                          borderRadius: 3,
                          background: "rgba(255,255,255,0.06)",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: `${(w.janela_inicio / Math.max(w.janela_fim, 1)) * 100}%`,
                            width: `${
                              ((w.janela_fim - w.janela_inicio) / Math.max(w.janela_fim, 1)) * 100
                            }%`,
                            height: "100%",
                            background: "rgba(52,211,153,0.2)",
                            borderRadius: 3,
                          }}
                        />
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(pct, 100)}%`,
                            background: cfg.cor,
                            borderRadius: 3,
                            transition: "width .5s",
                            position: "relative",
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontSize: 9,
                          color: "rgba(255,255,255,0.3)",
                          margin: "2px 0 0",
                          fontStyle: "italic",
                        }}
                      >
                        {w.descricao}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────── RBE BADGE + PANEL ─────────────── */
export function RBEBadge({ status }: { status: RBEStatus }) {
  if (status.boutNumber <= 2) return null;
  const cor = status.alerta ? "#FBBF24" : "rgba(255,255,255,0.3)";
  return (
    <span
      title={status.recomendacao}
      style={{
        fontSize: 9,
        fontWeight: 500,
        color: cor,
        background: `${cor}12`,
        border: `0.5px solid ${cor}30`,
        borderRadius: 6,
        padding: "1px 6px",
      }}
    >
      RBE ×{status.boutNumber}
      {status.alerta && " ⚑"}
    </span>
  );
}

export function RBEPanel({
  athleteId,
  exercises,
  mesoStart,
}: {
  athleteId: string | null | undefined;
  exercises: Array<{ name?: string; nome?: string }>;
  mesoStart: string;
}) {
  const [open, setOpen] = useState(false);
  const [statuses, setStatuses] = useState<RBEStatus[]>([]);

  useEffect(() => {
    if (!athleteId || !exercises?.length) return;
    fetchRBEStatuses(athleteId, exercises, mesoStart).then(setStatuses);
  }, [athleteId, exercises?.length, mesoStart]);

  const alertas = statuses.filter((s) => s.alerta);
  if (!athleteId || !alertas.length) return null;

  return (
    <div
      style={{
        marginBottom: 12,
        padding: "10px 12px",
        background: "rgba(251,191,36,0.06)",
        border: "0.5px solid rgba(251,191,36,0.2)",
        borderRadius: 10,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#FBBF24",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          ⚑ Repeated Bout Effect · {alertas.length}
        </span>
        <span style={{ fontSize: 10, color: "#FBBF24" }}>{open ? "▲" : "▼"}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: 8 }}>
              {alertas.map((s, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 2,
                    }}
                  >
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                      {s.exercicio}
                    </span>
                    <span style={{ fontSize: 10, color: "#FBBF24" }}>
                      Bout ×{s.boutNumber} · Estímulo {s.stimuloEsperado}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 3,
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${s.stimuloEsperado}%`,
                        background:
                          s.stimuloEsperado >= 70
                            ? "#34D399"
                            : s.stimuloEsperado >= 50
                            ? "#FBBF24"
                            : "#EF4444",
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.35)",
                      margin: "2px 0 0",
                      fontStyle: "italic",
                    }}
                  >
                    {s.recomendacao}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────── Inline RBE badge in exercise header (auto-fetch) ─────────────── */
export function ExerciseRBEBadge({
  athleteId,
  exerciseName,
  mesoStart,
}: {
  athleteId: string | null | undefined;
  exerciseName: string;
  mesoStart: string;
}) {
  const [status, setStatus] = useState<RBEStatus | null>(null);
  useEffect(() => {
    if (!athleteId || !exerciseName) return;
    import("@/utils/repeatedBoutEffect").then(({ getBoutNumber, calcRBEStatus }) => {
      getBoutNumber(athleteId, exerciseName, mesoStart).then((b) => {
        setStatus(calcRBEStatus(exerciseName, b));
      });
    });
  }, [athleteId, exerciseName, mesoStart]);
  if (!status) return null;
  return <RBEBadge status={status} />;
}

/* ─────────────── Prompt instruction helper ─────────────── */
export function buildDarksideFinalInstruction(): string {
  return `
━━━ SOBRECARGA NO ALONGADO (SMH) — OBRIGATÓRIO ━━━
Para exercícios com perfil ALONGADO, prescrever:
- Cadência lenta (3-4s excêntrico, 1-2s de pausa no ponto alongado)
- Amplitude TOTAL no ponto de maior comprimento muscular
- Carga 10-20% menor que a versão convencional
- RIR mínimo 1 (não falhar no ponto alongado)
- Cue técnico explícito mencionando o alongamento e pausa
━━━ FIM SMH ━━━

━━━ SUPERCOMPENSAÇÃO — DIRETRIZ ━━━
Distribuir grupos musculares na semana respeitando janela de recuperação:
- Pernas/costas/glúteo: 48-72h entre sessões
- Peito/ombro/braço: 36-48h entre sessões
- Priorizar volume em grupos com 5-9 dias sem treino (janela aberta)
━━━ FIM SUPERCOMPENSAÇÃO ━━━

━━━ REPEATED BOUT EFFECT (RBE) — DIRETRIZ ━━━
A cada mesociclo VARIAR pelo menos um dos eixos por grupo muscular:
- Perfil de resistência (ALONGADO ↔ ENCURTADO ↔ CONSTANTE)
- Zona de repetição (Z2 ↔ Z3 ↔ Z4)
- Exercício específico (variante equivalente)
Isso evita adaptação que reduz estímulo hipertrófico após 4-6 exposições.
━━━ FIM RBE ━━━
`.trim();
}
