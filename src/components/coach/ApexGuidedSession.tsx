// APEX Guided Session — Fase 1 (Modo Rápido: 4 fotos estáticas)
// IA conduz: instruções por step → foto → análise em tempo real → laudo consolidado
import { useCallback, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Save,
  AlertTriangle,
  Sparkles,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApexFramingGuide } from "@/components/coach/ApexFramingGuide";
import { cropToAthlete } from "@/lib/apexImageCrop";
import {
  validateLandmarks,
  landmarksArrayToMap,
  type LandmarkValidation,
} from "@/lib/apexLandmarkValidator";

export type GuidedPhase = "static" | "flexibility" | "strength" | "dynamic";

export interface GuidedStep {
  id: string;
  phase: GuidedPhase;
  title: string;
  instruction: string;
  targetMuscles: string[];
  aiPrompt: string;
  guideSvg: (color: string) => JSX.Element;
}

export interface StepMeasurement {
  label: string;
  value: number;
  unit: string;
  normal_range?: string;
  classification: "normal" | "mild" | "moderate" | "severe";
  muscle?: string;
  status?: "shortened" | "inhibited" | "normal";
}

export interface StepAnalysis {
  stepId: string;
  measurements: StepMeasurement[];
  findings_text: string;
  overlay: {
    landmarks: { id: string; x: number; y: number }[];
    lines: { from: string; to: string; color: string; label?: string }[];
    angles: { value: number; x: number; y: number; label: string }[];
  };
  muscle_updates: {
    muscle: string;
    side: "L" | "R" | "C";
    status: "shortened" | "inhibited" | "normal";
    severity: "normal" | "mild" | "moderate" | "severe";
  }[];
  red_flags: string[];
  framing_check?: {
    enquadramento_adequado: boolean;
    percentual_estimado?: number;
    aviso?: string;
  };
}

interface StepPhoto {
  stepId: string;
  dataUrl: string;
  status: "pending" | "analyzing" | "done" | "error" | "framing_warning";
  analysis: StepAnalysis | null;
  error?: string;
  pendingFile?: File;
  landmarkValidation?: LandmarkValidation;
}

// ───────── SVG guides simples por step ─────────
const Stick = ({ stroke }: { stroke: string }) => (
  <g stroke={stroke} strokeWidth={3} fill="none" strokeLinecap="round">
    <circle cx="50" cy="14" r="6" />
    <line x1="50" y1="20" x2="50" y2="55" />
    <line x1="50" y1="28" x2="32" y2="44" />
    <line x1="50" y1="28" x2="68" y2="44" />
    <line x1="50" y1="55" x2="38" y2="86" />
    <line x1="50" y1="55" x2="62" y2="86" />
  </g>
);

const StickSide = ({ stroke }: { stroke: string }) => (
  <g stroke={stroke} strokeWidth={3} fill="none" strokeLinecap="round">
    <circle cx="46" cy="14" r="6" />
    <line x1="50" y1="20" x2="52" y2="55" />
    <line x1="50" y1="28" x2="42" y2="46" />
    <line x1="52" y1="55" x2="48" y2="86" />
  </g>
);

