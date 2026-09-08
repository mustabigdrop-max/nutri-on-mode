import { useEffect, useState } from "react";
import { Search, X, Check, Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import {
  buscarSugestoes,
  salvarMapeamento,
  removerMapeamento,
  termoSugerido,
  type ExerciseSuggestion,
  type VideoMappingRow,
} from "@/lib/exerciseVideoMap";

const AMBER = "#EF9F27";
const TEAL = "#5DCAA5";
const TEXT = "#e8f0ff";
const DIM = "#9aa5b8";
const BORDER = "rgba(255,255,255,0.10)";

export function ExerciseVideoLinker({
  exerciseName,
  coachId,
  current,
  onSaved,
  onClose,
}: {
  exerciseName: string;
  coachId: string;
  current?: VideoMappingRow | null;
  onSaved: (row: VideoMappingRow | null) => void;
  onClose: () => void;
}) {
  const [term, setTerm] = useState(termoSugerido(exerciseName));
  const [items, setItems] = useState<ExerciseSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState(current?.custom_video_url || "");

  const run = async (q: string) => {
    setLoading(true);
    try {
      setItems(await buscarSugestoes(q));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run(termoSugerido(exerciseName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseName]);

  const vincular = async (s: ExerciseSuggestion) => {
    setSaving(s.id);
    try {
      const row = await salvarMapeamento({
        coachId,
        exerciseNamePt: exerciseName,
        exerciseNameEn: s.nome,
        exercisedbId: s.id,
        gifUrl: s.gifUrl,
        customVideoUrl: null,
      });
      toast.success("Vídeo vinculado e aprovado.");
      onSaved(row);
      onClose();
    } catch (e) {
      toast.error((e as Error).message || "Não foi possível vincular.");
    } finally {
      setSaving(null);
    }
  };

  const salvarCustom = async () => {
    const url = customUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      toast.error("Informe um link de vídeo válido (https://...).");
      return;
    }
    setSaving("custom");
    try {
      const row = await salvarMapeamento({
        coachId,
        exerciseNamePt: exerciseName,
        exerciseNameEn: current?.exercise_name_en ?? null,
        gifUrl: current?.gif_url ?? null,
        customVideoUrl: url,
      });
      toast.success("Seu vídeo foi vinculado.");
      onSaved(row);
      onClose();
    } catch (e) {
      toast.error((e as Error).message || "Não foi possível salvar o vídeo.");
    } finally {
      setSaving(null);
    }
  };

  const desvincular = async () => {
    try {
      await removerMapeamento(coachId, exerciseName);
      toast.success("Vínculo removido.");
      onSaved(null);
      onClose();
    } catch (e) {
      toast.error((e as Error).message || "Não foi possível remover.");
    }
  };

  return (
    <div
      role="dialog"
      aria-label={`Vincular vídeo para ${exerciseName}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "88vh",
          overflowY: "auto",
          background: "#0A0A0A",
          border: `1px solid ${BORDER}`,
          borderRadius: "14px 14px 0 0",
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.08em", color: TEAL, fontWeight: 700 }}>
              VINCULAR VÍDEO
            </div>
            <div style={{ fontSize: 15, color: TEXT, fontWeight: 700 }}>{exerciseName}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" style={{ background: "none", border: "none", color: DIM, cursor: "pointer" }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run(term)}
            placeholder="ex: front plank"
            style={{
              flex: 1,
              minHeight: 44,
              padding: "0 12px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              color: TEXT,
              fontSize: 15,
            }}
          />
          <button
            type="button"
            onClick={() => run(term)}
            style={{ minHeight: 44, padding: "0 14px", borderRadius: 8, border: "none", background: AMBER, color: "#0A0A0A", fontWeight: 700, cursor: "pointer" }}
          >
            <Search style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: DIM, fontSize: 13, marginTop: 12 }}>
            <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} /> Buscando...
          </div>
        )}

        {!loading && !items.length && (
          <div style={{ color: DIM, fontSize: 13, marginTop: 12 }}>
            Nenhum resultado. Tente outro termo em inglês (ex.: "plank", "lat pulldown").
          </div>
        )}

        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {items.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: 8,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <img
                src={s.gifUrl}
                alt={`Demonstração de ${s.nome}`}
                loading="lazy"
                style={{ width: 88, height: 88, borderRadius: 8, background: "#fff", objectFit: "contain", flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: TEXT, fontWeight: 600 }}>{s.nome}</div>
                <div style={{ fontSize: 11, color: DIM, marginTop: 2 }}>
                  {[s.alvo, s.equipamento].filter(Boolean).join(" · ")}
                </div>
                <button
                  type="button"
                  onClick={() => vincular(s)}
                  disabled={saving === s.id}
                  style={{
                    marginTop: 8,
                    minHeight: 40,
                    padding: "0 12px",
                    borderRadius: 8,
                    border: `1px solid ${TEAL}66`,
                    background: "transparent",
                    color: TEAL,
                    fontSize: 13,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  <Check style={{ width: 14, height: 14 }} /> {saving === s.id ? "Vinculando..." : "Vincular este"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.08em", color: AMBER, fontWeight: 700, marginBottom: 6 }}>
            USAR MEU PRÓPRIO VÍDEO
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://link-do-seu-video.mp4"
              style={{
                flex: 1,
                minHeight: 44,
                padding: "0 12px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                color: TEXT,
                fontSize: 14,
              }}
            />
            <button
              type="button"
              onClick={salvarCustom}
              disabled={saving === "custom"}
              style={{ minHeight: 44, padding: "0 12px", borderRadius: 8, border: `1px solid ${AMBER}66`, background: "transparent", color: AMBER, fontWeight: 700, cursor: "pointer" }}
            >
              <Link2 style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <div style={{ fontSize: 11, color: DIM, marginTop: 6 }}>
            O seu vídeo tem prioridade sobre a demonstração da biblioteca.
          </div>
        </div>

        {current && (
          <button
            type="button"
            onClick={desvincular}
            style={{ marginTop: 14, minHeight: 44, width: "100%", borderRadius: 8, border: `1px solid ${BORDER}`, background: "transparent", color: DIM, fontSize: 13, cursor: "pointer" }}
          >
            Remover vínculo deste exercício
          </button>
        )}
      </div>
    </div>
  );
}
