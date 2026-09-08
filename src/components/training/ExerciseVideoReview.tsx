import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, Video, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exerciseKey } from "@/lib/exerciseGuide";
import {
  listarMapeamentos,
  buscarSugestoes,
  salvarMapeamento,
  termoSugerido,
  type ExerciseSuggestion,
  type VideoMappingRow,
} from "@/lib/exerciseVideoMap";
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
  const [sugestoes, setSugestoes] = useState<Record<string, ExerciseSuggestion | null>>({});
  const [aprovando, setAprovando] = useState<string | null>(null);

  const carregar = () => {
    if (!coachId || !nomes.length) return;
    listarMapeamentos(coachId, nomes.map(exerciseKey))
      .then(setMap)
      .catch(() => {});
  };

  useEffect(carregar, [coachId, nomes.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sugestões automáticas (apenas visão do coach; nunca vão para o cliente sem aprovação).
  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      for (const n of nomes) {
        if (map[exerciseKey(n)]?.gif_verified) continue;
        if (n in sugestoes) continue;
        const lista = await buscarSugestoes(termoSugerido(n));
        if (!alive) return;
        setSugestoes((prev) => ({ ...prev, [n]: lista[0] || null }));
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, nomes.join("|"), Object.keys(map).length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!coachId || !nomes.length) return null;

  const pendentes = nomes.filter((n) => !map[exerciseKey(n)]?.gif_verified);
  const vinculados = nomes.length - pendentes.length;
  const atual = queue[0];

  const aprovar = async (nome: string, s: ExerciseSuggestion) => {
    setAprovando(nome);
    try {
      const row = await salvarMapeamento({
        coachId,
        exerciseNamePt: nome,
        exerciseNameEn: s.nome,
        exercisedbId: s.id,
        gifUrl: s.gifUrl,
        customVideoUrl: null,
      });
      if (row) setMap((prev) => ({ ...prev, [exerciseKey(nome)]: row }));
      toast.success("GIF aprovado. Já aparece para o cliente.");
    } catch (e) {
      toast.error((e as Error).message || "Não foi possível aprovar.");
    } finally {
      setAprovando(null);
    }
  };

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
            const verificado = m?.gif_verified === true;
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: TEXT }}>
                {verificado ? (
                  <CheckCircle2 style={{ width: 14, height: 14, color: TEAL, flexShrink: 0 }} />
                ) : (
                  <AlertTriangle style={{ width: 14, height: 14, color: AMBER, flexShrink: 0 }} />
                )}
                <span style={{ flex: 1, minWidth: 0 }}>{n}</span>
                <span style={{ fontSize: 11, color: DIM }}>
                  {verificado ? (m.custom_video_url ? "seu vídeo · verificado" : `${m.exercise_name_en || "GIF"} · verificado`) : "revisar"}
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
                    color: verificado ? DIM : AMBER,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  {verificado ? "Trocar" : "Revisar"}
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
              Revisar pendentes ({pendentes.length})
            </button>
          )}
          <div style={{ fontSize: 11, color: DIM, marginTop: 2 }}>
            O cliente só vê GIFs verificados. Os demais aparecem apenas com o guia em texto.
          </div>
        </div>
      )}

      {atual && (
        <ExerciseVideoLinker
          exerciseName={atual}
          coachId={coachId}
          current={map[exerciseKey(atual)] || null}
          onSaved={(row) => setMap((prev) => {
            const next = { ...prev };
            if (row) next[exerciseKey(atual)] = row;
            else delete next[exerciseKey(atual)];
            return next;
          })}
          onClose={() => setQueue((q) => q.slice(1))}
        />
      )}
    </div>
  );
}