const QUICK_STEPS: GuidedStep[] = [
  {
    id: "static_anterior",
    phase: "static",
    title: "Vista anterior",
    instruction:
      "Atleta em pé, pés na largura do quadril, braços ao longo do corpo, olhar para frente. Câmera a 1,5m, altura do umbigo.",
    targetMuscles: ["Cintura escapular", "Pelve", "Joelhos", "Pés"],
    aiPrompt:
      "Analise esta vista anterior. Identifique e marque landmarks principais (ombros, EIAS, joelhos, tornozelos, maléolos, calcâneos). Calcule ângulos de inclinação de: ombros, quadril, joelhos, tornozelos. Detecte: valgo/varo de joelho, pronação/supinação de pé, obliquidade de ombros e quadril, posição da cabeça. Retorne measurements com valor em graus, severity e muscle_updates preliminar.",
    guideSvg: (c) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <Stick stroke={c} />
        <text x="50" y="98" textAnchor="middle" fontSize="6" fill={c} opacity={0.7}>
          FRENTE
        </text>
      </svg>
    ),
  },
  {
    id: "static_lateral_r",
    phase: "static",
    title: "Vista lateral direita",
    instruction:
      "Atleta de perfil direito, mesma posição. Braços ao lado, olhar adiante. Câmera na altura do umbigo.",
    targetMuscles: ["Coluna cervical", "Cifose", "Lordose", "Pelve"],
    aiPrompt:
      "Analise esta vista lateral direita. Identifique: lordose lombar (normal 20-45°), cifose torácica (normal 20-45°), anteriorização da cabeça (distância tragus-acrômio, normal <2.5cm), anteversão/retroversão pélvica (ângulo EIAS-EIPS, normal 0-10°), posição dos joelhos (recurvatum >5°), tornozelo. Retorne measurements com valores em graus e cm.",
    guideSvg: (c) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <StickSide stroke={c} />
        <text x="50" y="98" textAnchor="middle" fontSize="6" fill={c} opacity={0.7}>
          LATERAL D
        </text>
      </svg>
    ),
  },
  {
    id: "static_lateral_l",
    phase: "static",
    title: "Vista lateral esquerda",
    instruction: "Atleta de perfil esquerdo, mesma posição estática.",
    targetMuscles: ["Coluna cervical", "Cifose", "Lordose", "Pelve"],
    aiPrompt:
      "Mesma análise da vista lateral direita para o lado esquerdo. Compare medições bilaterais e identifique assimetrias entre os dois perfis.",
    guideSvg: (c) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <g transform="translate(100 0) scale(-1 1)">
          <StickSide stroke={c} />
        </g>
        <text x="50" y="98" textAnchor="middle" fontSize="6" fill={c} opacity={0.7}>
          LATERAL E
        </text>
      </svg>
    ),
  },
  {
    id: "static_posterior",
    phase: "static",
    title: "Vista posterior",
    instruction: "Atleta de costas, mesma posição. Calcanhares alinhados.",
    targetMuscles: ["Escápulas", "Coluna", "Glúteos", "Calcâneos"],
    aiPrompt:
      "Analise esta vista posterior. Identifique: simetria escapular (altura, abdução, rotação), curvatura lateral da coluna (escoliose funcional/estrutural, ângulo de Cobb estimado), obliquidade de ombros e quadril, simetria glútea, eixo do tornozelo (varo/valgo de calcâneo). Retorne todos os measurements com classificação.",
    guideSvg: (c) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <Stick stroke={c} />
        <text x="50" y="98" textAnchor="middle" fontSize="6" fill={c} opacity={0.7}>
          COSTAS
        </text>
      </svg>
    ),
  },
];

const SEV_COLOR: Record<string, string> = {
  normal: "#1D9E75",
  mild: "#EF9F27",
  moderate: "#E24B4A",
  severe: "#A32D2D",
};

interface Props {
  athleteId?: string | null;
  athleteName?: string | null;
  athleteData?: {
    height?: number;
    weight?: number;
    sex?: "M" | "F";
    age?: number;
    sport?: string;
  };
  accentColor?: string;
  onClose?: () => void;
  onCompleted?: (sessionId: string) => void;
}

