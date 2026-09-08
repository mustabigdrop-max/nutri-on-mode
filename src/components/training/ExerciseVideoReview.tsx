import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, Video } from "lucide-react";
import { exerciseKey } from "@/lib/exerciseGuide";
import { listarMapeamentos, type VideoMappingRow } from "@/lib/exerciseVideoMap";
import { ExerciseVideoLinker } from "@/components/training/ExerciseVideoLinker";

const AMBER = "#EF9F27";
const TEAL = "#5DCAA5";
const TEXT = "#e8f0ff";
const DIM = "#9aa5b8";
const BORDER = "rgba(255,255,255,0.10)";

/** Revisão em lote dos vídeos de um dia de treino (visão do coach). */
export function ExerciseVideoReview({
  title,
  exercises,
  coachId,
}: {
  title: string;
  exercises: string[];
  coachId: string;
}) {
  const nomes = useMemo(
    () => Array.from(new Set(exercises.filter(Boolean).map((n) => n.trim()))),
    [exercises],
  );
  const [map, setMap] = useState<Record<string, VideoMappingRow>>({});
  const [queue, setQueue] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const carregar = () => {
    if (!coachId || !nomes.length) return;
    listarMapeamentos(coachId, nomes.map(exerciseKey))
      .then(setMap)
      .catch(() => {});
  };

  useEffect(carregar, [coachId, nomes.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!coachId || !nomes.length) return null;

  const pendentes = nomes.filter((n) => !map[exerciseKey(n)]);
  const vinculados = nomes.length - pendentes.length;
  const atual = queue[0];

  return (
    <div
      style={{
        border: `1px solid ${pendentes.length ? "rgba(239,159,39,0.35)" : "rgba(93,202,165,0.30)"}`,
        background: "rgba(255,255,255,0.03)",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          textAlign: "left",
          padding: 0,
        }}
      >
        <Video style={{ width: 14, height: 14, color: AMBER }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>Revisar vídeos — {title}</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: DIM }}>
          {nomes.length} exercícios · {vinculados} com vídeo · {pendentes.length} pendentes
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
          {nomes.map((n) => {
            const m = map[exerciseKey(n)];
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: TEXT }}>
                {m ? (
                  <CheckCircle2 style={{ width: 14, height: 14, color: TEAL, flexShrink: 0 }} />
                ) : (
                  <AlertTriangle style={{ width: 14, height: 14, color: AMBER, flexShrink: 0 }} />
                )}
                <span style={{ flex: 1, minWidth: 0 }}>{n}</span>
                <span style={{ fontSize: 11, color: DIM }}>
                  {m ? (m.custom_video_url ? "seu vídeo" : m.exercise_name_en || "vinculado") : "—"}
                </span>
                <button
                  type="button"
                  onClick={() => setQueue([n])}
                  style={{
                    minHeight: 32,
                    padding: "0 10px",
                    borderRadius: 6,
                    border: `1px solid ${BORDER}`,
                    background: "transparent",
                    color: m ? DIM : AMBER,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  {m ? "Trocar" : "Vincular"}
                </button>
              </div>
            );
          })}

          {pendentes.length > 0 && (
            <button
              type="button"
              onClick={() => setQueue(pendentes)}
              style={{
                marginTop: 6,
                minHeight: 40,
                borderRadius: 8,
                border: "none",
                background: AMBER,
                color: "#0A0A0A",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Vincular pendentes ({pendentes.length})
            </button>
          )}
          <div style={{ fontSize: 11, color: DIM, marginTop: 2 }}>
            Exercício sem vídeo aprovado aparece para o cliente apenas com o guia em texto.
          </div>
        </div>
      )}

      {atual && (
        <ExerciseVideoLinker
          exerciseName={atual}
          coachId={coachId}
          current={map[exerciseKey(atual)] || null}
          onSaved={(row) => {
            if (row) setMap((prev) => ({ ...prev, [exerciseKey(atual)]: row }));
          }}
          onClose={() => setQueue((q) => q.slice(1))}
        />
      )}
    </div>
  );
}