export default function ApexGuidedSession({
  athleteId,
  athleteName,
  athleteData,
  accentColor = "#E8A020",
  onClose,
  onCompleted,
}: Props) {
  const { toast } = useToast();
  const [stepIdx, setStepIdx] = useState(0);
  const [photos, setPhotos] = useState<StepPhoto[]>(
    QUICK_STEPS.map((s) => ({ stepId: s.id, dataUrl: "", status: "pending", analysis: null })),
  );
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const startedAt = useRef<number>(Date.now());
  const fileRef = useRef<HTMLInputElement | null>(null);

  const totalSteps = QUICK_STEPS.length;
  const current = QUICK_STEPS[stepIdx];
  const currentPhoto = photos[stepIdx];
  const progress = Math.round(((stepIdx + (currentPhoto?.status === "done" ? 1 : 0)) / totalSteps) * 100);
  const allDone = photos.every((p) => p.status === "done");

  // ─── análise propriamente dita (após crop + checagem opcional de framing) ───
  const runAnalysis = useCallback(
    async (dataUrl: string, opts?: { forceLowFraming?: boolean }) => {
      setPhotos((prev) => {
        const next = [...prev];
        next[stepIdx] = { ...next[stepIdx], dataUrl, status: "analyzing", analysis: null, error: undefined };
        return next;
      });

      try {
        // Crop inteligente — silencioso se falhar
        const { cropped } = await cropToAthlete(dataUrl);
        const finalImg = cropped || dataUrl;

        const extraInstruction = opts?.forceLowFraming
          ? "ATENÇÃO: O atleta ocupa menos de 60% do frame. Use referências anatômicas relativas para posicionar os landmarks com máxima precisão possível. Priorize landmarks visíveis claramente e estime os demais por proporção anatômica padrão."
          : "";

        const { data, error } = await supabase.functions.invoke("apex-analyze-step", {
          body: {
            stepId: current.id,
            imageBase64: finalImg,
            athleteData,
            instruction: current.instruction,
            aiPrompt: `${current.aiPrompt}\n\n${extraInstruction}`.trim(),
          },
        });
        if (error) throw error;
        if ((data as any)?.error) throw new Error((data as any).error);

        const analysis = data as StepAnalysis;
        const framing = analysis.framing_check;

        // Se IA detectou enquadramento ruim e usuário ainda não forçou, pausa para confirmar
        if (framing && framing.enquadramento_adequado === false && !opts?.forceLowFraming) {
          setPhotos((prev) => {
            const next = [...prev];
            next[stepIdx] = {
              ...next[stepIdx],
              status: "framing_warning",
              analysis,
              dataUrl: finalImg,
            };
            return next;
          });
          return;
        }

        // Valida landmarks
        const validation = validateLandmarks(landmarksArrayToMap(analysis.overlay?.landmarks));

        setPhotos((prev) => {
          const next = [...prev];
          next[stepIdx] = {
            ...next[stepIdx],
            status: "done",
            analysis,
            dataUrl: finalImg,
            landmarkValidation: validation,
          };
          return next;
        });
      } catch (e: any) {
        setPhotos((prev) => {
          const next = [...prev];
          next[stepIdx] = {
            ...next[stepIdx],
            status: "error",
            error: e?.message || "Falha ao analisar",
          };
          return next;
        });
        toast({
          title: "Erro na análise",
          description: e?.message || "Tente reenviar a foto.",
          variant: "destructive",
        });
      }
    },
    [stepIdx, current, athleteData, toast],
  );

  // ─── upload + analise ───
  const handleFile = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = String(reader.result || "");
        if (!dataUrl) return;
        await runAnalysis(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [runAnalysis],
  );

  const continueDespiteFraming = useCallback(async () => {
    const photo = photos[stepIdx];
    if (!photo?.dataUrl) return;
    await runAnalysis(photo.dataUrl, { forceLowFraming: true });
  }, [photos, stepIdx, runAnalysis]);

  const retakePhoto = useCallback(() => {
    setPhotos((prev) => {
      const next = [...prev];
      next[stepIdx] = { ...next[stepIdx], status: "pending", analysis: null, error: undefined, dataUrl: "" };
      return next;
    });
  }, [stepIdx]);

  // ─── consolidação final ───
  const consolidated = useMemo(() => {
    const allMeasurements = photos.flatMap((p) => p.analysis?.measurements || []);
    const allMuscles = photos.flatMap((p) => p.analysis?.muscle_updates || []);
    const redFlags = photos.flatMap((p) => p.analysis?.red_flags || []);
    const sev = { normal: 0, mild: 0, moderate: 0, severe: 0 };
    allMeasurements.forEach((m) => (sev[m.classification] = (sev[m.classification] || 0) + 1));
    const total = allMeasurements.length || 1;
    const fcs = Math.max(
      0,
      Math.round(100 - ((sev.mild * 5 + sev.moderate * 12 + sev.severe * 22) / total) * 5),
    );
    return { allMeasurements, allMuscles, redFlags, sev, fcs };
  }, [photos]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: userResp } = await supabase.auth.getUser();
      const coachId = userResp?.user?.id;
      if (!coachId) throw new Error("Sessão expirada. Faça login novamente.");

      const duration = Math.round((Date.now() - startedAt.current) / 60000);
      const stepsData = photos.map((p) => ({
        stepId: p.stepId,
        status: p.status,
        analysis: p.analysis,
      }));
      const fullReport = {
        measurements: consolidated.allMeasurements,
        muscles: consolidated.allMuscles,
        redFlags: consolidated.redFlags,
        severity_counts: consolidated.sev,
      };

      const { data, error } = await supabase
        .from("apex_guided_sessions")
        .insert({
          athlete_id: athleteId || undefined,
          coach_id: coachId,
          session_type: "quick",
          steps_data: stepsData as any,
          full_report: fullReport as any,
          fcs_score: consolidated.fcs,
          duration_minutes: duration,
          completed_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) throw error;
      setSavedId(data.id);
      toast({ title: "Sessão salva ✓", description: "Avaliação guiada arquivada com sucesso." });
      onCompleted?.(data.id);
    } catch (e: any) {
      toast({
        title: "Erro ao salvar",
        description: e?.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (stepIdx < totalSteps - 1) setStepIdx((i) => i + 1);
  };
  const handlePrev = () => {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  };
  const handleRetake = () => {
    setPhotos((prev) => {
      const next = [...prev];
      next[stepIdx] = { ...next[stepIdx], dataUrl: "", status: "pending", analysis: null, error: undefined };
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{
          background: `linear-gradient(135deg, ${accentColor}22, transparent)`,
          border: `1px solid ${accentColor}55`,
        }}
      >
        <Sparkles className="w-6 h-6" style={{ color: accentColor }} />
        <div className="flex-1">
          <div className="text-sm font-black text-foreground flex items-center gap-2">
            APEX Guided Session
            <span
              className="text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-widest"
              style={{ background: accentColor, color: "#1A1100" }}
            >
              MODO RÁPIDO
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {athleteName || "Atleta"} · Avaliação postural guiada pela IA
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs px-2 py-1.5 rounded-lg border hover:bg-muted flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Sair
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-bold uppercase tracking-widest">
            Fase Estática · Step {stepIdx + 1} de {totalSteps}
          </span>
          <span className="font-bold" style={{ color: accentColor }}>
            {progress}%
          </span>
        </div>
        <div className="flex gap-1">
          {QUICK_STEPS.map((_, i) => {
            const p = photos[i];
            const color =
              p.status === "done"
                ? "#1D9E75"
                : p.status === "analyzing"
                ? accentColor
                : i === stepIdx
                ? accentColor
                : "hsl(var(--border))";
            return (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-all"
                style={{ background: color, opacity: i === stepIdx || p.status === "done" ? 1 : 0.5 }}
              />
            );
          })}
        </div>
      </div>

      {/* === Final report === */}
      {allDone ? (
        <FinalReport
          consolidated={consolidated}
          photos={photos}
          accentColor={accentColor}
          onSave={handleSave}
          saving={saving}
          savedId={savedId}
          onRestart={() => {
            setPhotos(
              QUICK_STEPS.map((s) => ({
                stepId: s.id,
                dataUrl: "",
                status: "pending",
                analysis: null,
              })),
            );
            setStepIdx(0);
            setSavedId(null);
            startedAt.current = Date.now();
          }}
        />
      ) : (
        <>
          {/* Step current */}
          <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
            <div className="flex items-start gap-4">
              <div
                className="w-24 h-32 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={{ background: `${accentColor}11`, border: `1px solid ${accentColor}33` }}
              >
                {current.guideSvg(accentColor)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-foreground">{current.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {current.instruction}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {current.targetMuscles.map((m) => (
                    <span
                      key={m}
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide"
                      style={{ background: `${accentColor}22`, color: accentColor }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Foto + análise */}
            {currentPhoto.status === "pending" && (
              <div className="flex flex-col gap-3">
                <ApexFramingGuide />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-lg border-2 border-dashed py-6 flex flex-col items-center gap-2 hover:bg-muted/40 transition-colors"
                  style={{ borderColor: `${accentColor}66` }}
                >
                  <Camera className="w-6 h-6" style={{ color: accentColor }} />
                  <span className="text-xs font-bold" style={{ color: accentColor }}>
                    Fotografar / Carregar foto
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    JPEG ou PNG · análise em ~5s
                  </span>
                </button>
              </div>
            )}

            {currentPhoto.status === "analyzing" && (
              <div className="rounded-lg bg-muted/40 p-4 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: accentColor }} />
                <span className="text-xs font-bold">APEX analisando a foto…</span>
              </div>
            )}

            {currentPhoto.status === "framing_warning" && (
              <div
                className="rounded-lg p-3 text-xs"
                style={{ background: "rgba(239,159,39,0.08)", border: "1px solid rgba(239,159,39,0.45)" }}
              >
                <div className="flex items-center gap-2 font-bold mb-1" style={{ color: "#EF9F27" }}>
                  <AlertTriangle className="w-4 h-4" /> ⚠ ENQUADRAMENTO PODE REDUZIR A PRECISÃO DOS LANDMARKS
                </div>
                <div className="text-muted-foreground mb-3">
                  {currentPhoto.analysis?.framing_check?.aviso ||
                    `Atleta ocupa apenas ${
                      currentPhoto.analysis?.framing_check?.percentual_estimado ?? "?"
                    }% da imagem. Para maior precisão, refaça a foto com o atleta mais próximo da câmera.`}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRetake}
                    className="text-[11px] px-3 py-1.5 rounded border font-bold hover:bg-muted"
                  >
                    Refazer foto
                  </button>
                  <button
                    onClick={continueDespiteFraming}
                    className="text-[11px] px-3 py-1.5 rounded font-bold"
                    style={{ background: "#EF9F27", color: "#1A1100" }}
                  >
                    Continuar assim
                  </button>
                </div>
              </div>
            )}

            {currentPhoto.status === "error" && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-destructive mb-1">
                  <AlertTriangle className="w-4 h-4" /> Erro na análise
                </div>
                <div className="text-muted-foreground mb-2">
                  {currentPhoto.error || "Falha desconhecida."}
                </div>
                <button
                  onClick={handleRetake}
                  className="text-[11px] px-2 py-1 rounded border font-bold hover:bg-muted"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {currentPhoto.status === "done" && currentPhoto.analysis && (
              <>
                {currentPhoto.landmarkValidation && (
                  <LandmarkBadge
                    validation={currentPhoto.landmarkValidation}
                    onReanalyze={() => runAnalysis(currentPhoto.dataUrl, { forceLowFraming: false })}
                  />
                )}
                <PhotoOverlay
                  photoUrl={currentPhoto.dataUrl}
                  analysis={currentPhoto.analysis}
                  accentColor={accentColor}
                  onRetake={handleRetake}
                />
              </>
            )}
          </div>

          {/* Nav */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handlePrev}
              disabled={stepIdx === 0}
              className="text-xs px-3 py-2 rounded-lg border flex items-center gap-1 disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={currentPhoto.status !== "done"}
              className="text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 disabled:opacity-40 transition-all"
              style={{
                background: currentPhoto.status === "done" ? accentColor : "hsl(var(--muted))",
                color: currentPhoto.status === "done" ? "#1A1100" : "hsl(var(--muted-foreground))",
              }}
            >
              {stepIdx === totalSteps - 1 ? "Ver laudo final" : "Próximo step"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// Overlay sobre a foto (landmarks + ângulos)
// ────────────────────────────────────────────────
function PhotoOverlay({
  photoUrl,
  analysis,
  accentColor,
  onRetake,
}: {
  photoUrl: string;
  analysis: StepAnalysis;
  accentColor: string;
  onRetake: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <img src={photoUrl} alt="Foto postural" className="w-full max-h-[420px] object-contain" />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {analysis.overlay?.lines?.map((ln, i) => {
            const a = analysis.overlay.landmarks?.find((p) => p.id === ln.from);
            const b = analysis.overlay.landmarks?.find((p) => p.id === ln.to);
            if (!a || !b) return null;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={ln.color || accentColor}
                strokeWidth={0.4}
                opacity={0.9}
              />
            );
          })}
          {analysis.overlay?.landmarks?.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={0.9} fill={accentColor} stroke="#000" strokeWidth={0.2} />
          ))}
          {analysis.overlay?.angles?.map((a, i) => (
            <g key={i}>
              <rect
                x={a.x - 5}
                y={a.y - 2}
                width={10}
                height={3}
                rx={0.5}
                fill="rgba(0,0,0,0.6)"
              />
              <text
                x={a.x}
                y={a.y + 0.4}
                textAnchor="middle"
                fontSize={1.8}
                fill="#fff"
                fontWeight={700}
              >
                {a.value}°
              </text>
            </g>
          ))}
        </svg>
      </div>

      {analysis.findings_text && (
        <div className="text-[11px] font-semibold text-foreground bg-muted/30 rounded-lg p-2.5">
          {analysis.findings_text}
        </div>
      )}

      {analysis.measurements?.length > 0 && (
        <div className="space-y-1">
          {analysis.measurements.map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-[11px] rounded-lg border border-border bg-card/30 px-2.5 py-1.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: SEV_COLOR[m.classification] || SEV_COLOR.normal }}
                />
                <span className="font-bold truncate">{m.label}</span>
                {m.muscle && (
                  <span className="text-muted-foreground text-[10px] truncate">· {m.muscle}</span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono font-bold">
                  {m.value}
                  {m.unit}
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide"
                  style={{
                    background: `${SEV_COLOR[m.classification]}22`,
                    color: SEV_COLOR[m.classification],
                  }}
                >
                  {m.classification}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {analysis.red_flags?.length > 0 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-[11px]">
          <div className="flex items-center gap-1.5 font-bold text-destructive mb-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Red flags
          </div>
          <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
            {analysis.red_flags.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onRetake}
        className="text-[11px] px-2 py-1 rounded border font-bold hover:bg-muted flex items-center gap-1"
      >
        <RotateCcw className="w-3 h-3" /> Refazer foto
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────
// Laudo final consolidado (Modo Rápido)
// ────────────────────────────────────────────────
function FinalReport({
  consolidated,
  photos,
  accentColor,
  onSave,
  saving,
  savedId,
  onRestart,
}: {
  consolidated: ReturnType<typeof useConsolidatedFake>;
  photos: StepPhoto[];
  accentColor: string;
  onSave: () => void;
  saving: boolean;
  savedId: string | null;
  onRestart: () => void;
}) {
  const fcsTier =
    consolidated.fcs >= 81
      ? { label: "ÓTIMO", color: "#0F8A63" }
      : consolidated.fcs >= 66
      ? { label: "ADEQUADO", color: "#1D9E75" }
      : consolidated.fcs >= 41
      ? { label: "ATENÇÃO", color: "#EF9F27" }
      : { label: "CRÍTICO", color: "#E24B4A" };

  return (
    <div className="space-y-4">
      {/* Gauge FCS */}
      <div
        className="rounded-xl p-5 flex items-center gap-5"
        style={{
          background: `linear-gradient(135deg, ${fcsTier.color}22, transparent)`,
          border: `1px solid ${fcsTier.color}55`,
        }}
      >
        <div
          className="w-24 h-24 rounded-full flex flex-col items-center justify-center flex-shrink-0"
          style={{ background: fcsTier.color, color: "#fff" }}
        >
          <span className="text-3xl font-black leading-none">{consolidated.fcs}</span>
          <span className="text-[9px] font-bold tracking-widest mt-0.5">FCS</span>
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Fenner Clinical Score
          </div>
          <div className="text-lg font-black" style={{ color: fcsTier.color }}>
            {fcsTier.label}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {consolidated.allMeasurements.length} medições · {consolidated.sev.severe} severas ·{" "}
            {consolidated.sev.moderate} moderadas · {consolidated.sev.mild} leves
          </div>
        </div>
      </div>

      {/* Lista de achados por step */}
      <div className="space-y-2">
        {photos.map((p, i) => {
          const step = QUICK_STEPS[i];
          return (
            <details
              key={p.stepId}
              className="rounded-lg border border-border bg-card/30 overflow-hidden"
              open={i === 0}
            >
              <summary className="px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-muted/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold">{step.title}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {p.analysis?.measurements?.length || 0} achados
                </span>
              </summary>
              <div className="p-3 border-t border-border/50 space-y-2">
                {p.analysis?.findings_text && (
                  <div className="text-[11px] text-foreground">{p.analysis.findings_text}</div>
                )}
                {p.analysis?.measurements?.map((m, j) => (
                  <div key={j} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: SEV_COLOR[m.classification] }}
                      />
                      {m.label}
                    </span>
                    <span className="font-mono font-bold">
                      {m.value}
                      {m.unit}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>

      {consolidated.redFlags.length > 0 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-destructive mb-1.5">
            <AlertTriangle className="w-4 h-4" /> Red flags consolidados
          </div>
          <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
            {consolidated.redFlags.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!savedId ? (
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 min-w-[160px] px-4 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: accentColor, color: "#1A1100" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Salvando…" : "Salvar sessão"}
          </button>
        ) : (
          <div className="flex-1 min-w-[160px] px-4 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 bg-emerald-500/15 text-emerald-500 border border-emerald-500/40">
            <CheckCircle2 className="w-4 h-4" />
            Sessão salva ✓
          </div>
        )}
        <button
          onClick={onRestart}
          className="px-4 py-2.5 rounded-lg border font-bold text-xs flex items-center gap-2 hover:bg-muted"
        >
          <RotateCcw className="w-4 h-4" />
          Nova sessão
        </button>
      </div>
    </div>
  );
}

// Helper de tipagem para FinalReport.consolidated
function useConsolidatedFake() {
  return {
    allMeasurements: [] as StepMeasurement[],
    allMuscles: [] as StepAnalysis["muscle_updates"],
    redFlags: [] as string[],
    sev: { normal: 0, mild: 0, moderate: 0, severe: 0 },
    fcs: 0,
  };
}

// ───────── Badge de validação de landmarks ─────────
function LandmarkBadge({
  validation,
  onReanalyze,
}: {
  validation: LandmarkValidation;
  onReanalyze: () => void;
}) {
  if (validation.confianca === "alta") {
    return (
      <div
        className="rounded-md px-3 py-1.5 text-[11px] font-bold inline-flex items-center gap-1.5 self-start"
        style={{ background: "rgba(29,158,117,0.10)", border: "1px solid rgba(29,158,117,0.45)", color: "#1D9E75" }}
      >
        ✓ Landmarks validados
      </div>
    );
  }
  if (validation.confianca === "media") {
    return (
      <div
        className="rounded-md px-3 py-1.5 text-[11px] font-bold inline-flex items-center gap-1.5 self-start"
        style={{ background: "rgba(184,146,42,0.10)", border: "1px solid rgba(184,146,42,0.45)", color: "#B8922A" }}
        title={validation.erros.join(" · ")}
      >
        Precisão média — enquadramento pode melhorar os resultados
      </div>
    );
  }
  return (
    <div
      className="rounded-lg p-3 text-xs"
      style={{ background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.45)" }}
    >
      <div className="flex items-center gap-2 font-bold mb-1" style={{ color: "#E24B4A" }}>
        ⚠ Alguns landmarks podem estar imprecisos
      </div>
      <div className="text-muted-foreground mb-2">
        Recomendamos refazer a foto com melhor enquadramento.
      </div>
      <ul className="text-[10px] text-muted-foreground mb-2 list-disc pl-4">
        {validation.erros.slice(0, 3).map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button
          onClick={onReanalyze}
          className="text-[11px] px-3 py-1.5 rounded border font-bold hover:bg-muted"
        >
          Reanalisar
        </button>
      </div>
    </div>
  );
}
